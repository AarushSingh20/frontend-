import { useEffect } from 'react';
import { useAuth } from '../../auth/AuthContext.jsx';
import { homeFor } from '../../auth/homeFor.js';
import { useRouter } from '../../router/router.jsx';
import DashboardLayout from '../DashboardLayout.jsx';
import { ThemeProvider } from '../ThemeContext.jsx';
import { WorkspaceProvider } from '../WorkspaceContext.jsx';
import '../theme.css';
import { IconGear, IconOverview, IconProjects, IconUsers } from '../ui/DashIcons.jsx';
import { ToastProvider } from '../ui/Toast.jsx';
import ClientsPage from './ClientsPage.jsx';
import { setDemoOwner } from './individualApi.js';
import OverviewPage from './OverviewPage.jsx';
import ProjectFormPage from './ProjectFormPage.jsx';
import ProjectPage from './ProjectPage.jsx';
import ProjectsPage from './ProjectsPage.jsx';
import SettingsPage from './SettingsPage.jsx';

const NAV = [
  {
    section: 'Workspace',
    items: [
      { to: '/dashboard', label: 'Overview', icon: IconOverview },
      { to: '/dashboard/projects', label: 'My Projects', icon: IconProjects, match: (p) => p === '/dashboard/projects' || p.startsWith('/dashboard/projects/') },
      { to: '/dashboard/clients', label: 'Clients', icon: IconUsers },
    ],
  },
  {
    section: 'Account',
    items: [{ to: '/dashboard/settings', label: 'Settings', icon: IconGear }],
  },
];
const ROLE = { roleTitle: 'Creator', roleLabel: 'Individual Creator', roleSentence: 'Individual Creator' };

// Which page an address is. "My Projects" stays highlighted in the menu on a project's own pages.
function pageFor(path) {
  if (path === '/dashboard') return { page: 'overview' };
  if (path === '/dashboard/projects') return { page: 'projects' };
  if (path === '/dashboard/projects/new') return { page: 'new' };
  if (path === '/dashboard/clients') return { page: 'clients' };
  if (path === '/dashboard/settings') return { page: 'settings' };
  let m = path.match(/^\/dashboard\/projects\/(\d+)$/);
  if (m) return { page: 'project', id: Number(m[1]) };
  m = path.match(/^\/dashboard\/projects\/(\d+)\/edit$/);
  if (m) return { page: 'edit', id: Number(m[1]) };
  return null;
}

/**
 * The individual creator's dashboard (/dashboard/...): Overview, My Projects (with create, edit and one project's
 * page), Clients and Settings, in the same frame as the organization and Team Leader dashboards. Only individual
 * accounts may see it; anyone else is sent to their own home page (see auth/homeFor.js).
 * Not connected to the backend yet: see individualApi.js.
 */
export default function IndividualApp() {
  const { path, navigate } = useRouter();
  const { user, checking } = useAuth();
  const allowed = user?.accountType === 'individual';
  const route = pageFor(path);
  if (allowed) setDemoOwner(user.email);

  useEffect(() => {
    if (checking) return;
    if (!user) navigate('/login', { replace: true });
    else if (!allowed) navigate(homeFor(user), { replace: true });
    else if (!route) navigate('/dashboard', { replace: true });
  }, [checking, user, allowed, route, navigate]);

  if (!allowed || !route) return null;

  let page;
  if (route.page === 'projects') page = <ProjectsPage />;
  else if (route.page === 'new') page = <ProjectFormPage />;
  else if (route.page === 'edit') page = <ProjectFormPage key={`edit-${route.id}`} projectId={route.id} />;
  else if (route.page === 'project') page = <ProjectPage key={route.id} projectId={route.id} />;
  else if (route.page === 'clients') page = <ClientsPage />;
  else if (route.page === 'settings') page = <SettingsPage />;
  else page = <OverviewPage />;

  return (
    <ThemeProvider>
      <WorkspaceProvider role={ROLE} personName={user.email.split('@')[0]}>
        <ToastProvider>
          <DashboardLayout nav={NAV} home="/dashboard" settingsTo="/dashboard/settings">
            {page}
          </DashboardLayout>
        </ToastProvider>
      </WorkspaceProvider>
    </ThemeProvider>
  );
}
