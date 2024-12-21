"use client";
import { ShoppingCartIcon } from "@heroicons/react/20/solid";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // Import the styles for toast

const SkeletonLoader = () => {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-2 shadow-sm animate-pulse">
      <div className="w-full h-64 bg-gray-300 mb-4 rounded-[4px]" />
      <div className="pt-2">
        <div className="h-6 bg-gray-300 w-3/4 mb-2 rounded"></div>
        <div className="flex items-center gap-4">
          <div className="h-4 bg-gray-300 w-20 rounded"></div>
          <div className="h-4 bg-gray-300 w-20 rounded"></div>
        </div>
      </div>
      <div className="mt-3 mb-4 flex items-center justify-between gap-4">
        <div className="h-6 bg-gray-300 w-20 rounded"></div>
        <div className="h-8 bg-primary-300 w-24 rounded"></div>
      </div>
    </div>
  );
};

const Recommend = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [error, setError] = useState<string>("");
  const [cart, setCart] = useState<any[]>([]);
  const router = useRouter();
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(amount);
  };

  const getRandomProducts = (allProducts: any[]) => {
    const shuffled = allProducts.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 4); // Pick 4 random products
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("/api/product");
        const data = await response.json();

        if (response.ok) {
          setProducts(data.products || [data.product]);
        } else {
          setError(data.error || "Something went wrong.");
        }
      } catch (error) {
        setError("Failed to fetch data");
        console.error("Error fetching products:", error);
      }
    };

    fetchProducts();
  }, []);

  const handleAddToCart = async (product: any) => {
    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productId: product.id, quantity: 1 }),
      });

      if (response.ok) {
        const updatedCart = await response.json();
        setCart(updatedCart);
        toast.success("Successfully added to cart!");
      } else {
        toast.error("Please Login");
      }
    } catch (error) {
      console.error("Error adding item to cart:", error);
      toast.error("Failed to add item to cart");
    }
  };

  return (
    <div className="mx-5 md:mx-20 my-8 md:my-16">
      {error && <p>{error}</p>}
      <h1 className="text-2xl md:text-4xl text-neutral-500 text-center">
        Recommend for You
      </h1>
      <div className="my-10 grid gap-4 md:grid-cols-2 md:mb-8 lg:grid-cols-4">
        {products.length === 0
          ? // Render Skeleton Loader while data is being fetched
            Array(4)
              .fill(0)
              .map((_, index) => <SkeletonLoader key={index} />)
          : getRandomProducts(products).map((product) => (
              <div
                key={product.id}
                className="rounded-lg border border-gray-200 bg-white p-2 shadow-sm"
              >
                <div className="">
                  <Link href={`/product/${product.id}`}>
                    <Image
                      width={1000}
                      height={1000}
                      className="w-full object-cover mb-4 rounded-[4px]"
                      style={{ height: 300 }}
                      src={product.image}
                      alt={product.name}
                    />
                  </Link>
                </div>
                <div className="pt-2">
                  <Link
                    href={`/product/${product.id}`}
                    className="text-lg font-semibold leading-tight text-gray-900 hover:underline"
                  >
                    {product.name}
                  </Link>

                  <ul className="mt-2 flex items-center gap-4">
                    <li className="flex items-center gap-2">
                      <svg
                        className="h-4 w-4 text-gray-500 dark:text-gray-400"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M13 7h6l2 4m-8-4v8m0-8V6a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v9h2m8 0H9m4 0h2m4 0h2v-4m0 0h-5m3.5 5.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Zm-10 0a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Z"
                        />
                      </svg>
                      <p className="text-sm font-medium text-gray-500">
                        Fast Delivery
                      </p>
                    </li>

                    <li className="flex items-center gap-2">
                      <svg
                        className="h-4 w-4 text-gray-500"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeWidth="2"
                          d="M8 7V6c0-.6.4-1 1-1h11c.6 0 1 .4 1 1v7c0 .6-.4 1-1 1h-1M3 18v-7c0-.6.4-1 1-1h11c.6 0 1 .4 1 1v7c0 .6-.4 1-1 1H4c-.6 0-1-.4-1-1Z"
                        />
                      </svg>
                      <p className="text-sm font-medium text-gray-500">
                        Cash on Delivery
                      </p>
                    </li>
                  </ul>
                </div>

                <div className="my-3 flex items-center justify-between gap-4">
                  <p className="text-xl font-semibold text-gray-900">
                    {formatCurrency(product.price)}
                  </p>
                  <button
                    className="flex-shrink-0 inline-flex items-center rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-800 focus:outline-none focus:ring-4 focus:ring-primary-300"
                    onClick={() => handleAddToCart(product)}
                  >
                    <ShoppingCartIcon className="h-4 w-4 mr-1" />
                    Add to cart
                  </button>
                </div>
              </div>
            ))}
      </div>

      <ToastContainer position="top-right" />
    </div>
  );
};

export default Recommend;
