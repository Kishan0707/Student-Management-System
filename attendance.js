// ===== attendance.js — Attendance marking, stats, charts =====

const DAYS = 30;
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
let attPaginator;
let attStudents = [];

document.addEventListener('DOMContentLoaded', () => {
  renderSidebar('attendance');
  renderNavbar('Attendance');
  document.getElementById('current-month').textContent = MONTHS[new Date().getMonth()] + ' ' + new Date().getFullYear();
  loadAttendance();
  renderTrendChart();
});

// ── Load ───────────────────────────────────────────────────────────────────────
function loadAttendance() {
  const cls = document.getElementById('att-class-filter').value;
  const q = document.getElementById('att-search').value.toLowerCase();
  const students = Store.get('students').filter(s =>
    (!cls || s.class === cls) && (!q || s.name.toLowerCase().includes(q))
  );
  attStudents = students;
  attPaginator = new Paginator(students, 8);
  renderAttStats(students);
  renderTodaySummary(students);
  renderAttTable();
}

// ── Stats ──────────────────────────────────────────────────────────────────────
function renderAttStats(students) {
  const attendance = Store.get('attendance', {});
  let totalPresent = 0, totalAbsent = 0, totalHoliday = 0, totalDays = 0;
  students.forEach(s => {
    const days = attendance[s.id] || {};
    Object.values(days).forEach(v => {
      totalDays++;
      if (v === 'present') totalPresent++;
      else if (v === 'absent') totalAbsent++;
      else if (v === 'holiday') totalHoliday++;
    });
  });
  const rate = totalDays ? Math.round((totalPresent / totalDays) * 100) : 0;
  const stats = [
    { label: 'Avg. Attendance', value: `${rate}%`, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-900/30' },
    { label: 'Total Present', value: totalPresent, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/30' },
    { label: 'Total Absent', value: totalAbsent, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/30' },
    { label: 'Holidays', value: totalHoliday, color: 'text-yellow-600', bg: 'bg-yellow-50 dark:bg-yellow-900/30' }
  ];
  document.getElementById('att-stats').innerHTML = stats.map(s => `
    <div class="stat-card ${s.bg}">
      <div class="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">${s.label}</div>
      <div class="text-2xl font-bold ${s.color}">${s.value}</div>
    </div>`).join('');
}

// ── Today Summary ──────────────────────────────────────────────────────────────
function renderTodaySummary(students) {
  const attendance = Store.get('attendance', {});
  const today = new Date().getDate();
  let present = 0, absent = 0, unmarked = 0;
  students.forEach(s => {
    const v = (attendance[s.id] || {})[today];
    if (v === 'present') present++;
    else if (v === 'absent') absent++;
    else unmarked++;
  });
  const total = students.length;
  const items = [
    { label: 'Present', count: present, color: '#10b981', pct: total ? Math.round(present/total*100) : 0 },
    { label: 'Absent', count: absent, color: '#ef4444', pct: total ? Math.round(absent/total*100) : 0 },
    { label: 'Unmarked', count: unmarked, color: '#94a3b8', pct: total ? Math.round(unmarked/total*100) : 0 }
  ];
  document.getElementById('today-summary').innerHTML = items.map(i => `
    <div>
      <div class="flex justify-between text-sm mb-1">
        <span class="text-slate-600 dark:text-slate-300">${i.label}</span>
        <span class="font-semibold" style="color:${i.color}">${i.count} (${i.pct}%)</span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill" style="width:${i.pct}%;background:${i.color}"></div>
      </div>
    </div>`).join('');
}

// ── Table ──────────────────────────────────────────────────────────────────────
function renderAttTable() {
  const attendance = Store.get('attendance', {});
  const page = attPaginator.current;

  // Days header
  document.getElementById('days-header').innerHTML = `
    <div style="display:flex;gap:4px;flex-wrap:nowrap;overflow:hidden">
      ${Array.from({length: DAYS}, (_, i) => `<div style="width:28px;text-align:center;font-size:10px;color:#94a3b8;flex-shrink:0">${i+1}</div>`).join('')}
    </div>`;

  const tbody = document.getElementById('att-tbody');
  if (!page.length) {
    tbody.innerHTML = `<tr><td colspan="5" class="text-center py-12 text-slate-400">No students found</td></tr>`;
    document.getElementById('att-pagination').innerHTML = '';
    return;
  }

  tbody.innerHTML = page.map(s => {
    const days = attendance[s.id] || {};
    let present = 0, absent = 0;
    const cells = Array.from({length: DAYS}, (_, i) => {
      const d = i + 1;
      const status = days[d] || 'unmarked';
      if (status === 'present') present++;
      if (status === 'absent') absent++;
      const next = status === 'present' ? 'absent' : status === 'absent' ? 'holiday' : status === 'holiday' ? 'unmarked' : 'present';
      return `<div class="att-day ${status}" style="width:28px;height:28px;flex-shrink:0" onclick="toggleDay('${s.id}',${d},'${next}')" title="Day ${d}: ${status}">${d}</div>`;
    }).join('');
    const rate = Math.round((present / DAYS) * 100);
    const rateColor = rate >= 80 ? 'text-green-600' : rate >= 60 ? 'text-yellow-600' : 'text-red-500';
    return `
      <tr>
        <td>
          <div class="flex items-center gap-2">
            <div class="avatar text-xs" style="background:#6366f1;color:#fff;width:32px;height:32px">${s.avatar}</div>
            <div>
              <div class="text-sm font-medium text-slate-800 dark:text-slate-100">${s.name}</div>
              <div class="text-xs text-slate-400">Class ${s.class}</div>
            </div>
          </div>
        </td>
        <td><div style="display:flex;gap:4px;overflow:hidden">${cells}</div></td>
        <td><span class="font-semibold text-green-600">${present}</span></td>
        <td><span class="font-semibold text-red-500">${absent}</span></td>
        <td>
          <div class="flex items-center gap-2">
            <div class="progress-bar flex-1" style="min-width:60px">
              <div class="progress-fill" style="width:${rate}%;background:${rate>=80?'#10b981':rate>=60?'#f59e0b':'#ef4444'}"></div>
            </div>
            <span class="text-xs font-semibold ${rateColor}">${rate}%</span>
          </div>
        </td>
      </tr>`;
  }).join('');

  attPaginator.renderControls('att-pagination', `function(p){attPaginator.page=p;renderAttTable()}`);
}

// ── Toggle Day ─────────────────────────────────────────────────────────────────
function toggleDay(studentId, day, newStatus) {
  const attendance = Store.get('attendance', {});
  if (!attendance[studentId]) attendance[studentId] = {};
  attendance[studentId][day] = newStatus;
  Store.set('attendance', attendance);
  renderAttTable();
  renderAttStats(attStudents);
  renderTodaySummary(attStudents);
}

// ── Mark All Present ───────────────────────────────────────────────────────────
function markAllPresent() {
  const attendance = Store.get('attendance', {});
  const today = new Date().getDate();
  attStudents.forEach(s => {
    if (!attendance[s.id]) attendance[s.id] = {};
    attendance[s.id][today] = 'present';
  });
  Store.set('attendance', attendance);
  renderAttTable();
  renderAttStats(attStudents);
  renderTodaySummary(attStudents);
  Toast.show(`Marked ${attStudents.length} students present for today`, 'success');
}

// ── Trend Chart ────────────────────────────────────────────────────────────────
function renderTrendChart() {
  const isDark = document.documentElement.classList.contains('dark');
  const gridColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
  const textColor = isDark ? '#94a3b8' : '#64748b';
  new Chart(document.getElementById('att-trend-chart'), {
    type: 'bar',
    data: {
      labels: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
      datasets: [
        { label: 'Present', data: [38,35,40,37,42,20,15], backgroundColor: 'rgba(99,102,241,0.8)', borderRadius: 5 },
        { label: 'Absent', data: [5,8,3,6,2,3,2], backgroundColor: 'rgba(239,68,68,0.7)', borderRadius: 5 }
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { labels: { color: textColor, font: { size: 11 } } } },
      scales: {
        x: { stacked: true, grid: { display: false }, ticks: { color: textColor } },
        y: { stacked: true, grid: { color: gridColor }, ticks: { color: textColor } }
      }
    }
  });
}

// ── Export ─────────────────────────────────────────────────────────────────────
function exportAttendance() {
  const attendance = Store.get('attendance', {});
  const data = attStudents.map(s => {
    const days = attendance[s.id] || {};
    const present = Object.values(days).filter(v => v === 'present').length;
    const absent = Object.values(days).filter(v => v === 'absent').length;
    return { Name: s.name, Class: s.class, RollNo: s.rollNo, Present: present, Absent: absent, Rate: `${Math.round(present/DAYS*100)}%` };
  });
  CSV.export(data, 'attendance.csv');
}
