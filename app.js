/* ============================================================
   DELIVERY MAN – app.js
   ============================================================ */

'use strict';

/* ── Mock Data ─────────────────────────────────────────────── */
const mockOrders = [
  {
    id: 'ORD-001',
    patientName: 'Mrs. Priya Sharma',
    address: '14 MG Road, Connaught Place, New Delhi',
    phone: '+91 98101 23456',
    timeSlot: '10:00 AM – 12:00 PM',
    status: 'assigned',
    prescriptionVerified: true,
    highRiskDrug: true,
    coldStorage: true,
    priority: true,
    emergency: false,
    medicines: ['Insulin Glargine 10ml x2', 'Metformin 500mg x30', 'Glucometer strips x50'],
    specialInstructions: 'Keep insulin below 8°C. Ring doorbell twice. Ask for patient by name.',
    amount: 12500,
    nurseAssist: true,
    nursePhone: '+91 98201 34567',
    distance: '3.2 km',
    eta: '12 mins',
    traffic: 'green'
  },
  {
    id: 'ORD-002',
    patientName: 'Mr. Rajesh Kumar',
    address: '7 Park Street, Kolkata, West Bengal',
    phone: '+91 98301 45678',
    timeSlot: '2:00 PM – 4:00 PM',
    status: 'in_progress',
    prescriptionVerified: true,
    highRiskDrug: false,
    coldStorage: false,
    priority: false,
    emergency: true,
    medicines: ['Amlodipine 5mg x30', 'Lisinopril 10mg x30'],
    specialInstructions: 'Patient has hearing difficulty. Knock loudly.',
    amount: 3200,
    nurseAssist: false,
    distance: '5.8 km',
    eta: '22 mins',
    traffic: 'yellow'
  },
  {
    id: 'ORD-003',
    patientName: 'Ms. Anjali Singh',
    address: '22 FC Road, Shivajinagar, Pune',
    phone: '+91 98401 56789',
    timeSlot: '4:00 PM – 6:00 PM',
    status: 'pending',
    prescriptionVerified: true,
    highRiskDrug: true,
    coldStorage: false,
    priority: true,
    emergency: false,
    medicines: ['Tramadol 100mg x10', 'Diclofenac 50mg x20', 'Omeprazole 20mg x14'],
    specialInstructions: 'Schedule H medicines. Verify ID before handing over.',
    amount: 8700,
    nurseAssist: false,
    distance: '4.1 km',
    eta: '17 mins',
    traffic: 'green'
  },
  {
    id: 'ORD-004',
    patientName: 'Mr. Suresh Patel',
    address: '5 CG Road, Navrangpura, Ahmedabad',
    phone: '+91 98501 67890',
    timeSlot: '8:00 AM – 10:00 AM',
    status: 'delivered',
    prescriptionVerified: true,
    highRiskDrug: false,
    coldStorage: false,
    priority: false,
    emergency: false,
    medicines: ['Atorvastatin 20mg x30', 'Aspirin 75mg x30'],
    specialInstructions: '',
    amount: 4500,
    nurseAssist: false,
    distance: '2.4 km',
    eta: '9 mins',
    traffic: 'green'
  }
];

const mockRiderProfile = {
  name: 'Raj Kumar',
  phone: '+91 98601 78901',
  idVerified: true,
  bgCheckStatus: 'cleared',
  bankDetails: '****1234 – HDFC Bank',
  kycStatus: 'complete',
  isOnline: true
};

const mockEarnings = {
  today: 16200,
  weekly: 89500,
  escrowHeld: 25000,
  releasedPayouts: 64500,
  commissionRate: 12,
  incentives: 5000,
  history: [
    { date: '2026-03-03', orders: 4, amount: 16200 },
    { date: '2026-03-02', orders: 6, amount: 24300 },
    { date: '2026-03-01', orders: 3, amount: 12800 },
    { date: '2026-02-29', orders: 5, amount: 18700 },
    { date: '2026-02-28', orders: 7, amount: 17500 }
  ]
};

const mockPerformance = {
  onTimeRate: 94,
  rating: 4.8,
  cancellationRate: 2,
  failedDeliveries: 1,
  totalDeliveries: 156,
  monthlyData: [85, 88, 92, 94, 96, 94]
};

const mockNotifications = [
  { id: 1, type: 'new_order',  title: 'New Order Assigned',   message: 'ORD-003 assigned to you',             time: '2 min ago',  read: false },
  { id: 2, type: 'priority',   title: 'Priority Medical Alert',message: 'ORD-001 requires immediate dispatch', time: '15 min ago', read: false },
  { id: 3, type: 'cold_chain', title: 'Cold Chain Warning',    message: 'Check temperature for ORD-001',       time: '1 hr ago',   read: false },
  { id: 4, type: 'settlement', title: 'Payment Released',      message: '₹24,300 credited to your account',   time: '2 hrs ago',  read: true  },
  { id: 5, type: 'complaint',  title: 'Complaint Raised',      message: 'Review feedback on ORD-159',          time: '1 day ago',  read: true  },
  { id: 6, type: 'schedule',   title: 'Schedule Updated',      message: 'Tomorrow shift: 8 AM – 6 PM',         time: '1 day ago',  read: true  }
];

