import React from "react";
import { Utensils, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlanItemWithRecipe } from "../../types/slimday";
import { recipeImages } from "../../assets/recipes";

interface MealSectionProps {
  mealPlan: PlanItemWithRecipe[];
  completed: Record<string, boolean>;
  toggleCheck: (id: string, title: string) => void;
  style: string;
}

export function MealSection({
  mealPlan,
  completed,
  toggleCheck,
  style,
}: MealSectionProps) {
  return (
    <div className="grid gap-8 md:grid-cols-2">
      {mealPlan.map((item, index) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white rounded-[48px] border-none shadow-premium overflow-hidden flex flex-col justify-between group"
        >
          <div className="relative h-48 overflow-hidden">
            <img 
              src={recipeImages[item.id] || recipeImages[item.titulo]} 
              alt={item.titulo}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          </div>
          
          <div className="p-8 pt-6 flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <Badge variant="outline" className="rounded-full border-slate-100 text-slate-400 font-bold uppercase tracking-widest text-[9px] px-3">
                {item.categoria}
              </Badge>
              <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${completed[item.id] ? "bg-emerald-50 text-emerald-500" : "bg-orange-50 text-orange-400"}`}>
                <Utensils className="h-5 w-5" />
              </div>
            </div>
            
            <h4 className="text-2xl font-serif italic mb-4">{item.titulo}</h4>
            <p className="text-slate-500 text-sm font-light leading-relaxed mb-8">{item.descricao}</p>
            
            {item.receita && (
              <details className="mb-8">
                <summary className="cursor-pointer text-xs font-bold uppercase tracking-widest text-rose-500 hover:text-rose-600 transition-colors">
                  Ver Receita Completa
                </summary>
                <div className="mt-6 space-y-6 pt-6 border-t border-slate-50">
                  <div>
                    <p className="text-[10px] uppercase font-bold tracking-[3px] text-slate-300 mb-3">Ingredientes</p>
                    <ul className="grid grid-cols-1 gap-2">
                      {item.receita.ingredientes.map((ing, i) => (
                        <li key={i} className="text-sm font-light text-slate-500 flex items-center gap-2">
                          <div className="h-1 w-1 rounded-full bg-rose-500" /> {ing}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold tracking-[3px] text-slate-300 mb-3">Preparo</p>
                    <div className="space-y-3">
                      {item.receita.preparo.map((step, i) => (
                        <div key={i} className="flex gap-4 text-sm font-light text-slate-500">
                          <span className="text-rose-500 italic font-serif">{i + 1}.</span>
                          <span>{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </details>
            )}
            <div className="mt-auto">
              <Button
                variant={completed[item.id] ? "secondary" : "default"}
                className={`w-full h-14 rounded-2xl font-bold transition-all ${
                  completed[item.id] 
                    ? "bg-rose-50 text-rose-500 hover:bg-rose-100" 
                    : "bg-gradient-to-r from-rose-500 to-fuchsia-500 hover:from-rose-600 hover:to-fuchsia-600 border-none text-white shadow-lg shadow-rose-200"
                }`}
                onClick={() => toggleCheck(item.id, item.titulo)}
              >
                {completed[item.id] ? "Concluído ✅" : "Marcar como Feito"}
              </Button>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
