import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
      case "completed":
      case "approved":
        return "bg-success/10 text-success border-success/20";
      case "pending":
        return "bg-warning/10 text-warning border-warning/20";
      case "rejected":
      case "cancelled":
      case "suspended":
      case "inactive":
      case "failed":
        return "bg-destructive/10 text-destructive border-destructive/20";
      case "rolled_back":
        return "bg-orange-500/10 text-orange-500 border-orange-500/20";
      case "maintenance":
        return "bg-muted text-muted-foreground border-muted";
      default:
        return "bg-secondary text-secondary-foreground border-secondary";
    }
  };

  const formatStatus = (status: string) => {
    return status
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <Badge
      variant="outline"
      className={cn(
        "rounded-full px-3 py-1 text-xs font-medium",
        getStatusColor(status),
        className
      )}
    >
      {formatStatus(status)}
    </Badge>
  );
}
