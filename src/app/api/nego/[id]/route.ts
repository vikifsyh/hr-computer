import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { PrismaClient } from "@prisma/client";
import { authOptions } from "../../auth/[...nextauth]/options";

const prisma = new PrismaClient();

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  const negotiation = await prisma.negotiation.findUnique({
    where: { id },
    include: { user: true, product: true },
  });

  if (!negotiation) {
    return NextResponse.json(
      { error: "Negotiation not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(negotiation);
}
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { status } = await req.json(); // hanya ambil status dari body
  const id = params.id; // ambil id dari URL parameter

  if (!id || !status) {
    return NextResponse.json(
      { error: "Missing id or status" },
      { status: 400 }
    );
  }

  try {
    const updated = await prisma.negotiation.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({ updated });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update negotiation" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  await prisma.negotiation.delete({
    where: { id },
  });

  return NextResponse.json({ message: "Deleted" });
}
