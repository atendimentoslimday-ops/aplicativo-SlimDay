import React, { useMemo } from "react";
import { Utensils, ChevronRight, Flame, Target, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlanItemWithRecipe, Profile } from "../../types/slimday";
import { recipeImages, defaultRecipeImage } from "../../assets/recipes";
import { calculateCalorieTarget } from "../../utils/slimdayLogic";

interface MealSectionProps {
  mealPlan: PlanItemWithRecipe[];
  completed: Record<string, boolean>;
  toggleCheck: (id: string, title: string) => void;
  style: string;
  profile: Profile;
}

export function MealSection({
  mealPlan,
  completed,
  toggleCheck,
  style,
  profile,
}: MealSectionProps) {
  
  const calorieTarget = useMemo(() => calculateCalorieTarget(profile), [profile]);
  
  const totalCalories = useMemo(() => {
    return mealPlan.reduce((acc, item) => {
      const kcalStr = item.calorias?.replace(/[^0-9]/g, "") || "0";
      return acc + parseInt(kcalStr);
    }, 0);
  }, [mealPlan]);

  const consumedCalories = useMemo(() => {
    return mealPlan.reduce((acc, item) => {
      if (completed[item.id]) {
        const kcalStr = item.calorias?.replace(/[^0-9]/g, "") || "0";
        return acc + parseInt(kcalStr);
      }
      return acc;
    }, 0);
  }, [mealPlan, completed]);

  const progress = Math.min(Math.round((consumedCalories / calorieTarget) * 100), 100);

  return (
    <div className="space-y-10">
      {/* Calorie Target Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-[40px] p-8 shadow-premium border border-rose-50"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-500">
              <Flame className="h-7 w-7" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[3px] font-bold text-slate-400">Meta Calórica Diária</p>
              <h3 className="text-2xl font-serif italic text-slate-900">
                {calorieTarget} <span className="text-sm font-sans not-italic text-slate-400 font-normal">kcal / dia</span>
              </h3>
            </div>
          </div>

          <div className="flex-1 max-w-md">
            <div className="flex justify-between items-end mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Progresso de Hoje</span>
              <span className="text-sm font-bold text-rose-500">{consumedCalories} / {calorieTarget} kcal</span>
            </div>
            <div className="h-3 w-full bg-slate-50 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className="h-full bg-gradient-to-r from-rose-500 to-fuchsia-500 rounded-full"
              />
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-6 pl-6 border-l border-slate-100">
            <div className="text-center">
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Restante</p>
              <p className="font-bold text-slate-700">{Math.max(0, calorieTarget - consumedCalories)} kcal</p>
            </div>
          </div>
        </div>
      </motion.div>

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
                src={recipeImages[item.id] || recipeImages[item.titulo] || defaultRecipeImage} 
                alt={item.titulo}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full shadow-sm border border-white/20">
                <p className="text-[10px] font-bold text-rose-500 flex items-center gap-1.5">
                  <Flame className="h-3 w-3" /> {item.calorias || "---"}
                </p>
              </div>
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
      
      {/* Summary Footer */}
      <div className="bg-slate-900 rounded-[48px] p-10 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/10 blur-[100px] rounded-full -mr-32 -mt-32" />
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="text-center md:text-left">
            <h4 className="text-2xl font-serif italic mb-2">Plano de Hoje Finalizado?</h4>
            <p className="text-slate-400 text-sm max-w-xs">Ao completar todas as refeições, você garante que atingiu sua meta de {calorieTarget} kcal para o objetivo de {profile.objetivo.replace("_", " ")}.</p>
          </div>
          <div className="flex gap-4">
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 text-center border border-white/10 min-w-[140px]">
              <p className="text-[10px] font-bold text-rose-400 uppercase tracking-widest mb-1">Total Previsto</p>
              <p className="text-2xl font-bold">{totalCalories} kcal</p>
            </div>
            <div className="bg-rose-500 rounded-3xl p-6 text-center shadow-lg shadow-rose-500/20 min-w-[140px]">
              <p className="text-[10px] font-bold text-white/70 uppercase tracking-widest mb-1">Seu Objetivo</p>
              <p className="text-2xl font-bold">{calorieTarget} kcal</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
