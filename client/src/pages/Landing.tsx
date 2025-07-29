import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, MessageCircle, Smartphone, CreditCard, Shield } from "lucide-react";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-indigo-900">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Welcome to <span className="text-indigo-600">FlashFusion-United</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            The next-generation platform that combines cutting-edge technology with seamless user experience. 
            Connect, communicate, and grow your business with our powerful SMS and chat platform.
          </p>
          <Button onClick={handleLogin} size="lg" className="bg-indigo-600 hover:bg-indigo-700">
            Get Started <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <Card className="text-center">
            <CardHeader>
              <MessageCircle className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
              <CardTitle>Real-time Chat</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Connect with users instantly through our powerful chat system with live messaging
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Smartphone className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
              <CardTitle>SMS Integration</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Send SMS messages directly from the platform with Twilio integration
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <CreditCard className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
              <CardTitle>Secure Payments</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Integrated Stripe payments for subscriptions and one-time purchases
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Shield className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
              <CardTitle>Enterprise Security</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Bank-level security with Replit authentication and encrypted communications
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-3xl font-bold text-indigo-600">99.9%</div>
            <div className="text-gray-600 dark:text-gray-300">Uptime</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-indigo-600">50K+</div>
            <div className="text-gray-600 dark:text-gray-300">Active Users</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-indigo-600">150+</div>
            <div className="text-gray-600 dark:text-gray-300">Countries</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-indigo-600">24/7</div>
            <div className="text-gray-600 dark:text-gray-300">Support</div>
          </div>
        </div>
      </div>
    </div>
  );
}