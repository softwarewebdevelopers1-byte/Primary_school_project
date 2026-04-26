import React, { useMemo, useState } from "react";
import { api } from "../../lib/api";
import { TimetableLibrary } from "../shared/TimetableLibrary";
import { Class } from "./types";

interface TimetableTabProps {
  classes: Class[];
  currentPeriod: {
    term: number;
    year: number;
  };
}

interface TimetableBreakForm {
  id: string;
  label: string;
  startTime: string;
  endTime: string;
}

export const TimetableTab: React.FC<TimetableTabProps> = ({ classes, currentPeriod }) => {
  const [schoolStartTime, setSchoolStartTime] = useState("08:00");
  const [subjectsPerDay, setSubjectsPerDay] = useState(7);
  const [subjectDurationMinutes, setSubjectDurationMinutes] = useState(40);
  const [breaks, setBreaks] = useState<TimetableBreakForm[]>([
    { id: "break-1", label: "Morning Break", startTime: "10:00", endTime: "10:20" },
    { id: "break-2", label: "Lunch Break", startTime: "13:00", endTime: "13:40" },
  ]);
  const [status, setStatus] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const assignedClassCount = classes.filter(
    (currentClass) => Object.keys(currentClass.subjectAssignments || {}).length > 0,
  ).length;

  const generatedDescription = useMemo(
    () =>
      `Generate whole-school timetables for Term ${currentPeriod.term}, ${currentPeriod.year}. The generator uses only the subject assignments configured on the admin assignments page. Each assigned class receives its own PDF timetable, class teachers receive the full class view, and subject teachers receive their own lesson view.`,
    [currentPeriod.term, currentPeriod.year],
  );

  const updateBreak = (id: string, key: keyof TimetableBreakForm, value: string) => {
    setBreaks((current) =>
      current.map((item) => (item.id === id ? { ...item, [key]: value } : item)),
    );
  };

  const addBreak = () => {
    const nextIndex = breaks.length + 1;
    setBreaks((current) => [
      ...current,
      {
        id: `break-${Date.now()}`,
        label: `Break ${nextIndex}`,
        startTime: "11:30",
        endTime: "11:45",
      },
    ]);
  };

  const removeBreak = (id: string) => {
    setBreaks((current) => current.filter((item) => item.id !== id));
  };

  const handleGenerate = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setStatus(null);

    try {
      const response = await api.post<{ message: string }>("/school/timetables/generate", {
        schoolStartTime,
        subjectsPerDay,
        subjectDurationMinutes,
        breaks: breaks.map((item) => ({
          label: item.label,
          startTime: item.startTime,
          endTime: item.endTime,
        })),
      });

      setStatus({
        type: "success",
        text: response.message || "School timetables generated successfully.",
      });
      setRefreshKey((current) => current + 1);
    } catch (err) {
      setStatus({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to generate school timetables.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: "grid", gap: 22 }}>
      <div
        style={{
          background: "var(--goldP)",
          border: "1px solid var(--border)",
          borderRadius: 16,
          padding: "18px 20px",
        }}
      >
        <p style={{ margin: "0 0 6px", fontSize: 11, fontWeight: 700, color: "var(--gold)", textTransform: "uppercase", letterSpacing: ".08em" }}>
          Timetable Generator
        </p>
        <h2 style={{ margin: "0 0 8px", fontFamily: "var(--serif)", fontSize: "1.8rem", color: "var(--text)" }}>
          AI-Assisted School Timetable Creation
        </h2>
        <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6, color: "var(--textMut)", maxWidth: 860 }}>
          {generatedDescription}
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: 18,
          alignItems: "start",
        }}
      >
        <div
          style={{
            background: "var(--white)",
            border: "1px solid var(--border)",
            borderRadius: 18,
            padding: 20,
          }}
        >
          <div style={{ marginBottom: 16 }}>
            <h3 style={{ margin: "0 0 6px", fontSize: "1.15rem", fontFamily: "var(--serif)", color: "var(--text)" }}>
              Planner Inputs
            </h3>
            <p style={{ margin: 0, fontSize: 12.5, color: "var(--textMut)", lineHeight: 1.5 }}>
              Configure the learning day and let Groq AI distribute lessons across all classes while respecting teacher assignments.
            </p>
          </div>

          {status && (
            <div
              style={{
                marginBottom: 14,
                padding: "11px 13px",
                borderRadius: 12,
                border: status.type === "success" ? "1px solid var(--sBg)" : "1px solid var(--dBg)",
                background: status.type === "success" ? "var(--sBg)" : "var(--dBg)",
                color: status.type === "success" ? "var(--sText)" : "var(--dText)",
                fontSize: 12.5,
                fontWeight: 700,
                lineHeight: 1.5,
              }}
            >
              {status.text}
            </div>
          )}

          <form onSubmit={handleGenerate} style={{ display: "grid", gap: 16 }}>
            <div style={{ display: "grid", gap: 12 }}>
              <Field label="School Day Starts At">
                <input
                  type="time"
                  value={schoolStartTime}
                  onChange={(event) => setSchoolStartTime(event.target.value)}
                  style={inputStyle}
                  required
                />
              </Field>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <Field label="Subjects Per Day">
                  <input
                    type="number"
                    min={1}
                    max={12}
                    value={subjectsPerDay}
                    onChange={(event) => setSubjectsPerDay(Number(event.target.value))}
                    style={inputStyle}
                    required
                  />
                </Field>

                <Field label="Minutes Per Subject">
                  <input
                    type="number"
                    min={20}
                    max={180}
                    value={subjectDurationMinutes}
                    onChange={(event) => setSubjectDurationMinutes(Number(event.target.value))}
                    style={inputStyle}
                    required
                  />
                </Field>
              </div>
            </div>

            <div
              style={{
                borderRadius: 14,
                border: "1px solid var(--border)",
                padding: 14,
                background: "var(--cream)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 12 }}>
                <div>
                  <p style={{ margin: "0 0 4px", fontSize: 11, fontWeight: 700, color: "var(--textMut)", textTransform: "uppercase", letterSpacing: ".06em" }}>
                    Break Settings
                  </p>
                  <p style={{ margin: 0, fontSize: 12.5, color: "var(--textMut)" }}>
                    {breaks.length} configured break{breaks.length === 1 ? "" : "s"}
                  </p>
                </div>
                <button type="button" onClick={addBreak} style={secondaryButtonStyle}>
                  Add Break
                </button>
              </div>

              <div style={{ display: "grid", gap: 10 }}>
                {breaks.map((item, index) => (
                  <div
                    key={item.id}
                    style={{
                      background: "var(--white)",
                      border: "1px solid var(--border)",
                      borderRadius: 12,
                      padding: 12,
                      display: "grid",
                      gap: 10,
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
                      <strong style={{ fontSize: 12.5, color: "var(--text)" }}>Break {index + 1}</strong>
                      {breaks.length > 0 && (
                        <button type="button" onClick={() => removeBreak(item.id)} style={dangerGhostButtonStyle}>
                          Remove
                        </button>
                      )}
                    </div>

                    <Field label="Break Name">
                      <input
                        type="text"
                        value={item.label}
                        onChange={(event) => updateBreak(item.id, "label", event.target.value)}
                        style={inputStyle}
                        required
                      />
                    </Field>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                      <Field label="Start Time">
                        <input
                          type="time"
                          value={item.startTime}
                          onChange={(event) => updateBreak(item.id, "startTime", event.target.value)}
                          style={inputStyle}
                          required
                        />
                      </Field>
                      <Field label="End Time">
                        <input
                          type="time"
                          value={item.endTime}
                          onChange={(event) => updateBreak(item.id, "endTime", event.target.value)}
                          style={inputStyle}
                          required
                        />
                      </Field>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                gap: 12,
              }}
            >
              <StatCard label="Assigned Classes" value={assignedClassCount} note="Classes with subjects assigned on the admin assignments page" />
              <StatCard label="Current Cycle" value={`T${currentPeriod.term}`} note={String(currentPeriod.year)} />
            </div>

            <button
              type="submit"
              disabled={submitting}
              style={{
                ...primaryButtonStyle,
                opacity: submitting ? 0.7 : 1,
                cursor: submitting ? "not-allowed" : "pointer",
              }}
            >
              {submitting ? "Generating & Uploading Timetables..." : "Generate Whole-School Timetable"}
            </button>
          </form>
        </div>

        <TimetableLibrary
          fetchPath="/school/timetables"
          fetchParams={{
            latestOnly: true,
            term: currentPeriod.term,
            year: currentPeriod.year,
          }}
          title="Published Timetables"
          description="Review the latest class timetable PDFs generated for the current school cycle."
          emptyMessage="No timetable has been generated for the current cycle yet."
          refreshKey={refreshKey}
        />
      </div>
    </div>
  );
};

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <label style={{ display: "grid", gap: 7 }}>
    <span style={{ fontSize: 11, fontWeight: 700, color: "var(--textMut)", textTransform: "uppercase", letterSpacing: ".06em" }}>
      {label}
    </span>
    {children}
  </label>
);

const StatCard: React.FC<{ label: string; value: React.ReactNode; note: string }> = ({ label, value, note }) => (
  <div
    style={{
      borderRadius: 14,
      border: "1px solid var(--border)",
      background: "var(--white)",
      padding: "12px 14px",
    }}
  >
    <p style={{ margin: "0 0 5px", fontSize: 10.5, fontWeight: 700, color: "var(--textMut)", textTransform: "uppercase", letterSpacing: ".06em" }}>
      {label}
    </p>
    <p style={{ margin: "0 0 3px", fontSize: "1.35rem", fontWeight: 700, fontFamily: "var(--serif)", color: "var(--text)" }}>
      {value}
    </p>
    <p style={{ margin: 0, fontSize: 11.5, color: "var(--textMut)" }}>{note}</p>
  </div>
);

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid var(--border)",
  background: "var(--white)",
  color: "var(--text)",
  fontSize: 14,
  outline: "none",
};

const primaryButtonStyle: React.CSSProperties = {
  border: "none",
  borderRadius: 12,
  padding: "12px 14px",
  background: "var(--iText)",
  color: "#fff",
  fontSize: 13.5,
  fontWeight: 700,
};

const secondaryButtonStyle: React.CSSProperties = {
  border: "1px solid var(--border)",
  borderRadius: 10,
  padding: "9px 12px",
  background: "var(--white)",
  color: "var(--text)",
  fontSize: 12.5,
  fontWeight: 700,
  cursor: "pointer",
};

const dangerGhostButtonStyle: React.CSSProperties = {
  border: "none",
  background: "transparent",
  color: "var(--dText)",
  fontSize: 12,
  fontWeight: 700,
  cursor: "pointer",
};
