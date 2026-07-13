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
  } else if (page === 'about') {
    initInfraShowcase();
  } else if (page === 'products') {
    initProductsPage(data);
  } else if (page === 'projects') {
    initProjectsPage(data);
  } else if (page === 'product-details') {
    initProductDetailsPage(data);
  } else if (page === 'project-details') {
    initProjectDetailsPage(data);
  } else if (page === 'news') {
    initNewsPage(data);
  } else if (page === 'news-details') {
    initNewsDetailsPage(data);
  } else if (page === 'contact') {
    initContactPage();
  }

  // Always initialize animated counters across all pages (Home, About, Core Values, etc.)
  initAnimatedCounters();

  // Setup navbar dropdown & active state
  initNavbarDropdown(page);

  // Setup modal close events
  setupModal();
});


// ==========================================
// ANIMATED NUMBERS COUNTER (INTERSECTION OBSERVER + FORMATTING)
// ==========================================
function initAnimatedCounters() {
  const counters = document.querySelectorAll('.count-num');
  if (!counters.length) return;

  const formatNumber = (num, format) => {
    if (format === 'comma') {
      return Math.floor(num).toLocaleString('en-US');
    } else if (format === 'pad') {
      return Math.floor(num) < 10 ? '0' + Math.floor(num) : Math.floor(num);
    }
    return Math.floor(num);
  };

  const animate = (counter) => {
    const target = parseFloat(counter.getAttribute('data-target')) || 0;
    const format = counter.getAttribute('data-format') || '';
    const prefix = counter.getAttribute('data-prefix') || '';
    const suffix = counter.getAttribute('data-suffix') || '';
    const duration = 1800; // 1.8 seconds smooth easing animation
    const startTime = performance.now();

    counter.setAttribute('data-animated', 'true');

    const updateCount = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out quartic for ultra-smooth slowdown
      const easeProgress = 1 - Math.pow(1 - progress, 4);
      const currentNum = target * easeProgress;

      if (progress < 1) {
        counter.innerText = prefix + formatNumber(currentNum, format) + suffix;
        requestAnimationFrame(updateCount);
      } else {
        counter.innerText = prefix + formatNumber(target, format) + suffix;
      }
    };

    requestAnimationFrame(updateCount);
  };

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animate(entry.target);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    counters.forEach(counter => {
      if (counter.getAttribute('data-animated') !== 'true') {
        const format = counter.getAttribute('data-format') || '';
        const prefix = counter.getAttribute('data-prefix') || '';
        const suffix = counter.getAttribute('data-suffix') || '';
        counter.innerText = prefix + formatNumber(0, format) + suffix;
        observer.observe(counter);
      }
    });
  } else {
    counters.forEach(counter => animate(counter));
  }
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
    const icons = ['fa-award', 'fa-bolt', 'fa-users-gear', 'fa-gears', 'fa-chart-line', 'fa-industry', 'fa-compass-drafting', 'fa-shield-halved', 'fa-truck-fast'];
    const tags = ['52+ Years Mastery', 'Turnkey Execution', '550+ Skilled Workforce', '10-25 Ton Crane Capacity', '18,000 MT Annual Output', '0.1mm Precision Tolerances', 'Alpi Sea Technical Collab', 'ISO 9001:2015 & NDT Tested', '100% Client Satisfaction'];
    strengthsContainer.innerHTML = data.strengths.map((s, idx) => `
      <div class="strength-card ${idx === 8 ? 'gold-card' : ''}">
        <div class="strength-card-top">
          <span class="strength-num-badge" ${idx === 8 ? 'style="background:#0f172a; color:#fbbf24;"' : ''}>${(idx + 1).toString().padStart(2, '0')}</span>
          <div class="strength-icon-circle"><i class="fa-solid ${icons[idx % icons.length]}"></i></div>
        </div>
        <div class="strength-card-body">
          <h4>${s.title}</h4>
          <p>${s.description}</p>
        </div>
        <div class="strength-card-footer">
          <span class="strength-tag" ${idx === 8 ? 'style="background:rgba(15,23,42,0.15); color:#0f172a;"' : ''}><i class="fa-solid fa-check"></i> ${tags[idx % tags.length]}</span>
          <span class="strength-clean-arrow">→</span>
        </div>
      </div>
    `).join('');
  }

  // 6. Populate News / Insights on Home Page
  const homeNewsContainer = document.getElementById('home-news-container');
  if (homeNewsContainer && data.news) {
    const recentNews = data.news.slice(0, 3);
    homeNewsContainer.innerHTML = recentNews.map(n => `
      <div class="card news-card-home" style="border: 1px solid var(--border-light); background: #ffffff; position: relative; display: flex; flex-direction: column; height: 100%; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.05); transition: all 0.3s ease;">
        ${n.category ? `<span class="card-badge" style="background: rgba(15, 23, 42, 0.88); backdrop-filter: blur(8px); color: #f3ad1b; font-weight: 700; font-size: 11.5px; padding: 5px 12px; border-radius: 50px; position: absolute; top: 14px; left: 14px; z-index: 2; border: 1px solid rgba(243, 173, 27, 0.35);">${n.category}</span>` : ''}
        <a href="news-details.html?id=${n.id}" class="card-img-wrapper" style="position: relative; overflow: hidden; height: 220px; background: #0f172a; display: block;">
          <img src="${n.image}" alt="${n.title}" loading="lazy" style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);" onerror="this.src='Winsteel Trans Logo.png'">
        </a>
        <div class="card-content" style="padding: 24px; display: flex; flex-direction: column; flex: 1;">
          <div style="color: #64748b; font-size: 13px; font-weight: 600; margin-bottom: 8px;">
            <i class="fa-regular fa-calendar-days" style="color: var(--accent-gold); margin-right: 4px;"></i> ${n.date}
          </div>
          <h3 style="font-size: 18px; font-weight: 700; color: var(--primary-navy); margin-bottom: 10px; line-height: 1.35; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; min-height: 2.7em; max-height: 2.7em;">
            <a href="news-details.html?id=${n.id}" style="color: inherit; text-decoration: none; transition: color 0.3s;">${n.title}</a>
          </h3>
          <p style="font-size: 14px; color: var(--text-muted); line-height: 1.6; margin-bottom: 18px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; min-height: 3.2em; max-height: 3.2em;">${n.excerpt || ''}</p>
          
          <div style="display: flex; justify-content: flex-end; padding-top: 14px; border-top: 1px solid var(--border-light); margin-top: auto;">
            <a href="news-details.html?id=${n.id}" class="btn-card-link" style="font-weight: 700; color: var(--primary-blue); text-decoration: none; display: inline-flex; align-items: center; gap: 6px;">Read Article <i class="fa-solid fa-arrow-right"></i></a>
          </div>
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

  // 11. Re-initialize and trigger any updated number counters
  initAnimatedCounters();
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

  const categories = (data.categories && data.categories.products) || ['All', 'Formworks and Moulds', 'Launching Gantries', 'RMC Batching Plant Equipments', 'Special Purpose Equipments', 'Movable scaffolding system', 'Balance Cantilever Systems for Segmental & In-Situ', 'Tunnel formworks'];

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

    const countEl = document.getElementById('products-count');
    if (countEl) {
      countEl.innerHTML = `Showing <span style="color: var(--primary-navy); font-weight: 700;">${filtered.length}</span> of <span style="color: var(--primary-navy); font-weight: 700;">${data.products.length}</span> Engineering Solutions`;
    }

    if (filtered.length === 0) {
      container.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 80px 20px; background: #fff; border-radius: 20px; border: 1px solid #e2e8f0;">
        <i class="fa-solid fa-magnifying-glass" style="font-size: 48px; color: #94a3b8; margin-bottom: 16px;"></i>
        <h3 style="font-size: 24px; color: var(--primary-navy); margin-bottom: 8px;">No equipment matched your search</h3>
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

    const countEl = document.getElementById('projects-count');
    if (countEl) {
      countEl.innerHTML = `Showing <span style="color: var(--primary-navy); font-weight: 700;">${filtered.length}</span> of <span style="color: var(--primary-navy); font-weight: 700;">${data.projects.length}</span> Infrastructure Projects`;
    }

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
// RENDER HELPERS
// ==========================================
function renderProjectCard(p) {
  return `
    <div class="card" onclick="if(!window._isSliderDragging && (!event || !event.target.closest('a'))) window.location.href='project-details.html?id=${p.id}'" style="border: 1px solid var(--border-light); background: #ffffff; position: relative; display: flex; flex-direction: column; height: 100%; border-radius: 16px; overflow: hidden; cursor: pointer;">
      ${p.category ? `<span class="card-badge">${p.category}</span>` : ''}
      <a href="project-details.html?id=${p.id}" class="card-img-wrapper" style="height: 240px; display: block; overflow: hidden;">
        <img src="${p.image}" alt="${p.title}" loading="lazy" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.src='uploads/hero-gantry.png'">
      </a>
      <div class="card-content" style="padding: 24px; display: flex; flex-direction: column; flex: 1;">
        <h3 style="font-size: 19px; font-weight: 700; color: var(--primary-navy); margin-bottom: 10px; line-height: 1.35; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; min-height: 2.7em; max-height: 2.7em;"><a href="project-details.html?id=${p.id}" style="color: inherit; text-decoration: none;">${p.title}</a></h3>
        <p style="font-size: 14px; color: var(--text-muted); line-height: 1.6; margin-bottom: 18px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; min-height: 3.2em; max-height: 3.2em;">${p.description || ''}</p>
        
        <!-- Specs Bar: Location and Year -->
        <div style="display: flex; align-items: center; gap: 14px; margin-top: auto; margin-bottom: 16px; font-size: 13.5px; border-top: 1px solid rgba(0,0,0,0.05); padding-top: 14px;">
          <div style="display: flex; align-items: center; gap: 6px; color: var(--primary-navy); font-weight: 600;">
            <i class="fa-solid fa-location-dot" style="color: var(--accent-gold); font-size: 13px;"></i>
            <span>${p.location}</span>
          </div>
          <span style="width: 1px; height: 12px; background: var(--border-light);"></span>
          <div style="display: flex; align-items: center; gap: 6px; color: var(--text-muted);">
            <i class="fa-solid fa-calendar-days" style="color: var(--accent-gold); font-size: 13px;"></i>
            <span>${p.year}</span>
          </div>
        </div>
        
        <div style="display: flex; justify-content: flex-end; padding-top: 14px; border-top: 1px solid var(--border-light); margin-top: 0;">
          <a href="project-details.html?id=${p.id}" class="btn-card-link">Explore Case Study <i class="fa-solid fa-arrow-right"></i></a>
        </div>
      </div>
    </div>
  `;
}

function renderProductCard(p) {
  const hasSpecs = p.client || p.year;
  return `
    <div class="card product-showcase-card" onclick="if(!window._isSliderDragging && (!event || !event.target.closest('a'))) window.location.href='product-details.html?id=${p.id}'" style="border: 1px solid var(--border-light); background: #ffffff; position: relative; display: flex; flex-direction: column; height: 100%; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.05); transition: all 0.3s ease; cursor: pointer;">
      ${p.category ? `<span class="card-badge" style="background: rgba(15, 23, 42, 0.88); backdrop-filter: blur(8px); color: #f3ad1b; font-weight: 700; font-size: 11.5px; padding: 5px 12px; border-radius: 50px; position: absolute; top: 14px; left: 14px; z-index: 2; border: 1px solid rgba(243, 173, 27, 0.35); box-shadow: 0 2px 10px rgba(0,0,0,0.2);">${p.category}</span>` : ''}
      
      <a href="product-details.html?id=${p.id}" class="card-img-wrapper" style="position: relative; overflow: hidden; height: 240px; background: #0f172a; display: block;">
        <img src="${p.image}" alt="${p.name}" loading="lazy" style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);" onerror="this.src='Winsteel Trans Logo.png'">
      </a>
      
      <div class="card-content" style="padding: 26px 24px; display: flex; flex-direction: column; flex: 1;">
        <h3 style="font-size: 19px; font-weight: 700; color: var(--primary-navy); margin-bottom: 8px; line-height: 1.35; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; min-height: 2.7em; max-height: 2.7em;">
          <a href="product-details.html?id=${p.id}" style="color: inherit; text-decoration: none;">${p.name}</a>
        </h3>
        
        <div style="color: #d97706; font-size: 13px; font-weight: 600; margin-bottom: 12px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; min-height: 2.8em; max-height: 2.8em;">
          ${p.tagline ? `<i class="fa-solid fa-shield-halved" style="color: #f59e0b; margin-right: 4px;"></i> ${p.tagline}` : '&nbsp;'}
        </div>
        
        <p style="font-size: 14.5px; color: var(--text-muted); line-height: 1.6; margin-bottom: ${hasSpecs ? '24px' : '20px'}; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; min-height: 3.2em; max-height: 3.2em;">${p.description || ''}</p>
        
        <!-- Specs Bar: Client and Year -->
        ${hasSpecs ? `
        <div style="display: flex; align-items: center; gap: 14px; margin-top: auto; margin-bottom: 16px; font-size: 13px; border-top: 1px solid rgba(0,0,0,0.06); padding-top: 16px;">
          ${p.client ? `
            <div style="display: flex; align-items: center; gap: 6px; color: var(--primary-navy); font-weight: 600;">
              <i class="fa-solid fa-briefcase" style="color: var(--accent-gold); font-size: 13px;"></i>
              <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 190px;">${p.client}</span>
            </div>
          ` : ''}
          ${p.client && p.year ? `<span style="width: 1px; height: 12px; background: var(--border-light);"></span>` : ''}
          ${p.year ? `
            <div style="display: flex; align-items: center; gap: 6px; color: var(--text-muted);">
              <i class="fa-solid fa-calendar-check" style="color: var(--accent-gold); font-size: 13px;"></i>
              <span>${p.year}</span>
            </div>
          ` : ''}
        </div>
        ` : ''}
        
        <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 16px; border-top: 1px solid var(--border-light); margin-top: ${hasSpecs ? '0' : 'auto'};">
          <span style="font-size: 12.5px; font-weight: 700; color: #059669; background: #ecfdf5; padding: 4px 10px; border-radius: 50px;"><i class="fa-solid fa-circle-check"></i> Factory Certified</span>
          <a href="product-details.html?id=${p.id}" class="btn-card-link" style="font-weight: 700;">Full Specs <i class="fa-solid fa-arrow-right"></i></a>
        </div>
      </div>
    </div>
  `;
};

function populateFooterNews(newsList) {
  const container = document.getElementById('footer-news-list');
  if (container && newsList) {
    container.innerHTML = newsList.slice(0, 3).map(n => `
      <li>
        <a href="news-details.html?id=${n.id}" style="color: inherit; text-decoration: none; display: block;">
          <h5 style="transition: color 0.3s; margin-bottom: 4px;">${n.title}</h5>
          <span><i class="fa-regular fa-calendar-days"></i> ${n.date}</span>
        </a>
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
        <span class="subheading" style="margin-bottom: 12px;">${p.items || p.category || 'Infrastructure'} • Completed ${p.year || ''}</span>
        <h2>${p.title}</h2>
        <div style="display: flex; gap: 20px; flex-wrap: wrap; margin-bottom: 20px; font-weight: 600; color: #004680; font-size: 15px;">
          <span><i class="fa-solid fa-building"></i> Client: ${p.client || 'National Authority'}</span>
        </div>
        <p style="margin-bottom: 24px; color: #475569; font-size: 16.5px; line-height: 1.7;">${p.description || 'No project description provided.'}</p>
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

// ==========================================
// PRODUCT DETAILS PAGE INITIALIZATION
// ==========================================
function initProductDetailsPage(data) {
  const params = new URLSearchParams(window.location.search);
  const productId = params.get('id');

  const container = document.querySelector('.product-details-container');
  const errorContainer = document.getElementById('details-error-state');

  if (!productId || !data.products) {
    showProductNotFound();
    return;
  }

  const product = data.products.find(p => p.id === productId);
  if (!product) {
    showProductNotFound();
    return;
  }

  // Dynamic Page Title
  document.title = `${product.name} | Winsteel Engineering Works Pvt. Ltd.`;

  // Populate UI elements
  const categoryElem = document.getElementById('details-category');
  const titleElem = document.getElementById('details-title');
  const taglineElem = document.getElementById('details-tagline');
  const descElem = document.getElementById('details-desc');
  const imgElem = document.getElementById('details-img');
  const breadcrumbProduct = document.getElementById('breadcrumb-product-title');

  if (categoryElem) categoryElem.textContent = product.category;
  if (titleElem) titleElem.textContent = product.name;
  if (taglineElem) taglineElem.textContent = product.tagline || 'Heavy-Duty Engineering Equipment';
  if (descElem) descElem.textContent = product.description;
  // Handle gallery images
  const galleryThumbs = document.getElementById('details-gallery-thumbnails');
  const productImages = product.images || (product.image ? [product.image] : []);
  let currentImgIndex = 0;
  let autoSlideTimer = null;

  const prevBtn = document.getElementById('details-prev-btn');
  const nextBtn = document.getElementById('details-next-btn');

  const updateSliderImage = (index, direction = 'next') => {
    currentImgIndex = index;
    if (imgElem && productImages[currentImgIndex]) {
      const outClass = direction === 'next' ? 'slide-next-out' : 'slide-prev-out';
      const inClass = direction === 'next' ? 'slide-next-in' : 'slide-prev-in';

      imgElem.classList.add(outClass);

      setTimeout(() => {
        imgElem.src = productImages[currentImgIndex];
        imgElem.classList.remove(outClass);
        imgElem.classList.add(inClass);

        setTimeout(() => {
          imgElem.classList.remove(inClass);
        }, 320);
      }, 200);
    }

    // Update active class on thumbnails
    document.querySelectorAll('.thumbnail-item').forEach((thumb, idx) => {
      if (idx === currentImgIndex) {
        thumb.classList.add('active');
        thumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      } else {
        thumb.classList.remove('active');
      }
    });
  };

  const startAutoSlide = () => {
    stopAutoSlide();
    if (productImages.length > 1) {
      autoSlideTimer = setInterval(() => {
        const nextIdx = (currentImgIndex + 1) % productImages.length;
        updateSliderImage(nextIdx, 'next');
      }, 5000);
    }
  };

  const stopAutoSlide = () => {
    if (autoSlideTimer) {
      clearInterval(autoSlideTimer);
      autoSlideTimer = null;
    }
  };

  if (imgElem) {
    imgElem.src = productImages[0] || 'uploads/hero-gantry.png';
    imgElem.alt = product.name;
    imgElem.onerror = () => { imgElem.src = 'uploads/hero-gantry.png'; };
  }

  if (productImages.length > 1) {
    if (prevBtn) prevBtn.style.display = 'flex';
    if (nextBtn) nextBtn.style.display = 'flex';

    if (prevBtn) {
      prevBtn.onclick = (e) => {
        e.stopPropagation();
        const prevIdx = (currentImgIndex - 1 + productImages.length) % productImages.length;
        updateSliderImage(prevIdx, 'prev');
        startAutoSlide();
      };
    }
    if (nextBtn) {
      nextBtn.onclick = (e) => {
        e.stopPropagation();
        const nextIdx = (currentImgIndex + 1) % productImages.length;
        updateSliderImage(nextIdx, 'next');
        startAutoSlide();
      };
    }

    // Keyboard navigation for image slider
    document.onkeydown = (e) => {
      if (e.key === 'ArrowLeft') {
        const prevIdx = (currentImgIndex - 1 + productImages.length) % productImages.length;
        updateSliderImage(prevIdx, 'prev');
        startAutoSlide();
      } else if (e.key === 'ArrowRight') {
        const nextIdx = (currentImgIndex + 1) % productImages.length;
        updateSliderImage(nextIdx, 'next');
        startAutoSlide();
      }
    };

    // Pause on hover over image card
    const imgCard = document.querySelector('.details-img-card');
    if (imgCard) {
      imgCard.onmouseenter = stopAutoSlide;
      imgCard.onmouseleave = startAutoSlide;
    }

    // Start auto slide
    startAutoSlide();
  } else {
    if (prevBtn) prevBtn.style.display = 'none';
    if (nextBtn) nextBtn.style.display = 'none';
  }

  if (galleryThumbs) {
    if (productImages.length > 1) {
      galleryThumbs.innerHTML = productImages.map((img, idx) => `
        <div class="thumbnail-item ${idx === 0 ? 'active' : ''}" onclick="switchDetailImage(this, ${idx})">
          <img src="${img}" alt="${product.name} View ${idx + 1}" onerror="this.src='uploads/hero-gantry.png'">
        </div>
      `).join('');
      galleryThumbs.style.display = 'flex';
    } else {
      galleryThumbs.innerHTML = '';
      galleryThumbs.style.display = 'none';
    }
  }

  window.switchDetailImage = function (elem, idx) {
    if (idx === currentImgIndex) return;
    const direction = idx > currentImgIndex ? 'next' : 'prev';
    updateSliderImage(idx, direction);
    startAutoSlide();
  };

  if (breadcrumbProduct) breadcrumbProduct.textContent = product.name;

  // Features Checklist
  const featuresList = document.getElementById('details-features');
  if (featuresList && product.features) {
    featuresList.innerHTML = product.features.map(f => `
      <li>
        <span class="feature-icon"><i class="fa-solid fa-check"></i></span>
        <span class="feature-text">${f}</span>
      </li>
    `).join('');
  }

  // Generate Dynamic Technical Specifications Table
  const specsTable = document.getElementById('details-specs-table');
  if (specsTable) {
    const PRODUCT_SPECS = {
      "prod-1": {
        "Rated Lift Capacity": "250 MT - 1200 MT",
        "Applicable Span Range": "25 m - 60 m",
        "Min. Curve Radius": "150 m",
        "Max. Longitudinal Gradient": "4.0%",
        "Control System Type": "PLC Automated Synchronous Hydraulic Lift",
        "Structural Material": "High-Grade Tensile Steel (IS 2062 Grade E250/E350)",
        "Compliance Standard": "ISO 9001:2015, EN 13001 Structural Safety Code"
      },
      "prod-2": {
        "Plate Thickness": "6 mm / 8 mm CNC Rolled Face Plates",
        "Max. Concrete Pressure": "80 kN / m²",
        "Stripping Mechanism": "Quick-release Hydraulic/Mechanical Stripping Jacks",
        "Reusability Rating": "Exceeding 300 Casting Cycles",
        "Safety System": "Integrated Safety Platforms, Handrails, and Ladders",
        "Deflection Limit": "L/1000 (Maximum deviation < 2.0 mm)",
        "Structural Alignment": "Machined Male-Female Joint System with Rubber Gaskets"
      },
      "prod-3": {
        "Structural Weight Ratio": "Lightweight High-Strength Lattice Girder Design",
        "Max Segment Length": "5.5 meters",
        "Leveling Adjustment": "Hydraulic Automatic Leveling & Elevation Adjustment",
        "Deflection Control": "Dynamic Deflection Compensation during Concrete Pouring",
        "Working Enclosure": "Integrated All-Weather Overhead Protection Canopy",
        "Load Safety Factor": "1.25x Overload Proof Tested prior to dispatch",
        "Deployment System": "Tension bar anchoring with high reusability"
      },
      "prod-4": {
        "Mould Volume Capacities": "2.0 m³ to 20.0 m³ standard sizes",
        "Sealing Design": "Dual-groove Watertight EPDM Gaskets (zero grout leakage)",
        "Locking Mechanism": "Heavy-duty Hinged Latching Bolts for rapid assembly",
        "Casting Output Rate": "Double-stripping daily cycle capacity",
        "Design Life Durability": "Exceeds 1,000 casting cycles with minimal maintenance",
        "Material Standard": "IS 2062 Grade B Structural Steel",
        "Geometric Tolerance": "± 2.0 mm on all spatial dimensions"
      },
      "prod-5": {
        "Welding Technology": "Automated Submerged Arc Welding (SAW) continuous line",
        "Quality Testing (NDT)": "100% Ultrasonic & Radiographic Tested Welds",
        "Surface Protection": "Shot-blasted to SA 2.5 standard + Zinc Chromate Primer",
        "Monthly Fabric Capacity": "Up to 750 Metric Tons",
        "Structural Cambering": "Custom engineered pre-cambering profile",
        "Max Single Span Length": "Up to 52 meters single-piece girder",
        "Steel Quality Grade": "ASTM A572 Grade 50 / IS 2062 E350"
      },
      "prod-6": {
        "Construction Method": "Movable scaffolding for in-situ deck casting",
        "Average Cycle Speed": "7 to 10 Days per 35m Viaduct Span",
        "Advancement Mechanism": "Hydraulic automatic self-advancing system",
        "Operational Wind Limit": "Fully operational up to 72 km/h wind speeds",
        "Falsework Design": "Underslung / Overhead support configurations",
        "Codes Compliance": "Indian Road Congress (IRC) & Indian Railways Standard Code"
      }
    };

    const specs = PRODUCT_SPECS[productId] || {
      "Engineering Grade": "Premium Industrial Structural Grade",
      "Design Standard": "IS / BS / AISC Standards compliant",
      "Testing Method": "100% Ultrasonic & Load Proof Tested",
      "Manufacturing Process": "CNC Laser Profile Cutting & Submerged Arc Welding"
    };

    specsTable.innerHTML = Object.entries(specs).map(([key, val]) => `
      <tr>
        <td class="spec-name">${key}</td>
        <td class="spec-val">${val}</td>
      </tr>
    `).join('');
  }

  // Set Product Name in Inquiry Form
  const formProductInput = document.getElementById('inquiry-product');
  if (formProductInput) {
    formProductInput.value = product.name;
  }

  // Inquiry Form Handler
  const inquiryForm = document.getElementById('details-inquiry-form');
  if (inquiryForm) {
    inquiryForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const clientName = document.getElementById('inquiry-name').value;
      const clientEmail = document.getElementById('inquiry-email').value;
      const clientPhone = document.getElementById('inquiry-phone').value;
      const clientMsg = document.getElementById('inquiry-message').value;

      // Save inquiry to localStorage for CMS feedback demonstration
      const inquiries = JSON.parse(localStorage.getItem('winsteel_inquiries') || '[]');
      inquiries.push({
        id: `inq-${Date.now()}`,
        productName: product.name,
        productId: product.id,
        clientName,
        clientEmail,
        clientPhone,
        clientMsg,
        date: new Date().toISOString()
      });
      localStorage.setItem('winsteel_inquiries', JSON.stringify(inquiries));

      // Show Success Modal / Toast
      showSuccessToast(product.name, clientName);

      inquiryForm.reset();
      if (formProductInput) formProductInput.value = product.name;
    });
  }

  // Related Products Grid
  const relatedGrid = document.getElementById('related-products-grid');
  if (relatedGrid && data.products) {
    const related = data.products
      .filter(p => p.id !== product.id)
      .sort((a, b) => {
        if (a.category === product.category && b.category !== product.category) return -1;
        if (a.category !== product.category && b.category === product.category) return 1;
        return 0;
      })
      .slice(0, 3);

    relatedGrid.innerHTML = related.map(p => renderProductCard(p)).join('');
  }

  // Populate recent news in footer
  populateFooterNews(data.news);
}