/* ── State ──────────────────────────────────────────────────── */
let state = {
  loggedIn: false,
  currentScreen: 'splash',
  previousScreen: null,
  currentOrderId: null,
  isOnline: true,
  notifications: [...mockNotifications],
  orders: [...mockOrders],
  deliverySteps: { sig: false, photo: false, otp: false, condition: false },
  inactivityTimer: null,
  countdownTimer: null,
  inactivitySeconds: 300,    // 5 minutes
  warningAt: 30,             // show warning 30s before logout
  remainingSeconds: 300,
  otpResendTimer: null,
  phoneNumber: ''
};

/* ── Helpers ─────────────────────────────────────────────────── */
function fmt(n) {
  if (n >= 1000) return '₹' + (n / 1000).toFixed(1) + 'k';
  return '₹' + n.toLocaleString();
}

function fmtFull(n) { return '₹' + n.toLocaleString(); }

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning 👋';
  if (h < 17) return 'Good afternoon 👋';
  return 'Good evening 👋';
}

function statusLabel(s) {
  return { assigned: 'Assigned', in_progress: 'In Progress', pending: 'Pending', delivered: 'Delivered' }[s] || s;
}

function notifIcon(type) {
  return { new_order: '🔵', priority: '🔴', cold_chain: '🟠', settlement: '🟢', complaint: '🟡', schedule: '🟣' }[type] || '🔔';
}

/* ── Toast ───────────────────────────────────────────────────── */
function showToast(msg, type = '') {
  const c = document.getElementById('toast-container');
  const t = document.createElement('div');
  t.className = 'toast' + (type ? ' ' + type : '');
  t.textContent = msg;
  c.appendChild(t);
  setTimeout(() => {
    t.style.animation = 'toastOut 0.3s forwards';
    setTimeout(() => t.remove(), 300);
  }, 3000);
}

/* ── Screen Navigation ───────────────────────────────────────── */
function showScreen(id) {
  const prev = state.currentScreen;
  // hide all
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.add('active');
  state.previousScreen = prev;
  state.currentScreen = id;

  // Update bottom nav highlight
  const navScreens = ['dashboard', 'orders', 'earnings', 'profile'];
  const bottomNav = document.getElementById('bottom-nav');
  if (bottomNav) {
    bottomNav.style.display = navScreens.includes(id) ? 'flex' : 'none';
    document.querySelectorAll('.nav-item').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.screen === id);
    });
  }

  // Screen-specific init
  if (id === 'dashboard')    initDashboard();
  if (id === 'orders')       renderOrdersList('all');
  if (id === 'earnings')     initEarnings();
  if (id === 'notifications') renderNotifications();
  if (id === 'performance')  initPerformance();
  if (id === 'profile')      initProfile();
}

function goBack() {
  if (state.previousScreen) showScreen(state.previousScreen);
  else showScreen('dashboard');
}

/* ── Inactivity Timer ────────────────────────────────────────── */
function resetInactivityTimer() {
  document.getElementById('inactivity-modal').classList.add('hidden');
  clearTimeout(state.inactivityTimer);
  clearInterval(state.countdownTimer);
  if (!state.loggedIn) return;
  state.inactivityTimer = setTimeout(() => {
    startCountdown();
  }, (state.inactivitySeconds - state.warningAt) * 1000);
}

function startCountdown() {
  let secs = state.warningAt;
  document.getElementById('inactivity-countdown').textContent = secs;
  document.getElementById('inactivity-modal').classList.remove('hidden');
  state.countdownTimer = setInterval(() => {
    secs--;
    document.getElementById('inactivity-countdown').textContent = secs;
    if (secs <= 0) {
      clearInterval(state.countdownTimer);
      logout();
    }
  }, 1000);
}

function setupInactivityListeners() {
  ['click','keydown','touchstart','mousemove'].forEach(ev =>
    document.addEventListener(ev, resetInactivityTimer, { passive: true })
  );
  resetInactivityTimer();
}

/* ── Auth ────────────────────────────────────────────────────── */
function sendOtp() {
  const ph = document.getElementById('phone-input').value.trim();
  if (ph.length < 10) { showToast('Enter a valid phone number', 'error'); return; }
  state.phoneNumber = ph;
  document.getElementById('otp-hint').textContent = 'Enter the 6-digit code sent to +91 ' + ph;
  showScreen('otp');
  startOtpTimer();
  showToast('OTP sent! Use 123456 for demo', 'success');
}

function startOtpTimer() {
  let secs = 30;
  const timerEl = document.getElementById('otp-timer');
  const resendBtn = document.getElementById('resend-btn');
  timerEl.classList.remove('hidden');
  resendBtn.classList.add('hidden');
  if (state.otpResendTimer) clearInterval(state.otpResendTimer);
  state.otpResendTimer = setInterval(() => {
    secs--;
    timerEl.textContent = 'Resend in ' + secs + 's';
    if (secs <= 0) {
      clearInterval(state.otpResendTimer);
      timerEl.classList.add('hidden');
      resendBtn.classList.remove('hidden');
    }
  }, 1000);
}

