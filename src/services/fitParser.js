const FIT_EPOCH_MS = Date.UTC(1989, 11, 31);

const BASE_TYPES = {
  0: { size: 1, get: "getUint8", invalid: 0xff },
  1: { size: 1, get: "getInt8", invalid: 0x7f },
  2: { size: 1, get: "getUint8", invalid: 0xff },
  3: { size: 2, get: "getInt16", invalid: 0x7fff },
  4: { size: 2, get: "getUint16", invalid: 0xffff },
  5: { size: 4, get: "getInt32", invalid: 0x7fffffff },
  6: { size: 4, get: "getUint32", invalid: 0xffffffff },
  7: { size: 1, get: "getUint8", invalid: 0 },
  8: { size: 4, get: "getFloat32", invalid: null },
  9: { size: 8, get: "getFloat64", invalid: null },
  10: { size: 1, get: "getUint8", invalid: 0 },
  11: { size: 2, get: "getUint16", invalid: 0 },
  12: { size: 4, get: "getUint32", invalid: 0 },
  13: { size: 1, get: "getUint8", invalid: null },
  14: { size: 8, get: "getBigInt64", invalid: null },
  15: { size: 8, get: "getBigUint64", invalid: null },
  16: { size: 8, get: "getBigUint64", invalid: null }
};

const MESSAGE_NAMES = {
  18: "session",
  19: "lap",
  20: "record",
  21: "event",
  26: "workout",
  27: "workout_step"
};

const INTENSITIES = {
  0: "active",
  1: "warmup",
  2: "cooldown",
  3: "recovery",
  4: "interval",
  5: "other"
};

function readField(view, offset, field, littleEndian) {
  const type = BASE_TYPES[field.baseType & 0x1f];
  if (!type || field.size < type.size || offset + field.size > view.byteLength) {
    return null;
  }

  const value = view[type.get](offset, littleEndian);

  if (type.invalid !== null && value === type.invalid) {
    return null;
  }

  return typeof value === "bigint" ? Number(value) : value;
}

function decodeFit(buffer) {
  const view = new DataView(buffer);

  if (view.byteLength < 12) {
    throw new Error("FIT-файл занадто малий");
  }

  const headerSize = view.getUint8(0);
  const dataSize = view.getUint32(4, true);
  const magic = String.fromCharCode(
    view.getUint8(8),
    view.getUint8(9),
    view.getUint8(10),
    view.getUint8(11)
  );

  if (
    headerSize < 12 ||
    headerSize > view.byteLength ||
    magic !== ".FIT"
  ) {
    throw new Error("Це не схоже на коректний FIT-файл Garmin");
  }

  const dataEnd = Math.min(headerSize + dataSize, view.byteLength);
  let offset = headerSize;
  let lastTimestamp = null;

  const definitions = new Map();
  const messages = {
    session: [],
    lap: [],
    record: [],
    event: [],
    workout: [],
    workout_step: []
  };

  while (offset < dataEnd) {
    const recordHeader = view.getUint8(offset++);
    const compressed = (recordHeader & 0x80) !== 0;
    const isDefinition = !compressed && (recordHeader & 0x40) !== 0;
    const hasDeveloperData = !compressed && (recordHeader & 0x20) !== 0;
    const localMessage = compressed
      ? (recordHeader >> 5) & 0x03
      : recordHeader & 0x0f;

    if (isDefinition) {
      if (offset + 5 > dataEnd) {
        throw new Error("Пошкоджена структура FIT-файлу");
      }

      offset += 1;
      const littleEndian = view.getUint8(offset++) === 0;
      const globalMessage = view.getUint16(offset, littleEndian);
      offset += 2;

      const fieldCount = view.getUint8(offset++);
      const fields = [];

      for (let i = 0; i < fieldCount; i++) {
        fields.push({
          number: view.getUint8(offset++),
          size: view.getUint8(offset++),
          baseType: view.getUint8(offset++)
        });
      }

      const developerFields = [];

      if (hasDeveloperData) {
        if (offset >= dataEnd) throw new Error("Пошкоджені developer fields");
        const developerCount = view.getUint8(offset++);
        for (let i = 0; i < developerCount; i++) {
          if (offset + 3 > dataEnd) throw new Error("Пошкоджені developer fields");
          developerFields.push({
            number: view.getUint8(offset++),
            size: view.getUint8(offset++),
            developerDataIndex: view.getUint8(offset++)
          });
        }
      }

      definitions.set(localMessage, {
        globalMessage,
        littleEndian,
        fields,
        developerFields
      });

      continue;
    }

    const definition = definitions.get(localMessage);
    if (!definition) {
      throw new Error("Не вдалося прочитати структуру FIT-файлу");
    }

    const message = {};

    if (compressed) {
      const timeOffset = recordHeader & 0x1f;
      if (lastTimestamp !== null) {
        message[253] =
          (lastTimestamp & ~0x1f) +
          timeOffset +
          (timeOffset < (lastTimestamp & 0x1f) ? 0x20 : 0);
      }
    }

    for (const field of definition.fields) {
      message[field.number] = readField(
        view,
        offset,
        field,
        definition.littleEndian
      );
      offset += field.size;
    }

    for (const field of definition.developerFields) {
      offset += field.size;
    }

    if (message[253] != null) {
      lastTimestamp = message[253];
    }

    const name = MESSAGE_NAMES[definition.globalMessage];
    if (name) {
      messages[name].push(message);
    }
  }

  return messages;
}

