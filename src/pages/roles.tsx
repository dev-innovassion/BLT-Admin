import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Plus,
  Edit,
  Trash2,
  Shield,
  Crown,
  UserCog,
  Users,
  Sparkles,
  Loader2,
  CheckCircle2,
  XCircle,
  KeyRound,
  Save,
  Eye,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { backendRoleApi, type CreateRoleRequest, type RoleResponse } from "@/lib/backendRoleApi";
import { backendPermissionApi } from "@/lib/backendApi";
import type { ModulePermission } from "@shared/schema";
import { z } from "zod";

const createRoleSchema = z.object({
  name: z.string().min(2).max(100).regex(/^[a-z0-9_]+$/, "Name must be lowercase with underscores only"),
  display_name: z.string().min(2).max(255),
  description: z.string().optional(),
  permissions: z.array(z.string()).min(1, "At least one permission is required"),
});

const updateRoleSchema = z.object({
  display_name: z.string().min(2).max(255).optional(),
  description: z.string().optional(),
  permissions: z.array(z.string()).min(1, "At least one permission is required").optional(),
});

type CreateRoleFormData = z.infer<typeof createRoleSchema>;
type UpdateRoleFormData = z.infer<typeof updateRoleSchema>;

const roleIcons = {
  super_admin: Crown,
  admin: Shield,
  operator: UserCog,
  agent: Users,
  user: Users,
};

