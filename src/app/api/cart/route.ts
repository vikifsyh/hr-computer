import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// export async function GET(req: NextRequest) {
//   // Mengambil session
//   const session = await getServerSession(authOptions); // Pastikan Anda sudah mengirimkan authOptions dengan benar

//   if (!session || !session.user) {
//     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//   }

//   const userId = session.user.id; // Pastikan userId ada di session

//   // Mendapatkan cart yang berhubungan dengan user
//   const cart = await prisma.order.findFirst({
//     where: {
//       userId,
//       status: "CART", // Status untuk keranjang
//     },
//     include: {
//       orderItems: {
//         include: {
//           product: true,
//         },
//       },
//     },
//   });

//   return NextResponse.json(cart);
// }

export async function GET(req: NextRequest) {
  try {
    // Mengambil session
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Mendapatkan cart yang berhubungan dengan user
    const cart = await prisma.order.findFirst({
      where: {
        userId,
        status: "CART",
      },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
      },
    });

    // Jika cart tidak ditemukan
    if (!cart || !cart.orderItems) {
      return NextResponse.json({ cartTotal: 0, cart: null }); // Default jika cart tidak ada
    }

    // Log data cart untuk memastikan data diterima dengan benar
    console.log("Cart Data:", cart);

    // Hitung total item di cart
    const cartTotal = cart.orderItems.reduce(
      (total, item) => total + (item.quantity || 0),
      0
    );

    return NextResponse.json({ cartTotal, cart });
  } catch (error) {
    console.error("Error in GET /api/cart:", error); // Log untuk debugging
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// export async function GET(req: NextRequest) {
//   // Mengambil session
//   const session = await getServerSession(authOptions);

//   if (!session || !session.user) {
//     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//   }

//   const userId = session.user.id;

//   // Mendapatkan cart yang berhubungan dengan user
//   const cart = await prisma.order.findFirst({
//     where: {
//       userId,
//       status: "CART", // Status untuk keranjang
//     },
//     include: {
//       orderItems: true, // Mengambil order items
//     },
//   });

//   if (!cart) {
//     return NextResponse.json({ cartTotal: 0 }); // Tidak ada cart, jumlah 0
//   }

//   // Hitung total item di cart
//   const cartTotal = cart.orderItems.reduce(
//     (total, item) => total + item.quantity,
//     0
//   );

//   return NextResponse.json({ cartTotal });
// }

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
  // Mengambil session
  const session = await getServerSession(authOptions); // Pastikan authOptions dikirim dengan benar

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id; // Pastikan userId ada di session
  const { productId } = await req.json(); // Ambil productId yang akan dihapus

  // Cek apakah ada keranjang dengan status 'CART' untuk user
  const cart = await prisma.order.findFirst({
    where: {
      userId,
      status: "CART",
    },
    include: {
      orderItems: true,
    },
  });

  // Jika tidak ada keranjang, kembalikan error
  if (!cart) {
    return NextResponse.json({ error: "Cart not found" }, { status: 404 });
  }

  // Cek apakah item dengan productId ada di dalam keranjang
  const orderItem = await prisma.orderItem.findFirst({
    where: {
      orderId: cart.id,
      productId,
    },
  });

  if (!orderItem) {
    return NextResponse.json(
      { error: "Item not found in cart" },
      { status: 404 }
    );
  }

  // Hapus item dari keranjang
  await prisma.orderItem.delete({
    where: {
      id: orderItem.id,
    },
  });

  return NextResponse.json({ message: "Item removed from cart" });
}
