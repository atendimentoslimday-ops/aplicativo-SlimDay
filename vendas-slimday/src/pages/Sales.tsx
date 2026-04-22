import React, { useState, useEffect } from "react";
import HeroSection from "@/components/HeroSection";
import BenefitsSection from "@/components/BenefitsSection";
import QuizSection from "@/components/QuizSection";
import QuizInfoSidebar from "@/components/QuizInfoSidebar";
import BenefitsSection2 from "@/components/BenefitsSection2";
import TestimonialsSection from "@/components/TestimonialsSection";
import PricingFaqSection from "@/components/PricingFaqSection";
import WhatsAppButton from "@/components/WhatsAppButton";
import StickyCTA from "@/components/StickyCTA";
import FooterSection from "@/components/FooterSection";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";

const purchaseNotifications = [
  { name: "Mariana S.", location: "São Paulo, SP" },
  { name: "Juliana R.", location: "Belo Horizonte, MG" },
  { name: "Fernanda O.", location: "Curitiba, PR" },
  { name: "Carla M.", location: "Rio de Janeiro, RJ" },
  { name: "Patrícia L.", location: "Salvador, BA" },
  { name: "Amanda K.", location: "Porto Alegre, RS" },
];

const Sales = () => {
  const [activeNotification, setActiveNotification] = useState(0);
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    // Começar após 10 segundos
    const initialDelay = setTimeout(() => {
      const interval = setInterval(() => {
        setShowNotification(true);
        setTimeout(() => setShowNotification(false), 5000);
        setActiveNotification((prev) => (prev + 1) % purchaseNotifications.length);
      }, 15000);
      return () => clearInterval(interval);
    }, 10000);
    
    return () => clearTimeout(initialDelay);
  }, []);
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-20 backdrop-blur-md bg-card/80 border-b border-border/80">
        <div className="container flex items-center justify-between py-3.5">
          <div>
            <span className="text-2xl font-extrabold text-primary leading-none">SlimDay</span>
            <div className="text-[11px] font-bold text-slate-600 mt-1 uppercase tracking-tight">
              Seu corpo em forma, mesmo com rotina corrida
            </div>
          </div>
          <a href="#quiz">
            <Button variant="cta" size="sm" className="rounded-xl hidden md:inline-flex">
              Quero meu plano personalizado
            </Button>
          </a>
        </div>
      </header>

      <main>
        <HeroSection />
        <BenefitsSection id="como-funciona" />

        {/* Quiz Section */}
        <section className="py-8 md:py-10" id="quiz">
          <div className="container grid md:grid-cols-[0.95fr_1.05fr] gap-6 items-start">
            <QuizInfoSidebar />
            <div className="flex flex-col gap-5">
              <QuizSection />

              {/* Cards movidos para a direita */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { val: "2 min", label: "para responder" },
                  { val: "15 min", label: "por dia" },
                  { val: "100%", label: "feito para rotina corrida" },
                ].map((s) => (
                  <div key={s.val} className="p-4 rounded-2xl bg-card border border-border shadow-sm text-center">
                    <strong className="block text-xl text-slate-900">{s.val}</strong>
                    <span className="text-xs text-slate-600 font-medium">{s.label}</span>
                  </div>
                ))}
              </div>

              <div className="p-5 rounded-2xl bg-gradient-to-b from-background to-primary-soft border border-border shadow-sm">
                <div className="text-xs font-extrabold text-primary uppercase tracking-wider mb-3">O que você vai descobrir</div>
                <div className="grid gap-3">
                  {[
                    "Qual formato de treino tende a se encaixar melhor no seu dia.",
                    "Como começar com mais leveza, mesmo sem muito tempo disponível.",
                    "Uma sugestão inicial pensada para dar clareza e facilitar a constância.",
                  ].map((text) => (
                    <div key={text} className="flex gap-3 items-start text-secondary leading-relaxed text-sm">
                      <span>✔️</span><div>{text}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  "💚 Descubra um jeito mais leve de começar sem complicação.",
                  "🎯 Receba uma sugestão pensada para a sua realidade atual.",
                ].map((item) => (
                  <div key={item} className="p-3.5 rounded-2xl bg-muted border border-border font-semibold text-secondary leading-relaxed text-sm">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <BenefitsSection2 />
        <TestimonialsSection />
        <PricingFaqSection />

        {/* Final CTA */}
        <section className="py-8">
          <div className="container text-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-primary-soft text-primary font-bold text-sm border border-primary/15 mb-3">
              Comece hoje
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-secondary leading-none mb-5">
              Seu plano já está pronto — basta dar o primeiro passo
            </h2>
            <a href="#quiz">
              <Button variant="cta" size="lg" className="rounded-xl text-lg">
                Quero começar agora
              </Button>
            </a>
          </div>
        </section>
      </main>

      <FooterSection />
      <WhatsAppButton />
      <StickyCTA />

      {/* Social Proof Global Notification */}
      <AnimatePresence>
        {showNotification && (
          <motion.div
            initial={{ opacity: 0, x: -50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, x: -20 }}
            className="fixed bottom-24 left-6 z-50 bg-white/95 backdrop-blur-xl p-4 pr-8 rounded-2xl shadow-2xl border border-slate-100 flex items-center gap-4 max-w-[280px]"
          >
            <div className="h-10 w-10 rounded-full bg-emerald-50 flex items-center justify-center shrink-0 border border-emerald-100">
              <Sparkles className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-900 leading-tight">
                {purchaseNotifications[activeNotification].name} de {purchaseNotifications[activeNotification].location}
              </p>
              <p className="text-[9px] text-slate-500 font-medium mt-1">Acaba de ativar o Plano Elite ✨</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Sales;
