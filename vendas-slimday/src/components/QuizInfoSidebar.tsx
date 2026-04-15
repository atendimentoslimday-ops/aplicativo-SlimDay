import { Button } from "@/components/ui/button";

const CHECKOUT_URL = "https://pay.kirvano.com/e4ad9a8c-bee4-4279-be20-8f39c46c17df";

const QuizInfoSidebar = () => {
  const goCheckout = () => {
    window.open(CHECKOUT_URL, "_blank");
  };

  return (
    <div className="bg-card border border-border rounded-3xl shadow-card p-6 md:p-7">
      <div className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-primary-soft text-primary font-bold text-sm border border-primary/15 mb-4">
        Diagnóstico SlimDay
      </div>
      <h2 className="text-3xl md:text-[40px] font-extrabold leading-none tracking-tight text-secondary mb-3">
        Descubra o plano que mais combina com o seu momento
      </h2>
      <p className="text-slate-600 leading-relaxed mb-5">
        Em menos de 2 minutos, você descobre qual formato pode funcionar melhor para a sua rotina, o seu objetivo e o tempo que você realmente tem disponível.
      </p>

      <div className="grid gap-3 mb-5">
        {[
          "✨ Veja uma recomendação mais alinhada ao seu perfil.",
          "⏱️ Entenda como encaixar treinos curtos no seu dia.",
        ].map((item) => (
          <div key={item} className="p-3.5 rounded-2xl bg-muted border border-border font-semibold text-secondary leading-relaxed text-sm">
            {item}
          </div>
        ))}
      </div>

      {/* Side Offer */}
      <div className="p-5 rounded-2xl bg-gradient-to-b from-accent/5 to-card border border-accent/20 shadow-cta/30">
        <span className="inline-flex px-3 py-1.5 rounded-full bg-accent/10 text-accent font-extrabold text-xs uppercase tracking-wider">
          Oferta disponível hoje
        </span>
        <h3 className="text-2xl font-extrabold text-secondary tracking-tight mt-3 mb-2">
          Comece hoje com um valor mais leve
        </h3>
        <p className="text-muted-foreground text-sm leading-relaxed mb-3">
          Uma condição pensada para facilitar sua entrada no SlimDay.
        </p>
        <div className="flex items-end gap-3 mb-3 flex-wrap">
          <span className="text-slate-400 text-xl font-extrabold line-through leading-none">R$ 89,90</span>
          <span className="text-4xl font-black text-slate-900 tracking-tighter leading-none">R$ 29,90</span>
        </div>
        <div className="grid gap-2.5 mb-4">
          {["Acesso à experiência SlimDay.", "Treinos curtos para rotina corrida.", "Começo simples, direto e prático."].map((item) => (
            <div key={item} className="flex gap-2.5 items-start text-secondary font-semibold text-sm leading-relaxed">
              <span>✔️</span><div>{item}</div>
            </div>
          ))}
        </div>
        <Button variant="cta" onClick={goCheckout} className="w-full rounded-xl">
          Garantir meu acesso agora
        </Button>
        <p className="text-xs text-muted-foreground mt-3">
          Aproveite o valor atual para começar com mais leveza e praticidade.
        </p>
      </div>

      <p className="text-xs text-muted-foreground mt-4 leading-relaxed">
        A personalização é comercial e educativa. Para orientações clínicas, consulte um profissional de saúde.
      </p>
    </div>
  );
};

export default QuizInfoSidebar;
