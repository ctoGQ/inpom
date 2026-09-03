import { redirect } from 'next/navigation'
import { getSessionCustomer } from '@/lib/auth'
import { CabinetLayout } from '@/components/cabinet/cabinet-layout'
import { PickDeck } from '@/components/pick/pick-deck'

export const metadata = { title: 'Pick — INPOM', description: 'Настройте персональную карту интересов INPOM.' }

export default async function PickPage() {
  const customer = await getSessionCustomer()
  if (!customer) redirect('/auth/signin')
  return <CabinetLayout title="Pick" showAvatar showHeader={false} avatarUrl={customer.avatar_url || '/placeholder-user.jpg'} userName={customer.name}><PickDeck /></CabinetLayout>
}
