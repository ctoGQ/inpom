"use client";

import { useEffect, useState, useRef } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

const testimonials = [
  {
    quote: "Спільнота матерів допомогла мені запустити свій бізнес. Менторинг змінив усе.",
    author: "Софія Коваль",
    role: "Засновниця",
    company: "Craft Studio",
    metric: { value: "3x", label: "Дохід за рік" },
  },
  {
    quote: "Юридичний консалтинг розв'язав мої проблеми з реєстрацією. Тепер я знаю свої права.",
    author: "Марія Петренко",
    role: "Керівниця",
    company: "Eco Goods",
    metric: { value: "100%", label: "Правова захищеність" },
  },
  {
    quote: "Партнери матерів дали мені інвестицію. Спільнота змінила мою долю.",
    author: "Катерина Левицька",
    role: "CEO",
    company: "Tech Innovation",
    metric: { value: "10x", label: "Зростання компанії" },
  },
  {
    quote: "24/7 підтримка матерів чудова. Розумію, що я не сама. Ми разом.",
    author: "Лілія Малик",
    role: "Активістка",
    company: "Community Hub",
    metric: { value: "9000+", label: "Матерів в мережі" },
  },
];

export function TestimonialsSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [direction, setDirection] = useState<"left" | "right">("right");
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

  useEffect(() => {
    const interval = setInterval(() => {
      setDirection("right");
      setActiveIndex((prev) => (prev + 1) % testimonials.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const goTo = (index: number) => {
    setDirection(index > activeIndex ? "right" : "left");
    setActiveIndex(index);
  };

  const goPrev = () => {
    setDirection("left");
    setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const goNext = () => {
    setDirection("right");
    setActiveIndex((prev) => (prev + 1) % testimonials.length);
  };

  const activeTestimonial = testimonials[activeIndex];

  return (
    <section ref={sectionRef} className="relative overflow-hidden bg-white py-12 text-black lg:py-10">
      {/* ASCII background pattern */}
      <div className="absolute inset-0 select-none overflow-hidden whitespace-pre font-mono text-[10px] leading-tight text-black/[0.04]">
        {Array.from({ length: 60 }, (_, i) => 
          Array.from({ length: 100 }, () => 
            Math.random() > 0.7 ? '"' : ' '
          ).join("")
        ).join("\n")}
      </div>

      <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-20">
          <div>
            <span className="mb-4 inline-flex items-center gap-3 font-mono text-sm text-black/60">
              <span className="h-px w-12 bg-black/20" />
              Історії матерів
            </span>
            <h2 className={`text-4xl lg:text-5xl font-display transition-all duration-1000 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}>
              Довіряють матері
              <span className="text-black/50"> по всьому світу.</span>
            </h2>
          </div>
          
          {/* Navigation arrows */}
          <div className="hidden lg:flex items-center gap-2">
            <button
              onClick={goPrev}
              className="border border-black/20 p-4 transition-colors hover:bg-black/5"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <button
              onClick={goNext}
              className="border border-black/20 p-4 transition-colors hover:bg-black/5"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main content - Split layout */}
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-20">
          {/* Quote side */}
          <div className="lg:col-span-7 relative">
            {/* Large quote mark */}
            <span className="absolute -left-4 -top-8 select-none font-display text-[200px] leading-none text-black/[0.06]">
              &ldquo;
            </span>
            
            <div className="relative">
              <blockquote 
                key={activeIndex}
                className="text-3xl lg:text-4xl xl:text-5xl font-display leading-[1.2] tracking-tight animate-fadeSlideIn"
              >
                {activeTestimonial.quote}
              </blockquote>

              {/* Author */}
              <div className="mt-12 flex items-center gap-6">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-black/10">
                  <span className="font-display text-xl">
                    {activeTestimonial.author.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="text-lg font-medium">{activeTestimonial.author}</p>
                  <p className="text-black/60">
                    {activeTestimonial.role}, {activeTestimonial.company}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Metric cards side */}
          <div className="lg:col-span-5 flex flex-col justify-center gap-6">
            {/* Active metric - Large */}
            <div 
              key={`metric-${activeIndex}`}
              className="animate-fadeSlideIn border border-black/15 bg-black/[0.03] p-10"
            >
              <span className="text-7xl lg:text-8xl font-display block mb-4">
                {activeTestimonial.metric.value}
              </span>
              <span className="text-lg text-black/60">
                {activeTestimonial.metric.label}
              </span>
            </div>

            {/* Progress indicators */}
            <div className="flex gap-2">
              {testimonials.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => goTo(idx)}
                  className="h-1 flex-1 overflow-hidden bg-black/15"
                >
                  <div 
                    className={`h-full bg-black transition-all duration-300 ${
                      idx === activeIndex ? "w-full" : idx < activeIndex ? "w-full opacity-50" : "w-0"
                    }`}
                    style={idx === activeIndex ? { animation: "progress 8s linear forwards" } : {}}
                  />
                </button>
              ))}
            </div>

            {/* Company list */}
            <div className="mt-4 border-t border-black/10 pt-6">
              <span className="mb-4 block font-mono text-xs uppercase tracking-widest text-black/50">
                Матері, які розповідають свої історії
              </span>
              <div className="flex flex-wrap gap-3">
                {testimonials.map((t, idx) => (
                  <button
                    key={t.company}
                    onClick={() => goTo(idx)}
                    className={`px-4 py-2 text-sm border transition-all ${
                      idx === activeIndex 
                        ? "border-black/50 text-black" 
                        : "border-black/15 text-black/50 hover:border-black/35"
                    }`}
                  >
                    {t.company}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeSlideIn {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-fadeSlideIn {
          animation: fadeSlideIn 0.5s ease-out forwards;
        }
        @keyframes progress {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </section>
  );
}
