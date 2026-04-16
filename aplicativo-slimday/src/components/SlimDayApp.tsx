import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { recipeImages } from "@/assets/recipes";
// Build trigger: Resending export fix for SlimDayApp
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import {
  CheckCircle2,
  Clock3,
  Salad,
  Dumbbell,
  Sparkles,
  ChevronLeft, ChevronRight,
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
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";

// --- Helpers de Sanitização e Segurança ---
function sanitizeName(name: string): string {
  return name.replace(/[^a-zA-ZáàâãéèêíïóôõöúçÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇ\s]/g, "").slice(0, 50);
}

function sanitizeNumber(val: string, maxLen: number): string {
  return val.replace(/\D/g, "").slice(0, maxLen);
}

function sanitizeEmail(email: string): string {
  return email.toLowerCase().trim().slice(0, 100);
}


type FitnessLevel = "iniciante" | "intermediaria" | "avancada";
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
};

type PlanItem = {
  id: string;
  titulo: string;
  descricao: string;
  minutos?: number;
  nivel?: string;
  categoria?: string;
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
};

const dailyMessages: DailyMessage[] = [
  { title: "Todo dia conta", body: "Mesmo uma rotina curta hoje j├í ajuda voc├¬ a continuar no caminho certo." },
  { title: "Seu ritmo importa", body: "Voc├¬ n├úo precisa fazer tudo de uma vez. O importante ├® voltar e manter const├óncia." },
  { title: "Come├ºar leve ainda ├® come├ºar", body: "Treinos curtos e refei├º├Áes simples tamb├®m constroem resultado quando viram h├íbito." },
  { title: "Seu progresso gosta de repeti├º├úo", body: "Quanto mais voc├¬ volta, mais natural sua nova rotina fica." },
  { title: "Hoje ├® uma nova chance", body: "Retomar o plano hoje ajuda a manter o progresso mais vivo e consistente." },
  { title: "Pequenas vit├│rias acumulam", body: "Cada etapa conclu├¡da fortalece sua confian├ºa e facilita o pr├│ximo passo." },
  { title: "Voltar faz diferen├ºa", body: "Ficar muitos dias sem abrir o plano pode enfraquecer seu ritmo. Recome├ºar hoje j├í recoloca voc├¬ no eixo." },
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
          name: feedbackName.trim().slice(0, 100) || userEmail || "An├┤nimo",
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
              <SelectItem value="sugestao">­ƒÆí Sugest├úo de melhoria</SelectItem>
              <SelectItem value="ideia">­ƒîƒ Nova ideia</SelectItem>
              <SelectItem value="problema">­ƒÉø Algo n├úo funcionou</SelectItem>
              <SelectItem value="elogio">­ƒÆò Elogio</SelectItem>
              <SelectItem value="outro">­ƒôØ Outro</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-sm font-semibold text-slate-700">Sua mensagem</Label>
          <Textarea
            className="mt-1 min-h-[120px] rounded-2xl"
            placeholder="Conte pra gente o que voc├¬ gostaria de ver no app, o que pode melhorar ou qualquer coisa que queira compartilhar ­ƒî©"
            value={feedbackMsg}
            onChange={(e) => setFeedbackMsg(e.target.value)}
            maxLength={2000}
          />
          <div className="mt-1 text-right text-xs text-slate-400">{feedbackMsg.length}/2000</div>
        </div>

        {sent ? (
          <div className="rounded-2xl bg-emerald-50 p-4 text-center">
            <div className="text-lg font-bold text-emerald-700">Recebemos! ­ƒÆò</div>
            <div className="mt-1 text-sm text-emerald-600">Obrigada pelo seu feedback. Ele ├® muito valioso pra n├│s!</div>
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
    { id: "rp1", titulo: "Omelete com queijo branco", descricao: "Pronto em poucos minutos e bom para come├ºar o dia.", categoria: "Receita r├ípida", calorias: "~280 kcal", receita: { ingredientes: ["2 ovos", "30g de queijo branco (minas ou cottage)", "1 colher de ch├í de azeite", "Sal e pimenta a gosto", "Ervas finas (opcional)"], preparo: ["Quebre os ovos em uma tigela e bata levemente com um garfo.", "Aque├ºa uma frigideira antiaderente com o azeite em fogo m├®dio.", "Despeje os ovos e distribua o queijo por cima.", "Quando as bordas firmarem, dobre ao meio.", "Cozinhe por mais 1 minuto e sirva."] } },
    { id: "rp2", titulo: "Frango desfiado com arroz e salada", descricao: "Prato simples para deixar adiantado.", categoria: "Receita r├ípida", calorias: "~430 kcal", receita: { ingredientes: ["150g de peito de frango", "1/2 x├¡cara de arroz cozido", "Folhas verdes (alface, r├║cula)", "1/2 tomate picado", "1 colher de sopa de azeite", "Sal, alho e lim├úo a gosto"], preparo: ["Cozinhe o peito de frango em ├ígua com sal e alho por 20 minutos.", "Desfie o frango com dois garfos.", "Monte o prato com arroz, frango desfiado e salada.", "Tempere a salada com azeite e lim├úo.", "Pode deixar pronto na geladeira para o dia seguinte."] } },
    { id: "rp3", titulo: "Iogurte com banana e aveia", descricao: "Lanche f├ícil para a tarde corrida.", categoria: "Receita r├ípida", calorias: "~210 kcal", receita: { ingredientes: ["1 pote de iogurte natural (170g)", "1 banana madura", "2 colheres de sopa de aveia em flocos", "Canela em p├│ a gosto", "1 colher de ch├í de mel (opcional)"], preparo: ["Coloque o iogurte em uma tigela ou copo.", "Corte a banana em rodelas por cima.", "Adicione a aveia e a canela.", "Misture levemente se preferir ou coma em camadas.", "Pronto em 2 minutos!"] } },
  ],
  equilibrado: [
    { id: "re1", titulo: "Peixe com legumes e pur├¬", descricao: "Mais equil├¡brio com preparo simples.", categoria: "Receita equilibrada", calorias: "~410 kcal", receita: { ingredientes: ["1 fil├® de til├ípia ou merluza (150g)", "1 batata m├®dia", "1/2 cenoura", "1/2 abobrinha", "1 colher de sopa de azeite", "Sal, lim├úo e ervas a gosto", "1 colher de sopa de leite (para o pur├¬)"], preparo: ["Cozinhe a batata descascada e amasse com leite e sal para o pur├¬.", "Corte a cenoura e abobrinha em cubos e refogue no azeite por 5 min.", "Tempere o peixe com sal e lim├úo.", "Grelhe o peixe em frigideira com azeite por 3-4 min de cada lado.", "Monte o prato com pur├¬, legumes e o peixe por cima."] } },
    { id: "re2", titulo: "Wrap de frango com folhas", descricao: "Boa op├º├úo para almo├ºo leve.", categoria: "Receita equilibrada", calorias: "~330 kcal", receita: { ingredientes: ["1 tortilha integral", "100g de frango desfiado ou em tiras", "Folhas de alface e r├║cula", "2 fatias de tomate", "1 colher de sopa de requeij├úo light", "Temperos a gosto"], preparo: ["Aque├ºa a tortilha levemente numa frigideira seca.", "Espalhe o requeij├úo na tortilha.", "Distribua o frango, as folhas e o tomate.", "Enrole bem apertado.", "Corte ao meio na diagonal e sirva."] } },
    { id: "re3", titulo: "Crepioca com recheio leve", descricao: "Vers├ítil e f├ícil de adaptar.", categoria: "Receita equilibrada", calorias: "~290 kcal", receita: { ingredientes: ["1 ovo", "2 colheres de sopa de tapioca", "Recheio: queijo branco + tomate ou frango desfiado", "Sal a gosto"], preparo: ["Misture o ovo com a tapioca e o sal.", "Aque├ºa uma frigideira antiaderente em fogo m├®dio.", "Despeje a mistura e espalhe como uma panqueca.", "Quando firmar por baixo, adicione o recheio.", "Dobre ao meio e sirva."] } },
  ],
  "sem tempo": [
    { id: "st1", titulo: "Shake proteico com fruta", descricao: "Op├º├úo pr├ítica para correria real.", categoria: "Receita express", calorias: "~250 kcal", receita: { ingredientes: ["200ml de leite (ou bebida vegetal)", "1 banana congelada", "1 colher de sopa de pasta de amendoim", "1 scoop de whey ou 2 colheres de leite em p├│", "Gelo a gosto"], preparo: ["Coloque todos os ingredientes no liquidificador.", "Bata por 30 segundos at├® ficar cremoso.", "Sirva gelado.", "Varia├º├úo: troque banana por morango congelado."] } },
    { id: "st2", titulo: "Sandu├¡che leve de atum", descricao: "F├ícil de montar e levar.", categoria: "Receita express", calorias: "~320 kcal", receita: { ingredientes: ["2 fatias de p├úo integral", "1 lata pequena de atum (escorrido)", "1 colher de sopa de requeij├úo light", "Folhas de alface", "Tomate em fatias", "Sal e lim├úo a gosto"], preparo: ["Escorra bem o atum e misture com requeij├úo e lim├úo.", "Monte o sandu├¡che com alface e tomate.", "Embrulhe em papel filme para levar.", "Pode fazer na noite anterior."] } },
    { id: "st3", titulo: "Pote de overnight oats", descricao: "Fica pronto na noite anterior.", categoria: "Receita express", calorias: "~260 kcal", receita: { ingredientes: ["3 colheres de sopa de aveia em flocos", "150ml de leite ou iogurte", "1 colher de ch├í de chia", "Frutas picadas (morango, banana)", "1 colher de ch├í de mel (opcional)", "Canela a gosto"], preparo: ["Misture aveia, leite/iogurte e chia em um pote com tampa.", "Adicione mel e canela.", "Tampe e leve ├á geladeira por no m├¡nimo 6 horas (ou de um dia pro outro).", "Na manh├ú seguinte, adicione as frutas por cima.", "Coma frio direto do pote."] } },
  ],
  caseiro: [
    { id: "ca1", titulo: "Arroz, feij├úo, frango e salada", descricao: "Base caseira pr├ítica e eficiente.", categoria: "Receita caseira", calorias: "~460 kcal", receita: { ingredientes: ["1/2 x├¡cara de arroz cozido", "1 concha de feij├úo", "1 fil├® de frango grelhado (150g)", "Salada: alface, tomate, cenoura ralada", "1 colher de sopa de azeite", "Temperos: sal, alho, cebola, lim├úo"], preparo: ["Cozinhe o arroz e o feij├úo normalmente (pode usar panela de press├úo).", "Tempere o frango com sal e alho, grelhe em frigideira com um fio de azeite.", "Lave e corte os vegetais da salada.", "Monte o prato equilibrando por├º├Áes.", "Tempere a salada com azeite e lim├úo."] } },
    { id: "ca2", titulo: "Sopa de legumes com carne", descricao: "Confort├ível e simples para o jantar.", categoria: "Receita caseira", calorias: "~300 kcal", receita: { ingredientes: ["100g de carne mo├¡da magra (ou m├║sculo em cubos)", "1 batata pequena", "1/2 cenoura", "1/2 abobrinha", "1/2 cebola", "2 dentes de alho", "Sal, pimenta e salsinha a gosto", "500ml de ├ígua"], preparo: ["Refogue a cebola e o alho em um fio de azeite.", "Adicione a carne e refogue at├® dourar.", "Acrescente os legumes cortados em cubos e a ├ígua.", "Cozinhe em fogo m├®dio por 25-30 minutos at├® tudo ficar macio.", "Ajuste o sal e finalize com salsinha picada."] } },
    { id: "ca3", titulo: "Ovos mexidos com p├úo integral", descricao: "Simples, r├ípido e acess├¡vel.", categoria: "Receita caseira", calorias: "~290 kcal", receita: { ingredientes: ["2 ovos", "1 colher de ch├í de manteiga ou azeite", "2 fatias de p├úo integral", "Sal e pimenta a gosto", "Tomate em rodelas (acompanhamento)", "Ervas finas ou cebolinha (opcional)"], preparo: ["Quebre os ovos em uma tigela e bata levemente.", "Aque├ºa a manteiga em frigideira em fogo baixo.", "Despeje os ovos e mexa devagar com esp├ítula.", "Retire do fogo quando ainda estiverem cremosos (n├úo secar demais).", "Sirva com as fatias de p├úo e tomate ao lado."] } },
  ],
};

const mealBase: Record<string, PlanItemWithRecipe[]> = {
  cafe: [
    { id: "c1", titulo: "Iogurte com fruta e aveia", descricao: "F├ícil de montar, leve e pr├ítico para manh├ú corrida.", categoria: "Caf├® da manh├ú", receita: { ingredientes: ["1 pote de iogurte natural (170g)", "1 fruta picada (banana, morango ou ma├º├ú)", "2 colheres de sopa de aveia em flocos", "Canela a gosto", "1 colher de ch├í de mel (opcional)"], preparo: ["Coloque o iogurte em uma tigela.", "Adicione a fruta picada por cima.", "Salpique a aveia e a canela.", "Finalize com mel se desejar.", "Pronto em 2 minutos!"] } },
    { id: "c2", titulo: "Omelete simples + tomate", descricao: "Boa op├º├úo para mais saciedade e preparo r├ípido.", categoria: "Caf├® da manh├ú", receita: { ingredientes: ["2 ovos", "1 tomate pequeno fatiado", "1 colher de ch├í de azeite", "Sal e or├®gano a gosto", "Queijo branco a gosto (opcional)"], preparo: ["Bata os ovos com sal em uma tigela.", "Aque├ºa o azeite em frigideira antiaderente.", "Despeje os ovos e distribua tomate e queijo.", "Quando firmar, dobre ao meio.", "Sirva com o restante do tomate ao lado."] } },
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
  "Finisher SlimDay": ["Feche o treino com um bloco curto e mais intenso.", "Mantenha movimentos simples e respiração ativa.", "Termine sentindo esforço, mas sem perder a técnica."],
  // Novos exercícios - Iniciante
  "Elevação pélvica": ["Deite-se de costas com joelhos dobrados.", "Suba o quadril contraindo bem os glúteos.", "Desça devagar e repita."],
  "Prancha de joelhos": ["Apoie os antebraços e os joelhos no chão.", "Mantenha o corpo reto e abdômen firme.", "Segure o tempo indicado."],
  "Polichinelo adaptado": ["Abra uma perna para o lado enquanto sobe os braços.", "Feche e repita para o outro lado.", "Mantenha um ritmo constante sem impacto."],
  "4 apoios (Glúteos)": ["Fique na posição de 4 apoios.", "Suba uma perna dobrada em direção ao teto.", "Contraia o glúteo no topo e desça sem encostar o joelho."],
  "Mobilidade de escápulas": ["Fique em 4 apoios.", "Afunde o peito unindo as escápulas.", "Empurre o chão arredondando as costas."],
  // Novos exercícios - Intermediário
  "Mountain Climber": ["Na posição de prancha alta.", "Leve um joelho em direção ao peito rapidamente.", "Alterne as pernas como se estivesse correndo."],
  "Tríceps no banco": ["Apoie as mãos em um banco ou cadeira estável.", "Desça o corpo dobrando os cotovelos para trás.", "Suba empurrando com força."],
  "Stiff": ["Pés na largura do quadril, segurando peso (garrafa).", "Desça o tronco com as costas retas e joelhos quase esticados.", "Sinta alongar atrás da coxa e suba."],
  "Prancha Lateral": ["Deite-se de lado apoiando um antebraço.", "Suba o quadril mantendo o corpo reto.", "Segure sem deixar o quadril cair."],
  "Agachamento Sumô": ["Pés afastados além do quadril, pontas para fora.", "Desça mantendo as costas retas e joelhos para fora.", "Suba contraindo glúteos e coxas."],
  "Remada alta": ["Segure uma garrafa ou peso com as duas mãos.", "Puxe em direção ao queixo com os cotovelos para cima.", "Desça com controle."],
  // Novos exercícios - Avançado
  "Burpee completo": ["Agache, coloque as mãos no chão e pule para trás.", "Desça o peito no chão, suba, pule para frente.", "Finalize com um salto batendo as mãos acima da cabeça."],
  "Afundo Búlgaro": ["Um pé apoiado atrás em um banco ou cadeira.", "Desça a perna da frente até o joelho quase tocar o chão.", "Suba com força total no calcanhar da frente."],
  "V-ups": ["Deite-se de costas com pernas e braços esticados.", "Suba o tronco e as pernas ao mesmo tempo tentando tocar os pés.", "Desça devagar voltando à posição inicial."],
  "Agachamento com Salto Sumô": ["Faça o agachamento sumô e suba com um salto explosivo.", "Pouse suave e já inicie a próxima repetição.", "Mantenha o controle do movimento."],
  "Flexão de braços": ["Mãos no chão além dos ombros, pernas esticadas.", "Desça o peito até quase encostar no chão.", "Suba empurrando o chão com firmeza."],
  "Prancha sobe e desce": ["Inicie na prancha de antebraços.", "Suba para a prancha alta uma mão de cada vez.", "Desça novamente para os antebraços e repita."],
};

const exerciseMeta: Record<string, Partial<PlanItem>> = {
  "Finisher SlimDay": { dificuldade: "intenso", cuidado: "Feche forte, mas sem sacrificar a execu├º├úo.", explicacaoSimples: "├ë o bloco final para terminar com sensa├º├úo de miss├úo cumprida.", youtubeId: "TU8QYVW0gDU" },
  // Novos Iniciante
  "Eleva├º├úo p├®lvica": { dificuldade: "leve", cuidado: "N├úo force a lombar, suba usando os gl├║teos.", explicacaoSimples: "├ë levantar o quadril do ch├úo e apertar o bumbum.", youtubeId: "wPM8icD6st0" },
  "Prancha de joelhos": { dificuldade: "leve", cuidado: "Mantenha o pesco├ºo alinhado com a coluna.", explicacaoSimples: "├ë ficar paradinha apoiada nos bra├ºos e joelhos.", youtubeId: "6I2In2_S7m0" },
  "Polichinelo adaptado": { dificuldade: "leve", cuidado: "Se sentir dor no ombro, n├úo suba os bra├ºos at├® o topo.", explicacaoSimples: "├ë o polichinelo sem pulo, um passo de cada vez.", youtubeId: "lV5a4IueVjE" },
  "4 apoios (Gl├║teos)": { dificuldade: "leve", cuidado: "N├úo deixe a barriga cair, mantenha firme.", explicacaoSimples: "├ë chutar o teto estando de joelhos no ch├úo.", youtubeId: "vN_j_2a2S7o" },
  "Mobilidade de esc├ípulas": { dificuldade: "leve", cuidado: "Mova apenas os ombros, n├úo os bra├ºos.", explicacaoSimples: "├ë 'afundar' e 'empurrar' o peito para soltar os ombros.", youtubeId: "aclHkVaku9U" },
  // Novos Intermedi├írio
  "Mountain Climber": { dificuldade: "moderado", cuidado: "N├úo eleve muito o quadril, mantenha-o baixo.", explicacaoSimples: "├ë como se estivesse subindo uma montanha no ch├úo.", youtubeId: "nmwgirgXLYM" },
  "Tr├¡ceps no banco": { dificuldade: "moderado", cuidado: "Mantenha as costas pr├│ximas ao banco.", explicacaoSimples: "├ë descer e subir usando a for├ºa do 'tchau'.", youtubeId: "6kALZHewig4" },
  "Stiff": { dificuldade: "moderado", cuidado: "Mantenha a coluna reta o tempo todo.", explicacaoSimples: "├ë descer o corpo resto para alongar atr├ís das pernas.", youtubeId: "HML6f35U_f4" },
  "Prancha Lateral": { dificuldade: "moderado", cuidado: "N├úo deixe o quadril cair em dire├º├úo ao ch├úo.", explicacaoSimples: "├ë ficar de ladinho tirando o corpo do ch├úo.", youtubeId: "pSHjTRCQxIw" },
  "Agachamento Sum├┤": { dificuldade: "moderado", cuidado: "Mantenha os joelhos na dire├º├úo dos dedos dos p├®s.", explicacaoSimples: "├ë o agachamento com as pernas mais abertas.", youtubeId: "aclHkVaku9U" },
  "Remada alta": { dificuldade: "moderado", cuidado: "N├úo levante os ombros at├® as orelhas.", explicacaoSimples: "├ë puxar o peso at├® o queixo como um remador.", youtubeId: "S8_X9QpZp38" },
  // Novos Avan├ºado
  "Burpee completo": { dificuldade: "intenso", cuidado: "Cuidado no impacto do pulo ao voltar.", explicacaoSimples: "O exerc├¡cio mais completo: ch├úo, peito e salto.", youtubeId: "TU8QYVW0gDU" },
  "Afundo B├║lgaro": { dificuldade: "intenso", cuidado: "O tronco pode inclinar levemente para frente.", explicacaoSimples: "Afundo com um p├® elevado, o 'terror' das pernas.", youtubeId: "QOVaHwm-Q6U" },
  "V-ups": { dificuldade: "intenso", cuidado: "Tente subir o tronco e pernas juntos.", explicacaoSimples: "Um abdominal 'canivete' para fechar o corpo.", youtubeId: "pSHjTRCQxIw" },
  "Agachamento com Salto Sum├┤": { dificuldade: "intenso", cuidado: "Aterrisse suave com as pontas dos p├®s primeiro.", explicacaoSimples: "Agachamento aberto com salto para explos├úo.", youtubeId: "aclHkVaku9U" },
  "Flex├úo de bra├ºos": { dificuldade: "intenso", cuidado: "Mantenha o corpo como uma t├íbua, sem cair.", explicacaoSimples: "A cl├íssica flex├úo para bra├ºos e peito.", youtubeId: "i9sTjhN42zY" },
  "Prancha sobe e desce": { dificuldade: "intenso", cuidado: "Mantenha o quadril o mais parado poss├¡vel.", explicacaoSimples: "├ë revezar entre apoiar as m├úos e os cotovelos.", youtubeId: "pSHjTRCQxIw" },
};

function buildWorkoutPlan(profile: Profile): PlanItem[] {
  const minutes = Number(profile.tempo);
  const baseMinutes = Math.min(Math.max(minutes, 10), 20);
  
  const pools = {
    beginner: [
      ["Caminhada no lugar + mobilidade", "Ativa├º├úo leve para come├ºar sem press├úo."],
      ["Agachamento assistido", "Foco em pernas e const├óncia."],
      ["Bra├ºo com garrafa", "Movimento simples para parte superior."],
      ["Abdominal leve em p├®", "Menos impacto, mais adapta├º├úo."],
      ["Alongamento guiado", "Fechamento para recupera├º├úo."],
      ["Eleva├º├úo p├®lvica", "Fortalecimento de gl├║teos e lombar."],
      ["Prancha de joelhos", "Core est├ível com menos sobrecarga."],
      ["Polichinelo adaptado", "Cardio leve sem impacto."],
      ["4 apoios (Gl├║teos)", "Isolamento de gl├║teo e estabilidade."],
      ["Mobilidade de esc├ípulas", "Melhora postura e solta ombros."],
    ],
    intermediate: [
      ["Aquecimento din├ómico", "Corpo pronto para treinar com mais ritmo."],
      ["Agachamento + eleva├º├úo de joelho", "Mais ativa├º├úo e gasto energ├®tico."],
      ["Afundo alternado", "Fortalece pernas e gl├║teos."],
      ["Prancha curta", "Estabilidade e for├ºa de core."],
      ["Finaliza├º├úo metab├│lica", "Bloco curto e intenso dentro do seu limite."],
      ["Mountain Climber", "Foco em abd├┤men e queima cal├│rica."],
      ["Tr├¡ceps no banco", "Tonifica├º├úo da parte de tr├ís do bra├ºo."],
      ["Stiff", "Posterior de coxa e postura."],
      ["Prancha Lateral", "Fortalece a lateral do abd├┤men."],
      ["Agachamento Sum├┤", "Foco em parte interna da coxa."],
      ["Remada alta", "Ombros e postura em destaque."],
    ],
    advanced: [
      ["Aquecimento ativo", "Entrada r├ípida para treinar mais forte."],
      ["Agachamento com salto leve", "Mais intensidade quando j├í existe base."],
      ["Circuito de pernas e core", "Ritmo mais desafiador sem alongar demais o treino."],
      ["Prancha com varia├º├úo", "Maior exig├¬ncia muscular."],
      ["Finisher SlimDay", "Fechamento curto para sensa├º├úo de progresso."],
      ["Burpee completo", "Intensidade m├íxima e queima total."],
      ["Afundo B├║lgaro", "Exerc├¡cio potente para pernas e gl├║teos."],
      ["V-ups", "Abdominal avan├ºado para defini├º├úo."],
      ["Agachamento com Salto Sum├┤", "Explos├úo muscular e cardio."],
      ["Flex├úo de bra├ºos", "For├ºa de peito e bra├ºos."],
      ["Prancha sobe e desce", "Desafio extremo de core e ombros."],
    ],
  };

  const pool = profile.nivel === "iniciante" ? pools.beginner : profile.nivel === "intermediaria" ? pools.intermediate : pools.advanced;
  
  // Selecionar 5 exerc├¡cios do pool (embaralhando para diversidade)
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
      categoria: "Treino do dia",
      tutorial: tutorialMap[item[0]] ?? ["Mantenha postura confort├ível.", "Fa├ºa o movimento com controle.", "Reduza o ritmo se sentir necessidade."],
      dificuldade: meta?.dificuldade ?? "leve",
      cuidado: meta?.cuidado ?? "Respeite seus limites e mantenha boa postura.",
      explicacaoSimples: meta?.explicacaoSimples ?? "Movimento simples para ajudar no seu progresso.",
      youtubeId: meta?.youtubeId,
    };
  });
}

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
    emagrecer: ["Semana 1: adapta├º├úo e rotina", "Semana 2: mais consist├¬ncia", "Semana 3: progress├úo leve", "Semana 4: ritmo firme"],
    definir: ["Semana 1: base e ativa├º├úo", "Semana 2: for├ºa leve", "Semana 3: progress├úo muscular", "Semana 4: intensidade controlada"],
    "mais energia": ["Semana 1: ativa├º├úo di├íria", "Semana 2: ganho de disposi├º├úo", "Semana 3: ritmo est├ível", "Semana 4: sensa├º├úo de leveza"],
    "criar constancia": ["Semana 1: come├ºar f├ícil", "Semana 2: manter h├íbito", "Semana 3: refor├ºar rotina", "Semana 4: consolidar const├óncia"],
  };
  return map[profile.objetivo];
}

