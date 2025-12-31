type Handler = (event: any) => Promise<{ statusCode: number; headers?: Record<string, string>; body: string }>;

export const handler: Handler = async () => {
  try {
    const url = String(
      process.env.SUPABASE_URL ||
      process.env.VITE_SUPABASE_URL ||
      process.env.NEXT_PUBLIC_SUPABASE_URL ||
      ''
    );
    const anon = String(
      process.env.SUPABASE_ANON_KEY ||
      process.env.VITE_SUPABASE_ANON_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      ''
    );
    const hasAnon = anon.length > 0;
    const host = (() => {
      try {
        const u = new URL(url);
        return u.host;
      } catch {
        return '';
      }
    })();
    const isJwt = anon.includes('.') && anon.split('.').length === 3;
    const isPublishable = anon.startsWith('sb_');
    const serviceKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.SUPABASE_SECRET_KEY ||
      '';
    let connectOk = false;
    let status = 0;
    if (url && hasAnon) {
      try {
        const headers: Record<string, string> = { apikey: anon };
        if (isJwt && !isPublishable) {
          headers.Authorization = `Bearer ${anon}`;
        }
        const r = await fetch(`${url}/rest/v1/empresas?select=id&limit=1`, { headers });
        status = r.status;
        connectOk = r.ok;
      } catch {}
      if (!connectOk && serviceKey) {
        try {
          const headers: Record<string, string> = { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` };
          const r2 = await fetch(`${url}/rest/v1/empresas?select=id&limit=1`, { headers });
          status = r2.status;
          connectOk = r2.ok;
        } catch {}
      }
    }
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ host, hasAnon, connectOk, status }),
    };
  } catch {
    return { statusCode: 500, body: JSON.stringify({ ok: false }) };
  }
};
