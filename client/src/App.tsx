import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Dashboard from "@/pages/dashboard";
import Ideas from "@/pages/ideas";
import Agents from "@/pages/agents";
import Launch from "@/pages/launch";
import Analytics from "@/pages/analytics";
import Payments from "@/pages/payments";
import Print from "@/pages/print";
import SEO from "@/pages/seo";
import Settings from "@/pages/settings";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/ideas" component={Ideas} />
      <Route path="/agents" component={Agents} />
      <Route path="/launch" component={Launch} />
      <Route path="/analytics" component={Analytics} />
      <Route path="/payments" component={Payments} />
      <Route path="/print" component={Print} />
      <Route path="/seo" component={SEO} />
      <Route path="/settings" component={Settings} />
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
