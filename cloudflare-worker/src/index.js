// =============================================================
// TypeQuest API — Cloudflare Worker
// Replaces Express backend (Railway) with zero-cors edge API
// =============================================================

// ------- PayPal Config (from Worker env vars) -------
function getPaypalBase(env) {
  return env.PAYPAL_ENV === 'live'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com';
}

// ------- Helpers -------
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'content-type',
  'Content-Type': 'application/json',
};

function json(data, init = {}) {
  return new Response(JSON.stringify(data), {
    headers: CORS_HEADERS,
    ...init,
  });
}

async function readBody(req) {
  try { return await req.json(); } catch { return {}; }
}

// ------- PayPal Token (with KV cache) -------
async function getPaypalToken(env) {
  const kv = env.KV;
  const cached = await kv?.get('paypal_token');
  if (cached) {
    const parsed = JSON.parse(cached);
    if (parsed.expiresAt > Date.now()) return parsed.value;
  }

  const auth = btoa(`${env.PAYPAL_CLIENT_ID}:${env.PAYPAL_CLIENT_SECRET}`);
  const res = await fetch(`${getPaypalBase(env)}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  if (!res.ok) throw new Error(`PayPal token error: ${res.status} ${await res.text()}`);
  const data = await res.json();
  const token = {
    value: data.access_token,
    expiresAt: Date.now() + (data.expires_in - 60) * 1000,
  };
  await kv?.put('paypal_token', JSON.stringify(token), { expirationTtl: Math.floor(data.expires_in / 2) });
  return token.value;
}

// ------- Routing -------
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    // CORS preflight
    if (method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS, status: 204 });
    }

    try {
      // 1. Health
      if (path === '/api/health' && method === 'GET') {
        return json({
          ok: true,
          paypal_env: env.PAYPAL_ENV || 'sandbox',
          client_id_configured: !!(env.PAYPAL_CLIENT_ID && env.PAYPAL_CLIENT_ID.length),
          client_secret_configured: !!(env.PAYPAL_CLIENT_SECRET && env.PAYPAL_CLIENT_SECRET.length),
        });
      }

      // 2. Public Config
      if (path === '/api/config' && method === 'GET') {
        return json({
          paypal_client_id: env.PAYPAL_CLIENT_ID || '',
          paypal_env: env.PAYPAL_ENV || 'sandbox',
        });
      }

      // 3. Create Order ($4.99)
      if (path === '/api/create-order' && method === 'POST') {
        const { typeId } = await readBody(request);
        const token = await getPaypalToken(env);
        const orderId = `tq_${Date.now()}`;

        const paypalRes = await fetch(`${getPaypalBase(env)}/v2/checkout/orders`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'PayPal-Request-Id': `${orderId}-${Math.random()}`,
          },
          body: JSON.stringify({
            intent: 'CAPTURE',
            purchase_units: [{
              reference_id: orderId,
              description: 'TypeQuest Premium Personality Report — Full 16-page analysis',
              custom_id: typeId || '',
              amount: { currency_code: 'USD', value: '4.99' },
            }],
            application_context: {
              brand_name: 'TypeQuest',
              landing_page: 'BILLING',
              user_action: 'PAY_NOW',
              return_url: `${env.FRONTEND_URL || 'https://mbti.879879.xyz'}/?paid=true&type=report`,
              cancel_url: `${env.FRONTEND_URL || 'https://mbti.879879.xyz'}/?cancelled=true`,
            },
          }),
        });

        if (!paypalRes.ok) {
          return json({ error: `PayPal create failed: ${paypalRes.status} ${await paypalRes.text()}` }, { status: 500 });
        }
        const data = await paypalRes.json();

        // Save to KV
        const existing = JSON.parse(await env.KV.get('orders') || '[]');
        existing.push({
          order_id: data.id,
          status: data.status,
          type_id: typeId || null,
          amount: '4.99',
          created_at: new Date().toISOString(),
        });
        await env.KV.put('orders', JSON.stringify(existing));

        return json({ orderId: data.id });
      }

      // 4. Capture Order
      if (path === '/api/capture-order' && method === 'POST') {
        const { orderId } = await readBody(request);
        if (!orderId) return json({ error: 'orderId required' }, { status: 400 });

        const token = await getPaypalToken(env);
        const paypalRes = await fetch(`${getPaypalBase(env)}/v2/checkout/orders/${orderId}/capture`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!paypalRes.ok) {
          return json({ error: `PayPal capture failed: ${paypalRes.status} ${await paypalRes.text()}` }, { status: 400 });
        }
        const data = await paypalRes.json();

        // Update KV
        const existing = JSON.parse(await env.KV.get('orders') || '[]');
        const order = existing.find(o => o.order_id === orderId);
        if (order) {
          order.status = data.status;
          order.payer_email = data.payer?.email_address;
          order.captured_at = new Date().toISOString();
          await env.KV.put('orders', JSON.stringify(existing));
        }

        return json({ success: true, status: data.status, orderId: data.id });
      }

      // 404
      return json({ error: 'Not found' }, { status: 404 });

    } catch (err) {
      return json({ error: err.message }, { status: 500 });
    }
  },
};
