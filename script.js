/* ==========================================================================
   CHANAKYA - Strategic Academic & Cohort OS
   100% Client-Side Local Storage (Private, Zero Cloud Sync, Zero Rankings)
   Professional Light-SaaS Engine & Comprehensive PDF Audit
   ========================================================================== */

const STORAGE_KEY = 'chanakya_private_os_v6';

// Core Strategic Principles (Clean Prose, No Emojis)
const CHANAKYA_QUOTES = [
  "A man is great by deeds, not by birth.",
  "Education is the best friend. An educated person is respected everywhere.",
  "Before you start any work, ask yourself: Why am I doing it, What might the results be, and Will I succeed.",
  "Learn from the mistakes of others. You cannot live long enough to make them all yourself.",
  "Once you embark on a plan of action, pursue it with diligence and resolve.",
  "Discipline and continuous self-correction form the bedrock of sustainable mastery."
];

// Founding Team Roster
const DEFAULT_MEMBERS = [
  {
    id: 'sandeep',
    name: 'Sandeep Gowravam',
    dept: 'B.Tech - EEE',
    color: '#0284c7',
    avatar: 'SG'
  },
  {
    id: 'yasaswini',
    name: 'Yasaswini Arepalli',
    dept: 'B.Tech - ECE',
    color: '#7c3aed',
    avatar: 'YA'
  }
];

// Master Application State
let appState = {
  activeMemberId: 'sandeep',
  activeTab: 'tab-overview',
  members: [...DEFAULT_MEMBERS],
  logs: [],       // Private, zero-mock initialization
  events: [],     // Scheduled Exams, Deliverables & Works
  milestones: [
    {
      id: 'ms_1',
      title: 'Digital VLSI Architecture & Bus Interconnect RTL Verification',
      ownerId: 'cohort',
      targetDate: '2026-11-20',
      progress: 40
    }
  ],
  progressFilter: 'all',
  calendarDate: new Date(),
  selectedDateStr: getTodayISO()
};

// Chart.js references
let velocityChartInstance = null;
let domainChartInstance = null;

/* --------------------------------------------------------------------------
   Initialization
   -------------------------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  loadFromStorage();

  const todayStr = getTodayISO();
  const dateInput = document.getElementById('logDateInput');
  if (dateInput) dateInput.value = todayStr;

  const evDateInput = document.getElementById('eventDateInput');
  if (evDateInput) evDateInput.value = todayStr;

  const liveDateElem = document.getElementById('liveDateDisplay');
  if (liveDateElem) {
    liveDateElem.innerText = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  rotateQuote();
  renderAll();
});

function getTodayISO() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function rotateQuote() {
  const rand = Math.floor(Math.random() * CHANAKYA_QUOTES.length);
  const qElem = document.getElementById('quoteDisplay');
  if (qElem) qElem.innerText = `"${CHANAKYA_QUOTES[rand]}" - Chanakya`;
}

/* --------------------------------------------------------------------------
   Local Storage Management (Strictly Device-Local)
   -------------------------------------------------------------------------- */
function loadFromStorage() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed.members) && parsed.members.length > 0) appState.members = parsed.members;
      if (Array.isArray(parsed.logs)) appState.logs = parsed.logs;
      if (Array.isArray(parsed.events)) appState.events = parsed.events;
      if (Array.isArray(parsed.milestones)) appState.milestones = parsed.milestones;
      if (parsed.activeMemberId) appState.activeMemberId = parsed.activeMemberId;
    } catch (e) {
      console.error('Storage reading exception:', e);
    }
  }

  // Fallback safety if active member ID is invalid
  if (!appState.members.some(m => m.id === appState.activeMemberId)) {
    appState.activeMemberId = appState.members[0]?.id || 'sandeep';
  }
}

function saveToStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    members: appState.members,
    logs: appState.logs,
    events: appState.events,
    milestones: appState.milestones,
    activeMemberId: appState.activeMemberId
  }));
}

/* --------------------------------------------------------------------------
   Tab Navigation & Member Switcher
   -------------------------------------------------------------------------- */
function switchTab(tabId) {
  appState.activeTab = tabId;

  document.querySelectorAll('.nav-tab').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-tab') === tabId);
  });

  document.querySelectorAll('.view-panel').forEach(panel => {
    panel.classList.toggle('active', panel.id === tabId);
  });

  if (tabId === 'tab-analytics') {
    setTimeout(renderAnalyticsCharts, 50);
  } else if (tabId === 'tab-calendar') {
    renderCalendar();
  }
}

function switchActiveMember(memberId) {
  appState.activeMemberId = memberId;
  saveToStorage();
  renderAll();
}

/* --------------------------------------------------------------------------
   Master Render Pipeline
   -------------------------------------------------------------------------- */
function renderAll() {
  renderNavDropdowns();
  renderOverviewKPIs();
  renderTodayStatus();
  renderUpcomingAgenda();
  renderProgressFeed();
  renderCalendar();
  renderMilestones();
  renderTeam();

  if (appState.activeTab === 'tab-analytics') {
    renderAnalyticsCharts();
  }
}

