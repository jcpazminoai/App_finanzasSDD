import { redirect } from 'next/navigation';

export default function LegacyNewTransactionPage() {
  redirect('/transacciones?nueva=1');
}
