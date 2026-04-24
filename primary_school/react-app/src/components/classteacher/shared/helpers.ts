// components/classteacher/shared/helpers.ts
export const avg = (marks: Record<string, number>): number => {
  const vals = Object.values(marks);
  return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
};

export const grade = (v: number): string =>
  v >= 80 ? "A" : v >= 70 ? "B" : v >= 60 ? "C" : v >= 50 ? "D" : "E";

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
