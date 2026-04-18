import React from "react";
import { CheckCircle2, PlayCircle, Dumbbell } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlanItem } from "../../types/slimday";

interface WorkoutSectionProps {
  workoutPlan: PlanItem[];
  completed: Record<string, boolean>;
  toggleCheck: (id: string, title: string) => void;
}

export function WorkoutSection({
  workoutPlan,
  completed,
  toggleCheck,
}: WorkoutSectionProps) {
  return (
    <div className="grid gap-6">
      {workoutPlan.map((item, index) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="group bg-white rounded-[40px] border-none shadow-premium overflow-hidden"
        >
          <div className="flex flex-col md:flex-row">
            <div className="w-full md:w-2/5 p-8 bg-slate-50 relative">
              <div className="inline-flex gap-2 mb-6">
                <Badge className="rounded-full bg-rose-100 text-rose-600 border-none text-[10px] font-bold uppercase">{item.nivel}</Badge>
                <Badge className="rounded-full bg-slate-200 text-slate-500 border-none text-[10px] font-bold uppercase">{item.minutos} min</Badge>
              </div>
              <h4 className="text-3xl font-serif italic mb-4 leading-tight">{item.titulo}</h4>
              <p className="text-slate-500 text-sm font-light leading-relaxed mb-8">{item.descricao}</p>
              
              <Button
                variant={completed[item.id] ? "secondary" : "default"}
                className={`w-full h-14 rounded-2xl font-bold transition-all ${
                  completed[item.id] 
                    ? "bg-rose-50 text-rose-500 hover:bg-rose-100" 
                    : "bg-gradient-to-r from-rose-500 to-fuchsia-500 hover:from-rose-600 hover:to-fuchsia-600 border-none text-white shadow-lg shadow-rose-200"
                }`}
                onClick={() => toggleCheck(item.id, item.titulo)}
              >
                {completed[item.id] ? <><CheckCircle2 className="mr-2 h-5 w-5" /> Concluído</> : "Marcar como Feito"}
              </Button>
            </div>
            
            <div className="flex-1 p-8 md:p-10 space-y-8 bg-white">
              {item.youtubeId && (
                <div className="aspect-video rounded-[32px] overflow-hidden shadow-2xl border-4 border-white">
                  <iframe
                    width="100%"
                    height="100%"
                    src={`https://www.youtube.com/embed/${item.youtubeId}`}
                    title={item.titulo}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              )}
              
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <p className="text-[10px] uppercase font-bold tracking-[3px] text-slate-300">Como Praticar</p>
                  <div className="space-y-3">
                    {item.tutorial?.map((step, i) => (
                      <div key={i} className="flex gap-4 text-sm font-light text-slate-500">
                        <span className="text-rose-500 font-serif italic font-bold">{i + 1}.</span>
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-6">
                  <div>
                    <p className="text-[10px] uppercase font-bold tracking-[3px] text-slate-300 mb-2">Ponto de Foco</p>
                    <p className="text-sm font-medium text-slate-700 italic">"{item.explicacaoSimples}"</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100">
                    <p className="text-[10px] uppercase font-bold tracking-[3px] text-rose-400 mb-2">Atenção</p>
                    <p className="text-xs text-rose-700 leading-relaxed">{item.cuidado}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
