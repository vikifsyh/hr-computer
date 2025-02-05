// "use client";
// import Breadcrumb from "@/components/ui/Breadcrumb";
// import Image from "next/image";
// import React, { useEffect, useState } from "react";

// interface OrderItem {
//   id: string;
//   productName: string;
//   quantity: number;
//   price: number;
// }

// interface Order {
//   id: string;
//   userName: string;
//   address: string; // Assuming address is part of the order data
//   orderItems: OrderItem[];
//   status: string;
//   paymentStatus: string;
// }

// export default function Page() {
//   const [orders, setOrders] = useState<Order[]>([]);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     // Fetch the orders from API
//     const fetchOrders = async () => {
//       try {
//         const response = await fetch("/api/cart");
//         if (!response.ok) {
//           throw new Error("Failed to fetch orders");
//         }

//         const data = await response.json();
//         setOrders(data.orders); // Assuming the response contains an array of orders
//         setLoading(false);
//       } catch (err) {
//         setError("Failed to load orders");
//         setLoading(false);
//       }
//     };

//     fetchOrders();
//   }, []);

//   const calculateTotalPrice = (price: string, quantity: number): number => {
//     return parseFloat(price) * quantity; // Calculate total price per item
//   };

//   const formatCurrency = (value: number): string => {
//     return value.toLocaleString("id-ID", {
//       style: "currency",
//       currency: "IDR",
//     });
//   };

//   if (loading) {
//     return (
//       <main className="flex-1 p-4 sm:ml-72 sm:mr-10 my-10 rounded-lg bg-white">
//         <Breadcrumb />
//         <div className="bg-primary-50 p-4 rounded-lg">
//           <h1 className="font-bold text-2xl mb-4">Order Management</h1>
//           <p>Loading...</p>
//         </div>
//       </main>
//     );
//   }

//   if (error) {
//     return (
//       <main className="flex-1 p-4 sm:ml-72 sm:mr-10 my-10 rounded-lg bg-white">
//         <Breadcrumb />
//         <div className="bg-primary-50 p-4 rounded-lg">
//           <h1 className="font-bold text-2xl mb-4">Order Management</h1>
//           <p>{error}</p>
//         </div>
//       </main>
//     );
//   }

//   return (
//     <main className="flex-1 p-4 sm:ml-72 sm:mr-10 my-10 rounded-lg bg-white">
//       <Breadcrumb />
//       <div className="bg-primary-50 p-4 rounded-lg">
//         <h1 className="font-bold text-2xl mb-4">Order Management</h1>
//         <div className="overflow-x-auto">
//           <table className="min-w-full table-auto">
//             <thead>
//               <tr>
//                 <th className="border px-4 py-2">Order ID</th>
//                 <th className="border px-4 py-2">User Name</th>
//                 <th className="border px-4 py-2">Address</th>
//                 <th className="border px-4 py-2">Order Items</th>
//                 <th className="border px-4 py-2">Total Price</th>
//               </tr>
//             </thead>
//             <tbody>
//               {orders.map((order) => (
//                 <tr key={order.id}>
//                   <td className="border px-4 py-2">{order.id}</td>
//                   <td className="border px-4 py-2">{order.userName}</td>
//                   <td className="border px-4 py-2">{order.address}</td>
//                   <td>{order.paymentStatus}</td>
//                   <td>{order.status}</td>
//                   <td className="border px-4 py-2">
//                     <ul>
//                       {order.orderItems.map((item) => (
//                         <li key={item.id}>
//                           {item.productName} - {item.quantity} pcs @{" "}
//                           {formatCurrency(item.price * item.quantity)}
//                         </li>
//                       ))}
//                     </ul>
//                   </td>
//                   <td className="border px-4 py-2">
//                     {formatCurrency(
//                       order.orderItems.reduce(
//                         (total, item) =>
//                           total +
//                           calculateTotalPrice(
//                             item.price.toString(),
//                             item.quantity
//                           ),
//                         0
//                       )
//                     )}
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </main>
//   );
// }
