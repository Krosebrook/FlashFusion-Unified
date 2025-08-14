import React from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";
import { 
  Home, 
  LayoutDashboard, 
  Settings, 
  User, 
  FileText, 
  Zap,
  Palette,
  Shield,
  Lock,
  BarChart3,
  MessageCircle
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const menuItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Home",
    url: "/",
    icon: Home,
  },
  {
    title: "Creator Dashboard",
    url: "/creator",
    icon: User,
  },
  {
    title: "Design Studio",
    url: "/design-studio",
    icon: Palette,
  },
  {
    title: "Validator",
    url: "/validate",
    icon: Shield,
  },
  {
    title: "Generator",
    url: "/generate",
    icon: Zap,
  },
  {
    title: "Export",
    url: "/export",
    icon: FileText,
  },
  {
    title: "Analytics",
    url: "/old-dashboard",
    icon: BarChart3,
  },
  {
    title: "Conversations",
    url: "/conversations",
    icon: MessageCircle,
  },
];

const settingsItems = [
  {
    title: "Privacy Settings",
    url: "/privacy-settings",
    icon: Lock,
  },
  {
    title: "General Settings",
    url: "/settings",
    icon: Settings,
  },
];

export const FlashFusionSidebar: React.FC = () => {
  const location = useLocation();

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center space-x-2">
          <Zap className="h-8 w-8 text-primary" />
          <h1 className="text-xl font-bold">FlashFusion</h1>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.url}
                  >
                    <Link to={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        <SidebarGroup>
          <SidebarGroupLabel>Settings</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {settingsItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.url}
                  >
                    <Link to={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};