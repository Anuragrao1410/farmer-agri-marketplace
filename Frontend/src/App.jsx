import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [products, setProducts] = useState([]);
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [farmerOrders, setFarmerOrders] = useState([]);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [farmers, setFarmers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  // Fetch products from backend
  useEffect(() => {
    fetch("http://localhost:5000/api/products")
      .then((response) => response.json())
      .then((data) => {
        setProducts(data);
      })
      .catch((error) => {
        console.log("Error fetching products:", error);
      });
  }, []);
  
  useEffect(() => {
  fetch("http://localhost:5000/api/farmers")
    .then((response) => response.json())
    .then((data) => setFarmers(data))
    .catch((error) => console.log("Error fetching farmers:", error));
}, []);

useEffect(() => {
  fetch("http://localhost:5000/api/farmers")
    .then((response) => response.json())
    .then((data) => setFarmers(data))
    .catch((error) => console.log("Error fetching farmers:", error));
}, []);

 useEffect(() => {
  if (!user || user.role !== "farmer") {
    setFarmerOrders([]);
    return;
  }

  fetch(`http://localhost:5000/api/orders/farmer/${user.id}`)
    .then((response) => response.json())
    .then((data) => {
      if (!Array.isArray(data)) {
        console.log("Farmer orders error:", data);
        setFarmerOrders([]);
        return;
      }

      setFarmerOrders(data);
    })
    .catch((error) => {
      console.log("Error fetching farmer orders:", error);
      setFarmerOrders([]);
    });
}, [user]);
  useEffect(() => {
  if (!user) {
    setOrders([]);
    return;
  }

  fetch(`http://localhost:5000/api/orders/buyer/${user.id}`)
    .then((response) => response.json())
    .then((data) => {
      setOrders(data);
    })
    .catch((error) => {
      console.log("Error fetching orders:", error);
    });
}, [user]);

  // Login function
  const handleLogin = async (event) => {
    event.preventDefault();

    const email = event.target.email.value;
    const password = event.target.password.value;

    try {
      const response = await fetch(
        "http://localhost:5000/api/users/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Login failed");
        return;
      }

      alert("Login successful! Welcome " + data.user.name);

      setUser(data.user);
      setShowLogin(false);
    } catch (error) {
      console.log("Login error:", error);
      alert("Server se connection nahi ho pa raha.");
    }
  };

  // Register function
  const handleRegister = async (event) => {
    event.preventDefault();

    const name = event.target.name.value;
    const email = event.target.email.value;
    const password = event.target.password.value;
    const role = event.target.role.value;
    const phone = event.target.phone.value;
    const address = event.target.address.value;

    try {
      const response = await fetch(
        "http://localhost:5000/api/users/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
         body: JSON.stringify({
         name,
         email,
         password,
         role,
         phone,
         address

          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Registration failed");
        return;
      }

      alert("Registration successful! Please login.");

      setShowRegister(false);
      setShowLogin(true);
    } catch (error) {
      console.log("Register error:", error);
      alert("Server se connection nahi ho pa raha.");
    }
  };
  
// Create order function
const handleAddProduct = async (event) => {
  event.preventDefault();

  const name = event.target.name.value;
  const category = event.target.category.value;
  const price = Number(event.target.price.value);
  const quantity = Number(event.target.quantity.value);
  const unit = event.target.unit.value;
  const description = event.target.description.value;

  try {
    const response = await fetch(
      "http://localhost:5000/api/products",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
body: JSON.stringify({
  name,
  category,
  price,
  quantity,
  unit,
  description,
  farmer: user.farmerId,
}),
      
      }
    );

    const data = await response.json();

    if (!response.ok) {
    `${data.message || "Product add failed"}\n${data.error || ""}`
      return;
    }

    alert("Product added successfully!");

const productsResponse = await fetch(
  "http://localhost:5000/api/products"
);

const productsData = await productsResponse.json();

setProducts(productsData);

setShowAddProduct(false);
  } catch (error) {
    console.log("Add product error:", error);
    alert("Server se connection nahi ho pa raha.");
  }
};
const handleBuyNow = async (product) => {
  if (!user) {
    alert("Please login first.");
    setShowLogin(true);
    return;
  }

  const quantity = prompt(
    `Enter quantity for ${product.name}:`
  );

  if (!quantity || Number(quantity) <= 0) {
    return;
  }

  const totalPrice = Number(quantity) * product.price;

  try {
    const response = await fetch(
      "http://localhost:5000/api/orders",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          buyer: user.id,
          product: product._id,
          quantity: Number(quantity),
          totalPrice: totalPrice,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      alert(data.message || "Order failed");
      return;
    }

    alert(
      `Order placed successfully! Total: ₹${totalPrice}`
    );
    if (user) {
  const ordersResponse = await fetch(
    `http://localhost:5000/api/orders/buyer/${user.id}`
  );

  const ordersData = await ordersResponse.json();

  if (Array.isArray(ordersData)) {
    setOrders(ordersData);
  }
}
  } catch (error) {
    console.log("Order error:", error);
    alert("Server se connection nahi ho pa raha.");
  }
};

const handleEditProduct = async (product) => {
  const name = prompt("Product name:", product.name);
  if (!name) return;

  const price = prompt("Price:", product.price);
  if (!price) return;

  const quantity = prompt("Quantity:", product.quantity);
  if (!quantity) return;

  const description = prompt(
    "Description:",
    product.description || ""
  );

  try {
    const response = await fetch(
      `http://localhost:5000/api/products/${product._id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          price: Number(price),
          quantity: Number(quantity),
          description,
          farmerId: user.farmerId,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      alert(data.message || "Failed to update product");
      return;
    }

    alert("Product updated successfully!");

    setProducts((previousProducts) =>
      previousProducts.map((item) =>
        item._id === product._id
          ? {
              ...item,
              ...data.product,
              farmer: item.farmer,
            }
          : item
      )
    );

  } catch (error) {
    console.log("Edit product error:", error);
    alert("Server se connection nahi ho pa raha.");
  }
};


const handleDeleteProduct = async (productId) => {
  const confirmDelete = window.confirm(
    "Are you sure you want to delete this product?"
  );

  if (!confirmDelete) {
    return;
  }

  try {
    const response = await fetch(
      `http://localhost:5000/api/products/${productId}`,
      {
       method: "DELETE",
headers: {
  "Content-Type": "application/json",
},
body: JSON.stringify({
  farmerId: user.farmerId,
}),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      alert(data.message || "Failed to delete product");
      return;
    }

    alert("Product deleted successfully!");

    setProducts((previousProducts) =>
      previousProducts.filter(
        (product) => product._id !== productId
      )
    );

  } catch (error) {
    console.log("Delete product error:", error);
    alert("Server se connection nahi ho pa raha.");
  }
};

// Update order status
const handleUpdateOrderStatus = async (orderId, status) => {
  try {
    const response = await fetch(
      `http://localhost:5000/api/orders/${orderId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: status,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      alert(data.message || "Failed to update order");
      return;
    }

    alert(`Order status updated to ${status}`);

    setFarmerOrders((previousOrders) =>
      previousOrders.map((order) =>
        order._id === orderId
          ? { ...order, status: status }
          : order
      )
    );

  } catch (error) {
    console.log("Update order error:", error);
    alert("Server se connection nahi ho pa raha.");
  }
};const filteredProducts = products.filter((product) => {
  const matchesName = product.name
    .toLowerCase()
    .includes(searchTerm.toLowerCase());

  const matchesCategory =
    selectedCategory === "" ||
    product.category.toLowerCase() === selectedCategory.toLowerCase();

  return matchesName && matchesCategory;
});
  return (
    <>
      {/* Login Popup */}
      {showLogin && (
        <div className="auth-overlay">
          <div className="auth-box">
            <button
              type="button"
              className="close-btn"
              onClick={() => setShowLogin(false)}
            >
              ×
            </button>

            <h2>Welcome Back</h2>

            <p>
              Login to your AgriMarket account
            </p>

            <form onSubmit={handleLogin}>
              <label>Email</label>

              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                required
              />

              <label>Password</label>

              <input
                type="password"
                name="password"
                placeholder="Enter your password"
                required
              />

              <button
                type="submit"
                className="auth-submit"
              >
                Login
              </button>
            </form>

            <p className="auth-switch">
              Don't have an account?{" "}

              <button
                type="button"
                onClick={() => {
                  setShowLogin(false);
                  setShowRegister(true);
                }}
              >
                Register
              </button>
            </p>
          </div>
        </div>
      )}

      {/* Register Popup */}
      {showRegister && (
        <div className="auth-overlay">
          <div className="auth-box">
            <button
              type="button"
              className="close-btn"
              onClick={() => setShowRegister(false)}
            >
              ×
            </button>

            <h2>Create Account</h2>

            <p>
              Join AgriMarket today
            </p>

            <form onSubmit={handleRegister}>
              <label>Name</label>

              <input
                type="text"
                name="name"
                placeholder="Enter your name"
                required
              />

              <label>Email</label>

              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                required
              />
<label>Phone</label>
<input
  type="tel"
  name="phone"
  placeholder="Enter your phone number"
  required
/>

<label>Address</label>
<input
  type="text"
  name="address"
  placeholder="Enter your address"
  required
/>
              <label>Password</label>

              <input
                type="password"
                name="password"
                placeholder="Create a password"
                required
              />

              <label>Role</label>

              <select
                name="role"
                defaultValue="buyer"
              >
                <option value="buyer">
                  Buyer
                </option>

                <option value="farmer">
                  Farmer
                </option>
              </select>

              <button
                type="submit"
                className="auth-submit"
              >
                Register
              </button>
            </form>

            <p className="auth-switch">
              Already have an account?{" "}

              <button
                type="button"
                onClick={() => {
                  setShowRegister(false);
                  setShowLogin(true);
                }}
              >
                Login
              </button>
            </p>
          </div>
        </div>
      )}

      <div className="app">

        {/* Navbar */}
        <nav className="navbar">

  <div className="logo">
    🌾 Agri<span>Market</span>
  </div>

  <div className="nav-links">
    <a href="#home">Home</a>
    <a href="#products">Products</a>
    <a href="#farmers">Farmers</a>
    <a href="#orders">Orders</a>
  </div>

  <div className="nav-buttons">
    {user ? (
      <>
        <span className="user-name">
          👤 {user.name}
        </span>

        <button
          className="login-btn"
          onClick={() => setUser(null)}
        >
          Logout
        </button>
      </>
    ) : (
      <>
        <button
          className="login-btn"
          onClick={() => {
            setShowLogin(true);
            setShowRegister(false);
          }}
        >
          Login
        </button>

        <button
          className="register-btn"
          onClick={() => {
            setShowRegister(true);
            setShowLogin(false);
          }}
        >
          Register
        </button>
      </>
    )}
  </div>

</nav>

        {/* Hero Section */}
      <section className="hero" id="home">
          <div className="hero-content">
            <p className="tagline">
              🌱 Fresh From The Farm
            </p>

            <h1>
              Fresh Products.
              <br />
              <span>
                Direct From Farmers.
              </span>
            </h1>

            <p className="hero-text">
              Buy fresh and quality agricultural
              products directly from local farmers
              at fair prices.
            </p>

            <div className="hero-buttons">
              <button className="shop-btn">
                Shop Products →
              </button>

              <button className="farmer-btn">
                Become a Farmer
              </button>
            </div>
          </div>

          <div className="hero-card">
            <div className="farmer-icon">
              👨‍🌾
            </div>

            <h3>
              Support Local Farmers
            </h3>

            <p>
              Better prices for farmers,
              fresher products for you.
            </p>
          </div>
        </section>

        {/* Categories */}
        <section className="categories">
          <h2>
            Explore Categories
          </h2>

          <p>
            Find fresh products from trusted farmers
          </p>

          <div className="category-grid">
            <div className="category-card">
              <div>🥕</div>

              <h3>
                Vegetables
              </h3>

              <p>
                Fresh farm vegetables
              </p>
            </div>

            <div className="category-card">
              <div>🍎</div>

              <h3>
                Fruits
              </h3>

              <p>
                Fresh seasonal fruits
              </p>
            </div>

            <div className="category-card">
              <div>🌾</div>

              <h3>
                Grains
              </h3>

              <p>
                Quality farm grains
              </p>
            </div>

            <div className="category-card">
              <div>🥛</div>

              <h3>
                Dairy
              </h3>

              <p>
                Fresh dairy products
              </p>
            </div>
          </div>
        </section>
<section className="farmers" id="farmers">
  <div className="section-heading">
    <div>
      <h2>Our Farmers</h2>
      <p>Meet the farmers bringing fresh products directly to you</p>
    </div>
  </div>

<div className="farmer-grid">
  {farmers.length > 0 ? (
    farmers.map((farmer) => (
      <div className="farmer-card" key={farmer._id}>
        <div className="farmer-icon">👨‍🌾</div>

        <h3>{farmer.name}</h3>

        <p>{farmer.address}</p>

        <span>{farmer.email}</span>
      </div>
    ))
  ) : (
    <p>No farmers available</p>
  )}
</div>
</section>


        {/* Products */}
       <section className="products" id="products">

          <div className="product-filters">
  <input
    type="text"
    placeholder="Search products..."
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
  />

  <select
    value={selectedCategory}
    onChange={(e) => setSelectedCategory(e.target.value)}
  >
    <option value="">All Categories</option>
    <option value="vegetables">Vegetables</option>
    <option value="fruits">Fruits</option>
    <option value="grains">Grains</option>
    <option value="dairy">Dairy</option>
  </select>
</div>

          <div className="section-heading">
            <div>
              <h2>
                Popular Products
              </h2>

              <p>
                Fresh products available from our farmers
              </p>
            </div>

            <button className="view-btn">
              View All →
            </button>
          </div>

        <div className="product-grid">

  {products.length > 0 ? (

    filteredProducts.length > 0 ? (

      filteredProducts.map((product) => (
                <div
                  className="product-card"
                  key={product._id}
                >
                  <div className="product-image">
                    🌱
                  </div>

                  <h3>
                    {product.name}
                  </h3>

                  <p>
                    From{" "}
                    {product.farmer?.name ||
                      "Local Farmer"}
                  </p>

                 <div className="product-bottom">
                 <strong>₹{product.price} / {product.unit}</strong>

                 <button onClick={() => handleBuyNow(product)}>
                  Buy Now
                </button>

           {user && user.role === "farmer" && (
  <>
    <button
      type="button"
      className="edit-product-btn"
      onClick={() => handleEditProduct(product)}
    >
      Edit
    </button>

    <button
      type="button"
      className="delete-product-btn"
      onClick={() => handleDeleteProduct(product._id)}
    >
      Delete
    </button>
  </>
)}
         
         </div>
                </div>
                    ))
    ) : (
      <p>No products found.</p>
    )

  ) : (
    <p>Loading products...</p>
  )}
            
          </div>
        </section>

         {/* Orders */}
        <section className="orders" id="orders">

          <div className="section-heading">
            <div>
              <h2>My Orders</h2>
              <p>Track your recent orders</p>
            </div>
          </div>

          {!user ? (
            <p>Please login to view your orders.</p>
          ) : orders.length === 0 ? (
            <p>No orders found.</p>
          ) : (
            <div className="orders-list">

              {orders.map((order) => (
                <div className="order-card" key={order._id}>

                  <h3>
                    {order.product?.name || "Product"}
                  </h3>

                  <p>
                    Quantity: {order.quantity}{" "}
                    {order.product?.unit || ""}
                  </p>

                  <p>
                    Total Price: ₹{order.totalPrice}
                  </p>

                 <p className="order-status">
                      Status:
                      <span className={`status-badge ${order.status.toLowerCase()}`}>
                           {order.status}
                        </span>
                      </p>
                </div>
              ))}

            </div>
          )}

        </section>

{user && user.role === "farmer" && (
  <section className="add-product-section">

    <div className="section-heading">
      <div>
        <h2>Add Product</h2>
        <p>Sell your fresh farm products</p>
      </div>
    </div>

    <form className="product-form" onSubmit={handleAddProduct}>

      <input
        type="text"
        name="name"
        placeholder="Product name"
        required
      />

      <select name="category" defaultValue="Vegetables" required>
        <option value="Vegetables">Vegetables</option>
        <option value="Fruits">Fruits</option>
        <option value="Grains">Grains</option>
        <option value="Dairy">Dairy</option>
      </select>

      <input
        type="number"
        name="price"
        placeholder="Price"
        min="1"
        required
      />

      <input
        type="number"
        name="quantity"
        placeholder="Quantity"
        min="1"
        required
      />

      <select name="unit" defaultValue="kg" required>
        <option value="kg">kg</option>
        <option value="quintal">Quintal</option>
        <option value="liter">Liter</option>
        <option value="piece">Piece</option>
      </select>

      <textarea
        name="description"
        placeholder="Product description"
        required
      ></textarea>

      <button type="submit">
        Add Product
      </button>

    </form>

  </section>
)}


{/* Farmer Dashboard */}
{user && user.role === "farmer" && (
  <section className="farmer-dashboard" id="farmer-dashboard">

    <div className="section-heading">
      <div>
        <h2>Farmer Dashboard</h2>
        <p>Manage your customer orders</p>
      </div>
    </div>

    {farmerOrders.length === 0 ? (
      <p>No customer orders found.</p>
    ) : (
      <div className="orders-list">

        {farmerOrders.map((order) => (
          <div className="order-card" key={order._id}>

            <h3>
              {order.product?.name || "Product"}
            </h3>

            <p>
              Buyer: {order.buyer?.name || "Customer"}
            </p>

            <p>
              Quantity: {order.quantity}{" "}
              {order.product?.unit || ""}
            </p>

            <p>
              Total Price: ₹{order.totalPrice}
            </p>

            <p className="order-status">
              Status:
              <span
                className={`status-badge ${order.status.toLowerCase()}`}
              >
                {order.status}
              </span>
            </p>

                    {order.status === "Pending" && (
                    <button
                    onClick={() =>
                    handleUpdateOrderStatus(order._id, "Confirmed")
                    }
                 >
                  Confirm Order
                   </button>
                  )}

           {order.status === "Confirmed" && (
           <button
           onClick={() =>
      handleUpdateOrderStatus(order._id, "Delivered")
    }
  >
    Mark as Delivered
  </button>
)}
          </div>
        ))}

      </div>
    )}

  </section>
)}

        {/* Footer */}
        <footer>
          <div className="logo">
            🌾 Agri<span>Market</span>
          </div>

          <p>
            Connecting farmers directly with consumers.
          </p>

          <p className="copyright">
            © 2026 AgriMarket. All rights reserved.
          </p>
        </footer>

      </div>
    </>
  );
}

export default App;