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
const workoutSavePanel = document.querySelector("#workoutSavePanel");
const saveWorkoutButton = document.querySelector("#saveWorkoutButton");
const cancelWorkoutButton = document.querySelector("#cancelWorkoutButton");
const workoutSaveStatus = document.querySelector("#workoutSaveStatus");

let currentWorkout = null;
let currentHistoryId = null;
let historyLoaded = false;
let historyWorkouts = [];
let historyTypeFilter = "all";
let historyPeriodFilter = "all";

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
    saveWorkoutEyebrow: "ЗБЕРЕЖЕННЯ",
    saveWorkoutQuestion: "Зберегти це тренування?",
    saveWorkout: "Зберегти тренування",
    cancelWorkout: "Скасувати",
    savingWorkout: "Зберігаємо…",
    workoutSaved: "✓ Тренування збережено",
    historySaveError: "Не вдалося зберегти тренування",
    aiLoading: "Аналізую тренування…",
    aiEyebrow: "AI-АНАЛІЗ ТРЕНЕРА",
    aiTitle: "Що говорить твоє тренування",
    futureTitle: "Незабаром у Runory",
    historyNav: "Мої тренування",
    historyTitle: "Мої тренування",
    historyCopy: "Усі тренування, які ти зберіг у Runory.",
    historyEmpty: "Тут поки немає збережених тренувань.",
    historyLoading: "Завантажуємо тренування…",
    historyView: "Відкрити",
    historyDelete: "Видалити",
    historyLoginHint: "Увійди в Runory, щоб бачити свої тренування.",
    historyError: "Не вдалося завантажити тренування.",
    historySaveError: "Не вдалося зберегти тренування.",
    historyDeleteError: "Не вдалося видалити тренування.",
    historyDeleted: "Тренування видалено." ,
    futureHistory: "Історія тренувань",
    historyStatsWorkouts: "Тренування",
    historyStatsDistance: "Дистанція",
    historyStatsTime: "Час",
    historyOpen: "Відкрити аналіз",
    historyDelete: "Видалити",
    historyEmptyAction: "Додати тренування",
    historyFilterAll: "Усі",
    historyFilterEasy: "Легкі",
    historyFilterTempo: "Темпові",
    historyFilterIntervals: "Інтервали",
    historyFilterLong: "Довгі",
    historyPeriod7: "7 днів",
    historyPeriod30: "30 днів",
    historyPeriodAll: "Увесь час",
    historyOverview: "Огляд",
    historyWeeklyDistance: "Кілометраж по тижнях",
    historyDynamics: "Динаміка",
    historyAvgPace: "Середній темп",
    historyAvgHr: "Середній пульс",
    historyNoData: "Недостатньо даних для графіка",
    historyWeek: "Тиждень",
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
     authProfile: "Мій профіль",
    authAccount: "Акаунт",
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
     authAccountTitle: "Мій акаунт",
     authAccountCopy: "Тут керування входом в акаунт. Профіль спортсмена відкривається окремо в меню зліва.",
     authLogout: "Вийти",
     authSignedUp: "Акаунт створено. Перевір email і підтвердь адресу, щоб увійти.",
     authSignedIn: "Ти успішно увійшов у Runory.",
     authSignedOut: "Ти вийшов з акаунта.",
     authError: "Не вдалося виконати вхід. Перевір дані та спробуй ще раз.",
     authGoogleError: "Не вдалося увійти через Google. Спробуй ще раз.",
     authLoggedInAs: "Увійшов як",
     profilePageEyebrow: "ПРОФІЛЬ СПОРТСМЕНА",
    profilePageTitle: "Мій профіль",
    profilePageCopy: "Дані, які допомагають Runory точніше аналізувати твої тренування та прогрес.",
    profileEyebrow: "ДАНІ СПОРТСМЕНА",
     profileCopy: "Ці дані допоможуть Runory точніше аналізувати твій прогрес.",
     profileBirthDate: "Дата народження",
     profileGender: "Стать",
     profileGenderChoose: "Обрати",
     profileGenderMale: "Чоловік",
     profileGenderFemale: "Жінка",
     profileHeight: "Зріст, см",
     profileWeight: "Вага, кг",
     profileSave: "Зберегти дані",
     profileSaving: "Зберігаємо…",
     profileSaved: "Дані спортсмена збережено.",
     profileLoadError: "Не вдалося завантажити дані профілю.",
     profileSaveError: "Не вдалося зберегти дані профілю."
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
    saveWorkoutEyebrow: "SAVE WORKOUT",
    saveWorkoutQuestion: "Save this workout?",
    saveWorkout: "Save workout",
    cancelWorkout: "Cancel",
    savingWorkout: "Saving…",
    workoutSaved: "✓ Workout saved",
    historySaveError: "Could not save workout",
    aiLoading: "Analyzing workout…",
    aiEyebrow: "AI COACH ANALYSIS",
    aiTitle: "What your workout tells us",
    futureTitle: "Coming soon to Runory",
    historyNav: "My workouts",
    historyTitle: "My workouts",
    historyCopy: "All workouts you have saved in Runory.",
    historyEmpty: "There are no saved workouts yet.",
    historyLoading: "Loading workouts…",
    historyView: "Open",
    historyDelete: "Delete",
    historyLoginHint: "Sign in to Runory to see your workouts.",
    historyError: "Could not load workouts.",
    historySaveError: "Could not save workout.",
    historyDeleteError: "Could not delete workout.",
    historyDeleted: "Workout deleted.",
    futureHistory: "Workout history",
    historyStatsWorkouts: "Workouts",
    historyStatsDistance: "Distance",
    historyStatsTime: "Time",
    historyOpen: "Open analysis",
    historyDelete: "Delete",
    historyEmptyAction: "Add a workout",
    historyFilterAll: "All",
    historyFilterEasy: "Easy",
    historyFilterTempo: "Tempo",
    historyFilterIntervals: "Intervals",
    historyFilterLong: "Long",
    historyPeriod7: "7 days",
    historyPeriod30: "30 days",
    historyPeriodAll: "All time",
    historyOverview: "Overview",
    historyWeeklyDistance: "Weekly mileage",
    historyDynamics: "Dynamics",
    historyAvgPace: "Average pace",
    historyAvgHr: "Average heart rate",
    historyNoData: "Not enough data for a chart",
    historyWeek: "Week",
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
     authProfile: "My profile",
    authAccount: "Account",
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
     authAccountEyebrow: "ATHLETE PROFILE",
     authAccountTitle: "My account",
     authAccountCopy: "Account access is managed here. Your athlete profile is available separately in the left menu.",
     authLogout: "Sign out",
     authSignedUp: "Account created. Check your email and confirm your address before signing in.",
     authSignedIn: "You’re now signed in to Runory.",
     authSignedOut: "You’re signed out.",
     authError: "Sign-in failed. Check your details and try again.",
     authGoogleError: "Google sign-in failed. Please try again.",
     authLoggedInAs: "Signed in as",
     profilePageEyebrow: "ATHLETE PROFILE",
    profilePageTitle: "My profile",
    profilePageCopy: "Details that help Runory analyze your training and progress more accurately.",
    profileEyebrow: "ATHLETE DATA",
     profileCopy: "These details help Runory analyze your progress more accurately.",
     profileBirthDate: "Date of birth",
     profileGender: "Gender",
     profileGenderChoose: "Choose",
     profileGenderMale: "Male",
     profileGenderFemale: "Female",
     profileHeight: "Height, cm",
     profileWeight: "Weight, kg",
     profileSave: "Save athlete data",
     profileSaving: "Saving…",
     profileSaved: "Athlete data saved.",
     profileLoadError: "Could not load profile data.",
     profileSaveError: "Could not save profile data."
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
  if (document.querySelector("#history")?.classList.contains("is-active")) {
    historyLoaded = false;
    loadWorkoutHistory(true);
  }
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


