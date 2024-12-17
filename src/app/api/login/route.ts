import { NextResponse } from "next/server";
import { SHA256 as sha256 } from "crypto-js";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
// Fungsi untuk hashing password
const hashPassword = (password: string): string => {
  return sha256(password).toString();
};

// Fungsi untuk mengecualikan properti tertentu dari user object
const exclude = <T, Key extends keyof T>(
  user: T,
  keys: Key[]
): Omit<T, Key> => {
  for (let key of keys) {
    delete user[key];
  }
  return user;
};

// Handler untuk POST request (login user)
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password }: { email: string; password: string } = body;

    // Validasi input
    if (!email || !password) {
      return NextResponse.json({ message: "Invalid inputs" }, { status: 400 });
    }

    // Cek apakah user ada di database
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
        image: true,
        role: true,
      },
    });

    // Validasi password
    if (user && user.password === hashPassword(password)) {
      // Kembalikan data user tanpa password
      return NextResponse.json(exclude(user, ["password"]), { status: 200 });
    } else {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }
  } catch (error: unknown) {
    console.error("Login error:", error);
    return NextResponse.json(
      { message: "An error occurred during login" },
      { status: 500 }
    );
  }
}
