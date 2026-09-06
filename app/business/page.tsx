import { BusinessHero } from "@/components/landing/business-hero"
import {
  BusinessCompliance,
  BusinessCaseStudies,
  BusinessDemo,
  BusinessIndustries,
  BusinessLogos,
  BusinessProcess,
} from "@/components/landing/business-sections"

export default function BusinessPage() {
  return (
    <>
      <BusinessHero />
      <BusinessCompliance />
      <BusinessIndustries />
      <BusinessProcess />
      <BusinessDemo />
      <BusinessCaseStudies />
      <BusinessLogos />
    </>
  )
}
