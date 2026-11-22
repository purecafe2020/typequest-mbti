/* =============================================================
   TYPEQUEST — APP LOGIC  (with PayPal Premium)
   ============================================================= */

// ===== CONFIG =====
// Production: deployed API
const API_BASE = 'https://37l8et8gad2jweco7ov.traesite.cn';

const state = {
  current: 0,
  answers: {},
  currentType: null,    // 当前用户的 MBTI 类型
  premiumUnlocked: false,
};

const $ = (id) => document.getElementById(id);

/* ---------- Page switching ---------- */
function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  $(id).classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ---------- Start test ---------- */
function startTest() {
  state.current = 0;
  state.answers = {};
  state.premiumUnlocked = false;
  showPage('test');
  renderQuestion();
  updateProgress();
}

/* ---------- Render question ---------- */
function renderQuestion() {
  const q = QUESTIONS[state.current];
  $('currentNum').textContent = state.current + 1;
  $('totalNum').textContent = QUESTIONS.length;
  $('questionText').textContent = q.text;

  const wrap = $('optionsWrap');
  wrap.innerHTML = '';
  q.options.forEach(opt => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.textContent = opt.label;
    if (state.answers[q.id] === opt.value) btn.classList.add('selected');
    btn.addEventListener('click', () => selectOption(q.id, opt.value));
    wrap.appendChild(btn);
  });

  // Reset fade animation
  const card = $('questionCard');
  card.style.animation = 'none';
  card.offsetHeight;
  card.style.animation = '';

  $('btnPrev').style.visibility = state.current === 0 ? 'hidden' : 'visible';
  $('btnNext').textContent = state.current === QUESTIONS.length - 1 ? 'See Results ✨' : 'Next →';
  $('btnNext').disabled = !state.answers[q.id];
  $('btnNext').style.opacity = state.answers[q.id] ? '1' : '0.5';
}

/* ---------- Select option ---------- */
function selectOption(qid, value) {
  state.answers[qid] = value;
  const e = window.event;
  document.querySelectorAll('.option-btn').forEach(b => b.classList.remove('selected'));
  if (e && e.currentTarget) e.currentTarget.classList.add('selected');
  updateProgress();
  $('btnNext').disabled = false;
  $('btnNext').style.opacity = '1';
}

/* ---------- Progress bar ---------- */
function updateProgress() {
  const answered = Object.keys(state.answers).length;
  const pct = (answered / QUESTIONS.length) * 100;
  $('progressFill').style.width = pct + '%';
}

/* ---------- Nav ---------- */
function nextQuestion() {
  if (!state.answers[QUESTIONS[state.current].id]) return;
  if (state.current < QUESTIONS.length - 1) {
    state.current++;
    renderQuestion();
  } else {
    showLoadingAndResult();
  }
}
function prevQuestion() {
  if (state.current > 0) {
    state.current--;
    renderQuestion();
  }
}

/* ---------- Compute & show result ---------- */
function showLoadingAndResult() {
  showPage('loading');
  setTimeout(() => {
    const { type, breakdown } = computeResult();
    state.currentType = type;
    checkPremiumStatus();
    renderResult(type, breakdown);
    showPage('result');
    // 尝试加载 PayPal Smart Buttons
    initPayPalButtons(type);
  }, 1400);
}

function computeResult() {
  const scores = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };
  QUESTIONS.forEach(q => {
    const ans = state.answers[q.id];
    if (ans) scores[ans]++;
  });
  const breakdown = {
    EI: scores.E / (scores.E + scores.I) * 100,
    SN: scores.S / (scores.S + scores.N) * 100,
    TF: scores.T / (scores.T + scores.F) * 100,
    JP: scores.J / (scores.J + scores.P) * 100,
  };
  const type =
    (breakdown.EI >= 50 ? 'E' : 'I') +
    (breakdown.SN >= 50 ? 'S' : 'N') +
    (breakdown.TF >= 50 ? 'T' : 'F') +
    (breakdown.JP >= 50 ? 'J' : 'P');
  return { type, breakdown };
}

function checkPremiumStatus() {
  // 1. 检查 localStorage 标记
  if (localStorage.getItem('tq_premium') === 'true') {
    state.premiumUnlocked = true;
  }
  // 2. 检查 URL 参数（PayPal 付款成功后回跳带的）
  const params = new URLSearchParams(location.search);
  if (params.get('paid') === 'true' || params.get('subscribed') === 'true') {
    state.premiumUnlocked = true;
    localStorage.setItem('tq_premium', 'true');
    // 清理 URL
    history.replaceState({}, '', location.pathname);
  }
}

