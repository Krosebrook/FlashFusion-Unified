import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { IdeaModal } from "@/components/modals/idea-modal";
import { AgentModal } from "@/components/modals/agent-modal";
import { useQuery } from "@tanstack/react-query";
import { Lightbulb, Edit, Trash2, Play } from "lucide-react";

// Mock user data
const mockUser = {
  id: "user123",
  name: "John Doe",
  email: "john@example.com",
  plan: "Pro Plan",
};

export default function Ideas() {
  const [ideaModalOpen, setIdeaModalOpen] = useState(false);
  const [agentModalOpen, setAgentModalOpen] = useState(false);
  const [selectedIdea, setSelectedIdea] = useState(null);

  const { data: ideas = [], isLoading } = useQuery({
    queryKey: ["/api/ideas", { userId: mockUser.id }],
  });

  const handleEditIdea = (idea: any) => {
    setSelectedIdea(idea);
    setIdeaModalOpen(true);
  };

  const handleRunAgent = (idea: any) => {
    setSelectedIdea(idea);
    setAgentModalOpen(true);
  };

  const handleNewIdea = () => {
    setSelectedIdea(null);
    setIdeaModalOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-700";
      case "completed": return "bg-blue-100 text-blue-700";
      case "draft": return "bg-yellow-100 text-yellow-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      <Sidebar user={mockUser} />
      
      <div className="lg:pl-64 flex flex-col flex-1">
        <Topbar title="Ideas" onNewIdea={handleNewIdea} />
        
        <main className="flex-1 overflow-y-auto">
          <div className="px-6 py-8">
            <Card className="border-slate-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Your Business Ideas</CardTitle>
                    <p className="text-sm text-slate-600">Manage and develop your business concepts</p>
                  </div>
                  <Button onClick={handleNewIdea} className="bg-primary hover:bg-primary/90">
                    <Lightbulb className="w-4 h-4 mr-2" />
                    New Idea
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent>
                {isLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div key={i} className="border border-slate-200 rounded-lg p-6 animate-pulse">
                        <div className="space-y-3">
                          <div className="h-4 bg-slate-200 rounded w-3/4" />
                          <div className="h-3 bg-slate-200 rounded w-full" />
                          <div className="h-3 bg-slate-200 rounded w-2/3" />
                          <div className="flex space-x-2">
                            <div className="h-6 bg-slate-200 rounded w-16" />
                            <div className="h-6 bg-slate-200 rounded w-20" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : !Array.isArray(ideas) || ideas.length === 0 ? (
                  <div className="text-center py-12">
                    <Lightbulb className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-800 mb-2">No ideas yet</h3>
                    <p className="text-slate-500 mb-6">Start by creating your first business idea</p>
                    <Button onClick={handleNewIdea} className="bg-primary hover:bg-primary/90">
                      <Lightbulb className="w-4 h-4 mr-2" />
                      Create Your First Idea
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.isArray(ideas) && ideas.map((idea: any) => (
                      <div key={idea.id} className="border border-slate-200 rounded-lg p-6 hover:border-primary-300 hover:shadow-md transition-all">
                        <div className="flex items-start justify-between mb-4">
                          <div className="w-10 h-10 bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg flex items-center justify-center">
                            <Lightbulb className="h-5 w-5 text-primary-600" />
                          </div>
                          <div className="flex space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditIdea(idea)}
                              className="h-8 w-8 p-0"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRunAgent(idea)}
                              className="h-8 w-8 p-0 text-primary"
                            >
                              <Play className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        
                        <h3 className="text-lg font-semibold text-slate-800 mb-2">{idea.title}</h3>
                        <p className="text-sm text-slate-600 mb-4 line-clamp-3">{idea.description}</p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex flex-wrap gap-2">
                            <Badge className={getStatusColor(idea.status)}>
                              {idea.status}
                            </Badge>
                            {idea.tone && (
                              <Badge variant="outline" className="text-xs">
                                {idea.tone}
                              </Badge>
                            )}
                          </div>
                          <span className="text-xs text-slate-400">
                            {new Date(idea.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      <IdeaModal
        isOpen={ideaModalOpen}
        onClose={() => setIdeaModalOpen(false)}
        userId={mockUser.id}
        idea={selectedIdea}
      />

      <AgentModal
        isOpen={agentModalOpen}
        onClose={() => setAgentModalOpen(false)}
        userId={mockUser.id}
        selectedIdea={selectedIdea}
      />
    </div>
  );
}
