import './style.css';

const menuData = [
  {
    category: "Drinks",
    items: [
      { id: 1, name: "Independence Water Bottle (750ml)", price: 15, originalPrice: null, image: "https://images.unsplash.com/photo-1523362628745-0c100150b504?w=400&q=80" }
    ]
  },
  {
    category: "Snacks",
    items: [
      { id: 2, name: "French Fries", price: 80, originalPrice: 90, image: "https://images.unsplash.com/photo-1576107232684-1279f390859f?w=400&q=80" },
      { id: 3, name: "Chicken Popcorn", price: 130, originalPrice: 150, image: "https://images.unsplash.com/photo-1562967914-608f82629710?w=400&q=80" },
      { id: 4, name: "Chicken Wings (4 pcs)", price: 145, originalPrice: 160, image: "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=400&q=80" },
      { id: 5, name: "Chicken Strips (5 pcs)", price: 200, originalPrice: 230, image: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=400&q=80" }
    ]
  },
  {
    category: "Maggi / Pasta",
    items: [
      { id: 6, name: "Maggi", price: 50, originalPrice: 60, image: "https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=400&q=80" },
      { id: 7, name: "Egg Maggi", price: 75, originalPrice: 85, image: "https://images.unsplash.com/photo-1526318896980-cf78c088247c?w=400&q=80" },
      { id: 8, name: "Chicken Maggi", price: 120, originalPrice: null, image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&q=80" }
    ]
  },
  {
    category: "Egg Items",
    items: [
      { id: 9, name: "Double Egg Omelet", price: 55, originalPrice: null, image: "https://images.unsplash.com/photo-1510693206972-df098062cb71?w=400&q=80" }
    ]
  },
  {
    category: "Biryani & Rice",
    items: [
      { id: 10, name: "Egg Biryani", price: 140, originalPrice: null, image: "https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?w=400&q=80" },
      { id: 11, name: "Biryani Rice", price: 110, originalPrice: null, image: "https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?w=400&q=80" },
      { id: 12, name: "Chicken Dum Biryani", price: 180, originalPrice: null, image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&q=80" }
    ]
  }
];

// App State
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let addresses = JSON.parse(localStorage.getItem('addresses')) || [];
let selectedAddressId = localStorage.getItem('selectedAddressId') || null;

const flatProducts = menuData.flatMap(cat => cat.items);

// DOM Elements
const mainContent = document.getElementById('main-content');
const categoryNav = document.getElementById('category-nav');
const cartBtn = document.getElementById('cart-btn');
const closeCartBtn = document.getElementById('close-cart');
const cartSidebar = document.getElementById('cart-sidebar');
const cartOverlay = document.getElementById('cart-overlay');
const cartItemsContainer = document.getElementById('cart-items');
const cartCount = document.getElementById('cart-count');
const cartTotalPrice = document.getElementById('cart-total-price');
const cartItemTotal = document.getElementById('cart-item-total');
const cartDiscount = document.getElementById('cart-discount');
const cartDiscountRow = document.getElementById('cart-discount-row');
const cartDeliveryRow = document.getElementById('cart-delivery-row');
const cartDeliveryFee = document.getElementById('cart-delivery-fee');
const savingsBadge = document.getElementById('savings-badge');
const savingsAmount = document.getElementById('savings-amount');
const checkoutBtn = document.getElementById('checkout-btn');
const toastContainer = document.getElementById('toast-container');
const loadingOverlay = document.getElementById('loading-overlay');

// Address Elements
const addressSelectorBtn = document.getElementById('address-selector-btn');
const headerAddressType = document.getElementById('header-address-type');
const headerAddressDetail = document.getElementById('header-address-detail');
const addressModal = document.getElementById('address-modal');
const addressOverlay = document.getElementById('address-overlay');
const closeAddressModalBtn = document.getElementById('close-address-modal');
const cartChangeAddressBtn = document.getElementById('cart-change-address-btn');
const cartAddressType = document.getElementById('cart-address-type');
const cartAddressDesc = document.getElementById('cart-address-desc');

const paymentModal = document.getElementById('payment-modal');
const paymentOverlay = document.getElementById('payment-overlay');
const closePaymentModalBtn = document.getElementById('close-payment-modal');
const confirmOrderBtn = document.getElementById('confirm-order-btn');
const paymentAmount = document.getElementById('payment-amount');

const addressListView = document.getElementById('address-list-view');
const addressFormView = document.getElementById('address-form-view');
const addNewAddressBtn = document.getElementById('add-new-address-btn');
const cancelAddressBtn = document.getElementById('cancel-address-btn');
const savedAddressesContainer = document.getElementById('saved-addresses-container');
const addressForm = document.getElementById('address-form');
const locateMeBtn = document.getElementById('locate-me-btn');
const gpsLoading = document.getElementById('gps-loading');

// Initialize
function init() {
  setTimeout(() => { loadingOverlay.style.opacity = '0'; setTimeout(() => loadingOverlay.style.display = 'none', 500); }, 500);
  renderCategories();
  renderProducts();
  updateCartUI();
  updateAddressUI();
}

// Render Core UI
function renderCategories() {
  categoryNav.innerHTML = '';
  menuData.forEach((cat, index) => {
    const link = document.createElement('a');
    link.className = `cat-link ${index === 0 ? 'active' : ''}`;
    link.textContent = cat.category;
    link.href = `#cat-${index}`;
    link.onclick = (e) => {
      document.querySelectorAll('.cat-link').forEach(l => l.classList.remove('active'));
      link.classList.add('active');
    };
    categoryNav.appendChild(link);
  });
}

function renderProducts() {
  mainContent.innerHTML = '';
  menuData.forEach((cat, index) => {
    const section = document.createElement('section');
    section.className = 'category-section';
    section.id = `cat-${index}`;
    
    // Header
    const header = document.createElement('div');
    header.className = 'section-header';
    header.innerHTML = `<h2>${cat.category}</h2><span class="see-all">See All</span>`;
    section.appendChild(header);

    // Grid
    const grid = document.createElement('div');
    grid.className = 'product-grid';
    
    cat.items.forEach(product => {
      const card = document.createElement('div');
      card.className = 'product-card';
      
      const hasDiscount = product.originalPrice && product.originalPrice > product.price;
      const discountText = hasDiscount ? `<div class="discount-tag">Save ₹${product.originalPrice - product.price}</div>` : '';
      const oldPriceHtml = hasDiscount ? `<span class="product-old-price">₹${product.originalPrice.toFixed(2)}</span>` : '';

      card.innerHTML = `
        <div class="product-info">
          <h3 class="product-name">${product.name}</h3>
          <div class="product-price-wrapper">
            <span class="product-price">₹${product.price.toFixed(2)}</span>
            ${oldPriceHtml}
          </div>
          ${discountText}
        </div>
        <div class="product-img-wrapper">
          <img src="${product.image}" loading="lazy" alt="${product.name}" class="product-img">
          <button class="product-add-btn" data-id="${product.id}">
            ADD <i class="ri-add-line"></i>
          </button>
        </div>
      `;
      grid.appendChild(card);
    });
    
    section.appendChild(grid);
    mainContent.appendChild(section);
  });

  document.querySelectorAll('.product-add-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = parseInt(e.currentTarget.getAttribute('data-id'));
      addToCart(id);
    });
  });
}

