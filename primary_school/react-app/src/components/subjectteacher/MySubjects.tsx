// components/subjectteacher/MySubjects.tsx

import React, { useState } from "react";
import styles from "./MySubjects.module.css";
import { Teacher, Subject } from "./types";

interface MySubjectsProps {
  subjects: Subject[];
  teacher: Teacher;
  onSelectSubject: (subject: Subject) => void;
}

const MySubjects: React.FC<MySubjectsProps> = ({
  subjects,
  teacher,
  onSelectSubject,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClass, setSelectedClass] = useState<string>("all");

  const filteredSubjects = subjects.filter((subject) => {
    const matchesSearch =
      subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subject.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subject.stream.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass =
      selectedClass === "all" || subject.class === selectedClass;
    return matchesSearch && matchesClass;
  });

  const classes = ["all", ...new Set(subjects.map((s) => s.class))];

  const totalStudents = subjects.reduce((sum, s) => sum + s.students, 0);
  const totalSessionsPerWeek = subjects.reduce(
    (sum, s) => sum + s.sessionsPerWeek,
    0,
  );

  return (
    <div className={styles.subjectsContainer}>
      <div className={styles.header}>
        <h2>📚 My Subjects</h2>
        <p>Manage and enter marks for your assigned subjects</p>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>📖</div>
          <div className={styles.statValue}>{subjects.length}</div>
          <div className={styles.statLabel}>Subjects</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>👨‍🎓</div>
          <div className={styles.statValue}>{totalStudents}</div>
          <div className={styles.statLabel}>Total Students</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>⏰</div>
          <div className={styles.statValue}>{totalSessionsPerWeek}</div>
          <div className={styles.statLabel}>Weekly Sessions</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>📊</div>
          <div className={styles.statValue}>78.5%</div>
          <div className={styles.statLabel}>Class Average</div>
        </div>
      </div>

      <div className={styles.filters}>
        <div className={styles.searchBox}>
          <input
            type="text"
            placeholder="Search subjects by name, code or stream..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
        >
          {classes.map((className) => (
            <option key={className} value={className}>
              {className === "all" ? "All Classes" : className}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.subjectsGrid}>
        {filteredSubjects.map((subject) => (
          <div key={subject.id} className={styles.subjectCard}>
            <div className={styles.subjectHeader}>
              <div className={styles.subjectIcon}>📐</div>
              <div className={styles.subjectInfo}>
                <h3>{subject.name}</h3>
                <p>{subject.code}</p>
              </div>
            </div>
            <div className={styles.subjectDetails}>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Class:</span>
                <span className={styles.detailValue}>
                  {subject.class} • {subject.stream}
                </span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Students:</span>
                <span className={styles.detailValue}>{subject.students}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Sessions/Week:</span>
                <span className={styles.detailValue}>
                  {subject.sessionsPerWeek}
                </span>
              </div>
            </div>
            <div className={styles.performance}>
              <div className={styles.performanceBar}>
                <div
                  className={styles.performanceFill}
                  style={{ width: "78%" }}
                />
              </div>
              <div className={styles.performanceText}>Class Average: 78%</div>
            </div>
            <button
              className={styles.enterMarksBtn}
              onClick={() => onSelectSubject(subject)}
            >
              ✏️ Enter Marks
            </button>
          </div>
        ))}
      </div>

      {filteredSubjects.length === 0 && (
        <div className={styles.noResults}>
          <p>No subjects found matching your criteria.</p>
        </div>
      )}
    </div>
  );
};

export default MySubjects;
