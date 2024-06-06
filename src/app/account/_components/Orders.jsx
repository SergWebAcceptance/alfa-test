"use client";
import React, { useState, useEffect } from "react";
import { getOrdersByUser } from "../../api/orders";
import { useAuth } from "@/src/contexts/AuthContext";
import Link from "next/link";
import { decodeBase64Id } from "@/src/utils/decodeBase64Id";

function Orders() {
  const { currentUser, refreshToken } = useAuth();
  const [orders, setOrders] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [retry, setRetry] = useState(false);

  useEffect(() => {
    if (!currentUser) return;

    const fetchOrders = async (isRetry = false) => {
      setLoading(true);
      setError(null);

      try {
        const userId = decodeBase64Id(currentUser.id);
        const jwt = localStorage.getItem("jwt");
        
        const ordersData = await getOrdersByUser(currentUser.email, jwt);
        setOrders(ordersData);
      } catch (error) {
        console.error("Failed to fetch orders:", error);

        if (!isRetry) {
          // If this is the first attempt and it fails, refresh the token and retry
          await refreshToken();
          fetchOrders(true);
        } else {
          // If this was the retry attempt, set the error
          setError("Failed to load orders.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [currentUser, retry]);

  return (
    <>
      <div>
        <h2 className="text-xl font-bold text-gray-900">Your orders</h2>
        {loading && <p className="mt-4 text-gray-600">Loading orders...</p>}
        {error && <p className="mt-4 text-red-600">{error}</p>}
        {orders && (
          <div className="mt-8">
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Products
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{order.number}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.status}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(order.date_created.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {order.status == "completed" &&
                          order.line_items.map((item) => (
                            <Link
                              href={item.downloads[0].download_url}
                              target="_blank"
                              key={item.id}
                              className="inline-block bg-gray-100 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2"
                            >
                              {item.downloads[0].name}
                            </Link>
                          ))}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-700">
                        ${order.total}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default Orders;
