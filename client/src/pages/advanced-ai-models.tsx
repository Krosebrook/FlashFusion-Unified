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
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { 
  Bot, 
  Zap,
  Settings,
  Plus,
  Star,
  TrendingUp,
  Clock,
  DollarSign,
  Cpu,
  BarChart3,
  Code,
  Palette,
  Globe,
  MessageSquare,
  FileText,
  Image,
  Video,
  Mic
} from "lucide-react";

// Mock user data
const mockUser = {
  id: "user123",
  name: "John Doe",
  email: "john@example.com",
  plan: "Pro Plan",
};

interface AIModel {
  id: string;
  name: string;
  provider: string;
  description: string;
  capabilities: string[];
  pricing: {
    inputTokens: number;
    outputTokens: number;
    currency: string;
  };
  performance: {
    speed: number;
    quality: number;
    creativity: number;
  };
  limits: {
    maxTokens: number;
    requestsPerMinute: number;
  };
  enabled: boolean;
  featured: boolean;
  category: string;
}

interface CustomAgent {
  id: string;
  name: string;
  description: string;
  model: string;
  systemPrompt: string;
  temperature: number;
  maxTokens: number;
  category: string;
  isPublic: boolean;
  usage: number;
  rating: number;
}

export default function AdvancedAIModelsPage() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showCreateAgent, setShowCreateAgent] = useState(false);
  const [newAgent, setNewAgent] = useState({
    name: "",
    description: "",
    model: "claude-4-sonnet",
    systemPrompt: "",
    temperature: 0.7,
    maxTokens: 4000,
    category: "general",
    isPublic: false
  });
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Mock AI models data
  const mockModels: AIModel[] = [
    {
      id: "claude-4-sonnet",
      name: "Claude 4.0 Sonnet",
      provider: "Anthropic",
      description: "Latest Claude model with enhanced reasoning and creativity",
      capabilities: ["Text Generation", "Code Analysis", "Creative Writing", "Math & Logic"],
      pricing: { inputTokens: 3, outputTokens: 15, currency: "USD" },
      performance: { speed: 85, quality: 95, creativity: 90 },
      limits: { maxTokens: 200000, requestsPerMinute: 50 },
      enabled: true,
      featured: true,
      category: "text"
    },
    {
      id: "gpt-4-turbo",
      name: "GPT-4 Turbo",
      provider: "OpenAI", 
      description: "Fast and efficient GPT-4 with updated knowledge cutoff",
      capabilities: ["Text Generation", "Code Generation", "Analysis", "Vision"],
      pricing: { inputTokens: 10, outputTokens: 30, currency: "USD" },
      performance: { speed: 90, quality: 88, creativity: 85 },
      limits: { maxTokens: 128000, requestsPerMinute: 40 },
      enabled: false,
      featured: true,
      category: "text"
    },
    {
      id: "gemini-pro",
      name: "Gemini Pro",
      provider: "Google",
      description: "Google's multimodal AI with strong reasoning capabilities",
      capabilities: ["Text Generation", "Multimodal", "Code Generation", "Math"],
      pricing: { inputTokens: 1, outputTokens: 2, currency: "USD" },
      performance: { speed: 80, quality: 82, creativity: 78 },
      limits: { maxTokens: 30720, requestsPerMinute: 60 },
      enabled: false,
      featured: false,
      category: "multimodal"
    },
    {
      id: "dall-e-3",
      name: "DALL-E 3",
      provider: "OpenAI",
      description: "Advanced image generation with detailed prompts",
      capabilities: ["Image Generation", "Creative Art", "Logo Design"],
      pricing: { inputTokens: 0, outputTokens: 40, currency: "USD" },
      performance: { speed: 60, quality: 92, creativity: 95 },
      limits: { maxTokens: 4000, requestsPerMinute: 5 },
      enabled: false,
      featured: true,
      category: "image"
    },
    {
      id: "whisper-1",
      name: "Whisper",
      provider: "OpenAI",
      description: "Speech-to-text transcription with high accuracy",
      capabilities: ["Speech Recognition", "Audio Transcription", "Multi-language"],
      pricing: { inputTokens: 6, outputTokens: 0, currency: "USD" },
      performance: { speed: 75, quality: 88, creativity: 50 },
      limits: { maxTokens: 25000000, requestsPerMinute: 50 },
      enabled: false,
      featured: false,
      category: "audio"
    }
  ];

  const mockCustomAgents: CustomAgent[] = [
    {
      id: "1",
      name: "Marketing Copy Expert",
      description: "Specialized in creating compelling marketing copy and sales content",
      model: "claude-4-sonnet",
      systemPrompt: "You are an expert marketing copywriter with 10+ years of experience...",
      temperature: 0.8,
      maxTokens: 2000,
      category: "marketing",
      isPublic: true,
      usage: 245,
      rating: 4.8
    },
    {
      id: "2",
      name: "Technical Documentation Writer",
      description: "Creates clear, comprehensive technical documentation",
      model: "gpt-4-turbo",
      systemPrompt: "You are a technical writer who creates clear, structured documentation...",
      temperature: 0.3,
      maxTokens: 4000,
      category: "technical",
      isPublic: false,
      usage: 89,
      rating: 4.6
    }
  ];

  // Model toggle mutation
  const toggleModelMutation = useMutation({
    mutationFn: async ({ modelId, enabled }: { modelId: string; enabled: boolean }) => {
      const response = await fetch("/api/ai-models/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ modelId, enabled }),
      });
      if (!response.ok) throw new Error("Failed to toggle model");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ai-models"] });
      toast({
        title: "Model updated",
        description: "AI model configuration has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update model configuration.",
        variant: "destructive",
      });
    },
  });

  // Create custom agent mutation
  const createAgentMutation = useMutation({
    mutationFn: async (agent: typeof newAgent) => {
      const response = await fetch("/api/custom-agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(agent),
      });
      if (!response.ok) throw new Error("Failed to create agent");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/custom-agents"] });
      setShowCreateAgent(false);
      setNewAgent({
        name: "",
        description: "",
        model: "claude-4-sonnet",
        systemPrompt: "",
        temperature: 0.7,
        maxTokens: 4000,
        category: "general",
        isPublic: false
      });
      toast({
        title: "Agent created!",
        description: "Your custom AI agent has been created successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create custom agent.",
        variant: "destructive",
      });
    },
  });

  const categories = [
    { value: "all", label: "All Models", icon: <Bot className="h-4 w-4" /> },
    { value: "text", label: "Text Generation", icon: <FileText className="h-4 w-4" /> },
    { value: "image", label: "Image Generation", icon: <Image className="h-4 w-4" /> },
    { value: "audio", label: "Audio Processing", icon: <Mic className="h-4 w-4" /> },
    { value: "multimodal", label: "Multimodal", icon: <Zap className="h-4 w-4" /> }
  ];

  const filteredModels = selectedCategory === "all" 
    ? mockModels 
    : mockModels.filter(model => model.category === selectedCategory);

  const getProviderColor = (provider: string) => {
    switch (provider) {
      case "Anthropic": return "bg-orange-100 text-orange-800 border-orange-300";
      case "OpenAI": return "bg-green-100 text-green-800 border-green-300";
      case "Google": return "bg-blue-100 text-blue-800 border-blue-300";
      default: return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const handleToggleModel = (modelId: string, enabled: boolean) => {
    toggleModelMutation.mutate({ modelId, enabled });
  };

  const handleCreateAgent = () => {
    if (newAgent.name && newAgent.systemPrompt) {
      createAgentMutation.mutate(newAgent);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar user={mockUser} />
      
      <div className="lg:pl-64 flex flex-col flex-1">
        <Topbar title="Advanced AI Models" />
        
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 page-transition">
            <div className="max-w-7xl mx-auto space-y-6">
              {/* Header */}
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
                    <Cpu className="h-6 w-6 text-white" />
                  </div>
                  <h1 className="text-3xl font-bold text-slate-800">Advanced AI Models</h1>
                </div>
                <p className="text-lg text-slate-600 max-w-3xl mx-auto">
                  Configure and manage multiple AI models, create custom agents, and optimize performance for your specific needs.
                </p>
              </div>

              {/* Model Categories */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex flex-wrap gap-2">
                    {categories.map((category) => (
                      <Button
                        key={category.value}
                        variant={selectedCategory === category.value ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedCategory(category.value)}
                        className="flex items-center space-x-2"
                      >
                        {category.icon}
                        <span>{category.label}</span>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Model Performance Comparison */}
              <Card>
                <CardHeader>
                  <CardTitle>Model Performance Overview</CardTitle>
                  <CardDescription>Compare performance metrics across different AI models</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {filteredModels.map((model) => (
                      <div key={model.id} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-4">
                            <div>
                              <h4 className="font-semibold text-lg">{model.name}</h4>
                              <p className="text-sm text-slate-600">{model.description}</p>
                              <div className="flex items-center space-x-2 mt-2">
                                <Badge variant="outline" className={getProviderColor(model.provider)}>
                                  {model.provider}
                                </Badge>
                                {model.featured && (
                                  <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                                    <Star className="h-3 w-3 mr-1" />
                                    Featured
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="text-right text-sm">
                              <p className="font-medium">${model.pricing.inputTokens}/1K input</p>
                              <p className="text-slate-600">${model.pricing.outputTokens}/1K output</p>
                            </div>
                            <Switch
                              checked={model.enabled}
                              onCheckedChange={(enabled) => handleToggleModel(model.id, enabled)}
                            />
                          </div>
                        </div>
                        
                        {/* Performance Metrics */}
                        <div className="grid grid-cols-3 gap-4 mb-4">
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium">Speed</span>
                              <span className="text-sm text-slate-600">{model.performance.speed}%</span>
                            </div>
                            <Progress value={model.performance.speed} className="h-2" />
                          </div>
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium">Quality</span>
                              <span className="text-sm text-slate-600">{model.performance.quality}%</span>
                            </div>
                            <Progress value={model.performance.quality} className="h-2" />
                          </div>
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium">Creativity</span>
                              <span className="text-sm text-slate-600">{model.performance.creativity}%</span>
                            </div>
                            <Progress value={model.performance.creativity} className="h-2" />
                          </div>
                        </div>
                        
                        {/* Capabilities */}
                        <div className="space-y-2">
                          <h5 className="font-medium text-sm">Capabilities:</h5>
                          <div className="flex flex-wrap gap-1">
                            {model.capabilities.map((capability, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {capability}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        {/* Limits */}
                        <div className="grid grid-cols-2 gap-4 mt-4 text-sm text-slate-600">
                          <div>
                            <span className="font-medium">Max Tokens:</span> {model.limits.maxTokens.toLocaleString()}
                          </div>
                          <div>
                            <span className="font-medium">Rate Limit:</span> {model.limits.requestsPerMinute}/min
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Custom Agents */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Custom AI Agents</CardTitle>
                      <CardDescription>Create and manage specialized AI agents with custom prompts</CardDescription>
                    </div>
                    <Button onClick={() => setShowCreateAgent(!showCreateAgent)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Agent
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {showCreateAgent && (
                    <div className="p-4 border rounded-lg bg-slate-50">
                      <h4 className="font-medium mb-4">Create Custom Agent</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="agent-name">Agent Name</Label>
                          <Input
                            id="agent-name"
                            placeholder="e.g., Marketing Copy Expert"
                            value={newAgent.name}
                            onChange={(e) => setNewAgent({...newAgent, name: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="agent-model">Base Model</Label>
                          <Select value={newAgent.model} onValueChange={(value) => setNewAgent({...newAgent, model: value})}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {mockModels.filter(m => m.enabled).map((model) => (
                                <SelectItem key={model.id} value={model.id}>
                                  {model.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div className="space-y-2 mt-4">
                        <Label htmlFor="agent-description">Description</Label>
                        <Input
                          id="agent-description"
                          placeholder="Brief description of what this agent does"
                          value={newAgent.description}
                          onChange={(e) => setNewAgent({...newAgent, description: e.target.value})}
                        />
                      </div>
                      
                      <div className="space-y-2 mt-4">
                        <Label htmlFor="system-prompt">System Prompt</Label>
                        <Textarea
                          id="system-prompt"
                          placeholder="Define the agent's role, expertise, and behavior..."
                          rows={4}
                          value={newAgent.systemPrompt}
                          onChange={(e) => setNewAgent({...newAgent, systemPrompt: e.target.value})}
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div className="space-y-2">
                          <Label>Temperature: {newAgent.temperature}</Label>
                          <Slider
                            value={[newAgent.temperature]}
                            onValueChange={(value) => setNewAgent({...newAgent, temperature: value[0]})}
                            max={2}
                            min={0}
                            step={0.1}
                            className="w-full"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Max Tokens: {newAgent.maxTokens}</Label>
                          <Slider
                            value={[newAgent.maxTokens]}
                            onValueChange={(value) => setNewAgent({...newAgent, maxTokens: value[0]})}
                            max={8000}
                            min={500}
                            step={100}
                            className="w-full"
                          />
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mt-6">
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={newAgent.isPublic}
                            onCheckedChange={(checked) => setNewAgent({...newAgent, isPublic: checked})}
                          />
                          <Label>Make public for team use</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" onClick={() => setShowCreateAgent(false)}>
                            Cancel
                          </Button>
                          <Button 
                            onClick={handleCreateAgent}
                            disabled={!newAgent.name || !newAgent.systemPrompt || createAgentMutation.isPending}
                          >
                            {createAgentMutation.isPending ? "Creating..." : "Create Agent"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Existing Custom Agents */}
                  <div className="space-y-4">
                    {mockCustomAgents.map((agent) => (
                      <div key={agent.id} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-medium">{agent.name}</h4>
                            <p className="text-sm text-slate-600 mt-1">{agent.description}</p>
                            <div className="flex items-center space-x-4 mt-2 text-sm">
                              <span className="flex items-center space-x-1">
                                <Bot className="h-3 w-3" />
                                <span>{mockModels.find(m => m.id === agent.model)?.name}</span>
                              </span>
                              <span className="flex items-center space-x-1">
                                <TrendingUp className="h-3 w-3" />
                                <span>{agent.usage} uses</span>
                              </span>
                              <span className="flex items-center space-x-1">
                                <Star className="h-3 w-3" />
                                <span>{agent.rating}</span>
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {agent.isPublic && (
                              <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
                                Public
                              </Badge>
                            )}
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

              {/* Usage Statistics */}
              <Card>
                <CardHeader>
                  <CardTitle>Usage Statistics</CardTitle>
                  <CardDescription>Track your AI model usage and costs</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                      <BarChart3 className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                      <p className="text-2xl font-bold">1.2M</p>
                      <p className="text-sm text-slate-600">Tokens Used</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <DollarSign className="h-8 w-8 mx-auto mb-2 text-green-500" />
                      <p className="text-2xl font-bold">$47.50</p>
                      <p className="text-sm text-slate-600">This Month</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <Clock className="h-8 w-8 mx-auto mb-2 text-orange-500" />
                      <p className="text-2xl font-bold">2.3s</p>
                      <p className="text-sm text-slate-600">Avg Response</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <Zap className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                      <p className="text-2xl font-bold">456</p>
                      <p className="text-sm text-slate-600">Requests</p>
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