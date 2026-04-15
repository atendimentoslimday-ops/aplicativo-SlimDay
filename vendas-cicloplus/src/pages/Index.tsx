import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Sales from "./Sales";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const hostname = window.location.hostname;
    const isSalesSite = import.meta.env.VITE_APP_MODE === "SALES_ONLY" || hostname.includes("vendas");

    // Se estiver no site de vendas, NUNCA redirecionamos para o app.
    if (isSalesSite) return;

    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate("/app");
      }
    };
    checkUser();
  }, [navigate]);

  return <Sales />;
};

export default Index;
