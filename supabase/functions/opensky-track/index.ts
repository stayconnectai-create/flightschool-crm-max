// Live aircraft tracking via adsb.fi (free, no API key)
// Docs: https://github.com/adsblol/api  (adsb.fi mirrors the same API)
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { icao24 } = await req.json();
    if (!Array.isArray(icao24) || icao24.length === 0) {
      return new Response(JSON.stringify({ error: "icao24 array required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const results = await Promise.allSettled(
      icao24.map(async (code: string) => {
        const hex = String(code).toLowerCase().trim();
        // adsb.fi public API — find aircraft by ICAO24 hex
        const url = `https://opendata.adsb.fi/api/v2/hex/${hex}`;
        const resp = await fetch(url, {
          headers: { "User-Agent": "skylead-fleet-tracker/1.0" },
        });
        if (!resp.ok) {
          console.error(`adsb.fi ${resp.status} for ${hex}`);
          return null;
        }
        const data = await resp.json();
        const ac = Array.isArray(data?.ac) && data.ac.length ? data.ac[0] : null;
        if (!ac || typeof ac.lat !== "number" || typeof ac.lon !== "number") {
          return null;
        }
        return {
          icao24: hex,
          callsign: (ac.flight ?? "").trim() || null,
          lat: ac.lat,
          lng: ac.lon,
          altitude: typeof ac.alt_baro === "number" ? ac.alt_baro : (ac.alt_geom ?? null),
          onGround: ac.alt_baro === "ground",
          speed: ac.gs ?? null,
          heading: ac.track ?? ac.true_heading ?? 0,
          squawk: ac.squawk ?? null,
          origin: null,
          destination: null,
        };
      })
    );

    const contacts = results
      .map((r) => (r.status === "fulfilled" ? r.value : null))
      .filter((c): c is NonNullable<typeof c> => c !== null);

    return new Response(JSON.stringify({ contacts, total: contacts.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("opensky-track error:", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
