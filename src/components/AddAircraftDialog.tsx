import { useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { toast } from "sonner";

const schema = z.object({
  tail_number: z.string().trim().min(2).max(10),
  icao24: z.string().trim().regex(/^[0-9a-fA-F]{6}$/, "ICAO24 must be 6 hex chars"),
  model: z.string().trim().min(1).max(100),
  type: z.string().max(50).optional(),
  year: z.number().int().min(1930).max(2100).optional(),
  hourly_rate: z.number().min(0).max(10000),
  hobbs_hours: z.number().min(0).max(100000),
  next_maintenance_hours: z.number().min(0).max(100000),
  based_at: z.string().max(10).optional(),
});

export function AddAircraftDialog({ onCreated }: { onCreated: () => void }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    tail_number: "",
    icao24: "",
    model: "",
    type: "Single Engine",
    year: new Date().getFullYear(),
    hourly_rate: 150,
    hobbs_hours: 0,
    next_maintenance_hours: 100,
    based_at: "",
  });

  const update = (k: keyof typeof form, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async () => {
    if (!user) return;
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message);
      return;
    }
    setBusy(true);
    const { error } = await supabase.from("aircraft").insert({
      ...parsed.data,
      icao24: parsed.data.icao24.toLowerCase(),
      user_id: user.id,
    });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(`Added ${form.tail_number}`);
    setOpen(false);
    setForm({ ...form, tail_number: "", icao24: "", model: "" });
    onCreated();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2"><Plus className="h-4 w-4" /> Add Aircraft</Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Aircraft</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Tail Number" value={form.tail_number} onChange={(v) => update("tail_number", v.toUpperCase())} placeholder="N12345" />
          <Field label="ICAO24 Hex" value={form.icao24} onChange={(v) => update("icao24", v)} placeholder="a1b2c3" />
          <div className="col-span-2">
            <Field label="Model" value={form.model} onChange={(v) => update("model", v)} placeholder="Cessna 172 Skyhawk" />
          </div>
          <div>
            <Label>Type</Label>
            <Select value={form.type} onValueChange={(v) => update("type", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Single Engine">Single Engine</SelectItem>
                <SelectItem value="Multi Engine">Multi Engine</SelectItem>
                <SelectItem value="Helicopter">Helicopter</SelectItem>
                <SelectItem value="Jet">Jet</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Field label="Year" type="number" value={String(form.year)} onChange={(v) => update("year", Number(v))} />
          <Field label="Hourly Rate ($)" type="number" value={String(form.hourly_rate)} onChange={(v) => update("hourly_rate", Number(v))} />
          <Field label="Based At (ICAO)" value={form.based_at} onChange={(v) => update("based_at", v.toUpperCase())} placeholder="KPAO" />
          <Field label="Hobbs Hours" type="number" value={String(form.hobbs_hours)} onChange={(v) => update("hobbs_hours", Number(v))} />
          <Field label="Next Maint. Hours" type="number" value={String(form.next_maintenance_hours)} onChange={(v) => update("next_maintenance_hours", Number(v))} />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={submit} disabled={busy}>{busy ? "Saving..." : "Add Aircraft"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, value, onChange, type = "text", placeholder }: { label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string }) {
  return (
    <div>
      <Label>{label}</Label>
      <Input type={type} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}
