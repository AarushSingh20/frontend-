/**
 * Everything the individual dashboard (/dashboard) reads and writes: the signed-in creator's own clients and projects.
 *
 * NOT CONNECTED YET. Every function runs on a DEMO DATABASE for now: it lives in memory and, where the browser allows,
 * in localStorage (key 'cm-demo-individual'), kept separately for each signed-in email.
 *
 * It is shaped after the backend's own routes (app/api/routes/individual_routes.py), so connecting it later is mostly
 * replacing each demo block with a request() call and mapping the field names:
 *
 *   GET    /api/individual/clients                 listClients()
 *   GET    /api/individual/clients/{client_id}     getClient(id)
 *   POST   /api/individual/clients                 createClient({ name, email, phone, companyName })
 *   PATCH  /api/individual/clients/{client_id}     updateClient(id, { name, email, phone, companyName })
 *   DELETE /api/individual/clients/{client_id}     deleteClient(id)                      -> 204
 *
 *   GET    /api/individual/projects                listProjects()
 *   GET    /api/individual/projects/{project_id}   getProject(id)
 *   POST   /api/individual/projects                createProject({ title, description, projectType, clientId, startedDate, deadline })
 *   PATCH  /api/individual/projects/{project_id}   updateProject(id, { ...the same, status })
 *   DELETE /api/individual/projects/{project_id}   deleteProject(id)                     -> 204
 *
 * Field names: this file uses camelCase; the backend uses snake_case
 *   companyName <-> company_name   projectType <-> project_type   clientId <-> client_id
 *   startedDate <-> started_date   (deadline and status are the same)
 * Dates are 'YYYY-MM-DD' strings (what a date input gives, and what a FastAPI `date` field accepts).
 *
 * Still to confirm against app/schemas/individual_project.py when connecting (guessed here):
 *   projectType  'personal' | 'client'           (the "Myself" / "Client" choice)
 *   status       'pending' | 'active' | 'completed'  (a new project is 'pending')
 * and whether the backend refuses to delete a client that still has projects (this demo does, with a message).
 */
import { wait } from '../../services/api.js';

const KEY = 'cm-demo-individual';
const LATENCY = 240;

export const PROJECT_TYPES = { personal: 'Personal Project', client: 'Client Project' };
export const PROJECT_STATUSES = {
  pending: { label: 'Pending', tone: 'blue' },
  active: { label: 'Active', tone: 'amber' },
  completed: { label: 'Completed', tone: 'green' },
};

let store = {};
try {
  store = JSON.parse(window.localStorage.getItem(KEY)) || {};
} catch {
  /* storage blocked or empty: start with an empty demo database */
}

const persist = () => {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(store));
  } catch {
    /* ignore */
  }
};
const fail = (message, status) => Object.assign(new Error(message), { status });
const clone = (value) => JSON.parse(JSON.stringify(value));

// The signed-in creator's own space in the demo database (each email gets its own clients and projects).
let owner = '';
/** Called by the dashboard once it knows who is signed in. */
export function setDemoOwner(email) {
  owner = String(email || '').trim().toLowerCase();
}
const space = () => {
  if (!owner) throw fail('Please log in again.', 401);
  if (!store[owner]) store[owner] = { next: { client: 1, project: 1 }, clients: [], projects: [] };
  return store[owner];
};

