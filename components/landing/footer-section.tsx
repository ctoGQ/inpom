"use client";

import { ArrowUpRight } from "lucide-react";
import { useEffect, useRef } from "react";

type FooterLink = {
  name: string;
  href: string;
};

const footerLinks: Record<string, FooterLink[]> = {
  "Про INPOM": [
    { name: "Хто ми", href: "/about" },
    { name: "Наша ідея", href: "#about" },
    { name: "Як це працює", href: "/about" },
    { name: "Прозорість і довіра", href: "/transparency" },
  ],
  Можливості: [
    { name: "Спільнота", href: "/community" },
    { name: "Розвиток і менторинг", href: "/development" },
    { name: "Бізнес і послуги", href: "/business" },
    { name: "Проєкти", href: "/projects" },
    { name: "Міжнародні можливості", href: "/international" },
  ],
  Партнерам: [
    { name: "Стати партнером", href: "/partnership" },
    { name: "Підтримати INPOM", href: "/partnership" },
    { name: "Запропонувати експертизу", href: "/contacts" },
    { name: "Співтворення INPOM 2.0", href: "/partnership" },
  ],
  Інформація: [
    { name: "Новини спільноти", href: "/newsletter" },
    { name: "Поширені запитання", href: "/contacts" },
    { name: "Контакти", href: "/contacts" },
    { name: "Конфіденційність", href: "#" },
    { name: "Умови", href: "#" },
  ],
};

const socialLinks = [
  { name: "Facebook", href: "#" },
  { name: "Instagram", href: "#" },
  { name: "LinkedIn", href: "#" },
];

function AnimatedWaveCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let time = 0;

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener("resize", resize);

    const animate = () => {
      const width = canvas.offsetWidth;
      const height = canvas.offsetHeight;
      ctx.clearRect(0, 0, width, height);

      ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue("--primary").trim();
      ctx.lineWidth = 1;

      for (let wave = 0; wave < 3; wave++) {
        ctx.beginPath();
        for (let x = 0; x <= width; x += 5) {
          const y =
            height * 0.5 +
            Math.sin(x * 0.01 + time + wave * 0.5) * 30 +
            Math.sin(x * 0.02 + time * 1.5 + wave) * 20;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      time += 0.02;
      animationId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return <canvas ref={canvasRef} className="w-full h-full" />;
}

export function FooterSection() {
  return (
    <footer className="relative">

      {/* Footer content */}
      <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-12">
        {/* Main Footer */}
        <div className="py-16 lg:py-20">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-12 lg:gap-8">
            {/* Brand Column */}
            <div className="col-span-2">
              <a href="#" className="inline-flex items-center gap-2 mb-6">
                <span className="text-2xl font-display text-foreground">INPOM</span>
                <span className="text-xs text-muted-foreground font-mono">МПМ</span>
              </a>

              <p className="text-muted-foreground leading-relaxed mb-8 max-w-xs text-sm">
                Міжнародний парламент матерів об'єднує жінок для взаємопідтримки, розвитку та спільної реалізації можливостей.
              </p>

              {/* Social Links */}
              <div className="flex gap-6">
                {socialLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 group"
                  >
                    {link.name}
                    <ArrowUpRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </a>
                ))}
              </div>
            </div>

            {/* Link Columns */}
            {Object.entries(footerLinks).map(([title, links]) => (
              <div key={title}>
                <h3 className="text-sm font-medium text-foreground mb-6">{title}</h3>
                <ul className="space-y-4">
                  {links.map((link) => (
                    <li key={link.name}>
                      <a
                        href={link.href}
                        className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-2"
                      >
                        {link.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-8 border-t border-foreground/15 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            &copy; 2026 INPOM. Міжнародний парламент матерів. Усі права захищені.
          </p>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary" />
              Матері активні по світу
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
