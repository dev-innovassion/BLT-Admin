import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Shield, Save, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { backendPermissionApi } from "@/lib/backendApi";
import type { ModulePermission, AssignPermissionsRequest } from "@shared/schema";

export default function PermissionsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedRole, setSelectedRole] = useState<string>("admin");
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(new Set());

  const token = localStorage.getItem("access_token") || "";

  const { data: moduleData, isLoading } = useQuery({
    queryKey: ["permissions", "modules", selectedRole],
    queryFn: async () => {
      const response = await backendPermissionApi.getModulePermissions(selectedRole, token);
      return response.modules as ModulePermission[];
    },
    enabled: !!token && !!user && user.role === "super_admin",
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

  const assignMutation = useMutation({
    mutationFn: async (data: AssignPermissionsRequest) => {
      return await backendPermissionApi.assignPermissions(data.role, data.permissions, token);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Permissions updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["permissions"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update permissions",
        variant: "destructive",
      });
    },
  });

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

  const handleSave = () => {
    assignMutation.mutate({
      role: selectedRole as any,
      permissions: Array.from(selectedPermissions),
    });
  };

  const formatRoleName = (role: string) => {
    return role
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  if (!user) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Access Denied</h1>
          <p className="text-muted-foreground mt-2">
            Please log in to access this page
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Permission Management</h1>
          <p className="text-muted-foreground mt-2">
            Assign permissions to roles. Super admins have all permissions by default.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={selectedRole} onValueChange={setSelectedRole}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="operator">Operator</SelectItem>
              <SelectItem value="agent">Agent</SelectItem>
              <SelectItem value="user">User</SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={handleSave}
            disabled={assignMutation.isPending}
            className="gap-2"
          >
            {assignMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Permissions
              </>
            )}
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-32 bg-muted rounded-md animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {moduleData?.map((modulePerm) => {
            const allSelected = modulePerm.permissions.every((p) =>
              selectedPermissions.has(p.name)
            );
            const someSelected = modulePerm.permissions.some((p) =>
              selectedPermissions.has(p.name)
            );

            return (
              <Card key={modulePerm.module.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">
                        {modulePerm.module.display_name}
                      </h3>
                      <Badge variant="outline">
                        {modulePerm.permissions.filter((p) =>
                          selectedPermissions.has(p.name)
                        ).length}{" "}
                        / {modulePerm.permissions.length}
                      </Badge>
                    </div>
                    {modulePerm.module.description && (
                      <p className="text-sm text-muted-foreground">
                        {modulePerm.module.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={allSelected}
                      onCheckedChange={(checked) =>
                        handleModuleToggle(modulePerm.module.name, checked as boolean)
                      }
                    />
                    <span className="text-sm text-muted-foreground">
                      Select All
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {modulePerm.permissions.map((permission) => (
                    <div
                      key={permission.id}
                      className="flex items-center gap-3 p-3 rounded-md border hover:bg-muted/50"
                    >
                      <Checkbox
                        checked={selectedPermissions.has(permission.name)}
                        onCheckedChange={() =>
                          handlePermissionToggle(permission.name)
                        }
                      />
                      <div className="flex-1">
                        <div className="font-medium text-sm">
                          {permission.display_name}
                        </div>
                        {permission.description && (
                          <div className="text-xs text-muted-foreground mt-1">
                            {permission.description}
                          </div>
                        )}
                        <Badge variant="secondary" className="mt-1 text-xs">
                          {permission.action}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Card className="p-6 bg-muted/30">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          Permission Management Guidelines
        </h3>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>
            • <strong className="text-foreground">Super Admin:</strong> Has all permissions by default and cannot be modified
          </p>
          <p>
            • <strong className="text-foreground">Module-level permissions:</strong> Use "Select All" to assign all permissions for a module
          </p>
          <p>
            • <strong className="text-foreground">Manage permission:</strong> Grants full access to a module, including all sub-permissions
          </p>
          <p>
            • <strong className="text-foreground">Changes take effect immediately:</strong> Users will need to log out and log back in for permission changes to apply
          </p>
        </div>
      </Card>
    </div>
  );
}

