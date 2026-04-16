import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const benefits = [
  { icon: "📝", title: "Plano personalizado", desc: "Descubra uma recomendação pensada para o seu momento atual, com base no seu objetivo e na sua rotina." },
  { icon: "🧠", title: "Recomendação exclusiva", desc: "Receba um direcionamento que combina mais com você e facilita o início sem complicação." },
  { icon: "📱", title: "Treinos que cabem no seu dia", desc: "Uma proposta prática para você começar mesmo com pouco tempo disponível." },
  { icon: "🔥", title: "Comece com mais leveza", desc: "Uma experiência criada para facilitar o início, aumentar a constância e ajudar você a dar o primeiro passo hoje." },
];

const BenefitsSection = ({ id }: { id?: string }) => (
  <section className="py-8 md:py-10" id={id}>
    <div className="container">
      <div className="text-center max-w-3xl mx-auto mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-primary-soft text-primary font-bold text-sm border border-primary/15 mb-3">
          Como funciona
        </div>
        <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-secondary leading-none mb-3">
          Um método pensado para se encaixar na sua rotina
        </h2>
        <p className="text-muted-foreground text-lg leading-relaxed">
          Conheça os pilares que tornam a experiência SlimDay mais leve, prática e fácil de seguir no dia a dia.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {benefits.map((b) => (
          <div key={b.title} className="p-6 rounded-3xl bg-gradient-to-b from-card to-background border border-border shadow-card hover:-translate-y-1 hover:shadow-lg transition-all duration-200">
            <div className="w-[52px] h-[52px] grid place-items-center rounded-2xl bg-primary-soft text-2xl mb-4">
              {b.icon}
            </div>
            <h3 className="text-lg font-bold text-secondary mb-2">{b.title}</h3>
            <p className="text-muted-foreground leading-relaxed text-sm">{b.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default BenefitsSection;