function buildWeekSchedule(profile: Profile): DayPlan[] {
  const mins = Math.min(Math.max(Number(profile.tempo), 10), 20);
  const focusMap: Record<Goal, string[]> = {
    emagrecer: ["Ativa├º├úo", "Pernas", "Core", "Metab├│lico", "Mobilidade", "Circuito leve", "Recupera├º├úo"],
    definir: ["For├ºa leve", "Gl├║teos", "Bra├ºos", "Core", "Pernas", "Resist├¬ncia", "Alongamento"],
    "mais energia": ["Despertar corpo", "Movimento", "Postura", "Ritmo", "Ativa├º├úo", "Respira├º├úo", "Leveza"],
    "criar constancia": ["Come├ºar f├ícil", "Repetir h├íbito", "Corpo todo", "Manter ritmo", "Postura", "Leve circuito", "Descanso ativo"],
  };
  const foodMap: Record<RoutineStyle, string[]> = {
    corrida: ["Marmita simples", "Lanche r├ípido", "Caf├® pr├ítico", "Jantar leve", "Snack f├ícil", "Prato pronto caseiro", "Refei├º├úo leve"],
    moderada: ["Prato equilibrado", "Lanche de fruta", "Almo├ºo simples", "Jantar r├ípido", "Caf├® refor├ºado", "Omelete pr├ítica", "Sopa leve"],
    flexivel: ["Receita caseira", "Wrap leve", "Salada completa", "Lanche de iogurte", "Almo├ºo balanceado", "Jantar funcional", "Refei├º├úo livre controlada"],
  };
  const days = ["Seg", "Ter", "Qua", "Qui", "Sex", "S├íb", "Dom"];
  return days.map((day, index) => ({
    day,
    foco: focusMap[profile.objetivo][index],
    treino: `${mins} min de ${focusMap[profile.objetivo][index].toLowerCase()}`,
    refeicao: foodMap[profile.rotina][index],
    minutos: mins,
  }));
}