function resendOtp() {
  showToast('OTP resent! Use 123456 for demo', 'success');
  startOtpTimer();
}

function verifyOtp() {
  const boxes = document.querySelectorAll('#otp-boxes .otp-box');
  const code = Array.from(boxes).map(b => b.value).join('');
  if (code.length < 6) { showToast('Enter all 6 digits', 'error'); return; }
  // Demo: accept any 6-digit code
  const saved = localStorage.getItem('dm_profile_done');
  if (saved) {
    finishLogin();
  } else {
    showScreen('profile-setup');
  }
}

function completeSetup() {
  const name = document.getElementById('setup-name').value.trim() || 'Raj Kumar';
  mockRiderProfile.name = name;
  localStorage.setItem('dm_profile_done', '1');
  localStorage.setItem('dm_name', name);
  finishLogin();
}

function finishLogin() {
  state.loggedIn = true;
  localStorage.setItem('dm_logged_in', '1');
  setupInactivityListeners();
  showScreen('dashboard');
}

function logout() {
  state.loggedIn = false;
  clearTimeout(state.inactivityTimer);
  clearInterval(state.countdownTimer);
  document.getElementById('inactivity-modal').classList.add('hidden');
  localStorage.removeItem('dm_logged_in');
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById('login').classList.add('active');
  state.currentScreen = 'login';
  showToast('You have been logged out', '');
}

/* ── Dashboard ───────────────────────────────────────────────── */
function initDashboard() {
  const name = localStorage.getItem('dm_name') || mockRiderProfile.name;
  document.getElementById('dash-name').textContent = name;
  document.getElementById('dash-greeting').textContent = getGreeting();

  const active    = state.orders.filter(o => o.status === 'in_progress').length;
  const assigned  = state.orders.filter(o => o.status === 'assigned').length;
  const completed = state.orders.filter(o => o.status === 'delivered').length;

  document.getElementById('stat-assigned').textContent  = assigned;
  document.getElementById('stat-active').textContent    = active;
  document.getElementById('stat-completed').textContent = completed;
  document.getElementById('stat-earnings').textContent  = fmt(mockEarnings.today);
  document.getElementById('escrow-amount').textContent  = fmtFull(mockEarnings.escrowHeld);

  // Sync online toggle
  const tog = document.getElementById('online-toggle');
  tog.checked = state.isOnline;
  updateOnlineUI();

  // Priority orders
  const priorityEl = document.getElementById('priority-orders-list');
  const priorityOrds = state.orders.filter(o => o.priority && o.status !== 'delivered');
  priorityEl.innerHTML = priorityOrds.length
    ? priorityOrds.map(o => orderCardHTML(o)).join('')
    : '<p style="font-size:13px;color:#9CA3AF;margin-bottom:10px;">No priority orders</p>';

  // Cold storage orders
  const coldEl = document.getElementById('cold-orders-list');
  const coldOrds = state.orders.filter(o => o.coldStorage && o.status !== 'delivered');
  coldEl.innerHTML = coldOrds.length
    ? coldOrds.map(o => orderCardHTML(o)).join('')
    : '<p style="font-size:13px;color:#9CA3AF;margin-bottom:10px;">No cold-chain orders</p>';

  // Emergency orders
  const emEl = document.getElementById('emergency-orders-list');
  const emOrds = state.orders.filter(o => o.emergency && o.status !== 'delivered');
  emEl.innerHTML = emOrds.length
    ? emOrds.map(o => orderCardHTML(o)).join('')
    : '<p style="font-size:13px;color:#9CA3AF;margin-bottom:10px;">No emergency orders</p>';

  // Notification badge
  updateNotifBadge();
}

function updateOnlineUI() {
  const lbl = document.getElementById('online-label');
  const locRow = document.getElementById('location-row');
  if (state.isOnline) {
    lbl.textContent = 'ONLINE';
    lbl.className = 'online-label online';
    if (locRow) locRow.style.display = 'flex';
  } else {
    lbl.textContent = 'OFFLINE';
    lbl.className = 'online-label offline';
    if (locRow) locRow.style.display = 'none';
  }
}

function toggleOnlineStatus(el) {
  state.isOnline = el.checked;
  const profileTog = document.getElementById('profile-online-toggle');
  if (profileTog) profileTog.checked = el.checked;
  updateOnlineUI();
  updateProfileOnlineUI();
  showToast(state.isOnline ? '🟢 You are now Online' : '⚫ You are now Offline');
}

function toggleOnlineStatusProfile(el) {
  state.isOnline = el.checked;
  const dashTog = document.getElementById('online-toggle');
  if (dashTog) dashTog.checked = el.checked;
  updateOnlineUI();
  updateProfileOnlineUI();
  showToast(state.isOnline ? '🟢 You are now Online' : '⚫ You are now Offline');
}

