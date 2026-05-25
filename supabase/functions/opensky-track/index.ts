// Live aircraft tracking via AeroDataBox (RapidAPI)
// Free tier: 150 requests/month — enough for a small fleet.
// Docs: https://rapidapi.com/aedbx-aedbx/api/aerodatabox
 
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
 
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
 
  const rapidApiKey = Deno.env.get("RAPIDAPI_KEY");
  if (!rapidApiKey) {
    return new Response(JSON.stringify({ error: "RAPIDAPI_KEY secret not set" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
 
  try {
    const { icao24 } = await req.json();
 
    if (!icao24 || !Array.isArray(icao24) || icao24.length === 0) {
      return new Response(JSON.stringify({ error: "icao24 array required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
 
    // Fetch each aircraft in parallel
    const results = await Promise.allSettled(
      icao24.map(async (code: string) => {
        const url = `https://aerodatabox.p.rapidapi.com/flights/icao24/${code.toLowerCase()}?withAircraftImage=false&withLocation=true`;
        const resp = await fetch(url, {
          headers: {
            "X-RapidAPI-Key": rapidApiKey,
            "X-RapidAPI-Host": "aerodatabox.p.rapidapi.com",
          },
        });
 
        if (resp.status === 404) return null; // aircraft not found / on ground
        if (!resp.ok) throw new Error(`AeroDataBox ${resp.status} for ${code}`);
 
        const flights = await resp.json();
        // API returns array of recent/active flights
        const active = Array.isArray(flights)
          ? flights.find((f: any) => f.status === "EnRoute" || f.status === "Approaching")
          : null;
 
        if (!active) return null;
 
        const loc = active.location ?? {};
        return {
          icao24: code.toLowerCase(),
          callsign: active.callSign ?? active.number ?? null,
          lat: loc.lat ?? null,
          lng: loc.lon ?? null,
          altitude: loc.pressureAltFt ?? loc.geometricAltFt ?? null,
          onGround: active.status === "OnGround",
          speed: loc.groundSpeedKt ?? null,
          heading: loc.heading ?? 0,
          squawk: loc.squawk ?? null,
          origin: active.departure?.airport?.icao ?? null,
          destination: active.arrival?.airport?.icao ?? null,
          status: active.status,
        };
      })
    );
 
    const contacts = results
      .map((r) => (r.status === "fulfilled" ? r.value : null))
      .filter((c): c is NonNullable<typeof c> => c !== null && c.lat !== null);
 
    return new Response(JSON.stringify({ contacts, total: contacts.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
 
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
