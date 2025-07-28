import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { 
  Smartphone, 
  Tablet,
  Download,
  Bell,
  Mic,
  Wifi,
  Battery,
  RotateCcw as Sync,
  Cloud,
  Share2,
  Camera,
  Globe,
  Star,
  CheckCircle
} from "lucide-react";

const mockUser = {
  id: "user123",
  name: "John Doe", 
  email: "john@example.com",
  plan: "Pro Plan",
};

export default function MobileAppPage() {
  const [notifications, setNotifications] = useState(true);
  const [voiceInput, setVoiceInput] = useState(false);
  const [offlineMode, setOfflineMode] = useState(true);

  const features = [
    {
      icon: <Mic className="h-6 w-6 text-blue-500" />,
      title: "Voice-to-Text Idea Creation",
      description: "Create business ideas using voice commands with AI transcription",
      status: "available"
    },
    {
      icon: <Bell className="h-6 w-6 text-green-500" />,
      title: "Push Notifications",
      description: "Real-time alerts for AI task completions and team updates",
      status: "available"
    },
    {
      icon: <Wifi className="h-6 w-6 text-purple-500" />,
      title: "Offline Capabilities",
      description: "Continue working on ideas even without internet connection",
      status: "available"
    },
    {
      icon: <Sync className="h-6 w-6 text-orange-500" />,
      title: "Cross-Device Sync",
      description: "Seamless synchronization across all your devices",
      status: "available"
    },
    {
      icon: <Camera className="h-6 w-6 text-pink-500" />,
      title: "Image Recognition",
      description: "Scan business cards and documents to extract ideas",
      status: "coming-soon"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar user={mockUser} />
      
      <div className="lg:pl-64 flex flex-col flex-1">
        <Topbar title="Mobile App & PWA" />
        
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 page-transition">
            <div className="max-w-6xl mx-auto space-y-6">
              {/* Header */}
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                    <Smartphone className="h-6 w-6 text-white" />
                  </div>
                  <h1 className="text-3xl font-bold text-slate-800">Mobile App & PWA</h1>
                </div>
                <p className="text-lg text-slate-600 max-w-3xl mx-auto">
                  Access FlashFusion on any device with our native mobile apps and Progressive Web App with offline capabilities.
                </p>
              </div>

              {/* App Downloads */}
              <Card>
                <CardHeader>
                  <CardTitle>Download Mobile Apps</CardTitle>
                  <CardDescription>Get the native FlashFusion experience on your mobile device</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-6 border rounded-lg text-center bg-gradient-to-br from-blue-50 to-indigo-50">
                      <div className="w-16 h-16 bg-black rounded-xl flex items-center justify-center mx-auto mb-4">
                        <span className="text-white font-bold text-xl">📱</span>
                      </div>
                      <h3 className="font-semibold text-lg mb-2">iOS App</h3>
                      <p className="text-slate-600 mb-4">Available on the App Store for iPhone and iPad</p>
                      <div className="flex items-center justify-center space-x-2 mb-4">
                        <div className="flex items-center space-x-1">
                          {[1,2,3,4,5].map((star) => (
                            <Star key={star} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                        <span className="text-sm text-slate-600">4.8 (2.1k reviews)</span>
                      </div>
                      <Button className="w-full bg-black hover:bg-gray-800">
                        <Download className="h-4 w-4 mr-2" />
                        Download on App Store
                      </Button>
                    </div>
                    
                    <div className="p-6 border rounded-lg text-center bg-gradient-to-br from-green-50 to-emerald-50">
                      <div className="w-16 h-16 bg-green-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                        <span className="text-white font-bold text-xl">🤖</span>
                      </div>
                      <h3 className="font-semibold text-lg mb-2">Android App</h3>
                      <p className="text-slate-600 mb-4">Available on Google Play Store</p>
                      <div className="flex items-center justify-center space-x-2 mb-4">
                        <div className="flex items-center space-x-1">
                          {[1,2,3,4,5].map((star) => (
                            <Star key={star} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                        <span className="text-sm text-slate-600">4.7 (1.8k reviews)</span>
                      </div>
                      <Button className="w-full bg-green-500 hover:bg-green-600">
                        <Download className="h-4 w-4 mr-2" />
                        Get it on Google Play
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* PWA Features */}
              <Card>
                <CardHeader>
                  <CardTitle>Progressive Web App</CardTitle>
                  <CardDescription>Install FlashFusion as a web app for a native-like experience</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 border rounded-lg text-center">
                      <Globe className="h-8 w-8 mx-auto mb-3 text-blue-500" />
                      <h4 className="font-medium mb-2">Install from Browser</h4>
                      <p className="text-sm text-slate-600">Add to home screen directly from your web browser</p>
                    </div>
                    <div className="p-4 border rounded-lg text-center">
                      <Wifi className="h-8 w-8 mx-auto mb-3 text-green-500" />
                      <h4 className="font-medium mb-2">Works Offline</h4>
                      <p className="text-sm text-slate-600">Continue working even without internet connection</p>
                    </div>
                    <div className="p-4 border rounded-lg text-center">
                      <Bell className="h-8 w-8 mx-auto mb-3 text-purple-500" />
                      <h4 className="font-medium mb-2">Push Notifications</h4>
                      <p className="text-sm text-slate-600">Get real-time updates and reminders</p>
                    </div>
                  </div>
                  <div className="mt-6 text-center">
                    <Button size="lg" className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                      <Download className="h-5 w-5 mr-2" />
                      Install PWA
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Mobile Features */}
              <Card>
                <CardHeader>
                  <CardTitle>Mobile Features</CardTitle>
                  <CardDescription>Specialized features designed for mobile productivity</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {features.map((feature, index) => (
                      <div key={index} className="flex items-start space-x-4 p-4 border rounded-lg">
                        <div className="flex-shrink-0">{feature.icon}</div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="font-medium">{feature.title}</h4>
                            <Badge variant="outline" className={
                              feature.status === "available" 
                                ? "bg-green-100 text-green-800 border-green-300"
                                : "bg-yellow-100 text-yellow-800 border-yellow-300"
                            }>
                              {feature.status === "available" ? "Available" : "Coming Soon"}
                            </Badge>
                          </div>
                          <p className="text-slate-600">{feature.description}</p>
                        </div>
                        {feature.status === "available" && (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Mobile Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Mobile Settings</CardTitle>
                  <CardDescription>Configure your mobile app experience</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium">Push Notifications</h4>
                        <p className="text-sm text-slate-600">Receive alerts for AI completions and team updates</p>
                      </div>
                      <Switch checked={notifications} onCheckedChange={setNotifications} />
                    </div>
                    
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium">Voice Input</h4>
                        <p className="text-sm text-slate-600">Enable voice-to-text for idea creation</p>
                      </div>
                      <Switch checked={voiceInput} onCheckedChange={setVoiceInput} />
                    </div>
                    
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium">Offline Mode</h4>
                        <p className="text-sm text-slate-600">Cache content for offline access</p>
                      </div>
                      <Switch checked={offlineMode} onCheckedChange={setOfflineMode} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Sync Status */}
              <Card>
                <CardHeader>
                  <CardTitle>Device Sync Status</CardTitle>
                  <CardDescription>Track synchronization across your devices</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Smartphone className="h-5 w-5 text-blue-500" />
                        <div>
                          <h4 className="font-medium">iPhone 15 Pro</h4>
                          <p className="text-sm text-slate-600">Last sync: 2 minutes ago</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-green-600">Synced</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Tablet className="h-5 w-5 text-purple-500" />
                        <div>
                          <h4 className="font-medium">iPad Air</h4>
                          <p className="text-sm text-slate-600">Last sync: 5 minutes ago</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-green-600">Synced</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Globe className="h-5 w-5 text-orange-500" />
                        <div>
                          <h4 className="font-medium">Web Browser</h4>
                          <p className="text-sm text-slate-600">Active session</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-sm text-blue-600">Online</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Usage Statistics */}
              <Card>
                <CardHeader>
                  <CardTitle>Mobile Usage</CardTitle>
                  <CardDescription>Your mobile app usage statistics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                      <Battery className="h-8 w-8 mx-auto mb-2 text-green-500" />
                      <p className="text-2xl font-bold">12h</p>
                      <p className="text-sm text-slate-600">Daily Usage</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <Cloud className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                      <p className="text-2xl font-bold">2.3GB</p>
                      <p className="text-sm text-slate-600">Data Synced</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <Share2 className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                      <p className="text-2xl font-bold">47</p>
                      <p className="text-sm text-slate-600">Ideas Created</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <Sync className="h-8 w-8 mx-auto mb-2 text-orange-500" />
                      <p className="text-2xl font-bold">99.9%</p>
                      <p className="text-sm text-slate-600">Sync Success</p>
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