import { CbcGradingBandModel } from "../models/school.model.js";

export interface CbcGradingBandInput {
  id?: string;
  minMarks: number;
  maxMarks: number;
  cbcBand: string;
  points: number;
  sortOrder?: number;
}

export interface CbcGradingBand {
  id: string;
  minMarks: number;
  maxMarks: number;
  cbcBand: string;
  points: number;
  sortOrder: number;
  createdBy?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export const DEFAULT_RANKING_MODE = "total_points" as const;
export type RankingMode = typeof DEFAULT_RANKING_MODE | "total_marks" | "average_marks";

const INITIAL_CBC_GRADING_BANDS: CbcGradingBandInput[] = [
  { minMarks: 80, maxMarks: 100, cbcBand: "EE1", points: 8 },
  { minMarks: 65, maxMarks: 79, cbcBand: "EE2", points: 7 },
  { minMarks: 55, maxMarks: 64, cbcBand: "ME1", points: 6 },
  { minMarks: 45, maxMarks: 54, cbcBand: "ME2", points: 5 },
  { minMarks: 35, maxMarks: 44, cbcBand: "AE1", points: 4 },
  { minMarks: 25, maxMarks: 34, cbcBand: "AE2", points: 3 },
  { minMarks: 15, maxMarks: 24, cbcBand: "BE1", points: 2 },
  { minMarks: 0, maxMarks: 14, cbcBand: "BE2", points: 1 },
];

export const toFiniteNumber = (value: unknown): number | null => {
  if (value === null || value === undefined || value === "") return null;
  const numericValue =
    typeof value === "number"
      ? value
      : Number(typeof value === "string" ? value.trim() : value);
  return Number.isFinite(numericValue) ? numericValue : null;
};

export const computeMarkPercentage = (mark: any): number | null => {
  const finalScore = toFiniteNumber(mark?.finalScore);
  if (finalScore !== null) return Math.max(0, Math.min(100, Math.round(finalScore)));

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

  return totalMax > 0 ? Math.max(0, Math.min(100, Math.round((totalScore / totalMax) * 100))) : null;
};

export const validateMarkValue = (value: unknown, fieldName = "marks") => {
  const numericValue = toFiniteNumber(value);
  if (numericValue === null) return;
  if (numericValue < 0 || numericValue > 100) {
    throw new Error(`${fieldName} must be between 0 and 100.`);
  }
};

export const validateCbcGradingBands = (bands: CbcGradingBandInput[]) => {
  if (!Array.isArray(bands) || bands.length === 0) {
    throw new Error("At least one CBC grading band is required.");
  }

  const normalized = bands.map((band, index) => {
    const minMarks = Number(band.minMarks);
    const maxMarks = Number(band.maxMarks);
    const points = Number(band.points);
    const cbcBand = String(band.cbcBand || "").trim().toUpperCase();

    if (!cbcBand) throw new Error(`CBC band name is required for row ${index + 1}.`);
    if (!Number.isFinite(minMarks) || !Number.isFinite(maxMarks)) {
      throw new Error(`Min and max marks must be valid numbers for ${cbcBand}.`);
    }
    if (!Number.isFinite(points) || points < 0) {
      throw new Error(`Points must be zero or higher for ${cbcBand}.`);
    }
    if (minMarks < 0 || maxMarks > 100) {
      throw new Error(`${cbcBand} marks must stay between 0 and 100.`);
    }
    if (minMarks > maxMarks) {
      throw new Error(`${cbcBand} has an invalid mark range.`);
    }

    return {
      ...band,
      minMarks,
      maxMarks,
      cbcBand,
      points,
      sortOrder: typeof band.sortOrder === "number" ? band.sortOrder : index,
    };
  });

  const duplicateBand = normalized.find((band, index) =>
    normalized.findIndex((candidate) => candidate.cbcBand === band.cbcBand) !== index,
  );
  if (duplicateBand) {
    throw new Error(`Duplicate CBC band "${duplicateBand.cbcBand}" is not allowed.`);
  }

  const sorted = [...normalized].sort((left, right) => left.minMarks - right.minMarks);
  if (sorted[0]?.minMarks !== 0) {
    throw new Error("CBC grading ranges must start at 0 marks.");
  }
  if (sorted[sorted.length - 1]?.maxMarks !== 100) {
    throw new Error("CBC grading ranges must end at 100 marks.");
  }

  for (let index = 1; index < sorted.length; index += 1) {
    const previous = sorted[index - 1]!;
    const current = sorted[index]!;
    if (current.minMarks <= previous.maxMarks) {
      throw new Error(`${current.cbcBand} overlaps with ${previous.cbcBand}.`);
    }
    if (current.minMarks > previous.maxMarks + 1) {
      throw new Error(`CBC grading ranges have a gap between ${previous.maxMarks} and ${current.minMarks}.`);
    }
  }

  return normalized.sort((left, right) => left.sortOrder - right.sortOrder);
};

const mapBand = (band: any): CbcGradingBand => ({
  id: band._id?.toString?.() || band.id || "",
  minMarks: Number(band.minMarks),
  maxMarks: Number(band.maxMarks),
  cbcBand: String(band.cbcBand || "").trim().toUpperCase(),
  points: Number(band.points),
  sortOrder: Number(band.sortOrder ?? 0),
  createdBy: band.createdBy ?? null,
  createdAt: band.createdAt,
  updatedAt: band.updatedAt,
});

export const ensureCbcGradingBands = async () => {
  const count = await CbcGradingBandModel.countDocuments();
  if (count > 0) return;

  await CbcGradingBandModel.insertMany(
    INITIAL_CBC_GRADING_BANDS.map((band, index) => ({
      ...band,
      sortOrder: index,
      createdBy: "system",
    })),
  );
};

export const getCbcGradingBands = async (): Promise<CbcGradingBand[]> => {
  await ensureCbcGradingBands();
  const bands = await CbcGradingBandModel.find().sort({ sortOrder: 1, minMarks: -1 }).lean();
  return bands.map(mapBand);
};

export const resolveCbcBand = (marks: number, bands: CbcGradingBand[]) => {
  if (!Number.isFinite(marks) || marks < 0 || marks > 100) {
    throw new Error("Marks must be between 0 and 100.");
  }

  const roundedMarks = Math.round(marks);
  const matches = bands.filter(
    (band) => roundedMarks >= band.minMarks && roundedMarks <= band.maxMarks,
  );

  if (matches.length !== 1) {
    throw new Error(`Marks ${roundedMarks} must map to exactly one CBC grading band.`);
  }

  return matches[0]!;
};

export const buildMarkGradingFields = (percentage: number | null, bands: CbcGradingBand[]) => {
  if (percentage === null) {
    return { cbcBand: null, points: null };
  }
  const band = resolveCbcBand(percentage, bands);
  return { cbcBand: band.cbcBand, points: band.points };
};

export const normalizeRankingMode = (value: unknown): RankingMode => {
  if (value === "total_marks" || value === "average_marks" || value === "total_points") {
    return value;
  }
  return DEFAULT_RANKING_MODE;
};

export const compareRankedRows = (
  left: { totalPoints: number; totalMarks: number; averageMarks: number; name?: string },
  right: { totalPoints: number; totalMarks: number; averageMarks: number; name?: string },
  rankingMode: RankingMode = DEFAULT_RANKING_MODE,
) => {
  const primary =
    rankingMode === "total_marks"
      ? right.totalMarks - left.totalMarks
      : rankingMode === "average_marks"
        ? right.averageMarks - left.averageMarks
        : right.totalPoints - left.totalPoints;

  return (
    primary ||
    right.totalPoints - left.totalPoints ||
    right.totalMarks - left.totalMarks ||
    right.averageMarks - left.averageMarks ||
    String(left.name || "").localeCompare(String(right.name || ""))
  );
};
