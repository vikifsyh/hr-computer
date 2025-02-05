// types/next-auth.d.ts
import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: string; // Tambahkan role
      image: string;
      address: string;
      phoneNumber: string;
    };
  }

  interface User {
    id: string;
    name: string;
    email: string;
    role: string; // Tambahkan role
    image: string;
    address: string;
    phoneNumber: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    user: {
      id: string;
      name: string;
      email: string;
      role: string; // Tambahkan role
      image: string;
      address: string;
      phoneNumber: string;
    };
  }
}
