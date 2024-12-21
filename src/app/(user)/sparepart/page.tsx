"use client";
import React, { useState, useEffect } from "react";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  MagnifyingGlassIcon,
  ShoppingCartIcon,
} from "@heroicons/react/20/solid";
import { toast, ToastContainer } from "react-toastify"; // Import ToastContainer and toast
import "react-toastify/dist/ReactToastify.css"; // Import the styles for toast
import Image from "next/image";
import Link from "next/link";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  category: string;
}

const LaptopPage: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [error, setError] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const filesPerPage = 12;
  const [cart, setCart] = useState<any[]>([]);
  const [loading, setLoading] = useState(false); // Add loading state

  const totalPages = Math.ceil(filteredProducts.length / filesPerPage);

  const handlePageChange = (page: number) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleGoButtonClick = () => {
    const pageInput = document.getElementById("page-input") as HTMLInputElement;
    const pageNumber = parseInt(pageInput.value, 10);
    handlePageChange(pageNumber);
  };

  const displayedFiles = filteredProducts.slice(
    (currentPage - 1) * filesPerPage,
    currentPage * filesPerPage
  );

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  useEffect(() => {
    const results = products.filter((product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredProducts(results);
  }, [searchQuery, products]);

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
        toast.success("Successfully added to cart!"); // Show success toast
      } else {
        toast.error("Failed to add item to cart"); // Show error toast
      }
    } catch (error) {
      console.error("Error adding item to cart:", error);
      toast.error("Failed to add item to cart"); // Show error toast
    }
  };

  // Fetch all products with GET method
  const fetchProducts = async (): Promise<void> => {
    setLoading(true);
    try {
      const response = await fetch("/api/product");
      const data = await response.json();
      if (response.ok) {
        // Filter products to only show those with category "Sparepart"
        const laptopProducts = data.products.filter(
          (product: Product) => product.category === "SPAREPART"
        );
        setProducts(laptopProducts);
      } else {
        console.error(data.error);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(amount);
  };

  return (
    <div className="mx-5 md:mx-20 my-8 md:my-16">
      {error && <p>{error}</p>}
      <div className="md:flex items-center md:justify-between w-full bg-primary-50 py-2 px-4 rounded-md">
        <h1 className="my-6 md:my-0 text-2xl font-bold text-primary">
          Sparepart
        </h1>
        <form className="w-full md:w-1/3" onSubmit={(e) => e.preventDefault()}>
          <label
            htmlFor="default-search"
            className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white"
          >
            Search
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
              <MagnifyingGlassIcon className="w-5 h-5 text-gray-500 " />
            </div>
            <input
              type="search"
              id="default-search"
              value={searchQuery}
              onChange={handleSearch}
              className="block w-full p-4 ps-10 text-sm text-gray-900 focus:border rounded-lg bg-white focus:ring-primary focus:border-primary outline-none "
              placeholder="Search..."
              required
            />
          </div>
        </form>
      </div>
      {loading ? (
        <div className="text-center my-8">Loading...</div> // Show loading indicator while fetching products
      ) : (
        <div className="my-10 grid gap-4 md:grid-cols-2 md:mb-8 lg:grid-cols-4">
          {displayedFiles.length > 0 ? (
            displayedFiles.map((product) => (
              <div
                key={product.id}
                className="rounded-lg border border-gray-200 bg-white p-2 shadow-sm "
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
                    className="text-lg font-semibold leading-tight text-gray-900 hover:underline "
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
                      <p className="text-sm font-medium text-gray-500 ">
                        Fast Delivery
                      </p>
                    </li>

                    <li className="flex items-center gap-2">
                      <svg
                        className="h-4 w-4 text-gray-500 "
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
                      <p className="text-sm font-medium text-gray-500 ">
                        Cash on Delivery
                      </p>
                    </li>
                  </ul>

                  <div className="mt-3 mb-4 flex items-center justify-between gap-4">
                    <p className="text-xl font-semibold text-gray-900">
                      {formatCurrency(product.price)}
                    </p>
                    <button
                      className="flex-shrink-0 inline-flex items-center rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-800 focus:outline-none focus:ring-4  focus:ring-primary-300"
                      onClick={() => handleAddToCart(product)}
                    >
                      <ShoppingCartIcon className="h-4 w-4 mr-1" />
                      Add to cart
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="w-full py-10 text-center text-xl text-gray-500">
              No products found
            </div>
          )}
        </div>
      )}

      <nav
        className="flex justify-between rounded-md mt-16"
        aria-label="Pagination"
      >
        <div className="flex items-center gap-2">
          <Link href="#" onClick={() => handlePageChange(currentPage - 1)}>
            <p className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 hover:bg-gray-50 focus:z-20 focus:outline-offset-0">
              <span className="sr-only">Previous</span>
              <ArrowLeftIcon className="w-4 h-4" />
            </p>
          </Link>

          {Array.from({ length: totalPages }, (_, index) => (
            <Link
              key={index + 1}
              href="#"
              onClick={() => handlePageChange(index + 1)}
            >
              <p
                className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                  currentPage === index + 1
                    ? "bg-primary text-white"
                    : "text-gray-900 hover:bg-gray-50"
                }`}
              >
                {index + 1}
              </p>
            </Link>
          ))}

          <Link href="#" onClick={() => handlePageChange(currentPage + 1)}>
            <p className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 hover:bg-gray-50 focus:z-20 focus:outline-offset-0">
              <span className="sr-only">Next</span>
              <ArrowRightIcon className="w-4 h-4" />
            </p>
          </Link>
        </div>

        <div className="flex items-center gap-5">
          <label className="block mb-2 text-sm font-medium text-gray-900">
            Go to page
          </label>
          <input
            type="number"
            id="page-input"
            min={1}
            max={totalPages}
            className="bg-gray-50 text-gray-900 text-sm rounded-lg border border-gray-300 focus:ring-primary-500 focus:border-primary-500 block w-12 h-10 p-2.5"
            defaultValue={currentPage}
          />
          <button
            onClick={handleGoButtonClick}
            className="bg-primary rounded-lg px-4 py-2 text-white"
          >
            Go
          </button>
        </div>
      </nav>

      <ToastContainer />
    </div>
  );
};

export default LaptopPage;
