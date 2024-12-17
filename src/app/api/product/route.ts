import { PrismaClient } from "@prisma/client";

import mime from "mime";
import { join } from "path";
import { stat, mkdir, writeFile, unlink } from "fs/promises";
import { NextRequest, NextResponse } from "next/server";
import _ from "lodash";

const prisma = new PrismaClient();

type ProductResponse = {
  product?: any;
  error?: string;
  message?: string;
};

export async function POST(
  req: NextRequest
): Promise<NextResponse<ProductResponse>> {
  const formData = await req.formData();

  const name = (formData.get("name") as string) || null;
  const description = (formData.get("description") as string) || null;
  const image = (formData.get("image") as File) || null;
  const price = (formData.get("price") as string) || null;

  if (!image) {
    return NextResponse.json(
      { error: "Image file is required." },
      { status: 400 }
    );
  }

  const buffer = Buffer.from(await image.arrayBuffer());
  const relativeUploadDir = `/uploads/${new Date(Date.now())
    .toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
    .replace(/\//g, "-")}`;

  const uploadDir = join(process.cwd(), "public", relativeUploadDir);

  try {
    await stat(uploadDir);
  } catch (e: any) {
    if (e.code === "ENOENT") {
      await mkdir(uploadDir, { recursive: true });
    } else {
      console.error(
        "Error while trying to create directory when uploading a file\n",
        e
      );
      return NextResponse.json(
        { error: "Something went wrong." },
        { status: 500 }
      );
    }
  }

  try {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const filename = `${image.name.replace(
      /\.[^/.]+$/,
      ""
    )}-${uniqueSuffix}.${mime.getExtension(image.type)}`;
    await writeFile(`${uploadDir}/${filename}`, buffer);
    const fileUrl = `${relativeUploadDir}/${filename}`;

    // Save to database
    const result = await prisma.product.create({
      data: {
        name,
        description,
        price,
        image: fileUrl,
      },
    });

    return NextResponse.json({ product: result });
  } catch (e) {
    console.error("Error while trying to upload a file\n", e);
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 }
    );
  }
}

// PUT Method: Update Product
export async function PUT(req: NextRequest) {
  const formData = await req.formData();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { error: "ID must be provided." },
      { status: 400 }
    );
  }
  const name = (formData.get("name") as string) || null;
  const description = (formData.get("description") as string) || null;
  const image = (formData.get("image") as File) || null;
  const price = (formData.get("price") as string) || null;

  try {
    // Find the existing product
    const existingProduct = await prisma.product.findUnique({ where: { id } });

    if (!existingProduct) {
      return NextResponse.json(
        { error: "Product not found." },
        { status: 404 }
      );
    }

    let fileUrl = existingProduct.image;

    // If a new image is uploaded, replace the old one
    if (image) {
      const buffer = Buffer.from(await image.arrayBuffer());
      const relativeUploadDir = `/uploads/${new Date(Date.now())
        .toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })
        .replace(/\//g, "-")}`;

      const uploadDir = join(process.cwd(), "public", relativeUploadDir);

      try {
        await stat(uploadDir);
      } catch (e: any) {
        if (e.code === "ENOENT") {
          await mkdir(uploadDir, { recursive: true });
        } else {
          console.error(
            "Error while trying to create directory when uploading a file\n",
            e
          );
          return NextResponse.json(
            { error: "Something went wrong." },
            { status: 500 }
          );
        }
      }

      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const filename = `${image.name.replace(
        /\.[^/.]+$/,
        ""
      )}-${uniqueSuffix}.${mime.getExtension(image.type)}`;
      await writeFile(`${uploadDir}/${filename}`, buffer);
      fileUrl = `${relativeUploadDir}/${filename}`;

      // Delete the old image file if it exists
      if (existingProduct.image) {
        const oldImagePath = join(
          process.cwd(),
          "public",
          existingProduct.image
        );
        try {
          await unlink(oldImagePath);
        } catch (e) {
          console.error("Error while trying to delete old image\n", e);
        }
      }
    }

    // Update the product in the database
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        name,
        description,
        price,
        image: fileUrl,
      },
    });

    return NextResponse.json({ product: updatedProduct });
  } catch (e) {
    console.error("Error while trying to update product\n", e);
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 }
    );
  }
}

// DELETE Method: Delete Product
export async function DELETE(req: NextRequest) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id"); // Product ID to delete

  if (!id) {
    return NextResponse.json(
      { error: "Product ID is required." },
      { status: 400 }
    );
  }

  try {
    // Find the existing product
    const existingProduct = await prisma.product.findUnique({ where: { id } });

    if (!existingProduct) {
      return NextResponse.json(
        { error: "Product not found." },
        { status: 404 }
      );
    }

    // Delete the product's image file if it exists
    if (existingProduct.image) {
      const imagePath = join(process.cwd(), "public", existingProduct.image);
      try {
        await unlink(imagePath);
      } catch (e) {
        console.error("Error while trying to delete image file\n", e);
      }
    }

    // Delete the product from the database
    await prisma.product.delete({ where: { id } });

    return NextResponse.json({ message: "Product deleted successfully." });
  } catch (e) {
    console.error("Error while trying to delete product\n", e);
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id"); // Optional Product ID

  try {
    if (id) {
      // Fetch a single product by ID
      const product = await prisma.product.findUnique({ where: { id } });

      if (!product) {
        return NextResponse.json(
          { error: "Product not found." },
          { status: 404 }
        );
      }

      return NextResponse.json({ product });
    } else {
      // Fetch all products
      const products = await prisma.product.findMany();
      return NextResponse.json({ products });
    }
  } catch (e) {
    console.error("Error while trying to fetch products", e);
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 }
    );
  }
}
