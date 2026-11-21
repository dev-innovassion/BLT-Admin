import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Edit, Trash2, MoreHorizontal } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const bonusSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  type: z.enum(["OnEveryDeposit", "FirstDeposit", "SignUp", "FirstBet"]),
  value_type: z.enum(["percentage", "amount"]),
  value: z.number().positive("Value must be positive"),
  status: z.enum(["active", "inactive"]).optional(),
});

type BonusFormData = z.infer<typeof bonusSchema>;

interface Bonus {
  id: string;
  name: string;
  type: string;
  value_type: string;
  value: number;
  status: string;
  platform_code: string;
  created_at: string;
  updated_at: string;
}

export default function BonusesPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedBonus, setSelectedBonus] = useState<Bonus | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<BonusFormData>({
    resolver: zodResolver(bonusSchema),
    defaultValues: {
      name: "",
      type: "SignUp",
      value_type: "amount",
      value: 0,
      status: "active",
    },
  });

  const { data: bonuses, isLoading } = useQuery<Bonus[]>({
    queryKey: ["bonuses"],
    queryFn: async () => {
      const token = localStorage.getItem("access_token");
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/v1/admin/bonuses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch bonuses");
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: BonusFormData) => {
      const token = localStorage.getItem("access_token");
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/v1/admin/bonuses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create bonus");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bonuses"] });
      setIsCreateOpen(false);
      form.reset();
      toast({ title: "Success", description: "Bonus created successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<BonusFormData> }) => {
      const token = localStorage.getItem("access_token");
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/v1/admin/bonuses/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update bonus");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bonuses"] });
      setIsEditOpen(false);
      setSelectedBonus(null);
      form.reset();
      toast({ title: "Success", description: "Bonus updated successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const token = localStorage.getItem("access_token");
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/v1/admin/bonuses/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bonuses"] });
      toast({ title: "Success", description: "Status updated successfully" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const token = localStorage.getItem("access_token");
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/v1/admin/bonuses/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete bonus");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bonuses"] });
      toast({ title: "Success", description: "Bonus deleted successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const handleCreate = (data: BonusFormData) => {
    createMutation.mutate(data);
  };

  const handleEdit = (bonus: Bonus) => {
    setSelectedBonus(bonus);
    form.reset({
      name: bonus.name,
      type: bonus.type as any,
      value_type: bonus.value_type as any,
      value: bonus.value,
      status: bonus.status as any,
    });
    setIsEditOpen(true);
  };

  const handleUpdate = (data: BonusFormData) => {
    if (selectedBonus) {
      updateMutation.mutate({ id: selectedBonus.id, data });
    }
  };

  const handleToggleStatus = (bonus: Bonus) => {
    const newStatus = bonus.status === "active" ? "inactive" : "active";
    updateStatusMutation.mutate({ id: bonus.id, status: newStatus });
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this bonus?")) {
      deleteMutation.mutate(id);
    }
  };

  const getBonusTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      OnEveryDeposit: "On Every Deposit",
      FirstDeposit: "First Deposit",
      SignUp: "Sign Up",
      FirstBet: "First Bet",
    };
    return labels[type] || type;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Bonuses</h1>
          <p className="text-muted-foreground mt-2">Manage promotional bonuses and rewards</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Bonus
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="p-6 animate-pulse">
              <div className="h-6 bg-muted rounded w-3/4 mb-4" />
              <div className="h-4 bg-muted rounded w-1/2" />
            </Card>
          ))}
        </div>
      ) : bonuses && bonuses.length === 0 ? (
        <Card className="p-12">
          <div className="flex flex-col items-center justify-center text-center space-y-4">
            <div className="rounded-full bg-primary/10 p-6">
              <Plus className="h-12 w-12 text-primary" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">No bonuses yet</h3>
              <p className="text-muted-foreground max-w-sm">
                Get started by creating your first bonus to reward your users
              </p>
            </div>
            <Button onClick={() => setIsCreateOpen(true)} size="lg">
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Bonus
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bonuses?.map((bonus) => (
            <Card key={bonus.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{bonus.name}</h3>
                  <p className="text-sm text-muted-foreground">{getBonusTypeLabel(bonus.type)}</p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleEdit(bonus)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDelete(bonus.id)} className="text-destructive">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Value:</span>
                  <span className="font-semibold">
                    {bonus.value_type === "percentage" ? `${bonus.value}%` : `$${bonus.value}`}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{bonus.status === "active" ? "Active" : "Inactive"}</span>
                    <Switch
                      checked={bonus.status === "active"}
                      onCheckedChange={() => handleToggleStatus(bonus)}
                    />
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Bonus</DialogTitle>
            <DialogDescription>Add a new bonus to your platform</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleCreate)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Welcome Bonus" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

                      <FormField
                        control={form.control}
                        name="type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="SignUp">Sign Up</SelectItem>
                                <SelectItem value="FirstDeposit" disabled>First Deposit (Coming Soon)</SelectItem>
                                <SelectItem value="OnEveryDeposit" disabled>On Every Deposit (Coming Soon)</SelectItem>
                                <SelectItem value="FirstBet" disabled>First Bet (Coming Soon)</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

              <FormField
                control={form.control}
                name="value_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Value Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="amount">Fixed Amount</SelectItem>
                        <SelectItem value="percentage" disabled>Percentage (Not supported for SignUp bonus)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Value</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="100"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Creating..." : "Create"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Bonus</DialogTitle>
            <DialogDescription>Update bonus details</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleUpdate)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Welcome Bonus" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="SignUp">Sign Up</SelectItem>
                        <SelectItem value="FirstDeposit" disabled>First Deposit (Coming Soon)</SelectItem>
                        <SelectItem value="OnEveryDeposit" disabled>On Every Deposit (Coming Soon)</SelectItem>
                        <SelectItem value="FirstBet" disabled>First Bet (Coming Soon)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="value_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Value Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="amount">Fixed Amount</SelectItem>
                        <SelectItem value="percentage" disabled>Percentage (Not supported for SignUp bonus)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Value</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="100"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? "Updating..." : "Update"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
