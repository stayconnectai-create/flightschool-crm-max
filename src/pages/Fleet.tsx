import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Plane, Radio, Wrench, Calendar, Plus, Gauge, MapPin, RefreshCw } from "lucide-react";
import { FleetMap } from "@/components/FleetMap";
import { StatCard } from "@/components/StatCard";
import { MOCK_AIRCRAFT, Aircraft, AircraftStatus } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const statusMeta: Record<AircraftStatus, { label: string; className: string; dot: string }> = {
  in_flight: { label: "In Flight", className: "bg-success/15 text-success border-success/30", dot: "bg-success animate-pulse" },
  grounded: { label: "Available", className: "bg-muted text-muted-foreground border-border", dot: "bg-muted-foreground" },
  reserved: { label: "Reserved", className: "bg-purple-500/15 text-purple-400 border-purple-500/30", dot: "bg-purple-400" },
  maintenance: { label: "Maintenance", className: "bg-warning/15 text-warning border-warning/30", dot: "bg-warning" },
};

interface OpenSkyState {
  icao24: string;
  callsign: string | null;
  lat: number;
  lng: number;
  altitude: number | null;
  speed: number | null;
  heading: number;
  onGround: boolean;
  squawk: string | null;
}

export default function Fleet() {
  const [aircraft, setAircraft] = useState<Aircraft[]>(MOCK_AIRCRAFT);
  const [selectedId, setSelectedId] = useState<string | null>(MOCK_AIRCRAFT[0]?.id ?? null);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [syncing, setSyncing] = useState(false);

  const fetchLive = async () => {
    setSyncing(true);
    try {
      const { data, error } = await supabase.functions.invoke("opensky-track", {
        body: { icao24: MOCK_AIRCRAFT.map((a) => a.icao24) },
      });
      if (error) throw error;
      const states: OpenSkyState[] = data?.states ?? [];
      setAircraft((prev) =>
        prev.map((a) => {
          const live = states.find((s) => s.icao24.toLowerCase() === a.icao24.toLowerCase());
          if (!live) return a;
          return {
            ...a,
            status: live.onGround ? a.status : "in_flight",
            lat: live.lat,
            lng: live.lng,
            altitude: live.altitude ?? a.altitude,
            speed: live.speed ?? a.speed,
            heading: live.heading,
            squawk: live.squawk ?? a.squawk,
          };
        }),
      );
      setLastSync(new Date());
      if (states.length === 0) {
        toast.info("No live ADS-B contacts for this fleet right now (demo aircraft may not be airborne).");
      } else {
        toast.success(`Live update: ${states.length} aircraft tracked via OpenSky`);
      }
    } catch (e) {
      toast.error("Could not reach OpenSky. Showing last known positions.");
    } finally {
      setSyncing(false);
    }
  };

  // Initial fetch + auto-refresh every 30s
  useEffect(() => {
    fetchLive();
    const id = setInterval(fetchLive, 30_000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const counts = useMemo(() => {
    return {
      total: aircraft.length,
      flying: aircraft.filter((a) => a.status === "in_flight").length,
      available: aircraft.filter((a) => a.status === "grounded").length,
      maintenance: aircraft.filter((a) => a.status === "maintenance").length,
    };
  }, [aircraft]);

  const selected = aircraft.find((a) => a.id === selectedId);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold">Fleet & Live Tracking</h1>
          <p className="text-sm text-muted-foreground">
            Real-time positions via OpenSky Network ADS-B
            {lastSync && <span className="ml-2 text-xs">· last sync {lastSync.toLocaleTimeString()}</span>}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={fetchLive} disabled={syncing}>
            <RefreshCw className={cn("h-4 w-4", syncing && "animate-spin")} /> Sync
          </Button>
          <Button className="gap-2">
            <Plus className="h-4 w-4" /> Add Aircraft
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Fleet Size" value={counts.total} icon={Plane} />
        <StatCard title="Airborne Now" value={counts.flying} change="Live" changeType="positive" icon={Radio} />
        <StatCard title="Available" value={counts.available} icon={Calendar} />
        <StatCard title="In Maintenance" value={counts.maintenance} icon={Wrench} />
      </div>

      {/* Map + Side panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="lg:col-span-2 h-[520px]">
          <FleetMap aircraft={aircraft} selectedId={selectedId} onSelect={setSelectedId} />
        </motion.div>

        <div className="rounded-xl border border-border bg-card overflow-hidden flex flex-col h-[520px]">
          <div className="p-4 border-b border-border">
            <h2 className="font-heading text-sm font-semibold flex items-center gap-2">
              <Radio className="h-4 w-4 text-success" /> Live Aircraft
            </h2>
          </div>
          <div className="overflow-y-auto flex-1 divide-y divide-border">
            {aircraft.map((a) => {
              const meta = statusMeta[a.status];
              return (
                <button
                  key={a.id}
                  onClick={() => setSelectedId(a.id)}
                  className={cn(
                    "w-full text-left p-4 hover:bg-muted/40 transition-colors",
                    selectedId === a.id && "bg-primary/5 border-l-2 border-l-primary",
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className={cn("h-2 w-2 rounded-full", meta.dot)} />
                      <span className="font-mono font-semibold text-sm">{a.tailNumber}</span>
                    </div>
                    <Badge variant="outline" className={cn("text-[10px]", meta.className)}>
                      {meta.label}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">{a.model}</div>
                  {a.status === "in_flight" && (
                    <div className="text-[11px] text-muted-foreground mt-2 flex items-center gap-3">
                      <span>{a.origin} → {a.destination}</span>
                      <span>{a.altitude.toLocaleString()}ft</span>
                      <span>{a.speed}kt</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Selected detail */}
      {selected && (
        <motion.div
          key={selected.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-border bg-card p-5"
        >
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-3">
                <h3 className="font-heading text-lg font-bold font-mono">{selected.tailNumber}</h3>
                <Badge variant="outline" className={statusMeta[selected.status].className}>
                  {statusMeta[selected.status].label}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{selected.year} {selected.model} · {selected.type}</p>
            </div>
            <div className="text-right">
              <div className="text-xs text-muted-foreground">Hourly Rate</div>
              <div className="font-heading text-lg font-bold">${selected.hourlyRate}/hr</div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <DetailItem icon={Gauge} label="Hobbs Hours" value={selected.hobbsHours.toLocaleString()} />
            <DetailItem icon={Wrench} label="Next Maint." value={`${(selected.nextMaintenanceHours - selected.hobbsHours)}h left`} />
            <DetailItem icon={MapPin} label="Based At" value={selected.basedAt} />
            <DetailItem icon={Plane} label="Pilot" value={selected.pilot ?? "—"} />
          </div>

          {selected.status === "in_flight" && (
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-border">
              <DetailItem label="Altitude" value={`${selected.altitude.toLocaleString()} ft`} />
              <DetailItem label="Ground Speed" value={`${selected.speed} kts`} />
              <DetailItem label="Heading" value={`${selected.heading}°`} />
              <DetailItem label="Squawk" value={selected.squawk ?? "—"} />
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}

function DetailItem({ icon: Icon, label, value }: { icon?: any; label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground flex items-center gap-1.5">
        {Icon && <Icon className="h-3 w-3" />} {label}
      </div>
      <div className="text-sm font-medium mt-0.5">{value}</div>
    </div>
  );
}
