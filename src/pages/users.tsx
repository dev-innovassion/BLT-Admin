import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  DollarSign,
  Loader2,
  Shield,
  UserCog,
  Sparkles,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  KeyRound,
  Crown,
  Users as UsersIcon,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/status-badge";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { backendUserApi, type CreateUserRequest } from "@/lib/backendUserApi";
import { backendPermissionApi } from "@/lib/backendApi";
import { backendRoleApi, type RoleResponse } from "@/lib/backendRoleApi";
import { BACKEND_BASE_URL } from "@/lib/constants";
import type { ModulePermission } from "@shared/schema";
import { z } from "zod";

const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Za-z]/, "Password must contain at least one letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
  confirm_password: z.string().min(1, "Please confirm your password"),
  first_name: z.string().min(2),
  last_name: z.string().min(2),
  phone: z.string().optional(),
  role: z.string().min(1),
  assigned_platform_code: z.string().optional(),
}).refine((data) => data.password === data.confirm_password, {
  message: "Passwords do not match",
  path: ["confirm_password"],
});

const updateUserSchema = z.object({
  first_name: z.string().min(2).optional(),
  last_name: z.string().min(2).optional(),
  phone: z.string().optional(),
  role: z.string().min(1).optional(),
  is_active: z.boolean().optional(),
  is_verified: z.boolean().optional(),
  assigned_platform_code: z.string().optional(),
  profit_margin: z.number().min(0).max(100).nullable().optional(),
});

type CreateUserFormData = z.infer<typeof createUserSchema>;
type UpdateUserFormData = z.infer<typeof updateUserSchema>;

const roleIcons = {
  super_admin: Crown,
  admin: Shield,
  operator: UserCog,
  agent: UsersIcon,
  user: UsersIcon,
};

const roleColors = {
  super_admin: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  admin: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  operator: "bg-green-500/10 text-green-600 border-green-500/20",
  agent: "bg-orange-500/10 text-orange-600 border-orange-500/20",
  user: "bg-gray-500/10 text-gray-600 border-gray-500/20",
};

interface TreeNode {
  id: string;
  email: string;
  role: string;
  children?: TreeNode[];
}

