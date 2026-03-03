/* ── Config ──────────────────────────────────────────────────────────────── */
const API_BASE = 'https://mediflow-backend-z29j.onrender.com';

// Set USE_MOCK = true to run entirely without a real backend.
// All API calls are replaced by sample data below.
// To switch to a real backend: set USE_MOCK = false.
const USE_MOCK = true;

/* ── Mock Data ───────────────────────────────────────────────────────────── */
const now = Date.now();
const hoursAgo = h => new Date(now - h * 3600000).toISOString();
const daysAgo  = d => new Date(now - d * 86400000).toISOString();

const MOCK_DISPATCHES = [
  { id:'dsp-001', orderId:'ORD-2001', customerName:'Fatima Bello',      address:'14 Adeola Odeku St, Victoria Island, Lagos', status:'in_progress', items:'Amoxicillin 500mg ×2, Paracetamol ×3',                   amount:4500, createdAt:hoursAgo(1) },
  { id:'dsp-002', orderId:'ORD-2002', customerName:'Chukwuemeka Obi',   address:'7 Broad St, Lagos Island, Lagos',              status:'pending',     items:'Metformin 850mg ×1, Lisinopril 10mg ×1',               amount:3200, createdAt:hoursAgo(2) },
  { id:'dsp-003', orderId:'ORD-2003', customerName:'Ngozi Eze',         address:'22 Allen Ave, Ikeja, Lagos',                   status:'assigned',    items:'Vitamin C 1000mg ×6, Zinc ×2',                         amount:2800, createdAt:hoursAgo(3) },
  { id:'dsp-004', orderId:'ORD-1998', customerName:'Biodun Adeleke',    address:'5 Ogunlana Drive, Surulere, Lagos',            status:'delivered',   items:'Augmentin 625mg ×2, Omeprazole 20mg ×1',               amount:5100, createdAt:daysAgo(0) },
  { id:'dsp-005', orderId:'ORD-1990', customerName:'Amaka Okonkwo',     address:'88 Bode Thomas St, Surulere, Lagos',           status:'delivered',   items:'Ciprofloxacin 500mg ×2',                               amount:2200, createdAt:daysAgo(1) },
  { id:'dsp-006', orderId:'ORD-1985', customerName:'Tunde Fashola',     address:'3 Awolowo Rd, Ikoyi, Lagos',                   status:'delivered',   items:'Losartan 50mg ×1, Aspirin 100mg ×2, Atorvastatin ×1',  amount:6400, createdAt:daysAgo(2) },
  { id:'dsp-007', orderId:'ORD-1980', customerName:'Kemi Ayodele',      address:'31 Coker Rd, Ilupeju, Lagos',                  status:'cancelled',   items:'Fluconazole 150mg ×1',                                 amount:1800, createdAt:daysAgo(3) },
];

/* ── App State ───────────────────────────────────────────────────────────── */
const STORAGE_KEY = 'delivery_user';
let currentUser = null;
let dispatches   = [];
let isOnline     = false;
let activeTab    = 'home';   // 'home' | 'dispatches' | 'profile'
let homeSubTab   = 'income'; // 'income' | 'deliveries'
let resendTimer  = null;
let resendSecs   = 0;

/* ── Utilities ───────────────────────────────────────────────────────────── */
const $ = id => document.getElementById(id);
const fmt = n => '₦' + Number(n || 0).toLocaleString();
const isToday = iso => { if (!iso) return false; const d = new Date(iso), t = new Date(); return d.getFullYear()===t.getFullYear()&&d.getMonth()===t.getMonth()&&d.getDate()===t.getDate(); };
const fmtDate = iso => iso ? new Date(iso).toLocaleString('en-NG',{dateStyle:'medium',timeStyle:'short'}) : '';
const esc = s => String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

function showToast(msg, ms = 2400) {
  const t = $('toast'); t.textContent = msg; t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), ms);
}

/* ── LocalStorage ────────────────────────────────────────────────────────── */
function loadUser() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || null; } catch { return null; }
}
function saveUser(u) { currentUser = u; localStorage.setItem(STORAGE_KEY, JSON.stringify(u)); }
function clearUser() { currentUser = null; localStorage.removeItem(STORAGE_KEY); }

/* ── Screen Navigation ───────────────────────────────────────────────────── */
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
  const el = $(id); if (el) el.classList.remove('hidden');
}

