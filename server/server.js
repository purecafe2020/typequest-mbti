import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 8000;
const PAYPAL_ENV = process.env.PAYPAL_ENV || 'sandbox';
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID || '';
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET || '';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:8080';

const PAYPAL_BASE =
  PAYPAL_ENV === 'live'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com';

// ============ 简易订单存储（写 TMPDIR，跨实例不持久 —— MVP 级别） ============
const TMP = process.env.TMPDIR || process.env.TMP || '/tmp';
const DB_FILE = path.join(TMP, 'typequest-db.json');
function loadDB() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      fs.mkdirSync(TMP, { recursive: true });
      fs.writeFileSync(DB_FILE, JSON.stringify({ orders: [], subscriptions: [] }, null, 2));
    }
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
  } catch (e) {
    console.warn('DB read error, returning empty:', e.message);
    return { orders: [], subscriptions: [] };
  }
}
function saveDB(db) {
  try {
    fs.mkdirSync(TMP, { recursive: true });
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
  } catch (e) {
    console.warn('DB write error:', e.message);
  }
}

// ============ PayPal Access Token ============
let cachedToken = null;
async function getPaypalToken() {
  if (cachedToken && Date.now() < cachedToken.expiresAt) return cachedToken.value;

  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64');
  const res = await fetch(`${PAYPAL_BASE}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`PayPal token error: ${res.status} ${err}`);
  }
  const data = await res.json();
  cachedToken = {
    value: data.access_token,
    expiresAt: Date.now() + (data.expires_in - 60) * 1000, // 提前 60s 刷新
  };
  return cachedToken.value;
}

// ============ 1. 创建一次性订单（$4.99） ============
app.post('/api/create-order', async (req, res) => {
  try {
    const { typeId } = req.body; // 用户的 MBTI 类型，记录一下

    const token = await getPaypalToken();
    const order = {
      intent: 'CAPTURE',
      purchase_units: [
        {
          reference_id: `tq_${Date.now()}`,
          description: 'TypeQuest Premium Personality Report — Full 16-page analysis',
          custom_id: typeId || '',
          amount: {
            currency_code: 'USD',
            value: '4.99',
          },
        },
      ],
      application_context: {
        brand_name: 'TypeQuest',
        landing_page: 'BILLING',
        user_action: 'PAY_NOW',
        return_url: `${FRONTEND_URL}/?paid=true&type=report`,
        cancel_url: `${FRONTEND_URL}/?cancelled=true`,
      },
    };

    const paypalRes = await fetch(`${PAYPAL_BASE}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'PayPal-Request-Id': `${order.purchase_units[0].reference_id}-${Math.random()}`,
      },
      body: JSON.stringify(order),
    });

    if (!paypalRes.ok) {
      const err = await paypalRes.text();
      throw new Error(`PayPal create order failed: ${paypalRes.status} ${err}`);
    }
    const data = await paypalRes.json();

    // 存一下
    const db = loadDB();
    db.orders.push({
      order_id: data.id,
      status: data.status,
      type_id: typeId || null,
      amount: '4.99',
      created_at: new Date().toISOString(),
    });
    saveDB(db);

    res.json({ orderId: data.id });
  } catch (err) {
    console.error('create-order error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ============ 2. 捕获一次性订单（前端 capture 后调此接口验证） ============
app.post('/api/capture-order', async (req, res) => {
  try {
    const { orderId } = req.body;
    if (!orderId) return res.status(400).json({ error: 'orderId required' });

    const token = await getPaypalToken();
    const paypalRes = await fetch(`${PAYPAL_BASE}/v2/checkout/orders/${orderId}/capture`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!paypalRes.ok) {
      const err = await paypalRes.text();
      return res.status(400).json({ error: `PayPal capture failed: ${err}` });
    }
    const data = await paypalRes.json();

    // 更新订单状态
    const db = loadDB();
    const order = db.orders.find(o => o.order_id === orderId);
    if (order) {
      order.status = data.status;
      order.payer_email = data.payer?.email_address;
      order.captured_at = new Date().toISOString();
    }
    saveDB(db);

    res.json({
      success: true,
      status: data.status,
      orderId: data.id,
    });
  } catch (err) {
    console.error('capture-order error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ============ 3. 创建订阅（$3.99/月） ============
// 注：生产环境需先在 PayPal 后台创建 Product + Plan，这里动态创建
let cachedPlanId = null;

async function ensureSubscriptionPlan(token) {
  if (cachedPlanId) return cachedPlanId;

  // 1. 创建 Product
  const productRes = await fetch(`${PAYPAL_BASE}/v1/catalogs/products`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: 'TypeQuest Premium Membership',
      description: 'Monthly subscription — full reports, daily insights, type matching',
      type: 'SERVICE',
      category: 'SOFTWARE',
    }),
  });

  if (!productRes.ok) throw new Error('Create product failed: ' + (await productRes.text()));
  const product = await productRes.json();

  // 2. 创建 Plan
  const planRes = await fetch(`${PAYPAL_BASE}/v1/billing/plans`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      product_id: product.id,
      name: 'TypeQuest Premium Monthly',
      description: 'Full personality reports, daily insights, type compatibility matching',
      billing_cycles: [
        {
          frequency: { interval_unit: 'MONTH', interval_count: 1 },
          tenure_type: 'REGULAR',
          sequence: 1,
          total_cycles: 0,
          pricing_scheme: {
            fixed_price: { value: '3.99', currency_code: 'USD' },
          },
        },
      ],
      payment_preferences: {
        auto_bill_outstanding: true,
        setup_fee_failure_action: 'CONTINUE',
        payment_failure_threshold: 3,
      },
    }),
  });

  if (!planRes.ok) throw new Error('Create plan failed: ' + (await planRes.text()));
  const plan = await planRes.json();

  cachedPlanId = plan.id;
  return plan.id;
}

