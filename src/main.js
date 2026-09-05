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

const translations = {
  uk: {
    navAnalysis: "Аналіз тренування",
    navCalculator: "Калькулятор бігу",
    heroEyebrow: "РОЗУМНИЙ ПІДХІД ДО ТВОЇХ ТРЕНУВАНЬ",
    heroTitle: "Кожен кілометр<br />має значення.",
    heroCopy: "Runory — аналіз твоїх тренувань у цифрах.<br />Завантаж тренування з Garmin та дізнайся,<br />що насправді відбулося під час пробіжки.",
    uploadEyebrow: "НОВЕ ТРЕНУВАННЯ",
    uploadTitle: "Завантаж FIT-файл",
    uploadHelp: "FIT-файл з Garmin Connect<br />Обробка лише на твоєму пристрої",
    dropTitle: "Додай тренування з Garmin",
    chooseFit: "Обрати FIT-файл",
    dropSubtitle: "або перетягни файл у цю область",
    fileReady: "Готово до аналізу",
    removeFile: "Видалити файл",
    summaryTitle: "ПІДСУМОК ТРЕНУВАННЯ",
    distance: "Дистанція",
    time: "Час",
    pace: "Середній темп",
    heartRate: "Середній пульс",
    calories: "Калорії",
    ascent: "Набір висоти",
    structureTitle: "СТРУКТУРА ТРЕНУВАННЯ",
    structureNote: "Структуру тренування визначено автоматично на основі даних Garmin та динаміки сплітів.",
    resultsEyebrow: "ТРЕНУВАННЯ ГОТОВЕ",
    resultsTitle: "Твій забіг у цифрах",
    splitsEyebrow: "КІЛОМЕТРОВІ СПЛІТИ",
    splitsTitle: "Як змінювався твій біг",
    splitKm: "Км",
    splitPace: "Темп",
    splitHr: "Пульс",
    splitCadence: "Каденс",
    splitAscent: "Набір",
    splitsEmpty: "Спліти з'являться після завантаження FIT-файлу.",
    insightEyebrow: "ПЕРШИЙ ПОГЛЯД",
    insightEmpty: "Завантаж тренування, щоб побачити реальні дані Garmin.",
    aiButton: "Проаналізувати тренування",
    aiLoading: "Аналізую тренування…",
    aiEyebrow: "AI-АНАЛІЗ ТРЕНЕРА",
    aiTitle: "Що говорить твоє тренування",
    futureTitle: "Незабаром у Runory",
    futureHistory: "Історія тренувань",
    futureGarmin: "Garmin Connect",
    futureAi: "AI-аналіз тренера",
    aiScoreExcellent: "Відмінна робота",
    aiScoreStrong: "Сильне тренування",
    aiScoreImprove: "Є що покращити",
    aiScoreCautious: "Потрібен обережніший підхід",
    aiScoreEyebrow: "ОЦІНКА ТРЕНЕРА",
    aiScoreDescription: "Оцінка сформована на основі темпу, пульсу, каденсу, обсягу та динаміки сплітів.",
    aiFallbackTitle: "Аналіз",
    workoutLong: "Довга пробіжка",
    workoutIntervals: "Інтервальне тренування",
    workoutTempo: "Темповий / рівномірний біг",
    workoutFartlek: "Фартлек",
    fastSegment: "Швидкий відрізок",
    slowSegment: "Повільний відрізок",
    workoutRun: "Бігове тренування",
    insightUnavailable: "Реальні дані з Garmin завантажено. Детальний аналіз сплітів недоступний.",
    insightFaster: "Ти поступово прискорювався — друга половина тренування була швидшою.",
    insightSlower: "На початку темп був швидшим, а в другій половині відбулося поступове зниження.",
    insightEven: "Темп був відносно рівним протягом тренування — хороший контроль зусилля.",
    avgHr: "Середній пульс",
    cadence: "каденс",
    ascentShort: "набір",
    language: "Мова",
    splitsNotFound: "Спліти не знайдені",
    terrain: "Рельєф",
    flat: "Рівно",
    climb: "Набір",
    descent: "Спуск",
    work: "Робота",
    interval: "Інтервал",
    recovery: "Відновлення",
    warmup: "Розминка",
    cooldown: "Заминка",
    uploadedWorkout: "Завантажене тренування",
    today: "сьогодні",
    errorAi: "Помилка AI-аналізу",
    errorAiGeneric: "Не вдалося виконати AI-аналіз",
    errorAiUnavailable: "Не вдалося отримати аналіз",
    chooseFitError: "Обери файл із розширенням .fit",
    preparing: "Готуємо тренування…",
    readyToView: "Тренування готове до перегляду",
    readFileError: "Не вдалося прочитати файл",
    locale: "uk-UA",
    ariaHome: "Runory — головна",
    ariaNav: "Розділи Runory",
    ariaSummary: "Підсумок тренування",
    ariaFuture: "Майбутні можливості",
    ariaScore: "Оцінка {score} з 10",
     authSignIn: "Увійти",
     authEyebrow: "ТВОЄМУ RUNORY ПОТРІБЕН АККАУНТ",
     authTitle: "Увійти в Runory",
     authCopy: "Збережемо твою історію тренувань і зможемо бачити прогрес з часом.",
     authGoogle: "Продовжити з Google",
     authOr: "або",
     authEmail: "Email",
     authPassword: "Пароль",
     authSubmitSignIn: "Увійти",
     authSubmitSignUp: "Створити акаунт",
     authNoAccount: "Ще немає акаунта?",
     authHaveAccount: "Вже маєш акаунт?",
     authCreateAccount: "Створити акаунт",
     authSwitchToSignIn: "Увійти",
     authAccountEyebrow: "ТВОЄМУ RUNORY",
     authAccountTitle: "Твій акаунт",
     authLogout: "Вийти",
     authSignedUp: "Акаунт створено. Перевір email і підтвердь адресу, щоб увійти.",
     authSignedIn: "Ти успішно увійшов у Runory.",
     authSignedOut: "Ти вийшов з акаунта.",
     authError: "Не вдалося виконати вхід. Перевір дані та спробуй ще раз.",
     authGoogleError: "Не вдалося увійти через Google. Спробуй ще раз.",
     authLoggedInAs: "Увійшов як"
  },
  en: {
    navAnalysis: "Workout analysis",
    navCalculator: "Running calculator",
    heroEyebrow: "A SMARTER APPROACH TO YOUR TRAINING",
    heroTitle: "Every kilometer<br />matters.",
    heroCopy: "Runory — your training, analyzed through data.<br />Upload a Garmin workout and find out<br />what really happened during your run.",
    uploadEyebrow: "NEW WORKOUT",
    uploadTitle: "Upload a FIT file",
    uploadHelp: "FIT file from Garmin Connect<br />Processed entirely on your device",
    dropTitle: "Upload your Garmin workout",
    chooseFit: "Choose a FIT file",
    dropSubtitle: "or drag the file here",
    fileReady: "Ready for analysis",
    removeFile: "Remove file",
    summaryTitle: "WORKOUT SUMMARY",
    distance: "Distance",
    time: "Time",
    pace: "Average pace",
    heartRate: "Average heart rate",
    calories: "Calories",
    ascent: "Elevation gain",
    structureTitle: "WORKOUT STRUCTURE",
    structureNote: "Workout structure is automatically detected from Garmin data and split dynamics.",
    resultsEyebrow: "WORKOUT ANALYZED",
    resultsTitle: "Your run in numbers",
    splitsEyebrow: "KILOMETER SPLITS",
    splitsTitle: "How your run changed",
    splitKm: "Km",
    splitPace: "Pace",
    splitHr: "Heart rate",
    splitCadence: "Cadence",
    splitAscent: "Elevation",
    splitsEmpty: "Splits will appear after you upload a FIT file.",
    insightEyebrow: "FIRST LOOK",
    insightEmpty: "Upload a workout to see your real Garmin data.",
    aiButton: "Analyze workout",
    aiLoading: "Analyzing workout…",
    aiEyebrow: "AI COACH ANALYSIS",
    aiTitle: "What your workout tells us",
    futureTitle: "Coming soon to Runory",
    futureHistory: "Workout history",
    futureGarmin: "Garmin Connect",
    futureAi: "AI coach analysis",
    aiScoreExcellent: "Excellent work",
    aiScoreStrong: "Strong workout",
    aiScoreImprove: "Room to improve",
    aiScoreCautious: "A more cautious approach is needed",
    aiScoreEyebrow: "COACH SCORE",
    aiScoreDescription: "The score is based on pace, heart rate, cadence, volume, and split dynamics.",
    aiFallbackTitle: "Analysis",
    workoutLong: "Long run",
    workoutIntervals: "Interval workout",
    workoutTempo: "Tempo / steady run",
    workoutFartlek: "Fartlek",
    fastSegment: "Fast segment",
    slowSegment: "Slow segment",
    workoutRun: "Running workout",
    insightUnavailable: "Real Garmin data was loaded. Detailed split analysis is unavailable.",
    insightFaster: "You gradually accelerated — the second half of the workout was faster.",
    insightSlower: "The pace started faster, then gradually slowed in the second half.",
    insightEven: "The pace stayed relatively even throughout the workout — good effort control.",
    avgHr: "Average heart rate",
    cadence: "cadence",
    ascentShort: "elevation gain",
    language: "Language",
    splitsNotFound: "No splits found",
    terrain: "Terrain",
    flat: "Flat",
    climb: "Gain",
    descent: "Descent",
    work: "Work",
    interval: "Interval",
    recovery: "Recovery",
    warmup: "Warm-up",
    cooldown: "Cool-down",
    uploadedWorkout: "Uploaded workout",
    today: "today",
    errorAi: "AI analysis error",
    errorAiGeneric: "AI analysis could not be completed",
    errorAiUnavailable: "Could not get an analysis",
    chooseFitError: "Choose a file with the .fit extension",
    preparing: "Preparing workout…",
    readyToView: "Workout ready to view",
    readFileError: "Could not read the file",
    locale: "en-US",
    ariaHome: "Runory — home",
    ariaNav: "Runory sections",
    ariaSummary: "Workout summary",
    ariaFuture: "Future features",
    ariaScore: "Score {score} out of 10",
     authSignIn: "Sign in",
     authEyebrow: "YOUR RUNORY ACCOUNT",
     authTitle: "Sign in to Runory",
     authCopy: "We’ll save your workout history and track your progress over time.",
     authGoogle: "Continue with Google",
     authOr: "or",
     authEmail: "Email",
     authPassword: "Password",
     authSubmitSignIn: "Sign in",
     authSubmitSignUp: "Create account",
     authNoAccount: "Don’t have an account yet?",
     authHaveAccount: "Already have an account?",
     authCreateAccount: "Create account",
     authSwitchToSignIn: "Sign in",
     authAccountEyebrow: "YOUR RUNORY",
     authAccountTitle: "Your account",
     authLogout: "Sign out",
     authSignedUp: "Account created. Check your email and confirm your address before signing in.",
     authSignedIn: "You’re now signed in to Runory.",
     authSignedOut: "You’re signed out.",
     authError: "Sign-in failed. Check your details and try again.",
     authGoogleError: "Google sign-in failed. Please try again.",
     authLoggedInAs: "Signed in as"
  }
};

