import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { AIAgentsSection } from "@/components/dashboard/ai-agents-section";
import { RecentIdeasSection } from "@/components/dashboard/recent-ideas-section";
import { QueueStatusCard } from "@/components/dashboard/queue-status-card";
import { QuickActionsCard } from "@/components/dashboard/quick-actions-card";
import { RecentActivityCard } from "@/components/dashboard/recent-activity-card";
import { AgentModal } from "@/components/modals/agent-modal";
import { IdeaModal } from "@/components/modals/idea-modal";

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

  return (
    <div className="min-h-screen flex bg-slate-50">
      <Sidebar user={mockUser} />
      
      <div className="lg:pl-64 flex flex-col flex-1">
        <Topbar title="Dashboard" onNewIdea={handleNewIdea} />
        
        <main className="flex-1 overflow-y-auto">
          <div className="px-6 py-8">
            <StatsCards userId={mockUser.id} />
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <AIAgentsSection onAgentSelect={handleAgentSelect} />
                <RecentIdeasSection 
                  userId={mockUser.id} 
                  onIdeaSelect={handleIdeaSelect}
                />
              </div>

              <div className="space-y-8">
                <QueueStatusCard userId={mockUser.id} />
                <QuickActionsCard 
                  onNewIdea={handleNewIdea}
                  onRunAgent={handleRunAgent}
                />
                <RecentActivityCard userId={mockUser.id} />
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
