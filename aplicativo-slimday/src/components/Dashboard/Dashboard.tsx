import React from "react";
import { 
  Trophy, 
  Flame, 
  Sparkles, 
  BarChart3, 
  CheckCircle2, 
  RefreshCcw,
  ShoppingCart,
  Zap,
  ChevronRight,
  Cloud,
  CalendarCheck
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Profile, SyncStatus } from "../../types/slimday";
import { PROMO_LINK } from "../../constants/slimdayData";

interface DashboardProps {
  profile: Profile;
  streak: number;
  dayMessage: { title: string; body: string };
  syncStatus: SyncStatus;
  progress: number;
  completedCount: number;
  totalCount: number;
  resetDay: () => void;
  getProfileSummary: (profile: Profile) => string;
  cycleUnlocked: boolean;
  onOpenCalendar: () => void;
  cycleOfferState: string;
  onRefuseOffer: () => void;
  onStartTrial: () => void;
  trialDaysLeft: number;
}

export function Dashboard({
  profile,
  streak,
  dayMessage,
  syncStatus,
  progress,
  completedCount,
  totalCount,
  resetDay,
  getProfileSummary,
  cycleUnlocked,
  onOpenCalendar,
  cycleOfferState,
  onRefuseOffer,
  onStartTrial,
  trialDaysLeft
}: DashboardProps) {
  return (
    <div className="space-y-8 mb-12">
      {/* Header com Status */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-serif italic text-slate-900 leading-tight">
            Olá, <span className="text-rose-500">{profile.nome || "Ingride"}</span>
          </h1>
          <p className="text-slate-500 font-light max-w-md">
            {dayMessage.body}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          {/* Indicador de Sincronização Híbrida */}
          <div className="bg-white border-white shadow-premium rounded-[32px] px-4 py-4 flex items-center gap-3">
             <div className={`h-8 w-8 rounded-full flex items-center justify-center transition-colors duration-500 ${
               syncStatus === "saving" ? "bg-orange-50 text-orange-400 animate-spin" :
               syncStatus === "synced" ? "bg-emerald-50 text-emerald-500" :
               syncStatus === "error" ? "bg-rose-50 text-rose-500" :
               "bg-slate-50 text-slate-300"
             }`}>
                {syncStatus === "saving" ? <RefreshCcw className="h-4 w-4" /> :
                 syncStatus === "synced" ? <CheckCircle2 className="h-4 w-4" /> :
                 <Cloud className="h-4 w-4" />}
             </div>
             <div className="hidden sm:block">
               <p className="text-[9px] uppercase font-bold tracking-widest text-slate-400 leading-none mb-1">Status</p>
               <p className="text-[11px] font-bold text-slate-600 leading-none">
                 {syncStatus === "saving" ? "Salvando Nuvem..." :
                  syncStatus === "synced" ? "Sincronizado" :
                  syncStatus === "error" ? "Erro de Conexão" :
                  "Salvo Localmente"}
               </p>
             </div>
          </div>

          <div className="bg-white border-white shadow-premium rounded-[32px] px-6 py-4 flex items-center gap-4">
             <div className="h-12 w-12 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center">
                <Flame className="h-6 w-6" />
             </div>
             <div>
               <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Sequência</p>
               <p className="text-xl font-bold text-slate-900">{streak} Dias</p>
             </div>
          </div>
          
          <div className="bg-white border-white shadow-premium rounded-[32px] px-6 py-4 flex items-center gap-4">
             <div className="h-12 w-12 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center">
                <BarChart3 className="h-6 w-6" />
             </div>
             <div>
               <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Progresso</p>
               <p className="text-xl font-bold text-slate-900">{progress}%</p>
             </div>
          </div>
        </div>
      </div>

      {/* Banner de Incentivo ao Ciclo+ (Aparece se não tiver comprado) */}
      {!cycleUnlocked && (cycleOfferState === "initial" || cycleOfferState === "trial_offer" || cycleOfferState === "last_chance" || cycleOfferState === "trial_active") && (
        <Card className={`rounded-[40px] border-none shadow-xl overflow-hidden relative group ${
          cycleOfferState === "trial_active" 
            ? "bg-slate-900 text-white" 
            : "bg-gradient-to-r from-rose-500 to-rose-600 text-white shadow-rose-200"
        }`}>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-3xl rounded-full -mr-32 -mt-32 group-hover:scale-110 transition-transform duration-700" />
          <CardContent className="p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
            <div className="flex items-center gap-6">
               <div className={`h-20 w-20 rounded-[32px] flex items-center justify-center shadow-lg transform -rotate-6 group-hover:rotate-0 transition-transform ${
                 cycleOfferState === "trial_active" ? "bg-rose-500 text-white" : "bg-white text-rose-500"
               }`}>
                  {cycleOfferState === "trial_active" ? <CalendarCheck className="h-10 w-10" /> : <Zap className="h-10 w-10 fill-current" />}
               </div>
               <div className="space-y-1">
                 <Badge className={`${cycleOfferState === "trial_active" ? "bg-emerald-500" : "bg-white/20"} text-white border-none mb-2 px-3 py-1 text-[10px] font-black uppercase tracking-widest`}>
                    {cycleOfferState === "trial_active" ? "Teste Grátis Ativo" : cycleOfferState === "last_chance" ? "Última Chance" : "Oferta Exclusiva"}
                 </Badge>
                 <h2 className="text-3xl font-serif italic">
                    {cycleOfferState === "trial_active" ? `Restam ${trialDaysLeft} dias de teste` : cycleOfferState === "trial_offer" ? "Experimente o Ciclo+" : "Desbloqueie o Calendário Ciclo+"}
                 </h2>
                 <p className={`text-sm font-light max-w-sm ${cycleOfferState === "trial_active" ? "text-slate-400" : "text-rose-100"}`}>
                    {cycleOfferState === "trial_active" 
                      ? "Aproveite todas as funções premium. Garanta seu acesso vitalício agora com desconto."
                      : cycleOfferState === "trial_offer"
                      ? "Use todas as ferramentas premium por 7 dias sem pagar nada agora."
                      : "Mapeie suas fases hormonais e receba orientações nutricionais premium."}
                 </p>
               </div>
            </div>
            <div className="flex flex-col gap-3 w-full md:w-auto">
              <Button 
                onClick={() => {
                  if (cycleOfferState === "trial_offer") {
                    onStartTrial();
                  } else {
                    if (typeof window !== "undefined" && (window as any).fbq) {
                      (window as any).fbq("track", "InitiateCheckout");
                    }
                    window.open(PROMO_LINK, "_blank");
                  }
                }}
                className={`h-16 px-10 rounded-2xl font-bold text-lg group shadow-xl ${
                  cycleOfferState === "trial_active" ? "bg-rose-600 text-white hover:bg-rose-700" : "bg-white text-rose-600 hover:bg-rose-50"
                }`}
              >
                 {cycleOfferState === "trial_offer" ? "Começar Teste Grátis" : "Garantir por R$ 9,90"} 
                 <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              {cycleOfferState === "initial" && (
                <button 
                  onClick={onRefuseOffer}
                  className="text-white/60 text-xs hover:text-white transition-colors"
                >
                  Agora não, obrigado
                </button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Grid de Resumo Diário */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="rounded-[40px] border-none shadow-premium bg-gradient-to-br from-rose-100/80 to-white p-8">
           <div className="flex items-center justify-between mb-6">
              <h3 className="font-serif italic text-xl text-slate-900">Metas de Hoje</h3>
              <RefreshCcw className="h-5 w-5 text-rose-300 cursor-pointer hover:rotate-180 transition-transform duration-500" onClick={resetDay} />
           </div>
           <div className="space-y-4">
              <div className="flex justify-between text-sm mb-2">
                 <span className="text-slate-500 font-medium">{completedCount} de {totalCount} concluídos</span>
                 <span className="font-bold text-rose-500">{progress}%</span>
              </div>
              <Progress value={progress} className="h-3 rounded-full bg-white border border-rose-100/50" />
           </div>
        </Card>

        <Card className="rounded-[40px] border-none shadow-premium bg-gradient-to-br from-rose-100/80 to-white p-8 md:col-span-2 flex flex-col justify-center">
           <div className="flex items-center gap-6">
              <div className="h-16 w-16 rounded-[24px] bg-emerald-50 text-emerald-500 flex items-center justify-center">
                 <Sparkles className="h-8 w-8" />
              </div>
              <div className="space-y-1">
                 <p className="text-[10px] uppercase font-bold tracking-[3px] text-slate-400">Foco do Perfil</p>
                 <p className="text-lg font-medium text-slate-800 leading-tight">
                    {getProfileSummary(profile)}
                 </p>
              </div>
           </div>
        </Card>
      </div>
    </div>
  );
}