let currentLanguage = localStorage.getItem("runory-language") || "uk";
if (!translations[currentLanguage]) currentLanguage = "uk";

function normalizeTranslationKey(key) {
  return String(key ?? "").replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
}

function t(key, vars = {}) {
  const normalizedKey = normalizeTranslationKey(key);
  let value = translations[currentLanguage]?.[normalizedKey] ?? translations.uk[normalizedKey] ?? key;
  Object.entries(vars).forEach(([name, replacement]) => {
    value = value.replaceAll(`{${name}}`, String(replacement));
  });
  return value;
}

function applyLanguage() {
  document.documentElement.lang = currentLanguage;

  document.querySelectorAll("[data-i18n]").forEach(element => {
    element.innerHTML = t(element.dataset.i18n);
  });

  document.querySelectorAll("[data-i18n-aria]").forEach(element => {
    element.setAttribute("aria-label", t(element.dataset.i18nAria));
  });

  const title = currentLanguage === "uk"
    ? "Runory — аналіз тренувань"
    : "Runory — workout analysis";
  document.title = title;

  const home = document.querySelector(".brand");
  const nav = document.querySelector(".app-nav");
  const summary = document.querySelector(".results-sidebar");
  const future = document.querySelector(".future-strip");
  const languageSwitcher = document.querySelector(".language-switcher");
  if (home) home.setAttribute("aria-label", t("ariaHome"));
  if (nav) nav.setAttribute("aria-label", t("ariaNav"));
  if (summary) summary.setAttribute("aria-label", t("ariaSummary"));
  if (future) future.setAttribute("aria-label", t("ariaFuture"));
  if (languageSwitcher) languageSwitcher.setAttribute("aria-label", t("language"));

  document.querySelectorAll(".language-button").forEach(button => {
    const active = button.dataset.lang === currentLanguage;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  });

  if (currentWorkout) renderSummary(currentWorkout);
  else if (splitsBody) {
    splitsBody.innerHTML = `<tr><td colspan="5" class="splits-empty">${escapeHtml(t("splitsEmpty"))}</td></tr>`;
  }
}

