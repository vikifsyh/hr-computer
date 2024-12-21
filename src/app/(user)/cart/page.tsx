"use client";
import { useEffect, useState } from "react";
import EmptyCart from "../../../../public/image/emptycart.png";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";

function CartPage() {
  const [carts, setCarts] = useState<any[]>([]); // Ensure carts is initialized as an empty array
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Ambil data cart dari API
    const fetchCarts = async () => {
      setLoading(true); // Set loading true sebelum mengambil data
      const response = await fetch("/api/cart"); // Ganti dengan URL API Anda
      const data = await response.json();
      setCarts(data.carts || []); // Ensure carts is always an array
      setLoading(false); // Set loading false setelah data berhasil diambil
    };
    fetchCarts();
  }, []);

  const handleRemoveItem = async (itemId: string) => {
    try {
      const response = await fetch(`/api/cart?id=${itemId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to remove item");
      }

      // Perbarui state setelah item dihapus
      setCarts((prevCarts) =>
        prevCarts.map((cart) => ({
          ...cart,
          orderItems: cart.orderItems.filter((item: any) => item.id !== itemId),
        }))
      );
    } catch (error) {
      console.error("Error removing item:", error);
      alert("Failed to remove item. Please try again.");
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(amount);
  };

  const calculateTotalPrice = (price: number, quantity: number): number => {
    return price * quantity;
  };

  // Check if user is logged in
  const isLoggedIn = true; // Replace with actual authentication check logic

  if (!isLoggedIn) {
    router.push("/signIn"); // Redirect to login page if not logged in
    return null; // You can return a loading or redirect message here
  }

  return (
    <div className="mx-5 md:mx-20 my-8 md:my-16">
      <h1 className="text-xl font-medium text-gray-900">Your Cart</h1>
      {loading ? (
        <div className="space-y-6">
          <div className="p-6 divide-y divide-gray-200">
            <div className="flex gap-4 items-center py-6">
              <div className="skeleton-image w-[130px] h-[130px] bg-gray-300 rounded-md"></div>
              <div className="flex flex-col gap-2 w-full">
                <div className="skeleton-text h-6 w-3/4 bg-gray-300"></div>
                <div className="skeleton-text h-6 w-1/4 bg-gray-300"></div>
              </div>
            </div>
            <div className="skeleton-text h-4 w-1/3 bg-gray-300 mt-3"></div>
            <div className="skeleton-button h-10 w-1/2 bg-gray-300 mt-4"></div>
          </div>
        </div>
      ) : carts.length === 0 ? (
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
      ) : (
        <div className="space-y-6">
          <div className="p-6 divide-y divide-gray-200">
            {carts.map((cart) => (
              <div key={cart.id}>
                {cart.orderItems.map((item: any) => {
                  return (
                    <div key={item.id} className="flex gap-4 items-center py-6">
                      <div className="flex items-center space-x-4 w-full">
                        <div className="size-28 shrink-0 overflow-hidden rounded-md border border-gray-200">
                          <Image
                            src={item.productImage}
                            alt={item.productName}
                            width={1000}
                            height={1000}
                            className="w-full object-cover"
                            style={{ height: 130 }}
                          />
                        </div>
                        <div className="font-medium text-gray-900 w-full">
                          <div className="md:flex md:justify-between items-center">
                            <h3>{item.productName}</h3>
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
                  );
                })}

                <div className="border-t border-gray-200 py-6">
                  <div className="flex justify-between text-base font-medium text-gray-900">
                    <p>Subtotal</p>
                    <p>
                      {formatCurrency(
                        cart.orderItems.reduce(
                          (total: number, item: any) =>
                            total +
                            calculateTotalPrice(item.price, item.quantity),
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
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default CartPage;
