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
  16: { size: 8, get: 'getBigUint64', invalid: null }
};

function readField(view, offset, field, littleEndian) {
  const type = BASE_TYPES[field.baseType & 0x1f];

  if (!type) {
    return null;
  }

  if (offset + field.size > view.byteLength) {
    return null;
  }

  if (field.size < type.size) {
    return null;
  }

  const value = view[type.get](offset, littleEndian);

  if (type.invalid !== null && value === type.invalid) {
    return null;
  }

  return typeof value === 'bigint'
    ? Number(value)
    : value;
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
  const laps = [];
  const records = [];

  while (offset < dataEnd) {
    if (offset >= dataEnd) {
      break;
    }

    const header = view.getUint8(offset++);

    const compressed =
      (header & 0x80) !== 0;

    const definitionHeader =
      !compressed &&
      (header & 0x40) !== 0;

    const developerData =
      !compressed &&
      (header & 0x20) !== 0;

    const localMessage =
      compressed
        ? (header >> 5) & 0x03
        : header & 0x0f;

    /*
     * DEFINITION MESSAGE
     */
    if (definitionHeader) {
      if (offset + 5 > dataEnd) {
        throw new Error(
          'Пошкоджена структура FIT-файлу'
        );
      }

      offset += 1;

      const littleEndian =
        view.getUint8(offset++) === 0;

      const globalMessage =
        view.getUint16(
          offset,
          littleEndian
        );

      offset += 2;

      const fieldCount =
        view.getUint8(offset++);

      const fields = [];

      for (let i = 0; i < fieldCount; i++) {
        if (offset + 3 > dataEnd) {
          throw new Error(
            'Пошкоджені поля FIT-файлу'
          );
        }

        fields.push({
          number: view.getUint8(offset++),
          size: view.getUint8(offset++),
          baseType: view.getUint8(offset++)
        });
      }

      const developerFields = [];

      if (developerData) {
        if (offset >= dataEnd) {
          throw new Error(
            'Пошкоджені developer-поля FIT-файлу'
          );
        }

        const developerFieldCount =
          view.getUint8(offset++);

        for (
          let i = 0;
          i < developerFieldCount;
          i++
        ) {
          if (offset + 3 > dataEnd) {
            throw new Error(
              'Пошкоджені developer-поля FIT-файлу'
            );
          }

          developerFields.push({
            number: view.getUint8(offset++),
            size: view.getUint8(offset++),
            developerDataIndex:
              view.getUint8(offset++)
          });
        }
      }

      definitions.set(
        localMessage,
        {
          globalMessage,
          fields,
          developerFields,
          littleEndian
        }
      );

      continue;
    }

    /*
     * DATA MESSAGE
     */
    const definition =
      definitions.get(localMessage);

    if (!definition) {
      throw new Error(
        'Не вдалося прочитати структуру FIT-файлу'
      );
    }

    const message = {};

    /*
     * Compressed timestamp
     */
    if (
      compressed &&
      lastTimestamp !== null
    ) {
      const timeOffset =
        header & 0x1f;

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

    /*
     * Regular fields
     */
    for (const field of definition.fields) {
      message[field.number] =
        readField(
          view,
          offset,
          field,
          definition.littleEndian
        );

      offset += field.size;
    }

    /*
     * Developer fields
     */
    for (const field of definition.developerFields) {
      offset += field.size;
    }

    if (message[253] != null) {
      lastTimestamp = message[253];
    }

    /*
     * FIT global messages:
     *
     * 18 = session
     * 19 = lap
     * 20 = record
     */
    if (definition.globalMessage === 18) {
      sessions.push(message);
    }

    if (definition.globalMessage === 19) {
      laps.push(message);
    }

    if (definition.globalMessage === 20) {
      records.push(message);
    }
  }

  return {
    sessions,
    laps,
    records
  };
}

function secondsToTime(seconds) {
  const total =
    Math.max(0, Math.round(seconds || 0));

  const hours =
    Math.floor(total / 3600);

  const minutes =
    Math.floor(
      (total % 3600) / 60
    );

  const rest =
    String(total % 60).padStart(2, '0');

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${rest}`;
  }

  return `${minutes}:${rest}`;
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

  const rest =
    String(rounded % 60).padStart(2, '0');

  return `${minutes}:${rest}`;
}

function getLapDistanceMeters(lap) {
  /*
   * FIT Lap field 9:
   * total_distance
   *
   * Garmin stores distance
   * in 1/100 meter.
   */
  if (lap[9] == null) {
    return null;
  }

  const value =
    Number(lap[9]) / 100;

  return Number.isFinite(value)
    ? value
    : null;
}

function getLapDurationSeconds(lap) {
  /*
   * FIT Lap field 8:
   * total_timer_time
   *
   * FIT time is milliseconds.
   */
  const value =
    lap[8] ?? lap[7];

  if (value == null) {
    return null;
  }

  const seconds =
    Number(value) / 1000;

  return Number.isFinite(seconds)
    ? seconds
    : null;
}

function normalizeLap(lap, number) {
  const distanceMeters =
    getLapDistanceMeters(lap);

  const durationSeconds =
    getLapDurationSeconds(lap);

  if (
    distanceMeters == null ||
    durationSeconds == null ||
    distanceMeters <= 0 ||
    durationSeconds <= 0
  ) {
    return null;
  }

  const distanceKm =
    distanceMeters / 1000;

  const paceSeconds =
    durationSeconds / distanceKm;

  /*
   * FIT Lap:
   * field 15 = avg_heart_rate
   * field 17 = avg_cadence
   * field 21 = total_ascent
   */
  const heartRate =
    lap[15] != null
      ? Math.round(Number(lap[15]))
      : null;

  /*
   * Garmin running cadence in FIT
   * can be stored as half-steps.
   */
  const rawCadence =
    lap[17];

  const cadence =
    rawCadence != null
      ? Math.round(Number(rawCadence) * 2)
      : null;

  const ascent =
    lap[21] != null
      ? Math.round(Number(lap[21]))
      : null;

  return {
    number,
    distance: distanceKm,
    time: secondsToTime(durationSeconds),
    pace: secondsToPace(paceSeconds),
    heartRate,
    cadence,
    ascent
  };
}

function buildSplits(laps) {
  if (!Array.isArray(laps)) {
    return [];
  }

  const splits = [];

  for (const lap of laps) {
    const distanceMeters =
      getLapDistanceMeters(lap);

    if (distanceMeters == null) {
      continue;
    }

    /*
     * Автоматический Garmin Lap
     * должен быть примерно 1 км.
     *
     * Не берём финальный неполный
     * кусок тренировки.
     */
    if (
      distanceMeters < 980 ||
      distanceMeters > 1020
    ) {
      continue;
    }

    const split =
      normalizeLap(
        lap,
        splits.length + 1
      );

    if (split) {
      splits.push(split);
    }
  }

  return splits;
}

function calculateSummary({
  sessions,
  laps,
  records
}) {
  const session =
    sessions.at(-1) || {};

  const firstRecord =
    records[0] || {};

  /*
   * Session field 9:
   * total_distance
   */
  const distanceMeters =
    session[9] != null
      ? Number(session[9]) / 100
      : (
          firstRecord[5] != null
            ? Number(firstRecord[5]) / 100
            : 0
        );

  /*
   * Session field 8:
   * total_timer_time
   *
   * milliseconds -> seconds
   */
  const durationSeconds =
    Number(
      session[8] ??
      session[7] ??
      0
    ) / 1000;

  if (
    !distanceMeters ||
    !durationSeconds
  ) {
    throw new Error(
      'У цьому FIT-файлі не знайдено даних про бігове тренування'
    );
  }

  /*
   * Session field 14:
   * enhanced_avg_speed / avg_speed
   *
   * FIT speed is m/s × 1000.
   */
  let speedMetersPerSecond = null;

  if (session[14] != null) {
    speedMetersPerSecond =
      Number(session[14]) / 1000;
  }

  if (
    !speedMetersPerSecond ||
    !Number.isFinite(speedMetersPerSecond)
  ) {
    speedMetersPerSecond =
      distanceMeters /
      durationSeconds;
  }

  const paceSeconds =
    1000 /
    speedMetersPerSecond;

  const heartRate =
    session[16] != null
      ? Math.round(Number(session[16]))
      : null;

  const cadence =
    session[18] != null
      ? Math.round(Number(session[18]) * 2)
      : null;

  const ascent =
    session[21] != null
      ? Math.round(Number(session[21]))
      : null;

  const timestamp =
    session[2] ??
    firstRecord[253];

  const date =
    timestamp != null
      ? new Date(
          FIT_EPOCH_MS +
          Number(timestamp) * 1000
        )
      : null;

  const splits =
    buildSplits(laps);

  return {
    distance:
      (distanceMeters / 1000).toFixed(2),

    duration:
      secondsToTime(durationSeconds),

    pace:
      secondsToPace(paceSeconds),

    heartRate,

    cadence,

    ascent,

    date,

    splits
  };
}

async function parseFitFile(file) {
  if (
    !file?.name
      ?.toLowerCase()
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

  return calculateSummary(decoded);
}

window.parseFitFile =
  parseFitFile;
