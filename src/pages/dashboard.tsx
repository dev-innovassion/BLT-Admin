import { useQuery } from "@tanstack/react-query";
import {
  Users,
  Gamepad2,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Activity,
  UserCheck,
  Shield,
  Briefcase,
  UserCog,
} from "lucide-react";
import { StatCard } from "@/components/stat-card";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import { useAuth } from "@/contexts/AuthContext";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { DashboardStats, DailyStats, TopGameStats, Withdrawal, GameTransaction } from "@shared/schema";
import { formatCurrency as formatCurrencyValue } from "@/lib/currency";

const CHART_COLORS = {
  primary: "hsl(var(--chart-1))",
  secondary: "hsl(var(--chart-2))",
  tertiary: "hsl(var(--chart-3))",
  quaternary: "hsl(var(--chart-4))",
  quinary: "hsl(var(--chart-5))",
};

export default function DashboardPage() {
  const { user } = useAuth();
  const isOperatorOrAgent = user?.role === "operator" || user?.role === "agent";

  const { data: stats, isLoading: statsLoading, error: statsError } = useQuery<DashboardStats>({
    queryKey: ["/api/v1/admin/dashboard/stats"],
    queryFn: async () => {
      const token = localStorage.getItem("access_token");
      if (!token) throw new Error("Not authenticated");
      console.log('Fetching dashboard stats with token:', token ? 'exists' : 'missing');
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/v1/admin/dashboard/stats`, {
        headers: { "Authorization": `Bearer ${token}` },
      });
      console.log('Dashboard stats response status:', res.status);
      if (!res.ok) {
        const errorText = await res.text();
        console.error('Dashboard stats error:', errorText);
        throw new Error("Failed to fetch dashboard stats");
      }
      const data = await res.json();
      console.log('Dashboard stats data:', data);
      return data;
    },
  });

  const { data: dailyStats, isLoading: dailyLoading } = useQuery<DailyStats[]>({
    queryKey: ["/api/v1/admin/dashboard/daily-stats"],
    queryFn: async () => {
      const token = localStorage.getItem("access_token");
      if (!token) throw new Error("Not authenticated");
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/v1/admin/dashboard/daily-stats`, {
        headers: { "Authorization": `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch daily stats");
      return res.json();
    },
  });

  const { data: topGames, isLoading: gamesLoading } = useQuery<TopGameStats[]>({
    queryKey: ["/api/v1/admin/dashboard/top-games"],
    queryFn: async () => {
      const token = localStorage.getItem("access_token");
      if (!token) throw new Error("Not authenticated");
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/v1/admin/dashboard/top-games`, {
        headers: { "Authorization": `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch top games");
      return res.json();
    },
  });

  const { data: recentWithdrawals, isLoading: withdrawalsLoading } = useQuery({
    queryKey: ["/api/admin/dashboard/recent-withdrawals"],
    queryFn: async () => {
      const token = localStorage.getItem("access_token");
      if (!token) throw new Error("Not authenticated");
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/v1/admin/dashboard/recent-withdrawals?limit=10`, {
        headers: { "Authorization": `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch recent withdrawals");
      return res.json();
    },
  });

  const { data: recentTransactions, isLoading: transactionsLoading } = useQuery({
    queryKey: ["/api/admin/dashboard/recent-transactions"],
    queryFn: async () => {
      const token = localStorage.getItem("access_token");
      if (!token) throw new Error("Not authenticated");
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/v1/admin/dashboard/recent-transactions?limit=10`, {
        headers: { "Authorization": `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch recent transactions");
      return res.json();
    },
  });

  const formatCurrency = (value: number) =>
    formatCurrencyValue(value, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat("en-US").format(value);
  };

  const showLoadingShimmer = statsLoading && !stats;

  if (showLoadingShimmer) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-pulse space-y-6 w-full max-w-7xl p-8">
          <div className="h-8 bg-muted rounded w-48" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded-md" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (statsError) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-destructive">Session Expired</h2>
          <p className="text-muted-foreground">
            For security reasons, your session has timed out due to inactivity.
          </p>
          <p className="text-sm text-muted-foreground">Please log in again to continue.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        </div>
        <p className="text-muted-foreground mt-2">
          Overview of platform performance and key metrics
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={formatNumber(stats?.totalUsers || 0)}
          icon={Users}
          iconClassName="bg-primary/10 text-primary"
          testId="stat-total-users"
        />
        {isOperatorOrAgent ? (
          <StatCard
            title="Total Agents"
            value={formatNumber(stats?.agentCount || 0)}
            icon={UserCog}
            iconClassName="bg-chart-4/10 text-chart-4"
            testId="stat-total-agents"
          />
        ) : (
          <StatCard
            title="Games Played"
            value={formatNumber(stats?.totalGamesPlayed || 0)}
            icon={Gamepad2}
            iconClassName="bg-chart-2/10 text-chart-2"
            testId="stat-games-played"
          />
        )}
        <StatCard
          title="Total Deposits"
          value={formatCurrency(stats?.totalDeposits || 0)}
          icon={TrendingUp}
          iconClassName="bg-success/10 text-success"
          testId="stat-total-deposits"
        />
        <StatCard
          title="Total Withdrawals"
          value={formatCurrency(stats?.totalWithdrawals || 0)}
          icon={TrendingDown}
          iconClassName="bg-warning/10 text-warning"
          testId="stat-total-withdrawals"
        />
        <StatCard
          title="Pending Withdrawals"
          value={formatNumber(stats?.pendingWithdrawals || 0)}
          icon={Activity}
          iconClassName="bg-destructive/10 text-destructive"
          testId="stat-pending-withdrawals"
        />
        <StatCard
          title="Pending Deposits"
          value={formatNumber(stats?.pendingDeposits || 0)}
          icon={Activity}
          iconClassName="bg-warning/10 text-warning"
          testId="stat-pending-deposits"
        />
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Deposits vs Withdrawals (Last 7 Days)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={dailyStats || []}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis
                dataKey="date"
                className="text-xs"
                tick={{ fill: "hsl(var(--muted-foreground))" }}
              />
              <YAxis
                className="text-xs"
                tick={{ fill: "hsl(var(--muted-foreground))" }}
                tickFormatter={(value) => `$${value / 1000}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "0.375rem",
                }}
                formatter={(value: number) => formatCurrency(value)}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="deposits"
                stroke={CHART_COLORS.primary}
                fill={CHART_COLORS.primary}
                fillOpacity={0.2}
                name="Deposits"
              />
              <Area
                type="monotone"
                dataKey="withdrawals"
                stroke={CHART_COLORS.secondary}
                fill={CHART_COLORS.secondary}
                fillOpacity={0.2}
                name="Withdrawals"
              />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">GGR Trend (Last 7 Days)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dailyStats || []}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis
                dataKey="date"
                className="text-xs"
                tick={{ fill: "hsl(var(--muted-foreground))" }}
              />
              <YAxis
                className="text-xs"
                tick={{ fill: "hsl(var(--muted-foreground))" }}
                tickFormatter={(value) => `$${value / 1000}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "0.375rem",
                }}
                formatter={(value: number) => formatCurrency(value)}
              />
              <Legend />
              <Bar dataKey="ggr" fill={CHART_COLORS.tertiary} name="GGR" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Top 5 Games by Revenue</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={topGames || []}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ gameName, revenue }) => `${gameName}: ${formatCurrency(revenue)}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="revenue"
              >
                {(topGames || []).map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={Object.values(CHART_COLORS)[index % Object.values(CHART_COLORS).length]}
                  />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold mb-4">Latest Withdraw Requests</h3>
          <div className="space-y-4">
            {withdrawalsLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-16 bg-muted rounded animate-pulse" />
                ))}
              </div>
            ) : (recentWithdrawals || []).length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No recent withdrawals</p>
            ) : (
              (recentWithdrawals || []).map((withdrawal: any) => (
                <div
                  key={withdrawal.id}
                  className="flex items-center justify-between p-4 rounded-md border hover-elevate"
                >
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{withdrawal.userName || "Unknown"}</p>
                    <p className="text-sm text-muted-foreground">
                      {withdrawal.method ? withdrawal.method.split("_").join(" ") : "N/A"} • {new Date(withdrawal.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="font-mono font-semibold text-lg">
                      {formatCurrency(withdrawal.amount || 0)}
                    </p>
                    <StatusBadge status={withdrawal.status} />
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Latest Game Transactions</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">User</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Game</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Bet</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Win</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">P/L</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Time</th>
              </tr>
            </thead>
            <tbody>
              {transactionsLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    <td colSpan={7} className="py-3">
                      <div className="h-10 bg-muted rounded animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : (recentTransactions || []).length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-muted-foreground">
                    No recent transactions
                  </td>
                </tr>
              ) : (
                (recentTransactions || []).map((tx: any) => (
                  <tr key={tx.id} className="border-b hover-elevate">
                    <td className="py-3 px-4 text-sm font-medium">{tx.userName || "Unknown"}</td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">{tx.gameName || "N/A"}</td>
                    <td className="py-3 px-4 text-sm font-mono text-right">
                      {formatCurrency(tx.betAmount || 0)}
                    </td>
                    <td className="py-3 px-4 text-sm font-mono text-right">
                      {formatCurrency(tx.winAmount || 0)}
                    </td>
                    <td className="py-3 px-4 text-sm font-mono text-right">
                      <span
                        className={
                          (tx.profitLoss || 0) >= 0 ? "text-success" : "text-destructive"
                        }
                      >
                        {(tx.profitLoss || 0) >= 0 ? "+" : ""}
                        {formatCurrency(tx.profitLoss || 0)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={tx.status || "pending"} />
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">
                      {new Date(tx.timestamp).toLocaleTimeString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
