import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { 
  Crown, 
  Building,
  Users,
  DollarSign,
  Settings,
  Globe,
  Palette,
  Code,
  BarChart3,
  Shield,
  Zap
} from "lucide-react";

const mockUser = {
  id: "user123",
  name: "John Doe",
  email: "john@example.com",
  plan: "Enterprise Plan",
};

export default function WhiteLabelPage() {
  const [brandingEnabled, setBrandingEnabled] = useState(true);
  const [customDomain, setCustomDomain] = useState("agency.flashfusion.com");
  
  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar user={mockUser} />
      
      <div className="lg:pl-64 flex flex-col flex-1">
        <Topbar title="White-label & Reseller Platform" />
        
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 page-transition">
            <div className="max-w-6xl mx-auto space-y-6">
              {/* Header */}
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                    <Crown className="h-6 w-6 text-white" />
                  </div>
                  <h1 className="text-3xl font-bold text-slate-800">White-label & Reseller Platform</h1>
                </div>
                <p className="text-lg text-slate-600 max-w-3xl mx-auto">
                  Launch your own AI-powered business platform with complete white-label customization and reseller management tools.
                </p>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-600">Active Clients</p>
                        <p className="text-2xl font-bold">47</p>
                      </div>
                      <Users className="h-6 w-6 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-600">Monthly Revenue</p>
                        <p className="text-2xl font-bold">$23.5K</p>
                      </div>
                      <DollarSign className="h-6 w-6 text-green-500" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-600">Deployments</p>
                        <p className="text-2xl font-bold">12</p>
                      </div>
                      <Globe className="h-6 w-6 text-purple-500" />
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
                      <Zap className="h-6 w-6 text-orange-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Branding Configuration */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Palette className="h-5 w-5 text-purple-500" />
                    <span>Brand Customization</span>
                  </CardTitle>
                  <CardDescription>Configure your white-label appearance and branding</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="company-name">Company Name</Label>
                        <Input id="company-name" defaultValue="Your Agency Name" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="custom-domain">Custom Domain</Label>
                        <Input 
                          id="custom-domain" 
                          value={customDomain}
                          onChange={(e) => setCustomDomain(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="logo-url">Logo URL</Label>
                        <Input id="logo-url" placeholder="https://your-site.com/logo.png" />
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="primary-color">Primary Color</Label>
                        <div className="flex items-center space-x-2">
                          <Input id="primary-color" value="#6366f1" className="w-20" />
                          <div className="w-8 h-8 bg-indigo-500 rounded border"></div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="secondary-color">Secondary Color</Label>
                        <div className="flex items-center space-x-2">
                          <Input id="secondary-color" value="#8b5cf6" className="w-20" />
                          <div className="w-8 h-8 bg-violet-500 rounded border"></div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <Label>Remove FlashFusion Branding</Label>
                          <p className="text-sm text-slate-600">Hide all FlashFusion references</p>
                        </div>
                        <Switch checked={brandingEnabled} onCheckedChange={setBrandingEnabled} />
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <Button>Save Branding Changes</Button>
                  </div>
                </CardContent>
              </Card>

              {/* Client Management */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Building className="h-5 w-5 text-blue-500" />
                    <span>Client Management</span>
                  </CardTitle>
                  <CardDescription>Manage your client accounts and permissions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { name: "TechCorp Inc", plan: "Enterprise", users: 45, revenue: "$2,400", status: "active" },
                      { name: "StartupXYZ", plan: "Professional", users: 12, revenue: "$800", status: "active" },
                      { name: "DesignStudio", plan: "Basic", users: 8, revenue: "$400", status: "trial" },
                      { name: "ConsultingFirm", plan: "Enterprise", users: 67, revenue: "$3,200", status: "active" }
                    ].map((client, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h4 className="font-medium">{client.name}</h4>
                          <p className="text-sm text-slate-600">{client.users} users • {client.plan} plan</p>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <p className="font-medium">{client.revenue}/month</p>
                            <Badge variant="outline" className={
                              client.status === "active" ? "bg-green-100 text-green-800 border-green-300" :
                              client.status === "trial" ? "bg-yellow-100 text-yellow-800 border-yellow-300" :
                              "bg-gray-100 text-gray-800 border-gray-300"
                            }>
                              {client.status}
                            </Badge>
                          </div>
                          <Button variant="outline" size="sm">
                            <Settings className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Revenue Dashboard */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5 text-green-500" />
                    <span>Revenue Analytics</span>
                  </CardTitle>
                  <CardDescription>Track your reseller performance and earnings</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-4 border rounded-lg">
                      <DollarSign className="h-8 w-8 mx-auto mb-2 text-green-500" />
                      <p className="text-2xl font-bold text-green-700">$23.5K</p>
                      <p className="text-sm text-slate-600">This Month</p>
                      <p className="text-xs text-green-600">↗ +15% from last month</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <Users className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                      <p className="text-2xl font-bold text-blue-700">132</p>
                      <p className="text-sm text-slate-600">Total Users</p>
                      <p className="text-xs text-blue-600">↗ +8 new this month</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <BarChart3 className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                      <p className="text-2xl font-bold text-purple-700">67%</p>
                      <p className="text-sm text-slate-600">Profit Margin</p>
                      <p className="text-xs text-purple-600">Industry leading</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Deployment Options */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Code className="h-5 w-5 text-orange-500" />
                    <span>Deployment Options</span>
                  </CardTitle>
                  <CardDescription>Choose how to deploy your white-label solution</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-6 border rounded-lg">
                      <Globe className="h-8 w-8 mb-4 text-blue-500" />
                      <h4 className="font-medium mb-2">Cloud Hosted</h4>
                      <p className="text-sm text-slate-600 mb-4">
                        Fully managed cloud deployment with automatic updates and scaling
                      </p>
                      <ul className="text-sm text-slate-600 space-y-1 mb-4">
                        <li>• Automatic updates</li>
                        <li>• 99.9% uptime SLA</li>
                        <li>• Global CDN</li>
                        <li>• SSL certificates</li>
                      </ul>
                      <Button className="w-full">Deploy to Cloud</Button>
                    </div>
                    
                    <div className="p-6 border rounded-lg">
                      <Shield className="h-8 w-8 mb-4 text-green-500" />
                      <h4 className="font-medium mb-2">On-Premise</h4>
                      <p className="text-sm text-slate-600 mb-4">
                        Self-hosted solution for maximum control and security
                      </p>
                      <ul className="text-sm text-slate-600 space-y-1 mb-4">
                        <li>• Full data control</li>
                        <li>• Custom infrastructure</li>
                        <li>• Enterprise security</li>
                        <li>• Compliance ready</li>
                      </ul>
                      <Button variant="outline" className="w-full">Download Package</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Support & Training */}
              <Card>
                <CardHeader>
                  <CardTitle>Partner Support & Training</CardTitle>
                  <CardDescription>Resources to help you succeed as a FlashFusion reseller</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 border rounded-lg text-center">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                        <span className="text-xl">📚</span>
                      </div>
                      <h4 className="font-medium mb-2">Training Materials</h4>
                      <p className="text-sm text-slate-600">Comprehensive guides and video tutorials</p>
                    </div>
                    <div className="p-4 border rounded-lg text-center">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                        <span className="text-xl">🎯</span>
                      </div>
                      <h4 className="font-medium mb-2">Sales Support</h4>
                      <p className="text-sm text-slate-600">Marketing materials and sales training</p>
                    </div>
                    <div className="p-4 border rounded-lg text-center">
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                        <span className="text-xl">🤝</span>
                      </div>
                      <h4 className="font-medium mb-2">Dedicated Support</h4>
                      <p className="text-sm text-slate-600">Priority technical and business support</p>
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