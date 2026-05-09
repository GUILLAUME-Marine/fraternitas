import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, subject, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Champs requis manquants." }, { status: 400 });
    }

    // Validation email basique
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Email invalide." }, { status: 400 });
    }

    // Si RESEND_API_KEY est configuré, on envoie via Resend
    if (process.env.RESEND_API_KEY && process.env.RESEND_FROM_EMAIL) {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: process.env.RESEND_FROM_EMAIL,
          to: ["contact@fraternitas.app"],
          reply_to: email,
          subject: `[Fraternitas Contact] ${subject || "Message depuis le site"} — ${name}`,
          html: `
            <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #111009;">
              <div style="border-bottom: 1px solid #e5e0d5; padding-bottom: 24px; margin-bottom: 24px;">
                <p style="font-size: 12px; font-weight: 500; letter-spacing: 2px; text-transform: uppercase; color: #C49A3C; margin: 0 0 8px;">
                  Nouveau message — Fraternitas
                </p>
                <h1 style="font-size: 24px; font-weight: 400; margin: 0; color: #111009;">
                  ${subject || "Message de contact"}
                </h1>
              </div>

              <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 8px 0; font-size: 13px; color: rgba(17,16,9,0.45); width: 100px; vertical-align: top;">Nom</td>
                  <td style="padding: 8px 0; font-size: 14px; color: #111009; font-weight: 500;">${name}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-size: 13px; color: rgba(17,16,9,0.45); vertical-align: top;">Email</td>
                  <td style="padding: 8px 0; font-size: 14px; color: #111009;">
                    <a href="mailto:${email}" style="color: #C49A3C;">${email}</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-size: 13px; color: rgba(17,16,9,0.45); vertical-align: top;">Sujet</td>
                  <td style="padding: 8px 0; font-size: 14px; color: #111009;">${subject || "—"}</td>
                </tr>
              </table>

              <div style="background: #F7F3EC; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
                <p style="font-size: 12px; font-weight: 500; letter-spacing: 1px; text-transform: uppercase; color: rgba(17,16,9,0.4); margin: 0 0 12px;">Message</p>
                <p style="font-size: 15px; line-height: 1.8; color: rgba(17,16,9,0.75); margin: 0; white-space: pre-wrap;">${message}</p>
              </div>

              <p style="font-size: 12px; color: rgba(17,16,9,0.3); margin: 0;">
                Message envoyé depuis fraternitas.app · ${new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
              </p>
            </div>
          `,
        }),
      });

      if (!res.ok) {
        console.error("[CONTACT_API] Resend error:", await res.text());
        return NextResponse.json({ error: "Erreur d'envoi. Réessayez." }, { status: 500 });
      }
    } else {
      // Sans Resend : on log le message (dev)
      console.log("[CONTACT_FORM]", { name, email, subject, message });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[CONTACT_API]", error);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
