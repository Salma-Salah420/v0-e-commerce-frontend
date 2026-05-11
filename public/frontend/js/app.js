/* =============================================
   E-Commerce Frontend JavaScript
   Complete API Integration & Functionality
   ============================================= */

// Configuration - Change this to your backend URL
const API_BASE_URL = 'https://your-backend-url.com/api'; // TODO: Replace with your actual backend URL

// =============================================
// Utility Functions
// =============================================

// Get auth token from localStorage
function getToken() {
  return localStorage.getItem('token');
}

// Get user from localStorage
function getUser() {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
}

// Save auth data to localStorage
function saveAuth(token, user) {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
}

// Clear auth data
function clearAuth() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

// Check if user is logged in
function isLoggedIn() {
  return !!getToken();
}

// Check if user is admin
function isAdmin() {
  const user = getUser();
  return user && user.role === 'admin';
}

// API Request Helper
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getToken();

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || data.message || 'An error occurred');
    }

    return data;
  } catch (error) {
    if (error.message === 'Failed to fetch') {
      throw new Error('Unable to connect to server. Please check if the backend is running.');
    }
    throw error;
  }
}

// Format currency
function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

// Format date
function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Get URL parameters
function getUrlParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

// =============================================
// Toast Notifications
// =============================================

function createToastContainer() {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  return container;
}

