import { PlanItem, DailyMessage, Profile, FitnessLevel } from "./types";

export const tutorialMap: Record<string, string[]> = {
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
  "Elevação pélvica": ["Deite-se de costas com joelhos dobrados.", "Suba o quadril contraindo bem os glúteos.", "Desça devagar e repita."],
  "Prancha de joelhos": ["Apoie os antebraços e os joelhos no chão.", "Mantenha o corpo reto e abdômen firme.", "Segure o tempo indicado."],
  "Polichinelo adaptado": ["Abra uma perna para o lado enquanto sobe os braços.", "Feche e repita para o outro lado.", "Mantenha um ritmo constante sem impacto."],
  "4 apoios (Glúteos)": ["Fique na posição de 4 apoios.", "Suba uma perna dobrada em direção ao teto.", "Contraia o glúteo no topo e desça sem encostar o joelho."],
  "Mobilidade de escápulas": ["Fique em 4 apoios.", "Afunde o peito unindo as escápulas.", "Empurre o chão arredondando as costas."],
  "Mountain Climber": ["Na posição de prancha alta.", "Leve um joelho em direção ao peito rapidamente.", "Alterne as pernas como se estivesse correndo."],
  "Tríceps no banco": ["Apoie as mãos em um banco ou cadeira estável.", "Desça o corpo dobrando os cotovelos para trás.", "Suba empurrando com força."],
  "Stiff": ["Pés na largura do quadril, segurando peso (garrafa).", "Desça o tronco com as costas retas e joelhos quase esticados.", "Sinta alongar atrás da coxa e suba."],
  "Prancha Lateral": ["Deite-se de lado apoiando um antebraço.", "Suba o quadril mantendo o corpo reto.", "Segure sem deixar o quadril cair."],
  "Agachamento Sumô": ["Pés afastados além do quadril, pontas para fora.", "Desça mantendo as costas retas e joelhos para fora.", "Suba contraindo glúteos e coxas."],
  "Remada alta": ["Segure uma garrafa ou peso com as duas mãos.", "Puxe em direção ao queixo com os cotovelos para cima.", "Desça com controle."],
  "Burpee completo": ["Agache, coloque as mãos no chão e pule para trás.", "Desça o peito no chão, suba, pule para frente.", "Finalize com um salto batendo as mãos acima da cabeça."],
  "Afundo Búlgaro": ["Um pé apoiado atrás em um banco ou cadeira.", "Desça a perna da frente até o joelho quase tocar o chão.", "Suba com força total no calcanhar da frente."],
  "V-ups": ["Deite-se de costas com pernas e braços esticados.", "Suba o tronco e as pernas ao mesmo tempo tentando tocar os pés.", "Desça devagar voltando à posição inicial."],
  "Agachamento com Salto Sumô": ["Faça o agachamento sumô e suba com um salto explosivo.", "Pouse suave e já inicie a próxima repetição.", "Mantenha o controle do movimento."],
  "Flexão de braços": ["Mãos no chão além dos ombros, pernas esticadas.", "Desça o peito até quase encostar no chão.", "Suba empurrando o chão com firmeza."],
  "Prancha sobe e desce": ["Inicie na prancha de antebraços.", "Suba para a prancha alta uma mão de cada vez.", "Desça novamente para os antebraços e repita."],
};

export const exerciseMeta: Record<string, Partial<PlanItem>> = {
  "Finisher SlimDay": { dificuldade: "intenso", cuidado: "Feche forte, mas sem sacrificar a execução.", explicacaoSimples: "É o bloco final para terminar com sensação de missão cumprida." },
  "Elevação pélvica": { dificuldade: "leve", cuidado: "Não force a lombar, suba usando os glúteos.", explicacaoSimples: "É levantar o quadril do chão e apertar o bumbum." },
  "Prancha de joelhos": { dificuldade: "leve", cuidado: "Mantenha o pescoço alinhado com a coluna.", explicacaoSimples: "É ficar paradinha apoiada nos braços e joelhos." },
  "Polichinelo adaptado": { dificuldade: "leve", cuidado: "Se sentir dor no ombro, não suba os braços até o topo.", explicacaoSimples: "É o polichinelo sem pulo, um passo de cada vez." },
  "4 apoios (Glúteos)": { dificuldade: "leve", cuidado: "Não deixe a barriga cair, mantenha firme.", explicacaoSimples: "É chutar o teto estando de joelhos no chão." },
  "Mobilidade de escápulas": { dificuldade: "leve", cuidado: "Mova apenas os ombros, não os braços.", explicacaoSimples: "É 'afundar' e 'empurrar' o peito para soltar os ombros." },
  "Mountain Climber": { dificuldade: "moderado", cuidado: "Não eleve muito o quadril, mantenha-o baixo.", explicacaoSimples: "É como se estivesse subindo uma montanha no chão." },
  "Tríceps no banco": { dificuldade: "moderado", cuidado: "Mantenha as costas próximas ao banco.", explicacaoSimples: "É descer e subir usando a força do 'tchau'." },
  "Stiff": { dificuldade: "moderado", cuidado: "Mantenha a coluna reta o tempo todo.", explicacaoSimples: "É descer o corpo resto para alongar atrás das pernas." },
  "Prancha Lateral": { dificuldade: "moderado", cuidado: "Não deixe o quadril cair em direção ao chão.", explicacaoSimples: "É ficar de ladinho tirando o corpo do chão." },
  "Agachamento Sumô": { dificuldade: "moderado", cuidado: "Mantenha os joelhos na direção dos dedos dos pés.", explicacaoSimples: "É o agachamento com as pernas mais abertas." },
  "Remada alta": { dificuldade: "moderado", cuidado: "Não levante os ombros até as orelhas.", explicacaoSimples: "É puxar o peso até o queixo como um remador." },
  "Burpee completo": { dificuldade: "intenso", cuidado: "Cuidado no impacto do pulo ao voltar.", explicacaoSimples: "O exercício mais completo: chão, peito e salto." },
  "Afundo Búlgaro": { dificuldade: "intenso", cuidado: "O tronco pode inclinar levemente para frente.", explicacaoSimples: "Afundo com um pé elevado, o 'terror' das pernas." },
  "V-ups": { dificuldade: "intenso", cuidado: "Tente subir o tronco e pernas juntos.", explicacaoSimples: "Um abdominal 'canivete' para fechar o corpo." },
  "Agachamento com Salto Sumô": { dificuldade: "intenso", cuidado: "Aterrisse suave com as pontas dos pés primeiro.", explicacaoSimples: "Agachamento aberto com salto para explosão." },
  "Flexão de braços": { dificuldade: "intenso", cuidado: "Mantenha o corpo como uma tábua, sem cair.", explicacaoSimples: "A clássica flexão para braços e peito." },
  "Prancha sobe e desce": { dificuldade: "intenso", cuidado: "Mantenha o quadril o mais parado possível.", explicacaoSimples: "É revezar entre apoiar as mãos e os cotovelos." },
};

