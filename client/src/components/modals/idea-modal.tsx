import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Plus } from "lucide-react";

interface IdeaModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  idea?: any;
}

export function IdeaModal({ isOpen, onClose, userId, idea }: IdeaModalProps) {
  const [title, setTitle] = useState(idea?.title || "");
  const [description, setDescription] = useState(idea?.description || "");
  const [tone, setTone] = useState(idea?.tone || "");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createIdeaMutation = useMutation({
    mutationFn: (ideaData: any) => apiRequest("POST", "/api/ideas", ideaData),
    onSuccess: () => {
      toast({
        title: "Idea Created",
        description: "Your business idea has been saved successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/ideas"] });
      onClose();
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Create Idea",
        description: error.message || "Something went wrong.",
        variant: "destructive",
      });
    },
  });

  const updateIdeaMutation = useMutation({
    mutationFn: (ideaData: any) => apiRequest("PUT", `/api/ideas/${idea.id}`, ideaData),
    onSuccess: () => {
      toast({
        title: "Idea Updated",
        description: "Your business idea has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/ideas"] });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Update Idea",
        description: error.message || "Something went wrong.",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setTone("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !description) {
      toast({
        title: "Missing Information",
        description: "Please provide both a title and description for your idea.",
        variant: "destructive",
      });
      return;
    }

    const ideaData = {
      userId,
      title,
      description,
      tone,
      status: "draft",
    };

    if (idea) {
      updateIdeaMutation.mutate(ideaData);
    } else {
      createIdeaMutation.mutate(ideaData);
    }
  };

  const isLoading = createIdeaMutation.isPending || updateIdeaMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{idea ? "Edit Idea" : "New Business Idea"}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="title-input">Idea Title</Label>
            <Input
              id="title-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give your idea a catchy name..."
              required
            />
          </div>
          
          <div>
            <Label htmlFor="description-input">Description</Label>
            <Textarea
              id="description-input"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your business idea in detail..."
              rows={4}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="tone-input">Tone & Style</Label>
            <Input
              id="tone-input"
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              placeholder="e.g., professional, playful, minimalist, funny"
            />
          </div>
          
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-200">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
              className="bg-primary hover:bg-primary/90"
            >
              <Plus className="w-4 h-4 mr-2" />
              {isLoading ? "Saving..." : idea ? "Update Idea" : "Create Idea"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
