// Live aircraft tracking via AeroDataBox (RapidAPI)
// Docs: https://rapidapi.com/aedbx-aedbx/api/aerodatabox
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const rapidApiKey = Deno.env.get("RAPIDAPI_KEY") ?? Deno.env.get("RapidAPIKey");
  if (!rapidApiKey) {
    return new Response(JSON.stringify({ error: "RAPIDAPI_KEY secret not set" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
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
        const url = `https://aerodatabox.p.rapidapi.com/flights/icao24/${hex}?withAircraftImage=false&withLocation=true`;
        const resp = await fetch(url, {
          headers: {
            "X-RapidAPI-Key": rapidApiKey,
            "X-RapidAPI-Host": "aerodatabox.p.rapidapi.com",
          },
        });

        if (resp.status === 404) return null;
        if (!resp.ok) {
          console.error(`AeroDataBox ${resp.status} for ${hex}: ${await resp.text()}`);
          return null;
        }

        const flights = await resp.json();
        const active = Array.isArray(flights)
          ? flights.find((f: any) =>
              ["EnRoute", "Approaching", "Departing", "OnGround"].includes(f.status)
            ) ?? flights[0]
          : null;

        if (!active) return null;
        const loc = active.location ?? {};
        if (typeof loc.lat !== "number" || typeof loc.lon !== "number") return null;

        return {
          icao24: hex,
          callsign: active.callSign ?? active.number ?? null,
          lat: loc.lat,
          lng: loc.lon,
          altitude: loc.pressureAltFt ?? loc.geometricAltFt ?? null,
          onGround: active.status === "OnGround",
          speed: loc.groundSpeedKt ?? null,
          heading: loc.heading ?? 0,
          squawk: loc.squawk ?? null,
          origin: active.departure?.airport?.icao ?? null,
          destination: active.arrival?.airport?.icao ?? null,
          status: active.status ?? null,
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
