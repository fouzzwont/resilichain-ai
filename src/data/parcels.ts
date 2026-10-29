import {
  addDays,
  addHours,
  differenceInCalendarDays,
  differenceInHours,
  format,
} from "date-fns";

export type Severity = "low" | "medium" | "high" | "critical";

export type ParcelStatus =
  | "in_transit"
  | "customs"
  | "out_for_delivery"
  | "delivered"
  | "exception"
  | "returned";

export type ExceptionType =
  | "customs_hold"
  | "missing_document"
  | "duty_unpaid"
  | "stale_tracking"
  | "address_issue"
  | "failed_delivery"
  | "weather_delay"
  | "returned";

export type ExceptionStatus = "open" | "in_progress" | "resolved";

export type CustomsStatus = "pending" | "held" | "duty_due" | "cleared";

export type Milestone =
  | "order_placed"
  | "label_created"
  | "picked_up"
  | "export_cleared"
  | "origin_hub"
  | "linehaul"
  | "import_scan"
  | "customs_hold"
  | "customs_released"
  | "last_mile"
  | "out_for_delivery"
  | "delivery_attempt"
  | "delivered"
  | "returned"
  | "note";

export type MessageChannel = "email" | "sms" | "whatsapp";
export type MessageStatus = "draft" | "sent";

export interface TrackingEvent {
  id: string;
  at: string;
  milestone: Milestone;
  description: string;
  location: string;
  carrier: string;
  source: "carrier_scan" | "customs" | "merchant" | "ops";
  isException?: boolean;
}

export interface RecommendedAction {
  label: string;
  detail: string;
  confidence: number;
  costUsd: number;
  slaHours: number;
}

export interface ParcelException {
  id: string;
  type: ExceptionType;
  severity: Severity;
  title: string;
  reason: string;
  detectedAt: string;
  status: ExceptionStatus;
  assignedTo?: string;
  resolvedAt?: string;
  resolutionNote?: string;
  exposureUsd: number;
  recommendedAction: RecommendedAction;
}

export interface CustomsCase {
  status: CustomsStatus;
  entryNumber?: string;
  broker: string;
  dutyUsd: number;
  taxUsd: number;
  missingDocs: string[];
  heldSince?: string;
  clearedAt?: string;
}

export interface CustomerMessage {
  id: string;
  channel: MessageChannel;
  language: "en" | "es";
  subject: string;
  body: string;
  status: MessageStatus;
  createdAt: string;
  sentAt?: string;
}

export interface Parcel {
  id: string;
  orderId: string;
  trackingNumber: string;
  merchant: string;
  customer: {
    name: string;
    email: string;
    city: string;
    state: string;
    postalCode: string;
    address: string;
  };
  originHub: string;
  destinationCity: string;
  destinationState: string;
  carrierChain: [string, string];
  service: string;
  product: string;
  category: string;
  declaredValueUsd: number;
  shippingCostUsd: number;
  weightKg: number;
  hsCode: string;
  shippedAt: string;
  promisedBy: string;
  predictedBy: string;
  predictedDelayHours: number;
  status: ParcelStatus;
  lastEventAt: string;
  deliveredAt?: string;
  riskScore: number;
  exposureUsd: number;
  events: TrackingEvent[];
  customs: CustomsCase;
  exception?: ParcelException;
  message?: CustomerMessage;
}

export interface ExceptionRecord {
  parcel: Parcel;
  exception: ParcelException;
}

export interface WorkspaceMetrics {
  totalParcels: number;
  activeParcels: number;
  deliveredParcels: number;
  returnedParcels: number;
  openExceptions: number;
  inProgressExceptions: number;
  resolvedExceptions: number;
  criticalExceptions: number;
  exposureAtRiskUsd: number;
  exposureProtectedUsd: number;
  promiseAtRisk: number;
  customsHeld: number;
  dutyDue: number;
  missingDocs: number;
  deliveredOnTime: number;
  onTimeRate: number;
  avgResolutionHours: number;
  avgCustomsDwellDays: number;
  wismoTicketsDeflected: number;
  supportCostAvoidedUsd: number;
  draftMessages: number;
  sentMessages: number;
}

export interface WorkspaceData {
  seed: number;
  generatedAt: string;
  parcels: Parcel[];
}

export const DEMO_SEED = 20261029;
export const WORKSPACE_NAME = "Aster & Oak";
export const DEMO_CORRIDOR = "Shenzhen → United States";

const DAY = 24 * 60 * 60 * 1000;
const HOUR = 60 * 60 * 1000;

const CARRIERS: Array<{
  first: string;
  second: string;
  service: string;
  minDays: number;
  maxDays: number;
  prefix: string;
}> = [
  { first: "YunExpress", second: "USPS", service: "Economy Tracked", minDays: 9, maxDays: 16, prefix: "YT" },
  { first: "4PX", second: "USPS", service: "Standard Tracked", minDays: 8, maxDays: 14, prefix: "4PX" },
  { first: "Cainiao", second: "USPS", service: "Standard Tracked", minDays: 10, maxDays: 18, prefix: "CN" },
  { first: "DHL eCommerce", second: "USPS", service: "Expedited", minDays: 6, maxDays: 10, prefix: "DHL" },
  { first: "SF Express", second: "UPS", service: "Express", minDays: 4, maxDays: 7, prefix: "SF" },
  { first: "China Post", second: "USPS", service: "Economy", minDays: 12, maxDays: 22, prefix: "CP" },
];

const ORIGIN_HUBS = ["Shenzhen, CN", "Guangzhou, CN", "Yiwu, CN", "Hangzhou, CN"];
const GATEWAYS = ["Los Angeles, CA", "New York, NY", "Chicago, IL", "Miami, FL", "Seattle, WA"];

const DESTINATIONS = [
  { city: "New York", state: "NY", zip: "10014" },
  { city: "Los Angeles", state: "CA", zip: "90026" },
  { city: "Chicago", state: "IL", zip: "60622" },
  { city: "Austin", state: "TX", zip: "78704" },
  { city: "Seattle", state: "WA", zip: "98107" },
  { city: "Denver", state: "CO", zip: "80206" },
  { city: "Portland", state: "OR", zip: "97214" },
  { city: "Miami", state: "FL", zip: "33137" },
  { city: "Boston", state: "MA", zip: "02118" },
  { city: "Nashville", state: "TN", zip: "37206" },
  { city: "San Diego", state: "CA", zip: "92104" },
  { city: "Minneapolis", state: "MN", zip: "55408" },
  { city: "Philadelphia", state: "PA", zip: "19147" },
  { city: "Atlanta", state: "GA", zip: "30307" },
];

