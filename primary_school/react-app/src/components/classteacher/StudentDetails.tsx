// components/classteacher/StudentDetails.tsx

import React, { useState } from "react";
import styles from "./StudentDetails.module.css";
import { Student } from "./types";

interface StudentDetailsProps {
  student: Student;
  onBack: () => void;
  onUpdate: (student: Student) => void;
  onDelete: (studentId: string) => void;
}

const StudentDetails: React.FC<StudentDetailsProps> = ({
  student,
  onBack,
  onUpdate,
  onDelete,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedStudent, setEditedStudent] = useState<Student>(student);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setEditedStudent((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    onUpdate(editedStudent);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedStudent(student);
    setIsEditing(false);
  };

  const InfoRow = ({ label, value }: { label: string; value: string }) => (
    <div className={styles.infoRow}>
      <div className={styles.infoLabel}>{label}:</div>
      <div className={styles.infoValue}>{value || "—"}</div>
    </div>
  );

  const EditableRow = ({
    label,
    name,
    type = "text",
  }: {
    label: string;
    name: string;
    type?: string;
  }) => (
    <div className={styles.infoRow}>
      <div className={styles.infoLabel}>{label}:</div>
      <div className={styles.infoValue}>
        <input
          type={type}
          name={name}
          value={(editedStudent as any)[name] || ""}
          onChange={handleInputChange}
          className={styles.editInput}
        />
      </div>
    </div>
  );

  return (
    <div className={styles.studentDetails}>
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={onBack}>
          ← Back to Student List
        </button>
        <div>
          {!isEditing ? (
            <>
              <button
                className={styles.editBtn}
                onClick={() => setIsEditing(true)}
              >
                ✏️ Edit Details
              </button>
              <button
                className={styles.deleteBtn}
                onClick={() => onDelete(student.id)}
              >
                🗑️ Delete Student
              </button>
            </>
          ) : (
            <>
              <button className={styles.saveBtn} onClick={handleSave}>
                💾 Save Changes
              </button>
              <button className={styles.cancelBtn} onClick={handleCancel}>
                ❌ Cancel
              </button>
            </>
          )}
        </div>
      </div>

      <div className={styles.profileSection}>
        <div className={styles.profileImage}>
          <img src={student.avatar} alt={student.name} />
          {isEditing && (
            <button className={styles.changePhotoBtn}>Change Photo</button>
          )}
        </div>
        <div className={styles.profileInfo}>
          <h2>
            {isEditing ? (
              <input
                name="name"
                value={editedStudent.name}
                onChange={handleInputChange}
                className={styles.editNameInput}
              />
            ) : (
              student.name
            )}
          </h2>
          <p>Admission Number: {student.admissionNumber}</p>
          <p>
            {student.stream} • {student.className}
          </p>
        </div>
      </div>

      <div className={styles.detailsGrid}>
        <div className={styles.detailsCard}>
          <h3>Personal Information</h3>
          {isEditing ? (
            <>
              <EditableRow label="Gender" name="gender" />
              <EditableRow
                label="Date of Birth"
                name="dateOfBirth"
                type="date"
              />
              <EditableRow label="Address" name="address" />
            </>
          ) : (
            <>
              <InfoRow label="Gender" value={student.gender} />
              <InfoRow label="Date of Birth" value={student.dateOfBirth} />
              <InfoRow label="Address" value={student.address} />
            </>
          )}
        </div>

        <div className={styles.detailsCard}>
          <h3>Parent/Guardian Information</h3>
          {isEditing ? (
            <>
              <EditableRow label="Parent Name" name="parentName" />
              <EditableRow
                label="Parent Email"
                name="parentEmail"
                type="email"
              />
              <EditableRow label="Parent Phone" name="parentPhone" />
            </>
          ) : (
            <>
              <InfoRow label="Parent Name" value={student.parentName} />
              <InfoRow label="Parent Email" value={student.parentEmail} />
              <InfoRow label="Parent Phone" value={student.parentPhone} />
            </>
          )}
        </div>

        <div className={styles.detailsCard}>
          <h3>Academic Information</h3>
          {isEditing ? (
            <>
              <EditableRow label="Class" name="className" />
              <EditableRow label="Stream" name="stream" />
              <EditableRow label="Status" name="status" />
              <EditableRow
                label="Enrollment Date"
                name="enrollmentDate"
                type="date"
              />
            </>
          ) : (
            <>
              <InfoRow label="Class" value={student.className} />
              <InfoRow label="Stream" value={student.stream} />
              <InfoRow label="Status" value={student.status} />
              <InfoRow label="Enrollment Date" value={student.enrollmentDate} />
            </>
          )}
        </div>
      </div>

      <div className={styles.performanceSummary}>
        <h3>Quick Performance Overview</h3>
        <div className={styles.performanceGrid}>
          <div className={styles.performanceCard}>
            <div className={styles.performanceValue}>85%</div>
            <div className={styles.performanceLabel}>Overall Average</div>
          </div>
          <div className={styles.performanceCard}>
            <div className={styles.performanceValue}>3rd</div>
            <div className={styles.performanceLabel}>Class Position</div>
          </div>
          <div className={styles.performanceCard}>
            <div className={styles.performanceValue}>A-</div>
            <div className={styles.performanceLabel}>Mean Grade</div>
          </div>
          <div className={styles.performanceCard}>
            <div className={styles.performanceValue}>95%</div>
            <div className={styles.performanceLabel}>Attendance</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDetails;
