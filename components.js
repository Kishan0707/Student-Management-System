// ===== components.js — Sidebar & Navbar rendering =====

const NAV_ITEMS = [
  { id: 'dashboard',   label: 'Dashboard',    href: 'index.html',      icon: `<svg class="w-5 h-5 nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>` },
  { id: 'students',    label: 'Students',     href: 'students.html',   icon: `<svg class="w-5 h-5 nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>` },
  { id: 'attendance',  label: 'Attendance',   href: 'attendance.html', icon: `<svg class="w-5 h-5 nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></svg>` },
  { id: 'fees',        label: 'Fees',         href: 'fees.html',       icon: `<svg class="w-5 h-5 nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>` },
  { id: 'results',     label: 'Results',      href: 'results.html',    icon: `<svg class="w-5 h-5 nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>` },
  { id: 'timetable',   label: 'Timetable',    href: 'timetable.html',  icon: `<svg class="w-5 h-5 nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>` },
  { id: 'notifications', label: 'Notifications', href: 'notifications.html', icon: `<svg class="w-5 h-5 nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>` }
];

// ── Render Sidebar ─────────────────────────────────────────────────────────────
function renderSidebar(activeId) {
  const sidebar = document.getElementById('sidebar');
  if (!sidebar) return;

  const unread = Store.get('notifications').filter(n => !n.read).length;

  sidebar.innerHTML = `
    <div class="sidebar-gradient h-full flex flex-col text-white">
      <!-- Logo -->
      <div class="flex items-center gap-3 px-4 py-5 border-b border-white/10">
        <div class="w-9 h-9 rounded-xl bg-indigo-500 flex items-center justify-center flex-shrink-0 shadow-lg">
          <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5z"/>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l6.16-3.422A12.083 12.083 0 0121 12c0 6.075-4.925 11-11 11S1 18.075 1 12c0-.538.036-1.067.106-1.584L12 14z"/>
          </svg>
        </div>
        <div class="sidebar-logo-text overflow-hidden">
          <div class="font-bold text-base leading-tight">EduManage</div>
          <div class="text-xs text-indigo-300">Student Portal</div>
        </div>
      </div>

      <!-- Nav -->
      <nav class="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div class="nav-section-title text-xs font-semibold text-indigo-300 uppercase tracking-wider px-3 mb-2">Main Menu</div>
        ${NAV_ITEMS.map(item => `
          <a href="${item.href}" class="nav-item text-indigo-100 ${activeId === item.id ? 'active' : ''}" title="${item.label}">
            <span class="flex-shrink-0">${item.icon}</span>
            <span class="nav-label text-sm font-medium">${item.label}</span>
            ${item.id === 'notifications' && unread > 0 ? `<span class="nav-label ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">${unread}</span>` : ''}
          </a>
        `).join('')}
      </nav>

      <!-- User Profile -->
      <div class="px-3 py-4 border-t border-white/10">
        <div class="nav-item text-indigo-100">
          <div class="avatar bg-indigo-500 text-white flex-shrink-0 w-8 h-8 text-sm">AD</div>
          <div class="nav-label overflow-hidden">
            <div class="text-sm font-medium truncate">Admin User</div>
            <div class="text-xs text-indigo-300 truncate">admin@school.edu</div>
          </div>
        </div>
      </div>
    </div>`;
}

