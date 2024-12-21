import { PrismaClient, CategoryEnum } from "@prisma/client";
import mime from "mime";
import { join } from "path";
import { stat, mkdir, writeFile, unlink } from "fs/promises";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

type ProductResponse = {
  product?: any;
  products?: any[];
  error?: string;
  message?: string;
};

// POST Method: Add Product
export async function POST(
  req: NextRequest
): Promise<NextResponse<ProductResponse>> {
  const formData = await req.formData();

  const name = (formData.get("name") as string) || null;
  const description = (formData.get("description") as string) || null;
  const image = (formData.get("image") as File) || null;
  const price = (formData.get("price") as string) || null;
  const category = (formData.get("category") as string) || null;

  // Validate required fields
  if (!name || !price || !category) {
    return NextResponse.json(
      { error: "Name, price, and category are required fields." },
      { status: 400 }
    );
  }

  // Validate category
  if (!Object.values(CategoryEnum).includes(category as CategoryEnum)) {
    return NextResponse.json(
      { error: "Invalid category provided." },
      { status: 400 }
    );
  }

  const buffer = image ? Buffer.from(await image.arrayBuffer()) : null;
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
  } catch {
    await mkdir(uploadDir, { recursive: true });
  }

  let fileUrl = null;
  if (buffer && image) {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const filename = `${image.name.replace(
      /\.[^/.]+$/,
      ""
    )}-${uniqueSuffix}.${mime.getExtension(image.type)}`;
    await writeFile(`${uploadDir}/${filename}`, buffer);
    fileUrl = `${relativeUploadDir}/${filename}`;
  }

  // Ensure category is passed as CategoryEnum type
  const categoryEnum = category as CategoryEnum;

  const result = await prisma.product.create({
    data: {
      name,
      description,
      price,
      image: fileUrl,
      category: categoryEnum,
    },
  });

  return NextResponse.json({ product: result });
}

// PUT Method: Update Product
export async function PUT(req: NextRequest) {
  const formData = await req.formData();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "ID is required." }, { status: 400 });
  }

  const name = (formData.get("name") as string) || null;
  const description = (formData.get("description") as string) || null;
  const image = (formData.get("image") as File) || null;
  const price = (formData.get("price") as string) || null;
  const category = (formData.get("category") as string) || null;

  if (
    category &&
    !Object.values(CategoryEnum).includes(category as CategoryEnum)
  ) {
    return NextResponse.json(
      { error: "Invalid category provided." },
      { status: 400 }
    );
  }

  const existingProduct = await prisma.product.findUnique({ where: { id } });
  if (!existingProduct) {
    return NextResponse.json({ error: "Product not found." }, { status: 404 });
  }

  let fileUrl = existingProduct.image;
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
    } catch {
      await mkdir(uploadDir, { recursive: true });
    }

    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const filename = `${image.name.replace(
      /\.[^/.]+$/,
      ""
    )}-${uniqueSuffix}.${mime.getExtension(image.type)}`;
    await writeFile(`${uploadDir}/${filename}`, buffer);
    fileUrl = `${relativeUploadDir}/${filename}`;

    if (existingProduct.image) {
      await unlink(join(process.cwd(), "public", existingProduct.image));
    }
  }

  const updatedProduct = await prisma.product.update({
    where: { id },
    data: {
      name,
      description,
      price,
      image: fileUrl,
      category: category ? (category as CategoryEnum) : undefined,
    },
  });

  return NextResponse.json({ product: updatedProduct });
}

// DELETE Method: Delete Product
export async function DELETE(req: NextRequest) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "ID is required." }, { status: 400 });
  }

  const existingProduct = await prisma.product.findUnique({ where: { id } });
  if (!existingProduct) {
    return NextResponse.json({ error: "Product not found." }, { status: 404 });
  }

  if (existingProduct.image) {
    await unlink(join(process.cwd(), "public", existingProduct.image));
  }

  await prisma.product.delete({ where: { id } });
  return NextResponse.json({ message: "Product deleted successfully." });
}

// GET Method: Fetch Products
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");

  if (id) {
    const product = await prisma.product.findUnique({ where: { id } });
    return product
      ? NextResponse.json({ product })
      : NextResponse.json({ error: "Product not found." }, { status: 404 });
  }

  const products = await prisma.product.findMany();
  return NextResponse.json({ products });
}
