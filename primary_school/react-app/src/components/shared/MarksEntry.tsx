import React, { useEffect, useState } from "react";
import styles from "./MarksEntry.module.css";
import { Subject, Student, MarksData } from "../subjectteacher/types";
import { formatSubjectOfferingTag } from "../../lib/subjectEnrollment";

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
  onSaveMarks: (subjectId: string, catConfigs?: Record<string, number | string | null>) => void;
  onPushMarks?: (subjectId: string) => void;
  onConfigUpdate?: (subjectId: string, key: string, value: number | string | null) => void;
  onRemoveCat?: (subjectId: string, catIndex: number) => void;
  avatar: (name: string, size: number) => string;
  term?: number;
  year?: number;
  examType?: string;
  onTermChange?: (term: number) => void;
  onExamTypeChange?: (type: string) => void;
}

type MarkRow = Student["marks"];
type CatKey = "cat1" | "cat2" | "cat3" | "cat4" | "cat5";
type ConfigKey = "cat1Max" | "cat2Max" | "cat3Max" | "cat4Max" | "cat5Max" | "examMax";

const createEmptyMarks = (): MarkRow => ({
  cat1: null,
  cat2: null,
  cat3: null,
  cat4: null,
  cat5: null,
  cat1Max: 40,
  cat2Max: 40,
  cat3Max: 40,
  cat4Max: 40,
  cat5Max: 40,
  exam: null,
  examMax: 100,
  finalScore: null,
});

const getCatKey = (index: number) => `cat${index}` as CatKey;
const getCatMaxKey = (index: number) => `cat${index}Max` as ConfigKey;

