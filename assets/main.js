/**
 * Hossein Store - Main JavaScript Logic
 * اسکریپت‌های تعاملی، سیستم سفارش تلگرام و منوی ریسپانسیو
 */

document.addEventListener('DOMContentLoaded', () => {
  initHeader();
  initMobileNav();
  initFaqAccordion();
  initProductsGrid();
  initContactForm();
  initQuickOrderModal();
});

/* ==========================================================================
   Header Scroll State
   ========================================================================== */
function initHeader() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  const onScroll = () => {
    if (window.scrollY > 20) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* ==========================================================================
   Mobile Navigation Drawer
   ========================================================================== */
function initMobileNav() {
  const menuBtn = document.querySelector('.mobile-menu-btn');
  const overlay = document.querySelector('.mobile-nav-overlay');
  const closeBtn = document.querySelector('.mobile-nav-close');

  if (!menuBtn || !overlay) return;

  const openDrawer = () => overlay.classList.add('open');
  const closeDrawer = () => overlay.classList.remove('open');

  menuBtn.addEventListener('click', openDrawer);
  if (closeBtn) closeBtn.addEventListener('click', closeDrawer);

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeDrawer();
  });
}

/* ==========================================================================
   Telegram Ordering Helper
   ========================================================================== */
function openTelegramOrder(productTitle, productPrice, productId) {
  const config = window.HOSSEIN_STORE_CONFIG || {
    telegramUsername: 'hosseinstore_bot',
    telegramDirectChat: 'hossein_store_support'
  };

  const message = `سلام، من می‌خواهم این محصول را از فروشگاه حسین سفارش دهم:\n\n📦 نام کالا: ${productTitle}\n💰 قیمت: ${productPrice}\n🔖 شناسه: ${productId || '-'}\n\nلطفاً راهنمایی بفرمایید.`;
  
  // Link to telegram
  const tgUrl = `https://t.me/${config.telegramUsername}?text=${encodeURIComponent(message)}`;
  
  // Open Telegram in new window/tab
  window.open(tgUrl, '_blank');
}

/* ==========================================================================
   Quick Order Modal Handler
   ========================================================================== */
function initQuickOrderModal() {
  const modalOverlay = document.getElementById('orderModal');
  if (!modalOverlay) return;

  const modalCloseBtn = modalOverlay.querySelector('.modal-close-btn');
  const modalImg = document.getElementById('modalProductImg');
  const modalTitle = document.getElementById('modalProductTitle');
  const modalPrice = document.getElementById('modalProductPrice');
  const modalDesc = document.getElementById('modalProductDesc');
  const modalQty = document.getElementById('modalProductQty');
  const modalSendBtn = document.getElementById('modalSendOrderBtn');

  let currentProduct = null;

  window.showOrderModal = function(productId) {
    const products = window.HOSSEIN_PRODUCTS || [];
    currentProduct = products.find(p => p.id === productId);

    if (!currentProduct) return;

    if (modalImg) modalImg.src = currentProduct.image;
    if (modalTitle) modalTitle.textContent = currentProduct.title;
    if (modalPrice) modalPrice.textContent = currentProduct.priceFormatted;
    if (modalDesc) modalDesc.textContent = currentProduct.description || '';
    if (modalQty) modalQty.value = 1;

    modalOverlay.classList.add('open');
  };

  const closeModal = () => {
    modalOverlay.classList.remove('open');
    currentProduct = null;
  };

  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
  });

  if (modalSendBtn) {
    modalSendBtn.addEventListener('click', () => {
      if (!currentProduct) return;
      const qty = modalQty ? modalQty.value : 1;
      const noteInput = document.getElementById('modalOrderNotes');
      const notes = noteInput ? noteInput.value.trim() : '';

      const config = window.HOSSEIN_STORE_CONFIG || { telegramUsername: 'hosseinstore_bot' };
      let message = `سلام، من می‌خواهم این محصول را سفارش دهم:\n\n📦 نام کالا: ${currentProduct.title}\n💰 قیمت واحد: ${currentProduct.priceFormatted}\n🔢 تعداد: ${qty}`;
      if (notes) {
        message += `\n📝 توضیحات خریدار: ${notes}`;
      }

      const tgUrl = `https://t.me/${config.telegramUsername}?text=${encodeURIComponent(message)}`;
      window.open(tgUrl, '_blank');
      closeModal();
      showToast('در حال انتقال به تلگرام برای ثبت نهایی سفارش...');
    });
  }
}

