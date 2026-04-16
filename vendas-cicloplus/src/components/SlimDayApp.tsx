import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { recipeImages } from "@/assets/recipes";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import {
  CheckCircle2,
  Clock3,
  Salad,
  Dumbbell,
  Sparkles,
  ChevronRight,
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

type FitnessLevel = "iniciante" | "intermediaria" | "avancada";
type Goal = "emagrecer" | "definir" | "mais energia" | "criar constancia";
type TimePerDay = "10" | "15" | "20" | "30";
type MealStyle = "pratico" | "equilibrado" | "sem tempo" | "caseiro";
type RoutineStyle = "corrida" | "moderada" | "flexivel";
type SyncStatus = "idle" | "saving" | "synced" | "offline" | "error";
type CyclePhase = "menstruacao_forte" | "menstruacao_final" | "ovulacao" | "fertil" | "neutro";

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
            value={feedbackName}
            onChange={(e) => setFeedbackName(sanitizeName(e.target.value))}
            placeholder="Seu nome"
          />
        </div>
        <div>
          <Label className="text-sm font-semibold text-slate-700">Seu e-mail (opcional)</Label>
          <Input
            className="mt-1 rounded-2xl"
            value={feedbackEmail}
            onChange={(e) => setFeedbackEmail(sanitizeEmail(e.target.value))}
            placeholder="seu@email.com"
            type="email"
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
              <SelectItem value="problema">🐛 Algo não funcionou</SelectItem>
              <SelectItem value="elogio">💕 Elogio</SelectItem>
              <SelectItem value="outro">📝 Outro</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-sm font-semibold text-slate-700">Sua mensagem</Label>
          <Textarea
            className="mt-1 min-h-[120px] rounded-2xl"
            placeholder="Conte pra gente o que você gostaria de ver no app, o que pode melhorar ou qualquer coisa que queira compartilhar 🌸"
            value={feedbackMsg}
            onChange={(e) => setFeedbackMsg(e.target.value)}
            maxLength={2000}
          />
          <div className="mt-1 text-right text-xs text-slate-400">{feedbackMsg.length}/2000</div>
        </div>

        {sent ? (
          <div className="rounded-2xl bg-emerald-50 p-4 text-center">
            <div className="text-lg font-bold text-emerald-700">Recebemos! 💕</div>
            <div className="mt-1 text-sm text-emerald-600">Obrigada pelo seu feedback. Ele é muito valioso pra nós!</div>
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
    { id: "c1", titulo: "Iogurte com fruta e aveia", descricao: "Fácil de montar, leve e prático para manhã corrida.", categoria: "Café da manhã", receita: { ingredientes: ["1 pote de iogurte natural (170g)", "1 fruta picada (banana, morango ou maçã)", "2 colheres de sopa de aveia em flocos", "Canela a gosto", "1 colher de chá de mel (opcional)"], preparo: ["Coloque o iogurte em uma tigela.", "Adicione a fruta picada por cima.", "Salpique a aveia e a canela.", "Finalize com mel se desejar.", "Pronto em 2 minutos!"] } },
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
    { id: "j1", titulo: "Sopa leve com proteína", descricao: "Boa para a noite e fácil de preparar.", categoria: "Jantar", receita: { ingredientes: ["100g de frango desfiado ou carne moída", "1 batata pequena picada", "1/2 cenoura picada", "1/2 chuchu picado", "1/2 cebola e alho", "500ml de água", "Sal e salsinha a gosto"], preparo: ["Refogue cebola e alho em azeite.", "Adicione a proteína e refogue.", "Acrescente os legumes e a água.", "Cozinhe por 25 minutos em fogo médio.", "Finalize com salsinha e ajuste o sal."] } },
    { id: "j2", titulo: "Omelete + salada + legumes", descricao: "Jantar rápido para dias corridos.", categoria: "Jantar", receita: { ingredientes: ["2 ovos", "Legumes: brócolis ou abobrinha refogada", "Salada verde", "1 colher de chá de azeite", "Sal e temperos a gosto"], preparo: ["Bata os ovos com sal.", "Faça a omelete em frigideira com azeite.", "Refogue os legumes separadamente.", "Monte o prato com omelete, legumes e salada.", "Pronto em 10 minutos."] } },
  ],
};

const phaseTreats: Record<CyclePhase, { titulo: string; descricao: string; receita?: RecipeDetail }[]> = {
  menstruacao_forte: [
    { titulo: "Brigadeiro fit de cacau", descricao: "Feito com cacau, aveia e toque de pasta de amendoim. Ajuda a matar a vontade de doce com porção menor.", receita: { ingredientes: ["2 colheres de sopa de cacau em pó", "2 colheres de sopa de aveia em flocos finos", "1 colher de sopa de pasta de amendoim", "1 colher de sopa de mel ou adoçante", "1 colher de sopa de leite (ou bebida vegetal)"], preparo: ["Misture todos os ingredientes secos em uma tigela.", "Adicione a pasta de amendoim e o mel.", "Acrescente o leite aos poucos até formar uma massa.", "Faça bolinhas com as mãos.", "Passe no cacau em pó e leve à geladeira por 30 min."] } },
    { titulo: "Banana morna com canela e cacau", descricao: "Doce rápido e acolhedor para os dias de fluxo mais intenso.", receita: { ingredientes: ["1 banana madura", "1 colher de chá de canela em pó", "1 colher de chá de cacau em pó", "1 colher de chá de mel (opcional)"], preparo: ["Corte a banana ao meio no sentido do comprimento.", "Coloque em uma frigideira antiaderente em fogo médio.", "Aqueça por 2 minutos de cada lado.", "Salpique canela e cacau por cima.", "Finalize com mel se desejar."] } },
  ],
  menstruacao_final: [
    { titulo: "Mousse fit de iogurte com cacau", descricao: "Sobremesa leve para o final do período, com boa saciedade.", receita: { ingredientes: ["1 pote de iogurte natural (170g)", "1 colher de sopa de cacau em pó", "1 colher de chá de mel ou adoçante", "Frutas vermelhas para decorar (opcional)"], preparo: ["Misture o iogurte com o cacau e o mel.", "Bata com um garfo até ficar homogêneo.", "Coloque em um copinho.", "Decore com frutas vermelhas.", "Leve à geladeira por 15 min para firmar."] } },
    { titulo: "Morango com chocolate 70%", descricao: "Pequena porção para aliviar a vontade de doce sem exagerar.", receita: { ingredientes: ["6 morangos grandes", "30g de chocolate 70% cacau"], preparo: ["Lave e seque bem os morangos.", "Derreta o chocolate em banho-maria ou micro-ondas (em intervalos de 15s).", "Mergulhe cada morango até a metade no chocolate.", "Coloque em papel manteiga.", "Leve à geladeira por 20 min até firmar."] } },
  ],
  ovulacao: [
    { titulo: "Frozen de frutas vermelhas", descricao: "Refrescante, leve e fácil de encaixar no plano de emagrecimento.", receita: { ingredientes: ["1 xícara de frutas vermelhas congeladas (morango, mirtilo, framboesa)", "1/2 banana congelada", "2 colheres de sopa de iogurte natural"], preparo: ["Bata tudo no liquidificador ou processador.", "Raspe as laterais e bata novamente até ficar cremoso.", "Sirva imediatamente em uma tigela.", "Decore com frutas frescas ou granola se desejar."] } },
    { titulo: "Iogurte proteico com chia", descricao: "Doce equilibrado para manter saciedade e energia.", receita: { ingredientes: ["1 pote de iogurte proteico (170g)", "1 colher de sopa de chia", "Frutas picadas a gosto", "Canela a gosto"], preparo: ["Misture o iogurte com a chia.", "Deixe descansar por 10 minutos para a chia hidratar.", "Adicione as frutas picadas.", "Salpique canela por cima.", "Pronto!"] } },
  ],
  fertil: [
    { titulo: "Maçã assada com canela", descricao: "Doce simples e controlado para um lanche mais leve.", receita: { ingredientes: ["1 maçã", "Canela em pó a gosto", "1 colher de chá de mel (opcional)", "Cravo (opcional)"], preparo: ["Retire o miolo da maçã sem cortar a base.", "Polvilhe canela por dentro e por fora.", "Adicione mel e cravo se desejar.", "Asse no forno a 180°C por 25-30 min.", "Sirva morna."] } },
    { titulo: "Creme fit de abacate com cacau", descricao: "Textura cremosa e boa saciedade em pequena porção.", receita: { ingredientes: ["1/2 abacate maduro", "1 colher de sopa de cacau em pó", "1 colher de chá de mel ou adoçante", "1 colher de sopa de leite (opcional para cremosidade)"], preparo: ["Amasse o abacate com um garfo até ficar cremoso.", "Adicione o cacau e o mel.", "Misture bem até ficar homogêneo.", "Adicione leite se quiser mais cremoso.", "Sirva gelado em um copinho."] } },
  ],
  neutro: [
    { titulo: "Cookie fit de banana e aveia", descricao: "Fácil de preparar e ótimo para controlar a porção.", receita: { ingredientes: ["2 bananas maduras", "1 xícara de aveia em flocos", "1 colher de sopa de cacau em pó (opcional)", "Gotas de chocolate 70% (opcional)", "Canela a gosto"], preparo: ["Amasse as bananas com um garfo.", "Misture com a aveia, cacau e canela.", "Adicione gotas de chocolate se desejar.", "Faça bolinhas e achate em forma de cookie.", "Asse a 180°C por 15-20 min."] } },
    { titulo: "Pudim fit de chia", descricao: "Boa opção de docinho com sensação de sobremesa.", receita: { ingredientes: ["3 colheres de sopa de chia", "200ml de leite (ou bebida vegetal)", "1 colher de chá de essência de baunilha", "1 colher de chá de mel ou adoçante", "Frutas para decorar"], preparo: ["Misture chia, leite, baunilha e mel.", "Mexa bem para distribuir as sementes.", "Tampe e leve à geladeira por 4 horas ou de um dia pro outro.", "Mexa uma vez após 30 min para evitar grumos.", "Sirva com frutas por cima."] } },
  ],
};

const tutorialMap: Record<string, string[]> = {
  "Caminhada no lugar + mobilidade": ["Fique em pé e caminhe sem sair do lugar por 30 a 60 segundos.", "Mexa os braços naturalmente e mantenha o abdômen levemente firme.", "Depois faça círculos com ombros e quadril para soltar o corpo."],
  "Agachamento assistido": ["Afaste os pés na largura do quadril.", "Segure em uma cadeira ou apoio se precisar.", "Desça devagar como se fosse sentar e suba empurrando o chão."],
  "Braço com garrafa": ["Segure uma garrafa em cada mão ou use apenas uma se preferir.", "Mantenha os cotovelos próximos ao corpo.", "Suba e desça os braços com controle, sem pressa."],
  "Abdominal leve em pé": ["Fique em pé com o abdômen levemente contraído.", "Leve o joelho em direção ao tronco alternando os lados.", "Expire ao subir o joelho e mantenha postura reta."],
  "Alongamento guiado": ["Respire fundo e alongue pescoço, braços e pernas sem forçar.", "Segure cada posição por alguns segundos.", "Mantenha movimento confortável e relaxado."],
  "Aquecimento dinâmico": ["Faça movimentos leves com braços, pernas e tronco por 1 minuto.", "Aumente o ritmo aos poucos sem perder o controle.", "O objetivo é aquecer, não cansar já no começo."],
  "Agachamento + elevação de joelho": ["Faça um agachamento curto e ao subir eleve um joelho.", "Repita alternando os lados.", "Mantenha o tronco firme e o movimento confortável."],
  "Afundo alternado": ["Dê um passo para trás e flexione os joelhos com cuidado.", "Suba e troque a perna.", "Use apoio se sentir necessidade no começo."],
  "Prancha curta": ["Apoie antebraços ou mãos e alinhe o corpo.", "Contraia levemente abdômen e glúteos.", "Segure poucos segundos com boa postura."],
  "Finalização metabólica": ["Faça movimentos simples em ritmo um pouco mais acelerado.", "Mantenha respiração constante.", "Pare ou diminua se perder a técnica."],
  "Aquecimento ativo": ["Inicie com movimentos amplos de braços e pernas.", "Ative o corpo sem ir ao limite.", "Prepare-se para a parte mais forte do treino."],
  "Agachamento com salto leve": ["Agache curto e suba com salto pequeno ou apenas na ponta dos pés.", "Aterrisse suave e com joelhos alinhados.", "Se preferir, retire o salto e faça só a subida rápida."],
  "Circuito de pernas e core": ["Alterne exercícios de pernas com pausas curtas.", "Mantenha abdômen firme durante o circuito.", "Controle o ritmo para sustentar a execução até o fim."],
  "Prancha com variação": ["Monte a prancha e acrescente toque no ombro ou abertura lateral simples.", "Mantenha quadril estável.", "Reduza a variação se sentir perda de postura."],
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
  "Finisher SlimDay": { dificuldade: "intenso", cuidado: "Feche forte, mas sem sacrificar a execução.", explicacaoSimples: "É o bloco final para terminar com sensação de missão cumprida.", youtubeId: "dZgVxmf6jkA" },
  // Novos Iniciante
  "Elevação pélvica": { dificuldade: "leve", cuidado: "Não force a lombar, suba usando os glúteos.", explicacaoSimples: "É levantar o quadril do chão e apertar o bumbum.", youtubeId: "w_mP96HPrpQ" },
  "Prancha de joelhos": { dificuldade: "leve", cuidado: "Mantenha o pescoço alinhado com a coluna.", explicacaoSimples: "É ficar paradinha apoiada nos braços e joelhos.", youtubeId: "6I2In2_S7m0" },
  "Polichinelo adaptado": { dificuldade: "leve", cuidado: "Se sentir dor no ombro, não suba os braços até o topo.", explicacaoSimples: "É o polichinelo sem pulo, um passo de cada vez.", youtubeId: "lV5a4IueVjE" },
  "4 apoios (Glúteos)": { dificuldade: "leve", cuidado: "Não deixe a barriga cair, mantenha firme.", explicacaoSimples: "É chutar o teto estando de joelhos no chão.", youtubeId: "vN_j_2a2S7o" },
  "Mobilidade de escápulas": { dificuldade: "leve", cuidado: "Mova apenas os ombros, não os braços.", explicacaoSimples: "É 'afundar' e 'empurrar' o peito para soltar os ombros.", youtubeId: "tV_6V_6X_Xo" },
  // Novos Intermediário
  "Mountain Climber": { dificuldade: "moderado", cuidado: "Não eleve muito o quadril, mantenha-o baixo.", explicacaoSimples: "É como se estivesse subindo uma montanha no chão.", youtubeId: "nmwgirgXLYM" },
  "Tríceps no banco": { dificuldade: "moderado", cuidado: "Mantenha as costas próximas ao banco.", explicacaoSimples: "É descer e subir usando a força do 'tchau'.", youtubeId: "jX-VvX6X_Xo" },
  "Stiff": { dificuldade: "moderado", cuidado: "Mantenha a coluna reta o tempo todo.", explicacaoSimples: "É descer o corpo reto para alongar atrás das pernas.", youtubeId: "HML6f35U_f4" },
  "Prancha Lateral": { dificuldade: "moderado", cuidado: "Não deixe o quadril cair em direção ao chão.", explicacaoSimples: "É ficar de ladinho tirando o corpo do chão.", youtubeId: "N_6V_6X_Xo" },
  "Agachamento Sumô": { dificuldade: "moderado", cuidado: "Mantenha os joelhos na direção dos dedos dos pés.", explicacaoSimples: "É o agachamento com as pernas mais abertas.", youtubeId: "Y2Xp1x6L_2o" },
  "Remada alta": { dificuldade: "moderado", cuidado: "Não levante os ombros até as orelhas.", explicacaoSimples: "É puxar o peso até o queixo como um remador.", youtubeId: "S8_X9QpZp38" },
  // Novos Avançado
  "Burpee completo": { dificuldade: "intenso", cuidado: "Cuidado no impacto do pulo ao voltar.", explicacaoSimples: "O exercício mais completo: chão, peito e salto.", youtubeId: "Y2Xp1x6L_2o" },
  "Afundo Búlgaro": { dificuldade: "intenso", cuidado: "O tronco pode inclinar levemente para frente.", explicacaoSimples: "Afundo com um pé elevado, o 'terror' das pernas.", youtubeId: "h_MIs-bX_Xo" },
  "V-ups": { dificuldade: "intenso", cuidado: "Tente subir o tronco e pernas juntos.", explicacaoSimples: "Um abdominal 'canivete' para fechar o corpo.", youtubeId: "Y2Xp1x6L_2o" },
  "Agachamento com Salto Sumô": { dificuldade: "intenso", cuidado: "Aterrisse suave com as pontas dos pés primeiro.", explicacaoSimples: "Agachamento aberto com salto para explosão.", youtubeId: "Y2Xp1x6L_2o" },
  "Flexão de braços": { dificuldade: "intenso", cuidado: "Mantenha o corpo como uma tábua, sem cair.", explicacaoSimples: "A clássica flexão para braços e peito.", youtubeId: "y6v1D_uY_vI" },
  "Prancha sobe e desce": { dificuldade: "intenso", cuidado: "Mantenha o quadril o mais parado possível.", explicacaoSimples: "É revezar entre apoiar as mãos e os cotovelos.", youtubeId: "Y2Xp1x6L_2o" },
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
    ],
    advanced: [
      ["Aquecimento ativo", "Entrada rápida para treinar mais forte."],
      ["Agachamento com salto leve", "Mais intensidade quando já existe base."],
      ["Circuito de pernas e core", "Ritmo mais desafiador sem alongar demais o treino."],
      ["Prancha com variação", "Maior exigência muscular."],
      ["Finisher SlimDay", "Fechamento curto para sensação de progresso."],
      ["Burpee completo", "Intensidade máxima e queima total."],
      ["Afundo Búlgaro", "Exercício potente para pernas e glúteos."],
      ["V-ups", "Abdominal avançado para definição."],
      ["Agachamento com Salto Sumô", "Explosão muscular e cardio."],
      ["Flexão de braços", "Força de peito e braços."],
      ["Prancha sobe e desce", "Desafio extremo de core e ombros."],
    ],
  };

  const pool = profile.nivel === "iniciante" ? pools.beginner : profile.nivel === "intermediaria" ? pools.intermediate : pools.advanced;
  
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
      categoria: "Treino do dia",
      tutorial: tutorialMap[item[0]] ?? ["Mantenha postura confortável.", "Faça o movimento com controle.", "Reduza o ritmo se sentir necessidade."],
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
    if (dayInCycle < Math.ceil(periodLength / 2)) { phase = "menstruacao_forte"; label = "Menstruação"; }
    else if (dayInCycle < periodLength) { phase = "menstruacao_final"; label = "Final da menstruação"; }
    else if (dayInCycle >= cycleLength - 16 && dayInCycle <= cycleLength - 13) { phase = "fertil"; label = "Janela fértil"; }
    if (dayInCycle === cycleLength - 14) { phase = "ovulacao"; label = "Ovulação estimada"; }
    days.push({ dateKey: toDateKey(current), dayNumber: current.getDate(), phase, label });
  }
  return days;
}

