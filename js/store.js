import { TASKS } from './config.js';

const STORAGE_KEY = 'run.v1';

// Safari private mode and sandboxed iframes throw on localStorage, so every
// read and write goes through here and falls back to memory for the session.
const memory = new Map();

const disk = {
  read(key) {
    try {
      return localStorage.getItem(key);
    } catch {
      return memory.get(key) ?? null;
    }
  },
  write(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch {
      memory.set(key, value);
    }
  },
};

function emptyState() {
  return { days: {}, apps: [], meta: {} };
}

function restore() {
  const raw = disk.read(STORAGE_KEY);
  if (!raw) return emptyState();

  try {
    const parsed = JSON.parse(raw);
    return { ...emptyState(), ...parsed };
  } catch {
    console.warn('Saved data was unreadable, starting fresh');
    return emptyState();
  }
}

// Exported as a live reference. Modules mutate it directly and call save().
export const state = restore();

export function save() {
  disk.write(STORAGE_KEY, JSON.stringify(state));
}

// Used by the import button. Keeps the same object so existing imports stay valid.
export function replaceState(next) {
  Object.keys(state).forEach((key) => delete state[key]);
  Object.assign(state, emptyState(), next);
  save();
}

/* dates */

export function dateKey(date) {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const dayOfMonth = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${dayOfMonth}`;
}

export function todayKey() {
  return dateKey(new Date());
}

export function shiftDays(offset) {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return dateKey(date);
}

export function daysSince(isoDate) {
  return Math.round((Date.now() - new Date(isoDate).getTime()) / 86_400_000);
}

/* day records */

function blankDay() {
  return TASKS.reduce((day, task) => {
    day[task.id] = task.type === 'count' ? 0 : false;
    return day;
  }, {});
}

export function getDay(key) {
  state.days[key] ??= blankDay();
  return state.days[key];
}

export function repsDone(key) {
  const day = state.days[key];
  if (!day) return 0;

  return TASKS.filter((task) =>
    task.type === 'count' ? (day[task.id] ?? 0) >= task.goal : Boolean(day[task.id])
  ).length;
}
