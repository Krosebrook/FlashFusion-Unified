import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Plus, Trash2, TestTube, Zap, ExternalLink, Copy, CheckCircle } from "lucide-react";

interface ZapierWebhook {
  url: string;
  event: string;
  active: boolean;
  createdAt: string;
}

interface ZapierEvent {
  value: string;
  description: string;
}

// Mock user data - in real app this would come from Firebase Auth
const mockUser = {
  id: "user123",
  name: "John Doe",
  email: "john@example.com",
  plan: "Pro Plan",
};

export default function ZapierPage() {
  const [newWebhookUrl, setNewWebhookUrl] = useState("");
  const [newWebhookEvent, setNewWebhookEvent] = useState("");
  const [testWebhookUrl, setTestWebhookUrl] = useState("");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch webhooks
  const { data: webhooksData } = useQuery({
    queryKey: ["/api/zapier/webhooks"],
  });

  // Fetch available events
  const { data: eventsData } = useQuery({
    queryKey: ["/api/zapier/events"],
  });

  // Add webhook mutation
  const addWebhookMutation = useMutation({
    mutationFn: ({ url, event }: { url: string; event: string }) =>
      apiRequest("/api/zapier/webhooks", {
        method: "POST",
        body: { url, event },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/zapier/webhooks"] });
      setNewWebhookUrl("");
      setNewWebhookEvent("");
      toast({
        title: "Webhook added",
        description: "Your Zapier webhook has been successfully registered.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add webhook. Please check the URL and try again.",
        variant: "destructive",
      });
    },
  });

  // Remove webhook mutation
  const removeWebhookMutation = useMutation({
    mutationFn: (url: string) =>
      apiRequest("/api/zapier/webhooks", {
        method: "DELETE",
        body: { url },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/zapier/webhooks"] });
      toast({
        title: "Webhook removed",
        description: "The webhook has been successfully removed.",
      });
    },
  });

  // Test webhook mutation
  const testWebhookMutation = useMutation({
    mutationFn: (url: string) =>
      apiRequest("/api/zapier/test", {
        method: "POST",
        body: { url },
      }),
    onSuccess: () => {
      toast({
        title: "Test sent",
        description: "Test webhook has been sent successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Test failed",
        description: "Failed to send test webhook. Please check the URL.",
        variant: "destructive",
      });
    },
  });

  const handleAddWebhook = () => {
    if (!newWebhookUrl || !newWebhookEvent) {
      toast({
        title: "Missing information",
        description: "Please provide both webhook URL and event type.",
        variant: "destructive",
      });
      return;
    }

    addWebhookMutation.mutate({ url: newWebhookUrl, event: newWebhookEvent });
  };

  const handleTestWebhook = () => {
    if (!testWebhookUrl) {
      toast({
        title: "Missing URL",
        description: "Please provide a webhook URL to test.",
        variant: "destructive",
      });
      return;
    }

    testWebhookMutation.mutate(testWebhookUrl);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "URL copied to clipboard.",
    });
  };

  const webhooks = webhooksData?.webhooks || [];
  const events = eventsData?.events || [];
  const eventDescriptions = eventsData?.descriptions || {};

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar user={mockUser} />
      
      <div className="lg:pl-64 flex flex-col flex-1">
        <Topbar title="Zapier Integration" />
        
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 page-transition">
            <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-slate-800">Zapier Integration</h1>
            </div>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Connect FlashFusion to thousands of apps with Zapier webhooks. Automate your workflows 
              when ideas are created, AI agents complete tasks, and content is generated.
            </p>
          </div>

          {/* Getting Started Guide */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ExternalLink className="h-5 w-5" />
                <span>Getting Started with Zapier</span>
              </CardTitle>
              <CardDescription>
                Follow these steps to connect FlashFusion to your Zapier workflows
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center space-y-2">
                  <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto font-semibold">
                    1
                  </div>
                  <h3 className="font-medium">Create a Zap</h3>
                  <p className="text-sm text-slate-600">Go to Zapier and create a new Zap with "Webhooks by Zapier" as the trigger</p>
                </div>
                <div className="text-center space-y-2">
                  <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto font-semibold">
                    2
                  </div>
                  <h3 className="font-medium">Copy Webhook URL</h3>
                  <p className="text-sm text-slate-600">Zapier will provide a webhook URL. Copy this URL to add below</p>
                </div>
                <div className="text-center space-y-2">
                  <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto font-semibold">
                    3
                  </div>
                  <h3 className="font-medium">Configure Actions</h3>
                  <p className="text-sm text-slate-600">Set up actions in your Zap to handle the data from FlashFusion</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Add New Webhook */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Plus className="h-5 w-5" />
                <span>Add New Webhook</span>
              </CardTitle>
              <CardDescription>
                Register a new Zapier webhook to receive events from FlashFusion
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="webhook-url">Webhook URL</Label>
                  <Input
                    id="webhook-url"
                    placeholder="https://hooks.zapier.com/hooks/catch/..."
                    value={newWebhookUrl}
                    onChange={(e) => setNewWebhookUrl(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="webhook-event">Event Type</Label>
                  <Select value={newWebhookEvent} onValueChange={setNewWebhookEvent}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select event type" />
                    </SelectTrigger>
                    <SelectContent>
                      {events.map((event: string) => (
                        <SelectItem key={event} value={event}>
                          {event.replace(/\./g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {newWebhookEvent && eventDescriptions[newWebhookEvent] && (
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-700">{eventDescriptions[newWebhookEvent]}</p>
                </div>
              )}
              <Button 
                onClick={handleAddWebhook} 
                disabled={addWebhookMutation.isPending}
                className="w-full md:w-auto"
              >
                {addWebhookMutation.isPending ? "Adding..." : "Add Webhook"}
              </Button>
            </CardContent>
          </Card>

          {/* Active Webhooks */}
          <Card>
            <CardHeader>
              <CardTitle>Active Webhooks</CardTitle>
              <CardDescription>
                Manage your registered Zapier webhooks
              </CardDescription>
            </CardHeader>
            <CardContent>
              {webhooks.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <Zap className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                  <p className="text-lg font-medium">No webhooks configured</p>
                  <p>Add a webhook above to start automating with Zapier</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {webhooks.map((webhook: ZapierWebhook, index: number) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            {webhook.event.replace(/\./g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </Badge>
                          {webhook.active && (
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Active
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <code className="text-sm bg-slate-100 px-2 py-1 rounded font-mono">
                            {webhook.url.length > 60 ? `${webhook.url.slice(0, 60)}...` : webhook.url}
                          </code>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(webhook.url)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeWebhookMutation.mutate(webhook.url)}
                          disabled={removeWebhookMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Test Webhook */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TestTube className="h-5 w-5" />
                <span>Test Webhook</span>
              </CardTitle>
              <CardDescription>
                Send a test payload to verify your Zapier webhook is working
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-4">
                <Input
                  placeholder="https://hooks.zapier.com/hooks/catch/..."
                  value={testWebhookUrl}
                  onChange={(e) => setTestWebhookUrl(e.target.value)}
                  className="flex-1"
                />
                <Button 
                  onClick={handleTestWebhook}
                  disabled={testWebhookMutation.isPending}
                >
                  {testWebhookMutation.isPending ? "Sending..." : "Send Test"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Available Events */}
          <Card>
            <CardHeader>
              <CardTitle>Available Events</CardTitle>
              <CardDescription>
                FlashFusion can trigger these events to your Zapier workflows
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {events.map((event: string) => (
                  <div key={event} className="flex items-start justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium text-slate-800">
                        {event.replace(/\./g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </h4>
                      <p className="text-sm text-slate-600 mt-1">
                        {eventDescriptions[event] || "Event triggered by FlashFusion"}
                      </p>
                    </div>
                    <Badge variant="secondary">{event}</Badge>
                  </div>
                ))}
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