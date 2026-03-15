'use client';

import Link from 'next/link';
import { useQuery } from '@apollo/client';
import { DashboardState } from '@/components/dashboard/dashboard-state';
import { DashboardShell } from '@/components/dashboard-shell';
import { useAuth } from '@/components/auth/auth-provider';
import { CURRENT_USER_QUERY } from '@/lib/graphql/auth';
import {
  ACCOUNTS_QUERY,
  MONTHLY_SUMMARY_QUERY,
  TRANSACTIONS_QUERY
} from '@/lib/graphql/dashboard';
import {
  formatCurrency,
  formatPercent,
  formatShortDate,
  normalizeNumber
} from '@/lib/formatters';
import { appRoutes } from '@/lib/routes';

interface AuthUser {
  id: string;
  name: string;
  email: string;
  currency: string;
  locale: string;
}

interface CurrentUserData {
  currentUser: AuthUser;
}

interface Account {
  id: string;
  name: string;
  type: string;
  currency: string;
  balance: string;
  isArchived: boolean;
}

interface AccountsData {
  accounts: Account[];
}

interface Transaction {
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
}

interface TransactionsData {
  transactions: Transaction[];
}

interface MonthlySummaryCategory {
  categoryId: string;
  categoryName: string;
  kind: string;
  total: string;
}

interface MonthlySummary {
  year: number;
  month: number;
  income: string;
  expense: string;
  balance: string;
  byCategory: MonthlySummaryCategory[];
}

interface MonthlySummaryData {
  monthlySummary: MonthlySummary;
}

function getTransactionTypeLabel(type: Transaction['type']) {
  if (type === 'INCOME') {
    return 'Ingreso';
  }

  if (type === 'TRANSFER') {
    return 'Transferencia';
  }

  return 'Gasto';
}

