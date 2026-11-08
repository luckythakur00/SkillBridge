import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Award, Bell, BellOff, BookOpen, CalendarClock, CheckCheck, ClipboardList, Info, Trash2 } from 'lucide-react';
import Button from '../../components/ui/Button';
import { Card, EmptyState, ErrorState, PageHeader, Skeleton, Tabs } from '../../components/ui/Primitives';
import { selectUnreadCount, useNotificationStore } from '../../store/notificationStore';
import { useAction } from '../../hooks/useAction';
import { timeAgo } from '../../utils/format';

const TYPE_ICONS = { APPLICATION: ClipboardList, INTERVIEW: CalendarClock, ASSESSMENT: Award, PROGRAM: BookOpen, SYSTEM: Info };

export default function NotificationsPage() {
  const navigate = useNavigate();
  const items = useNotificationStore((state) => state.items);
  const loading = useNotificationStore((state) => state.loading.items);
  const error = useNotificationStore((state) => state.errors.items);
  const unread = useNotificationStore(selectUnreadCount);
  const fetchNotifications = useNotificationStore((state) => state.fetch);
  const markRead = useNotificationStore((state) => state.markRead);
  const markAllRead = useNotificationStore((state) => state.markAllRead);
  const remove = useNotificationStore((state) => state.remove);
  const [tab, setTab] = useState('ALL');
  const [runMarkAll, markingAll] = useAction(markAllRead);
  const [runRemove] = useAction((id) => remove(id));

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const visible = useMemo(() => (tab === 'UNREAD' ? items.filter((item) => !item.read) : items), [items, tab]);

  const open = (item) => {
    if (!item.read) markRead(item.id).catch(() => {});
    if (item.link) navigate(item.link);
  };

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Notifications"
        description="Updates on your activity."
        actions={<Button variant="secondary" icon={CheckCheck} loading={markingAll} disabled={!unread} onClick={() => runMarkAll()}>Mark all as read</Button>}
      />
      <Tabs
        label="Notification filter"
        active={tab}
        onChange={setTab}
        tabs={[{ value: 'ALL', label: 'All', count: items.length }, { value: 'UNREAD', label: 'Unread', count: unread }]}
      />

      {error && !items.length && <Card><ErrorState message={error} onRetry={fetchNotifications} /></Card>}
      {!error && loading && !items.length && (
        <div className="space-y-3" role="status" aria-label="Loading">{[0, 1, 2].map((key) => <Skeleton key={key} className="h-20 w-full rounded-xl" />)}</div>
      )}
      {!loading && !error && visible.length === 0 && (
        <Card>
          <EmptyState
            icon={tab === 'UNREAD' ? Bell : BellOff}
            title={tab === 'UNREAD' ? 'You are all caught up' : 'No notifications yet'}
            description={tab === 'UNREAD' ? 'You have no unread notifications.' : 'Updates about your activity will appear here.'}
          />
        </Card>
      )}
      {visible.length > 0 && (
        <Card padded={false}>
          <ul className="divide-y divide-slate-100">
            {visible.map((item) => {
              const Icon = TYPE_ICONS[item.type] ?? Bell;
              return (
                <li key={item.id} className={`flex items-start gap-1 pr-2 ${item.read ? '' : 'bg-brand-50/50'}`}>
                  <button type="button" onClick={() => open(item)} className="flex min-w-0 flex-1 items-start gap-3 p-4 text-left transition-colors hover:bg-slate-50">
                    <span className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${item.read ? 'bg-slate-100 text-slate-500' : 'bg-brand-100 text-brand-700'}`}>
                      <Icon className="size-4" aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-baseline justify-between gap-3">
                        <span className={`text-sm ${item.read ? 'font-medium text-slate-800' : 'font-semibold text-slate-900'}`}>
                          {item.title}
                          {!item.read && <span className="sr-only"> (unread)</span>}
                        </span>
                        <span className="shrink-0 text-xs text-slate-500">{timeAgo(item.createdAt)}</span>
                      </span>
                      <span className="mt-0.5 block text-sm text-slate-600">{item.message}</span>
                    </span>
                  </button>
                  <Button variant="ghost" size="icon" icon={Trash2} onClick={() => runRemove(item.id)} aria-label={`Delete notification: ${item.title}`} className="mt-3.5" />
                </li>
              );
            })}
          </ul>
        </Card>
      )}
    </div>
  );
}
