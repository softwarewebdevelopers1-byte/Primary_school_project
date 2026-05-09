import { useEffect, useState } from "react";
import { api } from "./api";

export interface CbcGradingBand {
  id?: string;
  minMarks: number;
  maxMarks: number;
  cbcBand: string;
  points: number;
  sortOrder?: number;
}

export const normalizeCbcBands = (bands: CbcGradingBand[]) =>
  [...bands].sort((left, right) => {
    const order = (left.sortOrder ?? 0) - (right.sortOrder ?? 0);
    return order || right.minMarks - left.minMarks;
  });

export const resolveCbcBand = (
  marks: number | null | undefined,
  bands: CbcGradingBand[],
) => {
  if (typeof marks !== "number" || !Number.isFinite(marks)) {
    return { cbcBand: "-", points: 0 };
  }

  const roundedMarks = Math.max(0, Math.min(100, Math.round(marks)));
  const band = normalizeCbcBands(bands).find(
    (candidate) =>
      roundedMarks >= candidate.minMarks && roundedMarks <= candidate.maxMarks,
  );

  return band
    ? { cbcBand: band.cbcBand, points: Number(band.points) || 0 }
    : { cbcBand: "Unconfigured", points: 0 };
};

export const cbcBandColor = (band: string) => {
  const prefix = String(band || "").slice(0, 2).toUpperCase();
  if (prefix === "EE") return "#1D9E75";
  if (prefix === "ME") return "#185FA5";
  if (prefix === "AE") return "#BA7517";
  if (prefix === "BE") return "#993C1D";
  return "#5d665f";
};

export const cbcBandBg = (band: string) => {
  const prefix = String(band || "").slice(0, 2).toUpperCase();
  if (prefix === "EE") return "#eaf7f1";
  if (prefix === "ME") return "#edf5fc";
  if (prefix === "AE") return "#fff7e7";
  if (prefix === "BE") return "#faece7";
  return "#f3f4f3";
};

export const useCbcGradingBands = () => {
  const [bands, setBands] = useState<CbcGradingBand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const reload = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get<CbcGradingBand[]>("/grading/cbc");
      setBands(normalizeCbcBands(response || []));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load CBC grading configuration.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void reload();
  }, []);

  return { bands, setBands, loading, error, reload };
};

export const totalPointsForMarks = (
  marks: Record<string, number>,
  bands: CbcGradingBand[],
) =>
  Object.values(marks || {}).reduce(
    (sum, mark) => sum + resolveCbcBand(mark, bands).points,
    0,
  );
