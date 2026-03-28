// ===== fees.js — Fee management, payment recording, charts =====

let allFees = [];
let feePaginator;

document.addEventListener('DOMContentLoaded', () => {
  renderSidebar('fees');
  renderNavbar('Fees Management');
  loadFees();
  renderFeeCharts();
  populateStudentSelect();
  document.querySelector('[name="paymentDate"]').value = new Date().toISOString().split('T')[0];
});

// ── Load ───────────────────────────────────────────────────────────────────────
function loadFees() {
  allFees = Store.get('fees');
  feePaginator = new Paginator(allFees, 10);
  renderFeeStats();
  renderFeesTable();
}

// ── Stats ──────────────────────────────────────────────────────────────────────
function renderFeeStats() {
  const total = allFees.reduce((a, f) => a + f.totalFee, 0);
  const collected = allFees.reduce((a, f) => a + f.paidAmount, 0);
  const pending = total - collected;
  const paidCount = allFees.filter(f => f.status === 'Paid').length;
  const pendingCount = allFees.filter(f => f.status === 'Pending').length;

  const stats = [
    { label: 'Total Fees', value: `$${(total/1000).toFixed(1)}k`, sub: `${allFees.length} students`, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-900/30' },
    { label: 'Collected', value: `$${(collected/1000).toFixed(1)}k`, sub: `${Math.round(collected/total*100)}% of total`, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/30' },
    { label: 'Pending', value: `$${(pending/1000).toFixed(1)}k`, sub: `${pendingCount} students`, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/30' },
    { label: 'Fully Paid', value: paidCount, sub: `${Math.round(paidCount/allFees.length*100)}% students`, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/30' }
  ];

  document.getElementById('fee-stats').innerHTML = stats.map(s => `
    <div class="stat-card ${s.bg}">
      <div class="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">${s.label}</div>
      <div class="text-2xl font-bold ${s.color}">${s.value}</div>
      <div class="text-xs text-slate-400 mt-1">${s.sub}</div>
    </div>`).join('');
}

// ── Table ──────────────────────────────────────────────────────────────────────
function renderFeesTable() {
  const tbody = document.getElementById('fees-tbody');
  const page = feePaginator.current;

  if (!page.length) {
    tbody.innerHTML = `<tr><td colspan="8" class="text-center py-12 text-slate-400">No fee records found</td></tr>`;
    document.getElementById('fees-pagination').innerHTML = '';
    return;
  }

  tbody.innerHTML = page.map(f => {
    const balance = f.totalFee - f.paidAmount;
    const pct = Math.round((f.paidAmount / f.totalFee) * 100);
    const statusBadge = f.status === 'Paid' ? 'badge-green' : f.status === 'Partial' ? 'badge-yellow' : 'badge-red';
    const barColor = pct >= 100 ? '#10b981' : pct >= 50 ? '#f59e0b' : '#ef4444';
    return `
      <tr>
        <td>
          <div class="font-medium text-slate-800 dark:text-slate-100">${f.studentName}</div>
          <div class="text-xs text-slate-400">Due: ${f.dueDate}</div>
        </td>
        <td class="hide-mobile"><span class="badge badge-blue">Class ${f.class}</span></td>
        <td class="font-semibold text-slate-700 dark:text-slate-200">$${f.totalFee.toLocaleString()}</td>
        <td class="font-semibold text-green-600">$${f.paidAmount.toLocaleString()}</td>
        <td class="font-semibold ${balance > 0 ? 'text-red-500' : 'text-green-600'}">$${balance.toLocaleString()}</td>
        <td style="min-width:120px">
          <div class="flex items-center gap-2">
            <div class="progress-bar flex-1">
              <div class="progress-fill" style="width:${pct}%;background:${barColor}"></div>
            </div>
            <span class="text-xs font-medium text-slate-500">${pct}%</span>
          </div>
        </td>
        <td><span class="badge ${statusBadge}">${f.status}</span></td>
        <td>
          <button onclick="openPaymentModal('${f.id}')" class="btn btn-primary text-xs py-1.5 px-3">Pay</button>
        </td>
      </tr>`;
  }).join('');

  feePaginator.renderControls('fees-pagination', `function(p){feePaginator.page=p;renderFeesTable()}`);
}

// ── Filter ─────────────────────────────────────────────────────────────────────
function filterFees() {
  const q = document.getElementById('fee-search').value.toLowerCase();
  const status = document.getElementById('fee-status-filter').value;
  const cls = document.getElementById('fee-class-filter').value;
  const filtered = allFees.filter(f =>
    (!q || f.studentName.toLowerCase().includes(q)) &&
    (!status || f.status === status) &&
    (!cls || f.class === cls)
  );
  feePaginator.setData(filtered);
  renderFeesTable();
}

// ── Payment Modal ──────────────────────────────────────────────────────────────
function openPaymentModal(feeId = null) {
  const form = document.getElementById('payment-form');
  form.reset();
  form.querySelector('[name="paymentDate"]').value = new Date().toISOString().split('T')[0];
  document.getElementById('fee-info-box').classList.add('hidden');

  if (feeId) {
    const fee = allFees.find(f => f.id === feeId);
    if (fee) {
      form.querySelector('[name="feeId"]').value = feeId;
      form.querySelector('[name="studentId"]').value = fee.studentId;
      document.getElementById('payment-modal-title').textContent = `Payment — ${fee.studentName}`;
      showFeeInfo(fee);
    }
  } else {
    document.getElementById('payment-modal-title').textContent = 'Record Payment';
    form.querySelector('[name="feeId"]').value = '';
  }
  Modal.open('payment-modal');
}

function populateStudentSelect() {
  const students = Store.get('students');
  const sel = document.getElementById('payment-student-select');
  sel.innerHTML = `<option value="">Select student</option>` +
    students.map(s => `<option value="${s.id}">${s.name} (${s.rollNo})</option>`).join('');
}

function onStudentSelect() {
  const studentId = document.getElementById('payment-student-select').value;
  const fee = allFees.find(f => f.studentId === studentId);
  if (fee) {
    document.getElementById('payment-form').querySelector('[name="feeId"]').value = fee.id;
    showFeeInfo(fee);
  } else {
    document.getElementById('fee-info-box').classList.add('hidden');
  }
}

function showFeeInfo(fee) {
  const balance = fee.totalFee - fee.paidAmount;
  const box = document.getElementById('fee-info-box');
  box.classList.remove('hidden');
  box.innerHTML = `
    <div class="grid grid-cols-3 gap-2 text-center">
      <div><div class="text-xs text-slate-400">Total</div><div class="font-bold text-slate-700 dark:text-slate-200">$${fee.totalFee.toLocaleString()}</div></div>
      <div><div class="text-xs text-slate-400">Paid</div><div class="font-bold text-green-600">$${fee.paidAmount.toLocaleString()}</div></div>
      <div><div class="text-xs text-slate-400">Balance</div><div class="font-bold text-red-500">$${balance.toLocaleString()}</div></div>
    </div>`;
}

// ── Save Payment ───────────────────────────────────────────────────────────────
function savePayment(e) {
  e.preventDefault();
  const form = document.getElementById('payment-form');
  const feeId = form.querySelector('[name="feeId"]').value;
  const amount = parseFloat(form.querySelector('[name="amount"]').value);
  const paymentDate = form.querySelector('[name="paymentDate"]').value;

  if (!feeId) return Toast.show('Please select a student', 'error');
  if (!amount || amount <= 0) return Toast.show('Enter a valid amount', 'error');

  const fees = Store.get('fees');
  const idx = fees.findIndex(f => f.id === feeId);
  if (idx === -1) return;

  fees[idx].paidAmount = Math.min(fees[idx].totalFee, fees[idx].paidAmount + amount);
  fees[idx].lastPayment = paymentDate;
  fees[idx].status = fees[idx].paidAmount >= fees[idx].totalFee ? 'Paid' : fees[idx].paidAmount > 0 ? 'Partial' : 'Pending';
  Store.set('fees', fees);

  Modal.close('payment-modal');
  Toast.show(`Payment of $${amount.toLocaleString()} recorded successfully`, 'success');
  loadFees();
  renderFeeCharts();
}

// ── Charts ─────────────────────────────────────────────────────────────────────
function renderFeeCharts() {
  const isDark = document.documentElement.classList.contains('dark');
  const gridColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
  const textColor = isDark ? '#94a3b8' : '#64748b';
  const fees = Store.get('fees');

  // Bar chart
  const classes = ['10-A','10-B','11-A','11-B','12-A','12-B'];
  const collected = classes.map(c => fees.filter(f => f.class === c).reduce((a, f) => a + f.paidAmount, 0));
  const pending = classes.map(c => fees.filter(f => f.class === c).reduce((a, f) => a + (f.totalFee - f.paidAmount), 0));

  const barCtx = document.getElementById('fee-chart');
  if (barCtx._chart) barCtx._chart.destroy();
  barCtx._chart = new Chart(barCtx, {
    type: 'bar',
    data: {
      labels: classes,
      datasets: [
        { label: 'Collected', data: collected, backgroundColor: 'rgba(99,102,241,0.8)', borderRadius: 5 },
        { label: 'Pending', data: pending, backgroundColor: 'rgba(239,68,68,0.6)', borderRadius: 5 }
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { labels: { color: textColor, font: { size: 11 } } } },
      scales: {
        x: { stacked: true, grid: { display: false }, ticks: { color: textColor } },
        y: { stacked: true, grid: { color: gridColor }, ticks: { color: textColor, callback: v => '$' + (v/1000) + 'k' } }
      }
    }
  });

  // Donut
  const paid = fees.filter(f => f.status === 'Paid').length;
  const partial = fees.filter(f => f.status === 'Partial').length;
  const unpaid = fees.filter(f => f.status === 'Pending').length;
  const donutCtx = document.getElementById('fee-donut');
  if (donutCtx._chart) donutCtx._chart.destroy();
  donutCtx._chart = new Chart(donutCtx, {
    type: 'doughnut',
    data: {
      labels: ['Paid', 'Partial', 'Pending'],
      datasets: [{ data: [paid, partial, unpaid], backgroundColor: ['#10b981','#f59e0b','#ef4444'], borderWidth: 0, hoverOffset: 6 }]
    },
    options: { responsive: true, maintainAspectRatio: false, cutout: '70%', plugins: { legend: { display: false } } }
  });

  document.getElementById('fee-legend').innerHTML = [
    { label: 'Paid', count: paid, color: '#10b981' },
    { label: 'Partial', count: partial, color: '#f59e0b' },
    { label: 'Pending', count: unpaid, color: '#ef4444' }
  ].map(i => `
    <div class="flex items-center justify-between text-sm">
      <div class="flex items-center gap-2"><div class="w-3 h-3 rounded-full" style="background:${i.color}"></div><span class="text-slate-600 dark:text-slate-300">${i.label}</span></div>
      <span class="font-semibold text-slate-700 dark:text-slate-200">${i.count}</span>
    </div>`).join('');
}

// ── Export ─────────────────────────────────────────────────────────────────────
function exportFees() {
  const data = allFees.map(f => ({
    Student: f.studentName, Class: f.class, TotalFee: f.totalFee,
    PaidAmount: f.paidAmount, Balance: f.totalFee - f.paidAmount,
    Status: f.status, DueDate: f.dueDate, LastPayment: f.lastPayment
  }));
  CSV.export(data, 'fees.csv');
}
