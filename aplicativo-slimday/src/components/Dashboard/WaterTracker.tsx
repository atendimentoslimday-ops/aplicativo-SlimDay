import React, { useState, useEffect, useMemo } from "react";
import { Droplet, Plus, RotateCcw, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Profile } from "../../types/slimday";
import { 
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface WaterTrackerProps {
  initialCount?: number;
  profile: Profile;
}

export function WaterTracker({ initialCount = 0, profile }: WaterTrackerProps) {
  // Segurança Zero Trust: Ofuscação de Dados
  const encodeData = (data: any) => btoa(encodeURIComponent(JSON.stringify(data)));
  const decodeData = (str: string) => {
    try { return JSON.parse(decodeURIComponent(atob(str))); }
    catch { return null; }
  };

  const [glasses, setGlasses] = useState(() => {
    const local = localStorage.getItem("sd_w_obf");
    if (local) return decodeData(local) || initialCount;
    const oldLocal = localStorage.getItem("sd_water_count");
    if (oldLocal) { localStorage.removeItem("sd_water_count"); return JSON.parse(oldLocal); }
    return initialCount;
  });

  // Cálculo personalizado da meta de água com salvaguardas
  const waterGoal = useMemo(() => {
    const weightVal = parseFloat(String(profile?.peso)) || 65;
    let mlPerKg = 35; // Padrão recomendado
    
    // Ajustes por objetivo
    const objetivo = profile?.objetivo || "emagrecer";
    if (objetivo === "emagrecer" || objetivo === "ganhar_massa" || objetivo === "definir") {
      mlPerKg = 40;
    }
    
    const totalMl = weightVal * mlPerKg;
    const glassSize = 250;
    const targetGlasses = Math.max(1, Math.ceil(totalMl / glassSize)); // Mínimo 1 copo
    
    return {
      ml: totalMl,
      glasses: targetGlasses || 8,
      liters: (totalMl / 1000).toFixed(1)
    };
  }, [profile?.peso, profile?.objetivo]);

  useEffect(() => {
    localStorage.setItem("sd_w_obf", encodeData(glasses));
  }, [glasses]);

  const toggleGlass = (index: number) => {
    if (index === glasses - 1) {
      setGlasses(index);
    } else {
      setGlasses(Math.min(index + 1, waterGoal.glasses));
    }
  };

  const reset = () => setGlasses(0);

  const progress = Math.min((glasses / (waterGoal.glasses || 1)) * 100, 100);

  return (
    <div className="bg-white rounded-[40px] p-8 shadow-premium border-none relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
        <Droplet className="h-24 w-24 text-blue-500 fill-current" />
      </div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-serif italic text-slate-900">Hidratação Personalizada</h3>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-slate-300 cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="bg-slate-900 text-white border-none rounded-xl p-3 max-w-[200px]">
                  <p className="text-[10px] leading-relaxed">Sua meta é calculada com base no seu peso ({profile?.peso || 65}kg) e seu objetivo de {profile?.objetivo || "emagrecer"}.</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <p className="text-sm text-slate-500 font-light">
              Meta diária: <span className="font-bold text-blue-600">{waterGoal.glasses} copos</span> ({waterGoal.liters}L)
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={reset} className="text-slate-300 hover:text-rose-500 rounded-full">
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex flex-wrap gap-3 mb-6">
          {[...Array(Math.max(0, waterGoal.glasses))].map((_, i) => (
            <motion.button
              key={i}
              whileTap={{ scale: 0.9 }}
              onClick={() => toggleGlass(i)}
              className={`h-12 w-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                i < glasses 
                  ? "bg-blue-500 text-white shadow-lg shadow-blue-200" 
                  : "bg-slate-50 text-slate-300 border border-slate-100 hover:border-blue-200"
              }`}
            >
              <Droplet className={`h-6 w-6 ${i < glasses ? "fill-current" : ""}`} />
            </motion.button>
          ))}
          {/* Botão de Adicional caso queira passar da meta */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setGlasses(glasses + 1)}
            className="h-12 w-10 rounded-xl flex items-center justify-center bg-slate-50 text-slate-300 border border-dashed border-slate-200 hover:bg-blue-50 hover:text-blue-500 transition-all"
          >
            <Plus className="h-5 w-5" />
          </motion.button>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex-1 h-3 bg-slate-50 rounded-full overflow-hidden border border-slate-100 p-0.5">
            <motion.div 
              className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ type: "spring", stiffness: 100 }}
            />
          </div>
          <div className="flex flex-col items-end">
            <span className="text-sm font-black text-blue-600 leading-none">{Math.round(progress)}%</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Concluído</span>
          </div>
        </div>
      </div>
    </div>
  );
}
