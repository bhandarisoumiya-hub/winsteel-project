let db = { projects: [], products: [], stats: {} };

// On DOM load
document.addEventListener('DOMContentLoaded', () => {
  fetchDatabase();
  setupNavigation();
  
  // Generate button listener
  document.getElementById('btn-generate').addEventListener('click', triggerStaticGeneration);
});

// Navigation logic
function setupNavigation() {
  const navItems = document.querySelectorAll('.nav-links li');
  const switchTabs = document.querySelectorAll('.switch-tab');
  
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const tab = item.getAttribute('data-tab');
      switchTab(tab);
    });
  });

  switchTabs.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-target');
      switchTab(target);
    });
  });
}

function switchTab(tabId) {
  document.querySelectorAll('.nav-links li').forEach(li => li.classList.remove('active'));
  document.querySelector(`.nav-links li[data-tab="${tabId}"]`).classList.add('active');
  
  document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.add('hidden'));
  document.getElementById(`tab-${tabId}`).classList.remove('hidden');
  
  const titles = {
    dashboard: 'Dashboard Overview',
    projects: 'Projects Management',
    products: 'Products & Equipment Management',
    stats: 'Company Highlights & Statistics'
  };
  document.getElementById('page-heading').textContent = titles[tabId] || 'Dashboard';
}

// Fetch complete database
async function fetchDatabase() {
  try {
    const res = await fetch('/api/db');
    db = await res.json();
    renderAll();
  } catch (err) {
    showToast('Failed to load database. Ensure local server is running.', true);
  }
}

function renderAll() {
  // Update counts
  document.getElementById('count-projects').textContent = db.projects.length;
  document.getElementById('count-products').textContent = db.products.length;
  
  renderRecent();
  renderProjectsTable();
  renderProductsTable();
  populateStatsForm();
}

function renderRecent() {
  const projList = document.getElementById('recent-projects-list');
  const prodList = document.getElementById('recent-products-list');
  
  projList.innerHTML = db.projects.slice(0, 3).map(p => `
    <div class="list-item">
      <img src="${p.image}" alt="${p.title}">
      <div class="list-item-info">
        <h4>${p.title}</h4>
        <span>${p.category} • ${p.client || 'Winsteel'}</span>
      </div>
    </div>
  `).join('');

  prodList.innerHTML = db.products.slice(0, 3).map(p => `
    <div class="list-item">
      <img src="${p.image}" alt="${p.name}">
      <div class="list-item-info">
        <h4>${p.name}</h4>
        <span>${p.category}</span>
      </div>
    </div>
  `).join('');
}

function renderProjectsTable() {
  const tbody = document.getElementById('projects-table-body');
  tbody.innerHTML = db.projects.map(p => `
    <tr>
      <td><img src="${p.image}" alt="${p.title}"></td>
      <td><strong>${p.title}</strong></td>
      <td><span style="background: rgba(56,189,248,0.15); color: #38bdf8; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 600;">${p.category}</span></td>
      <td>${p.client || '-'} <br><small style="color: #94a3b8;">${p.location || ''}</small></td>
      <td>${p.year || ''}</td>
      <td>
        <div class="action-btns">
          <button class="btn-icon" onclick="editProject('${p.id}')"><i class="fa-solid fa-pen"></i></button>
          <button class="btn-icon delete" onclick="deleteProject('${p.id}')"><i class="fa-solid fa-trash"></i></button>
        </div>
      </td>
    </tr>
  `).join('');
}

function renderProductsTable() {
  const tbody = document.getElementById('products-table-body');
  tbody.innerHTML = db.products.map(p => `
    <tr>
      <td><img src="${p.image}" alt="${p.name}"></td>
      <td><strong>${p.name}</strong></td>
      <td><span style="background: rgba(251,191,36,0.15); color: #fbbf24; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 600;">${p.category}</span></td>
      <td>${p.tagline || '-'}</td>
      <td>
        <div class="action-btns">
          <button class="btn-icon" onclick="editProduct('${p.id}')"><i class="fa-solid fa-pen"></i></button>
          <button class="btn-icon delete" onclick="deleteProduct('${p.id}')"><i class="fa-solid fa-trash"></i></button>
        </div>
      </td>
    </tr>
  `).join('');
}

function populateStatsForm() {
  if (!db.stats) return;
  document.getElementById('stat-years').value = db.stats.yearsExperience || 52;
  document.getElementById('stat-workers').value = db.stats.skilledWorkers || '550+';
  document.getElementById('stat-plot').value = db.stats.plotAreaSqFt || '324,000';
  document.getElementById('stat-covered').value = db.stats.coveredAreaSqFt || '237,000';
  document.getElementById('stat-cranes').value = db.stats.overheadCranes || '45+';
  document.getElementById('stat-capacity').value = db.stats.annualCapacityMT || '15,000 - 18,000';
}

