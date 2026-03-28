// ===== students.js — Student CRUD, search, filter, pagination =====

let allStudents = [];
let paginator;

const SCHEMA = {
  name:   [Validator.rules.required, Validator.rules.minLen(2)],
  rollNo: [Validator.rules.required],
  email:  [Validator.rules.required, Validator.rules.email],
  phone:  [Validator.rules.required, Validator.rules.phone],
  class:  [Validator.rules.required]
};

const AVATAR_COLORS = ['#6366f1','#8b5cf6','#ec4899','#f59e0b','#10b981','#3b82f6','#ef4444','#06b6d4'];
const avatarColor = name => AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];

// ── Init ───────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  renderSidebar('students');
  renderNavbar('Students');
  loadStudents();
  Validator.liveValidate(document.getElementById('student-form'), SCHEMA);
});

// ── Load & Render ──────────────────────────────────────────────────────────────
function loadStudents() {
  allStudents = Store.get('students');
  paginator = new Paginator(allStudents, 10);
  renderTable();
}

function renderTable() {
  const tbody = document.getElementById('students-tbody');
  const page = paginator.current;

  if (!page.length) {
    tbody.innerHTML = `<tr><td colspan="6" class="text-center py-16 text-slate-400">
      <div class="text-4xl mb-3">🎓</div>
      <div class="font-medium">No students found</div>
      <div class="text-sm mt-1">Try adjusting your search or filters</div>
    </td></tr>`;
    document.getElementById('pagination-container').innerHTML = '';
    return;
  }

  tbody.innerHTML = page.map(s => `
    <tr>
      <td>
        <div class="flex items-center gap-3">
          <div class="avatar text-sm" style="background:${avatarColor(s.name)};color:#fff;width:36px;height:36px">${s.avatar}</div>
          <div>
            <div class="font-medium text-slate-800 dark:text-slate-100">${s.name}</div>
            <div class="text-xs text-slate-400">${s.email}</div>
          </div>
        </div>
      </td>
      <td class="hide-mobile"><span class="font-mono text-xs bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">${s.rollNo}</span></td>
      <td class="hide-mobile"><span class="badge badge-blue">Class ${s.class}</span></td>
      <td class="hide-mobile text-sm text-slate-500 dark:text-slate-400">${s.phone}</td>
      <td><span class="badge ${s.status === 'Active' ? 'badge-green' : 'badge-red'}">${s.status}</span></td>
      <td>
        <div class="flex items-center gap-1">
          <button onclick="viewStudent('${s.id}')" class="p-1.5 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-indigo-500 transition-colors" title="View">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
          </button>
          <button onclick="editStudent('${s.id}')" class="p-1.5 rounded-lg hover:bg-yellow-50 dark:hover:bg-yellow-900/30 text-yellow-500 transition-colors" title="Edit">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
          </button>
          <button onclick="confirmDelete('${s.id}')" class="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 text-red-500 transition-colors" title="Delete">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
          </button>
        </div>
      </td>
    </tr>`).join('');

  paginator.renderControls('pagination-container', `function(p){paginator.page=p;renderTable()}`);
}

// ── Filter ─────────────────────────────────────────────────────────────────────
function filterStudents() {
  const q = document.getElementById('search-input').value.toLowerCase();
  const cls = document.getElementById('class-filter').value;
  const status = document.getElementById('status-filter').value;

  const filtered = allStudents.filter(s => {
    const matchQ = !q || s.name.toLowerCase().includes(q) || s.rollNo.toLowerCase().includes(q) || s.email.toLowerCase().includes(q);
    const matchCls = !cls || s.class === cls;
    const matchStatus = !status || s.status === status;
    return matchQ && matchCls && matchStatus;
  });

  paginator.setData(filtered);
  renderTable();
}

// ── Add Modal ──────────────────────────────────────────────────────────────────
function openAddModal() {
  const form = document.getElementById('student-form');
  form.reset();
  form.querySelector('[name="id"]').value = '';
  document.getElementById('modal-title').textContent = 'Add Student';
  // Clear errors
  form.querySelectorAll('.form-error').forEach(e => e.textContent = '');
  form.querySelectorAll('.form-input').forEach(i => i.classList.remove('error'));
  Modal.open('student-modal');
}

