import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { WorkspaceProvider } from "@/state/WorkspaceProvider";

const ExceptionsPage = lazy(() => import("./pages/ExceptionsPage"));
const ParcelsPage = lazy(() => import("./pages/ParcelsPage"));
const ParcelDetailPage = lazy(() => import("./pages/ParcelDetailPage"));
const CustomsPage = lazy(() => import("./pages/CustomsPage"));
const CommsPage = lazy(() => import("./pages/CommsPage"));
const ImpactPage = lazy(() => import("./pages/ImpactPage"));
const ConnectionsPage = lazy(() => import("./pages/ConnectionsPage"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const PageLoader = () => (
  <div className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">
    Loading workspace…
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <WorkspaceProvider>
        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<ExceptionsPage />} />
              <Route path="/parcels" element={<ParcelsPage />} />
              <Route path="/parcels/:parcelId" element={<ParcelDetailPage />} />
              <Route path="/customs" element={<CustomsPage />} />
              <Route path="/comms" element={<CommsPage />} />
              <Route path="/impact" element={<ImpactPage />} />
              <Route path="/connections" element={<ConnectionsPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </WorkspaceProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
