// components/deputyhead/shared/GlobalStyles.tsx
import React from "react";
import { C } from "./constants";

export const GlobalStyles: React.FC = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Nunito:wght@300;400;500;600;700&display=swap');
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
    .dh-anim{animation:fadeUp .38s cubic-bezier(.22,1,.36,1) both}
    .dh-nav:hover:not(.dh-active){background:rgba(201,150,61,0.09)!important}
    .dh-nav.dh-active{background:rgba(201,150,61,0.18)!important;border-left-color:#C9963D!important}
    .dh-nav.dh-active .dh-ni{color:#C9963D!important}
    .dh-nav.dh-active .dh-nl{color:#e8dcc8!important}
    .dh-row:hover td{background:${C.goldPale}!important}
    .dh-pill:hover{background:${C.gold}!important;color:#fff!important;border-color:${C.gold}!important}
    .dh-pbtn:hover{background:#a87a2a!important;transform:translateY(-1px);box-shadow:0 6px 18px rgba(180,128,45,.24)!important}
    .dh-gbtn:hover{background:${C.sand}!important}
    .dh-card:hover{box-shadow:0 4px 20px rgba(11,32,24,.09)!important;transform:translateY(-2px)}
    .dh-sbtn:hover{background:rgba(255,255,255,.11)!important}
    .dh-hbtn:hover{background:rgba(201,150,61,.26)!important}
    .dh-actbtn:hover{background:${C.goldPale}!important;border-color:${C.gold}!important;color:${C.textMid}!important}
    .dh-input:focus{border-color:${C.gold}!important;box-shadow:0 0 0 3px rgba(201,150,61,.12)!important;outline:none}
    .dh-tag{display:inline-block;padding:2px 9px;border-radius:10px;font-size:10px;font-weight:700;letter-spacing:.04em;text-transform:uppercase}
  `}</style>
);