function renderNavDropdowns() {
  const select = document.getElementById('activeMemberDropdown');
  const logSelect = document.getElementById('logMemberSelect');
  const evSelect = document.getElementById('eventMemberSelect');
  const msSelect = document.getElementById('msOwnerSelect');
  const filterWrap = document.getElementById('progressFilterChips');

  if (select) {
    select.innerHTML = appState.members.map(m =>
      `<option value="${m.id}" ${m.id === appState.activeMemberId ? 'selected' : ''}>${escapeHtml(m.name.split(' ')[0])} (${escapeHtml(m.dept.split(' ')[0])})</option>`
    ).join('');
  }

  if (logSelect) {
    logSelect.innerHTML = appState.members.map(m =>
      `<option value="${m.id}" ${m.id === appState.activeMemberId ? 'selected' : ''}>${escapeHtml(m.name)} (${escapeHtml(m.dept)})</option>`
    ).join('');
  }

  if (evSelect) {
    evSelect.innerHTML = `<option value="cohort">Joint Cohort (All)</option>` + appState.members.map(m =>
      `<option value="${m.id}">${escapeHtml(m.name)}</option>`
    ).join('');
  }

  if (msSelect) {
    msSelect.innerHTML = `<option value="cohort">Joint Cohort</option>` + appState.members.map(m =>
      `<option value="${m.id}">${escapeHtml(m.name)}</option>`
    ).join('');
  }

  if (filterWrap) {
    let chipsHtml = `<button class="chip ${appState.progressFilter === 'all' ? 'active' : ''}" onclick="filterProgressFeed('all')">All Cohort</button>`;
    appState.members.forEach(m => {
      chipsHtml += `<button class="chip ${appState.progressFilter === m.id ? 'active' : ''}" onclick="filterProgressFeed('${m.id}')">${escapeHtml(m.name.split(' ')[0])}</button>`;
    });
    filterWrap.innerHTML = chipsHtml;
  }

  const welcomeNameElem = document.getElementById('welcomeUserName');
  const curMember = appState.members.find(m => m.id === appState.activeMemberId);
  if (welcomeNameElem && curMember) {
    welcomeNameElem.innerText = curMember.name.split(' ')[0];
  }
}

/* --------------------------------------------------------------------------
   Overview KPI Calculations (Non-Competitive)
   -------------------------------------------------------------------------- */
function renderOverviewKPIs() {
  const curId = appState.activeMemberId;
  const userLogs = appState.logs.filter(l => l.memberId === curId);

  // 1. Momentum Streak
  const streak = calculateStreak(userLogs);
  const streakElem = document.getElementById('statStreak');
  if (streakElem) streakElem.innerHTML = `${streak} <span class="kpi-unit">days</span>`;

  const checkedToday = userLogs.some(l => l.date === getTodayISO());
  const streakLabelElem = document.getElementById('statStreakLabel');
  if (streakLabelElem) {
    streakLabelElem.innerText = checkedToday ? 'Completed today' : 'Pending today\'s standup';
  }

  // 2. Study Time
  const total = userLogs.reduce((acc, c) => acc + (parseFloat(c.hours) || 0), 0);
  const totalHoursElem = document.getElementById('statTotalHours');
  if (totalHoursElem) totalHoursElem.innerHTML = `${total.toFixed(1)} <span class="kpi-unit">hrs</span>`;

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const weekHours = userLogs
    .filter(l => new Date(l.date) >= sevenDaysAgo)
    .reduce((acc, c) => acc + (parseFloat(c.hours) || 0), 0);
  
  const weeklyHoursElem = document.getElementById('statWeeklyHours');
  if (weeklyHoursElem) {
    weeklyHoursElem.innerText = `Past 7 days: ${weekHours.toFixed(1)} hrs`;
  }

  // 3. Flow Index
  const flowElem = document.getElementById('statFlowRating');
  if (flowElem) {
    if (userLogs.length > 0) {
      const avgFlow = (userLogs.reduce((acc, c) => acc + (parseInt(c.energy) || 4), 0) / userLogs.length).toFixed(1);
      flowElem.innerHTML = `${avgFlow} <span class="kpi-unit">/ 5.0</span>`;
    } else {
      flowElem.innerHTML = `-- <span class="kpi-unit">/ 5.0</span>`;
    }
  }

  // 4. Pending Works & Exams
  const pending = appState.events.filter(e => !e.completed).length;
  const pendingEventsElem = document.getElementById('statPendingEvents');
  if (pendingEventsElem) pendingEventsElem.innerText = pending;

  const eventsMetaElem = document.getElementById('statEventsMeta');
  if (eventsMetaElem) eventsMetaElem.innerText = `${pending} active items on schedule`;
}

