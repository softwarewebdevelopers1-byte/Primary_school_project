import { CbcGradingBandModel } from "../models/school.model.js";

export interface CbcGradingBand {
  _id?: any;
  cbcBand: string;
  points: number;
  minScore: number;
  maxScore: number;
  description?: string | null;
}

export const DEFAULT_CBC_GRADE_BANDS: CbcGradingBand[] = [
  { cbcBand: "A", points: 12, minScore: 80, maxScore: 100 },
  { cbcBand: "A-", points: 11, minScore: 75, maxScore: 79 },
  { cbcBand: "B+", points: 10, minScore: 70, maxScore: 74 },
  { cbcBand: "B", points: 9, minScore: 65, maxScore: 69 },
  { cbcBand: "B-", points: 8, minScore: 60, maxScore: 64 },
  { cbcBand: "C+", points: 7, minScore: 55, maxScore: 59 },
  { cbcBand: "C", points: 6, minScore: 50, maxScore: 54 },
  { cbcBand: "C-", points: 5, minScore: 45, maxScore: 49 },
  { cbcBand: "D+", points: 4, minScore: 40, maxScore: 44 },
  { cbcBand: "D", points: 3, minScore: 35, maxScore: 39 },
  { cbcBand: "D-", points: 2, minScore: 30, maxScore: 34 },
  { cbcBand: "E", points: 1, minScore: 0, maxScore: 29 },
];

const toFiniteNumber = (value: unknown): number | null => {
  if (value === null || value === undefined || value === "") return null;
  const numberValue = typeof value === "number" ? value : Number(value);
  return Number.isFinite(numberValue) ? numberValue : null;
};

export const computeMarkPercentage = (mark: any): number | null => {
  const finalScore = toFiniteNumber(mark?.finalScore);
  if (finalScore !== null) {
    return Math.max(0, Math.min(100, Math.round(finalScore)));
  }

  const components = [
    { score: toFiniteNumber(mark?.cat1), max: toFiniteNumber(mark?.cat1Max) },
    { score: toFiniteNumber(mark?.cat2), max: toFiniteNumber(mark?.cat2Max) },
    { score: toFiniteNumber(mark?.cat3), max: toFiniteNumber(mark?.cat3Max) },
    { score: toFiniteNumber(mark?.cat4), max: toFiniteNumber(mark?.cat4Max) },
    { score: toFiniteNumber(mark?.cat5), max: toFiniteNumber(mark?.cat5Max) },
    { score: toFiniteNumber(mark?.exam), max: toFiniteNumber(mark?.examMax) },
  ];

  let totalScore = 0;
  let totalMax = 0;

  for (const component of components) {
    if (component.score === null) continue;
    const max = component.max !== null && component.max > 0 ? component.max : 0;
    if (max <= 0) continue;
    totalScore += component.score;
    totalMax += max;
  }

  if (totalMax <= 0) return null;
  const percentage = Math.round((totalScore / totalMax) * 100);
  return Math.max(0, Math.min(100, percentage));
};

export const normalizeGradeBands = (bands: CbcGradingBand[]): CbcGradingBand[] => {
  return bands
    .map((band) => ({
      ...band,
      minScore: Math.max(0, Math.min(100, Math.round(band.minScore ?? 0))),
      maxScore: Math.max(0, Math.min(100, Math.round(band.maxScore ?? 100))),
      points: Math.max(0, Math.round(band.points ?? 0)),
      cbcBand: String(band.cbcBand || "").trim(),
    }))
    .filter((band) => band.cbcBand && band.minScore <= band.maxScore)
    .sort((a, b) => {
      if (b.minScore !== a.minScore) return b.minScore - a.minScore;
      if (b.maxScore !== a.maxScore) return b.maxScore - a.maxScore;
      return b.points - a.points;
    });
};

export const resolveCbcGradeBand = (
  percentage: number,
  bands: CbcGradingBand[] = DEFAULT_CBC_GRADE_BANDS,
): CbcGradingBand => {
  const normalized = Math.max(0, Math.min(100, Math.round(percentage)));
  const normalizedBands = normalizeGradeBands(bands);
  const exactMatch = normalizedBands.find(
    (band) => normalized >= band.minScore && normalized <= band.maxScore,
  );
  if (exactMatch) return exactMatch;

  const lowerMatch = normalizedBands.find((band) => normalized >= band.minScore);
  if (lowerMatch) return lowerMatch;

  return normalizedBands[normalizedBands.length - 1] || DEFAULT_CBC_GRADE_BANDS[0];
};

export const buildMarkGradeInfo = (
  mark: any,
  bands?: CbcGradingBand[],
): {
  percentage: number | null;
  cbcBand: string | null;
  points: number | null;
} => {
  const percentage = computeMarkPercentage(mark);
  if (percentage === null) {
    return { percentage: null, cbcBand: null, points: null };
  }

  const band = resolveCbcGradeBand(percentage, bands || DEFAULT_CBC_GRADE_BANDS);
  return {
    percentage,
    cbcBand: band.cbcBand,
    points: band.points,
  };
};

export const getCbcGradeBands = async (): Promise<CbcGradingBand[]> => {
  const bands = await CbcGradingBandModel.find().lean();
  const normalized = normalizeGradeBands(bands as CbcGradingBand[]);
  return normalized.length > 0 ? normalized : normalizeGradeBands(DEFAULT_CBC_GRADE_BANDS);
};
