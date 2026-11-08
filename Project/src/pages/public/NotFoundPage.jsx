import { Compass } from 'lucide-react';
import Button from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/Primitives';
import { useAuthStore } from '../../store/authStore';
import { ROLE_HOME } from '../../constants';

export default function NotFoundPage() {
  const user = useAuthStore((state) => state.user);
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <EmptyState
        icon={Compass}
        title="Page not found"
        description="The page you are looking for does not exist or may have moved."
        action={<Button to={user ? ROLE_HOME[user.role] : '/'}>{user ? 'Back to dashboard' : 'Back to home'}</Button>}
      />
    </div>
  );
}
