import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Lightbulb, 
  Bot,
  Calendar,
  DollarSign,
  Activity,
  Download,
  RefreshCw
} from "lucide-react";

// Mock user data
const mockUser = {
  id: "user123",
  name: "John Doe",
  email: "john@example.com",
  plan: "Pro Plan",
};

export default function AnalyticsEnhancedPage() {
  const [timeRange, setTimeRange] = useState("7d");

  // Mock analytics data
  const mockAnalytics = {
    overview: {
      totalIdeas: 47,
      totalTasks: 89,
      activeWebhooks: 5,
      successRate: 94.2
    },
    ideaMetrics: {
      categories: [
        { name: "Technology", count: 18, percentage: 38.3 },
        { name: "Health", count: 12, percentage: 25.5 },
        { name: "Finance", count: 9, percentage: 19.1 },
        { name: "Education", count: 8, percentage: 17.0 }
      ],
      tones: [
        { name: "Professional", count: 23, percentage: 48.9 },
        { name: "Casual", count: 15, percentage: 31.9 },
        { name: "Creative", count: 9, percentage: 19.1 }
      ]
    },
    agentActivity: [
      { name: "Brand Kit Agent", tasks: 24, avgTime: 45, successRate: 95.8 },
      { name: "Content Kit Agent", tasks: 31, avgTime: 32, successRate: 96.8 },
      { name: "SEO Site Generator", tasks: 18, avgTime: 67, successRate: 88.9 },
      { name: "Product Mockup Agent", tasks: 16, avgTime: 52, successRate: 93.8 }
    ],
    webhookActivity: [
      { event: "idea.created", count: 47, successRate: 97.9 },
      { event: "brandkit.generated", count: 24, successRate: 95.8 },
      { event: "contentkit.generated", count: 31, successRate: 96.8 },
      { event: "agent.task.completed", count: 89, successRate: 94.4 }
    ],
    timeSeriesData: [
      { date: "Jan 22", ideas: 5, tasks: 8, webhooks: 12 },
      { date: "Jan 23", ideas: 7, tasks: 11, webhooks: 18 },
      { date: "Jan 24", ideas: 4, tasks: 6, webhooks: 10 },
      { date: "Jan 25", ideas: 9, tasks: 15, webhooks: 24 },
      { date: "Jan 26", ideas: 6, tasks: 12, webhooks: 18 },
      { date: "Jan 27", ideas: 8, tasks: 19, webhooks: 27 },
      { date: "Jan 28", ideas: 8, tasks: 18, webhooks: 26 }
    ]
  };

  const exportAnalytics = () => {
    const csvContent = [
      ["Metric", "Value"],
      ["Total Ideas", mockAnalytics.overview.totalIdeas],
      ["Total Tasks", mockAnalytics.overview.totalTasks],
      ["Active Webhooks", mockAnalytics.overview.activeWebhooks],
      ["Success Rate", `${mockAnalytics.overview.successRate}%`],
      [""],
      ["Agent Performance"],
      ...mockAnalytics.agentActivity.map(agent => [agent.name, `${agent.tasks} tasks, ${agent.successRate}% success`])
    ].map(row => row.join(",")).join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analytics-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar user={mockUser} />
      
      <div className="lg:pl-64 flex flex-col flex-1">
        <Topbar title="Analytics Dashboard" />
        
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 page-transition">
            <div className="max-w-6xl mx-auto space-y-8">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-slate-800">Enhanced Analytics</h1>
                  <p className="text-slate-600">Track your idea generation, AI agent performance, and automation workflows</p>
                </div>
                <div className="flex items-center space-x-3">
                  <Select value={timeRange} onValueChange={setTimeRange}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="24h">Last 24 Hours</SelectItem>
                      <SelectItem value="7d">Last 7 Days</SelectItem>
                      <SelectItem value="30d">Last 30 Days</SelectItem>
                      <SelectItem value="90d">Last 3 Months</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="sm" onClick={exportAnalytics}>
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>

              {/* Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-600">Total Ideas</p>
                        <p className="text-3xl font-bold text-slate-900">{mockAnalytics.overview.totalIdeas}</p>
                        <p className="text-sm text-green-600 flex items-center mt-2">
                          <TrendingUp className="h-4 w-4 mr-1" />
                          +12% from last week
                        </p>
                      </div>
                      <Lightbulb className="h-8 w-8 text-yellow-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-600">AI Tasks</p>
                        <p className="text-3xl font-bold text-slate-900">{mockAnalytics.overview.totalTasks}</p>
                        <p className="text-sm text-green-600 flex items-center mt-2">
                          <TrendingUp className="h-4 w-4 mr-1" />
                          +23% from last week
                        </p>
                      </div>
                      <Bot className="h-8 w-8 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-600">Active Webhooks</p>
                        <p className="text-3xl font-bold text-slate-900">{mockAnalytics.overview.activeWebhooks}</p>
                        <p className="text-sm text-slate-500 flex items-center mt-2">
                          <Activity className="h-4 w-4 mr-1" />
                          Zapier integrations
                        </p>
                      </div>
                      <Activity className="h-8 w-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-600">Success Rate</p>
                        <p className="text-3xl font-bold text-slate-900">{mockAnalytics.overview.successRate}%</p>
                        <p className="text-sm text-green-600 flex items-center mt-2">
                          <TrendingUp className="h-4 w-4 mr-1" />
                          +2.1% improvement
                        </p>
                      </div>
                      <BarChart3 className="h-8 w-8 text-purple-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Idea Breakdown */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Ideas by Category</CardTitle>
                    <CardDescription>Distribution of your business ideas across different categories</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {mockAnalytics.ideaMetrics.categories.map((category, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">{category.name}</span>
                          <span className="text-sm text-slate-600">{category.count} ideas ({category.percentage}%)</span>
                        </div>
                        <Progress value={category.percentage} className="h-2" />
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Ideas by Tone</CardTitle>
                    <CardDescription>Tone distribution of your generated ideas</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {mockAnalytics.ideaMetrics.tones.map((tone, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">{tone.name}</span>
                          <span className="text-sm text-slate-600">{tone.count} ideas ({tone.percentage}%)</span>
                        </div>
                        <Progress value={tone.percentage} className="h-2" />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Agent Performance */}
              <Card>
                <CardHeader>
                  <CardTitle>AI Agent Performance</CardTitle>
                  <CardDescription>Performance metrics for each AI agent</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockAnalytics.agentActivity.map((agent, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium">{agent.name}</h4>
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            {agent.successRate}% Success
                          </Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-slate-600">Tasks Completed</p>
                            <p className="font-semibold text-lg">{agent.tasks}</p>
                          </div>
                          <div>
                            <p className="text-slate-600">Avg Response Time</p>
                            <p className="font-semibold text-lg">{agent.avgTime}s</p>
                          </div>
                          <div>
                            <p className="text-slate-600">Success Rate</p>
                            <p className="font-semibold text-lg">{agent.successRate}%</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Webhook Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Webhook Activity</CardTitle>
                  <CardDescription>Zapier webhook triggers and success rates</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockAnalytics.webhookActivity.map((webhook, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <h4 className="font-medium">
                            {webhook.event.replace(/\./g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </h4>
                          <p className="text-sm text-slate-600">{webhook.count} triggers</p>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            {webhook.successRate}% Success
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Activity Timeline */}
              <Card>
                <CardHeader>
                  <CardTitle>Activity Timeline</CardTitle>
                  <CardDescription>Daily activity across ideas, tasks, and webhooks</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockAnalytics.timeSeriesData.map((day, index) => (
                      <div key={index} className="grid grid-cols-4 gap-4 p-3 border rounded-lg">
                        <div className="font-medium">{day.date}</div>
                        <div className="text-center">
                          <p className="text-sm text-slate-600">Ideas</p>
                          <p className="font-semibold">{day.ideas}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-slate-600">Tasks</p>
                          <p className="font-semibold">{day.tasks}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-slate-600">Webhooks</p>
                          <p className="font-semibold">{day.webhooks}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}