// ===== app.js — Core utilities: theme, toast, modal, localStorage, routing =====

// ── Theme ──────────────────────────────────────────────────────────────────────
const Theme = {
  init() {
    if (localStorage.getItem('theme') === 'dark' ||
       (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    }
  },
  toggle() {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    const btn = document.getElementById('theme-toggle');
    if (btn) btn.innerHTML = isDark ? icons.sun : icons.moon;
  }
};

// ── Icons ──────────────────────────────────────────────────────────────────────
const icons = {
  sun:  `<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z"/></svg>`,
  moon: `<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>`,
  bell: `<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>`,
  search: `<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z"/></svg>`,
  check: `<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>`,
  x:    `<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>`,
  warn: `<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/></svg>`,
  info: `<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20A10 10 0 0012 2z"/></svg>`
};

// ── Toast ──────────────────────────────────────────────────────────────────────
const Toast = {
  container: null,
  init() {
    this.container = document.getElementById('toast-container');
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.id = 'toast-container';
      document.body.appendChild(this.container);
    }
  },
  show(message, type = 'info', duration = 3000) {
    if (!this.container) this.init();
    const colors = { success: '#10b981', error: '#ef4444', warning: '#f59e0b', info: '#6366f1' };
    const iconMap  = { success: icons.check, error: icons.x, warning: icons.warn, info: icons.info };
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <span style="color:${colors[type]};flex-shrink:0">${iconMap[type]}</span>
      <span class="text-sm font-medium text-slate-700 dark:text-slate-200 flex-1">${message}</span>
      <button onclick="this.parentElement.remove()" class="ml-auto text-slate-400 hover:text-slate-600 flex-shrink-0">${icons.x}</button>`;
    this.container.appendChild(toast);
    setTimeout(() => toast.remove(), duration + 400);
  }
};

// ── Modal ──────────────────────────────────────────────────────────────────────
const Modal = {
  open(id) {
    const el = document.getElementById(id);
    if (el) { el.classList.add('open'); document.body.style.overflow = 'hidden'; }
  },
  close(id) {
    const el = document.getElementById(id);
    if (el) { el.classList.remove('open'); document.body.style.overflow = ''; }
  },
  closeAll() {
    document.querySelectorAll('.modal-overlay.open').forEach(m => m.classList.remove('open'));
    document.body.style.overflow = '';
  }
};

// ── Storage ────────────────────────────────────────────────────────────────────
const Store = {
  get(key, fallback = []) {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
    catch { return fallback; }
  },
  set(key, value) { localStorage.setItem(key, JSON.stringify(value)); },
  push(key, item) { const arr = this.get(key); arr.push(item); this.set(key, arr); },
  update(key, id, updates) {
    this.set(key, this.get(key).map(i => i.id === id ? { ...i, ...updates } : i));
  },
  remove(key, id) { this.set(key, this.get(key).filter(i => i.id !== id)); }
};

// ── Helpers ────────────────────────────────────────────────────────────────────
const genId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

// ── Validator ──────────────────────────────────────────────────────────────────
const Validator = {
  rules: {
    required: v => v.trim() !== '' || 'This field is required',
    email:    v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || 'Enter a valid email',
    phone:    v => /^\+?[\d\s\-]{7,15}$/.test(v) || 'Enter a valid phone number',
    minLen:   n => v => v.length >= n || `Minimum ${n} characters`,
    number:   v => (!isNaN(v) && v !== '') || 'Must be a number',
    positive: v => parseFloat(v) > 0 || 'Must be a positive number'
  },
  validate(form, schema) {
    let valid = true;
    Object.entries(schema).forEach(([name, ruleFns]) => {
      const input = form.querySelector(`[name="${name}"]`);
      if (!input) return;
      const errEl = form.querySelector(`[data-error="${name}"]`);
      let msg = '';
      for (const fn of ruleFns) {
        const result = fn(input.value);
        if (result !== true) { msg = result; break; }
      }
      if (msg) {
        valid = false;
        input.classList.add('error');
        if (errEl) errEl.textContent = msg;
      } else {
        input.classList.remove('error');
        if (errEl) errEl.textContent = '';
      }
    });
    return valid;
  },
  liveValidate(form, schema) {
    if (!form) return;
    Object.keys(schema).forEach(name => {
      const input = form.querySelector(`[name="${name}"]`);
      if (input) input.addEventListener('input', () => this.validate(form, { [name]: schema[name] }));
    });
  }
};

// ── CSV Export ─────────────────────────────────────────────────────────────────
const CSV = {
  export(data, filename = 'export.csv') {
    if (!data.length) return Toast.show('No data to export', 'warning');
    const headers = Object.keys(data[0]);
    const rows = data.map(r => headers.map(h => `"${String(r[h] ?? '').replace(/"/g, '""')}"`).join(','));
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    Toast.show(`Exported ${data.length} records`, 'success');
  }
};

