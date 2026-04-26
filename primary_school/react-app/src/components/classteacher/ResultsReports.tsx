// components/classteacher/ResultsReports.tsx
import React from "react";
import { DlIcon } from "./shared/Icons";
import { C, FONT } from "./shared/constants";
import { avg, sum, gradeColor, grade } from "./shared/helpers";
import { Avatar } from "./shared/Avatar";

interface ResultsReportsProps {
  students: any[];
  subjects: any[];
}

const SectionHeader: React.FC<{
  eyebrow: string;
  title: string;
  sub?: string;
}> = ({ eyebrow, title, sub }) => (
  <div style={{ marginBottom: "1.6rem" }}>
    <p
      style={{
        fontFamily: FONT.sans,
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "0.09em",
        textTransform: "uppercase",
        color: C.gold,
        margin: "0 0 5px",
      }}
    >
      {eyebrow}
    </p>
    <h2
      style={{
        fontFamily: FONT.serif,
        fontSize: "1.9rem",
        fontWeight: 600,
        color: C.text,
        margin: "0 0 4px",
        letterSpacing: "-0.01em",
      }}
    >
      {title}
    </h2>
    {sub && (
      <p
        style={{
          fontFamily: FONT.sans,
          fontSize: 13,
          color: C.textMuted,
          margin: 0,
        }}
      >
        {sub}
      </p>
    )}
  </div>
);

