import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, Circle, ExternalLink, Rocket, Globe, Share2, Zap } from "lucide-react";

const mockUser = {
  id: "user123",
  name: "John Doe",
  email: "john@example.com",
  plan: "Pro"
};

const launchSteps = [
  {
    id: 1,
    title: "Brand Identity Complete",
    description: "Logo, colors, and brand guidelines ready",
    completed: true,
    category: "branding"
  },
  {
    id: 2,
    title: "Content Strategy Defined",
    description: "Marketing copy and content calendar created",
    completed: true,
    category: "content"
  },
  {
    id: 3,
    title: "SEO Landing Page Built",
    description: "Optimized landing page with conversion tracking",
    completed: false,
    category: "website"
  },
  {
    id: 4,
    title: "Product Mockups Ready",
    description: "Professional product visualizations completed",
    completed: false,
    category: "design"
  },
  {
    id: 5,
    title: "Social Media Setup",
    description: "Profiles created and content scheduled",
    completed: false,
    category: "social"
  },
  {
    id: 6,
    title: "Analytics Tracking",
    description: "Google Analytics and conversion tracking setup",
    completed: false,
    category: "tracking"
  }
];

const launchTemplates = [
  {
    id: 1,
    name: "SaaS Product Launch",
    description: "Complete launch kit for software products",
    items: ["Landing page", "Email sequence", "Social content", "Press kit"],
    popularity: "Most Popular"
  },
  {
    id: 2,
    name: "E-commerce Store",
    description: "Everything needed for online retail launch",
    items: ["Product pages", "Shopping cart", "Payment setup", "Marketing assets"],
    popularity: "Trending"
  },
  {
    id: 3,
    name: "Service Business",
    description: "Launch toolkit for service-based businesses",
    items: ["Service pages", "Booking system", "Portfolio", "Client onboarding"],
    popularity: "New"
  }
];

export default function Launch() {
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);

  const { data: launchProgress } = useQuery({
    queryKey: ['/api/launch/progress'],
    queryFn: () => ({
      completedSteps: 2,
      totalSteps: 6,
      estimatedLaunchDate: "2025-02-15",
      readinessScore: 33
    }),
  });

  const completedSteps = launchSteps.filter(step => step.completed).length;
  const progressPercentage = (completedSteps / launchSteps.length) * 100;

  return (
    <div className="min-h-screen flex bg-slate-50">
      <Sidebar user={mockUser} />
      
      <div className="lg:pl-64 flex flex-col flex-1">
        <Topbar title="Launch Center" />
        
        <main className="flex-1 overflow-y-auto">
          <div className="px-6 py-8">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 flex items-center">
                    <Rocket className="h-6 w-6 mr-3 text-primary" />
                    Launch Center
                  </h1>
                  <p className="text-slate-600 mt-1">Take your ideas from concept to market-ready</p>
                </div>
                
                <Button size="lg" className="bg-gradient-to-r from-primary to-secondary-500">
                  <Zap className="h-4 w-4 mr-2" />
                  Quick Launch
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Launch Progress */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Launch Readiness</CardTitle>
                      <Badge variant="outline" className="text-primary border-primary">
                        {progressPercentage.toFixed(0)}% Complete
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Progress value={progressPercentage} className="mb-6" />
                    
                    <div className="space-y-4">
                      {launchSteps.map((step) => (
                        <div key={step.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                          {step.completed ? (
                            <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                          ) : (
                            <Circle className="h-5 w-5 text-slate-300 mt-0.5 flex-shrink-0" />
                          )}
                          <div className="flex-1">
                            <h3 className={`font-medium ${step.completed ? 'text-slate-900' : 'text-slate-600'}`}>
                              {step.title}
                            </h3>
                            <p className="text-sm text-slate-500 mt-1">{step.description}</p>
                          </div>
                          {!step.completed && (
                            <Button variant="ghost" size="sm">
                              Start
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Launch Templates */}
                <Card>
                  <CardHeader>
                    <CardTitle>Launch Templates</CardTitle>
                    <p className="text-sm text-slate-600">Pre-built launch sequences for different business types</p>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4">
                      {launchTemplates.map((template) => (
                        <div 
                          key={template.id}
                          className={`p-4 border rounded-lg cursor-pointer transition-all ${
                            selectedTemplate === template.id 
                              ? 'border-primary bg-primary/5' 
                              : 'border-slate-200 hover:border-slate-300'
                          }`}
                          onClick={() => setSelectedTemplate(template.id)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <h3 className="font-medium text-slate-900">{template.name}</h3>
                                <Badge variant="secondary" className="text-xs">
                                  {template.popularity}
                                </Badge>
                              </div>
                              <p className="text-sm text-slate-600 mb-3">{template.description}</p>
                              <div className="flex flex-wrap gap-2">
                                {template.items.map((item, index) => (
                                  <span key={index} className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">
                                    {item}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {selectedTemplate && (
                      <div className="mt-6 pt-6 border-t">
                        <Button className="w-full">
                          Use This Template
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Launch Stats & Actions */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium text-slate-600">Launch Statistics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600">Readiness Score</span>
                        <span className="font-medium text-slate-900">{launchProgress?.readinessScore || 0}%</span>
                      </div>
                      <Progress value={launchProgress?.readinessScore || 0} className="mt-2" />
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Completed Steps</span>
                        <span className="font-medium">{completedSteps}/{launchSteps.length}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Est. Launch Date</span>
                        <span className="font-medium">{launchProgress?.estimatedLaunchDate || 'TBD'}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium text-slate-600">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button variant="outline" className="w-full justify-start" size="sm">
                      <Globe className="h-4 w-4 mr-2" />
                      Preview Landing Page
                    </Button>
                    <Button variant="outline" className="w-full justify-start" size="sm">
                      <Share2 className="h-4 w-4 mr-2" />
                      Share Preview Link
                    </Button>
                    <Button variant="outline" className="w-full justify-start" size="sm">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Open Live Site
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium text-slate-600">Launch Checklist</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center space-x-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span className="text-slate-600">Domain registered</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span className="text-slate-600">SSL certificate</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Circle className="h-4 w-4 text-slate-300" />
                        <span className="text-slate-400">Payment setup</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Circle className="h-4 w-4 text-slate-300" />
                        <span className="text-slate-400">Email automation</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}