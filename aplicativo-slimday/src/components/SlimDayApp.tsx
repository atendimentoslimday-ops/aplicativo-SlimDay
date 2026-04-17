import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { 
  Plus, Trash2, Save, Utensils, Dumbbell, User, CheckCircle2, Circle, Menu, X, ArrowRight, ArrowLeft, Target, Calendar as CalendarIcon, Layout, Bell, Share2, ChevronRight, AlertCircle, Info, HelpCircle, MessageSquare, Heart, Zap, TrendingUp, Award, Clock, Star, Moon, Droplets, Coffee, Apple, Camera, PlusCircle, ArrowUpRight, Check, ShieldCheck, Sparkles, History, Flame, ExternalLink, ChevronDown, Play, ClipboardList, ChevronLeft, Settings, LogOut, Send, Lock, Eye, BookOpen, Clock3, Salad, ChevronUp, Trophy, BadgeCheck, CalendarDays, Waves, Sun, BarChart3, PlayCircle, RefreshCcw, Cloud, CloudOff, ShoppingCart, MessageCircle, Home, BellOff, MapPin
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FitnessLevel, Goal, TimePerDay, MealStyle, RoutineStyle, SyncStatus, CyclePhase, 
  Profile, PlanItem, DayPlan, DailyMessage, NotificationItem, AuthUser, CycleDay, 
  PersistedState, OnboardingStep, RecipeDetail, PlanItemWithRecipe 
} from "@/data/types";
import { recipeBank, phaseTreats } from "@/data/recipes";
import { dailyMessages, buildWorkoutPlan, buildWeekFocus, buildWeekSchedule, getCongratsMessage } from "@/data/exercises";

// New Modular Components
import { OnboardingQuiz } from "./OnboardingQuiz";
import { AuthScreen } from "./AuthScreen";
import { toDateKey, buildCycleCalendar, CycleCalendar } from "./CycleCalendar";
import { WorkoutSection } from "./WorkoutSection";
import { MealSection } from "./MealSection";
import { SupportSection } from "./SupportSection";
import { Dashboard } from "./Dashboard";
import { PersonalizedPlan } from "./PersonalizedPlan";
import WeeklySchedule from "./AgendaSemanal";

const BYPASS_PAYMENT = false; 
const TRIAL_DAYS = 7;
const PROMO_PRICE = "29,90";
const FULL_PRICE = "89,90";
const PROMO_LINK = "https://pay.kirvano.com/a44cda1b-153b-4e9c-85bc-438f8c014322";
const FULL_LINK = "https://pay.kirvano.com/3d0f4079-243d-413d-b5e0-dfde69bb123b";
const APP_SALES_LINK = "https://pay.kirvano.com/e4ad9a8c-bee4-4279-be20-8f39c46c17df";

const defaultProfile: Profile = {
  nome: "", idade: "", altura: "", peso: "", objetivo: "emagrecer",
  nivel: "iniciante", tempo: "15", rotina: "corrida", refeicao: "pratico",
  ultimoCiclo: "", duracaoCiclo: "28", duracaoMenstruacao: "5",
};

const feminineTheme = { "--primary": "#e11d48", "--secondary": "#1e293b" } as React.CSSProperties;

const sanitizeDecimal = (val: string) => (val || "").replace(/[^0-9,.]/g, "").replace(/\./g, ",");
const sanitizeName = (val: string) => (val || "").replace(/[^a-zA-ZáàâãéèêíïóôõúüçÁÀÂÃÉÈÍÏÓÔÕÚÜÇ\s-]/g, "").slice(0, 50);

// Key obfuscation for security
const getXKey = () => (import.meta.env.VITE_MASTER_KEY || "").split('').reverse().join('');
const checkXKey = (input: string) => input.split('').reverse().join('') === getXKey();
const ADMIN_ID = "00000000-0000-0000-0000-000000000000";

const exampleAdminProfile: Profile = {
  nome: "Admin SlimDay", idade: "28", altura: "165", peso: "62", objetivo: "emagrecer",
  nivel: "intermediaria", tempo: "15", rotina: "moderada", refeicao: "equilibrado",
  ultimoCiclo: toDateKey(new Date()), duracaoCiclo: "28", duracaoMenstruacao: "5",
};

