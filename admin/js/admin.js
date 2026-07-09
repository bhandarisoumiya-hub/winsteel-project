const API_BASE = (typeof window !== 'undefined' && (window.location.port === '4000' || window.location.port === '4001')) ? '' : 'http://localhost:4000';

let db = {
  projects: [],
  products: [],
  facilities: [],
  strengths: [],
  process: [],
  testimonials: [],
  news: [],
  hero: {},
  about: {},
  stats: {},
  companyInfo: {}
};

// On DOM load
document.addEventListener('DOMContentLoaded', () => {
  fetchDatabase();
  setupNavigation();
  
  // Generate button listener
  const btnGen = document.getElementById('btn-generate');
  if (btnGen) {
    btnGen.addEventListener('click', triggerStaticGeneration);
  }
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
  const activeLi = document.querySelector(`.nav-links li[data-tab="${tabId}"]`);
  if (activeLi) activeLi.classList.add('active');
  
  document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.add('hidden'));
  const targetPane = document.getElementById(`tab-${tabId}`);
  if (targetPane) targetPane.classList.remove('hidden');
  
  const titles = {
    dashboard: 'Dashboard Overview',
    hero: 'Homepage Hero Banner & Branding',
    about: 'Company Heritage & Technical Partner',
    stats: 'Company Highlights & Statistics',
    strengths: 'Core Strengths & Advantages',
    facilities: 'Manufacturing Facilities & Capabilities',
    process: 'Delivery Process Workflow',
    products: 'Products & Equipment Management',
    projects: 'Infrastructure Projects Management',
    testimonials: 'Client Testimonials & Endorsements',
    news: 'Industry Insights & News Articles'
  };
  const heading = document.getElementById('page-heading');
  if (heading) heading.textContent = titles[tabId] || 'Dashboard';
}

// Fetch complete database
async function fetchDatabase() {
  try {
    const res = await fetch(API_BASE + '/api/data');
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    db = await res.json();
    renderAll();
  } catch (err) {
    showToast('Failed to load database from server. Ensure the local Express server is running on port 4000 (npm start).', true);
  }
}

// Save complete database back to server
async function saveDatabase(customMsg = 'Database updated and offline static site regenerated!') {
  try {
    const res = await fetch(API_BASE + '/api/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(db)
    });
    if (!res.ok) {
      const errText = await res.text();
      let errMsg = 'Failed to save database';
      try { errMsg = JSON.parse(errText).error || errMsg; } catch(e) {}
      throw new Error(errMsg);
    }
    const data = await res.json();
    showToast(customMsg);
    renderAll();
  } catch (err) {
    showToast('Failed to save to server: ' + err.message, true);
  }
}

// Render all tabs and tables
function renderAll() {
  // Update counts
  if (document.getElementById('count-projects')) document.getElementById('count-projects').textContent = (db.projects || []).length;
  if (document.getElementById('count-products')) document.getElementById('count-products').textContent = (db.products || []).length;
  if (document.getElementById('count-facilities')) document.getElementById('count-facilities').textContent = (db.facilities || []).length;
  if (document.getElementById('count-strengths')) document.getElementById('count-strengths').textContent = (db.strengths || []).length;
  
  renderRecent();
  populateHeroForm();
  populateAboutForm();
  populateStatsForm();
  renderStrengthsTable();
  renderFacilitiesTable();
  renderProcessTable();
  renderProductsTable();
  renderProjectsTable();
  renderTestimonialsTable();
  renderNewsTable();
}