// ── Render Navbar ──────────────────────────────────────────────────────────────
function renderNavbar(pageTitle) {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  const isDark = document.documentElement.classList.contains('dark');
  const unread = Store.get('notifications').filter(n => !n.read).length;

  navbar.innerHTML = `
    <div class="flex items-center gap-4 flex-1">
      <!-- Sidebar Toggle -->
      <button id="sidebar-toggle" onclick="toggleSidebar()" class="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-slate-500 dark:text-slate-400">
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
        </svg>
      </button>
      <!-- Page Title -->
      <h1 class="text-lg font-semibold text-slate-800 dark:text-slate-100 hidden sm:block">${pageTitle}</h1>
      <!-- Search -->
      <div class="search-bar flex-1 max-w-md ml-2">
        <span class="text-slate-400">${icons.search}</span>
        <input id="global-search" type="text" placeholder="Search… (Ctrl+K)" class="text-slate-700 dark:text-slate-200 placeholder-slate-400 text-sm w-full bg-transparent"/>
        <span class="kbd hidden sm:flex">⌘K</span>
      </div>
    </div>

    <div class="flex items-center gap-2">
      <!-- Theme Toggle -->
      <button id="theme-toggle" onclick="Theme.toggle()" class="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-slate-500 dark:text-slate-400" title="Toggle theme">
        ${isDark ? icons.sun : icons.moon}
      </button>

      <!-- Notifications -->
      <div class="relative" data-dropdown-parent>
        <button onclick="toggleDropdown('notif-dropdown')" class="relative p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-slate-500 dark:text-slate-400">
          ${icons.bell}
          ${unread > 0 ? `<span class="notif-dot"></span>` : ''}
        </button>
        <div id="notif-dropdown" class="dropdown w-80">
          <div class="px-4 py-3 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
            <span class="font-semibold text-sm text-slate-800 dark:text-slate-100">Notifications</span>
            ${unread > 0 ? `<span class="badge badge-purple">${unread} new</span>` : ''}
          </div>
          <div class="max-h-72 overflow-y-auto">
            ${Store.get('notifications').slice(0, 5).map(n => `
              <div class="px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${n.read ? 'opacity-60' : ''}">
                <div class="flex items-start gap-3">
                  <div class="w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${n.type === 'success' ? 'bg-green-500' : n.type === 'error' ? 'bg-red-500' : n.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'}"></div>
                  <div>
                    <div class="text-sm font-medium text-slate-800 dark:text-slate-100">${n.title}</div>
                    <div class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">${n.message}</div>
                    <div class="text-xs text-slate-400 mt-1">${n.time}</div>
                  </div>
                </div>
              </div>`).join('')}
          </div>
          <div class="px-4 py-2 border-t border-slate-100 dark:border-slate-700">
            <a href="notifications.html" class="text-xs text-indigo-600 dark:text-indigo-400 font-medium hover:underline">View all notifications →</a>
          </div>
        </div>
      </div>

      <!-- Profile -->
      <div class="relative" data-dropdown-parent>
        <button onclick="toggleDropdown('profile-dropdown')" class="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
          <div class="avatar bg-indigo-600 text-white w-8 h-8 text-sm">AD</div>
          <span class="text-sm font-medium text-slate-700 dark:text-slate-200 hidden sm:block">Admin</span>
          <svg class="w-4 h-4 text-slate-400 hidden sm:block" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
        </button>
        <div id="profile-dropdown" class="dropdown">
          <div class="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
            <div class="text-sm font-semibold text-slate-800 dark:text-slate-100">Admin User</div>
            <div class="text-xs text-slate-500 dark:text-slate-400">admin@school.edu</div>
          </div>
          <div class="py-1">
            <a href="#" class="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
              Profile Settings
            </a>
            <a href="#" class="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
              Settings
            </a>
            <hr class="my-1 border-slate-100 dark:border-slate-700">
            <a href="#" class="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
              Sign Out
            </a>
          </div>
        </div>
      </div>
    </div>`;
}

// ── Sidebar Toggle ─────────────────────────────────────────────────────────────
function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const main = document.getElementById('main-content');
  if (window.innerWidth < 768) {
    sidebar.classList.toggle('mobile-open');
  } else {
    sidebar.classList.toggle('collapsed');
    main.classList.toggle('expanded');
  }
}

// ── Dropdown Toggle ────────────────────────────────────────────────────────────
function toggleDropdown(id) {
  const el = document.getElementById(id);
  const wasOpen = el.classList.contains('open');
  document.querySelectorAll('.dropdown.open').forEach(d => d.classList.remove('open'));
  if (!wasOpen) el.classList.add('open');
}

// ── Mobile overlay close ───────────────────────────────────────────────────────
document.addEventListener('click', e => {
  const sidebar = document.getElementById('sidebar');
  if (sidebar && window.innerWidth < 768 && sidebar.classList.contains('mobile-open')) {
    if (!sidebar.contains(e.target) && !e.target.closest('#sidebar-toggle')) {
      sidebar.classList.remove('mobile-open');
    }
  }
});