function showProductNotFound() {
  const container = document.querySelector('.product-details-container');
  const errorContainer = document.getElementById('details-error-state');

  if (container) container.style.display = 'none';
  if (errorContainer) {
    errorContainer.style.display = 'block';
  }
}

function showSuccessToast(productName, clientName) {
  // Create dynamic premium toast / alert popup
  const toast = document.createElement('div');
  toast.className = 'custom-success-toast';
  toast.innerHTML = `
    <div class="toast-content">
      <div class="toast-icon"><i class="fa-solid fa-circle-check"></i></div>
      <div class="toast-text">
        <h4>Inquiry Submitted Successfully!</h4>
        <p>Thank you <strong>${clientName}</strong>. Our bridge engineering team will contact you shortly regarding <strong>${productName}</strong>.</p>
      </div>
      <button class="toast-close-btn">&times;</button>
    </div>
  `;
  document.body.appendChild(toast);

  // Add animation class
  setTimeout(() => toast.classList.add('active'), 50);

  // Close triggers
  const closeBtn = toast.querySelector('.toast-close-btn');
  const dismiss = () => {
    toast.classList.remove('active');
    setTimeout(() => toast.remove(), 400);
  };

  closeBtn.addEventListener('click', dismiss);
  setTimeout(dismiss, 7000); // auto dismiss after 7s
}

