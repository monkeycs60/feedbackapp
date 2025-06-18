import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        creatorProfile: true,
        roasterProfile: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        primaryRole: user.primaryRole
      },
      creatorProfile: user.creatorProfile,
      roasterProfile: user.roasterProfile
    });
  } catch (error) {
    console.error("Erreur récupération profils:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}