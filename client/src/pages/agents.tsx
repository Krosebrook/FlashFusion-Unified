import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AgentModal } from "@/components/modals/agent-modal";
import { IdeaModal } from "@/components/modals/idea-modal";
import { useQuery } from "@tanstack/react-query";
import { Bot, Play, Activity, Clock, CheckCircle, XCircle } from "lucide-react";
import { Palette, PenTool, Search, Package } from "lucide-react";

// Mock user data
const mockUser = {
  id: "user123",
  name: "John Doe",
  email: "john@example.com",
  plan: "Pro Plan",
};

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

export default function Agents() {
  const [agentModalOpen, setAgentModalOpen] = useState(false);
  const [ideaModalOpen, setIdeaModalOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState(null);

  const { data: agents = [], isLoading: agentsLoading } = useQuery({
    queryKey: ["/api/agents"],
  });

  const { data: tasks = [], isLoading: tasksLoading } = useQuery({
    queryKey: ["/api/agent-tasks", { userId: mockUser.id }],
    refetchInterval: 5000,
  });

  const handleRunAgent = (agent: any) => {
    setSelectedAgent(agent);
    setAgentModalOpen(true);
  };

  const handleNewIdea = () => {
    setIdeaModalOpen(true);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return CheckCircle;
      case "processing": return Activity;
      case "failed": return XCircle;
      default: return Clock;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "text-green-600";
      case "processing": return "text-yellow-600";
      case "failed": return "text-red-600";
      default: return "text-blue-600";
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-700";
      case "processing": return "bg-yellow-100 text-yellow-700";
      case "failed": return "bg-red-100 text-red-700";
      default: return "bg-blue-100 text-blue-700";
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      <Sidebar user={mockUser} />
      
      <div className="lg:pl-64 flex flex-col flex-1">
        <Topbar title="AI Agents" onNewIdea={handleNewIdea} />
        
        <main className="flex-1 overflow-y-auto">
          <div className="px-6 py-8 space-y-8">
            {/* Available Agents */}
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle>Available AI Agents</CardTitle>
                <p className="text-sm text-slate-600">Specialized Claude agents for your business needs</p>
              </CardHeader>
              
              <CardContent>
                {agentsLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="border border-slate-200 rounded-lg p-6 animate-pulse">
                        <div className="space-y-3">
                          <div className="w-12 h-12 bg-slate-200 rounded-lg" />
                          <div className="h-4 bg-slate-200 rounded w-3/4" />
                          <div className="h-3 bg-slate-200 rounded w-full" />
                          <div className="h-6 bg-slate-200 rounded w-1/2" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {Array.isArray(agents) && agents.map((agent: any) => {
                      const IconComponent = agentIcons[agent.type as keyof typeof agentIcons] || Package;
                      const colors = agentColors[agent.type as keyof typeof agentColors] || agentColors.productMockup;
                      
                      return (
                        <div key={agent.id} className="border border-slate-200 rounded-lg p-6 hover:border-primary-300 hover:shadow-md transition-all">
                          <div className={`w-12 h-12 ${colors.bg} rounded-lg flex items-center justify-center mb-4`}>
                            <IconComponent className={`h-6 w-6 ${colors.iconColor}`} />
                          </div>
                          
                          <h3 className="text-lg font-semibold text-slate-800 mb-2">{agent.name}</h3>
                          <p className="text-sm text-slate-600 mb-4 line-clamp-2">{agent.description}</p>
                          
                          <div className="flex items-center justify-between mb-4">
                            <Badge className={agent.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}>
                              {agent.isActive ? "Active" : "Inactive"}
                            </Badge>
                            <span className="text-xs text-slate-400">{agent.usageCount || 0} uses</span>
                          </div>
                          
                          <Button 
                            onClick={() => handleRunAgent(agent)} 
                            className="w-full bg-primary hover:bg-primary/90"
                            disabled={!agent.isActive}
                          >
                            <Play className="w-4 h-4 mr-2" />
                            Run Agent
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Tasks */}
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle>Recent Tasks</CardTitle>
                <p className="text-sm text-slate-600">Your AI agent task history</p>
              </CardHeader>
              
              <CardContent>
                {tasksLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="flex items-center space-x-4 p-4 border border-slate-200 rounded-lg animate-pulse">
                        <div className="w-10 h-10 bg-slate-200 rounded-lg" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-slate-200 rounded w-1/2" />
                          <div className="h-3 bg-slate-200 rounded w-3/4" />
                        </div>
                        <div className="h-6 bg-slate-200 rounded w-20" />
                      </div>
                    ))}
                  </div>
                ) : !Array.isArray(tasks) || tasks.length === 0 ? (
                  <div className="text-center py-12">
                    <Bot className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-800 mb-2">No tasks yet</h3>
                    <p className="text-slate-500 mb-6">Run your first AI agent to get started</p>
                    <Button onClick={() => setAgentModalOpen(true)} className="bg-primary hover:bg-primary/90">
                      <Play className="w-4 h-4 mr-2" />
                      Run Agent
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {Array.isArray(tasks) && tasks.slice(0, 10).map((task: any) => {
                      const agent = Array.isArray(agents) ? agents.find((a: any) => a.id === task.agentId) : null;
                      const IconComponent = agentIcons[task.input?.agentType as keyof typeof agentIcons] || Package;
                      const StatusIcon = getStatusIcon(task.status);
                      
                      return (
                        <div key={task.id} className="flex items-center space-x-4 p-4 border border-slate-200 rounded-lg hover:border-primary-300 transition-all">
                          <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                            <IconComponent className="h-5 w-5 text-primary-600" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-slate-800">
                              {agent?.name || "AI Task"}
                            </h4>
                            <p className="text-xs text-slate-500 truncate">
                              {task.input?.idea || "Processing..."}
                            </p>
                            <div className="flex items-center mt-1 space-x-2">
                              <StatusIcon className={`h-3 w-3 ${getStatusColor(task.status)}`} />
                              <span className="text-xs text-slate-400">
                                {task.completedAt 
                                  ? new Date(task.completedAt).toLocaleDateString()
                                  : new Date(task.createdAt).toLocaleDateString()
                                }
                              </span>
                            </div>
                          </div>
                          
                          <Badge className={getStatusBadgeColor(task.status)}>
                            {task.status}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      <AgentModal
        isOpen={agentModalOpen}
        onClose={() => setAgentModalOpen(false)}
        userId={mockUser.id}
        selectedAgent={selectedAgent}
      />

      <IdeaModal
        isOpen={ideaModalOpen}
        onClose={() => setIdeaModalOpen(false)}
        userId={mockUser.id}
      />
    </div>
  );
}
