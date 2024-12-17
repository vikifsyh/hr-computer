"use client";
import {
  ArrowLeftOnRectangleIcon,
  Bars3Icon,
  ChartPieIcon,
  ShoppingBagIcon,
  ShoppingCartIcon,
  UserGroupIcon,
} from "@heroicons/react/20/solid";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const closeSidebar = () => {
    setIsOpen(false);
  };

  return (
    <div className="relative ">
      <button
        type="button"
        onClick={toggleSidebar}
        className="inline-flex items-center p-2 mt-2 ms-3 text-sm text-gray-500 rounded-lg sm:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 "
      >
        <span className="sr-only">Open sidebar</span>
        <Bars3Icon className="w-6 h-6" />
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black opacity-50 sm:hidden"
          onClick={closeSidebar}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-4 z-40 w-64 h-screen transition-transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } sm:translate-x-0`}
        aria-label="Sidebar"
      >
        <div className="rounded-md h-full px-3 py-4 overflow-y-auto bg-primary-50 ">
          <ul className="space-y-2 font-medium">
            <li>
              <Link
                href="/admin"
                className={`flex items-center p-2 text-primary rounded-lg hover:bg-primary-100 ${
                  pathname === "/admin" ? "bg-primary-100" : ""
                }`}
              >
                <ChartPieIcon className="w-5 h-5" />
                <span className="ms-3">Dashboard</span>
              </Link>
            </li>
            <li>
              <Link
                href="/admin/products"
                className={`flex items-center p-2 text-primary rounded-lg hover:bg-primary-100 ${
                  pathname === "/admin/products" ? "bg-primary-100" : ""
                }`}
              >
                <ShoppingBagIcon className="w-5 h-5" />
                <span className="flex-1 ms-3 whitespace-nowrap">
                  Product Management
                </span>
              </Link>
            </li>
            <li>
              <Link
                href="/admin/users"
                className={`flex items-center p-2 text-primary rounded-lg hover:bg-primary-100 ${
                  pathname === "/admin/users" ? "bg-primary-100" : ""
                }`}
              >
                <UserGroupIcon className="w-5 h-5" />
                <span className="flex-1 ms-3 whitespace-nowrap">
                  User Management
                </span>
              </Link>
            </li>
            <li>
              <Link
                href="/admin/orders"
                className={`flex items-center p-2 text-primary rounded-lg hover:bg-primary-100 ${
                  pathname === "/admin/orders" ? "bg-primary-100" : ""
                }`}
              >
                <ShoppingCartIcon className="w-5 h-5" />
                <span className="flex-1 ms-3 whitespace-nowrap">
                  Order Management
                </span>
              </Link>
            </li>

            <li>
              <button
                onClick={() => signOut()}
                className="inline-flex items-center p-2 text-primary rounded-lg w-full hover:bg-primary-100"
              >
                <ArrowLeftOnRectangleIcon className="w-5 h-5" />
                <span className="ml-3 ">Logout</span>
              </button>
            </li>
          </ul>
        </div>
      </aside>
    </div>
  );
}
