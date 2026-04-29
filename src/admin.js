import './style.css';
import { getAllOrders, updateOrderStatus, isStoreOpen, setStoreOpen, on, startPolling } from './store.js';

const IMGBB_API_KEY = "2963a8dc073df07613d6801e375e5dc7";

// DOM Elements
const loginScreen = document.getElementById('login-screen');
const dashboardScreen = document.getElementById('dashboard-screen');
const adminPass = document.getElementById('admin-pass');
const loginBtn = document.getElementById('login-btn');

const deliveryFeeInput = document.getElementById('delivery-fee-input');
const saveFeeBtn = document.getElementById('save-fee-btn');

const menuTableBody = document.getElementById('menu-table-body');
const showAddModalBtn = document.getElementById('show-add-modal-btn');
const addItemModal = document.getElementById('add-item-modal');
const itemOverlay = document.getElementById('item-overlay');
const closeItemModalBtn = document.getElementById('close-item-modal');
const addItemForm = document.getElementById('add-item-form');
const saveItemBtn = document.getElementById('save-item-btn');
const modalTitle = document.getElementById('modal-title');
const categoryList = document.getElementById('category-list');

// Store Toggle
const storeToggleInput = document.getElementById('store-toggle-input');
const storeStatusText = document.getElementById('store-status-text');

// Orders
const orderStats = document.getElementById('order-stats');
const orderFilterTabs = document.getElementById('order-filter-tabs');
const adminOrdersFeed = document.getElementById('admin-orders-feed');

// State
let menuData = JSON.parse(localStorage.getItem('menuData')) || [];
let storeConfig = JSON.parse(localStorage.getItem('storeConfig')) || { deliveryFee: 30 };
let currentEditId = null;
let currentFilter = 'all';
let knownOrderCount = getAllOrders().length;

// ═══ Auth ═══
loginBtn.addEventListener('click', () => {
  if (adminPass.value === 'admin123') {
    loginScreen.style.display = 'none';
    dashboardScreen.style.display = 'block';
    initDashboard();
  } else {
    alert('Incorrect Password');
  }
});

adminPass.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') loginBtn.click();
});

function initDashboard() {
  deliveryFeeInput.value = storeConfig.deliveryFee;
  updateStoreToggleUI();
  renderTable();
  updateCategoriesDatalist();
  renderOrdersFeed();
  renderOrderStats();
  setupFilterTabs();
  setupOrderListeners();
  startPolling(3000);
}

// ═══ Notification Sound (Web Audio API) ═══
let audioCtx = null;
function playNotificationSound() {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const now = audioCtx.currentTime;
    // Play a pleasant 3-note chime
    [523.25, 659.25, 783.99].forEach((freq, i) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.3, now + i * 0.15);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.15 + 0.5);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now + i * 0.15);
      osc.stop(now + i * 0.15 + 0.5);
    });
  } catch (e) {
    console.warn('Audio notification failed:', e);
  }
}

function showNotifBanner(orderId) {
  const el = document.createElement('div');
  el.className = 'notif-pulse';
  el.innerHTML = `<i class="ri-notification-3-fill"></i> New Order: ${orderId}`;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 5000);
}

// ═══ Store Toggle ═══
storeToggleInput.addEventListener('change', () => {
  setStoreOpen(storeToggleInput.checked);
  updateStoreToggleUI();
});

function updateStoreToggleUI() {
  const open = isStoreOpen();
  storeToggleInput.checked = open;
  storeStatusText.textContent = open ? 'Open' : 'Closed';
  storeStatusText.className = `store-status-text ${open ? 'open' : 'closed'}`;
}

// ═══ Order Listeners ═══
function setupOrderListeners() {
  on('NEW_ORDER', (order) => {
    playNotificationSound();
    showNotifBanner(order.id);
    renderOrdersFeed();
    renderOrderStats();
  });
  on('ORDERS_UPDATED', () => {
    renderOrdersFeed();
    renderOrderStats();
  });
  on('STORE_STATUS_CHANGED', () => {
    updateStoreToggleUI();
  });
}

