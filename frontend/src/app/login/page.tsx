'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PublicRoute } from '@/components/auth/public-route';
import { useAuth } from '@/components/auth/auth-provider';
import { appRoutes } from '@/lib/routes';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      await login(email, password);
      router.replace(appRoutes.dashboard);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'No fue posible iniciar sesion.'
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <PublicRoute>
      <main className="auth-page">
        <section className="auth-panel">
          <div className="auth-brand">
            <div className="brand-badge">F</div>
            <div>
              <strong>Finanzas</strong>
              <span>Toma el control de tus finanzas hoy</span>
            </div>
          </div>

          <div className="auth-copy">
            <h1>Bienvenido de nuevo</h1>
            <p>Ingresa tus credenciales para acceder a tu cuenta.</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <label>
              <span>Correo electronico</span>
              <input
                type="email"
                placeholder="ejemplo@correo.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </label>
            <label>
              <span>Contrasena</span>
              <input
                type="password"
                placeholder="********"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                minLength={8}
                required
              />
            </label>
            {errorMessage ? <p className="form-error">{errorMessage}</p> : null}
            <button type="submit" className="primary-button" disabled={isSubmitting}>
              {isSubmitting ? 'Ingresando...' : 'Iniciar sesion'}
            </button>
          </form>

          <div className="auth-secondary-actions">
            <button type="button" className="secondary-button">
              Biometria
            </button>
            <button type="button" className="secondary-button">
              Passkey
            </button>
          </div>

          <p className="auth-helper">
            No tienes cuenta? <Link href={appRoutes.register}>Registrate</Link>
          </p>
        </section>
      </main>
    </PublicRoute>
  );
}
