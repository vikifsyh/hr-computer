"use client";
import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/20/solid";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
}

interface FormState {
  id: string;
  name: string;
  description: string;
  price: string;
  image: File | null;
}

const Page: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState<FormState>({
    id: "",
    name: "",
    description: "",
    price: "",
    image: null,
  });
  const [loading, setLoading] = useState(false);

  // Fetch all products
  const fetchProducts = async (): Promise<void> => {
    try {
      const response = await fetch("/api/product");
      const data = await response.json();
      if (response.ok) {
        setProducts(data.products);
      } else {
        console.error(data.error);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  // Handle form submission for creating or updating a product
  const handleSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("description", form.description);
    formData.append("price", form.price);
    if (form.image) {
      formData.append("image", form.image);
    }

    try {
      const url = form.id ? `/api/product?id=${form.id}` : "/api/product";
      const method = form.id ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        body: formData,
      });

      const data = await response.json();
      if (response.ok) {
        alert(`Product ${form.id ? "updated" : "created"} successfully.`);
        fetchProducts(); // Refresh products
        setForm({ id: "", name: "", description: "", price: "", image: null });
      } else {
        console.error(data.error);
        alert(data.error);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setLoading(false);
    }
  };

  // Delete a product
  const handleDelete = async (id: string): Promise<void> => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const response = await fetch(`/api/product?id=${id}`, {
        method: "DELETE",
      });

      const data = await response.json();
      if (response.ok) {
        alert("Product deleted successfully.");
        fetchProducts(); // Refresh products
      } else {
        console.error(data.error);
        alert(data.error);
      }
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(amount);
  };

  // Load existing product data into the form for editing
  const handleEdit = (product: Product): void => {
    setForm({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      image: null, // Leave image null as it cannot be preloaded
    });
  };

  // Handle file input change
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files ? e.target.files[0] : null;
    setForm({ ...form, image: file });
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <main className="flex-1 p-4 sm:ml-72 sm:mr-10 my-10 rounded-lg bg-white">
      <Breadcrumb />
      <div className="bg-primary-50 p-4 rounded-lg">
        <h1 className="font-bold text-2xl">Product Management</h1>

        <div className="mt-6">
          <form
            onSubmit={handleSubmit}
            className="mb-6 p-4 bg-white rounded-lg"
          >
            <h2 className="text-lg font-semibold mb-4">
              {form.id ? "Edit Product" : "Add New Product"}
            </h2>
            <input
              type="text"
              placeholder="Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full p-2 mb-3 border rounded focus:border-primary outline-none"
              required
            />
            <textarea
              placeholder="Description"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              className="w-full p-2 mb-3 border rounded focus:border-primary outline-none"
              required
            />
            <input
              type="number"
              placeholder="Price"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              className="w-full p-2 mb-3 border rounded focus:border-primary outline-none"
              required
            />
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="block w-full mt-4 text-sm text-gray-900 rounded-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-primary-600 file:border-0 file:bg-primary-600 file:text-white file:py-2 file:px-4 file:rounded-l-lg hover:file:bg-primary-600 hover:file:text-primary-600 transition-all"
            />

            <button
              type="submit"
              className="mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-primary-600"
              disabled={loading}
            >
              {loading
                ? "Submitting..."
                : form.id
                ? "Update Product"
                : "Add Product"}
            </button>
          </form>

          <h2 className="text-xl font-semibold mb-4">Products</h2>

          <div className="relative overflow-x-auto">
            <table className="w-full text-sm text-left rtl:text-right text-gray-500 ">
              <thead className="text-xs text-gray-700 uppercase bg-white ">
                <tr>
                  <th scope="col" className="px-6 py-3">
                    Product name
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Description
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Price
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Actions
                  </th>
                </tr>
              </thead>
              {products.map((product) => (
                <tbody key={product.id}>
                  <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                    <th
                      scope="row"
                      className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                    >
                      {product.name}
                    </th>
                    <td className="px-6 py-4">{product.description}</td>
                    <td className="px-6 py-4">
                      {product.price && formatCurrency(product.price)}
                    </td>
                    <td className="px-6 py-4 flex items-center gap-2">
                      <button onClick={() => handleEdit(product)}>
                        <PencilSquareIcon className="w-6 h-6 text-primary-600" />
                      </button>
                      <button onClick={() => handleDelete(product.id)}>
                        <TrashIcon className="w-6 h-6 text-primary-600" />
                      </button>
                    </td>
                  </tr>
                </tbody>
              ))}
            </table>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Page;