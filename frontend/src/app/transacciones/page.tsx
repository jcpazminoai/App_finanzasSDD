'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ApolloError, useMutation, useQuery } from '@apollo/client';
import { useRouter } from 'next/navigation';
import { DashboardState } from '@/components/dashboard/dashboard-state';
import { DashboardShell } from '@/components/dashboard-shell';
import { useAuth } from '@/components/auth/auth-provider';
import { ACCOUNTS_QUERY } from '@/lib/graphql/dashboard';
import { CATEGORIES_QUERY } from '@/lib/graphql/categories';
import {
  CREATE_TRANSACTION_MUTATION,
  DELETE_TRANSACTION_MUTATION,
  TRANSACTIONS_QUERY,
  UPDATE_TRANSACTION_MUTATION
} from '@/lib/graphql/transactions';
import {
  formatCurrency,
  formatShortDate,
  normalizeNumber
} from '@/lib/formatters';

type AccountRecord = {
  id: string;
  name: string;
  type: string;
  currency: string;
  balance: string;
  isArchived: boolean;
};

type CategoryRecord = {
  id: string;
  userId: string | null;
  name: string;
  kind: 'INCOME' | 'EXPENSE' | 'TRANSFER';
  icon: string | null;
  isBuiltin: boolean;
};

type TransactionRecord = {
  id: string;
  accountId: string;
  categoryId: string;
  txnDate: string;
  amount: string;
  type: 'INCOME' | 'EXPENSE' | 'TRANSFER';
  description: string | null;
  notes: string | null;
  transferAccountId: string | null;
  linkedTransactionId: string | null;
  createdAt: string;
  updatedAt: string;
};

type AccountsQueryData = {
  accounts: AccountRecord[];
};

type CategoriesQueryData = {
  categories: CategoryRecord[];
};

type TransactionsQueryData = {
  transactions: TransactionRecord[];
};

type TransactionFormType = 'EXPENSE' | 'INCOME' | 'TRANSFER';

type TransactionFormValidationInput = {
  transactionType: TransactionFormType;
  txnDate: string;
  amount: string;
  accountId: string;
  transferAccountId: string;
  categoryId: string;
  availableCategories: CategoryRecord[];
  resolvedCategoryId: string;
  accountsCount: number;
  canTransfer: boolean;
};

function getTransactionError(error: unknown) {
  if (error instanceof ApolloError) {
    return error.graphQLErrors[0]?.message ?? error.message;
  }

  return error instanceof Error
    ? error.message
    : 'No fue posible completar la accion.';
}

function getTransactionTypeLabel(type: TransactionFormType) {
  if (type === 'INCOME') {
    return 'Ingreso';
  }

  if (type === 'TRANSFER') {
    return 'Transferencia';
  }

  return 'Gasto';
}

function getTransactionTypeLabelForMessage(type: TransactionFormType) {
  if (type === 'INCOME') {
    return 'ingreso';
  }

  if (type === 'TRANSFER') {
    return 'transferencia';
  }

  return 'gasto';
}

function getCanonicalTransactions(transactions: TransactionRecord[]) {
  const transferPairs = new Map<string, TransactionRecord>();
  const regularTransactions: TransactionRecord[] = [];

  for (const transaction of transactions) {
    if (transaction.type !== 'TRANSFER' || !transaction.linkedTransactionId) {
      regularTransactions.push(transaction);
      continue;
    }

    const pairKey = [transaction.id, transaction.linkedTransactionId].sort().join(':');
    const previous = transferPairs.get(pairKey);

    if (!previous) {
      transferPairs.set(pairKey, transaction);
      continue;
    }

    const previousUpdatedAt = new Date(previous.updatedAt).getTime();
    const currentUpdatedAt = new Date(transaction.updatedAt).getTime();

    if (
      currentUpdatedAt > previousUpdatedAt ||
      (currentUpdatedAt === previousUpdatedAt && transaction.id < previous.id)
    ) {
      transferPairs.set(pairKey, transaction);
    }
  }

  return [...regularTransactions, ...transferPairs.values()].sort((left, right) => {
    const leftDate = new Date(left.txnDate).getTime();
    const rightDate = new Date(right.txnDate).getTime();

    if (leftDate !== rightDate) {
      return rightDate - leftDate;
    }

    return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
  });
}

