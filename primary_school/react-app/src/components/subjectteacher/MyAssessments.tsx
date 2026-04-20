// components/subjectteacher/MyAssessments.tsx

import React, { useState } from "react";
import styles from "./MyAssessments.module.css";
import { Subject, Assessment } from "./types";

interface MyAssessmentsProps {
  subjects: Subject[];
  assessments: Assessment[];
}

const MyAssessments: React.FC<MyAssessmentsProps> = ({
  subjects,
  assessments: initialAssessments,
}) => {
  const [assessments, setAssessments] =
    useState<Assessment[]>(initialAssessments);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newAssessment, setNewAssessment] = useState({
    title: "",
    subjectId: "",
    type: "CAT1" as Assessment["type"],
    maxMarks: 100,
    deadline: "",
    description: "",
  });

  const handleCreateAssessment = () => {
    if (
      !newAssessment.title ||
      !newAssessment.subjectId ||
      !newAssessment.deadline
    ) {
      alert("Please fill all required fields");
      return;
    }

    const subject = subjects.find((s) => s.id === newAssessment.subjectId);
    const assessment: Assessment = {
      id: Date.now().toString(),
      title: newAssessment.title,
      subjectId: newAssessment.subjectId,
      subjectName: subject?.name || "",
      type: newAssessment.type,
      class: subject?.class || "",
      stream: subject?.stream || "",
      maxMarks: newAssessment.maxMarks,
      date: new Date().toISOString().split("T")[0],
      deadline: newAssessment.deadline,
      status: "draft",
      description: newAssessment.description,
    };

    setAssessments([assessment, ...assessments]);
    setShowCreateForm(false);
    setNewAssessment({
      title: "",
      subjectId: "",
      type: "CAT1",
      maxMarks: 100,
      deadline: "",
      description: "",
    });
    alert("Assessment created successfully!");
  };

  const handlePublishAssessment = (id: string) => {
    setAssessments(
      assessments.map((a) =>
        a.id === id ? { ...a, status: "published" as const } : a,
      ),
    );
    alert("Assessment published! Students can now access it.");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "draft":
        return (
          <span className={`${styles.statusBadge} ${styles.draft}`}>
            📝 Draft
          </span>
        );
      case "published":
        return (
          <span className={`${styles.statusBadge} ${styles.published}`}>
            ✅ Published
          </span>
        );
      case "closed":
        return (
          <span className={`${styles.statusBadge} ${styles.closed}`}>
            🔒 Closed
          </span>
        );
      default:
        return null;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "CAT1":
      case "CAT2":
      case "CAT3":
        return "📝";
      case "Assignment":
        return "📄";
      case "Quiz":
        return "❓";
      case "Project":
        return "🎯";
      default:
        return "📋";
    }
  };

  return (
    <div className={styles.assessmentsContainer}>
      <div className={styles.header}>
        <div>
          <h2>📝 Assessments</h2>
          <p>Create and manage assessments for your subjects</p>
        </div>
        <button
          className={styles.createBtn}
          onClick={() => setShowCreateForm(true)}
        >
          + Create Assessment
        </button>
      </div>

      {showCreateForm && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3>Create New Assessment</h3>
              <button
                className={styles.closeBtn}
                onClick={() => setShowCreateForm(false)}
              >
                ✕
              </button>
            </div>
            <div className={styles.formGroup}>
              <label>Assessment Title *</label>
              <input
                type="text"
                value={newAssessment.title}
                onChange={(e) =>
                  setNewAssessment({ ...newAssessment, title: e.target.value })
                }
                placeholder="e.g., End of Term Exam"
              />
            </div>
            <div className={styles.formGroup}>
              <label>Subject *</label>
              <select
                value={newAssessment.subjectId}
                onChange={(e) =>
                  setNewAssessment({
                    ...newAssessment,
                    subjectId: e.target.value,
                  })
                }
              >
                <option value="">Select Subject</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name} - {subject.class} {subject.stream}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Assessment Type</label>
                <select
                  value={newAssessment.type}
                  onChange={(e) =>
                    setNewAssessment({
                      ...newAssessment,
                      type: e.target.value as any,
                    })
                  }
                >
                  <option value="CAT1">CAT 1</option>
                  <option value="CAT2">CAT 2</option>
                  <option value="CAT3">CAT 3</option>
                  <option value="Assignment">Assignment</option>
                  <option value="Quiz">Quiz</option>
                  <option value="Project">Project</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Maximum Marks</label>
                <input
                  type="number"
                  value={newAssessment.maxMarks}
                  onChange={(e) =>
                    setNewAssessment({
                      ...newAssessment,
                      maxMarks: parseInt(e.target.value),
                    })
                  }
                />
              </div>
            </div>
            <div className={styles.formGroup}>
              <label>Deadline *</label>
              <input
                type="datetime-local"
                value={newAssessment.deadline}
                onChange={(e) =>
                  setNewAssessment({
                    ...newAssessment,
                    deadline: e.target.value,
                  })
                }
              />
            </div>
            <div className={styles.formGroup}>
              <label>Description</label>
              <textarea
                rows={3}
                value={newAssessment.description}
                onChange={(e) =>
                  setNewAssessment({
                    ...newAssessment,
                    description: e.target.value,
                  })
                }
                placeholder="Optional description or instructions..."
              />
            </div>
            <div className={styles.modalActions}>
              <button
                className={styles.cancelModalBtn}
                onClick={() => setShowCreateForm(false)}
              >
                Cancel
              </button>
              <button
                className={styles.createModalBtn}
                onClick={handleCreateAssessment}
              >
                Create Assessment
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={styles.assessmentsList}>
        {assessments.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📋</div>
            <h3>No Assessments Yet</h3>
            <p>Create your first assessment to start evaluating students</p>
            <button
              className={styles.createFirstBtn}
              onClick={() => setShowCreateForm(true)}
            >
              + Create Assessment
            </button>
          </div>
        ) : (
          assessments.map((assessment) => {
            const subject = subjects.find((s) => s.id === assessment.subjectId);
            return (
              <div key={assessment.id} className={styles.assessmentCard}>
                <div className={styles.assessmentHeader}>
                  <div className={styles.assessmentType}>
                    <span className={styles.typeIcon}>
                      {getTypeIcon(assessment.type)}
                    </span>
                    <span className={styles.typeName}>{assessment.type}</span>
                  </div>
                  {getStatusBadge(assessment.status)}
                </div>
                <h3>{assessment.title}</h3>
                <p className={styles.description}>
                  {assessment.description || "No description provided"}
                </p>
                <div className={styles.assessmentDetails}>
                  <div className={styles.detail}>
                    <span>📚 {assessment.subjectName}</span>
                    <span>
                      🏫 {assessment.class} {assessment.stream}
                    </span>
                  </div>
                  <div className={styles.detail}>
                    <span>📊 Max Marks: {assessment.maxMarks}</span>
                    <span>
                      ⏰ Due: {new Date(assessment.deadline).toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className={styles.assessmentActions}>
                  {assessment.status === "draft" && (
                    <button
                      className={styles.publishBtn}
                      onClick={() => handlePublishAssessment(assessment.id)}
                    >
                      📢 Publish
                    </button>
                  )}
                  <button className={styles.editBtn}>✏️ Edit</button>
                  <button className={styles.viewBtn}>
                    👁️ View Submissions
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default MyAssessments;