const PRODUCTS = [
  { name: "Linen Throw Blanket", category: "Home", hsCode: "6302.60", min: 68, max: 110, minKg: 1.2, maxKg: 1.8 },
  { name: "Ceramic Pour-Over Set", category: "Home", hsCode: "6912.00", min: 42, max: 64, minKg: 0.8, maxKg: 1.2 },
  { name: "Bamboo Desk Organizer", category: "Home", hsCode: "4420.90", min: 32, max: 48, minKg: 0.6, maxKg: 0.9 },
  { name: "Wool Felt Tote", category: "Accessories", hsCode: "4202.92", min: 58, max: 88, minKg: 0.5, maxKg: 0.8 },
  { name: "Stoneware Mug Set", category: "Home", hsCode: "6912.00", min: 38, max: 56, minKg: 1.0, maxKg: 1.5 },
  { name: "Cotton Waffle Robe", category: "Apparel", hsCode: "6207.91", min: 74, max: 98, minKg: 0.7, maxKg: 1.0 },
  { name: "Oak Serving Board", category: "Home", hsCode: "4419.19", min: 44, max: 72, minKg: 1.1, maxKg: 1.6 },
  { name: "Scented Candle Trio", category: "Home", hsCode: "3406.00", min: 36, max: 52, minKg: 0.9, maxKg: 1.3 },
  { name: "Merino Travel Scarf", category: "Accessories", hsCode: "6117.10", min: 48, max: 72, minKg: 0.3, maxKg: 0.5 },
  { name: "Matcha Whisk Set", category: "Home", hsCode: "4421.99", min: 28, max: 44, minKg: 0.4, maxKg: 0.7 },
  { name: "Leather Passport Case", category: "Accessories", hsCode: "4202.31", min: 34, max: 54, minKg: 0.2, maxKg: 0.4 },
  { name: "Rattan Storage Basket", category: "Home", hsCode: "4602.19", min: 52, max: 84, minKg: 0.9, maxKg: 1.4 },
];

const FIRST_NAMES = [
  "Maya", "Daniel", "Priya", "Ethan", "Sofia", "Noah", "Amara", "Liam", "Nora", "Mateo",
  "Chloe", "Aiden", "Isabel", "Lucas", "Zoe", "Owen", "Hana", "Elias", "Ruby", "Caleb",
  "Leila", "Miles", "Elena", "Jonah", "Tessa", "Ravi", "Clara", "Theo", "Imani", "Felix",
];
const LAST_INITIALS = ["R", "K", "M", "S", "T", "B", "L", "P", "D", "H", "N", "W", "C", "G", "J"];
const STREETS = ["Maple", "Cedar", "Juniper", "Alder", "Birch", "Willow", "Chestnut", "Linden", "Aspen", "Hawthorn"];

export const MILESTONE_LABELS: Record<Milestone, string> = {
  order_placed: "Order placed",
  label_created: "Label created",
  picked_up: "Picked up",
  export_cleared: "Export cleared",
  origin_hub: "At origin hub",
  linehaul: "In linehaul",
  import_scan: "Import scan",
  customs_hold: "Customs hold",
  customs_released: "Customs released",
  last_mile: "Last-mile handoff",
  out_for_delivery: "Out for delivery",
  delivery_attempt: "Delivery attempt",
  delivered: "Delivered",
  returned: "Returned to sender",
  note: "Ops note",
};

export const EXCEPTION_LABELS: Record<ExceptionType, string> = {
  customs_hold: "Customs hold",
  missing_document: "Missing document",
  duty_unpaid: "Duties unpaid",
  stale_tracking: "Stale tracking",
  address_issue: "Address issue",
  failed_delivery: "Failed delivery",
  weather_delay: "Weather delay",
  returned: "Returned to sender",
};

export const EXCEPTION_SHORT_LABELS: Record<ExceptionType, string> = {
  customs_hold: "Customs",
  missing_document: "Documents",
  duty_unpaid: "Duty",
  stale_tracking: "Stale scan",
  address_issue: "Address",
  failed_delivery: "Failed",
  weather_delay: "Weather",
  returned: "Returned",
};

export const PARCEL_STATUS_LABELS: Record<ParcelStatus, string> = {
  in_transit: "In transit",
  customs: "In customs",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  exception: "Exception",
  returned: "Returned",
};

export const SEVERITY_ORDER: Record<Severity, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

