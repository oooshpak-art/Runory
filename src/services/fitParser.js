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
  const workouts = [];
  const workoutSteps = [];

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
    if (definition.globalMessage === 26) workouts.push(message);
    if (definition.globalMessage === 27) workoutSteps.push(message);
  }
  return { sessions, laps, records, workouts, workoutSteps };
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
            : firstTime != null && lastTime != null
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

    // Набор высоты конкретного сплита.
    // Garmin может передавать обычную altitude (field 2)
    // или enhanced_altitude (field 78).
    const altitudes = records
        .map(record => {
            if (Number.isFinite(record[78])) return record[78] / 5 - 500;
            if (Number.isFinite(record[2])) return record[2] / 5 - 500;
            return null;
        })
        .filter(value => Number.isFinite(value));

    let ascent = 0;

    for (let i = 1; i < altitudes.length; i++) {
        const difference = altitudes[i] - altitudes[i - 1];

        // Игнорируем небольшие колебания высоты.
        if (difference > 2) ascent += difference;
    }

    return {
        km,
        pace: duration != null ? secondsToPace(duration) : null,

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

function buildLapBasedSplitAscents(laps) {
  const validLaps = (laps || [])
    .map(lap => ({
      distance: Number.isFinite(lap[9]) ? lap[9] / 100 : null,
      ascent: Number.isFinite(lap[21]) ? lap[21] : 0,
    }))
    .filter(lap => lap.distance > 0);

  if (!validLaps.length) return null;

  const splitAscents = new Map();
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

      const share = lap.ascent * (overlap / lap.distance);
      splitAscents.set(km, (splitAscents.get(km) || 0) + share);
    }

    lapStartDistance = lapEndDistance;
  }

  return splitAscents;
}

function buildLapBasedSplitElevations(laps) {
  const validLaps = (laps || [])
    .map(lap => ({
      distance: Number.isFinite(lap[9]) ? lap[9] / 100 : null,
      ascent: Number.isFinite(lap[21]) ? lap[21] : 0,
      descent: Number.isFinite(lap[22]) ? lap[22] : 0,
    }))
    .filter(lap => lap.distance > 0);

  if (!validLaps.length) return null;

  const splitElevations = new Map();
  let lapStartDistance = 0;

  for (const lap of validLaps) {
    const lapEndDistance = lapStartDistance + lap.distance;

    for (let km = Math.floor(lapStartDistance / 1000) + 1; km <= Math.ceil(lapEndDistance / 1000); km++) {
      const splitStart = Math.max(lapStartDistance, (km - 1) * 1000);
      const splitEnd = Math.min(lapEndDistance, km * 1000);
      const overlap = splitEnd - splitStart;
      if (overlap <= 0) continue;

      const share = overlap / lap.distance;
      const current = splitElevations.get(km) || { ascent: 0, descent: 0 };
      current.ascent += lap.ascent * share;
      current.descent += lap.descent * share;
      splitElevations.set(km, current);
    }

    lapStartDistance = lapEndDistance;
  }

  for (const [km, value] of splitElevations) {
    value.ascent = Math.round(value.ascent);
    value.descent = Math.round(value.descent);
    value.elevation = value.ascent - value.descent;
    splitElevations.set(km, value);
  }

  return splitElevations;
}

function workoutStepDistanceMeters(step) {
  if (!step) return null;
  const durationType = Number(step[1]);
  if (durationType === 1 && Number.isFinite(step[2])) return step[2] / 100;
  return null;
}

