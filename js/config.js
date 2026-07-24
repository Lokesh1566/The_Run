// Edit this file to change the routine. Everything else reads from here.

export const TASKS = [
  { id: 'apply',  label: 'Applications sent',  type: 'count', goal: 10, note: 'Tailored to the posting, not sprayed' },
  { id: 'reach',  label: 'People messaged',    type: 'count', goal: 10, note: 'Real humans at the same companies' },
  { id: 'study',  label: 'Study block',        type: 'check', note: 'One focused hour, phone in another room' },
  { id: 'push',   label: 'Code pushed',        type: 'check', note: 'At least one commit on GitHub today' },
  { id: 'follow', label: 'Follow ups cleared', type: 'check', note: 'Anything sitting untouched for a week' },
  { id: 'log',    label: 'Pipeline logged',    type: 'check', note: 'Today\u2019s applications are all in the table below' },
];

export const STATUSES = ['Applied', 'Screen', 'Interview', 'Final', 'Offer', 'Rejected', 'Ghosted'];

// Still in play, nobody has said no yet.
export const OPEN_STATUSES = ['Applied', 'Screen', 'Interview', 'Final'];

// Somebody actually replied and moved you forward.
export const REPLIED_STATUSES = ['Screen', 'Interview', 'Final', 'Offer'];

export const STALE_AFTER_DAYS = 10;

// How many reps a day needs before it counts toward the streak.
export const STREAK_THRESHOLD = 4;

export const TAPE_LENGTH = 30;