function getPhaseColor(phase: CyclePhase) {
  switch (phase) {
    case "menstruacao_forte": return "bg-rose-500 text-white border-rose-500";
    case "menstruacao_final": return "bg-sky-400 text-white border-sky-400";
    case "ovulacao": return "bg-violet-500 text-white border-violet-500";
    case "fertil": return "bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200";
    default: return "bg-white text-slate-700 border-slate-200";
  }
}

function getPhaseTitle(phase: CyclePhase) {
  switch (phase) {
    case "menstruacao_forte": return "Menstruação";
    case "menstruacao_final": return "Final da menstruação";
    case "ovulacao": return "Ovulação estimada";
    case "fertil": return "Janela fértil";
    default: return "Fase neutra";
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
 
// Auxiliares de sanitização
const sanitizeName = (val: string) => val.replace(/[^a-zA-Z\sÀ-ÿ]/g, "").slice(0, 100);
const sanitizeNumber = (val: string, maxLen = 3) => val.replace(/\D/g, "").slice(0, maxLen);
const sanitizeEmail = (val: string) => val.trim().toLowerCase().slice(0, 255);
 
// ──────────────────────────────
// Onboarding Quiz for new users
// ──────────────────────────────
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
        {/* Progress bar */}
        <div className="mb-6">
          <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
          <div className="mt-2 text-center text-xs text-slate-500 font-medium">
            {currentIndex > 0 && currentIndex < ONBOARDING_STEPS.length - 1
              ? `Passo ${currentIndex} de ${ONBOARDING_STEPS.length - 2}`
              : ""}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.3 }}
          >
            {step === "intro" && (
              <Card className="rounded-[28px] border-emerald-100 shadow-xl overflow-hidden">
                <div className="bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 p-8 text-white text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-white/20 backdrop-blur-sm">
                    <Sparkles className="h-8 w-8 text-white" />
                  </div>
                  <h1 className="text-3xl font-black">Bem-vinda ao SlimDay! 🌸</h1>
                  <p className="mt-3 text-sm leading-6 opacity-90 max-w-md mx-auto">
                    O app que monta um plano personalizado de treino + alimentação para caber na sua rotina.
                  </p>
                </div>
                <CardContent className="p-6 space-y-5">
                  <div className="grid gap-3">
                    <div className="flex items-start gap-3 rounded-2xl bg-emerald-50 p-4">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600"><Dumbbell className="h-4 w-4" /></div>
                      <div>
                        <div className="font-bold text-slate-900 text-sm">Treino personalizado</div>
                        <div className="text-xs text-slate-600 mt-0.5">Exercícios de 10 a 20 min adaptados ao seu nível, com tutorial passo-a-passo.</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 rounded-2xl bg-orange-50 p-4">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-600"><Utensils className="h-4 w-4" /></div>
                      <div>
                        <div className="font-bold text-slate-900 text-sm">Alimentação prática</div>
                        <div className="text-xs text-slate-600 mt-0.5">Refeições simples com receita completa, pensadas para a sua rotina.</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 rounded-2xl bg-rose-50 p-4">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-600"><CalendarDays className="h-4 w-4" /></div>
                      <div>
                        <div className="font-bold text-slate-900 text-sm">Calendário de ciclo+ grátis por 7 dias</div>
                        <div className="text-xs text-slate-600 mt-0.5">Acompanhe suas fases com previsões, docinhos fit e mais.</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 rounded-2xl bg-violet-50 p-4">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-600"><Trophy className="h-4 w-4" /></div>
                      <div>
                        <div className="font-bold text-slate-900 text-sm">Motivação e constância</div>
                        <div className="text-xs text-slate-600 mt-0.5">Check-list do dia, streak de atividade e mensagens para manter o ritmo.</div>
                      </div>
                    </div>
                  </div>
                  <Button className="w-full rounded-2xl h-12 text-base font-bold bg-emerald-600 hover:bg-emerald-700" onClick={next}>
                    Vamos começar! <ChevronRight className="ml-2 h-5 w-5" />
                  </Button>
                </CardContent>
              </Card>
            )}

            {step === "nome" && (
              <Card className="rounded-[28px] border-violet-100 shadow-xl">
                <CardContent className="p-6 md:p-8 space-y-5">
                  <div className="text-center">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 text-violet-600"><User className="h-6 w-6" /></div>
                    <h2 className="text-2xl font-black text-slate-900">Como você se chama?</h2>
                    <p className="mt-2 text-sm text-slate-600">Vamos personalizar tudo pra você.</p>
                  </div>
                  <Input
                    value={profile.nome}
                    onChange={(e) => onUpdateProfile("nome", e.target.value)}
                    placeholder="Seu nome"
                    className="h-12 rounded-2xl text-center text-lg font-semibold"
                    autoFocus
                  />
                  <div className="flex gap-3">
                    <Button variant="outline" className="flex-1 rounded-2xl" onClick={back}>Voltar</Button>
                    <Button className="flex-1 rounded-2xl bg-violet-600 hover:bg-violet-700" onClick={next} disabled={!profile.nome.trim()}>
                      Continuar <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {step === "medidas_calendario" && (
              <Card className="rounded-[28px] border-rose-100 shadow-xl">
                <CardContent className="p-6 md:p-8 space-y-5">
                  <div className="text-center">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-600"><CalendarDays className="h-6 w-6" /></div>
                    <h2 className="text-2xl font-black text-slate-900">Sobre seu corpo e ciclo</h2>
                    <p className="mt-2 text-sm text-slate-600">Esses dados geram estimativas precisas pro seu calendário menstrual.</p>
                  </div>
                  <div className="grid gap-4">
                    <div>
                      <Label className="text-sm font-semibold text-slate-700">Idade</Label>
                      <Input
                        type="number"
                        value={profile.idade}
                        onChange={(e) => onUpdateProfile("idade", e.target.value)}
                        placeholder="Ex: 28"
                        className="mt-1.5 h-12 rounded-2xl"
                        autoFocus
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-semibold text-slate-700">Peso atual (kg)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={profile.peso}
                        onChange={(e) => onUpdateProfile("peso", e.target.value)}
                        placeholder="Ex: 65,5"
                        className="mt-1.5 h-12 rounded-2xl"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-semibold text-slate-700">Início da última menstruação</Label>
                      <Input
                        type="date"
                        value={profile.ultimoCiclo || ""}
                        onChange={(e) => onUpdateProfile("ultimoCiclo", e.target.value)}
                        className="mt-1.5 h-12 rounded-2xl"
                      />
                      <p className="mt-1 text-xs text-slate-500">Se não lembrar, coloque uma data aproximada.</p>
                    </div>
                  </div>
                  <div className="flex gap-3 mt-2">
                    <Button variant="outline" className="flex-1 rounded-2xl" onClick={back}>Voltar</Button>
                    <Button className="flex-1 rounded-2xl bg-rose-600 hover:bg-rose-700" onClick={next} disabled={!profile.idade || !profile.peso || !profile.ultimoCiclo}>
                      Continuar <ChevronRight className="ml-1 h-4 w-4" />
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
                    {([["emagrecer", "🔥 Emagrecer", "Perder peso de forma saudável e sustentável."], ["definir", "💪 Definir", "Tonificar e ganhar mais definição muscular."], ["mais energia", "⚡ Mais energia", "Ter mais disposição e ânimo no dia a dia."], ["criar constancia", "🎯 Criar constância", "Montar uma rotina e manter o hábito."]] as [Goal, string, string][]).map(([value, label, desc]) => (
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
                    <h2 className="text-2xl font-black text-slate-900">Qual seu nível atual?</h2>
                    <p className="mt-2 text-sm text-slate-600">Tudo bem se estiver começando. O plano se adapta.</p>
                  </div>
                  <div className="grid gap-3">
                    {([["iniciante", "🌱 Iniciante", "Nunca treinei ou treino pouco."], ["intermediaria", "🌿 Intermediária", "Tenho alguma experiência e constância."], ["avancada", "🌳 Avançada", "Treino regularmente e quero mais desafio."]] as [FitnessLevel, string, string][]).map(([value, label, desc]) => (
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
                    {([["corrida", "⚡ Muito corrida", "Tenho pouco tempo para tudo."], ["moderada", "⏳ Moderada", "Consigo encaixar coisas com planejamento."], ["flexivel", "🌊 Mais flexível", "Tenho flexibilidade para organizar o dia."]] as [RoutineStyle, string, string][]).map(([value, label, desc]) => (
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
              <Card className="rounded-[28px] border-emerald-100 shadow-xl overflow-hidden">
                <div className="bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 p-8 text-white text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-white/20 backdrop-blur-sm">
                    <BadgeCheck className="h-8 w-8 text-white" />
                  </div>
                  <h2 className="text-3xl font-black">Tudo pronto, {profile.nome}! 🎉</h2>
                  <p className="mt-3 text-sm leading-6 opacity-90">Seu plano personalizado foi montado com base nas suas respostas.</p>
                </div>
                <CardContent className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-emerald-50 p-4 text-center">
                      <div className="text-xs font-semibold text-emerald-700 uppercase">Objetivo</div>
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
                  <Button className="w-full rounded-2xl h-12 text-base font-bold bg-emerald-600 hover:bg-emerald-700" onClick={next}>
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

                  <a href={PROMO_LINK} target="_blank" rel="noopener noreferrer" className="block" onClick={onComplete}>
                    <Button className="w-full rounded-2xl h-14 text-lg font-black bg-rose-600 hover:bg-rose-700 shadow-xl shadow-rose-200 animate-pulse-slow">
                      EU QUERO POR R$ 29,90! 🚀
                    </Button>
                  </a>

                  <button className="mt-3 text-sm font-semibold text-slate-400 hover:text-slate-600 underline underline-offset-4 transition-colors" onClick={onComplete}>
                    Não obrigado, quero apenas usar meus 7 dias de teste grátis.
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
    <div className="min-h-screen bg-[linear-gradient(180deg,#f3fff8_0%,#fffaf7_45%,#ffffff_100%)] px-3 py-4 md:p-8">
      <div className="mx-auto grid max-w-6xl gap-4 md:gap-6 lg:grid-cols-[1.05fr,0.95fr]">
        <Card className="rounded-[20px] md:rounded-[32px] border-emerald-100 shadow-xl">
          <CardContent className="p-5 md:p-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">
              <Sparkles className="h-4 w-4" /> SlimDay
            </div>
            <h1 className="mt-4 text-2xl md:text-4xl font-black tracking-tight text-slate-900">Entre na sua área pessoal</h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600 md:text-base">
              Faça login para salvar seu progresso online, continuar de onde parou e manter seu plano sincronizado entre acessos.
            </p>
            <div className="mt-6 md:mt-8 grid gap-3 md:gap-4 md:grid-cols-3">
              <div className="rounded-2xl md:rounded-3xl bg-emerald-50 p-4 md:p-5">
                <Cloud className="h-5 w-5 text-emerald-600" />
                <div className="mt-3 font-bold text-slate-900">Sincronização</div>
                <div className="mt-1 text-sm text-slate-600">Seu progresso fica salvo online automaticamente.</div>
              </div>
              <div className="rounded-2xl md:rounded-3xl bg-violet-50 p-4 md:p-5">
                <ShieldCheck className="h-5 w-5 text-violet-600" />
                <div className="mt-3 font-bold text-slate-900">Área segura</div>
                <div className="mt-1 text-sm text-slate-600">Sua conta é protegida com autenticação real.</div>
              </div>
              <div className="rounded-2xl md:rounded-3xl bg-orange-50 p-4 md:p-5">
                <BarChart3 className="h-5 w-5 text-orange-600" />
                <div className="mt-3 font-bold text-slate-900">Progresso contínuo</div>
                <div className="mt-1 text-sm text-slate-600">Você mantém streak, check-list, notificações e perfil.</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[20px] md:rounded-[32px] border-slate-200 shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl md:text-3xl">{mode === "login" ? "Entrar" : "Criar conta"}</CardTitle>
            <CardDescription>
              {mode === "login" ? "Acesse sua conta SlimDay." : "Crie sua conta para salvar tudo online."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {error && (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</div>
            )}
            {success && (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700 animate-pulse-slow">{success}</div>
            )}
            {mode === "register" && (
              <div>
                <Label>Seu nome</Label>
                <div className="relative mt-2">
                  <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input 
                    className="pl-10" 
                    value={nome} 
                    onChange={(e) => setNome(sanitizeName(e.target.value))} 
                    placeholder="Digite seu nome" 
                  />
                </div>
              </div>
            )}
            <div>
              <Label>E-mail</Label>
              <div className="relative mt-2">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input 
                  className="pl-10" 
                  value={email} 
                  onChange={(e) => setEmail(sanitizeEmail(e.target.value))} 
                  placeholder="voce@email.com" 
                />
              </div>
            </div>
            <div>
              <Label>Senha</Label>
              <div className="relative mt-2">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input className="pl-10" type="password" value={senha} onChange={(e) => setSenha(e.target.value)} placeholder="••••••••" />
              </div>
            </div>
            <Button className="w-full rounded-2xl" onClick={onSubmit} disabled={loading}>
              {loading ? "Aguarde..." : mode === "login" ? "Entrar na minha conta" : "Criar conta e continuar"}
            </Button>
            <Button variant="ghost" className="w-full rounded-2xl" onClick={() => setMode(mode === "login" ? "register" : "login")}>
              {mode === "login" ? "Ainda não tenho conta" : "Já tenho uma conta"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Link externo para compra do App Principal
const APP_SALES_LINK = "https://sua-pagina-de-vendas.com/app";
const BYPASS_PAYMENT = true; // DEFINIR COMO TRUE PARA TESTES: Desbloqueia app e calendário sem pagamento


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
  const currentCycleDay = cycleCalendar.find((day) => day.dateKey === todayKey) ?? cycleCalendar[0] ?? null;
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
    let sanitizedValue = value;
    if (key === "nome") sanitizedValue = sanitizeName(value as string) as Profile[K];
    if (key === "idade" || key === "altura" || key === "peso") {
      sanitizedValue = sanitizeNumber(value as string, key === "idade" ? 2 : 3) as Profile[K];
    }
    setProfile((prev) => ({ ...prev, [key]: sanitizedValue }));
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
        setCycleUnlocked(BYPASS_PAYMENT || Boolean(data.cycle_unlocked));
        setAppUnlocked(BYPASS_PAYMENT || Boolean(data.app_unlocked));
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
      <div className="min-h-screen grid place-items-center bg-[linear-gradient(180deg,#f3fff8_0%,#fffaf7_45%,#ffffff_100%)] p-6">
        <Card className="w-full max-w-md rounded-[28px] border-emerald-100 shadow-xl">
          <CardContent className="flex flex-col items-center gap-4 p-8">
            <div className="rounded-3xl bg-emerald-100 p-4 text-emerald-600"><Cloud className="h-8 w-8" /></div>
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
            Sua conta SlimDay está confirmada, mas ainda não identificamos a liberação do seu acesso.
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

      <div className="min-h-screen overflow-x-hidden bg-[linear-gradient(180deg,#f3fff8_0%,#fffaf7_42%,#ffffff_100%)] text-slate-900">
        <AnimatePresence>
          {showCongrats && (
            <motion.div initial={{ opacity: 0, y: 30, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.98 }}
              className="fixed right-4 top-4 z-50 max-w-sm rounded-3xl border border-emerald-200 bg-white p-4 shadow-2xl">
              <div className="flex items-start gap-3">
                <div className="rounded-2xl bg-emerald-100 p-2 text-emerald-600"><Trophy className="h-5 w-5" /></div>
                <div>
                  <div className="font-bold text-slate-900">Parabéns!</div>
                  <div className="text-sm text-slate-600">Você concluiu: {lastCompletedTitle}</div>
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
              Plano atualizado com sucesso ✨
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mx-auto max-w-7xl px-3 py-4 md:p-6">
          <div className="mb-6 grid gap-4 lg:grid-cols-[1.2fr,0.8fr]">
            <Card className="rounded-[20px] md:rounded-[28px] border-violet-100 shadow-lg lg:col-span-2">
              <CardContent className="grid gap-4 p-4 md:p-6 md:grid-cols-[1fr,0.9fr] md:items-center">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-sm font-semibold text-violet-700">
                    <Sparkles className="h-4 w-4" /> Mensagem do dia
                  </div>
                  <div className="mt-3 text-2xl font-black text-slate-900">{dayMessage.title}</div>
                  <div className="mt-2 text-sm leading-6 text-slate-600">{dayMessage.body}</div>
                </div>
                <div className="rounded-3xl border bg-white p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm font-semibold text-slate-500">Lembrete de constância</div>
                    <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold border">
                      {syncStatus === "saving" && <Cloud className="h-3.5 w-3.5 text-slate-500" />}
                      {syncStatus === "synced" && <Cloud className="h-3.5 w-3.5 text-emerald-600" />}
                      {syncStatus === "offline" && <CloudOff className="h-3.5 w-3.5 text-amber-600" />}
                      {syncStatus === "error" && <CloudOff className="h-3.5 w-3.5 text-rose-600" />}
                      <span>
                        {syncStatus === "saving" && "Sincronizando"}
                        {syncStatus === "synced" && "Salvo online"}
                        {syncStatus === "offline" && "Salvo localmente"}
                        {syncStatus === "error" && "Erro de sync"}
                        {syncStatus === "idle" && "Pronto"}
                      </span>
                    </div>
                  </div>
                  <div className="mt-2 text-base font-bold text-slate-900">{getReengagementMessage(inactiveDays)}</div>
                  <div className="mt-3 text-sm text-slate-600">
                    Última atividade registrada: <span className="font-semibold">{lastActiveDate.toLocaleDateString("pt-BR")}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-[20px] md:rounded-[28px] border-emerald-100 shadow-lg">
              <CardContent className="flex flex-col gap-4 p-4 md:gap-6 md:p-6 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">
                    <Sparkles className="h-4 w-4" /> SlimDay App
                  </div>
                  <h1 className="mt-3 text-2xl font-black tracking-tight text-slate-900 md:text-4xl">
                    Seu app com treino, alimentação e motivação no mesmo lugar
                  </h1>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 md:text-base">
                    Feito para mulheres com rotina corrida e também para quem tem mais tempo.
                  </p>
                  <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-600">
                    <span className="inline-flex items-center gap-2 rounded-full border bg-white px-3 py-1 font-medium">
                      <User className="h-4 w-4 text-slate-500" /> {profile.nome || userEmail}
                    </span>
                    <span className="inline-flex items-center gap-2 rounded-full border bg-white px-3 py-1 font-medium">
                      <Mail className="h-4 w-4 text-slate-500" /> {userEmail}
                    </span>
                  </div>
                </div>
                <div className="grid w-full max-w-sm gap-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-3xl bg-emerald-50 p-4">
                      <div className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Treino base</div>
                      <div className="mt-2 text-2xl font-black">até 20 min</div>
                    </div>
                    <div className="rounded-3xl bg-orange-50 p-4">
                      <div className="text-xs font-semibold uppercase tracking-wide text-orange-700">Refeições</div>
                      <div className="mt-2 text-2xl font-black">simples</div>
                    </div>
                  </div>
                  {/* Trial / promo banner */}
                  {!cycleUnlocked && (
                    <div className="rounded-2xl bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-200 p-3">
                      {isTrialActive ? (
                        <div className="flex items-center justify-between gap-2">
                          <div>
                            <div className="text-xs font-semibold text-emerald-700">✅ Teste grátis ativo: {trialDaysLeft} dia{trialDaysLeft !== 1 ? "s" : ""} restante{trialDaysLeft !== 1 ? "s" : ""}</div>
                            <div className="text-xs text-slate-600 mt-0.5">Garanta acesso permanente por R$ {PROMO_PRICE.toFixed(2).replace(".", ",")}</div>
                          </div>
                          <a href={PROMO_LINK} target="_blank" rel="noopener noreferrer">
                            <Button size="sm" className="rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs px-3">
                              <ShoppingCart className="h-3 w-3 mr-1" /> R$ {PROMO_PRICE.toFixed(2).replace(".", ",")}
                            </Button>
                          </a>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between gap-2">
                          <div>
                            <div className="text-xs font-semibold text-rose-700">🔒 Calendário premium bloqueado</div>
                            <div className="text-xs text-slate-600 mt-0.5">Seu teste grátis expirou</div>
                          </div>
                          <a href={currentPurchaseLink} target="_blank" rel="noopener noreferrer">
                            <Button size="sm" className="rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs px-3">
                              R$ {currentPrice.toFixed(2).replace(".", ",")}
                            </Button>
                          </a>
                        </div>
                      )}
                    </div>
                  )}
                  <Button variant="outline" className="rounded-2xl" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" /> Sair da conta
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-[20px] md:rounded-[28px] border-sky-100 shadow-lg">
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-slate-500">Progresso diário</div>
                    <div className="mt-1 text-3xl font-black text-slate-900">{progress}%</div>
                  </div>
                  <div className="rounded-2xl bg-sky-50 p-3 text-sky-600"><BarChart3 className="h-6 w-6" /></div>
                </div>
                <Progress value={progress} className="mt-4 h-3 rounded-full" />
                <div className="mt-4 text-sm text-slate-600">
                  Você concluiu <span className="font-bold text-slate-900">{completedCount}</span> de {totalCount} etapas do dia.
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-amber-50 p-4">
                    <div className="text-xs font-semibold uppercase tracking-wide text-amber-700">Streak atual</div>
                    <div className="mt-2 text-2xl font-black text-slate-900">{streak} dia{streak === 1 ? "" : "s"}</div>
                  </div>
                  <div className="rounded-2xl bg-violet-50 p-4">
                    <div className="text-xs font-semibold uppercase tracking-wide text-violet-700">Hoje</div>
                    <div className="mt-2 text-sm font-bold text-slate-900">{todayKey}</div>
                  </div>
                </div>
                <Button variant="outline" className="mt-4 w-full rounded-2xl" onClick={resetDay}>
                  <RefreshCcw className="mr-2 h-4 w-4" /> Reiniciar meu dia
                </Button>
              </CardContent>
            </Card>
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
                    <CardDescription>Altere os campos e o app reorganiza treino, refeições e foco semanal.</CardDescription>
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
              ) : (
                <Card className="rounded-[28px] border-orange-100 shadow-lg">
                  <CardContent className="p-4 md:p-6">
                    <div className="flex items-center gap-3">
                      <div className="rounded-2xl bg-orange-100 p-2 text-orange-600"><BadgeCheck className="h-5 w-5" /></div>
                      <div>
                        <div className="font-bold text-slate-900">Plano atualizado ✓</div>
                        <div className="text-sm text-slate-600">Seu plano já foi ajustado. Disponível para nova edição em breve.</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="space-y-4 md:space-y-6 min-w-0">
              <div className="grid grid-cols-2 gap-3 md:grid-cols-5 md:gap-4">
                <Card className="rounded-[20px] md:rounded-[24px] border-rose-100 shadow-sm">
                  <CardContent className="p-3 md:p-5">
                    <div className="flex items-center gap-2 md:gap-3">
                      <div className="rounded-xl md:rounded-2xl bg-rose-100 p-1.5 md:p-2 text-rose-600"><CalendarDays className="h-4 w-4 md:h-5 md:w-5" /></div>
                      <div><div className="text-xs md:text-sm text-slate-500">Calendário</div><div className="text-base md:text-xl font-bold">ciclo pessoal</div></div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="rounded-[20px] md:rounded-[24px] border-emerald-100 shadow-sm">
                  <CardContent className="p-3 md:p-5">
                    <div className="flex items-center gap-2 md:gap-3">
                      <div className="rounded-xl md:rounded-2xl bg-emerald-100 p-1.5 md:p-2 text-emerald-600"><Clock3 className="h-4 w-4 md:h-5 md:w-5" /></div>
                      <div><div className="text-xs md:text-sm text-slate-500">Treino base</div><div className="text-base md:text-xl font-bold">até 20 min</div></div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="rounded-[20px] md:rounded-[24px] border-orange-100 shadow-sm">
                  <CardContent className="p-3 md:p-5">
                    <div className="flex items-center gap-2 md:gap-3">
                      <div className="rounded-xl md:rounded-2xl bg-orange-100 p-1.5 md:p-2 text-orange-600"><Salad className="h-4 w-4 md:h-5 md:w-5" /></div>
                      <div><div className="text-xs md:text-sm text-slate-500">Refeições</div><div className="text-base md:text-xl font-bold">simples e rápidas</div></div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="rounded-[20px] md:rounded-[24px] border-sky-100 shadow-sm">
                  <CardContent className="p-3 md:p-5">
                    <div className="flex items-center gap-2 md:gap-3">
                      <div className="rounded-xl md:rounded-2xl bg-sky-100 p-1.5 md:p-2 text-sky-600"><BadgeCheck className="h-4 w-4 md:h-5 md:w-5" /></div>
                      <div><div className="text-xs md:text-sm text-slate-500">Check-list</div><div className="text-base md:text-xl font-bold">com motivação</div></div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="col-span-2 md:col-span-1 rounded-[20px] md:rounded-[24px] border-pink-100 shadow-sm">
                  <CardContent className="p-3 md:p-5">
                    <div className="flex items-center gap-2 md:gap-3">
                      <div className="rounded-xl md:rounded-2xl bg-pink-100 p-1.5 md:p-2 text-pink-600"><Target className="h-4 w-4 md:h-5 md:w-5" /></div>
                      <div><div className="text-xs md:text-sm text-slate-500">Objetivo</div><div className="text-base md:text-xl font-bold capitalize">{profile.objetivo === "mais energia" ? "Energia" : profile.objetivo}</div></div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="relative">
                  <div className="overflow-x-auto scrollbar-hide">
                    <TabsList className="inline-flex w-max gap-1 rounded-2xl bg-muted p-1">
                      <TabsTrigger value="hoje" className="whitespace-nowrap px-4">Hoje</TabsTrigger>
                      <TabsTrigger value="semana" className="whitespace-nowrap px-4">Semana</TabsTrigger>
                      <TabsTrigger value="treino" className="whitespace-nowrap px-4">Treino</TabsTrigger>
                      <TabsTrigger value="alimentacao" className="whitespace-nowrap px-4">Alimentação</TabsTrigger>
                      <TabsTrigger value="receitas" className="whitespace-nowrap px-4">Receitas</TabsTrigger>
                      <TabsTrigger value="calendario" className="whitespace-nowrap px-4">Ciclo+</TabsTrigger>
                      <TabsTrigger value="checklist" className="whitespace-nowrap px-4">Check-list</TabsTrigger>
                      <TabsTrigger value="alertas" className="whitespace-nowrap px-4">Alertas</TabsTrigger>
                      <TabsTrigger value="feedback" className="whitespace-nowrap px-4">Feedback</TabsTrigger>
                      {!isPlanVisible && (
                        <TabsTrigger value="editar-plano" className="whitespace-nowrap px-4">Editar plano</TabsTrigger>
                      )}
                    </TabsList>
                  </div>
                  <div className="pointer-events-none absolute right-0 top-0 h-full w-8 bg-gradient-to-l from-background to-transparent" />
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

                <TabsContent value="hoje" className="mt-4 space-y-4">
                  <Card className="rounded-[28px] border-emerald-100 shadow-lg">
                    <CardHeader>
                      <CardTitle className="text-2xl">Olá{profile.nome ? `, ${profile.nome}` : ""} 💚</CardTitle>
                      <CardDescription>{started ? "Seu plano foi ajustado com base no seu momento atual." : "Preencha seus dados para ver um plano mais personalizado."}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-5">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="rounded-3xl bg-emerald-50 p-5">
                          <div className="flex items-center gap-2 text-emerald-700"><Dumbbell className="h-4 w-4" /><span className="text-sm font-semibold">Treino de hoje</span></div>
                          <div className="mt-2 text-2xl font-black text-slate-900">{dailyMinutes} minutos</div>
                          <div className="mt-2 text-sm text-slate-600">Começando no nível <span className="font-semibold capitalize">{profile.nivel}</span>, com evolução progressiva e foco em constância.</div>
                          <Button className="mt-4 rounded-2xl" onClick={() => setActiveTab("treino")}><PlayCircle className="mr-2 h-4 w-4" /> Ver treino de hoje</Button>
                        </div>
                        <div className="rounded-3xl bg-orange-50 p-5">
                          <div className="flex items-center gap-2 text-orange-700"><Apple className="h-4 w-4" /><span className="text-sm font-semibold">Alimentação do dia</span></div>
                          <div className="mt-2 text-2xl font-black text-slate-900">4 sugestões</div>
                          <div className="mt-2 text-sm text-slate-600">Refeições fáceis de preparar e coerentes com sua rotina <span className="font-semibold capitalize">{profile.refeicao}</span>.</div>
                          <Button variant="outline" className="mt-4 rounded-2xl" onClick={() => setActiveTab("alimentacao")}><Utensils className="mr-2 h-4 w-4" /> Ver alimentação</Button>
                        </div>
                      </div>
                      <div className="grid gap-3 md:grid-cols-4">
                        {weekFocus.map((week, index) => (
                          <div key={week} className="rounded-2xl border bg-white p-4">
                            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Fase {index + 1}</div>
                            <div className="mt-2 font-bold text-slate-800">{week}</div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="semana" className="mt-4">
                  <Card className="rounded-[28px] border-slate-200 shadow-lg">
                    <CardHeader>
                      <CardTitle className="text-2xl">Seu cronograma semanal</CardTitle>
                      <CardDescription>Um plano simples para manter rotina com treino e alimentação alinhados.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {weekSchedule.map((item) => (
                        <div key={item.day} className="grid gap-3 rounded-3xl border bg-white p-5 md:grid-cols-[90px,1fr,1fr,120px] md:items-center">
                          <div className="font-black text-slate-900">{item.day}</div>
                          <div><div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Foco</div><div className="font-semibold text-slate-800">{item.foco}</div></div>
                          <div><div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Refeição-chave</div><div className="font-semibold text-slate-800">{item.refeicao}</div></div>
                          <div className="rounded-2xl bg-emerald-50 px-3 py-2 text-center font-bold text-emerald-700">{item.minutos} min</div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="treino" className="mt-4">
                  <Card className="rounded-[28px] border-emerald-100 shadow-lg">
                    <CardHeader>
                      <CardTitle className="text-2xl">Cronograma de treino</CardTitle>
                      <CardDescription>Com tutoriais, nível visual de dificuldade, cuidado de postura e explicação simples.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {workoutPlan.map((item, index) => (
                        <motion.div key={item.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className="rounded-3xl border bg-white p-5">
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <Badge className="rounded-full bg-emerald-100 text-emerald-700 hover:bg-emerald-100">{item.nivel}</Badge>
                                <Badge variant="outline" className="rounded-full">{item.minutos} min</Badge>
                                <Badge className={item.dificuldade === "leve" ? "rounded-full bg-sky-100 text-sky-700 hover:bg-sky-100" : item.dificuldade === "moderado" ? "rounded-full bg-amber-100 text-amber-700 hover:bg-amber-100" : "rounded-full bg-rose-100 text-rose-700 hover:bg-rose-100"}>{item.dificuldade}</Badge>
                                {item.youtubeId && (
                                  <Badge variant="secondary" className="rounded-full bg-rose-50 text-rose-600 border-rose-100">
                                    <Video className="mr-1 h-3 w-3" /> Vídeo disponível
                                  </Badge>
                                )}
                              </div>
                              <div className="mt-3 text-lg font-bold text-slate-900">{item.titulo}</div>
                              <div className="mt-1 text-sm text-slate-600">{item.descricao}</div>
                            </div>
                            <Button variant={completed[item.id] ? "secondary" : "default"} className="rounded-2xl" onClick={() => toggleCheck(item.id, item.titulo)}>
                              {completed[item.id] ? "Concluído" : "Marcar como feito"}
                            </Button>
                          </div>

                          {item.youtubeId && (
                            <div className="mt-4">
                              <details className="group overflow-hidden rounded-2xl border border-rose-100 bg-rose-50/30 transition-all">
                                <summary className="flex cursor-pointer list-none items-center justify-between p-4 text-sm font-bold text-rose-700 hover:bg-rose-50">
                                  <div className="flex items-center gap-2">
                                    <PlayCircle className="h-5 w-5" />
                                    <span>🎥 Ver execução em vídeo</span>
                                  </div>
                                  <div className="text-xs font-medium uppercase opacity-60 group-open:rotate-180 transition-transform">▼</div>
                                </summary>
                                <div className="p-4 pt-0">
                                  <div className="aspect-video w-full overflow-hidden rounded-xl border-2 border-white shadow-sm">
                                    <iframe 
                                      width="100%" 
                                      height="100%" 
                                      src={`https://www.youtube.com/embed/${item.youtubeId}`} 
                                      title={item.titulo}
                                      frameBorder="0" 
                                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                      allowFullScreen
                                      className="h-full w-full"
                                    ></iframe>
                                  </div>
                                </div>
                              </details>
                            </div>
                          )}
                          <div className="mt-4 grid gap-4 md:grid-cols-[1fr,0.9fr]">
                            <div className="rounded-2xl bg-slate-50 p-4">
                              <div className="mb-3 flex items-center gap-2 text-slate-700"><BookOpen className="h-4 w-4" /><span className="text-sm font-semibold">Como fazer</span></div>
                              <div className="grid gap-2">
                                {item.tutorial?.map((step, stepIndex) => (
                                  <div key={`${item.id}-step-${stepIndex}`} className="flex gap-3 text-sm text-slate-600">
                                    <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[11px] font-bold text-emerald-700">{stepIndex + 1}</div>
                                    <div>{step}</div>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div className="space-y-3">
                              <div className="rounded-2xl border bg-white p-4">
                                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Explicação simples</div>
                                <div className="mt-2 text-sm font-medium leading-6 text-slate-700">{item.explicacaoSimples}</div>
                              </div>
                              <div className="rounded-2xl border bg-white p-4">
                                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Cuidado importante</div>
                                <div className="mt-2 text-sm font-medium leading-6 text-slate-700">{item.cuidado}</div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="alimentacao" className="mt-4">
                  <Card className="rounded-[28px] border-orange-100 shadow-lg">
                    <CardHeader>
                      <CardTitle className="text-2xl">Cronograma de alimentação</CardTitle>
                      <CardDescription>Sugestões fáceis, rápidas e melhores para encaixar no dia a dia.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {mealPlan.map((item, index) => (
                        <motion.div key={item.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className="rounded-3xl border bg-white p-5">
                          {recipeImages[item.id] && (
                            <img src={recipeImages[item.id]} alt={item.titulo} loading="lazy" width={512} height={512} className="w-full h-40 object-cover rounded-2xl mb-4" />
                          )}
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                              <Badge variant="outline" className="rounded-full">{item.categoria}</Badge>
                              <div className="mt-3 text-lg font-bold text-slate-900">{item.titulo}</div>
                              <div className="mt-1 text-sm text-slate-600">{item.descricao}</div>
                            </div>
                            <Button variant={completed[item.id] ? "secondary" : "default"} className="rounded-2xl" onClick={() => toggleCheck(item.id, item.titulo)}>
                              {completed[item.id] ? "Feito" : "Adicionar ao meu dia"}
                            </Button>
                          </div>
                          {item.receita && (
                            <details className="mt-4">
                              <summary className="cursor-pointer text-sm font-semibold text-emerald-700">📖 Ver receita completa</summary>
                              <div className="mt-3 rounded-2xl border bg-emerald-50 p-4 space-y-3">
                                <div>
                                  <div className="font-semibold text-slate-800 text-sm">🛒 Ingredientes</div>
                                  <ul className="mt-1 list-disc pl-4 text-sm text-slate-600 space-y-1">
                                    {item.receita.ingredientes.map((ing, i) => <li key={i}>{ing}</li>)}
                                  </ul>
                                </div>
                                <div>
                                  <div className="font-semibold text-slate-800 text-sm">👩‍🍳 Modo de preparo</div>
                                  <div className="mt-1 space-y-2">
                                    {item.receita.preparo.map((step, i) => (
                                      <div key={i} className="flex gap-2 text-sm text-slate-600">
                                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-200 text-[11px] font-bold text-emerald-800">{i + 1}</span>
                                        <span>{step}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </details>
                          )}
                        </motion.div>
                      ))}
                    </CardContent>
                  </Card>
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
                                <summary className="cursor-pointer text-sm font-semibold text-emerald-700">📖 Ver receita completa</summary>
                                <div className="mt-3 rounded-2xl border bg-orange-50 p-4 space-y-3">
                                  <div>
                                    <div className="font-semibold text-slate-800 text-sm">🛒 Ingredientes</div>
                                    <ul className="mt-1 list-disc pl-4 text-sm text-slate-600 space-y-1">
                                      {recipe.receita.ingredientes.map((ing, i) => <li key={i}>{ing}</li>)}
                                    </ul>
                                  </div>
                                  <div>
                                    <div className="font-semibold text-slate-800 text-sm">👩‍🍳 Modo de preparo</div>
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
                      {!canAccessCalendar ? (
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
                              <div className="mb-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 p-3">
                                <div className="text-xs font-semibold text-emerald-700">🎁 Período de teste: {trialDaysLeft} dia{trialDaysLeft !== 1 ? "s" : ""} restante{trialDaysLeft !== 1 ? "s" : ""}</div>
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
                              className="mt-3 flex h-10 w-full items-center justify-center rounded-2xl border border-emerald-200 bg-emerald-50 px-4 text-sm font-semibold text-emerald-700 hover:bg-emerald-100"
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
                          <div className="grid gap-4 md:grid-cols-3">
                            <div>
                              <label className="text-sm font-medium text-slate-700">Último início da menstruação</label>
                              <input type="date" className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 outline-none focus:border-emerald-400" value={profile.ultimoCiclo || ""} onChange={(e) => updateProfile("ultimoCiclo", e.target.value)} />
                            </div>
                            <div>
                              <label className="text-sm font-medium text-slate-700">Duração do ciclo</label>
                              <input type="number" className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 outline-none focus:border-emerald-400" value={profile.duracaoCiclo || "28"} onChange={(e) => updateProfile("duracaoCiclo", e.target.value)} placeholder="28 dias" />
                            </div>
                            <div>
                              <label className="text-sm font-medium text-slate-700">Dias de menstruação</label>
                              <input type="number" className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 outline-none focus:border-emerald-400" value={profile.duracaoMenstruacao || "5"} onChange={(e) => updateProfile("duracaoMenstruacao", e.target.value)} placeholder="5 dias" />
                            </div>
                          </div>

                          <div className="grid gap-5 lg:grid-cols-[1.2fr,0.8fr]">
                            <div className="space-y-4">
                              <div className="rounded-3xl border bg-white p-5">
                                <div className="mb-4 flex flex-wrap items-center gap-2 text-xs font-semibold">
                                  <span className="rounded-full bg-rose-500 px-3 py-1 text-white">Menstruação</span>
                                  <span className="rounded-full bg-sky-400 px-3 py-1 text-white">Final da menstruação</span>
                                  <span className="rounded-full bg-violet-500 px-3 py-1 text-white">Ovulação</span>
                                  <span className="rounded-full bg-fuchsia-100 px-3 py-1 text-fuchsia-700">Janela fértil</span>
                                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-700">Hoje</span>
                                </div>
                                {cycleCalendar.length === 0 ? (
                                  <div className="rounded-2xl bg-slate-50 p-5 text-sm text-slate-600">Preencha a data do último ciclo para gerar seu calendário personalizado.</div>
                                ) : (
                                  <div className="grid grid-cols-7 gap-1.5">
                                    {["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"].map((d) => (
                                      <div key={d} className="text-center text-[10px] font-bold uppercase text-slate-400 py-1">{d}</div>
                                    ))}
                                    {(() => {
                                      if (cycleCalendar.length === 0) return null;
                                      const firstDayKey = cycleCalendar[0]?.dateKey;
                                      if (!firstDayKey) return null;
                                      
                                      const firstDate = new Date(`${firstDayKey}T12:00:00`);
                                      if (isNaN(firstDate.getTime())) return null;
                                      
                                      const startDow = firstDate.getDay();
                                      const blanks = Array.from({ length: startDow }, (_, i) => (
                                        <div key={`blank-${i}`} className="aspect-square" />
                                      ));
                                      const days = cycleCalendar.map((day) => {
                                        const isToday = day.dateKey === todayKey;
                                        return (
                                          <div key={day.dateKey} className={`aspect-square rounded-xl border flex flex-col items-center justify-center relative ${isToday ? "" : getPhaseColor(day.phase)}`}
                                            style={isToday ? {
                                              background: "linear-gradient(135deg, #f9a8d4 0%, #fbcfe8 50%, #fce7f3 100%)",
                                              border: "2px solid #ec4899",
                                              color: "#831843",
                                            } : undefined}
                                          >
                                            <div className="text-base font-bold leading-none">{day.dayNumber}</div>
                                            {isToday && <div className="text-[8px] font-bold mt-0.5">HOJE</div>}
                                          </div>
                                        );
                                      });
                                      return [...blanks, ...days];
                                    })()}
                                  </div>
                                )}
                              </div>

                              <div className="rounded-3xl border bg-white p-5">
                                <div className="text-sm font-semibold text-slate-500">Fase de hoje</div>
                                <div className="mt-2 text-xl font-bold text-slate-900">{currentCycleDay ? getPhaseTitle(currentCycleDay.phase) : "Aguardando dados"}</div>
                                <div className="mt-2 text-sm text-slate-600">{currentCycleDay ? currentCycleDay.label : "Adicione seus dados para ver a estimativa do seu ciclo."}</div>
                                <div className="mt-3 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">Atualizando seu ciclo com frequência, o calendário se ajusta melhor ao seu padrão.</div>
                              </div>

                              <div className="rounded-3xl border bg-white p-5">
                                <div className="text-sm font-semibold text-slate-500">TPM e previsão</div>
                                <div className="mt-2 text-sm leading-6 text-slate-600">O app usa a média do seu ciclo para estimar fases. Essas previsões servem como apoio e não substituem avaliação médica.</div>
                              </div>
                            </div>

                            <div className="space-y-4">
                              <div className="rounded-3xl border bg-white p-5">
                                <div className="text-sm font-semibold text-slate-500">Docinhos fit para essa fase</div>
                                <div className="mt-3 space-y-3">
                                  {cycleTreats.map((item, index) => (
                                    <div key={`${item.titulo}-${index}`} className="rounded-2xl bg-emerald-50 overflow-hidden">
                                      {recipeImages[item.titulo] && (
                                        <img src={recipeImages[item.titulo]} alt={item.titulo} loading="lazy" width={512} height={512} className="w-full h-32 object-cover" />
                                      )}
                                      <div className="p-4">
                                        <div className="font-semibold text-slate-900">{item.titulo}</div>
                                        <div className="mt-1 text-sm leading-6 text-slate-600">{item.descricao}</div>
                                        {(item as any).receita && (
                                          <details className="mt-2">
                                            <summary className="cursor-pointer text-sm font-semibold text-emerald-700">📖 Ver receita</summary>
                                            <div className="mt-2 rounded-xl bg-white p-3 space-y-2 border">
                                              <div>
                                                <div className="font-semibold text-slate-800 text-xs">🛒 Ingredientes</div>
                                                <ul className="mt-1 list-disc pl-4 text-xs text-slate-600 space-y-0.5">
                                                  {((item as any).receita as RecipeDetail).ingredientes.map((ing: string, i: number) => <li key={i}>{ing}</li>)}
                                                </ul>
                                              </div>
                                              <div>
                                                <div className="font-semibold text-slate-800 text-xs">👩‍🍳 Preparo</div>
                                                <div className="mt-1 space-y-1">
                                                  {((item as any).receita as RecipeDetail).preparo.map((step: string, i: number) => (
                                                    <div key={i} className="flex gap-2 text-xs text-slate-600">
                                                      <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-200 text-[10px] font-bold text-emerald-800">{i + 1}</span>
                                                      <span>{step}</span>
                                                    </div>
                                                  ))}
                                                </div>
                                              </div>
                                            </div>
                                          </details>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="checklist" className="mt-4">
                  <Card className="rounded-[28px] border-sky-100 shadow-lg">
                    <CardHeader>
                      <CardTitle className="text-2xl">Check-list diário</CardTitle>
                      <CardDescription>Cada etapa concluída gera uma pequena comemoração para manter motivação.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {checklistItems.map((item) => (
                        <div key={item.id} className="flex items-center justify-between rounded-2xl border bg-white p-4">
                          <div className="flex items-center gap-3">
                            <Checkbox checked={!!completed[item.id]} onCheckedChange={() => toggleCheck(item.id, item.titulo)} />
                            <div>
                              <div className="font-semibold text-slate-900">{item.titulo}</div>
                              <div className="text-sm capitalize text-slate-500">{item.tipo}</div>
                            </div>
                          </div>
                          {completed[item.id] ? <CheckCircle2 className="h-5 w-5 text-emerald-500" /> : null}
                        </div>
                      ))}
                      <div className="grid gap-4 md:grid-cols-3">
                        <div className="rounded-3xl bg-[linear-gradient(135deg,#fff7ed_0%,#ffffff_100%)] p-5">
                          <div className="flex items-center gap-2 text-orange-600"><Flame className="h-4 w-4" /><span className="text-sm font-semibold">Mensagem do dia</span></div>
                          <div className="mt-2 text-lg font-bold text-slate-900">{getCongratsMessage(completedCount)}</div>
                          <div className="mt-2 text-sm text-slate-600">Você concluiu {completedCount} de {totalCount} etapas hoje.</div>
                        </div>
                        <div className="rounded-3xl bg-sky-50 p-5">
                          <div className="flex items-center gap-2 text-sky-700"><Waves className="h-4 w-4" /><span className="text-sm font-semibold">Hábito de água</span></div>
                          <div className="mt-2 text-2xl font-black text-slate-900">8 copos</div>
                          <div className="mt-2 text-sm text-slate-600">Meta visual para o dia todo.</div>
                        </div>
                        <div className="rounded-3xl bg-violet-50 p-5">
                          <div className="flex items-center gap-2 text-violet-700"><Moon className="h-4 w-4" /><span className="text-sm font-semibold">Recuperação</span></div>
                          <div className="mt-2 text-2xl font-black text-slate-900">sono + pausa</div>
                          <div className="mt-2 text-sm text-slate-600">Seu progresso também depende de descanso.</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="alertas" className="mt-4">
                  <Card className="rounded-[28px] border-violet-100 shadow-lg">
                    <CardHeader>
                      <CardTitle className="text-2xl">Alertas e lembretes</CardTitle>
                      <CardDescription>Mensagens internas para motivar retomada, constância e conquistas.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {notifications.length === 0 ? (
                        <div className="rounded-3xl border bg-white p-5 text-sm text-slate-600">Seus alertas vão aparecer aqui conforme você usa o app e conclui etapas.</div>
                      ) : (
                        notifications.map((item) => (
                          <div key={item.id} className="rounded-3xl border bg-white p-5">
                            <div className="flex items-center justify-between gap-3">
                              <Badge className="rounded-full bg-violet-100 text-violet-700 hover:bg-violet-100">{item.tone}</Badge>
                              <span className="text-xs font-semibold text-slate-500">{new Date(item.createdAt).toLocaleString("pt-BR")}</span>
                            </div>
                            <div className="mt-3 font-bold text-slate-900">{item.title}</div>
                            <div className="mt-1 text-sm leading-6 text-slate-600">{item.body}</div>
                          </div>
                        ))
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="feedback" className="mt-4">
                  <Card className="rounded-[28px] border-pink-100 shadow-lg">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-pink-100">
                          <MessageCircle className="h-6 w-6 text-pink-600" />
                        </div>
                        <div>
                          <CardTitle className="text-2xl">Fale com a gente 💕</CardTitle>
                          <CardDescription>Sua opinião é muito importante para nós!</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-5">
                      <div className="rounded-3xl bg-gradient-to-br from-pink-50 to-rose-50 p-5">
                        <div className="text-sm leading-6 text-slate-700">
                          Queremos ouvir você! 🌸 Tem alguma sugestão, ideia nova ou encontrou algo que não funcionou bem?
                          Mande pra gente — cada feedback nos ajuda a melhorar o SlimDay pra você.
                        </div>
                      </div>

                      <FeedbackForm userEmail={profile?.nome || ""} />

                      <div className="rounded-3xl border bg-white p-5">
                        <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
                          <Mail className="h-4 w-4" /> Contato direto
                        </div>
                        <div className="mt-2 text-sm text-slate-600">
                          Se preferir, envie um e-mail diretamente para:
                        </div>
                        <a
                          href="mailto:atendimentoslimday@gmail.com"
                          className="mt-2 inline-flex items-center gap-2 rounded-2xl bg-pink-50 px-4 py-2 text-sm font-semibold text-pink-700 transition-colors hover:bg-pink-100"
                        >
                          <Mail className="h-4 w-4" />
                          atendimentoslimday@gmail.com
                        </a>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
                <Card className="rounded-[20px] md:rounded-[28px] border-indigo-100 shadow-lg">
                  <CardContent className="p-4 md:p-6">
                    <div className="flex items-center gap-2 text-indigo-700"><Sparkles className="h-4 w-4" /><span className="text-sm font-semibold">Motivação diária</span></div>
                    <div className="mt-2 font-bold text-slate-900">{dayMessage.title}</div>
                    <div className="mt-1 text-sm text-slate-600">{dayMessage.body}</div>
                  </CardContent>
                </Card>
                <Card className="rounded-[20px] md:rounded-[28px] border-yellow-100 shadow-lg">
                  <CardContent className="p-4 md:p-6">
                    <div className="flex items-center gap-2 text-yellow-700"><Sun className="h-4 w-4" /><span className="text-sm font-semibold">Manhã</span></div>
                    <div className="mt-2 font-bold text-slate-900">Comece leve</div>
                    <div className="mt-1 text-sm text-slate-600">Café da manhã simples + ativação curta para entrar no ritmo.</div>
                  </CardContent>
                </Card>
                <Card className="rounded-[20px] md:rounded-[28px] border-emerald-100 shadow-lg">
                  <CardContent className="p-4 md:p-6">
                    <div className="flex items-center gap-2 text-emerald-700"><CalendarDays className="h-4 w-4" /><span className="text-sm font-semibold">Constância</span></div>
                    <div className="mt-2 font-bold text-slate-900">Melhor que perfeição</div>
                    <div className="mt-1 text-sm text-slate-600">Mesmo nos dias corridos, seu plano continua possível.</div>
                  </CardContent>
                </Card>
                <Card className="rounded-[20px] md:rounded-[28px] border-pink-100 shadow-lg">
                  <CardContent className="p-4 md:p-6">
                    <div className="flex items-center gap-2 text-pink-600"><Heart className="h-4 w-4" /><span className="text-sm font-semibold">Lembrete SlimDay</span></div>
                    <div className="mt-2 font-bold text-slate-900">Você não precisa ter um dia perfeito para continuar.</div>
                    <div className="mt-1 text-sm text-slate-600">Seu plano foi pensado para funcionar nos dias corridos e também quando você tiver mais tempo.</div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
