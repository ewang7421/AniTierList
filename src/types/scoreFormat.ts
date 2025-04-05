export enum ScoreFormat {
  POINT_100 = "POINT_100",
  POINT_10_DECIMAL = "POINT_10_DECIMAL",
  POINT_10 = "POINT_10",
  POINT_5 = "POINT_5",
  POINT_3 = "POINT_3",
}

export const defaultScoreFormat = ScoreFormat.POINT_10;
function roundWithPrecision(value: number, precision: number): number {
  const multiplier = Math.pow(10, precision || 0);
  return Math.round(value * multiplier) / multiplier;
}

function ceilWithPrecision(value: number, precision: number): number {
  const multiplier = Math.pow(10, precision || 0);
  return Math.ceil(value * multiplier) / multiplier;
}
export function to_POINT_100(old: number, oldFormat: ScoreFormat) {
  if (old === 0) {
    return old;
  }

  switch (oldFormat) {
    case ScoreFormat.POINT_100:
      return old;
    case ScoreFormat.POINT_10_DECIMAL:
    case ScoreFormat.POINT_10:
      return Math.ceil(old * 10);
    case ScoreFormat.POINT_5:
      return Math.ceil(old * 20);
    case ScoreFormat.POINT_3:
      return Math.ceil(old * 33.33);
  }
}
export function to_POINT_10_DECIMAL(old: number, oldFormat: ScoreFormat) {
  if (old === 0) {
    return old;
  }

  switch (oldFormat) {
    case ScoreFormat.POINT_100:
      return roundWithPrecision(old / 10, 1);
    case ScoreFormat.POINT_10_DECIMAL:
    case ScoreFormat.POINT_10:
      return old;
    case ScoreFormat.POINT_5:
      return ceilWithPrecision(old * 2, 1);
    case ScoreFormat.POINT_3:
      return ceilWithPrecision(old * 3.33, 1);
  }
}

export function to_POINT_10(old: number, oldFormat: ScoreFormat) {
  if (old === 0) {
    return old;
  }

  switch (oldFormat) {
    case ScoreFormat.POINT_100:
      return Math.floor(old / 10);
    case ScoreFormat.POINT_10_DECIMAL:
      return Math.floor(old);
    case ScoreFormat.POINT_10:
      return old;
    case ScoreFormat.POINT_5:
      return Math.ceil(old * 2);
    case ScoreFormat.POINT_3:
      return Math.ceil(old * 3.33);
  }
}

export function to_POINT_5(old: number, oldFormat: ScoreFormat) {
  if (old === 0) {
    return old;
  }

  switch (oldFormat) {
    case ScoreFormat.POINT_100:
      return Math.floor(old / 20);
    case ScoreFormat.POINT_10_DECIMAL:
    case ScoreFormat.POINT_10:
      return Math.floor(old / 2);
    case ScoreFormat.POINT_5:
      return old;
    case ScoreFormat.POINT_3:
      return Math.ceil(old * 1.67);
  }
}

export function to_POINT_3(old: number, oldFormat: ScoreFormat) {
  if (old === 0) {
    return old;
  }

  switch (oldFormat) {
    case ScoreFormat.POINT_100:
      return Math.floor(old / 33.33);
    case ScoreFormat.POINT_10_DECIMAL:
    case ScoreFormat.POINT_10:
      return Math.floor(old / 3.33);
    case ScoreFormat.POINT_5:
      return Math.floor(old / 1.67);
    case ScoreFormat.POINT_3:
      return old;
  }
}
