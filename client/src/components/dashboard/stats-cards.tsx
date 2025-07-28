import { Card, CardContent } from "@/components/ui/card";
import { Lightbulb, Bot, DollarSign, TrendingUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface StatsCardsProps {
  userId: string;
}

export function StatsCards({ userId }: StatsCardsProps) {
  const { data: ideas = [] } = useQuery({
    queryKey: ["/api/ideas", { userId }],
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ["/api/agent-tasks", { userId }],
  });

  const completedTasks = Array.isArray(tasks) ? tasks.filter((task: any) => task.status === "completed").length : 0;
  const successRate = Array.isArray(tasks) && tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

  const stats = [
    {
      title: "Active Ideas",
      value: Array.isArray(ideas) ? ideas.length : 0,
      icon: Lightbulb,
      change: "+8%",
      changeType: "positive",
      bgColor: "bg-primary-100",
      iconColor: "text-primary-600",
    },
    {
      title: "AI Tasks Completed",
      value: completedTasks,
      icon: Bot,
      change: "+23%",
      changeType: "positive",
      bgColor: "bg-purple-100",
      iconColor: "text-purple-600",
    },
    {
      title: "Revenue Generated",
      value: "$0",
      icon: DollarSign,
      change: "+15%",
      changeType: "positive",
      bgColor: "bg-green-100",
      iconColor: "text-green-600",
    },
    {
      title: "Success Rate",
      value: `${successRate}%`,
      icon: TrendingUp,
      change: "+2%",
      changeType: "positive",
      bgColor: "bg-blue-100",
      iconColor: "text-blue-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat) => (
        <Card key={stat.title} className="border-slate-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">{stat.title}</p>
                <p className="text-3xl font-bold text-slate-800">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                <stat.icon className={`${stat.iconColor} h-6 w-6`} />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-green-500 font-medium">{stat.change}</span>
              <span className="text-slate-500 ml-1">from last week</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
