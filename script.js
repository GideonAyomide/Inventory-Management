/**
 * ==============================================================================
 * StockFlow - Simple Inventory Management System
 * Plain Vanilla JavaScript (No Frameworks or Libraries)
 * ==============================================================================
 * 
 * Features:
 * 1. Dashboard: Summary statistics, low-stock warnings, recent sales
 * 2. Products: Add, edit, delete, search, filter by category & stock status
 * 3. Stock Control: Instant quantity adjustment (+ / -) & custom input
 * 4. Sales: Record sales, auto-decrement stock, view sales history
 * 5. LocalStorage: Automatically stores and preserves all changes
 */

// ==============================================================================
// 1. CONSTANTS & DEFAULT SAMPLE DATA
// ==============================================================================
const STORAGE_KEYS = {
  PRODUCTS: 'stockflow_products_v1',
  SALES: 'stockflow_sales_v1'
};

// Initial demo products for first-time visitors
const DEFAULT_PRODUCTS = [
  {
    id: 'prod_1',
    name: 'Wireless Ergonomic Mouse',
    category: 'Electronics',
    price: 29.99,
    quantity: 22,
    threshold: 8,
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString()
  },
  {
    id: 'prod_2',
    name: 'Mechanical RGB Keyboard',
    category: 'Electronics',
    price: 89.50,
    quantity: 4,
    threshold: 6,
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString()
  },
  {
    id: 'prod_3',
    name: 'USB-C 7-in-1 Hub',
    category: 'Accessories',
    price: 42.00,
    quantity: 2,
    threshold: 5,
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString()
  },
  {
    id: 'prod_4',
    name: 'Large Desk Mat (Black)',
    category: 'Accessories',
    price: 18.00,
    quantity: 0,
    threshold: 5,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    id: 'prod_5',
    name: 'Gel Ink Pens (12-Pack)',
    category: 'Office Supplies',
    price: 9.99,
    quantity: 45,
    threshold: 15,
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString()
  },
  {
    id: 'prod_6',
    name: 'Adjustable Laptop Stand',
    category: 'Furniture',
    price: 34.50,
    quantity: 12,
    threshold: 5,
    createdAt: new Date().toISOString()
  }
];

// Initial demo sales transactions
const DEFAULT_SALES = [
  {
    id: 'sale_101',
    productId: 'prod_1',
    productName: 'Wireless Ergonomic Mouse',
    quantity: 2,
    unitPrice: 29.99,
    totalAmount: 59.98,
    date: new Date(Date.now() - 3600000 * 4).toISOString()
  },
  {
    id: 'sale_102',
    productId: 'prod_2',
    productName: 'Mechanical RGB Keyboard',
    quantity: 1,
    unitPrice: 89.50,
    totalAmount: 89.50,
    date: new Date(Date.now() - 3600000 * 2).toISOString()
  },
  {
    id: 'sale_103',
    productId: 'prod_5',
    productName: 'Gel Ink Pens (12-Pack)',
    quantity: 3,
    unitPrice: 9.99,
    totalAmount: 29.97,
    date: new Date(Date.now() - 1800000).toISOString()
  }
];

// ==============================================================================
// 2. STATE & LOCALSTORAGE HELPERS
// ==============================================================================

/**
 * Load products from localStorage, or populate with defaults if empty
 */
function getProducts() {
  const data = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
  if (!data) {
    saveProducts(DEFAULT_PRODUCTS);
    return DEFAULT_PRODUCTS;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    console.error('Error parsing products from localStorage', e);
    return [];
  }
}

/**
 * Save products array to localStorage
 */
function saveProducts(products) {
  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
}

/**
 * Load sales history from localStorage, or populate with defaults if empty
 */
function getSales() {
  const data = localStorage.getItem(STORAGE_KEYS.SALES);
  if (!data) {
    saveSales(DEFAULT_SALES);
    return DEFAULT_SALES;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    console.error('Error parsing sales from localStorage', e);
    return [];
  }
}

/**
 * Save sales array to localStorage
 */
function saveSales(sales) {
  localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(sales));
}

/**
 * Reset all data to initial sample values
 */
