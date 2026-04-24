// components/deputyhead/shared/GlobalStyles.tsx
import React from "react";
import { C } from "./constants";

export const GlobalStyles: React.FC = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Nunito:wght@300;400;500;600;700&display=swap');
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    .dh-dashboardShell{
      --dh-green:#0B2018;
      --dh-green-mid:#163325;
      --dh-green-light:rgba(255,255,255,0.06);
      --dh-gold:#C9963D;
      --dh-gold-light:#f5ead4;
      --dh-gold-pale:#faf4e8;
      --dh-cream:#FDFBF7;
      --dh-sand:#f0e9dc;
      --dh-border:#e8dcc8;
      --dh-border-light:#f0e8d8;
      --dh-text:#1a1208;
      --dh-text-mid:#4a3820;
      --dh-text-muted:#7a6040;
      --dh-text-faint:#b8a58a;
      --dh-white:#ffffff;
      --dh-success-bg:#eaf3de;
      --dh-success-text:#3b6d11;
      --dh-warn-bg:#faeeda;
      --dh-warn-text:#854f0b;
      --dh-danger-bg:#fcebeb;
      --dh-danger-text:#a32d2d;
      --dh-info-bg:#e8f0fb;
      --dh-info-text:#1a4a99;
      color-scheme:light;
    }
    .dh-dashboardShell[data-theme="dark"]{
        --dh-green:#08110d;
        --dh-green-mid:#102018;
        --dh-green-light:rgba(255,255,255,0.09);
        --dh-gold:#d7ab59;
        --dh-gold-light:#312617;
        --dh-gold-pale:#221a11;
        --dh-cream:#121714;
        --dh-sand:#0c120f;
        --dh-border:#283329;
        --dh-border-light:#1b241d;
        --dh-text:#f3eadb;
        --dh-text-mid:#ddcdb8;
        --dh-text-muted:#baa88c;
        --dh-text-faint:#93836b;
        --dh-white:#161d19;
        --dh-success-bg:#172416;
        --dh-success-text:#98cd73;
        --dh-warn-bg:#241b11;
        --dh-warn-text:#e7bc71;
        --dh-danger-bg:#261515;
        --dh-danger-text:#f09b9b;
        --dh-info-bg:#142030;
        --dh-info-text:#8ab5ff;
        color-scheme:dark;
    }
    @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
    .dh-anim{animation:fadeUp .38s cubic-bezier(.22,1,.36,1) both}
    .dh-nav:hover:not(.dh-active){background:color-mix(in srgb, var(--dh-gold) 14%, transparent)!important}
    .dh-nav.dh-active{background:color-mix(in srgb, var(--dh-gold) 24%, transparent)!important;border-left-color:var(--dh-gold)!important}
    .dh-nav.dh-active .dh-ni{color:var(--dh-gold)!important}
    .dh-nav.dh-active .dh-nl{color:#e8dcc8!important}
    .dh-row:hover td{background:${C.goldPale}!important}
    .dh-pill:hover{background:${C.gold}!important;color:#fff!important;border-color:${C.gold}!important}
    .dh-pbtn:hover{background:color-mix(in srgb, var(--dh-gold) 82%, black)!important;transform:translateY(-1px);box-shadow:0 6px 18px rgba(180,128,45,.24)!important}
    .dh-gbtn:hover{background:${C.sand}!important}
    .dh-card:hover{box-shadow:0 4px 20px rgba(11,32,24,.09)!important;transform:translateY(-2px)}
    .dh-sbtn:hover{background:rgba(255,255,255,.11)!important}
    .dh-hbtn:hover{background:color-mix(in srgb, var(--dh-gold) 30%, transparent)!important}
    .dh-actbtn:hover{background:${C.goldPale}!important;border-color:${C.gold}!important;color:${C.textMid}!important}
    .dh-input:focus{border-color:${C.gold}!important;box-shadow:0 0 0 3px rgba(201,150,61,.12)!important;outline:none}
    .dh-tag{display:inline-block;padding:2px 9px;border-radius:10px;font-size:10px;font-weight:700;letter-spacing:.04em;text-transform:uppercase}
    .dh-mobileOverlay{display:none}
    .dh-menuBtn{
      display:inline-flex;align-items:center;justify-content:center;border:1px solid rgba(201,150,61,.2);
      background:rgba(201,150,61,.12);color:${C.textMid};border-radius:10px;padding:8px 12px;
      font:700 12px/1 Nunito,sans-serif;cursor:pointer
    }
    @media (max-width:900px){
      .dh-sidebarShell{
        transform:translateX(-100%);
        transition:transform .28s cubic-bezier(.22,1,.36,1),width .28s cubic-bezier(.22,1,.36,1)
      }
      .dh-sidebarShell.dh-mobileOpen{transform:translateX(0)}
      .dh-mobileOverlay{
        display:block;position:fixed;inset:0;background:rgba(11,32,24,.34);z-index:900
      }
      .dh-mainPanel{width:100%!important}
      .dh-topBar{
        height:auto!important;padding:14px 16px!important;align-items:flex-start!important;flex-direction:column!important;gap:12px!important
      }
      .dh-topBarMeta{width:100%;justify-content:space-between;gap:12px!important;flex-wrap:wrap}
      .dh-contentArea{padding:16px!important}
    }
    @media (max-width:640px){
      .dh-topBarMeta{justify-content:flex-start}
    }
  `}</style>
);