function calculateStreak(logs) {
  if (!logs || logs.length === 0) return 0;
  const dates = [...new Set(logs.map(l => l.date))].sort().reverse();
  const today = getTodayISO();

  let streak = 0;
  let check = new Date();

  if (!dates.includes(today)) {
    check.setDate(check.getDate() - 1);
  }

  while (true) {
    const y = check.getFullYear();
    const m = String(check.getMonth() + 1).padStart(2, '0');
    const d = String(check.getDate()).padStart(2, '0');
    const iso = `${y}-${m}-${d}`;

    if (dates.includes(iso)) {
      streak++;
      check.setDate(check.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

function renderTodayStatus() {
  const container = document.getElementById('todayCohortStatusList');
  if (!container) return;
  const todayStr = getTodayISO();

  container.innerHTML = appState.members.map(m => {
    const log = appState.logs.find(l => l.memberId === m.id && l.date === todayStr);
    return `
      <div class="status-row-item">
        <div class="status-user-info">
          <div class="user-avatar-circle" style="background:${m.color};">${escapeHtml(m.avatar)}</div>
          <div>
            <div class="status-user-name">${escapeHtml(m.name)}</div>
            <div class="status-user-sub">${escapeHtml(m.dept)}</div>
          </div>
        </div>
        <div>
          ${log 
            ? `<span class="badge-completed">${log.hours}h Logged</span>` 
            : `<span class="badge-pending">Pending</span>`}
        </div>
      </div>
    `;
  }).join('');
}

function renderUpcomingAgenda() {
  const container = document.getElementById('upcomingEventsList');
  if (!container) return;

  const upcoming = appState.events
    .filter(e => !e.completed)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 5);

  if (upcoming.length === 0) {
    container.innerHTML = `<p style="font-size:0.8rem; color:#64748b; padding:0.6rem 0;">No active exams or submissions registered. Click "+ Add Event" to schedule an upcoming deadline.</p>`;
    return;
  }

  container.innerHTML = upcoming.map(ev => {
    const assigned = ev.memberId === 'cohort'
      ? 'Cohort'
      : (appState.members.find(m => m.id === ev.memberId)?.name.split(' ')[0] || 'Member');

    return `
      <div class="agenda-event-item ${ev.category}">
        <div class="agenda-event-info">
          <span class="agenda-event-title">${escapeHtml(ev.title)}</span>
          <span class="agenda-event-meta">${ev.date} &bull; ${ev.category.toUpperCase()} &bull; Lead: ${escapeHtml(assigned)}</span>
        </div>
        <button class="btn btn-sm btn-outline" onclick="toggleEvent('${ev.id}')">Complete</button>
      </div>
    `;
  }).join('');
}

/* --------------------------------------------------------------------------
   Daily Progress Feed
   -------------------------------------------------------------------------- */
function filterProgressFeed(filter) {
  appState.progressFilter = filter;
  renderNavDropdowns();
  renderProgressFeed();
}

function renderProgressFeed() {
  const container = document.getElementById('standupFeedContainer');
  if (!container) return;

  let list = [...appState.logs].reverse();
  if (appState.progressFilter !== 'all') {
    list = list.filter(l => l.memberId === appState.progressFilter);
  }

  if (list.length === 0) {
    container.innerHTML = `
      <div class="empty-box">
        <div class="empty-title">No Standup Records Found</div>
        <p class="empty-desc">No daily check-ins logged for this view. Use the "+ Log Standup" button to record tasks, solve blockers, and reflect on daily improvements.</p>
        <button class="btn btn-primary" onclick="openStandupModal()">Log First Standup</button>
      </div>
    `;
    return;
  }

  container.innerHTML = list.map(log => {
    const mem = appState.members.find(m => m.id === log.memberId) || DEFAULT_MEMBERS[0];
    return `
      <div class="standup-card">
        <div class="standup-top">
          <div class="standup-author">
            <div class="user-avatar-circle" style="background:${mem.color};">${escapeHtml(mem.avatar)}</div>
            <div>
              <div class="author-title">${escapeHtml(mem.name)}</div>
              <div class="author-date">${escapeHtml(mem.dept)} &bull; ${log.date}</div>
            </div>
          </div>
          <div class="standup-tags">
            <span class="tag-hours">${log.hours} hrs</span>
            <span class="tag-domain">${escapeHtml(log.domain)}</span>
          </div>
        </div>

        <div class="standup-body-block">
          <div class="standup-section-heading">Accomplished Today</div>
          <div class="standup-body-text">${escapeHtml(log.done)}</div>
        </div>

        <div class="standup-body-block">
          <div class="standup-section-heading">Tomorrow's Core Target</div>
          <div class="standup-body-text">${escapeHtml(log.target)}</div>
        </div>

        ${log.blocker ? `
          <div class="blocker-box">
            <span><strong>Blocker:</strong> ${escapeHtml(log.blocker)}</span>
            <button class="btn btn-sm btn-outline" style="background:#fff;" onclick="resolveBlocker('${log.id}')">
              ${log.blockerResolved ? 'Resolved' : 'Mark Resolved'}
            </button>
          </div>
        ` : ''}

        ${log.improvement ? `
          <div class="improvement-box">
            <strong>1% Better Habit:</strong> ${escapeHtml(log.improvement)}
          </div>
        ` : ''}

        <div class="standup-actions">
          <div class="kudos-group">
            <button class="kudos-btn" onclick="addKudo('${log.id}', 'insightful')">
              Insightful ${log.kudos?.['insightful'] ? `(${log.kudos['insightful']})` : ''}
            </button>
            <button class="kudos-btn" onclick="addKudo('${log.id}', 'inspiring')">
              Inspiring ${log.kudos?.['inspiring'] ? `(${log.kudos['inspiring']})` : ''}
            </button>
            <button class="kudos-btn" onclick="addKudo('${log.id}', 'verified')">
              Verified ${log.kudos?.['verified'] ? `(${log.kudos['verified']})` : ''}
            </button>
          </div>
          <span style="font-size:0.75rem; color:#64748b; font-weight:600;">Energy: ${log.energy || 4} / 5</span>
        </div>

        <div class="comments-drawer">
          <div>
            ${(log.comments || []).map(c => `
              <div class="comment-row">
                <strong>${escapeHtml(c.author)}:</strong> ${escapeHtml(c.text)}
              </div>
            `).join('')}
          </div>
          <form class="comment-input-wrap" onsubmit="postComment(event, '${log.id}')">
            <input type="text" placeholder="Write constructive peer feedback..." required />
            <button type="submit" class="btn btn-sm btn-secondary">Post</button>
          </form>
        </div>
      </div>
    `;
  }).join('');
}

function addKudo(logId, key) {
  const log = appState.logs.find(l => l.id === logId);
  if (!log) return;
  if (!log.kudos) log.kudos = {};
  log.kudos[key] = (log.kudos[key] || 0) + 1;
  saveToStorage();
  renderProgressFeed();
}

function resolveBlocker(logId) {
  const log = appState.logs.find(l => l.id === logId);
  if (log) {
    log.blockerResolved = !log.blockerResolved;
    saveToStorage();
    renderProgressFeed();
  }
}

function postComment(e, logId) {
  e.preventDefault();
  const input = e.target.querySelector('input');
  const txt = input ? input.value.trim() : '';
  if (!txt) return;

  const log = appState.logs.find(l => l.id === logId);
  if (!log) return;
  if (!log.comments) log.comments = [];

  const curMember = appState.members.find(m => m.id === appState.activeMemberId);
  log.comments.push({
    author: curMember ? curMember.name.split(' ')[0] : 'Teammate',
    text: txt,
    time: new Date().toISOString()
  });

  input.value = '';
  saveToStorage();
  renderProgressFeed();
}

/* --------------------------------------------------------------------------
   Calendar Engine (Exams, Works, Deadlines)
   -------------------------------------------------------------------------- */
function navigateMonth(step) {
  appState.calendarDate.setMonth(appState.calendarDate.getMonth() + step);
  renderCalendar();
}

function jumpToCurrentMonth() {
  appState.calendarDate = new Date();
  appState.selectedDateStr = getTodayISO();
  renderCalendar();
}

function renderCalendar() {
  const grid = document.getElementById('calendarDaysGrid');
  if (!grid) return;
  grid.innerHTML = '';

  const cal = appState.calendarDate;
  const year = cal.getFullYear();
  const month = cal.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const monthTitle = document.getElementById('calendarMonthTitle');
  if (monthTitle) monthTitle.innerText = `${monthNames[month]} ${year}`;

  const firstDay = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();
  const todayStr = getTodayISO();

  for (let i = 0; i < firstDay; i++) {
    const empty = document.createElement('div');
    empty.className = 'cal-day-cell empty';
    grid.appendChild(empty);
  }

  for (let day = 1; day <= totalDays; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const cell = document.createElement('div');
    cell.className = 'cal-day-cell';
    if (dateStr === todayStr) cell.classList.add('today');
    if (dateStr === appState.selectedDateStr) cell.classList.add('selected');

    cell.innerHTML = `<span>${day}</span>`;

    const badgeWrap = document.createElement('div');
    badgeWrap.className = 'cal-day-badges';

    // 1. Events (Exams/Works)
    const dayEvents = appState.events.filter(e => e.date === dateStr);
    dayEvents.slice(0, 2).forEach(ev => {
      const b = document.createElement('div');
      b.className = `cal-mini-badge ${ev.category}`;
      b.innerText = `${ev.category.toUpperCase()}: ${ev.title}`;
      badgeWrap.appendChild(b);
    });

    // 2. Standup Logs
    const dayLogs = appState.logs.filter(l => l.date === dateStr);
    if (dayLogs.length > 0) {
      const b = document.createElement('div');
      b.className = 'cal-mini-badge standup';
      b.innerText = `${dayLogs.length} Logged`;
      badgeWrap.appendChild(b);
    }

    cell.appendChild(badgeWrap);
    cell.onclick = () => {
      appState.selectedDateStr = dateStr;
      renderCalendar();
    };
    grid.appendChild(cell);
  }

  renderDayAgenda(appState.selectedDateStr || todayStr);
}

function renderDayAgenda(dateStr) {
  const header = document.getElementById('selectedDateHeader');
  const body = document.getElementById('selectedDateAgendaBody');
  if (!header || !body) return;

  const dObj = new Date(dateStr + 'T00:00:00');
  header.innerText = dObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });

  const events = appState.events.filter(e => e.date === dateStr);
  const logs = appState.logs.filter(l => l.date === dateStr);

  let html = '';

  if (events.length > 0) {
    html += `<div style="font-size:0.75rem; font-weight:700; color:#64748b; margin-top:0.3rem;">EXAMS & DELIVERABLES</div>`;
    events.forEach(ev => {
      html += `
        <div class="agenda-event-item ${ev.category}">
          <div class="agenda-event-info">
            <span class="agenda-event-title">${escapeHtml(ev.title)}</span>
            <span class="agenda-event-meta">${ev.category.toUpperCase()} &bull; Priority: ${ev.priority.toUpperCase()}</span>
          </div>
          <div style="display:flex; gap:0.3rem;">
            <button class="btn btn-sm btn-outline" onclick="toggleEvent('${ev.id}')">${ev.completed ? 'Reopen' : 'Done'}</button>
            <button class="btn btn-sm btn-outline" onclick="deleteEvent('${ev.id}')">Delete</button>
          </div>
        </div>
      `;
    });
  }

  if (logs.length > 0) {
    html += `<div style="font-size:0.75rem; font-weight:700; color:#64748b; margin-top:0.7rem;">RECORDED STANDUPS</div>`;
    logs.forEach(l => {
      const m = appState.members.find(x => x.id === l.memberId);
      html += `
        <div style="background:#f8fafc; border:1px solid #e2e8f0; padding:0.5rem; border-radius:6px; font-size:0.78rem;">
          <strong>${escapeHtml(m ? m.name.split(' ')[0] : 'Teammate')}</strong> (${l.hours}h): ${escapeHtml(l.done.substring(0, 80))}...
        </div>
      `;
    });
  }

  if (events.length === 0 && logs.length === 0) {
    html = `<p style="font-size:0.8rem; color:#64748b;">No scheduled deliverables or standup records for this day.</p>`;
  }

  body.innerHTML = html;
}

function toggleEvent(id) {
  const ev = appState.events.find(e => e.id === id);
  if (ev) {
    ev.completed = !ev.completed;
    saveToStorage();
    renderAll();
  }
}

function deleteEvent(id) {
  appState.events = appState.events.filter(e => e.id !== id);
  saveToStorage();
  renderAll();
}

/* --------------------------------------------------------------------------
   Milestones & Roadmap
   -------------------------------------------------------------------------- */
function renderMilestones() {
  const container = document.getElementById('milestonesContainer');
  if (!container) return;

  if (appState.milestones.length === 0) {
    container.innerHTML = `<p style="font-size:0.82rem; color:#64748b;">No milestones created yet. Click "+ Add Milestone" to define a syllabus benchmark or research target.</p>`;
    return;
  }

  container.innerHTML = appState.milestones.map(ms => {
    let lead = 'Joint Cohort';
    if (ms.ownerId !== 'cohort') {
      const m = appState.members.find(x => x.id === ms.ownerId);
      if (m) lead = m.name.split(' ')[0];
    }
    return `
      <div class="milestone-item-card">
        <div class="ms-top-bar">
          <span class="ms-title">${escapeHtml(ms.title)}</span>
          <span class="ms-pct">${ms.progress}%</span>
        </div>
        <div class="ms-progress-track">
          <div class="ms-progress-fill" style="width:${ms.progress}%;"></div>
        </div>
        <div class="ms-footer-row">
          <span>Lead: ${escapeHtml(lead)} &bull; Target: ${ms.targetDate || 'TBD'}</span>
          <button class="btn btn-sm btn-outline" onclick="updateMilestoneProgress('${ms.id}', ${ms.progress})">Update %</button>
        </div>
      </div>
    `;
  }).join('');
}

function updateMilestoneProgress(id, current) {
  const val = prompt('Enter new completion percentage (0 - 100):', current);
  if (val !== null) {
    const num = Math.min(100, Math.max(0, parseInt(val) || 0));
    const target = appState.milestones.find(m => m.id === id);
    if (target) {
      target.progress = num;
      saveToStorage();
      renderMilestones();
    }
  }
}

/* --------------------------------------------------------------------------
   Team Directory
   -------------------------------------------------------------------------- */
function renderTeam() {
  const container = document.getElementById('teamCardsContainer');
  if (!container) return;

  container.innerHTML = appState.members.map(m => {
    const logs = appState.logs.filter(l => l.memberId === m.id);
    const hrs = logs.reduce((sum, l) => sum + (parseFloat(l.hours) || 0), 0);
    const streak = calculateStreak(logs);
    return `
      <div class="member-profile-card">
        <div>
          <div class="mp-header">
            <div class="mp-avatar" style="background:${m.color};">${escapeHtml(m.avatar)}</div>
            <div>
              <h3 style="font-size:0.95rem; font-weight:700;">${escapeHtml(m.name)}</h3>
              <p style="font-size:0.75rem; color:#64748b;">${escapeHtml(m.dept)}</p>
            </div>
          </div>
          <div class="mp-stats-row" style="margin-top:1rem;">
            <div class="mp-stat-item">
              Total Invested
              <strong>${hrs.toFixed(1)} hrs</strong>
            </div>
            <div class="mp-stat-item">
              Current Streak
              <strong>${streak} days</strong>
            </div>
          </div>
        </div>
        <div style="display:flex; justify-content:flex-end;">
          <button class="btn btn-sm btn-outline" style="color:#dc2626;" onclick="deleteMember('${m.id}')">Remove Member</button>
        </div>
      </div>
    `;
  }).join('');
}

function deleteMember(id) {
  if (appState.members.length <= 1) {
    alert("You must retain at least one teammate in your cohort.");
    return;
  }
  const mem = appState.members.find(m => m.id === id);
  if (!confirm(`Are you sure you want to remove "${mem ? mem.name : 'this member'}"?`)) return;

  appState.members = appState.members.filter(m => m.id !== id);
  if (appState.activeMemberId === id) {
    appState.activeMemberId = appState.members[0].id;
  }
  saveToStorage();
  renderAll();
}

/* --------------------------------------------------------------------------
   Analytics Charts (Safe Mount & Fallback Handler)
   -------------------------------------------------------------------------- */
function renderAnalyticsCharts() {
  const vWrapper = document.getElementById('velocityChartWrapper');
  const dWrapper = document.getElementById('domainChartWrapper');
  if (!vWrapper || !dWrapper) return;

  // 1. Prepare Velocity Dataset (7 Days)
  const pastDays = [];
  const pastLabels = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    pastDays.push(`${y}-${m}-${day}`);
    pastLabels.push(d.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' }));
  }

  const velocityDatasets = appState.members.map(m => {
    const memberHours = pastDays.map(dayStr => {
      return appState.logs
        .filter(l => l.memberId === m.id && l.date === dayStr)
        .reduce((sum, l) => sum + (parseFloat(l.hours) || 0), 0);
    });

    return {
      label: m.name.split(' ')[0],
      data: memberHours,
      backgroundColor: m.color,
      borderRadius: 4
    };
  });

  // 2. Prepare Subject Distribution Data
  const domainTotals = {};
  appState.logs.forEach(l => {
    const d = l.domain || 'Core Academics';
    domainTotals[d] = (domainTotals[d] || 0) + (parseFloat(l.hours) || 0);
  });

  const dLabels = Object.keys(domainTotals);
  const dVals = Object.values(domainTotals);

  // If Chart.js CDN is available
  if (typeof Chart !== 'undefined') {
    const vCanvas = document.getElementById('velocityChart');
    const dCanvas = document.getElementById('domainChart');

    if (vCanvas && dCanvas) {
      if (velocityChartInstance) velocityChartInstance.destroy();
      velocityChartInstance = new Chart(vCanvas.getContext('2d'), {
        type: 'bar',
        data: {
          labels: pastLabels,
          datasets: velocityDatasets
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { labels: { color: '#475569', font: { family: 'Inter' } } }
          },
          scales: {
            x: { ticks: { color: '#64748b' }, grid: { display: false } },
            y: { beginAtZero: true, ticks: { color: '#64748b' }, grid: { color: '#f1f5f9' } }
          }
        }
      });

      if (domainChartInstance) domainChartInstance.destroy();
      domainChartInstance = new Chart(dCanvas.getContext('2d'), {
        type: 'doughnut',
        data: {
          labels: dLabels.length > 0 ? dLabels : ['No Logs'],
          datasets: [{
            data: dVals.length > 0 ? dVals : [1],
            backgroundColor: dLabels.length > 0
              ? ['#4f46e5', '#0284c7', '#059669', '#d97706', '#db2777', '#7c3aed', '#64748b']
              : ['#e2e8f0']
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'right', labels: { color: '#475569', boxWidth: 10, font: { size: 10 } } }
          }
        }
      });
      return;
    }
  }

  // Pure HTML/CSS Resilient Fallback (If offline or Chart.js blocked)
  vWrapper.innerHTML = `
    <div style="display:flex; flex-direction:column; gap:0.5rem; padding:0.5rem 0; width:100%;">
      ${pastLabels.map((lbl, idx) => {
        const totalDayHrs = velocityDatasets.reduce((sum, ds) => sum + (ds.data[idx] || 0), 0);
        return `
          <div style="display:flex; align-items:center; gap:0.5rem; font-size:0.75rem;">
            <span style="width:70px; color:#64748b;">${lbl}</span>
            <div style="flex:1; height:8px; background:#f1f5f9; border-radius:4px; overflow:hidden;">
              <div style="height:100%; width:${Math.min(100, totalDayHrs * 12)}%; background:#4f46e5;"></div>
            </div>
            <span style="width:40px; text-align:right; font-family:'JetBrains Mono';">${totalDayHrs.toFixed(1)}h</span>
          </div>
        `;
      }).join('')}
    </div>
  `;

  dWrapper.innerHTML = `
    <div style="display:flex; flex-direction:column; gap:0.5rem; width:100%;">
      ${dLabels.length > 0 ? dLabels.map((d, i) => `
        <div style="display:flex; justify-content:space-between; font-size:0.8rem; border-bottom:1px solid #f1f5f9; padding-bottom:3px;">
          <span>${escapeHtml(d)}</span>
          <strong style="font-family:'JetBrains Mono';">${dVals[i].toFixed(1)} hrs</strong>
        </div>
      `).join('') : '<p style="font-size:0.8rem; color:#64748b;">No domain sessions recorded yet.</p>'}
    </div>
  `;
}

