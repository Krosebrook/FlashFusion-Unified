import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle, User, Rocket, Bell } from "lucide-react";

interface RecentActivityCardProps {
  userId: string;
}

export function RecentActivityCard({ userId }: RecentActivityCardProps) {
  const { data: tasks = [] } = useQuery({
    queryKey: ["/api/agent-tasks", { userId }],
  });

  // Generate activity items from recent tasks
  const recentTasks = Array.isArray(tasks) ? tasks
    .filter((task: any) => task.completedAt)
    .sort((a: any, b: any) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
    .slice(0, 4) : [];

  const getActivityMessage = (task: any) => {
    const agentTypes = {
      brandKit: "Brand kit",
      contentKit: "Content",
      seoSiteGen: "SEO landing page",
      productMockup: "Product mockup",
    } as const;
    const agentName = agentTypes[task.input?.agentType as keyof typeof agentTypes] || "Task";

    return `${agentName} generated for "${task.input?.idea?.slice(0, 30)}..."`;
  };

  const getActivityIcon = (task: any) => {
    switch (task.input?.agentType) {
      case "brandKit": return CheckCircle;
      case "contentKit": return User;
      case "seoSiteGen": return Rocket;
      default: return Bell;
    }
  };

  const getIconColor = (task: any) => {
    switch (task.input?.agentType) {
      case "brandKit": return "bg-green-100 text-green-600";
      case "contentKit": return "bg-blue-100 text-blue-600";
      case "seoSiteGen": return "bg-purple-100 text-purple-600";
      default: return "bg-yellow-100 text-yellow-600";
    }
  };

  const getTimeAgo = (date: string | Date) => {
    const now = new Date();
    const past = new Date(date);
    const diffInMinutes = Math.floor((now.getTime() - past.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return "just now";
    if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  };

  return (
    <Card className="border-slate-200">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <p className="text-sm text-slate-600">Latest system events</p>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {recentTasks.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-sm text-slate-500">No recent activity</p>
            </div>
          ) : (
            recentTasks.map((task: any) => {
              const IconComponent = getActivityIcon(task);
              const iconColorClass = getIconColor(task);
              
              return (
                <div key={task.id} className="flex items-start space-x-3">
                  <div className={`w-8 h-8 ${iconColorClass} rounded-full flex items-center justify-center mt-0.5`}>
                    <IconComponent className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-800">{getActivityMessage(task)}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {getTimeAgo(task.completedAt)}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
