'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PublicRoute } from '@/components/auth/public-route';
import { useAuth } from '@/components/auth/auth-provider';
import { appRoutes } from '@/lib/routes';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (password !== confirmPassword) {
      setErrorMessage('La confirmacion de la contrasena no coincide.');
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      await register({
        name,
        email,
        password,
        currency: 'COP',
        locale: 'es-CO'
      });
      router.replace(appRoutes.dashboard);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'No fue posible crear la cuenta.'
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
              <span>Unete y toma el control de tu dinero</span>
            </div>
          </div>

          <div className="auth-copy">
            <h1>Crear cuenta</h1>
            <p>Completa tus datos para empezar con tu panel financiero.</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <label>
              <span>Nombre completo</span>
              <input
                type="text"
                placeholder="Ej. Juan Perez"
                value={name}
                onChange={(event) => setName(event.target.value)}
                minLength={2}
                required
              />
            </label>
            <label>
              <span>Correo electronico</span>
              <input
                type="email"
                placeholder="correo@ejemplo.com"
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
            <label>
              <span>Confirmar contrasena</span>
              <input
                type="password"
                placeholder="********"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                minLength={8}
                required
              />
            </label>
            {errorMessage ? <p className="form-error">{errorMessage}</p> : null}
            <button type="submit" className="primary-button" disabled={isSubmitting}>
              {isSubmitting ? 'Creando cuenta...' : 'Crear cuenta'}
            </button>
          </form>

          <div className="auth-secondary-actions">
            <button type="button" className="secondary-button">
              Google
            </button>
            <button type="button" className="secondary-button">
              Apple
            </button>
          </div>

          <p className="auth-helper">
            Ya tienes cuenta? <Link href={appRoutes.login}>Iniciar sesion</Link>
          </p>
        </section>
      </main>
    </PublicRoute>
  );
}
