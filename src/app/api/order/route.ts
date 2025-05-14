import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const orders = await prisma.order.findMany({
      include: {
        orderItems: { include: { product: true } },
        user: true, // Mengambil data user
      },
    });

    // Menambahkan user name dan address ke setiap order
    const ordersWithUserDetails = orders.map((order) => ({
      ...order,
      customerName: order.user?.name || "Unknown",
      address: order.user?.address || "No Address Provided",
    }));

    return NextResponse.json({ orders: ordersWithUserDetails });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);

  // Pastikan hanya admin yang bisa mengakses
  if (!session || !session.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { orderId, shippingStatus, trackingNumber } = await req.json();

  // Validasi input
  if (!orderId || !["DIKEMAS", "DIKIRIM"].includes(shippingStatus)) {
    return NextResponse.json(
      { error: "Invalid shipping status or missing orderId" },
      { status: 400 }
    );
  }

  try {
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        shippingStatus,
        trackingNumber: shippingStatus === "DIKIRIM" ? trackingNumber : null, // Tracking number hanya diperlukan saat dikirim
      },
      include: {
        user: true, // Menyertakan data user
      },
    });

    return NextResponse.json({
      message: "Shipping status updated successfully",
      order: {
        ...updatedOrder,
        customerName: updatedOrder.user?.name || "Unknown",
        address: updatedOrder.user?.address || "No Address Provided",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update shipping status", details: error },
      { status: 500 }
    );
  }
}
