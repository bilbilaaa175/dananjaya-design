// ============================================================
//  main.js — Entry Point (gabungan script.js + Supabase)
// ============================================================

import { initAuth, initLoginForm, initRegisterForm, initLogoutBtn } from './auth.js';
import { addToCart, renderCartDropdown, getLocalCart, getCheckedCartItems } from './cart.js';

document.documentElement.classList.add('js-enabled');

document.addEventListener('DOMContentLoaded', async () => {

  // ════════ SUPABASE — init auth ════════
  await initAuth();
  initLoginForm();
  initRegisterForm();
  initLogoutBtn();


  // ════════ DARI script.js LAMA ════════

  /* ── Navbar scroll shadow ── */
  const navbar = document.getElementById('mainNavbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 20);
    });
  }

  /* ── Active nav link ── */
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.navbar-nav .nav-link').forEach(link => {
    const href = link.getAttribute('href') || '';
    if (href === currentPath || (currentPath === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

  /* ── Auth Modal tabs ── */
  document.querySelectorAll('.auth-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;
      document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
      tab.classList.add('active');
      const form = document.getElementById(target + 'Form');
      if (form) form.classList.add('active');
    });
  });

  /* ── Home sub-nav intersection ── */
  if (document.getElementById('homeSubNav')) {
    const sections = document.querySelectorAll('.home-section[id]');
    const subLinks = document.querySelectorAll('.sub-nav-list a');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          subLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === '#' + id);
          });
        }
      });
    }, { rootMargin: '-118px 0px -60% 0px', threshold: 0 });
    sections.forEach(s => observer.observe(s));
  }

  /* ── Fade-up on scroll ── */
  const fadeEls = document.querySelectorAll('.fade-up');
  if (fadeEls.length) {
    const fadeObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          fadeObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });
    fadeEls.forEach(el => fadeObserver.observe(el));
  }

  /* ── Team division filter ── */
  const filterBtns = document.querySelectorAll('.filter-btn');
  const teamCards  = document.querySelectorAll('.team-card');
  if (filterBtns.length && teamCards.length) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const div = btn.dataset.division;
        teamCards.forEach(card => {
          card.style.display = (div === 'all' || card.dataset.division === div) ? '' : 'none';
        });
      });
    });
  }

  /* ── Category filter (catalog/package/publicity) ── */
  const catBtns         = document.querySelectorAll('.cat-btn');
  const filterableCards = document.querySelectorAll('[data-category]');
  if (catBtns.length && filterableCards.length) {
    catBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        catBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const cat = btn.dataset.cat;
        filterableCards.forEach(card => {
          card.style.display = (cat === 'all' || card.dataset.category === cat) ? '' : 'none';
        });
      });
    });
  }

  /* ── Search ── */
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      const q = searchInput.value.toLowerCase().trim();
      filterableCards.forEach(card => {
        const catActive  = document.querySelector('.cat-btn.active');
        const catFilter  = catActive ? catActive.dataset.cat : 'all';
        const matchesCat = catFilter === 'all' || card.dataset.category === catFilter;
        const matchesQ   = q === '' || card.textContent.toLowerCase().includes(q);
        card.style.display = (matchesCat && matchesQ) ? '' : 'none';
      });
    });
  }

  /* ── Contact WhatsApp form ── */
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name  = document.getElementById('contactName').value;
      const email = document.getElementById('contactEmail').value;
      const phone = document.getElementById('contactPhone').value;
      const msg   = `Halo Dananjaya!%0ANama: ${encodeURIComponent(name)}%0AEmail: ${encodeURIComponent(email)}%0APhone: ${encodeURIComponent(phone)}`;
      window.open(`https://wa.me/6289523941316?text=${msg}`, '_blank');
    });
  }

  /* ── Cart: tombol tambah ke cart ── */
  document.querySelectorAll('[data-add-cart]').forEach(btn => {
    btn.addEventListener('click', async function () {
      const card = this.closest('[data-product-id]');
      if (!card) return;
      await addToCart({
        productId:    card.dataset.productId,
        productName:  card.dataset.productName,
        productPrice: parseInt(card.dataset.productPrice),
        productImg:   card.dataset.productImg || '',
        productCat:   card.dataset.productCat || '',
      });
      const orig = this.innerHTML;
      this.innerHTML = '<i class="bi bi-check2"></i> Ditambahkan';
      this.disabled  = true;
      setTimeout(() => { this.innerHTML = orig; this.disabled = false; }, 1800);
    });
  });

  /* ── Cart: render dropdown saat icon diklik ── */
  document.querySelectorAll('.nav-icon-btn').forEach(btn => {
    if (btn.querySelector('.bi-bag')) {
      btn.addEventListener('click', renderCartDropdown);
    }
  });

  /* ── Cart button pulse ── */
  document.querySelectorAll('.btn-cart').forEach(btn => {
    btn.addEventListener('click', () => {
      const navCart = document.querySelector('.nav-icon-btn .bi-bag');
      if (navCart) {
        navCart.parentElement.style.transform = 'scale(1.2)';
        setTimeout(() => navCart.parentElement.style.transform = '', 200);
      }
    });
  });


  // ════════ CHECKOUT MODAL ════════

  /* ── Render ringkasan pesanan ── */
  function renderCheckoutSummary() {
  const container = document.getElementById('summaryItems');
  if (!container) return;

  // Ambil hanya item yang dicentang di cart
  const checkedData = getCheckedCartItems();
  const checkoutItems = checkedData.map(item => ({
    name:  item.product_name,
    price: item.product_price,
    qty:   item.quantity,
    img:   item.product_img || null,
  }));

  if (checkoutItems.length === 0) {
    container.innerHTML = `
      <div class="text-center py-3" style="color:var(--mid-gray);font-size:0.85rem">
        Belum ada produk dipilih.
      </div>`;
    ['summarySubtotal', 'summaryTotal'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.textContent = formatRp(0);
    });
    return;
  }

  container.innerHTML = checkoutItems.map(item => `
    <div class="summary-item">
      <div class="summary-item-thumb">
        ${item.img
          ? `<img src="${item.img}" alt="${item.name}" />`
          : `<i class="bi bi-box-seam"></i>`}
      </div>
      <div class="summary-item-info">
        <div class="summary-item-name">${item.name}</div>
        <div class="summary-item-qty">Qty ${item.qty}</div>
      </div>
      <div class="summary-item-price">${formatRp(item.price * item.qty)}</div>
    </div>
  `).join('');

  const subtotal = checkoutItems.reduce((sum, i) => sum + (i.price * i.qty), 0);
  const shipping = 0;
  const total    = subtotal + shipping;

  const subtotalEl = document.getElementById('summarySubtotal');
  const shippingEl = document.getElementById('summaryShipping');
  const totalEl    = document.getElementById('summaryTotal');

  if (subtotalEl) subtotalEl.textContent = formatRp(subtotal);
  if (shippingEl) shippingEl.textContent = shipping === 0 ? 'Gratis' : formatRp(shipping);
  if (totalEl)    totalEl.textContent    = formatRp(total);
}

  /* ── Render ulang saat modal dibuka ── */
  const checkoutModal = document.getElementById('checkoutModal');
  if (checkoutModal) {
    checkoutModal.addEventListener('show.bs.modal', () => {
      renderCheckoutSummary();
    });
  }

  /* ── Handle klik tombol Bayar ── */
  window.handlePay = function () {
    const name     = document.getElementById('recipientName')?.value.trim();
    const phone    = document.getElementById('recipientPhone')?.value.trim();
    const email    = document.getElementById('recipientEmail')?.value.trim();
    const address  = document.getElementById('recipientAddress')?.value.trim();
    const city     = document.getElementById('recipientCity')?.value.trim();
    const province = document.getElementById('recipientProvince')?.value.trim();
    const zip      = document.getElementById('recipientZip')?.value.trim();
    const note     = document.getElementById('orderNote')?.value.trim();

    // Validasi — highlight field kosong
    const requiredFields = [
      'recipientName', 'recipientPhone', 'recipientEmail',
      'recipientAddress', 'recipientCity', 'recipientProvince', 'recipientZip'
    ];

    let isValid = true;
    requiredFields.forEach(id => {
      const el = document.getElementById(id);
      if (el && !el.value.trim()) {
        el.style.borderColor = '#d0574a';
        el.addEventListener('input', () => { el.style.borderColor = ''; }, { once: true });
        isValid = false;
      }
    });

    if (!isValid) return;

  
  const checkedData = getCheckedCartItems();
  const orderData = {
    recipient: { name, phone, email, address, city, province, zip },
    note,
    items: checkedData.map(i => ({
      productId:   i.product_id,
      productName: i.product_name,
      price:       i.product_price,
      qty:         i.quantity,
    })),
    subtotal: checkedData.reduce((sum, i) => sum + (i.product_price * i.quantity), 0),
    shipping: 0,
  };

  console.log('Lanjut ke Midtrans');
  console.log('Order data:', orderData);
};

});


// ════════ HELPERS ════════

/* ── Format Rupiah ── */
function formatRp(number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(number);
}