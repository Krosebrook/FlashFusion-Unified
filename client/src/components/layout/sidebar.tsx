import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Home,
  Lightbulb,
  Bot,
  Rocket,
  BarChart3,
  CreditCard,
  Printer,
  Search,
  Settings,
  Zap,
  Webhook,
  Activity,
  Store,
  Users,
  Cpu,
  Shield,
  Download,
  Smartphone,
  FileText,
  Calculator,
  Crown,
  TrendingUp
} from "lucide-react";

interface SidebarProps {
  user?: {
    name: string;
    email: string;
    plan: string;
  };
}

const navigation = [
  { name: "Dashboard", href: "/app", icon: Home },
  { name: "Ideas", href: "/app/ideas", icon: Lightbulb },
  { name: "AI Agents", href: "/app/agents", icon: Bot },
  { name: "Launch Center", href: "/app/launch", icon: Rocket },
  { name: "Analytics", href: "/app/analytics", icon: BarChart3 },
];

const tools = [
  { name: "Billing & Plans", href: "/app/payments", icon: CreditCard },
  { name: "Print Products", href: "/app/print", icon: Printer },
  { name: "SEO Tools", href: "/app/seo", icon: Search },
  { name: "Zapier Integration", href: "/app/zapier", icon: Webhook },
  { name: "Webhook Monitor", href: "/app/webhook-monitor", icon: Activity },
  { name: "Enhanced Analytics", href: "/app/analytics-enhanced", icon: BarChart3 },
  { name: "AI Agent Marketplace", href: "/app/ai-agent-marketplace", icon: Store },
  { name: "Team Workspace", href: "/app/team-workspace", icon: Users },
  { name: "Advanced AI Models", href: "/app/advanced-ai-models", icon: Cpu },
  { name: "Enterprise SSO", href: "/app/enterprise-sso", icon: Shield },
  { name: "Advanced Export", href: "/app/advanced-export", icon: Download },
  { name: "Mobile App & PWA", href: "/app/mobile-app", icon: Smartphone },
  { name: "Content Templates", href: "/app/content-templates", icon: FileText },
  { name: "Financial Planning", href: "/app/financial-planning", icon: Calculator },
  { name: "White-label Platform", href: "/app/white-label", icon: Crown },
  { name: "Automation Engine", href: "/app/automation-workflow", icon: Zap },
  { name: "Market Research", href: "/app/market-research", icon: TrendingUp },
  { name: "Settings", href: "/app/settings", icon: Settings },
];

export function Sidebar({ user }: SidebarProps) {
  const [location] = useLocation();

  return (
    <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 bg-white border-r border-slate-200">
      {/* Logo */}
      <div className="flex items-center px-6 py-4 border-b border-slate-200">
        <Link href="/">
          <div className="flex items-center space-x-2 cursor-pointer hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary-500 rounded-lg flex items-center justify-center">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-800">FlashFusion</span>
          </div>
        </Link>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.name} href={item.href}>
              <Button
                variant={isActive ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start text-sm font-medium",
                  isActive ? "bg-primary text-primary-foreground" : "text-slate-600 hover:text-slate-800 hover:bg-slate-100"
                )}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.name}
              </Button>
            </Link>
          );
        })}
        
        <div className="pt-6">
          <Separator className="mb-4" />
          <div className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Tools
          </div>
          {tools.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.name} href={item.href}>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start text-sm font-medium",
                    isActive ? "bg-primary text-primary-foreground" : "text-slate-600 hover:text-slate-800 hover:bg-slate-100"
                  )}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Button>
              </Link>
            );
          })}
        </div>
      </nav>
      
      {/* User Profile */}
      <div className="px-4 py-4 border-t border-slate-200">
        <div className="flex items-center space-x-3">
          <Avatar className="w-8 h-8">
            <AvatarFallback className="bg-primary text-primary-foreground">
              {user?.name?.slice(0, 2).toUpperCase() || "JD"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-800">{user?.name || "John Doe"}</p>
            <p className="text-xs text-slate-500">{user?.plan || "Pro Plan"}</p>
          </div>
          <Button variant="ghost" size="sm" className="text-slate-400 hover:text-slate-600 p-1">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
