import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  CalendarDays,
  Heart,
  Sparkles,
  CheckCircle2,
  Star,
  ShieldCheck,
  ArrowRight,
  Gift,
  Clock3,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const testimonials = [
  {
    name: "Camila S.",
    text: "Eu sempre esquecia quando minha menstruação ia chegar. Com o Ciclo+ eu me organizo muito melhor e adapto meus treinos!",
    stars: 5,
  },
  {
    name: "Fernanda L.",
    text: "Poder ver as fases do ciclo junto com meu plano de treino mudou tudo. Nos dias de TPM eu já sei que preciso pegar mais leve.",
    stars: 5,
  },
  {
    name: "Juliana R.",
    text: "Por R$9,90 é muito barato pelo que entrega. Recomendo demais!",
    stars: 5,
  },
];

const benefits = [
  {
    icon: CalendarDays,
    title: "Calendário menstrual completo",
    desc: "Acompanhe todas as fases do seu ciclo com visualização mensal clara e intuitiva.",
  },
  {
    icon: Zap,
    title: "Treinos adaptados ao ciclo",
    desc: "Seu plano se ajusta automaticamente à fase que você está — mais intenso ou mais leve.",
  },
  {
    icon: Heart,
    title: "Bem-estar personalizado",
    desc: "Dicas de alimentação e autocuidado para cada fase do seu ciclo.",
  },
  {
    icon: Flame,
    title: "Cálculo Calórico Personalizado",
    desc: "Metas de calorias diárias ajustadas automaticamente ao seu peso, idade e objetivo.",
  },
  {
    icon: ShieldCheck,
    title: "Previsões inteligentes",
    desc: "Saiba quando sua próxima menstruação vai chegar e se prepare com antecedência.",
  },
];

const faqs = [
  {
    q: "O que é o Ciclo+?",
    a: "É o módulo premium do SlimDay que adiciona um calendário menstrual completo ao seu app, adaptando treinos e alimentação ao seu ciclo.",
  },
  {
    q: "Preciso pagar mensalidade?",
    a: "Não! É um pagamento único de R$9,90 e o acesso é vitalício.",
  },
  {
    q: "Como acesso depois de comprar?",
    a: "Após a confirmação do pagamento, a aba Ciclo+ é desbloqueada automaticamente no seu app.",
  },
  {
    q: "Funciona para ciclos irregulares?",
    a: "Sim! Você pode ajustar a duração do ciclo e da menstruação nas configurações.",
  },
];

