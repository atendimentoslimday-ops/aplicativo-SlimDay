const benefits2 = [
  { icon: "⏱️", title: "Treinos rápidos", desc: "Você pode começar com poucos minutos por dia e ainda sentir que está cuidando de si mesma." },
  { icon: "🏠", title: "Mais praticidade", desc: "Uma proposta simples para quem quer fazer em casa e reduzir barreiras para começar." },
  { icon: "💚", title: "Rotina mais leve", desc: "Sem excesso de informação, com foco no que realmente ajuda você a manter constância." },
  { icon: "✨", title: "Experiência guiada", desc: "Um caminho mais organizado para quem quer clareza, direção e sensação de progresso." },
];

const BenefitsSection2 = () => (
  <section className="py-8 md:py-10">
    <div className="container">
      <div className="text-center max-w-3xl mx-auto mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-primary-soft text-primary font-bold text-sm border border-primary/15 mb-3">
          Feito para a sua rotina
        </div>
        <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-secondary leading-none mb-3">
          Por que tantas mulheres se identificam com a SlimDay logo no primeiro contato
        </h2>
        <p className="text-muted-foreground text-lg leading-relaxed">
          A SlimDay foi pensada para quem quer se sentir melhor sem precisar encaixar treinos longos em uma agenda já cheia.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {benefits2.map((b) => (
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

export default BenefitsSection2;