function renderRecent() {
  const projList = document.getElementById('recent-projects-list');
  const prodList = document.getElementById('recent-products-list');
  
  if (projList) {
    projList.innerHTML = (db.projects || []).slice(0, 3).map(p => `
      <div class="list-item">
        <img src="${p.image}" alt="${p.title}" onerror="this.src='https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=100'">
        <div class="list-item-info">
          <h4>${p.title}</h4>
          <span>${p.category} • ${p.client || 'Winsteel'}</span>
        </div>
      </div>
    `).join('');
  }

  if (prodList) {
    prodList.innerHTML = (db.products || []).slice(0, 3).map(p => `
      <div class="list-item">
        <img src="${p.image}" alt="${p.name}" onerror="this.src='https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=100'">
        <div class="list-item-info">
          <h4>${p.name}</h4>
          <span>${p.category}</span>
        </div>
      </div>
    `).join('');
  }
}

// IMAGE UPLOAD HANDLER
async function handleImageUpload(inputElem, targetInputId, previewImgId) {
  const file = inputElem.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async (e) => {
    const dataUrl = e.target.result;
    showToast('⏳ Uploading image file to server database...');
    try {
      const res = await fetch(API_BASE + '/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: file.name, dataUrl })
      });
      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}. Please make sure the backend server is running on port 4000.`);
      }
      const data = await res.json();
      if (data.url) {
        document.getElementById(targetInputId).value = data.url;
        if (targetInputId === 'product-image') {
          const textarea = document.getElementById('product-images');
          if (textarea) {
            const currentLines = textarea.value.trim().split('\n').filter(l => l.trim().length > 0);
            if (currentLines.length > 0) {
              currentLines[0] = data.url;
            } else {
              currentLines.push(data.url);
            }
            textarea.value = currentLines.join('\n');
          }
        }
        const preview = document.getElementById(previewImgId);
        if (preview) {
          preview.src = data.url;
          preview.style.display = 'block';
        }
        showToast('✅ Image uploaded & saved to database successfully!');
      } else {
        showToast(data.error || 'Upload failed', true);
      }
    } catch (err) {
      showToast('Upload error: ' + err.message + '. Ensure the local server is started (npm start) on port 4000.', true);
    }
  };
  reader.readAsDataURL(file);
}

// ==========================================
// HERO BANNER HANDLERS
// ==========================================
function populateHeroForm() {
  const h = db.hero || {};
  if (document.getElementById('hero-title')) document.getElementById('hero-title').value = h.title || '';
  if (document.getElementById('hero-subtitle')) document.getElementById('hero-subtitle').value = h.subtitle || '';
  if (document.getElementById('hero-badge')) document.getElementById('hero-badge').value = h.badgeText || '';
  if (document.getElementById('hero-bg')) document.getElementById('hero-bg').value = h.bgImage || '';
  if (document.getElementById('hero-cta1-text')) document.getElementById('hero-cta1-text').value = h.cta1Text || '';
  if (document.getElementById('hero-cta1-link')) document.getElementById('hero-cta1-link').value = h.cta1Link || '';
  if (document.getElementById('hero-cta2-text')) document.getElementById('hero-cta2-text').value = h.cta2Text || '';
  if (document.getElementById('hero-cta2-link')) document.getElementById('hero-cta2-link').value = h.cta2Link || '';
  
  const preview = document.getElementById('hero-preview');
  if (preview && h.bgImage) {
    preview.src = h.bgImage;
    preview.style.display = 'block';
  }
}

function saveHero(e) {
  e.preventDefault();
  db.hero = {
    title: document.getElementById('hero-title').value,
    subtitle: document.getElementById('hero-subtitle').value,
    badgeText: document.getElementById('hero-badge').value,
    bgImage: document.getElementById('hero-bg').value,
    cta1Text: document.getElementById('hero-cta1-text').value,
    cta1Link: document.getElementById('hero-cta1-link').value,
    cta2Text: document.getElementById('hero-cta2-text').value,
    cta2Link: document.getElementById('hero-cta2-link').value
  };
  saveDatabase('🎉 Homepage Hero Banner updated successfully!');
}

// ==========================================
// ABOUT & PARTNER HANDLERS
// ==========================================
function populateAboutForm() {
  const a = db.about || {};
  if (document.getElementById('about-title')) document.getElementById('about-title').value = a.title || '';
  if (document.getElementById('about-subtitle')) document.getElementById('about-subtitle').value = a.subtitle || '';
  if (document.getElementById('about-desc')) document.getElementById('about-desc').value = a.description || '';
  if (document.getElementById('about-image')) document.getElementById('about-image').value = a.image || '';
  if (document.getElementById('about-partner-name')) document.getElementById('about-partner-name').value = a.partnerName || '';
  if (document.getElementById('about-partner-web')) document.getElementById('about-partner-web').value = a.partnerWebsite || '';
  if (document.getElementById('about-partner-desc')) document.getElementById('about-partner-desc').value = a.partnerDesc || '';
  
  const preview = document.getElementById('about-preview');
  if (preview && a.image) {
    preview.src = a.image;
    preview.style.display = 'block';
  }
}

function saveAbout(e) {
  e.preventDefault();
  db.about = {
    title: document.getElementById('about-title').value,
    subtitle: document.getElementById('about-subtitle').value,
    description: document.getElementById('about-desc').value,
    image: document.getElementById('about-image').value,
    partnerName: document.getElementById('about-partner-name').value,
    partnerWebsite: document.getElementById('about-partner-web').value,
    partnerDesc: document.getElementById('about-partner-desc').value
  };
  saveDatabase('🎉 Company Heritage & Technical Partner info saved!');
}

// ==========================================
// COMPANY STATS HANDLERS
// ==========================================
function populateStatsForm() {
  const s = db.stats || {};
  if (document.getElementById('stat-years')) document.getElementById('stat-years').value = s.yearsExperience || 52;
  if (document.getElementById('stat-workers')) document.getElementById('stat-workers').value = s.skilledWorkers || '550+';
  if (document.getElementById('stat-plot')) document.getElementById('stat-plot').value = s.plotAreaSqFt || '324,000';
  if (document.getElementById('stat-covered')) document.getElementById('stat-covered').value = s.coveredAreaSqFt || '237,000';
  if (document.getElementById('stat-cranes')) document.getElementById('stat-cranes').value = s.overheadCranes || '45+';
  if (document.getElementById('stat-capacity')) document.getElementById('stat-capacity').value = s.annualCapacityMT || '15,000 - 18,000';
}

function saveStats(e) {
  e.preventDefault();
  db.stats = {
    yearsExperience: +document.getElementById('stat-years').value || 52,
    skilledWorkers: document.getElementById('stat-workers').value,
    plotAreaSqFt: document.getElementById('stat-plot').value,
    coveredAreaSqFt: document.getElementById('stat-covered').value,
    overheadCranes: document.getElementById('stat-cranes').value,
    annualCapacityMT: document.getElementById('stat-capacity').value
  };
  saveDatabase('📊 Company statistics updated!');
}

// ==========================================
// CORE STRENGTHS HANDLERS
// ==========================================
function renderStrengthsTable() {
  const tbody = document.getElementById('strengths-table-body');
  if (!tbody) return;
  tbody.innerHTML = (db.strengths || []).map(s => `
    <tr>
      <td><strong>${s.title}</strong></td>
      <td>${s.description}</td>
      <td>
        <div class="action-btns">
          <button class="btn-icon" onclick="editStrength('${s.id}')"><i class="fa-solid fa-pen"></i></button>
          <button class="btn-icon delete" onclick="deleteStrength('${s.id}')"><i class="fa-solid fa-trash"></i></button>
        </div>
      </td>
    </tr>
  `).join('');
}

function openStrengthModal(id = null) {
  document.getElementById('form-strength').reset();
  if (id) {
    const s = (db.strengths || []).find(item => item.id === id);
    if (!s) return;
    document.getElementById('modal-strength-title').textContent = 'Edit Core Strength';
    document.getElementById('strength-id').value = s.id;
    document.getElementById('strength-title').value = s.title;
    document.getElementById('strength-description').value = s.description;
  } else {
    document.getElementById('modal-strength-title').textContent = 'Add Core Strength';
    document.getElementById('strength-id').value = '';
  }
  document.getElementById('modal-strength').classList.remove('hidden');
}

function editStrength(id) { openStrengthModal(id); }

function deleteStrength(id) {
  if (confirm('Are you sure you want to delete this core strength?')) {
    db.strengths = db.strengths.filter(item => item.id !== id);
    saveDatabase('Strength deleted');
  }
}

function saveStrength(e) {
  e.preventDefault();
  const id = document.getElementById('strength-id').value;
  const item = {
    id: id || 'str_' + Date.now(),
    title: document.getElementById('strength-title').value,
    description: document.getElementById('strength-description').value
  };

  if (!db.strengths) db.strengths = [];
  if (id) {
    const idx = db.strengths.findIndex(i => i.id === id);
    if (idx !== -1) db.strengths[idx] = item;
  } else {
    db.strengths.push(item);
  }
  closeModal('strength');
  saveDatabase('Core strength saved!');
}

// ==========================================
// FACILITIES HANDLERS
// ==========================================
function renderFacilitiesTable() {
  const tbody = document.getElementById('facilities-table-body');
  if (!tbody) return;
  tbody.innerHTML = (db.facilities || []).map(f => `
    <tr>
      <td><img src="${f.image}" alt="${f.title}" onerror="this.src='https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=100'"></td>
      <td><strong>${f.title}</strong></td>
      <td><span style="color: #38bdf8; font-weight: 600;">${f.subtitle || ''}</span></td>
      <td>${f.description ? f.description.slice(0, 80) + '...' : ''}</td>
      <td>
        <div class="action-btns">
          <button class="btn-icon" onclick="editFacility('${f.id}')"><i class="fa-solid fa-pen"></i></button>
          <button class="btn-icon delete" onclick="deleteFacility('${f.id}')"><i class="fa-solid fa-trash"></i></button>
        </div>
      </td>
    </tr>
  `).join('');
}

function openFacilityModal(id = null) {
  document.getElementById('form-facility').reset();
  const preview = document.getElementById('facility-preview');
  if (preview) preview.style.display = 'none';

  if (id) {
    const f = (db.facilities || []).find(item => item.id === id);
    if (!f) return;
    document.getElementById('modal-facility-title').textContent = 'Edit Facility';
    document.getElementById('facility-id').value = f.id;
    document.getElementById('facility-title').value = f.title;
    document.getElementById('facility-subtitle').value = f.subtitle || '';
    document.getElementById('facility-image').value = f.image || '';
    document.getElementById('facility-description').value = f.description || '';
    if (preview && f.image) { preview.src = f.image; preview.style.display = 'block'; }
  } else {
    document.getElementById('modal-facility-title').textContent = 'Add New Facility';
    document.getElementById('facility-id').value = '';
  }
  document.getElementById('modal-facility').classList.remove('hidden');
}

function editFacility(id) { openFacilityModal(id); }

function deleteFacility(id) {
  if (confirm('Are you sure you want to delete this facility?')) {
    db.facilities = db.facilities.filter(item => item.id !== id);
    saveDatabase('Facility deleted');
  }
}

function saveFacility(e) {
  e.preventDefault();
  const id = document.getElementById('facility-id').value;
  const item = {
    id: id || 'fac_' + Date.now(),
    title: document.getElementById('facility-title').value,
    subtitle: document.getElementById('facility-subtitle').value,
    image: document.getElementById('facility-image').value,
    description: document.getElementById('facility-description').value
  };

  if (!db.facilities) db.facilities = [];
  if (id) {
    const idx = db.facilities.findIndex(i => i.id === id);
    if (idx !== -1) db.facilities[idx] = item;
  } else {
    db.facilities.push(item);
  }
  closeModal('facility');
  saveDatabase('Facility saved!');
}

// ==========================================
// PROCESS WORKFLOW HANDLERS
// ==========================================
function renderProcessTable() {
  const tbody = document.getElementById('process-table-body');
  if (!tbody) return;
  tbody.innerHTML = (db.process || []).map(p => `
    <tr>
      <td><span style="background: rgba(56,189,248,0.2); color: #38bdf8; padding: 4px 10px; border-radius: 6px; font-weight: 800;">${p.step}</span></td>
      <td><strong>${p.title}</strong></td>
      <td>${p.description}</td>
      <td><code><i class="fa-solid ${p.icon || 'fa-check'}"></i> ${p.icon || ''}</code></td>
      <td>
        <div class="action-btns">
          <button class="btn-icon" onclick="editProcess('${p.id}')"><i class="fa-solid fa-pen"></i></button>
          <button class="btn-icon delete" onclick="deleteProcess('${p.id}')"><i class="fa-solid fa-trash"></i></button>
        </div>
      </td>
    </tr>
  `).join('');
}

function openProcessModal(id = null) {
  document.getElementById('form-process').reset();
  if (id) {
    const p = (db.process || []).find(item => item.id === id);
    if (!p) return;
    document.getElementById('modal-process-title').textContent = 'Edit Process Step';
    document.getElementById('process-id').value = p.id;
    document.getElementById('process-step').value = p.step || '';
    document.getElementById('process-title').value = p.title || '';
    document.getElementById('process-icon').value = p.icon || '';
    document.getElementById('process-description').value = p.description || '';
  } else {
    document.getElementById('modal-process-title').textContent = 'Add Process Step';
    document.getElementById('process-id').value = '';
    document.getElementById('process-step').value = '0' + ((db.process || []).length + 1);
  }
  document.getElementById('modal-process').classList.remove('hidden');
}

function editProcess(id) { openProcessModal(id); }

function deleteProcess(id) {
  if (confirm('Are you sure you want to delete this process step?')) {
    db.process = db.process.filter(item => item.id !== id);
    saveDatabase('Process step deleted');
  }
}

function saveProcess(e) {
  e.preventDefault();
  const id = document.getElementById('process-id').value;
  const item = {
    id: id || 'proc_' + Date.now(),
    step: document.getElementById('process-step').value,
    title: document.getElementById('process-title').value,
    icon: document.getElementById('process-icon').value || 'fa-check',
    description: document.getElementById('process-description').value
  };

  if (!db.process) db.process = [];
  if (id) {
    const idx = db.process.findIndex(i => i.id === id);
    if (idx !== -1) db.process[idx] = item;
  } else {
    db.process.push(item);
  }
  closeModal('process');
  saveDatabase('Process workflow step saved!');
}

// ==========================================
// PRODUCTS HANDLERS
// ==========================================
function renderProductsTable() {
  const tbody = document.getElementById('products-table-body');
  if (!tbody) return;
  tbody.innerHTML = (db.products || []).map(p => `
    <tr>
      <td><img src="${p.image}" alt="${p.name}" onerror="this.src='https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=100'"></td>
      <td><strong>${p.name}</strong></td>
      <td><span style="background: rgba(251,191,36,0.15); color: #fbbf24; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 600;">${p.item || p.category || ''}</span></td>
      <td>${p.client || '-'} <br><small style="color: #94a3b8;">${p.year || ''}</small></td>
      <td>
        <div class="action-btns">
          <button class="btn-icon" onclick="editProduct('${p.id}')"><i class="fa-solid fa-pen"></i></button>
          <button class="btn-icon delete" onclick="deleteProduct('${p.id}')"><i class="fa-solid fa-trash"></i></button>
        </div>
      </td>
    </tr>
  `).join('');
}

function openProductModal(id = null) {
  document.getElementById('form-product').reset();
  const preview = document.getElementById('product-preview');
  if (preview) preview.style.display = 'none';

  if (id) {
    const p = (db.products || []).find(item => item.id === id);
    if (!p) return;
    document.getElementById('modal-product-title').textContent = 'Edit Product';
    document.getElementById('product-id').value = p.id;
    document.getElementById('product-name').value = p.name || '';
    document.getElementById('product-item').value = p.item || p.category || '';
    document.getElementById('product-client').value = p.client || '';
    document.getElementById('product-year').value = p.year || '';
    document.getElementById('product-image').value = p.image || '';
    document.getElementById('product-description').value = p.description || '';
    if (preview && p.image) { preview.src = p.image; preview.style.display = 'block'; }
  } else {
    document.getElementById('modal-product-title').textContent = 'Add New Product';
    document.getElementById('product-id').value = '';
    document.getElementById('product-year').value = new Date().getFullYear();
  }
  document.getElementById('modal-product').classList.remove('hidden');
}

function editProduct(id) { openProductModal(id); }

function deleteProduct(id) {
  if (confirm('Are you sure you want to delete this equipment/product?')) {
    db.products = db.products.filter(item => item.id !== id);
    saveDatabase('Product deleted');
  }
}

function saveProduct(e) {
  e.preventDefault();
  const id = document.getElementById('product-id').value;
  const coverImage = document.getElementById('product-image').value || '';

  const item = {
    id: id || 'prod_' + Date.now(),
    name: document.getElementById('product-name').value,
    category: document.getElementById('product-item').value,
    item: document.getElementById('product-item').value,
    tagline: 'Heavy-Duty Engineering Equipment',
    image: coverImage,
    images: [coverImage],
    features: ['CNC Precision Machining', 'Robotic Welded Steel Joints', 'Hydraulic Load Tested', 'Easy Site Assembly & Reusability'],
    description: document.getElementById('product-description').value,
    client: document.getElementById('product-client').value,
    year: document.getElementById('product-year').value,
    featured: true
  };

  if (!db.products) db.products = [];
  if (id) {
    const idx = db.products.findIndex(i => i.id === id);
    if (idx !== -1) db.products[idx] = item;
  } else {
    db.products.push(item);
  }
  closeModal('product');
  saveDatabase('Equipment product saved!');
}

// ==========================================
// PROJECTS HANDLERS
// ==========================================
function renderProjectsTable() {
  const tbody = document.getElementById('projects-table-body');
  if (!tbody) return;
  tbody.innerHTML = (db.projects || []).map(p => `
    <tr>
      <td><img src="${p.image}" alt="${p.title}" onerror="this.src='https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=100'"></td>
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

function openProjectModal(id = null) {
  document.getElementById('form-project').reset();
  const preview = document.getElementById('project-preview');
  if (preview) preview.style.display = 'none';

  if (id) {
    const p = (db.projects || []).find(item => item.id === id);
    if (!p) return;
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
    if (preview && p.image) { preview.src = p.image; preview.style.display = 'block'; }
  } else {
    document.getElementById('modal-project-title').textContent = 'Add New Project';
    document.getElementById('project-id').value = '';
    document.getElementById('project-year').value = new Date().getFullYear();
  }
  document.getElementById('modal-project').classList.remove('hidden');
}

function editProject(id) { openProjectModal(id); }

function deleteProject(id) {
  if (confirm('Are you sure you want to delete this infrastructure project?')) {
    db.projects = db.projects.filter(item => item.id !== id);
    saveDatabase('Project deleted');
  }
}

function saveProject(e) {
  e.preventDefault();
  const id = document.getElementById('project-id').value;
  const item = {
    id: id || 'proj_' + Date.now(),
    title: document.getElementById('project-title').value,
    category: document.getElementById('project-category').value,
    client: document.getElementById('project-client').value,
    location: document.getElementById('project-location').value,
    year: document.getElementById('project-year').value,
    image: document.getElementById('project-image').value,
    specs: document.getElementById('project-specs').value,
    description: document.getElementById('project-description').value,
    featured: true
  };

  if (!db.projects) db.projects = [];
  if (id) {
    const idx = db.projects.findIndex(i => i.id === id);
    if (idx !== -1) db.projects[idx] = item;
  } else {
    db.projects.push(item);
  }
  closeModal('project');
  saveDatabase('Project saved!');
}

// ==========================================
// TESTIMONIALS HANDLERS
// ==========================================
function renderTestimonialsTable() {
  const tbody = document.getElementById('testimonials-table-body');
  if (!tbody) return;
  tbody.innerHTML = (db.testimonials || []).map(t => `
    <tr>
      <td><strong>${t.author}</strong></td>
      <td>${t.title} <br><small style="color: #38bdf8;">${t.company}</small></td>
      <td><em>"${t.quote ? t.quote.slice(0, 90) + '...' : ''}"</em></td>
      <td>
        <div class="action-btns">
          <button class="btn-icon" onclick="editTestimonial('${t.id}')"><i class="fa-solid fa-pen"></i></button>
          <button class="btn-icon delete" onclick="deleteTestimonial('${t.id}')"><i class="fa-solid fa-trash"></i></button>
        </div>
      </td>
    </tr>
  `).join('');
}

function openTestimonialModal(id = null) {
  document.getElementById('form-testimonial').reset();
  if (id) {
    const t = (db.testimonials || []).find(item => item.id === id);
    if (!t) return;
    document.getElementById('modal-testimonial-title').textContent = 'Edit Testimonial';
    document.getElementById('testimonial-id').value = t.id;
    document.getElementById('testimonial-author').value = t.author || '';
    document.getElementById('testimonial-title').value = t.title || '';
    document.getElementById('testimonial-company').value = t.company || '';
    document.getElementById('testimonial-quote').value = t.quote || '';
  } else {
    document.getElementById('modal-testimonial-title').textContent = 'Add Testimonial';
    document.getElementById('testimonial-id').value = '';
  }
  document.getElementById('modal-testimonial').classList.remove('hidden');
}

function editTestimonial(id) { openTestimonialModal(id); }

function deleteTestimonial(id) {
  if (confirm('Are you sure you want to delete this testimonial?')) {
    db.testimonials = db.testimonials.filter(item => item.id !== id);
    saveDatabase('Testimonial deleted');
  }
}

function saveTestimonial(e) {
  e.preventDefault();
  const id = document.getElementById('testimonial-id').value;
  const item = {
    id: id || 'test_' + Date.now(),
    author: document.getElementById('testimonial-author').value,
    title: document.getElementById('testimonial-title').value,
    company: document.getElementById('testimonial-company').value,
    quote: document.getElementById('testimonial-quote').value
  };

  if (!db.testimonials) db.testimonials = [];
  if (id) {
    const idx = db.testimonials.findIndex(i => i.id === id);
    if (idx !== -1) db.testimonials[idx] = item;
  } else {
    db.testimonials.push(item);
  }
  closeModal('testimonial');
  saveDatabase('Testimonial saved!');
}

// ==========================================
// NEWS HANDLERS
// ==========================================
function renderNewsTable() {
  const tbody = document.getElementById('news-table-body');
  if (!tbody) return;
  tbody.innerHTML = (db.news || []).map(n => `
    <tr>
      <td><strong>${n.title}</strong></td>
      <td><span style="background: rgba(167,139,250,0.15); color: #a78bfa; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 600;">${n.category}</span></td>
      <td>${n.date || ''}</td>
      <td>${n.excerpt ? n.excerpt.slice(0, 70) + '...' : ''}</td>
      <td>
        <div class="action-btns">
          <button class="btn-icon" onclick="editNews('${n.id}')"><i class="fa-solid fa-pen"></i></button>
          <button class="btn-icon delete" onclick="deleteNews('${n.id}')"><i class="fa-solid fa-trash"></i></button>
        </div>
      </td>
    </tr>
  `).join('');
}

function openNewsModal(id = null) {
  document.getElementById('form-news').reset();
  if (id) {
    const n = (db.news || []).find(item => item.id === id);
    if (!n) return;
    document.getElementById('modal-news-title').textContent = 'Edit News Article';
    document.getElementById('news-id').value = n.id;
    document.getElementById('news-title').value = n.title || '';
    document.getElementById('news-category').value = n.category || '';
    document.getElementById('news-date').value = n.date || '';
    document.getElementById('news-excerpt').value = n.excerpt || '';
  } else {
    document.getElementById('modal-news-title').textContent = 'Add News Article';
    document.getElementById('news-id').value = '';
    document.getElementById('news-date').value = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  }
  document.getElementById('modal-news').classList.remove('hidden');
}

function editNews(id) { openNewsModal(id); }

function deleteNews(id) {
  if (confirm('Are you sure you want to delete this news article?')) {
    db.news = db.news.filter(item => item.id !== id);
    saveDatabase('Article deleted');
  }
}

function saveNews(e) {
  e.preventDefault();
  const id = document.getElementById('news-id').value;
  const item = {
    id: id || 'news_' + Date.now(),
    title: document.getElementById('news-title').value,
    category: document.getElementById('news-category').value,
    date: document.getElementById('news-date').value,
    excerpt: document.getElementById('news-excerpt').value
  };

  if (!db.news) db.news = [];
  if (id) {
    const idx = db.news.findIndex(i => i.id === id);
    if (idx !== -1) db.news[idx] = item;
  } else {
    db.news.push(item);
  }
  closeModal('news');
  saveDatabase('News article saved!');
}

// ==========================================
// MODAL & TOAST HELPERS
// ==========================================
function closeModal(type) {
  const modal = document.getElementById(`modal-${type}`);
  if (modal) modal.classList.add('hidden');
}

function showToast(msg, isError = false) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.className = `toast ${isError ? 'error' : ''}`;
  setTimeout(() => toast.classList.add('hidden'), 3500);
}

