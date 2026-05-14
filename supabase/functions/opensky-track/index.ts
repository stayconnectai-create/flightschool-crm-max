// OpenSky Network live aircraft tracking proxy.
// Fetches real ADS-B positions for a list of ICAO24 hex codes.
// Docs: https://openskynetwork.github.io/opensky-api/rest.html

import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3";

const BodySchema = z.object({
  icao24: z.array(z.string().regex(/^[0-9a-fA-F]{6}$/)).min(1).max(100),
});

interface OpenSkyState {
  // [icao24, callsign, origin_country, time_position, last_contact, longitude, latitude,
  //  baro_altitude, on_ground, velocity, true_track, vertical_rate, sensors, geo_altitude,
  //  squawk, spi, position_source]
  0: string; 1: string | null; 2: string;
  3: number | null; 4: number;
  5: number | null; 6: number | null;
  7: number | null; 8: boolean;
  9: number | null; 10: number | null; 11: number | null;
  12: number[] | null; 13: number | null;
  14: string | null; 15: boolean; 16: number;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const parsed = BodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: parsed.error.flatten().fieldErrors }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const codes = parsed.data.icao24.map((c) => c.toLowerCase());
    const params = new URLSearchParams();
    codes.forEach((c) => params.append("icao24", c));

    // Optional credentials for higher rate limit (4000/day vs 100/day anonymous)
    const user = Deno.env.get("OPENSKY_USERNAME");
    const pass = Deno.env.get("OPENSKY_PASSWORD");
    const headers: HeadersInit = {};
    if (user && pass) {
      headers["Authorization"] = `Basic ${btoa(`${user}:${pass}`)}`;
    }

    const url = `https://opensky-network.org/api/states/all?${params.toString()}`;
    const resp = await fetch(url, { headers });

    if (!resp.ok) {
      const body = await resp.text();
      return new Response(
        JSON.stringify({ error: `OpenSky ${resp.status}`, detail: body.slice(0, 500) }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const data = await resp.json() as { time: number; states: OpenSkyState[] | null };
    const states = (data.states ?? []).map((s) => ({
      icao24: s[0],
      callsign: s[1]?.trim() || null,
      country: s[2],
      lng: s[5],
      lat: s[6],
      altitude: s[7] != null ? Math.round(s[7] * 3.28084) : null, // m → ft
      onGround: s[8],
      speed: s[9] != null ? Math.round(s[9] * 1.94384) : null, // m/s → kts
      heading: s[10] != null ? Math.round(s[10]) : 0,
      verticalRate: s[11] != null ? Math.round(s[11] * 196.85) : 0, // m/s → fpm
      squawk: s[14],
    })).filter((s) => s.lat != null && s.lng != null);

    return new Response(JSON.stringify({ time: data.time, states }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
