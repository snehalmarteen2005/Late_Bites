import './style.css';

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

// State
let menuData = JSON.parse(localStorage.getItem('menuData')) || [];
let storeConfig = JSON.parse(localStorage.getItem('storeConfig')) || { deliveryFee: 30 };
let currentEditId = null;

// Auth
loginBtn.addEventListener('click', () => {
  if (adminPass.value === 'admin123') {
    loginScreen.style.display = 'none';
    dashboardScreen.style.display = 'block';
    initDashboard();
  } else {
    alert('Incorrect Password');
  }
});

function initDashboard() {
  deliveryFeeInput.value = storeConfig.deliveryFee;
  renderTable();
  updateCategoriesDatalist();
}

// Settings
saveFeeBtn.addEventListener('click', () => {
  storeConfig.deliveryFee = parseFloat(deliveryFeeInput.value) || 0;
  localStorage.setItem('storeConfig', JSON.stringify(storeConfig));
  alert('Delivery Fee Saved!');
});

// Table Render
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

  // Attach listeners
  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', handleDelete);
  });
  document.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', handleEdit);
  });
  document.querySelectorAll('.toggle-btn').forEach(btn => {
    btn.addEventListener('click', handleToggle);
  });
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
    if(item) {
      item.disabled = !item.disabled;
    }
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
    // Clean up empty categories
    menuData = menuData.filter(cat => cat.items.length > 0);
    saveMenuData();
    renderTable();
  }
}

// Save
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
    id: currentEditId || Date.now(), // Unique ID
    name, price, originalPrice, image: imageUrl
  };

  let existingDisabled = false;
  // If edit, remove old instance first
  if (currentEditId) {
    menuData.forEach(cat => {
      const idx = cat.items.findIndex(i => i.id === currentEditId);
      if(idx > -1) {
        // Keep old image if a new one wasn't provided
        if(!imageUrl) itemDetails.image = cat.items[idx].image;
        existingDisabled = cat.items[idx].disabled || false;
        cat.items.splice(idx, 1);
      }
    });
  }

  itemDetails.disabled = existingDisabled;

  // Find or create category
  let catObj = menuData.find(cat => cat.category.toLowerCase() === category.toLowerCase());
  if (!catObj) {
    catObj = { category: category, items: [] };
    menuData.push(catObj);
  }
  
  catObj.items.push(itemDetails);

  // Clean empty categories
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
