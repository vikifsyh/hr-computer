"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useSession, signIn } from "next-auth/react";
import NoPict from "../../../../public/image/nopict.png";

interface User {
  id: string;
  name: string;
  email: string;
  address: string | null;
  image: string | null;
  phoneNumber: string | null;
  createdAt: string;
}

export default function Profile() {
  const { data: session, status } = useSession();
  const [isSaving, setIsSaving] = useState(false);
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [image, setImage] = useState<File | null>(null);

  useEffect(() => {
    if (status === "authenticated") {
      const fetchProfile = async () => {
        try {
          const res = await fetch("/api/profil", {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          });

          if (!res.ok) {
            throw new Error("Failed to fetch profile.");
          }

          const data = await res.json();
          setUserData(data.user);
          setName(data.user.name || "");
          setPhoneNumber(data.user.phoneNumber || "");
          setEmail(data.user.email || "");
          setAddress(data.user.address || "");
          setLoading(false);
        } catch (err: any) {
          setError(err.message);
          setLoading(false);
        }
      };

      fetchProfile();
    }
  }, [status]);

  if (status === "loading") return <p>Loading...</p>;
  if (status === "unauthenticated") {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h2 className="text-lg font-medium mb-4">You are not logged in.</h2>
        <button
          className="py-2 px-4 bg-primary-600 text-white rounded-md hover:bg-primary-600/50"
          onClick={() => signIn()}
        >
          Login
        </button>
      </div>
    );
  }

  if (loading) return <p>Loading profile...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!userData) {
    return <p>No profile data found.</p>;
  }

  const handleUpdateProfile = async () => {
    setIsSaving(true);
    const formData = new FormData();
    formData.append("name", name);
    formData.append("phoneNumber", phoneNumber);
    formData.append("email", email);
    formData.append("address", address);
    if (image) formData.append("image", image);

    try {
      const res = await fetch("/api/profil", {
        method: "PUT",
        credentials: "include",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Failed to update profile.");
      }

      const data = await res.json();
      setUserData(data.user);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="px-4 md:px-8 lg:px-36 py-6">
      <div className="border border-neutral-50 p-4 md:p-6 rounded-lg">
        <h1 className="text-lg font-medium mb-4">Profile</h1>
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:max-w-60 border border-neutral-50 p-2 rounded-md">
            <Image
              src={userData.image || NoPict}
              alt={`${userData.name || "User"}'s profile`}
              width={1000}
              height={1000}
              className="rounded-md object-cover"
              style={{ height: "240px" }}
            />
            <input
              type="file"
              accept="image/*"
              className="block w-full mt-4 text-sm text-gray-900 rounded-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-primary-600 file:border-0 file:bg-primary-600 file:text-white file:py-2 file:px-4 file:rounded-l-lg hover:file:bg-primary-600 hover:file:text-primary-600 transition-all"
              onChange={(e) => {
                if (e.target.files) setImage(e.target.files[0]);
              }}
            />
            <div className="mt-4">
              <p className="text-xs italic">
                • File type (jpg/png/jpeg/svg/webp/gif)
              </p>
              <p className="text-xs italic">• max size 10 Mb</p>
            </div>
          </div>
          <div className="w-full">
            <div className="p-1 md:p-4">
              <label className="text-xs" htmlFor="name">
                Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2 border border-neutral-50 rounded-md focus:border-primary-600 outline-none mt-1"
                disabled
              />
            </div>
            <div className="p-1 md:p-4">
              <label className="text-xs" htmlFor="phoneNumber">
                Phone Number *
              </label>
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full p-2 border border-neutral-50 rounded-md focus:border-primary-600 outline-none mt-1"
              />
            </div>
            <div className="p-1 md:p-4">
              <label className="text-xs" htmlFor="email">
                Email *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 border border-neutral-50 rounded-md focus:border-primary-600 outline-none mt-1"
                disabled
              />
            </div>
            <div className="p-1 md:p-4">
              <label className="text-xs" htmlFor="address">
                Address
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full p-2 border border-neutral-50 rounded-md focus:border-primary-600 outline-none mt-1"
              />
            </div>
          </div>
        </div>
        <button
          className={`mt-4 py-2 px-4 rounded-md w-full ${
            isSaving
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-primary-600 hover:bg-primary-600/50"
          } text-white`}
          onClick={handleUpdateProfile}
          disabled={isSaving}
        >
          {isSaving ? "Saving..." : "Save Changes"}
        </button>
      </div>
      <h2 className="font-semibold text-lg my-2">Main Address</h2>
      <div className="border border-neutral-50 p-5 rounded-lg">
        <h2 className="font-semibold">{userData.name || "-"}</h2>
        <p>{userData.address || "-"}</p>
        <p>
          Member since:{" "}
          {userData.createdAt
            ? new Date(userData.createdAt).toLocaleDateString()
            : "Unknown"}
        </p>
      </div>
    </div>
  );
}
