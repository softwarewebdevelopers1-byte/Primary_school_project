// components/classteacher/shared/Avatar.tsx
import React from "react";
import { initials, avatarBg } from "./helpers";
import { FONT } from "./constants";

interface AvatarProps {
  name: string;
  size?: number;
}

export const Avatar: React.FC<AvatarProps> = ({ name, size = 36 }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: "50%",
      background: avatarBg(name),
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#fff",
      fontFamily: FONT.sans,
      fontWeight: 600,
      fontSize: size * 0.33,
      flexShrink: 0,
    }}
  >
    {initials(name)}
  </div>
);
