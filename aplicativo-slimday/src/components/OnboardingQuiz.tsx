import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, Dumbbell, Utensils, CalendarDays, 
  ChevronRight, ArrowRight, User, Target, 
  BarChart3, Clock, Flame, Salad, BadgeCheck,
  Star
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Profile, Goal, FitnessLevel, TimePerDay, RoutineStyle, MealStyle } from "@/data/types";

type OnboardingStep = "intro" | "nome" | "medidas" | "objetivo" | "nivel" | "tempo" | "rotina" | "refeicao" | "done";

const STEPS: OnboardingStep[] = ["intro", "nome", "medidas", "objetivo", "nivel", "tempo", "rotina", "refeicao", "done"];

interface OnboardingQuizProps {
  profile: Profile;
  onUpdateProfile: <K extends keyof Profile>(key: K, value: Profile[K]) => void;
  onComplete: () => void;
}

export function OnboardingQuiz({ profile, onUpdateProfile, onComplete }: OnboardingQuizProps) {
  const [step, setStep] = useState<OnboardingStep>("intro");
  const currentIndex = STEPS.indexOf(step);
  const progress = Math.round(((currentIndex) / (STEPS.length - 1)) * 100);

  const next = () => {
    const nextIdx = currentIndex + 1;
    if (nextIdx < STEPS.length) setStep(STEPS[nextIdx]);
  };

  const back = () => {
    const prevIdx = currentIndex - 1;
    if (prevIdx >= 0) setStep(STEPS[prevIdx]);
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f3fff8_0%,#fffaf7_45%,#ffffff_100%)] p-4 md:p-8 flex items-center justify-center">
      <div className="w-full max-w-xl">
        <div className="mb-10 text-center">
          <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden mb-4">
            <motion.div
              className="h-full rounded-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.6 }}
            />
          </div>
          <p className="text-[10px] uppercase tracking-[2px] font-black text-slate-400">Personalizando seu plano</p>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            {step === "intro" && (
              <Card className="rounded-[40px] border-none shadow-premium overflow-hidden bg-white">
                <div className="bg-slate-900 p-10 text-white text-center relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-3xl rounded-full -mr-16 -mt-16" />
                  <div className="relative z-10 flex flex-col items-center">
                    <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-3xl bg-white/10 backdrop-blur-md border border-white/20">
                      <Sparkles className="h-8 w-8 text-primary" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-serif italic mb-3">Bem-vinda ao SlimDay</h1>
                    <p className="text-slate-400 text-sm font-light leading-relaxed max-w-xs mx-auto">
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
                  <Button className="w-full h-16 rounded-2xl text-lg font-bold bg-primary hover:bg-rose-700" onClick={next}>
                    Começar minha jornada <ChevronRight className="ml-2 h-5 w-5" />
                  </Button>
                </CardContent>
              </Card>
            )}

            {step === "nome" && (
              <Card className="rounded-[40px] border-none shadow-premium p-10 bg-white text-center">
                 <div className="mx-auto h-16 w-16 rounded-3xl bg-violet-50 text-violet-500 flex items-center justify-center mb-6">
                    <User className="h-8 w-8" />
                  </div>
                  <h2 className="text-3xl font-serif italic mb-2">Como podemos te chamar?</h2>
                  <p className="text-slate-500 font-light mb-8">Sua experiência será única e personalizada.</p>
                  <Input
                    value={profile.nome}
                    onChange={(e) => onUpdateProfile("nome", e.target.value)}
                    placeholder="Seu nome aqui..."
                    className="h-16 rounded-2xl text-center text-xl font-medium border-slate-100 bg-slate-50/50 mb-8"
                    autoFocus
                  />
                  <div className="flex gap-4">
                    <Button variant="ghost" className="h-16 px-8 rounded-2xl text-slate-400 font-bold" onClick={back}>Voltar</Button>
                    <Button className="flex-1 h-16 rounded-2xl bg-primary hover:bg-rose-700 font-bold" onClick={next} disabled={!profile.nome.trim()}>
                      Continuar
                    </Button>
                  </div>
              </Card>
            )}

            {step === "medidas" && (
               <Card className="rounded-[40px] border-none shadow-premium p-10 bg-white text-center">
                  <div className="mx-auto h-16 w-16 rounded-3xl bg-rose-50 text-rose-500 flex items-center justify-center mb-6">
                    <CalendarDays className="h-8 w-8" />
                  </div>
                  <h2 className="text-3xl font-serif italic mb-2">Seu corpo, seu ritmo</h2>
                  <p className="text-slate-500 font-light mb-8 text-sm">Dados essenciais para o seu calendário hormonal.</p>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="space-y-2 text-left">
                      <Label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Idade</Label>
                      <Input type="number" value={profile.idade} onChange={(e) => onUpdateProfile("idade", e.target.value)} placeholder="00" className="h-14 rounded-2xl bg-slate-50/50" />
                    </div>
                    <div className="space-y-2 text-left">
                      <Label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Peso (kg)</Label>
                      <Input type="number" step="0.1" value={profile.peso} onChange={(e) => onUpdateProfile("peso", e.target.value)} placeholder="00" className="h-14 rounded-2xl bg-slate-50/50" />
                    </div>
                  </div>
                  <div className="space-y-2 text-left mb-8">
                    <Label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Última Menstruação</Label>
                    <Input type="date" value={profile.ultimoCiclo || ""} onChange={(e) => onUpdateProfile("ultimoCiclo", e.target.value)} className="h-14 rounded-2xl bg-slate-50/50" />
                  </div>
                  <div className="flex gap-4">
                    <Button variant="ghost" className="h-14 px-6 rounded-2xl text-slate-400" onClick={back}>Voltar</Button>
                    <Button className="flex-1 h-14 rounded-2xl bg-primary hover:bg-rose-700 font-bold" onClick={next}>Continuar</Button>
                  </div>
               </Card>
            )}

            {step === "objetivo" && (
              <Card className="rounded-[40px] border-none shadow-premium p-10 bg-white">
                <div className="text-center mb-8">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-50 text-emerald-600"><Target className="h-8 w-8" /></div>
                  <h2 className="text-3xl font-serif italic mb-2">Qual seu objetivo principal?</h2>
                </div>
                <div className="grid gap-3 mb-8">
                   {[
                     { id: "emagrecer", label: "🔥 Emagrecer", desc: "Perder peso de forma saudável." },
                     { id: "definir", label: "💪 Definir", desc: "Tonificar e ganhar definição." },
                     { id: "mais energia", label: "⚡ Mais energia", desc: "Ter mais disposição no dia a dia." },
                     { id: "criar constancia", label: "🎯 Criar constância", desc: "Montar uma rotina e manter o hábito." }
                   ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => { onUpdateProfile("objetivo", item.id as Goal); next(); }}
                      className={`flex items-center gap-4 rounded-3xl border-2 p-5 text-left transition-all ${profile.objetivo === item.id ? "border-primary bg-rose-50" : "border-slate-50 bg-white hover:border-rose-100"}`}
                    >
                      <div>
                        <div className="font-bold text-slate-900">{item.label}</div>
                        <div className="text-xs text-slate-500 mt-1">{item.desc}</div>
                      </div>
                    </button>
                   ))}
                </div>
                <Button variant="ghost" className="w-full rounded-2xl h-14 text-slate-400" onClick={back}>Voltar</Button>
              </Card>
            )}

            {step === "nivel" && (
               <Card className="rounded-[40px] border-none shadow-premium p-10 bg-white text-center">
                  <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-3xl bg-sky-50 text-sky-600"><BarChart3 className="h-8 w-8" /></div>
                  <h2 className="text-3xl font-serif italic mb-2">Qual seu nível atual?</h2>
                  <p className="text-slate-500 font-light mb-8">O plano se adapta à sua experiência.</p>
                  <div className="grid gap-3 mb-8">
                     {[
                       { id: "iniciante", label: "🌱 Iniciante", desc: "Nunca treinei ou treino pouco." },
                       { id: "intermediaria", label: "🌿 Intermediária", desc: "Já treino ocasionalmente." },
                       { id: "avancada", label: "🌳 Avançada", desc: "Treino regularmente com intensidade." }
                     ].map((item) => (
                      <button
                        key={item.id}
                        onClick={() => { onUpdateProfile("nivel", item.id as FitnessLevel); next(); }}
                        className={`flex items-center gap-4 rounded-3xl border-2 p-5 text-left transition-all ${profile.nivel === item.id ? "border-primary bg-rose-50" : "border-slate-50 bg-white hover:border-rose-100"}`}
                      >
                        <div>
                          <div className="font-bold text-slate-900">{item.label}</div>
                          <div className="text-xs text-slate-500 mt-1">{item.desc}</div>
                        </div>
                      </button>
                     ))}
                  </div>
                  <Button variant="ghost" className="w-full rounded-2xl h-14 text-slate-400" onClick={back}>Voltar</Button>
               </Card>
            )}

            {step === "tempo" && (
                <Card className="rounded-[40px] border-none shadow-premium p-10 bg-white text-center">
                  <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-3xl bg-amber-50 text-amber-600"><Clock className="h-8 w-8" /></div>
                  <h2 className="text-3xl font-serif italic mb-2">Quanto tempo por dia?</h2>
                  <p className="text-slate-500 font-light mb-8 font-serif">Treinos curtos que realmente trazem resultado.</p>
                  <div className="grid grid-cols-2 gap-3 mb-8">
                     {[
                       { id: "10", label: "10 min", desc: "Super rápido" },
                       { id: "15", label: "15 min", desc: "Ideal" },
                       { id: "20", label: "20 min", desc: "Completo" },
                       { id: "30", label: "30 min", desc: "Firme" }
                     ].map((item) => (
                      <button
                        key={item.id}
                        onClick={() => { onUpdateProfile("tempo", item.id as TimePerDay); next(); }}
                        className={`rounded-3xl border-2 p-6 transition-all ${profile.tempo === item.id ? "border-primary bg-rose-50" : "border-slate-50 bg-white hover:border-rose-100"}`}
                      >
                        <div className="text-xl font-black text-slate-900">{item.label}</div>
                        <div className="text-[10px] text-slate-400 uppercase font-bold mt-1 tracking-widest">{item.desc}</div>
                      </button>
                     ))}
                  </div>
                  <Button variant="ghost" className="w-full rounded-2xl h-14 text-slate-400" onClick={back}>Voltar</Button>
                </Card>
            )}

            {step === "rotina" && (
               <Card className="rounded-[40px] border-none shadow-premium p-10 bg-white text-center">
                  <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-3xl bg-pink-50 text-pink-600"><Flame className="h-8 w-8" /></div>
                  <h2 className="text-3xl font-serif italic mb-2">Como é sua rotina?</h2>
                  <div className="grid gap-3 mt-8 mb-8">
                    {[
                      { id: "corrida", label: "🚀 Muito corrida", desc: "Pouco tempo para tudo." },
                      { id: "moderada", label: "⚖️ Moderada", desc: "Consigo me organizar bem." },
                      { id: "flexivel", label: "🌊 Mais flexível", desc: "Tenho tempo para variar." }
                    ].map((item) => (
                      <button
                        key={item.id}
                        onClick={() => { onUpdateProfile("rotina", item.id as RoutineStyle); next(); }}
                        className={`flex items-center gap-4 rounded-3xl border-2 p-5 text-left transition-all ${profile.rotina === item.id ? "border-primary bg-rose-50" : "border-slate-50 bg-white hover:border-rose-100"}`}
                      >
                        <div>
                          <div className="font-bold text-slate-900">{item.label}</div>
                          <div className="text-xs text-slate-500 mt-1">{item.desc}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                  <Button variant="ghost" className="w-full rounded-2xl h-14 text-slate-400" onClick={back}>Voltar</Button>
               </Card>
            )}

            {step === "refeicao" && (
              <Card className="rounded-[40px] border-none shadow-premium p-10 bg-white text-center">
                 <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-3xl bg-orange-50 text-orange-600"><Salad className="h-8 w-8" /></div>
                  <h2 className="text-3xl font-serif italic mb-2">Seu estilo alimentar?</h2>
                  <div className="grid gap-3 mt-8 mb-8">
                    {[
                      { id: "pratico", label: "⚡ Prático", desc: "Receitas rápidas." },
                      { id: "equilibrado", label: "⚖️ Equilibrado", desc: "Variado e balanceado." },
                      { id: "sem tempo", label: "⌛ Sem tempo", desc: "O mais rápido possível." },
                      { id: "caseiro", label: "🏠 Caseiro", desc: "Gosto de cozinhar." }
                    ].map((item) => (
                      <button
                        key={item.id}
                        onClick={() => { onUpdateProfile("refeicao", item.id as MealStyle); next(); }}
                        className={`flex items-center gap-4 rounded-3xl border-2 p-5 text-left transition-all ${profile.refeicao === item.id ? "border-primary bg-rose-50" : "border-slate-50 bg-white hover:border-rose-100"}`}
                      >
                        <div>
                          <div className="font-bold text-slate-900">{item.label}</div>
                          <div className="text-xs text-slate-500 mt-1">{item.desc}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                  <Button variant="ghost" className="w-full rounded-2xl h-14 text-slate-400" onClick={back}>Voltar</Button>
              </Card>
            )}

            {step === "done" && (
              <Card className="rounded-[40px] border-none shadow-premium overflow-hidden bg-white text-center">
                <div className="bg-emerald-600 p-10 text-white">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-white/20">
                    <BadgeCheck className="h-8 w-8 text-white" />
                  </div>
                  <h2 className="text-3xl font-black">Tudo pronto, {profile.nome}! 🎊</h2>
                  <p className="mt-3 text-sm opacity-90 leading-relaxed font-serif italic">Seu plano SlimDay foi gerado com sucesso.</p>
                </div>
                <CardContent className="p-10 space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                     <div className="bg-slate-50 p-4 rounded-2xl">
                        <span className="text-[10px] uppercase font-black text-slate-400">Objetivo</span>
                        <p className="font-bold text-slate-900 capitalize">{profile.objetivo}</p>
                     </div>
                     <div className="bg-slate-50 p-4 rounded-2xl">
                        <span className="text-[10px] uppercase font-black text-slate-400">Nível</span>
                        <p className="font-bold text-slate-900 capitalize">{profile.nivel}</p>
                     </div>
                  </div>
                  <Button className="w-full h-16 rounded-2xl bg-emerald-600 hover:bg-emerald-700 font-bold text-lg" onClick={onComplete}>
                    Ver meu Painel <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </CardContent>
              </Card>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
