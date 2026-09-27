import { useRef, useState } from 'react';
import logoUrl from '../assets/images/cinemor-logo.png';
import cx from '../utils/cx.js';
import { Link, useRouter } from '../router/router.jsx';
import {
  IconBriefcase,
  IconBuilding,
  IconChevronLeft,
  IconChevronRight,
  IconOverview,
  IconProjects,
  IconShield,
  IconUserCog,
  IconUserPlus,
  IconUsers,
  IconWrench,
} from './ui/DashIcons.jsx';
import styles from './Sidebar.module.css';

// The menu. To add a page: add a line here, a route in DashboardApp.jsx, and a page file.
export const NAV = [
  {
    section: 'Workspace',
    items: [
      { to: '/organization', label: 'Overview', icon: IconOverview },
      { to: '/organization/projects', label: 'All Projects', icon: IconProjects },
      { to: '/organization/employees', label: 'Employees', icon: IconUsers },
      { to: '/organization/team-leaders', label: 'Team Leaders', icon: IconShield },
      { to: '/organization/reviewers', label: 'Reviewers', icon: IconUserCog },
      { to: '/organization/job-roles', label: 'Job Roles', icon: IconBriefcase },
      { to: '/organization/clients', label: 'Clients', icon: IconBuilding },
      { to: '/organization/invitations', label: 'Invitations', icon: IconUserPlus },
      { to: '/organization/tools', label: 'Tools', icon: IconWrench },
    ],
  },
];

/**
 * The dashboard's left rail. By default it is a slim, icon-only rail (a fixed accessible name is set on every
 * item with aria-label, and a small tooltip shows the word on hover or keyboard focus, so nothing is lost by
 * hiding the text); "Expand sidebar" turns it into the earlier, wider menu with the labels shown. On phones it is
 * always the wide, labelled version, opened as a drawer (see the media query at the bottom of the CSS).
 */
export default function Sidebar({ collapsed, onToggle, drawerOpen, nav = NAV, home = '/organization' }) {
  const { path } = useRouter();
  const asideRef = useRef(null);
  // The one tooltip shown while the rail is icon-only, for whichever item has the mouse or the keyboard focus.
  // It is a sibling of the scrolling <nav>, not a child of it, so nav's own scrollbar never clips it (a scrolling
  // box always clips both directions once either one scrolls, even when the other is set to "visible").
  const [tip, setTip] = useState(null); // { label, top } | null
  const showTip = (label) => (event) => {
    if (!collapsed) return;
    const target = event.currentTarget.getBoundingClientRect();
    const host = asideRef.current?.getBoundingClientRect();
    if (!host) return;
    setTip({ label, top: target.top - host.top + target.height / 2 });
  };
  const hideTip = () => setTip(null);

  return (
    <aside ref={asideRef} className={cx(styles.sidebar, collapsed && styles.collapsed, drawerOpen && styles.drawerOpen)} aria-label="Organization menu">
      <div className={styles.brand}>
        <Link to={home} className={styles.logo} aria-label="cinemor.ai, dashboard home">
          <img className={styles.logoImg} src={logoUrl} width={30} height={30} alt="" />
          <span className={styles.wordmark}>
            cinemor<em>.ai</em>
          </span>
        </Link>
      </div>

      <nav className={styles.nav} aria-label="Dashboard pages">
        {nav.map((group) => (
          <div key={group.section} className={styles.group}>
            <p className={styles.section}>{group.section}</p>
            {group.items.map((item) => {
              const Icon = item.icon;
              // an item may also stay highlighted on its sub-pages (`match`), e.g. My Projects on a project's own page
              const current = item.match ? item.match(path) : path === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cx(styles.link, current && styles.active)}
                  aria-current={current ? 'page' : undefined}
                  aria-label={item.label}
                  onMouseEnter={showTip(item.label)}
                  onMouseLeave={hideTip}
                  onFocus={showTip(item.label)}
                  onBlur={hideTip}
                >
                  <span className={styles.linkIcon} aria-hidden="true">
                    <Icon width={19} height={19} />
                  </span>
                  <span className={styles.linkText}>{item.label}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <button
        type="button"
        className={styles.collapse}
        onClick={onToggle}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        aria-pressed={collapsed}
        onMouseEnter={showTip('Expand sidebar')}
        onMouseLeave={hideTip}
        onFocus={showTip('Expand sidebar')}
        onBlur={hideTip}
      >
        {collapsed ? <IconChevronRight width={18} height={18} /> : <IconChevronLeft width={18} height={18} />}
        <span className={styles.collapseText}>Collapse sidebar</span>
      </button>

      {/* one shared tooltip, positioned in JS: it is a sibling of <nav>, so its scrollbar can never clip it */}
      {collapsed && tip && (
        <span className={styles.railTip} style={{ top: tip.top }} aria-hidden="true">
          {tip.label}
        </span>
      )}
    </aside>
  );
}
