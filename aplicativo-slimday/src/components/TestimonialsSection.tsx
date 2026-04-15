const testimonials = [
  {
    text: "Eu nunca conseguia manter rotina nenhuma. Com treinos curtos, ficou muito mais fácil começar sem sentir que eu precisava reorganizar o meu dia inteiro.",
    name: "Mariana S.",
    role: "Rotina de trabalho intensa",
  },
  {
    text: "O que mais gostei foi a praticidade. Em vez de ficar perdida, eu abria o app e simplesmente fazia o que já estava organizado.",
    name: "Juliana R.",
    role: "Mãe e empreendedora",
  },
  {
    text: "A sensação de plano personalizado me fez continuar. Parecia que o SlimDay entendia que eu não tinha uma hora livre por dia.",
    name: "Camila T.",
    role: "Agenda corrida e pouco tempo",
  },
];

const TestimonialsSection = () => (
  <section className="py-8 md:py-10">
    <div className="container">
      <div className="text-center max-w-3xl mx-auto mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-primary-soft text-primary font-bold text-sm border border-primary/15 mb-3">
          Histórias que inspiram
        </div>
        <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-secondary leading-none mb-3">
          Mulheres que buscavam mais praticidade se identificaram com a SlimDay
        </h2>
        <p className="text-muted-foreground text-lg leading-relaxed">
          Relatos que mostram como uma proposta mais leve e organizada pode facilitar o início da rotina.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {testimonials.map((t) => (
          <div key={t.name} className="p-6 rounded-3xl bg-gradient-to-b from-card to-background border border-border shadow-card">
            <div className="text-amber-400 mb-3 tracking-widest">★★★★★</div>
            <p className="text-secondary leading-relaxed mb-4">"{t.text}"</p>
            <strong className="text-secondary">{t.name}</strong>
            <span className="block text-sm text-muted-foreground mt-1">{t.role}</span>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default TestimonialsSection;
