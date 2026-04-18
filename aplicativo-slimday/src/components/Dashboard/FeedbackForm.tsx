import React, { useState } from "react";
import { Send, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";

interface FeedbackFormProps {
  userId: string | null;
  userEmail: string;
}

export function FeedbackForm({ userId, userEmail }: FeedbackFormProps) {
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim() || !userId) return;
    
    setStatus("sending");
    
    try {
      const { error } = await supabase
        .from("feedbacks")
        .insert({
          user_id: userId,
          user_email: userEmail,
          message: message.trim()
        });

      if (error) throw error;
      
      setStatus("success");
      setMessage("");
    } catch (err) {
      console.error("Erro ao enviar feedback:", err);
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="bg-emerald-50 p-8 rounded-3xl border border-emerald-100 text-center animate-in zoom-in-95 duration-500">
        <div className="h-16 w-16 rounded-full bg-white mx-auto flex items-center justify-center text-emerald-500 mb-6 shadow-sm">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h4 className="text-xl font-serif italic text-emerald-900 mb-2">Mensagem enviada!</h4>
        <p className="text-emerald-700 text-sm font-light leading-relaxed">
          Obrigada feminina! Sua sugestão ajuda o SlimDay a ser cada vez melhor para todas nós.
        </p>
        <Button variant="ghost" className="mt-6 text-emerald-600 font-bold" onClick={() => setStatus("idle")}>Enviar outra sugestão</Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-[10px] uppercase font-bold tracking-[3px] text-slate-300 ml-1">Sua Mensagem</label>
        <Textarea 
          placeholder="Como está sendo sua experiência? O que podemos melhorar?" 
          className="min-h-[160px] rounded-3xl border-slate-100 bg-slate-50/50 focus:bg-white resize-none"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </div>
      {status === "error" && (
        <p className="text-xs text-rose-500 bg-rose-50 p-3 rounded-xl border border-rose-100">
          Ocorreu um erro ao enviar. Tente novamente em instantes.
        </p>
      )}
      <Button 
        type="submit" 
        className="w-full h-14 rounded-2xl bg-slate-900 hover:bg-black font-bold group"
        disabled={status === "sending" || !message.trim() || !userId}
      >
        {status === "sending" ? "Enviando..." : (
          <>Enviar Comentário <Send className="ml-2 h-4 w-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /></>
        )}
      </Button>
    </form>
  );
}
