import {
  Activity,
  AlertTriangle,
  BarChart3,
  CloudLightning,
  Database,
  HardDrive,
  RefreshCw,
  Server,
  Settings,
  ShieldAlert,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { StatusBadge } from "@/components/status-badge";

const serviceStatus = [
  {
    name: "Core API",
    status: "active",
    uptime: "99.982%",
    latency: "182 ms",
    icon: Server,
    trend: "+3.2% requests",
  },
  {
    name: "Games API",
    status: "active",
    uptime: "99.941%",
    latency: "214 ms",
    icon: Activity,
    trend: "+1.4% RTP sync",
  },
  {
    name: "Payments",
    status: "maintenance",
    uptime: "99.112%",
    latency: "463 ms",
    icon: RefreshCw,
    trend: "Scheduled window",
  },
  {
    name: "Webhooks",
    status: "active",
    uptime: "99.998%",
    latency: "121 ms",
    icon: CloudLightning,
    trend: "+8.6% deliveries",
  },
];

const incidents = [
  {
    id: "INC-4418",
    title: "Degraded latency in Europe West",
    impact: "minor",
    start: "09:14 UTC",
    duration: "32 min",
    status: "resolved",
    actions: ["Scaled out API pods", "Rebalanced traffic"],
  },
  {
    id: "INC-4410",
    title: "Stuck payouts queue",
    impact: "major",
    start: "Yesterday 22:07 UTC",
    duration: "81 min",
    status: "resolved",
    actions: ["Restarted workers", "Replayed ledger events"],
  },
  {
    id: "INC-4403",
    title: "Webhook signature drift",
    impact: "minor",
    start: "2 days ago",
    duration: "17 min",
    status: "completed",
    actions: ["Rotated signing key", "Forced re-subscription"],
  },
];

const maintenanceJobs = [
  {
    name: "Daily Account Snapshot",
    schedule: "Every day 02:00 UTC",
    lastRun: "Today 02:01 UTC",
    nextRun: "Tomorrow 02:00 UTC",
    status: "success",
  },
  {
    name: "Ledger Compaction",
    schedule: "Every 6 hours",
    lastRun: "04:07 UTC",
    nextRun: "10:07 UTC",
    status: "running",
  },
  {
    name: "Stuck Deposit Sweep",
    schedule: "Every 15 minutes",
    lastRun: "08:30 UTC",
    nextRun: "08:45 UTC",
    status: "warning",
  },
  {
    name: "BI Warehouse Load",
    schedule: "Every day 04:30 UTC",
    lastRun: "Today 04:34 UTC",
    nextRun: "Tomorrow 04:30 UTC",
    status: "success",
  },
];

const backupReports = [
  {
    region: "eu-central-1",
    snapshot: "db-prod-2025-11-25",
    size: "812 GB",
    retention: "35 days",
    successRate: 100,
  },
  {
    region: "us-east-2",
    snapshot: "db-prod-2025-11-25",
    size: "1.4 TB",
    retention: "90 days",
    successRate: 97,
  },
  {
    region: "ap-southeast-1",
    snapshot: "db-prod-2025-11-25",
    size: "544 GB",
    retention: "60 days",
    successRate: 100,
  },
];

const featureFlags = [
  { name: "use_new_rtp_feed", env: "production", status: "active" },
  { name: "payments_async_capture", env: "staging", status: "active" },
  { name: "kyc_auto_approval", env: "production", status: "inactive" },
  { name: "chat_moderation_ml", env: "beta", status: "active" },
];

export default function SystemPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">System Control Center</h1>
        <p className="text-muted-foreground mt-2">
          Live state of platform services, scheduled automation, backups, and configuration guardrails.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {serviceStatus.map((service) => (
          <Card key={service.name} className="p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{service.name}</p>
                <div className="mt-1">
                  <StatusBadge status={service.status} />
                </div>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-md bg-primary/10 text-primary">
                <service.icon className="h-5 w-5" />
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Trailing 30d uptime</span>
                <span className="font-semibold tabular-nums">{service.uptime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">p95 latency</span>
                <span className="font-semibold tabular-nums">{service.latency}</span>
              </div>
              <p className="text-xs text-muted-foreground">{service.trend}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card className="p-6 space-y-4 xl:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Incident timeline</h2>
              <p className="text-sm text-muted-foreground">
                Real-time stream of envoy alerts, ops escalations, and maintenance notes.
              </p>
            </div>
            <Badge variant="outline" className="gap-1">
              <ShieldAlert className="h-4 w-4" />
              PagerDuty synced
            </Badge>
          </div>
          <div className="space-y-4">
            {incidents.map((incident) => (
              <div
                key={incident.id}
                className="rounded-lg border border-border/60 p-4 space-y-2 bg-muted/30"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {incident.id}
                    </Badge>
                    <p className="font-medium">{incident.title}</p>
                  </div>
                  <StatusBadge status={incident.status} />
                </div>
                <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    Impact: {incident.impact}
                  </span>
                  <span>Started: {incident.start}</span>
                  <span>Duration: {incident.duration}</span>
                </div>
                <ul className="text-sm list-disc list-inside text-muted-foreground">
                  {incident.actions.map((action) => (
                    <li key={action}>{action}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Backups & snapshots</h2>
              <p className="text-sm text-muted-foreground">
                Cross-region redundancy and immutable retention windows.
              </p>
            </div>
            <Badge variant="outline" className="gap-1">
              <HardDrive className="h-4 w-4" />
              3 regions
            </Badge>
          </div>
          <div className="space-y-4">
            {backupReports.map((backup) => (
              <div key={backup.region} className="rounded-lg border p-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div>
                    <p className="font-semibold">{backup.region}</p>
                    <p className="text-muted-foreground text-xs">{backup.snapshot}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{backup.retention} retention</span>
                </div>
                <div className="text-xs text-muted-foreground">Size {backup.size}</div>
                <Progress value={backup.successRate} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  {backup.successRate}% snapshot success past 30 days
                </p>
              </div>
            ))}
          </div>
          <Button variant="outline" className="w-full gap-2">
            <Database className="h-4 w-4" />
            Download latest manifest
          </Button>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Scheduled automation</h2>
              <p className="text-sm text-muted-foreground">
                Cron-like workflow engine backed by durable job queues.
              </p>
            </div>
            <Badge variant="outline" className="gap-1">
              <BarChart3 className="h-4 w-4" />
              247 jobs
            </Badge>
          </div>
          <div className="space-y-3">
            {maintenanceJobs.map((job) => (
              <div
                key={job.name}
                className="rounded-lg border border-border/60 p-4 bg-muted/20 flex flex-col gap-2"
              >
                <div className="flex items-center justify-between text-sm">
                  <p className="font-semibold">{job.name}</p>
                  <StatusBadge status={job.status} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-muted-foreground">
                  <div>
                    <span className="font-medium">Schedule:</span> {job.schedule}
                  </div>
                  <div>
                    <span className="font-medium">Last run:</span> {job.lastRun}
                  </div>
                  <div>
                    <span className="font-medium">Next run:</span> {job.nextRun}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Config registry & feature flags</h2>
              <p className="text-sm text-muted-foreground">
                Deterministic rollouts backed by audit trails and approvals.
              </p>
            </div>
            <Badge variant="outline" className="gap-1">
              <Settings className="h-4 w-4" />
              synced 4 min ago
            </Badge>
          </div>
          <div className="space-y-3">
            {featureFlags.map((flag) => (
              <div
                key={flag.name}
                className="flex items-center justify-between rounded-lg border border-border/60 p-3"
              >
                <div>
                  <p className="font-semibold text-sm">{flag.name}</p>
                  <p className="text-xs text-muted-foreground">env: {flag.env}</p>
                </div>
                <StatusBadge status={flag.status} />
              </div>
            ))}
          </div>
          <Button variant="secondary" className="w-full gap-2">
            <ShieldAlert className="h-4 w-4" />
            Open change request
          </Button>
        </Card>
      </div>
    </div>
  );
}