function expandWorkoutSteps(workoutSteps = []) {
  const ordered = [...workoutSteps]
    .filter(step => Number.isFinite(step?.[254]))
    .sort((a, b) => Number(a[254]) - Number(b[254]));

  if (!ordered.length) return [];

  const byIndex = new Map(ordered.map(step => [Number(step[254]), step]));
  const maxIndex = Math.max(...ordered.map(step => Number(step[254])));
  const repeatBodyIndices = new Set();

  for (const step of ordered) {
    if (Number(step[1]) !== 6) continue;
    const repeatFrom = Number(step[2]);
    const repetitions = Number(step[4]);
    if (!Number.isInteger(repeatFrom) || !Number.isInteger(repetitions) || repetitions <= 0) continue;
    for (let index = repeatFrom; index < Number(step[254]); index += 1) {
      repeatBodyIndices.add(index);
    }
  }

  const cloneStep = (step, repeated = false) => {
    const clone = Array.isArray(step) ? [...step] : Object.assign([], step);
    clone.__sourceIndex = Number(step[254]);
    clone.__repeated = repeated || repeatBodyIndices.has(Number(step[254]));
    return clone;
  };

  const expandRange = (fromIndex, toIndex, stack = []) => {
    const result = [];
    for (let index = fromIndex; index < toIndex; index += 1) {
      const step = byIndex.get(index);
      if (!step) continue;

      const durationType = Number(step[1]);
      if (durationType === 6) {
        const repeatFrom = Number(step[2]);
        const repetitions = Number(step[4]);
        if (
          Number.isInteger(repeatFrom) &&
          Number.isInteger(repetitions) &&
          repetitions > 0 &&
          repeatFrom >= 0 &&
          repeatFrom < index &&
          !stack.includes(index)
        ) {
          const repeatedBlock = expandRange(repeatFrom, index, [...stack, index]);
          for (let count = 1; count < repetitions; count += 1) {
            for (const item of repeatedBlock) {
              const clone = [...item];
              clone.__sourceIndex = item.__sourceIndex;
              clone.__repeated = true;
              result.push(clone);
            }
          }
          continue;
        }
      }

      result.push(cloneStep(step));
    }
    return result;
  };

  return expandRange(0, maxIndex + 1);
}

function averageNumber(values) {
  const valid = values.filter(Number.isFinite);
  return valid.length
    ? Math.round(valid.reduce((sum, value) => sum + value, 0) / valid.length)
    : null;
}

function recordDistanceMeters(record) {
  return Number.isFinite(record?.[5]) ? record[5] / 100 : null;
}

function recordTimestamp(record) {
  return Number.isFinite(record?.[253]) ? record[253] : null;
}

function interpolateTimestampAtDistance(records, targetDistance) {
  if (!records.length) return null;

  for (let i = 0; i < records.length; i += 1) {
    const currentDistance = recordDistanceMeters(records[i]);
    const currentTime = recordTimestamp(records[i]);
    if (currentDistance == null || currentTime == null) continue;

    if (currentDistance >= targetDistance) {
      if (i === 0) return currentTime;
      const previousDistance = recordDistanceMeters(records[i - 1]);
      const previousTime = recordTimestamp(records[i - 1]);
      if (
        previousDistance == null ||
        previousTime == null ||
        currentDistance <= previousDistance
      ) return currentTime;

      const ratio = Math.max(0, Math.min(1,
        (targetDistance - previousDistance) / (currentDistance - previousDistance)
      ));
      return previousTime + (currentTime - previousTime) * ratio;
    }
  }

  const last = records.at(-1);
  return recordTimestamp(last);
}

function altitudeMeters(record) {
  if (Number.isFinite(record?.[78])) return record[78] / 5 - 500;
  if (Number.isFinite(record?.[2])) return record[2] / 5 - 500;
  return null;
}

function interpolateDistanceAtTime(records, targetTime) {
  if (!records.length || !Number.isFinite(targetTime)) return null;

  for (let i = 0; i < records.length; i += 1) {
    const currentTime = recordTimestamp(records[i]);
    const currentDistance = recordDistanceMeters(records[i]);
    if (currentTime == null || currentDistance == null) continue;

    if (currentTime >= targetTime) {
      if (i === 0) return currentDistance;
      const previousTime = recordTimestamp(records[i - 1]);
      const previousDistance = recordDistanceMeters(records[i - 1]);
      if (
        previousTime == null ||
        previousDistance == null ||
        currentTime <= previousTime
      ) return currentDistance;

      const ratio = Math.max(0, Math.min(1,
        (targetTime - previousTime) / (currentTime - previousTime)
      ));
      return previousDistance + (currentDistance - previousDistance) * ratio;
    }
  }

  return recordDistanceMeters(records.at(-1));
}

