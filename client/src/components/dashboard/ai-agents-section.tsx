import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { Palette, PenTool, Search, Package } from "lucide-react";

interface AIAgentsSectionProps {
  onAgentSelect: (agent: any) => void;
}

const agentIcons = {
  "brandKit": Palette,
  "contentKit": PenTool,
  "seoSiteGen": Search,
  "productMockup": Package,
};

const agentColors = {
  "brandKit": { bg: "bg-gradient-to-br from-primary to-primary-600", iconColor: "text-white" },
  "contentKit": { bg: "bg-gradient-to-br from-purple-500 to-purple-600", iconColor: "text-white" },
  "seoSiteGen": { bg: "bg-gradient-to-br from-green-500 to-green-600", iconColor: "text-white" },
  "productMockup": { bg: "bg-gradient-to-br from-orange-500 to-orange-600", iconColor: "text-white" },
};

export function AIAgentsSection({ onAgentSelect }: AIAgentsSectionProps) {
  const { data: agents = [], isLoading } = useQuery({
    queryKey: ["/api/agents"],
  });

  if (isLoading) {
    return (
      <Card className="border-slate-200 mb-8">
        <CardHeader>
          <CardTitle>AI Agents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="border border-slate-200 rounded-lg p-4 animate-pulse">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-slate-200 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-200 rounded w-3/4" />
                    <div className="h-3 bg-slate-200 rounded w-full" />
                    <div className="h-5 bg-slate-200 rounded w-1/2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-slate-200 mb-8">
      <CardHeader>
        <CardTitle>AI Agents</CardTitle>
        <p className="text-sm text-slate-600">Specialized Claude agents for your business needs</p>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.isArray(agents) && agents.map((agent: any) => {
            const IconComponent = agentIcons[agent.type as keyof typeof agentIcons] || Package;
            const colors = agentColors[agent.type as keyof typeof agentColors] || agentColors.productMockup;
            
            return (
              <div
                key={agent.id}
                className="border border-slate-200 rounded-lg p-4 hover:border-primary-300 hover:shadow-md transition-all cursor-pointer"
                onClick={() => onAgentSelect(agent)}
              >
                <div className="flex items-start space-x-3">
                  <div className={`w-10 h-10 ${colors.bg} rounded-lg flex items-center justify-center`}>
                    <IconComponent className={`h-5 w-5 ${colors.iconColor}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-slate-800">{agent.name}</h3>
                    <p className="text-xs text-slate-500 mt-1">{agent.description}</p>
                    <div className="flex items-center mt-2 space-x-2">
                      <Badge variant="secondary" className="bg-green-100 text-green-700">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1" />
                        Active
                      </Badge>
                      <span className="text-xs text-slate-400">{agent.usageCount || 0} uses today</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
