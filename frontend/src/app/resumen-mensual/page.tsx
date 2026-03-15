'use client';

import { useState } from 'react';
import { useQuery } from '@apollo/client';
import { DashboardState } from '@/components/dashboard/dashboard-state';
import { DashboardShell } from '@/components/dashboard-shell';
import { useAuth } from '@/components/auth/auth-provider';
import { MONTHLY_SUMMARY_QUERY } from '@/lib/graphql/dashboard';
import { formatCurrency, formatPercent, normalizeNumber } from '@/lib/formatters';

type MonthlySummaryCategory = {
  categoryId: string;
  categoryName: string;
  kind: string;
  total: string;
};

type MonthlySummary = {
  year: number;
  month: number;
  income: string;
  expense: string;
  balance: string;
  byCategory: MonthlySummaryCategory[];
};

type MonthlySummaryData = {
  monthlySummary: MonthlySummary;
};

function getInitialMonth() {
  const now = new Date();

  return {
    year: now.getFullYear(),
    month: now.getMonth() + 1
  };
}

function getMonthLabel(year: number, month: number, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    month: 'long',
    year: 'numeric'
  }).format(new Date(year, month - 1, 1));
}

function shiftMonth(year: number, month: number, offset: number) {
  const nextDate = new Date(year, month - 1 + offset, 1);

  return {
    year: nextDate.getFullYear(),
    month: nextDate.getMonth() + 1
  };
}

