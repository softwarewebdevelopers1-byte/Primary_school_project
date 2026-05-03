// components/deputyhead/shared/helpers.ts
import { C } from "./constants";

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

export const gradePoints = (v: number): number => {
  if (v >= 80) return 12;
  if (v >= 75) return 11;
  if (v >= 70) return 10;
  if (v >= 65) return 9;
  if (v >= 60) return 8;
  if (v >= 55) return 7;
  if (v >= 50) return 6;
  if (v >= 45) return 5;
  if (v >= 40) return 4;
  if (v >= 35) return 3;
  if (v >= 30) return 2;
  return 1;
};

export const sumPoints = (marks: Record<string, number>): number => {
  return Object.values(marks || {}).reduce((acc, m) => acc + gradePoints(m), 0);
};

export const pointsToGrade = (avgPoints: number): string => {
  if (avgPoints >= 11.5) return "A";
  if (avgPoints >= 10.5) return "A-";
  if (avgPoints >= 9.5) return "B+";
  if (avgPoints >= 8.5) return "B";
  if (avgPoints >= 7.5) return "B-";
  if (avgPoints >= 6.5) return "C+";
  if (avgPoints >= 5.5) return "C";
  if (avgPoints >= 4.5) return "C-";
  if (avgPoints >= 3.5) return "D+";
  if (avgPoints >= 2.5) return "D";
  if (avgPoints >= 1.5) return "D-";
  return "E";
};

export const grade = (v: number): string => {
  if (v >= 80) return "A";
  if (v >= 75) return "A-";
  if (v >= 70) return "B+";
  if (v >= 65) return "B";
  if (v >= 60) return "B-";
  if (v >= 55) return "C+";
  if (v >= 50) return "C";
  if (v >= 45) return "C-";
  if (v >= 40) return "D+";
  if (v >= 35) return "D";
  if (v >= 30) return "D-";
  return "E";
};

export const gb = (v: number): string => {
  return v >= 80 ? C.successBg : v >= 65 ? C.warnBg : C.dangerBg;
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
