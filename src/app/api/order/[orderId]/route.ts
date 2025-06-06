import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";

const prisma = new PrismaClient();

export async function PUT(req: NextRequest) {
  const url = new URL(req.url);
  const orderId = url.pathname.split("/").pop(); // Mengambil orderId dari URL path

  if (!orderId) {
    return NextResponse.json(
      { error: "Order ID is missing in the URL." },
      { status: 400 }
    );
  }

  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json(
      { error: "Unauthorized. Please log in first." },
      { status: 401 }
    );
  }

  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { user: true },
    });

    if (!order) {
      return NextResponse.json(
        { error: `Order with ID ${orderId} not found.` },
        { status: 404 }
      );
    }

    const { shippingStatus, trackingNumber } = await req.json();

    if (!shippingStatus) {
      return NextResponse.json(
        { error: "Shipping status is required." },
        { status: 400 }
      );
    }

    // Admin logic
    if (session.user.role === "ADMIN") {
      if (shippingStatus === "DIKIRIM" && !trackingNumber) {
        return NextResponse.json(
          {
            error:
              "Tracking number is required when marking order as 'DIKIRIM'.",
          },
          { status: 400 }
        );
      }

      const updatedOrder = await prisma.order.update({
        where: { id: orderId },
        data: { shippingStatus, trackingNumber },
        include: { user: true },
      });

      return NextResponse.json({
        message: "Shipping status updated successfully.",
        order: {
          ...updatedOrder,
          customerName: updatedOrder.user?.name || "Unknown",
          address: updatedOrder.user?.address || "No Address Provided",
        },
      });
    }

    // User logic
    if (session.user.role === "USER") {
      if (shippingStatus !== "SELESAI") {
        return NextResponse.json(
          { error: "Users can only mark orders as 'SELESAI'." },
          { status: 403 }
        );
      }

      if (order.shippingStatus !== "DIKIRIM") {
        return NextResponse.json(
          {
            error:
              "Order must be 'DIKIRIM' before it can be marked as 'SELESAI'.",
          },
          { status: 400 }
        );
      }

      const updatedOrder = await prisma.order.update({
        where: { id: orderId },
        data: { shippingStatus },
        include: { user: true },
      });

      return NextResponse.json({
        message: "Order marked as completed.",
        order: {
          ...updatedOrder,
          customerName: updatedOrder.user?.name || "Unknown",
          address: updatedOrder.user?.address || "No Address Provided",
        },
      });
    }

    return NextResponse.json(
      { error: "Unauthorized action." },
      { status: 403 }
    );
  } catch (error: any) {
    console.error("Error updating shipping status:", error);

    return NextResponse.json(
      {
        error: "Internal Server Error",
        details: error.message || "An unexpected error occurred.",
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
        user: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      orders: orders.map((order) => ({
        ...order,
        customerName: order.user?.name || "Unknown",
        address: order.user?.address || "No Address Provided",
        shippingStatus: order.shippingStatus,
      })),
    });
  } catch (error: any) {
    console.error("Error fetching user orders:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}
