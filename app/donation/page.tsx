import { DonationFlow } from "@/components/donation/donation-flow"

export const metadata = { title: "Підтримати INPOM", description: "Підтримайте розвиток спільноти INPOM ручним банківським, картковим або crypto-переказом." }

export default function DonationPage() {
  return <main className="min-h-screen bg-background"><DonationFlow /></main>
}
