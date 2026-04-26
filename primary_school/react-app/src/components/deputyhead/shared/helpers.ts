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

export const avg = (marks: Record<string, number>): number => {
  const vals = Object.values(marks || {});
  if (vals.length === 0) return 0;
  return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
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
