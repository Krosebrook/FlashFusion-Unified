import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Zap, 
  ExternalLink,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Copy
} from "lucide-react";

interface QuickSetupWizardProps {
  onComplete?: () => void;
  onClose?: () => void;
}

export function QuickSetupWizard({ onComplete, onClose }: QuickSetupWizardProps) {
  const [webhookUrl, setWebhookUrl] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Create webhook mutation for idea.created (most popular)
  const createWebhookMutation = useMutation({
    mutationFn: async (url: string) => {
      const response = await fetch("/api/zapier/webhooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, event: "idea.created" }),
      });
      if (!response.ok) throw new Error("Failed to create webhook");
      return response.json();
    },
    onSuccess: () => {
      setIsComplete(true);
      queryClient.invalidateQueries({ queryKey: ["/api/zapier/webhooks"] });
      toast({
        title: "Quick setup complete!",
        description: "Your webhook will trigger when new ideas are created.",
      });
    },
    onError: () => {
      toast({
        title: "Setup failed",
        description: "Please check your webhook URL and try again.",
        variant: "destructive",
      });
    },
  });

  const handleQuickSetup = () => {
    if (webhookUrl) {
      createWebhookMutation.mutate(webhookUrl);
    }
  };

  const copyInstructions = () => {
    const instructions = `Quick Zapier Setup for FlashFusion:

1. Go to https://zapier.com/app/zaps
2. Click "Create Zap"
3. Search for "Webhooks by Zapier"
4. Choose "Catch Hook" as trigger
5. Copy the webhook URL and paste it below
6. Continue in Zapier to set up your actions

This will trigger when new business ideas are created in FlashFusion.`;

    navigator.clipboard.writeText(instructions);
    toast({
      title: "Instructions copied!",
      description: "Paste these instructions anywhere for reference.",
    });
  };

  if (isComplete) {
    return (
      <div className="max-w-lg mx-auto p-6">
        <Card>
          <CardContent className="p-6 text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-green-800">Setup Complete!</h3>
              <p className="text-sm text-green-600 mt-2">
                Your webhook is now active and will trigger when new business ideas are created in FlashFusion.
              </p>
            </div>
            <div className="space-y-2">
              <Button onClick={onComplete} className="w-full">
                Done
              </Button>
              <Button variant="outline" onClick={onClose} className="w-full">
                Set Up More Webhooks
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto p-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="h-6 w-6" />
                <span>Quick Setup</span>
              </CardTitle>
              <CardDescription>
                Get started with the most popular automation: New Ideas → Your App
              </CardDescription>
            </div>
            {onClose && (
              <Button variant="ghost" size="sm" onClick={onClose}>
                ×
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              This quick setup creates a webhook for <strong>"Idea Created"</strong> events - 
              the most popular FlashFusion automation trigger.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center mx-auto text-sm font-medium">1</div>
                <p className="text-xs mt-1 text-slate-600">Create Zap</p>
              </div>
              <div>
                <ArrowRight className="h-4 w-4 mx-auto text-slate-400 mt-2" />
              </div>
              <div>
                <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center mx-auto text-sm font-medium">2</div>
                <p className="text-xs mt-1 text-slate-600">Paste URL</p>
              </div>
            </div>

            <Card className="bg-slate-50">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Zapier Instructions</h4>
                  <Button variant="ghost" size="sm" onClick={copyInstructions}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <div className="text-sm text-slate-600 space-y-1">
                  <p>1. Go to Zapier and create a new Zap</p>
                  <p>2. Choose "Webhooks by Zapier" → "Catch Hook"</p>
                  <p>3. Copy the webhook URL and paste it below</p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => window.open('https://zapier.com/app/zaps', '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open Zapier
                </Button>
              </CardContent>
            </Card>

            <div className="space-y-2">
              <Label htmlFor="quick-webhook-url">Webhook URL from Zapier</Label>
              <Input
                id="quick-webhook-url"
                placeholder="https://hooks.zapier.com/hooks/catch/..."
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
              />
            </div>

            <Button 
              onClick={handleQuickSetup}
              disabled={!webhookUrl || createWebhookMutation.isPending}
              className="w-full bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700"
            >
              {createWebhookMutation.isPending ? "Setting up..." : "Complete Quick Setup"}
            </Button>
          </div>

          <div className="text-center">
            <Button variant="link" onClick={onClose} className="text-sm">
              Need more options? Use the full wizard instead
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}