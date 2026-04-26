import React, { useState, useEffect } from "react";
import { api } from "../../lib/api";
import { DlIcon } from "../classteacher/shared/Icons";
import { C, FONT } from "../classteacher/shared/constants";

interface Archive {
  _id: string;
  classGrade: string;
  classStream: string;
  term: number;
  year: number;
  examType: string;
  pdfUrl: string;
  createdAt: string;
}

interface ArchivesViewProps {
  classGrade?: string;
  classStream?: string;
  title?: string;
}

export const ArchivesView: React.FC<ArchivesViewProps> = ({ classGrade, classStream, title = "Academic Archives" }) => {
  const [archives, setArchives] = useState<Archive[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArchives = async () => {
      try {
        const data: Archive[] = await api.get("/school/archives", { classGrade, classStream });
        setArchives(data);
      } catch (err) {
        console.error("Failed to fetch archives", err);
      } finally {
        setLoading(false);
      }
    };
    fetchArchives();
  }, [classGrade, classStream]);

  return (
    <div className="ct-anim">
      <div style={{ marginBottom: "1.6rem" }}>
        <p style={{ fontFamily: FONT.sans, fontSize: 11, fontWeight: 700, color: C.gold, textTransform: "uppercase", margin: "0 0 5px" }}>History</p>
        <h2 style={{ fontFamily: FONT.serif, fontSize: "1.9rem", fontWeight: 600, color: C.text, margin: 0 }}>{title}</h2>
        <p style={{ fontFamily: FONT.sans, fontSize: 13, color: C.textMuted, margin: "4px 0 0" }}>Access archived performance reports from previous exam phases.</p>
      </div>

      {loading ? (
        <div style={{ padding: 40, textAlign: "center", color: C.textFaint }}>Loading archives...</div>
      ) : archives.length === 0 ? (
        <div style={{ padding: 60, textAlign: "center", background: C.white, borderRadius: 16, border: `1px dashed ${C.border}` }}>
          <p style={{ fontSize: 15, color: C.textMuted, margin: 0 }}>No archived reports found yet.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
          {archives.map((arc) => (
            <div key={arc._id} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 14, padding: "1.2rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h4 style={{ margin: "0 0 4px", fontSize: 15, color: C.text, fontWeight: 700 }}>
                  {arc.classGrade} {arc.classStream} - {arc.examType.toUpperCase()}
                </h4>
                <p style={{ margin: 0, fontSize: 12, color: C.textMuted }}>
                  Term {arc.term}, {arc.year} · {new Date(arc.createdAt).toLocaleDateString()}
                </p>
              </div>
              <a 
                href={arc.pdfUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "center", 
                  width: 36, 
                  height: 36, 
                  borderRadius: 10, 
                  background: C.goldPale, 
                  color: C.gold,
                  textDecoration: "none"
                }}
              >
                <DlIcon />
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
