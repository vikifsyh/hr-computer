import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { PrismaClient } from "@prisma/client";
import { authOptions } from "../auth/[...nextauth]/options";
const prisma = new PrismaClient();

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { productId, offerPrice } = body;

  try {
    const negotiation = await prisma.negotiation.create({
      data: {
        productId,
        offerPrice,
        userId: session.user.id,
      },
    });
    return NextResponse.json({ negotiation });
  } catch (error) {
    return NextResponse.json({ error: "Failed to negotiate" }, { status: 500 });
  }
}

// GET semua negosiasi (khusus admin)
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const productId = req.nextUrl.searchParams.get("productId");

  if (productId) {
    // Ambil negosiasi berdasarkan user dan product
    const negotiations = await prisma.negotiation.findMany({
      where: {
        userId: session.user.id,
        productId: productId,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ negotiations });
  }

  // Jika user ADMIN, kembalikan semua negosiasi
  if (session.user.role === "ADMIN") {
    const negotiations = await prisma.negotiation.findMany({
      include: { user: true, product: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ negotiations });
  }

  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}
