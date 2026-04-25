// components/subjectteacher/MarksTab.tsx
import React from "react";
import { MarksEntry } from "../shared/MarksEntry";
import { MarksTabProps } from "./types";

export const MarksTab: React.FC<MarksTabProps> = (props) => {
  return (
    <MarksEntry 
      {...props} 
      mode="subject"
    />
  );
};
