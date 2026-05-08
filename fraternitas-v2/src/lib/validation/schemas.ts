import { z } from "zod";

// ═══ AUTH ═══
export const registerSchema = z
  .object({
    name: z.string().min(2, "Au moins 2 caractères").max(50).trim(),
    email: z.string().email("Email invalide").toLowerCase().trim(),
    password: z
      .string()
      .min(8, "Au moins 8 caractères")
      .regex(/[A-Z]/, "Au moins une majuscule")
      .regex(/[0-9]/, "Au moins un chiffre")
      .regex(/[^A-Za-z0-9]/, "Au moins un caractère spécial"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z.string().email("Email invalide").toLowerCase().trim(),
  password: z.string().min(1, "Mot de passe requis"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Email invalide").toLowerCase().trim(),
});

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Au moins 8 caractères")
      .regex(/[A-Z]/, "Au moins une majuscule")
      .regex(/[0-9]/, "Au moins un chiffre")
      .regex(/[^A-Za-z0-9]/, "Au moins un caractère spécial"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Mot de passe actuel requis"),
    newPassword: z
      .string()
      .min(8, "Au moins 8 caractères")
      .regex(/[A-Z]/, "Au moins une majuscule")
      .regex(/[0-9]/, "Au moins un chiffre"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

// ═══ PROFILE ═══
export const profileSchema = z.object({
  name: z.string().min(2).max(50).trim(),
  bio: z.string().max(500).optional(),
  city: z.string().min(2).max(100).trim(),
  age: z.number().min(18).max(100).optional(),
  situation: z.string().optional(),
  practiceLevel: z.string().optional(),
  seeking: z.array(z.string()).default([]),
  quote: z.string().max(300).optional(),
  interests: z.array(z.string()).default([]),
});

// ═══ MESSAGES ═══
export const messageSchema = z.object({
  conversationId: z.string().cuid(),
  content: z.string().min(1).max(2000).trim(),
});

export const newConversationSchema = z.object({
  receiverId: z.string().cuid(),
  content: z.string().min(1).max(2000).trim(),
});

// ═══ EVENTS ═══
export const eventSchema = z.object({
  title: z.string().min(3, "Au moins 3 caractères").max(100).trim(),
  description: z.string().min(10, "Au moins 10 caractères").max(2000).trim(),
  type: z.enum(["REPAS","RETRAITE","PRIERE","RANDONNEE","LECTURE","BENEVOLAT","SPORT","CULTURE","PRO","AUTRE"]),
  city: z.string().min(2).max(100).trim(),
  address: z.string().max(200).optional(),
  startDate: z.string().min(1, "Date requise"),
  endDate: z.string().optional(),
  maxAttendees: z.number().min(2).max(1000).optional(),
  price: z.number().min(0).max(9999).default(0),
  isPublic: z.boolean().default(true),
});

// ═══ CIRCLES ═══
export const circleSchema = z.object({
  name: z.string().min(3).max(100).trim(),
  description: z.string().max(1000).optional(),
  city: z.string().min(2).max(100).trim(),
  isPrivate: z.boolean().default(false),
  rules: z.string().max(2000).optional(),
});

// ═══ CIRCLE MESSAGE ═══
export const circleMessageSchema = z.object({
  circleId: z.string().cuid(),
  content: z.string().min(1).max(2000).trim(),
});

// ═══ REPORT ═══
export const reportSchema = z.object({
  reportedId: z.string().optional(),
  eventId: z.string().optional(),
  reason: z.string().min(5).max(100),
  details: z.string().max(1000).optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
export type MessageInput = z.infer<typeof messageSchema>;
export type EventInput = z.infer<typeof eventSchema>;
export type CircleInput = z.infer<typeof circleSchema>;