function TreeNodeComponent({ 
  node, 
  level, 
  onNodeClick,
  isLast = false,
  parentIsLast = false,
  isLoading = false
}: { 
  node: TreeNode; 
  level: number; 
  onNodeClick: (id: string) => void;
  isLast?: boolean;
  parentIsLast?: boolean;
  isLoading?: boolean;
}) {
  const hasChildren = node.children && node.children.length > 0;
  const isClickable = node.role !== 'user';
  
  return (
    <div className="relative">
      <div className="flex items-center gap-1 py-0.5">
        {level > 0 && (
          <div className="flex items-center">
            <span className="text-muted-foreground/40">
              {isLast ? '└─' : '├─'}
            </span>
          </div>
        )}
        
        {isClickable ? (
          <button
            onClick={() => onNodeClick(node.id)}
            disabled={isLoading}
            className="px-2 py-0.5 rounded bg-primary/10 hover:bg-primary/20 text-primary transition-colors inline-flex items-center gap-1 text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            title={`Click to login as ${node.email}`}
          >
            {isLoading && <Loader2 className="h-3 w-3 animate-spin" />}
            <span>{node.email}</span>
            <span className="text-primary/60">({node.role})</span>
          </button>
        ) : (
          <span className="px-2 py-0.5 rounded bg-muted/50 text-muted-foreground inline-flex items-center gap-1 text-xs">
            <span>{node.email}</span>
            <span className="text-muted-foreground/60">({node.role})</span>
          </span>
        )}
      </div>
      
      {hasChildren && (
        <div className={`${level > 0 ? 'ml-4 border-l border-muted-foreground/20' : 'ml-0'}`}>
          {node.children!.map((child, idx) => (
            <TreeNodeComponent 
              key={child.id} 
              node={child} 
              level={level + 1}
              onNodeClick={onNodeClick}
              isLast={idx === node.children!.length - 1}
              parentIsLast={isLast}
              isLoading={isLoading}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function UsersPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isPermissionsOpen, setIsPermissionsOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedUserForPermissions, setSelectedUserForPermissions] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>("admin");
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(new Set());

  const token = localStorage.getItem("access_token") || "";
  const isSuperAdmin = user?.role === "super_admin";
  const isOperator = user?.role === "operator";
  const isAgent = user?.role === "agent";

  const getAllowedRoles = () => {
    if (isSuperAdmin) {
      return ["super_admin", "admin", "operator", "agent", "user", "platform_admin"];
    } else if (isOperator) {
      return ["agent", "user"];
    } else if (isAgent) {
      return ["agent", "user"];
    }
    return ["admin", "operator", "agent", "user", "platform_admin"];
  };

  const allowedRoles = getAllowedRoles();

  interface User {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    phone?: string;
    role: string;
    platform_code?: string;
    assigned_platform_code?: string;
    profit_margin?: number | null;
    is_active: boolean;
    is_verified: boolean;
    created_at: string;
    updated_at: string;
    descendants_tree?: TreeNode[];
  }

  const [filterByCreator, setFilterByCreator] = useState<string | null>(null);

  const handleLoginAs = (userId: string) => {
    toast({
      title: "Switching account...",
      description: "Please wait while we log you in",
    });
    loginAsMutation.mutate(userId);
  };

  const { data: usersData, isLoading, refetch, error } = useQuery({
    queryKey: ["users", token, filterByCreator],
    queryFn: async () => {
      if (!token) return { users: [], total: 0 };
      try {
        const result = await backendUserApi.getUsers(token, 0, 100, filterByCreator);
        console.log("Users fetched:", result);
        return result;
      } catch (err) {
        console.error("Error fetching users:", err);
        throw err;
      }
    },
    enabled: !!token,
    retry: 1,
  });

  const users = usersData?.users || [];

  const { data: customRoles = [] } = useQuery({
    queryKey: ["roles", token],
    queryFn: async () => {
      if (!token) return [];
      return await backendRoleApi.getRoles(token);
    },
    enabled: !!token && isSuperAdmin,
  });

  const { data: siteNames = [], isLoading: isSiteNamesLoading, error: siteNamesError } = useQuery({
    queryKey: ["siteNames", token],
    queryFn: async () => {
      if (!token) return [];
      console.log('Fetching site names from:', `${BACKEND_BASE_URL}/api/v1/admin/business-orders/site-names`);
      const response = await fetch(`${BACKEND_BASE_URL}/api/v1/admin/business-orders/site-names`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      console.log('Site names response status:', response.status);
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to fetch site names:', errorText);
        throw new Error('Failed to fetch site names');
      }
      const data = await response.json();
      console.log('Site names data:', data);
      return data.site_names || [];
    },
    enabled: !!token,
  });

  console.log('Site names state:', { siteNames, isSiteNamesLoading, siteNamesError });

  const { data: moduleData } = useQuery({
    queryKey: ["permissions", "modules", selectedRole],
    queryFn: async () => {
      const response = await backendPermissionApi.getModulePermissions(selectedRole, token);
      return response.modules as ModulePermission[];
    },
    enabled: !!token && isSuperAdmin && isPermissionsOpen,
  });

  const createForm = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      email: "",
      password: "",
      confirm_password: "",
      first_name: "",
      last_name: "",
      phone: "",
      role: "user",
      assigned_platform_code: "",
    },
  });

  const editForm = useForm<UpdateUserFormData>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      phone: "",
      role: "user",
      is_active: true,
      is_verified: false,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: CreateUserFormData) => {
      return await backendUserApi.createUser(data, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      refetch();
      toast({
        title: "Success! 🎉",
        description: "User created successfully",
      });
      setIsCreateOpen(false);
      createForm.reset();
      setShowPassword(false);
      setShowConfirmPassword(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create user",
        variant: "destructive",
      });
    },
  });

  const loginAsMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await fetch(`${BACKEND_BASE_URL}/api/v1/admin/users/login-as`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ user_id: userId }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to login as user');
      }
      
      return await response.json();
    },
    onSuccess: (data) => {
      const currentAccessToken = localStorage.getItem('access_token');
      const currentRefreshToken = localStorage.getItem('refresh_token');
      const currentUserData = localStorage.getItem('currentUser');
      
      if (!localStorage.getItem('original_user')) {
        localStorage.setItem('original_user', JSON.stringify({
          access_token: currentAccessToken,
          refresh_token: currentRefreshToken,
          user_data: currentUserData,
        }));
      }
      
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('refresh_token', data.refresh_token);
      
      const newUserData = {
        id: data.user.id,
        email: data.user.email,
        name: `${data.user.first_name} ${data.user.last_name}`,
        role: data.user.role,
        createdAt: data.user.created_at,
        platform_code: data.user.platform_code,
        assigned_platform_code: data.user.assigned_platform_code,
        permissions: data.permissions || [],
      };
      localStorage.setItem('currentUser', JSON.stringify(newUserData));
      
      toast({
        title: "Success",
        description: `Logged in as ${data.user.email}`,
      });
      
      window.location.reload();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to login as user",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: UpdateUserFormData) => {
      if (!selectedUser) throw new Error("No user selected");
      return await backendUserApi.updateUser(selectedUser.id, data, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      refetch();
      toast({
        title: "Success! ✨",
        description: "User updated successfully",
      });
      setIsEditOpen(false);
      setSelectedUser(null);
      editForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update user",
        variant: "destructive",
      });
    },
  });

  const assignPermissionsMutation = useMutation({
    mutationFn: async (data: { role: string; permissions: string[] }) => {
      return await backendPermissionApi.assignPermissions(data.role, data.permissions, token);
    },
    onSuccess: () => {
      toast({
        title: "Success! ✨",
        description: "Permissions assigned successfully",
      });
      setIsPermissionsOpen(false);
      queryClient.invalidateQueries({ queryKey: ["permissions"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to assign permissions",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (moduleData) {
      const assigned = new Set<string>();
      moduleData.forEach((module) => {
        module.permissions.forEach((perm) => {
          if (perm.assigned) {
            assigned.add(perm.name);
          }
        });
      });
      setSelectedPermissions(assigned);
    }
  }, [moduleData]);

  const handlePermissionToggle = (permissionName: string) => {
    const newSelected = new Set(selectedPermissions);
    if (newSelected.has(permissionName)) {
      newSelected.delete(permissionName);
    } else {
      newSelected.add(permissionName);
    }
    setSelectedPermissions(newSelected);
  };

  const handleModuleToggle = (moduleName: string, checked: boolean) => {
    const newSelected = new Set(selectedPermissions);
    moduleData?.forEach((module) => {
      if (module.module.name === moduleName) {
        module.permissions.forEach((perm) => {
          if (checked) {
            newSelected.add(perm.name);
          } else {
            newSelected.delete(perm.name);
          }
        });
      }
    });
    setSelectedPermissions(newSelected);
  };

  const handleSavePermissions = () => {
    assignPermissionsMutation.mutate({
      role: selectedRole,
      permissions: Array.from(selectedPermissions),
    });
  };

  const filteredUsers = (users || []).filter((user) => {
    const searchLower = search.toLowerCase();
    const matchesSearch =
      !search ||
      user.email.toLowerCase().includes(searchLower) ||
      `${user.first_name} ${user.last_name}`.toLowerCase().includes(searchLower);
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const formatRoleName = (role: string) => {
    return role
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-500">
      <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-primary/10 via-primary/5 to-background p-6 border">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        <div className="relative flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent flex items-center gap-2">
              <UsersIcon className="h-8 w-8 text-primary" />
              Users Management
            </h1>
            <p className="text-muted-foreground mt-2">
              Manage platform users, roles, and permissions
            </p>
          </div>
          <Button
            onClick={() => setIsCreateOpen(true)}
            className="gap-2 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            size="lg"
          >
            <Plus className="h-5 w-5" />
            <Sparkles className="h-4 w-4" />
            Create User
          </Button>
        </div>
      </div>

      <Card className="p-4 border-2">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 border-2 focus:border-primary transition-colors"
            />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-full sm:w-48 border-2">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <div className="p-2">
                <p className="text-xs font-semibold text-muted-foreground mb-2 px-2">System Roles</p>
                <SelectItem value="super_admin">Super Admin</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="operator">Operator</SelectItem>
                <SelectItem value="agent">Agent</SelectItem>
                <SelectItem value="user">User</SelectItem>
              </div>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {isSuperAdmin && (
        <Card className="p-6 border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-background">
          <div className="flex items-center gap-3 mb-4">
            <Crown className="h-6 w-6 text-primary animate-pulse" />
            <h2 className="text-xl font-bold">Super Admin Controls</h2>
          </div>
          <Tabs defaultValue="permissions" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="permissions" className="gap-2">
                <KeyRound className="h-4 w-4" />
                Role Permissions
              </TabsTrigger>
              <TabsTrigger value="assign" className="gap-2">
                <UserCog className="h-4 w-4" />
                Assign to User
              </TabsTrigger>
            </TabsList>
            <TabsContent value="permissions" className="mt-4">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Select value={selectedRole} onValueChange={setSelectedRole}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <div className="p-2">
                        <p className="text-xs font-semibold text-muted-foreground mb-2 px-2">System Roles</p>
                        <SelectItem value="super_admin">Super Admin</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="operator">Operator</SelectItem>
                        <SelectItem value="agent">Agent</SelectItem>
                        <SelectItem value="user">User</SelectItem>
                      </div>
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={() => setIsPermissionsOpen(true)}
                    className="gap-2"
                    variant="outline"
                  >
                    <Eye className="h-4 w-4" />
                    View/Edit Permissions
                  </Button>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="assign" className="mt-4">
              <p className="text-sm text-muted-foreground">
                Select a user from the table below and click "Manage Permissions" to assign specific permissions.
              </p>
            </TabsContent>
          </Tabs>
        </Card>
      )}

      <Card className="overflow-hidden border-2">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b-2">
              <tr>
                <th className="text-left py-4 px-6 text-sm font-semibold">User</th>
                <th className="text-left py-4 px-6 text-sm font-semibold">Role</th>
                <th className="text-left py-4 px-6 text-sm font-semibold">Tree</th>
                <th className="text-left py-4 px-6 text-sm font-semibold">Status</th>
                <th className="text-left py-4 px-6 text-sm font-semibold">Created</th>
                <th className="text-right py-4 px-6 text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b">
                    <td colSpan={6} className="py-4 px-6">
                      <div className="h-12 bg-muted rounded animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : error ? (
                <tr>
                  <td colSpan={6} className="text-center py-12">
                    <div className="flex flex-col items-center gap-2">
                      <XCircle className="h-12 w-12 text-destructive" />
                      <p className="text-destructive">Error loading users</p>
                      <p className="text-sm text-muted-foreground">{(error as any)?.message || "Unknown error"}</p>
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12">
                    <div className="flex flex-col items-center gap-2">
                      <UsersIcon className="h-12 w-12 text-muted-foreground/50" />
                      <p className="text-muted-foreground">
                        {users.length === 0 ? "No users found. Create your first user!" : "No users match your filters"}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user, index) => {
                  const RoleIcon = roleIcons[user.role as keyof typeof roleIcons] || UsersIcon;
                  return (
                    <tr
                      key={user.id}
                      className="border-b hover:bg-muted/30 transition-colors"
                      style={{
                        animationDelay: `${index * 50}ms`,
                      }}
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <RoleIcon className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">
                              {user.name ||
                                (user.first_name && user.last_name
                                  ? `${user.first_name} ${user.last_name}`
                                  : user.email.split("@")[0])}
                            </p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <Badge
                          variant="outline"
                          className={`${roleColors[user.role as keyof typeof roleColors] || roleColors.user}`}
                        >
                          <RoleIcon className="h-3 w-3 mr-1" />
                          {formatRoleName(user.role)}
                        </Badge>
                        {user.role === "agent" && user.profit_margin != null && (
                          <div className="text-xs text-muted-foreground mt-1">
                            Margin: {user.profit_margin}%
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        {user.descendants_tree && user.descendants_tree.length > 0 ? (
                          <div className="text-xs max-w-md">
                            {user.descendants_tree.map((node) => (
                              <TreeNodeComponent 
                                key={node.id} 
                                node={node} 
                                level={0}
                                onNodeClick={handleLoginAs}
                                isLoading={loginAsMutation.isPending}
                              />
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">No descendants</span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <StatusBadge status={user.is_active ? "active" : "inactive"} />
                      </td>
                      <td className="py-4 px-6 text-sm text-muted-foreground">
                        {user.created_at ? new Date(user.created_at).toLocaleDateString() : "N/A"}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-end gap-2">
                          {isSuperAdmin && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedUserForPermissions(user.id);
                                setSelectedRole(user.role);
                                setIsPermissionsOpen(true);
                              }}
                              className="gap-1 hover:text-primary"
                            >
                              <KeyRound className="h-4 w-4" />
                              Permissions
                            </Button>
                          )}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                className="gap-2"
                                onClick={() => {
                                  setSelectedUser(user);
                                  let platformValue = "";
                                  if (user.role === "operator" || user.role === "agent") {
                                    platformValue = user.assigned_platform_code || "";
                                  } else if (user.role === "user") {
                                    platformValue = user.platform_code || "";
                                  }
                                  
                                  editForm.reset({
                                    first_name: user.first_name,
                                    last_name: user.last_name,
                                    phone: user.phone || "",
                                    role: user.role as any,
                                    is_active: user.is_active,
                                    is_verified: user.is_verified,
                                    assigned_platform_code: platformValue,
                                    profit_margin: user.profit_margin ?? null,
                                  });
                                  setIsEditOpen(true);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem className="gap-2 text-destructive">
                                <Trash2 className="h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <Sparkles className="h-6 w-6 text-primary" />
              Create New User
            </DialogTitle>
            <DialogDescription>
              Add a new user to the platform with role and permissions
            </DialogDescription>
          </DialogHeader>
          <Form {...createForm}>
            <form
              onSubmit={createForm.handleSubmit((data) => {
                const { confirm_password, ...payload } = data;
                createMutation.mutate(payload as any);
              })}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={createForm.control}
                  name="first_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={createForm.control}
                  name="last_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={createForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="user@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          className="pr-10"
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((v) => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                          tabIndex={-1}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </FormControl>
                    <div className="text-xs text-muted-foreground space-y-0.5 mt-1">
                      {[
                        { ok: (field.value?.length ?? 0) >= 8,        label: "At least 8 characters" },
                        { ok: /[A-Za-z]/.test(field.value ?? ""),     label: "Contains a letter" },
                        { ok: /[0-9]/.test(field.value ?? ""),         label: "Contains a number" },
                        { ok: /[^A-Za-z0-9]/.test(field.value ?? ""), label: "Contains a special character" },
                      ].map(({ ok, label }) => (
                        <div key={label} className={`flex items-center gap-1.5 ${ok ? "text-green-500" : ""}`}>
                          <span>{ok ? "✓" : "○"}</span>
                          <span>{label}</span>
                        </div>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name="confirm_password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="••••••••"
                          className="pr-10"
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword((v) => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                          tabIndex={-1}
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <div className="p-2">
                          <p className="text-xs font-semibold text-muted-foreground mb-2 px-2">System Roles</p>
                          {allowedRoles.includes("super_admin") && (
                            <SelectItem value="super_admin">
                              <div className="flex items-center gap-2">
                                <Crown className="h-4 w-4" />
                                Super Admin
                              </div>
                            </SelectItem>
                          )}
                          {allowedRoles.includes("admin") && (
                            <SelectItem value="admin">Admin</SelectItem>
                          )}
                          {allowedRoles.includes("operator") && (
                            <SelectItem value="operator">Operator</SelectItem>
                          )}
                          {allowedRoles.includes("agent") && (
                            <SelectItem value="agent">Agent</SelectItem>
                          )}
                          {allowedRoles.includes("user") && (
                            <SelectItem value="user">User</SelectItem>
                          )}
                        </div>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {!isOperator && !isAgent && (
                <FormField
                  control={createForm.control}
                  name="assigned_platform_code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Platform Assign</FormLabel>
                      <Select 
                        onValueChange={(value) => {
                          field.onChange(value === "__none__" ? "" : value);
                        }} 
                        defaultValue={field.value || "__none__"}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select platform (optional)" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="__none__">None</SelectItem>
                          {siteNames.map((siteName: string) => (
                            <SelectItem key={siteName} value={siteName}>
                              {siteName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending} className="gap-2">
                  {createMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      Create User
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <Edit className="h-6 w-6 text-primary" />
              Edit User
            </DialogTitle>
            <DialogDescription>
              Update user information, role, and status
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <Form {...editForm}>
              <form
                onSubmit={editForm.handleSubmit((data) => updateMutation.mutate(data))}
                className="space-y-4"
              >
                <div className="p-3 bg-muted rounded-md">
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                  <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={editForm.control}
                    name="first_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editForm.control}
                    name="last_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={editForm.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="+1234567890" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {allowedRoles.includes("super_admin") && (
                            <SelectItem value="super_admin">
                              <div className="flex items-center gap-2">
                                <Crown className="h-4 w-4" />
                                Super Admin
                              </div>
                            </SelectItem>
                          )}
                          {allowedRoles.includes("admin") && (
                            <SelectItem value="admin">Admin</SelectItem>
                          )}
                          {allowedRoles.includes("operator") && (
                            <SelectItem value="operator">Operator</SelectItem>
                          )}
                          {allowedRoles.includes("agent") && (
                            <SelectItem value="agent">Agent</SelectItem>
                          )}
                          {allowedRoles.includes("user") && (
                            <SelectItem value="user">User</SelectItem>
                          )}
                          {allowedRoles.includes("platform_admin") && (
                            <SelectItem value="platform_admin">Platform Admin</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {!isOperator && !isAgent && (
                  <FormField
                    control={editForm.control}
                    name="assigned_platform_code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Platform Assign</FormLabel>
                        <Select 
                          onValueChange={(value) => {
                            field.onChange(value === "__none__" ? "" : value);
                          }} 
                          value={field.value || "__none__"}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select platform (optional)" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="__none__">None</SelectItem>
                            {siteNames.map((siteName: string) => (
                              <SelectItem key={siteName} value={siteName}>
                                {siteName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                {(editForm.watch("role") === "agent" || editForm.watch("role") === "operator" ||
                  selectedUser?.role === "agent" || selectedUser?.role === "operator") &&
                  !isAgent && (
                  <FormField
                    control={editForm.control}
                    name="profit_margin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Profit Margin (%)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            step="0.01"
                            placeholder="e.g. 25.50"
                            value={field.value ?? ""}
                            onChange={(e) => {
                              const v = e.target.value;
                              field.onChange(v === "" ? null : parseFloat(v));
                            }}
                          />
                        </FormControl>
                        <div className="text-xs text-muted-foreground">
                          Agent/Operator share of GGR (0–100%). Leave empty for no profit share.
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={editForm.control}
                    name="is_active"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Active Status</FormLabel>
                          <div className="text-sm text-muted-foreground">
                            User can login and access the system
                          </div>
                        </div>
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editForm.control}
                    name="is_verified"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Verified</FormLabel>
                          <div className="text-sm text-muted-foreground">
                            User email is verified
                          </div>
                        </div>
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsEditOpen(false);
                      setSelectedUser(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={updateMutation.isPending} className="gap-2">
                    {updateMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4" />
                        Update User
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isPermissionsOpen} onOpenChange={setIsPermissionsOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <KeyRound className="h-6 w-6 text-primary" />
              Manage Permissions for {formatRoleName(selectedRole)}
            </DialogTitle>
            <DialogDescription>
              Assign module-wise permissions to this role
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {moduleData?.map((modulePerm) => {
              const allSelected = modulePerm.permissions.every((p) =>
                selectedPermissions.has(p.name)
              );
              return (
                <Card key={modulePerm.module.id} className="p-4 border-2">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold">{modulePerm.module.display_name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {modulePerm.module.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={allSelected}
                        onCheckedChange={(checked) =>
                          handleModuleToggle(modulePerm.module.name, checked as boolean)
                        }
                      />
                      <span className="text-sm">Select All</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {modulePerm.permissions.map((permission) => (
                      <div
                        key={permission.id}
                        className="flex items-center gap-2 p-2 rounded border hover:bg-muted/50"
                      >
                        <Checkbox
                          checked={selectedPermissions.has(permission.name)}
                          onCheckedChange={() => handlePermissionToggle(permission.name)}
                        />
                        <div className="flex-1">
                          <div className="text-sm font-medium">{permission.display_name}</div>
                          <div className="text-xs text-muted-foreground">
                            {permission.description}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              );
            })}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPermissionsOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSavePermissions}
              disabled={assignPermissionsMutation.isPending}
              className="gap-2"
            >
              {assignPermissionsMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Save Permissions
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
