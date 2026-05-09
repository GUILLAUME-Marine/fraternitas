import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = process.env.RESEND_FROM_EMAIL || "Fraternitas <hello@fraternitas.fr>";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

// ═══ VERIFICATION EMAIL ═══
export async function sendVerificationEmail(email: string, name: string, token: string) {
  const url = `${APP_URL}/auth/verify-email?token=${token}`;
  return resend.emails.send({
    from: FROM,
    to: email,
    subject: "Vérifiez votre email — Fraternitas",
    html: emailTemplate({
      title: `Bienvenue ${name} ✦`,
      preheader: "Confirmez votre adresse email pour rejoindre Fraternitas",
      body: `
        <p>Merci de rejoindre Fraternitas, la communauté catholique du XXI<sup>e</sup> siècle.</p>
        <p>Cliquez sur le bouton ci-dessous pour vérifier votre adresse email. Ce lien expire dans <strong>24 heures</strong>.</p>
      `,
      ctaText: "Vérifier mon email",
      ctaUrl: url,
      footer: "Si vous n'avez pas créé de compte, ignorez cet email.",
    }),
  });
}

// ═══ PASSWORD RESET ═══
export async function sendPasswordResetEmail(email: string, name: string, token: string) {
  const url = `${APP_URL}/auth/reset-password?token=${token}`;
  return resend.emails.send({
    from: FROM,
    to: email,
    subject: "Réinitialisation de mot de passe — Fraternitas",
    html: emailTemplate({
      title: "Réinitialiser votre mot de passe",
      preheader: "Demande de réinitialisation de mot de passe",
      body: `
        <p>Bonjour ${name},</p>
        <p>Vous avez demandé la réinitialisation de votre mot de passe. Cliquez sur le bouton ci-dessous.</p>
        <p>Ce lien expire dans <strong>1 heure</strong> et ne peut être utilisé qu'une seule fois.</p>
      `,
      ctaText: "Réinitialiser mon mot de passe",
      ctaUrl: url,
      footer: "Si vous n'avez pas demandé cette réinitialisation, ignorez cet email. Votre mot de passe ne changera pas.",
    }),
  });
}

// ═══ WELCOME ═══
export async function sendWelcomeEmail(email: string, name: string) {
  return resend.emails.send({
    from: FROM,
    to: email,
    subject: "Bienvenue dans Fraternitas ✦",
    html: emailTemplate({
      title: `Bienvenue, ${name} !`,
      preheader: "Votre communauté catholique vous attend",
      body: `
        <p>Votre compte est maintenant actif. Bienvenue dans Fraternitas.</p>
        <p>Commencez par compléter votre profil pour que nous puissions vous suggérer des membres compatibles et des événements près de chez vous.</p>
        <ul style="color:#555;margin:16px 0;padding-left:20px">
          <li style="margin-bottom:8px">🏘️ Rejoignez un cercle local</li>
          <li style="margin-bottom:8px">🗓️ Découvrez les événements</li>
          <li style="margin-bottom:8px">👥 Connectez-vous avec des membres</li>
        </ul>
      `,
      ctaText: "Compléter mon profil",
ctaUrl: `${APP_URL}/dashboard/profile`,
      footer: "Vous recevez cet email car vous venez de créer un compte Fraternitas.",
    }),
  });
}

// ═══ NEW CONNECTION ═══
export async function sendConnectionRequestEmail(
  email: string,
  recipientName: string,
  senderName: string
) {
  return resend.emails.send({
    from: FROM,
    to: email,
    subject: `${senderName} souhaite se connecter avec vous`,
    html: emailTemplate({
      title: "Nouvelle demande de connexion",
      preheader: `${senderName} veut se connecter avec vous sur Fraternitas`,
      body: `
        <p>Bonjour ${recipientName},</p>
        <p><strong>${senderName}</strong> souhaite se connecter avec vous sur Fraternitas.</p>
        <p>Visitez votre dashboard pour accepter ou refuser cette demande.</p>
      `,
      ctaText: "Voir la demande",
      ctaUrl: `${APP_URL}/dashboard/members`,
      footer: "",
    }),
  });
}

