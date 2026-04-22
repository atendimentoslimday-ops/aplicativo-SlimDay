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

const purchaseNotifications = [
  { name: "Mariana S.", location: "São Paulo, SP" },
  { name: "Juliana R.", location: "Belo Horizonte, MG" },
  { name: "Fernanda O.", location: "Curitiba, PR" },
  { name: "Carla M.", location: "Rio de Janeiro, RJ" },
  { name: "Patrícia L.", location: "Salvador, BA" },
];

const PricingFaqSection = () => {
  const [timeLeft, setTimeLeft] = React.useState(900); // 15 minutes in seconds
  const [activeNotification, setActiveNotification] = React.useState(0);
  const [showNotification, setShowNotification] = React.useState(false);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 900));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 5000);
      setActiveNotification((prev) => (prev + 1) % purchaseNotifications.length);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
  <section className="py-24 md:py-32 bg-slate-900 text-white overflow-hidden relative">
    <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-500/10 blur-[150px] rounded-full -mr-64 -mt-64" />
    <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-emerald-500/5 blur-[150px] rounded-full -ml-64 -mb-64" />
    
    <div className="container relative z-10 px-4 mx-auto">
      <div className="text-center max-w-4xl mx-auto mb-20">
        <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/5 border border-white/10 text-emerald-400 font-bold text-[10px] uppercase tracking-[3px] mb-8">
          Oferta Exclusiva Elite
        </div>
        <h2 className="text-4xl md:text-7xl font-serif mb-8 leading-tight">
          Sua melhor versão por <span className="text-emerald-400 italic">menos de R$ 1</span> por dia
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
              { icon: <Calendar className="h-6 w-6" />, title: "SlimDay App", desc: "Experiência completa para acompanhar seu ritmo com sabedoria." },
            ].map((item) => (
              <motion.div 
                key={item.title}
                whileHover={{ y: -5 }}
                className="p-8 rounded-[40px] bg-white/5 border border-white/10 backdrop-blur-xl hover:bg-white/10 transition-all duration-300"
              >
                <div className="h-12 w-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-6">
                  {item.icon}
                </div>
                <h3 className="text-xl font-serif italic mb-3 text-white">{item.title}</h3>
                <p className="text-slate-300 text-sm leading-relaxed font-light">{item.desc}</p>
              </motion.div>
            ))}
          </div>

          <div className="p-10 rounded-[40px] bg-gradient-to-br from-emerald-950/50 to-slate-900 border border-emerald-500/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-3xl group-hover:bg-emerald-500/20 transition-all" />
            <div className="flex flex-col md:flex-row gap-8 items-center relative z-10">
              <div className="h-20 w-20 bg-emerald-500/20 rounded-3xl flex items-center justify-center border border-emerald-500/30 shadow-premium">
                <ShieldCheck className="h-10 w-10 text-emerald-400" />
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
              <div className="bg-emerald-500/10 text-emerald-600 text-[10px] uppercase tracking-[3px] font-black px-5 py-2 rounded-full">Elite Offer</div>
            </div>
            
            <div className="mb-10">
              <span className="text-slate-300 line-through text-xl font-light">R$ 89,90</span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-3xl font-serif italic text-slate-400">R$</span>
                <span className="text-8xl font-serif leading-none tracking-tighter text-slate-900">29,90</span>
              </div>
              <p className="text-slate-400 mt-4 text-xs font-bold uppercase tracking-widest">Pagamento único · Acesso Vitalício</p>
              
              {/* Countdown Timer */}
              <div className="mt-6 p-4 rounded-3xl bg-emerald-500/5 border border-emerald-500/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Zap className="h-5 w-5 text-emerald-500 animate-pulse" />
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Oferta expira em:</span>
                </div>
                <span className="text-2xl font-mono font-black text-emerald-500">{formatTime(timeLeft)}</span>
              </div>
            </div>

            <div className="space-y-6 mb-12">
              {[
                "Ativação Imediata via E-mail",
                "Experiência Completa SlimDay",
                "Plano Personalizado Incluso",
                "Suporte Especializado",
              ].map((check) => (
                <div key={check} className="flex items-center gap-4 text-slate-600 font-light">
                  <div className="h-6 w-6 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500">
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
              <Button className="w-full h-20 bg-emerald-600 text-white text-lg font-bold rounded-[30px] hover:bg-emerald-700 transition-all shadow-premium flex items-center justify-center gap-3 active:scale-95 border-none">
                Ativar Meu Plano Agora
              </Button>
            </a>

            {/* Payment Icons */}
            <div className="mt-8 flex flex-col items-center gap-4">
              <div className="flex items-center gap-4 opacity-50 grayscale hover:grayscale-0 transition-all">
                <img src="https://logodownload.org/wp-content/uploads/2014/10/visa-logo-1.png" alt="Visa" className="h-3 object-contain" />
                <img src="https://logodownload.org/wp-content/uploads/2014/07/mastercard-logo-7.png" alt="Mastercard" className="h-5 object-contain" />
                <img src="https://logodownload.org/wp-content/uploads/2015/03/elo-logo-1.png" alt="Elo" className="h-4 object-contain" />
                <div className="flex items-center gap-1 font-black text-xs text-slate-800 uppercase tracking-tighter">
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
        <h3 className="text-3xl md:text-5xl font-serif text-center mb-16 italic text-white">Dúvidas Frequentes</h3>
        <div className="grid md:grid-cols-2 gap-4">
          {faqs.map((faq, i) => (
            <details key={i} className="group bg-white/5 border border-white/10 rounded-[30px] p-8 hover:bg-white/10 transition-all duration-300">
              <summary className="list-none cursor-pointer flex justify-between items-center font-serif text-lg text-slate-200 uppercase tracking-tight">
                {faq.q}
                <ChevronDown className="h-5 w-5 text-emerald-500 group-open:rotate-180 transition-transform duration-300" />
              </summary>
              <p className="mt-6 text-slate-400 text-base leading-relaxed font-light">{faq.a}</p>
            </details>
          ))}
        </div>
      </div>
    </div>

    {/* Social Proof Notification */}
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
            <p className="text-[9px] text-slate-500 font-medium mt-1 uppercase tracking-tight font-bold">Acaba de ativar o Plano Elite ✨</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </section>
);
};

export default PricingFaqSection;
