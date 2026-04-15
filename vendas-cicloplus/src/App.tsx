import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import SlimDayApp from "./components/SlimDayApp.tsx";

const queryClient = new QueryClient();

const App = () => {
  const appMode = import.meta.env.VITE_APP_MODE;
  const hostname = window.location.hostname;

  // Detecta se o usuário está acessando pelo domínio de vendas
  // ou se a variável de ambiente SALES_ONLY está ativa.
  const isSalesMode = appMode === "SALES_ONLY" || hostname.includes("vendas");
  
  // Detecta se o usuário está acessando pelo domínio do app
  // ou se a variável de ambiente APP_ONLY está ativa.
  const isAppMode = appMode === "APP_ONLY" || hostname.includes("slimday.vercel.app");

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Se estiver no domínio do App ou modo APP_ONLY, a raiz manda pro app */}
            <Route path="/" element={isAppMode && !isSalesMode ? <Navigate to="/app" /> : <Index />} />
            
            {/* Se estiver no domínio de Vendas ou modo SALES_ONLY, o /app volta pra venda */}
            <Route path="/app" element={isSalesMode && !isAppMode ? <Navigate to="/" /> : <SlimDayApp />} />
            
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
