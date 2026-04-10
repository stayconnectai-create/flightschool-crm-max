import { useState } from "react";
import { motion } from "framer-motion";
import { MOCK_FORMS, IntakeForm } from "@/lib/mock-data";
import { Plus, Copy, ExternalLink, FileText, BarChart3, Check, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

function FormCard({ form }: { form: IntakeForm }) {
  const [copied, setCopied] = useState(false);

  const copyEmbed = () => {
    navigator.clipboard.writeText(form.embedCode);
    setCopied(true);
    toast.success("Embed code copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-border bg-card overflow-hidden"
    >
      <div className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-heading text-base font-semibold">{form.name}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{form.program}</p>
            </div>
          </div>
          <Switch checked={form.active} />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="rounded-lg bg-background border border-border p-3 text-center">
            <p className="text-lg font-heading font-bold text-foreground">{form.submissions}</p>
            <p className="text-xs text-muted-foreground">Submissions</p>
          </div>
          <div className="rounded-lg bg-background border border-border p-3 text-center">
            <p className="text-lg font-heading font-bold text-primary">{form.conversionRate}%</p>
            <p className="text-xs text-muted-foreground">Conversion</p>
          </div>
          <div className="rounded-lg bg-background border border-border p-3 text-center">
            <p className="text-lg font-heading font-bold text-foreground">{form.fields.length}</p>
            <p className="text-xs text-muted-foreground">Fields</p>
          </div>
        </div>

        {/* Fields preview */}
        <div className="mt-4">
          <p className="text-xs text-muted-foreground mb-2">Fields</p>
          <div className="flex flex-wrap gap-1.5">
            {form.fields.map(field => (
              <span key={field} className="inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 text-xs text-secondary-foreground">
                {field}
              </span>
            ))}
          </div>
        </div>

        {/* Embed code */}
        <div className="mt-4">
          <p className="text-xs text-muted-foreground mb-2">Embed Code</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 rounded-lg bg-background border border-border px-3 py-2 text-xs text-muted-foreground font-mono truncate">
              {form.embedCode}
            </code>
            <Button size="sm" variant="secondary" onClick={copyEmbed}>
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            </Button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-4">
          <Button size="sm" variant="secondary" className="flex-1">
            <Eye className="h-3.5 w-3.5 mr-1" /> Preview
          </Button>
          <Button size="sm" variant="secondary" className="flex-1">
            <ExternalLink className="h-3.5 w-3.5 mr-1" /> Edit Form
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

export default function IntakeForms() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold">Intake Forms</h1>
          <p className="text-sm text-muted-foreground">Smart lead capture forms with auto-pipeline assignment.</p>
        </div>
        <Button className="bg-gradient-sky text-primary-foreground font-medium glow-sky-sm">
          <Plus className="h-4 w-4 mr-1" /> New Form
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {MOCK_FORMS.map(form => (
          <FormCard key={form.id} form={form} />
        ))}
      </div>
    </div>
  );
}
