import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';

interface Props {
  roles?: string[];
}

export function ProtectedRoute({ roles }: Props) {
  const { user, isAuthenticated } = useAuthStore();

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  if (roles && user && !roles.includes(user.role)) {
    return (
      <div className="flex items-center justify-center h-full flex-col gap-4 py-20">
        <div className="text-6xl font-display" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-muted)' }}>
          403
        </div>
        <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>Access Restricted</h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          Your role ({user.role.replace('_', ' ')}) does not have permission to view this page.
        </p>
      </div>
    );
  }

  return <Outlet />;
}
