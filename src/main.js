const dropZone = document.querySelector("#dropZone");
const input = document.querySelector("#fileInput");
const uploadState = document.querySelector("#uploadState");
const results = document.querySelector("#results");
const fileName = document.querySelector("#fileName");
const fileStatus = document.querySelector("#fileStatus");
const progressBar = document.querySelector("#progressBar");
const progressValue = document.querySelector("#progressValue");
const resetButton = document.querySelector("#resetButton");

const distanceValue = document.querySelector(".metric-card:nth-child(1) strong");
const durationValue = document.querySelector(".metric-card:nth-child(2) strong");
const paceValue = document.querySelector(".metric-card:nth-child(3) strong");
const heartRateValue = document.querySelector(".metric-card:nth-child(4) strong");
const runLabel = document.querySelector(".run-label");
const insightText = document.querySelector(".insight-text");
const splitsBody = document.querySelector("#splitsBody");
const structureCard = document.querySelector("#structureCard");
const structureBody = document.querySelector("#structureBody");
const aiAnalyzeButton = document.querySelector("#aiAnalyzeButton");
const aiAnalysis = document.querySelector("#aiAnalysis");
const aiAnalysisText = document.querySelector("#aiAnalysisText");
const visualDashboard = document.querySelector("#visualDashboard");
const paceChart = document.querySelector("#paceChart");
const ascentChart = document.querySelector("#ascentChart");
const fastestSplitValue = document.querySelector("#fastestSplitValue");
const ascentChartValue = document.querySelector("#ascentChartValue");
const bestSplitValue = document.querySelector("#bestSplitValue");
const bestSplitMeta = document.querySelector("#bestSplitMeta");
const bestSplitTrack = document.querySelector("#bestSplitTrack");

let currentWorkout = null;

function formatMetric(value) {
  const stringValue = String(value ?? "—");
  const index = stringValue.search(/[.:]/);
  return index === -1
    ? stringValue
    : `${stringValue.slice(0, index)}<span>${stringValue.slice(index)}</span>`;
}

function paceToSeconds(pace) {
  if (!pace || typeof pace !== "string") return null;
  const parts = pace.split(":").map(Number);
  if (parts.length !== 2 || parts.some(v => !Number.isFinite(v))) return null;
  return parts[0] * 60 + parts[1];
}

function formatAiText(text) {
  const escaped = String(text ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  return escaped
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\n\n+/g, "</p><p>")
    .replace(/\n/g, "<br>");
}

function detectWorkoutType(summary) {
  const distance = Number(summary.distance);
  const paces = (summary.splits || [])
    .map(s => paceToSeconds(s.pace))
    .filter(Number.isFinite);

  if (distance >= 15) return "Довга пробіжка";

  if (paces.length >= 4) {
    const average = paces.reduce((a, b) => a + b, 0) / paces.length;
    let changes = 0;

    for (let i = 1; i < paces.length; i++) {
      if (Math.abs(paces[i] - paces[i - 1]) >= 20) changes++;
    }

    const variation =
      paces.reduce((sum, p) => sum + Math.abs(p - average) / average, 0) /
      paces.length;

    if (changes >= 3 && variation >= 0.06) return "Інтервальне тренування";
    if (variation <= 0.035 && distance >= 5) return "Темповий / рівномірний біг";
  }

  return "Бігове тренування";
}

function generateWorkoutInsight(summary) {
  const splits = summary.splits || [];
  const paces = splits.map(s => paceToSeconds(s.pace)).filter(Number.isFinite);

  if (!paces.length) {
    return "Реальні дані з Garmin завантажено. Детальний аналіз сплітів недоступний.";
  }

  const half = Math.ceil(paces.length / 2);
  const first = paces.slice(0, half);
  const second = paces.slice(half);

  const firstAvg = first.reduce((a, b) => a + b, 0) / first.length;
  const secondAvg = second.length
    ? second.reduce((a, b) => a + b, 0) / second.length
    : firstAvg;

  let text;

  if (firstAvg - secondAvg > 8) {
    text = "Ти поступово прискорювався — друга половина тренування була швидшою.";
  } else if (firstAvg - secondAvg < -8) {
    text = "На початку темп був швидшим, а в другій половині відбулося поступове зниження.";
  } else {
    text = "Темп був відносно рівним протягом тренування — хороший контроль зусилля.";
  }

  const details = [];

  if (summary.heartRate != null) {
    details.push(`середній пульс ${summary.heartRate} уд/хв`);
  }

  if (summary.cadence != null) {
    details.push(`каденс ${summary.cadence} кроків/хв`);
  }

  if (summary.ascent != null) {
    details.push(`набір ${summary.ascent} м`);
  }

  return details.length
    ? `${text} ${details.join(" · ")}.`
    : text;
}