function renderResult(type, breakdown) {
  const p = TYPES[type];
  if (!p) return;

  $('resultType').textContent = type;
  $('resultName').textContent = p.name;
  $('resultTagline').textContent = p.tagline;

  // Dimensions
  const dims = [
    { key: 'EI', left: 'Introversion', right: 'Extraversion', pct: breakdown.EI },
    { key: 'SN', left: 'Intuition',    right: 'Sensing',     pct: breakdown.SN },
    { key: 'TF', left: 'Feeling',      right: 'Thinking',    pct: breakdown.TF },
    { key: 'JP', left: 'Perceiving',   right: 'Judging',     pct: breakdown.JP },
  ];
  const wrap = $('dimensionsWrap');
  wrap.innerHTML = '';
  dims.forEach(d => {
    const row = document.createElement('div');
    row.className = 'dim-row';
    row.innerHTML = `
      <div class="dim-label">
        <span class="dim-l">${d.left}</span>
        <span class="dim-r">${d.right}</span>
      </div>
      <div class="dim-bar">
        <div class="dim-marker" id="mk-${d.key}" style="left:${d.pct}%"></div>
      </div>`;
    wrap.appendChild(row);
  });

  // Free content
  $('strengthsList').innerHTML = p.strengths.map(s => `<li>${s}</li>`).join('');
  $('weaknessesList').innerHTML = p.weaknesses.map(w => `<li>${w}</li>`).join('');

  // Premium content
  $('careersList').innerHTML = p.careers.map(c => `<li>${c}</li>`).join('');
  $('relationshipText').textContent = p.relationship;

  // 生成 Growth Roadmap（从类型的 weaknesses 引申）
  const roadmap = p.weaknesses.slice(0, 3).map(w => `Work on "${w}" — journal 3 small wins this week`);
  $('roadmapList').innerHTML = roadmap.map(r => `<li>${r}</li>`).join('');

  // 付费墙显示/隐藏
  if (state.premiumUnlocked) {
    $('premiumLocked').style.display = 'none';
    $('premiumContent').style.display = 'block';
  } else {
    $('premiumLocked').style.display = 'block';
    $('premiumContent').style.display = 'none';
  }
}

/* ---------- PayPal Smart Buttons ---------- */
let paypalLoaded = false;

async function initPayPalButtons(type) {
  // 已解锁就跳过
  if (state.premiumUnlocked) return;

  try {
    // 1. 从后端拿 PayPal client_id
    const configRes = await fetch(`${API_BASE}/api/config`);
    if (!configRes.ok) throw new Error('Backend not available');
    const { paypal_client_id, paypal_env } = await configRes.json();

    if (!paypal_client_id) {
      showPayPalHint('PayPal 未配置。请在 server/.env 中设置 PAYPAL_CLIENT_ID');
      return;
    }

    // 2. 动态加载 PayPal JS SDK
    await loadPayPalSDK(paypal_client_id);
    paypalLoaded = true;

    // 3. 渲染 Smart Buttons
    renderPayPalButtons(type);
  } catch (err) {
    console.warn('PayPal init failed:', err.message);
    showPayPalHint('支付服务暂不可用（请确保后端已启动：npm run dev）');
  }
}

function loadPayPalSDK(clientId) {
  return new Promise((resolve, reject) => {
    if (window.paypal) return resolve();
    const script = document.createElement('script');
    script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD&intent=capture&components=buttons&disable-funding=card`;
    script.async = true;
    script.onload = resolve;
    script.onerror = () => reject(new Error('PayPal SDK load failed'));
    document.head.appendChild(script);
  });
}

function renderPayPalButtons(type) {
  const container = $('paypal-button-container');
  if (!container || !window.paypal) return;
  container.innerHTML = '';

  // 一次性购买（$4.99）
  window.paypal.Buttons({
    style: { layout: 'vertical', color: 'gold', shape: 'rect', label: 'pay' },

    createOrder: async () => {
      const res = await fetch(`${API_BASE}/api/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ typeId: type }),
      });
      if (!res.ok) throw new Error('Create order failed');
      const { orderId } = await res.json();
      return orderId;
    },

    onApprove: async (data) => {
      // 后端验证 capture
      const res = await fetch(`${API_BASE}/api/capture-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: data.orderID }),
      });
      const result = await res.json();
      if (result.success) {
        unlockPremium();
      } else {
        alert('Payment verification failed. Please contact support.');
      }
    },

    onError: (err) => {
      console.error('PayPal error:', err);
      alert('PayPal encountered an error. Please try again.');
    },
  }).render('#paypal-button-container');
}

function unlockPremium() {
  state.premiumUnlocked = true;
  localStorage.setItem('tq_premium', 'true');
  $('premiumLocked').style.display = 'none';
  $('premiumContent').style.display = 'block';
  window.scrollTo({ top: document.querySelector('.premium-content').offsetTop - 60, behavior: 'smooth' });
}

function showPayPalHint(msg) {
  const container = $('paypal-button-container');
  if (container) {
    container.innerHTML = `<div style="text-align:center;padding:16px;color:#6b6e8a;font-size:13px;border:1px dashed #22224a;border-radius:12px;">${msg}</div>`;
  }
}

/* ---------- Share ---------- */
function shareResult() {
  const type = $('resultType').textContent;
  const name = $('resultName').textContent;
  const text = `I'm ${type} — ${name}! Take the TypeQuest personality test to find your type too. ✦`;
  if (navigator.share) {
    navigator.share({ title: 'TypeQuest Result', text, url: location.href }).catch(() => {});
  } else {
    navigator.clipboard.writeText(text + ' ' + location.href);
    alert('Result copied to clipboard! Paste anywhere to share.');
  }
}

/* ---------- Retake ---------- */
function retakeTest() {
  startTest();
}

/* ---------- Build 16 types grid ---------- */
function buildTypesGrid() {
  const grid = $('typesGrid');
  if (!grid) return;
  Object.entries(TYPES).forEach(([code, p]) => {
    const card = document.createElement('div');
    card.className = 'type-card';
    card.innerHTML = `<div class="code">${code}</div><div class="role">${p.name}</div>`;
    card.addEventListener('click', () => {
      alert(`${code} — ${p.name}\n\n${p.tagline}\n\n(Full profiles available after taking the test!)`);
    });
    grid.appendChild(card);
  });
}

/* ---------- Init ---------- */
buildTypesGrid();