export default function SlimDayApp() {
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState("");
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [authNome, setAuthNome] = useState("");
  const [authEmail, setAuthEmail] = useState("");
  const [authSenha, setAuthSenha] = useState("");
  const [authDevCode, setAuthDevCode] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("synced");

  const [profile, setProfile] = useState<Profile>(defaultProfile);
  const [started, setStarted] = useState(false);
  const [completed, setCompleted] = useState<Record<string, boolean>>({});
  const [showCongrats, setShowCongrats] = useState(false);
  const [lastCompletedTitle, setLastCompletedTitle] = useState("");
  const [activeTab, setActiveTab] = useState("hoje");
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [lastActiveDate, setLastActiveDate] = useState<Date>(new Date());
  const [streak, setStreak] = useState(0);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [cycleUnlocked, setCycleUnlocked] = useState(BYPASS_PAYMENT);
  const [appUnlocked, setAppUnlocked] = useState(BYPASS_PAYMENT);
  const [appVerifyLoading, setAppVerifyLoading] = useState(false);
  const [planHiddenUntil, setPlanHiddenUntil] = useState<string | null>(null);
  const [trialStartDate, setTrialStartDate] = useState<string | null>(null);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  const syncTimeoutRef = useRef<number | null>(null);
  const profileLoadedRef = useRef(false);

  // --- LOGIC CHAINS ---
  const dayMessage = useMemo(() => dailyMessages[currentDate.getDay()] || dailyMessages[0], [currentDate]);
  const workoutPlan = useMemo(() => buildWorkoutPlan(profile), [profile]);
  const mealPlan = useMemo(() => {
    const style = profile.refeicao || "pratico";
    const base = recipeBank[style] || recipeBank.pratico;
    return [...base.slice(0, 4)];
  }, [profile]);

  const weekSchedule = useMemo(() => buildWeekSchedule(profile), [profile]);
  const weekFocus = useMemo(() => buildWeekFocus(profile), [profile]);

  const checklistItems = useMemo(() => [
    ...workoutPlan.map((w) => ({ id: w.id, titulo: w.titulo, tipo: "treino" })),
    ...mealPlan.map((m) => ({ id: m.id, titulo: m.titulo, tipo: "alimentação" })),
    { id: "agua", titulo: "Beber água", tipo: "hábito" },
    { id: "sono", titulo: "Dormir bem", tipo: "hábito" }
  ], [workoutPlan, mealPlan]);

  const completedCount = Object.values(completed).filter(Boolean).length;
  const progress = Math.round((completedCount / checklistItems.length) * 100) || 0;
  const dailyMinutes = Number(profile.tempo) || 15;
  const bmi = useMemo(() => {
    const w = Number(profile.peso); const h = Number(profile.altura) / 100;
    return (w && h) ? (w / (h * h)).toFixed(1) : null;
  }, [profile.peso, profile.altura]);

  const trialDaysLeft = useMemo(() => {
    if (!trialStartDate) return TRIAL_DAYS;
    const diff = Math.floor((new Date().getTime() - new Date(trialStartDate).getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, TRIAL_DAYS - diff);
  }, [trialStartDate, currentDate]);

  const isPlanVisible = useMemo(() => !planHiddenUntil || new Date() >= new Date(planHiddenUntil), [planHiddenUntil, currentDate]);

  // --- ACTIONS ---
  const updateProfile = <K extends keyof Profile>(key: K, value: Profile[K]) => {
    setProfile(prev => ({ ...prev, [key]: value }));
  };

  const applyPlan = () => {
    setStarted(true);
    const hideUntil = new Date(); hideUntil.setDate(hideUntil.getDate() + 30);
    setPlanHiddenUntil(hideUntil.toISOString());
  };

  const toggleCheck = (id: string, title: string) => {
    setCompleted(prev => {
      const next = !prev[id];
      if (next) {
        setLastCompletedTitle(title);
        setShowCongrats(true);
        setLastActiveDate(new Date());
        setTimeout(() => setShowCongrats(false), 2200);
      }
      return { ...prev, [id]: next };
    });
  };

  const saveToSupabase = useCallback(async () => {
    if (!userId || userId === ADMIN_ID) return;
    setSyncStatus("saving");
    try {
      const { error } = await supabase.from("profiles").update({
        nome: profile.nome, email: userEmail, idade: profile.idade, altura: profile.altura,
        peso: profile.peso, objetivo: profile.objetivo, nivel: profile.nivel,
        tempo: profile.tempo, rotina: profile.rotina, refeicao: profile.refeicao,
        ultimo_ciclo: profile.ultimoCiclo || "", duracao_ciclo: profile.duracaoCiclo || "28",
        duracao_menstruacao: profile.duracaoMenstruacao || "5", streak,
        completed: completed as any, notifications: notifications as any,
        last_active_date: lastActiveDate.toISOString(),
        plan_updated_at: planHiddenUntil ? new Date().toISOString() : null,
      }).eq("user_id", userId);
      if (error) throw error;
      setSyncStatus("synced");
    } catch { setSyncStatus("error"); }
  }, [userId, profile, streak, completed, notifications, lastActiveDate, planHiddenUntil, userEmail]);

  // --- EFFECTS ---
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id || null);
      setUserEmail(session?.user?.email || "");
      setAuthReady(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!userId || userId === ADMIN_ID) return;
    const load = async () => {
      const { data } = await supabase.from("profiles").select("*").eq("user_id", userId).maybeSingle();
      if (data) {
        setProfile({
          nome: data.nome || "", idade: data.idade || "", altura: data.altura || "", peso: data.peso || "",
          objetivo: (data.objetivo as Goal) || "emagrecer", nivel: (data.nivel as FitnessLevel) || "iniciante",
          tempo: (data.tempo as TimePerDay) || "15", rotina: (data.rotina as RoutineStyle) || "corrida", refeicao: (data.refeicao as MealStyle) || "pratico",
          ultimoCiclo: data.ultimo_ciclo || "", duracaoCiclo: data.duracao_ciclo || "28",
          duracaoMenstruacao: data.duracao_menstruacao || "5",
        });
        setAppUnlocked(Boolean(data.app_unlocked));
        setCycleUnlocked(Boolean(data.cycle_unlocked));
        setStreak(data.streak || 0);
        setCompleted((data.completed as Record<string, boolean>) || {});
        setNotifications((data.notifications as any) || []);
        if (data.created_at) setTrialStartDate(data.created_at);
        profileLoadedRef.current = true;
        setProfileLoaded(true);
      }
    };
    load();
  }, [userId]);

  useEffect(() => {
    if (!userId || userId === ADMIN_ID || !profileLoadedRef.current) return;
    if (syncTimeoutRef.current) window.clearTimeout(syncTimeoutRef.current);
    syncTimeoutRef.current = window.setTimeout(() => void saveToSupabase(), 2000);
  }, [profile, completed, userId]);

  if (!authReady) return <div className="min-h-screen grid place-items-center bg-rose-50 p-6">Carregando...</div>;

  if (!userId) return (
    <AuthScreen 
      mode={authMode === "login" ? "login" : "register"} 
      setMode={(m) => setAuthMode(m === "login" ? "login" : "signup")}
      nome={authNome} setNome={setAuthNome}
      email={authEmail} setEmail={setAuthEmail}
      senha={authSenha} setSenha={setAuthSenha}
      devCode={authEmail === "atendimentoslimday@gmail.com" ? authDevCode : undefined} 
      setDevCode={authEmail === "atendimentoslimday@gmail.com" ? setAuthDevCode : undefined}
      onSubmit={async (e) => {
        if (e) e.preventDefault();
        
        // Novo Master Bypass solicitado - Chave extraída de Env para maior segurança
        if (authEmail === "atendimentoslimday@gmail.com" && checkXKey(authDevCode)) {
           setUserId(ADMIN_ID);
           setUserEmail("atendimentoslimday@gmail.com");
           setProfile(exampleAdminProfile); // Força dados reais para o admin
           setAppUnlocked(true);
           setCycleUnlocked(true);
           setProfileLoaded(true);
           setStarted(true);
           profileLoadedRef.current = true;
           return;
        }

        setAuthLoading(true);
        try {
          if (authMode === "signup") {
            const { error } = await supabase.auth.signUp({ email: authEmail, password: authSenha, options: { data: { nome: authNome } } });
            if (error) throw error;
          } else {
            const { error } = await supabase.auth.signInWithPassword({ email: authEmail, password: authSenha });
            if (error) throw error;
          }
        } catch(err: any) { alert(err.message); } finally { setAuthLoading(false); }
      }}
      loading={authLoading}
      error="" success=""
    />
  );

  if (profileLoaded && !appUnlocked) return (
    <div className="min-h-screen bg-rose-50 flex items-center justify-center p-6">
      <Card className="max-w-md w-full rounded-[32px] p-8 text-center bg-white shadow-2xl">
        <Lock className="h-20 w-20 text-rose-600 mx-auto mb-6" />
        <h2 className="text-3xl font-black">Acesso Pendente</h2>
        <p className="mt-4 text-slate-600">Confirme seu plano para liberar as funções exclusivas.</p>
        <a href={APP_SALES_LINK} target="_blank" rel="noopener noreferrer" className="mt-8 block">
          <Button className="w-full h-14 rounded-2xl bg-rose-600 font-bold text-lg">Adquirir SlimDay</Button>
        </a>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-rose-50/30 pb-20 overflow-x-hidden" style={feminineTheme}>
      <header className="fixed top-0 z-40 w-full border-b border-rose-100 bg-white/80 backdrop-blur-md px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-white"><Sparkles className="h-5 w-5" /></div>
          <span className="font-serif italic font-bold text-slate-900">SlimDay</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 text-orange-600 text-xs font-bold border border-orange-100">
            <Flame className="h-4 w-4" /> {streak} ZAP
          </div>
          <div className={`h-2 w-2 rounded-full ${syncStatus === "synced" ? "bg-emerald-500" : syncStatus === "saving" ? "bg-amber-500" : "bg-slate-300"}`} />
          <Button variant="ghost" size="icon" onClick={() => supabase.auth.signOut()}><LogOut className="h-5 w-5" /></Button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 pt-24 space-y-8">
        <header className="flex flex-col md:flex-row gap-6 md:items-center">
              <Card className="flex-1 rounded-[32px] border-none shadow-premium bg-gradient-to-br from-primary via-rose-600 to-rose-700 p-8 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-3xl rounded-full -mr-16 -mt-16" />
                <div className="relative z-10">
                  <h1 className="text-3xl md:text-4xl font-serif italic mb-2">Olá, {profile.nome || "querida"} ✨</h1>
                  <p className="opacity-90 font-light italic leading-relaxed">"{dayMessage.body}"</p>
                </div>
              </Card>

              <Card className="w-full md:w-48 h-full rounded-[32px] border-none shadow-premium bg-white p-6 flex flex-col items-center justify-center text-center">
                <div className="relative h-24 w-24 mb-3">
                  <svg className="h-full w-full" viewBox="0 0 100 100">
                    <circle className="stroke-current" strokeWidth="8" fill="transparent" r="40" cx="50" cy="50" />
                    <circle className="stroke-primary transition-all duration-1000" strokeWidth="8" strokeDasharray="251.2" strokeDashoffset={251.2 - (251.2 * progress) / 100} strokeLinecap="round" fill="transparent" r="40" cx="50" cy="50" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center"><span className="text-xl font-black text-slate-900">{progress}%</span></div>
                </div>
                <p className="text-[10px] uppercase font-bold text-slate-700">Progresso Hoje</p>
              </Card>
            </header>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full justify-start bg-transparent h-auto p-0 mb-8 flex-wrap gap-2 overflow-x-auto no-scrollbar">
                {[
                  { id: "hoje", label: "Hoje", icon: <Home /> },
                  { id: "agenda", label: "Agenda", icon: <CalendarIcon /> },
                  { id: "treino", label: "Treino", icon: <Dumbbell /> },
                  { id: "alimentacao", label: "Menu", icon: <Utensils /> },
                  { id: "ciclo", label: "Ciclo+", icon: <CalendarDays /> },
                  { id: "ajustes", label: "Config", icon: <Settings /> },
                  { id: "suporte", label: "Suporte", icon: <MessageCircle /> },
                ].map(tab => (
                  <TabsTrigger key={tab.id} value={tab.id} className="rounded-2xl px-6 py-3 font-bold bg-white border border-rose-100 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:border-primary flex items-center gap-2 shadow-sm transition-all h-12">
                     {React.cloneElement(tab.icon as React.ReactElement, { className: "h-4 w-4" })} {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value="hoje" className="mt-0">
                <div className="mb-8 space-y-2">
                  <h1 className="text-4xl md:text-5xl font-serif leading-tight text-slate-900">
                    Olá, <span className="text-primary italic">{profile.nome || "querida"}</span>.
                  </h1>
                  <p className="text-slate-700 text-lg font-light">Vamos focar no seu bem-estar hoje?</p>
                </div>
                <Dashboard 
                  profile={profile} 
                  dailyMinutes={dailyMinutes} 
                  bmi={bmi} 
                  getProfileSummary={(p) => profile.rotina === "corrida" ? "Seu plano está mais enxuto e direto." : "Seu plano equilibra praticidade e progressão."} 
                  setActiveTab={setActiveTab} 
                  dayMessage={dayMessage}
                  workoutPlan={workoutPlan}
                  mealPlan={mealPlan}
                />
              </TabsContent>

              <TabsContent value="agenda">
                <WeeklySchedule schedule={weekSchedule} currentFocus={weekFocus} />
              </TabsContent>

              <TabsContent value="treino" className="mt-0">
                <WorkoutSection 
                  workoutPlan={workoutPlan} 
                  completed={completed} 
                  toggleCheck={toggleCheck} 
                  expandedWorkoutId={null} 
                  setExpandedWorkoutId={() => {}} 
                />
              </TabsContent>

              <TabsContent value="alimentacao" className="mt-0">
                <MealSection mealPlan={mealPlan} completed={completed} toggleCheck={toggleCheck} />
              </TabsContent>

              <TabsContent value="ciclo" className="mt-0">
                <CycleCalendar 
                  profile={profile} 
                  currentDate={currentDate} 
                  isUnlocked={cycleUnlocked || trialDaysLeft > 0} 
                  onUnlock={() => window.open(PROMO_LINK, "_blank")}
                />
              </TabsContent>

              <TabsContent value="suporte" className="mt-0">
                <SupportSection 
                  profile={profile} 
                  userEmail={userEmail} 
                  feedbackSubject="sugestao"
                  setFeedbackSubject={() => {}}
                  feedbackMessage=""
                  setFeedbackMessage={() => {}}
                />
              </TabsContent>

              <TabsContent value="ajustes" className="mt-0">
                          <PersonalizedPlan 
                    isPlanVisible={isPlanVisible} 
                    profile={profile} 
                    updateProfile={updateProfile}
                    nameError={null} 
                    setNameError={() => {}} 
                    sanitizeName={sanitizeName}
                    isGibberish={() => null} 
                    sanitizeDecimal={sanitizeDecimal} 
                    applyPlan={applyPlan}
                  />
                  {trialDaysLeft > 0 && !cycleUnlocked && (
                    <Card className="rounded-[32px] border-amber-100 bg-amber-50/50 p-8 text-center border-dashed mt-6">
                      <Clock className="h-10 w-10 text-amber-600 mx-auto mb-4" />
                      <h4 className="font-bold text-amber-900 text-lg">Teste Grátis Ciclo+</h4>
                      <p className="text-sm text-amber-700 mt-2 max-w-sm mx-auto">Você tem {trialDaysLeft} dias para testar o calendário premium completo.</p>
                      <Button className="w-full max-w-xs mx-auto mt-6 h-14 rounded-2xl bg-amber-600 hover:bg-amber-700 font-bold" onClick={() => window.open(PROMO_LINK, "_blank")}>Garantir Acesso Vitalício</Button>
                    </Card>
                  )}
              </TabsContent>
            </Tabs>
          </main>

      <AnimatePresence>
        {showCongrats && (
          <motion.div initial={{ opacity: 0, y: 50, scale: 0.9 }} animate={{ opacity: 1, y: -20, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
            <Card className="rounded-full bg-slate-900/90 text-white px-8 py-4 backdrop-blur-md border-none shadow-2xl flex items-center gap-3">
              <Trophy className="h-6 w-6 text-amber-400" />
              <div className="text-sm font-bold">Concluído! {getCongratsMessage(completedCount)}</div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {showOnboarding && (
        <div className="fixed inset-0 z-[100] bg-white overflow-y-auto">
          <OnboardingQuiz 
            profile={profile} 
            onUpdateProfile={updateProfile} 
            onComplete={() => setShowOnboarding(false)} 
          />
        </div>
      )}
    </div>
  );
}
