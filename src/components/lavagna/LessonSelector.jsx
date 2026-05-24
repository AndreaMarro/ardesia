import React from 'react';
import { getLessonsForVolume } from '../../data/lesson-groups';
import { isDemoExperiment, DEMO_MODE_ENABLED } from '../../data/demo-mode';
import styles from './LessonSelector.module.css';

export default function LessonSelector({ volumeNumber, activeLessonId, onLessonSelect }) {
  let lessons = getLessonsForVolume(volumeNumber);
  // Andrea 24/05 PM STRICT: nascondi lezioni senza esp demo
  if (DEMO_MODE_ENABLED) {
    lessons = lessons.filter(([, lesson]) =>
      lesson.experiments?.some(eid => isDemoExperiment(eid))
    );
  }

  return (
    <nav className={styles.container} aria-label="Scegli lezione">
      <ul className={styles.list}>
        {lessons.map(([lessonId, lesson]) => {
          const isActive = lessonId === activeLessonId;
          return (
            <li key={lessonId} className={styles.itemWrap}>
              <button
                type="button"
                data-testid={`lesson-option-${lessonId}`}
                className={`${styles.item} ${isActive ? styles.selected : ''}`}
                onClick={() => onLessonSelect?.(lessonId)}
                aria-pressed={isActive}
              >
                <span className={styles.chapter}>Cap. {lesson.chapter}</span>
                <span className={styles.title}>{lesson.title}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
