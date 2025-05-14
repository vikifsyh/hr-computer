import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { PrismaClient } from "@prisma/client";
import { authOptions } from "../auth/[...nextauth]/options";
const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    // Mengambil session
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "You haven't logged in yet" },
        { status: 401 }
      );
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
        productId: item.product.id,
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

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json(
      { error: "You haven't logged in yet" },
      { status: 401 }
    );
  }

  const userId = session.user.id;
  const { productId, quantity } = await req.json();

  // Cek apakah produk tersedia
  const product = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!product || product.stock === null) {
    return NextResponse.json(
      { error: "Product not found or out of stock" },
      { status: 404 }
    );
  }

  // Jika tidak ada keranjang aktif, buat keranjang baru
  let cart = await prisma.order.findFirst({
    where: {
      userId,
      shippingStatus: "DIKEMAS",
      paymentStatus: "PENDING",
    },
  });

  if (!cart) {
    cart = await prisma.order.create({
      data: {
        userId,
        shippingStatus: "DIKEMAS",
        paymentStatus: "PENDING",
        totalPrice: 0,
      },
    });
  }

  const price = parseFloat(product.price as string);

  if (isNaN(price)) {
    return NextResponse.json(
      { error: "Invalid product price" },
      { status: 400 }
    );
  }

  // Cek apakah produk sudah ada dalam orderItems
  const existingItem = await prisma.orderItem.findFirst({
    where: {
      orderId: cart.id,
      productId,
    },
  });

  let orderItem;

  if (existingItem) {
    const newQuantity = existingItem.quantity + quantity;

    // Validasi stok (stok tersedia + jumlah lama di cart)
    const availableStock = product.stock + existingItem.quantity;

    if (newQuantity > availableStock) {
      return NextResponse.json(
        { error: `Only ${availableStock} items available in stock` },
        { status: 400 }
      );
    }

    // Update quantity
    orderItem = await prisma.orderItem.update({
      where: { id: existingItem.id },
      data: { quantity: newQuantity },
    });

    // Update stok produk
    await prisma.product.update({
      where: { id: product.id },
      data: {
        stock: availableStock - newQuantity,
      },
    });
  } else {
    // Validasi stok untuk item baru
    if (quantity > product.stock) {
      return NextResponse.json(
        { error: `Only ${product.stock} items available in stock` },
        { status: 400 }
      );
    }

    // Tambahkan item baru ke orderItems
    orderItem = await prisma.orderItem.create({
      data: {
        orderId: cart.id,
        productId,
        price,
        quantity,
      },
    });

    // Kurangi stok produk
    await prisma.product.update({
      where: { id: product.id },
      data: {
        stock: product.stock - quantity,
      },
    });
  }

  // Hitung ulang total harga untuk cart
  const orderItems = await prisma.orderItem.findMany({
    where: {
      orderId: cart.id,
    },
  });

  const totalPrice = orderItems.reduce(
    (total, item) => total + item.price * (item.quantity || 1),
    0
  );

  // Update total harga di order
  await prisma.order.update({
    where: { id: cart.id },
    data: { totalPrice },
  });

  return NextResponse.json({ orderItem, totalPrice });
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const itemId = searchParams.get("id");

    if (!itemId) {
      return NextResponse.json(
        { error: "Item ID is required" },
        { status: 400 }
      );
    }

    const orderItem = await prisma.orderItem.findUnique({
      where: { id: itemId },
      include: {
        order: true,
      },
    });

    if (!orderItem) {
      return NextResponse.json(
        { error: "Order item not found" },
        { status: 404 }
      );
    }

    if (
      orderItem.order.userId !== session.user.id &&
      session.user.role !== "ADMIN"
    ) {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 403 }
      );
    }

    await prisma.orderItem.delete({
      where: { id: itemId },
    });

    const product = await prisma.product.findUnique({
      where: { id: orderItem.productId },
    });

    if (product && product.stock !== null) {
      await prisma.product.update({
        where: { id: product.id },
        data: {
          stock: product.stock + orderItem.quantity,
        },
      });
    }

    return NextResponse.json({ message: "Item deleted successfully" });
  } catch (error) {
    console.error("Error in DELETE /api/cart:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { itemId, newQuantity } = await req.json();

  if (!itemId || typeof newQuantity !== "number") {
    return NextResponse.json(
      { error: "Invalid request data" },
      { status: 400 }
    );
  }

  // Cari orderItem berdasarkan itemId
  const orderItem = await prisma.orderItem.findUnique({
    where: { id: itemId },
    include: { product: true, order: true },
  });

  if (!orderItem || !orderItem.product || !orderItem.order) {
    return NextResponse.json(
      { error: "Order item or product not found" },
      { status: 404 }
    );
  }

  // Pastikan hanya user yang punya hak atau admin yang bisa update
  if (
    orderItem.order.userId !== session.user.id &&
    session.user.role !== "ADMIN"
  ) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
  }

  const availableStock = orderItem.product.stock ?? 0;
  const currentQuantityInCart = orderItem.quantity ?? 0;

  // Stok tersedia untuk update = stock di product + quantity yang sudah dipesan user
  const stockAvailableForUpdate = availableStock + currentQuantityInCart;

  if (newQuantity > stockAvailableForUpdate) {
    return NextResponse.json({ error: "Not enough stock" }, { status: 400 });
  }

  // Kalau newQuantity 0, hapus item
  if (newQuantity === 0) {
    await prisma.orderItem.delete({
      where: { id: itemId },
    });

    // Kembalikan stok produk
    await prisma.product.update({
      where: { id: orderItem.productId },
      data: {
        stock: availableStock + currentQuantityInCart,
      },
    });

    // Update total price order setelah hapus
    const remainingItems = await prisma.orderItem.findMany({
      where: { orderId: orderItem.orderId },
    });

    const newTotalPrice = remainingItems.reduce(
      (total, item) => total + item.price * (item.quantity || 1),
      0
    );

    await prisma.order.update({
      where: { id: orderItem.orderId },
      data: { totalPrice: newTotalPrice },
    });

    return NextResponse.json({
      message: "Item deleted successfully",
      newTotalPrice,
    });
  }

  // Update quantity orderItem
  const updatedOrderItem = await prisma.orderItem.update({
    where: { id: itemId },
    data: { quantity: newQuantity },
  });

  // Update stok produk setelah perubahan quantity
  const updatedStock = stockAvailableForUpdate - newQuantity;
  await prisma.product.update({
    where: { id: orderItem.productId },
    data: {
      stock: updatedStock,
    },
  });

  // Hitung total harga order setelah perubahan
  const orderItems = await prisma.orderItem.findMany({
    where: { orderId: orderItem.orderId },
  });

  const totalPrice = orderItems.reduce(
    (total, item) => total + item.price * (item.quantity || 1),
    0
  );

  await prisma.order.update({
    where: { id: orderItem.orderId },
    data: { totalPrice },
  });

  return NextResponse.json({ updatedOrderItem, totalPrice });
}