// ==========================================
// PROJECT DETAILS PAGE INITIALIZATION
// ==========================================
function initProjectDetailsPage(data) {
  const params = new URLSearchParams(window.location.search);
  const projectId = params.get('id');

  const container = document.querySelector('.product-details-container');
  const errorContainer = document.getElementById('details-error-state');

  if (!projectId || !data.projects) {
    showProjectNotFound();
    return;
  }

  const project = data.projects.find(p => p.id === projectId);
  if (!project) {
    showProjectNotFound();
    return;
  }

  // Dynamic Page Title
  document.title = `${project.title} | Winsteel Engineering Works Pvt. Ltd.`;

  // Populate UI elements
  const categoryElem = document.getElementById('details-category');
  const titleElem = document.getElementById('details-title');
  const descElem = document.getElementById('details-desc');
  const clientElem = document.getElementById('details-client');
  const locationElem = document.getElementById('details-location');
  const yearElem = document.getElementById('details-year');
  const categoryMetaElem = document.getElementById('details-project-category');
  const imgElem = document.getElementById('details-img');
  const breadcrumbProject = document.getElementById('breadcrumb-project-title');

  if (categoryElem) categoryElem.textContent = project.category;
  if (titleElem) titleElem.textContent = project.title;
  if (descElem) descElem.textContent = project.description;
  if (clientElem) clientElem.textContent = project.client || 'National Authority';
  if (locationElem) locationElem.textContent = project.location || 'India';
  if (yearElem) yearElem.textContent = project.year || '2024';
  if (categoryMetaElem) categoryMetaElem.textContent = project.category;

  // Handle gallery images
  const galleryThumbs = document.getElementById('details-gallery-thumbnails');
  const projectImages = project.images || (project.image ? [project.image] : []);
  let currentImgIndex = 0;
  let autoSlideTimer = null;

  const prevBtn = document.getElementById('details-prev-btn');
  const nextBtn = document.getElementById('details-next-btn');

  const updateSliderImage = (index, direction = 'next') => {
    currentImgIndex = index;
    if (imgElem && projectImages[currentImgIndex]) {
      const outClass = direction === 'next' ? 'slide-next-out' : 'slide-prev-out';
      const inClass = direction === 'next' ? 'slide-next-in' : 'slide-prev-in';

      imgElem.classList.add(outClass);

      setTimeout(() => {
        imgElem.src = projectImages[currentImgIndex];
        imgElem.classList.remove(outClass);
        imgElem.classList.add(inClass);

        setTimeout(() => {
          imgElem.classList.remove(inClass);
        }, 320);
      }, 200);
    }

    // Update active class on thumbnails
    document.querySelectorAll('.thumbnail-item').forEach((thumb, idx) => {
      if (idx === currentImgIndex) {
        thumb.classList.add('active');
        thumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      } else {
        thumb.classList.remove('active');
      }
    });
  };

  const startAutoSlide = () => {
    stopAutoSlide();
    if (projectImages.length > 1) {
      autoSlideTimer = setInterval(() => {
        const nextIdx = (currentImgIndex + 1) % projectImages.length;
        updateSliderImage(nextIdx, 'next');
      }, 5000);
    }
  };

  const stopAutoSlide = () => {
    if (autoSlideTimer) {
      clearInterval(autoSlideTimer);
      autoSlideTimer = null;
    }
  };

  if (imgElem) {
    imgElem.src = projectImages[0] || 'uploads/metro-viaduct.png';
    imgElem.alt = project.title;
    imgElem.onerror = () => { imgElem.src = 'uploads/metro-viaduct.png'; };
  }

  if (projectImages.length > 1) {
    if (prevBtn) prevBtn.style.display = 'flex';
    if (nextBtn) nextBtn.style.display = 'flex';

    if (prevBtn) {
      prevBtn.onclick = (e) => {
        e.stopPropagation();
        const prevIdx = (currentImgIndex - 1 + projectImages.length) % projectImages.length;
        updateSliderImage(prevIdx, 'prev');
        startAutoSlide();
      };
    }
    if (nextBtn) {
      nextBtn.onclick = (e) => {
        e.stopPropagation();
        const nextIdx = (currentImgIndex + 1) % projectImages.length;
        updateSliderImage(nextIdx, 'next');
        startAutoSlide();
      };
    }

    // Keyboard navigation for image slider
    document.onkeydown = (e) => {
      if (e.key === 'ArrowLeft') {
        const prevIdx = (currentImgIndex - 1 + projectImages.length) % projectImages.length;
        updateSliderImage(prevIdx, 'prev');
        startAutoSlide();
      } else if (e.key === 'ArrowRight') {
        const nextIdx = (currentImgIndex + 1) % projectImages.length;
        updateSliderImage(nextIdx, 'next');
        startAutoSlide();
      }
    };

    // Pause on hover over image card
    const imgCard = document.querySelector('.details-img-card');
    if (imgCard) {
      imgCard.onmouseenter = stopAutoSlide;
      imgCard.onmouseleave = startAutoSlide;
    }

    // Start auto slide
    startAutoSlide();
  } else {
    if (prevBtn) prevBtn.style.display = 'none';
    if (nextBtn) nextBtn.style.display = 'none';
  }

  if (galleryThumbs) {
    if (projectImages.length > 1) {
      galleryThumbs.innerHTML = projectImages.map((img, idx) => `
        <div class="thumbnail-item ${idx === 0 ? 'active' : ''}" onclick="switchDetailImage(this, ${idx})">
          <img src="${img}" alt="${project.title} View ${idx + 1}" onerror="this.src='uploads/metro-viaduct.png'">
        </div>
      `).join('');
      galleryThumbs.style.display = 'flex';
    } else {
      galleryThumbs.innerHTML = '';
      galleryThumbs.style.display = 'none';
    }
  }

  window.switchDetailImage = function (elem, idx) {
    if (idx === currentImgIndex) return;
    const direction = idx > currentImgIndex ? 'next' : 'prev';
    updateSliderImage(idx, direction);
    startAutoSlide();
  };

  if (breadcrumbProject) breadcrumbProject.textContent = project.title;

  // Specifications Parsing
  const specsList = document.getElementById('details-specs-list');
  const specsSection = document.querySelector('.details-specs-section');
  if (specsList) {
    if (project.specs) {
      const specItems = project.specs.split('|');
      specsList.innerHTML = specItems.map(spec => {
        const parts = spec.split(':');
        const label = parts[0] ? parts[0].trim() : 'Spec';
        const val = parts[1] ? parts[1].trim() : '';
        return `
          <div class="project-spec-item">
            <span class="spec-label">${label}</span>
            <span class="spec-val">${val || 'Compliant'}</span>
          </div>
        `;
      }).join('');
      if (specsSection) specsSection.style.display = 'block';
    } else {
      if (specsSection) specsSection.style.display = 'none';
    }
  }

  // Inquiry Form Integration
  const inquiryForm = document.getElementById('details-inquiry-form');
  const inquiryProdInput = document.getElementById('inquiry-project');

  if (inquiryProdInput) {
    inquiryProdInput.value = project.title;
  }

  if (inquiryForm) {
    inquiryForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const clientName = document.getElementById('inquiry-name').value.trim();

      // Trigger success Toast popup
      showSuccessToast(project.title, clientName);

      // Reset form fields
      inquiryForm.reset();
      if (inquiryProdInput) {
        inquiryProdInput.value = project.title;
      }
    });
  }

  // Populate Related Projects Showcase (up to 3 in same category or catalog)
  const relatedGrid = document.getElementById('related-projects-grid');
  if (relatedGrid && data.projects) {
    const related = data.projects
      .filter(p => p.id !== project.id && (p.category === project.category || p.featured))
      .slice(0, 3);

    if (related.length > 0) {
      relatedGrid.innerHTML = related.map(p => renderProjectCard(p)).join('');
    } else {
      // Fallback: slice any first 3 projects
      relatedGrid.innerHTML = data.projects.filter(p => p.id !== project.id).slice(0, 3).map(p => renderProjectCard(p)).join('');
    }
  }

  populateFooterNews(data.news);
}

