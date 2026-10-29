import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ChevronLeft, ChevronRight, Package, Search } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { ParcelStatusBadge } from "@/components/StatusBadge";
import { RiskBadge } from "@/components/RiskBadge";
import { useWorkspace } from "@/state/WorkspaceProvider";
import {
  EXCEPTION_LABELS,
  formatDate,
  promiseLabel,
  type ParcelStatus,
} from "@/data/parcels";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 15;

export default function ParcelsPage() {
  const { parcels } = useWorkspace();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [query, setQuery] = useState(params.get("q") ?? "");
  const [status, setStatus] = useState("all");
  const [carrier, setCarrier] = useState("all");
  const [view, setView] = useState("all");
  const [page, setPage] = useState(0);

  useEffect(() => {
    const nextQuery = params.get("q");
    if (nextQuery !== null) {
      setQuery(nextQuery);
      setPage(0);
    }
  }, [params]);

  const carrierOptions = useMemo(
    () => Array.from(new Set(parcels.map((parcel) => parcel.carrierChain[0]))).sort(),
    [parcels],
  );

  const filtered = useMemo(() => {
    const search = query.trim().toLowerCase();
    return parcels
      .filter((parcel) => {
        if (status !== "all" && parcel.status !== status) return false;
        if (carrier !== "all" && parcel.carrierChain[0] !== carrier) return false;
        if (view === "exceptions" && !parcel.exception) return false;
        if (view === "open" && (!parcel.exception || parcel.exception.status === "resolved")) return false;
        if (!search) return true;
        return (
          parcel.id.toLowerCase().includes(search) ||
          parcel.orderId.toLowerCase().includes(search) ||
          parcel.trackingNumber.toLowerCase().includes(search) ||
          parcel.customer.name.toLowerCase().includes(search) ||
          parcel.product.toLowerCase().includes(search) ||
          parcel.destinationCity.toLowerCase().includes(search)
        );
      })
      .sort((a, b) => {
        const priority = (parcel: typeof a) => {
          if (parcel.exception && parcel.exception.status !== "resolved") return 0;
          if (parcel.status === "delivered") return 3;
          return 1;
        };
        const diff = priority(a) - priority(b);
        if (diff !== 0) return diff;
        return new Date(a.promisedBy).getTime() - new Date(b.promisedBy).getTime();
      });
  }, [parcels, query, status, carrier, view]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount - 1);
  const rows = filtered.slice(currentPage * PAGE_SIZE, currentPage * PAGE_SIZE + PAGE_SIZE);

  const resetPage = (setter: (value: string) => void) => (value: string) => {
    setter(value);
    setPage(0);
  };

  return (
    <AppLayout>
      <div className="space-y-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">Parcels</h1>
          <p className="text-sm text-muted-foreground">
            Every parcel in the workspace, with carrier handoffs, promise dates, and exception context
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[230px] flex-1">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(0);
              }}
              placeholder="Search parcel, order, tracking, customer, product..."
              className="h-8 pl-8 text-sm"
            />
          </div>
          <Select value={view} onValueChange={resetPage(setView)}>
            <SelectTrigger className="h-8 w-[138px] text-xs">
              <SelectValue placeholder="View" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All parcels</SelectItem>
              <SelectItem value="open">Open exceptions</SelectItem>
              <SelectItem value="exceptions">With exceptions</SelectItem>
            </SelectContent>
          </Select>
          <Select value={status} onValueChange={resetPage(setStatus)}>
            <SelectTrigger className="h-8 w-[140px] text-xs">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {(["in_transit", "customs", "out_for_delivery", "delivered", "exception", "returned"] as ParcelStatus[]).map(
                (value) => (
                  <SelectItem key={value} value={value}>
                    {(value as string).replace(/_/g, " ")}
                  </SelectItem>
                ),
              )}
            </SelectContent>
          </Select>
          <Select value={carrier} onValueChange={resetPage(setCarrier)}>
            <SelectTrigger className="h-8 w-[150px] text-xs">
              <SelectValue placeholder="Origin carrier" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All carriers</SelectItem>
              {carrierOptions.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-hidden rounded-lg border border-border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1040px] text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  {["Parcel", "Customer", "Route", "Carrier chain", "Status", "Risk", "Promise", "Last scan"].map(
                    (heading) => (
                      <th
                        key={heading}
                        className="px-3 py-2 text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground"
                      >
                        {heading}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {rows.map((parcel) => (
                  <tr
                    key={parcel.id}
                    onClick={() => navigate(`/parcels/${parcel.id}`)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        navigate(`/parcels/${parcel.id}`);
                      }
                    }}
                    tabIndex={0}
                    role="link"
                    className="cursor-pointer border-b border-border/70 transition-colors last:border-0 hover:bg-muted/40 focus:bg-muted/50 focus:outline-none"
                  >
                    <td className="px-3 py-3">
                      <p className="font-mono text-xs font-medium text-primary">{parcel.id}</p>
                      <p className="max-w-[150px] truncate text-[11px] text-muted-foreground">{parcel.product}</p>
                    </td>
                    <td className="px-3 py-3">
                      <p className="text-xs text-card-foreground">{parcel.customer.name}</p>
                      <p className="text-[11px] text-muted-foreground">{parcel.customer.email}</p>
                    </td>
                    <td className="px-3 py-3">
                      <p className="text-xs text-card-foreground">
                        {parcel.destinationCity}, {parcel.destinationState}
                      </p>
                      <p className="text-[11px] text-muted-foreground">{parcel.originHub}</p>
                    </td>
                    <td className="px-3 py-3 text-xs text-card-foreground">
                      {parcel.carrierChain[0]} → {parcel.carrierChain[1]}
                    </td>
                    <td className="px-3 py-3">
                      <ParcelStatusBadge status={parcel.status} />
                    </td>
                    <td className="px-3 py-3">
                      <RiskBadge score={parcel.riskScore} showScore />
                      {parcel.exception && parcel.exception.status !== "resolved" && (
                        <p className="mt-1 text-[10px] text-muted-foreground">
                          {EXCEPTION_LABELS[parcel.exception.type]}
                        </p>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      <p className="text-xs text-card-foreground">{formatDate(parcel.promisedBy)}</p>
                      <p
                        className={cn(
                          "text-[11px]",
                          !parcel.deliveredAt && new Date(parcel.promisedBy).getTime() < Date.now()
                            ? "font-medium text-destructive"
                            : "text-muted-foreground",
                        )}
                      >
                        {parcel.deliveredAt
                          ? new Date(parcel.deliveredAt).getTime() <= new Date(parcel.promisedBy).getTime()
                            ? "On time"
                            : "Delivered late"
                          : promiseLabel(parcel.promisedBy)}
                      </p>
                    </td>
                    <td className="px-3 py-3">
                      <p className="text-xs text-card-foreground">{formatDate(parcel.lastEventAt)}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {parcel.status === "delivered" ? "Delivered" : `${parcel.events.length} events`}
                      </p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {rows.length === 0 && (
            <div className="flex flex-col items-center gap-2 px-6 py-16 text-center">
              <Package className="h-5 w-5 text-muted-foreground" />
              <p className="text-sm font-medium">No parcels match these filters</p>
              <p className="text-xs text-muted-foreground">Try a different search or clear the status filter.</p>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-[11px] text-muted-foreground">
            Showing {filtered.length === 0 ? 0 : currentPage * PAGE_SIZE + 1}–
            {Math.min(filtered.length, (currentPage + 1) * PAGE_SIZE)} of {filtered.length} parcels
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              disabled={currentPage === 0}
              onClick={() => setPage((value) => Math.max(0, value - 1))}
            >
              <ChevronLeft className="mr-1 h-3 w-3" />
              Previous
            </Button>
            <span className="text-xs text-muted-foreground">
              Page {currentPage + 1} of {pageCount}
            </span>
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              disabled={currentPage >= pageCount - 1}
              onClick={() => setPage((value) => Math.min(pageCount - 1, value + 1))}
            >
              Next
              <ChevronRight className="ml-1 h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