function mulberry32(seed: number) {
  let a = seed;
  return function random() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Rng = () => number;

function pick<T>(rng: Rng, items: readonly T[]): T {
  return items[Math.floor(rng() * items.length)];
}

function int(rng: Rng, min: number, max: number): number {
  return Math.floor(rng() * (max - min + 1)) + min;
}

function chance(rng: Rng, probability: number): boolean {
  return rng() < probability;
}

function round(value: number, digits = 2): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function iso(date: Date): string {
  return date.toISOString();
}

function atHour(date: Date, hour: number): Date {
  const next = new Date(date);
  next.setHours(hour, 0, 0, 0);
  return next;
}

function severityFromScore(score: number): Severity {
  if (score >= 75) return "critical";
  if (score >= 50) return "high";
  if (score >= 25) return "medium";
  return "low";
}

function escalate(severity: Severity, steps: number): Severity {
  const order: Severity[] = ["low", "medium", "high", "critical"];
  const index = Math.min(order.length - 1, order.indexOf(severity) + steps);
  return order[index];
}

function buildAction(type: ExceptionType, dutyUsd: number): RecommendedAction {
  switch (type) {
    case "customs_hold":
      return {
        label: "Send importer details to broker",
        detail:
          "Upload the commercial invoice and importer contact details to the customs broker portal, then request a priority release review.",
        confidence: 0.86,
        costUsd: 0,
        slaHours: 4,
      };
    case "missing_document":
      return {
        label: "Attach HS code and re-submit invoice",
        detail:
          "Add the missing HS code to the commercial invoice, re-submit it to the broker, and confirm receipt with the customs desk.",
        confidence: 0.89,
        costUsd: 0,
        slaHours: 2,
      };
    case "duty_unpaid":
      return {
        label: "Pay duties and collect from customer",
        detail:
          "Pay the outstanding duty and tax so the carrier can release the parcel, then send the customer a payment link or absorb the cost based on your margin policy.",
        confidence: 0.91,
        costUsd: dutyUsd,
        slaHours: 2,
      };
    case "stale_tracking":
      return {
        label: "Open a carrier trace",
        detail:
          "File a trace with the origin carrier and the last-mile carrier, request a handoff scan, and set a 24-hour follow-up.",
        confidence: 0.74,
        costUsd: 0,
        slaHours: 24,
      };
    case "address_issue":
      return {
        label: "Confirm unit number with customer",
        detail:
          "Ask the customer for the apartment or unit number, update the label with the carrier, and request redelivery.",
        confidence: 0.83,
        costUsd: 0,
        slaHours: 6,
      };
    case "failed_delivery":
      return {
        label: "Schedule redelivery or pickup point",
        detail:
          "Offer the customer a redelivery window or a nearby pickup point, and update the carrier instruction before the return window closes.",
        confidence: 0.78,
        costUsd: 8,
        slaHours: 12,
      };
    case "weather_delay":
      return {
        label: "Notify customer with revised ETA",
        detail:
          "Send a proactive delay notice with the revised delivery window and monitor the gateway for the next scan.",
        confidence: 0.66,
        costUsd: 0,
        slaHours: 24,
      };
    case "returned":
      return {
        label: "Offer refund or reship from US stock",
        detail:
          "Contact the customer with a refund or reship choice. If reshipping, fulfill from domestic inventory to avoid a second customs cycle.",
        confidence: 0.81,
        costUsd: 0,
        slaHours: 24,
      };
  }
}

function buildMessage(params: {
  parcelId: string;
  orderId: string;
  customerName: string;
  product: string;
  trackingNumber: string;
  type: ExceptionType;
  gateway: string;
  dutyUsd: number;
  spanish: boolean;
  createdAt: Date;
  sent: boolean;
}): CustomerMessage {
  const { parcelId, orderId, customerName, product, trackingNumber, type, gateway, dutyUsd, spanish, createdAt, sent } = params;
  const firstName = customerName.split(" ")[0];
  const trackUrl = `https://track.parceldesk.demo/${trackingNumber}`;

  const english: Record<ExceptionType, { subject: string; body: string }> = {
    customs_hold: {
      subject: `Customs update for order ${orderId}`,
      body: `Hi ${firstName},\n\nYour ${product} (order ${orderId}) is being reviewed by customs at the ${gateway} gateway. We have sent the requested importer details to our broker and will update you as soon as the parcel is released.\n\nTracking: ${trackingNumber}\n${trackUrl}\n\nThanks for your patience,\nAster & Oak Support`,
    },
    missing_document: {
      subject: `We're fixing a document issue on order ${orderId}`,
      body: `Hi ${firstName},\n\nCustoms asked for a corrected commercial invoice for your ${product} (order ${orderId}). Our team has re-submitted it with the required HS code, and we expect the parcel to move within 1–2 business days.\n\nTracking: ${trackingNumber}\n${trackUrl}\n\nWe'll keep an eye on it,\nAster & Oak Support`,
    },
    duty_unpaid: {
      subject: `Duties due for order ${orderId}`,
      body: `Hi ${firstName},\n\nYour ${product} (order ${orderId}) is waiting for a duty and tax payment of $${dutyUsd.toFixed(2)} at the ${gateway} gateway. You can pay it directly, or we can cover it and add the amount to your next invoice.\n\nLet us know which you prefer and we'll release the parcel today.\n\nTracking: ${trackingNumber}\n${trackUrl}\n\nAster & Oak Support`,
    },
    stale_tracking: {
      subject: `Tracking update for order ${orderId}`,
      body: `Hi ${firstName},\n\nWe haven't seen a new carrier scan for your ${product} (order ${orderId}) in a few days. We've opened a trace with the carrier and requested a handoff scan. Most traces resolve within 48 hours.\n\nTracking: ${trackingNumber}\n${trackUrl}\n\nWe'll follow up as soon as we hear back,\nAster & Oak Support`,
    },
    address_issue: {
      subject: `Quick address check for order ${orderId}`,
      body: `Hi ${firstName},\n\nOur carrier tried to deliver your ${product} (order ${orderId}) but the address appears to be missing an apartment or unit number. Could you reply with the unit number so we can get it back on the truck?\n\nTracking: ${trackingNumber}\n${trackUrl}\n\nThanks,\nAster & Oak Support`,
    },
    failed_delivery: {
      subject: `Let's get order ${orderId} delivered`,
      body: `Hi ${firstName},\n\nThe carrier couldn't access your building to deliver the ${product} (order ${orderId}). We can schedule a redelivery or route it to a nearby pickup point — just reply with whichever is easier.\n\nTracking: ${trackingNumber}\n${trackUrl}\n\nAster & Oak Support`,
    },
    weather_delay: {
      subject: `Weather delay on order ${orderId}`,
      body: `Hi ${firstName},\n\nSevere weather near ${gateway} is slowing down your ${product} (order ${orderId}). Your parcel is safe and moving as soon as conditions allow. We've added one to two days to the delivery estimate.\n\nTracking: ${trackingNumber}\n${trackUrl}\n\nThanks for understanding,\nAster & Oak Support`,
    },
    returned: {
      subject: `Your order ${orderId} is on its way back`,
      body: `Hi ${firstName},\n\nYour ${product} (order ${orderId}) is being returned to our warehouse after a failed delivery attempt. We can issue a refund or reship from our US stock — just reply with your preference.\n\nTracking: ${trackingNumber}\n${trackUrl}\n\nAster & Oak Support`,
    },
  };

  const spanishTemplates: Partial<Record<ExceptionType, { subject: string; body: string }>> = {
    customs_hold: {
      subject: `Actualización de aduana para el pedido ${orderId}`,
      body: `Hola ${firstName},\n\nTu ${product} (pedido ${orderId}) está en revisión de aduana en ${gateway}. Ya enviamos la información del importador a nuestro agente y te avisaremos en cuanto se libere.\n\nSeguimiento: ${trackingNumber}\n${trackUrl}\n\nGracias por tu paciencia,\nAster & Oak`,
    },
    duty_unpaid: {
      subject: `Impuestos pendientes para el pedido ${orderId}`,
      body: `Hola ${firstName},\n\nTu ${product} (pedido ${orderId}) está retenido en ${gateway} por un pago de aranceles e impuestos de $${dutyUsd.toFixed(2)}. Puedes pagarlo directamente o lo cubrimos nosotros y lo sumamos a tu próxima factura.\n\nSeguimiento: ${trackingNumber}\n${trackUrl}\n\nAster & Oak`,
    },
    address_issue: {
      subject: `Revisión de dirección para el pedido ${orderId}`,
      body: `Hola ${firstName},\n\nEl transportista intentó entregar tu ${product} (pedido ${orderId}) pero falta el número de apartamento o unidad. ¿Puedes respondernos con ese dato para reprogramar la entrega?\n\nSeguimiento: ${trackingNumber}\n${trackUrl}\n\nGracias,\nAster & Oak`,
    },
    missing_document: {
      subject: `Corrección de documentos para el pedido ${orderId}`,
      body: `Hola ${firstName},\n\nLa aduana pidió una factura comercial corregida para tu ${product} (pedido ${orderId}). Nuestro equipo ya la reenvió con el código HS requerido y esperamos que el paquete avance en 1–2 días hábiles.\n\nSeguimiento: ${trackingNumber}\n${trackUrl}\n\nTe mantendremos informado,\nAster & Oak`,
    },
    stale_tracking: {
      subject: `Actualización de seguimiento para el pedido ${orderId}`,
      body: `Hola ${firstName},\n\nNo hemos visto un nuevo escaneo del transportista para tu ${product} (pedido ${orderId}) en varios días. Abrimos un rastreo y solicitamos una actualización de la entrega. La mayoría de los casos se resuelven en 48 horas.\n\nSeguimiento: ${trackingNumber}\n${trackUrl}\n\nTe avisaremos en cuanto tengamos noticias,\nAster & Oak`,
    },
    failed_delivery: {
      subject: `Intentemos entregar tu pedido ${orderId}`,
      body: `Hola ${firstName},\n\nEl transportista no pudo acceder al edificio para entregar tu ${product} (pedido ${orderId}). Podemos reprogramar la entrega o enviarlo a un punto de recogida cercano — solo respóndenos con la opción que prefieras.\n\nSeguimiento: ${trackingNumber}\n${trackUrl}\n\nAster & Oak`,
    },
    weather_delay: {
      subject: `Retraso por clima en el pedido ${orderId}`,
      body: `Hola ${firstName},\n\nEl mal tiempo cerca de ${gateway} está retrasando tu ${product} (pedido ${orderId}). Tu paquete está seguro y avanzará en cuanto las condiciones lo permitan. Agregamos uno o dos días a la fecha estimada de entrega.\n\nSeguimiento: ${trackingNumber}\n${trackUrl}\n\nGracias por tu comprensión,\nAster & Oak`,
    },
    returned: {
      subject: `Tu pedido ${orderId} está en camino de regreso`,
      body: `Hola ${firstName},\n\nTu ${product} (pedido ${orderId}) está siendo devuelto a nuestro almacén después de un intento de entrega fallido. Podemos emitir un reembolso o reenviarlo desde nuestro stock en EE. UU. — solo respóndenos con tu preferencia.\n\nSeguimiento: ${trackingNumber}\n${trackUrl}\n\nAster & Oak`,
    },
  };

  const template = spanish ? spanishTemplates[type] ?? english[type] : english[type];

  return {
    id: `MSG-${parcelId}`,
    channel: "email",
    language: spanish ? "es" : "en",
    subject: template.subject,
    body: template.body,
    status: sent ? "sent" : "draft",
    createdAt: iso(createdAt),
    sentAt: sent ? iso(addHours(createdAt, 1)) : undefined,
  };
}

export function generateWorkspace(seed: number = DEMO_SEED, now: Date = new Date()): WorkspaceData {
  const rng = mulberry32(seed);
  const parcels: Parcel[] = [];
  const total = 220;

  for (let index = 0; index < total; index += 1) {
    const id = `PD-${10480 + index}`;
    const orderId = `A-${10480 + index}`;
    const carrier = pick(rng, CARRIERS);
    const product = pick(rng, PRODUCTS);
    const destination = pick(rng, DESTINATIONS);
    const originHub = pick(rng, ORIGIN_HUBS);
    const gateway = pick(rng, GATEWAYS);
    const serviceDays = int(rng, carrier.minDays, carrier.maxDays);
    const declaredValueUsd = round(int(rng, product.min, product.max), 0);
    const shippingCostUsd = round(4.5 + declaredValueUsd * 0.06, 2);
    const weightKg = round(product.minKg + rng() * (product.maxKg - product.minKg), 2);
    const customerName = `${pick(rng, FIRST_NAMES)} ${pick(rng, LAST_INITIALS)}.`;
    const street = `${int(rng, 100, 9800)} ${pick(rng, STREETS)} ${pick(rng, ["St", "Ave", "Way", "Ln"])}`;
    const email = `${customerName.split(" ")[0].toLowerCase()}.${customerName.split(" ")[1].replace(".", "").toLowerCase()}@example.com`;
    const trackingNumber = `${carrier.prefix}${100000000 + index * 137 + int(rng, 1, 90)}`;

    const scenarioRoll = rng();
    let scenario: ExceptionType | null = null;
    if (scenarioRoll >= 0.8) {
      if (scenarioRoll < 0.85) scenario = "customs_hold";
      else if (scenarioRoll < 0.88) scenario = "missing_document";
      else if (scenarioRoll < 0.91) scenario = "duty_unpaid";
      else if (scenarioRoll < 0.95) scenario = "stale_tracking";
      else if (scenarioRoll < 0.97) scenario = "address_issue";
      else if (scenarioRoll < 0.985) scenario = "failed_delivery";
      else if (scenarioRoll < 0.995) scenario = "weather_delay";
      else scenario = "returned";
    }

    let daysAgo = int(rng, 1, 30);
    const transitOffset = Math.ceil(serviceDays * 0.55);
    if (scenario === "customs_hold" || scenario === "missing_document" || scenario === "duty_unpaid") {
      daysAgo = transitOffset + int(rng, 3, 12);
    } else if (scenario === "stale_tracking") {
      daysAgo = transitOffset + int(rng, 9, 16);
    } else if (scenario === "address_issue" || scenario === "failed_delivery") {
      daysAgo = transitOffset + int(rng, 3, 7);
    } else if (scenario === "returned") {
      daysAgo = transitOffset + int(rng, 8, 14);
    } else if (scenario === "weather_delay") {
      daysAgo = int(rng, 6, 14);
    }
    const shippedAt = atHour(addDays(now, -daysAgo), int(rng, 9, 18));
    const promisedBy = addDays(shippedAt, serviceDays);
    const orderAt = addHours(shippedAt, -6);

    const importAt = addHours(shippedAt, Math.round(serviceDays * 0.55 * 24));
    const clearedAt = addHours(importAt, int(rng, 8, 36));
    const handedAt = addHours(clearedAt, int(rng, 6, 20));
    const outAt = addHours(handedAt, int(rng, 18, 36));
    const deliveredAt = addHours(outAt, int(rng, 6, 20));

    let eventCounter = 0;
    const events: TrackingEvent[] = [];
    const addEvent = (
      at: Date,
      milestone: Milestone,
      description: string,
      location: string,
      carrierName: string,
      source: TrackingEvent["source"] = "carrier_scan",
      isException = false,
    ) => {
      if (at.getTime() > now.getTime()) return;
      eventCounter += 1;
      events.push({
        id: `${id}-E${eventCounter}`,
        at: iso(at),
        milestone,
        description,
        location,
        carrier: carrierName,
        source,
        isException: isException || undefined,
      });
    };

    addEvent(orderAt, "order_placed", "Order confirmed and payment captured", "Online", WORKSPACE_NAME, "merchant");
    addEvent(shippedAt, "label_created", `Shipping label created at ${originHub}`, originHub, carrier.first, "merchant");
    addEvent(addHours(shippedAt, 3), "picked_up", "Parcel picked up by origin carrier", originHub, carrier.first);
    addEvent(addHours(shippedAt, 20), "export_cleared", "Export clearance completed", originHub, carrier.first);
    addEvent(addHours(shippedAt, 30), "origin_hub", `Processed at ${originHub} sorting center`, originHub, carrier.first);
    addEvent(addDays(shippedAt, 3), "linehaul", "Departed origin country", originHub, carrier.first);
    addEvent(importAt, "import_scan", `Arrived at ${gateway} import gateway`, gateway, carrier.second);

    let customsStatus: CustomsStatus = "pending";
    let dutyUsd = 0;
    let taxUsd = 0;
    let missingDocs: string[] = [];
    let heldSince: string | undefined;
    let clearedAtIso: string | undefined;
    let status: ParcelStatus = "in_transit";
    let exception: ParcelException | undefined;
    let deliveredAtIso: string | undefined;
    let predictedBy = promisedBy;
    let sentMessage = false;

    const customsSequence = (releaseAt: Date) => {
      addEvent(releaseAt, "customs_released", `Released by customs at ${gateway}`, gateway, carrier.second, "customs");
      addEvent(addHours(releaseAt, 10), "last_mile", `Tendered to ${carrier.second} for final delivery`, gateway, carrier.second);
      addEvent(addHours(releaseAt, 30), "out_for_delivery", "Out for delivery", `${destination.city}, ${destination.state}`, carrier.second);
      if (addHours(releaseAt, 42).getTime() <= now.getTime()) {
        addEvent(addHours(releaseAt, 42), "delivered", "Delivered to customer", `${destination.city}, ${destination.state}`, carrier.second);
        status = "delivered";
        deliveredAtIso = iso(addHours(releaseAt, 42));
        clearedAtIso = iso(releaseAt);
        customsStatus = "cleared";
      } else {
        status = "in_transit";
        customsStatus = "cleared";
        clearedAtIso = iso(releaseAt);
      }
    };

    if (scenario && ["customs_hold", "missing_document", "duty_unpaid"].includes(scenario)) {
      const holdAt = addHours(importAt, 6);
      heldSince = iso(holdAt);
      const releaseDelay = int(rng, 36, 96);
      const releaseAt = addHours(importAt, releaseDelay);
      const resolved = chance(rng, 0.34) && releaseAt.getTime() <= now.getTime();
      const inProgress = !resolved && chance(rng, 0.25);

      if (scenario === "duty_unpaid") {
        dutyUsd = int(rng, 18, 64);
        taxUsd = int(rng, 0, 12);
        customsStatus = "duty_due";
        addEvent(
          holdAt,
          "customs_hold",
          `Duties and taxes due ($${dutyUsd}) — payment required before release`,
          gateway,
          carrier.second,
          "customs",
          true,
        );
      } else {
        missingDocs =
          scenario === "missing_document"
            ? ["Commercial invoice with HS code"]
            : rng() > 0.5
              ? ["Importer contact details"]
              : ["Commercial invoice", "Proof of value"];
        customsStatus = "held";
        addEvent(
          holdAt,
          "customs_hold",
          scenario === "missing_document"
            ? "Customs broker requested a corrected commercial invoice"
            : "Held by U.S. Customs — additional importer information required",
          gateway,
          carrier.second,
          "customs",
          true,
        );
      }

      if (resolved) {
        customsSequence(releaseAt);
        sentMessage = true;
      } else {
        status = "customs";
        predictedBy = addDays(promisedBy, int(rng, 2, 5));
      }

      exception = {
        id: `EX-${id}`,
        type: scenario,
        severity: "high",
        title:
          scenario === "duty_unpaid"
            ? "Duties unpaid — delivery blocked"
            : scenario === "missing_document"
              ? "Commercial invoice missing HS code"
              : "Held at customs — importer information required",
        reason:
          scenario === "duty_unpaid"
            ? `Duties and taxes of $${dutyUsd} must be paid before the parcel can be released from ${gateway}.`
            : scenario === "missing_document"
              ? "The customs broker cannot release the parcel without a valid HS code on the commercial invoice."
              : `Shipment is being held at the ${gateway} gateway while customs reviews importer details.`,
        detectedAt: iso(holdAt),
        status: resolved ? "resolved" : inProgress ? "in_progress" : "open",
        assignedTo: resolved || inProgress ? "You" : undefined,
        resolvedAt: resolved ? iso(releaseAt) : undefined,
        resolutionNote: resolved
          ? scenario === "duty_unpaid"
            ? "Duties paid; customs released the parcel."
            : "Documents submitted; customs released the parcel."
          : undefined,
        exposureUsd: round(
          declaredValueUsd + shippingCostUsd + (scenario === "duty_unpaid" ? dutyUsd + taxUsd : 0) + 6,
          0,
        ),
        recommendedAction: buildAction(scenario, dutyUsd + taxUsd),
      };
    } else if (scenario === "stale_tracking") {
      const desiredStaleDays = int(rng, 5, 10);
      const desiredLastScan = addHours(now, -desiredStaleDays * 24 - int(rng, 0, 8));
      const earliestScan = addHours(clearedAt, 6);
      const lastScanAt = desiredLastScan.getTime() > earliestScan.getTime() ? desiredLastScan : earliestScan;
      const staleDays = Math.max(1, differenceInCalendarDays(now, lastScanAt));
      const deliveredAt2 = addHours(now, -int(rng, 6, 30));
      const resolved = chance(rng, 0.3) && deliveredAt2.getTime() > lastScanAt.getTime();
      addEvent(clearedAt, "customs_released", `Released by customs at ${gateway}`, gateway, carrier.second, "customs");
      addEvent(lastScanAt, "last_mile", `Tendered to ${carrier.second} — awaiting first scan`, gateway, carrier.second);
      addEvent(addHours(lastScanAt, 2), "note", `Handoff accepted by ${carrier.second}; no movement scan received`, gateway, carrier.second);
      status = "exception";
      customsStatus = "cleared";
      clearedAtIso = iso(clearedAt);
      predictedBy = addDays(promisedBy, staleDays > 7 ? 4 : 2);

      if (resolved) {
        addEvent(deliveredAt2, "delivered", "Delivered after carrier trace", `${destination.city}, ${destination.state}`, carrier.second);
        status = "delivered";
        deliveredAtIso = iso(deliveredAt2);
        sentMessage = true;
      }

      exception = {
        id: `EX-${id}`,
        type: "stale_tracking",
        severity: staleDays > 8 ? "critical" : "high",
        title: `No scan for ${staleDays} days`,
        reason: `Last scan was at ${gateway} when the parcel was handed to ${carrier.second}. No further events have been received.`,
        detectedAt: iso(addHours(lastScanAt, 72)),
        status: resolved ? "resolved" : chance(rng, 0.3) ? "in_progress" : "open",
        assignedTo: "You",
        resolvedAt: resolved ? iso(deliveredAt2) : undefined,
        resolutionNote: resolved ? "Carrier trace resolved; parcel delivered." : undefined,
        exposureUsd: round(declaredValueUsd + shippingCostUsd + 6, 0),
        recommendedAction: buildAction("stale_tracking", 0),
      };
    } else if (scenario === "address_issue" || scenario === "failed_delivery") {
      const attemptAt = addHours(outAt, int(rng, 2, 8));
      const deliveredAt2 = addHours(attemptAt, int(rng, 18, 40));
      const resolved = chance(rng, 0.28) && deliveredAt2.getTime() <= now.getTime();
      addEvent(clearedAt, "customs_released", `Released by customs at ${gateway}`, gateway, carrier.second, "customs");
      addEvent(handedAt, "last_mile", `Tendered to ${carrier.second} for final delivery`, gateway, carrier.second);
      addEvent(outAt, "out_for_delivery", "Out for delivery", `${destination.city}, ${destination.state}`, carrier.second);
      addEvent(attemptAt, "delivery_attempt", scenario === "address_issue" ? "Delivery attempted — apartment number missing" : "Delivery attempted — no access to building", `${destination.city}, ${destination.state}`, carrier.second, "carrier_scan", true);
      status = "exception";
      customsStatus = "cleared";
      clearedAtIso = iso(clearedAt);
      predictedBy = addDays(promisedBy, int(rng, 1, 3));

      if (resolved) {
        addEvent(addHours(attemptAt, 12), "out_for_delivery", "Redelivery scheduled with corrected address", `${destination.city}, ${destination.state}`, carrier.second);
        addEvent(deliveredAt2, "delivered", "Delivered after redelivery", `${destination.city}, ${destination.state}`, carrier.second);
        status = "delivered";
        deliveredAtIso = iso(deliveredAt2);
        sentMessage = true;
      }

      exception = {
        id: `EX-${id}`,
        type: scenario,
        severity: "high",
        title: scenario === "address_issue" ? "Delivery attempted — apartment number missing" : "Delivery attempted — no access",
        reason:
          scenario === "address_issue"
            ? "The last-mile carrier could not complete delivery because the address is missing unit details."
            : "The carrier could not access the building. Redelivery or a pickup point is required before the return window closes.",
        detectedAt: iso(attemptAt),
        status: resolved ? "resolved" : chance(rng, 0.35) ? "in_progress" : "open",
        assignedTo: chance(rng, 0.4) ? "You" : undefined,
        resolvedAt: resolved ? iso(deliveredAt2) : undefined,
        resolutionNote: resolved ? "Address corrected; redelivery completed." : undefined,
        exposureUsd: round(declaredValueUsd + shippingCostUsd + 10, 0),
        recommendedAction: buildAction(scenario, 0),
      };
    } else if (scenario === "weather_delay") {
      const delayAt = addDays(shippedAt, 4);
      addEvent(delayAt, "note", `Severe weather delaying linehaul at ${gateway}`, gateway, carrier.first, "carrier_scan", true);
      status = "exception";
      predictedBy = addDays(promisedBy, int(rng, 2, 4));
      exception = {
        id: `EX-${id}`,
        type: "weather_delay",
        severity: "low",
        title: "Weather delay at gateway",
        reason: `Severe weather near ${gateway} is delaying linehaul and last-mile handoff. The parcel is safe.`,
        detectedAt: iso(delayAt),
        status: chance(rng, 0.4) ? "in_progress" : "open",
        exposureUsd: round(declaredValueUsd * 0.25, 0),
        recommendedAction: buildAction("weather_delay", 0),
      };
    } else if (scenario === "returned") {
      const attemptAt = addHours(outAt, 4);
      const returnAt = addDays(attemptAt, int(rng, 2, 4));
      addEvent(clearedAt, "customs_released", `Released by customs at ${gateway}`, gateway, carrier.second, "customs");
      addEvent(handedAt, "last_mile", `Tendered to ${carrier.second} for final delivery`, gateway, carrier.second);
      addEvent(outAt, "out_for_delivery", "Out for delivery", `${destination.city}, ${destination.state}`, carrier.second);
      addEvent(attemptAt, "delivery_attempt", "Delivery attempted — recipient unavailable", `${destination.city}, ${destination.state}`, carrier.second, "carrier_scan", true);
      addEvent(returnAt, "returned", "Returned to sender — parcel moving back to warehouse", `${destination.city}, ${destination.state}`, carrier.second, "carrier_scan", true);
      status = "returned";
      customsStatus = "cleared";
      clearedAtIso = iso(clearedAt);
      predictedBy = returnAt;
      exception = {
        id: `EX-${id}`,
        type: "returned",
        severity: "high",
        title: "Returned to sender",
        reason: "Parcel is on its way back after a failed delivery attempt. A refund or domestic reship is required.",
        detectedAt: iso(returnAt),
        status: "open",
        exposureUsd: round(declaredValueUsd + shippingCostUsd + 8, 0),
        recommendedAction: buildAction("returned", 0),
      };
    } else {
      addEvent(clearedAt, "customs_released", `Released by customs at ${gateway}`, gateway, carrier.second, "customs");
      addEvent(handedAt, "last_mile", `Tendered to ${carrier.second} for final delivery`, gateway, carrier.second);
      addEvent(outAt, "out_for_delivery", "Out for delivery", `${destination.city}, ${destination.state}`, carrier.second);
      if (deliveredAt.getTime() <= now.getTime()) {
        addEvent(deliveredAt, "delivered", "Delivered to customer", `${destination.city}, ${destination.state}`, carrier.second);
        status = "delivered";
        deliveredAtIso = iso(deliveredAt);
      } else if (outAt.getTime() <= now.getTime()) {
        status = "out_for_delivery";
      } else {
        status = "in_transit";
      }
      if (clearedAt.getTime() <= now.getTime()) {
        customsStatus = "cleared";
        clearedAtIso = iso(clearedAt);
      } else {
        customsStatus = "pending";
      }
    }

    events.sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());
    const lastEventAt = events.length > 0 ? events[events.length - 1].at : shippedAt.toISOString();

    if (!exception && status !== "delivered" && status !== "returned") {
      const overdue = differenceInCalendarDays(now, promisedBy);
      if (overdue > 0) {
        predictedBy = addDays(promisedBy, Math.min(4, overdue + 1));
      }
    }

    if (exception) {
      if (exception.type === "customs_hold" || exception.type === "missing_document" || exception.type === "duty_unpaid") {
        const daysToPromise = differenceInCalendarDays(promisedBy, now);
        exception.severity = daysToPromise < 0 || declaredValueUsd >= 180 ? "critical" : "high";
      }
      if (exception.severity === "high" && declaredValueUsd >= 220) {
        exception.severity = "critical";
      }
      if (exception.severity === "critical" && exception.status === "resolved") {
        exception.severity = "high";
      }
      if (exception.type === "returned") {
        exception.severity = "high";
      }
      if (exception.type === "weather_delay") {
        exception.severity = "low";
      }
    }

    if (exception && !exception.exposureUsd) {
      exception.exposureUsd = round(declaredValueUsd + shippingCostUsd + 6, 0);
    }

    if (exception && !exception.resolvedAt && exception.status === "resolved") {
      exception.resolvedAt = iso(addHours(now, -int(rng, 4, 72)));
    }

    const customsHeldSince = heldSince;
    const customs: CustomsCase = {
      status: customsStatus,
      entryNumber:
        customsStatus === "pending"
          ? undefined
          : `CBP-${new Date(shippedAt).getFullYear()}-${100000 + index * 7 + int(rng, 10, 90)}`,
      broker: customsStatus === "pending" ? "Not assigned" : "ClearPoint Customs Brokerage",
      dutyUsd,
      taxUsd,
      missingDocs,
      heldSince: customsHeldSince,
      clearedAt: clearedAtIso,
    };

    const message = exception
      ? buildMessage({
          parcelId: id,
          orderId,
          customerName,
          product: product.name,
          trackingNumber,
          type: exception.type,
          gateway,
          dutyUsd: dutyUsd + taxUsd,
          spanish: exception.type !== "returned" && chance(rng, 0.12),
          createdAt: new Date(exception.detectedAt),
          sent: sentMessage || exception.status === "resolved",
        })
      : undefined;

    let riskScore = 14;
    if (status === "delivered") {
      riskScore = int(rng, 3, 12);
    } else if (status === "returned") {
      riskScore = 88;
    } else if (exception) {
      const base: Record<Severity, number> = { low: 28, medium: 46, high: 68, critical: 86 };
      const overdueDays = Math.max(0, differenceInCalendarDays(now, promisedBy));
      const staleDays = Math.max(0, differenceInCalendarDays(now, new Date(lastEventAt)));
      riskScore = base[exception.severity] + Math.min(10, overdueDays * 2) + (staleDays > 4 ? 4 : 0);
      if (exception.status === "resolved") riskScore -= 42;
    } else {
      const overdueDays = Math.max(0, differenceInCalendarDays(now, promisedBy));
      riskScore = 14 + Math.min(30, overdueDays * 5);
    }
    riskScore = clamp(Math.round(riskScore), 3, 99);

    const exposureUsd = exception && exception.status !== "resolved" ? exception.exposureUsd : 0;
    if (deliveredAtIso) {
      predictedBy = new Date(deliveredAtIso);
    }

    parcels.push({
      id,
      orderId,
      trackingNumber,
      merchant: WORKSPACE_NAME,
      customer: {
        name: customerName,
        email,
        city: destination.city,
        state: destination.state,
        postalCode: destination.zip,
        address: `${street}, ${destination.city}, ${destination.state} ${destination.zip}`,
      },
      originHub,
      destinationCity: destination.city,
      destinationState: destination.state,
      carrierChain: [carrier.first, carrier.second],
      service: carrier.service,
      product: product.name,
      category: product.category,
      declaredValueUsd,
      shippingCostUsd,
      weightKg,
      hsCode: product.hsCode,
      shippedAt: iso(shippedAt),
      promisedBy: iso(promisedBy),
      predictedBy: iso(predictedBy),
      predictedDelayHours: Math.max(0, differenceInHours(predictedBy, promisedBy)),
      status,
      lastEventAt,
      deliveredAt: deliveredAtIso,
      riskScore,
      exposureUsd,
      events,
      customs,
      exception,
      message,
    });
  }

  return {
    seed,
    generatedAt: iso(now),
    parcels,
  };
}

