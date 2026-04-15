const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const TARGET_EMAIL = "atendimentoslimday@gmail.com";
const GATEWAY_URL = "https://connector-gateway.lovable.dev/resend";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { type, message, name, email } = await req.json();

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return new Response(JSON.stringify({ error: "Mensagem é obrigatória" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (message.length > 2000) {
      return new Response(JSON.stringify({ error: "Mensagem muito longa" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const typeLabels: Record<string, string> = {
      sugestao: "💡 Sugestão de melhoria",
      ideia: "🌟 Nova ideia",
      problema: "🐛 Algo não funcionou",
      elogio: "💕 Elogio",
      outro: "📝 Outro",
    };

    const typeLabel = typeLabels[type] || type || "Não informado";
    const safeName = (name || "Anônimo").slice(0, 100);
    const safeEmail = (email || "Não informado").slice(0, 255);
    const safeMessage = message.slice(0, 2000);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    const res = await fetch(`${GATEWAY_URL}/emails`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "X-Connection-Api-Key": RESEND_API_KEY,
      },
      body: JSON.stringify({
        from: "SlimDay Feedback <onboarding@resend.dev>",
        to: [TARGET_EMAIL],
        subject: `[SlimDay Feedback] ${typeLabel} - ${safeName}`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
            <div style="background:linear-gradient(135deg,#fce7f3,#fdf2f8);border-radius:16px;padding:24px;margin-bottom:20px;">
              <h1 style="color:#831843;margin:0 0 8px;">Novo feedback do SlimDay 🌸</h1>
              <p style="color:#9d174d;margin:0;">Uma usuária enviou uma mensagem pelo app.</p>
            </div>
            <div style="background:#fff;border:1px solid #fce7f3;border-radius:12px;padding:20px;">
              <p><strong>Tipo:</strong> ${typeLabel}</p>
              <p><strong>Nome:</strong> ${safeName}</p>
              <p><strong>E-mail:</strong> ${safeEmail}</p>
              <hr style="border:none;border-top:1px solid #fce7f3;margin:16px 0;">
              <p><strong>Mensagem:</strong></p>
              <p style="white-space:pre-wrap;color:#334155;">${safeMessage.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>
            </div>
            <p style="color:#94a3b8;font-size:12px;text-align:center;margin-top:20px;">Enviado via SlimDay App</p>
          </div>
        `,
      }),
    });

    const data = await res.text();
    console.log("Resend response:", res.status, data);

    if (!res.ok) {
      throw new Error(`Resend API failed [${res.status}]: ${data}`);
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Feedback error:", error);
    return new Response(JSON.stringify({ error: "Erro ao enviar feedback" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