function fitTimeToDate(value) {
  if (!Number.isFinite(value)) return null;
  return new Date(FIT_EPOCH_MS + value * 1000);
}

function secondsToTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return "—";

  const total = Math.round(seconds);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;

  return h
    ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
    : `${m}:${String(s).padStart(2, "0")}`;
}

function secondsToPace(seconds) {
  if (!Number.isFinite(seconds) || seconds <= 0) return "—";

  const total = Math.round(seconds);
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
}

function numberOrNull(value) {
  return Number.isFinite(Number(value)) ? Number(value) : null;
}

function cadenceFromGarmin(value) {
  const n = numberOrNull(value);
  if (n == null) return null;

  // FIT running cadence is normally stored as half-steps/min.
  // Lap/session cadence in this Garmin file is already the displayed
  // full steps/min value, so only Record cadence needs the ×2 conversion.
  return n < 110 ? Math.round(n * 2) : Math.round(n);
}

function speedFromGarmin(value) {
  const n = numberOrNull(value);
  if (n == null || n <= 0) return null;
  return n / 1000;
}

function normalizeSession(session) {
  if (!session) return null;

  return {
    sport: session[5],
    subSport: session[6],
    startTime: fitTimeToDate(session[2]),
    totalElapsedTime: numberOrNull(session[7]) != null ? session[7] / 1000 : null,
    totalTimerTime: numberOrNull(session[8]) != null ? session[8] / 1000 : null,
    distance: numberOrNull(session[9]) != null ? session[9] / 100 : null,
    calories: numberOrNull(session[11]),
    avgSpeed: speedFromGarmin(session[14]),
    maxSpeed: speedFromGarmin(session[15]),
    avgHeartRate: numberOrNull(session[16]),
    maxHeartRate: numberOrNull(session[17]),
    avgCadence: cadenceFromGarmin(session[18]),
    maxCadence: cadenceFromGarmin(session[19]),
    totalAscent: numberOrNull(session[21]),
    totalDescent: numberOrNull(session[22])
  };
}

function normalizeLap(lap, index) {
  if (!lap) return null;

  const distance = numberOrNull(lap[9]);
  const elapsed = numberOrNull(lap[7]);
  const timer = numberOrNull(lap[8]);
  const seconds = timer != null ? timer / 1000 : elapsed != null ? elapsed / 1000 : null;

  if (distance == null || distance <= 0 || seconds == null || seconds <= 0) {
    return null;
  }

  const speed = speedFromGarmin(lap[13]);

  return {
    index,
    startTime: fitTimeToDate(lap[2]),
    endTime: fitTimeToDate(lap[253]),
    distance: distance / 100,
    duration: seconds,
    pace: speed != null
      ? secondsToPace(1000 / speed)
      : secondsToPace(seconds / (distance / 100)),
    avgSpeed: speed,
    maxSpeed: speedFromGarmin(lap[14]),
    avgHeartRate: numberOrNull(lap[15]),
    maxHeartRate: numberOrNull(lap[17]),
    avgCadence: numberOrNull(lap[16]),
    maxCadence: numberOrNull(lap[18]),
    ascent: numberOrNull(lap[21]),
    descent: numberOrNull(lap[22]),
    calories: numberOrNull(lap[11]),
    lapTrigger: numberOrNull(lap[24]),
    sport: lap[25],
    subSport: lap[26]
  };
}