const preventNumberWheelChange = (event: React.WheelEvent<HTMLInputElement>) => {
  event.currentTarget.blur();
};

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
  onRemoveCat,
  avatar,
  term,
  year,
  examType,
  onTermChange,
  onExamTypeChange,
}) => {
  const currentSubject = subjects.find((subject) => subject.id === activeSubjectId) || subjects[0] || null;
  const subjectMarks = marksData[activeSubjectId] || {};
  const currentSubjectLabel = currentSubject?.displayName || currentSubject?.name || "";
  const showEnrollmentSubjectColumn = students.some((student) => Boolean(student.enrollmentSubjectName));

  const [catsCount, setCatsCount] = useState(0);
  const [catConfigs, setCatConfigs] = useState<Record<ConfigKey, number | string | null>>({
    cat1Max: 40,
    cat2Max: 40,
    cat3Max: 40,
    cat4Max: 40,
    cat5Max: 40,
    examMax: 100,
  });

  useEffect(() => {
    if (students.length === 0) {
      setCatsCount(0);
      return;
    }

    const firstStudentMarks = subjectMarks[students[0]?.id || ""];
    if (firstStudentMarks) {
      const nextConfigs: Record<ConfigKey, number | string | null> = {
        cat1Max: firstStudentMarks.cat1Max ?? 40,
        cat2Max: firstStudentMarks.cat2Max ?? 40,
        cat3Max: firstStudentMarks.cat3Max ?? 40,
        cat4Max: firstStudentMarks.cat4Max ?? 40,
        cat5Max: firstStudentMarks.cat5Max ?? 40,
        examMax: firstStudentMarks.examMax ?? 100,
      };

      setCatConfigs((previous) =>
        JSON.stringify(previous) === JSON.stringify(nextConfigs) ? previous : nextConfigs,
      );
    }

    let maxCat = 0;
    students.forEach((student) => {
      const studentMarks = subjectMarks[student.id];
      if (!studentMarks) {
        return;
      }

      if (studentMarks.cat5 !== null && studentMarks.cat5 !== undefined) maxCat = Math.max(maxCat, 5);
      else if (studentMarks.cat4 !== null && studentMarks.cat4 !== undefined) maxCat = Math.max(maxCat, 4);
      else if (studentMarks.cat3 !== null && studentMarks.cat3 !== undefined) maxCat = Math.max(maxCat, 3);
      else if (studentMarks.cat2 !== null && studentMarks.cat2 !== undefined) maxCat = Math.max(maxCat, 2);
      else if (studentMarks.cat1 !== null && studentMarks.cat1 !== undefined) maxCat = Math.max(maxCat, 1);
    });

    setCatsCount(maxCat);
  }, [students, subjectMarks]);

  const allFilled = students.every((student) => {
    const marks = subjectMarks[student.id];
    const catsFilled = Array.from({ length: catsCount }).every((_, index) => {
      const key = getCatKey(index + 1);
      return marks && marks[key] !== null;
    });
    return Boolean(marks) && catsFilled && marks.exam !== null;
  });

  const addCat = () => {
    if (catsCount < 5) {
      setCatsCount((previous) => previous + 1);
    }
  };

  const removeCat = () => {
    if (catsCount <= 0) {
      return;
    }

    onRemoveCat?.(activeSubjectId, catsCount);
    setCatsCount((previous) => previous - 1);
  };

  const updateConfig = (key: ConfigKey, rawValue: string) => {
    let nextValue: number | string | null = rawValue;
    if (nextValue === "") {
      nextValue = null;
    } else {
      const numericValue = Number(nextValue);
      nextValue = Number.isNaN(numericValue) ? null : Math.max(0, numericValue);
    }

    setCatConfigs((previous) => ({ ...previous, [key]: nextValue }));
    onConfigUpdate?.(activeSubjectId, key, nextValue);
  };

  return (
    <div className={styles.anim}>
      <div className={styles.sectionHeader}>
        <div>
          <p className={styles.sectionEyebrow}>
            {mode === "class" ? "Class Management" : "Mark Entry"}
          </p>
          <h2 className={styles.sectionTitle}>
            {mode === "class" ? "Detailed Class Marks" : "Enter and Push Marks"}
          </h2>
          <p className={styles.sectionSub}>
            {[currentSubjectLabel, currentSubject?.grade, `Term ${term}`, `${year}`, examType]
              .filter(Boolean)
              .join(" | ")}
          </p>
          {currentSubject && (
            <p className={styles.sectionSub} style={{ marginTop: 6 }}>
              {formatSubjectOfferingTag(currentSubject.enrollmentMode, currentSubject.sharedSlotId)} | {students.length} learner{students.length === 1 ? "" : "s"}
            </p>
          )}
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          {onTermChange && (
            <select
              className={styles.dhInput}
              value={term}
              onChange={(event) => onTermChange(Number(event.target.value))}
              style={{ width: 100 }}
              disabled
            >
              <option value={1}>Term 1</option>
              <option value={2}>Term 2</option>
              <option value={3}>Term 3</option>
            </select>
          )}
          {onExamTypeChange && (
            <select
              className={styles.dhInput}
              value={examType}
              onChange={(event) => onExamTypeChange(event.target.value)}
              style={{ width: 130 }}
              disabled
            >
              <option value="opener">Opener Exam</option>
              <option value="midterm">Mid Term</option>
              <option value="closing">Closing Exam</option>
            </select>
          )}
          <select
            className={styles.dhInput}
            value={activeSubjectId}
            onChange={(event) => onSubjectChange(event.target.value)}
          >
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {`${subject.displayName || subject.name} - ${subject.grade} - ${formatSubjectOfferingTag(subject.enrollmentMode, subject.sharedSlotId)}`}
              </option>
            ))}
          </select>
        </div>
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
            {students.length} learners | {catsCount === 0 ? "No CATs" : Array.from({ length: catsCount }).map((_, index) => `CAT ${index + 1}`).join(" | ")} | Exam
          </p>
          <div style={{ display: "flex", gap: 10 }}>
            <button className={styles.btnAdd} onClick={addCat} disabled={catsCount >= 5}>
              + CAT
            </button>
            <button
              className={styles.btnAdd}
              onClick={removeCat}
              disabled={catsCount <= 0}
              style={{ borderColor: "var(--dText)", color: "var(--dText)" }}
            >
              - CAT
            </button>
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
                {showEnrollmentSubjectColumn && <th>Subject</th>}
                {Array.from({ length: catsCount }).map((_, index) => {
                  const key = getCatMaxKey(index + 1);
                  return (
                    <th key={key}>
                      CAT {index + 1}
                      <div style={{ marginTop: 4 }}>
                        <input
                          type="number"
                          inputMode="numeric"
                          className={styles.maxInput}
                          value={catConfigs[key] ?? ""}
                          onWheel={preventNumberWheelChange}
                          onChange={(event) => updateConfig(key, event.target.value)}
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
                      inputMode="numeric"
                      className={styles.maxInput}
                      value={catConfigs.examMax ?? ""}
                      onWheel={preventNumberWheelChange}
                      onChange={(event) => updateConfig("examMax", event.target.value)}
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
                const marks = (subjectMarks[student.id] || createEmptyMarks()) as MarkRow;

                let maxTotal = Number(catConfigs.examMax) || 0;
                for (let index = 0; index < catsCount; index += 1) {
                  maxTotal += Number(catConfigs[getCatMaxKey(index + 1)]) || 0;
                }

                let catsSum: number | null = null;
                if (catsCount > 0) {
                  for (let index = 0; index < catsCount; index += 1) {
                    const value = marks[getCatKey(index + 1)];
                    if (value !== null && value !== "") {
                      catsSum = (catsSum === null ? 0 : catsSum) + Number(value);
                    }
                  }
                }

                const total =
                  catsCount === 0
                    ? marks.exam !== null && marks.exam !== ""
                      ? Number(marks.exam)
                      : null
                    : catsSum !== null && marks.exam !== null && marks.exam !== ""
                      ? catsSum + Number(marks.exam)
                      : null;
                const calculatedPercentage =
                  total !== null && maxTotal > 0 ? Math.round((total / maxTotal) * 100) : null;
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
                    {showEnrollmentSubjectColumn && (
                      <td style={{ color: "var(--textMut)", fontSize: "12px" }}>
                        {student.enrollmentSubjectName || "-"}
                      </td>
                    )}
                    {Array.from({ length: catsCount }).map((_, index) => {
                      const key = getCatKey(index + 1);
                      return (
                        <td key={key}>
                          <input
                            className={styles.markInput}
                            type="number"
                            min="0"
                            max={Number(catConfigs[getCatMaxKey(index + 1)] || 0)}
                            inputMode="decimal"
                            value={marks[key] ?? ""}
                            placeholder="-"
                            onWheel={preventNumberWheelChange}
                            onChange={(event) => onMarkUpdate(activeSubjectId, student.id, key, event.target.value)}
                          />
                        </td>
                      );
                    })}
                    <td>
                      <input
                        className={styles.markInput}
                        type="number"
                        min="0"
                        max={Number(catConfigs.examMax || 0)}
                        inputMode="decimal"
                        value={marks.exam ?? ""}
                        placeholder="-"
                        onWheel={preventNumberWheelChange}
                        onChange={(event) => onMarkUpdate(activeSubjectId, student.id, "exam", event.target.value)}
                      />
                    </td>
                    <td>
                      {total !== null ? (
                        <span style={{ fontFamily: "var(--serif)", fontSize: "15px", fontWeight: 600 }}>{total}</span>
                      ) : (
                        <span style={{ color: "var(--textF)" }}>-</span>
                      )}
                    </td>
                    <td>
                      {mode === "class" ? (
                        <input
                          className={styles.markInput}
                          type="number"
                          min="0"
                          max="100"
                          inputMode="decimal"
                          value={marks.finalScore ?? ""}
                          placeholder={calculatedPercentage !== null ? calculatedPercentage.toString() : "-"}
                          onWheel={preventNumberWheelChange}
                          onChange={(event) => onMarkUpdate(activeSubjectId, student.id, "finalScore", event.target.value)}
                          style={{ borderColor: "var(--gold)", fontWeight: 700 }}
                        />
                      ) : marks.finalScore !== null || calculatedPercentage !== null ? (
                        <span style={{ fontFamily: "var(--serif)", fontSize: "15px", fontWeight: 700, color: "var(--gold)" }}>
                          {marks.finalScore !== null ? marks.finalScore : calculatedPercentage}%
                        </span>
                      ) : (
                        <span style={{ color: "var(--textF)", fontSize: "11px" }}>Pending</span>
                      )}
                    </td>
                    {mode === "subject" && (
                      <td>
                        <span
                          className={styles.pill}
                          style={{
                            background: pushed ? "var(--sBg)" : "var(--wBg)",
                            color: pushed ? "var(--sText)" : "var(--wText)",
                          }}
                        >
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
