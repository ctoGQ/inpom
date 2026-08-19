"use client"

import { usePathname } from "next/navigation"
import { Header } from "@/components/header"
import { FooterSection } from "@/components/landing/footer-section"
import { ContinueExploring, PublicPage } from "@/components/contentsections/public-sections"

const excludedPrefixes = ["/auth", "/mycabinet", "/api"]

export function PublicShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isPublic = !excludedPrefixes.some((prefix) => pathname.startsWith(prefix))

  if (!isPublic) return <>{children}</>

  return (
    <PublicPage>
      <Header />
      <div className="pt-16">{children}</div>
      <ContinueExploring links={[{ label: "Спільнота", href: "/community" }, { label: "Проєкти", href: "/projects" }, { label: "Новини", href: "/newsletter" }, { label: "Контакти", href: "/contacts" }]} />
      <FooterSection />
    </PublicPage>
  )
}