export const dailyMessages: DailyMessage[] = [
  { title: "Todo dia conta", body: "Mesmo uma rotina curta hoje já ajuda você a continuar no caminho certo." },
  { title: "Seu ritmo importa", body: "Você não precisa fazer tudo de uma vez. O importante é voltar e manter constância." },
  { title: "Começar leve ainda é começar", body: "Treinos curtos e refeições simples também constroem resultado quando viram hábito." },
  { title: "Seu progresso gosta de repetição", body: "Quanto mais você volta, mais natural sua nova rotina fica." },
  { title: "Hoje é uma nova chance", body: "Retomar o plano hoje ajuda a manter o progresso mais vivo e consistente." },
  { title: "Pequenas vitórias acumulam", body: "Cada etapa concluída fortalece sua confiança e facilita o próximo passo." },
  { title: "Voltar faz diferença", body: "Ficar muitos dias sem abrir o plano pode enfraquecer seu ritmo. Recomeçar hoje já recoloca você no eixo." },
];

export function buildWorkoutPlan(profile: Profile): PlanItem[] {
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
      dificuldade: (meta?.dificuldade as any) ?? "leve",
      cuidado: meta?.cuidado ?? "Respeite seus limites e mantenha boa postura.",
      explicacaoSimples: meta?.explicacaoSimples ?? "Movimento simples para ajudar no seu progresso.",
    };
  });
}

export function buildWeekFocus(profile: Profile) {
  const map: Record<string, string[]> = {
    emagrecer: ["Semana 1: adaptação e rotina", "Semana 2: mais consistêncian", "Semana 3: progressão leve", "Semana 4: ritmo firme"],
    definir: ["Semana 1: base e ativação", "Semana 2: força leve", "Semana 3: progressão muscular", "Semana 4: intensidade controlada"],
    "mais energia": ["Semana 1: ativação diária", "Semana 2: ganho de disposição", "Semana 3: ritmo estável", "Semana 4: sensação de leveza"],
    "criar constancia": ["Semana 1: começar fácil", "Semana 2: manter hábito", "Semana 3: reforçar rotina", "Semana 4: consolidar constância"],
  };
  return map[profile.objetivo] || map.emagrecer;
}

export function buildWeekSchedule(profile: Profile) {
  const mins = Math.min(Math.max(Number(profile.tempo), 10), 20);
  const focusMap: Record<string, string[]> = {
    emagrecer: ["Ativação", "Pernas", "Core", "Metabólico", "Mobilidade", "Circuito leve", "Recuperação"],
    definir: ["Força leve", "Glúteos", "Braços", "Core", "Pernas", "Resistência", "Alongamento"],
    "mais energia": ["Despertar corpo", "Movimento", "Postura", "Ritmo", "Ativação", "Respiração", "Leveza"],
    "criar constancia": ["Começar fácil", "Repetir hábito", "Corpo todo", "Manter ritmo", "Postura", "Leve circuito", "Descanso ativo"],
  };
  const foodMap: Record<string, string[]> = {
    corrida: ["Marmita simples", "Lanche rápido", "Café prático", "Jantar leve", "Snack fácil", "Prato pronto caseiro", "Refeição leve"],
    moderada: ["Prato equilibrado", "Lanche de fruta", "Almoço simples", "Jantar rápido", "Café reforçado", "Omelete prática", "Sopa leve"],
    flexivel: ["Receita caseira", "Wrap leve", "Salada completa", "Lanche de iogurte", "Almoço balanceado", "Jantar funcional", "Refeição livre controlada"],
  };
  const days = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
  const currentFocus = focusMap[profile.objetivo] || focusMap.emagrecer;
  const currentFood = foodMap[profile.rotina] || foodMap.moderada;

  return days.map((day, index) => ({
    day,
    foco: currentFocus[index],
    treino: `${mins} min de ${currentFocus[index].toLowerCase()}`,
    refeicao: currentFood[index],
    minutos: mins,
  }));
}

export function getCongratsMessage(count: number) {
  if (count < 3) return "Boa! Cada etapa concluída fortalece sua nova rotina.";
  if (count < 6) return "Você está indo muito bem. O importante é manter o ritmo.";
  if (count < 10) return "Parabéns! Sua constância já está fazendo diferença.";
  return "Incrível! Você está construindo uma rotina de verdade.";
}
