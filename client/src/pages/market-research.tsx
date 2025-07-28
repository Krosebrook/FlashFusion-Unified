import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  Search,
  Users,
  Globe,
  BarChart3,
  Target,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Eye,
  Star,
  MessageSquare
} from "lucide-react";

const mockUser = {
  id: "user123",
  name: "John Doe",
  email: "john@example.com",
  plan: "Pro Plan",
};

export default function MarketResearchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  
  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar user={mockUser} />
      
      <div className="lg:pl-64 flex flex-col flex-1">
        <Topbar title="AI-Powered Market Research & Trend Analysis" />
        
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 page-transition">
            <div className="max-w-6xl mx-auto space-y-6">
              {/* Header */}
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                  <h1 className="text-3xl font-bold text-slate-800">AI-Powered Market Research & Trend Analysis</h1>
                </div>
                <p className="text-lg text-slate-600 max-w-3xl mx-auto">
                  Get real-time market insights, competitor analysis, and trend monitoring powered by AI to validate your business ideas.
                </p>
              </div>

              {/* Market Search */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Search className="h-5 w-5 text-blue-500" />
                    <span>Market Intelligence Search</span>
                  </CardTitle>
                  <CardDescription>Research markets, competitors, and trends with AI-powered analysis</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex space-x-3">
                      <div className="flex-1">
                        <Input
                          placeholder="Enter industry, product, or market to research..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="text-lg"
                        />
                      </div>
                      <Button size="lg">
                        <Search className="h-4 w-4 mr-2" />
                        Analyze Market
                      </Button>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {["AI SaaS Tools", "E-commerce Platforms", "FinTech Apps", "HealthTech Solutions", "EdTech Platforms"].map((suggestion) => (
                        <Button
                          key={suggestion}
                          variant="outline"
                          size="sm"
                          onClick={() => setSearchQuery(suggestion)}
                        >
                          {suggestion}
                        </Button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Market Overview */}
              <Card>
                <CardHeader>
                  <CardTitle>Market Overview: AI SaaS Tools</CardTitle>
                  <CardDescription>Comprehensive market analysis and opportunity assessment</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <DollarSign className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                      <p className="text-2xl font-bold text-blue-700">$127.5B</p>
                      <p className="text-sm text-blue-600">Market Size (TAM)</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <TrendingUp className="h-8 w-8 mx-auto mb-2 text-green-600" />
                      <p className="text-2xl font-bold text-green-700">23.4%</p>
                      <p className="text-sm text-green-600">Annual Growth</p>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <Users className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                      <p className="text-2xl font-bold text-purple-700">2.3M</p>
                      <p className="text-sm text-purple-600">Active Companies</p>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <Target className="h-8 w-8 mx-auto mb-2 text-orange-600" />
                      <p className="text-2xl font-bold text-orange-700">High</p>
                      <p className="text-sm text-orange-600">Opportunity Score</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Market Maturity</h4>
                      <Progress value={65} className="h-3" />
                      <p className="text-sm text-slate-600 mt-1">Growing market with significant room for innovation</p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Competition Intensity</h4>
                      <Progress value={75} className="h-3" />
                      <p className="text-sm text-slate-600 mt-1">High competition but opportunities for differentiation</p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Entry Barriers</h4>
                      <Progress value={45} className="h-3" />
                      <p className="text-sm text-slate-600 mt-1">Moderate barriers - technology and capital requirements</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Competitor Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5 text-purple-500" />
                    <span>Competitor Analysis</span>
                  </CardTitle>
                  <CardDescription>Top competitors and market positioning analysis</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      {
                        name: "OpenAI",
                        marketShare: 35,
                        funding: "$13.5B",
                        valuation: "$157B",
                        strengths: ["Advanced AI models", "Strong brand", "Developer ecosystem"],
                        weaknesses: ["High costs", "API limitations", "Enterprise features"],
                        threat: "high"
                      },
                      {
                        name: "Anthropic",
                        marketShare: 15,
                        funding: "$7.3B",
                        valuation: "$41.5B",
                        strengths: ["Safety focus", "Constitutional AI", "Research quality"],
                        weaknesses: ["Limited integrations", "Newer platform", "Pricing"],
                        threat: "medium"
                      },
                      {
                        name: "Google AI",
                        marketShare: 25,
                        funding: "Internal",
                        valuation: "$2T+",
                        strengths: ["Infrastructure", "Integration", "Free tier"],
                        weaknesses: ["Complex platform", "Less focused", "Enterprise adoption"],
                        threat: "high"
                      }
                    ].map((competitor, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-medium text-lg">{competitor.name}</h4>
                            <div className="flex items-center space-x-4 text-sm text-slate-600 mt-1">
                              <span>{competitor.marketShare}% market share</span>
                              <span>Funding: {competitor.funding}</span>
                              <span>Valuation: {competitor.valuation}</span>
                            </div>
                          </div>
                          <Badge variant="outline" className={
                            competitor.threat === "high" ? "bg-red-100 text-red-800 border-red-300" :
                            competitor.threat === "medium" ? "bg-yellow-100 text-yellow-800 border-yellow-300" :
                            "bg-green-100 text-green-800 border-green-300"
                          }>
                            {competitor.threat} threat
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h5 className="font-medium text-sm text-green-700 mb-2">Strengths</h5>
                            <ul className="text-sm space-y-1">
                              {competitor.strengths.map((strength, i) => (
                                <li key={i} className="flex items-center space-x-2">
                                  <CheckCircle className="h-3 w-3 text-green-500" />
                                  <span>{strength}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h5 className="font-medium text-sm text-red-700 mb-2">Weaknesses</h5>
                            <ul className="text-sm space-y-1">
                              {competitor.weaknesses.map((weakness, i) => (
                                <li key={i} className="flex items-center space-x-2">
                                  <AlertTriangle className="h-3 w-3 text-red-500" />
                                  <span>{weakness}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Trend Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5 text-green-500" />
                    <span>Trend Analysis</span>
                  </CardTitle>
                  <CardDescription>Emerging trends and market movements</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-medium">Rising Trends</h4>
                      {[
                        { trend: "AI Agent Automation", growth: "+156%", period: "6 months" },
                        { trend: "No-Code AI Tools", growth: "+89%", period: "3 months" },
                        { trend: "AI-Powered Analytics", growth: "+73%", period: "6 months" },
                        { trend: "Conversational AI", growth: "+45%", period: "3 months" }
                      ].map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                          <div>
                            <h5 className="font-medium text-sm">{item.trend}</h5>
                            <p className="text-xs text-slate-600">Last {item.period}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-green-600">{item.growth}</p>
                            <TrendingUp className="h-4 w-4 text-green-500 ml-auto" />
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="space-y-4">
                      <h4 className="font-medium">Declining Trends</h4>
                      {[
                        { trend: "Traditional Analytics", decline: "-23%", period: "12 months" },
                        { trend: "Manual Data Entry", decline: "-34%", period: "6 months" },
                        { trend: "Rule-Based Systems", decline: "-18%", period: "12 months" },
                        { trend: "Legacy Dashboards", decline: "-27%", period: "6 months" }
                      ].map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                          <div>
                            <h5 className="font-medium text-sm">{item.trend}</h5>
                            <p className="text-xs text-slate-600">Last {item.period}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-red-600">{item.decline}</p>
                            <TrendingUp className="h-4 w-4 text-red-500 ml-auto rotate-180" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Social Sentiment */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <MessageSquare className="h-5 w-5 text-blue-500" />
                    <span>Social Media Sentiment</span>
                  </CardTitle>
                  <CardDescription>Real-time social media analysis and public sentiment</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600 mb-2">72%</div>
                      <div className="text-sm text-slate-600 mb-1">Positive Sentiment</div>
                      <div className="text-xs text-green-600">↗ +5% this week</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-yellow-600 mb-2">18%</div>
                      <div className="text-sm text-slate-600 mb-1">Neutral Sentiment</div>
                      <div className="text-xs text-slate-600">→ Stable</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-red-600 mb-2">10%</div>
                      <div className="text-sm text-slate-600 mb-1">Negative Sentiment</div>
                      <div className="text-xs text-red-600">↘ -2% this week</div>
                    </div>
                  </div>
                  
                  <div className="mt-6 space-y-3">
                    <h4 className="font-medium">Top Discussion Topics</h4>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { topic: "AI Safety", mentions: "12.3K" },
                        { topic: "Automation", mentions: "8.7K" },
                        { topic: "Future of Work", mentions: "6.2K" },
                        { topic: "Innovation", mentions: "4.9K" },
                        { topic: "Productivity", mentions: "3.8K" }
                      ].map((topic, index) => (
                        <Badge key={index} variant="outline" className="text-sm">
                          {topic.topic} ({topic.mentions})
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Market Opportunity Score */}
              <Card>
                <CardHeader>
                  <CardTitle>Market Opportunity Assessment</CardTitle>
                  <CardDescription>AI-powered evaluation of market potential for your idea</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center mb-6">
                    <div className="text-6xl font-bold text-green-600 mb-2">8.4</div>
                    <div className="text-lg font-medium text-slate-700 mb-1">Excellent Opportunity</div>
                    <div className="text-sm text-slate-600">Strong market potential with favorable conditions</div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Market Size</span>
                      <div className="flex items-center space-x-2">
                        <Progress value={95} className="w-32 h-2" />
                        <span className="text-sm text-slate-600">9.5/10</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Growth Potential</span>
                      <div className="flex items-center space-x-2">
                        <Progress value={88} className="w-32 h-2" />
                        <span className="text-sm text-slate-600">8.8/10</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Competition Level</span>
                      <div className="flex items-center space-x-2">
                        <Progress value={70} className="w-32 h-2" />
                        <span className="text-sm text-slate-600">7.0/10</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Entry Feasibility</span>
                      <div className="flex items-center space-x-2">
                        <Progress value={82} className="w-32 h-2" />
                        <span className="text-sm text-slate-600">8.2/10</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 p-4 bg-green-50 rounded-lg">
                    <h4 className="font-medium text-green-800 mb-2">Key Insights</h4>
                    <ul className="text-sm text-green-700 space-y-1">
                      <li>• Large addressable market with strong growth trajectory</li>
                      <li>• High demand for AI automation solutions</li>
                      <li>• Opportunity for differentiation through specialized features</li>
                      <li>• Favorable regulatory environment for AI tools</li>
                    </ul>
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