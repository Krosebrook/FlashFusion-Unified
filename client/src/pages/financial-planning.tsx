import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { 
  DollarSign, 
  TrendingUp,
  Calculator,
  PieChart,
  BarChart3,
  Target,
  Users,
  Calendar,
  FileText,
  Lightbulb,
  Building
} from "lucide-react";

const mockUser = {
  id: "user123",
  name: "John Doe",
  email: "john@example.com",
  plan: "Pro Plan",
};

export default function FinancialPlanningPage() {
  const [revenue, setRevenue] = useState({
    monthly: 10000,
    growth: 15,
    customers: 100,
    averageValue: 100
  });
  
  const [costs, setCosts] = useState({
    cogs: 30,
    marketing: 25,
    operations: 20,
    development: 15
  });

  const [marketData, setMarketData] = useState({
    size: 1000000000,
    growth: 12,
    competition: "medium"
  });

  const calculateProjections = () => {
    const months = 36;
    const projections = [];
    let currentRevenue = revenue.monthly;
    
    for (let i = 1; i <= months; i++) {
      const monthlyGrowth = revenue.growth / 100 / 12;
      currentRevenue *= (1 + monthlyGrowth);
      
      const totalCosts = currentRevenue * (costs.cogs + costs.marketing + costs.operations + costs.development) / 100;
      const profit = currentRevenue - totalCosts;
      
      projections.push({
        month: i,
        revenue: Math.round(currentRevenue),
        costs: Math.round(totalCosts),
        profit: Math.round(profit),
        margin: Math.round((profit / currentRevenue) * 100)
      });
    }
    return projections;
  };

  const projections = calculateProjections();
  const year1Revenue = projections.slice(0, 12).reduce((sum, p) => sum + p.revenue, 0);
  const year2Revenue = projections.slice(12, 24).reduce((sum, p) => sum + p.revenue, 0);
  const year3Revenue = projections.slice(24, 36).reduce((sum, p) => sum + p.revenue, 0);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar user={mockUser} />
      
      <div className="lg:pl-64 flex flex-col flex-1">
        <Topbar title="Financial Planning & Business Validation" />
        
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 page-transition">
            <div className="max-w-6xl mx-auto space-y-6">
              {/* Header */}
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl flex items-center justify-center">
                    <Calculator className="h-6 w-6 text-white" />
                  </div>
                  <h1 className="text-3xl font-bold text-slate-800">Financial Planning & Business Validation</h1>
                </div>
                <p className="text-lg text-slate-600 max-w-3xl mx-auto">
                  Build comprehensive financial models, validate your business assumptions, and create investor-ready projections.
                </p>
              </div>

              {/* Revenue Projections */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5 text-green-500" />
                    <span>Revenue Projections</span>
                  </CardTitle>
                  <CardDescription>Configure your revenue model and growth assumptions</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Monthly Revenue: ${revenue.monthly.toLocaleString()}</Label>
                        <Slider
                          value={[revenue.monthly]}
                          onValueChange={(value) => setRevenue({...revenue, monthly: value[0]})}
                          max={100000}
                          min={1000}
                          step={1000}
                          className="w-full"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Annual Growth Rate: {revenue.growth}%</Label>
                        <Slider
                          value={[revenue.growth]}
                          onValueChange={(value) => setRevenue({...revenue, growth: value[0]})}
                          max={100}
                          min={5}
                          step={5}
                          className="w-full"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Customer Count: {revenue.customers}</Label>
                        <Slider
                          value={[revenue.customers]}
                          onValueChange={(value) => setRevenue({...revenue, customers: value[0]})}
                          max={10000}
                          min={10}
                          step={10}
                          className="w-full"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Average Customer Value: ${revenue.averageValue}</Label>
                        <Slider
                          value={[revenue.averageValue]}
                          onValueChange={(value) => setRevenue({...revenue, averageValue: value[0]})}
                          max={1000}
                          min={10}
                          step={10}
                          className="w-full"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <DollarSign className="h-8 w-8 mx-auto mb-2 text-green-600" />
                      <p className="text-2xl font-bold text-green-700">${(year1Revenue / 1000000).toFixed(1)}M</p>
                      <p className="text-sm text-green-600">Year 1 Revenue</p>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <TrendingUp className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                      <p className="text-2xl font-bold text-blue-700">${(year2Revenue / 1000000).toFixed(1)}M</p>
                      <p className="text-sm text-blue-600">Year 2 Revenue</p>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <Target className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                      <p className="text-2xl font-bold text-purple-700">${(year3Revenue / 1000000).toFixed(1)}M</p>
                      <p className="text-sm text-purple-600">Year 3 Revenue</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Cost Structure */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <PieChart className="h-5 w-5 text-orange-500" />
                    <span>Cost Structure</span>
                  </CardTitle>
                  <CardDescription>Define your cost breakdown as percentage of revenue</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Cost of Goods Sold: {costs.cogs}%</Label>
                        <Slider
                          value={[costs.cogs]}
                          onValueChange={(value) => setCosts({...costs, cogs: value[0]})}
                          max={60}
                          min={5}
                          step={5}
                          className="w-full"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Marketing & Sales: {costs.marketing}%</Label>
                        <Slider
                          value={[costs.marketing]}
                          onValueChange={(value) => setCosts({...costs, marketing: value[0]})}
                          max={50}
                          min={5}
                          step={5}
                          className="w-full"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Operations: {costs.operations}%</Label>
                        <Slider
                          value={[costs.operations]}
                          onValueChange={(value) => setCosts({...costs, operations: value[0]})}
                          max={40}
                          min={5}
                          step={5}
                          className="w-full"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Development & R&D: {costs.development}%</Label>
                        <Slider
                          value={[costs.development]}
                          onValueChange={(value) => setCosts({...costs, development: value[0]})}
                          max={30}
                          min={5}
                          step={5}
                          className="w-full"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3 pt-4 border-t">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Total Costs:</span>
                      <span className="font-bold">{costs.cogs + costs.marketing + costs.operations + costs.development}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Profit Margin:</span>
                      <span className="font-bold text-green-600">{100 - (costs.cogs + costs.marketing + costs.operations + costs.development)}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Market Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5 text-blue-500" />
                    <span>Market Analysis</span>
                  </CardTitle>
                  <CardDescription>Analyze your target market and competitive landscape</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="market-size">Total Addressable Market (TAM)</Label>
                        <Input
                          id="market-size"
                          type="number"
                          value={marketData.size}
                          onChange={(e) => setMarketData({...marketData, size: parseInt(e.target.value) || 0})}
                          placeholder="e.g., 1000000000"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Market Growth Rate: {marketData.growth}%</Label>
                        <Slider
                          value={[marketData.growth]}
                          onValueChange={(value) => setMarketData({...marketData, growth: value[0]})}
                          max={50}
                          min={0}
                          step={1}
                          className="w-full"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="competition">Competition Level</Label>
                        <Select value={marketData.competition} onValueChange={(value) => setMarketData({...marketData, competition: value})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low Competition</SelectItem>
                            <SelectItem value="medium">Medium Competition</SelectItem>
                            <SelectItem value="high">High Competition</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <h4 className="font-medium mb-2">Market Opportunity</h4>
                        <p className="text-sm text-slate-600">
                          ${(marketData.size / 1000000000).toFixed(1)}B TAM with {marketData.growth}% growth indicates a {
                            marketData.size > 1000000000 && marketData.growth > 10 ? "strong" : 
                            marketData.size > 100000000 && marketData.growth > 5 ? "moderate" : "limited"
                          } market opportunity.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Business Model Canvas */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Building className="h-5 w-5 text-purple-500" />
                    <span>Business Model Canvas</span>
                  </CardTitle>
                  <CardDescription>AI-generated business model framework</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2 text-purple-600">Value Propositions</h4>
                      <ul className="text-sm text-slate-600 space-y-1">
                        <li>• Cost reduction through automation</li>
                        <li>• Improved efficiency and productivity</li>
                        <li>• Data-driven insights and analytics</li>
                      </ul>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2 text-blue-600">Customer Segments</h4>
                      <ul className="text-sm text-slate-600 space-y-1">
                        <li>• Small to medium businesses</li>
                        <li>• Enterprise organizations</li>
                        <li>• Individual entrepreneurs</li>
                      </ul>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2 text-green-600">Revenue Streams</h4>
                      <ul className="text-sm text-slate-600 space-y-1">
                        <li>• Monthly subscription fees</li>
                        <li>• Usage-based pricing</li>
                        <li>• Premium feature upgrades</li>
                      </ul>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2 text-orange-600">Key Resources</h4>
                      <ul className="text-sm text-slate-600 space-y-1">
                        <li>• AI technology platform</li>
                        <li>• Development team</li>
                        <li>• Customer database</li>
                      </ul>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2 text-red-600">Key Activities</h4>
                      <ul className="text-sm text-slate-600 space-y-1">
                        <li>• Product development</li>
                        <li>• Customer acquisition</li>
                        <li>• Data processing</li>
                      </ul>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2 text-pink-600">Key Partnerships</h4>
                      <ul className="text-sm text-slate-600 space-y-1">
                        <li>• Technology providers</li>
                        <li>• Channel partners</li>
                        <li>• Integration partners</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Investment Requirements */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="h-5 w-5 text-green-500" />
                    <span>Investment & Funding</span>
                  </CardTitle>
                  <CardDescription>Calculate funding requirements and investor returns</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-medium">Funding Requirements</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 bg-slate-50 rounded">
                          <span>Product Development</span>
                          <span className="font-medium">$500K</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-slate-50 rounded">
                          <span>Marketing & Sales</span>
                          <span className="font-medium">$300K</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-slate-50 rounded">
                          <span>Operations</span>
                          <span className="font-medium">$200K</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-green-100 rounded border-t-2 border-green-500">
                          <span className="font-medium">Total Funding Needed</span>
                          <span className="font-bold text-green-700">$1.0M</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h4 className="font-medium">Investor Returns (5 Years)</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 bg-slate-50 rounded">
                          <span>Projected Valuation</span>
                          <span className="font-medium">$50M</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-slate-50 rounded">
                          <span>ROI Multiple</span>
                          <span className="font-medium">50x</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-slate-50 rounded">
                          <span>Annual IRR</span>
                          <span className="font-medium">115%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 text-center">
                    <Button size="lg" className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700">
                      <FileText className="h-5 w-5 mr-2" />
                      Generate Pitch Deck
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Financial Health Score */}
              <Card>
                <CardHeader>
                  <CardTitle>Financial Health Score</CardTitle>
                  <CardDescription>AI-powered assessment of your business model</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center mb-6">
                    <div className="text-6xl font-bold text-green-600 mb-2">85</div>
                    <div className="text-lg font-medium text-slate-700 mb-1">Excellent</div>
                    <div className="text-sm text-slate-600">Your business model shows strong potential</div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Market Opportunity</span>
                      <div className="flex items-center space-x-2">
                        <Progress value={90} className="w-32 h-2" />
                        <span className="text-sm text-slate-600">90%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Financial Projections</span>
                      <div className="flex items-center space-x-2">
                        <Progress value={85} className="w-32 h-2" />
                        <span className="text-sm text-slate-600">85%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Competitive Position</span>
                      <div className="flex items-center space-x-2">
                        <Progress value={75} className="w-32 h-2" />
                        <span className="text-sm text-slate-600">75%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Execution Feasibility</span>
                      <div className="flex items-center space-x-2">
                        <Progress value={80} className="w-32 h-2" />
                        <span className="text-sm text-slate-600">80%</span>
                      </div>
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