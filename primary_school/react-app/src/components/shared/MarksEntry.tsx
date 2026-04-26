// components/shared/MarksEntry.tsx
import React, { useState, useEffect } from "react";
import styles from "./MarksEntry.module.css";
import { Subject, Student, MarksData } from "../subjectteacher/types";

interface MarksEntryProps {
  mode: "subject" | "class";
  subjects: Subject[];
  activeSubjectId: string;
  students: Student[];
  marksData: MarksData;
  pushedSubjects?: Set<string>;
  pushedStudents?: Set<string>;
  onSubjectChange: (subjectId: string) => void;
  onMarkUpdate: (
    subjectId: string,
    studentId: string,
    key: string,
    value: string,
  ) => void;
  onSaveMarks: (subjectId: string, catConfigs?: any) => void;
  onPushMarks?: (subjectId: string) => void;
  onConfigUpdate?: (subjectId: string, key: string, value: number) => void;
  avatar: (name: string, size: number) => string;
}

export const MarksEntry: React.FC<MarksEntryProps> = ({
  mode,
  subjects,
  activeSubjectId,
  students,
  marksData,
  pushedSubjects = new Set(),
  pushedStudents = new Set(),
  onSubjectChange,
  onMarkUpdate,
  onSaveMarks,
  onPushMarks,
  onConfigUpdate,
  avatar,
}) => {
  const currentSubject =
    subjects.find((s) => s.id === activeSubjectId) || subjects[0];
  const subjectMarks = marksData[activeSubjectId] || {};

  const [catsCount, setCatsCount] = useState(0);
  const [catConfigs, setCatConfigs] = useState<any>({
    cat1Max: 40, cat2Max: 40, cat3Max: 40, cat4Max: 40, cat5Max: 40, examMax: 100
  });

  // Sync catsCount and configs from loaded data
  useEffect(() => {
    if (students.length > 0) {
      // Use the first student's marks to sync max values (configs)
      const firstStudentMarks = subjectMarks[students[0].id];
      if (firstStudentMarks) {
        setCatConfigs({
          cat1Max: firstStudentMarks.cat1Max || 40,
          cat2Max: firstStudentMarks.cat2Max || 40,
          cat3Max: firstStudentMarks.cat3Max || 40,
          cat4Max: firstStudentMarks.cat4Max || 40,
          cat5Max: firstStudentMarks.cat5Max || 40,
          examMax: firstStudentMarks.examMax || 100
        });
      }

      // Determine catsCount based on any student having data in catN.
      let maxCat = 0;
      students.forEach(s => {
        const sm = subjectMarks[s.id];
        if (sm) {
          if (sm.cat5 !== null) maxCat = Math.max(maxCat, 5);
          else if (sm.cat4 !== null) maxCat = Math.max(maxCat, 4);
          else if (sm.cat3 !== null) maxCat = Math.max(maxCat, 3);
          else if (sm.cat2 !== null) maxCat = Math.max(maxCat, 2);
          else if (sm.cat1 !== null) maxCat = Math.max(maxCat, 1);
        }
      });
      // Only update if we found marks, otherwise keep current (don't reset to 0 if we already added columns)
      if (maxCat > 0) setCatsCount(maxCat);
    }
  }, [students, activeSubjectId, subjectMarks]);

  const allFilled = students.every((s) => {
    const m = subjectMarks[s.id];
    const catsFilled = Array.from({ length: catsCount }).every((_, i) => m && m[`cat${i + 1}` as keyof typeof m] !== null);
    return m && catsFilled && m.exam !== null;
  });

  const addCat = () => {
    if (catsCount < 5) setCatsCount(prev => prev + 1);
  };

  const removeCat = () => {
    if (catsCount > 0) setCatsCount(prev => prev - 1);
  };

  const updateConfig = (key: string, val: string) => {
    const n = parseInt(val) || 0;
    setCatConfigs(prev => ({ ...prev, [key]: n }));
    if (onConfigUpdate) onConfigUpdate(activeSubjectId, key, n);
  };

  return (
    <div className={styles.anim}>
      <div className={styles.sectionHeader}>
        <div>
          <p className={styles.sectionEyebrow}>{mode === "class" ? "Class Management" : "Mark Entry"}</p>
          <h2 className={styles.sectionTitle}>{mode === "class" ? "Detailed Class Marks" : "Enter & Push Marks"}</h2>
          <p className={styles.sectionSub}>
            {currentSubject?.name} · {currentSubject?.grade} · Term 1, 2024
          </p>
        </div>
        <select
          className={styles.dhInput}
          value={activeSubjectId}
          onChange={(e) => onSubjectChange(e.target.value)}
        >
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} – {s.grade}
            </option>
          ))}
        </select>
      </div>

      {mode === "subject" && onPushMarks && (
        <div className={styles.pushBanner}>
          <div>
            <p style={{ fontSize: "10px", fontWeight: 700, color: "var(--gold)", textTransform: "uppercase", margin: "0 0 2px" }}>
              Marks status
            </p>
            <h3 style={{ fontFamily: "var(--serif)", fontSize: "1.1rem", color: "#fdf9f2", margin: 0 }}>
              {pushedSubjects.has(activeSubjectId) ? "Marks pushed to class teacher" : "Ready to push marks when complete"}
            </h3>
          </div>
          <button
            className={styles.btnPrimary}
            disabled={!allFilled}
            onClick={() => onPushMarks(activeSubjectId)}
            style={!allFilled ? { opacity: 0.5, cursor: "not-allowed" } : {}}
          >
            {pushedSubjects.has(activeSubjectId) ? "Re-push Marks" : "Push to Class Teacher"}
          </button>
        </div>
      )}

      <div className={styles.card}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.9rem" }}>
          <p className={styles.cardLabel} style={{ margin: 0, flex: 1 }}>
            {students.length} learners · {catsCount === 0 ? "No CATs" : Array.from({ length: catsCount }).map((_, i) => `CAT ${i + 1}`).join(" · ")} · Exam
          </p>
          <div style={{ display: "flex", gap: 10 }}>
            <button className={styles.btnAdd} onClick={addCat} disabled={catsCount >= 5}>+ CAT</button>
            <button className={styles.btnAdd} onClick={removeCat} disabled={catsCount <= 0} style={{ borderColor: "var(--dText)", color: "var(--dText)" }}>- CAT</button>
            <button className={styles.btnGhost} onClick={() => onSaveMarks(activeSubjectId, catConfigs)}>
              Save Progress
            </button>
          </div>
        </div>

        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Student</th>
                <th>Adm. No</th>
                {Array.from({ length: catsCount }).map((_, i) => {
                  const key = `cat${i + 1}Max`;
                  return (
                    <th key={i}>
                      CAT {i + 1}
                      <div style={{ marginTop: 4 }}>
                        <input
                          type="number"
                          className={styles.maxInput}
                          value={catConfigs[key]}
                          onChange={(e) => updateConfig(key, e.target.value)}
                        />
                      </div>
                    </th>
                  );
                })}
                <th>
                  Exam
                  <div style={{ marginTop: 4 }}>
                    <input
                      type="number"
                      className={styles.maxInput}
                      value={catConfigs.examMax}
                      onChange={(e) => updateConfig("examMax", e.target.value)}
                    />
                  </div>
                </th>
                <th>Total</th>
                <th>Final (%)</th>
                {mode === "subject" && <th>Status</th>}
              </tr>
            </thead>
            <tbody>
              {students.map((student) => {
                const marks = subjectMarks[student.id] || {
                  cat1: null, cat2: null, cat3: null, cat4: null, cat5: null, exam: null, finalScore: null
                };
                
                let catsSum: number | null = null;
                if (catsCount > 0) {
                  catsSum = Array.from({ length: catsCount }).reduce((sum: number | null, _, i) => {
                    const val = marks[`cat${i + 1}` as keyof typeof marks];
                    if (val === null || val === "") return sum;
                    return (sum === null) ? Number(val) : (sum + Number(val));
                  }, null);
                }

                let total: number | null = null;
                if (catsCount === 0) {
                  total = (marks.exam !== null && marks.exam !== "") ? Number(marks.exam) : null;
                } else {
                  total = (catsSum !== null && marks.exam !== null && marks.exam !== "") ? catsSum + Number(marks.exam) : null;
                }
                const pushed = pushedStudents.has(student.id);

                return (
                  <tr key={student.id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div dangerouslySetInnerHTML={{ __html: avatar(student.name, 26) }} />
                        <span style={{ fontWeight: 600, color: "var(--text)" }}>{student.name}</span>
                      </div>
                    </td>
                    <td style={{ color: "var(--textMut)", fontSize: "12px" }}>{student.adm}</td>
                    {Array.from({ length: catsCount }).map((_, i) => (
                      <td key={i}>
                        <input
                          className={styles.markInput}
                          type="number" min="0" max={catConfigs[`cat${i + 1}Max`]}
                          value={marks[`cat${i + 1}` as keyof typeof marks] ?? ""}
                          placeholder="–"
                          onChange={(e) => onMarkUpdate(activeSubjectId, student.id, `cat${i + 1}`, e.target.value)}
                        />
                      </td>
                    ))}
                    <td>
                      <input
                        className={styles.markInput}
                        type="number" min="0" max={catConfigs.examMax}
                        value={marks.exam ?? ""}
                        placeholder="–"
                        onChange={(e) => onMarkUpdate(activeSubjectId, student.id, "exam", e.target.value)}
                      />
                    </td>
                    <td>
                      {total !== null ? <span style={{ fontFamily: "var(--serif)", fontSize: "15px", fontWeight: 600 }}>{total}</span> : <span style={{ color: "var(--textF)" }}>–</span>}
                    </td>
                    <td>
                      {mode === "class" ? (
                        <input
                          className={styles.markInput}
                          type="number" min="0" max="100"
                          value={marks.finalScore ?? ""}
                          placeholder={total !== null ? Math.round(total / (Array.from({length: catsCount}).reduce((a, _, i) => a + catConfigs[`cat${i+1}Max`], 0) + catConfigs.examMax) * 100).toString() : "–"}
                          onChange={(e) => onMarkUpdate(activeSubjectId, student.id, "finalScore", e.target.value)}
                          style={{ borderColor: "var(--gold)", fontWeight: 700 }}
                        />
                      ) : (
                        marks.finalScore !== null ? (
                          <span style={{ fontFamily: "var(--serif)", fontSize: "15px", fontWeight: 700, color: "var(--gold)" }}>{marks.finalScore}%</span>
                        ) : (
                          <span style={{ color: "var(--textF)", fontSize: "11px" }}>Pending</span>
                        )
                      )}
                    </td>
                    {mode === "subject" && (
                      <td>
                        <span className={styles.pill} style={{ background: pushed ? "var(--sBg)" : "var(--wBg)", color: pushed ? "var(--sText)" : "var(--wText)" }}>
                          {pushed ? "Pushed" : "Draft"}
                        </span>
                      </td>
                    )}
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
