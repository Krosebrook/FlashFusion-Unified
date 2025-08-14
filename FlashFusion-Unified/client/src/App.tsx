import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Routes, Route } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AuthProvider } from "@/hooks/useAuth";
import { SecurityProvider } from "@/components/SecurityProvider";
import { FlashFusionSidebar } from "@/components/FlashFusionSidebar";
import SecurityHeaders from "@/components/SecurityHeaders";
import ProtectedRoute from "@/components/ProtectedRoute";

// Page imports
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import ValidatorPage from "./pages/ValidatorPage";
import GeneratorPage from "./pages/GeneratorPage";
import ExportPage from "./pages/ExportPage";
import FlashFusionDashboard from "./pages/FlashFusionDashboard";
import Dashboard from "./pages/Dashboard";
import CreatorDashboard from "./pages/CreatorDashboard";
import DesignStudio from "./pages/DesignStudio";
import NotFound from "./pages/NotFound";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import PrivacySettings from "./pages/PrivacySettings";
import ConversationsPage from "./pages/ConversationsPage";

const App = () => (
  <SecurityProvider>
    <SecurityHeaders />
    <AuthProvider>
      <TooltipProvider>
            <Toaster />
            <Sonner />
            <SidebarProvider>
            <div className="min-h-screen flex w-full">
              <FlashFusionSidebar />
              
              <div className="flex-1 flex flex-col">
                <header className="h-12 flex items-center border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                  <SidebarTrigger className="ml-2" />
                </header>
                
                <main className="flex-1">
                  <Routes>
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/privacy" element={<PrivacyPolicy />} />
                    <Route path="/terms" element={<TermsOfService />} />
                    <Route path="/privacy-settings" element={
                      <ProtectedRoute>
                        <PrivacySettings />
                      </ProtectedRoute>
                    } />
                    <Route path="/dashboard" element={
                      <ProtectedRoute>
                        <FlashFusionDashboard />
                      </ProtectedRoute>
                    } />
                    <Route path="/old-dashboard" element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    } />
                    <Route path="/creator" element={
                      <ProtectedRoute>
                        <CreatorDashboard />
                      </ProtectedRoute>
                    } />
                    <Route path="/design-studio" element={
                      <ProtectedRoute>
                        <DesignStudio />
                      </ProtectedRoute>
                    } />
                    <Route path="/validate" element={
                      <ProtectedRoute>
                        <ValidatorPage />
                      </ProtectedRoute>
                    } />
                    <Route path="/generate" element={
                      <ProtectedRoute>
                        <GeneratorPage />
                      </ProtectedRoute>
                    } />
                    <Route path="/export" element={
                      <ProtectedRoute>
                        <ExportPage />
                      </ProtectedRoute>
                    } />
                    <Route path="/conversations" element={
                      <ProtectedRoute>
                        <ConversationsPage />
                      </ProtectedRoute>
                    } />
                    <Route path="/" element={
                      <ProtectedRoute>
                        <Index />
                      </ProtectedRoute>
                    } />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </main>
              </div>
            </div>
          </SidebarProvider>
        </TooltipProvider>
    </AuthProvider>
  </SecurityProvider>
);

export default App;