function showToast(type, title, message) {
  const container = createToastContainer();

  const icons = {
    success: 'fa-check-circle',
    error: 'fa-exclamation-circle',
    warning: 'fa-exclamation-triangle',
    info: 'fa-info-circle',
  };

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <i class="fas ${icons[type]} toast-icon"></i>
    <div class="toast-content">
      <div class="toast-title">${title}</div>
      <div class="toast-message">${message}</div>
    </div>
    <button class="toast-close" onclick="this.parentElement.remove()">
      <i class="fas fa-times"></i>
    </button>
  `;

  container.appendChild(toast);

  // Trigger animation
  setTimeout(() => toast.classList.add('show'), 10);

  // Auto remove after 5 seconds
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 5000);
}

// =============================================
// Loading States
// =============================================

function showLoading() {
  let overlay = document.querySelector('.loading-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'loading-overlay';
    overlay.innerHTML = `
      <div class="loading-container">
        <div class="spinner"></div>
        <div class="loading-text">Loading...</div>
      </div>
    `;
    document.body.appendChild(overlay);
  }
  overlay.style.display = 'flex';
}

function hideLoading() {
  const overlay = document.querySelector('.loading-overlay');
  if (overlay) {
    overlay.style.display = 'none';
  }
}

function setButtonLoading(button, loading) {
  if (loading) {
    button.classList.add('btn-loading');
    button.disabled = true;
  } else {
    button.classList.remove('btn-loading');
    button.disabled = false;
  }
}

// =============================================
// Navbar Functions
// =============================================

function initNavbar() {
  updateNavbar();
  updateCartCount();

  // Mobile menu toggle
  const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
  const navbarNav = document.querySelector('.navbar-nav');

  if (mobileMenuBtn && navbarNav) {
    mobileMenuBtn.addEventListener('click', () => {
      navbarNav.classList.toggle('show');
    });
  }

  // User dropdown
  const userDropdownBtn = document.querySelector('.user-btn');
  const dropdownMenu = document.querySelector('.dropdown-menu');

  if (userDropdownBtn && dropdownMenu) {
    userDropdownBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdownMenu.classList.toggle('show');
    });

    document.addEventListener('click', () => {
      dropdownMenu.classList.remove('show');
    });
  }

  // Search functionality
  const searchInput = document.querySelector('.navbar-search input');
  if (searchInput) {
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        const query = searchInput.value.trim();
        if (query) {
          window.location.href = `index.html?search=${encodeURIComponent(query)}`;
        }
      }
    });
  }
}

function updateNavbar() {
  const navbarNav = document.querySelector('.navbar-nav');
  if (!navbarNav) return;

  const user = getUser();

  if (isLoggedIn() && user) {
    navbarNav.innerHTML = `
      <a href="index.html" class="nav-link">
        <i class="fas fa-home"></i>
        <span>Home</span>
      </a>
      <a href="cart.html" class="nav-link cart-icon">
        <i class="fas fa-shopping-cart"></i>
        <span>Cart</span>
        <span class="cart-count" id="cart-count">0</span>
      </a>
      <a href="orders.html" class="nav-link">
        <i class="fas fa-box"></i>
        <span>Orders</span>
      </a>
      ${isAdmin() ? `
        <a href="admin.html" class="nav-link">
          <i class="fas fa-cog"></i>
          <span>Admin</span>
        </a>
      ` : ''}
      <div class="user-dropdown">
        <button class="user-btn">
          <i class="fas fa-user"></i>
          <span>${user.full_name || user.email}</span>
          <i class="fas fa-chevron-down"></i>
        </button>
        <div class="dropdown-menu">
          <div class="dropdown-item">
            <i class="fas fa-user-circle"></i>
            <span>${user.email}</span>
          </div>
          ${isAdmin() ? `
            <div class="dropdown-item">
              <i class="fas fa-shield-alt"></i>
              <span>Admin</span>
            </div>
          ` : ''}
          <div class="dropdown-item danger" onclick="logout()">
            <i class="fas fa-sign-out-alt"></i>
            <span>Logout</span>
          </div>
        </div>
      </div>
    `;

    // Reinitialize dropdown
    const userDropdownBtn = document.querySelector('.user-btn');
    const dropdownMenu = document.querySelector('.dropdown-menu');

    if (userDropdownBtn && dropdownMenu) {
      userDropdownBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdownMenu.classList.toggle('show');
      });
    }
  } else {
    navbarNav.innerHTML = `
      <a href="index.html" class="nav-link">
        <i class="fas fa-home"></i>
        <span>Home</span>
      </a>
      <a href="login.html" class="nav-link">
        <i class="fas fa-sign-in-alt"></i>
        <span>Login</span>
      </a>
      <a href="register.html" class="nav-link">
        <i class="fas fa-user-plus"></i>
        <span>Register</span>
      </a>
    `;
  }
}

async function updateCartCount() {
  if (!isLoggedIn()) return;

  try {
    const cart = await apiRequest('/cart/');
    const count = cart.items ? cart.items.reduce((sum, item) => sum + item.quantity, 0) : 0;
    const cartCountEl = document.getElementById('cart-count');
    if (cartCountEl) {
      cartCountEl.textContent = count;
      cartCountEl.style.display = count > 0 ? 'flex' : 'none';
    }
  } catch (error) {
    console.error('Error fetching cart count:', error);
  }
}

// =============================================
// Authentication Functions
// =============================================

async function login(email, password) {
  const formData = new URLSearchParams();
  formData.append('username', email);
  formData.append('password', password);

  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || 'Login failed');
  }

  // Get user info
  const userResponse = await fetch(`${API_BASE_URL}/users/me`, {
    headers: {
      'Authorization': `Bearer ${data.access_token}`,
    },
  });

  const user = await userResponse.json();

  saveAuth(data.access_token, user);
  return user;
}

async function register(fullName, email, password) {
  const data = await apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      full_name: fullName,
      email: email,
      password: password,
    }),
  });

  return data;
}

function logout() {
  clearAuth();
  showToast('success', 'Logged Out', 'You have been successfully logged out.');
  setTimeout(() => {
    window.location.href = 'login.html';
  }, 1000);
}

// Protect pages that require authentication
function requireAuth() {
  if (!isLoggedIn()) {
    window.location.href = 'login.html';
    return false;
  }
  return true;
}

// Protect admin pages
function requireAdmin() {
  if (!isLoggedIn()) {
    window.location.href = 'login.html';
    return false;
  }
  if (!isAdmin()) {
    showToast('error', 'Access Denied', 'You do not have permission to access this page.');
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 1000);
    return false;
  }
  return true;
}

// =============================================
// Products Functions
// =============================================

async function fetchProducts(page = 1, limit = 12, categoryId = null, search = null) {
  let endpoint = `/products/?page=${page}&limit=${limit}`;

  if (categoryId) {
    endpoint = `/products/category/${categoryId}?page=${page}&limit=${limit}`;
  } else if (search) {
    endpoint = `/products/search?q=${encodeURIComponent(search)}&page=${page}&limit=${limit}`;
  }

  return await apiRequest(endpoint);
}

async function fetchProduct(id) {
  return await apiRequest(`/products/${id}`);
}

async function fetchCategories() {
  return await apiRequest('/categories/');
}

function renderProductCard(product) {
  const stockStatus = product.stock === 0 ? 'out' : product.stock < 10 ? 'low' : '';
  const stockText = product.stock === 0 ? 'Out of Stock' : `${product.stock} in stock`;

  return `
    <div class="product-card">
      <img src="${product.image_url || 'https://via.placeholder.com/300x200?text=No+Image'}" 
           alt="${product.name}" 
           class="product-image"
           onerror="this.src='https://via.placeholder.com/300x200?text=No+Image'">
      <div class="product-body">
        <span class="product-category">${product.category_name || 'Uncategorized'}</span>
        <h3 class="product-name">${product.name}</h3>
        <p class="product-price">${formatCurrency(product.price)}</p>
        <p class="product-stock ${stockStatus}">${stockText}</p>
        <div class="product-footer">
          <button class="btn btn-primary btn-block" 
                  onclick="addToCart(${product.id})"
                  ${product.stock === 0 ? 'disabled' : ''}>
            <i class="fas fa-cart-plus"></i>
            ${product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  `;
}

function renderPagination(currentPage, totalPages, onPageChange) {
  if (totalPages <= 1) return '';

  let html = '<div class="pagination">';

  // Previous button
  html += `
    <button class="pagination-btn" 
            onclick="${onPageChange}(${currentPage - 1})"
            ${currentPage === 1 ? 'disabled' : ''}>
      <i class="fas fa-chevron-left"></i>
    </button>
  `;

  // Page numbers
  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      (i >= currentPage - 2 && i <= currentPage + 2)
    ) {
      html += `
        <button class="pagination-btn ${i === currentPage ? 'active' : ''}"
                onclick="${onPageChange}(${i})">
          ${i}
        </button>
      `;
    } else if (i === currentPage - 3 || i === currentPage + 3) {
      html += '<span class="pagination-btn">...</span>';
    }
  }

  // Next button
  html += `
    <button class="pagination-btn" 
            onclick="${onPageChange}(${currentPage + 1})"
            ${currentPage === totalPages ? 'disabled' : ''}>
      <i class="fas fa-chevron-right"></i>
    </button>
  `;

  html += '</div>';
  return html;
}

// =============================================
// Cart Functions
// =============================================

async function fetchCart() {
  return await apiRequest('/cart/');
}

async function addToCart(productId, quantity = 1) {
  if (!isLoggedIn()) {
    showToast('warning', 'Login Required', 'Please login to add items to your cart.');
    setTimeout(() => {
      window.location.href = 'login.html';
    }, 1500);
    return;
  }

  try {
    await apiRequest('/cart/items', {
      method: 'POST',
      body: JSON.stringify({
        product_id: productId,
        quantity: quantity,
      }),
    });

    showToast('success', 'Added to Cart', 'Item has been added to your cart.');
    updateCartCount();
  } catch (error) {
    showToast('error', 'Error', error.message);
  }
}

async function updateCartItem(itemId, quantity) {
  try {
    await apiRequest(`/cart/items/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    });

    showToast('success', 'Cart Updated', 'Item quantity has been updated.');
    updateCartCount();
    return true;
  } catch (error) {
    showToast('error', 'Error', error.message);
    return false;
  }
}

