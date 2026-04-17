const fs = require('fs');
const path = 'c:/Users/joaov/OneDrive/Área de Trabalho/Codigo app/aplicativo-slimday/aplicativo-slimday/src/components/SlimDayApp.tsx';

if (!fs.existsSync(path)) {
    console.error("File not found");
    process.exit(1);
}

let content = fs.readFileSync(path, 'utf8');
let lines = content.split('\n');

// 1. Identify where the component starts
const compStart = lines.findIndex(l => l.includes('export default function SlimDayApp()'));

// 2. Identify all the hooks we need to organize
const findLine = (text) => lines.findIndex(l => l.includes(text));

const hooks = {
    workoutPlan: findLine('const workoutPlan = useMemo'),
    mealPlan: findLine('const mealPlan = useMemo'),
    todayKey: findLine('const todayKey = useMemo'),
    todayCycleCalendar: findLine('const todayCycleCalendar = useMemo'),
    currentCycleDay: findLine('const currentCycleDay ='),
    checklistItems: findLine('const checklistItems = useMemo'),
    completedCount: findLine('const completedCount = Object.values'),
    progress: findLine('const progress = Math.round'),
    bmi: findLine('const bmi = useMemo(() =>'),
    dayMessage: findLine('const dayMessage = useMemo(() => getDayBasedMessage'),
};

// We will extract and then re-insert in a safe order.
// Dependencies are:
// currentDate -> todayCycleCalendar, todayKey, dayMessage
// profile -> workoutPlan, todayCycleCalendar, mealPlan, bmi
// todayCycleCalendar + todayKey -> currentCycleDay
// currentCycleDay -> mealPlan
// workoutPlan + mealPlan -> checklistItems
// checklistItems -> totalCount, progress

// Let's create the final ordered sequence of code for this section.
// We will replace everything between lines 140 and 240 with a clean version.

// Wait, I will just rewrite the whole component body from line 63 to the first UI return.
// It's safer.

const organizedHooks = `
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
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("synced");
  const [authReady, setAuthReady] = useState(false);

  const [feedbackSubject, setFeedbackSubject] = useState("sugestao");
  const [feedbackMessage, setFeedbackMessage] = useState("");

  const [profile, setProfile] = useState<Profile>(defaultProfile);
  const [started, setStarted] = useState(false);
  const [completed, setCompleted] = useState<Record<string, boolean>>({});
  const [showCongrats, setShowCongrats] = useState(false);
  const [lastCompletedTitle, setLastCompletedTitle] = useState("");
  const [activeTab, setActiveTab] = useState("hoje");
  const [savedToast, setSavedToast] = useState(false);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [calendarMonth, setCalendarMonth] = useState<Date>(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
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
  const [onboardingDismissed, setOnboardingDismissed] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);
  const [showSlimDayHealthPortal, setShowSlimDayHealthPortal] = useState(false);
  const [showMenstruationEndPrompt, setShowMenstruationEndPrompt] = useState(false);
  const [showMenstruationConfirm, setShowMenstruationConfirm] = useState(false);
  const [delayAlertShown, setDelayAlertShown] = useState(false);
  const [expandedRecipeId, setExpandedRecipeId] = useState<string | null>(null);
  const [waterCups, setWaterCups] = useState(0);
  const [expandedWorkoutId, setExpandedWorkoutId] = useState<string | null>(null);

  const syncTimeoutRef = useRef<number | null>(null);
  const profileLoadedRef = useRef(false);

  // --- DEPENDENCY CHAIN START ---
  
  // 1. Core Data derived from profile/currentDate
  const workoutPlan = useMemo(() => buildWorkoutPlan(profile), [profile]);
  const todayKey = useMemo(() => toDateKey(currentDate), [currentDate]);
  const todayCycleCalendar = useMemo(() => buildCycleCalendar(profile, currentDate, 1), [profile, currentDate]);
  const currentCycleDay = useMemo(() => {
     return todayCycleCalendar.find((day) => day.dateKey === todayKey) ?? todayCycleCalendar[0] ?? null;
  }, [todayCycleCalendar, todayKey]);

  // 2. Data derived from currentCycleDay
  const mealPlan = useMemo(() => {
    const base = buildMealPlan(profile);
    if (currentCycleDay?.phase === "menstruacao" || currentCycleDay?.phase === "menstruacao_final") {
       const treats = phaseTreats[currentCycleDay.phase];
       if (treats && treats.length > 0) {
         const randomTreat = treats[Math.floor(Math.random() * treats.length)];
         return [
           ...base,
           { 
             id: "treat-" + randomTreat.titulo, 
             titulo: "🍬 Docinho do Ciclo: " + randomTreat.titulo, 
             descricao: randomTreat.descricao, 
             categoria: "Alívio TPM", 
             receita: randomTreat.receita 
           }
         ];
       }
    }
    return base;
  }, [profile, currentCycleDay?.phase]);

  // 3. Data derived from Plans
  const checklistItems = useMemo(() => [
      ...workoutPlan.map((w) => ({ id: w.id, titulo: w.titulo, tipo: "treino" })),
      ...mealPlan.map((m) => ({ id: m.id, titulo: m.titulo, tipo: "alimentação" })),
      { id: "agua", titulo: "Beber água ao longo do dia", tipo: "hábito" },
      { id: "sono", titulo: "Dormir melhor hoje", tipo: "hábito" },
      { id: "pausa", titulo: "Fazer uma pausa consciente", tipo: "bem-estar" },
  ], [workoutPlan, mealPlan]);

  // 4. Final UI stats
  const completedCount = Object.values(completed).filter(Boolean).length;
  const totalCount = checklistItems.length;
  const progress = Math.round((completedCount / totalCount) * 100) || 0;
  const dayMessage = useMemo(() => getDayBasedMessage(currentDate), [currentDate]);
  
  const bmi = useMemo(() => {
    const w = Number(profile.peso);
    const h = Number(profile.altura) / 100;
    if (!w || !h) return null;
    return (w / (h * h)).toFixed(1);
  }, [profile.peso, profile.altura]);

  const cycleCalendar = useMemo(() => {
    const base = new Date(currentDate);
    base.setDate(base.getDate() - base.getDay());
    base.setDate(base.getDate() - 7);
    return buildCycleCalendar(profile, base, 42); 
  }, [profile, currentDate]);

  // --- DEPENDENCY CHAIN END ---
`;

// Find where the component function ends its "setup" (before the first useEffect)
const useEffectIndex = lines.findIndex(l => l.includes('useEffect(() => {'));
const remaining = lines.slice(useEffectIndex).join('\n');

const finalContent = lines.slice(0, compStart + 1).join('\n') + organizedHooks + remaining;

fs.writeFileSync(path, finalContent, 'utf8');
console.log("Hook order fully corrected via rebuild.");