function renderSplits(splits = []) {
  if (!splitsBody) return;

  splitsBody.innerHTML = "";

  if (!splits.length) {
    splitsBody.innerHTML = `
      <tr>
        <td colspan="5" class="splits-empty">
          Спліти не знайдені
        </td>
      </tr>
    `;
    return;
  }

  for (const split of splits) {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td class="split-km">${split.km}</td>
      <td class="split-pace">${split.pace ?? "—"}</td>
      <td>${split.heartRate ?? "—"}</td>
      <td>${split.cadence ?? "—"}</td>
      <td>${split.ascent != null ? `${split.ascent} м` : "—"}</td>
    `;

    splitsBody.appendChild(row);
  }
}

function renderStructure(structure = []) {
  if (!structureCard || !structureBody) return;
  structureBody.innerHTML = "";
  if (!structure.length || (structure.length === 1 && structure[0].type === "easy")) { structureCard.hidden = true; return; }
  structureCard.hidden = false;
  for (const block of structure) {
    const section = document.createElement("div");
    section.className = `structure-block structure-${block.type}`;
    if (block.type === "intervals") {
      const rows = (block.repetitions || []).map(rep => `
        <div class="structure-rep">
          <div class="structure-rep-number">${rep.number}</div>
          <div><strong>Работа · ${rep.work.pace}</strong><span>${(rep.work.distance / 1000).toFixed(2)} км · ${rep.work.heartRate ?? "—"} уд/хв · +${rep.work.ascent ?? 0} м</span></div>
          ${rep.recovery ? `<div class="structure-recovery"><strong>Отдых · ${rep.recovery.pace}</strong><span>${(rep.recovery.distance / 1000).toFixed(2)} км · ${rep.recovery.heartRate ?? "—"} уд/хв · +${rep.recovery.ascent ?? 0} м</span></div>` : ""}
        </div>`).join("");
      section.innerHTML = `<div class="structure-block-heading"><p>${block.label}</p><small>${block.workCount} повторений</small></div>${rows}`;
    } else {
      section.innerHTML = `<div class="structure-block-heading"><p>${block.label}</p><small>${(block.distance / 1000).toFixed(2)} км · ${block.pace} · +${block.ascent ?? 0} м</small></div>`;
    }
    structureBody.appendChild(section);
  }
}


function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function renderPaceChart(splits = []) {
  if (!paceChart) return;
  const data = splits
    .map((split, index) => ({
      km: split.km ?? index + 1,
      pace: paceToSeconds(split.pace),
      label: split.pace ?? "—"
    }))
    .filter(item => Number.isFinite(item.pace));

  if (!data.length) {
    paceChart.innerHTML = '<div class="chart-empty">Недостатньо даних для графіка</div>';
    return;
  }

  const width = 760;
  const height = 240;
  const pad = { top: 22, right: 22, bottom: 38, left: 44 };
  const min = Math.min(...data.map(d => d.pace));
  const max = Math.max(...data.map(d => d.pace));
  const range = Math.max(10, max - min);
  const yMin = min - range * .12;
  const yMax = max + range * .12;
  const x = i => data.length === 1 ? width / 2 : pad.left + i * ((width - pad.left - pad.right) / (data.length - 1));
  const y = value => pad.top + ((value - yMin) / (yMax - yMin)) * (height - pad.top - pad.bottom);
  const points = data.map((d, i) => `${x(i).toFixed(1)},${y(d.pace).toFixed(1)}`).join(' ');
  const area = `${pad.left},${height-pad.bottom} ${points} ${x(data.length-1).toFixed(1)},${height-pad.bottom}`;
  const gridValues = [0, .5, 1].map(t => yMin + (yMax-yMin)*t);

  const dots = data.map((d, i) => `
    <g class="chart-point">
      <circle cx="${x(i)}" cy="${y(d.pace)}" r="4.5"></circle>
      <title>Км ${d.km}: ${escapeHtml(d.label)}/км</title>
    </g>`).join('');
  const labels = data.map((d, i) => {
    if (data.length > 14 && i % 2 !== 0 && i !== data.length - 1) return '';
    return `<text x="${x(i)}" y="${height-12}" text-anchor="middle">${d.km}</text>`;
  }).join('');
  const grid = gridValues.map(v => `<line x1="${pad.left}" y1="${y(v)}" x2="${width-pad.right}" y2="${y(v)}" class="chart-grid"></line>`).join('');

  paceChart.innerHTML = `<svg class="data-chart" viewBox="0 0 ${width} ${height}" role="img" aria-label="Графік темпу по кілометрах" preserveAspectRatio="none">
    <defs><linearGradient id="paceFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stop-opacity=".22"></stop><stop offset="100%" stop-opacity="0"></stop></linearGradient></defs>
    ${grid}
    <polygon points="${area}" class="chart-area"></polygon>
    <polyline points="${points}" class="chart-line"></polyline>
    ${dots}
    ${labels}
  </svg>`;

  const fastest = data.reduce((best, item) => item.pace < best.pace ? item : best, data[0]);
  if (fastestSplitValue) fastestSplitValue.textContent = `Км ${fastest.km} · ${fastest.label}/км`;
}

function renderAscentChart(splits = []) {
  if (!ascentChart) return;
  const data = splits.map((split, index) => ({
    km: split.km ?? index + 1,
    ascent: Number(split.ascent) || 0
  }));
  if (!data.length) {
    ascentChart.innerHTML = '<div class="chart-empty">Недостатньо даних для графіка</div>';
    return;
  }
  const width = 760;
  const height = 190;
  const pad = { top: 16, right: 18, bottom: 32, left: 18 };
  const max = Math.max(1, ...data.map(d => d.ascent));
  const gap = 7;
  const barWidth = Math.max(6, ((width - pad.left - pad.right) - gap * (data.length - 1)) / data.length);
  const usable = height - pad.top - pad.bottom;
  const bars = data.map((d, i) => {
    const h = Math.max(2, (d.ascent / max) * usable);
    const bx = pad.left + i * (barWidth + gap);
    const by = height - pad.bottom - h;
    return `<g><rect x="${bx}" y="${by}" width="${barWidth}" height="${h}" rx="5" class="ascent-bar"><title>Км ${d.km}: набір +${d.ascent} м</title></rect><text x="${bx+barWidth/2}" y="${height-10}" text-anchor="middle">${d.km}</text></g>`;
  }).join('');
  ascentChart.innerHTML = `<svg class="data-chart" viewBox="0 0 ${width} ${height}" role="img" aria-label="Набір висоти по кілометрах" preserveAspectRatio="none">
    <line x1="${pad.left}" y1="${height-pad.bottom}" x2="${width-pad.right}" y2="${height-pad.bottom}" class="chart-axis"></line>${bars}
  </svg>`;
  const total = data.reduce((sum, d) => sum + d.ascent, 0);
  if (ascentChartValue) ascentChartValue.textContent = `+${total} м`;
}

function renderVisualDashboard(summary) {
  if (!visualDashboard) return;
  const splits = summary.splits || [];
  if (!splits.length) { visualDashboard.hidden = true; return; }
  visualDashboard.hidden = false;
  renderPaceChart(splits);
  renderAscentChart(splits);
  const timed = splits.map((s, i) => ({...s, seconds: paceToSeconds(s.pace), index: i})).filter(s => Number.isFinite(s.seconds));
  if (timed.length) {
    const best = timed.reduce((a,b) => b.seconds < a.seconds ? b : a, timed[0]);
    if (bestSplitValue) bestSplitValue.textContent = best.pace;
    if (bestSplitMeta) bestSplitMeta.textContent = `Кілометр ${best.km} · ${best.heartRate ?? '—'} уд/хв · Набір +${best.ascent ?? 0} м`;
    if (bestSplitTrack) bestSplitTrack.style.width = `${Math.max(18, Math.min(100, 100 - ((best.seconds - Math.min(...timed.map(s => s.seconds))) / Math.max(1, Math.max(...timed.map(s => s.seconds)) - Math.min(...timed.map(s => s.seconds)))) * 82))}%`;
  }
}

function renderSummary(summary) {
  distanceValue.innerHTML = formatMetric(summary.distance);
  durationValue.innerHTML = formatMetric(summary.duration);
  paceValue.innerHTML = formatMetric(summary.pace);
  heartRateValue.textContent = summary.heartRate ?? "—";

  const date = summary.date instanceof Date && !Number.isNaN(summary.date.getTime())
    ? summary.date.toLocaleDateString("uk-UA", {
        day: "numeric",
        month: "long",
        year: "numeric"
      })
    : "Завантажене тренування";

  runLabel.textContent =
    `${detectWorkoutType(summary)} · ${date}`;

  insightText.textContent =
    generateWorkoutInsight(summary);

  renderSplits(summary.splits);
  renderVisualDashboard(summary);
  renderStructure(summary.structure);

  if (aiAnalysis) aiAnalysis.hidden = true;
  if (aiAnalysisText) aiAnalysisText.innerHTML = "";
}

async function analyzeWithAI() {
  if (!currentWorkout || !aiAnalyzeButton) return;

  aiAnalyzeButton.disabled = true;
  aiAnalyzeButton.classList.add("is-loading");
  aiAnalyzeButton.innerHTML =
    '<span class="ai-button-icon">✦</span><span>Аналізую тренування…</span>';

  if (aiAnalysis) {
    aiAnalysis.hidden = false;
    aiAnalysis.classList.add("is-loading");
  }

  if (aiAnalysisText) {
    aiAnalysisText.innerHTML =
      '<div class="ai-loader"><span></span><span></span><span></span></div>';
  }

  try {
    const response = await fetch("/api/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(currentWorkout)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Помилка AI-аналізу");
    }

    if (aiAnalysisText) {
      aiAnalysisText.innerHTML =
        `<p>${formatAiText(data.analysis || "Не вдалося отримати аналіз.")}</p>`;
    }

    if (aiAnalysis) {
      aiAnalysis.classList.remove("is-loading");
      aiAnalysis.scrollIntoView({
        behavior: "smooth",
        block: "nearest"
      });
    }
  } catch (error) {
    if (aiAnalysisText) {
      aiAnalysisText.innerHTML =
        `<p class="ai-error">${String(error.message || "Не вдалося виконати AI-аналіз")}</p>`;
    }
    if (aiAnalysis) aiAnalysis.classList.remove("is-loading");
  } finally {
    aiAnalyzeButton.disabled = false;
    aiAnalyzeButton.classList.remove("is-loading");
    aiAnalyzeButton.innerHTML =
      '<span class="ai-button-icon">✦</span><span>Проаналізувати тренування</span>';
  }
}

aiAnalyzeButton?.addEventListener("click", analyzeWithAI);

async function selectFile(file) {
  if (!file) return;

  if (!file.name.toLowerCase().endsWith(".fit")) {
    uploadState.hidden = false;
    uploadState.classList.add("has-error");
    fileStatus.textContent = "Обери файл із розширенням .fit";
    return;
  }

  uploadState.hidden = false;
  uploadState.classList.remove("has-error");
  results.hidden = true;

  fileName.textContent = file.name;
  fileStatus.textContent = "Готуємо тренування…";
  progressBar.style.width = "0%";
  progressValue.textContent = "0%";

  let percent = 0;
  const timer = window.setInterval(() => {
    percent = Math.min(percent + 8, 72);
    progressBar.style.width = `${percent}%`;
    progressValue.textContent = `${percent}%`;

    if (percent >= 72) window.clearInterval(timer);
  }, 85);

  try {
    const summary = await parseFitFile(file);

    window.clearInterval(timer);
    currentWorkout = summary;

    renderSummary(summary);

    progressBar.style.width = "100%";
    progressValue.textContent = "100%";
    fileStatus.textContent = "Тренування готове до перегляду";

    window.setTimeout(() => {
      results.hidden = false;
      results.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }, 250);
  } catch (error) {
    window.clearInterval(timer);

    uploadState.classList.add("has-error");
    progressBar.style.width = "0%";
    progressValue.textContent = "—";
    fileStatus.textContent =
      error.message || "Не вдалося прочитати файл";
  }
}

input?.addEventListener("change", event => {
  selectFile(event.target.files[0]);
});

["dragenter", "dragover"].forEach(eventName => {
  dropZone?.addEventListener(eventName, event => {
    event.preventDefault();
    dropZone.classList.add("is-dragging");
  });
});

["dragleave", "drop"].forEach(eventName => {
  dropZone?.addEventListener(eventName, event => {
    event.preventDefault();
    dropZone.classList.remove("is-dragging");
  });
});

dropZone?.addEventListener("drop", event => {
  selectFile(event.dataTransfer.files[0]);
});

resetButton?.addEventListener("click", () => {
  input.value = "";
  uploadState.hidden = true;
  results.hidden = true;
  currentWorkout = null;

  progressBar.style.width = "0%";
  progressValue.textContent = "0%";

  if (aiAnalysis) aiAnalysis.hidden = true;
  if (splitsBody) splitsBody.innerHTML = "";
  if (visualDashboard) visualDashboard.hidden = true;
  if (structureBody) structureBody.innerHTML = "";
  if (structureCard) structureCard.hidden = true;
});
