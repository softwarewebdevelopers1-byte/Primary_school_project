import React, { useEffect, useMemo, useState } from "react";
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

const MARKS_PAGE_SIZE = 50;

type PaginatedMarksResponse = {
  data: any[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

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
  const [isCompact, setIsCompact] = useState(() => window.innerWidth <= 820);
  const [subjectStudents, setSubjectStudents] = useState<
    Record<string, MarksStudent[]>
  >({});
  const [marksPage, setMarksPage] = useState(1);
  const [marksPagination, setMarksPagination] = useState({
    page: 1,
    limit: MARKS_PAGE_SIZE,
    total: 0,
    totalPages: 1,
  });
  const [isSendingWhatsapp, setIsSendingWhatsapp] = useState(false);
  const [message, setMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  useEffect(() => {
    const handleResize = () => setIsCompact(window.innerWidth <= 820);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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

  const currentClass = useMemo(() => {
    return classes.find((current) => current.id === selectedClassId) || classes[0];
  }, [classes, selectedClassId]);
  const availableSubjects = currentClass
    ? subjects.filter((subject) =>
        currentClass.offeredSubjectIds.includes(subject.id),
      )
    : [];
  const classStudents = currentClass
    ? students.filter(
        (student) =>
          student.classId === currentClass.id && student.status === "Active",
      )
    : [];

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
    setMarksPage(1);
    setMarksPagination({
      page: 1,
      limit: MARKS_PAGE_SIZE,
      total: 0,
      totalPages: 1,
    });
  }, [selectedClassId, currentClass?.term, currentClass?.year, currentClass?.examType]);

  useEffect(() => {
    setMarksPage(1);
  }, [activeSubjectId]);

  useEffect(() => {
    if (!currentClass || !activeSubjectId) {
      return;
    }

    let ignore = false;

    const loadDetailedMarks = async () => {
      try {
        const response = await api.get<PaginatedMarksResponse | any[]>("/marks", {
          subjectId: activeSubjectId,
          classGrade: currentClass.grade,
          classStream: currentClass.stream || "",
          term: currentClass.term,
          year: currentClass.year,
          examType: currentClass.examType,
          page: marksPage,
          limit: MARKS_PAGE_SIZE,
        });
        const data = Array.isArray(response) ? response : response.data;
        const pagination = Array.isArray(response)
          ? {
              page: 1,
              limit: data.length || MARKS_PAGE_SIZE,
              total: data.length,
              totalPages: 1,
            }
          : response.pagination;

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
        setMarksPagination(pagination);
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
  }, [activeSubjectId, currentClass, marksPage]);

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

  const handleSendWhatsappMarks = async () => {
    if (!currentClass) return;

    setIsSendingWhatsapp(true);
    setMessage(null);
    try {
      const response = await api.post<{ message?: string }>("/marks/whatsapp/class", {
        classGrade: currentClass.grade,
        classStream: currentClass.stream || "",
        term: currentClass.term || 1,
        year: currentClass.year || new Date().getFullYear(),
        examType: currentClass.examType || "opener",
      });
      setMessage({
        text: response.message || "WhatsApp marks have been queued.",
        type: "success",
      });
    } catch (error: any) {
      setMessage({
        text: error?.message || "Unable to queue WhatsApp marks.",
        type: "error",
      });
    } finally {
      setIsSendingWhatsapp(false);
    }
  };

  const activeSubjectStudents = subjectStudents[activeSubjectId] || [];
  const hasStudentsForSelectedClass =
    marksPagination.total > 0 || classStudents.length > 0 || activeSubjectStudents.length > 0;



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
          percentages. For performance analysis and reports, visit the <b>Performance & Analytics</b> tab.
        </p>
      </div>

      <div
        style={{
          ...panelStyle,
          display: "grid",
          gridTemplateColumns:
            isCompact
              ? "1fr"
              : "minmax(180px, 280px) minmax(240px, 1.4fr) repeat(3, minmax(110px, 1fr))",
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

        <div style={{ ...statBoxStyle, display: "grid", alignContent: "center" }}>
          <button
            onClick={handleSendWhatsappMarks}
            disabled={!currentClass || classStudents.length === 0 || isSendingWhatsapp}
            style={{
              padding: "10px 12px",
              border: "none",
              borderRadius: 8,
              background: "var(--gold)",
              color: "#fff",
              fontSize: 12.5,
              fontWeight: 800,
              cursor:
                !currentClass || classStudents.length === 0 || isSendingWhatsapp
                  ? "not-allowed"
                  : "pointer",
              opacity:
                !currentClass || classStudents.length === 0 || isSendingWhatsapp
                  ? 0.55
                  : 1,
            }}
          >
            {isSendingWhatsapp ? "Queueing..." : "Send WhatsApp marks"}
          </button>
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
      ) : !hasStudentsForSelectedClass ? (
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
          pagination={{
            ...marksPagination,
            onPageChange: setMarksPage,
          }}
        />
      )}
    </div>
  );
};
