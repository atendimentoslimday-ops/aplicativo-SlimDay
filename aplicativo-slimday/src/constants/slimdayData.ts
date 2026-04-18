import { 
  Profile, 
  PlanItem, 
  PlanItemWithRecipe, 
  MealStyle, 
  DailyMessage, 
  CyclePhase,
  RecipeDetail 
} from "../types/slimday";

// Configurações de Segurança (Protegidas por Env Vars)
export const ADMIN_EMAILS = (import.meta.env.VITE_ADMIN_EMAILS || "atendimentoslimday@gmail.com").split(",");
export const DEV_MASTER_KEY = import.meta.env.VITE_MASTER_KEY || "-=x22450-.çA=-//\\"; 
export const BYPASS_PAYMENT = import.meta.env.VITE_BYPASS_PAYMENT === "true" || false;

export const defaultProfile: Profile = {
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

export const DAILY_MESSAGES: DailyMessage[] = [
  { title: "Todo dia conta", body: "Mesmo uma rotina curta hoje já ajuda você a continuar no caminho certo." },
  { title: "Seu ritmo importa", body: "Você não precisa fazer tudo de uma vez. O importante é voltar e manter constância." },
  { title: "Começar leve ainda é começar", body: "Treinos curtos e refeições simples também constroem resultado quando viram hábito." },
  { title: "Seu progresso gosta de repetição", body: "Quanto mais você volta, mais natural sua nova rotina fica." },
  { title: "Hoje é uma nova chance", body: "Retomar o plano hoje ajuda a manter o progresso mais vivo e consistente." },
  { title: "Pequenas vitórias acumulam", body: "Cada etapa concluída fortalece sua confiança e facilita o próximo passo." },
  { title: "Voltar faz diferença", body: "Ficar muitos dias sem abrir o plano pode enfraquecer seu ritmo. Recomeçar hoje já recoloca você no eixo." },
];

export const phaseTreats: Record<CyclePhase, { titulo: string; descricao: string; receita: RecipeDetail }[]> = {
  menstruação: [
    { 
      titulo: "Brigadeiro de Whey Gourmet", 
      descricao: "O magnésio do cacau relaxa a musculatura e reduz cólicas, enquanto o whey garante saciedade.",
      receita: {
        ingredientes: [
          "1 dose (30g) de Whey Protein de chocolate ou baunilha", 
          "1 colher de sopa de cacau 100% puro", 
          "2 colheres de leite em pó desnatado", 
          "30ml de água mineral quente (não fervendo)"
        ],
        preparo: [
          "Em um bowl pequeno, misture bem o Whey, o cacau e o leite em pó até ficar uma farinha homogênea.",
          "Adicione a água quente aos poucos (uma colher por vez), mexendo vigorosamente até atingir a consistência de brigadeiro de colher.",
          "Dica Elite: Leve ao congelador por 10 minutos para ganhar firmeza. Se quiser enrolar, adicione um pouco mais de leite em pó."
        ]
      }
    },
    { 
      titulo: "Tâmaras Recheadas com Pasta de Amendoim", 
      descricao: "Energia estável e magnésio para combater a fadiga e a compulsão por doces típica desta fase.",
      receita: {
        ingredientes: [
          "4 tâmaras grandes (tipo Jumbo/Medjool)", 
          "1 colher de sopa cheia de pasta de amendoim integral", 
          "Uma pitada de flor de sal ou sal marinho",
          "Cacau em pó para polvilhar"
        ],
        preparo: [
          "Faça um corte lateral nas tâmaras e remova o caroço com cuidado.",
          "Recheie o centro de cada uma com a pasta de amendoim e adicione a pitada de sal por cima (isso realça o sabor doce).",
          "Finalize polvilhando cacau em pó. Sirva gelado para uma textura mais firme."
        ]
      }
    },
  ],
  menstruação_final: [
    { 
      titulo: "Mousse Cremoso de Maracujá e Chia", 
      descricao: "Calmante natural para a transição hormonal, rico em fibras para desinchar.",
      receita: {
        ingredientes: [
          "1 pote (170g) de iogurte natural desnatado sem açúcar", 
          "Polpa fresca de 1 maracujá grande (com sementes)", 
          "1 colher de sobremesa de sementes de chia", 
          "Adoçante Stevia ou Xilitol a gosto"
        ],
        preparo: [
          "Em um recipiente, bata o iogurte com metade da polpa de maracujá e o adoçante até ficar aerado.",
          "Misture a chia suavemente e coloque o restante da polpa por cima para decorar.",
          "Deixe descansar na geladeira por pelo menos 2 horas. A chia vai hidratar e criar a textura de mousse."
        ]
      }
    },
  ],
  fértil: [
    { 
      titulo: "Chia Pudding de Coco com Manga", 
      descricao: "Tropical e refrescante para acompanhar seu pico de energia e disposição.",
      receita: {
        ingredientes: [
          "200ml de leite de coco light ou bebida de amêndoas", 
          "2 colheres de sopa de sementes de chia", 
          "1/2 manga Palmer madura cortada em cubos pequenos", 
          "Gotas de essência de baunilha"
        ],
        preparo: [
          "Misture o leite vegetal, a baunilha e a chia em um copo ou pote de vidro.",
          "Mexa bem e deixe na geladeira por 4 horas (ou prepare na noite anterior).",
          "Na hora de servir, adicione os cubos de manga fresca por cima. O contraste de texturas é incrível."
        ]
      }
    },
  ],
  ovulação: [
    { 
      titulo: "Sorbet Estimulante de Banana e Canela", 
      descricao: "Doce térmico que auxilia na saciedade e controle glicêmico durante o pico hormonal.",
      receita: {
        ingredientes: [
          "2 bananas médias congeladas (retire a casca antes de congelar)", 
          "1 colher de chá de canela em pó premium", 
          "1/2 scoop de whey de baunilha (opcional para mais proteína)"
        ],
        preparo: [
          "Coloque as bananas congeladas no processador ou liquidificador potente.",
          "Bata no modo pulsar até que as rodelas se transformem em um creme ultra aveludado.",
          "Adicione a canela e o whey, bata por mais 10 segundos e sirva imediatamente como um sorvete italiano."
        ]
      }
    },
  ],
  neutro: [
    { 
      titulo: "Trufa Funcional de Cacau e Amêndoas", 
      descricao: "Snack antioxidante para manter o foco e a estabilidade de energia.",
      receita: {
        ingredientes: [
          "100g de chocolate amargo (mínimo 70% cacau)", 
          "50ml de leite de coco concentrado", 
          "15 amêndoas torradas e picadas grosseiramente"
        ],
        preparo: [
          "Derreta o chocolate em banho-maria ou no micro-ondas (de 30 em 30 segundos).",
          "Misture o leite de coco até brilhar e adicione as amêndoas.",
          "Leve à geladeira por 1 hora. Modele pequenas trufas com as mãos e passe no cacau em pó."
        ]
      }
    },
  ],
};

export const recipeBank: Record<MealStyle, PlanItemWithRecipe[]> = {
  pratico: [
    { 
      id: "p-cafe-1", 
      titulo: "Omelete de Ervas Finas", 
      descricao: "Proteína de absorção rápida para despertar o metabolismo.", 
      categoria: "Café da Manhã", 
      objetivos: ["emagrecer", "mais energia"], 
      receita: { 
        ingredientes: ["2 ovos caipiras", "1 colher de sopa de salsinha e cebolinha picadas", "1 pitada de sal marinho", "1 fio de azeite"], 
        preparo: [
          "Bata os ovos vigorosamente com um garfo em um bowl até espumar levemente.",
          "Adicione o sal e as ervas frescas, misturando bem.",
          "Aqueça a frigideira em fogo médio, unte com azeite e despeje a mistura.",
          "Quando as bordas soltarem e o centro estiver quase firme, dobre ao meio e sirva quente."
        ] 
      } 
    },
    { 
      id: "p-cafe-2", 
      titulo: "Tapioca Proteica de Ovo", 
      descricao: "Carbo inteligente com proteína para energia duradoura.", 
      categoria: "Café da Manhã", 
      objetivos: ["mais energia"], 
      receita: { 
        ingredientes: ["2 colheres de sopa de goma de tapioca peneirada", "1 ovo grande", "Orégano a gosto"], 
        preparo: [
          "Espalhe a tapioca em uma frigideira fria formando um disco uniforme. Ligue o fogo baixo.",
          "Enquanto a tapioca firma, prepare o ovo mexido em outra panelinha (ou no micro-ondas por 1 min).",
          "Coloque o ovo sobre o disco de tapioca, salpique orégano, feche e pressione por 10 segundos."
        ] 
      } 
    },
    { 
      id: "p-almoco-1", 
      titulo: "Frango Selado com Gergelim", 
      descricao: "Crocância saudável rica em cálcio e gorduras boas.", 
      categoria: "Almoço", 
      objetivos: ["emagrecer", "definir"], 
      receita: { 
        ingredientes: ["150g de peito de frango em cubos", "1 colher de sopa de gergelim branco ou preto", "Sal, pimenta e limão"], 
        preparo: [
          "Tempere o frango with sal, pimenta e gotas de limão por 5 minutos.",
          "Pressione cada cubo de frango no gergelim para criar uma 'crosta'.",
          "Leve à frigideira bem quente e doure todos os lados até o gergelim ficar tostado e o frango cozido."
        ] 
      } 
    },
    { 
      id: "p-lanche-t-1", 
      titulo: "Chips de Abobrinha com Páprica", 
      descricao: "Snack crocante de baixíssima caloria.", 
      categoria: "Lanche da Tarde", 
      objetivos: ["emagrecer"], 
      receita: { 
        ingredientes: ["1 abobrinha média", "Páprica defumada", "Sal a gosto"], 
        preparo: [
          "Fatie a abobrinha em rodelas bem finas (se tiver um mandolin, melhor).",
          "Disponha em uma assadeira, tempere com sal e a páprica.",
          "Asse em forno baixo ou airfryer a 160°C até ficarem bem sequinhas e crocantes (cerca de 15-20 min)."
        ] 
      } 
    },
    { 
      id: "p-lanche-1", 
      titulo: "Iogurte Termogênico", 
      descricao: "Combina o cálcio do iogurte com o poder da canela.", 
      categoria: "Lanche", 
      objetivos: ["emagrecer", "criar constancia"], 
      receita: { 
        ingredientes: ["1 pote de iogurte natural desnatado", "1 colher de chá de canela em pó", "3 amêndoas picadas"], 
        preparo: [
          "Misture bem a canela no iogurte até ficar um creme uniforme.",
          "Salpique as amêndoas por cima para dar crocância e aumentar a saciedade.",
          "Dica: Se preferir doce, use 3 gotas de adoçante Stevia."
        ] 
      } 
    },
    { 
      id: "p-jantar-1", 
      titulo: "Tacos de Alface e Carne Moída", 
      descricao: "Jantar 'Low Carb' refrescante e visualmente incrível.", 
      categoria: "Jantar", 
      objetivos: ["emagrecer", "definir"], 
      receita: { 
        ingredientes: ["4 folhas grandes de alface americana ou romana", "100g de carne moída magra refogada", "Tomate picado e coentro"], 
        preparo: [
          "Lave bem as folhas de alface e seque-as; elas serão suas 'conchas' de taco.",
          "Aqueça a carne moída já temperada com cebola e alho.",
          "Recheie as folhas com a carne, adicione o tomate e o coentro por cima. Coma com as mãos."
        ] 
      } 
    },
  ],
  equilibrado: [
    { 
      id: "e-cafe-1", 
      titulo: "Bowl de Frutas, Iogurte e Chia", 
      descricao: "Combinação perfeita de fibras, probióticos e antioxidantes.", 
      categoria: "Café da Manhã", 
      objetivos: ["emagrecer", "mais energia"], 
      receita: { 
        ingredientes: ["1/2 xícara de morangos picados", "1 colher de sopa de chia", "1 iogurte natural desnatado"], 
        preparo: [
          "Em uma tigela, misture o iogurte com as sementes de chia.",
          "Adicione os morangos frescos por cima.",
          "Deixe descansar por 5 minutos antes de comer para a chia hidratar levemente, aumentando a saciedade."
        ] 
      } 
    },
    { 
      id: "e-almoco-1", 
      titulo: "Salmão Grelhado com Brócolis no Vapor", 
      descricao: "Rico em Ômega 3 e fitoquímicos detox.", 
      categoria: "Almoço", 
      objetivos: ["emagrecer", "definir"], 
      receita: { 
        ingredientes: ["1 posta de salmão (150g)", "1 xícara de brócolis ninja em floretes", "Limão e ervas finas"], 
        preparo: [
          "Tempere o salmão com sal e limão. Grelhe em frigideira quente por 4 min de cada lado.",
          "Cozinhe o brócolis no vapor por apenas 5 minutos para manter a cor verde vibrante e os nutrientes.",
          "Sirva com um fio de azeite e ervas finas salpicadas sobre o peixe."
        ] 
      } 
    },
    { 
      id: "e-lanche-t-1", 
      titulo: "Húmus com Palitos de Cenoura", 
      descricao: "Proteína vegetal prática e muito saciante.", 
      categoria: "Lanche da Tarde", 
      objetivos: ["mais energia"], 
      receita: { 
        ingredientes: ["2 colheres de sopa de húmus (pasta de grão-de-bico)", "1 cenoura pequena cortada em tiras", "Azeite e páprica"], 
        preparo: [
          "Coloque o húmus em um potinho pequeno e polvilhe uma pitada de páprica.",
          "Corte a cenoura em formato de 'palitos' finos.",
          "Mergulhe os palitos de cenoura no húmus. É o lanche perfeito para o trabalho."
        ] 
      } 
    },
    { 
      id: "e-lanche-1", 
      titulo: "Mix de Oleaginosas Premium", 
      descricao: "Gorduras nobres que auxiliam na concentração.", 
      categoria: "Lanche", 
      objetivos: ["definir", "mais energia"], 
      receita: { 
        ingredientes: ["3 nozes inteiras", "5 castanhas-do-pará", "1 fatia de coco seco (opcional)"], 
        preparo: [
          "Misture os ingredientes em um pote pequeno.",
          "Mastigue bem cada castanha para liberar os óleos essenciais e sinalizar saciedade ao cérebro.",
          "Dica: Ótimo para comer entre reuniões ou antes de um compromisso longo."
        ] 
      } 
    },
    { 
      id: "e-jantar-1", 
      titulo: "Risoto Low Carb de Couve-Flor", 
      descricao: "Todo o sabor de um risoto com 80% menos carboidratos.", 
      categoria: "Jantar", 
      objetivos: ["emagrecer", "definir"], 
      receita: { 
        ingredientes: ["2 xícaras de couve-flor triturada (textura de arroz)", "100g de camarão ou frango", "1 colher de sopa de requeijão light"], 
        preparo: [
          "No processador, pulse a couve-flor crua até virar pequenos grãos. Refogue com alho e cebola.",
          "Adicione a proteína escolhida e mexa até cozinhar.",
          "Finalize com o requeijão light para dar a cremosidade clássica do risoto. Sirva com queijo parmesão ralado na hora (pouco)."
        ] 
      } 
    },
  ],
  "sem tempo": [
    { 
      id: "st-cafe-1", 
      titulo: "Shake Energético de Morango", 
      descricao: "Bata tudo e leve para tomar no caminho.", 
      categoria: "Café da Manhã", 
      objetivos: ["emagrecer", "mais energia"], 
      receita: { 
        ingredientes: ["1 xícara de morangos congelados", "200ml de leite desnatado ou vegetal", "1 colher de sopa de aveia em flocos"], 
        preparo: [
          "Coloque todos os ingredientes no liquidificador.",
          "Bata por 40 segundos até ficar cremoso.",
          "Dica: Se quiser mais proteína, adicione 1 colher de iogurte grego ou whey de baunilha."
        ] 
      } 
    },
    { 
      id: "st-almoco-1", 
      titulo: "Bowl Expresso de Atum e Milho", 
      descricao: "Refeição completa em 60 segundos.", 
      categoria: "Almoço", 
      objetivos: ["emagrecer", "criar constancia"], 
      receita: { 
        ingredientes: ["1 lata de atum light (em água)", "2 colheres de sopa de milho", "1 tomate picado", "Folhas verdes à vontade"], 
        preparo: [
          "Escorra a água do atum e coloque em uma tigela.",
          "Adicione o milho e o tomate picado. Misture bem e tempere com limão e sal.",
          "Sirva sobre uma cama de folhas verdes para dar volume à refeição."
        ] 
      } 
    },
    { 
      id: "st-lanche-t-1", 
      titulo: "Smoothie de Whey e Água de Coco", 
      descricao: "Hidratação e recuperação muscular rápida.", 
      categoria: "Lanche da Tarde", 
      objetivos: ["definir", "mais energia"], 
      receita: { 
        ingredientes: ["1 scoop de Whey Protein", "200ml de água de coco gelada", "Pedras de gelo"], 
        preparo: [
          "No shaker ou liquidificador, misture a água de coco e o whey.",
          "Agite bem com bastante gelo.",
          "É o lanche ideal para os dias mais quentes e agitados."
        ] 
      } 
    },
    { 
      id: "st-lanche-1", 
      titulo: "Snack de Barra de Proteína Fit", 
      descricao: "A solução para emergências na bolsa.", 
      categoria: "Lanche", 
      objetivos: ["definir", "criar constancia"], 
      receita: { 
        ingredientes: ["1 barra de proteína (mínimo 10g de proteína)", "1 copo de água (importante)"], 
        preparo: [
          "Sempre consuma sua barra de proteína acompanhada de um copo grande de água.",
          "Isso ajuda as fibras e proteínas a serem processadas pelo corpo, mantendo você saciada por mais tempo."
        ] 
      } 
    },
    { 
      id: "st-jantar-1", 
      titulo: "Wrap Rápido de Peito de Peru", 
      descricao: "Jantar leve que não pesa no estômago.", 
      categoria: "Jantar", 
      objetivos: ["emagrecer", "criar constancia"], 
      receita: { 
        ingredientes: ["1 tortilha fit (Rap10 integral ou folha de arroz)", "2 fatias de peito de peru", "1 fatia de queijo branco pequeno"], 
        preparo: [
          "Aqueça a tortilha por 15 segundos de cada lado na frigideira.",
          "Coloque o peito de peru e o queijo no centro, enrole como um charuto.",
          "Deixe mais 15 segundos na frigideira para derreter o queijo e sirva."
        ] 
      } 
    },
  ],
  caseiro: [
    { 
      id: "c-cafe-1", 
      titulo: "Cuscuz Tradicional com Ovo Mexido", 
      descricao: "O sabor do Brasil com equilíbrio nutricional.", 
      categoria: "Café da Manhã", 
      objetivos: ["mais energia", "criar constancia"], 
      receita: { 
        ingredientes: ["1/2 xícara de flocão de milho", "1 ovo caipira", "Sal e água"], 
        preparo: [
          "Hidrate o flocão com água e uma pitada de sal por 5 minutos.",
          "Cozinhe no vapor por 10 minutos (na cuscuzeira ou adaptado no escorredor).",
          "Sirva quente acompanhado de um ovo mexido bem cremoso preparado com um fio de manteiga ou azeite."
        ] 
      } 
    },
    { 
      id: "c-almoco-1", 
      titulo: "Escondidinho Fit de Abóbora", 
      descricao: "Refeição reconfortante e rica em betacaroteno.", 
      categoria: "Almoço", 
      objetivos: ["emagrecer", "mais energia"], 
      receita: { 
        ingredientes: ["200g de abóbora cabotiá cozida", "100g de frango desfiado temperado", "Temperos naturais (cebola, alho, salsa)"], 
        preparo: [
          "Amasse a abóbora até formar um purê rústico. Tempere a gosto.",
          "Em um refratário, coloque o frango desfiado por baixo e cubra com o purê de abóbora.",
          "Se desejar, polvilhe um pouco de queijo parmesão e leve ao forno para gratinar por 10 minutos."
        ] 
      } 
    },
    { 
      id: "c-lanche-t-1", 
      titulo: "Banana-da-Terra Grelhada com Canela", 
      descricao: "Doce natural que acalma a vontade de açúcar.", 
      categoria: "Lanche da Tarde", 
      objetivos: ["mais energia"], 
      receita: { 
        ingredientes: ["1 banana-da-terra pequena madura", "Canela em pó", "1 colher de café de óleo de coco"], 
        preparo: [
          "Corte a banana ao meio (no sentido do comprimento).",
          "Unte a frigideira com óleo de coco e doure os dois lados da banana até caramelizar.",
          "Polvilhe bastante canela e sirva quente. É quase uma sobremesa!"
        ] 
      } 
    },
    { 
      id: "c-lanche-1", 
      titulo: "Sanduíche de Pão Integral e Queijo Branco", 
      descricao: "Lanche clássico e equilibrado para qualquer hora.", 
      categoria: "Lanche", 
      objetivos: ["criar constancia"], 
      receita: { 
        ingredientes: ["2 fatias de pão integral 100%", "2 fatias de queijo minas frescal (branco)", "Orégano"], 
        preparo: [
          "Monte o sanduíche com o queijo e o orégano entre as fatias de pão.",
          "Leve à sanduicheira ou frigideira apenas para aquecer o queijo e deixar o pão levemente crocante.",
          "Simples, eficaz e saciante."
        ] 
      } 
    },
    { 
      id: "c-jantar-1", 
      titulo: "Espaguete de Cenoura ao Molho Pesto", 
      descricao: "Leveza máxima para uma noite de sono tranquila.", 
      categoria: "Jantar", 
      objetivos: ["emagrecer", "definir"], 
      receita: { 
        ingredientes: ["1 cenoura grande ralada em fios (espessura de espaguete)", "1 colher de sopa de molho pesto caseiro", "Lascas de amêndoas"], 
        preparo: [
          "Rale a cenoura com um ralador grosso ou cortador de fios.",
          "Dê um susto na cenoura (cozinhe apenas 2 minutos em água fervente ou no micro-ondas) para amolecer levemente.",
          "Escorra a água e misture o molho pesto. Finalize com as amêndoas para dar crocância."
        ] 
      } 
    },
  ],
};

export const exerciseBank: Record<string, any[]> = {
  iniciante: [
    { 
      titulo: "Polichinelo Frontal rítmico", 
      descricao: "Aquecimento dinâmico que ativa a circulação e prepara as articulações.", 
      tutorial: [
        "Fique em pé com os pés juntos e braços relaxados ao lado do corpo.",
        "Dê um pequeno salto, afastando as pernas lateralmente enquanto eleva os braços à frente até a altura do rosto.",
        "Retorne à posição inicial com outro salto suave, coordenando braços e pernas.",
        "Mantenha o abdômen levemente contraído e respire de forma constante."
      ], 
      explicacaoSimples: "Um movimento fluido para 'acordar' o corpo. Mantenha os braços esticados e sinta seu coração acelerar levemente.", 
      cuidado: "Amorteça a queda com a ponta dos pés para proteger os joelhos. Evite bater os calcanhares com força no chão." 
    },
    { 
      titulo: "Agachamento Consciente na Cadeira", 
      descricao: "Fortalecimento seguro e funcional da musculatura das coxas e glúteos.", 
      tutorial: [
        "Posicione-se de costas para uma cadeira firme, pés afastados na largura do quadril.",
        "Inicie o movimento levando o quadril para trás, como se fosse sentar, mantendo o peito aberto.",
        "Desça até sentir o toque leve no assento e suba imediatamente fazendo força nos calcanhares.",
        "Inspire ao descer e expire ao subir."
      ], 
      explicacaoSimples: "Sente e levante devagar, sem despencar na cadeira. Imagine que você está empurrando o chão para longe ao subir.", 
      cuidado: "Não deixe os joelhos passarem da ponta dos pés. Mantenha o olhar fixo à frente para estabilizar a coluna." 
    },
    { 
      titulo: "Elevação Lateral Controlada", 
      descricao: "Trabalho de definição para os ombros e melhora da postura da parte superior.", 
      tutorial: [
        "Fique em pé com os braços ao longo do corpo, segurando garrafinhas de água ou apenas com as mãos fechadas.",
        "Eleve os braços lateralmente até que fiquem na altura dos ombros, formando um 'T'.",
        "Mantenha uma leve flexão nos cotovelos e desça os braços de forma lenta e resistida.",
        "Evite encolher os ombros em direção às orelhas."
      ], 
      explicacaoSimples: "Imagine que está abrindo suas asas. O movimento deve ser suave como o voo de um pássaro.", 
      cuidado: "Pare o movimento na altura dos ombros. Se sentir qualquer fisgada, reduza a amplitude." 
    },
    { 
      titulo: "Panturrilha com Equilíbrio", 
      descricao: "Melhora a circulação das pernas e fortalece a base do corpo.", 
      tutorial: [
        "Fique em pé, use uma parede como apoio leve para equilibrar, se necessário.",
        "Suba o máximo que conseguir na ponta dos pés, contraindo bem a panturrilha no topo.",
        "Segure por 1 segundo e desça bem devagar até os calcanhares tocarem o chão novamente.",
        "Mantenha as pernas esticadas, mas sem travar os joelhos."
      ], 
      explicacaoSimples: "Fique bem altinha na ponta do pé e desça resistindo ao peso do corpo.", 
      cuidado: "Não balance o corpo para frente e para trás. Force o movimento apenas na articulação do tornozelo." 
    },
    { 
      titulo: "Abdominal Infra Estabilizado", 
      descricao: "Foco na musculatura profunda do abdômen inferior sem sobrecarregar a coluna.", 
      tutorial: [
        "Deite-se de costas com as mãos sob o quadril para proteger a lombar.",
        "Eleve uma perna esticada em direção ao teto enquanto a outra permanece próxima ao chão.",
        "Troque as pernas de forma alternada, simulando um movimento de 'pedalada' lenta.",
        "Pressione a lombar firmemente contra o colchonete o tempo todo."
      ], 
      explicacaoSimples: "Mantenha o umbigo 'colado' nas costas e mova as pernas com controle absoluto.", 
      cuidado: "Se a sua lombar começar a sair do chão, suba mais as pernas para aliviar a tensão." 
    },
    { 
      titulo: "Mobilidade Dinâmica de Quadril", 
      descricao: "Solta a articulação do quadril, melhorando o desempenho em outros exercícios.", 
      tutorial: [
        "Apoie uma das mãos na parede para total equilíbrio.",
        "Balance a perna oposta para frente e para trás de forma fluida, como um pêndulo.",
        "Depois, faça círculos controlados com o joelho para fora e para dentro.",
        "Mantenha o tronco o mais estável possível durante o balanço."
      ], 
      explicacaoSimples: "Deixe a perna solta, mas controle o movimento. Sinta a articulação 'lubrificando'.", 
      cuidado: "Não force o balanço além do seu limite de flexibilidade atual." 
    },
    { 
      titulo: "Prancha Alta de Sustentação", 
      descricao: "Fortalecimento integrado de braços, core e ombros.", 
      tutorial: [
        "Posicione as mãos no chão diretamente sob os ombros, braços totalmente esticados.",
        "Mantenha o tronco e as pernas em uma linha reta, como se fosse uma tábua de madeira.",
        "Contraia glúteos e abdômen para evitar que o quadril caia ou suba demais.",
        "Respire de forma curta e frequente, mantendo a tensão muscular."
      ], 
      explicacaoSimples: "Segure o corpo firme. Imagine que tem um copo de água nas suas costas e ele não pode cair.", 
      cuidado: "Olhe para o chão, ligeiramente à frente das mãos, para manter o pescoço alinhado." 
    },
    { 
      titulo: "Flexão Suave na Parede", 
      descricao: "Início seguro para o fortalecimento do peitoral e tríceps.", 
      tutorial: [
        "Fique de frente para uma parede e apoie as mãos nela, um pouco mais largas que os ombros.",
        "Afaste os pés da parede até inclinar o corpo. Dobre os cotovelos aproximando o peito da parede.",
        "Empurre com força de volta para a posição inicial.",
        "Mantenha os cotovelos apontando ligeiramente para baixo, não para os lados."
      ], 
      explicacaoSimples: "É como dar um empurrão na parede com controle. Sinta o peito trabalhar.", 
      cuidado: "Mantenha o corpo reto como na prancha. Não deixe o bumbum ficar para trás." 
    },
    { 
      titulo: "Elevação Pélvica de Base", 
      descricao: "Ativação profunda de glúteos e posterior de coxa.", 
      tutorial: [
        "Deite-se de costas, joelhos dobrados e pés apoiados no chão próximos ao bumbum.",
        "Suba o quadril em direção ao teto, apertando os glúteos com força no ponto mais alto.",
        "Retorne devagar, apenas raspando o bumbum no chão antes de subir novamente.",
        "Mantenha os calcanhares colados no chão para máxima ativação."
      ], 
      explicacaoSimples: "Aperte o bumbum como se estivesse segurando uma moeda entre as nádegas.", 
      cuidado: "Não suba o quadril tanto a ponto de arquear a lombar. O foco é no glúteo." 
    },
    { 
      titulo: "Corrida Estacionária de Baixo Impacto", 
      descricao: "Melhora o condicionamento cardiovascular sem sobrecarregar as articulações.", 
      tutorial: [
        "Simule uma caminhada ou corrida leve sem sair do lugar.",
        "Eleve os joelhos de forma moderada e coordene com o balanço dos braços.",
        "Mantenha a postura ereta, peito aberto e pescoço relaxado.",
        "Amorteça cada passo suavemente."
      ], 
      explicacaoSimples: "Um trote leve no lugar. Sinta-se leve como se estivesse flutuando sobre o chão.", 
      cuidado: "Mantenha o olhar no horizonte para garantir que seu tronco não se curve para frente." 
    },
    { 
      titulo: "Abdominal Supra Focado", 
      descricao: "Isolamento da parte superior do abdômen para definição.", 
      tutorial: [
        "Deitado de costas, joelhos dobrados e mãos levemente atrás das orelhas.",
        "Suba apenas os ombros e a parte superior das costas, soltando o ar (expirando).",
        "Olhe para o teto durante todo o movimento para não puxar o pescoço.",
        "Sinta o abdômen 'esmagar' no topo e desça inspirando."
      ], 
      explicacaoSimples: "Pense em levar o peito em direção ao teto, não em direção aos joelhos.", 
      cuidado: "Nunca puxe a cabeça com as mãos. O esforço deve vir exclusivamente do abdômen." 
    },
    { 
      titulo: "Alongamento Terapêutico Gato-Vaca", 
      descricao: "Melhora a mobilidade da coluna e alivia tensões nas costas.", 
      tutorial: [
        "Fique na posição de quatro apoios (mãos e joelhos no chão).",
        "Ao inspirar, olhe para cima e deixe a barriga descer, arqueando levemente a coluna (Vaca).",
        "Ao expirar, leve o queixo ao peito e curve a coluna para cima como um gato bravo (Gato).",
        "Mova cada vértebra de forma consciente e lenta."
      ], 
      explicacaoSimples: "Uma massagem para sua coluna. Acompanhe o movimento com a sua respiração.", 
      cuidado: "Faça movimentos suaves. Se tiver dor aguda em qualquer posição, reduza a curva." 
    },
    { 
      titulo: "Ponte de Glúteo Isométrica", 
      descricao: "Resistência muscular para glúteos e estabilidade de core.", 
      tutorial: [
        "Suba o quadril na posição de elevação pélvica e trave o movimento no topo.",
        "Segure a posição com o bumbum e abdômen bem contraídos durante todo o tempo.",
        "Respire fundo e mantenha os ombros relaxados contra o chão.",
        "Distribua o peso igualmente entre os dois pés."
      ], 
      explicacaoSimples: "Fique estátua! Sinta a queimação saudável no bumbum e nas coxas.", 
      cuidado: "Se sentir qualquer desconforto na lombar, desça um pouco o quadril." 
    },
    { 
      titulo: "Rotação de Tronco Postural", 
      descricao: "Melhora a mobilidade lateral e a flexibilidade da cintura.", 
      tutorial: [
        "Sente-se no chão com as pernas esticadas e as costas bem retas.",
        "Gire o tronco suavemente para um lado, olhando por cima do ombro, e segure 2 segundos.",
        "Retorne ao centro e gire para o outro lado de forma controlada.",
        "Imagine que sua coluna é um eixo central que está girando verticalmente."
      ], 
      explicacaoSimples: "Um alongamento ativo para soltar a cintura e as costas após o dia corrido.", 
      cuidado: "Não force a rotação. O movimento deve ser fluido e até onde for confortável." 
    },
    { 
      titulo: "Extensão Tríceps 'Adeus'", 
      descricao: "Foco no fortalecimento do músculo do 'tchauzinho'.", 
      tutorial: [
        "Segure uma pequena carga (ou as mãos unidas) acima da cabeça com os braços esticados.",
        "Dobre os cotovelos baixando a carga atrás da nuca de forma lenta.",
        "Estique os braços novamente para o teto, contraindo o tríceps no topo.",
        "Mantenha os cotovelos apontados para frente, perto das orelhas."
      ], 
      explicacaoSimples: "Dobre e estique os braços para o alto. Mantenha os cotovelos 'fechados'.", 
      cuidado: "Cuidado para não bater a carga na nuca ou na cabeça. Movimento muito lento." 
    },
    { 
      titulo: "Step Up Funcional", 
      descricao: "Fortalece as pernas e melhora a agilidade no dia a dia.", 
      tutorial: [
        "Fique em frente a um degrau seguro ou plataforma baixa estável.",
        "Suba com um pé, fazendo força total no calcanhar desse pé para elevar o corpo.",
        "Encoste o outro pé no topo e desça com a mesma perna que começou.",
        "Mantenha o tronco e o joelho alinhados durante toda a subida."
      ], 
      explicacaoSimples: "Suba o degrau com postura. Sinta a força na coxa e no glúteo da perna da frente.", 
      cuidado: "Certifique-se de que toda a sola do pé esteja apoiada no degrau antes de subir." 
    },
    { 
      titulo: "Abdominal Tesoura Rítmico", 
      descricao: "Trabalho dinâmico para os músculos abdominais inferiores e flexores de quadril.", 
      tutorial: [
        "Deitada de costas, mãos sob o bumbum, eleve as pernas esticadas a poucos centímetros do chão.",
        "Cruze uma perna sobre a outra sucessivamente, como se estivesse usando uma tesoura.",
        "Mantenha os pés esticados e a cabeça relaxada no chão (ou levemente elevada para dificultar).",
        "Foque em manter a lombar 'colada' no tapete."
      ], 
      explicacaoSimples: "Mova as pernas de um lado para o outro cruzando-as. Sinta o abdômen 'segurando' o movimento.", 
      cuidado: "Se a lombar doer, suba mais as pernas. O importante é o controle, não a velocidade." 
    }
  ],
  intermediaria: [
    { 
      titulo: "Agachamento Sumô Profundo", 
      descricao: "Foco intenso na parte interna das coxas e fortalecimento global de base.", 
      tutorial: [
        "Afaste as pernas além da largura dos ombros, aponte a ponta dos pés para fora (45 graus).",
        "Agache mantendo o tronco o mais reto possível, levando o quadril rumo ao chão.",
        "Suba apertando os glúteos e as coxas. Inspire ao descer e solte o ar ao subir.",
        "Mantenha os joelhos acompanhando a direção dos pés."
      ], 
      explicacaoSimples: "Imagine que você é uma lutadora de sumô. Desça com postura elegante e força nas coxas.", 
      cuidado: "Não deixe os joelhos 'caírem' para dentro. Force para que fiquem abertos." 
    },
    { 
      titulo: "Flexão de Braço (Nível Intermediário)", 
      descricao: "Desenvolvimento de força funcional no peito, tríceps e estabilidade de core.", 
      tutorial: [
        "Mãos no chão sob os ombros, joelhos apoiados para garantir o alinhamento da coluna.",
        "Desça o peito em direção ao chão em um bloco só, mantendo o abdômen travado.",
        "Empurre com força total até esticar os braços. Não deixe o pescoço 'pendurar'.",
        "Mantenha os cotovelos a cerca de 45 graus em relação ao corpo."
      ], 
      explicacaoSimples: "Desça o corpo todo junto e suba com explosão. Imagine que está empurrando o chão para longe.", 
      cuidado: "Se o seu quadril ficar para trás, você está fazendo errado. O corpo deve ser uma linha reta." 
    },
    { 
      titulo: "Afundo Alternado Dinâmico", 
      descricao: "Trabalho de equilíbrio, coordenação e força assimétrica de pernas.", 
      tutorial: [
        "Dê um passo largo para frente. Desça o joelho da perna de trás em direção ao chão.",
        "A perna da frente deve formar um ângulo de 90 graus. Mantenha o tronco ben ereto.",
        "Dê um passo de volta para a posição inicial e troque a perna imediatamente.",
        "Mantenha as mãos na cintura ou braços coordenados para equilíbrio."
      ], 
      explicacaoSimples: "Dê o passo, desça com elegância e volte com firmeza. Sinta a coxa queimar.", 
      cuidado: "Não deixe o joelho da frente passar da ponta do pé para não lesionar o tendão." 
    },
    { 
      titulo: "Polichinelo Tradicional Explosivo", 
      descricao: "Cardio intenso que trabalha coordenação e queima calórica.", 
      tutorial: [
        "Salte abrindo as pernas e batendo as mãos acima da cabeça simultaneamente.",
        "Retorne fechando tudo com outro salto. Mantenha um ritmo rápido e constante.",
        "Mantenha os cotovelos e braços sempre esticados durante o movimento.",
        "Respire de forma curta e ritmada com os saltos."
      ], 
      explicacaoSimples: "O clássico polichinelo. Quanto mais rápido você fizer, mais gordura você queima!", 
      cuidado: "Aterrisse sempre com os joelhos levemente flexionados para amortecer o impacto." 
    },
    { 
      titulo: "Prancha Isométrica nos Cotovelos", 
      descricao: "Resistência máxima do core e proteção da coluna vertebral.", 
      tutorial: [
        "Apoie os antebraços no chão, cotovelos sob os ombros.",
        "Mantenha the corpo perfeitamente reto, pés na largura do quadril.",
        "Contraia o abdômen como se estivesse levando um soco. Segure a respiração fluida.",
        "Não olhe para frente, olhe para suas mãos para relaxar o pescoço."
      ], 
      explicacaoSimples: "Resista! Sinta o seu centro de força tremer enquanto seu abdômen fica mais forte.", 
      cuidado: "Se o seu quadril subir ou a lombar descer, a prancha perdeu o efeito. Ajuste a postura." 
    },
    { 
      titulo: "Escalador Ágil (Mountain Climber)", 
      descricao: "Combina cardio de alta frequência com ativação abdominal intensa.", 
      tutorial: [
        "Posição de prancha alta (mãos no chão).",
        "Traga um joelho em direção ao peito com velocidade e alterne imediatamente com o outro.",
        "Tente manter as costas retas e o quadril o mais baixo possível durante a corrida no chão.",
        "Mantenha as mãos firmes e não balance muito os ombros."
      ], 
      explicacaoSimples: "Imagine que você está escalando uma montanha o mais rápido que consegue!", 
      cuidado: "Não relaxe os ombros. Mantenha os braços esticados e o core ativo o tempo todo." 
    },
    { 
      titulo: "Abdominal Bicicleta de Elite", 
      descricao: "Ativação completa de reto abdominal e oblíquos (cintura).", 
      tutorial: [
        "Deitada de costas, mãos atrás da cabeça, pernas elevadas.",
        "Traga o cotovelo direito ao encontro do joelho esquerdo enquanto estica a perna direita.",
        "Alterne os lados de forma rítmica, como se estivesse pedalando com o tronco girando.",
        "Foque em girar o tronco superior, não apenas mover os cotovelos."
      ], 
      explicacaoSimples: "Um dos melhores exercícios para o abdômen. Pedale com vontade e gire a cintura!", 
      cuidado: "Mantenha a lombar colada no chão em cada rotação para proteger suas costas." 
    },
    { 
      titulo: "Superman (Extensão de Cadeia Posterior)", 
      descricao: "Fortalecimento essencial da lombar e musculatura que sustenta a postura.", 
      tutorial: [
        "Deite de barriga para baixo com braços e pernas esticados.",
        "Ao expirar, eleve braços, peito e pernas simultaneamente do chão.",
        "Segure por 2 segundos sentindo a contração nas costas e glúteos.",
        "Retorne devagar sem relaxar totalmente os músculos."
      ], 
      explicacaoSimples: "Imagine que você é a super-mulher voando! Ative toda a parte de trás do seu corpo.", 
      cuidado: "Não dê solavancos. O movimento deve ser controlado para não lesionar a coluna." 
    },
    { 
      titulo: "Dips de Tríceps no Banco", 
      descricao: "Fortalecimento intenso para eliminar a flacidez do braço.", 
      tutorial: [
        "Sente na beirada de uma cadeira ou banco firme. Apoie as mãos ao lado do quadril.",
        "Desloque o corpo para frente ficando sustentada apenas pelos braços e calcanhares.",
        "Dobre os cotovelos até as coxas ficarem paralelas ao chão e suba totalmente.",
        "Mantenha as costas rente ao banco para não forçar os ombros."
      ], 
      explicacaoSimples: "O melhor exercício manual para o tríceps. Mantenha os cotovelos para trás.", 
      cuidado: "Se sentir dor na frente do ombro, desça menos. A qualidade é melhor que a profundidade." 
    },
    { 
      titulo: "Lunges Frontais Dinâmicos", 
      descricao: "Foco em explosão de perna e estabilidade de joelho.", 
      tutorial: [
        "Faça o movimento de afundo dando uma passada larga e profunda.",
        "Empurre o chão com vigor com o pé da frente para retornar à posição inicial em um só movimento.",
        "Mantenha o tronco levemente inclinado para frente para ativar mais o glúteo.",
        "Alterne as pernas com um ritmo constante."
      ], 
      explicacaoSimples: "Força no calcanhar! O movimento deve ser como uma mola: desce e explode de volta.", 
      cuidado: "Mantenha o abdômen contraído para não balanço o corpo para os lados." 
    },
    { 
      titulo: "Agachamento + Joelho Alto", 
      descricao: "Funcional e cardiovascular.", 
      tutorial: [
        "Faça um agachamento comum.",
        "Ao subir, leve um joelho ao peito.",
        "Repita alternando."], 
      explicacaoSimples: "Combine a força do agachamento com a energia do joelho alto. Movimento contínuo!", 
      cuidado: "Aterrisse com suavidade para não impactar o calcanhar com força no chão." 
    },
    { 
      titulo: "Prancha Lateral de Cintura", 
      descricao: "Isolamento dos oblíquos e fortalecimento da cintura lateral.", 
      tutorial: [
        "Deitada de lado, apoie o antebraço no chão com o cotovelo alinhado ao ombro.",
        "Eleve o quadril formando uma linha reta dos pés à cabeça. Segure firmemente.",
        "Mantenha o braço de cima na cintura ou esticado para o teto para mais equilíbrio.",
        "Respire fundo e mantenha o quadril alto o tempo todo."
      ], 
      explicacaoSimples: "Trabalhe a lateral do seu abdômen. Imagine que tem uma linha puxando seu quadril para cima.", 
      cuidado: "Não deixe o quadril 'ceder' para baixo. Se tremer, é sinal de que está funcionando!" 
    },
    { 
      titulo: "Burpee Adaptado Potente", 
      descricao: "A versatilidade do burpee com menor impacto articular.", 
      tutorial: [
        "Coloque as mãos no chão à frente dos pés.",
        "Dê um passo de cada vez para trás até a posição de prancha.",
        "Retorne um pé de cada vez para perto das mãos e fique em pé, esticando os braços para o alto.",
        "Mantenha uma velocidade constante para manter o coração acelerado."
      ], 
      explicacaoSimples: "Um exercício de corpo todo. Sem saltos, mas com muita energia e agilidade.", 
      cuidado: "Mantenha o core firme quando estiver na posição de prancha para não 'afundar' a lombar." 
    },
    { 
      titulo: "Corda Imaginária Veloz", 
      descricao: "Melhora da agilidade, panturrilhas e resistência aeróbica.", 
      tutorial: [
        "Simule que está pulando corda com as mãos girando ao lado do corpo.",
        "Dê saltos curtos e rápidos apenas na ponta dos pés.",
        "Mantenha os cotovelos colados no corpo e as costas eretas.",
        "Varie o ritmo entre lento e rápido conforme aguentar."
      ], 
      explicacaoSimples: "Rápido como uma boxeadora! Sinta seus batimentos subirem enquanto trabalha as pernas.", 
      cuidado: "Pule baixinho. O objetivo é rapidez e agilidade, não altura." 
    },
    { 
      titulo: "Estocada Lateral Postural", 
      descricao: "Trabalho de glúteo médio e alongamento ativo de adutores.", 
      tutorial: [
        "Dê um passo bem largo para o lado.",
        "Flexione apenas esse joelho, jogando o quadril para trás, mantendo a outra perna totalmente esticada.",
        "Mantenha o peito aberto e a coluna reta. Retorne à base inicial com força.",
        "Mantenha os pés sempre apontados para frente."
      ], 
      explicacaoSimples: "Desça como se estivesse sentando em um banco lateral. Sinta a força na lateral do seu bumbum.", 
      cuidado: "Mantenha a sola do pé que esticou totalmente no chão. Não deixe o calcanhar subir." 
    },
    { 
      titulo: "Abdominal Remador Completo", 
      descricao: "Exercício clássico de funcional que exige força abdominal e flexibilidade.", 
      tutorial: [
        "Deitada totalmente esticada (braços acima da cabeça).",
        "Ao expirar, suba o tronco de uma vez abraçando os joelhos simultaneamente.",
        "Retorne à posição inicial de forma controlada, sem bater as costas no chão.",
        "Mantenha o movimento fluido e use os braços para dar o impulso inicial se precisar."
      ], 
      explicacaoSimples: "Imagine que você está em um barco remando com toda a sua força abdominal!", 
      cuidado: "Controle a descida. Despencar no chão tira o efeito do exercício e pode machucar." 
    },
    { 
      titulo: "Corrida com Joelho Alto (Sprint)", 
      descricao: "Cardio explosivo para queima de gordura e resistência de sprint.", 
      tutorial: [
        "Corra no lugar subindo os joelhos até a linha do quadril.",
        "Mantenha o tronco reto e coordene braços rápidos com as pernas.",
        "Respire pelo nariz e expire pela boca de forma vigorosa.",
        "Tente manter a velocidade máxima por todo o tempo do exercício."
      ], 
      explicacaoSimples: "Velocidade total! Suba esses joelhos como se estivesse fugindo de algo. É hora do gás!", 
      cuidado: "Lembre-se: ponta dos pés o tempo todo. Não use o calcanhar para correr no lugar." 
    }
  ],
  avancada: [
    { 
      titulo: "Agachamento com Salto Pliométrico", 
      descricao: "Máxima potência de pernas e queima calórica extrema.", 
      tutorial: [
        "Inicie com um agachamento profundo, mantendo o peito aberto.",
        "Exploda para cima com toda a força, saltando o mais alto que conseguir.",
        "Use os braços para gerar impulso e equilíbrio no ar.",
        "Aterrisse de forma suave, caindo diretamente em um novo agachamento para amortecer."
      ], 
      explicacaoSimples: "Pule como se quisesse tocar o teto! O agachamento e o salto devem ser um único movimento fluido.", 
      cuidado: "O foco aqui é o amortecimento. Nunca caia com os joelhos travados. Silêncio no pouso." 
    },
    { 
      titulo: "Flexão de Braço (Nível Avançado)", 
      descricao: "Domínio total de força de empurre e estabilidade abdominal.", 
      tutorial: [
        "Apoie apenas mãos e as pontas dos pés no chão. Mantenha o corpo reto como ferro.",
        "Desça até o peito quase tocar o chão. Mantenha os cotovelos próximos às costelas (45 graus).",
        "Empurre com explosão máxima até travar os braços no topo.",
        "Não deixe a cabeça 'pendurar', mantenha o olhar ligeiramente à frente."
      ], 
      explicacaoSimples: "Força bruta e controle. Seu corpo é uma prancha que sobe e desce em bloco.", 
      cuidado: "Se sua lombar curvar para baixo, pare imediatamente. Qualidade técnica é inegociável aqui." 
    },
    { 
      titulo: "Burpee Tradicional de Competição", 
      descricao: "O maior aliado do condicionamento físico e da queima de gordura.", 
      tutorial: [
        "Agache, coloque as mãos no chão e salte jogando as pernas para trás em posição de prancha.",
        "Realize uma flexão de braço encostando o peito no chão. Suba na flexão.",
        "Salte trazendo os pés de volta para as mãos e finalize com um salto explosivo batendo as mãos no alto.",
        "Mantenha the movimento sem interrupções entre as repetições."
      ], 
      explicacaoSimples: "O rei dos exercícios de corpo todo. Cada burpee é um passo a mais na sua resistência!", 
      cuidado: "Mesmo cansada, mantenha o abdômen travado na prancha para proteger sua lombar." 
    },
    { 
      titulo: "Afundo com Salto (Power Lunge)", 
      descricao: "Desenvolvimento de potência assimétrica e definição muscular de glúteos.", 
      tutorial: [
        "Posicione-se em um afundo profundo.",
        "Salte verticalmente com explosão e troque a posição das pernas no ar.",
        "Amorteça a queda caindo já na posição de afundo com o outro lado.",
        "Mantenha o tronco orgulhoso e os braços em equilíbrio ativo."
      ], 
      explicacaoSimples: "Troca rápida e explosiva! Sinta a força em cada perna de forma individual.", 
      cuidado: "Mantenha o joelho da frente alinhado. Se perder o equilíbrio, diminua a velocidade do salto." 
    },
    { 
      titulo: "Prancha Comutativa (Mãos/Cotovelos)", 
      descricao: "Trabalho dinâmico de core, ombros e resistência muscular de braços.", 
      tutorial: [
        "Comece na prancha de cotovelos. Mantenha o corpo reto.",
        "Suba para a posição de mãos, esticando um braço de cada vez, sem balançar o quadril.",
        "Retorne aos cotovelos imediatamente e repita o ciclo.",
        "Tente manter suas costas como uma mesa estável durante toda a mudança."
      ], 
      explicacaoSimples: "Um exercício de força e concentração. Sobe e desce com o corpo todo blindado.", 
      cuidado: "O segredo está em não girar o quadril. Ative o abdômen ao máximo para travar o corpo." 
    },
    { 
      titulo: "Abdominal Canivete Atlético", 
      descricao: "Extrema contração de toda a parede abdominal e controle motor.", 
      tutorial: [
        "Deitada totalmente esticada, braços e pernas fora do chão.",
        "Ao expirar, suba o tronco e as pernas esticadas ao mesmo tempo, encontrando-os no centro.",
        "Tente tocar os pés e segurar por meio segundo a contração.",
        "Retorne quase tocando o chão e reinicie com explosão."
      ], 
      explicacaoSimples: "Mãos nos pés! Um movimento potente que exige força de todo o seu core.", 
      cuidado: "Mantenha as pernas o mais esticadas possível. Se sentir a lombar, dobre levemente os joelhos." 
    },
    { 
      titulo: "Agachamento Pistola (Unipodal)", 
      descricao: "O ápice da força de membros inferiores e equilíbrio corporal.", 
      tutorial: [
        "Fique em uma perna só, com a outra esticada à frente do corpo.",
        "Desça o quadril lentamente, mantenha o equilíbrio e o peso no calcanhar que está no chão.",
        "Vá até onde conseguir manter as costas retas e suba com força total.",
        "Use os braços esticados à frente para equilibrar seu centro de massa."
      ], 
      explicacaoSimples: "Força máxima em uma perna. É um desafio de mestre, faça com foco total!", 
      cuidado: "Se não conseguir descer tudo, use o batente de uma porta como apoio leve para as mãos." 
    },
    { 
      titulo: "Prancha com Rotação Torácica", 
      descricao: "Core, oblíquos e mobilidade funcional da coluna.", 
      tutorial: [
        "Fique na prancha alta (mãos no chão).",
        "Eleve um braço apontando-o diretamente para o teto, girando o tronco superior.",
        "Acompanhe o movimento da mão com o olhar. Retorne e faça o mesmo para o outro lado.",
        "Mantenha o abdômen firme e não deixe o quadril 'dançar' para fora da linha."
      ], 
      explicacaoSimples: "Gire e aponte para o céu. Um exercício de força que também 'abre' sua postura.", 
      cuidado: "A rotação deve vir das costas médias, não apenas do ombro. Movimento controlado." 
    },
    { 
      titulo: "Flexão Diamante (Foco em Tríceps)", 
      descricao: "Isolamento avançado de tríceps e peitoral medial.", 
      tutorial: [
        "Posicione as mãos unidas sob o peito, formando um desenho de 'diamante' com as mãos.",
        "Desça o peito em direção às mãos, mantendo os cotovelos bem fechados e próximos ao corpo.",
        "Empurre com força, sentindo o tríceps trabalhar intensamente.",
        "Mantenha a prancha do corpo perfeita durante todo o tempo."
      ], 
      explicacaoSimples: "A flexão mais difícil para os braços. Foco total naquele músculo do tchauzinho!", 
      cuidado: "Se doer o punho, afaste levemente as mãos. Mantenha the tensão no músculo correto." 
    },
    { 
      titulo: "Sprawl Explosivo (Agilidade)", 
      descricao: "Movimento de defesa e explosão, cardio de altíssimo nível.", 
      tutorial: [
        "Fique em sua posição de combate baseada no movimento.",
        "Mãos no chão, 'chute' as pernas para trás com explosão, encostando o quadril levemente no chão.",
        "Retorne imediatamente para a base e prepare-se para o próximo.",
        "A velocidade de reação é a chave deste exercício."
      ], 
      explicacaoSimples: "Rápido como um raio! Desce e sobe com agilidade de lutadora.", 
      cuidado: "Cuidado ao encostar o quadril no chão para não impactar de forma brusca. Movimento seco." 
    },
    { 
      titulo: "Skipping Intenso (Tiro no Lugar)", 
      descricao: "Capacidade anaeróbica e velocidade de membros inferiores.", 
      tutorial: [
        "Realize uma corrida estacionária na velocidade máxima que conseguir sustentar.",
        "Suba os joelhos até a linha da cintura de forma frenética.",
        "Use os braços como se estivesse disputando uma final olímpica de 100 metros.",
        "Respire de forma curta e controlada, mantendo o foco no cronômetro."
      ], 
      explicacaoSimples: "É o seu máximo! Nada de guardar energia, dê tudo de si nesse sprint parado!", 
      cuidado: "Postura sempre ereta. Se começar a arquear as costas para trás, reduza levemente o ritmo." 
    },
    { 
      titulo: "Abdominal Infra Esticado (Low Plank)", 
      descricao: "Resistência de glúteo e força abdominal inferior de alavanca longa.", 
      tutorial: [
        "Deitada de costas com braços ao lado do corpo.",
        "Suba as pernas totalmente esticadas até fazerem 90 graus com o corpo.",
        "Desça o mais devagar possível (em 3 a 5 segundos), parando um centímetro antes de tocar o chão.",
        "Mantenha as pernas unidas e a lombar prensada contra o tapete."
      ], 
      explicacaoSimples: "A descida é o segredo. Sinta cada fibra do seu abdômen inferior segurando o peso das pernas.", 
      cuidado: "Se sentir qualquer pontada na lombar, não desça tanto as pernas. O controle é soberano." 
    },
    { 
      titulo: "Mountain Climber 'Cross' (Cruzado)", 
      descricao: "Ativação de core e oblíquos com alta demanda cardiovascular.", 
      tutorial: [
        "Posição de prancha alta. Traga o joelho direito em direção ao cotovelo esquerdo.",
        "Alterne com o joelho esquerdo para o cotovelo direito de forma veloz e cruzada.",
        "Mantenha o tronco superior estável enquanto as pernas 'correm' cruzado sob você.",
        "Mantenha o ritmo intenso do cardio."
      ], 
      explicacaoSimples: "Cruze os joelhos com velocidade! É um trabalho duplo de cintura e coração.", 
      cuidado: "Mantenha as mãos sempre sob os ombros para não sobrecarregar a articulação." 
    },
    { 
      titulo: "Agachamento Isométrico de Parede", 
      descricao: "Resistência de quadríceps e força mental sob fadiga.", 
      tutorial: [
        "Encoste as costas em uma parede e deslize até que suas coxas fiquem em 90 graus (como sentada).",
        "Pressione toda a extensão das costas contra a parede.",
        "Mantenha as mãos relaxadas no ar ou ao lado do corpo; não as apoie nas pernas.",
        "Foque na respiração profunda e ignore a queimação nas pernas."
      ], 
      explicacaoSimples: "Seja a estátua! Sinta suas coxas 'fritarem' enquanto você domina o exercício.", 
      cuidado: "Certifique-se de que seus pés não escorreguem para frente. Use um tênis estável." 
    },
    { 
      titulo: "Tríceps Mergulho Estendido", 
      descricao: "Desafio máximo de braços com sobrecarga do próprio corpo.", 
      tutorial: [
        "Igual ao tríceps banco, mas mantenha as pernas totalmente esticadas à frente.",
        "Desça o máximo que puder de forma controlada.",
        "Empurre com explosão máxima para retornar ao topo.",
        "Ao esticar as pernas, você aumenta significativamente o peso que seus braços precisam carregar."
      ], 
      explicacaoSimples: "Força total nos braços! Quanto mais longe seus pés estiverem, mais pesado fica.", 
      cuidado: "Mantenha o peito aberto para proteger o ombro de qualquer rotação interna excessiva." 
    },
    { 
      titulo: "Agachamento com Salto 180 (Rotacional)", 
      descricao: "Agilidade, potência circular e coordenação avançada.", 
      tutorial: [
        "Realize um agachamento profundo.",
        "Salte com força e gire 180 graus no ar, trocando a direção do corpo.",
        "Aterrisse de forma suave em um novo agachamento imediato.",
        "Gire para o lado oposto na próxima repetição para não ficar tonta."
      ], 
      explicacaoSimples: "Um giro de 180 graus no ar após o agachamento. Dinamismo e explosão pura!", 
      cuidado: "O equilíbrio na aterrissagem é fundamental. Olhe sempre para o ponto de chegada antes de girar." 
    }
  ]
};

export const APP_SALES_LINK = "https://pay.kirvano.com/e4ad9a8c-bee4-4279-be20-8f39c46c17df";
export const PROMO_LINK = "https://pay.kirvano.com/a44cda1b-153b-4e9c-85bc-438f8c014322";
export const FULL_LINK = "https://pay.kirvano.com/3d0f4079-243d-413d-b5e0-dfde69bb123b";
export const TRIAL_DAYS = 7;
export const PROMO_PRICE = 9.90;
export const FULL_PRICE = 12.90;
