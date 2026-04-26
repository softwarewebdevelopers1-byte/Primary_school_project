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
    <div className={styles.anim} style={{ padding: "0 4px" }}>
      <div style={{ marginBottom: 24 }}>
        <p style={eyebrowStyle}>Academic Cycle</p>
        <h2 style={titleStyle}>Term & Year Management</h2>
      </div>

      <div style={noticeStyle}>
        <h4 style={{ margin: "0 0 8px", color: "var(--gold)", fontSize: 14 }}>⚠️ Critical Action</h4>
        <p style={{ margin: 0, fontSize: 13, lineHeight: 1.5 }}>
          Updating the academic term and year is a global action. <strong>If the Year is advanced, all students will be automatically promoted to the next Grade.</strong> All teachers and students will be moved to the selected term immediately.
        </p>
      </div>

      <div style={cardStyle}>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div>
            <label style={labelStyle}>Target Academic Year</label>
            <input 
              type="number" 
              value={year} 
              onChange={(e) => setYear(Number(e.target.value))}
              style={inputStyle}
              required
            />
          </div>

          <div>
            <label style={labelStyle}>Target Term</label>
            <select 
              value={term} 
              onChange={(e) => setTerm(Number(e.target.value))}
              style={inputStyle}
              required
            >
              <option value={1}>Term 1</option>
              <option value={2}>Term 2</option>
              <option value={3}>Term 3</option>
            </select>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{ 
              ...buttonStyle,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? "not-allowed" : "pointer"
            }}
          >
            {loading ? "Updating All Classes..." : "Update All Classes Now"}
          </button>
        </form>
      </div>

      <div style={{ marginTop: 40 }}>
        <h4 style={{ fontFamily: "var(--serif)", color: "var(--text)", fontSize: 18, marginBottom: 15 }}>Frequently Asked Questions</h4>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
          {[
            { q: "What happens to old marks?", a: "Marks are stored with their term and year. They will remain in the database and can still be accessed via reports." },
            { q: "Can teachers override this?", a: "Yes, Class Teachers can manually update their specific class term in their settings if needed." }
          ].map((faq, i) => (
            <div key={i} style={faqCardStyle}>
              <p style={{ fontWeight: 700, fontSize: 13, margin: "0 0 5px", color: "var(--text)" }}>{faq.q}</p>
              <p style={{ fontSize: 12, color: "var(--textMut)", margin: 0, lineHeight: 1.4 }}>{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const eyebrowStyle: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 700,
  color: "var(--textMut)",
  textTransform: "uppercase",
  letterSpacing: ".06em",
  margin: "0 0 4px",
};

const titleStyle: React.CSSProperties = {
  fontFamily: "var(--serif)",
  fontSize: "1.8rem",
  fontWeight: 600,
  color: "var(--text)",
  margin: 0,
};

const noticeStyle: React.CSSProperties = {
  background: "var(--goldP)",
  border: "1px solid var(--border)",
  color: "var(--textM)",
  padding: "1.2rem",
  borderRadius: 13,
  marginBottom: 24,
};

const cardStyle: React.CSSProperties = {
  background: "var(--white)",
  border: "1px solid var(--border)",
  borderRadius: 13,
  padding: "2rem",
  maxWidth: 480,
};

const labelStyle: React.CSSProperties = {
  display: "block",
  marginBottom: 8,
  fontSize: 11,
  fontWeight: 700,
  color: "var(--textMut)",
  textTransform: "uppercase",
  letterSpacing: ".03em",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  border: "1.5px solid var(--border)",
  borderRadius: 9,
  fontFamily: "var(--sans)",
  fontSize: 14,
  color: "var(--text)",
  background: "var(--cream)",
  outline: "none",
};

const buttonStyle: React.CSSProperties = {
  background: "var(--iText)",
  color: "#fff",
  border: "none",
  borderRadius: 9,
  padding: "12px",
  fontSize: 14,
  fontWeight: 700,
  fontFamily: "var(--sans)",
  marginTop: 8,
  transition: "all 0.2s",
};

const faqCardStyle: React.CSSProperties = {
  padding: 16,
  background: "var(--white)",
  border: "1px solid var(--border)",
  borderRadius: 12,
};

