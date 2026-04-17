import React from "react";
import { Mail, MessageCircle, Send, Heart, Sparkles, Zap, ShieldCheck, Globe, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Profile } from "@/data/types";

interface SupportSectionProps {
  profile: Profile;
  userEmail: string;
  feedbackSubject: string;
  setFeedbackSubject: (v: string) => void;
  feedbackMessage: string;
  setFeedbackMessage: (v: string) => void;
}

export function SupportSection({
  profile,
  userEmail,
  feedbackSubject,
  setFeedbackSubject,
  feedbackMessage,
  setFeedbackMessage
}: SupportSectionProps) {
  const handleSendEmail = () => {
    const subjectMap: Record<string, string> = {
      sugestao: "Sugestão de Melhoria",
      elogio: "Depoimento de Cliente",
      duvida: "Dúvida Técnica",
      bug: "Relato de Bug",
      outros: "Contato Geral"
    };
    const mailSubject = encodeURIComponent(`[SlimDay App] ${subjectMap[feedbackSubject]} - ${profile.nome}`);
    const mailBody = encodeURIComponent(
      `Olá, equipe SlimDay!\n\n` +
      `Mensagem: ${feedbackMessage}\n\n` +
      `--\n` +
      `Dados do Perfil:\n` +
      `- Nome: ${profile.nome}\n` +
      `- E-mail: ${userEmail}\n` +
      `- Objetivo: ${profile.objetivo}\n` +
      `- Nível: ${profile.nivel}`
    );
    window.open(`mailto:atendimentoslimday@gmail.com?subject=${mailSubject}&body=${mailBody}`, "_blank");
  };

  return (
    <div className="grid gap-8 animate-in fade-in duration-500">
      <Card className="rounded-[40px] border-none shadow-premium bg-white p-8 md:p-12 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-3xl rounded-full -mr-32 -mt-32" />
        <div className="max-w-3xl relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-50 text-rose-600 font-bold text-[10px] uppercase tracking-widest mb-8">
            <Sparkles className="h-3 w-3" /> Suporte & Evolução
          </div>
          <h3 className="text-4xl md:text-5xl font-serif italic text-slate-900 mb-8 leading-[1.1]">
            Você não está sozinha <br />
            <span className="text-primary">nessa jornada.</span>
          </h3>
          <p className="text-slate-700 text-lg font-light leading-relaxed mb-12">
            O SlimDay é um organismo vivo que evolui com você. Suas sugestões, dúvidas e depoimentos são o que nos movem a criar uma experiência cada vez mais incrível.
          </p>

          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <Card className="rounded-[32px] border-none bg-slate-50 p-8 flex flex-col justify-between transition-all hover:bg-slate-100/80">
              <div>
                <div className="h-12 w-12 rounded-2xl bg-white flex items-center justify-center text-rose-500 mb-6 shadow-sm">
                  <Mail className="h-6 w-6" />
                </div>
                <h4 className="text-xl font-bold text-slate-900 mb-2">E-mail Direto</h4>
                <p className="text-sm text-slate-700 font-light mb-6">Nossa equipe responde em até 24h úteis para casos técnicos.</p>
                <div className="p-4 rounded-2xl bg-white border border-slate-100 text-sm font-medium text-slate-900 select-all text-center">
                  atendimentoslimday@gmail.com
                </div>
              </div>
            </Card>

            <Card className="rounded-[32px] border-none bg-emerald-50 p-8 flex flex-col justify-between transition-all hover:bg-emerald-100/80">
              <div>
                <div className="h-12 w-12 rounded-2xl bg-white flex items-center justify-center text-emerald-600 mb-6 shadow-sm">
                  <MessageCircle className="h-6 w-6" />
                </div>
                <h4 className="text-xl font-bold text-slate-900 mb-2">WhatsApp VIP</h4>
                <p className="text-sm text-slate-700 font-light mb-6">Fale diretamente com nossa central de atendimento humanizado.</p>
              </div>
              <Button 
                className="w-full rounded-[20px] bg-emerald-600 hover:bg-emerald-700 text-white font-black h-14"
                onClick={() => window.open("https://wa.me/5531998798876?text=Olá! Vim pelo App SlimDay e gostaria de suporte.", "_blank")}
              >
                Chamar Agora <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </Card>
          </div>

          <div className="pt-12 border-t border-slate-100">
            <div className="flex items-center gap-3 mb-8">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <Send className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-2xl font-serif italic text-slate-900">Mensagem Rápida</h4>
                <p className="text-[10px] uppercase font-bold text-slate-600 tracking-widest mt-1">Seu feedback constrói o app</p>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="grid gap-3">
                <Label className="text-[10px] uppercase font-bold text-slate-600 tracking-widest ml-1">Assunto do Contato</Label>
                <Select value={feedbackSubject} onValueChange={setFeedbackSubject}>
                  <SelectTrigger className="rounded-2xl h-14 border-slate-100 bg-slate-50/50 focus:bg-white transition-all">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl">
                    <SelectItem value="sugestao">Sugestão de Melhoria</SelectItem>
                    <SelectItem value="elogio">Compartilhar Depoimento</SelectItem>
                    <SelectItem value="duvida">Dúvida Técnica</SelectItem>
                    <SelectItem value="bug">Relatar um Problema</SelectItem>
                    <SelectItem value="outros">Outros Assuntos</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-3">
                <Label className="text-[10px] uppercase font-bold text-slate-600 tracking-widest ml-1">Sua Mensagem</Label>
                <Textarea 
                  placeholder="Conte-nos o que está achando ou como podemos melhorar sua experiência..." 
                  className="min-h-[180px] rounded-[28px] border-slate-100 bg-slate-50/50 focus:bg-white p-6 text-slate-700 focus-visible:ring-primary/20 transition-all"
                  value={feedbackMessage}
                  onChange={(e) => setFeedbackMessage(e.target.value)}
                />
              </div>

              <Button 
                className="w-full h-16 rounded-[24px] bg-primary hover:bg-rose-700 font-black text-lg shadow-xl shadow-rose-200 group"
                disabled={!feedbackMessage.trim()}
                onClick={handleSendEmail}
              >
                Enviar via E-mail <Send className="ml-2 h-5 w-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </Button>
            </div>
          </div>
        </div>
      </Card>
      
      <div className="flex flex-col md:flex-row items-center justify-between px-8 text-slate-600 text-xs font-bold uppercase tracking-widest">
         <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4" /> SlimDay Privacy Secure</div>
         <div className="flex items-center gap-2 mt-4 md:mt-0"><Globe className="h-4 w-4" /> Versão Modular 2.0</div>
      </div>
    </div>
  );
}
