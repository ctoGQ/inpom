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
      <div>{children}</div>
           <FooterSection />
    </PublicPage>
  )
}
