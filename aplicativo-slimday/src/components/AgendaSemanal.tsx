import React from "react";
import { 
  Calendar, CheckCircle2, Clock, Utensils, 
  Dumbbell, Star, ChevronRight, Activity, 
  Sparkles, Target, Zap
} from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { DayPlan } from "../data/types";

interface WeeklyScheduleProps {
  schedule: DayPlan[];
  currentFocus: string[];
}

export default function AgendaSemanal({ schedule, currentFocus }: WeeklyScheduleProps) {
  const days = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-serif italic mb-2">Sua Agenda SlimDay</h2>
          <p className="text-slate-500 font-light text-sm">Um plano visual de 7 dias para facilitar sua constância.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-primary/10 text-primary border border-primary/20 text-xs font-bold uppercase tracking-widest">
           <Target className="h-4 w-4" /> Foco na Reorganização
        </div>
      </header>

      {/* Week Focus Summary */}
      <Card className="rounded-[32px] border-none shadow-premium bg-gradient-to-br from-slate-900 to-slate-800 p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-3xl rounded-full -mr-32 -mt-32" />
        <div className="relative z-10 grid md:grid-cols-4 gap-6">
          {currentFocus.map((focus, i) => (
            <div key={i} className="space-y-2">
              <div className="text-[10px] uppercase font-bold text-slate-400">Semana {i + 1}</div>
              <div className="text-sm font-medium">{focus}</div>
              {i === 0 && <div className="h-1 w-12 rounded-full bg-primary" />}
            </div>
          ))}
        </div>
      </Card>

      <div className="grid gap-4">
        {schedule.map((item, index) => (
          <motion.div
            key={item.day}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="rounded-[28px] border-none shadow-sm hover:shadow-md transition-all overflow-hidden bg-white group">
              <div className="flex flex-col md:flex-row md:items-center">
                <div className="bg-slate-50 md:w-32 px-6 py-4 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-slate-100 shrink-0">
                  <span className="text-[10px] uppercase font-bold text-slate-400">{item.day}</span>
                  <span className="text-lg font-black text-slate-900 mt-1">{index + 1}</span>
                </div>
                
                <div className="p-6 grid md:grid-cols-3 gap-6 flex-1 items-center">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-600 shrink-0">
                      <Dumbbell className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-400">Treino {item.minutos}m</p>
                      <p className="text-sm font-bold text-slate-900 mt-0.5">{item.treino}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-600 shrink-0">
                      <Utensils className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-400">Sugestão de Refeição</p>
                      <p className="text-sm font-bold text-slate-900 mt-0.5">{item.refeicao}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-400">Foco do Dia</p>
                      <p className="text-sm font-bold text-primary mt-0.5">{item.foco}</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-primary transition-colors" />
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card className="rounded-3xl border-dashed border-2 border-rose-200 bg-rose-50/30 p-8 text-center">
        <Sparkles className="h-8 w-8 text-rose-400 mx-auto mb-4" />
        <h4 className="text-lg font-serif italic text-rose-900">Plano Dinâmico</h4>
        <p className="text-sm text-slate-500 mt-2 max-w-sm mx-auto font-light">
          Sua agenda se ajusta automaticamente. Conforme você completa as etapas no seu ritmo, o app planeja os próximos passos.
        </p>
      </Card>
    </div>
  );
}
