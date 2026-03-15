export const appRoutes = {
  login: '/login',
  register: '/registro',
  dashboard: '/panel',
  accounts: '/cuentas',
  categories: '/categorias',
  transactions: '/transacciones',
  newTransaction: '/transacciones?nueva=1',
  monthlySummary: '/resumen-mensual'
} as const;

export const privateRoutes = [
  appRoutes.dashboard,
  appRoutes.accounts,
  appRoutes.categories,
  appRoutes.transactions,
  appRoutes.newTransaction,
  appRoutes.monthlySummary
];

export const navigationItems = [
  { href: appRoutes.dashboard, label: 'Panel', shortLabel: 'Panel' },
  { href: appRoutes.accounts, label: 'Cuentas', shortLabel: 'Cuentas' },
  { href: appRoutes.categories, label: 'Categorias', shortLabel: 'Categorias' },
  { href: appRoutes.transactions, label: 'Transacciones', shortLabel: 'Movs.' },
  { href: appRoutes.monthlySummary, label: 'Resumen', shortLabel: 'Resumen' }
] as const;
