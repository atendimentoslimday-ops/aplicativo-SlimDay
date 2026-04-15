import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";

type QuestionType = {
  key: string;
  type: "options" | "input";
  title: string;
  options?: string[];
  label?: string;
  placeholder?: string;
};

const questions: QuestionType[] = [
  { key: "age", type: "options", title: "Qual sua idade?", options: ["18 a 24 anos", "25 a 34 anos", "35 a 44 anos", "45 anos ou mais"] },
  { key: "height", type: "input", title: "Qual sua altura?", label: "Altura em cm", placeholder: "Ex: 165" },
  { key: "weight", type: "input", title: "Qual seu peso atual?", label: "Peso em kg", placeholder: "Ex: 72" },
  { key: "goal", type: "options", title: "Qual seu principal objetivo hoje?", options: ["Perder peso", "Afinar a barriga", "Ter mais energia", "Criar constância"] },
  { key: "time", type: "options", title: "Quanto tempo você realmente tem por dia?", options: ["Menos de 15 minutos", "15 a 30 minutos", "Quase nenhum tempo", "Meu dia varia bastante"] },
  { key: "difficulty", type: "options", title: "Qual sua maior dificuldade para emagrecer?", options: ["Falta de tempo", "Falta de motivação", "Não saber o que fazer", "Já tentei várias vezes e parei"] },
  { key: "experience", type: "options", title: "Você já tentou seguir algum plano antes?", options: ["Sim, mas não consegui manter", "Sim, tive dificuldade de organizar", "Sim, mas achei complicado", "Ainda não, quero começar agora"] },
  { key: "commitment", type: "options", title: "Se existisse um plano simples para a sua rotina, você toparia começar?", options: ["Sim, quero algo prático", "Sim, desde que seja rápido", "Talvez, preciso de algo fácil", "Sim, quero me sentir melhor logo"] },
];

const CHECKOUT_URL = "https://pay.kirvano.com/e4ad9a8c-bee4-4279-be20-8f39c46c17df";

const processingSteps = [
  "Calculando seu perfil de rotina e disponibilidade diária...",
  "Ajustando a recomendação para a sua fase atual...",
  "Priorizando o formato com maior chance de adesão...",
  "Preparando sua sugestão SlimDay personalizada...",
];

function getProfileData(answers: Record<string, string>) {
  const weight = parseFloat(answers.weight || "0");
  const heightCm = parseFloat(answers.height || "0");
  const heightM = heightCm / 100;
  const bmi = weight > 0 && heightM > 0 ? (weight / (heightM * heightM)) : null;

  let profile = "Rotina corrida";
  let focus = "Consistência e praticidade";

  if ((answers.time || "").includes("Menos de 15") || (answers.difficulty || "").includes("Falta de tempo")) {
    profile = "Mulher com pouco tempo";
    focus = "Treinos curtos e encaixe real";
  } else if ((answers.difficulty || "").includes("motivação")) {
    profile = "Precisa de estímulo e simplicidade";
    focus = "Facilidade de começar";
  } else if ((answers.experience || "").includes("complicado")) {
    profile = "Busca algo mais leve";
    focus = "Menos complexidade";
  }

  return { bmi, profile, focus };
}

function saveLead(name: string, phone: string, email: string, answers: Record<string, string>) {
  try {
    const leads = JSON.parse(localStorage.getItem("slimday_leads") || "[]");
    leads.push({
      name,
      phone,
      email,
      answers,
      timestamp: new Date().toISOString(),
    });
    localStorage.setItem("slimday_leads", JSON.stringify(leads));
  } catch {
    // silently fail
  }
}

type Step = "quiz" | "processing" | "result" | "lead";

