import { useState } from "react";
import { motion } from "framer-motion";
import { MOCK_LEADS, PIPELINE_STAGES, Lead, LeadStatus } from "@/lib/mock-data";
import { Phone, Mail, MoreHorizontal } from "lucide-react";

function PipelineCard({ lead }: { lead: Lead }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-lg border border-border bg-background p-3 space-y-2 hover:border-primary/30 transition-colors cursor-pointer"
    >
      <div className="flex items-center justify-between">
        <span className="font-medium text-sm">{lead.firstName} {lead.lastName}</span>
        <button className="text-muted-foreground hover:text-foreground">
          <MoreHorizontal className="h-3.5 w-3.5" />
        </button>
      </div>
      <p className="text-xs text-muted-foreground">{lead.program}</p>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-primary">${lead.value.toLocaleString()}</span>
        <div className="flex items-center gap-1">
          <button className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground">
            <Phone className="h-3 w-3" />
          </button>
          <button className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground">
            <Mail className="h-3 w-3" />
          </button>
        </div>
      </div>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{lead.source}</span>
        <span>{lead.assignedTo}</span>
      </div>
    </motion.div>
  );
}

export default function Pipeline() {
  const [leads] = useState(MOCK_LEADS);
  const stages = PIPELINE_STAGES.filter(s => s.key !== "lost");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">Sales Pipeline</h1>
        <p className="text-sm text-muted-foreground">Track leads through every stage of enrollment.</p>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {stages.map((stage) => {
          const stageLeads = leads.filter(l => l.status === stage.key);
          const stageValue = stageLeads.reduce((sum, l) => sum + l.value, 0);
          return (
            <div key={stage.key} className="min-w-[280px] flex-shrink-0">
              <div className="rounded-xl border border-border bg-card">
                <div className="p-4 border-b border-border">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`h-2.5 w-2.5 rounded-full ${stage.color}`} />
                      <h3 className="font-heading text-sm font-semibold">{stage.label}</h3>
                    </div>
                    <span className="text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5">{stageLeads.length}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">${stageValue.toLocaleString()} total value</p>
                </div>
                <div className="p-3 space-y-2 max-h-[calc(100vh-280px)] overflow-y-auto">
                  {stageLeads.map(lead => (
                    <PipelineCard key={lead.id} lead={lead} />
                  ))}
                  {stageLeads.length === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-8">No leads in this stage</p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
