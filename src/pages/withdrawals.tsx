import { useMemo, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Search, Check, X, Loader2 } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { paymentGatewayApi, type GatewayWithdrawal } from "@/lib/paymentGatewayApi";

import { formatCurrency } from "@/lib/currency";

export default function WithdrawalsPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("pending");
  const [isProcessOpen, setIsProcessOpen] = useState(false);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<GatewayWithdrawal | null>(null);
  const [notes, setNotes] = useState("");
  const [processingAction, setProcessingAction] = useState<"approve" | "reject" | null>(null);

  const { data: withdrawals, isLoading, refetch } = useQuery<GatewayWithdrawal[]>({
    queryKey: ["payment-gateway-withdrawals", activeTab],
    queryFn: async () => {
      console.log(`Fetching withdrawals for tab: ${activeTab}`);
      return await paymentGatewayApi.fetchWithdrawals("all");
    },
  });

  const handleTabChange = (value: string) => {
    console.log(`Tab changed from ${activeTab} to ${value}`);
    setActiveTab(value);
  };

  const showLoadingShimmer = isLoading;

  const processMutation = useMutation({
    mutationFn: async ({
      id,
      action,
      reason,
    }: {
      id: string;
      action: "approve" | "reject";
      reason?: string;
    }) => {
      if (action === "approve") {
        await paymentGatewayApi.approveWithdrawal(id);
      } else {
        await paymentGatewayApi.rejectWithdrawal(id, {
          status: "rejected",
          processedBy: user?.email || "",
          notes: reason,
        });
      }
    },
    onSuccess: () => {
      refetch();
      toast({ title: "Withdrawal processed successfully" });
      setIsProcessOpen(false);
      setNotes("");
      setProcessingAction(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error processing withdrawal",
        description: error?.message || "Unknown error",
        variant: "destructive",
      });
    },
  });

  const {
    filteredWithdrawals,
    pendingWithdrawals,
    adminApprovedWithdrawals,
    callbackApprovedWithdrawals,
    failedWithdrawals,
    actualApprovedAmount,
    adminApprovedAmount,
    pendingAmount,
  } = useMemo(() => {
    const list = (withdrawals || []).filter((withdrawal) => {
      const matchesSearch =
        withdrawal.userName.toLowerCase().includes(search.toLowerCase()) ||
        withdrawal.id.toLowerCase().includes(search.toLowerCase()) ||
        withdrawal.userId.toLowerCase().includes(search.toLowerCase()) ||
        (withdrawal.userEmail && withdrawal.userEmail.toLowerCase().includes(search.toLowerCase()));
      return matchesSearch;
    });

    const pending = list.filter((w) => w.rawStatus === "pending");
    const adminApproved = list.filter((w) => w.rawStatus === "processing");
    const callbackApproved = list.filter((w) => w.rawStatus === "completed");
    const failed = list.filter((w) => w.rawStatus === "failed" || w.rawStatus === "cancelled");

    const sum = (items: GatewayWithdrawal[]) =>
      items.reduce((total, item) => total + (Number.isFinite(item.amount) ? item.amount : 0), 0);

    return {
      filteredWithdrawals: list,
      pendingWithdrawals: pending,
      adminApprovedWithdrawals: adminApproved,
      callbackApprovedWithdrawals: callbackApproved,
      failedWithdrawals: failed,
      actualApprovedAmount: sum(callbackApproved),
      adminApprovedAmount: sum(adminApproved),
      pendingAmount: sum(pending),
    };
  }, [withdrawals, search]);

  const handleProcess = (withdrawal: GatewayWithdrawal, action: "approve" | "reject") => {
    setSelectedWithdrawal(withdrawal);
    setProcessingAction(action);
    setIsProcessOpen(true);
  };

  const confirmProcess = () => {
    if (!selectedWithdrawal || !processingAction) return;

    if (processingAction === "reject" && !notes.trim()) {
      toast({
        title: "Reason required",
        description: "Please provide a reason before rejecting a withdrawal.",
        variant: "destructive",
      });
      return;
    }

    processMutation.mutate({
      id: selectedWithdrawal.id,
      action: processingAction,
      reason: notes || undefined,
    });
  };

  const renderTable = (
    data: GatewayWithdrawal[],
    opts: { showActions?: boolean } = {},
  ) => (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">User</th>
            <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Amount</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Method</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Requested</th>
            {opts.showActions && (
              <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            [...Array(5)].map((_, i) => (
              <tr key={i}>
                <td colSpan={opts.showActions ? 6 : 5} className="py-3">
                  <div className="h-12 bg-muted rounded animate-pulse" />
                </td>
              </tr>
            ))
          ) : data.length === 0 ? (
            <tr>
              <td
                colSpan={opts.showActions ? 6 : 5}
                className="text-center py-12 text-muted-foreground"
              >
                No withdrawals
              </td>
            </tr>
          ) : (
            data.map((withdrawal) => (
              <tr key={withdrawal.id} className="border-b hover-elevate" data-testid={`row-${withdrawal.id}`}>
                <td className="py-3 px-4 text-sm">
                  <div className="font-medium">{withdrawal.userId}</div>
                  {withdrawal.userName && withdrawal.userName !== withdrawal.userId && (
                    <div className="text-xs text-muted-foreground">{withdrawal.userName}</div>
                  )}
                  {withdrawal.userEmail && (
                    <div className="text-xs text-muted-foreground">{withdrawal.userEmail}</div>
                  )}
                </td>
                <td className="py-3 px-4 text-right font-mono font-semibold text-lg">
                  {formatCurrency(withdrawal.amount)}
                </td>
                <td className="py-3 px-4">
                  <Badge variant="outline">{withdrawal.method.split("_").join(" ")}</Badge>
                </td>
                <td className="py-3 px-4">
                  <StatusBadge status={withdrawal.rawStatus} className="capitalize" />
                </td>
                <td className="py-3 px-4 text-sm text-muted-foreground">
                  {new Date(withdrawal.timestamp).toLocaleString()}
                </td>
                {opts.showActions && (
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="bg-success/10 text-success hover:bg-success/20 border-success/20"
                        onClick={() => handleProcess(withdrawal, "approve")}
                        data-testid={`button-approve-${withdrawal.id}`}
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="bg-destructive/10 text-destructive hover:bg-destructive/20 border-destructive/20"
                        onClick={() => handleProcess(withdrawal, "reject")}
                        data-testid={`button-reject-${withdrawal.id}`}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Withdrawals Management</h1>
          <p className="text-muted-foreground mt-2">Process and manage withdrawal requests</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <p className="text-sm text-muted-foreground mb-2">Pending Withdrawals</p>
          <p className="text-2xl font-bold text-warning tabular-nums">
            {formatCurrency(pendingAmount)}
          </p>
          <p className="text-sm text-muted-foreground mt-1">{pendingWithdrawals.length} requests</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-muted-foreground mb-2">Admin Approved (Awaiting Gateway)</p>
          <p className="text-2xl font-bold text-muted-foreground tabular-nums">
            {formatCurrency(adminApprovedAmount)}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {adminApprovedWithdrawals.length} requests
          </p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-muted-foreground mb-2">Callback Approved</p>
          <p className="text-2xl font-bold text-success tabular-nums">
            {formatCurrency(actualApprovedAmount)}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {callbackApprovedWithdrawals.length} settled
          </p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-muted-foreground mb-2">Failed / Cancelled</p>
          <p className="text-2xl font-bold text-destructive tabular-nums">
            {formatCurrency(
              failedWithdrawals.reduce((sum, w) => sum + w.amount, 0),
            )}
          </p>
          <p className="text-sm text-muted-foreground mt-1">{failedWithdrawals.length} requests</p>
        </Card>
      </div>

      <Card className="p-6">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <TabsList>
              <TabsTrigger value="pending" data-testid="tab-pending">
                Pending ({pendingWithdrawals.length})
              </TabsTrigger>
              <TabsTrigger value="admin-approved" data-testid="tab-admin-approved">
                Admin Approved ({adminApprovedWithdrawals.length})
              </TabsTrigger>
              <TabsTrigger value="callback-approved" data-testid="tab-callback-approved">
                Callback Approved ({callbackApprovedWithdrawals.length})
              </TabsTrigger>
              <TabsTrigger value="all" data-testid="tab-all">
                All ({filteredWithdrawals.length})
              </TabsTrigger>
            </TabsList>

            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search withdrawals..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                  data-testid="input-search-withdrawals"
                />
              </div>
            </div>
          </div>

          <TabsContent value="pending" className="space-y-4">
            {renderTable(pendingWithdrawals, { showActions: true })}
          </TabsContent>

          <TabsContent value="admin-approved" className="space-y-4">
            {renderTable(adminApprovedWithdrawals)}
          </TabsContent>

          <TabsContent value="callback-approved" className="space-y-4">
            {renderTable(callbackApprovedWithdrawals)}
          </TabsContent>

          <TabsContent value="all" className="space-y-4">
            {renderTable(filteredWithdrawals)}
          </TabsContent>
        </Tabs>
      </Card>

      <Dialog open={isProcessOpen} onOpenChange={setIsProcessOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {processingAction === "approve" ? "Approve" : "Reject"} Withdrawal
            </DialogTitle>
            <DialogDescription>
              {processingAction === "approve"
                ? "Approve this withdrawal request to transfer funds to the user."
                : "Reject this withdrawal request and provide a reason."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-md space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">User:</span>
                <div className="text-right">
                  <div className="text-sm font-medium">{selectedWithdrawal?.userId}</div>
                  {selectedWithdrawal?.userName && selectedWithdrawal?.userName !== selectedWithdrawal?.userId && (
                    <div className="text-xs text-muted-foreground">{selectedWithdrawal?.userName}</div>
                  )}
                  {selectedWithdrawal?.userEmail && (
                    <div className="text-xs text-muted-foreground">{selectedWithdrawal?.userEmail}</div>
                  )}
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Amount:</span>
                <span className="text-sm font-semibold font-mono">
                  {formatCurrency(selectedWithdrawal?.amount || 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Method:</span>
                <span className="text-sm">
                  {selectedWithdrawal?.method.split("_").join(" ")}
                </span>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">
                Notes {processingAction === "reject" && "(required)"}
              </label>
              <Textarea
                placeholder={
                  processingAction === "approve"
                    ? "Add any notes about this approval (optional)"
                    : "Provide a reason for rejection"
                }
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                data-testid="textarea-notes"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsProcessOpen(false);
                setNotes("");
                setProcessingAction(null);
              }}
              disabled={processMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant={processingAction === "approve" ? "default" : "destructive"}
              onClick={confirmProcess}
              disabled={processMutation.isPending || (processingAction === "reject" && !notes)}
              data-testid="button-confirm-process"
            >
              {processMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {processingAction === "approve" ? "Approve" : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
