"use client";
import Breadcrumb from "@/components/ui/Breadcrumb";
import React, { useEffect, useState } from "react";

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

interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export default function Dashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [products, setProducts] = useState([]);
  const [carts, setCarts] = useState<Cart[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCarts = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/cart"); // URL API
        if (!response.ok) {
          throw new Error("Failed to fetch carts");
        }
        const data = await response.json();
        setCarts(data.carts || []); // Pastikan carts diisi dengan array dari API
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCarts();
  }, []);

  // Menghitung total jumlah pesanan
  const totalOrders = carts.reduce((total, cart) => {
    return (
      total +
      cart.orderItems.reduce((subTotal, item) => subTotal + item.quantity, 0)
    );
  }, 0);

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/profil?all=true");
      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }
      const data = await response.json();
      setUsers(data.users);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  // Menambahkan penggunaan useEffect untuk memanggil API ketika komponen dimuat
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchProducts = async (): Promise<void> => {
    try {
      const response = await fetch("/api/product");
      const data = await response.json();
      if (response.ok) {
        setProducts(data.products); // Mengatur data produk ke state
      } else {
        console.error(data.error);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  useEffect(() => {
    fetchProducts(); // Memanggil fungsi fetch saat komponen dimuat
  }, []);

  const formatCurrency = (value: number): string => {
    return value.toLocaleString("id-ID", {
      style: "currency",
      currency: "IDR",
    });
  };
  return (
    <main className="flex-1 p-4 sm:ml-72 sm:mr-10 my-10 rounded-lg bg-white">
      {/* Breadcrumb */}
      <Breadcrumb />

      {/* Header Section */}
      <div className="bg-primary-50 p-4 rounded-lg mb-6">
        <h1 className="font-bold text-2xl mb-2">Dashboard</h1>
        <p className="text-sm text-gray-600">
          Selamat datang kembali! Lihat ringkasan data Anda di bawah ini.
        </p>
      </div>

      {/* Statistics Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-blue-100 p-4 rounded-lg shadow-sm">
          <h2 className="text-lg font-medium text-blue-700">Total Pengguna</h2>
          <p className="text-4xl font-bold text-blue-900 mt-2">
            {users.length}
          </p>
        </div>
        <div className="bg-green-100 p-4 rounded-lg shadow-sm">
          <h2 className="text-lg font-medium text-green-700">Produk</h2>
          <p className="text-4xl font-bold text-green-900 mt-2">
            {products.length}
          </p>
        </div>
        <div className="bg-yellow-100 p-4 rounded-lg shadow-sm">
          <h2 className="text-lg font-medium text-yellow-700">Pesanan Baru</h2>
          <p className="text-4xl font-bold text-yellow-900 mt-2">
            {totalOrders}
          </p>
        </div>
      </div>
      <div className="space-y-4">
        {carts.map((cart) => (
          <div
            key={cart.id}
            className="border rounded-lg p-4 bg-gray-50 shadow-sm"
          >
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">{cart.userName}</h2>
              <span
                className={`px-3 py-1 text-sm font-medium rounded ${
                  cart.status === "COMPLETED"
                    ? "bg-green-100 text-green-700"
                    : cart.status === "PENDING"
                    ? "bg-yellow-100 text-yellow-700"
                    : cart.status === "CART"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {cart.status}
              </span>
            </div>
            <p className="text-sm text-gray-500">
              Total Item: {cart.totalQuantity}
            </p>
            <p className="text-sm text-gray-500">Total Harga: {cart.price}</p>
            <ul className="mt-2 space-y-2">
              {cart.orderItems.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center gap-4 border p-2 rounded"
                >
                  <img
                    src={item.productImage}
                    alt={item.productName}
                    className="w-12 h-12 object-cover rounded"
                  />
                  <div>
                    <h3 className="text-sm font-medium">{item.productName}</h3>
                    <p className="text-sm text-gray-500">
                      Jumlah: {item.quantity} | Harga:{" "}
                      {formatCurrency(parseFloat(item.price))}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="bg-primary-50 p-4 rounded-lg mt-4">
        <h2 className="text-lg font-semibold mb-2">Aktivitas Pengguna Baru</h2>
        {users.length === 0 ? (
          <p className="text-gray-500">Tidak ada pengguna baru saat ini.</p>
        ) : (
          <ul className="space-y-2">
            {users.map((user) => (
              <li
                key={user.id}
                className="border p-2 rounded-lg bg-gray-50 shadow-sm"
              >
                <h3 className="text-md font-medium">Nama: {user.name}</h3>
                <p className="text-sm text-gray-500">Email: {user.email}</p>
                <p className="text-sm text-gray-500">
                  Bergabung pada:{" "}
                  {new Date(user.createdAt).toLocaleDateString()}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
