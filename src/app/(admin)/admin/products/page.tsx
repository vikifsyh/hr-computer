"use client";
import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/20/solid";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  category: string; // Add category to product
}

interface FormState {
  id: string;
  name: string;
  description: string;
  price: string;
  image: File | null;
  category: string; // Add category to form state
}

const Page: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState<FormState>({
    id: "",
    name: "",
    description: "",
    price: "",
    image: null,
    category: "", // Set default value for category
  });
  const [loading, setLoading] = useState(false);

  // Example categories, you can fetch these from an API if needed
  const categories = ["LAPTOP", "SPAREPART"];
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 5;

  // Pagination calculations
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = products.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );
  const totalPages = Math.ceil(products.length / productsPerPage);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

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
    formData.append("category", form.category); // Append category
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
        setForm({
          id: "",
          name: "",
          description: "",
          price: "",
          image: null,
          category: "",
        });
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
      category: product.category, // Set category
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
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full p-2 mb-3 border rounded focus:border-primary outline-none"
              required
            >
              <option value="">Select Category</option>
              {categories.map((category, index) => (
                <option key={index} value={category}>
                  {category}
                </option>
              ))}
            </select>
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
                    Category
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Actions
                  </th>
                </tr>
              </thead>
              {currentProducts.map((product) => (
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
                      {formatCurrency(product.price)}
                    </td>
                    <td className="px-6 py-4">{product.category}</td>
                    <td className="px-6 py-4 flex gap-2">
                      <button
                        onClick={() => handleEdit(product)}
                        className="text-primary hover:text-primary-600"
                      >
                        <PencilSquareIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                </tbody>
              ))}
            </table>
            <div className="flex justify-between items-center mt-6">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-1 bg-primary text-white rounded disabled:opacity-50 hover:bg-primary-600"
              >
                <ChevronLeftIcon className="w-5 h-5 text-white" />
              </button>

              <div className="space-x-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => goToPage(page)}
                      className={`px-3 py-1 rounded ${
                        page === currentPage
                          ? "bg-primary text-white"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                    >
                      {page}
                    </button>
                  )
                )}
              </div>

              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-1 bg-primary text-white rounded disabled:opacity-50 hover:bg-primary-600"
              >
                <ChevronRightIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Page;
