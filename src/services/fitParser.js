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
  if (!type || field.size < type.size || offset + field.size > view.byteLength) return null;
  const value = view[type.get](offset, littleEndian);
  if (type.invalid !== null && value === type.invalid) return null;
  return typeof value === "bigint" ? Number(value) : value;
}

function decodeFit(buffer) {
  const view = new DataView(buffer);
  if (view.byteLength < 12) throw new Error("FIT-файл занадто малий");

  const headerSize = view.getUint8(0);
  const dataSize = view.getUint32(4, true);
  const magic = String.fromCharCode(view.getUint8(8), view.getUint8(9), view.getUint8(10), view.getUint8(11));

  if (headerSize < 12 || headerSize > view.byteLength || magic !== ".FIT") {
    throw new Error("Це не схоже на коректний FIT-файл Garmin");
  }

  const dataEnd = Math.min(headerSize + dataSize, view.byteLength);
  let offset = headerSize;
  let lastTimestamp = null;
  const definitions = new Map();
  const messages = { session: [], lap: [], record: [], event: [], workout: [], workout_step: [] };

  while (offset < dataEnd) {
    const recordHeader = view.getUint8(offset++);
    const compressed = (recordHeader & 0x80) !== 0;
    const isDefinition = !compressed && (recordHeader & 0x40) !== 0;
    const hasDeveloperData = !compressed && (recordHeader & 0x20) !== 0;
    const localMessage = compressed ? (recordHeader >> 5) & 0x03 : recordHeader & 0x0f;

    if (isDefinition) {
      if (offset + 5 > dataEnd) throw new Error("Пошкоджена структура FIT-файлу");
      offset += 1;
      const littleEndian = view.getUint8(offset++) === 0;
      const globalMessage = view.getUint16(offset, littleEndian);
      offset += 2;
      const fieldCount = view.getUint8(offset++);
      const fields = [];
      for (let i = 0; i < fieldCount; i++) {
        fields.push({ number: view.getUint8(offset++), size: view.getUint8(offset++), baseType: view.getUint8(offset++) });
      }
      const developerFields = [];
      if (hasDeveloperData) {
        if (offset >= dataEnd) throw new Error("Пошкоджені developer fields");
        const developerCount = view.getUint8(offset++);
        for (let i = 0; i < developerCount; i++) {
          if (offset + 3 > dataEnd) throw new Error("Пошкоджені developer fields");
          developerFields.push({ number: view.getUint8(offset++), size: view.getUint8(offset++), developerDataIndex: view.getUint8(offset++) });
        }
      }
      definitions.set(localMessage, { globalMessage, littleEndian, fields, developerFields });
      continue;
    }

    const definition = definitions.get(localMessage);
    if (!definition) throw new Error("Не вдалося прочитати структуру FIT-файлу");

    const message = {};
    if (compressed) {
      const timeOffset = recordHeader & 0x1f;
      if (lastTimestamp !== null) {
        message[253] = (lastTimestamp & ~0x1f) + timeOffset + (timeOffset < (lastTimestamp & 0x1f) ? 0x20 : 0);
      }
    }

    for (const field of definition.fields) {
      message[field.number] = readField(view, offset, field, definition.littleEndian);
      offset += field.size;
    }
    for (const field of definition.developerFields) offset += field.size;

    if (message[253] != null) lastTimestamp = message[253];
    const name = MESSAGE_NAMES[definition.globalMessage];
    if (name) messages[name].push(message);
  }

  return messages;
}

function fitTimeToDate(value) {
  return Number.isFinite(value) ? new Date(FIT_EPOCH_MS + value * 1000) : null;
}

function secondsToTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return "—";
  const total = Math.round(seconds);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return h ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}` : `${m}:${String(s).padStart(2, "0")}`;
}

function secondsToPace(seconds) {
  if (!Number.isFinite(seconds) || seconds <= 0) return "—";
  const total = Math.round(seconds);
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
}

function numberOrNull(value) {
  return Number.isFinite(Number(value)) ? Number(value) : null;
}

// Garmin FIT stores Record cadence in half-steps/min, while Lap/Session
// cadence in this Garmin export is already the displayed steps/min value.
function recordCadenceFromGarmin(value) {
  const n = numberOrNull(value);
  return n == null ? null : Math.round(n * 2);
}

function lapCadenceFromGarmin(value) {
  const n = numberOrNull(value);
  return n == null ? null : Math.round(n);
}

function speedFromGarmin(value) {
  const n = numberOrNull(value);
  return n == null || n <= 0 ? null : n / 1000;
}

function normalizeSession(session) {
  if (!session) return null;
  return {
    sport: session[5], subSport: session[6], startTime: fitTimeToDate(session[2]),
    totalElapsedTime: numberOrNull(session[7]) != null ? session[7] / 1000 : null,
    totalTimerTime: numberOrNull(session[8]) != null ? session[8] / 1000 : null,
    distance: numberOrNull(session[9]) != null ? session[9] / 100 : null,
    calories: numberOrNull(session[11]), avgSpeed: speedFromGarmin(session[14]), maxSpeed: speedFromGarmin(session[15]),
    avgHeartRate: numberOrNull(session[16]), maxHeartRate: numberOrNull(session[17]),
    avgCadence: lapCadenceFromGarmin(session[18]), maxCadence: lapCadenceFromGarmin(session[19]),
    totalAscent: numberOrNull(session[21]), totalDescent: numberOrNull(session[22])
  };
}

function normalizeLap(lap, index) {
  if (!lap) return null;
  const distanceMeters = numberOrNull(lap[9]) != null ? lap[9] / 100 : null;
  const elapsedMs = numberOrNull(lap[7]);
  const timerMs = numberOrNull(lap[8]);
  const seconds = timerMs != null ? timerMs / 1000 : elapsedMs != null ? elapsedMs / 1000 : null;
  if (distanceMeters == null || distanceMeters <= 0 || seconds == null || seconds <= 0) return null;

  const speed = speedFromGarmin(lap[13]);
  const paceSecondsPerKm = speed != null ? 1000 / speed : seconds * 1000 / distanceMeters;

  return {
    index,
    startTime: fitTimeToDate(lap[2]), endTime: fitTimeToDate(lap[253]),
    distance: distanceMeters, duration: seconds, pace: secondsToPace(paceSecondsPerKm),
    paceSeconds: paceSecondsPerKm, avgSpeed: speed, maxSpeed: speedFromGarmin(lap[14]),
    avgHeartRate: numberOrNull(lap[15]), maxHeartRate: numberOrNull(lap[17]),
    avgCadence: lapCadenceFromGarmin(lap[16]), maxCadence: lapCadenceFromGarmin(lap[18]),
    ascent: numberOrNull(lap[21]), descent: numberOrNull(lap[22]), calories: numberOrNull(lap[11]),
    lapTrigger: numberOrNull(lap[24]), sport: lap[25], subSport: lap[26]
  };
}

function normalizeWorkoutStep(step, index) {
  if (!step) return null;
  const durationType = numberOrNull(step[1]);
  const durationValue = numberOrNull(step[2]);
  const intensity = numberOrNull(step[7]);
  const durationUnit = durationType === 1 ? "distance" : durationType === 2 ? "time" : durationType === 3 ? "lap.button" : durationType === 4 ? "repeat_until_steps_cmplt" : durationType === 5 ? "repeat_until_time" : durationType === 6 ? "repeat_until_distance" : durationType === 7 ? "repeat_until_calories" : durationType === 8 ? "repeat_until_hr_less_than" : durationType === 9 ? "repeat_until_hr_greater_than" : durationType === 10 ? "repeat_until_calories" : "unknown";
  return {
    index, name: step[0] ?? null, intensity: INTENSITIES[intensity] ?? "unknown", durationType, durationUnit,
    durationValue, distance: durationType === 1 && durationValue != null ? durationValue / 100 : null,
    duration: durationType === 2 && durationValue != null ? durationValue / 1000 : null,
    targetType: numberOrNull(step[3]), targetValue: numberOrNull(step[4]), customTargetLow: numberOrNull(step[5]),
    customTargetHigh: numberOrNull(step[6]), messageIndex: numberOrNull(step[254])
  };
}

function buildKmSplitsFromLaps(laps) {
  const valid = laps.map((lap, i) => normalizeLap(lap, i + 1)).filter(Boolean);
  const kmLaps = valid.filter(lap => lap.distance >= 980 && lap.distance <= 1020);
  return kmLaps.map((lap, i) => ({
    km: i + 1, distance: lap.distance, duration: lap.duration, pace: lap.pace,
    heartRate: lap.avgHeartRate, maxHeartRate: lap.maxHeartRate, cadence: lap.avgCadence,
    maxCadence: lap.maxCadence, ascent: lap.ascent, descent: lap.descent
  }));
}

// Fallback when Garmin did not create distance-lap messages. We still use only
// Garmin Record data: cumulative distance, timestamp, speed, HR, cadence, altitude.
function buildKmSplitsFromRecords(records) {
  if (!records.length) return [];
  const rows = records.map((r, i) => ({
    i, t: numberOrNull(r[253]), d: numberOrNull(r[5]) != null ? r[5] / 100 : null,
    speed: speedFromGarmin(r[13] ?? r[6]), hr: numberOrNull(r[3]), cadence: recordCadenceFromGarmin(r[4]),
    altitude: numberOrNull(r[78]) != null ? r[78] / 5 - 500 : numberOrNull(r[2]) != null ? r[2] / 5 - 500 : null
  })).filter(x => x.d != null && x.t != null).sort((a, b) => a.t - b.t);
  if (rows.length < 2) return [];

  const result = [];
  let previousDistance = 0;
  let previousIndex = 0;
  const maxKm = Math.floor(rows.at(-1).d / 1000);

  for (let km = 1; km <= maxKm; km++) {
    const boundary = km * 1000;
    let endIndex = previousIndex;
    while (endIndex < rows.length && rows[endIndex].d < boundary) endIndex++;
    if (endIndex >= rows.length) break;
    const startRow = rows[previousIndex];
    const endRow = rows[endIndex];
    const duration = (endRow.t - startRow.t);
    const samples = rows.slice(previousIndex, endIndex + 1);
    const avg = key => { const a = samples.map(x => x[key]).filter(Number.isFinite); return a.length ? a.reduce((s,v)=>s+v,0)/a.length : null; };
    const altitudes = samples.map(x=>x.altitude).filter(Number.isFinite);
    let ascent = 0, descent = 0;
    for (let j=1;j<altitudes.length;j++){ const diff=altitudes[j]-altitudes[j-1]; if(diff>2) ascent+=diff; else if(diff<-2) descent-=diff; }
    result.push({ km, distance: 1000, duration, pace: secondsToPace(duration), heartRate: avg("hr") == null ? null : Math.round(avg("hr")), cadence: avg("cadence") == null ? null : Math.round(avg("cadence")), ascent: Math.round(ascent), descent: Math.round(descent) });
    previousIndex = endIndex;
    previousDistance = boundary;
  }
  return result;
}

function buildSegments(laps, workoutSteps) {
  const normalizedLaps = laps.map((lap, i) => normalizeLap(lap, i + 1)).filter(Boolean);
  const normalizedSteps = workoutSteps.map((step, i) => normalizeWorkoutStep(step, i)).filter(Boolean);
  const explicitNonKmLaps = normalizedLaps.filter(lap => lap.distance < 980 || lap.distance > 1020);
  const garminLaps = normalizedLaps.map(lap => ({
    type: "lap", source: "garmin_lap", index: lap.index, distance: lap.distance, duration: lap.duration,
    pace: lap.pace, avgSpeed: lap.avgSpeed, maxSpeed: lap.maxSpeed, heartRate: lap.avgHeartRate,
    maxHeartRate: lap.maxHeartRate, cadence: lap.avgCadence, maxCadence: lap.maxCadence,
    ascent: lap.ascent, descent: lap.descent, calories: lap.calories, startTime: lap.startTime, endTime: lap.endTime, lapTrigger: lap.lapTrigger
  }));

  const segments = normalizedSteps.map(step => ({ type: step.intensity, source: "garmin_workout_step", index: step.index, distance: step.distance, duration: step.duration, targetType: step.targetType, targetValue: step.targetValue, targetLow: step.customTargetLow, targetHigh: step.customTargetHigh }));
  return { workoutSteps: normalizedSteps, explicitNonKmLaps, segments, garminLaps };
}

function buildGarminRecordSummary(records) {
  if (!records.length) return null;
  const heartRates = records.map(r => numberOrNull(r[3])).filter(v => v != null && v > 0 && v < 255);
  const cadences = records.map(r => recordCadenceFromGarmin(r[4])).filter(v => v != null && v > 0 && v < 255);
  const distances = records.map(r => numberOrNull(r[5])).filter(v => v != null && v >= 0);
  const altitudes = records.map(r => numberOrNull(r[78]) != null ? r[78] / 5 - 500 : numberOrNull(r[2]) != null ? r[2] / 5 - 500 : null).filter(v => v != null);
  return {
    recordCount: records.length, firstDistance: distances.length ? distances[0] / 100 : null, lastDistance: distances.length ? distances.at(-1) / 100 : null,
    minHeartRate: heartRates.length ? Math.min(...heartRates) : null, maxHeartRate: heartRates.length ? Math.max(...heartRates) : null,
    avgHeartRate: heartRates.length ? Math.round(heartRates.reduce((a,b)=>a+b,0)/heartRates.length) : null,
    avgCadence: cadences.length ? Math.round(cadences.reduce((a,b)=>a+b,0)/cadences.length) : null,
    minAltitude: altitudes.length ? Math.min(...altitudes) : null, maxAltitude: altitudes.length ? Math.max(...altitudes) : null
  };
}

function calculateSummary(messages) {
  const sessionRaw = messages.session.at(-1) || null;
  const session = normalizeSession(sessionRaw);
  if (!session || !session.distance || !session.totalTimerTime) throw new Error("У цьому FIT-файлі не знайдено даних про бігове тренування");

  const laps = messages.lap || [], workoutSteps = messages.workout_step || [], records = messages.record || [], events = messages.event || [], workout = messages.workout || [];
  const segments = buildSegments(laps, workoutSteps);
  let splits = buildKmSplitsFromLaps(laps);
  if (!splits.length) splits = buildKmSplitsFromRecords(records);

  return {
    distance: (session.distance / 1000).toFixed(2), duration: secondsToTime(session.totalTimerTime),
    pace: session.avgSpeed != null ? secondsToPace(1000 / session.avgSpeed) : secondsToPace(session.totalTimerTime * 1000 / session.distance),
    heartRate: session.avgHeartRate, cadence: session.avgCadence, ascent: session.totalAscent ?? 0, date: session.startTime,
    garmin: { session, workout, workoutSteps: segments.workoutSteps, laps: laps.map((lap,i)=>normalizeLap(lap,i+1)).filter(Boolean), events, recordSummary: buildGarminRecordSummary(records) },
    splits, segments: segments.segments, garminLaps: segments.garminLaps,
    metadata: { hasWorkoutSteps: segments.workoutSteps.length > 0, hasExplicitNonKmLaps: segments.explicitNonKmLaps.length > 0, lapCount: laps.length, recordCount: records.length, eventCount: events.length, workoutStepCount: workoutSteps.length, splitSource: splits.length ? (buildKmSplitsFromLaps(laps).length ? "garmin_lap" : "garmin_record") : null }
  };
}

async function parseFitFile(file) {
  if (!file?.name?.toLowerCase().endsWith(".fit")) throw new Error("Потрібен файл Garmin у форматі .fit");
  return calculateSummary(decodeFit(await file.arrayBuffer()));
}

window.parseFitFile = parseFitFile;