export function getRiskLevel(score: number): Severity {
  return severityFromScore(score);
}

export function getRiskBgClass(score: number): string {
  return `risk-${severityFromScore(score)}`;
}

export function getExceptionRecords(parcels: Parcel[]): ExceptionRecord[] {
  return parcels
    .filter((parcel): parcel is Parcel & { exception: ParcelException } => Boolean(parcel.exception))
    .map((parcel) => ({ parcel, exception: parcel.exception }));
}

export function computeMetrics(parcels: Parcel[], now: Date = new Date()): WorkspaceMetrics {
  const records = getExceptionRecords(parcels);
  const open = records.filter((r) => r.exception.status !== "resolved");
  const resolved = records.filter((r) => r.exception.status === "resolved");
  const delivered = parcels.filter((p) => p.status === "delivered");
  const deliveredOnTime = delivered.filter(
    (p) => p.deliveredAt && new Date(p.deliveredAt).getTime() <= new Date(p.promisedBy).getTime(),
  );
  const resolutionHours = resolved
    .filter((r) => r.exception.resolvedAt)
    .map((r) => differenceInHours(new Date(r.exception.resolvedAt as string), new Date(r.exception.detectedAt)));
  const customsCases = parcels.filter(
    (p) => p.customs.heldSince && (p.customs.status === "held" || p.customs.status === "duty_due"),
  );
  const customsDwell = customsCases.map((p) => differenceInCalendarDays(now, new Date(p.customs.heldSince as string)));
  const active = parcels.filter((p) => p.status !== "delivered" && p.status !== "returned");

  return {
    totalParcels: parcels.length,
    activeParcels: active.length,
    deliveredParcels: delivered.length,
    returnedParcels: parcels.filter((p) => p.status === "returned").length,
    openExceptions: open.length,
    inProgressExceptions: open.filter((r) => r.exception.status === "in_progress").length,
    resolvedExceptions: resolved.length,
    criticalExceptions: open.filter((r) => r.exception.severity === "critical").length,
    exposureAtRiskUsd: open.reduce((sum, r) => sum + r.exception.exposureUsd, 0),
    exposureProtectedUsd: resolved.reduce((sum, r) => sum + r.exception.exposureUsd, 0),
    promiseAtRisk: active.filter((p) => p.riskScore >= 60).length,
    customsHeld: parcels.filter((p) => p.customs.status === "held").length,
    dutyDue: parcels.filter((p) => p.customs.status === "duty_due").length,
    missingDocs: parcels.filter((p) => p.customs.missingDocs.length > 0 && p.customs.status !== "cleared").length,
    deliveredOnTime: deliveredOnTime.length,
    onTimeRate: delivered.length > 0 ? round((deliveredOnTime.length / delivered.length) * 100, 1) : 0,
    avgResolutionHours: resolutionHours.length > 0 ? Math.round(resolutionHours.reduce((a, b) => a + b, 0) / resolutionHours.length) : 0,
    avgCustomsDwellDays: customsDwell.length > 0 ? round(customsDwell.reduce((a, b) => a + b, 0) / customsDwell.length, 1) : 0,
    wismoTicketsDeflected: Math.round(resolved.length * 1.7),
    supportCostAvoidedUsd: resolved.length * 18,
    draftMessages: parcels.filter((p) => p.message?.status === "draft").length,
    sentMessages: parcels.filter((p) => p.message?.status === "sent").length,
  };
}

