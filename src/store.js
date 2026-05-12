/**
 * store.js — Shared order & store-status module for Late Bites
 * Uses Firebase Realtime Database for cross-device real-time sync.
 * Keeps a local in-memory cache for synchronous reads.
 */

import { db } from './firebase.js';
import { ref, set, onValue } from 'firebase/database';

// ─── Event System ───
const listeners = {};

export function on(type, callback) {
  if (!listeners[type]) listeners[type] = [];
  listeners[type].push(callback);
}

function emit(type, data) {
  if (listeners[type]) listeners[type].forEach(cb => cb(data));
}

// ─── Local Cache (synced with Firebase in real-time) ───
let ordersCache = [];
let storeOpenCache = true;
let counterCache = 0;
let initialLoadDone = false;

/**
 * Initialize real-time listeners. Call once on page load.
 * Returns a promise that resolves when initial data is loaded.
 */
export function initStore() {
  return new Promise((resolve) => {
    let resolved = false;
    const tryResolve = () => { if (!resolved) { resolved = true; resolve(); } };

    // Listen for store status changes (real-time, cross-device)
    onValue(ref(db, 'storeStatus'), (snap) => {
      const val = snap.val();
      storeOpenCache = val?.isOpen ?? true;
      emit('STORE_STATUS_CHANGED', { isOpen: storeOpenCache });
    });

    // Listen for orders (real-time, cross-device)
    onValue(ref(db, 'orders'), (snap) => {
      const prevCount = ordersCache.length;
      const val = snap.val();
      ordersCache = val
        ? Object.values(val).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        : [];

      // Emit NEW_ORDER only after initial load (not for existing data)
      if (initialLoadDone && ordersCache.length > prevCount) {
        const newOrders = ordersCache.slice(0, ordersCache.length - prevCount);
        newOrders.forEach(o => emit('NEW_ORDER', o));
      }
      emit('ORDERS_UPDATED', ordersCache);
      initialLoadDone = true;
      tryResolve();
    });

    // Listen for order counter
    onValue(ref(db, 'orderCounter'), (snap) => {
      counterCache = snap.val() || 0;
    });

    // Safety timeout — resolve even if Firebase is slow
    setTimeout(tryResolve, 4000);
  });
}

// ─── Orders ───

/**
 * Place a new order. Writes to Firebase. Returns the order object.
 */
export async function placeOrder({ items, totalAmount, deliveryFee, paymentMethod, receiptUrl, customer, liveLocation }) {
  const newCount = counterCache + 1;
  await set(ref(db, 'orderCounter'), newCount);

  const order = {
    id: `ORD-${String(newCount).padStart(4, '0')}`,
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

  await set(ref(db, `orders/${order.id}`), order);
  return order;
}

/**
 * Get all orders from cache, newest first.
 */
export function getAllOrders() {
  return ordersCache;
}

/**
 * Update an order's status in Firebase.
 */
export async function updateOrderStatus(orderId, newStatus) {
  await set(ref(db, `orders/${orderId}/status`), newStatus);
}

// ─── Store Status ───

export function isStoreOpen() {
  return storeOpenCache;
}

export async function setStoreOpen(isOpen) {
  await set(ref(db, 'storeStatus'), { isOpen });
}

// ─── Polling (no-op — Firebase handles real-time) ───
export function startPolling() {
  // No-op: Firebase onValue provides real-time updates across all devices
}
