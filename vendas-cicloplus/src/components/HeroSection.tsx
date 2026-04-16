import React from "react";
import { Button } from "@/components/ui/button";

const HeroSection = () => (
  <section className="py-10 md:py-14 relative">
    <div className="absolute inset-0 pointer-events-none" style={{
      background: "radial-gradient(circle at 15% 20%, hsl(16 100% 60% / 0.08), transparent 24%), radial-gradient(circle at 85% 10%, hsl(145 82% 38% / 0.07), transparent 22%)"
    }} />
    <div className="container grid md:grid-cols-[1.2fr_0.8fr] gap-7 items-center relative">
      <div className="bg-card/95 border border-border shadow-card rounded-3xl p-8 md:p-10 animate-fade-in-up">
        <div className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-primary-soft text-primary font-bold text-sm border border-primary/15 mb-5">
          ✨ Teste rápido gratuito · leva menos de 2 minutos
        </div>
        <h1 className="text-3xl md:text-5xl font-extrabold leading-[0.96] tracking-tight text-secondary mb-4">
          Descubra o plano <span className="text-gradient">SlimDay</span> com treinos de até 15 minutos para mulheres com rotina corrida
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed mb-5 max-w-2xl">
          Responda algumas perguntas e veja uma recomendação personalizada com base na sua fase atual, no seu objetivo e no tempo que você realmente tem no dia.
        </p>
        <div className="flex flex-wrap gap-3 mb-6">
          {["Treinos de até 15 minutos", "Ideal para dias corridos", "Comece de forma leve", "Mais clareza para manter constância"].map((chip) => (
            <span key={chip} className="px-3.5 py-2.5 rounded-full bg-gradient-to-b from-card to-primary-soft border border-primary/10 text-sm font-bold text-secondary shadow-sm">
              {chip}
            </span>
          ))}
        </div>
        <div className="flex flex-col md:flex-row gap-3 mb-3">
          <a href="#quiz">
            <Button variant="cta" size="lg" className="w-full md:w-auto">Começar meu diagnóstico</Button>
          </a>
          <a href="#como-funciona">
            <Button variant="outline" size="lg" className="w-full md:w-auto rounded-xl font-bold">Ver como funciona</Button>
          </a>
        </div>
        <p className="text-sm text-muted-foreground">
          Criado para quem quer começar de um jeito mais leve, prático e possível de manter.
        </p>
      </div>

      <div className="bg-card/95 border border-border shadow-card rounded-3xl p-5 grid gap-4 animate-fade-in-up" style={{ animationDelay: "0.2s", opacity: 0 }}>
        {[
          { title: "15 min", desc: "Treinos pensados para caber na sua rotina, inclusive em dias corridos." },
          { title: "Plano adaptado", desc: "O quiz cria uma experiência mais relevante com base em idade, altura, peso, meta e disponibilidade." },
          { title: "Foco em consistência", desc: "Em vez de complicar, o método prioriza adesão, simplicidade e evolução progressiva." },
        ].map((stat) => (
          <div key={stat.title} className="p-5 rounded-2xl bg-gradient-to-b from-card to-primary-soft border border-border">
            <strong className="block text-2xl text-secondary mb-1">{stat.title}</strong>
            <span className="text-sm text-muted-foreground leading-relaxed">{stat.desc}</span>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default HeroSection;
