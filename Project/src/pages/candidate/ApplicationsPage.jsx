import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, ClipboardList, FileText, MapPin } from 'lucide-react';
import { ApplicationTimeline, InterviewCard, StatusBadge } from '../../components/applications/ApplicationParts';
import { InternshipProgress } from '../../components/applications/InternshipTracker';
import Button from '../../components/ui/Button';
import Modal, { ConfirmDialog } from '../../components/ui/Modal';
import { Badge, Card, CardGridSkeleton, EmptyState, ErrorState, OrgLogo, PageHeader, Tabs } from '../../components/ui/Primitives';
import { useApplicationStore } from '../../store/applicationStore';
import { useAction } from '../../hooks/useAction';
import { APPLICATION_STATUS, APPLICATION_TRANSITIONS, OPPORTUNITY_TYPE_LABELS } from '../../constants';
import { formatDate } from '../../utils/format';

const GROUPS = {
  ALL: () => true,
  ACTIVE: (a) => ['APPLIED', 'UNDER_REVIEW', 'SHORTLISTED'].includes(a.status),
  INTERVIEW: (a) => a.status === 'INTERVIEW',
  SELECTED: (a) => a.status === 'SELECTED',
  CLOSED: (a) => ['REJECTED', 'WITHDRAWN'].includes(a.status),
};
const GROUP_LABELS = { ALL: 'All', ACTIVE: 'In progress', INTERVIEW: 'Interview', SELECTED: 'Selected', CLOSED: 'Closed' };

function ApplicationModal({ application, onClose, onWithdraw }) {
  const canWithdraw = application && APPLICATION_TRANSITIONS[application.status].includes('WITHDRAWN');
  const opportunity = application?.opportunity;
  return (
    <Modal
      open={Boolean(application)}
      onClose={onClose}
      title={opportunity?.title ?? ''}
      description={opportunity?.organization?.name}
      footer={application && (
        <>
          {canWithdraw && <Button variant="danger-ghost" onClick={onWithdraw} className="mr-auto">Withdraw</Button>}
          {opportunity && !opportunity.deleted && <Button variant="secondary" to={`/candidate/opportunities/${opportunity.id}`}>View posting</Button>}
          <Button onClick={onClose}>Close</Button>
        </>
      )}
    >
      {application && (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={application.status} />
            <span className="text-sm text-slate-600">{APPLICATION_STATUS[application.status].description}</span>
          </div>
          {application.interview && application.status === 'INTERVIEW' && <InterviewCard interview={application.interview} />}
          {opportunity?.type === 'INTERNSHIP' && application.status === 'SELECTED' && (
            <div>
              <h3 className="mb-3 text-sm font-bold">Internship progress</h3>
              <InternshipProgress record={application.internshipRecord} />
            </div>
          )}
          <div>
            <h3 className="mb-3 text-sm font-bold">Timeline</h3>
            <ApplicationTimeline application={application} />
          </div>
          {application.coverNote && (
            <div>
              <h3 className="mb-1.5 text-sm font-bold">Your note</h3>
              <p className="text-sm text-slate-600">{application.coverNote}</p>
            </div>
          )}
          {application.resume && (
            <p className="flex items-center gap-2 text-sm text-slate-600">
              <FileText className="size-4 text-slate-400" aria-hidden="true" />
              Sent with {application.resume.fileName}
            </p>
          )}
        </div>
      )}
    </Modal>
  );
}

export default function ApplicationsPage() {
  const applications = useApplicationStore((state) => state.mine);
  const loading = useApplicationStore((state) => state.loading.mine);
  const error = useApplicationStore((state) => state.errors.mine);
  const fetchMine = useApplicationStore((state) => state.fetchMine);
  const withdraw = useApplicationStore((state) => state.withdraw);
  const [tab, setTab] = useState('ALL');
  const [openId, setOpenId] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [runWithdraw, withdrawing] = useAction((id) => withdraw(id), { success: 'Your application was withdrawn.' });

  useEffect(() => {
    fetchMine();
  }, [fetchMine]);

  const visible = useMemo(() => applications.filter(GROUPS[tab]), [applications, tab]);
  const open = applications.find((application) => application.id === openId) ?? null;
  const tabs = Object.keys(GROUPS).map((value) => ({ value, label: GROUP_LABELS[value], count: applications.filter(GROUPS[value]).length }));

  return (
    <div>
      <PageHeader title="My applications" description="Track each application from submission to decision." />
      <Tabs tabs={tabs} active={tab} onChange={setTab} label="Application status" />

      {error && <Card><ErrorState message={error} onRetry={fetchMine} /></Card>}
      {!error && loading && !applications.length && <CardGridSkeleton count={4} className="grid-cols-1" />}
      {!error && !loading && visible.length === 0 && (
        <Card>
          <EmptyState
            icon={ClipboardList}
            title={applications.length ? 'Nothing in this view' : 'You have not applied yet'}
            description={applications.length ? 'Choose another tab to see your other applications.' : 'Find an opportunity that matches your skills and apply in a few clicks.'}
            action={!applications.length && <Button to="/candidate/opportunities">Browse opportunities</Button>}
          />
        </Card>
      )}
      {!error && visible.length > 0 && (
        <ul className="space-y-3">
          {visible.map((application) => {
            const { opportunity } = application;
            return (
              <li key={application.id}>
                <article className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-card sm:flex-row sm:items-center sm:p-5">
                  <div className="flex min-w-0 flex-1 items-start gap-3">
                    <OrgLogo organization={opportunity?.organization} />
                    <div className="min-w-0">
                      <h2 className="text-[15px] leading-snug font-bold">
                        {opportunity && !opportunity.deleted
                          ? <Link to={`/candidate/opportunities/${opportunity.id}`} className="hover:text-brand-700">{opportunity.title}</Link>
                          : opportunity?.title}
                      </h2>
                      <p className="text-sm text-slate-500">{opportunity?.organization?.name}</p>
                      <ul className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                        <li>{OPPORTUNITY_TYPE_LABELS[opportunity?.type]}</li>
                        <li className="flex items-center gap-1"><MapPin className="size-3.5" aria-hidden="true" />{opportunity?.location}</li>
                        <li className="flex items-center gap-1"><CalendarDays className="size-3.5" aria-hidden="true" />Applied {formatDate(application.appliedAt)}</li>
                      </ul>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-3 sm:justify-end">
                    <div className="flex flex-wrap gap-1.5">
                      <StatusBadge status={application.status} />
                      {opportunity?.deleted && <Badge>Posting removed</Badge>}
                    </div>
                    <Button variant="secondary" size="sm" onClick={() => setOpenId(application.id)}>Details</Button>
                  </div>
                </article>
              </li>
            );
          })}
        </ul>
      )}

      <ApplicationModal application={open} onClose={() => setOpenId(null)} onWithdraw={() => setConfirmOpen(true)} />
      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Withdraw this application?"
        description="The recruiter will be told, and you cannot apply for this opportunity again."
        confirmLabel="Withdraw"
        loading={withdrawing}
        onConfirm={async () => {
          await runWithdraw(openId);
          setConfirmOpen(false);
        }}
      />
    </div>
  );
}
