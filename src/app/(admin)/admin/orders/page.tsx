"use client";

import Breadcrumb from "@/components/ui/Breadcrumb";
import { useEffect, useState } from "react";

type OrderItem = {
  id: string;
  product: {
    name: string;
  };
  quantity: number;
};

type Order = {
  id: string;
  user: {
    name: string;
    email: string;
    address: string; // Tambahkan address di sini
  };
  totalPrice: number;
  paymentStatus: string;

  orderItems: OrderItem[];
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/order")
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setOrders(data.orders);
        }
        setLoading(false);
      })
      .catch((err) => {
        setError("Failed to load orders");
        setLoading(false);
      });
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(amount);
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <main className="flex-1 p-4 sm:ml-72 sm:mr-10 my-10 rounded-lg bg-white">
      <Breadcrumb />
      <div className="bg-primary-50 p-4 rounded-lg">
        <h1 className="font-bold text-2xl">Order Management</h1>
        <div className="relative overflow-x-auto mt-5">
          <table className="w-full text-sm text-left rtl:text-right text-gray-500 ">
            <thead className="text-xs text-gray-700 uppercase bg-white ">
              <tr>
                {/* <th className="border px-4 py-2">Order ID</th> */}
                <th className="px-6 py-3">Customer</th>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">Address</th>
                <th className="px-6 py-3">Items</th>
                <th className="px-6 py-3">Total Price</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr
                  key={order.id}
                  className="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
                >
                  {/* <td className="border px-4 py-2">{order.id}</td> */}
                  <th
                    scope="row"
                    className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                  >
                    {order.user.name}
                  </th>
                  <td className="px-6 py-4">{order.user.email}</td>
                  <td className="px-6 py-4">{order.user.address}</td>
                  <td className="px-6 py-4">
                    <ul>
                      {order.orderItems.map((item) => (
                        <li key={item.id}>
                          {item.product.name} x {item.quantity}
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td className="px-6 py-4">
                    {formatCurrency(order.totalPrice)}
                  </td>

                  <td className="px-6 py-4">
                    <span className="p-1 bg-green-200 text-green-700 rounded-md font-bold">
                      {order.paymentStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
