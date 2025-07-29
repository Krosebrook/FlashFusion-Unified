import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, Send, Smartphone } from "lucide-react";
import { Link } from "wouter";

interface SmsMessage {
  id: string;
  toPhoneNumber: string;
  content: string;
  status: string;
  createdAt: string;
}

export default function SMS() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [message, setMessage] = useState("");

  // Fetch SMS history
  const { data: smsHistory = [], isLoading: historyLoading } = useQuery({
    queryKey: ["/api/sms/history"],
    enabled: !!user,
  });

  // Send SMS mutation
  const sendSmsMutation = useMutation({
    mutationFn: async ({ toPhoneNumber, content }: { toPhoneNumber: string; content: string }) => {
      const response = await apiRequest("POST", "/api/sms/send", {
        toPhoneNumber,
        content,
      });
      return response.json();
    },
    onSuccess: () => {
      setPhoneNumber("");
      setMessage("");
      queryClient.invalidateQueries({ queryKey: ["/api/sms/history"] });
      toast({
        title: "SMS Sent",
        description: "Your message has been sent successfully",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to send SMS message",
        variant: "destructive",
      });
    },
  });

  const handleSendSms = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phoneNumber.trim() || !message.trim()) {
      toast({
        title: "Error",
        description: "Please enter both phone number and message",
        variant: "destructive",
      });
      return;
    }

    // Basic phone number validation
    const cleanPhone = phoneNumber.replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      toast({
        title: "Error",
        description: "Please enter a valid phone number",
        variant: "destructive",
      });
      return;
    }

    // Format phone number
    const formattedPhone = cleanPhone.startsWith("1") ? `+${cleanPhone}` : `+1${cleanPhone}`;
    
    sendSmsMutation.mutate({ toPhoneNumber: formattedPhone, content: message.trim() });
  };

  if (authLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Link to="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
              <Smartphone className="w-6 h-6 mr-2" />
              SMS Messages
            </h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Send SMS Form */}
          <Card>
            <CardHeader>
              <CardTitle>Send SMS Message</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSendSms} className="space-y-4">
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Phone Number
                  </label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+1 (555) 123-4567"
                    className="w-full"
                    disabled={sendSmsMutation.isPending}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter phone number with country code (e.g., +1 for US)
                  </p>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Message
                  </label>
                  <Textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Enter your message here..."
                    rows={4}
                    className="w-full"
                    disabled={sendSmsMutation.isPending}
                    maxLength={160}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {message.length}/160 characters
                  </p>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={!phoneNumber.trim() || !message.trim() || sendSmsMutation.isPending}
                >
                  {sendSmsMutation.isPending ? (
                    <div className="flex items-center">
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                      Sending...
                    </div>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send SMS
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* SMS History */}
          <Card>
            <CardHeader>
              <CardTitle>SMS History</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                {historyLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto" />
                  </div>
                ) : smsHistory.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <Smartphone className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No SMS messages sent yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {smsHistory.map((sms: SmsMessage) => (
                      <div
                        key={sms.id}
                        className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="font-medium text-gray-900 dark:text-white">
                            {sms.toPhoneNumber}
                          </div>
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              sms.status === "sent"
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                : sms.status === "pending"
                                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                            }`}
                          >
                            {sms.status}
                          </span>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 mb-2">{sms.content}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(sms.createdAt).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}