"use client";
import React, { useEffect, useState } from "react";
import { Aclonica } from "next/font/google";
import { Bars3Icon, ChevronDownIcon } from "@heroicons/react/20/solid";
import { signIn, signOut, useSession } from "next-auth/react";
import Image from "next/image";
import NoPict from "../../../../public/image/nopict.png";
import Link from "next/link";
import { usePathname } from "next/navigation";

const aclonica = Aclonica({
  subsets: ["latin"],
  weight: "400",
});

export default function Navbar() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProductsOpen, setIsProductsOpen] = useState(false); // State for the products accordion
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [cartTotal, setCartTotal] = useState(0);
  const [orders, setOrders] = useState([]); // Add state to store orders

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch("/api/cart"); // Ambil data dari API cart
        if (!response.ok) {
          throw new Error("Failed to fetch orders");
        }

        const data = await response.json();
        setOrders(data.orders); // Menyimpan data pesanan

        // Menghitung total item dalam cart
        const totalItems = data.orders.reduce(
          (total: number, order: any) =>
            total +
            order.orderItems.reduce(
              (sum: number, item: any) => sum + item.quantity,
              0
            ),
          0
        );
        setCartTotal(totalItems); // Set total item
      } catch (err) {
        console.error("Failed to load orders:", err);
      }
    };

    fetchOrders();
  }, []);

  useEffect(() => {
    if (status === "authenticated") {
      // If user is authenticated, you could call fetchCartTotal if needed
      // If fetchCartTotal is necessary, create the function and use it here
    }
  }, [status, session]);

  const dropDown = () => {
    setIsOpen(!isOpen);
  };

  const closeDropdown = () => {
    setIsOpen(false);
  };

  const pathname = usePathname();

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  const toggleProductsAccordion = () => {
    setIsProductsOpen((prev) => !prev);
  };

  return (
    <nav className="flex justify-between items-center mx-5 md:mx-20 my-4">
      <div className="flex gap-10 items-center">
        <h1
          className={`${aclonica.className} font-extrabold text-lg md:text-2xl text-primary`}
        >
          HR COMPUTER
        </h1>
        {/* Desktop menu */}
        <ul className="lg:flex items-center hidden space-x-5">
          <Link
            className={`py-2 px-3 md:p-0 block hover:text-primary hover:font-semibold ${
              pathname === "/"
                ? "text-primary-600 font-semibold"
                : "text-neutral-200"
            }`}
            href={"/"}
          >
            Home
          </Link>
          <div className="relative inline-block">
            <button
              type="button"
              className="text-neutral-200 inline-flex items-center hover:text-primary hover:font-semibold"
              onClick={dropDown}
            >
              Products
              <ChevronDownIcon className="w-4 h-4 ml-2" />
            </button>

            {isOpen && (
              <div className="origin-top-right absolute z-10 right-0 mt-2 w-44 rounded-lg shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                <ul
                  role="menu"
                  aria-orientation="vertical"
                  aria-labelledby="options-menu"
                >
                  <li>
                    <Link
                      href="/product"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={closeDropdown}
                    >
                      All Product
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/laptop"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Laptop
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/sparepart"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={closeDropdown}
                    >
                      Sparepart
                    </Link>
                  </li>
                </ul>
              </div>
            )}
          </div>
          <Link
            className={`py-2 px-3 md:p-0 block hover:text-primary hover:font-semibold ${
              pathname === "/about"
                ? "text-primary-600 font-semibold"
                : "text-neutral-200"
            }`}
            href={"/about"}
          >
            <li>About</li>
          </Link>
        </ul>
      </div>

      <div className="flex gap-2 items-center">
        {status === "authenticated" ? (
          <>
            <button
              type="button"
              className="flex items-center text-sm rounded-full md:me-0 focus:ring-4 focus:ring-gray-300"
              id="user-menu-button"
              aria-expanded={isDropdownOpen}
              onClick={toggleDropdown}
            >
              <span className="sr-only">Open user menu</span>
              {session?.user?.image ? (
                <Image
                  src={session.user.image}
                  alt="User profile"
                  width={1000}
                  height={1000}
                  className="w-9 h-9 rounded-full object-cover"
                  style={{ height: "36px" }}
                />
              ) : (
                <Image
                  src={NoPict}
                  alt="User profile"
                  width={1000}
                  height={1000}
                  className="w-9 h-9 rounded-full object-cover"
                  style={{ height: "36px" }}
                />
              )}
            </button>
            <div
              className={`${
                isDropdownOpen ? "block" : "hidden"
              } absolute right-0 top-10 z-50 w-48 my-4 text-base list-none bg-white divide-y divide-gray-100 rounded-lg shadow`}
              id="user-dropdown"
            >
              <div className="px-4 py-3">
                <span className="block text-sm text-gray-900">
                  {session?.user?.name}
                </span>
                <span className="block text-sm text-gray-500 truncate">
                  {session?.user?.email}
                </span>
              </div>
              <ul className="py-2" aria-labelledby="user-menu-button">
                <li>
                  <Link
                    href="/profil"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    My Profile
                  </Link>
                </li>
                <li>
                  <Link
                    href="/cart"
                    className="inline-flex w-full justify-between items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    My Cart
                    <span className="bg-primary text-white w-6 h-6 rounded-full items-center flex justify-center">
                      {cartTotal}
                    </span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/transaction"
                    className="inline-flex w-full justify-between items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Transaction History
                    <span className="bg-primary text-white w-6 h-6 rounded-full items-center flex justify-center">
                      {cartTotal}
                    </span>
                  </Link>
                </li>
                <li>
                  <button
                    onClick={() => signOut()}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Logout
                  </button>
                </li>
              </ul>
            </div>
          </>
        ) : (
          <button
            className="bg-primary px-4 py-2 rounded-lg text-white hover:bg-primary/50"
            onClick={() => signIn()}
          >
            Login
          </button>
        )}

        {/* Mobile Hamburger Menu */}
        <button className="md:hidden block" onClick={toggleMobileMenu}>
          <Bars3Icon className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute z-50 top-16 right-0 left-0 bg-white">
          <div className="px-5 py-3 font-medium">
            <ul className="space-y-2 p-5 bg-gray-50 rounded-sm">
              <li>
                <Link
                  href="/"
                  className="text-sm text-gray-700 w-full p-2 text-left hover:bg-gray-200 rounded-md block"
                >
                  Home
                </Link>
              </li>
              <div>
                <button
                  onClick={toggleProductsAccordion}
                  className="text-sm text-gray-700 w-full p-2 text-left hover:bg-gray-200 rounded-md inline-flex items-center justify-between"
                >
                  Products
                  <ChevronDownIcon className="w-4 h-4" />
                </button>
                {isProductsOpen && (
                  <ul className="space-y-3 pl-4">
                    <li>
                      <Link
                        href="/product"
                        className="text-sm text-gray-700 hover:bg-gray-100 "
                      >
                        All Product
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/laptop"
                        className="text-sm text-gray-700 hover:bg-gray-100 "
                      >
                        Laptop
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/sparepart"
                        className="text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Sparepart
                      </Link>
                    </li>
                  </ul>
                )}
              </div>
              <li>
                <Link
                  href="/about"
                  className="text-sm text-gray-700 w-full p-2 text-left hover:bg-gray-200 rounded-md block"
                >
                  About
                </Link>
              </li>
            </ul>
          </div>
        </div>
      )}
    </nav>
  );
}
