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
  1: "rest",
  2: "warmup",
  3: "cooldown",
  4: "recovery",
  5: "interval",
  6: "other"
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

function cadenceFromGarmin(value, sport = null) {
  const n = numberOrNull(value);
  if (n == null) return null;

  // Garmin stores running cadence in the session/lap as strides per minute.
  // Runory displays steps per minute, so running cadence is ×2.
  return sport === 1 ? Math.round(n * 2) : Math.round(n);
}

function recordCadenceFromGarmin(value, fractionalValue, sport = 1) {
  const base = numberOrNull(value);
  if (base == null) return null;

  // Record cadence has a 0.5 rpm base resolution; fractional_cadence is 1/128 rpm.
  const fractional = numberOrNull(fractionalValue);
  const rpm = base + (fractional != null ? fractional / 128 : 0);
  return sport === 1 ? rpm * 2 : rpm;
}

function speedFromGarmin(value) {
  const n = numberOrNull(value);
  if (n == null || n <= 0) return null;
  return n / 1000;
}

function normalizeSession(session) {
  if (!session) return null;

  const sport = session[5];
  const enhancedAvgSpeed = speedFromGarmin(session[124]);
  const enhancedMaxSpeed = speedFromGarmin(session[125]);

  return {
    sport,
    subSport: session[6],
    startTime: fitTimeToDate(session[2]),
    totalElapsedTime: numberOrNull(session[7]) != null ? session[7] / 1000 : null,
    totalTimerTime: numberOrNull(session[8]) != null ? session[8] / 1000 : null,
    distance: numberOrNull(session[9]) != null ? session[9] / 100 : null,
    calories: numberOrNull(session[11]),
    avgSpeed: enhancedAvgSpeed ?? speedFromGarmin(session[14]),
    maxSpeed: enhancedMaxSpeed ?? speedFromGarmin(session[15]),
    avgHeartRate: numberOrNull(session[16]),
    maxHeartRate: numberOrNull(session[17]),
    avgCadence: cadenceFromGarmin(session[18], sport),
    maxCadence: cadenceFromGarmin(session[19], sport),
    totalAscent: numberOrNull(session[22]),
    totalDescent: numberOrNull(session[23])
  };
}

function normalizeLap(lap, index) {
  if (!lap) return null;

  const distance = numberOrNull(lap[9]);
  const elapsed = numberOrNull(lap[7]);
  const timer = numberOrNull(lap[8]);
  const seconds = timer != null ? timer / 1000 : elapsed != null ? elapsed / 1000 : null;
  const sport = numberOrNull(lap[25]);

  if (distance == null || distance <= 0 || seconds == null || seconds <= 0) {
    return null;
  }

  const speed = speedFromGarmin(lap[124]) ?? speedFromGarmin(lap[13]);

  return {
    index,
    messageIndex: numberOrNull(lap[254]),
    workoutStepIndex: numberOrNull(lap[71]),
    startTime: fitTimeToDate(lap[2]),
    endTime: fitTimeToDate(lap[253]),
    distance: distance / 100,
    duration: seconds,
    pace: speed != null
      ? secondsToPace(1000 / speed)
      : secondsToPace(seconds / (distance / 100000)),
    avgSpeed: speed,
    maxSpeed: speedFromGarmin(lap[14]),
    avgHeartRate: numberOrNull(lap[15]),
    maxHeartRate: numberOrNull(lap[16]),
    avgCadence: cadenceFromGarmin(lap[17], sport),
    maxCadence: cadenceFromGarmin(lap[18], sport),
    ascent: numberOrNull(lap[21]),
    descent: numberOrNull(lap[22]),
    intensity: INTENSITIES[numberOrNull(lap[23])] ?? "unknown",
    calories: numberOrNull(lap[11]),
    lapTrigger: numberOrNull(lap[24]),
    sport,
    subSport: lap[26]
  };
}

function normalizeWorkoutStep(step, index) {
  if (!step) return null;

  const durationType = numberOrNull(step[1]);
  const durationValue = numberOrNull(step[2]);
  const intensity = numberOrNull(step[7]);

  const durationUnit =
    durationType === 0 ? "time" :
    durationType === 1 ? "distance" :
    durationType === 2 ? "heart_rate_less_than" :
    durationType === 3 ? "heart_rate_greater_than" :
    durationType === 4 ? "calories" :
    durationType === 5 ? "open" :
    durationType === 6 ? "repeat_until_steps_complete" :
    durationType === 7 ? "repeat_until_time" :
    durationType === 8 ? "repeat_until_distance" :
    durationType === 9 ? "repeat_until_calories" :
    durationType === 10 ? "repeat_until_heart_rate_less_than" :
    durationType === 11 ? "repeat_until_heart_rate_greater_than" :
    durationType === 12 ? "repeat_until_power_less_than" :
    durationType === 13 ? "repeat_until_power_greater_than" :
    durationType === 14 ? "repeat_until_repetitions" :
    "unknown";

  return {
    index,
    name: step[0] ?? null,
    intensity: INTENSITIES[intensity] ?? "unknown",
    durationType,
    durationUnit,
    durationValue,
    distance: durationType === 1 && durationValue != null ? durationValue / 100 : null,
    duration: durationType === 0 && durationValue != null ? durationValue / 1000 : null,
    targetType: numberOrNull(step[3]),
    targetValue: numberOrNull(step[4]),
    customTargetLow: numberOrNull(step[5]),
    customTargetHigh: numberOrNull(step[6]),
    messageIndex: numberOrNull(step[254])
  };
}

