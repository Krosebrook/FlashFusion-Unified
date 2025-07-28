import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Search, TrendingUp, BarChart3, Globe, AlertCircle, CheckCircle } from "lucide-react";

const mockUser = {
  id: "user123",
  name: "John Doe",
  email: "john@example.com",
  plan: "Pro"
};

const seoMetrics = [
  {
    name: "Domain Authority",
    value: 42,
    change: +5,
    status: "good"
  },
  {
    name: "Page Speed",
    value: 87,
    change: +12,
    status: "excellent"
  },
  {
    name: "Mobile Friendly",
    value: 95,
    change: 0,
    status: "excellent"
  },
  {
    name: "Core Web Vitals",
    value: 78,
    change: -3,
    status: "good"
  }
];

const keywordData = [
  {
    keyword: "ai business ideas",
    position: 12,
    volume: 2400,
    difficulty: "Medium",
    trend: "up"
  },
  {
    keyword: "startup idea generator",
    position: 8,
    volume: 1800,
    difficulty: "Low",
    trend: "up"
  },
  {
    keyword: "business plan ai",
    position: 23,
    volume: 3200,
    difficulty: "High",
    trend: "down"
  },
  {
    keyword: "automated content creation",
    position: 15,
    volume: 1500,
    difficulty: "Medium",
    trend: "stable"
  }
];

const seoIssues = [
  {
    type: "error",
    title: "Missing meta descriptions",
    count: 3,
    priority: "High"
  },
  {
    type: "warning",
    title: "Images without alt text",
    count: 7,
    priority: "Medium"
  },
  {
    type: "info",
    title: "Internal links opportunities",
    count: 12,
    priority: "Low"
  }
];