app.post('/api/create-subscription', async (req, res) => {
  try {
    const token = await getPaypalToken();
    const planId = await ensureSubscriptionPlan(token);

    const subRes = await fetch(`${PAYPAL_BASE}/v1/billing/subscriptions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        plan_id: planId,
        subscriber: {},
        application_context: {
          brand_name: 'TypeQuest',
          user_action: 'SUBSCRIBE_NOW',
          return_url: `${FRONTEND_URL}/?subscribed=true`,
          cancel_url: `${FRONTEND_URL}/?cancelled=true`,
        },
      }),
    });

    if (!subRes.ok) throw new Error('Create subscription failed: ' + (await subRes.text()));
    const data = await subRes.json();

    // 存一下
    const db = loadDB();
    db.subscriptions.push({
      subscription_id: data.id,
      plan_id: planId,
      status: data.status,
      created_at: new Date().toISOString(),
    });
    saveDB(db);

    res.json({
      subscriptionId: data.id,
      approvalUrl: data.links.find(l => l.rel === 'approve')?.href,
    });
  } catch (err) {
    console.error('create-sub error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ============ 4. 检查订阅状态 ============
app.post('/api/check-subscription', async (req, res) => {
  try {
    const { subscriptionId } = req.body;
    if (!subscriptionId) return res.status(400).json({ error: 'subscriptionId required' });

    const token = await getPaypalToken();
    const paypalRes = await fetch(`${PAYPAL_BASE}/v1/billing/subscriptions/${subscriptionId}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });

    if (!paypalRes.ok) return res.status(400).json({ error: 'Not found' });
    const data = await paypalRes.json();

    const db = loadDB();
    const sub = db.subscriptions.find(s => s.subscription_id === subscriptionId);
    if (sub) {
      sub.status = data.status;
      sub.subscriber_email = data.subscriber?.email_address;
      sub.last_checked = new Date().toISOString();
      saveDB(db);
    }

    res.json({
      active: data.status === 'ACTIVE',
      status: data.status,
      subscriptionId: data.id,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============ 5. Public Config（前端 PayPal JS SDK 需要 CLIENT_ID） ============
app.get('/api/config', (req, res) => {
  res.json({
    paypal_client_id: PAYPAL_CLIENT_ID || '',
    paypal_env: PAYPAL_ENV,
  });
});

// ============ 6. Health Check ============
app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    paypal_env: PAYPAL_ENV,
    client_id_configured: !!PAYPAL_CLIENT_ID,
    client_secret_configured: !!PAYPAL_CLIENT_SECRET,
  });
});

// ============ 启动 ============
app.listen(PORT, () => {
  console.log(`\n🚀 TypeQuest API running on http://localhost:${PORT}`);
  console.log(`   PayPal env: ${PAYPAL_ENV}`);
  console.log(`   Frontend:   ${FRONTEND_URL}`);
  console.log(`   Demo order: POST /api/create-order  →  一次性 $4.99`);
  console.log(`   Demo sub:   POST /api/create-subscription  →  订阅 $3.99/月\n`);
});