function isTransactionEditable(
  transaction: TransactionRecord,
  accountMap: Map<string, AccountRecord>
) {
  const sourceAccount = accountMap.get(transaction.accountId);

  if (!sourceAccount || sourceAccount.isArchived) {
    return false;
  }

  if (transaction.type !== 'TRANSFER') {
    return true;
  }

  const destinationAccount = transaction.transferAccountId
    ? accountMap.get(transaction.transferAccountId)
    : null;

  return Boolean(destinationAccount && !destinationAccount.isArchived);
}

function validateTransactionForm({
  transactionType,
  txnDate,
  amount,
  accountId,
  transferAccountId,
  categoryId,
  availableCategories,
  resolvedCategoryId,
  accountsCount,
  canTransfer
}: TransactionFormValidationInput) {
  if (accountsCount === 0) {
    return 'Necesitas al menos una cuenta activa para registrar una transaccion.';
  }

  if (!txnDate) {
    return 'Selecciona la fecha de la transaccion.';
  }

  if (Number.isNaN(new Date(txnDate).getTime())) {
    return 'La fecha seleccionada no es valida.';
  }

  if (!accountId) {
    return `Selecciona una cuenta para el ${getTransactionTypeLabelForMessage(transactionType)}.`;
  }

  if (!amount.trim()) {
    return 'Ingresa un monto antes de guardar.';
  }

  if (Number(amount) <= 0) {
    return 'El monto debe ser mayor que cero.';
  }

  if (transactionType === 'TRANSFER') {
    if (!canTransfer) {
      return 'Necesitas al menos dos cuentas activas para registrar una transferencia.';
    }

    if (!transferAccountId) {
      return 'Selecciona la cuenta destino de la transferencia.';
    }

    if (accountId === transferAccountId) {
      return 'La cuenta origen y destino no pueden ser la misma.';
    }

    if (!resolvedCategoryId) {
      return 'No existe una categoria de transferencia disponible. Crea o habilita una categoria de ese tipo antes de guardar.';
    }

    return null;
  }

  if (availableCategories.length === 0) {
    return `No tienes categorias disponibles para ${getTransactionTypeLabelForMessage(transactionType)}.`;
  }

  if (!categoryId) {
    return 'Selecciona una categoria antes de guardar.';
  }

  return null;
}

