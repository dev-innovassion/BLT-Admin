import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Settings,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  TrendingUp,
  Coins,
  Users,
  Award,
  RefreshCw,
  ArrowLeft,
} from "lucide-react";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { backendRequest } from "@/lib/backendApi";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";

interface ReferralLevel {
  id: string;
  level: number;
  name: string;
  description: string;
  min_referrals: number;
  min_points: string;
  reward_percentage: string;
  bonus_points_multiplier: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface PointConversionRate {
  id: string;
  currency: string;
  points_per_unit: string;
  min_conversion_points: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface ReferralConfig {
  key: string;
  value: string;
  description: string;
  updated_at: string;
}

import { CURRENCY } from "@/lib/currency";

export default function ReferralConfigPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("levels");
  const [isLevelDialogOpen, setIsLevelDialogOpen] = useState(false);
  const [isRateDialogOpen, setIsRateDialogOpen] = useState(false);
  const [editingLevel, setEditingLevel] = useState<ReferralLevel | null>(null);
  const [editingRate, setEditingRate] = useState<PointConversionRate | null>(null);

  const token = localStorage.getItem("access_token") || "";
  const isAdmin = user?.role === "super_admin" || user?.role === "admin";

  const { data: levels = [], isLoading: levelsLoading, refetch: refetchLevels } = useQuery({
    queryKey: ["referralLevels", token],
    queryFn: async () => {
      const response = await backendRequest("GET", "/api/v1/referrals/config/levels", undefined, token);
      const data = await response.json();
      return data.levels as ReferralLevel[];
    },
    enabled: !!token && isAdmin,
  });

  const { data: rates = [], isLoading: ratesLoading, refetch: refetchRates } = useQuery({
    queryKey: ["conversionRates", token],
    queryFn: async () => {
      const response = await backendRequest("GET", "/api/v1/referrals/config/conversion-rates", undefined, token);
      const data = await response.json();
      return data.rates as PointConversionRate[];
    },
    enabled: !!token && isAdmin,
  });

  const { data: configs = [], isLoading: configsLoading, refetch: refetchConfigs } = useQuery({
    queryKey: ["referralConfigs", token],
    queryFn: async () => {
      const response = await backendRequest("GET", "/api/v1/referrals/config/settings", undefined, token);
      const data = await response.json();
      return data.configs as ReferralConfig[];
    },
    enabled: !!token && isAdmin,
  });

  const levelMutation = useMutation({
    mutationFn: async (data: Partial<ReferralLevel> & { level: number; name: string }) => {
      const url = editingLevel
        ? `/api/v1/referrals/config/levels/${editingLevel.id}`
        : "/api/v1/referrals/config/levels";
      const method = editingLevel ? "PUT" : "POST";
      const response = await backendRequest(method, url, data, token);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success! ✨",
        description: editingLevel ? "Level updated successfully" : "Level created successfully",
      });
      setIsLevelDialogOpen(false);
      setEditingLevel(null);
      queryClient.invalidateQueries({ queryKey: ["referralLevels"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save level",
        variant: "destructive",
      });
    },
  });

