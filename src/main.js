const dropZone =
  document.querySelector('#dropZone');

const input =
  document.querySelector('#fileInput');

const uploadState =
  document.querySelector('#uploadState');

const results =
  document.querySelector('#results');

const fileName =
  document.querySelector('#fileName');

const fileStatus =
  document.querySelector('#fileStatus');

const progressBar =
  document.querySelector('#progressBar');

const progressValue =
  document.querySelector('#progressValue');

const resetButton =
  document.querySelector('#resetButton');

const distanceValue =
  document.querySelector(
    '.metric-card:nth-child(1) strong'
  );

const durationValue =
  document.querySelector(
    '.metric-card:nth-child(2) strong'
  );

const paceValue =
  document.querySelector(
    '.metric-card:nth-child(3) strong'
  );

const heartRateValue =
  document.querySelector(
    '.metric-card:nth-child(4) strong'
  );

const runLabel =
  document.querySelector('.run-label');

const insightText =
  document.querySelector('.insight-text');

const splitsBody =
  document.querySelector('#splitsBody');

const splitsSection =
  document.querySelector('#splitsSection');

function formatMetric(value) {
  const stringValue =
    String(value ?? '—');

  const separatorIndex =
    stringValue.search(/[.:]/);

  if (separatorIndex === -1) {
    return stringValue;
  }

  return (
    stringValue.slice(0, separatorIndex) +
    `<span>${stringValue.slice(separatorIndex)}</span>`
  );
}

function renderSplits(splits) {
  if (!splitsBody) {
    return;
  }

  splitsBody.innerHTML = '';

  if (!Array.isArray(splits) || splits.length === 0) {
    if (splitsSection) {
      splitsSection.hidden = false;
    }

    splitsBody.innerHTML = `
      <tr>
        <td colspan="5" class="splits-empty">
          У FIT-файлі не знайдено повних кілометрових сплітів.
        </td>
      </tr>
    `;

    return;
  }

  if (splitsSection) {
    splitsSection.hidden = false;
  }

  splits.forEach((split) => {
    const row =
      document.createElement('tr');

    row.innerHTML = `
      <td>${split.number}</td>
      <td>${split.pace ?? '—'}</td>
      <td>${split.heartRate ?? '—'}</td>
      <td>${split.cadence ?? '—'}</td>
      <td>${split.ascent ?? '—'}</td>
    `;

    splitsBody.appendChild(row);
  });
}

function buildInsight(summary) {
  const parts = [];

  if (summary.heartRate != null) {
    parts.push(
      `середній пульс — ${summary.heartRate} уд/хв`
    );
  }

  if (summary.cadence != null) {
    parts.push(
      `середній каденс — ${summary.cadence} кроків/хв`
    );
  }

  if (summary.ascent != null) {
    parts.push(
      `набір висоти — ${summary.ascent} м`
    );
  }

  if (summary.splits?.length) {
    parts.push(
      `сплітів — ${summary.splits.length}`
    );
  }

  if (parts.length === 0) {
    return 'Реальні дані з Garmin успішно завантажено.';
  }

  return `Реальні дані з Garmin: ${parts.join(' · ')}.`;
}

function renderSummary(summary) {
  distanceValue.innerHTML =
    formatMetric(summary.distance);

  durationValue.innerHTML =
    formatMetric(summary.duration);

  paceValue.innerHTML =
    formatMetric(summary.pace);

  heartRateValue.textContent =
    summary.heartRate ?? '—';

  const date =
    summary.date instanceof Date &&
    !Number.isNaN(summary.date.getTime())
      ? summary.date.toLocaleDateString(
          'uk-UA',
          {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          }
        )
      : 'Завантажене тренування';

  runLabel.textContent =
    `Біг · ${date}`;

  insightText.textContent =
    buildInsight(summary);

  renderSplits(summary.splits);
}

async function selectFile(file) {
  if (!file) {
    return;
  }

  const looksLikeFit =
    file.name
      .toLowerCase()
      .endsWith('.fit');

  if (!looksLikeFit) {
    fileStatus.textContent =
      'Обери файл із розширенням .fit';

    uploadState.hidden = false;
    uploadState.classList.add('has-error');

    return;
  }

  uploadState.hidden = false;
  uploadState.classList.remove('has-error');

  results.hidden = true;

  fileName.textContent =
    file.name;

  fileStatus.textContent =
    'Готуємо тренування…';

  progressBar.style.width = '0%';
  progressValue.textContent = '0%';

  let percent = 0;

  const timer =
    window.setInterval(() => {
      percent =
        Math.min(
          percent + 8,
          72
        );

      progressBar.style.width =
        `${percent}%`;

      progressValue.textContent =
        `${percent}%`;

      if (percent >= 72) {
        window.clearInterval(timer);
      }
    }, 85);

  try {
    const summary =
      await parseFitFile(file);

    window.clearInterval(timer);

    renderSummary(summary);

    progressBar.style.width =
      '100%';

    progressValue.textContent =
      '100%';

    fileStatus.textContent =
      'Тренування готове до перегляду';

    window.setTimeout(() => {
      results.hidden = false;

      results.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }, 250);

  } catch (error) {
    window.clearInterval(timer);

    uploadState.classList.add(
      'has-error'
    );

    progressBar.style.width =
      '0%';

    progressValue.textContent =
      '—';

    fileStatus.textContent =
      error?.message ||
      'Не вдалося прочитати файл';
  }
}

input.addEventListener(
  'change',
  (event) => {
    selectFile(
      event.target.files[0]
    );
  }
);

['dragenter', 'dragover'].forEach(
  (eventName) => {
    dropZone.addEventListener(
      eventName,
      (event) => {
        event.preventDefault();

        dropZone.classList.add(
          'is-dragging'
        );
      }
    );
  }
);

['dragleave', 'drop'].forEach(
  (eventName) => {
    dropZone.addEventListener(
      eventName,
      (event) => {
        event.preventDefault();

        dropZone.classList.remove(
          'is-dragging'
        );
      }
    );
  }
);

dropZone.addEventListener(
  'drop',
  (event) => {
    selectFile(
      event.dataTransfer.files[0]
    );
  }
);

resetButton.addEventListener(
  'click',
  () => {
    input.value = '';

    uploadState.hidden = true;
    results.hidden = true;

    progressBar.style.width =
      '0%';

    progressValue.textContent =
      '0%';

    if (splitsBody) {
      splitsBody.innerHTML = '';
    }
  }
);
