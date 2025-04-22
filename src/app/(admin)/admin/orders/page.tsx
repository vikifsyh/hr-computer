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
    address: string;
  };
  totalPrice: number;
  paymentStatus: string;
  shippingStatus: string;
  trackingNumber: string | null;
  orderItems: OrderItem[];
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/order");
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setOrders(data.orders);
      }
    } catch (err) {
      setError("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (
    orderId: string,
    shippingStatus: string,
    trackingNumber: string
  ) => {
    setUpdatingOrderId(orderId);
    try {
      const res = await fetch("/api/order", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId,
          shippingStatus,
          trackingNumber: shippingStatus === "DIKIRIM" ? trackingNumber : null,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        console.error("Update failed:", error);
        return;
      }

      await fetchOrders();
    } catch (error) {
      console.error("Error updating order:", error);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(amount);
  };

  // Pagination logic
  const indexOfLastOrder = currentPage * itemsPerPage;
  const indexOfFirstOrder = indexOfLastOrder - itemsPerPage;
  const currentOrders = orders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(orders.length / itemsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <main className="flex-1 p-4 sm:ml-72 sm:mr-10 my-10 rounded-lg bg-white">
      <Breadcrumb />
      <div className="bg-primary-50 p-4 rounded-lg">
        <h1 className="font-bold text-2xl mb-4">Order Management</h1>
        <div className="relative overflow-x-auto mt-5">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-white">
              <tr>
                <th className="px-6 py-3">Customer</th>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">Address</th>
                <th className="px-6 py-3">Items</th>
                <th className="px-6 py-3">Total</th>
                <th className="px-6 py-3">Payment</th>
                <th className="px-6 py-3">Pengiriman</th>
                <th className="px-6 py-3">Resi</th>
                <th className="px-6 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {currentOrders.map((order) => (
                <tr
                  key={order.id}
                  className="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
                >
                  <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                    {order.user.name}
                  </td>
                  <td className="px-6 py-4">{order.user.email}</td>
                  <td className="px-6 py-4">{order.user.address}</td>
                  <td className="px-6 py-4">
                    <ul className="list-disc pl-4">
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
                    <span
                      className={`p-1 rounded-md font-bold ${
                        order.paymentStatus === "PENDING"
                          ? "bg-yellow-200 text-yellow-800"
                          : "bg-green-200 text-green-700"
                      }`}
                    >
                      {order.paymentStatus}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <select
                      value={order.shippingStatus}
                      onChange={(e) => {
                        const updated = orders.map((o) =>
                          o.id === order.id
                            ? { ...o, shippingStatus: e.target.value }
                            : o
                        );
                        setOrders(updated);
                      }}
                      className="border border-gray-300 rounded px-2 py-1 text-sm"
                    >
                      <option value="DIKEMAS">DIKEMAS</option>
                      <option value="DIKIRIM">DIKIRIM</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    {order.shippingStatus === "DIKIRIM" ? (
                      <input
                        type="text"
                        placeholder="Nomor Resi"
                        value={order.trackingNumber || ""}
                        onChange={(e) => {
                          const updated = orders.map((o) =>
                            o.id === order.id
                              ? { ...o, trackingNumber: e.target.value }
                              : o
                          );
                          setOrders(updated);
                        }}
                        className="border border-gray-300 rounded px-5 py-1 text-lg w-72"
                      />
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() =>
                        handleUpdate(
                          order.id,
                          order.shippingStatus,
                          order.trackingNumber || ""
                        )
                      }
                      disabled={updatingOrderId === order.id}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1 rounded disabled:opacity-50"
                    >
                      {updatingOrderId === order.id ? "Updating..." : "Update"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination Controls */}
          {orders.length > itemsPerPage && (
            <div className="flex justify-end my-6">
              <nav
                className="inline-flex rounded-md shadow-sm"
                aria-label="Pagination"
              >
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 rounded-l-md"
                >
                  Prev
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => paginate(page)}
                      className={`px-4 py-2 border text-sm font-medium ${
                        currentPage === page
                          ? "bg-primary text-white border-primary"
                          : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                      }`}
                    >
                      {page}
                    </button>
                  )
                )}

                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 rounded-r-md"
                >
                  Next
                </button>
              </nav>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