// ═══ Order Stats ═══
function renderOrderStats() {
  const orders = getAllOrders();
  const pending = orders.filter(o => o.status === 'Pending').length;
  const active = orders.filter(o => ['Accepted', 'Preparing'].includes(o.status)).length;
  const delivered = orders.filter(o => o.status === 'Delivered').length;
  const total = orders.length;

  orderStats.innerHTML = `
    <div class="stat-card"><div class="stat-num">${total}</div><div class="stat-label">Total Orders</div></div>
    <div class="stat-card" style="border-color:rgba(255,193,7,0.3)"><div class="stat-num" style="color:#e6a700">${pending}</div><div class="stat-label">Pending</div></div>
    <div class="stat-card" style="border-color:rgba(33,150,243,0.3)"><div class="stat-num" style="color:#1976d2">${active}</div><div class="stat-label">Active</div></div>
    <div class="stat-card" style="border-color:rgba(76,175,80,0.3)"><div class="stat-num" style="color:#2e7d32">${delivered}</div><div class="stat-label">Delivered</div></div>
  `;
}

// ═══ Filter Tabs ═══
function setupFilterTabs() {
  orderFilterTabs.addEventListener('click', (e) => {
    const tab = e.target.closest('.filter-tab');
    if (!tab) return;
    currentFilter = tab.dataset.filter;
    orderFilterTabs.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    renderOrdersFeed();
  });
}

// ═══ Orders Feed ═══
function renderOrdersFeed() {
  const allOrders = getAllOrders();
  let orders = allOrders;
  if (currentFilter !== 'all') {
    orders = allOrders.filter(o => o.status === currentFilter);
  }

  if (orders.length === 0) {
    adminOrdersFeed.innerHTML = '<div class="no-orders-msg"><i class="ri-inbox-line"></i><p>No orders found.</p></div>';
    return;
  }

  adminOrdersFeed.innerHTML = orders.map(o => {
    const date = new Date(o.createdAt);
    const dateStr = date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    const timeStr = date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    const statusClass = o.status.toLowerCase();
    const c = o.customer;

    const itemsHtml = o.items.map(i =>
      `<div class="aoc-item-row"><span>${i.quantity}x ${i.name}</span><span>₹${(i.price * i.quantity).toFixed(2)}</span></div>`
    ).join('');

    const fullAddr = `${c.address}${c.landmark ? ', Near ' + c.landmark : ''}, ${c.city} - ${c.pincode}`;

    const receiptHtml = o.receiptUrl
      ? `<a href="${o.receiptUrl}" target="_blank" class="aoc-receipt-link"><i class="ri-image-line"></i> View Payment Proof</a>`
      : '';

    const locationHtml = o.liveLocation
      ? `<div class="aoc-customer-row"><i class="ri-map-pin-line"></i><a href="${o.liveLocation}" target="_blank" style="color:var(--primary);font-weight:600;text-decoration:none;">View Live Location</a></div>`
      : '';

    // Action buttons based on current status
    const statusButtons = getStatusButtons(o.id, o.status);

    return `<div class="admin-order-card" id="order-${o.id}">
      <div class="aoc-top">
        <div class="aoc-id-time">
          <span class="aoc-id">${o.id}</span>
          <span class="aoc-time">${dateStr} at ${timeStr}</span>
        </div>
        <span class="status-badge ${statusClass}"><span class="status-dot"></span>${o.status}</span>
      </div>
      <div class="aoc-customer">
        <div class="aoc-customer-row"><i class="ri-user-line"></i>${c.name}</div>
        <div class="aoc-customer-row"><i class="ri-phone-line"></i><a href="tel:${c.phone}" style="color:inherit;text-decoration:none;">${c.phone}</a></div>
        <div class="aoc-customer-row"><i class="ri-home-4-line"></i>${fullAddr}</div>
        ${locationHtml}
      </div>
      <div class="aoc-items">${itemsHtml}</div>
      <div class="aoc-payment-row">
        <span class="aoc-total">₹${o.totalAmount.toFixed(2)}</span>
        <span class="aoc-method-badge ${o.paymentMethod}">${o.paymentMethod === 'upi' ? '✅ Paid (UPI)' : '💵 COD'}</span>
      </div>
      ${receiptHtml}
      <div class="aoc-actions">${statusButtons}</div>
    </div>`;
  }).join('');

  // Attach status button listeners
  adminOrdersFeed.querySelectorAll('.aoc-status-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const orderId = e.currentTarget.dataset.orderId;
      const newStatus = e.currentTarget.dataset.status;
      updateOrderStatus(orderId, newStatus);
      renderOrdersFeed();
      renderOrderStats();
    });
  });
}

