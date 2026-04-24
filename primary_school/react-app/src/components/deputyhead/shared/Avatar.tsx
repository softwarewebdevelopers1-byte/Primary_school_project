// components/deputyhead/shared/Avatar.tsx
import React from "react";
import { avatarBg, initials } from "./helpers";
import { F } from "./constants";

interface AvatarProps {
  name: string;
  size?: number;
}

export const Avatar: React.FC<AvatarProps> = ({ name, size = 34 }) => (
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
      fontFamily: F.sans,
      fontWeight: 700,
      fontSize: size * 0.32,
      flexShrink: 0,
    }}
  >
    {initials(name)}
  </div>
);
