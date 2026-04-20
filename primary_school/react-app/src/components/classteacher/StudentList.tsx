// components/classteacher/StudentList.tsx

import React, { useState } from "react";
import styles from "./StudentList.module.css";
import { Student, StreamInfo } from "./types";

interface StudentListProps {
  students: Student[];
  streamInfo: StreamInfo;
  onViewStudent: (student: Student) => void;
}

const StudentList: React.FC<StudentListProps> = ({
  students,
  streamInfo,
  onViewStudent,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterGender, setFilterGender] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.admissionNumber
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      student.parentName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGender =
      filterGender === "all" || student.gender === filterGender;
    const matchesStatus =
      filterStatus === "all" || student.status === filterStatus;
    return matchesSearch && matchesGender && matchesStatus;
  });

  const handleSelectAll = () => {
    if (selectedStudents.length === filteredStudents.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(filteredStudents.map((s) => s.id));
    }
  };

  const handleSelectStudent = (studentId: string) => {
    setSelectedStudents((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId],
    );
  };

  const handleBulkAction = (action: string) => {
    if (selectedStudents.length === 0) {
      alert("Please select students first");
      return;
    }
    alert(`${action} action for ${selectedStudents.length} students`);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Active":
        return (
          <span className={`${styles.statusBadge} ${styles.active}`}>
            Active
          </span>
        );
      case "Inactive":
        return (
          <span className={`${styles.statusBadge} ${styles.inactive}`}>
            Inactive
          </span>
        );
      case "Transferred":
        return (
          <span className={`${styles.statusBadge} ${styles.transferred}`}>
            Transferred
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className={styles.studentListContainer}>
      <div className={styles.header}>
        <div>
          <h2>👥 Student Management</h2>
          <p>
            Manage all students in {streamInfo.name} stream • Total:{" "}
            {students.length} students
          </p>
        </div>
        <button className={styles.addStudentBtn}>+ Add New Student</button>
      </div>

      <div className={styles.filters}>
        <div className={styles.searchBox}>
          <input
            type="text"
            placeholder="Search by name, admission number or parent..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          value={filterGender}
          onChange={(e) => setFilterGender(e.target.value)}
        >
          <option value="all">All Genders</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
          <option value="Transferred">Transferred</option>
        </select>
      </div>

      {selectedStudents.length > 0 && (
        <div className={styles.bulkActions}>
          <span>{selectedStudents.length} students selected</span>
          <button onClick={() => handleBulkAction("Send Message")}>
            📧 Send Message
          </button>
          <button onClick={() => handleBulkAction("Export")}>
            📥 Export Selected
          </button>
          <button onClick={() => handleBulkAction("Generate Report")}>
            📊 Generate Report
          </button>
        </div>
      )}

      <div className={styles.tableWrapper}>
        <table className={styles.studentTable}>
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={
                    selectedStudents.length === filteredStudents.length &&
                    filteredStudents.length > 0
                  }
                  onChange={handleSelectAll}
                />
              </th>
              <th>Admission No.</th>
              <th>Student Name</th>
              <th>Gender</th>
              <th>Parent Name</th>
              <th>Contact</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map((student) => (
              <tr key={student.id}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedStudents.includes(student.id)}
                    onChange={() => handleSelectStudent(student.id)}
                  />
                </td>
                <td>{student.admissionNumber}</td>
                <td>
                  <div className={styles.studentCell}>
                    <img
                      src={student.avatar}
                      alt={student.name}
                      className={styles.studentAvatar}
                    />
                    <div>
                      <div className={styles.studentName}>{student.name}</div>
                      <div className={styles.studentClass}>
                        {student.stream}
                      </div>
                    </div>
                  </div>
                </td>
                <td>{student.gender}</td>
                <td>{student.parentName}</td>
                <td>
                  <div>{student.parentPhone}</div>
                  <div className={styles.parentEmail}>
                    {student.parentEmail}
                  </div>
                </td>
                <td>{getStatusBadge(student.status)}</td>
                <td>
                  <button
                    className={styles.viewBtn}
                    onClick={() => onViewStudent(student)}
                  >
                    View
                  </button>
                  <button className={styles.editBtn}>Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredStudents.length === 0 && (
        <div className={styles.noResults}>
          <p>No students found matching your criteria.</p>
        </div>
      )}

      <div className={styles.statsSummary}>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>Total Students:</span>
          <span className={styles.statValue}>{students.length}</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>Male:</span>
          <span className={styles.statValue}>
            {students.filter((s) => s.gender === "Male").length}
          </span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>Female:</span>
          <span className={styles.statValue}>
            {students.filter((s) => s.gender === "Female").length}
          </span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>Active:</span>
          <span className={styles.statValue}>
            {students.filter((s) => s.status === "Active").length}
          </span>
        </div>
      </div>
    </div>
  );
};

export default StudentList;
