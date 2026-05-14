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

export interface Activity {
  id: string;
  leadId: string;
  type: "email" | "call" | "note" | "status_change" | "sms" | "tour";
  description: string;
  date: string;
  user: string;
}

export const MOCK_ACTIVITIES: Activity[] = [
  { id: "a1", leadId: "1", type: "note", description: "Lead submitted inquiry form on website", date: "2026-04-08 09:15", user: "System" },
  { id: "a2", leadId: "1", type: "email", description: "Sent welcome email with program brochure", date: "2026-04-08 10:30", user: "Sarah K." },
  { id: "a3", leadId: "2", type: "call", description: "Initial outreach call — left voicemail", date: "2026-04-06 14:00", user: "Mike R." },
  { id: "a4", leadId: "2", type: "call", description: "Connected! Discussed IR program details and schedule", date: "2026-04-09 11:00", user: "Mike R." },
  { id: "a5", leadId: "3", type: "note", description: "Referred by current student Alex Turner", date: "2026-04-01 08:00", user: "System" },
  { id: "a6", leadId: "3", type: "status_change", description: "Moved to Discovery Call stage", date: "2026-04-03 09:00", user: "Sarah K." },
  { id: "a7", leadId: "3", type: "call", description: "Discovery call completed. Very interested in CPL program.", date: "2026-04-07 15:30", user: "Sarah K." },
  { id: "a8", leadId: "4", type: "sms", description: "Sent tour confirmation text for April 12", date: "2026-04-06 16:00", user: "Tom B." },
  { id: "a9", leadId: "5", type: "tour", description: "Campus tour completed. Showed Cessna 172 fleet.", date: "2026-04-04 10:00", user: "Mike R." },
  { id: "a10", leadId: "6", type: "status_change", description: "Enrolled! Starting April 15th", date: "2026-04-01 12:00", user: "Sarah K." },
  { id: "a11", leadId: "7", type: "note", description: "Career changer from software engineering. Has simulator experience.", date: "2026-04-09 08:30", user: "Tom B." },
  { id: "a12", leadId: "8", type: "email", description: "Sent financing options and payment plan details", date: "2026-04-08 13:00", user: "Sarah K." },
];

export interface Sequence {
  id: string;
  name: string;
  trigger: string;
  steps: SequenceStep[];
  active: boolean;
  enrolled: number;
  completed: number;
}

export interface SequenceStep {
  id: string;
  type: "email" | "sms" | "wait" | "task";
  delay: string;
  subject?: string;
  content?: string;
}

export const MOCK_SEQUENCES: Sequence[] = [
  {
    id: "s1", name: "New Lead Welcome", trigger: "Lead enters 'New' stage", active: true, enrolled: 45, completed: 32,
    steps: [
      { id: "st1", type: "email", delay: "Immediately", subject: "Welcome to SkyLead Aviation!", content: "Hi {{first_name}}, thanks for your interest in flight training..." },
      { id: "st2", type: "wait", delay: "2 days" },
      { id: "st3", type: "sms", delay: "After wait", content: "Hi {{first_name}}! Did you get a chance to review our program info? Reply YES to schedule a call." },
      { id: "st4", type: "wait", delay: "3 days" },
      { id: "st5", type: "email", delay: "After wait", subject: "Your Flight Training Journey Starts Here", content: "Hi {{first_name}}, we'd love to help you take the first step..." },
      { id: "st6", type: "task", delay: "After wait", content: "Follow up call if no response" },
    ],
  },
  {
    id: "s2", name: "Post-Tour Follow Up", trigger: "Lead enters 'Tour Completed' stage", active: true, enrolled: 18, completed: 14,
    steps: [
      { id: "st7", type: "email", delay: "1 hour", subject: "Great meeting you today!", content: "Hi {{first_name}}, it was great showing you around today..." },
      { id: "st8", type: "wait", delay: "1 day" },
      { id: "st9", type: "sms", delay: "After wait", content: "Hi {{first_name}}! Any questions about what you saw on the tour? We're here to help!" },
      { id: "st10", type: "wait", delay: "5 days" },
      { id: "st11", type: "email", delay: "After wait", subject: "Ready to start flying?", content: "Hi {{first_name}}, just checking in..." },
    ],
  },
  {
    id: "s3", name: "Lost Lead Re-engagement", trigger: "Lead enters 'Lost' stage", active: false, enrolled: 12, completed: 5,
    steps: [
      { id: "st12", type: "wait", delay: "30 days" },
      { id: "st13", type: "email", delay: "After wait", subject: "Still dreaming of flying?", content: "Hi {{first_name}}, we noticed you explored flight training with us..." },
    ],
  },
];

export interface IntakeForm {
  id: string;
  name: string;
  fields: string[];
  submissions: number;
  conversionRate: number;
  active: boolean;
  embedCode: string;
  program: string;
}

