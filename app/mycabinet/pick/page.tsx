import { redirect } from 'next/navigation'
import { getSessionCustomer } from '@/lib/auth'
import { CabinetLayout } from '@/components/cabinet/cabinet-layout'
import { PickDeck } from '@/components/pick/pick-deck'

export const metadata = { title: 'Безопасность — INPOM', description: 'Оцените безопасность интересов INPOM.' }

export default async function PickPage() {
  const customer = await getSessionCustomer()
  if (!customer) redirect('/auth/signin')
  return <div className="pick-page-shell"><CabinetLayout title="Знання Безпеки" showAvatar showHeader={false} showSidebar={false} bottomNavAlwaysVisible avatarUrl={customer.avatar_url || '/placeholder-user.jpg'} userName={customer.name}><PickDeck /></CabinetLayout></div>
}
