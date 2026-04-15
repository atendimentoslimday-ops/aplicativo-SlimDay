import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// CORS headers - only allow our domain in production
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-webhook-secret",
};

/**
 * Kirvano Webhook Handler - secure server-side purchase confirmation.
 *
 * This Edge Function receives the payment webhook from Kirvano,
 * validates the secret token, and ONLY THEN inserts the purchase
 * record in the database and unlocks the feature for the user.
 *
 * The client (browser) NEVER inserts or modifies purchases directly.
 */
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    // 1. Validate webhook secret (Kirvano sends this as a header or query param)
    const WEBHOOK_SECRET = Deno.env.get("KIRVANO_WEBHOOK_SECRET");
    if (!WEBHOOK_SECRET) {
      console.error("KIRVANO_WEBHOOK_SECRET is not configured");
      return new Response(JSON.stringify({ error: "Server misconfiguration" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Accept secret via header OR query param (Kirvano supports both)
    const url = new URL(req.url);
    const secretFromHeader = req.headers.get("x-webhook-secret");
    const secretFromQuery = url.searchParams.get("secret");
    const providedSecret = secretFromHeader || secretFromQuery;
    
    // Determine product type from URL (defaulting to App to be safe)
    const productType = url.searchParams.get("type") || "app";

    if (!providedSecret || providedSecret !== WEBHOOK_SECRET) {
      console.warn("Webhook: invalid secret attempt");
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2. Parse the webhook payload from Kirvano
    const body = await req.json();
    console.log("Kirvano webhook received:", JSON.stringify(body));

    // Kirvano typical payload fields (adapt if needed):
    // body.event         -> "purchase.approved" | "purchase.refunded" etc.
    // body.sale.id       -> unique transaction ID
    // body.sale.status   -> "approved" | "refunded"
    // body.buyer.email   -> buyer's email
    // body.product.id    -> product ID
    const event = body?.event || body?.status;
    const transactionId = body?.sale?.id || body?.id || body?.transaction_id;
    const buyerEmail = body?.buyer?.email || body?.customer?.email || body?.email;
    const saleStatus = body?.sale?.status || body?.status;

    if (!transactionId || !buyerEmail) {
      console.error("Webhook: missing required fields", { transactionId, buyerEmail });
      return new Response(JSON.stringify({ error: "Invalid payload: missing transaction_id or email" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 3. Only process approved purchases
    const isApproved =
      event === "purchase.approved" ||
      saleStatus === "approved" ||
      saleStatus === "APPROVED";

    if (!isApproved) {
      console.log(`Webhook: ignoring event "${event}" with status "${saleStatus}"`);
      return new Response(JSON.stringify({ ok: true, message: "Event ignored" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 4. Use service_role client (bypasses RLS) - SAFE because this is server-side
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // 5. Find the user by email
    let userId;
    const { data: userData, error: userError } = await supabaseAdmin
      .from("profiles")
      .select("user_id")
      .eq("email", buyerEmail.toLowerCase().trim())
      .maybeSingle();

    if (userError || !userData) {
      console.log(`Webhook: User not found for ${buyerEmail}. Auto-creating via invite...`);
      // Auto-create user securely
      const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
        buyerEmail.toLowerCase().trim()
      );
      
      if (inviteError || !inviteData?.user) {
        console.error("Webhook: Failed to auto-create user", inviteError);
        return new Response(JSON.stringify({ error: "Failed to create user" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      userId = inviteData.user.id;
      // Wait a moment for the database trigger `handle_new_user` to create the profile row
      await new Promise(resolve => setTimeout(resolve, 800));
    } else {
      userId = userData.user_id;
    }

    // 6. Insert the purchase record (idempotent via unique constraint on external_transaction_id)
    const { error: insertError } = await supabaseAdmin
      .from("purchases")
      .upsert(
        {
          user_id: userId,
          product_type: productType,
          price: body?.sale?.price || body?.price || 9.90,
          status: "completed",
          external_transaction_id: String(transactionId),
          webhook_received_at: new Date().toISOString(),
        },
        { onConflict: "external_transaction_id", ignoreDuplicates: true }
      );

    if (insertError) {
      console.error("Webhook: failed to insert purchase", insertError);
      return new Response(JSON.stringify({ error: "Database error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 7. Unlock correct feature on the user's profile
    const updatePayload = productType === "calendar" ? { cycle_unlocked: true } : { app_unlocked: true };
    const { error: updateError } = await supabaseAdmin
      .from("profiles")
      .update(updatePayload)
      .eq("user_id", userId);

    if (updateError) {
      console.error("Webhook: failed to unlock feature for user", userId, updateError);
    }

    console.log(`Webhook: purchase confirmed and cycle unlocked for user ${userId}`);

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Webhook unexpected error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