/* ==========================================================================
   Products Grid & Dynamic Filtering
   ========================================================================== */
function initProductsGrid() {
  const grid = document.getElementById('productsGrid');
  const filterTabs = document.querySelectorAll('.filter-tab');

  if (!grid || !window.HOSSEIN_PRODUCTS) return;

  function renderProducts(categoryFilter = 'all') {
    const products = window.HOSSEIN_PRODUCTS;
    const filtered = categoryFilter === 'all' 
      ? products 
      : products.filter(p => p.category === categoryFilter);

    if (filtered.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: var(--color-text-muted);">
          <p style="font-size: 18px; font-weight: 600;">محصولی در این دسته‌بندی یافت نشد.</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = filtered.map(product => {
      const badgeHtml = product.badge 
        ? `<div class="product-card-badge"><span class="badge badge-${product.badgeType || 'gold'}">${product.badge}</span></div>`
        : '';

      const oldPriceHtml = product.oldPrice 
        ? `<span class="product-old-price">${product.oldPrice}</span>` 
        : '';

      return `
        <article class="product-card" id="product-${product.id}">
          <div class="product-image-box">
            ${badgeHtml}
            <img src="${product.image}" alt="${product.title}" loading="lazy" />
          </div>
          <div class="product-card-body">
            <span class="product-category-label">${product.categoryName}</span>
            <h3 class="product-title">${product.title}</h3>
            <div class="product-price-row">
              <span class="product-price">${product.priceFormatted}</span>
              ${oldPriceHtml}
            </div>
            <button class="btn-card-order" onclick="showOrderModal('${product.id}')">
              <span>سفارش در تلگرام</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M7 17l9.2-9.2M17 17V7H7"/>
              </svg>
            </button>
          </div>
        </article>
      `;
    }).join('');
  }

  // Initial render
  renderProducts('all');

  // Filter tabs click
  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      filterTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const cat = tab.getAttribute('data-category');
      renderProducts(cat);
    });
  });
}

/* ==========================================================================
   FAQ Accordion Logic
   ========================================================================== */
function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');
  if (!faqItems.length) return;

  faqItems.forEach(item => {
    const btn = item.querySelector('.faq-question-btn');
    if (!btn) return;

    btn.addEventListener('click', () => {
      const isOpen = item.classList.contains('active');
      faqItems.forEach(i => i.classList.remove('active'));
      if (!isOpen) {
        item.classList.add('active');
      }
    });
  });
}

/* ==========================================================================
   Contact Form Simulation & Feedback
   ========================================================================== */
function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const nameInput = document.getElementById('contactName');
    const phoneInput = document.getElementById('contactPhone');
    const msgInput = document.getElementById('contactMessage');

    const name = nameInput ? nameInput.value.trim() : '';
    const phone = phoneInput ? phoneInput.value.trim() : '';
    const msg = msgInput ? msgInput.value.trim() : '';

    if (!name || !phone || !msg) {
      showToast('لطفاً تمامی فیلدهای الزامی را پر نمایید.');
      return;
    }

    // Reset Form
    form.reset();
    showToast('پیام شما با موفقیت ثبت شد. به زودی با شما تماس خواهیم گرفت.');
  });
}

/* ==========================================================================
   Persian Toast Notification Helper
   ========================================================================== */
function showToast(message) {
  let toast = document.getElementById('siteToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'siteToast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }

  toast.innerHTML = `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M20 6L9 17l-5-5"/>
    </svg>
    <span>${message}</span>
  `;

  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, 3500);
}
window.showToast = showToast;
