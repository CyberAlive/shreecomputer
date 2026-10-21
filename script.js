  // ── Counter animation on scroll ──
  function animateCounters() {
    document.querySelectorAll('[data-target]').forEach(el => {
      const target = parseInt(el.dataset.target);
      const duration = 1600;
      const step = target / (duration / 16);
      let current = 0;
      const timer = setInterval(() => {
        current = Math.min(current + step, target);
        el.textContent = Math.floor(current).toLocaleString();
        if (current >= target) {
          el.textContent = target.toLocaleString();
          clearInterval(timer);
        }
      }, 16);
    });
  }

  let countersStarted = false;
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !countersStarted) {
        countersStarted = true;
        animateCounters();
      }
    });
  }, { threshold: 0.3 });
  const statsRow = document.querySelector('.stats-row');
  if (statsRow) observer.observe(statsRow);

  // ── Scroll fade-in ──
  const fadeObserver = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.style.animation = 'fadeUp 0.6s ease both';
        e.target.style.opacity = '1';
      }
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.achievement-card, .cert-card, .service-card').forEach(el => {
    el.style.opacity = '0';
    fadeObserver.observe(el);
  });

  // ── Form submit ──
  function submitForm() {
    const name  = document.getElementById('fname').value.trim();
    const phone = document.getElementById('fphone').value.trim();
    const email = document.getElementById('femail').value.trim();
    const device= document.getElementById('fdevice').value;
    if (!name || !phone || !email || !device) {
      alert('Please fill in all required fields.');
      return;
    }
    const toast = document.getElementById('toast');
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 4000);
    document.getElementById('fname').value = '';
    document.getElementById('fphone').value = '';
    document.getElementById('femail').value = '';
    document.getElementById('fdevice').value = '';
    document.getElementById('fissue').value = '';
  }

  // ── Nav active highlight ──
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a');
  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(s => {
      if (window.scrollY >= s.offsetTop - 80) current = s.id;
    });
    navLinks.forEach(a => {
      a.style.color = a.getAttribute('href') === `#${current}` ? 'var(--accent)' : '';
    });
  });