// ── Paginator ──────────────────────────────────────────────────────────────────
class Paginator {
  constructor(data, perPage = 10) { this.data = data; this.perPage = perPage; this.page = 1; }
  get totalPages() { return Math.max(1, Math.ceil(this.data.length / this.perPage)); }
  get current() { const s = (this.page - 1) * this.perPage; return this.data.slice(s, s + this.perPage); }
  setData(data) { this.data = data; this.page = 1; }
  renderControls(containerId, onPageChange) {
    const el = document.getElementById(containerId);
    if (!el) return;
    const total = this.totalPages;
    let html = `<div class="flex flex-wrap items-center gap-2"><div class="pagination">`;
    html += `<button class="page-btn" onclick="(${onPageChange})(${this.page - 1})" ${this.page === 1 ? 'disabled style="opacity:0.4;cursor:not-allowed"' : ''}>&#8249;</button>`;
    for (let i = 1; i <= total; i++) {
      if (total > 7 && i > 2 && i < total - 1 && Math.abs(i - this.page) > 1) {
        if (i === 3 || i === total - 2) html += `<span class="page-btn" style="cursor:default">…</span>`;
        continue;
      }
      html += `<button class="page-btn ${i === this.page ? 'active' : ''}" onclick="(${onPageChange})(${i})">${i}</button>`;
    }
    html += `<button class="page-btn" onclick="(${onPageChange})(${this.page + 1})" ${this.page === total ? 'disabled style="opacity:0.4;cursor:not-allowed"' : ''}>&#8250;</button>`;
    html += `</div><span class="text-xs text-slate-400">Page ${this.page} of ${total} &middot; ${this.data.length} records</span></div>`;
    el.innerHTML = html;
  }
}

// ── Skeleton ───────────────────────────────────────────────────────────────────
const Skeleton = {
  table(rows = 5, cols = 5) {
    return Array(rows).fill(0).map(() =>
      `<tr>${Array(cols).fill(0).map(() =>
        `<td class="px-4 py-3"><div class="skeleton h-4 w-full"></div></td>`
      ).join('')}</tr>`
    ).join('');
  }
};

// ── Keyboard Shortcuts ─────────────────────────────────────────────────────────
document.addEventListener('keydown', e => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault();
    const s = document.getElementById('global-search');
    if (s) { s.focus(); s.select(); }
  }
  if (e.key === 'Escape') Modal.closeAll();
});

// ── Close dropdowns on outside click ──────────────────────────────────────────
document.addEventListener('click', e => {
  if (!e.target.closest('[data-dropdown-parent]'))
    document.querySelectorAll('.dropdown.open').forEach(d => d.classList.remove('open'));
});

// ── Init ───────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  Theme.init();
  Toast.init();
  if (!Store.get('students').length) seedDemoData();
});

