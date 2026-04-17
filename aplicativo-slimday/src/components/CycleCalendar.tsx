import React, { useMemo } from "react";
import { 
  ChevronLeft, ChevronRight, Info, AlertCircle, Heart, Sparkles, Youtube,
  Lock, CalendarDays, CheckCircle2, Star, Utensils
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Profile, CycleDay, CyclePhase } from "@/data/types";
import { phaseTreats } from "@/data/recipes";

// Helper logic moved here for modularity
export function toDateKey(date: Date) {
  const d = new Date(date);
  d.setHours(0,0,0,0);
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
}

export function buildCycleCalendar(profile: Profile, baseDate: Date, totalDays: number = 35): CycleDay[] {
  const lastDate = profile.ultimoCiclo ? new Date(`${profile.ultimoCiclo}T12:00:00`) : new Date();
  const cycleLen = parseInt(profile.duracaoCiclo || "28") || 28;
  const periodLen = parseInt(profile.duracaoMenstruacao || "5") || 5;
  
  const calendar: CycleDay[] = [];
  for (let i = 0; i < totalDays; i++) {
    const d = new Date(baseDate);
    d.setDate(d.getDate() + i);
    const key = toDateKey(d);
    
    const diffDays = Math.floor((d.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
    const dayInCycle = ((diffDays % cycleLen) + cycleLen) % cycleLen;
    
    let phase: CyclePhase = "neutro";
    let label = "Fase neutra";
    
    if (dayInCycle < Math.ceil(periodLen / 2)) { 
      phase = "menstruacao"; 
      label = "Menstruação"; 
    } else if (dayInCycle < periodLen) { 
      phase = "menstruacao_final"; 
      label = "Final da menstruação"; 
    } else if (dayInCycle >= cycleLen - 16 && dayInCycle <= cycleLen - 13) { 
      phase = "fertil"; 
      label = "Janela fértil"; 
    }
    
    if (dayInCycle === cycleLen - 14) { 
      phase = "ovulacao"; 
      label = "Ovulação estimada"; 
    }
    
    calendar.push({ dateKey: key, dayNumber: d.getDate(), phase, label });
  }
  return calendar;
}

export function getPhaseColor(phase: CyclePhase) {
  switch (phase) {
    case "menstruacao": return "bg-rose-500 text-white border-rose-500 shadow-rose-200";
    case "menstruacao_final": return "bg-sky-400 text-white border-sky-400 shadow-sky-100";
    case "ovulacao": return "bg-violet-500 text-white border-violet-500 shadow-violet-200";
    case "fertil": return "bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200 shadow-sm";
    default: return "bg-white text-slate-700 border-slate-200";
  }
}

export function getPhaseTitle(phase: CyclePhase) {
  switch (phase) {
    case "menstruacao": return "Menstruação";
    case "menstruacao_final": return "Final da menstruação";
    case "ovulacao": return "Ovulação estimada";
    case "fertil": return "Janela fértil";
    default: return "Fase neutra";
  }
}

interface CycleCalendarProps {
  profile: Profile;
  currentDate: Date;
  isUnlocked: boolean;
  onUnlock: () => void;
}

export function CycleCalendar({ profile, currentDate, isUnlocked, onUnlock }: CycleCalendarProps) {
  const calendar = useMemo(() => buildCycleCalendar(profile, currentDate), [profile, currentDate]);
  const todayKey = toDateKey(currentDate);
  const currentDay = calendar.find(d => d.dateKey === todayKey) || calendar[0];
  const treats = phaseTreats[currentDay.phase] || phaseTreats.neutro;

  if (!profile.ultimoCiclo && isUnlocked) {
    return (
      <Card className="rounded-[32px] border-none shadow-premium bg-white p-8 text-center max-w-lg mx-auto">
        <CalendarDays className="h-16 w-16 text-rose-200 mx-auto mb-6" />
        <h3 className="text-2xl font-serif italic mb-4">Seu Calendário Ciclo+</h3>
        <p className="text-slate-500 font-light leading-relaxed mb-6">
          Para ver suas fases, precisamos saber a data da sua última menstruação. Atualize seu perfil ao lado!
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-serif italic mb-2 text-slate-900">Ciclo SlimDay</h2>
          <p className="text-slate-700 font-light text-sm">Harmonia entre seu metabolismo e seus hormônios.</p>
        </div>
        {!isUnlocked && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-amber-50 text-amber-600 border border-amber-100 text-xs font-bold uppercase tracking-widest">
            <Lock className="h-4 w-4" /> Conteúdo Premium
          </div>
        )}
      </header>

      <div className="grid gap-8 lg:grid-cols-[1fr,340px]">
        <div className="space-y-6">
          <Card className="rounded-[40px] border-none shadow-premium bg-white p-2 relative overflow-hidden">
            {!isUnlocked && (
              <div className="absolute inset-0 z-20 bg-white/60 backdrop-blur-[2px] flex items-center justify-center p-8 text-center">
                <div className="max-w-xs scale-90 md:scale-100">
                  <div className="mx-auto h-20 w-20 rounded-full bg-rose-50 flex items-center justify-center mb-6">
                    <Lock className="h-10 w-10 text-rose-600" />
                  </div>
                  <h3 className="text-2xl font-serif italic mb-3 text-slate-900">Ciclo+ Bloqueado</h3>
                  <p className="text-sm text-slate-700 mb-6 leading-relaxed">Visualize suas fases hormonais, tpm e receba recomendações exclusivas de alimentação.</p>
                  <Button onClick={onUnlock} className="w-full h-14 rounded-2xl bg-primary hover:bg-rose-700 font-bold shadow-xl shadow-rose-200">
                    Desbloquear Agora
                  </Button>
                </div>
              </div>
            )}
            
            <div className="p-6 grid grid-cols-7 gap-1">
              {['S', 'T', 'Q', 'Q', 'S', 'S', 'D'].map((d, i) => (
                <div key={i} className="text-center text-[10px] font-bold text-slate-600 py-3 uppercase">{d}</div>
              ))}
              {calendar.map((day, i) => {
                const color = getPhaseColor(day.phase);
                const isToday = day.dateKey === todayKey;
                return (
                  <div key={i} className="aspect-square flex flex-col items-center justify-center p-1 relative">
                    {isToday && <div className="absolute inset-1 rounded-2xl border-2 border-primary/20 animate-pulse" />}
                    <div className={`h-full w-full rounded-2xl flex items-center justify-center text-sm font-bold border transition-all ${color} ${isToday ? 'scale-110 shadow-lg' : 'scale-90 opacity-80'}`}>
                      {day.dayNumber}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {isUnlocked && (
             <Card className="rounded-[32px] border-none shadow-premium bg-rose-50/50 p-8 overflow-hidden relative">
               <div className="absolute -right-8 -top-8 text-rose-100 opacity-30">
                 <Sparkles className="h-40 w-40" />
               </div>
               <div className="relative z-10">
                 <div className="flex items-center gap-3 mb-4">
                   <div className={`h-3 w-3 rounded-full ${getPhaseColor(currentDay.phase).split(' ')[0]}`} />
                   <h3 className="text-2xl font-serif italic text-slate-900">Hoje: {getPhaseTitle(currentDay.phase)}</h3>
                 </div>
                 <p className="text-slate-700 text-sm leading-relaxed max-w-lg mb-6">
                   Suas recomendações de treino e menu de hoje já estão ajustadas para esta fase do seu ciclo, favorecendo seu bem-estar e resultados.
                 </p>
                 <HealthGuideModal open={false} onOpenChange={() => {}} />
               </div>
             </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card className={`rounded-[32px] border-none shadow-premium bg-white p-8 relative overflow-hidden transition-all ${!isUnlocked ? 'grayscale opacity-50 pointer-events-none' : ''}`}>
            <div className="h-12 w-12 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-600 mb-6">
              <Utensils className="h-6 w-6" />
            </div>
            <h4 className="text-xl font-serif italic mb-2 text-slate-900">Docinho Fit: Alívio TPM</h4>
            <p className="text-xs text-slate-600 mb-6 leading-relaxed">
              Sugestões exclusivas para quando a vontade de doce aperta.
            </p>

            <div className="space-y-4">
              {treats.map((treat, i) => (
                <div key={i} className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <p className="font-bold text-sm text-slate-900">{treat.titulo}</p>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{treat.descricao}</p>
                </div>
              ))}
            </div>
            {!isUnlocked && <div className="absolute inset-0 bg-white/20" />}
          </Card>

          <Card className="rounded-[32px] border-none shadow-premium bg-gradient-to-br from-primary/5 to-rose-500/10 p-6 flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center text-primary shadow-sm">
              <Star className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-600">Dica da Especialista</p>
              <p className="text-xs font-medium text-slate-900 mt-0.5">Mantenha a hidratação alta nesta fase!</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export function HealthGuideModal({ open, onOpenChange }: { open: boolean, onOpenChange: (v: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="link" className="text-primary p-0 h-auto font-bold flex items-center gap-2">
          Ver guia completo <Info className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl sm:rounded-[32px] p-0 border-none bg-rose-50 overflow-hidden">
        <div className="bg-rose-600 p-8 text-white relative">
          <Heart className="absolute top-6 right-6 h-12 w-12 text-white/20" />
          <h2 className="text-3xl font-serif italic mb-2">Guia da Saúde Feminina</h2>
          <p className="text-rose-100/90 text-sm">Entenda como o SlimDay trabalha com seu ritmo biological.</p>
        </div>
        
        <ScrollArea className="max-h-[70vh] p-8">
          <div className="space-y-8">
            <section className="space-y-4">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-rose-500" />
                Sincronização Metabólica
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Durante o ciclo, seus níveis hormonais oscilam, alterando sua taxa metabólica basal, força muscular e retenção de líquidos. O SlimDay ajusta seu treino e alimentação para cada fase.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="bg-white p-4 rounded-2xl border border-rose-100 shadow-sm">
                  <p className="font-bold text-rose-600 text-sm mb-1">Fase Folicular</p>
                  <p className="text-[11px] text-slate-500">Energia em alta. Momento ideal para treinos intensos e hipertrofia.</p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-rose-100 shadow-sm">
                  <p className="font-bold text-rose-600 text-sm mb-1">Fase Lútea</p>
                  <p className="text-[11px] text-slate-500">Metabolismo acelerado. Foco em controle calórico e treinos moderados.</p>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-rose-500" />
                Vontade de Doces na TPM
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Sua queda de serotonina pré-menstrual causa desejo por açúcar. Sugerimos nossos "Docinhos Fit" exclusivos carregados de magnésio e triptofano para saciar sem boicotar sua dieta.
              </p>
            </section>

            <section className="bg-white p-6 rounded-[24px] shadow-sm border border-rose-100 border-dashed">
              <p className="text-sm text-rose-700/80 leading-relaxed italic">
                Nossa tecnologia estima suas fases, mas cada corpo é único. <strong>Sempre atualize</strong> a data exata que sua menstruação começou e terminou para que o app aprenda o seu padrão real.
              </p>
            </section>

            <Button 
              className="w-full h-14 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-base shadow-xl"
              onClick={() => onOpenChange(false)}
            >
              Entendido!
            </Button>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