function updateProfileOnlineUI() {
  const lbl = document.getElementById('profile-online-label');
  if (!lbl) return;
  if (state.isOnline) { lbl.textContent = 'ONLINE'; lbl.className = 'online-label online'; }
  else                { lbl.textContent = 'OFFLINE'; lbl.className = 'online-label offline'; }
}

/* ── Orders ──────────────────────────────────────────────────── */
function orderCardHTML(o) {
  const badges = [];
  if (o.priority)    badges.push('<span class="badge priority">🔴 Priority</span>');
  if (o.coldStorage) badges.push('<span class="badge cold">❄️ Cold</span>');
  if (o.emergency)   badges.push('<span class="badge emergency">🚨 Emergency</span>');
  if (o.highRiskDrug)badges.push('<span class="badge high-risk">⚠️ High Risk</span>');
  return `
  <div class="order-card" onclick="openOrderDetail('${o.id}')">
    <div class="order-card-top">
      <span class="order-id">${o.id}</span>
      <div class="order-badges">${badges.join('')}<span class="badge ${o.status}">${statusLabel(o.status)}</span></div>
    </div>
    <div class="order-patient">${o.patientName}</div>
    <div class="order-address">📍 ${o.address}</div>
    <div class="order-bottom">
      <span class="order-time">🕐 ${o.timeSlot}</span>
      <span class="order-amount">${fmtFull(o.amount)}</span>
    </div>
  </div>`;
}

function renderOrdersList(filter) {
  const list = document.getElementById('orders-list');
  let filtered = filter === 'all' ? state.orders : state.orders.filter(o => o.status === filter);
  list.innerHTML = filtered.length ? filtered.map(o => orderCardHTML(o)).join('') : '<p style="text-align:center;color:#9CA3AF;font-size:14px;padding:20px;">No orders found</p>';

  // Update badge
  const pendingCount = state.orders.filter(o => o.status !== 'delivered').length;
  const badge = document.getElementById('orders-badge');
  if (badge) { badge.textContent = pendingCount; badge.style.display = pendingCount ? 'block' : 'none'; }
}

