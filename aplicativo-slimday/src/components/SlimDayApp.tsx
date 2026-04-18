import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { recipeImages } from "@/assets/recipes";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";

// UI Components
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

// Icons
import {
  Trophy,
  X,
  CalendarDays,
  Dumbbell,
  Utensils,
  Sparkles,
  BadgeCheck,
  Home,
  Star,
  Lock,
  ShoppingCart,
  ChevronRight,
  Cloud,
  RefreshCcw,
  Zap
} from "lucide-react";

// Modular Components
import { AuthScreen } from "./Auth/AuthScreen";
import { OnboardingQuiz } from "./Onboarding/OnboardingQuiz";
import { CycleCalendar } from "./Calendar/CycleCalendar";
import { Dashboard } from "./Dashboard/Dashboard";
import { MealSection } from "./Health/MealSection";
import { WorkoutSection } from "./Health/WorkoutSection";
import { FeedbackForm } from "./Dashboard/FeedbackForm";
import { WaterTracker } from "./Dashboard/WaterTracker";

// Libs & Utils
import { 
  Profile, 
  NotificationItem, 
  SyncStatus, 
  Goal, 
  FitnessLevel, 
  TimePerDay, 
  RoutineStyle, 
  MealStyle 
} from "../types/slimday";
import { 
  ADMIN_EMAILS, 
  DEV_MASTER_KEY, 
  BYPASS_PAYMENT, 
  TRIAL_DAYS, 
  PROMO_PRICE, 
  FULL_PRICE, 
  PROMO_LINK, 
  FULL_LINK, 
  APP_SALES_LINK,
  defaultProfile,
  recipeBank,
  phaseTreats
} from "../constants/slimdayData";
import { 
  buildDailyMealPlan,
  buildWorkoutPlan, 
  buildMealPlan, 
  buildWeekFocus, 
  buildWeekSchedule, 
  buildCycleCalendar, 
  getDayBasedMessage, 
  toDateKey, 
  getDayDiff, 
  buildNotification, 
  getCongratsMessage, 
  getReengagementMessage, 
  getPhaseTitle, 
  getProfileSummary,
  sanitizeName,
  sanitizeDecimal,
  isGibberish
} from "../utils/slimdayLogic";
import { trackFacebookEvent } from "../utils/facebook";

