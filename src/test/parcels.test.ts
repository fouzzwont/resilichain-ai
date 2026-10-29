import { describe, expect, it } from "vitest";
import {
  DEMO_SEED,
  EXCEPTION_LABELS,
  computeMetrics,
  formatUsd,
  generateWorkspace,
  getExceptionRecords,
  getRiskLevel,
  promiseLabel,
} from "@/data/parcels";

const NOW = new Date("2026-10-29T15:00:00.000Z");

describe("workspace generator", () => {
  const workspace = generateWorkspace(DEMO_SEED, NOW);

  it("is deterministic for a fixed seed and clock", () => {
    const again = generateWorkspace(DEMO_SEED, NOW);
    expect(again.parcels.map((parcel) => parcel.id)).toEqual(workspace.parcels.map((parcel) => parcel.id));
    expect(again.parcels.map((parcel) => parcel.events.length)).toEqual(
      workspace.parcels.map((parcel) => parcel.events.length),
    );
    expect(again.parcels.map((parcel) => parcel.status)).toEqual(
      workspace.parcels.map((parcel) => parcel.status),
    );
  });

  it("creates the expected workspace shape", () => {
    expect(workspace.parcels).toHaveLength(220);
    expect(new Set(workspace.parcels.map((parcel) => parcel.id)).size).toBe(220);
    expect(workspace.seed).toBe(DEMO_SEED);
    expect(workspace.generatedAt).toBe(NOW.toISOString());
  });

  it("keeps every timeline ordered and in the past", () => {
    for (const parcel of workspace.parcels) {
      expect(parcel.events.length).toBeGreaterThan(0);
      for (let index = 1; index < parcel.events.length; index += 1) {
        expect(new Date(parcel.events[index].at).getTime()).toBeGreaterThanOrEqual(
          new Date(parcel.events[index - 1].at).getTime(),
        );
      }
      expect(new Date(parcel.lastEventAt).getTime()).toBeLessThanOrEqual(NOW.getTime());
      expect(new Date(parcel.shippedAt).getTime()).toBeLessThanOrEqual(NOW.getTime());
    }
  });

  it("gives every exception an action, a message, and positive exposure", () => {
    const records = getExceptionRecords(workspace.parcels);
    expect(records.length).toBeGreaterThan(10);

    for (const { parcel, exception } of records) {
      expect(EXCEPTION_LABELS[exception.type]).toBeTruthy();
      expect(exception.recommendedAction.label.length).toBeGreaterThan(0);
      expect(exception.recommendedAction.confidence).toBeGreaterThan(0);
      expect(exception.recommendedAction.confidence).toBeLessThanOrEqual(1);
      expect(exception.exposureUsd).toBeGreaterThan(0);

      expect(parcel.message).toBeDefined();
      expect(parcel.message?.subject.length).toBeGreaterThan(0);
      expect(parcel.message?.body).toContain(parcel.customer.name.split(" ")[0]);
      expect(["en", "es"]).toContain(parcel.message?.language);
    }
  });

  it("writes Spanish messages in Spanish, not just Spanish subjects", () => {
    const spanish = getExceptionRecords(workspace.parcels)
      .map(({ parcel }) => parcel.message)
      .filter((message): message is NonNullable<typeof message> => message?.language === "es");

    expect(spanish.length).toBeGreaterThan(0);
    for (const message of spanish) {
      expect(message.body.startsWith("Hola ")).toBe(true);
      expect(message.body).not.toContain("Hi ");
    }
  });

  it("only creates customs holds with the fields the UI needs", () => {
    const customsCases = workspace.parcels.filter(
      (parcel) => parcel.customs.status === "held" || parcel.customs.status === "duty_due",
    );

    for (const parcel of customsCases) {
      expect(parcel.customs.heldSince).toBeTruthy();
      expect(parcel.customs.entryNumber).toBeTruthy();
      if (parcel.customs.status === "duty_due") {
        expect(parcel.customs.dutyUsd).toBeGreaterThan(0);
      }
      if (parcel.customs.status === "held") {
        expect(parcel.customs.missingDocs.length).toBeGreaterThan(0);
      }
    }
  });

  it("computes metrics that match the records", () => {
    const metrics = computeMetrics(workspace.parcels, NOW);
    const records = getExceptionRecords(workspace.parcels);
    const resolved = records.filter((record) => record.exception.status === "resolved");

    expect(metrics.totalParcels).toBe(220);
    expect(metrics.openExceptions).toBe(records.length - resolved.length);
    expect(metrics.resolvedExceptions).toBe(resolved.length);
    expect(metrics.exposureAtRiskUsd).toBeGreaterThan(0);
    expect(metrics.onTimeRate).toBeGreaterThanOrEqual(0);
    expect(metrics.onTimeRate).toBeLessThanOrEqual(100);
    expect(metrics.avgResolutionHours).toBeGreaterThanOrEqual(0);
    expect(metrics.wismoTicketsDeflected).toBeGreaterThanOrEqual(0);
  });
});

describe("formatting and risk helpers", () => {
  it("maps risk scores to the expected bands", () => {
    expect(getRiskLevel(10)).toBe("low");
    expect(getRiskLevel(30)).toBe("medium");
    expect(getRiskLevel(60)).toBe("high");
    expect(getRiskLevel(90)).toBe("critical");
  });

  it("formats money and promise labels for the UI", () => {
    expect(formatUsd(128)).toBe("$128");
    expect(promiseLabel("2026-10-29T15:00:00.000Z", NOW)).toBe("Due today");
    expect(promiseLabel("2026-10-30T15:00:00.000Z", NOW)).toBe("Due tomorrow");
    expect(promiseLabel("2026-10-27T15:00:00.000Z", NOW)).toBe("2d overdue");
  });
});
