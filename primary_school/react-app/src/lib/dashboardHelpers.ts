// lib/dashboardHelpers.ts

export const initials = (name: string): string => 
  name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();

export const avatarColor = (name: string): string => {
  const colors = ["#1D9E75", "#BA7517", "#993C1D", "#185FA5", "#3B6D11", "#993556", "#4A6DA8"];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash += name.charCodeAt(i);
  return colors[hash % colors.length];
};

export const avatar = (name: string, size: number = 28): string => 
  `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${avatarColor(name)};display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:${size * 0.32}px;flex-shrink:0">${initials(name)}</div>`;

export const gc = (v: number): string => 
  v >= 80 ? "var(--sText)" : v >= 65 ? "var(--wText)" : "var(--dText)";
