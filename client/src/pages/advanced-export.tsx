import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { 
  Download, 
  FileText,
  Image,
  Globe,
  Code,
  Share2,
  Settings,
  Clock,
  CheckCircle,
  AlertCircle,
  Zap,
  Database,
  Upload,
  ExternalLink
} from "lucide-react";

// Mock user data
const mockUser = {
  id: "user123", 
  name: "John Doe",
  email: "john@example.com",
  plan: "Pro Plan",
};

interface ExportFormat {
  id: string;
  name: string;
  description: string;
  icon: any;
  fileExtension: string;
  category: "document" | "presentation" | "web" | "data" | "integration";
  premium: boolean;
  supports: string[];
}

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: string;
  status: "connected" | "disconnected" | "error";
  category: "productivity" | "storage" | "communication" | "development";
  features: string[];
}

interface ExportJob {
  id: string;
  type: string;
  format: string;
  status: "pending" | "processing" | "completed" | "failed";
  progress: number;
  createdAt: string;
  completedAt?: string;
  downloadUrl?: string;
  error?: string;
}

export default function AdvancedExportPage() {
  const [selectedFormat, setSelectedFormat] = useState("pdf");
  const [selectedIntegration, setSelectedIntegration] = useState("");
  const [exportSettings, setExportSettings] = useState({
    includeImages: true,
    includeComments: false,
    includeMetadata: true,
    template: "professional"
  });
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Mock export formats
  const mockFormats: ExportFormat[] = [
    {
      id: "pdf",
      name: "PDF Document",
      description: "Professional PDF with formatting and images",
      icon: <FileText className="h-5 w-5" />,
      fileExtension: ".pdf",
      category: "document",
      premium: false,
      supports: ["ideas", "brand-kits", "content", "analytics"]
    },
    {
      id: "docx",
      name: "Microsoft Word",
      description: "Editable Word document with full formatting",
      icon: <FileText className="h-5 w-5" />,
      fileExtension: ".docx",
      category: "document", 
      premium: false,
      supports: ["ideas", "content", "reports"]
    },
    {
      id: "pptx",
      name: "PowerPoint Presentation",
      description: "Investor pitch deck with professional templates",
      icon: <Image className="h-5 w-5" />,
      fileExtension: ".pptx",
      category: "presentation",
      premium: true,
      supports: ["ideas", "brand-kits", "pitch-decks"]
    },
    {
      id: "html",
      name: "Static Website",
      description: "Responsive HTML website with CSS styling",
      icon: <Globe className="h-5 w-5" />,
      fileExtension: ".zip",
      category: "web",
      premium: true,
      supports: ["ideas", "brand-kits", "landing-pages"]
    },
    {
      id: "json",
      name: "JSON Data",
      description: "Structured data for API integration",
      icon: <Code className="h-5 w-5" />,
      fileExtension: ".json",
      category: "data",
      premium: false,
      supports: ["ideas", "analytics", "webhooks"]
    },
    {
      id: "csv",
      name: "CSV Spreadsheet", 
      description: "Tabular data for analysis and reporting",
      icon: <Database className="h-5 w-5" />,
      fileExtension: ".csv",
      category: "data",
      premium: false,
      supports: ["analytics", "user-data", "export-logs"]
    }
  ];

  // Mock integrations
  const mockIntegrations: Integration[] = [
    {
      id: "notion",
      name: "Notion",
      description: "Export directly to Notion workspace",
      icon: "📝",
      status: "connected",
      category: "productivity",
      features: ["Create pages", "Update databases", "Sync content"]
    },
    {
      id: "github",
      name: "GitHub",
      description: "Create repositories and documentation",
      icon: "🐙",
      status: "connected", 
      category: "development",
      features: ["Create repos", "Push code", "Generate README"]
    },
    {
      id: "drive",
      name: "Google Drive",
      description: "Save files to Google Drive folders",
      icon: "📁",
      status: "disconnected",
      category: "storage",
      features: ["Auto-sync", "Folder organization", "Share links"]
    },
    {
      id: "slack",
      name: "Slack",
      description: "Share content with team channels",
      icon: "💬",
      status: "disconnected",
      category: "communication",
      features: ["Channel posting", "Direct messages", "File sharing"]
    },
    {
      id: "airtable",
      name: "Airtable",
      description: "Create and update Airtable bases",
      icon: "📊",
      status: "error",
      category: "productivity", 
      features: ["Create records", "Update fields", "Sync data"]
    }
  ];

  // Mock export jobs
  const mockJobs: ExportJob[] = [
    {
      id: "1",
      type: "AI-Powered Fitness App",
      format: "PDF Document",
      status: "completed",
      progress: 100,
      createdAt: "2025-01-28T19:30:00Z",
      completedAt: "2025-01-28T19:32:00Z",
      downloadUrl: "/downloads/fitness-app-idea.pdf"
    },
    {
      id: "2", 
      type: "Brand Kit Collection",
      format: "PowerPoint Presentation",
      status: "processing",
      progress: 65,
      createdAt: "2025-01-28T19:28:00Z"
    },
    {
      id: "3",
      type: "Analytics Report",
      format: "CSV Spreadsheet", 
      status: "failed",
      progress: 0,
      createdAt: "2025-01-28T19:25:00Z",
      error: "Missing data permissions"
    }
  ];

  // Export mutation
  const exportMutation = useMutation({
    mutationFn: async (exportData: any) => {
      const response = await fetch("/api/export/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(exportData),
      });
      if (!response.ok) throw new Error("Failed to create export");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/export/jobs"] });
      toast({
        title: "Export started",
        description: "Your content is being prepared for download.",
      });
    },
    onError: () => {
      toast({
        title: "Export failed",
        description: "Unable to start export. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Connect integration mutation
  const connectIntegrationMutation = useMutation({
    mutationFn: async (integrationId: string) => {
      const response = await fetch(`/api/integrations/${integrationId}/connect`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error("Failed to connect integration");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/integrations"] });
      toast({
        title: "Integration connected",
        description: "Successfully connected to the service.",
      });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800 border-green-300";
      case "processing": return "bg-blue-100 text-blue-800 border-blue-300";
      case "pending": return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "failed": return "bg-red-100 text-red-800 border-red-300";
      default: return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return <CheckCircle className="h-4 w-4" />;
      case "processing": return <Clock className="h-4 w-4" />;
      case "pending": return <Clock className="h-4 w-4" />;
      case "failed": return <AlertCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getIntegrationStatusColor = (status: string) => {
    switch (status) {
      case "connected": return "bg-green-100 text-green-800 border-green-300";
      case "disconnected": return "bg-gray-100 text-gray-800 border-gray-300";
      case "error": return "bg-red-100 text-red-800 border-red-300";
      default: return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const handleExport = () => {
    const exportData = {
      format: selectedFormat,
      integration: selectedIntegration,
      settings: exportSettings,
      content: ["selected-ideas", "brand-kits"] // Mock selection
    };
    exportMutation.mutate(exportData);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar user={mockUser} />
      
      <div className="lg:pl-64 flex flex-col flex-1">
        <Topbar title="Advanced Export & Integrations" />
        
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 page-transition">
            <div className="max-w-6xl mx-auto space-y-6">
              {/* Header */}
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                    <Download className="h-6 w-6 text-white" />
                  </div>
                  <h1 className="text-3xl font-bold text-slate-800">Advanced Export & Integrations</h1>
                </div>
                <p className="text-lg text-slate-600 max-w-3xl mx-auto">
                  Export your content in multiple formats and integrate directly with popular productivity tools and platforms.
                </p>
              </div>

              {/* Export Formats */}
              <Card>
                <CardHeader>
                  <CardTitle>Export Formats</CardTitle>
                  <CardDescription>Choose how you want to export your content</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {mockFormats.map((format) => (
                      <div
                        key={format.id}
                        onClick={() => setSelectedFormat(format.id)}
                        className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                          selectedFormat === format.id ? "border-blue-500 bg-blue-50" : "border-gray-200"
                        }`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            {format.icon}
                            <div>
                              <h4 className="font-medium">{format.name}</h4>
                              <p className="text-sm text-slate-600">{format.description}</p>
                            </div>
                          </div>
                          {format.premium && (
                            <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                              Pro
                            </Badge>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {format.supports.slice(0, 3).map((support, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {support}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Export Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Export Settings</CardTitle>
                  <CardDescription>Customize your export preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-medium">Content Options</h4>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            checked={exportSettings.includeImages}
                            onCheckedChange={(checked) => 
                              setExportSettings({...exportSettings, includeImages: !!checked})
                            }
                          />
                          <Label>Include images and media</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            checked={exportSettings.includeComments}
                            onCheckedChange={(checked) => 
                              setExportSettings({...exportSettings, includeComments: !!checked})
                            }
                          />
                          <Label>Include comments and annotations</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            checked={exportSettings.includeMetadata}
                            onCheckedChange={(checked) => 
                              setExportSettings({...exportSettings, includeMetadata: !!checked})
                            }
                          />
                          <Label>Include metadata and timestamps</Label>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h4 className="font-medium">Template Style</h4>
                      <Select 
                        value={exportSettings.template} 
                        onValueChange={(value) => setExportSettings({...exportSettings, template: value})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="professional">Professional</SelectItem>
                          <SelectItem value="modern">Modern</SelectItem>
                          <SelectItem value="minimal">Minimal</SelectItem>
                          <SelectItem value="creative">Creative</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-end space-x-3">
                    <Button variant="outline">Preview Export</Button>
                    <Button onClick={handleExport} disabled={exportMutation.isPending}>
                      <Download className="h-4 w-4 mr-2" />
                      {exportMutation.isPending ? "Exporting..." : "Start Export"}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Platform Integrations */}
              <Card>
                <CardHeader>
                  <CardTitle>Platform Integrations</CardTitle>
                  <CardDescription>Connect with popular productivity tools and platforms</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {mockIntegrations.map((integration) => (
                      <div key={integration.id} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <span className="text-2xl">{integration.icon}</span>
                            <div>
                              <h4 className="font-medium">{integration.name}</h4>
                              <p className="text-sm text-slate-600">{integration.description}</p>
                            </div>
                          </div>
                          <Badge variant="outline" className={getIntegrationStatusColor(integration.status)}>
                            {integration.status}
                          </Badge>
                        </div>
                        
                        <div className="space-y-2 mb-4">
                          <h5 className="font-medium text-sm">Features:</h5>
                          <div className="flex flex-wrap gap-1">
                            {integration.features.map((feature, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {feature}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          {integration.status === "connected" ? (
                            <div className="flex items-center space-x-2">
                              <Button variant="outline" size="sm">
                                <Settings className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm">
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <Button 
                              size="sm"
                              onClick={() => connectIntegrationMutation.mutate(integration.id)}
                              disabled={connectIntegrationMutation.isPending}
                            >
                              <Zap className="h-4 w-4 mr-2" />
                              Connect
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Export History */}
              <Card>
                <CardHeader>
                  <CardTitle>Export History</CardTitle>
                  <CardDescription>Track your recent exports and downloads</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockJobs.map((job) => (
                      <div key={job.id} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h4 className="font-medium">{job.type}</h4>
                              <Badge variant="outline" className={getStatusColor(job.status)}>
                                <div className="flex items-center space-x-1">
                                  {getStatusIcon(job.status)}
                                  <span>{job.status}</span>
                                </div>
                              </Badge>
                            </div>
                            <p className="text-sm text-slate-600 mb-2">{job.format}</p>
                            
                            {job.status === "processing" && (
                              <div className="space-y-1">
                                <div className="flex items-center justify-between text-sm">
                                  <span>Progress</span>
                                  <span>{job.progress}%</span>
                                </div>
                                <Progress value={job.progress} className="h-2" />
                              </div>
                            )}
                            
                            {job.error && (
                              <p className="text-sm text-red-600 mt-2">{job.error}</p>
                            )}
                            
                            <p className="text-xs text-slate-500 mt-2">
                              Created: {formatTimestamp(job.createdAt)}
                              {job.completedAt && (
                                <span> • Completed: {formatTimestamp(job.completedAt)}</span>
                              )}
                            </p>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            {job.status === "completed" && job.downloadUrl && (
                              <Button variant="outline" size="sm">
                                <Download className="h-4 w-4 mr-2" />
                                Download
                              </Button>
                            )}
                            {job.status === "failed" && (
                              <Button variant="outline" size="sm">
                                <Upload className="h-4 w-4 mr-2" />
                                Retry
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Frequently used export and integration shortcuts</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Button variant="outline" className="h-20 flex-col">
                      <FileText className="h-6 w-6 mb-2" />
                      <span>Export to PDF</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex-col">
                      <Share2 className="h-6 w-6 mb-2" />
                      <span>Share to Notion</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex-col">
                      <Database className="h-6 w-6 mb-2" />
                      <span>Export Analytics</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex-col">
                      <Code className="h-6 w-6 mb-2" />
                      <span>Generate Code</span>
                    </Button>
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