function setActiveView(viewName) {
  document.querySelectorAll("[data-view-panel]").forEach(panel => {
    panel.classList.toggle("is-active", panel.id === viewName);
  });

  document.querySelectorAll("[data-view-target]").forEach(button => {
    const active = button.dataset.viewTarget === viewName;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-current", active ? "page" : "false");
  });

  if (viewName === "history") {
    loadWorkoutHistory();
  }

  if (viewName === "profile") {
    if (currentSession?.user) {
      ensureUserProfile(currentSession.user);
    } else {
      openAuthModal();
      return;
    }
  }
}

document.querySelectorAll("[data-view-target]").forEach(button => {
  button.addEventListener("click", () => setActiveView(button.dataset.viewTarget));
});

const sidebarProfileButton = document.querySelector("#sidebarProfileButton");
const accountSidebar = document.querySelector("#accountSidebar");
const accountSidebarToggle = document.querySelector("#accountSidebarToggle");
const sidebarMobileToggle = document.querySelector("#sidebarMobileToggle");
const sidebarMobileBackdrop = document.querySelector("#sidebarMobileBackdrop");

function openProfileView() {
  if (!currentSession?.user) {
    openAuthModal();
    return;
  }
  setActiveView("profile");
}

sidebarProfileButton?.addEventListener("click", openProfileView);

const savedSidebarState = localStorage.getItem("runory-sidebar-collapsed") === "1";
if (savedSidebarState) accountSidebar?.classList.add("is-collapsed");

function updateSidebarToggle() {
  const collapsed = accountSidebar?.classList.contains("is-collapsed");
  if (accountSidebarToggle) {
    accountSidebarToggle.setAttribute("aria-expanded", String(!collapsed));
    accountSidebarToggle.setAttribute("aria-label", collapsed ? "Розгорнути меню" : "Згорнути меню");
    accountSidebarToggle.innerHTML = `<span aria-hidden="true">${collapsed ? "›" : "‹"}</span>`;
  }
}

accountSidebarToggle?.addEventListener("click", () => {
  accountSidebar?.classList.toggle("is-collapsed");
  localStorage.setItem("runory-sidebar-collapsed", accountSidebar?.classList.contains("is-collapsed") ? "1" : "0");
  updateSidebarToggle();
});
updateSidebarToggle();

function setMobileSidebar(open) {
  accountSidebar?.classList.toggle("is-open", open);
  sidebarMobileBackdrop?.classList.toggle("is-visible", open);
  sidebarMobileToggle?.setAttribute("aria-expanded", String(open));
  sidebarMobileToggle?.setAttribute("aria-label", open ? "Закрити меню" : "Відкрити меню");
}

sidebarMobileToggle?.addEventListener("click", () => {
  setMobileSidebar(!accountSidebar?.classList.contains("is-open"));
});
sidebarMobileBackdrop?.addEventListener("click", () => setMobileSidebar(false));
document.querySelectorAll(".account-sidebar-link").forEach(link => {
  link.addEventListener("click", () => setMobileSidebar(false));
});


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

function formatInsightPace(seconds) {
  if (!Number.isFinite(seconds) || seconds <= 0) return "—";
  const total = Math.round(seconds);
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
}

function statsPaceSeconds(stats) {
  const distance = Number(stats?.distance);
  const duration = Number(stats?.duration);
  if (!Number.isFinite(distance) || distance <= 0 || !Number.isFinite(duration) || duration <= 0) return null;
  return duration / (distance / 1000);
}

