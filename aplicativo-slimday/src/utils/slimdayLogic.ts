import { 
  Profile, 
  Goal, 
  FitnessLevel, 
  TimePerDay, 
  MealStyle, 
  RoutineStyle, 
  CycleDay, 
  CyclePhase, 
  NotificationItem,
  PlanItem,
  PlanItemWithRecipe,
  DayPlan
} from "../types/slimday";
import { DAILY_MESSAGES, recipeBank, phaseTreats, exerciseBank } from "../constants/slimdayData";

function seededShuffle<T>(array: T[], seed: string): T[] {
  const result = [...array];
  let seedNum = seed.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  for (let i = result.length - 1; i > 0; i--) {
    seedNum = (seedNum * 9301 + 49297) % 233280;
    const j = Math.floor((seedNum / 233280) * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function buildDailyMealPlan(profile: Profile, date: Date): PlanItemWithRecipe[] {
  const styleBank = recipeBank[profile.refeicao] || [];
  
  // 1. Filtrar o banco pelo objetivo da pessoa (se a receita tiver objetivos definidos)
  const filteredBank = styleBank.filter(item => {
    if (!item.objetivos || item.objetivos.length === 0) return true;
    return item.objetivos.includes(profile.objetivo);
  });

  const categories = ["Café da Manhã", "Almoço", "Lanche da Tarde", "Lanche", "Jantar"];
  const dateSeed = toDateKey(date);
  
  const dailyPlan: PlanItemWithRecipe[] = [];

  // 2. Selecionar um item de cada uma das 5 categorias principais
  categories.forEach((cat, idx) => {
    const catOptions = filteredBank.filter(item => item.categoria === cat);
    if (catOptions.length > 0) {
      const shuffled = seededShuffle(catOptions, dateSeed + idx);
      dailyPlan.push(shuffled[0]);
    } else {
      // Fallback: se não houver na categoria específica filtrada pelo objetivo, tentar no banco geral daquele estilo
      const fallbackOptions = styleBank.filter(item => item.categoria === cat);
      if (fallbackOptions.length > 0) {
        const shuffled = seededShuffle(fallbackOptions, dateSeed + idx);
        dailyPlan.push(shuffled[0]);
      }
    }
  });

  // 3. Adicionar o "Docinho Fit" (Sexta opção) vindo do Cycle Treats
  const cycleDays = buildCycleCalendar(profile, date);
  const dayData = cycleDays.find(d => d.dateKey === dateSeed);
  const phase = dayData?.phase || "neutro";
  const treats = phaseTreats[phase] || phaseTreats["neutro"];
  
  if (treats.length > 0) {
    const shuffledTreats = seededShuffle(treats, dateSeed + "treat");
    const chosenTreat = shuffledTreats[0];
    dailyPlan.push({
      id: `treat-${dateSeed}`,
      titulo: chosenTreat.titulo,
      descricao: chosenTreat.descricao,
      categoria: "Docinho Pós-Janta",
      receita: chosenTreat.receita
    } as PlanItemWithRecipe);
  }

  return dailyPlan;
}

export const sanitizeDecimal = (val: string) => {
  let cleaned = val.replace(/[^0-9,.]/g, "");
  cleaned = cleaned.replace(/\./g, ",");
  const commaCount = (cleaned.match(/,/g) || []).length;
  if (commaCount > 1) return "";
  return cleaned;
};

export const sanitizeName = (val: string) => {
  return val.replace(/[^a-zA-ZáàâãéèêíïóôõúüçÁÀÂÃÉÈÍÏÓÔÕÚÜÇ\s-]/g, "").slice(0, 50);
};

export const isGibberish = (name: string): string | null => {
  const n = name.trim();
  if (n.length === 0) return null;
  if (n.length < 2) return "O nome é muito curto.";
  if (/(.)\1{3,}/.test(n.toLowerCase())) return "O nome parece inválido (repetições excessivas).";
  const hasVowels = /[aeiouáàâãéèêíïóôõúüçÁÀÂÃÉÈÍÏÓÔÕÚÜÇ]/i.test(n);
  if (!hasVowels && n.length > 3) return "O nome não parece real (falta de vogais).";
  if (/[bcdfghjklmnpqrstvwxyz]{5,}/i.test(n)) return "O nome contém sequências de letras inválidas.";
  return null;
};

export function buildWorkoutPlan(profile: Profile, date: Date = new Date()): PlanItem[] {
  const minutes = Number(profile.tempo);
  const baseMinutes = Math.min(Math.max(minutes, 10), 20);
  
  // Selecionar o banco baseado no nível (com fallbacks de segurança)
  const pool = exerciseBank[profile.nivel as FitnessLevel] || exerciseBank.iniciante || [];
  
  // Sorteio baseado na data para garantir que o treino mude a cada 24h, mas seja o mesmo se atualizar a página
  const dateSeed = toDateKey(date) + "workout";
  const shuffled = seededShuffle(pool, dateSeed);
  
  // Selecionar 5 exercícios variados
  const chosen = shuffled.slice(0, 5);

  return chosen.map((item, index) => ({
    id: `w-${index}-${dateSeed}`,
    titulo: item.titulo,
    descricao: item.descricao,
    minutos: Math.max(3, Math.round(baseMinutes / chosen.length)),
    nivel: profile.nivel,
    categoria: "Treino do dia",
    tutorial: item.tutorial,
    explicacaoSimples: item.explicacaoSimples,
    cuidado: item.cuidado,
    youtubeId: item.youtubeId
  }));
}

export function buildMealPlan(profile: Profile): PlanItemWithRecipe[] {
  // Lógica simplificada de demonstração baseada no estilo
  const options = {
    pratico: [
      { id: "m1", titulo: "Omelete Rápido", descricao: "Proteína pura para começar o dia.", categoria: "Café da Manhã", minutos: 5, nivel: "iniciante", receita: { ingredientes: ["2 ovos", "Espinafre"], preparo: ["Bata e frite."] } },
      { id: "m2", titulo: "Salada de Atum", descricao: "Almoço sem fogão.", categoria: "Almoço", minutos: 5, nivel: "iniciante" },
    ],
    equilibrado: [],
    "sem tempo": [],
    caseiro: [],
  };
  return options[profile.refeicao] || options.pratico;
}

export function buildWeekFocus(profile: Profile): string[] {
  return ["Desintoxicação", "Queima Intensa", "Definição", "Manutenção"];
}

export function buildWeekSchedule(profile: Profile): any[] {
  return [
    { day: "SEG", foco: "Corpo todo", refeicao: "Proteica", minutos: profile.tempo },
    { day: "TER", foco: "Cardio", refeicao: "Leve", minutos: profile.tempo },
    { day: "QUA", foco: "Descanso Ativo", refeicao: "Equilibrada", minutos: "10" },
    { day: "QUI", foco: "Membros Inferiores", refeicao: "Proteica", minutos: profile.tempo },
    { day: "SEX", foco: "Membros Superiores", refeicao: "Leve", minutos: profile.tempo },
  ];
}

export function getDayBasedMessage(date: Date) {
  const index = date.getDay() % DAILY_MESSAGES.length;
  return DAILY_MESSAGES[index];
}

export function getCongratsMessage(count: number) {
  if (count <= 1) return "Primeiro passo dado!";
  if (count <= 3) return "Você está pegando o ritmo!";
  return "Incrível! Meta do dia batida!";
}

export function getPhaseTitle(phase: CyclePhase) {
  const titles: Record<CyclePhase, string> = {
    menstruação: "Fase Menstrual (Vermelha)",
    menstruação_final: "Fase Pós-Menstrual (Azul)",
    ovulação: "Pico Ovulatório (Roxo)",
    fértil: "Janela Fértil (Destaque)",
    neutro: "Fase de Estabilidade",
  };
  return titles[phase];
}

export function toDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function getDayDiff(a: Date, b: Date) {
  const first = new Date(a);
  const second = new Date(b);
  first.setHours(0, 0, 0, 0);
  second.setHours(0, 0, 0, 0);
  return Math.round((first.getTime() - second.getTime()) / (1000 * 60 * 60 * 24));
}

export function getReengagementMessage(days: number) {
  if (days === 1) return "Sentimos sua falta ontem. Que tal voltar hoje?";
  return `Você está a ${days} dias fora. Vamos recomeçar leve?`;
}

export function getProfileSummary(profile: Profile) {
  const namePart = profile.nome ? `${profile.nome}, ` : "";
  const summary = `${namePart}focada em ${profile.objetivo} com nível ${profile.nivel}.`;
  return summary.charAt(0).toUpperCase() + summary.slice(1);
}

export function buildCycleCalendar(profile: Profile, baseDate: Date): CycleDay[] {
  if (!profile.ultimoCiclo) return [];
  
  const cycleLength = Number(profile.duracaoCiclo) || 28;
  const periodLength = Number(profile.duracaoMenstruacao) || 5;
  const startOfCycle = new Date(`${profile.ultimoCiclo}T12:00:00`);
  if (Number.isNaN(startOfCycle.getTime())) return [];

  // 1. Encontrar o primeiro dia do mês da baseDate
  const year = baseDate.getFullYear();
  const month = baseDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1, 12, 0, 0, 0);
  
  // 2. Calcular o preenchimento inicial (0 = Dom, 1 = Seg, etc.)
  const padding = firstDayOfMonth.getDay();
  
  // 3. Dias totais no mês
  const lastDayOfMonth = new Date(year, month + 1, 0).getDate();
  
  const days: CycleDay[] = [];

  // Adicionar dias de preenchimento (vazios)
  for (let p = 0; p < padding; p++) {
    days.push({ 
      dateKey: `padding-${p}`, 
      dayNumber: 0, 
      phase: "neutro", 
      label: "",
      isPadding: true 
    } as any);
  }

  // Adicionar os dias reais do mês
  for (let d = 1; d <= lastDayOfMonth; d++) {
    const current = new Date(year, month, d, 12, 0, 0, 0);
    
    // Lógica da fase (baseada no início do último ciclo)
    const diffDays = Math.floor((current.getTime() - startOfCycle.getTime()) / (1000 * 60 * 60 * 24));
    const dayInCycle = ((diffDays % cycleLength) + cycleLength) % cycleLength;
    
    let phase: CyclePhase = "neutro";
    let label = "Fase de equilíbrio";
    
    // 1. Menstruação (Ativa) - Baseada na duração real informada
    if (dayInCycle < periodLength) { 
      phase = "menstruação"; 
      label = "Menstruação"; 
    } 
    // 2. Final da Menstruação (Transição) - 2 dias fixos após o término
    else if (dayInCycle < periodLength + 2) { 
      phase = "menstruação_final"; 
      label = "Final da menstruação"; 
    } 
    // 3. Janela Fértil e Ovulação (Baseada no final do ciclo)
    else if (dayInCycle >= cycleLength - 16 && dayInCycle <= cycleLength - 12) { 
      phase = "fértil"; 
      label = "Janela fértil"; 
    }
    
    // Sobrescreve para Ovulação se for o dia exato
    if (dayInCycle === cycleLength - 14) { 
      phase = "ovulação"; 
      label = "Ovulação estimada"; 
    }

    days.push({ 
      dateKey: toDateKey(current), 
      dayNumber: d, 
      phase, 
      label 
    });
  }

  return days;
}

export function detectCycleDelay(profile: Profile): { isDelayed: boolean; days: number; message: string | null } {
  if (!profile.ultimoCiclo) return { isDelayed: false, days: 0, message: null };
  
  const cycleLength = Number(profile.duracaoCiclo) || 28;
  const lastStart = new Date(`${profile.ultimoCiclo}T12:00:00`);
  const expectedNext = new Date(lastStart);
  expectedNext.setDate(lastStart.getDate() + cycleLength);
  
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  
  const diffDays = Math.floor((today.getTime() - expectedNext.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays > 0) {
    let message = "Seu ciclo está um pouco atrasado.";
    if (diffDays > 7 && diffDays <= 14) {
      message = "Notamos um atraso de mais de uma semana. Que tal um teste de bem-estar?";
    } else if (diffDays > 14) {
      message = "Atraso significativo detectado. Recomendamos consultar um especialista ou realizar um teste de gravidez por precaução.";
    }
    return { isDelayed: true, days: diffDays, message };
  }
  
  return { isDelayed: false, days: 0, message: null };
}

export function buildNotification(title: string, body: string, tone: NotificationItem["tone"]): NotificationItem {
  return { id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, title, body, tone, createdAt: new Date().toISOString() };
}
