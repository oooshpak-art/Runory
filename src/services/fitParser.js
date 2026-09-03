const FIT_EPOCH_MS = Date.UTC(1989, 11, 31, 0, 0, 0);

const BASE_TYPES = {
  0: { size: 1, get: 'getUint8', invalid: 0xff }, 1: { size: 1, get: 'getInt8', invalid: 0x7f },
  2: { size: 1, get: 'getUint8', invalid: 0xff }, 3: { size: 2, get: 'getInt16', invalid: 0x7fff },
  4: { size: 2, get: 'getUint16', invalid: 0xffff }, 5: { size: 4, get: 'getInt32', invalid: 0x7fffffff },
  6: { size: 4, get: 'getUint32', invalid: 0xffffffff }, 8: { size: 4, get: 'getFloat32', invalid: null },
  9: { size: 8, get: 'getFloat64', invalid: null }, 10: { size: 1, get: 'getUint8', invalid: 0 },
  11: { size: 2, get: 'getUint16', invalid: 0 }, 12: { size: 4, get: 'getUint32', invalid: 0 },
  13: { size: 1, get: 'getUint8', invalid: null }, 14: { size: 8, get: 'getBigInt64', invalid: null },
  15: { size: 8, get: 'getBigUint64', invalid: null }, 16: { size: 8, get: 'getBigUint64', invalid: null },
};

function readField(view, offset, field, littleEndian) {
  const type = BASE_TYPES[field.baseType & 0x1f];
  if (!type || field.size < type.size) return null;
  const value = view[type.get](offset, littleEndian);
  if (type.invalid !== null && value === type.invalid) return null;
  return typeof value === 'bigint' ? Number(value) : value;
}

function decodeFit(buffer) {
  const view = new DataView(buffer);
  const headerSize = view.getUint8(0);
  const magic = [8, 9, 10, 11].map((i) => view.getUint8(i)).join('');
  if (headerSize < 12 || magic !== '46707384') throw new Error('Це не схоже на коректний FIT-файл Garmin');

  const dataEnd = Math.min(headerSize + view.getUint32(4, true), buffer.byteLength);
  let offset = headerSize;
  let lastTimestamp = null;
  const definitions = new Map();
  const sessions = [];
  const laps = [];
  const records = [];

  while (offset < dataEnd) {
    const header = view.getUint8(offset++);
    const compressed = (header & 0x80) !== 0;
    const definitionHeader = !compressed && (header & 0x40) !== 0;
    const localMessage = compressed ? (header >> 5) & 0x03 : header & 0x0f;
    if (definitionHeader) {
      offset += 1;
      const littleEndian = view.getUint8(offset++) === 0;
      const globalMessage = view.getUint16(offset, littleEndian); offset += 2;
      const fieldCount = view.getUint8(offset++);
      const fields = [];
      for (let i = 0; i < fieldCount; i++) fields.push({ number: view.getUint8(offset++), size: view.getUint8(offset++), baseType: view.getUint8(offset++) });
      if (header & 0x20) offset += 1 + view.getUint8(offset) * 3;
      definitions.set(localMessage, { globalMessage, fields, littleEndian });
      continue;
    }
    const definition = definitions.get(localMessage);
    if (!definition) throw new Error('Не вдалося прочитати структуру FIT-файлу');
    const message = {};
    if (compressed && lastTimestamp !== null) {
      const timeOffset = header & 0x1f;
      message[253] = (lastTimestamp & ~0x1f) + timeOffset + (timeOffset < (lastTimestamp & 0x1f) ? 0x20 : 0);
    }
    for (const field of definition.fields) {
      message[field.number] = readField(view, offset, field, definition.littleEndian);
      offset += field.size;
    }
    if (message[253] != null) lastTimestamp = message[253];
    if (definition.globalMessage === 18) sessions.push(message);
    if (definition.globalMessage === 19) laps.push(message);
    if (definition.globalMessage === 20) records.push(message);
  }
  return { sessions, laps, records };
}

