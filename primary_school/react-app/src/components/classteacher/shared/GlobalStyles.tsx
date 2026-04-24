// components/classteacher/shared/GlobalStyles.tsx
import React from "react";
import { C } from "./constants";

export const GlobalStyles: React.FC = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Nunito:wght@300;400;500;600;700&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes spin { to { transform: rotate(360deg); } }
    .ct-anim { animation: fadeUp 0.4s cubic-bezier(.22,1,.36,1) both; }
    .ct-navbtn { transition: background 0.18s, color 0.18s, border-color 0.18s; }
    .ct-navbtn:hover:not(.ct-active) { background: rgba(201,150,61,0.09) !important; }
    .ct-navbtn.ct-active { background: rgba(201,150,61,0.18) !important; border-left: 3px solid #C9963D !important; }
    .ct-row:hover td { background: #faf4e8 !important; }
    .ct-actionbtn:hover { background: ${C.goldPale} !important; border-color: ${C.gold} !important; color: ${C.textMid} !important; transform: translateY(-1px); }
    .ct-primarybtn:hover { background: #a87a2a !important; transform: translateY(-1px); box-shadow: 0 6px 18px rgba(180,128,45,.25) !important; }
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
