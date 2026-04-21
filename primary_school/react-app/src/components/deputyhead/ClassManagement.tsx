// components/deputyhead/ClassManagement.tsx

import React, { useState } from "react";
import styles from "./ClassManagement.module.css";
import { UserRole, Class } from "./types";

interface ClassManagementProps {
  userRole: UserRole;
}

const ClassManagement: React.FC<ClassManagementProps> = ({ userRole }) => {
  const [selectedClass, setSelectedClass] = useState<string>("all");
  const isHeadTeacher = userRole === "headteacher";

  // Dummy classes data
  const classes: Class[] = [
    {
      id: "CLS001",
      name: "Grade 7",
      streams: [
        {
          id: "STR001",
          name: "7A",
          classId: "CLS001",
          className: "Grade 7",
          students: 35,
          classTeacher: "Mr. Peter Otieno",
          classroom: "Room 101",
        },
        {
          id: "STR002",
          name: "7B",
          classId: "CLS001",
          className: "Grade 7",
          students: 32,
          classTeacher: "Mrs. Jane Wanjiku",
          classroom: "Room 102",
        },
        {
          id: "STR003",
          name: "7C",
          classId: "CLS001",
          className: "Grade 7",
          students: 34,
          classTeacher: "Mr. James Kamau",
          classroom: "Room 103",
        },
      ],
      totalStudents: 101,
      classTeacher: "Mr. Peter Otieno (Overall Coordinator)",
      academicYear: "2024",
    },
    {
      id: "CLS002",
      name: "Grade 8",
      streams: [
        {
          id: "STR004",
          name: "8A",
          classId: "CLS002",
          className: "Grade 8",
          students: 38,
          classTeacher: "Mrs. Mary Achieng",
          classroom: "Room 201",
        },
        {
          id: "STR005",
          name: "8B",
          classId: "CLS002",
          className: "Grade 8",
          students: 36,
          classTeacher: "Mr. John Mwangi",
          classroom: "Room 202",
        },
      ],
      totalStudents: 74,
      classTeacher: "Mrs. Mary Achieng (Overall Coordinator)",
      academicYear: "2024",
    },
  ];

  const filteredClasses =
    selectedClass === "all"
      ? classes
      : classes.filter((c) => c.id === selectedClass);

  const allStreams = classes.flatMap((c) => c.streams);

  return (
    <div className={styles.classContainer}>
      <div className={styles.header}>
        <div>
          <h2>📚 Class Management</h2>
          <p>Manage classes, streams, and class assignments</p>
        </div>
        {isHeadTeacher && (
          <button className={styles.addBtn}>+ Add New Class</button>
        )}
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{classes.length}</div>
          <div className={styles.statLabel}>Classes</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{allStreams.length}</div>
          <div className={styles.statLabel}>Streams</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>
            {allStreams.reduce((sum, s) => sum + s.students, 0)}
          </div>
          <div className={styles.statLabel}>Total Students</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{allStreams.length}</div>
          <div className={styles.statLabel}>Class Teachers</div>
        </div>
      </div>

      <div className={styles.filters}>
        <select
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
        >
          <option value="all">All Classes</option>
          {classes.map((cls) => (
            <option key={cls.id} value={cls.id}>
              {cls.name}
            </option>
          ))}
        </select>
      </div>

      {filteredClasses.map((cls) => (
        <div key={cls.id} className={styles.classCard}>
          <div className={styles.classHeader}>
            <h3>{cls.name}</h3>
            <div className={styles.classStats}>
              <span>📚 {cls.streams.length} Streams</span>
              <span>👨‍🎓 {cls.totalStudents} Students</span>
            </div>
          </div>
          <div className={styles.streamsGrid}>
            {cls.streams.map((stream:any) => (
              <div key={stream.id} className={styles.streamCard}>
                <div className={styles.streamHeader}>
                  <h4>{stream.name}</h4>
                  <button className={styles.viewBtn}>View Details</button>
                </div>
                <div className={styles.streamDetails}>
                  <div className={styles.detailRow}>
                    <span>👨‍🏫 Class Teacher:</span>
                    <span>{stream.classTeacher}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span>👨‍🎓 Students:</span>
                    <span>{stream.students}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span>🏫 Classroom:</span>
                    <span>{stream.classroom}</span>
                  </div>
                </div>
                <div className={styles.performance}>
                  <div className={styles.performanceHeader}>
                    <span>Class Performance</span>
                    <span>78% Average</span>
                  </div>
                  <div className={styles.progressBar}>
                    <div
                      className={styles.progressFill}
                      style={{ width: "78%" }}
                    />
                  </div>
                </div>
                {isHeadTeacher && (
                  <div className={styles.streamActions}>
                    <button className={styles.editStreamBtn}>
                      Edit Stream
                    </button>
                    <button className={styles.assignTeacherBtn}>
                      Assign Teacher
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className={styles.subjectAllocation}>
        <h3>Subject Allocation Summary</h3>
        <div className={styles.subjectTable}>
          <table>
            <thead>
              <tr>
                <th>Subject</th>
                <th>Teacher</th>
                <th>Classes</th>
                <th>Students</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Mathematics</td>
                <td>Mr. Peter Otieno</td>
                <td>Grade 7 (7A, 7B, 7C)</td>
                <td>101</td>
              </tr>
              <tr>
                <td>English</td>
                <td>Mrs. Jane Wanjiku</td>
                <td>Grade 7 (7A, 7B, 7C), Grade 8 (8A)</td>
                <td>139</td>
              </tr>
              <tr>
                <td>Kiswahili</td>
                <td>Mr. James Kamau</td>
                <td>Grade 7 (7A, 7B, 7C)</td>
                <td>101</td>
              </tr>
              <tr>
                <td>Science</td>
                <td>Mrs. Mary Achieng</td>
                <td>Grade 8 (8A, 8B)</td>
                <td>74</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ClassManagement;
