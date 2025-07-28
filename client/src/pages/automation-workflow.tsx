import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  Zap, 
  Plus,
  Play,
  GitBranch,
  Settings,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Share2,
  Database,
  Mail,
  MessageSquare
} from "lucide-react";

const mockUser = {
  id: "user123",
  name: "John Doe",
  email: "john@example.com",
  plan: "Pro Plan",
};

export default function AutomationWorkflowPage() {
  const [showBuilder, setShowBuilder] = useState(false);
  
  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar user={mockUser} />
      
      <div className="lg:pl-64 flex flex-col flex-1">
        <Topbar title="Advanced Automation & Workflow Engine" />
        
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 page-transition">
            <div className="max-w-6xl mx-auto space-y-6">
              {/* Header */}
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                    <Zap className="h-6 w-6 text-white" />
                  </div>
                  <h1 className="text-3xl font-bold text-slate-800">Advanced Automation & Workflow Engine</h1>
                </div>
                <p className="text-lg text-slate-600 max-w-3xl mx-auto">
                  Create powerful automation workflows with visual builder, conditional logic, and multi-step sequences.
                </p>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-600">Active Workflows</p>
                        <p className="text-2xl font-bold">12</p>
                      </div>
                      <GitBranch className="h-6 w-6 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-600">Executions Today</p>
                        <p className="text-2xl font-bold">247</p>
                      </div>
                      <Play className="h-6 w-6 text-green-500" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-600">Success Rate</p>
                        <p className="text-2xl font-bold">98.5%</p>
                      </div>
                      <CheckCircle className="h-6 w-6 text-green-500" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-600">Time Saved</p>
                        <p className="text-2xl font-bold">43h</p>
                      </div>
                      <Clock className="h-6 w-6 text-purple-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Workflow Builder */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center space-x-2">
                        <GitBranch className="h-5 w-5 text-blue-500" />
                        <span>Visual Workflow Builder</span>
                      </CardTitle>
                      <CardDescription>Create automated workflows with drag-and-drop interface</CardDescription>
                    </div>
                    <Button onClick={() => setShowBuilder(!showBuilder)}>
                      <Plus className="h-4 w-4 mr-2" />
                      New Workflow
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {showBuilder ? (
                    <div className="min-h-96 border-2 border-dashed border-slate-300 rounded-lg p-8 text-center bg-slate-50">
                      <div className="space-y-4">
                        <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mx-auto">
                          <GitBranch className="h-8 w-8 text-blue-500" />
                        </div>
                        <h3 className="text-lg font-medium">Workflow Canvas</h3>
                        <p className="text-slate-600 max-w-md mx-auto">
                          Drag and drop components to build your automation workflow. Connect triggers, conditions, and actions.
                        </p>
                        <div className="flex justify-center space-x-4">
                          <Button variant="outline">Add Trigger</Button>
                          <Button variant="outline">Add Condition</Button>
                          <Button variant="outline">Add Action</Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <GitBranch className="h-16 w-16 mx-auto mb-4 text-slate-400" />
                      <h3 className="text-lg font-medium mb-2">No Active Workflow Builder</h3>
                      <p className="text-slate-600 mb-4">Click "New Workflow" to start building automated processes</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Active Workflows */}
              <Card>
                <CardHeader>
                  <CardTitle>Active Workflows</CardTitle>
                  <CardDescription>Manage your automated business processes</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      {
                        name: "New Idea → Slack Notification",
                        description: "Automatically notify team when new ideas are created",
                        trigger: "Idea Created",
                        actions: ["Send Slack Message", "Update Airtable"],
                        status: "active",
                        executions: 23,
                        lastRun: "2 hours ago"
                      },
                      {
                        name: "AI Task Complete → Email Client",
                        description: "Send email to client when AI agent completes task",
                        trigger: "Agent Task Complete",
                        actions: ["Send Email", "Update CRM"],
                        status: "active",
                        executions: 156,
                        lastRun: "15 minutes ago"
                      },
                      {
                        name: "Weekly Idea Report",
                        description: "Generate and send weekly idea summary report",
                        trigger: "Schedule: Every Monday",
                        actions: ["Generate Report", "Send Email", "Upload to Drive"],
                        status: "paused",
                        executions: 8,
                        lastRun: "6 days ago"
                      }
                    ].map((workflow, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-medium">{workflow.name}</h4>
                            <p className="text-sm text-slate-600 mt-1">{workflow.description}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className={
                              workflow.status === "active" ? "bg-green-100 text-green-800 border-green-300" :
                              workflow.status === "paused" ? "bg-yellow-100 text-yellow-800 border-yellow-300" :
                              "bg-gray-100 text-gray-800 border-gray-300"
                            }>
                              {workflow.status}
                            </Badge>
                            <Switch checked={workflow.status === "active"} />
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 mb-3 text-sm">
                          <Badge variant="outline" className="bg-blue-50 text-blue-700">
                            {workflow.trigger}
                          </Badge>
                          <ArrowRight className="h-3 w-3 text-slate-400" />
                          {workflow.actions.map((action, actionIndex) => (
                            <Badge key={actionIndex} variant="outline" className="bg-purple-50 text-purple-700">
                              {action}
                            </Badge>
                          ))}
                        </div>
                        
                        <div className="flex items-center justify-between text-sm text-slate-600">
                          <span>{workflow.executions} executions • Last run: {workflow.lastRun}</span>
                          <div className="flex items-center space-x-2">
                            <Button variant="outline" size="sm">
                              <Settings className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Play className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Workflow Templates */}
              <Card>
                <CardHeader>
                  <CardTitle>Workflow Templates</CardTitle>
                  <CardDescription>Pre-built automation templates for common use cases</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      {
                        name: "Client Onboarding",
                        description: "Automate new client setup and welcome sequence",
                        icon: <Mail className="h-5 w-5" />,
                        category: "CRM",
                        actions: ["Send Welcome Email", "Create Project", "Schedule Call"]
                      },
                      {
                        name: "Lead Qualification",
                        description: "Score and route leads based on criteria",
                        icon: <Database className="h-5 w-5" />,
                        category: "Sales",
                        actions: ["Score Lead", "Assign Rep", "Send Follow-up"]
                      },
                      {
                        name: "Content Publishing",
                        description: "Automatically publish content across channels",
                        icon: <Share2 className="h-5 w-5" />,
                        category: "Marketing",
                        actions: ["Post to Social", "Update Blog", "Send Newsletter"]
                      },
                      {
                        name: "Support Escalation",
                        description: "Escalate support tickets based on urgency",
                        icon: <MessageSquare className="h-5 w-5" />,
                        category: "Support",
                        actions: ["Check Priority", "Assign Agent", "Notify Manager"]
                      }
                    ].map((template, index) => (
                      <div key={index} className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer">
                        <div className="flex items-start space-x-3 mb-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            {template.icon}
                          </div>
                          <div>
                            <h4 className="font-medium">{template.name}</h4>
                            <p className="text-sm text-slate-600">{template.description}</p>
                          </div>
                        </div>
                        
                        <div className="space-y-2 mb-4">
                          <Badge variant="outline" className="text-xs">
                            {template.category}
                          </Badge>
                          <div className="flex flex-wrap gap-1">
                            {template.actions.map((action, actionIndex) => (
                              <Badge key={actionIndex} variant="outline" className="text-xs bg-slate-50">
                                {action}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        <Button variant="outline" size="sm" className="w-full">
                          Use Template
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Integration Connections */}
              <Card>
                <CardHeader>
                  <CardTitle>External Integrations</CardTitle>
                  <CardDescription>Connect external services for workflow actions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { name: "Slack", icon: "💬", status: "connected" },
                      { name: "Gmail", icon: "📧", status: "connected" },
                      { name: "Airtable", icon: "📊", status: "disconnected" },
                      { name: "Notion", icon: "📝", status: "connected" },
                      { name: "HubSpot", icon: "🎯", status: "disconnected" },
                      { name: "Calendly", icon: "📅", status: "disconnected" },
                      { name: "Stripe", icon: "💳", status: "connected" },
                      { name: "GitHub", icon: "🐙", status: "connected" }
                    ].map((integration, index) => (
                      <div key={index} className="p-3 border rounded-lg text-center">
                        <div className="text-2xl mb-2">{integration.icon}</div>
                        <h4 className="font-medium text-sm">{integration.name}</h4>
                        <Badge variant="outline" className={`text-xs mt-1 ${
                          integration.status === "connected" 
                            ? "bg-green-100 text-green-800 border-green-300"
                            : "bg-gray-100 text-gray-800 border-gray-300"
                        }`}>
                          {integration.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Workflow Analytics */}
              <Card>
                <CardHeader>
                  <CardTitle>Workflow Analytics</CardTitle>
                  <CardDescription>Performance metrics and optimization insights</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600 mb-1">2,847</div>
                      <div className="text-sm text-slate-600">Total Executions</div>
                      <div className="text-xs text-green-600">↗ +12% this week</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600 mb-1">98.5%</div>
                      <div className="text-sm text-slate-600">Success Rate</div>
                      <div className="text-xs text-green-600">↗ +0.3% improvement</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-purple-600 mb-1">43h</div>
                      <div className="text-sm text-slate-600">Time Saved</div>
                      <div className="text-xs text-purple-600">This month</div>
                    </div>
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