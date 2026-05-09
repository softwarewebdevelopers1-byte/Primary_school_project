import React, { useState } from "react";
import { Class, Subject } from "./types";

const miniButtonStyle: React.CSSProperties = {
  padding: "5px 10px",
  borderRadius: 6,
  fontSize: 11,
  fontWeight: 700,
  cursor: "pointer",
};

const modalHeaderStyle: React.CSSProperties = {
  padding: "20px 22px 16px",
  borderBottom: "1px solid var(--border)",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

const modalTitleStyle: React.CSSProperties = {
  margin: 0,
  fontFamily: "var(--serif)",
  fontSize: "1.3rem",
  color: "var(--text)",
};

const closeButtonStyle: React.CSSProperties = {
  background: "none",
  border: "none",
  fontSize: 22,
  color: "var(--textMut)",
  cursor: "pointer",
  lineHeight: 1,
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 11,
  fontWeight: 700,
  color: "var(--textMut)",
  textTransform: "uppercase",
  letterSpacing: ".05em",
  marginBottom: 6,
};

const secondaryButtonStyle: React.CSSProperties = {
  padding: "9px 18px",
  background: "var(--sand)",
  border: "1px solid var(--border)",
  borderRadius: 8,
  fontSize: 13,
  fontWeight: 600,
  color: "var(--textM)",
  cursor: "pointer",
};

const primaryButtonStyle: React.CSSProperties = {
  padding: "9px 18px",
  background: "var(--gold)",
  color: "#fff",
  border: "none",
  borderRadius: 8,
  fontSize: 13,
  fontWeight: 700,
  cursor: "pointer",
};

const eyebrowStyle: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 700,
  color: "var(--gold)",
  textTransform: "uppercase",
  letterSpacing: ".09em",
  margin: "0 0 3px",
};

const pageTitleStyle: React.CSSProperties = {
  fontFamily: "var(--serif)",
  fontSize: "1.8rem",
  fontWeight: 600,
  color: "var(--text)",
  margin: 0,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  border: "1.5px solid var(--border)",
  borderRadius: 8,
  fontSize: 13.5,
  color: "var(--text)",
  background: "var(--cream)",
};

const noticeStyle: React.CSSProperties = {
  marginBottom: 12,
  background: "var(--sand)",
  border: "1px solid var(--border)",
  borderRadius: 12,
  padding: "11px 14px",
  fontSize: 12.5,
  color: "var(--textM)",
};

const tableHeadingStyle: React.CSSProperties = {
  padding: "9px 13px",
  textAlign: "left",
  fontSize: 10,
  fontWeight: 700,
  color: "var(--textMut)",
  letterSpacing: ".06em",
  textTransform: "uppercase",
  position: "sticky",
  top: 0,
  background: "var(--sand)",
  zIndex: 10,
  boxShadow: "inset 0 -1px 0 var(--borderL)",
};

const tableCellStyle: React.CSSProperties = {
  padding: "10px 13px",
  fontSize: 12.5,
  color: "var(--textM)",
  borderTop: "1px solid var(--borderL)",
};

const SubjectFormModal: React.FC<{
  subject?: Subject;
  onClose: () => void;
  onSave: (name: string, department: string) => Promise<void>;
}> = ({ subject, onClose, onSave }) => {
  const [name, setName] = useState(subject?.name || "");
  const [department, setDepartment] = useState(subject?.department || "General");
  const [saving, setSaving] = useState(false);

  return (
    <div>
      <div style={modalHeaderStyle}>
        <h3 style={modalTitleStyle}>{subject ? "Edit subject" : "Add new subject"}</h3>
        <button onClick={onClose} style={closeButtonStyle}>
          x
        </button>
      </div>

      <div style={{ padding: "18px 22px 22px" }}>
        <div style={{ marginBottom: "1rem" }}>
          <label style={labelStyle}>Subject name</label>
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="e.g. Mathematics"
            style={inputStyle}
          />
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label style={labelStyle}>Department</label>
          <select
            value={department}
            onChange={(event) => setDepartment(event.target.value)}
            style={inputStyle}
          >
            <option value="General">General</option>
            <option value="Sciences">Sciences</option>
            <option value="Languages">Languages</option>
            <option value="Humanities">Humanities</option>
            <option value="Mathematics">Mathematics</option>
            <option value="Arts">Arts</option>
            <option value="Sports">Sports</option>
          </select>
        </div>

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: "1.5rem" }}>
          <button onClick={onClose} style={secondaryButtonStyle}>
            Cancel
          </button>
          <button
            onClick={async () => {
              if (!name.trim()) return;
              setSaving(true);
              try {
                await onSave(name.trim(), department);
              } finally {
                setSaving(false);
              }
            }}
            style={primaryButtonStyle}
            disabled={saving}
          >
            {saving ? "Saving..." : subject ? "Save changes" : "Create subject"}
          </button>
        </div>
      </div>
    </div>
  );
};

