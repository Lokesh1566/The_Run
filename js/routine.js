import { TASKS, STREAK_THRESHOLD, TAPE_LENGTH } from './config.js';
import { save, todayKey, shiftDays, getDay, repsDone } from './store.js';

const repList = document.querySelector('#reps');
const progressFill = document.querySelector('#progress-fill');
const allClear = document.querySelector('#all-clear');
const tape = document.querySelector('#tape');
const tapeSummary = document.querySelector('#tape-summary');
const todayLabel = document.querySelector('#today-label');

const CHECK_ICON = '<svg viewBox="0 0 24 24"><polyline points="4,13 9,18 20,6"/></svg>';

function isDone(day, task) {
  return task.type === 'count' ? (day[task.id] ?? 0) >= task.goal : Boolean(day[task.id]);
}

function counterMarkup(task, value) {
  return `
    <div class="counter">
      <button data-action="decrement" data-task="${task.id}" aria-label="Subtract one from ${task.label}">&minus;</button>
      <span class="counter__value">${value} <em>/ ${task.goal}</em></span>
      <button data-action="increment" data-task="${task.id}" aria-label="Add one to ${task.label}">+</button>
    </div>`;
}

function tickMarkup(task, done) {
  return `
    <button class="tick" data-action="toggle" data-task="${task.id}"
            aria-pressed="${done}" aria-label="Mark ${task.label} done">${CHECK_ICON}</button>`;
}

export function renderRoutine() {
  const key = todayKey();
  const day = getDay(key);

  repList.innerHTML = TASKS.map((task, index) => {
    const done = isDone(day, task);
    const control = task.type === 'count'
      ? counterMarkup(task, day[task.id] ?? 0)
      : tickMarkup(task, done);

    return `
      <div class="rep${done ? ' is-done' : ''}">
        <span class="rep__index">${String(index + 1).padStart(2, '0')}</span>
        <div class="rep__body">
          <div class="rep__label">${task.label}</div>
          <div class="rep__note">${task.note}</div>
        </div>
        ${control}
      </div>`;
  }).join('');

  const done = repsDone(key);
  progressFill.style.width = `${Math.round((done / TASKS.length) * 100)}%`;
  allClear.classList.toggle('is-visible', done === TASKS.length);

  todayLabel.textContent = `${new Date().toLocaleDateString(undefined, {
    weekday: 'long', month: 'long', day: 'numeric',
  })} · ${done} of ${TASKS.length} done`;
}

export function renderTape() {
  const bars = [];
  let worked = 0;

  for (let offset = TAPE_LENGTH - 1; offset >= 0; offset--) {
    const key = shiftDays(-offset);
    const done = repsDone(key);
    const height = Math.max(Math.round((done / TASKS.length) * 100), 4);

    if (done > 0) worked++;

    const classes = ['bar'];
    if (done > 0 && done < TASKS.length) classes.push('is-partial');
    if (done === TASKS.length) classes.push('is-full');
    if (offset === 0) classes.push('is-today');

    bars.push(`<div class="${classes.join(' ')}" title="${key} · ${done} of ${TASKS.length}">
      <i style="height:${height}%"></i></div>`);
  }

  tape.innerHTML = bars.join('');
  tapeSummary.textContent = `${worked} of ${TAPE_LENGTH} days worked`;
}

export function currentStreak() {
  // Today only breaks the streak once it is over, so start counting at
  // yesterday if today has not hit the threshold yet.
  let offset = repsDone(todayKey()) >= STREAK_THRESHOLD ? 0 : 1;
  let streak = 0;

  while (repsDone(shiftDays(-offset)) >= STREAK_THRESHOLD) {
    streak++;
    offset++;
  }

  return streak;
}

export function initRoutine(onChange) {
  repList.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-action]');
    if (!button) return;

    const day = getDay(todayKey());
    const { action, task } = button.dataset;

    if (action === 'increment') day[task] = (day[task] ?? 0) + 1;
    if (action === 'decrement') day[task] = Math.max(0, (day[task] ?? 0) - 1);
    if (action === 'toggle') day[task] = !day[task];

    save();
    onChange();
  });

  // Make sure today exists in storage even on a day nothing gets ticked,
  // otherwise the tape has a hole where a zero should be.
  getDay(todayKey());
  save();
}
