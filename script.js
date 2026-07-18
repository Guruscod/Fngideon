// ==========================================================
// GIDEON NORKPLIM FIADOWU — PORTFOLIO SCRIPT
// ==========================================================

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- YEAR ---------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- NAV SCROLL STATE ---------- */
  const nav = document.getElementById('nav');
  const progressBar = document.getElementById('progressBar');

  function onScroll(){
    // nav background
    if (window.scrollY > 30) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');

    // scroll progress bar
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    progressBar.style.width = pct + '%';

    updateActiveNavLink();
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- MOBILE MENU ---------- */
  const burger = document.getElementById('burger');
  const mobileMenu = document.getElementById('mobileMenu');

  function closeMenu(){
    burger.classList.remove('open');
    mobileMenu.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
  }

  burger.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.toggle('open');
    burger.classList.toggle('open', isOpen);
    burger.setAttribute('aria-expanded', String(isOpen));
  });

  document.querySelectorAll('.mobile-link').forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  /* ---------- ACTIVE NAV LINK ON SCROLL ---------- */
  const sections = document.querySelectorAll('main section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  function updateActiveNavLink(){
    let current = '';
    sections.forEach(section => {
      const top = section.offsetTop - 140;
      if (window.scrollY >= top) current = section.getAttribute('id');
    });
    navLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === '#' + current);
    });
  }

  /* ---------- SCROLL REVEAL ---------- */
  const revealEls = document.querySelectorAll('.reveal');

  // Only hide-and-animate if IntersectionObserver is supported.
  // Otherwise, elements stay visible (see default CSS state).
  if ('IntersectionObserver' in window){

    // Mark elements as hidden-until-revealed now that we know JS is running.
    revealEls.forEach(el => el.classList.add('pre-reveal'));

    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting){
          // stagger siblings slightly for a nicer cascade
          const index = Array.from(entry.target.parentElement.children)
            .filter(el => el.classList.contains('reveal'))
            .indexOf(entry.target);
          const delay = Math.min(index * 60, 240); // cap so long grids stay snappy
          entry.target.style.transitionDelay = delay + 'ms';
          entry.target.classList.remove('pre-reveal');
          entry.target.classList.add('in-view');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    revealEls.forEach(el => revealObserver.observe(el));

    // Safety net: if anything is still hidden after 4s (e.g. an element
    // that never intersects because of layout quirks), reveal it anyway.
    setTimeout(() => {
      revealEls.forEach(el => el.classList.remove('pre-reveal'));
    }, 4000);
  }

  /* ---------- SKILL BAR FILL ANIMATION ---------- */
  const skillFills = document.querySelectorAll('.skill-fill');

  const skillObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting){
        const level = entry.target.getAttribute('data-level') || 0;
        entry.target.style.width = level + '%';
        skillObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });

  skillFills.forEach(el => skillObserver.observe(el));

  /* ---------- CURSOR SPOTLIGHT (HERO) ---------- */
  const spotlight = document.getElementById('spotlight');
  const hero = document.querySelector('.hero');
  const isTouch = window.matchMedia('(hover: none)').matches;

  if (hero && spotlight && !isTouch){
    hero.addEventListener('mousemove', (e) => {
      spotlight.style.opacity = '1';
      spotlight.style.transform = `translate(${e.clientX - 300}px, ${e.clientY - 300}px)`;
    });
    hero.addEventListener('mouseleave', () => {
      spotlight.style.opacity = '0';
    });
  }

  /* ---------- CONTACT FORM (mailto handoff) ---------- */
  const form = document.getElementById('contactForm');
  const formNote = document.getElementById('formNote');

  if (form){
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('name').value.trim();
      const email = document.getElementById('email').value.trim();
      const message = document.getElementById('message').value.trim();

      if (!name || !email || !message){
        formNote.textContent = 'Please fill in every field before sending.';
        return;
      }

      const subject = encodeURIComponent(`Project enquiry from ${name}`);
      const body = encodeURIComponent(`${message}\n\n— ${name} (${email})`);
      window.location.href = `mailto:hello@gideonfiadowu.com?subject=${subject}&body=${body}`;

      formNote.textContent = 'Opening your email app to send this message...';
      form.reset();
    });
  }

});
