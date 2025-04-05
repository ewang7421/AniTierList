import { ScoreFormat } from "@/types/scoreFormat";
import { TierModel } from "@/types/types";
const DEFAULT_TIERS_POINT_100 = [
  { entries: [], name: "SSS", minScore: 8.5, maxScore: 100 },
  { entries: [], name: "SS", minScore: 8.5, maxScore: 90 },
  { entries: [], name: "S", minScore: 8.5, maxScore: 80 },
  { entries: [], name: "A", minScore: 7, maxScore: 70 },
  { entries: [], name: "B", minScore: 5.5, maxScore: 60 },
  { entries: [], name: "C", minScore: 4, maxScore: 50 },
  { entries: [], name: "D", minScore: 2.5, maxScore: 40 },
  { entries: [], name: "E", minScore: 1, maxScore: 30 },
  { entries: [], name: "F", minScore: 1, maxScore: 20 },
  { entries: [], name: "TRASH", minScore: 1, maxScore: 10 },
];

const DEFAULT_TIERS_POINT_10_DECIMAL = [
  { entries: [], name: "SSS", minScore: 8.5, maxScore: 10.0 },
  { entries: [], name: "SS", minScore: 8.5, maxScore: 9.0 },
  { entries: [], name: "S", minScore: 8.5, maxScore: 8.0 },
  { entries: [], name: "A", minScore: 7, maxScore: 7.0 },
  { entries: [], name: "B", minScore: 5.5, maxScore: 6.0 },
  { entries: [], name: "C", minScore: 4, maxScore: 5.0 },
  { entries: [], name: "D", minScore: 2.5, maxScore: 4.0 },
  { entries: [], name: "E", minScore: 1, maxScore: 3.0 },
  { entries: [], name: "F", minScore: 1, maxScore: 2.0 },
  { entries: [], name: "TRASH", minScore: 1, maxScore: 1.0 },
];

const DEFAULT_TIERS_POINT_10 = [
  { entries: [], name: "SSS", minScore: 8.5, maxScore: 10 },
  { entries: [], name: "SS", minScore: 8.5, maxScore: 9 },
  { entries: [], name: "S", minScore: 8.5, maxScore: 8 },
  { entries: [], name: "A", minScore: 7, maxScore: 7 },
  { entries: [], name: "B", minScore: 5.5, maxScore: 6 },
  { entries: [], name: "C", minScore: 4, maxScore: 5 },
  { entries: [], name: "D", minScore: 2.5, maxScore: 4 },
  { entries: [], name: "E", minScore: 1, maxScore: 3 },
  { entries: [], name: "F", minScore: 1, maxScore: 2 },
  { entries: [], name: "TRASH", minScore: 1, maxScore: 1 },
];

const DEFAULT_TIERS_POINT_5 = [
  { entries: [], name: "S", minScore: 8.5, maxScore: 5 },
  { entries: [], name: "A", minScore: 8.5, maxScore: 4 },
  { entries: [], name: "B", minScore: 8.5, maxScore: 3 },
  { entries: [], name: "C", minScore: 7, maxScore: 2 },
  { entries: [], name: "F", minScore: 5.5, maxScore: 1 },
];

const DEFAULT_TIERS_POINT_3 = [
  { entries: [], name: ":)", minScore: 8.5, maxScore: 3 },
  { entries: [], name: ":|", minScore: 8.5, maxScore: 2 },
  { entries: [], name: ":(", minScore: 8.5, maxScore: 1 },
];

export const default_tiers_map = new Map<ScoreFormat, TierModel[]>([
  [ScoreFormat.POINT_100, DEFAULT_TIERS_POINT_100],
  [ScoreFormat.POINT_10_DECIMAL, DEFAULT_TIERS_POINT_10_DECIMAL],
  [ScoreFormat.POINT_10, DEFAULT_TIERS_POINT_10],
  [ScoreFormat.POINT_5, DEFAULT_TIERS_POINT_5],
  [ScoreFormat.POINT_3, DEFAULT_TIERS_POINT_3],
]);

export const default_tiers = DEFAULT_TIERS_POINT_100;