function averageCadence(records) {
  const values = records.map(record => {
    if (!Number.isFinite(record?.[4])) return null;
    const fractional = Number.isFinite(record[53]) ? record[53] / 128 : 0;
    return (record[4] + fractional) * 2;
  }).filter(value => Number.isFinite(value) && value > 0 && value < 255);
  return values.length ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : null;
}

function elevationStats(records) {
  const altitudes = records.map(altitudeMeters).filter(Number.isFinite);
  let ascent = 0;
  let descent = 0;
  for (let i = 1; i < altitudes.length; i += 1) {
    const delta = altitudes[i] - altitudes[i - 1];
    if (delta > 2) ascent += delta;
    if (delta < -2) descent += Math.abs(delta);
  }
  return {
    ascent: Math.round(ascent),
    descent: Math.round(descent),
    elevation: Math.round(ascent - descent)
  };
}

function statsForDistanceRange(records, startDistance, endDistance) {
  if (!records.length || endDistance <= startDistance) return null;

  const startTime = interpolateTimestampAtDistance(records, startDistance);
  const endTime = interpolateTimestampAtDistance(records, endDistance);
  const duration = startTime != null && endTime != null
    ? Math.max(1, endTime - startTime)
    : null;

  const selected = records.filter(record => {
    const distance = recordDistanceMeters(record);
    return distance != null && distance >= startDistance && distance <= endDistance;
  });

  const heartRates = selected
    .map(record => record[3])
    .filter(value => Number.isFinite(value) && value > 0 && value < 255);

  const elevation = elevationStats(selected);
  const distance = endDistance - startDistance;

  return {
    duration,
    distance,
    pace: duration != null && distance > 1
      ? secondsToPace(duration / (distance / 1000))
      : '—',
    heartRate: averageNumber(heartRates),
    cadence: averageCadence(selected),
    ascent: elevation.ascent,
    descent: elevation.descent,
    elevation: elevation.elevation
  };
}

function statsForTimeRange(records, startTime, endTime) {
  if (!records.length || endTime <= startTime) return null;

  const selected = records.filter(record => {
    const timestamp = recordTimestamp(record);
    return timestamp != null && timestamp >= startTime && timestamp <= endTime;
  });
  if (!selected.length) return null;

  // Use interpolated boundary distances rather than first/last sampled record.
  // This prevents a 5:00 or 50:00 FIT step from gaining/losing a GPS sample.
  const startDistance = interpolateDistanceAtTime(records, startTime);
  const endDistance = interpolateDistanceAtTime(records, endTime);
  const distance = Number.isFinite(startDistance) && Number.isFinite(endDistance)
    ? Math.max(0, endDistance - startDistance)
    : 0;

  const heartRates = selected
    .map(record => record[3])
    .filter(value => Number.isFinite(value) && value > 0 && value < 255);
  const elevation = elevationStats(selected);

  return {
    duration: Math.max(1, endTime - startTime),
    distance,
    pace: distance > 1
      ? secondsToPace((endTime - startTime) / (distance / 1000))
      : '—',
    heartRate: averageNumber(heartRates),
    cadence: averageCadence(selected),
    ascent: elevation.ascent,
    descent: elevation.descent,
    elevation: elevation.elevation
  };
}