function secondsToTime(seconds) {
  const total = Math.round(seconds || 0); const h = Math.floor(total / 3600); const m = Math.floor((total % 3600) / 60); const s = String(total % 60).padStart(2, '0');
  return h ? `${h}:${String(m).padStart(2, '0')}:${s}` : `${m}:${s}`;
}
function secondsToPace(seconds) { return !seconds || seconds < 0 ? '—' : `${Math.floor(seconds / 60)}:${String(Math.round(seconds % 60)).padStart(2, '0')}`; }
function createSplit(km, records) {
    if (!records.length) return null;

    const first = records[0];
    const last = records[records.length - 1];

    const firstTime = first?.[253];
    const lastTime = last?.[253];

    const duration =
        firstTime != null && lastTime != null
            ? Math.max(1, lastTime - firstTime)
            : null;

    const heartRates = records
        .map(record => record[3])
        .filter(value => Number.isFinite(value) && value > 0 && value < 255);

    const cadenceValues = records
        .map(record => {
            if (!Number.isFinite(record[4])) return null;

            const fractionalCadence =
                Number.isFinite(record[53])
                    ? record[53] / 128
                    : 0;

            return (record[4] + fractionalCadence) * 2;
        })
        .filter(value => Number.isFinite(value) && value > 0 && value < 255);

    const altitudes = records
        .map(record => {
            if (!Number.isFinite(record[2])) return null;
            return record[2] / 5 - 500;
        })
        .filter(value => Number.isFinite(value));

    let ascent = 0;

    for (let i = 1; i < altitudes.length; i++) {
        const difference = altitudes[i] - altitudes[i - 1];

        if (difference > 2) {
            ascent += difference;
        }
    }

    return {
        km,

        pace: duration != null
            ? secondsToPace(duration)
            : null,

        heartRate: heartRates.length
            ? Math.round(
                heartRates.reduce((sum, value) => sum + value, 0) /
                heartRates.length
            )
            : null,

        cadence: cadenceValues.length
            ? Math.round(
                cadenceValues.reduce((sum, value) => sum + value, 0) /
                cadenceValues.length
            )
            : null,

        ascent: Math.round(ascent)
    };
}

function analyzeWorkoutStructure({ laps = [], records = [] }) {
  const validLaps = laps
    .map((lap, index) => ({
      index,
      duration: Number.isFinite(lap[7]) ? lap[7] / 1000 : null,
      distance: Number.isFinite(lap[9]) ? lap[9] / 100 : null,
      heartRate: Number.isFinite(lap[15]) ? Math.round(lap[15]) : null,
      cadence: Number.isFinite(lap[17]) ? Math.round(lap[17] * 2) : null,
      ascent: Number.isFinite(lap[21]) ? Math.round(lap[21]) : 0,
    }))
    .filter(
      (lap) =>
        lap.duration != null &&
        lap.distance != null &&
        lap.duration > 0 &&
        (lap.distance >= 50 || lap.duration >= 20)
    );

  const makeSegment = (type, label, lap, extra = {}) => ({
    type,
    label,
    duration: Math.round(lap.duration),
    distance: Math.round(lap.distance),
    pace:
      lap.distance > 1
        ? secondsToPace(lap.duration / (lap.distance / 1000))
        : "—",
    heartRate: lap.heartRate,
    cadence: lap.cadence,
    ascent: lap.ascent,
    ...extra,
  });

  if (validLaps.length >= 3) {
    // Garmin Lap уже содержит реальные границы отрезков.
    // Ищем повторяющийся паттерн: длинный отрезок + короткий отрезок.
    const distances = validLaps
      .filter((lap) => lap.distance > 100)
      .map((lap) => lap.distance)
      .sort((a, b) => a - b);

    const medianDistance =
      distances.length
        ? distances[Math.floor(distances.length / 2)]
        : 0;

    const recoveryLimit = Math.max(600, medianDistance * 0.65);

    const isRecovery = (lap) =>
      lap.distance > 0 && lap.distance <= recoveryLimit;

    const workIndices = [];

    for (let i = 0; i < validLaps.length; i++) {
      const lap = validLaps[i];

      // Рабочий отрезок должен быть достаточно длинным.
      if (lap.distance < Math.max(700, medianDistance * 0.7)) continue;

      const previous = validLaps[i - 1];
      const next = validLaps[i + 1];

      if ((previous && isRecovery(previous)) || (next && isRecovery(next))) {
        workIndices.push(i);
      }
    }

    if (workIndices.length >= 2) {
      const firstWork = workIndices[0];
      const lastWork = workIndices.at(-1);
      const result = [];

      let workNumber = 0;
      let recoveryNumber = 0;

      for (let i = 0; i < validLaps.length; i++) {
        const lap = validLaps[i];

        if (i < firstWork) {
          result.push(makeSegment("warmup", "Разминка", lap));
        } else if (i > lastWork) {
          result.push(makeSegment("cooldown", "Заминка", lap));
        } else if (workIndices.includes(i)) {
          workNumber++;
          result.push(
            makeSegment("work", `Работа ${workNumber}`, lap, {
              repetitions: workIndices.length,
            })
          );
        } else {
          recoveryNumber++;
          result.push(makeSegment("recovery", `Отдых ${recoveryNumber}`, lap));
        }
      }

      return result;
    }

    // Нет повторяющейся интервальной структуры — не выдумываем её.
    const totalDuration = validLaps.reduce(
      (sum, lap) => sum + lap.duration,
      0
    );
    const totalDistance = validLaps.reduce(
      (sum, lap) => sum + lap.distance,
      0
    );
    const heartRates = validLaps
      .map((lap) => lap.heartRate)
      .filter((value) => Number.isFinite(value));
    const cadences = validLaps
      .map((lap) => lap.cadence)
      .filter((value) => Number.isFinite(value));

    return [{
      type: "easy",
      label: "Непрерывный бег",
      duration: Math.round(totalDuration),
      distance: Math.round(totalDistance),
      pace:
        totalDistance > 0
          ? secondsToPace(totalDuration / (totalDistance / 1000))
          : "—",
      heartRate: heartRates.length
        ? Math.round(heartRates.reduce((a, b) => a + b, 0) / heartRates.length)
        : null,
      cadence: cadences.length
        ? Math.round(cadences.reduce((a, b) => a + b, 0) / cadences.length)
        : null,
      ascent: validLaps.reduce((sum, lap) => sum + lap.ascent, 0),
      repetitions: 1,
    }];
  }

  // Fallback для FIT без Lap messages.
  if (records.length < 2) return [];

  const points = records
    .map((record) => ({
      timestamp: Number.isFinite(record[253]) ? record[253] : null,
      distance: Number.isFinite(record[5]) ? record[5] / 100 : null,
    }))
    .filter((point) => point.timestamp != null && point.distance != null);

  if (points.length < 2) return [];

  const duration = Math.max(1, points.at(-1).timestamp - points[0].timestamp);
  const distance = Math.max(0, points.at(-1).distance - points[0].distance);

  return [{
    type: "easy",
    label: "Тренировка",
    duration,
    distance,
    pace: distance > 0 ? secondsToPace(duration / (distance / 1000)) : "—",
    heartRate: null,
    cadence: null,
    ascent: 0,
    repetitions: 1,
  }];
}