function filterOrders(filter, btn) {
  document.querySelectorAll('.filter-tab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderOrdersList(filter);
}

function openOrderDetail(id) {
  state.currentOrderId = id;
  const o = state.orders.find(x => x.id === id);
  if (!o) return;

  document.getElementById('detail-order-id').textContent  = o.id;
  document.getElementById('detail-status-label').textContent = statusLabel(o.status);

  const actionBtn = o.status === 'assigned'
    ? `<button class="btn-primary full-width" onclick="startChecklist('${o.id}')">✅ Start Checklist</button>`
    : o.status === 'in_progress'
    ? `<button class="btn-success full-width" onclick="beginNavigation('${o.id}')">🚴 Begin Delivery / Navigate</button>`
    : '';

  const nurseBtn = o.nurseAssist && o.status !== 'delivered'
    ? `<button class="btn-outline full-width" style="margin-top:10px;" onclick="openNurseAssist('${o.id}')">👩‍⚕️ Nurse Assist Mode</button>`
    : '';

  const rxBadge = o.prescriptionVerified ? '<span class="badge verified">✅ Prescription Verified</span>' : '<span class="badge high-risk">❌ Unverified</span>';
  const coldBadge = o.coldStorage ? '<span class="badge cold">❄️ Cold Storage Required</span>' : '<span class="badge pending">🌡️ No Cold Storage</span>';
  const highRiskBadge = o.highRiskDrug ? '<div class="card" style="background:#FEF2F2;border:1.5px solid #FCA5A5;margin-bottom:14px;"><strong style="color:#B91C1C;">⚠️ HIGH-RISK DRUG ALERT</strong><p style="font-size:13px;color:#991B1B;margin-top:4px;">Exercise extreme caution. Verify recipient ID.</p></div>' : '';

  const medicines = o.medicines.map(m => `<div class="medicine-item">${m}</div>`).join('');
  const instrHtml = o.specialInstructions ? `<div class="special-instructions">📋 ${o.specialInstructions}</div>` : '';

  document.getElementById('order-detail-body').innerHTML = `
    ${highRiskBadge}
    <div class="card">
      <div class="detail-row"><span class="detail-label">Patient Name</span><span class="detail-value">${o.patientName}</span></div>
      <div class="detail-row"><span class="detail-label">Time Slot</span><span class="detail-value">${o.timeSlot}</span></div>
      <div class="detail-row"><span class="detail-label">Address</span><span class="detail-value">${o.address}</span></div>
      <div class="detail-row"><span class="detail-label">Status</span><span class="detail-value"><span class="badge ${o.status}">${statusLabel(o.status)}</span></span></div>
      <div class="detail-row"><span class="detail-label">Prescription</span><span class="detail-value">${rxBadge}</span></div>
      <div class="detail-row"><span class="detail-label">Cold Storage</span><span class="detail-value">${coldBadge}</span></div>
    </div>
    <div class="card">
      <h3 class="card-section-title">📞 Patient Contact</h3>
      <div class="contact-row">
        <div class="contact-info">
          <div class="contact-name">${o.patientName}</div>
          <div class="contact-phone">${o.phone}</div>
        </div>
        <button class="call-btn" onclick="callPatient('${o.phone}')">📞 Call</button>
      </div>
    </div>
    <div class="card">
      <h3 class="card-section-title">💊 Medicine List</h3>
      <div class="medicine-list">${medicines}</div>
    </div>
    ${instrHtml ? `<div class="card">${instrHtml}</div>` : ''}
    <div class="card">
      <button class="maps-btn full-width" onclick="beginNavigation('${o.id}')">🗺️ Open Navigation</button>
    </div>
    ${actionBtn}
    ${nurseBtn}
    <div style="height:80px;"></div>
  `;

  showScreen('order-detail');
}

/* ── Checklist ───────────────────────────────────────────────── */
function startChecklist(id) {
  state.currentOrderId = id;
  const o = state.orders.find(x => x.id === id);
  const items = [
    { label: 'Medicines sealed properly', required: true },
    { label: 'Cold chain maintained', required: o && o.coldStorage },
    { label: 'Injection kit included', required: o && o.nurseAssist },
    { label: 'Prescription verified', required: true },
    { label: 'Packaging intact', required: true }
  ].filter(i => i.required);

  const container = document.getElementById('checklist-items');
  container.innerHTML = items.map((item, idx) => `
    <div class="checklist-item">
      <input type="checkbox" id="chk-${idx}" onchange="updateChecklistBtn()" />
      <label for="chk-${idx}">${item.label}</label>
    </div>
  `).join('');
  document.getElementById('checklist-proceed-btn').disabled = true;
  showScreen('checklist');
}

function updateChecklistBtn() {
  const boxes = document.querySelectorAll('#checklist-items input[type=checkbox]');
  const allChecked = Array.from(boxes).every(b => b.checked);
  document.getElementById('checklist-proceed-btn').disabled = !allChecked;
}

function proceedFromChecklist() {
  const o = state.orders.find(x => x.id === state.currentOrderId);
  if (o) o.status = 'in_progress';
  showToast('✅ Checklist complete! Starting delivery…', 'success');
  beginNavigation(state.currentOrderId);
}

/* ── Navigation ──────────────────────────────────────────────── */
function beginNavigation(id) {
  state.currentOrderId = id;
  const o = state.orders.find(x => x.id === id);
  if (!o) return;
  document.getElementById('nav-order-id').textContent = o.id;
  document.getElementById('nav-address').textContent  = o.address;
  document.getElementById('nav-distance').textContent = o.distance || '3.2 km';
  document.getElementById('nav-eta').textContent      = o.eta || '12 mins';
  const dot  = document.getElementById('nav-traffic-dot');
  const text = document.getElementById('nav-traffic-text');
  const tc = o.traffic || 'green';
  dot.className  = 'nav-traffic-dot ' + tc;
  text.textContent = { green: 'Clear', yellow: 'Moderate', red: 'Heavy' }[tc] || 'Clear';
  showScreen('navigation');
}

function openGoogleMaps() {
  const o = state.orders.find(x => x.id === state.currentOrderId);
  if (!o) return;
  const url = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(o.address);
  window.open(url, '_blank');
}

function showConfirmDelivery() {
  const o = state.orders.find(x => x.id === state.currentOrderId);
  document.getElementById('confirm-order-id').textContent = o ? o.id : '';
  // Reset delivery steps
  state.deliverySteps = { sig: false, photo: false, otp: false, condition: false };
  ['sig-check','photo-check','delivery-otp-check','cond-check'].forEach(id => document.getElementById(id).classList.add('hidden'));
  ['sig-badge','otp-d-badge','photo-badge','cond-badge'].forEach(id => document.getElementById(id).classList.remove('hidden'));
  document.getElementById('complete-delivery-btn').disabled = true;
  document.getElementById('condition-checkbox').checked = false;
  clearSignature();
  document.getElementById('delivery-photo-preview').classList.add('hidden');
  document.getElementById('photo-preview-placeholder').classList.remove('hidden');
  document.getElementById('photo-preview-wrap').classList.add('empty');
  document.querySelectorAll('#delivery-otp-boxes .otp-box').forEach(b => { b.value = ''; b.classList.remove('filled'); });
  showScreen('confirm-delivery');
  initSignatureCanvas();
}

/* ── Signature Canvas ────────────────────────────────────────── */
let sigDrawing = false, sigCtx = null;

function initSignatureCanvas() {
  const canvas = document.getElementById('signature-canvas');
  if (!canvas) return;
  sigCtx = canvas.getContext('2d');
  sigCtx.clearRect(0, 0, canvas.width, canvas.height);
  sigCtx.strokeStyle = '#055C61';
  sigCtx.lineWidth = 2.5;
  sigCtx.lineCap = 'round';
  sigCtx.lineJoin = 'round';

  canvas.addEventListener('mousedown', startSig);
  canvas.addEventListener('mousemove', drawSig);
  canvas.addEventListener('mouseup', endSig);
  canvas.addEventListener('mouseleave', endSig);
  canvas.addEventListener('touchstart', startSigTouch, { passive: false });
  canvas.addEventListener('touchmove', drawSigTouch, { passive: false });
  canvas.addEventListener('touchend', endSig);
}

function getCanvasPos(canvas, e) {
  const r = canvas.getBoundingClientRect();
  const scaleX = canvas.width  / r.width;
  const scaleY = canvas.height / r.height;
  return { x: (e.clientX - r.left) * scaleX, y: (e.clientY - r.top) * scaleY };
}

function startSig(e) { sigDrawing = true; const p = getCanvasPos(e.target, e); sigCtx.beginPath(); sigCtx.moveTo(p.x, p.y); }
function drawSig(e)  { if (!sigDrawing) return; const p = getCanvasPos(e.target, e); sigCtx.lineTo(p.x, p.y); sigCtx.stroke(); }
function endSig()    { sigDrawing = false; }

function startSigTouch(e) { e.preventDefault(); const t = e.touches[0]; sigDrawing = true; const p = getCanvasPos(e.target, t); sigCtx.beginPath(); sigCtx.moveTo(p.x, p.y); }
function drawSigTouch(e)  { e.preventDefault(); if (!sigDrawing) return; const t = e.touches[0]; const p = getCanvasPos(e.target, t); sigCtx.lineTo(p.x, p.y); sigCtx.stroke(); }

function clearSignature() {
  if (sigCtx) {
    const canvas = document.getElementById('signature-canvas');
    sigCtx.clearRect(0, 0, canvas.width, canvas.height);
  }
  state.deliverySteps.sig = false;
  updateDeliveryBtn();
}

function saveSignature() {
  const canvas = document.getElementById('signature-canvas');
  const blank = document.createElement('canvas');
  blank.width = canvas.width; blank.height = canvas.height;
  if (canvas.toDataURL() === blank.toDataURL()) {
    showToast('Please draw a signature first', 'error');
    return;
  }
  state.deliverySteps.sig = true;
  document.getElementById('sig-check').classList.remove('hidden');
  document.getElementById('sig-badge').classList.add('hidden');
  updateDeliveryBtn();
  showToast('Signature saved ✅', 'success');
}

/* ── Delivery Steps ──────────────────────────────────────────── */
function handleDeliveryPhoto(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    const img = document.getElementById('delivery-photo-preview');
    img.src = ev.target.result;
    img.classList.remove('hidden');
    document.getElementById('photo-preview-placeholder').classList.add('hidden');
    document.getElementById('photo-preview-wrap').classList.remove('empty');
    state.deliverySteps.photo = true;
    document.getElementById('photo-check').classList.remove('hidden');
    document.getElementById('photo-badge').classList.add('hidden');
    updateDeliveryBtn();
    showToast('Photo uploaded ✅', 'success');
  };
  reader.readAsDataURL(file);
}

