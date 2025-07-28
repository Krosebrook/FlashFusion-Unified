import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import LandingPage from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import Ideas from "@/pages/ideas";
import Agents from "@/pages/agents";
import Launch from "@/pages/launch";
import Analytics from "@/pages/analytics";
import Payments from "@/pages/payments";
import Print from "@/pages/print";
import SEO from "@/pages/seo";
import Settings from "@/pages/settings";
import Zapier from "@/pages/zapier";
import WebhookMonitor from "@/pages/webhook-monitor";
import AnalyticsEnhanced from "@/pages/analytics-enhanced";
import AIAgentMarketplace from "@/pages/ai-agent-marketplace";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/app" component={Dashboard} />
      <Route path="/app/ideas" component={Ideas} />
      <Route path="/app/agents" component={Agents} />
      <Route path="/app/launch" component={Launch} />
      <Route path="/app/analytics" component={Analytics} />
      <Route path="/app/payments" component={Payments} />
      <Route path="/app/print" component={Print} />
      <Route path="/app/seo" component={SEO} />
      <Route path="/app/settings" component={Settings} />
      <Route path="/app/zapier" component={Zapier} />
      <Route path="/app/webhook-monitor" component={WebhookMonitor} />
      <Route path="/app/analytics-enhanced" component={AnalyticsEnhanced} />
      <Route path="/app/marketplace" component={AIAgentMarketplace} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
