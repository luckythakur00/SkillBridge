import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Eye, GraduationCap, Lock, Pencil, Plus, RotateCcw, Trash2, Users } from 'lucide-react';
import Button from '../../components/ui/Button';
import { ConfirmDialog } from '../../components/ui/Modal';
import { SearchInput } from '../../components/ui/Form';
import { Badge, Card, EmptyState, ErrorState, PageHeader, Skeleton, TableShell, Tabs } from '../../components/ui/Primitives';
import { useJobStore } from '../../store/jobStore';
import { useAction } from '../../hooks/useAction';
import { POSTING_STATE, WORK_MODE_LABELS } from '../../constants';
import { formatCompensation, formatDate, pluralize } from '../../utils/format';

const COPY = {
  JOB: { title: 'Job management', description: 'Create and manage your job postings.', noun: 'job', path: '/recruiter/jobs', icon: Briefcase },
  INTERNSHIP: { title: 'Internship management', description: 'Create internships and manage their status.', noun: 'internship', path: '/recruiter/internships', icon: GraduationCap },
};
const STATES = ['ACTIVE', 'EXPIRED', 'CLOSED'];

export default function PostingsPage({ type }) {
  const copy = COPY[type];
  const postings = useJobStore((state) => state.postings);
  const loading = useJobStore((state) => state.loading.postings);
  const error = useJobStore((state) => state.errors.postings);
  const fetchPostings = useJobStore((state) => state.fetchPostings);
  const setPostingStatus = useJobStore((state) => state.setPostingStatus);
  const deletePosting = useJobStore((state) => state.deletePosting);
  const [tab, setTab] = useState('ACTIVE');
  const [query, setQuery] = useState('');
  const [deleting, setDeleting] = useState(null);
  const [changeStatus] = useAction((id, status) => setPostingStatus(id, status), {
    success: (_id, status) => (status === 'CLOSED' ? 'Posting closed.' : 'Posting reopened.'),
  });
  const [remove, removing] = useAction((id) => deletePosting(id), { success: 'Posting deleted.' });

  useEffect(() => {
    fetchPostings();
  }, [fetchPostings]);

  const ofType = useMemo(() => postings.filter((posting) => posting.type === type), [postings, type]);
  const visible = useMemo(() => {
    const text = query.trim().toLowerCase();
    return ofType.filter((posting) => posting.state === tab && (!text || posting.title.toLowerCase().includes(text)));
  }, [ofType, tab, query]);
  const tabs = STATES.map((value) => ({
    value,
    label: POSTING_STATE[value].label,
    count: ofType.filter((posting) => posting.state === value).length,
  }));

  return (
    <div>
      <PageHeader
        title={copy.title}
        description={copy.description}
        actions={<Button to={`${copy.path}/new`} icon={Plus}>New {copy.noun}</Button>}
      />
      <Tabs tabs={tabs} active={tab} onChange={setTab} label="Posting status" />

      {error && <Card><ErrorState message={error} onRetry={fetchPostings} /></Card>}
      {!error && (
        <Card padded={false}>
          <div className="border-b border-slate-200 p-4">
            <SearchInput value={query} onChange={setQuery} placeholder={`Search ${copy.noun} postings`} className="sm:max-w-sm" />
          </div>
          {loading && !postings.length ? (
            <div className="space-y-3 p-5" role="status" aria-label="Loading">
              {[0, 1, 2].map((key) => <Skeleton key={key} className="h-12 w-full" />)}
            </div>
          ) : visible.length === 0 ? (
            <EmptyState
              icon={copy.icon}
              title={ofType.length ? `No ${POSTING_STATE[tab].label.toLowerCase()} ${copy.noun} postings` : `You have no ${copy.noun} postings yet`}
              description={ofType.length ? 'Choose another tab or change your search.' : `Post your first ${copy.noun} to start receiving applications.`}
              action={!ofType.length && <Button to={`${copy.path}/new`} icon={Plus}>New {copy.noun}</Button>}
            />
          ) : (
            <TableShell>
              <table className="w-full min-w-[820px] text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50 text-xs text-slate-500">
                  <tr>
                    <th scope="col" className="px-5 py-2.5 font-medium">Posting</th>
                    <th scope="col" className="px-3 py-2.5 font-medium">Status</th>
                    <th scope="col" className="px-3 py-2.5 font-medium">Applicants</th>
                    <th scope="col" className="px-3 py-2.5 font-medium">Views</th>
                    <th scope="col" className="px-3 py-2.5 font-medium">Deadline</th>
                    <th scope="col" className="px-5 py-2.5 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {visible.map((posting) => (
                    <tr key={posting.id} className="hover:bg-slate-50/70">
                      <td className="px-5 py-3.5">
                        <Link to={`${copy.path}/${posting.id}/edit`} className="font-semibold text-slate-900 hover:text-brand-700">{posting.title}</Link>
                        <p className="mt-0.5 text-xs text-slate-500">{posting.location} · {WORK_MODE_LABELS[posting.workMode]} · {formatCompensation(posting.compensation)}</p>
                      </td>
                      <td className="px-3 py-3.5"><Badge tone={POSTING_STATE[posting.state].tone}>{POSTING_STATE[posting.state].label}</Badge></td>
                      <td className="px-3 py-3.5">
                        <Link to={`/recruiter/applications?opportunity=${posting.id}`} className="inline-flex items-center gap-1.5 font-medium text-brand-600 hover:underline">
                          <Users className="size-3.5" aria-hidden="true" />
                          {posting.applicantCount}
                        </Link>
                      </td>
                      <td className="px-3 py-3.5 text-slate-600">{(posting.viewCount ?? 0).toLocaleString('en-IN')}</td>
                      <td className="px-3 py-3.5 whitespace-nowrap text-slate-600">{formatDate(posting.deadline)}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex justify-end gap-0.5">
                          <Button variant="ghost" size="icon" icon={Eye} to={`/opportunities/${posting.id}`} aria-label={`Preview ${posting.title}`} title="Preview" />
                          <Button variant="ghost" size="icon" icon={Pencil} to={`${copy.path}/${posting.id}/edit`} aria-label={`Edit ${posting.title}`} title="Edit" />
                          {posting.state === 'ACTIVE' && (
                            <Button variant="ghost" size="icon" icon={Lock} onClick={() => changeStatus(posting.id, 'CLOSED')} aria-label={`Close ${posting.title}`} title="Close posting" />
                          )}
                          {posting.state === 'CLOSED' && (
                            <Button variant="ghost" size="icon" icon={RotateCcw} onClick={() => changeStatus(posting.id, 'ACTIVE')} aria-label={`Reopen ${posting.title}`} title="Reopen posting" />
                          )}
                          <Button variant="ghost" size="icon" icon={Trash2} onClick={() => setDeleting(posting)} aria-label={`Delete ${posting.title}`} title="Delete" />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TableShell>
          )}
        </Card>
      )}

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        title="Delete this posting?"
        description={deleting ? `"${deleting.title}" will be removed from the platform. ${deleting.applicantCount ? `${pluralize(deleting.applicantCount, 'applicant')} will keep it in their history, and you will no longer see these applications.` : ''}` : ''}
        confirmLabel="Delete posting"
        loading={removing}
        onConfirm={async () => {
          await remove(deleting.id);
          setDeleting(null);
        }}
      />
    </div>
  );
}