  const deleteLevelMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await backendRequest("DELETE", `/api/v1/referrals/config/levels/${id}`, undefined, token);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success! ✨",
        description: "Level deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["referralLevels"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete level",
        variant: "destructive",
      });
    },
  });

  const rateMutation = useMutation({
    mutationFn: async (data: Partial<PointConversionRate> & { currency: string; points_per_unit: string }) => {
      const response = await backendRequest("POST", "/api/v1/referrals/config/conversion-rates", data, token);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success! ✨",
        description: "Conversion rate created successfully",
      });
      setIsRateDialogOpen(false);
      setEditingRate(null);
      queryClient.invalidateQueries({ queryKey: ["conversionRates"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create conversion rate",
        variant: "destructive",
      });
    },
  });

  const configMutation = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      const response = await backendRequest("PUT", `/api/v1/referrals/config/settings/${key}`, { value }, token);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success! ✨",
        description: "Configuration updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["referralConfigs"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update configuration",
        variant: "destructive",
      });
    },
  });

  const handleCreateLevel = () => {
    setEditingLevel(null);
    setIsLevelDialogOpen(true);
  };

  const handleEditLevel = (level: ReferralLevel) => {
    setEditingLevel(level);
    setIsLevelDialogOpen(true);
  };

  const handleDeleteLevel = (id: string) => {
    if (confirm("Are you sure you want to delete this level?")) {
      deleteLevelMutation.mutate(id);
    }
  };

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-96">
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">You don't have permission to access this page.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/referrals">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Referral Structure Configuration</h1>
            <p className="text-muted-foreground mt-1">
              Manage referral levels, points, and conversion rates
            </p>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="levels">Referral Levels</TabsTrigger>
          <TabsTrigger value="conversion">Conversion Rates</TabsTrigger>
          <TabsTrigger value="settings">System Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="levels" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Referral Levels</CardTitle>
                  <CardDescription>
                    Define referral levels with requirements and rewards
                  </CardDescription>
                </div>
                <Button onClick={handleCreateLevel}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Level
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {levelsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Level</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Min Referrals</TableHead>
                      <TableHead>Min Points</TableHead>
                      <TableHead>Reward %</TableHead>
                      <TableHead>Points Multiplier</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {levels.map((level) => (
                      <TableRow key={level.id}>
                        <TableCell className="font-bold">Level {level.level}</TableCell>
                        <TableCell>{level.name}</TableCell>
                        <TableCell>{level.min_referrals}</TableCell>
                        <TableCell>{parseFloat(level.min_points).toLocaleString()}</TableCell>
                        <TableCell>{parseFloat(level.reward_percentage).toFixed(2)}%</TableCell>
                        <TableCell>{parseFloat(level.bonus_points_multiplier).toFixed(2)}x</TableCell>
                        <TableCell>
                          <Badge variant={level.is_active ? "default" : "secondary"}>
                            {level.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditLevel(level)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteLevel(level.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="conversion" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Point Conversion Rates</CardTitle>
                  <CardDescription>
                    Configure how points convert to balance
                  </CardDescription>
                </div>
                <Button onClick={() => setIsRateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Rate
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {ratesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Currency</TableHead>
                      <TableHead>Points per Unit</TableHead>
                      <TableHead>Min Conversion</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rates.map((rate) => (
                      <TableRow key={rate.id}>
                        <TableCell className="font-medium">{rate.currency}</TableCell>
                        <TableCell>{parseFloat(rate.points_per_unit).toLocaleString()} points</TableCell>
                        <TableCell>{parseFloat(rate.min_conversion_points).toLocaleString()} points</TableCell>
                        <TableCell>
                          <Badge variant={rate.is_active ? "default" : "secondary"}>
                            {rate.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Configuration</CardTitle>
              <CardDescription>
                Configure referral system settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              {configsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="space-y-4">
                  {configs.map((config) => (
                    <div key={config.key} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <Label className="font-medium">{config.key.replace(/_/g, " ").toUpperCase()}</Label>
                        <p className="text-sm text-muted-foreground">{config.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Input
                          type="text"
                          defaultValue={config.value}
                          onBlur={(e) => {
                            if (e.target.value !== config.value) {
                              configMutation.mutate({ key: config.key, value: e.target.value });
                            }
                          }}
                          className="w-32"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isLevelDialogOpen} onOpenChange={setIsLevelDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingLevel ? "Edit Referral Level" : "Create Referral Level"}</DialogTitle>
            <DialogDescription>
              Configure referral level requirements and rewards
            </DialogDescription>
          </DialogHeader>
          <LevelForm
            level={editingLevel}
            onSubmit={(data) => levelMutation.mutate(data)}
            onCancel={() => {
              setIsLevelDialogOpen(false);
              setEditingLevel(null);
            }}
            isLoading={levelMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isRateDialogOpen} onOpenChange={setIsRateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Conversion Rate</DialogTitle>
            <DialogDescription>
              Set up point to balance conversion rate
            </DialogDescription>
          </DialogHeader>
          <RateForm
            onSubmit={(data) => rateMutation.mutate(data)}
            onCancel={() => {
              setIsRateDialogOpen(false);
              setEditingRate(null);
            }}
            isLoading={rateMutation.isPending}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function LevelForm({
  level,
  onSubmit,
  onCancel,
  isLoading,
}: {
  level?: ReferralLevel | null;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState({
    level: level?.level || 1,
    name: level?.name || "",
    description: level?.description || "",
    min_referrals: level?.min_referrals || 0,
    min_points: level?.min_points || "0",
    reward_percentage: level?.reward_percentage || "0",
    bonus_points_multiplier: level?.bonus_points_multiplier || "1.0",
    is_active: level?.is_active ?? true,
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(formData);
      }}
      className="space-y-4"
    >
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="level">Level Number</Label>
          <Input
            id="level"
            type="number"
            value={formData.level}
            onChange={(e) => setFormData({ ...formData, level: parseInt(e.target.value) })}
            required
          />
        </div>
        <div>
          <Label htmlFor="name">Level Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="min_referrals">Min Referrals</Label>
          <Input
            id="min_referrals"
            type="number"
            value={formData.min_referrals}
            onChange={(e) => setFormData({ ...formData, min_referrals: parseInt(e.target.value) })}
          />
        </div>
        <div>
          <Label htmlFor="min_points">Min Points</Label>
          <Input
            id="min_points"
            type="number"
            value={formData.min_points}
            onChange={(e) => setFormData({ ...formData, min_points: e.target.value })}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="reward_percentage">Reward Percentage</Label>
          <Input
            id="reward_percentage"
            type="number"
            step="0.01"
            value={formData.reward_percentage}
            onChange={(e) => setFormData({ ...formData, reward_percentage: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="bonus_points_multiplier">Points Multiplier</Label>
          <Input
            id="bonus_points_multiplier"
            type="number"
            step="0.1"
            value={formData.bonus_points_multiplier}
            onChange={(e) => setFormData({ ...formData, bonus_points_multiplier: e.target.value })}
          />
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Switch
            id="is_active"
            checked={formData.is_active}
            onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
          />
          <Label htmlFor="is_active">Active</Label>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}

function RateForm({
  onSubmit,
  onCancel,
  isLoading,
}: {
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState({
    currency: CURRENCY,
    points_per_unit: "100",
    min_conversion_points: "1000",
    is_active: true,
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(formData);
      }}
      className="space-y-4"
    >
      <div>
        <Label htmlFor="currency">Currency</Label>
        <Input
          id="currency"
          value={formData.currency}
          onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
          required
        />
      </div>
      <div>
        <Label htmlFor="points_per_unit">Points per Unit</Label>
        <Input
          id="points_per_unit"
          type="number"
          value={formData.points_per_unit}
          onChange={(e) => setFormData({ ...formData, points_per_unit: e.target.value })}
          required
        />
        <p className="text-sm text-muted-foreground mt-1">
          How many points equal 1 unit of currency
        </p>
      </div>
      <div>
        <Label htmlFor="min_conversion_points">Minimum Conversion Points</Label>
        <Input
          id="min_conversion_points"
          type="number"
          value={formData.min_conversion_points}
          onChange={(e) => setFormData({ ...formData, min_conversion_points: e.target.value })}
        />
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Switch
            id="is_active"
            checked={formData.is_active}
            onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
          />
          <Label htmlFor="is_active">Active</Label>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Create
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}

