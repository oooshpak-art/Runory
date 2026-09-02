const FIT_EPOCH_MS = Date.UTC(1989, 11, 31, 0, 0, 0);

const BASE_TYPES = {
  0: { size: 1, get: 'getUint8', invalid: 0xff },
  1: { size: 1, get: 'getInt8', invalid: 0x7f },
  2: { size: 1, get: 'getUint8', invalid: 0xff },
  3: { size: 2, get: 'getInt16', invalid: 0x7fff },
  4: { size: 2, get: 'getUint16', invalid: 0xffff },
  5: { size: 4, get: 'getInt32', invalid: 0x7fffffff },
  6: { size: 4, get: 'getUint32', invalid: 0xffffffff },
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
    .map((index) => view.getUint8(index))
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
    const messageHeader = view.getUint8(offset++);

    const compressed =
      (messageHeader & 0x80) !== 0;

    const definitionHeader =
      !compressed &&
      (messageHeader & 0x40) !== 0;

    const developerData =
      !compressed &&
      (messageHeader & 0x20) !== 0;

    const localMessage = compressed
      ? (messageHeader >> 5) & 0x03
      : messageHeader & 0x0f;

    /*
     * DEFINITION MESSAGE
     */
    if (definitionHeader) {
      if (offset + 5 > dataEnd) {
        throw new Error('Пошкоджена структура FIT-файлу');
      }

      offset += 1; // reserved byte

      const littleEndian =
        view.getUint8(offset++) === 0;

      const globalMessage =
        view.getUint16(offset, littleEndian);

      offset += 2;

      const fieldCount =
        view.getUint8(offset++);

      const fields = [];

      for (let i = 0; i < fieldCount; i++) {
        if (offset + 3 > dataEnd) {
          throw new Error('Пошкоджені поля FIT-файлу');
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
          throw new Error('Пошкоджені developer-поля FIT-файлу');
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
        messageHeader & 0x1f;

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
      lastTimestamp =
        message[253];
    }

    /*
     * FIT global messages:
     *
     * 18 = Session
     * 19 = Lap
     * 20 = Record
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
    Math.floor((total % 3600) / 60);

  const rest =
    String(total % 60).padStart(2, '0');

  if (hours) {
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

function validNumber(value) {
  if (
    value === null ||
    value === undefined
  ) {
    return null;
  }

  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : null;
}

/*
 * Создаём один километровый сплит
 * из Garmin Lap message.
 */
function normalizeLap(lap, km) {
  /*
   * Garmin FIT Lap:
   *
   * field 7  = total_elapsed_time
   * field 8  = total_timer_time
   * field 9  = total_distance
   * field 15 = avg_heart_rate
   * field 18 = avg_cadence
   * field 21 = total_ascent
   */

  const distanceMeters =
    lap[9] != null
      ? Number(lap[9]) / 100
      : null;

  if (
    distanceMeters === null ||
    distanceMeters < 100
  ) {
    return null;
  }

  const durationMilliseconds =
    lap[8] ??
    lap[7];

  const durationSeconds =
    durationMilliseconds != null
      ? Number(durationMilliseconds) / 1000
      : null;

  if (
    durationSeconds === null ||
    !Number.isFinite(durationSeconds)
  ) {
    return null;
  }

  const paceSeconds =
    durationSeconds /
    (distanceMeters / 1000);

  const heartRate =
    lap[15] != null
      ? Math.round(Number(lap[15]))
      : null;

  const cadence =
    lap[18] != null
      ? Math.round(Number(lap[18]) * 2)
      : null;

  const ascent =
    lap[21] != null
      ? Math.round(Number(lap[21]))
      : null;

  return {
    km,
    pace: secondsToPace(paceSeconds),
    heartRate,
    cadence,
    ascent
  };
}

/*
 * Garmin уже записал автоматические
 * километровые Lap.
 *
 * Берём только laps около 1000 м.
 * Финальный кусок ~3 м отбрасываем.
 */
function buildSplits(laps) {
  if (!Array.isArray(laps)) {
    return [];
  }

  const splits = [];

  for (const lap of laps) {
    const distanceMeters =
      lap[9] != null
        ? Number(lap[9]) / 100
        : null;

    if (
      distanceMeters === null ||
      !Number.isFinite(distanceMeters)
    ) {
      continue;
    }

    /*
     * Нормальный километр:
     * допускаем 980–1020 м,
     * чтобы работать и с небольшими
     * погрешностями GPS.
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

  const lastRecord =
    records.at(-1) || {};

  /*
   * Session field 9 =
   * total_distance в сантиметрах.
   */
  const distanceMeters =
    session[9] != null
      ? Number(session[9]) / 100
      : (
          lastRecord[5] != null
            ? Number(lastRecord[5]) / 100
            : 0
        );

  /*
   * Session field 8 =
   * total_timer_time в миллисекундах.
   */
  const duration =
    Number(
      session[8] ??
      session[7] ??
      0
    ) / 1000;

  if (
    !distanceMeters ||
    !duration
  ) {
    throw new Error(
      'У цьому FIT-файлі не знайдено даних про бігове тренування'
    );
  }

  /*
   * Средний темп.
   *
   * Не используем session average speed,
   * потому что для некоторых Garmin-файлов
   * это поле может отсутствовать.
   */
  const paceSeconds =
    duration /
    (distanceMeters / 1000);

  /*
   * Session:
   * 16 = average heart rate
   * 18 = average cadence
   * 21 = total ascent
   */
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

  /*
   * Главная часть исправления:
   * читаем реальные Garmin Laps.
   */
  const splits =
    buildSplits(laps);

  /*
   * Дата тренировки.
   */
  const timestamp =
    session[2] ??
    records[0]?.[253];

  const date =
    timestamp != null
      ? new Date(
          FIT_EPOCH_MS +
          Number(timestamp) * 1000
        )
      : null;

  return {
    distance:
      (distanceMeters / 1000).toFixed(2),

    duration:
      secondsToTime(duration),

    pace:
      secondsToPace(paceSeconds),

    heartRate,

    cadence,

    ascent,

    splits,

    date
  };
}

/*
 * Главная функция,
 * которую использует main.js.
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

  return calculateSummary(decoded);
}

window.parseFitFile =
  parseFitFile;
