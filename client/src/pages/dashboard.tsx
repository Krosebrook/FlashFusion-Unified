import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AgentModal } from "@/components/modals/agent-modal";
import { IdeaModal } from "@/components/modals/idea-modal";
import { 
  Zap, 
  Lightbulb, 
  Bot, 
  Rocket, 
  BarChart3, 
  TrendingUp, 
  Clock, 
  Target,
  Plus,
  Activity,
  Users,
  Calendar,
  ArrowRight
} from "lucide-react";

// Mock user data - in real app this would come from Firebase Auth
const mockUser = {
  id: "user123",
  name: "John Doe",
  email: "john@example.com",
  plan: "Pro Plan",
};

export default function Dashboard() {
  const [agentModalOpen, setAgentModalOpen] = useState(false);
  const [ideaModalOpen, setIdeaModalOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [selectedIdea, setSelectedIdea] = useState(null);

  const handleAgentSelect = (agent: any) => {
    setSelectedAgent(agent);
    setAgentModalOpen(true);
  };

  const handleIdeaSelect = (idea: any) => {
    setSelectedIdea(idea);
    setAgentModalOpen(true);
  };

  const handleNewIdea = () => {
    setSelectedIdea(null);
    setIdeaModalOpen(true);
  };

  const handleRunAgent = () => {
    setSelectedAgent(null);
    setSelectedIdea(null);
    setAgentModalOpen(true);
  };

  // Fetch dashboard data
  const { data: stats } = useQuery({
    queryKey: ['/api/stats', mockUser.id],
    queryFn: () => ({
      totalIdeas: 12,
      activeAgents: 4,
      completedTasks: 38,
      conversionRate: 85,
      monthlyGrowth: 23.5
    }),
  });

  const { data: agents } = useQuery({
    queryKey: ['/api/agents'],
  });

  const { data: recentIdeas } = useQuery({
    queryKey: ['/api/ideas', mockUser.id],
  });

  const { data: queueStatus } = useQuery({
    queryKey: ['/api/queue-status'],
  });

  return (
    <div className="min-h-screen flex bg-slate-50">
      <Sidebar user={mockUser} />
      
      <div className="lg:pl-64 flex flex-col flex-1">
        <Topbar title="Dashboard" onNewIdea={handleNewIdea} />
        
        <main className="flex-1 overflow-y-auto">
          <div className="px-6 py-8 page-transition">
            {/* Welcome Section */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-slate-900">
                    Welcome back, {mockUser.name.split(' ')[0]}! 👋
                  </h1>
                  <p className="text-lg text-slate-600 mt-2">
                    Let's turn your ideas into reality with AI-powered tools
                  </p>
                </div>
                <Button 
                  size="lg" 
                  onClick={handleNewIdea}
                  className="bg-gradient-to-r from-primary to-secondary-500 hover:from-primary/90 hover:to-secondary-500/90"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  New Idea
                </Button>
              </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 card-hover cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-600">Total Ideas</p>
                      <p className="text-3xl font-bold text-blue-900">{stats?.totalIdeas || 0}</p>
                      <div className="flex items-center mt-2">
                        <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                        <span className="text-sm text-green-600">+{stats?.monthlyGrowth || 0}%</span>
                      </div>
                    </div>
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                      <Lightbulb className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 card-hover cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-purple-600">AI Agents</p>
                      <p className="text-3xl font-bold text-purple-900">{agents?.length || 0}</p>
                      <p className="text-sm text-purple-600 mt-2">Available</p>
                    </div>
                    <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                      <Bot className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 card-hover cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-600">Completed Tasks</p>
                      <p className="text-3xl font-bold text-green-900">{stats?.completedTasks || 0}</p>
                      <p className="text-sm text-green-600 mt-2">This month</p>
                    </div>
                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                      <Target className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 card-hover cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-orange-600">Success Rate</p>
                      <p className="text-3xl font-bold text-orange-900">{stats?.conversionRate || 0}%</p>
                      <Progress value={stats?.conversionRate || 0} className="mt-2 h-2" />
                    </div>
                    <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
                      <BarChart3 className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-8">
                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Zap className="h-5 w-5 mr-2 text-primary" />
                      Quick Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Button 
                        variant="outline" 
                        className="h-20 flex-col justify-center space-y-2 hover:bg-primary/5 hover:border-primary"
                        onClick={handleNewIdea}
                      >
                        <Lightbulb className="h-6 w-6 text-primary" />
                        <span>Create New Idea</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        className="h-20 flex-col justify-center space-y-2 hover:bg-purple-50 hover:border-purple-200"
                        onClick={handleRunAgent}
                      >
                        <Bot className="h-6 w-6 text-purple-500" />
                        <span>Run AI Agent</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        className="h-20 flex-col justify-center space-y-2 hover:bg-green-50 hover:border-green-200"
                      >
                        <Rocket className="h-6 w-6 text-green-500" />
                        <span>Launch Project</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        className="h-20 flex-col justify-center space-y-2 hover:bg-blue-50 hover:border-blue-200"
                      >
                        <BarChart3 className="h-6 w-6 text-blue-500" />
                        <span>View Analytics</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Ideas */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Recent Ideas</CardTitle>
                    <Button variant="ghost" size="sm">
                      View All <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {recentIdeas && recentIdeas.length > 0 ? (
                      <div className="space-y-4">
                        {recentIdeas.slice(0, 3).map((idea: any) => (
                          <div 
                            key={idea.id} 
                            className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
                            onClick={() => handleIdeaSelect(idea)}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h3 className="font-medium text-slate-900 mb-1">{idea.title}</h3>
                                <p className="text-sm text-slate-600 line-clamp-2">{idea.description}</p>
                                <div className="flex items-center space-x-2 mt-2">
                                  <Badge variant="secondary" className="text-xs">
                                    {idea.tone}
                                  </Badge>
                                  <span className="text-xs text-slate-500">
                                    {new Date(idea.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                              <Button variant="ghost" size="sm">
                                <ArrowRight className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Lightbulb className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-500">No ideas yet</p>
                        <Button variant="ghost" size="sm" onClick={handleNewIdea} className="mt-2">
                          Create your first idea
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Queue Status */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center text-sm">
                      <Activity className="h-4 w-4 mr-2" />
                      Processing Queue
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600">Active Tasks</span>
                        <span className="font-medium">{queueStatus?.active || 0}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600">Pending</span>
                        <span className="font-medium">{queueStatus?.pending || 0}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600">Completed Today</span>
                        <span className="font-medium text-green-600">{queueStatus?.completedToday || 0}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* AI Agents */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center text-sm">
                      <Bot className="h-4 w-4 mr-2" />
                      AI Agents
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {agents?.slice(0, 4).map((agent: any) => (
                        <div 
                          key={agent.id}
                          className="flex items-center justify-between p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
                          onClick={() => handleAgentSelect(agent)}
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                              <Bot className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-slate-900">{agent.name}</p>
                              <p className="text-xs text-slate-500">{agent.usage_count || 0} runs</p>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm">
                            Run
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center text-sm">
                      <Clock className="h-4 w-4 mr-2" />
                      Recent Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-slate-600">Brand kit completed</span>
                        <span className="text-xs text-slate-500 ml-auto">2m ago</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-slate-600">New idea created</span>
                        <span className="text-xs text-slate-500 ml-auto">15m ago</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <span className="text-slate-600">SEO analysis finished</span>
                        <span className="text-xs text-slate-500 ml-auto">1h ago</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>

      <AgentModal
        isOpen={agentModalOpen}
        onClose={() => setAgentModalOpen(false)}
        userId={mockUser.id}
        selectedAgent={selectedAgent}
        selectedIdea={selectedIdea}
      />

      <IdeaModal
        isOpen={ideaModalOpen}
        onClose={() => setIdeaModalOpen(false)}
        userId={mockUser.id}
        idea={selectedIdea}
      />
    </div>
  );
}