export default function SEO() {
  const [url, setUrl] = useState("");
  const [keyword, setKeyword] = useState("");
  const [analyzing, setAnalyzing] = useState(false);

  const { data: seoScore } = useQuery({
    queryKey: ['/api/seo/score'],
    queryFn: () => ({
      overall: 78,
      technical: 85,
      content: 72,
      authority: 76,
      userExperience: 82
    }),
  });

  const handleAnalyze = async () => {
    if (!url) return;
    setAnalyzing(true);
    // Simulate analysis
    setTimeout(() => setAnalyzing(false), 2000);
  };

  const handleKeywordResearch = async () => {
    if (!keyword) return;
    console.log(`Researching keyword: ${keyword}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "excellent": return "text-green-600 bg-green-100";
      case "good": return "text-blue-600 bg-blue-100";
      case "warning": return "text-yellow-600 bg-yellow-100";
      case "poor": return "text-red-600 bg-red-100";
      default: return "text-slate-600 bg-slate-100";
    }
  };

  const getIssueIcon = (type: string) => {
    switch (type) {
      case "error": return <AlertCircle className="h-4 w-4 text-red-500" />;
      case "warning": return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case "info": return <CheckCircle className="h-4 w-4 text-blue-500" />;
      default: return <CheckCircle className="h-4 w-4 text-slate-500" />;
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      <Sidebar user={mockUser} />
      
      <div className="lg:pl-64 flex flex-col flex-1">
        <Topbar title="SEO Tools" />
        
        <main className="flex-1 overflow-y-auto">
          <div className="px-6 py-8">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-slate-900 flex items-center">
                <Search className="h-6 w-6 mr-3 text-primary" />
                SEO Tools
              </h1>
              <p className="text-slate-600 mt-1">Optimize your website for search engines</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* SEO Analysis */}
                <Card>
                  <CardHeader>
                    <CardTitle>Website Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex space-x-4">
                        <Input
                          placeholder="Enter website URL..."
                          value={url}
                          onChange={(e) => setUrl(e.target.value)}
                          className="flex-1"
                        />
                        <Button onClick={handleAnalyze} disabled={analyzing || !url}>
                          {analyzing ? "Analyzing..." : "Analyze"}
                        </Button>
                      </div>
                      
                      {seoScore && (
                        <div className="mt-6">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="font-medium text-slate-900">Overall SEO Score</h3>
                            <span className="text-2xl font-bold text-primary">{seoScore.overall}/100</span>
                          </div>
                          
                          <div className="space-y-4">
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span>Technical SEO</span>
                                <span>{seoScore.technical}/100</span>
                              </div>
                              <Progress value={seoScore.technical} className="h-2" />
                            </div>
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span>Content Quality</span>
                                <span>{seoScore.content}/100</span>
                              </div>
                              <Progress value={seoScore.content} className="h-2" />
                            </div>
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span>Domain Authority</span>
                                <span>{seoScore.authority}/100</span>
                              </div>
                              <Progress value={seoScore.authority} className="h-2" />
                            </div>
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span>User Experience</span>
                                <span>{seoScore.userExperience}/100</span>
                              </div>
                              <Progress value={seoScore.userExperience} className="h-2" />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Keyword Research */}
                <Card>
                  <CardHeader>
                    <CardTitle>Keyword Research</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex space-x-4">
                        <Input
                          placeholder="Enter seed keyword..."
                          value={keyword}
                          onChange={(e) => setKeyword(e.target.value)}
                          className="flex-1"
                        />
                        <Button onClick={handleKeywordResearch} disabled={!keyword}>
                          Research
                        </Button>
                      </div>
                      
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-slate-200">
                              <th className="text-left p-2 font-medium text-slate-700">Keyword</th>
                              <th className="text-left p-2 font-medium text-slate-700">Position</th>
                              <th className="text-left p-2 font-medium text-slate-700">Volume</th>
                              <th className="text-left p-2 font-medium text-slate-700">Difficulty</th>
                              <th className="text-left p-2 font-medium text-slate-700">Trend</th>
                            </tr>
                          </thead>
                          <tbody>
                            {keywordData.map((item, index) => (
                              <tr key={index} className="border-b border-slate-100">
                                <td className="p-2 text-slate-900">{item.keyword}</td>
                                <td className="p-2">
                                  <Badge variant="secondary">#{item.position}</Badge>
                                </td>
                                <td className="p-2 text-slate-600">{item.volume.toLocaleString()}</td>
                                <td className="p-2">
                                  <Badge 
                                    variant="secondary" 
                                    className={item.difficulty === "High" ? "text-red-600" : 
                                              item.difficulty === "Medium" ? "text-yellow-600" : 
                                              "text-green-600"}
                                  >
                                    {item.difficulty}
                                  </Badge>
                                </td>
                                <td className="p-2">
                                  <TrendingUp className={`h-4 w-4 ${
                                    item.trend === "up" ? "text-green-500" : 
                                    item.trend === "down" ? "text-red-500" : 
                                    "text-slate-400"
                                  }`} />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Content Optimization */}
                <Card>
                  <CardHeader>
                    <CardTitle>Content Optimization</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Target Keyword
                        </label>
                        <Input placeholder="e.g., ai business ideas" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Content to Optimize
                        </label>
                        <Textarea 
                          placeholder="Paste your content here..."
                          rows={6}
                          className="resize-none"
                        />
                      </div>
                      <Button className="w-full">
                        Optimize Content
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* SEO Metrics */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium text-slate-600">SEO Metrics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {seoMetrics.map((metric, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-slate-900">{metric.name}</p>
                            <div className="flex items-center space-x-1 mt-1">
                              <span className={`text-xs ${metric.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {metric.change >= 0 ? '+' : ''}{metric.change}
                              </span>
                              <Badge variant="secondary" className={`text-xs ${getStatusColor(metric.status)}`}>
                                {metric.status}
                              </Badge>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-lg font-bold text-slate-900">{metric.value}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* SEO Issues */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium text-slate-600">SEO Issues</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {seoIssues.map((issue, index) => (
                        <div key={index} className="flex items-start space-x-3 p-3 border border-slate-200 rounded-lg">
                          {getIssueIcon(issue.type)}
                          <div className="flex-1">
                            <p className="text-sm font-medium text-slate-900">{issue.title}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className="text-xs text-slate-500">{issue.count} issues</span>
                              <Badge variant="secondary" className="text-xs">
                                {issue.priority}
                              </Badge>
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
                    <CardTitle className="text-sm font-medium text-slate-600">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button variant="outline" className="w-full justify-start" size="sm">
                      <Globe className="h-4 w-4 mr-2" />
                      Submit to Google
                    </Button>
                    <Button variant="outline" className="w-full justify-start" size="sm">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Generate Report
                    </Button>
                    <Button variant="outline" className="w-full justify-start" size="sm">
                      <Search className="h-4 w-4 mr-2" />
                      Competitor Analysis
                    </Button>
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