export const MOCK_FORMS: IntakeForm[] = [
  { id: "f1", name: "General Inquiry Form", fields: ["First Name", "Last Name", "Email", "Phone", "Program Interest", "Experience Level"], submissions: 234, conversionRate: 28, active: true, embedCode: '<script src="https://skylead.app/forms/f1.js"></script>', program: "All Programs" },
  { id: "f2", name: "Discovery Flight Booking", fields: ["First Name", "Last Name", "Email", "Phone", "Preferred Date", "Questions"], submissions: 89, conversionRate: 65, active: true, embedCode: '<script src="https://skylead.app/forms/f2.js"></script>', program: "Discovery Flight" },
  { id: "f3", name: "PPL Enrollment Application", fields: ["First Name", "Last Name", "Email", "Phone", "Date of Birth", "Medical Certificate", "Flight Hours", "Availability", "Financing"], submissions: 42, conversionRate: 45, active: true, embedCode: '<script src="https://skylead.app/forms/f3.js"></script>', program: "Private Pilot (PPL)" },
  { id: "f4", name: "Career Pilot Program", fields: ["First Name", "Last Name", "Email", "Phone", "Education", "Career Goals", "Timeline", "Budget"], submissions: 15, conversionRate: 33, active: false, embedCode: '<script src="https://skylead.app/forms/f4.js"></script>', program: "ATP / Career" },
];

export type AircraftStatus = "in_flight" | "grounded" | "maintenance" | "reserved";

export interface Aircraft {
  id: string;
  tailNumber: string; // e.g. N12345
  icao24: string; // 24-bit ICAO transponder hex code (for OpenSky)
  model: string;
  year: number;
  type: "Single Engine" | "Multi Engine" | "Helicopter" | "Jet";
  status: AircraftStatus;
  hobbsHours: number;
  nextMaintenanceHours: number;
  basedAt: string; // ICAO
  hourlyRate: number;
  pilot?: string;
  // Default/last known position (used until live data arrives)
  lat: number;
  lng: number;
  altitude: number;
  speed: number;
  heading: number;
  origin?: string;
  destination?: string;
  squawk?: string;
}

// ICAO24 hex codes from real general aviation aircraft frequently visible on ADS-B.
// These are publicly broadcast identifiers.
export const MOCK_AIRCRAFT: Aircraft[] = [
  { id: "ac1", tailNumber: "N172SK", icao24: "a1b2c3", model: "Cessna 172 Skyhawk", year: 2019, type: "Single Engine", status: "in_flight", hobbsHours: 2840, nextMaintenanceHours: 2900, basedAt: "KPAO", hourlyRate: 165, pilot: "Sarah K. / J. Mitchell", lat: 37.45, lng: -122.12, altitude: 3500, speed: 110, heading: 270, origin: "KPAO", destination: "KHAF", squawk: "1200" },
  { id: "ac2", tailNumber: "N182SL", icao24: "a4d5e6", model: "Cessna 182 Skylane", year: 2020, type: "Single Engine", status: "in_flight", hobbsHours: 1920, nextMaintenanceHours: 2000, basedAt: "KPAO", hourlyRate: 215, pilot: "Mike R. / E. Chen", lat: 37.62, lng: -122.38, altitude: 5500, speed: 135, heading: 90, origin: "KSQL", destination: "KPAO", squawk: "4521" },
  { id: "ac3", tailNumber: "N455PA", icao24: "a7f8a9", model: "Piper Archer PA-28", year: 2018, type: "Single Engine", status: "in_flight", hobbsHours: 3210, nextMaintenanceHours: 3300, basedAt: "KSQL", hourlyRate: 175, pilot: "Tom B. / A. Patel", lat: 37.71, lng: -122.22, altitude: 2500, speed: 95, heading: 180, origin: "KSQL", destination: "KRHV", squawk: "1200" },
  { id: "ac4", tailNumber: "N700DA", icao24: "ab1c2d", model: "Diamond DA40", year: 2021, type: "Single Engine", status: "in_flight", hobbsHours: 1100, nextMaintenanceHours: 1200, basedAt: "KPAO", hourlyRate: 225, pilot: "Sarah K. / C. Rivera", lat: 37.36, lng: -121.93, altitude: 4500, speed: 130, heading: 45, origin: "KRHV", destination: "KPAO", squawk: "3344" },
  { id: "ac5", tailNumber: "N240SE", icao24: "ae3f40", model: "Beechcraft Baron 58", year: 2017, type: "Multi Engine", status: "grounded", hobbsHours: 4520, nextMaintenanceHours: 4600, basedAt: "KPAO", hourlyRate: 425, lat: 37.4611, lng: -122.115, altitude: 0, speed: 0, heading: 0 },
  { id: "ac6", tailNumber: "N99TX", icao24: "a51526", model: "Cirrus SR22", year: 2022, type: "Single Engine", status: "reserved", hobbsHours: 680, nextMaintenanceHours: 800, basedAt: "KPAO", hourlyRate: 295, lat: 37.4611, lng: -122.115, altitude: 0, speed: 0, heading: 0 },
  { id: "ac7", tailNumber: "N311MX", icao24: "a83748", model: "Piper Seminole PA-44", year: 2016, type: "Multi Engine", status: "maintenance", hobbsHours: 5210, nextMaintenanceHours: 5210, basedAt: "KPAO", hourlyRate: 385, lat: 37.4611, lng: -122.115, altitude: 0, speed: 0, heading: 0 },
  { id: "ac8", tailNumber: "N88RH", icao24: "ab596a", model: "Robinson R44", year: 2020, type: "Helicopter", status: "in_flight", hobbsHours: 1450, nextMaintenanceHours: 1500, basedAt: "KSQL", hourlyRate: 495, pilot: "Alex T.", lat: 37.55, lng: -122.30, altitude: 1500, speed: 75, heading: 315, origin: "KSQL", destination: "KOAK", squawk: "1200" },
];

export const STATS = {
  totalLeads: 147,
  newThisWeek: 12,
  enrolledThisMonth: 8,
  conversionRate: 23,
  pipelineValue: 284500,
  avgResponseTime: "2.4h",
};
