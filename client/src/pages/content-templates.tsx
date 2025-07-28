import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { 
  FileText, 
  Star,
  Crown,
  Plus,
  Search,
  Filter,
  Download,
  Heart,
  Palette,
  Building,
  ShoppingCart,
  Stethoscope,
  GraduationCap,
  Smartphone,
  DollarSign,
  Lightbulb
} from "lucide-react";

const mockUser = {
  id: "user123",
  name: "John Doe",
  email: "john@example.com", 
  plan: "Pro Plan",
};

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  industry: string;
  icon: any;
  rating: number;
  downloads: number;
  premium: boolean;
  featured: boolean;
  author: string;
  tags: string[];
  preview: string;
}

export default function ContentTemplatesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [industryFilter, setIndustryFilter] = useState("all");
  const [sortBy, setSortBy] = useState("popular");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const mockTemplates: Template[] = [
    {
      id: "saas-startup",
      name: "SaaS Startup Template",
      description: "Complete template for software-as-a-service business ideas with technical specifications",
      category: "business-plan",
      industry: "technology",
      icon: <Building className="h-5 w-5" />,
      rating: 4.9,
      downloads: 2341,
      premium: true,
      featured: true,
      author: "FlashFusion Team",
      tags: ["saas", "software", "subscription", "b2b"],
      preview: "Executive Summary, Market Analysis, Technical Architecture, Revenue Model..."
    },
    {
      id: "ecommerce-brand",
      name: "E-commerce Brand Kit",
      description: "Professional brand guidelines and visual identity for online retail businesses",
      category: "brand-kit",
      industry: "retail",
      icon: <ShoppingCart className="h-5 w-5" />,
      rating: 4.7,
      downloads: 1876,
      premium: false,
      featured: true,
      author: "Design Studio Pro",
      tags: ["ecommerce", "retail", "branding", "logo"],
      preview: "Logo variations, Color palette, Typography, Brand voice guidelines..."
    },
    {
      id: "health-tech",
      name: "HealthTech Innovation",
      description: "Template for healthcare technology startups with regulatory considerations",
      category: "business-plan",
      industry: "healthcare",
      icon: <Stethoscope className="h-5 w-5" />,
      rating: 4.8,
      downloads: 967,
      premium: true,
      featured: false,
      author: "MedTech Ventures",
      tags: ["healthcare", "medical", "technology", "fda"],
      preview: "Problem Statement, Solution Overview, Regulatory Pathway, Clinical Validation..."
    },
    {
      id: "fintech-app",
      name: "FinTech Mobile App",
      description: "Financial technology app template with security and compliance framework",
      category: "product-spec",
      industry: "finance",
      icon: <DollarSign className="h-5 w-5" />,
      rating: 4.6,
      downloads: 1534,
      premium: true,
      featured: false,
      author: "FinTech Labs",
      tags: ["fintech", "mobile", "banking", "security"],
      preview: "User Stories, Security Requirements, API Specifications, Compliance Checklist..."
    },
    {
      id: "edtech-platform",
      name: "EdTech Learning Platform",
      description: "Educational technology platform with curriculum and learning objectives",
      category: "business-plan",
      industry: "education",
      icon: <GraduationCap className="h-5 w-5" />,
      rating: 4.5,
      downloads: 789,
      premium: false,
      featured: false,
      author: "EduInnovate",
      tags: ["education", "learning", "platform", "curriculum"],
      preview: "Learning Objectives, Curriculum Design, Technology Stack, Monetization..."
    },
    {
      id: "mobile-first",
      name: "Mobile-First Design System",
      description: "Complete design system and component library for mobile applications",
      category: "design-system",
      industry: "technology",
      icon: <Smartphone className="h-5 w-5" />,
      rating: 4.4,
      downloads: 1203,
      premium: true,
      featured: true,
      author: "Mobile Design Co",
      tags: ["mobile", "design", "components", "ui"],
      preview: "Component Library, Design Tokens, Interaction Patterns, Accessibility..."
    }
  ];

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "business-plan", label: "Business Plans" },
    { value: "brand-kit", label: "Brand Kits" },
    { value: "product-spec", label: "Product Specs" },
    { value: "design-system", label: "Design Systems" },
    { value: "content-calendar", label: "Content Calendars" }
  ];

  const industries = [
    { value: "all", label: "All Industries" },
    { value: "technology", label: "Technology" },
    { value: "healthcare", label: "Healthcare" },
    { value: "finance", label: "Finance" },
    { value: "education", label: "Education" },
    { value: "retail", label: "Retail" }
  ];

  const useTemplateMutation = useMutation({
    mutationFn: async (templateId: string) => {
      const response = await fetch("/api/templates/use", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateId }),
      });
      if (!response.ok) throw new Error("Failed to use template");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Template applied!",
        description: "The template has been applied to your new idea.",
      });
    },
    onError: () => {
      toast({
        title: "Failed to apply template",
        description: "Please try again.",
        variant: "destructive",
      });
    },
  });

  const filteredTemplates = mockTemplates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = categoryFilter === "all" || template.category === categoryFilter;
    const matchesIndustry = industryFilter === "all" || template.industry === industryFilter;
    return matchesSearch && matchesCategory && matchesIndustry;
  });

  const sortedTemplates = [...filteredTemplates].sort((a, b) => {
    switch (sortBy) {
      case "popular":
        return b.downloads - a.downloads;
      case "rating":
        return b.rating - a.rating;
      case "newest":
        return b.id.localeCompare(a.id);
      default:
        return 0;
    }
  });

  const getIndustryIcon = (industry: string) => {
    switch (industry) {
      case "technology": return "💻";
      case "healthcare": return "🏥";
      case "finance": return "💰";
      case "education": return "🎓";
      case "retail": return "🛒";
      default: return "🏢";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar user={mockUser} />
      
      <div className="lg:pl-64 flex flex-col flex-1">
        <Topbar title="Content Templates & Industry Packs" />
        
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 page-transition">
            <div className="max-w-7xl mx-auto space-y-6">
              {/* Header */}
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                  <h1 className="text-3xl font-bold text-slate-800">Content Templates & Industry Packs</h1>
                </div>
                <p className="text-lg text-slate-600 max-w-3xl mx-auto">
                  Accelerate your business development with professional templates designed for specific industries and use cases.
                </p>
              </div>

              {/* Featured Templates */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Star className="h-5 w-5 text-yellow-500" />
                    <span>Featured Templates</span>
                  </CardTitle>
                  <CardDescription>Handpicked templates from top creators</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {mockTemplates.filter(template => template.featured).slice(0, 3).map((template) => (
                      <div key={template.id} className="p-4 border rounded-lg bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <span className="text-2xl">{getIndustryIcon(template.industry)}</span>
                            <div>
                              <h4 className="font-medium">{template.name}</h4>
                              <p className="text-sm text-slate-600">{template.author}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                              Featured
                            </Badge>
                            {template.premium && (
                              <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-300">
                                <Crown className="h-3 w-3 mr-1" />
                                Pro
                              </Badge>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-slate-700 mb-3">{template.description}</p>
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-3 text-slate-600">
                            <span className="flex items-center space-x-1">
                              <Star className="h-3 w-3 text-yellow-500" />
                              <span>{template.rating}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Download className="h-3 w-3" />
                              <span>{template.downloads}</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Filters */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex-1 min-w-64">
                      <div className="relative">
                        <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                        <Input
                          placeholder="Search templates, industries, or tags..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.value} value={category.value}>
                            {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Select value={industryFilter} onValueChange={setIndustryFilter}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {industries.map((industry) => (
                          <SelectItem key={industry.value} value={industry.value}>
                            {industry.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="popular">Most Popular</SelectItem>
                        <SelectItem value="rating">Highest Rated</SelectItem>
                        <SelectItem value="newest">Newest</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Template Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedTemplates.map((template) => (
                  <Card key={template.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{getIndustryIcon(template.industry)}</span>
                          <div>
                            <CardTitle className="text-lg">{template.name}</CardTitle>
                            <p className="text-sm text-slate-600">{template.author}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          {template.premium && (
                            <Crown className="h-4 w-4 text-purple-500" />
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <p className="text-sm text-slate-700">{template.description}</p>
                      
                      <div className="space-y-2">
                        <h5 className="font-medium text-sm">Preview:</h5>
                        <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded">
                          {template.preview}
                        </p>
                      </div>
                      
                      <div className="flex flex-wrap gap-1">
                        {template.tags.slice(0, 3).map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {template.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{template.tags.length - 3} more
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-4 text-slate-600">
                          <span className="flex items-center space-x-1">
                            <Star className="h-3 w-3 text-yellow-500" />
                            <span>{template.rating}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Download className="h-3 w-3" />
                            <span>{template.downloads.toLocaleString()}</span>
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button 
                          onClick={() => useTemplateMutation.mutate(template.id)}
                          disabled={useTemplateMutation.isPending}
                          className="flex-1"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Use Template
                        </Button>
                        <Button variant="outline" size="sm">
                          <Heart className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Template Builder */}
              <Card>
                <CardHeader>
                  <CardTitle>Custom Template Builder</CardTitle>
                  <CardDescription>Create your own templates and share with the community</CardDescription>
                </CardHeader>
                <CardContent className="text-center py-8">
                  <Palette className="h-16 w-16 mx-auto mb-4 text-purple-500" />
                  <h3 className="text-lg font-medium mb-2">Build Custom Templates</h3>
                  <p className="text-slate-600 mb-6 max-w-2xl mx-auto">
                    Create reusable templates from your successful ideas and business plans. 
                    Share them with your team or the FlashFusion community.
                  </p>
                  <Button size="lg" className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700">
                    <Plus className="h-5 w-5 mr-2" />
                    Create Template
                  </Button>
                </CardContent>
              </Card>

              {/* Industry Statistics */}
              <Card>
                <CardHeader>
                  <CardTitle>Template Statistics</CardTitle>
                  <CardDescription>Usage and performance metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-600">{mockTemplates.length}</p>
                      <p className="text-sm text-slate-600">Total Templates</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">{industries.length - 1}</p>
                      <p className="text-sm text-slate-600">Industries</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">{mockTemplates.filter(t => !t.premium).length}</p>
                      <p className="text-sm text-slate-600">Free Templates</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-orange-600">4.7</p>
                      <p className="text-sm text-slate-600">Avg Rating</p>
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