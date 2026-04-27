import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';

export function useProtectedRoute(requiredRole?: string) {
  const { user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login', { replace: true });
      return;
    }
    if (requiredRole && user?.role !== requiredRole) {
      toast.error('Access restricted for your role');
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, user, requiredRole, navigate]);

  return { user };
}
