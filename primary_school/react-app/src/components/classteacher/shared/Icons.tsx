// components/classteacher/shared/Icons.tsx
import React from "react";

interface IconProps {
  size?: number;
  color?: string;
  sw?: number;
}

const Icon: React.FC<{
  d: string;
  d2?: string;
  size?: number;
  color?: string;
  sw?: number;
}> = ({ d, d2, size = 16, color = "currentColor", sw = 1.8 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={sw}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d={d} />
    {d2 && <path d={d2} />}
  </svg>
);

export const ChevronLeft = ({ size = 16 }: IconProps) => (
  <Icon size={size} d="M15 18l-6-6 6-6" />
);
export const ChevronRight = ({ size = 16 }: IconProps) => (
  <Icon size={size} d="M9 18l6-6-6-6" />
);
export const UsersIcon = () => (
  <Icon
    d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"
    d2="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"
  />
);
export const MarkIcon = () => (
  <Icon
    d="M9 11l3 3L22 4"
    d2="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"
  />
);
export const FileIcon = () => (
  <Icon
    d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"
    d2="M14 2v6h6M16 13H8M16 17H8M10 9H8"
  />
);
export const BarIcon = () => <Icon d="M18 20V10M12 20V4M6 20v-6" />;
export const SettIcon = () => (
  <Icon
    d="M12 20a8 8 0 100-16 8 8 0 000 16z"
    d2="M12 14a2 2 0 100-4 2 2 0 000 4z"
  />
);
export const HomeIcon = () => (
  <Icon d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
);
export const BellIcon = () => (
  <Icon d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" />
);
export const LogoutIcon = () => (
  <Icon d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
);
export const BackIcon = () => <Icon d="M19 12H5M12 5l-7 7 7 7" />;
export const DlIcon = () => (
  <Icon d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
);

export const ArchiveIcon = () => (
  <Icon 
    d="M21 8V21H3V8" 
    d2="M1 3H23V8H1V3M10 12H14" 
  />
);

export const TimetableIcon = () => (
  <Icon
    d="M8 2v4M16 2v4M3 10h18"
    d2="M3 4h18v18H3z"
  />
);