/* ── API Helpers ─────────────────────────────────────────────────────────── */
async function apiFetch(path, opts = {}) {
  const res = await fetch(API_BASE + path, {
    headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
    ...opts,
  });
  if (!res.ok) { const txt = await res.text().catch(() => res.statusText); throw new Error(txt || `HTTP ${res.status}`); }
  return res.json();
}

async function apiSendOtp(phone) {
  if (USE_MOCK) return { message: 'OTP sent (mock mode)' };
  return apiFetch('/api/auth/send-otp', { method:'POST', body: JSON.stringify({ phone }) });
}

async function apiVerifyOtp(phone, otp) {
  if (USE_MOCK) {
    if (otp.length === 6) return { token:'mock-token', userId: phone };
    throw new Error('Enter any 6-digit code to log in (mock mode)');
  }
  return apiFetch('/api/auth/verify', { method:'POST', body: JSON.stringify({ phone, otp }) });
}

async function apiGetProfile(phone) {
  if (USE_MOCK) return { id:'mock-001', phone, name: currentUser?.name || '', isOnline };
  return apiFetch('/api/delivery/me', { method:'POST', body: JSON.stringify({ phone }) });
}

async function apiSetOnline(phone, online) {
  if (USE_MOCK) { isOnline = online; return { phone, isOnline: online }; }
  return apiFetch('/api/delivery/me/status', { method:'PUT', body: JSON.stringify({ phone, isOnline: online }) });
}

async function apiGetDispatches(phone) {
  if (USE_MOCK) return new Promise(r => setTimeout(() => r(MOCK_DISPATCHES.map(d => ({...d}))), 500));
  return apiFetch('/api/delivery/dispatch?assignedToDeliveryId=' + encodeURIComponent(phone));
}

async function apiUpdateStatus(id, status) {
  if (USE_MOCK) {
    const d = dispatches.find(x => x.id === id);
    if (d) d.status = status;
    return d || { id, status };
  }
  return apiFetch('/api/delivery/dispatch/' + encodeURIComponent(id) + '/status', { method:'PUT', body: JSON.stringify({ status }) });
}

/* ═══════════════════════════════════════════════════════════════════════════
   LOGIN FLOW
═══════════════════════════════════════════════════════════════════════════ */
function initLogin() {
  const phoneInput = $('login-phone');
  phoneInput.addEventListener('input', () => {
    phoneInput.value = phoneInput.value.replace(/\D/g,'').slice(0,10);
    $('btn-send-otp').disabled = phoneInput.value.length !== 10;
  });
  phoneInput.addEventListener('keydown', e => { if (e.key === 'Enter') sendOtp(); });
}

async function sendOtp() {
  const phone = $('login-phone').value.trim();
  if (phone.length !== 10) return showAlert('login-alert','Please enter a valid 10-digit number');
  hideAlert('login-alert');

  const btn = $('btn-send-otp');
  btn.disabled = true; btn.textContent = '⏳ Sending…';
  try {
    await apiSendOtp(phone);
    $('otp-hint').textContent = `OTP sent to ${phone}`;
    showScreen('screen-otp');
    focusOtp();
    startResendTimer();
  } catch(e) { showAlert('login-alert', e.message); }
  finally { btn.disabled = false; btn.textContent = 'Send OTP'; }
}

/* ── OTP boxes ── */
function initOtp() {
  const boxes = document.querySelectorAll('.otp-box');
  boxes.forEach((box, i) => {
    box.addEventListener('input', () => {
      box.value = box.value.replace(/\D/g,'').slice(0,1);
      if (box.value && i < boxes.length - 1) boxes[i+1].focus();
    });
    box.addEventListener('keydown', e => {
      if (e.key === 'Backspace' && !box.value && i > 0) boxes[i-1].focus();
      if (e.key === 'Enter') verifyOtp();
    });
    box.addEventListener('paste', e => {
      e.preventDefault();
      const digits = (e.clipboardData.getData('text').replace(/\D/g,'')).slice(0,6).split('');
      boxes.forEach((b,j) => { b.value = digits[j] || ''; });
      const last = Math.min(digits.length, boxes.length - 1);
      boxes[last].focus();
    });
  });
}

function focusOtp() { document.querySelector('.otp-box')?.focus(); }

