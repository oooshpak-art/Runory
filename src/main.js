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
    homeNav: "Головна",
    historyNavShort: "Тренування",
    toolsNav: "ІНСТРУМЕНТИ",
    homeEyebrow: "ТВІЙ RUNORY",
    homeTitle: "Твій біг — коротко й по суті.",
    homeCopy: "Останнє тренування, зміни форми та те, що відбувається цього тижня.",
    homeLatest: "ОСТАННЄ ТРЕНУВАННЯ",
    homeLatestEmpty: "Поки немає збережених тренувань.",
    homeLatestEmptyCopy: "Додай перше тренування через плюс у верхній панелі.",
    homeViewWorkout: "Переглянути тренування",
    homeInsightSaved: "Аналіз тренування збережено в історії.",
    homeInsightWorkout: "Тренування збережено в Runory.",
    homeForm: "ЩО ВІДБУВАЄТЬСЯ З ФОРМОЮ",
    homeViewDynamics: "Переглянути динаміку",
    homeWeek: "ЦЬОГО ТИЖНЯ",
    homeWeekWorkouts: "тренувань",
    homeWeekDistance: "км",
    homeWeekTime: "год",
    homeWeekEmpty: "Цього тижня тренувань ще немає.",
    homeNoTrend: "Недостатньо даних",
    homeEasy: "Легкі",
    homeTempo: "Темпові",
    homeIntervals: "Інтервали",
    homeLong: "Довгі",
    homeComparisonOnly: "Є пряме порівняння",
    navCalculator: "Калькулятор бігу",
    calcPageTitle: "Runory — калькулятор бігу",
    calcHeroTitle: "Плануй забіг у цифрах.",
    calcHeroCopy: "Введи два значення — Runory одразу порахує третє.",
    calculatorEyebrow: "ІНСТРУМЕНТ БІГУНА",
    calculatorType: "Тип розрахунку",
    tabTime: "Знайти час",
    tabDistance: "Знайти дистанцію",
    tabPace: "Знайти темп",
    timeEyebrow: "ДИСТАНЦІЯ + ТЕМП",
    timeTitle: "Який буде час?",
    timeDescription: "Вкажи дистанцію та бажаний темп.",
    timeLabel: "Твій орієнтовний час",
    distanceEyebrow: "ЧАС + ТЕМП",
    distanceTitle: "Яка буде дистанція?",
    distanceDescription: "Вкажи час, який маєш, і свій темп.",
    distanceLabel: "Твоя орієнтовна дистанція",
    paceEyebrow: "ДИСТАНЦІЯ + ЧАС",
    paceTitle: "Який потрібен темп?",
    paceDescription: "Вкажи дистанцію та бажаний фінішний час.",
    paceLabel: "Твій потрібний темп",
    exampleDistance: "Наприклад, 21.1",
    hours: "год",
    minutesShort: "хв",
    secondsShort: "сек",
    calculate: "Розрахувати",
    resultTime: "Твій орієнтовний час",
    checkValues: "Перевір введені значення",
    rangeError: "Хвилини та секунди мають бути від 0 до 59.",
    perKm: "/ км",
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
    dynamicsNav: "Динаміка",
    dynamicsTitle: "Динаміка бігової форми",
    dynamicsCopy: "Порівнюємо схожі тренування, щоб бачити зміни форми з часом.",
    dynamicsEasy: "Легкі",
    dynamicsTempo: "Темпові",
    dynamicsIntervals: "Інтервали",
    dynamicsLong: "Довгі",
    dynamicsComingSoon: "Незабаром",
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
    historyEasyDynamics: "Динаміка легких пробіжок",
    historyEasyDynamicsHint: "Порівнюємо тренування зі схожим рівнем легкої інтенсивності, а не всі пробіжки підряд.",
    historyEasyPaceAtHr: "Темп при схожому пульсі",
    historyEasyHrAtPace: "Пульс при схожому темпі",
    historyEasyNoTrend: "Поки недостатньо схожих тренувань для надійного висновку.",
    historyEasyImproved: "Показники покращуються",
    historyEasyStable: "Стабільний рівень",
    historyEasyDeclined: "Є ознаки погіршення",
    historyEasyCurrentBetter: "Останній результат кращий за типовий рівень",
    historyEasyCurrentWorse: "Останній результат слабший за типовий рівень",
    historyEasyMixed: "Показники різноспрямовані",
    historyEasyNearTypical: "Результат близький до типового рівня",
    historyEasyTrendHint: "Для впевненого висновку про тренд потрібно більше схожих тренувань.",
    historyEasyCompared: "На основі {count} схожих тренувань",
    historyEasyComparisonOnly: "Є одне попереднє схоже тренування — доступне пряме порівняння.",
    historyTempoDynamics: "Динаміка темпових тренувань",
    historyTempoHint: "Порівнюємо лише безперервні темпові тренування зі схожим обсягом роботи.",
    historyTempoNoTrend: "Поки недостатньо схожих темпових тренувань для надійного висновку.",
    historyTempoPace: "Середній темп темпової роботи",
    historyTempoHr: "Середній пульс темпової роботи",
    historyTempoVolume: "Обсяг темпової роботи",
    historyTempoLatest: "Останнє темпове",
    historyTempoPrevious: "Попереднє схоже",
    historyTempoImproved: "Темпова форма покращується",
    historyTempoStable: "Темпова форма стабільна",
    historyTempoDeclined: "Є ознаки погіршення темпової форми",
    historyTempoCompared: "На основі {count} схожих темпових тренувань",
    historyTempoComparisonOnly: "Є одне попереднє схоже тренування — доступне пряме порівняння.",
    historyTempoFaster: "швидше на {value} с/км",
    historyTempoSlower: "повільніше на {value} с/км",
    historyTempoHrLower: "нижче на {value} уд/хв",
    historyTempoHrHigher: "вище на {value} уд/хв",
    historyTempoNoChange: "без суттєвої зміни",
    historyIntervalDynamics: "Динаміка інтервальних тренувань",
    historyIntervalHint: "Порівнюємо інтервальні тренування з робочими відрізками однакової довжини.",
    historyIntervalNoTrend: "Поки недостатньо схожих інтервальних тренувань для надійного висновку.",
    historyIntervalPace: "Середній темп робочих відрізків",
    historyIntervalHr: "Середній пульс робочих відрізків",
    historyIntervalVolume: "Обсяг швидкої роботи",
    historyIntervalStructure: "Серія",
    historyIntervalLatest: "Останні інтервали",
    historyIntervalPrevious: "Попередні схожі",
    historyIntervalImproved: "Інтервальна форма покращується",
    historyIntervalStable: "Інтервальна форма стабільна",
    historyIntervalDeclined: "Є ознаки погіршення інтервальної форми",
    historyIntervalCompared: "На основі {count} схожих інтервальних тренувань",
    historyIntervalComparisonOnly: "Є одне попереднє схоже тренування — доступне пряме порівняння.",
    historyIntervalFaster: "швидше на {value} с/км",
    historyIntervalSlower: "повільніше на {value} с/км",
    historyIntervalHrLower: "нижче на {value} уд/хв",
    historyIntervalHrHigher: "вище на {value} уд/хв",
    historyIntervalNoChange: "без суттєвої зміни",
    historyLongDynamics: "Динаміка довгих тренувань",
    historyLongHint: "Порівнюємо звичайні довгі окремо від довгих із роботою, лише з близькими за структурою тренуваннями.",
    historyLongNoTrend: "Поки недостатньо схожих довгих тренувань для надійного висновку.",
    historyLongSimple: "Звичайні довгі",
    historyLongWithWork: "Довгі з роботою",
    historyLongPace: "Середній темп",
    historyLongHr: "Середній пульс",
    historyLongDistance: "Дистанція",
    historyLongWork: "Робочий блок",
    historyLongImproved: "Динаміка покращується",
    historyLongStable: "Динаміка стабільна",
    historyLongDeclined: "Є ознаки погіршення",
    historyLongCompared: "На основі {count} схожих довгих тренувань",
    historyLongComparisonOnly: "Є одне попереднє схоже тренування — доступне пряме порівняння.",
    historyLongFaster: "швидше на {value} с/км",
    historyLongSlower: "повільніше на {value} с/км",
    historyLongHrLower: "нижче на {value} уд/хв",
    historyLongHrHigher: "вище на {value} уд/хв",
    historyLongNoChange: "без суттєвої зміни",
    historyLongLatest: "Останнє тренування",
    historyLongPrevious: "Попереднє схоже",
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
    workoutTempo: "Темповий біг",
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
    homeNav: "Home",
    historyNavShort: "Workouts",
    toolsNav: "TOOLS",
    homeEyebrow: "YOUR RUNORY",
    homeTitle: "Your running — short and clear.",
    homeCopy: "Your latest workout, form changes, and what is happening this week.",
    homeLatest: "LATEST WORKOUT",
    homeLatestEmpty: "No saved workouts yet.",
    homeLatestEmptyCopy: "Add your first workout using the plus button above.",
    homeViewWorkout: "View workout",
    homeInsightSaved: "Workout analysis is saved in your history.",
    homeInsightWorkout: "Workout saved in Runory.",
    homeForm: "WHAT IS HAPPENING WITH YOUR FORM",
    homeViewDynamics: "View dynamics",
    homeWeek: "THIS WEEK",
    homeWeekWorkouts: "workouts",
    homeWeekDistance: "km",
    homeWeekTime: "h",
    homeWeekEmpty: "No workouts this week yet.",
    homeNoTrend: "Not enough data",
    homeEasy: "Easy",
    homeTempo: "Tempo",
    homeIntervals: "Intervals",
    homeLong: "Long",
    homeComparisonOnly: "Direct comparison available",
    navCalculator: "Running calculator",
    calcPageTitle: "Runory — running calculator",
    calcHeroTitle: "Plan your run with numbers.",
    calcHeroCopy: "Enter two values — Runory will calculate the third instantly.",
    calculatorEyebrow: "RUNNER'S TOOL",
    calculatorType: "Calculation type",
    tabTime: "Find time",
    tabDistance: "Find distance",
    tabPace: "Find pace",
    timeEyebrow: "DISTANCE + PACE",
    timeTitle: "What will the time be?",
    timeDescription: "Enter the distance and target pace.",
    timeLabel: "Your estimated time",
    distanceEyebrow: "TIME + PACE",
    distanceTitle: "What will the distance be?",
    distanceDescription: "Enter the time you have and your pace.",
    distanceLabel: "Your estimated distance",
    paceEyebrow: "DISTANCE + TIME",
    paceTitle: "What pace do you need?",
    paceDescription: "Enter the distance and target finish time.",
    paceLabel: "Your required pace",
    exampleDistance: "For example, 21.1",
    hours: "hr",
    minutesShort: "min",
    secondsShort: "sec",
    calculate: "Calculate",
    resultTime: "Your estimated time",
    checkValues: "Check the entered values",
    rangeError: "Minutes and seconds must be between 0 and 59.",
    perKm: "/ km",
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
    dynamicsNav: "Dynamics",
    dynamicsTitle: "Running form dynamics",
    dynamicsCopy: "Compare similar workouts to see how your form changes over time.",
    dynamicsEasy: "Easy",
    dynamicsTempo: "Tempo",
    dynamicsIntervals: "Intervals",
    dynamicsLong: "Long",
    dynamicsComingSoon: "Coming soon",
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
    historyEasyDynamics: "Easy run dynamics",
    historyEasyDynamicsHint: "We compare only similar workouts, not every run in a row.",
    historyEasyPaceAtHr: "Pace at a similar heart rate",
    historyEasyHrAtPace: "Heart rate at a similar pace",
    historyEasyNoTrend: "Not enough similar workouts for a reliable conclusion yet.",
    historyEasyImproved: "Indicators are improving",
    historyEasyStable: "Stable level",
    historyEasyDeclined: "Signs of decline",
    historyEasyCurrentBetter: "The latest result is better than the typical level",
    historyEasyCurrentWorse: "The latest result is below the typical level",
    historyEasyMixed: "The indicators are mixed",
    historyEasyNearTypical: "The result is close to the typical level",
    historyEasyTrendHint: "More similar workouts are needed for a confident trend conclusion.",
    historyEasyCompared: "Based on {count} similar workouts",
    historyEasyComparisonOnly: "One previous similar workout is available — direct comparison is available.",
    historyTempoDynamics: "Tempo workout dynamics",
    historyTempoHint: "We compare only continuous tempo workouts with a similar work volume.",
    historyTempoNoTrend: "Not enough similar tempo workouts for a reliable conclusion yet.",
    historyTempoPace: "Average tempo-work pace",
    historyTempoHr: "Average tempo-work heart rate",
    historyTempoVolume: "Tempo-work volume",
    historyTempoLatest: "Latest tempo",
    historyTempoPrevious: "Previous similar",
    historyTempoImproved: "Tempo fitness is improving",
    historyTempoStable: "Tempo fitness is stable",
    historyTempoDeclined: "Signs of declining tempo fitness",
    historyTempoCompared: "Based on {count} similar tempo workouts",
    historyTempoComparisonOnly: "One previous similar workout is available — direct comparison is available.",
    historyTempoFaster: "{value} sec/km faster",
    historyTempoSlower: "{value} sec/km slower",
    historyTempoHrLower: "{value} bpm lower",
    historyTempoHrHigher: "{value} bpm higher",
    historyTempoNoChange: "no meaningful change",
    historyIntervalDynamics: "Interval workout dynamics",
    historyIntervalHint: "We compare interval workouts with work repetitions of the same distance.",
    historyIntervalNoTrend: "Not enough similar interval workouts for a reliable conclusion yet.",
    historyIntervalPace: "Average work-repetition pace",
    historyIntervalHr: "Average work-repetition heart rate",
    historyIntervalVolume: "Fast-work volume",
    historyIntervalStructure: "Set",
    historyIntervalLatest: "Latest intervals",
    historyIntervalPrevious: "Previous similar",
    historyIntervalImproved: "Interval fitness is improving",
    historyIntervalStable: "Interval fitness is stable",
    historyIntervalDeclined: "Signs of declining interval fitness",
    historyIntervalCompared: "Based on {count} similar interval workouts",
    historyIntervalComparisonOnly: "One previous similar workout is available — direct comparison is available.",
    historyIntervalFaster: "{value} sec/km faster",
    historyIntervalSlower: "{value} sec/km slower",
    historyIntervalHrLower: "{value} bpm lower",
    historyIntervalHrHigher: "{value} bpm higher",
    historyIntervalNoChange: "no meaningful change",
    historyLongDynamics: "Long-run dynamics",
    historyLongHint: "We compare ordinary long runs separately from long runs with work, using only structurally similar sessions.",
    historyLongNoTrend: "Not enough similar long runs for a reliable conclusion yet.",
    historyLongSimple: "Ordinary long runs",
    historyLongWithWork: "Long runs with work",
    historyLongPace: "Average pace",
    historyLongHr: "Average heart rate",
    historyLongDistance: "Distance",
    historyLongWork: "Work block",
    historyLongImproved: "Long-run dynamics are improving",
    historyLongStable: "Long-run dynamics are stable",
    historyLongDeclined: "Signs of declining dynamics",
    historyLongCompared: "Based on {count} similar long runs",
    historyLongComparisonOnly: "One previous similar workout is available — direct comparison is available.",
    historyLongFaster: "{value} sec/km faster",
    historyLongSlower: "{value} sec/km slower",
    historyLongHrLower: "{value} bpm lower",
    historyLongHrHigher: "{value} bpm higher",
    historyLongNoChange: "no meaningful change",
    historyLongLatest: "Latest workout",
    historyLongPrevious: "Previous similar",
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
    workoutTempo: "Tempo run",
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

  const title = document.querySelector("#calculator")?.classList.contains("is-active")
    ? t("calcPageTitle")
    : (currentLanguage === "uk" ? "Runory — аналіз тренувань" : "Runory — workout analysis");
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

  updateThemeToggle();

  if (currentWorkout) renderSummary(currentWorkout);
  if (document.querySelector("#home")?.classList.contains("is-active") || document.querySelector("#history")?.classList.contains("is-active") || document.querySelector("#dynamics")?.classList.contains("is-active")) {
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
  refreshCalculatorLanguage();
}


