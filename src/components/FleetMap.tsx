import { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Aircraft } from "@/lib/mock-data";

// Inline SVG plane icon, rotated by heading. Color reflects status.
function planeIcon(heading: number, color: string) {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='32' height='32' style='transform: rotate(${heading}deg); transform-origin: center; filter: drop-shadow(0 2px 3px rgba(0,0,0,0.5));'>
    <path fill='${color}' stroke='white' stroke-width='0.8' d='M12 2 L14 10 L22 12 L22 14 L14 13 L13 20 L16 21 L16 22 L12 21 L8 22 L8 21 L11 20 L10 13 L2 14 L2 12 L10 10 Z'/>
  </svg>`;
  return L.divIcon({
    html: svg,
    className: "plane-marker",
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
}

function airportIcon() {
  return L.divIcon({
    html: `<div style="width:10px;height:10px;border-radius:50%;background:hsl(205 100% 55%);border:2px solid white;box-shadow:0 0 0 2px hsl(205 100% 55% / .3);"></div>`,
    className: "",
    iconSize: [10, 10],
    iconAnchor: [5, 5],
  });
}

const STATUS_COLOR: Record<string, string> = {
  in_flight: "hsl(160 84% 45%)",
  grounded: "hsl(215 20% 55%)",
  maintenance: "hsl(38 92% 50%)",
  reserved: "hsl(270 60% 60%)",
};

function FitBounds({ aircraft }: { aircraft: Aircraft[] }) {
  const map = useMap();
  useEffect(() => {
    if (!aircraft.length) return;
    const bounds = L.latLngBounds(aircraft.map((a) => [a.lat, a.lng] as [number, number]));
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 11 });
  }, [aircraft, map]);
  return null;
}

interface FleetMapProps {
  aircraft: Aircraft[];
  selectedId?: string | null;
  onSelect?: (id: string) => void;
}

export function FleetMap({ aircraft, selectedId, onSelect }: FleetMapProps) {
  const center = useMemo<[number, number]>(() => [37.46, -122.12], []);

  return (
    <div className="relative h-full w-full overflow-hidden rounded-xl border border-border">
      <MapContainer center={center} zoom={10} className="h-full w-full" style={{ background: "hsl(222 47% 9%)" }}>
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        {/* Home base marker */}
        <Marker position={[37.4611, -122.115]} icon={airportIcon()}>
          <Popup>KPAO — Palo Alto Airport (Home Base)</Popup>
        </Marker>
        <FitBounds aircraft={aircraft} />
        {aircraft.map((a) => (
          <Marker
            key={a.id}
            position={[a.lat, a.lng]}
            icon={planeIcon(a.heading, STATUS_COLOR[a.status])}
            eventHandlers={{ click: () => onSelect?.(a.id) }}
          >
            <Popup>
              <div className="space-y-1 text-xs">
                <div className="font-bold text-sm">{a.tailNumber}</div>
                <div className="text-muted-foreground">{a.model}</div>
                {a.status === "in_flight" ? (
                  <>
                    <div>{a.origin} → {a.destination}</div>
                    <div>ALT {a.altitude.toLocaleString()} ft · {a.speed} kts · HDG {a.heading}°</div>
                    {a.pilot && <div>Pilot: {a.pilot}</div>}
                  </>
                ) : (
                  <div className="capitalize">Status: {a.status.replace("_", " ")}</div>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
