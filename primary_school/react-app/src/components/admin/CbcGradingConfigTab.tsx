import React, { useMemo, useState } from "react";
import { api } from "../../lib/api";
import {
  type CbcGradingBand,
  normalizeCbcBands,
  useCbcGradingBands,
} from "../../lib/cbcGrading";

const panelStyle: React.CSSProperties = {
  background: "var(--white)",
  border: "1px solid var(--border)",
  borderRadius: 13,
  padding: "1.1rem 1.2rem",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "9px 10px",
  border: "1.5px solid var(--border)",
  borderRadius: 8,
  fontSize: 13,
  color: "var(--text)",
  background: "var(--cream)",
};

const thStyle: React.CSSProperties = {
  padding: "10px 12px",
  textAlign: "left",
  fontSize: 11,
  fontWeight: 800,
  textTransform: "uppercase",
  letterSpacing: ".04em",
  color: "var(--textM)",
  background: "var(--sand)",
};

const tdStyle: React.CSSProperties = {
  padding: "10px 12px",
  borderTop: "1px solid var(--borderL)",
};

const buttonStyle: React.CSSProperties = {
  padding: "8px 12px",
  borderRadius: 8,
  border: "1px solid var(--border)",
  background: "var(--sand)",
  color: "var(--textM)",
  fontSize: 12,
  fontWeight: 700,
  cursor: "pointer",
};

const validateLocally = (bands: CbcGradingBand[]) => {
  const names = new Set<string>();
  const sorted = [...bands].sort((left, right) => left.minMarks - right.minMarks);
  if (sorted.length === 0) return "Add at least one grading band.";
  if (sorted[0].minMarks !== 0) return "Ranges must start at 0 marks.";
  if (sorted[sorted.length - 1].maxMarks !== 100) return "Ranges must end at 100 marks.";

  for (const band of sorted) {
    if (!String(band.cbcBand || "").trim()) return "Every row needs a CBC band name.";
    const key = band.cbcBand.trim().toUpperCase();
    if (names.has(key)) return `Duplicate CBC band "${key}" is not allowed.`;
    names.add(key);
    if (band.minMarks < 0 || band.maxMarks > 100 || band.minMarks > band.maxMarks) {
      return `${key} has an invalid range.`;
    }
  }

  for (let index = 1; index < sorted.length; index += 1) {
    const previous = sorted[index - 1];
    const current = sorted[index];
    if (!previous || !current) continue;
    if (current.minMarks <= previous.maxMarks) return `${current.cbcBand} overlaps with ${previous.cbcBand}.`;
    if (current.minMarks > previous.maxMarks + 1) return `There is a gap between ${previous.maxMarks} and ${current.minMarks}.`;
  }

  return "";
};

