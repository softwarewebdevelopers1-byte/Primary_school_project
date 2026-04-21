// components/classteacher/MarksManagement.tsx

import React, { useState } from "react";
import styles from "./MarksManagement.module.css";
import { Student, Subject, Mark, StreamInfo } from "./types";

interface MarksManagementProps {
  students: Student[];
  subjects: Subject[];
  streamInfo: StreamInfo;
}

type AssessmentType = "CAT1" | "CAT2" | "CAT3" | "EndTerm" | "Assignment";

const MarksManagement: React.FC<MarksManagementProps> = ({
  students,
  subjects,
  streamInfo,
}) => {
  const [selectedSubject, setSelectedSubject] = useState<string>(
    subjects[0]?.id || "",
  );
  const [selectedAssessment, setSelectedAssessment] =
    useState<AssessmentType>("CAT1");
  const [marks, setMarks] = useState<Record<string, number>>({});
  const [maxMarks, setMaxMarks] = useState<number>(100);
  const [saving, setSaving] = useState(false);

  // Dummy existing marks
  const existingMarks: Mark[] = [
    {
      id: "M001",
      studentId: "STU001",
      subjectId: "SUB001",
      subjectName: "Mathematics",
      assessmentType: "CAT1",
      marks: 78,
      maxMarks: 100,
      date: "2024-02-01",
      term: 1,
      year: 2024,
    },
    {
      id: "M002",
      studentId: "STU002",
      subjectId: "SUB001",
      subjectName: "Mathematics",
      assessmentType: "CAT1",
      marks: 82,
      maxMarks: 100,
      date: "2024-02-01",
      term: 1,
      year: 2024,
    },
  ];

  const getExistingMark = (studentId: string) => {
    const mark = existingMarks.find(
      (m) =>
        m.studentId === studentId &&
        m.subjectId === selectedSubject &&
        m.assessmentType === selectedAssessment,
    );
    return mark?.marks || "";
  };

  const handleMarkChange = (studentId: string, value: string) => {
    const numValue = value === "" ? 0 : parseInt(value);
    if (!isNaN(numValue) && numValue >= 0 && numValue <= maxMarks) {
      setMarks((prev) => ({ ...prev, [studentId]: numValue }));
    }
  };

  const handleSaveMarks = async () => {
    setSaving(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    console.log("Saving marks:", {
      subject: selectedSubject,
      assessmentType: selectedAssessment,
      marks,
      term: streamInfo.term,
      year: streamInfo.academicYear,
    });
    alert(
      `Marks for ${subjects.find((s) => s.id === selectedSubject)?.name} - ${selectedAssessment} saved successfully!`,
    );
    setSaving(false);
  };

  const handleBulkFill = () => {
    const average = prompt("Enter average mark for all students:", "50");
    if (average && !isNaN(parseInt(average))) {
      const avgNum = parseInt(average);
      const newMarks: Record<string, number> = {};
      students.forEach((student) => {
        const variance = Math.floor(Math.random() * 20) - 10;
        let mark = avgNum + variance;
        mark = Math.max(0, Math.min(maxMarks, mark));
        newMarks[student.id] = mark;
      });
      setMarks(newMarks);
    }
  };

  const getMarkColor = (mark: number) => {
    const percentage = (mark / maxMarks) * 100;
    if (percentage >= 80) return styles.excellent;
    if (percentage >= 70) return styles.good;
    if (percentage >= 50) return styles.average;
    return styles.poor;
  };

  const calculateStats = () => {
    const markValues = Object.values(marks).filter((m) => m !== undefined);
    if (markValues.length === 0) return null;
    const sum = markValues.reduce((a, b) => a + b, 0);
    const average = sum / markValues.length;
    const highest = Math.max(...markValues);
    const lowest = Math.min(...markValues);
    return { average, highest, lowest };
  };

  const stats = calculateStats();

  return (
    <div className={styles.marksContainer}>
      <div className={styles.header}>
        <h2>📝 Marks Management</h2>
        <p>
          Enter and manage marks for {streamInfo.name} • Term {streamInfo.term},{" "}
          {streamInfo.academicYear}
        </p>
      </div>

      <div className={styles.controls}>
        <div className={styles.controlGroup}>
          <label>Subject:</label>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
          >
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.name}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.controlGroup}>
          <label>Assessment Type:</label>
          <select
            value={selectedAssessment}
            onChange={(e) =>
              setSelectedAssessment(e.target.value as AssessmentType)
            }
          >
            <option value="CAT1">CAT 1</option>
            <option value="CAT2">CAT 2</option>
            <option value="CAT3">CAT 3</option>
            <option value="Assignment">Assignment</option>
            <option value="EndTerm">End Term Exam</option>
          </select>
        </div>

        <div className={styles.controlGroup}>
          <label>Maximum Marks:</label>
          <input
            type="number"
            value={maxMarks}
            onChange={(e) => setMaxMarks(parseInt(e.target.value) || 100)}
            min="1"
            max="500"
          />
        </div>

        <button className={styles.bulkFillBtn} onClick={handleBulkFill}>
          📊 Bulk Fill
        </button>
      </div>

      {stats && (
        <div className={styles.statsSummary}>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Class Average:</span>
            <span className={styles.statValue}>
              {stats.average.toFixed(1)}%
            </span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Highest Score:</span>
            <span className={styles.statValue}>{stats.highest}</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Lowest Score:</span>
            <span className={styles.statValue}>{stats.lowest}</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Students:</span>
            <span className={styles.statValue}>{students.length}</span>
          </div>
        </div>
      )}

      <div className={styles.tableWrapper}>
        <table className={styles.marksTable}>
          <thead>
            <tr>
              <th>#</th>
              <th>Admission No.</th>
              <th>Student Name</th>
              <th>Current Mark</th>
              <th>New Mark / {maxMarks}</th>
              <th>Percentage</th>
              <th>Grade</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student, idx) => {
              const currentMark = getExistingMark(student.id);
              const newMark = marks[student.id];
              const percentage = newMark
                ? ((newMark / maxMarks) * 100).toFixed(1)
                : "-";
              const grade = newMark
                ? (newMark / maxMarks) * 100 >= 80
                  ? "A"
                  : (newMark / maxMarks) * 100 >= 70
                    ? "B"
                    : (newMark / maxMarks) * 100 >= 50
                      ? "C"
                      : (newMark / maxMarks) * 100 >= 40
                        ? "D"
                        : "E"
                : "-";

              return (
                <tr key={student.id}>
                  <td>{idx + 1}</td>
                  <td>{student.admissionNumber}</td>
                  <td>
                    <div className={styles.studentCell}>
                      <img
                        src={student.avatar}
                        alt={student.name}
                        className={styles.studentAvatar}
                      />
                      {student.name}
                    </div>
                  </td>
                  <td>{currentMark || "-"}</td>
                  <td>
                    <input
                      type="number"
                      className={`${styles.markInput} ${newMark !== undefined ? getMarkColor(newMark) : ""}`}
                      value={newMark !== undefined ? newMark : ""}
                      onChange={(e) =>
                        handleMarkChange(student.id, e.target.value)
                      }
                      min="0"
                      max={maxMarks}
                    />
                  </td>
                  <td
                    className={
                      percentage !== "-" ? getMarkColor(newMark || 0) : ""
                    }
                  >
                    {percentage}%
                  </td>
                  <td className={styles.gradeCell}>{grade}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className={styles.actions}>
        <button
          className={styles.saveBtn}
          onClick={handleSaveMarks}
          disabled={saving}
        >
          {saving ? "Saving..." : "💾 Save All Marks"}
        </button>
        <button
          className={styles.previewBtn}
          onClick={() => alert("Generating preview...")}
        >
          👁️ Preview Results
        </button>
      </div>
    </div>
  );
};

export default MarksManagement;