function getIntervalAnalysis(summary) {
  const structure = Array.isArray(summary?.structure) ? summary.structure : [];
  const block = structure.find(item =>
    item?.type === "intervals" && Array.isArray(item.repetitions) && item.repetitions.length > 0
  );

  if (!block) return null;

  const reps = block.repetitions.filter(rep => rep?.work);
  if (!reps.length) return null;

  const works = reps.map(rep => rep.work).filter(Boolean);
  const recoveries = reps.map(rep => rep.recovery).filter(Boolean);
  const workPaces = works.map(statsPaceSeconds).filter(Number.isFinite);
  const workHr = works.map(item => Number(item.heartRate)).filter(Number.isFinite);
  const recoveryPaces = recoveries.map(statsPaceSeconds).filter(Number.isFinite);
  const recoveryDurations = recoveries.map(item => Number(item.duration)).filter(Number.isFinite);

  if (!workPaces.length) return null;

  const average = workPaces.reduce((a, b) => a + b, 0) / workPaces.length;
  const spread = Math.max(...workPaces) - Math.min(...workPaces);
  const firstCount = Math.max(1, Math.ceil(workPaces.length / 2));
  const firstAvg = workPaces.slice(0, firstCount).reduce((a, b) => a + b, 0) / firstCount;
  const last = workPaces.slice(-firstCount);
  const lastAvg = last.reduce((a, b) => a + b, 0) / last.length;
  const delta = firstAvg - lastAvg;

  let dynamics = "even";
  if (delta > 3) dynamics = "faster";
  else if (delta < -3) dynamics = "slower";

  let hrTrend = "stable";
  if (workHr.length >= 2) {
    const hrDelta = workHr[workHr.length - 1] - workHr[0];
    if (hrDelta >= 5) hrTrend = "rising";
    else if (hrDelta <= -5) hrTrend = "falling";
  }

  let recoveryTrend = "stable";
  if (recoveryPaces.length >= 2) {
    const recoverySpread = Math.max(...recoveryPaces) - Math.min(...recoveryPaces);
    if (recoverySpread > 20) recoveryTrend = "variable";
  }
  if (recoveryDurations.length >= 2) {
    const recoveryDurationSpread = Math.max(...recoveryDurations) - Math.min(...recoveryDurations);
    if (recoveryDurationSpread > 10) recoveryTrend = "variable";
  }

  const totalWorkDistance = works.reduce((sum, item) => sum + Number(item.distance || 0), 0);

  return {
    reps,
    average,
    spread,
    dynamics,
    hrTrend,
    recoveryTrend,
    totalWorkDistance
  };
}

function generateIntervalInsight(summary) {
  const analysis = getIntervalAnalysis(summary);
  if (!analysis) return null;

  const unit = currentLanguage === "uk" ? "км" : "km";
  const bpm = currentLanguage === "uk" ? "уд/хв" : "bpm";
  const repsLabel = analysis.reps.length;
  const workDistanceKm = analysis.totalWorkDistance / 1000;
  const workDistanceLabel = Number.isInteger(workDistanceKm)
    ? String(workDistanceKm)
    : workDistanceKm.toFixed(1).replace(".", currentLanguage === "uk" ? "," : ".");
  const pace = formatInsightPace(analysis.average);
  const spread = Math.round(analysis.spread);

  if (currentLanguage === "uk") {
    const parts = [
      `Інтервальна · ${repsLabel} повторів`,
      `середній темп роботи ${pace}/км`,
      `розкид ${spread} с/км`
    ];

    if (analysis.dynamics === "faster") parts.push("останні повторення швидші за перші");
    else if (analysis.dynamics === "slower") parts.push("останні повторення повільніші за перші");
    else parts.push("темп роботи залишався рівним");

    if (analysis.hrTrend === "rising") parts.push(`ЧСС зростала від першого до останнього повторення${workHrText(summary, bpm)}`);
    else if (analysis.hrTrend === "falling") parts.push("ЧСС знижувалась до кінця серії");
    else if (analysis.hrTrend === "stable") parts.push("ЧСС без різкого стрибка");

    if (analysis.recoveries.length) {
      parts.push(analysis.recoveryTrend === "variable"
        ? "відновлення були нерівномірними"
        : "відновлення залишались стабільними");
    }

    let conclusion = "Робота виконана контрольовано.";
    if (analysis.spread <= 5 && analysis.dynamics !== "slower") {
      conclusion = "Робота виконана дуже рівно, без розвалу.";
    } else if (analysis.dynamics === "slower" && analysis.spread > 10) {
      conclusion = "До кінця серії темп просів — навантаження було на межі.";
    } else if (analysis.dynamics === "faster") {
      conclusion = "Серію пройдено з хорошим контролем, із сильним фінішем.";
    }

    parts.push(`загальний обсяг швидкої роботи ${workDistanceLabel} ${unit}`);
    return `${parts.join(" · ")}. ${conclusion}`;
  }

  const parts = [
    `Intervals · ${repsLabel} reps`,
    `average work pace ${pace}/km`,
    `spread ${spread} sec/km`
  ];

  if (analysis.dynamics === "faster") parts.push("the last reps were faster than the first");
  else if (analysis.dynamics === "slower") parts.push("the last reps were slower than the first");
  else parts.push("work pace stayed even");

  if (analysis.hrTrend === "rising") parts.push(`HR rose from the first to the last rep`);
  else if (analysis.hrTrend === "falling") parts.push("HR decreased toward the end");
  else if (analysis.hrTrend === "stable") parts.push("HR stayed without a sharp jump");

  if (analysis.recoveries.length) {
    parts.push(analysis.recoveryTrend === "variable"
      ? "recoveries were variable"
      : "recoveries stayed stable");
  }

  let conclusion = "The workout was controlled.";
  if (analysis.spread <= 5 && analysis.dynamics !== "slower") {
    conclusion = "The work was very even, with no breakdown.";
  } else if (analysis.dynamics === "slower" && analysis.spread > 10) {
    conclusion = "The pace dropped toward the end — the load was close to the limit.";
  } else if (analysis.dynamics === "faster") {
    conclusion = "The set was well controlled, with a strong finish.";
  }

  parts.push(`total fast-work volume ${workDistanceLabel} ${unit}`);
  return `${parts.join(" · ")}. ${conclusion}`;
}

function workHrText(summary, bpm) {
  const analysis = getIntervalAnalysis(summary);
  if (!analysis) return "";
  const hr = analysis.reps.map(rep => Number(rep.work?.heartRate)).filter(Number.isFinite);
  if (hr.length < 2) return "";
  return ` (${Math.round(hr[0])}→${Math.round(hr[hr.length - 1])} ${bpm})`;
}

