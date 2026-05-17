import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const FROM_EMAIL = "Mandy's Magic Bakery <onboarding@resend.dev>";
const TO_EMAIL = "ismaildiako@gmail.com";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { company, name, email, phone, message } = await req.json();

    if (!company || !name || !email) {
      return new Response(JSON.stringify({ error: "Företagsnamn, kontaktperson och e-post krävs" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const html = `
<!DOCTYPE html>
<html lang="sv">
<head><meta charset="UTF-8"><style>
  body { font-family: Georgia, serif; background: #fdf0f6; margin: 0; padding: 0; }
  .wrapper { max-width: 540px; margin: 40px auto; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(233,30,140,0.10); }
  .header { background: #e91e8c; padding: 32px 40px; text-align: center; }
  .header h1 { color: #fff; font-size: 1.5rem; margin: 0; letter-spacing: 0.03em; }
  .body { padding: 36px 40px; }
  .body h2 { color: #1a1a2e; font-size: 1.1rem; margin-bottom: 20px; }
  .row { margin-bottom: 16px; }
  .label { font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #9ca3af; margin-bottom: 4px; }
  .value { font-size: 0.95rem; color: #1a1a2e; line-height: 1.6; }
  .message-box { background: #fdf0f6; border-left: 4px solid #e91e8c; border-radius: 8px; padding: 14px 18px; margin-top: 20px; }
  .footer { text-align: center; padding: 20px 40px 32px; color: #9ca3af; font-size: 0.8rem; }
</style></head>
<body>
  <div class="wrapper">
    <div class="header"><h1>Mandy's Magic Bakery</h1></div>
    <div class="body">
      <h2>Ny företagsförfrågan</h2>
      <div class="row">
        <div class="label">Företag</div>
        <div class="value">${company}</div>
      </div>
      <div class="row">
        <div class="label">Kontaktperson</div>
        <div class="value">${name}</div>
      </div>
      <div class="row">
        <div class="label">E-post</div>
        <div class="value"><a href="mailto:${email}" style="color:#e91e8c;">${email}</a></div>
      </div>
      <div class="row">
        <div class="label">Telefon</div>
        <div class="value">${phone || "–"}</div>
      </div>
      <div class="message-box">
        <div class="label" style="margin-bottom:8px;">Meddelande</div>
        <div class="value">${message ? message.replace(/\n/g, "<br>") : "–"}</div>
      </div>
    </div>
    <div class="footer">© ${new Date().getFullYear()} Mandy's Magic Bakery</div>
  </div>
</body>
</html>`;

    const emailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: TO_EMAIL,
        reply_to: email,
        subject: `Ny företagsförfrågan från ${company}`,
        html,
      }),
    });

    if (!emailRes.ok) {
      const errText = await emailRes.text();
      console.error("Resend error:", errText);
      return new Response(JSON.stringify({ error: "Kunde inte skicka e-post", detail: errText }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: "Internt fel" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