const RUNORY_ICON_HOME = "data:image/png;base64,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";
const RUNORY_ICON_RUN = "data:image/png;base64,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";
const RUNORY_ICON_DYNAMICS = "data:image/png;base64,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";
const RUNORY_ICON_CALCULATOR = "data:image/png;base64,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";
const RUNORY_ICON_SHOE = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAQtUlEQVR42u1aeZRcZZX/3e8ttXT1Ut1JQ0I2khDSVSE49Ig4Kg0SUXAUFKtmMopOTCctoGQnKnNOdR8dRLN0EiLYZgWXo1XBE0YHB0VCm3EUNIKTVHUnBGLInl6qq7rW99733fmjq0KTBIgOInOmfufUP3Vevbr3993ld+97QAUVVFBBBRVUUEEFFVRQQQX//6C9Bf9BoWhUGxsIaIfvaiTEEhXWQ9Go9naxhS7oKmZqaW8/Y3R3MMEIx+QF3JsBoOnhDXOEpjUIVi/svf0Lz5W/RyQi0NGh3tYEhKJRLRYOn+vsGxkfiYjm8eO1nJZ51PD7P0K6DpXPQxWKz7NUGxLzF28DgJZIRO/u6HDejgScOcGZXWvHCbdxI7NsFprhVtncd3s+t+KXr0VC2ammzWs/52oc85DV178Piv4DAu/VfFXXAIAsFHZx0flCz8KlcUQiAgD+GtFArxXyIAKYEdy+4csQtMLw19WyGrHPSWekI+05++cteRrRkHZOOpRS5vTE2r1alfcyJ5N5V++C5XsAILip8zro4lHh9dTLfCEP5pWJeYseGEWcLBF/5gD+khDnrdqxmGju6tKbtnTu0OvrvspKee2+wU3W4OCtVv/APcJtakJh0zXRNR7EAwweRWQkIkDEJy7xTdRMc6bMZP/Q27rs9y2RiA6AmPgW4XbVy0x2gKWjG/V1G4Lb1//i8q1rriilApeKJIOZ3nICQtGQiIXDMkvDq12NYz5uDw7t1Vhrjs9fvLDns0sf62ldtspJZX5ijm2YnkrzXejoUC3tkXOqOhk6MxhEwgARJ6dNcwW2rdthXjR2sbKsw05yaCZBvsMZSj8rXK73a8L4deDhDV8MRCJmLByWiER0EL1SLN+SFIhGNYTDKrCt80phup5jqfqUlX9nT+uKw81dXUbef5wScTiBSfUzhct4jqXMyII9q3fhkpOIxQTKxTISEYEgdE7XPqv7qq6U2cxyMG4xx130PvvUwPOOnf+0WVd/LVL5x/YeW3S8afK6A5rbNU33VcE61feMItGtu82POY4zt/fQ4HN/ydrwKmZDpQyGwlKtqgqyUFze07ri8DVr1nim+v0qEWq3Q8EgJeYvSji5/ENGfV09adgIIkY4LFt2RfRyj0+EOyyh1ErlOI4w3auNhvr3WX0DTziqcK0wzDrXhHEbHaHmNk1c/VXTXztN5vLPW6f6oqLK+y7dZd5Dun6Z5jhT0NGhZm1fNzsQjZhgppZdEf3NjAg6u601bV41mYTRS0IQmBdIIR7v/cwXBkZX+L5gUKj8qWpynGeMutpp9lBq4/CQuufosmV5AGju6jJyruIcYiwWpnEj27Zk5q8l5i2KAFDTv7O+xuWoq5SU/2jU+dtkNnucVaEZyrxJuF2b2LY14TLh5HJHwfRb3ef9mJPN394zf/F33+wI0M84BohuQAH6fK3K62aloLndj3ByaCi4ff3jzGKnpdTT3fMX9ZV+MhDYtOZDMpP9leZxf74ahQ8FNq/tBuDKUe4aw1c9nTQdTir9jJT2yt75y7rBTIFYu5kIL0rP7Fo12aitaZO5/JCVs29+4Y57Tga2dG4EK0069lx2nFmay3UviCawlADzjNmPrKpypP5PUuKX+2suOdicTIo9C49L0J+fIjS650/ets1dpYYOQpBfKb6DwNeTEB83G+prAMDqG8wC6ucM+h2DBQHvIBIfFaahs2LoNT5AMZxUGiDxFFhuis9bHAWgQtGo9lIyKfa0tdkzH1o91/BXf59tx5LD2Q/33HnPk4iGtMDwe97NUlHPwqW7A1s7v6R5vfc52WyOhOYlIigpD5pj6qdb/QNf75m/9ItvWgqcES5b196ie6t2OtncUeji8yzcz0JZliC+EhKfAKvbDH9dI5kGwAy2LDjD2aPSLnYC+s+IeCIEWTD0gz2f+vzh0enVAojujg6nqesbczRv1U+gCZcznJnb27biBy27Inr39a+owVA0qsWHjz4l3J5ZXCx+iKVsINOIkab7IAgqX/gvxdyhCe0TrGR3Yv6S7zfv+ba+52/bnD9VO+gA0BgMMgCQwqfBDM3jnqDXVO90hlJQUu0hQTuVkg8Lr/k1O5Uex+ApxORliCOGVvhNvHVFtnS/faPFUCgWE7FwWIaCQYqFw07Tg6v/RrhdUeF2uezB1KLethU/aO5aaHRf32GXu1AIQCwcloHoxg/bh07W7F/Zcbxpc+fXjNoanzWQPEiKh4XH/Xew7Se0Gh/sVHo6iL63B7DLh4nrSjY8PeJbLB5ntHcw6FxyqKT6eObDDzSQlIeJuQCl7oYQV0OIG4Shz9L9dWDLgp1MnQCwE7rYkfj03bvKbI+0SD95kkme6verWDzOZ1pXSSle/lDnFN2jdes11ZOK/YP/2rtw2b+cffKvNVPMnFR7r15V9WFVzIcVtKxQ6rdC1y8FAexIMPMTgnnDPt/4J3C+ueXMoURESztEd3u7LGsMKhsR3LzuNn2Mf4fdP/DdROvS28u/ueI7D17uONb1BNwM4Aazod7LzHCGMzlVKH65Z/6SDWcES1lLlAkodZaZD9zXIHzeXUa9/wrr9MCmngVLF54le88vxwG86t4AAlvWfsM98ZIVhZeP7wY4xkK7w/TXNDEznOTQPgZ+RqAUmJME0UdEJ5ShHUu7i8eOhke61Oiud6YLKMIHQQQm/LglEtExBXr3vI7C3tvv3A9gP4BvzX5kVaM1mLyWFd+qezw3MazxIOLAlnXvFVWedwmr+KP/DocPAUDLroje/TTU5G3b3IJTj5oN9VdYff07e1qXtIVqJ2ixUEiio+O183W04+V0iseZFB4rDgy5HI/8yoFPLu9v7opsKQzxR5nEZ0loczS3axaZBoRpAsxQjgPkCqjJaP2B7eufYRI/yR4/9sOXv9SRRCQiqJQGaNrSmRCGMUPZhak9rSsOlxhiRCJ0pkWOUmSB6EZfInRXFkTctGXtDu+lk2/L/fGIJQR9H4ofjH928W8BILC580dmY8PHiv0D/1nrUzf+JrS0gPZ2+rPU3euM4LMfWVVlO8YmvboqLFPDPwPh50Q0kZknMNN4ECZpLnMiaRqU4xxSeeszPQuX7iYAmP3gqkbHbRxjpY70HEnNwMhQcu40Vj4JAAiHZXlqDG5dPQGaeRcz/tmsr7vIyWShcoXNDGiGv3aek87sE87wnH0L7j315y5BRu8l3rFl/VhLoBlETVBqChizAb5Kr6mukYWC4kLx3YkFy54ddVgXU07dwcDdRFSnVXnhpNL9ROZVNJJXqwKatyYus7knE61LPlCuxqfHxglPA93BIOPsSloqnqONnPnwAw2aUreDsFj3102W2RzYluliLv/ug3esSAQiETPR0WH9SZ6PqgVXbFk7Ver63cT8Kb26ukHZ9kiYFy0w8zHSxBMqm7u/546VLwS2bbwYkDcQEGbgZsNfq8tMFqpo7YZSGd1fd5M9lP4mAcDMzatmGb6avTKT2Y2a9JxE+HWMZFAoFhWn43Ea3ULLIgcApnbdX+txee9i8D2ay1WrisXd0rJbexcuP3De/cEFhHxga+dS0rR2o95fXTw9kCVW3SD6IHStyI7zLTA9RspOk+G6goGPgPkDRn1dHZhhp9LHAewgpmh83t2/mv6d9RNcLF5i2+4jALh889erBYyDQtfHsiOPM+GPxPQiC36BGC8qIQ5pbv1Y5mJv3+Hr5xVez+ZANGImQu02iHjm5nWzhMA3zTH119qDQyekU7yxt3XFvgtKg9I1U7vur3Ub7u2Gv+5WJ51WUFgldN649/ZFRwNbOlfpNb7lLBVYSgiPG8I0wbYNeyiVAtNPBdEPbZn/xf7WlcPliJq+YYNpVDkHhG5MIgB02fY14w02EgB7oVReeNzVmscN0vWRELMsyEwOLOVpAC8DfIiZXiTgJcX0Rw18VHhdJ/d+8s7k+Xxp2rJujVFXs9QeSh00Bd6pW94sAPiOH+dXhEo7g2gkxkrOz+haPcYw9H83xtRfbQ0k97FSrT3zlzwzanSXTVvX3yI0cStLOZ6BtBDUo3T6NUt6dvQQN339ehcuAw7evKjYEonopyfUHidN+KkUXivNixrvt06eXl9wvBGfJz9ROnyJUnQpEaYBmA7wVIAmCVOvE14vhGmMEGo7kCPLzhzAx0B0mJkOkcBLkOoISBy2LXlIN+hb5tiGv7f6kvf2tC6+742WqalCQRhe+aRrXON7i339T0nL+YcDbcv7A9GImUBQIhRSb9RNApGImQCcs68JbF37Ga3Kt10OZ39Pk7dtc3tlcq/m8UzlXGFWfMGSntcO740+ysmLFNQlQmKKEpgKhelUIgfAOK3KK4TbBdK0keixbchMDsq2M8I0fGw7/Qx6FOAjYH5ZgI+CxcmiEP1m9WCqXH8Cm9d+1RjbcK81mPxxz7zFH30tm1p2RfTGvlIUnY+MSERcPqVukkb6bGLZwqA5AGaTrtkoFudScPO627S66h1WcujJ3talN7a0t2vdgAoFg1QudN3BIL+uxCzlPrJj6wH7YlI0AYRJCjyVmC4FMIXB48FcK0zTo9f4XiHIcaDyRch8wSHCaQAnGHwMwPuFYZpsWfcp4HeCRIoUD0CTGam5cmx7LJ+Uck9bW+5MF/r26hlk6BNJ8kQIng5FARBmkRCX6f5akKbB7h8EmQbLfHFXT+uSG3QmXs5QUtPEahBxpquLQn4/xUIhhXD4HB2A9nZCMEgt8TjhOqCxL8ixUEgliCwAJ0uf588maPK2be4aPT3GBjfKZHocKTkJoMmCMEkpnkjElzCoURj6eN3jaWZnZEQQNdXtIIBtG8qywZYFsh2LkM4Vqj3ctLlza0/rkuXBres/otX4/g1EEIYBEKCKFpxUmpmx3x5KP0uOekxBtZm+ug/IYuGnYJDOzFfBlhqEtji4bW1mz7y2X+0Zpetb4nHqDgYZoZAqFSkFAN0A0HHWYBWJENqBUCxIr9IQ4bA6PG9eAcDR0ue8uX/llLoaBvudbG4sM8ZDyXGUzTUyUSMYjSAeA0YdQDUgmAToJHikK0l1UGZzO1k6GTBeJkEvAfwiec0X43PvOlKaIxZqXu8NTnLopLTVdoBBwU1r38OGvt701zU7mSyUbT8OVts103zyvFU9EhFnIuBCcR2QOTCeACDv95PlO0H2qUECACNdz7Vut9rj96s3SrMymru6DAAGAOxpa8u90dOl4MOdTaxEh15bE5KZjMWFwk2JhSueQjSkUblaYkr9AiK6W6+tngEAVjI1KICnAOySRL/XHT60rzXZ979ZP71VCEQjpjZcO0EJcTWDPg7gE2aDn+yhoQMqk2/tuXPl7rIgI3BElJ2asGaNp3aseTMrNRfMNxq1tdVk6FD5AuzhjA3mowCOEdDHhBSAIjHeWkLEWRKZR+Q4EwSx8DDxxQRcCqLLjHo/AIYzlD7BQFehmFv3UtsXU2UN8aqdYCgaFaMfgs74XtcYzS6+UwDXKKWuJsZMgCcIt1sXLmOkihNd8APmvzwYUKW2m80pEL1AhF+zEI8b0vn5H+YtGSovRUZHMZ3nZQYRC8X57FBviUT05DRfvZKuegdcR+AqONIlBItRy+W/GhRYClYF1kRS6Xyq91NLTo4e1kLRqBYbKeR8YU+HS6Pv6bFx6n761buA/2svYpzP8T/tBYlX9oco64DQ29TpWCjOaAdK2yZGBRVUUEEFFVRQQQUVVFBBBRWcg/8BcXvJ8BhZJnoAAAAASUVORK5CYII=";

function applyRunoryIcons() {
  const iconByView = {
    home: RUNORY_ICON_HOME,
    history: RUNORY_ICON_RUN,
    dynamics: RUNORY_ICON_DYNAMICS,
    calculator: RUNORY_ICON_CALCULATOR
  };

  document.querySelectorAll(".account-sidebar-link[data-view-target]").forEach(link => {
    const target = link.dataset.viewTarget;
    const icon = link.querySelector(".account-sidebar-icon");
    if (!icon || !iconByView[target]) return;
    icon.textContent = "";
    const image = document.createElement("img");
    image.src = iconByView[target];
    image.alt = "";
    image.setAttribute("aria-hidden", "true");
    image.className = "runory-nav-icon";
    icon.appendChild(image);
  });

  if (!document.querySelector("#runory-icon-styles")) {
    const style = document.createElement("style");
    style.id = "runory-icon-styles";
    style.textContent = `
      .account-sidebar-icon .runory-nav-icon {
        width: 19px !important;
        height: 19px !important;
        display: block !important;
        object-fit: contain !important;
      }
      .home-recent-icon .runory-workout-icon {
        width: 25px !important;
        height: 25px !important;
        display: block !important;
        object-fit: contain !important;
      }
      .history-workout-mark .runory-workout-icon {
        width: 23px !important;
        height: 23px !important;
        display: block !important;
        object-fit: contain !important;
      }
      .account-sidebar-icon {
        color: #2A9D8F !important;
      }
      .account-sidebar-link.is-active .account-sidebar-icon {
        background: rgba(42,157,143,.12) !important;
        color: #2A9D8F !important;
      }
      .history-workout-mark {
        color: #2A9D8F !important;
      }
    
       /* Unified Runory history rows — stable desktop/mobile grid */
       .history-item {
         display: grid !important;
         grid-template-columns: 48px minmax(0, 1fr) 150px auto !important;
         align-items: center !important;
         column-gap: 12px !important;
         padding: 16px 20px !important;
         box-sizing: border-box !important;
       }
       .history-workout-mark {
         position: static !important;
         width: 48px !important;
         height: 48px !important;
         min-width: 48px !important;
         min-height: 48px !important;
         margin: 0 !important;
         padding: 0 !important;
         display: grid !important;
         place-items: center !important;
         align-self: center !important;
         justify-self: center !important;
         box-sizing: border-box !important;
         grid-column: 1 !important;
         grid-row: 1 !important;
       }
       .history-workout-mark .runory-workout-icon {
         width: 23px !important;
         height: 23px !important;
         display: block !important;
         object-fit: contain !important;
         margin: 0 !important;
       }
       .history-item-main {
         min-width: 0 !important;
         width: 100% !important;
         grid-column: 2 !important;
         grid-row: 1 !important;
       }
       .history-item-heading {
         display: block !important;
         width: 100% !important;
         margin: 0 !important;
       }
       .history-item-heading > div {
         min-width: 0 !important;
       }
       .history-distance {
         grid-column: 3 !important;
         grid-row: 1 !important;
         width: 150px !important;
         min-width: 150px !important;
         margin: 0 !important;
         display: flex !important;
         align-items: center !important;
         justify-content: center !important;
         text-align: center !important;
         white-space: nowrap !important;
         font-variant-numeric: tabular-nums !important;
         align-self: center !important;
       }
       .history-item-actions {
         grid-column: 4 !important;
         grid-row: 1 !important;
         display: flex !important;
         align-items: center !important;
         justify-content: flex-end !important;
         gap: 10px !important;
         min-width: max-content !important;
         margin: 0 !important;
         align-self: center !important;
       }

       @media (max-width: 900px) {
         .history-item {
           grid-template-columns: 48px minmax(0, 1fr) !important;
           column-gap: 16px !important;
           row-gap: 14px !important;
           padding: 16px !important;
         }
         .history-workout-mark {
           position: static !important;
           grid-column: 1 !important;
           grid-row: 1 / span 3 !important;
           align-self: start !important;
         }
         .history-item-main {
           grid-column: 2 !important;
           grid-row: 1 !important;
         }
         .history-distance {
           grid-column: 2 !important;
           grid-row: 2 !important;
           width: auto !important;
           min-width: 0 !important;
           justify-content: flex-start !important;
           text-align: left !important;
           font-size: 28px !important;
         }
         .history-item-actions {
           grid-column: 2 !important;
           grid-row: 3 !important;
           justify-content: flex-start !important;
         }
       }

       @media (max-width: 560px) {
         .history-item {
           grid-template-columns: 44px minmax(0, 1fr) !important;
           column-gap: 12px !important;
           row-gap: 12px !important;
           padding: 14px !important;
         }
         .history-workout-mark {
           position: static !important;
           width: 44px !important;
           height: 44px !important;
           min-width: 44px !important;
           min-height: 44px !important;
         }
         .history-distance {
           font-size: 26px !important;
         }
         .history-item-actions {
           justify-content: flex-start !important;
         }
       }
`;
    document.head.appendChild(style);
  }
}

applyRunoryIcons();

function routeForView(viewName) {
  const map = { home: "/", history: "/workouts", dynamics: "/progress", profile: "/account", calculator: "/calculator" };
  return map[viewName] || "/";
}

function currentRouteWorkoutId() {
  const match = window.location.pathname.match(/^\/workouts\/([^/]+)$/);
  return match ? decodeURIComponent(match[1]) : null;
}


/* === Runory theme + view reset === */
const RUNORY_THEME_KEY = "runory-theme";

function getRunoryTheme() {
  const stored = localStorage.getItem(RUNORY_THEME_KEY);
  return stored === "dark" || stored === "light" ? stored : "light";
}

function updateThemeToggle() {
  const button = document.querySelector("#runoryThemeToggle");
  if (!button) return;
  const dark = document.documentElement.dataset.theme === "dark";
  button.classList.toggle("is-dark", dark);
  button.setAttribute("aria-pressed", String(dark));
  const label = dark
    ? (currentLanguage === "uk" ? "Увімкнути світлу тему" : "Switch to light theme")
    : (currentLanguage === "uk" ? "Увімкнути темну тему" : "Switch to dark theme");
  button.setAttribute("aria-label", label);
  button.setAttribute("title", label);
  button.innerHTML = dark
    ? '<span aria-hidden="true">☀</span>'
    : '<span aria-hidden="true">☾</span>';
}

function setRunoryTheme(theme, persist = true) {
  const next = theme === "dark" ? "dark" : "light";
  document.documentElement.dataset.theme = next;
  document.documentElement.style.colorScheme = next;
  if (persist) localStorage.setItem(RUNORY_THEME_KEY, next);
  updateThemeToggle();
}

function initRunoryTheme() {
  if (!document.documentElement.dataset.theme) {
    setRunoryTheme(getRunoryTheme(), false);
  }

  const languageSwitcher = document.querySelector(".language-switcher");
  const topbarRight = document.querySelector(".topbar-right");
  if (!languageSwitcher || !topbarRight) {
    updateThemeToggle();
    return;
  }

  let button = document.querySelector("#runoryThemeToggle");
  if (!button) {
    button = document.createElement("button");
    button.type = "button";
    button.id = "runoryThemeToggle";
    button.className = "runory-theme-toggle";
    button.addEventListener("click", () => {
      const dark = document.documentElement.dataset.theme === "dark";
      setRunoryTheme(dark ? "light" : "dark");
    });
    topbarRight.appendChild(button);
  }
  updateThemeToggle();
}

function resetRunoryScroll() {
  window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
  document.querySelectorAll(".app-content, .main-content, .content-area").forEach(element => {
    if (element.scrollTop) element.scrollTop = 0;
  });
}

