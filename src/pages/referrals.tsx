import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTabRefetch } from "@/hooks/useTabRefetch";
import {
  Users,
  Gift,
  Copy,
  Check,
  Settings,
  Award,
  UserPlus,
  DollarSign,
  Activity,
  RefreshCw,
  Share2,
  Coins,
  Star,
  Link as LinkIcon,
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
import { backendReferralApi, type ReferralCode, type Referral, type ReferralReward, type ReferralDashboard } from "@/lib/backendReferralApi";
import { StatCard } from "@/components/stat-card";

import { CURRENCY, formatCurrency } from "@/lib/currency";

export default function ReferralsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsForm, setSettingsForm] = useState<{ is_active: boolean; max_uses?: number }>({
    is_active: true,
    max_uses: undefined,
  });
  const [page, setPage] = useState(1);
  const [rewardsPage, setRewardsPage] = useState(1);

  const { activeTab, handleTabChange } = useTabRefetch("dashboard", [
    "referralDashboard",
    "referrals",
    "referralRewards"
  ]);

  const token = localStorage.getItem("access_token") || "";

  const { data: referralCode, isLoading: codeLoading, refetch: refetchCode } = useQuery({
    queryKey: ["referralCode", token],
    queryFn: async () => {
      if (!token) return null;
      return await backendReferralApi.getReferralCode(token);
    },
    enabled: !!token,
  });

  const { data: dashboard, isLoading: dashboardLoading } = useQuery({
    queryKey: ["referralDashboard", token],
    queryFn: async () => {
      if (!token) return null;
      return await backendReferralApi.getReferralDashboard(token);
    },
    enabled: !!token && activeTab === "dashboard",
  });

  const { data: referralsData, isLoading: referralsLoading } = useQuery({
    queryKey: ["referrals", page, token],
    queryFn: async () => {
      if (!token) return null;
      return await backendReferralApi.getReferrals({ page, limit: 20 }, token);
    },
    enabled: !!token && activeTab === "referrals",
  });

  const { data: rewardsData, isLoading: rewardsLoading } = useQuery({
    queryKey: ["referralRewards", rewardsPage, token],
    queryFn: async () => {
      if (!token) return null;
      return await backendReferralApi.getReferralRewards({ page: rewardsPage, limit: 20 }, token);
    },
    enabled: !!token && activeTab === "rewards",
  });

  const createCodeMutation = useMutation({
    mutationFn: async (data: { code?: string; max_uses?: number }) => {
      return await backendReferralApi.createReferralCode(data, token);
    },
    onSuccess: () => {
      toast({
        title: "Success! ✨",
        description: "Referral code created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["referralCode"] });
      setIsSettingsOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create referral code",
        variant: "destructive",
      });
    },
  });

  const updateCodeMutation = useMutation({
    mutationFn: async (data: { is_active?: boolean; max_uses?: number }) => {
      if (!referralCode) throw new Error("No referral code found");
      return await backendReferralApi.updateReferralCode(referralCode.id, data, token);
    },
    onSuccess: () => {
      toast({
        title: "Success! ✨",
        description: "Referral code updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["referralCode"] });
      setIsSettingsOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update referral code",
        variant: "destructive",
      });
    },
  });

  const handleCopyCode = () => {
    if (referralCode?.code) {
      navigator.clipboard.writeText(referralCode.code);
      setCopiedCode(true);
      toast({
        title: "Copied!",
        description: "Referral code copied to clipboard",
      });
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleShareCode = () => {
    if (referralCode?.code) {
      const shareText = `Join using my referral code: ${referralCode.code}`;
      if (navigator.share) {
        navigator.share({
          title: "Referral Code",
          text: shareText,
        });
      } else {
        navigator.clipboard.writeText(shareText);
        toast({
          title: "Copied!",
          description: "Referral message copied to clipboard",
        });
      }
    }
  };

  const getReferralUrl = () => {
    if (!referralCode?.code) return "";
    const platformCode = user?.assigned_platform_code;
    if (!platformCode) return `?ref=${referralCode.code}`;
    return `https://${platformCode}.com/?ref=${referralCode.code}`;
  };

  const handleCopyUrl = () => {
    const url = getReferralUrl();
    if (url) {
      navigator.clipboard.writeText(url);
      setCopiedUrl(true);
      toast({ title: "Copied!", description: "Referral URL copied to clipboard" });
      setTimeout(() => setCopiedUrl(false), 2000);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      active: "default",
      pending: "secondary",
      completed: "default",
      paid: "default",
      cancelled: "destructive",
    };
    return (
      <Badge variant={variants[status] || "outline"}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (codeLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Referral System</h1>
          <p className="text-muted-foreground mt-1">
            Manage your referral codes and track your referrals
          </p>
        </div>
        <div className="flex gap-2">
          {(user?.role === "super_admin" || user?.role === "admin") && (
            <Link href="/referrals/config">
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Configure Structure
              </Button>
            </Link>
          )}
          {referralCode && (
            <Dialog open={isSettingsOpen} onOpenChange={(open) => {
                setIsSettingsOpen(open);
                if (open && referralCode) {
                  setSettingsForm({
                    is_active: referralCode.is_active,
                    max_uses: referralCode.max_uses ?? undefined,
                  });
                }
              }}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Settings className="h-4 w-4 mr-2" />
                  Code Settings
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Referral Code Settings</DialogTitle>
                  <DialogDescription>
                    Update your referral code settings
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="active">Active</Label>
                    <Switch
                      id="active"
                      checked={settingsForm.is_active}
                      onCheckedChange={(checked) =>
                        setSettingsForm((f) => ({ ...f, is_active: checked }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxUses">Max Uses (leave empty for unlimited)</Label>
                    <Input
                      id="maxUses"
                      type="number"
                      placeholder="Unlimited"
                      value={settingsForm.max_uses ?? ""}
                      onChange={(e) =>
                        setSettingsForm((f) => ({
                          ...f,
                          max_uses: e.target.value ? parseInt(e.target.value) : undefined,
                        }))
                      }
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" onClick={() => setIsSettingsOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={() => updateCodeMutation.mutate(settingsForm)}
                    disabled={updateCodeMutation.isPending}
                  >
                    {updateCodeMutation.isPending ? "Saving…" : "Update"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {referralCode ? (
        <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5" />
              Your Referral Code
            </CardTitle>
            <CardDescription>
              Share this code with others to earn rewards
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <code className="text-3xl font-bold tracking-wider bg-background px-4 py-2 rounded-md border">
                    {referralCode.code}
                  </code>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleCopyCode}
                    className="h-10 w-10"
                  >
                    {copiedCode ? (
                      <Check className="h-5 w-5 text-green-500" />
                    ) : (
                      <Copy className="h-5 w-5" />
                    )}
                  </Button>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <UserPlus className="h-4 w-4" />
                    {referralCode.total_uses} uses
                  </span>
                  {referralCode.max_uses && (
                    <span>Max: {referralCode.max_uses}</span>
                  )}
                  {referralCode.expires_at && (
                    <span>Expires: {formatDate(referralCode.expires_at)}</span>
                  )}
                </div>
              </div>
              <Button onClick={handleShareCode} className="gap-2">
                <Share2 className="h-4 w-4" />
                Share
              </Button>
            </div>
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm font-medium mb-2 flex items-center gap-1.5">
                <LinkIcon className="h-4 w-4" />
                Referral Signup URL
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-xs bg-muted px-3 py-2 rounded border truncate">
                  {getReferralUrl()}
                </code>
                <Button variant="outline" size="sm" onClick={handleCopyUrl} className="gap-1.5 shrink-0">
                  {copiedUrl ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                  {copiedUrl ? "Copied" : "Copy URL"}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1.5">
                Share this URL — when someone signs up through it, they'll be linked to your account automatically.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Create Your Referral Code</CardTitle>
            <CardDescription>
              Generate a unique referral code to start earning rewards
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => createCodeMutation.mutate({})}
              disabled={createCodeMutation.isPending}
            >
              {createCodeMutation.isPending ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Gift className="h-4 w-4 mr-2" />
                  Create Referral Code
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="referrals">Referrals</TabsTrigger>
          <TabsTrigger value="rewards">Rewards</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          {dashboardLoading ? (
            <div className="flex items-center justify-center h-64">
              <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : dashboard ? (
            <>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                  title="Total Referrals"
                  value={dashboard.total_referrals.toString()}
                  icon={Users}
                  description="All time referrals"
                />
                <StatCard
                  title="Active Referrals"
                  value={dashboard.active_referrals.toString()}
                  icon={Activity}
                  description="Currently active"
                />
                <StatCard
                  title="Total Rewards"
                  value={formatCurrency(parseFloat(dashboard.total_rewards || "0"))}
                  icon={DollarSign}
                  description="All time earnings"
                />
                <StatCard
                  title="Pending Rewards"
                  value={formatCurrency(parseFloat(dashboard.pending_rewards || "0"))}
                  icon={Award}
                  description="Awaiting payment"
                />
              </div>

              {(dashboard.points || dashboard.current_level) && (
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Coins className="h-5 w-5" />
                        Your Points
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">
                        {parseFloat(dashboard.points || "0").toLocaleString()}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Total points earned from referrals
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Star className="h-5 w-5" />
                        Current Level
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">
                        {dashboard.level_name || `Level ${dashboard.current_level || 1}`}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Your referral level status
                      </p>
                    </CardContent>
                  </Card>
                </div>
              )}

              <Card>
                <CardHeader>
                  <CardTitle>Recent Referrals</CardTitle>
                  <CardDescription>
                    Your most recent referral activity
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {dashboard.recent_referrals.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No referrals yet. Start sharing your code!
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Referred User</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Reward Status</TableHead>
                          <TableHead>Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {dashboard.recent_referrals.map((referral) => (
                          <TableRow key={referral.id}>
                            <TableCell className="font-medium">
                              {referral.referred_name || referral.referred_id}
                            </TableCell>
                            <TableCell>{getStatusBadge(referral.status)}</TableCell>
                            <TableCell>{getStatusBadge(referral.reward_status)}</TableCell>
                            <TableCell>{formatDate(referral.created_at)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </>
          ) : null}
        </TabsContent>

        <TabsContent value="referrals" className="space-y-4">
          {referralsLoading ? (
            <div className="flex items-center justify-center h-64">
              <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : referralsData ? (
            <Card>
              <CardHeader>
                <CardTitle>All Referrals</CardTitle>
                <CardDescription>
                  Complete list of your referrals
                </CardDescription>
              </CardHeader>
              <CardContent>
                {referralsData.referrals.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No referrals yet. Start sharing your code!
                  </div>
                ) : (
                  <>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Referred User</TableHead>
                          <TableHead>Level</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Reward</TableHead>
                          <TableHead>Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {referralsData.referrals.map((referral) => (
                          <TableRow key={referral.id}>
                            <TableCell className="font-medium">
                              {referral.referred_name || referral.referred_id}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">Level {referral.level}</Badge>
                            </TableCell>
                            <TableCell>{getStatusBadge(referral.status)}</TableCell>
                            <TableCell>
                              {formatCurrency(parseFloat(referral.reward_amount || "0"), {
                                currency: referral.reward_currency || CURRENCY,
                              })}
                            </TableCell>
                            <TableCell>{formatDate(referral.created_at)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    <div className="flex items-center justify-between mt-4">
                      <div className="text-sm text-muted-foreground">
                        Page {page} of {referralsData.pagination.total_pages} (
                        {referralsData.pagination.total} total)
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPage((p) => Math.max(1, p - 1))}
                          disabled={page === 1}
                        >
                          Previous
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPage((p) => p + 1)}
                          disabled={page >= referralsData.pagination.total_pages}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          ) : null}
        </TabsContent>

        <TabsContent value="rewards" className="space-y-4">
          {rewardsLoading ? (
            <div className="flex items-center justify-center h-64">
              <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : rewardsData ? (
            <Card>
              <CardHeader>
                <CardTitle>Referral Rewards</CardTitle>
                <CardDescription>
                  Track your referral rewards and earnings
                </CardDescription>
              </CardHeader>
              <CardContent>
                {rewardsData.rewards.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No rewards yet. Keep referring to earn!
                  </div>
                ) : (
                  <>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Type</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {rewardsData.rewards.map((reward) => (
                          <TableRow key={reward.id}>
                            <TableCell className="font-medium capitalize">
                              {reward.reward_type.replace("_", " ")}
                            </TableCell>
                            <TableCell>
                              {formatCurrency(parseFloat(reward.amount || "0"), {
                                currency: reward.currency || CURRENCY,
                              })}
                            </TableCell>
                            <TableCell>{getStatusBadge(reward.status)}</TableCell>
                            <TableCell>{formatDate(reward.created_at)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    <div className="flex items-center justify-between mt-4">
                      <div className="text-sm text-muted-foreground">
                        Page {rewardsPage} of {rewardsData.pagination.total_pages} (
                        {rewardsData.pagination.total} total)
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setRewardsPage((p) => Math.max(1, p - 1))}
                          disabled={rewardsPage === 1}
                        >
                          Previous
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setRewardsPage((p) => p + 1)}
                          disabled={rewardsPage >= rewardsData.pagination.total_pages}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          ) : null}
        </TabsContent>
      </Tabs>
    </div>
  );
}


