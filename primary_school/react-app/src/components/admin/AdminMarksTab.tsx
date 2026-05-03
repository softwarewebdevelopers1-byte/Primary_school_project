import React, { useEffect, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { api } from "../../lib/api";
import { C } from "../classteacher/shared/constants";
import { MarksEntry } from "../shared/MarksEntry";
import {
  MarksData,
  Subject as MarksSubject,
  Student as MarksStudent,
} from "../subjectteacher/types";
import { Class, Student, Subject } from "./types";

interface AdminMarksTabProps {
  classes: Class[];
  students: Student[];
  subjects: Subject[];
  onRefresh: () => Promise<void>;
  avatar: (name: string, size: number) => string;
}

interface ClassPerformanceRow {
  id: string;
  name: string;
  admissionNo: string;
  marks: Record<string, number | null>;
  total: number;
  scoredSubjects: number;
  average: number;
  rank: number;
}

const panelStyle: React.CSSProperties = {
  background: "var(--white)",
  border: "1px solid var(--border)",
  borderRadius: 13,
  padding: "1.1rem 1.2rem",
};

const statBoxStyle: React.CSSProperties = {
  background: "var(--sand)",
  border: "1px solid var(--border)",
  borderRadius: 10,
  padding: "10px 12px",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  border: "1.5px solid var(--border)",
  borderRadius: 8,
  fontSize: 13.5,
  color: "var(--text)",
  background: "var(--cream)",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 11,
  fontWeight: 700,
  color: "var(--textMut)",
  textTransform: "uppercase",
  letterSpacing: ".05em",
  marginBottom: 6,
};

const toFiniteNumber = (value: unknown): number | null => {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const numericValue =
    typeof value === "number"
      ? value
      : Number(typeof value === "string" ? value.trim() : value);

  return Number.isFinite(numericValue) ? numericValue : null;
};

const computeMarkPercentage = (marks: any): number | null => {
  const finalScore = toFiniteNumber(marks?.finalScore);
  if (finalScore !== null) {
    return Math.min(100, Math.max(0, Math.round(finalScore)));
  }

  const cats = [marks?.cat1, marks?.cat2, marks?.cat3, marks?.cat4, marks?.cat5];
  const catMaxes = [
    marks?.cat1Max,
    marks?.cat2Max,
    marks?.cat3Max,
    marks?.cat4Max,
    marks?.cat5Max,
  ];
  const exam = toFiniteNumber(marks?.exam);
  const examMax = toFiniteNumber(marks?.examMax) ?? 100;
  let totalScore = 0;
  let totalMax = 0;

  cats.forEach((cat, index) => {
    const score = toFiniteNumber(cat);
    if (score !== null) {
      totalScore += score;
      totalMax += toFiniteNumber(catMaxes[index]) ?? 40;
    }
  });

  if (exam !== null) {
    totalScore += exam;
    totalMax += examMax;
  }

  if (totalMax <= 0) {
    return null;
  }

  return Math.round((totalScore / totalMax) * 100);
};

const gradeFromAverage = (average: number): string => {
  if (average >= 80) return "A";
  if (average >= 75) return "A-";
  if (average >= 70) return "B+";
  if (average >= 65) return "B";
  if (average >= 60) return "B-";
  if (average >= 55) return "C+";
  if (average >= 50) return "C";
  if (average >= 45) return "C-";
  if (average >= 40) return "D+";
  if (average >= 35) return "D";
  if (average >= 30) return "D-";
  return "E";
};

const hasAnyStoredValue = (marks: {
  cat1: number | string | null;
  cat2: number | string | null;
  cat3: number | string | null;
  cat4: number | string | null;
  cat5: number | string | null;
  exam: number | string | null;
  finalScore: number | string | null;
}) =>
  [
    marks.cat1,
    marks.cat2,
    marks.cat3,
    marks.cat4,
    marks.cat5,
    marks.exam,
    marks.finalScore,
  ].some((value) => value !== null && value !== "");

export const AdminMarksTab: React.FC<AdminMarksTabProps> = ({
  classes,
  students,
  subjects,
  onRefresh,
  avatar,
}) => {
  const [selectedClassId, setSelectedClassId] = useState(() => {
    const selectedClass = sessionStorage.getItem("selectedClass");
    return selectedClass ? JSON.parse(selectedClass) : "";
  });
  const [activeSubjectId, setActiveSubjectId] = useState("");
  const [marksData, setMarksData] = useState<MarksData>({});
  const [subjectStudents, setSubjectStudents] = useState<
    Record<string, MarksStudent[]>
  >({});
  const [isDownloadingGradeReport, setIsDownloadingGradeReport] =
    useState(false);
  const [isDownloadingClassReport, setIsDownloadingClassReport] =
    useState(false);
  const [classPerformanceRows, setClassPerformanceRows] = useState<
    ClassPerformanceRow[]
  >([]);
  const [isLoadingClassPerformance, setIsLoadingClassPerformance] =
    useState(false);
  const [message, setMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  useEffect(() => {
    if (selectedClassId || classes.length === 0) {
      return;
    }

    const preferredClass =
      classes.find(
        (currentClass) =>
          currentClass.students > 0 &&
          currentClass.offeredSubjectIds.length > 0,
      ) || classes[0];
    setSelectedClassId(() => {
      let updated = preferredClass.id;
      sessionStorage.setItem("selectedClass", JSON.stringify(updated));
      return updated;
    });
  }, [classes, selectedClassId]);

  const currentClass =
    classes.find((current) => current.id === selectedClassId) || classes[0];
  const availableSubjects = currentClass
    ? subjects.filter((subject) =>
        currentClass.offeredSubjectIds.includes(subject.id),
      )
    : [];
  const classStudents = currentClass
    ? students.filter((student) => student.classId === currentClass.id)
    : [];
  const availableSubjectIdsKey = availableSubjects
    .map((subject) => subject.id)
    .join("|");

  useEffect(() => {
    if (availableSubjects.length === 0) {
      if (activeSubjectId) {
        setActiveSubjectId("");
      }
      return;
    }

    if (!availableSubjects.some((subject) => subject.id === activeSubjectId)) {
      setActiveSubjectId(availableSubjects[0].id);
    }
  }, [activeSubjectId, availableSubjects]);

  useEffect(() => {
    setMarksData({});
    setSubjectStudents({});
  }, [
    selectedClassId,
    currentClass?.term,
    currentClass?.year,
    currentClass?.examType,
  ]);

  useEffect(() => {
    if (!currentClass || !activeSubjectId) {
      return;
    }

    let ignore = false;

    const loadDetailedMarks = async () => {
      try {
        const data: any[] = await api.get("/marks", {
          subjectId: activeSubjectId,
          classGrade: currentClass.grade,
          classStream: currentClass.stream || "",
          term: currentClass.term,
          year: currentClass.year,
          examType: currentClass.examType,
        });

        if (ignore) {
          return;
        }

        setMarksData((prev) => ({
          ...prev,
          [activeSubjectId]: data.reduce((acc, item) => {
            acc[item.studentId.toString()] = item.marks;
            return acc;
          }, {} as any),
        }));
        setSubjectStudents((prev) => ({
          ...prev,
          [activeSubjectId]: data.map((item) => ({
            id: item.studentId.toString(),
            name: item.name,
            adm: item.admissionNo,
            gender: item.gender || "N/A",
            enrolledSubjects: item.enrolledSubjects || [],
            marks: item.marks,
            pushed: false,
          })),
        }));
      } catch (error: any) {
        if (!ignore) {
          setMessage({
            text:
              error?.message || "Unable to load marks for the selected class.",
            type: "error",
          });
        }
      }
    };

    void loadDetailedMarks();

    return () => {
      ignore = true;
    };
  }, [activeSubjectId, currentClass]);

  const handleMarkUpdate = (
    subjectId: string,
    studentId: string,
    key: string,
    value: string,
  ) => {
    setMarksData((prev) => {
      const updatedSubjectMarks = { ...(prev[subjectId] || {}) };
      const updatedStudentMarks = {
        ...(updatedSubjectMarks[studentId] || {
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
        }),
      };

      let nextValue: string | number | null = value;
      if (nextValue === "") {
        nextValue = null;
      } else {
        const numericValue = Number(nextValue);
        if (!Number.isNaN(numericValue)) {
          const maxKey = `${key}Max`;
          const maxValue =
            key === "finalScore"
              ? 100
              : (updatedStudentMarks as any)[maxKey] ||
                (key === "exam" ? 100 : 40);

          if (numericValue > maxValue) {
            nextValue = maxValue;
          } else if (numericValue < 0) {
            nextValue = 0;
          }
        } else {
          nextValue = null;
        }
      }

      (updatedStudentMarks as any)[key] = nextValue;
      updatedSubjectMarks[studentId] = updatedStudentMarks;

      return {
        ...prev,
        [subjectId]: updatedSubjectMarks,
      };
    });
  };

  const handleConfigUpdate = (
    subjectId: string,
    key: string,
    value: number | string | null,
  ) => {
    setMarksData((prev) => {
      const updated = { ...prev };
      if (!updated[subjectId]) {
        return prev;
      }

      const updatedSubjectMarks = { ...updated[subjectId] };
      Object.keys(updatedSubjectMarks).forEach((studentId) => {
        updatedSubjectMarks[studentId] = {
          ...updatedSubjectMarks[studentId],
          [key]: value,
        };
      });

      updated[subjectId] = updatedSubjectMarks;
      return updated;
    });
  };

  const handleRemoveCat = (subjectId: string, catIndex: number) => {
    setMarksData((prev) => {
      const updatedSubjectMarks = { ...(prev[subjectId] || {}) };
      Object.keys(updatedSubjectMarks).forEach((studentId) => {
        updatedSubjectMarks[studentId] = {
          ...updatedSubjectMarks[studentId],
          [`cat${catIndex}`]: null,
          [`cat${catIndex}Max`]: 40,
        };
      });

      return {
        ...prev,
        [subjectId]: updatedSubjectMarks,
      };
    });
  };

  const handleSaveMarks = async (subjectId: string, catConfigs?: any) => {
    if (!currentClass) {
      return;
    }

    const subjectMarks = marksData[subjectId];
    if (!subjectMarks) {
      return;
    }

    setMessage(null);

    try {
      const detailedMarks = Object.entries(subjectMarks).map(
        ([studentId, marks]) => ({
          studentId,
          ...marks,
        }),
      );

      const summaryMarks = detailedMarks
        .filter((marks) => hasAnyStoredValue(marks))
        .map((marks) => ({
          studentId: marks.studentId,
          subjectId,
          finalScore: marks.finalScore,
        }));

      await api.post("/marks/save", {
        subjectId,
        classGrade: currentClass.grade,
        classStream: currentClass.stream || "",
        term: currentClass.term,
        year: currentClass.year,
        examType: currentClass.examType,
        marksData: detailedMarks,
        catConfigs,
      });

      if (summaryMarks.length > 0) {
        await api.post("/marks/summary-save", {
          classGrade: currentClass.grade,
          classStream: currentClass.stream || "",
          term: currentClass.term,
          year: currentClass.year,
          examType: currentClass.examType,
          marksData: summaryMarks,
        });
      }

      setMessage({ text: "Marks updated successfully.", type: "success" });
      await onRefresh();
    } catch (error: any) {
      setMessage({
        text: `Failed to save marks: ${error.message}`,
        type: "error",
      });
    }
  };

  const activeSubjectStudents = subjectStudents[activeSubjectId] || [];

  const buildCurrentClassPerformanceRows = async () => {
    if (!currentClass) {
      return [];
    }

    const rowsByStudent = new Map<string, ClassPerformanceRow>();
    classStudents.forEach((student) => {
      rowsByStudent.set(student.id, {
        id: student.id,
        name: student.name,
        admissionNo: student.admissionNo,
        marks: {},
        total: 0,
        scoredSubjects: 0,
        average: 0,
        rank: 0,
      });
    });

    for (const subject of availableSubjects) {
      const data: any[] = await api.get("/marks", {
        subjectId: subject.id,
        classGrade: currentClass.grade,
        classStream: currentClass.stream || "",
        term: currentClass.term,
        year: currentClass.year,
        examType: currentClass.examType,
      });

      data.forEach((item) => {
        const studentId = item.studentId?.toString();
        const row = rowsByStudent.get(studentId);
        if (!row) {
          return;
        }

        row.marks[subject.id] = computeMarkPercentage(item.marks);
      });
    }

    const rankedRows = Array.from(rowsByStudent.values())
      .map((row) => {
        const scoredMarks = Object.values(row.marks).filter(
          (mark): mark is number => typeof mark === "number",
        );
        const total = scoredMarks.reduce((sum, mark) => sum + mark, 0);
        const average =
          scoredMarks.length > 0 ? Math.round(total / scoredMarks.length) : 0;

        return {
          ...row,
          total,
          scoredSubjects: scoredMarks.length,
          average,
        };
      })
      .sort((first, second) => {
        if (second.average !== first.average) {
          return second.average - first.average;
        }
        if (second.total !== first.total) {
          return second.total - first.total;
        }
        return first.name.localeCompare(second.name);
      });

    let currentRank = 0;
    let previousAverage: number | null = null;
    let previousTotal: number | null = null;

    rankedRows.forEach((row) => {
      if (row.average !== previousAverage || row.total !== previousTotal) {
        currentRank += 1;
        previousAverage = row.average;
        previousTotal = row.total;
      }

      row.rank = currentRank;
    });

    return rankedRows;
  };

  useEffect(() => {
    if (!currentClass || classStudents.length === 0 || availableSubjects.length === 0) {
      setClassPerformanceRows([]);
      return;
    }

    let ignore = false;

    const loadClassPerformance = async () => {
      setIsLoadingClassPerformance(true);
      try {
        const rows = await buildCurrentClassPerformanceRows();
        if (!ignore) {
          setClassPerformanceRows(rows);
        }
      } catch (error: any) {
        if (!ignore) {
          setMessage({
            text:
              error?.message ||
              "Unable to load the overall class performance summary.",
            type: "error",
          });
        }
      } finally {
        if (!ignore) {
          setIsLoadingClassPerformance(false);
        }
      }
    };

    void loadClassPerformance();

    return () => {
      ignore = true;
    };
  }, [
    currentClass?.id,
    currentClass?.term,
    currentClass?.year,
    currentClass?.examType,
    availableSubjectIdsKey,
    students,
  ]);

  const handleDownloadClassReport = async () => {
    if (!currentClass) {
      return;
    }

    if (classStudents.length === 0 || availableSubjects.length === 0) {
      setMessage({
        text: "There are no students or active subjects to download for this class.",
        type: "error",
      });
      return;
    }

    setIsDownloadingClassReport(true);
    setMessage(null);

    try {
      const rows =
        classPerformanceRows.length > 0
          ? classPerformanceRows
          : await buildCurrentClassPerformanceRows();
      const classLabel = `Grade ${currentClass.grade}${
        currentClass.stream ? ` ${currentClass.stream}` : ""
      }`;
      const cycleLabel = `Term ${currentClass.term || 1}, ${
        currentClass.year || new Date().getFullYear()
      } (${(currentClass.examType || "opener").toUpperCase()})`;
      const doc = new jsPDF("landscape");

      doc.setFontSize(16);
      doc.text(`${classLabel} Overall Performance`, 14, 15);
      doc.setFontSize(10);
      doc.text(cycleLabel, 14, 22);
      doc.text(`Generated on ${new Date().toLocaleDateString()}`, 14, 28);

      autoTable(doc, {
        head: [
          [
            "Rank",
            "Student",
            "Admission No",
            ...availableSubjects.map((subject) => subject.name),
            "Total",
            "Avg",
            "Grade",
          ],
        ],
        body: rows.map((row) => [
          row.rank,
          row.name,
          row.admissionNo || "-",
          ...availableSubjects.map((subject) => {
            const mark = row.marks[subject.id];
            return typeof mark === "number" ? mark : "-";
          }),
          row.total,
          `${row.average}%`,
          gradeFromAverage(row.average),
        ]),
        startY: 34,
        theme: "grid",
        styles: { fontSize: 8 },
        headStyles: { fillColor: [201, 150, 61] },
      });

      doc.save(
        `Grade_${currentClass.grade}_${currentClass.stream || "Class"}_Performance_${Date.now()}.pdf`,
      );
      setMessage({
        text: `Downloaded ${classLabel} overall performance.`,
        type: "success",
      });
    } catch (error: any) {
      setMessage({
        text: error?.message || "Failed to download the class report.",
        type: "error",
      });
    } finally {
      setIsDownloadingClassReport(false);
    }
  };

  const handleDownloadGradeReport = async () => {
    if (!currentClass) {
      return;
    }

    const gradeClasses = classes.filter(
      (classItem) => classItem.grade === currentClass.grade,
    );
    const gradeStudents = students.filter(
      (student) => student.classGrade === currentClass.grade,
    );
    const gradeSubjectIds = Array.from(
      new Set(gradeClasses.flatMap((classItem) => classItem.offeredSubjectIds)),
    );
    const gradeSubjects = gradeSubjectIds
      .map((subjectId) => subjects.find((subject) => subject.id === subjectId))
      .filter((subject): subject is Subject => Boolean(subject));

    if (gradeStudents.length === 0 || gradeSubjects.length === 0) {
      setMessage({
        text: "There are no students or active subjects to download for this grade.",
        type: "error",
      });
      return;
    }

    setIsDownloadingGradeReport(true);
    setMessage(null);

    try {
      const rowsByStudent = new Map<
        string,
        {
          id: string;
          name: string;
          admissionNo: string;
          stream: string;
          marks: Record<string, number | null>;
          total: number;
          scoredSubjects: number;
          average: number;
          rank: number;
        }
      >();

      gradeStudents.forEach((student) => {
        rowsByStudent.set(student.id, {
          id: student.id,
          name: student.name,
          admissionNo: student.admissionNo,
          stream: student.classStream || "",
          marks: {},
          total: 0,
          scoredSubjects: 0,
          average: 0,
          rank: 0,
        });
      });

      for (const classItem of gradeClasses) {
        for (const subjectId of classItem.offeredSubjectIds) {
          const data: any[] = await api.get("/marks", {
            subjectId,
            classGrade: classItem.grade,
            classStream: classItem.stream || "",
            term: currentClass.term,
            year: currentClass.year,
            examType: currentClass.examType,
          });

          data.forEach((item) => {
            const studentId = item.studentId?.toString();
            const row = rowsByStudent.get(studentId);
            if (!row) {
              return;
            }

            row.marks[subjectId] = computeMarkPercentage(item.marks);
          });
        }
      }

      const rankedRows = Array.from(rowsByStudent.values())
        .map((row) => {
          const scoredMarks = Object.values(row.marks).filter(
            (mark): mark is number => typeof mark === "number",
          );
          const total = scoredMarks.reduce((sum, mark) => sum + mark, 0);
          const average =
            scoredMarks.length > 0 ? Math.round(total / scoredMarks.length) : 0;

          return {
            ...row,
            total,
            scoredSubjects: scoredMarks.length,
            average,
          };
        })
        .sort((first, second) => {
          if (second.average !== first.average) {
            return second.average - first.average;
          }
          if (second.total !== first.total) {
            return second.total - first.total;
          }
          return first.name.localeCompare(second.name);
        });

      let currentRank = 0;
      let previousAverage: number | null = null;
      let previousTotal: number | null = null;

      rankedRows.forEach((row) => {
        if (row.average !== previousAverage || row.total !== previousTotal) {
          currentRank += 1;
          previousAverage = row.average;
          previousTotal = row.total;
        }

        row.rank = currentRank;
      });

      const doc = new jsPDF("landscape");
      const gradeLabel = `Grade ${currentClass.grade}`;
      const cycleLabel = `Term ${currentClass.term || 1}, ${
        currentClass.year || new Date().getFullYear()
      } (${(currentClass.examType || "opener").toUpperCase()})`;

      doc.setFontSize(16);
      doc.text(`${gradeLabel} Merit List - All Streams`, 14, 15);
      doc.setFontSize(10);
      doc.text(cycleLabel, 14, 22);
      doc.text(`Generated on ${new Date().toLocaleDateString()}`, 14, 28);

      autoTable(doc, {
        head: [
          [
            "Rank",
            "Student",
            "Admission No",
            "Stream",
            ...gradeSubjects.map((subject) => subject.name),
            "Total",
            "Avg",
            "Grade",
          ],
        ],
        body: rankedRows.map((row) => [
          row.rank,
          row.name,
          row.admissionNo || "-",
          row.stream || "-",
          ...gradeSubjects.map((subject) => {
            const mark = row.marks[subject.id];
            return typeof mark === "number" ? mark : "-";
          }),
          row.total,
          `${row.average}%`,
          gradeFromAverage(row.average),
        ]),
        startY: 34,
        theme: "grid",
        styles: { fontSize: 8 },
        headStyles: { fillColor: [201, 150, 61] },
      });

      doc.save(
        `Grade_${currentClass.grade}_All_Streams_Merit_List_${Date.now()}.pdf`,
      );
      setMessage({
        text: `Downloaded ${gradeLabel} marks for all streams.`,
        type: "success",
      });
    } catch (error: any) {
      setMessage({
        text: error?.message || "Failed to download the grade marks report.",
        type: "error",
      });
    } finally {
      setIsDownloadingGradeReport(false);
    }
  };

  const mappedStudents: MarksStudent[] = activeSubjectStudents.map(
    (student) => {
      const studentMarks = (marksData[activeSubjectId] &&
        marksData[activeSubjectId][student.id]) || {
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
      };

      return {
        ...student,
        marks: studentMarks,
        pushed: false,
      };
    },
  );

  const mappedSubjects: MarksSubject[] = availableSubjects.map((subject) => ({
    id: subject.id,
    name: subject.name,
    grade: currentClass?.name || "Selected class",
    subjectId: subject.id,
    classGrade: currentClass?.grade || "",
    classStream: currentClass?.stream || "",
    students: subjectStudents[subject.id]?.length ?? classStudents.length,
    avg: 0,
    pushed: false,
    term: currentClass?.term || 1,
    year: currentClass?.year || new Date().getFullYear(),
    lastAssess: "N/A",
    enrollmentMode:
      currentClass?.subjectSettings?.[subject.id]?.enrollmentMode ||
      "compulsory",
    sharedSlotId:
      currentClass?.subjectSettings?.[subject.id]?.sharedSlotId || null,
  }));
  const classScoredRows = classPerformanceRows.filter(
    (row) => row.scoredSubjects > 0,
  );
  const classAverage =
    classScoredRows.length > 0
      ? Math.round(
          classScoredRows.reduce((sum, row) => sum + row.average, 0) /
            classScoredRows.length,
        )
      : 0;
  const topClassStudent = classPerformanceRows.find(
    (row) => row.scoredSubjects > 0,
  );

  if (classes.length === 0) {
    return (
      <div style={{ ...panelStyle, textAlign: "center" }}>
        No classes are available yet.
      </div>
    );
  }

  return (
    <div className="anim" style={{ display: "grid", gap: 16 }}>
      <div style={{ display: "grid", gap: 6 }}>
        <p
          style={{
            fontSize: 10,
            fontWeight: 700,
            color: "var(--gold)",
            textTransform: "uppercase",
            letterSpacing: ".09em",
            margin: 0,
          }}
        >
          Marks desk
        </p>
        <h2
          style={{
            margin: 0,
            fontFamily: "var(--serif)",
            fontSize: "1.8rem",
            color: "var(--text)",
          }}
        >
          Admin marks management
        </h2>
        <p style={{ margin: 0, fontSize: 13, color: "var(--textMut)" }}>
          Review one class at a time, edit detailed marks, and update final
          percentages without leaving the admin workspace.
        </p>
        {currentClass ? (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 8 }}>
            <button
              type="button"
              onClick={handleDownloadClassReport}
              disabled={isDownloadingClassReport}
              style={{
                padding: "9px 14px",
                background: isDownloadingClassReport
                  ? "var(--sand)"
                  : "var(--gold)",
                color: isDownloadingClassReport ? "var(--textMut)" : "#fff",
                border: "1px solid var(--border)",
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 700,
                cursor: isDownloadingClassReport ? "wait" : "pointer",
              }}
            >
              {isDownloadingClassReport
                ? "Preparing download..."
                : `Download Grade ${currentClass.grade}${currentClass.stream || ""} results`}
            </button>
            <button
              type="button"
              onClick={handleDownloadGradeReport}
              disabled={isDownloadingGradeReport}
              style={{
                padding: "9px 14px",
                background: "var(--white)",
                color: "var(--text)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 700,
                cursor: isDownloadingGradeReport ? "wait" : "pointer",
              }}
            >
              {isDownloadingGradeReport
                ? "Preparing download..."
                : `Download Grade ${currentClass.grade} all streams`}
            </button>
          </div>
        ) : null}
      </div>

      <div
        style={{
          ...panelStyle,
          display: "grid",
          gridTemplateColumns:
            "minmax(220px, 320px) repeat(3, minmax(120px, 1fr))",
          gap: 12,
        }}
      >
        <label style={{ display: "grid", gap: 6 }}>
          <span style={labelStyle}>Class</span>
          <select
            value={currentClass?.id || ""}
            onChange={(event) =>
              setSelectedClassId(() => {
                let updated = event.target.value;
                sessionStorage.setItem(
                  "selectedClass",
                  JSON.stringify(updated),
                );
                return updated;
              })
            }
            style={inputStyle}
          >
            {classes.map((current) => (
              <option key={current.id} value={current.id}>
                {current.name}
              </option>
            ))}
          </select>
        </label>

        <div style={statBoxStyle}>
          <p style={labelStyle}>Students</p>
          <p
            style={{
              margin: 0,
              fontSize: 22,
              fontWeight: 700,
              color: "var(--text)",
            }}
          >
            {classStudents.length}
          </p>
        </div>

        <div style={statBoxStyle}>
          <p style={labelStyle}>Active subjects</p>
          <p
            style={{
              margin: 0,
              fontSize: 22,
              fontWeight: 700,
              color: "var(--text)",
            }}
          >
            {availableSubjects.length}
          </p>
        </div>

        <div style={statBoxStyle}>
          <p style={labelStyle}>Current cycle</p>
          <p
            style={{
              margin: 0,
              fontSize: 14,
              fontWeight: 700,
              color: "var(--text)",
            }}
          >
            T{currentClass?.term || 1}{" "}
            {currentClass?.year || new Date().getFullYear()}
          </p>
          <p
            style={{ margin: "4px 0 0", fontSize: 11, color: "var(--textMut)" }}
          >
            {(currentClass?.examType || "opener").toUpperCase()}
          </p>
        </div>
      </div>

      <div
        style={{
          ...panelStyle,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
          gap: 12,
        }}
      >
        <div style={statBoxStyle}>
          <p style={labelStyle}>Class average</p>
          <p
            style={{
              margin: 0,
              fontSize: 24,
              fontWeight: 800,
              color: "var(--text)",
            }}
          >
            {isLoadingClassPerformance ? "..." : `${classAverage}%`}
          </p>
        </div>
        <div style={statBoxStyle}>
          <p style={labelStyle}>Students with results</p>
          <p
            style={{
              margin: 0,
              fontSize: 24,
              fontWeight: 800,
              color: "var(--text)",
            }}
          >
            {isLoadingClassPerformance ? "..." : classScoredRows.length}
          </p>
        </div>
        <div style={statBoxStyle}>
          <p style={labelStyle}>Top learner</p>
          <p
            style={{
              margin: 0,
              fontSize: 15,
              fontWeight: 800,
              color: "var(--text)",
            }}
          >
            {isLoadingClassPerformance
              ? "Loading..."
              : topClassStudent
                ? `${topClassStudent.name} (${topClassStudent.average}%)`
                : "No marks yet"}
          </p>
        </div>
        <div style={statBoxStyle}>
          <p style={labelStyle}>Subjects counted</p>
          <p
            style={{
              margin: 0,
              fontSize: 24,
              fontWeight: 800,
              color: "var(--text)",
            }}
          >
            {availableSubjects.length}
          </p>
        </div>
      </div>

      {message ? (
        <div
          style={{
            padding: "10px 14px",
            borderRadius: 10,
            background: message.type === "success" ? C.greenLight : "#fdeaea",
            color: message.type === "success" ? C.successText : C.dangerText,
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          {message.text}
        </div>
      ) : null}

      {availableSubjects.length === 0 ? (
        <div
          style={{
            ...panelStyle,
            textAlign: "center",
            color: "var(--textMut)",
          }}
        >
          This class currently has no active subjects. Add one back from the
          assignments page to start entering marks.
        </div>
      ) : classStudents.length === 0 ? (
        <div
          style={{
            ...panelStyle,
            textAlign: "center",
            color: "var(--textMut)",
          }}
        >
          This class has no enrolled students yet, so there are no marks to
          manage.
        </div>
      ) : (
        <MarksEntry
          mode="class"
          subjects={mappedSubjects}
          activeSubjectId={activeSubjectId}
          students={mappedStudents}
          marksData={marksData}
          onSubjectChange={setActiveSubjectId}
          onMarkUpdate={handleMarkUpdate}
          onSaveMarks={handleSaveMarks}
          onConfigUpdate={handleConfigUpdate}
          onRemoveCat={handleRemoveCat}
          avatar={avatar}
          term={currentClass?.term}
          year={currentClass?.year}
          examType={currentClass?.examType}
        />
      )}
    </div>
  );
};
