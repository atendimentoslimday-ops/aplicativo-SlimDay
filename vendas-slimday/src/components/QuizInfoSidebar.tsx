import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Zap, ShieldCheck } from "lucide-react";

const CHECKOUT_URL = "https://pay.kirvano.com/e4ad9a8c-bee4-4279-be20-8f39c46c17df";

const QuizInfoSidebar = () => {
  const [timeLeft, setTimeLeft] = useState(900);

  useEffect(() => {
    const STORAGE_KEY = "slimday_timer_end";
    const DURATION = 900;
    
    const getInitialTime = () => {
      const savedEnd = localStorage.getItem(STORAGE_KEY);
      const now = Math.floor(Date.now() / 1000);
      
      if (savedEnd) {
        const end = parseInt(savedEnd, 10);
        const remaining = end - now;
        if (remaining > 0) return remaining;
        if (remaining < -3600) {
          const newEnd = now + DURATION;
          localStorage.setItem(STORAGE_KEY, newEnd.toString());
          return DURATION;
        }
        return 0;
      }
      
      const newEnd = now + DURATION;
      localStorage.setItem(STORAGE_KEY, newEnd.toString());
      return DURATION;
    };

    const initialTime = getInitialTime();
    setTimeLeft(initialTime);

    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const goCheckout = () => {
    window.open(CHECKOUT_URL, "_blank");
  };

  return (
    <div className="bg-card border border-border rounded-3xl shadow-card p-6 md:p-7">
      <div className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-primary-soft text-primary font-bold text-sm border border-primary/15 mb-4">
        Diagnóstico SlimDay
      </div>
      <h2 className="text-3xl md:text-[40px] font-extrabold leading-none tracking-tight text-secondary mb-3">
        Descubra o plano que mais combina com o seu momento
      </h2>
      <p className="text-slate-600 leading-relaxed mb-5">
        Em menos de 2 minutos, você descobre qual formato pode funcionar melhor para a sua rotina, o seu objetivo e o tempo que você realmente tem disponível.
      </p>

      <div className="grid gap-3 mb-5">
        {[
          "✨ Veja uma recomendação mais alinhada ao seu perfil.",
          "⏱️ Entenda como encaixar treinos curtos no seu dia.",
        ].map((item) => (
          <div key={item} className="p-3.5 rounded-2xl bg-muted border border-border font-semibold text-secondary leading-relaxed text-sm">
            {item}
          </div>
        ))}
      </div>

      {/* Side Offer */}
      <div className="p-6 rounded-[2.5rem] bg-gradient-to-br from-emerald-600 to-emerald-800 border-0 shadow-2xl relative overflow-hidden group">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-white/20 transition-colors" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-emerald-400/10 blur-2xl rounded-full -ml-8 -mb-8" />
        
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-4">
            <span className="inline-flex px-3.5 py-1.5 rounded-full bg-emerald-400 text-emerald-950 font-black text-[10px] uppercase tracking-[2px] shadow-sm">
              Oferta disponível hoje
            </span>
            <span className="text-[10px] font-bold text-emerald-200 uppercase tracking-widest">
              Pagamento único
            </span>
          </div>

          {/* Countdown Timer */}
          <div className="mb-6 p-3 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-between text-white">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-emerald-400 animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Oferta expira em:</span>
            </div>
            <span className="text-xl font-mono font-black text-emerald-400">{formatTime(timeLeft)}</span>
          </div>

          <h3 className="text-2xl font-extrabold text-white tracking-tight mb-2 leading-tight">
            Comece hoje com um valor mais leve
          </h3>
          <p className="text-emerald-100/80 text-sm leading-relaxed mb-5 font-medium">
            Uma condição exclusiva para você garantir sua entrada no SlimDay agora.
          </p>

          <div className="flex items-baseline gap-3 mb-6 bg-white/10 p-4 rounded-2xl backdrop-blur-sm border border-white/10">
            <span className="text-emerald-300/60 text-lg font-bold line-through">R$ 89,90</span>
            <span className="text-5xl font-black text-white tracking-tighter">R$ 29,90</span>
          </div>

          <div className="grid gap-3 mb-6">
            {[
              "Acesso imediato à experiência Elite.",
              "Treinos curtos (15 min) de alta eficácia.",
              "Direto, sem enrolação e 100% prático.",
            ].map((item) => (
              <div key={item} className="flex gap-3 items-start text-white font-semibold text-sm leading-tight">
                <span className="text-emerald-400">✔️</span>
                <div>{item}</div>
              </div>
            ))}
          </div>

          <Button 
            variant="secondary" 
            onClick={goCheckout} 
            className="w-full h-14 rounded-2xl bg-white text-emerald-900 hover:bg-emerald-50 font-bold text-lg shadow-xl active:scale-[0.98] transition-all"
          >
            Garantir meu acesso agora
          </Button>

          <p className="text-[10px] text-emerald-200/60 mt-4 text-center font-bold uppercase tracking-widest">
            Acesso vitalício · Sem mensalidades
          </p>

          {/* Trust Icons */}
          <div className="mt-6 pt-6 border-t border-white/10 flex flex-col items-center gap-3">
            <div className="flex items-center gap-4 saturate-150 brightness-110">
              <img src="https://cdn.jsdelivr.net/gh/datatrans/payment-logos/assets/cards/visa.svg" alt="Visa" className="h-3 object-contain" />
              <img src="https://cdn.jsdelivr.net/gh/datatrans/payment-logos/assets/cards/mastercard.svg" alt="Mastercard" className="h-5 object-contain" />
              <img src="https://cdn.jsdelivr.net/gh/datatrans/payment-logos/assets/cards/elo.svg" alt="Elo" className="h-4 object-contain" />
              <div className="flex items-center gap-1">
                <img src="https://logopng.com.br/logos/pix-106.svg" alt="Pix" className="h-5 object-contain brightness-200" />
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-[8px] text-emerald-200/60 uppercase tracking-[1px] font-bold">
              <ShieldCheck className="h-3.5 w-3.5" /> Transação Criptografada
            </div>
          </div>
        </div>
      </div>

      <p className="text-xs text-muted-foreground mt-4 leading-relaxed">
        A personalização é comercial e educativa. Para orientações clínicas, consulte um profissional de saúde.
      </p>
    </div>
  );
};

export default QuizInfoSidebar;
