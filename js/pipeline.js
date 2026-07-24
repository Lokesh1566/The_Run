import { STATUSES, OPEN_STATUSES, REPLIED_STATUSES, STALE_AFTER_DAYS } from './config.js';
import { state, save, todayKey, shiftDays, daysSince } from './store.js';

const rows = document.querySelector('#app-rows');
const weekNote = document.querySelector('#week-note');
const companyInput = document.querySelector('#new-company');
const roleInput = document.querySelector('#new-role');
const sourceInput = document.querySelector('#new-source');
const dateInput = document.querySelector('#new-date');
const addButton = document.querySelector('#add-app');

function escapeHtml(value) {
  return String(value ?? '').replace(/[<>&]/g, (char) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[char]));
}

function isStale(app) {
  return app.status === 'Applied' && daysSince(app.date) >= STALE_AFTER_DAYS;
}

export function counts() {
  const { apps } = state;

  let weekApps = 0;
  let weekReach = 0;

  for (let offset = 0; offset < 7; offset++) {
    const day = state.days[shiftDays(-offset)];
    if (!day) continue;
    weekApps += day.apply ?? 0;
    weekReach += day.reach ?? 0;
  }

  const replied = apps.filter((app) => REPLIED_STATUSES.includes(app.status)).length;

  return {
    total: apps.length,
    live: apps.filter((app) => OPEN_STATUSES.includes(app.status)).length,
    replied,
    stale: apps.filter(isStale).length,
    responseRate: apps.length ? Math.round((replied / apps.length) * 100) : 0,
    weekApps,
    weekReach,
  };
}

function statusSelect(app) {
  const options = STATUSES
    .map((status) => `<option value="${status}"${status === app.status ? ' selected' : ''}>${status}</option>`)
    .join('');

  return `<select class="status" data-status="${app.status}" data-id="${app.id}">${options}</select>`;
}

export function renderPipeline() {
  if (!state.apps.length) {
    rows.innerHTML = '<tr><td colspan="6" class="table-empty">No applications logged yet. Add the first one above.</td></tr>';
    return;
  }

  // Newest first. Dates are ISO strings so a plain string sort is correct.
  const sorted = [...state.apps].sort((a, b) => b.date.localeCompare(a.date));

  rows.innerHTML = sorted.map((app) => {
    const flag = isStale(app)
      ? `<span class="stale-flag">follow up · ${daysSince(app.date)}d</span>`
      : '';

    return `
      <tr>
        <td class="cell-company">${escapeHtml(app.company)}${flag}</td>
        <td>${escapeHtml(app.role)}</td>
        <td>${escapeHtml(app.source)}</td>
        <td class="cell-date">${app.date}</td>
        <td>${statusSelect(app)}</td>
        <td class="cell-actions">
          <button class="remove" data-remove="${app.id}" aria-label="Remove ${escapeHtml(app.company)}">&times;</button>
        </td>
      </tr>`;
  }).join('');
}

export function renderStats() {
  const summary = counts();

  document.querySelectorAll('[data-stat]').forEach((node) => {
    const key = node.dataset.stat;
    node.textContent = key === 'responseRate' ? `${summary.responseRate}%` : summary[key];
  });

  weekNote.textContent = summary.weekReach >= summary.weekApps && summary.weekApps > 0
    ? 'outreach is keeping pace'
    : `outreach at ${Math.round((summary.weekReach / (summary.weekApps || 1)) * 100)}% of applications`;
}

function addApplication() {
  const company = companyInput.value.trim();
  if (!company) {
    companyInput.focus();
    return;
  }

  state.apps.push({
    id: crypto.randomUUID(),
    company,
    role: roleInput.value.trim() || 'Not specified',
    source: sourceInput.value,
    date: dateInput.value || todayKey(),
    status: 'Applied',
  });

  save();

  companyInput.value = '';
  roleInput.value = '';
  dateInput.value = todayKey();
  companyInput.focus();
}

export function initPipeline(onChange) {
  dateInput.value = todayKey();

  addButton.addEventListener('click', () => {
    addApplication();
    onChange();
  });

  [companyInput, roleInput].forEach((input) => {
    input.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter') return;
      addApplication();
      onChange();
    });
  });

  rows.addEventListener('change', (event) => {
    const select = event.target.closest('select.status');
    if (!select) return;

    const app = state.apps.find((item) => item.id === select.dataset.id);
    if (!app) return;

    app.status = select.value;
    save();
    onChange();
  });

  rows.addEventListener('click', (event) => {
    const button = event.target.closest('[data-remove]');
    if (!button) return;

    state.apps = state.apps.filter((app) => app.id !== button.dataset.remove);
    save();
    onChange();
  });
}
