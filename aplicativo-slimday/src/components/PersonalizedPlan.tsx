import React from "react";
import { 
  ChevronRight, BadgeCheck, User, Calendar, 
  Target, BarChart3, Clock, Settings2, Flame,
  Salad, Info
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Profile, Goal, FitnessLevel, TimePerDay, RoutineStyle, MealStyle } from "@/data/types";

interface PersonalizedPlanProps {
  isPlanVisible: boolean;
  profile: Profile;
  updateProfile: <K extends keyof Profile>(key: K, value: Profile[K]) => void;
  nameError: string | null;
  setNameError: (v: string | null) => void;
  sanitizeName: (v: string) => string;
  isGibberish: (v: string) => string | null;
  sanitizeDecimal: (v: string) => string;
  applyPlan: () => void;
}

export function PersonalizedPlan({
  isPlanVisible,
  profile,
  updateProfile,
  nameError,
  setNameError,
  sanitizeName,
  isGibberish,
  sanitizeDecimal,
  applyPlan
}: PersonalizedPlanProps) {
  if (!isPlanVisible) {
    return (
      <Card className="rounded-[40px] border-none shadow-premium bg-white p-8">
        <div className="flex flex-col items-center text-center gap-4">
          <div className="h-16 w-16 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 mb-2">
            <BadgeCheck className="h-10 w-10" />
          </div>
          <h3 className="text-2xl font-serif italic text-slate-900">Plano Otimizado ✨</h3>
          <p className="text-slate-700 font-light text-sm leading-relaxed">
            Seu plano foi reorganizado recentemente. Para manter a constância, permitimos novos ajustes a cada 30 dias.
          </p>
          <div className="w-full h-1 bg-slate-100 rounded-full mt-4 overflow-hidden">
             <div className="h-full bg-emerald-500 w-full" />
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="rounded-[40px] border-none shadow-premium bg-white overflow-hidden">
      <div className="bg-slate-900 p-8 text-white relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-3xl rounded-full -mr-16 -mt-16" />
        <Settings2 className="absolute top-6 right-6 h-6 w-6 text-white/20" />
        <CardTitle className="text-2xl font-serif italic mb-1">Ajuste seu Plano</CardTitle>
        <CardDescription className="text-slate-400 font-light">
          O SlimDay se adapta ao seu momento atual.
        </CardDescription>
      </div>

      <CardContent className="p-8 space-y-6">
        <div className="space-y-4">
          {/* Basic Info */}
          <div className="space-y-2">
            <Label className="text-[10px] uppercase font-bold text-slate-600 tracking-widest ml-1">Seu Nome</Label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
              <Input 
                value={profile.nome} 
                onChange={(e) => {
                  const val = sanitizeName(e.target.value);
                  updateProfile("nome", val);
                  if (setNameError) setNameError(isGibberish(val));
                }} 
                placeholder="Como quer ser chamada?" 
                className={`h-12 pl-12 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white transition-all ${nameError ? "border-rose-500" : ""}`}
              />
            </div>
            {nameError && <p className="text-[10px] text-rose-500 font-bold mt-1 uppercase tracking-wider">{nameError}</p>}
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-bold text-slate-600 tracking-widest ml-1">Idade</Label>
              <Input value={profile.idade} onChange={(e) => updateProfile("idade", e.target.value.replace(/[^0-9]/g, ""))} placeholder="00" className="h-12 rounded-2xl border-slate-100 bg-slate-50/50" />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-bold text-slate-600 tracking-widest ml-1">Altura</Label>
              <Input value={profile.altura} onChange={(e) => updateProfile("altura", sanitizeDecimal(e.target.value))} placeholder="cm" className="h-12 rounded-2xl border-slate-100 bg-slate-50/50" />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-bold text-slate-600 tracking-widest ml-1">Peso</Label>
              <Input value={profile.peso} onChange={(e) => updateProfile("peso", sanitizeDecimal(e.target.value))} placeholder="kg" className="h-12 rounded-2xl border-slate-100 bg-slate-50/50" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-bold text-slate-600 tracking-widest ml-1">Última Menstruação</Label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                <Input type="date" value={profile.ultimoCiclo || ""} onChange={(e) => updateProfile("ultimoCiclo", e.target.value)} className="h-12 pl-12 rounded-2xl border-slate-100 bg-slate-50/50" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-bold text-slate-600 tracking-widest ml-1">Tempo do Fluxo</Label>
              <Input 
                value={profile.duracaoMenstruacao} 
                onChange={(e) => updateProfile("duracaoMenstruacao", e.target.value.replace(/[^0-9]/g, ""))} 
                placeholder="5 dias" 
                className="h-12 rounded-2xl border-slate-100 bg-slate-50/50" 
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] uppercase font-bold text-slate-600 tracking-widest ml-1">Duração do Ciclo Total (Média de 28 dias)</Label>
            <div className="relative">
              <BarChart3 className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
              <Input 
                value={profile.duracaoCiclo} 
                onChange={(e) => updateProfile("duracaoCiclo", e.target.value.replace(/[^0-9]/g, ""))} 
                placeholder="Duração em dias (Ex: 28)" 
                className="h-12 pl-12 rounded-2xl border-slate-100 bg-slate-50/50" 
              />
            </div>
          </div>

          {/* Goals & Style */}
          <div className="space-y-2">
            <Label className="text-[10px] uppercase font-bold text-slate-600 tracking-widest ml-1">Objetivo</Label>
            <Select value={profile.objetivo} onValueChange={(v: Goal) => updateProfile("objetivo", v)}>
              <SelectTrigger className="h-12 rounded-2xl border-slate-100 bg-slate-50/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-2xl">
                <SelectItem value="emagrecer">Focar em Emagrecimento</SelectItem>
                <SelectItem value="definir">Definir e Tonificar</SelectItem>
                <SelectItem value="mais energia">Ganhar mais Energia</SelectItem>
                <SelectItem value="criar constancia">Criar Constância</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
             <div className="space-y-2">
              <Label className="text-[10px] uppercase font-bold text-slate-600 tracking-widest ml-1">Rotina</Label>
              <Select value={profile.rotina} onValueChange={(v: RoutineStyle) => updateProfile("rotina", v)}>
                <SelectTrigger className="h-12 rounded-2xl border-slate-100 bg-slate-50/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-2xl">
                  <SelectItem value="corrida">Muito Corrida</SelectItem>
                  <SelectItem value="moderada">Moderada</SelectItem>
                  <SelectItem value="flexivel">Flexível</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-bold text-slate-600 tracking-widest ml-1">Estilo Dieta</Label>
              <Select value={profile.refeicao} onValueChange={(v: MealStyle) => updateProfile("refeicao", v)}>
                <SelectTrigger className="h-12 rounded-2xl border-slate-100 bg-slate-50/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-2xl">
                  <SelectItem value="pratico">Prático</SelectItem>
                  <SelectItem value="equilibrado">Equilibrado</SelectItem>
                  <SelectItem value="sem tempo">Sempre Sem Tempo</SelectItem>
                  <SelectItem value="caseiro">Comida Caseira</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-bold text-slate-600 tracking-widest ml-1">Seu Nível</Label>
              <Select value={profile.nivel} onValueChange={(v: FitnessLevel) => updateProfile("nivel", v)}>
                <SelectTrigger className="h-12 rounded-2xl border-slate-100 bg-slate-50/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-2xl">
                  <SelectItem value="iniciante">Iniciante</SelectItem>
                  <SelectItem value="intermediaria">Intermediária</SelectItem>
                  <SelectItem value="avancada">Avançada</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-bold text-slate-600 tracking-widest ml-1">Min / Dia</Label>
              <Select value={profile.tempo} onValueChange={(v: TimePerDay) => updateProfile("tempo", v)}>
                <SelectTrigger className="h-12 rounded-2xl border-slate-100 bg-slate-50/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-2xl">
                  <SelectItem value="10">10 min</SelectItem>
                  <SelectItem value="15">15 min</SelectItem>
                  <SelectItem value="20">20 min</SelectItem>
                  <SelectItem value="30">30 min</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <Button 
          className="w-full rounded-[24px] h-16 bg-primary hover:bg-rose-700 font-black text-lg shadow-xl shadow-rose-200 mt-4 group" 
          onClick={applyPlan}
          disabled={Boolean(nameError) || !profile.nome.trim()}
        >
          Salvar e Aplicar Plano <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
        </Button>

        <div className="flex items-center gap-2 justify-center text-[10px] text-slate-600 font-bold uppercase tracking-widest">
           <Info className="h-3 w-3" /> Atualização Mensal recomendada
        </div>
      </CardContent>
    </Card>
  );
}