export const ResultsReports: React.FC<ResultsReportsProps> = ({ students, subjects }) => {
  const reports = [
    {
      title: "Full class report",
      desc: `Complete results for all ${students.length} students across all subjects.`,
      tag: "XLSX / PDF",
    },
    {
      title: "Individual result slips",
      desc: "One slip per learner — ready for printing or digital distribution.",
      tag: "PDF",
    },
    {
      title: "Subject summary",
      desc: "Subject-by-subject performance table with class averages.",
      tag: "XLSX",
    },
  ];

  const sortedStudents = [...students].sort((a, b) => avg(b.marks || {}) - avg(a.marks || {}));
  const topStudent = sortedStudents.length > 0 ? sortedStudents[0] : null;
  const leastStudent = sortedStudents.length > 0 ? sortedStudents[sortedStudents.length - 1] : null;

  const [msg, setMsg] = React.useState<{ text: string, type: "success" | "error" } | null>(null);

  const handleDownload = (type: string, studentName?: string) => {
    try {
      if (type === "Full Merit List" || type === "Full class report" || type === "Subject summary") {
        const csvContent = [
          ["Rank", "Student", "Admission No", ...subjects.map(s => s.name), "Total", "Avg", "Grade"],
          ...sortedStudents.map((s, i) => [
            i + 1,
            `"${s.name}"`,
            s.adm || "-",
            ...subjects.map(sub => (s.marks || {})[sub.id] ?? "-"),
            sum(s.marks || {}),
            avg(s.marks || {}) + "%",
            grade(avg(s.marks || {}))
          ])
        ].map(row => row.join(",")).join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `Term1_Report_${Date.now()}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else if (type === "Report Slip" || type === "Individual result slips") {
        if (!studentName) {
           setMsg({ text: "Individual slip download requires student selection from the Merit List table.", type: "error" });
           setTimeout(() => setMsg(null), 3500);
           return;
        }
        const slip = sortedStudents.find(s => s.name === studentName);
        if (!slip) return;
        const content = `STUDENT REPORT SLIP
Name: ${slip.name}
Admission No: ${slip.adm || "-"}
Term: 1 | Year: 2024
-----------------------------------
${subjects.map(sub => `${sub.name.padEnd(20)}: ${((slip.marks || {})[sub.id] ?? "-").toString().padEnd(4)}  ${(slip.marks || {})[sub.id] != null ? `(${grade((slip.marks || {})[sub.id])})` : ""}`).join("\n")}
-----------------------------------
Total Marks: ${sum(slip.marks || {})}
Average: ${avg(slip.marks || {})}%  (${grade(avg(slip.marks || {}))})
`;
        const blob = new Blob([content], { type: "text/plain;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${slip.name.replace(/\s+/g, '_')}_Report.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      setMsg({ text: `Successfully downloaded ${type}${studentName ? ` for ${studentName}` : ""}`, type: "success" });
    } catch (err) {
      setMsg({ text: `Failed to download ${type}`, type: "error" });
    }
    setTimeout(() => setMsg(null), 3500);
  };

  return (
    <div className="ct-anim" style={{ display: "grid", gap: 30 }}>
      <div>
        <SectionHeader
          eyebrow="Reports"
          title="Results & reports"
          sub={`Download and review performance summaries for Term 1, 2024.`}
        />
        {msg && (
          <div style={{ 
            padding: "10px 20px", 
            marginBottom: 15, 
            borderRadius: 8, 
            background: msg.type === "success" ? "#eaf3de" : "#fdeaea",
            color: msg.type === "success" ? "#3b6d11" : "#a32d2d",
            fontSize: 13,
            fontWeight: 600
          }}>
            {msg.text}
          </div>
        )}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 16,
          }}
        >
          {reports.map(({ title, desc, tag }) => (
            <div
              key={title}
              className="ct-card ct-metric"
              style={{
                background: C.white,
                border: `1px solid ${C.border}`,
                borderRadius: 14,
                padding: "1.4rem",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: 10,
                }}
              >
                <h3
                  style={{
                    fontFamily: FONT.serif,
                    fontSize: "1.15rem",
                    fontWeight: 600,
                    color: C.text,
                  }}
                >
                  {title}
                </h3>
                <span
                  style={{
                    fontFamily: FONT.sans,
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: "0.06em",
                    background: C.goldLight,
                    color: C.gold,
                    padding: "3px 9px",
                    borderRadius: 12,
                    flexShrink: 0,
                  }}
                >
                  {tag}
                </span>
              </div>
              <p
                style={{
                  fontFamily: FONT.sans,
                  fontSize: 13,
                  color: C.textMuted,
                  lineHeight: 1.6,
                  marginBottom: "1.2rem",
                }}
              >
                {desc}
              </p>
              <button
                className="ct-actionbtn"
                onClick={() => handleDownload(title)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  padding: "9px 16px",
                  background: C.sand,
                  border: `1px solid ${C.border}`,
                  borderRadius: 9,
                  fontFamily: FONT.sans,
                  fontSize: 13,
                  fontWeight: 600,
                  color: C.textMid,
                  cursor: "pointer",
                  width: "100%",
                  justifyContent: "center",
                }}
              >
                <DlIcon /> Download
              </button>
            </div>
          ))}
        </div>
      </div>

      {sortedStudents.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div style={{ background: C.greenLight, border: `1px solid ${C.green}`, padding: "16px", borderRadius: 12, display: "flex", alignItems: "center", gap: 12 }}>
            <Avatar name={topStudent.name} size={40} />
            <div>
              <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: C.green, textTransform: "uppercase" }}>Top Student</p>
              <h4 style={{ margin: "2px 0", fontSize: 16, color: C.text, fontFamily: FONT.serif }}>{topStudent.name}</h4>
              <p style={{ margin: 0, fontSize: 13, color: C.textMuted }}>Avg: <strong>{avg(topStudent.marks || {})}%</strong></p>
            </div>
          </div>
          <div style={{ background: "#fdeaea", border: `1px solid ${C.dangerBg}`, padding: "16px", borderRadius: 12, display: "flex", alignItems: "center", gap: 12 }}>
            <Avatar name={leastStudent.name} size={40} />
            <div>
              <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: C.dangerText, textTransform: "uppercase" }}>Least Student</p>
              <h4 style={{ margin: "2px 0", fontSize: 16, color: C.text, fontFamily: FONT.serif }}>{leastStudent.name}</h4>
              <p style={{ margin: 0, fontSize: 13, color: C.textMuted }}>Avg: <strong>{avg(leastStudent.marks || {})}%</strong></p>
            </div>
          </div>
        </div>
      )}

      <div
        style={{
          background: C.white,
          border: `1px solid ${C.border}`,
          borderRadius: 14,
          overflow: "hidden",
        }}
      >
        <div style={{ padding: "14px 18px", borderBottom: `1px solid ${C.border}`, background: C.goldPale, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ fontFamily: FONT.serif, fontSize: "1.3rem", fontWeight: 600, color: C.text, margin: 0 }}>
            Class Merit List (Real-time Preview)
          </h3>
          <button
            onClick={() => handleDownload("Full Merit List")}
            style={{
              padding: "7px 12px",
              background: C.white,
              border: `1px solid ${C.border}`,
              borderRadius: 6,
              fontFamily: FONT.sans,
              fontSize: 12,
              fontWeight: 600,
              color: C.textMid,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6
            }}
          >
            <DlIcon /> Download List
          </button>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 600 }}>
            <thead>
              <tr style={{ background: C.sand }}>
                <th style={thStyle}>Rank</th>
                <th style={thStyle}>Student</th>
                {subjects.slice(0, 5).map(s => (
                  <th key={s.id} style={{ ...thStyle, textAlign: "center" }}>{s.name.slice(0, 3)}</th>
                ))}
                <th style={{ ...thStyle, textAlign: "center" }}>Total</th>
                <th style={{ ...thStyle, textAlign: "center" }}>Avg</th>
                <th style={{ ...thStyle, textAlign: "right" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {sortedStudents.map((s, idx) => {
                const a = avg(s.marks || {});
                return (
                  <tr key={s.id} style={{ borderTop: `1px solid ${C.borderLight}` }}>
                    <td style={tdStyle}>{idx + 1}</td>
                    <td style={tdStyle}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <Avatar name={s.name} size={24} />
                        <span style={{ fontWeight: 600 }}>{s.name}</span>
                      </div>
                    </td>
                    {subjects.slice(0, 5).map(sub => {
                      const mark = (s.marks || {})[sub.id];
                      return (
                        <td key={sub.id} style={{ ...tdStyle, textAlign: "center", color: gradeColor(mark || 0) }}>
                          {mark != null ? `${mark}%` : "-"}
                        </td>
                      );
                    })}
                    <td style={{ ...tdStyle, textAlign: "center", fontWeight: 700, color: C.text }}>{sum(s.marks || {})}</td>
                    <td style={{ ...tdStyle, textAlign: "center", fontWeight: 700, color: gradeColor(a) }}>{a}%</td>
                    <td style={{ ...tdStyle, textAlign: "right" }}>
                      <button
                        onClick={() => handleDownload("Report Slip", s.name)}
                        style={{
                          padding: "5px 10px",
                          background: "transparent",
                          border: `1px solid ${C.border}`,
                          borderRadius: 6,
                          fontFamily: FONT.sans,
                          fontSize: 11,
                          fontWeight: 600,
                          color: C.textMid,
                          cursor: "pointer"
                        }}
                      >
                        Download
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const thStyle: React.CSSProperties = {
  padding: "11px 16px",
  textAlign: "left",
  fontFamily: FONT.sans,
  fontSize: 10.5,
  fontWeight: 700,
  color: C.textFaint,
  textTransform: "uppercase",
  letterSpacing: "0.06em",
};

const tdStyle: React.CSSProperties = {
  padding: "12px 16px",
  fontFamily: FONT.sans,
  fontSize: 13,
  color: C.textMid,
};
