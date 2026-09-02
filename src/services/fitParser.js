const FIT_EPOCH_MS = Date.UTC(1989, 11, 31, 0, 0, 0);

const BASE_TYPES = {
  0: { size: 1, get: 'getUint8', invalid: 0xff },
  1: { size: 1, get: 'getInt8', invalid: 0x7f },
  2: { size: 1, get: 'getUint8', invalid: 0xff },
  3: { size: 2, get: 'getInt16', invalid: 0x7fff },
  4: { size: 2, get: 'getUint16', invalid: 0xffff },
  5: { size: 4, get: 'getInt32', invalid: 0x7fffffff },
  6: { size: 4, get: 'getUint32', invalid: 0xffffffff },
  7: { size: 4, get: 'getFloat32', invalid: null },
  8: { size: 4, get: 'getFloat32', invalid: null },
  9: { size: 8, get: 'getFloat64', invalid: null },
  10: { size: 1, get: 'getUint8', invalid: 0 },
  11: { size: 2, get: 'getUint16', invalid: 0 },
  12: { size: 4, get: 'getUint32', invalid: 0 },
  13: { size: 1, get: 'getUint8', invalid: null },
  14: { size: 8, get: 'getBigInt64', invalid: null },
  15: { size: 8, get: 'getBigUint64', invalid: null },
  16: { size: 8, get: 'getBigUint64', invalid: null },
};

function readField(view, offset, field, littleEndian) {
  const type = BASE_TYPES[field.baseType & 0x1f];

  if (!type || field.size < type.size) {
    return null;
  }

  if (offset + type.size > view.byteLength) {
    return null;
  }

  const value = view[type.get](offset, littleEndian);

  if (type.invalid !== null && value === type.invalid) {
    return null;
  }

  return typeof value === 'bigint' ? Number(value) : value;
}

function decodeFit(buffer) {
  const view = new DataView(buffer);

  if (buffer.byteLength < 12) {
    throw new Error('FIT-файл занадто малий');
  }

  const headerSize = view.getUint8(0);

  const magic = [8, 9, 10, 11]
    .map((i) => view.getUint8(i))
    .join('');

  if (
    headerSize < 12 ||
    headerSize > buffer.byteLength ||
    magic !== '46707384'
  ) {
    throw new Error('Це не схоже на коректний FIT-файл Garmin');
  }

  const dataSize = view.getUint32(4, true);
  const dataEnd = Math.min(
    headerSize + dataSize,
    buffer.byteLength
  );

  let offset = headerSize;
  let lastTimestamp = null;

  const definitions = new Map();
  const sessions = [];
  const records = [];

  while (offset < dataEnd) {
    if (offset >= dataEnd) {
      break;
    }

    const recordHeader = view.getUint8(offset++);

    const compressed =
      (recordHeader & 0x80) !== 0;

    const definitionHeader =
      !compressed &&
      (recordHeader & 0x40) !== 0;

    const localMessage =
      compressed
        ? (recordHeader >> 5) & 0x03
        : recordHeader & 0x0f;

    /*
     * Definition message
     */
    if (definitionHeader) {
      if (offset + 5 > dataEnd) {
        throw new Error('Пошкоджена структура FIT-файлу');
      }

      // Reserved byte
      offset += 1;

      const architecture = view.getUint8(offset++);
      const littleEndian = architecture === 0;

      const globalMessage =
        view.getUint16(offset, littleEndian);

      offset += 2;

      const fieldCount =
        view.getUint8(offset++);

      const fields = [];

      for (let i = 0; i < fieldCount; i++) {
        if (offset + 3 > dataEnd) {
          throw new Error('Пошкоджена структура полів FIT-файлу');
        }

        const number = view.getUint8(offset++);
        const size = view.getUint8(offset++);
        const baseType = view.getUint8(offset++);

        fields.push({
          number,
          size,
          baseType,
        });
      }

      /*
       * Developer fields
       */
      if ((recordHeader & 0x20) !== 0) {
        if (offset >= dataEnd) {
          throw new Error('Пошкоджені developer fields FIT-файлу');
        }

        const developerFieldCount =
          view.getUint8(offset++);

        const developerBytes =
          developerFieldCount * 3;

        if (offset + developerBytes > dataEnd) {
          throw new Error('Пошкоджені developer fields FIT-файлу');
        }

        offset += developerBytes;
      }

      definitions.set(localMessage, {
        globalMessage,
        fields,
        littleEndian,
      });

      continue;
    }

    /*
     * Data message
     */
    const definition =
      definitions.get(localMessage);

    if (!definition) {
      throw new Error(
        'Не вдалося прочитати структуру FIT-файлу'
      );
    }

    let message = {};

    /*
     * Compressed timestamp
     */
    if (compressed && lastTimestamp !== null) {
      const timeOffset =
        recordHeader & 0x1f;

      message[253] =
        (lastTimestamp & ~0x1f) +
        timeOffset +
        (
          timeOffset <
          (lastTimestamp & 0x1f)
            ? 0x20
            : 0
        );
    }

    let messageSize = 0;

    for (const field of definition.fields) {
      message[field.number] =
        readField(
          view,
          offset,
          field,
          definition.littleEndian
        );

      offset += field.size;
      messageSize += field.size;
    }

    if (messageSize < 0 || offset > dataEnd) {
      throw new Error(
        'Пошкоджені дані FIT-файлу'
      );
    }

    if (message[253] != null) {
      lastTimestamp = message[253];
    }

    /*
     * Session = global message 18
     */
    if (definition.globalMessage === 18) {
      sessions.push(message);
    }

    /*
     * Record = global message 20
     */
    if (definition.globalMessage === 20) {
      records.push(message);
    }
  }

  return {
    sessions,
    records,
  };
}