function setLanguage(language) {
  if (!translations[language] || language === currentLanguage) return;
  currentLanguage = language;
  localStorage.setItem("runory-language", currentLanguage);
  applyLanguage();
}



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
    return [{ number: 0, title: t("aiFallbackTitle"), body: normalized }];
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
  const match = source.match(/(?:оцінка|оценка|score)\s*[—:-]?\s*(\d+(?:[.,]\d+)?)\s*\/\s*10/i)
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
      ? t("aiScoreExcellent")
      : score >= 7
        ? t("aiScoreStrong")
        : score >= 5
          ? t("aiScoreImprove")
          : t("aiScoreCautious");

    parts.push(`
      <div class="ai-score-card">
        <div class="ai-score-ring" style="--score:${score * 36}deg" aria-label="${t("ariaScore", { score })}">
          <strong>${String(score).replace(".", ",")}</strong><span>/10</span>
        </div>
        <div class="ai-score-copy">
          <p class="eyebrow">${t("aiScoreEyebrow")}</p>
          <h4>${escapeHtml(scoreLabel)}</h4>
          <p>${t("aiScoreDescription")}</p>
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

function getWorkoutPattern(summary) {
  const distance = Number(summary?.distance);
  const splits = Array.isArray(summary?.splits) ? summary.splits : [];
  const paces = splits
    .map(s => paceToSeconds(s.pace))
    .filter(Number.isFinite);

  const hasIntervals = Array.isArray(summary?.structure)
    && summary.structure.some(block =>
      block?.type === "intervals"
      && Array.isArray(block.repetitions)
      && block.repetitions.length > 0
    );

  // Explicit Garmin interval structure always wins over inferred patterns.
  if (hasIntervals) return { type: "intervals" };
  if (paces.length < 4) {
    return distance >= 15 ? { type: "long" } : { type: "run" };
  }

  const sorted = [...paces].sort((a, b) => a - b);
  const median = sorted.length % 2
    ? sorted[Math.floor(sorted.length / 2)]
    : (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2;

  // Fartlek = repeated fast/slow alternation, without a Garmin-defined interval structure.
  const contrastThreshold = Math.max(20, median * 0.055);
  const states = paces.map(p => {
    if (p <= median - contrastThreshold) return "fast";
    if (p >= median + contrastThreshold) return "slow";
    return "neutral";
  });

  let previous = null;
  let transitions = 0;
  let fastCount = 0;
  let slowCount = 0;

  for (const state of states) {
    if (state === "neutral") continue;
    if (state === "fast") fastCount++;
    if (state === "slow") slowCount++;
    if (previous && state !== previous) transitions++;
    previous = state;
  }

  if (transitions >= 5 && fastCount >= 3 && slowCount >= 3) {
    return { type: "fartlek", states };
  }

  // Tempo = a sustained faster block between a slower warm-up and cool-down.
  // Use the outer splits as the baseline so a long tempo block does not distort the median.
  const edgeCount = Math.max(1, Math.min(2, Math.floor(paces.length / 4)));
  const edgePaces = [
    ...paces.slice(0, edgeCount),
    ...paces.slice(-edgeCount)
  ];
  const edgeBaseline = edgePaces.reduce((a, b) => a + b, 0) / edgePaces.length;
  const fastThreshold = edgeBaseline * 0.94;
  const fastFlags = paces.map(p => p <= fastThreshold);

  let bestStart = -1;
  let bestEnd = -1;
  let i = 0;
  while (i < fastFlags.length) {
    if (!fastFlags[i]) { i++; continue; }
    const startIndex = i;
    while (i + 1 < fastFlags.length && fastFlags[i + 1]) i++;
    const endIndex = i;
    if (endIndex - startIndex + 1 > bestEnd - bestStart + 1) {
      bestStart = startIndex;
      bestEnd = endIndex;
    }
    i++;
  }

  if (bestStart >= 0) {
    const blockLength = bestEnd - bestStart + 1;
    const blockPaces = paces.slice(bestStart, bestEnd + 1);
    const blockAverage = blockPaces.reduce((a, b) => a + b, 0) / blockPaces.length;
    const blockVariation = blockPaces.reduce(
      (sum, pace) => sum + Math.abs(pace - blockAverage) / blockAverage,
      0
    ) / blockPaces.length;
    const share = blockLength / paces.length;
    const hasWarmup = bestStart > 0;
    const hasCooldown = bestEnd < paces.length - 1;

    if (
      blockLength >= 3
      && share >= 0.30
      && hasWarmup
      && hasCooldown
      && blockVariation <= 0.055
    ) {
      return {
        type: "tempo",
        tempoStart: bestStart,
        tempoEnd: bestEnd
      };
    }
  }

  if (distance >= 15) return { type: "long" };
  return { type: "run" };
}

function detectWorkoutType(summary) {
  const pattern = getWorkoutPattern(summary);
  if (pattern.type === "intervals") return t("workoutIntervals");
  if (pattern.type === "fartlek") return t("workoutFartlek");
  if (pattern.type === "tempo") return t("workoutTempo");
  if (pattern.type === "long") return t("workoutLong");
  return t("workoutRun");
}

function generateWorkoutInsight(summary) {
  const splits = summary.splits || [];
  const paces = splits.map(s => paceToSeconds(s.pace)).filter(Number.isFinite);

  if (!paces.length) {
    return t("insightUnavailable");
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
    text = t("insightFaster");
  } else if (firstAvg - secondAvg < -8) {
    text = t("insightSlower");
  } else {
    text = t("insightEven");
  }

  const details = [];

  if (summary.heartRate != null) {
    details.push(`${t("avgHr")} ${summary.heartRate} ${currentLanguage === "uk" ? "уд/хв" : "bpm"}`);
  }

  if (summary.cadence != null) {
    details.push(`${t("cadence")} ${summary.cadence} ${currentLanguage === "uk" ? "кроків/хв" : "steps/min"}`);
  }

  if (summary.ascent != null) {
    details.push(`${t("ascentShort")} ${summary.ascent} m`);
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
          ${escapeHtml(t("splitsNotFound"))}
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
      <td class="split-elevation ${Number(split.elevation) < 0 ? "is-down" : ""}">${split.elevation != null ? `${split.elevation > 0 ? '+' : ''}${split.elevation} ${currentLanguage === "uk" ? "м" : "m"}` : "—"}</td>
    `;

    splitsBody.appendChild(row);
  }
}

