import { NextResponse } from 'next/server';
import { getSessionCustomer } from '@/lib/auth';
import { getCabinetTasks } from '@/lib/cabinet-tasks';

export async function GET() {
  const customer = await getSessionCustomer();
  if (!customer) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  return NextResponse.json({ tasks: await getCabinetTasks(customer.id) });
}