function calculateSummary({ sessions, laps, records }) {
  const session = sessions.at(-1) || {};
  const lastRecord = records.at(-1) || {};

  const distanceMeters =
    session[9] != null
      ? session[9] / 100
      : (lastRecord[5] || 0) / 100;

  const duration =
    (session[8] ?? session[7] ?? 0) / 1000;

  const speed =
    session[14] != null
      ? session[14] / 1000
      : (duration && distanceMeters
          ? distanceMeters / duration
          : 0);

  if (!distanceMeters || !duration) {
    throw new Error(
      'У цьому FIT-файлі не знайдено даних про бігове тренування'
    );
  }

  // Висота в Record:
  // field 2 = altitude
  // raw value / 5 - 500 = метри
  const altitudes = records
    .map((record) => {
      if (record[2] == null) return null;
      return record[2] / 5 - 500;
    })
    .filter((value) => Number.isFinite(value));

  // Набір висоти.
// Спочатку беремо офіційний total_ascent із Session Garmin.
// Якщо його немає — рахуємо набір по GPS-точках.
let ascent = null;

if (session[22] != null && Number.isFinite(Number(session[22]))) {
    ascent = Number(session[22]);
} else if (altitudes.length > 1) {
    ascent = 0;

    for (let i = 1; i < altitudes.length; i++) {
        const difference = altitudes[i] - altitudes[i - 1];

        if (difference > 2) {
            ascent += difference;
        }
    }
}

  // Середній пульс із Session
  const heartRate =
    session[16] != null
      ? Math.round(session[16])
      : null;

  // Середній каденс
const cadenceValues = records
  .map(record => {
    if (!Number.isFinite(record[4])) return null;

    const fractionalCadence =
      Number.isFinite(record[53]) ? record[53] / 128 : 0;

    return (record[4] + fractionalCadence) * 2;
  })
  .filter(value => Number.isFinite(value) && value > 0 && value < 255);

const cadence = cadenceValues.length
  ? Math.round(
      cadenceValues.reduce((sum, value) => sum + value, 0) /
      cadenceValues.length
    )
  : null;
// Кілометрові спліти для детального аналізу
const splits = [];

if (records.length > 0) {
    let currentKm = 1;
    let kmRecords = [];

    for (const record of records) {
        const distanceMeters = Number.isFinite(record[5])
            ? record[5] / 100
            : null;

        if (distanceMeters == null) continue;

        const km = Math.floor(distanceMeters / 1000) + 1;

        if (km !== currentKm) {
            if (kmRecords.length > 0) {
                const split = createSplit(currentKm, kmRecords);
                if (split) splits.push(split);
            }

            kmRecords = [];
            currentKm = km;
        }

        kmRecords.push(record);
    }

    if (kmRecords.length > 0) {
        const split = createSplit(currentKm, kmRecords);
        if (split) splits.push(split);
    }
}
  const timestamp =
    session[2] ?? records[0]?.[253];

  return {
    distance: (distanceMeters / 1000).toFixed(2),
    duration: secondsToTime(duration),
    pace: secondsToPace(
      speed ? 1000 / speed : 0
    ),

    heartRate,
    cadence,
    structure: analyzeWorkoutStructure({ laps, records }),

    ascent: Math.round(ascent),
splits,

    date: timestamp
      ? new Date(FIT_EPOCH_MS + timestamp * 1000)
      : null
  };
}

/** Повертає ключові показники бігового тренування з локального FIT-файлу. */
async function parseFitFile(file) {
  if (!file?.name?.toLowerCase().endsWith('.fit')) throw new Error('Потрібен файл Garmin у форматі .fit');
  return calculateSummary(decodeFit(await file.arrayBuffer()));
}

window.parseFitFile = parseFitFile;
