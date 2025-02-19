"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import EmptyCart from "../../../../public/image/emptycart.png";

interface OrderItem {
  id: string;
  productName: string;
  quantity: number;
  price: number;
  productImage: string;
}

interface Order {
  id: string;
  userName: string;
  address: string;
  orderItems: OrderItem[];
}

export default function Page() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [snapLoaded, setSnapLoaded] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const snapScript = "https://app.sandbox.midtrans.com/snap/snap.js";
    const clientKey = process.env.MIDTRANS_CLIENT_KEY || "";
    const fetchOrders = async () => {
      try {
        const response = await fetch("/api/cart");
        if (!response.ok) {
          throw new Error("Failed to fetch orders");
        }

        const data = await response.json();
        setOrders(data.orders);
        setLoading(false);
      } catch (err) {
        setError("Failed to load orders");
        setLoading(false);
      }
    };

    fetchOrders();

    const script = document.createElement("script");
    script.src = snapScript;
    script.setAttribute("data-client-key", clientKey); // Replace with your client key
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleRemoveItem = async (itemId: string) => {
    try {
      const response = await fetch(`/api/cart?id=${itemId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to remove item");
      }

      setOrders((prevOrders) =>
        prevOrders.map((order) => ({
          ...order,
          orderItems: order.orderItems.filter((item) => item.id !== itemId),
        }))
      );
    } catch (error) {
      console.error("Error removing item:", error);
      alert("Failed to remove item. Please try again.");
    }
  };

  const calculateTotalPrice = (price: string, quantity: number): number => {
    return parseFloat(price) * quantity;
  };

  const formatCurrency = (value: number): string => {
    return value.toLocaleString("id-ID", {
      style: "currency",
      currency: "IDR",
    });
  };

  const checkout = async () => {
    if (!orders.length) {
      alert("Your cart is empty.");
      return;
    }

    try {
      const order = orders[0];
      const response = await fetch("/api/payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId: order.id,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to initiate payment");
      }

      const data = await response.json();
      const token = data.token.token; // Access the token string here

      window.snap.pay(token, {
        onSuccess: function (result: any) {
          console.log("Payment success:", result);

          fetch("/api/payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              orderId: result.order_id.split("-")[1], // Ambil ID asli dari `order-<id>-<timestamp>`
              paymentStatus: "COMPLETED",
            }),
          })
            .then((res) => res.json())
            .then((data) => console.log("Updated Order:", data))
            .catch((err) => console.error("Error updating order:", err));
        },
        onPending: function (result: any) {
          console.log("Payment pending:", result);
        },
        onError: function (result: any) {
          console.log("Payment failed:", result);
        },
      });
    } catch (error) {
      console.error("Error during checkout:", error);
      alert("An error occurred during checkout. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="mx-5 md:mx-20 my-8 md:my-16">
        <h1 className="text-xl font-medium text-gray-900">Your Cart</h1>
        {/* Skeleton loading here */}
      </div>
    );
  }

  if (
    orders.length === 0 ||
    orders.every((order) => order.orderItems.length === 0)
  ) {
    return (
      <div className="mx-5 md:mx-20 my-8 md:my-16">
        <h1 className="text-xl font-medium text-gray-900">Your Cart</h1>
        <div className="text-center py-4">
          <div className="max-w-32 mx-auto">
            <Image
              src={EmptyCart}
              alt="Empty Cart"
              width={1000}
              height={1000}
            />
          </div>
          <p className="text-lg font-semibold text-gray-700">
            Your cart is empty.
          </p>
          <button
            onClick={() => router.push("/product")}
            className="mt-6 text-primary-600 hover:text-primary-400"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  // Calculate total price for all items in the cart
  const totalPrice = orders.reduce((total, order) => {
    return (
      total +
      order.orderItems.reduce(
        (orderTotal, item) =>
          orderTotal +
          calculateTotalPrice(item.price.toString(), item.quantity),
        0
      )
    );
  }, 0);

  return (
    <div className="mx-5 md:mx-20 my-8 md:my-16">
      <h1 className="text-xl font-medium text-gray-900">Your Cart</h1>
      <div className="space-y-6">
        <div className="p-6 divide-y divide-gray-200">
          {orders.map((order) => (
            <div key={order.id}>
              {order.orderItems.map((item) => (
                <div key={item.id}>
                  <div className="flex gap-4 items-center py-6">
                    <div className="flex items-center space-x-4 w-full">
                      <div className="size-28 shrink-0 overflow-hidden rounded-md border border-gray-200">
                        {item.productImage ? (
                          <Image
                            src={item.productImage}
                            alt={item.productName}
                            width={1000}
                            height={1000}
                            className="w-full object-cover"
                            style={{ height: 130 }}
                          />
                        ) : (
                          <div className="w-full h-[130px] flex items-center justify-center bg-gray-100 text-gray-400">
                            No Image
                          </div>
                        )}
                      </div>
                      <div className="font-medium text-gray-900 w-full">
                        <div className="md:flex md:justify-between items-center">
                          <h3>{item.productName}</h3>
                          <p>{formatCurrency(item.price * item.quantity)}</p>
                        </div>
                        <div className="flex justify-between items-center w-full mt-5">
                          <p className="text-gray-500 text-sm">
                            Qty: {item.quantity}
                          </p>
                          <button
                            onClick={() => handleRemoveItem(item.id)}
                            className="text-red-500"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Checkout Button - Only show if there are items in the cart */}
        {totalPrice > 0 && (
          <div className="border-t border-gray-200 py-6">
            <div className="flex justify-between text-base font-medium text-gray-900">
              <p>Subtotal</p>
              <p>{formatCurrency(totalPrice)}</p>
            </div>
            <div className="mt-6">
              <button
                onClick={checkout}
                className="flex items-center justify-center rounded-md border border-transparent bg-primary-600 px-6 py-2 text-base font-medium text-white shadow-sm hover:bg-primary-700"
              >
                Checkout
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