async function demo(action) {
  await wait(LATENCY);
  const result = action(space());
  persist();
  return result === undefined ? undefined : clone(result);
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const clean = (v) => (typeof v === 'string' ? v.trim() : v ?? '');

/* ------------------------------------------------------------------------------------------------- clients */
function checkClient({ name, email }) {
  if (!clean(name)) throw fail('Enter the client name.', 422);
  if (clean(email) && !EMAIL.test(clean(email))) throw fail('Enter a valid email address, like client@company.com.', 422);
}
const clientView = (s, c) => ({ ...c, projectCount: s.projects.filter((p) => p.clientId === c.id).length });

export async function listClients() {
  return demo((s) => s.clients.map((c) => clientView(s, c)));
}

export async function getClient(id) {
  return demo((s) => {
    const client = s.clients.find((c) => c.id === Number(id));
    if (!client) throw fail('That client no longer exists.', 404);
    return clientView(s, client);
  });
}

export async function createClient(values) {
  return demo((s) => {
    checkClient(values);
    const now = new Date().toISOString();
    const client = { id: s.next.client++, name: clean(values.name), email: clean(values.email), phone: clean(values.phone), companyName: clean(values.companyName), createdAt: now, updatedAt: now };
    s.clients.push(client);
    return clientView(s, client);
  });
}

export async function updateClient(id, values) {
  return demo((s) => {
    const client = s.clients.find((c) => c.id === Number(id));
    if (!client) throw fail('That client no longer exists.', 404);
    checkClient(values);
    Object.assign(client, { name: clean(values.name), email: clean(values.email), phone: clean(values.phone), companyName: clean(values.companyName), updatedAt: new Date().toISOString() });
    return clientView(s, client);
  });
}

export async function deleteClient(id) {
  return demo((s) => {
    const client = s.clients.find((c) => c.id === Number(id));
    if (!client) throw fail('That client no longer exists.', 404);
    const used = s.projects.filter((p) => p.clientId === client.id).length;
    if (used) throw fail(`${client.name} still has ${used} ${used === 1 ? 'project' : 'projects'}. Delete ${used === 1 ? 'it' : 'them'}, or change ${used === 1 ? 'it' : 'them'} to a personal project, first.`, 409);
    s.clients = s.clients.filter((c) => c.id !== client.id);
  });
}

/* ------------------------------------------------------------------------------------------------ projects */
function checkProject(s, { title, projectType, clientId, startedDate, deadline, status }) {
  if (!clean(title)) throw fail('Enter a project title.', 422);
  if (!PROJECT_TYPES[projectType]) throw fail('Choose who the project is for.', 422);
  if (projectType === 'client' && !s.clients.some((c) => c.id === Number(clientId))) throw fail('Choose a client for this project.', 422);
  if (startedDate && !DATE.test(startedDate)) throw fail('Enter a valid start date.', 422);
  if (deadline && !DATE.test(deadline)) throw fail('Enter a valid deadline.', 422);
  if (startedDate && deadline && deadline < startedDate) throw fail('The deadline can’t be before the start date.', 422);
  if (status !== undefined && !PROJECT_STATUSES[status]) throw fail('Unknown project status.', 422);
}
const projectView = (s, p) => ({ ...p, clientName: p.clientId ? s.clients.find((c) => c.id === p.clientId)?.name ?? '' : '' });

export async function listProjects() {
  return demo((s) => [...s.projects].sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1)).map((p) => projectView(s, p)));
}

export async function getProject(id) {
  return demo((s) => {
    const project = s.projects.find((p) => p.id === Number(id));
    if (!project) throw fail('That project no longer exists.', 404);
    return projectView(s, project);
  });
}

export async function createProject(values) {
  return demo((s) => {
    checkProject(s, values);
    const now = new Date().toISOString();
    const project = {
      id: s.next.project++,
      title: clean(values.title),
      description: clean(values.description),
      projectType: values.projectType,
      clientId: values.projectType === 'client' ? Number(values.clientId) : null,
      startedDate: values.startedDate || null,
      deadline: values.deadline || null,
      status: 'pending',
      createdAt: now,
      updatedAt: now,
    };
    s.projects.push(project);
    return projectView(s, project);
  });
}

export async function updateProject(id, values) {
  return demo((s) => {
    const project = s.projects.find((p) => p.id === Number(id));
    if (!project) throw fail('That project no longer exists.', 404);
    checkProject(s, values);
    Object.assign(project, {
      title: clean(values.title),
      description: clean(values.description),
      projectType: values.projectType,
      clientId: values.projectType === 'client' ? Number(values.clientId) : null,
      startedDate: values.startedDate || null,
      deadline: values.deadline || null,
      ...(values.status ? { status: values.status } : {}),
      updatedAt: new Date().toISOString(),
    });
    return projectView(s, project);
  });
}

export async function deleteProject(id) {
  return demo((s) => {
    if (!s.projects.some((p) => p.id === Number(id))) throw fail('That project no longer exists.', 404);
    s.projects = s.projects.filter((p) => p.id !== Number(id));
  });
}
