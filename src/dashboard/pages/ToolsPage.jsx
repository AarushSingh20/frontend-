import { useState } from 'react';
import useDocumentTitle from '../../hooks/useDocumentTitle.js';
import TextField from '../../components/auth/TextField.jsx';
import { createTool, listTools } from '../api/organizationApi.js';
import useModalForm from '../hooks/useModalForm.js';
import useResource from '../hooks/useResource.js';
import useOpenFromQuery from '../hooks/useOpenFromQuery.js';
import Button from '../ui/Button.jsx';
import DataTable from '../ui/DataTable.jsx';
import { IconExternal, IconPlus, IconWrench } from '../ui/DashIcons.jsx';
import EmptyState from '../ui/EmptyState.jsx';
import Modal, { ModalFooter } from '../ui/Modal.jsx';
import Notice from '../ui/Notice.jsx';
import PageHeader from '../ui/PageHeader.jsx';
import RefreshButton from '../ui/RefreshButton.jsx';
import { useToast } from '../ui/Toast.jsx';
import styles from './pages.module.css';

const isWebAddress = (value) => {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
};

const COLUMNS = [
  { key: 'no', header: 'No.', render: (_row, index) => index + 1 },
  { key: 'name', header: 'Tool', render: (row) => <strong>{row.name}</strong> },
  { key: 'description', header: 'Description', wrap: true, render: (row) => row.description },
  {
    key: 'url',
    header: 'Website',
    render: (row) =>
      row.url ? (
        <a className={styles.inlineLink} href={row.url} target="_blank" rel="noreferrer noopener">
          <span className={styles.contact}>
            {row.url.replace(/^https?:\/\//, '')}
            <IconExternal width={14} height={14} />
          </span>
        </a>
      ) : (
        <span className={styles.muted}>-</span>
      ),
  },
];

// Tools has its own header layout: the icon tile beside the title, Refresh and Add Tool underneath.
export default function ToolsPage() {
  useDocumentTitle('Tools');
  const toast = useToast();
  const { data, loading, error, reload } = useResource(listTools, []);
  const [adding, setAdding] = useState(false);
  useOpenFromQuery(() => setAdding(true));
  const tools = data ?? [];

  return (
    <div className={styles.page}>
      <PageHeader
        stacked
        icon={IconWrench}
        title="Tools"
        subtitle="Manage the tools and software used by your organization."
        actions={
          <>
            <RefreshButton withText onClick={reload} loading={loading} />
            <Button icon={IconPlus} onClick={() => setAdding(true)}>
              Add Tool
            </Button>
          </>
        }
      />
      {error && <Notice message={error.message} onRetry={reload} />}

      {tools.length === 0 ? (
        <EmptyState
          framed={false}
          icon={IconWrench}
          title="No tools added yet"
          text="Add the tools and software your organization uses for its projects."
          action={
            <Button icon={IconPlus} onClick={() => setAdding(true)}>
              Add Your First Tool
            </Button>
          }
        />
      ) : (
        <DataTable caption="Tools" columns={COLUMNS} rows={tools} rowKey={(row) => row.id} />
      )}

      <ToolModal
        open={adding}
        onClose={() => setAdding(false)}
        onAdded={() => {
          toast('Tool added');
          reload();
        }}
      />
    </div>
  );
}

function ToolModal({ open, onClose, onAdded }) {
  const form = useModalForm(open, { name: '', description: '', url: '' });

  const submit = async (event) => {
    event.preventDefault();
    const { name, description, url } = form.values;
    const errors = {};
    if (!name.trim()) errors.name = 'Enter the tool name.';
    if (!description.trim()) errors.description = 'Describe how this tool is used.';
    if (url.trim() && !isWebAddress(url.trim())) errors.url = 'Enter a full web address, like https://example.com.';
    form.setErrors(errors);
    if (Object.keys(errors).length) return form.focusFirstInvalid();
    form.setBusy(true);
    try {
      await createTool({ name: name.trim(), description: description.trim(), url: url.trim() });
      onAdded();
      onClose();
    } catch (error) {
      form.setFormError(error.message);
      form.setBusy(false);
    }
    return undefined;
  };

  return (
    <Modal open={open} onClose={onClose} divider title="Add Tool" subtitle="Add a tool used by your organization.">
      <form onSubmit={submit} noValidate>
        <TextField id="tool-name" label="Tool Name" requiredMark value={form.values.name} onChange={form.set('name')} error={form.errors.name} disabled={form.busy} />
        <TextField
          id="tool-description"
          label="Description"
          requiredMark
          multiline
          rows={5}
          placeholder="Describe how this tool is used..."
          value={form.values.description}
          onChange={form.set('description')}
          error={form.errors.description}
          disabled={form.busy}
        />
        <TextField id="tool-url" label="Website URL" optionalMark type="url" placeholder="https://example.com" value={form.values.url} onChange={form.set('url')} error={form.errors.url} disabled={form.busy} />
        {form.formError && (
          <p className={styles.formError} role="alert">
            {form.formError}
          </p>
        )}
        <ModalFooter>
          <Button variant="secondary" onClick={onClose} disabled={form.busy}>
            Cancel
          </Button>
          <Button type="submit" icon={IconPlus} loading={form.busy}>
            Add Tool
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