// Trigger Static Generation
async function triggerStaticGeneration() {
  const btn = document.getElementById('btn-generate');
  if (!btn) return;
  const origText = btn.innerHTML;
  btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Generating Static Site...`;
  btn.disabled = true;

  try {
    const res = await fetch(API_BASE + '/api/generate', { method: 'POST' });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    showToast('⚡ Standalone Static Website Generated successfully!');
  } catch (err) {
    showToast('Failed to trigger generation.', true);
  } finally {
    btn.innerHTML = origText;
    btn.disabled = false;
  }
}

// Handle multiple gallery uploads and append their URLs to the textarea
async function handleGalleryUpload(inputElem) {
  const files = inputElem.files;
  if (!files || files.length === 0) return;

  showToast(`⏳ Uploading ${files.length} gallery image(s) to server database...`);

  const urls = [];
  for (const file of files) {
    try {
      const dataUrl = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.readAsDataURL(file);
      });

      const res = await fetch(API_BASE + '/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: file.name, dataUrl })
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const data = await res.json();
      if (data.url) {
        urls.push(data.url);
      }
    } catch (err) {
      console.error('Gallery file upload failed:', err);
    }
  }

  if (urls.length > 0) {
    const textarea = document.getElementById('product-images');
    if (textarea) {
      const currentVal = textarea.value.trim();
      textarea.value = (currentVal ? currentVal + '\n' : '') + urls.join('\n');
      
      // Also sync first line to cover image input if it was empty
      const coverInput = document.getElementById('product-image');
      if (coverInput && !coverInput.value.trim()) {
        coverInput.value = urls[0];
        const preview = document.getElementById('product-preview');
        if (preview) {
          preview.src = urls[0];
          preview.style.display = 'block';
        }
      }
      
      showToast(`✅ Uploaded ${urls.length} gallery image(s) and added to gallery list!`);
    }
  } else {
    showToast('❌ Gallery upload failed. Ensure the local Node.js server (npm start) is running on port 4000.', true);
  }
}