function getOtpValue() {
  return [...document.querySelectorAll('.otp-box')].map(b => b.value).join('');
}

function clearOtp() { document.querySelectorAll('.otp-box').forEach(b => b.value = ''); }

async function verifyOtp() {
  const phone = $('login-phone').value.trim();
  const otp   = getOtpValue();
  if (otp.length < 6) return showAlert('otp-alert','Please enter the 6-digit OTP');
  hideAlert('otp-alert');

  const btn = $('btn-verify-otp');
  btn.disabled = true; btn.textContent = '⏳ Verifying…';
  try {
    await apiVerifyOtp(phone, otp);
    stopResendTimer();
    const saved = loadUser();
    const merged = { phone, ...(saved?.phone === phone ? saved : {}), phone };
    saveUser(merged);
    if (merged.profileComplete) {
      await bootApp();
    } else {
      $('setup-phone').value = phone;
      showScreen('screen-setup');
    }
  } catch(e) { showAlert('otp-alert', e.message); }
  finally { btn.disabled = false; btn.textContent = 'Verify OTP'; }
}

async function resendOtp() {
  const phone = $('login-phone').value.trim();
  try {
    await apiSendOtp(phone);
    clearOtp(); focusOtp();
    startResendTimer();
    showToast('OTP resent!');
  } catch(e) { showToast(e.message); }
}

function startResendTimer() {
  resendSecs = 60;
  const btn = $('btn-resend');
  btn.disabled = true;
  const tick = () => {
    $('resend-timer').textContent = `Resend OTP in ${resendSecs}s`;
    if (resendSecs <= 0) { btn.disabled = false; $('resend-timer').textContent = ''; clearInterval(resendTimer); return; }
    resendSecs--;
  };
  tick();
  resendTimer = setInterval(tick, 1000);
}

function stopResendTimer() { clearInterval(resendTimer); resendSecs = 0; }

/* ── Change phone → back to login ── */
function goBackToLogin() { stopResendTimer(); clearOtp(); showScreen('screen-login'); }

/* ═══════════════════════════════════════════════════════════════════════════
   PROFILE SETUP
═══════════════════════════════════════════════════════════════════════════ */
let selectedGender = '';

function selectGender(el, val) {
  document.querySelectorAll('#screen-setup .gender-chip').forEach(c => {
    c.classList.remove('selected'); c.setAttribute('aria-checked','false');
  });
  el.classList.add('selected'); el.setAttribute('aria-checked','true');
  selectedGender = val;
}

async function saveProfileSetup() {
  const name   = $('setup-name').value.trim();
  const age    = $('setup-age').value.trim();
  const phone  = $('setup-phone').value.trim();

  if (name.length < 2)   return showAlert('setup-alert','Please enter your full name');
  if (!age || +age < 18 || +age > 65) return showAlert('setup-alert','Please enter a valid age (18–65)');
  if (!selectedGender)   return showAlert('setup-alert','Please select your gender');
  hideAlert('setup-alert');

  const btn = $('btn-save-setup');
  btn.disabled = true; btn.textContent = '⏳ Saving…';
  try {
    await apiGetProfile(phone);
    const user = { ...loadUser(), phone, name, age: +age, gender: selectedGender, profileComplete: true };
    saveUser(user);
    await bootApp();
  } catch(e) { showAlert('setup-alert', e.message); }
  finally { btn.disabled = false; btn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Save & Continue'; }
}

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN APP BOOT
═══════════════════════════════════════════════════════════════════════════ */
async function bootApp() {
  const user = currentUser || loadUser();
  if (!user) { showScreen('screen-login'); return; }
  currentUser = user;
  showScreen('screen-app');
  renderHeader();
  // Initialize all tab display states correctly
  activeTab = 'home';
  ['home','dispatches','profile'].forEach(t => {
    const el = $('tab-' + t);
    if (el) el.style.display = (t === 'home') ? 'flex' : 'none';
  });
  const tabBar = $('home-tab-bar');
  if (tabBar) tabBar.style.display = 'flex';
  renderHome();
  fetchDispatches();
  // Restore online status from profile
  try {
    const profile = await apiGetProfile(user.phone);
    isOnline = profile?.isOnline ?? false;
    renderOnlineDot();
  } catch { /* best-effort */ }
}

/* ── Header ── */
function renderHeader() {
  const u = currentUser;
  $('h-greeting').textContent = greetingText();
  $('h-name').textContent     = u?.name  || 'Rider';
  $('h-phone').textContent    = u?.phone || '';
  renderOnlineDot();
}

function greetingText() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning,';
  if (h < 17) return 'Good afternoon,';
  return 'Good evening,';
}

