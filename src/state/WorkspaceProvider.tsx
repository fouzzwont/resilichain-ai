import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  computeMetrics,
  generateWorkspace,
  getExceptionRecords,
  type ExceptionRecord,
  type Parcel,
  type WorkspaceData,
  type WorkspaceMetrics,
} from "@/data/parcels";

const STORAGE_KEY = "parceldesk.workspace.v1";

interface StoredWorkspace extends WorkspaceData {
  version: 1;
}

interface WorkspaceContextValue {
  parcels: Parcel[];
  records: ExceptionRecord[];
  metrics: WorkspaceMetrics;
  seed: number;
  generatedAt: string;
  getParcel: (id: string) => Parcel | undefined;
  markInProgress: (parcelId: string) => void;
  resolveException: (parcelId: string, note: string) => void;
  sendMessage: (parcelId: string) => void;
  resetWorkspace: () => void;
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

function loadStored(): WorkspaceData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredWorkspace;
    if (parsed.version !== 1 || !Array.isArray(parsed.parcels) || parsed.parcels.length === 0) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function persist(data: WorkspaceData) {
  try {
    const stored: StoredWorkspace = { ...data, version: 1 };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
  } catch {
    // Demo workspace can continue in memory if storage is unavailable.
  }
}

function addOpsEvent(parcel: Parcel, description: string): Parcel {
  return {
    ...parcel,
    events: [
      ...parcel.events,
      {
        id: `${parcel.id}-OPS-${parcel.events.length + 1}`,
        at: new Date().toISOString(),
        milestone: "note",
        description,
        location: "Ops desk",
        carrier: "ParcelDesk",
        source: "ops",
      },
    ],
    lastEventAt: new Date().toISOString(),
  };
}

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<WorkspaceData>(() => loadStored() ?? generateWorkspace());

  useEffect(() => {
    persist(data);
  }, [data]);

  const records = useMemo(() => getExceptionRecords(data.parcels), [data.parcels]);
  const metrics = useMemo(() => computeMetrics(data.parcels), [data.parcels]);

  const value = useMemo<WorkspaceContextValue>(() => {
    const updateParcel = (parcelId: string, updater: (parcel: Parcel) => Parcel) => {
      setData((current) => ({
        ...current,
        parcels: current.parcels.map((parcel) => (parcel.id === parcelId ? updater(parcel) : parcel)),
      }));
    };

    return {
      parcels: data.parcels,
      records,
      metrics,
      seed: data.seed,
      generatedAt: data.generatedAt,
      getParcel: (id) => data.parcels.find((parcel) => parcel.id === id),
      markInProgress: (parcelId) => {
        updateParcel(parcelId, (parcel) => {
          if (!parcel.exception || parcel.exception.status === "resolved") return parcel;
          const next = addOpsEvent(parcel, `Exception acknowledged by ops (${parcel.exception.title}).`);
          return {
            ...next,
            exception: {
              ...parcel.exception,
              status: "in_progress",
              assignedTo: "You",
            },
          };
        });
      },
      resolveException: (parcelId, note) => {
        updateParcel(parcelId, (parcel) => {
          if (!parcel.exception) return parcel;
          const resolvedAt = new Date().toISOString();
          const next = addOpsEvent(
            parcel,
            `Exception resolved — ${note || parcel.exception.recommendedAction.label}.`,
          );
          const customs =
            parcel.customs.status === "held" || parcel.customs.status === "duty_due"
              ? {
                  ...parcel.customs,
                  status: "cleared" as const,
                  clearedAt: resolvedAt,
                  missingDocs: [],
                }
              : parcel.customs;
          return {
            ...next,
            status: parcel.status === "returned" ? "returned" : "in_transit",
            riskScore: Math.min(next.riskScore, 22),
            exposureUsd: 0,
            customs,
            exception: {
              ...parcel.exception,
              status: "resolved",
              resolvedAt,
              resolutionNote: note || parcel.exception.recommendedAction.label,
              assignedTo: "You",
            },
          };
        });
      },
      sendMessage: (parcelId) => {
        updateParcel(parcelId, (parcel) => {
          if (!parcel.message || parcel.message.status === "sent") return parcel;
          const sentAt = new Date().toISOString();
          const next = addOpsEvent(
            parcel,
            `Customer update sent via ${parcel.message.channel} (${parcel.message.language.toUpperCase()}).`,
          );
          return {
            ...next,
            message: { ...parcel.message, status: "sent", sentAt },
          };
        });
      },
      resetWorkspace: () => {
        localStorage.removeItem(STORAGE_KEY);
        setData(generateWorkspace());
      },
    };
  }, [data, records, metrics]);

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error("useWorkspace must be used inside WorkspaceProvider");
  }
  return context;
}
