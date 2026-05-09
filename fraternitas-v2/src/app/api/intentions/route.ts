import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { z } from "zod";

// ─── Validation ───────────────────────────────────────────────────────────────
const createIntentionSchema = z.object({
  type: z.enum(["PRAYER", "MASS"]),
  text: z
    .string()
    .min(10, "Votre intention doit faire au moins 10 caractères.")
    .max(300, "Votre intention ne peut pas dépasser 300 caractères."),
  anonymous: z.boolean().default(false),
  // Champs spécifiques messe
  massChurch: z.string().max(100).optional(),
  massCity: z.string().max(100).optional(),
  massDate: z.string().datetime().optional().nullable(),
});

// ─── GET /api/intentions ──────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  const { searchParams } = req.nextUrl;
  const filter = searchParams.get("filter") || "all"; // "all" | "mine" | "mass" | "prayer"
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const take = 20;
  const skip = (page - 1) * take;

  // Récupérer la ville de l'utilisateur pour prioriser les intentions locales
  const userProfile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
    select: { city: true },
  });
  const userCity = userProfile?.city || null;

  // ─── Construction de la clause WHERE dynamique avec Prisma.sql ────────────
  // On compose les fragments SQL conditionnellement
  const filterClause =
    filter === "mine"
      ? Prisma.sql`AND i."userId" = ${session.user.id}`
      : filter === "mass"
      ? Prisma.sql`AND i.type = 'MASS'`
      : filter === "prayer"
      ? Prisma.sql`AND i.type = 'PRAYER'`
      : Prisma.sql``;

  // ─── Requête principale ────────────────────────────────────────────────────
  const [intentions, total] = await Promise.all([
    prisma.$queryRaw<
      Array<{
        id: string;
        type: string;
        text: string;
        massChurch: string | null;
        massCity: string | null;
        massDate: Date | null;
        city: string | null;
        anonymous: boolean;
        createdAt: Date;
        userId: string;
        userName: string | null;
        userImage: string | null;
        prayerCount: bigint;
        hasPrayed: boolean;
        isOwn: boolean;
      }>
    >(
      Prisma.sql`
        SELECT
          i.id,
          i.type,
          i.text,
          i."massChurch",
          i."massCity",
          i."massDate",
          i.city,
          i.anonymous,
          i."createdAt",
          i."userId",
          u.name AS "userName",
          u.image AS "userImage",
          COUNT(ip.id) AS "prayerCount",
          BOOL_OR(ip."userId" = ${session.user.id}) AS "hasPrayed",
          (i."userId" = ${session.user.id}) AS "isOwn"
        FROM "Intention" i
        LEFT JOIN "User" u ON u.id = i."userId"
        LEFT JOIN "IntentionPrayer" ip ON ip."intentionId" = i.id
        WHERE i."expiresAt" > NOW()
          ${filterClause}
        GROUP BY i.id, u.name, u.image
        ORDER BY
          CASE WHEN i.city = ${userCity} THEN 0 ELSE 1 END ASC,
          i."createdAt" DESC
        LIMIT ${take} OFFSET ${skip}
      `
    ),
    prisma.intention.count({
      where: {
        expiresAt: { gt: new Date() },
        ...(filter === "mine" ? { userId: session.user.id } : {}),
        ...(filter === "mass" ? { type: "MASS" } : {}),
        ...(filter === "prayer" ? { type: "PRAYER" } : {}),
      },
    }),
  ]);

  // ─── Sérialiser les BigInt (JSON ne supporte pas BigInt natif) ─────────────
  const serialized = intentions.map((i) => ({
    ...i,
    prayerCount: Number(i.prayerCount),
    massDate: i.massDate?.toISOString() || null,
    createdAt: i.createdAt.toISOString(),
    // Anonymiser si demandé et pas la propre intention
    userName: i.anonymous && !i.isOwn ? null : i.userName,
    userImage: i.anonymous && !i.isOwn ? null : i.userImage,
  }));

  return NextResponse.json({
    intentions: serialized,
    total,
    pages: Math.ceil(total / take),
    page,
  });
}

// ─── POST /api/intentions ─────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = createIntentionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { type, text, anonymous, massChurch, massCity, massDate } = parsed.data;

    // Vérification spécifique messe
    if (type === "MASS" && !massChurch && !massCity) {
      return NextResponse.json(
        { error: "Précisez au moins l'église ou la ville pour une intention de messe." },
        { status: 400 }
      );
    }

    // Limite : max 3 intentions actives par utilisateur
    const activeCount = await prisma.intention.count({
      where: {
        userId: session.user.id,
        expiresAt: { gt: new Date() },
      },
    });

    if (activeCount >= 3) {
      return NextResponse.json(
        { error: "Vous avez déjà 3 intentions actives. Attendez qu'elles expirent pour en créer une nouvelle." },
        { status: 429 }
      );
    }

    // Récupérer la ville de l'utilisateur
    const profile = await prisma.profile.findUnique({
      where: { userId: session.user.id },
      select: { city: true },
    });

    // Expiration : 30 jours pour les prières, 7 jours pour les messes
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + (type === "MASS" ? 7 : 30));

    const intention = await prisma.intention.create({
      data: {
        userId: session.user.id,
        type,
        text: text.trim(),
        anonymous,
        massChurch: massChurch || null,
        massCity: massCity || null,
        massDate: massDate ? new Date(massDate) : null,
        city: profile?.city || null,
        expiresAt,
      },
    });

    return NextResponse.json({ intention }, { status: 201 });
  } catch (error) {
    console.error("[INTENTIONS_POST]", error);
    return NextResponse.json(
      { error: "Une erreur est survenue. Réessayez." },
      { status: 500 }
    );
  }
}
