// components/classteacher/shared/GlobalStyles.tsx
import React from "react";
import { C } from "./constants";

export const GlobalStyles: React.FC = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Nunito:wght@300;400;500;600;700&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    .ct-dashboardShell {
      --ct-green: #0B2018;
      --ct-green-mid: #163325;
      --ct-green-light: #1e4232;
      --ct-gold: #C9963D;
      --ct-gold-light: #f5ead4;
      --ct-gold-pale: #faf4e8;
      --ct-cream: #FDFBF7;
      --ct-sand: #f0e9dc;
      --ct-border: #e8dcc8;
      --ct-border-light: #f0e8d8;
      --ct-text: #1a1208;
      --ct-text-mid: #4a3820;
      --ct-text-muted: #7a6040;
      --ct-text-faint: #b8a58a;
      --ct-white: #ffffff;
      --ct-success-bg: #eaf3de;
      --ct-success-text: #3b6d11;
      --ct-warn-bg: #faeeda;
      --ct-warn-text: #854f0b;
      --ct-danger-bg: #fcebeb;
      --ct-danger-text: #a32d2d;
      color-scheme: light;
    }
    .ct-dashboardShell[data-theme="dark"] {
        --ct-green: #08110d;
        --ct-green-mid: #102018;
        --ct-green-light: #173126;
        --ct-gold: #d7ab59;
        --ct-gold-light: #312617;
        --ct-gold-pale: #221a11;
        --ct-cream: #121714;
        --ct-sand: #0c120f;
        --ct-border: #283329;
        --ct-border-light: #1b241d;
        --ct-text: #f3eadb;
        --ct-text-mid: #ddcdb8;
        --ct-text-muted: #baa88c;
        --ct-text-faint: #93836b;
        --ct-white: #161d19;
        --ct-success-bg: #172416;
        --ct-success-text: #98cd73;
        --ct-warn-bg: #241b11;
        --ct-warn-text: #e7bc71;
        --ct-danger-bg: #261515;
        --ct-danger-text: #f09b9b;
        color-scheme: dark;
    }
    @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes spin { to { transform: rotate(360deg); } }
    .ct-anim { animation: fadeUp 0.4s cubic-bezier(.22,1,.36,1) both; }
    .ct-navbtn { transition: background 0.18s, color 0.18s, border-color 0.18s; }
    .ct-navbtn:hover:not(.ct-active) { background: color-mix(in srgb, var(--ct-gold) 14%, transparent) !important; }
    .ct-navbtn.ct-active { background: color-mix(in srgb, var(--ct-gold) 24%, transparent) !important; border-left: 3px solid var(--ct-gold) !important; }
    .ct-row:hover td { background: var(--ct-gold-pale) !important; }
    .ct-actionbtn:hover { background: ${C.goldPale} !important; border-color: ${C.gold} !important; color: ${C.textMid} !important; transform: translateY(-1px); }
    .ct-primarybtn:hover { background: color-mix(in srgb, var(--ct-gold) 82%, black) !important; transform: translateY(-1px); box-shadow: 0 6px 18px rgba(180,128,45,.25) !important; }
    .ct-ghostbtn:hover { background: ${C.sand} !important; }
    .ct-pill:hover { background: ${C.gold} !important; color: #fff !important; border-color: ${C.gold} !important; }
    .ct-input:focus { border-color: ${C.gold} !important; box-shadow: 0 0 0 3px rgba(201,150,61,0.12) !important; outline: none; }
    .ct-card:hover { box-shadow: 0 4px 20px rgba(11,32,24,0.08) !important; transform: translateY(-2px); }
    .ct-metric { transition: box-shadow 0.2s, transform 0.2s; }
    .ct-mobileOverlay { display: none; }
    .ct-menuBtn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border: 1px solid rgba(201,150,61,0.2);
      background: rgba(201,150,61,0.12);
      color: ${C.textMid};
      border-radius: 10px;
      padding: 8px 12px;
      font: 700 12px/1 Nunito, sans-serif;
      cursor: pointer;
    }
    @media (max-width: 900px) {
      .ct-sidebarShell {
        transform: translateX(-100%);
        transition: transform 0.28s cubic-bezier(.22,1,.36,1), width 0.28s cubic-bezier(.22,1,.36,1);
      }
      .ct-sidebarShell.ct-mobileOpen { transform: translateX(0); }
      .ct-mobileOverlay {
        display: block;
        position: fixed;
        inset: 0;
        background: rgba(11,32,24,0.34);
        z-index: 900;
      }
      .ct-mainPanel { width: 100% !important; }
      .ct-topBar {
        height: auto !important;
        padding: 14px 16px !important;
        align-items: flex-start !important;
        flex-direction: column !important;
        gap: 12px !important;
      }
      .ct-topBarMeta {
        width: 100%;
        justify-content: space-between;
        gap: 12px !important;
        flex-wrap: wrap;
      }
      .ct-metricStrip {
        grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
        padding: 14px 16px !important;
      }
      .ct-contentArea { padding: 16px !important; }
    }
    @media (max-width: 640px) {
      .ct-topBarMeta { justify-content: flex-start; }
      .ct-metricStrip { grid-template-columns: 1fr !important; }
    }
  `}</style>
);