function normalizeWorkoutStep(step, index) {
  if (!step) return null;

  const durationType = numberOrNull(step[1]);
  const durationValue = numberOrNull(step[2]);
  const intensity = numberOrNull(step[7]);

  const durationUnit =
    durationType === 1 ? "distance" :
    durationType === 2 ? "time" :
    durationType === 3 ? "lap.button" :
    durationType === 4 ? "repeat_until_steps_cmplt" :
    durationType === 5 ? "repeat_until_time" :
    durationType === 6 ? "repeat_until_distance" :
    durationType === 7 ? "repeat_until_calories" :
    durationType === 8 ? "repeat_until_hr_less_than" :
    durationType === 9 ? "repeat_until_hr_greater_than" :
    durationType === 10 ? "repeat_until_calories" :
    "unknown";

  let distance = null;
  let duration = null;

  if (durationType === 1 && durationValue != null) {
    distance = durationValue / 100;
  }

  if (durationType === 2 && durationValue != null) {
    duration = durationValue / 1000;
  }

  return {
    index,
    name: step[0] ?? null,
    intensity: INTENSITIES[intensity] ?? "unknown",
    durationType,
    durationUnit,
    durationValue,
    distance,
    duration,
    targetType: numberOrNull(step[3]),
    targetValue: numberOrNull(step[4]),
    customTargetLow: numberOrNull(step[5]),
    customTargetHigh: numberOrNull(step[6]),
    messageIndex: numberOrNull(step[254])
  };
}

function buildKmSplits(laps) {
  const valid = laps
    .map((lap, i) => normalizeLap(lap, i + 1))
    .filter(Boolean);

  // Garmin's automatic distance laps are the authoritative km splits.
  const kmLaps = valid.filter(
    lap => lap.distance >= 0.98 && lap.distance <= 1.02
  );

  if (kmLaps.length) {
    return kmLaps.map((lap, i) => ({
      km: i + 1,
      pace: lap.pace,
      heartRate: lap.avgHeartRate,
      cadence: lap.avgCadence,
      ascent: lap.ascent,
      descent: lap.descent
    }));
  }

  return [];
}

function buildSegments(laps, workoutSteps) {
  const normalizedLaps = laps
    .map((lap, i) => normalizeLap(lap, i + 1))
    .filter(Boolean);

  const normalizedSteps = workoutSteps
    .map((step, i) => normalizeWorkoutStep(step, i))
    .filter(Boolean);

  /*
   * Important:
   * We never invent a 400 m recovery from pace changes.
   * A recovery/work segment is only considered authoritative when Garmin
   * explicitly stores workout-step information or an explicit non-distance lap.
   */

  const explicitNonKmLaps = normalizedLaps.filter(
    lap => !(lap.distance >= 0.98 && lap.distance <= 1.02)
  );

  const segments = [];

  if (normalizedSteps.length) {
    for (const step of normalizedSteps) {
      segments.push({
        type: step.intensity,
        source: "garmin_workout_step",
        index: step.index,
        distance: step.distance,
        duration: step.duration,
        targetType: step.targetType,
        targetValue: step.targetValue,
        targetLow: step.customTargetLow,
        targetHigh: step.customTargetHigh
      });
    }
  }

  // Preserve every Garmin lap as a second, lossless layer.
  // This lets AI see all actual lap data even when workout steps are sparse.
  const garminLaps = normalizedLaps.map(lap => ({
    type: "lap",
    source: "garmin_lap",
    index: lap.index,
    distance: lap.distance,
    duration: lap.duration,
    pace: lap.pace,
    avgSpeed: lap.avgSpeed,
    maxSpeed: lap.maxSpeed,
    heartRate: lap.avgHeartRate,
    maxHeartRate: lap.maxHeartRate,
    cadence: lap.avgCadence,
    maxCadence: lap.maxCadence,
    ascent: lap.ascent,
    descent: lap.descent,
    calories: lap.calories,
    startTime: lap.startTime,
    endTime: lap.endTime,
    lapTrigger: lap.lapTrigger
  }));

  return {
    workoutSteps: normalizedSteps,
    explicitNonKmLaps,
    segments,
    garminLaps
  };
}

