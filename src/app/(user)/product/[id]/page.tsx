"use client";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeftIcon, ShoppingCartIcon } from "@heroicons/react/20/solid";
import "react-toastify/dist/ReactToastify.css";
import { toast, ToastContainer } from "react-toastify";

export default function DetailProduct() {
  const { id } = useParams();
  const [product, setProduct] = useState<any>(null);
  const [error, setError] = useState<string>("");
  const [cart, setCart] = useState<any[]>([]);
  const [offerPrice, setOfferPrice] = useState<number | "">("");
  const [negoStatus, setNegoStatus] = useState<any>(null); // untuk simpan nego terbaru user
  const [loadingNego, setLoadingNego] = useState(false);

  const router = useRouter();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(amount);
  };

  // Fetch product detail
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
      fetchUserNegotiation(); // juga fetch nego user untuk produk ini
    }
  }, [id]);

  // Fetch negosiasi user untuk produk ini
  const fetchUserNegotiation = async () => {
    try {
      setLoadingNego(true);
      const res = await fetch(`/api/nego?productId=${id}`);
      const data = await res.json();

      if (res.ok) {
        const latest = data.negotiations[0];
        if (latest) {
          setNegoStatus(latest);
          setOfferPrice(latest.offerPrice);
        } else {
          setNegoStatus(null);
          setOfferPrice("");
        }
      } else {
        toast.error(data.error || "Failed to load negotiations");
      }
    } catch (error) {
      toast.error("Failed to load negotiations");
    } finally {
      setLoadingNego(false);
    }
  };

  // Kirim penawaran nego ke API
  const handleSubmitNego = async () => {
    if (offerPrice === "" || offerPrice <= 0) {
      toast.error("Masukkan harga penawaran yang valid!");
      return;
    }

    try {
      const res = await fetch("/api/nego", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: product.id,
          offerPrice: offerPrice,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Penawaran berhasil dikirim!");
        setNegoStatus(data.negotiation); // simpan nego terbaru dari response
      } else {
        toast.error(data.error || "Gagal mengirim penawaran");
      }
    } catch (error) {
      toast.error("Gagal mengirim penawaran");
    }
  };

  if (error) {
    return <div>{error}</div>;
  }

  if (!product) {
    return <div>Loading...</div>;
  }

  const handleAddToCart = async (productId: string, quantity: number) => {
    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productId, quantity }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Jika error, tampilkan pesan error dari server
        toast.error(data.error || "Failed to add to cart");
        return;
      }

      // Jika sukses, tampilkan notifikasi atau lakukan navigasi
      toast.success("Product added to cart!");
      // Bisa redirect ke keranjang atau update state
      // router.push("/cart"); // jika ingin redirect ke halaman keranjang
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("Something went wrong");
    }
  };

  return (
    <div className="mx-5 md:mx-20 my-8 md:my-16">
      <section className="bg-white dark:bg-gray-900 antialiased">
        <div className="max-w-screen-xl mx-auto">
          <div className="lg:grid lg:grid-cols-2 lg:gap-8 xl:gap-16">
            <div className="shrink-0 max-w-md lg:max-w-lg mx-auto">
              <Image
                className="w-full rounded-lg"
                src={product.image}
                alt={product.name}
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
                    {negoStatus?.status === "ACCEPTED"
                      ? formatCurrency(negoStatus.offerPrice)
                      : formatCurrency(product.price)}
                  </p>

                  <p className="text-sm font-medium text-neutral-400 mt-2">
                    {product.stock} stock
                  </p>
                </div>
              </div>

              {/* FORM NEGO */}
              <div className="mt-8">
                <h2 className="text-lg font-semibold mb-2">
                  Ajukan Penawaran Harga
                </h2>
                {/* Input dan Button dalam satu baris */}
                <div className="flex items-center gap-4 flex-wrap">
                  <input
                    type="text"
                    className="border rounded-md p-2 w-full md:w-auto "
                    placeholder="Masukkan harga penawaran"
                    value={offerPrice}
                    onChange={(e) => setOfferPrice(Number(e.target.value))}
                  />
                  <button
                    onClick={handleSubmitNego}
                    disabled={loadingNego}
                    className="bg-primary px-4 py-2 rounded text-white disabled:opacity-50 w-full md:w-auto"
                  >
                    {loadingNego ? "Mengirim..." : "Kirim Penawaran"}
                  </button>
                </div>

                {negoStatus && (
                  <p className="mt-3">
                    Status penawaran kamu:{" "}
                    <span className="font-semibold">{negoStatus.status}</span>{" "}
                    dengan harga{" "}
                    <span className="font-semibold">
                      {formatCurrency(negoStatus.offerPrice)}
                    </span>
                  </p>
                )}
              </div>

              <div className="mt-6 sm:gap-4 sm:items-center sm:flex sm:mt-8">
                <button
                  onClick={() => handleAddToCart(product.id, 1)}
                  className="flex w-full md:w-auto items-center justify-center py-2.5 px-5 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-primary-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
                  role="button"
                >
                  <ShoppingCartIcon className="h-5 w-5 mr-2" />
                  Add to cart
                </button>

                {/* <Link
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
                </Link> */}
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
      </section>
      <ToastContainer />
    </div>
  );
}
