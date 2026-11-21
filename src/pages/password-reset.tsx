import { useMemo } from "react";
import { MailCheck, Timer, ShieldCheck, AlertTriangle, Copy, Send, RefreshCw } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "@/components/status-badge";

const activeLinks = [
  {
    id: "RST-9218",
    user: "claire@vegasverse.io",
    role: "Operator",
    issuedBy: "You",
    expiresIn: "13m",
    channel: "Email + SMS",
    status: "active",
  },
  {
    id: "RST-9215",
    user: "mason@luckyace.gg",
    role: "Admin",
    issuedBy: "Nora Patel",
    expiresIn: "Expired",
    channel: "Email",
    status: "completed",
  },
  {
    id: "RST-9211",
    user: "ops.team@dicecity.bet",
    role: "Agent",
    issuedBy: "Auto (Sentry)",
    expiresIn: "47m",
    channel: "Slack",
    status: "active",
  },
];

const auditEvents = [
  {
    id: "AUD-7781",
    actor: "You",
    action: "Issued new link for claire@vegasverse.io",
    timestamp: "08:14 UTC",
    status: "completed",
  },
  {
    id: "AUD-7774",
    actor: "Platform Guardrail",
    action: "Blocked reset attempt (IP reputation: high-risk)",
    timestamp: "07:58 UTC",
    status: "rejected",
  },
  {
    id: "AUD-7768",
    actor: "Automation",
    action: "Expired unused reset tokens (24h)",
    timestamp: "07:00 UTC",
    status: "completed",
  },
];

export default function PasswordResetPage() {
  const metrics = useMemo(
    () => [
      {
        title: "Links issued (24h)",
        value: "42",
        icon: MailCheck,
        description: "+8 vs yesterday",
      },
      {
        title: "Pending approvals",
        value: "5",
        icon: AlertTriangle,
        description: "Manual verification required",
      },
      {
        title: "Mean time to reset",
        value: "4m 26s",
        icon: Timer,
        description: "p95: 9m 11s",
      },
      {
        title: "Policy compliance",
        value: "100%",
        icon: ShieldCheck,
        description: "All links MFA enforced",
      },
    ],
    []
  );

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Password Reset Control</h1>
        <p className="text-muted-foreground">
          Create scoped reset links, monitor expirations, and review compliance signals.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <Card key={metric.title} className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">{metric.title}</p>
                <p className="text-3xl font-semibold tabular-nums mt-1">{metric.value}</p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <metric.icon className="h-5 w-5" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">{metric.description}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Issue reset link</CardTitle>
            <CardDescription>
              Generate a single-use reset URL with optional approval and delivery policies.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">User email</Label>
              <Input id="email" placeholder="admin@billibet.com" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Link lifetime</Label>
                <Select defaultValue="15">
                  <SelectTrigger>
                    <SelectValue placeholder="Select TTL" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                    <SelectItem value="240">4 hours</SelectItem>
                    <SelectItem value="1440">24 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Delivery channel</Label>
                <Select defaultValue="email_sms">
                  <SelectTrigger>
                    <SelectValue placeholder="Select channel" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email_sms">Email + SMS</SelectItem>
                    <SelectItem value="email_only">Email only</SelectItem>
                    <SelectItem value="manual">Manual (copy/paste)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Reset reason</Label>
              <Textarea
                id="notes"
                rows={3}
                placeholder="Example: User triggered credential reset from monitoring alert."
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="gap-1">
                <ShieldCheck className="h-3.5 w-3.5" />
                MFA enforced on link usage
              </Badge>
              <Badge variant="outline" className="gap-1">
                <RefreshCw className="h-3.5 w-3.5" />
                Auto-expire on completion
              </Badge>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button className="gap-2">
                <Send className="h-4 w-4" />
                Generate & send link
              </Button>
              <Button variant="outline" className="gap-2">
                <Copy className="h-4 w-4" />
                Copy to clipboard
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active reset links</CardTitle>
            <CardDescription>Monitor outstanding links before they expire.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ticket</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeLinks.map((link) => (
                    <TableRow key={link.id}>
                      <TableCell className="font-medium">{link.id}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold">{link.user}</span>
                          <span className="text-xs text-muted-foreground">
                            {link.role} · issued by {link.issuedBy}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{link.expiresIn}</TableCell>
                      <TableCell>
                        <StatusBadge status={link.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <p className="text-xs text-muted-foreground">
              Links auto-expire when TTL lapses or immediately after a successful password change.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Audit trail</CardTitle>
          <CardDescription>
            Immutable record of reset issuance, approvals, and security actions.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {auditEvents.map((event) => (
            <div
              key={event.id}
              className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 rounded-lg border border-border/60 p-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Badge variant="secondary">{event.id}</Badge>
                  <span>{event.actor}</span>
                </div>
                <p className="text-sm text-muted-foreground">{event.action}</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs text-muted-foreground">{event.timestamp}</span>
                <StatusBadge status={event.status} />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