export default function MonthlySummaryPage() {
  const { user } = useAuth();
  const [selectedMonth, setSelectedMonth] = useState(getInitialMonth);
  const locale = user?.locale ?? 'es-CO';
  const currency = user?.currency ?? 'COP';

  const { data, loading, error } = useQuery<MonthlySummaryData>(MONTHLY_SUMMARY_QUERY, {
    fetchPolicy: 'network-only',
    nextFetchPolicy: 'cache-first',
    variables: {
      input: selectedMonth
    }
  });

  const summary = data?.monthlySummary;
  const income = normalizeNumber(summary?.income ?? 0);
  const expense = normalizeNumber(summary?.expense ?? 0);
  const balance = normalizeNumber(summary?.balance ?? 0);
  const expenseRatio = income > 0 ? Math.min((expense / income) * 100, 100) : 0;
  const savingsRate = income > 0 ? (balance / income) * 100 : 0;
  const monthLabel = getMonthLabel(selectedMonth.year, selectedMonth.month, locale);
  const breakdown = [...(summary?.byCategory ?? [])].sort(
    (left, right) => normalizeNumber(right.total) - normalizeNumber(left.total)
  );
  const hasMovements = income > 0 || expense > 0;

  if (loading) {
    return (
      <DashboardShell
        currentPath="/resumen-mensual"
        title="Resumen mensual"
        subtitle="Estamos preparando tu balance del mes."
        userLabel={user?.name}
        userSubLabel={user?.email}
      >
        <DashboardState
          title="Cargando resumen mensual"
          message="Estamos consultando tus ingresos, gastos y desglose por categorias."
        />
      </DashboardShell>
    );
  }

  if (error || !summary) {
    return (
      <DashboardShell
        currentPath="/resumen-mensual"
        title="Resumen mensual"
        subtitle="No fue posible cargar tu resumen."
        userLabel={user?.name}
        userSubLabel={user?.email}
      >
        <DashboardState
          title="Error al cargar el resumen"
          message="Intenta nuevamente o revisa que el backend siga activo."
        />
      </DashboardShell>
    );
  }

  return (
    <DashboardShell
      currentPath="/resumen-mensual"
      title={`Resumen de ${monthLabel}`}
      subtitle="Consulta el comportamiento de tus ingresos, gastos y balance del mes."
      userLabel={user?.name}
      userSubLabel={user?.email}
      actions={
        <div className="page-actions">
          <button
            type="button"
            className="secondary-button compact"
            onClick={() =>
              setSelectedMonth((current) =>
                shiftMonth(current.year, current.month, -1)
              )
            }
          >
            Mes anterior
          </button>
          <button
            type="button"
            className="secondary-button compact"
            onClick={() =>
              setSelectedMonth((current) => shiftMonth(current.year, current.month, 1))
            }
          >
            Mes siguiente
          </button>
        </div>
      }
    >
      <section className="hero-summary-card">
        <small>{balance >= 0 ? 'Mes en superavit' : 'Mes en deficit'}</small>
        <h2 className={balance >= 0 ? 'positive' : 'negative'}>
          {formatCurrency(balance, currency, locale)}
        </h2>
        <p>
          {hasMovements
            ? balance >= 0
              ? `Ahorraste ${formatPercent(savingsRate)} de tus ingresos este mes.`
              : `Tus gastos superaron tus ingresos en ${formatCurrency(Math.abs(balance), currency, locale)}.`
            : 'Este mes todavia no registra movimientos para construir un balance.'}
        </p>
      </section>

      <section className="summary-metrics">
        <article className="metric-card">
          <div className="metric-heading">
            <span>Ingresos del mes</span>
          </div>
          <strong className="positive">{formatCurrency(income, currency, locale)}</strong>
        </article>
        <article className="metric-card">
          <div className="metric-heading">
            <span>Gastos del mes</span>
          </div>
          <strong className="negative">{formatCurrency(expense, currency, locale)}</strong>
        </article>
      </section>

      {!hasMovements ? (
        <DashboardState
          title={`Sin movimientos en ${monthLabel}`}
          message="Cuando registres ingresos o gastos en este mes, aqui veras el balance y el desglose por categorias."
        />
      ) : (
        <section className="content-grid">
          <article className="content-card content-card--narrow">
            <div className="donut-card">
              <div
                className="donut-chart"
                style={{
                  background: `conic-gradient(#129f6b 0 ${Math.max(
                    100 - expenseRatio,
                    0
                  )}%, #0f5667 ${Math.max(100 - expenseRatio, 0)}% 100%)`
                }}
              >
                <div className="donut-chart-inner">
                  <span>Gasto / ingreso</span>
                  <strong>{formatPercent(expenseRatio)}</strong>
                </div>
              </div>
            </div>
          </article>

          <article className="content-card">
            <div className="section-header">
              <h2>Desglose por categorias</h2>
            </div>
            {breakdown.length === 0 ? (
              <div className="empty-inline">
                Este mes no hay suficiente desglose por categorias para mostrar.
              </div>
            ) : (
              <div className="distribution-list">
                {breakdown.map((item) => {
                  const total = normalizeNumber(item.total);
                  const width =
                    expense > 0 ? `${Math.max((total / expense) * 100, 8)}%` : '8%';

                  return (
                    <div key={item.categoryId}>
                      <div className="distribution-label">
                        <span>{item.categoryName}</span>
                        <span>{formatCurrency(total, currency, locale)}</span>
                      </div>
                      <div className="distribution-bar">
                        <span style={{ width }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </article>
        </section>
      )}

      <section className="summary-band">
        <div>
          <h3>Lectura del mes</h3>
          <p>
            {hasMovements
              ? balance >= 0
                ? 'Tus ingresos superaron tus gastos en el periodo seleccionado.'
                : 'Tus gastos estan por encima de tus ingresos en el periodo seleccionado.'
              : 'Todavia no hay actividad suficiente para evaluar este mes.'}
          </p>
        </div>
        <div className="summary-band-values">
          <div>
            <small>Mes consultado</small>
            <strong>{monthLabel}</strong>
          </div>
          <div>
            <small>Balance del mes</small>
            <strong className={balance >= 0 ? 'positive' : 'negative'}>
              {formatCurrency(balance, currency, locale)}
            </strong>
          </div>
        </div>
      </section>
    </DashboardShell>
  );
}
