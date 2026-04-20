// components/deputyhead/ParentConcerns.tsx

import React, { useState } from "react";
import styles from "./ParentConcerns.module.css";
import { UserRole, ParentConcern as ParentConcernType } from "./types";

interface ParentConcernsProps {
  userRole: UserRole;
}

const ParentConcerns: React.FC<ParentConcernsProps> = ({ userRole }) => {
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedConcern, setSelectedConcern] =
    useState<ParentConcernType | null>(null);
  const [response, setResponse] = useState("");

  // Dummy parent concerns data
  const [concerns] = useState<ParentConcernType[]>([
    {
      id: "CON001",
      studentName: "Emma Mwangi",
      studentAdmission: "2024/001",
      parentName: "John Mwangi",
      parentEmail: "john@example.com",
      subject: "Academic Performance",
      message:
        "My daughter is struggling with mathematics. Can we arrange extra tutoring sessions?",
      date: "2024-03-20",
      status: "pending",
    },
    {
      id: "CON002",
      studentName: "James Otieno",
      studentAdmission: "2024/002",
      parentName: "Peter Otieno",
      parentEmail: "peter@example.com",
      subject: "Attendance",
      message:
        "James has been absent for 3 days due to illness. Please share the missed assignments.",
      date: "2024-03-18",
      status: "reviewed",
      response:
        "We have noted the absence. The assignments have been sent via email.",
    },
    {
      id: "CON003",
      studentName: "Aisha Hassan",
      studentAdmission: "2024/003",
      parentName: "Hassan Ali",
      parentEmail: "hassan@example.com",
      subject: "Fee Payment",
      message: "I would like to request a payment plan for the school fees.",
      date: "2024-03-15",
      status: "resolved",
      response: "Payment plan approved. Please visit the accounts office.",
    },
  ]);

  const filteredConcerns =
    filterStatus === "all"
      ? concerns
      : concerns.filter((c) => c.status === filterStatus);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <span className={`${styles.statusBadge} ${styles.pending}`}>
            ⏳ Pending
          </span>
        );
      case "reviewed":
        return (
          <span className={`${styles.statusBadge} ${styles.reviewed}`}>
            👁️ Reviewed
          </span>
        );
      case "resolved":
        return (
          <span className={`${styles.statusBadge} ${styles.resolved}`}>
            ✅ Resolved
          </span>
        );
      default:
        return null;
    }
  };

  const handleRespond = () => {
    if (!response.trim()) {
      alert("Please enter a response");
      return;
    }
    alert(`Response sent to parent: ${response}`);
    setSelectedConcern(null);
    setResponse("");
  };

  const stats = {
    total: concerns.length,
    pending: concerns.filter((c) => c.status === "pending").length,
    reviewed: concerns.filter((c) => c.status === "reviewed").length,
    resolved: concerns.filter((c) => c.status === "resolved").length,
  };

  return (
    <div className={styles.concernsContainer}>
      <div className={styles.header}>
        <div>
          <h2>💬 Parent Concerns</h2>
          <p>Manage and respond to parent inquiries and feedback</p>
        </div>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{stats.total}</div>
          <div className={styles.statLabel}>Total Concerns</div>
        </div>
        <div className={`${styles.statCard} ${styles.pendingCard}`}>
          <div className={styles.statValue}>{stats.pending}</div>
          <div className={styles.statLabel}>Pending</div>
        </div>
        <div className={`${styles.statCard} ${styles.reviewedCard}`}>
          <div className={styles.statValue}>{stats.reviewed}</div>
          <div className={styles.statLabel}>Reviewed</div>
        </div>
        <div className={`${styles.statCard} ${styles.resolvedCard}`}>
          <div className={styles.statValue}>{stats.resolved}</div>
          <div className={styles.statLabel}>Resolved</div>
        </div>
      </div>

      <div className={styles.filters}>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="all">All Concerns</option>
          <option value="pending">Pending</option>
          <option value="reviewed">Reviewed</option>
          <option value="resolved">Resolved</option>
        </select>
      </div>

      <div className={styles.concernsList}>
        {filteredConcerns.map((concern) => (
          <div key={concern.id} className={styles.concernCard}>
            <div className={styles.concernHeader}>
              <div>
                <h3>{concern.subject}</h3>
                <div className={styles.studentInfo}>
                  <span>
                    👨‍🎓 {concern.studentName} ({concern.studentAdmission})
                  </span>
                  <span>👨‍👩‍👧 {concern.parentName}</span>
                </div>
              </div>
              {getStatusBadge(concern.status)}
            </div>
            <p className={styles.message}>{concern.message}</p>
            <div className={styles.concernMeta}>
              <span>📅 {concern.date}</span>
              <span>📧 {concern.parentEmail}</span>
            </div>
            {concern.response && (
              <div className={styles.responsePreview}>
                <strong>Response:</strong> {concern.response}
              </div>
            )}
            <div className={styles.concernActions}>
              <button
                className={styles.viewBtn}
                onClick={() => setSelectedConcern(concern)}
              >
                {concern.status === "pending" ? "Respond" : "View Details"}
              </button>
              {concern.status === "reviewed" && (
                <button className={styles.resolveBtn}>Mark Resolved</button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Response Modal */}
      {selectedConcern && (
        <div className={styles.modal} onClick={() => setSelectedConcern(null)}>
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h3>{selectedConcern.subject}</h3>
              <button
                className={styles.closeBtn}
                onClick={() => setSelectedConcern(null)}
              >
                ✕
              </button>
            </div>
            <div className={styles.concernDetails}>
              <p>
                <strong>Student:</strong> {selectedConcern.studentName} (
                {selectedConcern.studentAdmission})
              </p>
              <p>
                <strong>Parent:</strong> {selectedConcern.parentName}
              </p>
              <p>
                <strong>Email:</strong> {selectedConcern.parentEmail}
              </p>
              <p>
                <strong>Date:</strong> {selectedConcern.date}
              </p>
              <div className={styles.messageBox}>
                <strong>Message:</strong>
                <p>{selectedConcern.message}</p>
              </div>
            </div>
            <div className={styles.responseSection}>
              <label>Your Response:</label>
              <textarea
                rows={4}
                value={
                  selectedConcern.status === "resolved"
                    ? selectedConcern.response || ""
                    : response
                }
                onChange={(e) => setResponse(e.target.value)}
                placeholder="Type your response here..."
                disabled={selectedConcern.status === "resolved"}
              />
            </div>
            {selectedConcern.status !== "resolved" && (
              <div className={styles.modalActions}>
                <button
                  className={styles.sendResponseBtn}
                  onClick={handleRespond}
                >
                  Send Response
                </button>
                <button className={styles.markReviewedBtn}>
                  Mark as Reviewed
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ParentConcerns;