/* --------------------------------------------------------------------------
   Modal Actions & Form Handlers
   -------------------------------------------------------------------------- */
function updateSliderText(val) {
  const el = document.getElementById('sliderValueText');
  if (el) el.innerText = `${parseFloat(val).toFixed(1)} hrs`;
}

function openStandupModal() {
  const sel = document.getElementById('logMemberSelect');
  if (sel) sel.value = appState.activeMemberId;
  const modal = document.getElementById('standupModal');
  if (modal) modal.classList.add('open');
}
function closeStandupModal() {
  const modal = document.getElementById('standupModal');
  if (modal) modal.classList.remove('open');
}

function submitStandup(e) {
  e.preventDefault();
  const newLog = {
    id: 'log_' + Date.now(),
    memberId: document.getElementById('logMemberSelect').value,
    date: document.getElementById('logDateInput').value,
    hours: parseFloat(document.getElementById('logHoursSlider').value) || 1,
    domain: document.getElementById('logDomainSelect').value,
    done: document.getElementById('logDoneText').value.trim(),
    target: document.getElementById('logTargetText').value.trim(),
    energy: parseInt(document.querySelector('input[name="energyVal"]:checked')?.value || 4),
    blocker: document.getElementById('logBlockerInput').value.trim(),
    blockerResolved: false,
    improvement: document.getElementById('logImprovementInput').value.trim(),
    kudos: {},
    comments: []
  };

  appState.logs.push(newLog);
  appState.selectedDateStr = newLog.date;
  saveToStorage();
  closeStandupModal();
  document.getElementById('standupForm').reset();
  document.getElementById('logDateInput').value = getTodayISO();
  updateSliderText(3.5);
  renderAll();
}