function generateWorkoutInsight(summary) {
  const intervalInsight = generateIntervalInsight(summary);
  if (intervalInsight) return intervalInsight;

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
  if (workoutSavePanel) workoutSavePanel.hidden = true;
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

function workoutDateIso(summary) {
  if (!(summary?.date instanceof Date) || Number.isNaN(summary.date.getTime())) return null;
  return summary.date.toISOString();
}

function workoutDurationSeconds(value) {
  const parts = String(value || "").split(":").map(Number);
  if (parts.length === 2 && parts.every(Number.isFinite)) return parts[0] * 60 + parts[1];
  if (parts.length === 3 && parts.every(Number.isFinite)) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return null;
}

function workoutFingerprint(summary) {
  const date = workoutDateIso(summary) || "no-date";
  const distance = Number(summary?.distance || 0).toFixed(2);
  const duration = workoutDurationSeconds(summary?.duration) ?? 0;
  return `${date}|${distance}|${duration}`;
}

function getWorkoutTypeKey(summary) {
  const pattern = getWorkoutPattern(summary);
  if (pattern?.type === "intervals") return "intervals";
  if (pattern?.type === "tempo") return "tempo";
  if (pattern?.type === "fartlek") return "fartlek";
  if (Number(summary?.distance) >= 15) return "long";
  return "run";
}

function workoutTypeLabel(value) {
  const map = {
    intervals: "workoutIntervals",
    tempo: "workoutTempo",
    fartlek: "workoutFartlek",
    long: "workoutLong",
    run: "workoutRun"
  };
  return t(map[value] || "workoutRun");
}

function historyPayload(summary, aiAnalysis = null) {
  return {
    workout_date: workoutDateIso(summary),
    distance_km: Number(summary?.distance) || 0,
    duration_sec: workoutDurationSeconds(summary?.duration),
    pace: summary?.pace || null,
    heart_rate: Number.isFinite(Number(summary?.heartRate)) ? Math.round(Number(summary.heartRate)) : null,
    cadence: Number.isFinite(Number(summary?.cadence)) ? Math.round(Number(summary.cadence)) : null,
    calories: summary?.calories != null && Number.isFinite(Number(summary.calories)) ? Math.round(Number(summary.calories)) : null,
    ascent_m: Number.isFinite(Number(summary?.ascent)) ? Math.round(Number(summary.ascent)) : null,
    workout_type: getWorkoutTypeKey(summary),
    splits: Array.isArray(summary?.splits) ? summary.splits : [],
    structure: Array.isArray(summary?.structure) ? summary.structure : [],
    ai_analysis: aiAnalysis || summary?._aiAnalysis || null,
    workout_key: workoutFingerprint(summary)
  };
}

async function saveWorkoutToHistory(summary, aiAnalysis = null) {
  if (!supabaseClient || !currentSession?.user || !summary) return null;

  const payload = historyPayload(summary, aiAnalysis);
  const { data, error } = await supabaseClient
    .from("workouts")
    .upsert({ user_id: currentSession.user.id, ...payload }, { onConflict: "user_id,workout_key" })
    .select("id, workout_date, distance_km, duration_sec, pace, heart_rate, cadence, calories, ascent_m, workout_type, splits, structure, ai_analysis, workout_key, created_at")
    .single();

  if (error) {
    console.warn("Runory: could not save workout history.", error);
    setAuthMessage(error.message || t("historySaveError"), "error");
    return null;
  }

  currentHistoryId = data.id;
  currentWorkout._historyId = data.id;
  currentWorkout._aiAnalysis = data.ai_analysis || null;
  historyLoaded = false;
  return data;
}

function formatHistoryDate(value) {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString(translations[currentLanguage].locale, {
    day: "2-digit", month: "2-digit", year: "numeric"
  });
}

function formatHistoryDuration(seconds) {
  if (!Number.isFinite(Number(seconds))) return "—";
  const total = Math.max(0, Math.round(Number(seconds)));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const sec = String(total % 60).padStart(2, "0");
  return h ? `${h}:${String(m).padStart(2, "0")}:${sec}` : `${m}:${sec}`;
}

function formatHistoryDistance(value) {
  return Number.isFinite(Number(value)) ? `${Number(value).toFixed(2).replace(".", currentLanguage === "uk" ? "," : ".")} ${currentLanguage === "uk" ? "км" : "km"}` : "—";
}

function formatHistoryTotalTime(seconds) {
  const total = Math.max(0, Math.round(Number(seconds) || 0));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  if (h) return `${h} ${currentLanguage === "uk" ? "год" : "h"} ${m} ${currentLanguage === "uk" ? "хв" : "min"}`;
  return `${m} ${currentLanguage === "uk" ? "хв" : "min"}`;
}

function historyTypeClass(value) {
  return ["intervals", "tempo", "fartlek", "long", "run"].includes(value) ? value : "run";
}

function historyTypeIcon(value) {
  const type = historyTypeClass(value);
  if (type === "intervals") return "↯";
  if (type === "tempo") return "≈";
  if (type === "fartlek") return "✦";
  if (type === "long") return "↗";
  return "•";
}

function historyFilterLabel(type) {
  const map = { all: "historyFilterAll", run: "historyFilterEasy", tempo: "historyFilterTempo", intervals: "historyFilterIntervals", long: "historyFilterLong" };
  return t(map[type] || "historyFilterAll");
}

function historyPeriodStart() {
  if (historyPeriodFilter === "all") return null;
  const days = historyPeriodFilter === "7" ? 7 : 30;
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - (days - 1));
  return start;
}

function historyFilteredWorkouts() {
  const start = historyPeriodStart();
  return historyWorkouts.filter(workout => {
    const typeOk = historyTypeFilter === "all" || historyTypeClass(workout.workout_type) === historyTypeFilter;
    const date = workout.workout_date ? new Date(workout.workout_date) : null;
    const dateOk = !start || (date && !Number.isNaN(date.getTime()) && date >= start);
    return typeOk && dateOk;
  });
}

function paceToSeconds(value) {
  if (typeof value === "number") return value > 20 ? value : value * 60;
  const match = String(value || "").match(/(\d+)(?::|\.)(\d{1,2})/);
  if (!match) return null;
  return Number(match[1]) * 60 + Number(match[2]);
}

function formatPaceSeconds(seconds) {
  if (!Number.isFinite(seconds)) return "—";
  const rounded = Math.max(0, Math.round(seconds));
  return `${Math.floor(rounded / 60)}:${String(rounded % 60).padStart(2, "0")}`;
}

function getWeekStart(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
}

