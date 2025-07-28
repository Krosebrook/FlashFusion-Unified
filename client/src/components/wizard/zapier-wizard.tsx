import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  ChevronRight, 
  ChevronLeft, 
  Check, 
  ExternalLink, 
  Copy, 
  Zap, 
  TestTube,
  AlertCircle,
  CheckCircle,
  Webhook,
  Settings,
  Lightbulb,
  Bot
} from "lucide-react";

interface WizardStep {
  id: number;
  title: string;
  description: string;
  completed: boolean;
}

interface ZapierWizardProps {
  onComplete?: () => void;
  onClose?: () => void;
}

export function ZapierWizard({ onComplete, onClose }: ZapierWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [webhookUrl, setWebhookUrl] = useState("");
  const [selectedEvent, setSelectedEvent] = useState("");
  const [zapName, setZapName] = useState("");
  const [testCompleted, setTestCompleted] = useState(false);
  const [webhookCreated, setWebhookCreated] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const steps: WizardStep[] = [
    {
      id: 1,
      title: "Plan Your Automation",
      description: "Choose what you want to automate with FlashFusion",
      completed: selectedEvent !== ""
    },
    {
      id: 2,
      title: "Create Your Zap",
      description: "Set up the trigger in Zapier",
      completed: zapName !== ""
    },
    {
      id: 3,
      title: "Get Webhook URL",
      description: "Copy the webhook URL from Zapier",
      completed: webhookUrl !== ""
    },
    {
      id: 4,
      title: "Test Connection",
      description: "Verify the webhook works correctly",
      completed: testCompleted
    },
    {
      id: 5,
      title: "Register Webhook",
      description: "Connect FlashFusion to your Zap",
      completed: webhookCreated
    }
  ];

  // Fetch available events
  const { data: eventsData } = useQuery({
    queryKey: ["/api/zapier/events"],
  });

  // Test webhook mutation
  const testWebhookMutation = useMutation({
    mutationFn: (url: string) =>
      apiRequest("/api/zapier/test", {
        method: "POST",
        body: { url },
      }),
    onSuccess: () => {
      setTestCompleted(true);
      toast({
        title: "Test successful!",
        description: "Your webhook is working correctly.",
      });
    },
    onError: () => {
      toast({
        title: "Test failed",
        description: "Please check your webhook URL and try again.",
        variant: "destructive",
      });
    },
  });

  // Create webhook mutation
  const createWebhookMutation = useMutation({
    mutationFn: ({ url, event }: { url: string; event: string }) =>
      apiRequest("/api/zapier/webhooks", {
        method: "POST",
        body: { url, event },
      }),
    onSuccess: () => {
      setWebhookCreated(true);
      queryClient.invalidateQueries({ queryKey: ["/api/zapier/webhooks"] });
      toast({
        title: "Webhook created!",
        description: "Your Zapier integration is now active.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create webhook. Please try again.",
        variant: "destructive",
      });
    },
  });

  const events = eventsData?.events || [];
  const eventDescriptions = eventsData?.descriptions || {};
  const currentStepData = steps[currentStep - 1];
  const isLastStep = currentStep === steps.length;
  const canProceed = currentStepData?.completed || false;

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    } else if (onComplete) {
      onComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleTestWebhook = () => {
    if (webhookUrl) {
      testWebhookMutation.mutate(webhookUrl);
    }
  };

  const handleCreateWebhook = () => {
    if (webhookUrl && selectedEvent) {
      createWebhookMutation.mutate({ url: webhookUrl, event: selectedEvent });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Instructions copied to clipboard.",
    });
  };

  const getEventIcon = (event: string) => {
    if (event.includes('idea')) return <Lightbulb className="h-4 w-4" />;
    if (event.includes('agent')) return <Bot className="h-4 w-4" />;
    return <Zap className="h-4 w-4" />;
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">What would you like to automate?</h3>
              <p className="text-sm text-slate-600 mb-4">
                Choose the FlashFusion event that will trigger your automation workflow.
              </p>
            </div>
            
            <div className="space-y-3">
              {events.map((event: string) => (
                <Card 
                  key={event} 
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedEvent === event ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                  }`}
                  onClick={() => setSelectedEvent(event)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <div className="mt-1">
                        {getEventIcon(event)}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">
                          {event.replace(/\./g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </h4>
                        <p className="text-sm text-slate-600 mt-1">
                          {eventDescriptions[event] || "Triggered by FlashFusion events"}
                        </p>
                      </div>
                      {selectedEvent === event && (
                        <CheckCircle className="h-5 w-5 text-blue-500" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {selectedEvent && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  You've selected: <strong>{selectedEvent.replace(/\./g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</strong>
                  <br />
                  {eventDescriptions[selectedEvent]}
                </AlertDescription>
              </Alert>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Create Your Zap</h3>
              <p className="text-sm text-slate-600 mb-4">
                Now let's set up the automation in Zapier. Follow these steps to create your Zap.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="zap-name">Give your Zap a name</Label>
                <Input
                  id="zap-name"
                  placeholder="e.g., New FlashFusion Ideas to Slack"
                  value={zapName}
                  onChange={(e) => setZapName(e.target.value)}
                />
              </div>

              <Alert>
                <Lightbulb className="h-4 w-4" />
                <AlertDescription>
                  <strong>Suggested name:</strong> "{selectedEvent.replace(/\./g, ' ').replace(/\b\w/g, l => l.toUpperCase())} to [Your App]"
                </AlertDescription>
              </Alert>
            </div>

            <Card className="bg-slate-50">
              <CardHeader>
                <CardTitle className="text-base flex items-center space-x-2">
                  <ExternalLink className="h-4 w-4" />
                  <span>Zapier Setup Instructions</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">1</div>
                  <div>
                    <p className="font-medium">Go to Zapier</p>
                    <p className="text-sm text-slate-600">Open <a href="https://zapier.com/app/zaps" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">zapier.com/app/zaps</a> and click "Create Zap"</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">2</div>
                  <div>
                    <p className="font-medium">Set up the trigger</p>
                    <p className="text-sm text-slate-600">Search for "Webhooks by Zapier" and select "Catch Hook"</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">3</div>
                  <div>
                    <p className="font-medium">Copy the webhook URL</p>
                    <p className="text-sm text-slate-600">Zapier will provide a webhook URL - copy this for the next step</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => window.open('https://zapier.com/app/zaps', '_blank')}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Open Zapier
            </Button>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Get Your Webhook URL</h3>
              <p className="text-sm text-slate-600 mb-4">
                Paste the webhook URL that Zapier provided when you set up the "Catch Hook" trigger.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="webhook-url">Webhook URL from Zapier</Label>
                <Input
                  id="webhook-url"
                  placeholder="https://hooks.zapier.com/hooks/catch/..."
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                />
              </div>

              {webhookUrl && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Great! Your webhook URL looks correct. We'll test it in the next step.
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <Card className="bg-amber-50 border-amber-200">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-800">Where to find your webhook URL</p>
                    <p className="text-sm text-amber-700 mt-1">
                      In Zapier, after selecting "Webhooks by Zapier" → "Catch Hook", you'll see a URL that starts with "https://hooks.zapier.com/hooks/catch/". Copy this entire URL.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Test Your Connection</h3>
              <p className="text-sm text-slate-600 mb-4">
                Let's send a test payload to make sure your webhook is working correctly.
              </p>
            </div>

            <Card>
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                    <TestTube className="h-8 w-8 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">Ready to test</h4>
                    <p className="text-sm text-slate-600">
                      We'll send a test payload to: <code className="bg-slate-100 px-1 rounded text-xs">{webhookUrl ? `${webhookUrl.slice(0, 50)}...` : 'your webhook URL'}</code>
                    </p>
                  </div>
                  <Button 
                    onClick={handleTestWebhook}
                    disabled={testWebhookMutation.isPending || !webhookUrl}
                    className="w-full"
                  >
                    {testWebhookMutation.isPending ? "Sending Test..." : "Send Test Webhook"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {testCompleted && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Test successful!</strong> Your webhook is working correctly. You should see the test data in your Zapier trigger history.
                </AlertDescription>
              </Alert>
            )}

            <Card className="bg-slate-50">
              <CardContent className="p-4">
                <p className="text-sm text-slate-600">
                  <strong>Next in Zapier:</strong> After the test succeeds, go back to Zapier and continue setting up your Zap by adding action steps (like sending to Slack, creating tasks, etc.).
                </p>
              </CardContent>
            </Card>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Register Your Webhook</h3>
              <p className="text-sm text-slate-600 mb-4">
                Finally, let's register your webhook with FlashFusion so it can automatically trigger your Zap.
              </p>
            </div>

            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Event Type</Label>
                      <p className="text-sm text-slate-600">
                        {selectedEvent.replace(/\./g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Webhook URL</Label>
                      <p className="text-sm text-slate-600 font-mono">
                        {webhookUrl.slice(0, 30)}...
                      </p>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="text-center">
                    <Button 
                      onClick={handleCreateWebhook}
                      disabled={createWebhookMutation.isPending || webhookCreated}
                      className="w-full"
                    >
                      {createWebhookMutation.isPending ? "Creating Webhook..." : 
                       webhookCreated ? "Webhook Created!" : "Create Webhook"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {webhookCreated && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Congratulations!</strong> Your Zapier integration is now active. 
                  FlashFusion will automatically send data to your Zap when {selectedEvent.replace(/\./g, ' ')} events occur.
                </AlertDescription>
              </Alert>
            )}

            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <Zap className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-green-800">What happens next?</p>
                    <p className="text-sm text-green-700 mt-1">
                      When {selectedEvent.replace(/\./g, ' ')} events happen in FlashFusion, your Zap will automatically trigger and perform the actions you configured.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Webhook className="h-6 w-6" />
                <span>Zapier Integration Wizard</span>
              </CardTitle>
              <CardDescription>
                Step {currentStep} of {steps.length}: {currentStepData?.title}
              </CardDescription>
            </div>
            {onClose && (
              <Button variant="ghost" size="sm" onClick={onClose}>
                ×
              </Button>
            )}
          </div>
          
          {/* Progress Bar */}
          <div className="space-y-2">
            <Progress value={(currentStep / steps.length) * 100} className="h-2" />
            <div className="flex justify-between text-xs text-slate-500">
              {steps.map((step) => (
                <div key={step.id} className="flex items-center space-x-1">
                  {step.completed ? (
                    <Check className="h-3 w-3 text-green-500" />
                  ) : (
                    <div className={`w-3 h-3 rounded-full ${
                      step.id === currentStep ? 'bg-blue-500' : 'bg-slate-300'
                    }`} />
                  )}
                  <span className={step.id === currentStep ? 'font-medium' : ''}>
                    {step.id}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="min-h-[400px]">
            {renderStepContent()}
          </div>
        </CardContent>

        <div className="px-6 pb-6">
          <div className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={handleBack}
              disabled={currentStep === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            
            <Button 
              onClick={handleNext}
              disabled={!canProceed && !isLastStep}
            >
              {isLastStep ? "Complete" : "Next"}
              {!isLastStep && <ChevronRight className="h-4 w-4 ml-2" />}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}