const dropZone = document.querySelector('#dropZone');
const input = document.querySelector('#fileInput');
const uploadState = document.querySelector('#uploadState');
const results = document.querySelector('#results');
const fileName = document.querySelector('#fileName');
const fileStatus = document.querySelector('#fileStatus');
const progressBar = document.querySelector('#progressBar');
const progressValue = document.querySelector('#progressValue');
const resetButton = document.querySelector('#resetButton');
const distanceValue = document.querySelector('.metric-card:nth-child(1) strong');
const durationValue = document.querySelector('.metric-card:nth-child(2) strong');
const paceValue = document.querySelector('.metric-card:nth-child(3) strong');
const heartRateValue = document.querySelector('.metric-card:nth-child(4) strong');
const runLabel = document.querySelector('.run-label');
const insightText = document.querySelector('.insight-text');
const splitsBody = document.querySelector('#splitsBody');
const navTabs = document.querySelectorAll('.nav-tab');
const views = document.querySelectorAll('[data-view-panel]');
const calcTabs = document.querySelectorAll('.calc-tab');
const calculatorForm = document.querySelector('#calculatorForm');
const calculatorFields = document.querySelector('#calculatorFields');
const calculationResult = document.querySelector('#calculationResult');
const calcEyebrow = document.querySelector('#calc-eyebrow');
const calcTitle = document.querySelector('#calc-title');
const calcDescription = document.querySelector('#calc-description');
const resultLabel = document.querySelector('#result-label');
const resultValue = document.querySelector('#result-value');
const resultDetail = document.querySelector('#result-detail');

const calculators = {
  time: { eyebrow: 'ДИСТАНЦІЯ + ТЕМП', title: 'Який буде час?', description: 'Вкажи дистанцію та бажаний темп.', label: 'Твій орієнтовний час', fields: ['distance', 'pace'] },
  distance: { eyebrow: 'ЧАС + ТЕМП', title: 'Яка буде дистанція?', description: 'Вкажи час, який маєш, і свій темп.', label: 'Твоя орієнтовна дистанція', fields: ['time', 'pace'] },
  pace: { eyebrow: 'ДИСТАНЦІЯ + ЧАС', title: 'Який потрібен темп?', description: 'Вкажи дистанцію та бажаний фінішний час.', label: 'Твій потрібний темп', fields: ['distance', 'time'] },
};
let currentWorkout = null;

const aiAnalyzeButton = document.querySelector('#aiAnalyzeButton');
const splitsSection = document.querySelector('#splitsSection');
const splitsBody = document.querySelector('#splitsBody');
const splitsCount = document.querySelector('#splitsCount');
if (aiAnalyzeButton) {
  aiAnalyzeButton.addEventListener('click', async () => {
    if (!currentWorkout) {
      alert('Спочатку завантаж тренування.');
      return;
    }

    aiAnalyzeButton.disabled = true;
    aiAnalyzeButton.textContent = '🤖 Аналізую тренування…';

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(currentWorkout)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Помилка AI-аналізу');
      }

      alert(data.analysis || 'Аналіз отримано');
    } catch (error) {
      alert(error.message || 'Не вдалося виконати AI-аналіз');
    } finally {
      aiAnalyzeButton.disabled = false;
      aiAnalyzeButton.textContent = '🤖 Проаналізувати тренування';
    }
  });
}
let activeCalculator = 'time';

