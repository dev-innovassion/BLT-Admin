import { 
  LayoutDashboard, 
  Users, 
  Gamepad2, 
  ArrowDownUp, 
  CreditCard, 
  Wallet, 
  ShieldCheck,
  LogOut,
  ChevronDown,
  UserPlus,
  ShoppingCart,
  Package,
  Coins,
  Key,
  Mail
} from "lucide-react";
import {
  BadgePercent,
  Scale,
  BookUser,
  Activity,
  BarChart3,
  FileText,
  Headphones,
  Lock,
  Server,
  Palette,
  Bell,
  Code2,
  Calendar,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface NavItem {
  title: string;
  url: string;
  icon: any;
  roles: string[];
}

const navigationItems: NavItem[] = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
    roles: ["super_admin", "admin", "operator", "agent"],
  },
  {
    title: "Users",
    url: "/users",
    icon: Users,
    roles: ["super_admin", "admin", "operator", "agent"],
  },
  {
    title: "Games",
    url: "/games",
    icon: Gamepad2,
    roles: ["super_admin", "admin"],
  },
  {
    title: "Transactions",
    url: "/transactions",
    icon: ArrowDownUp,
    roles: ["super_admin", "admin", "operator", "agent"],
  },
  {
    title: "Deposits",
    url: "/deposits",
    icon: CreditCard,
    roles: ["super_admin", "admin", "operator", "agent"],
  },
  {
    title: "Withdrawals",
    url: "/withdrawals",
    icon: Wallet,
    roles: ["super_admin", "admin", "operator", "agent"],
  },
  {
    title: "Bonuses",
    url: "/bonuses",
    icon: BadgePercent,
    roles: ["super_admin", "admin", "operator"],
  },
  {
    title: "Roles",
    url: "/roles",
    icon: ShieldCheck,
    roles: ["super_admin"],
  },
  {
    title: "Permissions",
    url: "/permissions",
    icon: ShieldCheck,
    roles: ["super_admin"],
  },
  {
    title: "Referrals",
    url: "/referrals",
    icon: UserPlus,
    roles: ["super_admin", "admin", "operator", "agent", "user"],
  },
  {
    title: "Orders",
    url: "/orders",
    icon: ShoppingCart,
    roles: ["super_admin", "admin"],
  },
  {
    title: "Packages",
    url: "/packages",
    icon: Package,
    roles: ["super_admin", "admin"],
  },
  {
    title: "Payments",
    url: "/payments",
    icon: Coins,
    roles: ["super_admin", "admin"],
  },
  {
    title: "Password Reset",
    url: "/password-reset",
    icon: Key,
    roles: ["super_admin", "admin"],
  },
  {
    title: "Contact Forms",
    url: "/contact-submissions",
    icon: Mail,
    roles: ["super_admin", "admin"],
  },
  {
    title: "Demo Requests",
    url: "/demo-requests",
    icon: Calendar,
    roles: ["super_admin", "admin"],
  },
  { title: "Promotions", url: "/promotions", icon: BadgePercent, roles: ["super_admin", "admin"] },
  { title: "Compliance", url: "/compliance", icon: Scale, roles: ["super_admin", "admin"] },
  { title: "Accounts", url: "/accounts", icon: BookUser, roles: ["super_admin", "admin"] },
  { title: "Activities", url: "/activities", icon: Activity, roles: ["super_admin", "admin"] },
  { title: "Analytics", url: "/analytics", icon: BarChart3, roles: ["super_admin", "admin"] },
  { title: "Content", url: "/content", icon: FileText, roles: ["super_admin", "admin"] },
  { title: "Support", url: "/support", icon: Headphones, roles: ["super_admin", "admin"] },
  { title: "Security", url: "/security", icon: Lock, roles: ["super_admin", "admin"] },
  { title: "System", url: "/system", icon: Server, roles: ["super_admin", "admin"] },
  { title: "Theme Studio", url: "/theme-studio", icon: Palette, roles: ["super_admin", "admin"] },
  { title: "Notifications", url: "/notifications", icon: Bell, roles: ["super_admin", "admin"] },
  { title: "Emails", url: "/emails", icon: Mail, roles: ["super_admin", "admin"] },
  { title: "Developer", url: "/developer", icon: Code2, roles: ["super_admin", "admin"] },
];

export function AppSidebar() {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  const originalUser = localStorage.getItem('original_user');
  const isLoggedInAs = !!originalUser;

  const getPlatformName = () => {
    if (!user) return "Management Panel";
    
    if (user.role === "operator" || user.role === "agent") {
      return user.assigned_platform_code?.toUpperCase() || "Management Panel";
    }
    
    if (user.role === "user") {
      return user.platform_code?.toUpperCase() || "Management Panel";
    }
    
    return "Management Panel";
  };

  const handleBackToOriginal = () => {
    if (originalUser) {
      const original = JSON.parse(originalUser);
      
      localStorage.setItem('access_token', original.access_token);
      localStorage.setItem('refresh_token', original.refresh_token);
      
      if (original.user_data) {
        localStorage.setItem('currentUser', original.user_data);
      }
      
      localStorage.removeItem('original_user');
      
      window.location.reload();
    }
  };

  const allowedItems = user?.role === "super_admin"
    ? navigationItems
    : navigationItems.filter((item) =>
        item.roles.includes(user?.role || "")
      );

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "super_admin":
        return "default";
      case "admin":
        return "secondary";
      case "operator":
        return "outline";
      case "agent":
        return "outline";
      default:
        return "outline";
    }
  };

  const getRoleLabel = (role: string | undefined) => {
    if (!role) return "Guest";
    return role.split("_").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
  };

  const getUserInitials = (name: string | undefined) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Sidebar className="scrollbar-neon">
      <SidebarHeader className="border-b border-sidebar-border p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary">
            <Gamepad2 className="h-6 w-6 text-primary-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold text-sidebar-foreground truncate">
              {getPlatformName()}
            </h2>
            <p className="text-xs text-muted-foreground">Management Panel</p>
          </div>
        </div>
        
        {isLoggedInAs && (
          <div className="mt-3 p-2 rounded-md bg-primary/10 border border-primary/20">
            <p className="text-xs font-medium text-primary mb-1">Logged in as:</p>
            <p className="text-xs text-muted-foreground mb-2 break-words">{user?.email}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleBackToOriginal}
              className="w-full h-7 text-xs hover:bg-primary/20"
              title="Back to original account"
            >
              <LogOut className="h-3 w-3 mr-1" />
              Back to Original Account
            </Button>
          </div>
        )}
      </SidebarHeader>

      <SidebarContent className="scrollbar-neon">
        <SidebarGroup>
          <SidebarGroupLabel className="px-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {allowedItems.map((item) => {
                const isActive = location === item.url || (item.url !== "/" && location.startsWith(item.url));
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive} data-testid={`link-${item.title.toLowerCase()}`}>
                      <Link href={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-4">
        {!isLoggedInAs && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="w-full justify-start gap-3 h-auto py-3 hover-elevate active-elevate-2"
                data-testid="button-user-menu"
              >
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
                    {user ? getUserInitials(user.name) : "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start flex-1 min-w-0">
                  <p className="text-sm font-medium text-sidebar-foreground truncate w-full">
                    {user?.name || "User"}
                  </p>
                  <div className="flex items-center gap-2 w-full">
                    <Badge variant={getRoleBadgeVariant(user?.role || "")} className="text-xs">
                      {user ? getRoleLabel(user.role) : "Guest"}
                    </Badge>
                  </div>
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-medium">{user?.name}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={logout}
                className="text-destructive focus:text-destructive cursor-pointer"
                data-testid="button-logout"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