function explicitWorkoutStructure(workoutSteps = [], records = []) {
  const expanded = expandWorkoutSteps(workoutSteps);
  if (!expanded.length || !records.length) return null;

  const totalRecordDistance = recordDistanceMeters(records.at(-1));
  const firstRecordTime = recordTimestamp(records[0]);
  const lastRecordTime = recordTimestamp(records.at(-1));
  if (!Number.isFinite(totalRecordDistance)) return null;

  const structures = [];
  let cursorDistance = 0;
  let cursorTime = firstRecordTime;
  let currentBlock = null;

  const flushBlock = () => {
    if (!currentBlock?.repetitions?.length) return;
    const distances = currentBlock.repetitions.map(r => r.targetDistanceMeters).filter(Number.isFinite);
    const durations = currentBlock.repetitions.map(r => r.targetDurationSeconds).filter(Number.isFinite);
    const count = currentBlock.repetitions.length;
    if (distances.length && distances.every(v => Math.abs(v - distances[0]) <= 50)) {
      currentBlock.label = `Работа ${count} × ${Math.round(distances[0])} м`;
    } else if (durations.length && durations.every(v => Math.abs(v - durations[0]) <= 2)) {
      currentBlock.label = `Работа ${count} × ${secondsToTime(durations[0])}`;
    } else {
      currentBlock.label = `Работа ${count} повторов`;
    }
    currentBlock.workCount = count;
    structures.push(currentBlock);
    currentBlock = null;
  };

  const addStandalone = (type, label, stats) => {
    if (!stats || stats.distance <= 0) return;
    flushBlock();
    structures.push({ type, label, ...stats });
  };

  // FIT workout_step duration_type: 0=time, 1=distance.
  // Repeat steps are expanded before this function is called.
  const durationTypeOf = step => Number(step[1]);
  const intensityOf = step => Number(step[7]);
  const isDistanceStep = step =>
    durationTypeOf(step) === 1 && Number.isFinite(workoutStepDistanceMeters(step));
  const isTimeStep = step =>
    durationTypeOf(step) === 0 && Number.isFinite(step[2]) && Number(step[2]) > 0;
  const isWorkIntensity = value => value === 0 || value === 5;
  const isRecoveryIntensity = value => value === 1 || value === 4;
  const isRepeatedWork = step =>
    (isDistanceStep(step) || isTimeStep(step)) && isWorkIntensity(intensityOf(step)) && step.__repeated;
  const isOpenCooldown = step =>
    (durationTypeOf(step) === 5 || durationTypeOf(step) === 6) && intensityOf(step) === 3;

  const repeatedWorkIndices = expanded
    .map((step, index) => ({ step, index }))
    .filter(item => isRepeatedWork(item.step));
  const firstRepeatedWorkIndex = repeatedWorkIndices.length ? repeatedWorkIndices[0].index : -1;

  // Consume a step according to Garmin's actual duration type. This prevents
  // a 50-minute tempo step from being reconstructed as a 13 km run merely
  // because that happened to be the distance covered during the step.
  const consumeStep = step => {
    if (isDistanceStep(step)) {
      const distance = workoutStepDistanceMeters(step);
      const start = cursorDistance;
      const end = Math.min(totalRecordDistance, start + distance);
      const stats = statsForDistanceRange(records, start, end);
      cursorDistance = end;
      const exactEndTime = interpolateTimestampAtDistance(records, end);
      if (Number.isFinite(exactEndTime)) cursorTime = exactEndTime;
      return stats;
    }

    if (isTimeStep(step) && Number.isFinite(cursorTime)) {
      const duration = Number(step[2]) / 1000;
      const start = cursorTime;
      const end = Math.min(lastRecordTime, start + duration);
      const stats = statsForTimeRange(records, start, end);
      cursorTime = end;
      const exactEndDistance = interpolateDistanceAtTime(records, end);
      if (Number.isFinite(exactEndDistance)) cursorDistance = exactEndDistance;
      return stats;
    }
    return null;
  };

  const nextRepeatedWorkExists = index => expanded.slice(index + 1).some(isRepeatedWork);
  let activeStandaloneSteps = [];

  const flushStandaloneActiveSteps = () => {
    if (!activeStandaloneSteps.length) return;
    if (activeStandaloneSteps.length === 1) {
      const item = activeStandaloneSteps[0];
      addStandalone('tempo', 'Темповый бег', item.stats);
      activeStandaloneSteps = [];
      return;
    }

    const paces = activeStandaloneSteps.map(x => x.stats?.pace).filter(Boolean).map(v => {
      const [m, sec] = v.split(':').map(Number);
      return m * 60 + sec;
    });
    const progressive = paces.length >= 2 && paces.at(-1) < paces[0] - 2;
    const combined = activeStandaloneSteps.reduce((acc, item) => {
      const st = item.stats;
      if (!st) return acc;
      acc.duration += st.duration || 0;
      acc.distance += st.distance || 0;
      acc.ascent += st.ascent || 0;
      acc.descent += st.descent || 0;
      if (Number.isFinite(st.heartRate)) acc.hr.push(st.heartRate);
      if (Number.isFinite(st.cadence)) acc.cad.push(st.cadence);
      return acc;
    }, { duration: 0, distance: 0, ascent: 0, descent: 0, hr: [], cad: [] });

    const stats = {
      duration: Math.round(combined.duration),
      distance: Math.round(combined.distance),
      pace: combined.distance > 1 ? secondsToPace(combined.duration / (combined.distance / 1000)) : '—',
      heartRate: combined.hr.length ? Math.round(combined.hr.reduce((a,b) => a+b, 0) / combined.hr.length) : null,
      cadence: combined.cad.length ? Math.round(combined.cad.reduce((a,b) => a+b, 0) / combined.cad.length) : null,
      ascent: Math.round(combined.ascent),
      descent: Math.round(combined.descent),
      elevation: Math.round(combined.ascent - combined.descent)
    };
    addStandalone(progressive ? 'progressive' : 'tempo', progressive ? 'Прогрессивный бег' : 'Темповый бег', stats);
    activeStandaloneSteps = [];
  };

  for (let i = 0; i < expanded.length; i += 1) {
    const step = expanded[i];
    const intensity = intensityOf(step);

    if (isOpenCooldown(step)) {
      flushStandaloneActiveSteps();
      flushBlock();
      const stats = statsForDistanceRange(records, cursorDistance, totalRecordDistance);
      addStandalone('cooldown', 'Заминка', stats);
      cursorDistance = totalRecordDistance;
      cursorTime = lastRecordTime;
      break;
    }

    if (!isDistanceStep(step) && !isTimeStep(step)) continue;
    const stats = consumeStep(step);
    if (!stats || stats.distance <= 0) continue;

    if (intensity === 2) {
      flushStandaloneActiveSteps();
      addStandalone('warmup', 'Разминка', stats);
      continue;
    }

    // Cooldown is explicit only. A long ordinary Run is never promoted to
    // cooldown just because it happens to be the final step.
    if (intensity === 3) {
      flushStandaloneActiveSteps();
      addStandalone('cooldown', 'Заминка', stats);
      continue;
    }

    if (isWorkIntensity(intensity)) {
      if (Boolean(step.__repeated)) {
        flushStandaloneActiveSteps();
        const previous = currentBlock?.repetitions?.at(-1)?.work;
        const sameDistance = previous && Number.isFinite(previous.distance) && Math.abs(previous.distance - stats.distance) <= 50;
        const sameDuration = previous && Number.isFinite(previous.duration) && Math.abs(previous.duration - stats.duration) <= 2;
        if (currentBlock && previous && !sameDistance && !sameDuration) flushBlock();
        if (!currentBlock) currentBlock = { type: 'intervals', label: '', repetitions: [], workCount: 0 };
        currentBlock.repetitions.push({
          number: currentBlock.repetitions.length + 1,
          work: stats,
          recovery: null,
          targetDistanceMeters: isDistanceStep(step) ? workoutStepDistanceMeters(step) : null,
          targetDurationSeconds: isTimeStep(step) ? Number(step[2]) / 1000 : null
        });
        continue;
      }

      // A plain Run before repeated work is warm-up; a plain Run after it is
      // ordinary active running/tempo, never an inferred cooldown.
      if (firstRepeatedWorkIndex >= 0 && i < firstRepeatedWorkIndex) {
        flushStandaloneActiveSteps();
        addStandalone('warmup', 'Разминка', stats);
      } else {
        activeStandaloneSteps.push({ index: i, stats });
      }
      continue;
    }

    if (isRecoveryIntensity(intensity)) {
      flushStandaloneActiveSteps();
      if (currentBlock?.repetitions?.length) {
        // Any recovery between repeated work steps belongs to the interval.
        // This intentionally includes 1 km recoveries.
        if (nextRepeatedWorkExists(i)) {
          currentBlock.repetitions.at(-1).recovery = stats;
          continue;
        }
        // The final recovery also belongs to the final repetition unless
        // Garmin explicitly supplied a cooldown step afterwards.
        currentBlock.repetitions.at(-1).recovery = stats;
        continue;
      }
      addStandalone('recovery', 'Відновлення', stats);
    }
  }

  flushStandaloneActiveSteps();
  flushBlock();

  // If Garmin created several plain Run/Cooldown steps for an otherwise
  // continuous easy workout, do not present artificial Run + Cooldown pieces.
  // A true interval workout keeps its explicit warmup/cooldown boundaries.
  const hasIntervals = structures.some(item => item.type === 'intervals');
  if (!hasIntervals && structures.length > 1) {
    const mergeable = structures.every(item =>
      item.type === 'easy' || item.type === 'warmup' || item.type === 'cooldown'
    );
    if (mergeable) {
      const total = structures.reduce((acc, item) => {
        acc.duration += Number(item.duration) || 0;
        acc.distance += Number(item.distance) || 0;
        acc.ascent += Number(item.ascent) || 0;
        acc.descent += Number(item.descent) || 0;
        if (Number.isFinite(item.heartRate)) acc.hr.push(item.heartRate);
        if (Number.isFinite(item.cadence)) acc.cad.push(item.cadence);
        return acc;
      }, { duration: 0, distance: 0, ascent: 0, descent: 0, hr: [], cad: [] });
      const merged = {
        type: 'easy',
        label: 'Непрерывный бег',
        duration: Math.round(total.duration),
        distance: Math.round(total.distance),
        pace: total.distance > 1 ? secondsToPace(total.duration / (total.distance / 1000)) : '—',
        heartRate: total.hr.length ? Math.round(total.hr.reduce((a,b) => a+b, 0) / total.hr.length) : null,
        cadence: total.cad.length ? Math.round(total.cad.reduce((a,b) => a+b, 0) / total.cad.length) : null,
        ascent: Math.round(total.ascent),
        descent: Math.round(total.descent),
        elevation: Math.round(total.ascent - total.descent),
        repetitions: 1
      };
      return [merged];
    }
  }

  return structures.length ? structures : null;
}

