import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    // Mengambil session
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Menyaring berdasarkan role
    const userId = session.user.id;

    // Jika user adalah "ADMIN", maka izinkan mengakses semua data
    if (session.user.role === "ADMIN") {
      // Query untuk mendapatkan semua order data
      const orders = await prisma.order.findMany({
        include: {
          user: true, // Menyertakan data user
          orderItems: {
            include: {
              product: true, // Menyertakan data produk yang dipesan
            },
          },
        },
      });

      // Format data sesuai kebutuhan
      const formattedOrders = orders.map((order) => ({
        id: order.id,
        userName: order.user?.name || "Unknown User",
        status: order.shippingStatus,
        paymentStatus: order.paymentStatus || "Unpaid",
        totalQuantity: order.orderItems.reduce(
          (total, item) => total + (item.quantity || 0),
          0
        ),
        totalItems: order.orderItems.length,
        orderItems: order.orderItems.map((item) => ({
          id: item.id,
          productName: item.product.name,
          quantity: item.quantity,
          productImage: item.product.image,
          price: item.product.price || 0,
        })),
      }));

      return NextResponse.json({ orders: formattedOrders });
    }

    // Jika user adalah "USER", hanya dapat melihat data miliknya sendiri
    const orders = await prisma.order.findMany({
      where: {
        userId: userId, // Filtering berdasarkan userId
      },
      include: {
        user: true, // Menyertakan data user
        orderItems: {
          include: {
            product: true, // Menyertakan data produk yang dipesan
          },
        },
      },
    });

    // Format data sesuai kebutuhan
    const formattedOrders = orders.map((order) => ({
      id: order.id,
      userName: order.user?.name || "Unknown User",
      address: order.user?.address || "Unknown Address",
      status: order.shippingStatus,
      paymentStatus: order.paymentStatus || "Unpaid",
      totalQuantity: order.orderItems.reduce(
        (total, item) => total + (item.quantity || 0),
        0
      ),
      totalItems: order.orderItems.length,
      orderItems: order.orderItems.map((item) => ({
        id: item.id,
        productName: item.product.name,
        quantity: item.quantity,
        price: item.product.price || 0,
        productImage: item.product.image,
      })),
    }));

    return NextResponse.json({ orders: formattedOrders });
  } catch (error) {
    console.error("Error in GET /api/cart:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// export async function GET(req: NextRequest) {
//   const session = await getServerSession(authOptions);

//   if (!session) {
//     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//   }

//   const { role, id: userId } = session.user;

//   try {
//     let orders;

//     if (role === "ADMIN") {
//       // Admin: Lihat semua pesanan
//       orders = await prisma.order.findMany({
//         include: {
//           user: true,
//           orderItems: {
//             include: {
//               product: true,
//             },
//           },
//         },
//       });
//     } else if (role === "USER") {
//       // User: Lihat pesanan milik user
//       orders = await prisma.order.findMany({
//         where: {
//           userId: userId,
//         },
//         include: {
//           orderItems: {
//             include: {
//               product: true,
//             },
//           },
//         },
//       });
//     }

//     // Jika tidak ada pesanan, kembalikan array kosong
//     return NextResponse.json({ orders: orders || [] });
//   } catch (error) {
//     console.error("Error fetching orders:", error);
//     return NextResponse.json(
//       { error: "Internal Server Error" },
//       { status: 500 }
//     );
//   }
// }

export async function POST(req: NextRequest) {
  // Mengambil session
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id; // Pastikan userId ada di session
  const { productId, quantity } = await req.json();

  // Cek apakah ada keranjang dengan status 'CART' untuk user
  let cart = await prisma.order.findFirst({
    where: {
      userId,
      shippingStatus: "DIKEMAS",
    },
  });

  // Jika tidak ada, buat keranjang baru dengan status 'CART' dan set paymentStatus ke 'PENDING'
  if (!cart) {
    cart = await prisma.order.create({
      data: {
        userId,
        shippingStatus: "DIKEMAS",
        paymentStatus: "PENDING", // Menambahkan paymentStatus dengan nilai default 'PENDING'
        totalPrice: 0, // Inisialisasi totalPrice sebagai 0
      },
    });
  }

  // Ambil harga produk dari database berdasarkan productId
  const product = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  // Pastikan harga produk adalah number
  const price = parseFloat(product.price as string);

  if (isNaN(price)) {
    return NextResponse.json(
      { error: "Invalid product price" },
      { status: 400 }
    );
  }

  // Buat item baru di orderItems
  const orderItem = await prisma.orderItem.create({
    data: {
      orderId: cart.id,
      productId,
      price,
      quantity,
    },
  });

  // Hitung total harga semua item dalam keranjang
  const orderItems = await prisma.orderItem.findMany({
    where: {
      orderId: cart.id,
    },
  });

  const totalPrice = orderItems.reduce(
    (total, item) => total + item.price * (item.quantity || 1),
    0
  );

  // Perbarui totalPrice di tabel order
  await prisma.order.update({
    where: { id: cart.id },
    data: { totalPrice },
  });

  return NextResponse.json({ orderItem, totalPrice });
}

export async function DELETE(req: NextRequest) {
  try {
    // Mengambil session
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Mendapatkan parameter `id` dari URL
    const { searchParams } = new URL(req.url);
    const itemId = searchParams.get("id");

    if (!itemId) {
      return NextResponse.json(
        { error: "Item ID is required" },
        { status: 400 }
      );
    }

    // Cek apakah item yang diminta milik user yang sedang login
    const orderItem = await prisma.orderItem.findUnique({
      where: { id: itemId },
      include: {
        order: true, // Sertakan informasi tentang order
      },
    });

    if (!orderItem) {
      return NextResponse.json(
        { error: "Order item not found" },
        { status: 404 }
      );
    }

    // Pastikan user yang login adalah pemilik order atau admin
    if (
      orderItem.order.userId !== session.user.id &&
      session.user.role !== "ADMIN"
    ) {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 403 }
      );
    }

    // Hapus item
    await prisma.orderItem.delete({
      where: { id: itemId },
    });

    return NextResponse.json({ message: "Item deleted successfully" });
  } catch (error) {
    console.error("Error in DELETE /api/cart:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
