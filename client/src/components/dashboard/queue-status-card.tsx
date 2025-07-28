import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { getQueueStatus, getQueueHealthStatus } from "@/lib/queue";
import { Palette, PenTool, Search, Package } from "lucide-react";

interface QueueStatusCardProps {
  userId: string;
}

const agentIcons = {
  "brandKit": Palette,
  "contentKit": PenTool,
  "seoSiteGen": Search,
  "productMockup": Package,
};

export function QueueStatusCard({ userId }: QueueStatusCardProps) {
  const { data: queueStatus, isLoading } = useQuery({
    queryKey: ["/api/queue-status"],
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ["/api/agent-tasks", { userId }],
    refetchInterval: 5000,
  });

  if (isLoading) {
    return (
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle>Task Queue</CardTitle>
          <p className="text-sm text-slate-600">AI agent processing status</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg animate-pulse">
                <div className="w-8 h-8 bg-slate-200 rounded-full" />
                <div className="flex-1 space-y-1">
                  <div className="h-4 bg-slate-200 rounded w-3/4" />
                  <div className="h-3 bg-slate-200 rounded w-1/2" />
                </div>
                <div className="w-2 h-2 bg-slate-200 rounded-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const processingTasks = Array.isArray(tasks) ? tasks.filter((task: any) => task.status === "processing" || task.status === "queued") : [];
  const healthStatus = queueStatus && typeof queueStatus === 'object' ? getQueueHealthStatus(queueStatus as any) : { health: "Unknown", color: "gray" };

  return (
    <Card className="border-slate-200">
      <CardHeader>
        <CardTitle>Task Queue</CardTitle>
        <p className="text-sm text-slate-600">AI agent processing status</p>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {processingTasks.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-sm text-slate-500">No tasks in queue</p>
            </div>
          ) : (
            processingTasks.slice(0, 3).map((task: any) => {
              const agentType = task.input?.agentType || "unknown";
              const IconComponent = agentIcons[agentType as keyof typeof agentIcons] || Package;
              const isProcessing = task.status === "processing";
              
              return (
                <div key={task.id} className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <IconComponent className="h-4 w-4 text-primary-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800">
                      {task.input?.agentType === "brandKit" && "Brand Kit Generation"}
                      {task.input?.agentType === "contentKit" && "Content Generation"}
                      {task.input?.agentType === "seoSiteGen" && "SEO Landing Page"}
                      {task.input?.agentType === "productMockup" && "Product Mockup"}
                      {!task.input?.agentType && "AI Task"}
                    </p>
                    <p className="text-xs text-slate-500 truncate">
                      {task.input?.idea || "Processing..."}
                    </p>
                  </div>
                  <div className={`w-2 h-2 rounded-full ${isProcessing ? 'bg-yellow-500 animate-pulse' : 'bg-blue-500'}`} />
                </div>
              );
            })
          )}
          
          {queueStatus && (
            <div className="pt-4 border-t border-slate-200">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-slate-600">Queue Health</span>
                <Badge 
                  variant="secondary" 
                  className={`${
                    healthStatus.color === 'green' ? 'bg-green-100 text-green-700' :
                    healthStatus.color === 'yellow' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}
                >
                  {healthStatus.health}
                </Badge>
              </div>
              <Progress 
                value={queueStatus && typeof queueStatus === 'object' && 'totalTasks' in queueStatus && 'completedTasks' in queueStatus && (queueStatus as any).totalTasks > 0 ? ((queueStatus as any).completedTasks / (queueStatus as any).totalTasks) * 100 : 0} 
                className="h-2"
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
