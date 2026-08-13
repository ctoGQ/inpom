import { redirect } from 'next/navigation';
import { getSessionCustomer } from '@/lib/auth';
import PincodeClient from './PincodeClient';

export default async function Page() {
  const customer = await getSessionCustomer();
  if (!customer) redirect('/auth/signin');
  return <PincodeClient />;
}