function showProjectNotFound() {
  const container = document.querySelector('.product-details-container');

  if (container) container.innerHTML = `
    <div style="text-align: center; padding: 120px 20px; background: #fff; border-radius: 24px; border: 1px solid #e2e8f0; max-width: 680px; margin: 40px auto; box-shadow: var(--shadow-md);">
      <i class="fa-solid fa-triangle-exclamation" style="font-size: 64px; color: #ef4444; margin-bottom: 24px;"></i>
      <h2 style="font-size: 28px; color: #0f172a; margin-bottom: 12px;">Case Study Not Found</h2>
      <p style="color: #64748b; font-size: 17px; margin-bottom: 30px;">The requested infrastructure project cannot be retrieved from the database, or does not exist.</p>
      <a href="projects.html" class="btn-inquiry" style="display: inline-block; padding: 12px 30px;"><i class="fa-solid fa-arrow-left"></i> Return to Projects Portfolio</a>
    </div>
  `;
}

function initInfraShowcase() {
  const tabs = document.querySelectorAll('.infra-tab');
  const views = document.querySelectorAll('.infra-view');
  
  if (tabs.length === 0) return;
  
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Deactivate all tabs & views
      tabs.forEach(t => t.classList.remove('active'));
      views.forEach(v => v.classList.remove('active'));
      
      // Activate clicked tab
      tab.classList.add('active');
      
      // Activate matching view
      const targetUnit = tab.getAttribute('data-unit');
      const targetView = document.getElementById(targetUnit);
      if (targetView) {
        targetView.classList.add('active');
      }
    });
  });
}

