import cx from '../../utils/cx.js';
import Pill from '../ui/Pill.jsx';
import header from '../ui/PageHeader.module.css';
import { PROJECT_STATUSES, PROJECT_TYPES } from './individualApi.js';
import css from './Individual.module.css';

/** The top of each individual dashboard page: the same look as the other dashboards, labelled "Creator Workspace". */
export function Header({ title, subtitle, actions, eyebrow = 'Creator Workspace' }) {
  return (
    <header className={header.header}>
      <div className={header.block}>
        <div className={header.text}>
          {eyebrow && <p className={header.eyebrow}>{eyebrow}</p>}
          <h1 className={header.title}>{title}</h1>
          {subtitle && <p className={header.subtitle}>{subtitle}</p>}
        </div>
      </div>
      {actions && <div className={header.actions}>{actions}</div>}
    </header>
  );
}

// A calendar, drawn like the other dashboard icons (DashIcons.jsx has none).
export function IconCalendar(props) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" {...props}>
      <rect x="3" y="4.5" width="18" height="16.5" rx="2.5" />
      <path d="M8 2.5v4M16 2.5v4M3 10h18" />
    </svg>
  );
}

// An arrow pointing right, for "View all", "Open" and the project rows.
export function IconArrowRight(props) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" {...props}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

/** '2026-09-26' -> '26 Sept 2026'. Empty stays empty. */
export function formatDate(value) {
  if (!value) return '';
  const [y, m, d] = String(value).slice(0, 10).split('-').map(Number);
  if (!y || !m || !d) return '';
  return new Date(y, m - 1, d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

/** Today as 'YYYY-MM-DD' in the viewer's own time zone (the default start date). */
export function today() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

export function StatusPill({ status }) {
  const s = PROJECT_STATUSES[status] || PROJECT_STATUSES.pending;
  return <Pill tone={s.tone}>{s.label}</Pill>;
}

/** "Personal Project", or the client's name for a client project. */
export function projectFor(project) {
  if (project.projectType === 'client') return project.clientName ? `Client: ${project.clientName}` : PROJECT_TYPES.client;
  return PROJECT_TYPES.personal;
}

/** A small square icon tile. */
export function Tile({ icon: Icon, size = 'md', className }) {
  return (
    <span className={cx(css.tile, size === 'lg' && css.tileLg, size === 'sm' && css.tileSm, className)} aria-hidden="true">
      <Icon width={size === 'lg' ? 24 : 20} height={size === 'lg' ? 24 : 20} />
    </span>
  );
}
