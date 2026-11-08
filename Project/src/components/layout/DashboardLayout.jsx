import { Suspense, useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Bell, ChevronDown, Globe, LogOut, Menu, Settings, UserRound, X } from 'lucide-react';
import Logo from './Logo';
import { NAVIGATION, PROFILE_LINK } from './navigation';
import Button from '../ui/Button';
import { Avatar, PageLoader } from '../ui/Primitives';
import { useAuthStore } from '../../store/authStore';
import { selectUnreadCount, useNotificationStore } from '../../store/notificationStore';
import { CANDIDATE_CATEGORY_LABELS, ORGANIZATION_TYPE_LABELS, ROLE_HOME } from '../../constants';

function Sidebar({ user, unread, onNavigate }) {
  const sections = NAVIGATION[user.role];
  return (
    <nav aria-label="Dashboard" className="flex-1 space-y-5 overflow-y-auto px-3 py-4">
      {sections.map((section, index) => {
        const items = section.items.filter((item) =>
          (!item.categories || item.categories.includes(user.category)) &&
          (!item.organizationTypes || item.organizationTypes.includes(user.organizationType)));
        return (
          <div key={section.title ?? index}>
            {section.title && (
              <p className="mb-1 px-3 text-[11px] font-semibold tracking-wider text-slate-500 uppercase">{section.title}</p>
            )}
            <ul className="space-y-0.5">
              {items.map(({ label, to, icon: Icon, badge }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    onClick={onNavigate}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                        isActive ? 'bg-brand-600 text-white' : 'text-slate-300 hover:bg-navy-800 hover:text-white'
                      }`
                    }
                  >
                    <Icon className="size-4 shrink-0" aria-hidden="true" />
                    <span className="flex-1 truncate">{label}</span>
                    {badge === 'notifications' && unread > 0 && (
                      <span className="rounded-full bg-brand-400 px-1.5 text-xs font-semibold text-navy-950">{unread}</span>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </nav>
  );
}

function UserMenu({ user, onLogout }) {
  const [open, setOpen] = useState(false);
  const container = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const close = (event) => {
      if (event.key === 'Escape' || (event.type === 'mousedown' && !container.current?.contains(event.target))) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', close);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', close);
    };
  }, [open]);

  const subtitle = user.role === 'CANDIDATE'
    ? CANDIDATE_CATEGORY_LABELS[user.category]
    : ORGANIZATION_TYPE_LABELS[user.organizationType];
  const base = user.role === 'CANDIDATE' ? '/candidate' : '/recruiter';
  const itemClass = 'flex w-full items-center gap-2.5 px-3.5 py-2 text-sm text-slate-700 hover:bg-slate-100';

  return (
    <div className="relative" ref={container}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex items-center gap-2.5 rounded-lg py-1 pr-1 pl-1 hover:bg-slate-100 sm:pr-2"
      >
        <Avatar name={user.name} size="sm" />
        <span className="hidden min-w-0 text-left sm:block">
          <span className="block max-w-40 truncate text-sm leading-tight font-semibold text-slate-900">{user.name}</span>
          <span className="block max-w-40 truncate text-xs text-slate-500">{subtitle}</span>
        </span>
        <ChevronDown className="hidden size-4 text-slate-400 sm:block" aria-hidden="true" />
      </button>
      {open && (
        <div role="menu" className="absolute right-0 z-20 mt-2 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white py-1.5 shadow-raised animate-pop-in">
          <div className="border-b border-slate-100 px-3.5 pt-1 pb-2.5">
            <p className="truncate text-sm font-semibold text-slate-900">{user.name}</p>
            <p className="truncate text-xs text-slate-500">{user.email}</p>
          </div>
          <div className="py-1">
            <Link role="menuitem" to={PROFILE_LINK[user.role]} onClick={() => setOpen(false)} className={itemClass}>
              <UserRound className="size-4 text-slate-400" aria-hidden="true" />
              {user.role === 'CANDIDATE' ? 'My profile' : 'Organization profile'}
            </Link>
            <Link role="menuitem" to={`${base}/settings`} onClick={() => setOpen(false)} className={itemClass}>
              <Settings className="size-4 text-slate-400" aria-hidden="true" />
              Settings
            </Link>
            <Link role="menuitem" to="/" onClick={() => setOpen(false)} className={itemClass}>
              <Globe className="size-4 text-slate-400" aria-hidden="true" />
              Public site
            </Link>
          </div>
          <div className="border-t border-slate-100 pt-1">
            <button role="menuitem" type="button" onClick={onLogout} className={`${itemClass} text-red-600 hover:bg-red-50`}>
              <LogOut className="size-4" aria-hidden="true" />
              Log out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DashboardLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const unread = useNotificationStore(selectUnreadCount);
  const fetchNotifications = useNotificationStore((state) => state.fetch);
  const navigate = useNavigate();
  const { pathname } = useLocation();

  // Picks up notifications created by actions elsewhere as the user moves around.
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications, pathname]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };
  const closeDrawer = () => setDrawerOpen(false);
  const notificationsPath = `${user.role === 'CANDIDATE' ? '/candidate' : '/recruiter'}/notifications`;

  return (
    <div className="min-h-screen bg-slate-50">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col bg-navy-950 lg:flex">
        <div className="flex h-16 items-center border-b border-navy-800 px-5"><Logo dark to={ROLE_HOME[user.role]} /></div>
        <Sidebar user={user} unread={unread} />
      </aside>

      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-navy-950/50 animate-fade-in" onClick={closeDrawer} aria-hidden="true" />
          <aside className="absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col bg-navy-950 animate-slide-in">
            <div className="flex h-16 items-center justify-between border-b border-navy-800 px-5">
              <Logo dark to={ROLE_HOME[user.role]} />
              <button type="button" onClick={closeDrawer} aria-label="Close navigation" className="rounded-lg p-1.5 text-slate-300 hover:bg-navy-800">
                <X className="size-5" aria-hidden="true" />
              </button>
            </div>
            <Sidebar user={user} unread={unread} onNavigate={closeDrawer} />
          </aside>
        </div>
      )}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 sm:px-6 lg:justify-end lg:px-8">
          <Button variant="ghost" size="icon" icon={Menu} onClick={() => setDrawerOpen(true)} aria-label="Open navigation" className="lg:hidden" />
          <div className="flex items-center gap-2">
            <Link to={notificationsPath} aria-label={`Notifications, ${unread} unread`} className="relative flex size-9 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100">
              <Bell className="size-5" aria-hidden="true" />
              {unread > 0 && (
                <span className="absolute top-1 right-1 flex size-4 items-center justify-center rounded-full bg-brand-600 text-[10px] font-bold text-white">
                  {unread > 9 ? '9+' : unread}
                </span>
              )}
            </Link>
            <UserMenu user={user} onLogout={handleLogout} />
          </div>
        </header>
        <main className="mx-auto max-w-7xl min-w-0 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <Suspense fallback={<PageLoader />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
