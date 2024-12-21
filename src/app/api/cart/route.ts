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

    // Jika user adalah "ADMIN", maka izinkan mengakses semua cart
    if (session.user.role === "ADMIN") {
      const carts = await prisma.order.findMany({
        where: {
          status: "CART",
        },
        include: {
          user: true, // Menyertakan data user
          orderItems: {
            include: {
              product: true, // Menyertakan data produk
            },
          },
        },
      });

      // Format data sesuai kebutuhan
      const formattedCarts = carts.map((cart) => ({
        id: cart.id,
        userName: cart.user?.name || "Unknown User",
        status: cart.status,
        totalQuantity: cart.orderItems.reduce(
          (total, item) => total + (item.quantity || 0),
          0
        ),
        totalItems: cart.orderItems.length, // Menambahkan jumlah total barang
        orderItems: cart.orderItems.map((item) => ({
          id: item.id,
          productName: item.product.name,
          productImage: item.product.image,
          quantity: item.quantity,
          price: item.product.price || 0, // Menyertakan harga per item
        })),
      }));

      return NextResponse.json({ carts: formattedCarts });
    }

    // Jika user adalah "USER", hanya dapat melihat cart miliknya
    const carts = await prisma.order.findMany({
      where: {
        status: "CART",
        userId: userId,
      },
      include: {
        user: true, // Menyertakan data user
        orderItems: {
          include: {
            product: true, // Menyertakan data produk
          },
        },
      },
    });

    // Format data sesuai kebutuhan
    const formattedCarts = carts.map((cart) => ({
      id: cart.id,
      userName: cart.user?.name || "Unknown User",
      status: cart.status,
      totalQuantity: cart.orderItems.reduce(
        (total, item) => total + (item.quantity || 0),
        0
      ),
      totalItems: cart.orderItems.length, // Menambahkan jumlah total barang
      orderItems: cart.orderItems.map((item) => ({
        id: item.id,
        productName: item.product.name,
        productImage: item.product.image,
        quantity: item.quantity,
        price: item.product.price || 0, // Menyertakan harga per item
      })),
    }));

    return NextResponse.json({ carts: formattedCarts });
  } catch (error) {
    console.error("Error in GET /api/cart:", error); // Log untuk debugging
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  // Mengambil session
  const session = await getServerSession(authOptions); // Pastikan authOptions dikirim dengan benar

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id; // Pastikan userId ada di session
  const { productId, quantity } = await req.json();

  // Cek apakah ada keranjang dengan status 'CART' untuk user
  let cart = await prisma.order.findFirst({
    where: {
      userId,
      status: "CART",
    },
  });

  // Jika tidak ada, buat keranjang baru
  if (!cart) {
    cart = await prisma.order.create({
      data: {
        userId,
        status: "CART",
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

  // Pastikan harga produk adalah number, dengan mengonversinya jika perlu
  const price = parseFloat(product.price as string); // Jika price berupa string, ubah menjadi number

  // Cek jika harga tidak valid (misalnya NaN atau null)
  if (isNaN(price)) {
    return NextResponse.json(
      { error: "Invalid product price" },
      { status: 400 }
    );
  }

  // Gunakan harga produk dari database saat membuat orderItem
  const orderItem = await prisma.orderItem.create({
    data: {
      orderId: cart.id,
      productId,

      price, // Harga sudah dipastikan berupa number
    },
  });

  return NextResponse.json(orderItem);
}

export async function DELETE(req: NextRequest) {
  try {
    // Mengambil session
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Mengambil `id` dari query parameter
    const { searchParams } = new URL(req.url);
    const orderItemId = searchParams.get("id");

    if (!orderItemId) {
      return NextResponse.json(
        { error: "Missing id parameter" },
        { status: 400 }
      );
    }

    const orderItem = await prisma.orderItem.findUnique({
      where: { id: orderItemId },
      include: { order: true },
    });

    if (!orderItem) {
      return NextResponse.json(
        { error: "Order item not found" },
        { status: 404 }
      );
    }

    if (orderItem.order.userId !== userId && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.orderItem.delete({
      where: { id: orderItemId },
    });

    return NextResponse.json({ message: "Order item deleted successfully" });
  } catch (error) {
    // Persempit tipe error
    if (error instanceof Error) {
      console.error("Error in DELETE /api/cart:", error.message);
      return NextResponse.json(
        { error: "Internal Server Error", details: error.message },
        { status: 500 }
      );
    }

    // Jika tipe error tidak diketahui
    console.error("Unknown error in DELETE /api/cart:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: "Unknown error occurred" },
      { status: 500 }
    );
  }
}
