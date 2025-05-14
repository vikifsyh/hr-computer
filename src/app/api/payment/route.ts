import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";

import Midtrans from "midtrans-client";
import { authOptions } from "../auth/[...nextauth]/options";

const prisma = new PrismaClient();

const serverKey = process.env.MIDTRANS_SERVER_KEY;
const clientKey = process.env.MIDTRANS_CLIENT_KEY;

if (!serverKey || !clientKey) {
  throw new Error(
    "Midtrans keys are missing. Please check your environment variables."
  );
}

const snap = new Midtrans.Snap({
  isProduction: false,
  serverKey,
  clientKey,
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const { orderId, paymentStatus } = await req.json();

  if (!orderId) {
    return NextResponse.json(
      { error: "Order ID is required" },
      { status: 400 }
    );
  }

  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { orderItems: { include: { product: true } } },
    });

    if (!order) {
      return NextResponse.json(
        { error: `Order with ID ${orderId} not found` },
        { status: 404 }
      );
    }

    if (order.userId !== userId) {
      return NextResponse.json(
        { error: "Unauthorized access to order" },
        { status: 403 }
      );
    }

    const {
      name = "Guest",
      email = "noemail@example.com",
      address = "Address not provided",
      phoneNumber = "1234567890",
    } = session.user;

    const totalAmount = order.orderItems.reduce((sum, item) => {
      return sum + (item.price || 0) * (item.quantity || 0);
    }, 0);

    const parameter = {
      item_details: order.orderItems.map((item) => ({
        name: item.product.name,
        price: item.price || 0,
        quantity: item.quantity || 0,
      })),
      transaction_details: {
        order_id: `order-${orderId}-${Date.now()}`,
        gross_amount: totalAmount,
      },
      customer_details: {
        first_name: name,
        email: email,
        phone: phoneNumber,
        shipping_address: {
          address: address,
        },
      },
      callback_url: "http://localhost:3000/order-history",
    };

    const token = await snap.createTransaction(parameter);

    // Update payment status dan tandai orderItems isDeleted jika sudah bayar
    if (paymentStatus === "COMPLETED") {
      await prisma.order.update({
        where: { id: orderId },
        data: { paymentStatus: "COMPLETED" },
      });

      await prisma.orderItem.updateMany({
        where: { orderId: orderId },
        data: { isDeleted: true }, // Tandai item dihapus setelah pembayaran
      });
    }

    return NextResponse.json({
      token,
      paymentStatus: paymentStatus || "PENDING",
      customerDetails: {
        first_name: name,
        email: email,
        shipping_address: { address: address },
        phone: phoneNumber,
      },
      items: order.orderItems.map((item) => ({
        name: item.product.name,
        price: item.price,
        quantity: item.quantity,
        isDeleted: item.isDeleted,
      })),
    });
  } catch (error) {
    console.error("Payment Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: (error as Error).message },
      { status: 500 }
    );
  }
}