function formatElevation(value) {
  if (!Number.isFinite(Number(value))) return "—";
  const n = Math.round(Number(value));
  if (n === 0) return `0 ${currentLanguage === "uk" ? "м" : "m"}`;
  return `${n > 0 ? '+' : ''}${n} м`;
}

function formatTerrain(value) {
  if (!Number.isFinite(Number(value))) return `${t("terrain")} —`;
  const n = Math.round(Number(value));
  if (n === 0) return `${t("flat")} 0 ${currentLanguage === "uk" ? "м" : "m"}`;
  return n > 0 ? `${t("climb")} +${n} ${currentLanguage === "uk" ? "м" : "m"}` : `${t("descent")} −${Math.abs(n)} ${currentLanguage === "uk" ? "м" : "m"}`;
}

function renderStructure(structure = [], summary = null) {
  if (!structureCard || !structureBody) return;
  structureBody.innerHTML = "";

  let displayStructure = Array.isArray(structure) ? structure : [];
  const explicitIntervals = displayStructure.some(block =>
    block?.type === "intervals"
    && Array.isArray(block.repetitions)
    && block.repetitions.length > 0
  );

  // Garmin does not provide explicit blocks for tempo/fartlek in every FIT file,
  // so build a visual structure from split dynamics when no explicit intervals exist.
  if (!explicitIntervals && summary) {
    const pattern = getWorkoutPattern(summary);
    const splits = Array.isArray(summary.splits) ? summary.splits : [];

    const splitStats = (split, index) => {
      const pace = paceToSeconds(split?.pace);
      const distance = 1000;
      return {
        distance,
        duration: Number.isFinite(pace) ? pace : null,
        pace: split?.pace || "—",
        heartRate: split?.heartRate ?? null,
        cadence: split?.cadence ?? null,
        ascent: Number.isFinite(Number(split?.ascent)) ? Number(split.ascent) : 0,
        descent: Number.isFinite(Number(split?.descent)) ? Number(split.descent) : 0,
        elevation: Number.isFinite(Number(split?.elevation))
          ? Number(split.elevation)
          : (Number.isFinite(Number(split?.ascent)) ? Number(split.ascent) : 0)
            - (Number.isFinite(Number(split?.descent)) ? Number(split.descent) : 0),
        index
      };
    };

    if (pattern.type === "tempo") {
      const start = pattern.tempoStart;
      const end = pattern.tempoEnd;
      const warmup = splits.slice(0, start).map(splitStats);
      const tempo = splits.slice(start, end + 1).map(splitStats);
      const cooldown = splits.slice(end + 1).map(splitStats);
      displayStructure = [];
      if (warmup.length) displayStructure.push({ type: "warmup", label: t("warmup"), items: warmup });
      if (tempo.length) displayStructure.push({ type: "tempo", label: t("workoutTempo"), items: tempo });
      if (cooldown.length) displayStructure.push({ type: "cooldown", label: t("cooldown"), items: cooldown });
    } else if (pattern.type === "fartlek") {
      displayStructure = [{
        type: "fartlek",
        label: t("workoutFartlek"),
        items: splits.map((split, index) => ({
          ...splitStats(split, index),
          state: pattern.states[index]
        }))
      }];
    }
  }

  if (!displayStructure.length || (displayStructure.length === 1 && displayStructure[0].type === "easy")) {
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
      ? `${(value / 1000).toFixed(2).replace(".", currentLanguage === "uk" ? "," : ".")} ${currentLanguage === "uk" ? "км" : "km"}`
      : `${Math.round(value)} ${currentLanguage === "uk" ? "м" : "m"}`;
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
      parts.push(`${stats.pace} /${currentLanguage === "uk" ? "км" : "km"}`);
    }

    if (Number.isFinite(Number(stats.heartRate))) {
      parts.push(`${Math.round(Number(stats.heartRate))} ${currentLanguage === "uk" ? "уд/хв" : "bpm"}`);
    }

    if (Number.isFinite(Number(stats.cadence))) {
      parts.push(`${Math.round(Number(stats.cadence))} ${currentLanguage === "uk" ? "к/хв" : "spm"}`);
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
      elevation: ascent - descent
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

  for (const block of displayStructure) {
    if (block.type === "tempo") {
      const items = block.items || [];
      addTimelineItem(
        "work",
        t("workoutTempo"),
        formatStats(averageStats(items))
      );
      continue;
    }

    if (block.type === "fartlek") {
      const items = block.items || [];
      addTimelineItem(
        "work",
        t("workoutFartlek"),
        `${items.length} ${currentLanguage === "uk" ? "сплітів" : "splits"}`
      );
      items.forEach((item, index) => {
        const isFast = item.state === "fast";
        const isSlow = item.state === "slow";
        const label = isFast
          ? `${t("fastSegment")} ${index + 1}`
          : isSlow
            ? `${t("slowSegment")} ${index + 1}`
            : `${t("workoutFartlek")} ${index + 1}`;
        addTimelineItem(
          isSlow ? "recovery" : "work",
          label,
          formatStats(item),
          "timeline-detail"
        );
      });
      continue;
    }

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
        `${t("work")} · ${block.workCount || reps.length} × ${Math.round(workDistance)} ${currentLanguage === "uk" ? "м" : "m"}`,
        `${formatDistance(work.distance)} · ${formatDuration(work.duration)} · ${work.pace} /${currentLanguage === "uk" ? "км" : "km"} · ${formatTerrain(work.elevation)}`
      );

      // Главное: показываем КАЖДЫЙ интервал и КАЖДОЕ восстановление отдельно.
      reps.forEach((rep, index) => {
        const number = rep.number || index + 1;

        if (rep.work) {
          addTimelineItem(
            "work",
            `${t("interval")} ${number}`,
            formatStats(rep.work),
            "timeline-detail"
          );
        }

        if (rep.recovery) {
          addTimelineItem(
            "recovery",
            `${t("recovery")} ${number}`,
            formatStats(rep.recovery),
            "timeline-detail"
          );
        }
      });

      // Невеликий підсумок відновлень — тільки якщо вони реально є.
      if (recoveryItems.length) {
        addTimelineItem(
          "recovery",
          `${t("recovery")} · ${recoveryItems.length} × ${Math.round(recoveryDistance)} ${currentLanguage === "uk" ? "м" : "m"}`,
          `${formatDistance(recovery.distance)} · ${formatDuration(recovery.duration)} · ${recovery.pace} /${currentLanguage === "uk" ? "км" : "km"} · ${formatTerrain(recovery.elevation)}`,
          "timeline-summary"
        );
      }

      continue;
    }

    const label =
      block.type === "warmup"
        ? t("warmup")
        : block.type === "cooldown"
          ? t("cooldown")
          : block.label;

    const type =
      block.type === "warmup"
        ? "warmup"
        : block.type === "cooldown"
          ? "cooldown"
          : "work";

    // Для автоматически определённых warmup/cooldown статистика хранится
    // внутри items, поэтому агрегируем её так же, как и tempo-блок.
    const blockStats = Array.isArray(block.items)
      ? averageStats(block.items)
      : block;

    addTimelineItem(
      type,
      label,
      formatStats(blockStats)
    );
  }
}

