import { PrismaClient } from "@prisma/client";
import mime from "mime";
import { join } from "path";
import { stat, mkdir, writeFile } from "fs/promises";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import _ from "lodash";
import { authOptions } from "../auth/[...nextauth]/options";
import cloudinary from "../../../../lib/cloudinary";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const userId = session.user.id;
  const formData = await req.formData();
  const address = (formData.get("address") as string) || null;
  const image = (formData.get("image") as File) || null;

  let fileUrl: string | null = null;

  if (image) {
    const buffer = Buffer.from(await image.arrayBuffer());
    const base64Image = `data:${image.type};base64,${buffer.toString(
      "base64"
    )}`;

    try {
      const uploadResult = await cloudinary.uploader.upload(base64Image, {
        folder: "user_profiles",
      });
      fileUrl = uploadResult.secure_url;
    } catch (e) {
      console.error("Cloudinary upload error\n", e);
      return NextResponse.json(
        { error: "Image upload failed." },
        { status: 500 }
      );
    }
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(address && { address }),
        ...(fileUrl && { image: fileUrl }),
      },
    });

    return NextResponse.json({ user: updatedUser });
  } catch (e) {
    console.error("Error while trying to update profile\n", e);
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 }
    );
  }
}

// export async function GET(req: Request) {
//   const session = await getServerSession(authOptions);

//   if (!session || !session.user) {
//     return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
//   }

//   const userId = session.user.id;

//   try {
//     const user = await prisma.user.findUnique({
//       where: { id: userId },
//       select: {
//         id: true,
//         name: true,
//         email: true,
//         address: true,
//         image: true,
//         phoneNumber: true,
//         createdAt: true,
//         updatedAt: true,
//       },
//     });

//     if (!user) {
//       return NextResponse.json({ error: "User not found." }, { status: 404 });
//     }

//     return NextResponse.json({ user });
//   } catch (e) {
//     console.error("Error while fetching user profile\n", e);
//     return NextResponse.json(
//       { error: "Something went wrong." },
//       { status: 500 }
//     );
//   }
// }
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const getAllUsers = searchParams.get("all") === "true"; // Parameter untuk mengambil semua data pengguna

  try {
    if (getAllUsers) {
      // Ambil semua pengguna dari database
      const users = await prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          address: true,
          image: true,
          phoneNumber: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return NextResponse.json({ users }); // Kembalikan daftar semua pengguna
    } else {
      // Ambil data pengguna yang sedang login
      const userId = session.user.id;
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          address: true,
          image: true,
          phoneNumber: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!user) {
        return NextResponse.json({ error: "User not found." }, { status: 404 });
      }

      return NextResponse.json({ user }); // Kembalikan data pengguna yang sedang login
    }
  } catch (e) {
    console.error("Error while fetching user profile(s)\n", e);
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const userId = session.user.id;
  const formData = await req.formData();
  const address = (formData.get("address") as string) || null;
  const phoneNumber = (formData.get("phoneNumber") as string) || null;
  const image = (formData.get("image") as File) || null;

  let fileUrl: string | null = null;

  if (image) {
    const buffer = Buffer.from(await image.arrayBuffer());
    const base64Image = `data:${image.type};base64,${buffer.toString(
      "base64"
    )}`;

    try {
      const uploadResult = await cloudinary.uploader.upload(base64Image, {
        folder: "user_profiles",
      });
      fileUrl = uploadResult.secure_url;
    } catch (e) {
      console.error("Cloudinary upload error\n", e);
      return NextResponse.json(
        { error: "Image upload failed." },
        { status: 500 }
      );
    }
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(address && { address }),
        ...(phoneNumber && { phoneNumber }),
        ...(fileUrl && { image: fileUrl }),
      },
    });

    return NextResponse.json({ user: updatedUser });
  } catch (e) {
    console.error("Error while trying to update profile\n", e);
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("id");

  if (!userId) {
    return NextResponse.json(
      { error: "User ID is required." },
      { status: 400 }
    );
  }

  try {
    await prisma.user.delete({
      where: { id: userId },
    });

    return NextResponse.json({ message: "User deleted successfully." });
  } catch (e) {
    console.error("Error while trying to delete user\n", e);
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 }
    );
  }
}
