// components/classteacher/shared/helpers.ts
export const avg = (marks: Record<string, number>): number => {
  const vals = Object.values(marks);
  if (vals.length === 0) return 0;
  return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
};

export const sum = (marks: Record<string, number>): number => {
  return Object.values(marks).reduce((a, b) => a + b, 0);
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

export const gradeColor = (v: number): string =>
  v >= 80 ? "#3b6d11" : v >= 60 ? "#854f0b" : "#a32d2d";

export const gradeBg = (v: number): string =>
  v >= 80 ? "#eaf3de" : v >= 60 ? "#faeeda" : "#fcebeb";

export const initials = (name: string): string =>
  name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

export const avatarBg = (name: string): string => {
  const h = name.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const colors = [
    "#1D9E75",
    "#BA7517",
    "#993C1D",
    "#185FA5",
    "#3B6D11",
    "#993556",
  ];
  return colors[h % colors.length];
};