function renderSummary(summary) {
  if (distanceValue) distanceValue.textContent = summary.distance != null ? `${String(summary.distance).replace(".", currentLanguage === "uk" ? "," : ".")} ${currentLanguage === "uk" ? "км" : "km"}` : "—";
  if (durationValue) durationValue.textContent = summary.duration ?? "—";
  if (paceValue) paceValue.textContent = summary.pace != null ? `${summary.pace} /${currentLanguage === "uk" ? "км" : "km"}` : "—";
  if (heartRateValue) heartRateValue.textContent = summary.heartRate != null ? `${summary.heartRate} ${currentLanguage === "uk" ? "уд/хв" : "bpm"}` : "—";
  if (caloriesValue) {
    const calories = summary.calories ?? summary.totalCalories ?? null;
    const caloriesMetric = caloriesValue.closest(".summary-metric");

    if (calories != null && Number.isFinite(Number(calories))) {
      caloriesValue.textContent = `${Math.round(Number(calories)).toLocaleString(translations[currentLanguage].locale)} ${currentLanguage === "uk" ? "ккал" : "kcal"}`;
      if (caloriesMetric) caloriesMetric.hidden = false;
    } else {
      // Якщо Garmin не передав калорії — не показуємо порожній показник.
      if (caloriesMetric) caloriesMetric.hidden = true;
    }
  }
  if (ascentValue) {
    ascentValue.textContent = summary.ascent != null ? `${Math.round(summary.ascent)} ${currentLanguage === "uk" ? "м" : "m"}` : "—";
  }

  const date = summary.date instanceof Date && !Number.isNaN(summary.date.getTime())
    ? summary.date.toLocaleDateString(translations[currentLanguage].locale, {
        day: "numeric",
        month: "long",
        year: "numeric"
      })
    : t("uploadedWorkout");

  runLabel.textContent =
    `${detectWorkoutType(summary)} · ${date}`;

  insightText.textContent =
    generateWorkoutInsight(summary);

  renderSplits(summary.splits);
  renderStructure(summary.structure, summary);

  if (aiAnalysis) aiAnalysis.hidden = true;
  if (aiAnalysisText) aiAnalysisText.innerHTML = "";
}

