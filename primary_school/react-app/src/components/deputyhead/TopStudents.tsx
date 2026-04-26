// components/deputyhead/TopStudents.tsx
import React from "react";
import { SectionHeader } from "./shared/SectionHeader";
import { Avatar } from "./shared/Avatar";
import { C, F } from "./shared/constants";
import { gc, avg } from "./shared/helpers";

interface TopStudentsProps {
  students?: any[];
  classes?: any[];
}

export const TopStudents: React.FC<TopStudentsProps> = ({ students = [], classes = [] }) => {
  // Group students by class
  const classStudentsMap = new Map();
  students.forEach(s => {
    const key = `${s.classGrade}${s.classStream || ""}`;
    if (!classStudentsMap.has(key)) classStudentsMap.set(key, []);
    classStudentsMap.get(key).push({
      ...s,
      calculatedAvg: avg(s.marks || {})
    });
  });

  // Sort classes by name
  const sortedClassKeys = Array.from(classStudentsMap.keys()).sort();

  return (
    <div className="dh-anim">
      <SectionHeader
        eyebrow="Excellence"
        title="Top performers"
        sub="Best 5 students per stream based on overall average"
      />
      
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: 20 }}>
        {sortedClassKeys.map(key => {
          const classStudents = classStudentsMap.get(key);
          const top5 = classStudents
            .sort((a: any, b: any) => b.calculatedAvg - a.calculatedAvg)
            .slice(0, 5);
          
          const classObj = classes.find(c => c.id === key) || { name: key };

          return (
            <div key={key} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 13, padding: "1.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 15 }}>
                <h3 style={{ margin: 0, fontFamily: F.serif, fontSize: "1.2rem", color: C.text }}>{classObj.name}</h3>
                <span style={{ fontSize: 12, color: C.textMuted, fontFamily: F.sans }}>{classStudents.length} Students</span>
              </div>
              
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {top5.map((s: any, idx: number) => (
                  <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 12, paddingBottom: 10, borderBottom: idx < top5.length - 1 ? `1px solid ${C.borderLight}` : "none" }}>
                    <div style={{ 
                      width: 24, 
                      height: 24, 
                      borderRadius: "50%", 
                      background: idx === 0 ? C.gold : idx === 1 ? "#C0C0C0" : idx === 2 ? "#CD7F32" : C.sand,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 12,
                      fontWeight: 700,
                      color: idx <= 2 ? "white" : C.textMuted
                    }}>
                      {idx + 1}
                    </div>
                    <Avatar name={s.name} size={32} />
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: 0, fontFamily: F.sans, fontSize: 13.5, fontWeight: 600, color: C.text }}>{s.name}</p>
                      <p style={{ margin: 0, fontFamily: F.sans, fontSize: 11, color: C.textMuted }}>Adm: {s.admissionNo || s.adm}</p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <p style={{ margin: 0, fontFamily: F.serif, fontSize: 15, fontWeight: 700, color: gc(s.calculatedAvg) }}>{s.calculatedAvg}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