function formatWeekLabel(date) {
  return date.toLocaleDateString(translations[currentLanguage].locale, { day: "2-digit", month: "2-digit" });
}

function renderHistoryAnalytics(workouts) {
  const analytics = document.querySelector("#historyAnalytics");
  if (!analytics) return;
  if (!workouts.length) { analytics.innerHTML = ""; return; }

  const byWeek = new Map();
  workouts.forEach(workout => {
    const date = workout.workout_date ? new Date(workout.workout_date) : null;
    if (!date || Number.isNaN(date.getTime())) return;
    const key = getWeekStart(date).toISOString().slice(0, 10);
    if (!byWeek.has(key)) byWeek.set(key, { date: getWeekStart(date), distance: 0, paceWeighted: 0, paceDistance: 0, hrWeighted: 0, hrDistance: 0 });
    const row = byWeek.get(key);
    const distance = Number(workout.distance_km) || 0;
    row.distance += distance;
    const pace = paceToSeconds(workout.pace);
    if (pace && distance) { row.paceWeighted += pace * distance; row.paceDistance += distance; }
    const hr = Number(workout.heart_rate);
    if (Number.isFinite(hr) && distance) { row.hrWeighted += hr * distance; row.hrDistance += distance; }
  });

  const weeks = [...byWeek.values()].sort((a, b) => a.date - b.date).slice(-8);
  const maxDistance = Math.max(...weeks.map(w => w.distance), 1);
  const hasChartData = weeks.length > 0;
  const chart = hasChartData ? weeks.map(w => `
    <div class="history-bar-col" title="${escapeHtml(formatWeekLabel(w.date))}: ${escapeHtml(w.distance.toFixed(1))} km">
      <div class="history-bar-track"><div class="history-bar" style="height:${Math.max(5, (w.distance / maxDistance) * 100)}%"></div></div>
      <span>${escapeHtml(formatWeekLabel(w.date))}</span>
      <strong>${escapeHtml(w.distance.toFixed(1))}</strong>
    </div>`).join("") : `<div class="history-chart-empty">${escapeHtml(t("historyNoData"))}</div>`;

  const paceRows = weeks.filter(w => w.paceDistance > 0);
  const hrRows = weeks.filter(w => w.hrDistance > 0);
  const lastPace = paceRows.length ? paceRows[paceRows.length - 1].paceWeighted / paceRows[paceRows.length - 1].paceDistance : null;
  const prevPace = paceRows.length > 1 ? paceRows[paceRows.length - 2].paceWeighted / paceRows[paceRows.length - 2].paceDistance : null;
  const lastHr = hrRows.length ? hrRows[hrRows.length - 1].hrWeighted / hrRows[hrRows.length - 1].hrDistance : null;
  const prevHr = hrRows.length > 1 ? hrRows[hrRows.length - 2].hrWeighted / hrRows[hrRows.length - 2].hrDistance : null;
  const delta = (a, b, invert = false) => {
    if (!Number.isFinite(a) || !Number.isFinite(b)) return "";
    const diff = a - b;
    if (Math.abs(diff) < 0.5) return "→";
    return (invert ? diff < 0 : diff > 0) ? "↗" : "↘";
  };

  analytics.innerHTML = `
    <div class="history-analytics-heading"><span class="eyebrow">${escapeHtml(t("historyOverview"))}</span></div>
    <div class="history-analytics-grid">
      <article class="history-chart-card">
        <div class="history-card-heading"><h3>${escapeHtml(t("historyWeeklyDistance"))}</h3><span>${escapeHtml(t("historyWeek"))}</span></div>
        <div class="history-bars">${chart}</div>
      </article>
      <article class="history-dynamics-card">
        <div class="history-card-heading"><h3>${escapeHtml(t("historyDynamics"))}</h3></div>
        <div class="history-dynamic-row"><span>${escapeHtml(t("historyAvgPace"))}</span><strong>${escapeHtml(formatPaceSeconds(lastPace))} <small>${lastPace ? ` ${delta(lastPace, prevPace, true)}` : ""}</small></strong></div>
        <div class="history-dynamic-row"><span>${escapeHtml(t("historyAvgHr"))}</span><strong>${Number.isFinite(lastHr) ? `${Math.round(lastHr)} ${currentLanguage === "uk" ? "уд/хв" : "bpm"}` : "—"} <small>${Number.isFinite(lastHr) ? delta(lastHr, prevHr, true) : ""}</small></strong></div>
        <p>${escapeHtml(currentLanguage === "uk" ? "Порівнюємо останній тиждень із попереднім." : "Comparing the latest week with the previous one.")}</p>
      </article>
    </div>`;
}

function renderHistoryControls() {
  const controls = document.querySelector("#historyControls");
  if (!controls) return;
  const typeButtons = ["all", "run", "tempo", "intervals", "long"].map(type => `
    <button type="button" class="history-filter ${historyTypeFilter === type ? "is-active" : ""}" data-history-type="${type}">${escapeHtml(historyFilterLabel(type))}</button>`).join("");
  const periodButtons = ["7", "30", "all"].map(period => `
    <button type="button" class="history-filter ${historyPeriodFilter === period ? "is-active" : ""}" data-history-period="${period}">${escapeHtml(t(period === "7" ? "historyPeriod7" : period === "30" ? "historyPeriod30" : "historyPeriodAll"))}</button>`).join("");
  controls.innerHTML = `
    <div class="history-filter-group"><span class="history-filter-label">${escapeHtml(currentLanguage === "uk" ? "Тип" : "Type")}</span><div class="history-filter-row">${typeButtons}</div></div>
    <div class="history-filter-group"><span class="history-filter-label">${escapeHtml(currentLanguage === "uk" ? "Період" : "Period")}</span><div class="history-filter-row">${periodButtons}</div></div>`;
}

