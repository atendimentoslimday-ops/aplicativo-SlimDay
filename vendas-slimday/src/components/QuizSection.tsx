import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ChevronRight, CheckCircle2, ShieldCheck, Mail, Phone, User } from "lucide-react";

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
  { key: "height", type: "input", title: "Qual sua altura?", label: "Sua altura (cm)", placeholder: "Ex: 165" },
  { key: "weight", type: "input", title: "Qual seu peso atual?", label: "Seu peso (kg)", placeholder: "Ex: 72" },
  { key: "goal", type: "options", title: "Qual seu principal objetivo hoje?", options: ["Perder peso", "Afinar a barriga", "Ter mais energia", "Criar constância"] },
  { key: "time", type: "options", title: "Quanto tempo você realmente tem por dia?", options: ["Menos de 15 minutos", "15 a 30 minutos", "Quase nenhum tempo", "Meu dia varia bastante"] },
  { key: "difficulty", type: "options", title: "Qual sua maior dificuldade para emagrecer?", options: ["Falta de tempo", "Falta de motivação", "Não saber o que fazer", "Já tentei várias vezes e parei"] },
  { key: "experience", type: "options", title: "Você já tentou seguir algum plano antes?", options: ["Sim, mas não consegui manter", "Sim, tive dificuldade de organizar", "Sim, mas achei complicado", "Ainda não, quero começar agora"] },
  { key: "commitment", type: "options", title: "Se existisse um plano simples, você começaria?", options: ["Sim, quero algo prático", "Sim, desde que seja rápido", "Talvez, preciso de algo fácil", "Sim, quero me sentir melhor logo"] },
];

const CHECKOUT_URL = "https://pay.kirvano.com/e4ad9a8c-bee4-4279-be20-8f39c46c17df";

const processingSteps = [
  "Calculando seu perfil de rotina e disponibilidade...",
  "Ajustando a recomendação para a sua fase atual...",
  "Priorizando o formato com maior chance de adesão...",
  "Preparando seu acesso SlimDay Elite...",
];

