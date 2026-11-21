import {
  ShieldCheck,
  Globe2,
  AlertTriangle,
  Files,
  ScrollText,
  Gavel,
  CheckCircle2,
  Lock,
  MapPin,
  ListChecks,
} from "lucide-react";
import { StatCard } from "@/components/stat-card";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";

const complianceStats = [
  {
    title: "Active Licenses",
    value: 14,
    icon: ShieldCheck,
    iconClassName: "bg-primary/10 text-primary",
  },
  {
    title: "Jurisdictions Covered",
    value: 32,
    icon: Globe2,
    iconClassName: "bg-chart-2/10 text-chart-2",
  },
  {
    title: "Pending Audits",
    value: 3,
    trend: { value: 12, isPositive: false },
    icon: AlertTriangle,
    iconClassName: "bg-warning/10 text-warning",
  },
  {
    title: "Policies Updated (30d)",
    value: 27,
    icon: Files,
    iconClassName: "bg-chart-3/10 text-chart-3",
  },
];

const readinessScore = [
  { region: "EU MGA", rtp: 92, aml: 88, rg: 85 },
  { region: "UKGC", rtp: 94, aml: 91, rg: 89 },
  { region: "Curacao", rtp: 82, aml: 76, rg: 70 },
  { region: "Ontario", rtp: 88, aml: 83, rg: 79 },
  { region: "Sweden", rtp: 90, aml: 86, rg: 81 },
];

const upcomingFilings = [
  {
    country: "Netherlands",
    due: "Aug 19",
    type: "Quarterly RG attest",
    owner: "Compliance Ops",
    status: "In Progress",
  },
  {
    country: "Spain",
    due: "Aug 23",
    type: "AML audit pack",
    owner: "Risk Lead",
    status: "Pending",
  },
  {
    country: "Brazil",
    due: "Aug 27",
    type: "Market entry docs",
    owner: "Regional GM",
    status: "Under Review",
  },
  {
    country: "UK",
    due: "Sep 3",
    type: "RTP certification",
    owner: "Studio QA",
    status: "Ready",
  },
];

const auditTrail = [
  {
    title: "RG controls auto-tested",
    detail: "Player limit changes synced to MGA evidence locker",
    time: "Today, 09:32 UTC",
    icon: CheckCircle2,
  },
  {
    title: "Geo fencing anomaly",
    detail: "Attempted login from blocked region (Ontario) flagged",
    time: "Today, 04:11 UTC",
    icon: AlertTriangle,
  },
  {
    title: "AML SAR submitted",
    detail: "Investigation #8431 sent to FIU with artifacts",
    time: "Yesterday, 18:54 UTC",
    icon: ScrollText,
  },
  {
    title: "Policy evidence refreshed",
    detail: "Updated RTP certificates for 27 games",
    time: "Yesterday, 13:08 UTC",
    icon: Files,
  },
];

const controlChecklist = [
  {
    title: "KYC & PEP screening",
    owner: "Identity Services",
    status: "Healthy",
    coverage: 98,
  },
  {
    title: "AML transaction monitoring",
    owner: "Risk Engine",
    status: "Attention",
    coverage: 86,
    note: "Increase sampling for VIP cohort",
  },
  {
    title: "Responsible gaming messaging",
    owner: "Lifecycle",
    status: "Healthy",
    coverage: 93,
  },
  {
    title: "Data residency & encryption",
    owner: "Infra",
    status: "Healthy",
    coverage: 100,
  },
];

const monitoringAlerts = [
  {
    title: "Ontario AML coverage",
    severity: "High",
    description: "Backlog in SAR review queue > 48h",
  },
  {
    title: "LatAm RTP disclosures",
    severity: "Medium",
    description: "2 games missing localized RTP statements",
  },
  {
    title: "GDPR consent logging",
    severity: "Low",
    description: "Last export ran 25h ago (SLA 24h)",
  },
];

