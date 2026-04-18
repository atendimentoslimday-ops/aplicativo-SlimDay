import React from "react";
import { 
  Sparkles, 
  Lock, 
  RefreshCcw, 
  Mail, 
  User, 
  ShieldCheck 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AuthScreenProps {
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
}

export function AuthScreen({
  mode, setMode, nome, setNome, email, setEmail, senha,
  setSenha,
  devCode,
  setDevCode,
  onSubmit,
  loading,
  error, success,
}: AuthScreenProps) {
  const isAdminEmail = email.toLowerCase().trim() === "atendimentoslimday@gmail.com";

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#fff7fb_0%,#fff3f8_45%,#ffffff_100%)] px-4 py-12 md:py-24 overflow-hidden relative">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-rose-300/20 blur-[150px] rounded-full -mr-64 -mt-64" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-fuchsia-200/30 blur-[150px] rounded-full -ml-64 -mb-64" />

      <div className="mx-auto max-w-xl relative z-10">
        <div className="space-y-12 text-center mb-12">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-100/50 text-rose-600 border border-rose-200 text-xs font-bold uppercase tracking-[0.22em] mx-auto">
              <Sparkles className="h-4 w-4" /> SlimDay Signature
            </div>
            <h1 className="text-5xl md:text-7xl font-serif leading-[1.1] text-slate-900">
              Floresça no <span className="text-rose-500 italic">seu ritmo.</span>
            </h1>
            <p className="text-lg text-slate-500 font-light max-w-md leading-relaxed mx-auto">
              Um espaço delicado, prático e elegante para mulheres que querem cuidar do corpo sem perder a leveza na rotina.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 text-left">
            {[
              { 
                icon: <Lock className="h-5 w-5" />, 
                title: "Seus dados seguros", 
                desc: "Privacidade e segurança absoluta." 
              },
              { 
                icon: <RefreshCcw className="h-5 w-5" />, 
                title: "Sincronização Nuvem", 
                desc: "Continue de onde parou." 
              },
            ].map((feature, i) => (
              <div key={i} className="flex flex-col items-center sm:items-start gap-3 p-5 rounded-3xl bg-white/40 backdrop-blur-sm border border-rose-100/30 shadow-sm transition-all hover:shadow-md">
                <div className="h-10 w-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-400 shrink-0">
                  {feature.icon}
                </div>
                <div className="text-center sm:text-left">
                  <p className="font-bold text-slate-900 text-sm">{feature.title}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5 font-light">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Card className="rounded-[48px] border border-rose-100/70 shadow-2xl p-10 bg-white/95 backdrop-blur-md relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-50/50 blur-3xl rounded-full -mr-16 -mt-16" />
          
          <CardHeader className="p-0 mb-8 space-y-2 relative z-10 text-center">
            <CardTitle className="text-4xl font-serif italic text-slate-900">
              {mode === "login" ? "Bem-vinda" : "Sua nova fase"}
            </CardTitle>
            <CardDescription className="font-light text-slate-500">
              {mode === "login" ? "Entre no seu painel exclusivo SlimDay." : "Crie sua conta para começar a florescer."}
            </CardDescription>
          </CardHeader>

          <CardContent className="p-0 relative z-10">
            <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="space-y-6">
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
                      <Input 
                        className="h-14 pl-12 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white placeholder:text-slate-300 transform transition-all focus:ring-2 focus:ring-rose-200 shadow-sm" 
                        value={nome} 
                        onChange={(e) => setNome(e.target.value)} 
                        placeholder="Como quer ser chamada?" 
                      />
                    </div>
                  </div>
                )}
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Seu E-mail</Label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                    <Input 
                      className="h-14 pl-12 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white placeholder:text-slate-300 shadow-sm" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                      placeholder="voce@exemplo.com" 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Sua Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                    <Input 
                      type="password" 
                      className="h-14 pl-12 rounded-2xl border-rose-100 bg-slate-50/50 focus:bg-white placeholder:text-slate-300 shadow-sm focus:border-rose-300 focus:ring-0 outline-none" 
                      value={senha} 
                      onChange={(e) => setSenha(e.target.value)} 
                      placeholder="••••••••" 
                    />
                  </div>
                </div>

                <AnimatePresence>
                  {isAdminEmail && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0, marginTop: 0 }} 
                      animate={{ opacity: 1, height: "auto", marginTop: 16 }}
                      exit={{ opacity: 0, height: 0, marginTop: 0 }}
                      className="space-y-2 overflow-hidden"
                    >
                      <Label className="text-xs font-bold uppercase tracking-widest text-rose-500 ml-1">Modo Desenvolvedor Ativo</Label>
                      <div className="relative">
                        <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-rose-400" />
                        <Input 
                          type="password" 
                          className="h-14 pl-12 rounded-2xl border-rose-200 bg-rose-50/30 font-mono text-rose-900 placeholder:text-rose-300 shadow-inner focus:border-rose-400 focus:ring-0 outline-none" 
                          value={devCode} 
                          onChange={(e) => setDevCode(e.target.value)} 
                          placeholder="Código Master" 
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <Button 
                type="submit"
                className="w-full h-16 rounded-2xl bg-gradient-to-r from-rose-500 to-fuchsia-500 hover:from-rose-600 hover:to-fuchsia-600 font-bold text-lg shadow-xl shadow-rose-200 text-white transition-all transform active:scale-[0.98] border-none outline-none" 
                disabled={loading}
              >
                {loading ? "Processando..." : mode === "login" ? "Acessar Painel" : "Criar Meu Plano"}
              </Button>

              <button 
                type="button" 
                className="w-full text-sm font-semibold text-slate-400 hover:text-rose-500 transition-colors py-2 outline-none" 
                onClick={() => setMode(mode === "login" ? "register" : "login")}
              >
                {mode === "login" ? "Ainda não tem conta? Clique aqui" : "Já possui uma conta? Faça login"}
              </button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