export default function RolesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<RoleResponse | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(new Set());

  const token = localStorage.getItem("access_token") || "";
  const isSuperAdmin = user?.role === "super_admin";

  const { data: roles = [], isLoading, refetch } = useQuery({
    queryKey: ["roles", token],
    queryFn: async () => {
      if (!token) return [];
      return await backendRoleApi.getRoles(token);
    },
    enabled: !!token && isSuperAdmin,
  });

  const { data: moduleData } = useQuery({
    queryKey: ["permissions", "modules", "all"],
    queryFn: async () => {
      const response = await backendPermissionApi.getModulePermissions("admin", token);
      return response.modules as ModulePermission[];
    },
    enabled: !!token && isSuperAdmin && (isCreateOpen || isEditOpen),
  });

  const createForm = useForm<CreateRoleFormData>({
    resolver: zodResolver(createRoleSchema),
    defaultValues: {
      name: "",
      display_name: "",
      description: "",
      permissions: [],
    },
  });

  const editForm = useForm<UpdateRoleFormData>({
    resolver: zodResolver(updateRoleSchema),
    defaultValues: {
      display_name: "",
      description: "",
      permissions: [],
    },
  });

  useEffect(() => {
    if (moduleData && selectedRole && isEditOpen) {
      const assigned = new Set(selectedRole.permissions);
      setSelectedPermissions(assigned);
      editForm.setValue("permissions", Array.from(assigned));
    } else if (moduleData && isCreateOpen) {
      setSelectedPermissions(new Set());
      createForm.setValue("permissions", []);
    }
  }, [moduleData, selectedRole, isEditOpen, isCreateOpen]);

  const createMutation = useMutation({
    mutationFn: async (data: CreateRoleFormData) => {
      return await backendRoleApi.createRole(data, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      refetch();
      toast({
        title: "Success! 🎉",
        description: "Role created successfully",
      });
      setIsCreateOpen(false);
      createForm.reset();
      setSelectedPermissions(new Set());
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create role",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: UpdateRoleFormData) => {
      if (!selectedRole) throw new Error("No role selected");
      return await backendRoleApi.updateRole(selectedRole.id, data, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      refetch();
      toast({
        title: "Success! ✨",
        description: "Role updated successfully",
      });
      setIsEditOpen(false);
      setSelectedRole(null);
      editForm.reset();
      setSelectedPermissions(new Set());
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update role",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await backendRoleApi.deleteRole(id, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      refetch();
      toast({
        title: "Success! 🗑️",
        description: "Role deleted successfully",
      });
      setIsDeleteOpen(false);
      setSelectedRole(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete role",
        variant: "destructive",
      });
    },
  });

  const handlePermissionToggle = (permissionName: string, isCreate: boolean = false) => {
    const newSelected = new Set(selectedPermissions);
    if (newSelected.has(permissionName)) {
      newSelected.delete(permissionName);
    } else {
      newSelected.add(permissionName);
    }
    setSelectedPermissions(newSelected);
    
    if (isCreate) {
      createForm.setValue("permissions", Array.from(newSelected));
    } else {
      editForm.setValue("permissions", Array.from(newSelected));
    }
  };

  const handleModuleToggle = (moduleName: string, checked: boolean, isCreate: boolean = false) => {
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
    
    if (isCreate) {
      createForm.setValue("permissions", Array.from(newSelected));
    } else {
      editForm.setValue("permissions", Array.from(newSelected));
    }
  };

  const handleEdit = (role: RoleResponse) => {
    setSelectedRole(role);
    editForm.reset({
      display_name: role.display_name,
      description: role.description || "",
      permissions: role.permissions,
    });
    setSelectedPermissions(new Set(role.permissions));
    setIsEditOpen(true);
  };

  const handleView = (role: RoleResponse) => {
    setSelectedRole(role);
    setIsViewOpen(true);
  };

  const handleDelete = (role: RoleResponse) => {
    setSelectedRole(role);
    setIsDeleteOpen(true);
  };

  const formatRoleName = (name: string) => {
    return name
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const groupPermissions = (perms: string[]) => {
    const grouped: Record<string, string[]> = {};
    perms.forEach((perm) => {
      const [module] = perm.split(".");
      if (!grouped[module]) {
        grouped[module] = [];
      }
      grouped[module].push(perm);
    });
    return grouped;
  };

  if (!isSuperAdmin) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Access Denied</h1>
          <p className="text-muted-foreground mt-2">
            Only super admins can manage roles
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-500">
      <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-primary/10 via-primary/5 to-background p-6 border">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        <div className="relative flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent flex items-center gap-2">
              <Shield className="h-8 w-8 text-primary" />
              Roles Management
            </h1>
            <p className="text-muted-foreground mt-2">
              Create and manage custom roles with specific permissions
            </p>
          </div>
          <Button
            onClick={() => {
              setIsCreateOpen(true);
              createForm.reset();
              setSelectedPermissions(new Set());
            }}
            className="gap-2 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            size="lg"
          >
            <Plus className="h-5 w-5" />
            <Sparkles className="h-4 w-4" />
            Create Role
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 bg-muted rounded-md animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {roles.map((role, index) => {
            const Icon = roleIcons[role.name as keyof typeof roleIcons] || Shield;
            const groupedPerms = groupPermissions(role.permissions);
            return (
              <Card
                key={role.id}
                className="p-6 border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-lg"
                style={{
                  animationDelay: `${index * 50}ms`,
                }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{role.display_name}</h3>
                      <p className="text-xs text-muted-foreground font-mono">{role.name}</p>
                    </div>
                  </div>
                  {role.is_system_role && (
                    <Badge variant="outline" className="text-xs">
                      System
                    </Badge>
                  )}
                </div>

                {role.description && (
                  <p className="text-sm text-muted-foreground mb-4">{role.description}</p>
                )}

                <div className="mb-4">
                  <Badge variant="secondary" className="text-xs">
                    {role.permissions.length} Permissions
                  </Badge>
                </div>

                <div className="space-y-2 mb-4 max-h-32 overflow-y-auto">
                  {Object.keys(groupedPerms).slice(0, 3).map((module) => (
                    <div key={module} className="text-xs text-muted-foreground">
                      • {module.charAt(0).toUpperCase() + module.slice(1)}
                    </div>
                  ))}
                  {Object.keys(groupedPerms).length > 3 && (
                    <div className="text-xs text-muted-foreground">
                      +{Object.keys(groupedPerms).length - 3} more modules
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-4 border-t">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleView(role)}
                    className="flex-1 gap-1"
                  >
                    <Eye className="h-4 w-4" />
                    View
                  </Button>
                  {!role.is_system_role && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(role)}
                        className="flex-1 gap-1"
                      >
                        <Edit className="h-4 w-4" />
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(role)}
                        className="text-destructive hover:text-destructive gap-1"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <Sparkles className="h-6 w-6 text-primary" />
              Create New Role
            </DialogTitle>
            <DialogDescription>
              Create a custom role with specific permissions
            </DialogDescription>
          </DialogHeader>
          <Form {...createForm}>
            <form
              onSubmit={createForm.handleSubmit((data) => createMutation.mutate(data))}
              className="space-y-4"
            >
              <FormField
                control={createForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role Name (ID)</FormLabel>
                    <FormControl>
                      <Input placeholder="custom_role_name" {...field} />
                    </FormControl>
                    <p className="text-xs text-muted-foreground">
                      Lowercase with underscores only (e.g., "support_agent")
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name="display_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Display Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Support Agent" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input placeholder="Role description..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <FormLabel>Permissions</FormLabel>
                  <Badge variant="outline">
                    {selectedPermissions.size} selected
                  </Badge>
                </div>
                <div className="space-y-4 max-h-96 overflow-y-auto border rounded-lg p-4">
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
                                handleModuleToggle(modulePerm.module.name, checked as boolean, true)
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
                                onCheckedChange={() => handlePermissionToggle(permission.name, true)}
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
              </div>

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
                      Create Role
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <Edit className="h-6 w-6 text-primary" />
              Edit Role
            </DialogTitle>
            <DialogDescription>
              Update role information and permissions
            </DialogDescription>
          </DialogHeader>
          {selectedRole && (
            <Form {...editForm}>
              <form
                onSubmit={editForm.handleSubmit((data) => updateMutation.mutate(data))}
                className="space-y-4"
              >
                <div className="p-3 bg-muted rounded-md">
                  <p className="text-sm font-medium">Role Name</p>
                  <p className="text-sm text-muted-foreground font-mono">{selectedRole.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">Role name cannot be changed</p>
                </div>
                <FormField
                  control={editForm.control}
                  name="display_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Display Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Support Agent" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Input placeholder="Role description..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <FormLabel>Permissions</FormLabel>
                    <Badge variant="outline">
                      {selectedPermissions.size} selected
                    </Badge>
                  </div>
                  <div className="space-y-4 max-h-96 overflow-y-auto border rounded-lg p-4">
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
                                  handleModuleToggle(modulePerm.module.name, checked as boolean, false)
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
                                  onCheckedChange={() => handlePermissionToggle(permission.name, false)}
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
                </div>

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsEditOpen(false);
                      setSelectedRole(null);
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
                        <Save className="h-4 w-4" />
                        Update Role
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <Eye className="h-6 w-6 text-primary" />
              {selectedRole?.display_name}
            </DialogTitle>
            <DialogDescription>
              View role details and permissions
            </DialogDescription>
          </DialogHeader>
          {selectedRole && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-md">
                <p className="text-sm font-medium mb-2">Role Information</p>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Name:</span>{" "}
                    <span className="font-mono">{selectedRole.name}</span>
                  </div>
                  {selectedRole.description && (
                    <div>
                      <span className="text-muted-foreground">Description:</span>{" "}
                      {selectedRole.description}
                    </div>
                  )}
                  <div>
                    <span className="text-muted-foreground">Type:</span>{" "}
                    <Badge variant={selectedRole.is_system_role ? "default" : "secondary"}>
                      {selectedRole.is_system_role ? "System Role" : "Custom Role"}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Permissions:</span>{" "}
                    <Badge variant="outline">{selectedRole.permissions.length}</Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <p className="font-semibold">Permissions</p>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {Object.entries(groupPermissions(selectedRole.permissions)).map(([module, perms]) => (
                    <Card key={module} className="p-3">
                      <h4 className="font-medium text-sm mb-2">
                        {module.charAt(0).toUpperCase() + module.slice(1)} Module
                      </h4>
                      <div className="space-y-1">
                        {perms.map((perm) => (
                          <div key={perm} className="flex items-center gap-2 text-sm">
                            <CheckCircle2 className="h-3 w-3 text-primary" />
                            <span className="text-muted-foreground">{perm}</span>
                          </div>
                        ))}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Role</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the role "{selectedRole?.display_name}"? This action
              cannot be undone. Users with this role will need to be reassigned.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedRole && deleteMutation.mutate(selectedRole.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