// Cart Logic
function addToCart(id) {
  const product = flatProducts.find(p => p.id === id);
  const existingItem = cart.find(item => item.id === id);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }
  
  saveCart();
  updateCartUI();
  showToast(`Added ${product.name} to cart!`);
  
  cartBtn.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.3)' }, { transform: 'scale(1)' }], { duration: 300 });
}

function updateQuantity(id, delta) {
  const itemIndex = cart.findIndex(item => item.id === id);
  if (itemIndex > -1) {
    cart[itemIndex].quantity += delta;
    if (cart[itemIndex].quantity <= 0) cart.splice(itemIndex, 1);
  }
  saveCart();
  updateCartUI();
}

function saveCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
}

function updateCartUI() {
  cartItemsContainer.innerHTML = '';
  let itemTotal = 0;
  let totalOriginal = 0;
  let count = 0;

  if (cart.length === 0) {
    cartItemsContainer.innerHTML = '<div class="empty-cart-msg">Your cart is empty. Let\'s add some late night bites!</div>';
    savingsBadge.classList.remove('active');
    cartDiscountRow.style.display = 'none';
    cartDeliveryRow.style.display = 'none';
    cartItemTotal.textContent = '₹0.00';
    cartTotalPrice.textContent = '₹0.00';
    cartCount.textContent = '0';
    return;
  }

  cart.forEach(item => {
    itemTotal += item.price * item.quantity;
    totalOriginal += (item.originalPrice || item.price) * item.quantity;
    count += item.quantity;

    const cartItem = document.createElement('div');
    cartItem.className = 'cart-item';
    cartItem.innerHTML = `
      <div class="cart-item-info">
        <span class="cart-item-name">${item.name}</span>
        <span class="cart-item-price">₹${item.price.toFixed(2)}</span>
      </div>
      <div class="qty-control">
        <button class="qty-btn minus" data-id="${item.id}">-</button>
        <span class="qty-val">${item.quantity}</span>
        <button class="qty-btn plus" data-id="${item.id}">+</button>
      </div>
      <div class="cart-item-total">₹${(item.price * item.quantity).toFixed(2)}</div>
    `;
    cartItemsContainer.appendChild(cartItem);
  });

  const savings = totalOriginal - itemTotal;
  const deliveryFee = 30;
  const finalTotal = itemTotal + deliveryFee;

  cartItemTotal.textContent = `₹${totalOriginal.toFixed(2)}`;
  if (savings > 0) {
    cartDiscountRow.style.display = 'flex';
    cartDiscount.textContent = `-₹${savings.toFixed(2)}`;
    savingsBadge.classList.add('active');
    savingsAmount.textContent = savings.toFixed(2);
  } else {
    cartDiscountRow.style.display = 'none';
    savingsBadge.classList.remove('active');
  }

  cartDeliveryRow.style.display = 'flex';
  cartDeliveryFee.textContent = `₹${deliveryFee.toFixed(2)}`;
  
  cartTotalPrice.textContent = `₹${finalTotal.toFixed(2)}`;
  cartTotalPrice.setAttribute('data-raw-total', finalTotal.toFixed(2));
  cartCount.textContent = count;

  document.querySelectorAll('.qty-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = parseInt(e.currentTarget.getAttribute('data-id'));
      const isPlus = e.currentTarget.classList.contains('plus');
      updateQuantity(id, isPlus ? 1 : -1);
    });
  });
}

