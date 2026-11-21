import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Package as PackageIcon,
  Loader2,
  RefreshCw,
  Edit,
  Trash2,
  Plus,
  X,
  Save,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  packageApi,
  type Package,
  type PackageRequest,
} from "@/lib/backendPackagesApi";

import { CURRENCY, formatCurrency } from "@/lib/currency";

export default function PackagesPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<Package | null>(null);
  const [newFeature, setNewFeature] = useState("");
  const [packageForm, setPackageForm] = useState<PackageRequest>({
    name: "",
    description: "",
    price: 0,
    currency: CURRENCY,
    icon: "zap",
    is_popular: false,
    is_active: true,
    has_theme_studio: false,
    sort_order: 0,
    additional_note: "",
    button_text: "Get Started",
    button_variant: "default",
    features: [],
  });

  const {
    data: packagesData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["packages", page, limit],
    queryFn: async () => {
      const response = await packageApi.getPackages(page, limit);
      if (!response.success || !response.data) {
        throw new Error(response.error || "Failed to fetch packages");
      }
      return response.data;
    },
  });

  const createPackageMutation = useMutation({
    mutationFn: async (data: PackageRequest) => {
      const response = await packageApi.createPackage(data);
      if (!response.success || !response.data) {
        throw new Error(response.error || "Failed to create package");
      }
      return response.data;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Package created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["packages"] });
      setIsCreateDialogOpen(false);
      resetForm();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create package",
        variant: "destructive",
      });
    },
  });

  const updatePackageMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: PackageRequest }) => {
      const response = await packageApi.updatePackage(id, data);
      if (!response.success || !response.data) {
        throw new Error(response.error || "Failed to update package");
      }
      return response.data;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Package updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["packages"] });
      setIsEditDialogOpen(false);
      setEditingPackage(null);
      resetForm();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update package",
        variant: "destructive",
      });
    },
  });

  const togglePackageMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const response = await packageApi.togglePackage(id, isActive);
      if (!response.success) {
        throw new Error(response.error || "Failed to toggle package");
      }
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Package status updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["packages"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to toggle package",
        variant: "destructive",
      });
    },
  });

  const deletePackageMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await packageApi.deletePackage(id);
      if (!response.success) {
        throw new Error(response.error || "Failed to delete package");
      }
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Package deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["packages"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete package",
        variant: "destructive",
      });
    },
  });

      const resetForm = () => {
    setPackageForm({
      name: "",
      description: "",
      price: 0,
      currency: CURRENCY,
      icon: "zap",
      is_popular: false,
      is_active: true,
      has_theme_studio: false,
      sort_order: 0,
      additional_note: "",
      button_text: "Get Started",
      button_variant: "default",
      features: [],
    });
    setNewFeature("");
  };

  const handleCreatePackage = () => {
    if (!packageForm.name.trim() || !packageForm.description.trim() || packageForm.features.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields and add at least one feature",
        variant: "destructive",
      });
      return;
    }
    createPackageMutation.mutate(packageForm);
  };

  const handleEditPackage = (pkg: Package) => {
    setEditingPackage(pkg);
    setPackageForm({
      name: pkg.name,
      description: pkg.description,
      price: pkg.price,
      currency: pkg.currency,
      icon: pkg.icon,
      is_popular: pkg.is_popular,
      is_active: pkg.is_active,
      has_theme_studio: pkg.has_theme_studio || false,
      sort_order: pkg.sort_order,
      additional_note: pkg.additional_note || "",
      button_text: pkg.button_text,
      button_variant: pkg.button_variant,
      features: pkg.features.map((f) => f.text),
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdatePackage = () => {
    if (!editingPackage || !packageForm.name.trim() || !packageForm.description.trim() || packageForm.features.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields and add at least one feature",
        variant: "destructive",
      });
      return;
    }
    updatePackageMutation.mutate({ id: editingPackage.id, data: packageForm });
  };

  const handleTogglePackage = (pkg: Package) => {
    togglePackageMutation.mutate({ id: pkg.id, isActive: !pkg.is_active });
  };

  const handleDeletePackage = (pkg: Package) => {
    if (!confirm(`Are you sure you want to delete the package "${pkg.name}"?`)) {
      return;
    }
    deletePackageMutation.mutate(pkg.id);
  };

  const addFeature = () => {
    if (newFeature.trim()) {
      setPackageForm((prev) => ({
        ...prev,
        features: [...prev.features, newFeature.trim()],
      }));
      setNewFeature("");
    }
  };

  const removeFeature = (index: number) => {
    setPackageForm((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
  };

  const formatPrice = (price: number, currency: string) =>
    formatCurrency(price / 100, {
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Packages Management</h1>
        <p className="text-muted-foreground mt-2">
          Manage pricing packages and their features
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Packages</CardTitle>
              <CardDescription>
                {packagesData?.total ? `${packagesData.total} total packages` : "Loading packages..."}
              </CardDescription>
            </div>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Package
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : error ? (
            <div className="text-center py-8 text-destructive">
              Failed to load packages. Please try again.
            </div>
          ) : !packagesData?.packages || packagesData.packages.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No packages found. Create one to get started.
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Popular</TableHead>
                      <TableHead>Theme Studio</TableHead>
                      <TableHead>Sort Order</TableHead>
                      <TableHead>Features</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {packagesData.packages.map((pkg) => (
                      <TableRow key={pkg.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{pkg.icon}</span>
                            {pkg.name}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-semibold">
                            {formatPrice(pkg.price, pkg.currency)}
                          </div>
                          {pkg.additional_note && (
                            <div className="text-xs text-muted-foreground">
                              {pkg.additional_note}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={pkg.is_active ? "default" : "secondary"}>
                            {pkg.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {pkg.is_popular && (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              Popular
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {pkg.has_theme_studio && (
                            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                              Theme Studio
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>{pkg.sort_order}</TableCell>
                        <TableCell>
                          <div className="text-sm text-muted-foreground">
                            {pkg.features.length} features
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleTogglePackage(pkg)}
                              disabled={togglePackageMutation.isPending}
                              className="flex items-center gap-1"
                            >
                              {pkg.is_active ? (
                                <ToggleRight className="h-3 w-3" />
                              ) : (
                                <ToggleLeft className="h-3 w-3" />
                              )}
                              {pkg.is_active ? "Disable" : "Enable"}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditPackage(pkg)}
                              className="flex items-center gap-1"
                            >
                              <Edit className="h-3 w-3" />
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeletePackage(pkg)}
                              disabled={deletePackageMutation.isPending}
                              className="flex items-center gap-1"
                            >
                              <Trash2 className="h-3 w-3" />
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {packagesData && packagesData.total > limit && (
                <div className="flex justify-between items-center mt-4">
                  <p className="text-sm text-muted-foreground">
                    Showing {(page - 1) * limit + 1} to{" "}
                    {Math.min(page * limit, packagesData.total)} of {packagesData.total} packages
                  </p>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page <= 1 || isLoading}
                      variant="outline"
                      size="sm"
                    >
                      Previous
                    </Button>
                    <Button
                      onClick={() => setPage((p) => p + 1)}
                      disabled={page * limit >= packagesData.total || isLoading}
                      variant="outline"
                      size="sm"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Package</DialogTitle>
            <DialogDescription>
              Create a new pricing package with custom content and features.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="package_name" className="text-right">
                Name *
              </Label>
              <Input
                id="package_name"
                value={packageForm.name}
                onChange={(e) => setPackageForm((prev) => ({ ...prev, name: e.target.value }))}
                className="col-span-3"
                placeholder="e.g., Starter, Professional"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="package_description" className="text-right">
                Description *
              </Label>
              <Input
                id="package_description"
                value={packageForm.description}
                onChange={(e) =>
                  setPackageForm((prev) => ({ ...prev, description: e.target.value }))
                }
                className="col-span-3"
                placeholder="e.g., Perfect for launching your first casino platform"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="package_price" className="text-right">
                Price (cents) *
              </Label>
              <Input
                id="package_price"
                type="number"
                value={packageForm.price}
                onChange={(e) =>
                  setPackageForm((prev) => ({ ...prev, price: parseInt(e.target.value) || 0 }))
                }
                className="col-span-3"
                placeholder="99900 for $999.00"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="package_currency" className="text-right">
                Currency
              </Label>
              <Select
                value={packageForm.currency}
                onValueChange={(value) =>
                  setPackageForm((prev) => ({ ...prev, currency: value }))
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={CURRENCY}>{CURRENCY}</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="package_icon" className="text-right">
                Icon
              </Label>
              <Input
                id="package_icon"
                value={packageForm.icon}
                onChange={(e) => setPackageForm((prev) => ({ ...prev, icon: e.target.value }))}
                className="col-span-3"
                placeholder="e.g., zap, star, crown"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="package_sort_order" className="text-right">
                Sort Order
              </Label>
              <Input
                id="package_sort_order"
                type="number"
                value={packageForm.sort_order}
                onChange={(e) =>
                  setPackageForm((prev) => ({ ...prev, sort_order: parseInt(e.target.value) || 0 }))
                }
                className="col-span-3"
                placeholder="0"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="package_additional_note" className="text-right">
                Additional Note
              </Label>
              <Input
                id="package_additional_note"
                value={packageForm.additional_note}
                onChange={(e) =>
                  setPackageForm((prev) => ({ ...prev, additional_note: e.target.value }))
                }
                className="col-span-3"
                placeholder="e.g., Most popular choice"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="package_button_text" className="text-right">
                Button Text *
              </Label>
              <Input
                id="package_button_text"
                value={packageForm.button_text}
                onChange={(e) =>
                  setPackageForm((prev) => ({ ...prev, button_text: e.target.value }))
                }
                className="col-span-3"
                placeholder="e.g., Get Started, Go Professional"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="package_button_variant" className="text-right">
                Button Variant
              </Label>
              <Select
                value={packageForm.button_variant}
                onValueChange={(value) =>
                  setPackageForm((prev) => ({ ...prev, button_variant: value }))
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default</SelectItem>
                  <SelectItem value="outline">Outline</SelectItem>
                  <SelectItem value="secondary">Secondary</SelectItem>
                  <SelectItem value="destructive">Destructive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Options</Label>
              <div className="col-span-3 space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_popular"
                    checked={packageForm.is_popular}
                    onChange={(e) =>
                      setPackageForm((prev) => ({ ...prev, is_popular: e.target.checked }))
                    }
                  />
                  <Label htmlFor="is_popular">Mark as Popular</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={packageForm.is_active}
                    onChange={(e) =>
                      setPackageForm((prev) => ({ ...prev, is_active: e.target.checked }))
                    }
                  />
                  <Label htmlFor="is_active">Active</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="has_theme_studio"
                    checked={packageForm.has_theme_studio}
                    onChange={(e) =>
                      setPackageForm((prev) => ({ ...prev, has_theme_studio: e.target.checked }))
                    }
                  />
                  <Label htmlFor="has_theme_studio">Has Theme Studio</Label>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Features *</Label>
              <div className="col-span-3 space-y-2">
                <div className="flex gap-2">
                  <Input
                    value={newFeature}
                    onChange={(e) => setNewFeature(e.target.value)}
                    placeholder="Add a feature..."
                    onKeyPress={(e) => e.key === "Enter" && addFeature()}
                  />
                  <Button onClick={addFeature} size="sm">
                    Add
                  </Button>
                </div>
                <div className="space-y-1">
                  {packageForm.features.map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-2 rounded"
                    >
                      <span className="text-sm">{feature}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeFeature(index)}
                        className="h-6 w-6 p-0"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => { setIsCreateDialogOpen(false); resetForm(); }} variant="outline">
              Cancel
            </Button>
            <Button
              onClick={handleCreatePackage}
              disabled={
                createPackageMutation.isPending ||
                !packageForm.name.trim() ||
                !packageForm.description.trim() ||
                packageForm.features.length === 0
              }
            >
              {createPackageMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <PackageIcon className="h-4 w-4 mr-2" />
                  Create Package
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Package</DialogTitle>
            <DialogDescription>
              Update package details and features.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit_package_name" className="text-right">
                Name *
              </Label>
              <Input
                id="edit_package_name"
                value={packageForm.name}
                onChange={(e) => setPackageForm((prev) => ({ ...prev, name: e.target.value }))}
                className="col-span-3"
                placeholder="e.g., Starter, Professional"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit_package_description" className="text-right">
                Description *
              </Label>
              <Input
                id="edit_package_description"
                value={packageForm.description}
                onChange={(e) =>
                  setPackageForm((prev) => ({ ...prev, description: e.target.value }))
                }
                className="col-span-3"
                placeholder="e.g., Perfect for launching your first casino platform"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit_package_price" className="text-right">
                Price (cents) *
              </Label>
              <Input
                id="edit_package_price"
                type="number"
                value={packageForm.price}
                onChange={(e) =>
                  setPackageForm((prev) => ({ ...prev, price: parseInt(e.target.value) || 0 }))
                }
                className="col-span-3"
                placeholder="99900 for $999.00"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit_package_currency" className="text-right">
                Currency
              </Label>
              <Select
                value={packageForm.currency}
                onValueChange={(value) =>
                  setPackageForm((prev) => ({ ...prev, currency: value }))
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={CURRENCY}>{CURRENCY}</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit_package_icon" className="text-right">
                Icon
              </Label>
              <Input
                id="edit_package_icon"
                value={packageForm.icon}
                onChange={(e) => setPackageForm((prev) => ({ ...prev, icon: e.target.value }))}
                className="col-span-3"
                placeholder="e.g., zap, star, crown"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit_package_sort_order" className="text-right">
                Sort Order
              </Label>
              <Input
                id="edit_package_sort_order"
                type="number"
                value={packageForm.sort_order}
                onChange={(e) =>
                  setPackageForm((prev) => ({ ...prev, sort_order: parseInt(e.target.value) || 0 }))
                }
                className="col-span-3"
                placeholder="0"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit_package_additional_note" className="text-right">
                Additional Note
              </Label>
              <Input
                id="edit_package_additional_note"
                value={packageForm.additional_note}
                onChange={(e) =>
                  setPackageForm((prev) => ({ ...prev, additional_note: e.target.value }))
                }
                className="col-span-3"
                placeholder="e.g., Most popular choice"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit_package_button_text" className="text-right">
                Button Text *
              </Label>
              <Input
                id="edit_package_button_text"
                value={packageForm.button_text}
                onChange={(e) =>
                  setPackageForm((prev) => ({ ...prev, button_text: e.target.value }))
                }
                className="col-span-3"
                placeholder="e.g., Get Started, Go Professional"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit_package_button_variant" className="text-right">
                Button Variant
              </Label>
              <Select
                value={packageForm.button_variant}
                onValueChange={(value) =>
                  setPackageForm((prev) => ({ ...prev, button_variant: value }))
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default</SelectItem>
                  <SelectItem value="outline">Outline</SelectItem>
                  <SelectItem value="secondary">Secondary</SelectItem>
                  <SelectItem value="destructive">Destructive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Options</Label>
              <div className="col-span-3 space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="edit_is_popular"
                    checked={packageForm.is_popular}
                    onChange={(e) =>
                      setPackageForm((prev) => ({ ...prev, is_popular: e.target.checked }))
                    }
                  />
                  <Label htmlFor="edit_is_popular">Mark as Popular</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="edit_is_active"
                    checked={packageForm.is_active}
                    onChange={(e) =>
                      setPackageForm((prev) => ({ ...prev, is_active: e.target.checked }))
                    }
                  />
                  <Label htmlFor="edit_is_active">Active</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="edit_has_theme_studio"
                    checked={packageForm.has_theme_studio}
                    onChange={(e) =>
                      setPackageForm((prev) => ({ ...prev, has_theme_studio: e.target.checked }))
                    }
                  />
                  <Label htmlFor="edit_has_theme_studio">Has Theme Studio</Label>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Features *</Label>
              <div className="col-span-3 space-y-2">
                <div className="flex gap-2">
                  <Input
                    value={newFeature}
                    onChange={(e) => setNewFeature(e.target.value)}
                    placeholder="Add a feature..."
                    onKeyPress={(e) => e.key === "Enter" && addFeature()}
                  />
                  <Button onClick={addFeature} size="sm">
                    Add
                  </Button>
                </div>
                <div className="space-y-1">
                  {packageForm.features.map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-2 rounded"
                    >
                      <span className="text-sm">{feature}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeFeature(index)}
                        className="h-6 w-6 p-0"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => {
                setIsEditDialogOpen(false);
                setEditingPackage(null);
                resetForm();
              }}
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdatePackage}
              disabled={
                updatePackageMutation.isPending ||
                !packageForm.name.trim() ||
                !packageForm.description.trim() ||
                packageForm.features.length === 0
              }
            >
              {updatePackageMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Update Package
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
