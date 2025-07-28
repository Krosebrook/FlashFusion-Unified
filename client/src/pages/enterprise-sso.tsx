import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { 
  Shield, 
  Key, 
  Users,
  AlertTriangle,
  CheckCircle,
  Lock,
  Globe,
  Settings,
  Download,
  Upload,
  Eye,
  EyeOff,
  FileText,
  Activity,
  Clock,
  UserCheck
} from "lucide-react";

// Mock user data
const mockUser = {
  id: "user123",
  name: "John Doe",
  email: "john@example.com",
  plan: "Enterprise Plan",
};

interface SSOProvider {
  id: string;
  name: string;
  type: "saml" | "oauth" | "ldap";
  status: "active" | "inactive" | "pending";
  domain: string;
  userCount: number;
  lastSync: string;
  configured: boolean;
}

interface SecurityPolicy {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  severity: "low" | "medium" | "high" | "critical";
}

interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: string;
  resource: string;
  ipAddress: string;
  userAgent: string;
  result: "success" | "failure";
}

export default function EnterpriseSSOPage() {
  const [activeTab, setActiveTab] = useState("sso");
  const [showSAMLConfig, setShowSAMLConfig] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Mock SSO providers
  const mockProviders: SSOProvider[] = [
    {
      id: "azure-ad",
      name: "Azure Active Directory",
      type: "saml",
      status: "active",
      domain: "company.onmicrosoft.com",
      userCount: 245,
      lastSync: "2025-01-28T19:30:00Z",
      configured: true
    },
    {
      id: "okta",
      name: "Okta",
      type: "saml",
      status: "inactive",
      domain: "company.okta.com",
      userCount: 0,
      lastSync: "Never",
      configured: false
    },
    {
      id: "google-workspace",
      name: "Google Workspace",
      type: "oauth",
      status: "pending",
      domain: "company.com",
      userCount: 12,
      lastSync: "2025-01-28T18:00:00Z",
      configured: true
    }
  ];

  const mockSecurityPolicies: SecurityPolicy[] = [
    {
      id: "password-policy",
      name: "Strong Password Requirements",
      description: "Enforce minimum 12 characters with special characters",
      enabled: true,
      severity: "high"
    },
    {
      id: "mfa-required",
      name: "Multi-Factor Authentication",
      description: "Require MFA for all user accounts",
      enabled: true,
      severity: "critical"
    },
    {
      id: "session-timeout",
      name: "Session Timeout",
      description: "Auto-logout after 8 hours of inactivity",
      enabled: true,
      severity: "medium"
    },
    {
      id: "ip-whitelist",
      name: "IP Address Whitelist",
      description: "Restrict access to approved IP ranges",
      enabled: false,
      severity: "high"
    },
    {
      id: "device-trust",
      name: "Device Trust Requirements",
      description: "Require device registration and approval",
      enabled: false,
      severity: "medium"
    }
  ];

  const mockAuditLogs: AuditLog[] = [
    {
      id: "1",
      timestamp: "2025-01-28T19:30:00Z",
      userId: "user123",
      userName: "John Doe",
      action: "Login",
      resource: "Dashboard",
      ipAddress: "192.168.1.100",
      userAgent: "Chrome/120.0.0.0",
      result: "success"
    },
    {
      id: "2",
      timestamp: "2025-01-28T19:25:00Z",
      userId: "user456",
      userName: "Sarah Wilson",
      action: "Create Idea",
      resource: "AI-Powered Fitness App",
      ipAddress: "10.0.1.50",
      userAgent: "Firefox/121.0.0.0",
      result: "success"
    },
    {
      id: "3",
      timestamp: "2025-01-28T19:20:00Z",
      userId: "user789",
      userName: "Unknown User",
      action: "Failed Login",
      resource: "Authentication",
      ipAddress: "203.0.113.1",
      userAgent: "Chrome/120.0.0.0",
      result: "failure"
    }
  ];

  // Configure SSO mutation
  const configureSSOmutation = useMutation({
    mutationFn: async (config: any) => {
      const response = await fetch("/api/enterprise/sso/configure", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      if (!response.ok) throw new Error("Failed to configure SSO");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/enterprise/sso"] });
      toast({
        title: "SSO configured successfully",
        description: "Single Sign-On has been configured and activated.",
      });
    },
    onError: () => {
      toast({
        title: "Configuration failed",
        description: "Failed to configure SSO. Please check your settings.",
        variant: "destructive",
      });
    },
  });

  const getProviderStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800 border-green-300";
      case "inactive": return "bg-red-100 text-red-800 border-red-300";
      case "pending": return "bg-yellow-100 text-yellow-800 border-yellow-300";
      default: return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "bg-red-100 text-red-800 border-red-300";
      case "high": return "bg-orange-100 text-orange-800 border-orange-300";
      case "medium": return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "low": return "bg-blue-100 text-blue-800 border-blue-300";
      default: return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar user={mockUser} />
      
      <div className="lg:pl-64 flex flex-col flex-1">
        <Topbar title="Enterprise Security & SSO" />
        
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 page-transition">
            <div className="max-w-6xl mx-auto space-y-6">
              {/* Header */}
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl flex items-center justify-center">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                  <h1 className="text-3xl font-bold text-slate-800">Enterprise Security & SSO</h1>
                </div>
                <p className="text-lg text-slate-600 max-w-3xl mx-auto">
                  Manage enterprise security policies, single sign-on providers, and audit compliance for your organization.
                </p>
              </div>

              {/* Security Status Overview */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-600">SSO Providers</p>
                        <p className="text-2xl font-bold">{mockProviders.filter(p => p.status === "active").length}</p>
                      </div>
                      <Key className="h-6 w-6 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-600">Active Users</p>
                        <p className="text-2xl font-bold">{mockProviders.reduce((sum, p) => sum + p.userCount, 0)}</p>
                      </div>
                      <Users className="h-6 w-6 text-green-500" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-600">Security Policies</p>
                        <p className="text-2xl font-bold">{mockSecurityPolicies.filter(p => p.enabled).length}</p>
                      </div>
                      <Lock className="h-6 w-6 text-purple-500" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-600">Compliance</p>
                        <p className="text-2xl font-bold text-green-600">98.5%</p>
                      </div>
                      <CheckCircle className="h-6 w-6 text-green-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Tabs */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex space-x-1 bg-slate-100 p-1 rounded-lg">
                    {[
                      { id: "sso", label: "SSO Providers", icon: <Key className="h-4 w-4" /> },
                      { id: "policies", label: "Security Policies", icon: <Shield className="h-4 w-4" /> },
                      { id: "audit", label: "Audit Logs", icon: <Activity className="h-4 w-4" /> }
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                          activeTab === tab.id
                            ? "bg-white text-blue-600 shadow-sm"
                            : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        {tab.icon}
                        <span>{tab.label}</span>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* SSO Providers Tab */}
              {activeTab === "sso" && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>SSO Providers</CardTitle>
                        <CardDescription>Configure single sign-on providers for your organization</CardDescription>
                      </div>
                      <Button onClick={() => setShowSAMLConfig(!showSAMLConfig)}>
                        <Key className="h-4 w-4 mr-2" />
                        Add Provider
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {showSAMLConfig && (
                      <div className="p-4 border rounded-lg bg-slate-50">
                        <h4 className="font-medium mb-4">Configure SAML Provider</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="provider-name">Provider Name</Label>
                            <Input id="provider-name" placeholder="e.g., Azure AD" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="entity-id">Entity ID</Label>
                            <Input id="entity-id" placeholder="https://sts.windows.net/..." />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="sso-url">SSO URL</Label>
                            <Input id="sso-url" placeholder="https://login.microsoftonline.com/..." />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="domain">Domain</Label>
                            <Input id="domain" placeholder="company.com" />
                          </div>
                        </div>
                        <div className="space-y-2 mt-4">
                          <Label htmlFor="certificate">X.509 Certificate</Label>
                          <Textarea
                            id="certificate"
                            placeholder="-----BEGIN CERTIFICATE-----..."
                            rows={4}
                          />
                        </div>
                        <div className="flex items-center justify-end space-x-2 mt-6">
                          <Button variant="outline" onClick={() => setShowSAMLConfig(false)}>
                            Cancel
                          </Button>
                          <Button>Configure Provider</Button>
                        </div>
                      </div>
                    )}
                    
                    <div className="space-y-4">
                      {mockProviders.map((provider) => (
                        <div key={provider.id} className="p-4 border rounded-lg">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-medium">{provider.name}</h4>
                              <p className="text-sm text-slate-600 mt-1">{provider.domain}</p>
                              <div className="flex items-center space-x-4 mt-2 text-sm text-slate-600">
                                <span>{provider.userCount} users</span>
                                <span>Last sync: {provider.lastSync === "Never" ? "Never" : formatTimestamp(provider.lastSync)}</span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              <Badge variant="outline" className={getProviderStatusColor(provider.status)}>
                                {provider.status}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {provider.type.toUpperCase()}
                              </Badge>
                              <Button variant="outline" size="sm">
                                <Settings className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Security Policies Tab */}
              {activeTab === "policies" && (
                <Card>
                  <CardHeader>
                    <CardTitle>Security Policies</CardTitle>
                    <CardDescription>Configure and enforce security policies across your organization</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {mockSecurityPolicies.map((policy) => (
                        <div key={policy.id} className="p-4 border rounded-lg">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3">
                                <h4 className="font-medium">{policy.name}</h4>
                                <Badge variant="outline" className={getSeverityColor(policy.severity)}>
                                  {policy.severity}
                                </Badge>
                              </div>
                              <p className="text-sm text-slate-600 mt-1">{policy.description}</p>
                            </div>
                            <div className="flex items-center space-x-3">
                              <Switch checked={policy.enabled} />
                              <Button variant="outline" size="sm">
                                <Settings className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Audit Logs Tab */}
              {activeTab === "audit" && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Audit Logs</CardTitle>
                        <CardDescription>Monitor user activities and security events</CardDescription>
                      </div>
                      <Button variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Export Logs
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {mockAuditLogs.map((log) => (
                        <div key={log.id} className="p-3 border rounded-lg">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center space-x-3">
                                <h5 className="font-medium text-sm">{log.action}</h5>
                                <Badge variant="outline" className={
                                  log.result === "success" 
                                    ? "bg-green-100 text-green-800 border-green-300"
                                    : "bg-red-100 text-red-800 border-red-300"
                                }>
                                  {log.result}
                                </Badge>
                              </div>
                              <p className="text-sm text-slate-600 mt-1">
                                <span className="font-medium">{log.userName}</span> - {log.resource}
                              </p>
                              <div className="flex items-center space-x-4 mt-1 text-xs text-slate-500">
                                <span>IP: {log.ipAddress}</span>
                                <span>{log.userAgent}</span>
                              </div>
                            </div>
                            <div className="text-right text-xs text-slate-500">
                              <div className="flex items-center space-x-1">
                                <Clock className="h-3 w-3" />
                                <span>{formatTimestamp(log.timestamp)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Compliance Status */}
              <Card>
                <CardHeader>
                  <CardTitle>Compliance Status</CardTitle>
                  <CardDescription>Security compliance and certification status</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 border rounded-lg text-center">
                      <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                      <h4 className="font-medium">SOC 2 Type II</h4>
                      <p className="text-sm text-slate-600">Compliant</p>
                    </div>
                    <div className="p-4 border rounded-lg text-center">
                      <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                      <h4 className="font-medium">GDPR</h4>
                      <p className="text-sm text-slate-600">Compliant</p>
                    </div>
                    <div className="p-4 border rounded-lg text-center">
                      <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
                      <h4 className="font-medium">ISO 27001</h4>
                      <p className="text-sm text-slate-600">In Progress</p>
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