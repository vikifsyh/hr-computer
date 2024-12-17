"use client";
import React from "react";
import Link from "next/link";

import { usePathname } from "next/navigation";
import { ArrowRightIcon, ChevronRightIcon } from "@heroicons/react/20/solid";

const Breadcrumb: React.FC = () => {
  const pathname = usePathname();

  let breadcrumbItems = [];

  if (pathname === "/admin") {
    breadcrumbItems = [
      { name: "Home", href: "/" },
      { name: "Dashboard", href: "/admin" },
      { name: "Home", href: "" },
    ];
  } else if (pathname === "/admin/products") {
    breadcrumbItems = [
      { name: "Home", href: "/" },
      { name: "Dashboard", href: "/admin" },
      { name: "Product Management", href: "" },
    ];
  } else if (pathname === "/admin/users") {
    breadcrumbItems = [
      { name: "Home", href: "/" },
      { name: "Dashboard", href: "/admin" },
      { name: "User Management", href: "" },
    ];
  } else if (pathname === "/admin/orders") {
    breadcrumbItems = [
      { name: "Home", href: "/" },
      { name: "Dashboard", href: "/admin" },
      { name: "Order Management", href: "" },
    ];
  } else {
    breadcrumbItems = [{ name: "Home", href: "/" }];
  }

  return (
    <nav className="mb-4">
      <ul className="flex items-center space-x-2 text-black bg-primary-50 p-4 rounded-md">
        {breadcrumbItems.map((item, index) => (
          <li key={index} className="flex items-center">
            {item.href ? (
              <Link href={item.href} className="hover:text-primary-200">
                {item.name}
              </Link>
            ) : (
              <span className="text-gray-400">{item.name}</span>
            )}
            {index < breadcrumbItems.length - 1 && (
              <ChevronRightIcon className="h-5 w-5 mx-1 text-gray-400" />
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Breadcrumb;
