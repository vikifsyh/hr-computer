"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface OrderItem {
  id: string;
  productName: string;
  productImage: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  paymentStatus: "PENDING" | "COMPLETED";
  orderItems: OrderItem[];
}

export default function PaymentPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/cart");
      if (!response.ok) {
        throw new Error("Failed to fetch orders");
      }
      const data = await response.json();
      setOrders(data.orders);
    } catch (err) {
      setError("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();

    const snapScript = "https://app.sandbox.midtrans.com/snap/snap.js";
    const clientKey = process.env.MIDTRANS_CLIENT_KEY || "";

    const script = document.createElement("script");
    script.src = snapScript;
    script.setAttribute("data-client-key", clientKey);
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handlePayNow = async (orderId: string) => {
    try {
      const response = await fetch("/api/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });

      if (!response.ok) throw new Error("Failed to initiate payment");

      const data = await response.json();
      const token = data.token.token;

      if (typeof window !== "undefined" && window.snap) {
        window.snap.pay(token, {
          onSuccess: async (result: any) => {
            console.log("Payment success:", result);
            router.push("/order-history");

            const orderIdFromResult = result.order_id.split("-")[1];
            try {
              const updateResponse = await fetch("/api/payment", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  orderId: orderIdFromResult,
                  paymentStatus: "COMPLETED",
                }),
              });
              const updateData = await updateResponse.json();
              console.log("Updated Order:", updateData);
              await fetchOrders();
            } catch (error) {
              console.error("Error updating order:", error);
            }
          },
          onPending: (result: any) => {
            console.log("Payment pending:", result);
            router.push("/order-history");
          },
          onError: (result: any) => {
            console.error("Payment error:", result);
            alert("An error occurred during payment");
          },
          onClose: () => {
            console.log("Payment popup closed");
          },
        });
      }
    } catch (error) {
      console.error("Error initiating payment:", error);
      alert("Failed to start payment.");
    }
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString("id-ID", {
      style: "currency",
      currency: "IDR",
    });
  };

  const combineOrderItems = (orderItems: OrderItem[]) => {
    const combinedItems: { [key: string]: OrderItem } = {};

    orderItems.forEach((item) => {
      if (combinedItems[item.productName]) {
        combinedItems[item.productName].quantity += item.quantity;
      } else {
        combinedItems[item.productName] = { ...item };
      }
    });

    return Object.values(combinedItems);
  };

  const pendingOrders = orders.filter(
    (order) => order.paymentStatus === "PENDING"
  );
  const completedOrders = orders.filter(
    (order) => order.paymentStatus === "COMPLETED"
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-dashed rounded-full animate-spin border-primary mx-auto"></div>
          <p className="text-gray-600 font-medium">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-4 md:mx-20 my-10">
      <h1 className="my-6 md:my-0 mb-2 text-xl font-semibold text-gray-900 sm:text-2xl">
        Payment Overview
      </h1>
      <p className="text-gray-500 mb-6 md:mb-8">
        Manage your pending and completed payments here.
      </p>

      {/* Pending Payment */}
      <section className="my-16">
        <h2 className="text-xl font-semibold text-primary">Pending Payment</h2>
        {pendingOrders.length === 0 ? (
          <p className="text-gray-500">No completed orders yet.</p>
        ) : (
          pendingOrders.map((order) => (
            <div
              key={order.id}
              className="rounded-lg border border-gray-100 bg-gray-50 p-6 my-6 md:mb-8"
            >
              {order.orderItems.map((item) => (
                <div key={item.id} className="flex items-center gap-5 my-2">
                  <div className="w-24 h-24 overflow-hidden rounded-lg border bg-gray-100">
                    <Image
                      src={item.productImage || "/image/emptycart.png"}
                      alt={item.productName}
                      width={96}
                      height={96}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">
                      {item.productName}
                    </h3>
                    <p className="text-gray-500 text-sm">
                      Quantity: {item.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-primary font-bold text-md">
                      {formatCurrency(item.price * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}
              <div className="flex justify-end mt-4">
                <button
                  onClick={() => handlePayNow(order.id)}
                  className="bg-primary hover:bg-primary-400 text-white font-semibold px-5 py-2 rounded-lg transition"
                >
                  Pay Now
                </button>
              </div>
            </div>
          ))
        )}
      </section>

      {/* Completed Payment */}
      <section>
        <h2 className="text-xl font-semibold text-primary">
          Completed Payment
        </h2>

        {completedOrders
          .filter((order) => order.orderItems && order.orderItems.length > 0)
          .map((order) => {
            const combinedItems = combineOrderItems(order.orderItems);

            if (combinedItems.length === 0) return null;

            return (
              <div
                key={order.id}
                className="rounded-lg border border-gray-100 bg-gray-50 p-6 my-6 md:mb-8"
              >
                {combinedItems.map((item, index) => (
                  <div key={index} className="flex items-center gap-5 my-2">
                    <div className="w-24 h-24 overflow-hidden rounded-lg border bg-gray-100">
                      <Image
                        src={item.productImage || "/image/emptycart.png"}
                        alt={item.productName}
                        width={96}
                        height={96}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold">
                        {item.productName}
                      </h3>
                      <p className="text-gray-500 text-sm">
                        Quantity: {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-primary font-bold text-md">
                        {formatCurrency(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}

                <div className="text-right mt-4">
                  <Link
                    href={`/track-package/${order.id}`}
                    className="inline-block bg-primary hover:bg-primary-400 text-white font-semibold px-5 py-2 rounded-lg transition"
                  >
                    Track Package
                  </Link>
                </div>
              </div>
            );
          })}
      </section>
    </div>
  );
}
