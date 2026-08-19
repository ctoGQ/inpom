import { FooterSection } from "@/components/landing/footer-section"
import { Header } from "@/components/header"
import { ContinueExploring, PublicPage } from "./public-sections"

export function PublicPageLayout({ children }: { children: React.ReactNode }) {
  return (
    <PublicPage>
      <Header />
      <div className="pt-10">{children}</div>
      <ContinueExploring links={[{ label: "Спільнота", href: "/community" }, { label: "Проєкти", href: "/projects" }, { label: "Новини", href: "/newsletter" }, { label: "Контакти", href: "/contacts" }]} />
      <FooterSection />
    </PublicPage>
  )
}
