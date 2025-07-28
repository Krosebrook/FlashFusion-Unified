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
import { apiRequest } from "@/lib/queryClient";
import { 
  Bot, 
  Star, 
  Download, 
  Search,
  Filter,
  TrendingUp,
  Users,
  Zap,
  Palette,
  FileText,
  Globe,
  Package,
  Plus,
  ExternalLink
} from "lucide-react";

// Mock user data
const mockUser = {
  id: "user123",
  name: "John Doe",
  email: "john@example.com",
  plan: "Pro Plan",
};

interface Agent {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  rating: number;
  downloads: number;
  price: number;
  author: string;
  tags: string[];
  featured: boolean;
  installed: boolean;
  version: string;
  lastUpdated: string;
  capabilities: string[];
}

export default function AIAgentMarketplacePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState("popular");
  const [viewMode, setViewMode] = useState("grid");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Mock marketplace agents
  const mockAgents: Agent[] = [
    {
      id: "social-media-scheduler",
      name: "Social Media Scheduler Agent",
      description: "Automatically schedule and post content across multiple social media platforms with AI-optimized timing and hashtags.",
      category: "marketing",
      icon: "📱",
      rating: 4.8,
      downloads: 2341,
      price: 0,
      author: "FlashFusion Team",
      tags: ["social media", "scheduling", "automation", "free"],
      featured: true,
      installed: false,
      version: "1.2.0",
      lastUpdated: "2025-01-25",
      capabilities: ["Multi-platform posting", "AI hashtag suggestions", "Optimal timing", "Content analytics"]
    },
    {
      id: "email-campaign-creator",
      name: "Email Campaign Creator",
      description: "Generate personalized email campaigns with AI-driven subject lines, content, and audience segmentation.",
      category: "marketing",
      icon: "📧",
      rating: 4.6,
      downloads: 1876,
      price: 9.99,
      author: "MarketingPro Studios",
      tags: ["email", "campaigns", "personalization", "premium"],
      featured: true,
      installed: true,
      version: "2.1.0",
      lastUpdated: "2025-01-22",
      capabilities: ["AI subject lines", "Personalization", "A/B testing", "Performance tracking"]
    },
    {
      id: "competitor-analyzer",
      name: "Competitor Analysis Agent",
      description: "Monitor and analyze competitor activities, pricing, and marketing strategies to stay ahead of the competition.",
      category: "analytics",
      icon: "🔍",
      rating: 4.7,
      downloads: 1534,
      price: 14.99,
      author: "BusinessIntel Co",
      tags: ["analytics", "competitor", "monitoring", "premium"],
      featured: false,
      installed: false,
      version: "1.0.5",
      lastUpdated: "2025-01-20",
      capabilities: ["Price monitoring", "Feature comparison", "Market analysis", "Alerts"]
    },
    {
      id: "video-script-writer",
      name: "Video Script Writer",
      description: "Create engaging video scripts for YouTube, TikTok, and other platforms with AI-powered storytelling techniques.",
      category: "content",
      icon: "🎬",
      rating: 4.5,
      downloads: 987,
      price: 7.99,
      author: "ContentCrafters",
      tags: ["video", "scripts", "storytelling", "premium"],
      featured: false,
      installed: false,
      version: "1.3.2",
      lastUpdated: "2025-01-18",
      capabilities: ["Platform optimization", "Storytelling structure", "Hook generation", "CTA creation"]
    },
    {
      id: "legal-document-reviewer",
      name: "Legal Document Reviewer",
      description: "Review contracts, terms of service, and legal documents with AI-powered analysis and risk assessment.",
      category: "business",
      icon: "⚖️",
      rating: 4.9,
      downloads: 756,
      price: 24.99,
      author: "LegalTech Solutions",
      tags: ["legal", "contracts", "compliance", "premium"],
      featured: true,
      installed: false,
      version: "1.1.0",
      lastUpdated: "2025-01-15",
      capabilities: ["Contract analysis", "Risk assessment", "Compliance checking", "Recommendations"]
    },
    {
      id: "customer-support-bot",
      name: "Customer Support Bot",
      description: "Provide 24/7 customer support with intelligent responses, ticket routing, and satisfaction tracking.",
      category: "support",
      icon: "🤖",
      rating: 4.4,
      downloads: 2156,
      price: 0,
      author: "SupportAI Inc",
      tags: ["support", "chatbot", "automation", "free"],
      featured: false,
      installed: true,
      version: "3.0.1",
      lastUpdated: "2025-01-28",
      capabilities: ["24/7 availability", "Multi-language support", "Ticket routing", "Satisfaction tracking"]
    }
  ];

  // Install agent mutation
  const installAgentMutation = useMutation({
    mutationFn: async (agentId: string) => {
      const response = await fetch("/api/agents/install", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId }),
      });
      if (!response.ok) throw new Error("Failed to install agent");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/agents"] });
      toast({
        title: "Agent installed!",
        description: "The agent has been successfully installed and is ready to use.",
      });
    },
    onError: () => {
      toast({
        title: "Installation failed",
        description: "Unable to install the agent. Please try again.",
        variant: "destructive",
      });
    },
  });

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "marketing", label: "Marketing" },
    { value: "content", label: "Content Creation" },
    { value: "analytics", label: "Analytics" },
    { value: "business", label: "Business Tools" },
    { value: "support", label: "Customer Support" }
  ];

  const filteredAgents = mockAgents.filter(agent => {
    const matchesSearch = agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         agent.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         agent.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = categoryFilter === "all" || agent.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const sortedAgents = [...filteredAgents].sort((a, b) => {
    switch (sortBy) {
      case "popular":
        return b.downloads - a.downloads;
      case "rating":
        return b.rating - a.rating;
      case "newest":
        return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
      case "price-low":
        return a.price - b.price;
      case "price-high":
        return b.price - a.price;
      default:
        return 0;
    }
  });

  const handleInstallAgent = (agentId: string) => {
    installAgentMutation.mutate(agentId);
  };

  const getAgentIcon = (category: string) => {
    switch (category) {
      case "marketing": return <TrendingUp className="h-5 w-5" />;
      case "content": return <FileText className="h-5 w-5" />;
      case "analytics": return <Search className="h-5 w-5" />;
      case "business": return <Package className="h-5 w-5" />;
      case "support": return <Users className="h-5 w-5" />;
      default: return <Bot className="h-5 w-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar user={mockUser} />
      
      <div className="lg:pl-64 flex flex-col flex-1">
        <Topbar title="AI Agent Marketplace" />
        
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 page-transition">
            <div className="max-w-7xl mx-auto space-y-6">
              {/* Header */}
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <Bot className="h-6 w-6 text-white" />
                  </div>
                  <h1 className="text-3xl font-bold text-slate-800">AI Agent Marketplace</h1>
                </div>
                <p className="text-lg text-slate-600 max-w-3xl mx-auto">
                  Discover and install powerful AI agents to extend FlashFusion's capabilities. 
                  From marketing automation to content creation, find the perfect agents for your workflow.
                </p>
              </div>

              {/* Featured Agents */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Star className="h-5 w-5 text-yellow-500" />
                    <span>Featured Agents</span>
                  </CardTitle>
                  <CardDescription>Hand-picked agents that are popular and highly rated</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {mockAgents.filter(agent => agent.featured).slice(0, 3).map((agent) => (
                      <div key={agent.id} className="p-4 border rounded-lg bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <span className="text-2xl">{agent.icon}</span>
                            <div>
                              <h4 className="font-medium">{agent.name}</h4>
                              <p className="text-sm text-slate-600">{agent.author}</p>
                            </div>
                          </div>
                          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                            Featured
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-700 mb-3">{agent.description}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 text-sm text-slate-600">
                            <span className="flex items-center space-x-1">
                              <Star className="h-3 w-3 text-yellow-500" />
                              <span>{agent.rating}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Download className="h-3 w-3" />
                              <span>{agent.downloads}</span>
                            </span>
                          </div>
                          <span className="font-medium text-blue-600">
                            {agent.price === 0 ? "Free" : `$${agent.price}`}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Search and Filters */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex-1 min-w-64">
                      <div className="relative">
                        <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                        <Input
                          placeholder="Search agents, capabilities, or tags..."
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
                    
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="popular">Most Popular</SelectItem>
                        <SelectItem value="rating">Highest Rated</SelectItem>
                        <SelectItem value="newest">Newest</SelectItem>
                        <SelectItem value="price-low">Price: Low to High</SelectItem>
                        <SelectItem value="price-high">Price: High to Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Agent Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedAgents.map((agent) => (
                  <Card key={agent.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{agent.icon}</span>
                          <div>
                            <CardTitle className="text-lg">{agent.name}</CardTitle>
                            <p className="text-sm text-slate-600">{agent.author}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getAgentIcon(agent.category)}
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <p className="text-sm text-slate-700">{agent.description}</p>
                      
                      <div className="space-y-2">
                        <h5 className="font-medium text-sm">Capabilities:</h5>
                        <div className="flex flex-wrap gap-1">
                          {agent.capabilities.slice(0, 3).map((capability, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {capability}
                            </Badge>
                          ))}
                          {agent.capabilities.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{agent.capabilities.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-4 text-slate-600">
                          <span className="flex items-center space-x-1">
                            <Star className="h-3 w-3 text-yellow-500" />
                            <span>{agent.rating}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Download className="h-3 w-3" />
                            <span>{agent.downloads.toLocaleString()}</span>
                          </span>
                        </div>
                        <span className="font-medium">
                          {agent.price === 0 ? "Free" : `$${agent.price}`}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {agent.installed ? (
                          <Button disabled className="flex-1">
                            <Bot className="h-4 w-4 mr-2" />
                            Installed
                          </Button>
                        ) : (
                          <Button 
                            onClick={() => handleInstallAgent(agent.id)}
                            disabled={installAgentMutation.isPending}
                            className="flex-1"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            {installAgentMutation.isPending ? "Installing..." : "Install"}
                          </Button>
                        )}
                        <Button variant="outline" size="sm">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* No Results */}
              {sortedAgents.length === 0 && (
                <div className="text-center py-12">
                  <Bot className="h-16 w-16 mx-auto mb-4 text-slate-300" />
                  <h3 className="text-lg font-medium text-slate-600">No agents found</h3>
                  <p className="text-slate-500">Try adjusting your search or filters</p>
                </div>
              )}

              {/* Marketplace Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>Marketplace Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">{mockAgents.length}</p>
                      <p className="text-sm text-slate-600">Available Agents</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">{mockAgents.filter(a => a.installed).length}</p>
                      <p className="text-sm text-slate-600">Installed</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-600">{mockAgents.filter(a => a.price === 0).length}</p>
                      <p className="text-sm text-slate-600">Free Agents</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-orange-600">{categories.length - 1}</p>
                      <p className="text-sm text-slate-600">Categories</p>
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