function analyzeWorkoutStructure({ laps = [], records = [], workoutSteps = [] }) {
  const explicit = explicitWorkoutStructure(workoutSteps, records);
  if (explicit) return explicit;

  const validLaps = (laps || []).map((lap, index) => ({
    index,
    duration: Number.isFinite(lap[8]) ? lap[8] / 1000 : (Number.isFinite(lap[7]) ? lap[7] / 1000 : null),
    distance: Number.isFinite(lap[9]) ? lap[9] / 100 : null,
    heartRate: Number.isFinite(lap[15]) ? Math.round(lap[15]) : null,
    cadence: Number.isFinite(lap[17]) ? Math.round(lap[17] * 2) : null,
    ascent: Number.isFinite(lap[21]) ? Math.round(lap[21]) : 0,
  })).filter(lap => lap.duration > 0 && lap.distance > 0 && (lap.distance >= 50 || lap.duration >= 20));

  const stats = lap => ({
    duration: Math.round(lap.duration), distance: Math.round(lap.distance),
    pace: lap.distance > 1 ? secondsToPace(lap.duration / (lap.distance / 1000)) : '—',
    heartRate: lap.heartRate, cadence: lap.cadence, ascent: lap.ascent
  });

  if (!workoutSteps.length && validLaps.length >= 4) {
    const candidates = [];
    for (let i = 0; i < validLaps.length - 1; i++) {
      const lap = validLaps[i], next = validLaps[i + 1];
      if (lap.distance >= 700 && next.distance >= 100 && next.distance < 700) {
        candidates.push({ index: i, pace: lap.duration / (lap.distance / 1000) });
      }
    }
    if (candidates.length >= 2) {
      const sorted = candidates.map(x => x.pace).sort((a,b) => a-b);
      const median = sorted[Math.floor(sorted.length / 2)];
      const workIndices = candidates.filter(x => x.pace <= median * 1.12).map(x => x.index);
      if (workIndices.length >= 2) {
        const firstWork = workIndices[0], lastWork = workIndices.at(-1);
        const combine = items => {
          const duration = items.reduce((s,l) => s+l.duration,0);
          const distance = items.reduce((s,l) => s+l.distance,0);
          const hr = items.map(l=>l.heartRate).filter(Number.isFinite);
          const cad = items.map(l=>l.cadence).filter(Number.isFinite);
          return { duration:Math.round(duration), distance:Math.round(distance), pace:distance>1?secondsToPace(duration/(distance/1000)):'—', heartRate:hr.length?Math.round(hr.reduce((a,b)=>a+b,0)/hr.length):null, cadence:cad.length?Math.round(cad.reduce((a,b)=>a+b,0)/cad.length):null, ascent:items.reduce((s,l)=>s+l.ascent,0) };
        };
        const result=[];
        const warmup=validLaps.slice(0,firstWork), cooldown=validLaps.slice(lastWork+1);
        if(warmup.length) result.push({type:'warmup',label:'Разминка',...combine(warmup)});
        const repetitions=[];
        for(let i=firstWork;i<=lastWork;i++){
          if(!workIndices.includes(i)) continue;
          const w=validLaps[i], r=validLaps[i+1];
          repetitions.push({number:repetitions.length+1,work:stats(w),recovery:r&&r.distance<700?stats(r):null});
        }
        const workDistance=repetitions[0]?.work.distance||0;
        result.push({type:'intervals',label:`Работа ${repetitions.length} × ${Math.round(workDistance)} м`,repetitions,workCount:repetitions.length});
        if(cooldown.length) result.push({type:'cooldown',label:'Заминка',...combine(cooldown)});
        return result;
      }
    }
  }

  if(validLaps.length){
    const total=validLaps.reduce((a,l)=>{a.duration+=l.duration;a.distance+=l.distance;a.ascent+=l.ascent;if(Number.isFinite(l.heartRate))a.hr.push(l.heartRate);if(Number.isFinite(l.cadence))a.cad.push(l.cadence);return a},{duration:0,distance:0,ascent:0,hr:[],cad:[]});
    return [{type:'easy',label:'Непрерывный бег',duration:Math.round(total.duration),distance:Math.round(total.distance),pace:total.distance>1?secondsToPace(total.duration/(total.distance/1000)):'—',heartRate:total.hr.length?Math.round(total.hr.reduce((a,b)=>a+b,0)/total.hr.length):null,cadence:total.cad.length?Math.round(total.cad.reduce((a,b)=>a+b,0)/total.cad.length):null,ascent:total.ascent,repetitions:1}];
  }
  if(records.length<2) return [];
  return [{type:'easy',label:'Тренировка',duration:0,distance:0,pace:'—',heartRate:null,cadence:null,ascent:0,repetitions:1}];
}

function calculateSummary({ sessions, laps, records, workoutSteps = [] }) {
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
    .map(altitudeMeters)
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
    const lapSplitDurations = buildLapBasedSplitDurations(laps);
    const lapSplitAscents = buildLapBasedSplitAscents(laps);
    const lapSplitElevations = buildLapBasedSplitElevations(laps);
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
                if (split && lapSplitAscents?.has(currentKm)) split.ascent = Math.round(lapSplitAscents.get(currentKm));
                if (split && lapSplitElevations?.has(currentKm)) { const elevation = lapSplitElevations.get(currentKm); split.ascent = elevation.ascent; split.descent = elevation.descent; split.elevation = elevation.elevation; }
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
                if (split && lapSplitAscents?.has(currentKm)) split.ascent = Math.round(lapSplitAscents.get(currentKm));
                if (split && lapSplitElevations?.has(currentKm)) { const elevation = lapSplitElevations.get(currentKm); split.ascent = elevation.ascent; split.descent = elevation.descent; split.elevation = elevation.elevation; }

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
    calories: session[11] != null && Number.isFinite(Number(session[11]))
      ? Math.round(Number(session[11]))
      : null,
    structure: analyzeWorkoutStructure({ laps, records, workoutSteps }),

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
