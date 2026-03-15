'use client';

import { PropsWithChildren, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { appRoutes } from '@/lib/routes';
import { useAuth } from '@/components/auth/auth-provider';

export function ProtectedRoute({ children }: PropsWithChildren) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isBootstrapping } = useAuth();

  useEffect(() => {
    if (!isBootstrapping && !isAuthenticated) {
      router.replace(appRoutes.login);
    }
  }, [isAuthenticated, isBootstrapping, pathname, router]);

  if (isBootstrapping) {
    return <div className="route-status">Validando sesion...</div>;
  }

  if (!isAuthenticated) {
    return <div className="route-status">Redirigiendo a login...</div>;
  }

  return children;
}
