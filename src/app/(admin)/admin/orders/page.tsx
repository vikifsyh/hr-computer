"use client";
import Breadcrumb from "@/components/ui/Breadcrumb";
import React, { useEffect, useState } from "react";

// Definisi tipe data
interface OrderItem {
  id: string;
  productName: string;
  productImage: string;
  quantity: number;
  price: string;
}

interface Cart {
  id: string;
  userName: string;
  status: string;
  totalQuantity: number;
  orderItems: OrderItem[];
  price: string;
}

export default function Page() {
  const [carts, setCarts] = useState<Cart[]>([]); // State untuk menyimpan data cart
  const [loading, setLoading] = useState<boolean>(true); // State untuk loading
  const [error, setError] = useState<string | null>(null); // State untuk error

  // Fetch data dari API
  useEffect(() => {
    const fetchCarts = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/cart"); // Ganti dengan URL API Anda
        if (!response.ok) {
          throw new Error("Failed to fetch carts");
        }
        const data = await response.json();
        setCarts(data.carts || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCarts();
  }, []);

  const calculateTotalPrice = (price: string, quantity: number): number => {
    return parseFloat(price) * quantity; // Menghitung total price per item
  };

  const formatCurrency = (value: number): string => {
    return value.toLocaleString("id-ID", {
      style: "currency",
      currency: "IDR",
    });
  };

  return (
    <main className="flex-1 p-4 sm:ml-72 sm:mr-10 my-10 rounded-lg bg-white">
      <Breadcrumb />
      <div className="bg-primary-50 p-4 rounded-lg">
        <h1 className="font-bold text-2xl mb-4">Order Management</h1>
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : carts.length === 0 ? (
          <p className="text-gray-500">No carts found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                <tr>
                  <th scope="col" className="px-4 py-2">
                    User
                  </th>
                  <th scope="col" className="px-4 py-2">
                    Items
                  </th>
                  <th scope="col" className="px-4 py-2 text-center">
                    Total Quantity
                  </th>
                  <th scope="col" className="px-4 py-2">
                    Price
                  </th>
                  <th scope="col" className="px-4 py-2">
                    Total Price
                  </th>
                  <th scope="col" className="px-4 py-2">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {carts.map((cart) => (
                  <tr
                    key={cart.id}
                    className="bg-white border-b hover:bg-gray-50"
                  >
                    <td className="px-4 py-2">{cart.userName}</td>
                    <td className="px-4 py-2">
                      {cart.orderItems.map((item) => (
                        <div
                          key={item.id}
                          className="flex justify-between items-center"
                        >
                          <span>{item.productName}</span>
                          <span className="ml-2 text-gray-600">
                            {item.quantity}
                          </span>
                        </div>
                      ))}
                    </td>
                    <td className="px-4 py-2 text-center">
                      {cart.totalQuantity}
                    </td>
                    <td className="px-4 py-2">
                      {cart.orderItems.map((item) => (
                        <div key={item.id}>
                          <span>{formatCurrency(parseFloat(item.price))}</span>
                        </div>
                      ))}
                    </td>
                    <td className="px-4 py-2">
                      {/* Calculate the total price for the cart */}
                      {cart.orderItems
                        .map((item) =>
                          calculateTotalPrice(item.price, item.quantity)
                        )
                        .reduce((total, current) => total + current, 0)
                        .toLocaleString("id-ID", {
                          style: "currency",
                          currency: "IDR",
                        })}
                    </td>
                    <td className="px-4 py-2">
                      <span>{cart.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
