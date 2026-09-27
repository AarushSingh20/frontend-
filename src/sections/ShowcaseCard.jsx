import { useRef } from 'react';
import { SHOWCASE } from '../data/content.js';
import usePrefersReducedMotion from '../hooks/usePrefersReducedMotion.js';
import useScrollReveal from '../hooks/useScrollReveal.js';
import { Play } from '../components/Icons.jsx';
import styles from './ShowcaseCard.module.css';

/**
 * The large near-full-width card that grows into view as you scroll.
 * Right now it is empty (a placeholder). To add the product video later,
 * set videoSrc (and optionally poster) in data/content.js, or pass them as props.
 */
export default function ShowcaseCard({ videoSrc = SHOWCASE.videoSrc, poster = SHOWCASE.poster }) {
  const sectionRef = useRef(null);
  const reduced = usePrefersReducedMotion();
  useScrollReveal(sectionRef, { start: 0.98, end: 0.34, disabled: reduced });

  return (
    <section id="how-it-works" ref={sectionRef} className={styles.section} aria-label={SHOWCASE.label}>
      <div className={styles.card}>
        {videoSrc ? (
          <video className={styles.video} src={videoSrc} poster={poster || undefined} controls playsInline preload="metadata" />
        ) : (
          <div className={styles.empty}>
            <span className={styles.play} aria-hidden="true">
              <Play width={30} height={30} />
            </span>
            <p className={styles.label}>{SHOWCASE.label}</p>
            <p className={styles.note}>{SHOWCASE.emptyNote}</p>
          </div>
        )}
      </div>
    </section>
  );
}