function toggleCart() {
  const isOpen = cartSidebar.classList.contains('open');
  if (isOpen) {
    cartSidebar.classList.remove('open');
    cartOverlay.classList.remove('active');
  } else {
    cartSidebar.classList.add('open');
    cartOverlay.classList.add('active');
  }
}

cartBtn.addEventListener('click', toggleCart);
closeCartBtn.addEventListener('click', toggleCart);
cartOverlay.addEventListener('click', toggleCart);

// Payment Modal System
function togglePaymentModal() {
  const isOpen = paymentModal.classList.contains('open');
  if (isOpen) {
    paymentModal.classList.remove('open');
    paymentOverlay.classList.remove('active');
  } else {
    paymentAmount.textContent = cartTotalPrice.textContent;
    const rawTotal = cartTotalPrice.getAttribute('data-raw-total') || "0.00";
    
    // Dynamically generate the precise BharatPe UPI QR code embedded with the final total
    const upiString = `upi://pay?pa=BHARATPE.8M0N1P1A7N83378@fbpe&pn=JAJJARA VIKOTORIYA&am=${rawTotal}&cu=INR`;
    document.getElementById('payment-qr-img').src = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiString)}`;
    
    paymentModal.classList.add('open');
    paymentOverlay.classList.add('active');
  }
}

closePaymentModalBtn.addEventListener('click', togglePaymentModal);
paymentOverlay.addEventListener('click', togglePaymentModal);

// Toast System
function showToast(message) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  toastContainer.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('hide');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ---------------- ADDRESS SYSTEM ----------------

function toggleAddressModal() {
  const isOpen = addressModal.classList.contains('open');
  if (isOpen) {
    addressModal.classList.remove('open');
    addressOverlay.classList.remove('active');
    resetAddressForm();
  } else {
    renderAddressList();
    addressListView.classList.remove('hidden');
    addressFormView.classList.add('hidden');
    addressModal.classList.add('open');
    addressOverlay.classList.add('active');
  }
}

addressSelectorBtn.addEventListener('click', toggleAddressModal);
cartChangeAddressBtn.addEventListener('click', toggleAddressModal);
closeAddressModalBtn.addEventListener('click', toggleAddressModal);
addressOverlay.addEventListener('click', toggleAddressModal);

function saveAddresses() {
  localStorage.setItem('addresses', JSON.stringify(addresses));
}

function getSelectedAddress() {
  if (addresses.length === 0) return null;
  const match = addresses.find(a => a.id === selectedAddressId);
  if (match) return match;
  selectedAddressId = addresses[0].id;
  localStorage.setItem('selectedAddressId', selectedAddressId);
  return addresses[0];
}

function updateAddressUI() {
  const addr = getSelectedAddress();
  if (addr) {
    headerAddressType.textContent = addr.type;
    headerAddressDetail.textContent = `${addr.line}, ${addr.city}`;
    cartAddressType.textContent = addr.type;
    cartAddressDesc.textContent = `${addr.line}, ${addr.city}`;
  } else {
    headerAddressType.textContent = 'Location';
    headerAddressDetail.textContent = 'Select Delivery Location';
    cartAddressType.textContent = 'Location';
    cartAddressDesc.textContent = 'Please select a delivery address';
  }
}

function renderAddressList() {
  savedAddressesContainer.innerHTML = '';
  if (addresses.length === 0) {
    savedAddressesContainer.innerHTML = '<p style="text-align:center; color:gray; padding: 20px;">No saved addresses yet.</p>';
    return;
  }
  
  addresses.forEach(addr => {
    const isSelected = addr.id === selectedAddressId;
    const card = document.createElement('div');
    card.className = `saved-address-card ${isSelected ? 'selected' : ''}`;
    
    const icon = addr.type === 'Home' ? 'ri-home-4-fill' : (addr.type === 'Work' ? 'ri-building-4-fill' : 'ri-map-pin-fill');
    
    card.innerHTML = `
      <div class="sac-header">
        <div class="sac-type"><i class="${icon}"></i> ${addr.type}</div>
        <div class="sac-actions">
          <button class="delete-addr-btn" data-id="${addr.id}"><i class="ri-delete-bin-line"></i></button>
        </div>
      </div>
      <div class="sac-details">${addr.line}${addr.landmark ? ', Near ' + addr.landmark : ''}, ${addr.city} - ${addr.pincode}</div>
      <div class="sac-phone">${addr.name} | ${addr.phone}</div>
    `;
    
    card.addEventListener('click', (e) => {
      // Don't select if clicking delete
      if (e.target.closest('.delete-addr-btn')) return;
      selectedAddressId = addr.id;
      localStorage.setItem('selectedAddressId', addr.id);
      updateAddressUI();
      toggleAddressModal();
      showToast('Delivery address updated');
    });
    
    savedAddressesContainer.appendChild(card);
  });
  
  document.querySelectorAll('.delete-addr-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = e.currentTarget.getAttribute('data-id');
      addresses = addresses.filter(a => a.id !== id);
      if (selectedAddressId === id) selectedAddressId = null;
      saveAddresses();
      updateAddressUI();
      renderAddressList();
      showToast('Address deleted');
    });
  });
}

addNewAddressBtn.addEventListener('click', () => {
  addressListView.classList.add('hidden');
  addressFormView.classList.remove('hidden');
});

cancelAddressBtn.addEventListener('click', () => {
  addressFormView.classList.add('hidden');
  addressListView.classList.remove('hidden');
  resetAddressForm();
});

function resetAddressForm() {
  addressForm.reset();
  document.getElementById('addr-id').value = '';
}

addressForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const newAddr = {
    id: 'addr_' + Date.now(),
    name: document.getElementById('addr-name').value,
    phone: document.getElementById('addr-phone').value,
    line: document.getElementById('addr-line').value,
    landmark: document.getElementById('addr-landmark').value,
    city: document.getElementById('addr-city').value,
    pincode: document.getElementById('addr-pincode').value,
    type: document.querySelector('input[name="addr-type"]:checked').value
  };
  
  addresses.push(newAddr);
  selectedAddressId = newAddr.id;
  localStorage.setItem('selectedAddressId', newAddr.id);
  saveAddresses();
  
  resetAddressForm();
  updateAddressUI();
  toggleAddressModal();
  showToast('Address saved successfully!');
});

// GPS / Reverse Geocoding
locateMeBtn.addEventListener('click', () => {
  if (!navigator.geolocation) {
    showToast('Geolocation is not supported by your browser');
    return;
  }
  
  locateMeBtn.classList.add('hidden');
  gpsLoading.classList.remove('hidden');
  
  navigator.geolocation.getCurrentPosition(
    async (position) => {
      try {
        const { latitude, longitude } = position.coords;
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`);
        const data = await res.json();
        
        if (data && data.address) {
          const addr = data.address;
          const street = addr.road || addr.suburb || addr.neighbourhood || addr.residential || '';
          const city = addr.city || addr.town || addr.county || '';
          const pincode = addr.postcode || '';
          
          document.getElementById('addr-line').value = street;
          document.getElementById('addr-city').value = city;
          document.getElementById('addr-pincode').value = pincode;
          
          showToast('Location fetched! Please verify.');
        } else {
          showToast('Could not resolve physical address.');
        }
      } catch (err) {
        console.error(err);
        showToast('Failed to fetch address. Enter manually.');
      } finally {
        locateMeBtn.classList.remove('hidden');
        gpsLoading.classList.add('hidden');
      }
    },
    (error) => {
      console.warn(error);
      let errMsg = 'Unable to retrieve location.';
      if (error.code === 1) errMsg = 'Location permission denied by user.';
      else if (error.code === 2) errMsg = 'Device location provider unavailable.';
      else if (error.code === 3) errMsg = 'Location request timed out.';
      showToast(errMsg);
      locateMeBtn.classList.remove('hidden');
      gpsLoading.classList.add('hidden');
    },
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
  );
});