function openEventModal() {
  const dateInput = document.getElementById('eventDateInput');
  if (dateInput) dateInput.value = appState.selectedDateStr || getTodayISO();
  const modal = document.getElementById('eventModal');
  if (modal) modal.classList.add('open');
}
function closeEventModal() {
  const modal = document.getElementById('eventModal');
  if (modal) modal.classList.remove('open');
}

function submitEvent(e) {
  e.preventDefault();
  const newEv = {
    id: 'ev_' + Date.now(),
    title: document.getElementById('eventTitleInput').value.trim(),
    date: document.getElementById('eventDateInput').value,
    priority: document.getElementById('eventPrioritySelect').value,
    category: document.querySelector('input[name="eventCategory"]:checked')?.value || 'exam',
    memberId: document.getElementById('eventMemberSelect').value,
    completed: false
  };

  appState.events.push(newEv);
  appState.selectedDateStr = newEv.date;
  saveToStorage();
  closeEventModal();
  document.getElementById('eventForm').reset();
  renderAll();
}

function openMilestoneModal() {
  const modal = document.getElementById('milestoneModal');
  if (modal) modal.classList.add('open');
}
function closeMilestoneModal() {
  const modal = document.getElementById('milestoneModal');
  if (modal) modal.classList.remove('open');
}

