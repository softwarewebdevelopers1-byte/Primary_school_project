// components/subjectteacher/MyResources.tsx

import React, { useState } from "react";
import styles from "./MyResources.module.css";
import { Subject, Resource } from "./types";

interface MyResourcesProps {
  subjects: Subject[];
}

const MyResources: React.FC<MyResourcesProps> = ({ subjects }) => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [newResource, setNewResource] = useState({
    title: "",
    subjectId: "",
    type: "note" as Resource["type"],
    description: "",
    file: null as File | null,
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setNewResource({ ...newResource, file: e.target.files[0] });
    }
  };

  const handleUploadResource = () => {
    if (!newResource.title || !newResource.subjectId || !newResource.file) {
      alert("Please fill all required fields and select a file");
      return;
    }

    const subject = subjects.find((s) => s.id === newResource.subjectId);
    const resource: Resource = {
      id: Date.now().toString(),
      title: newResource.title,
      subjectId: newResource.subjectId,
      subjectName: subject?.name || "",
      type: newResource.type,
      fileUrl: URL.createObjectURL(newResource.file),
      fileSize: `${(newResource.file.size / 1024 / 1024).toFixed(2)} MB`,
      uploadDate: new Date().toISOString().split("T")[0],
      description: newResource.description,
      downloads: 0,
    };

    setResources([resource, ...resources]);
    setShowUploadForm(false);
    setNewResource({
      title: "",
      subjectId: "",
      type: "note",
      description: "",
      file: null,
    });
    alert("Resource uploaded successfully!");
  };

  const handleDownload = (resource: Resource) => {
    alert(
      `Downloading: ${resource.title}\nThis would download the file in a real implementation.`,
    );
  };

  const filteredResources = resources.filter((resource) => {
    const matchesSearch =
      resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject =
      selectedSubject === "all" || resource.subjectId === selectedSubject;
    return matchesSearch && matchesSubject;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "note":
        return "📝";
      case "video":
        return "🎥";
      case "assignment":
        return "📄";
      case "pastpaper":
        return "📃";
      case "syllabus":
        return "📖";
      default:
        return "📁";
    }
  };

  return (
    <div className={styles.resourcesContainer}>
      <div className={styles.header}>
        <div>
          <h2>📁 Learning Resources</h2>
          <p>Upload and manage learning materials for your students</p>
        </div>
        <button
          className={styles.uploadBtn}
          onClick={() => setShowUploadForm(true)}
        >
          + Upload Resource
        </button>
      </div>

      {showUploadForm && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3>Upload New Resource</h3>
              <button
                className={styles.closeBtn}
                onClick={() => setShowUploadForm(false)}
              >
                ✕
              </button>
            </div>
            <div className={styles.formGroup}>
              <label>Title *</label>
              <input
                type="text"
                value={newResource.title}
                onChange={(e) =>
                  setNewResource({ ...newResource, title: e.target.value })
                }
                placeholder="e.g., Algebra Notes Chapter 1"
              />
            </div>
            <div className={styles.formGroup}>
              <label>Subject *</label>
              <select
                value={newResource.subjectId}
                onChange={(e) =>
                  setNewResource({ ...newResource, subjectId: e.target.value })
                }
              >
                <option value="">Select Subject</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name} - {subject.class} {subject.stream}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.formGroup}>
              <label>Resource Type</label>
              <select
                value={newResource.type}
                onChange={(e) =>
                  setNewResource({
                    ...newResource,
                    type: e.target.value as any,
                  })
                }
              >
                <option value="note">📝 Notes</option>
                <option value="video">🎥 Video</option>
                <option value="assignment">📄 Assignment</option>
                <option value="pastpaper">📃 Past Paper</option>
                <option value="syllabus">📖 Syllabus</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label>Description</label>
              <textarea
                rows={3}
                value={newResource.description}
                onChange={(e) =>
                  setNewResource({
                    ...newResource,
                    description: e.target.value,
                  })
                }
                placeholder="Brief description of the resource..."
              />
            </div>
            <div className={styles.formGroup}>
              <label>File *</label>
              <input type="file" onChange={handleFileUpload} />
              {newResource.file && (
                <p className={styles.fileInfo}>
                  Selected: {newResource.file.name}
                </p>
              )}
            </div>
            <div className={styles.modalActions}>
              <button
                className={styles.cancelModalBtn}
                onClick={() => setShowUploadForm(false)}
              >
                Cancel
              </button>
              <button
                className={styles.uploadModalBtn}
                onClick={handleUploadResource}
              >
                Upload
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={styles.filters}>
        <div className={styles.searchBox}>
          <input
            type="text"
            placeholder="Search resources..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
        >
          <option value="all">All Subjects</option>
          {subjects.map((subject) => (
            <option key={subject.id} value={subject.id}>
              {subject.name}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.resourcesGrid}>
        {filteredResources.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📁</div>
            <h3>No Resources Yet</h3>
            <p>Upload learning materials to share with your students</p>
            <button
              className={styles.uploadFirstBtn}
              onClick={() => setShowUploadForm(true)}
            >
              + Upload Resource
            </button>
          </div>
        ) : (
          filteredResources.map((resource) => (
            <div key={resource.id} className={styles.resourceCard}>
              <div className={styles.resourceType}>
                <span className={styles.typeIcon}>
                  {getTypeIcon(resource.type)}
                </span>
                <span className={styles.typeName}>
                  {resource.type.toUpperCase()}
                </span>
              </div>
              <h3>{resource.title}</h3>
              <p className={styles.description}>{resource.description}</p>
              <div className={styles.resourceDetails}>
                <div className={styles.detail}>
                  <span>📚 {resource.subjectName}</span>
                  <span>📅 {resource.uploadDate}</span>
                </div>
                <div className={styles.detail}>
                  <span>📄 {resource.fileSize}</span>
                  <span>⬇️ {resource.downloads} downloads</span>
                </div>
              </div>
              <div className={styles.resourceActions}>
                <button
                  className={styles.downloadBtn}
                  onClick={() => handleDownload(resource)}
                >
                  📥 Download
                </button>
                <button className={styles.shareBtn}>📤 Share</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MyResources;
