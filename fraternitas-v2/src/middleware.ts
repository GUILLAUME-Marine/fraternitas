// src/middleware.ts
//
// Injecte le header x-pathname dans toutes les requêtes
// pour que dashboard/layout.tsx puisse détecter /spiritual côté serveur.
// Compatible avec le middleware NextAuth existant.

import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default auth((req: NextRequest & { auth: any }) => {
  const res = NextResponse.next();
  res.headers.set("x-pathname", req.nextUrl.pathname);
  return res;
});

export const config = {
  matcher: [
    // Toutes les routes sauf les assets statiques et API auth
    "/((?!_next/static|_next/image|favicon.ico|api/auth).*)",
  ],
};
