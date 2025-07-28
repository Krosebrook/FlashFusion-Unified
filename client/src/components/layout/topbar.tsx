import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Menu, Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getQueueStatus } from "@/lib/queue";

interface TopbarProps {
  title: string;
  onNewIdea?: () => void;
  onMenuClick?: () => void;
}

export function Topbar({ title, onNewIdea, onMenuClick }: TopbarProps) {
  const { data: queueStatus } = useQuery({
    queryKey: ["/api/queue-status"],
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  return (
    <div className="sticky top-0 z-40 bg-white border-b border-slate-200">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={onMenuClick}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold text-slate-800">{title}</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Queue Status */}
            {queueStatus && typeof queueStatus === 'object' && 'totalTasks' in queueStatus && 'completedTasks' in queueStatus && 'failedTasks' in queueStatus && (
              <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2" />
                {((queueStatus as any).totalTasks - (queueStatus as any).completedTasks - (queueStatus as any).failedTasks) || 0} tasks queued
              </Badge>
            )}
            
            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />
            </Button>
            
            {/* New Idea Button */}
            <Button onClick={onNewIdea} className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              New Idea
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
