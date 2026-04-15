// Recipe images placeholder - maps recipe IDs and titles to image URLs
// Using placeholder images for now; replace with real images later

const placeholderImage = (seed: string) =>
  `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=512&h=512&fit=crop&q=80`;

const foodImages: Record<string, string> = {
  // Recipe bank IDs
  rp1: "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=512&h=512&fit=crop&q=80",
  rp2: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=512&h=512&fit=crop&q=80",
  rp3: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=512&h=512&fit=crop&q=80",
  re1: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=512&h=512&fit=crop&q=80",
  re2: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=512&h=512&fit=crop&q=80",
  re3: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=512&h=512&fit=crop&q=80",
  st1: "https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=512&h=512&fit=crop&q=80",
  st2: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=512&h=512&fit=crop&q=80",
  st3: "https://images.unsplash.com/photo-1517673400267-0251440c45dc?w=512&h=512&fit=crop&q=80",
  ca1: "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=512&h=512&fit=crop&q=80",
  ca2: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=512&h=512&fit=crop&q=80",
  ca3: "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=512&h=512&fit=crop&q=80",
  // Cycle treats by title
  "Brigadeiro fit de cacau": "https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=512&h=512&fit=crop&q=80",
  "Banana morna com canela e cacau": "https://images.unsplash.com/photo-1481349518771-20055b2a7b24?w=512&h=512&fit=crop&q=80",
  "Mousse fit de iogurte com cacau": "https://images.unsplash.com/photo-1541658016709-82535e94bc69?w=512&h=512&fit=crop&q=80",
  "Morango com chocolate 70%": "https://images.unsplash.com/photo-1587132137056-bfbf0166836e?w=512&h=512&fit=crop&q=80",
  "Frozen de frutas vermelhas": "https://images.unsplash.com/photo-1488900128323-21503983a07e?w=512&h=512&fit=crop&q=80",
  "Iogurte proteico com chia": "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=512&h=512&fit=crop&q=80",
  "Maçã assada com canela": "https://images.unsplash.com/photo-1568702846914-96b305d2ced8?w=512&h=512&fit=crop&q=80",
  "Creme fit de abacate com cacau": "https://images.unsplash.com/photo-1511688878353-3a2f5be94cd7?w=512&h=512&fit=crop&q=80",
  "Cookie fit de banana e aveia": "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=512&h=512&fit=crop&q=80",
  "Pudim fit de chia": "https://images.unsplash.com/photo-1517673400267-0251440c45dc?w=512&h=512&fit=crop&q=80",
};

export const recipeImages: Record<string, string> = new Proxy(foodImages, {
  get(target, prop: string) {
    return target[prop] || "";
  },
});