function renderHistoryList(workouts = historyFilteredWorkouts()) {
  const container = document.querySelector("#historyList");
  const status = document.querySelector("#historyStatus");
  const stats = document.querySelector("#historyStats");
  if (!container) return;

  renderHistoryControls();
  renderHistoryAnalytics(workouts);

  if (!workouts.length) {
    if (stats) stats.innerHTML = "";
    container.innerHTML = `
      <div class="history-empty">
        <div class="history-empty-icon">🏃</div>
        <strong>${escapeHtml(historyWorkouts.length ? (currentLanguage === "uk" ? "За цими фільтрами тренувань немає." : "No workouts match these filters.") : t("historyEmpty"))}</strong>
        <p>${escapeHtml(historyWorkouts.length ? (currentLanguage === "uk" ? "Спробуй змінити тип або період." : "Try another type or period.") : t("historyCopy"))}</p>
        ${historyWorkouts.length ? "" : `<button type="button" class="history-empty-button" data-view-target="analysis">${escapeHtml(t("historyEmptyAction"))}</button>`}
      </div>`;
    if (status) status.textContent = "";
    return;
  }

  const totalDistance = workouts.reduce((sum, w) => sum + (Number(w.distance_km) || 0), 0);
  const totalTime = workouts.reduce((sum, w) => sum + (Number(w.duration_sec) || 0), 0);
  if (stats) {
    stats.innerHTML = `
      <article class="history-stat-card"><span class="history-stat-label">${escapeHtml(t("historyStatsWorkouts"))}</span><strong>${workouts.length}</strong></article>
      <article class="history-stat-card"><span class="history-stat-label">${escapeHtml(t("historyStatsDistance"))}</span><strong>${escapeHtml(totalDistance.toFixed(1).replace(".", currentLanguage === "uk" ? "," : "."))} <small>${currentLanguage === "uk" ? "км" : "km"}</small></strong></article>
      <article class="history-stat-card"><span class="history-stat-label">${escapeHtml(t("historyStatsTime"))}</span><strong>${escapeHtml(formatHistoryTotalTime(totalTime))}</strong></article>`;
  }

  container.innerHTML = workouts.map(workout => `
    <article class="history-item" data-history-id="${escapeHtml(workout.id)}">
      <div class="history-type-icon ${historyTypeClass(workout.workout_type)}" aria-hidden="true">${historyTypeIcon(workout.workout_type)}</div>
      <div class="history-item-main">
        <div class="history-item-heading"><div><p class="eyebrow">${escapeHtml(formatHistoryDate(workout.workout_date))}</p><h3>${escapeHtml(workoutTypeLabel(workout.workout_type))}</h3></div><strong class="history-distance">${escapeHtml(formatHistoryDistance(workout.distance_km))}</strong></div>
        <div class="history-metrics"><span><b>${escapeHtml(t("pace"))}</b> ${escapeHtml(workout.pace || "—")}</span><span><b>${escapeHtml(t("time"))}</b> ${escapeHtml(formatHistoryDuration(workout.duration_sec))}</span><span><b>${escapeHtml(t("heartRate"))}</b> ${workout.heart_rate != null ? `${Math.round(workout.heart_rate)} ${currentLanguage === "uk" ? "уд/хв" : "bpm"}` : "—"}</span><span><b>${escapeHtml(t("ascent"))}</b> ${workout.ascent_m != null ? `+${Math.round(workout.ascent_m)} ${currentLanguage === "uk" ? "м" : "m"}` : "—"}</span></div>
      </div>
      <div class="history-item-actions"><button type="button" class="history-view-button" data-history-view="${escapeHtml(workout.id)}">${escapeHtml(t("historyOpen"))}</button><button type="button" class="history-delete-button" data-history-delete="${escapeHtml(workout.id)}" aria-label="${escapeHtml(t("historyDelete"))}">×</button></div>
    </article>`).join("");
  if (status) status.textContent = `${workouts.length} ${currentLanguage === "uk" ? "тренувань" : "workouts"}`;
}

async function loadWorkoutHistory(force = false) {
  const container = document.querySelector("#historyList");
  const status = document.querySelector("#historyStatus");
  if (!container) return;
  if (!currentSession?.user) {
    historyWorkouts = [];
    renderHistoryControls();
    renderHistoryAnalytics([]);
    if (document.querySelector("#historyStats")) document.querySelector("#historyStats").innerHTML = "";
    container.innerHTML = `<div class="history-empty"><strong>${escapeHtml(t("historyLoginHint"))}</strong></div>`;
    if (status) status.textContent = "";
    historyLoaded = false;
    return;
  }
  if (historyLoaded && !force) return;

  container.innerHTML = `<div class="history-empty">${escapeHtml(t("historyLoading"))}</div>`;

  const { data, error } = await supabaseClient
    .from("workouts")
    .select("id, workout_date, distance_km, duration_sec, pace, heart_rate, cadence, calories, ascent_m, workout_type, splits, structure, ai_analysis, workout_key, created_at")
    .eq("user_id", currentSession.user.id)
    .order("workout_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    console.warn("Runory: could not load workout history.", error);
    container.innerHTML = `<div class="history-empty"><strong>${escapeHtml(t("historyError"))}</strong><p>${escapeHtml(error.message || "")}</p></div>`;
    historyLoaded = false;
    return;
  }

  historyWorkouts = data || [];
  renderHistoryList(historyFilteredWorkouts());
  historyLoaded = true;
}

function historyRecordToWorkout(record) {
  return {
    distance: Number(record.distance_km).toFixed(2),
    duration: formatHistoryDuration(record.duration_sec),
    pace: record.pace || "—",
    heartRate: record.heart_rate,
    cadence: record.cadence,
    calories: record.calories,
    ascent: record.ascent_m,
    splits: Array.isArray(record.splits) ? record.splits : [],
    structure: Array.isArray(record.structure) ? record.structure : [],
    date: record.workout_date ? new Date(record.workout_date) : null,
    _historyId: record.id,
    _aiAnalysis: record.ai_analysis || null
  };
}

function openWorkoutFromHistory(record) {
  currentHistoryId = record.id;
  currentWorkout = historyRecordToWorkout(record);
  renderSummary(currentWorkout);
  if (record.ai_analysis) {
    if (aiAnalysis) aiAnalysis.hidden = false;
    if (aiAnalysisText) {
      aiAnalysisText.innerHTML = renderAiAnalysis(record.ai_analysis);
      aiAnalysis?.classList.remove("is-loading");
    }
  }
  setActiveView("analysis");
  if (results) results.hidden = false;
  window.setTimeout(() => results?.scrollIntoView({ behavior: "smooth", block: "start" }), 0);
}

