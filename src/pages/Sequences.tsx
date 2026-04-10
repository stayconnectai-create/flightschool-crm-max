import { useState } from "react";
import { motion } from "framer-motion";
import { MOCK_SEQUENCES, Sequence, SequenceStep } from "@/lib/mock-data";
import { Plus, Play, Pause, Mail, MessageSquare, Clock, CheckSquare, ChevronDown, ChevronRight, Users, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

const stepIcon: Record<SequenceStep["type"], React.ReactNode> = {
  email: <Mail className="h-4 w-4" />,
  sms: <MessageSquare className="h-4 w-4" />,
  wait: <Clock className="h-4 w-4" />,
  task: <CheckSquare className="h-4 w-4" />,
};

const stepColor: Record<SequenceStep["type"], string> = {
  email: "bg-primary/15 text-primary",
  sms: "bg-purple-500/15 text-purple-400",
  wait: "bg-muted text-muted-foreground",
  task: "bg-warning/15 text-warning",
};

const stepLabel: Record<SequenceStep["type"], string> = {
  email: "Send Email",
  sms: "Send SMS",
  wait: "Wait",
  task: "Create Task",
};

function SequenceCard({ sequence }: { sequence: Sequence }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-border bg-card overflow-hidden"
    >
      <div className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <button onClick={() => setExpanded(!expanded)} className="mt-1 text-muted-foreground hover:text-foreground">
              {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </button>
            <div>
              <h3 className="font-heading text-base font-semibold">{sequence.name}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Trigger: {sequence.trigger}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {sequence.enrolled} enrolled</span>
              <span className="flex items-center gap-1"><BarChart3 className="h-3.5 w-3.5" /> {sequence.completed} completed</span>
            </div>
            <Switch checked={sequence.active} />
          </div>
        </div>

        {/* Step count summary */}
        <div className="flex items-center gap-2 mt-3 ml-7">
          {sequence.steps.map((step, i) => (
            <div key={step.id} className="flex items-center gap-1">
              <div className={`flex h-6 w-6 items-center justify-center rounded-full ${stepColor[step.type]}`}>
                {stepIcon[step.type]}
              </div>
              {i < sequence.steps.length - 1 && <div className="w-4 h-px bg-border" />}
            </div>
          ))}
          <span className="text-xs text-muted-foreground ml-2">{sequence.steps.length} steps</span>
        </div>
      </div>

      {/* Expanded steps */}
      {expanded && (
        <div className="border-t border-border px-5 py-4 bg-background/50">
          <div className="space-y-3">
            {sequence.steps.map((step, i) => (
              <div key={step.id} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${stepColor[step.type]}`}>
                    {stepIcon[step.type]}
                  </div>
                  {i < sequence.steps.length - 1 && <div className="w-px flex-1 bg-border mt-1" />}
                </div>
                <div className="flex-1 pb-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{stepLabel[step.type]}</span>
                    <span className="text-xs text-muted-foreground">{step.delay}</span>
                  </div>
                  {step.subject && <p className="text-xs text-muted-foreground mt-0.5">Subject: {step.subject}</p>}
                  {step.content && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{step.content}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

export default function Sequences() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold">Automation Sequences</h1>
          <p className="text-sm text-muted-foreground">Automated follow-up workflows triggered by pipeline changes.</p>
        </div>
        <Button className="bg-gradient-sky text-primary-foreground font-medium glow-sky-sm">
          <Plus className="h-4 w-4 mr-1" /> New Sequence
        </Button>
      </div>

      <div className="space-y-4">
        {MOCK_SEQUENCES.map(seq => (
          <SequenceCard key={seq.id} sequence={seq} />
        ))}
      </div>
    </div>
  );
}