function renderOnlineDot() {
  const dot   = $('online-dot');
  const label = $('online-label');
  if (isOnline) { dot.classList.add('active'); label.textContent = 'Online'; }
  else          { dot.classList.remove('active'); label.textContent = 'Offline'; }
}

async function toggleOnline() {
  if (!currentUser?.phone) return;
  const next = !isOnline;
  try {
    await apiSetOnline(currentUser.phone, next);
    isOnline = next; renderOnlineDot();
    showToast(next ? '🟢 You are now Online' : '⚫ You are now Offline');
  } catch(e) { showToast('Could not update status'); }
}

/* ── Bottom Nav ── */
function switchMainTab(tab) {
  activeTab = tab;

  // Nav items
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  $('nav-' + tab)?.classList.add('active');

  // Main tab panels — toggle display directly (inline style on divs)
  ['home','dispatches','profile'].forEach(t => {
    const el = $('tab-' + t);
    if (el) el.style.display = (t === tab) ? 'flex' : 'none';
  });

  // Show home sub-tab bar only on Home
  const tabBar = $('home-tab-bar');
  if (tabBar) tabBar.style.display = (tab === 'home') ? 'flex' : 'none';

  if (tab === 'home')       renderHome();
  if (tab === 'dispatches') renderDispatches();
  if (tab === 'profile')    renderProfileTab();
}

/* ═══════════════════════════════════════════════════════════════════════════
   DISPATCHES (fetch + render)
═══════════════════════════════════════════════════════════════════════════ */
async function fetchDispatches() {
  if (!currentUser?.phone) return;
  dispatches = [];
  try {
    const data = await apiGetDispatches(currentUser.phone);
    dispatches = Array.isArray(data) ? data : [];
  } catch { dispatches = []; }
  if (activeTab === 'home')       renderHome();
  if (activeTab === 'dispatches') renderDispatches();
}

