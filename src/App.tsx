import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import EventDetail from "./pages/EventDetail.tsx";
import AdminLogin from "./pages/AdminLogin.tsx";
import AdminLayout from "./pages/AdminLayout.tsx";
import AdminEvents from "./pages/AdminEvents.tsx";
import AdminEventForm from "./pages/AdminEventForm.tsx";
import AdminGallery from "./pages/AdminGallery.tsx";
import AdminSubscribers from "./pages/AdminSubscribers.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/evento/:slug" element={<EventDetail />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminEvents />} />
            <Route path="eventos/:id" element={<AdminEventForm />} />
            <Route path="galeria" element={<AdminGallery />} />
            <Route path="subscritores" element={<AdminSubscribers />} />
          </Route>
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
