import {
  Activity,
  Shield,
  UserCheck,
  BellRing,
  MousePointerClick,
  RefreshCcw,
  Server,
  Clock3,
  MessageSquare,
  Power,
  Sparkles,
} from "lucide-react";
import { StatCard } from "@/components/stat-card";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const summaryStats = [
  {
    title: "Events (24h)",
    value: "184,320",
    trend: { value: 6.1, isPositive: true },
    icon: Activity,
    iconClassName: "bg-primary/10 text-primary",
  },
  {
    title: "Security Alerts",
    value: "14",
    trend: { value: 2.8, isPositive: false },
    icon: Shield,
    iconClassName: "bg-destructive/10 text-destructive",
  },
  {
    title: "Player Actions",
    value: "78,245",
    icon: UserCheck,
    iconClassName: "bg-chart-2/10 text-chart-2",
  },
  {
    title: "System Automations",
    value: "1,142",
    icon: RefreshCcw,
    iconClassName: "bg-chart-3/10 text-chart-3",
  },
];

const liveActivityFeed = [
  {
    actor: "Admin · Sarah Lee",
    action: "Updated withdrawal limit for VIP tier",
    target: "Finance Policy",
    timestamp: "2m ago",
    impact: "Policy",
  },
  {
    actor: "Player · user_8439",
    action: "Triggered RG cooling-off",
    target: "Responsible Gaming",
    timestamp: "7m ago",
    impact: "Player",
  },
  {
    actor: "System · Cron #42",
    action: "Synced fraud rules with Nextral",
    target: "Fraud Engine",
    timestamp: "11m ago",
    impact: "System",
  },
  {
    actor: "Support · Ravi Kumar",
    action: "Manually credited dispute #23901",
    target: "Wallet",
    timestamp: "18m ago",
    impact: "Billing",
  },
  {
    actor: "Player · user_1182",
    action: "Requested account deletion",
    target: "Privacy Ops",
    timestamp: "23m ago",
    impact: "Privacy",
  },
];

const sessionSnapshots = [
  {
    player: "user_1993",
    country: "Brazil",
    device: "iOS",
    duration: "31m",
    status: "In Game",
    lastAction: "Crash · bet 25 USDT",
  },
  {
    player: "user_5582",
    country: "Canada",
    device: "Desktop",
    duration: "12m",
    status: "Idle",
    lastAction: "Lobby browsing",
  },
  {
    player: "user_0307",
    country: "India",
    device: "Android",
    duration: "47m",
    status: "Live Table",
    lastAction: "Blackjack · bet 40 USDT",
  },
  {
    player: "user_8821",
    country: "Germany",
    device: "Desktop",
    duration: "5m",
    status: "Chatting",
    lastAction: "Support ping",
  },
];

const automationRuns = [
  {
    name: "Nightly KYC sync",
    triggeredBy: "Scheduler 02:00 UTC",
    duration: "3m 24s",
    status: "Success",
    artifacts: 842,
  },
  {
    name: "Bonus eligibility recalculation",
    triggeredBy: "Manual · Growth",
    duration: "7m 18s",
    status: "Warning",
    artifacts: 112,
    note: "Skipped 29 locked accounts",
  },
  {
    name: "Fraud watchdog",
    triggeredBy: "Real-time",
    duration: "< 1s",
    status: "Success",
    artifacts: 54,
  },
  {
    name: "Cache warmup",
    triggeredBy: "Deploy",
    duration: "1m 02s",
    status: "Success",
    artifacts: 12,
  },
];

const incidentTimeline = [
  {
    title: "Session anomaly flagged",
    description: "8 login attempts from restricted province (Ontario)",
    timestamp: "Today · 06:12 UTC",
    icon: BellRing,
    status: "High",
  },
  {
    title: "Chat escalation resolved",
    description: "Handled dispute #342199 within SLA",
    timestamp: "Today · 04:44 UTC",
    icon: MessageSquare,
    status: "Cleared",
  },
  {
    title: "Auto shutdown triggered",
    description: "Crashed table re-routed to backup dealer",
    timestamp: "Yesterday · 22:03 UTC",
    icon: Power,
    status: "Resolved",
  },
  {
    title: "Marketing workflow shipped",
    description: "FTD onboarding journey pushed to production",
    timestamp: "Yesterday · 18:27 UTC",
    icon: Sparkles,
    status: "Info",
  },
];