function injectRunoryThemeStyles() {
  if (document.querySelector("#runory-theme-styles")) return;
  const style = document.createElement("style");
  style.id = "runory-theme-styles";
  style.textContent = `
    :root {
      color-scheme: light;
      --runory-dark-canvas: #111615;
      --runory-dark-surface: #181e1c;
      --runory-dark-surface-2: #202725;
      --runory-dark-line: #303a36;
      --runory-dark-ink: #f2f5f3;
      --runory-dark-muted: #a4afaa;
      --runory-dark-soft: #252d2a;
    }

    .topbar { position: relative !important; }
    .topbar-right { position: static !important; }
    .runory-theme-toggle {
      width: 44px !important;
      height: 34px !important;
      min-width: 44px !important;
      padding: 0 !important;
      margin: 0 !important;
      border: 1px solid var(--line) !important;
      border-radius: 10px !important;
      background: var(--white) !important;
      color: var(--ink) !important;
      display: grid !important;
      place-items: center !important;
      font: 700 17px/1 Manrope, sans-serif !important;
      cursor: pointer !important;
      transition: background .16s ease, color .16s ease, border-color .16s ease, transform .16s ease !important;
      position: absolute !important;
      right: 0 !important;
      top: calc(100% + 10px) !important;
      z-index: 50 !important;
    }
    .runory-theme-toggle:hover { transform: translateY(-1px) !important; border-color: #b8c3bc !important; }
    .runory-theme-toggle.is-dark { background: #252d2a !important; color: #f4f7f5 !important; border-color: #394540 !important; }
    .runory-theme-toggle span { display:block !important; transform: translateY(-1px); }

    html[data-theme="dark"] {
      color-scheme: dark;
      --canvas: var(--runory-dark-canvas) !important;
      --white: var(--runory-dark-surface) !important;
      --ink: var(--runory-dark-ink) !important;
      --muted: var(--runory-dark-muted) !important;
      --line: var(--runory-dark-line) !important;
      --soft: var(--runory-dark-soft) !important;
      --soft-lime: #203532 !important;
      --runory-primary-light: #203532 !important;
    }

    html[data-theme="dark"] body,
    html[data-theme="dark"] .page-shell { background: var(--runory-dark-canvas) !important; color: var(--runory-dark-ink) !important; }
    html[data-theme="dark"] .topbar { border-color: var(--runory-dark-line) !important; }
    html[data-theme="dark"] .brand,
    html[data-theme="dark"] .brand-logo { color: var(--runory-dark-ink) !important; }
    html[data-theme="dark"] .brand-logo { filter: brightness(0) invert(1) !important; opacity: .96 !important; }
    html[data-theme="dark"] .brand-mark { background: #f2f5f3 !important; }
    html[data-theme="dark"] .nav-tab { color: #9da9a3 !important; }
    html[data-theme="dark"] .nav-tab:hover { background: #252d2a !important; color: #f2f5f3 !important; }
    html[data-theme="dark"] .nav-tab.is-active { background: #f2f5f3 !important; color: #171b1d !important; }
    html[data-theme="dark"] .eyebrow,
    html[data-theme="dark"] .status-pill,
    html[data-theme="dark"] .account-sidebar-label,
    html[data-theme="dark"] .history-filter-label { color: #95a19b !important; }

    html[data-theme="dark"] .upload-section,
    html[data-theme="dark"] .results,
    html[data-theme="dark"] .home-card,
    html[data-theme="dark"] .home-tool-card,
    html[data-theme="dark"] .history-stat-card,
    html[data-theme="dark"] .history-chart-card,
    html[data-theme="dark"] .history-dynamics-card,
    html[data-theme="dark"] .history-item,
    html[data-theme="dark"] .profile-card,
    html[data-theme="dark"] .calculator-card,
    html[data-theme="dark"] .calculator-panel,
    html[data-theme="dark"] .future-card,
    html[data-theme="dark"] .account-sidebar-link-secondary,
    html[data-theme="dark"] .dynamics-card,
    html[data-theme="dark"] .dynamics-panel { background: var(--runory-dark-surface) !important; color: var(--runory-dark-ink) !important; border-color: var(--runory-dark-line) !important; }

    html[data-theme="dark"] .home-metrics > div,
    html[data-theme="dark"] .home-tool-icon,
    html[data-theme="dark"] .home-recent-icon,
    html[data-theme="dark"] .home-week-stats > div,
    html[data-theme="dark"] .home-week-days span,
    html[data-theme="dark"] .history-workout-mark,
    html[data-theme="dark"] .history-type-icon,
    html[data-theme="dark"] .account-sidebar-icon,
    html[data-theme="dark"] .account-sidebar-toggle { background: var(--runory-dark-soft) !important; border-color: var(--runory-dark-line) !important; color: #9fe0d6 !important; }
    html[data-theme="dark"] .home-tool-card:hover,
    html[data-theme="dark"] .home-recent-item:hover,
    html[data-theme="dark"] .history-item:hover .history-workout-mark { background: #263532 !important; }

    html[data-theme="dark"] .home-recent-item { background: var(--runory-dark-surface) !important; color: var(--runory-dark-ink) !important; border-color: var(--runory-dark-line) !important; }
    html[data-theme="dark"] .home-recent-item:hover { background: #202a27 !important; }
    html[data-theme="dark"] .home-recent-copy strong { color: #f2f5f3 !important; }
    html[data-theme="dark"] .home-recent-copy small { color: #8f9b95 !important; }
    html[data-theme="dark"] .dynamics-module { background: var(--runory-dark-surface) !important; color: var(--runory-dark-ink) !important; border-color: var(--runory-dark-line) !important; }
    html[data-theme="dark"] .dynamics-module .history-dynamic-row { border-color: var(--runory-dark-line) !important; }
    html[data-theme="dark"] .dynamics-module > p,
    html[data-theme="dark"] .dynamics-empty p { color: #8f9b95 !important; }

    html[data-theme="dark"] h1,
    html[data-theme="dark"] h2,
    html[data-theme="dark"] h3,
    html[data-theme="dark"] h4,
    html[data-theme="dark"] strong,
    html[data-theme="dark"] .history-distance,
    html[data-theme="dark"] .home-latest-main > strong { color: #f2f5f3 !important; }
    html[data-theme="dark"] p,
    html[data-theme="dark"] span,
    html[data-theme="dark"] small,
    html[data-theme="dark"] label,
    html[data-theme="dark"] .hero-copy,
    html[data-theme="dark"] .history-copy,
    html[data-theme="dark"] .history-metrics,
    html[data-theme="dark"] .home-form-row span,
    html[data-theme="dark"] .home-insight { color: #a4afaa !important; }

    html[data-theme="dark"] input,
    html[data-theme="dark"] select,
    html[data-theme="dark"] textarea,
    html[data-theme="dark"] .history-filter,
    html[data-theme="dark"] .language-switcher { background: var(--runory-dark-surface-2) !important; color: #f2f5f3 !important; border-color: var(--runory-dark-line) !important; }
    html[data-theme="dark"] .language-button { color: #a4afaa !important; }
    html[data-theme="dark"] .language-button.is-active { background: #f2f5f3 !important; color: #171b1d !important; }
    html[data-theme="dark"] .history-filter:hover,
    html[data-theme="dark"] .dynamics-tab:hover:not(.is-active):not(.is-disabled) { background: #263532 !important; border-color: #3c4a45 !important; color: #f2f5f3 !important; }
    html[data-theme="dark"] .history-filter.is-active,
    html[data-theme="dark"] .dynamics-tab.is-active { background: #f2f5f3 !important; color: #171b1d !important; border-color: #f2f5f3 !important; }

    html[data-theme="dark"] .add-workout-button,
    html[data-theme="dark"] .auth-button,
    html[data-theme="dark"] .home-primary-button,
    html[data-theme="dark"] .history-view-button,
    html[data-theme="dark"] .home-outline-button,
    html[data-theme="dark"] .home-link-button { border-color: #394540 !important; }
    html[data-theme="dark"] .add-workout-button,
    html[data-theme="dark"] .auth-button,
    html[data-theme="dark"] .home-primary-button,
    html[data-theme="dark"] .history-view-button { background: #f2f5f3 !important; color: #171b1d !important; }
    html[data-theme="dark"] .home-outline-button,
    html[data-theme="dark"] .home-link-button { color: #dce5e1 !important; background: transparent !important; }

    html[data-theme="dark"] .account-sidebar-link.is-active,
    html[data-theme="dark"] .account-sidebar-link-secondary.is-active { background: #f2f5f3 !important; color: #171b1d !important; }
    html[data-theme="dark"] .account-sidebar-link.is-active .account-sidebar-icon,
    html[data-theme="dark"] .account-sidebar-link-secondary.is-active .account-sidebar-icon { background: #e0e8e4 !important; color: #238276 !important; }
    html[data-theme="dark"] .account-sidebar-divider { background: var(--runory-dark-line) !important; }

    html[data-theme="dark"] .modal,
    html[data-theme="dark"] .auth-modal,
    html[data-theme="dark"] .auth-modal-card,
    html[data-theme="dark"] .modal-card { background: var(--runory-dark-surface) !important; color: var(--runory-dark-ink) !important; border-color: var(--runory-dark-line) !important; }
    html[data-theme="dark"] .modal-backdrop,
    html[data-theme="dark"] .auth-modal-backdrop { background: rgba(0,0,0,.68) !important; }
    html[data-theme="dark"] table,
    html[data-theme="dark"] th,
    html[data-theme="dark"] td { border-color: var(--runory-dark-line) !important; }
    html[data-theme="dark"] .history-bars { border-color: var(--runory-dark-line) !important; }
    html[data-theme="dark"] .home-heading { border-color: var(--runory-dark-line) !important; }
    html[data-theme="dark"] .home-latest-footer { border-color: var(--runory-dark-line) !important; }
    html[data-theme="dark"] .home-form-row { border-color: var(--runory-dark-line) !important; }
    html[data-theme="dark"] .home-week-days span { background: #202725 !important; border-color: var(--runory-dark-line) !important; }
    html[data-theme="dark"] .home-week-days span::before { color: #8f9b95 !important; }
    html[data-theme="dark"] .home-week-days span::after { background: #44514c !important; }
    html[data-theme="dark"] .home-week-days span.has-workout { background: #203532 !important; border-color: #31524c !important; }
    html[data-theme="dark"] .home-week-days span.has-workout::before { color: #9fe0d6 !important; }
    html[data-theme="dark"] .home-week-days span.has-workout::after { background: #2A9D8F !important; }
    html[data-theme="dark"] .home-week-stats > div { background: #202725 !important; }
    html[data-theme="dark"] .home-metrics > div { background: #202725 !important; border-color: var(--runory-dark-line) !important; }
    html[data-theme="dark"] .home-empty-icon { background: #203532 !important; color: #9fe0d6 !important; }
    html[data-theme="dark"] .history-bar-label,
    html[data-theme="dark"] .history-bar-date { color: #8f9b95 !important; }

    /* Workout history: secondary metrics must stay readable in dark mode. */
    html[data-theme="dark"] .history-metrics { color: #b2bdb7 !important; }
    html[data-theme="dark"] .history-metrics b { color: #d1d9d5 !important; }

    /* Calculator: remove every light/white surface from the dark theme. */
    html[data-theme="dark"] .calculator-card { background: var(--runory-dark-surface) !important; border-color: var(--runory-dark-line) !important; }
    html[data-theme="dark"] .calc-tab {
      background: var(--runory-dark-surface-2) !important;
      color: #d6dfdb !important;
      border-color: var(--runory-dark-line) !important;
    }
    html[data-theme="dark"] .calc-tab:hover,
    html[data-theme="dark"] .calc-tab:focus-visible {
      background: #2a3733 !important;
      color: #f2f5f3 !important;
      border-color: #4a5b54 !important;
      outline: none !important;
    }
    html[data-theme="dark"] .calc-tab.is-active,
    html[data-theme="dark"] .calc-tab.is-active:hover,
    html[data-theme="dark"] .calc-tab.is-active:focus-visible {
      background: #203d39 !important;
      color: #9fe0d6 !important;
      border-color: #4c9d92 !important;
    }
    html[data-theme="dark"] .calc-tab:disabled {
      background: #1b211f !important;
      color: #66716c !important;
      border-color: #2a312e !important;
      opacity: 1 !important;
    }
    html[data-theme="dark"] .calculator-card .calc-field > div,
    html[data-theme="dark"] .calculator-card .split-inputs label {
      background: #202725 !important;
      border-color: var(--runory-dark-line) !important;
    }
    html[data-theme="dark"] .calculator-card .calc-field > div:focus-within,
    html[data-theme="dark"] .calculator-card .split-inputs:focus-within {
      outline-color: #294b46 !important;
      border-color: #2a9d8f !important;
    }
    html[data-theme="dark"] .calculator-card .calc-field input {
      background: transparent !important;
      color: #f2f5f3 !important;
    }
    html[data-theme="dark"] .calculator-card .calc-field input::placeholder { color: #7f8b85 !important; }
    html[data-theme="dark"] .calculator-card .calc-field em,
    html[data-theme="dark"] .calculator-card .split-inputs span { color: #9da9a3 !important; }
    html[data-theme="dark"] .calculator-card .calc-field > span,
    html[data-theme="dark"] .calculator-card .calc-field legend { color: #aeb9b4 !important; }
    html[data-theme="dark"] .calculate-button {
      background: #f2f5f3 !important;
      color: #171b1d !important;
    }
    html[data-theme="dark"] .calculate-button:hover,
    html[data-theme="dark"] .calculate-button:focus-visible {
      background: #dce5e1 !important;
      color: #171b1d !important;
    }
    html[data-theme="dark"] .calculate-button:disabled {
      background: #2a312e !important;
      color: #77837d !important;
      opacity: 1 !important;
    }
    html[data-theme="dark"] .calculation-result {
      background: #203532 !important;
      border: 1px solid #31524c !important;
    }
    html[data-theme="dark"] .calculation-result p { color: #a9d9d2 !important; }
    html[data-theme="dark"] .calculation-result span { color: #9da9a3 !important; }

    @media (max-width: 900px) {
      .runory-theme-toggle { top: calc(100% + 10px) !important; width: 40px !important; height: 32px !important; min-width: 40px !important; }
    }
    @media (max-width: 560px) {
      .runory-theme-toggle { top: calc(100% + 8px) !important; width: 38px !important; height: 30px !important; min-width: 38px !important; border-radius: 9px !important; }
    }
  `;
  document.head.appendChild(style);
}

injectRunoryThemeStyles();
setRunoryTheme(getRunoryTheme(), false);

function navigateToView(viewName, { push = true } = {}) {
  if (push) {
    const target = routeForView(viewName);
    if (window.location.pathname !== target) window.history.pushState({ view: viewName }, "", target);
  }
  setActiveView(viewName, { updateRoute: false });
  resetRunoryScroll();
}

function setActiveView(viewName, { updateRoute = true } = {}) {
  document.querySelectorAll("[data-view-panel]").forEach(panel => {
    panel.classList.toggle("is-active", panel.id === viewName);
  });

  document.querySelectorAll("[data-view-target]").forEach(button => {
    const active = button.dataset.viewTarget === viewName;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-current", active ? "page" : "false");
  });

  if (updateRoute) {
    const target = routeForView(viewName);
    if (window.location.pathname !== target) window.history.pushState({ view: viewName }, "", target);
  }

  if (viewName === "home" || viewName === "history" || viewName === "dynamics") {
    loadWorkoutHistory();
  }

  if (viewName === "calculator") {
    initCalculator();
  }

  if (viewName === "profile") {
    if (currentSession?.user) {
      ensureUserProfile(currentSession.user);
    } else {
      openAuthModal();
      return;
    }
  }

  setMobileSidebar(false);
}

document.querySelectorAll("[data-view-target]").forEach(button => {
  button.addEventListener("click", () => navigateToView(button.dataset.viewTarget));
});

// Runory — logo always returns to Home on desktop and mobile.
// Capture the click at document level so no other header handler can swallow it.
document.addEventListener("click", event => {
  const brand = event.target.closest(".brand");
  if (!brand) return;
  event.preventDefault();
  event.stopPropagation();
  navigateToView("home");
}, true);

function initializeRoute() {
  const workoutId = currentRouteWorkoutId();
  if (workoutId) {
    setActiveView("analysis", { updateRoute: false });
    window.__runoryPendingWorkoutId = workoutId;
    return;
  }
  const path = window.location.pathname.replace(/\/$/, "") || "/";
  const view = path === "/workouts" ? "history" : path === "/progress" ? "dynamics" : path === "/account" ? "profile" : path === "/calculator" ? "calculator" : "home";
  setActiveView(view, { updateRoute: false });
  resetRunoryScroll();
}

