const FIT_EPOCH_MS = Date.UTC(1989, 11, 31, 0, 0, 0);

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

function readField(view, offset, field, littleEndian) {
  const type = BASE_TYPES[field.baseType & 0x1f];
  if (!type || field.size < type.size || offset + field.size > view.byteLength) return null;
  const value = view[type.get](offset, littleEndian);
  if (type.invalid !== null && value === type.invalid) return null;
  return typeof value === "bigint" ? Number(value) : value;
}

function decodeFit(buffer) {
  const view = new DataView(buffer);
  if (buffer.byteLength < 12) throw new Error("FIT-файл занадто малий");

  const headerSize = view.getUint8(0);
  const magic = [8, 9, 10, 11].map(i => view.getUint8(i)).join("");
  if (headerSize < 12 || headerSize > buffer.byteLength || magic !== "46707384") {
    throw new Error("Це не схоже на коректний FIT-файл Garmin");
  }

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
    const isDefinition = !compressed && (header & 0x40) !== 0;
    const hasDeveloperData = !compressed && (header & 0x20) !== 0;
    const localMessage = compressed ? ((header >> 5) & 0x03) : (header & 0x0f);

    if (isDefinition) {
      if (offset + 5 > dataEnd) throw new Error("Пошкоджена структура FIT-файлу");

      offset += 1; // reserved
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
        const developerCount = view.getUint8(offset++);
        for (let i = 0; i < developerCount; i++) {
          developerFields.push({
            number: view.getUint8(offset++),
            size: view.getUint8(offset++),
            developerDataIndex: view.getUint8(offset++)
          });
        }
      }

      definitions.set(localMessage, {
        globalMessage,
        fields,
        developerFields,
        littleEndian
      });
      continue;
    }

    const definition = definitions.get(localMessage);
    if (!definition) throw new Error("Не вдалося прочитати структуру FIT-файлу");

    const message = {};

    if (compressed && lastTimestamp !== null) {
      const timeOffset = header & 0x1f;
      message[253] =
        (lastTimestamp & ~0x1f) +
        timeOffset +
        (timeOffset < (lastTimestamp & 0x1f) ? 0x20 : 0);
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

    if (message[253] != null) lastTimestamp = message[253];

    if (definition.globalMessage === 18) sessions.push(message);
    if (definition.globalMessage === 19) laps.push(message);
    if (definition.globalMessage === 20) records.push(message);
  }

  return { sessions, laps, records };
}

function secondsToTime(seconds) {
  const total = Math.max(0, Math.round(seconds || 0));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = String(total % 60).padStart(2, "0");
  return h
    ? `${h}:${String(m).padStart(2, "0")}:${s}`
    : `${m}:${s}`;
}

function secondsToPace(seconds) {
  if (!Number.isFinite(seconds) || seconds <= 0) return "—";
  const total = Math.round(seconds);
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
}

function recordAltitude(record) {
  if (!Number.isFinite(record[2])) return null;
  // FIT enhanced_altitude: scale 5, offset 500.
  return record[2] / 5 - 500;
}

function calculateAscentFromRecords(records) {
  const altitudes = records.map(recordAltitude).filter(Number.isFinite);
  if (altitudes.length < 2) return null;

  let ascent = 0;
  for (let i = 1; i < altitudes.length; i++) {
    const diff = altitudes[i] - altitudes[i - 1];
    if (diff > 2) ascent += diff;
  }
  return Math.round(ascent);
}

function createRecordSplit(km, points) {
  if (!points.length) return null;

  const first = points[0];
  const last = points[points.length - 1];
  const firstTime = first[253];
  const lastTime = last[253];

  if (firstTime == null || lastTime == null) return null;

  const duration = Math.max(1, lastTime - firstTime);
  const heartRates = points.map(r => r[3]).filter(v => Number.isFinite(v) && v > 0 && v < 255);

  const cadenceValues = points
    .map(r => {
      if (!Number.isFinite(r[4])) return null;
      const fractional = Number.isFinite(r[53]) ? r[53] / 128 : 0;
      return (r[4] + fractional) * 2;
    })
    .filter(v => Number.isFinite(v) && v > 0 && v < 255);

  return {
    km,
    pace: secondsToPace(duration),
    heartRate: heartRates.length
      ? Math.round(heartRates.reduce((a, b) => a + b, 0) / heartRates.length)
      : null,
    cadence: cadenceValues.length
      ? Math.round(cadenceValues.reduce((a, b) => a + b, 0) / cadenceValues.length)
      : null,
    ascent: calculateAscentFromRecords(points)
  };
}

