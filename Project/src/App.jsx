import { useEffect } from 'react';
import AppRoutes from './routes/AppRoutes';
import { ScrollManager } from './components/layout/Layouts';
import Toaster from './components/ui/Toaster';
import { useAuthStore } from './store/authStore';

export default function App() {
  const refreshUser = useAuthStore((state) => state.refreshUser);

  useEffect(() => {
    refreshUser().catch(() => {});
  }, [refreshUser]);

  return (
    <>
      <ScrollManager />
      <AppRoutes />
      <Toaster />
    </>
  );
}
