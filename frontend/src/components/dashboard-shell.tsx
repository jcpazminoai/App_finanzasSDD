'use client';

import Link from 'next/link';
import { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { useAuth } from '@/components/auth/auth-provider';
import { navigationItems } from '@/lib/routes';

interface DashboardShellProps {
  currentPath: string;
  title: string;
  subtitle: string;
  userLabel?: string;
  userSubLabel?: string;
  actions?: ReactNode;
  children: ReactNode;
}

export function DashboardShell({
  currentPath,
  title,
  subtitle,
  userLabel,
  userSubLabel,
  actions,
  children
}: DashboardShellProps) {
  const router = useRouter();
  const { logout, user } = useAuth();

  return (
    <ProtectedRoute>
      <div className="dashboard-shell">
        <aside className="dashboard-sidebar">
          <div>
            <div className="dashboard-brand">
              <div className="brand-badge">F</div>
              <div>
                <strong>Finanzas</strong>
                <span>Control diario</span>
              </div>
            </div>

            <nav className="dashboard-nav">
              {navigationItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={item.href === currentPath ? 'is-active' : undefined}
                >
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>
          </div>

          <div className="sidebar-footnote">
            <p>{userLabel ?? user?.name ?? 'Usuario autenticado'}</p>
            <span>{userSubLabel ?? user?.email ?? 'sesion activa'}</span>
            <button
              type="button"
              className="secondary-button compact sidebar-logout"
              onClick={async () => {
                await logout();
                router.replace('/login');
              }}
            >
              Cerrar sesion
            </button>
          </div>
        </aside>

        <div className="dashboard-main">
          <header className="dashboard-header">
            <div>
              <h1>{title}</h1>
              <p>{subtitle}</p>
            </div>
            {actions ? <div className="page-actions">{actions}</div> : null}
          </header>

          <main className="dashboard-content">{children}</main>

          <nav className="mobile-nav">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={item.href === currentPath ? 'is-active' : undefined}
              >
                {item.shortLabel}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </ProtectedRoute>
  );
}