interface SubjectsTabProps {
  subjects: Subject[];
  classes: Class[];
  onSaveSubject: (name: string, department: string, subjectId?: string) => Promise<void>;
  onDeleteSubject: (subjectId: string) => Promise<void>;
  showModal: (content: React.ReactNode) => void;
  closeModal: () => void;
  showConfirm: (msg: string, onOk: () => void, danger?: boolean) => void;
}

export const SubjectsTab: React.FC<SubjectsTabProps> = ({
  subjects,
  classes,
  onSaveSubject,
  onDeleteSubject,
  showModal,
  closeModal,
  showConfirm,
}) => {
  const [search, setSearch] = useState("");

  const openSubjectModal = (subject?: Subject) => {
    showModal(
      <SubjectFormModal
        subject={subject}
        onClose={closeModal}
        onSave={async (name, department) => {
          await onSaveSubject(name, department, subject?.id);
        }}
      />,
    );
  };

  const handleDeleteSubject = (subject: Subject) => {
    showConfirm(
      `Delete <strong>${subject.name}</strong>? This will also remove all teacher assignments for this subject.`,
      async () => {
        await onDeleteSubject(subject.id);
      },
      true
    );
  };

  const filteredSubjects = subjects.filter((subject) => {
    const query = search.toLowerCase();
    return (
      subject.name.toLowerCase().includes(query) ||
      subject.department.toLowerCase().includes(query)
    );
  });

  const getUsageCount = (subjectId: string) =>
    classes.reduce(
      (count, currentClass) =>
        count + (currentClass.offeredSubjectIds.includes(subjectId) ? 1 : 0),
      0,
    );

  return (
    <div className="anim">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1.3rem",
          flexWrap: "wrap",
          gap: 10,
        }}
      >
        <div>
          <p style={eyebrowStyle}>Subjects</p>
          <h2 style={pageTitleStyle}>Subject management</h2>
        </div>
        <div style={{ display: "flex", gap: 9, alignItems: "center" }}>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search subjects..."
            style={{ ...inputStyle, width: 220 }}
          />
          <button onClick={() => openSubjectModal()} style={primaryButtonStyle}>
            + Add subject
          </button>
        </div>
      </div>

      <div style={noticeStyle}>
        New subjects are available to every class by default. Admins and class teachers can drop a subject for a specific class, then add it back later from the Assignments view.
      </div>

      <div
        style={{
          background: "var(--white)",
          border: "1px solid var(--border)",
          borderRadius: 13,
          overflow: "auto",
          maxHeight: "70vh",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {["Subject Name", "Department", "Offered Classes", "Dropped Elsewhere", "Actions"].map((h) => (
                <th key={h} style={tableHeadingStyle}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredSubjects.map((subject) => {
              const usageCount = getUsageCount(subject.id);
              return (
                <tr 
                  key={subject.id}
                  style={{ transition: "background 0.2s" }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "var(--ct-hover, rgba(0,0,0,0.02))"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                >
                  <td style={tableCellStyle}>
                    <p style={{ margin: 0, fontWeight: 700, color: "var(--text)", fontFamily: "var(--serif)", fontSize: "1rem" }}>
                      {subject.name}
                    </p>
                  </td>
                  <td style={tableCellStyle}>
                    <span style={{ 
                      padding: "2px 8px", 
                      borderRadius: 9, 
                      fontSize: 10, 
                      fontWeight: 700, 
                      background: "var(--goldL)", 
                      color: "var(--gold)" 
                    }}>
                      {subject.department}
                    </span>
                  </td>
                  <td style={tableCellStyle}>
                    <span style={{ fontWeight: 700 }}>{usageCount}</span> classes
                  </td>
                  <td style={tableCellStyle}>
                    <span style={{ color: "var(--textMut)" }}>{Math.max(classes.length - usageCount, 0)}</span> classes
                  </td>
                  <td style={tableCellStyle}>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button 
                        onClick={() => openSubjectModal(subject)}
                        style={{ ...miniButtonStyle, background: "var(--cream)", border: "1px solid var(--border)" }}
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDeleteSubject(subject)}
                        style={{ ...miniButtonStyle, background: "var(--dBg)", color: "var(--dText)", border: "1px solid var(--dText)" }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filteredSubjects.length === 0 && (
              <tr>
                <td colSpan={5} style={{ padding: "3rem", textAlign: "center", color: "var(--textF)" }}>
                  No subjects found. Add one to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