async function analyzeWithAI() {
  if (!currentWorkout || !aiAnalyzeButton) return;

  aiAnalyzeButton.disabled = true;
  aiAnalyzeButton.classList.add("is-loading");
  aiAnalyzeButton.innerHTML =
    `<span class="ai-button-icon">✦</span><span>${escapeHtml(t("aiLoading"))}</span>`;

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
      body: JSON.stringify({ ...currentWorkout, language: currentLanguage })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || t("errorAi"));
    }

    if (aiAnalysisText) {
      aiAnalysisText.innerHTML =
        renderAiAnalysis(data.analysis || t("errorAiUnavailable"));
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
        `<p class="ai-error">${escapeHtml(error.message || t("errorAiGeneric"))}</p>`;
    }
    if (aiAnalysis) aiAnalysis.classList.remove("is-loading");
  } finally {
    aiAnalyzeButton.disabled = false;
    aiAnalyzeButton.classList.remove("is-loading");
    aiAnalyzeButton.innerHTML =
      `<span class="ai-button-icon">✦</span><span>${escapeHtml(t("aiButton"))}</span>`;
  }
}

aiAnalyzeButton?.addEventListener("click", analyzeWithAI);

async function selectFile(file) {
  if (!file) return;

  if (!file.name.toLowerCase().endsWith(".fit")) {
    uploadState.hidden = false;
    uploadState.classList.add("has-error");
    fileStatus.textContent = t("chooseFitError");
    return;
  }

  uploadState.hidden = false;
  uploadState.classList.remove("has-error");
  results.hidden = true;

  fileName.textContent = file.name;
  fileStatus.textContent = t("preparing");
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
    fileStatus.textContent = t("readyToView");

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
      error.message || t("readFileError");
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


document.querySelectorAll(".language-button").forEach(button => {
  button.addEventListener("click", () => setLanguage(button.dataset.lang));
});

applyLanguage();


// === Runory authentication (Supabase) ===
const SUPABASE_URL = "https://vabzqqptpzcoguvuujaz.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_Jm_w-bNZJ8bnrGIbkzc5yw_IGZjneHN";
const supabaseClient = window.supabase?.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: "pkce"
  }
});