function submitMilestone(e) {
  e.preventDefault();
  const newMs = {
    id: 'ms_' + Date.now(),
    title: document.getElementById('msTitleInput').value.trim(),
    ownerId: document.getElementById('msOwnerSelect').value,
    targetDate: document.getElementById('msDateInput').value,
    progress: 0
  };

  appState.milestones.push(newMs);
  saveToStorage();
  closeMilestoneModal();
  document.getElementById('milestoneForm').reset();
  renderMilestones();
}

function openMemberModal() {
  const modal = document.getElementById('memberModal');
  if (modal) modal.classList.add('open');
}
function closeMemberModal() {
  const modal = document.getElementById('memberModal');
  if (modal) modal.classList.remove('open');
}

function submitMember(e) {
  e.preventDefault();
  const name = document.getElementById('newMemberName').value.trim();
  const dept = document.getElementById('newMemberDept').value.trim();
  const color = document.querySelector('input[name="mColor"]:checked')?.value || '#0284c7';

  if (!name || !dept) return;

  const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  const newId = 'mem_' + Date.now();

  appState.members.push({
    id: newId,
    name: name,
    dept: dept,
    color: color,
    avatar: initials || 'CO'
  });

  appState.activeMemberId = newId;
  saveToStorage();
  closeMemberModal();
  document.getElementById('memberForm').reset();
  renderAll();
}