function buildGarminRecordSummary(records) {
  if (!records.length) return null;

  const heartRates = records
    .map(r => numberOrNull(r[3]))
    .filter(v => v != null && v > 0 && v < 255);

  const cadences = records
    .map(r => cadenceFromGarmin(r[4]))
    .filter(v => v != null && v > 0 && v < 255);

  const distances = records
    .map(r => numberOrNull(r[5]))
    .filter(v => v != null && v >= 0);

  const altitudes = records
    .map(r => {
      const enhanced = numberOrNull(r[78]);
      const altitude = numberOrNull(r[2]);
      if (enhanced != null) return enhanced / 5 - 500;
      if (altitude != null) return altitude / 5 - 500;
      return null;
    })
    .filter(v => v != null);

  return {
    recordCount: records.length,
    firstDistance: distances.length ? distances[0] / 100 : null,
    lastDistance: distances.length ? distances.at(-1) / 100 : null,
    minHeartRate: heartRates.length ? Math.min(...heartRates) : null,
    maxHeartRate: heartRates.length ? Math.max(...heartRates) : null,
    avgHeartRate: heartRates.length
      ? Math.round(heartRates.reduce((a, b) => a + b, 0) / heartRates.length)
      : null,
    avgCadence: cadences.length
      ? Math.round(cadences.reduce((a, b) => a + b, 0) / cadences.length)
      : null,
    minAltitude: altitudes.length ? Math.min(...altitudes) : null,
    maxAltitude: altitudes.length ? Math.max(...altitudes) : null
  };
}

function calculateSummary(messages) {
  const sessionRaw = messages.session.at(-1) || null;
  const session = normalizeSession(sessionRaw);

  if (!session || !session.distance || !session.totalTimerTime) {
    throw new Error(
      "У цьому FIT-файлі не знайдено даних про бігове тренування"
    );
  }

  const laps = messages.lap || [];
  const workoutSteps = messages.workout_step || [];
  const records = messages.record || [];
  const events = messages.event || [];
  const workout = messages.workout || [];

  const segments = buildSegments(laps, workoutSteps);
  const splits = buildKmSplits(laps);

  return {
    // Existing fields kept for current UI/API compatibility.
    distance: (session.distance / 1000).toFixed(2),
    duration: secondsToTime(session.totalTimerTime),
    pace: session.avgSpeed != null
      ? secondsToPace(1000 / session.avgSpeed)
      : "—",
    heartRate: session.avgHeartRate,
    cadence: session.avgCadence,
    ascent: session.totalAscent ?? 0,
    date: session.startTime,

    // Garmin is the source of truth.
    garmin: {
      session,
      workout,
      workoutSteps: segments.workoutSteps,
      laps: laps.map((lap, i) => normalizeLap(lap, i + 1)).filter(Boolean),
      events,
      recordSummary: buildGarminRecordSummary(records)
    },

    // UI: kilometer splits.
    splits,

    // AI: complete training structure + all authoritative lap/workout data.
    segments: segments.segments,
    garminLaps: segments.garminLaps,

    metadata: {
      hasWorkoutSteps: segments.workoutSteps.length > 0,
      hasExplicitNonKmLaps: segments.explicitNonKmLaps.length > 0,
      lapCount: laps.length,
      recordCount: records.length,
      eventCount: events.length,
      workoutStepCount: workoutSteps.length
    }
  };
}

async function parseFitFile(file) {
  if (!file?.name?.toLowerCase().endsWith(".fit")) {
    throw new Error("Потрібен файл Garmin у форматі .fit");
  }

  const messages = decodeFit(await file.arrayBuffer());
  return calculateSummary(messages);
}

window.parseFitFile = parseFitFile;
