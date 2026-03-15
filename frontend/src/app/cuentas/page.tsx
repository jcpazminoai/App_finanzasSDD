'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ApolloError, useMutation, useQuery } from '@apollo/client';
import { DashboardState } from '@/components/dashboard/dashboard-state';
import { DashboardShell } from '@/components/dashboard-shell';
import { useAuth } from '@/components/auth/auth-provider';
import { ACCOUNTS_QUERY } from '@/lib/graphql/dashboard';
import {
  ARCHIVE_ACCOUNT_MUTATION,
  CREATE_ACCOUNT_MUTATION,
  UNARCHIVE_ACCOUNT_MUTATION,
  UPDATE_ACCOUNT_MUTATION
} from '@/lib/graphql/accounts';
import { formatCurrency, normalizeNumber } from '@/lib/formatters';

type AccountRecord = {
  id: string;
  name: string;
  type: string;
  currency: string;
  balance: string;
  isArchived: boolean;
};

type AccountsQueryData = {
  accounts: AccountRecord[];
};

type AccountMutationData = {
  createAccount?: AccountRecord;
  updateAccount?: AccountRecord;
  archiveAccount?: AccountRecord;
  unarchiveAccount?: AccountRecord;
};

const accountTypeOptions = [
  { value: 'BANK', label: 'Banco' },
  { value: 'CASH', label: 'Efectivo' },
  { value: 'CREDIT_CARD', label: 'Tarjeta de credito' },
  { value: 'WALLET', label: 'Billetera' },
  { value: 'INVESTMENT', label: 'Inversion' },
  { value: 'OTHER', label: 'Otra' }
] as const;

const currencyOptions = [
  { value: 'COP', label: 'Peso colombiano (COP)' },
  { value: 'USD', label: 'Dolar estadounidense (USD)' },
  { value: 'EUR', label: 'Euro (EUR)' }
] as const;

function getAccountTone(type: string, balance: string) {
  if (normalizeNumber(balance) < 0 || type === 'CREDIT_CARD') {
    return 'negative';
  }

  if (type === 'CASH' || type === 'WALLET') {
    return 'neutral';
  }

  return 'positive';
}

function getErrorMessage(error: unknown) {
  if (error instanceof ApolloError) {
    return error.graphQLErrors[0]?.message ?? error.message;
  }

  return error instanceof Error ? error.message : 'No fue posible completar la accion.';
}

