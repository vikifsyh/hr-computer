"use client";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeftIcon, ShoppingCartIcon } from "@heroicons/react/20/solid";
import "react-toastify/dist/ReactToastify.css"; // Import the styles for toast
import { toast, ToastContainer } from "react-toastify"; // Import ToastContainer and toast
export default function DetailProduct() {
  const { id } = useParams();
  const [product, setProduct] = useState<any>(null);
  const [error, setError] = useState<string>("");

  const [cart, setCart] = useState<any[]>([]);
  const router = useRouter();
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(amount);
  };
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/product?id=${id}`);
        const data = await response.json();

        if (response.ok) {
          setProduct(data.product);
        } else {
          setError(data.error || "Something went wrong.");
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to fetch product";
        console.error("Error fetching product:", errorMessage);
        setError(errorMessage);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]); // Fetch product when the ID changes

  if (error) {
    return <div>{error}</div>;
  }

  if (!product) {
    return <div>Loading...</div>;
  }

  const handleAddToCart = async (product: any) => {
    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productId: product.id, stock: 1 }),
      });

      if (response.ok) {
        const updatedCart = await response.json();
        setCart(updatedCart);
        toast.success("Successfully added to cart!"); // Show success toast
      } else {
        toast.error("Failed to add item to cart"); // Show error toast
      }
    } catch (error) {
      console.error("Error adding item to cart:", error);
      toast.error("Failed to add item to cart"); // Show error toast
    }
  };

  return (
    <div className="mx-5 md:mx-20 my-8 md:my-16">
      {/* <div className="">
        <button
          onClick={() => router.push("/product")}
          className="bg-primary-50 p-2 inline-flex items-center rounded-md text-primary font-medium"
        >
          <ArrowLeftIcon className="mr-2 h-4 w-4" />
          Back to Product
        </button>
      </div> */}
      <section className=" bg-white  dark:bg-gray-900 antialiased">
        <div className="max-w-screen-xl mx-auto ">
          <div className="lg:grid lg:grid-cols-2 lg:gap-8 xl:gap-16">
            <div className="shrink-0 max-w-md lg:max-w-lg mx-auto">
              <Image
                className="w-full rounded-lg"
                src={product.image}
                alt=""
                width={1000}
                height={1000}
              />
            </div>

            <div className="mt-6 sm:mt-8 lg:mt-0">
              <h1 className="text-xl font-semibold text-gray-900 sm:text-2xl ">
                {product.name}
              </h1>
              <div className="mt-4 sm:items-center sm:gap-4 sm:flex">
                <div>
                  <p className="text-2xl font-extrabold text-gray-900 sm:text-3xl dark:text-white">
                    {formatCurrency(product.price)}
                  </p>
                  <p className="text-sm font-medium text-neutral-400 mt-2">
                    {product.stock} stock
                  </p>
                </div>
              </div>

              <div className="mt-6 sm:gap-4 sm:items-center sm:flex sm:mt-8">
                <button
                  onClick={() => handleAddToCart(product)}
                  className="flex items-center justify-center py-2.5 px-5 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-primary-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
                  role="button"
                >
                  <ShoppingCartIcon className="h-5 w-5 mr-2" />
                  Add to cart
                </button>

                <Link
                  href={`https://wa.me/6285848706395?text=${encodeURIComponent(
                    `Halo, saya tertarik dengan produk *${
                      product.name
                    }* seharga *${formatCurrency(
                      product.price
                    )}*. Apakah bisa nego?`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white mt-4 sm:mt-0 bg-primary hover:bg-primary-800 focus:ring-2 focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 flex items-center justify-center"
                >
                  Nego via WhatsApp
                </Link>
              </div>

              <hr className="my-6 md:my-8 border-gray-200 dark:border-gray-800" />
              <p className="uppercase text-lg font-medium text-neutral-500">
                Specifications
              </p>
              <p className="mb-6 text-neutral-400 dark:text-gray-400">
                {product.description
                  .split("\n")
                  .map((item: any, index: any) => (
                    <li className="list-none" key={index}>
                      {item}
                    </li>
                  ))}
              </p>
            </div>
          </div>
        </div>
        <button>
          <Link
            href="/cart"
            className="bg-primary-50 p-2 inline-flex items-center rounded-md text-primary font-medium"
          >
            <ShoppingCartIcon className="mr-2 h-4 w-4" />
            Back to Cart
          </Link>
        </button>
      </section>
      <ToastContainer />
    </div>
  );
}
