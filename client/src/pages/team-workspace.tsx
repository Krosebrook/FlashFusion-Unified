import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, 
  Plus, 
  Crown,
  UserCheck,
  UserX,
  MessageSquare,
  Activity,
  Calendar,
  Settings,
  Mail,
  Copy,
  Eye,
  Edit3,
  Trash2,
  Clock
} from "lucide-react";

// Mock user data
const mockUser = {
  id: "user123",
  name: "John Doe",
  email: "john@example.com",
  plan: "Pro Plan",
};

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: "owner" | "admin" | "editor" | "viewer";
  avatar?: string;
  status: "active" | "pending" | "inactive";
  lastSeen: string;
  joinedAt: string;
}

interface WorkspaceActivity {
  id: string;
  type: "idea_created" | "idea_updated" | "agent_completed" | "member_joined" | "comment_added";
  userId: string;
  userName: string;
  description: string;
  timestamp: string;
  metadata?: any;
}

interface Workspace {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  createdAt: string;
  role: string;
}

export default function TeamWorkspacePage() {
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("editor");
  const [selectedWorkspace, setSelectedWorkspace] = useState("main");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Mock data
  const mockWorkspaces: Workspace[] = [
    {
      id: "main",
      name: "FlashFusion Main",
      description: "Primary workspace for idea development",
      memberCount: 5,
      createdAt: "2025-01-15",
      role: "owner"
    },
    {
      id: "marketing",
      name: "Marketing Team",
      description: "Marketing campaigns and brand development",
      memberCount: 3,
      createdAt: "2025-01-20",
      role: "admin"
    }
  ];

  const mockTeamMembers: TeamMember[] = [
    {
      id: "1",
      name: "John Doe",
      email: "john@example.com",
      role: "owner",
      avatar: "/avatars/john.jpg",
      status: "active",
      lastSeen: "2025-01-28T19:30:00Z",
      joinedAt: "2025-01-15"
    },
    {
      id: "2", 
      name: "Sarah Wilson",
      email: "sarah@example.com",
      role: "admin",
      avatar: "/avatars/sarah.jpg",
      status: "active",
      lastSeen: "2025-01-28T18:45:00Z",
      joinedAt: "2025-01-16"
    },
    {
      id: "3",
      name: "Mike Chen",
      email: "mike@example.com", 
      role: "editor",
      status: "pending",
      lastSeen: "Never",
      joinedAt: "2025-01-28"
    },
    {
      id: "4",
      name: "Emily Rodriguez",
      email: "emily@example.com",
      role: "viewer",
      avatar: "/avatars/emily.jpg",
      status: "active",
      lastSeen: "2025-01-28T16:20:00Z",
      joinedAt: "2025-01-18"
    }
  ];

  const mockActivities: WorkspaceActivity[] = [
    {
      id: "1",
      type: "idea_created",
      userId: "2",
      userName: "Sarah Wilson",
      description: "Created new idea: 'AI-Powered Fitness App'",
      timestamp: "2025-01-28T19:30:00Z"
    },
    {
      id: "2",
      type: "agent_completed",
      userId: "1",
      userName: "John Doe", 
      description: "Brand Kit Agent completed for 'Mobile Banking App'",
      timestamp: "2025-01-28T19:15:00Z"
    },
    {
      id: "3",
      type: "comment_added",
      userId: "4",
      userName: "Emily Rodriguez",
      description: "Added comment on 'E-commerce Platform Idea'",
      timestamp: "2025-01-28T18:45:00Z"
    },
    {
      id: "4",
      type: "member_joined",
      userId: "3",
      userName: "Mike Chen",
      description: "Joined the workspace",
      timestamp: "2025-01-28T16:30:00Z"
    }
  ];

  // Invite member mutation
  const inviteMemberMutation = useMutation({
    mutationFn: async ({ email, role }: { email: string; role: string }) => {
      const response = await fetch("/api/workspace/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role, workspaceId: selectedWorkspace }),
      });
      if (!response.ok) throw new Error("Failed to send invitation");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workspace/members"] });
      setInviteDialogOpen(false);
      setInviteEmail("");
      toast({
        title: "Invitation sent!",
        description: `Team invitation has been sent to ${inviteEmail}`,
      });
    },
    onError: () => {
      toast({
        title: "Failed to send invitation",
        description: "Please check the email address and try again.",
        variant: "destructive",
      });
    },
  });

  const getRoleColor = (role: string) => {
    switch (role) {
      case "owner": return "bg-purple-100 text-purple-800 border-purple-300";
      case "admin": return "bg-blue-100 text-blue-800 border-blue-300";
      case "editor": return "bg-green-100 text-green-800 border-green-300";
      case "viewer": return "bg-gray-100 text-gray-800 border-gray-300";
      default: return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "owner": return <Crown className="h-4 w-4" />;
      case "admin": return <Settings className="h-4 w-4" />;
      case "editor": return <Edit3 className="h-4 w-4" />;
      case "viewer": return <Eye className="h-4 w-4" />;
      default: return <Users className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800 border-green-300";
      case "pending": return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "inactive": return "bg-red-100 text-red-800 border-red-300";
      default: return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "idea_created": return "💡";
      case "idea_updated": return "✏️";
      case "agent_completed": return "🤖";
      case "member_joined": return "👋";
      case "comment_added": return "💬";
      default: return "📝";
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const handleInviteMember = () => {
    if (inviteEmail && inviteRole) {
      inviteMemberMutation.mutate({ email: inviteEmail, role: inviteRole });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar user={mockUser} />
      
      <div className="lg:pl-64 flex flex-col flex-1">
        <Topbar title="Team Workspace" />
        
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 page-transition">
            <div className="max-w-6xl mx-auto space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-slate-800">Team Workspace</h1>
                  <p className="text-slate-600">Collaborate with your team on business ideas and AI-generated content</p>
                </div>
                <div className="flex items-center space-x-3">
                  <Select value={selectedWorkspace} onValueChange={setSelectedWorkspace}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {mockWorkspaces.map((workspace) => (
                        <SelectItem key={workspace.id} value={workspace.id}>
                          {workspace.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Invite Member
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Invite Team Member</DialogTitle>
                        <DialogDescription>
                          Send an invitation to join your workspace
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="email">Email Address</Label>
                          <Input
                            id="email"
                            type="email"
                            placeholder="colleague@company.com"
                            value={inviteEmail}
                            onChange={(e) => setInviteEmail(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="role">Role</Label>
                          <Select value={inviteRole} onValueChange={setInviteRole}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="viewer">Viewer - Can view ideas and content</SelectItem>
                              <SelectItem value="editor">Editor - Can create and edit ideas</SelectItem>
                              <SelectItem value="admin">Admin - Can manage team and settings</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Button 
                          onClick={handleInviteMember}
                          disabled={!inviteEmail || inviteMemberMutation.isPending}
                          className="w-full"
                        >
                          {inviteMemberMutation.isPending ? "Sending..." : "Send Invitation"}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              {/* Workspace Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-600">Team Members</p>
                        <p className="text-3xl font-bold text-slate-900">{mockTeamMembers.length}</p>
                      </div>
                      <Users className="h-8 w-8 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-600">Active Members</p>
                        <p className="text-3xl font-bold text-slate-900">
                          {mockTeamMembers.filter(m => m.status === "active").length}
                        </p>
                      </div>
                      <UserCheck className="h-8 w-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-600">Recent Activity</p>
                        <p className="text-3xl font-bold text-slate-900">{mockActivities.length}</p>
                      </div>
                      <Activity className="h-8 w-8 text-purple-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Team Members */}
              <Card>
                <CardHeader>
                  <CardTitle>Team Members</CardTitle>
                  <CardDescription>Manage your workspace team and permissions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockTeamMembers.map((member) => (
                      <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <Avatar>
                            <AvatarImage src={member.avatar} />
                            <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-medium">{member.name}</h4>
                            <p className="text-sm text-slate-600">{member.email}</p>
                            <p className="text-xs text-slate-500">
                              Last seen: {member.lastSeen === "Never" ? "Never" : formatTimestamp(member.lastSeen)}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <Badge variant="outline" className={getRoleColor(member.role)}>
                            <div className="flex items-center space-x-1">
                              {getRoleIcon(member.role)}
                              <span className="capitalize">{member.role}</span>
                            </div>
                          </Badge>
                          <Badge variant="outline" className={getStatusColor(member.status)}>
                            {member.status}
                          </Badge>
                          {member.role !== "owner" && (
                            <div className="flex items-center space-x-1">
                              <Button variant="ghost" size="sm">
                                <Edit3 className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Activity Feed */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Team activity and collaboration updates</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockActivities.map((activity) => (
                      <div key={activity.id} className="flex items-start space-x-4 p-3 border rounded-lg">
                        <span className="text-2xl">{getActivityIcon(activity.type)}</span>
                        <div className="flex-1">
                          <p className="text-sm">
                            <span className="font-medium">{activity.userName}</span> {activity.description}
                          </p>
                          <p className="text-xs text-slate-500 mt-1 flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>{formatTimestamp(activity.timestamp)}</span>
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Workspace Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Workspace Settings</CardTitle>
                  <CardDescription>Configure your workspace preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="workspace-name">Workspace Name</Label>
                      <Input
                        id="workspace-name"
                        defaultValue={mockWorkspaces.find(w => w.id === selectedWorkspace)?.name}
                      />
                    </div>
                    <div>
                      <Label htmlFor="workspace-url">Workspace URL</Label>
                      <div className="flex items-center space-x-2">
                        <Input
                          id="workspace-url"
                          defaultValue={`flashfusion.app/workspace/${selectedWorkspace}`}
                          readOnly
                        />
                        <Button variant="outline" size="sm">
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="workspace-description">Description</Label>
                    <Textarea
                      id="workspace-description"
                      defaultValue={mockWorkspaces.find(w => w.id === selectedWorkspace)?.description}
                      rows={3}
                    />
                  </div>
                  <Button>Save Changes</Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}