function getCongratsMessage(count: number) {
  if (count < 3) return "Boa! Cada etapa conclu├¡da fortalece sua nova rotina.";
  if (count < 6) return "Voc├¬ est├í indo muito bem. O importante ├® manter o ritmo.";
  if (count < 10) return "Parab├®ns! Sua const├óncia j├í est├í fazendo diferen├ºa.";
  return "Incr├¡vel! Voc├¬ est├í construindo uma rotina de verdade.";
}

function getProfileSummary(profile: Profile) {
  if (profile.rotina === "corrida") return "Seu plano est├í mais enxuto, direto e pensado para dias apertados.";
  if (profile.rotina === "flexivel") return "Seu plano aproveita melhor a flexibilidade para variar sem perder foco.";
  return "Seu plano equilibra praticidade com progress├úo para manter const├óncia.";
}

function getDayBasedMessage(date: Date) {
  return dailyMessages[date.getDay()];
}

function getReengagementMessage(inactiveDays: number) {
  if (inactiveDays <= 0) return "Voc├¬ est├í acompanhando bem. Continue voltando para manter seu ritmo forte.";
  if (inactiveDays === 1) return "Voc├¬ ficou 1 dia sem concluir etapas. Voltar hoje ajuda a manter o embalo do seu progresso.";
  if (inactiveDays <= 3) return `Voc├¬ ficou ${inactiveDays} dias sem concluir etapas. Retomar agora pode evitar que sua rotina perca for├ºa.`;
  return `Voc├¬ ficou ${inactiveDays} dias sem concluir etapas. Voltar hoje ├® a melhor forma de recuperar consist├¬ncia sem press├úo.`;
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

// ÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇ
// Onboarding Quiz for new users
// ÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇ
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
    <div className="px-3 py-6 md:p-8">
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
                      { icon: <Dumbbell />, title: "Treinos Inteligentes", desc: "10 a 20 min que realmente funcionam.", color: "bg-emerald-50 text-emerald-600" },
                      { icon: <Utensils />, title: "Menu Pr├ítico", desc: "Receitas que cabem na sua rotina real.", color: "bg-rose-50 text-rose-600" },
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
                  <Button className="w-full h-16 rounded-2xl text-lg font-bold bg-secondary hover:bg-black group transition-all" onClick={next}>
                    Come├ºar minha jornada <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
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
                    <p className="text-slate-500 font-light">Sua experi├¬ncia ser├í ├║nica e personalizada.</p>
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
                    <Button className="flex-1 h-16 rounded-2xl bg-secondary hover:bg-black font-bold" onClick={next} disabled={!profile.nome.trim()}>
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
                    <p className="text-slate-500 font-light text-sm">Dados essenciais para o seu calend├írio hormonal.</p>
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
                      <Label className="text-xs uppercase tracking-widest font-bold text-slate-400 ml-1">├Ültima Menstrua├º├úo</Label>
                      <Input type="date" value={profile.ultimoCiclo || ""} onChange={(e) => onUpdateProfile("ultimoCiclo", e.target.value)} className="h-14 rounded-2xl border-slate-100 bg-slate-50/50" />
                    </div>
                  </div>
                  <div className="flex gap-4 pt-4">
                    <Button variant="ghost" className="h-14 px-6 rounded-2xl text-slate-400" onClick={back}>Voltar</Button>
                    <Button className="flex-1 h-14 rounded-2xl bg-secondary hover:bg-black font-bold" onClick={next} disabled={!profile.idade || !profile.peso || !profile.ultimoCiclo}>
                      Continuar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {step === "objetivo" && (
              <Card className="rounded-[28px] border-emerald-100 shadow-xl">
                <CardContent className="p-6 md:p-8 space-y-5">
                  <div className="text-center">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600"><Target className="h-6 w-6" /></div>
                    <h2 className="text-2xl font-black text-slate-900">Qual seu objetivo principal?</h2>
                    <p className="mt-2 text-sm text-slate-600">Escolha o que mais combina com o seu momento.</p>
                  </div>
                  <div className="grid gap-3">
                    {([["emagrecer", "­ƒöÑ Emagrecer", "Perder peso de forma saud├ível e sustent├ível."], ["definir", "­ƒÆ¬ Definir", "Tonificar e ganhar mais defini├º├úo muscular."], ["mais energia", "ÔÜí Mais energia", "Ter mais disposi├º├úo e ├ónimo no dia a dia."], ["criar constancia", "­ƒÄ» Criar const├óncia", "Montar uma rotina e manter o h├íbito."]] as [Goal, string, string][]).map(([value, label, desc]) => (
                      <button
                        key={value}
                        onClick={() => { onUpdateProfile("objetivo", value); next(); }}
                        className={`flex items-center gap-3 rounded-2xl border-2 p-4 text-left transition-all ${profile.objetivo === value ? "border-emerald-500 bg-emerald-50" : "border-slate-200 bg-white hover:border-emerald-200 hover:bg-emerald-50/50"}`}
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
                    <h2 className="text-2xl font-black text-slate-900">Qual seu n├¡vel atual?</h2>
                    <p className="mt-2 text-sm text-slate-600">Tudo bem se estiver come├ºando. O plano se adapta.</p>
                  </div>
                  <div className="grid gap-3">
                    {([["iniciante", "­ƒî▒ Iniciante", "Nunca treinei ou treino pouco."], ["intermediaria", "­ƒî┐ Intermedi├íria", "Tenho alguma experi├¬ncia e const├óncia."], ["avancada", "­ƒî│ Avan├ºada", "Treino regularmente e quero mais desafio."]] as [FitnessLevel, string, string][]).map(([value, label, desc]) => (
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
                    {([["10", "10 min", "Super r├ípido"], ["15", "15 min", "Equil├¡brio ideal"], ["20", "20 min", "Mais completo"], ["30", "30 min", "Para quem pode mais"]] as [TimePerDay, string, string][]).map(([value, label, desc]) => (
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
                    <h2 className="text-2xl font-black text-slate-900">Como ├® sua rotina?</h2>
                    <p className="mt-2 text-sm text-slate-600">O app se adapta ao ritmo do seu dia.</p>
                  </div>
                  <div className="grid gap-3">
                    {([["corrida", "ÔÜí Muito corrida", "Tenho pouco tempo para tudo."], ["moderada", "ÔÅ│ Moderada", "Consigo encaixar coisas com planejamento."], ["flexivel", "­ƒîè Mais flex├¡vel", "Tenho flexibilidade para organizar o dia."]] as [RoutineStyle, string, string][]).map(([value, label, desc]) => (
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
                    <p className="mt-2 text-sm text-slate-600">As receitas e refei├º├Áes v├úo combinar com sua escolha.</p>
                  </div>
                  <div className="grid gap-3">
                    {([["pratico", "­ƒÜÇ Pr├ítico", "Receitas r├ípidas e sem complica├º├úo."], ["equilibrado", "ÔÜû´©Å Equilibrado", "Variado e balanceado."], ["sem tempo", "ÔÅ░ Sem tempo", "O mais r├ípido poss├¡vel."], ["caseiro", "­ƒÅí Mais caseiro", "Gosto de cozinhar em casa."]] as [MealStyle, string, string][]).map(([value, label, desc]) => (
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
              <Card className="rounded-[28px] border-emerald-100 shadow-xl overflow-hidden">
                <div className="bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 p-8 text-white text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-white/20 backdrop-blur-sm">
                    <BadgeCheck className="h-8 w-8 text-white" />
                  </div>
                  <h2 className="text-3xl font-black">Tudo pronto, {profile.nome}! ­ƒÄë</h2>
                  <p className="mt-3 text-sm leading-6 opacity-90">Seu plano personalizado foi montado com base nas suas respostas.</p>
                </div>
                <CardContent className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-emerald-50 p-4 text-center">
                      <div className="text-xs font-semibold text-emerald-700 uppercase">Objetivo</div>
                      <div className="mt-1 font-bold text-slate-900 capitalize">{profile.objetivo}</div>
                    </div>
                    <div className="rounded-2xl bg-sky-50 p-4 text-center">
                      <div className="text-xs font-semibold text-sky-700 uppercase">N├¡vel</div>
                      <div className="mt-1 font-bold text-slate-900 capitalize">{profile.nivel}</div>
                    </div>
                    <div className="rounded-2xl bg-amber-50 p-4 text-center">
                      <div className="text-xs font-semibold text-amber-700 uppercase">Treino</div>
                      <div className="mt-1 font-bold text-slate-900">{profile.tempo} min/dia</div>
                    </div>
                    <div className="rounded-2xl bg-orange-50 p-4 text-center">
                      <div className="text-xs font-semibold text-orange-700 uppercase">Alimenta├º├úo</div>
                      <div className="mt-1 font-bold text-slate-900 capitalize">{profile.refeicao}</div>
                    </div>
                  </div>
                  <div className="rounded-2xl bg-rose-50 border border-rose-200 p-4 text-center">
                    <div className="text-sm font-bold text-rose-700">­ƒÄü Seu Calend├írio de Ciclo+ est├í pronto!</div>
                    <div className="text-xs text-slate-600 mt-1">Estimamos suas fases com base nas suas respostas.</div>
                  </div>
                  <Button className="w-full rounded-2xl h-12 text-base font-bold bg-emerald-600 hover:bg-emerald-700" onClick={next}>
                    Ver meu calend├írio <ChevronRight className="ml-2 h-5 w-5" />
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
                  <h2 className="text-3xl font-black">Oferta Especial de Boas-Vindas! Ô£¿</h2>
                  <p className="mt-3 text-sm leading-6 opacity-90">Desbloqueie o acesso <strong className="font-black">VITAL├ìCIO</strong> ao seu Calend├írio Menstrual Ciclo+ agora.</p>
                </div>
                <CardContent className="p-6 space-y-5 text-center">
                  <div className="rounded-2xl bg-rose-50 border border-rose-100 p-5">
                    <div className="text-base font-semibold text-slate-800">Apenas hoje, por apenas:</div>
                    <div className="mt-2 text-5xl font-black text-rose-600">R$ 29,90</div>
                    <div className="mt-2 text-xs text-slate-500 line-through">Pre├ºo normal: R$ 89,90</div>
                    <ul className="mt-4 text-left text-sm text-slate-700 space-y-2">
                      <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-rose-500" /> Fases menstruais visuais</li>
                      <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-rose-500" /> Previs├úo de TPM e janela f├®rtil</li>
                      <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-rose-500" /> Docinhos fit f├íceis para aliviar a TPM</li>
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
  mode, setMode, nome, setNome, email, setEmail, senha, setSenha, onSubmit, loading, error, success,
}: {
  mode: "login" | "register";
  setMode: (value: "login" | "register") => void;
  nome: string;
  setNome: (value: string) => void;
  email: string;
  setEmail: (value: string) => void;
  senha: string;
  setSenha: (value: string) => void;
  onSubmit: () => void;
  loading: boolean;
  error: string;
  success: string;
}) {
  return (
    <div className="min-h-screen bg-background px-4 py-12 md:py-24 overflow-hidden relative">
      {/* Decorative blobs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[150px] rounded-full -mr-64 -mt-64" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent/5 blur-[150px] rounded-full -ml-64 -mb-64" />

      <div className="mx-auto max-w-5xl grid lg:grid-cols-[1.1fr,0.9fr] gap-12 items-center relative z-10">
        <div className="space-y-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-bold uppercase tracking-widest">
              <Sparkles className="h-4 w-4" /> Boutique de Sa├║de
            </div>
            <h1 className="text-5xl md:text-7xl font-serif leading-[1.1]">Evolua no <span className="text-primary italic">seu tempo.</span></h1>
            <p className="text-lg text-slate-500 font-light max-w-md leading-relaxed">
              O ecossistema definitivo para mulheres que buscam equil├¡brio entre rotina corrida e bem-estar real.
            </p>
          </div>

          <div className="grid gap-4">
            {[
              { icon: <Lock className="h-5 w-5" />, title: "Seus dados seguros", desc: "Privacidade absoluta no seu acompanhamento." },
              { icon: <RefreshCcw className="h-5 w-5" />, title: "Sincroniza├º├úo Nuvem", desc: "Acesse de qualquer lugar, sempre de onde parou." },
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

        <Card className="rounded-[48px] border-none shadow-premium p-10 bg-white">
          <CardHeader className="p-0 mb-8 space-y-2">
            <CardTitle className="text-3xl font-serif">{mode === "login" ? "Entrar" : "Criar Conta"}</CardTitle>
            <CardDescription className="font-light">
              {mode === "login" ? "Bem-vinda de volta ao seu espa├ºo." : "Comece hoje sua nova fase."}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 space-y-6">
            {error && (
              <div className="p-4 rounded-2xl bg-rose-50 text-rose-700 text-sm border border-rose-100 animate-in fade-in slide-in-from-top-2">
                {error}
              </div>
            )}
            {success && (
              <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-700 text-sm border border-emerald-100">
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
                  <Input type="password" className="h-14 pl-12 rounded-2xl border-slate-100 bg-slate-50/50" value={senha} onChange={(e) => setSenha(e.target.value)} placeholder="ÔÇóÔÇóÔÇóÔÇóÔÇóÔÇóÔÇóÔÇó" />
                </div>
              </div>
            </div>

            <Button className="w-full h-16 rounded-2xl bg-secondary hover:bg-black font-bold text-lg shadow-xl shadow-black/5" onClick={onSubmit} disabled={loading}>
              {loading ? "Processando..." : mode === "login" ? "Acessar Painel" : "Criar Meu Plano"}
            </Button>

            <button className="w-full text-sm font-semibold text-slate-400 hover:text-primary transition-colors py-2" onClick={() => setMode(mode === "login" ? "register" : "login")}>
              {mode === "login" ? "Ainda n├úo tem conta? Clique aqui" : "J├í possui uma conta? Fa├ºa login"}
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


// Link externo para compra do App Principal
const APP_SALES_LINK = "https://pay.kirvano.com/e4ad9a8c-bee4-4279-be20-8f39c46c17df";
const BYPASS_PAYMENT = false; // DESATIVADO: Agora o acesso real do Supabase ├® o que vale


export default function SlimDayApp() {
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState("");
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [authNome, setAuthNome] = useState("");
  const [authEmail, setAuthEmail] = useState("");
  const [authSenha, setAuthSenha] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authSuccess, setAuthSuccess] = useState("");
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("idle");
  const [authReady, setAuthReady] = useState(false);

  const [profile, setProfile] = useState<Profile>(defaultProfile);
  const [started, setStarted] = useState(false);
  const [completed, setCompleted] = useState<Record<string, boolean>>({});
  const [showCongrats, setShowCongrats] = useState(false);
  const [lastCompletedTitle, setLastCompletedTitle] = useState("");
  const [activeTab, setActiveTab] = useState("hoje");
  const [savedToast, setSavedToast] = useState(false);
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
  const [onboardingDismissed, setOnboardingDismissed] = useState(false);

  const syncTimeoutRef = useRef<number | null>(null);
  const profileLoadedRef = useRef(false);

  const workoutPlan = useMemo(() => buildWorkoutPlan(profile), [profile]);
  const mealPlan = useMemo(() => buildMealPlan(profile), [profile]);
  const weekFocus = useMemo(() => buildWeekFocus(profile), [profile]);
  const weekSchedule = useMemo(() => buildWeekSchedule(profile), [profile]);
  const recipeSuggestions = useMemo(() => recipeBank[profile.refeicao], [profile.refeicao]);
  const cycleCalendar = useMemo(() => buildCycleCalendar(profile, currentDate), [profile, currentDate]);

  const checklistItems = useMemo(
    () => [
      ...workoutPlan.map((w) => ({ id: w.id, titulo: w.titulo, tipo: "treino" })),
      ...mealPlan.map((m) => ({ id: m.id, titulo: m.titulo, tipo: "alimenta├º├úo" })),
      { id: "agua", titulo: "Beber ├ígua ao longo do dia", tipo: "h├íbito" },
      { id: "sono", titulo: "Dormir melhor hoje", tipo: "h├íbito" },
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
  const currentCycleDay = cycleCalendar.find((day) => day.dateKey === todayKey) ?? cycleCalendar[0] ?? null;
  const cycleTreats = useMemo(() => {
    const phase = currentCycleDay?.phase ?? "neutro";
    const baseTreats = phaseTreats[phase] ?? phaseTreats.neutro;
    if (profile.objetivo === "emagrecer") {
      return baseTreats.map((item) => ({ ...item, descricao: `${item.descricao} Prefira por├º├úo pequena e encaixe no lanche do seu plano.` }));
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
          buildNotification("Etapa conclu├¡da", `Voc├¬ concluiu: ${title}`, "conquista"),
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
      buildNotification("Novo come├ºo", "Seu dia foi reiniciado. Recome├ºar tamb├®m faz parte do processo.", "motivacao"),
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

  // Verifica no servidor (Supabase) se h├í uma compra confirmada antes de liberar o acesso
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
      if (error) throw error;
      if (data) {
        setCycleUnlocked(true);
        setNotifications((prev) => [
          buildNotification("Calend├írio premium ativo", "Seu Calend├írio de Ciclo+ est├í ativo. Aproveite!", "conquista"),
          ...prev,
        ].slice(0, 8));
      } else {
        // Compra ainda n├úo confirmada pelo servidor ÔÇö redireciona para a p├ígina de compra
        setCycleUnlocked(false);
      }
    } catch {
      // Silently handle ÔÇö o estado permanece n├úo desbloqueado por seguran├ºa
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

        // Se a conta for criada mas n├úo logar autom├ítico (confirma├º├úo de email ligada)
        if (data.user && !data.session) {
          setAuthSuccess("Quase l├í! Acesse seu e-mail para confirmar a conta (verifique no Lixo Eletr├┤nico/Spam se n├úo encontrar na caixa de entrada).");
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

      // Mark profile as loaded (whether data found or not ÔÇö enables quiz for new users)
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
      <div className="min-h-screen grid place-items-center bg-[linear-gradient(180deg,#f3fff8_0%,#fffaf7_45%,#ffffff_100%)] p-6">
        <Card className="w-full max-w-md rounded-[28px] border-emerald-100 shadow-xl">
          <CardContent className="flex flex-col items-center gap-4 p-8">
            <div className="rounded-3xl bg-emerald-100 p-4 text-emerald-600"><Cloud className="h-8 w-8" /></div>
            <div className="text-xl font-bold text-slate-900">Carregando SlimDay</div>
            <div className="text-sm text-slate-600">Preparando sua ├írea e verificando dados salvos.</div>
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
      />
    );
  }

  if (profileLoaded && !appUnlocked) {
    return (
      <div className="min-h-screen bg-[linear-gradient(180deg,#f3fff8_0%,#fffaf7_45%,#ffffff_100%)] px-4 flex items-center justify-center p-4">
        <Card className="max-w-md w-full rounded-[32px] border-emerald-100 shadow-2xl p-8 text-center bg-white relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 to-emerald-600"></div>
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50">
            <Lock className="h-10 w-10 text-emerald-600" />
          </div>
          <h2 className="text-3xl font-black text-slate-900">Aplicativo Bloqueado</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Sua conta SlimDay est├í confirmada, mas ainda n├úo identificamos a libera├º├úo do seu acesso.
          </p>

          <a href={APP_SALES_LINK} target="_blank" rel="noopener noreferrer" className="mt-6 block">
            <Button className="w-full rounded-2xl h-14 text-lg font-bold bg-emerald-600 hover:bg-emerald-700 shadow-xl shadow-emerald-200">
              <ShoppingCart className="mr-2 h-5 w-5" /> Adquirir o SlimDay
            </Button>
          </a>

          <button
            onClick={verifyAndRefreshAppPurchase}
            disabled={appVerifyLoading}
            className="mt-4 flex w-full items-center justify-center h-12 rounded-2xl border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
          >
            {appVerifyLoading ? "Verificando..." : <><BadgeCheck className="mr-2 h-5 w-5" /> J├í comprei ÔÇö verificar acesso</>}
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
      {/* Modal ├Ültima Chance */}
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
                  <h2 className="text-2xl font-black">├Ültima chance! ÔÅ░</h2>
                  <p className="mt-2 text-sm opacity-90">Seu per├¡odo de teste acabou, mas voc├¬ ainda pode manter o acesso premium com desconto exclusivo.</p>
                </div>
                <CardContent className="p-6 space-y-4 text-center">
                  <div className="text-5xl font-black text-rose-600">R$ 29,90</div>
                  <div className="text-xs text-slate-500 line-through">Pre├ºo normal: R$ 89,90</div>

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

      {/* Onboarding quiz overlay ÔÇö never replaces the main app */}
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
                ├ù
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

      <div className="min-h-screen overflow-x-hidden bg-[linear-gradient(180deg,#f3fff8_0%,#fffaf7_42%,#ffffff_100%)] text-slate-900">
        <AnimatePresence>
          {showCongrats && (
            <motion.div initial={{ opacity: 0, y: 30, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.98 }}
              className="fixed right-4 top-4 z-50 max-w-sm rounded-3xl border border-emerald-200 bg-white p-4 shadow-2xl">
              <div className="flex items-start gap-3">
                <div className="rounded-2xl bg-emerald-100 p-2 text-emerald-600"><Trophy className="h-5 w-5" /></div>
                <div>
                  <div className="font-bold text-slate-900">Parab├®ns!</div>
                  <div className="text-sm text-slate-600">Voc├¬ concluiu: {lastCompletedTitle}</div>
                  <div className="mt-1 text-sm font-medium text-emerald-600">{getCongratsMessage(completedCount + 1)}</div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {savedToast && (
            <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="fixed left-1/2 top-4 z-50 -translate-x-1/2 rounded-full border border-emerald-200 bg-white px-4 py-2 text-sm font-semibold text-emerald-700 shadow-lg">
              Plano atualizado com sucesso Ô£¿
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mx-auto max-w-7xl px-4 py-8 md:py-12">
          {/* Dashboard Header Section */}
          <div className="mb-10 grid gap-6 lg:grid-cols-[1.4fr,0.6fr]">
            {/* Mensagem do Dia - Premium Card */}
            <Card className="rounded-[40px] border-none shadow-premium overflow-hidden bg-white group">
              <CardContent className="p-0 flex flex-col md:flex-row h-full">
                <div className="w-full md:w-1/3 bg-slate-900 p-8 flex flex-col justify-between text-white relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.2),transparent)]" />
                  <div className="relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[10px] uppercase tracking-widest font-bold">
                      <Sparkles className="h-3 w-3" /> Foco de Hoje
                    </div>
                    <div className="mt-6 text-4xl font-serif italic">{dayMessage.title}</div>
                  </div>
                  <div className="mt-8 relative z-10">
                    <p className="text-slate-400 text-xs uppercase tracking-widest font-bold mb-2">Const├óncia</p>
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
                        {syncStatus === "synced" ? <Cloud className="h-5 w-5 text-emerald-500" /> : <RefreshCcw className="h-5 w-5 text-slate-300 animate-spin" />}
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
            <Card className="rounded-[40px] border-none shadow-premium bg-white p-8 group hover:bg-primary transition-all duration-500">
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
                    Voc├¬ concluiu <span className="font-bold group-hover:text-white">{completedCount}</span> de {totalCount} atividades planejadas para hoje.
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
              Ol├í, <span className="text-primary italic">{profile.nome || "querida"}</span>. <br />
              <span className="text-slate-400">Aqui est├í o seu plano para hoje.</span>
            </h1>
          </div>

          <div className="grid gap-4 md:gap-6 lg:grid-cols-[340px,1fr]">
            <div className="space-y-4 md:space-y-6">
              <Card className="rounded-[28px] border-emerald-100 shadow-lg">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-emerald-100 p-2 text-emerald-600"><Sparkles className="h-5 w-5" /></div>
                    <div>
                      <CardTitle className="text-2xl">Seu painel</CardTitle>
                      <CardDescription>Resumo inteligente do seu plano atual.</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-3xl bg-[linear-gradient(135deg,#10b981_0%,#1f7a4d_100%)] p-5 text-white">
                    <div className="text-sm font-semibold opacity-90">Plano do seu momento</div>
                    <div className="mt-2 text-3xl font-black leading-none">{dailyMinutes} min</div>
                    <div className="mt-2 text-sm opacity-90">Treino-base do app para caber no seu dia e evoluir com voc├¬.</div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl border bg-white p-4">
                      <div className="text-xs font-semibold text-slate-500">Objetivo</div>
                      <div className="mt-1 font-bold capitalize">{profile.objetivo.replace("mais energia", "Mais energia")}</div>
                    </div>
                    <div className="rounded-2xl border bg-white p-4">
                      <div className="text-xs font-semibold text-slate-500">N├¡vel</div>
                      <div className="mt-1 font-bold capitalize">{profile.nivel}</div>
                    </div>
                  </div>
                  <div className="rounded-2xl border bg-white p-4">
                    <div className="text-xs font-semibold text-slate-500">Resumo do perfil</div>
                    <div className="mt-2 text-sm leading-6 text-slate-700">{getProfileSummary(profile)}</div>
                  </div>
                  {bmi && (
                    <div className="rounded-2xl border bg-emerald-50 p-4 text-sm text-slate-700">
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
                    <CardDescription>Altere os campos e o app reorganiza treino, refei├º├Áes e foco semanal.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4">
                      <div>
                        <Label>Seu nome</Label>
                        <Input value={profile.nome} onChange={(e) => updateProfile("nome", e.target.value)} placeholder="Digite seu nome" />
                      </div>
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
                            <SelectItem value="criar constancia">Criar const├óncia</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label>N├¡vel atual</Label>
                          <Select value={profile.nivel} onValueChange={(v: FitnessLevel) => updateProfile("nivel", v)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="iniciante">Iniciante</SelectItem>
                              <SelectItem value="intermediaria">Intermedi├íria</SelectItem>
                              <SelectItem value="avancada">Avan├ºada</SelectItem>
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
                          <Label>Como ├® sua rotina?</Label>
                          <Select value={profile.rotina} onValueChange={(v: RoutineStyle) => updateProfile("rotina", v)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="corrida">Muito corrida</SelectItem>
                              <SelectItem value="moderada">Moderada</SelectItem>
                              <SelectItem value="flexivel">Mais flex├¡vel</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Estilo alimentar</Label>
                          <Select value={profile.refeicao} onValueChange={(v: MealStyle) => updateProfile("refeicao", v)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pratico">Pr├ítico</SelectItem>
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
              ) : (
                <Card className="rounded-[28px] border-orange-100 shadow-lg">
                  <CardContent className="p-4 md:p-6">
                    <div className="flex items-center gap-3">
                      <div className="rounded-2xl bg-orange-100 p-2 text-orange-600"><BadgeCheck className="h-5 w-5" /></div>
                      <div>
                        <div className="font-bold text-slate-900">Plano atualizado Ô£ô</div>
                        <div className="text-sm text-slate-600">Seu plano j├í foi ajustado. Dispon├¡vel para nova edi├º├úo em breve.</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="space-y-4 md:space-y-6 min-w-0">
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {[
                  { icon: <CalendarDays />, label: "Ciclo Pessoal", value: "Calend├írio", color: "text-rose-500", bg: "bg-rose-50" },
                  { icon: <Dumbbell />, label: "At├® 20 min", value: "Treino Base", color: "text-emerald-500", bg: "bg-emerald-50" },
                  { icon: <Utensils />, label: "Saud├ível e R├ípido", value: "Refei├º├Áes", color: "text-orange-500", bg: "bg-orange-50" },
                  { icon: <Target />, label: profile.objetivo, value: "Objetivo", color: "text-violet-500", bg: "bg-violet-50" },
                ].map((item, i) => (
                  <Card key={i} className="rounded-[32px] border-none shadow-sm hover:shadow-md transition-all p-6 bg-white flex flex-col items-center text-center space-y-3">
                    <div className={`h-12 w-12 rounded-2xl ${item.bg} ${item.color} flex items-center justify-center`}>
                      {React.cloneElement(item.icon as React.ReactElement, { className: "h-6 w-6" })}
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400">{item.label}</p>
                      <p className="text-sm font-bold text-slate-900 mt-1 capitalize">{item.value}</p>
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
                        <CardDescription>Altere os campos abaixo para reorganizar treino, refei├º├Áes e foco semanal.</CardDescription>
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
                                <SelectItem value="criar constancia">Criar const├óncia</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label>N├¡vel atual</Label>
                              <Select value={profile.nivel} onValueChange={(v: FitnessLevel) => updateProfile("nivel", v)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="iniciante">Iniciante</SelectItem>
                                  <SelectItem value="intermediaria">Intermedi├íria</SelectItem>
                                  <SelectItem value="avancada">Avan├ºada</SelectItem>
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
                              <Label>Como ├® sua rotina?</Label>
                              <Select value={profile.rotina} onValueChange={(v: RoutineStyle) => updateProfile("rotina", v)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="corrida">Muito corrida</SelectItem>
                                  <SelectItem value="moderada">Moderada</SelectItem>
                                  <SelectItem value="flexivel">Mais flex├¡vel</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label>Estilo alimentar</Label>
                              <Select value={profile.refeicao} onValueChange={(v: MealStyle) => updateProfile("refeicao", v)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pratico">Pr├ítico</SelectItem>
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
                    <Card className="rounded-[40px] border-none shadow-premium bg-emerald-50/50 p-8">
                      <div className="flex flex-col h-full justify-between">
                        <div>
                          <div className="h-12 w-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 mb-6">
                            <Dumbbell className="h-6 w-6" />
                          </div>
                          <h3 className="text-2xl font-serif italic mb-2">Seu Treino</h3>
                          <p className="text-slate-500 font-light text-sm leading-relaxed">
                            Apenas {dailyMinutes} minutos focados em evolu├º├úo progressiva e queima eficiente.
                          </p>
                        </div>
                        <Button className="mt-8 h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-700 font-bold" onClick={() => setActiveTab("treino")}>
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
                          <h3 className="text-2xl font-serif italic mb-2">Sua Nutri├º├úo</h3>
                          <p className="text-slate-500 font-light text-sm leading-relaxed">
                            4 sugest├Áes pr├íticas baseadas no seu estilo <span className="font-bold capitalize">{profile.refeicao}</span>.
                          </p>
                        </div>
                        <Button variant="outline" className="mt-8 h-14 rounded-2xl border-orange-200 text-orange-700 hover:bg-orange-50 font-bold" onClick={() => setActiveTab("alimentacao")}>
                          Ver Card├ípio <ChevronRight className="ml-2 h-5 w-5" />
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
                      <CardDescription>Um plano simples para manter rotina com treino e alimenta├º├úo alinhados.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {weekSchedule.map((item) => (
                        <div key={item.day} className="grid gap-3 rounded-3xl border bg-white p-5 md:grid-cols-[90px,1fr,1fr,120px] md:items-center">
                          <div className="font-black text-slate-900">{item.day}</div>
                          <div><div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Foco</div><div className="font-semibold text-slate-800">{item.foco}</div></div>
                          <div><div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Refei├º├úo-chave</div><div className="font-semibold text-slate-800">{item.refeicao}</div></div>
                          <div className="rounded-2xl bg-emerald-50 px-3 py-2 text-center font-bold text-emerald-700">{item.minutos} min</div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="treino" className="mt-0 animate-in fade-in duration-500">
                  <div className="grid gap-6">
                    {workoutPlan.map((item, index) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="group bg-white rounded-[40px] border-none shadow-premium overflow-hidden"
                      >
                        <div className="flex flex-col md:flex-row">
                          <div className="w-full md:w-2/5 p-8 bg-slate-50 relative">
                            <div className="inline-flex gap-2 mb-6">
                              <Badge className="rounded-full bg-primary/10 text-primary border-none text-[10px] font-bold uppercase">{item.nivel}</Badge>
                              <Badge className="rounded-full bg-slate-200 text-slate-500 border-none text-[10px] font-bold uppercase">{item.minutos} min</Badge>
                            </div>
                            <h4 className="text-3xl font-serif italic mb-4 leading-tight">{item.titulo}</h4>
                            <p className="text-slate-500 text-sm font-light leading-relaxed mb-8">{item.descricao}</p>
                            
                            <Button
                              variant={completed[item.id] ? "ghost" : "default"}
                              className={`w-full h-14 rounded-2xl font-bold ${completed[item.id] ? "text-emerald-500" : "bg-secondary hover:bg-black"}`}
                              onClick={() => toggleCheck(item.id, item.titulo)}
                            >
                              {completed[item.id] ? <><CheckCircle2 className="mr-2 h-5 w-5" /> Conclu├¡do</> : "Marcar como Feito"}
                            </Button>
                          </div>
                          
                          <div className="flex-1 p-8 md:p-10 space-y-8 bg-white">
                            {item.youtubeId && (
                              <div className="aspect-video rounded-[32px] overflow-hidden shadow-2xl border-4 border-white">
                                <iframe
                                  width="100%"
                                  height="100%"
                                  src={`https://www.youtube.com/embed/${item.youtubeId}`}
                                  title={item.titulo}
                                  frameBorder="0"
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                  allowFullScreen
                                />
                              </div>
                            )}
                            
                            <div className="grid md:grid-cols-2 gap-8">
                              <div className="space-y-4">
                                <p className="text-[10px] uppercase font-bold tracking-[3px] text-slate-300">Como Praticar</p>
                                <div className="space-y-3">
                                  {item.tutorial?.map((step, i) => (
                                    <div key={i} className="flex gap-4 text-sm font-light text-slate-500">
                                      <span className="text-primary font-serif italic font-bold">{i + 1}.</span>
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
                                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100">
                                  <p className="text-[10px] uppercase font-bold tracking-[3px] text-rose-400 mb-2">Aten├º├úo</p>
                                  <p className="text-xs text-rose-700 leading-relaxed">{item.cuidado}</p>
                                </div>
                              </div>
                            </div>
                          </div>
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
                            <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${completed[item.id] ? "bg-emerald-50 text-emerald-500" : "bg-slate-50 text-slate-300"}`}>
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
                          className={`w-full h-14 rounded-2xl font-bold transition-all ${completed[item.id] ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100" : "bg-secondary hover:bg-black"}`}
                          onClick={() => toggleCheck(item.id, item.titulo)}
                        >
                          {completed[item.id] ? "Sincronizado Ô£ô" : "Adicionar ao Planejamento"}
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="receitas" className="mt-4">
                  <Card className="rounded-[28px] border-orange-100 shadow-lg">
                    <CardHeader>
                      <CardTitle className="text-2xl">Sugest├Áes de receitas</CardTitle>
                      <CardDescription>Op├º├Áes mais f├íceis de fazer, alinhadas ao seu estilo alimentar.</CardDescription>
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
                                <summary className="cursor-pointer text-sm font-semibold text-emerald-700">­ƒôû Ver receita completa</summary>
                                <div className="mt-3 rounded-2xl border bg-orange-50 p-4 space-y-3">
                                  <div>
                                    <div className="font-semibold text-slate-800 text-sm">­ƒøÆ Ingredientes</div>
                                    <ul className="mt-1 list-disc pl-4 text-sm text-slate-600 space-y-1">
                                      {recipe.receita.ingredientes.map((ing, i) => <li key={i}>{ing}</li>)}
                                    </ul>
                                  </div>
                                  <div>
                                    <div className="font-semibold text-slate-800 text-sm">­ƒæ®ÔÇì­ƒì│ Modo de preparo</div>
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
                      <CardTitle className="text-2xl">Calend├írio menstrual premium</CardTitle>
                      <CardDescription>Um b├┤nus opcional para acompanhar ciclo, ovula├º├úo estimada, janela f├®rtil, fase do momento e docinhos fit.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-5">
                      {!cycleUnlocked  ? (
                        <div className="grid gap-5 lg:grid-cols-[1.1fr,0.9fr]">
                          <div className="rounded-3xl border bg-[linear-gradient(135deg,#fff7f9_0%,#ffffff_100%)] p-6">
                            <div className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-sm font-semibold text-rose-700">
                              <Lock className="h-4 w-4" /> B├┤nus premium bloqueado
                            </div>
                            <div className="mt-4 text-2xl font-black text-slate-900">Desbloqueie seu Calend├írio de Ciclo+</div>
                            <div className="mt-3 text-sm leading-6 text-slate-600">
                              Tenha acesso a um calend├írio personalizado com fases coloridas, previs├úo estimada da ovula├º├úo, janela f├®rtil, leitura da fase atual e sugest├Áes de docinhos fit.
                            </div>
                            <div className="mt-5 grid gap-3 md:grid-cols-2">
                              <div className="rounded-2xl bg-white p-4">
                                <div className="text-sm font-semibold text-slate-900">Fases visuais</div>
                                <div className="mt-1 text-sm text-slate-600">Vermelho para menstrua├º├úo, azul no final, roxo para ovula├º├úo e destaque para janela f├®rtil.</div>
                              </div>
                              <div className="rounded-2xl bg-white p-4">
                                <div className="text-sm font-semibold text-slate-900">TPM e lembretes</div>
                                <div className="mt-1 text-sm text-slate-600">Previs├Áes estimadas para ajudar voc├¬ a se planejar melhor.</div>
                              </div>
                              <div className="rounded-2xl bg-white p-4">
                                <div className="text-sm font-semibold text-slate-900">Docinhos fit por fase</div>
                                <div className="mt-1 text-sm text-slate-600">Sugest├Áes inteligentes para aliviar o estresse sem fugir do plano.</div>
                              </div>
                              <div className="rounded-2xl bg-white p-4">
                                <div className="text-sm font-semibold text-slate-900">Mais personaliza├º├úo</div>
                                <div className="mt-1 text-sm text-slate-600">Quanto mais voc├¬ atualiza, mais o calend├írio se ajusta.</div>
                              </div>
                            </div>
                          </div>

                          <div className="rounded-3xl border bg-white p-6">
                            {isTrialActive && !cycleUnlocked && (
                              <div className="mb-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 p-3">
                                <div className="text-xs font-semibold text-emerald-700">­ƒÄü Per├¡odo de teste: {trialDaysLeft} dia{trialDaysLeft !== 1 ? "s" : ""} restante{trialDaysLeft !== 1 ? "s" : ""}</div>
                                <div className="text-xs text-slate-600 mt-1">Garanta acesso permanente por R$ {PROMO_PRICE.toFixed(2).replace(".", ",")} no per├¡odo promocional!</div>
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
                                Seu per├¡odo de teste expirou. Adquira o acesso permanente.
                              </div>
                            )}
                            <div className="mt-3 text-sm leading-6 text-slate-600">
                              {isTrialActive
                                ? `Aproveite o valor promocional de R$ ${PROMO_PRICE.toFixed(2).replace(".", ",")} antes do fim do per├¡odo de teste.`
                                : `Libere seu Calend├írio de Ciclo+ por R$ ${currentPrice.toFixed(2).replace(".", ",")}.`
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
                              className="mt-3 flex h-10 w-full items-center justify-center rounded-2xl border border-emerald-200 bg-emerald-50 px-4 text-sm font-semibold text-emerald-700 hover:bg-emerald-100"
                            >
                              <BadgeCheck className="mr-2 h-4 w-4" />
                              J├í paguei ÔÇö verificar agora
                            </button>
                            <div className="mt-3 text-xs leading-5 text-slate-500">
                              Ap├│s a confirma├º├úo do pagamento, clique em "J├í paguei" para ativar seu calend├írio.
                            </div>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="grid gap-4 md:grid-cols-3">
                            <div>
                              <label className="text-sm font-medium text-slate-700">├Ültimo in├¡cio da menstrua├º├úo</label>
                              <input type="date" className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 outline-none focus:border-emerald-400" value={profile.ultimoCiclo || ""} onChange={(e) => updateProfile("ultimoCiclo", e.target.value)} />
                            </div>
                            <div>
                              <label className="text-sm font-medium text-slate-700">Dura├º├úo do ciclo</label>
                              <input type="number" className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 outline-none focus:border-emerald-400" value={profile.duracaoCiclo || "28"} onChange={(e) => updateProfile("duracaoCiclo", e.target.value)} placeholder="28 dias" />
                            </div>
                            <div>
                              <label className="text-sm font-medium text-slate-700">Dias de menstrua├º├úo</label>
                              <input type="number" className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 outline-none focus:border-emerald-400" value={profile.duracaoMenstruacao || "5"} onChange={(e) => updateProfile("duracaoMenstruacao", e.target.value)} placeholder="5 dias" />
                            </div>
                          </div>

                          <div className="grid gap-5 lg:grid-cols-[1.2fr,0.8fr]">
                            <div className="space-y-4">
                              <div className="rounded-3xl border bg-white p-5">
                                <div className="mb-4 flex flex-wrap items-center gap-2 text-xs font-semibold">
                                  <span className="rounded-full bg-rose-500 px-3 py-1 text-white">Menstrua├º├úo</span>
                                  <span className="rounded-full bg-sky-400 px-3 py-1 text-white">Final da menstrua├º├úo</span>
                                  <span className="rounded-full bg-violet-500 px-3 py-1 text-white">Ovula├º├úo</span>
                                  <span className="rounded-full bg-fuchsia-100 px-3 py-1 text-fuchsia-700">Janela f├®rtil</span>
                                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-700">Hoje</span>
                                </div>
                                {cycleCalendar.length === 0 ? (
                                  <div className="rounded-2xl bg-slate-50 p-5 text-sm text-slate-600">Preencha a data do ├║ltimo ciclo para gerar seu calend├írio personalizado.</div>
                                ) : (
                                  <div className="grid grid-cols-7 gap-1.5">
                                    {["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "S├üB"].map((d) => (
                                      <div key={d} className="text-center text-[10px] font-bold uppercase text-slate-400 py-1">{d}</div>
                                    ))}
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
                                        return (
                                          <div key={day.dateKey} className={`aspect-square rounded-2xl flex flex-col items-center justify-center relative transition-all ${isToday ? "bg-primary text-white shadow-lg ring-4 ring-primary/10" : "hover:bg-slate-50"}`}>
                                            <span className={`text-sm font-bold ${isToday ? "text-white" : "text-slate-700"}`}>{day.dayNumber}</span>
                                            {day.phase !== "neutro" && (
                                              <div className={`absolute bottom-2 h-1.5 w-1.5 rounded-full ${day.phase === "menstrua\u00e7\u00e3o" ? "bg-rose-400" : day.phase === "ovula\u00e7\u00e3o" ? "bg-emerald-400" : "bg-violet-400"}`} />
                                            )}
                                          </div>
                                        );
                                      });
                                      return [...blanks, ...days];
                                    })()}
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="space-y-8 min-w-0">
                              <Card className="rounded-[40px] border-none shadow-premium bg-white p-8">
                                <div className="flex items-center justify-between mb-8">
                                  <h3 className="text-2xl font-serif italic text-slate-900">Seu Calend\u00e1rio</h3>
                                  <div className="flex gap-2">
                                    <Button variant="ghost" size="icon" className="rounded-xl border border-slate-50" onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))}>
                                      <ChevronLeft className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="rounded-xl border border-slate-50" onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))}>
                                      <ChevronRight className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                                <div className="grid grid-cols-7 gap-1 md:gap-4">
                                  {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "S\u00e1b"].map((d) => (
                                    <div key={d} className="text-center text-[10px] font-bold text-slate-300 uppercase tracking-widest pb-4">{d}</div>
                                  ))}
                                  {(() => {
                                    const fdk = cycleCalendar[0]?.dateKey;
                                    if (!fdk) return null;
                                    const fd = new Date(`${fdk}T12:00:00`);
                                    const sd = fd.getDay();
                                    const b = Array.from({ length: sd }, (_, i) => <div key={`b-${i}`} className="aspect-square" />);
                                    const ds = cycleCalendar.map((day) => {
                                      const isToday = day.dateKey === todayKey;
                                      return (
                                        <div key={day.dateKey + "-2"} className={`aspect-square rounded-2xl flex flex-col items-center justify-center relative transition-all ${isToday ? "bg-primary text-white shadow-lg ring-4 ring-primary/10" : "hover:bg-slate-50"}`}>
                                          <span className={`text-sm font-bold ${isToday ? "text-white" : "text-slate-700"}`}>{day.dayNumber}</span>
                                          {day.phase !== "neutro" && <div className={`absolute bottom-2 h-1.5 w-1.5 rounded-full ${day.phase === "menstrua\u00e7\u00e3o" ? "bg-rose-400" : day.phase === "ovula\u00e7\u00e3o" ? "bg-emerald-400" : "bg-violet-400"}`} />}
                                        </div>
                                      );
                                    });
                                    return [...b, ...ds];
                                  })()}
                                </div>
                              </Card>
                              <div className="grid gap-8 md:grid-cols-2">
                                <Card className="rounded-[40px] border-none shadow-premium bg-slate-900 text-white p-8 overflow-hidden relative">
                                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-3xl rounded-full -mr-16 -mt-16" />
                                  <div className="relative z-10">
                                    <p className="text-[10px] uppercase font-bold tracking-[3px] text-slate-500 mb-4">Fase Hormonal de Hoje</p>
                                    <h4 className="text-3xl font-serif italic mb-2 capitalize">{currentCycleDay ? getPhaseTitle(currentCycleDay.phase) : "Fase Neutra"}</h4>
                                    <p className="text-slate-400 text-sm font-light leading-relaxed">
                                      {currentCycleDay ? currentCycleDay.label : "Suas previs├Áes hormonais aparecem aqui."}
                                    </p>
                                  </div>
                                </Card>

                                <div className="space-y-4">
                                  <p className="text-[10px] uppercase font-bold tracking-[3px] text-slate-400 ml-4">Docinho Fit do Dia</p>
                                  <div className="grid gap-4">
                                    {cycleTreats.slice(0, 2).map((item, i) => (
                                      <div key={i} className="bg-white p-5 rounded-[32px] border border-slate-50 shadow-sm flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center shrink-0">
                                          <Sparkles className="h-6 w-6" />
                                        </div>
                                        <div>
                                          <p className="font-bold text-slate-900 text-sm">{item.titulo}</p>
                                          <p className="text-[10px] text-slate-400 mt-0.5 uppercase tracking-widest font-bold">Ideal para {currentCycleDay?.phase}</p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
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
                      <Card className="rounded-[40px] border-none shadow-premium bg-emerald-50/50 p-10 text-center">
                        <div className="h-16 w-16 rounded-3xl bg-emerald-50 mx-auto flex items-center justify-center text-emerald-500 mb-6">
                          <Trophy className="h-8 w-8" />
                        </div>
                        <h3 className="text-2xl font-serif italic mb-4">Meta Di├íria</h3>
                        <p className="text-emerald-700 font-bold text-4xl mb-4">{progress}%</p>
                        <p className="text-slate-500 text-sm font-light leading-relaxed">
                          "{getCongratsMessage(completedCount)}"
                        </p>
                      </Card>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white p-6 rounded-[32px] border border-slate-50 shadow-sm flex flex-col items-center text-center">
                          <div className="h-10 w-10 rounded-xl bg-sky-50 text-sky-500 flex items-center justify-center mb-4">
                            <Waves className="h-5 w-5" />
                          </div>
                          <span className="text-[10px] uppercase font-bold text-slate-300 mb-1">H├íbitos</span>
                          <span className="text-sm font-bold">8 Copos ├ügua</span>
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
                        <p className="text-slate-400 font-light italic">Seus alertas e conquistas ser├úo listados aqui.</p>
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
                  <Card className="rounded-[40px] border-none shadow-premium bg-white p-10 overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-pink-50 blur-3xl rounded-full -mr-32 -mt-32" />
                    
                    <div className="relative z-10">
                      <div className="flex flex-col md:flex-row gap-10">
                        <div className="flex-1">
                          <h3 className="text-4xl font-serif italic mb-6">Sua voz importa.</h3>
                          <p className="text-slate-500 font-light leading-relaxed mb-8">
                            O SlimDay ├® constru├¡do para mulheres reais. Suas sugest├Áes, cr├¡ticas e ideias s├úo o que nos faz crescer. Digite abaixo o que voc├¬ est├í achando da sua experi├¬ncia.
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
    </>
  );
}

export default SlimDayApp;