function resetDemoData() {
  if (confirm('Are you sure you want to restore the default demo data? Your custom items will be replaced.')) {
    saveProducts(DEFAULT_PRODUCTS);
    saveSales(DEFAULT_SALES);
    renderAllViews();
    showToast('Demo data restored successfully!', 'info');
  }
}

// ==============================================================================
// 3. UTILITY FUNCTIONS
// ==============================================================================

/**
 * Format a number as currency string e.g. $29.99
 */
function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
}

/**
 * Format ISO date string into readable human format
 */
function formatDateTime(isoString) {
  if (!isoString) return '-';
  const date = new Date(isoString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Determine stock status: IN_STOCK, LOW_STOCK, OUT_OF_STOCK
 */
function getStockStatus(quantity, threshold) {
  if (quantity <= 0) {
    return {
      code: 'OUT_OF_STOCK',
      label: 'Out of Stock',
      badgeClass: 'badge-danger'
    };
  }
  if (quantity <= threshold) {
    return {
      code: 'LOW_STOCK',
      label: 'Low Stock',
      badgeClass: 'badge-warning'
    };
  }
  return {
    code: 'IN_STOCK',
    label: 'In Stock',
    badgeClass: 'badge-success'
  };
}

/**
 * Generate a unique ID string
 */
function generateId(prefix = 'id') {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
}

/**
 * Show a floating Toast Notification
 */
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  let iconSvg = '';
  if (type === 'success') {
    iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>';
  } else if (type === 'error') {
    iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>';
  } else if (type === 'warning') {
    iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>';
  } else {
    iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>';
  }

  toast.innerHTML = `${iconSvg} <span>${message}</span>`;
  container.appendChild(toast);

  // Auto remove after 3.5 seconds
  setTimeout(() => {
    toast.classList.add('hide');
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// ==============================================================================
// 4. NAVIGATION & TAB SWITCHING
// ==============================================================================
let activeTab = 'dashboard';

function navigateToTab(tabId) {
  activeTab = tabId;

  // Update tab buttons
  document.querySelectorAll('.nav-item').forEach(btn => {
    if (btn.dataset.tab === tabId) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // Update tab views
  document.querySelectorAll('.tab-view').forEach(view => {
    view.classList.remove('active');
  });

  const targetView = document.getElementById(`view-${tabId}`);
  if (targetView) {
    targetView.classList.add('active');
  }

  // Update page header texts
  const pageTitle = document.getElementById('page-title');
  const pageSubtitle = document.getElementById('page-subtitle');
  const headerActionBtn = document.getElementById('btn-header-action');

  switch (tabId) {
    case 'dashboard':
      pageTitle.textContent = 'Dashboard Overview';
      pageSubtitle.textContent = 'Monitor key metrics, inventory status, and sales';
      headerActionBtn.style.display = 'inline-flex';
      headerActionBtn.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        <span>Add Product</span>
      `;
      headerActionBtn.onclick = () => openProductModal();
      break;

    case 'products':
      pageTitle.textContent = 'Product Catalog';
      pageSubtitle.textContent = 'Manage inventory items, pricing, and reorder thresholds';
      headerActionBtn.style.display = 'inline-flex';
      headerActionBtn.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        <span>Add Product</span>
      `;
      headerActionBtn.onclick = () => openProductModal();
      break;

    case 'stock':
      pageTitle.textContent = 'Stock Control';
      pageSubtitle.textContent = 'Quickly increase or decrease stock levels and replenish inventory';
      headerActionBtn.style.display = 'none';
      break;

    case 'sales':
      pageTitle.textContent = 'Sales & Orders';
      pageSubtitle.textContent = 'Record customer sales and review transaction history';
      headerActionBtn.style.display = 'none';
      break;
  }

  // Re-render view specific items
  renderCurrentView();

  // Close mobile sidebar if open
  const sidebar = document.querySelector('.sidebar');
  if (sidebar && sidebar.classList.contains('open')) {
    sidebar.classList.remove('open');
  }
}

// ==============================================================================
// 5. RENDERING LOGIC
// ==============================================================================

/**
 * Main function to update all views
 */
function renderAllViews() {
  renderDashboard();
  renderProductsTable();
  renderStockTable();
  renderSalesView();
}

/**
 * Render only the active view
 */
function renderCurrentView() {
  switch (activeTab) {
    case 'dashboard':
      renderDashboard();
      break;
    case 'products':
      renderProductsTable();
      break;
    case 'stock':
      renderStockTable();
      break;
    case 'sales':
      renderSalesView();
      break;
  }
}

// --- 5.1 Dashboard View ---
function renderDashboard() {
  const products = getProducts();
  const sales = getSales();

  // Calculate Metrics
  const totalProducts = products.length;
  const totalStock = products.reduce((sum, p) => sum + (Number(p.quantity) || 0), 0);
  const totalRevenue = sales.reduce((sum, s) => sum + (Number(s.totalAmount) || 0), 0);
  
  // Find Low Stock Products (quantity <= threshold)
  const lowStockProducts = products.filter(p => p.quantity <= p.threshold);

  // Update Stat Cards
  document.getElementById('dash-total-products').textContent = totalProducts;
  document.getElementById('dash-total-stock').textContent = totalStock;
  document.getElementById('dash-total-sales').textContent = formatCurrency(totalRevenue);
  document.getElementById('dash-sales-count').textContent = `${sales.length} transaction${sales.length === 1 ? '' : 's'}`;
  
  const lowStockCountElem = document.getElementById('dash-low-stock');
  const lowStockStatusElem = document.getElementById('dash-low-stock-status');
  lowStockCountElem.textContent = lowStockProducts.length;

  if (lowStockProducts.length === 0) {
    lowStockStatusElem.textContent = 'All products well-stocked';
    lowStockStatusElem.className = 'stat-meta text-success font-medium';
  } else {
    lowStockStatusElem.textContent = `${lowStockProducts.length} item${lowStockProducts.length > 1 ? 's' : ''} need restock`;
    lowStockStatusElem.className = 'stat-meta text-danger font-medium';
  }

  // Render Low Stock Warning List
  const lowStockListContainer = document.getElementById('dash-low-stock-list');
  if (lowStockProducts.length === 0) {
    lowStockListContainer.innerHTML = `
      <div class="empty-state">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
        <h4>Healthy Inventory</h4>
        <p>No products are currently at or below their low-stock threshold.</p>
      </div>
    `;
  } else {
    lowStockListContainer.innerHTML = lowStockProducts.map(p => {
      const isOutOfStock = p.quantity === 0;
      const status = getStockStatus(p.quantity, p.threshold);
      return `
        <div class="alert-item-card ${isOutOfStock ? 'out-of-stock' : ''}">
          <div class="alert-item-info">
            <strong>${escapeHtml(p.name)}</strong>
            <span>Category: ${escapeHtml(p.category)} &bull; Stock: <strong>${p.quantity}</strong> (Threshold: ${p.threshold})</span>
          </div>
          <div class="action-buttons">
            <span class="badge ${status.badgeClass}">
              <span class="badge-dot"></span>
              ${status.label}
            </span>
            <button class="btn btn-sm btn-primary" onclick="quickRestockPrompt('${p.id}')">
              + Restock
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  // Render Recent Sales Table
  const recentSalesBody = document.getElementById('dash-recent-sales-body');
  const recentSales = [...sales].reverse().slice(0, 5); // Show latest 5

  if (recentSales.length === 0) {
    recentSalesBody.innerHTML = `
      <tr>
        <td colspan="4" class="text-center text-muted" style="padding: 30px;">
          No sales recorded yet. Use the Sales tab to log your first order.
        </td>
      </tr>
    `;
  } else {
    recentSalesBody.innerHTML = recentSales.map(s => `
      <tr>
        <td><strong>${escapeHtml(s.productName)}</strong></td>
        <td><span class="badge badge-success">${s.quantity}</span></td>
        <td><strong>${formatCurrency(s.totalAmount)}</strong></td>
        <td class="text-muted text-sm">${formatDateTime(s.date)}</td>
      </tr>
    `).join('');
  }
}

// --- 5.2 Products Management View ---
function renderProductsTable() {
  const products = getProducts();
  const searchInput = document.getElementById('product-search-input');
  const categoryFilter = document.getElementById('product-category-filter');
  const statusFilter = document.getElementById('product-status-filter');

  const searchQuery = searchInput ? searchInput.value.trim().toLowerCase() : '';
  const selectedCategory = categoryFilter ? categoryFilter.value : 'ALL';
  const selectedStatus = statusFilter ? statusFilter.value : 'ALL';

  // Update Category Dropdown Filter dynamically
  updateCategoryDropdown(products, selectedCategory);

  // Filter Products
  const filteredProducts = products.filter(p => {
    // Search query check
    const matchesSearch = !searchQuery || 
      p.name.toLowerCase().includes(searchQuery) || 
      p.category.toLowerCase().includes(searchQuery);

    // Category check
    const matchesCategory = selectedCategory === 'ALL' || p.category === selectedCategory;

    // Stock Status check
    const status = getStockStatus(p.quantity, p.threshold);
    const matchesStatus = selectedStatus === 'ALL' || status.code === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const tbody = document.getElementById('products-table-body');
  if (!tbody) return;

  if (filteredProducts.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7">
          <div class="empty-state">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <h4>No products found</h4>
            <p>Try adjusting your search query or filters, or add a new product.</p>
          </div>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = filteredProducts.map(p => {
    const status = getStockStatus(p.quantity, p.threshold);
    return `
      <tr>
        <td>
          <strong>${escapeHtml(p.name)}</strong>
        </td>
        <td>
          <span class="badge" style="background-color: #f1f5f9; color: #334155;">${escapeHtml(p.category)}</span>
        </td>
        <td>${formatCurrency(p.price)}</td>
        <td>
          <span style="font-weight: 600; font-size: 1rem;">${p.quantity}</span>
        </td>
        <td class="text-muted">${p.threshold}</td>
        <td>
          <span class="badge ${status.badgeClass}">
            <span class="badge-dot"></span>
            ${status.label}
          </span>
        </td>
        <td class="text-right">
          <div class="action-buttons">
            <button class="btn btn-sm btn-outline" onclick="openProductModal('${p.id}')" title="Edit Product">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
              <span>Edit</span>
            </button>
            <button class="btn btn-sm btn-danger" onclick="openDeleteModal('${p.id}')" title="Delete Product">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
              <span>Delete</span>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

/**
 * Populate dynamic category options in filters and datalists
 */
function updateCategoryDropdown(products, currentSelected) {
  const categoryFilter = document.getElementById('product-category-filter');
  const categoryDatalist = document.getElementById('category-datalist');
  if (!categoryFilter) return;

  const categories = [...new Set(products.map(p => p.category).filter(Boolean))].sort();

  // Save selection
  let html = `<option value="ALL">All Categories</option>`;
  categories.forEach(cat => {
    const isSelected = cat === currentSelected ? 'selected' : '';
    html += `<option value="${escapeHtml(cat)}" ${isSelected}>${escapeHtml(cat)}</option>`;
  });
  categoryFilter.innerHTML = html;

  if (categoryDatalist) {
    categoryDatalist.innerHTML = categories.map(cat => `<option value="${escapeHtml(cat)}">`).join('');
  }
}

// --- 5.3 Stock Control View ---
function renderStockTable() {
  const products = getProducts();
  const searchInput = document.getElementById('stock-search-input');
  const searchQuery = searchInput ? searchInput.value.trim().toLowerCase() : '';

  const filteredProducts = products.filter(p => 
    !searchQuery || 
    p.name.toLowerCase().includes(searchQuery) || 
    p.category.toLowerCase().includes(searchQuery)
  );

  const tbody = document.getElementById('stock-table-body');
  if (!tbody) return;

  if (filteredProducts.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="text-center text-muted" style="padding: 30px;">
          No matching products found.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = filteredProducts.map(p => {
    const status = getStockStatus(p.quantity, p.threshold);
    return `
      <tr>
        <td><strong>${escapeHtml(p.name)}</strong></td>
        <td><span class="badge" style="background-color: #f1f5f9; color: #334155;">${escapeHtml(p.category)}</span></td>
        <td>
          <span style="font-size: 1.1rem; font-weight: 700; color: ${p.quantity <= p.threshold ? 'var(--danger)' : 'var(--text-main)'}">
            ${p.quantity} units
          </span>
        </td>
        <td class="text-muted">${p.threshold}</td>
        <td>
          <span class="badge ${status.badgeClass}">
            <span class="badge-dot"></span>
            ${status.label}
          </span>
        </td>
        <td class="text-center">
          <div class="quick-adjust-group">
            <button class="btn-adjust" onclick="adjustStock('${p.id}', -5)" title="Decrease by 5">-5</button>
            <button class="btn-adjust" onclick="adjustStock('${p.id}', -1)" title="Decrease by 1">-1</button>
            <button class="btn-adjust" onclick="adjustStock('${p.id}', 1)" title="Increase by 1">+1</button>
            <button class="btn-adjust" onclick="adjustStock('${p.id}', 5)" title="Increase by 5">+5</button>
          </div>
        </td>
        <td class="text-right">
          <form class="custom-adjust-form" onsubmit="handleCustomStockSubmit(event, '${p.id}')">
            <input type="number" class="custom-adjust-input" id="custom-stock-${p.id}" value="${p.quantity}" min="0" required>
            <button type="submit" class="btn btn-sm btn-primary">Set</button>
          </form>
        </td>
      </tr>
    `;
  }).join('');
}

// --- 5.4 Sales View ---
function renderSalesView() {
  const products = getProducts();
  const sales = getSales();

  // Populate Product Select dropdown
  const productSelect = document.getElementById('sale-product-select');
  const selectedProductId = productSelect ? productSelect.value : '';

  if (productSelect) {
    let optionsHtml = '<option value="">-- Choose a Product --</option>';
    products.forEach(p => {
      const isSelected = p.id === selectedProductId ? 'selected' : '';
      const stockInfo = p.quantity > 0 ? `(${p.quantity} in stock - ${formatCurrency(p.price)})` : `(OUT OF STOCK - ${formatCurrency(p.price)})`;
      const disabled = p.quantity <= 0 ? 'disabled' : '';
      optionsHtml += `<option value="${p.id}" ${isSelected} ${disabled}>${escapeHtml(p.name)} ${stockInfo}</option>`;
    });
    productSelect.innerHTML = optionsHtml;
  }

  // Update sale preview calculations
  updateSaleCalculations();

  // Render Sales History Table
  const salesHistoryBody = document.getElementById('sales-history-body');
  if (salesHistoryBody) {
    if (sales.length === 0) {
      salesHistoryBody.innerHTML = `
        <tr>
          <td colspan="5">
            <div class="empty-state">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
              <h4>No sales history</h4>
              <p>Completed transactions will appear here.</p>
            </div>
          </td>
        </tr>
      `;
    } else {
      salesHistoryBody.innerHTML = [...sales].reverse().map(s => `
        <tr>
          <td><span class="text-muted text-sm">${formatDateTime(s.date)}</span></td>
          <td><strong>${escapeHtml(s.productName)}</strong></td>
          <td><span class="badge badge-success">${s.quantity}</span></td>
          <td>${formatCurrency(s.unitPrice)}</td>
          <td><strong>${formatCurrency(s.totalAmount)}</strong></td>
        </tr>
      `).join('');
    }
  }
}

/**
 * Live updates product preview and total sale amount
 */
function updateSaleCalculations() {
  const productSelect = document.getElementById('sale-product-select');
  const qtyInput = document.getElementById('sale-quantity-input');
  const previewStock = document.getElementById('preview-stock');
  const previewPrice = document.getElementById('preview-price');
  const totalAmountElem = document.getElementById('sale-total-amount');
  const hintElem = document.getElementById('sale-quantity-hint');
  const submitBtn = document.getElementById('btn-submit-sale');

  if (!productSelect || !qtyInput) return;

  const products = getProducts();
  const selectedProduct = products.find(p => p.id === productSelect.value);

  if (!selectedProduct) {
    previewStock.textContent = '-';
    previewPrice.textContent = '$0.00';
    totalAmountElem.textContent = '$0.00';
    hintElem.textContent = 'Select a product first';
    hintElem.style.color = 'var(--text-muted)';
    if (submitBtn) submitBtn.disabled = true;
    return;
  }

  // Update preview details
  previewStock.textContent = `${selectedProduct.quantity} units`;
  previewPrice.textContent = formatCurrency(selectedProduct.price);

  const quantity = parseInt(qtyInput.value, 10) || 0;

  // Validation
  if (selectedProduct.quantity <= 0) {
    hintElem.textContent = 'Product is currently out of stock!';
    hintElem.style.color = 'var(--danger)';
    if (submitBtn) submitBtn.disabled = true;
    totalAmountElem.textContent = '$0.00';
    return;
  }

  if (quantity <= 0) {
    hintElem.textContent = 'Quantity must be at least 1';
    hintElem.style.color = 'var(--danger)';
    if (submitBtn) submitBtn.disabled = true;
    totalAmountElem.textContent = '$0.00';
    return;
  }

  if (quantity > selectedProduct.quantity) {
    hintElem.textContent = `Quantity exceeds available stock (${selectedProduct.quantity})`;
    hintElem.style.color = 'var(--danger)';
    if (submitBtn) submitBtn.disabled = true;
    totalAmountElem.textContent = '$0.00';
    return;
  }

  // Valid
  hintElem.textContent = `Stock remaining after sale: ${selectedProduct.quantity - quantity}`;
  hintElem.style.color = 'var(--success-text)';
  if (submitBtn) submitBtn.disabled = false;

  const total = quantity * selectedProduct.price;
  totalAmountElem.textContent = formatCurrency(total);
}

// ==============================================================================
// 6. PRODUCT CRUD ACTIONS
// ==============================================================================

/**
 * Open Modal to Add or Edit a Product
 */
function openProductModal(productId = null) {
  const modal = document.getElementById('product-modal');
  const modalTitle = document.getElementById('modal-product-title');
  const form = document.getElementById('product-form');
  const idInput = document.getElementById('form-product-id');
  const nameInput = document.getElementById('form-product-name');
  const catInput = document.getElementById('form-product-category');
  const priceInput = document.getElementById('form-product-price');
  const qtyInput = document.getElementById('form-product-qty');
  const threshInput = document.getElementById('form-product-threshold');

  form.reset();

  if (productId) {
    // Edit Mode
    const products = getProducts();
    const product = products.find(p => p.id === productId);
    if (!product) {
      showToast('Product not found', 'error');
      return;
    }

    modalTitle.textContent = 'Edit Product';
    idInput.value = product.id;
    nameInput.value = product.name;
    catInput.value = product.category;
    priceInput.value = product.price;
    qtyInput.value = product.quantity;
    threshInput.value = product.threshold;
  } else {
    // Add Mode
    modalTitle.textContent = 'Add New Product';
    idInput.value = '';
    threshInput.value = 5; // Default threshold
  }

  modal.classList.add('active');
  nameInput.focus();
}

/**
 * Close Product Modal
 */
function closeProductModal() {
  const modal = document.getElementById('product-modal');
  if (modal) modal.classList.remove('active');
}

/**
 * Handle Add/Edit Form Submission
 */
function handleProductFormSubmit(e) {
  e.preventDefault();

  const id = document.getElementById('form-product-id').value;
  const name = document.getElementById('form-product-name').value.trim();
  const category = document.getElementById('form-product-category').value.trim();
  const price = parseFloat(document.getElementById('form-product-price').value);
  const quantity = parseInt(document.getElementById('form-product-qty').value, 10);
  const threshold = parseInt(document.getElementById('form-product-threshold').value, 10);

  // Validation
  if (!name || !category) {
    showToast('Please fill in all required fields.', 'error');
    return;
  }
  if (isNaN(price) || price <= 0) {
    showToast('Price must be greater than zero.', 'error');
    return;
  }
  if (isNaN(quantity) || quantity < 0) {
    showToast('Quantity cannot be negative.', 'error');
    return;
  }
  if (isNaN(threshold) || threshold < 1) {
    showToast('Threshold must be at least 1.', 'error');
    return;
  }

  const products = getProducts();

  if (id) {
    // Update existing product
    const index = products.findIndex(p => p.id === id);
    if (index !== -1) {
      products[index] = {
        ...products[index],
        name,
        category,
        price,
        quantity,
        threshold,
        updatedAt: new Date().toISOString()
      };
      saveProducts(products);
      showToast(`Updated "${name}" successfully!`, 'success');
    }
  } else {
    // Add new product
    const newProduct = {
      id: generateId('prod'),
      name,
      category,
      price,
      quantity,
      threshold,
      createdAt: new Date().toISOString()
    };
    products.push(newProduct);
    saveProducts(products);
    showToast(`Added "${name}" to inventory!`, 'success');
  }

  closeProductModal();
  renderAllViews();
}

// --- Delete Modal Handling ---
let productToDeleteId = null;

function openDeleteModal(productId) {
  const products = getProducts();
  const product = products.find(p => p.id === productId);
  if (!product) return;

  productToDeleteId = productId;
  document.getElementById('delete-product-name').textContent = `"${product.name}"`;
  document.getElementById('delete-modal').classList.add('active');
}

function closeDeleteModal() {
  productToDeleteId = null;
  document.getElementById('delete-modal').classList.remove('active');
}

function confirmDeleteProduct() {
  if (!productToDeleteId) return;

  let products = getProducts();
  const product = products.find(p => p.id === productToDeleteId);
  const name = product ? product.name : 'Product';

  products = products.filter(p => p.id !== productToDeleteId);
  saveProducts(products);

  closeDeleteModal();
  renderAllViews();
  showToast(`Deleted "${name}" from inventory.`, 'info');
}

// ==============================================================================
// 7. STOCK MANAGEMENT ACTIONS
// ==============================================================================

/**
 * Increment or Decrement stock by delta (+1, -1, +5, -5)
 */
function adjustStock(productId, delta) {
  const products = getProducts();
  const product = products.find(p => p.id === productId);

  if (!product) return;

  const newQty = Math.max(0, product.quantity + delta);
  if (newQty === product.quantity) {
    showToast('Stock is already at zero.', 'warning');
    return;
  }

  product.quantity = newQty;
  saveProducts(products);
  renderAllViews();

  const changeText = delta > 0 ? `+${delta}` : `${delta}`;
  showToast(`Updated ${product.name} stock (${changeText}) -> ${newQty} total`, 'success');
}

/**
 * Submit custom stock value
 */
function handleCustomStockSubmit(e, productId) {
  e.preventDefault();
  const input = document.getElementById(`custom-stock-${productId}`);
  if (!input) return;

  const newQty = parseInt(input.value, 10);
  if (isNaN(newQty) || newQty < 0) {
    showToast('Please enter a valid non-negative quantity', 'error');
    return;
  }

  const products = getProducts();
  const product = products.find(p => p.id === productId);
  if (!product) return;

  product.quantity = newQty;
  saveProducts(products);
  renderAllViews();
  showToast(`Set "${product.name}" stock to ${newQty} units.`, 'success');
}

/**
 * Quick restock prompt from dashboard
 */
function quickRestockPrompt(productId) {
  const products = getProducts();
  const product = products.find(p => p.id === productId);
  if (!product) return;

  const addAmountStr = prompt(`How many units of "${product.name}" would you like to add?`, "10");
  if (addAmountStr === null) return; // User cancelled

  const addAmount = parseInt(addAmountStr, 10);
  if (isNaN(addAmount) || addAmount <= 0) {
    showToast('Please enter a valid positive number.', 'error');
    return;
  }

  product.quantity += addAmount;
  saveProducts(products);
  renderAllViews();
  showToast(`Added ${addAmount} units to "${product.name}".`, 'success');
}

// ==============================================================================
// 8. SALES ACTIONS
// ==============================================================================

/**
 * Process new sale form
 */
function handleRecordSaleSubmit(e) {
  e.preventDefault();

  const productSelect = document.getElementById('sale-product-select');
  const qtyInput = document.getElementById('sale-quantity-input');

  const productId = productSelect.value;
  const quantity = parseInt(qtyInput.value, 10);

  if (!productId) {
    showToast('Please select a product to sell.', 'error');
    return;
  }

  if (isNaN(quantity) || quantity <= 0) {
    showToast('Please enter a valid quantity greater than zero.', 'error');
    return;
  }

  const products = getProducts();
  const product = products.find(p => p.id === productId);

  if (!product) {
    showToast('Selected product not found.', 'error');
    return;
  }

  if (product.quantity < quantity) {
    showToast(`Cannot complete sale! Only ${product.quantity} units available.`, 'error');
    return;
  }

  // 1. Deduct stock
  product.quantity -= quantity;
  saveProducts(products);

  // 2. Create Sale Record
  const totalAmount = quantity * product.price;
  const newSale = {
    id: generateId('sale'),
    productId: product.id,
    productName: product.name,
    quantity: quantity,
    unitPrice: product.price,
    totalAmount: totalAmount,
    date: new Date().toISOString()
  };

  const sales = getSales();
  sales.push(newSale);
  saveSales(sales);

  // 3. Reset sale form inputs
  qtyInput.value = 1;
  
  // 4. Update UI
  renderAllViews();
  showToast(`Sale recorded! Sold ${quantity}x ${product.name} for ${formatCurrency(totalAmount)}`, 'success');
}

/**
 * Clear all sales history
 */
function handleClearSalesHistory() {
  const sales = getSales();
  if (sales.length === 0) {
    showToast('Sales history is already empty.', 'info');
    return;
  }

  if (confirm('Are you sure you want to clear all sales records? Product stock will not be affected.')) {
    saveSales([]);
    renderAllViews();
    showToast('Sales history cleared.', 'info');
  }
}

// ==============================================================================
// 9. HELPER TO PREVENT XSS (HTML escaping)
// ==============================================================================
function escapeHtml(str) {
  if (typeof str !== 'string') return str;
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// ==============================================================================
// 10. EVENT LISTENERS & INITIALIZATION
// ==============================================================================
document.addEventListener('DOMContentLoaded', () => {
  // Navigation Menu Tabs
  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      if (tab) navigateToTab(tab);
    });
  });

  // Mobile Menu Toggle
  const mobileBtn = document.getElementById('mobile-menu-btn');
  const sidebar = document.querySelector('.sidebar');
  if (mobileBtn && sidebar) {
    mobileBtn.addEventListener('click', () => {
      sidebar.classList.toggle('open');
    });
  }

  // Reset Demo Data Button
  const resetBtn = document.getElementById('btn-reset-demo');
  if (resetBtn) {
    resetBtn.addEventListener('click', resetDemoData);
  }

  // Products Search & Filters
  const searchInput = document.getElementById('product-search-input');
  const catFilter = document.getElementById('product-category-filter');
  const statusFilter = document.getElementById('product-status-filter');

  if (searchInput) searchInput.addEventListener('input', renderProductsTable);
  if (catFilter) catFilter.addEventListener('change', renderProductsTable);
  if (statusFilter) statusFilter.addEventListener('change', renderProductsTable);

  // Stock Search
  const stockSearch = document.getElementById('stock-search-input');
  if (stockSearch) stockSearch.addEventListener('input', renderStockTable);

  // Product Form (Add / Edit)
  const productForm = document.getElementById('product-form');
  if (productForm) productForm.addEventListener('submit', handleProductFormSubmit);

  // Delete Confirm Button
  const confirmDeleteBtn = document.getElementById('btn-confirm-delete');
  if (confirmDeleteBtn) confirmDeleteBtn.addEventListener('click', confirmDeleteProduct);

  // Sales Form & Dynamic Preview
  const saleForm = document.getElementById('record-sale-form');
  const saleProductSelect = document.getElementById('sale-product-select');
  const saleQtyInput = document.getElementById('sale-quantity-input');
  const clearSalesBtn = document.getElementById('btn-clear-sales');

  if (saleProductSelect) saleProductSelect.addEventListener('change', updateSaleCalculations);
  if (saleQtyInput) saleQtyInput.addEventListener('input', updateSaleCalculations);
  if (saleForm) saleForm.addEventListener('submit', handleRecordSaleSubmit);
  if (clearSalesBtn) clearSalesBtn.addEventListener('click', handleClearSalesHistory);

  // Close modals on Escape key or backdrop click
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeProductModal();
      closeDeleteModal();
    }
  });

  document.querySelectorAll('.modal-overlay').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeProductModal();
        closeDeleteModal();
      }
    });
  });

  // Initial Render
  renderAllViews();
});
