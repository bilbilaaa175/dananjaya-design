document.addEventListener('DOMContentLoaded', function () {

  // ── 1. NAVBAR: tambah class 'scrolled' saat scroll ──
  const navbar = document.getElementById('navbar');
  function handleScroll() {
    navbar.classList.toggle('scrolled', window.scrollY > 80);
  }
  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();


  // ── 2. SMOOTH SCROLL untuk semua anchor link ──
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const offset = navbar.offsetHeight + 16;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
      // Tutup navbar mobile kalau terbuka
      const navCollapse = document.getElementById('navMenu');
      if (navCollapse && navCollapse.classList.contains('show')) {
        bootstrap.Collapse.getInstance(navCollapse)?.hide();
      }
    });
  });


  // ── 3. AUTH MODAL: switch Login ↔ Register ──
  const loginView    = document.getElementById('loginView');
  const registerView = document.getElementById('registerView');
  const modalTitle   = document.getElementById('authModalTitle');

  window.showRegister = function () {
    loginView.classList.add('d-none');
    registerView.classList.remove('d-none');
    modalTitle.textContent = 'Buat Akun';
  };

  window.showLogin = function () {
    registerView.classList.add('d-none');
    loginView.classList.remove('d-none');
    modalTitle.textContent = 'Masuk';
  };

  const authModal = document.getElementById('authModal');
  if (authModal) {
    authModal.addEventListener('show.bs.modal', () => showLogin());
  }


  // ── 4. ACTIVE NAV LINK saat scroll ──
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('#navbar .nav-link[href^="#"]');

  function updateActiveNav() {
    let current = '';
    sections.forEach(section => {
      const top = section.offsetTop - navbar.offsetHeight - 40;
      if (window.scrollY >= top) current = section.id;
    });
    navLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === '#' + current);
    });
  }
  window.addEventListener('scroll', updateActiveNav, { passive: true });


  // ── 5. FADE-UP saat scroll ──
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));


  // ── 6. CATALOG — Cinematic full-width carousel ──
  const totalSlides = 5;
  const catalogSwiper = new Swiper('.catalog-hero-swiper', {
    loop: true,
    speed: 900,
    effect: 'fade',
    fadeEffect: { crossFade: true },
    navigation: { prevEl: '#cat-prev', nextEl: '#cat-next' },
    on: {
      slideChange: function () {
        const idx = this.realIndex;
        // Update progress bar
        document.getElementById('cat-progress').style.width =
          ((idx + 1) / totalSlides * 100) + '%';
        // Update thumbnail aktif
        document.querySelectorAll('.catalog-thumb').forEach((t, i) => {
          t.classList.toggle('active', i === idx);
        });
      },
      init: function () {
        document.getElementById('cat-progress').style.width =
          (1 / totalSlides * 100) + '%';
      }
    }
  });

  // Klik thumbnail → pindah slide
  document.querySelectorAll('.catalog-thumb').forEach(thumb => {
    thumb.addEventListener('click', function () {
      catalogSwiper.slideToLoop(parseInt(this.dataset.index));
    });
  });


  // ── 7. PAKET slider ──
  new Swiper('.paket-swiper', {
    slidesPerView: 1.1,
    spaceBetween: 16,
    grabCursor: true,
    navigation: { prevEl: '#paket-prev', nextEl: '#paket-next' },
    pagination: { el: '#paket-pag', clickable: true },
    breakpoints: {
      576: { slidesPerView: 1.5, spaceBetween: 20 },
      768: { slidesPerView: 2,   spaceBetween: 24 },
      992: { slidesPerView: 3,   spaceBetween: 28 },
    }
  });


  // ── 8. PUBLICITY slider ──
  new Swiper('.pub-swiper', {
    slidesPerView: 1.2,
    spaceBetween: 12,
    grabCursor: true,
    navigation: { prevEl: '#pub-prev', nextEl: '#pub-next' },
    pagination: { el: '#pub-pag', clickable: true },
    breakpoints: {
      576: { slidesPerView: 2,   spaceBetween: 16 },
      768: { slidesPerView: 2.5, spaceBetween: 16 },
      992: { slidesPerView: 3.5, spaceBetween: 20 },
    }
  });


  // ── 9. FILTER TABS (Publicity) ──
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      // TODO: tambah logika filter konten di sini nanti
    });
  });

});