function verifyDeliveryOtp() {
  const boxes = document.querySelectorAll('#delivery-otp-boxes .otp-box');
  const code = Array.from(boxes).map(b => b.value).join('');
  if (code.length < 4) { showToast('Enter all 4 digits', 'error'); return; }
  // Demo: accept any 4-digit code
  state.deliverySteps.otp = true;
  document.getElementById('delivery-otp-check').classList.remove('hidden');
  document.getElementById('otp-d-badge').classList.add('hidden');
  updateDeliveryBtn();
  showToast('OTP verified ✅', 'success');
}

function checkCondition(el) {
  state.deliverySteps.condition = el.checked;
  if (el.checked) {
    document.getElementById('cond-check').classList.remove('hidden');
    document.getElementById('cond-badge').classList.add('hidden');
  } else {
    document.getElementById('cond-check').classList.add('hidden');
    document.getElementById('cond-badge').classList.remove('hidden');
  }
  updateDeliveryBtn();
}

function updateDeliveryBtn() {
  const d = state.deliverySteps;
  const ready = d.sig && d.photo && d.otp && d.condition;
  document.getElementById('complete-delivery-btn').disabled = !ready;
}

function completeDelivery() {
  const o = state.orders.find(x => x.id === state.currentOrderId);
  if (o) o.status = 'delivered';
  showToast('🎉 Delivery completed! Great job!', 'success');
  setTimeout(() => showScreen('dashboard'), 1500);
}

/* ── Nurse Assist ────────────────────────────────────────────── */
function openNurseAssist(id) {
  state.currentOrderId = id;
  const o = state.orders.find(x => x.id === id);
  document.getElementById('nurse-order-id').textContent = o ? o.id : '';
  document.getElementById('nurse-phone-display').textContent = o ? o.nursePhone || '+91 98201 34567' : '';
  showScreen('nurse-assist');
}

