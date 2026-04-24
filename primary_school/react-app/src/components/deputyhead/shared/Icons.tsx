// components/deputyhead/shared/Icons.tsx
import React from "react";

interface IconProps {
  size?: number;
  sw?: number;
  d?: string;
  d2?: string;
}

export const Svg: React.FC<IconProps> = ({ d, d2, size = 16, sw = 1.8 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={sw}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d={d || ""} />
    {d2 && <path d={d2} />}
  </svg>
);

export const HomeIcon = () => (
  <Svg d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" d2="M9 22V12h6v10" />
);
export const UsersIcon = () => (
  <Svg
    d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"
    d2="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"
  />
);
export const BookIcon = () => (
  <Svg
    d="M4 19.5A2.5 2.5 0 016.5 17H20"
    d2="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"
  />
);
export const StudentIcon = () => (
  <Svg
    d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"
    d2="M12 11a4 4 0 100-8 4 4 0 000 8z"
  />
);
export const BarIcon = () => <Svg d="M18 20V10M12 20V4M6 20v-6" />;
export const FileIcon = () => (
  <Svg
    d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"
    d2="M14 2v6h6M16 13H8M16 17H8"
  />
);
export const ChatIcon = () => (
  <Svg d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
);
export const BellIcon = () => (
  <Svg
    d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"
    d2="M13.73 21a2 2 0 01-3.46 0"
  />
);
export const LogoutIcon = () => (
  <Svg d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" d2="M16 17l5-5-5-5M21 12H9" />
);
export const ChevronLeft = () => <Svg d="M15 18l-6-6 6-6" />;
export const ChevronRight = () => <Svg d="M9 18l6-6-6-6" />;
export const DownloadIcon = () => (
  <Svg d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
);