export function formatUsd(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDate(value: string): string {
  return format(new Date(value), "MMM d");
}

export function formatDateTime(value: string): string {
  return format(new Date(value), "MMM d, HH:mm");
}

export function daysFromNow(value: string, now: Date = new Date()): number {
  return differenceInCalendarDays(new Date(value), now);
}

export function hoursSince(value: string, now: Date = new Date()): number {
  return Math.max(0, differenceInHours(now, new Date(value)));
}

export function promiseLabel(value: string, now: Date = new Date()): string {
  const days = differenceInCalendarDays(new Date(value), now);
  if (days === 0) return "Due today";
  if (days === 1) return "Due tomorrow";
  if (days > 1) return `${days}d left`;
  return `${Math.abs(days)}d overdue`;
}

export function riskClass(severity: Severity): string {
  return `risk-${severity}`;
}

export function sortExceptions(records: ExceptionRecord[]): ExceptionRecord[] {
  return [...records].sort((a, b) => {
    const statusRank = (s: string) => (s === "open" ? 0 : s === "in_progress" ? 1 : 2);
    const statusDiff = statusRank(a.exception.status) - statusRank(b.exception.status);
    if (statusDiff !== 0) return statusDiff;
    const severityDiff = SEVERITY_ORDER[a.exception.severity] - SEVERITY_ORDER[b.exception.severity];
    if (severityDiff !== 0) return severityDiff;
    return b.parcel.riskScore - a.parcel.riskScore;
  });
}
