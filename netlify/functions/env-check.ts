type Handler = (event: any) => Promise<{ statusCode: number; headers?: Record<string, string>; body: string }>;

export const handler: Handler = async () => {
  try {
    const url = String(process.env.SUPABASE_URL || '');
    const anon = String(process.env.SUPABASE_ANON_KEY || '');
    const hasAnon = anon.length > 0;
    const host = (() => {
      try {
        const u = new URL(url);
        return u.host;
      } catch {
        return '';
      }
    })();
    let connectOk = false;
    let status = 0;
    if (url && hasAnon) {
      try {
        const r = await fetch(`${url}/rest/v1/empresas?select=id&limit=1`, { headers: { apikey: anon } });
        status = r.status;
        connectOk = r.ok;
      } catch {}
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