async function deleteWorkoutFromHistory(id) {
  if (!supabaseClient || !currentSession?.user || !id) return;
  const { error } = await supabaseClient
    .from("workouts")
    .delete()
    .eq("id", id)
    .eq("user_id", currentSession.user.id);
  if (error) {
    setAuthMessage(error.message || t("historyDeleteError"), "error");
    return;
  }
  if (currentHistoryId === id) {
    currentHistoryId = null;
    currentWorkout = null;
    if (results) results.hidden = true;
  }
  setAuthMessage(t("historyDeleted"), "success");
  await loadWorkoutHistory(true);
}

document.addEventListener("click", event => {
  const typeButton = event.target.closest("[data-history-type]");
  if (typeButton) {
    historyTypeFilter = typeButton.dataset.historyType || "all";
    renderHistoryList(historyFilteredWorkouts());
    return;
  }
  const periodButton = event.target.closest("[data-history-period]");
  if (periodButton) {
    historyPeriodFilter = periodButton.dataset.historyPeriod || "all";
    renderHistoryList(historyFilteredWorkouts());
  }
});

document.addEventListener("click", async event => {
  const viewButton = event.target.closest("[data-history-view]");
  if (viewButton) {
    const id = viewButton.dataset.historyView;
    const { data, error } = await supabaseClient
      .from("workouts")
      .select("id, workout_date, distance_km, duration_sec, pace, heart_rate, cadence, calories, ascent_m, workout_type, splits, structure, ai_analysis, workout_key, created_at")
      .eq("id", id)
      .eq("user_id", currentSession?.user?.id || "")
      .single();
    if (!error && data) openWorkoutFromHistory(data);
    return;
  }

  const deleteButton = event.target.closest("[data-history-delete]");
  if (deleteButton) {
    await deleteWorkoutFromHistory(deleteButton.dataset.historyDelete);
  }
});

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

    const analysisText = data.analysis || t("errorAiUnavailable");
    currentWorkout._aiAnalysis = analysisText;

    if (aiAnalysisText) {
      aiAnalysisText.innerHTML =
        renderAiAnalysis(analysisText);
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

function showWorkoutSavePanel() {
  if (!workoutSavePanel) return;
  workoutSavePanel.hidden = false;
  if (workoutSaveStatus) workoutSaveStatus.textContent = "";
  if (saveWorkoutButton) {
    saveWorkoutButton.disabled = false;
    saveWorkoutButton.hidden = false;
    saveWorkoutButton.textContent = t("saveWorkout");
  }
  if (cancelWorkoutButton) {
    cancelWorkoutButton.disabled = false;
    cancelWorkoutButton.hidden = false;
  }
}

function setWorkoutSaveBusy(isBusy) {
  if (saveWorkoutButton) {
    saveWorkoutButton.disabled = isBusy;
    saveWorkoutButton.textContent = isBusy ? t("savingWorkout") : t("saveWorkout");
  }
  if (cancelWorkoutButton) cancelWorkoutButton.disabled = isBusy;
}

async function handleSaveWorkout() {
  if (!currentWorkout || !currentSession?.user || !saveWorkoutButton) return;

  setWorkoutSaveBusy(true);
  saveWorkoutButton.hidden = true;
  cancelWorkoutButton.hidden = true;
  if (workoutSaveStatus) workoutSaveStatus.textContent = t("savingWorkout");

  const saved = await saveWorkoutToHistory(currentWorkout, currentWorkout._aiAnalysis || null);
  if (saved) {
    if (workoutSaveStatus) workoutSaveStatus.textContent = t("workoutSaved");
  } else {
    saveWorkoutButton.hidden = false;
    cancelWorkoutButton.hidden = false;
    setWorkoutSaveBusy(false);
    if (workoutSaveStatus) workoutSaveStatus.textContent = t("historySaveError");
  }
}

function handleCancelWorkout() {
  currentWorkout = null;
  currentHistoryId = null;
  if (workoutSavePanel) workoutSavePanel.hidden = true;
  if (results) results.hidden = true;
  if (aiAnalysis) aiAnalysis.hidden = true;
  if (aiAnalysisText) aiAnalysisText.innerHTML = "";
  if (input) input.value = "";
  if (uploadState) uploadState.hidden = true;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

saveWorkoutButton?.addEventListener("click", handleSaveWorkout);
cancelWorkoutButton?.addEventListener("click", handleCancelWorkout);

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
    currentHistoryId = null;

    renderSummary(summary);
    showWorkoutSavePanel();

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
const profileForm = document.querySelector("#profileForm");
const profileBirthDate = document.querySelector("#profileBirthDate");
const profileBirthDatePicker = document.querySelector("#profileBirthDatePicker");
const profileBirthDatePickerButton = document.querySelector("#profileBirthDatePickerButton");
const profileGender = document.querySelector("#profileGender");
const profileHeight = document.querySelector("#profileHeight");
const profileWeight = document.querySelector("#profileWeight");
const profileSaveButton = document.querySelector("#profileSaveButton");
const profileMessage = document.querySelector("#profileMessage");

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
      ? t("authAccount")
      : t("authSignIn");
  }

  if (authAccountEmail) {
    authAccountEmail.textContent = signedIn
      ? `${t("authLoggedInAs")}: ${user.email || user.phone || "—"}`
      : "";
  }

  if (authFormView) authFormView.hidden = signedIn;
  if (authAccountView) authAccountView.hidden = !signedIn;

  if (!signedIn) {
    clearProfileForm();
  }
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


function setProfileMessage(message = "", type = "") {
  if (!profileMessage) return;
  profileMessage.textContent = message;
  profileMessage.className = `auth-message${type ? ` is-${type}` : ""}`;
}

function formatBirthDate(isoDate) {
  if (!isoDate || !/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) return "";
  const [year, month, day] = isoDate.split("-");
  return `${day}.${month}.${year}`;
}

function parseBirthDate(value) {
  const normalized = String(value || "").trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(normalized)) return normalized;
  const match = normalized.match(/^(\d{2})[.\/](\d{2})[.\/](\d{4})$/);
  if (!match) return "";
  const [, day, month, year] = match;
  const candidate = `${year}-${month}-${day}`;
  const date = new Date(`${candidate}T00:00:00`);
  if (Number.isNaN(date.getTime()) || date.getFullYear() !== Number(year) || date.getMonth() + 1 !== Number(month) || date.getDate() !== Number(day)) return "";
  return candidate;
}