// ==========================================
// INTERACTIVE STICKY VISUAL SWITCHER
// ==========================================
window.switchStickyImage = function(imgSrc, btnElem) {
  const imgElem = document.getElementById('sticky-showcase-img');
  if (imgElem) {
    imgElem.style.opacity = '0';
    setTimeout(() => {
      imgElem.src = imgSrc;
      imgElem.style.opacity = '1';
    }, 200);
  }
  if (btnElem && btnElem.parentElement) {
    const tabs = btnElem.parentElement.querySelectorAll('.sticky-tab');
    tabs.forEach(t => t.classList.remove('active'));
    btnElem.classList.add('active');
  }
};

// ==========================================
// NEWS PAGE & DETAILS PAGE INITIALIZATION
// ==========================================
function initNewsPage(data) {
  const container = document.getElementById('news-bento-container');
  const categoriesNav = document.getElementById('news-categories-nav-list');
  const searchInput = document.getElementById('news-search');
  const searchBtn = document.getElementById('news-search-btn');
  const filterBar = document.getElementById('news-active-filter-bar');
  const filterVal = document.getElementById('news-active-category');

  let currentCategory = 'All';
  let searchQuery = '';

  // Parse search query from URL parameter if directed from elsewhere
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has('search')) {
    searchQuery = urlParams.get('search').toLowerCase().trim();
    if (searchInput) searchInput.value = urlParams.get('search');
  }

  // Bind clear filters function to window
  window.clearNewsFilters = function() {
    currentCategory = 'All';
    searchQuery = '';
    if (searchInput) searchInput.value = '';
    renderCategoryPills();
    renderFilteredNews();
  };

  // Populate dynamic category items in the toolbar
  function renderCategoryPills() {
    if (!categoriesNav || !data.news) return;

    // Get categories count dynamically
    const catCounts = { 'All': data.news.length };
    data.news.forEach(n => {
      if (n.category) {
        catCounts[n.category] = (catCounts[n.category] || 0) + 1;
      }
    });

    categoriesNav.innerHTML = Object.keys(catCounts).map(cat => `
      <li style="margin: 0;">
        <button class="bento-cat-pill ${cat === currentCategory ? 'active' : ''}" data-category="${cat}" style="padding: 8px 18px; border-radius: 30px; font-size: 13.5px; font-weight: 700; transition: all 0.3s; border: 1px solid #cbd5e1; background: #ffffff; color: var(--primary-navy); cursor: pointer; display: flex; align-items: center; gap: 8px;">
          <span>${cat}</span>
          <span class="pill-count" style="font-size: 11px; padding: 2px 8px; border-radius: 20px; background: rgba(0,70,128,0.06); color: var(--primary-blue); font-weight: 700; transition: all 0.3s;">${catCounts[cat]}</span>
        </button>
      </li>
    `).join('');

    // Attach click events
    categoriesNav.querySelectorAll('.bento-cat-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        currentCategory = btn.getAttribute('data-category');
        renderCategoryPills();
        renderFilteredNews();
      });
    });
  }

  // Setup search bindings
  if (searchBtn && searchInput) {
    searchBtn.addEventListener('click', () => {
      searchQuery = searchInput.value.toLowerCase().trim();
      renderFilteredNews();
    });
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        searchQuery = searchInput.value.toLowerCase().trim();
        renderFilteredNews();
      }
    });
  }

  // Main rendering engine using Bento Grid blocks
  function renderFilteredNews() {
    if (!container || !data.news) return;

    const filtered = data.news.filter(n => {
      const matchesCategory = currentCategory === 'All' || n.category === currentCategory;
      const matchesSearch = n.title.toLowerCase().includes(searchQuery) ||
        (n.excerpt && n.excerpt.toLowerCase().includes(searchQuery)) ||
        (n.category && n.category.toLowerCase().includes(searchQuery));
      return matchesCategory && matchesSearch;
    });

    // Update active filter strip
    if (filterBar && filterVal) {
      if (currentCategory !== 'All' || searchQuery !== '') {
        filterBar.style.display = 'flex';
        let filterText = '';
        if (currentCategory !== 'All') filterText += `Category: "${currentCategory}"`;
        if (searchQuery !== '') {
          if (filterText !== '') filterText += ' & ';
          filterText += `Search: "${searchQuery}"`;
        }
        filterVal.textContent = filterText;
      } else {
        filterBar.style.display = 'none';
      }
    }

    if (filtered.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 80px 20px; background: #ffffff; border-radius: 16px; border: 1.5px dashed #cbd5e1;">
          <i class="fa-solid fa-magnifying-glass" style="font-size: 48px; color: #94a3b8; margin-bottom: 16px;"></i>
          <h3 style="font-size: 24px; color: var(--primary-navy); margin-bottom: 8px;">No news articles matched your query</h3>
          <p style="color: #64748b;">Try adjusting your keywords or category filters.</p>
        </div>`;
      return;
    }

    let html = '';

    // CARD 0: Featured spotlight spanning 2 columns
    const featured = filtered[0];
    html += `
      <!-- Bento Card: Featured Spotlight -->
      <div class="bento-card bento-featured" style="grid-column: span 2; min-height: 480px; position: relative; border-radius: 20px; overflow: hidden; display: flex; flex-direction: column; justify-content: flex-end; padding: 40px; box-shadow: 0 10px 30px rgba(0,0,0,0.06); border: 1px solid #cbd5e1; background: #0f172a; transition: all 0.35s ease;">
        <a href="news-details.html?id=${featured.id}" class="bento-overlay-link" style="position: absolute; top:0; left:0; width:100%; height:100%; z-index: 2;"></a>
        <img src="${featured.image}" alt="${featured.title}" style="position: absolute; top:0; left:0; width:100%; height:100%; object-fit: cover; opacity: 0.75; transition: transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);" class="bento-bg-img" onerror="this.src='Winsteel Trans Logo.png'">
        <div class="bento-gradient-overlay" style="position: absolute; top:0; left:0; width:100%; height:100%; background: linear-gradient(to top, rgba(9, 14, 26, 0.95) 0%, rgba(9, 14, 26, 0.4) 60%, transparent 100%); z-index: 1;"></div>
        <div class="image-blueprint-pattern" style="opacity: 0.12;"></div>
        
        <div class="bento-featured-content" style="position: relative; z-index: 3; color: #ffffff; max-width: 90%;">
          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 16px;">
            <span style="background: #fbbf24; color: #0f172a; font-size: 11px; font-weight: 800; text-transform: uppercase; padding: 4px 10px; border-radius: 4px; letter-spacing: 0.5px;">${featured.date}</span>
            <span style="color: #cbd5e1; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">${featured.category}</span>
          </div>
          <h2 style="font-size: 34px; font-weight: 800; line-height: 1.25; margin-bottom: 16px; font-family: var(--font-display); letter-spacing: -0.5px;">
            <a href="news-details.html?id=${featured.id}" class="bento-title-white" style="color: #ffffff; text-decoration: none; transition: color 0.3s;">${featured.title}</a>
          </h2>
          <p style="font-size: 15.5px; color: #cbd5e1; line-height: 1.6; margin-bottom: 24px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${featured.excerpt || ''}</p>
          <div style="display: flex; align-items: center; justify-content: space-between; border-top: 1px solid rgba(255,255,255,0.15); padding-top: 18px;">
            <span style="font-size: 13px; color: #cbd5e1; font-weight: 600;"><i class="fa-solid fa-user-pen"></i> by ${featured.author || 'WinSteelAdmin'}</span>
            <span class="btn-card-link" style="color: #fbbf24; font-weight: 700; font-size: 14.5px;">Read Spotlight <i class="fa-solid fa-arrow-right"></i></span>
          </div>
        </div>
      </div>
    `;

    // CARD 1: Secondary card spanning 1 column
    if (filtered.length > 1) {
      const sec = filtered[1];
      html += `
        <!-- Bento Card: Secondary -->
        <div class="bento-card bento-secondary" style="border-radius: 20px; overflow: hidden; background: #ffffff; border: 1px solid #cbd5e1; display: flex; flex-direction: column; box-shadow: 0 10px 30px rgba(0,0,0,0.03); transition: all 0.35s ease;">
          <div class="bento-img-box" style="position: relative; height: 210px; overflow: hidden; background: #0f172a;">
            <img src="${sec.image}" alt="${sec.title}" style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);" class="bento-bg-img" onerror="this.src='Winsteel Trans Logo.png'">
            <span style="background: rgba(15,23,42,0.9); color: #fbbf24; border: 1px solid rgba(251,191,36,0.3); font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 30px; position: absolute; top: 14px; left: 14px; z-index: 2;">${sec.category}</span>
            <div class="image-blueprint-pattern"></div>
          </div>
          <div style="padding: 26px; display: flex; flex-direction: column; flex: 1; justify-content: space-between;">
            <div>
              <div style="font-size: 12.5px; color: var(--text-muted); font-weight: 600; margin-bottom: 10px;"><i class="fa-regular fa-calendar"></i> ${sec.date}</div>
              <h3 style="font-size: 20px; font-weight: 700; color: var(--primary-navy); margin-bottom: 12px; line-height: 1.4;">
                <a href="news-details.html?id=${sec.id}" class="blog-title-link" style="color: inherit; text-decoration: none;">${sec.title}</a>
              </h3>
              <p style="font-size: 14.5px; color: var(--text-muted); line-height: 1.6; margin-bottom: 20px; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;">${sec.excerpt || ''}</p>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #f1f5f9; padding-top: 16px; margin-top: auto;">
              <span style="font-size: 12px; font-weight: 600; color: var(--primary-blue);"><i class="fa-solid fa-user"></i> WinSteelAdmin</span>
              <a href="news-details.html?id=${sec.id}" class="btn-card-link" style="font-weight: 700; color: var(--primary-blue); font-size: 13.5px;">Read More <i class="fa-solid fa-arrow-right"></i></a>
            </div>
          </div>
        </div>
      `;
    }

    // ROW 2 STATIC CARDS: Decor Stats (1 col) + Project CTA (2 cols)
    html += `
      <!-- Bento Card: Stats Callout -->
      <div class="bento-card bento-decor" style="border-radius: 20px; overflow: hidden; background: linear-gradient(135deg, #090e1a 0%, #004680 100%); border: 1px solid rgba(243, 173, 27, 0.3); display: flex; flex-direction: column; justify-content: center; padding: 40px; box-shadow: 0 10px 30px rgba(0,0,0,0.08); position: relative; min-height: 320px; transition: all 0.35s ease;">
        <div class="image-blueprint-pattern" style="opacity: 0.12;"></div>
        <div style="position: relative; z-index: 2; text-align: center; color: #ffffff;">
          <div style="font-size: 54px; font-weight: 800; font-family: var(--font-display); color: #fbbf24; line-height: 1; margin-bottom: 8px;">25+</div>
          <div style="font-size: 14px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px; color: #ffffff; margin-bottom: 24px;">Years of Excellence</div>
          <p style="font-size: 14px; color: #cbd5e1; line-height: 1.6; margin: 0;">Pioneering state-of-the-art bridge building and heavy structural engineering components across India.</p>
        </div>
      </div>

      <!-- Bento Card: Project CTA -->
      <div class="bento-card bento-cta" style="grid-column: span 2; border-radius: 20px; overflow: hidden; background: #ffffff; border: 1px solid #cbd5e1; box-shadow: 0 10px 30px rgba(0,0,0,0.03); display: flex; align-items: center; padding: 40px; gap: 30px; position: relative; min-height: 320px; transition: all 0.35s ease;">
        <div class="image-blueprint-pattern" style="opacity: 0.05;"></div>
        <div style="flex: 1; position: relative; z-index: 2;">
          <span style="color: var(--accent-gold); font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; display: block; margin-bottom: 12px;">HAVE A PROJECT REQUIREMENT?</span>
          <h3 style="font-size: 26px; font-weight: 800; color: var(--primary-navy); margin-bottom: 16px; font-family: var(--font-display); line-height: 1.3;">Let's engineer the future of infrastructure together</h3>
          <p style="font-size: 15px; color: var(--text-muted); line-height: 1.6; margin-bottom: 0;">Connect with our design office to discuss custom formwork moulds, launching gantries, or steel structure designs tailored to your specs.</p>
        </div>
        <div style="position: relative; z-index: 2;">
          <a href="contact.html" class="btn-primary" style="white-space: nowrap; padding: 14px 28px; border-radius: 6px; font-weight: 700; text-decoration: none; font-size: 14.5px; box-shadow: 0 4px 12px rgba(0,70,128,0.15); display: inline-block;">Get in Touch</a>
        </div>
      </div>
    `;

    // ROW 3+: Subsequent articles rendered as horizontal full-width bento rows
    if (filtered.length > 2) {
      filtered.slice(2).forEach((n, idx) => {
        const isEven = idx % 2 === 0;
        const flexDir = isEven ? 'row' : 'row-reverse';
        html += `
          <!-- Bento Card: Row Layout -->
          <div class="bento-card bento-row" style="grid-column: span 3; display: flex; flex-direction: ${flexDir}; border-radius: 20px; overflow: hidden; background: #ffffff; border: 1px solid #cbd5e1; box-shadow: 0 10px 30px rgba(0,0,0,0.03); min-height: 280px; transition: all 0.35s ease;">
            <div class="bento-img-box" style="position: relative; width: 38%; min-width: 280px; overflow: hidden; background: #0f172a;">
              <img src="${n.image}" alt="${n.title}" style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);" class="bento-bg-img" onerror="this.src='Winsteel Trans Logo.png'">
              <span style="background: rgba(15,23,42,0.9); color: #fbbf24; border: 1px solid rgba(251,191,36,0.3); font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 30px; position: absolute; top: 16px; left: 16px; z-index: 2;">${n.category}</span>
              <div class="image-blueprint-pattern"></div>
            </div>
            <div style="padding: 34px; flex: 1; display: flex; flex-direction: column; justify-content: center;">
              <div style="font-size: 13px; color: var(--text-muted); font-weight: 600; margin-bottom: 12px;">
                <i class="fa-regular fa-calendar-days"></i> ${n.date}
              </div>
              <h3 style="font-size: 24px; font-weight: 800; color: var(--primary-navy); margin-bottom: 14px; line-height: 1.3; font-family: var(--font-display);">
                <a href="news-details.html?id=${n.id}" class="blog-title-link" style="color: inherit; text-decoration: none;">${n.title}</a>
              </h3>
              <p style="font-size: 15px; color: var(--text-muted); line-height: 1.65; margin-bottom: 24px; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;">${n.excerpt || ''}</p>
              <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #f1f5f9; padding-top: 18px; margin-top: auto;">
                <span style="font-size: 13px; font-weight: 600; color: var(--primary-blue);"><i class="fa-solid fa-user-pen"></i> by ${n.author || 'WinSteelAdmin'}</span>
                <a href="news-details.html?id=${n.id}" class="btn-card-link" style="font-weight: 700; color: var(--primary-blue); font-size: 14.5px;">Read Full Article <i class="fa-solid fa-arrow-right"></i></a>
              </div>
            </div>
          </div>
        `;
      });
    }

    container.innerHTML = html;
  }

  renderCategoryPills();
  renderFilteredNews();
  populateFooterNews(data.news);
}

function initNewsDetailsPage(data) {
  const params = new URLSearchParams(window.location.search);
  let newsId = params.get('id');

  // Fallback to the first news article if ID is missing or invalid
  if ((!newsId || !data.news || !data.news.find(n => n.id === newsId)) && data.news && data.news.length > 0) {
    newsId = data.news[0].id;
  }

  const contentBody = document.getElementById('news-detail-content-body');
  
  if (!newsId || !data.news) {
    showNewsNotFound();
    return;
  }

  const article = data.news.find(n => n.id === newsId);
  if (!article) {
    showNewsNotFound();
    return;
  }

  // Set page titles
  document.title = `${article.title} | Winsteel Engineering Works Pvt. Ltd.`;
  
  // Populate elements
  const breadcrumbTitle = document.getElementById('breadcrumb-news-title');
  const categoryElem = document.getElementById('news-detail-category');
  const dateElem = document.getElementById('news-detail-date');
  const titleElem = document.getElementById('news-detail-title');
  const authorElem = document.getElementById('news-detail-author');
  const imgElem = document.getElementById('news-detail-image');

  if (breadcrumbTitle) breadcrumbTitle.textContent = article.title;
  if (categoryElem) categoryElem.textContent = article.category;
  if (dateElem) dateElem.innerHTML = `<i class="fa-regular fa-calendar-days"></i> ${article.date}`;
  if (titleElem) titleElem.textContent = article.title;
  if (authorElem) authorElem.textContent = article.author || 'WinSteelAdmin';
  if (imgElem) {
    imgElem.src = article.image || 'Winsteel Trans Logo.png';
    imgElem.alt = article.title;
  }

  if (contentBody) {
    contentBody.innerHTML = article.content || `<p>${article.excerpt || 'No content available for this article.'}</p>`;
  }

  // Populate sidebar recent posts
  const recentPostsList = document.getElementById('sidebar-recent-posts');
  if (recentPostsList && data.news) {
    recentPostsList.innerHTML = data.news.slice(0, 5).map(n => `
      <li>
        <a href="news-details.html?id=${n.id}" class="${n.id === newsId ? 'active' : ''}">${n.title}</a>
      </li>
    `).join('');
  }

  // Populate bottom Prev/Next links
  const prevBtn = document.getElementById('nav-prev-article');
  const nextBtn = document.getElementById('nav-next-article');
  
  const currIndex = data.news.findIndex(n => n.id === newsId);
  
  if (currIndex > 0) {
    const prevArticle = data.news[currIndex - 1];
    if (prevBtn) {
      prevBtn.href = `news-details.html?id=${prevArticle.id}`;
      prevBtn.innerHTML = `<i class="fa-solid fa-arrow-left"></i> ${prevArticle.title.slice(0, 25)}...`;
      prevBtn.style.display = 'inline-flex';
    }
  } else {
    if (prevBtn) prevBtn.style.display = 'none';
  }

  if (currIndex !== -1 && currIndex < data.news.length - 1) {
    const nextArticle = data.news[currIndex + 1];
    if (nextBtn) {
      nextBtn.href = `news-details.html?id=${nextArticle.id}`;
      nextBtn.innerHTML = `${nextArticle.title.slice(0, 25)}... <i class="fa-solid fa-arrow-right"></i>`;
      nextBtn.style.display = 'inline-flex';
    }
  } else {
    if (nextBtn) nextBtn.style.display = 'none';
  }

  // Populate footer
  populateFooterNews(data.news);

  // Render dynamic comments & sidebar widgets (recent comments, archives, categories)
  renderArticleComments(newsId);
  renderRecentCommentsSidebar();
  renderArchivesSidebar(data.news);
  renderCategoriesSidebar(data.news);
}

function showNewsNotFound() {
  const container = document.querySelector('.blog-details-container');
  if (container) {
    container.innerHTML = `<div style="text-align: center; padding: 100px 20px;">
      <i class="fa-solid fa-triangle-exclamation" style="font-size: 64px; color: #ef4444; margin-bottom: 24px;"></i>
      <h2>Article Not Found</h2>
      <p style="color: #64748b; font-size: 17px; max-width: 500px; margin: 12px auto 28px;">The requested article does not exist or has been archived.</p>
      <a href="news.html" class="btn-inquiry" style="display: inline-flex;"><i class="fa-solid fa-arrow-left"></i> Back to News Listing</a>
    </div>`;
  }
}

/* ==========================================
 * DYNAMIC COMMENTS ENGINE
 * ========================================== */
const DEFAULT_COMMENTS = [
  {
    id: "comment-mock-1",
    newsId: "news-1",
    newsTitle: "How to choose a leading construction company in India?",
    author: "Ramesh Kumar",
    email: "ramesh@example.com",
    comment: "This is a really helpful guide! Choosing the right formwork makes a huge difference in the construction timeline and overall safety.",
    date: "June 25, 2020"
  },
  {
    id: "comment-mock-2",
    newsId: "news-2",
    newsTitle: "Winsteel commissions India's longest U-Girder Mould for high-speed rail",
    author: "Sanjay Mehta",
    email: "sanjay@example.com",
    comment: "Impressive engineering work. The U-Girder Mould cycle time reduction of 45 minutes is a game changer for high-speed rail projects.",
    date: "May 19, 2023"
  },
  {
    id: "comment-mock-3",
    newsId: "news-2",
    newsTitle: "Winsteel commissions India's longest U-Girder Mould for high-speed rail",
    author: "WinSteelAdmin",
    email: "admin@winsteel.in",
    comment: "Thank you Sanjay! Our design office put in a lot of effort to achieve sub-millimeter precision for this mold.",
    date: "May 20, 2023"
  }
];

function getComments() {
  let comments = localStorage.getItem('winsteel_comments');
  if (!comments) {
    comments = DEFAULT_COMMENTS;
    localStorage.setItem('winsteel_comments', JSON.stringify(comments));
  } else {
    comments = JSON.parse(comments);
    // Auto-update titles and dates of existing comments to match current database titles
    let changed = false;
    const data = window.WINSTEEL_DATA || {};
    const newsList = data.news || [];
    comments.forEach(c => {
      const art = newsList.find(n => n.id === c.newsId);
      if (art) {
        if (c.newsTitle !== art.title) {
          c.newsTitle = art.title;
          changed = true;
        }
        if (c.id === "comment-mock-1" && c.date !== "June 25, 2020") {
          c.date = "June 25, 2020";
          changed = true;
        }
      }
    });
    if (changed) {
      localStorage.setItem('winsteel_comments', JSON.stringify(comments));
    }
  }
  return comments;
}

function renderArticleComments(newsId) {
  const commentsSection = document.getElementById('article-comments-section');
  const commentsList = document.getElementById('article-comments-list');
  const commentsCount = document.getElementById('article-comments-count');

  if (!commentsSection || !commentsList || !commentsCount) return;

  const comments = getComments().filter(c => c.newsId === newsId);

  if (comments.length === 0) {
    commentsSection.style.display = 'none';
    return;
  }

  commentsCount.textContent = comments.length;
  commentsList.innerHTML = comments.map(c => {
    const initial = c.author ? c.author.charAt(0) : 'U';
    return `
      <div class="comment-item">
        <div class="comment-avatar">${initial}</div>
        <div class="comment-body">
          <div class="comment-header">
            <span class="comment-author-name">${c.author}</span>
            <span class="comment-post-date">${c.date}</span>
          </div>
          <div class="comment-content">${c.comment}</div>
        </div>
      </div>
    `;
  }).join('');

  commentsSection.style.display = 'block';
}

function renderRecentCommentsSidebar() {
  const sidebarList = document.getElementById('sidebar-recent-comments');
  if (!sidebarList) return;

  const comments = getComments().slice(0, 3); // Get 3 most recent comments

  sidebarList.innerHTML = comments.map(c => `
    <li>
      <div class="comment-meta">By <strong>${c.author}</strong> on</div>
      <a href="news-details.html?id=${c.newsId}">${c.newsTitle}</a>
    </li>
  `).join('');
}

window.handleCommentSubmit = function(e) {
  e.preventDefault();
  const params = new URLSearchParams(window.location.search);
  const newsId = params.get('id');
  if (!newsId) return;

  const nameInput = document.getElementById('comment-name');
  const emailInput = document.getElementById('comment-email');
  const textInput = document.getElementById('comment-text');

  if (!nameInput || !emailInput || !textInput) return;

  const name = nameInput.value.trim();
  const email = emailInput.value.trim();
  const commentText = textInput.value.trim();

  if (!name || !email || !commentText) return;

  // Get the article title from global data
  const data = window.WINSTEEL_DATA || {};
  const article = (data.news || []).find(n => n.id === newsId);
  const newsTitle = article ? article.title : "News Article";

  // Format current date: "July 11, 2026"
  const dateOptions = { year: 'numeric', month: 'long', day: 'numeric' };
  const formattedDate = new Date().toLocaleDateString('en-US', dateOptions);

  // Create new comment
  const newComment = {
    id: `comment-${Date.now()}`,
    newsId,
    newsTitle,
    author: name,
    email,
    comment: commentText,
    date: formattedDate
  };

  const comments = getComments();
  comments.unshift(newComment); // Add new comment at the top of list
  localStorage.setItem('winsteel_comments', JSON.stringify(comments));

  // Refresh UI instantly
  renderArticleComments(newsId);
  renderRecentCommentsSidebar();

  // Show success toast notification
  showCommentSuccessToast(name);

  document.getElementById('blog-comment-form').reset();
};

function showCommentSuccessToast(authorName) {
  const toast = document.createElement('div');
  toast.className = 'custom-success-toast';
  toast.innerHTML = `
    <div class="toast-content">
      <div class="toast-icon" style="color: #10b981;"><i class="fa-solid fa-circle-check"></i></div>
      <div class="toast-text">
        <h4>Comment Posted!</h4>
        <p>Thank you, <strong>${authorName}</strong>. Your comment has been published successfully.</p>
      </div>
      <button class="toast-close-btn">&times;</button>
    </div>
  `;
  document.body.appendChild(toast);
  setTimeout(() => toast.classList.add('active'), 50);

  const dismiss = () => {
    toast.classList.remove('active');
    setTimeout(() => toast.remove(), 400);
  };

  toast.querySelector('.toast-close-btn').addEventListener('click', dismiss);
  setTimeout(dismiss, 5000);
}

function renderArchivesSidebar(newsList) {
  const archivesList = document.getElementById('sidebar-archives');
  if (!archivesList || !newsList) return;
  
  const archiveMonths = [...new Set(newsList.map(n => {
    const parts = n.date.split(' ');
    if (parts.length >= 3) {
      return `${parts[0]} ${parts[2]}`;
    }
    return 'June 2020';
  }))];

  archivesList.innerHTML = archiveMonths.map(month => `
    <li>
      <a href="news.html">${month}</a>
    </li>
  `).join('');
}

function renderCategoriesSidebar(newsList) {
  const categoriesList = document.getElementById('sidebar-categories');
  if (!categoriesList || !newsList) return;

  const categories = [...new Set(newsList.map(n => n.category || 'Uncategorized'))];

  categoriesList.innerHTML = categories.map(cat => `
    <li>
      <a href="news.html">${cat}</a>
    </li>
  `).join('');
}

function initContactPage() {
  const contactForm = document.getElementById('winsteel-contact-form');
  if (!contactForm) return;

  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const clientName = document.getElementById('contact-name').value.trim();
    const clientEmail = document.getElementById('contact-email').value.trim();
    const subject = document.getElementById('contact-subject').value.trim();
    const message = document.getElementById('contact-message').value.trim();

    // Save inquiry to localStorage for CMS feedback demonstration
    const inquiries = JSON.parse(localStorage.getItem('winsteel_inquiries') || '[]');
    inquiries.push({
      id: `inq-${Date.now()}`,
      productName: 'General Inquiry / Contact Form',
      productId: 'contact-page',
      clientName,
      clientEmail,
      clientPhone: 'N/A',
      clientMsg: `[Subject: ${subject}] ${message}`,
      date: new Date().toISOString()
    });
    localStorage.setItem('winsteel_inquiries', JSON.stringify(inquiries));

    // Show Success Toast popup
    showContactSuccessToast(subject, clientName);

    // Reset form fields
    contactForm.reset();
  });
}

function showContactSuccessToast(subject, clientName) {
  const toast = document.createElement('div');
  toast.className = 'custom-success-toast';
  toast.innerHTML = `
    <div class="toast-content">
      <div class="toast-icon" style="color: #10b981;"><i class="fa-solid fa-circle-check"></i></div>
      <div class="toast-text">
        <h4>Message Sent!</h4>
        <p>Thank you <strong>${clientName}</strong>. Our engineering office has received your message regarding <strong>${subject}</strong> and will follow up shortly.</p>
      </div>
      <button class="toast-close-btn">&times;</button>
    </div>
  `;
  document.body.appendChild(toast);
  setTimeout(() => toast.classList.add('active'), 50);

  const dismiss = () => {
    toast.classList.remove('active');
    setTimeout(() => toast.remove(), 400);
  };

  toast.querySelector('.toast-close-btn').addEventListener('click', dismiss);
  setTimeout(dismiss, 6000);
}