function getStatusButtons(orderId, currentStatus) {
  const statuses = [
    { status: 'Accepted', label: '✓ Accept', cls: 'accept-btn' },
    { status: 'Preparing', label: '🍳 Preparing', cls: 'prepare-btn' },
    { status: 'Delivered', label: '✅ Delivered', cls: 'deliver-btn' },
    { status: 'Cancelled', label: '✕ Cancel', cls: 'cancel-btn' }
  ];

  if (currentStatus === 'Delivered' || currentStatus === 'Cancelled') {
    return `<span style="font-size:0.85rem;color:var(--text-sub);padding:4px;">${currentStatus === 'Delivered' ? '✅ Order Completed' : '❌ Order Cancelled'}</span>`;
  }

  return statuses.map(s => {
    const isActive = s.status === currentStatus;
    return `<button class="aoc-status-btn ${s.cls} ${isActive ? 'active' : ''}" data-order-id="${orderId}" data-status="${s.status}" ${isActive ? 'disabled' : ''}>${s.label}</button>`;
  }).join('');
}

// ═══ Settings ═══
saveFeeBtn.addEventListener('click', () => {
  storeConfig.deliveryFee = parseFloat(deliveryFeeInput.value) || 0;
  localStorage.setItem('storeConfig', JSON.stringify(storeConfig));
  alert('Delivery Fee Saved!');
});

// ═══ Menu Table ═══
function renderTable() {
  menuTableBody.innerHTML = '';
  menuData.forEach((cat) => {
    cat.items.forEach(item => {
      const tr = document.createElement('tr');
      tr.style.borderBottom = '1px solid var(--border)';
      tr.innerHTML = `
        <td style="padding: 10px;">${item.id}</td>
        <td style="padding: 10px;"><img src="${item.image}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 8px;"></td>
        <td style="padding: 10px;">${item.name}</td>
        <td style="padding: 10px;">${cat.category}</td>
        <td style="padding: 10px;">₹${item.price}</td>
        <td style="padding: 10px;">
          <span style="padding: 4px 8px; border-radius: 4px; font-size: 0.8rem; background: ${item.disabled ? 'rgba(207,44,44,0.1)' : 'rgba(212,175,55,0.1)'}; color: ${item.disabled ? 'var(--danger)' : 'var(--primary)'}; font-weight: bold;">
            ${item.disabled ? 'Disabled' : 'Active'}
          </span>
        </td>
        <td style="padding: 10px;">
          <button class="btn-text toggle-btn" data-id="${item.id}" style="color: ${item.disabled ? 'var(--accent)' : 'var(--text-sub)'};">${item.disabled ? 'Enable' : 'Disable'}</button>
          <button class="btn-text edit-btn" data-id="${item.id}" style="color: var(--primary);">Edit</button>
          <button class="btn-text delete-btn" data-id="${item.id}" style="color: var(--danger);">Delete</button>
        </td>
      `;
      menuTableBody.appendChild(tr);
    });
  });

  document.querySelectorAll('.delete-btn').forEach(btn => btn.addEventListener('click', handleDelete));
  document.querySelectorAll('.edit-btn').forEach(btn => btn.addEventListener('click', handleEdit));
  document.querySelectorAll('.toggle-btn').forEach(btn => btn.addEventListener('click', handleToggle));
}

function updateCategoriesDatalist() {
  categoryList.innerHTML = '';
  menuData.forEach(cat => {
    const option = document.createElement('option');
    option.value = cat.category;
    categoryList.appendChild(option);
  });
}

// Modal Toggle
function toggleModal() {
  const isOpen = addItemModal.classList.contains('open');
  if (isOpen) {
    addItemModal.classList.remove('open');
    itemOverlay.classList.remove('active');
  } else {
    addItemModal.classList.add('open');
    itemOverlay.classList.add('active');
  }
}

