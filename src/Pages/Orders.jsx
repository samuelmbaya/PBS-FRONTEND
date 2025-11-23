import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import "./Orders.css";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
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

  useEffect(() => {
    if (currentUser) {
      // Load cart and wishlist counts from localStorage
      try {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        setCartCount(cart.length || 0);
        
        const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
        setWishlistCount(wishlist.length || 0);
      } catch (err) {
        console.error("Error loading cart/wishlist from localStorage:", err);
        setCartCount(0);
        setWishlistCount(0);
      }
    }
  }, [currentUser]);

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

  const updateCart = (newCount) => {
    setCartCount(newCount);
  };

  const updateWishlist = (newCount) => {
    setWishlistCount(newCount);
  };

  if (loading) {
    return (
      <>
        <Navbar 
          cartCount={cartCount} 
          wishlistCount={wishlistCount}
          onCartUpdate={updateCart}
          onWishlistUpdate={updateWishlist}
        />
        <div className="orders-page-container">
          <div className="orders-hero">
            <div className="orders-hero-content">
              <h1 className="orders-hero-title">Your Orders</h1>
              <p className="orders-hero-subtitle">Loading your order history...</p>
            </div>
          </div>
          <div className="orders-content">
            <p style={{ textAlign: 'center', padding: '40px' }}>Loading orders...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar 
        cartCount={cartCount} 
        wishlistCount={wishlistCount}
        onCartUpdate={updateCart}
        onWishlistUpdate={updateWishlist}
      />
      <div className="orders-page-container">
        <div className="orders-hero">
          <div className="orders-hero-content">
            <h1 className="orders-hero-title">Your Orders</h1>
            <p className="orders-hero-subtitle">Track and manage your recent purchases</p>
          </div>
        </div>

        <div className="orders-content">
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {orders.length === 0 ? (
            <div className="empty-orders">
              <div className="empty-orders-icon">📦</div>
              <h2>No orders yet</h2>
              <p>Start shopping to see your order history here.</p>
              <button
                onClick={() => navigate("/ProductPage")}
                className="shop-now-btn"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            <div className="orders-items-section">
              {orders.map((order) => (
                <div className="order-card" key={order.id}>
                  <div className="order-header">
                    <div className="order-info">
                      <p><strong>Order ID:</strong> {order.id}</p>
                      <p><strong>Date:</strong> {order.date}</p>
                      <p><strong>Status:</strong>
                        <span className={`status-${order.status}`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="order-items">
                    {order.items && order.items.length > 0 ? (
                      order.items.map((item, index) => (
                        <div className="order-item" key={item._id || index}>
                          <div className="order-item-image-container">
                            <img
                              src={
                                item.imageUrl ||
                                item.imageURL ||
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
                          </div>
                          <div className="order-item-details">
                            <h3 className="order-item-name">{item.name || "Unknown Product"}</h3>
                            <p className="order-item-price">
                              Qty: {item.quantity || 1} | R {((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p>No items found for this order</p>
                    )}
                  </div>

                  <div className="order-footer">
                    <div className="order-footer-left">
                      <p><strong>Payment:</strong> {order.paymentMethod}</p>
                      {order.deliveryData && order.deliveryData.name && (
                        <p><strong>Delivery to:</strong> {order.deliveryData.name} {order.deliveryData.lastName}</p>
                      )}
                    </div>
                    <p className="order-total"><strong>Total:</strong> R {(order.total || 0).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={() => navigate("/ProductPage")}
            className="continue-shopping-btn"
            style={{ marginTop: '40px' }}
          >
            Continue Shopping
          </button>
        </div>
      </div>
      <Footer />
    </>
  );
};

// doen
export default Orders;