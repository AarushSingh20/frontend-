import { useState } from 'react';
import useDocumentTitle from '../../hooks/useDocumentTitle.js';
import { Link, useRouter } from '../../router/router.jsx';
import cx from '../../utils/cx.js';
import useResource from '../hooks/useResource.js';
import Button from '../ui/Button.jsx';
import ConfirmModal from '../ui/ConfirmModal.jsx';
import { IconChevronLeft, IconPencil, IconPlay, IconProjects, IconTrash, IconUser } from '../ui/DashIcons.jsx';
import Notice from '../ui/Notice.jsx';
import { useToast } from '../ui/Toast.jsx';
import { deleteProject, getProject, PROJECT_TYPES } from './individualApi.js';
import { formatDate, IconCalendar, StatusPill, Tile } from './parts.jsx';
import s from './Individual.module.css';

// The creation workflow. Only the first step exists as a real page later on; the others say so.
const STEPS = [
  { no: '01', title: 'Create Story', text: 'Generate or develop the complete story for your project.', ready: true },
  { no: '02', title: 'Storyboard', text: 'Turn your story into a structured storyboard.', ready: false },
  { no: '03', title: 'AI Animation', text: 'Turn your storyboard into AI-generated animation.', ready: false },
];

/** One project: what it is, the creation workflow, its details, and Edit / Delete. */
export default function ProjectPage({ projectId }) {
  const toast = useToast();
  const { navigate } = useRouter();
  const { data: project, error, reload } = useResource(() => getProject(projectId), [projectId]);
  const [deleting, setDeleting] = useState(false);
  useDocumentTitle(project?.title || 'Project');

  const backLink = (
    <Link to="/dashboard/projects" className={s.back}>
      <IconChevronLeft width={16} height={16} /> Back to Projects
    </Link>
  );

  if (!project) {
    return (
      <div className={s.page} aria-busy={!error}>
        {backLink}
        {error && <Notice message={error.message} onRetry={reload} />}
      </div>
    );
  }

  const client = project.projectType === 'client';

  return (
    <div className={s.page}>
      {backLink}
      <div className={s.projectHead}>
        <div className={s.projectTitleRow}>
          <Tile icon={IconProjects} size="lg" />
          <div style={{ minWidth: 0 }}>
            <h1 className={s.projectTitle}>{project.title}</h1>
            <div className={s.projectTags}>
              <StatusPill status={project.status} />
              <span>{client ? `Client Project${project.clientName ? ` · ${project.clientName}` : ''}` : PROJECT_TYPES.personal}</span>
            </div>
          </div>
        </div>
        <div className={s.headButtons}>
          <Button variant="secondary" icon={IconPencil} onClick={() => navigate(`/dashboard/projects/${project.id}/edit`)}>
            Edit
          </Button>
          <Button variant="danger" icon={IconTrash} onClick={() => setDeleting(true)}>
            Delete
          </Button>
        </div>
      </div>

      <div className={s.detailLayout}>
        <div className={s.formMain}>
          <section className={cx(s.card, s.panel)} aria-labelledby="ind-overview">
            <div className={s.panelHead}>
              <Tile icon={IconProjects} />
              <div>
                <h2 id="ind-overview" className={s.panelTitle}>
                  Project Overview
                </h2>
                <p className={s.panelSub}>Basic information about this project.</p>
              </div>
            </div>
            <p className={s.description}>{project.description || <span className={s.muted}>No description yet. Use Edit to add one.</span>}</p>
          </section>

          <section className={cx(s.card, s.panel)} aria-labelledby="ind-workflow">
            <div className={s.panelHead}>
              <Tile icon={IconPlay} />
              <div>
                <h2 id="ind-workflow" className={s.panelTitle}>
                  Creative Workflow
                </h2>
                <p className={s.panelSub}>Continue building this project with Cinemor AI.</p>
              </div>
            </div>
            <ol className={s.steps}>
              {STEPS.map((step) => (
                <li key={step.no} className={s.step}>
                  <span className={s.stepNo}>{step.no}</span>
                  <span className={s.stepTitle}>{step.title}</span>
                  <span className={s.stepText}>{step.text}</span>
                  <span className={s.stepAction}>
                    {step.ready ? (
                      // The story workspace is its own page, still to be built; until then this says so.
                      <Button onClick={() => toast('The story workspace is coming soon.')}>Start Story</Button>
                    ) : (
                      <Button variant="secondary" disabled>
                        Coming Next
                      </Button>
                    )}
                  </span>
                </li>
              ))}
            </ol>
          </section>
        </div>

        <aside className={cx(s.card, s.panel)} aria-labelledby="ind-details">
          <h2 id="ind-details" className={s.panelTitle}>
            Project Details
          </h2>
          <div className={s.details}>
            <Detail icon={IconCalendar} label="Start Date" value={formatDate(project.startedDate) || 'Not set'} />
            <Detail icon={IconCalendar} label="Deadline" value={formatDate(project.deadline) || 'Not set'} />
            <Detail icon={IconProjects} label="Project Type" value={client ? 'Client' : 'Personal'} />
            {client && <Detail icon={IconUser} label="Client" value={project.clientName || '-'} />}
          </div>
        </aside>
      </div>

      <ConfirmModal
        open={deleting}
        title="Delete project?"
        text={`"${project.title}" will be deleted. This can't be undone.`}
        confirmLabel="Delete Project"
        onClose={() => setDeleting(false)}
        onConfirm={async () => {
          await deleteProject(project.id);
          toast('Project deleted');
          navigate('/dashboard/projects', { replace: true });
        }}
      />
    </div>
  );
}

function Detail({ icon: Icon, label, value }) {
  return (
    <div className={s.detail}>
      <Icon width={18} height={18} />
      <span>
        <span className={s.detailLabel}>{label}</span>
        <span className={s.detailValue}>{value}</span>
      </span>
    </div>
  );
}
