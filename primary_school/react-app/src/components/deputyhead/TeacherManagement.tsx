// components/deputyhead/TeacherManagement.tsx

import React, { useState } from "react";
import styles from "./TeacherManagement.module.css";
import { UserRole, Teacher } from "./types";

interface TeacherManagementProps {
  userRole: UserRole;
}

const TeacherManagement: React.FC<TeacherManagementProps> = ({ userRole }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);

  const isHeadTeacher = userRole === "headteacher";

  // Dummy teachers data
  const [teachers] = useState<Teacher[]>([
    {
      id: "TCH001",
      name: "Mr. Peter Otieno",
      email: "peter.otieno@school.com",
      phone: "+254712345678",
      subject: "Mathematics",
      class: "Grade 7",
      stream: "7A",
      qualification: "B.Ed Mathematics",
      experience: 8,
      joinDate: "2020-01-10",
      status: "active",
      avatar:
        "https://ui-avatars.com/api/?name=Peter+Otieno&background=4F46E5&color=fff",
    },
    {
      id: "TCH002",
      name: "Mrs. Jane Wanjiku",
      email: "jane.wanjiku@school.com",
      phone: "+254723456789",
      subject: "English",
      class: "Grade 7",
      stream: "7B",
      qualification: "B.Ed English",
      experience: 12,
      joinDate: "2018-03-15",
      status: "active",
      avatar:
        "https://ui-avatars.com/api/?name=Jane+Wanjiku&background=10B981&color=fff",
    },
    {
      id: "TCH003",
      name: "Mr. James Kamau",
      email: "james.kamau@school.com",
      phone: "+254734567890",
      subject: "Kiswahili",
      class: "Grade 8",
      stream: "8A",
      qualification: "B.Ed Kiswahili",
      experience: 5,
      joinDate: "2021-01-10",
      status: "onleave",
      avatar:
        "https://ui-avatars.com/api/?name=James+Kamau&background=F59E0B&color=fff",
    },
    {
      id: "TCH004",
      name: "Mrs. Mary Achieng",
      email: "mary.achieng@school.com",
      phone: "+254745678901",
      subject: "Science",
      class: "Grade 8",
      stream: "8B",
      qualification: "B.Ed Science",
      experience: 15,
      joinDate: "2016-01-10",
      status: "active",
      avatar:
        "https://ui-avatars.com/api/?name=Mary+Achieng&background=EF4444&color=fff",
    },
    {
      id: "TCH005",
      name: "Mr. John Mwangi",
      email: "john.mwangi@school.com",
      phone: "+254756789012",
      subject: "Social Studies",
      class: "Grade 7",
      stream: "7A",
      qualification: "B.Ed Social Studies",
      experience: 3,
      joinDate: "2022-01-10",
      status: "inactive",
      avatar:
        "https://ui-avatars.com/api/?name=John+Mwangi&background=8B5CF6&color=fff",
    },
  ]);

  const filteredTeachers = teachers.filter((teacher) => {
    const matchesSearch =
      teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "all" || teacher.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

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
      case "onleave":
        return (
          <span className={`${styles.statusBadge} ${styles.onleave}`}>
            On Leave
          </span>
        );
      default:
        return null;
    }
  };

  const stats = {
    total: teachers.length,
    active: teachers.filter((t) => t.status === "active").length,
    onLeave: teachers.filter((t) => t.status === "onleave").length,
    inactive: teachers.filter((t) => t.status === "inactive").length,
  };

  return (
    <div className={styles.teacherContainer}>
      <div className={styles.header}>
        <div>
          <h2>👨‍🏫 Teacher Management</h2>
          <p>Manage all teaching staff, their assignments, and performance</p>
        </div>
        {isHeadTeacher && (
          <button className={styles.addBtn}>+ Add New Teacher</button>
        )}
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{stats.total}</div>
          <div className={styles.statLabel}>Total Teachers</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{stats.active}</div>
          <div className={styles.statLabel}>Active</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{stats.onLeave}</div>
          <div className={styles.statLabel}>On Leave</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{stats.inactive}</div>
          <div className={styles.statLabel}>Inactive</div>
        </div>
      </div>

      <div className={styles.filters}>
        <div className={styles.searchBox}>
          <input
            type="text"
            placeholder="Search teachers by name, email or subject..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="onleave">On Leave</option>
        </select>
      </div>

      <div className={styles.teachersGrid}>
        {filteredTeachers.map((teacher) => (
          <div key={teacher.id} className={styles.teacherCard}>
            <div className={styles.cardHeader}>
              <img
                src={teacher.avatar}
                alt={teacher.name}
                className={styles.teacherAvatar}
              />
              <div className={styles.teacherInfo}>
                <h3>{teacher.name}</h3>
                <p>{teacher.subject} Teacher</p>
                {getStatusBadge(teacher.status)}
              </div>
            </div>
            <div className={styles.cardDetails}>
              <div className={styles.detailRow}>
                <span>📧 {teacher.email}</span>
                <span>📞 {teacher.phone}</span>
              </div>
              <div className={styles.detailRow}>
                <span>
                  📚 {teacher.class} • {teacher.stream}
                </span>
                <span>🎓 {teacher.qualification}</span>
              </div>
              <div className={styles.detailRow}>
                <span>⭐ Experience: {teacher.experience} years</span>
                <span>📅 Joined: {teacher.joinDate}</span>
              </div>
            </div>
            <div className={styles.cardActions}>
              <button
                className={styles.viewBtn}
                onClick={() => setSelectedTeacher(teacher)}
              >
                View Details
              </button>
              {isHeadTeacher && (
                <>
                  <button className={styles.editBtn}>Edit</button>
                  <button className={styles.assignBtn}>Assign Class</button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredTeachers.length === 0 && (
        <div className={styles.noResults}>
          <p>No teachers found matching your criteria.</p>
        </div>
      )}

      {/* Teacher Details Modal */}
      {selectedTeacher && (
        <div className={styles.modal} onClick={() => setSelectedTeacher(null)}>
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h3>Teacher Details</h3>
              <button
                className={styles.closeBtn}
                onClick={() => setSelectedTeacher(null)}
              >
                ✕
              </button>
            </div>
            <div className={styles.teacherProfile}>
              <img src={selectedTeacher.avatar} alt={selectedTeacher.name} />
              <div>
                <h4>{selectedTeacher.name}</h4>
                <p>{selectedTeacher.subject} Teacher</p>
                {getStatusBadge(selectedTeacher.status)}
              </div>
            </div>
            <div className={styles.detailsGrid}>
              <div>
                <strong>Email:</strong> {selectedTeacher.email}
              </div>
              <div>
                <strong>Phone:</strong> {selectedTeacher.phone}
              </div>
              <div>
                <strong>Qualification:</strong> {selectedTeacher.qualification}
              </div>
              <div>
                <strong>Experience:</strong> {selectedTeacher.experience} years
              </div>
              <div>
                <strong>Class:</strong> {selectedTeacher.class}
              </div>
              <div>
                <strong>Stream:</strong> {selectedTeacher.stream}
              </div>
              <div>
                <strong>Join Date:</strong> {selectedTeacher.joinDate}
              </div>
            </div>
            {isHeadTeacher && (
              <div className={styles.modalActions}>
                <button className={styles.editModalBtn}>Edit Details</button>
                <button className={styles.messageBtn}>Send Message</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherManagement;
