export type FitnessLevel = "iniciante" | "intermediaria" | "avancada";
export type Goal = "emagrecer" | "definir" | "mais energia" | "criar constancia";
export type TimePerDay = "10" | "15" | "20" | "30";
export type MealStyle = "pratico" | "equilibrado" | "sem tempo" | "caseiro";
export type RoutineStyle = "corrida" | "moderada" | "flexivel";
export type SyncStatus = "idle" | "saving" | "synced" | "offline" | "error";
export type CyclePhase = "menstruação" | "menstruação_final" | "ovulação" | "fértil" | "neutro";
export type OnboardingStep = "intro" | "nome" | "medidas_calendario" | "objetivo" | "nivel" | "tempo" | "rotina" | "refeicao" | "done" | "oferta";

export type Profile = {
  refeicao: MealStyle;
  rotina: RoutineStyle;
  nome: string;
  idade: string;
  altura: string;
  peso: string;
  objetivo: Goal;
  nivel: FitnessLevel;
  tempo: TimePerDay;
  ultimoCiclo?: string;
  duracaoCiclo?: string;
  duracaoMenstruacao?: string;
  cycleTrialStartedAt?: string;
  cycleOfferRefused?: boolean;
  cycleLastChanceRefused?: boolean;
};

export type RecipeDetail = {
  ingredientes: string[];
  preparo: string[];
};

export type PlanItem = {
  id: string;
  titulo: string;
  descricao: string;
  minutos?: number;
  nivel?: string;
  categoria?: string;
  objetivos?: Goal[];
  calorias?: string;
  tutorial?: string[];
  dificuldade?: "leve" | "moderado" | "intenso";
  cuidado?: string;
  explicacaoSimples?: string;
  youtubeId?: string;
  receita?: RecipeDetail;
};

export type PlanItemWithRecipe = PlanItem & { receita?: RecipeDetail };

export type DayPlan = {
  day: string;
  foco: string;
  treino: string;
  refeicao: string;
  minutos: number;
};

export type DailyMessage = {
  title: string;
  body: string;
};

export type NotificationItem = {
  id: string;
  title: string;
  body: string;
  tone: "motivacao" | "retomada" | "conquista";
  createdAt: string;
};

export type CycleDay = {
  dateKey: string;
  dayNumber: number;
  phase: CyclePhase;
  label: string;
};

export type PersistedState = {
  cyclePurchasedWithApp?: boolean;
  cyclePrice?: number;
  cycleUnlocked?: boolean;
  trialStartDate?: string;
  profile: Profile;
  completed: Record<string, boolean>;
  started: boolean;
  activeTab: string;
  lastActiveDate: string;
  streak: number;
  notifications: NotificationItem[];
  planHiddenUntil?: string;
};
