/**
 * Winsteel Engineering Works Pvt. Ltd. - Static Website Engine v2.0
 * Ultra-modern interactive JavaScript with offline support & animated UX
 */

document.addEventListener('DOMContentLoaded', async () => {
  let data = window.WINSTEEL_DATA;

  // Fallback to live server API if WINSTEEL_DATA is missing or empty
  if (!data || Object.keys(data).length === 0) {
    try {
      const res = await fetch('/api/data');
      if (res.ok) {
        data = await res.json();
        window.WINSTEEL_DATA = data;
      }
    } catch (e) {
      console.log('Offline mode: using embedded static bundle');
    }
  }
  data = data || {};

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
    const target = +counter.getAttribute('data-target') || 0;
    const count = +counter.innerText || 0;
    const inc = target / speed;

    if (count < target) {
      counter.innerText = Math.ceil(count + inc);
      setTimeout(() => animate(counter), 30);
    } else {
      counter.innerText = target + (counter.getAttribute('data-suffix') || '');
    }
  };

  counters.forEach(counter => animate(counter));
}

// ==========================================
// HOME PAGE INITIALIZATION
// ==========================================
function initHomePage(data) {
  // 1. Populate Hero Banner
  if (data.hero) {
    const h = data.hero;
    const titleElem = document.getElementById('hero-title');
    const subElem = document.getElementById('hero-subtitle');
    const badgeElem = document.getElementById('hero-badge');
    const bgElem = document.getElementById('hero-bg');
    const cta1 = document.getElementById('hero-cta1');
    const cta2 = document.getElementById('hero-cta2');

    if (titleElem && h.title) {
      // Highlight last two words or custom text in gold
      const parts = h.title.split(' ');
      if (parts.length > 2) {
        const lastTwo = parts.splice(-2).join(' ');
        titleElem.innerHTML = `${parts.join(' ')} <span class="gold-highlight">${lastTwo}</span>`;
      } else {
        titleElem.textContent = h.title;
      }
    }
    if (subElem && h.subtitle) subElem.textContent = h.subtitle;
    if (badgeElem && h.badgeText) badgeElem.innerHTML = `<i class="fa-solid fa-award"></i> ${h.badgeText}`;
    if (bgElem && h.bgImage) bgElem.src = h.bgImage;
    if (cta1) {
      if (h.cta1Text) cta1.innerHTML = `<i class="fa-solid fa-gear"></i> ${h.cta1Text}`;
      if (h.cta1Link) cta1.href = h.cta1Link;
    }
    if (cta2) {
      if (h.cta2Text) cta2.textContent = h.cta2Text;
      if (h.cta2Link) cta2.href = h.cta2Link;
    }
  }

  // 2. Populate Stats Counter Bar
  if (data.stats) {
    const s = data.stats;
    const yearsElem = document.getElementById('stat-years');
    const workersElem = document.getElementById('stat-workers');
    const plotElem = document.getElementById('stat-plot');
    const capacityElem = document.getElementById('stat-capacity');

    if (yearsElem && s.yearsExperience) yearsElem.setAttribute('data-target', s.yearsExperience);
    if (workersElem && s.skilledWorkers) {
      const num = parseInt(s.skilledWorkers) || 550;
      workersElem.setAttribute('data-target', num);
    }
    if (plotElem && s.plotAreaSqFt) {
      const num = parseInt(s.plotAreaSqFt.replace(/,/g, '')) || 324000;
      plotElem.setAttribute('data-target', Math.round(num / 1000));
      plotElem.setAttribute('data-suffix', ',000');
    }
    if (capacityElem && s.annualCapacityMT) {
      const num = parseInt(s.annualCapacityMT.replace(/,/g, '')) || 18000;
      capacityElem.setAttribute('data-target', Math.round(num / 1000));
      capacityElem.setAttribute('data-suffix', ',000');
    }
  }

  // 3. Populate About & Partner Section
  if (data.about) {
    const a = data.about;
    const titleElem = document.getElementById('about-title');
    const descElem = document.getElementById('about-desc');
    const imgMain = document.getElementById('about-img-main');
    const pName = document.getElementById('about-partner-name');
    const pDesc = document.getElementById('about-partner-desc');
    const pWeb = document.getElementById('about-partner-web');

    if (titleElem) titleElem.textContent = a.subtitle || a.title;
    if (descElem && a.description) {
      descElem.innerHTML = `<p><strong>WINSTEEL ENGINEERING WORKS PVT. LTD.</strong> ${a.description}</p>`;
    }
    if (imgMain && a.image) imgMain.src = a.image;
    if (pName && a.partnerName) pName.innerHTML = `<i class="fa-solid fa-handshake" style="color: var(--accent-gold);"></i> Technical Associate: ${a.partnerName}`;
    if (pDesc && a.partnerDesc) pDesc.textContent = a.partnerDesc;
    if (pWeb && a.partnerWebsite) {
      pWeb.href = a.partnerWebsite;
      pWeb.innerHTML = `Visit ${a.partnerName || 'Technical Associate'} Portal <i class="fa-solid fa-arrow-up-right-from-square"></i>`;
    }
  }

  // 4. Populate Turnkey Process Workflow
  const processContainer = document.getElementById('process-container');
  if (processContainer && data.process) {
    processContainer.innerHTML = data.process.map(p => `
      <div class="process-card">
        <div class="process-step-num">${p.step || '01'}</div>
        <div class="process-icon"><i class="fa-solid ${p.icon || 'fa-clipboard-list'}"></i></div>
        <h4>${p.title}</h4>
        <p>${p.description}</p>
      </div>
    `).join('');
  }

  // 5. Populate Strengths
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

  // 6. Populate Facilities / Infrastructure
  const facilitiesContainer = document.getElementById('facilities-container');
  if (facilitiesContainer && data.facilities) {
    facilitiesContainer.innerHTML = data.facilities.map(f => `
      <div class="facility-card">
        <div class="facility-img-box">
          <img src="${f.image}" alt="${f.title}" loading="lazy" onerror="this.src='uploads/about-factory.png'">
        </div>
        <div class="facility-content">
          <h4>${f.subtitle || 'Manufacturing Unit'}</h4>
          <h3>${f.title}</h3>
          <p>${f.description}</p>
        </div>
      </div>
    `).join('');
  }

  // 7. Populate Featured Products Preview
  const featProductsContainer = document.getElementById('featured-products-grid');
  if (featProductsContainer && data.products) {
    const featured = data.products.slice(0, 3);
    featProductsContainer.innerHTML = featured.map(p => renderProductCard(p)).join('');
  }

  // 8. Populate Featured Projects Preview
  const featProjectsContainer = document.getElementById('featured-projects-grid');
  if (featProjectsContainer && data.projects) {
    const featured = data.projects.slice(0, 3);
    featProjectsContainer.innerHTML = featured.map(p => renderProjectCard(p)).join('');
  }

  // 9. Populate Client Testimonials
  const testimonialsContainer = document.getElementById('testimonials-container');
  if (testimonialsContainer && data.testimonials) {
    testimonialsContainer.innerHTML = data.testimonials.map(t => {
      const initial = (t.author && t.author[0]) || 'C';
      return `
        <div class="testimonial-card">
          <div class="quote-icon"><i class="fa-solid fa-quote-left"></i></div>
          <p>"${t.quote}"</p>
          <div class="client-author">
            <div class="author-avatar">${initial}</div>
            <div>
              <strong style="display:block; color:#0f172a;">${t.author}</strong>
              <span style="font-size:13px; color:#64748b;">${t.title} • ${t.company}</span>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  // 10. Populate Recent News in Footer
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
        <img src="${p.image}" alt="${p.title}" loading="lazy" onerror="this.src='uploads/metro-viaduct.png'">
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
        <img src="${p.image}" alt="${p.name}" loading="lazy" onerror="this.src='uploads/hero-gantry.png'">
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