function secondsToTime(seconds) {
  const total = Math.max(
    0,
    Math.round(seconds || 0)
  );

  const hours =
    Math.floor(total / 3600);

  const minutes =
    Math.floor((total % 3600) / 60);

  const secs =
    String(total % 60).padStart(2, '0');

  if (hours) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${secs}`;
  }

  return `${minutes}:${secs}`;
}

function secondsToPace(seconds) {
  if (
    !Number.isFinite(seconds) ||
    seconds <= 0
  ) {
    return '—';
  }

  const rounded =
    Math.round(seconds);

  const minutes =
    Math.floor(rounded / 60);

  const secs =
    String(rounded % 60).padStart(2, '0');

  return `${minutes}:${secs}`;
}

function getRecordTimestamp(record) {
  return Number.isFinite(record?.[253])
    ? record[253]
    : null;
}

function getRecordDistanceMeters(record) {
  if (!Number.isFinite(record?.[5])) {
    return null;
  }

  // FIT distance: centimeters
  return record[5] / 100;
}

function getRecordAltitude(record) {
  if (!Number.isFinite(record?.[2])) {
    return null;
  }

  // FIT enhanced_altitude / altitude:
  // raw / 5 - 500
  return record[2] / 5 - 500;
}

function getRecordHeartRate(record) {
  if (!Number.isFinite(record?.[3])) {
    return null;
  }

  const value = record[3];

  if (value <= 0 || value >= 255) {
    return null;
  }

  return value;
}

function getRecordCadence(record) {
  if (!Number.isFinite(record?.[4])) {
    return null;
  }

  /*
   * Garmin running cadence in FIT is stored as
   * half-steps per minute, therefore ×2.
   *
   * Field 53 can contain fractional cadence.
   */
  const fractional =
    Number.isFinite(record?.[53])
      ? record[53] / 128
      : 0;

  const cadence =
    (record[4] + fractional) * 2;

  if (
    !Number.isFinite(cadence) ||
    cadence <= 0 ||
    cadence >= 255
  ) {
    return null;
  }

  return cadence;
}

function interpolate(a, b, fraction) {
  return a + (b - a) * fraction;
}

function buildSplits(records) {
  if (!Array.isArray(records) || !records.length) {
    return [];
  }

  const points = records
    .map((record) => ({
      timestamp: getRecordTimestamp(record),
      distance: getRecordDistanceMeters(record),
      heartRate: getRecordHeartRate(record),
      cadence: getRecordCadence(record),
      altitude: getRecordAltitude(record),
    }))
    .filter(
      (point) =>
        Number.isFinite(point.timestamp) &&
        Number.isFinite(point.distance)
    )
    .sort(
      (a, b) =>
        a.timestamp - b.timestamp
    );

  if (points.length < 2) {
    return [];
  }

  const splits = [];

  let splitNumber = 1;

  let splitDistance = 0;
  let splitTime = 0;

  let heartRateTime = 0;
  let heartRateWeighted = 0;

  let cadenceTime = 0;
  let cadenceWeighted = 0;

  let ascent = 0;

  let previous = points[0];

  for (let i = 1; i < points.length; i++) {
    const current = points[i];

    const segmentDistance =
      current.distance - previous.distance;

    const segmentTime =
      current.timestamp - previous.timestamp;

    if (
      !Number.isFinite(segmentDistance) ||
      segmentDistance <= 0 ||
      !Number.isFinite(segmentTime) ||
      segmentTime < 0
    ) {
      previous = current;
      continue;
    }

    /*
     * Position within this GPS segment.
     *
     * Instead of a while-loop based on remainingDistance,
     * calculate exactly how much of the segment belongs
     * to the current kilometre.
     *
     * This prevents the old infinite-loop bug when a
     * segment crosses a kilometre boundary.
     */
    let segmentConsumed = 0;

    while (
      segmentConsumed <
      segmentDistance - 0.000001
    ) {
      const absoluteStart =
        previous.distance +
        segmentConsumed;

      const targetDistance =
        splitNumber * 1000;

      let distanceToBoundary =
        targetDistance -
        absoluteStart;

      /*
       * Numerical protection.
       */
      if (distanceToBoundary <= 0.000001) {
        finishSplit();
        continue;
      }

      const partDistance =
        Math.min(
          segmentDistance - segmentConsumed,
          distanceToBoundary
        );

      if (
        !Number.isFinite(partDistance) ||
        partDistance <= 0
      ) {
        break;
      }

      const startFraction =
        segmentConsumed /
        segmentDistance;

      const endFraction =
        (
          segmentConsumed +
          partDistance
        ) / segmentDistance;

      const middleFraction =
        (
          startFraction +
          endFraction
        ) / 2;

      const partTime =
        segmentTime *
        (partDistance / segmentDistance);

      splitDistance += partDistance;
      splitTime += partTime;

      /*
       * Heart rate
       */
      if (
        Number.isFinite(previous.heartRate) &&
        Number.isFinite(current.heartRate)
      ) {
        const averageHeartRate =
          interpolate(
            previous.heartRate,
            current.heartRate,
            middleFraction
          );

        heartRateWeighted +=
          averageHeartRate *
          partTime;

        heartRateTime += partTime;
      }

      /*
       * Cadence
       */
      if (
        Number.isFinite(previous.cadence) &&
        Number.isFinite(current.cadence)
      ) {
        const averageCadence =
          interpolate(
            previous.cadence,
            current.cadence,
            middleFraction
          );

        cadenceWeighted +=
          averageCadence *
          partTime;

        cadenceTime += partTime;
      }

      /*
       * Elevation gain
       */
      if (
        Number.isFinite(previous.altitude) &&
        Number.isFinite(current.altitude)
      ) {
        const altitudeChange =
          current.altitude -
          previous.altitude;

        if (altitudeChange > 0) {
          ascent +=
            altitudeChange *
            (partDistance / segmentDistance);
        }
      }

      segmentConsumed += partDistance;

      /*
       * Kilometer completed.
       */
      if (
        Math.abs(
          splitDistance - 1000
        ) < 0.01 ||
        splitDistance > 999.99
      ) {
        finishSplit();
      }
    }

    previous = current;
  }

  /*
   * Last incomplete kilometre.
   */
  if (
    splitDistance > 50 &&
    splitTime > 0
  ) {
    const distanceKm =
      splitDistance / 1000;

    const paceSeconds =
      splitTime / distanceKm;

    splits.push({
      km: `${splitNumber}*`,
      pace: secondsToPace(paceSeconds),

      heartRate:
        heartRateTime > 0
          ? Math.round(
              heartRateWeighted /
              heartRateTime
            )
          : null,

      cadence:
        cadenceTime > 0
          ? Math.round(
              cadenceWeighted /
              cadenceTime
            )
          : null,

      ascent: Math.round(ascent),
    });
  }

  return splits;

  /*
   * Complete current kilometre.
   */
  function finishSplit() {
    if (splitTime <= 0) {
      splitDistance = 0;
      splitTime = 0;

      heartRateTime = 0;
      heartRateWeighted = 0;

      cadenceTime = 0;
      cadenceWeighted = 0;

      ascent = 0;

      splitNumber++;

      return;
    }

    splits.push({
      km: splitNumber,

      pace: secondsToPace(
        splitTime
      ),

      heartRate:
        heartRateTime > 0
          ? Math.round(
              heartRateWeighted /
              heartRateTime
            )
          : null,

      cadence:
        cadenceTime > 0
          ? Math.round(
              cadenceWeighted /
              cadenceTime
            )
          : null,

      ascent: Math.round(ascent),
    });

    splitNumber++;

    splitDistance = 0;
    splitTime = 0;

    heartRateTime = 0;
    heartRateWeighted = 0;

    cadenceTime = 0;
    cadenceWeighted = 0;

    ascent = 0;
  }
}

function calculateSummary({ sessions, records }) {
  const session =
    sessions?.at(-1) || {};

  const lastRecord =
    records?.at(-1) || {};

  /*
   * Session fields:
   *
   * 7 = total_elapsed_time
   * 8 = total_timer_time
   * 9 = total_distance
   * 14 = avg_speed
   * 16 = avg_heart_rate
   * 18 = avg_running_cadence
   * 22 = total_ascent
   */

  const distanceMeters =
    Number.isFinite(session[9])
      ? session[9] / 100
      : (
          Number.isFinite(lastRecord[5])
            ? lastRecord[5] / 100
            : 0
        );

  const durationMilliseconds =
    Number.isFinite(session[8])
      ? session[8]
      : (
          Number.isFinite(session[7])
            ? session[7]
            : 0
        );

  const duration =
    durationMilliseconds / 1000;

  let speedMetersPerSecond = 0;

  if (Number.isFinite(session[14])) {
    speedMetersPerSecond =
      session[14] / 1000;
  }

  if (
    !speedMetersPerSecond &&
    duration > 0 &&
    distanceMeters > 0
  ) {
    speedMetersPerSecond =
      distanceMeters /
      duration;
  }

  if (
    !distanceMeters ||
    !duration
  ) {
    throw new Error(
      'У цьому FIT-файлі не знайдено даних про бігове тренування'
    );
  }

  /*
   * Average heart rate
   */
  const heartRate =
    Number.isFinite(session[16])
      ? Math.round(session[16])
      : calculateAverageHeartRate(records);

  /*
   * Average cadence
   */
  const cadence =
    Number.isFinite(session[18])
      ? Math.round(session[18] * 2)
      : calculateAverageCadence(records);

  /*
   * Total ascent
   */
  const ascent =
    Number.isFinite(session[22])
      ? Math.round(session[22])
      : calculateTotalAscent(records);

  /*
   * Date
   */
  const timestamp =
    Number.isFinite(session[2])
      ? session[2]
      : (
          Number.isFinite(records?.[0]?.[253])
            ? records[0][253]
            : null
        );

  return {
    distance:
      (distanceMeters / 1000)
        .toFixed(2),

    duration:
      secondsToTime(duration),

    pace:
      secondsToPace(
        speedMetersPerSecond > 0
          ? 1000 / speedMetersPerSecond
          : 0
      ),

    heartRate,

    cadence,

    ascent,

    date:
      timestamp != null
        ? new Date(
            FIT_EPOCH_MS +
            timestamp * 1000
          )
        : null,

    splits:
      buildSplits(records),
  };
}

function calculateAverageHeartRate(records) {
  if (!records?.length) {
    return null;
  }

  const values = records
    .map(getRecordHeartRate)
    .filter(Number.isFinite);

  if (!values.length) {
    return null;
  }

  return Math.round(
    values.reduce(
      (sum, value) =>
        sum + value,
      0
    ) / values.length
  );
}

function calculateAverageCadence(records) {
  if (!records?.length) {
    return null;
  }

  const values = records
    .map(getRecordCadence)
    .filter(Number.isFinite);

  if (!values.length) {
    return null;
  }

  return Math.round(
    values.reduce(
      (sum, value) =>
        sum + value,
      0
    ) / values.length
  );
}

function calculateTotalAscent(records) {
  if (!records?.length) {
    return null;
  }

  const altitudes = records
    .map(getRecordAltitude)
    .filter(Number.isFinite);

  if (altitudes.length < 2) {
    return null;
  }

  let ascent = 0;

  for (let i = 1; i < altitudes.length; i++) {
    const difference =
      altitudes[i] -
      altitudes[i - 1];

    /*
     * Ignore tiny GPS/barometric noise.
     */
    if (difference > 2) {
      ascent += difference;
    }
  }

  return Math.round(ascent);
}

/**
 * Повертає ключові показники
 * бігового тренування з локального FIT-файлу.
 */
async function parseFitFile(file) {
  if (
    !file ||
    !file.name ||
    !file.name
      .toLowerCase()
      .endsWith('.fit')
  ) {
    throw new Error(
      'Потрібен файл Garmin у форматі .fit'
    );
  }

  const buffer =
    await file.arrayBuffer();

  const decoded =
    decodeFit(buffer);

  return calculateSummary(
    decoded
  );
}

window.parseFitFile =
  parseFitFile;
