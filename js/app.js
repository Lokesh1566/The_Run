import { state, save, replaceState, todayKey } from './store.js';
import { renderRoutine, renderTape, currentStreak, initRoutine } from './routine.js';
import { renderPipeline, renderStats, initPipeline, counts } from './pipeline.js';

const exportButton = document.querySelector('#export');
const importButton = document.querySelector('#import');
const importFile = document.querySelector('#import-file');

function renderHeader() {
  const summary = counts();
  const values = {
    streak: currentStreak(),
    replies: summary.replied,
    live: summary.live,
    total: summary.total,
  };

  document.querySelectorAll('[data-metric]').forEach((node) => {
    node.textContent = values[node.dataset.metric];
  });
}

function render() {
  renderRoutine();
  renderTape();
  renderPipeline();
  renderStats();
  renderHeader();
}

function downloadBackup() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = `run-backup-${todayKey()}.json`;
  link.click();

  URL.revokeObjectURL(url);
}

function loadBackup(file) {
  const reader = new FileReader();

  reader.onload = () => {
    let parsed;

    try {
      parsed = JSON.parse(reader.result);
    } catch {
      alert('That file is not valid JSON. Pick the run-backup file you exported.');
      return;
    }

    if (!parsed.days || !Array.isArray(parsed.apps)) {
      alert('That JSON is not a Run backup. Pick the run-backup file you exported.');
      return;
    }

    replaceState(parsed);
    render();
  };

  reader.readAsText(file);
}

exportButton.addEventListener('click', downloadBackup);
importButton.addEventListener('click', () => importFile.click());

importFile.addEventListener('change', (event) => {
  const [file] = event.target.files;
  if (file) loadBackup(file);
  event.target.value = '';
});

initRoutine(render);
initPipeline(render);
save();
render();
