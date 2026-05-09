import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/travel
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé." }, { status: 401 });

  const city = req.nextUrl.searchParams.get("city");
  const now = new Date();

  try {
    // Since we don't have a Travel table yet, return empty
    // This will be populated after SQL migration
    return NextResponse.json({ travels: [], myTravel: null });
  } catch {
    return NextResponse.json({ travels: [], myTravel: null });
  }
}

// POST /api/travel
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé." }, { status: 401 });

  const body = await req.json();
  const { city, fromDate, toDate, note } = body;

  if (!city || !fromDate || !toDate) {
    return NextResponse.json({ error: "Données manquantes." }, { status: 400 });
  }

  // For now return success (Travel table to be added)
  return NextResponse.json({ message: "Voyage publié." }, { status: 201 });
}
