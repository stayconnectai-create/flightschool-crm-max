import { useState } from "react";
import { motion } from "framer-motion";
import { MOCK_LEADS, Lead, LeadStatus } from "@/lib/mock-data";
import { LeadStatusBadge } from "@/components/LeadStatusBadge";
import { Search, Filter, Plus, Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Leads() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<LeadStatus | "all">("all");

  const filtered = MOCK_LEADS.filter(l => {
    const matchesSearch = `${l.firstName} ${l.lastName} ${l.email} ${l.program}`.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || l.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statuses: (LeadStatus | "all")[] = ["all", "new", "contacted", "discovery", "tour_scheduled", "tour_completed", "enrolled", "lost"];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold">Leads</h1>
          <p className="text-sm text-muted-foreground">{filtered.length} leads found</p>
        </div>
        <Button className="bg-gradient-sky text-primary-foreground font-medium glow-sky-sm">
          <Plus className="h-4 w-4 mr-1" /> Add Lead
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, program..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 bg-secondary border-none"
          />
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {statuses.map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                statusFilter === s ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-muted"
              }`}
            >
              {s === "all" ? "All" : s.replace("_", " ").replace(/\b\w/g, c => c.toUpperCase())}
            </button>
          ))}
        </div>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="px-5 py-3 text-left font-medium">Name</th>
                <th className="px-5 py-3 text-left font-medium">Contact</th>
                <th className="px-5 py-3 text-left font-medium">Program</th>
                <th className="px-5 py-3 text-left font-medium">Source</th>
                <th className="px-5 py-3 text-left font-medium">Status</th>
                <th className="px-5 py-3 text-left font-medium">Assigned</th>
                <th className="px-5 py-3 text-left font-medium">Last Contact</th>
                <th className="px-5 py-3 text-right font-medium">Value</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(lead => (
                <tr key={lead.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors cursor-pointer">
                  <td className="px-5 py-3">
                    <div className="font-medium">{lead.firstName} {lead.lastName}</div>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <a href={`mailto:${lead.email}`} className="text-muted-foreground hover:text-primary">
                        <Mail className="h-3.5 w-3.5" />
                      </a>
                      <a href={`tel:${lead.phone}`} className="text-muted-foreground hover:text-primary">
                        <Phone className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">{lead.program}</td>
                  <td className="px-5 py-3 text-muted-foreground">{lead.source}</td>
                  <td className="px-5 py-3"><LeadStatusBadge status={lead.status} /></td>
                  <td className="px-5 py-3 text-muted-foreground">{lead.assignedTo}</td>
                  <td className="px-5 py-3 text-muted-foreground">{lead.lastContact}</td>
                  <td className="px-5 py-3 text-right font-medium">${lead.value.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