const authButton = document.querySelector("#authButton");
const authButtonText = document.querySelector("#authButtonText");
const authModal = document.querySelector("#authModal");
const authModalBackdrop = document.querySelector("#authModalBackdrop");
const authClose = document.querySelector("#authClose");
const authFormView = document.querySelector("#authFormView");
const authAccountView = document.querySelector("#authAccountView");
const authAccountEmail = document.querySelector("#authAccountEmail");
const authMessage = document.querySelector("#authMessage");
const googleSignInButton = document.querySelector("#googleSignInButton");
const emailAuthForm = document.querySelector("#emailAuthForm");
const emailAuthSubmitText = document.querySelector("#emailAuthSubmitText");
const authSwitchQuestion = document.querySelector("#authSwitchQuestion");
const authSwitchButton = document.querySelector("#authSwitchButton");
const authLogoutButton = document.querySelector("#authLogoutButton");

let authMode = "signin";
let currentSession = null;

function setAuthMessage(message = "", type = "") {
  if (!authMessage) return;
  authMessage.textContent = message;
  authMessage.className = `auth-message${type ? ` is-${type}` : ""}`;
}

function setAuthMode(mode) {
  authMode = mode === "signup" ? "signup" : "signin";
  if (emailAuthSubmitText) emailAuthSubmitText.textContent = t(authMode === "signup" ? "authSubmitSignUp" : "authSubmitSignIn");
  if (authSwitchQuestion) authSwitchQuestion.textContent = t(authMode === "signup" ? "authHaveAccount" : "authNoAccount");
  if (authSwitchButton) authSwitchButton.textContent = t(authMode === "signup" ? "authSwitchToSignIn" : "authCreateAccount");
  if (emailAuthForm) {
    const password = document.querySelector("#authPassword");
    if (password) password.autocomplete = authMode === "signup" ? "new-password" : "current-password";
  }
  setAuthMessage("");
}

