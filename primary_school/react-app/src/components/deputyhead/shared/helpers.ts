// components/deputyhead/shared/helpers.ts
import { C } from "./constants";
import { cbcBandBg, resolveCbcBand, type CbcGradingBand } from "../../../lib/cbcGrading";

export const avatarBg = (name: string): string => {
  const h = name.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const colors = [
    "#1D9E75",
    "#BA7517",
    "#993C1D",
    "#185FA5",
    "#3B6D11",
    "#993556",
    "#4A6DA8",
  ];
  return colors[h % colors.length];
};

export const initials = (name: string): string => {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
};

export const gc = (v: number): string => {
  return v >= 80 ? C.successText : v >= 65 ? C.warnText : C.dangerText;
};

export const sum = (marks: Record<string, number>): number => {
  return Object.values(marks || {}).reduce((a, b) => a + (typeof b === "number" ? b : 0), 0);
};

export const avg = (marks: Record<string, number>, subjectCount?: number): number => {
  const vals = Object.values(marks || {}).filter(v => typeof v === "number");
  if (vals.length === 0) return 0;
  const total = vals.reduce((a, b) => a + b, 0);
  const count = subjectCount || vals.length;
  return Math.round(total / count);
};

export const gradePoints = (v: number, bands: CbcGradingBand[] = []): number => resolveCbcBand(v, bands).points;

export const sumPoints = (marks: Record<string, number>, bands: CbcGradingBand[] = []): number => {
  return Object.values(marks || {}).reduce((acc, m) => acc + gradePoints(m, bands), 0);
};

export const grade = (v: number, bands: CbcGradingBand[] = []): string => resolveCbcBand(v, bands).cbcBand;

export const gb = (v: number): string => {
  return cbcBandBg(resolveCbcBand(v, []).cbcBand);
};

export const pColor = (p: string): { bg: string; text: string } => {
  const map = {
    High: { bg: C.dangerBg, text: C.dangerText },
    Medium: { bg: C.warnBg, text: C.warnText },
    Low: { bg: C.successBg, text: C.successText },
  };
  return (map as any)[p] || { bg: C.sand, text: C.textMuted };
};

export const sColor = (s: string): { bg: string; text: string } => {
  const map = {
    Open: { bg: C.dangerBg, text: C.dangerText },
    Pending: { bg: C.warnBg, text: C.warnText },
    Resolved: { bg: C.successBg, text: C.successText },
  };
  return (map as any)[s] || { bg: C.sand, text: C.textMuted };
};
