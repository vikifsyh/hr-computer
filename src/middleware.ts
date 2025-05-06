import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const AUTH_PATHS = ["/signIn", "/signUp"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl; // Ambil path dari URL
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET }); // Ambil token JWT
  console.log("Token: ", token);
  // 1. Halaman admin hanya bisa diakses oleh ADMIN
  if (pathname.startsWith("/admin")) {
    // Jika token tidak ada atau role bukan ADMIN, redirect ke "/"
    if (!token || (token as { user: { role: string } }).user.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  // 2. Halaman /signIn dan /signUp tidak bisa diakses jika sudah login
  if (AUTH_PATHS.includes(pathname) && token) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Cek akses halaman yang butuh login
  const protectedPaths = ["/cart"];
  if (protectedPaths.includes(pathname) && !token) {
    return NextResponse.redirect(new URL("/signIn", req.url));
  }

  // 3. Jika tidak ada kondisi yang terpenuhi, izinkan akses
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*", // Semua halaman di bawah /admin
    "/cart",
    "/signIn", // Halaman login
    "/signUp", // Halaman register
  ],
};
