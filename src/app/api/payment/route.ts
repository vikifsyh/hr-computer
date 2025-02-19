import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import Midtrans from "midtrans-client";

const prisma = new PrismaClient();

const serverKey = process.env.MIDTRANS_SERVER_KEY;
const clientKey = process.env.MIDTRANS_CLIENT_KEY;

if (!serverKey || !clientKey) {
  throw new Error(
    "Midtrans keys are missing. Please check your environment variables."
  );
}

let snap = new Midtrans.Snap({
  isProduction: false,
  serverKey: serverKey,
  clientKey: clientKey,
});

// export async function POST(req: NextRequest) {
//   const session = await getServerSession(authOptions);

//   if (!session || !session.user) {
//     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//   }

//   const userId = session.user.id;
//   const { orderId, paymentStatus } = await req.json();

//   if (!orderId) {
//     return NextResponse.json(
//       { error: "Order ID is required" },
//       { status: 400 }
//     );
//   }

//   try {
//     const order = await prisma.order.findUnique({
//       where: { id: orderId },
//       include: { orderItems: { include: { product: true } } },
//     });

//     if (!order) {
//       return NextResponse.json(
//         { error: `Order with ID ${orderId} not found` },
//         { status: 404 }
//       );
//     }

//     if (order.userId !== userId) {
//       return NextResponse.json(
//         { error: "Unauthorized access to order" },
//         { status: 403 }
//       );
//     }

//     const { name, email, address, phoneNumber } = session.user;

//     const totalAmount = order.orderItems.reduce((sum, item) => {
//       return sum + (item.price || 0) * (item.quantity || 0);
//     }, 0);

//     const parameter = {
//       item_details: order.orderItems.map((item) => ({
//         name: item.product.name,
//         price: item.price,
//         quantity: item.quantity,
//       })),
//       transaction_details: {
//         order_id: `order-${orderId}-${Date.now()}`,
//         gross_amount: totalAmount,
//       },
//       customer_details: {
//         first_name: name || "Guest",
//         email: email || "noemail@example.com",
//         shipping_address: { address: address || "Address not provided" },
//         phone: phoneNumber || "1234567890",
//       },
//     };

//     const token = await snap.createTransaction(parameter);

//     // Jika pembayaran selesai, update status & hapus order items
//     if (paymentStatus === "COMPLETED") {
//       await prisma.order.update({
//         where: { id: orderId },
//         data: { paymentStatus: "COMPLETED" },
//       });

//       await prisma.orderItem.deleteMany({
//         where: { orderId: orderId },
//       });
//     }

//     return NextResponse.json({
//       token,
//       paymentStatus: paymentStatus || "PENDING",
//       customerDetails: {
//         first_name: name || "Guest",
//         email: email || "noemail@example.com",
//         shipping_address: { address: address || "Address not provided" },
//       },
//       items: order.orderItems.map((item) => ({
//         name: item.product.name,
//         price: item.price,
//         quantity: item.quantity,
//       })),
//     });
//   } catch (error) {
//     return NextResponse.json(
//       { error: "Internal Server Error", details: error },
//       { status: 500 }
//     );
//   }
// }

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

    const { name, email, address, phoneNumber } = session.user;

    const totalAmount = order.orderItems.reduce((sum, item) => {
      return sum + (item.price || 0) * (item.quantity || 0);
    }, 0);

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
      customer_details: {
        first_name: name || "Guest",
        email: email || "noemail@example.com",
        shipping_address: { address: address || "Address not provided" },
        phone: phoneNumber || "1234567890",
      },
    };

    const token = await snap.createTransaction(parameter);

    // Jika pembayaran selesai, update status & tandai items sebagai "isDeleted"
    if (paymentStatus === "COMPLETED") {
      await prisma.order.update({
        where: { id: orderId },
        data: { paymentStatus: "COMPLETED" },
      });

      await prisma.orderItem.updateMany({
        where: { orderId: orderId },
        data: { isDeleted: true }, // Tandai sebagai dihapus, tapi tidak benar-benar dihapus
      });
    }

    return NextResponse.json({
      token,
      paymentStatus: paymentStatus || "PENDING",
      customerDetails: {
        first_name: name || "Guest",
        email: email || "noemail@example.com",
        shipping_address: { address: address || "Address not provided" },
      },
      items: order.orderItems.map((item) => ({
        name: item.product.name,
        price: item.price,
        quantity: item.quantity,
        isDeleted: item.isDeleted, // Tambahkan status isDeleted di response
      })),
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error", details: error },
      { status: 500 }
    );
  }
}
