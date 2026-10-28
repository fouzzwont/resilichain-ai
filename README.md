# ResiliChain AI

A supply-chain resilience **control tower** for monitoring global shipments, predicting disruptions, scoring carrier and supplier risk, and rehearsing mitigation plans — all in a single, responsive dashboard.

![React](https://img.shields.io/badge/React-18-149ECA?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?logo=tailwindcss&logoColor=white)
![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-Radix-000000)

> **Demo status:** ResiliChain AI is a frontend prototype. All shipments, alerts, carriers, and supplier data are static fixtures in [`src/data/mockData.ts`](src/data/mockData.ts). Prediction, simulation, and assistant responses are computed in the browser — no backend or external AI service is required.

## Features

| Module | Route | What it does |
| --- | --- | --- |
| **Control Tower** | `/` | Ten live KPIs (active shipments, on-time rate, delays, high-risk count, network health), 7-day risk trend, shipment-status breakdown, top-risk shipments, and active alerts. |
| **Shipment Visibility** | `/shipments` | Search and filter the fleet by transport mode, risk level, and status; open a detail drawer with route, ETA, delay prediction, and recommended action. |
| **Disruption Prediction** | `/prediction` | Risk-score distribution and per-shipment predictions with disruption probability, cause, business impact, confidence, and mitigation guidance. |
| **Disruption Alerts** | `/alerts` | Severity and status filters with acknowledge/resolve actions (session state) plus impact analysis for each alert. |
| **Carrier Intelligence** | `/carriers` | Carrier performance comparison, on-time rates, reliability trends, lanes, and supplier risk profiles with alternate-supplier suggestions. |
| **Scenario Simulator** | `/simulator` | Eight preset disruption scenarios (port closure, canal blockage, carrier breakdown, customs strike, fuel surge, supplier shutdown, typhoon, corridor closure) with impacted shipments, added delay, and a mitigation plan. |
| **Resilience Analytics** | `/analytics` | Weekly on-time performance, carrier comparison, incident mix, regional risk, and one-click CSV export of the shipment dataset. |
| **Compliance & Docs** | `/documents` | Trade-document register (bills of lading, invoices, certificates, customs, hazmat, licenses) with verified / pending / flagged states. |
| **AI Assistant** | `/assistant` | Chat interface with quick prompts that answers questions about delays, carriers, vulnerable routes, customs holds, and network health from the current dataset. |

The shell includes a collapsible sidebar, top-bar search, live-sync clock, alert badge, and a dark/light theme toggle (dark by default).

## Tech stack

- **React 18** + **TypeScript 5**
- **Vite 5** with the SWC React plugin
- **Tailwind CSS 3** and **shadcn/ui** components built on Radix UI primitives
- **Recharts 3** for charts
- **React Router 6** for client-side routing
- **TanStack Query 5** provider (ready for a future data layer)
- **React Hook Form** + **Zod** available for forms and validation
- **Vitest** + **Testing Library** with a jsdom environment

## Getting started

### Prerequisites

- Node.js **18+** (20 LTS or newer recommended)
- npm, or [Bun](https://bun.sh/) if you prefer the committed `bun.lock`

### Install and run

```bash
git clone https://github.com/fouzzwont/resilichain-ai.git
cd resilichain-ai

# with npm
npm install
npm run dev

# or with Bun
bun install
bun run dev
```

Open http://localhost:8080. The dev server binds to `::` on port `8080` (see `vite.config.ts`).

### Build and preview

```bash
npm run build      # production bundle in dist/
npm run preview    # serve the production build locally
```

### Quality checks

```bash
npm test           # run the Vitest suite once
npm run test:watch # watch mode
npm run lint       # ESLint
```

## Available scripts

| Script | Purpose |
| --- | --- |
| `dev` | Start the Vite dev server on port 8080 |
| `build` | Type-check-free production build via Vite |
| `build:dev` | Build in development mode |
| `preview` | Preview the built `dist/` output |
| `test` | Run Vitest once |
| `test:watch` | Run Vitest in watch mode |
| `lint` | Lint the project with ESLint 9 |

## Project structure

```text
.
├── public/                  # Static assets (favicon, robots.txt, placeholder)
├── src/
│   ├── components/
│   │   ├── ui/              # shadcn/ui primitives (Radix-based)
│   │   ├── AppLayout.tsx    # Sidebar + top bar shell
│   │   ├── AppSidebar.tsx   # Navigation
│   │   ├── TopBar.tsx       # Search, clock, theme toggle, alerts
│   │   ├── KpiCard.tsx      # Metric card
│   │   └── RiskBadge.tsx    # Risk-level badge
│   ├── data/mockData.ts     # Typed demo dataset + risk/status helpers
│   ├── hooks/               # Mobile breakpoint and toast hooks
│   ├── lib/utils.ts         # `cn()` class-merge helper
│   ├── pages/               # One page per module/route
│   ├── test/                # Vitest setup and example test
│   ├── App.tsx              # Providers + route table
│   ├── main.tsx             # Application entry point
│   └── index.css            # Tailwind layers and theme tokens
├── index.html
├── tailwind.config.ts
├── vite.config.ts
└── vitest.config.ts
```

## Data model

`src/data/mockData.ts` exports typed fixtures and helpers:

- `Shipment` — cargo, origin/destination, route, mode, carrier, supplier, planned vs. predicted ETA, live location, status, risk score, disruption probability, predicted delay, cause, business impact, recommended action, confidence, region.
- `Alert` — severity, description, affected shipments, cause, impact, status, recommended action.
- `Carrier` / `Supplier` — performance and reliability scores, incidents, lanes, regions, alternates.
- `ScenarioTemplate` — simulator presets with matching parameters.

Risk thresholds are shared through `getRiskLevel()`, `getRiskColor()`, and `getRiskBgClass()` helpers (`0–24` low, `25–49` medium, `50–74` high, `75+` critical).

## Customizing

- **Add a module:** create a page in `src/pages/`, register it in `src/App.tsx`, and add a nav entry in `src/components/AppSidebar.tsx`.
- **Change demo data:** edit `src/data/mockData.ts`; every page reads from these exports.
- **Theme:** colors, radii, and risk colors live in `src/index.css` and `tailwind.config.ts`.
- **Connect a backend:** wrap fetches with the existing TanStack Query provider in `src/App.tsx` and replace the mock imports with query hooks.

## Deployment

`npm run build` produces a static `dist/` folder. Because the app uses `BrowserRouter`, configure SPA fallback so unknown paths serve `index.html`:

- **Netlify:** `/* /index.html 200`
- **Vercel:** rewrite all routes to `/index.html`
- **Static hosts:** enable "single-page application" mode or equivalent

## Limitations

- No persistence: alert acknowledgements and simulator runs reset on reload.
- The assistant is a deterministic, keyword-based responder over the mock dataset, not an LLM integration.
- Simulator impact numbers are randomized within fixed ranges, so repeat runs differ slightly.
- All dates and records are illustrative fixtures.