async function removeCartItem(itemId) {
  if (!confirm('Are you sure you want to remove this item from your cart?')) {
    return false;
  }

  try {
    await apiRequest(`/cart/items/${itemId}`, {
      method: 'DELETE',
    });

    showToast('success', 'Item Removed', 'Item has been removed from your cart.');
    updateCartCount();
    return true;
  } catch (error) {
    showToast('error', 'Error', error.message);
    return false;
  }
}

async function clearCart() {
  if (!confirm('Are you sure you want to clear your entire cart?')) {
    return false;
  }

  try {
    await apiRequest('/cart/clear', {
      method: 'DELETE',
    });

    showToast('success', 'Cart Cleared', 'Your cart has been cleared.');
    updateCartCount();
    return true;
  } catch (error) {
    showToast('error', 'Error', error.message);
    return false;
  }
}

// =============================================
// Order Functions
// =============================================

async function createOrder() {
  try {
    const order = await apiRequest('/orders/', {
      method: 'POST',
    });

    showToast('success', 'Order Placed', 'Your order has been placed successfully!');
    updateCartCount();
    return order;
  } catch (error) {
    showToast('error', 'Error', error.message);
    return null;
  }
}

async function fetchOrders() {
  return await apiRequest('/orders/');
}

async function fetchOrder(id) {
  return await apiRequest(`/orders/${id}`);
}

