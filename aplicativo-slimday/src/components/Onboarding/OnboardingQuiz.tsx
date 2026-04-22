import React, { useState, useEffect } from "react";
import { 
  Sparkles, 
  Dumbbell, 
  Utensils, 
  CalendarDays, 
  ChevronRight, 
  User, 
  Target, 
  BarChart3, 
  Clock3, 
  Flame, 
  Salad, 
  BadgeCheck, 
  Star,
  CheckCircle2,
  TrendingUp,
  Brain
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Profile, 
  OnboardingStep, 
  Goal, 
  FitnessLevel, 
  TimePerDay, 
  RoutineStyle, 
  MealStyle 
} from "../../types/slimday";
import { APP_SALES_LINK } from "../../constants/slimdayData";

const ONBOARDING_STEPS: OnboardingStep[] = ["intro", "nome", "medidas_calendario", "objetivo", "nivel", "tempo", "rotina", "refeicao", "done", "oferta"];

interface OnboardingQuizProps {
  profile: Profile;
  onUpdateProfile: <K extends keyof Profile>(key: K, value: Profile[K]) => void;
  onComplete: () => void;
}

export function OnboardingQuiz({
  profile,
  onUpdateProfile,
  onComplete,
}: OnboardingQuizProps) {
  const [step, setStep] = useState<OnboardingStep>("intro");
  const currentIndex = ONBOARDING_STEPS.indexOf(step);
  const progress = Math.round(((currentIndex) / (ONBOARDING_STEPS.length - 1)) * 100);

  // Auto-advance for "done" state (analyzing journey)
  useEffect(() => {
    if (step === "done") {
      const timer = setTimeout(() => {
        setStep("oferta");
      }, 3000); // 3 segundos de "análise"
      return () => clearTimeout(timer);
    }
  }, [step]);

  function next() {
    const nextIndex = currentIndex + 1;
    if (nextIndex < ONBOARDING_STEPS.length) {
      setStep(ONBOARDING_STEPS[nextIndex]);
    } else {
      onComplete();
    }
  }

  function back() {
    if (currentIndex > 0) {
      setStep(ONBOARDING_STEPS[currentIndex - 1]);
    }
  }

  return (
    <div className="px-3 py-6 md:p-8 w-full">
      <div className="mx-auto max-w-xl">
        <div className="mb-10 text-center">
          <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden mb-4">
            <motion.div
              className="h-full rounded-full bg-rose-500"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.6, ease: "circOut" }}
            />
          </div>
          <p className="text-[10px] uppercase tracking-[2px] font-bold text-slate-400">Personalizando sua jornada</p>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4 }}
          >
            {step === "intro" && (
              <Card className="rounded-[40px] border-none shadow-2xl overflow-hidden bg-white">
                <div className="bg-slate-900 p-10 text-white text-center relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/20 blur-3xl rounded-full -mr-16 -mt-16" />
                  <div className="relative z-10">
                    <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-3xl bg-white/10 backdrop-blur-md border border-white/20">
                      <Sparkles className="h-8 w-8 text-rose-500" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-serif italic mb-3">Bem-vinda ao SlimDay</h1>
                    <p className="text-slate-300 text-sm font-light leading-relaxed max-w-xs mx-auto">
                      Vamos criar juntas um plano que respeita seu tempo e seu corpo.
                    </p>
                  </div>
                </div>
                <CardContent className="p-10 space-y-6">
                  <div className="space-y-4">
                    {[
                      { icon: <Dumbbell />, title: "Treinos Inteligentes", desc: "10 a 20 min que realmente funcionam.", color: "bg-emerald-50 text-emerald-600" },
                      { icon: <Utensils />, title: "Menu Prático", desc: "Receitas que cabem na sua rotina real.", color: "bg-rose-50 text-rose-600" },
                      { icon: <CalendarDays />, title: "Ciclo+", desc: "Acompanhamento hormonal exclusivo.", color: "bg-violet-50 text-violet-600" },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-5 p-4 rounded-3xl hover:bg-slate-50 transition-colors">
                        <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 ${item.color}`}>
                          {React.cloneElement(item.icon as React.ReactElement, { className: "h-6 w-6" })}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-sm">{item.title}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button className="w-full h-16 rounded-2xl text-lg font-bold bg-slate-900 hover:bg-black group transition-all" onClick={next}>
                    Começar minha jornada <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            )}

            {step === "nome" && (
              <Card className="rounded-[40px] border-none shadow-2xl p-10 bg-white">
                <CardContent className="p-0 space-y-8 text-center">
                  <div className="mx-auto h-16 w-16 rounded-3xl bg-violet-50 text-violet-500 flex items-center justify-center mb-6">
                    <User className="h-8 w-8" />
                  </div>
                  <h2 className="text-3xl font-serif">Como podemos te chamar?</h2>
                  <Input
                    value={profile.nome}
                    onChange={(e) => onUpdateProfile("nome", e.target.value)}
                    placeholder="Seu nome..."
                    className="h-16 rounded-2xl text-center text-xl font-medium border-slate-100 bg-slate-50/50"
                    autoFocus
                  />
                  <div className="flex gap-4">
                    <Button variant="ghost" className="h-16 px-8 rounded-2xl text-slate-400 font-bold" onClick={back}>Voltar</Button>
                    <Button className="flex-1 h-16 rounded-2xl bg-slate-900 hover:bg-black font-bold" onClick={next} disabled={!profile.nome.trim()}>
                      Continuar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {step === "medidas_calendario" && (
              <Card className="rounded-[40px] border-none shadow-2xl p-10 bg-white">
                <CardContent className="p-0 space-y-8">
                  <div className="text-center">
                    <div className="mx-auto h-16 w-16 rounded-3xl bg-rose-50 text-rose-500 flex items-center justify-center mb-6"><CalendarDays className="h-8 w-8" /></div>
                    <h2 className="text-3xl font-serif">Seu corpo, seu ritmo</h2>
                  </div>
                  <div className="grid gap-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-xs font-bold text-slate-400 ml-1">IDADE</Label>
                        <Input type="number" value={profile.idade} onChange={(e) => onUpdateProfile("idade", e.target.value)} className="h-14 rounded-2xl border-slate-100 bg-slate-50/50" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-bold text-slate-400 ml-1">PESO (KG)</Label>
                        <Input type="number" step="0.1" value={profile.peso} onChange={(e) => onUpdateProfile("peso", e.target.value)} className="h-14 rounded-2xl border-slate-100 bg-slate-50/50" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-slate-400 ml-1">ÚLTIMA MENSTRUAÇÃO</Label>
                      <Input type="date" value={profile.ultimoCiclo || ""} onChange={(e) => onUpdateProfile("ultimoCiclo", e.target.value)} className="h-14 rounded-2xl border-slate-100 bg-slate-50/50" />
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <Button variant="ghost" className="h-14 px-6 rounded-2xl text-slate-400" onClick={back}>Voltar</Button>
                    <Button className="flex-1 h-14 rounded-2xl bg-slate-900 hover:bg-black font-bold" onClick={next} disabled={!profile.idade || !profile.peso || !profile.ultimoCiclo}>
                      Continuar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {step === "objetivo" && (
              <Card className="rounded-[40px] border-none shadow-2xl p-10 bg-white">
                <CardContent className="p-0 space-y-8">
                  <h2 className="text-3xl font-serif text-center">Qual seu objetivo principal?</h2>
                  <div className="grid gap-3">
                    {([["emagrecer", "🔥 Emagrecer"], ["definir", "💪 Definir"], ["mais energia", "⚡ Mais energia"], ["ganhar_massa", "📈 Ganhar Massa"]] as [Goal, string][]).map(([val, label]) => (
                      <button key={val} onClick={() => { onUpdateProfile("objetivo", val); next(); }} className={`p-6 rounded-3xl border-2 text-left transition-all ${profile.objetivo === val ? "border-rose-500 bg-rose-50" : "border-slate-100 hover:border-rose-200"}`}>
                        <p className="font-bold text-slate-900">{label}</p>
                      </button>
                    ))}
                  </div>
                  <Button variant="ghost" className="w-full h-12 rounded-2xl text-slate-400" onClick={back}>Voltar</Button>
                </CardContent>
              </Card>
            )}

            {(step === "nivel" || step === "tempo" || step === "rotina" || step === "refeicao") && (
              <Card className="rounded-[40px] border-none shadow-2xl p-10 bg-white text-center">
                <CardContent className="p-0 space-y-8">
                  <div className="mx-auto h-16 w-16 rounded-3xl bg-rose-50 text-rose-600 flex items-center justify-center mb-6">
                    {step === "nivel" && <BarChart3 className="h-8 w-8" />}
                    {step === "tempo" && <Clock3 className="h-8 w-8" />}
                    {step === "rotina" && <Flame className="h-8 w-8" />}
                    {step === "refeicao" && <Salad className="h-8 w-8" />}
                  </div>
                  <h2 className="text-3xl font-serif italic">
                    {step === "nivel" && "Seu nível de treino?"}
                    {step === "tempo" && "Tempo disponível por dia?"}
                    {step === "rotina" && "Estilo de rotina?"}
                    {step === "refeicao" && "Preferência de refeição?"}
                  </h2>
                  <div className="grid gap-3">
                    {/* Render choices based on step */}
                    {step === "nivel" && (["iniciante", "intermediaria", "avancada"] as FitnessLevel[]).map(val => (
                      <button key={val} onClick={() => { onUpdateProfile("nivel", val); next(); }} className="p-5 rounded-2xl border-2 border-slate-100 hover:border-rose-400 capitalize font-bold">{val}</button>
                    ))}
                    {step === "tempo" && (["10", "15", "20"] as TimePerDay[]).map(val => (
                      <button key={val} onClick={() => { onUpdateProfile("tempo", val); next(); }} className="p-5 rounded-2xl border-2 border-slate-100 hover:border-rose-400 font-bold">{val} Minutos</button>
                    ))}
                    {step === "rotina" && (["corrida", "foco_abdominal", "corpo_todo"] as RoutineStyle[]).map(val => (
                      <button key={val} onClick={() => { onUpdateProfile("rotina", val); next(); }} className="p-5 rounded-2xl border-2 border-slate-100 hover:border-rose-400 capitalize font-bold">{val.replace("_", " ")}</button>
                    ))}
                    {step === "refeicao" && (["pratico", "equilibrado", "sem tempo", "caseiro"] as MealStyle[]).map(val => (
                      <button key={val} onClick={() => { onUpdateProfile("refeicao", val); next(); }} className="p-5 rounded-2xl border-2 border-slate-100 hover:border-rose-400 capitalize font-bold">{val}</button>
                    ))}
                  </div>
                  <Button variant="ghost" className="w-full text-slate-400" onClick={back}>Voltar</Button>
                </CardContent>
              </Card>
            )}

            {step === "done" && (
              <Card className="rounded-[40px] border-none shadow-2xl p-16 bg-white text-center">
                <div className="space-y-8">
                  <div className="mx-auto h-24 w-24 rounded-full bg-rose-50 flex items-center justify-center animate-bounce">
                    <Brain className="h-12 w-12 text-rose-500" />
                  </div>
                  <h2 className="text-3xl font-serif italic">Analisando seu perfil...</h2>
                  <p className="text-slate-500 max-w-xs mx-auto">Estamos ajustando os treinos e o menu para o seu objetivo de {profile.objetivo}.</p>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-emerald-600 font-bold justify-center"><CheckCircle2 className="h-5 w-5" /> Perfil Bio-Identificado</div>
                    <div className="flex items-center gap-3 text-emerald-600 font-bold justify-center"><CheckCircle2 className="h-5 w-5" /> Ciclo Hormonal Mapeado</div>
                  </div>
                </div>
              </Card>
            )}

            {step === "oferta" && (
              <Card className="rounded-[40px] border-none shadow-2xl overflow-hidden bg-white">
                <div className="bg-rose-500 p-10 text-white text-center">
                  <BadgeCheck className="h-12 w-12 mx-auto mb-4" />
                  <h2 className="text-3xl font-serif italic mb-2">Seu Plano está Pronto!</h2>
                  <p className="text-rose-100 text-sm">Criamos algo único para {profile.nome}.</p>
                </div>
                <CardContent className="p-10 space-y-6 text-center">
                  <div className="bg-slate-50 rounded-3xl p-6 space-y-4">
                    <div className="flex justify-between items-center"><span className="text-sm text-slate-500">Intensidade</span><span className="font-bold capitalize">{profile.nivel}</span></div>
                    <div className="flex justify-between items-center"><span className="text-sm text-slate-500">Frequência</span><span className="font-bold">Diária</span></div>
                    <div className="flex justify-between items-center"><span className="text-sm text-slate-500">Foco Nutricional</span><span className="font-bold capitalize font-serif italic">{profile.refeicao}</span></div>
                  </div>
                  <div className="space-y-4 pt-4">
                    <Button className="w-full h-16 rounded-2xl bg-slate-900 hover:bg-black font-bold text-lg" onClick={onComplete}>Acessar Meu Painel Agora</Button>
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest">Acesso Vitalício Liberado</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
