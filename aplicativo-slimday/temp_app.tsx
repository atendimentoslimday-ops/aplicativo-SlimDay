import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import placeholderImg from "../assets/video_placeholder.png"; // thumbnail padrão
import { recipeImages } from "@/assets/recipes";


import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import {
  CheckCircle2,
  Clock3,
  Salad,
  Dumbbell,
  Sparkles,
  ChevronLeft, ChevronRight, ChevronDown, ChevronUp,
  Trophy,
  Flame,
  Heart,
  Apple,
  BadgeCheck,
  CalendarDays,
  Utensils,
  Target,
  Waves,
  Sun,
  Moon,
  BarChart3,
  PlayCircle,
  RefreshCcw,
  BookOpen,
  Lock,
  Mail,
  User,
  Cloud,
  CloudOff,
  ShieldCheck,
  LogOut,
  ShoppingCart,
  MessageCircle,
  Send,
  Video,
  Star,
  Zap,
  Home,
  Bell,
  BellOff,
  Check,
  MapPin,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

const ADMIN_EMAILS = ["atendimentoslimday@gmail.com"];
const DEV_MASTER_KEY = "-=x22450-.çA=-//\\"; 

// --- HELPERS DE VALIDAÇÃO INTELIGENTE ---

const sanitizeDecimal = (val: string) => {
  // Remove tudo que não for número, vírgula ou ponto
  let cleaned = val.replace(/[^0-9,.]/g, "");
  // Padroniza para vírgula para consistência visual
  cleaned = cleaned.replace(/\./g, ",");
  
  // Se houver mais de uma vírgula, reseta o campo conforme pedido
  const commaCount = (cleaned.match(/,/g) || []).length;
  if (commaCount > 1) return "";
  
  return cleaned;
};

const sanitizeName = (val: string) => {
  // Permite apenas letras (incluindo acentos), espaços e hífens
  return val.replace(/[^a-zA-ZáàâãéèêíïóôõúüçÁÀÂÃÉÈÍÏÓÔÕÚÜÇ\s-]/g, "").slice(0, 50);
};

const isGibberish = (name: string): string | null => {
  const n = name.trim().toLowerCase();
  if (n.length === 0) return null;
  if (n.length < 2) return "O nome é muito curto.";
  if (n.length > 50) return "O nome é muito longo.";

  // Impede números ou caracteres especiais que já deveriam ter sido limpos, mas por segurança adicional
  if (/[0-9]/.test(n)) return "O nome não deve conter números.";
  
  // Heurística: não pode ter 3 letras iguais seguidas (ex: aaa) - mais rigoroso
  if (/(.)\1{2,}/.test(n)) return "O nome parece inválido (repetições excessivas).";
  
  // Heurística: Pelo menos 2 caracteres diferentes
  const uniqueChars = new Set(n.replace(/\s/g, "").split(""));
  if (uniqueChars.size < 2 && n.length > 2) return "O nome parece inválido.";

  // Heurística: nomes reais geralmente têm pelo menos uma vogal e uma consoante (exceto nomes curtíssimos como 'Ana')
  const hasVowels = /[aeiouáàâãéèêíïóôõúüç]/i.test(n);
  const hasConsonants = /[bcdfghjklmnpqrstvwxyz]/i.test(n);
  
  if (!hasVowels && n.length >= 3) return "Um nome real deve conter vogais.";
  if (!hasConsonants && n.length >= 4) return "O nome parece inválido (falta de consoantes).";
  
  // Heurística: sequências de consoantes impossíveis (ex: qwrtyp) - reduzido para 4
  if (/[bcdfghjklmnpqrstvwxyz]{4,}/i.test(n)) return "O nome contém sequências de letras improváveis.";
  
  // Bloqueio de sequências de teclado comuns
  const junkPatterns = ["asdf", "sdfg", "dfgh", "fghj", "ghjk", "hjkl", "qwerty", "werty", "ertyu", "rtyui", "tyuio", "yuiop", "zxcv", "xcvb", "cvbn", "vbnm"];
  if (junkPatterns.some(p => n.includes(p))) return "O nome parece uma sequência aleatória.";

  return null;
};


type FitnessLevel = "iniciante" | "intermediaria" | "avancada" | "elite";
type Goal = "emagrecer" | "definir" | "mais energia" | "criar constancia";
type TimePerDay = "10" | "15" | "20" | "30";
type MealStyle = "pratico" | "equilibrado" | "sem tempo" | "caseiro";
type RoutineStyle = "corrida" | "moderada" | "flexivel";
type SyncStatus = "idle" | "saving" | "synced" | "offline" | "error";
type CyclePhase = "menstruação" | "menstruação_final" | "ovulação" | "fértil" | "neutro";

type Profile = {
  ultimoCiclo?: string;
  duracaoCiclo?: string;
  duracaoMenstruacao?: string;
  nome: string;
  idade: string;
  altura: string;
  peso: string;
  objetivo: Goal;
  nivel: FitnessLevel;
  tempo: TimePerDay;
  rotina: RoutineStyle;
  refeicao: MealStyle;
  projectStartDate?: string;
  menstruationExtended?: boolean;
};

type PlanItem = {
  id: string;
  titulo: string;
  descricao: string;
  minutos?: number;
  nivel?: string;
  categoria?: "Slim Cardio" | "Slim Glúteos" | "Slim Core" | "Slim Braços" | "Slim Zen" | string;
  calorias?: string;
  tutorial?: string[];
  dificuldade?: "leve" | "moderado" | "intenso";
  cuidado?: string;
  explicacaoSimples?: string;
  youtubeId?: string;
};

type DayPlan = {
  day: string;
  foco: string;
  treino: string;
  refeicao: string;
  minutos: number;
};

type DailyMessage = {
  title: string;
  body: string;
};

type NotificationItem = {
  id: string;
  title: string;
  body: string;
  tone: "motivacao" | "retomada" | "conquista";
  createdAt: string;
};

type AuthUser = {
  id: string;
  nome: string;
  email: string;
};

type CycleDay = {
  dateKey: string;
  dayNumber: number;
  phase: CyclePhase;
  label: string;
};

type PersistedState = {
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

const defaultProfile: Profile = {
  ultimoCiclo: "",
  duracaoCiclo: "28",
  duracaoMenstruacao: "5",
  nome: "",
  idade: "",
  altura: "",
  peso: "",
  objetivo: "emagrecer",
  nivel: "iniciante",
  tempo: "15",
  rotina: "corrida",
  refeicao: "pratico",
  projectStartDate: new Date().toISOString(),
  menstruationExtended: false,
};

const dailyMessages: DailyMessage[] = [
  { title: "Todo dia conta", body: "Mesmo uma rotina curta hoje já ajuda você a continuar no caminho certo." },
  { title: "Seu ritmo importa", body: "Você não precisa fazer tudo de uma vez. O importante é voltar e manter constância." },
  { title: "Começar leve ainda é começar", body: "Treinos curtos e refeições simples também constroem resultado quando viram hábito." },
  { title: "Seu progresso gosta de repetição", body: "Quanto mais você volta, mais natural sua nova rotina fica." },
  { title: "Hoje é uma nova chance", body: "Retomar o plano hoje ajuda a manter o progresso mais vivo e consistente." },
  { title: "Pequenas vitórias acumulam", body: "Cada etapa concluída fortalece sua confiança e facilita o próximo passo." },
  { title: "Voltar faz diferença", body: "Ficar muitos dias sem abrir o plano pode enfraquecer seu ritmo. Recomeçar hoje já recoloca você no eixo." },
];

function FeedbackForm({ userEmail }: { userEmail: string }) {
  const [feedbackType, setFeedbackType] = useState<string>("sugestao");
  const [feedbackMsg, setFeedbackMsg] = useState("");
  const [feedbackName, setFeedbackName] = useState("");
  const [feedbackEmail, setFeedbackEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSendFeedback = async () => {
    if (!feedbackMsg.trim()) return;
    setSending(true);
    try {
      await supabase.functions.invoke("send-feedback", {
        body: {
          type: feedbackType,
          message: feedbackMsg.trim().slice(0, 2000),
          name: feedbackName.trim().slice(0, 100) || userEmail || "Anônimo",
          email: feedbackEmail.trim().slice(0, 255),
        },
      });
      setSent(true);
      setFeedbackMsg("");
      setFeedbackName("");
      setFeedbackEmail("");
      setTimeout(() => setSent(false), 5000);
    } catch {
      // silently handle
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-3xl border bg-white p-5 space-y-4">
        <div>
          <Label className="text-sm font-semibold text-slate-700">Seu nome (opcional)</Label>
          <Input
            className="mt-1 rounded-2xl"
            placeholder="Como quer ser chamada?"
            value={feedbackName}
            onChange={(e) => setFeedbackName(e.target.value)}
            maxLength={100}
          />
        </div>
        <div>
          <Label className="text-sm font-semibold text-slate-700">Seu e-mail (opcional)</Label>
          <Input
            className="mt-1 rounded-2xl"
            placeholder="Para podermos te responder"
            type="email"
            value={feedbackEmail}
            onChange={(e) => setFeedbackEmail(e.target.value)}
            maxLength={255}
          />
        </div>
        <div>
          <Label className="text-sm font-semibold text-slate-700">Tipo de feedback</Label>
          <Select value={feedbackType} onValueChange={setFeedbackType}>
            <SelectTrigger className="mt-1 rounded-2xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sugestao">💡 Sugestão de melhoria</SelectItem>
              <SelectItem value="ideia">🌟 Nova ideia</SelectItem>
              <SelectItem value="problema">🪲 Algo não funcionou</SelectItem>
              <SelectItem value="elogio">💖 Elogio</SelectItem>
              <SelectItem value="outro">📝 Outro</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-sm font-semibold text-slate-700">Sua mensagem</Label>
          <Textarea
            className="mt-1 min-h-[120px] rounded-2xl"
            placeholder="Conte pra gente o que você gostaria de ver no app, o que pode melhorar ou qualquer coisa que queira compartilhar 🌈"
            value={feedbackMsg}
            onChange={(e) => setFeedbackMsg(e.target.value)}
            maxLength={2000}
          />
          <div className="mt-1 text-right text-xs text-slate-400">{feedbackMsg.length}/2000</div>
        </div>

        {sent ? (
          <div className="rounded-2xl bg-rose-50 p-4 text-center">
            <div className="text-lg font-bold text-rose-700">Recebemos! 💖</div>
            <div className="mt-1 text-sm text-rose-600">Obrigada pelo seu feedback. Ele é muito valioso pra nós!</div>
          </div>
        ) : (
          <Button
            onClick={handleSendFeedback}
            disabled={!feedbackMsg.trim() || sending}
            className="w-full rounded-2xl bg-pink-500 hover:bg-pink-600 text-white gap-2"
          >
            <Send className="h-4 w-4" />
            {sending ? "Enviando..." : "Enviar feedback"}
          </Button>
        )}
      </div>
    </div>
  );
}

type RecipeDetail = {
  ingredientes: string[];
  preparo: string[];
};

type PlanItemWithRecipe = PlanItem & { receita?: RecipeDetail };

const recipeBank: Record<MealStyle, PlanItemWithRecipe[]> = {
  pratico: [
    { id: "rp1", titulo: "Omelete com queijo branco", descricao: "Pronto em poucos minutos e bom para começar o dia.", categoria: "Receita rápida", calorias: "~280 kcal", receita: { ingredientes: ["2 ovos", "30g de queijo branco (minas ou cottage)", "1 colher de chá de azeite", "Sal e pimenta a gosto", "Ervas finas (opcional)"], preparo: ["Quebre os ovos em uma tigela e bata levemente com um garfo.", "Aqueça uma frigideira antiaderente com o azeite em fogo médio.", "Despeje os ovos e distribua o queijo por cima.", "Quando as bordas firmarem, dobre ao meio.", "Cozinhe por mais 1 minuto e sirva."] } },
    { id: "rp2", titulo: "Frango desfiado com arroz e salada", descricao: "Prato simples para deixar adiantado.", categoria: "Receita rápida", calorias: "~430 kcal", receita: { ingredientes: ["150g de peito de frango", "1/2 xícara de arroz cozido", "Folhas verdes (alface, rúcula)", "1/2 tomate picado", "1 colher de sopa de azeite", "Sal, alho e limão a gosto"], preparo: ["Cozinhe o peito de frango em água com sal e alho por 20 minutos.", "Desfie o frango com dois garfos.", "Monte o prato com arroz, frango desfiado e salada.", "Tempere a salada com azeite e limão.", "Pode deixar pronto na geladeira para o dia seguinte."] } },
    { id: "rp3", titulo: "Iogurte com banana e aveia", descricao: "Lanche fácil para a tarde corrida.", categoria: "Receita rápida", calorias: "~210 kcal", receita: { ingredientes: ["1 pote de iogurte natural (170g)", "1 banana madura", "2 colheres de sopa de aveia em flocos", "Canela em pó a gosto", "1 colher de chá de mel (opcional)"], preparo: ["Coloque o iogurte em uma tigela ou copo.", "Corte a banana em rodelas por cima.", "Adicione a aveia e a canela.", "Misture levemente se preferir ou coma em camadas.", "Pronto em 2 minutos!"] } },
  ],
  equilibrado: [
    { id: "re1", titulo: "Peixe com legumes e purê", descricao: "Mais equilíbrio com preparo simples.", categoria: "Receita equilibrada", calorias: "~410 kcal", receita: { ingredientes: ["1 filé de tilápia ou merluza (150g)", "1 batata média", "1/2 cenoura", "1/2 abobrinha", "1 colher de sopa de azeite", "Sal, limão e ervas a gosto", "1 colher de sopa de leite (para o purê)"], preparo: ["Cozinhe a batata descascada e amasse com leite e sal para o purê.", "Corte a cenoura e abobrinha em cubos e refogue no azeite por 5 min.", "Tempere o peixe com sal e limão.", "Grelhe o peixe em frigideira com azeite por 3-4 min de cada lado.", "Monte o prato com purê, legumes e o peixe por cima."] } },
    { id: "re2", titulo: "Wrap de frango com folhas", descricao: "Boa opção para almoço leve.", categoria: "Receita equilibrada", calorias: "~330 kcal", receita: { ingredientes: ["1 tortilha integral", "100g de frango desfiado ou em tiras", "Folhas de alface e rúcula", "2 fatias de tomate", "1 colher de sopa de requeijão light", "Temperos a gosto"], preparo: ["Aqueça a tortilha levemente numa frigideira seca.", "Espalhe o requeijão na tortilha.", "Distribua o frango, as folhas e o tomate.", "Enrole bem apertado.", "Corte ao meio na diagonal e sirva."] } },
    { id: "re3", titulo: "Crepioca com recheio leve", descricao: "Versátil e fácil de adaptar.", categoria: "Receita equilibrada", calorias: "~290 kcal", receita: { ingredientes: ["1 ovo", "2 colheres de sopa de tapioca", "Recheio: queijo branco + tomate ou frango desfiado", "Sal a gosto"], preparo: ["Misture o ovo com a tapioca e o sal.", "Aqueça uma frigideira antiaderente em fogo médio.", "Despeje a mistura e espalhe como uma panqueca.", "Quando firmar por baixo, adicione o recheio.", "Dobre ao meio e sirva."] } },
  ],
  "sem tempo": [
    { id: "st1", titulo: "Shake proteico com fruta", descricao: "Opção prática para correria real.", categoria: "Receita express", calorias: "~250 kcal", receita: { ingredientes: ["200ml de leite (ou bebida vegetal)", "1 banana congelada", "1 colher de sopa de pasta de amendoim", "1 scoop de whey ou 2 colheres de leite em pó", "Gelo a gosto"], preparo: ["Coloque todos os ingredientes no liquidificador.", "Bata por 30 segundos até ficar cremoso.", "Sirva gelado.", "Variação: troque banana por morango congelado."] } },
    { id: "st2", titulo: "Sanduíche leve de atum", descricao: "Fácil de montar e levar.", categoria: "Receita express", calorias: "~320 kcal", receita: { ingredientes: ["2 fatias de pão integral", "1 lata pequena de atum (escorrido)", "1 colher de sopa de requeijão light", "Folhas de alface", "Tomate em fatias", "Sal e limão a gosto"], preparo: ["Escorra bem o atum e misture com requeijão e limão.", "Monte o sanduíche com alface e tomate.", "Embrulhe em papel filme para levar.", "Pode fazer na noite anterior."] } },
    { id: "st3", titulo: "Pote de overnight oats", descricao: "Fica pronto na noite anterior.", categoria: "Receita express", calorias: "~260 kcal", receita: { ingredientes: ["3 colheres de sopa de aveia em flocos", "150ml de leite ou iogurte", "1 colher de chá de chia", "Frutas picadas (morango, banana)", "1 colher de chá de mel (opcional)", "Canela a gosto"], preparo: ["Misture aveia, leite/iogurte e chia em um pote com tampa.", "Adicione mel e canela.", "Tampe e leve à geladeira por no mínimo 6 horas (ou de um dia pro outro).", "Na manhã seguinte, adicione as frutas por cima.", "Coma frio direto do pote."] } },
  ],
  caseiro: [
    { id: "ca1", titulo: "Arroz, feijão, frango e salada", descricao: "Base caseira prática e eficiente.", categoria: "Receita caseira", calorias: "~460 kcal", receita: { ingredientes: ["1/2 xícara de arroz cozido", "1 concha de feijão", "1 filé de frango grelhado (150g)", "Salada: alface, tomate, cenoura ralada", "1 colher de sopa de azeite", "Temperos: sal, alho, cebola, limão"], preparo: ["Cozinhe o arroz e o feijão normalmente (pode usar panela de pressão).", "Tempere o frango com sal e alho, grelhe em frigideira com um fio de azeite.", "Lave e corte os vegetais da salada.", "Monte o prato equilibrando porções.", "Tempere a salada com azeite e limão."] } },
    { id: "ca2", titulo: "Sopa de legumes com carne", descricao: "Confortável e simples para o jantar.", categoria: "Receita caseira", calorias: "~300 kcal", receita: { ingredientes: ["100g de carne moída magra (ou músculo em cubos)", "1 batata pequena", "1/2 cenoura", "1/2 abobrinha", "1/2 cebola", "2 dentes de alho", "Sal, pimenta e salsinha a gosto", "500ml de água"], preparo: ["Refogue a cebola e o alho em um fio de azeite.", "Adicione a carne e refogue até dourar.", "Acrescente os legumes cortados em cubos e a água.", "Cozinhe em fogo médio por 25-30 minutos até tudo ficar macio.", "Ajuste o sal e finalize com salsinha picada."] } },
    { id: "ca3", titulo: "Ovos mexidos com pão integral", descricao: "Simples, rápido e acessível.", categoria: "Receita caseira", calorias: "~290 kcal", receita: { ingredientes: ["2 ovos", "1 colher de chá de manteiga ou azeite", "2 fatias de pão integral", "Sal e pimenta a gosto", "Tomate em rodelas (acompanhamento)", "Ervas finas ou cebolinha (opcional)"], preparo: ["Quebre os ovos em uma tigela e bata levemente.", "Aqueça a manteiga em frigideira em fogo baixo.", "Despeje os ovos e mexa devagar com espátula.", "Retire do fogo quando ainda estiverem cremosos (não secar demais).", "Sirva com as fatias de pão e tomate ao lado."] } },
  ],
};

const mealBase: Record<string, PlanItemWithRecipe[]> = {
  cafe: [
    { id: "c1", titulo: "Iogurte com fruta e aveia", descricao: "Fácil de montar, leve e prático para manhàcorrida.", categoria: "Café da manhã", receita: { ingredientes: ["1 pote de iogurte natural (170g)", "1 fruta picada (banana, morango ou maçã)", "2 colheres de sopa de aveia em flocos", "Canela a gosto", "1 colher de chá de mel (opcional)"], preparo: ["Coloque o iogurte em uma tigela.", "Adicione a fruta picada por cima.", "Salpique a aveia e a canela.", "Finalize com mel se desejar.", "Pronto em 2 minutos!"] } },
    { id: "c2", titulo: "Omelete simples + tomate", descricao: "Boa opção para mais saciedade e preparo rápido.", categoria: "Café da manhã", receita: { ingredientes: ["2 ovos", "1 tomate pequeno fatiado", "1 colher de chá de azeite", "Sal e orégano a gosto", "Queijo branco a gosto (opcional)"], preparo: ["Bata os ovos com sal em uma tigela.", "Aqueça o azeite em frigideira antiaderente.", "Despeje os ovos e distribua tomate e queijo.", "Quando firmar, dobre ao meio.", "Sirva com o restante do tomate ao lado."] } },
  ],
  almoco: [
    { id: "a1", titulo: "Frango grelhado + arroz + salada", descricao: "Combinação simples, fácil de repetir na rotina.", categoria: "Almoço", receita: { ingredientes: ["1 filé de peito de frango (150g)", "1/2 xícara de arroz cozido", "Salada verde (alface, rúcula, tomate)", "1 colher de sopa de azeite", "Sal, alho e limão a gosto"], preparo: ["Tempere o frango com sal e alho.", "Grelhe em frigideira com azeite por 4-5 min de cada lado.", "Sirva com arroz e salada temperada com azeite e limão.", "Dica: deixe o frango temperado desde a noite anterior."] } },
    { id: "a2", titulo: "Carne moída + legumes + batata", descricao: "Prato prático, acessível e fácil de deixar pronto.", categoria: "Almoço", receita: { ingredientes: ["150g de carne moída magra", "1 batata média cozida", "1/2 cenoura picada", "1/2 abobrinha picada", "1/2 cebola e 2 dentes de alho", "Sal, pimenta e cheiro-verde a gosto"], preparo: ["Refogue cebola e alho em azeite.", "Adicione a carne moída e mexa até dourar.", "Acrescente cenoura e abobrinha, cozinhe 5 min.", "Sirva com a batata cozida ao lado.", "Finalize com cheiro-verde."] } },
  ],
  lanche: [
    { id: "l1", titulo: "Fruta + castanhas", descricao: "Lanche rápido para não sair da rotina.", categoria: "Lanche", receita: { ingredientes: ["1 fruta da estação (maçã, pera ou banana)", "5 a 8 castanhas (caju, pará ou nozes)"], preparo: ["Lave a fruta e corte se preferir.", "Separe a porção de castanhas.", "Coma junto para maior saciedade.", "Ideal para levar na bolsa."] } },
    { id: "l2", titulo: "Iogurte proteico ou sanduíche leve", descricao: "Ajuda a manter energia e praticidade.", categoria: "Lanche", receita: { ingredientes: ["Opção 1: 1 iogurte proteico pronto", "Opção 2: 2 fatias de pão integral + queijo branco + alface", "Temperos a gosto"], preparo: ["Opção 1: abra o iogurte e consuma direto.", "Opção 2: monte o sanduíche com queijo e alface.", "Escolha a opção que for mais prática no dia."] } },
  ],
  jantar: [
    { id: "j1", titulo: "Sopa leve com proteína", descricao: "Boa para a noite e fácil de preparar.", categoria: "Jantar", receita: { ingredientes: ["100g de frango desfiado ou carne moída", "1 batata pequena picada", "1/2 cenoura picada", "1/2 chuchu picada", "1/2 cebola e alho", "500ml de água", "Sal e salsinha a gosto"], preparo: ["Refogue cebola e alho em azeite.", "Adicione a proteína e refogue.", "Acrescente os legumes e a água.", "Cozinhe por 25 minutos em fogo médio.", "Finalize com salsinha e ajuste o sal."] } },
    { id: "j2", titulo: "Omelete + salada + legumes", descricao: "Jantar rápido para dias corridos.", categoria: "Jantar", receita: { ingredientes: ["2 ovos", "Legumes: brócolis ou abobrinha refogada", "Salada verde", "1 colher de chá de azeite", "Sal e temperos a gosto"], preparo: ["Bata os ovos com sal.", "Faça a omelete em frigideira com azeite.", "Refogue os legumes separadamente.", "Monte o prato com omelete, legumes e salada.", "Pronto em 10 minutos."] } },
  ],
};

const phaseTreats: Record<CyclePhase, { titulo: string; descricao: string; receita?: RecipeDetail }[]> = {
  menstruação: [
    { titulo: "Brigadeiro fit de cacau", descricao: "Feito com cacau, aveia e toque de pasta de amendoim. Ajuda a matar a vontade de doce com porção menor.", receita: { ingredientes: ["2 colheres de sopa de cacau em pó", "2 colheres de sopa de aveia em flocos finos", "1 colher de sopa de pasta de amendoim", "1 colher de sopa de mel ou adoçante", "1 colher de sopa de leite (ou bebida vegetal)"], preparo: ["Misture todos os ingredientes secos em uma tigela.", "Adicione a pasta de amendoim e o mel.", "Acrescente o leite aos poucos até formar uma massa.", "Faça bolinhas com as mãos.", "Passe no cacau em pó e leve à geladeira por 30 min."] } },
    { titulo: "Banana morna com canela e cacau", descricao: "Doce rápido e acolhedor para os dias de fluxo mais intenso.", receita: { ingredientes: ["1 banana madura", "1 colher de chá de canela em pó", "1 colher de chá de cacau em pó", "1 colher de chá de mel (opcional)"], preparo: ["Corte a banana ao meio no sentido do comprimento.", "Coloque em uma frigideira antiaderente em fogo médio.", "Aqueça por 2 minutos de cada lado.", "Salpique canela e cacau por cima.", "Finalize com mel se desejar."] } },
  ],
  menstruação_final: [
    { titulo: "Mousse fit de iogurte com cacau", descricao: "Sobremesa leve para o final do período, com boa saciedade.", receita: { ingredientes: ["1 pote de iogurte natural (170g)", "1 colher de sopa de cacau em pó", "1 colher de chá de mel ou adoçante", "Frutas vermelhas para decorar (opcional)"], preparo: ["Misture o iogurte com o cacau e o mel.", "Bata com um garfo até ficar homogêneo.", "Coloque em um copinho.", "Decore com frutas vermelhas.", "Leve à geladeira por 15 min para firmar."] } },
    { titulo: "Morango com chocolate 70%", descricao: "Pequena porção para aliviar a vontade de doce sem exagerar.", receita: { ingredientes: ["6 morangos grandes", "30g de chocolate 70% cacau"], preparo: ["Lave e seque bem os morangos.", "Derreta o chocolate em banho-maria ou micro-ondas (em intervalos de 15s).", "Mergulhe cada morango até a metade no chocolate.", "Coloque em papel manteiga.", "Leve à geladeira por 20 min até firmar."] } },
  ],
  ovulação: [
    { titulo: "Frozen de frutas vermelhas", descricao: "Refrescante, leve e fácil de encaixar no plano de emagrecimento.", receita: { ingredientes: ["1 xícara de frutas vermelhas congeladas (morango, mirtilo, framboesa)", "1/2 banana congelada", "2 colheres de sopa de iogurte natural"], preparo: ["Bata tudo no liquidificador ou processador.", "Raspe as laterais e bata novamente até ficar cremoso.", "Sirva imediatamente em uma tigela.", "Decore com frutas frescas ou granola se desejar."] } },
    { titulo: "Iogurte proteico com chia", descricao: "Doce equilibrado para manter saciedade e energia.", receita: { ingredientes: ["1 pote de iogurte proteico (170g)", "1 colher de sopa de chia", "Frutas picadas a gosto", "Canela a gosto"], preparo: ["Misture o iogurte com la chia.", "Deixe descansar por 10 minutos para a chia hidratar.", "Adicione as frutas picadas.", "Salpique canela por cima.", "Pronto!"] } },
  ],
  fértil: [
    { titulo: "Maçã assada com canela", descricao: "Doce simples e controlado para um lanche mais leve.", receita: { ingredientes: ["1 maçã", "Canela em pó a gosto", "1 colher de chá de mel (opcional)", "Cravo (opcional)"], preparo: ["Retire o miolo da maçã sem cortar a base.", "Polvilhe canela por dentro e por fora.", "Adicione mel e cravo se desejar.", "Asse no forno a 180°C por 25-30 min.", "Sirva morna."] } },
    { titulo: "Creme fit de abacate com cacau", descricao: "Textura cremosa e boa saciedade em pequena porção.", receita: { ingredientes: ["1/2 abacate maduro", "1 colher de sopa de cacau em pó", "1 colher de chá de mel ou adoçante", "1 colher de sopa de leite (opcional para cremosidade)"], preparo: ["Amasse o abacate com um garfo até ficar cremoso.", "Adicione o cacau e o mel.", "Misture bem até ficar homogêneo.", "Adicione leite se quiser mais cremoso.", "Sirva gelado em um copinho."] } },
  ],
  neutro: [
    { titulo: "Cookie fit de banana e aveia", descricao: "Fácil de preparar e ótimo para controlar a porção.", receita: { ingredientes: ["2 bananas maduras", "1 xícara de aveia em flocos", "1 colher de sopa de cacau em pó (opcional)", "Gotas de chocolate 70% (opcional)", "Canela a gosto"], preparo: ["Amasse as bananas com um garfo.", "Misture com a aveia, cacau e canela.", "Adicione gotas de chocolate se desejar.", "Faça bolinhas e achate em forma de cookie.", "Asse a 180°C por 15-20 min."] } },
    { titulo: "Pudim fit de chia", descricao: "Boa opção de docinho com sensação de sobremesa.", receita: { ingredientes: ["3 colheres de sopa de chia", "200ml de leite (ou bebida vegetal)", "1 colher de chá de essência de baunilha", "1 colher de chá de mel ou adoçante", "Frutas para decorar"], preparo: ["Misture chia, leite, baunilha e mel.", "Mexa bem para distribuir as sementes.", "Tampe e leve à geladeira por 4 horas ou de um dia pro outro.", "Mexa uma vez após 30 min para evitar grumos.", "Sirva com frutas por cima."] } },
  ],
};

const tutorialMap: Record<string, string[]> = {
  "Ponte unilateral": ["Deite-se de costas e levante uma perna esticada.", "Suba o quadril usando apenas a força da perna apoiada.", "Contraia o glúteo no topo e desça devagar."],
  "Polichinelo frontal": ["Abra e feche as pernas enquanto alterna os braços para frente.", "Mantenha o ritmo constante e abdômen firme.", "Respire sincronizado com o movimento."],
  "Skater hops": ["Salte lateralmente de um pé para o outro.", "Incline o tronco levemente e use os braços para equilíbrio.", "Pouse suavemente com o joelho flexionado."],
  "Salto estrela": ["Comece agachada e salte abrindo braços e pernas no ar.", "Pouse suavemente voltando para a posição de agachamento.", "Mantenha o peito aberto e olhe para frente."],
  "Burpee sem salto": ["Coloque as mãos no chão, leve os pés para trás um de cada vez.", "Volte os pés para frente e fique de pé.", "Ótima opção para cardio sem impacto."],
  "Corrida calcanhar no glúteo": ["Corra no lugar tentando encostar os calcanhares no bumbum.", "Mantenha o tronco levemente inclinado para frente.", "Use os braços para manter o ritmo."],
  "Mountain climber rápido": ["Na posição de prancha, alterne os joelhos rapidamente.", "Mantenha o quadril fixo e o core muito firme.", "Aumente a velocidade para máxima queima."],
  "Afundo cruzado": ["Dê um passo para trás e para o lado, cruzando por trás da perna da frente.", "Desça o joelho de trás em direção ao chão.", "Mantenha o tronco reto e volte ao centro."],
  "Agachamento com salto": ["Faça um agachamento e suba com um salto explosivo.", "Pouse suavemente e já inicie o próximo agachamento.", "Mantenha o controle e a postura."],
  "Coice em 4 apoios": ["Em 4 apoios, chute uma perna para trás e para cima.", "Mantenha a perna esticada ou dobrada, focando no glúteo.", "Não deixe a lombar arquivar demais."],
  "Abdução de quadril deitada": ["Deite-se de lado com as pernas esticadas ou dobradas.", "Suba a perna de cima mantendo o pé apontado para frente.", "Sinta a lateral do glúteo trabalhar e desça devagar."],
  "Agachamento lateral": ["Dê um passo largo para o lado e flexione esse joelho.", "Mantenha a outra perna esticada e o peito aberto.", "Empurre o chão para voltar ao centro."],
  "Afundo com elevação de joelho": ["Faça um afundo para trás.", "Ao subir, leve esse mesmo joelho em direção ao peito.", "Mantenha o equilíbrio e repita."],
  "Ponte glúteo pés elevados": ["Deite-se de costas com os pés apoiados em um banco ou sofá.", "Suba o quadril contraindo bem os glúteos.", "Desça devagar sentindo o esforço posterior."],
  "Agachamento isométrico": ["Desça no agachamento até onde for confortável.", "Segure a posição pelo tempo indicado.", "Mantenha as costas retas e o peso nos calcanhares."],
  "Abdominal bicicleta": ["Deitado, leve o cotovelo em direção ao joelho oposto.", "Simule o movimento de pedalar com as pernas.", "Mantenha o abdômen contraído o tempo todo."],
  "Prancha rotação quadril": ["Na posição de prancha, gire o quadril para um lado e para o outro.", "Tente quase encostar o quadril no chão.", "Mantenha os antebraços fixos no lugar."],
  "Abdominal canivete": ["Deitado, suba braços e pernas esticados ao mesmo tempo.", "Tente tocar os pés no ponto mais alto.", "Desça com controle sem encostar tudo no chão."],
  "Toque no calcanhar": ["Deitado com joelhos dobrados, toque as mãos nos calcanhares.", "Alterne os lados contraindo a lateral do abdômen.", "Mantenha o pescoço relaxado."],
  "Abdominal infra tesoura": ["Deitado, faça movimentos de tesoura com as pernas esticadas.", "Não deixe a lombar sair do chão.", "Cruze as pernas alternadamente por cima e por baixo."],
  "Perdigueiro": ["Em 4 apoios, estique o braço direito e a perna esquerda.", "Mantenha o equilíbrio e o corpo alinhado.", "Troque os lados com controle total."],
  "Twist Russo": ["Sentada, incline o tronco e gire as mãos de um lado para o outro.", "Se quiser mais desafio, tire os pés do chão.", "Mantenha o abdômen firme no movimento."],
  "Prancha aranha": ["Na posição de prancha, leve o joelho para a lateral do cotovelo.", "Mantenha o corpo reto e o quadril baixo.", "Alterne os lados focando na lateral do core."],
  "Flexão diamante": ["Faça um diamante com as mãos (polegares e índices se tocando).", "Realize a flexão mantendo os cotovelos próximos ao corpo.", "Foco intenso no tríceps e peito."],
  "Desenvolvimento com garrafa": ["Segure uma garrafa em cada mão na altura dos ombros.", "Empurre para cima até esticar os braços.", "Desça devagar até a altura das orelhas."],
  "Remada curvada com garrafa": ["Incline o tronco à frente com costas retas.", "Puxe as garrafas em direção às costelas unindo as escápulas.", "Estique os braços novamente e repita."],
  "Circundução de braços": ["Estique os braços lateralmente na altura dos ombros.", "Faça pequenos círculos constantes para frente ou para trás.", "Mantenha a postura e os ombros firmes."],
  "Alongamento Gato-Vaca": ["Em 4 apoios, arredonde as costas olhando para o umbigo.", "Depois afunde as costas olhando para frente.", "Respire fundo e siga o ritmo da coluna."],
  "Postura da criança": ["Sente-se sobre os calcanhares e leve os braços à frente no chão.", "Relaxe a testa no chão e sinta alongar as costas.", "Respire profundamente e solte a tensão."],
  "Rotação de tronco sentado": ["Sentada no chão, cruze uma perna sobre a outra.", "Gire o tronco para o lado da perna cruzada usando o braço de apoio.", "Sinta o alongamento na coluna e glúteo."],
  "Alongamento trapézio": ["Puxe suavemente a cabeça para um lado com o braço oposto relaxado.", "Sinta alongar a lateral do pescoço.", "Respire e troque o lado com suavidade."],
  "Prancha toca joelho": ["Na posição de prancha, tire uma mão e toque o joelho oposto.", "Mantenha o quadril firme e não deixe o corpo rodar.", "Alterne os lados com controle."],
  "Panturrilha no degrau": ["Apoie a ponta dos pés em um degrau.", "Suba o máximo que puder e desça alongando bem.", "Mantenha o equilíbrio e faça o movimento lento."],
  "Polichinelo tapa pé": ["Faça um polichinelo alternando um toque da mão no pé oposto por trás.", "Mantenha a coordenação e o ritmo.", "Foco em agilidade e cardio."],
  "Mergulho no sofá": ["Apoie as mãos na beirada de um sofá ou cadeira.", "Desça o corpo dobrando os cotovelos e suba com força.", "Mantenha as costas próximas ao apoio."],
  "Agachamento sumô com pulinho": ["Faça um agachamento sumô e dê um pequeno salto no topo.", "Aterrisse suavemente e desça novamente.", "Sinta a explosão nas pernas e glúteos."],
  "Abdominal remador": ["Deitado, suba o tronco abraçando os joelhos ao mesmo tempo.", "Volte à posição inicial esticando braços e pernas.", "Movimento fluido e controlado."],
  "Prancha abre e fecha pernas": ["Na posição de prancha, dê pequenos saltos abrindo e fechando as pernas.", "Não deixe o quadril subir durante os saltos.", "Cardio intenso na prancha."],
  "Alongamento posterior": ["Sentada ou em pé, tente tocar as pontas dos pés.", "Mantenha as pernas esticadas e relaxe o pescoço.", "Respire fundo e sinta alongar."],
  "Rotação de braço": ["Estique os braços e faça círculos amplos e lentos.", "Mantenha os ombros relaxados e a postura reta.", "Soltura e mobilidade para a parte superior."],
  "Afundo lateral dinâmico": ["Dê um passo lateral grande, agache em uma perna e volte.", "Alterne os lados com fluidez.", "Fortalecimento lateral intenso."],
  "Escalador horizontal": ["Na posição de prancha, leve o joelho para fora em direção ao ombro.", "Mantenha o corpo paralelo ao chão.", "Foco em oblíquos e força de core."],
  "Alongamento peitoral": ["Apoie um braço na parede e gire o corpo para o lado oposto.", "Sinta alongar a região do peito e ombro.", "Respire fundo e troque o lado."],
};

const exerciseMeta: Record<string, Partial<PlanItem>> = {
  "Finisher SlimDay": { categoria: "Slim Cardio", dificuldade: "intenso", cuidado: "Feche forte, mas sem sacrificar a execução.", explicacaoSimples: "É o bloco final para terminar com sensação de missão cumprida.", youtubeId: "TU8QYVW0gDU" },
  "Elevação pélvica": { categoria: "Slim Glúteos", dificuldade: "leve", cuidado: "Não force a lombar, suba usando os glúteos.", explicacaoSimples: "É levantar o quadril do chão e apertar o bumbum." },
  "Prancha de joelhos": { categoria: "Slim Core", dificuldade: "leve", cuidado: "Mantenha o pescoço alinhado com a coluna.", explicacaoSimples: "É ficar paradinha apoiada nos braços e joelhos." },
  "Polichinelo adaptado": { categoria: "Slim Cardio", dificuldade: "leve", cuidado: "Se sentir dor no ombro, não suba os braços até o topo.", explicacaoSimples: "É o polichinelo sem pulo, um passo de cada vez." },
  "4 apoios (Glúteos)": { categoria: "Slim Glúteos", dificuldade: "leve", cuidado: "Não deixe a barriga cair, mantenha firme.", explicacaoSimples: "É chutar o teto estando de joelhos no chão." },
  "Mobilidade de escápulas": { categoria: "Slim Zen", dificuldade: "leve", cuidado: "Mova apenas os ombros, não os braços.", explicacaoSimples: "É 'afundar' e 'empurrar' o peito para soltar os ombros." },
  "Alongamento guiado": { categoria: "Slim Zen", dificuldade: "leve", cuidado: "Respire fundo e não force o limite da articulação.", explicacaoSimples: "Um fechamento suave para relaxar os músculos." },
  "Braço com garrafa": { categoria: "Slim Braços", dificuldade: "leve", cuidado: "Mantenha os cotovelos fixos ao lado do corpo.", explicacaoSimples: "Treino simples de braços usando garrafas como peso." },
  "Mountain Climber": { categoria: "Slim Core", dificuldade: "moderado", cuidado: "Não eleve muito o quadril, mantenha-o baixo.", explicacaoSimples: "É como se estivesse subindo uma montanha no chão." },
  "Tríceps no banco": { categoria: "Slim Braços", dificuldade: "moderado", cuidado: "Mantenha as costas próximas ao banco.", explicacaoSimples: "É descer e subir usando a força do 'tchau'." },
  "Stiff": { categoria: "Slim Glúteos", dificuldade: "moderado", cuidado: "Mantenha a coluna reta o tempo todo.", explicacaoSimples: "É descer o corpo resto para alongar atrás das pernas." },
  "Prancha Lateral": { categoria: "Slim Core", dificuldade: "moderado", cuidado: "Não deixe o quadril cair em direção ao chão.", explicacaoSimples: "É ficar de ladinho tirando o corpo do chão." },
  "Agachamento Sumô": { categoria: "Slim Glúteos", dificuldade: "moderado", cuidado: "Mantenha os joelhos na direção dos dedos dos pés.", explicacaoSimples: "É o agachamento com as pernas mais abertas." },
  "Remada alta": { categoria: "Slim Braços", dificuldade: "moderado", cuidado: "Não levante os ombros até as orelhas.", explicacaoSimples: "É puxar o peso até o queixo como um remador." },
  "Burpee completo": { categoria: "Slim Cardio", dificuldade: "intenso", cuidado: "Cuidado no impacto do pulo ao voltar.", explicacaoSimples: "O exercício mais completo: chão, peito e salto." },
  "Afundo Búlgaro": { categoria: "Slim Glúteos", dificuldade: "intenso", cuidado: "O tronco pode inclinar levemente para frente.", explicacaoSimples: "Afundo com um pé elevado, o 'terror' das pernas." },
  "V-ups": { categoria: "Slim Core", dificuldade: "intenso", cuidado: "Tente subir o tronco e pernas juntos.", explicacaoSimples: "Um abdominal 'canivete' para fechar o corpo." },
  "Agachamento com Salto Sumô": { categoria: "Slim Glúteos", dificuldade: "intenso", cuidado: "Aterrisse suave com as pontas dos pés primeiro.", explicacaoSimples: "Agachamento aberto com salto para explosão." },
  "Flexão de braços": { categoria: "Slim Braços", dificuldade: "intenso", cuidado: "Mantenha o corpo como uma tábua, sem cair.", explicacaoSimples: "A clássica flexão para braços e peito." },
  "Prancha sobe e desce": { categoria: "Slim Core", dificuldade: "intenso", cuidado: "Mantenha o quadril o mais parado possível.", explicacaoSimples: "É revezar entre apoiar as mãos e os cotovelos." },
  "Skipping alto": { categoria: "Slim Cardio", dificuldade: "intenso", cuidado: "Aterrisse suave com a ponta dos pés.", explicacaoSimples: "Corrida no lugar focada em elevar os batimentos." },
  "Agachamento na parede": { categoria: "Slim Glúteos", dificuldade: "moderado", cuidado: "Joelhos nunca devem passar da linha dos pés.", explicacaoSimples: "Força estática para pernas mais fortes." },
  "Abdominal infra": { categoria: "Slim Core", dificuldade: "moderado", cuidado: "Se a lombar doer, não desça tanto as pernas.", explicacaoSimples: "Foco total na parte baixa do abdômen." },
  "Superman": { categoria: "Slim Zen", dificuldade: "leve", cuidado: "Olhe para o chão para não forçar o pescoço.", explicacaoSimples: "Fortalecimento para as costas e postura." },
  "Prancha toque no ombro": { categoria: "Slim Core", dificuldade: "moderado", cuidado: "Tente não balançar o corpo para os lados.", explicacaoSimples: "Equilíbrio e estabilidade do tronco." },
  "Escalador cruzado": { categoria: "Slim Core", dificuldade: "moderado", cuidado: "Mantenha os ombros em cima dos pulsos.", explicacaoSimples: "Trabalha abdômen e queima calorias." },
  "Dips no chão": { categoria: "Slim Braços", dificuldade: "moderado", cuidado: "Mantenha os cotovelos apontando para trás.", explicacaoSimples: "Treino de braços usando apenas o peso do corpo." },
  "Ponte unilateral": { categoria: "Slim Glúteos", dificuldade: "moderado", cuidado: "Não deixe o quadril girar ou cair para o lado.", explicacaoSimples: "Fortalecimento intenso de glúteo e lombar." },
  "Polichinelo frontal": { categoria: "Slim Cardio", dificuldade: "leve", cuidado: "Mantenha o controle da respiração.", explicacaoSimples: "Cardio simples e eficiente para aquecer." },
  "Skater hops": { categoria: "Slim Cardio", dificuldade: "moderado", cuidado: "Pouse com o calcanhar firme para estabilidade.", explicacaoSimples: "Equilíbrio lateral e queima de calorias." },
  "Salto estrela": { categoria: "Slim Cardio", dificuldade: "intenso", cuidado: "Absorva o impacto dobrando bem os joelhos.", explicacaoSimples: "Explosão total para elevar os batimentos." },
  "Burpee sem salto": { categoria: "Slim Cardio", dificuldade: "moderado", cuidado: "Mantenha a prancha firme ao esticar as pernas.", explicacaoSimples: "O poder do burpee sem o impacto do pulo." },
  "Corrida calcanhar no glúteo": { categoria: "Slim Cardio", dificuldade: "leve", cuidado: "Toque suave para não machucar os pés.", explicacaoSimples: "Aquecimento para pernas e cardio leve." },
  "Mountain climber rápido": { categoria: "Slim Cardio", dificuldade: "intenso", cuidado: "Não deixe o quadril subir demais.", explicacaoSimples: "Velocidade máxima para fritar o abdômen." },
  "Afundo cruzado": { categoria: "Slim Glúteos", dificuldade: "moderado", cuidado: "Mantenha o joelho da frente alinhado.", explicacaoSimples: "Foco na lateral do bumbum e culote." },
  "Agachamento com salto": { categoria: "Slim Glúteos", dificuldade: "intenso", cuidado: "Cuidado com o impacto na descida.", explicacaoSimples: "Pernas fortes e explosividade." },
  "Coice em 4 apoios": { categoria: "Slim Glúteos", dificuldade: "leve", cuidado: "Aperte o bumbum no topo do movimento.", explicacaoSimples: "Isolamento clássico para glúteo firme." },
  "Abdução de quadril deitada": { categoria: "Slim Glúteos", dificuldade: "leve", cuidado: "Movimento lento para sentir o glúteo médio.", explicacaoSimples: "Contorno lateral para os quadris." },
  "Agachamento lateral": { categoria: "Slim Glúteos", dificuldade: "moderado", cuidado: "Mantenha o calcanhar da perna flexionada no chão.", explicacaoSimples: "Amplitude e força interna da coxa." },
  "Afundo com elevação de joelho": { categoria: "Slim Glúteos", dificuldade: "moderado", cuidado: "Equilíbrio é fundamental aqui.", explicacaoSimples: "Potência de pernas e estabilidade." },
  "Ponte glúteo pés elevados": { categoria: "Slim Glúteos", dificuldade: "moderado", cuidado: "Não desça o quadril completamente entre as reps.", explicacaoSimples: "Foco profundo no posterior de coxa." },
  "Agachamento isométrico": { categoria: "Slim Glúteos", dificuldade: "leve", cuidado: "Respire fundo enquanto segura.", explicacaoSimples: "Resistência muscular sem movimento." },
  "Abdominal bicicleta": { categoria: "Slim Core", dificuldade: "moderado", cuidado: "Gire o tronco, não apenas os braços.", explicacaoSimples: "O melhor para definir o abdômen por completo." },
  "Prancha rotação quadril": { categoria: "Slim Core", dificuldade: "moderado", cuidado: "Mantenha o core contraído o tempo todo.", explicacaoSimples: "Cintura fina com rotação de core." },
  "Abdominal canivete": { categoria: "Slim Core", dificuldade: "intenso", cuidado: "Não force o pescoço, use o abdômen.", explicacaoSimples: "Desafio total para a musculatura frontal." },
  "Toque no calcanhar": { categoria: "Slim Core", dificuldade: "leve", cuidado: "Mantenha o queixo longe do peito.", explicacaoSimples: "Lateral do abdômen bem trabalhada." },
  "Abdominal infra tesoura": { categoria: "Slim Core", dificuldade: "moderado", cuidado: "Pernas baixas exigem mais, mas não arqueie a lombar.", explicacaoSimples: "Força intensa no abdômen inferior." },
  "Perdigueiro": { categoria: "Slim Core", dificuldade: "leve", cuidado: "Encontre o equilíbrio antes de trocar.", explicacaoSimples: "Estabilidade de coluna e consciência corporal." },
  "Twist Russo": { categoria: "Slim Core", dificuldade: "moderado", cuidado: "Não gire o pescoço bruscamente.", explicacaoSimples: "Oblíquos definidos com toque lateral." },
  "Prancha aranha": { categoria: "Slim Core", dificuldade: "intenso", cuidado: "Tente não balançar o corpo.", explicacaoSimples: "Core de aço com movimento lateral de perna." },
  "Flexão diamante": { categoria: "Slim Braços", dificuldade: "intenso", cuidado: "Se estiver difícil, faça com joelhos no chão.", explicacaoSimples: "O toque de mestre para tríceps e peito." },
  "Desenvolvimento com garrafa": { categoria: "Slim Braços", dificuldade: "leve", cuidado: "Não estique os cotovelos bruscamente.", explicacaoSimples: "Ombros desenhados sem sair de casa." },
  "Remada curvada com garrafa": { categoria: "Slim Braços", dificuldade: "moderado", cuidado: "Cotovelos bem próximos ao corpo.", explicacaoSimples: "Postura elegante e costas fortes." },
  "Circundução de braços": { categoria: "Slim Braços", dificuldade: "leve", cuidado: "Mantenha a altura dos ombros.", explicacaoSimples: "Tonificação leve e resistência de braços." },
  "Alongamento Gato-Vaca": { categoria: "Slim Zen", dificuldade: "leve", cuidado: "Movimento fluido com a respiração.", explicacaoSimples: "Saúde e alívio para sua coluna." },
  "Postura da criança": { categoria: "Slim Zen", dificuldade: "leve", cuidado: "Solte o peso do corpo levemente.", explicacaoSimples: "Relaxamento profundo e alívio lombar." },
  "Rotação de tronco sentado": { categoria: "Slim Zen", dificuldade: "leve", cuidado: "Não force a rotação além do seu limite.", explicacaoSimples: "Soltura de quadril e coluna em um só." },
  "Alongamento trapézio": { categoria: "Slim Zen", dificuldade: "leve", cuidado: "Não puxe com força, apenas encoste a mão.", explicacaoSimples: "Alívio de tensão no pescoço e ombros." },
  "Prancha toca joelho": { categoria: "Slim Core", dificuldade: "moderado", cuidado: "Mantenha o abdômen bem contraído.", explicacaoSimples: "Equilíbrio em 3 apoios para um core forte." },
  "Panturrilha no degrau": { categoria: "Slim Glúteos", dificuldade: "leve", cuidado: "Use um apoio se precisar de equilíbrio.", explicacaoSimples: "Pernas torneadas e circulação melhorada." },
  "Polichinelo tapa pé": { categoria: "Slim Cardio", dificuldade: "moderado", cuidado: "Foco na coordenação para não tropeçar.", explicacaoSimples: "Variação divertida para queimar calorias." },
  "Mergulho no sofá": { categoria: "Slim Braços", dificuldade: "moderado", cuidado: "Não desça além do conforto dos ombros.", explicacaoSimples: "Tríceps firme sem equipamentos." },
  "Agachamento sumô com pulinho": { categoria: "Slim Glúteos", dificuldade: "intenso", cuidado: "Pouse com a ponta dos pés para amortecer.", explicacaoSimples: "Potência extra para resultados rápidos." },
  "Abdominal remador": { categoria: "Slim Core", dificuldade: "intenso", cuidado: "Solte o ar ao subir abraçando os joelhos.", explicacaoSimples: "Fortalecimento completo do abdômen." },
  "Prancha abre e fecha pernas": { categoria: "Slim Cardio", dificuldade: "intenso", cuidado: "Mantenha a prancha estável durante os saltos.", explicacaoSimples: "Desafio de cardio e core ao mesmo tempo." },
  "Alongamento posterior": { categoria: "Slim Zen", dificuldade: "leve", cuidado: "Não balance, sustente o alongamento.", explicacaoSimples: "Flexibilidade para pernas e alívio lombar." },
  "Rotação de braço": { categoria: "Slim Braços", dificuldade: "leve", cuidado: "Movimentos controlados e sem pressa.", explicacaoSimples: "Mobilidade e relaxamento para os ombros." },
  "Afundo lateral dinâmico": { categoria: "Slim Glúteos", dificuldade: "moderado", cuidado: "Empurre o calcanhar para voltar ao centro.", explicacaoSimples: "Mobilidade de quadril e força lateral." },
  "Escalador horizontal": { categoria: "Slim Core", dificuldade: "moderado", cuidado: "Tente não girar o quadril.", explicacaoSimples: "Core estável e funcional." },
  "Alongamento peitoral": { categoria: "Slim Zen", dificuldade: "leve", cuidado: "Respire fundo enquanto alonga.", explicacaoSimples: "Melhora a postura e abre o tórax." },
};

function buildWorkoutPlan(profile: Profile): PlanItem[] {
  const minutes = Number(profile.tempo);
  const baseMinutes = Math.min(Math.max(minutes, 10), 20);
  
  const pools = {
    beginner: [
      ["Caminhada no lugar + mobilidade", "Ativação leve para começar sem pressão."],
      ["Agachamento assistido", "Foco em pernas e constância."],
      ["Braço com garrafa", "Movimento simples para parte superior."],
      ["Abdominal leve em pé", "Menos impacto, mais adaptação."],
      ["Alongamento guiado", "Fechamento para recuperação."],
      ["Elevação pélvica", "Fortalecimento de glúteos e lombar."],
      ["Prancha de joelhos", "Core estável com menos sobrecarga."],
      ["Polichinelo adaptado", "Cardio leve sem impacto."],
      ["4 apoios (Glúteos)", "Isolamento de glúteo e estabilidade."],
      ["Mobilidade de escápulas", "Melhora postura e solta ombros."],
      ["Superman", "Fortalecimento para as costas e postura."],
      ["Dips no chão", "Tríceps usando apenas o peso do corpo."],
      ["Ponte unilateral", "Fortalecimento focado em glúteo."],
      ["Polichinelo frontal", "Cardio simples e eficiente para aquecer."],
      ["Corrida calcanhar no glúteo", "Aquecimento para pernas e cardio leve."],
      ["Coice em 4 apoios", "Isolamento clássico para glúteo firme."],
      ["Abdução de quadril deitada", "Contorno lateral para os quadris."],
      ["Agachamento isométrico", "Resistência muscular sem movimento."],
      ["Alongamento Gato-Vaca", "Saúde e alívio para sua coluna."],
      ["Postura da criança", "Relaxamento profundo e alívio lombar."],
      ["Panturrilha no degrau", "Pernas torneadas e circulação melhorada."],
      ["Alongamento posterior", "Flexibilidade para pernas e alívio lombar."],
      ["Rotação de braço", "Mobilidade e relaxamento para os ombros."],
      ["Alongamento peitoral", "Melhora a postura e abre o tórax."],
    ],
    intermediate: [
      ["Aquecimento dinâmico", "Corpo pronto para treinar com mais ritmo."],
      ["Agachamento + elevação de joelho", "Mais ativação e gasto energético."],
      ["Afundo alternado", "Fortalece pernas e glúteos."],
      ["Prancha curta", "Estabilidade e força de core."],
      ["Finalização metabólica", "Bloco curto e intenso dentro do seu limite."],
      ["Mountain Climber", "Foco em abdômen e queima calórica."],
      ["Tríceps no banco", "Tonificação da parte de trás do braço."],
      ["Stiff", "Posterior de coxa e postura."],
      ["Prancha Lateral", "Fortalece a lateral do abdômen."],
      ["Agachamento Sumô", "Foco em parte interna da coxa."],
      ["Remada alta", "Ombros e postura em destaque."],
      ["Agachamento na parede", "Força estática para pernas e glúteos."],
      ["Abdominal infra", "Foco em abdômen inferior."],
      ["Prancha toque no ombro", "Estabilidade de core e ombros."],
      ["Skater hops", "Equilíbrio lateral e queima de calorias."],
      ["Burpee sem salto", "O poder do burpee sem o impacto do pulo."],
      ["Afundo cruzado", "Foco na lateral do bumbum e culote."],
      ["Agachamento lateral", "Amplitude e força interna da coxa."],
      ["Desenvolvimento com garrafa", "Ombros desenhados sem sair de casa."],
      ["Remada curvada com garrafa", "Postura elegante e costas fortes."],
      ["Prancha toca joelho", "Equilíbrio em 3 apoios para um core forte."],
      ["Polichinelo tapa pé", "Variação divertida para queimar calorias."],
      ["Mergulho no sofá", "Tríceps firme sem equipamentos."],
      ["Afundo lateral dinâmico", "Mobilidade de quadril e força lateral."],
      ["Escalador horizontal", "Core estável e funcional."],
    ],
    advanced: [
      ["Aquecimento ativo", "Entrada rápida para treinar mais forte."],
      ["Agachamento com salto leve", "Mais intensidade quando já existe base."],
      ["Circuito de pernas e core", "Ritmo mais desafidador."],
      ["Prancha com variação", "Maior exigência muscular."],
      ["Finisher SlimDay", "Fechamento curto para sensação de progresso."],
      ["Burpee completo", "Intensidade máxima e queima total."],
      ["Afundo Búlgaro", "Exercício potente para pernas e glúteos."],
      ["V-ups", "Abdominal avançado para definição."],
      ["Agachamento com Salto Sumô", "Explosão muscular e cardio."],
      ["Flexão de braços", "Força de peito e braços."],
      ["Prancha sobe e desce", "Desafio extremo de core e ombros."],
      ["Skipping alto", "Cardio intenso sem sair do lugar."],
      ["Escalador cruzado", "Foco em oblíquos e resistência."],
      ["Salto estrela", "Explosão total para elevar os batimentos."],
      ["Mountain climber rápido", "Velocidade máxima para fritar o abdômen."],
      ["Agachamento com salto", "Pernas fortes e explosividade."],
      ["Afundo com elevação de joelho", "Potência de pernas e estabilidade."],
      ["Agachamento sumô com pulinho", "Potência extra para resultados rápidos."],
      ["Abdominal remador", "Fortalecimento completo do abdômen."],
      ["Prancha abre e fecha pernas", "Desafio de cardio e core ao mesmo tempo."],
    ],
    elite: [
      ["Burpee completo", "Desafio extremo de resistência e força."],
      ["Salto estrela", "Máxima potência e queima calórica."],
      ["Mountain climber rápido", "Frequência cardíaca no topo."],
      ["Afundo Búlgaro", "Deep focus em glúteos e pernas."],
      ["V-ups", "Definição máxima de core."],
      ["Prancha aranha", "Core de aço com movimento lateral."],
      ["Abdominal bicicleta", "O melhor para definir todo o abdômen."],
      ["Prancha rotação quadril", "Cintura fina com foco em oblíquos."],
      ["Abdominal canivete", "Desafio total para musculatura frontal."],
      ["Abdominal infra tesoura", "Força intensa no abdômen inferior."],
      ["Twist Russo", "Oblíquos definidos com rotação intensa."],
      ["Flexão diamante", "O toque de mestre para tríceps e peito."],
      ["Prancha sobe e desce", "Resistência extrema de core."],
      ["Agachamento com Salto Sumô", "Explosão metabólica final."],
      ["Ponte glúteo pés elevados", "Foco profundo no posterior e glúteos."],
      ["Perdigueiro", "Estabilidade de coluna em nível elite."],
      ["Circundução de braços", "Resistência isométrica de braços."],
      ["Abdominal remador", "Nível máximo de repetições e controle."],
      ["Prancha abre e fecha pernas", "Velocidade máxima e core blindado."],
    ],
  };

  const pool = profile.nivel === "iniciante" ? pools.beginner : 
               profile.nivel === "intermediaria" ? pools.intermediate : 
               profile.nivel === "avancada" ? pools.advanced : pools.elite;
  
  // Selecionar 5 exercícios do pool (embaralhando para diversidade)
  const shuffled = [...pool].sort(() => 0.5 - Math.random());
  const chosen = shuffled.slice(0, 5);

  return chosen.map((item, index) => {
    const meta = exerciseMeta[item[0]];
    return {
      id: `w-${index}`,
      titulo: item[0],
      descricao: item[1],
      minutos: Math.max(3, Math.round(baseMinutes / chosen.length)),
      nivel: profile.nivel,
      categoria: meta?.categoria || "Treino do dia",
      tutorial: tutorialMap[item[0]] ?? ["Mantenha postura confortável.", "Faça o movimento com controle.", "Reduza o ritmo se sentir necessidade."],
      dificuldade: meta?.dificuldade ?? "leve",
      cuidado: meta?.cuidado ?? "Respeite seus limites e mantenha boa postura.",
      explicacaoSimples: meta?.explicacaoSimples ?? "Movimento simples para ajudar no seu progresso.",
      youtubeId: meta?.youtubeId,
    };
  });
}

const categoryColors: Record<string, string> = {
  "Slim Cardio": "bg-red-50 text-red-600 border-red-100",
  "Slim Glúteos": "bg-rose-50 text-rose-600 border-rose-100",
  "Slim Core": "bg-amber-50 text-amber-600 border-amber-100",
  "Slim Braços": "bg-indigo-50 text-indigo-600 border-indigo-100",
  "Slim Zen": "bg-purple-50 text-purple-600 border-purple-100",
};

function buildMealPlan(profile: Profile): PlanItemWithRecipe[] {
  const practicalBoost = profile.refeicao === "sem tempo" || profile.refeicao === "pratico";
  const breakfast = practicalBoost ? mealBase.cafe[0] : mealBase.cafe[1];
  const lunch = profile.objetivo === "mais energia" ? mealBase.almoco[1] : mealBase.almoco[0];
  const snack = practicalBoost ? mealBase.lanche[0] : mealBase.lanche[1];
  const dinner = profile.rotina.includes("corr") ? mealBase.jantar[1] : mealBase.jantar[0];
  return [breakfast, lunch, snack, dinner];
}

function buildWeekFocus(profile: Profile) {
  const map: Record<Goal, string[]> = {
    emagrecer: ["Semana 1: adaptação e rotina", "Semana 2: mais consistência", "Semana 3: progressão leve", "Semana 4: ritmo firme"],
    definir: ["Semana 1: base e ativação", "Semana 2: força leve", "Semana 3: progressão muscular", "Semana 4: intensidade controlada"],
    "mais energia": ["Semana 1: ativação diária", "Semana 2: ganho de disposição", "Semana 3: ritmo estável", "Semana 4: sensação de leveza"],
    "criar constancia": ["Semana 1: começar fácil", "Semana 2: manter hábito", "Semana 3: reforçar rotina", "Semana 4: consolidar constância"],
  };
  return map[profile.objetivo];
}

function buildWeekSchedule(profile: Profile): DayPlan[] {
  const mins = Math.min(Math.max(Number(profile.tempo), 10), 20);
  const focusMap: Record<Goal, string[]> = {
    emagrecer: ["Ativação", "Pernas", "Core", "Metabólico", "Mobilidade", "Circuito leve", "Recuperação"],
    definir: ["Força leve", "Glúteos", "Braços", "Core", "Pernas", "Resistência", "Alongamento"],
    "mais energia": ["Despertar corpo", "Movimento", "Postura", "Ritmo", "Ativação", "Respiração", "Leveza"],
    "criar constancia": ["Começar fácil", "Repetir hábito", "Corpo todo", "Manter ritmo", "Postura", "Leve circuito", "Descanso ativo"],
  };
  const foodMap: Record<RoutineStyle, string[]> = {
    corrida: ["Marmita simples", "Lanche rápido", "Café prático", "Jantar leve", "Snack fácil", "Prato pronto caseiro", "Refeição leve"],
    moderada: ["Prato equilibrado", "Lanche de fruta", "Almoço simples", "Jantar rápido", "Café reforçado", "Omelete prática", "Sopa leve"],
    flexivel: ["Receita caseira", "Wrap leve", "Salada completa", "Lanche de iogurte", "Almoço balanceado", "Jantar funcional", "Refeição livre controlada"],
  };
  const days = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
  return days.map((day, index) => ({
    day,
    foco: focusMap[profile.objetivo][index],
    treino: `${mins} min de ${focusMap[profile.objetivo][index].toLowerCase()}`,
    refeicao: foodMap[profile.rotina][index],
    minutos: mins,
  }));
}

function getCongratsMessage(count: number) {
  if (count < 3) return "Boa! Cada etapa concluída fortalece sua nova rotina.";
  if (count < 6) return "Você está indo muito bem. O importante é manter o ritmo.";
  if (count < 10) return "Parabéns! Sua constância já está fazendo diferença.";
  return "Incrível! Você está construindo uma rotina de verdade.";
}

function getProfileSummary(profile: Profile) {
  if (profile.rotina === "corrida") return "Seu plano está mais enxuto, direto e pensado para dias apertados.";
  if (profile.rotina === "flexivel") return "Seu plano aproveita melhor a flexibilidade para variar sem perder foco.";
  return "Seu plano equilibra praticidade com progressão para manter constância.";
}

function getDayBasedMessage(date: Date) {
  return dailyMessages[date.getDay()];
}

function getReengagementMessage(inactiveDays: number) {
  if (inactiveDays <= 0) return "Você está acompanhando bem. Continue voltando para manter seu ritmo forte.";
  if (inactiveDays === 1) return "Você ficou 1 dia sem concluir etapas. Voltar hoje ajuda a manter o embalo do seu progresso.";
  if (inactiveDays <= 3) return `Você ficou ${inactiveDays} dias sem concluir etapas. Retomar agora pode evitar que sua rotina perca força.`;
  return `Você ficou ${inactiveDays} dias sem concluir etapas. Voltar hoje é a melhor forma de recuperar consistência sem pressão.`;
}

function toDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function getDayDiff(a: Date, b: Date) {
  const first = new Date(a);
  const second = new Date(b);
  first.setHours(0, 0, 0, 0);
  second.setHours(0, 0, 0, 0);
  return Math.round((first.getTime() - second.getTime()) / (1000 * 60 * 60 * 24));
}

function getCycleLength(profile: Profile) {
  const value = Number(profile.duracaoCiclo || 28);
  return Math.min(Math.max(value, 21), 40);
}

function getPeriodLength(profile: Profile) {
  const value = Number(profile.duracaoMenstruacao || 5);
  return Math.min(Math.max(value, 3), 10);
}

function buildCycleCalendar(profile: Profile, baseDate: Date): CycleDay[] {
  if (!profile.ultimoCiclo) return [];
  const cycleLength = getCycleLength(profile);
  const periodLength = getPeriodLength(profile);
  const start = new Date(`${profile.ultimoCiclo}T12:00:00`);
  if (Number.isNaN(start.getTime())) return [];
  const days: CycleDay[] = [];
  for (let i = 0; i < 35; i++) {
    const current = new Date(baseDate);
    current.setHours(12, 0, 0, 0);
    current.setDate(baseDate.getDate() + i);
    const diffDays = Math.floor((current.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const dayInCycle = ((diffDays % cycleLength) + cycleLength) % cycleLength;
    let phase: CyclePhase = "neutro";
    let label = "Fase neutra";
    if (dayInCycle < Math.ceil(periodLength / 2)) { phase = "menstruação"; label = "Menstruação"; }
    else if (dayInCycle < periodLength) { phase = "menstruação_final"; label = "Final da menstruação"; }
    else if (dayInCycle >= cycleLength - 16 && dayInCycle <= cycleLength - 13) { phase = "fértil"; label = "Janela fértil"; }
    if (dayInCycle === cycleLength - 14) { phase = "ovulação"; label = "Ovulação estimada"; }
    days.push({ dateKey: toDateKey(current), dayNumber: current.getDate(), phase, label });
  }
  return days;
}

function getPhaseColor(phase: CyclePhase) {
  switch (phase) {
    case "menstruação": return "bg-rose-500 text-white border-rose-500";
    case "menstruação_final": return "bg-sky-400 text-white border-sky-400";
    case "ovulação": return "bg-violet-500 text-white border-violet-500";
    case "fértil": return "bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200";
    default: return "bg-white text-slate-700 border-slate-200";
  }
}

function getPhaseTitle(phase: CyclePhase) {
  switch (phase) {
    case "menstruação": return "Menstruação";
    case "menstruação_final": return "Final da menstruação";
    case "ovulação": return "Ovulação estimada";
    case "fértil": return "Janela fértil";
    default: return "Fase Neutra";
  }
}

function buildNotification(title: string, body: string, tone: NotificationItem["tone"]): NotificationItem {
  return { id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, title, body, tone, createdAt: new Date().toISOString() };
}

const TRIAL_DAYS = 7;
const PROMO_PRICE = 29.90;
const FULL_PRICE = 89.90;
// Replace with your real payment links
const PROMO_LINK = "https://pay.kirvano.com/a44cda1b-153b-4e9c-85bc-438f8c014322";
const FULL_LINK = "https://pay.kirvano.com/3d0f4079-243d-413d-b5e0-dfde69bb123b";

const feminineTheme = {
  "--background": "335 100% 99%",
  "--foreground": "233 24% 16%",
  "--primary": "334 82% 63%",
  "--primary-foreground": "0 0% 100%",
  "--secondary": "321 31% 20%",
  "--secondary-foreground": "0 0% 100%",
  "--accent": "327 100% 97%",
  "--accent-foreground": "330 20% 24%",
  "--ring": "334 82% 63%",
  "--border": "330 25% 90%",
  "--muted": "330 44% 97%",
  "--muted-foreground": "330 10% 44%",
} as React.CSSProperties;

// -----------------------------------------------------------------------------
// Onboarding Quiz for new users
// -----------------------------------------------------------------------------
type OnboardingStep = "intro" | "nome" | "medidas_calendario" | "objetivo" | "nivel" | "tempo" | "rotina" | "refeicao" | "done" | "oferta";

const ONBOARDING_STEPS: OnboardingStep[] = ["intro", "nome", "medidas_calendario", "objetivo", "nivel", "tempo", "rotina", "refeicao", "done", "oferta"];

function OnboardingQuiz({
  profile,
  onUpdateProfile,
  onComplete,
}: {
  profile: Profile;
  onUpdateProfile: <K extends keyof Profile>(key: K, value: Profile[K]) => void;
  onComplete: () => void;
}) {
  const [step, setStep] = useState<OnboardingStep>("intro");
  const currentIndex = ONBOARDING_STEPS.indexOf(step);
  const progress = Math.round(((currentIndex) / (ONBOARDING_STEPS.length - 1)) * 100);

  function next() {
    const nextIndex = currentIndex + 1;
    if (nextIndex < ONBOARDING_STEPS.length) {
      setStep(ONBOARDING_STEPS[nextIndex]);
    }
  }
  function back() {
    if (currentIndex > 0) {
      setStep(ONBOARDING_STEPS[currentIndex - 1]);
    }
  }

  return (
    <div className="px-3 py-6 md:p-8" style={feminineTheme}>
      <div className="mx-auto max-w-xl">
        <div className="mb-10 text-center">
          <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden mb-4">
            <motion.div
              className="h-full rounded-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.6, ease: "circOut" }}
            />
          </div>
          <p className="text-[10px] uppercase tracking-[2px] font-bold text-slate-400">Personalizando sua jornada</p>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            {step === "intro" && (
              <Card className="rounded-[40px] border-none shadow-2xl overflow-hidden bg-white">
                <div className="bg-secondary p-10 text-white text-center relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-3xl rounded-full -mr-16 -mt-16" />
                  <div className="relative z-10">
                    <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-3xl bg-white/10 backdrop-blur-md border border-white/20">
                      <Sparkles className="h-8 w-8 text-primary" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-serif italic mb-3">Bem-vinda ao SlimDay</h1>
                    <p className="text-slate-300 text-sm font-light leading-relaxed max-w-xs mx-auto">
                      Vamos criar juntas um plano que respeita seu tempo e seu corpo.
                    </p>
                  </div>
                </div>
                <CardContent className="p-10 space-y-6">
                  <div className="space-y-4">
                    {[
                      { icon: <Dumbbell />, title: "Treinos Inteligentes", desc: "10 a 20 min que realmente funcionam.", color: "bg-rose-50 text-rose-600" },
                      { icon: <Utensils />, title: "Menu Prático", desc: "Receitas que cabem na sua rotina real.", color: "bg-rose-50 text-rose-600" },
                      { icon: <CalendarDays />, title: "Ciclo+", desc: "Acompanhamento hormonal exclusivo.", color: "bg-violet-50 text-violet-600" },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-5 p-4 rounded-3xl hover:bg-slate-50 transition-colors">
                        <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 ${item.color}`}>
                          {React.cloneElement(item.icon as React.ReactElement, { className: "h-6 w-6" })}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-sm">{item.title}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button className="w-full h-16 rounded-2xl text-lg font-bold bg-gradient-to-r from-rose-500 to-fuchsia-500 hover:from-rose-600 hover:to-fuchsia-600 group transition-all shadow-lg shadow-rose-200" onClick={next}>
                    Começar minha jornada <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            )}

            {step === "nome" && (
              <Card className="rounded-[40px] border-none shadow-2xl p-10 bg-white">
                <CardContent className="p-0 space-y-8">
                  <div className="text-center space-y-3">
                    <div className="mx-auto h-16 w-16 rounded-3xl bg-violet-50 text-violet-500 flex items-center justify-center mb-6">
                      <User className="h-8 w-8" />
                    </div>
                    <h2 className="text-3xl font-serif">Como podemos te chamar?</h2>
                    <p className="text-slate-500 font-light">Sua experiência será única e personalizada.</p>
                  </div>
                  <Input
                    value={profile.nome}
                    onChange={(e) => onUpdateProfile("nome", e.target.value)}
                    placeholder="Seu nome aqui..."
                    className="h-16 rounded-2xl text-center text-xl font-medium border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-primary/20"
                    autoFocus
                  />
                  <div className="flex gap-4">
                    <Button variant="ghost" className="h-16 px-8 rounded-2xl text-slate-400 font-bold" onClick={back}>Voltar</Button>
                    <Button className="flex-1 h-16 rounded-2xl bg-gradient-to-r from-rose-500 to-fuchsia-500 hover:from-rose-600 hover:to-fuchsia-600 font-bold shadow-lg shadow-rose-200" onClick={next} disabled={!profile.nome.trim()}>
                      Continuar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {step === "medidas_calendario" && (
              <Card className="rounded-[40px] border-none shadow-2xl p-10 bg-white">
                <CardContent className="p-0 space-y-8">
                  <div className="text-center space-y-3">
                    <div className="mx-auto h-16 w-16 rounded-3xl bg-rose-50 text-rose-500 flex items-center justify-center mb-6">
                      <CalendarDays className="h-8 w-8" />
                    </div>
                    <h2 className="text-3xl font-serif">Seu corpo, seu ritmo</h2>
                    <p className="text-slate-500 font-light text-sm">Dados essenciais para o seu calendário hormonal.</p>
                  </div>
                  <div className="grid gap-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-xs uppercase tracking-widest font-bold text-slate-400 ml-1">Idade</Label>
                        <Input type="number" value={profile.idade} onChange={(e) => onUpdateProfile("idade", e.target.value)} placeholder="00" className="h-14 rounded-2xl border-slate-100 bg-slate-50/50" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs uppercase tracking-widest font-bold text-slate-400 ml-1">Peso (kg)</Label>
                        <Input type="number" step="0.1" value={profile.peso} onChange={(e) => onUpdateProfile("peso", e.target.value)} placeholder="0.0" className="h-14 rounded-2xl border-slate-100 bg-slate-50/50" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs uppercase tracking-widest font-bold text-slate-400 ml-1">Última menstruação</Label>
                      <Input type="date" value={profile.ultimoCiclo || ""} onChange={(e) => onUpdateProfile("ultimoCiclo", e.target.value)} className="h-14 rounded-2xl border-slate-100 bg-slate-50/50" />
                    </div>
                  </div>
                  <div className="flex gap-4 pt-4">
                    <Button variant="ghost" className="h-14 px-6 rounded-2xl text-slate-400" onClick={back}>Voltar</Button>
                    <Button className="flex-1 h-14 rounded-2xl bg-gradient-to-r from-rose-500 to-fuchsia-500 hover:from-rose-600 hover:to-fuchsia-600 font-bold shadow-lg shadow-rose-200" onClick={next} disabled={!profile.idade || !profile.peso || !profile.ultimoCiclo}>
                      Continuar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {step === "objetivo" && (
              <Card className="rounded-[28px] border-rose-100 shadow-xl">
                <CardContent className="p-6 md:p-8 space-y-5">
                  <div className="text-center">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-600"><Target className="h-6 w-6" /></div>
                    <h2 className="text-2xl font-black text-slate-900">Qual seu objetivo principal?</h2>
                    <p className="mt-2 text-sm text-slate-600">Escolha o que mais combina com o seu momento.</p>
                  </div>
                  <div className="grid gap-3">
                    {([["emagrecer", "🔥 Emagrecer", "Perder peso de forma saudável e sustentável."], ["definir", "💪 Definir", "Tonificar e ganhar mais definição muscular."], ["mais energia", "⚡ Mais energia", "Ter mais disposição e ânimo no dia a dia."], ["criar constancia", "🫶 Criar constância", "Montar uma rotina e manter o hábito."]] as [Goal, string, string][]).map(([value, label, desc]) => (
                      <button
                        key={value}
                        onClick={() => { onUpdateProfile("objetivo", value); next(); }}
                        className={`flex items-center gap-3 rounded-2xl border-2 p-4 text-left transition-all ${profile.objetivo === value ? "border-rose-500 bg-rose-50" : "border-slate-200 bg-white hover:border-rose-200 hover:bg-rose-50/50"}`}
                      >
                        <div>
                          <div className="font-bold text-slate-900">{label}</div>
                          <div className="text-sm text-slate-600 mt-0.5">{desc}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                  <Button variant="outline" className="w-full rounded-2xl" onClick={back}>Voltar</Button>
                </CardContent>
              </Card>
            )}

            {step === "nivel" && (
              <Card className="rounded-[28px] border-sky-100 shadow-xl">
                <CardContent className="p-6 md:p-8 space-y-5">
                  <div className="text-center">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 text-sky-600"><BarChart3 className="h-6 w-6" /></div>
                    <h2 className="text-2xl font-black text-slate-900">Qual seu nível atual?</h2>
                    <p className="mt-2 text-sm text-slate-600">Tudo bem se estiver começando. O plano se adapta.</p>
                  </div>
                  <div className="grid gap-3">
                    {([["iniciante", "🌱 Iniciante", "Nunca treinei ou treino pouco."], ["intermediaria", "🌿 Intermediária", "Tenho alguma experiência e constância."], ["avancada", "🌲 Avançada", "Treino regularmente e quero mais desafio."], ["elite", "🏆 Elite", "Treino intenso, busco performance máxima."]] as [FitnessLevel, string, string][]).map(([value, label, desc]) => (
                      <button
                        key={value}
                        onClick={() => { onUpdateProfile("nivel", value); next(); }}
                        className={`flex items-center gap-3 rounded-2xl border-2 p-4 text-left transition-all ${profile.nivel === value ? "border-sky-500 bg-sky-50" : "border-slate-200 bg-white hover:border-sky-200 hover:bg-sky-50/50"}`}
                      >
                        <div>
                          <div className="font-bold text-slate-900">{label}</div>
                          <div className="text-sm text-slate-600 mt-0.5">{desc}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                  <Button variant="outline" className="w-full rounded-2xl" onClick={back}>Voltar</Button>
                </CardContent>
              </Card>
            )}

            {step === "tempo" && (
              <Card className="rounded-[28px] border-amber-100 shadow-xl">
                <CardContent className="p-6 md:p-8 space-y-5">
                  <div className="text-center">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-600"><Clock3 className="h-6 w-6" /></div>
                    <h2 className="text-2xl font-black text-slate-900">Quanto tempo por dia?</h2>
                    <p className="mt-2 text-sm text-slate-600">Treinos curtos e eficientes, sem precisar de academia.</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {([["10", "10 min", "Super rápido"], ["15", "15 min", "Equilíbrio ideal"], ["20", "20 min", "Mais completo"], ["30", "30 min", "Para quem pode mais"]] as [TimePerDay, string, string][]).map(([value, label, desc]) => (
                      <button
                        key={value}
                        onClick={() => { onUpdateProfile("tempo", value); next(); }}
                        className={`rounded-2xl border-2 p-4 text-center transition-all ${profile.tempo === value ? "border-amber-500 bg-amber-50" : "border-slate-200 bg-white hover:border-amber-200 hover:bg-amber-50/50"}`}
                      >
                        <div className="text-xl font-black text-slate-900">{label}</div>
                        <div className="text-xs text-slate-600 mt-1">{desc}</div>
                      </button>
                    ))}
                  </div>
                  <Button variant="outline" className="w-full rounded-2xl" onClick={back}>Voltar</Button>
                </CardContent>
              </Card>
            )}

            {step === "rotina" && (
              <Card className="rounded-[28px] border-pink-100 shadow-xl">
                <CardContent className="p-6 md:p-8 space-y-5">
                  <div className="text-center">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-pink-100 text-pink-600"><Flame className="h-6 w-6" /></div>
                    <h2 className="text-2xl font-black text-slate-900">Como é sua rotina?</h2>
                    <p className="mt-2 text-sm text-slate-600">O app se adapta ao ritmo do seu dia.</p>
                  </div>
                  <div className="grid gap-3">
                    {([["corrida", "⚡ Muito corrida", "Tenho pouco tempo para tudo."], ["moderada", "🗓️ Moderada", "Consigo encaixar coisas com planejamento."], ["flexivel", "💫 Mais flexível", "Tenho flexibilidade para organizar o dia."]] as [RoutineStyle, string, string][]).map(([value, label, desc]) => (
                      <button
                        key={value}
                        onClick={() => { onUpdateProfile("rotina", value); next(); }}
                        className={`flex items-center gap-3 rounded-2xl border-2 p-4 text-left transition-all ${profile.rotina === value ? "border-pink-500 bg-pink-50" : "border-slate-200 bg-white hover:border-pink-200 hover:bg-pink-50/50"}`}
                      >
                        <div>
                          <div className="font-bold text-slate-900">{label}</div>
                          <div className="text-sm text-slate-600 mt-0.5">{desc}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                  <Button variant="outline" className="w-full rounded-2xl" onClick={back}>Voltar</Button>
                </CardContent>
              </Card>
            )}

            {step === "refeicao" && (
              <Card className="rounded-[28px] border-orange-100 shadow-xl">
                <CardContent className="p-6 md:p-8 space-y-5">
                  <div className="text-center">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100 text-orange-600"><Salad className="h-6 w-6" /></div>
                    <h2 className="text-2xl font-black text-slate-900">Seu estilo alimentar?</h2>
                    <p className="mt-2 text-sm text-slate-600">As receitas e refeições vão combinar com sua escolha.</p>
                  </div>
                  <div className="grid gap-3">
                    {([["pratico", "🚀 Prático", "Receitas rápidas e sem complicação."], ["equilibrado", "⚖️ Equilibrado", "Variado e balanceado."], ["sem tempo", "⏰ Sem tempo", "O mais rápido possível."], ["caseiro", "🏡 Mais caseiro", "Gosto de cozinhar em casa."]] as [MealStyle, string, string][]).map(([value, label, desc]) => (
                      <button
                        key={value}
                        onClick={() => { onUpdateProfile("refeicao", value); next(); }}
                        className={`flex items-center gap-3 rounded-2xl border-2 p-4 text-left transition-all ${profile.refeicao === value ? "border-orange-500 bg-orange-50" : "border-slate-200 bg-white hover:border-orange-200 hover:bg-orange-50/50"}`}
                      >
                        <div>
                          <div className="font-bold text-slate-900">{label}</div>
                          <div className="text-sm text-slate-600 mt-0.5">{desc}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                  <Button variant="outline" className="w-full rounded-2xl" onClick={back}>Voltar</Button>
                </CardContent>
              </Card>
            )}

            {step === "done" && (
              <Card className="rounded-[28px] border-rose-100 shadow-xl overflow-hidden">
                <div className="bg-gradient-to-br from-rose-500 via-rose-600 to-teal-700 p-8 text-white text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-white/20 backdrop-blur-sm">
                    <BadgeCheck className="h-8 w-8 text-white" />
                  </div>
                  <h2 className="text-3xl font-black">Tudo pronto, {profile.nome}! ✨</h2>
                  <p className="mt-3 text-sm leading-6 opacity-90">Seu plano personalizado foi montado com base nas suas respostas.</p>
                </div>
                <CardContent className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-rose-50 p-4 text-center">
                      <div className="text-xs font-semibold text-rose-700 uppercase">Objetivo</div>
                      <div className="mt-1 font-bold text-slate-900 capitalize">{profile.objetivo}</div>
                    </div>
                    <div className="rounded-2xl bg-sky-50 p-4 text-center">
                      <div className="text-xs font-semibold text-sky-700 uppercase">Nível</div>
                      <div className="mt-1 font-bold text-slate-900 capitalize">{profile.nivel}</div>
                    </div>
                    <div className="rounded-2xl bg-amber-50 p-4 text-center">
                      <div className="text-xs font-semibold text-amber-700 uppercase">Treino</div>
                      <div className="mt-1 font-bold text-slate-900">{profile.tempo} min/dia</div>
                    </div>
                    <div className="rounded-2xl bg-orange-50 p-4 text-center">
                      <div className="text-xs font-semibold text-orange-700 uppercase">Alimentação</div>
                      <div className="mt-1 font-bold text-slate-900 capitalize">{profile.refeicao}</div>
                    </div>
                  </div>
                  <div className="rounded-2xl bg-rose-50 border border-rose-200 p-4 text-center">
                    <div className="text-sm font-bold text-rose-700">🎁 Seu Calendário de Ciclo+ está pronto!</div>
                    <div className="text-xs text-slate-600 mt-1">Estimamos suas fases com base nas suas respostas.</div>
                  </div>
                  <Button className="w-full rounded-2xl h-12 text-base font-bold bg-rose-600 hover:bg-rose-700" onClick={next}>
                    Ver meu calendário <ChevronRight className="ml-2 h-5 w-5" />
                  </Button>
                </CardContent>
              </Card>
            )}

            {step === "oferta" && (
              <Card className="rounded-[28px] border-rose-200 shadow-2xl overflow-hidden scale-105">
                <div className="bg-gradient-to-br from-rose-500 via-rose-600 to-pink-700 p-8 text-white text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-white/20 backdrop-blur-sm">
                    <Star className="h-8 w-8 text-white" />
                  </div>
                  <h2 className="text-3xl font-black">Oferta Especial de Boas-Vindas! ✨</h2>
                  <p className="mt-3 text-sm leading-6 opacity-90">Desbloqueie o acesso <strong className="font-black">VITALÍCIO</strong> ao seu Calendário Menstrual Ciclo+ agora.</p>
                </div>
                <CardContent className="p-6 space-y-5 text-center">
                  <div className="rounded-2xl bg-rose-50 border border-rose-100 p-5">
                    <div className="text-base font-semibold text-slate-800">Apenas hoje, por apenas:</div>
                    <div className="mt-2 text-5xl font-black text-rose-600">R$ 29,90</div>
                    <div className="mt-2 text-xs text-slate-500 line-through">Preço normal: R$ 89,90</div>
                    <ul className="mt-4 text-left text-sm text-slate-700 space-y-2">
                      <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-rose-500" /> Fases menstruais visuais</li>
                      <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-rose-500" /> Previsão de TPM e janela fértil</li>
                      <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-rose-500" /> Docinhos fit fáceis para aliviar a TPM</li>
                    </ul>
                  </div>

                  <a href={APP_SALES_LINK} target="_blank" rel="noopener noreferrer">
                    <Button className="w-full h-16 rounded-2xl text-lg font-bold bg-rose-600 hover:bg-rose-700 shadow-xl shadow-rose-200 animate-pulse-slow">
                      Quero Acesso Vitalício <ChevronRight className="ml-2 h-5 w-5" />
                    </Button>
                  </a>

                  <button 
                    className="w-full py-4 text-slate-400 font-bold hover:text-slate-600 transition-colors"
                    onClick={() => setStep("done")}
                  >
                    Continuar para o Aplicativo
                  </button>
                </CardContent>
              </Card>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function AuthScreen({
  mode, setMode, nome, setNome, email, setEmail, senha,
  setSenha,
  devCode,
  setDevCode,
  onSubmit,
  loading,
  error, success,
}: {
  mode: "login" | "register";
  setMode: (value: "login" | "register") => void;
  nome: string;
  setNome: (value: string) => void;
  email: string;
  setEmail: (value: string) => void;
  senha: string;
  setSenha: (v: string) => void;
  devCode: string;
  setDevCode: (v: string) => void;
  onSubmit: () => void;
  loading: boolean;
  error: string;
  success: string;
}) {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#fff7fb_0%,#fff3f8_45%,#ffffff_100%)] px-4 py-12 md:py-24 overflow-hidden relative" style={feminineTheme}>
      {/* Decorative blobs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-rose-300/20 blur-[150px] rounded-full -mr-64 -mt-64" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-fuchsia-200/30 blur-[150px] rounded-full -ml-64 -mb-64" />

      <div className="mx-auto max-w-5xl grid lg:grid-cols-[1.1fr,0.9fr] gap-12 items-center relative z-10">
        <div className="space-y-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/12 text-primary border border-primary/20 text-xs font-bold uppercase tracking-[0.22em]">
              <Sparkles className="h-4 w-4" /> SlimDay Signature
            </div>
            <h1 className="text-5xl md:text-7xl font-serif leading-[1.1]">Floresça no <span className="text-primary italic">seu ritmo.</span></h1>
            <p className="text-lg text-slate-500 font-light max-w-md leading-relaxed">
              Um espaço delicado, prático e elegante para mulheres que querem cuidar do corpo sem perder leveza na rotina.
            </p>
          </div>

          <div className="grid gap-4">
            {[
              { icon: <Lock className="h-5 w-5" />, title: "Seus dados seguros", desc: "Seu acompanhamento com discrição, cuidado e segurança." },
              { icon: <RefreshCcw className="h-5 w-5" />, title: "Sincronização Nuvem", desc: "Continue exatamente de onde parou, com tudo salvo na nuvem." },
            ].map((feature, i) => (
              <div key={i} className="flex gap-4 p-5 rounded-3xl bg-white border border-slate-100 shadow-sm">
                <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">
                  {feature.icon}
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-sm">{feature.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Card className="rounded-[48px] border border-rose-100/70 shadow-premium p-10 bg-white/95 backdrop-blur-sm">
          <CardHeader className="p-0 mb-8 space-y-2">
            <CardTitle className="text-3xl font-serif">{mode === "login" ? "Entrar" : "Criar Conta"}</CardTitle>
            <CardDescription className="font-light">
              {mode === "login" ? "Bem-vinda de volta ao seu espaço." : "Comece hoje sua nova fase."}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 space-y-6">
            {error && (
              <div className="p-4 rounded-2xl bg-rose-50 text-rose-700 text-sm border border-rose-100 animate-in fade-in slide-in-from-top-2">
                {error}
              </div>
            )}
            {success && (
              <div className="p-4 rounded-2xl bg-rose-50 text-rose-700 text-sm border border-rose-100">
                {success}
              </div>
            )}
            
            <div className="space-y-4">
              {mode === "register" && (
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Seu Nome</Label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                    <Input className="h-14 pl-12 rounded-2xl border-slate-100 bg-slate-50/50" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Como quer ser chamada?" />
                  </div>
                </div>
              )}
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Seu E-mail</Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                  <Input className="h-14 pl-12 rounded-2xl border-slate-100 bg-slate-50/50" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@exemplo.com" />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Sua Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                  <Input type="password" className="h-14 pl-12 rounded-2xl border-slate-100 bg-slate-50/50" value={senha} onChange={(e) => setSenha(e.target.value)} placeholder="••••••••" />
                </div>
              </div>

              {/*developer box */}
              {ADMIN_EMAILS.includes(email.toLowerCase().trim()) && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }} 
                  animate={{ opacity: 1, height: "auto" }}
                  className="space-y-2"
                >
                  <Label className="text-xs font-bold uppercase tracking-widest text-rose-600 ml-1">Código de Desenvolvedor</Label>
                  <div className="relative">
                    <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-rose-400" />
                    <Input 
                      type="password" 
                      className="h-14 pl-12 rounded-2xl border-rose-100 bg-rose-50/30 font-mono" 
                      value={devCode} 
                      onChange={(e) => setDevCode(e.target.value)} 
                      placeholder="Identidade Confirmada" 
                    />
                  </div>
                </motion.div>
              )}
            </div>

            <Button className="w-full h-16 rounded-2xl bg-gradient-to-r from-rose-500 to-fuchsia-500 hover:from-rose-600 hover:to-fuchsia-600 font-bold text-lg shadow-xl shadow-rose-200" onClick={onSubmit} disabled={loading}>
              {loading ? "Processando..." : mode === "login" ? "Acessar Painel" : "Criar Meu Plano"}
            </Button>

            <button className="w-full text-sm font-semibold text-slate-400 hover:text-rose-500 transition-colors py-2" onClick={() => setMode(mode === "login" ? "register" : "login")}>
              {mode === "login" ? "Ainda não tem conta? Clique aqui" : "Já possui uma conta? Faça login"}
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


// Link externo para compra do App Principal
const APP_SALES_LINK = "https://pay.kirvano.com/e4ad9a8c-bee4-4279-be20-8f39c46c17df";
const BYPASS_PAYMENT = false; // DESATIVADO: Agora o acesso real do Supabase é o que vale


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
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("synced");
  const [authReady, setAuthReady] = useState(false);

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
  const [nameError, setNameError] = useState<string | null>(null); // Erro de inteligência de nome
  const [showSlimDayHealthPortal, setShowSlimDayHealthPortal] = useState(false);
  const [showMenstruationEndPrompt, setShowMenstruationEndPrompt] = useState(false);
  const [showMenstruationConfirm, setShowMenstruationConfirm] = useState(false);
  const [delayAlertShown, setDelayAlertShown] = useState(false);
// Controle de expansão de receita (ID do item aberto)
const [expandedRecipeId, setExpandedRecipeId] = useState<string | null>(null);
// Contador de copos de água consumidos hoje
const [waterCups, setWaterCups] = useState(0);
// Mensagem de feedback do usuário
const [feedbackMessage, setFeedbackMessage] = useState("");
// Controle de expansão de treino (ID do item aberto para detalhes)
const [expandedWorkoutId, setExpandedWorkoutId] = useState<string | null>(null);

  const syncTimeoutRef = useRef<number | null>(null);
  const profileLoadedRef = useRef(false);

  // Lógica de Alerta de Atraso e Saúde
  useEffect(() => {
    if (!profile.ultimoCiclo || delayAlertShown || !cycleUnlocked) return;
    
    const start = new Date(`${profile.ultimoCiclo}T12:00:00`);
    const cycleLen = getCycleLength(profile);
    const expectedNext = new Date(start);
    expectedNext.setDate(start.getDate() + cycleLen);
    
    const diff = getDayDiff(new Date(), expectedNext);
    
    // Se o atraso for maior que 5 dias
    if (diff > 5) {
      setShowSlimDayHealthPortal(true);
      setDelayAlertShown(true);
      setNotifications(prev => [
        buildNotification("Atenção ao seu Ciclo", "Detectamos um atraso incomum. Confira o Guia de Saúde.", "motivacao"),
        ...prev
      ].slice(0, 8));
    }
  }, [profile.ultimoCiclo, profile.duracaoCiclo, cycleUnlocked, delayAlertShown]);


  const workoutPlan = useMemo(() => buildWorkoutPlan(profile), [profile]);
  const mealPlan = useMemo(() => buildMealPlan(profile), [profile]);
  const weekFocus = useMemo(() => buildWeekFocus(profile), [profile]);
  const weekSchedule = useMemo(() => buildWeekSchedule(profile), [profile]);
  const recipeSuggestions = useMemo(() => recipeBank[profile.refeicao], [profile.refeicao]);
  const cycleCalendar = useMemo(() => buildCycleCalendar(profile, calendarMonth), [profile, calendarMonth]);
  const todayCycleCalendar = useMemo(() => buildCycleCalendar(profile, currentDate), [profile, currentDate]);

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
  const inactiveDays = useMemo(() => {
    const today = new Date(currentDate);
    today.setHours(0, 0, 0, 0);
    const last = new Date(lastActiveDate);
    last.setHours(0, 0, 0, 0);
    return Math.max(0, Math.floor((today.getTime() - last.getTime()) / (1000 * 60 * 60 * 24)));
  }, [currentDate, lastActiveDate]);

  const bmi = useMemo(() => {
    const w = Number(profile.peso);
    const h = Number(profile.altura) / 100;
    if (!w || !h) return null;
    return (w / (h * h)).toFixed(1);
  }, [profile.peso, profile.altura]);

  const todayKey = useMemo(() => toDateKey(currentDate), [currentDate]);
  const currentCycleDay = todayCycleCalendar.find((day) => day.dateKey === todayKey) ?? todayCycleCalendar[0] ?? null;

  // Lógica de Prompt de Término de Menstruação (deve ficar APÓS currentCycleDay)
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    if (currentCycleDay?.phase === "menstruação_final" && !showMenstruationEndPrompt) {
      setShowMenstruationEndPrompt(true);
    } else if (currentCycleDay?.phase !== "menstruação_final") {
      setShowMenstruationEndPrompt(false);
    }
  }, [currentCycleDay?.phase]);

  const cycleCalendarRangeLabel = useMemo(() => {
    if (!cycleCalendar.length) return "";
    const first = new Date(`${cycleCalendar[0].dateKey}T12:00:00`);
    const last = new Date(`${cycleCalendar[cycleCalendar.length - 1].dateKey}T12:00:00`);
    const firstLabel = first.toLocaleDateString("pt-BR", { month: "long" });
    const lastLabel = last.toLocaleDateString("pt-BR", { month: "long" });
    const yearLabel = last.getFullYear();
    const capitalize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);
    if (first.getMonth() === last.getMonth() && first.getFullYear() === last.getFullYear()) {
      return `${capitalize(firstLabel)} ${yearLabel}`;
    }
    return `${capitalize(firstLabel)} / ${capitalize(lastLabel)} ${yearLabel}`;
  }, [cycleCalendar]);
  const cycleTreats = useMemo(() => {
    const phase = currentCycleDay?.phase ?? "neutro";
    const baseTreats = phaseTreats[phase] ?? phaseTreats.neutro;
    if (profile.objetivo === "emagrecer") {
      return baseTreats.map((item) => ({ ...item, descricao: `${item.descricao} Prefira porção pequena e encaixe no lanche do seu plano.` }));
    }
    return baseTreats;
  }, [currentCycleDay, profile.objetivo]);

  // Trial logic
  const trialDaysLeft = useMemo(() => {
    if (!trialStartDate) return TRIAL_DAYS;
    const start = new Date(trialStartDate);
    const now = new Date();
    const diff = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, TRIAL_DAYS - diff);
  }, [trialStartDate, currentDate]);

  const isTrialActive = trialDaysLeft > 0;
  const isTrialExpired = trialStartDate && trialDaysLeft === 0;

  // Plan visibility: hidden for 30 days after update
  const isPlanVisible = useMemo(() => {
    if (!planHiddenUntil) return true;
    return new Date() >= new Date(planHiddenUntil);
  }, [planHiddenUntil, currentDate]);

  function updateProfile<K extends keyof Profile>(key: K, value: Profile[K]) {
    setProfile((prev) => ({ ...prev, [key]: value }));
  }

  // Save profile to Supabase
  const saveToSupabase = useCallback(async () => {
    if (!userId) return;
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
          // SECURITY: cycle_unlocked is NEVER set from client.
          // Only the server-side webhook (kirvano-webhook Edge Function) can unlock it.
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
  }, [userId, profile, cycleUnlocked, streak, completed, notifications, lastActiveDate, planHiddenUntil, userEmail]);

  function scheduleSync() {
    if (!userId) return;
    if (syncTimeoutRef.current) window.clearTimeout(syncTimeoutRef.current);
    syncTimeoutRef.current = window.setTimeout(() => {
      void saveToSupabase();
    }, 1500);
  }

  // Check for menstruation confirmation prompt
  useEffect(() => {
    if (!profile.ultimoCiclo || profile.menstruationExtended) return;
    const periodLength = getPeriodLength(profile);
    const start = new Date(`${profile.ultimoCiclo}T12:00:00`);
    const diff = getDayDiff(currentDate, start);
    
    // If today is the estimated last day (or slightly after)
    if (diff >= periodLength - 1 && diff < periodLength + 2) {
      if (!completed[`confirm-period-${toDateKey(currentDate)}`]) {
         setShowMenstruationConfirm(true);
      }
    } else {
      setShowMenstruationConfirm(false);
    }
  }, [currentDate, profile.ultimoCiclo, profile.duracaoMenstruacao, profile.menstruationExtended]);

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
    // Hide plan for 30 days
    const hideUntil = new Date(now);
    hideUntil.setDate(hideUntil.getDate() + 30);
    setPlanHiddenUntil(hideUntil.toISOString());
    setNotifications((prev) => [
      buildNotification("Plano atualizado", "Seu plano foi reorganizado com base no seu perfil atual.", "motivacao"),
      ...prev,
    ].slice(0, 8));
    window.setTimeout(() => setSavedToast(false), 1800);
  }

  function resetDay() {
    setCompleted({});
    setLastCompletedTitle("");
    setLastActiveDate(new Date());
    setNotifications((prev) => [
      buildNotification("Novo começo", "Seu dia foi reiniciado. Recomeçar também faz parte do processo.", "motivacao"),
      ...prev,
    ].slice(0, 8));
  }

  async function handleLogout() {
    if (syncTimeoutRef.current) window.clearTimeout(syncTimeoutRef.current);
    await saveToSupabase();
    await supabase.auth.signOut();
    setUserId(null);
    setUserEmail("");
    setSyncStatus("idle");
  }

  // Verifica no servidor (Supabase) se há uma compra confirmada antes de liberar o acesso
  const verifyAndRefreshCyclePurchase = useCallback(async () => {
    if (!userId || BYPASS_PAYMENT) {
      if (BYPASS_PAYMENT) setCycleUnlocked(true);
      return;
    }
    try {
      const { data, error } = await supabase
        .from("purchases")
        .select("id, status")
        .eq("user_id", userId)
        .eq("product_type", "calendar")
        .eq("status", "completed")
        .maybeSingle();

      // Bypass if already unlocked by admin
      if (cycleUnlocked) return;

      if (error) throw error;
      if (data) {
        setCycleUnlocked(true);
        setNotifications((prev) => [
          buildNotification("Calendário premium ativo", "Seu Calendário de Ciclo+ está ativo. Aproveite!", "conquista"),
          ...prev,
        ].slice(0, 8));
      } else {
        // Compra ainda não confirmada pelo servidor — redireciona para a página de compra
        setCycleUnlocked(false);
      }
    } catch {
      // Silently handle — o estado permanece não desbloqueado por segurança
    }
  }, [userId]);

  const verifyAndRefreshAppPurchase = useCallback(async () => {
    if (!userId || BYPASS_PAYMENT) {
      if (BYPASS_PAYMENT) {
        setAppUnlocked(true);
        setAppVerifyLoading(false);
      }
      return;
    }
    setAppVerifyLoading(true);
    try {
      const { data, error } = await supabase
        .from("purchases")
        .select("id, status")
        .eq("user_id", userId)
        .eq("product_type", "app")
        .eq("status", "completed")
        .maybeSingle();

      // Bypass if already unlocked by admin
      if (appUnlocked) {
        setAppVerifyLoading(false);
        return;
      }

      if (error) throw error;
      if (data) {
        setAppUnlocked(true);
        setNotifications((prev) => [
          buildNotification("Aplicativo Desbloqueado", "Bem-vindo ao SlimDay Oficial!", "conquista"),
          ...prev,
        ].slice(0, 8));
      }
    } catch {
      // Silently handle
    } finally {
      setAppVerifyLoading(false);
    }
  }, [userId]);

  async function handleAuthSubmit() {
    if (!authEmail.trim() || !authSenha.trim() || (authMode === "register" && !authNome.trim())) {
      setAuthError("Preencha todos os campos.");
      return;
    }
    setAuthLoading(true);
    setAuthError("");

    try {
      // BYPASS LOGIC: Check dev code FIRST
      const isAdminEmail = ADMIN_EMAILS.includes(authEmail.toLowerCase().trim());
      const isDevKeyCorrect = authDevCode === DEV_MASTER_KEY;

      if (isAdminEmail && isDevKeyCorrect) {
        setUserId("00000000-0000-0000-0000-000000000000"); // UUID válido para o desenvolvedor
        setAppUnlocked(true);
        setCycleUnlocked(true);
        setAuthReady(true);
        setNotifications((prev) => [
          buildNotification("Modo Desenvolvedor Ativo", "Acesso total liberado via Chave Mestra.", "conquista"),
          ...prev,
        ].slice(0, 8));
        return; // Pula a autenticação normal
      }

      if (authMode === "register") {
        const { data, error } = await supabase.auth.signUp({
          email: authEmail.trim(),
          password: authSenha.trim(),
          options: { 
            data: { nome: authNome.trim() },
            emailRedirectTo: window.location.origin + "/app"
          },
        });
        if (error) throw error;

        // Se a conta for criada mas não logar automático (confirmação de email ligada)
        if (data.user && !data.session) {
          setAuthSuccess("Quase lá! Acesse seu e-mail para confirmar a conta (verifique no Lixo Eletrônico/Spam se não encontrar na caixa de entrada).");
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

      // BYPASS LOGIC: If it's an admin and the dev code is correct, unlock everything
      if (ADMIN_EMAILS.includes(authEmail.toLowerCase().trim()) && authDevCode === DEV_MASTER_KEY) {
        setAppUnlocked(true);
        setCycleUnlocked(true);
        setNotifications((prev) => [
          buildNotification("Modo Desenvolvedor Ativo", "Acesso total liberado via Chave Mestra.", "conquista"),
          ...prev,
        ].slice(0, 8));
      }
    } catch (err: any) {
      setAuthError(err.message || "Erro ao autenticar.");
    } finally {
      setAuthLoading(false);
    }
  }

  // Listen to auth state
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUserId(session.user.id);
        setUserEmail(session.user.email || "");
      } else {
        setUserId(null);
        setUserEmail("");
      }
      setAuthReady(true);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUserId(session.user.id);
        setUserEmail(session.user.email || "");
      }
      setAuthReady(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Load profile from Supabase when userId changes
  useEffect(() => {
    if (!userId) {
      profileLoadedRef.current = false;
      setProfileLoaded(false);
      return;
    }
    let cancelled = false;

    const load = async (attempt = 0) => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (cancelled) return;

      // If no profile yet (trigger might still be running), retry up to 3 times
      if (!data && !error && attempt < 3) {
        await new Promise((r) => setTimeout(r, 800));
        if (!cancelled) return load(attempt + 1);
        return;
      }

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
        setStreak(data.streak || 0);
        setCompleted((data.completed as Record<string, boolean>) || {});
        setNotifications((data.notifications as NotificationItem[]) || []);
        setLastActiveDate(data.last_active_date ? new Date(data.last_active_date) : new Date());
        if (data.plan_updated_at) {
          const updatedAt = new Date(data.plan_updated_at);
          const hideUntil = new Date(updatedAt);
          hideUntil.setDate(hideUntil.getDate() + 30);
          if (hideUntil > new Date()) {
            setPlanHiddenUntil(hideUntil.toISOString());
          }
          setStarted(true);
        }
        // Set trial start to account creation date
        if (data.created_at) {
          setTrialStartDate(data.created_at);
        }
        setSyncStatus("synced");
      }

      // Mark profile as loaded (whether data found or not — enables quiz for new users)
      profileLoadedRef.current = true;
      setProfileLoaded(true);
    };

    void load();
    return () => { cancelled = true; };
  }, [userId]);

  useEffect(() => {
    if (!started) return;
    setActiveTab("hoje");
  }, [started]);

  useEffect(() => {
    const timer = window.setInterval(() => setCurrentDate(new Date()), 60000);
    return () => window.clearInterval(timer);
  }, []);

  // Auto-save when state changes
  useEffect(() => {
    if (!userId || !profileLoadedRef.current) return;
    scheduleSync();
  }, [profile, cycleUnlocked, streak, completed, notifications, lastActiveDate, planHiddenUntil, userId]);

  useEffect(() => {
    if (!started) return;
    const diff = getDayDiff(currentDate, lastActiveDate);
    if (diff <= 0) return;
    setNotifications((prev) => {
      const body = getReengagementMessage(diff);
      const alreadyExists = prev.some((item) => item.body === body);
      if (alreadyExists) return prev;
      return [buildNotification("Volte para o seu plano", body, "retomada"), ...prev].slice(0, 8);
    });
  }, [currentDate, lastActiveDate, started]);

  useEffect(() => {
    return () => { if (syncTimeoutRef.current) window.clearTimeout(syncTimeoutRef.current); };
  }, []);

  // Show onboarding overlay once for truly new users
  const hasAnyActivity = Object.keys(completed).length > 0 || streak > 0 || notifications.length > 0;
  useEffect(() => {
    if (!started && !planHiddenUntil && profileLoaded && !hasAnyActivity && !onboardingDismissed) {
      const timer = setTimeout(() => setShowOnboarding(true), 500);
      return () => clearTimeout(timer);
    }
  }, [started, planHiddenUntil, profileLoaded, hasAnyActivity, onboardingDismissed]);

  if (!authReady) {
    return (
      <div className="min-h-screen grid place-items-center bg-[linear-gradient(180deg,#fff6fb_0%,#fff0f7_45%,#ffffff_100%)] p-6" style={feminineTheme}>
        <Card className="w-full max-w-md rounded-[28px] border-rose-100 shadow-xl">
          <CardContent className="flex flex-col items-center gap-4 p-8">
            <div className="rounded-3xl bg-rose-100 p-4 text-rose-600"><Cloud className="h-8 w-8" /></div>
            <div className="text-xl font-bold text-slate-900">Carregando SlimDay</div>
            <div className="text-sm text-slate-600">Preparando sua área e verificando dados salvos.</div>
          </CardContent>
        </Card>
      </div>
    );
  }

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
      <div className="min-h-screen bg-[linear-gradient(180deg,#fff6fb_0%,#fff1f8_48%,#ffffff_100%)] px-4 flex items-center justify-center p-4" style={feminineTheme}>
        <Card className="max-w-md w-full rounded-[32px] border-rose-100 shadow-2xl p-8 text-center bg-white relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-rose-400 to-rose-600"></div>
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-rose-50">
            <Lock className="h-10 w-10 text-rose-600" />
          </div>
          <h2 className="text-3xl font-black text-slate-900">Aplicativo Bloqueado</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Sua conta SlimDay está confirmada, mas ainda não identificamos a liberação do seu acesso.
          </p>

          <a href={APP_SALES_LINK} target="_blank" rel="noopener noreferrer" className="mt-6 block">
            <Button className="w-full rounded-2xl h-14 text-lg font-bold bg-gradient-to-r from-rose-500 to-fuchsia-500 hover:from-rose-600 hover:to-fuchsia-600 shadow-xl shadow-rose-200">
              <ShoppingCart className="mr-2 h-5 w-5" /> Adquirir o SlimDay
            </Button>
          </a>

          <button
            onClick={verifyAndRefreshAppPurchase}
            disabled={appVerifyLoading}
            className="mt-4 flex w-full items-center justify-center h-12 rounded-2xl border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
          >
            {appVerifyLoading ? "Verificando..." : <><BadgeCheck className="mr-2 h-5 w-5" /> Já comprei — verificar acesso</>}
          </button>

          <button onClick={handleLogout} className="mt-6 text-xs text-slate-400 hover:text-slate-600 underline">
            Sair e usar outra conta
          </button>
        </Card>
      </div>
    );
  }

  const hasPromoRejected = Boolean(completed?.promoRejected);
  // Determine purchase price: promo if trial active OR if they haven't definitely rejected the final offer
  const currentPrice = (isTrialActive || !hasPromoRejected) ? PROMO_PRICE : FULL_PRICE;
  const currentPurchaseLink = (isTrialActive || !hasPromoRejected) ? PROMO_LINK : FULL_LINK;

  // Calendar access: unlocked by purchase OR during active trial period
  const canAccessCalendar = cycleUnlocked || isTrialActive;

  // Detect truly new users for onboarding prompt (non-blocking overlay)
  // hasAnyActivity is evaluated above

  return (
    <>
      {/* Modal Última Chance */}
      <AnimatePresence>
        {isTrialExpired && !hasPromoRejected && !cycleUnlocked && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-md p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md"
            >
              <Card className="rounded-[28px] border-rose-200 shadow-2xl overflow-hidden">
                <div className="bg-gradient-to-br from-rose-500 to-rose-700 p-6 text-white text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20">
                    <Star className="h-6 w-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-black">Última chance! ⏰</h2>
                  <p className="mt-2 text-sm opacity-90">Seu período de teste acabou, mas você ainda pode manter o acesso premium com desconto exclusivo.</p>
                </div>
                <CardContent className="p-6 space-y-4 text-center">
                  <div className="text-5xl font-black text-rose-600">R$ 29,90</div>
                  <div className="text-xs text-slate-500 line-through">Preço normal: R$ 89,90</div>

                  <a href={PROMO_LINK} target="_blank" rel="noopener noreferrer" className="block mt-4">
                    <Button className="w-full rounded-2xl h-12 text-lg font-bold bg-rose-600 hover:bg-rose-700 shadow-lg shadow-rose-200 animate-pulse-slow">
                      GARANTIR DESCONTO AGORA
                    </Button>
                  </a>

                  <button
                    className="mt-3 text-xs font-semibold text-slate-400 hover:text-slate-600 underline"
                    onClick={() => setCompleted(prev => ({ ...prev, promoRejected: true }))}
                  >
                    Recusar oferta permanentemente
                  </button>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Onboarding quiz overlay — never replaces the main app */}
      <AnimatePresence>
        {showOnboarding && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-xl"
            >
              <button
                onClick={() => { setShowOnboarding(false); setOnboardingDismissed(true); }}
                className="absolute -top-2 -right-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-lg text-slate-500 hover:text-slate-900 text-lg font-bold"
              >
                ×
              </button>
              <OnboardingQuiz
                profile={profile}
                onUpdateProfile={updateProfile}
                onComplete={() => { setShowOnboarding(false); setOnboardingDismissed(true); applyPlan(); }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="min-h-screen overflow-x-hidden bg-[linear-gradient(180deg,#fff6fb_0%,#fff1f8_40%,#ffffff_100%)] text-slate-900" style={feminineTheme}>
        <AnimatePresence>
          {showCongrats && (
            <motion.div initial={{ opacity: 0, y: 30, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.98 }}
              className="fixed right-4 top-4 z-50 max-w-sm rounded-3xl border border-rose-200 bg-white p-4 shadow-2xl">
              <div className="flex items-start gap-3">
                <div className="rounded-2xl bg-rose-100 p-2 text-rose-600"><Trophy className="h-5 w-5" /></div>
                <div>
                  <div className="font-bold text-slate-900">Parabéns!</div>
                  <div className="text-sm text-slate-600">Você concluiu: {lastCompletedTitle}</div>
                  <div className="mt-1 text-sm font-medium text-rose-600">{getCongratsMessage(completedCount + 1)}</div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {savedToast && (
            <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="fixed left-1/2 top-4 z-50 -translate-x-1/2 rounded-full border border-rose-200 bg-white px-4 py-2 text-sm font-semibold text-rose-700 shadow-lg">
              Plano atualizado com sucesso ✨
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mx-auto max-w-7xl px-4 py-8 md:py-12">
          {/* Dashboard Header Section */}
          <div className="mb-10 grid gap-6 lg:grid-cols-[1.4fr,0.6fr]">
            {/* Mensagem do Dia - Premium Card */}
            <Card className="rounded-[40px] border border-rose-100/70 shadow-premium overflow-hidden bg-white/95 backdrop-blur-sm group">
              <CardContent className="p-0 flex flex-col md:flex-row h-full">
                <div className="w-full md:w-1/3 bg-[linear-gradient(180deg,#e11d48_0%,#9d174d_100%)] p-8 flex flex-col justify-between text-white relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(244,114,182,0.28),transparent)]" />
                  <div className="relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[10px] uppercase tracking-widest font-bold">
                      <Sparkles className="h-3 w-3" /> Foco de Hoje
                    </div>
                    <div className="mt-6 text-4xl font-serif italic">{dayMessage.title}</div>
                  </div>
                  <div className="mt-8 relative z-10">
                    <p className="text-slate-400 text-xs uppercase tracking-widest font-bold mb-2">Constância</p>
                    <div className="flex items-center gap-2 text-primary font-bold">
                      <Zap className="h-4 w-4" /> {streak} Ganhando Ritmo
                    </div>
                  </div>
                </div>
                <div className="flex-1 p-8 md:p-10 flex flex-col justify-center bg-white">
                  <p className="text-slate-500 text-lg font-light leading-relaxed italic">
                    "{dayMessage.body}"
                  </p>
                  <div className="mt-8 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center">
                        {syncStatus === "synced" ? <Cloud className="h-5 w-5 text-rose-500" /> : <RefreshCcw className="h-5 w-5 text-slate-300 animate-spin" />}
                      </div>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{syncStatus === "synced" ? "Sincronizado" : "Sincronizando..."}</span>
                    </div>
                    <div className="text-xs text-slate-400 font-medium">
                      Atualizado agora
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Daily Progress - Circle/Card */}
            <Card className="rounded-[40px] border border-rose-100/70 shadow-premium bg-white/95 p-8 group hover:bg-primary transition-all duration-500">
              <div className="h-full flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <div className="h-14 w-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-white/20 group-hover:text-white transition-colors">
                    <BarChart3 className="h-7 w-7" />
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400 group-hover:text-white/60">Seu Progresso</p>
                    <p className="text-3xl font-serif mt-1 group-hover:text-white transition-colors">{progress}%</p>
                  </div>
                </div>
                
                <div className="mt-8 space-y-4">
                  <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden group-hover:bg-white/20">
                    <motion.div
                      className="h-full rounded-full bg-primary group-hover:bg-white"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 1, ease: "circOut" }}
                    />
                  </div>
                  <p className="text-sm font-light text-slate-500 group-hover:text-white/80 leading-relaxed">
                    Você concluiu <span className="font-bold group-hover:text-white">{completedCount}</span> de {totalCount} atividades planejadas para hoje.
                  </p>
                </div>

                <div className="mt-8 flex gap-3">
                  <Button variant="outline" className="flex-1 h-12 rounded-xl border-slate-100 text-xs font-bold uppercase tracking-widest hover:bg-slate-50 group-hover:border-white/20 group-hover:bg-white group-hover:text-primary" onClick={resetDay}>
                    <RefreshCcw className="mr-2 h-4 w-4" /> Reiniciar
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Headline Content */}
          <div className="mb-12 space-y-4">
            <h1 className="text-4xl md:text-5xl font-serif leading-tight">
              Olá, <span className="text-primary italic">{profile.nome || "querida"}</span>. <br />
              <span className="text-slate-400">Aqui está o seu plano para hoje.</span>
            </h1>
          </div>

          <div className="grid gap-4 md:gap-6 lg:grid-cols-[340px,1fr]">
            <div className="space-y-4 md:space-y-6">
              <Card className="rounded-[28px] border-rose-100 shadow-lg">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-rose-100 p-2 text-rose-600"><Sparkles className="h-5 w-5" /></div>
                    <div>
                      <CardTitle className="text-2xl">Seu painel</CardTitle>
                      <CardDescription>Resumo inteligente do seu plano atual.</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-3xl bg-[linear-gradient(135deg,#e11d48_0%,#9d174d_100%)] p-5 text-white">
                    <div className="text-sm font-semibold opacity-90">Plano do seu momento</div>
                    <div className="mt-2 text-3xl font-black leading-none">{dailyMinutes} min</div>
                    <div className="mt-2 text-sm opacity-90">Treino-base do app para caber no seu dia e evoluir com você.</div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl border bg-white p-4">
                      <div className="text-xs font-semibold text-slate-500">Objetivo</div>
                      <div className="mt-1 font-bold capitalize">{profile.objetivo.replace("mais energia", "Mais energia")}</div>
                    </div>
                    <div className="rounded-2xl border bg-white p-4">
                      <div className="text-xs font-semibold text-slate-500">Nível</div>
                      <div className="mt-1 font-bold capitalize">{profile.nivel}</div>
                    </div>
                  </div>
                  <div className="rounded-2xl border bg-white p-4">
                    <div className="text-xs font-semibold text-slate-500">Resumo do perfil</div>
                    <div className="mt-2 text-sm leading-6 text-slate-700">{getProfileSummary(profile)}</div>
                  </div>
                  {bmi && (
                    <div className="rounded-2xl border bg-rose-50 p-4 text-sm text-slate-700">
                      <span className="font-semibold">IMC estimado:</span> {bmi}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Plan personalization: visible only if not hidden */}
              {isPlanVisible ? (
                <Card className="rounded-[28px] border-orange-100 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-xl">Personalize seu plano</CardTitle>
                    <CardDescription>Altere os campos e o app reorganiza treino, refeições e foco semanal.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4">
                      <div>
                        <Label>Seu nome</Label>
                        <Input 
                          value={profile.nome} 
                          onChange={(e) => {
                            const val = sanitizeName(e.target.value);
                            updateProfile("nome", val);
                            setNameError(isGibberish(val));
                          }} 
                          placeholder="Digite seu nome" 
                          className={nameError ? "border-rose-500 focus-visible:ring-rose-500" : ""}
                        />
                        {nameError && <p className="text-[10px] text-rose-500 font-bold mt-1 uppercase tracking-wider">{nameError}</p>}
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <Label>Idade</Label>
                          <Input 
                            value={profile.idade} 
                            onChange={(e) => updateProfile("idade", e.target.value.replace(/[^0-9]/g, ""))} 
                            placeholder="28" 
                          />
                        </div>
                        <div>
                          <Label>Altura</Label>
                          <Input 
                            value={profile.altura} 
                            onChange={(e) => updateProfile("altura", sanitizeDecimal(e.target.value))} 
                            placeholder="1,65" 
                          />
                        </div>
                        <div>
                          <Label>Peso</Label>
                          <Input 
                            value={profile.peso} 
                            onChange={(e) => updateProfile("peso", sanitizeDecimal(e.target.value))} 
                            placeholder="72,5" 
                          />
                        </div>
                      </div>
                      <div>
                        <Label>Objetivo principal</Label>
                        <Select value={profile.objetivo} onValueChange={(v: Goal) => updateProfile("objetivo", v)}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="emagrecer">Emagrecer</SelectItem>
                            <SelectItem value="definir">Definir</SelectItem>
                            <SelectItem value="mais energia">Mais energia</SelectItem>
                            <SelectItem value="criar constancia">Criar constância</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label>Nível atual</Label>
                          <Select value={profile.nivel} onValueChange={(v: FitnessLevel) => updateProfile("nivel", v)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="iniciante">Iniciante</SelectItem>
                              <SelectItem value="intermediaria">Intermediária</SelectItem>
                              <SelectItem value="avancada">Avançada</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Tempo por dia</Label>
                          <Select value={profile.tempo} onValueChange={(v: TimePerDay) => updateProfile("tempo", v)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="10">10 min</SelectItem>
                              <SelectItem value="15">15 min</SelectItem>
                              <SelectItem value="20">20 min</SelectItem>
                              <SelectItem value="30">30 min</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label>Como é sua rotina?</Label>
                          <Select value={profile.rotina} onValueChange={(v: RoutineStyle) => updateProfile("rotina", v)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="corrida">Muito corrida</SelectItem>
                              <SelectItem value="moderada">Moderada</SelectItem>
                              <SelectItem value="flexivel">Mais flexível</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Estilo alimentar</Label>
                          <Select value={profile.refeicao} onValueChange={(v: MealStyle) => updateProfile("refeicao", v)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pratico">Prático</SelectItem>
                              <SelectItem value="equilibrado">Equilibrado</SelectItem>
                              <SelectItem value="sem tempo">Sem tempo</SelectItem>
                              <SelectItem value="caseiro">Mais caseiro</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                    <Button 
                      className="w-full rounded-2xl h-14 bg-gradient-to-r from-rose-500 to-fuchsia-500 hover:from-rose-600 hover:to-fuchsia-600 font-bold disabled:opacity-50 shadow-lg shadow-rose-200" 
                      onClick={applyPlan}
                      disabled={Boolean(nameError) || !profile.nome.trim()}
                    >
                      Atualizar meu plano <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <Card className="rounded-[28px] border-orange-100 shadow-lg">
                  <CardContent className="p-4 md:p-6">
                    <div className="flex items-center gap-3">
                      <div className="rounded-2xl bg-orange-100 p-2 text-orange-600"><BadgeCheck className="h-5 w-5" /></div>
                      <div>
                        <div className="font-bold text-slate-900">Plano atualizado ✨</div>
                        <div className="text-sm text-slate-600">Seu plano já foi ajustado. Disponível para nova edição em breve.</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="space-y-4 md:space-y-6 min-w-0">
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {[
                  { icon: <CalendarDays />, label: "Ciclo Pessoal", value: "Calendário", color: "text-rose-500", bg: "bg-rose-50", tab: "calendario" },
                  { icon: <Dumbbell />, label: "Até 20 min", value: "Treino Base", color: "text-rose-500", bg: "bg-rose-50", tab: "treino" },
                  { icon: <Utensils />, label: "Saudável e Rápido", value: "Refeições", color: "text-orange-500", bg: "bg-orange-50", tab: "alimentacao" },
                  { icon: <Target />, label: profile.objetivo, value: "Objetivo", color: "text-violet-500", bg: "bg-violet-50", tab: "hoje" },
                ].map((item, i) => (
                  <Card 
                    key={i} 
                    className="rounded-[32px] border-none shadow-sm hover:shadow-md hover:scale-[1.02] transition-all cursor-pointer p-6 bg-white flex flex-col items-center text-center space-y-3"
                    onClick={() => setActiveTab(item.tab)}
                  >
                    <div className={`h-12 w-12 rounded-2xl ${item.bg} ${item.color} flex items-center justify-center`}>
                      {React.cloneElement(item.icon as React.ReactElement, { className: "h-6 w-6" })}
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400">{item.label}</p>
                      <p className="text-sm font-bold text-slate-900 mt-1 capitalize">{item.value}</p>
                      {item.tab === "treino" && (
                        <p className="text-xs text-slate-500 mt-1">Hoje: {new Date().toLocaleDateString('pt-BR')}</p>
                      )}
                    </div>
                  </Card>
                ))}
              </div>

              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="mb-8">
                  <div className="overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4">
                    <TabsList className="inline-flex w-max gap-3 bg-transparent h-auto p-0">
                      {[
                        { value: "hoje", label: "Hoje", icon: <Home /> },
                        { value: "semana", label: "Agenda", icon: <CalendarDays /> },
                        { value: "treino", label: "Treino", icon: <Dumbbell /> },
                        { value: "alimentacao", label: "Menu", icon: <Utensils /> },
                        { value: "calendario", label: "Ciclo+", icon: <Sparkles /> },
                        { value: "checklist", label: "Tarefas", icon: <BadgeCheck /> },
                      ].map((tab) => (
                        <TabsTrigger
                          key={tab.value}
                          value={tab.value}
                          className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white border border-slate-100 shadow-sm data-[state=active]:bg-secondary data-[state=active]:text-white data-[state=active]:shadow-lg transition-all"
                        >
                          {React.cloneElement(tab.icon as React.ReactElement, { className: "h-4 w-4" })}
                          <span className="font-bold text-sm tracking-tight">{tab.label}</span>
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </div>
                </div>

                {/* Editar plano tab (visible only when plan is hidden from sidebar) */}
                {!isPlanVisible && (
                  <TabsContent value="editar-plano" className="mt-4">
                    <Card className="rounded-[28px] border-orange-100 shadow-lg">
                      <CardHeader>
                        <CardTitle className="text-2xl">Personalize seu plano</CardTitle>
                        <CardDescription>Altere os campos abaixo para reorganizar treino, refeições e foco semanal.</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid gap-4">
                          <div><Label>Seu nome</Label><Input value={profile.nome} onChange={(e) => updateProfile("nome", e.target.value)} placeholder="Digite seu nome" /></div>
                          <div className="grid grid-cols-3 gap-3">
                            <div><Label>Idade</Label><Input value={profile.idade} onChange={(e) => updateProfile("idade", e.target.value)} placeholder="28" /></div>
                            <div><Label>Altura</Label><Input value={profile.altura} onChange={(e) => updateProfile("altura", e.target.value)} placeholder="165" /></div>
                            <div><Label>Peso</Label><Input value={profile.peso} onChange={(e) => updateProfile("peso", e.target.value)} placeholder="72" /></div>
                          </div>
                          <div>
                            <Label>Objetivo principal</Label>
                            <Select value={profile.objetivo} onValueChange={(v: Goal) => updateProfile("objetivo", v)}>
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="emagrecer">Emagrecer</SelectItem>
                                <SelectItem value="definir">Definir</SelectItem>
                                <SelectItem value="mais energia">Mais energia</SelectItem>
                                <SelectItem value="criar constancia">Criar constância</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label>Nível atual</Label>
                              <Select value={profile.nivel} onValueChange={(v: FitnessLevel) => updateProfile("nivel", v)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="iniciante">Iniciante</SelectItem>
                                  <SelectItem value="intermediaria">Intermediária</SelectItem>
                                  <SelectItem value="avancada">Avançada</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label>Tempo por dia</Label>
                              <Select value={profile.tempo} onValueChange={(v: TimePerDay) => updateProfile("tempo", v)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="10">10 min</SelectItem>
                                  <SelectItem value="15">15 min</SelectItem>
                                  <SelectItem value="20">20 min</SelectItem>
                                  <SelectItem value="30">30 min</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label>Como é sua rotina?</Label>
                              <Select value={profile.rotina} onValueChange={(v: RoutineStyle) => updateProfile("rotina", v)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="corrida">Muito corrida</SelectItem>
                                  <SelectItem value="moderada">Moderada</SelectItem>
                                  <SelectItem value="flexivel">Mais flexível</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label>Estilo alimentar</Label>
                              <Select value={profile.refeicao} onValueChange={(v: MealStyle) => updateProfile("refeicao", v)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pratico">Prático</SelectItem>
                                  <SelectItem value="equilibrado">Equilibrado</SelectItem>
                                  <SelectItem value="sem tempo">Sem tempo</SelectItem>
                                  <SelectItem value="caseiro">Mais caseiro</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>
                        <Button className="w-full rounded-2xl" onClick={applyPlan}>
                          Atualizar meu plano <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                      </CardContent>
                    </Card>
                  </TabsContent>
                )}

                <TabsContent value="hoje" className="mt-0 space-y-8 animate-in fade-in duration-500">
                  <div className="grid gap-6 md:grid-cols-2">
                    <Card className="rounded-[40px] border-none shadow-premium bg-rose-50/50 p-8">
                      <div className="flex flex-col h-full justify-between">
                        <div>
                          <div className="h-12 w-12 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-600 mb-6">
                            <Dumbbell className="h-6 w-6" />
                          </div>
                          <h3 className="text-2xl font-serif italic mb-2">Seu Treino</h3>
                          <p className="text-slate-500 font-light text-sm leading-relaxed">
                            Apenas {dailyMinutes} minutos focados em evolução progressiva e queima eficiente.
                          </p>
                        </div>
                        <Button className="mt-8 h-14 rounded-2xl bg-rose-600 hover:bg-rose-700 font-bold" onClick={() => setActiveTab("treino")}>
                          Praticar Agora <PlayCircle className="ml-2 h-5 w-5" />
                        </Button>
                      </div>
                    </Card>

                    <Card className="rounded-[40px] border-none shadow-premium bg-orange-50/50 p-8">
                      <div className="flex flex-col h-full justify-between">
                        <div>
                          <div className="h-12 w-12 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-600 mb-6">
                            <Utensils className="h-6 w-6" />
                          </div>
                          <h3 className="text-2xl font-serif italic mb-2">Sua Nutrição</h3>
                          <p className="text-slate-500 font-light text-sm leading-relaxed">
                            4 sugestões práticas baseadas no seu estilo <span className="font-bold capitalize">{profile.refeicao}</span>.
                          </p>
                        </div>
                        <Button variant="outline" className="mt-8 h-14 rounded-2xl border-orange-200 text-orange-700 hover:bg-orange-50 font-bold" onClick={() => setActiveTab("alimentacao")}>
                          Ver Cardápio <ChevronRight className="ml-2 h-5 w-5" />
                        </Button>
                      </div>
                    </Card>
                  </div>

                  <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
                    {weekFocus.map((week, index) => (
                      <div key={week} className="bg-white p-6 rounded-[32px] border border-slate-50 shadow-sm flex flex-col items-center text-center">
                        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-[2px] mb-2">Fase {index + 1}</span>
                        <span className="text-sm font-bold text-slate-700">{week}</span>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="semana" className="mt-4">
                  <Card className="rounded-[28px] border-slate-200 shadow-lg">
                    <CardHeader>
                      <CardTitle className="text-2xl">Seu cronograma semanal</CardTitle>
                      <CardDescription>Um plano simples para manter rotina com treino e alimentação alinhados.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-slate-500 font-light">Siga o cronograma abaixo para manter sua rotina em dia.</p>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="treino" className="mt-0 animate-in fade-in duration-500">
                  <div className="grid gap-4">
                    {workoutPlan.map((item, index) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-white rounded-[32px] border border-slate-100 shadow-premium overflow-hidden"
                      >
                        <div className="p-6 md:p-8">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="flex-1 space-y-3">
                              <div className="inline-flex flex-wrap gap-2">
                                <Badge className={`rounded-full border text-[9px] font-bold uppercase tracking-wider ${categoryColors[item.categoria] || "bg-rose-50 text-rose-500 border-rose-100"}`}>{item.categoria}</Badge>
                                <Badge className="rounded-full bg-slate-50 text-slate-400 border-slate-100 text-[9px] font-bold uppercase tracking-wider">{item.nivel}</Badge>
                                <Badge className="rounded-full bg-slate-50 text-slate-400 border-slate-100 text-[9px] font-bold uppercase tracking-wider">{item.minutos} min</Badge>
                              </div>
                              <h4 className="text-2xl font-serif italic text-slate-900">{item.titulo}</h4>
                              <p className="text-slate-500 text-sm font-light leading-relaxed max-w-xl">{item.descricao}</p>
                              
                              <button 
                                onClick={() => setExpandedWorkoutId(expandedWorkoutId === item.id ? null : item.id)}
                                className="flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-widest hover:text-secondary transition-colors"
                              >
                                {expandedWorkoutId === item.id ? (
                                  <>Ocultar Instruções <ChevronUp className="h-4 w-4" /></>
                                ) : (
                                  <>Dúvida de como fazer? Clique aqui <ChevronDown className="h-4 w-4" /></>
                                )}
                              </button>
                            </div>

                            <Button
                              variant={completed[item.id] ? "ghost" : "default"}
                              className={`w-full md:w-48 h-12 rounded-2xl font-bold ${completed[item.id] ? "text-rose-500" : "bg-secondary hover:bg-black"}`}
                              onClick={() => toggleCheck(item.id, item.titulo)}
                            >
                              {completed[item.id] ? <><CheckCircle2 className="mr-2 h-5 w-5" /> Feito</> : "Marcar como Feito"}
                            </Button>
                          </div>

                          <AnimatePresence>
                            {expandedWorkoutId === item.id && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className="overflow-hidden"
                              >
                                <div className="mt-8 pt-8 border-t border-slate-50 grid md:grid-cols-2 gap-8">
                                  <div className="space-y-4">
                                    <p className="text-[10px] uppercase font-bold tracking-[3px] text-slate-300">Passo a Passo</p>
                                    <div className="space-y-3">
                                      {item.tutorial?.map((step, i) => (
                                        <div key={i} className="flex gap-4 text-sm font-light text-slate-500">
                                          <span className="text-primary font-serif italic font-bold shrink-0">{i + 1}.</span>
                                          <span>{step}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                  <div className="space-y-6">
                                    <div>
                                      <p className="text-[10px] uppercase font-bold tracking-[3px] text-slate-300 mb-2">Ponto de Foco</p>
                                      <p className="text-sm font-medium text-slate-700 italic">"{item.explicacaoSimples}"</p>
                                    </div>
                                    <div className="p-5 rounded-[24px] bg-rose-50 border border-rose-100">
                                      <div className="flex items-center gap-2 mb-2">
                                        <AlertCircle className="h-4 w-4 text-rose-400" />
                                        <p className="text-[10px] uppercase font-bold tracking-[3px] text-rose-400">Atenção</p>
                                      </div>
                                      <p className="text-xs text-rose-700 leading-relaxed font-light">{item.cuidado}</p>
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </TabsContent>


                <TabsContent value="alimentacao" className="mt-0 animate-in fade-in duration-500">
                  <div className="grid gap-8 md:grid-cols-2">
                    {mealPlan.map((item, index) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white rounded-[48px] border-none shadow-premium p-8 flex flex-col justify-between group"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-8">
                            <Badge variant="outline" className="rounded-full border-slate-100 text-slate-400 font-bold uppercase tracking-widest text-[9px] px-3">{item.categoria}</Badge>
                            <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${completed[item.id] ? "bg-rose-50 text-rose-500" : "bg-slate-50 text-slate-300"}`}>
                              <Utensils className="h-5 w-5" />
                            </div>
                          </div>
                          
                          <h4 className="text-2xl font-serif italic mb-4">{item.titulo}</h4>
                          <p className="text-slate-500 text-sm font-light leading-relaxed mb-8">{item.descricao}</p>
                          
                          {item.receita && (
                            <details className="mb-8">
                              <summary className="cursor-pointer text-xs font-bold uppercase tracking-widest text-primary hover:text-secondary transition-colors">Ver Receita Completa</summary>
                              <div className="mt-6 space-y-6 pt-6 border-t border-slate-50">
                                <div>
                                  <p className="text-[10px] uppercase font-bold tracking-[3px] text-slate-300 mb-3">Ingredientes</p>
                                  <ul className="grid grid-cols-1 gap-2">
                                    {item.receita.ingredientes.map((ing, i) => (
                                      <li key={i} className="text-sm font-light text-slate-500 flex items-center gap-2">
                                        <div className="h-1 w-1 rounded-full bg-primary" /> {ing}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                                <div>
                                  <p className="text-[10px] uppercase font-bold tracking-[3px] text-slate-300 mb-3">Preparo</p>
                                  <div className="space-y-3">
                                    {item.receita.preparo.map((step, i) => (
                                      <div key={i} className="flex gap-4 text-sm font-light text-slate-500">
                                        <span className="text-primary italic font-serif">{i + 1}.</span>
                                        <span>{step}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </details>
                          )}
                        </div>

                        <Button
                          variant={completed[item.id] ? "secondary" : "default"}
                          className={`w-full h-14 rounded-2xl font-bold transition-all ${completed[item.id] ? "bg-rose-50 text-rose-600 hover:bg-rose-100" : "bg-secondary hover:bg-black"}`}
                          onClick={() => toggleCheck(item.id, item.titulo)}
                        >
                          {completed[item.id] ? "Sincronizado ✓" : "Adicionar ao Planejamento"}
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="receitas" className="mt-4">
                  <Card className="rounded-[28px] border-orange-100 shadow-lg">
                    <CardHeader>
                      <CardTitle className="text-2xl">Sugestões de receitas</CardTitle>
                      <CardDescription>Opções mais fáceis de fazer, alinhadas ao seu estilo alimentar.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {recipeSuggestions.map((recipe, index) => (
                        <motion.div key={recipe.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className="rounded-3xl border bg-white overflow-hidden">
                          {recipeImages[recipe.id] && (
                            <img src={recipeImages[recipe.id]} alt={recipe.titulo} loading="lazy" width={512} height={512} className="w-full h-40 object-cover" />
                          )}
                          <div className="p-5">
                            <div className="flex items-center justify-between">
                              <Badge variant="outline" className="rounded-full">{recipe.categoria}</Badge>
                              <span className="text-xs font-semibold text-slate-500">{recipe.calorias}</span>
                            </div>
                            <div className="mt-4 text-lg font-bold text-slate-900">{recipe.titulo}</div>
                            <div className="mt-2 text-sm leading-6 text-slate-600">{recipe.descricao}</div>
                            {recipe.receita && (
                              <details className="mt-3">
                                <summary className="cursor-pointer text-sm font-semibold text-rose-700">📖 Ver receita completa</summary>
                                <div className="mt-3 rounded-2xl border bg-orange-50 p-4 space-y-3">
                                  <div>
                                    <div className="font-semibold text-slate-800 text-sm">🌿 Ingredientes</div>
                                    <ul className="mt-1 list-disc pl-4 text-sm text-slate-600 space-y-1">
                                      {recipe.receita.ingredientes.map((ing, i) => <li key={i}>{ing}</li>)}
                                    </ul>
                                  </div>
                                  <div>
                                    <div className="font-semibold text-slate-800 text-sm">👨‍🍳 Modo de preparo</div>
                                    <div className="mt-1 space-y-2">
                                      {recipe.receita.preparo.map((step, i) => (
                                        <div key={i} className="flex gap-2 text-sm text-slate-600">
                                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-orange-200 text-[11px] font-bold text-orange-800">{i + 1}</span>
                                          <span>{step}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </details>
                            )}
                            <Button variant="outline" className="mt-4 w-full rounded-2xl" onClick={() => toggleCheck(recipe.id, recipe.titulo)}>Salvar na rotina</Button>
                          </div>
                        </motion.div>
                      ))}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="calendario" className="mt-4">
                  <Card className="rounded-[28px] border-rose-100 shadow-lg">
                    <CardHeader>
                      <CardTitle className="text-2xl">Calendário menstrual premium</CardTitle>
                      <CardDescription>Um bônus opcional para acompanhar ciclo, ovulação estimada, janela fértil, fase do momento e docinhos fit.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-5">
                      {/* Alerta de Atraso / Gravidez */}
                      {Number(profile.duracaoCiclo) > 0 && (
                        (() => {
                          const diff = getDayDiff(currentDate, new Date(`${profile.ultimoCiclo}T12:00:00`));
                          const cycleLen = getCycleLength(profile);
                          const delay = diff - cycleLen;
                          if (delay > 5) {
                            return (
                              <motion.div 
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-6 rounded-[32px] bg-amber-50 border border-amber-200 shadow-sm"
                              >
                                <div className="flex gap-4">
                                  <div className="h-12 w-12 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                                    <Bell className="h-6 w-6" />
                                  </div>
                                  <div className="space-y-2">
                                    <h4 className="font-bold text-amber-900 text-lg">Atraso repentino detectado?</h4>
                                    <p className="text-sm text-amber-800 leading-relaxed">
                                      Seu ciclo está com um atraso de {delay} dias do previsto. Isso pode ocorrer por estresse, mudanças na rotina ou possível gravidez.
                                    </p>
                                    <Button 
                                      variant="outline" 
                                      className="border-amber-200 text-amber-900 hover:bg-amber-100 rounded-xl px-6"
                                      onClick={() => setShowSlimDayHealthPortal(true)}
                                    >
                                      Ler guia de saúde <ChevronRight className="ml-2 h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              </motion.div>
                            );
                          }
                          return null;
                        })()
                      )}

                      {/* Prompt de Confirmação de Término */}
                      <AnimatePresence>
                        {showMenstruationConfirm && (
                          <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                          >
                             <Card className="rounded-[32px] border-rose-100 bg-rose-50/30 p-6 flex flex-col md:flex-row items-center gap-6">
                               <div className="h-14 w-14 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 shrink-0 shadow-sm">
                                  <Waves className="h-8 w-8" />
                               </div>
                               <div className="flex-1 text-center md:text-left space-y-1">
                                  <p className="font-bold text-slate-900 text-lg">Sua menstruação já acabou?</p>
                                  <p className="text-sm text-slate-500">O calendário estima que seu fluxo termine hoje. Isso se confirma?</p>
                               </div>
                               <div className="flex gap-3 w-full md:w-auto">
                                  <Button 
                                    className="flex-1 md:flex-none rounded-2xl bg-rose-600 hover:bg-rose-700 font-bold px-8 h-12"
                                    onClick={() => {
                                      updateProfile("menstruationExtended", false);
                                      toggleCheck(`confirm-period-${toDateKey(currentDate)}`, "Confirmação de Término de Ciclo");
                                      setShowMenstruationConfirm(false);
                                    }}
                                  >
                                    Sim, acabou ✨
                                  </Button>
                                  <Button 
                                    variant="outline"
                                    className="flex-1 md:flex-none rounded-2xl border-slate-200 text-slate-500 font-bold px-8 h-12"
                                    onClick={() => {
                                      updateProfile("menstruationExtended", true);
                                      setShowMenstruationConfirm(false);
                                    }}
                                  >
                                    Ainda continua
                                  </Button>
                               </div>
                             </Card>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {!cycleUnlocked  ? (
                        <div className="grid gap-5 lg:grid-cols-[1.1fr,0.9fr]">
                          <div className="rounded-3xl border bg-[linear-gradient(135deg,#fff7f9_0%,#ffffff_100%)] p-6">
                            <div className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-sm font-semibold text-rose-700">
                              <Lock className="h-4 w-4" /> Bônus premium bloqueado
                            </div>
                            <div className="mt-4 text-2xl font-black text-slate-900">Desbloqueie seu Calendário de Ciclo+</div>
                            <div className="mt-3 text-sm leading-6 text-slate-600">
                              Tenha acesso a um calendário personalizado com fases coloridas, previsão estimada da ovulação, janela fértil, leitura da fase atual e sugestões de docinhos fit.
                            </div>
                            <div className="mt-5 grid gap-3 md:grid-cols-2">
                              <div className="rounded-2xl bg-white p-4">
                                <div className="text-sm font-semibold text-slate-900">Fases visuais</div>
                                <div className="mt-1 text-sm text-slate-600">Vermelho para menstruação, azul no final, roxo para ovulação e destaque para janela fértil.</div>
                              </div>
                              <div className="rounded-2xl bg-white p-4">
                                <div className="text-sm font-semibold text-slate-900">TPM e lembretes</div>
                                <div className="mt-1 text-sm text-slate-600">Previsões estimadas para ajudar você a se planejar melhor.</div>
                              </div>
                              <div className="rounded-2xl bg-white p-4">
                                <div className="text-sm font-semibold text-slate-900">Docinhos fit por fase</div>
                                <div className="mt-1 text-sm text-slate-600">Sugestões inteligentes para aliviar o estresse sem fugir do plano.</div>
                              </div>
                              <div className="rounded-2xl bg-white p-4">
                                <div className="text-sm font-semibold text-slate-900">Mais personalização</div>
                                <div className="mt-1 text-sm text-slate-600">Quanto mais você atualiza, mais o calendário se ajusta.</div>
                              </div>
                            </div>
                          </div>

                          <div className="rounded-3xl border bg-white p-6">
                            {isTrialActive && !cycleUnlocked && (
                              <div className="mb-4 rounded-2xl bg-gradient-to-r from-rose-50 to-rose-50 border border-rose-200 p-3">
                                <div className="text-xs font-semibold text-rose-700">🎁 Período de teste: {trialDaysLeft} dia{trialDaysLeft !== 1 ? "s" : ""} restante{trialDaysLeft !== 1 ? "s" : ""}</div>
                                <div className="text-xs text-slate-600 mt-1">Garanta acesso permanente por R$ {PROMO_PRICE.toFixed(2).replace(".", ",")} no período promocional!</div>
                              </div>
                            )}
                            <div className="text-sm font-semibold text-slate-500">
                              {isTrialActive ? "Oferta especial durante o teste" : "Desbloquear acesso permanente"}
                            </div>
                            <div className="mt-2 text-3xl font-black text-slate-900">
                              R$ {currentPrice.toFixed(2).replace(".", ",")}
                            </div>
                            {isTrialExpired && (
                              <div className="mt-2 text-xs text-rose-600 font-medium">
                                Seu período de teste expirou. Adquira o acesso permanente.
                              </div>
                            )}
                            <div className="mt-3 text-sm leading-6 text-slate-600">
                              {isTrialActive
                                ? `Aproveite o valor promocional de R$ ${PROMO_PRICE.toFixed(2).replace(".", ",")} antes do fim do período de teste.`
                                : `Libere seu Calendário de Ciclo+ por R$ ${currentPrice.toFixed(2).replace(".", ",")}.`
                              }
                            </div>
                            <a href={currentPurchaseLink} target="_blank" rel="noopener noreferrer">
                              <button className="mt-5 flex h-11 w-full items-center justify-center rounded-2xl bg-rose-500 px-4 font-semibold text-white hover:bg-rose-600">
                                <ShoppingCart className="mr-2 h-4 w-4" />
                                Comprar por R$ {currentPrice.toFixed(2).replace(".", ",")}
                              </button>
                            </a>
                            <button
                              onClick={verifyAndRefreshCyclePurchase}
                              className="mt-3 flex h-10 w-full items-center justify-center rounded-2xl border border-rose-200 bg-rose-50 px-4 text-sm font-semibold text-rose-700 hover:bg-rose-100"
                            >
                              <BadgeCheck className="mr-2 h-4 w-4" />
                              Já paguei — verificar agora
                            </button>
                            <div className="mt-3 text-xs leading-5 text-slate-500">
                              Após a confirmação do pagamento, clique em "Já paguei" para ativar seu calendário.
                            </div>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="grid gap-5 lg:grid-cols-[1.2fr,0.8fr]">
                            <div className="space-y-4">
                              <Card className="rounded-[36px] border border-slate-200 bg-white p-5 md:p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
                                <div className="grid gap-4 md:grid-cols-[1.2fr,0.65fr]">
                                  <div>
                                    <label className="text-sm font-medium text-slate-700">Último início da menstruação</label>
                                    <input type="date" className="mt-2 h-14 w-full rounded-[22px] border border-slate-200 bg-slate-50/90 px-4 text-base text-slate-700 outline-none transition focus:border-rose-300 focus:ring-4 focus:ring-rose-100" value={profile.ultimoCiclo || ""} onChange={(e) => updateProfile("ultimoCiclo", e.target.value)} />
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-slate-700">Duração do ciclo</label>
                                    <input type="number" className="mt-2 h-14 w-full rounded-[22px] border border-slate-200 bg-slate-50/90 px-4 text-base text-slate-700 outline-none transition focus:border-rose-300 focus:ring-4 focus:ring-rose-100" value={profile.duracaoCiclo || "28"} onChange={(e) => updateProfile("duracaoCiclo", e.target.value)} placeholder="28" />
                                  </div>
                                </div>

                                <div className="mt-4 flex items-center justify-between gap-3 rounded-[26px] border border-slate-200 bg-slate-50/70 p-3">
                                  <button
                                    type="button"
                                    onClick={() => setCalendarMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
                                    className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 transition hover:border-rose-200 hover:text-rose-500"
                                    aria-label="Mês anterior"
                                  >
                                    <ChevronLeft className="h-4 w-4" />
                                  </button>
                                  <div className="text-center">
                                    <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400">Visual do ciclo</div>
                                    <div className="mt-1 text-lg font-semibold text-slate-800">{cycleCalendarRangeLabel || "Calendário do ciclo"}</div>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => setCalendarMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
                                    className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 transition hover:border-rose-200 hover:text-rose-500"
                                    aria-label="Próximo mês"
                                  >
                                    <ChevronRight className="h-4 w-4" />
                                  </button>
                                </div>

                                <div className="mt-5 flex flex-wrap items-center gap-2 text-xs font-semibold">
                                  <span className="rounded-full bg-rose-500 px-4 py-2 text-white">Menstruação</span>
                                  <span className="rounded-full bg-sky-400 px-4 py-2 text-white">Final da menstruação</span>
                                  <span className="rounded-full bg-violet-500 px-4 py-2 text-white">Ovulação</span>
                                  <span className="rounded-full bg-fuchsia-100 px-4 py-2 text-fuchsia-700">Janela fértil</span>
                                </div>

                                <div className="mt-3">
                                  <span className="inline-flex rounded-full bg-rose-100 px-4 py-2 text-xs font-semibold text-rose-700">Hoje</span>
                                </div>

                                {cycleCalendar.length === 0 ? (
                                  <div className="mt-5 rounded-[24px] border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">Preencha a data do último ciclo para gerar seu calendário personalizado.</div>
                                ) : (
                                  <div className="mt-5 rounded-[28px] border border-slate-200 bg-[#fcfcfd] p-4 md:p-5">
                                    <div className="mb-4 grid grid-cols-7 gap-2">
                                      {["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"].map((d) => (
                                        <div key={d} className="py-1 text-center text-[11px] font-bold uppercase tracking-wide text-slate-400">{d}</div>
                                      ))}
                                    </div>

                                    <div className="grid grid-cols-7 gap-2.5 md:gap-3">
                                      {(() => {
                                        const firstDayKey = cycleCalendar[0]?.dateKey;
                                        if (!firstDayKey) return null;

                                        const firstDate = new Date(`${firstDayKey}T12:00:00`);
                                        const startDow = firstDate.getDay();
                                        const blanks = Array.from({ length: startDow }, (_, i) => (
                                          <div key={`blank-${i}`} className="aspect-square" />
                                        ));

                                        const days = cycleCalendar.map((day) => {
                                          const isToday = day.dateKey === todayKey;
                                          const isProjectStart = profile.projectStartDate && toDateKey(new Date(profile.projectStartDate)) === day.dateKey;
                                          
                                          const baseClass = day.phase === "menstruação"
                                            ? "border-rose-500 bg-rose-500 text-white"
                                            : day.phase === "menstruação_final"
                                            ? "border-sky-400 bg-sky-400 text-white"
                                            : day.phase === "ovulação"
                                            ? "border-violet-500 bg-violet-500 text-white"
                                            : day.phase === "fértil"
                                            ? "border-fuchsia-200 bg-fuchsia-100 text-fuchsia-700"
                                            : "border-slate-200 bg-white text-slate-700";
                                          const todayClass = "border-2 border-rose-400 bg-rose-50 text-rose-700 shadow-none";

                                          return (
                                            <div
                                              key={day.dateKey}
                                              className={`aspect-square rounded-[18px] border flex flex-col items-center justify-center relative transition-all ${isToday ? todayClass : baseClass}`}
                                            >
                                              <span className={`text-[15px] font-bold leading-none ${isToday ? "text-rose-700" : ""}`}>{day.dayNumber}</span>
                                              {isToday && (
                                                <span className="mt-1 text-[9px] font-extrabold uppercase tracking-[0.18em] text-rose-600">Hoje</span>
                                              )}
                                              {isProjectStart && (
                                                <motion.div 
                                                  initial={{ scale: 0, y: 10 }}
                                                  animate={{ scale: 1, y: 0 }}
                                                  className="absolute -top-5 left-1/2 -translate-x-1/2 z-20"
                                                  title="Início do Projeto 📌"
                                                >
                                                  <div className="relative group cursor-help">
                                                    {/* Sombra projetada do Pin */}
                                                    <div className="absolute top-6 left-1/2 -translate-x-1/2 w-2 h-1 bg-black/20 rounded-full blur-[1px]" />
                                                    
                                                    {/* Corpo do Pin 3D */}
                                                    <div className="relative flex flex-col items-center">
                                                      <div className="w-6 h-6 bg-gradient-to-tr from-rose-600 to-rose-400 rounded-full border-2 border-white shadow-lg flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
                                                        <MapPin className="h-3 w-3 text-white fill-white" />
                                                      </div>
                                                      <div className="w-0.5 h-2 bg-rose-500 rounded-full -mt-0.5 shadow-sm" />
                                                    </div>
                                                  </div>
                                                </motion.div>
                                              )}
                                            </div>
                                          );
                                        });

                                        return [...blanks, ...days];
                                      })()}
                                    </div>
                                  </div>
                                )}

                                <div className="mt-4 rounded-[24px] border border-rose-100 bg-rose-50/60 p-5">
                                  <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-rose-400 mb-3">Duração da sua menstruação</div>
                                  <div className="flex flex-wrap gap-2">
                                    {["3", "4", "5", "6", "7"].map((val) => (
                                      <button
                                        key={val}
                                        type="button"
                                        onClick={() => updateProfile("duracaoMenstruacao", val)}
                                        className={`h-11 px-6 rounded-2xl font-bold transition-all border-2 ${
                                          profile.duracaoMenstruacao === val 
                                            ? "bg-rose-500 border-rose-500 text-white shadow-md shadow-rose-200" 
                                            : "bg-white border-rose-100 text-rose-400 hover:border-rose-200"
                                        }`}
                                      >
                                        {val} dias
                                      </button>
                                    ))}
                                    <button
                                      type="button"
                                      onClick={() => updateProfile("duracaoMenstruacao", "8")}
                                      className={`h-11 px-6 rounded-2xl font-bold transition-all border-2 ${
                                        Number(profile.duracaoMenstruacao) >= 8 
                                          ? "bg-rose-500 border-rose-500 text-white shadow-md shadow-rose-200" 
                                          : "bg-white border-rose-100 text-rose-400 hover:border-rose-200"
                                      }`}
                                    >
                                      8+ dias
                                    </button>
                                  </div>
                                  <p className="mt-3 text-[11px] leading-relaxed text-slate-500 italic font-medium">
                                    O calendário funciona melhor quando você atualiza sua realidade mensal.
                                  </p>
                                </div>

                                {showMenstruationEndPrompt && (
                                  <motion.div 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mt-4 p-5 rounded-[28px] bg-sky-50 border-2 border-sky-100 shadow-sm"
                                  >
                                    <div className="flex items-center gap-3 mb-3">
                                      <div className="h-8 w-8 rounded-xl bg-sky-200 text-sky-600 flex items-center justify-center">
                                        <Sparkles className="h-4 w-4" />
                                      </div>
                                      <span className="font-bold text-sky-900 text-sm">Sua menstruação já terminou?</span>
                                    </div>
                                    <div className="flex gap-2">
                                      <Button 
                                        className="bg-sky-600 hover:bg-sky-700 h-10 rounded-xl font-bold flex-1"
                                        onClick={() => {
                                          setShowMenstruationEndPrompt(false);
                                          setNotifications(prev => [
                                            buildNotification("Ciclo Atualizado", "Ótimo! O app processou sua informação para mais precisão.", "conquista"),
                                            ...prev
                                          ].slice(0, 8));
                                        }}
                                      >
                                        Sim, já parou
                                      </Button>
                                      <Button 
                                        variant="outline" 
                                        className="h-10 rounded-xl border-sky-200 text-sky-600 hover:bg-sky-100 font-bold flex-1"
                                        onClick={() => setShowMenstruationEndPrompt(false)}
                                      >
                                        Ainda continua
                                      </Button>
                                    </div>
                                  </motion.div>
                                )}
                              </Card>
                            </div>{/* fim coluna esquerda */}

                            {/* Coluna direita – Portal de Saúde */}
                            <div className="space-y-6">
                              <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="bg-gradient-to-br from-rose-50 via-rose-100 to-pink-100 rounded-[40px] border border-rose-200 p-6 md:p-8 shadow-lg"
                              >
                                <div className="flex items-center gap-3 mb-6">
                                  <div className="h-10 w-10 rounded-2xl bg-white flex items-center justify-center text-rose-500 shadow-sm">
                                    <Heart className="h-5 w-5" />
                                  </div>
                                  <div>
                                    <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-rose-400">Espaço Saúde SlimDay</p>
                                    <h4 className="text-xl font-serif italic text-slate-900">Sabedoria do Corpo</h4>
                                  </div>
                                </div>

                                <AnimatePresence mode="wait">
                                  <motion.div
                                    key={currentCycleDay?.phase ?? "neutro"}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="space-y-5"
                                  >
                                    {currentCycleDay?.phase === "menstruação" || currentCycleDay?.phase === "menstruação_final" ? (
                                      <>
                                        <div className="space-y-2">
                                          <p className="text-sm font-bold text-rose-900 flex items-center gap-2">
                                            <span className="h-2 w-2 rounded-full bg-rose-500 inline-block" /> Cor do Fluxo
                                          </p>
                                          <p className="text-xs text-rose-700/80 bg-white/60 p-4 rounded-[20px] leading-relaxed italic">
                                            Vermelho vivo indica fluxo recente; tons amarronzados são normais no início/fim do ciclo.
                                          </p>
                                          <a href="https://pubmed.ncbi.nlm.nih.gov/?term=menstrual+flow+color" target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-rose-600 underline hover:text-rose-800">Ver estudo →</a>
                                        </div>
                                        <div className="space-y-2">
                                          <p className="text-sm font-bold text-rose-900 flex items-center gap-2">
                                            <span className="h-2 w-2 rounded-full bg-rose-500 inline-block" /> Higiene Íntima
                                          </p>
                                          <p className="text-xs text-rose-700/80 bg-white/60 p-4 rounded-[20px] leading-relaxed italic">
                                            Use roupas de algodão, evite protetores perfumados e duchas internas.
                                          </p>
                                          <a href="https://www.who.int/reproductivehealth/publications/menstrual-hygiene/en/" target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-rose-600 underline hover:text-rose-800">Ver recomendação OMS →</a>
                                        </div>
                                        <div className="p-4 rounded-[24px] bg-rose-500 text-white text-center shadow-md">
                                          <p className="text-xs font-bold mb-1">✨ Dica de Ouro</p>
                                          <p className="text-[11px] opacity-90 leading-relaxed">Compressas mornas no abdômen aliviam cólicas naturalmente.</p>
                                        </div>
                                      </>
                                    ) : currentCycleDay?.phase === "fértil" || currentCycleDay?.phase === "ovulação" ? (
                                      <>
                                        <div className="space-y-2">
                                          <p className="text-sm font-bold text-violet-900 flex items-center gap-2">
                                            <span className="h-2 w-2 rounded-full bg-violet-500 inline-block" /> Janela Fértil
                                          </p>
                                          <p className="text-xs text-violet-700/80 bg-white/60 p-4 rounded-[20px] leading-relaxed italic">
                                            Muco transparente e elástico é sinal máximo de fertilidade — cuide-se!
                                          </p>
                                          <a href="https://pubmed.ncbi.nlm.nih.gov/?term=cervical+mucus+ovulation" target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-violet-600 underline hover:text-violet-800">Ver estudo →</a>
                                        </div>
                                        <div className="space-y-2">
                                          <p className="text-sm font-bold text-violet-900 flex items-center gap-2">
                                            <span className="h-2 w-2 rounded-full bg-violet-500 inline-block" /> Energia & Libido
                                          </p>
                                          <p className="text-xs text-violet-700/80 bg-white/60 p-4 rounded-[20px] leading-relaxed italic">
                                            Hormônios em alta — ótimo para treinos intensos e autoestima elevada.
                                          </p>
                                          <a href="https://pubmed.ncbi.nlm.nih.gov/?term=exercise+ovulation+phase" target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-violet-600 underline hover:text-violet-800">Ver estudo →</a>
                                        </div>
                                      </>
                                    ) : (
                                      <>
                                        <div className="space-y-2">
                                          <p className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                            <span className="h-2 w-2 rounded-full bg-pink-400 inline-block" /> Nutrição & Hidratação
                                          </p>
                                          <p className="text-xs text-slate-600 bg-white/60 p-4 rounded-[20px] leading-relaxed italic">
                                            Priorize proteínas e água para evitar inchaço pré-menstrual.
                                          </p>
                                          <a href="https://www.nutrition.org.uk/nutritionscience/life/menstrual-cycle.html" target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-pink-600 underline hover:text-pink-800">Ver dicas nutricionais →</a>
                                        </div>
                                        <div className="space-y-2">
                                          <p className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                            <span className="h-2 w-2 rounded-full bg-pink-400 inline-block" /> Sono & Relaxamento
                                          </p>
                                          <p className="text-xs text-slate-600 bg-white/60 p-4 rounded-[20px] leading-relaxed italic">
                                            Seu corpo está em regeneração — crie um ritual de sono tranquilo.
                                          </p>
                                          <a href="https://pubmed.ncbi.nlm.nih.gov/?term=sleep+menstrual+cycle" target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-pink-600 underline hover:text-pink-800">Ver pesquisa →</a>
                                        </div>
                                      </>
                                    )}
                                  </motion.div>
                                </AnimatePresence>
                              </motion.div>

                              {/* Call-to-action */}
                              <div className="p-5 rounded-[32px] bg-white/80 border border-rose-100 text-center shadow-sm">
                                <div className="text-[10px] uppercase font-bold tracking-[0.2em] text-rose-300 mb-2">Compromisso SlimDay</div>
                                <p className="text-sm text-slate-500 max-w-[220px] mx-auto italic leading-relaxed">
                                  Conecte-se ao seu ritmo natural e floresça a cada fase.
                                </p>
                              </div>
                            </div>{/* fim coluna direita */}

                          </div>{/* fim grid */}

                          {/* Reforço de Precisão */}
                          <div className="mt-6 p-6 rounded-[32px] bg-slate-50 border border-slate-100 text-center">
                            <div className="text-[10px] uppercase font-bold tracking-[0.2em] text-slate-400 mb-2">Reforço de Precisão</div>
                            <p className="text-sm text-slate-500 leading-relaxed max-w-sm mx-auto">
                              Lembre-se: o <strong>Calendário Ciclo+</strong> é seu principal aliado.
                              Atualize seus dados diariamente para garantir previsões 100% precisas e personalizadas.
                            </p>
                          </div>
                        </>

                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="checklist" className="mt-0 animate-in fade-in duration-500">
                  <div className="grid gap-8 lg:grid-cols-[1.5fr,1fr]">
                    <div className="space-y-4">
                      {checklistItems.map((item, i) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className={`flex items-center justify-between p-6 rounded-[32px] border-none shadow-premium bg-white group hover:bg-slate-50 transition-colors ${completed[item.id] ? "opacity-60" : ""}`}
                        >
                          <div className="flex items-center gap-6">
                            <div
                              onClick={() => toggleCheck(item.id, item.titulo)}
                              className={`h-8 w-8 rounded-xl border-2 flex items-center justify-center cursor-pointer transition-all ${
                                completed[item.id] ? "bg-primary border-primary text-white" : "border-slate-200 group-hover:border-primary"
                              }`}
                            >
                              {completed[item.id] && <Check className="h-5 w-5" />}
                            </div>
                            <div>
                              <p className={`text-lg font-serif italic ${completed[item.id] ? "line-through text-slate-400" : "text-slate-900"}`}>{item.titulo}</p>
                              <p className="text-[10px] uppercase font-bold tracking-widest text-slate-300 mt-1">{item.tipo}</p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    <div className="space-y-6">
                      <Card className="rounded-[40px] border-none shadow-premium bg-rose-50/70 p-10 text-center">
                        <div className="h-16 w-16 rounded-3xl bg-rose-100 mx-auto flex items-center justify-center text-rose-500 mb-6">
                          <Trophy className="h-8 w-8" />
                        </div>
                        <h3 className="text-2xl font-serif italic mb-4">Meta Diária</h3>
                        <p className="text-rose-700 font-bold text-4xl mb-4">{progress}%</p>
                        <p className="text-slate-500 text-sm font-light leading-relaxed">
                          "{getCongratsMessage(completedCount)}"
                        </p>
                      </Card>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white p-6 rounded-[32px] border border-slate-50 shadow-sm flex flex-col items-center text-center">
                          <div className="h-10 w-10 rounded-xl bg-sky-50 text-sky-500 flex items-center justify-center mb-4">
                            <Waves className="h-5 w-5" />
                          </div>
                          <span className="text-[10px] uppercase font-bold text-slate-300 mb-1">Hábitos</span>
                          <span className="text-sm font-bold">8 Copos Água</span>
                        </div>
                        <div className="bg-white p-6 rounded-[32px] border border-slate-50 shadow-sm flex flex-col items-center text-center">
                          <div className="h-10 w-10 rounded-xl bg-violet-50 text-violet-500 flex items-center justify-center mb-4">
                            <Moon className="h-5 w-5" />
                          </div>
                          <span className="text-[10px] uppercase font-bold text-slate-300 mb-1">Descanso</span>
                          <span className="text-sm font-bold">Sono Profundo</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="alertas" className="mt-0 animate-in fade-in duration-500">
                  <div className="space-y-6">
                    {notifications.length === 0 ? (
                      <Card className="rounded-[40px] border-dashed border-slate-200 bg-transparent p-12 text-center">
                        <div className="h-16 w-16 rounded-full bg-slate-50 mx-auto flex items-center justify-center text-slate-300 mb-6">
                          <BellOff className="h-8 w-8" />
                        </div>
                        <p className="text-slate-400 font-light italic">Seus alertas e conquistas serão listados aqui.</p>
                      </Card>
                    ) : (
                      <div className="grid gap-4">
                        {notifications.map((item, i) => (
                          <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="bg-white p-6 rounded-[32px] border-none shadow-premium flex items-start gap-6 group"
                          >
                            <div className="h-12 w-12 rounded-2xl bg-violet-50 text-violet-500 flex items-center justify-center shrink-0 group-hover:bg-violet-500 group-hover:text-white transition-all">
                              <Bell className="h-6 w-6" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <Badge className="rounded-full bg-slate-100 text-slate-400 border-none text-[8px] font-bold uppercase tracking-widest">{item.tone}</Badge>
                                <span className="text-[10px] font-bold text-slate-300 uppercase">{new Date(item.createdAt).toLocaleDateString("pt-BR")}</span>
                              </div>
                              <h5 className="text-lg font-serif italic text-slate-900">{item.title}</h5>
                              <p className="mt-2 text-sm text-slate-500 font-light leading-relaxed">{item.body}</p>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="feedback" className="mt-0 animate-in fade-in duration-500">
                  <Card className="rounded-[40px] border border-rose-100/70 shadow-premium bg-white/95 p-10 overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-fuchsia-100 blur-3xl rounded-full -mr-32 -mt-32" />
                    
                    <div className="relative z-10">
                      <div className="flex flex-col md:flex-row gap-10">
                        <div className="flex-1">
                          <h3 className="text-4xl font-serif italic mb-6">Sua voz importa.</h3>
                          <p className="text-slate-500 font-light leading-relaxed mb-8">
                            O SlimDay é construído para mulheres reais. Suas sugestões, críticas e ideias são o que nos faz crescer. Digite abaixo o que você está achando da sua experiência.
                          </p>
                          <FeedbackForm userEmail={profile?.nome || ""} />
                        </div>
                        
                        <div className="w-full md:w-80 space-y-6 pt-10 border-t md:border-t-0 md:pt-0 md:pl-10 md:border-l border-slate-50">
                          <div className="space-y-4">
                            <p className="text-[10px] uppercase font-bold tracking-[3px] text-slate-300">Contato Direto</p>
                            <div className="bg-pink-50 p-6 rounded-3xl border border-pink-100">
                              <div className="flex items-center gap-4 mb-4">
                                <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center text-pink-500 shadow-sm">
                                  <Mail className="h-5 w-5" />
                                </div>
                                <span className="font-bold text-sm text-slate-900">E-mail Suporte</span>
                              </div>
                              <a href="mailto:atendimentoslimday@gmail.com" className="text-sm font-medium text-pink-700 hover:underline">
                                atendimentoslimday@gmail.com
                              </a>
                            </div>
                            <p className="text-xs text-slate-400 font-light px-2 italic">
                              Respondemos em até 24h úteis para ajudar você em sua jornada.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
      
      <HealthGuideModal open={showSlimDayHealthPortal} onOpenChange={setShowSlimDayHealthPortal} />
    </>
  );
}

function HealthGuideModal({ open, onOpenChange }: { open: boolean, onOpenChange: (v: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl rounded-[40px] border-none p-0 overflow-hidden shadow-2xl">
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-8 text-white relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-3xl rounded-full -mr-16 -mt-16" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-sm">
                <ShieldCheck className="h-6 w-6 text-rose-400" />
              </div>
              <span className="text-[10px] uppercase font-bold tracking-[0.22em] text-slate-400 uppercase">Espaço Saúde SlimDay</span>
            </div>
            <h2 className="text-3xl font-serif italic">Guia de Saúde e Ciclo Feminino</h2>
            <p className="mt-4 text-slate-400 font-light leading-relaxed max-w-lg text-sm">
              Sua saúde hormonal é sensível às mudanças do seu cotidiano. Entenda o que pode estar afetando seu ritmo natural.
            </p>
          </div>
        </div>
        
        <div className="p-8 bg-white space-y-8 overflow-y-auto max-h-[70vh]">
          {/* Sessão 1: Por que o atraso? */}
          <section className="space-y-4">
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <ChevronRight className="h-5 w-5 text-rose-500" /> Por que minha menstruação atrasou?
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-5 rounded-[28px] bg-rose-50/50 border border-rose-100">
                <div className="font-bold text-slate-800 text-sm mb-2">Estresse e Sono</div>
                <p className="text-xs text-slate-500 leading-relaxed italic font-medium">O excesso de cortisol (hormônio do estresse) pode pausar a ovulação, atrasando todo o ciclo.</p>
              </div>
              <div className="p-5 rounded-[28px] bg-rose-50/50 border border-rose-100">
                <div className="font-bold text-slate-800 text-sm mb-2">Mudança de Rotina</div>
                <p className="text-xs text-slate-500 leading-relaxed italic font-medium">Novos exercícios ou mudanças bruscas na alimentação (SlimDay) podem causar adaptações hormonais temporárias.</p>
              </div>
            </div>
          </section>

          {/* Sessão 2: Sinais de Gravidez */}
          <section className="space-y-4">
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <ChevronRight className="h-5 w-5 text-rose-500" /> Sinais Sutis de Gravidez
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed px-1">
              Seu corpo dá pequenos sinais antes mesmo do teste. Fique atenta a:
            </p>
            <ul className="grid gap-3 p-4 rounded-3xl bg-slate-50 border border-slate-100">
              <li className="flex items-start gap-3 text-sm text-slate-700">
                 <div className="h-1.5 w-1.5 rounded-full bg-rose-400 mt-2 shrink-0" />
                 <span>Sensibilidade ou inchaço excessivo nas mamas.</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-slate-700">
                 <div className="h-1.5 w-1.5 rounded-full bg-rose-400 mt-2 shrink-0" />
                 <span>Cansaço fora do comum ou sonolência constante.</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-slate-700">
                 <div className="h-1.5 w-1.5 rounded-full bg-rose-400 mt-2 shrink-0" />
                 <span>Náuseas matinais ou aversão a cheiros que você gostava.</span>
              </li>
            </ul>
          </section>

          {/* Sessão 3: Precisão é Tudo */}
          <section className="p-6 rounded-[32px] bg-[linear-gradient(135deg,#fff1f5_0%,#fff9fb_100%)] border border-rose-100 text-center">
             <Star className="h-8 w-8 text-rose-400 mx-auto mb-4" />
             <h4 className="font-bold text-rose-900 text-lg mb-2">Seu Calendário é Inteligente</h4>
             <p className="text-sm text-rose-700/80 leading-relaxed italic">
               Nossa tecnologia estima suas fases, mas cada corpo é único. <strong>Sempre atualize</strong> a data exata que sua menstruação começou e terminou para que o app aprenda o seu padrão real.
             </p>
          </section>

          <Button 
            className="w-full h-14 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-base shadow-xl"
            onClick={() => onOpenChange(false)}
          >
            Entendido, obrigado!
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default SlimDayApp;


