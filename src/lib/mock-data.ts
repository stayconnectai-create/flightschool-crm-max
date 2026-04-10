export type LeadStatus = "new" | "contacted" | "discovery" | "tour_scheduled" | "tour_completed" | "enrolled" | "lost";

export interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  source: string;
  status: LeadStatus;
  program: string;
  assignedTo: string;
  createdAt: string;
  lastContact: string;
  notes: string;
  value: number;
}

export const PIPELINE_STAGES: { key: LeadStatus; label: string; color: string }[] = [
  { key: "new", label: "New Lead", color: "bg-primary" },
  { key: "contacted", label: "Contacted", color: "bg-sky-glow" },
  { key: "discovery", label: "Discovery Call", color: "bg-warning" },
  { key: "tour_scheduled", label: "Tour Scheduled", color: "bg-purple-500" },
  { key: "tour_completed", label: "Tour Completed", color: "bg-orange-500" },
  { key: "enrolled", label: "Enrolled", color: "bg-success" },
  { key: "lost", label: "Lost", color: "bg-destructive" },
];

export const MOCK_LEADS: Lead[] = [
  { id: "1", firstName: "James", lastName: "Mitchell", email: "james.m@email.com", phone: "(555) 123-4567", source: "Website", status: "new", program: "Private Pilot (PPL)", assignedTo: "Sarah K.", createdAt: "2026-04-08", lastContact: "2026-04-08", notes: "Interested in weekend classes", value: 12000 },
  { id: "2", firstName: "Emily", lastName: "Chen", email: "emily.chen@email.com", phone: "(555) 234-5678", source: "Google Ads", status: "contacted", program: "Instrument Rating (IR)", assignedTo: "Mike R.", createdAt: "2026-04-05", lastContact: "2026-04-09", notes: "Has 60 hours logged already", value: 8500 },
  { id: "3", firstName: "Carlos", lastName: "Rivera", email: "c.rivera@email.com", phone: "(555) 345-6789", source: "Referral", status: "discovery", program: "Commercial Pilot (CPL)", assignedTo: "Sarah K.", createdAt: "2026-04-01", lastContact: "2026-04-07", notes: "Referred by current student", value: 35000 },
  { id: "4", firstName: "Aisha", lastName: "Patel", email: "aisha.p@email.com", phone: "(555) 456-7890", source: "Facebook", status: "tour_scheduled", program: "Private Pilot (PPL)", assignedTo: "Tom B.", createdAt: "2026-03-28", lastContact: "2026-04-06", notes: "Tour on April 12th at 10am", value: 12000 },
  { id: "5", firstName: "David", lastName: "Thompson", email: "d.thompson@email.com", phone: "(555) 567-8901", source: "Walk-in", status: "tour_completed", program: "Multi-Engine Rating", assignedTo: "Mike R.", createdAt: "2026-03-20", lastContact: "2026-04-04", notes: "Very impressed with fleet", value: 6000 },
  { id: "6", firstName: "Sofia", lastName: "Nakamura", email: "sofia.n@email.com", phone: "(555) 678-9012", source: "Instagram", status: "enrolled", program: "Private Pilot (PPL)", assignedTo: "Sarah K.", createdAt: "2026-03-15", lastContact: "2026-04-01", notes: "Starting April 15th", value: 12000 },
  { id: "7", firstName: "Marcus", lastName: "Johnson", email: "m.johnson@email.com", phone: "(555) 789-0123", source: "Website", status: "new", program: "ATP", assignedTo: "Tom B.", createdAt: "2026-04-09", lastContact: "2026-04-09", notes: "Career changer, very motivated", value: 50000 },
  { id: "8", firstName: "Lena", lastName: "Kowalski", email: "lena.k@email.com", phone: "(555) 890-1234", source: "Google Ads", status: "contacted", program: "Private Pilot (PPL)", assignedTo: "Sarah K.", createdAt: "2026-04-06", lastContact: "2026-04-08", notes: "Wants financing info", value: 12000 },
  { id: "9", firstName: "Ryan", lastName: "O'Brien", email: "ryan.ob@email.com", phone: "(555) 901-2345", source: "Referral", status: "lost", program: "Instrument Rating (IR)", assignedTo: "Mike R.", createdAt: "2026-02-15", lastContact: "2026-03-10", notes: "Chose competitor school", value: 8500 },
  { id: "10", firstName: "Priya", lastName: "Sharma", email: "priya.s@email.com", phone: "(555) 012-3456", source: "Aviation Expo", status: "discovery", program: "Commercial Pilot (CPL)", assignedTo: "Tom B.", createdAt: "2026-04-02", lastContact: "2026-04-08", notes: "Met at Sun-n-Fun expo", value: 35000 },
  { id: "11", firstName: "Tyler", lastName: "Brooks", email: "tyler.b@email.com", phone: "(555) 111-2222", source: "YouTube", status: "new", program: "Private Pilot (PPL)", assignedTo: "Sarah K.", createdAt: "2026-04-10", lastContact: "2026-04-10", notes: "Saw our YouTube channel", value: 12000 },
  { id: "12", firstName: "Hannah", lastName: "Kim", email: "hannah.k@email.com", phone: "(555) 333-4444", source: "Website", status: "enrolled", program: "Instrument Rating (IR)", assignedTo: "Mike R.", createdAt: "2026-03-01", lastContact: "2026-03-28", notes: "Already flying, needs IR", value: 8500 },
];

export const STATS = {
  totalLeads: 147,
  newThisWeek: 12,
  enrolledThisMonth: 8,
  conversionRate: 23,
  pipelineValue: 284500,
  avgResponseTime: "2.4h",
};
