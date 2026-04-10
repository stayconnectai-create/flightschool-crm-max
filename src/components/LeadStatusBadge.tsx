import { LeadStatus, PIPELINE_STAGES } from "@/lib/mock-data";

const statusStyles: Record<LeadStatus, string> = {
  new: "bg-primary/15 text-primary",
  contacted: "bg-sky-glow/15 text-sky-glow",
  discovery: "bg-warning/15 text-warning",
  tour_scheduled: "bg-purple-500/15 text-purple-400",
  tour_completed: "bg-orange-500/15 text-orange-400",
  enrolled: "bg-success/15 text-success",
  lost: "bg-destructive/15 text-destructive",
};

export function LeadStatusBadge({ status }: { status: LeadStatus }) {
  const stage = PIPELINE_STAGES.find(s => s.key === status);
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyles[status]}`}>
      {stage?.label || status}
    </span>
  );
}