function clearProfileForm() {
  if (profileBirthDate) profileBirthDate.value = "";
  if (profileBirthDatePicker) profileBirthDatePicker.value = "";
  if (profileGender) profileGender.value = "";
  if (profileHeight) profileHeight.value = "";
  if (profileWeight) profileWeight.value = "";
  setProfileMessage("");
}

function fillProfileForm(profile) {
  const isoDate = profile?.birth_date || "";
  if (profileBirthDate) profileBirthDate.value = formatBirthDate(isoDate);
  if (profileBirthDatePicker) profileBirthDatePicker.value = isoDate;
  if (profileGender) profileGender.value = profile?.gender || "";
  if (profileHeight) profileHeight.value = profile?.height_cm ?? "";
  if (profileWeight) profileWeight.value = profile?.weight_kg ?? "";
}

async function ensureUserProfile(user) {
  if (!supabaseClient || !user) return;

  setProfileMessage("");

  try {
    // Do not upsert a partial row while opening the profile. Some profile
    // columns may be required, so a read-only lookup must happen first.
    const { data: profile, error } = await supabaseClient
      .from("profiles")
      .select("id, birth_date, gender, height_cm, weight_kg")
      .eq("id", user.id)
      .maybeSingle();

    if (error) throw error;

    fillProfileForm(profile || null);
  } catch (error) {
    console.warn("Runory: could not load profile.", error);
    setProfileMessage(error?.message || t("profileLoadError"), "error");
  }
}

async function saveUserProfile(event) {
  event.preventDefault();

  if (!supabaseClient || !currentSession?.user) return;

  const userId = currentSession.user.id;
  const birthDate = parseBirthDate(profileBirthDate?.value || "");
  const gender = profileGender?.value || "";
  const height = profileHeight?.value ? Number(profileHeight.value) : null;
  const weight = profileWeight?.value ? Number(profileWeight.value) : null;

  if (!birthDate || !gender || !Number.isFinite(height) || !Number.isFinite(weight)) {
    setProfileMessage(!birthDate ? "Введи дату у форматі ДД.ММ.РРРР." : "Заповни всі поля профілю.", "error");
    return;
  }

  const payload = {
    birth_date: birthDate,
    gender,
    height_cm: height,
    weight_kg: weight
  };

  profileSaveButton?.setAttribute("disabled", "disabled");
  setProfileMessage("");

  try {
    const { data, error } = await supabaseClient
      .from("profiles")
      .upsert({ id: userId, ...payload }, { onConflict: "id" })
      .select("id, birth_date, gender, height_cm, weight_kg")
      .single();

    if (error) throw error;

    fillProfileForm(data);
    setProfileMessage(t("profileSaved"), "success");
  } catch (error) {
    console.warn("Runory: could not save profile.", error);
    setProfileMessage(error?.message || t("profileSaveError"), "error");
  } finally {
    profileSaveButton?.removeAttribute("disabled");
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
  historyLoaded = false;
  if (data?.session?.user) {
    await ensureUserProfile(data.session.user);
  }

  supabaseClient.auth.onAuthStateChange((event, session) => {
    window.setTimeout(async () => {
      updateAuthUI(session);
      historyLoaded = false;
      if (session?.user) await ensureUserProfile(session.user);
      if (document.querySelector("#history")?.classList.contains("is-active")) loadWorkoutHistory(true);
    }, 0);
  });
}

authButton?.addEventListener("click", openAuthModal);
authClose?.addEventListener("click", closeAuthModal);
authModalBackdrop?.addEventListener("click", closeAuthModal);
googleSignInButton?.addEventListener("click", signInWithGoogle);
emailAuthForm?.addEventListener("submit", submitEmailAuth);
authSwitchButton?.addEventListener("click", () => setAuthMode(authMode === "signin" ? "signup" : "signin"));
authLogoutButton?.addEventListener("click", signOut);
profileBirthDatePickerButton?.addEventListener("click", () => {
  // iOS Safari may not support showPicker() and may ignore click() on a
  // fully hidden date input. Keep the native input as a transparent overlay
  // on the calendar button instead, while this handler remains a desktop fallback.
  try {
    if (typeof profileBirthDatePicker?.showPicker === "function") {
      profileBirthDatePicker.showPicker();
      return;
    }
  } catch (error) {
    console.debug("Runory: native date picker fallback", error);
  }
  profileBirthDatePicker?.focus();
});

profileBirthDatePicker?.addEventListener("change", () => {
  if (profileBirthDate) profileBirthDate.value = formatBirthDate(profileBirthDatePicker.value);
});

profileBirthDate?.addEventListener("input", () => {
  // Format the date immediately while typing: 07051993 -> 07.05.1993.
  // Keep the field fully editable on desktop and mobile.
  const digits = profileBirthDate.value.replace(/\D/g, "").slice(0, 8);
  let formatted = digits;
  if (digits.length > 2) formatted = `${digits.slice(0, 2)}.${digits.slice(2)}`;
  if (digits.length > 4) formatted = `${digits.slice(0, 2)}.${digits.slice(2, 4)}.${digits.slice(4)}`;
  profileBirthDate.value = formatted;
  profileBirthDate.setSelectionRange(formatted.length, formatted.length);
});

profileBirthDate?.addEventListener("blur", () => {
  const digits = profileBirthDate.value.replace(/\D/g, "").slice(0, 8);
  if (!digits) return;
  let formatted = digits;
  if (digits.length > 2) formatted = `${digits.slice(0, 2)}.${digits.slice(2)}`;
  if (digits.length > 4) formatted = `${digits.slice(0, 2)}.${digits.slice(2, 4)}.${digits.slice(4)}`;
  profileBirthDate.value = formatted;
});

profileForm?.addEventListener("submit", saveUserProfile);

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
