import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dumbbell, CheckCircle2, ChevronUp, ChevronDown, AlertCircle, BookOpen, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PlanItem } from "@/data/types";

interface WorkoutSectionProps {
  workoutPlan: PlanItem[];
  completed: Record<string, boolean>;
  toggleCheck: (id: string, title: string) => void;
  expandedWorkoutId: string | null;
  setExpandedWorkoutId: (id: string | null) => void;
}

export const categoryColors: Record<string, string> = {
  "Aquecimento": "bg-emerald-50 text-emerald-600 border-emerald-100",
  "Treino do dia": "bg-rose-50 text-rose-600 border-rose-100",
  "Alongamento": "bg-sky-50 text-sky-600 border-sky-100",
  "Mobilidade": "bg-violet-50 text-violet-600 border-violet-100"
};

export function WorkoutSection({
  workoutPlan,
  completed,
  toggleCheck,
  expandedWorkoutId,
  setExpandedWorkoutId
}: WorkoutSectionProps) {
  return (
    <div className="grid gap-4 animate-in fade-in duration-500">
      {workoutPlan.map((item, index) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className="bg-white rounded-[32px] border border-slate-100 shadow-premium overflow-hidden group"
        >
          <div className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex-1 space-y-3">
                <div className="inline-flex flex-wrap gap-2">
                  <Badge className={`rounded-full border text-[9px] font-bold uppercase tracking-wider px-3 py-1 ${categoryColors[item.categoria || ""] || "bg-rose-50 text-rose-600 border-rose-100"}`}>
                    {item.categoria || "Treino"}
                  </Badge>
                  <Badge className="rounded-full bg-slate-50 text-slate-400 border-slate-100 text-[9px] font-bold uppercase tracking-wider px-3 py-1">
                    {item.nivel}
                  </Badge>
                  <Badge className="rounded-full bg-slate-50 text-slate-400 border-slate-100 text-[9px] font-bold uppercase tracking-wider px-3 py-1 flex items-center gap-1">
                    <Clock className="h-2 w-2" /> {item.minutos} min
                  </Badge>
                </div>
                <h4 className="text-2xl font-serif italic text-slate-900">{item.titulo}</h4>
                <p className="text-slate-500 text-sm font-light leading-relaxed max-w-xl">{item.descricao}</p>
                
                <button 
                  onClick={() => setExpandedWorkoutId(expandedWorkoutId === item.id ? null : item.id)}
                  className="flex items-center gap-2 text-primary text-[10px] font-black uppercase tracking-[2px] hover:text-rose-700 transition-colors pt-2"
                >
                  <BookOpen className="h-4 w-4" />
                  {expandedWorkoutId === item.id ? "Ocultar Instruções" : "Como fazer o exercício?"}
                </button>
              </div>

              <Button
                variant={completed[item.id] ? "ghost" : "default"}
                className={`w-full md:w-52 h-14 rounded-2xl font-bold shadow-lg transition-all ${completed[item.id] ? "text-emerald-600 bg-emerald-50 shadow-none" : "bg-slate-900 hover:bg-black text-white shadow-slate-200"}`}
                onClick={() => toggleCheck(item.id, item.titulo)}
              >
                {completed[item.id] ? <><CheckCircle2 className="mr-2 h-5 w-5" /> Concluído</> : "Marcar como Feito"}
              </Button>
            </div>

            <AnimatePresence>
              {expandedWorkoutId === item.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="mt-8 pt-8 border-t border-slate-50 grid md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <p className="text-[10px] uppercase font-bold tracking-[3px] text-slate-300">Tutorial Passo a Passo</p>
                      <div className="space-y-4">
                        {item.tutorial?.map((step, i) => (
                          <div key={i} className="flex gap-4 text-sm font-light text-slate-600 leading-relaxed">
                            <span className="text-primary font-serif italic font-bold shrink-0 text-lg">0{i + 1}</span>
                            <span>{step}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-6">
                      <div className="p-6 rounded-[32px] bg-primary/5 border border-primary/10">
                        <p className="text-[10px] uppercase font-bold tracking-[3px] text-primary/60 mb-2">Foco Mental</p>
                        <p className="text-sm font-medium text-slate-700 italic leading-relaxed">"{item.explicacaoSimples}"</p>
                      </div>
                      <div className="p-6 rounded-[32px] bg-amber-50 border border-amber-100">
                        <div className="flex items-center gap-2 mb-3">
                          <AlertCircle className="h-4 w-4 text-amber-500" />
                          <p className="text-[10px] uppercase font-bold tracking-[3px] text-amber-600">Ponto de Atenção</p>
                        </div>
                        <p className="text-xs text-amber-800 leading-relaxed font-light">{item.cuidado}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      ))}

      {workoutPlan.length === 0 && (
         <Card className="rounded-[32px] border-dashed border-2 border-slate-200 p-12 text-center">
            <Dumbbell className="h-12 w-12 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-400 font-light">Nenhum treino selecionado para o seu perfil.</p>
         </Card>
      )}
    </div>
  );
}