export default function TransactionsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const formRef = useRef<HTMLElement | null>(null);
  const [transactionType, setTransactionType] =
    useState<TransactionFormType>('EXPENSE');
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [editingTransactionId, setEditingTransactionId] = useState<string | null>(
    null
  );
  const [amount, setAmount] = useState('');
  const [txnDate, setTxnDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [accountId, setAccountId] = useState('');
  const [transferAccountId, setTransferAccountId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pendingEditId, setPendingEditId] = useState<string | null>(null);

  const {
    data: accountsData,
    loading: accountsLoading,
    error: accountsError
  } = useQuery<AccountsQueryData>(ACCOUNTS_QUERY, {
    fetchPolicy: 'network-only',
    nextFetchPolicy: 'cache-first'
  });
  const {
    data: categoriesData,
    loading: categoriesLoading,
    error: categoriesError
  } = useQuery<CategoriesQueryData>(CATEGORIES_QUERY, {
    fetchPolicy: 'network-only',
    nextFetchPolicy: 'cache-first'
  });
  const {
    data: transactionsData,
    loading: transactionsLoading,
    error: transactionsError
  } = useQuery<TransactionsQueryData>(TRANSACTIONS_QUERY, {
    fetchPolicy: 'network-only',
    nextFetchPolicy: 'cache-first'
  });
  const [createTransaction, { loading: creating }] = useMutation(
    CREATE_TRANSACTION_MUTATION,
    {
      refetchQueries: [{ query: TRANSACTIONS_QUERY }, { query: ACCOUNTS_QUERY }]
    }
  );
  const [updateTransaction, { loading: updating }] = useMutation(
    UPDATE_TRANSACTION_MUTATION,
    {
      refetchQueries: [{ query: TRANSACTIONS_QUERY }, { query: ACCOUNTS_QUERY }]
    }
  );
  const [deleteTransaction, { loading: deleting }] = useMutation(
    DELETE_TRANSACTION_MUTATION,
    {
      refetchQueries: [{ query: TRANSACTIONS_QUERY }, { query: ACCOUNTS_QUERY }]
    }
  );

  const accounts = useMemo(
    () => (accountsData?.accounts ?? []).filter((account) => !account.isArchived),
    [accountsData]
  );
  const accountMap = useMemo(
    () => new Map(accounts.map((account) => [account.id, account])),
    [accounts]
  );
  const categories = categoriesData?.categories ?? [];
  const categoryMap = useMemo(
    () => new Map(categories.map((category) => [category.id, category])),
    [categories]
  );
  const visibleTransactions = useMemo(
    () => getCanonicalTransactions(transactionsData?.transactions ?? []),
    [transactionsData]
  );
  const canTransfer = accounts.length >= 2;
  const transferCategories = useMemo(
    () => categories.filter((category) => category.kind === 'TRANSFER'),
    [categories]
  );

  const availableCategories = useMemo(() => {
    if (transactionType === 'TRANSFER') {
      return transferCategories;
    }

    return categories.filter((category) => category.kind === transactionType);
  }, [categories, transactionType, transferCategories]);

  const resolvedCategoryId =
    transactionType === 'TRANSFER'
      ? categoryMap.get(categoryId)?.kind === 'TRANSFER'
        ? categoryId
        : transferCategories[0]?.id ?? ''
      : categoryId;

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const params = new URLSearchParams(window.location.search);

    if (params.get('nueva') === '1') {
      resetForm();
      setFeedback(null);
      setErrorMessage(null);
      setIsFormVisible(true);
      router.replace('/transacciones', { scroll: false });
    }
  }, [router]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const editingTransactionIdFromQuery = new URLSearchParams(
      window.location.search
    ).get('editar');

    if (!editingTransactionIdFromQuery) {
      return;
    }

    setPendingEditId(editingTransactionIdFromQuery);
    router.replace('/transacciones', { scroll: false });
  }, [router]);

  useEffect(() => {
    if (!pendingEditId || transactionsLoading) {
      return;
    }

    const transactionToEdit = visibleTransactions.find(
      (transaction) => transaction.id === pendingEditId
    );

    if (!transactionToEdit) {
      setFeedback(null);
      setErrorMessage('La transaccion solicitada no existe o no esta disponible.');
      setPendingEditId(null);
      return;
    }

    handleEdit(transactionToEdit);
    setPendingEditId(null);
  }, [pendingEditId, transactionsLoading, visibleTransactions]);

  function resetForm() {
    setFormMode('create');
    setEditingTransactionId(null);
    setTransactionType('EXPENSE');
    setAmount('');
    setTxnDate(new Date().toISOString().slice(0, 10));
    setAccountId('');
    setTransferAccountId('');
    setCategoryId('');
    setDescription('');
    setNotes('');
  }

  function openCreateForm() {
    resetForm();
    setFeedback(null);
    setErrorMessage(null);
    setIsFormVisible(true);
    router.replace('/transacciones', { scroll: false });
    requestAnimationFrame(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  function closeForm(resetMessages = true) {
    resetForm();
    if (resetMessages) {
      setFeedback(null);
      setErrorMessage(null);
    }
    setIsFormVisible(false);
    router.replace('/transacciones', { scroll: false });
  }

  function handleEdit(transaction: TransactionRecord) {
    if (!isTransactionEditable(transaction, accountMap)) {
      setFeedback(null);
      setErrorMessage(
        'No puedes editar esta transaccion porque usa una cuenta archivada. Reactiva la cuenta para modificarla.'
      );
      return;
    }

    setFormMode('edit');
    setEditingTransactionId(transaction.id);
    setTransactionType(transaction.type);
    setAmount(String(normalizeNumber(transaction.amount)));
    setTxnDate(transaction.txnDate.slice(0, 10));
    setAccountId(transaction.accountId);
    setTransferAccountId(transaction.transferAccountId ?? '');
    setCategoryId(transaction.categoryId);
    setDescription(transaction.description ?? '');
    setNotes(transaction.notes ?? '');
    setFeedback(null);
    setErrorMessage(null);
    setIsFormVisible(true);
    requestAnimationFrame(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  async function handleSubmit() {
    setFeedback(null);
    setErrorMessage(null);

    try {
      const validationMessage = validateTransactionForm({
        transactionType,
        txnDate,
        amount,
        accountId,
        transferAccountId,
        categoryId,
        availableCategories,
        resolvedCategoryId,
        accountsCount: accounts.length,
        canTransfer
      });

      if (validationMessage) {
        setErrorMessage(validationMessage);
        return;
      }

      const input = {
        accountId,
        categoryId: resolvedCategoryId,
        txnDate: new Date(txnDate).toISOString(),
        amount: Number(amount),
        type: transactionType,
        description: description.trim() || undefined,
        notes: notes.trim() || undefined,
        transferAccountId:
          transactionType === 'TRANSFER' ? transferAccountId : undefined
      };

      if (formMode === 'create') {
        await createTransaction({ variables: { input } });
        setFeedback('Transaccion registrada correctamente.');
      } else if (editingTransactionId) {
        await updateTransaction({
          variables: {
            input: {
              id: editingTransactionId,
              ...input
            }
          }
        });
        setFeedback('Transaccion actualizada correctamente.');
      }

      closeForm(false);
    } catch (submitError) {
      setErrorMessage(getTransactionError(submitError));
    }
  }

  async function handleDelete(transaction: TransactionRecord) {
    if (!isTransactionEditable(transaction, accountMap)) {
      setFeedback(null);
      setErrorMessage(
        'No puedes eliminar esta transaccion porque usa una cuenta archivada. Reactiva la cuenta para modificarla.'
      );
      return;
    }

    const confirmed = window.confirm(
      transaction.type === 'TRANSFER'
        ? 'Se eliminara la transferencia completa y se revertiran ambos movimientos. Deseas continuar?'
        : 'La transaccion se eliminara y el saldo de la cuenta se ajustara. Deseas continuar?'
    );

    if (!confirmed) {
      return;
    }

    setFeedback(null);
    setErrorMessage(null);

    try {
      await deleteTransaction({
        variables: {
          transactionId: transaction.id
        }
      });

      setFeedback('Transaccion eliminada correctamente.');

      if (editingTransactionId === transaction.id) {
        closeForm();
      }
    } catch (deleteError) {
      setErrorMessage(getTransactionError(deleteError));
    }
  }

  const isSubmitting = creating || updating;

  if (accountsLoading || categoriesLoading || transactionsLoading) {
    return (
      <DashboardShell
        currentPath="/transacciones"
        title="Transacciones"
        subtitle="Cargando movimientos, cuentas y categorias..."
        userLabel={user?.name}
        userSubLabel={user?.email}
      >
        <DashboardState
          title="Cargando transacciones"
          message="Estamos preparando tu historial y el formulario de gestion."
        />
      </DashboardShell>
    );
  }

  if (accountsError || categoriesError || transactionsError) {
    return (
      <DashboardShell
        currentPath="/transacciones"
        title="Transacciones"
        subtitle="No fue posible cargar el modulo."
        userLabel={user?.name}
        userSubLabel={user?.email}
      >
        <DashboardState
          title="Error al cargar transacciones"
          message="Revisa que el backend siga activo y que tu sesion continue valida."
        />
      </DashboardShell>
    );
  }

  return (
    <DashboardShell
      currentPath="/transacciones"
      title="Transacciones"
      subtitle="Consulta, crea, modifica y elimina movimientos financieros."
      userLabel={user?.name}
      userSubLabel={user?.email}
      actions={
        <button type="button" className="primary-button compact" onClick={openCreateForm}>
          Nueva transaccion
        </button>
      }
    >
      {isFormVisible ? (
        <section className="account-form-card transactions-form-shell" ref={formRef}>
          <div className="section-header">
            <h2>{formMode === 'create' ? 'Crear transaccion' : 'Editar transaccion'}</h2>
            <button
              type="button"
              className="text-button"
              onClick={() => closeForm()}
            >
              {formMode === 'edit' ? 'Cancelar edicion' : 'Cerrar formulario'}
            </button>
          </div>

          <div className="amount-card">
            <small>Tipo de transaccion</small>
            <div className="transaction-type-tabs">
              <button
                type="button"
                className={transactionType === 'EXPENSE' ? 'is-active' : undefined}
                onClick={() => {
                  setTransactionType('EXPENSE');
                  setTransferAccountId('');
                }}
              >
                Gasto
              </button>
              <button
                type="button"
                className={transactionType === 'INCOME' ? 'is-active' : undefined}
                onClick={() => {
                  setTransactionType('INCOME');
                  setTransferAccountId('');
                }}
              >
                Ingreso
              </button>
              <button
                type="button"
                className={transactionType === 'TRANSFER' ? 'is-active' : undefined}
                disabled={!canTransfer}
                onClick={() => {
                  if (!canTransfer) {
                    return;
                  }

                  setTransactionType('TRANSFER');
                }}
              >
                Transferencia
              </button>
            </div>
          </div>

          {!canTransfer ? (
            <p className="muted-note">
              Necesitas al menos dos cuentas activas para registrar una transferencia.
            </p>
          ) : null}

          {accounts.length === 0 ? (
            <p className="form-error">
              No tienes cuentas activas disponibles. Crea o reactiva una cuenta antes de registrar una transaccion.
            </p>
          ) : null}

          <form className="transaction-form-card">
            <div className="form-grid">
              <label>
                <span>Fecha</span>
                <input
                  className="field-control"
                  type="date"
                  value={txnDate}
                  onChange={(event) => setTxnDate(event.target.value)}
                />
              </label>
              <label>
                <span>{transactionType === 'TRANSFER' ? 'Cuenta origen' : 'Cuenta'}</span>
                <select
                  className="field-control"
                  disabled={accounts.length === 0}
                  value={accountId}
                  onChange={(event) => setAccountId(event.target.value)}
                >
                  <option value="">Seleccionar cuenta</option>
                  {accounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label>
              <span>Monto</span>
              <input
                className="field-control"
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                placeholder="0.00"
              />
            </label>

            {transactionType === 'TRANSFER' ? (
              <label>
                <span>Cuenta destino</span>
                <select
                  className="field-control"
                  disabled={!canTransfer}
                  value={transferAccountId}
                  onChange={(event) => setTransferAccountId(event.target.value)}
                >
                  <option value="">Seleccionar cuenta destino</option>
                  {accounts
                    .filter((account) => account.id !== accountId)
                    .map((account) => (
                      <option key={account.id} value={account.id}>
                        {account.name}
                      </option>
                    ))}
                </select>
              </label>
            ) : (
              <label>
                <span>Categoria</span>
                <select
                  className="field-control"
                  disabled={availableCategories.length === 0}
                  value={categoryId}
                  onChange={(event) => setCategoryId(event.target.value)}
                >
                  <option value="">Seleccionar categoria</option>
                  {availableCategories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </label>
            )}

            {transactionType === 'TRANSFER' && availableCategories.length === 0 ? (
              <p className="form-error">
                No existe una categoria de transferencia disponible. Crea o habilita una
                categoria de ese tipo antes de guardar.
              </p>
            ) : null}

            {transactionType !== 'TRANSFER' && availableCategories.length === 0 ? (
              <p className="form-error">
                No tienes categorias disponibles para {getTransactionTypeLabelForMessage(transactionType)}.
                Crea una categoria antes de guardar.
              </p>
            ) : null}

            <label>
              <span>Descripcion</span>
              <input
                className="field-control"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Ej. Pago nomina, mercado, traslado a ahorros"
              />
            </label>

            <label>
              <span>Nota (opcional)</span>
              <textarea
                className="field-control"
                placeholder="Agregar detalles..."
                rows={4}
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
              />
            </label>

            {feedback ? <p className="form-success">{feedback}</p> : null}
            {errorMessage ? <p className="form-error">{errorMessage}</p> : null}

            <button
              type="button"
              className="primary-button"
              disabled={isSubmitting}
              onClick={handleSubmit}
            >
              {isSubmitting
                ? 'Guardando...'
                : formMode === 'create'
                  ? 'Guardar transaccion'
                  : 'Guardar cambios'}
            </button>
          </form>
        </section>
      ) : (
        <section className="dashboard-state">
          <h2>Gestion de transacciones</h2>
          <p>
            Usa <strong>Nueva transaccion</strong> para registrar un movimiento o
            <strong> Editar</strong> para actualizar uno existente.
          </p>
        </section>
      )}

      {!isFormVisible && feedback ? <p className="form-success">{feedback}</p> : null}
      {!isFormVisible && errorMessage ? <p className="form-error">{errorMessage}</p> : null}

      <section className="table-card">
        <div className="section-header">
          <h2>Listado de transacciones</h2>
          <div className="search-chip">{visibleTransactions.length} visibles</div>
        </div>

        <div className="simple-table transactions-table">
          <div className="table-head">
            <span>Transaccion</span>
            <span>Fecha</span>
            <span>Cuenta</span>
            <span>Monto</span>
            <span>Acciones</span>
          </div>

          {visibleTransactions.length === 0 ? (
            <div className="table-row">
              <strong>No hay transacciones registradas.</strong>
              <span />
              <span />
              <span />
              <span />
            </div>
          ) : (
            visibleTransactions.map((transaction) => {
              const amountValue = normalizeNumber(transaction.amount);
              const isEditable = isTransactionEditable(transaction, accountMap);
              const tone =
                transaction.type === 'INCOME'
                  ? 'positive'
                  : transaction.type === 'EXPENSE'
                    ? 'negative'
                    : 'neutral';
              const category = categoryMap.get(transaction.categoryId);
              const sourceAccount = accountMap.get(transaction.accountId);
              const destinationAccount = transaction.transferAccountId
                ? accountMap.get(transaction.transferAccountId)
                : null;

              return (
                <div key={transaction.id} className="table-row">
                  <strong>
                    {getTransactionTypeLabel(transaction.type)}:{' '}
                    {transaction.description?.trim() || 'Movimiento sin descripcion'}
                    <small className="table-subtitle">
                      {transaction.type === 'TRANSFER'
                        ? `${sourceAccount?.name ?? 'Cuenta origen'} -> ${destinationAccount?.name ?? 'Cuenta destino'}`
                        : category?.name ?? 'Sin categoria'}
                    </small>
                  </strong>
                  <span>{formatShortDate(transaction.txnDate, user?.locale ?? 'es-CO')}</span>
                  <span>{sourceAccount?.name ?? 'Cuenta no disponible'}</span>
                  <strong className={tone}>
                    {formatCurrency(
                      transaction.type === 'EXPENSE' ? -amountValue : amountValue,
                      user?.currency ?? 'COP',
                      user?.locale ?? 'es-CO'
                    )}
                  </strong>
                  <span className="action-links">
                    <button
                      type="button"
                      className="text-button"
                      disabled={!isEditable}
                      onClick={() => handleEdit(transaction)}
                    >
                      Editar
                    </button>
                    <span className="action-separator">|</span>
                    <button
                      type="button"
                      className="text-button text-button-danger"
                      disabled={deleting || !isEditable}
                      onClick={() => void handleDelete(transaction)}
                    >
                      Eliminar
                    </button>
                  </span>
                </div>
              );
            })
          )}
        </div>
      </section>
    </DashboardShell>
  );
}
