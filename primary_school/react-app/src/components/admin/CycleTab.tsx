import React, { useState } from "react";
import styles from "./AdminDashboard.module.css";

interface CycleTabProps {
  onBulkTermUpdate: (term: number, year: number) => Promise<void>;
}

export const CycleTab: React.FC<CycleTabProps> = ({ onBulkTermUpdate }) => {
  const [term, setTerm] = useState<number>(1);
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!window.confirm(`Are you sure you want to promote ALL classes to Term ${term}, ${year}? This action is global.`)) return;
    
    setLoading(true);
    try {
      await onBulkTermUpdate(term, year);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.tabContent}>
      <div className={styles.tabHeader}>
        <div>
          <p className={styles.eyebrow}>Academic Cycle</p>
          <h2 className={styles.pageTitle}>Term & Year Management</h2>
        </div>
      </div>

      <div className={styles.notice} style={{ background: "var(--cream)", border: "1px solid var(--gold)", color: "var(--textMid)", padding: 20, borderRadius: 12, marginBottom: 30 }}>
        <h4 style={{ margin: "0 0 8px", color: "var(--gold)" }}>⚠️ Critical Action</h4>
        <p style={{ margin: 0, fontSize: 14 }}>
          Updating the academic term and year is a global action. All teachers and students will be moved to the selected term immediately. This affects mark entry, report generation, and dashboard views across the entire school.
        </p>
      </div>

      <div className={styles.card} style={{ maxWidth: 500, padding: 30 }}>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div>
            <label style={{ display: "block", marginBottom: 8, fontSize: 13, fontWeight: 600, color: "var(--textMid)" }}>Target Academic Year</label>
            <input 
              type="number" 
              value={year} 
              onChange={(e) => setYear(Number(e.target.value))}
              className={styles.input}
              style={{ width: "100%" }}
              required
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: 8, fontSize: 13, fontWeight: 600, color: "var(--textMid)" }}>Target Term</label>
            <select 
              value={term} 
              onChange={(e) => setTerm(Number(e.target.value))}
              className={styles.input}
              style={{ width: "100%" }}
              required
            >
              <option value={1}>Term 1 (Opening)</option>
              <option value={2}>Term 2 (Mid-Year)</option>
              <option value={3}>Term 3 (End of Year)</option>
            </select>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className={styles.primaryButton}
            style={{ 
              background: "var(--iText)", 
              marginTop: 10,
              padding: "12px",
              fontSize: 15
            }}
          >
            {loading ? "Updating All Classes..." : "Update All Classes Now"}
          </button>
        </form>
      </div>

      <div style={{ marginTop: 40 }}>
        <h4 style={{ fontFamily: "var(--serif)", color: "var(--text)" }}>Frequently Asked Questions</h4>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginTop: 15 }}>
          {[
            { q: "What happens to old marks?", a: "Marks are stored with their term and year. They will remain in the database and can still be accessed via reports." },
            { q: "Can teachers override this?", a: "Yes, Class Teachers can manually update their specific class term in their settings if needed." }
          ].map((faq, i) => (
            <div key={i} style={{ padding: 15, background: "var(--white)", border: "1px solid var(--border)", borderRadius: 10 }}>
              <p style={{ fontWeight: 700, fontSize: 13, margin: "0 0 5px", color: "var(--text)" }}>{faq.q}</p>
              <p style={{ fontSize: 12, color: "var(--textMuted)", margin: 0 }}>{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
