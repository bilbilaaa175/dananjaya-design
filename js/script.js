/* ============================================================
   DANANJAYA — Interior & Architecture
   script.js
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ── Navbar scroll shadow ─────────────────────────────── */
  const navbar = document.getElementById('mainNavbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 20);
    });
  }

  /* ── Active nav link ──────────────────────────────────── */
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.navbar-nav .nav-link').forEach(link => {
    const href = link.getAttribute('href') || '';
    if (href === currentPath || (currentPath === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

  /* ── Auth Modal tabs ──────────────────────────────────── */
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

  /* ── HOME: Intersection Observer for sub-nav ─────────── */
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
    }, {
      rootMargin: '-118px 0px -60% 0px',
      threshold: 0
    });

    sections.forEach(s => observer.observe(s));
  }

  /* ── HOME: Fade-up on scroll ──────────────────────────── */
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

  /* ── TEAM: Division filter ────────────────────────────── */
  const filterBtns = document.querySelectorAll('.filter-btn');
  const teamCards = document.querySelectorAll('.team-card');
  if (filterBtns.length && teamCards.length) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const div = btn.dataset.division;
        teamCards.forEach(card => {
          const show = div === 'all' || card.dataset.division === div;
          card.style.display = show ? '' : 'none';
        });
      });
    });
  }

  /* ── CATALOG / PACKAGE / PUBLICITY: Category filter ──── */
  const catBtns = document.querySelectorAll('.cat-btn');
  const filterableCards = document.querySelectorAll('[data-category]');
  if (catBtns.length && filterableCards.length) {
    catBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        catBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const cat = btn.dataset.cat;
        filterableCards.forEach(card => {
          const show = cat === 'all' || card.dataset.category === cat;
          card.style.display = show ? '' : 'none';
        });
      });
    });
  }

  /* ── Search functionality ─────────────────────────────── */
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      const q = searchInput.value.toLowerCase().trim();
      filterableCards.forEach(card => {
        const text = card.textContent.toLowerCase();
        const catActive = document.querySelector('.cat-btn.active');
        const catFilter = catActive ? catActive.dataset.cat : 'all';
        const matchesCat = catFilter === 'all' || card.dataset.category === catFilter;
        const matchesQ   = q === '' || text.includes(q);
        card.style.display = (matchesCat && matchesQ) ? '' : 'none';
      });
    });
  }

  /* ── Contact: WhatsApp form ───────────────────────────── */
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name  = document.getElementById('contactName').value;
      const email = document.getElementById('contactEmail').value;
      const phone = document.getElementById('contactPhone').value;
      const msg = `Halo Dananjaya!%0ANama: ${encodeURIComponent(name)}%0AEmail: ${encodeURIComponent(email)}%0APhone: ${encodeURIComponent(phone)}`;
      window.open(`https://wa.me/6281234567890?text=${msg}`, '_blank');
    });
  }

  /* ── Cart button pulse ────────────────────────────────── */
  const cartBtns = document.querySelectorAll('.btn-cart');
  cartBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const navCart = document.querySelector('.nav-icon-btn .bi-bag');
      if (navCart) {
        navCart.parentElement.style.transform = 'scale(1.2)';
        setTimeout(() => navCart.parentElement.style.transform = '', 200);
      }
    });
  });

});