export default function ActivitiesPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Activities</h1>
        <p className="text-muted-foreground mt-2">
          Unified feed of operational actions, player sessions, alerts, and automations (dummy data for now)
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {summaryStats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card className="p-6 xl:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">Live Activity Feed</h3>
              <p className="text-sm text-muted-foreground">Sample log entries with actor, scope, and impact</p>
            </div>
            <Badge variant="outline" className="gap-1">
              <Clock3 className="h-4 w-4" /> Last 30 min
            </Badge>
          </div>
          <div className="space-y-4">
            {liveActivityFeed.map((item) => (
              <div key={`${item.actor}-${item.timestamp}`} className="border rounded-lg p-4 space-y-2 hover-elevate">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold">{item.actor}</div>
                  <span className="text-xs text-muted-foreground">{item.timestamp}</span>
                </div>
                <p className="text-sm text-foreground">{item.action}</p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{item.target}</span>
                  <Badge variant="secondary">{item.impact}</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">Player Session Snapshots</h3>
              <p className="text-sm text-muted-foreground">Illustrative insights refreshed every 60s</p>
            </div>
            <MousePointerClick className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="space-y-4">
            {sessionSnapshots.map((session) => (
              <div key={session.player} className="border rounded-lg p-4 space-y-2 hover-elevate">
                <div className="flex items-center justify-between">
                  <p className="font-semibold">{session.player}</p>
                  <Badge
                    className={
                      session.status === "In Game"
                        ? "bg-success/10 text-success"
                        : session.status === "Live Table"
                        ? "bg-chart-2/10 text-chart-2"
                        : session.status === "Idle"
                        ? "bg-muted text-foreground"
                        : "bg-warning/10 text-warning"
                    }
                  >
                    {session.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {session.country} · {session.device} · {session.duration}
                </p>
                <p className="text-sm text-foreground">Last action: {session.lastAction}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">Automation Runs</h3>
              <p className="text-sm text-muted-foreground">Example orchestrations and their status</p>
            </div>
            <Server className="h-5 w-5 text-muted-foreground" />
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Workflow</TableHead>
                <TableHead>Triggered By</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Artifacts</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {automationRuns.map((run) => (
                <TableRow key={run.name}>
                  <TableCell className="font-medium">
                    {run.name}
                    {run.note && <p className="text-xs text-warning">{run.note}</p>}
                  </TableCell>
                  <TableCell>{run.triggeredBy}</TableCell>
                  <TableCell>{run.duration}</TableCell>
                  <TableCell>{run.artifacts}</TableCell>
                  <TableCell>
                    <Badge
                      className={
                        run.status === "Success"
                          ? "bg-success/10 text-success"
                          : "bg-warning/10 text-warning"
                      }
                    >
                      {run.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">Incident & Alert Timeline</h3>
              <p className="text-sm text-muted-foreground">Auto-generated illustrative events</p>
            </div>
            <BellRing className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="space-y-4">
            {incidentTimeline.map((event) => (
              <div key={event.title} className="flex gap-3 p-3 border rounded-lg hover-elevate">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted">
                  <event.icon className="h-5 w-5 text-foreground" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold">{event.title}</p>
                    <Badge
                      variant="outline"
                      className={
                        event.status === "High"
                          ? "text-destructive border-destructive/40"
                          : event.status === "Resolved"
                          ? "text-success border-success/40"
                          : "text-muted-foreground"
                      }
                    >
                      {event.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{event.description}</p>
                  <p className="text-xs text-muted-foreground">{event.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