async function refreshDispatches() {
  const btn = $('btn-refresh');
  if (btn) { btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>'; btn.disabled = true; }
  await fetchDispatches();
  if (btn) { btn.innerHTML = '<i class="fa-solid fa-rotate-right"></i>'; btn.disabled = false; }
}

async function updateStatus(id, status) {
  const btn = document.querySelector(`[data-dispatch="${id}"]`);
  if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>'; }
  try {
    const updated = await apiUpdateStatus(id, status);
    const idx = dispatches.findIndex(d => d.id === id);
    if (idx !== -1) dispatches[idx] = { ...dispatches[idx], ...updated };
    renderDispatches();
    renderHome();
    showToast('Status updated!');
  } catch(e) { showToast(e.message); }
}

/* ── Status helpers ── */
function badgeClass(status) {
  const map = { pending:'badge-pending', assigned:'badge-assigned', in_progress:'badge-in_progress', delivered:'badge-delivered', cancelled:'badge-cancelled' };
  return 'badge ' + (map[(status||'').toLowerCase().replace(/\s+/g,'_')] || 'badge-pending');
}

function statusLabel(s) { return (s || 'pending').replace(/_/g,' '); }

function actionButtons(d) {
  const s   = (d.status||'').toLowerCase();
  const id  = esc(d.id);
  if (s === 'pending')
    return `<button class="action-btn action-accept" data-dispatch="${id}" onclick="updateStatus('${id}','assigned')"><i class="fa-solid fa-circle-check"></i> Accept</button>`;
  if (s === 'assigned')
    return `<button class="action-btn action-pickup" data-dispatch="${id}" onclick="updateStatus('${id}','in_progress')"><i class="fa-solid fa-truck"></i> Picked Up</button>`;
  if (s === 'in_progress')
    return `<button class="action-btn action-deliver" data-dispatch="${id}" onclick="updateStatus('${id}','delivered')"><i class="fa-solid fa-check-double"></i> Mark Delivered</button>`;
  return '';
}

/* ─ Render: Home tab ─────────────────────────────────────────────────────── */
function renderHome() {
  renderHomeSubTab(homeSubTab);
}

function switchHomeTab(sub) {
  homeSubTab = sub;
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  $('htab-' + sub)?.classList.add('active');
  renderHomeSubTab(sub);
}

function renderHomeSubTab(sub) {
  const el = $('home-content');
  if (!el) return;
  if (sub === 'income')      el.innerHTML = renderIncome();
  if (sub === 'deliveries')  el.innerHTML = renderDeliveries();
}

function renderIncome() {
  const delivered    = dispatches.filter(d => d.status?.toLowerCase() === 'delivered');
  const todayDelivered = delivered.filter(d => isToday(d.createdAt));
  const todayIncome  = todayDelivered.reduce((s,d) => s + (d.amount||0), 0);
  const totalIncome  = delivered.reduce((s,d) => s + (d.amount||0), 0);

  const rows = delivered.length ? delivered.map(d => `
    <div class="order-row">
      <div style="flex:1;min-width:0;">
        <p class="order-name">${esc(d.customerName||d.orderId||d.id)}</p>
        ${d.address ? `<p class="order-addr">📍 ${esc(d.address)}</p>` : ''}
        <p class="order-time">${fmtDate(d.createdAt)}</p>
      </div>
      <span class="order-amount">${fmt(d.amount)}</span>
    </div>`).join('') :
    '<p style="color:var(--gray-text);font-size:13px;font-weight:500;padding:8px 0">No completed deliveries yet.</p>';

  return `
    <div class="stat-grid">
      <div class="stat-card">
        <p class="stat-label">Today's Income</p>
        <p class="stat-value">${fmt(todayIncome)}</p>
        <p class="stat-sub">${todayDelivered.length} ${todayDelivered.length===1?'delivery':'deliveries'}</p>
      </div>
      <div class="stat-card">
        <p class="stat-label">Total Earnings</p>
        <p class="stat-value">${fmt(totalIncome)}</p>
        <p class="stat-sub">${delivered.length} completed</p>
      </div>
    </div>
    <div class="card">
      <div class="card-body">
        <p class="card-title">Completed Orders</p>
        <div class="divider"></div>
        ${rows}
      </div>
    </div>`;
}

function renderDeliveries() {
  const pending    = dispatches.filter(d => !d.status || d.status.toLowerCase() === 'pending');
  const inProgress = dispatches.filter(d => ['in_progress','assigned'].includes(d.status?.toLowerCase()));
  const todayAll   = dispatches.filter(d => isToday(d.createdAt));

  const rows = todayAll.length ? todayAll.map(d => `
    <div class="order-row">
      <div style="flex:1;min-width:0;">
        <p class="order-name">${esc(d.customerName||d.orderId||d.id)}</p>
        ${d.address ? `<p class="order-addr">📍 ${esc(d.address)}</p>` : ''}
        <p class="order-time">${fmtDate(d.createdAt)}</p>
      </div>
      <span class="${badgeClass(d.status)}">${esc(statusLabel(d.status))}</span>
    </div>`).join('') :
    '<p style="color:var(--gray-text);font-size:13px;font-weight:500;padding:8px 0">No dispatches today.</p>';

  return `
    <div class="stat-grid">
      <div class="stat-card">
        <p class="stat-label">Pending</p>
        <p class="stat-value">${pending.length}</p>
        <p class="stat-sub">awaiting pickup</p>
      </div>
      <div class="stat-card amber">
        <p class="stat-label">In Progress</p>
        <p class="stat-value amber">${inProgress.length}</p>
        <p class="stat-sub">on the road</p>
      </div>
    </div>
    <div class="card">
      <div class="card-body">
        <p class="card-title">Today's Deliveries</p>
        <div class="divider"></div>
        ${rows}
      </div>
    </div>`;
}

/* ─ Render: Dispatches tab ──────────────────────────────────────────────── */
function renderDispatches() {
  const el = $('dispatches-list');
  if (!el) return;

  if (!dispatches.length) {
    el.innerHTML = `<div class="empty-state">
      <i class="fa-solid fa-truck-fast empty-icon"></i>
      <p class="empty-title">No dispatches yet</p>
      <p class="empty-sub">Go online to start receiving orders</p>
    </div>`;
    return;
  }

  el.innerHTML = dispatches.map(d => `
    <div class="dispatch-card">
      <div class="dispatch-top">
        <div>
          <p class="dispatch-order">Order #${esc(d.orderId||d.id)}</p>
          ${d.customerName ? `<p class="dispatch-customer">${esc(d.customerName)}</p>` : ''}
        </div>
        <span class="${badgeClass(d.status)}">${esc(statusLabel(d.status))}</span>
      </div>
      ${d.address ? `<div class="dispatch-addr"><i class="fa-solid fa-location-dot"></i><span>${esc(d.address)}</span></div>` : ''}
      ${(d.items||d.amount!=null) ? `
      <div class="dispatch-meta">
        ${d.items  ? `<span class="dispatch-items">${esc(d.items)}</span>` : ''}
        ${d.amount != null ? `<span class="dispatch-amount">${fmt(d.amount)}</span>` : ''}
      </div>` : ''}
      ${d.createdAt ? `<p class="dispatch-time">${fmtDate(d.createdAt)}</p>` : ''}
      <div class="dispatch-actions">${actionButtons(d)}</div>
    </div>`).join('');
}

/* ─ Render: Profile tab ─────────────────────────────────────────────────── */
function renderProfileTab() {
  const u = currentUser;
  if (!u) return;
  const initials = (u.name||u.phone||'?').split(/\s+/).map(w=>w[0]).slice(0,2).join('').toUpperCase();
  $('prof-initials').textContent = initials;
  $('prof-name-display').textContent  = u.name  || 'Delivery Rider';
  $('prof-phone-display').textContent = u.phone || '';
  $('prof-name-input').value   = u.name   || '';
  $('prof-age-input').value    = u.age    || '';
  $('prof-phone-input').value  = u.phone  || '';

  // gender chips
  document.querySelectorAll('.gender-chip-edit').forEach(c => {
    const selected = c.dataset.val === u.gender;
    c.classList.toggle('selected', selected);
    c.setAttribute('aria-checked', selected ? 'true' : 'false');
  });
  selectedEditGender = u.gender || '';
  hideAlert('profile-alert');
  $('profile-success').classList.remove('show');
}

let selectedEditGender = '';

function selectEditGender(el, val) {
  document.querySelectorAll('.gender-chip-edit').forEach(c => {
    c.classList.remove('selected'); c.setAttribute('aria-checked','false');
  });
  el.classList.add('selected'); el.setAttribute('aria-checked','true');
  selectedEditGender = val;
}

async function saveProfile() {
  const name = $('prof-name-input').value.trim();
  const age  = $('prof-age-input').value.trim();
  if (name.length < 2)         return showAlert('profile-alert','Please enter your full name');
  if (!age||+age<18||+age>65)  return showAlert('profile-alert','Please enter a valid age (18–65)');
  if (!selectedEditGender)     return showAlert('profile-alert','Please select your gender');
  hideAlert('profile-alert');

  const btn = $('btn-save-profile');
  btn.disabled = true; btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving…';
  try {
    await apiGetProfile(currentUser.phone);
    const user = { ...currentUser, name, age: +age, gender: selectedEditGender, profileComplete: true };
    saveUser(user);
    renderHeader();
    renderProfileTab();
    $('profile-success').classList.add('show');
    showToast('Profile saved!');
  } catch(e) { showAlert('profile-alert', e.message); }
  finally { btn.disabled = false; btn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Save Profile'; }
}

function logout() {
  if (!confirm('Are you sure you want to log out?')) return;
  clearUser(); stopResendTimer();
  dispatches = []; isOnline = false; activeTab = 'home'; homeSubTab = 'income';
  $('login-phone').value = ''; clearOtp();
  showScreen('screen-login');
}

/* ── Alert helpers ── */
function showAlert(id, msg) { const el=$(id); if(el){el.textContent=msg; el.classList.add('show');} }
function hideAlert(id) { const el=$(id); if(el) el.classList.remove('show'); }

/* ═══════════════════════════════════════════════════════════════════════════
   INIT
═══════════════════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  initLogin();
  initOtp();

  // Hide loader
  setTimeout(() => {
    const loader = $('pill-loader');
    loader.style.opacity = '0';
    setTimeout(() => loader.style.display = 'none', 450);
  }, 800);

  // Boot if already logged in
  const user = loadUser();
  if (user?.profileComplete) {
    currentUser = user;
    bootApp();
  } else {
    showScreen('screen-login');
  }
});