// ── Edit ───────────────────────────────────────────────────────────────────────
function editStudent(id) {
  const s = allStudents.find(s => s.id === id);
  if (!s) return;
  const form = document.getElementById('student-form');
  form.reset();
  form.querySelectorAll('.form-error').forEach(e => e.textContent = '');
  form.querySelectorAll('.form-input').forEach(i => i.classList.remove('error'));
  Object.entries(s).forEach(([k, v]) => {
    const input = form.querySelector(`[name="${k}"]`);
    if (input) input.value = v;
  });
  document.getElementById('modal-title').textContent = 'Edit Student';
  Modal.open('student-modal');
}

// ── Save ───────────────────────────────────────────────────────────────────────
function saveStudent(e) {
  e.preventDefault();
  const form = document.getElementById('student-form');
  if (!Validator.validate(form, SCHEMA)) return;

  const data = Object.fromEntries(new FormData(form));
  const isEdit = !!data.id;

  if (isEdit) {
    data.avatar = data.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
    Store.update('students', data.id, data);
    Toast.show('Student updated successfully', 'success');
  } else {
    const student = {
      ...data,
      id: genId(),
      avatar: data.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(),
      joinDate: new Date().toISOString().split('T')[0],
      feesPaid: false
    };
    Store.push('students', student);
    // Add fee record
    Store.push('fees', {
      id: genId(), studentId: student.id, studentName: student.name,
      class: student.class, totalFee: 12000, paidAmount: 0,
      dueDate: '2024-12-31', status: 'Pending', lastPayment: '-'
    });
    Toast.show('Student added successfully', 'success');
  }

  Modal.close('student-modal');
  loadStudents();
}

// ── View ───────────────────────────────────────────────────────────────────────
function viewStudent(id) {
  const s = allStudents.find(s => s.id === id);
  if (!s) return;
  const fields = [
    ['Roll No', s.rollNo], ['Class', s.class], ['Email', s.email],
    ['Phone', s.phone], ['Gender', s.gender], ['Date of Birth', s.dob],
    ['Address', s.address], ['Join Date', s.joinDate], ['Status', s.status]
  ];
  document.getElementById('view-content').innerHTML = `
    <div class="flex items-center gap-4 mb-6 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
      <div class="avatar text-xl" style="background:${avatarColor(s.name)};color:#fff;width:56px;height:56px">${s.avatar}</div>
      <div>
        <div class="text-xl font-bold text-slate-800 dark:text-slate-100">${s.name}</div>
        <div class="text-sm text-slate-400 mt-0.5">Class ${s.class} · ${s.rollNo}</div>
        <span class="badge ${s.status === 'Active' ? 'badge-green' : 'badge-red'} mt-1">${s.status}</span>
      </div>
    </div>
    <div class="grid grid-cols-2 gap-3">
      ${fields.map(([label, val]) => `
        <div class="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
          <div class="text-xs text-slate-400 mb-1">${label}</div>
          <div class="text-sm font-medium text-slate-800 dark:text-slate-100">${val || '—'}</div>
        </div>`).join('')}
    </div>
    <div class="flex gap-3 mt-5">
      <button onclick="Modal.close('view-modal');editStudent('${s.id}')" class="btn btn-primary flex-1">Edit Student</button>
      <button onclick="Modal.close('view-modal')" class="btn btn-secondary flex-1">Close</button>
    </div>`;
  Modal.open('view-modal');
}

// ── Delete ─────────────────────────────────────────────────────────────────────
function confirmDelete(id) {
  document.getElementById('confirm-delete-btn').onclick = () => deleteStudent(id);
  Modal.open('delete-modal');
}

function deleteStudent(id) {
  Store.remove('students', id);
  Store.set('fees', Store.get('fees').filter(f => f.studentId !== id));
  Store.set('results', Store.get('results').filter(r => r.studentId !== id));
  const att = Store.get('attendance', {});
  delete att[id];
  Store.set('attendance', att);
  Modal.close('delete-modal');
  Toast.show('Student deleted', 'error');
  loadStudents();
}

// ── Export ─────────────────────────────────────────────────────────────────────
function exportStudents() {
  const data = allStudents.map(({ id, avatar, feesPaid, ...rest }) => rest);
  CSV.export(data, 'students.csv');
}
