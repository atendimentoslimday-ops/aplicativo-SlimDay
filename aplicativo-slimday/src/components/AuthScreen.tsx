import React from "react";
import { Sparkles, Mail, Lock, User, RefreshCcw, ShieldCheck, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AuthScreenProps {
  mode: "login" | "register";
  setMode: (mode: "login" | "register") => void;
  nome: string;
  setNome: (v: string) => void;
  email: string;
  setEmail: (v: string) => void;
  senha: string;
  setSenha: (v: string) => void;
  devCode?: string;
  setDevCode?: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onResetPassword?: () => void | Promise<void>;
  loading: boolean;
  error?: string;
  success?: string;
}

export function AuthScreen({
  mode, setMode, nome, setNome, email, setEmail, senha, setSenha,
  devCode, setDevCode, onSubmit, onResetPassword, loading, error, success
}: AuthScreenProps) {
  return (
    <div className="min-h-screen bg-white px-4 py-12 md:py-24 overflow-hidden relative">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[150px] rounded-full -mr-64 -mt-64" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-rose-50/20 blur-[150px] rounded-full -ml-64 -mb-64" />

      <div className="mx-auto max-w-5xl grid lg:grid-cols-[1.1fr,0.9fr] gap-12 items-center relative z-10">
        <div className="space-y-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-bold uppercase tracking-widest">
              <Sparkles className="h-4 w-4" /> SlimDay App
            </div>
            <h1 className="text-5xl md:text-7xl font-serif leading-[1.1]">Evolua no <span className="text-primary italic">seu tempo.</span></h1>
            <p className="text-lg text-slate-700 font-light max-w-md leading-relaxed">
              O ecossistema definitivo para mulheres que buscam equilíbrio entre rotina corrida e bem-estar real.
            </p>
          </div>

          <div className="grid gap-4">
            {[
              { icon: <ShieldCheck className="h-5 w-5" />, title: "Dados Seguros", desc: "Privacidade absoluta no seu acompanhamento." },
              { icon: <RefreshCcw className="h-5 w-5" />, title: "Sincronização Nuvem", desc: "Acesse de qualquer lugar, sempre de onde parou." },
            ].map((feature, i) => (
              <div key={i} className="flex gap-4 p-5 rounded-3xl bg-white border border-slate-100 shadow-sm transition-all hover:shadow-md">
                <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">
                  {feature.icon}
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-sm">{feature.title}</p>
                  <p className="text-xs text-slate-700 mt-0.5">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Card className="rounded-[48px] border-none shadow-premium p-10 bg-white shadow-2xl">
          <CardHeader className="p-0 mb-8 space-y-2">
            <CardTitle className="text-3xl font-serif italic">{mode === "login" ? "Entrar" : "Criar Conta"}</CardTitle>
            <CardDescription className="font-light text-slate-600">
              {mode === "login" ? "Bem-vinda de volta ao seu espaço." : "Comece hoje sua nova fase."}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <form onSubmit={onSubmit} className="space-y-6">
              {error && <div className="p-4 rounded-2xl bg-rose-50 text-rose-700 text-sm border border-rose-100">{error}</div>}
              {success && <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-700 text-sm border border-emerald-100">{success}</div>}
              
              <div className="space-y-4">
                {mode === "register" && (
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-widest text-slate-600 ml-1">Seu Nome</Label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input className="h-14 pl-12 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Como quer ser chamada?" required={mode === "register"} />
                    </div>
                  </div>
                )}
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-widest text-slate-600 ml-1">Seu E-mail</Label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input type="email" className="h-14 pl-12 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@exemplo.com" required />
                  </div>
                </div>
                {setDevCode ? (
                  <div className="p-4 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center">
                    <p className="text-[10px] uppercase font-bold text-slate-600">Modo Desenvolvedor Ativo</p>
                    <p className="text-xs text-slate-700 mt-1">Sua senha comum não é necessária.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center ml-1">
                      <Label className="text-xs font-bold uppercase tracking-widest text-slate-600">Sua Senha</Label>
                      {mode === "login" && onResetPassword && (
                        <button type="button" onClick={onResetPassword} className="text-xs font-semibold text-rose-500 hover:text-rose-600 transition-colors">
                          Esqueci a senha?
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                      <Input type="password" className="h-14 pl-12 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white" value={senha} onChange={(e) => setSenha(e.target.value)} placeholder="••••••••" required={mode === "register"} />
                    </div>
                  </div>
                )}

                {setDevCode && (
                   <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-widest text-slate-600 ml-1">Chave de Acesso Admin (Opcional)</Label>
                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                        <Input type="password" className="h-14 pl-12 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white" value={devCode || ""} onChange={(e) => setDevCode(e.target.value)} placeholder="Apenas para desenvolvedores" />
                    </div>
                   </div>
                )}
              </div>

              <Button type="submit" className="w-full h-16 rounded-2xl bg-secondary hover:bg-black font-bold text-lg shadow-xl shadow-black/5" disabled={loading}>
                {loading ? "Processando..." : mode === "login" ? "Acessar Painel" : "Criar Meu Plano"}
              </Button>

              <button type="button" className="w-full text-sm font-semibold text-slate-600 hover:text-primary transition-colors py-2" onClick={() => setMode(mode === "login" ? "register" : "login")}>
                {mode === "login" ? "Ainda não tem conta? Clique aqui" : "Já possui uma conta? Faça login"}
              </button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
