import React, { useState } from "react";
import { Class, Teacher } from "./types";

const roleOptions = [
  { value: "subjectteacher", label: "Subject Teacher" },
  { value: "classteacher", label: "Class Teacher" },
  { value: "headteacher", label: "Head Teacher" },
  { value: "deputyteacher", label: "Deputy Teacher" },
  { value: "admin", label: "Admin" },
];

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

const tableHeadingStyle: React.CSSProperties = {
  padding: "9px 13px",
  textAlign: "left",
  fontSize: 10,
  fontWeight: 700,
  color: "var(--textMut)",
  letterSpacing: ".06em",
  textTransform: "uppercase",
};

const rowPrimaryTextStyle: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 700,
  color: "var(--text)",
  margin: 0,
};

const rowMetaTextStyle: React.CSSProperties = {
  fontSize: 10.5,
  color: "var(--textMut)",
  margin: 0,
};

const bodyTextStyle: React.CSSProperties = {
  padding: "10px 13px",
  fontSize: 12.5,
  color: "var(--textM)",
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

const primaryButtonStyle: React.CSSProperties = {
  padding: "8px 15px",
  background: "var(--gold)",
  color: "#fff",
  border: "none",
  borderRadius: 8,
  fontSize: 12.5,
  fontWeight: 700,
  cursor: "pointer",
};

const secondaryButtonStyle: React.CSSProperties = {
  padding: "8px 16px",
  background: "var(--sand)",
  border: "1px solid var(--border)",
  borderRadius: 8,
  fontSize: 13,
  fontWeight: 600,
  color: "var(--textM)",
  cursor: "pointer",
};

const iconButtonStyle: React.CSSProperties = {
  padding: "4px 10px",
  borderRadius: 20,
  background: "var(--sand)",
  border: "1px solid var(--border)",
  cursor: "pointer",
  fontSize: 11,
  fontWeight: 700,
  color: "var(--textMut)",
};

const modalHeaderStyle: React.CSSProperties = {
  padding: "18px 22px 14px",
  borderBottom: "1px solid var(--border)",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
};

const modalTitleStyle: React.CSSProperties = {
  fontFamily: "var(--serif)",
  fontSize: "1.3rem",
  fontWeight: 600,
  color: "var(--text)",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 11.5,
  fontWeight: 700,
  color: "var(--textM)",
  letterSpacing: ".03em",
  marginBottom: 5,
};

const closeButtonStyle: React.CSSProperties = {
  width: 28,
  height: 28,
  borderRadius: 7,
  background: "var(--sand)",
  border: "none",
  cursor: "pointer",
  fontSize: 16,
  fontWeight: 700,
  color: "var(--textMut)",
};

const emptyCellStyle: React.CSSProperties = {
  padding: "2.5rem",
  textAlign: "center",
  fontSize: "1.2rem",
  color: "var(--textF)",
};

const StaffFormModal: React.FC<{
  teacher: Teacher | null;
  classes: Class[];
  onClose: () => void;
  onSave: (payload: {
    roles: string[];
    name: string;
    email: string;
    phone: string;
    department: string;
    status: string;
    classGrade?: string;
    classStream?: string;
    subjects?: string[];
  }) => Promise<void>;
}> = ({ teacher, classes, onClose, onSave }) => {
  const [role, setRole] = useState<string[]>(teacher?.roles || ["subjectteacher"]);
  const [name, setName] = useState(teacher?.name || "");
  const [email, setEmail] = useState(teacher?.email || "");
  const [phone, setPhone] = useState(teacher?.phone || "");
  const [department, setDepartment] = useState(teacher?.department || "");
  const [status, setStatus] = useState(teacher?.status || "Active");
  const [classGrade, setClassGrade] = useState(teacher?.classGrade || "");
  const [classStream, setClassStream] = useState(teacher?.classStream || "");
  const [subjects, setSubjects] = useState((teacher?.subjects || []).join(", "));
  const [saving, setSaving] = useState(false);

  return (
    <div>
      <div style={modalHeaderStyle}>
        <h3 style={modalTitleStyle}>{teacher ? "Edit staff member" : "Add staff member"}</h3>
        <button onClick={onClose} style={closeButtonStyle}>
          x
        </button>
      </div>

      <div style={{ padding: "18px 22px 22px" }}>
        <div style={{ marginBottom: "1rem" }}>
          <label style={labelStyle}>Roles (Select up to 3)</label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", padding: "8px", background: "var(--sand)", borderRadius: "8px" }}>
            {roleOptions.map((option) => (
              <label key={option.value} style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", fontSize: "12.5px", color: "var(--textM)" }}>
                <input
                  type="checkbox"
                  checked={Array.isArray(role) ? role.includes(option.value) : role === option.value}
                  onChange={(e) => {
                    const currentRoles = Array.isArray(role) ? [...role] : [role];
                    if (e.target.checked) {
                      if (currentRoles.length < 3) setRole([...currentRoles, option.value]);
                      else alert("Maximum 3 roles allowed");
                    } else {
                      setRole(currentRoles.filter(r => r !== option.value));
                    }
                  }}
                />
                {option.label}
              </label>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label style={labelStyle}>Full name</label>
          <input value={name} onChange={(event) => setName(event.target.value)} style={inputStyle} />
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label style={labelStyle}>Email address</label>
          <input value={email} onChange={(event) => setEmail(event.target.value)} style={inputStyle} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <label style={labelStyle}>Phone</label>
            <input value={phone} onChange={(event) => setPhone(event.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Status</label>
            <select value={status} onChange={(event) => setStatus(event.target.value)} style={inputStyle}>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div style={{ marginTop: "1rem" }}>
          <label style={labelStyle}>Department</label>
          <input
            list="staff-departments"
            value={department}
            onChange={(event) => setDepartment(event.target.value)}
            style={inputStyle}
          />
          <datalist id="staff-departments">
            {["Sciences", "Languages", "Humanities", "Arts", "Sports", "Technology", "Mathematics", "Administration"].map((item) => (
              <option key={item} value={item} />
            ))}
          </datalist>
        </div>

        {role.includes("classteacher") && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: "1rem" }}>
            <div>
              <label style={labelStyle}>Class grade</label>
              <input
                list="staff-grade-options"
                value={classGrade}
                onChange={(event) => setClassGrade(event.target.value)}
                style={inputStyle}
              />
              <datalist id="staff-grade-options">
                {Array.from(new Set(classes.map((current) => current.grade))).map((grade) => (
                  <option key={grade} value={grade} />
                ))}
              </datalist>
            </div>
            <div>
              <label style={labelStyle}>Class stream</label>
              <input
                list="staff-stream-options"
                value={classStream}
                onChange={(event) => setClassStream(event.target.value)}
                style={inputStyle}
              />
              <datalist id="staff-stream-options">
                {Array.from(new Set(classes.map((current) => current.stream || "").filter(Boolean))).map((stream) => (
                  <option key={stream} value={stream} />
                ))}
              </datalist>
            </div>
          </div>
        )}

        {role.includes("subjectteacher") && (
          <div style={{ marginTop: "1rem" }}>
            <label style={labelStyle}>Subjects</label>
            <input
              value={subjects}
              onChange={(event) => setSubjects(event.target.value)}
              placeholder="Comma separated, e.g. Mathematics, Science"
              style={inputStyle}
            />
          </div>
        )}

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: "1.5rem" }}>
          <button onClick={onClose} style={secondaryButtonStyle}>
            Cancel
          </button>
          <button
            onClick={async () => {
              if (!name.trim() || !email.trim()) {
                alert("Name and email are required.");
                return;
              }

              setSaving(true);
              try {
                await onSave({
                  roles: role,
                  name: name.trim(),
                  email: email.trim(),
                  phone: phone.trim(),
                  department: department.trim() || "General",
                  status,
                  classGrade: classGrade.trim(),
                  classStream: classStream.trim(),
                  subjects: subjects
                    .split(",")
                    .map((item) => item.trim())
                    .filter(Boolean),
                });
              } finally {
                setSaving(false);
              }
            }}
            style={primaryButtonStyle}
            disabled={saving}
          >
            {saving ? "Saving..." : teacher ? "Save changes" : "Add staff"}
          </button>
        </div>
      </div>
    </div>
  );
};

interface TeachersTabProps {
  teachers: Teacher[];
  classes: Class[];
  onSaveTeacher: (
    payload: {
      roles: string[];
      name: string;
      email: string;
      phone: string;
      department: string;
      status: string;
      classGrade?: string;
      classStream?: string;
      subjects?: string[];
    },
    teacherId?: string,
  ) => Promise<void>;
  onDeleteTeacher: (teacherId: string) => Promise<void>;
  avatar: (name: string, size: number) => string;
  pill: (text: string, color: string) => string;
  showModal: (content: React.ReactNode) => void;
  closeModal: () => void;
  showConfirm: (msg: string, onOk: () => void, danger?: boolean) => void;
}

export const TeachersTab: React.FC<TeachersTabProps> = ({
  teachers,
  classes,
  onSaveTeacher,
  onDeleteTeacher,
  avatar,
  pill,
  showModal,
  closeModal,
  showConfirm,
}) => {
  const [search, setSearch] = useState("");

  const filteredTeachers = teachers.filter(
    (teacher) =>
      teacher.name.toLowerCase().includes(search.toLowerCase()) ||
      teacher.department.toLowerCase().includes(search.toLowerCase()) ||
      teacher.email.toLowerCase().includes(search.toLowerCase()) ||
      teacher.roleLabel.toLowerCase().includes(search.toLowerCase()),
  );

  const openAddTeacher = (editId?: string) => {
    const teacher = editId ? teachers.find((current) => current.id === editId) || null : null;

    showModal(
      <StaffFormModal
        teacher={teacher}
        classes={classes}
        onClose={closeModal}
        onSave={async (payload) => {
          await onSaveTeacher(payload, teacher?.id);
        }}
      />,
    );
  };

  const confirmDeleteStaff = (teacher: Teacher) => {
    showConfirm(
      `Remove <strong>${teacher.name}</strong> from the staff directory?`,
      async () => {
        await onDeleteTeacher(teacher.id);
      },
      true,
    );
  };

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
          <p style={eyebrowStyle}>Staff</p>
          <h2 style={pageTitleStyle}>Staff directory</h2>
        </div>
        <div style={{ display: "flex", gap: 9, alignItems: "center" }}>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search name, role, department"
            style={{ ...inputStyle, width: 220 }}
          />
          <button onClick={() => openAddTeacher()} style={primaryButtonStyle}>
            + Add staff
          </button>
        </div>
      </div>

      <div
        style={{
          background: "#fff",
          border: "1px solid var(--border)",
          borderRadius: 13,
          overflow: "hidden",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "var(--sand)" }}>
              {["Staff", "Role", "Department", "Contact", "Scope", "Status", ""].map((heading) => (
                <th key={heading} style={tableHeadingStyle}>
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredTeachers.map((teacher) => (
              <tr key={teacher.id} style={{ borderTop: "1px solid var(--borderL)" }}>
                <td style={{ padding: "10px 13px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                    <div dangerouslySetInnerHTML={{ __html: avatar(teacher.name, 30) }} />
                    <div>
                      <p style={rowPrimaryTextStyle}>{teacher.name}</p>
                      <p style={rowMetaTextStyle}>{teacher.email}</p>
                    </div>
                  </div>
                </td>
                <td style={bodyTextStyle}>{teacher.roleLabel}</td>
                <td style={bodyTextStyle}>{teacher.department}</td>
                <td style={bodyTextStyle}>{teacher.phone || "-"}</td>
                <td style={{ padding: "10px 13px" }}>
                  <p style={{ ...rowPrimaryTextStyle, fontWeight: 600 }}>
                    {teacher.classGrade
                      ? `Grade ${teacher.classGrade}${teacher.classStream ? ` ${teacher.classStream}` : ""}`
                      : teacher.subjects?.length
                        ? teacher.subjects.join(", ")
                        : "General"}
                  </p>
                  <p style={rowMetaTextStyle}>{teacher.teacherNumber || teacher.joinDate || ""}</p>
                </td>
                <td style={{ padding: "10px 13px" }}>
                  <span
                    dangerouslySetInnerHTML={{
                      __html: pill(teacher.status, teacher.status === "Active" ? "green" : "gray"),
                    }}
                  />
                </td>
                <td style={{ padding: "10px 13px" }}>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button onClick={() => openAddTeacher(teacher.id)} style={iconButtonStyle}>
                      Edit
                    </button>
                    <button
                      onClick={() => confirmDeleteStaff(teacher)}
                      style={{
                        ...iconButtonStyle,
                        background: "var(--dBg)",
                        border: "none",
                        color: "var(--dText)",
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {filteredTeachers.length === 0 && (
              <tr>
                <td colSpan={7} style={emptyCellStyle}>
                  No staff members found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