function buildRecordSplits(records) {
  const splits = [];
  let currentKm = 1;
  let points = [];

  for (const record of records) {
    if (!Number.isFinite(record[5])) continue;

    const distanceMeters = record[5] / 100;
    const km = Math.floor(distanceMeters / 1000) + 1;

    if (km !== currentKm) {
      const split = createRecordSplit(currentKm, points);
      if (split) splits.push(split);
      points = [];
      currentKm = km;
    }

    points.push(record);
  }

  const lastSplit = createRecordSplit(currentKm, points);
  if (lastSplit) splits.push(lastSplit);

  return splits;
}

function normalizeLap(lap, number) {
  // FIT Lap: total_timer_time=8, total_distance=9,
  // avg_heart_rate=15, avg_cadence=16, total_ascent=21.
  const distanceMeters = Number(lap[9]) / 100;
  const durationSeconds = Number(lap[8]) / 1000;

  if (!Number.isFinite(distanceMeters) || !Number.isFinite(durationSeconds)) return null;
  if (distanceMeters <= 0 || durationSeconds <= 0) return null;

  return {
    km: number,
    pace: secondsToPace(durationSeconds / (distanceMeters / 1000)),
    heartRate: Number.isFinite(lap[15]) ? Math.round(lap[15]) : null,
    cadence: Number.isFinite(lap[16]) ? Math.round(lap[16] * 2) : null,
    ascent: Number.isFinite(lap[21]) ? Math.round(lap[21]) : null
  };
}

function buildLapSplits(laps) {
  const splits = [];

  for (const lap of laps) {
    const distanceMeters = Number(lap[9]) / 100;
    if (!Number.isFinite(distanceMeters)) continue;

    // Keep full automatic 1 km laps; ignore the final partial lap.
    if (distanceMeters < 980 || distanceMeters > 1020) continue;

    const split = normalizeLap(lap, splits.length + 1);
    if (split) splits.push(split);
  }

  return splits;
}

function calculateSummary({ sessions, laps, records }) {
  const session = sessions.at(-1) || {};
  const lastRecord = records.at(-1) || {};

  const distanceMeters =
    Number.isFinite(session[9])
      ? session[9] / 100
      : (Number.isFinite(lastRecord[5]) ? lastRecord[5] / 100 : 0);

  const duration =
    Number(session[8] ?? session[7] ?? 0) / 1000;

  if (!distanceMeters || !duration) {
    throw new Error("У цьому FIT-файлі не знайдено даних про бігове тренування");
  }

  // Session total_ascent is the authoritative Garmin summary.
  // If absent, calculate ascent from the record altitude stream.
  const ascent =
    Number.isFinite(session[22])
      ? Math.round(session[22])
      : calculateAscentFromRecords(records);

  const speed =
    Number.isFinite(session[14]) && session[14] > 0
      ? session[14] / 1000
      : distanceMeters / duration;

  const heartRate =
    Number.isFinite(session[16]) ? Math.round(session[16]) : null;

  const cadence =
    Number.isFinite(session[18]) ? Math.round(session[18] * 2) : null;

  const timestamp = session[2] ?? records[0]?.[253];

  // Prefer Garmin's own automatic kilometer laps.
  // Fall back to record-based splits when laps are absent.
  const lapSplits = buildLapSplits(laps);
  const splits = lapSplits.length ? lapSplits : buildRecordSplits(records);

  return {
    distance: (distanceMeters / 1000).toFixed(2),
    duration: secondsToTime(duration),
    pace: secondsToPace(1000 / speed),
    heartRate,
    cadence,
    ascent: ascent ?? 0,
    splits,
    date: timestamp != null
      ? new Date(FIT_EPOCH_MS + Number(timestamp) * 1000)
      : null
  };
}

async function parseFitFile(file) {
  if (!file?.name?.toLowerCase().endsWith(".fit")) {
    throw new Error("Потрібен файл Garmin у форматі .fit");
  }

  return calculateSummary(
    decodeFit(await file.arrayBuffer())
  );
}

window.parseFitFile = parseFitFile;
