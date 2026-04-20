import { useMemo, useState } from "react";
import styles from "./LearningMaterials.module.css";
import { LearningMaterial } from "./types";

interface LearningMaterialsProps {
  studentId: string;
  materials: LearningMaterial[];
  onToggleSaved: (materialId: string) => void;
  onToggleComplete: (materialId: string) => void;
  onDownload: (materialId: string) => void;
}

const fileTypeLabel: Record<LearningMaterial["fileType"], string> = {
  pdf: "PDF",
  doc: "Worksheet",
  ppt: "Slides",
  video: "Video",
};

function LearningMaterials({
  materials,
  onToggleSaved,
  onToggleComplete,
  onDownload,
}: LearningMaterialsProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [view, setView] = useState<"all" | "saved" | "completed">("all");

  const subjects = useMemo(
    () => ["all", ...new Set(materials.map((item) => item.subject))],
    [materials],
  );

  const filteredMaterials = useMemo(
    () =>
      materials.filter((item) => {
        const matchesSearch =
          item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.topic.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesSubject =
          selectedSubject === "all" || item.subject === selectedSubject;
        const matchesView =
          view === "all" ||
          (view === "saved" && item.saved) ||
          (view === "completed" && item.completed);
        return matchesSearch && matchesSubject && matchesView;
      }),
    [materials, searchTerm, selectedSubject, view],
  );

  const summary = {
    total: materials.length,
    saved: materials.filter((item) => item.saved).length,
    completed: materials.filter((item) => item.completed).length,
    newItems: materials.filter((item) => item.isNew).length,
  };

  return (
    <section className={styles.page}>
      <header className={styles.hero}>
        <div>
          <span className={styles.eyebrow}>Resource center</span>
          <h2>Learning materials that are easy to scan and revisit</h2>
          <p>
            Search by subject, save the items you want to revise later, and mark
            resources as complete once you finish them.
          </p>
        </div>

        <div className={styles.heroStats}>
          <div>
            <strong>{summary.total}</strong>
            <span>Total resources</span>
          </div>
          <div>
            <strong>{summary.saved}</strong>
            <span>Saved</span>
          </div>
          <div>
            <strong>{summary.completed}</strong>
            <span>Completed</span>
          </div>
          <div>
            <strong>{summary.newItems}</strong>
            <span>New this week</span>
          </div>
        </div>
      </header>

      <section className={styles.toolbar}>
        <input
          className={styles.searchInput}
          type="search"
          placeholder="Search by title, topic, or description"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
        />

        <select
          className={styles.select}
          value={selectedSubject}
          onChange={(event) => setSelectedSubject(event.target.value)}
        >
          {subjects.map((subject) => (
            <option key={subject} value={subject}>
              {subject === "all" ? "All subjects" : subject}
            </option>
          ))}
        </select>

        <div className={styles.filterTabs}>
          <button
            className={`${styles.filterButton} ${view === "all" ? styles.filterButtonActive : ""}`}
            onClick={() => setView("all")}
            type="button"
          >
            All
          </button>
          <button
            className={`${styles.filterButton} ${view === "saved" ? styles.filterButtonActive : ""}`}
            onClick={() => setView("saved")}
            type="button"
          >
            Saved
          </button>
          <button
            className={`${styles.filterButton} ${view === "completed" ? styles.filterButtonActive : ""}`}
            onClick={() => setView("completed")}
            type="button"
          >
            Completed
          </button>
        </div>
      </section>

      <section className={styles.grid}>
        {filteredMaterials.map((material) => (
          <article key={material.id} className={styles.card}>
            <div className={styles.cardTop}>
              <div>
                <div className={styles.badges}>
                  <span className={styles.subjectBadge}>{material.subject}</span>
                  <span className={styles.typeBadge}>{fileTypeLabel[material.fileType]}</span>
                  {material.isNew && <span className={styles.newBadge}>New</span>}
                </div>
                <h3>{material.title}</h3>
              </div>
              <button
                className={`${styles.saveButton} ${material.saved ? styles.saveButtonActive : ""}`}
                onClick={() => onToggleSaved(material.id)}
                type="button"
              >
                {material.saved ? "Saved" : "Save"}
              </button>
            </div>

            <p className={styles.description}>{material.description}</p>

            <dl className={styles.metaGrid}>
              <div>
                <dt>Topic</dt>
                <dd>{material.topic}</dd>
              </div>
              <div>
                <dt>Teacher</dt>
                <dd>{material.teacher}</dd>
              </div>
              <div>
                <dt>Length</dt>
                <dd>{material.duration}</dd>
              </div>
              <div>
                <dt>Uploaded</dt>
                <dd>{new Date(material.uploadedDate).toLocaleDateString()}</dd>
              </div>
            </dl>

            <div className={styles.footer}>
              <span>{material.downloads} downloads</span>
              <div className={styles.actions}>
                <button
                  className={styles.ghostButton}
                  onClick={() => onToggleComplete(material.id)}
                  type="button"
                >
                  {material.completed ? "Completed" : "Mark complete"}
                </button>
                <button
                  className={styles.primaryButton}
                  onClick={() => onDownload(material.id)}
                  type="button"
                >
                  Open resource
                </button>
              </div>
            </div>
          </article>
        ))}
      </section>

      {filteredMaterials.length === 0 && (
        <section className={styles.emptyState}>
          <h3>No resources match the current filters</h3>
          <p>Try another subject, clear the search, or switch the resource view.</p>
        </section>
      )}
    </section>
  );
}

export default LearningMaterials;
