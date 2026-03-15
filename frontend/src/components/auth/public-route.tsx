'use client';

import { PropsWithChildren, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { appRoutes } from '@/lib/routes';
import { useAuth } from '@/components/auth/auth-provider';

export function PublicRoute({ children }: PropsWithChildren) {
  const router = useRouter();
  const { isAuthenticated, isBootstrapping } = useAuth();

  useEffect(() => {
    if (!isBootstrapping && isAuthenticated) {
      router.replace(appRoutes.dashboard);
    }
  }, [isAuthenticated, isBootstrapping, router]);

  if (isBootstrapping) {
    return <div className="route-status">Cargando sesion...</div>;
  }

  return children;
}
