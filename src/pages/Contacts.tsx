import { motion } from "framer-motion";
import { MOCK_LEADS } from "@/lib/mock-data";
import { Mail, Phone, MapPin } from "lucide-react";

export default function Contacts() {
  const enrolled = MOCK_LEADS.filter(l => l.status === "enrolled");
  const others = MOCK_LEADS.filter(l => l.status !== "enrolled");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">Contacts</h1>
        <p className="text-sm text-muted-foreground">All contacts from your lead pipeline.</p>
      </div>

      {enrolled.length > 0 && (
        <div>
          <h2 className="font-heading text-lg font-semibold mb-3">Enrolled Students</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {enrolled.map((lead, i) => (
              <motion.div
                key={lead.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="rounded-xl border border-border bg-card p-5 hover:border-primary/30 transition-colors"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 rounded-full bg-success/20 flex items-center justify-center text-sm font-bold text-success">
                    {lead.firstName[0]}{lead.lastName[0]}
                  </div>
                  <div>
                    <p className="font-medium">{lead.firstName} {lead.lastName}</p>
                    <p className="text-xs text-muted-foreground">{lead.program}</p>
                  </div>
                </div>
                <div className="space-y-1.5 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2"><Mail className="h-3.5 w-3.5" /> {lead.email}</div>
                  <div className="flex items-center gap-2"><Phone className="h-3.5 w-3.5" /> {lead.phone}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="font-heading text-lg font-semibold mb-3">All Prospects</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {others.map((lead, i) => (
            <motion.div
              key={lead.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-xl border border-border bg-card p-5 hover:border-primary/30 transition-colors"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-full bg-primary/15 flex items-center justify-center text-sm font-bold text-primary">
                  {lead.firstName[0]}{lead.lastName[0]}
                </div>
                <div>
                  <p className="font-medium">{lead.firstName} {lead.lastName}</p>
                  <p className="text-xs text-muted-foreground">{lead.program}</p>
                </div>
              </div>
              <div className="space-y-1.5 text-sm text-muted-foreground">
                <div className="flex items-center gap-2"><Mail className="h-3.5 w-3.5" /> {lead.email}</div>
                <div className="flex items-center gap-2"><Phone className="h-3.5 w-3.5" /> {lead.phone}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
