import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { z } from "zod";

const schema = z.object({
  prenom: z.string().min(2, "Prénom requis.").max(60),
  lien: z.string().max(40).optional(),
  annee: z.number().int().min(1900).max(new Date().getFullYear()).optional().nullable(),
  note: z.string().max(200).optional(),
  anonymous: z.boolean().default(false),
});

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  const { searchParams } = req.nextUrl;
  const mine = searchParams.get("mine") === "true";
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const take = 20;
  const skip = (page - 1) * take;

  try {
    const whereClause = mine
      ? Prisma.sql`WHERE d."userId" = ${session.user.id}`
      : Prisma.sql``;

    const defunts = await prisma.$queryRaw<Array<{
      id: string; prenom: string; lien: string | null;
      annee: number | null; note: string | null;
      anonymous: boolean; createdAt: Date;
      userId: string; userName: string | null;
      prayerCount: bigint; hasPrayed: boolean; isOwn: boolean;
    }>>`
      SELECT
        d.id, d.prenom, d.lien, d.annee, d.note,
        d.anonymous, d."createdAt", d."userId",
        u.name AS "userName",
        COUNT(dp.id) AS "prayerCount",
        BOOL_OR(dp."userId" = ${session.user.id}) AS "hasPrayed",
        (d."userId" = ${session.user.id}) AS "isOwn"
      FROM "Defunt" d
      LEFT JOIN "User" u ON u.id = d."userId"
      LEFT JOIN "DefuntPrayer" dp ON dp."defuntId" = d.id
      ${whereClause}
      GROUP BY d.id, u.name
      ORDER BY d."createdAt" DESC
      LIMIT ${take} OFFSET ${skip}
    `;

    const total = await prisma.defunt.count(
      mine ? { where: { userId: session.user.id } } : undefined
    );

    return NextResponse.json({
      defunts: defunts.map((d) => ({
        ...d,
        prayerCount: Number(d.prayerCount),
        createdAt: d.createdAt.toISOString(),
        userName: d.anonymous && !d.isOwn ? null : d.userName,
      })),
      total,
      pages: Math.ceil(total / take),
    });
  } catch (e) {
    console.error("[DEFUNTS_GET]", e);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const count = await prisma.defunt.count({ where: { userId: session.user.id } });
    if (count >= 20) {
      return NextResponse.json({ error: "Limite de 20 défunts atteinte." }, { status: 429 });
    }

    const defunt = await prisma.defunt.create({
      data: { ...parsed.data, userId: session.user.id },
    });

    return NextResponse.json({ defunt }, { status: 201 });
  } catch (e) {
    console.error("[DEFUNTS_POST]", e);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