export default function AccountsPage() {
  const { user } = useAuth();
  const formRef = useRef<HTMLElement | null>(null);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<'active' | 'archived'>('active');
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [editingAccountId, setEditingAccountId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [type, setType] = useState<(typeof accountTypeOptions)[number]['value']>('BANK');
  const [currency, setCurrency] = useState(user?.currency ?? 'COP');
  const [initialBalance, setInitialBalance] = useState('0');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { data, loading, error } = useQuery<AccountsQueryData>(ACCOUNTS_QUERY);
  const [createAccount, { loading: creating }] = useMutation<AccountMutationData>(
    CREATE_ACCOUNT_MUTATION,
    {
      refetchQueries: [{ query: ACCOUNTS_QUERY }]
    }
  );
  const [updateAccount, { loading: updating }] = useMutation<AccountMutationData>(
    UPDATE_ACCOUNT_MUTATION,
    {
      refetchQueries: [{ query: ACCOUNTS_QUERY }]
    }
  );
  const [archiveAccount, { loading: archiving }] = useMutation<AccountMutationData>(
    ARCHIVE_ACCOUNT_MUTATION,
    {
      refetchQueries: [{ query: ACCOUNTS_QUERY }]
    }
  );
  const [unarchiveAccount, { loading: unarchiving }] =
    useMutation<AccountMutationData>(UNARCHIVE_ACCOUNT_MUTATION, {
      refetchQueries: [{ query: ACCOUNTS_QUERY }]
    });

  const accounts = data?.accounts ?? [];
  const activeAccounts = accounts.filter((account) => !account.isArchived);
  const archivedAccounts = accounts.filter((account) => account.isArchived);
  const visibleAccounts = activeTab === 'active' ? activeAccounts : archivedAccounts;
  const totalAvailable = useMemo(
    () =>
      activeAccounts.reduce(
        (accumulator, account) => accumulator + Math.max(normalizeNumber(account.balance), 0),
        0
      ),
    [activeAccounts]
  );
  const totalDebt = useMemo(
    () =>
      activeAccounts.reduce((accumulator, account) => {
        const balance = normalizeNumber(account.balance);
        return balance < 0 ? accumulator + Math.abs(balance) : accumulator;
      }, 0),
    [activeAccounts]
  );

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const searchParams = new URLSearchParams(window.location.search);

    if (searchParams.get('nueva') === '1') {
      setIsFormVisible(true);
      setFormMode('create');
      setEditingAccountId(null);
      setName('');
      setType('BANK');
      setCurrency(user?.currency ?? 'COP');
      setInitialBalance('0');
    }
  }, [user?.currency]);

  function resetForm() {
    setFormMode('create');
    setEditingAccountId(null);
    setName('');
    setType('BANK');
    setCurrency(user?.currency ?? 'COP');
    setInitialBalance('0');
  }

  function startCreateFlow() {
    resetForm();
    setActiveTab('active');
    setIsFormVisible(true);
    setFeedback(null);
    setErrorMessage(null);
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  async function handleSubmit() {
    setFeedback(null);
    setErrorMessage(null);

    try {
      if (formMode === 'create') {
        await createAccount({
          variables: {
            input: {
              name,
              type,
              currency,
              initialBalance: Number(initialBalance || 0)
            }
          }
        });
        setFeedback('Cuenta creada correctamente.');
      } else if (editingAccountId) {
        await updateAccount({
          variables: {
            input: {
              id: editingAccountId,
              name,
              type,
              currency
            }
          }
        });
        setFeedback('Cuenta actualizada correctamente.');
      }

      resetForm();
      setIsFormVisible(false);
    } catch (submitError) {
      setErrorMessage(getErrorMessage(submitError));
    }
  }

  function handleEdit(account: AccountRecord) {
    setActiveTab(account.isArchived ? 'archived' : 'active');
    setIsFormVisible(true);
    setFormMode('edit');
    setEditingAccountId(account.id);
    setName(account.name);
    setType(account.type as (typeof accountTypeOptions)[number]['value']);
    setCurrency(account.currency);
    setInitialBalance(account.balance);
    setFeedback(null);
    setErrorMessage(null);
  }

  async function handleArchive(accountId: string) {
    setFeedback(null);
    setErrorMessage(null);

    const confirmed = window.confirm(
      'La cuenta dejara de mostrarse como activa, pero conservara su historial. Deseas archivarla?'
    );

    if (!confirmed) {
      return;
    }

    try {
      await archiveAccount({
        variables: {
          accountId
        }
      });
      setFeedback('Cuenta archivada correctamente.');
      if (editingAccountId === accountId) {
        resetForm();
        setIsFormVisible(false);
      }
    } catch (archiveError) {
      setErrorMessage(getErrorMessage(archiveError));
    }
  }

  async function handleUnarchive(accountId: string) {
    setFeedback(null);
    setErrorMessage(null);

    try {
      await unarchiveAccount({
        variables: {
          accountId
        }
      });
      setFeedback('Cuenta reactivada correctamente.');
      setActiveTab('active');
    } catch (unarchiveError) {
      setErrorMessage(getErrorMessage(unarchiveError));
    }
  }

  if (loading) {
    return (
      <DashboardShell
        currentPath="/cuentas"
        title="Mis cuentas"
        subtitle="Cargando tus cuentas..."
        userLabel={user?.name}
        userSubLabel={user?.email}
      >
        <DashboardState
          title="Cargando cuentas"
          message="Estamos consultando tus cuentas y preparando el CRUD."
        />
      </DashboardShell>
    );
  }

  if (error) {
    return (
      <DashboardShell
        currentPath="/cuentas"
        title="Mis cuentas"
        subtitle="No fue posible cargar tus cuentas."
        userLabel={user?.name}
        userSubLabel={user?.email}
      >
        <DashboardState
          title="Error al cargar cuentas"
          message="Revisa tu sesion y confirma que el backend siga disponible."
        />
      </DashboardShell>
    );
  }

  return (
    <DashboardShell
      currentPath="/cuentas"
      title="Mis cuentas"
      subtitle={`Patrimonio total: ${formatCurrency(
        totalAvailable - totalDebt,
        user?.currency ?? 'COP',
        user?.locale ?? 'es-CO'
      )}`}
      userLabel={user?.name}
      userSubLabel={user?.email}
      actions={
        <button
          className="primary-button compact"
          onClick={startCreateFlow}
        >
          Nueva cuenta
        </button>
      }
    >
      {isFormVisible ? (
        <section className="account-form-card" ref={formRef}>
          <div className="section-header">
            <h2>{formMode === 'create' ? 'Crear cuenta' : 'Editar cuenta'}</h2>
            <button
              type="button"
              className="text-button"
              onClick={() => {
                resetForm();
                setIsFormVisible(false);
                setFeedback(null);
                setErrorMessage(null);
              }}
            >
              {formMode === 'edit' ? 'Cancelar edicion' : 'Cerrar formulario'}
            </button>
          </div>
          <div className="form-grid">
            <label>
              <span>Nombre</span>
              <input
                className="field-control"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Ej. Davivienda"
              />
            </label>
            <label>
              <span>Tipo</span>
              <select
                className="field-control"
                value={type}
                onChange={(event) => setType(event.target.value as never)}
              >
                {accountTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>Moneda</span>
              <select
                className="field-control"
                value={currency}
                onChange={(event) => setCurrency(event.target.value)}
              >
                {currencyOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            {formMode === 'create' ? (
              <label>
                <span>Saldo inicial</span>
                <input
                  className="field-control"
                  type="number"
                  step="0.01"
                  value={initialBalance}
                  onChange={(event) => setInitialBalance(event.target.value)}
                />
              </label>
            ) : (
              <div className="field-note-card">
                <strong>Saldo actual</strong>
                <p>
                  El saldo no se edita manualmente. Se modifica mediante transacciones
                  o ajustes controlados del sistema.
                </p>
              </div>
            )}
          </div>
          {feedback ? <p className="form-success">{feedback}</p> : null}
          {errorMessage ? <p className="form-error">{errorMessage}</p> : null}
          <div className="page-actions">
            <button
              type="button"
              className="primary-button compact"
              disabled={creating || updating || !name.trim()}
              onClick={handleSubmit}
            >
              {creating || updating
                ? 'Guardando...'
                : formMode === 'create'
                  ? 'Crear cuenta'
                  : 'Guardar cambios'}
            </button>
          </div>
        </section>
      ) : (
        <section className="dashboard-state">
          <h2>Gestion de cuentas</h2>
          <p>
            Usa el boton <strong>Nueva cuenta</strong> para crear una cuenta o
            selecciona <strong>Editar</strong> en una cuenta existente.
          </p>
        </section>
      )}

      <section className="tabs-row">
        <button
          type="button"
          className={`tab ${activeTab === 'active' ? 'is-active' : ''}`}
          onClick={() => setActiveTab('active')}
        >
          Activas
        </button>
        <button
          type="button"
          className={`tab ${activeTab === 'archived' ? 'is-active' : ''}`}
          onClick={() => setActiveTab('archived')}
        >
          Archivadas
        </button>
      </section>

      {visibleAccounts.length === 0 ? (
        <DashboardState
          title={
            activeTab === 'active'
              ? 'Aun no tienes cuentas activas'
              : 'No tienes cuentas archivadas'
          }
          message={
            activeTab === 'active'
              ? 'Crea tu primera cuenta para empezar a registrar movimientos y ver tu panel con datos reales.'
              : 'Cuando archives una cuenta, aparecera aqui para que puedas reactivarla.'
          }
        />
      ) : (
        <section className="account-card-grid">
          {visibleAccounts.map((account) => (
          <article key={account.name} className="account-card">
            <div className="account-card-top">
              <span className={`tag ${getAccountTone(account.type, account.balance)}`}>
                {account.type}
              </span>
              {account.isArchived ? (
                <button
                  type="button"
                  className="icon-button"
                  onClick={() => void handleUnarchive(account.id)}
                >
                  Reactivar
                </button>
              ) : (
                <button
                  type="button"
                  className="icon-button"
                  onClick={() => handleEdit(account)}
                >
                  Editar
                </button>
              )}
            </div>
            <h2>{account.name}</h2>
            <small>{account.isArchived ? 'Saldo al archivar' : 'Saldo actual'}</small>
            <strong className={getAccountTone(account.type, account.balance)}>
              {formatCurrency(
                account.balance,
                account.currency,
                user?.locale ?? 'es-CO'
              )}
            </strong>
          </article>
          ))}
        </section>
      )}

      <section className="table-card">
        <div className="section-header">
          <h2>{activeTab === 'active' ? 'Detalle de activos' : 'Cuentas archivadas'}</h2>
          <span>
            {visibleAccounts.length}{' '}
            {activeTab === 'active' ? 'activas' : 'archivadas'}
          </span>
        </div>
        <div className="simple-table">
          <div className="table-head">
            <span>Cuenta</span>
            <span>Tipo de cuenta</span>
            <span>Saldo disponible</span>
            <span>Acciones</span>
          </div>
          {visibleAccounts.map((row) => (
            <div key={row.id} className="table-row">
              <strong>{row.name}</strong>
              <span>{row.type}</span>
              <strong className={normalizeNumber(row.balance) < 0 ? 'negative' : ''}>
                {formatCurrency(row.balance, row.currency, user?.locale ?? 'es-CO')}
              </strong>
              <span className="action-links">
                {row.isArchived ? (
                  <button
                    type="button"
                    className="text-button"
                    disabled={unarchiving}
                    onClick={() => void handleUnarchive(row.id)}
                  >
                    Reactivar
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      className="text-button"
                      onClick={() => handleEdit(row)}
                    >
                      Editar
                    </button>
                    <span className="action-separator">|</span>
                    <button
                      type="button"
                      className="text-button text-button-danger"
                      disabled={archiving}
                      onClick={() => void handleArchive(row.id)}
                    >
                      Archivar
                    </button>
                  </>
                )}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="summary-band">
        <div>
          <h3>Resumen de liquidez</h3>
          <p>
            {activeAccounts.length > 0
              ? 'Tus cuentas activas.'
              : 'Crea una cuenta para empezar a construir tu liquidez.'}
          </p>
        </div>
        <div className="summary-band-values">
          <div>
            <small>Disponible hoy</small>
            <strong>{formatCurrency(totalAvailable, user?.currency ?? 'COP', user?.locale ?? 'es-CO')}</strong>
          </div>
          <div>
            <small>Deuda total</small>
            <strong className="negative">
              {formatCurrency(totalDebt, user?.currency ?? 'COP', user?.locale ?? 'es-CO')}
            </strong>
          </div>
        </div>
      </section>
    </DashboardShell>
  );
}