function callNurse() {
  const o = state.orders.find(x => x.id === state.currentOrderId);
  if (o && o.nursePhone) window.location.href = 'tel:' + o.nursePhone;
  else showToast('Nurse contact not available', 'error');
}

function callPatient(phone) {
  window.location.href = 'tel:' + phone;
}

function confirmNurseHandover() {
  const consent  = document.getElementById('consent-checkbox').checked;
  const handover = document.getElementById('handover-checkbox').checked;
  if (!consent || !handover) { showToast('Please confirm both checkboxes', 'error'); return; }
  showToast('✅ Nurse handover confirmed!', 'success');
  setTimeout(() => showConfirmDelivery(), 1000);
}

/* ── Emergency ───────────────────────────────────────────────── */
function triggerEmergency(type) {
  const msgs = {
    call:       '📞 Connecting you to support. Please hold on.',
    medical:    '🏥 Medical emergency reported. Help is on the way.',
    aggressive: '⚠️ Situation reported. Stay safe – do not confront. Support notified.',
    damage:     '💊 Medicine damage reported. Do not deliver damaged goods.'
  };
  const conf = document.getElementById('emergency-confirm');
  conf.textContent = msgs[type] || 'Emergency reported.';
  conf.classList.remove('hidden');
  if (type === 'call') {
    setTimeout(() => window.location.href = 'tel:+918001234567', 500);
  }
}

/* ── Earnings ────────────────────────────────────────────────── */
function initEarnings() {
  const e = mockEarnings;
  document.getElementById('earnings-today').textContent      = fmtFull(e.today);
  document.getElementById('earnings-orders-today').textContent = state.orders.filter(o => o.status === 'delivered').length + ' orders completed';
  document.getElementById('earnings-weekly-val').textContent = fmt(e.weekly);
  document.getElementById('earnings-escrow-val').textContent = fmt(e.escrowHeld);
  document.getElementById('earnings-released-val').textContent = fmt(e.releasedPayouts);
  document.getElementById('earnings-incentives-val').textContent = fmt(e.incentives);

  const gross = Math.round(e.today / (1 - e.commissionRate / 100));
  const comm  = gross - e.today;
  document.getElementById('comm-gross').textContent    = fmtFull(gross);
  document.getElementById('comm-deducted').textContent = '−' + fmtFull(comm);
  document.getElementById('comm-net').textContent      = fmtFull(e.today);

  const table = document.getElementById('payment-history-table');
  table.innerHTML = e.history.map(h => `
    <div class="history-row">
      <span class="history-date">${h.date}</span>
      <span class="history-orders">${h.orders} orders</span>
      <span class="history-amount">${fmtFull(h.amount)}</span>
    </div>
  `).join('');
}

/* ── Performance ─────────────────────────────────────────────── */
function initPerformance() {
  const p = mockPerformance;
  document.getElementById('ontime-val').textContent   = p.onTimeRate + '%';
  document.getElementById('rating-val').textContent   = p.rating;
  document.getElementById('perf-total').textContent   = p.totalDeliveries;
  document.getElementById('perf-cancel').textContent  = p.cancellationRate + '%';
  document.getElementById('perf-failed').textContent  = p.failedDeliveries;

  // Star rating
  const stars = Math.round(p.rating);
  document.getElementById('rating-stars').textContent = '★'.repeat(stars) + '☆'.repeat(5 - stars);

  // Circular progress
  const circle = document.getElementById('ontime-circle');
  const circumference = 2 * Math.PI * 40;
  const dash = (p.onTimeRate / 100) * circumference;
  setTimeout(() => {
    circle.style.strokeDasharray = dash + ' ' + circumference;
  }, 100);

  // Bar chart
  const chartEl = document.getElementById('monthly-bar-chart');
  const max = Math.max(...p.monthlyData);
  chartEl.innerHTML = p.monthlyData.map(v => `
    <div class="bar-chart-bar" style="height:${(v / max) * 100}%;min-height:8px;" title="${v}%"></div>
  `).join('');
}

/* ── Notifications ───────────────────────────────────────────── */
function renderNotifications() {
  const list = document.getElementById('notifications-list');
  const unread = state.notifications.filter(n => !n.read).length;
  document.getElementById('notif-unread-label').textContent = unread + ' unread';

  list.innerHTML = state.notifications.map(n => `
    <div class="notif-item ${n.read ? 'read' : ''}" onclick="markNotifRead(${n.id})">
      <div class="notif-icon">${notifIcon(n.type)}</div>
      <div class="notif-content">
        <div class="notif-title">${n.title}</div>
        <div class="notif-msg">${n.message}</div>
        <div class="notif-time">${n.time}</div>
      </div>
      ${!n.read ? '<div class="notif-unread-dot"></div>' : ''}
    </div>
  `).join('');
}

function markNotifRead(id) {
  const n = state.notifications.find(x => x.id === id);
  if (n) { n.read = true; renderNotifications(); updateNotifBadge(); }
}

function markAllRead() {
  state.notifications.forEach(n => { n.read = true; });
  renderNotifications();
  updateNotifBadge();
  showToast('All notifications marked as read');
}