window.addEventListener("popstate", () => {
  initializeRoute();
  resetRunoryScroll();
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

// Sidebar starts collapsed by default. It opens only when the user clicks the arrow.
accountSidebar?.classList.add("is-collapsed");

function updateSidebarToggle() {
  const collapsed = accountSidebar?.classList.contains("is-collapsed");
  if (accountSidebarToggle) {
    accountSidebarToggle.setAttribute("aria-expanded", String(!collapsed));
    accountSidebarToggle.setAttribute("aria-label", collapsed ? "Розгорнути меню" : "Згорнути меню");
    accountSidebarToggle.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m14.5 5-7 7 7 7"></path></svg>`;
  }
}

accountSidebarToggle?.addEventListener("click", () => {
  accountSidebar?.classList.toggle("is-collapsed");
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


function weightedMedianByRecency(items, valueGetter) {
  const rows = items
    .map((item, index) => {
      const value = valueGetter(item);
      const date = item?.workout_date ? new Date(item.workout_date) : null;
      const ageDays = date && !Number.isNaN(date.getTime())
        ? Math.max(0, (Date.now() - date.getTime()) / 86400000)
        : index * 7;
      const weight = Math.exp(-ageDays / 45);
      return { value, weight };
    })
    .filter(row => Number.isFinite(row.value) && Number.isFinite(row.weight) && row.weight > 0)
    .sort((a, b) => a.value - b.value);
  if (!rows.length) return null;
  const totalWeight = rows.reduce((sum, row) => sum + row.weight, 0);
  let cumulative = 0;
  for (const row of rows) {
    cumulative += row.weight;
    if (cumulative >= totalWeight / 2) return row.value;
  }
  return rows.at(-1).value;
}

function getPersonalEasyBaseline(summary = null) {
  const history = Array.isArray(historyWorkouts) ? historyWorkouts : [];
  if (!history.length) return null;

  // Use only workouts that are currently stored as ordinary runs. We do not
  // call derivedWorkoutType() here because continuous-tempo detection itself
  // depends on this baseline and would otherwise recurse.
  const easy = history
    .filter(workout => historyTypeClass(workout?.workout_type) === "run")
    .filter(workout => Number.isFinite(Number(workout?.heart_rate)) && paceToSeconds(workout?.pace) != null)
    .filter(workout => Number(workout?.distance_km) >= 5)
    .sort((a, b) => new Date(b.workout_date || b.created_at || 0) - new Date(a.workout_date || a.created_at || 0))
    .slice(0, 12);

  if (easy.length < 3) return null;

  return {
    pace: weightedMedianByRecency(easy, workout => paceToSeconds(workout.pace)),
    hr: weightedMedianByRecency(easy, workout => Number(workout.heart_rate)),
    count: easy.length,
    workouts: easy
  };
}

function detectContinuousTempo(summary, paces) {
  const distance = Number(summary?.distance);
  if (!Number.isFinite(distance) || distance < 5 || paces.length < 5) return null;

  // Explicit Garmin interval structure always wins over inferred continuous tempo.
  const structure = Array.isArray(summary?.structure) ? summary.structure : [];
  if (structure.some(block => block?.type === "intervals" && Array.isArray(block.repetitions) && block.repetitions.length)) {
    return null;
  }

  const sorted = [...paces].sort((a, b) => a - b);
  const medianPace = sorted.length % 2
    ? sorted[Math.floor(sorted.length / 2)]
    : (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2;
  const spread = Math.max(...paces) - Math.min(...paces);
  const mean = paces.reduce((sum, pace) => sum + pace, 0) / paces.length;
  const meanAbsDeviation = paces.reduce((sum, pace) => sum + Math.abs(pace - mean), 0) / paces.length;

  // A continuous tempo should look continuous: no pronounced warm-up/cool-down
  // and no large pace swings between kilometres.
  const edgeCount = Math.max(1, Math.min(2, Math.floor(paces.length / 4)));
  const firstEdge = paces.slice(0, edgeCount).reduce((a, b) => a + b, 0) / edgeCount;
  const lastEdge = paces.slice(-edgeCount).reduce((a, b) => a + b, 0) / edgeCount;
  const edgeDeviation = Math.max(Math.abs(firstEdge - medianPace), Math.abs(lastEdge - medianPace));
  const stableEnough = spread <= Math.max(15, medianPace * 0.055) && meanAbsDeviation <= medianPace * 0.022;
  const continuousFromStart = edgeDeviation <= Math.max(8, medianPace * 0.045);
  if (!stableEnough || !continuousFromStart) return null;

  const baseline = getPersonalEasyBaseline(summary);
  if (!baseline || !Number.isFinite(baseline.pace) || !Number.isFinite(baseline.hr)) return null;

  const averageHr = Number(summary?.heartRate);
  if (!Number.isFinite(averageHr)) return null;

  const paceGain = baseline.pace - mean;
  const hrGap = averageHr - baseline.hr;

  // A faster pace at roughly the same easy HR is not enough for tempo.
  // It may simply reflect improved fitness, terrain, weather, or a good day.
  // Keep it as an ordinary easy run so the personal baseline can adapt over time.
  if (hrGap < 15) return null;

  // Continuous tempo requires both a substantial pace separation from the
  // runner's current easy baseline and a clearly higher cardiovascular load.
  // There is intentionally no separate "steady" category: anything below
  // this threshold remains an easy run.
  const tempoSignal = paceGain >= 45;
  if (!tempoSignal) return null;

  return {
    type: "tempo",
    variant: "continuous",
    tempoStart: 0,
    tempoEnd: paces.length - 1,
    baselinePace: baseline.pace,
    baselineHr: baseline.hr,
    paceGain,
    hrGap
  };
}

function getWorkoutPattern(summary) {
  const distance = Number(summary?.distance);
  const splits = Array.isArray(summary?.splits) ? summary.splits : [];
  const paces = splits
    .map(s => paceToSeconds(s.pace))
    .filter(Number.isFinite);

  const structure = Array.isArray(summary?.structure) ? summary.structure : [];
  const intervalIndex = structure.findIndex(block =>
    block?.type === "intervals"
    && Array.isArray(block.repetitions)
    && block.repetitions.length > 0
  );

  const intervalBlock = intervalIndex >= 0 ? structure[intervalIndex] : null;
  const intervalReps = Array.isArray(intervalBlock?.repetitions) ? intervalBlock.repetitions : [];
  const workDistances = intervalReps
    .map(rep => Number(rep?.work?.distance))
    .filter(Number.isFinite);
  const workDurations = intervalReps
    .map(rep => Number(rep?.work?.duration))
    .filter(Number.isFinite);

  // Garmin can use the same interval structure for short strides and for a
  // real interval session. Treat a block as a true interval workout only
  // when the work itself is substantial. Two long repetitions (e.g. 2×2 km)
  // still count; several very short accelerations do not.
  const substantialIntervalWork =
    (intervalReps.length >= 3
      && workDistances.length === intervalReps.length
      && Math.min(...workDistances) >= 300)
    || (intervalReps.length >= 3
      && workDurations.length === intervalReps.length
      && Math.min(...workDurations) >= 60)
    || (workDistances.length === intervalReps.length
      && workDistances.reduce((sum, value) => sum + value, 0) >= 3000)
    || (workDurations.length === intervalReps.length
      && workDurations.reduce((sum, value) => sum + value, 0) >= 480);

  const hasIntervals = intervalIndex >= 0 && substantialIntervalWork;

  /*
   * A long run with a fast block at the end is still primarily a long run.
   * Examples: 15–18 km easy + 3×3 km / 4×2 km with 1 km recoveries.
   *
   * Do not classify every long interval session this way. We require a
   * substantial continuous running volume before the interval block: at least
   * 12 km and at least ~45% of the whole activity. This keeps workouts such as
   * 2 km warm-up + 5×2 km as interval sessions.
   */
  if (intervalIndex >= 0) {
    if (hasIntervals) {
      const beforeInterval = structure.slice(0, intervalIndex);
    const preWorkDistance = beforeInterval.reduce((sum, block) => {
      if (!block || block.type === "intervals" || block.type === "recovery") return sum;
      return sum + (Number(block.distance) || 0);
    }, 0) / 1000;

    const isLongWithWork =
      distance >= 16
      && preWorkDistance >= 10
      && preWorkDistance / Math.max(distance, 1) >= 0.30;

    if (isLongWithWork) {
      return {
        type: "long",
        variant: "with_work",
        preWorkDistance,
        intervalIndex
      };
    }
    }

    // Short strides before a long continuous block are not a true interval
    // session. Example: warm-up → 5×90 m accelerations → ~50 min steady/tempo
    // work → 5 min faster → recovery/cooldown. In that case the main purpose
    // is continuous tempo, not intervals.
    const reps = intervalReps;
    const shortStrideBlock =
      reps.length >= 3
      && reps.length <= 8
      && workDistances.length === reps.length
      && Math.max(...workDistances) <= 200
      && workDistances.reduce((sum, value) => sum + value, 0) <= 1200;

    if (shortStrideBlock) {
      const following = [];
      for (const block of structure.slice(intervalIndex + 1)) {
        if (!block) continue;
        if (["recovery", "cooldown", "intervals"].includes(block.type)) break;
        if (block.type !== "easy") continue;
        const blockDistance = Number(block.distance) || 0;
        const blockPace = paceToSeconds(block.pace);
        if (blockDistance > 0 && Number.isFinite(blockPace)) following.push(block);
      }

      const mainDistance = following.reduce((sum, block) => sum + (Number(block.distance) || 0), 0) / 1000;
      const mainDuration = following.reduce((sum, block) => sum + (Number(block.duration) || 0), 0);
      const mainPace = mainDistance > 0 && mainDuration > 0
        ? mainDuration / mainDistance
        : null;
      const mainHr = mainDistance > 0
        ? following.reduce((sum, block) => sum + (Number(block.heartRate) || 0) * ((Number(block.distance) || 0) / 1000), 0) / mainDistance
        : null;

      const baseline = getPersonalEasyBaseline(summary);
      const paceGain = baseline && Number.isFinite(mainPace) ? baseline.pace - mainPace : null;
      const hrGap = baseline && Number.isFinite(mainHr) ? mainHr - baseline.hr : null;

      // Require a genuinely long continuous block plus a meaningful HR rise.
      // The pace separation can be smaller than the generic continuous-tempo
      // threshold because the Garmin structure explicitly tells us that the
      // short accelerations were only preparation for the sustained work.
      if (mainDistance >= 7 && Number.isFinite(paceGain) && Number.isFinite(hrGap)
          && paceGain >= 10 && hrGap >= 10) {
        return {
          type: "tempo",
          variant: "after_strides",
          tempoStart: intervalIndex + 1,
          tempoEnd: intervalIndex + following.length,
          baselinePace: baseline.pace,
          baselineHr: baseline.hr,
          paceGain,
          hrGap
        };
      }
    }

    if (hasIntervals) return { type: "intervals" };

    // A Garmin interval block made only of short accelerations is not a
    // standalone interval workout. If it did not form a continuous tempo
    // session above, fall through to ordinary run/long classification.
    return distance >= 16 ? { type: "long" } : { type: "run" };
  }

  const continuousTempo = detectContinuousTempo(summary, paces);
  if (continuousTempo) return continuousTempo;

  if (paces.length < 4) {
    return distance >= 16 ? { type: "long" } : { type: "run" };
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

  if (distance >= 16) return { type: "long" };
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
    recoveries,
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
  const firstWorkDistance = Number(analysis.reps[0]?.work?.distance || 0);
  const repDistanceKm = firstWorkDistance / 1000;
  const repDistanceLabel = Number.isInteger(repDistanceKm)
    ? String(repDistanceKm)
    : repDistanceKm.toFixed(1).replace(".", currentLanguage === "uk" ? "," : ".");
  const workDistanceKm = analysis.totalWorkDistance / 1000;
  const workDistanceLabel = Number.isInteger(workDistanceKm)
    ? String(workDistanceKm)
    : workDistanceKm.toFixed(1).replace(".", currentLanguage === "uk" ? "," : ".");
  const pace = formatInsightPace(analysis.average);
  const spread = Math.round(analysis.spread);

  if (currentLanguage === "uk") {
    const parts = [
      `Інтервальна · ${repsLabel}×${repDistanceLabel} км`,
      `середній темп роботи — ${pace}/км`,
      `розкид темпу — ${spread} с/км`
    ];

    if (analysis.dynamics === "faster") parts.push("останні повторення швидші за перші");
    else if (analysis.dynamics === "slower") parts.push("останні повторення повільніші за перші");
    else parts.push("темп залишався стабільним");

    if (analysis.hrTrend === "rising") parts.push(`ЧСС поступово зростала від першого до останнього повторення${workHrText(summary, bpm)}`);
    else if (analysis.hrTrend === "falling") parts.push("ЧСС знижувалась до кінця серії");
    else if (analysis.hrTrend === "stable") parts.push("ЧСС залишалась стабільною");

    if (analysis.recoveries.length) {
      parts.push(analysis.recoveryTrend === "variable"
        ? "відновлення були нерівномірними"
        : "відновлення залишались стабільними");
    }

    let conclusion;
    if (analysis.dynamics === "slower" && analysis.spread > 10) {
      conclusion = "До кінця серії темп помітно просів — навантаження було високим.";
    } else if (analysis.dynamics === "slower") {
      conclusion = "Наприкінці серії помітне невелике просідання темпу.";
    } else if (analysis.recoveryTrend === "variable") {
      conclusion = "Основна робота була виконана рівно, але відновлення були нестабільними.";
    } else if (analysis.dynamics === "faster" && analysis.spread <= 8) {
      conclusion = "Серію виконано рівно, з хорошим прискоренням наприкінці.";
    } else if (analysis.spread > 12) {
      conclusion = "Темп помітно коливався між повтореннями — робота була нерівномірною.";
    } else {
      conclusion = "Роботу виконано контрольовано.";
    }

    parts.push(`загальний обсяг швидкої роботи — ${workDistanceLabel} ${unit}`);
    return `${parts.join(" · ")}. ${conclusion.replace("Робота виконана", "Роботу виконано")}`;
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
  else if (analysis.hrTrend === "stable") parts.push("HR stayed stable");

  if (analysis.recoveries.length) {
    parts.push(analysis.recoveryTrend === "variable" ? "recoveries were variable" : "recoveries stayed stable");
  }

  let conclusion;
  if (analysis.dynamics === "slower" && analysis.spread > 10) {
    conclusion = "The pace dropped noticeably toward the end — the load was high.";
  } else if (analysis.dynamics === "slower") {
    conclusion = "There was a small pace drop toward the end of the set.";
  } else if (analysis.recoveryTrend === "variable") {
    conclusion = "The main work was even, but recoveries were inconsistent.";
  } else if (analysis.dynamics === "faster" && analysis.spread <= 8) {
    conclusion = "The set was even, with a strong acceleration at the end.";
  } else if (analysis.spread > 12) {
    conclusion = "Pace varied noticeably between reps — the work was uneven.";
  } else {
    conclusion = "The work was controlled.";
  }

  parts.push(`total fast-work volume ${workDistanceLabel} ${unit}`);
  return `${parts.join(" · ")}. ${conclusion}`;
}

function generateTempoInsight(summary) {
  const pattern = getWorkoutPattern(summary);
  if (pattern.type !== "tempo") return null;

  const splits = Array.isArray(summary?.splits) ? summary.splits : [];
  const start = Number(pattern.tempoStart);
  const end = Number(pattern.tempoEnd);
  if (!Number.isInteger(start) || !Number.isInteger(end) || end < start) return null;

  const tempoSplits = splits.slice(start, end + 1);
  const paces = tempoSplits.map(split => paceToSeconds(split.pace)).filter(Number.isFinite);
  if (paces.length < 3) return null;

  const average = paces.reduce((sum, pace) => sum + pace, 0) / paces.length;
  const spread = Math.max(...paces) - Math.min(...paces);
  const firstCount = Math.max(1, Math.floor(paces.length / 3));
  const lastCount = Math.max(1, Math.floor(paces.length / 3));
  const firstAvg = paces.slice(0, firstCount).reduce((sum, pace) => sum + pace, 0) / firstCount;
  const lastAvg = paces.slice(-lastCount).reduce((sum, pace) => sum + pace, 0) / lastCount;
  const paceDelta = firstAvg - lastAvg;

  const hrValues = tempoSplits.map(split => Number(split.heartRate)).filter(value => Number.isFinite(value) && value > 0);
  let hrTrend = "unknown";
  let hrDelta = null;
  if (hrValues.length >= 3) {
    const hrFirstCount = Math.max(1, Math.floor(hrValues.length / 3));
    const hrLastCount = Math.max(1, Math.floor(hrValues.length / 3));
    const hrFirst = hrValues.slice(0, hrFirstCount).reduce((sum, value) => sum + value, 0) / hrFirstCount;
    const hrLast = hrValues.slice(-hrLastCount).reduce((sum, value) => sum + value, 0) / hrLastCount;
    hrDelta = hrLast - hrFirst;
    hrTrend = hrDelta >= 5 ? "rising" : hrDelta <= -5 ? "falling" : "stable";
  }

  let dynamics = "stable";
  if (paceDelta > 5) dynamics = "faster";
  else if (paceDelta < -5) dynamics = "slower";

  const distanceKm = tempoSplits.reduce((sum, split) => {
    const km = Number(split?.km);
    return sum + (Number.isFinite(km) ? 1 : 0);
  }, 0);
  const volumeLabel = distanceKm > 0
    ? `${Number.isInteger(distanceKm) ? distanceKm : distanceKm.toFixed(1).replace(".", currentLanguage === "uk" ? "," : ".")} км`
    : `${paces.length} км`;

  const paceLabel = formatInsightPace(average);
  const spreadLabel = Math.round(spread);

  if (currentLanguage === "uk") {
    const parts = [
      `Темпове · ${volumeLabel}`,
      `середній темп — ${paceLabel}/км`,
      `розкид темпу — ${spreadLabel} с/км`
    ];

    if (dynamics === "faster") parts.push("до кінця темп поступово прискорювався");
    else if (dynamics === "slower") parts.push("до кінця темп поступово сповільнювався");
    else parts.push("темп залишався стабільним");

    if (hrTrend === "rising") parts.push("ЧСС поступово зростала");
    else if (hrTrend === "falling") parts.push("ЧСС поступово знижувалась");
    else if (hrTrend === "stable") parts.push("ЧСС залишалась стабільною");

    let conclusion;
    if (dynamics === "slower" && spread > 10) {
      conclusion = "До кінця темп помітно просів — навантаження було високим.";
    } else if (dynamics === "slower") {
      conclusion = "Наприкінці роботи помітне невелике просідання темпу.";
    } else if (spread > 12) {
      conclusion = "Темп помітно коливався — робота була нерівномірною.";
    } else if (dynamics === "faster" && spread <= 8) {
      conclusion = "Темп добре контролювався, із сильним фінішем.";
    } else if (hrDelta !== null && hrDelta >= 10 && dynamics !== "faster") {
      conclusion = "ЧСС помітно зросла без відповідного прискорення темпу — наприкінці накопичувалась втома.";
    } else {
      conclusion = "Темпову роботу виконано контрольовано.";
    }

    return `${parts.join(" · ")}. ${conclusion}`;
  }

  const parts = [
    `Tempo · ${volumeLabel}`,
    `average pace ${paceLabel}/km`,
    `pace spread ${spreadLabel} sec/km`
  ];

  if (dynamics === "faster") parts.push("pace gradually increased toward the end");
  else if (dynamics === "slower") parts.push("pace gradually decreased toward the end");
  else parts.push("pace stayed stable");

  if (hrTrend === "rising") parts.push("HR gradually rose");
  else if (hrTrend === "falling") parts.push("HR gradually decreased");
  else if (hrTrend === "stable") parts.push("HR stayed stable");

  let conclusion;
  if (dynamics === "slower" && spread > 10) conclusion = "The pace dropped noticeably toward the end — the load was high.";
  else if (dynamics === "slower") conclusion = "There was a small pace drop toward the end.";
  else if (spread > 12) conclusion = "Pace varied noticeably — the work was uneven.";
  else if (dynamics === "faster" && spread <= 8) conclusion = "Pace was well controlled, with a strong finish.";
  else if (hrDelta !== null && hrDelta >= 10 && dynamics !== "faster") conclusion = "HR rose noticeably without a matching pace increase — fatigue accumulated toward the end.";
  else conclusion = "The tempo work was controlled.";

  return `${parts.join(" · ")}. ${conclusion}`;
}

function generateEasyRunInsight(summary) {
  const pattern = getWorkoutPattern(summary);
  if (pattern.type !== "run") return null;

  const splits = Array.isArray(summary?.splits) ? summary.splits : [];
  const valid = splits
    .map(split => ({
      pace: paceToSeconds(split?.pace),
      hr: Number(split?.heartRate)
    }))
    .filter(item => Number.isFinite(item.pace));

  if (valid.length < 4) return null;

  const half = Math.floor(valid.length / 2);
  const first = valid.slice(0, half);
  const second = valid.slice(-half);
  const avg = items => items.reduce((sum, item) => sum + item.pace, 0) / items.length;
  const avgHr = items => {
    const values = items.map(item => item.hr).filter(value => Number.isFinite(value) && value > 0);
    return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null;
  };

  const firstPace = avg(first);
  const secondPace = avg(second);
  const paceDelta = firstPace - secondPace; // positive = faster later
  const firstHr = avgHr(first);
  const secondHr = avgHr(second);
  const hrDelta = firstHr != null && secondHr != null ? secondHr - firstHr : null;

  const paceValues = valid.map(item => item.pace);
  const paceSpread = Math.max(...paceValues) - Math.min(...paceValues);

  // Cardiac drift is most meaningful when pace stays broadly similar while HR rises.
  const similarPace = Math.abs(paceDelta) <= 10;
  const cardiacDrift = similarPace && hrDelta != null && hrDelta >= 5;
  const highDrift = similarPace && hrDelta != null && hrDelta >= 10;
  const paceDrop = paceDelta <= -10;
  const paceDropStrong = paceDelta <= -20;
  const acceleration = paceDelta >= 10;
  const unstable = paceSpread > 25;

  const volumeKm = Number(summary?.distance);
  const volumeLabel = Number.isFinite(volumeKm) && volumeKm > 0
    ? `${String(Number(volumeKm.toFixed(1))).replace(".", currentLanguage === "uk" ? "," : ".")} км`
    : `${valid.length} км`;

  if (currentLanguage === "uk") {
    const parts = [`Легкий біг · ${volumeLabel}`];

    if (summary?.pace) parts.push(`середній темп — ${summary.pace}/км`);

    if (unstable) parts.push("темп помітно коливався протягом тренування");
    else if (acceleration) parts.push("у другій половині темп став швидшим");
    else if (paceDropStrong) parts.push("у другій половині темп помітно сповільнився");
    else if (paceDrop) parts.push("у другій половині темп трохи сповільнився");
    else parts.push("темп залишався стабільним");

    if (highDrift) parts.push(`ЧСС зросла приблизно на ${Math.round(hrDelta)} уд/хв при схожому темпі`);
    else if (cardiacDrift) parts.push(`ЧСС зросла приблизно на ${Math.round(hrDelta)} уд/хв при схожому темпі`);
    else if (hrDelta != null && hrDelta <= -5) parts.push("ЧСС знижувалась у другій половині");
    else if (hrDelta != null) parts.push("ЧСС залишалась відносно стабільною");

    let conclusion;
    if (paceDropStrong && highDrift) {
      conclusion = "У другій половині одночасно знизився темп і зросла ЧСС — наприкінці тренування помітна втома.";
    } else if (highDrift) {
      conclusion = "Помітний кардіодрифт: ЧСС зростала без відповідного прискорення темпу.";
    } else if (cardiacDrift) {
      conclusion = "Є помірний кардіодрифт — ЧСС зростала при приблизно незмінному темпі.";
    } else if (paceDropStrong) {
      conclusion = "Наприкінці тренування темп помітно просів.";
    } else if (unstable) {
      conclusion = "Для легкого бігу темп був нерівномірним.";
    } else if (acceleration) {
      conclusion = "Тренування завершено швидше, ніж розпочато, без помітної втрати контролю.";
    } else if (paceDrop) {
      conclusion = "Невелике уповільнення наприкінці тренування є помітним, але без різкого просідання.";
    } else {
      // V8: кілька природних формулювань для справді рівного легкого бігу.
      // Вибір детермінований даними тренування, тому текст не змінюється випадково
      // після перезавантаження, але однакові тренування не звучать як копіпаст.
      const variationKey = Math.round((volumeKm || valid.length) * 10) + Math.round(firstPace) + Math.round(firstHr || 0);
      const stableConclusions = [
        "Легкий біг виконано рівномірно, без помітного кардіодрифту.",
        "Темп і ЧСС залишалися стабільними протягом тренування — біг пройдено рівно.",
        "Навантаження залишалося контрольованим: темп не просідав, а ЧСС істотно не зростала.",
        "Рівномірний легкий біг: темп стабільний, реакція ЧСС без помітних змін.",
        "Тренування пройдено спокійно й рівно, без ознак помітного кардіодрифту."
      ];
      conclusion = stableConclusions[Math.abs(variationKey) % stableConclusions.length];
    }

    parts.push(conclusion);
    return `${parts.join(" · ")}.`;
  }

  const parts = [`Easy run · ${volumeLabel}`];
  if (summary?.pace) parts.push(`average pace ${summary.pace}/km`);
  if (unstable) parts.push("pace varied noticeably throughout the run");
  else if (acceleration) parts.push("pace was faster in the second half");
  else if (paceDropStrong) parts.push("pace slowed noticeably in the second half");
  else if (paceDrop) parts.push("pace slowed slightly in the second half");
  else parts.push("pace stayed stable");

  if (hrDelta != null && hrDelta >= 5) parts.push(`HR rose by about ${Math.round(hrDelta)} bpm at a similar pace`);
  else if (hrDelta != null && hrDelta <= -5) parts.push("HR decreased in the second half");
  else if (hrDelta != null) parts.push("HR stayed relatively stable");

  let conclusion;
  if (paceDropStrong && highDrift) conclusion = "Pace fell while HR rose toward the end — fatigue was noticeable.";
  else if (highDrift) conclusion = "Noticeable cardiac drift: HR rose without a matching pace increase.";
  else if (cardiacDrift) conclusion = "Moderate cardiac drift was present.";
  else if (paceDropStrong) conclusion = "Pace dropped noticeably toward the end.";
  else if (unstable) conclusion = "Pace was uneven for an easy run.";
  else if (acceleration) conclusion = "The run finished faster than it started, without a clear loss of control.";
  else if (paceDrop) conclusion = "There was a small pace drop toward the end, without a major slowdown.";
  else conclusion = "The easy run was even, with no clear cardiac drift.";

  parts.push(conclusion);
  return `${parts.join(" · ")}.`;
}


function generateLongRunInsight(summary) {
  const pattern = getWorkoutPattern(summary);
  if (pattern.type !== "long") return null;

  const isLongWithWork = pattern.variant === "with_work";
  const splits = Array.isArray(summary?.splits) ? summary.splits : [];
  const valid = splits
    .map(split => ({
      pace: paceToSeconds(split?.pace),
      hr: Number(split?.heartRate)
    }))
    .filter(item => Number.isFinite(item.pace));

  if (valid.length < 6) return null;

  const half = Math.floor(valid.length / 2);
  const first = valid.slice(0, half);
  const second = valid.slice(-half);
  const avg = items => items.length
    ? items.reduce((sum, item) => sum + item.pace, 0) / items.length
    : null;
  const avgHr = items => {
    const values = items.map(item => item.hr).filter(value => Number.isFinite(value) && value > 0);
    return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null;
  };

  const firstPace = avg(first);
  const secondPace = avg(second);
  const paceDelta = firstPace - secondPace; // positive = faster later
  const firstHr = avgHr(first);
  const secondHr = avgHr(second);
  const hrDelta = firstHr != null && secondHr != null ? secondHr - firstHr : null;

  const paces = valid.map(item => item.pace);
  const paceSpread = Math.max(...paces) - Math.min(...paces);
  const similarPace = Math.abs(paceDelta) <= 12;
  const moderateDrift = similarPace && hrDelta != null && hrDelta >= 5;
  const strongDrift = similarPace && hrDelta != null && hrDelta >= 10;
  const slowdown = paceDelta <= -10;
  const strongSlowdown = paceDelta <= -20;
  const finishFaster = paceDelta >= 10;
  const uneven = paceSpread > 30;

  const volumeKm = Number(summary?.distance);
  const volumeLabel = Number.isFinite(volumeKm) && volumeKm > 0
    ? `${String(Number(volumeKm.toFixed(1))).replace(".", currentLanguage === "uk" ? "," : ".")} км`
    : `${valid.length} км`;

  if (currentLanguage === "uk") {
    const parts = [isLongWithWork ? `Довгий біг із роботою в кінці · ${volumeLabel}` : `Довгий біг · ${volumeLabel}`];
    if (summary?.pace) parts.push(`середній темп — ${summary.pace}/км`);

    if (uneven) parts.push("темп помітно коливався протягом дистанції");
    else if (finishFaster) parts.push("у другій половині темп став швидшим");
    else if (strongSlowdown) parts.push("у другій половині темп помітно сповільнився");
    else if (slowdown) parts.push("у другій половині темп трохи сповільнився");
    else parts.push("темп залишався стабільним протягом дистанції");

    if (strongDrift) parts.push(`ЧСС зросла приблизно на ${Math.round(hrDelta)} уд/хв при схожому темпі`);
    else if (moderateDrift) parts.push(`ЧСС зросла приблизно на ${Math.round(hrDelta)} уд/хв при схожому темпі`);
    else if (hrDelta != null && hrDelta <= -5) parts.push("ЧСС знижувалась у другій половині");
    else if (hrDelta != null) parts.push("ЧСС залишалась відносно стабільною");

    let conclusion;
    if (strongSlowdown && strongDrift) {
      conclusion = "Наприкінці одночасно просів темп і зросла ЧСС — накопичення втоми було помітним.";
    } else if (strongDrift) {
      conclusion = "Помітний кардіодрифт: ЧСС зростала без відповідного прискорення темпу.";
    } else if (moderateDrift) {
      conclusion = "Є помірний кардіодрифт — для довгого бігу варто стежити за реакцією ЧСС у другій половині.";
    } else if (strongSlowdown) {
      conclusion = "У другій половині дистанції темп помітно просів — втома вже вплинула на виконання.";
    } else if (slowdown) {
      conclusion = "Невелике уповільнення в другій половині помітне, але без різкого просідання.";
    } else if (uneven) {
      conclusion = "Темп був нерівномірним протягом дистанції — довгий біг виконано без чіткої рівномірності.";
    } else if (finishFaster) {
      conclusion = "Дистанцію завершено швидше, ніж розпочато, без помітної втрати контролю.";
    } else {
      const variationKey = Math.round((volumeKm || valid.length) * 10) + Math.round(firstPace) + Math.round(firstHr || 0);
      const stableConclusions = [
        "Дистанцію пройдено рівномірно, без помітного кардіодрифту.",
        "Темп і ЧСС залишалися стабільними — довгий біг виконано контрольовано.",
        "Основна частина дистанції пройшла рівно, без вираженої зміни темпу чи ЧСС.",
        "Рівномірний довгий біг: темп стабільний, реакція ЧСС без помітного погіршення.",
        "Довгий біг виконано спокійно й рівно, без явних ознак накопичення втоми."
      ];
      conclusion = stableConclusions[Math.abs(variationKey) % stableConclusions.length];
    }

    parts.push(conclusion);
    return `${parts.join(" · ")}.`;
  }

  const parts = [`Long run · ${volumeLabel}`];
  if (summary?.pace) parts.push(`average pace ${summary.pace}/km`);
  if (uneven) parts.push("pace varied noticeably throughout the distance");
  else if (finishFaster) parts.push("pace was faster in the second half");
  else if (strongSlowdown) parts.push("pace slowed noticeably in the second half");
  else if (slowdown) parts.push("pace slowed slightly in the second half");
  else parts.push("pace stayed stable throughout the distance");

  if (hrDelta != null && hrDelta >= 5) parts.push(`HR rose by about ${Math.round(hrDelta)} bpm at a similar pace`);
  else if (hrDelta != null && hrDelta <= -5) parts.push("HR decreased in the second half");
  else if (hrDelta != null) parts.push("HR stayed relatively stable");

  let conclusion;
  if (strongSlowdown && strongDrift) conclusion = "Pace fell while HR rose toward the end — fatigue was noticeable.";
  else if (strongDrift) conclusion = "Noticeable cardiac drift: HR rose without a matching pace increase.";
  else if (moderateDrift) conclusion = "Moderate cardiac drift was present in the second half.";
  else if (strongSlowdown) conclusion = "Pace dropped noticeably in the second half.";
  else if (slowdown) conclusion = "There was a small pace drop in the second half, without a major slowdown.";
  else if (uneven) conclusion = "Pace was uneven throughout the long run.";
  else if (finishFaster) conclusion = "The run finished faster than it started, without a clear loss of control.";
  else conclusion = "The long run was even, with no clear cardiac drift.";

  parts.push(conclusion);
  return `${parts.join(" · ")}.`;
}

function generateFartlekInsight(summary) {
  const pattern = getWorkoutPattern(summary);
  if (pattern.type !== "fartlek") return null;

  const splits = Array.isArray(summary?.splits) ? summary.splits : [];
  const items = splits.map((split, index) => ({
    index,
    pace: paceToSeconds(split?.pace),
    hr: Number(split?.heartRate),
    state: pattern.states?.[index] || "neutral"
  })).filter(item => Number.isFinite(item.pace));

  const fast = items.filter(item => item.state === "fast");
  const slow = items.filter(item => item.state === "slow");
  if (fast.length < 3 || slow.length < 2) return null;

  const avg = values => values.length
    ? values.reduce((sum, value) => sum + value, 0) / values.length
    : null;

  const fastPaces = fast.map(item => item.pace);
  const fastAverage = avg(fastPaces);
  const fastSpread = Math.max(...fastPaces) - Math.min(...fastPaces);

  const firstFast = fast.slice(0, Math.max(1, Math.floor(fast.length / 3)));
  const lastFast = fast.slice(-Math.max(1, Math.floor(fast.length / 3)));
  const firstFastPace = avg(firstFast.map(item => item.pace));
  const lastFastPace = avg(lastFast.map(item => item.pace));
  const paceDelta = firstFastPace - lastFastPace;

  const firstFastHr = avg(firstFast.map(item => item.hr).filter(value => Number.isFinite(value) && value > 0));
  const lastFastHr = avg(lastFast.map(item => item.hr).filter(value => Number.isFinite(value) && value > 0));
  const hrDelta = firstFastHr != null && lastFastHr != null ? lastFastHr - firstFastHr : null;

  const recoveryPaces = slow.map(item => item.pace);
  const recoverySpread = Math.max(...recoveryPaces) - Math.min(...recoveryPaces);

  const fastDistanceKm = fast.length;
  const volumeKm = Number(summary?.distance);
  const volumeLabel = Number.isFinite(volumeKm) && volumeKm > 0
    ? `${String(Number(volumeKm.toFixed(1))).replace(".", currentLanguage === "uk" ? "," : ".")} км`
    : `${items.length} км`;

  let dynamics = "stable";
  if (paceDelta > 8) dynamics = "faster";
  else if (paceDelta < -8) dynamics = "slower";

  const unstable = fastSpread > 18;
  const recoveryVariable = recoverySpread > 25;
  const strongFatigue = dynamics === "slower" && hrDelta != null && hrDelta >= 8;
  const moderateFatigue = dynamics === "slower" || (hrDelta != null && hrDelta >= 10 && dynamics !== "faster");

  if (currentLanguage === "uk") {
    const parts = [
      `Фартлек · ${volumeLabel}`,
      `${fast.length} прискорень`,
      `середній темп швидких відрізків — ${formatInsightPace(fastAverage)}/км`,
      `розкид — ${Math.round(fastSpread)} с/км`
    ];

    if (dynamics === "faster") parts.push("швидкі відрізки до кінця ставали швидшими");
    else if (dynamics === "slower") parts.push("швидкі відрізки до кінця сповільнювалися");
    else parts.push("темп швидких відрізків залишався відносно стабільним");

    if (hrDelta != null && hrDelta >= 5) parts.push(`ЧСС на швидких відрізках зросла приблизно на ${Math.round(hrDelta)} уд/хв`);
    else if (hrDelta != null && hrDelta <= -5) parts.push("ЧСС на швидких відрізках знижувалась до кінця");
    else if (hrDelta != null) parts.push("ЧСС на швидких відрізках залишалась відносно стабільною");

    if (recoveryVariable) parts.push("відновлення були нерівномірними");
    else parts.push("відновлення залишались відносно стабільними");

    let conclusion;
    if (strongFatigue) {
      conclusion = "Наприкінці швидких відрізків помітна втома: темп знизився, а ЧСС зросла.";
    } else if (unstable && recoveryVariable) {
      conclusion = "Інтенсивність і відновлення помітно коливалися — фартлек вийшов нерівномірним.";
    } else if (moderateFatigue) {
      conclusion = "До кінця роботи з'явилися ознаки накопичення втоми.";
    } else if (unstable) {
      conclusion = "Швидкі відрізки виконувалися з помітною різницею в темпі.";
    } else if (recoveryVariable) {
      conclusion = "Швидкі відрізки були достатньо стабільними, але відновлення помітно відрізнялися.";
    } else if (dynamics === "faster" && fastSpread <= 12) {
      conclusion = "Фартлек виконано контрольовано, з хорошою динамікою до кінця.";
    } else {
      conclusion = "Фартлек виконано рівномірно та контрольовано.";
    }

    parts.push(`загальний обсяг швидкої роботи — ${fastDistanceKm} км`);
    parts.push(conclusion);
    return `${parts.join(" · ")}.`;
  }

  const parts = [
    `Fartlek · ${volumeLabel}`,
    `${fast.length} fast segments`,
    `average fast-segment pace ${formatInsightPace(fastAverage)}/km`,
    `spread ${Math.round(fastSpread)} sec/km`
  ];
  if (dynamics === "faster") parts.push("fast segments got faster toward the end");
  else if (dynamics === "slower") parts.push("fast segments slowed toward the end");
  else parts.push("fast-segment pace stayed relatively stable");
  if (hrDelta != null && hrDelta >= 5) parts.push(`HR rose by about ${Math.round(hrDelta)} bpm on fast segments`);
  else if (hrDelta != null && hrDelta <= -5) parts.push("HR decreased on fast segments toward the end");
  else if (hrDelta != null) parts.push("HR stayed relatively stable on fast segments");
  parts.push(recoveryVariable ? "recoveries were variable" : "recoveries stayed relatively stable");
  let conclusion;
  if (strongFatigue) conclusion = "Fatigue was noticeable toward the end: pace slowed while HR rose.";
  else if (unstable && recoveryVariable) conclusion = "Both intensity and recoveries varied noticeably — the fartlek was uneven.";
  else if (moderateFatigue) conclusion = "There were signs of accumulating fatigue toward the end.";
  else if (unstable) conclusion = "Fast segments varied noticeably in pace.";
  else if (recoveryVariable) conclusion = "Fast segments were fairly stable, but recoveries varied noticeably.";
  else if (dynamics === "faster" && fastSpread <= 12) conclusion = "The fartlek was controlled, with good late-session dynamics.";
  else conclusion = "The fartlek was even and controlled.";
  parts.push(`total fast-work volume ${fastDistanceKm} km`, conclusion);
  return `${parts.join(" · ")}.`;
}

function workHrText(summary, bpm) {
  const analysis = getIntervalAnalysis(summary);
  if (!analysis) return "";
  const hr = analysis.reps.map(rep => Number(rep.work?.heartRate)).filter(Number.isFinite);
  if (hr.length < 2) return "";
  return ` (${Math.round(hr[0])}→${Math.round(hr[hr.length - 1])} ${bpm})`;
}

function generateWorkoutInsight(summary) {
  // Long runs with work at the end are analysed as long runs, not as pure
  // interval sessions. The interval structure is still shown visually.
  const longRunInsight = generateLongRunInsight(summary);
  if (longRunInsight) return longRunInsight;

  const intervalInsight = generateIntervalInsight(summary);
  if (intervalInsight) return intervalInsight;

  const fartlekInsight = generateFartlekInsight(summary);
  if (fartlekInsight) return fartlekInsight;

  const tempoInsight = generateTempoInsight(summary);
  if (tempoInsight) return tempoInsight;

  const easyInsight = generateEasyRunInsight(summary);
  if (easyInsight) return easyInsight;

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
  const structure = Array.isArray(summary?.structure) ? summary.structure : [];

  // A long run with a quality block at the end is still a long run as a
  // workout type. Keep the interval block inside the structure, but classify
  // the whole session by its dominant purpose.
  if (pattern?.type === "intervals" && structure.length) {
    const intervalIndex = structure.findIndex(block =>
      block?.type === "intervals" && Array.isArray(block.repetitions) && block.repetitions.length > 0
    );
    if (intervalIndex > 0) {
      const preWorkDistance = structure
        .slice(0, intervalIndex)
        .filter(block => ["easy", "warmup"].includes(block?.type))
        .reduce((sum, block) => sum + (Number(block?.distance) || 0), 0);
      if (preWorkDistance >= 12000) return "long";
    }
  }

  if (pattern?.type === "intervals") return "intervals";
  if (pattern?.type === "tempo") return "tempo";
  if (pattern?.type === "fartlek") return "fartlek";
  if (Number(summary?.distance) >= 16) return "long";
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
    const typeOk = historyTypeFilter === "all" || derivedWorkoutType(workout) === historyTypeFilter;
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

function formatWeekRangeLabel(startDate) {
  const start = new Date(startDate);
  const end = new Date(startDate);
  end.setDate(end.getDate() + 6);
  const locale = translations[currentLanguage].locale;
  const startLabel = start.toLocaleDateString(locale, { day: "2-digit", month: "2-digit" });
  const endLabel = end.toLocaleDateString(locale, { day: "2-digit", month: "2-digit" });
  return `${startLabel}–${endLabel}`;
}

function median(values) {
  const sorted = values.filter(Number.isFinite).sort((a, b) => a - b);
  if (!sorted.length) return null;
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

function easyRunComparable(current, candidate) {
  if (!current || !candidate || derivedWorkoutType(candidate) !== "run") return false;
  const currentDistance = Number(current.distance_km);
  const candidateDistance = Number(candidate.distance_km);
  const currentDuration = Number(current.duration_sec);
  const candidateDuration = Number(candidate.duration_sec);
  const currentPace = paceToSeconds(current.pace);
  const candidatePace = paceToSeconds(candidate.pace);
  if (![currentDistance, candidateDistance, currentDuration, candidateDuration, currentPace, candidatePace].every(Number.isFinite)) return false;

  // The workout type already tells us that both runs are easy. Here we only
  // check whether the runs are physically comparable enough for a trend.
  // Heart-rate intensity is handled separately and is personalized to the
  // runner's own easy-run distribution — there are no universal HR limits.
  const distanceRatio = candidateDistance / currentDistance;
  const durationRatio = candidateDuration / currentDuration;
  if (distanceRatio < 0.65 || distanceRatio > 1.40) return false;
  if (durationRatio < 0.65 || durationRatio > 1.40) return false;

  const currentAscent = Number(current.ascent_m);
  const candidateAscent = Number(candidate.ascent_m);
  if (Number.isFinite(currentAscent) && Number.isFinite(candidateAscent)) {
    const ascentDiff = Math.abs(currentAscent - candidateAscent);
    if (ascentDiff > Math.max(100, Math.max(currentAscent, candidateAscent) * 0.80)) return false;
  }
  return true;
}

function percentileRank(values, value) {
  const valid = values.filter(Number.isFinite).sort((a, b) => a - b);
  if (!valid.length || !Number.isFinite(value)) return null;
  if (valid.length === 1) return 0.5;
  const below = valid.filter(item => item < value).length;
  const equal = valid.filter(item => item === value).length;
  return (below + Math.max(0, equal - 1) / 2) / (valid.length - 1);
}

function easyIntensityDistance(currentHr, candidateHr, allHrs) {
  if (!Number.isFinite(currentHr) || !Number.isFinite(candidateHr)) return Infinity;
  const currentRank = percentileRank(allHrs, currentHr);
  const candidateRank = percentileRank(allHrs, candidateHr);
  if (currentRank == null || candidateRank == null) return Math.abs(currentHr - candidateHr) / 10;
  return Math.abs(currentRank - candidateRank);
}

function selectEasyIntensityMatches(current, candidates) {
  const currentHr = Number(current?.heart_rate);
  const allHrs = candidates.map(item => Number(item.heart_rate)).filter(Number.isFinite);
  if (!Number.isFinite(currentHr) || !allHrs.length) return [];

  // Personalize intensity matching. A runner whose easy runs are 110 bpm and
  // another whose easy runs are 150 bpm get the same relative treatment.
  const ranked = candidates
    .map(item => ({
      item,
      intensityDistance: easyIntensityDistance(currentHr, Number(item.heart_rate), allHrs),
      hrDistance: Math.abs(Number(item.heart_rate) - currentHr)
    }))
    .sort((a, b) => a.intensityDistance - b.intensityDistance || a.hrDistance - b.hrDistance);

  let matches = ranked.filter(item => item.intensityDistance <= 0.18);
  if (matches.length < 2) matches = ranked.filter(item => item.intensityDistance <= 0.28);
  return matches.map(item => item.item);
}

function buildEasyRunDynamics(workouts) {
  const easy = workouts
    .filter(w => derivedWorkoutType(w) === "run")
    .filter(w => Number.isFinite(Number(w.heart_rate)) && paceToSeconds(w.pace) != null)
    .sort((a, b) => new Date(a.workout_date) - new Date(b.workout_date));
  if (easy.length < 2) return null;

  const current = easy.at(-1);
  const candidates = easy.slice(0, -1).filter(w => easyRunComparable(current, w));
  if (!candidates.length) return null;

  const currentHr = Number(current.heart_rate);
  const currentPace = paceToSeconds(current.pace);
  const intensityMatches = selectEasyIntensityMatches(current, candidates);
  const samePace = candidates
    .filter(w => Math.abs(paceToSeconds(w.pace) - currentPace) <= 25)
    .sort((a, b) => Math.abs(paceToSeconds(a.pace) - currentPace) - Math.abs(paceToSeconds(b.pace) - currentPace));

  const paceBaseline = median(intensityMatches.map(w => paceToSeconds(w.pace)));
  const hrBaseline = median(samePace.slice(0, Math.max(3, Math.min(5, samePace.length))).map(w => Number(w.heart_rate)));
  const paceDelta = paceBaseline != null ? paceBaseline - currentPace : null;
  const hrDelta = hrBaseline != null ? currentHr - hrBaseline : null;

  // Trend is calculated from several historical matches, split into older and
  // newer halves. We do not call a single workout "progress".
  const matches = intensityMatches.slice().sort((a, b) => new Date(a.workout_date) - new Date(b.workout_date));
  const splitIndex = Math.floor(matches.length / 2);
  const older = matches.slice(0, splitIndex);
  const recent = matches.slice(splitIndex);
  const olderPace = median(older.map(w => paceToSeconds(w.pace)));
  const recentPace = median(recent.map(w => paceToSeconds(w.pace)));

  const paceMatches = samePace.slice(0, Math.max(3, Math.min(5, samePace.length)));
  const paceMatchesSorted = paceMatches.slice().sort((a, b) => new Date(a.workout_date) - new Date(b.workout_date));
  const paceSplit = Math.floor(paceMatchesSorted.length / 2);
  const olderHr = median(paceMatchesSorted.slice(0, paceSplit).map(w => Number(w.heart_rate)));
  const recentHr = median(paceMatchesSorted.slice(paceSplit).map(w => Number(w.heart_rate)));

  let trend = "stable";
  if (matches.length >= 4) {
    const paceTrend = olderPace != null && recentPace != null
      ? (olderPace - recentPace >= 6 ? "improved" : olderPace - recentPace <= -6 ? "declined" : "stable")
      : null;
    const hrTrend = olderHr != null && recentHr != null
      ? (recentHr - olderHr <= -3 ? "improved" : recentHr - olderHr >= 3 ? "declined" : "stable")
      : null;

    // Only call a long-term trend when the available signals agree. If pace
    // and HR point in opposite directions, keep the result neutral rather
    // than turning one good metric into a false progress/decline claim.
    if (paceTrend === "improved" && (hrTrend === "improved" || hrTrend === "stable" || hrTrend == null)) trend = "improved";
    else if (paceTrend === "declined" && (hrTrend === "declined" || hrTrend === "stable" || hrTrend == null)) trend = "declined";
    else if (hrTrend === "improved" && paceTrend === "stable") trend = "improved";
    else if (hrTrend === "declined" && paceTrend === "stable") trend = "declined";

    // Do not report a decline unless the latest run itself is also worse
    // against the current easy-run baseline in both pace and HR.
    const currentPaceWorse = Number.isFinite(paceDelta) && paceDelta <= -6;
    const currentHrWorse = Number.isFinite(hrDelta) && hrDelta >= 3;
    if (trend === "declined" && !(currentPaceWorse && currentHrWorse)) trend = "stable";
  }

  return {
    current,
    count: matches.length,
    paceBaseline,
    hrBaseline,
    paceDelta,
    hrDelta,
    trend,
    sameHrCount: intensityMatches.length,
    samePaceCount: paceMatches.length,
    confidence: matches.length >= 4 ? "good" : matches.length >= 3 ? "moderate" : "low"
  };
}

function formatHomeHours(seconds) {
  if (!Number.isFinite(seconds) || seconds <= 0) return "0";
  return (seconds / 3600).toFixed(1).replace(".", currentLanguage === "uk" ? "," : ".");
}

function derivedWorkoutType(record) {
  if (!record) return "run";
  const structure = Array.isArray(record.structure) ? record.structure : [];

  // Recalculate the type from the saved workout data even when an older
  // history record has no stored structure. This keeps the History list and
  // filters in sync with the current workout-classification logic.
  const summary = {
    distance: Number(record.distance_km) || 0,
    pace: record.pace || null,
    heartRate: Number.isFinite(Number(record.heart_rate)) ? Number(record.heart_rate) : null,
    splits: Array.isArray(record.splits) ? record.splits : [],
    structure
  };

  const derived = getWorkoutTypeKey(summary);
  return derived || historyTypeClass(record.workout_type);
}

function homeWorkoutLabel(workout) {
  return workoutTypeLabel(derivedWorkoutType(workout));
}

function homeTrendState(workouts, type) {
  let dynamics = null;
  if (type === "easy") dynamics = buildEasyRunDynamics(workouts);
  else if (type === "tempo") dynamics = buildTempoDynamics(workouts);
  else if (type === "intervals") dynamics = buildIntervalDynamics(workouts);
  else if (type === "long") {
    const simple = longDynamicsSubtab === "simple" ? buildLongDynamics(workouts) : null;
    const withWork = longDynamicsSubtab === "with_work" ? buildLongDynamics(workouts) : null;
    dynamics = simple || withWork;
  }

  if (!dynamics) return { label: t("homeNoTrend"), tone: "neutral" };
  if (dynamics.count === 1) return { label: t("homeComparisonOnly"), tone: "neutral" };

  // For easy runs, the latest workout's result versus the personal baseline
  // is more relevant on the home page than the historical trend of older runs.
  if (type === "easy") {
    const paceSignal = Number.isFinite(dynamics.paceDelta) && Math.abs(dynamics.paceDelta) >= 6
      ? (dynamics.paceDelta > 0 ? "better" : "worse")
      : "neutral";
    const hrSignal = Number.isFinite(dynamics.hrDelta) && Math.abs(dynamics.hrDelta) >= 3
      ? (dynamics.hrDelta < 0 ? "better" : "worse")
      : "neutral";

    if (paceSignal === "better" && hrSignal === "better") {
      return { label: t("historyEasyCurrentBetter"), tone: "positive" };
    }
    if (paceSignal === "worse" && hrSignal === "worse") {
      return { label: t("historyEasyCurrentWorse"), tone: "negative" };
    }
    if ((paceSignal === "better" && hrSignal === "worse")
        || (paceSignal === "worse" && hrSignal === "better")) {
      return { label: t("historyEasyMixed"), tone: "neutral" };
    }
    if (paceSignal !== "neutral" || hrSignal !== "neutral") {
      return { label: t("historyEasyNearTypical"), tone: "neutral" };
    }
  }

  if (dynamics.trend === "improved") {
    return { label: type === "easy" ? t("historyEasyImproved") : type === "tempo" ? t("historyTempoImproved") : type === "intervals" ? t("historyIntervalImproved") : t("historyLongImproved"), tone: "positive" };
  }
  if (dynamics.trend === "declined") {
    return { label: type === "easy" ? t("historyEasyDeclined") : type === "tempo" ? t("historyTempoDeclined") : type === "intervals" ? t("historyIntervalDeclined") : t("historyLongDeclined"), tone: "negative" };
  }
  return { label: type === "easy" ? t("historyEasyStable") : type === "tempo" ? t("historyTempoStable") : type === "intervals" ? t("historyIntervalStable") : t("historyLongStable"), tone: "neutral" };
}

function renderHome(workouts = historyWorkouts) {
  const container = document.querySelector("#homeContent");
  if (!container) return;
  const sorted = [...workouts].sort((a, b) => new Date(b.workout_date || b.created_at || 0) - new Date(a.workout_date || a.created_at || 0));
  const latest = sorted[0] || null;
  const now = new Date();
  const weekStart = getWeekStart(now);
  const weekWorkouts = sorted.filter(workout => {
    const date = new Date(workout.workout_date || workout.created_at || 0);
    return !Number.isNaN(date.getTime()) && date >= weekStart;
  });
  const weekDistance = weekWorkouts.reduce((sum, workout) => sum + (Number(workout.distance_km) || 0), 0);
  const weekTime = weekWorkouts.reduce((sum, workout) => sum + (Number(workout.duration_sec) || 0), 0);
  const trend = homeTrendState(workouts);

  if (!currentSession?.user) {
    container.innerHTML = `
      <article class="home-empty-card">
        <div class="home-empty-icon">＋</div>
        <div><strong>${escapeHtml(t("homeLatestEmpty"))}</strong><p>${escapeHtml(t("homeLatestEmptyCopy"))}</p></div>
        <button class="home-primary-button" type="button" id="homeSignInButton">${escapeHtml(t("authSignIn"))}</button>
      </article>`;
    document.querySelector("#homeSignInButton")?.addEventListener("click", openAuthModal);
    return;
  }

  const latestHtml = latest ? `
    <article class="home-card home-latest-card">
      <div class="home-card-top"><span class="eyebrow">${escapeHtml(t("homeLatest"))}</span><span class="home-card-date">${escapeHtml(formatHistoryDate(latest.workout_date))}</span></div>
      <div class="home-latest-main">
        <div><h2 data-home-workout="${escapeHtml(latest.id)}" title="${escapeHtml(t("homeViewWorkout"))}" style="cursor:pointer">${escapeHtml(homeWorkoutLabel(latest))}</h2></div>
        <strong>${escapeHtml(formatHistoryDistance(latest.distance_km))}</strong>
      </div>
      <div class="home-metrics">
        <div><span>${escapeHtml(t("pace"))}</span><strong>${escapeHtml(latest.pace || "—")}</strong></div>
        <div><span>${escapeHtml(t("time"))}</span><strong>${escapeHtml(formatHistoryDuration(latest.duration_sec))}</strong></div>
        <div><span>${escapeHtml(t("heartRate"))}</span><strong>${latest.heart_rate != null ? `${Math.round(latest.heart_rate)} ${currentLanguage === "uk" ? "уд/хв" : "bpm"}` : "—"}</strong></div>
      </div>
      <div class="home-latest-footer"><span class="home-insight">${escapeHtml(latest.ai_analysis ? t("homeInsightSaved") : t("homeInsightWorkout"))}</span><button class="home-link-button" type="button" data-home-workout="${escapeHtml(latest.id)}">${escapeHtml(t("homeViewWorkout"))}</button></div>
    </article>` : `
    <article class="home-card home-empty-card"><div><strong>${escapeHtml(t("homeLatestEmpty"))}</strong><p>${escapeHtml(t("homeLatestEmptyCopy"))}</p></div><button class="home-primary-button" type="button" id="homeAddWorkoutButton">＋</button></article>`;

  const trendRows = [
    (() => { const state = homeTrendState(workouts, "easy"); return [t("homeEasy"), state.label, state.tone]; })(),
    (() => { const state = homeTrendState(workouts, "tempo"); return [t("homeTempo"), state.label, state.tone]; })(),
    (() => { const state = homeTrendState(workouts, "intervals"); return [t("homeIntervals"), state.label, state.tone]; })(),
    (() => { const state = homeTrendState(workouts, "long"); return [t("homeLong"), state.label, state.tone]; })()
  ];

  const recentWorkouts = sorted.slice(0, 3);
  const recentHtml = recentWorkouts.length ? recentWorkouts.map(workout => `
    <button class="home-recent-item" type="button" data-home-workout="${escapeHtml(workout.id)}">
      <span class="home-recent-icon" aria-hidden="true"><img class="runory-workout-icon" alt="" src="${RUNORY_ICON_SHOE}"></span>
      <span class="home-recent-copy"><strong>${escapeHtml(homeWorkoutLabel(workout))}</strong><span>${escapeHtml(formatHistoryDate(workout.workout_date))} · ${escapeHtml(workout.pace || "—")}/км · ${escapeHtml(formatHistoryDistance(workout.distance_km))}</span></span>
      
    </button>`).join("") : `<div class="home-recent-empty">Після збереження тренувань вони з'являться тут.</div>`;

  container.innerHTML = `
    <div class="home-grid">
      <div class="home-main-column">${latestHtml}</div>
      <div class="home-side-column">
        <article class="home-card home-week-card">
          <div class="home-card-top"><span class="eyebrow">${escapeHtml(t("homeWeek"))}</span><span class="home-card-date">${escapeHtml(formatWeekLabel(weekStart))} — ${escapeHtml(formatWeekLabel(now))}</span></div>
          ${weekWorkouts.length ? `<div class="home-week-stats"><div><strong>${weekWorkouts.length}</strong><span>${escapeHtml(t("homeWeekWorkouts"))}</span></div><div><strong>${weekDistance.toFixed(2).replace(".", currentLanguage === "uk" ? "," : ".")}</strong><span>${escapeHtml(t("homeWeekDistance"))}</span></div><div><strong>${escapeHtml(formatHomeHours(weekTime))}</strong><span>${escapeHtml(t("homeWeekTime"))}</span></div></div><div class="home-week-days">${[1,2,3,4,5,6,0].map(day => { const d = new Date(weekStart); d.setDate(weekStart.getDate() + (day === 0 ? 6 : day - 1)); const has = weekWorkouts.some(w => { const wd = new Date(w.workout_date || w.created_at || 0); return wd.toDateString() === d.toDateString(); }); return `<span class="${has ? "has-workout" : ""}" title="${escapeHtml(d.toLocaleDateString(translations[currentLanguage].locale, { weekday: "short" }))}"></span>`; }).join("")}</div>` : `<div class="home-week-empty">${escapeHtml(t("homeWeekEmpty"))}</div>`}
        </article>
        <article class="home-card home-form-card">
          <div class="home-card-top"><span class="eyebrow">${escapeHtml(t("homeForm"))}</span><button class="home-outline-button" type="button" id="homeDynamicsButton">${escapeHtml(t("homeViewDynamics"))}</button></div>
          <div class="home-form-list">${trendRows.map(([label, value, tone]) => `<div class="home-form-row"><span>${escapeHtml(label)}</span><strong class="${tone}">${escapeHtml(value)}</strong></div>`).join("")}</div>
        </article>
      </div>
    </div>

    <section class="home-recent-section">
      <div class="home-section-heading"><h2>Останні тренування</h2><button class="home-outline-button" type="button" id="homeHistoryButton">Всі тренування</button></div>
      <div class="home-recent-list">${recentHtml}</div>
    </section>`;

  document.querySelector("#homeDynamicsButton")?.addEventListener("click", () => navigateToView("dynamics"));
  document.querySelector("#homeHistoryButton")?.addEventListener("click", () => navigateToView("history"));
  document.querySelector("#homeAddWorkoutButton")?.addEventListener("click", () => document.querySelector("#addWorkoutButton")?.click());
  document.querySelectorAll("[data-home-workout]").forEach(button => button.addEventListener("click", () => {
    const id = button.dataset.homeWorkout;
    window.history.pushState({ view: "analysis", workoutId: id }, "", `/workouts/${encodeURIComponent(id)}`);
    openWorkoutFromHistoryId(id);
  }));
}

function openWorkoutFromHistoryId(id) {
  const record = historyWorkouts.find(item => String(item.id) === String(id));
  if (!record) return;
  openWorkoutFromHistory(record);
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
    if (!byWeek.has(key)) byWeek.set(key, { date: getWeekStart(date), distance: 0 });
    const row = byWeek.get(key);
    row.distance += Number(workout.distance_km) || 0;
  });

  const weeks = [...byWeek.values()].sort((a, b) => a.date - b.date).slice(-8);
  const maxDistance = Math.max(...weeks.map(w => w.distance), 1);
  const chart = weeks.length ? weeks.map(w => `
    <div class="history-bar-col" title="${escapeHtml(formatWeekRangeLabel(w.date))}: ${escapeHtml(w.distance.toFixed(1))} km">
      <div class="history-bar-track"><div class="history-bar" style="height:${Math.max(5, (w.distance / maxDistance) * 100)}%"></div></div>
      <span>${escapeHtml(formatWeekRangeLabel(w.date))}</span>
      <strong>${escapeHtml(w.distance.toFixed(1))}</strong>
    </div>`).join("") : `<div class="history-chart-empty">${escapeHtml(t("historyNoData"))}</div>`;

  analytics.innerHTML = `
    <div class="history-analytics-heading"><span class="eyebrow">${escapeHtml(t("historyOverview"))}</span></div>
    <article class="history-chart-card">
      <div class="history-card-heading"><h3>${escapeHtml(t("historyWeeklyDistance"))}</h3><span>${escapeHtml(t("historyWeek"))}</span></div>
      <div class="history-bars">${chart}</div>
    </article>`;
}

let dynamicsActiveTab = "easy";
let longDynamicsSubtab = "simple";

function tempoWorkDurationSec(workout) {
  if (!workout) return 0;

  const splits = Array.isArray(workout.splits) ? workout.splits : [];
  const structure = Array.isArray(workout.structure) ? workout.structure : [];
  const summary = {
    distance: Number(workout.distance_km) || 0,
    splits,
    structure
  };

  // First try to reconstruct the actual continuous tempo block.
  // Historical workouts can be re-evaluated differently as the easy-run
  // baseline changes, so this is only the first source of truth.
  const pattern = getWorkoutPattern(summary);
  if (pattern?.type === "tempo") {
    const startIndex = Number(pattern.tempoStart);
    const endIndex = Number(pattern.tempoEnd);

    if (Number.isInteger(startIndex) && Number.isInteger(endIndex) && endIndex >= startIndex) {
      const duration = splits.slice(startIndex, endIndex + 1).reduce((sum, split) => {
        const pace = paceToSeconds(split?.pace);
        return sum + (Number.isFinite(pace) && pace > 0 ? pace : 0);
      }, 0);

      if (duration > 0) return duration;
    }
  }

  // If an explicit tempo block was stored, use it.
  const tempoBlocks = structure.filter(block => block?.type === "tempo");
  if (tempoBlocks.length) {
    const duration = tempoBlocks.reduce((sum, block) => {
      if (Array.isArray(block.items) && block.items.length) {
        return sum + block.items.reduce((itemSum, item) => {
          const pace = paceToSeconds(item?.pace);
          const distanceKm = Number(item?.distance) / 1000;
          return itemSum + (Number.isFinite(pace) && pace > 0 && Number.isFinite(distanceKm) && distanceKm > 0
            ? pace * distanceKm
            : 0);
        }, 0);
      }

      const blockDuration = Number(block?.duration);
      return sum + (Number.isFinite(blockDuration) && blockDuration > 0 ? blockDuration : 0);
    }, 0);

    if (duration > 0) return duration;
  }

  // Finally, trust a workout that was saved as tempo. This is important for
  // older history records whose exact tempo block can no longer be reconstructed.
  const savedType = historyTypeClass(workout.workout_type);
  const derivedType = derivedWorkoutType(workout);
  if (savedType === "tempo" || derivedType === "tempo") {
    const totalDuration = Number(workout.duration_sec);
    if (Number.isFinite(totalDuration) && totalDuration > 0) return totalDuration;

    const pace = paceToSeconds(workout.pace);
    const distance = Number(workout.distance_km);
    if (Number.isFinite(pace) && pace > 0 && Number.isFinite(distance) && distance > 0) {
      return pace * distance;
    }
  }

  return 0;
}

function tempoComparable(current, candidate) {
  const currentDuration = tempoWorkDurationSec(current);
  const candidateDuration = tempoWorkDurationSec(candidate);

  if (currentDuration <= 0 || candidateDuration <= 0) return false;

  const ratio = candidateDuration / currentDuration;
  return ratio >= 0.70 && ratio <= 1.30;
}

function formatTempoDuration(seconds) {
  if (!Number.isFinite(Number(seconds)) || Number(seconds) <= 0) return "—";
  const total = Math.round(Number(seconds));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  if (hours) return `${hours} год ${String(minutes).padStart(2, "0")} хв`;
  return `${minutes} хв`;
}

function buildTempoDynamics(workouts) {
  const tempo = workouts
    .filter(w =>
      historyTypeClass(w?.workout_type) === "tempo"
      || derivedWorkoutType(w) === "tempo"
    )
    .filter(w => paceToSeconds(w.pace) != null)
    .sort((a, b) => new Date(a.workout_date) - new Date(b.workout_date));
  if (tempo.length < 2) return null;

  const current = tempo.at(-1);
  const candidates = tempo.slice(0, -1).filter(w => tempoComparable(current, w));
  if (!candidates.length) return null;

  const currentVolume = tempoWorkDurationSec(current);
  const ranked = candidates
    .map(w => ({
      workout: w,
      volumeDistance: Math.abs(tempoWorkDurationSec(w) - currentVolume)
    }))
    .sort((a, b) => a.volumeDistance - b.volumeDistance || new Date(b.workout.workout_date) - new Date(a.workout.workout_date));

  const similar = ranked.slice(0, Math.min(5, ranked.length)).map(item => item.workout);
  const paceBaseline = median(similar.map(w => paceToSeconds(w.pace)));
  const hrValues = similar.map(w => Number(w.heart_rate)).filter(v => Number.isFinite(v) && v > 0);
  const hrBaseline = hrValues.length ? median(hrValues) : null;
  const currentPace = paceToSeconds(current.pace);
  const currentHr = Number(current.heart_rate);
  const paceDelta = paceBaseline != null ? paceBaseline - currentPace : null;
  const hrDelta = Number.isFinite(currentHr) && hrBaseline != null ? currentHr - hrBaseline : null;

  const ordered = similar.slice().sort((a, b) => new Date(a.workout_date) - new Date(b.workout_date));
  const split = Math.floor(ordered.length / 2);
  const older = ordered.slice(0, split);
  const recent = ordered.slice(split);
  const olderPace = median(older.map(w => paceToSeconds(w.pace)));
  const recentPace = median(recent.map(w => paceToSeconds(w.pace)));
  const olderHrValues = older.map(w => Number(w.heart_rate)).filter(v => Number.isFinite(v) && v > 0);
  const recentHrValues = recent.map(w => Number(w.heart_rate)).filter(v => Number.isFinite(v) && v > 0);
  const olderHr = olderHrValues.length ? median(olderHrValues) : null;
  const recentHr = recentHrValues.length ? median(recentHrValues) : null;

  let trend = "stable";
  if (ordered.length >= 4) {
    const paceTrend = olderPace != null && recentPace != null
      ? (olderPace - recentPace >= 4 ? "improved" : olderPace - recentPace <= -4 ? "declined" : "stable")
      : null;
    const hrTrend = olderHr != null && recentHr != null
      ? (recentHr - olderHr <= -2 ? "improved" : recentHr - olderHr >= 2 ? "declined" : "stable")
      : null;
    if (paceTrend === "improved" && (hrTrend === "improved" || hrTrend === "stable" || hrTrend == null)) trend = "improved";
    else if (paceTrend === "declined" && (hrTrend === "declined" || hrTrend === "stable" || hrTrend == null)) trend = "declined";
    else if (hrTrend === "improved" && paceTrend === "stable") trend = "improved";
    else if (hrTrend === "declined" && paceTrend === "stable") trend = "declined";
  }

  return { current, previous: similar.at(-1), count: similar.length, currentVolume, paceBaseline, hrBaseline, paceDelta, hrDelta, trend };
}


function intervalWorkoutProfile(workout) {
  const summary = {
    distance: Number(workout?.distance_km) || 0,
    splits: Array.isArray(workout?.splits) ? workout.splits : [],
    structure: Array.isArray(workout?.structure) ? workout.structure : []
  };
  const analysis = getIntervalAnalysis(summary);
  if (!analysis || !analysis.reps.length) return null;

  const reps = analysis.reps;
  const workDistances = reps
    .map(rep => Number(rep?.work?.distance))
    .filter(value => Number.isFinite(value) && value > 0);
  const workDurations = reps
    .map(rep => Number(rep?.work?.duration))
    .filter(value => Number.isFinite(value) && value > 0);

  const medianDistance = workDistances.length ? median(workDistances) : null;
  const medianDuration = workDurations.length ? median(workDurations) : null;
  const distanceSpread = medianDistance ? (Math.max(...workDistances) - Math.min(...workDistances)) / medianDistance : Infinity;
  const durationSpread = medianDuration ? (Math.max(...workDurations) - Math.min(...workDurations)) / medianDuration : Infinity;

  // Distinguish time-based reps (e.g. 10×5:00) from distance-based reps.
  // Garmin records duration for both, so duration alone is not enough:
  // a 2 km rep can also take almost exactly the same time every repetition.
  // Prefer distance when it matches a recognizable distance target (400/600/800/1000/1600/2000/3000 m).
  const standardDistances = [200, 300, 400, 600, 800, 1000, 1200, 1600, 2000, 3000, 5000];
  const hasRecognizableDistanceTarget = workDistances.length === reps.length && workDistances.length > 0
    && workDistances.every(distance => standardDistances.some(target => Math.abs(distance - target) / target <= 0.05));
  const isTimeBased = !hasRecognizableDistanceTarget
    && workDurations.length === reps.length
    && durationSpread <= 0.05;

  // Distance-based sessions can have one or several distinct consecutive sets.
  // Example: 4×1600 + 4×800 must remain exactly that, not 8×1200.
  const distanceGroups = [];
  if (!isTimeBased && workDistances.length === reps.length) {
    for (const rep of reps) {
      const distance = Number(rep?.work?.distance);
      const last = distanceGroups.at(-1);
      if (last && last.distance > 0 && Math.abs(distance - last.distance) / last.distance <= 0.05) {
        last.count += 1;
        last.distances.push(distance);
      } else {
        distanceGroups.push({ count: 1, distance, distances: [distance] });
      }
    }
  }

  const singleDistance = !isTimeBased && distanceGroups.length === 1;
  const mixedDistance = !isTimeBased && distanceGroups.length > 1;

  const setLabel = isTimeBased
    ? `${reps.length} × ${formatIntervalDuration(medianDuration)}`
    : mixedDistance
      ? distanceGroups.map(group => `${group.count} × ${formatIntervalRepDistance(median(group.distances))}`).join(" + ")
      : singleDistance
        ? `${reps.length} × ${formatIntervalRepDistance(medianDistance)}`
        : `${reps.length} × ${formatIntervalRepDistance(medianDistance)}`;

  return {
    analysis,
    reps: reps.length,
    mode: isTimeBased ? "time" : mixedDistance ? "mixed-distance" : "distance",
    repDistance: singleDistance ? medianDistance : null,
    repDuration: isTimeBased ? medianDuration : null,
    groups: distanceGroups,
    setLabel,
    averagePace: analysis.average,
    averageHr: reps
      .map(rep => Number(rep?.work?.heartRate))
      .filter(value => Number.isFinite(value) && value > 0)
      .reduce((sum, value, _, arr) => sum + value / arr.length, 0) || null,
    totalWorkDistance: analysis.totalWorkDistance
  };
}

function formatIntervalDuration(seconds) {
  if (!Number.isFinite(seconds) || seconds <= 0) return "—";
  const total = Math.round(seconds);
  const minutes = Math.floor(total / 60);
  const secs = String(total % 60).padStart(2, "0");
  return `${minutes}:${secs}`;
}

function formatIntervalRepDistance(meters) {
  if (!Number.isFinite(meters) || meters <= 0) return "—";
  if (meters >= 1000) {
    const km = meters / 1000;
    return `${Number(km.toFixed(2)).toString().replace(".", currentLanguage === "uk" ? "," : ".")} ${currentLanguage === "uk" ? "км" : "km"}`;
  }
  return `${Math.round(meters)} ${currentLanguage === "uk" ? "м" : "m"}`;
}

function intervalComparable(current, candidate) {
  const currentProfile = intervalWorkoutProfile(current);
  const candidateProfile = intervalWorkoutProfile(candidate);
  if (!currentProfile || !candidateProfile) return false;

  // Time-based intervals compare only with time-based intervals of the same
  // duration. Distance covered during the work rep is deliberately ignored.
  if (currentProfile.mode === "time" || candidateProfile.mode === "time") {
    if (currentProfile.mode !== "time" || candidateProfile.mode !== "time") return false;
    if (currentProfile.repDuration == null || candidateProfile.repDuration == null) return false;
    const ratio = candidateProfile.repDuration / currentProfile.repDuration;
    return ratio >= 0.85 && ratio <= 1.15;
  }

  // A single-distance set (7×1 km, 10×1 km, 15×400 m, etc.) compares by the
  // distance of one work repetition. The number of reps may differ.
  if (currentProfile.mode === "distance" || candidateProfile.mode === "distance") {
    if (currentProfile.mode !== "distance" || candidateProfile.mode !== "distance") return false;
    if (currentProfile.repDistance == null || candidateProfile.repDistance == null) return false;
    const ratio = candidateProfile.repDistance / currentProfile.repDistance;
    // Allow different but still comparable work distances, e.g. 20×400 m
    // and 10×600 m, while keeping clearly different interval formats apart.
    return ratio >= 0.67 && ratio <= 1.50;
  }

  // Mixed-distance sessions must preserve their multi-part structure. A
  // 4×1600 + 4×800 session is comparable only with another two-part session
  // with the same order of work distances (within ±15%). Counts may differ.
  if (currentProfile.mode === "mixed-distance" && candidateProfile.mode === "mixed-distance") {
    const a = currentProfile.groups || [];
    const b = candidateProfile.groups || [];
    if (a.length !== b.length || !a.length) return false;
    return a.every((group, index) => {
      const other = b[index];
      if (!other || !Number.isFinite(group.distance) || !Number.isFinite(other.distance)) return false;
      const ratio = other.distance / group.distance;
      return ratio >= 0.85 && ratio <= 1.15;
    });
  }

  return false;
}

function buildIntervalDynamics(workouts) {
  const intervals = workouts
    .filter(w => {
      const type = historyTypeClass(w?.workout_type);
      // Regular interval sessions are included as before. Long runs with a
      // real interval block are also eligible: the quality work inside them
      // can be compared with standalone interval sessions.
      return type === "intervals"
        || derivedWorkoutType(w) === "intervals"
        || (derivedWorkoutType(w) === "long" && intervalWorkoutProfile(w));
    })
    .map(workout => ({ workout, profile: intervalWorkoutProfile(workout) }))
    .filter(item => item.profile && Number.isFinite(item.profile.averagePace))
    .sort((a, b) => new Date(a.workout.workout_date) - new Date(b.workout.workout_date));

  if (intervals.length < 2) return null;

  const currentItem = intervals.at(-1);
  const candidates = intervals
    .slice(0, -1)
    .filter(item => intervalComparable(currentItem.workout, item.workout));

  if (!candidates.length) return null;

  const current = currentItem.workout;
  const currentProfile = currentItem.profile;
  const ranked = candidates
    .map(item => ({
      ...item,
      distanceDifference: currentProfile.repDistance != null && item.profile.repDistance != null
        ? Math.abs(item.profile.repDistance - currentProfile.repDistance)
        : Infinity,
      durationDifference: currentProfile.repDuration != null && item.profile.repDuration != null
        ? Math.abs(item.profile.repDuration - currentProfile.repDuration)
        : Infinity
    }))
    .sort((a, b) =>
      (a.distanceDifference - b.distanceDifference) ||
      (a.durationDifference - b.durationDifference) ||
      (new Date(b.workout.workout_date) - new Date(a.workout.workout_date))
    );

  const similar = ranked.slice(0, Math.min(5, ranked.length));
  const paceBaseline = median(similar.map(item => item.profile.averagePace));
  const hrValues = similar.map(item => item.profile.averageHr).filter(Number.isFinite);
  const hrBaseline = hrValues.length ? median(hrValues) : null;
  const paceDelta = paceBaseline != null ? paceBaseline - currentProfile.averagePace : null;
  const hrDelta = Number.isFinite(currentProfile.averageHr) && hrBaseline != null
    ? currentProfile.averageHr - hrBaseline
    : null;

  const ordered = similar.slice().sort((a, b) => new Date(a.workout.workout_date) - new Date(b.workout.workout_date));
  const split = Math.floor(ordered.length / 2);
  const older = ordered.slice(0, split);
  const recent = ordered.slice(split);
  const olderPace = median(older.map(item => item.profile.averagePace));
  const recentPace = median(recent.map(item => item.profile.averagePace));
  const olderHr = median(older.map(item => item.profile.averageHr).filter(Number.isFinite));
  const recentHr = median(recent.map(item => item.profile.averageHr).filter(Number.isFinite));

  let trend = "stable";
  if (ordered.length >= 4) {
    const paceTrend = olderPace != null && recentPace != null
      ? (olderPace - recentPace >= 4 ? "improved" : olderPace - recentPace <= -4 ? "declined" : "stable")
      : null;
    const hrTrend = olderHr != null && recentHr != null
      ? (recentHr - olderHr <= -2 ? "improved" : recentHr - olderHr >= 2 ? "declined" : "stable")
      : null;
    if (paceTrend === "improved" && (hrTrend === "improved" || hrTrend === "stable" || hrTrend == null)) trend = "improved";
    else if (paceTrend === "declined" && (hrTrend === "declined" || hrTrend === "stable" || hrTrend == null)) trend = "declined";
    else if (hrTrend === "improved" && paceTrend === "stable") trend = "improved";
    else if (hrTrend === "declined" && paceTrend === "stable") trend = "declined";
  }

  return {
    current,
    currentProfile,
    previous: similar.at(-1)?.workout || null,
    previousProfile: similar.at(-1)?.profile || null,
    count: similar.length,
    paceBaseline,
    hrBaseline,
    paceDelta,
    hrDelta,
    trend
  };
}


function longRunProfile(workout) {
  if (!workout) return null;
  const structure = Array.isArray(workout.structure) ? workout.structure : [];
  const intervalIndex = structure.findIndex(block =>
    block?.type === "intervals" && Array.isArray(block.repetitions) && block.repetitions.length > 0
  );
  const distance = Number(workout.distance_km);
  const pace = paceToSeconds(workout.pace);
  const hr = Number(workout.heart_rate);
  if (!Number.isFinite(distance) || distance <= 0 || !Number.isFinite(pace)) return null;

  const hasWork = intervalIndex >= 0;
  if (!hasWork) {
    if (derivedWorkoutType(workout) !== "long") return null;
    return {
      kind: "simple",
      distance,
      pace,
      hr: Number.isFinite(hr) && hr > 0 ? hr : null,
      ascent: Number(workout.ascent_m),
      workProfile: null
    };
  }

  const before = structure.slice(0, intervalIndex);
  const preWorkDistance = before.reduce((sum, block) => {
    if (!block || ["intervals", "recovery", "cooldown"].includes(block.type)) return sum;
    return sum + (Number(block.distance) || 0);
  }, 0) / 1000;
  // Dynamics should not depend on the stored/derived type here: older
  // workouts may have been classified differently even though their actual
  // structure is clearly a long run with work. Use the same long-run shape
  // rule directly for the dynamics profile.
  if (distance < 16 || preWorkDistance < 10 || preWorkDistance / Math.max(distance, 0.1) < 0.30) return null;

  const workProfile = intervalWorkoutProfile(workout);
  if (!workProfile) return null;

  return {
    kind: "with_work",
    distance,
    pace,
    hr: Number.isFinite(hr) && hr > 0 ? hr : null,
    ascent: Number(workout.ascent_m),
    preWorkDistance,
    workProfile
  };
}

function longWorkStructureComparable(a, b) {
  if (!a?.workProfile || !b?.workProfile) return false;
  const x = a.workProfile;
  const y = b.workProfile;
  if (x.mode !== y.mode) return false;

  if (x.mode === "time") {
    if (x.repDuration == null || y.repDuration == null) return false;
    const ratio = y.repDuration / x.repDuration;
    return ratio >= 0.85 && ratio <= 1.15;
  }

  if (x.mode === "distance") {
    if (x.repDistance == null || y.repDistance == null) return false;
    const ratio = y.repDistance / x.repDistance;
    return ratio >= 0.85 && ratio <= 1.15;
  }

  const gx = x.groups || [];
  const gy = y.groups || [];
  if (gx.length !== gy.length || !gx.length) return false;
  return gx.every((group, index) => {
    const other = gy[index];
    if (!other || !Number.isFinite(group.distance) || !Number.isFinite(other.distance)) return false;
    const ratio = other.distance / group.distance;
    return ratio >= 0.85 && ratio <= 1.15;
  });
}

function longComparable(current, candidate) {
  const a = longRunProfile(current);
  const b = longRunProfile(candidate);
  if (!a || !b || a.kind !== b.kind) return false;

  const distanceRatio = b.distance / a.distance;
  if (distanceRatio < 0.80 || distanceRatio > 1.25) return false;

  if (a.kind === "simple") return true;

  const preRatio = b.preWorkDistance / Math.max(a.preWorkDistance, 0.1);
  if (preRatio < 0.70 || preRatio > 1.43) return false;

  // Long runs with work are a separate family, but the work block itself
  // does not have to be identical to count as a useful comparison. For
  // example, 4×2 km and 5×~9 min can still be comparable long-with-work
  // sessions when total distance and distance before the work are similar.
  // Keep the exact work structure for display, but don't let it suppress
  // the higher-level long-run comparison.
  return true;
}

function buildLongDynamics(workouts) {
  const longs = workouts
    .map(workout => ({ workout, profile: longRunProfile(workout) }))
    .filter(item => item.profile)
    .sort((a, b) => new Date(a.workout.workout_date) - new Date(b.workout.workout_date));

  const targetKind = longDynamicsSubtab === "with_work" ? "with_work" : "simple";
  const filtered = longs.filter(item => item.profile.kind === targetKind);
  if (filtered.length < 2) return null;

  const currentItem = filtered.at(-1);
  const candidates = filtered.slice(0, -1).filter(item => longComparable(currentItem.workout, item.workout));
  if (!candidates.length) return null;

  const ranked = candidates
    .map(item => ({
      ...item,
      distanceDifference: Math.abs(item.profile.distance - currentItem.profile.distance),
      preWorkDifference: currentItem.profile.kind === "with_work"
        ? Math.abs(item.profile.preWorkDistance - currentItem.profile.preWorkDistance)
        : 0
    }))
    .sort((a, b) =>
      (a.distanceDifference - b.distanceDifference) ||
      (a.preWorkDifference - b.preWorkDifference) ||
      (new Date(b.workout.workout_date) - new Date(a.workout.workout_date))
    );

  const similar = ranked.slice(0, Math.min(5, ranked.length));
  const paceBaseline = median(similar.map(item => item.profile.pace));
  const hrBaseline = median(similar.map(item => item.profile.hr).filter(Number.isFinite));
  const current = currentItem.profile;
  const paceDelta = paceBaseline != null ? paceBaseline - current.pace : null;
  const hrDelta = current.hr != null && hrBaseline != null ? current.hr - hrBaseline : null;

  const ordered = similar.slice().sort((a, b) => new Date(a.workout.workout_date) - new Date(b.workout.workout_date));
  const split = Math.floor(ordered.length / 2);
  const older = ordered.slice(0, split);
  const recent = ordered.slice(split);
  const olderPace = median(older.map(item => item.profile.pace));
  const recentPace = median(recent.map(item => item.profile.pace));
  const olderHr = median(older.map(item => item.profile.hr).filter(Number.isFinite));
  const recentHr = median(recent.map(item => item.profile.hr).filter(Number.isFinite));

  let trend = "stable";
  if (ordered.length >= 4) {
    const paceTrend = olderPace != null && recentPace != null
      ? (olderPace - recentPace >= 5 ? "improved" : olderPace - recentPace <= -5 ? "declined" : "stable")
      : null;
    const hrTrend = olderHr != null && recentHr != null
      ? (recentHr - olderHr <= -2 ? "improved" : recentHr - olderHr >= 2 ? "declined" : "stable")
      : null;
    if (paceTrend === "improved" && (hrTrend === "improved" || hrTrend === "stable" || hrTrend == null)) trend = "improved";
    else if (paceTrend === "declined" && (hrTrend === "declined" || hrTrend === "stable" || hrTrend == null)) trend = "declined";
    else if (hrTrend === "improved" && paceTrend === "stable") trend = "improved";
    else if (hrTrend === "declined" && paceTrend === "stable") trend = "declined";
  }

  return {
    current: currentItem.workout,
    currentProfile: current,
    previous: similar.at(-1)?.workout || null,
    previousProfile: similar.at(-1)?.profile || null,
    count: similar.length,
    paceBaseline,
    hrBaseline,
    paceDelta,
    hrDelta,
    trend
  };
}

function renderLongDynamics(workouts) {
  const dynamics = buildLongDynamics(workouts);
  const subtab = longDynamicsSubtab === "with_work" ? t("historyLongWithWork") : t("historyLongSimple");
  if (!dynamics) {
    return `<div class="dynamics-empty"><strong>${escapeHtml(t("historyLongNoTrend"))}</strong><p>${escapeHtml(t("historyLongHint"))}</p></div>`;
  }

  const paceText = Number.isFinite(dynamics.paceDelta) && Math.abs(dynamics.paceDelta) >= 2
    ? t(dynamics.paceDelta > 0 ? "historyLongFaster" : "historyLongSlower", { value: Math.abs(Math.round(dynamics.paceDelta)) })
    : t("historyLongNoChange");
  const hrText = Number.isFinite(dynamics.hrDelta) && Math.abs(dynamics.hrDelta) >= 2
    ? t(dynamics.hrDelta < 0 ? "historyLongHrLower" : "historyLongHrHigher", { value: Math.abs(Math.round(dynamics.hrDelta)) })
    : t("historyLongNoChange");
  let trendLabel = dynamics.count === 1 ? t("historyLongComparisonOnly") : t("historyLongStable");
  if (dynamics.count > 1 && dynamics.trend === "improved") trendLabel = t("historyLongImproved");
  else if (dynamics.count > 1 && dynamics.trend === "declined") trendLabel = t("historyLongDeclined");

  const profile = dynamics.currentProfile;
  const workText = profile.kind === "with_work" && profile.workProfile
    ? profile.workProfile.setLabel
    : null;
  const previousWork = dynamics.previousProfile?.kind === "with_work" && dynamics.previousProfile.workProfile
    ? dynamics.previousProfile.workProfile.setLabel
    : null;
  const previous = dynamics.previous
    ? `${formatHistoryDate(dynamics.previous.workout_date)} · ${formatHistoryDistance(dynamics.previous.distance_km)} · ${dynamics.previous.pace || "—"}/км${previousWork ? ` · ${previousWork}` : ""}`
    : "—";

  return `
    <div class="history-dynamic-status"><strong>${escapeHtml(trendLabel)}</strong><span>${escapeHtml(t("historyLongCompared").replace("{count}", String(dynamics.count)))}</span></div>
    <div class="history-dynamic-row"><span>${escapeHtml(t("historyLongPace"))}</span><strong>${escapeHtml(profile.pace != null ? formatPaceSeconds(profile.pace) : "—")}/км <small>${escapeHtml(paceText)}</small></strong></div>
    <div class="history-dynamic-row"><span>${escapeHtml(t("historyLongHr"))}</span><strong>${profile.hr != null ? `${Math.round(profile.hr)} уд/хв` : "—"} <small>${escapeHtml(hrText)}</small></strong></div>
    <div class="history-dynamic-row"><span>${escapeHtml(t("historyLongDistance"))}</span><strong>${escapeHtml(formatHistoryDistance(profile.distance))}</strong></div>
    ${workText ? `<div class="history-dynamic-row"><span>${escapeHtml(t("historyLongWork"))}</span><strong>${escapeHtml(workText)}</strong></div>` : ""}
    <p>${escapeHtml(subtab)} · ${escapeHtml(t("historyLongLatest"))}: ${escapeHtml(formatHistoryDate(dynamics.current.workout_date))} · ${escapeHtml(t("historyLongPrevious"))}: ${escapeHtml(previous)}</p>`;
}

function renderIntervalDynamics(workouts) {
  const dynamics = buildIntervalDynamics(workouts);
  if (!dynamics) {
    return `<div class="dynamics-empty"><strong>${escapeHtml(t("historyIntervalNoTrend"))}</strong><p>${escapeHtml(t("historyIntervalHint"))}</p></div>`;
  }

  const paceText = Number.isFinite(dynamics.paceDelta) && Math.abs(dynamics.paceDelta) >= 2
    ? t(dynamics.paceDelta > 0 ? "historyIntervalFaster" : "historyIntervalSlower", { value: Math.abs(Math.round(dynamics.paceDelta)) })
    : t("historyIntervalNoChange");
  const hrText = Number.isFinite(dynamics.hrDelta) && Math.abs(dynamics.hrDelta) >= 2
    ? t(dynamics.hrDelta < 0 ? "historyIntervalHrLower" : "historyIntervalHrHigher", { value: Math.abs(Math.round(dynamics.hrDelta)) })
    : t("historyIntervalNoChange");

  let trendLabel = dynamics.count === 1 ? t("historyIntervalComparisonOnly") : t("historyIntervalStable");
  if (dynamics.count > 1 && dynamics.trend === "improved") trendLabel = t("historyIntervalImproved");
  else if (dynamics.count > 1 && dynamics.trend === "declined") trendLabel = t("historyIntervalDeclined");

  const compared = t("historyIntervalCompared").replace("{count}", String(dynamics.count));
  const profile = dynamics.currentProfile;
  const setText = profile.setLabel || `${profile.reps} × ${formatIntervalRepDistance(profile.repDistance)}`;
  const workVolume = profile.totalWorkDistance / 1000;
  const volumeText = `${Number(workVolume.toFixed(2)).toString().replace(".", currentLanguage === "uk" ? "," : ".")} ${currentLanguage === "uk" ? "км" : "km"}`;
  const previous = dynamics.previous && dynamics.previousProfile
    ? `${formatHistoryDate(dynamics.previous.workout_date)} · ${dynamics.previousProfile.reps} × ${formatIntervalRepDistance(dynamics.previousProfile.repDistance)} · ${formatInsightPace(dynamics.previousProfile.averagePace)}/км`
    : "—";

  return `
    <div class="history-dynamic-status"><strong>${escapeHtml(trendLabel)}</strong><span>${escapeHtml(compared)}</span></div>
    <div class="history-dynamic-row"><span>${escapeHtml(t("historyIntervalPace"))}</span><strong>${escapeHtml(formatInsightPace(profile.averagePace))}/км <small>${escapeHtml(paceText)}</small></strong></div>
    <div class="history-dynamic-row"><span>${escapeHtml(t("historyIntervalHr"))}</span><strong>${Number.isFinite(profile.averageHr) ? `${Math.round(profile.averageHr)} уд/хв` : "—"} <small>${escapeHtml(hrText)}</small></strong></div>
    <div class="history-dynamic-row"><span>${escapeHtml(t("historyIntervalStructure"))}</span><strong>${escapeHtml(setText)}</strong></div>
    <div class="history-dynamic-row"><span>${escapeHtml(t("historyIntervalVolume"))}</span><strong>${escapeHtml(volumeText)}</strong></div>
    <p>${escapeHtml(t("historyIntervalLatest"))}: ${escapeHtml(formatHistoryDate(dynamics.current.workout_date))} · ${escapeHtml(t("historyIntervalPrevious"))}: ${escapeHtml(previous)}</p>`;
}

function renderTempoDynamics(workouts) {
  const dynamics = buildTempoDynamics(workouts);
  if (!dynamics) {
    return `<div class="dynamics-empty"><strong>${escapeHtml(t("historyTempoNoTrend"))}</strong><p>${escapeHtml(t("historyTempoHint"))}</p></div>`;
  }

  const paceText = Number.isFinite(dynamics.paceDelta) && Math.abs(dynamics.paceDelta) >= 2
    ? t(dynamics.paceDelta > 0 ? "historyTempoFaster" : "historyTempoSlower", { value: Math.abs(Math.round(dynamics.paceDelta)) })
    : t("historyTempoNoChange");
  const hrText = Number.isFinite(dynamics.hrDelta) && Math.abs(dynamics.hrDelta) >= 2
    ? t(dynamics.hrDelta < 0 ? "historyTempoHrLower" : "historyTempoHrHigher", { value: Math.abs(Math.round(dynamics.hrDelta)) })
    : t("historyTempoNoChange");

  let trendLabel = dynamics.count === 1 ? t("historyTempoComparisonOnly") : t("historyTempoStable");
  if (dynamics.count > 1 && dynamics.trend === "improved") trendLabel = t("historyTempoImproved");
  else if (dynamics.count > 1 && dynamics.trend === "declined") trendLabel = t("historyTempoDeclined");

  const compared = t("historyTempoCompared").replace("{count}", String(dynamics.count));
  const volume = formatTempoDuration(dynamics.currentVolume);
  const previous = dynamics.previous
    ? `${formatHistoryDate(dynamics.previous.workout_date)} · ${dynamics.previous.pace || "—"}/км · ${formatTempoDuration(tempoWorkDurationSec(dynamics.previous))}`
    : "—";

  return `
    <div class="history-dynamic-status"><strong>${escapeHtml(trendLabel)}</strong><span>${escapeHtml(compared)}</span></div>
    <div class="history-dynamic-row"><span>${escapeHtml(t("historyTempoPace"))}</span><strong>${escapeHtml(dynamics.current.pace || "—")} <small>${escapeHtml(paceText)}</small></strong></div>
    <div class="history-dynamic-row"><span>${escapeHtml(t("historyTempoHr"))}</span><strong>${Number.isFinite(Number(dynamics.current.heart_rate)) ? `${Math.round(Number(dynamics.current.heart_rate))} уд/хв` : "—"} <small>${escapeHtml(hrText)}</small></strong></div>
    <div class="history-dynamic-row"><span>${escapeHtml(t("historyTempoVolume"))}</span><strong>${escapeHtml(volume)}</strong></div>
    <p>${escapeHtml(t("historyTempoLatest"))}: ${escapeHtml(formatHistoryDate(dynamics.current.workout_date))} · ${escapeHtml(t("historyTempoPrevious"))}: ${escapeHtml(previous)}</p>`;
}

function renderDynamics(workouts) {
  const container = document.querySelector("#dynamicsContent");
  if (!container) return;

  const dynamics = buildEasyRunDynamics(workouts);
  let contentHtml = "";

  if (dynamicsActiveTab === "tempo") {
    contentHtml = renderTempoDynamics(workouts);
  } else if (dynamicsActiveTab === "intervals") {
    contentHtml = renderIntervalDynamics(workouts);
  } else if (dynamicsActiveTab === "long") {
    contentHtml = renderLongDynamics(workouts);
  } else {
    let easyHtml;
    if (!dynamics) {
      easyHtml = `<div class="dynamics-empty"><strong>${escapeHtml(t("historyEasyNoTrend"))}</strong><p>${escapeHtml(t("historyEasyDynamicsHint"))}</p></div>`;
    } else {
      const paceDeltaText = Number.isFinite(dynamics.paceDelta) && Math.abs(dynamics.paceDelta) >= 3
        ? `${dynamics.paceDelta > 0 ? "повільніше" : "швидше"} на ${Math.abs(Math.round(dynamics.paceDelta))} с/км`
        : "без суттєвої зміни";
      const hrDeltaText = Number.isFinite(dynamics.hrDelta) && Math.abs(dynamics.hrDelta) >= 1
        ? `${dynamics.hrDelta < 0 ? "нижче" : "вище"} на ${Math.abs(Math.round(dynamics.hrDelta))} уд/хв`
        : "без суттєвої зміни";
      const currentPaceSignal = Number.isFinite(dynamics.paceDelta) && Math.abs(dynamics.paceDelta) >= 6 ? (dynamics.paceDelta > 0 ? "better" : "worse") : "neutral";
      const currentHrSignal = Number.isFinite(dynamics.hrDelta) && Math.abs(dynamics.hrDelta) >= 3 ? (dynamics.hrDelta < 0 ? "better" : "worse") : "neutral";
      let trendLabel;
      if (dynamics.count === 1) trendLabel = t("historyEasyComparisonOnly");
      else if (dynamics.trend === "improved") trendLabel = t("historyEasyImproved");
      else if (dynamics.trend === "declined") trendLabel = t("historyEasyDeclined");
      else if ((currentPaceSignal === "better" && currentHrSignal === "worse") || (currentPaceSignal === "worse" && currentHrSignal === "better")) trendLabel = t("historyEasyMixed");
      else if (currentPaceSignal === "better" && currentHrSignal === "better") trendLabel = t("historyEasyCurrentBetter");
      else if (currentPaceSignal === "worse" && currentHrSignal === "worse") trendLabel = t("historyEasyCurrentWorse");
      else if (currentPaceSignal !== "neutral" || currentHrSignal !== "neutral") trendLabel = t("historyEasyNearTypical");
      else trendLabel = t("historyEasyStable");
      const compared = t("historyEasyCompared").replace("{count}", String(dynamics.count));
      const trendHint = dynamics.count < 4 ? t("historyEasyTrendHint") : t("historyEasyDynamicsHint");

      easyHtml = `
        <div class="history-dynamic-status"><strong>${escapeHtml(trendLabel)}</strong><span>${escapeHtml(compared)}</span></div>
        <div class="history-dynamic-row"><span>${escapeHtml(t("historyEasyPaceAtHr"))}</span><strong>${escapeHtml(dynamics.paceBaseline != null ? formatPaceSeconds(dynamics.paceBaseline) : "—")} <small>${escapeHtml(paceDeltaText)}</small></strong></div>
        <div class="history-dynamic-row"><span>${escapeHtml(t("historyEasyHrAtPace"))}</span><strong>${dynamics.hrBaseline != null ? `${Math.round(dynamics.hrBaseline)} уд/хв` : "—"} <small>${escapeHtml(hrDeltaText)}</small></strong></div>
        <p>${escapeHtml(trendHint)}</p>`;
    }
    contentHtml = easyHtml;
  }

  container.innerHTML = `
    <div class="dynamics-tabs" role="tablist" aria-label="${escapeHtml(t("dynamicsTitle"))}">
      <button class="dynamics-tab ${dynamicsActiveTab === "easy" ? "is-active" : ""}" type="button" data-dynamics-tab="easy">${escapeHtml(t("dynamicsEasy"))}</button>
      <button class="dynamics-tab ${dynamicsActiveTab === "tempo" ? "is-active" : ""}" type="button" data-dynamics-tab="tempo">${escapeHtml(t("dynamicsTempo"))}</button>
      <button class="dynamics-tab ${dynamicsActiveTab === "intervals" ? "is-active" : ""}" type="button" data-dynamics-tab="intervals">${escapeHtml(t("dynamicsIntervals"))}</button>
      <button class="dynamics-tab ${dynamicsActiveTab === "long" ? "is-active" : ""}" type="button" data-dynamics-tab="long">${escapeHtml(t("dynamicsLong"))}</button>
    </div>
    <article class="dynamics-module">
      <div class="dynamics-module-heading"><div><span class="eyebrow">${escapeHtml(dynamicsActiveTab === "tempo" ? t("dynamicsTempo") : dynamicsActiveTab === "intervals" ? t("dynamicsIntervals") : dynamicsActiveTab === "long" ? (longDynamicsSubtab === "with_work" ? t("historyLongWithWork") : t("historyLongSimple")) : t("dynamicsEasy"))}</span><h2>${escapeHtml(dynamicsActiveTab === "tempo" ? t("historyTempoDynamics") : dynamicsActiveTab === "intervals" ? t("historyIntervalDynamics") : dynamicsActiveTab === "long" ? t("historyLongDynamics") : t("historyEasyDynamics"))}</h2></div></div>
      ${dynamicsActiveTab === "long" ? `<div class="dynamics-tabs" role="tablist" aria-label="${escapeHtml(t("historyLongDynamics"))}">
        <button class="dynamics-tab ${longDynamicsSubtab === "simple" ? "is-active" : ""}" type="button" data-long-dynamics-tab="simple">${escapeHtml(t("historyLongSimple"))}</button>
        <button class="dynamics-tab ${longDynamicsSubtab === "with_work" ? "is-active" : ""}" type="button" data-long-dynamics-tab="with_work">${escapeHtml(t("historyLongWithWork"))}</button>
      </div>` : ""}
      ${contentHtml}
    </article>`;

  container.querySelectorAll("[data-dynamics-tab]").forEach(button => {
    button.addEventListener("click", () => {
      dynamicsActiveTab = button.dataset.dynamicsTab || "easy";
      renderDynamics(workouts);
    });
  });
  container.querySelectorAll("[data-long-dynamics-tab]").forEach(button => {
    button.addEventListener("click", () => {
      longDynamicsSubtab = button.dataset.longDynamicsTab || "simple";
      renderDynamics(workouts);
    });
  });
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
        <div class="history-empty-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M6 18.2c2.2 0 4-1.3 5-3.3l1.4-2.8c.7-1.5 2.2-2.5 3.9-2.5 1.2 0 2.3.4 3.2 1.1"></path><path d="M8.3 10.2 6.8 7.5a1.5 1.5 0 0 1 2.6-1.5l1.4 2.4"></path><path d="M15.8 8.7 17 6.3a1.5 1.5 0 0 1 2.8 1.1l-.8 2.3"></path></svg></div>
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
      <article class="history-stat-card"><span class="history-stat-label">${escapeHtml(t("historyStatsDistance"))}</span><strong>${escapeHtml(totalDistance.toFixed(2).replace(".", currentLanguage === "uk" ? "," : "."))} <small>${currentLanguage === "uk" ? "км" : "km"}</small></strong></article>
      <article class="history-stat-card"><span class="history-stat-label">${escapeHtml(t("historyStatsTime"))}</span><strong>${escapeHtml(formatHistoryTotalTime(totalTime))}</strong></article>`;
  }

  container.innerHTML = workouts.map(workout => `
    <article class="history-item" data-history-id="${escapeHtml(workout.id)}" data-history-view="${escapeHtml(workout.id)}">
      <div class="history-workout-mark" aria-hidden="true"><img class="runory-workout-icon" alt="" src="${RUNORY_ICON_SHOE}"></div>
      <div class="history-item-main">
        <div class="history-item-heading"><div><p class="eyebrow">${escapeHtml(formatHistoryDate(workout.workout_date))}</p><h3>${escapeHtml(workoutTypeLabel(derivedWorkoutType(workout)))}</h3></div></div>
        <div class="history-metrics"><span><b>${escapeHtml(t("pace"))}</b> ${escapeHtml(workout.pace || "—")}</span><span><b>${escapeHtml(t("time"))}</b> ${escapeHtml(formatHistoryDuration(workout.duration_sec))}</span><span><b>${escapeHtml(t("heartRate"))}</b> ${workout.heart_rate != null ? `${Math.round(workout.heart_rate)} ${currentLanguage === "uk" ? "уд/хв" : "bpm"}` : "—"}</span><span><b>${escapeHtml(t("ascent"))}</b> ${workout.ascent_m != null ? `+${Math.round(workout.ascent_m)} ${currentLanguage === "uk" ? "м" : "m"}` : "—"}</span></div>
      </div>
      <strong class="history-distance">${escapeHtml(formatHistoryDistance(workout.distance_km))}</strong>
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
    renderDynamics([]);
    renderHome([]);
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
  renderDynamics(historyWorkouts);
  renderHome(historyWorkouts);
  historyLoaded = true;
  if (window.__runoryPendingWorkoutId) {
    const pendingId = window.__runoryPendingWorkoutId;
    window.__runoryPendingWorkoutId = null;
    openWorkoutFromHistoryId(pendingId);
  }
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
  setActiveView("analysis", { updateRoute: false });
  const target = `/workouts/${encodeURIComponent(record.id)}`;
  if (window.location.pathname !== target) window.history.pushState({ view: "analysis", workoutId: record.id }, "", target);
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
  const deleteButton = event.target.closest("[data-history-delete]");
  if (deleteButton) {
    await deleteWorkoutFromHistory(deleteButton.dataset.historyDelete);
    return;
  }

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

initRunoryTheme();

document.querySelector("#addWorkoutButton")?.addEventListener("click", () => {
  navigateToView("analysis");
  window.setTimeout(() => document.querySelector("#fileInput")?.click(), 0);
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
const openProfileFromAccount = document.querySelector("#openProfileFromAccount");
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
    try {
      await ensureUserProfile(data.session.user);
    } catch (error) {
      console.warn("Runory: profile restore skipped.", error);
    }
    const activeDataView = document.querySelector("#home.is-active, #history.is-active, #dynamics.is-active");
    if (window.__runoryPendingWorkoutId || activeDataView) {
      await loadWorkoutHistory(true);
    }
  } else if (window.__runoryPendingWorkoutId) {
    openAuthModal();
  }

  supabaseClient.auth.onAuthStateChange((event, session) => {
    window.setTimeout(async () => {
      updateAuthUI(session);
      historyLoaded = false;
      if (session?.user) {
        try {
          await ensureUserProfile(session.user);
        } catch (error) {
          console.warn("Runory: profile restore skipped.", error);
        }
      }
      if (session?.user && (window.__runoryPendingWorkoutId || document.querySelector("#home")?.classList.contains("is-active") || document.querySelector("#history")?.classList.contains("is-active") || document.querySelector("#dynamics")?.classList.contains("is-active"))) {
        await loadWorkoutHistory(true);
      }
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
openProfileFromAccount?.addEventListener("click", () => { closeAuthModal(); navigateToView("profile"); });
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

// ==================== Runory calculator (SPA) ====================
let calculatorInitialized = false;
let activeCalculator = "time";

const calculatorConfigs = {
  time: { eyebrow: "timeEyebrow", title: "timeTitle", description: "timeDescription", label: "timeLabel", fields: ["distance", "pace"] },
  distance: { eyebrow: "distanceEyebrow", title: "distanceTitle", description: "distanceDescription", label: "distanceLabel", fields: ["time", "pace"] },
  pace: { eyebrow: "paceEyebrow", title: "paceTitle", description: "paceDescription", label: "paceLabel", fields: ["distance", "time"] }
};

function calculatorReadNumber(data, name) {
  const value = data.get(name);
  return value === "" || value === null ? 0 : Number(value);
}

function calculatorFormatDuration(seconds) {
  const total = Math.round(seconds);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const rest = String(total % 60).padStart(2, "0");
  return hours
    ? `${hours}:${String(minutes).padStart(2, "0")}:${rest}`
    : `${minutes}:${rest}`;
}

function renderCalculator(type = activeCalculator, { preserveResult = false } = {}) {
  const panel = document.querySelector("#calculator");
  const fields = document.querySelector("#calculatorFields");
  if (!panel || !fields || !calculatorConfigs[type]) return;

  activeCalculator = type;
  const config = calculatorConfigs[type];

  panel.querySelectorAll(".calc-tab").forEach(tab => {
    const active = tab.dataset.calculator === type;
    tab.classList.toggle("is-active", active);
    tab.setAttribute("aria-selected", String(active));
    const labelKey = tab.dataset.calculator === "time"
      ? "tabTime"
      : tab.dataset.calculator === "distance"
        ? "tabDistance"
        : "tabPace";
    tab.textContent = t(labelKey);
  });

  const eyebrow = panel.querySelector("#calc-eyebrow");
  const title = panel.querySelector("#calc-title");
  const description = panel.querySelector("#calc-description");
  if (eyebrow) eyebrow.textContent = t(config.eyebrow);
  if (title) title.textContent = t(config.title);
  if (description) description.textContent = t(config.description);

  fields.innerHTML = config.fields.map(field => {
    if (field === "distance") {
      return `
        <label class="calc-field">
          <span>${escapeHtml(t("distance"))}</span>
          <div>
            <input name="distance" inputmode="decimal" autocomplete="off" placeholder="${escapeHtml(t("exampleDistance"))}" required />
            <em>${escapeHtml(t("km"))}</em>
          </div>
        </label>`;
    }

    if (field === "time") {
      return `
        <fieldset class="calc-field time-field">
          <legend>${escapeHtml(t("time"))}</legend>
          <div class="split-inputs">
            <label><input name="timeHours" type="number" min="0" inputmode="numeric" placeholder="0" /><span>${escapeHtml(t("hours"))}</span></label>
            <label><input name="timeMinutes" type="number" min="0" max="59" inputmode="numeric" placeholder="00" /><span>${escapeHtml(t("minutesShort"))}</span></label>
            <label><input name="timeSeconds" type="number" min="0" max="59" inputmode="numeric" placeholder="00" /><span>${escapeHtml(t("secondsShort"))}</span></label>
          </div>
        </fieldset>`;
    }

    return `
      <fieldset class="calc-field time-field">
        <legend>${escapeHtml(t("pace"))}</legend>
        <div class="split-inputs">
          <label><input name="paceMinutes" type="number" min="0" inputmode="numeric" placeholder="5" required /><span>${escapeHtml(t("minutesShort"))}</span></label>
          <label><input name="paceSeconds" type="number" min="0" max="59" inputmode="numeric" placeholder="30" /><span>${escapeHtml(t("secondsShort"))}</span></label>
        </div>
      </fieldset>`;
  }).join("");

  const button = panel.querySelector(".calculate-button");
  if (button) button.textContent = t("calculate");

  const result = panel.querySelector("#calculationResult");
  if (result && !preserveResult) result.hidden = true;
}

function calculatorSubmit(event) {
  event.preventDefault();

  const data = new FormData(event.currentTarget);
  const distance = Number(String(data.get("distance") || "").replace(",", "."));
  const hours = calculatorReadNumber(data, "timeHours");
  const minutes = calculatorReadNumber(data, "timeMinutes");
  const seconds = calculatorReadNumber(data, "timeSeconds");
  const paceMinutes = calculatorReadNumber(data, "paceMinutes");
  const paceSeconds = calculatorReadNumber(data, "paceSeconds");

  const totalTime = hours * 3600 + minutes * 60 + seconds;
  const pace = paceMinutes * 60 + paceSeconds;

  let value = null;
  if (activeCalculator === "time" && distance > 0 && pace > 0) {
    value = calculatorFormatDuration(distance * pace);
  } else if (activeCalculator === "distance" && totalTime > 0 && pace > 0) {
    value = (totalTime / pace).toFixed(2);
  } else if (activeCalculator === "pace" && distance > 0 && totalTime > 0) {
    value = calculatorFormatDuration(totalTime / distance);
  }

  const panel = document.querySelector("#calculator");
  const result = panel?.querySelector("#calculationResult");
  const resultLabel = panel?.querySelector("#result-label");
  const resultValue = panel?.querySelector("#result-value");
  const resultDetail = panel?.querySelector("#result-detail");
  if (!result || !resultLabel || !resultValue || !resultDetail) return;

  const invalidRange =
    minutes < 0 || minutes > 59 ||
    seconds < 0 || seconds > 59 ||
    paceSeconds < 0 || paceSeconds > 59;

  if (!value || invalidRange) {
    resultLabel.textContent = t("checkValues");
    resultValue.textContent = "—";
    resultDetail.textContent = t("rangeError");
  } else {
    resultLabel.textContent = t(calculatorConfigs[activeCalculator].label);
    resultValue.textContent =
      activeCalculator === "distance" ? `${value} ${t("km")}` :
      activeCalculator === "pace" ? `${value} ${t("perKm")}` :
      value;
    resultDetail.textContent = "";
  }

  result.hidden = false;
}

function initCalculator() {
  const panel = document.querySelector("#calculator");
  const form = document.querySelector("#calculatorForm");
  if (!panel || !form) return;

  if (!calculatorInitialized) {
    calculatorInitialized = true;

    form.addEventListener("submit", calculatorSubmit);

    // Tabs stay in the DOM; fields are rebuilt. Delegation keeps tab clicks working.
    panel.addEventListener("click", event => {
      const tab = event.target.closest(".calc-tab");
      if (!tab) return;
      event.preventDefault();
      renderCalculator(tab.dataset.calculator);
    });
  }

  renderCalculator(activeCalculator);
}

function refreshCalculatorLanguage() {
  const panel = document.querySelector("#calculator");
  if (!panel?.classList.contains("is-active")) return;

  renderCalculator(activeCalculator, { preserveResult: true });

  const result = panel.querySelector("#calculationResult");
  if (result && !result.hidden) {
    const label = panel.querySelector("#result-label");
    if (label) label.textContent = t(calculatorConfigs[activeCalculator].label);
  }
}

initializeRoute();
initAuth();
