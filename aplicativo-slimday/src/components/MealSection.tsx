import React from "react";
import { motion } from "framer-motion";
import { Utensils, ChevronRight, Apple, Clock, Flame, Salad, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PlanItemWithRecipe } from "@/data/types";

// Fallback for recipe images if not available
const recipeImages: Record<string, string> = {};

interface MealSectionProps {
  mealPlan: PlanItemWithRecipe[];
  completed: Record<string, boolean>;
  toggleCheck: (id: string, title: string) => void;
}

export function MealSection({
  mealPlan,
  completed,
  toggleCheck
}: MealSectionProps) {
  return (
    <div className="grid gap-8 md:grid-cols-2 animate-in fade-in duration-500">
      {mealPlan.map((item, index) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white rounded-[40px] border border-slate-100 shadow-premium p-8 flex flex-col group transition-all hover:shadow-xl"
        >
          <div className="overflow-hidden rounded-[32px] mb-8 relative aspect-video bg-rose-50/30">
            {recipeImages[item.id] || recipeImages[item.titulo] ? (
              <img 
                src={recipeImages[item.id] || recipeImages[item.titulo]} 
                alt={item.titulo} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
              />
            ) : (
               <div className="w-full h-full flex items-center justify-center text-rose-200">
                 <Salad className="h-12 w-12" />
               </div>
            )}
            <div className="absolute top-4 left-4">
               <Badge className="rounded-full bg-white/90 backdrop-blur-md text-slate-900 border-none px-4 py-1.5 font-bold shadow-sm text-[10px] uppercase tracking-widest">
                {item.categoria}
              </Badge>
            </div>
          </div>

          <div className="flex-1 space-y-4">
            <h4 className="text-3xl font-serif italic text-slate-900 leading-tight">{item.titulo}</h4>
            <p className="text-slate-500 text-sm font-light leading-relaxed">{item.descricao}</p>
            
            {item.receita && (
              <details className="mt-6 group/details">
                <summary className="cursor-pointer list-none">
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[2px] text-primary group-hover:text-rose-700 transition-colors">
                    <BookOpen className="h-4 w-4" /> Ver receita completa
                  </div>
                </summary>
                <div className="mt-8 space-y-8 pt-8 border-t border-slate-50">
                  <div className="grid grid-cols-1 gap-6">
                    <div className="space-y-4">
                      <p className="text-[10px] uppercase font-bold tracking-[3px] text-slate-300">Ingredientes</p>
                      <div className="grid grid-cols-1 gap-4">
                        {item.receita.ingredientes.map((ing, i) => (
                          <div key={i} className="text-sm font-light text-slate-500 flex items-center gap-3">
                            <div className="h-1.5 w-1.5 rounded-full bg-primary/40 shrink-0" />
                            <span>{ing}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-4">
                      <p className="text-[10px] uppercase font-bold tracking-[3px] text-slate-300">Modo de Preparo</p>
                      <div className="space-y-4">
                        {item.receita.preparo.map((step, i) => (
                          <div key={i} className="flex gap-4 text-sm font-light text-slate-600 leading-relaxed">
                            <span className="text-primary italic font-serif font-bold shrink-0 text-base">{(i + 1).toString().padStart(2, '0')}</span>
                            <span>{step}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </details>
            )}
          </div>

          <Button
            variant={completed[item.id] ? "secondary" : "default"}
            className={`w-full h-16 rounded-[24px] font-black text-base transition-all mt-8 group ${completed[item.id] ? "bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100" : "bg-slate-900 hover:bg-black text-white shadow-xl shadow-slate-100"}`}
            onClick={() => toggleCheck(item.id, item.titulo)}
          >
            {completed[item.id] ? "Planejado ✓" : "Adicionar ao Meu Dia"}
          </Button>
        </motion.div>
      ))}
    </div>
  );
}