const QuizSection = () => {
  const [step, setStep] = useState<Step>("quiz");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [inputValue, setInputValue] = useState("");
  const [processingProgress, setProcessingProgress] = useState(0);
  const [activeProcessingStep, setActiveProcessingStep] = useState(-1);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [leadErrors, setLeadErrors] = useState<{ name?: string; phone?: string; email?: string }>({});

  const q = questions[currentQuestion];
  const progress = Math.round(((currentQuestion + 1) / questions.length) * 100);

  const selectOption = useCallback((value: string) => {
    setAnswers((prev) => ({ ...prev, [q.key]: value }));
  }, [q.key]);

  const handleNext = useCallback(() => {
    if (q.type === "options" && !answers[q.key]) return;
    if (q.type === "input") {
      if (!inputValue.trim()) return;
      setAnswers((prev) => ({ ...prev, [q.key]: inputValue.trim() }));
    }

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((i) => i + 1);
      setInputValue(answers[questions[currentQuestion + 1]?.key] || "");
    } else {
      startProcessing();
    }
  }, [q, answers, inputValue, currentQuestion]);

  const handleBack = useCallback(() => {
    if (currentQuestion > 0) {
      setCurrentQuestion((i) => i - 1);
      setInputValue(answers[questions[currentQuestion - 1]?.key] || "");
    }
  }, [currentQuestion, answers]);

  const startProcessing = () => {
    setStep("processing");
    setProcessingProgress(0);
    setActiveProcessingStep(-1);
  };

  useEffect(() => {
    if (step !== "processing") return;
    const interval = setInterval(() => {
      setProcessingProgress((prev) => {
        const next = prev + 5;
        if (next >= 15 && activeProcessingStep < 0) setActiveProcessingStep(0);
        if (next >= 40 && activeProcessingStep < 1) setActiveProcessingStep(1);
        if (next >= 65 && activeProcessingStep < 2) setActiveProcessingStep(2);
        if (next >= 85 && activeProcessingStep < 3) setActiveProcessingStep(3);
        if (next >= 100) {
          clearInterval(interval);
          setTimeout(() => setStep("result"), 450);
        }
        return Math.min(next, 100);
      });
    }, 120);
    return () => clearInterval(interval);
  }, [step, activeProcessingStep]);

  const validateAndGoCheckout = () => {
    const errors: { name?: string; phone?: string; email?: string } = {};

    if (!name.trim()) errors.name = "Digite seu nome";
    if (!phone.trim()) errors.phone = "Digite seu WhatsApp";
    if (!email.trim()) {
      errors.email = "Digite seu e-mail";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = "E-mail inválido";
    }

    setLeadErrors(errors);

    if (Object.keys(errors).length > 0) return;

    saveLead(name.trim(), phone.trim(), email.trim(), answers);
    window.open(CHECKOUT_URL, "_blank");
  };

  const { bmi, profile, focus } = getProfileData(answers);

  return (
    <div className="w-full">
      {/* Quiz Card */}
      {step === "quiz" && (
        <div className="bg-card rounded-3xl border border-border shadow-card p-6 md:p-8 animate-fade-in-up">
          <div className="flex justify-between items-center text-sm font-bold text-muted-foreground mb-3">
            <span>Pergunta {currentQuestion + 1} de {questions.length}</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-3 mb-6" />

          <h3 className="text-2xl md:text-[28px] font-extrabold text-secondary leading-tight tracking-tight mb-5">
            {q.title}
          </h3>

          {q.type === "options" && (
            <div className="grid gap-3">
              {q.options!.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => selectOption(option)}
                  className={`w-full text-left font-bold text-base p-4 rounded-2xl border transition-all duration-200
                    ${answers[q.key] === option
                      ? "border-primary/40 bg-gradient-to-b from-card to-primary-soft shadow-md -translate-y-0.5"
                      : "border-border bg-card hover:border-primary/30 hover:-translate-y-0.5 hover:shadow-sm"
                    }`}
                >
                  {option}
                </button>
              ))}
            </div>
          )}

          {q.type === "input" && (
            <div>
              <label className="text-sm font-extrabold text-secondary mb-2 block">{q.label}</label>
              <Input
                type="number"
                inputMode="decimal"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={q.placeholder}
                className="rounded-xl text-base py-4 h-auto"
                onKeyDown={(e) => e.key === "Enter" && handleNext()}
              />
            </div>
          )}

          <div className="flex justify-between gap-3 mt-6 flex-wrap">
            <Button
              variant="outline"
              onClick={handleBack}
              className={`rounded-xl font-bold ${currentQuestion === 0 ? "invisible" : ""}`}
            >
              Voltar
            </Button>
            <Button variant="cta" onClick={handleNext} className="rounded-xl">
              Continuar
            </Button>
          </div>
        </div>
      )}

      {/* Processing */}
      {step === "processing" && (
        <div className="bg-card rounded-3xl border border-border shadow-card p-6 md:p-8 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-primary-soft text-primary font-bold text-sm border border-primary/15 mb-4">
            ✨ Análise em andamento
          </div>
          <h3 className="text-2xl md:text-[32px] font-extrabold text-secondary leading-tight tracking-tight mb-2">
            Estamos montando sua recomendação SlimDay
          </h3>
          <p className="text-muted-foreground leading-relaxed mb-5">
            Estamos analisando suas respostas para mostrar a recomendação mais alinhada ao seu perfil.
          </p>
          <Progress value={processingProgress} className="h-3 mb-5" />
          <div className="grid gap-3">
            {processingSteps.map((text, i) => (
              <div
                key={i}
                className={`p-4 rounded-xl border font-bold transition-all duration-300 ${
                  i <= activeProcessingStep
                    ? "opacity-100 translate-x-1 bg-primary-soft border-primary/20 text-secondary"
                    : "opacity-40 bg-muted border-border text-muted-foreground"
                }`}
              >
                {text}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Result */}
      {step === "result" && (
        <div className="bg-card rounded-3xl border border-border shadow-card p-6 md:p-8 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-primary-soft text-primary font-bold text-sm border border-primary/15 mb-4">
            ✨ Seu perfil inicial
          </div>
          <h3 className="text-2xl md:text-[34px] font-extrabold text-secondary leading-tight tracking-tight mb-2">
            Seu plano aponta para um formato mais simples, curto e consistente
          </h3>
          <p className="text-muted-foreground leading-relaxed mb-5">
            Pelas suas respostas, você tende a se beneficiar mais de uma rotina curta, objetiva e fácil de seguir.
            {bmi && ` Com base nos dados informados, seu IMC estimado fica em ${bmi.toFixed(1)}.`}
            {" "}Isso não substitui avaliação profissional, mas ajuda a criar uma experiência inicial mais relevante.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
            <div className="p-4 rounded-2xl bg-primary-soft border border-primary/15">
              <span className="text-xs font-bold text-muted-foreground block mb-1">Perfil identificado</span>
              <strong className="text-secondary text-lg">{profile}</strong>
            </div>
            <div className="p-4 rounded-2xl bg-primary-soft border border-primary/15">
              <span className="text-xs font-bold text-muted-foreground block mb-1">Formato sugerido</span>
              <strong className="text-secondary text-lg">Treinos de 10 a 15 min</strong>
            </div>
            <div className="p-4 rounded-2xl bg-primary-soft border border-primary/15">
              <span className="text-xs font-bold text-muted-foreground block mb-1">Ponto de foco</span>
              <strong className="text-secondary text-lg">{focus}</strong>
            </div>
          </div>

          <div className="rounded-2xl bg-secondary p-5 mb-5">
            <h4 className="text-lg font-bold text-secondary-foreground mb-2">O que torna a SlimDay diferente</h4>
            <p className="text-secondary-foreground/90 leading-relaxed text-sm">
              Em vez de sobrecarregar com rotinas longas, o app organiza treinos rápidos, orientação clara e uma progressão simples.
            </p>
          </div>

          {/* Preço visível antes do lead */}
          <div className="rounded-2xl border border-primary/20 bg-primary-soft p-4 mb-5 flex items-center justify-between flex-wrap gap-3">
            <div>
              <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Acesso completo ao SlimDay</div>
              <div className="mt-1 text-2xl font-black text-secondary">R$ 29,90 <span className="text-sm font-normal line-through text-muted-foreground">R$ 89,90</span></div>
              <div className="text-xs text-muted-foreground mt-0.5">Pagamento único · Sem mensalidade</div>
            </div>
            <div className="text-sm font-bold text-primary">🔒 Oferta por tempo limitado</div>
          </div>

          <Button variant="cta" onClick={() => setStep("lead")} className="w-full rounded-xl">
            Quero desbloquear meu resultado completo
          </Button>
        </div>
      )}

      {/* Lead Capture */}
      {step === "lead" && (
        <div className="bg-card rounded-3xl border border-border shadow-card p-6 md:p-8 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-primary-soft text-primary font-bold text-sm border border-primary/15 mb-4">
            ✨ Salvar resultado
          </div>
          <h3 className="text-2xl md:text-[32px] font-extrabold text-secondary leading-tight tracking-tight mb-2">
            Receba seu plano completo e condições especiais
          </h3>
          <p className="text-muted-foreground leading-relaxed mb-5">
            Preencha seus dados para salvar sua recomendação e seguir para o acesso por <strong>R$ 29,90</strong>.
          </p>
          <div className="grid gap-4">
            <div>
              <label className="text-sm font-extrabold text-secondary mb-2 block">Seu primeiro nome *</label>
              <Input
                value={name}
                onChange={(e) => { setName(e.target.value); setLeadErrors((p) => ({ ...p, name: undefined })); }}
                placeholder="Digite seu nome"
                className={`rounded-xl text-base py-4 h-auto ${leadErrors.name ? "border-red-400 focus-visible:ring-red-400" : ""}`}
              />
              {leadErrors.name && <p className="text-red-500 text-xs mt-1">{leadErrors.name}</p>}
            </div>
            <div>
              <label className="text-sm font-extrabold text-secondary mb-2 block">WhatsApp *</label>
              <Input
                value={phone}
                onChange={(e) => { setPhone(e.target.value); setLeadErrors((p) => ({ ...p, phone: undefined })); }}
                placeholder="(31) 99879-8876"
                type="tel"
                className={`rounded-xl text-base py-4 h-auto ${leadErrors.phone ? "border-red-400 focus-visible:ring-red-400" : ""}`}
              />
              {leadErrors.phone && <p className="text-red-500 text-xs mt-1">{leadErrors.phone}</p>}
            </div>
            <div>
              <label className="text-sm font-extrabold text-secondary mb-2 block">E-mail *</label>
              <Input
                value={email}
                onChange={(e) => { setEmail(e.target.value); setLeadErrors((p) => ({ ...p, email: undefined })); }}
                placeholder="voce@email.com"
                type="email"
                className={`rounded-xl text-base py-4 h-auto ${leadErrors.email ? "border-red-400 focus-visible:ring-red-400" : ""}`}
              />
              {leadErrors.email && <p className="text-red-500 text-xs mt-1">{leadErrors.email}</p>}
            </div>
            <Button variant="cta" onClick={validateAndGoCheckout} className="w-full rounded-xl">
              Ir para o checkout · R$ 29,90
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            Seus dados são usados apenas para enviar sua recomendação e informações de acesso. Não compartilhamos com terceiros.
          </p>
        </div>
      )}
    </div>
  );
};

export default QuizSection;
