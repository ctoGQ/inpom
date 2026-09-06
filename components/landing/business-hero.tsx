"use client";

import { ArrowRight, Building2, Shield, Zap, Users, Menu } from "lucide-react";

export function BusinessHero() {
  return (
    <section className="relative flex min-h-[720px] flex-col overflow-hidden bg-black text-white sm:min-h-[500px]">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/images/inpom-business-hero.png')" }}
        aria-hidden="true"
      >
        
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,.35)_0%,rgba(0,0,0,.18)_40%,rgba(0,0,0,.96)_88%,#000_100%)]" />
      </div>

     

      {/* Main content */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-5 pb-12 pt-[200px] text-center sm:pb-12">
        <div className="w-full max-w-4xl">
          <p className="mb-4 text-xl font-semibold text-white sm:text-2xl">Для Бізнесу</p>
          <span className="font-display text-5xl">
            Inpom Accelerate
          </span>

          {/* Email signup form */}
          <div className="mx-auto mt-7 flex w-full max-w-lg items-center gap-1.5 rounded-full bg-[#202020] p-1.5 pl-5 shadow-2xl shadow-black/50 sm:mt-8">
            <input
              type="text"
              placeholder="Назва проекту"
              aria-label="Назва проекту"
              className="min-w-0 flex-1 bg-transparent text-base text-white outline-none placeholder:text-white/35 sm:text-xl"
            />
            <button className="flex shrink-0 items-center gap-2 rounded-full bg-[#1048c6] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#205bd8] sm:px-5 sm:py-3 sm:text-lg">
              Продовжити
              <ArrowRight className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
            </button>
          </div>

          {/* Features section */}
          <div className="mt-4 sm:mt-5 max-w-xl mx-auto">
            <p className="text-sm font-semibold text-white/35 sm:text-base">Залучи до свого проекту</p>
            <div className="mx-auto mt-8 grid max-w-2xl grid-cols-4 gap-x-8 gap-y-6 sm:grid-cols-4 sm:gap-10">
              {[
                { icon: Building2, label: "Інвестиції" },
                { icon: Shield, label: "Команду" },
                { icon: Zap, label: "Технології" },
                { icon: Users, label: "Клієнтів" },
              ].map((item) => (
                <div key={item.label} className="flex flex-col items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-black">
                    <item.icon className="h-5 w-5" strokeWidth={2.2} />
                  </div>
                  <span className="text-xs font-semibold text-white sm:text-xs">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
