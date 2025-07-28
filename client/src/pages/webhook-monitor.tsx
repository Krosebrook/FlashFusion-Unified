import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Activity, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Search,
  Filter,
  Download,
  RefreshCw,
  AlertTriangle,
  BarChart3
} from "lucide-react";

// Mock user data
const mockUser = {
  id: "user123",
  name: "John Doe",
  email: "john@example.com",
  plan: "Pro Plan",
};

interface WebhookLog {
  id: string;
  event: string;
  url: string;
  status: "success" | "failed" | "pending";
  timestamp: string;
  responseTime: number;
  httpStatus?: number;
  errorMessage?: string;
  payload: any;
  retryCount: number;
}

export default function WebhookMonitorPage() {
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [timeRange, setTimeRange] = useState("24h");
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Mock webhook logs data
  const mockLogs: WebhookLog[] = [
    {
      id: "1",
      event: "idea.created",
      url: "https://hooks.zapier.com/hooks/catch/123/abc",
      status: "success",
      timestamp: "2025-01-28T19:30:00Z",
      responseTime: 245,
      httpStatus: 200,
      payload: { ideaId: "idea123", title: "AI-Powered Fitness App" },
      retryCount: 0
    },
    {
      id: "2",
      event: "brandkit.generated",
      url: "https://hooks.zapier.com/hooks/catch/456/def",
      status: "failed",
      timestamp: "2025-01-28T19:25:00Z",
      responseTime: 5000,
      httpStatus: 500,
      errorMessage: "Connection timeout",
      payload: { taskId: "task456", agentName: "Brand Kit Agent" },
      retryCount: 2
    },
    {
      id: "3",
      event: "contentkit.generated",
      url: "https://hooks.zapier.com/hooks/catch/789/ghi",
      status: "success",
      timestamp: "2025-01-28T19:20:00Z",
      responseTime: 312,
      httpStatus: 200,
      payload: { taskId: "task789", content: "Generated marketing content..." },
      retryCount: 0
    },
    {
      id: "4",
      event: "idea.updated",
      url: "https://hooks.zapier.com/hooks/catch/123/abc",
      status: "pending",
      timestamp: "2025-01-28T19:35:00Z",
      responseTime: 0,
      payload: { ideaId: "idea124", changes: { title: "Updated title" } },
      retryCount: 0
    }
  ];

  // Fetch webhook logs (using mock data for now)
  const { data: logsData } = useQuery({
    queryKey: ["/api/zapier/logs", filter, timeRange],
    queryFn: () => Promise.resolve({ logs: mockLogs }),
    refetchInterval: autoRefresh ? 5000 : false,
  });

  // Fetch webhook statistics
  const { data: statsData } = useQuery({
    queryKey: ["/api/zapier/stats", timeRange],
    queryFn: () => Promise.resolve({
      total: 156,
      successful: 143,
      failed: 13,
      averageResponseTime: 287,
      successRate: 91.7
    }),
    refetchInterval: autoRefresh ? 30000 : false,
  });

  const logs = logsData?.logs || [];
  const stats = statsData || {};

  const filteredLogs = logs.filter(log => {
    const matchesFilter = filter === "all" || log.status === filter;
    const matchesSearch = log.event.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.url.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success": return "bg-green-100 text-green-800 border-green-200";
      case "failed": return "bg-red-100 text-red-800 border-red-200";
      case "pending": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success": return <CheckCircle className="h-4 w-4" />;
      case "failed": return <XCircle className="h-4 w-4" />;
      case "pending": return <Clock className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const exportLogs = () => {
    const csvContent = [
      ["Event", "URL", "Status", "Timestamp", "Response Time", "HTTP Status", "Retry Count"].join(","),
      ...filteredLogs.map(log => [
        log.event,
        log.url,
        log.status,
        log.timestamp,
        log.responseTime,
        log.httpStatus || "",
        log.retryCount
      ].join(","))
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `webhook-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar user={mockUser} />
      
      <div className="lg:pl-64 flex flex-col flex-1">
        <Topbar title="Webhook Monitor" />
        
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 page-transition">
            <div className="max-w-7xl mx-auto space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-slate-800">Webhook Monitor</h1>
                  <p className="text-slate-600">Track and monitor your Zapier webhook deliveries</p>
                </div>
                <div className="flex items-center space-x-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAutoRefresh(!autoRefresh)}
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
                    {autoRefresh ? 'Auto Refresh On' : 'Auto Refresh Off'}
                  </Button>
                  <Button variant="outline" size="sm" onClick={exportLogs}>
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>

              {/* Statistics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <Activity className="h-5 w-5 text-blue-500" />
                      <div>
                        <p className="text-sm font-medium">Total Webhooks</p>
                        <p className="text-2xl font-bold">{stats.total || 0}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <div>
                        <p className="text-sm font-medium">Successful</p>
                        <p className="text-2xl font-bold text-green-600">{stats.successful || 0}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <XCircle className="h-5 w-5 text-red-500" />
                      <div>
                        <p className="text-sm font-medium">Failed</p>
                        <p className="text-2xl font-bold text-red-600">{stats.failed || 0}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <BarChart3 className="h-5 w-5 text-purple-500" />
                      <div>
                        <p className="text-sm font-medium">Success Rate</p>
                        <p className="text-2xl font-bold">{stats.successRate || 0}%</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-5 w-5 text-orange-500" />
                      <div>
                        <p className="text-sm font-medium">Avg Response</p>
                        <p className="text-2xl font-bold">{stats.averageResponseTime || 0}ms</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Filters */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center space-x-2">
                      <Label htmlFor="search">Search</Label>
                      <div className="relative">
                        <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                        <Input
                          id="search"
                          placeholder="Search events or URLs..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 w-64"
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Label htmlFor="status-filter">Status</Label>
                      <Select value={filter} onValueChange={setFilter}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All</SelectItem>
                          <SelectItem value="success">Success</SelectItem>
                          <SelectItem value="failed">Failed</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Label htmlFor="time-range">Time Range</Label>
                      <Select value={timeRange} onValueChange={setTimeRange}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1h">Last Hour</SelectItem>
                          <SelectItem value="24h">Last 24 Hours</SelectItem>
                          <SelectItem value="7d">Last 7 Days</SelectItem>
                          <SelectItem value="30d">Last 30 Days</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Webhook Logs */}
              <Card>
                <CardHeader>
                  <CardTitle>Webhook Delivery Logs</CardTitle>
                  <CardDescription>
                    Real-time monitoring of webhook deliveries to your Zapier workflows
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {filteredLogs.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                      <Activity className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                      <p className="text-lg font-medium">No webhook logs found</p>
                      <p>Try adjusting your filters or create some webhook activity</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredLogs.map((log) => (
                        <div key={log.id} className="p-4 border rounded-lg hover:bg-slate-50 transition-colors">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center space-x-3">
                                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                  {log.event.replace(/\./g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                </Badge>
                                <Badge variant="outline" className={getStatusColor(log.status)}>
                                  <div className="flex items-center space-x-1">
                                    {getStatusIcon(log.status)}
                                    <span>{log.status.charAt(0).toUpperCase() + log.status.slice(1)}</span>
                                  </div>
                                </Badge>
                                {log.retryCount > 0 && (
                                  <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                                    Retry {log.retryCount}
                                  </Badge>
                                )}
                              </div>
                              
                              <div className="text-sm text-slate-600">
                                <p><strong>URL:</strong> {log.url}</p>
                                <p><strong>Time:</strong> {formatTimestamp(log.timestamp)}</p>
                                {log.status !== "pending" && (
                                  <p><strong>Response Time:</strong> {log.responseTime}ms</p>
                                )}
                                {log.httpStatus && (
                                  <p><strong>HTTP Status:</strong> {log.httpStatus}</p>
                                )}
                                {log.errorMessage && (
                                  <p className="text-red-600"><strong>Error:</strong> {log.errorMessage}</p>
                                )}
                              </div>
                            </div>
                            
                            <div className="text-right text-sm text-slate-500">
                              <p>{new Date(log.timestamp).toLocaleTimeString()}</p>
                            </div>
                          </div>
                          
                          <details className="mt-3">
                            <summary className="cursor-pointer text-sm text-blue-600 hover:text-blue-800">
                              View Payload
                            </summary>
                            <pre className="mt-2 p-3 bg-slate-100 rounded text-xs overflow-auto">
                              {JSON.stringify(log.payload, null, 2)}
                            </pre>
                          </details>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}