import { useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import Modal, { ConfirmDialog } from '../ui/Modal';
import Button from '../ui/Button';
import { Field } from '../ui/Form';
import { Card, EmptyState, SectionHeading } from '../ui/Primitives';
import { useForm } from '../../hooks/useForm';
import { useAction } from '../../hooks/useAction';
import { useCandidateStore } from '../../store/candidateStore';
import { required, url } from '../../utils/validators';

function ItemForm({ fields, initial, title, onSave, onClose }) {
  const schema = Object.fromEntries(
    fields.map((field) => [
      field.name,
      [...(field.required ? [required(field.label)] : []), ...(field.type === 'url' ? [url()] : [])],
    ]),
  );
  const form = useForm(
    Object.fromEntries(fields.map((field) => [
      field.name,
      field.list ? (initial?.[field.name] ?? []).join(', ') : initial?.[field.name] ?? '',
    ])),
    schema,
  );
  const [save, pending] = useAction(onSave, { success: 'Your profile was updated.', form });

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.validate()) return;
    const payload = Object.fromEntries(fields.map((field) => {
      const value = form.values[field.name];
      return [field.name, field.list ? value.split(',').map((part) => part.trim()).filter(Boolean) : String(value).trim()];
    }));
    if (await save(payload)) onClose();
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={title}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" form="item-form" loading={pending}>Save</Button>
        </>
      }
    >
      <form id="item-form" onSubmit={handleSubmit} noValidate className="space-y-4">
        {fields.map(({ list: _list, ...field }) => <Field key={field.name} form={form} {...field} />)}
      </form>
    </Modal>
  );
}

// A profile section made of repeatable entries, such as education or projects.
export default function CollectionSection({ section, title, icon, singular, description, fields, items, renderItem, emptyIcon, emptyText }) {
  const addItem = useCandidateStore((state) => state.addItem);
  const updateItem = useCandidateStore((state) => state.updateItem);
  const removeItem = useCandidateStore((state) => state.removeItem);
  const [editing, setEditing] = useState(null); // null, 'new', or an item
  const [deleting, setDeleting] = useState(null);
  const [confirmDelete, removing] = useAction(() => removeItem(section, deleting.id), { success: `${singular} removed.` });

  const save = (payload) => (editing === 'new' ? addItem(section, payload) : updateItem(section, editing.id, payload));

  return (
    <Card>
      <SectionHeading
        title={title}
        icon={icon}
        description={description}
        action={<Button variant="secondary" size="sm" icon={Plus} onClick={() => setEditing('new')}>Add</Button>}
      />
      {items.length === 0 ? (
        <EmptyState compact icon={emptyIcon} title={`No ${title.toLowerCase()} yet`} description={emptyText} />
      ) : (
        <ul className="divide-y divide-slate-100">
          {items.map((item) => (
            <li key={item.id} className="flex items-start gap-3 py-3.5 first:pt-0 last:pb-0">
              <div className="min-w-0 flex-1">{renderItem(item)}</div>
              <div className="flex shrink-0 gap-1">
                <Button variant="ghost" size="icon" icon={Pencil} onClick={() => setEditing(item)} aria-label={`Edit ${singular.toLowerCase()}`} />
                <Button variant="ghost" size="icon" icon={Trash2} onClick={() => setDeleting(item)} aria-label={`Delete ${singular.toLowerCase()}`} />
              </div>
            </li>
          ))}
        </ul>
      )}

      {editing && (
        <ItemForm
          fields={fields}
          initial={editing === 'new' ? null : editing}
          title={`${editing === 'new' ? 'Add' : 'Edit'} ${singular.toLowerCase()}`}
          onSave={save}
          onClose={() => setEditing(null)}
        />
      )}
      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        title={`Delete this ${singular.toLowerCase()}?`}
        description="This removes it from your profile and portfolio."
        confirmLabel="Delete"
        loading={removing}
        onConfirm={async () => {
          await confirmDelete();
          setDeleting(null);
        }}
      />
    </Card>
  );
}
