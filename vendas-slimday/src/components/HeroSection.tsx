import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

const HeroSection = () => (
  <section className="py-12 md:py-24 relative overflow-hidden bg-sand/30">
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full -mr-64 -mt-64" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent/10 blur-[120px] rounded-full -ml-64 -mb-64" />
    </div>
    
    <div className="container grid lg:grid-cols-[1.2fr,0.8fr] gap-16 items-center relative z-10">
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-white border border-slate-100 text-primary font-bold text-[10px] uppercase tracking-[3px] mb-10 shadow-sm">
          <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
          Diagnóstico Gratuito · 2 Minutos
        </div>
        
        <h1 className="text-5xl md:text-8xl font-serif leading-[1] tracking-tight text-slate-900 mb-8">
          Sua melhor versão em <span className="text-primary italic">15 minutos</span> por dia
        </h1>
        
        <p className="text-xl text-slate-600 leading-relaxed mb-12 max-w-2xl font-light">
          Descubra o plano personalizado SlimDay. Criado para mulheres reais que buscam resultados reais, sem complicar a rotina.
        </p>
        
        <div className="flex flex-wrap gap-4 mb-12">
          {["Público Feminino", "Treinos Rápidos", "Alimentação Prática", "Foco em Constância"].map((chip) => (
            <div key={chip} className="px-6 py-2.5 rounded-full bg-white border border-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-widest shadow-sm">
              {chip}
            </div>
          ))}
        </div>
        
        <div className="flex flex-col sm:flex-row gap-5">
          <a href="#quiz">
            <Button variant="cta" size="lg" className="w-full sm:w-auto px-12 h-16 text-lg rounded-[24px] shadow-premium hover:scale-105 transition-transform bg-primary hover:bg-slate-900">
              Iniciar meu diagnóstico
            </Button>
          </a>
          <a href="#como-funciona">
            <Button variant="outline" size="lg" className="w-full sm:w-auto px-12 h-16 text-lg rounded-[24px] border-slate-200 font-bold hover:bg-white transition-colors bg-white/50 backdrop-blur-sm">
              Ver como funciona
            </Button>
          </a>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, delay: 0.2 }}
        className="relative lg:block hidden"
      >
        <div className="absolute -inset-10 bg-primary/5 rounded-[60px] blur-[80px] -z-10" />
        <div className="relative aspect-[4/5] overflow-hidden rounded-[50px] border-[12px] border-white shadow-premium-dark rotate-2 hover:rotate-0 transition-transform duration-700">
          <img 
            src="/images/model_hero.png" 
            alt="SlimDay Life" 
            className="w-full h-full object-cover grayscale-[20%] hover:grayscale-0 transition-all duration-700"
          />
        </div>
        
        <div className="absolute -left-16 bottom-24 bg-white/90 backdrop-blur-xl p-8 rounded-[40px] shadow-premium border border-white/50 max-w-[240px] -rotate-3">
          <div className="h-10 w-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4">
            <Sparkles className="h-6 w-6" />
          </div>
          <div className="text-[10px] font-bold text-primary mb-2 uppercase tracking-[3px]">Elite Standard</div>
          <div className="text-base font-serif italic text-slate-800 leading-tight">"Finalmente algo que eu realmente consigo manter."</div>
        </div>
      </motion.div>
    </div>
  </section>
);

export default HeroSection;
