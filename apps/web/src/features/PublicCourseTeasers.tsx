import { learningCourses } from "../courseLearning";

/**
 * Public entry into the same versioned course projection used by /corsi/.
 * No duplicate static course inventory or invented editorial progress.
 */
export function PublicCourseTeasers() {
  return (
    <section className="public-courses-entry" aria-labelledby="public-courses-title">
      <div className="public-courses-intro">
        <div>
          <p className="public-courses-eyebrow">Semestre filtro · Fisica 2026/27</p>
          <h2 id="public-courses-title">Quattro percorsi. Una fisica da capire.</h2>
          <p>Dal ragionamento alla prova: scegli un percorso e apri le lezioni dimostrative già disponibili. I contenuti completi sono ancora in revisione.</p>
        </div>
        <a className="public-courses-all" href="/corsi/">Esplora tutto il catalogo <span aria-hidden="true">↗</span></a>
      </div>
      <div className="public-courses-grid">
        {learningCourses.courses.map((course, index) => (
          <article key={course.pathId} className="public-course-tile">
            <p className="public-course-tile-meta">
              <span>{String(index + 1).padStart(2, "0")}</span>
              <span>{course.unitIds.join(" · ")}</span>
            </p>
            <h3>{course.title}</h3>
            <p>{course.availableLessons} {course.availableLessons === 1 ? "lezione dimostrativa" : "lezioni dimostrative"} {course.availableLessons === 1 ? "disponibile" : "disponibili"}.</p>
            <p className="public-course-tile-status">Percorso in preparazione · {course.completedObjectives}/{course.requiredObjectives} obiettivi accettati</p>
            <a href={`/corsi/${course.pathId}/`} aria-label={`Apri il percorso ${course.title}`}>
              Apri il percorso <span aria-hidden="true">↗</span>
            </a>
          </article>
        ))}
      </div>
    </section>
  );
}
