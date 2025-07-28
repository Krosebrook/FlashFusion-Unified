import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Play } from "lucide-react";

interface AgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  selectedAgent?: any;
  selectedIdea?: any;
}

export function AgentModal({ isOpen, onClose, userId, selectedAgent, selectedIdea }: AgentModalProps) {
  const [agentType, setAgentType] = useState(selectedAgent?.type || "");
  const [idea, setIdea] = useState(selectedIdea?.description || "");
  const [tone, setTone] = useState(selectedIdea?.tone || "");
  const [requirements, setRequirements] = useState("");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: agents = [] } = useQuery({
    queryKey: ["/api/agents"],
  });

  const { data: ideas = [] } = useQuery({
    queryKey: ["/api/ideas", { userId }],
  });

  const createTaskMutation = useMutation({
    mutationFn: (taskData: any) => apiRequest("POST", "/api/agent-tasks", taskData),
    onSuccess: () => {
      toast({
        title: "Agent Task Created",
        description: "Your AI agent has been queued for processing.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/agent-tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/queue-status"] });
      onClose();
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Create Task",
        description: error.message || "Something went wrong.",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setAgentType("");
    setIdea("");
    setTone("");
    setRequirements("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!agentType || !idea) {
      toast({
        title: "Missing Information",
        description: "Please select an agent and provide a business idea.",
        variant: "destructive",
      });
      return;
    }

    const selectedAgentData = Array.isArray(agents) ? agents.find((agent: any) => agent.type === agentType) : null;
    
    createTaskMutation.mutate({
      userId,
      agentId: selectedAgentData?.id,
      ideaId: selectedIdea?.id,
      status: "queued",
      input: {
        agentType,
        idea,
        tone,
        requirements,
      },
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>AI Agent Configuration</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="agent-select">Select Agent</Label>
            <Select value={agentType} onValueChange={setAgentType}>
              <SelectTrigger>
                <SelectValue placeholder="Choose an AI agent" />
              </SelectTrigger>
              <SelectContent>
                {Array.isArray(agents) && agents.map((agent: any) => (
                  <SelectItem key={agent.id} value={agent.type}>
                    {agent.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="idea-select">Business Idea</Label>
            <Select value={selectedIdea?.id || ""} onValueChange={(value) => {
              const selected = Array.isArray(ideas) ? ideas.find((i: any) => i.id === value) : null;
              if (selected) {
                setIdea(selected.description);
                setTone(selected.tone || "");
              }
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Select an existing idea or enter manually" />
              </SelectTrigger>
              <SelectContent>
                {Array.isArray(ideas) && ideas.map((ideaItem: any) => (
                  <SelectItem key={ideaItem.id} value={ideaItem.id}>
                    {ideaItem.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="idea-input">Business Idea Description</Label>
            <Textarea
              id="idea-input"
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              placeholder="Describe your business idea..."
              rows={3}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="tone-input">Tone & Style</Label>
            <Input
              id="tone-input"
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              placeholder="e.g., professional, playful, minimalist"
            />
          </div>
          
          <div>
            <Label htmlFor="requirements-input">Additional Requirements</Label>
            <Textarea
              id="requirements-input"
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              placeholder="Any specific requirements or preferences..."
              rows={2}
            />
          </div>
          
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-200">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={createTaskMutation.isPending}
              className="bg-primary hover:bg-primary/90"
            >
              <Play className="w-4 h-4 mr-2" />
              {createTaskMutation.isPending ? "Creating..." : "Run Agent"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
