    const state = {
      products: [], filtered: [], cart: [], wishlist: [],
      balance: 1000, darkMode: false,
      search: '', category: 'all', sort: 'default',
      cartOpen: false, wishlistOpen: false
    };

    let categories = ['all'];
    let loadingProducts = false;
    let productsError = '';
    let heroIndex = 0;
    let heroTimer = null;
    let heroPaused = false;
    let searchDebounceTimer = null;
    let reviewsData = [];
    let reviewsIndex = 0;
    let reviewsTimer = null;
    let reviewsPaused = false;
    let couponApplied = false;
    let coupon = { code: '', type: '', value: 0, amount: 0 };
    function getLS(key, fallback) {
      try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
      } catch (e) {
        return fallback;
      }
    }

    function setLS(key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (e) {
        return null;
      }
      return true;
    }

    function setState(patch) {
      Object.assign(state, patch);
      renderProducts();
      renderCart();
      renderWishlist();
      renderBalance();
      renderNavbarIcons();
      renderTheme();
    }

    const icons = {
      search: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>`,
      heart: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path d="M20.8 8.6a5 5 0 0 0-8.1-3.6l-.7.8-.7-.8A5 5 0 0 0 3.2 8.6c0 4.8 4.6 7.8 8.8 11.2 4.2-3.4 8.8-6.4 8.8-11.2Z"/></svg>`,
      heartFilled: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path d="M20.8 8.6a5 5 0 0 0-8.1-3.6l-.7.8-.7-.8A5 5 0 0 0 3.2 8.6c0 4.8 4.6 7.8 8.8 11.2 4.2-3.4 8.8-6.4 8.8-11.2Z"/></svg>`,
      cart: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/><path d="M3 4h2l2.2 10.5a2 2 0 0 0 2 1.5h7.9a2 2 0 0 0 2-1.6L21 7H7"/></svg>`,
      moon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"/></svg>`,
      sun: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2v2.5M12 19.5V22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M2 12h2.5M19.5 12H22M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8"/></svg>`,
      menu: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path d="M4 7h16M4 12h16M4 17h16"/></svg>`,
      close: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path d="m6 6 12 12M18 6 6 18"/></svg>`,
      chevronLeft: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path d="m15 18-6-6 6-6"/></svg>`,
      chevronRight: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path d="m9 6 6 6-6 6"/></svg>`,
      trash: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>`,
      star: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="m12 2.3 2.9 5.9 6.5 1-4.7 4.6 1.1 6.5-5.8-3-5.8 3 1.1-6.5L2.6 9.2l6.5-1L12 2.3Z"/></svg>`,
      arrowUp: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path d="m6 15 6-6 6 6"/></svg>`,
      github: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path d="M9 19c-4 1.5-4-2-6-2m12 4v-3.9a3.4 3.4 0 0 0-1-2.6c3.3-.4 6.7-1.6 6.7-7.1A5.5 5.5 0 0 0 19.2 3S18 2.6 15 4.6a13.3 13.3 0 0 0-6 0C6 2.6 4.8 3 4.8 3a5.5 5.5 0 0 0-1.5 4.4c0 5.5 3.4 6.7 6.7 7.1a3.4 3.4 0 0 0-1 2.6V21"/></svg>`,
      twitter: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path d="M22 5.8a8.2 8.2 0 0 1-2.4.7 4.2 4.2 0 0 0 1.8-2.3 8.4 8.4 0 0 1-2.7 1 4.2 4.2 0 0 0-7.3 2.9c0 .3 0 .7.1 1A12 12 0 0 1 3 4.8a4.2 4.2 0 0 0 1.3 5.7 4 4 0 0 1-1.9-.5v.1a4.2 4.2 0 0 0 3.4 4.1 4.2 4.2 0 0 1-1.9.1 4.2 4.2 0 0 0 3.9 2.9A8.5 8.5 0 0 1 2 19a12 12 0 0 0 6.5 1.9c7.8 0 12-6.5 12-12v-.5A8.4 8.4 0 0 0 22 5.8Z"/></svg>`,
      linkedin: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6ZM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/></svg>`
    };

    function showToast(msg, type = 'info') {
      const container = document.getElementById('toast-container');
      if (!container) return;
      const variants = {
        success: 'bg-green-600',
        error: 'bg-red-500',
        warning: 'bg-amber-500',
        info: 'bg-zinc-700'
      };
      if (container.children.length >= 3) container.removeChild(container.firstElementChild);
      const toast = document.createElement('div');
      toast.className = `flex items-center gap-2 px-4 py-3 rounded-lg shadow text-sm text-white transition-opacity duration-300 w-full sm:w-auto sm:max-w-sm break-words ${variants[type] || variants.info}`;
      toast.innerHTML = `<span>${msg}</span>`;
      container.appendChild(toast);
      window.setTimeout(() => {
        toast.classList.add('opacity-0');
        window.setTimeout(() => {
          if (toast.parentNode) toast.parentNode.removeChild(toast);
        }, 300);
      }, 3000);
    }

    function renderNavbarIcons() {
      document.getElementById('nav-search-btn').innerHTML = icons.search;
      document.getElementById('wishlist-toggle-btn').innerHTML = `${icons.heart}<span class="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full bg-zinc-900 text-white text-[10px] px-1 flex items-center justify-center">${state.wishlist.length}</span>`;
      document.getElementById('cart-toggle-btn').innerHTML = `${icons.cart}<span class="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full bg-zinc-900 text-white text-[10px] px-1 flex items-center justify-center">${state.cart.reduce((acc, item) => acc + item.qty, 0)}</span>`;
      document.getElementById('dark-mode-toggle').innerHTML = state.darkMode ? icons.sun : icons.moon;
      document.getElementById('mobile-menu-btn').innerHTML = icons.menu;
      document.getElementById('cart-close-btn').innerHTML = icons.close;
      document.getElementById('wishlist-close-btn').innerHTML = icons.close;
      document.getElementById('hero-prev').innerHTML = icons.chevronLeft;
      document.getElementById('hero-next').innerHTML = icons.chevronRight;
      document.getElementById('reviews-prev').innerHTML = icons.chevronLeft;
      document.getElementById('reviews-next').innerHTML = icons.chevronRight;
      document.getElementById('back-to-top').innerHTML = icons.arrowUp;
      document.getElementById('social-github').innerHTML = icons.github;
      document.getElementById('social-twitter').innerHTML = icons.twitter;
      document.getElementById('social-linkedin').innerHTML = icons.linkedin;
    }

    function renderTheme() {
      document.documentElement.classList.toggle('dark', !!state.darkMode);
    }

    function renderBalance() {
      const formatted = `৳${Math.max(0, Math.round(state.balance))}`;
      document.getElementById('balance-chip').textContent = formatted;
      document.getElementById('wallet-balance').textContent = formatted;
    }

    function initScrollSpy() {
      const links = Array.from(document.querySelectorAll('[data-nav-link]'));
      const sectionIds = ['home', 'products', 'reviews', 'contact'];
      const sections = sectionIds.map((id) => document.getElementById(id)).filter(Boolean);
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const href = `#${entry.target.id}`;
          links.forEach((link) => {
            const active = link.getAttribute('href') === href;
            link.classList.toggle('underline', active);
            link.classList.toggle('decoration-zinc-900', active);
            link.classList.toggle('dark:decoration-zinc-100', active);
          });
        });
      }, { threshold: 0.6 });
      sections.forEach((section) => observer.observe(section));
    }

    function renderHeroDots() {
      const dots = document.getElementById('hero-dots');
      dots.innerHTML = '';
      const slides = document.querySelectorAll('.hero-slide');
      slides.forEach((_, i) => {
        const b = document.createElement('button');
        b.className = `w-2.5 h-2.5 rounded-full border ${heroIndex === i ? 'bg-zinc-900 border-zinc-900' : 'bg-transparent border-zinc-400'}`;
        b.setAttribute('data-hero-dot', String(i));
        b.setAttribute('aria-label', `Slide ${i + 1}`);
        dots.appendChild(b);
      });
    }

    function renderHero() {
      const slides = document.querySelectorAll('.hero-slide');
      slides.forEach((slide, i) => {
        slide.classList.toggle('opacity-100', i === heroIndex);
        slide.classList.toggle('opacity-0', i !== heroIndex);
      });
      renderHeroDots();
    }

    function startHero() {
      if (heroTimer) clearInterval(heroTimer);
      heroTimer = setInterval(() => {
        if (heroPaused) return;
        heroIndex = (heroIndex + 1) % 4;
        renderHero();
      }, 4000);
    }

    function toBDT(price) {
      return Math.round(price * 110);
    }

    function sortProducts(list) {
      const arr = [...list];
      if (state.sort === 'price-asc') arr.sort((a, b) => a.price - b.price);
      else if (state.sort === 'price-desc') arr.sort((a, b) => b.price - a.price);
      else if (state.sort === 'rating-desc') arr.sort((a, b) => (b.rating?.rate || 0) - (a.rating?.rate || 0));
      else if (state.sort === 'name-asc') arr.sort((a, b) => a.title.localeCompare(b.title));
      return arr;
    }

    function applyProductFilters(products) {
      const q = state.search.trim().toLowerCase();
      const searched = q ? products.filter((p) => p.title.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)) : products;
      return sortProducts(searched);
    }

    async function fetchProducts(category = 'all') {
      loadingProducts = true;
      productsError = '';
      renderProducts();
      try {
        const endpoint = category === 'all'
          ? 'https://fakestoreapi.com/products'
          : `https://fakestoreapi.com/products/category/${encodeURIComponent(category)}`;
        const res = await fetch(endpoint);
        if (!res.ok) throw new Error('Failed to fetch products');
        const data = await res.json();
        const nextProducts = Array.isArray(data) ? data : [];
        if (category === 'all') {
          state.products = nextProducts;
          const unique = Array.from(new Set(nextProducts.map((p) => p.category)));
          categories = ['all', ...unique];
        }
        const base = category === 'all' ? state.products : nextProducts;
        state.filtered = applyProductFilters(base);
        loadingProducts = false;
        renderProducts();
      } catch (e) {
        loadingProducts = false;
        productsError = 'Unable to load products. Please try again.';
        renderProducts();
      }
    }

    function buildStars(rate) {
      const rounded = Math.round(rate || 0);
      let html = '';
      for (let i = 0; i < 5; i += 1) {
        html += `<span class="${i < rounded ? 'text-amber-500' : 'text-zinc-300'}">${icons.star}</span>`;
      }
      return html;
    }

    function renderCategoryPills() {
      const el = document.getElementById('category-pills');
      el.innerHTML = categories.map((cat) => `
        <button data-category="${cat}" class="${state.category === cat ? 'bg-zinc-900 text-white border-zinc-900' : 'border-zinc-300 text-zinc-700 dark:text-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800'} border px-3 py-1.5 rounded-full text-sm capitalize">
          ${cat}
        </button>
      `).join('');
    }

    function renderProducts() {
      const count = document.getElementById('product-count');
      const wrap = document.getElementById('products-content');
      count.textContent = `(${state.filtered.length})`;
      renderCategoryPills();

      if (loadingProducts) {
        wrap.innerHTML = `
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            ${Array.from({ length: 8 }).map(() => `
              <div class="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 animate-pulse">
                <div class="h-32 bg-zinc-200 dark:bg-zinc-800 rounded mb-3"></div>
                <div class="h-3 bg-zinc-200 dark:bg-zinc-800 rounded w-1/3 mb-2"></div>
                <div class="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-full mb-2"></div>
                <div class="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-2/3 mb-3"></div>
                <div class="h-8 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
              </div>
            `).join('')}
          </div>
        `;
        return;
      }

      if (productsError) {
        wrap.innerHTML = `
          <div class="text-center py-14">
            <p class="text-zinc-600 dark:text-zinc-300 mb-3">${productsError}</p>
            <button id="retry-products-btn" class="border border-zinc-300 text-zinc-700 px-4 py-2 rounded-lg text-sm hover:bg-zinc-50">Retry</button>
          </div>
        `;
        return;
      }

      if (!state.filtered.length) {
        wrap.innerHTML = `<div class="text-center py-14 text-zinc-500 dark:text-zinc-400">No products found.</div>`;
        return;
      }

      wrap.innerHTML = `
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          ${state.filtered.map((product) => {
            const inCart = state.cart.some((i) => i.id === product.id);
            const wished = state.wishlist.some((i) => i.id === product.id);
            return `
              <article class="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 sm:p-4 hover:shadow-sm transition">
                <div class="h-48 flex items-center justify-center mb-3">
                  <img src="${product.image}" alt="${product.title}" class="max-h-48 object-contain">
                </div>
                <p class="text-xs text-zinc-400 uppercase tracking-wide">${product.category}</p>
                <h3 class="text-sm font-medium text-zinc-800 dark:text-zinc-100 line-clamp-2 mt-1 min-h-[40px]">${product.title}</h3>
                <div class="mt-2 flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
                  <span class="text-amber-500">${icons.star}</span>
                  <span>${(product.rating?.rate || 0).toFixed(1)} (${product.rating?.count || 0})</span>
                </div>
                <div class="mt-2">
                  <p class="text-base font-semibold">$${product.price.toFixed(2)}</p>
                  <p class="text-xs text-zinc-400">৳${toBDT(product.price)}</p>
                </div>
                <div class="mt-3 flex items-center gap-2">
                  <button data-add-cart="${product.id}" class="${inCart ? 'border border-green-600 text-green-600' : 'bg-zinc-900 text-white hover:bg-zinc-700'} px-4 py-2 rounded-lg text-sm font-medium w-full">
                    ${inCart ? 'Added' : 'Add to Cart'}
                  </button>
                  <button data-wishlist-toggle="${product.id}" class="p-2 rounded-lg border border-zinc-300 dark:border-zinc-700 ${wished ? 'text-red-500' : 'text-zinc-500 dark:text-zinc-300'} hover:bg-zinc-50 dark:hover:bg-zinc-800">
                    ${wished ? icons.heartFilled : icons.heart}
                  </button>
                </div>
              </article>
            `;
          }).join('')}
        </div>
      `;
    }

    function getCartTotals() {
      const subtotal = state.cart.reduce((acc, item) => acc + (toBDT(item.price) * item.qty), 0);
      const delivery = subtotal > 2000 ? 0 : state.cart.length ? 60 : 0;
      const shipping = state.cart.length ? 40 : 0;
      let discount = 0;
      if (couponApplied && coupon.code === 'SMART10') discount = Math.round(subtotal * 0.1);
      if (couponApplied && coupon.code === 'SHIP50') discount = Math.round(shipping * 0.5);
      const grandTotal = Math.max(0, subtotal + delivery + shipping - discount);
      coupon.amount = discount;
      return { subtotal, delivery, shipping, discount, grandTotal };
    }

    function renderCart() {
      const cartWrap = document.getElementById('cart-wrapper');
      cartWrap.classList.toggle('hidden', !state.cartOpen);
      const itemsEl = document.getElementById('cart-items');
      if (!state.cart.length) {
        itemsEl.innerHTML = `<p class="text-sm text-zinc-500 dark:text-zinc-400 py-4">Your cart is empty.</p>`;
      } else {
        itemsEl.innerHTML = state.cart.map((item) => `
          <article class="flex gap-3 py-3 border-b border-zinc-100 dark:border-zinc-800">
            <img src="${item.image}" alt="${item.title}" class="w-14 h-14 object-contain rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900">
            <div class="flex-1">
              <h4 class="text-sm line-clamp-1">${item.title}</h4>
              <p class="text-sm font-medium mt-1">৳${toBDT(item.price)}</p>
              <div class="mt-2 flex items-center justify-between gap-2">
                <div class="flex items-center gap-2">
                  <button data-qty-minus="${item.id}" class="px-2 py-1 text-sm border border-zinc-300 dark:border-zinc-700 rounded">−</button>
                  <span class="text-sm">${item.qty}</span>
                  <button data-qty-plus="${item.id}" class="px-2 py-1 text-sm border border-zinc-300 dark:border-zinc-700 rounded">+</button>
                </div>
                <button data-remove-cart="${item.id}" class="text-zinc-400 hover:text-red-500">${icons.trash}</button>
              </div>
            </div>
          </article>
        `).join('');
      }
      const totals = getCartTotals();
      document.getElementById('sum-subtotal').textContent = `৳${totals.subtotal}`;
      document.getElementById('sum-delivery').textContent = `৳${totals.delivery}`;
      document.getElementById('sum-shipping').textContent = `৳${totals.shipping}`;
      document.getElementById('sum-discount').textContent = `-৳${totals.discount}`;
      document.getElementById('sum-grand').textContent = `৳${totals.grandTotal}`;

      const warning = document.getElementById('balance-warning');
      const checkoutBtn = document.getElementById('checkout-btn');
      const insufficient = totals.grandTotal > state.balance;
      warning.classList.toggle('hidden', !insufficient || totals.grandTotal === 0);
      checkoutBtn.disabled = insufficient || totals.grandTotal === 0;
    }

    function applyCoupon() {
      if (couponApplied) {
        document.getElementById('coupon-message').className = 'text-xs text-amber-500';
        document.getElementById('coupon-message').textContent = 'Coupon already applied for this cart session.';
        return;
      }
      const raw = document.getElementById('coupon-input').value.trim().toUpperCase();
      if (!state.cart.length) {
        document.getElementById('coupon-message').className = 'text-xs text-red-500';
        document.getElementById('coupon-message').textContent = 'Add items to cart first.';
        return;
      }
      if (raw === 'SMART10') {
        couponApplied = true;
        coupon = { code: raw, type: 'percent', value: 10, amount: 0 };
        document.getElementById('coupon-message').className = 'text-xs text-green-600';
        document.getElementById('coupon-message').textContent = 'SMART10 applied: 10% off subtotal.';
      } else if (raw === 'SHIP50') {
        couponApplied = true;
        coupon = { code: raw, type: 'shipping', value: 50, amount: 0 };
        document.getElementById('coupon-message').className = 'text-xs text-green-600';
        document.getElementById('coupon-message').textContent = 'SHIP50 applied: 50% off shipping.';
      } else {
        document.getElementById('coupon-message').className = 'text-xs text-red-500';
        document.getElementById('coupon-message').textContent = 'Invalid coupon code.';
      }
      setLS('ss_sale', { couponApplied, coupon });
      renderCart();
    }

    function resetCouponSession() {
      couponApplied = false;
      coupon = { code: '', type: '', value: 0, amount: 0 };
      document.getElementById('coupon-input').value = '';
      document.getElementById('coupon-message').textContent = '';
      setLS('ss_sale', { couponApplied, coupon });
    }

    function checkout() {
      const totals = getCartTotals();
      if (!state.cart.length) {
        showToast('Cart is empty', 'warning');
        return;
      }
      if (totals.grandTotal > state.balance) {
        showToast('Insufficient balance', 'error');
        return;
      }
      const nextBalance = Math.max(0, state.balance - totals.grandTotal);
      setState({ cart: [], balance: nextBalance, cartOpen: false });
      setLS('ss_cart', state.cart);
      setLS('ss_balance', state.balance);
      resetCouponSession();
      showToast('Checkout successful', 'success');
    }

    function addMoney(amount) {
      const num = Number(amount);
      if (!Number.isFinite(num) || num <= 0) {
        showToast('Enter a valid amount', 'error');
        return;
      }
      const next = state.balance + num;
      setState({ balance: next });
      setLS('ss_balance', state.balance);
      showToast(`Added ৳${num}`, 'success');
    }

    function renderWishlist() {
      const modal = document.getElementById('wishlist-modal');
      modal.classList.toggle('hidden', !state.wishlistOpen);
      const content = document.getElementById('wishlist-content');
      if (!state.wishlist.length) {
        content.innerHTML = `<p class="text-sm text-zinc-500 dark:text-zinc-400">Your wishlist is empty.</p>`;
        return;
      }
      content.innerHTML = `
        <div class="grid sm:grid-cols-2 gap-3">
          ${state.wishlist.map((item) => `
            <article class="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3">
              <div class="h-24 flex items-center justify-center"><img src="${item.image}" alt="${item.title}" class="max-h-24 object-contain"></div>
              <h4 class="text-sm line-clamp-2 mt-2">${item.title}</h4>
              <p class="text-sm mt-1">৳${toBDT(item.price)}</p>
              <button data-wishlist-remove="${item.id}" class="mt-2 border border-red-200 text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg text-sm">Remove</button>
            </article>
          `).join('')}
        </div>
      `;
    }

    function reviewsVisibleCount() {
      if (window.innerWidth >= 1024) return 3;
      if (window.innerWidth >= 768) return 2;
      return 1;
    }

    async function fetchReviews() {
      try {
        const res = await fetch('./reviews.json');
        if (!res.ok) throw new Error('Reviews fetch failed');
        const data = await res.json();
        reviewsData = Array.isArray(data) ? data : [];
      } catch (e) {
        reviewsData = [
          { id: 1, name: 'Aminul Karim', comment: 'Excellent shopping flow and product quality.', rating: 5, date: '2025-04-01', initials: 'AK' },
          { id: 2, name: 'Lubna Akter', comment: 'Loved the clean UI and quick delivery updates.', rating: 4, date: '2025-04-04', initials: 'LA' },
          { id: 3, name: 'Shuvo Roy', comment: 'Easy checkout and fair pricing.', rating: 5, date: '2025-04-07', initials: 'SR' }
        ];
      }
      renderReviews();
    }

    function renderReviewsDots(totalPages, currentPage) {
      const dots = document.getElementById('reviews-dots');
      dots.innerHTML = '';
      for (let i = 0; i < totalPages; i += 1) {
        const b = document.createElement('button');
        b.setAttribute('data-review-dot', String(i));
        b.className = `w-2.5 h-2.5 rounded-full border ${i === currentPage ? 'bg-zinc-900 border-zinc-900' : 'bg-transparent border-zinc-400'}`;
        dots.appendChild(b);
      }
    }

    function renderReviews() {
      const track = document.getElementById('reviews-track');
      const visible = reviewsVisibleCount();
      const width = 100 / visible;
      track.innerHTML = reviewsData.map((review) => `
        <article class="px-2 shrink-0" style="width:${width}%">
          <div class="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 h-full">
            <div class="flex items-center gap-3 mb-3">
              <div class="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 font-semibold flex items-center justify-center">${review.initials}</div>
              <div>
                <p class="text-sm font-medium">${review.name}</p>
                <p class="text-xs text-zinc-500 dark:text-zinc-400">${review.date}</p>
              </div>
            </div>
            <div class="flex gap-1 text-amber-500 mb-3">${buildStars(review.rating)}</div>
            <p class="text-sm text-zinc-600 dark:text-zinc-300">${review.comment}</p>
          </div>
        </article>
      `).join('');

      const pages = Math.max(1, Math.ceil(reviewsData.length / visible));
      if (reviewsIndex >= pages) reviewsIndex = 0;
      const offset = reviewsIndex * 100;
      track.style.transform = `translateX(-${offset}%)`;
      renderReviewsDots(pages, reviewsIndex);
    }

    function startReviews() {
      if (reviewsTimer) clearInterval(reviewsTimer);
      reviewsTimer = setInterval(() => {
        if (reviewsPaused || !reviewsData.length) return;
        const pages = Math.max(1, Math.ceil(reviewsData.length / reviewsVisibleCount()));
        reviewsIndex = (reviewsIndex + 1) % pages;
        renderReviews();
      }, 5000);
    }

    function validateContactForm() {
      const name = document.getElementById('contact-name').value.trim();
      const email = document.getElementById('contact-email').value.trim();
      const message = document.getElementById('contact-message').value.trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      let valid = true;
      document.getElementById('err-name').textContent = '';
      document.getElementById('err-email').textContent = '';
      document.getElementById('err-message').textContent = '';

      if (!name || name.length < 3) {
        document.getElementById('err-name').textContent = 'Name must be at least 3 characters.';
        valid = false;
      }
      if (!emailRegex.test(email)) {
        document.getElementById('err-email').textContent = 'Enter a valid email address.';
        valid = false;
      }
      if (!message || message.length < 20) {
        document.getElementById('err-message').textContent = 'Message must be at least 20 characters.';
        valid = false;
      }
      return valid;
    }

    function toggleFaq(index) {
      document.querySelectorAll('.faq-content').forEach((content, i) => {
        content.classList.toggle('max-h-40', i === index && !content.classList.contains('max-h-40'));
        content.classList.toggle('max-h-0', !(i === index && !content.classList.contains('max-h-40')));
      });
    }

    document.addEventListener('DOMContentLoaded', async () => {
      state.cart = getLS('ss_cart', []);
      state.wishlist = getLS('ss_wishlist', []);
      state.balance = Number(getLS('ss_balance', 1000)) || 1000;
      state.darkMode = getLS('ss_dark', false);
      const saleData = getLS('ss_sale', { couponApplied: false, coupon: { code: '', type: '', value: 0, amount: 0 } });
      couponApplied = !!saleData.couponApplied;
      coupon = saleData.coupon || coupon;

      renderNavbarIcons();
      setState({});
      renderHero();
      startHero();
      initScrollSpy();
      await fetchProducts('all');
      await fetchReviews();
      startReviews();

      const heroWrap = document.getElementById('home');
      heroWrap.addEventListener('mouseenter', () => { heroPaused = true; });
      heroWrap.addEventListener('mouseleave', () => { heroPaused = false; });

      document.getElementById('reviews').addEventListener('mouseenter', () => { reviewsPaused = true; });
      document.getElementById('reviews').addEventListener('mouseleave', () => { reviewsPaused = false; });

      document.body.addEventListener('click', async (e) => {
        const heroDot = e.target.closest('[data-hero-dot]');
        if (heroDot) {
          heroIndex = Number(heroDot.getAttribute('data-hero-dot'));
          renderHero();
        }

        if (e.target.closest('#hero-prev')) {
          heroIndex = (heroIndex - 1 + 4) % 4;
          renderHero();
        }
        if (e.target.closest('#hero-next')) {
          heroIndex = (heroIndex + 1) % 4;
          renderHero();
        }

        if (e.target.closest('#mobile-menu-btn')) {
          document.getElementById('mobile-menu').classList.toggle('hidden');
        }

        const navLink = e.target.closest('[data-nav-link]');
        if (navLink) {
          document.getElementById('mobile-menu').classList.add('hidden');
        }

        if (e.target.closest('#dark-mode-toggle')) {
          setState({ darkMode: !state.darkMode });
          setLS('ss_dark', state.darkMode);
        }

        if (e.target.closest('#nav-search-btn')) {
          document.getElementById('product-search').focus();
          document.getElementById('products').scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

        if (e.target.closest('#wishlist-toggle-btn')) setState({ wishlistOpen: true });
        if (e.target.closest('#wishlist-close-btn') || e.target.closest('#wishlist-overlay')) setState({ wishlistOpen: false });
        if (e.target.closest('#cart-toggle-btn')) setState({ cartOpen: true });
        if (e.target.closest('#cart-close-btn') || e.target.closest('#cart-overlay')) setState({ cartOpen: false });

        const retryBtn = e.target.closest('#retry-products-btn');
        if (retryBtn) fetchProducts(state.category);

        const categoryBtn = e.target.closest('[data-category]');
        if (categoryBtn) {
          const nextCategory = categoryBtn.getAttribute('data-category');
          state.category = nextCategory;
          state.search = '';
          document.getElementById('product-search').value = '';
          await fetchProducts(nextCategory);
        }

        const addCartBtn = e.target.closest('[data-add-cart]');
        if (addCartBtn) {
          const id = Number(addCartBtn.getAttribute('data-add-cart'));
          const source = state.filtered.find((p) => p.id === id) || state.products.find((p) => p.id === id) || [];
          if (!source.id) return;
          const exists = state.cart.find((item) => item.id === id);
          if (exists) {
            showToast('Already in cart', 'info');
          } else {
            const nextCart = [...state.cart, { id: source.id, title: source.title, image: source.image, price: source.price, qty: 1 }];
            setState({ cart: nextCart });
            setLS('ss_cart', state.cart);
            showToast('Added to cart', 'success');
          }
        }

        const wishToggle = e.target.closest('[data-wishlist-toggle]');
        if (wishToggle) {
          const id = Number(wishToggle.getAttribute('data-wishlist-toggle'));
          const source = state.filtered.find((p) => p.id === id) || state.products.find((p) => p.id === id);
          if (!source) return;
          const exists = state.wishlist.some((i) => i.id === id);
          const nextWishlist = exists
            ? state.wishlist.filter((i) => i.id !== id)
            : [...state.wishlist, { id: source.id, title: source.title, image: source.image, price: source.price }];
          setState({ wishlist: nextWishlist });
          setLS('ss_wishlist', state.wishlist);
          showToast(exists ? 'Removed from wishlist' : 'Added to wishlist', 'info');
        }

        const wishRemove = e.target.closest('[data-wishlist-remove]');
        if (wishRemove) {
          const id = Number(wishRemove.getAttribute('data-wishlist-remove'));
          const next = state.wishlist.filter((i) => i.id !== id);
          setState({ wishlist: next });
          setLS('ss_wishlist', state.wishlist);
        }

        const qtyPlus = e.target.closest('[data-qty-plus]');
        if (qtyPlus) {
          const id = Number(qtyPlus.getAttribute('data-qty-plus'));
          const next = state.cart.map((item) => item.id === id ? { ...item, qty: item.qty + 1 } : item);
          setState({ cart: next });
          setLS('ss_cart', state.cart);
        }

        const qtyMinus = e.target.closest('[data-qty-minus]');
        if (qtyMinus) {
          const id = Number(qtyMinus.getAttribute('data-qty-minus'));
          const next = state.cart.map((item) => {
            if (item.id !== id) return item;
            return { ...item, qty: Math.max(1, item.qty - 1) };
          });
          setState({ cart: next });
          setLS('ss_cart', state.cart);
        }

        const removeCart = e.target.closest('[data-remove-cart]');
        if (removeCart) {
          const id = Number(removeCart.getAttribute('data-remove-cart'));
          const next = state.cart.filter((item) => item.id !== id);
          setState({ cart: next });
          setLS('ss_cart', state.cart);
          if (!next.length) resetCouponSession();
        }

        if (e.target.closest('#coupon-apply-btn')) applyCoupon();
        if (e.target.closest('#checkout-btn')) checkout();
        if (e.target.closest('#wallet-toggle-btn')) document.getElementById('wallet-panel').classList.toggle('hidden');

        const addMoneyBtn = e.target.closest('[data-add-money]');
        if (addMoneyBtn) {
          addMoney(addMoneyBtn.getAttribute('data-add-money'));
        }
        if (e.target.closest('#wallet-confirm-btn')) {
          const custom = document.getElementById('wallet-custom-input').value;
          addMoney(custom);
          document.getElementById('wallet-custom-input').value = '';
        }

        if (e.target.closest('#reviews-prev')) {
          const pages = Math.max(1, Math.ceil(reviewsData.length / reviewsVisibleCount()));
          reviewsIndex = (reviewsIndex - 1 + pages) % pages;
          renderReviews();
        }
        if (e.target.closest('#reviews-next')) {
          const pages = Math.max(1, Math.ceil(reviewsData.length / reviewsVisibleCount()));
          reviewsIndex = (reviewsIndex + 1) % pages;
          renderReviews();
        }
        const reviewDot = e.target.closest('[data-review-dot]');
        if (reviewDot) {
          reviewsIndex = Number(reviewDot.getAttribute('data-review-dot'));
          renderReviews();
        }

        const faqBtn = e.target.closest('.faq-btn');
        if (faqBtn) toggleFaq(Number(faqBtn.getAttribute('data-faq')));

        if (e.target.closest('#newsletter-btn')) {
          const email = document.getElementById('newsletter-input').value.trim();
          const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
          if (!ok) {
            showToast('Enter a valid email for newsletter', 'error');
          } else {
            document.getElementById('newsletter-input').value = '';
            showToast('Subscribed successfully', 'success');
          }
        }

        if (e.target.closest('#back-to-top')) window.scrollTo({ top: 0, behavior: 'smooth' });
      });

      document.getElementById('product-search').addEventListener('input', (e) => {
        const value = e.target.value;
        if (searchDebounceTimer) clearTimeout(searchDebounceTimer);
        searchDebounceTimer = setTimeout(() => {
          state.search = value;
          const base = state.category === 'all'
            ? state.products
            : state.products.filter((p) => p.category === state.category);
          state.filtered = applyProductFilters(base);
          renderProducts();
        }, 300);
      });

      document.getElementById('sort-select').addEventListener('change', (e) => {
        state.sort = e.target.value;
        state.filtered = sortProducts(state.filtered);
        renderProducts();
      });

      document.getElementById('contact-form').addEventListener('submit', (e) => {
        e.preventDefault();
        if (!validateContactForm()) return;
        document.getElementById('contact-form-wrap').innerHTML = `
          <div class="h-full min-h-[320px] border border-zinc-200 dark:border-zinc-800 rounded-xl flex flex-col items-center justify-center text-center px-4">
            <h3 class="text-lg font-semibold mb-2">Message sent successfully</h3>
            <p class="text-sm text-zinc-500 dark:text-zinc-400 mb-4">Thanks for reaching out. We will contact you soon.</p>
            <button id="send-another-btn" class="bg-zinc-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-zinc-700">Send Another</button>
          </div>
        `;
        showToast('Message sent', 'success');
      });

      document.getElementById('contact-form-wrap').addEventListener('click', (e) => {
        if (!e.target.closest('#send-another-btn')) return;
        document.getElementById('contact-form-wrap').innerHTML = `
          <form id="contact-form" class="space-y-3">
            <div>
              <input id="contact-name" type="text" placeholder="Name" class="w-full border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-300">
              <p id="err-name" class="text-xs text-red-500 mt-1"></p>
            </div>
            <div>
              <input id="contact-email" type="email" placeholder="Email" class="w-full border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-300">
              <p id="err-email" class="text-xs text-red-500 mt-1"></p>
            </div>
            <div>
              <input id="contact-subject" type="text" placeholder="Subject" class="w-full border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-300">
            </div>
            <div>
              <textarea id="contact-message" rows="5" placeholder="Message" class="w-full border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-300"></textarea>
              <p id="err-message" class="text-xs text-red-500 mt-1"></p>
            </div>
            <button type="submit" class="bg-zinc-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-zinc-700">Send Message</button>
          </form>
        `;
      });

      window.addEventListener('scroll', () => {
        const btn = document.getElementById('back-to-top');
        btn.classList.toggle('hidden', window.scrollY <= 300);
      });

      window.addEventListener('resize', () => {
        renderReviews();
      });

      document.getElementById('coupon-message').className = couponApplied ? 'text-xs text-green-600' : 'text-xs';
      if (couponApplied && coupon.code) {
        document.getElementById('coupon-message').textContent = `${coupon.code} is active for this cart session.`;
      }
      renderCart();
      renderWishlist();
      renderBalance();
    });
