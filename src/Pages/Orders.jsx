import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Orders.css";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [darkMode, setDarkMode] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const apiUrl = "http://44.198.25.29:3000";

  useEffect(() => {
    const loadUserAndOrders = async () => {
      try {
        const storedUser = localStorage.getItem("user");
        const storedIsLoggedIn = localStorage.getItem("isLoggedIn");

        if (!storedUser || storedIsLoggedIn !== "true") {
          alert("Please log in to view your orders.");
          navigate("/");
          return;
        }

        const parsedUser = JSON.parse(storedUser);
        setCurrentUser(parsedUser);

        // Load theme preference
        const userDarkMode = localStorage.getItem(`darkMode_${parsedUser.email}`);
        if (userDarkMode !== null) {
          setDarkMode(JSON.parse(userDarkMode));
        }

        // Fetch orders from backend for this specific user
        await fetchOrdersFromBackend(parsedUser.id || parsedUser._id);
      } catch (err) {
        console.error("Error loading user data:", err);
        setError("Error loading user data. Please login again.");
        navigate("/");
      }
    };

    loadUserAndOrders();
  }, [navigate]);

  const fetchOrdersFromBackend = async (userId) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${apiUrl}/orders?userId=${userId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        if (response.status === 404 || response.status >= 500) {
          console.warn("Backend unavailable, falling back to localStorage");
          loadOrdersFromLocalStorage();
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.data && Array.isArray(result.data)) {
        const transformedOrders = result.data.map((order) => ({
          id: order._id,
          date: new Date(order.createdAt).toLocaleDateString(),
          status: order.status || "pending",
          items: order.items || [],
          total: order.totalAmount || 0,
          paymentMethod: order.paymentMethod || "Not specified",
          deliveryData: order.deliveryData || {},
        }));
        setOrders(transformedOrders);
        
        // Sync to localStorage for offline access
        if (currentUser) {
          localStorage.setItem(
            `orders_${currentUser.email}`,
            JSON.stringify(transformedOrders)
          );
        }
      } else {
        setOrders([]);
      }
    } catch (error) {
      console.error("Error fetching orders from backend:", error);
      console.warn("Backend failed, falling back to localStorage");
      loadOrdersFromLocalStorage();
      setError("Could not load orders from server. Showing cached orders.");
    } finally {
      setLoading(false);
    }
  };

  const loadOrdersFromLocalStorage = () => {
    try {
      if (!currentUser) return;
      const userOrders = JSON.parse(
        localStorage.getItem(`orders_${currentUser.email}`) || "[]"
      );
      setOrders(userOrders);
      setLoading(false);
    } catch (err) {
      console.error("Error loading orders from localStorage:", err);
      setOrders([]);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`orders-page ${darkMode ? "dark" : "light"}`}>
        <div className="orders-header">
          <h1>Your Orders</h1>
        </div>
        <p>Loading orders...</p>
      </div>
    );
  }

  return (
    <div className={`orders-page ${darkMode ? "dark" : "light"}`}>
      <div className="orders-header">
        <h1>Your Orders</h1>
        <button
          onClick={() => navigate("/ProductPage")}
          className="continue-shopping-btn"
        >
          Continue Shopping
        </button>
      </div>

      {error && (
        <div
          className="error-message"
          style={{
            background: "#f8d7da",
            color: "#721c24",
            padding: "10px",
            marginBottom: "20px",
            borderRadius: "5px",
          }}
        >
          {error}
        </div>
      )}

      {orders.length === 0 ? (
        <div className="no-orders">
          <p>You have no orders yet.</p>
          <button
            onClick={() => navigate("/ProductPage")}
            className="start-shopping-btn"
          >
            Start Shopping
          </button>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <div className="order-card" key={order.id}>
              <div className="order-info">
                <p>
                  <strong>Order ID:</strong> {order.id}
                </p>
                <p>
                  <strong>Date:</strong> {order.date}
                </p>
                <p>
                  <strong>Status:</strong>
                  <span className={`status-${order.status}`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </p>
              </div>

              <div className="order-items">
                {order.items && order.items.length > 0 ? (
                  order.items.map((item, index) => (
                    <div className="order-item" key={item._id || index}>
                      <img
                        src={
                          item.imageUrl || 
                          item.imgUrl || 
                          item.image || 
                          item.img ||
                          "https://via.placeholder.com/80"
                        }
                        alt={item.name || "Product"}
                        className="order-item-img"
                        onError={(e) => {
                          e.target.src = "https://via.placeholder.com/80";
                        }}
                      />
                      <div className="order-item-info">
                        <h3>{item.name || "Unknown Product"}</h3>
                        <p>
                          Qty: {item.quantity || 1} | R{" "}
                          {((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p>No items found for this order</p>
                )}
              </div>

              <div className="order-footer">
                <p>
                  <strong>Payment:</strong> {order.paymentMethod}
                </p>
                <p>
                  <strong>Total:</strong> R {(order.total || 0).toFixed(2)}
                </p>
                {order.deliveryData && order.deliveryData.name && (
                  <p>
                    <strong>Delivery to:</strong> {order.deliveryData.name}{" "}
                    {order.deliveryData.lastName}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;