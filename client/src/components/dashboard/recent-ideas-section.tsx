import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, Lightbulb, CheckCircle, Clock, Palette, Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";

interface RecentIdeasSectionProps {
  userId: string;
  onIdeaSelect?: (idea: any) => void;
}

export function RecentIdeasSection({ userId, onIdeaSelect }: RecentIdeasSectionProps) {
  const { data: ideas = [], isLoading } = useQuery({
    queryKey: ["/api/ideas", { userId }],
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ["/api/agent-tasks", { userId }],
  });

  // Get tasks for each idea
  const getTasksForIdea = (ideaId: string) => {
    return Array.isArray(tasks) ? tasks.filter((task: any) => task.ideaId === ideaId) : [];
  };

  const getTaskIcon = (agentType: string) => {
    switch (agentType) {
      case 'brandKit': return CheckCircle;
      case 'contentKit': return Palette;
      case 'seoSiteGen': return Search;
      default: return Clock;
    }
  };

  const getTaskColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'processing': return 'bg-yellow-500';
      case 'failed': return 'bg-red-500';
      default: return 'bg-blue-500';
    }
  };

  if (isLoading) {
    return (
      <Card className="border-slate-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Ideas</CardTitle>
              <p className="text-sm text-slate-600">Your latest business concepts and projects</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center space-x-4 p-4 border border-slate-200 rounded-lg animate-pulse">
                <div className="w-12 h-12 bg-slate-200 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-200 rounded w-3/4" />
                  <div className="h-3 bg-slate-200 rounded w-full" />
                  <div className="h-5 bg-slate-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const recentIdeas = Array.isArray(ideas) ? ideas.slice(0, 3) : [];

  return (
    <Card className="border-slate-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Recent Ideas</CardTitle>
            <p className="text-sm text-slate-600">Your latest business concepts and projects</p>
          </div>
          <Link href="/ideas">
            <Button variant="ghost" size="sm" className="text-primary-600 hover:text-primary-700">
              View All
            </Button>
          </Link>
        </div>
      </CardHeader>
      
      <CardContent>
        {recentIdeas.length === 0 ? (
          <div className="text-center py-8">
            <Lightbulb className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">No ideas yet. Create your first business idea!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {recentIdeas.map((idea: any) => {
              const ideaTasks = getTasksForIdea(idea.id);
              
              return (
                <div
                  key={idea.id}
                  className="flex items-center space-x-4 p-4 border border-slate-200 rounded-lg hover:border-primary-300 hover:shadow-sm transition-all cursor-pointer"
                  onClick={() => onIdeaSelect?.(idea)}
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg flex items-center justify-center">
                    <Lightbulb className="h-6 w-6 text-primary-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-slate-800">{idea.title}</h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{idea.description}</p>
                    <div className="flex items-center mt-2 space-x-3">
                      {idea.tone && (
                        <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                          {idea.tone}
                        </Badge>
                      )}
                      <span className="text-xs text-slate-400">
                        {new Date(idea.createdAt).toLocaleDateString() || "Recently"}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {ideaTasks.length > 0 && (
                      <div className="flex -space-x-1">
                        {ideaTasks.slice(0, 3).map((task: any, index: number) => {
                          const IconComponent = getTaskIcon(task.input?.agentType);
                          const colorClass = getTaskColor(task.status);
                          
                          return (
                            <div
                              key={index}
                              className={`w-6 h-6 ${colorClass} rounded-full border-2 border-white flex items-center justify-center`}
                            >
                              <IconComponent className="h-3 w-3 text-white" />
                            </div>
                          );
                        })}
                      </div>
                    )}
                    <ChevronRight className="h-4 w-4 text-slate-400" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