export const CbcGradingConfigTab: React.FC = () => {
  const { bands, setBands, loading, error, reload } = useCbcGradingBands();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const validationMessage = useMemo(() => validateLocally(bands), [bands]);

  const updateBand = (index: number, key: keyof CbcGradingBand, value: string) => {
    setBands((current) =>
      current.map((band, bandIndex) => {
        if (bandIndex !== index) return band;
        const nextValue =
          key === "cbcBand"
            ? value.toUpperCase()
            : Math.max(0, Number(value || 0));
        return { ...band, [key]: nextValue };
      }),
    );
  };

  const moveBand = (index: number, direction: -1 | 1) => {
    setBands((current) => {
      const next = [...current];
      const target = index + direction;
      if (target < 0 || target >= next.length) return current;
      [next[index], next[target]] = [next[target]!, next[index]!];
      return next.map((band, sortOrder) => ({ ...band, sortOrder }));
    });
  };

  const addBand = () => {
    setBands((current) => [
      ...current,
      {
        minMarks: 0,
        maxMarks: 0,
        cbcBand: "",
        points: 0,
        sortOrder: current.length,
      },
    ]);
  };

  const deleteBand = (index: number) => {
    setBands((current) =>
      current.filter((_, bandIndex) => bandIndex !== index).map((band, sortOrder) => ({ ...band, sortOrder })),
    );
  };

  const saveBands = async () => {
    const localError = validateLocally(bands);
    if (localError) {
      setMessage({ text: localError, type: "error" });
      return;
    }

    try {
      setSaving(true);
      const response = await api.put<{ message: string; bands: CbcGradingBand[] }>("/grading/cbc", {
        bands: normalizeCbcBands(bands).map((band, sortOrder) => ({ ...band, sortOrder })),
      });
      setBands(normalizeCbcBands(response.bands || []));
      setMessage({ text: response.message || "CBC grading configuration saved.", type: "success" });
    } catch (err) {
      setMessage({ text: err instanceof Error ? err.message : "Failed to save CBC grading configuration.", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="anim" style={{ display: "grid", gap: 16 }}>
      <div>
        <p style={{ fontSize: 10, fontWeight: 700, color: "var(--gold)", textTransform: "uppercase", letterSpacing: ".09em", margin: 0 }}>
          Settings
        </p>
        <h2 style={{ margin: 0, fontFamily: "var(--serif)", fontSize: "1.8rem", color: "var(--text)" }}>
          CBC Grading Configuration
        </h2>
        <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--textMut)" }}>
          Configure the mark ranges, CBC bands, and points used by marksheets, rankings, reports, exports, and analytics.
        </p>
      </div>

      {(message || error || validationMessage) && (
        <div
          style={{
            padding: "10px 14px",
            borderRadius: 10,
            background: (message?.type === "error" || error || validationMessage) ? "#fdeaea" : "#eaf3de",
            color: (message?.type === "error" || error || validationMessage) ? "#a32d2d" : "#3b6d11",
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          {message?.text || error || validationMessage}
        </div>
      )}

      <div style={panelStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
          <button type="button" onClick={addBand} style={buttonStyle}>Add band</button>
          <div style={{ display: "flex", gap: 8 }}>
            <button type="button" onClick={() => void reload()} style={buttonStyle}>Reload</button>
            <button
              type="button"
              onClick={saveBands}
              disabled={saving || Boolean(validationMessage)}
              style={{ ...buttonStyle, background: "var(--gold)", color: "#fff", opacity: saving || validationMessage ? 0.6 : 1 }}
            >
              {saving ? "Saving..." : "Save configuration"}
            </button>
          </div>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", minWidth: 760, borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={thStyle}>Order</th>
                <th style={thStyle}>Min Marks</th>
                <th style={thStyle}>Max Marks</th>
                <th style={thStyle}>CBC Band</th>
                <th style={thStyle}>Points</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ ...tdStyle, textAlign: "center", padding: 30 }}>Loading CBC grading configuration...</td></tr>
              ) : bands.map((band, index) => (
                <tr key={`${band.id || "new"}-${index}`}>
                  <td style={tdStyle}>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button type="button" onClick={() => moveBand(index, -1)} disabled={index === 0} style={buttonStyle}>Up</button>
                      <button type="button" onClick={() => moveBand(index, 1)} disabled={index === bands.length - 1} style={buttonStyle}>Down</button>
                    </div>
                  </td>
                  <td style={tdStyle}><input type="number" min={0} max={100} value={band.minMarks} onChange={(event) => updateBand(index, "minMarks", event.target.value)} style={inputStyle} /></td>
                  <td style={tdStyle}><input type="number" min={0} max={100} value={band.maxMarks} onChange={(event) => updateBand(index, "maxMarks", event.target.value)} style={inputStyle} /></td>
                  <td style={tdStyle}><input value={band.cbcBand} onChange={(event) => updateBand(index, "cbcBand", event.target.value)} style={inputStyle} /></td>
                  <td style={tdStyle}><input type="number" min={0} value={band.points} onChange={(event) => updateBand(index, "points", event.target.value)} style={inputStyle} /></td>
                  <td style={tdStyle}><button type="button" onClick={() => deleteBand(index)} style={{ ...buttonStyle, color: "#a32d2d" }}>Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
