import { FooterSection } from "@/components/landing/footer-section"
import { Header } from "@/components/header"
import { PublicPage } from "./public-sections"

export function PublicPageLayout({ children }: { children: React.ReactNode }) {
  return (
    <PublicPage>
      <Header />
      <div className="pt-10">{children}</div>
      <FooterSection />
    </PublicPage>
  )
}
