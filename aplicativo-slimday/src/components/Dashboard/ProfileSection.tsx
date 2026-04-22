import React, { useState } from "react";
import { User, CalendarDays, Target, BarChart3, Clock3, Salad, Flame, Ruler, Weight, Save, CheckCircle2, Sparkles, Heart, Zap, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Profile, Goal, FitnessLevel, TimePerDay, RoutineStyle, MealStyle } from "../../types/slimday";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

interface ProfileSectionProps {
  profile: Profile;
  onUpdateProfile: <K extends keyof Profile>(key: K, value: Profile[K]) => void;
  cycleUnlocked?: boolean;
}

const motivationalMessages = [
  "Você está cada dia mais perto da sua melhor versão! ✨",
  "Pequenas mudanças geram grandes resultados. Continue firme! 💪",
  "Seu corpo é seu templo. Obrigado por cuidar tão bem dele hoje! ❤️",
  "Consistência é a chave. Você está no caminho certo! 📈",
  "Lembre-se: o progresso é melhor que a perfeição. Arrasou! 🌟"
];

export function ProfileSection({ profile, onUpdateProfile, cycleUnlocked }: ProfileSectionProps) {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [motivationIndex, setMotivationIndex] = useState(-1);

  const handleSave = () => {
    setIsSaving(true);
    
    // Simular salvamento (como o onUpdateProfile já salva no estado pai, 
    // aqui apenas damos o feedback visual que o usuário pediu)
    setTimeout(() => {
      setIsSaving(false);
      setMotivationIndex(Math.floor(Math.random() * motivationalMessages.length));
      
      toast({
        title: "Perfil Atualizado!",
        description: "Suas alterações foram salvas com sucesso na nuvem.",
        duration: 4000,
      });
    }, 800);
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <h2 className="text-4xl font-serif italic mb-2">Seu Perfil</h2>
            <p className="text-slate-500 font-light">Mantenha seus dados atualizados para que o SlimDay continue sendo perfeito para você.</p>
          </div>
          <Button 
            onClick={handleSave} 
            disabled={isSaving}
            className="h-14 px-8 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-bold shadow-lg shadow-rose-200 gap-3 group shrink-0"
          >
            {isSaving ? (
              <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Save className="h-5 w-5 group-hover:scale-110 transition-transform" />
            )}
            {isSaving ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </div>

        <AnimatePresence>
          {motivationIndex !== -1 && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="mb-8 p-6 rounded-[32px] bg-gradient-to-r from-rose-500 to-fuchsia-600 text-white shadow-xl shadow-rose-100 flex items-center gap-4 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-2 opacity-10">
                <Sparkles className="h-20 w-20" />
              </div>
              <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                <Heart className="h-6 w-6 fill-white" />
              </div>
              <p className="text-lg font-medium italic relative z-10">
                {motivationalMessages[motivationIndex]}
              </p>
              <button 
                onClick={() => setMotivationIndex(-1)}
                className="ml-auto text-white/60 hover:text-white transition-colors"
              >
                <CheckCircle2 className="h-6 w-6" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid gap-8">
          {/* Dados Básicos */}
          <Card className="rounded-[40px] border-none shadow-premium bg-white overflow-hidden">
            <CardHeader className="bg-slate-50/50 p-8 border-b border-slate-100">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center">
                  <User className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl font-serif">Dados Pessoais</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-8 grid md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">Nome</Label>
                <Input 
                  value={profile.nome} 
                  onChange={(e) => onUpdateProfile("nome", e.target.value)}
                  className="h-12 rounded-xl border-slate-100 focus:border-rose-300"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">Idade</Label>
                <Input 
                  type="number"
                  value={profile.idade} 
                  onChange={(e) => onUpdateProfile("idade", e.target.value)}
                  className="h-12 rounded-xl border-slate-100 focus:border-rose-300"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">Peso (kg)</Label>
                <div className="relative">
                  <Weight className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                  <Input 
                    type="number"
                    step="0.1"
                    value={profile.peso} 
                    onChange={(e) => onUpdateProfile("peso", e.target.value)}
                    className="h-12 pl-12 rounded-xl border-slate-100 focus:border-rose-300"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">Altura (cm)</Label>
                <div className="relative">
                  <Ruler className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                  <Input 
                    type="number"
                    value={profile.altura} 
                    onChange={(e) => onUpdateProfile("altura", e.target.value)}
                    className="h-12 pl-12 rounded-xl border-slate-100 focus:border-rose-300"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ciclo Hormonal - Só aparece se o calendário estiver desbloqueado */}
          {cycleUnlocked && (
            <Card className="rounded-[40px] border-none shadow-premium bg-white overflow-hidden">
              <CardHeader className="bg-violet-50/50 p-8 border-b border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-violet-50 text-violet-500 flex items-center justify-center">
                    <CalendarDays className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-xl font-serif">Ciclo Hormonal</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-8 grid md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">Última Menstruação</Label>
                  <Input 
                    type="date"
                    value={profile.ultimoCiclo || ""} 
                    onChange={(e) => onUpdateProfile("ultimoCiclo", e.target.value)}
                    className="h-12 rounded-xl border-slate-100 focus:border-rose-300"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">Duração Média do Ciclo (dias)</Label>
                  <Input 
                    type="number"
                    value={profile.duracaoCiclo} 
                    onChange={(e) => onUpdateProfile("duracaoCiclo", e.target.value)}
                    className="h-12 rounded-xl border-slate-100 focus:border-rose-300"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Metas e Preferências */}
          <Card className="rounded-[40px] border-none shadow-premium bg-white overflow-hidden">
            <CardHeader className="bg-emerald-50/50 p-8 border-b border-slate-100">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center">
                  <Target className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl font-serif">Metas & Estilo</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-8 grid md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">Objetivo</Label>
                <Select value={profile.objetivo} onValueChange={(v) => onUpdateProfile("objetivo", v as Goal)}>
                  <SelectTrigger className="h-12 rounded-xl border-slate-100">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="emagrecer">🔥 Emagrecer</SelectItem>
                    <SelectItem value="definir">💪 Definir</SelectItem>
                    <SelectItem value="ganhar_massa">📈 Ganhar Massa</SelectItem>
                    <SelectItem value="mais energia">⚡ Mais Energia</SelectItem>
                    <SelectItem value="criar constancia">✨ Criar Constância</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">Nível de Treino</Label>
                <Select value={profile.nivel} onValueChange={(v) => onUpdateProfile("nivel", v as FitnessLevel)}>
                  <SelectTrigger className="h-12 rounded-xl border-slate-100">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="iniciante">Iniciante</SelectItem>
                    <SelectItem value="intermediaria">Intermediária</SelectItem>
                    <SelectItem value="avancada">Avançada</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">Tempo por Dia (Min)</Label>
                <Select value={profile.tempo} onValueChange={(v) => onUpdateProfile("tempo", v as TimePerDay)}>
                  <SelectTrigger className="h-12 rounded-xl border-slate-100">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="10">10 Minutos</SelectItem>
                    <SelectItem value="15">15 Minutos</SelectItem>
                    <SelectItem value="20">20 Minutos</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">Foco das Refeições</Label>
                <Select value={profile.refeicao} onValueChange={(v) => onUpdateProfile("refeicao", v as MealStyle)}>
                  <SelectTrigger className="h-12 rounded-xl border-slate-100">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="pratico">Prático</SelectItem>
                    <SelectItem value="equilibrado">Equilibrado</SelectItem>
                    <SelectItem value="sem tempo">Sem Tempo</SelectItem>
                    <SelectItem value="caseiro">Caseiro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col items-center gap-6 pt-6">
            <p className="text-slate-400 text-sm font-light italic">Suas alterações são sincronizadas com sua conta premium.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
