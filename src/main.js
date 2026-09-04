const dropZone = document.querySelector("#dropZone");
const input = document.querySelector("#fileInput");
const uploadState = document.querySelector("#uploadState");
const results = document.querySelector("#results");
const fileName = document.querySelector("#fileName");
const fileStatus = document.querySelector("#fileStatus");
const progressBar = document.querySelector("#progressBar");
const progressValue = document.querySelector("#progressValue");
const resetButton = document.querySelector("#resetButton");

const distanceValue = document.querySelector("#summaryDistance");
const durationValue = document.querySelector("#summaryDuration");
const paceValue = document.querySelector("#summaryPace");
const heartRateValue = document.querySelector("#summaryHeartRate");
const caloriesValue = document.querySelector("#summaryCalories");
const ascentValue = document.querySelector("#summaryAscent");
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

function capitalizeSentences(text) {
  return String(text ?? "").replace(/([.!?…])([\s]+)([a-zа-яіїєґ])/g, (match, punctuation, space, letter) =>
    `${punctuation}${space}${letter.toUpperCase()}`
  );
}

function formatInlineMarkdown(text) {
  return escapeHtml(capitalizeSentences(text))
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/`([^`]+)`/g, '<span class="ai-code">$1</span>');
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
    const scoreLabel = score >= 8.5
      ? "Відмінна робота"
      : score >= 7
        ? "Сильне тренування"
        : score >= 5
          ? "Є що покращити"
          : "Потрібен обережніший підхід";

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
            <span><strong>${formatInlineMarkdown(title)}</strong></span>
            <span class="ai-accordion-toggle" aria-hidden="true">+</span>
          </summary>
          <div class="ai-accordion-body">${renderAiBlocks(body)}</div>
        </details>
      `);
      continue;
    }

    const variant = section.number === 5
      ? " is-positive"
      : section.number === 6
        ? " is-warning"
        : section.number === 8
          ? " is-recovery"
          : section.number === 9
            ? " is-conclusion"
            : "";
    const icon = section.number === 5
      ? "✓"
      : section.number === 6
        ? "!"
        : section.number === 9
          ? "→"
          : "";

    parts.push(`
      <article class="ai-section${variant}">
        <div class="ai-section-heading">
          <div class="ai-section-title-wrap">
            <h4>${formatInlineMarkdown(title)}</h4>
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
    details.push(`Середній пульс ${summary.heartRate} уд/хв`);
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
      <td class="split-elevation ${Number(split.ascent) < 0 ? "is-down" : ""}">${split.ascent != null ? `${split.ascent > 0 ? '+' : ''}${split.ascent} м` : "—"}</td>
    `;

    splitsBody.appendChild(row);
  }
}

function formatElevation(value) {
  if (!Number.isFinite(Number(value))) return "—";
  const n = Math.round(Number(value));
  if (n === 0) return "0 м";
  return `${n > 0 ? '+' : ''}${n} м`;
}

function formatTerrain(value) {
  if (!Number.isFinite(Number(value))) return "Рельєф —";
  const n = Math.round(Number(value));
  if (n === 0) return "Рівно 0 м";
  return n > 0 ? `Набір +${n} м` : `Спуск −${Math.abs(n)} м`;
}