function SlimDayApp() {
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState("");
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [authNome, setAuthNome] = useState("");
  const [authEmail, setAuthEmail] = useState("");
  const [authSenha, setAuthSenha] = useState("");
  const [authDevCode, setAuthDevCode] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authSuccess, setAuthSuccess] = useState("");
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("idle");
  const [authReady, setAuthReady] = useState(false);

  // Estados com persistência local inicial
  const [profile, setProfile] = useState<Profile>(() => {
    const local = localStorage.getItem("sd_profile");
    return local ? JSON.parse(local) : defaultProfile;
  });
  const [started, setStarted] = useState(() => localStorage.getItem("sd_started") === "true");
  const [completed, setCompleted] = useState<Record<string, boolean>>(() => {
    const local = localStorage.getItem("sd_completed");
    return local ? JSON.parse(local) : {};
  });
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem("sd_active_tab") || "hoje");
  const [streak, setStreak] = useState(() => Number(localStorage.getItem("sd_streak")) || 0);
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const local = localStorage.getItem("sd_notifications");
    return local ? JSON.parse(local) : [];
  });
  const [lastActiveDate, setLastActiveDate] = useState<Date>(() => {
    const local = localStorage.getItem("sd_last_active");
    return local ? new Date(local) : new Date();
  });

  const [showCongrats, setShowCongrats] = useState(false);
  const [lastCompletedTitle, setLastCompletedTitle] = useState("");
  const [savedToast, setSavedToast] = useState(false);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  
  const [cycleUnlocked, setCycleUnlocked] = useState(BYPASS_PAYMENT);
  const [appUnlocked, setAppUnlocked] = useState(BYPASS_PAYMENT);
  const [appVerifyLoading, setAppVerifyLoading] = useState(false);
  const [planHiddenUntil, setPlanHiddenUntil] = useState<string | null>(null);
  const [trialStartDate, setTrialStartDate] = useState<string | null>(null);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingDismissed, setOnboardingDismissed] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);

  // Estados de Controle de Vendas Ciclo+
  const [cycleOfferRefused, setCycleOfferRefused] = useState(false);
  const [cycleLastChanceRefused, setCycleLastChanceRefused] = useState(false);
  const [purchaseTracked, setPurchaseTracked] = useState(() => sessionStorage.getItem("sd_purchase_tracked") === "true");

  const syncTimeoutRef = useRef<number | null>(null);
  const profileLoadedRef = useRef(false);

  const workoutPlan = useMemo(() => buildWorkoutPlan(profile, currentDate), [profile, currentDate]);
  const mealPlan = useMemo(() => buildDailyMealPlan(profile, currentDate), [profile, currentDate]);
  const weekFocus = useMemo(() => buildWeekFocus(profile), [profile]);
  const weekSchedule = useMemo(() => buildWeekSchedule(profile), [profile]);
  const recipeSuggestions = useMemo(() => recipeBank[profile.refeicao], [profile.refeicao]);
  const cycleCalendar = useMemo(() => buildCycleCalendar(profile, currentDate), [profile, currentDate]);

  const checklistItems = useMemo(
    () => [
      ...workoutPlan.map((w) => ({ id: w.id, titulo: w.titulo, tipo: "treino" })),
      ...mealPlan.map((m) => ({ id: m.id, titulo: m.titulo, tipo: "alimentação" })),
      { id: "agua", titulo: "Beber água ao longo do dia", tipo: "hábito" },
      { id: "sono", titulo: "Dormir melhor hoje", tipo: "hábito" },
      { id: "pausa", titulo: "Fazer uma pausa consciente", tipo: "bem-estar" },
    ],
    [workoutPlan, mealPlan]
  );

  const completedCount = Object.values(completed).filter(Boolean).length;
  const totalCount = checklistItems.length;
  const progress = Math.round((completedCount / totalCount) * 100) || 0;
  const dailyMinutes = Number(profile.tempo);
  const dayMessage = useMemo(() => getDayBasedMessage(currentDate), [currentDate]);
  
  const bmi = useMemo(() => {
    const w = Number(profile.peso);
    const h = Number(profile.altura) / 100;
    if (!w || !h) return null;
    return (w / (h * h)).toFixed(1);
  }, [profile.peso, profile.altura]);

  const todayKey = useMemo(() => toDateKey(currentDate), [currentDate]);
  const currentCycleDay = cycleCalendar.find((day) => day.dateKey === todayKey) ?? cycleCalendar[0] ?? null;
  const cycleTreats = useMemo(() => {
    const phase = currentCycleDay?.phase ?? "neutro";
    const baseTreats = phaseTreats[phase] ?? phaseTreats.neutro;
    if (profile.objetivo === "emagrecer") {
      return baseTreats.map((item) => ({ ...item, descricao: `${item.descricao} Prefira porção pequena.` }));
    }
    return baseTreats;
  }, [currentCycleDay, profile.objetivo]);

  const trialDaysLeft = useMemo(() => {
    if (!trialStartDate) return TRIAL_DAYS;
    const start = new Date(trialStartDate);
    const now = new Date();
    const diff = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, TRIAL_DAYS - diff);
  }, [trialStartDate, currentDate]);

  const isTrialActive = trialDaysLeft > 0;
  const isTrialExpired = trialStartDate && trialDaysLeft === 0;

  // Lógica de Preço Dinâmico
  const { currentPrice, currentPurchaseLink, cycleOfferState } = useMemo(() => {
    // Se o teste expirou – Preço R$ 9,90 (Última Chance) ou R$ 12,90 (Penalidade)
    if (isTrialExpired) {
      if (cycleLastChanceRefused) {
        return { 
          currentPrice: FULL_PRICE, 
          currentPurchaseLink: FULL_LINK,
          cycleOfferState: "post_trial_refused" 
        };
      }
      return { 
        currentPrice: PROMO_PRICE, 
        currentPurchaseLink: PROMO_LINK,
        cycleOfferState: "last_chance" 
      };
    }
    
    // Se o teste está ativo -> Estado especial para o Dashboard
    if (isTrialActive) {
      return {
        currentPrice: PROMO_PRICE,
        currentPurchaseLink: PROMO_LINK,
        cycleOfferState: "trial_active"
      };
    }

    // Se recusou a oferta inicial -> Oferta de Trial + 9,90
    if (cycleOfferRefused && !isTrialActive && !isTrialExpired) {
      return { 
        currentPrice: PROMO_PRICE, 
        currentPurchaseLink: PROMO_LINK,
        cycleOfferState: "trial_offer" 
      };
    }

    // Oferta padrão inicial -> 9,90
    return { 
      currentPrice: PROMO_PRICE, 
      currentPurchaseLink: PROMO_LINK,
      cycleOfferState: "initial" 
    };
  }, [isTrialActive, isTrialExpired, cycleOfferRefused, cycleLastChanceRefused]);

  const isPlanVisible = useMemo(() => {
    if (!planHiddenUntil) return true;
    return new Date() >= new Date(planHiddenUntil);
  }, [planHiddenUntil, currentDate]);

  function updateProfile<K extends keyof Profile>(key: K, value: Profile[K]) {
    setProfile((prev) => ({ ...prev, [key]: value }));
  }

  const saveToSupabase = useCallback(async () => {
    if (!userId || userId === "admin-dev-id") return;
    setSyncStatus("saving");
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          nome: profile.nome,
          email: userEmail,
          idade: profile.idade,
          altura: profile.altura,
          peso: profile.peso,
          objetivo: profile.objetivo,
          nivel: profile.nivel,
          tempo: profile.tempo,
          rotina: profile.rotina,
          refeicao: profile.refeicao,
          ultimo_ciclo: profile.ultimoCiclo || "",
          duracao_ciclo: profile.duracaoCiclo || "28",
          duracao_menstruacao: profile.duracaoMenstruacao || "5",
          cycle_trial_started_at: trialStartDate,
          cycle_offer_refused: cycleOfferRefused,
          cycle_last_chance_refused: cycleLastChanceRefused,
          streak,
          completed: completed as any,
          notifications: notifications as any,
          last_active_date: lastActiveDate.toISOString(),
          plan_updated_at: planHiddenUntil ? new Date().toISOString() : null,
        })
        .eq("user_id", userId);
      if (error) throw error;
      setSyncStatus("synced");
    } catch {
      setSyncStatus("error");
    }
  }, [userId, profile, streak, completed, notifications, lastActiveDate, planHiddenUntil, userEmail, trialStartDate, cycleOfferRefused, cycleLastChanceRefused]);

  function scheduleSync() {
    if (!userId) return;
    if (syncTimeoutRef.current) window.clearTimeout(syncTimeoutRef.current);
    syncTimeoutRef.current = window.setTimeout(() => {
      void saveToSupabase();
    }, 1500);
  }

  function toggleCheck(id: string, title: string) {
    setCompleted((prev) => {
      const next = !prev[id];
      if (next) {
        const now = new Date();
        const diff = getDayDiff(now, lastActiveDate);
        setLastCompletedTitle(title);
        setShowCongrats(true);
        setLastActiveDate(now);
        setNotifications((prevN) => [
          buildNotification("Etapa concluída", `Você concluiu: ${title}`, "conquista"),
          ...prevN,
        ].slice(0, 8));
        setStreak((prevStreak) => {
          if (toDateKey(lastActiveDate) === toDateKey(now)) return Math.max(prevStreak, 1);
          if (diff === 1) return prevStreak + 1;
          return 1;
        });
        window.setTimeout(() => setShowCongrats(false), 2200);
      }
      return { ...prev, [id]: next };
    });
  }

  function applyPlan() {
    const now = new Date();
    setStarted(true);
    setSavedToast(true);
    setLastActiveDate(now);
    const hideUntil = new Date(now);
    hideUntil.setDate(hideUntil.getDate() + 30);
    setPlanHiddenUntil(hideUntil.toISOString());
    setNotifications((prev) => [
      buildNotification("Plano atualizado", "Seu plano foi reorganizado.", "motivacao"),
      ...prev,
    ].slice(0, 8));
    window.setTimeout(() => setSavedToast(false), 1800);
  }

  function resetDay() {
    setCompleted({});
    setLastCompletedTitle("");
    setLastActiveDate(new Date());
    setNotifications((prev) => [
      buildNotification("Novo começo", "Seu dia foi reiniciado.", "motivacao"),
      ...prev,
    ].slice(0, 8));
  }

  function handleRefuseInitialOffer() {
    setCycleOfferRefused(true);
    scheduleSync();
  }

  function handleStartTrial() {
    const now = new Date().toISOString();
    setTrialStartDate(now);
    scheduleSync();
    setNotifications((prev) => [
      buildNotification("Teste Grátis Ativado", "Você tem 7 dias para explorar o Ciclo+.", "conquista"),
      ...prev,
    ].slice(0, 8));
  }

  function handleRefuseLastChance() {
    setCycleLastChanceRefused(true);
    scheduleSync();
  }

  async function handleLogout() {
    if (syncTimeoutRef.current) window.clearTimeout(syncTimeoutRef.current);
    await saveToSupabase();
    await supabase.auth.signOut();
    setUserId(null);
    setUserEmail("");
    setSyncStatus("idle");
  }

  const verifyAndRefreshCyclePurchase = useCallback(async () => {
    if (!userId || userId === "admin-dev-id" || BYPASS_PAYMENT) {
      if (BYPASS_PAYMENT || userId === "admin-dev-id") setCycleUnlocked(true);
      return;
    }
    try {
      const { data, error } = await supabase
        .from("purchases")
        .select("status")
        .eq("user_id", userId)
        .eq("product_type", "calendar")
        .eq("status", "completed")
        .maybeSingle();

      if (data) setCycleUnlocked(true);
    } catch {}
  }, [userId]);

  const verifyAndRefreshAppPurchase = useCallback(async () => {
    if (!userId || userId === "admin-dev-id" || BYPASS_PAYMENT) {
      if (BYPASS_PAYMENT || userId === "admin-dev-id") setAppUnlocked(true);
      return;
    }
    setAppVerifyLoading(true);
    try {
      const { data } = await supabase
        .from("purchases")
        .select("status")
        .eq("user_id", userId)
        .eq("product_type", "app")
        .eq("status", "completed")
        .maybeSingle();

      if (data) setAppUnlocked(true);
    } catch {} finally {
      setAppVerifyLoading(false);
    }
  }, [userId]);

  async function handleAuthSubmit() {
    if (!authEmail.trim() || !authSenha.trim()) return;
    setAuthLoading(true);
    setAuthError("");

    try {
      // Bypass total de desenvolvedor (Ativado apenas com a Master Key)
      if (authDevCode.trim() === "SLIM-DEV-2024-@#" || authDevCode.trim() === DEV_MASTER_KEY) {
        setUserId("admin-dev-id");
        setAppUnlocked(true);
        setCycleUnlocked(true);
        setAuthReady(true);
        return;
      }

      const isAdminEmail = ADMIN_EMAILS.includes(authEmail.toLowerCase().trim());
      // Mantemos o resto do fluxo normal abaixo

      if (authMode === "register") {
        const { data, error } = await supabase.auth.signUp({
          email: authEmail.trim(),
          password: authSenha.trim(),
          options: { data: { nome: authNome.trim() } },
        });
        if (error) throw error;
        if (data.user && !data.session) {
          setAuthSuccess("Verifique seu e-mail para confirmar a conta.");
          setAuthMode("login");
          return;
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: authEmail.trim(),
          password: authSenha.trim(),
        });
        if (error) throw error;
      }
    } catch (err: any) {
      setAuthError(err.message || "Erro ao autenticar.");
    } finally {
      setAuthLoading(false);
    }
  }

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id || null);
      setUserEmail(session?.user?.email || "");
      setAuthReady(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!userId) {
      if (authReady) {
        setProfileLoaded(true);
        profileLoadedRef.current = true;
      }
      return;
    }
    const load = async () => {
      if (userId === "admin-dev-id") {
        setProfileLoaded(true);
        profileLoadedRef.current = true;
        setAppUnlocked(true);
        setCycleUnlocked(true);
        setStarted(true);
        return;
      }
      const { data } = await supabase.from("profiles").select("*").eq("user_id", userId).maybeSingle();
      if (data) {
        setProfile({
          nome: data.nome || "",
          idade: data.idade || "",
          altura: data.altura || "",
          peso: data.peso || "",
          objetivo: (data.objetivo as Goal) || "emagrecer",
          nivel: (data.nivel as FitnessLevel) || "iniciante",
          tempo: (data.tempo as TimePerDay) || "15",
          rotina: (data.rotina as RoutineStyle) || "corrida",
          refeicao: (data.refeicao as MealStyle) || "pratico",
          ultimoCiclo: data.ultimo_ciclo || "",
          duracaoCiclo: data.duracao_ciclo || "28",
          duracaoMenstruacao: data.duracao_menstruacao || "5",
        });
        setCycleUnlocked(Boolean(data.cycle_unlocked));
        setAppUnlocked(Boolean(data.app_unlocked));
        setCycleOfferRefused(Boolean(data.cycle_offer_refused));
        setCycleLastChanceRefused(Boolean(data.cycle_last_chance_refused));
        setTrialStartDate(data.cycle_trial_started_at || null);
        setStreak(data.streak || 0);
        setCompleted((data.completed as any) || {});
        setNotifications((data.notifications as any) || []);
        setLastActiveDate(data.last_active_date ? new Date(data.last_active_date) : new Date());
        if (data.plan_updated_at) setStarted(true);
      }
      setProfileLoaded(true);
      profileLoadedRef.current = true;
    };
    void load();
  }, [userId, authReady]);

  // Rastreamento de Conversão (Purchase)
  useEffect(() => {
    if (appUnlocked && !purchaseTracked && userId) {
      trackFacebookEvent('Purchase', {
        content_name: 'SlimDay Elite Access',
        value: 29.90,
        currency: 'BRL'
      });
      setPurchaseTracked(true);
      sessionStorage.setItem("sd_purchase_tracked", "true");
    }
  }, [appUnlocked, purchaseTracked, userId]);

  // Sincronização Local (Instantânea)
  useEffect(() => {
    localStorage.setItem("sd_profile", JSON.stringify(profile));
    localStorage.setItem("sd_completed", JSON.stringify(completed));
    localStorage.setItem("sd_active_tab", activeTab);
    localStorage.setItem("sd_streak", String(streak));
    localStorage.setItem("sd_notifications", JSON.stringify(notifications));
    localStorage.setItem("sd_last_active", lastActiveDate.toISOString());
    localStorage.setItem("sd_started", String(started));
  }, [profile, completed, activeTab, streak, notifications, lastActiveDate, started]);

  // Sincronização Nuvem (Com Delay p/ Performance)
  useEffect(() => {
    if (!userId || !profileLoadedRef.current) return;
    scheduleSync();
  }, [profile, streak, completed, notifications, lastActiveDate, planHiddenUntil, userId, started, cycleOfferRefused, cycleLastChanceRefused, trialStartDate]);

  // Forçar salvamento ao fechar a aba
  useEffect(() => {
    const handleUnload = () => {
      if (userId && userId !== "admin-dev-id") {
        void saveToSupabase();
      }
    };
    window.addEventListener("beforeunload", handleUnload);
    return () => window.removeEventListener("beforeunload", handleUnload);
  }, [userId, profile, completed, streak, notifications]);

  const hasAnyActivity = Object.keys(completed).length > 0 || streak > 0 || notifications.length > 0;
  useEffect(() => {
    if (!started && !planHiddenUntil && profileLoaded && !hasAnyActivity && !onboardingDismissed) {
      const timer = setTimeout(() => setShowOnboarding(true), 500);
      return () => clearTimeout(timer);
    }
  }, [started, planHiddenUntil, profileLoaded, hasAnyActivity, onboardingDismissed]);

  if (!authReady) return <div className="p-20 text-center">Carregando...</div>;

  if (!userId) {
    return (
      <AuthScreen
        mode={authMode} setMode={setAuthMode}
        nome={authNome} setNome={setAuthNome}
        email={authEmail} setEmail={setAuthEmail}
        senha={authSenha} setSenha={setAuthSenha}
        onSubmit={handleAuthSubmit}
        loading={authLoading}
        error={authError}
        success={authSuccess}
        devCode={authDevCode}
        setDevCode={setAuthDevCode}
      />
    );
  }

  if (profileLoaded && !appUnlocked) {
    return (
      <div className="min-h-screen bg-rose-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full rounded-[32px] p-8 text-center bg-white shadow-2xl">
          <Lock className="h-16 w-16 text-rose-600 mx-auto mb-6" />
          <h2 className="text-3xl font-black mb-4">Acesso Bloqueado</h2>
          <p className="text-slate-600 mb-8 font-light">Adquira o SlimDay para liberar seu plano de treinos e dieta.</p>
          <a href={APP_SALES_LINK} target="_blank" rel="noopener noreferrer">
            <Button className="w-full h-14 rounded-2xl bg-rose-600 font-bold mb-4">
              <ShoppingCart className="mr-2" /> Adquirir o SlimDay
            </Button>
          </a>
          <button onClick={verifyAndRefreshAppPurchase} disabled={appVerifyLoading} className="w-full text-sm text-slate-500 underline">
            {appVerifyLoading ? "Verificando..." : "Já comprei - verificar agora"}
          </button>
          <button onClick={handleLogout} className="mt-6 text-xs text-slate-400">Sair</button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fffcfd]">
      <AnimatePresence>
        {showOnboarding && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="relative w-full max-w-xl">
              <button 
                onClick={() => { setShowOnboarding(false); setOnboardingDismissed(true); }}
                className="absolute top-4 right-4 z-10 text-white text-2xl"
              >×</button>
              <OnboardingQuiz 
                profile={profile} 
                onUpdateProfile={updateProfile} 
                onComplete={() => { setShowOnboarding(false); setOnboardingDismissed(true); applyPlan(); }} 
              />
            </div>
          </div>
        )}
      </AnimatePresence>

      <div className="mx-auto max-w-7xl px-4 py-8">
        <Dashboard 
          profile={profile} 
          streak={streak} 
          dayMessage={dayMessage} 
          syncStatus={syncStatus} 
          progress={progress} 
          completedCount={completedCount} 
          totalCount={totalCount}
          resetDay={resetDay}
          getProfileSummary={getProfileSummary}
          cycleUnlocked={cycleUnlocked}
          onOpenCalendar={() => setActiveTab("calendario")}
          cycleOfferState={cycleOfferState}
          onRefuseOffer={handleRefuseInitialOffer}
          onStartTrial={handleStartTrial}
          trialDaysLeft={trialDaysLeft}
        />

        <div className="grid gap-8 lg:grid-cols-[1fr,3fr]">
          <aside className="space-y-6">
            <Card className="rounded-[40px] p-8 bg-gradient-to-br from-rose-100/80 to-white border-white shadow-premium">
              <h2 className="text-xl font-serif italic mb-6 text-slate-900">Seu Perfil</h2>
              <div className="space-y-4">
                <div><Label className="text-slate-500">Nome: <span className="text-slate-900 font-bold">{profile.nome}</span></Label></div>
                <div><Label className="text-slate-500">Meta: <span className="text-slate-900 font-bold">{profile.objetivo}</span></Label></div>
                <div><Label className="text-slate-500">Tempo: <span className="text-slate-900 font-bold">{profile.tempo} min</span></Label></div>
                {bmi && <div className="inline-block mt-2 px-3 py-1 bg-rose-500 text-white rounded-full text-xs font-bold">IMC: {bmi}</div>}
              </div>
            </Card>
            <Button variant="outline" className="w-full rounded-2xl h-12 border-rose-100 text-rose-400 hover:bg-rose-50" onClick={handleLogout}>Sair da Conta</Button>
          </aside>

          <main>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="flex flex-wrap gap-2 bg-transparent h-auto mb-8">
                <TabsTrigger value="hoje" className="rounded-2xl px-6 py-3 border data-[state=active]:bg-rose-500 data-[state=active]:text-white">Hoje</TabsTrigger>
                <TabsTrigger value="treino" className="rounded-2xl px-6 py-3 border data-[state=active]:bg-rose-500 data-[state=active]:text-white">Treino</TabsTrigger>
                <TabsTrigger value="alimentacao" className="rounded-2xl px-6 py-3 border data-[state=active]:bg-rose-500 data-[state=active]:text-white">Menu</TabsTrigger>
                <TabsTrigger value="calendario" className="rounded-2xl px-6 py-3 border data-[state=active]:bg-rose-500 data-[state=active]:text-white">Ciclo+</TabsTrigger>
                <TabsTrigger value="feedback" className="rounded-2xl px-6 py-3 border data-[state=active]:bg-rose-500 data-[state=active]:text-white">Feedback</TabsTrigger>
              </TabsList>

              <TabsContent value="hoje" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {/* Insights e Mantras */}
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Card de Mantra */}
                  <Card className="rounded-[40px] border-none shadow-premium bg-gradient-to-br from-indigo-500 to-purple-600 text-white p-8 relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 opacity-10 group-hover:scale-110 transition-transform">
                      <Sparkles className="h-32 w-32" />
                    </div>
                    <div className="relative z-10">
                      <Badge className="bg-white/20 text-white border-none mb-4 px-3 py-1 text-[10px] font-black uppercase tracking-widest">Mantra do Dia</Badge>
                      <h3 className="text-2xl font-serif italic mb-2">"{dayMessage.title}"</h3>
                      <p className="text-indigo-100 text-sm font-light leading-relaxed">
                        {dayMessage.body}
                      </p>
                    </div>
                  </Card>

                  {/* Card de Insight Hormonal */}
                  <Card className="rounded-[40px] border-none shadow-premium bg-white p-8 relative overflow-hidden group border border-rose-100/50">
                    <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:rotate-12 transition-transform">
                      <Zap className="h-32 w-32 text-rose-500 fill-current" />
                    </div>
                    <div className="relative z-10">
                      <Badge className="bg-rose-50 text-rose-500 border-none mb-4 px-3 py-1 text-[10px] font-black uppercase tracking-widest">
                        Insight {currentCycleDay?.phase ? `da Fase ${getPhaseTitle(currentCycleDay.phase)}` : "do Dia"}
                      </Badge>
                      <h3 className="text-xl font-bold text-slate-800 mb-2">Energia e Nutrição</h3>
                      <p className="text-slate-500 text-sm font-light leading-relaxed">
                        {currentCycleDay?.phase === "menstruação" ? "Sua energia pode estar mais recolhida. Priorize alimentos quentes e treinos de mobilidade leve." :
                         currentCycleDay?.phase === "fértil" ? "Pico de energia! Ótimo momento para treinos intensos e conquistas pessoais." :
                         currentCycleDay?.phase === "ovulação" ? "Você está radiante. Mantenha a hidratação alta e aproveite a disposição extra." :
                         "Mantenha o foco na sua rotina. Pequenas vitórias hoje constroem grandes resultados amanhã."}
                      </p>
                    </div>
                  </Card>
                </div>

                {/* Rastreador de Água */}
                <WaterTracker />

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="group p-8 bg-rose-50 rounded-[40px] flex flex-col justify-between hover:bg-rose-100/50 transition-colors relative overflow-hidden">
                    <div className="absolute -right-4 -top-4 opacity-5 group-hover:scale-110 transition-transform">
                      <Dumbbell className="h-24 w-24 text-rose-500" />
                    </div>
                    <div className="relative z-10">
                      <h3 className="text-2xl font-serif mb-2 text-slate-900">Treino de Hoje</h3>
                      <p className="text-slate-500 font-light">{dailyMinutes} min focados para sua meta.</p>
                      <Button className="mt-8 w-full h-14 rounded-2xl bg-rose-500 hover:bg-rose-600 font-bold shadow-lg shadow-rose-200" onClick={() => setActiveTab("treino")}>
                        Começar Agora
                      </Button>
                    </div>
                  </div>

                  <div className="group p-8 bg-orange-50 rounded-[40px] flex flex-col justify-between hover:bg-orange-100/50 transition-colors relative overflow-hidden">
                    <div className="absolute -right-4 -top-4 opacity-5 group-hover:scale-110 transition-transform">
                      <Utensils className="h-24 w-24 text-orange-500" />
                    </div>
                    <div className="relative z-10">
                      <h3 className="text-2xl font-serif mb-2 text-slate-900">Sua Nutrição</h3>
                      <p className="text-slate-500 font-light">Plano prático e nutritivo para suas refeições.</p>
                      <Button variant="outline" className="mt-8 w-full h-14 rounded-2xl border-orange-200 text-orange-600 hover:bg-orange-100 font-bold" onClick={() => setActiveTab("alimentacao")}>
                        Ver Menu Completo
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Atalho para Mimo da Fase */}
                {cycleUnlocked && cycleTreats.length > 0 && (
                  <Card className="rounded-[40px] border-none shadow-premium bg-gradient-to-r from-amber-50 to-orange-50 p-8 border border-orange-100/50 cursor-pointer hover:shadow-lg transition-all" onClick={() => setActiveTab("calendario")}>
                    <div className="flex items-center gap-6">
                      <div className="h-16 w-16 rounded-[24px] bg-white text-orange-500 flex items-center justify-center shadow-sm">
                        <Sparkles className="h-8 w-8" />
                      </div>
                      <div className="flex-1">
                        <p className="text-[10px] uppercase font-bold tracking-[3px] text-orange-300">Mimo da Fase</p>
                        <h4 className="text-lg font-bold text-slate-800">{cycleTreats[0].titulo}</h4>
                        <p className="text-sm text-slate-500 font-light">{cycleTreats[0].descricao}</p>
                      </div>
                      <ChevronRight className="h-6 w-6 text-orange-300" />
                    </div>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="treino">
                <WorkoutSection workoutPlan={workoutPlan} completed={completed} toggleCheck={toggleCheck} />
              </TabsContent>

              <TabsContent value="alimentacao">
                <MealSection mealPlan={mealPlan} completed={completed} toggleCheck={toggleCheck} style={profile.refeicao} />
              </TabsContent>

              <TabsContent value="calendario">
                <CycleCalendar 
                  profile={profile}
                  cycleUnlocked={cycleUnlocked}
                  isTrialActive={isTrialActive}
                  trialDaysLeft={trialDaysLeft}
                  isTrialExpired={isTrialExpired}
                  currentPrice={currentPrice}
                  currentPurchaseLink={currentPurchaseLink}
                  cycleOfferState={cycleOfferState}
                  onRefuseOffer={handleRefuseInitialOffer}
                  onStartTrial={handleStartTrial}
                  onRefuseLastChance={handleRefuseLastChance}
                  cycleCalendar={cycleCalendar}
                  todayKey={todayKey}
                  currentDate={currentDate}
                  setCurrentDate={setCurrentDate}
                  updateProfile={updateProfile}
                  verifyAndRefreshCyclePurchase={verifyAndRefreshCyclePurchase}
                  getPhaseTitle={getPhaseTitle}
                  cycleTreats={cycleTreats}
                />
              </TabsContent>
              <TabsContent value="feedback">
                <section className="mt-8 animate-in fade-in zoom-in-95 duration-500">
                  <h2 className="text-3xl font-serif italic mb-8">Sua Opinião</h2>
                  <FeedbackForm userId={userId} userEmail={userEmail} />
                </section>
              </TabsContent>
            </Tabs>
          </main>
        </div>
      </div>
      
      <AnimatePresence>
        {showCongrats && (
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
            className="fixed bottom-8 right-8 z-50 bg-slate-900 p-6 rounded-[32px] text-white shadow-2xl flex items-center gap-6">
            <Trophy className="h-10 w-10 text-yellow-400" />
            <div>
              <p className="font-bold text-lg">Incrível!</p>
              <p className="text-slate-400 text-sm">Você concluiu: {lastCompletedTitle}</p>
            </div>
            <button onClick={() => setShowCongrats(false)}><X className="h-5 w-5" /></button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default SlimDayApp;
