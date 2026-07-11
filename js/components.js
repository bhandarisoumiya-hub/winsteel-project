/**
 * WINSTEEL REUSABLE HEADER & FOOTER COMPONENTS SYSTEM
 * This file centralizes the Topbar, Navigation Bar, Footer, and Modal markup.
 * Any change to header or footer here will automatically reflect across all pages!
 */

const WINSTEEL_COMPONENTS = {
  getTopbar: () => '',

  getNavbar: (activePage) => {
    const isHome = activePage === 'home' ? 'active' : '';
    const isProducts = (activePage === 'products' || activePage === 'product-details') ? 'active' : '';
    const isProjects = activePage === 'projects' ? 'active' : '';
    const isWinsteel = ['about', 'core-values', 'our-history'].includes(activePage) ? 'active' : '';
    const isNews = (activePage === 'news' || activePage === 'news-details') ? 'active' : '';
    const isContact = activePage === 'contact' ? 'active' : '';
    
    const isAboutItem = activePage === 'about' ? 'active' : '';
    const isCoreValuesItem = activePage === 'core-values' ? 'active' : '';
    const isOurHistoryItem = activePage === 'our-history' ? 'active' : '';

    return `
    <header class="navbar">
      <div class="container nav-container">
        <a href="index.html" class="brand-logo">
          <div class="brand-logo-box">
            <img src="Winsteel Trans Logo.png" alt="Winsteel Logo" class="brand-logo-img" onerror="if(!this.dataset.tried){this.dataset.tried=1;this.src='uploads/Winsteel Trans Logo.png';}else{this.style.display='none';if(this.nextElementSibling)this.nextElementSibling.style.display='flex';}">
            <div class="brand-icon" style="display:none;">W</div>
          </div>
        </a>
        <nav>
          <ul class="nav-menu">
            <li><a href="index.html" class="nav-link ${isHome}">Home</a></li>
            <li class="nav-item dropdown">
              <a class="nav-link dropdown-toggle ${isWinsteel}">Winsteel <i class="fa-solid fa-chevron-down dropdown-icon"></i></a>
              <ul class="dropdown-menu">
                <li><a href="about.html" class="dropdown-item ${isAboutItem}"><i class="fa-solid fa-building"></i> About Company</a></li>
                <li><a href="core-values.html" class="dropdown-item ${isCoreValuesItem}"><i class="fa-solid fa-gem"></i> Core Values</a></li>
                <li><a href="our-history.html" class="dropdown-item ${isOurHistoryItem}"><i class="fa-solid fa-clock-rotate-left"></i> Our History</a></li>
              </ul>
            </li>
            <li><a href="products.html" class="nav-link ${isProducts}">Products</a></li>
            <li><a href="projects.html" class="nav-link ${isProjects}">Projects</a></li>
            <li><a href="news.html" class="nav-link ${isNews}">News</a></li>
            <li><a href="contact.html" class="nav-link ${isContact}">Contact</a></li>
            <li><a href="products.html" class="btn-inquiry"><i class="fa-solid fa-bolt"></i> Equipment Catalog</a></li>
          </ul>
        </nav>
      </div>
    </header>
    `;
  },

  getFooter: () => `
    <footer id="contact" class="footer">
      <div class="container">
        <div class="footer-grid">
          <div class="footer-brand">
            <h2>Winsteel Engineering Works</h2>
            <p>Pioneer & leading Formwork, Falsework, and Bridge Construction Equipment manufacturer in India since 1972.</p>
            <div class="social-links">
              <a href="#" class="social-btn"><i class="fa-brands fa-facebook-f"></i></a>
              <a href="#" class="social-btn"><i class="fa-brands fa-linkedin-in"></i></a>
              <a href="#" class="social-btn"><i class="fa-brands fa-youtube"></i></a>
              <a href="#" class="social-btn"><i class="fa-brands fa-x-twitter"></i></a>
            </div>
          </div>
          <div class="footer-col">
            <h4>Quick Navigation</h4>
            <ul class="footer-links">
              <li><a href="index.html">Home Overview</a></li>
              <li><a href="about.html">About Winsteel</a></li>
              <li><a href="products.html">Equipment Catalog</a></li>
              <li><a href="projects.html">Landmark Projects</a></li>
              <li><a href="contact.html">Contact Us</a></li>
            </ul>
          </div>
          <div class="footer-col">
            <h4>Manufacturing Units</h4>
            <ul class="footer-links">
              <li><a href="core-values.html#facilities"><i class="fa-solid fa-industry"></i> Unit 1: CNC Cutting Complex</a></li>
              <li><a href="core-values.html#facilities"><i class="fa-solid fa-industry"></i> Unit 2: Heavy Hydraulic Forming</a></li>
              <li><a href="core-values.html#facilities"><i class="fa-solid fa-industry"></i> Unit 3: EOT Crane Assembly Bay</a></li>
              <li><a href="core-values.html#facilities"><i class="fa-solid fa-industry"></i> Unit 4: Robotic Welding Plant</a></li>
            </ul>
          </div>
          <div class="footer-col">
            <h4>Recent News</h4>
            <ul id="footer-news-list" class="news-widget"></ul>
          </div>
        </div>
        <div class="footer-bottom">
          <p>© 2024 WinSteel Engineering Works Pvt. Ltd. All Rights Reserved | Standalone Static Architecture Powered by Decoupled CMS</p>
        </div>
      </div>
    </footer>
  `,

  getModal: () => `
    <div id="modal-overlay" class="modal-overlay">
      <div class="modal-box">
        <button id="modal-close" class="modal-close"><i class="fa-solid fa-xmark"></i></button>
        <div id="modal-body" class="modal-body"></div>
      </div>
    </div>
  `
};

/**
 * Initializes and injects common components across all HTML pages.
 * Supports both dedicated placeholders (<div id="app-header"></div>) and existing markup hydration.
 */
function initWinsteelComponents() {
  const page = document.body.getAttribute('data-page') || 'home';
  const headerPlaceholder = document.getElementById('app-header');
  const footerPlaceholder = document.getElementById('app-footer');

  if (headerPlaceholder) {
    headerPlaceholder.innerHTML = WINSTEEL_COMPONENTS.getNavbar(page);
  } else {
    const existingTopbar = document.querySelector('.topbar');
    const existingNavbar = document.querySelector('.navbar');
    if (existingTopbar) existingTopbar.remove();
    if (existingNavbar) {
      existingNavbar.outerHTML = WINSTEEL_COMPONENTS.getNavbar(page);
    }
  }

  if (footerPlaceholder) {
    footerPlaceholder.innerHTML = WINSTEEL_COMPONENTS.getFooter() + WINSTEEL_COMPONENTS.getModal();
  } else {
    const existingFooter = document.querySelector('.footer');
    if (existingFooter) {
      existingFooter.outerHTML = WINSTEEL_COMPONENTS.getFooter();
    }
    const existingModal = document.querySelector('#modal-overlay');
    if (!existingModal) {
      document.body.insertAdjacentHTML('beforeend', WINSTEEL_COMPONENTS.getModal());
    }
  }
}

// Execute component rendering immediately so DOM is ready before main.js event binding
initWinsteelComponents();
