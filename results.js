// ===== results.js — Exam results, grades, charts =====

let allResults = [];
let resultPaginator;

const GRADE_COLORS = { 'A+': '#10b981', 'A': '#6366f1', 'B+': '#8b5cf6', 'B': '#3b82f6', 'C': '#f59e0b', 'D': '#ef4444' };
const calcGrade = pct => pct >= 90 ? 'A+' : pct >= 80 ? 'A' : pct >= 70 ? 'B+' : pct >= 60 ? 'B' : pct >= 50 ? 'C' : 'D';

document.addEventListener('DOMContentLoaded', () => {
  renderSidebar('results');
  renderNavbar('Exams & Results');
  loadResults();
  renderResultCharts();
  populateStudentSelect();
});

// ── Load ───────────────────────────────────────────────────────────────────────
function loadResults() {
  allResults = Store.get('results');
  resultPaginator = new Paginator(allResults, 10);
  renderResultStats();
  renderResultsTable();
}

// ── Stats ──────────────────────────────────────────────────────────────────────
function renderResultStats() {
  const avg = allResults.length ? Math.round(allResults.reduce((a, r) => a + r.percentage, 0) / allResults.length) : 0;
  const toppers = allResults.filter(r => r.grade === 'A+').length;
  const passed = allResults.filter(r => r.percentage >= 50).length;
  const failed = allResults.filter(r => r.percentage < 50).length;

  const stats = [
    { label: 'Average Score', value: `${avg}%`, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-900/30' },
    { label: 'A+ Grades', value: toppers, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/30' },
    { label: 'Passed', value: passed, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/30' },
    { label: 'Failed', value: failed, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/30' }
  ];

  document.getElementById('result-stats').innerHTML = stats.map(s => `
    <div class="stat-card ${s.bg}">
      <div class="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">${s.label}</div>
      <div class="text-2xl font-bold ${s.color}">${s.value}</div>
    </div>`).join('');
}

// ── Table ──────────────────────────────────────────────────────────────────────
function renderResultsTable() {
  const tbody = document.getElementById('results-tbody');
  const page = resultPaginator.current;

  if (!page.length) {
    tbody.innerHTML = `<tr><td colspan="7" class="text-center py-12 text-slate-400">No results found</td></tr>`;
    document.getElementById('results-pagination').innerHTML = '';
    return;
  }

  tbody.innerHTML = page.map(r => {
    const gradeColor = GRADE_COLORS[r.grade] || '#94a3b8';
    const pctColor = r.percentage >= 80 ? 'text-green-600' : r.percentage >= 60 ? 'text-indigo-600' : r.percentage >= 50 ? 'text-yellow-600' : 'text-red-500';
    const subjectSummary = r.subjects.map(s => `${s.name[0]}:${s.marks}`).join(' · ');
    return `
      <tr>
        <td>
          <div class="font-medium text-slate-800 dark:text-slate-100">${r.studentName}</div>
        </td>
        <td class="hide-mobile"><span class="badge badge-blue">Class ${r.class}</span></td>
        <td class="hide-mobile text-sm text-slate-500 dark:text-slate-400">${r.exam}</td>
        <td><span class="text-xs text-slate-400 font-mono">${subjectSummary}</span></td>
        <td>
          <div class="flex items-center gap-2">
            <div class="progress-bar w-16">
              <div class="progress-fill" style="width:${r.percentage}%;background:${gradeColor}"></div>
            </div>
            <span class="text-sm font-bold ${pctColor}">${r.percentage}%</span>
          </div>
        </td>
        <td>
          <span class="font-bold text-lg" style="color:${gradeColor}">${r.grade}</span>
        </td>
        <td>
          <button onclick="viewResult('${r.id}')" class="p-1.5 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-indigo-500 transition-colors" title="View Details">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
          </button>
        </td>
      </tr>`;
  }).join('');

  resultPaginator.renderControls('results-pagination', `function(p){resultPaginator.page=p;renderResultsTable()}`);
}

// ── Filter ─────────────────────────────────────────────────────────────────────
function filterResults() {
  const q = document.getElementById('result-search').value.toLowerCase();
  const cls = document.getElementById('result-class-filter').value;
  const grade = document.getElementById('result-grade-filter').value;
  const filtered = allResults.filter(r =>
    (!q || r.studentName.toLowerCase().includes(q)) &&
    (!cls || r.class === cls) &&
    (!grade || r.grade === grade)
  );
  resultPaginator.setData(filtered);
  renderResultsTable();
}

// ── View Detail ────────────────────────────────────────────────────────────────
function viewResult(id) {
  const r = allResults.find(r => r.id === id);
  if (!r) return;
  const gradeColor = GRADE_COLORS[r.grade] || '#94a3b8';
  document.getElementById('result-detail-content').innerHTML = `
    <div class="flex items-center justify-between mb-5 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
      <div>
        <div class="text-lg font-bold text-slate-800 dark:text-slate-100">${r.studentName}</div>
        <div class="text-sm text-slate-400">Class ${r.class} · ${r.exam}</div>
      </div>
      <div class="text-center">
        <div class="text-4xl font-black" style="color:${gradeColor}">${r.grade}</div>
        <div class="text-sm text-slate-400">${r.percentage}%</div>
      </div>
    </div>
    <div class="space-y-3">
      ${r.subjects.map(s => {
        const pct = Math.round((s.marks / s.total) * 100);
        const color = pct >= 80 ? '#10b981' : pct >= 60 ? '#6366f1' : pct >= 50 ? '#f59e0b' : '#ef4444';
        return `
          <div>
            <div class="flex justify-between text-sm mb-1">
              <span class="font-medium text-slate-700 dark:text-slate-200">${s.name}</span>
              <span class="font-bold" style="color:${color}">${s.marks}/${s.total} (${pct}%)</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" style="width:${pct}%;background:${color}"></div>
            </div>
          </div>`;
      }).join('')}
    </div>
    <div class="mt-5 p-4 rounded-xl border border-slate-100 dark:border-slate-700 flex items-center justify-between">
      <div class="text-sm text-slate-500 dark:text-slate-400">Total Marks</div>
      <div class="font-bold text-slate-800 dark:text-slate-100">
        ${r.subjects.reduce((a, s) => a + s.marks, 0)} / ${r.subjects.reduce((a, s) => a + s.total, 0)}
      </div>
    </div>`;
  Modal.open('result-detail-modal');
}

// ── Add Result ─────────────────────────────────────────────────────────────────
function openResultModal() {
  document.getElementById('result-form').reset();
  Modal.open('result-modal');
}

function populateStudentSelect() {
  const students = Store.get('students');
  const sel = document.getElementById('result-student-select');
  sel.innerHTML = `<option value="">Select student</option>` +
    students.map(s => `<option value="${s.id}" data-class="${s.class}" data-name="${s.name}">${s.name} (${s.rollNo})</option>`).join('');
}

function saveResult(e) {
  e.preventDefault();
  const form = document.getElementById('result-form');
  const data = Object.fromEntries(new FormData(form));
  if (!data.studentId) return Toast.show('Please select a student', 'error');

  const opt = form.querySelector(`[name="studentId"] option[value="${data.studentId}"]`);
  const subjects = [
    { name: 'Mathematics', marks: parseInt(data.math) || 0, total: 100 },
    { name: 'Science', marks: parseInt(data.science) || 0, total: 100 },
    { name: 'English', marks: parseInt(data.english) || 0, total: 100 },
    { name: 'History', marks: parseInt(data.history) || 0, total: 100 },
    { name: 'Computer', marks: parseInt(data.computer) || 0, total: 100 }
  ];
  const totalMarks = subjects.reduce((a, s) => a + s.marks, 0);
  const percentage = Math.round(totalMarks / 5);
  const grade = calcGrade(percentage);

  Store.push('results', {
    id: genId(),
    studentId: data.studentId,
    studentName: opt?.dataset.name || '',
    class: opt?.dataset.class || '',
    exam: data.exam,
    subjects,
    grade,
    percentage
  });

  Modal.close('result-modal');
  Toast.show('Result added successfully', 'success');
  loadResults();
  renderResultCharts();
}

// ── Charts ─────────────────────────────────────────────────────────────────────
function renderResultCharts() {
  const isDark = document.documentElement.classList.contains('dark');
  const gridColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
  const textColor = isDark ? '#94a3b8' : '#64748b';
  const results = Store.get('results');

  // Grade distribution
  const grades = ['A+','A','B+','B','C','D'];
  const gradeCounts = grades.map(g => results.filter(r => r.grade === g).length);
  const gradeCtx = document.getElementById('grade-chart');
  if (gradeCtx._chart) gradeCtx._chart.destroy();
  gradeCtx._chart = new Chart(gradeCtx, {
    type: 'bar',
    data: {
      labels: grades,
      datasets: [{ label: 'Students', data: gradeCounts, backgroundColor: grades.map(g => GRADE_COLORS[g] || '#94a3b8'), borderRadius: 6, borderSkipped: false }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false }, ticks: { color: textColor } },
        y: { grid: { color: gridColor }, ticks: { color: textColor } }
      }
    }
  });

  // Subject averages
  const subjects = ['Mathematics','Science','English','History','Computer'];
  const subjectAvgs = subjects.map(sub => {
    const marks = results.flatMap(r => r.subjects.filter(s => s.name === sub).map(s => s.marks));
    return marks.length ? Math.round(marks.reduce((a, b) => a + b, 0) / marks.length) : 0;
  });
  const subCtx = document.getElementById('subject-chart');
  if (subCtx._chart) subCtx._chart.destroy();
  subCtx._chart = new Chart(subCtx, {
    type: 'radar',
    data: {
      labels: subjects.map(s => s.slice(0, 4)),
      datasets: [{
        label: 'Avg Score',
        data: subjectAvgs,
        borderColor: '#6366f1', backgroundColor: 'rgba(99,102,241,0.15)',
        borderWidth: 2, pointBackgroundColor: '#6366f1', pointRadius: 4
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: { r: { min: 0, max: 100, ticks: { color: textColor, font: { size: 10 } }, grid: { color: gridColor }, pointLabels: { color: textColor } } }
    }
  });
}

// ── Export ─────────────────────────────────────────────────────────────────────
function exportResults() {
  const data = allResults.map(r => ({
    Student: r.studentName, Class: r.class, Exam: r.exam,
    ...Object.fromEntries(r.subjects.map(s => [s.name, s.marks])),
    Percentage: r.percentage, Grade: r.grade
  }));
  CSV.export(data, 'results.csv');
}