function altitudeFromRecord(record) {
  const enhanced = numberOrNull(record[78]);
  const altitude = numberOrNull(record[2]);
  if (enhanced != null) return enhanced / 5 - 500;
  if (altitude != null) return altitude / 5 - 500;
  return null;
}

function buildKmSplits(records, sport, authoritativeAscent = null) {
  const points = records
    .map(record => ({
      timestamp: numberOrNull(record[253]),
      distance: numberOrNull(record[5]) != null ? record[5] / 100 : null,
      heartRate: numberOrNull(record[3]),
      cadence: recordCadenceFromGarmin(record[4], record[53], sport),
      altitude: altitudeFromRecord(record)
    }))
    .filter(point =>
      Number.isFinite(point.timestamp) &&
      Number.isFinite(point.distance)
    )
    .sort((a, b) => a.timestamp - b.timestamp);

  if (points.length < 2) return [];

  const totalDistance = points.at(-1).distance;
  if (!Number.isFinite(totalDistance) || totalDistance <= 0) return [];

  const buildRange = (startDistance, endDistance) => {
    let distance = 0;
    let time = 0;
    let hrSum = 0;
    let hrTime = 0;
    let cadenceSum = 0;
    let cadenceTime = 0;
    let rawAscent = 0;

    for (let i = 1; i < points.length; i++) {
      const previous = points[i - 1];
      const current = points[i];
      const segmentDistance = current.distance - previous.distance;
      const segmentTime = current.timestamp - previous.timestamp;

      if (!Number.isFinite(segmentDistance) || segmentDistance <= 0 ||
          !Number.isFinite(segmentTime) || segmentTime < 0) continue;

      const overlapStart = Math.max(startDistance, previous.distance);
      const overlapEnd = Math.min(endDistance, current.distance);
      const overlap = overlapEnd - overlapStart;

      if (overlap <= 0) continue;

      const startFraction = (overlapStart - previous.distance) / segmentDistance;
      const endFraction = (overlapEnd - previous.distance) / segmentDistance;
      const fraction = endFraction - startFraction;
      const partTime = segmentTime * fraction;
      const midpointFraction = (startFraction + endFraction) / 2;

      distance += overlap;
      time += partTime;

      if (Number.isFinite(previous.heartRate) && Number.isFinite(current.heartRate)) {
        const hr = previous.heartRate +
          (current.heartRate - previous.heartRate) * midpointFraction;
        hrSum += hr * partTime;
        hrTime += partTime;
      }

      if (Number.isFinite(previous.cadence) && Number.isFinite(current.cadence)) {
        const cadence = previous.cadence +
          (current.cadence - previous.cadence) * midpointFraction;
        cadenceSum += cadence * partTime;
        cadenceTime += partTime;
      }

      if (Number.isFinite(previous.altitude) && Number.isFinite(current.altitude)) {
        const altitudeChange = current.altitude - previous.altitude;
        if (altitudeChange > 0) rawAscent += altitudeChange * fraction;
      }
    }

    return {
      distance,
      time,
      heartRate: hrTime ? Math.round(hrSum / hrTime) : null,
      cadence: cadenceTime ? Math.round(cadenceSum / cadenceTime) : null,
      rawAscent
    };
  };

  const rawSplits = [];
  let km = 1;
  let start = 0;

  while (start < totalDistance - 0.01) {
    const end = Math.min(km * 1000, totalDistance);
    const range = buildRange(start, end);

    if (range.distance >= 50 && range.time > 0) {
      rawSplits.push({
        km: end >= km * 1000 - 0.01 ? km : `${km}*`,
        ...range
      });
    }

    start = end;
    km += 1;
  }

  const rawTotal = rawSplits.reduce(
    (sum, split) => sum + Math.max(0, split.rawAscent || 0),
    0
  );
  const targetAscent = Number.isFinite(authoritativeAscent)
    ? authoritativeAscent
    : null;

  const output = rawSplits.map(split => {
    const scaledAscent = targetAscent != null && rawTotal > 0
      ? split.rawAscent * (targetAscent / rawTotal)
      : split.rawAscent;

    return {
      km: split.km,
      pace: secondsToPace(split.time / (split.distance / 1000)),
      heartRate: split.heartRate,
      cadence: split.cadence,
      ascent: Math.max(0, Math.floor(scaledAscent)),
      _ascentFraction: Math.max(0, scaledAscent - Math.floor(scaledAscent)),
      distance: Number((split.distance / 1000).toFixed(3)),
      duration: split.time
    };
  });

  if (targetAscent != null && rawTotal > 0 && output.length) {
    let roundedSum = output.reduce((sum, split) => sum + split.ascent, 0);
    let difference = Math.round(targetAscent) - roundedSum;
    const order = [...output].sort((a, b) => b._ascentFraction - a._ascentFraction);
    let cursor = 0;

    while (difference > 0) {
      order[cursor % order.length].ascent += 1;
      difference -= 1;
      cursor += 1;
    }

    cursor = 0;
    while (difference < 0) {
      const candidate = order[cursor % order.length];
      if (candidate.ascent > 0) {
        candidate.ascent -= 1;
        difference += 1;
      }
      cursor += 1;
      if (cursor > order.length * 10 && difference < 0) break;
    }
  }

  return output.map(({ _ascentFraction, ...split }) => split);
}