// ── Demo Data Seeder ───────────────────────────────────────────────────────────
function seedDemoData() {
  const classes   = ['10-A','10-B','11-A','11-B','12-A','12-B'];
  const firstNames = ['Aiden','Bella','Carlos','Diana','Ethan','Fiona','George','Hannah','Ivan','Julia',
                      'Kevin','Laura','Marcus','Nina','Oscar','Priya','Quinn','Rachel','Samuel','Tara',
                      'Uma','Victor','Wendy','Xander','Yara','Zoe'];
  const lastNames  = ['Smith','Johnson','Williams','Brown','Jones','Garcia','Miller','Davis','Wilson',
                      'Moore','Taylor','Anderson','Thomas','Jackson','White','Harris','Martin','Thompson','Lee','Walker'];

  const students = Array.from({ length: 40 }, (_, i) => ({
    id:       genId(),
    rollNo:   `STU${String(i + 1).padStart(3, '0')}`,
    name:     `${firstNames[i % firstNames.length]} ${lastNames[i % lastNames.length]}`,
    email:    `student${i + 1}@school.edu`,
    phone:    `+1-555-${String(1000 + i).padStart(4, '0')}`,
    class:    classes[i % classes.length],
    dob:      `200${3 + (i % 5)}-0${1 + (i % 9)}-${10 + (i % 18)}`,
    gender:   i % 2 === 0 ? 'Male' : 'Female',
    address:  `${100 + i} Main St, City`,
    status:   i % 7 === 0 ? 'Inactive' : 'Active',
    avatar:   (firstNames[i % firstNames.length][0] + lastNames[i % lastNames.length][0]).toUpperCase(),
    joinDate: `202${2 + (i % 2)}-0${1 + (i % 9)}-01`,
    feesPaid: Math.random() > 0.3
  }));
  Store.set('students', students);

  // Attendance
  const attendance = {};
  students.forEach(s => {
    attendance[s.id] = {};
    for (let d = 1; d <= 30; d++) {
      const r = Math.random();
      attendance[s.id][d] = r > 0.15 ? 'present' : r > 0.05 ? 'absent' : 'holiday';
    }
  });
  Store.set('attendance', attendance);

  // Fees
  Store.set('fees', students.map(s => ({
    id:          genId(),
    studentId:   s.id,
    studentName: s.name,
    class:       s.class,
    totalFee:    12000,
    paidAmount:  s.feesPaid ? 12000 : Math.floor(Math.random() * 8000),
    dueDate:     '2024-12-31',
    status:      s.feesPaid ? 'Paid' : (Math.random() > 0.5 ? 'Partial' : 'Pending'),
    lastPayment: s.feesPaid ? '2024-01-15' : '2023-12-01'
  })));

  // Results
  const subjects = ['Mathematics','Science','English','History','Computer'];
  Store.set('results', students.map(s => {
    const subjectScores = subjects.map(name => ({ name, marks: Math.floor(50 + Math.random() * 50), total: 100 }));
    const pct = Math.round(subjectScores.reduce((a, s) => a + s.marks, 0) / subjects.length);
    const grade = pct >= 90 ? 'A+' : pct >= 80 ? 'A' : pct >= 70 ? 'B+' : pct >= 60 ? 'B' : 'C';
    return { id: genId(), studentId: s.id, studentName: s.name, class: s.class, exam: 'Mid-Term 2024', subjects: subjectScores, grade, percentage: pct };
  }));

  // Notifications
  Store.set('notifications', [
    { id: genId(), title: 'Fee Reminder',    message: '15 students have pending fees due this month.', type: 'warning', time: '2 hours ago',  read: false },
    { id: genId(), title: 'Exam Schedule',   message: 'Mid-term exams scheduled for next week.',        type: 'info',    time: '5 hours ago',  read: false },
    { id: genId(), title: 'New Enrollment',  message: '3 new students enrolled today.',                 type: 'success', time: '1 day ago',    read: true  },
    { id: genId(), title: 'Attendance Alert',message: '5 students below 75% attendance.',               type: 'error',   time: '2 days ago',   read: true  },
    { id: genId(), title: 'Result Published',message: 'Class 10 results have been published.',          type: 'success', time: '3 days ago',   read: true  }
  ]);

  // Timetable
  Store.set('timetable', {
    'Monday':    ['Mathematics','English','Science','History','Computer','P.E.'],
    'Tuesday':   ['Science','Mathematics','English','Computer','History','Art'],
    'Wednesday': ['English','History','Mathematics','Science','Art','P.E.'],
    'Thursday':  ['Computer','Science','History','Mathematics','English','Music'],
    'Friday':    ['History','Computer','P.E.','English','Mathematics','Science']
  });
}
