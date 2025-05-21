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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
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
