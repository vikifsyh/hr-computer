import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, OrderStatus } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import Midtrans from "midtrans-client"; // Pastikan Anda menginstal midtrans-client

const prisma = new PrismaClient();

// Pastikan variabel lingkungan ada
const serverKey = process.env.MIDTRANS_SERVER_KEY;
const clientKey = process.env.MIDTRANS_CLIENT_KEY;

if (!serverKey || !clientKey) {
  throw new Error(
    "Midtrans keys are missing. Please check your environment variables."
  );
}

// Konfigurasi Midtrans Snap
let snap = new Midtrans.Snap({
  isProduction: false,
  serverKey: serverKey,
  clientKey: clientKey,
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    console.error("User not authenticated");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const { paymentMethod, orderId } = await req.json();

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
      console.error(`Order with ID ${orderId} not found`);
      return NextResponse.json(
        { error: `Order with ID ${orderId} not found` },
        { status: 404 }
      );
    }

    if (order.userId !== userId) {
      console.error(
        `User ${userId} is not authorized to access order ${orderId}`
      );
      return NextResponse.json(
        { error: "Unauthorized access to order" },
        { status: 403 }
      );
    }

    // Mendapatkan detail pengguna dari session
    const { name, email, address, phoneNumber } = session.user;

    // Menghitung total amount
    const totalAmount = order.orderItems.reduce((sum, item) => {
      return sum + (item.price || 0) * (item.quantity || 0);
    }, 0);

    // Payload pembayaran untuk token transaksi
    const parameter = {
      item_details: order.orderItems.map((item) => ({
        name: item.product.name,
        price: item.price,
        quantity: item.quantity,
      })),
      transaction_details: {
        order_id: `order-${orderId}-${Date.now()}`,
        gross_amount: totalAmount,
      },
      // payment_type: paymentMethod, // Jenis metode pembayaran
      customer_details: {
        first_name: name || "Guest", // Username (atau "Guest" jika tidak ada username)
        email: email || "noemail@example.com", // Email pengguna dari session
        shipping_address: {
          address: address || "Address not provided", // Alamat pengguna
        },
        phone: phoneNumber || "1234567890",
      },
    };

    console.log("Payload to be sent to Midtrans:", parameter);

    // Membuat token transaksi menggunakan Midtrans
    const token = await snap.createTransaction(parameter);
    console.log("Generated Token:", token);

    // Kirim token kepada frontend
    return NextResponse.json({ token });
  } catch (error) {
    console.error("Error during payment process:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error },
      { status: 500 }
    );
  }
}