export default function Sales() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [purchasing, setPurchasing] = useState(false);

  const handlePurchase = () => {
    setPurchasing(true);
    if (typeof window !== "undefined" && (window as any).fbq) {
      (window as any).fbq("track", "InitiateCheckout");
    }
    window.open("https://pay.kirvano.com/a44cda1b-153b-4e9c-85bc-438f8c014322", "_blank");
    setTimeout(() => setPurchasing(false), 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-purple-50 to-white">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-pink-100 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-1.5">
            <span className="text-xl font-extrabold text-primary">SlimDay</span>
            <span className="rounded-full bg-gradient-to-r from-pink-500 to-violet-600 px-2 py-0.5 text-[11px] font-bold text-white">Ciclo+</span>
          </div>
          <Button
            onClick={handlePurchase}
            className="rounded-full bg-gradient-to-r from-pink-500 to-violet-600 px-5 py-2 text-sm font-semibold text-white shadow hover:from-pink-600 hover:to-violet-700 transition-all"
            size="sm"
          >
            Comprar Ciclo+
          </Button>
        </div>
      </header>
      {/* Hero */}
      <section className="relative overflow-hidden px-4 pb-12 pt-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="mx-auto max-w-2xl"
        >
          <Badge className="mb-4 rounded-full bg-pink-100 px-4 py-1.5 text-pink-700 hover:bg-pink-100 text-sm font-semibold">
            <Gift className="mr-1.5 h-4 w-4" /> Oferta exclusiva para membros
          </Badge>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
            Desbloqueie o{" "}
            <span className="bg-gradient-to-r from-pink-500 to-violet-600 bg-clip-text text-transparent">
              Ciclo+
            </span>
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-slate-600">
            Seu treino e alimentação adaptados ao seu ciclo menstrual.
            <br />
            Mais resultados, mais bem-estar, menos frustração.
          </p>

          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mt-8"
          >
            <Card className="mx-auto max-w-sm rounded-3xl border-2 border-pink-200 bg-white/80 shadow-xl backdrop-blur">
              <CardContent className="p-8 text-center">
                <div className="text-sm font-semibold uppercase tracking-wider text-pink-600">
                  Pagamento único
                </div>
                <div className="mt-2 flex items-baseline justify-center gap-1">
                  <span className="text-lg text-slate-400 line-through">R$29,90</span>
                  <span className="text-5xl font-black text-slate-900">R$9,90</span>
                </div>
                <p className="mt-2 text-sm text-slate-500">Acesso vitalício · Sem mensalidade</p>

                <Button
                  onClick={handlePurchase}
                  disabled={purchasing}
                  className="mt-6 w-full rounded-2xl bg-gradient-to-r from-pink-500 to-violet-600 py-6 text-base font-bold text-white shadow-lg hover:from-pink-600 hover:to-violet-700 transition-all"
                  size="lg"
                >
                  {purchasing ? (
                    <span className="flex items-center gap-2">
                      <Clock3 className="h-5 w-5 animate-spin" /> Processando...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Quero o Ciclo+ agora <ArrowRight className="h-5 w-5" />
                    </span>
                  )}
                </Button>

                <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-400">
                  <ShieldCheck className="h-4 w-4" />
                  Pagamento 100% seguro
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-pink-200/30 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 top-40 h-64 w-64 rounded-full bg-violet-200/30 blur-3xl" />
      </section>

      {/* Benefits */}
      <section className="mx-auto max-w-4xl px-4 py-12">
        <h2 className="mb-8 text-center text-2xl font-bold text-slate-900">
          O que você ganha com o Ciclo+
        </h2>
        <div className="grid gap-5 sm:grid-cols-2">
          {benefits.map((b, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
            >
              <Card className="h-full rounded-2xl border-purple-100 bg-white/70 shadow-md backdrop-blur transition-shadow hover:shadow-lg">
                <CardContent className="flex gap-4 p-6">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-100 to-violet-100">
                    <b.icon className="h-6 w-6 text-violet-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{b.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-slate-600">{b.desc}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Comparison */}
      <section className="mx-auto max-w-2xl px-4 py-12">
        <h2 className="mb-8 text-center text-2xl font-bold text-slate-900">
          SlimDay vs SlimDay + Ciclo+
        </h2>
        <Card className="overflow-hidden rounded-2xl border-purple-100 shadow-lg">
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gradient-to-r from-pink-50 to-violet-50">
                  <th className="px-5 py-4 text-left font-semibold text-slate-700">Recurso</th>
                  <th className="px-5 py-4 text-center font-semibold text-slate-700">SlimDay</th>
                  <th className="px-5 py-4 text-center font-bold text-white bg-gradient-to-r from-pink-500 to-violet-600 rounded-tr-xl">
                    ✨ + Ciclo+
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Treinos personalizados", true, true],
                  ["Plano alimentar", true, true],
                  ["Checklist diário", true, true],
                  ["Streak e progresso", true, true],
                  ["Calendário menstrual", false, true],
                  ["Treino adaptado ao ciclo", false, true],
                  ["Previsão de fases", false, true],
                  ["Dicas por fase do ciclo", false, true],
                  ["Cálculo de calorias por meta", false, true],
                ].map(([feature, free, plus], i) => (
                  <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-slate-50/50"}>
                    <td className="px-5 py-3 text-slate-700">{feature as string}</td>
                    <td className="px-5 py-3 text-center">
                      {free ? (
                        <CheckCircle2 className="mx-auto h-5 w-5 text-emerald-500" />
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-center">
                      {plus ? (
                        <CheckCircle2 className="mx-auto h-5 w-5 text-violet-600" />
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </section>

      {/* Testimonials */}
      <section className="mx-auto max-w-4xl px-4 py-12">
        <h2 className="mb-8 text-center text-2xl font-bold text-slate-900">
          O que dizem nossas usuárias
        </h2>
        <div className="grid gap-5 sm:grid-cols-3">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
            >
              <Card className="h-full rounded-2xl border-pink-100 bg-white/80 shadow-md backdrop-blur">
                <CardContent className="p-6">
                  <div className="flex gap-0.5">
                    {Array.from({ length: t.stars }).map((_, j) => (
                      <Star key={j} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600">"{t.text}"</p>
                  <p className="mt-3 text-sm font-bold text-slate-800">{t.name}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-2xl px-4 py-12">
        <h2 className="mb-8 text-center text-2xl font-bold text-slate-900">
          Perguntas frequentes
        </h2>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <Card
              key={i}
              className="cursor-pointer rounded-2xl border-purple-100 bg-white/80 shadow-sm transition-shadow hover:shadow-md"
              onClick={() => setOpenFaq(openFaq === i ? null : i)}
            >
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-slate-800">{faq.q}</h3>
                  <ArrowRight
                    className={`h-4 w-4 text-slate-400 transition-transform ${
                      openFaq === i ? "rotate-90" : ""
                    }`}
                  />
                </div>
                {openFaq === i && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-3 text-sm leading-relaxed text-slate-600"
                  >
                    {faq.a}
                  </motion.p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-4 pb-20 pt-8 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="mx-auto max-w-md"
        >
          <Sparkles className="mx-auto h-8 w-8 text-violet-500" />
          <h2 className="mt-4 text-2xl font-bold text-slate-900">
            Pronta para treinar com o seu corpo?
          </h2>
          <p className="mt-2 text-slate-600">
            Desbloqueie o Ciclo+ agora por apenas <strong>R$9,90</strong> e transforme sua rotina.
          </p>
          <Button
            onClick={handlePurchase}
            disabled={purchasing}
            className="mt-6 rounded-2xl bg-gradient-to-r from-pink-500 to-violet-600 px-10 py-6 text-base font-bold text-white shadow-lg hover:from-pink-600 hover:to-violet-700 transition-all"
            size="lg"
          >
            {purchasing ? "Processando..." : "Comprar Ciclo+ por R$9,90"}
          </Button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white/60 px-4 py-8 text-center text-xs text-slate-400">
        <p>SlimDay © {new Date().getFullYear()} · Todos os direitos reservados</p>
        <p className="mt-1">Pagamento processado de forma segura</p>
      </footer>
    </div>
  );
}
