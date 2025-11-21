import React, { useState, useEffect, useCallback } from "react";
import "./ProductPage.css";
import { useNavigate } from "react-router-dom";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";

// Custom hook for debouncing a value
function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debounced;
}

const ProductPage = () => {
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const navigate = useNavigate();

  const API_BASE_URL =
    import.meta.env.VITE_API_URL || "http://44.198.25.29:3000";

  const debouncedQuery = useDebounce(query, 300);

  // Check authentication and load user data
  useEffect(() => {
    const checkAuthAndLoadUserData = () => {
      try {
        const storedUser = localStorage.getItem("user");
        const storedIsLoggedIn = localStorage.getItem("isLoggedIn");

        if (storedUser && storedIsLoggedIn === "true") {
          const parsedUser = JSON.parse(storedUser);
          setCurrentUser(parsedUser);
          setIsAuthenticated(true);
          loadUserSpecificData(parsedUser.email);
        } else {
          navigate("/login");
        }
      } catch (err) {
        console.error("Error checking authentication:", err);
        navigate("/login");
      }
    };

    const loadUserSpecificData = (userEmail) => {
      try {
        const userCart = JSON.parse(localStorage.getItem(`cart_${userEmail}`) || "[]");
        setCart(userCart);
        const userWishlist = JSON.parse(localStorage.getItem(`wishlist_${userEmail}`) || "[]");
        setWishlist(userWishlist);
      } catch (err) {
        console.error("Error loading user data:", err);
      }
    };

    checkAuthAndLoadUserData();
  }, [navigate]);

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`${API_BASE_URL}/products`);

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const text = await res.text();
        let data;
        try {
          data = JSON.parse(text);
        } catch (err) {
          throw new Error("Invalid JSON returned from server.");
        }

        setProducts(data.data || []);
      } catch (err) {
        console.error("Failed to fetch products:", err);
        setError(`Failed to fetch products: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [API_BASE_URL]);

  useEffect(() => {
    if (currentUser?.email) {
      localStorage.setItem(`cart_${currentUser.email}`, JSON.stringify(cart));
      localStorage.setItem(`wishlist_${currentUser.email}`, JSON.stringify(wishlist));
    }
  }, [cart, wishlist, currentUser]);

  const toggleWishlist = useCallback(
    (product) => {
      if (!isAuthenticated) {
        alert("Please login to manage your wishlist");
        return;
      }
      setWishlist((prev) => {
        const exists = prev.findIndex((item) => item._id === product._id);
        if (exists !== -1) return prev.filter((item) => item._id !== product._id);
        return [...prev, { ...product, addedAt: new Date().toISOString() }];
      });
    },
    [isAuthenticated]
  );

  const addToCart = useCallback(
    (product) => {
      if (!isAuthenticated) {
        alert("Please login to add items to cart");
        return;
      }
      setCart((prev) => {
        const index = prev.findIndex((item) => item._id === product._id);
        if (index !== -1) {
          const updated = [...prev];
          updated[index] = {
            ...updated[index],
            quantity: (updated[index].quantity || 1) + 1,
          };
          return updated;
        }
        return [...prev, { ...product, quantity: 1, addedAt: new Date().toISOString() }];
      });
    },
    [isAuthenticated]
  );

  const isInWishlist = (productId) => wishlist.some((item) => item._id === productId);
  const getCartItemCount = () => cart.reduce((total, item) => total + (item.quantity || 1), 0);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("isLoggedIn");
    navigate("/login");
  };

  const filteredProducts = products.filter((p) =>
    p.name?.toLowerCase().includes(debouncedQuery.toLowerCase())
  );

  return (
    <div className="product-page">
      <Navbar />

      {/* Header Section */}
      <div className="product-header">
        <div className="header-content">
          <h1 className="page-title">All Products</h1>
          <div className="header-actions">
            <div className="search-container">
              <input
                type="text"
                placeholder="Search..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="search-input"
              />
            </div>
            <div className="user-actions">
              <button onClick={() => navigate("/Wishlist")} className="icon-btn">
                ♡ <span>{wishlist.length}</span>
              </button>
              <button onClick={() => navigate("/Cart")} className="icon-btn">
                🛒 <span>{getCartItemCount()}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <main className="products-grid">
        {loading && <div className="loading-message">Loading products...</div>}
        {error && (
          <div className="error-message">
            <p>{error}</p>
          </div>
        )}
        {!loading && !error && (
          filteredProducts.length > 0 ? (
            filteredProducts.map((product) => {
              const cartItem = cart.find((item) => item._id === product._id);
              const imageSrc = product.imageUrl || product.imageURL || "https://via.placeholder.com/400";
              const inWishlist = isInWishlist(product._id);

              return (
                <div className="product-item" key={product._id}>
                  <div className="product-image-container">
                    <img
                      src={imageSrc}
                      alt={product.name || "Product"}
                      className="product-image"
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleWishlist(product);
                      }}
                      className={`wishlist-icon ${inWishlist ? "active" : ""}`}
                      aria-label="Add to wishlist"
                    >
                      {inWishlist ? "♥" : "♡"}
                    </button>
                  </div>
                  <div className="product-info">
                    <h3 className="product-name">{product.name || "Unnamed Product"}</h3>
                    <p className="product-price">
                      R {typeof product.price === "number" ? product.price.toLocaleString() : "0.00"}
                    </p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(product);
                      }}
                      className="add-cart-button"
                    >
                      {cartItem ? `In Cart (${cartItem.quantity})` : "Add to Cart"}
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="no-products">No products found.</div>
          )
        )}
      </main>

      <Footer />
    </div>
  );
};

export default ProductPage;