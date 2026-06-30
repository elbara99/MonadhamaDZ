import { Navigate, Outlet } from 'react-router-dom';
import { useCurrentUser } from '../../hooks/use-auth';
import { Skeleton } from '../ui/skeleton';

export function ProtectedRoute() {
  const { isLoading } = useCurrentUser();
  const isAuthenticated = !!localStorage.getItem('access_token');

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="space-y-4 w-96">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  return <Outlet />;
}
