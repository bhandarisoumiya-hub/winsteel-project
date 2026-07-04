/**
 * Winsteel Engineering Works Pvt. Ltd. - Static Website Engine v2.0
 * Ultra-modern interactive JavaScript with offline support & animated UX
 */

document.addEventListener('DOMContentLoaded', () => {
  const data = window.WINSTEEL_DATA || {};



  // Determine current page
  const page = document.body.getAttribute('data-page') || 'home';

  if (page === 'home') {
    initHomePage(data);
    initAnimatedCounters();
  } else if (page === 'products') {
    initProductsPage(data);
  } else if (page === 'projects') {
    initProjectsPage(data);
  }

  // Setup modal close events
  setupModal();
});

// ==========================================
// ANIMATED NUMBERS COUNTER
// ==========================================
function initAnimatedCounters() {
  const counters = document.querySelectorAll('.count-num');
  const speed = 40;

  const animate = (counter) => {
    const target = +counter.getAttribute('data-target');
    const count = +counter.innerText;
    const inc = target / speed;

    if (count < target) {
      counter.innerText = Math.ceil(count + inc);
      setTimeout(() => animate(counter), 30);
    } else {
      counter.innerText = target + (counter.getAttribute('data-suffix') || '');
    }
  };

  // Run animation immediately or on scroll
  counters.forEach(counter => animate(counter));
}

// ==========================================
// HOME PAGE INITIALIZATION
// ==========================================
function initHomePage(data) {
  // Populate Strengths
  const strengthsContainer = document.getElementById('strengths-container');
  if (strengthsContainer && data.strengths) {
    const icons = ['fa-award', 'fa-cogs', 'fa-users-gear', 'fa-crane', 'fa-industry', 'fa-microchip', 'fa-compass-drafting', 'fa-shield-halved', 'fa-truck-fast'];
    strengthsContainer.innerHTML = data.strengths.map((s, idx) => `
      <div class="strength-card">
        <div class="strength-icon">
          <i class="fa-solid ${icons[idx % icons.length]}"></i>
        </div>
        <h4>${s.title}</h4>
        <p>${s.description}</p>
      </div>
    `).join('');
  }

  // Populate Facilities / Infrastructure
  const facilitiesContainer = document.getElementById('facilities-container');
  if (facilitiesContainer && data.facilities) {
    facilitiesContainer.innerHTML = data.facilities.map(f => `
      <div class="facility-card">
        <div class="facility-img-box">
          <img src="${f.image}" alt="${f.title}" loading="lazy">
        </div>
        <div class="facility-content">
          <h4>${f.subtitle}</h4>
          <h3>${f.title}</h3>
          <p>${f.description}</p>
        </div>
      </div>
    `).join('');
  }

  // Populate Featured Projects Preview
  const featProjectsContainer = document.getElementById('featured-projects-grid');
  if (featProjectsContainer && data.projects) {
    const featured = data.projects.slice(0, 3);
    featProjectsContainer.innerHTML = featured.map(p => renderProjectCard(p)).join('');
  }

  // Populate Featured Products Preview
  const featProductsContainer = document.getElementById('featured-products-grid');
  if (featProductsContainer && data.products) {
    const featured = data.products.slice(0, 3);
    featProductsContainer.innerHTML = featured.map(p => renderProductCard(p)).join('');
  }

  // Populate Recent News in Footer
  populateFooterNews(data.news);
}