function getProfileData(answers: Record<string, string>) {
  const weight = parseFloat(answers.weight || "0");
  const heightCm = parseFloat(answers.height || "0");
  const heightM = heightCm / 100;
  const bmi = weight > 0 && heightM > 0 ? (weight / (heightM * heightM)) : null;

  let profile = "Rotina corrida";
  let focus = "Consistência e praticidade";

  if ((answers.time || "").includes("Menos de 15") || (answers.difficulty || "").includes("Falta de tempo")) {
    profile = "Foco em Praticidade";
    focus = "Treinos curtos e encaixe real";
  } else if ((answers.difficulty || "").includes("motivação")) {
    profile = "Necessidade de Estímulo";
    focus = "Facilidade de começar";
  } else if ((answers.experience || "").includes("complicado")) {
    profile = "Simplificação Máxima";
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
    // Auto next after choice for smoother flow
    setTimeout(() => {
        handleNextDirect(value);
    }, 300);
  }, [q.key, currentQuestion]);

  const handleNextDirect = (val: string) => {
    if (currentQuestion < questions.length - 1) {
        setCurrentQuestion((i) => i + 1);
        setInputValue(answers[questions[currentQuestion + 1]?.key] || "");
    } else {
        startProcessing();
    }
  };

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
    <div
      className="w-full py-16 md:py-24 px-4 relative overflow-hidden rounded-[2.5rem] shadow-xl"
      id="quiz-container"
      style={{
        background: "linear-gradient(160deg, #064e3b 0%, #065f46 35%, #047857 60%, #10b981 100%)",
      }}
    >
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-[120px] -ml-64 -mt-64 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-emerald-300/10 rounded-full blur-[100px] -mr-32 -mb-32 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(52,211,153,0.15),transparent_50%)] pointer-events-none" />

      <div className="max-w-2xl mx-auto relative z-10">
        {/* Section header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 border border-white/20 text-emerald-200 font-bold text-[10px] uppercase tracking-[3px] mb-6 backdrop-blur-md">
            <Sparkles className="h-3 w-3" /> Descubra seu perfil
          </div>
          <h2 className="text-4xl md:text-6xl font-serif text-white leading-tight mb-4">
            Seu plano <span className="italic text-emerald-300">personalizado</span><br />em 2 minutos
          </h2>
          <p className="text-emerald-100 text-lg font-light max-w-lg mx-auto leading-relaxed">
            Responda 8 perguntas rápidas e receba uma recomendação feita exclusivamente para a sua rotina.
          </p>
        </div>

        <AnimatePresence mode="wait">
          {step === "quiz" && (
            <motion.div
              key="quiz-card"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[40px] shadow-2xl p-8 md:p-12 border-0"
            >
              {/* Progress info */}
              <div className="flex justify-between items-center mb-4">
                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-[3px]">Passo {currentQuestion + 1} de {questions.length}</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[3px]">{progress}% Concluído</span>
              </div>
              {/* Progress bar */}
              <div className="h-2 w-full bg-emerald-50 rounded-full mb-10 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className="h-full rounded-full"
                  style={{ background: "linear-gradient(90deg, #059669, #10b981)" }}
                />
              </div>

              <h3 className="text-3xl md:text-5xl font-serif text-slate-900 leading-tight mb-8">
                {q.title}
              </h3>

              {q.type === "options" && (
                <div className="grid gap-3">
                  {q.options!.map((option, idx) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => selectOption(option)}
                      className={`w-full text-left font-bold text-base p-5 rounded-[20px] border-2 transition-all duration-300 group relative overflow-hidden
                        ${answers[q.key] === option
                          ? "border-emerald-500 bg-emerald-500 text-white shadow-lg shadow-emerald-200 -translate-y-0.5"
                          : "border-slate-100 bg-slate-50/50 hover:border-emerald-300 hover:bg-emerald-50 hover:-translate-y-0.5 text-slate-700"
                        }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`h-7 w-7 rounded-full border-2 flex items-center justify-center shrink-0 text-xs font-black transition-all ${answers[q.key] === option ? "border-white bg-white/20 text-white" : "border-slate-200 text-slate-400"}`}>
                          {String.fromCharCode(65 + idx)}
                        </div>
                        <span>{option}</span>
                        {answers[q.key] === option && (
                          <CheckCircle2 className="h-5 w-5 ml-auto text-white" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {q.type === "input" && (
                <div className="space-y-6">
                  <div>
                    <label className="text-[10px] font-bold text-emerald-600 uppercase tracking-[2px] mb-4 block">{q.label}</label>
                    <Input
                      type="number"
                      inputMode="decimal"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder={q.placeholder}
                      className="rounded-[20px] text-xl py-8 px-6 border-2 border-emerald-100 focus-visible:ring-emerald-400 focus-visible:border-emerald-400 h-auto transition-all"
                      onKeyDown={(e) => e.key === "Enter" && handleNext()}
                    />
                  </div>
                  <Button
                    onClick={handleNext}
                    className="w-full h-16 rounded-[20px] text-lg font-bold text-white"
                    style={{ background: "linear-gradient(135deg, #059669, #10b981)" }}
                  >
                    Continuar <ChevronRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              )}

              <div className="mt-8 flex justify-center">
                <button
                  onClick={handleBack}
                  className={`flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-300 hover:text-emerald-600 transition-colors ${currentQuestion === 0 ? "invisible" : ""}`}
                >
                  ← Voltar para anterior
                </button>
              </div>
            </motion.div>
          )}

          {step === "processing" && (
            <motion.div
              key="processing-card"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-[40px] shadow-2xl p-8 md:p-12 text-center"
            >
              <div className="h-20 w-20 rounded-[28px] mx-auto flex items-center justify-center mb-8 animate-bounce" style={{ background: "linear-gradient(135deg, #059669, #10b981)" }}>
                <Sparkles className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-3xl md:text-5xl font-serif text-slate-900 leading-tight mb-4">
                Criando sua{" "}
                <span className="italic" style={{ color: "#059669" }}>recomendação Elite</span>
              </h3>
              <p className="text-lg text-slate-500 font-light mb-10">
                Estamos processando seus dados para criar a melhor experiência possível.
              </p>

              <div className="h-3 w-full bg-emerald-50 rounded-full mb-10 overflow-hidden border border-emerald-100">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${processingProgress}%` }}
                  className="h-full rounded-full"
                  style={{ background: "linear-gradient(90deg, #059669, #34d399)" }}
                />
              </div>

              <div className="grid gap-3 text-left">
                {processingSteps.map((text, i) => (
                  <div
                    key={i}
                    className={`p-5 rounded-[20px] border-2 font-bold text-sm transition-all duration-500 flex items-center gap-4 ${
                      i <= activeProcessingStep
                        ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                        : "opacity-30 bg-white border-slate-100 text-slate-400"
                    }`}
                  >
                    <CheckCircle2 className={`h-5 w-5 shrink-0 ${i <= activeProcessingStep ? "text-emerald-500" : "text-slate-300"}`} />
                    {text}
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {step === "result" && (
            <motion.div
              key="result-card"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-[40px] shadow-2xl p-8 md:p-12"
            >
              <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full font-bold text-[10px] uppercase tracking-[3px] mb-8 shadow-sm text-white" style={{ background: "linear-gradient(135deg, #059669, #10b981)" }}>
                ✨ Plano de Elite Identificado
              </div>

              <h3 className="text-3xl md:text-5xl font-serif text-slate-900 leading-tight mb-6">
                Seu plano foca em{" "}
                <span className="italic" style={{ color: "#059669" }}>resultados rápidos</span>{" "}
                e consistentes
              </h3>

              <p className="text-lg text-slate-500 font-light leading-relaxed mb-10">
                Pelas suas respostas, você se beneficiará de uma rotina minimalista, com treinos de 15 minutos que protegem seu tempo e sua disposição.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
                <div className="p-6 rounded-[24px] border-2 border-emerald-200 bg-emerald-50">
                  <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest block mb-2">Perfil Elite</span>
                  <strong className="text-emerald-900 text-lg font-serif italic">{profile}</strong>
                </div>
                <div className="p-6 rounded-[24px] border-2 border-emerald-100 bg-emerald-50/50">
                  <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest block mb-2">Formato Recomendado</span>
                  <strong className="text-slate-900 text-lg font-serif italic">15 min / dia</strong>
                </div>
                <div className="p-6 rounded-[24px] border-2 border-emerald-100 bg-emerald-50/50">
                  <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest block mb-2">Destaque do Plano</span>
                  <strong className="text-slate-900 text-lg font-serif italic">{focus}</strong>
                </div>
              </div>

              <div className="rounded-[32px] p-8 mb-10 text-white relative overflow-hidden" style={{ background: "linear-gradient(135deg, #064e3b, #065f46)" }}>
                <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-400/20 blur-3xl rounded-full -mr-16 -mt-16" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-300/10 blur-2xl rounded-full -ml-8 -mb-8" />
                <h4 className="text-xl font-serif mb-3 flex items-center gap-3 relative z-10">
                  <ShieldCheck className="h-6 w-6 text-emerald-400" />
                  O Método SlimDay
                </h4>
                <p className="text-emerald-100 leading-relaxed text-sm font-light relative z-10">
                  Diferente de planos genéricos, sua recomendação elite prioriza a proteção do seu metabolismo através de treinos inteligentes e micro-hábitos funcionais.
                </p>
              </div>

              <div className="rounded-[28px] border-2 border-emerald-200 bg-emerald-50 p-6 mb-10 flex items-center justify-between flex-wrap gap-6">
                <div>
                  <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-[2px] mb-2">Acesso Completo · Oferta Única</div>
                  <div className="text-4xl font-serif text-slate-900 leading-none">
                    R$ 29,90 <span className="text-sm font-light line-through text-slate-400 ml-2">R$ 89,90</span>
                  </div>
                </div>
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-10 w-10 rounded-full border-2 border-white bg-emerald-200" />
                  ))}
                  <div className="h-10 w-10 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold text-white" style={{ background: "#059669" }}>+8K</div>
                </div>
              </div>

              <button
                onClick={() => setStep("lead")}
                className="w-full h-20 rounded-[28px] text-xl font-bold text-white transition-all active:scale-[0.98] shadow-xl shadow-emerald-900/30"
                style={{ background: "linear-gradient(135deg, #059669, #10b981)" }}
              >
                Ativar meu plano personalizado ✦
              </button>
            </motion.div>
          )}

          {step === "lead" && (
            <motion.div
              key="lead-card"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-[40px] shadow-2xl p-8 md:p-12"
            >
              <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full font-bold text-[10px] uppercase tracking-[3px] mb-8 shadow-sm text-white" style={{ background: "linear-gradient(135deg, #059669, #10b981)" }}>
                ✨ Recepção SlimDay Elite
              </div>
              <h3 className="text-3xl md:text-5xl font-serif text-slate-900 leading-tight mb-4">
                Pronta para{" "}
                <span className="italic" style={{ color: "#059669" }}>começar o seu dia 1?</span>
              </h3>
              <p className="text-lg text-slate-500 font-light leading-relaxed mb-10">
                Preencha seus dados para salvar sua recomendação personalizada e seguir para a página de ativação segura por <strong className="text-emerald-700">R$ 29,90</strong>.
              </p>

              <div className="grid gap-4">
                <div className="relative">
                  <User className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-emerald-400" />
                  <Input
                    value={name}
                    onChange={(e) => { setName(e.target.value); setLeadErrors((p) => ({ ...p, name: undefined })); }}
                    placeholder="Seu primeiro nome"
                    className={`rounded-[20px] text-base py-8 pl-14 pr-6 h-auto border-2 bg-slate-50/50 ${leadErrors.name ? "border-red-400 focus-visible:ring-red-400" : "border-emerald-100 focus-visible:ring-emerald-400 focus-visible:border-emerald-400"}`}
                  />
                </div>

                <div className="relative">
                  <Phone className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-emerald-400" />
                  <Input
                    value={phone}
                    onChange={(e) => { setPhone(e.target.value); setLeadErrors((p) => ({ ...p, phone: undefined })); }}
                    placeholder="WhatsApp"
                    type="tel"
                    className={`rounded-[20px] text-base py-8 pl-14 pr-6 h-auto border-2 bg-slate-50/50 ${leadErrors.phone ? "border-red-400 focus-visible:ring-red-400" : "border-emerald-100 focus-visible:ring-emerald-400 focus-visible:border-emerald-400"}`}
                  />
                </div>

                <div className="relative">
                  <Mail className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-emerald-400" />
                  <Input
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setLeadErrors((p) => ({ ...p, email: undefined })); }}
                    placeholder="E-mail principal"
                    type="email"
                    className={`rounded-[20px] text-base py-8 pl-14 pr-6 h-auto border-2 bg-slate-50/50 ${leadErrors.email ? "border-red-400 focus-visible:ring-red-400" : "border-emerald-100 focus-visible:ring-emerald-400 focus-visible:border-emerald-400"}`}
                  />
                </div>

                <button
                  onClick={validateAndGoCheckout}
                  className="w-full h-20 rounded-[24px] text-xl font-bold text-white mt-4 transition-all shadow-xl shadow-emerald-900/30 active:scale-[0.98]"
                  style={{ background: "linear-gradient(135deg, #059669, #10b981)" }}
                >
                  Finalizar Ativação · R$ 29,90
                </button>
              </div>

              <div className="mt-8 flex items-center justify-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                Ambiente 100% Seguro &amp; Protegido
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default QuizSection;
