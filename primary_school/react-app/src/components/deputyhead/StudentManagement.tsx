// components/deputyhead/StudentManagement.tsx

import React, { useState } from "react";
import styles from "./StudentManagement.module.css";
import { UserRole, Student } from "./types";

interface StudentManagementProps {
  userRole: UserRole;
}

const StudentManagement: React.FC<StudentManagementProps> = ({ userRole }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterClass, setFilterClass] = useState<string>("all");
  const [filterGender, setFilterGender] = useState<string>("all");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const isHeadTeacher = userRole === "headteacher";

  // Dummy students data
  const students: Student[] = [
    {
      id: "STU001",
      admissionNumber: "2024/001",
      name: "Emma Mwangi",
      className: "Grade 7",
      stream: "7A",
      gender: "Female",
      parentName: "John Mwangi",
      parentEmail: "john@example.com",
      parentPhone: "+254712345678",
      dateOfBirth: "2012-05-15",
      enrollmentDate: "2024-01-10",
      status: "active",
      avatar:
        "https://ui-avatars.com/api/?name=Emma+Wanjiku&background=4F46E5&color=fff",
    },
    {
      id: "STU002",
      admissionNumber: "2024/002",
      name: "James Otieno",
      className: "Grade 7",
      stream: "7A",
      gender: "Male",
      parentName: "Peter Otieno",
      parentEmail: "peter@example.com",
      parentPhone: "+254723456789",
      dateOfBirth: "2012-08-22",
      enrollmentDate: "2024-01-10",
      status: "active",
      avatar:
        "https://ui-avatars.com/api/?name=James+Otieno&background=10B981&color=fff",
    },
    {
      id: "STU003",
      admissionNumber: "2024/003",
      name: "Aisha Hassan",
      className: "Grade 7",
      stream: "7B",
      gender: "Female",
      parentName: "Hassan Ali",
      parentEmail: "hassan@example.com",
      parentPhone: "+254734567890",
      dateOfBirth: "2012-03-10",
      enrollmentDate: "2024-01-10",
      status: "active",
      avatar:
        "https://ui-avatars.com/api/?name=Aisha+Hassan&background=F59E0B&color=fff",
    },
    {
      id: "STU004",
      admissionNumber: "2024/004",
      name: "Brian Kipchoge",
      className: "Grade 8",
      stream: "8A",
      gender: "Male",
      parentName: "Kipchoge Kimutai",
      parentEmail: "kipchoge@example.com",
      parentPhone: "+254745678901",
      dateOfBirth: "2012-11-30",
      enrollmentDate: "2024-01-10",
      status: "active",
      avatar:
        "https://ui-avatars.com/api/?name=Brian+Kipchoge&background=EF4444&color=fff",
    },
    {
      id: "STU005",
      admissionNumber: "2024/005",
      name: "Cynthia Achieng",
      className: "Grade 8",
      stream: "8B",
      gender: "Female",
      parentName: "Michael Achieng",
      parentEmail: "michael@example.com",
      parentPhone: "+254756789012",
      dateOfBirth: "2012-07-18",
      enrollmentDate: "2024-01-10",
      status: "active",
      avatar:
        "https://ui-avatars.com/api/?name=Cynthia+Achieng&background=8B5CF6&color=fff",
    },
  ];

  const classes = [
    "all",
    ...new Set(students.map((s) => `${s.className} ${s.stream}`)),
  ];

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.admissionNumber
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      student.parentName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass =
      filterClass === "all" ||
      `${student.className} ${student.stream}` === filterClass;
    const matchesGender =
      filterGender === "all" || student.gender === filterGender;
    return matchesSearch && matchesClass && matchesGender;
  });

  const stats = {
    total: students.length,
    male: students.filter((s) => s.gender === "Male").length,
    female: students.filter((s) => s.gender === "Female").length,
    active: students.filter((s) => s.status === "active").length,
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <span className={`${styles.statusBadge} ${styles.active}`}>
            Active
          </span>
        );
      case "inactive":
        return (
          <span className={`${styles.statusBadge} ${styles.inactive}`}>
            Inactive
          </span>
        );
      case "transferred":
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
    <div className={styles.studentContainer}>
      <div className={styles.header}>
        <div>
          <h2>👨‍🎓 Student Management</h2>
          <p>View and manage all students across the school</p>
        </div>
        {isHeadTeacher && (
          <button className={styles.addBtn}>+ Add New Student</button>
        )}
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{stats.total}</div>
          <div className={styles.statLabel}>Total Students</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{stats.male}</div>
          <div className={styles.statLabel}>Boys</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{stats.female}</div>
          <div className={styles.statLabel}>Girls</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{stats.active}</div>
          <div className={styles.statLabel}>Active</div>
        </div>
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
          value={filterClass}
          onChange={(e) => setFilterClass(e.target.value)}
        >
          {classes.map((cls) => (
            <option key={cls} value={cls}>
              {cls === "all" ? "All Classes" : cls}
            </option>
          ))}
        </select>
        <select
          value={filterGender}
          onChange={(e) => setFilterGender(e.target.value)}
        >
          <option value="all">All Genders</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
        </select>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.studentTable}>
          <thead>
            <tr>
              <th>Admission No.</th>
              <th>Student Name</th>
              <th>Class</th>
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
                <td>
                  {student.className} {student.stream}
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
                    onClick={() => setSelectedStudent(student)}
                  >
                    View
                  </button>
                  {isHeadTeacher && (
                    <button className={styles.editBtn}>Edit</button>
                  )}
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

      {/* Student Details Modal */}
      {selectedStudent && (
        <div className={styles.modal} onClick={() => setSelectedStudent(null)}>
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h3>Student Details</h3>
              <button
                className={styles.closeBtn}
                onClick={() => setSelectedStudent(null)}
              >
                ✕
              </button>
            </div>
            <div className={styles.studentProfile}>
              <img src={selectedStudent.avatar} alt={selectedStudent.name} />
              <div>
                <h4>{selectedStudent.name}</h4>
                <p>Admission: {selectedStudent.admissionNumber}</p>
                <p>
                  {selectedStudent.className} {selectedStudent.stream}
                </p>
              </div>
            </div>
            <div className={styles.detailsGrid}>
              <div>
                <strong>Date of Birth:</strong> {selectedStudent.dateOfBirth}
              </div>
              <div>
                <strong>Gender:</strong> {selectedStudent.gender}
              </div>
              <div>
                <strong>Parent Name:</strong> {selectedStudent.parentName}
              </div>
              <div>
                <strong>Parent Email:</strong> {selectedStudent.parentEmail}
              </div>
              <div>
                <strong>Parent Phone:</strong> {selectedStudent.parentPhone}
              </div>
              <div>
                <strong>Enrollment Date:</strong>{" "}
                {selectedStudent.enrollmentDate}
              </div>
              <div>
                <strong>Status:</strong> {selectedStudent.status}
              </div>
            </div>
            <div className={styles.modalActions}>
              <button className={styles.messageParentBtn}>
                📧 Message Parent
              </button>
              {isHeadTeacher && (
                <button className={styles.editStudentBtn}>Edit Details</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentManagement;
