"use client";

import { useState, useEffect, useRef } from "react";
import { ArrowRight, Check, Zap } from "lucide-react";
import { TierCard } from "@/components/tier-card";

const plans = [
  {
    name: "Black",
    description: "Для матерів, які щойно розпочинають",
    price: { monthly: 0, annual: 0 },
    features: [
      "Доступ до спільноти",
      "100 консультацій/місяць",
      "Підтримка спільноти",
      "Базові ресурси",
      "Всі вебінари",
    ],
    cta: "Почати",
    highlight: false,
    variant: 'black' as const,
    cardImage: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/inpom-black-0aBd3LaMBBrIShqWZtY2IMJDaubFWn.png",
  },
  {
    name: "Gold",
    description: "Для матерів з активним бізнесом",
    price: { monthly: 99, annual: 79 },
    features: [
      "Персональний ментор",
      "1000 консультацій/місяць",
      "Пріоритетна підтримка",
      "Доступ до партнерів",
      "Індивідуальні заняття",
      "Робочі простори групи",
      "Спеціальні ролі",
    ],
    cta: "Почати 14 днів",
    highlight: true,
    variant: 'gold' as const,
    cardImage: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/inpom-gold-vHG68mRIsgnDlRj8J1tHxKS6QprtDK.png",
  },
  {
    name: "Business Plus",
    description: "Для великих проектів та організацій",
    price: { monthly: null, annual: null },
    features: [
      "Невмежені консультації",
      "Невмежені завдання",
      "Менторинг 24/7",
      "На місцевому сервері",
      "Гарантія SLA",
      "Спеціальна маршрутизація",
      "Розширена безпека",
      "Виділені ресурси",
    ],
    cta: "Контакт",
    highlight: false,
    variant: 'business' as const,
    cardImage: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/inpom-business-LSbBGlxtQ42dQC1ZITco7TuzkE9BMw.png",
  },
];

export function PricingSection() {
  const [isAnnual, setIsAnnual] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="pricing" ref={sectionRef} className="relative py-32 lg:py-40">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        {/* Header - Dramatic offset */}
        <div className="grid lg:grid-cols-12 gap-8 mb-20">
          <div className="lg:col-span-7">
            <span className="inline-flex items-center gap-3 text-sm font-mono text-muted-foreground mb-8">
              <span className="w-12 h-px bg-foreground/30" />
              Цінування
            </span>
            <h2 className={`text-6xl md:text-7xl lg:text-[128px] font-display tracking-tight leading-[0.9] transition-all duration-1000 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}>
              Плати за
              <br />
              <span className="text-stroke">результати.</span>
            </h2>
          </div>
          
          <div className="lg:col-span-5 relative p-0 h-96 lg:h-auto">
            {/* Whale image */}
            <div className={`absolute inset-0 pointer-events-none transition-all duration-1000 delay-100 ${
              isVisible ? "opacity-100" : "opacity-0"
            }`}>
              <img
                src="/images/whale.png"
                alt="Organic whale"
                className="w-full h-full object-contain object-center"
              />
            </div>

          </div>
        </div>

        {/* Pricing cards - Horizontal layout with overlap */}
        <div className="relative">
          <div className="grid lg:grid-cols-3 gap-8 lg:gap-0 mb-12">
            {plans.map((plan, index) => (
              <div
                key={plan.name}
                className={`relative bg-background border transition-all duration-700 ${
                  plan.highlight 
                    ? "border-foreground lg:-mx-2 lg:z-10 lg:scale-105" 
                    : "border-foreground/10 lg:first:-mr-2 lg:last:-ml-2"
                } ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                {/* Popular badge */}
                {plan.highlight && (
                  <div className="absolute -top-4 left-8 right-8 flex justify-center">
                    <span className="inline-flex items-center gap-2 px-4 py-2 bg-foreground text-background text-xs font-mono uppercase tracking-widest">
                      <Zap className="w-3 h-3" />
                      Найпопулярніший
                    </span>
                  </div>
                )}

                <div className="p-8 lg:p-10">
                  {/* 3D Tier Card at top */}
                  <div className="mb-8">
                    <TierCard variant={plan.variant} imageUrl={plan.cardImage} />
                  </div>

                  {/* Plan header */}
                  <div className="mb-8 pb-8 border-b border-foreground/10">
                    <span className="font-mono text-xs text-muted-foreground">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <h3 className="text-2xl lg:text-3xl font-display mt-2">{plan.name}</h3>
                    <p className="text-sm text-muted-foreground mt-2">{plan.description}</p>
                  </div>

                  {/* Price */}
                  <div className="mb-8">
                    {plan.price.monthly !== null ? (
                      <div className="flex items-baseline gap-2">
                        <span className="text-5xl lg:text-6xl font-display">
                          ${isAnnual ? plan.price.annual : plan.price.monthly}
                        </span>
                        <span className="text-muted-foreground text-sm">/month</span>
                      </div>
                    ) : (
                      <span className="text-4xl font-display">Custom</span>
                    )}
                    {plan.price.monthly !== null && plan.price.monthly > 0 && (
                      <p className="text-xs text-muted-foreground mt-2 font-mono">
                        {isAnnual ? "billed annually" : "billed monthly"}
                      </p>
                    )}
                  </div>

                  {/* Features */}
                  <ul className="space-y-3 mb-10">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <Check className="w-4 h-4 text-[#eca8d6] mt-0.5 shrink-0" />
                        <span className="text-sm text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <button
                    className={`w-full py-4 flex items-center justify-center gap-2 text-sm font-medium transition-all group ${
                      plan.highlight
                        ? "bg-foreground text-background hover:bg-foreground/90"
                        : "border border-foreground/20 text-foreground hover:border-foreground hover:bg-foreground/5"
                    }`}
                  >
                    {plan.cta}
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom note with icons */}
        <div className={`mt-20 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8 pt-12 border-t border-foreground/10 transition-all duration-1000 delay-500 ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}>
          <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <Check className="w-4 h-4 text-[#eca8d6]" />
              Шифрований менторинг
            </span>
            <span className="flex items-center gap-2">
              <Check className="w-4 h-4 text-[#eca8d6]" />
              Повні звіти успіху
            </span>
            <span className="flex items-center gap-2">
              <Check className="w-4 h-4 text-[#eca8d6]" />
              Багатомовна підтримка
            </span>
          </div>
          <a href="#" className="text-sm underline underline-offset-4 hover:text-foreground transition-colors">
            Порівняти всі функції
          </a>
        </div>
      </div>

      <style jsx>{`
        .text-stroke {
          -webkit-text-stroke: 1.5px currentColor;
          -webkit-text-fill-color: transparent;
        }
      `}</style>
    </section>
  );
}
