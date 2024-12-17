import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { PrismaClient } from "@prisma/client";
import { SHA256 as sha256 } from "crypto-js";
const prisma = new PrismaClient();

// Helper function to hash password
const hashPassword = (password: string): string => {
  return sha256(password).toString();
};

// Function to handle POST request for user creation
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password, phoneNumber } = body;

    // Validate password
    if (!password || password.length < 6) {
      return NextResponse.json(
        { errors: ["Password length should be more than 6 characters"] },
        { status: 400 }
      );
    }

    // Create user in the database
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashPassword(password),
        phoneNumber,
      },
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === "P2002") {
        return NextResponse.json(
          { message: "A unique constraint failed. Please check your data." },
          { status: 400 }
        );
      }
    }
    return NextResponse.json(
      { message: "Something went wrong." },
      { status: 500 }
    );
  }
}

// export async function GET(req: Request) {
//   const { searchParams } = new URL(req.url);
//   const id = searchParams.get("id"); // Get user ID from query parameters

//   if (!id) {
//     return NextResponse.json(
//       { message: "User ID is required." },
//       { status: 400 }
//     );
//   }

//   try {
//     const user = await prisma.user.findUnique({
//       where: { id },
//       select: {
//         id: true,
//         name: true,
//         email: true,
//         phoneNumber: true,
//         address: true,
//         image: true,
//         createdAt: true,
//         updatedAt: true,
//       },
//     });

//     if (!user) {
//       return NextResponse.json({ message: "User not found." }, { status: 404 });
//     }

//     return NextResponse.json({ user }, { status: 200 });
//   } catch (error) {
//     return NextResponse.json(
//       { message: "Something went wrong." },
//       { status: 500 }
//     );
//   }
// }

// // PUT method: Update user profile
// export async function PUT(req: Request) {
//   try {
//     // Parse body
//     const body = await req.json();

//     // Retrieve `id` from query or body
//     const { searchParams } = new URL(req.url);
//     const id = searchParams.get("id") || body.id;

//     // Check if `id` is provided
//     if (!id) {
//       return NextResponse.json(
//         { message: "User ID is required." },
//         { status: 400 }
//       );
//     }

//     // Extract fields to update
//     const { name, email, password, phoneNumber } = body;

//     // Hash password if provided
//     const updateData: any = {
//       ...(name && { name }),
//       ...(email && { email }),
//       ...(password && { password: hashPassword(password) }),
//       ...(phoneNumber && { phoneNumber }),
//     };

//     // Update user in database
//     const updatedUser = await prisma.user.update({
//       where: { id },
//       data: updateData,
//     });

//     return NextResponse.json({ user: updatedUser }, { status: 200 });
//   } catch (e: unknown) {
//     // TypeScript now knows that `e` is of type 'unknown'
//     if (e instanceof Prisma.PrismaClientKnownRequestError) {
//       if (e.code === "P2025") {
//         return NextResponse.json(
//           { message: "User not found." },
//           { status: 404 }
//         );
//       }
//     }

//     // Fallback error handling for unknown errors
//     if (e instanceof Error) {
//       return NextResponse.json(
//         { message: "Something went wrong.", error: e.message },
//         { status: 500 }
//       );
//     }

//     // Handle any unexpected error type
//     return NextResponse.json(
//       { message: "An unexpected error occurred." },
//       { status: 500 }
//     );
//   }
// }

// // DELETE method: Delete user profile
// export async function DELETE(req: Request) {
//   const { searchParams } = new URL(req.url);
//   const id = searchParams.get("id"); // Get user ID from query parameters

//   if (!id) {
//     return NextResponse.json(
//       { message: "User ID is required." },
//       { status: 400 }
//     );
//   }

//   try {
//     await prisma.user.delete({
//       where: { id },
//     });

//     return NextResponse.json(
//       { message: "User deleted successfully." },
//       { status: 200 }
//     );
//   } catch (error) {
//     if (error instanceof Prisma.PrismaClientKnownRequestError) {
//       if (error.code === "P2025") {
//         return NextResponse.json(
//           { message: "User not found." },
//           { status: 404 }
//         );
//       }
//     }

//     return NextResponse.json(
//       { message: "Something went wrong." },
//       { status: 500 }
//     );
//   }
// }
