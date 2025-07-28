import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronRight, Plus, Bot, BarChart3, Rocket } from "lucide-react";

interface QuickActionsCardProps {
  onNewIdea: () => void;
  onRunAgent: () => void;
}

export function QuickActionsCard({ onNewIdea, onRunAgent }: QuickActionsCardProps) {
  const actions = [
    {
      icon: Plus,
      label: "New Business Idea",
      action: onNewIdea,
      color: "text-primary-600",
    },
    {
      icon: Bot,
      label: "Run AI Agent",
      action: onRunAgent,
      color: "text-purple-600",
    },
    {
      icon: BarChart3,
      label: "View Analytics",
      action: () => {}, // TODO: Implement analytics navigation
      color: "text-green-600",
    },
    {
      icon: Rocket,
      label: "Launch Product",
      action: () => {}, // TODO: Implement launch navigation
      color: "text-orange-600",
    },
  ];

  return (
    <Card className="border-slate-200">
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <p className="text-sm text-slate-600">Common tasks and shortcuts</p>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          {actions.map((action, index) => (
            <Button
              key={index}
              variant="ghost"
              className="w-full justify-between p-3 h-auto border border-slate-200 hover:border-primary-300 hover:bg-primary-50"
              onClick={action.action}
            >
              <div className="flex items-center space-x-3">
                <action.icon className={`h-4 w-4 ${action.color}`} />
                <span className="text-sm font-medium text-slate-800">{action.label}</span>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-400" />
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