function renderStructure(structure = []) {
  if (!structureCard || !structureBody) return;
  structureBody.innerHTML = "";

  if (!structure.length || (structure.length === 1 && structure[0].type === "easy")) {
    structureCard.hidden = true;
    return;
  }

  structureCard.hidden = false;

  const formatDuration = (seconds) => {
    const total = Math.max(0, Math.round(Number(seconds) || 0));
    const minutes = Math.floor(total / 60);
    const secs = String(total % 60).padStart(2, "0");
    return `${minutes}:${secs}`;
  };

  const formatDistance = (meters) => {
    const value = Number(meters);
    if (!Number.isFinite(value)) return "—";
    return value >= 1000
      ? `${(value / 1000).toFixed(2).replace(".", ",")} км`
      : `${Math.round(value)} м`;
  };

  const formatStats = (stats) => {
    if (!stats) return "—";

    const parts = [];

    if (Number.isFinite(Number(stats.distance))) {
      parts.push(formatDistance(stats.distance));
    }

    if (stats.duration != null && Number.isFinite(Number(stats.duration))) {
      parts.push(formatDuration(stats.duration));
    }

    if (stats.pace && stats.pace !== "—") {
      parts.push(`${stats.pace} /км`);
    }

    if (Number.isFinite(Number(stats.heartRate))) {
      parts.push(`${Math.round(Number(stats.heartRate))} уд/хв`);
    }

    if (Number.isFinite(Number(stats.cadence))) {
      parts.push(`${Math.round(Number(stats.cadence))} к/хв`);
    }

    if (Number.isFinite(Number(stats.elevation))) {
      parts.push(formatTerrain(stats.elevation));
    }

    return parts.join(" · ") || "—";
  };

  const averageStats = (items = []) => {
    const valid = items.filter(Boolean);
    const distance = valid.reduce((sum, item) => sum + Number(item.distance || 0), 0);
    const duration = valid.reduce((sum, item) => sum + Number(item.duration || 0), 0);
    const hrValues = valid.map(item => Number(item.heartRate)).filter(Number.isFinite);
    const cadValues = valid.map(item => Number(item.cadence)).filter(Number.isFinite);
    const ascent = valid.reduce((sum, item) => sum + Number(item.ascent || 0), 0);
    const descent = valid.reduce((sum, item) => sum + Number(item.descent || 0), 0);

    return {
      distance,
      duration,
      pace: distance > 0
        ? `${Math.floor(duration / (distance / 1000) / 60)}:${String(Math.round(duration / (distance / 1000)) % 60).padStart(2, "0")}`
        : "—",
      heartRate: hrValues.length
        ? Math.round(hrValues.reduce((a, b) => a + b, 0) / hrValues.length)
        : null,
      cadence: cadValues.length
        ? Math.round(cadValues.reduce((a, b) => a + b, 0) / cadValues.length)
        : null,
      ascent,
      descent,
      elevation: ascent >= descent ? ascent : -descent
    };
  };

  const addTimelineItem = (type, title, meta, extraClass = "") => {
    const item = document.createElement("div");
    item.className = `timeline-item timeline-${type} ${extraClass}`.trim();
    item.innerHTML = `
      <span class="timeline-dot" aria-hidden="true"></span>
      <div class="timeline-content">
        <strong>${title}</strong>
        <span>${meta}</span>
      </div>`;
    structureBody.appendChild(item);
  };

  for (const block of structure) {
    if (block.type === "intervals") {
      const reps = block.repetitions || [];

      if (!reps.length) continue;

      const workItems = reps.map(rep => rep.work).filter(Boolean);
      const recoveryItems = reps.map(rep => rep.recovery).filter(Boolean);
      const work = averageStats(workItems);
      const recovery = averageStats(recoveryItems);
      const workDistance = reps[0]?.work?.distance || 1000;
      const recoveryDistance = reps.find(rep => rep.recovery)?.recovery?.distance || 400;

      // Заголовок блока — сохраняем общую информацию о серии.
      addTimelineItem(
        "work",
        `Робота · ${block.workCount || reps.length} × ${Math.round(workDistance)} м`,
        `${formatDistance(work.distance)} · ${formatDuration(work.duration)} · ${work.pace} /км · ${formatTerrain(work.elevation)}`
      );

      // Главное: показываем КАЖДЫЙ интервал и КАЖДОЕ восстановление отдельно.
      reps.forEach((rep, index) => {
        const number = rep.number || index + 1;

        if (rep.work) {
          addTimelineItem(
            "work",
            `Інтервал ${number}`,
            formatStats(rep.work),
            "timeline-detail"
          );
        }

        if (rep.recovery) {
          addTimelineItem(
            "recovery",
            `Відновлення ${number}`,
            formatStats(rep.recovery),
            "timeline-detail"
          );
        }
      });

      // Невеликий підсумок відновлень — тільки якщо вони реально є.
      if (recoveryItems.length) {
        addTimelineItem(
          "recovery",
          `Відновлення · ${recoveryItems.length} × ${Math.round(recoveryDistance)} м`,
          `${formatDistance(recovery.distance)} · ${formatDuration(recovery.duration)} · ${recovery.pace} /км · ${formatTerrain(recovery.elevation)}`,
          "timeline-summary"
        );
      }

      continue;
    }

    const label =
      block.type === "warmup"
        ? "Розминка"
        : block.type === "cooldown"
          ? "Заминка"
          : block.label;

    const type =
      block.type === "warmup"
        ? "warmup"
        : block.type === "cooldown"
          ? "cooldown"
          : "work";

    addTimelineItem(
      type,
      label,
      formatStats(block)
    );
  }
}

function renderSummary(summary) {
  if (distanceValue) distanceValue.textContent = summary.distance != null ? `${String(summary.distance).replace(".", ",")} км` : "—";
  if (durationValue) durationValue.textContent = summary.duration ?? "—";
  if (paceValue) paceValue.textContent = summary.pace != null ? `${summary.pace} /км` : "—";
  if (heartRateValue) heartRateValue.textContent = summary.heartRate != null ? `${summary.heartRate} уд/хв` : "—";
  if (caloriesValue) {
    const calories = summary.calories ?? summary.totalCalories ?? null;
    const caloriesMetric = caloriesValue.closest(".summary-metric");

    if (calories != null && Number.isFinite(Number(calories))) {
      caloriesValue.textContent = `${Math.round(Number(calories)).toLocaleString("uk-UA")} ккал`;
      if (caloriesMetric) caloriesMetric.hidden = false;
    } else {
      // Якщо Garmin не передав калорії — не показуємо порожній показник.
      if (caloriesMetric) caloriesMetric.hidden = true;
    }
  }
  if (ascentValue) {
    ascentValue.textContent = summary.ascent != null ? `${Math.round(summary.ascent)} м` : "—";
  }

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
        renderAiAnalysis(data.analysis || "Не вдалося отримати аналіз.");
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
        `<p class="ai-error">${escapeHtml(error.message || "Не вдалося виконати AI-аналіз")}</p>`;
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
