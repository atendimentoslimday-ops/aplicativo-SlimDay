import bombomTamara from "./images/bombom_tamara_amendoim_1776468148510.png";
import mousseMaracuja from "./images/mousse_maracuja_chia_1776468162077.png";
import pudimCoco from "./images/pudim_coco_manga_1776468175254.png";
import sorveteBanana from "./images/sorvete_banana_canela_1776468190807.png";
import trufaCacau from "./images/trufa_cacau_amendoas_1776468205054.png";
import frangoGergelim from "./images/frango_gergelim_1776468225494.png";
import salmaoBrocolis from "./images/salmao_brocolis_limao_1776468238832.png";
import strogonoffCogumelo from "./images/strogonoff_cogumelos_light_1776468251717.png";
import espagueteCenoura from "./images/espaguete_cenoura_pesto_1776468265581.png";
import tacosAlface from "./images/tacos_alface_carne_1776468279796.png";
import tilapiaGraoBico from "./images/tilapia_grao_bico_1776468300666.png";
import escondidinhoAbobora from "./images/escondidinho_abobora_frango_1776468315939.png";
import risotoCouveFlor from "./images/risoto_couve_flor_camarao_1776468329514.png";
import bowlQuinoa from "./images/bowl_quinoa_abacate_ovo_1776468343211.png";
import almondegasPatinho from "./images/almondegas_patinho_molho_1776468357207.png";
import paoQueijo from "./images/pao_queijo_frigideira_aveia_1776468380405.png";
import smoothieFrutas from "./images/smoothie_frutas_vermelhas_1776468392771.png";

const foodImages: Record<string, string> = {
  // IDs do Novo Banco Padronizado
  "p-cafe-1": "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=512&h=512&fit=crop&q=80", 
  "p-cafe-2": "https://images.unsplash.com/photo-1594179047519-13ac9735e831?w=512&h=512&fit=crop&q=80",
  "p-almoco-1": frangoGergelim,
  "p-almoco-2": "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=512&h=512&fit=crop&q=80",
  "p-lanche-t-1": "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=512&h=512&fit=crop&q=80",
  "p-lanche-1": "https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=512&h=512&fit=crop&q=80",
  "p-jantar-1": tacosAlface,
  "p-jantar-2": "https://images.unsplash.com/photo-1512058560550-42749359a767?w=512&h=512&fit=crop&q=80",

  "e-cafe-1": "https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?w=512&h=512&fit=crop&q=80",
  "e-almoco-1": salmaoBrocolis,
  "e-lanche-t-1": "https://images.unsplash.com/photo-1585238341267-1cfec2046a55?w=512&h=512&fit=crop&q=80",
  "e-lanche-1": "https://images.unsplash.com/photo-1511910849309-0dffb8785146?w=512&h=512&fit=crop&q=80",
  "e-jantar-1": risotoCouveFlor,

  "st-cafe-1": "https://images.unsplash.com/photo-1502301103665-0b95cc738def?w=512&h=512&fit=crop&q=80",
  "st-almoco-1": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=512&h=512&fit=crop&q=80",
  "st-lanche-t-1": smoothieFrutas,
  "st-lanche-1": "https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=512&h=512&fit=crop&q=80",
  "st-jantar-1": "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=512&h=512&fit=crop&q=80",

  "c-cafe-1": "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=512&h=512&fit=crop&q=80",
  "c-almoco-1": escondidinhoAbobora,
  "c-lanche-t-1": "https://images.unsplash.com/photo-1528825871115-3581a5387919?w=512&h=512&fit=crop&q=80",
  "c-lanche-1": "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=512&h=512&fit=crop&q=80",
  "c-jantar-1": espagueteCenoura,

  // Docinhos por Título
  "Bombom de Tâmara e Amendoim": bombomTamara,
  "Mousse de Maracujá com Chia": mousseMaracuja,
  "Pudim de Leite de Coco e Manga": pudimCoco,
  "Sorvete de Banana e Canela": sorveteBanana,
  "Trufa de Cacau e Amêndoas": trufaCacau,
};

export const recipeImages: Record<string, string> = new Proxy(foodImages, {
  get(target, prop: string) {
    return target[prop] || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=512&h=512&fit=crop&q=80";
  },
});
