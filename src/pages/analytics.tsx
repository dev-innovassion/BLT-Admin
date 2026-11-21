import { Users, DollarSign, BarChart3, Clock4, PlayCircle, Globe, Activity, Zap } from "lucide-react";
import { StatCard } from "@/components/stat-card";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
} from "recharts";

const chartColors = {
  primary: "hsl(var(--chart-1))",
  secondary: "hsl(var(--chart-2))",
  tertiary: "hsl(var(--chart-3))",
};

const kpiCards = [
  {
    title: "Daily Active Users",
    value: "24,581",
    icon: Users,
    trend: { value: 5.4, isPositive: true },
  },
  {
    title: "Avg. Session Length",
    value: "18m 42s",
    icon: Clock4,
    trend: { value: 2.1, isPositive: true },
  },
  {
    title: "Gross Gaming Revenue",
    value: formatCurrency(482000, { minimumFractionDigits: 0, maximumFractionDigits: 0 }),
    icon: DollarSign,
    trend: { value: 3.8, isPositive: true },
  },
  {
    title: "Conversion Rate",
    value: "7.6%",
    icon: BarChart3,
    trend: { value: 1.2, isPositive: false },
  },
];

const conversionFunnel = [
  { step: "Visits", value: 120000 },
  { step: "Signups", value: 18400 },
  { step: "First Deposit", value: 7200 },
  { step: "First Game Played", value: 5600 },
  { step: "Retained (30d)", value: 2800 },
];

const engagementTrend = [
  { day: "Mon", minutes: 16, wagers: 220 },
  { day: "Tue", minutes: 18, wagers: 235 },
  { day: "Wed", minutes: 17, wagers: 228 },
  { day: "Thu", minutes: 19, wagers: 242 },
  { day: "Fri", minutes: 23, wagers: 288 },
  { day: "Sat", minutes: 27, wagers: 314 },
  { day: "Sun", minutes: 25, wagers: 301 },
];

const revenueMix = [
  { label: "Slots", desktop: 38, mobile: 44 },
  { label: "Live Casino", desktop: 21, mobile: 19 },
  { label: "Sportsbook", desktop: 26, mobile: 23 },
  { label: "Crash/Arcade", desktop: 15, mobile: 14 },
];

const cohortTable = [
  { month: "April", signup: 6400, day7: 41, day30: 30, day90: 18 },
  { month: "May", signup: 7100, day7: 39, day30: 28, day90: 16 },
  { month: "June", signup: 7800, day7: 43, day30: 31, day90: 20 },
  { month: "July", signup: 8350, day7: 45, day30: 33, day90: 22 },
];

const topChannels = [
  { name: "Affiliate Tier A", share: 36, trend: 4.2 },
  { name: "Paid Social", share: 24, trend: 1.4 },
  { name: "Streamers", share: 18, trend: 6.8 },
  { name: "Organic Search", share: 12, trend: -0.9 },
  { name: "In-app Cross Promo", share: 10, trend: 3.1 },
];