export default function CompliancePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Compliance</h1>
        <p className="text-muted-foreground mt-2">
          Monitor jurisdictions, filings, audits, RTP controls, and regulatory alerts
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {complianceStats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card className="p-6 xl:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">Jurisdiction Readiness</h3>
              <p className="text-sm text-muted-foreground">
                Illustrative compliance scores across regulated regions
              </p>
            </div>
            <Badge variant="outline" className="gap-1">
              <Lock className="h-4 w-4" />
              RTP · AML · RG
            </Badge>
          </div>
          <ResponsiveContainer width="100%" height={320}>
            <RadarChart data={readinessScore}>
              <PolarGrid className="stroke-border" />
              <PolarAngleAxis
                dataKey="region"
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              />
              <PolarRadiusAxis tick={{ fill: "hsl(var(--muted-foreground))" }} />
              <Radar
                name="RTP"
                dataKey="rtp"
                stroke="hsl(var(--chart-1))"
                fill="hsl(var(--chart-1))"
                fillOpacity={0.2}
              />
              <Radar
                name="AML"
                dataKey="aml"
                stroke="hsl(var(--chart-2))"
                fill="hsl(var(--chart-2))"
                fillOpacity={0.2}
              />
              <Radar
                name="RG"
                dataKey="rg"
                stroke="hsl(var(--chart-3))"
                fill="hsl(var(--chart-3))"
                fillOpacity={0.2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">Monitoring Alerts</h3>
              <p className="text-sm text-muted-foreground">Dummy feed refreshed every 15 minutes</p>
            </div>
            <AlertTriangle className="h-5 w-5 text-warning" />
          </div>
          <div className="space-y-4">
            {monitoringAlerts.map((alert) => (
              <div key={alert.title} className="border rounded-lg p-4 space-y-2 hover-elevate">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={
                        alert.severity === "High"
                          ? "text-destructive border-destructive/40"
                          : alert.severity === "Medium"
                          ? "text-warning border-warning/40"
                          : "text-muted-foreground"
                      }
                    >
                      {alert.severity}
                    </Badge>
                    <p className="font-semibold">{alert.title}</p>
                  </div>
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">{alert.description}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">Upcoming Filings & Renewals</h3>
              <p className="text-sm text-muted-foreground">Illustrative compliance queue</p>
            </div>
            <Gavel className="h-5 w-5 text-muted-foreground" />
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Market</TableHead>
                <TableHead>Due</TableHead>
                <TableHead>Requirement</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {upcomingFilings.map((filing) => (
                <TableRow key={`${filing.country}-${filing.due}`}>
                  <TableCell className="font-medium">{filing.country}</TableCell>
                  <TableCell>{filing.due}</TableCell>
                  <TableCell>{filing.type}</TableCell>
                  <TableCell>{filing.owner}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{filing.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">Audit Trail & Evidence</h3>
              <p className="text-sm text-muted-foreground">Auto-generated sample entries</p>
            </div>
            <ScrollText className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="space-y-4">
            {auditTrail.map((entry) => (
              <div key={entry.title} className="flex gap-3 p-3 border rounded-lg hover-elevate">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted">
                  <entry.icon className="h-5 w-5 text-foreground" />
                </div>
                <div className="space-y-1">
                  <p className="font-semibold">{entry.title}</p>
                  <p className="text-sm text-muted-foreground">{entry.detail}</p>
                  <p className="text-xs text-muted-foreground">{entry.time}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold">Control Health Checklist</h3>
            <p className="text-sm text-muted-foreground">
              Dummy maturity scores across key compliance programs
            </p>
          </div>
          <ListChecks className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="space-y-4">
          {controlChecklist.map((control) => (
            <div
              key={control.title}
              className="border rounded-lg p-4 flex flex-col gap-3 hover-elevate md:flex-row md:items-center md:justify-between"
            >
              <div>
                <p className="font-semibold">{control.title}</p>
                <p className="text-sm text-muted-foreground">{control.owner}</p>
                {control.note && <p className="text-xs text-warning mt-1">{control.note}</p>}
              </div>
              <div className="flex items-center gap-4 w-full md:w-auto">
                <Badge
                  className={
                    control.status === "Healthy"
                      ? "bg-success/10 text-success"
                      : "bg-warning/10 text-warning"
                  }
                >
                  {control.status}
                </Badge>
                <div className="flex-1 md:w-48">
                  <Progress value={control.coverage} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">{control.coverage}% coverage</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