/* --------------------------------------------------------------------------
   Comprehensive Individual Performance PDF Export
   -------------------------------------------------------------------------- */
function generatePdfReport() {
  const container = document.getElementById('printReportContainer');
  if (!container) return;

  const member = appState.members.find(m => m.id === appState.activeMemberId) || appState.members[0];
  const userLogs = appState.logs.filter(l => l.memberId === member.id).sort((a, b) => b.date.localeCompare(a.date));
  const userEvents = appState.events.filter(e => e.memberId === member.id || e.memberId === 'cohort');
  const userMilestones = appState.milestones.filter(m => m.ownerId === member.id || m.ownerId === 'cohort');

  // Velocity Metrics
  const totalHours = userLogs.reduce((acc, c) => acc + (parseFloat(c.hours) || 0), 0);
  const streak = calculateStreak(userLogs);

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const hours7d = userLogs
    .filter(l => new Date(l.date) >= sevenDaysAgo)
    .reduce((acc, c) => acc + (parseFloat(c.hours) || 0), 0);

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const hours30d = userLogs
    .filter(l => new Date(l.date) >= thirtyDaysAgo)
    .reduce((acc, c) => acc + (parseFloat(c.hours) || 0), 0);

  const avgFlow = userLogs.length > 0
    ? (userLogs.reduce((acc, c) => acc + (parseInt(c.energy) || 4), 0) / userLogs.length).toFixed(1)
    : 'N/A';

  // Domain Distribution Table Rows
  const domainTotals = {};
  userLogs.forEach(l => {
    domainTotals[l.domain] = (domainTotals[l.domain] || 0) + (parseFloat(l.hours) || 0);
  });
  const domainRows = Object.keys(domainTotals).map(dom => {
    const hrs = domainTotals[dom];
    const pct = totalHours > 0 ? ((hrs / totalHours) * 100).toFixed(1) : '0.0';
    return `
      <tr>
        <td><strong>${escapeHtml(dom)}</strong></td>
        <td>${hrs.toFixed(1)} hrs</td>
        <td>${pct}%</td>
      </tr>
    `;
  }).join('');

  // Scheduled Deadlines & Exams Rows
  const eventRows = userEvents.map(ev => `
    <tr>
      <td>${ev.date}</td>
      <td><strong>${ev.category.toUpperCase()}</strong></td>
      <td>${escapeHtml(ev.title)}</td>
      <td>${ev.priority.toUpperCase()}</td>
      <td>${ev.completed ? 'COMPLETED' : 'PENDING'}</td>
    </tr>
  `).join('');

  // Milestone Rows
  const milestoneRows = userMilestones.map(ms => `
    <tr>
      <td>${escapeHtml(ms.title)}</td>
      <td>${ms.targetDate || 'TBD'}</td>
      <td><strong>${ms.progress}%</strong></td>
    </tr>
  `).join('');

  // Detailed Standup Feed Entries
  const logEntriesHtml = userLogs.map(l => `
    <div style="border: 1pt solid #cbd5e1; padding: 8pt; margin-bottom: 8pt; border-radius: 4pt; page-break-inside: avoid; background: #fafafa;">
      <div style="display:flex; justify-content:space-between; border-bottom: 1pt solid #e2e8f0; padding-bottom: 4pt; margin-bottom: 4pt;">
        <strong>Date: ${l.date} &bull; ${escapeHtml(l.domain)}</strong>
        <span><strong>${l.hours} hrs</strong> &bull; Flow: ${l.energy || 4}/5</span>
      </div>
      <p style="margin: 2pt 0;"><strong>Accomplished:</strong> ${escapeHtml(l.done)}</p>
      <p style="margin: 2pt 0;"><strong>Next Target:</strong> ${escapeHtml(l.target)}</p>
      ${l.blocker ? `<p style="margin: 2pt 0; color: #991b1b;"><strong>Blocker:</strong> ${escapeHtml(l.blocker)} [${l.blockerResolved ? 'Resolved' : 'Unresolved'}]</p>` : ''}
      ${l.improvement ? `<p style="margin: 2pt 0; color: #065f46;"><strong>1% Improvement Habit:</strong> ${escapeHtml(l.improvement)}</p>` : ''}
      ${(l.comments && l.comments.length > 0) ? `
        <div style="margin-top: 4pt; padding-top: 4pt; border-top: 1pt dashed #cbd5e1; font-size: 8pt; color: #475569;">
          <strong>Peer Feedback:</strong>
          ${l.comments.map(c => `<div>- <em>${escapeHtml(c.author)}:</em> ${escapeHtml(c.text)}</div>`).join('')}
        </div>
      ` : ''}
    </div>
  `).join('');

  const reportDateStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  container.innerHTML = `
    <div class="print-head">
      <div>
        <h1 style="font-size: 18pt; font-weight: 800; margin: 0; color: #0f172a;">CHANAKYA &bull; INDIVIDUAL PERFORMANCE AUDIT</h1>
        <p style="font-size: 10pt; color: #475569; margin: 2pt 0 0;">Candidate: <strong>${escapeHtml(member.name)}</strong> (${escapeHtml(member.dept)})</p>
      </div>
      <div style="text-align: right; font-size: 8.5pt; color: #475569;">
        <p style="margin: 0;"><strong>Report Date:</strong> ${reportDateStr}</p>
        <p style="margin: 2pt 0 0;"><strong>Security Status:</strong> Private Client-Side Record</p>
      </div>
    </div>

    <h2 style="font-size: 11pt; margin-top: 14pt; border-bottom: 1pt solid #0f172a; padding-bottom: 2pt; text-transform: uppercase;">
      1. Executive Work & Velocity Summary
    </h2>
    <table class="print-table">
      <thead>
        <tr>
          <th>Metric Indicator</th>
          <th>Recorded Value</th>
          <th>Description</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Total Time Dedicated</strong></td>
          <td>${totalHours.toFixed(1)} hrs</td>
          <td>Cumulative study time across all recorded sessions</td>
        </tr>
        <tr>
          <td><strong>Active Momentum Streak</strong></td>
          <td>${streak} days</td>
          <td>Continuous unbroken daily standup check-in sequence</td>
        </tr>
        <tr>
          <td><strong>7-Day Output Velocity</strong></td>
          <td>${hours7d.toFixed(1)} hrs</td>
          <td>Hours completed over the preceding 7 calendar days</td>
        </tr>
        <tr>
          <td><strong>30-Day Output Velocity</strong></td>
          <td>${hours30d.toFixed(1)} hrs</td>
          <td>Hours completed over the preceding 30 calendar days</td>
        </tr>
        <tr>
          <td><strong>Average Energy / Focus Rating</strong></td>
          <td>${avgFlow} / 5.0</td>
          <td>Average focus and cognitive retention quality index</td>
        </tr>
        <tr>
          <td><strong>Total Standups Published</strong></td>
          <td>${userLogs.length} entries</td>
          <td>Individual daily progress reports filed</td>
        </tr>
      </tbody>
    </table>

    <h2 style="font-size: 11pt; margin-top: 14pt; border-bottom: 1pt solid #0f172a; padding-bottom: 2pt; text-transform: uppercase;">
      2. Module & Technical Domain Distribution
    </h2>
    <table class="print-table">
      <thead>
        <tr>
          <th>Technical Domain</th>
          <th>Time Dedicated</th>
          <th>Share of Total Effort</th>
        </tr>
      </thead>
      <tbody>
        ${domainRows || '<tr><td colspan="3">No domain sessions logged yet.</td></tr>'}
      </tbody>
    </table>

    <h2 style="font-size: 11pt; margin-top: 14pt; border-bottom: 1pt solid #0f172a; padding-bottom: 2pt; text-transform: uppercase;">
      3. Scheduled Exams, Submissions & Deadlines
    </h2>
    <table class="print-table">
      <thead>
        <tr>
          <th>Target Date</th>
          <th>Category</th>
          <th>Deliverable Title</th>
          <th>Priority</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        ${eventRows || '<tr><td colspan="5">No exams or deadlines registered on the schedule.</td></tr>'}
      </tbody>
    </table>

    <h2 style="font-size: 11pt; margin-top: 14pt; border-bottom: 1pt solid #0f172a; padding-bottom: 2pt; text-transform: uppercase;">
      4. Semester Milestones & Research Benchmarks
    </h2>
    <table class="print-table">
      <thead>
        <tr>
          <th>Milestone Deliverable</th>
          <th>Target Date</th>
          <th>Completion Progress</th>
        </tr>
      </thead>
      <tbody>
        ${milestoneRows || '<tr><td colspan="3">No major milestones assigned.</td></tr>'}
      </tbody>
    </table>

    <h2 style="font-size: 11pt; margin-top: 14pt; border-bottom: 1pt solid #0f172a; padding-bottom: 2pt; text-transform: uppercase;">
      5. Chronological Standup & Execution Log
    </h2>
    <div>
      ${logEntriesHtml || '<p style="font-size: 8.5pt; color: #64748b;">No standups recorded for this candidate.</p>'}
    </div>
  `;

  // Launch browser native PDF print engine
  window.print();
}

/* --------------------------------------------------------------------------
   Sanitization Utility
   -------------------------------------------------------------------------- */
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}