/**
 * store.js — Shared order & store-status module for Late Bites
 * Uses localStorage as persistent storage and BroadcastChannel for real-time cross-tab sync.
 */

// ─── BroadcastChannel ───
let channel = null;
try {
  channel = new BroadcastChannel('late-bites');
} catch (e) {
  console.warn('BroadcastChannel not supported, falling back to polling only.');
}

const listeners = {};

/**
 * Register a listener for a specific event type.
 * @param {'NEW_ORDER'|'ORDER_STATUS_CHANGED'|'STORE_STATUS_CHANGED'} type
 * @param {Function} callback
 */
export function on(type, callback) {
  if (!listeners[type]) listeners[type] = [];
  listeners[type].push(callback);
}

function emit(type, data) {
  if (listeners[type]) {
    listeners[type].forEach(cb => cb(data));
  }
}

// Listen for messages from other tabs
if (channel) {
  channel.onmessage = (event) => {
    const { type, payload } = event.data;
    emit(type, payload);
  };
}

function broadcast(type, payload) {
  if (channel) {
    channel.postMessage({ type, payload });
  }
}

// ─── Orders ───

function getOrders() {
  return JSON.parse(localStorage.getItem('orders') || '[]');
}

function saveOrders(orders) {
  localStorage.setItem('orders', JSON.stringify(orders));
}

/**
 * Place a new order. Returns the created order object.
 */
export function placeOrder({ items, totalAmount, deliveryFee, paymentMethod, receiptUrl, customer, liveLocation }) {
  const orders = getOrders();
  const orderNum = (parseInt(localStorage.getItem('orderCounter') || '0', 10)) + 1;
  localStorage.setItem('orderCounter', String(orderNum));

  const order = {
    id: `ORD-${String(orderNum).padStart(4, '0')}`,
    items: items.map(i => ({ name: i.name, price: i.price, quantity: i.quantity })),
    totalAmount,
    deliveryFee,
    paymentMethod,
    receiptUrl: receiptUrl || null,
    customer,
    liveLocation: liveLocation || null,
    status: 'Pending',
    createdAt: new Date().toISOString()
  };

  orders.unshift(order); // newest first
  saveOrders(orders);

  // Broadcast to other tabs (admin)
  broadcast('NEW_ORDER', order);

  return order;
}

/**
 * Get all orders, newest first.
 */
export function getAllOrders() {
  return getOrders();
}

/**
 * Update an order's status.
 */
export function updateOrderStatus(orderId, newStatus) {
  const orders = getOrders();
  const order = orders.find(o => o.id === orderId);
  if (!order) return null;

  order.status = newStatus;
  saveOrders(orders);

  broadcast('ORDER_STATUS_CHANGED', { orderId, status: newStatus });
  return order;
}

// ─── Store Status ───

function getStoreStatusFromStorage() {
  return JSON.parse(localStorage.getItem('storeStatus') || '{"isOpen": true}');
}

/**
 * Check if the store is currently open.
 */
export function isStoreOpen() {
  return getStoreStatusFromStorage().isOpen;
}

/**
 * Set the store open/closed state.
 */
export function setStoreOpen(isOpen) {
  const status = { isOpen };
  localStorage.setItem('storeStatus', JSON.stringify(status));
  broadcast('STORE_STATUS_CHANGED', { isOpen });
}

// ─── Polling Fallback ───
// For environments where BroadcastChannel isn't available, poll localStorage.
let lastOrderCount = getOrders().length;
let lastStoreOpen = isStoreOpen();

export function startPolling(intervalMs = 3000) {
  setInterval(() => {
    // Check for new orders
    const currentOrders = getOrders();
    if (currentOrders.length > lastOrderCount) {
      const newOrders = currentOrders.slice(0, currentOrders.length - lastOrderCount);
      newOrders.forEach(order => emit('NEW_ORDER', order));
    }
    // Also check for status changes (re-render)
    if (currentOrders.length !== lastOrderCount) {
      emit('ORDERS_UPDATED', currentOrders);
    }
    lastOrderCount = currentOrders.length;

    // Check store status
    const currentStoreOpen = isStoreOpen();
    if (currentStoreOpen !== lastStoreOpen) {
      emit('STORE_STATUS_CHANGED', { isOpen: currentStoreOpen });
      lastStoreOpen = currentStoreOpen;
    }
  }, intervalMs);
}