// ==========================================
// PRODUCTS PAGE INITIALIZATION
// ==========================================
function initProductsPage(data) {
  const container = document.getElementById('products-grid');
  const filterTabsContainer = document.getElementById('product-filters');
  const searchInput = document.getElementById('product-search');

  let currentCategory = 'All';
  let searchQuery = '';

  const categories = (data.categories && data.categories.products) || ['All', 'Bridge Equipment', 'Formwork Systems', 'Gantry & Launchers', 'Precast Moulds'];

  // Render Filter Tabs
  if (filterTabsContainer) {
    filterTabsContainer.innerHTML = categories.map(cat => `
      <button class="filter-btn ${cat === 'All' ? 'active' : ''}" data-category="${cat}">${cat}</button>
    `).join('');

    filterTabsContainer.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        filterTabsContainer.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentCategory = btn.getAttribute('data-category');
        renderFilteredProducts();
      });
    });
  }

  // Search Input Listener
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.toLowerCase().trim();
      renderFilteredProducts();
    });
  }

  function renderFilteredProducts() {
    if (!container || !data.products) return;

    const filtered = data.products.filter(p => {
      const matchesCategory = currentCategory === 'All' || p.category === currentCategory;
      const matchesSearch = p.name.toLowerCase().includes(searchQuery) ||
        (p.description && p.description.toLowerCase().includes(searchQuery)) ||
        (p.tagline && p.tagline.toLowerCase().includes(searchQuery));
      return matchesCategory && matchesSearch;
    });

    if (filtered.length === 0) {
      container.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 80px 20px; background: #fff; border-radius: 20px; border: 1px solid #e2e8f0;">
        <i class="fa-solid fa-magnifying-glass" style="font-size: 48px; color: #94a3b8; margin-bottom: 16px;"></i>
        <h3 style="font-size: 24px;">No equipment matched your search</h3>
        <p style="color: #64748b;">Try selecting a different category or clearing your search term.</p>
      </div>`;
    } else {
      container.innerHTML = filtered.map(p => renderProductCard(p)).join('');
    }
  }

  renderFilteredProducts();
  populateFooterNews(data.news);
}

// ==========================================
// PROJECTS PAGE INITIALIZATION
// ==========================================
function initProjectsPage(data) {
  const container = document.getElementById('projects-grid');
  const filterTabsContainer = document.getElementById('project-filters');
  const searchInput = document.getElementById('project-search');

  let currentCategory = 'All';
  let searchQuery = '';

  const categories = (data.categories && data.categories.projects) || ['All', 'Highway Bridges', 'Metro Rail', 'Special Structures', 'Marine & Ports'];

  if (filterTabsContainer) {
    filterTabsContainer.innerHTML = categories.map(cat => `
      <button class="filter-btn ${cat === 'All' ? 'active' : ''}" data-category="${cat}">${cat}</button>
    `).join('');

    filterTabsContainer.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        filterTabsContainer.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentCategory = btn.getAttribute('data-category');
        renderFilteredProjects();
      });
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.toLowerCase().trim();
      renderFilteredProjects();
    });
  }

  function renderFilteredProjects() {
    if (!container || !data.projects) return;

    const filtered = data.projects.filter(p => {
      const matchesCategory = currentCategory === 'All' || p.category === currentCategory;
      const matchesSearch = p.title.toLowerCase().includes(searchQuery) ||
        (p.description && p.description.toLowerCase().includes(searchQuery)) ||
        (p.location && p.location.toLowerCase().includes(searchQuery));
      return matchesCategory && matchesSearch;
    });

    if (filtered.length === 0) {
      container.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 80px 20px; background: #fff; border-radius: 20px; border: 1px solid #e2e8f0;">
        <i class="fa-solid fa-folder-open" style="font-size: 48px; color: #94a3b8; margin-bottom: 16px;"></i>
        <h3 style="font-size: 24px;">No infrastructure projects found</h3>
        <p style="color: #64748b;">Try adjusting your search criteria.</p>
      </div>`;
    } else {
      container.innerHTML = filtered.map(p => renderProjectCard(p)).join('');
    }
  }

  renderFilteredProjects();
  populateFooterNews(data.news);
}

// ==========================================
// CARD RENDERING HELPERS
// ==========================================
function renderProjectCard(p) {
  return `
    <div class="card">
      <div class="card-img-wrapper">
        <span class="card-badge">${p.category}</span>
        <img src="${p.image}" alt="${p.title}" loading="lazy">
      </div>
      <div class="card-content">
        <span class="card-subtitle"><i class="fa-solid fa-location-dot"></i> ${p.location || 'India'} • ${p.year || ''}</span>
        <h3>${p.title}</h3>
        <p>${p.description}</p>
        <div class="card-footer">
          <span style="font-size: 13.5px; font-weight: 700; color: #475569;"><i class="fa-solid fa-user-tie"></i> ${p.client || 'Winsteel Client'}</span>
          <button class="btn-card" onclick="openModal('project', '${p.id}')">Case Study <i class="fa-solid fa-arrow-right"></i></button>
        </div>
      </div>
    </div>
  `;
}

