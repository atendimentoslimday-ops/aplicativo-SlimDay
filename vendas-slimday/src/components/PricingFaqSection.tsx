import React from "react";
import { ShieldCheck } from "lucide-react";

const faqs = [
  { q: "Preciso ter experiência com exercícios?", a: "Não. A SlimDay pode ser uma solução prática para quem quer começar com algo mais simples e leve." },
  { q: "Os treinos são longos?", a: "Não. O destaque principal é justamente a proposta de treinos curtos, de até 15 minutos, com foco em encaixe na rotina." },
  { q: "Posso fazer em casa?", a: "Sim. A proposta reforça praticidade, acessibilidade e rapidez para o dia a dia, sem precisar de academia." },
  { q: "Para quem a SlimDay é indicada?", a: "Para mulheres com rotina corrida que querem uma forma mais prática de encaixar exercícios no dia a dia e começar de maneira mais leve." },
  { q: "Quanto custa o acesso?", a: "R$ 29,90 em pagamento único — sem mensalidade. É uma oferta promocional por tempo limitado." },
  { q: "Como funciona o acesso após a compra?", a: "Após a confirmação do pagamento, você recebe o link de acesso ao aplicativo por e-mail em instantes." },
];

const PricingFaqSection = () => (
  <section className="py-8 md:py-10">
    <div className="container grid grid-cols-1 md:grid-cols-2 gap-5">
      <div className="bg-card border border-border rounded-3xl shadow-card p-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-primary-soft text-primary font-bold text-sm border border-primary/15 mb-4">
          Sua nova rotina começa aqui
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight text-secondary leading-none mb-3">
          Menos complicação, mais clareza para começar
        </h2>
        <p className="text-muted-foreground leading-relaxed mb-5">
          A SlimDay foi criada para ajudar mulheres que querem se sentir melhor sem depender de treinos longos.
        </p>

        {/* Garantia e Segurança */}
        <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-5 mb-5 flex gap-4 items-center">
          <div className="bg-white p-2.5 rounded-xl shadow-sm">
            <ShieldCheck className="h-6 w-6 text-emerald-600" />
          </div>
          <div>
            <div className="text-sm font-bold text-emerald-900 uppercase tracking-wide">Garantia Total de 7 Dias</div>
            <p className="text-xs text-emerald-700 leading-tight mt-1">
              Teste sem riscos. Se não gostar, devolvemos seu investimento integralmente. Risco zero.
            </p>
          </div>
        </div>

        <div className="grid gap-3">
          {[
            { icon: "💚", text: "Treinos pensados para caber em dias corridos." },
            { icon: "📲", text: "Uma experiência mais simples, direta e fácil de acompanhar." },
            { icon: "🌟", text: "Ideal para quem quer começar com mais confiança e menos pressão." },
            { icon: "🎯", text: "Acesso imediato após a confirmação do pagamento." },
          ].map((item) => (
            <div key={item.text} className="flex gap-3 items-start text-secondary leading-relaxed py-3 border-b border-dashed border-border last:border-0">
              <span>{item.icon}</span>
              <div>{item.text}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-card border border-border rounded-3xl shadow-card p-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-primary-soft text-primary font-bold text-sm border border-primary/15 mb-4">
          FAQ
        </div>
        <div className="grid gap-3">
          {faqs.map((faq, i) => (
            <details key={i} className="bg-card rounded-2xl border border-border shadow-sm p-4 group" open={i === 0}>
              <summary className="cursor-pointer font-extrabold text-secondary list-none">
                {faq.q}
              </summary>
              <p className="text-muted-foreground leading-relaxed mt-3 text-sm">{faq.a}</p>
            </details>
          ))}
        </div>
      </div>
    </div>
  </section>
);

export default PricingFaqSection;
