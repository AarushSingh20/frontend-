import { createContext, forwardRef, useCallback, useContext, useEffect, useMemo, useState } from 'react';

/**
 * A tiny router (no library needed) so the site can have real pages: /, /login, /signup, /app.
 *
 * - History mode (default): the address bar changes (/login), and Back/Forward work.
 *   Your server must send index.html for these paths (see README, "Pages and routes").
 * - Memory mode: set VITE_ROUTER_MODE=memory. The address bar never changes. It is used for the
 *   hosted preview page, which cannot change its own address.
 */
const BASE = String(import.meta.env?.BASE_URL || '/').replace(/\/+$/, '');
const MEMORY = import.meta.env?.VITE_ROUTER_MODE === 'memory';

// Every page except the home page. Anything not listed here shows the home page.
export const APP_ROUTES = ['/login', '/signup', '/choose-account', '/auth/callback', '/forgot-password', '/reset-password', '/accept-invitation', '/app'];
// The organization dashboard: /organization and every page under it (/organization/projects, ...)
export const isDashboardPath = (path) => path === '/organization' || path.startsWith('/organization/');
export const isTeamLeaderPath = (path) => path === '/team-leader' || path.startsWith('/team-leader/');
// The individual creator's dashboard (/dashboard/...). Not to be confused with isDashboardPath, the organization's.
export const isIndividualPath = (path) => path === '/dashboard' || path.startsWith('/dashboard/');
export const isHomePath = (path) => !APP_ROUTES.includes(path) && !isDashboardPath(path) && !isTeamLeaderPath(path) && !isIndividualPath(path);
export const isAuthPath = (path) => path === '/login' || path === '/signup';

const normalize = (p) => {
  const cleaned = String(p || '/').split(/[?#]/)[0].replace(/\/+$/, '');
  return cleaned || '/';
};

// "/reset-password?token=abc#x" -> { path: '/reset-password', search: '?token=abc' }
const parseTo = (to) => {
  const [withoutHash] = String(to || '/').split('#');
  const [path, ...query] = withoutHash.split('?');
  return { path: normalize(path), search: query.length ? `?${query.join('?')}` : '' };
};

const fromLocation = () => {
  if (MEMORY || typeof window === 'undefined') return '/';
  let p = window.location.pathname;
  if (BASE && p.startsWith(BASE)) p = p.slice(BASE.length);
  return normalize(p);
};

const searchFromLocation = () => (MEMORY || typeof window === 'undefined' ? '' : window.location.search);

const toHref = (path) => `${BASE}${path === '/' ? '/' : path}`;

const RouterContext = createContext({ path: '/', search: '', navigate: () => {} });

export function RouterProvider({ children }) {
  const [location, setLocation] = useState(() => ({ path: fromLocation(), search: searchFromLocation() }));

  useEffect(() => {
    if (MEMORY) return undefined;
    const onPop = () => setLocation({ path: fromLocation(), search: searchFromLocation() });
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const navigate = useCallback((to, { replace = false } = {}) => {
    const { path: next, search } = parseTo(to);
    if (!MEMORY) {
      try {
        const url = toHref(next) + search;
        if (replace) window.history.replaceState(null, '', url);
        else window.history.pushState(null, '', url);
      } catch {
        /* A sandboxed page may not be allowed to change its address. The route still changes. */
      }
    }
    setLocation({ path: next, search });
    window.scrollTo(0, 0);
  }, []);

  const value = useMemo(() => ({ path: location.path, search: location.search, navigate }), [location, navigate]);
  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>;
}

export const useRouter = () => useContext(RouterContext);

/** A normal link that switches page without reloading. Ctrl/Cmd-click still opens a new tab. */
export const Link = forwardRef(function Link({ to, replace = false, onClick, children, ...rest }, ref) {
  const { navigate } = useRouter();
  const handleClick = (event) => {
    onClick?.(event);
    if (event.defaultPrevented || event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    navigate(to, { replace });
  };
  const { path, search } = parseTo(to);
  return (
    <a ref={ref} href={toHref(path) + search} onClick={handleClick} {...rest}>
      {children}
    </a>
  );
});