function renderProductCard(p) {
  return `
    <div class="card">
      <div class="card-img-wrapper">
        <span class="card-badge">${p.category}</span>
        <img src="${p.image}" alt="${p.name}" loading="lazy">
      </div>
      <div class="card-content">
        <span class="card-subtitle"><i class="fa-solid fa-star" style="color: #f3ad1b;"></i> ${p.tagline || 'Engineered Equipment'}</span>
        <h3>${p.name}</h3>
        <p>${p.description}</p>
        <div class="card-footer">
          <span style="font-size: 13px; font-weight: 700; color: #004680; background: #eff6ff; padding: 4px 12px; border-radius: 20px;">Heavy Duty Spec</span>
          <button class="btn-card" onclick="openModal('product', '${p.id}')">View Specs <i class="fa-solid fa-arrow-right"></i></button>
        </div>
      </div>
    </div>
  `;
}

function populateFooterNews(newsList) {
  const container = document.getElementById('footer-news-list');
  if (container && newsList) {
    container.innerHTML = newsList.slice(0, 3).map(n => `
      <li>
        <h5>${n.title}</h5>
        <span><i class="fa-regular fa-calendar-days"></i> ${n.date}</span>
      </li>
    `).join('');
  }
}

// ==========================================
// MODAL SYSTEM
// ==========================================
function setupModal() {
  const overlay = document.getElementById('modal-overlay');
  const closeBtn = document.getElementById('modal-close');

  if (closeBtn && overlay) {
    closeBtn.addEventListener('click', () => overlay.classList.remove('active'));
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.classList.remove('active');
    });
  }
}

window.openModal = function (type, id) {
  const data = window.WINSTEEL_DATA || {};
  const overlay = document.getElementById('modal-overlay');
  const modalBody = document.getElementById('modal-body');

  if (!overlay || !modalBody) return;

  if (type === 'project') {
    const p = (data.projects || []).find(item => item.id === id);
    if (!p) return;
    modalBody.innerHTML = `
      <img src="${p.image}" alt="${p.title}">
      <div class="modal-text">
        <span class="subheading" style="margin-bottom: 12px;">${p.category} • Completed ${p.year || ''}</span>
        <h2>${p.title}</h2>
        <div style="display: flex; gap: 20px; flex-wrap: wrap; margin-bottom: 20px; font-weight: 600; color: #004680; font-size: 15px;">
          <span><i class="fa-solid fa-building"></i> Client: ${p.client || 'National Authority'}</span>
          <span><i class="fa-solid fa-location-dot"></i> Location: ${p.location || 'India'}</span>
        </div>
        <p style="margin-bottom: 24px; color: #475569; font-size: 16.5px; line-height: 1.7;">${p.description}</p>
        <div style="background: #f8fafc; padding: 24px; border-radius: 16px; border: 1px solid #e2e8f0; border-left: 6px solid #f3ad1b;">
          <h4 style="font-size: 16px; color: #0f172a; margin-bottom: 8px;"><i class="fa-solid fa-gears" style="color: #f3ad1b;"></i> Technical Deployment Specifications:</h4>
          <p style="font-size: 15px; color: #334155; margin: 0;">${p.specs || 'Custom high-grade structural steel formwork, automated hydraulic adjustment, and specialized launching gantry mechanisms built to withstand heavy load tolerances.'}</p>
        </div>
      </div>
    `;
  } else if (type === 'product') {
    const p = (data.products || []).find(item => item.id === id);
    if (!p) return;
    const featuresList = (p.features || ['CNC Precision Machining', 'Robotic Welded Steel Joints', 'Hydraulic Load Tested', 'Easy Site Assembly & Reusability']).map(f => `
      <li style="margin-bottom: 10px; display: flex; align-items: center; gap: 12px; font-size: 15.5px; color: #334155;">
        <span style="background: rgba(243, 173, 27, 0.2); color: #d97706; width: 26px; height: 26px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px;"><i class="fa-solid fa-check"></i></span>
        ${f}
      </li>`).join('');
    modalBody.innerHTML = `
      <img src="${p.image}" alt="${p.name}">
      <div class="modal-text">
        <span class="subheading" style="margin-bottom: 12px;">${p.category}</span>
        <h2>${p.name}</h2>
        <p style="margin-bottom: 16px; font-weight: 700; color: #d97706; font-size: 17px;">${p.tagline || ''}</p>
        <p style="margin-bottom: 28px; color: #475569; font-size: 16.5px; line-height: 1.7;">${p.description}</p>
        <h4 style="font-size: 17px; color: #0f172a; margin-bottom: 16px;">Key Engineering & Structural Features:</h4>
        <ul style="list-style: none; padding: 0; display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">${featuresList}</ul>
      </div>
    `;
  }

  overlay.classList.add('active');
};