showAddModalBtn.addEventListener('click', () => {
  currentEditId = null;
  modalTitle.textContent = "Add New Item";
  addItemForm.reset();
  document.getElementById('item-id').value = '';
  toggleModal();
});
closeItemModalBtn.addEventListener('click', toggleModal);
itemOverlay.addEventListener('click', toggleModal);

// Edit
function handleEdit(e) {
  const id = parseInt(e.target.getAttribute('data-id'));
  currentEditId = id;
  modalTitle.textContent = "Edit Item";
  let targetItem = null;
  let targetCat = null;
  menuData.forEach(cat => {
    const found = cat.items.find(i => i.id === id);
    if(found) { targetItem = found; targetCat = cat.category; }
  });
  if(targetItem) {
    document.getElementById('item-id').value = targetItem.id;
    document.getElementById('item-name').value = targetItem.name;
    document.getElementById('item-category').value = targetCat;
    document.getElementById('item-price').value = targetItem.price;
    document.getElementById('item-old-price').value = targetItem.originalPrice || '';
    document.getElementById('item-image-url').value = targetItem.image;
    toggleModal();
  }
}

// Toggle Enable/Disable
function handleToggle(e) {
  const id = parseInt(e.target.getAttribute('data-id'));
  menuData.forEach(cat => {
    const item = cat.items.find(i => i.id === id);
    if(item) item.disabled = !item.disabled;
  });
  saveMenuData();
  renderTable();
}

// Delete
function handleDelete(e) {
  const id = parseInt(e.target.getAttribute('data-id'));
  if(confirm("Are you sure you want to delete this item?")) {
    menuData.forEach(cat => {
      cat.items = cat.items.filter(i => i.id !== id);
    });
    menuData = menuData.filter(cat => cat.items.length > 0);
    saveMenuData();
    renderTable();
  }
}

// Save Item
addItemForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('item-name').value;
  const category = document.getElementById('item-category').value;
  const price = parseFloat(document.getElementById('item-price').value);
  const oldPriceRaw = document.getElementById('item-old-price').value;
  const originalPrice = oldPriceRaw ? parseFloat(oldPriceRaw) : null;
  let imageUrl = document.getElementById('item-image-url').value;
  const imageFile = document.getElementById('item-image-file').files[0];

  saveItemBtn.disabled = true;
  saveItemBtn.textContent = "Saving...";

  if (imageFile) {
    const formData = new FormData();
    formData.append('image', imageFile);
    try {
      const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
        method: 'POST', body: formData
      });
      const data = await res.json();
      if(data.success) {
        imageUrl = data.data.url;
      } else {
        alert("Image upload failed! " + data.error.message);
        saveItemBtn.disabled = false;
        saveItemBtn.textContent = "Save Item";
        return;
      }
    } catch(err) {
      alert("Network error uploading image");
      saveItemBtn.disabled = false;
      saveItemBtn.textContent = "Save Item";
      return;
    }
  }

  if (!imageUrl && !currentEditId) {
    imageUrl = "https://via.placeholder.com/400?text=No+Image";
  }

  const itemDetails = {
    id: currentEditId || Date.now(),
    name, price, originalPrice, image: imageUrl
  };

  let existingDisabled = false;
  if (currentEditId) {
    menuData.forEach(cat => {
      const idx = cat.items.findIndex(i => i.id === currentEditId);
      if(idx > -1) {
        if(!imageUrl) itemDetails.image = cat.items[idx].image;
        existingDisabled = cat.items[idx].disabled || false;
        cat.items.splice(idx, 1);
      }
    });
  }

  itemDetails.disabled = existingDisabled;

  let catObj = menuData.find(cat => cat.category.toLowerCase() === category.toLowerCase());
  if (!catObj) {
    catObj = { category: category, items: [] };
    menuData.push(catObj);
  }
  catObj.items.push(itemDetails);
  menuData = menuData.filter(cat => cat.items.length > 0);

  saveMenuData();
  renderTable();
  updateCategoriesDatalist();
  toggleModal();
  
  saveItemBtn.disabled = false;
  saveItemBtn.textContent = "Save Item";
});

function saveMenuData() {
  localStorage.setItem('menuData', JSON.stringify(menuData));
}
