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
function secondsToPace(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return '—';
  const total = Math.round(seconds);
  const minutes = Math.floor(total / 60);
  const secs = String(total % 60).padStart(2, '0');
  return `${minutes}:${secs}`;
}

function createSplit(km, records, durationOverride = null) {
    if (!records.length) return null;

    const first = records[0];
    const last = records[records.length - 1];

    const firstTime = first?.[253];
    const lastTime = last?.[253];

    const duration =
        durationOverride != null
            ? Math.max(1, durationOverride)
            : (firstTime != null && lastTime != null
                ? Math.max(1, lastTime - firstTime)
                : null);

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
function buildLapBasedSplitDurations(laps) {
  const validLaps = (laps || [])
    .map((lap) => ({
      distance: Number.isFinite(lap[9]) ? lap[9] / 100 : null,
      timerDuration: Number.isFinite(lap[8])
        ? lap[8] / 1000
        : (Number.isFinite(lap[7]) ? lap[7] / 1000 : null),
    }))
    .filter((lap) => lap.distance > 0 && lap.timerDuration > 0);

  if (!validLaps.length) return null;

  const splitDurations = new Map();
  let lapStartDistance = 0;

  for (const lap of validLaps) {
    const lapEndDistance = lapStartDistance + lap.distance;

    for (
      let km = Math.floor(lapStartDistance / 1000) + 1;
      km <= Math.ceil(lapEndDistance / 1000);
      km++
    ) {
      const splitStart = Math.max(lapStartDistance, (km - 1) * 1000);
      const splitEnd = Math.min(lapEndDistance, km * 1000);
      const overlap = splitEnd - splitStart;

      if (overlap <= 0) continue;

      splitDurations.set(
        km,
        (splitDurations.get(km) || 0) +
          lap.timerDuration * (overlap / lap.distance)
      );
    }

    lapStartDistance = lapEndDistance;
  }

  return splitDurations;
}

function analyzeWorkoutStructure({ laps = [], records = [] }) {
  const validLaps = laps
    .map((lap) => ({
      duration: Number.isFinite(lap[8])
        ? lap[8] / 1000
        : (Number.isFinite(lap[7]) ? lap[7] / 1000 : null),
      distance: Number.isFinite(lap[9]) ? lap[9] / 100 : null,
      heartRate: Number.isFinite(lap[15]) ? Math.round(lap[15]) : null,
      cadence: Number.isFinite(lap[17]) ? Math.round(lap[17] * 2) : null,
      ascent: Number.isFinite(lap[21]) ? Math.round(lap[21]) : 0,
    }))
    .filter(
      (lap) =>
        lap.duration > 0 &&
        lap.distance > 0 &&
        (lap.distance >= 50 || lap.duration >= 20)
    );

  if (validLaps.length >= 3) {
    const longLaps = validLaps
      .filter((lap) => lap.distance >= 700)
      .map((lap) => ({
        ...lap,
        paceSeconds:
          lap.duration / (lap.distance / 1000),
      }));

    if (longLaps.length >= 2) {
      // Рабочие отрезки в интервальной тренировке обычно являются
      // повторяющимися быстрыми длинными laps. Используем медиану
      // их длительности/темпа и требуем следующий lap-восстановление.
      const medianPace = [...longLaps]
        .sort((a, b) => a.paceSeconds - b.paceSeconds)
        [Math.floor(longLaps.length / 2)].paceSeconds;

      const recoveryLimit = Math.max(
        600,
        Math.min(700, Math.max(400, medianPace * 1000 / 4.5) * 0.65)
      );

      const isRecovery = (lap) =>
        lap.distance > 0 && lap.distance <= recoveryLimit;

      const workIndices = [];

      for (let i = 0; i < validLaps.length - 1; i++) {
        const lap = validLaps[i];
        const next = validLaps[i + 1];

        if (lap.distance < 700) continue;

        const pace = lap.duration / (lap.distance / 1000);

        // Не считаем длинный медленный lap разминкой/заминкой.
        // Рабочий lap должен быть существенно быстрее типичного
        // длинного lap и завершаться восстановлением.
        if (pace <= medianPace * 1.12 && isRecovery(next)) {
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

          const stats = {
            duration: Math.round(lap.duration),
            distance: Math.round(lap.distance),
            pace:
              lap.distance > 1
                ? secondsToPace(lap.duration / (lap.distance / 1000))
                : "—",
            heartRate: lap.heartRate,
            cadence: lap.cadence,
            ascent: lap.ascent,
          };

          if (i < firstWork) {
            result.push({ type: "warmup", label: "Разминка", ...stats });
          } else if (i > lastWork) {
            result.push({ type: "cooldown", label: "Заминка", ...stats });
          } else if (workIndices.includes(i)) {
            workNumber++;
            result.push({
              type: "work",
              label: `Работа ${workNumber}`,
              ...stats,
              repetitions: workIndices.length,
            });
          } else {
            recoveryNumber++;
            result.push({
              type: "recovery",
              label: `Отдых ${recoveryNumber}`,
              ...stats,
            });
          }
        }

        return result;
      }
    }
  }

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
  // Спочатку беремо офіційний total_ascent із Session Garmin (field 22).
  // Якщо його немає — рахуємо по altitude / enhanced_altitude у Record.
  let ascent = null;

  if (session[22] != null && Number.isFinite(Number(session[22]))) {
    ascent = Number(session[22]);
  } else {
    const recordAltitudes = records
      .map((record) => {
        if (Number.isFinite(record[78])) return record[78] / 5 - 500;
        if (Number.isFinite(record[2])) return record[2] / 5 - 500;
        return null;
      })
      .filter((value) => Number.isFinite(value));

    if (recordAltitudes.length > 1) {
      ascent = 0;

      for (let i = 1; i < recordAltitudes.length; i++) {
        const difference = recordAltitudes[i] - recordAltitudes[i - 1];
        if (difference > 2) ascent += difference;
      }
    } else {
      ascent = 0;
    }
  }

  ascent = Math.round(Number(ascent) || 0);

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
    const lapSplitDurations = buildLapBasedSplitDurations(laps);
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
                const override = lapSplitDurations?.get(currentKm) ?? null;
                const split = createSplit(currentKm, kmRecords, override);
                if (split) splits.push(split);
            }

            kmRecords = [];
            currentKm = km;
        }

        kmRecords.push(record);
    }

    if (kmRecords.length > 0) {
        const lastDistance = Number.isFinite(records.at(-1)?.[5])
            ? records.at(-1)[5] / 100
            : 0;

        const override = lapSplitDurations?.get(currentKm) ?? null;
        const split = createSplit(currentKm, kmRecords, override);

        // Отбрасываем хвост меньше 100 м после последнего полного километра.
        if (
            split &&
            (
                currentKm <= Math.floor(lastDistance / 1000) ||
                lastDistance >= currentKm * 1000
            )
        ) {
            splits.push(split);
        }
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
