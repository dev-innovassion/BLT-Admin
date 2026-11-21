import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/status-badge";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { paymentGatewayApi, type GatewayDeposit } from "@/lib/paymentGatewayApi";

import { formatCurrency } from "@/lib/currency";

export default function DepositsPage() {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const { data: deposits, isLoading, refetch } = useQuery<GatewayDeposit[]>({
    queryKey: ["payment-gateway-deposits", activeTab],
    queryFn: async () => {
      console.log(`Fetching deposits for tab: ${activeTab}`);
      return await paymentGatewayApi.fetchDeposits("all");
    },
  });

  const handleTabChange = (value: string) => {
    console.log(`Tab changed from ${activeTab} to ${value}`);
    setActiveTab(value);
  };

  const showLoadingShimmer = isLoading;

  const {
    filteredDeposits,
    pendingDeposits,
    confirmedDeposits,
    failedDeposits,
    totalPending,
    totalConfirmed,
    totalFailed,
  } = useMemo(() => {
    const list = (deposits || []).filter((deposit) => {
      const matchesSearch =
        deposit.userName.toLowerCase().includes(search.toLowerCase()) ||
        deposit.id.toLowerCase().includes(search.toLowerCase()) ||
        deposit.userId.toLowerCase().includes(search.toLowerCase()) ||
        (deposit.userEmail && deposit.userEmail.toLowerCase().includes(search.toLowerCase()));
      return matchesSearch;
    });

    const pending = list.filter((d) => d.rawStatus === "pending" || d.rawStatus === "processing");
    const confirmed = list.filter((d) => d.rawStatus === "completed");
    const failed = list.filter((d) => d.rawStatus === "failed" || d.rawStatus === "cancelled");

    const sum = (items: GatewayDeposit[]) =>
      items.reduce((total, item) => total + (Number.isFinite(item.amount) ? item.amount : 0), 0);

    return {
      filteredDeposits: list,
      pendingDeposits: pending,
      confirmedDeposits: confirmed,
      failedDeposits: failed,
      totalPending: sum(pending),
      totalConfirmed: sum(confirmed),
      totalFailed: sum(failed),
    };
  }, [deposits, search]);

  const renderTable = (depositsList: GatewayDeposit[]) => (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">User</th>
            <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Amount</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Method</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Requested</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Processed By</th>
          </tr>
        </thead>
        <tbody>
          {showLoadingShimmer ? (
            [...Array(5)].map((_, i) => (
              <tr key={i}>
                <td colSpan={6} className="py-3">
                  <div className="h-12 bg-muted rounded animate-pulse" />
                </td>
              </tr>
            ))
          ) : depositsList.length === 0 ? (
            <tr>
              <td colSpan={6} className="text-center py-12 text-muted-foreground">
                No deposits found
              </td>
            </tr>
          ) : (
            depositsList.map((deposit) => (
              <tr
                key={deposit.id}
                className="border-b hover-elevate"
                data-testid={`row-deposit-${deposit.id}`}
              >
                <td className="py-3 px-4 text-sm">
                  <div className="font-medium">{deposit.userId}</div>
                  {deposit.userName && deposit.userName !== deposit.userId && (
                    <div className="text-xs text-muted-foreground">{deposit.userName}</div>
                  )}
                  {deposit.userEmail && (
                    <div className="text-xs text-muted-foreground">{deposit.userEmail}</div>
                  )}
                </td>
                <td className="py-3 px-4 text-right font-mono font-semibold">
                  {formatCurrency(deposit.amount)}
                </td>
                <td className="py-3 px-4">
                  <Badge variant="outline">{deposit.method.split("_").join(" ")}</Badge>
                </td>
                <td className="py-3 px-4">
                  <StatusBadge status={deposit.rawStatus} />
                </td>
                <td className="py-3 px-4 text-sm text-muted-foreground">
                  {new Date(deposit.timestamp).toLocaleString()}
                </td>
                <td className="py-3 px-4 text-sm text-muted-foreground">
                  {deposit.processedBy || "-"}
                </td>
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
          <h1 className="text-3xl font-bold">Deposits Management</h1>
          <p className="text-muted-foreground mt-2">
            View payment gateway deposits, including actual credited amounts (callback-approved)
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <p className="text-sm text-muted-foreground mb-2">Pending Deposits</p>
          <p className="text-2xl font-bold text-warning tabular-nums">
            {formatCurrency(totalPending)}
          </p>
          <p className="text-sm text-muted-foreground mt-1">{pendingDeposits.length} requests</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-muted-foreground mb-2">Confirmed (Callback Approved)</p>
          <p className="text-2xl font-bold text-success tabular-nums">
            {formatCurrency(totalConfirmed)}
          </p>
          <p className="text-sm text-muted-foreground mt-1">{confirmedDeposits.length} credited</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-muted-foreground mb-2">Rejected Deposits</p>
          <p className="text-2xl font-bold text-destructive tabular-nums">
            {formatCurrency(totalFailed)}
          </p>
          <p className="text-sm text-muted-foreground mt-1">{failedDeposits.length} failed</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-muted-foreground mb-2">Total Deposits (All States)</p>
          <p className="text-2xl font-bold text-foreground tabular-nums">
            {formatCurrency(totalPending + totalConfirmed + totalFailed)}
          </p>
          <p className="text-sm text-muted-foreground mt-1">{filteredDeposits.length} total</p>
        </Card>
      </div>

      <Card className="p-6">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div className="flex items-center gap-4">
              <TabsList>
                <TabsTrigger value="all" data-testid="tab-all">
                  All ({filteredDeposits.length})
                </TabsTrigger>
                <TabsTrigger value="pending" data-testid="tab-pending">
                  Pending ({pendingDeposits.length})
                </TabsTrigger>
                <TabsTrigger value="confirmed" data-testid="tab-confirmed">
                  Confirmed ({confirmedDeposits.length})
                </TabsTrigger>
                <TabsTrigger value="failed" data-testid="tab-failed">
                  Failed / Cancelled ({failedDeposits.length})
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 sm:flex-initial sm:w-64 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search deposits..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
                data-testid="input-search-deposits"
              />
            </div>
          </div>

          <TabsContent value="all">
            {renderTable(filteredDeposits)}
          </TabsContent>

          <TabsContent value="pending">
            {renderTable(pendingDeposits)}
          </TabsContent>

          <TabsContent value="confirmed">
            {renderTable(confirmedDeposits)}
          </TabsContent>

          <TabsContent value="failed">
            {renderTable(failedDeposits)}
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