function updateAuthUI(session) {
  currentSession = session || null;
  const user = currentSession?.user;
  const signedIn = Boolean(user);

  if (authButton) authButton.classList.toggle("is-signed-in", signedIn);
  if (authButtonText) {
    authButtonText.textContent = signedIn
      ? (user.email || user.phone || t("authSignIn"))
      : t("authSignIn");
  }

  if (authAccountEmail) {
    authAccountEmail.textContent = signedIn
      ? `${t("authLoggedInAs")}: ${user.email || user.phone || "—"}`
      : "";
  }

  if (authFormView) authFormView.hidden = signedIn;
  if (authAccountView) authAccountView.hidden = !signedIn;
}

function openAuthModal() {
  if (!authModal) return;
  authModal.hidden = false;
  document.body.classList.add("auth-modal-open");
  setAuthMode("signin");
  updateAuthUI(currentSession);
  window.setTimeout(() => {
    const target = currentSession ? authLogoutButton : document.querySelector("#authEmail");
    target?.focus();
  }, 0);
}

function closeAuthModal() {
  if (!authModal) return;
  authModal.hidden = true;
  document.body.classList.remove("auth-modal-open");
  setAuthMessage("");
}

async function signInWithGoogle() {
  if (!supabaseClient) {
    setAuthMessage(t("authGoogleError"), "error");
    return;
  }

  googleSignInButton?.setAttribute("disabled", "disabled");
  setAuthMessage("");

  const { error } = await supabaseClient.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/auth/callback.html`
    }
  });

  if (error) {
    setAuthMessage(error.message || t("authGoogleError"), "error");
    googleSignInButton?.removeAttribute("disabled");
  }
}

async function submitEmailAuth(event) {
  event.preventDefault();
  if (!supabaseClient) {
    setAuthMessage(t("authError"), "error");
    return;
  }

  const email = document.querySelector("#authEmail")?.value.trim();
  const password = document.querySelector("#authPassword")?.value || "";
  const submit = document.querySelector("#emailAuthSubmit");

  if (!email || !password) return;

  submit?.setAttribute("disabled", "disabled");
  setAuthMessage("");

  try {
    if (authMode === "signup") {
      const { data, error } = await supabaseClient.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: window.location.origin }
      });
      if (error) throw error;

      if (data.session) {
        updateAuthUI(data.session);
        setAuthMessage(t("authSignedIn"), "success");
      } else {
        setAuthMessage(t("authSignedUp"), "success");
      }
    } else {
      const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
      if (error) throw error;
      updateAuthUI(data.session);
      setAuthMessage(t("authSignedIn"), "success");
      window.setTimeout(closeAuthModal, 500);
    }
  } catch (error) {
    setAuthMessage(error.message || t("authError"), "error");
  } finally {
    submit?.removeAttribute("disabled");
  }
}

async function signOut() {
  if (!supabaseClient) return;
  const { error } = await supabaseClient.auth.signOut();
  if (error) {
    setAuthMessage(error.message || t("authError"), "error");
    return;
  }
  updateAuthUI(null);
  setAuthMessage(t("authSignedOut"), "success");
  window.setTimeout(closeAuthModal, 350);
}

async function initAuth() {
  if (!supabaseClient) {
    console.warn("Runory: Supabase client could not be initialized.");
    return;
  }

  const { data, error } = await supabaseClient.auth.getSession();
  if (error) {
    console.warn("Runory: could not restore auth session.", error);
  }
  updateAuthUI(data?.session || null);

  supabaseClient.auth.onAuthStateChange((event, session) => {
    window.setTimeout(() => updateAuthUI(session), 0);
  });
}

authButton?.addEventListener("click", openAuthModal);
authClose?.addEventListener("click", closeAuthModal);
authModalBackdrop?.addEventListener("click", closeAuthModal);
googleSignInButton?.addEventListener("click", signInWithGoogle);
emailAuthForm?.addEventListener("submit", submitEmailAuth);
authSwitchButton?.addEventListener("click", () => setAuthMode(authMode === "signin" ? "signup" : "signin"));
authLogoutButton?.addEventListener("click", signOut);

document.querySelectorAll(".language-button").forEach(button => {
  button.addEventListener("click", () => {
    window.setTimeout(() => {
      setAuthMode(authMode);
      updateAuthUI(currentSession);
    }, 0);
  });
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape" && authModal && !authModal.hidden) closeAuthModal();
});

initAuth();