async function trackOrder(id) {
  return await apiRequest(`/orders/${id}/track`);
}

function getStatusClass(status) {
  const statusMap = {
    pending: 'pending',
    processing: 'processing',
    shipped: 'shipped',
    delivered: 'delivered',
    cancelled: 'cancelled',
  };
  return statusMap[status.toLowerCase()] || 'pending';
}

// =============================================
// Admin Functions
// =============================================

// Products Management
async function createProduct(productData) {
  return await apiRequest('/products/', {
    method: 'POST',
    body: JSON.stringify(productData),
  });
}

async function updateProduct(id, productData) {
  return await apiRequest(`/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(productData),
  });
}

async function deleteProduct(id) {
  if (!confirm('Are you sure you want to delete this product?')) {
    return false;
  }

  try {
    await apiRequest(`/products/${id}`, {
      method: 'DELETE',
    });

    showToast('success', 'Product Deleted', 'Product has been deleted successfully.');
    return true;
  } catch (error) {
    showToast('error', 'Error', error.message);
    return false;
  }
}

// Categories Management
async function createCategory(categoryData) {
  return await apiRequest('/categories/', {
    method: 'POST',
    body: JSON.stringify(categoryData),
  });
}

async function updateCategory(id, categoryData) {
  return await apiRequest(`/categories/${id}`, {
    method: 'PUT',
    body: JSON.stringify(categoryData),
  });
}

async function deleteCategory(id) {
  if (!confirm('Are you sure you want to delete this category? This may affect associated products.')) {
    return false;
  }

  try {
    await apiRequest(`/categories/${id}`, {
      method: 'DELETE',
    });

    showToast('success', 'Category Deleted', 'Category has been deleted successfully.');
    return true;
  } catch (error) {
    showToast('error', 'Error', error.message);
    return false;
  }
}

// Admin Orders Management
async function fetchAllOrders() {
  return await apiRequest('/admin/orders/');
}

async function updateOrderStatus(orderId, status) {
  try {
    await apiRequest(`/admin/orders/${orderId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });

    showToast('success', 'Status Updated', 'Order status has been updated.');
    return true;
  } catch (error) {
    showToast('error', 'Error', error.message);
    return false;
  }
}

// =============================================
// Modal Functions
// =============================================

function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('show');
    document.body.style.overflow = '';
  }
}

// Close modal when clicking outside
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal-overlay')) {
    e.target.classList.remove('show');
    document.body.style.overflow = '';
  }
});

// Close modal on escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    const openModals = document.querySelectorAll('.modal-overlay.show');
    openModals.forEach((modal) => {
      modal.classList.remove('show');
    });
    document.body.style.overflow = '';
  }
});

// =============================================
// Initialize on Page Load
// =============================================

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
});
