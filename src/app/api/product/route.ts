import { PrismaClient, CategoryEnum } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import cloudinary from "../../../../lib/cloudinary";

const prisma = new PrismaClient();

type ProductResponse = {
  product?: any;
  products?: any[];
  error?: string;
  message?: string;
};

// Fungsi upload ke Cloudinary
async function uploadToCloudinary(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const base64 = buffer.toString("base64");
  const dataUri = `data:${file.type};base64,${base64}`;

  const result = await cloudinary.uploader.upload(dataUri, {
    folder: "products",
  });

  return result.secure_url;
}

// POST
export async function POST(
  req: NextRequest
): Promise<NextResponse<ProductResponse>> {
  const formData = await req.formData();
  const name = (formData.get("name") as string) || null;
  const description = (formData.get("description") as string) || null;
  const image = (formData.get("image") as File) || null;
  const price = (formData.get("price") as string) || null;
  const category = (formData.get("category") as string) || null;
  const stock = formData.get("stock") ? Number(formData.get("stock")) : 0;

  if (!name || !price || !category) {
    return NextResponse.json(
      { error: "Name, price, and category are required fields." },
      { status: 400 }
    );
  }

  if (!Object.values(CategoryEnum).includes(category as CategoryEnum)) {
    return NextResponse.json(
      { error: "Invalid category provided." },
      { status: 400 }
    );
  }

  let fileUrl = null;
  if (image) {
    fileUrl = await uploadToCloudinary(image);
  }

  const categoryEnum = category as CategoryEnum;

  const result = await prisma.product.create({
    data: {
      name,
      description,
      price,
      image: fileUrl,
      stock,
      category: categoryEnum,
    },
  });

  return NextResponse.json({ product: result });
}

// PUT
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
  const stock = formData.get("stock")
    ? Number(formData.get("stock"))
    : undefined;

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
    fileUrl = await uploadToCloudinary(image);

    // OPTIONAL: Hapus gambar lama dari Cloudinary
    if (existingProduct.image?.includes("res.cloudinary.com")) {
      const publicId = getPublicIdFromUrl(existingProduct.image);
      if (publicId) await cloudinary.uploader.destroy(publicId);
    }
  }

  const updatedProduct = await prisma.product.update({
    where: { id },
    data: {
      name,
      description,
      price,
      image: fileUrl,
      stock,
      category: category ? (category as CategoryEnum) : undefined,
    },
  });

  return NextResponse.json({ product: updatedProduct });
}

// DELETE
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

  // OPTIONAL: Hapus file dari Cloudinary
  if (existingProduct.image?.includes("res.cloudinary.com")) {
    const publicId = getPublicIdFromUrl(existingProduct.image);
    if (publicId) await cloudinary.uploader.destroy(publicId);
  }

  await prisma.product.delete({ where: { id } });
  return NextResponse.json({ message: "Product deleted successfully." });
}

// GET
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

// OPTIONAL: Fungsi untuk mendapatkan `public_id` dari URL Cloudinary
function getPublicIdFromUrl(url: string): string | null {
  try {
    const parts = url.split("/");
    const filename = parts[parts.length - 1];
    const [publicId] = filename.split(".");
    const folder = parts.slice(-2, -1)[0];
    return `${folder}/${publicId}`;
  } catch {
    return null;
  }
}
