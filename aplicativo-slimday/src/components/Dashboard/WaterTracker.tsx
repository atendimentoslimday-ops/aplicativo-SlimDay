import React, { useState, useEffect } from "react";
import { Droplet, Plus, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

interface WaterTrackerProps {
  initialCount?: number;
}

export function WaterTracker({ initialCount = 0 }: WaterTrackerProps) {
  const [glasses, setGlasses] = useState(() => {
    const saved = localStorage.getItem("sd_water_count");
    return saved ? JSON.parse(saved) : initialCount;
  });

  useEffect(() => {
    localStorage.setItem("sd_water_count", JSON.stringify(glasses));
  }, [glasses]);

  const toggleGlass = (index: number) => {
    if (index === glasses - 1) {
      setGlasses(index);
    } else {
      setGlasses(index + 1);
    }
  };

  const reset = () => setGlasses(0);

  return (
    <div className="bg-white rounded-[40px] p-8 shadow-premium border-none relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
        <Droplet className="h-24 w-24 text-blue-500 fill-current" />
      </div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div className="space-y-1">
            <h3 className="text-xl font-serif italic text-slate-900">Hidratação</h3>
            <p className="text-sm text-slate-500 font-light">Meta diária: 8 copos (2L)</p>
          </div>
          <Button variant="ghost" size="icon" onClick={reset} className="text-slate-300 hover:text-rose-500 rounded-full">
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex flex-wrap gap-3 mb-6">
          {[...Array(8)].map((_, i) => (
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
        </div>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-2 bg-slate-50 rounded-full overflow-hidden border border-slate-100">
            <motion.div 
              className="h-full bg-gradient-to-r from-blue-400 to-blue-600"
              initial={{ width: 0 }}
              animate={{ width: `${(glasses / 8) * 100}%` }}
              transition={{ type: "spring", stiffness: 100 }}
            />
          </div>
          <span className="text-sm font-bold text-slate-700">{Math.round((glasses / 8) * 100)}%</span>
        </div>
      </div>
    </div>
  );
}
