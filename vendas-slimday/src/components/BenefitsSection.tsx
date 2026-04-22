import { motion } from "framer-motion";
import { CheckCircle2, Heart, Zap, Sparkles } from "lucide-react";

import React from "react";
const benefits = [
  { 
    icon: <Sparkles className="h-6 w-6" />, 
    title: "Plano Personalizado", 
    desc: "Descubra uma recomendação pensada para o seu momento atual, com base no seu objetivo e na sua rotina." 
  },
  { 
    icon: <Heart className="h-6 w-6" />, 
    title: "Feminino & Exclusivo", 
    desc: "Receba um direcionamento que combina mais com você e facilita o início sem qualquer tipo de complicação." 
  },
  { 
    icon: <Zap className="h-6 w-6" />, 
    title: "Treinos de 15 Minutos", 
    desc: "Uma proposta real para você conseguir resultados mesmo nos dias mais corridos e sem tempo." 
  },
  { 
    icon: <Flame className="h-6 w-6" />, 
    title: "Controle de Calorias", 
    desc: "Metas diárias ajustadas ao seu objetivo (emagrecer ou ganhar massa) para resultados reais." 
  },
];

const BenefitsSection = ({ id }: { id?: string }) => (
  <section className="py-20 md:py-32 bg-white" id={id}>
    <div className="container">
      <div className="text-center max-w-4xl mx-auto mb-20 px-4">
        <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-slate-50 text-slate-400 font-bold text-[10px] uppercase tracking-[3px] border border-slate-100 mb-8 shadow-sm">
          Como funciona
        </div>
        <h2 className="text-4xl md:text-6xl font-serif text-slate-900 leading-tight mb-8">
          Um método pensado para se <span className="text-primary italic">encaixar na sua rotina</span>
        </h2>
        <p className="text-lg text-slate-500 leading-relaxed font-light">
          Conheça os pilares que tornam a experiência SlimDay mais leve, prática e fácil de seguir no dia a dia, focando no que realmente traz resultado.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {benefits.map((b, idx) => (
          <motion.div 
            key={b.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1 }}
            className="group p-10 rounded-[40px] bg-slate-50/50 border border-slate-100/50 hover:bg-white hover:shadow-premium hover:-translate-y-2 transition-all duration-500"
          >
            <div className="w-16 h-16 grid place-items-center rounded-2xl bg-white text-primary mb-8 shadow-sm group-hover:bg-primary group-hover:text-white transition-colors duration-500">
              {b.icon}
            </div>
            <h3 className="text-xl font-serif text-slate-800 mb-4">{b.title}</h3>
            <p className="text-slate-500 leading-relaxed text-sm font-light">{b.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default BenefitsSection;