function truncateText(value: string, maxLength: number) {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength - 1)}...`;
}

function getCanonicalTransactions(transactions: Transaction[]) {
  const transferPairs = new Map<string, Transaction>();
  const regularTransactions: Transaction[] = [];

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
  transaction: Transaction,
  accountMap: Map<string, Account>
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

function getCurrentMonthInput() {
  const now = new Date();

  return {
    year: now.getFullYear(),
    month: now.getMonth() + 1
  };
}

function getCurrentMonthRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  return {
    from: start.toISOString(),
    to: end.toISOString()
  };
}

export default function DashboardPage() {
  const { user: sessionUser } = useAuth();
  const { data: currentUserData } = useQuery<CurrentUserData>(CURRENT_USER_QUERY);
  const {
    data: accountsData,
    loading: accountsLoading,
    error: accountsError
  } = useQuery<AccountsData>(ACCOUNTS_QUERY, {
    fetchPolicy: 'network-only',
    nextFetchPolicy: 'cache-first'
  });
  const {
    data: transactionsData,
    loading: transactionsLoading,
    error: transactionsError
  } = useQuery<TransactionsData>(TRANSACTIONS_QUERY, {
    fetchPolicy: 'network-only',
    nextFetchPolicy: 'cache-first',
    variables: {
      filters: getCurrentMonthRange()
    }
  });
  const {
    data: summaryData,
    loading: summaryLoading,
    error: summaryError
  } = useQuery<MonthlySummaryData>(MONTHLY_SUMMARY_QUERY, {
    fetchPolicy: 'network-only',
    nextFetchPolicy: 'cache-first',
    variables: {
      input: getCurrentMonthInput()
    }
  });

  const currentUser = currentUserData?.currentUser ?? sessionUser;
  const currency = currentUser?.currency ?? 'COP';
  const locale = currentUser?.locale ?? 'es-CO';
  const accounts = accountsData?.accounts ?? [];
  const activeAccounts = accounts.filter((account) => !account.isArchived);
  const transactions = getCanonicalTransactions(transactionsData?.transactions ?? []);
  const summary = summaryData?.monthlySummary;
  const accountMap = new Map(accounts.map((account) => [account.id, account]));

  const totalBalance = activeAccounts.reduce(
    (accumulator, account) => accumulator + normalizeNumber(account.balance),
    0
  );
  const monthlyIncome = normalizeNumber(summary?.income ?? 0);
  const monthlyExpense = normalizeNumber(summary?.expense ?? 0);
  const monthlyBalance = normalizeNumber(summary?.balance ?? 0);
  const savingsRate =
    monthlyIncome > 0 ? (monthlyBalance / monthlyIncome) * 100 : 0;

  const metrics = [
    {
      label: 'Saldo total',
      value: formatCurrency(totalBalance, currency, locale),
      change:
        activeAccounts.length > 0
          ? `${activeAccounts.length} cuentas`
          : 'Sin cuentas',
      tone: 'neutral',
      valueTone: 'default'
    },
    {
      label: 'Ingresos mes',
      value: formatCurrency(monthlyIncome, currency, locale),
      change: formatPercent(monthlyIncome > 0 ? 5 : 0),
      tone: 'positive',
      valueTone: 'positive'
    },
    {
      label: 'Gastos mes',
      value: formatCurrency(monthlyExpense, currency, locale),
      change: formatPercent(monthlyExpense > 0 ? -1.2 : 0),
      tone: 'negative',
      valueTone: 'negative'
    },
    {
      label: 'Balance neto mes',
      value: formatCurrency(monthlyBalance, currency, locale),
      change: formatPercent(savingsRate),
      tone: monthlyBalance >= 0 ? 'positive' : 'negative',
      valueTone: monthlyBalance >= 0 ? 'positive' : 'negative'
    }
  ] as const;

  const topCategories = [...(summary?.byCategory ?? [])]
    .sort((left, right) => normalizeNumber(right.total) - normalizeNumber(left.total))
    .slice(0, 3);

  if (accountsLoading || transactionsLoading || summaryLoading) {
    return (
      <DashboardShell
        currentPath="/panel"
        title={`Hola, ${currentUser?.name?.split(' ')[0] ?? 'usuario'}`}
        subtitle="Cargando tu resumen financiero..."
        userLabel={currentUser?.name}
        userSubLabel={currentUser?.email}
      >
        <DashboardState
          title="Cargando panel"
          message="Estamos consultando tus cuentas, transacciones y resumen mensual."
        />
      </DashboardShell>
    );
  }

  if (accountsError || transactionsError || summaryError) {
    return (
      <DashboardShell
        currentPath="/panel"
        title={`Hola, ${currentUser?.name?.split(' ')[0] ?? 'usuario'}`}
        subtitle="No fue posible cargar el panel."
        userLabel={currentUser?.name}
        userSubLabel={currentUser?.email}
      >
        <DashboardState
          title="Error al cargar el panel"
          message="Revisa que el backend siga activo y que tu sesion continue valida."
        />
      </DashboardShell>
    );
  }

  if (accounts.length === 0 && transactions.length === 0) {
    return (
      <DashboardShell
        currentPath="/panel"
        title={`Hola, ${currentUser?.name?.split(' ')[0] ?? 'usuario'}`}
        subtitle="Tu panel ya esta conectado a datos reales."
        userLabel={currentUser?.name}
        userSubLabel={currentUser?.email}
        actions={
          <>
            <Link href={appRoutes.newTransaction} className="primary-button compact">
              Registrar transaccion
            </Link>
            <Link href={`${appRoutes.accounts}?nueva=1`} className="secondary-button compact">
              Nueva cuenta
            </Link>
          </>
        }
      >
        <DashboardState
          title="Todavia no tienes movimientos"
          message="Crea tu primera cuenta y registra una transaccion para empezar a ver tu resumen mensual."
        />
      </DashboardShell>
    );
  }

  return (
    <DashboardShell
      currentPath="/panel"
      title={`Hola, ${currentUser?.name?.split(' ')[0] ?? 'usuario'}`}
      subtitle="Resumen de tu situacion financiera actual"
      userLabel={currentUser?.name}
      userSubLabel={currentUser?.email}
      actions={
        <>
          <Link href={appRoutes.newTransaction} className="primary-button compact">
            Registrar transaccion
          </Link>
          <Link href={`${appRoutes.accounts}?nueva=1`} className="secondary-button compact">
            Nueva cuenta
          </Link>
          <Link href={appRoutes.monthlySummary} className="secondary-button compact">
            Ver resumen
          </Link>
        </>
      }
    >
      <section className="metrics-grid">
        {metrics.map((metric) => (
          <article key={metric.label} className="metric-card">
            <div className="metric-heading">
              <span>{metric.label}</span>
              <small className={`trend-pill ${metric.tone}`}>{metric.change}</small>
            </div>
            <strong
              className={
                metric.valueTone === 'negative'
                  ? 'negative'
                  : metric.valueTone === 'positive'
                    ? 'positive'
                    : undefined
              }
            >
              {metric.value}
            </strong>
          </article>
        ))}
      </section>

      <section className="content-grid">
        <article className="content-card">
          <div className="section-header">
            <h2>Transacciones recientes</h2>
            <Link href={appRoutes.transactions}>Ver todas</Link>
          </div>
          {transactions.length === 0 ? (
            <div className="empty-inline">No hay transacciones en el periodo actual.</div>
          ) : (
            <div className="transaction-list">
              {transactions.slice(0, 5).map((transaction) => {
                const amount = normalizeNumber(transaction.amount);
                const isEditable = isTransactionEditable(transaction, accountMap);
                const tone =
                  transaction.type === 'INCOME'
                    ? 'positive'
                    : transaction.type === 'EXPENSE'
                      ? 'negative'
                      : 'neutral';

                const content = (
                  <>
                    <div className="transaction-primary">
                      <p className="transaction-inline-label">
                        <strong>{getTransactionTypeLabel(transaction.type)}:</strong>{' '}
                        <span>
                          {truncateText(
                            transaction.description?.trim() || 'Movimiento sin descripcion',
                            42
                          )}
                        </span>
                      </p>
                      {transaction.type === 'TRANSFER' ? (
                        <small className="table-subtitle">
                          {`${accountMap.get(transaction.accountId)?.name ?? 'Cuenta origen'} -> ${accountMap.get(transaction.transferAccountId ?? '')?.name ?? 'Cuenta destino'}`}
                        </small>
                      ) : null}
                    </div>
                    <div className="transaction-date">
                      <span>{formatShortDate(transaction.txnDate, locale)}</span>
                    </div>
                    <strong className={tone}>
                      {formatCurrency(
                        transaction.type === 'EXPENSE' ? -amount : amount,
                        currency,
                        locale
                      )}
                    </strong>
                  </>
                );

                return isEditable ? (
                  <Link
                    key={transaction.id}
                    href={`${appRoutes.transactions}?editar=${transaction.id}`}
                    className="transaction-row transaction-row-link"
                  >
                    {content}
                  </Link>
                ) : (
                  <div
                    key={transaction.id}
                    className="transaction-row"
                    title="Reactiva la cuenta archivada para editar esta transaccion."
                  >
                    {content}
                  </div>
                );
              })}
            </div>
          )}
        </article>

        <article className="content-card content-card--narrow">
          <div className="section-header">
            <h2>Tendencia de gastos</h2>
          </div>
          <div className="mini-chart">
            <span style={{ height: '42%' }} />
            <span style={{ height: '68%' }} />
            <span style={{ height: '55%' }} />
            <span style={{ height: '80%' }} />
            <span style={{ height: '48%' }} />
            <span style={{ height: '72%' }} />
            <span style={{ height: '60%' }} />
          </div>
          <div className="distribution-list">
            {topCategories.length === 0 ? (
              <div className="empty-inline">Aun no hay categorias con gasto para mostrar.</div>
            ) : (
              topCategories.map((item, index) => {
                const total = normalizeNumber(item.total);
                const width = monthlyExpense > 0 ? `${Math.max((total / monthlyExpense) * 100, 8)}%` : '8%';

                return (
                  <div key={item.categoryId}>
                    <div className="distribution-label">
                      <span>{item.categoryName}</span>
                      <span>{formatCurrency(total, currency, locale)}</span>
                    </div>
                    <div className="distribution-bar">
                      <span
                        style={{
                          width,
                          opacity: String(1 - index * 0.15)
                        }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </article>
      </section>
    </DashboardShell>
  );
}
