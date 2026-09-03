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

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatInlineMarkdown(text) {
  return escapeHtml(text)
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/`([^`]+)`/g, "<span class=\"ai-code\">$1</span>");
}

function splitAiSections(text) {
  const normalized = String(text ?? "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .trim();

  const matches = [...normalized.matchAll(/(?:^|\n)\s*(?:#{1,6}\s*)?(\d+)\.\s+([^\n]+)\s*/g)];

  if (!matches.length) {
    return [{ number: 0, title: "Аналіз", body: normalized }];
  }

  return matches.map((match, index) => {
    const bodyStart = match.index + match[0].length;
    const bodyEnd = index + 1 < matches.length ? matches[index + 1].index : normalized.length;
    return {
      number: Number(match[1]),
      title: match[2].trim(),
      body: normalized.slice(bodyStart, bodyEnd).trim()
    };
  });
}

function extractScore(title, body) {
  const source = `${title} ${body}`;
  const match = source.match(/(?:оцінка|оценка)\s*[—:-]?\s*(\d+(?:[.,]\d+)?)\s*\/\s*10/i)
    || source.match(/(\d+(?:[.,]\d+)?)\s*\/\s*10/);
  if (!match) return null;
  const score = Number(String(match[1]).replace(",", "."));
  return Number.isFinite(score) ? Math.max(0, Math.min(10, score)) : null;
}

function cleanSectionTitle(title) {
  return String(title ?? "")
    .replace(/^#{1,6}\s*/, "")
    .replace(/^\d+\.\s*/, "")
    .replace(/\s*[—:-]\s*\d+(?:[.,]\d+)?\s*\/\s*10\s*$/i, "")
    .trim();
}

function parseBodyBlocks(body) {
  const lines = String(body ?? "")
    .split("\n")
    .map(line => line.trim())
    .filter(Boolean);

  const blocks = [];
  let list = [];

  const flushList = () => {
    if (!list.length) return;
    blocks.push({ type: "list", items: list });
    list = [];
  };

  for (const line of lines) {
    const subheading = line.match(/^#{1,6}\s+(.+)$/);
    if (subheading) {
      flushList();
      blocks.push({ type: "heading", text: subheading[1].trim() });
      continue;
    }

    if (/^(?:[-*•]|\d+[.)])\s+/.test(line)) {
      list.push(line.replace(/^(?:[-*•]|\d+[.)])\s+/, "").trim());
      continue;
    }

    flushList();
    blocks.push({ type: "paragraph", text: line });
  }

  flushList();
  return blocks;
}

function renderAiBlocks(body, options = {}) {
  const blocks = parseBodyBlocks(body);
  return blocks.map(block => {
    if (block.type === "heading") {
      return `<h5>${formatInlineMarkdown(block.text)}</h5>`;
    }
    if (block.type === "list") {
      const items = block.items.map(item => `
        <li><span class="ai-list-icon" aria-hidden="true">${options.icon || "✓"}</span><span>${formatInlineMarkdown(item)}</span></li>
      `).join("");
      return `<ul class="ai-list">${items}</ul>`;
    }
    return `<p>${formatInlineMarkdown(block.text)}</p>`;
  }).join("");
}

function renderAiAnalysis(text) {
  const sections = splitAiSections(text);
  const scoreSection = sections.find(section => section.number === 1) || sections[0];
  const score = extractScore(scoreSection?.title, scoreSection?.body);

  const parts = [];

  if (score != null) {
    const scoreLabel = score >= 8.5 ? "Відмінна робота" : score >= 7 ? "Сильне тренування" : score >= 5 ? "Є що покращити" : "Потрібен обережніший підхід";
    parts.push(`
      <div class="ai-score-card">
        <div class="ai-score-ring" style="--score:${score * 36}deg" aria-label="Оцінка ${score} з 10">
          <strong>${String(score).replace(".", ",")}</strong><span>/10</span>
        </div>
        <div class="ai-score-copy">
          <p class="eyebrow">ОЦІНКА ТРЕНЕРА</p>
          <h4>${escapeHtml(scoreLabel)}</h4>
          <p>Оцінка сформована на основі темпу, пульсу, каденсу, обсягу та динаміки сплітів.</p>
        </div>
      </div>
    `);
  }

  for (const section of sections) {
    const title = cleanSectionTitle(section.title);
    const body = section.body;
    if (!body && section.number !== 1) continue;

    if (section.number === 1) continue;

    if (section.number === 3) {
      parts.push(`
        <details class="ai-accordion">
          <summary>
            <span><b>03</b><strong>${escapeHtml(title)}</strong></span>
            <span class="ai-accordion-toggle" aria-hidden="true">+</span>
          </summary>
          <div class="ai-accordion-body">${renderAiBlocks(body)}</div>
        </details>
      `);
      continue;
    }

    const variant = section.number === 5 ? " is-positive" : section.number === 6 ? " is-warning" : section.number === 8 ? " is-recovery" : section.number === 9 ? " is-conclusion" : "";
    const icon = section.number === 5 ? "✓" : section.number === 6 ? "!" : section.number === 8 ? "↻" : section.number === 9 ? "→" : "";

    parts.push(`
      <article class="ai-section${variant}">
        <div class="ai-section-heading">
          <span class="ai-section-number">${String(section.number).padStart(2, "0")}</span>
          <div>
            <p class="eyebrow">РОЗДІЛ ${String(section.number).padStart(2, "0")}</p>
            <h4>${escapeHtml(title)}</h4>
          </div>
          ${icon ? `<span class="ai-section-icon" aria-hidden="true">${icon}</span>` : ""}
        </div>
        <div class="ai-section-body">${renderAiBlocks(body, { icon: section.number === 5 ? "✓" : section.number === 6 ? "!" : "•" })}</div>
      </article>
    `);
  }

  return parts.join("");
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

function formatAscent(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return "—";
  return `Набір ${number >= 0 ? "+" : ""}${Math.round(number)} м`;
}

function renderStructure(structure = []) {
  if (!structureCard || !structureBody) return;

  structureBody.innerHTML = "";

  if (!structure.length || (structure.length === 1 && structure[0].type === "easy")) {
    structureCard.hidden = true;
    return;
  }

  structureCard.hidden = false;

  for (const block of structure) {
    const section = document.createElement("div");
    section.className = `structure-block structure-${block.type}`;

    if (block.type === "intervals") {
      const rows = (block.repetitions || []).map(rep => `
        <div class="structure-rep">
          <div class="structure-rep-number">${rep.number}</div>

          <div class="structure-work">
            <strong>Робота · ${rep.work.pace}</strong>
            <span>${(rep.work.distance / 1000).toFixed(2)} км · ${rep.work.heartRate ?? "—"} уд/хв · ${formatAscent(rep.work.ascent)}</span>
          </div>

          ${rep.recovery ? `
            <div class="structure-recovery">
              <strong>Відпочинок · ${rep.recovery.pace}</strong>
              <span>${(rep.recovery.distance / 1000).toFixed(2)} км · ${rep.recovery.heartRate ?? "—"} уд/хв · ${formatAscent(rep.recovery.ascent)}</span>
            </div>
          ` : ""}
        </div>
      `).join("");

      section.innerHTML = `
        <div class="structure-block-heading">
          <p>${block.label}</p>
          <small>${block.workCount} повторень</small>
        </div>
        ${rows}
      `;
    } else {
      section.innerHTML = `
        <div class="structure-block-heading">
          <p>${block.label}</p>
          <small>${(block.distance / 1000).toFixed(2)} км · ${block.pace} · ${formatAscent(block.ascent)}</small>
        </div>
      `;
    }

    structureBody.appendChild(section);
  }
}


function formatChartPace(value) {
  return Number.isFinite(value) ? secondsToPace(value) : "—";
}

function renderWorkoutVisuals(summary) {
  const paceChart = document.querySelector("#paceChart");
  const elevationChart = document.querySelector("#elevationChart");
  const visualStats = document.querySelector("#visualStats");
  if (!paceChart || !elevationChart || !visualStats) return;

  const splits = (summary.splits || []).filter(s => Number.isFinite(paceToSeconds(s.pace)));
  if (!splits.length) {
    paceChart.innerHTML = `<div class="chart-empty">Недостатньо даних для графіка</div>`;
    elevationChart.innerHTML = `<div class="chart-empty">Недостатньо даних для графіка</div>`;
    return;
  }

  const paces = splits.map(s => paceToSeconds(s.pace));
  const minPace = Math.min(...paces);
  const maxPace = Math.max(...paces);
  const range = Math.max(1, maxPace - minPace);
  const width = 760;
  const height = 250;
  const padX = 28;
  const padY = 28;
  const innerW = width - padX * 2;
  const innerH = height - padY * 2;
  const x = i => padX + (splits.length === 1 ? innerW / 2 : i * innerW / (splits.length - 1));
  const y = value => padY + ((value - minPace) / range) * innerH;
  const points = paces.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");

  const circles = paces.map((v, i) => `
    <circle cx="${x(i).toFixed(1)}" cy="${y(v).toFixed(1)}" r="5" class="pace-dot">
      <title>Км ${splits[i].km}: ${formatChartPace(v)}</title>
    </circle>`).join("");

  const labels = splits.map((s, i) => {
    if (splits.length > 14 && i % 2 !== 0 && i !== splits.length - 1) return "";
    return `<text x="${x(i).toFixed(1)}" y="${height - 7}" text-anchor="middle">${s.km}</text>`;
  }).join("");

  paceChart.innerHTML = `
    <div class="chart-topline">
      <div><span>Швидкість по кілометрах</span><strong>${formatChartPace(Math.min(...paces))} — ${formatChartPace(Math.max(...paces))}</strong></div>
      <span class="chart-legend"><i></i> темп</span>
    </div>
    <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Графік темпу по кілометрах">
      <defs>
        <linearGradient id="paceFill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stop-opacity=".28" />
          <stop offset="100%" stop-opacity="0" />
        </linearGradient>
      </defs>
      <line x1="${padX}" y1="${padY}" x2="${width-padX}" y2="${padY}" class="chart-gridline" />
      <line x1="${padX}" y1="${height/2}" x2="${width-padX}" y2="${height/2}" class="chart-gridline" />
      <line x1="${padX}" y1="${height-padY}" x2="${width-padX}" y2="${height-padY}" class="chart-gridline" />
      <polyline points="${points} ${x(splits.length-1).toFixed(1)},${height-padY} ${x(0).toFixed(1)},${height-padY}" class="pace-area" />
      <polyline points="${points}" class="pace-line" />
      ${circles}
      ${labels}
    </svg>
  `;

  const ascents = splits.map(s => Math.max(0, Number(s.ascent) || 0));
  const maxAscent = Math.max(1, ...ascents);
  const barGap = Math.max(3, 18 - splits.length * .35);
  const barW = Math.max(8, (width - padX * 2 - barGap * (ascents.length - 1)) / ascents.length);
  const bars = ascents.map((v, i) => {
    const h = v / maxAscent * 135;
    const bx = padX + i * (barW + barGap);
    const by = 184 - h;
    return `<g><rect x="${bx.toFixed(1)}" y="${by.toFixed(1)}" width="${barW.toFixed(1)}" height="${Math.max(2,h).toFixed(1)}" rx="${Math.min(5,barW/2)}" class="elev-bar"><title>Км ${splits[i].km}: набір ${Math.round(v)} м</title></rect><text x="${(bx+barW/2).toFixed(1)}" y="210" text-anchor="middle">${splits[i].km}</text></g>`;
  }).join("");
  const totalAscent = Number(summary.ascent) || ascents.reduce((a,b)=>a+b,0);
  elevationChart.innerHTML = `
    <div class="chart-topline">
      <div><span>Розподіл набору висоти</span><strong>${Math.round(totalAscent)} м загалом</strong></div>
      <span class="chart-legend"><i></i> набір</span>
    </div>
    <svg viewBox="0 0 ${width} 225" role="img" aria-label="Набір висоти по кілометрах">
      <line x1="${padX}" y1="184" x2="${width-padX}" y2="184" class="chart-gridline" />
      ${bars}
    </svg>
  `;

  const fastest = Math.min(...paces);
  const slowest = Math.max(...paces);
  const avg = paces.reduce((a,b)=>a+b,0)/paces.length;
  const bestKm = splits[paces.indexOf(fastest)]?.km ?? "—";
  visualStats.innerHTML = `
    <div><span>Найшвидший км</span><strong>${bestKm} · ${formatChartPace(fastest)}</strong></div>
    <div><span>Середній темп</span><strong>${formatChartPace(avg)}</strong></div>
    <div><span>Різниця темпу</span><strong>${Math.round(slowest-fastest)} с/км</strong></div>
  `;
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

  renderWorkoutVisuals(summary);
  renderSplits(summary.splits);
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
      aiAnalysisText.innerHTML = renderAiAnalysis(
        data.analysis || "Не вдалося отримати аналіз."
      );
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
  if (structureBody) structureBody.innerHTML = "";
  if (structureCard) structureCard.hidden = true;
});