// Trigger Static Site Generation
async function triggerStaticGeneration() {
  const btn = document.getElementById('btn-generate');
  const origText = btn.innerHTML;
  btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Generating Static Site...`;
  btn.disabled = true;

  try {
    const res = await fetch('/api/generate', { method: 'POST' });
    const data = await res.json();
    
    if (res.ok) {
      showToast('⚡ Static Website Generated successfully! Ready for standalone deployment.');
    } else {
      showToast(data.error || 'Generation failed', true);
    }
  } catch (err) {
    showToast('Failed to trigger generation.', true);
  } finally {
    btn.innerHTML = origText;
    btn.disabled = false;
  }
}

// Project Modal Actions
function openProjectModal(id = null) {
  document.getElementById('form-project').reset();
  if (id) {
    const p = db.projects.find(i => i.id === id);
    document.getElementById('modal-project-title').textContent = 'Edit Project';
    document.getElementById('project-id').value = p.id;
    document.getElementById('project-title').value = p.title;
    document.getElementById('project-category').value = p.category;
    document.getElementById('project-client').value = p.client || '';
    document.getElementById('project-location').value = p.location || '';
    document.getElementById('project-year').value = p.year || '';
    document.getElementById('project-image').value = p.image || '';
    document.getElementById('project-specs').value = p.specs || '';
    document.getElementById('project-description').value = p.description || '';
  } else {
    document.getElementById('modal-project-title').textContent = 'Add New Project';
    document.getElementById('project-id').value = '';
    document.getElementById('project-year').value = new Date().getFullYear();
  }
  document.getElementById('modal-project').classList.remove('hidden');
}

function editProject(id) { openProjectModal(id); }

async function saveProject(e) {
  e.preventDefault();
  const id = document.getElementById('project-id').value;
  const payload = {
    title: document.getElementById('project-title').value,
    category: document.getElementById('project-category').value,
    client: document.getElementById('project-client').value,
    location: document.getElementById('project-location').value,
    year: document.getElementById('project-year').value,
    image: document.getElementById('project-image').value,
    specs: document.getElementById('project-specs').value,
    description: document.getElementById('project-description').value
  };

  const url = id ? `/api/projects/${id}` : '/api/projects';
  const method = id ? 'PUT' : 'POST';

  try {
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      showToast(`Project ${id ? 'updated' : 'added'} successfully! Remember to click Generate to publish.`);
      closeModal('modal-project');
      fetchDatabase();
    }
  } catch (err) {
    showToast('Error saving project', true);
  }
}

async function deleteProject(id) {
  if (!confirm('Are you sure you want to delete this project?')) return;
  try {
    const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' });
    if (res.ok) {
      showToast('Project deleted successfully! Remember to click Generate to publish.');
      fetchDatabase();
    }
  } catch (err) {
    showToast('Error deleting project', true);
  }
}

// Product Modal Actions
function openProductModal(id = null) {
  document.getElementById('form-product').reset();
  if (id) {
    const p = db.products.find(i => i.id === id);
    document.getElementById('modal-product-title').textContent = 'Edit Product';
    document.getElementById('product-id').value = p.id;
    document.getElementById('product-name').value = p.name;
    document.getElementById('product-category').value = p.category;
    document.getElementById('product-tagline').value = p.tagline || '';
    document.getElementById('product-image').value = p.image || '';
    document.getElementById('product-description').value = p.description || '';
    document.getElementById('product-features').value = Array.isArray(p.features) ? p.features.join('\n') : '';
  } else {
    document.getElementById('modal-product-title').textContent = 'Add New Product';
    document.getElementById('product-id').value = '';
  }
  document.getElementById('modal-product').classList.remove('hidden');
}

function editProduct(id) { openProductModal(id); }

async function saveProduct(e) {
  e.preventDefault();
  const id = document.getElementById('product-id').value;
  const payload = {
    name: document.getElementById('product-name').value,
    category: document.getElementById('product-category').value,
    tagline: document.getElementById('product-tagline').value,
    image: document.getElementById('product-image').value,
    description: document.getElementById('product-description').value,
    features: document.getElementById('product-features').value
  };

  const url = id ? `/api/products/${id}` : '/api/products';
  const method = id ? 'PUT' : 'POST';

  try {
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      showToast(`Product ${id ? 'updated' : 'added'} successfully! Remember to click Generate to publish.`);
      closeModal('modal-product');
      fetchDatabase();
    }
  } catch (err) {
    showToast('Error saving product', true);
  }
}

async function deleteProduct(id) {
  if (!confirm('Are you sure you want to delete this product?')) return;
  try {
    const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
    if (res.ok) {
      showToast('Product deleted successfully! Remember to click Generate to publish.');
      fetchDatabase();
    }
  } catch (err) {
    showToast('Error deleting product', true);
  }
}

// Save Stats
async function saveStats(e) {
  e.preventDefault();
  const payload = {
    yearsExperience: Number(document.getElementById('stat-years').value),
    skilledWorkers: document.getElementById('stat-workers').value,
    plotAreaSqFt: document.getElementById('stat-plot').value,
    coveredAreaSqFt: document.getElementById('stat-covered').value,
    overheadCranes: document.getElementById('stat-cranes').value,
    annualCapacityMT: document.getElementById('stat-capacity').value
  };

  try {
    const res = await fetch('/api/stats', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      showToast('Company statistics saved! Click Generate to update static site.');
      fetchDatabase();
    }
  } catch (err) {
    showToast('Error saving statistics', true);
  }
}

function closeModal(modalId) {
  document.getElementById(modalId).classList.add('hidden');
}

function showToast(message, isError = false) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = `toast ${isError ? 'error' : ''}`;
  setTimeout(() => toast.classList.add('hidden'), 4000);
}
