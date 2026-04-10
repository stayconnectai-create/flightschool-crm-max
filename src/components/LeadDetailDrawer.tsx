import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Lead, MOCK_ACTIVITIES, Activity, PIPELINE_STAGES } from "@/lib/mock-data";
import { LeadStatusBadge } from "@/components/LeadStatusBadge";
import { Mail, Phone, Calendar, Clock, MessageSquare, ArrowRight, FileText, MapPin, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const activityIcon: Record<Activity["type"], React.ReactNode> = {
  email: <Mail className="h-3.5 w-3.5" />,
  call: <Phone className="h-3.5 w-3.5" />,
  sms: <MessageSquare className="h-3.5 w-3.5" />,
  note: <FileText className="h-3.5 w-3.5" />,
  status_change: <ArrowRight className="h-3.5 w-3.5" />,
  tour: <MapPin className="h-3.5 w-3.5" />,
};

const activityColor: Record<Activity["type"], string> = {
  email: "bg-primary/15 text-primary",
  call: "bg-success/15 text-success",
  sms: "bg-purple-500/15 text-purple-400",
  note: "bg-muted text-muted-foreground",
  status_change: "bg-warning/15 text-warning",
  tour: "bg-orange-500/15 text-orange-400",
};

interface LeadDetailDrawerProps {
  lead: Lead | null;
  open: boolean;
  onClose: () => void;
}

export function LeadDetailDrawer({ lead, open, onClose }: LeadDetailDrawerProps) {
  if (!lead) return null;

  const activities = MOCK_ACTIVITIES.filter(a => a.leadId === lead.id).sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto bg-background border-border">
        <SheetHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-primary/15 flex items-center justify-center text-lg font-bold text-primary">
              {lead.firstName[0]}{lead.lastName[0]}
            </div>
            <div>
              <SheetTitle className="font-heading text-lg">{lead.firstName} {lead.lastName}</SheetTitle>
              <LeadStatusBadge status={lead.status} />
            </div>
          </div>
        </SheetHeader>

        {/* Contact info */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-3 text-sm">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <a href={`mailto:${lead.email}`} className="text-primary hover:underline">{lead.email}</a>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <a href={`tel:${lead.phone}`} className="text-foreground">{lead.phone}</a>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Created {lead.createdAt}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Assigned to {lead.assignedTo}</span>
          </div>
        </div>

        {/* Details grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="rounded-lg bg-card border border-border p-3">
            <p className="text-xs text-muted-foreground">Program</p>
            <p className="text-sm font-medium mt-1">{lead.program}</p>
          </div>
          <div className="rounded-lg bg-card border border-border p-3">
            <p className="text-xs text-muted-foreground">Value</p>
            <p className="text-sm font-medium mt-1 text-primary">${lead.value.toLocaleString()}</p>
          </div>
          <div className="rounded-lg bg-card border border-border p-3">
            <p className="text-xs text-muted-foreground">Source</p>
            <p className="text-sm font-medium mt-1">{lead.source}</p>
          </div>
          <div className="rounded-lg bg-card border border-border p-3">
            <p className="text-xs text-muted-foreground">Last Contact</p>
            <p className="text-sm font-medium mt-1">{lead.lastContact}</p>
          </div>
        </div>

        {/* Notes */}
        <div className="mb-6">
          <h3 className="font-heading text-sm font-semibold mb-2">Notes</h3>
          <div className="rounded-lg bg-card border border-border p-3">
            <p className="text-sm text-muted-foreground">{lead.notes}</p>
          </div>
        </div>

        {/* Quick actions */}
        <div className="flex gap-2 mb-6">
          <Button size="sm" className="bg-gradient-sky text-primary-foreground flex-1">
            <Phone className="h-3.5 w-3.5 mr-1" /> Call
          </Button>
          <Button size="sm" variant="secondary" className="flex-1">
            <Mail className="h-3.5 w-3.5 mr-1" /> Email
          </Button>
          <Button size="sm" variant="secondary" className="flex-1">
            <MessageSquare className="h-3.5 w-3.5 mr-1" /> SMS
          </Button>
        </div>

        <Separator className="mb-6" />

        {/* Activity timeline */}
        <div>
          <h3 className="font-heading text-sm font-semibold mb-4">Activity Timeline</h3>
          <div className="space-y-4">
            {activities.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">No activity recorded yet</p>
            )}
            {activities.map((activity, i) => (
              <div key={activity.id} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${activityColor[activity.type]}`}>
                    {activityIcon[activity.type]}
                  </div>
                  {i < activities.length - 1 && <div className="w-px flex-1 bg-border mt-1" />}
                </div>
                <div className="pb-4">
                  <p className="text-sm">{activity.description}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground">{activity.date}</span>
                    <span className="text-xs text-muted-foreground">· {activity.user}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
