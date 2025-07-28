import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { CreditCard, DollarSign, TrendingUp, Calendar, Check, Zap } from "lucide-react";

const mockUser = {
  id: "user123",
  name: "John Doe",
  email: "john@example.com",
  plan: "Free"
};

const plans = [
  {
    name: "Free",
    price: 0,
    period: "forever",
    features: [
      "5 AI agent runs per month",
      "Basic templates",
      "Community support",
      "Standard processing speed"
    ],
    limitations: [
      "Limited customization",
      "Watermarked exports",
      "Basic analytics"
    ],
    popular: false
  },
  {
    name: "Pro",
    price: 29,
    period: "month",
    features: [
      "Unlimited AI agent runs",
      "Premium templates",
      "Priority support",
      "Fast processing speed",
      "Custom branding",
      "Advanced analytics",
      "API access"
    ],
    limitations: [],
    popular: true
  },
  {
    name: "Enterprise",
    price: 99,
    period: "month",
    features: [
      "Everything in Pro",
      "White-label solution",
      "Custom integrations",
      "Dedicated support",
      "SLA guarantee",
      "Team collaboration",
      "Advanced security"
    ],
    limitations: [],
    popular: false
  }
];

const billingHistory = [
  {
    id: "inv_001",
    date: "2024-12-01",
    amount: 29.00,
    status: "paid",
    plan: "Pro Monthly",
    invoice: "#INV-001"
  },
  {
    id: "inv_002", 
    date: "2024-11-01",
    amount: 29.00,
    status: "paid",
    plan: "Pro Monthly",
    invoice: "#INV-002"
  },
  {
    id: "inv_003",
    date: "2024-10-01", 
    amount: 29.00,
    status: "paid",
    plan: "Pro Monthly",
    invoice: "#INV-003"
  }
];

export default function Payments() {
  const [isYearly, setIsYearly] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("Pro");

  const { data: usage } = useQuery({
    queryKey: ['/api/usage/current'],
    queryFn: () => ({
      agentRuns: 142,
      limit: 200,
      resetDate: "2025-02-01",
      currentPlan: "Pro"
    }),
  });

  const { data: subscription } = useQuery({
    queryKey: ['/api/subscription/current'],
    queryFn: () => ({
      status: "active",
      plan: "Pro",
      nextBilling: "2025-02-01",
      amount: 29.00,
      cancelAtPeriodEnd: false
    }),
  });

  const handleUpgrade = (planName: string) => {
    setSelectedPlan(planName);
    // Simulate Stripe checkout
    console.log(`Upgrading to ${planName}`);
  };

  const getDiscountedPrice = (price: number) => {
    return isYearly ? Math.round(price * 10) : price; // 2 months free yearly
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      <Sidebar user={mockUser} />
      
      <div className="lg:pl-64 flex flex-col flex-1">
        <Topbar title="Billing & Plans" />
        
        <main className="flex-1 overflow-y-auto">
          <div className="px-6 py-8">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-slate-900 flex items-center">
                <CreditCard className="h-6 w-6 mr-3 text-primary" />
                Billing & Plans
              </h1>
              <p className="text-slate-600 mt-1">Manage your subscription and billing information</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Current Plan & Usage */}
              <div className="lg:col-span-2 space-y-6">
                {/* Current Usage */}
                <Card>
                  <CardHeader>
                    <CardTitle>Current Usage</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <div className="text-2xl font-bold text-slate-900">{usage?.agentRuns || 0}</div>
                        <p className="text-sm text-slate-600">AI Agent Runs</p>
                        <p className="text-xs text-slate-500 mt-1">of {usage?.limit || 0} included</p>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-slate-900">${subscription?.amount || 0}</div>
                        <p className="text-sm text-slate-600">Current Plan</p>
                        <Badge variant="secondary" className="mt-1">{subscription?.plan || 'Free'}</Badge>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-slate-900">{subscription?.nextBilling || 'N/A'}</div>
                        <p className="text-sm text-slate-600">Next Billing</p>
                        <p className="text-xs text-slate-500 mt-1">Auto-renewal</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Plan Selection */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Choose Your Plan</CardTitle>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-slate-600">Monthly</span>
                        <Switch checked={isYearly} onCheckedChange={setIsYearly} />
                        <span className="text-sm text-slate-600">Yearly</span>
                        <Badge variant="secondary" className="ml-2">Save 17%</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {plans.map((plan) => (
                        <div 
                          key={plan.name}
                          className={`relative p-6 rounded-lg border-2 transition-all ${
                            plan.popular 
                              ? 'border-primary bg-primary/5' 
                              : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          {plan.popular && (
                            <Badge className="absolute -top-2 left-4 bg-primary">
                              Most Popular
                            </Badge>
                          )}
                          
                          <div className="text-center mb-4">
                            <h3 className="text-lg font-semibold text-slate-900">{plan.name}</h3>
                            <div className="mt-2">
                              <span className="text-3xl font-bold text-slate-900">
                                ${getDiscountedPrice(plan.price)}
                              </span>
                              <span className="text-slate-600">
                                /{isYearly && plan.price > 0 ? 'year' : plan.period}
                              </span>
                            </div>
                          </div>

                          <ul className="space-y-2 mb-6">
                            {plan.features.map((feature, index) => (
                              <li key={index} className="flex items-center text-sm">
                                <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                                <span className="text-slate-700">{feature}</span>
                              </li>
                            ))}
                          </ul>

                          <Button 
                            className="w-full"
                            variant={plan.popular ? "default" : "outline"}
                            onClick={() => handleUpgrade(plan.name)}
                            disabled={subscription?.plan === plan.name}
                          >
                            {subscription?.plan === plan.name ? 'Current Plan' : `Choose ${plan.name}`}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Billing History */}
                <Card>
                  <CardHeader>
                    <CardTitle>Billing History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {billingHistory.map((bill) => (
                        <div key={bill.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                              <DollarSign className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                              <p className="font-medium text-slate-900">{bill.plan}</p>
                              <p className="text-sm text-slate-600">{bill.date}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-slate-900">${bill.amount.toFixed(2)}</p>
                            <div className="flex items-center space-x-2">
                              <Badge variant="secondary" className="text-green-600">
                                {bill.status}
                              </Badge>
                              <Button variant="ghost" size="sm">
                                Download
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium text-slate-600">Quick Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Monthly Savings</span>
                      <span className="font-medium text-green-600">$0</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Usage This Month</span>
                      <span className="font-medium text-slate-900">71%</span>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Account Status</span>
                      <Badge variant="secondary" className="text-green-600">Active</Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium text-slate-600">Need Help?</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button variant="outline" className="w-full justify-start" size="sm">
                      <Calendar className="h-4 w-4 mr-2" />
                      Schedule Demo
                    </Button>
                    <Button variant="outline" className="w-full justify-start" size="sm">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Usage Analytics
                    </Button>
                    <Button variant="outline" className="w-full justify-start" size="sm">
                      <Zap className="h-4 w-4 mr-2" />
                      Contact Sales
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium text-slate-600">Payment Methods</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-3 p-3 border border-slate-200 rounded-lg">
                        <CreditCard className="h-5 w-5 text-slate-400" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-slate-900">•••• 4242</p>
                          <p className="text-xs text-slate-500">Expires 12/26</p>
                        </div>
                        <Badge variant="secondary">Default</Badge>
                      </div>
                      <Button variant="outline" className="w-full" size="sm">
                        Add Payment Method
                      </Button>
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