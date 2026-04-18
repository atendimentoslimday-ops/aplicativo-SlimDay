import React from "react";
import { 
  Lock, 
  ShoppingCart, 
  BadgeCheck, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles,
  Droplets,
  CheckCircle2,
  CalendarCheck,
  AlertTriangle,
  ReceiptText
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { recipeImages } from "../../assets/recipes";
import { Label } from "@/components/ui/label";
import { 
  Profile, 
  CycleDay, 
  CyclePhase,
  RecipeDetail 
} from "../../types/slimday";
import { 
  PROMO_PRICE 
} from "../../constants/slimdayData";
import { detectCycleDelay } from "../../utils/slimdayLogic";

interface CycleCalendarProps {
  profile: Profile;
  cycleUnlocked: boolean;
  isTrialActive: boolean;
  trialDaysLeft: number;
  isTrialExpired: boolean;
  currentPrice: number;
  currentPurchaseLink: string;
  cycleOfferState: string;
  onRefuseOffer: () => void;
  onStartTrial: () => void;
  onRefuseLastChance: () => void;
  cycleCalendar: CycleDay[];
  todayKey: string;
  currentDate: Date;
  setCurrentDate: (date: Date) => void;
  updateProfile: <K extends keyof Profile>(key: K, value: Profile[K]) => void;
  verifyAndRefreshCyclePurchase: () => void;
  getPhaseTitle: (phase: CyclePhase) => string;
  cycleTreats: { titulo: string; descricao: string }[];
}

export function CycleCalendar({
  profile,
  cycleUnlocked,
  isTrialActive,
  trialDaysLeft,
  isTrialExpired,
  currentPrice,
  currentPurchaseLink,
  cycleOfferState,
  onRefuseOffer,
  onStartTrial,
  onRefuseLastChance,
  cycleCalendar,
  todayKey,
  currentDate,
  setCurrentDate,
  updateProfile,
  verifyAndRefreshCyclePurchase,
  getPhaseTitle,
  cycleTreats,
}: CycleCalendarProps) {
  const [selectedRecipe, setSelectedRecipe] = React.useState<{ titulo: string; receita: RecipeDetail } | null>(null);
  const [activePopover, setActivePopover] = React.useState<string | null>(null);
  const [tempDate, setTempDate] = React.useState("");
  
  const cycleStatus = detectCycleDelay(profile);
  const phaseColors: Record<CyclePhase, string> = {
    menstruação: "bg-rose-500 text-white shadow-lg shadow-rose-200",
    menstruação_final: "bg-[#38bdf8] text-white shadow-lg shadow-sky-100",
    ovulação: "bg-[#8b5cf6] text-white shadow-lg shadow-violet-100",
    fértil: "bg-rose-100 text-rose-600",
    neutro: "bg-white text-slate-400 border border-slate-50",
  };

  const phaseLabels: Record<CyclePhase, string> = {
    menstruação: "Menstruação",
    menstruação_final: "Final da menstruação",
    ovulação: "Ovulação",
    fértil: "Janela fértil",
    neutro: "Neutro",
  };

  function handlePeriodStart(dateKey: string) {
    updateProfile("ultimoCiclo", dateKey);
    setActivePopover(null);
  }

  function handlePeriodEnd(dateKey: string) {
    if (!profile.ultimoCiclo) return;
    const start = new Date(`${profile.ultimoCiclo}T12:00:00`);
    const end = new Date(`${dateKey}T12:00:00`);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return;

    // Limitar duração da menstruação entre 1 e 12 dias para estabilidade visual
    const diffDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const safeDays = Math.min(Math.max(1, diffDays), 12);
    
    updateProfile("duracaoMenstruacao", String(safeDays));
    setActivePopover(null);
  }

  function handlePeriodNotCame() {
    if (!profile.ultimoCiclo) return;
    const start = new Date(`${profile.ultimoCiclo}T12:00:00`);
    start.setDate(start.getDate() + 1);
    
    const newDateKey = start.toISOString().split("T")[0];
    updateProfile("ultimoCiclo", newDateKey);
    setActivePopover(null);
  }

  function handlePeriodContinuing(dateKey: string) {
    if (!profile.ultimoCiclo) return;
    const start = new Date(`${profile.ultimoCiclo}T12:00:00`);
    const current = new Date(`${dateKey}T12:00:00`);
    if (isNaN(start.getTime()) || isNaN(current.getTime())) return;

    const diffDays = Math.ceil((current.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const currentDuration = Number(profile.duracaoMenstruacao) || 0;
    
    // Limitar extensão máxima para 12 dias
    if (diffDays > currentDuration) {
      const safeDays = Math.min(diffDays, 12);
      updateProfile("duracaoMenstruacao", String(safeDays));
    }
    setActivePopover(null);
  }

  return (
    <Card className="rounded-[40px] border-none shadow-premium bg-[#fffcfd]">
      <CardHeader className="p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-3xl font-serif italic text-slate-900">Calendário menstrual premium</CardTitle>
            <CardDescription className="text-slate-500 font-light">
              Rastreamento hormonal interativo. Clique em um dia para registrar seu ciclo.
            </CardDescription>
          </div>
          {cycleUnlocked && (
             <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Duração do Ciclo</p>
                  <p className="font-bold text-slate-900">{profile.duracaoCiclo} dias</p>
                </div>
                <div className="h-10 w-[1px] bg-slate-100 mx-2" />
                <div className="text-right">
                  <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Fluxo Médio</p>
                  <p className="font-bold text-slate-900">{profile.duracaoMenstruacao} dias</p>
                </div>
             </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="p-8 pt-0 space-y-10">
        {(!cycleUnlocked && !isTrialActive) ? (
          <div className="grid gap-8 lg:grid-cols-[1.1fr,0.9fr]">
            <div className="rounded-[40px] border border-rose-100 bg-white p-10 space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-rose-600">
                <Lock className="h-4 w-4" /> Bônus premium bloqueado
              </div>
              <h3 className="text-4xl font-serif italic text-slate-900 leading-tight">Desbloqueie seu Calendário de Ciclo+</h3>
              <p className="text-slate-600 font-light leading-relaxed">
                Tenha acesso a um calendário personalizado com fases coloridas, previsão estimada da ovulação, janela fértil e sugestões de docinhos fit.
              </p>
              <div className="grid gap-4 md:grid-cols-2">
                {[
                  { t: "Fases visuais", d: "Coloração didática para cada fase do seu mês." },
                  { t: "Docinhos Fit", d: "Sugestões de lanches para cada fase hormonal." }
                ].map((f, i) => (
                  <div key={i} className="rounded-3xl bg-slate-50 p-6 space-y-2">
                    <p className="font-bold text-slate-900">{f.t}</p>
                    <p className="text-xs text-slate-500 leading-relaxed">{f.d}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[40px] bg-slate-900 p-10 text-white flex flex-col justify-center text-center">
              {isTrialActive && (
                <div className="mb-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-4">
                  <p className="text-xs font-bold uppercase tracking-widest text-emerald-400">🎁 Teste Ativo</p>
                  <p className="text-lg font-serif italic mt-1">{trialDaysLeft} dias restantes</p>
                </div>
              )}
              {cycleOfferState === "trial_offer" && (
                <div className="mb-6 rounded-2xl bg-rose-500/10 border border-rose-500/20 p-4">
                  <p className="text-xs font-bold text-rose-400 uppercase tracking-widest mb-1">Oferta Especial</p>
                  <p className="text-sm font-light text-slate-300">Você recusou o desconto. Que tal testar por 7 dias grátis?</p>
                </div>
              )}
              <p className="text-rose-400 text-sm font-bold uppercase tracking-[4px] mb-2">
                {cycleOfferState === "last_chance" ? "Última Chance" : "Acesso Vitalício"}
              </p>
              <div className="text-5xl font-serif italic mb-8">
                R$ {currentPrice.toFixed(2).replace(".", ",")}
              </div>
              
              <div className="space-y-4">
                <a href={currentPurchaseLink} target="_blank" rel="noopener noreferrer">
                  <Button className="w-full h-16 rounded-2xl bg-rose-500 hover:bg-rose-600 font-bold text-lg shadow-lg shadow-rose-500/20">
                    <ShoppingCart className="mr-3 h-5 w-5" /> 
                    {cycleOfferState === "trial_offer" ? "Comprar por R$ 9,90" : "Adquirir Ciclo+"}
                  </Button>
                </a>

                {cycleOfferState === "initial" && (
                  <button onClick={onRefuseOffer} className="w-full text-xs text-slate-500 hover:text-white transition-colors">
                    Agora não, obrigado
                  </button>
                )}

                {cycleOfferState === "trial_offer" && (
                  <Button onClick={onStartTrial} variant="outline" className="w-full h-14 rounded-2xl border-white/20 text-white hover:bg-white/10 font-bold">
                    Testar 7 dias grátis
                  </Button>
                )}

                {cycleOfferState === "last_chance" && (
                  <button onClick={onRefuseLastChance} className="w-full text-xs text-slate-500 hover:text-white transition-colors">
                    Não quero, pode subir o preço
                  </button>
                )}
              </div>

              <button 
                onClick={verifyAndRefreshCyclePurchase}
                className="mt-8 text-sm text-slate-400 hover:text-white transition-colors underline underline-offset-4"
              >
                Já comprei — verificar acesso
              </button>
            </div>
          </div>
        ) : !profile.ultimoCiclo ? (
          <div className="animate-in fade-in zoom-in-95 duration-700">
             <Card className="rounded-[40px] border-none shadow-premium bg-white p-12 text-center max-w-2xl mx-auto border-2 border-rose-50">
                <div className="mx-auto h-24 w-24 rounded-full bg-rose-50 flex items-center justify-center mb-8">
                   <CalendarCheck className="h-12 w-12 text-rose-500" />
                </div>
                <h3 className="text-4xl font-serif italic mb-4">Configuração Inicial</h3>
                <p className="text-slate-500 font-light mb-10 text-lg">
                   Para começarmos a mapear sua jornada, precisamos saber: <br/> 
                   <span className="font-bold text-slate-900">Em que dia iniciou sua última menstruação?</span>
                </p>
                <div className="max-w-xs mx-auto space-y-6">
                   <div className="space-y-2 text-left">
                      <Label className="text-[10px] uppercase font-bold tracking-[3px] text-slate-400 ml-1">Data de Início</Label>
                      <input 
                        type="date" 
                        className="h-16 w-full rounded-2xl border border-slate-100 bg-slate-50 px-6 font-bold text-slate-900 focus:bg-white focus:border-rose-400 focus:ring-rose-200"
                        value={tempDate}
                        onChange={(e) => setTempDate(e.target.value)}
                      />
                   </div>
                   <Button 
                     className="w-full h-16 rounded-2xl bg-rose-500 hover:bg-rose-600 font-bold text-lg shadow-lg disabled:opacity-50"
                     disabled={!tempDate}
                     onClick={() => handlePeriodStart(tempDate)}
                   >
                     Confirmar Data
                   </Button>
                   <p className="text-xs text-slate-400 italic font-light">
                      Dica: Use o dia que o fluxo começou. Você poderá ajustar depois se precisar.
                   </p>
                </div>
             </Card>
          </div>
        ) : (
          <div className="space-y-10 animate-in fade-in zoom-in-95 duration-500">
            <div className="grid gap-8 lg:grid-cols-[1.2fr,0.8fr]">
              <Card className="rounded-[40px] border-none shadow-premium bg-white p-8 overflow-hidden relative">
                <div className="flex items-center justify-between mb-8">
                  <div className="space-y-1">
                    <h3 className="text-2xl font-serif italic text-slate-900">Seu Calendário</h3>
                    <p className="text-[11px] font-bold uppercase tracking-[2px] text-rose-400">
                      {currentDate.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
                    </p>
                  </div>
                  <div className="flex gap-2 bg-slate-50 p-1.5 rounded-2xl">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-10 w-10 text-slate-500" 
                      onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-10 w-10 text-slate-500" 
                      onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
                    >
                      <ChevronRight className="h-5 w-5" />
                    </Button>
                  </div>
                </div>

                {/* Legenda das Cores */}
                <div className="flex flex-wrap gap-2 mb-8">
                   {(["menstruação", "menstruação_final", "ovulação", "fértil"] as CyclePhase[]).map(phase => (
                     <Badge key={phase} className={`${phaseColors[phase]} border-none px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider`}>
                       {phaseLabels[phase]}
                     </Badge>
                   ))}
                </div>
                
                <div className="grid grid-cols-7 gap-1 relative">
                  {["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "Sáb"].map((d) => (
                    <div key={d} className="text-center text-[10px] font-bold uppercase text-slate-300 py-4">{d}</div>
                  ))}
                  
                  {cycleCalendar.map((day) => (
                    <Popover 
                      key={day.dateKey}
                      open={activePopover === day.dateKey}
                      onOpenChange={(open) => setActivePopover(open ? day.dateKey : null)}
                    >
                      <PopoverTrigger asChild disabled={day.dayNumber === 0}>
                        <div className={`relative aspect-square flex items-center justify-center ${day.dayNumber !== 0 ? "cursor-pointer group" : "opacity-0 pointer-events-none"}`}>
                          {day.dayNumber !== 0 && (
                            <>
                              <motion.div 
                                whileHover={{ scale: 1.15 }}
                                whileTap={{ scale: 0.95 }}
                                className={`
                                  w-10 h-10 rounded-full flex flex-col items-center justify-center transition-all
                                  ${phaseColors[day.phase]}
                                  ${day.dateKey === todayKey ? "ring-2 ring-emerald-400 ring-offset-2 z-10" : ""}
                                  ${day.phase === "neutro" ? "hover:border-rose-200" : ""}
                                `}
                              >
                                <span className="text-sm font-bold">{day.dayNumber}</span>
                              </motion.div>
                              {day.dateKey === todayKey && (
                                <div className="absolute -top-1 right-2 w-2 h-2 bg-emerald-400 rounded-full border border-white" />
                              )}
                            </>
                          )}
                        </div>
                      </PopoverTrigger>
                      <PopoverContent 
                        className="w-56 p-2 rounded-[32px] border-rose-100 shadow-2xl bg-white focus:outline-none"
                        side="top"
                        align="center"
                        sideOffset={10}
                      >
                        <div className="p-3 space-y-2">
                           <p className="text-[9px] uppercase font-bold tracking-widest text-slate-400 mb-2 border-b border-slate-50 pb-2">Registrar {day.dayNumber}</p>
                           <Button 
                             variant="ghost" 
                             className="w-full justify-start h-11 rounded-2xl hover:bg-rose-50 hover:text-rose-600 font-bold text-xs gap-3"
                             onClick={() => handlePeriodStart(day.dateKey)}
                           >
                             <Droplets className="h-4 w-4 text-rose-500" /> Menstruação desceu
                           </Button>
                           <Button 
                             variant="ghost" 
                             className="w-full justify-start h-11 rounded-2xl hover:bg-rose-50 hover:text-rose-600 font-bold text-xs gap-3"
                             onClick={() => handlePeriodContinuing(day.dateKey)}
                           >
                             <CalendarCheck className="h-4 w-4 text-rose-300" /> Continua descendo
                           </Button>
                           <Button 
                             variant="ghost" 
                             className="w-full justify-start h-11 rounded-2xl hover:bg-rose-50 hover:text-rose-600 font-bold text-xs gap-3"
                             onClick={() => handlePeriodNotCame()}
                           >
                             <AlertTriangle className="h-4 w-4 text-amber-500" /> Menstruação não desceu
                           </Button>
                           <Button 
                             variant="ghost" 
                             className="w-full justify-start h-11 rounded-2xl hover:bg-rose-50 hover:text-rose-600 font-bold text-xs gap-3"
                             onClick={() => handlePeriodEnd(day.dateKey)}
                           >
                             <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Parou de descer
                           </Button>
                        </div>
                      </PopoverContent>
                    </Popover>
                  ))}
                </div>
              </Card>

              <div className="space-y-6">
                <Card className="rounded-[40px] border-none shadow-premium bg-gradient-to-br from-rose-500 to-fuchsia-600 text-white p-10 overflow-hidden relative group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-3xl rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform" />
                  <div className="relative z-10">
                    <p className="text-[10px] uppercase font-bold tracking-[4px] text-rose-100 mb-6 font-medium">Fase Hormonal Ativa</p>
                    <h4 className="text-4xl font-serif italic mb-4 capitalize leading-tight">
                      {cycleStatus.isDelayed ? "Ciclo Atípico" : (cycleCalendar.find(d => d.dateKey === todayKey)?.label || "Fase de Estabilidade")}
                    </h4>
                    <p className="text-white text-sm font-light leading-relaxed">
                      {cycleStatus.isDelayed ? (
                        <span className="font-bold flex items-center gap-2">
                           <AlertTriangle className="h-5 w-5 text-amber-300" /> {cycleStatus.message}
                        </span>
                      ) : (
                        <>Seu corpo está em um momento de <span className="font-bold italic">{cycleCalendar.find(d => d.dateKey === todayKey)?.phase || "equilíbrio"}</span>. Siga as dicas nutricionais abaixo.</>
                      )}
                    </p>
                  </div>
                </Card>
                
                <div className="grid gap-4">
                   <p className="text-[10px] uppercase font-bold tracking-[3px] text-slate-400 ml-2">Docinhos & Ajustes Fit</p>
                  {cycleTreats.map((item, i) => (
                    <motion.div 
                      key={i} 
                      whileHover={{ x: 5 }}
                      onClick={() => setSelectedRecipe(selectedRecipe?.titulo === item.titulo ? null : item)}
                      className="bg-white p-6 rounded-[32px] border border-slate-50 shadow-sm flex flex-col gap-4 group cursor-pointer"
                    >
                      <div className="flex items-center gap-5">
                        <div className="h-20 w-24 rounded-2xl overflow-hidden shrink-0">
                           <img 
                             src={recipeImages[item.titulo]} 
                             alt={item.titulo}
                             className="w-full h-full object-cover"
                           />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="font-bold text-slate-900 text-base">{item.titulo}</p>
                            <ReceiptText className={`h-4 w-4 transition-colors ${selectedRecipe?.titulo === item.titulo ? "text-rose-500" : "text-slate-200"}`} />
                          </div>
                          <p className="text-[11px] text-slate-400 mt-1 leading-relaxed capitalize font-medium">{item.descricao}</p>
                        </div>
                      </div>

                      <AnimatePresence>
                        {selectedRecipe?.titulo === item.titulo && (
                          <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden border-t border-slate-50 pt-4 space-y-4"
                          >
                             <div>
                                <p className="text-[9px] uppercase font-bold tracking-widest text-slate-300 mb-2">Ingredientes</p>
                                <ul className="space-y-1">
                                   {item.receita.ingredientes.map((ing, idx) => (
                                     <li key={idx} className="text-xs text-slate-500 flex items-center gap-2">
                                        <div className="w-1 h-1 rounded-full bg-rose-300" /> {ing}
                                     </li>
                                   ))}
                                </ul>
                             </div>
                             <div>
                                <p className="text-[9px] uppercase font-bold tracking-widest text-slate-300 mb-2">Preparo</p>
                                <div className="space-y-2">
                                  {item.receita.preparo.map((step, idx) => (
                                    <p key={idx} className="text-[11px] text-slate-500 leading-relaxed">
                                       <span className="font-serif italic text-rose-400 mr-1">{idx+1}.</span> {step}
                                    </p>
                                  ))}
                                </div>
                             </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
