"use client";
import React, { useEffect, useState } from "react";

// Define TypeScript interfaces
interface Product {
  id: string;
  name: string;
  price: number;
}

interface OrderItem {
  id: string;
  product: Product;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  createdAt: string;
  shippingStatus: string;
  orderItems: OrderItem[];
  totalPrice: number;
  trackingNumber?: string;
  customerName: string;
  address: string;
}

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(amount);
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch("/api/order/${orderId}");
        if (!response.ok) throw new Error("Failed to fetch orders");
        const data = await response.json();
        setOrders(data.orders);
      } catch (err) {
        setError("Failed to load orders");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const updateShippingStatus = async (
    orderId: string,
    newStatus: string,
    trackingNumber?: string
  ) => {
    try {
      const response = await fetch(`/api/order/${orderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          shippingStatus: newStatus,
          trackingNumber: trackingNumber || null,
        }),
      });

      if (!response.ok) throw new Error("Failed to update shipping status");

      // ✅ Redirect setelah update sukses
      window.location.href = "/transaction"; // Ganti dengan halaman tujuan setelah selesai
    } catch (err) {
      setError("Failed to update shipping status");
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="mx-5 md:mx-20 my-8 md:my-16">
      <div className="mx-auto max-w-4xl">
        <h1 className="my-6 md:my-0 mb-2 text-xl font-semibold text-gray-900 sm:text-2xl">
          Thanks for your order!
        </h1>
        <p className="text-gray-500 mb-6 md:mb-8">
          Your order{" "}
          <span className="text-primary font-medium">
            {orders.length > 0 ? orders[0].id : "N/A"}
          </span>{" "}
          will be processed within 24 hours during working days. We will notify
          you by email once your order has been shipped.
        </p>
        <div className="mt-4 space-y-6">
          {orders.map((order) => (
            <div
              key={order.id}
              className="space-y-4 sm:space-y-2 rounded-lg border border-gray-100 bg-gray-50 p-6 mb-6 md:mb-8"
            >
              <div className="flex justify-between">
                <span className="text-gray-500">
                  {new Date(order.createdAt).toLocaleDateString("id-ID", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>

              {/* Shipping Status */}
              <div className="mt-2">
                <span className="font-medium text-gray-700">
                  Shipping Status:{" "}
                </span>
                <span className="text-primary font-medium">
                  {order.shippingStatus}
                </span>
              </div>

              {/* Tracking Number */}
              {order.shippingStatus === "DIKIRIM" && (
                <div className="mt-2">
                  <span className="font-medium text-gray-700">No Resi: </span>
                  <span className="text-primary">
                    {order.trackingNumber || "Not Available"}
                  </span>
                </div>
              )}

              {/* Order Items */}
              <div className="mt-6">
                {/* Customer Name */}
                <div className="sm:flex items-center justify-between gap-4 mt-2">
                  <span className="font-normal mb-1 sm:mb-0 text-gray-500 dark:text-gray-400">
                    Name
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white sm:text-end">
                    {order.customerName}
                  </span>
                </div>

                {/* Address */}
                <div className="sm:flex items-center justify-between gap-4 mt-2">
                  <span className="font-normal mb-1 sm:mb-0 text-gray-500 dark:text-gray-400">
                    Address
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white sm:text-end">
                    {order.address}
                  </span>
                </div>

                <ul className="space-y-2">
                  {order.orderItems.map((item) => (
                    <li key={item.id} className="my-2">
                      <div className="flex justify-between">
                        <span className="font-normal text-gray-500 dark:text-gray-400">
                          Product Name
                        </span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {item.product.name}
                        </span>
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="font-normal text-gray-500 dark:text-gray-400">
                          Price
                        </span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {formatCurrency(item.price)}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Total Price & Action Buttons */}
              <div className="">
                {order.shippingStatus !== "SELESAI" && (
                  <button
                    className="px-4 py-2 bg-primary hover:bg-primary/50 text-white rounded-md"
                    onClick={() => updateShippingStatus(order.id, "SELESAI")}
                  >
                    Mark as Completed
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Orders;
