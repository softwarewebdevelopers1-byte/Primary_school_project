import React from "react";
import { Avatar } from "./shared/Avatar";
import { C, FONT } from "./shared/constants";
import { avg, gradeColor, marksForStudentSubjects, getSubId, sumPoints } from "./shared/helpers";
import { resolveCbcBand, useCbcGradingBands } from "../../lib/cbcGrading";

interface AnalyticsProps {
  students: any[];
  subjects: any[];
  classGrade: string;
  classStream: string;
  term?: number;
  year?: number;
}

const MetricCard: React.FC<{ label: string; value: string; note?: string; color?: string }> = ({ label, value, note, color }) => (
  <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 14, padding: "1.3rem 1.4rem", borderTop: `3px solid ${color || C.gold}` }}>
    <p style={{ fontFamily: FONT.sans, fontSize: 11.5, fontWeight: 600, color: C.textMuted, margin: "0 0 8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</p>
    <p style={{ fontFamily: FONT.serif, fontSize: "2.1rem", fontWeight: 600, color: C.text, margin: "0 0 6px", lineHeight: 1 }}>{value}</p>
    {note && <p style={{ fontFamily: FONT.sans, fontSize: 12, color: C.textFaint, margin: 0, lineHeight: 1.5 }}>{note}</p>}
  </div>
);

const SectionHeader: React.FC<{ eyebrow: string; title: string; sub?: string }> = ({ eyebrow, title, sub }) => (
  <div style={{ marginBottom: "1.6rem" }}>
    <p style={{ fontFamily: FONT.sans, fontSize: 11, fontWeight: 700, letterSpacing: "0.09em", textTransform: "uppercase", color: C.gold, margin: "0 0 5px" }}>{eyebrow}</p>
    <h2 style={{ fontFamily: FONT.serif, fontSize: "1.9rem", fontWeight: 600, color: C.text, margin: "0 0 4px" }}>{title}</h2>
    {sub && <p style={{ fontFamily: FONT.sans, fontSize: 13, color: C.textMuted, margin: 0 }}>{sub}</p>}
  </div>
);

export const Analytics: React.FC<AnalyticsProps> = ({
  students,
  subjects,
  classGrade,
  classStream,
  term = 1,
  year = 2024,
}) => {
  const { bands: cbcBands } = useCbcGradingBands();

  if (students.length === 0) {
    return <div style={{ padding: 40, textAlign: "center", color: C.textMuted }}>No analytics data available.</div>;
  }

  const subjectAvgs = subjects.map((subject) => {
    const sid = getSubId(subject.id || subject._id);
    const marks = students
      .filter((student) => marksForStudentSubjects(student, subjects)[sid] !== undefined)
      .map((student) => marksForStudentSubjects(student, subjects)[sid]);
    const total = marks.reduce((a, b) => a + (b || 0), 0);
    return { ...subject, avg: marks.length > 0 ? Math.round(total / marks.length) : 0 };
  });

  const studentAvgs = students
    .map((student) => {
      const studentMarks = marksForStudentSubjects(student, subjects);
      const averageMarks = avg(studentMarks);
      const totalPoints = sumPoints(studentMarks, cbcBands);
      return {
        ...student,
        avg: averageMarks,
        points: totalPoints,
        cbcBand: resolveCbcBand(averageMarks, cbcBands).cbcBand,
      };
    })
    .sort((a, b) => b.points - a.points || b.avg - a.avg || String(a.name).localeCompare(String(b.name)));

  const classAvg = studentAvgs.length > 0
    ? Math.round(studentAvgs.reduce((a, student) => a + student.avg, 0) / studentAvgs.length)
    : 0;
  const classBand = resolveCbcBand(classAvg, cbcBands).cbcBand;
  const bestSubject = [...subjectAvgs].sort((a, b) => b.avg - a.avg)[0];
  const meetingRate = students.length > 0
    ? Math.round((students.filter((student) => {
      const band = resolveCbcBand(avg(marksForStudentSubjects(student, subjects)), cbcBands).cbcBand;
      return band.startsWith("EE") || band.startsWith("ME");
    }).length / students.length) * 100)
    : 0;

  return (
    <div className="ct-anim">
      <SectionHeader
        eyebrow="Insights"
        title="CBC performance analytics"
        sub={`Grade ${classGrade}${classStream} - Academic Year ${year} - Term ${term}`}
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 14, marginBottom: "1.6rem" }}>
        <MetricCard label="Class average marks" value={`${classAvg}%`} note={`CBC band: ${classBand}`} color={gradeColor(classBand)} />
        <MetricCard label="Top student" value={studentAvgs[0]?.cbcBand || "N/A"} note={`${studentAvgs[0]?.name} (${studentAvgs[0]?.points} pts)`} color={C.successText} />
        <MetricCard label="Best subject" value={bestSubject?.name.split(" ")[0] || "N/A"} note={bestSubject ? `${bestSubject.avg}% avg` : "N/A"} color={C.gold} />
        <MetricCard label="Competency trend" value={`${meetingRate}%`} note="Learners in ME or EE bands" color={C.warnText} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 14, padding: "1.4rem" }}>
          <p style={{ fontFamily: FONT.sans, fontSize: 11, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 1.2rem" }}>Subject averages</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {subjectAvgs.map((subject) => {
              const band = resolveCbcBand(subject.avg, cbcBands).cbcBand;
              return (
                <div key={subject.id}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                    <span style={{ fontFamily: FONT.sans, fontSize: 13, color: C.textMid }}>{subject.name}</span>
                    <span style={{ fontFamily: FONT.serif, fontSize: 14, fontWeight: 600, color: gradeColor(band) }}>{subject.avg}% | {band}</span>
                  </div>
                  <div style={{ height: 9, background: C.sand, borderRadius: 5, overflow: "hidden" }}>
                    <div style={{ width: `${subject.avg}%`, height: "100%", background: gradeColor(band), borderRadius: 5 }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 14, padding: "1.4rem" }}>
          <p style={{ fontFamily: FONT.sans, fontSize: 11, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 1.2rem" }}>Student ranking (Top 10)</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {studentAvgs.slice(0, 10).map((student, index) => (
              <div key={student.id} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontFamily: FONT.serif, fontSize: 17, fontWeight: 600, color: C.textFaint, width: 22, textAlign: "center" }}>{index + 1}</span>
                <Avatar name={student.name} size={30} />
                <span style={{ fontFamily: FONT.sans, fontSize: 13, fontWeight: 600, color: C.text, flex: 1 }}>{student.name}</span>
                <span style={{ fontFamily: FONT.serif, fontSize: 14, fontWeight: 600, color: gradeColor(student.cbcBand), width: 90, textAlign: "right" }}>{student.points} pts</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 14, padding: "1.4rem", gridColumn: "1/-1" }}>
          <p style={{ fontFamily: FONT.sans, fontSize: 11, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 1.2rem" }}>CBC band distribution</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 12 }}>
            {cbcBands.map((band) => {
              const count = studentAvgs.filter((student) => student.cbcBand === band.cbcBand).length;
              const color = gradeColor(band.cbcBand);
              return (
                <div key={band.cbcBand} style={{ background: `${color}18`, borderRadius: 11, padding: "1rem", textAlign: "center" }}>
                  <p style={{ fontFamily: FONT.serif, fontSize: "2rem", fontWeight: 600, color, margin: "0 0 2px" }}>{band.cbcBand}</p>
                  <p style={{ fontFamily: FONT.serif, fontSize: "1.6rem", fontWeight: 600, color, margin: "0 0 4px" }}>{count}</p>
                  <p style={{ fontFamily: FONT.sans, fontSize: 11, color, margin: 0, opacity: 0.8 }}>{band.minMarks}-{band.maxMarks} marks</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
