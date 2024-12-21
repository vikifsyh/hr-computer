"use client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

export default function ProductFilter() {
  const [products, setProducts] = useState<any[]>([]); // State untuk menyimpan produk
  const [loading, setLoading] = useState<boolean>(false); // State untuk loading
  const [error, setError] = useState<string>(""); // State untuk error handling
  const [selectedCategory, setSelectedCategory] = useState<string>("LAPTOP"); // State untuk filter kategori
  const router = useRouter();

  // Fetch data produk dari API
  const fetchProducts = async (category: string) => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/product");
      const data = await response.json();

      if (response.ok) {
        // Filter produk berdasarkan kategori
        const filteredProducts = data.products.filter(
          (product: any) => product.category === category
        );
        setProducts(filteredProducts);
      } else {
        setError("Failed to fetch products");
      }
    } catch (err) {
      setError("Error fetching products");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data saat komponen dimuat atau kategori berubah
  useEffect(() => {
    fetchProducts(selectedCategory);
  }, [selectedCategory]);

  // Skeleton Loader UI
  return (
    <div className="mx-5 rounded-[40px] bg-primary-50 md:mx-20 my-8 md:my-16">
      <div className="p-6 md:p-10">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-4xl font-semibold text-primary">
            Explore Our Products
          </h2>
          <p className="mt-2 text-lg text-gray-600">
            Find the best products that suit your needs
          </p>
        </div>
        {/* Filter Buttons */}
        <div className="flex justify-center mb-6 gap-4">
          <button
            onClick={() => setSelectedCategory("LAPTOP")}
            className={`px-6 py-2 rounded-lg font-semibold ${
              selectedCategory === "LAPTOP"
                ? "bg-primary text-white"
                : "bg-primary-100 text-primary"
            }`}
          >
            LAPTOP
          </button>
          <button
            onClick={() => setSelectedCategory("SPAREPART")}
            className={`px-6 py-2 rounded-lg font-semibold ${
              selectedCategory === "SPAREPART"
                ? "bg-primary text-white"
                : "bg-primary-100 text-primary"
            }`}
          >
            SPAREPART
          </button>
        </div>

        {/* Loading State */}
        <div className="lg:grid lg:grid-cols-4 gap-5 mt-7 lg:mt-16">
          {/* Menampilkan produk maksimal 6 */}
          {products.slice(0, 6).map((product, index) => (
            <div
              key={product.id || index}
              className={`${
                index % 5 === 0 ? "col-span-2" : "col-span-1"
              } mb-4`}
            >
              <Link href={`/product/${product.id}`}>
                <div className="w-full  rounded-xl md:rounded-[20px] overflow-hidden relative">
                  <Image
                    src={product.image}
                    alt={product.name}
                    width={500}
                    height={300}
                    className="w-full h-full object-cover"
                    style={{ height: "250px" }}
                  />
                </div>
              </Link>
            </div>
          ))}
        </div>

        <div className="mt-10 flex justify-center">
          <button
            onClick={() => router.push("/product")}
            className="rounded-full border border-primary px-6 py-2 hover:bg-primary hover:text-white text-primary"
          >
            View All
          </button>
        </div>
      </div>
    </div>
  );
}
