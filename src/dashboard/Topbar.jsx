import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../auth/AuthContext.jsx';
import { Link, useRouter } from '../router/router.jsx';
import cx from '../utils/cx.js';
import { useTheme } from './ThemeContext.jsx';
import { useWorkspace } from './WorkspaceContext.jsx';
import { IconChevronDown, IconGear, IconLogOut, IconMenu, IconMoon, IconSun } from './ui/DashIcons.jsx';
import styles from './Topbar.module.css';

// Closes a dropdown when you click outside it or press Esc.
function useDismiss(open, close, ref) {
  useEffect(() => {
    if (!open) return undefined;
    const onDown = (event) => !ref.current?.contains(event.target) && close();
    const onKey = (event) => event.key === 'Escape' && close();
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, close, ref]);
}

// Shows which theme you are in ("Light" or "Dark"); one click switches to the other one.
function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const light = theme === 'light';
  return (
    <button type="button" className={styles.theme} onClick={toggle} aria-label={light ? 'Switch to dark theme' : 'Switch to light theme'}>
      <span key={theme} className={styles.themeIcon} aria-hidden="true">
        {light ? <IconSun width={18} height={18} /> : <IconMoon width={18} height={18} />}
      </span>
      <span className={styles.themeLabel}>{light ? 'Light' : 'Dark'}</span>
    </button>
  );
}

function UserMenu({ settingsTo = '/organization/settings' }) {
  const { displayName, initials, roleTitle, roleLabel } = useWorkspace();
  const { signOut } = useAuth();
  const { navigate } = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useDismiss(open, () => setOpen(false), ref);

  return (
    <div className={styles.menuWrap} ref={ref}>
      <button type="button" className={styles.user} aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((v) => !v)} aria-label={`Account menu for ${displayName}`}>
        <span className={styles.avatar} aria-hidden="true">
          {initials}
        </span>
        <span className={styles.userText}>
          <span className={styles.userName}>{roleTitle}</span>
          <span className={styles.userRole}>{roleLabel}</span>
        </span>
        <IconChevronDown width={16} height={16} className={cx(styles.chevron, open && styles.flip)} />
      </button>
      {open && (
        <div className={cx(styles.panel, styles.menu)} role="menu">
          {settingsTo && (
            <Link to={settingsTo} className={styles.menuItem} role="menuitem" onClick={() => setOpen(false)}>
              <IconGear width={18} height={18} />
              Settings
            </Link>
          )}
          <button
            type="button"
            className={styles.menuItem}
            role="menuitem"
            onClick={async () => {
              setOpen(false);
              await signOut();
              navigate('/');
            }}
          >
            <IconLogOut width={18} height={18} />
            Log out
          </button>
        </div>
      )}
    </div>
  );
}

export default function Topbar({ onMenu, settingsTo }) {
  const { displayName } = useWorkspace();
  return (
    <header className={styles.bar}>
      <button type="button" className={cx(styles.iconButton, styles.menuButton)} onClick={onMenu} aria-label="Open menu">
        <IconMenu width={20} height={20} />
      </button>
      <div className={styles.welcome}>
        <p className={styles.small}>Welcome back,</p>
        <p className={styles.name}>{displayName}</p>
      </div>
      <div className={styles.right}>
        <ThemeToggle />
        <UserMenu settingsTo={settingsTo} />
      </div>
    </header>
  );
}