function updateNotifBadge() {
  const count = state.notifications.filter(n => !n.read).length;
  const badge = document.getElementById('notif-badge');
  if (badge) { badge.textContent = count; badge.style.display = count ? 'block' : 'none'; }
}

/* ── Profile ─────────────────────────────────────────────────── */
function initProfile() {
  const name = localStorage.getItem('dm_name') || mockRiderProfile.name;
  const initials = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  document.getElementById('profile-avatar').textContent      = initials;
  document.getElementById('profile-name-display').textContent = name;
  document.getElementById('profile-phone-display').textContent = mockRiderProfile.phone;
  document.getElementById('profile-bank').textContent = mockRiderProfile.bankDetails;

  const profileTog = document.getElementById('profile-online-toggle');
  if (profileTog) profileTog.checked = state.isOnline;
  updateProfileOnlineUI();
}

/* ── Incident Report ─────────────────────────────────────────── */
function handleIncidentPhoto(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    const img = document.getElementById('incident-photo-preview');
    img.src = ev.target.result;
    img.classList.remove('hidden');
    document.getElementById('incident-photo-placeholder').classList.add('hidden');
    document.getElementById('incident-photo-wrap').classList.remove('empty');
  };
  reader.readAsDataURL(file);
}

function submitIncident() {
  const type = document.getElementById('incident-type').value;
  const ref  = document.getElementById('incident-order-ref').value.trim();
  const desc = document.getElementById('incident-description').value.trim();
  if (!type) { showToast('Please select an incident type', 'error'); return; }
  if (!ref)  { showToast('Please enter the order reference', 'error'); return; }
  if (!desc) { showToast('Please add a description', 'error'); return; }

  document.getElementById('incident-type').value = '';
  document.getElementById('incident-order-ref').value = '';
  document.getElementById('incident-description').value = '';
  document.getElementById('incident-photo-preview').classList.add('hidden');
  document.getElementById('incident-photo-placeholder').classList.remove('hidden');
  document.getElementById('incident-photo-wrap').classList.add('empty');
  document.getElementById('incident-success').classList.remove('hidden');
  setTimeout(() => document.getElementById('incident-success').classList.add('hidden'), 4000);
  showToast('Incident report submitted', 'success');
}

/* ── Cold Chain ──────────────────────────────────────────────── */
function toggleTempSensitive(el) {
  const form = document.getElementById('coldchain-form');
  form.classList.toggle('hidden', !el.checked);
}

function checkTempReading(el) {
  const val = parseFloat(el.value);
  const warn = document.getElementById('temp-warning');
  if (!isNaN(val)) {
    if (val > 8) {
      warn.className = 'warning-banner';
      warn.textContent = '⚠️ Temperature exceeds safe range for insulin (max 8°C). Take corrective action immediately.';
      warn.classList.remove('hidden');
    } else if (val < 2) {
      warn.className = 'warning-banner';
      warn.textContent = '❄️ Temperature below 2°C may freeze insulin. Check storage conditions.';
      warn.classList.remove('hidden');
    } else {
      warn.classList.add('hidden');
    }
  }
}

function handleColdchainPhoto(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    const img = document.getElementById('coldchain-photo-preview');
    img.src = ev.target.result;
    img.classList.remove('hidden');
    document.getElementById('coldchain-photo-placeholder').classList.add('hidden');
    document.getElementById('coldchain-photo-wrap').classList.remove('empty');
  };
  reader.readAsDataURL(file);
}

function submitColdChain() {
  const cid  = document.getElementById('container-id').value.trim();
  const temp = document.getElementById('temp-reading').value;
  if (!cid)  { showToast('Enter a container ID', 'error'); return; }
  if (!temp) { showToast('Enter a temperature reading', 'error'); return; }
  document.getElementById('coldchain-success').classList.remove('hidden');
  setTimeout(() => document.getElementById('coldchain-success').classList.add('hidden'), 4000);
  showToast('Cold chain record submitted ❄️', 'success');
}

/* ── OTP box auto-advance ────────────────────────────────────── */
function setupOtpBoxes() {
  document.querySelectorAll('.otp-box').forEach((box, idx, all) => {
    box.addEventListener('input', () => {
      box.value = box.value.replace(/\D/, '');
      if (box.value) {
        box.classList.add('filled');
        if (idx + 1 < all.length) all[idx + 1].focus();
      } else {
        box.classList.remove('filled');
      }
    });
    box.addEventListener('keydown', e => {
      if (e.key === 'Backspace' && !box.value && idx > 0) all[idx - 1].focus();
    });
  });
}

/* ── Boot ────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  setupOtpBoxes();

  // Splash → auto-proceed
  setTimeout(() => {
    const loggedIn = localStorage.getItem('dm_logged_in');
    if (loggedIn) {
      state.loggedIn = true;
      setupInactivityListeners();
      showScreen('dashboard');
    } else {
      showScreen('login');
    }
  }, 2200);
});
