import React from "react";
import { ShieldCheck, Sparkles, Zap, Heart, Calendar, Check, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { trackFacebookEvent } from "@/utils/facebook";

const faqs = [
  { q: "Preciso ter experiência com exercícios?", a: "Não. A SlimDay é desenhada para quem quer começar do zero, com algo simples e real." },
  { q: "Os treinos são muito longos?", a: "Absolutamente não. Nosso foco são treinos de 15 minutos que protegem sua agenda e dão resultado." },
  { q: "Posso fazer em casa?", a: "Sim. A proposta é 100% prática e acessível para o seu dia a dia, sem necessidade de equipamentos." },
  { q: "Para quem o SlimDay é indicado?", a: "Para mulheres com rotina corrida que buscam eficiência, praticidade e uma forma elegante de cuidar da saúde." },
  { q: "Quanto custa o acesso?", a: "R$ 29,90 em pagamento único. Sem mensalidades, sem surpresas e com acesso vitalício." },
  { q: "Como recebo o acesso?", a: "Imediatamente após a confirmação. Você receberá todas as instruções no seu e-mail em instantes." },
];


const PricingFaqSection = () => {
  const [timeLeft, setTimeLeft] = React.useState(900); // 15 minutes in seconds
  React.useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 900));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
  <section className="py-24 md:py-32 bg-slate-900 text-white overflow-hidden relative">
    <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/10 blur-[150px] rounded-full -mr-64 -mt-64" />
    <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-emerald-500/5 blur-[150px] rounded-full -ml-64 -mb-64" />
    
    <div className="container relative z-10 px-4">
      <div className="text-center max-w-4xl mx-auto mb-20">
        <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/5 border border-white/10 text-primary font-bold text-[10px] uppercase tracking-[3px] mb-8">
          Oferta Exclusiva Elite
        </div>
        <h2 className="text-4xl md:text-7xl font-serif mb-8 leading-tight">
          Sua melhor versão por <span className="text-primary italic">menos de R$ 1</span> por dia
        </h2>
        <p className="text-xl text-slate-400 font-light max-w-2xl mx-auto leading-relaxed">
          Acesso vitalício, sem mensalidades e com garantia incondicional. O SlimDay é o último guia que você vai precisar.
        </p>
      </div>

      <div className="grid lg:grid-cols-[1fr,480px] gap-16 items-start">
        <div className="space-y-10">
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { icon: <Sparkles className="h-6 w-6" />, title: "Acesso Vitalício", desc: "Pague uma única vez e tenha o guia para sempre à sua disposição." },
              { icon: <Heart className="h-6 w-6" />, title: "Guia Alimentar", desc: "Refeições rápidas e deliciosas que sua família também vai amar." },
              { icon: <Zap className="h-6 w-6" />, title: "Treinos de 15 Min", desc: "Foco total em resultados reais dentro da sua rotina agitada." },
              { icon: <Calendar className="h-6 w-6" />, title: "Ciclo+ App", desc: "Módulo exclusivo para acompanhar seu ritmo feminino com sabedoria." },
            ].map((item) => (
              <motion.div 
                key={item.title}
                whileHover={{ y: -5 }}
                className="p-8 rounded-[40px] bg-white/5 border border-white/10 backdrop-blur-xl hover:bg-white/10 transition-all duration-300"
              >
                <div className="h-12 w-12 rounded-2xl bg-primary/20 text-primary flex items-center justify-center mb-6">
                  {item.icon}
                </div>
                <h3 className="text-xl font-serif italic mb-3 text-white">{item.title}</h3>
                <p className="text-slate-300 text-sm leading-relaxed font-light">{item.desc}</p>
              </motion.div>
            ))}
          </div>

          <div className="p-10 rounded-[40px] bg-gradient-to-br from-emerald-950/50 to-slate-900 border border-primary/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl group-hover:bg-primary/20 transition-all" />
            <div className="flex flex-col md:flex-row gap-8 items-center relative z-10">
              <div className="h-20 w-20 bg-primary/20 rounded-3xl flex items-center justify-center border border-primary/30 shadow-premium">
                <ShieldCheck className="h-10 w-10 text-primary" />
              </div>
              <div className="text-center md:text-left">
                <h4 className="text-2xl font-serif italic text-white mb-2">Garantia Blindada de 7 Dias</h4>
                <p className="text-slate-300 text-base font-light leading-relaxed">
                  Se em uma semana você não amar o SlimDay, devolvemos 100% do seu investimento sem qualquer burocracia.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="sticky top-24">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            className="p-12 rounded-[50px] bg-white text-slate-900 shadow-premium-dark relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-8">
              <div className="bg-primary/10 text-primary text-[10px] uppercase tracking-[3px] font-black px-5 py-2 rounded-full">Elite Offer</div>
            </div>
            
            <div className="mb-10">
              <span className="text-slate-300 line-through text-xl font-light">R$ 89,90</span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-3xl font-serif italic text-slate-400">R$</span>
                <span className="text-8xl font-serif leading-none tracking-tighter text-slate-900">29,90</span>
              </div>
              <p className="text-slate-400 mt-4 text-xs font-bold uppercase tracking-widest">Pagamento único · Acesso Vitalício</p>
              
              {/* Countdown Timer */}
              <div className="mt-6 p-4 rounded-3xl bg-primary/5 border border-primary/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Zap className="h-5 w-5 text-primary animate-pulse" />
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Oferta expira em:</span>
                </div>
                <span className="text-2xl font-mono font-black text-primary">{formatTime(timeLeft)}</span>
              </div>
            </div>

            <div className="space-y-6 mb-12">
              {[
                "Ativação Imediata via E-mail",
                "Experiência Completa SlimDay",
                "Módulo Ciclo+ de Acompanhamento",
                "Suporte Especializado",
              ].map((check) => (
                <div key={check} className="flex items-center gap-4 text-slate-600 font-light">
                  <div className="h-6 w-6 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                    <Check className="h-3.5 w-3.5" />
                  </div>
                  {check}
                </div>
              ))}
            </div>

            <a 
              href="https://pay.kirvano.com/e4ad9a8c-bee4-4279-be20-8f39c46c17df"
              onClick={() => trackFacebookEvent('InitiateCheckout', { 
                content_name: 'SlimDay Elite Main Offer',
                value: 29.90,
                currency: 'BRL'
              })}
            >
              <Button className="w-full h-20 bg-slate-900 text-white text-lg font-bold rounded-[30px] hover:bg-primary transition-all shadow-premium flex items-center justify-center gap-3 active:scale-95">
                Ativar Meu Plano Agora
              </Button>
            </a>

            {/* Payment Icons */}
            <div className="mt-8 flex flex-col items-center gap-4">
              <div className="flex items-center gap-4 opacity-50 grayscale hover:grayscale-0 transition-all">
                <img src="https://logodownload.org/wp-content/uploads/2014/10/visa-logo-1.png" alt="Visa" className="h-3 object-contain" />
                <img src="https://logodownload.org/wp-content/uploads/2014/07/mastercard-logo-7.png" alt="Mastercard" className="h-5 object-contain" />
                <img src="https://logodownload.org/wp-content/uploads/2015/03/elo-logo-1.png" alt="Elo" className="h-4 object-contain" />
                <div className="flex items-center gap-1 font-black text-xs text-slate-800">
                  <svg className="h-4 w-4 fill-emerald-500" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.477 2 12c0 5.523 4.477 10 10 10s10-4.477 10-10c0-5.523-4.477-10-10-10zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z"/><path d="M12 6c-3.309 0-6 2.691-6 6s2.691 6 6 6 6-2.691 6-6-2.691-6-6-6zm2.4 9h-4.8v-1.2h4.8V15zm0-2.4h-4.8v-1.2h4.8v1.2zm0-2.4h-4.8V9h4.8v1.2z"/></svg>
                  PIX
                </div>
              </div>
              <p className="text-[10px] text-slate-400 font-medium">Acesso imediato liberado após o pagamento</p>
            </div>

          </motion.div>
          
          <p className="text-center mt-8 text-slate-500 text-[10px] flex items-center justify-center gap-2 uppercase tracking-[2px] font-bold">
            <ShieldCheck className="h-4 w-4" /> Segurança em Nível Bancário SSL
          </p>
        </div>
      </div>

      <div className="mt-32 max-w-4xl mx-auto px-4">
        <h3 className="text-3xl md:text-5xl font-serif text-center mb-16 italic">Dúvidas Frequentes</h3>
        <div className="grid md:grid-cols-2 gap-4">
          {faqs.map((faq, i) => (
            <details key={i} className="group bg-white/5 border border-white/10 rounded-[30px] p-8 hover:bg-white/10 transition-all duration-300">
              <summary className="list-none cursor-pointer flex justify-between items-center font-serif text-lg text-slate-200">
                {faq.q}
                <ChevronDown className="h-5 w-5 text-primary group-open:rotate-180 transition-transform duration-300" />
              </summary>
              <p className="mt-6 text-slate-400 text-base leading-relaxed font-light">{faq.a}</p>
            </details>
          ))}
        </div>
      </div>
    </div>

    </div>
  </section>
);

export default PricingFaqSection;
