import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    text: "Eu nunca conseguia manter rotina nenhuma. Com treinos curtos, ficou muito mais fácil começar sem sentir que eu precisava reorganizar o meu dia inteiro.",
    name: "Mariana S.",
    role: "Rotina de trabalho intensa",
    initials: "MS"
  },
  {
    text: "O que mais gostei foi a praticidade. Em vez de ficar perdida, eu abria o app e simplesmente fazia o que já estava organizado e personalizado pra mim.",
    name: "Juliana R.",
    role: "Mãe e empreendedora",
    initials: "JR"
  },
  {
    text: "A sensação de plano personalizado me fez continuar. Parecia que o SlimDay entendia que eu não tinha uma hora livre por dia para me dedicar.",
    name: "Camila T.",
    role: "Agenda corrida e pouco tempo",
    initials: "CT"
  },
];

const TestimonialsSection = () => (
  <section className="py-20 md:py-32 bg-slate-50/30">
    <div className="container px-4">
      <div className="text-center max-w-4xl mx-auto mb-20">
        <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white border border-slate-100 text-primary font-bold text-[10px] uppercase tracking-[3px] mb-8 shadow-sm">
          Histórias que inspiram
        </div>
        <h2 className="text-4xl md:text-6xl font-serif text-slate-900 leading-tight mb-8">
          Experiências que <span className="text-primary italic">transformaram a rotina</span>
        </h2>
        <p className="text-lg text-slate-500 font-light max-w-2xl mx-auto">
          Relatos reais de mulheres que buscavam praticidade e encontraram no SlimDay o equilíbrio perfeito para o dia a dia.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {testimonials.map((t, idx) => (
          <motion.div 
            key={t.name}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1 }}
            className="relative p-10 rounded-[40px] bg-white border border-slate-100 shadow-premium group hover:-translate-y-2 transition-all duration-500"
          >
            <div className="absolute top-8 right-10 text-slate-50 group-hover:text-primary/10 transition-colors duration-500">
              <Quote className="h-12 w-12" />
            </div>
            
            <div className="flex gap-1 mb-6">
              {[1,2,3,4,5].map(i => <Star key={i} className="h-4 w-4 fill-primary text-primary" />)}
            </div>

            <p className="text-slate-700 leading-relaxed mb-8 font-serif italic text-lg">
              "{t.text}"
            </p>
            
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-400 border border-slate-200">
                {t.initials}
              </div>
              <div>
                <strong className="text-slate-900 block font-bold">{t.name}</strong>
                <span className="text-xs text-slate-400 block uppercase tracking-wider">{t.role}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default TestimonialsSection;