// ═══ EVENT REGISTRATION CONFIRMATION ═══
export async function sendEventConfirmationEmail(
  email: string,
  name: string,
  eventTitle: string,
  eventDate: string,
  eventCity: string
) {
  return resend.emails.send({
    from: FROM,
    to: email,
    subject: `Inscription confirmée — ${eventTitle}`,
    html: emailTemplate({
      title: "Inscription confirmée ✓",
      preheader: `Votre place est réservée pour ${eventTitle}`,
      body: `
        <p>Bonjour ${name},</p>
        <p>Votre inscription à l'événement <strong>${eventTitle}</strong> est confirmée.</p>
        <div style="background:#F7F3EC;border-radius:12px;padding:20px;margin:20px 0">
          <p style="margin:0;color:#111009"><strong>📅 Date :</strong> ${eventDate}</p>
          <p style="margin:8px 0 0;color:#111009"><strong>📍 Ville :</strong> ${eventCity}</p>
        </div>
        <p>Vous recevrez un rappel 24h avant l'événement.</p>
      `,
      ctaText: "Voir l'événement",
      ctaUrl: `${APP_URL}/dashboard/events`,
      footer: "Pour annuler votre inscription, connectez-vous à votre compte.",
    }),
  });
}

// ═══ EVENT REMINDER ═══
export async function sendEventReminderEmail(
  email: string,
  name: string,
  eventTitle: string,
  eventDate: string
) {
  return resend.emails.send({
    from: FROM,
    to: email,
    subject: `Rappel — ${eventTitle} demain`,
    html: emailTemplate({
      title: "Rappel d'événement",
      preheader: `${eventTitle} a lieu demain`,
      body: `
        <p>Bonjour ${name},</p>
        <p>Nous vous rappelons que <strong>${eventTitle}</strong> a lieu <strong>demain le ${eventDate}</strong>.</p>
        <p>À demain ! 🙏</p>
      `,
      ctaText: "Voir les détails",
      ctaUrl: `${APP_URL}/dashboard/events`,
      footer: "",
    }),
  });
}

// ═══ PASSWORD CHANGED ═══
export async function sendPasswordChangedEmail(email: string, name: string) {
  return resend.emails.send({
    from: FROM,
    to: email,
    subject: "Votre mot de passe a été modifié",
    html: emailTemplate({
      title: "Mot de passe modifié",
      preheader: "Votre mot de passe Fraternitas a été modifié",
      body: `
        <p>Bonjour ${name},</p>
        <p>Votre mot de passe a été modifié avec succès.</p>
        <p>Si vous n'êtes pas à l'origine de cette modification, contactez-nous immédiatement à <a href="mailto:security@fraternitas.fr">security@fraternitas.fr</a></p>
      `,
      ctaText: "Sécuriser mon compte",
      ctaUrl: `${APP_URL}/dashboard/settings/security`,
      footer: "",
    }),
  });
}

// ═══ TEMPLATE ═══
function emailTemplate({
  title,
  preheader,
  body,
  ctaText,
  ctaUrl,
  footer,
}: {
  title: string;
  preheader: string;
  body: string;
  ctaText: string;
  ctaUrl: string;
  footer: string;
}) {
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#F7F3EC;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
  <span style="display:none;font-size:1px;color:#F7F3EC;max-height:0;overflow:hidden">${preheader}</span>
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F7F3EC;padding:40px 20px">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%">
        <!-- LOGO -->
        <tr><td style="padding:0 0 32px;text-align:center">
          <span style="font-family:Georgia,serif;font-size:22px;color:#111009;letter-spacing:0.05em">✦ Fraternitas</span>
        </td></tr>
        <!-- CARD -->
        <tr><td style="background:#FFFFFF;border-radius:24px;padding:48px 40px;border:1px solid rgba(17,16,9,0.10)">
          <h1 style="font-family:Georgia,serif;font-size:28px;font-weight:400;color:#111009;margin:0 0 24px;letter-spacing:-0.02em">${title}</h1>
          <div style="font-size:15px;color:#555;line-height:1.7">${body}</div>
          ${ctaText ? `
          <div style="text-align:center;margin:36px 0 0">
            <a href="${ctaUrl}" style="display:inline-block;background:#111009;color:#F7F3EC;text-decoration:none;padding:14px 32px;border-radius:99px;font-size:15px;font-weight:500;letter-spacing:0.01em">${ctaText} →</a>
          </div>` : ""}
        </td></tr>
        <!-- FOOTER -->
        ${footer ? `<tr><td style="padding:24px 0;text-align:center">
          <p style="font-size:13px;color:rgba(17,16,9,0.4);margin:0">${footer}</p>
        </td></tr>` : ""}
        <tr><td style="padding:16px 0;text-align:center">
          <p style="font-size:12px;color:rgba(17,16,9,0.3);margin:0">© ${new Date().getFullYear()} Fraternitas · Fait avec ✦ et foi</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
