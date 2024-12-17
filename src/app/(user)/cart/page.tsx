"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react"; // Import useSession dari NextAuth
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import EmptyCart from "../../../../public/image/emptycart.png";

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
}

interface OrderItem {
  id: number;
  productId: number;
  quantity: number;
  price: number;
  product: Product;
}

interface Cart {
  id: number;
  userId: string;
  status: string;
  orderItems: OrderItem[];
}

const CartPage = () => {
  const { data: session, status } = useSession(); // Mendapatkan session dan status dari NextAuth
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);

  const router = useRouter();
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(amount);
  };

  // Fungsi untuk menghapus item dari keranjang
  const handleRemoveItem = async (itemId: number) => {
    if (status === "loading" || !session) {
      // Jika status session sedang loading atau tidak ada session
      return;
    }

    try {
      const response = await fetch(`/api/cart`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.user?.id}`,
        },
        body: JSON.stringify({ itemId }),
      });

      if (response.ok) {
        setCart((prevCart) => {
          if (!prevCart) return null;
          return {
            ...prevCart,
            orderItems: prevCart.orderItems.filter(
              (item) => item.id !== itemId
            ),
          };
        });
      } else {
        console.error("Failed to remove item:", await response.text());
      }
    } catch (error) {
      console.error("Error removing item:", error);
    }
  };

  useEffect(() => {
    const fetchCart = async () => {
      if (!session) return;

      try {
        const response = await fetch("/api/cart", {
          headers: {
            Authorization: `Bearer ${session?.user?.id}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          console.log("Fetched Cart Data:", data); // Debug cart data
          setCart(data.cart); // Pastikan setCart menggunakan data.cart
        } else {
          console.error("Failed to fetch cart:", await response.text());
        }
      } catch (error) {
        console.error("Error fetching cart:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [session]);

  if (loading) {
    return <div className="text-center py-4">Loading...</div>;
  }

  if (loading) {
    return <div className="text-center py-4">Loading...</div>;
  }

  if (loading) {
    return <div className="text-center py-4">Loading...</div>;
  }

  if (!cart || !cart.orderItems || cart.orderItems.length === 0) {
    return (
      <div className="text-center py-4">
        <div className="max-w-32 mx-auto">
          <Image src={EmptyCart} alt="Empty Cart" width={1000} height={1000} />
        </div>
        <p className="text-lg font-semibold text-gray-700">
          Your cart is empty.
        </p>
        <p className="text-gray-400">
          Looks like you have not added anything to your cart. Go ahead &
          explore top categories
        </p>
        <button
          onClick={() => router.push("/product")}
          className="mt-6 text-primary-600 hover:text-primary-400"
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="mx-5 md:mx-20 my-8 md:my-16">
      <h1 className="text-xl font-medium text-gray-900">Your Cart</h1>
      <div className="space-y-6">
        <div className="p-6 divide-y divide-gray-200">
          {cart.orderItems.map((item) => (
            <div key={item.id} className="flex gap-4 items-center py-6">
              <div className="flex items-center space-x-4 w-full">
                <div className="size-28 shrink-0 overflow-hidden rounded-md border border-gray-200">
                  <Image
                    src={item.product.image}
                    alt="Product"
                    width={1000}
                    height={1000}
                    className="w-full"
                  />
                </div>
                <div className="font-medium text-gray-900 w-full">
                  <div className="flex justify-between items-center">
                    <h3>{item.product.name}</h3>
                    <p>{formatCurrency(item.price)}</p>
                  </div>
                  <div className="flex justify-between items-center w-full mt-5">
                    <p className="text-gray-500 text-sm">
                      Qty: {item.quantity}
                    </p>
                    <button
                      className="text-red-500"
                      onClick={() => handleRemoveItem(item.id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-gray-200 px-4 py-6 sm:px-6">
        <div className="flex justify-between text-base font-medium text-gray-900">
          <p>Subtotal</p>
          <p>
            {formatCurrency(
              cart.orderItems.reduce(
                (total, item) => total + item.price * item.quantity,
                0
              )
            )}
          </p>
        </div>
        <p className="mt-0.5 text-sm text-gray-500">
          Shipping and taxes calculated at checkout.
        </p>
        <div className="mt-6">
          <Link
            href="/checkout"
            className="flex items-center justify-center rounded-md border border-transparent bg-primary-600 px-6 py-2 text-base font-medium text-white shadow-sm hover:bg-primary-700"
          >
            Checkout
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