function renderCalculator(type) {
  activeCalculator = type;
  const calculator = calculators[type];
  calcTabs.forEach((tab) => tab.classList.toggle('is-active', tab.dataset.calculator === type));
  calcEyebrow.textContent = calculator.eyebrow;
  calcTitle.textContent = calculator.title;
  calcDescription.textContent = calculator.description;
  calculatorFields.innerHTML = calculator.fields.map((field) => {
    if (field === 'distance') return `<label class="calc-field"><span>Дистанція</span><div><input name="distance" inputmode="decimal" autocomplete="off" placeholder="Наприклад, 21.1" required><em>км</em></div></label>`;
    if (field === 'time') return `<fieldset class="calc-field time-field"><legend>Час</legend><div class="split-inputs"><label><input name="timeHours" type="number" min="0" inputmode="numeric" placeholder="0"><span>год</span></label><label><input name="timeMinutes" type="number" min="0" max="59" inputmode="numeric" placeholder="00"><span>хв</span></label><label><input name="timeSeconds" type="number" min="0" max="59" inputmode="numeric" placeholder="00"><span>сек</span></label></div></fieldset>`;
    return `<fieldset class="calc-field time-field"><legend>Темп на кілометр</legend><div class="split-inputs"><label><input name="paceMinutes" type="number" min="0" inputmode="numeric" placeholder="5" required><span>хв</span></label><label><input name="paceSeconds" type="number" min="0" max="59" inputmode="numeric" placeholder="30" required><span>сек</span></label></div></fieldset>`;
  }).join('');
  calculationResult.hidden = true;
}

function readNumber(data, name) { const value = data.get(name); return value === '' || value === null ? 0 : Number(value); }

function formatDuration(seconds) {
  const total = Math.round(seconds); const hours = Math.floor(total / 3600); const minutes = Math.floor((total % 3600) / 60); const rest = String(total % 60).padStart(2, '0');
  return hours ? `${hours}:${String(minutes).padStart(2, '0')}:${rest}` : `${minutes}:${rest}`;
}

calculatorForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  const data = new FormData(calculatorForm);
  const distance = Number(String(data.get('distance') || '').replace(',', '.'));
  const hours = readNumber(data, 'timeHours'); const minutes = readNumber(data, 'timeMinutes'); const seconds = readNumber(data, 'timeSeconds');
  const paceMinutes = readNumber(data, 'paceMinutes'); const paceSeconds = readNumber(data, 'paceSeconds');
  const time = hours * 3600 + minutes * 60 + seconds;
  const pace = paceMinutes * 60 + paceSeconds;
  let value; let detail;
  if (activeCalculator === 'time' && distance > 0 && pace > 0) { value = formatDuration(distance * pace); detail = `${distance} км × ${formatDuration(pace)} / км`; }
  if (activeCalculator === 'distance' && time > 0 && pace > 0) { value = (time / pace).toFixed(2); detail = `${formatDuration(time)} при темпі ${formatDuration(pace)} / км`; }
  if (activeCalculator === 'pace' && distance > 0 && time > 0) { value = formatDuration(time / distance); detail = `${distance} км за ${formatDuration(time)}`; }
  if (!value || minutes > 59 || seconds > 59 || paceSeconds > 59) { resultLabel.textContent = 'Перевір введені значення'; resultValue.textContent = '—'; resultDetail.textContent = 'Хвилини та секунди мають бути від 0 до 59.'; }
  else { resultLabel.textContent = calculators[activeCalculator].label; resultValue.textContent = activeCalculator === 'distance' ? `${value} км` : activeCalculator === 'pace' ? `${value} / км` : value; resultDetail.textContent = detail; }
  calculationResult.hidden = false;
});

navTabs.forEach((tab) => tab.addEventListener('click', () => {
  navTabs.forEach((item) => item.classList.toggle('is-active', item === tab));
  views.forEach((view) => view.classList.toggle('is-active', view.id === tab.dataset.view));
  window.scrollTo({ top: 0, behavior: 'smooth' });
}));
calcTabs.forEach((tab) => tab.addEventListener('click', () => renderCalculator(tab.dataset.calculator)));
if (calculatorFields) renderCalculator(activeCalculator);

function formatMetric(value) {
  const separatorIndex = String(value).search(/[.:]/);
  return separatorIndex === -1 ? value : `${String(value).slice(0, separatorIndex)}<span>${String(value).slice(separatorIndex)}</span>`;
}

