import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { ROLE_HOME } from '../constants';
import Button from '../components/ui/Button';
import { EmptyState } from '../components/ui/Primitives';

// Requires a signed-in user with the given role. The backend must enforce this too.
export function ProtectedRoute({ role }) {
  const user = useAuthStore((state) => state.user);
  const signedOut = useAuthStore((state) => state.signedOut);
  const location = useLocation();

  if (!user) {
    if (signedOut) return <Navigate to="/" replace />;
    const next = encodeURIComponent(`${location.pathname}${location.search}`);
    return <Navigate to={`/login/${role.toLowerCase()}?next=${next}`} replace />;
  }

  if (user.role !== role) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
        <EmptyState
          icon={ShieldAlert}
          title="This area is not available for your account"
          description={`You are signed in with a ${user.role === 'CANDIDATE' ? 'candidate' : 'recruiter'} account, which cannot open ${role === 'CANDIDATE' ? 'candidate' : 'recruiter'} pages.`}
          action={<Button to={ROLE_HOME[user.role]}>Go to my dashboard</Button>}
        />
      </div>
    );
  }

  return <Outlet />;
}

// Login and signup pages send signed-in users to their dashboard.
export function GuestRoute() {
  const user = useAuthStore((state) => state.user);
  return user ? <Navigate to={ROLE_HOME[user.role]} replace /> : <Outlet />;
}

export function DashboardRedirect() {
  const user = useAuthStore((state) => state.user);
  return <Navigate to={user ? ROLE_HOME[user.role] : '/login/candidate'} replace />;
}