const liveMetrics = [
  { label: "Players In Lobby", value: "1,284", icon: Activity },
  { label: "Games In-progress", value: "7,812", icon: PlayCircle },
  {
    label: `Avg. Bet (${CURRENCY})`,
    value: formatCurrency(42.16, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    icon: DollarSign,
  },
  { label: "Requests / sec", value: "5.7k", icon: Zap },
];

import { CURRENCY, formatCurrency } from "@/lib/currency";

export default function AnalyticsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
        <p className="text-muted-foreground mt-2">
          Real-time KPIs, funnels, cohorts, and LTV insights across the casino platform
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {kpiCards.map((card) => (
          <StatCard key={card.title} {...card} />
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card className="p-6 xl:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">Acquisition Funnel</h3>
              <p className="text-sm text-muted-foreground">
                Dummy data reflecting live conversion checkpoints
              </p>
            </div>
            <span className="text-xs uppercase tracking-wide text-muted-foreground">Last 30 days</span>
          </div>
          <div className="space-y-4">
            {conversionFunnel.map((step, index) => {
              const rate =
                index === 0 ? 100 : Math.round((step.value / conversionFunnel[index - 1].value) * 100);
              return (
                <div key={step.step} className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{step.step}</p>
                    <p className="text-sm text-muted-foreground">{step.value.toLocaleString()} users</p>
                  </div>
                  <Progress value={rate} className="h-2" />
                  <p className="text-xs text-muted-foreground">Step conversion {rate}%</p>
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">Revenue Mix</h3>
              <p className="text-sm text-muted-foreground">Split by product & device</p>
            </div>
            <Globe className="h-5 w-5 text-muted-foreground" />
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={revenueMix} barGap={6}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="label" tick={{ fill: "hsl(var(--muted-foreground))" }} />
              <YAxis tick={{ fill: "hsl(var(--muted-foreground))" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "0.375rem",
                }}
              />
              <Bar dataKey="desktop" name="Desktop" fill={chartColors.primary} radius={[4, 4, 0, 0]} />
              <Bar dataKey="mobile" name="Mobile" fill={chartColors.secondary} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">Engagement Trend</h3>
              <p className="text-sm text-muted-foreground">Session length vs wagers/day</p>
            </div>
            <span className="text-xs text-muted-foreground uppercase tracking-wide">UTC</span>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={engagementTrend}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="day" tick={{ fill: "hsl(var(--muted-foreground))" }} />
              <YAxis
                yAxisId="left"
                tick={{ fill: "hsl(var(--muted-foreground))" }}
                tickFormatter={(value) => `${value}m`}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={{ fill: "hsl(var(--muted-foreground))" }}
                tickFormatter={(value) => `${value}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "0.375rem",
                }}
              />
              <Line
                type="monotone"
                dataKey="minutes"
                name="Avg Session Minutes"
                stroke={chartColors.primary}
                strokeWidth={2}
                yAxisId="left"
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="wagers"
                name="Avg Wagers"
                stroke={chartColors.tertiary}
                strokeWidth={2}
                yAxisId="right"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">Live Platform Metrics</h3>
              <p className="text-sm text-muted-foreground">Snapshot, refreshed every 60s</p>
            </div>
            <Activity className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="space-y-4">
            {liveMetrics.map((metric) => (
              <div key={metric.label} className="flex items-center justify-between border rounded-lg px-4 py-3 hover-elevate">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted">
                    <metric.icon className="h-5 w-5 text-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{metric.label}</p>
                    <p className="text-xl font-semibold">{metric.value}</p>
                  </div>
                </div>
                <span className="text-xs font-medium text-success">Live</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card className="p-6 xl:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">Retention & LTV Cohorts</h3>
              <p className="text-sm text-muted-foreground">Illustrative data from the last four months</p>
            </div>
            <span className="text-xs text-muted-foreground uppercase tracking-wide">{CURRENCY}</span>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Signup Month</TableHead>
                <TableHead>New Users</TableHead>
                <TableHead>Day 7</TableHead>
                <TableHead>Day 30</TableHead>
                <TableHead>Day 90</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cohortTable.map((cohort) => (
                <TableRow key={cohort.month}>
                  <TableCell className="font-medium">{cohort.month}</TableCell>
                  <TableCell>{cohort.signup.toLocaleString()}</TableCell>
                  <TableCell>{cohort.day7}%</TableCell>
                  <TableCell>{cohort.day30}%</TableCell>
                  <TableCell>{cohort.day90}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">Top Acquisition Channels</h3>
              <p className="text-sm text-muted-foreground">Share of FTDs (dummy dataset)</p>
            </div>
            <Globe className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="space-y-4">
            {topChannels.map((channel) => (
              <div key={channel.name} className="flex items-center justify-between border rounded-lg p-3">
                <div>
                  <p className="font-medium">{channel.name}</p>
                  <p className="text-xs text-muted-foreground">MoM change {channel.trend > 0 ? "+" : ""}
                    {channel.trend}%
                  </p>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-2xl font-semibold">{channel.share}%</span>
                  <span className={channel.trend >= 0 ? "text-xs text-success" : "text-xs text-destructive"}>
                    {channel.trend >= 0 ? "↑" : "↓"} {Math.abs(channel.trend)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