function buildSegments(laps, workoutSteps) {
  const normalizedLaps = laps
    .map((lap, i) => normalizeLap(lap, i + 1))
    .filter(Boolean);

  const normalizedSteps = workoutSteps
    .map((step, i) => normalizeWorkoutStep(step, i))
    .filter(Boolean);

  const stepByIndex = new Map(normalizedSteps.map(step => [step.index, step]));

  // Executed Garmin laps are the authoritative structure of what actually happened.
  // Workout steps describe the prescription; wkt_step_index on each lap connects
  // the prescription to the executed segment, including repeated 400 m recoveries.
  const segments = normalizedLaps.map(lap => {
    const step = lap.workoutStepIndex != null
      ? stepByIndex.get(lap.workoutStepIndex)
      : null;

    return {
      type: lap.intensity !== "unknown" ? lap.intensity : step?.intensity ?? "unknown",
      source: "garmin_lap",
      lapIndex: lap.index,
      workoutStepIndex: lap.workoutStepIndex,
      distance: lap.distance,
      duration: lap.duration,
      pace: lap.pace,
      heartRate: lap.avgHeartRate,
      maxHeartRate: lap.maxHeartRate,
      cadence: lap.avgCadence,
      maxCadence: lap.maxCadence,
      ascent: lap.ascent,
      descent: lap.descent,
      calories: lap.calories,
      targetType: step?.targetType ?? null,
      targetValue: step?.targetValue ?? null,
      targetLow: step?.customTargetLow ?? null,
      targetHigh: step?.customTargetHigh ?? null
    };
  });

  return {
    workoutSteps: normalizedSteps,
    explicitNonKmLaps: normalizedLaps.filter(lap => !(lap.distance >= 980 && lap.distance <= 1020)),
    segments,
    garminLaps: normalizedLaps.map(lap => ({
      type: lap.intensity,
      source: "garmin_lap",
      index: lap.index,
      workoutStepIndex: lap.workoutStepIndex,
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
    }))
  };
}

function buildGarminRecordSummary(records) {
  if (!records.length) return null;

  const heartRates = records
    .map(r => numberOrNull(r[3]))
    .filter(v => v != null && v > 0 && v < 255);

  const cadences = records
    .map(r => recordCadenceFromGarmin(r[4], r[53], 1))
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

  const structure = buildSegments(laps, workoutSteps);
  const splits = buildKmSplits(records, session.sport, session.totalAscent);

  return {
    distance: (session.distance / 1000).toFixed(2),
    duration: secondsToTime(session.totalTimerTime),
    pace: session.avgSpeed != null
      ? secondsToPace(1000 / session.avgSpeed)
      : "—",
    heartRate: session.avgHeartRate,
    cadence: session.avgCadence,
    ascent: session.totalAscent ?? 0,
    date: session.startTime,

    // Garmin is the source of truth for summary and executed workout structure.
    garmin: {
      session,
      workout,
      workoutSteps: structure.workoutSteps,
      laps: laps.map((lap, i) => normalizeLap(lap, i + 1)).filter(Boolean),
      events,
      recordSummary: buildGarminRecordSummary(records)
    },

    // Kilometer splits are derived from Garmin record distance/timestamp samples.
    splits,

    // Structured workout: every executed Garmin lap, including short recoveries.
    segments: structure.segments,
    garminLaps: structure.garminLaps,

    metadata: {
      hasWorkoutSteps: structure.workoutSteps.length > 0,
      hasExplicitNonKmLaps: structure.explicitNonKmLaps.length > 0,
      lapCount: laps.length,
      recordCount: records.length,
      eventCount: events.length,
      workoutStepCount: workoutSteps.length,
      sourceOfTruth: "Garmin FIT"
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
