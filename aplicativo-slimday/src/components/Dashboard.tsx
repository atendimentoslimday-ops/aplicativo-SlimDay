import React from "react";
import { motion } from "framer-motion";
import { 
  Sparkles, Dumbbell, Utensils, ChevronRight, PlayCircle, 
  Target, BarChart3, Clock, Flame, Apple, Heart, Activity,
  TrendingUp, Award, Zap, Salad, BadgeCheck
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Profile } from "@/data/types";

interface DashboardProps {
  profile: Profile;
  dailyMinutes: number;
  bmi: string | null;
  getProfileSummary: (p: Profile) => string;
  setActiveTab: (t: string) => void;
  dayMessage: { title: string; body: string };
  workoutPlan: any[];
  mealPlan: any[];
}

export function Dashboard({
  profile,
  dailyMinutes,
  bmi,
  getProfileSummary,
  setActiveTab,
  dayMessage,
  workoutPlan,
  mealPlan
}: DashboardProps) {
  const getBmiStatus = (bmiValue: number) => {
    if (bmiValue < 18.5) return { label: "Abaixo do peso", color: "text-amber-600" };
    if (bmiValue < 25) return { label: "Peso normal", color: "text-emerald-600" };
    if (bmiValue < 30) return { label: "Sobrepeso", color: "text-amber-600" };
    return { label: "Obesidade", color: "text-rose-600" };
  };

  const bmiValue = bmi ? parseFloat(bmi.replace(',', '.')) : null;
  const bmiStatus = bmiValue ? getBmiStatus(bmiValue) : null;

  return (
    <div className="mt-0 space-y-8 animate-in fade-in duration-700">
      {/* Premium Today Card */}
      <Card className="rounded-[40px] border border-rose-100/50 shadow-premium overflow-hidden bg-white group">
        <CardContent className="p-0 flex flex-col md:flex-row h-full">
          <div className="w-full md:w-[320px] bg-[linear-gradient(180deg,#e11d48_0%,#9d174d_100%)] p-8 flex flex-col justify-between text-white relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(244,114,182,0.3),transparent)]" />
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[10px] uppercase tracking-widest font-bold">
                <Sparkles className="h-3 w-3" /> Foco de Hoje
              </div>
              <div className="mt-6 text-4xl font-serif italic leading-tight">{dayMessage.title}</div>
            </div>
            <div className="mt-8 relative z-10">
              <p className="text-white/80 text-[10px] uppercase tracking-widest font-bold mb-2">Seu Momentum</p>
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <Zap className="h-4 w-4 text-amber-300 fill-amber-300" /> Ritmo Ativo
              </div>
            </div>
          </div>
          <div className="flex-1 p-8 md:p-10 flex flex-col justify-center bg-white relative">
             <div className="absolute top-8 right-8 text-rose-50 opacity-20 hidden lg:block">
               <Heart className="h-32 w-32" />
             </div>
             <p className="text-slate-800 text-xl font-light leading-relaxed italic relative z-10">
               "{dayMessage.body}"
             </p>
             <div className="mt-8 flex items-center justify-between relative z-10">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-500">
                    <Activity className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-widest italic">SlimDay Oficial</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="rounded-xl text-rose-600 hover:bg-rose-50 font-bold text-xs uppercase tracking-widest gap-2"
                  onClick={() => setActiveTab("treino")}
                >
                  Começar agora <ChevronRight className="h-4 w-4" />
                </Button>
             </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Objetivo", value: profile.objetivo, icon: <Target />, color: "bg-rose-50 text-rose-600" },
          { label: "Nível", value: profile.nivel, icon: <BarChart3 />, color: "bg-sky-50 text-sky-600" },
          { label: "Treino", value: `${dailyMinutes} min`, icon: <Clock />, color: "bg-amber-50 text-amber-600" },
          { label: "Estilo", value: profile.refeicao, icon: <Salad />, color: "bg-orange-50 text-orange-600" },
        ].map((item, i) => (
          <Card key={i} className="rounded-[32px] border-none shadow-premium bg-white p-6 flex flex-col items-center text-center transition-all hover:scale-[1.02]">
            <div className={`h-10 w-10 rounded-2xl ${item.color} flex items-center justify-center mb-3`}>
              {React.cloneElement(item.icon as React.ReactElement, { className: "h-5 w-5" })}
            </div>
            <span className="text-[10px] uppercase font-bold text-slate-600 tracking-widest">{item.label}</span>
            <span className="text-sm font-bold text-slate-900 mt-1 capitalize">{item.value}</span>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="rounded-[44px] border-none shadow-premium bg-rose-50/40 p-10 overflow-hidden relative group hover:bg-rose-50 transition-colors">
          <div className="absolute -right-6 -top-6 text-rose-100 opacity-30 group-hover:scale-110 transition-transform duration-700">
            <Dumbbell className="h-32 w-32 rotate-12" />
          </div>
          <div className="flex flex-col h-full justify-between relative z-10">
            <div>
              <div className="h-14 w-14 rounded-2xl bg-white flex items-center justify-center text-rose-600 mb-8 shadow-sm">
                <Flame className="h-7 w-7" />
              </div>
              <h3 className="text-3xl font-serif italic mb-3">Seu Treino</h3>
              <p className="text-slate-700 font-light leading-relaxed">
                Plano de {dailyMinutes} minutos focado em <span className="text-rose-600 font-bold">{profile.objetivo}</span>.
              </p>
            </div>
            <Button 
              className="mt-10 h-16 rounded-[24px] bg-primary hover:bg-rose-700 font-bold text-lg shadow-xl shadow-rose-200" 
              onClick={() => setActiveTab("treino")}
            >
              Iniciar Treino <PlayCircle className="ml-2 h-6 w-6" />
            </Button>
          </div>
        </Card>

        <Card className="rounded-[44px] border-none shadow-premium bg-orange-50/40 p-10 overflow-hidden relative group hover:bg-orange-50 transition-colors">
          <div className="absolute -right-6 -top-6 text-orange-100 opacity-30 group-hover:scale-110 transition-transform duration-700">
            <Apple className="h-32 w-32 -rotate-12" />
          </div>
          <div className="flex flex-col h-full justify-between relative z-10">
            <div>
              <div className="h-14 w-14 rounded-2xl bg-white flex items-center justify-center text-orange-600 mb-8 shadow-sm">
                <Utensils className="h-7 w-7" />
              </div>
              <h3 className="text-3xl font-serif italic mb-3">Seu Menu</h3>
              <p className="text-slate-700 font-light leading-relaxed">
                Sugestões práticas para o seu estilo <span className="text-orange-600 font-bold capitalize">{profile.refeicao}</span>.
              </p>
            </div>
            <Button 
              variant="outline" 
              className="mt-10 h-16 rounded-[24px] border-orange-200 bg-white text-orange-700 hover:bg-orange-50 font-bold text-lg shadow-sm" 
              onClick={() => setActiveTab("alimentacao")}
            >
              Ver Cardápio <ChevronRight className="ml-2 h-6 w-6" />
            </Button>
          </div>
        </Card>
      </div>

      {/* Profile Insights */}
      <Card className="rounded-[44px] border-none shadow-premium bg-white p-10">
        <div className="flex items-center gap-5 mb-10">
          <div className="h-14 w-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400">
            <Activity className="h-7 w-7" />
          </div>
          <div>
            <h4 className="text-2xl font-serif italic leading-none text-slate-900">Insight de Saúde</h4>
            <p className="text-[10px] text-slate-600 uppercase tracking-widest font-bold mt-2">Destaques do seu perfil</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-10">
          <div className="p-8 rounded-[32px] bg-slate-50/50 border border-slate-100 flex flex-col justify-center">
            <div className="flex justify-between items-start mb-6">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Resumo Estratégico</span>
              <BadgeCheck className="h-6 w-6 text-primary" />
            </div>
            <p className="text-lg leading-relaxed text-slate-700 font-light italic">
              "{getProfileSummary(profile)}"
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="p-8 rounded-[32px] border border-slate-100 flex flex-col items-center justify-center text-center bg-white shadow-sm">
              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-3">IMC Estimado</span>
              <div className="text-4xl font-black text-slate-900 leading-none">{bmi || "--"}</div>
              {bmiStatus && (
                <span className={`text-[10px] font-bold mt-3 px-3 py-1 rounded-full bg-slate-50 ${bmiStatus.color}`}>{bmiStatus.label}</span>
              )}
            </div>
            <div className="p-8 rounded-[32px] border border-slate-100 flex flex-col items-center justify-center text-center bg-white shadow-sm">
              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-3">Metabolismo</span>
              <TrendingUp className="h-8 w-8 text-emerald-500 mb-2" />
              <span className="text-[10px] font-bold text-emerald-600 px-3 py-1 rounded-full bg-emerald-50">ESTÁVEL</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
