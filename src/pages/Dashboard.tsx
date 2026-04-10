import { motion } from "framer-motion";
import { Users, UserPlus, GraduationCap, TrendingUp, DollarSign, Clock } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { STATS, MOCK_LEADS, PIPELINE_STAGES } from "@/lib/mock-data";
import { LeadStatusBadge } from "@/components/LeadStatusBadge";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const pipelineData = PIPELINE_STAGES.filter(s => s.key !== "lost").map(stage => ({
  name: stage.label,
  count: MOCK_LEADS.filter(l => l.status === stage.key).length,
}));

const sourceData = [
  { name: "Website", value: 35 },
  { name: "Google Ads", value: 25 },
  { name: "Referral", value: 20 },
  { name: "Social Media", value: 15 },
  { name: "Walk-in", value: 5 },
];

const COLORS = [
  "hsl(205, 100%, 55%)",
  "hsl(205, 100%, 65%)",
  "hsl(160, 84%, 39%)",
  "hsl(38, 92%, 50%)",
  "hsl(270, 60%, 55%)",
];

export default function Dashboard() {
  const recentLeads = MOCK_LEADS.slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Welcome back! Here's your flight school overview.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard title="Total Leads" value={STATS.totalLeads} change="+12 this week" changeType="positive" icon={Users} />
        <StatCard title="New This Week" value={STATS.newThisWeek} change="+3 vs last week" changeType="positive" icon={UserPlus} />
        <StatCard title="Enrolled (Month)" value={STATS.enrolledThisMonth} change="+2 vs last month" changeType="positive" icon={GraduationCap} />
        <StatCard title="Conversion Rate" value={`${STATS.conversionRate}%`} change="+1.2% improvement" changeType="positive" icon={TrendingUp} />
        <StatCard title="Pipeline Value" value={`$${(STATS.pipelineValue / 1000).toFixed(0)}k`} icon={DollarSign} />
        <StatCard title="Avg Response" value={STATS.avgResponseTime} change="Under target" changeType="positive" icon={Clock} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pipeline chart */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="col-span-2 rounded-xl border border-border bg-card p-5">
          <h2 className="font-heading text-base font-semibold mb-4">Pipeline Overview</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={pipelineData}>
              <XAxis dataKey="name" tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "hsl(222, 47%, 9%)", border: "1px solid hsl(222, 30%, 16%)", borderRadius: 8, color: "hsl(210, 40%, 96%)" }} />
              <Bar dataKey="count" fill="hsl(205, 100%, 55%)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Source breakdown */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="rounded-xl border border-border bg-card p-5">
          <h2 className="font-heading text-base font-semibold mb-4">Lead Sources</h2>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={sourceData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" stroke="none">
                {sourceData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: "hsl(222, 47%, 9%)", border: "1px solid hsl(222, 30%, 16%)", borderRadius: 8, color: "hsl(210, 40%, 96%)" }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-2 space-y-1">
            {sourceData.map((s, i) => (
              <div key={s.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full" style={{ background: COLORS[i] }} />
                  <span className="text-muted-foreground">{s.name}</span>
                </div>
                <span className="font-medium text-foreground">{s.value}%</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Recent leads */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="rounded-xl border border-border bg-card">
        <div className="p-5 pb-3">
          <h2 className="font-heading text-base font-semibold">Recent Leads</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="px-5 py-3 text-left font-medium">Name</th>
                <th className="px-5 py-3 text-left font-medium">Program</th>
                <th className="px-5 py-3 text-left font-medium">Source</th>
                <th className="px-5 py-3 text-left font-medium">Status</th>
                <th className="px-5 py-3 text-left font-medium">Assigned</th>
                <th className="px-5 py-3 text-right font-medium">Value</th>
              </tr>
            </thead>
            <tbody>
              {recentLeads.map(lead => (
                <tr key={lead.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="px-5 py-3 font-medium">{lead.firstName} {lead.lastName}</td>
                  <td className="px-5 py-3 text-muted-foreground">{lead.program}</td>
                  <td className="px-5 py-3 text-muted-foreground">{lead.source}</td>
                  <td className="px-5 py-3"><LeadStatusBadge status={lead.status} /></td>
                  <td className="px-5 py-3 text-muted-foreground">{lead.assignedTo}</td>
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