function renderSummary(summary) {
  distanceValue.innerHTML = formatMetric(summary.distance);
  durationValue.innerHTML = formatMetric(summary.duration);
  paceValue.innerHTML = formatMetric(summary.pace);
  heartRateValue.textContent = summary.heartRate ?? '—';

  const date = summary.date?.toLocaleDateString('uk-UA', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }) ?? 'Завантажене тренування';

  runLabel.textContent = `Біг · ${date}`;

  const details = [
    summary.cadence && `каденс ${summary.cadence} кроків/хв`,
    summary.ascent && `набір ${summary.ascent} м`
  ].filter(Boolean).join(' · ');

  insightText.textContent = details
    ? `Реальні дані з Garmin: ${details}. Детальний аналіз темпу та сплітів доступний нижче.`
    : 'Реальні дані з Garmin завантажено. Детальний аналіз темпу та сплітів доступний нижче.';

  renderSplits(summary.splits || []);
}
function renderSplits(splits) {
  if (!splitsSection || !splitsBody) return;

  splitsBody.innerHTML = '';

  if (!splits.length) {
    splitsSection.hidden = true;
    return;
  }

  splitsSection.hidden = false;

  if (splitsCount) {
    splitsCount.textContent = `${splits.length} сплітів`;
  }

  splits.forEach((split) => {
    const row = document.createElement('tr');

    row.innerHTML = `
      <td class="split-km">${split.km}</td>
      <td class="split-pace">${split.pace || '—'}</td>
      <td>${split.heartRate ?? '—'}</td>
      <td>${split.cadence ?? '—'}</td>
      <td>${split.ascent != null ? `${split.ascent} м` : '—'}</td>
    `;

    splitsBody.appendChild(row);
  });
}

async function selectFile(file) {
  if (!file) return;
  const looksLikeFit = file.name.toLowerCase().endsWith('.fit');
  if (!looksLikeFit) {
    fileStatus.textContent = 'Обери файл із розширенням .fit';
    uploadState.hidden = false;
    uploadState.classList.add('has-error');
    return;
  }

  uploadState.hidden = false;
  uploadState.classList.remove('has-error');
  results.hidden = true;
  fileName.textContent = file.name;
  fileStatus.textContent = 'Готуємо тренування…';
  let percent = 0;
  const timer = window.setInterval(() => {
    percent = Math.min(percent + 8, 72);
    progressBar.style.width = `${percent}%`;
    progressValue.textContent = `${percent}%`;
    if (percent >= 72) {
      window.clearInterval(timer);
    }
  }, 85);
  try {
    const summary = await parseFitFile(file);
    window.clearInterval(timer);
    renderSummary(summary);
    currentWorkout = summary;
    progressBar.style.width = '100%';
    progressValue.textContent = '100%';
    fileStatus.textContent = 'Тренування готове до перегляду';
    window.setTimeout(() => {
      results.hidden = false;
      results.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 250);
  } catch (error) {
    window.clearInterval(timer);
    uploadState.classList.add('has-error');
    progressBar.style.width = '0%';
    progressValue.textContent = '—';
    fileStatus.textContent = error.message || 'Не вдалося прочитати файл';
  }
}

input.addEventListener('change', (event) => selectFile(event.target.files[0]));
['dragenter', 'dragover'].forEach((eventName) => dropZone.addEventListener(eventName, (event) => {
  event.preventDefault();
  dropZone.classList.add('is-dragging');
}));
['dragleave', 'drop'].forEach((eventName) => dropZone.addEventListener(eventName, (event) => {
  event.preventDefault();
  dropZone.classList.remove('is-dragging');
}));
dropZone.addEventListener('drop', (event) => selectFile(event.dataTransfer.files[0]));
resetButton.addEventListener('click', () => {
  input.value = '';
  uploadState.hidden = true;
  results.hidden = true;
  progressBar.style.width = '0%';
  progressValue.textContent = '0%';
});
