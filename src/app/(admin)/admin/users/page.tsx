"use client";
import React, { useState, useEffect } from "react";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/20/solid";

interface User {
  id: string;
  name: string;
  email: string;
  address: string | null;
  phoneNumber: string | null;
  image: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<User>>({});
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      fetchUsers();
    }
  }, [isClient]);

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

  const handleEdit = (userId: string) => {
    const user = users.find((user) => user.id === userId);
    if (user) {
      setFormData(user);
      setIsEditing(userId);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  if (!isClient) {
    return null; // Render nothing on the server to avoid hydration mismatch
  }

  return (
    <main className="flex-1 p-4 sm:ml-72 sm:mr-10 my-10 rounded-lg bg-white">
      <Breadcrumb />
      <div className="bg-primary-50 p-4 rounded-lg">
        <h1 className="font-bold text-2xl">User Management</h1>
        <div className="relative overflow-x-auto mt-5">
          <table className="w-full text-sm text-left rtl:text-right text-gray-500 ">
            <thead className="text-xs text-gray-700 uppercase bg-white ">
              <tr>
                <th scope="col" className="px-6 py-3">
                  Name
                </th>
                <th scope="col" className="px-6 py-3">
                  Email
                </th>
                <th scope="col" className="px-6 py-3">
                  Address
                </th>
                <th scope="col" className="px-6 py-3">
                  Phone Number
                </th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(users) && users.length > 0 ? (
                users.map((user) => (
                  <tr
                    key={user.id}
                    className="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
                  >
                    <th
                      scope="row"
                      className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                    >
                      {user.name}
                    </th>
                    <td className="px-6 py-4">{user.email}</td>
                    <td className="px-6 py-4">{user.address || "-"}</td>
                    <td className="px-6 py-4">{user.phoneNumber}</td>
                    {/* <td className="px-6 py-4 flex items-center gap-2">
                      <button onClick={() => handleEdit(user.id)}>
                        <PencilSquareIcon className="w-6 h-6 text-primary-600" />
                      </button>
                      <button onClick={() => handleDelete(user.id)}>
                        <TrashIcon className="w-6 h-6 text-primary-600" />
                      </button>
                    </td> */}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="text-center py-4">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* {isEditing && (
          <div className="mt-6 p-4 border rounded bg-gray-50">
            <h2 className="font-bold text-lg">Edit User</h2>
            <div className="mt-4">
              <label className="block font-medium">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name || ""}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded"
              />
            </div>
            <div className="mt-4">
              <label className="block font-medium">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email || ""}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded"
              />
            </div>
            <div className="mt-4">
              <label className="block font-medium">Address</label>
              <input
                type="text"
                name="address"
                value={formData.address || ""}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded"
              />
            </div>
            <div className="mt-4">
              <label className="block font-medium">Phone Number</label>
              <input
                type="text"
                name="phoneNumber"
                value={formData.phoneNumber || ""}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded"
              />
            </div>
          </div>
        )} */}
      </div>
    </main>
  );
}
