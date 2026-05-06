import React, { useState } from "react";
import { api } from "../../lib/api";

interface ChangePasswordProps {
  onClose: () => void;
  onSuccess?: () => void;
}

export const ChangePassword: React.FC<ChangePasswordProps> = ({ onClose, onSuccess }) => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      await api.put("/users/password", { oldPassword, newPassword });
      setSuccess(true);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || "Failed to change password.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>✅</div>
        <h3 style={titleStyle}>Success!</h3>
        <p style={{ color: "var(--textMut)", marginBottom: "1.5rem" }}>
          Your password has been changed successfully.
        </p>
        <button onClick={onClose} style={primaryButtonStyle}>
          Dismiss
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px 22px 22px" }}>
      <div style={{ marginBottom: 20 }}>
        <h3 style={titleStyle}>Change Password</h3>
        <p style={{ fontSize: 13, color: "var(--textMut)", margin: "4px 0 0" }}>
          Update your account security credentials.
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {error && (
          <div style={errorNoticeStyle}>
            {error}
          </div>
        )}

        <div>
          <label style={labelStyle}>Current Password</label>
          <input
            type="password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            style={inputStyle}
            placeholder="Enter current password"
            required
          />
        </div>

        <div>
          <label style={labelStyle}>New Password</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            style={inputStyle}
            placeholder="Min 6 characters"
            required
          />
        </div>

        <div>
          <label style={labelStyle}>Confirm New Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            style={inputStyle}
            placeholder="Repeat new password"
            required
          />
        </div>

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
          <button type="button" onClick={onClose} style={secondaryButtonStyle} disabled={loading}>
            Cancel
          </button>
          <button type="submit" style={primaryButtonStyle} disabled={loading}>
            {loading ? "Updating..." : "Update Password"}
          </button>
        </div>
      </form>
    </div>
  );
};

const titleStyle: React.CSSProperties = {
  margin: 0,
  fontFamily: "var(--serif)",
  fontSize: "1.35rem",
  color: "var(--text)",
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

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  border: "1.5px solid var(--border)",
  borderRadius: 8,
  fontSize: 13.5,
  color: "var(--text)",
  background: "var(--cream)",
  outline: "none",
};

const primaryButtonStyle: React.CSSProperties = {
  padding: "10px 20px",
  background: "var(--gold)",
  color: "#fff",
  border: "none",
  borderRadius: 8,
  fontSize: 13,
  fontWeight: 700,
  cursor: "pointer",
};

const secondaryButtonStyle: React.CSSProperties = {
  padding: "10px 20px",
  background: "var(--sand)",
  border: "1px solid var(--border)",
  borderRadius: 8,
  fontSize: 13,
  fontWeight: 600,
  color: "var(--textM)",
  cursor: "pointer",
};

const errorNoticeStyle: React.CSSProperties = {
  padding: "10px 12px",
  background: "var(--dBg)",
  color: "var(--dText)",
  border: "1px solid var(--dText)",
  borderRadius: 8,
  fontSize: 12.5,
};
