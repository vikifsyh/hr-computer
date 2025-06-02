"use client";

import Breadcrumb from "@/components/ui/Breadcrumb";
import React, { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface Negotiation {
  id: string;
  offerPrice: number;
  status: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email?: string;
  };
  product: {
    id: string;
    name: string;
    price: number;
  };
}

export default function AdminNegotiationsPage() {
  const [negotiations, setNegotiations] = useState<Negotiation[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchNegotiations = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/nego");
      const data = await res.json();
      if (res.ok) {
        setNegotiations(data.negotiations);
      } else {
        toast.error(data.error || "Failed to fetch negotiations");
      }
    } catch (error) {
      toast.error("Failed to fetch negotiations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNegotiations();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/nego/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(`Negotiation ${status.toLowerCase()}`);
        // Update local state supaya UI langsung refresh
        setNegotiations((prev) =>
          prev.map((nego) => (nego.id === id ? { ...nego, status } : nego))
        );
      } else {
        toast.error(data.error || "Failed to update negotiation");
      }
    } catch (error) {
      toast.error("Failed to update negotiation");
    }
  };

  return (
    <main className="flex-1 p-4 sm:ml-72 sm:mr-10 my-10 rounded-lg bg-white">
      <Breadcrumb />
      <div className="bg-primary-50 p-4 rounded-lg">
        <h1 className="font-bold text-2xl mb-4">Negotiations List</h1>

        {loading && <p>Loading negotiations...</p>}

        {!loading && negotiations.length === 0 && <p>No negotiations found.</p>}

        {!loading && negotiations.length > 0 && (
          <div className="relative overflow-x-auto mt-5">
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-white">
                <tr>
                  <th scope="col" className="px-6 py-3">
                    User
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Product
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Original Price
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Offer Price
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {negotiations.map((nego) => (
                  <tr
                    key={nego.id}
                    className="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
                  >
                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                      {nego.user.name}
                    </td>
                    <td className="px-6 py-4">{nego.product.name}</td>
                    <td className="px-6 py-4">
                      {new Intl.NumberFormat("id-ID", {
                        style: "currency",
                        currency: "IDR",
                      }).format(nego.product.price)}
                    </td>
                    <td className="px-6 py-4">
                      {new Intl.NumberFormat("id-ID", {
                        style: "currency",
                        currency: "IDR",
                      }).format(nego.offerPrice)}
                    </td>
                    <td className="px-6 py-4">
                      {nego.status === "PENDING" ? (
                        <span className="flex gap-2">
                          <button
                            onClick={() => updateStatus(nego.id, "ACCEPTED")}
                            className="bg-primary text-white px-3 py-1 rounded hover:bg-green-700"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => updateStatus(nego.id, "REJECTED")}
                            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-700"
                          >
                            Reject
                          </button>
                        </span>
                      ) : (
                        <span
                          className={`px-2 py-1 rounded text-white font-semibold uppercase text-sm ${
                            nego.status === "ACCEPTED"
                              ? "bg-primary"
                              : "bg-red-500"
                          }`}
                        >
                          {nego.status}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <ToastContainer position="top-right" />
    </main>
  );
}