// Checkout Action
checkoutBtn.addEventListener('click', () => {
  if (cart.length === 0) {
    showToast('Your cart is empty!');
    return;
  }
  
  const addr = getSelectedAddress();
  if (!addr) {
    showToast('Please select a delivery address first!');
    toggleCart(); // Close cart
    toggleAddressModal(); // Open address modal
    return;
  }
  
  // Transition from Cart to Payment Modal
  toggleCart();
  togglePaymentModal();
});

// Confirm Order after Fake Payment
confirmOrderBtn.addEventListener('click', () => {
  const upiRefInput = document.getElementById('upi-ref');
  const upiError = document.getElementById('upi-error');
  
  if(upiRefInput.value.trim().length === 0) {
    upiError.style.display = 'block';
    return;
  }
  upiError.style.display = 'none';

  const addr = getSelectedAddress();
  
  let orderText = 'Hello Late Bites! 🍔\n\n*New Paid Order:*\n';
  cart.forEach(item => {
    orderText += `- ${item.quantity}x ${item.name} (₹${(item.price * item.quantity).toFixed(2)})\n`;
  });
  
  orderText += `\n*Delivery Fee:* ₹30.00\n`;
  orderText += `*Total Paid:* ${cartTotalPrice.textContent}\n`;
  orderText += `*UPI Ref ID:* ${upiRefInput.value.trim()}\n`;
  if(savingsAmount.textContent !== "0") {
    orderText += `*(Saved ₹${savingsAmount.textContent}!)*\n`;
  }
  
  orderText += `\n*Delivery & Contact Details:*\nName: ${addr.name}\nPhone: ${addr.phone}\nAddress: ${addr.line}`;
  if(addr.landmark) orderText += `, Near ${addr.landmark}`;
  orderText += `\n${addr.city} - Pincode: ${addr.pincode}\nType: ${addr.type}`;

  // Redirect to new number via WhatsApp using robust URL Encoding structure for full mobile compatibility
  const whatsappLink = `https://api.whatsapp.com/send?phone=916304034196&text=${encodeURIComponent(orderText)}`;
  window.open(whatsappLink, '_blank');
  
  // Clear cart and close modal
  cart = [];
  saveCart();
  updateCartUI();
  togglePaymentModal();
  showToast('Order Sent! We will contact you shortly.');
});

// Run Init
init();
