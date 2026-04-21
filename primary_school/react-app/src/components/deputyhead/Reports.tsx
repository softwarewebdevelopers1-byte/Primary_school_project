// components/deputyhead/Reports.tsx

import React, { useState } from "react";
import styles from "./Reports.module.css";
import { UserRole, Report } from "./types";

interface ReportsProps {
  userRole: UserRole;
}

const Reports: React.FC<ReportsProps> = () => {
  const [selectedType, setSelectedType] = useState<string>("all");
  const [generating, setGenerating] = useState(false);

  // Dummy reports data
  const reports: Report[] = [
    {
      id: "RPT001",
      title: "Term 1 Academic Report 2024",
      type: "academic",
      generatedBy: "Head Teacher",
      generatedDate: "2024-03-15",
      description: "Comprehensive academic performance report for Term 1",
    },
    {
      id: "RPT002",
      title: "Attendance Summary - Term 1",
      type: "attendance",
      generatedBy: "Deputy Head",
      generatedDate: "2024-03-10",
      description: "Monthly attendance breakdown by class",
    },
    {
      id: "RPT003",
      title: "Teacher Performance Review",
      type: "academic",
      generatedBy: "Head Teacher",
      generatedDate: "2024-03-05",
      description: "Evaluation of teacher effectiveness",
    },
  ];

  const filteredReports =
    selectedType === "all"
      ? reports
      : reports.filter((r) => r.type === selectedType);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "academic":
        return "📊";
      case "attendance":
        return "📅";
      case "disciplinary":
        return "⚠️";
      case "financial":
        return "💰";
      default:
        return "📄";
    }
  };

  const handleGenerateReport = () => {
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      alert("Report generated successfully!");
    }, 2000);
  };

  return (
    <div className={styles.reportsContainer}>
      <div className={styles.header}>
        <div>
          <h2>📄 Reports</h2>
          <p>Generate and download school reports</p>
        </div>
        <button
          className={styles.generateBtn}
          onClick={handleGenerateReport}
          disabled={generating}
        >
          {generating ? "Generating..." : "+ Generate New Report"}
        </button>
      </div>

      <div className={styles.filters}>
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
        >
          <option value="all">All Reports</option>
          <option value="academic">Academic Reports</option>
          <option value="attendance">Attendance Reports</option>
          <option value="disciplinary">Disciplinary Reports</option>
          <option value="financial">Financial Reports</option>
        </select>
      </div>

      <div className={styles.reportsGrid}>
        {filteredReports.map((report) => (
          <div key={report.id} className={styles.reportCard}>
            <div className={styles.reportIcon}>{getTypeIcon(report.type)}</div>
            <div className={styles.reportContent}>
              <h3>{report.title}</h3>
              <p>{report.description}</p>
              <div className={styles.reportMeta}>
                <span>👤 {report.generatedBy}</span>
                <span>📅 {report.generatedDate}</span>
                <span className={`${styles.typeBadge} ${styles[report.type]}`}>
                  {report.type}
                </span>
              </div>
              <div className={styles.reportActions}>
                <button className={styles.downloadBtn}>📥 Download</button>
                <button className={styles.viewBtn}>👁️ Preview</button>
                <button className={styles.shareBtn}>📧 Share</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.quickReports}>
        <h3>Quick Report Templates</h3>
        <div className={styles.templatesGrid}>
          <button
            className={styles.templateBtn}
            onClick={() => alert("Generating Class Performance Report...")}
          >
            📊 Class Performance
          </button>
          <button
            className={styles.templateBtn}
            onClick={() => alert("Generating Subject Analysis Report...")}
          >
            📈 Subject Analysis
          </button>
          <button
            className={styles.templateBtn}
            onClick={() => alert("Generating Teacher Evaluation Report...")}
          >
            👨‍🏫 Teacher Evaluation
          </button>
          <button
            className={styles.templateBtn}
            onClick={() => alert("Generating Student Progress Report...")}
          >
            👨‍🎓 Student Progress
          </button>
        </div>
      </div>
    </div>
  );
};

export default Reports;
