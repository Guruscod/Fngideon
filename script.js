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

  /* ---------- CONTACT FORM (real submission via Formspree) ----------
     1. Create a free account at https://formspree.io
     2. Create a new form, connected to fngideon1@gmail.com
     3. Copy the form's endpoint (looks like https://formspree.io/f/xxxxxxx)
     4. Paste it below, replacing YOUR_FORM_ID
     Until you do that, submissions fall back to opening the visitor's
     email app instead (same as before), so nothing is ever fully broken. */
  const FORMSPREE_ENDPOINT = 'https://formspree.io/f/YOUR_FORM_ID';

  const form = document.getElementById('contactForm');
  const formNote = document.getElementById('formNote');
  const submitBtn = form ? form.querySelector('button[type="submit"]') : null;

  function setNote(text, type){
    formNote.textContent = text;
    formNote.classList.remove('is-error', 'is-success');
    if (type) formNote.classList.add(type);
  }

  function sendViaMailto(name, email, message){
    const subject = encodeURIComponent(`Project enquiry from ${name}`);
    const body = encodeURIComponent(`${message}\n\n— ${name} (${email})`);
    window.location.href = `mailto:fngideon1@gmail.com?subject=${subject}&body=${body}`;
    setNote('Opening your email app to send this message...', 'is-success');
  }

  if (form){
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const name = document.getElementById('name').value.trim();
      const email = document.getElementById('email').value.trim();
      const message = document.getElementById('message').value.trim();

      if (!name || !email || !message){
        setNote('Please fill in every field before sending.', 'is-error');
        return;
      }

      // Endpoint not configured yet — use the mailto fallback directly.
      if (!FORMSPREE_ENDPOINT || FORMSPREE_ENDPOINT.includes('YOUR_FORM_ID')){
        sendViaMailto(name, email, message);
        form.reset();
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending...';
      setNote('Sending your message...', null);

      try {
        const response = await fetch(FORMSPREE_ENDPOINT, {
          method: 'POST',
          headers: { 'Accept': 'application/json' },
          body: new FormData(form)
        });

        if (response.ok){
          setNote("Message sent — I'll get back to you within a day or two.", 'is-success');
          form.reset();
        } else {
          throw new Error('Form service returned an error');
        }
      } catch (err){
        // Network or service failure — fall back to the visitor's email app
        // so the message still has a way to reach you.
        setNote("Couldn't send automatically — opening your email app instead.", 'is-error');
        sendViaMailto(name, email, message);
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send Message';
      }
    });
  }

});

// ============================================================
// PORTFOLIO SHOWCASE — merged in from portfolio.js
// (carousel engine for the Graphic Design / Web Development /
// Content Creation sections)
// ============================================================
/* ==========================================================
   PORTFOLIO SHOWCASE — carousel engine
   One small class powers each section (Graphic Design, Web
   Development, Content Creation).

   Behaviour:
   - Auto-scrolls continuously and slowly on its own (Readdy-style
     ambient motion), pauses the instant you hover, touch, drag,
     or focus it — then resumes a moment after you let go
   - Arrow buttons + keyboard (Left/Right when focused)
   - Drag (mouse) and swipe (touch) via Pointer Events
   - Mouse-wheel horizontal navigation (throttled to one slide
     per gesture so it doesn't fly through the whole set)
   - True infinite looping: the real slides are cloned on both
     sides, so it always feels endless with no visible "reset"
   - Snaps precisely to one card at a time
   - Animated "01 / 08" counter reflecting the real (non-cloned)
     slide position

   Usage: give any container the class ".psc-carousel" with a
   ".psc-viewport" > ".psc-track" > cards inside, plus prev/next
   buttons and a counter — see index.html for the exact markup.
   Optional attributes on the .psc-carousel root:
     data-autoplay="false"   — disable ambient auto-scroll
     data-interval="4000"    — ms between auto-advances (default 3200)
   Then call: new PortfolioCarousel(rootElement)
========================================================== */

class PortfolioCarousel {
  constructor(root) {
    this.root = root;
    this.viewport = root.querySelector('.psc-viewport');
    this.track = root.querySelector('.psc-track');
    this.prevBtn = root.querySelector('.psc-prev');
    this.nextBtn = root.querySelector('.psc-next');
    this.counterEl = root.querySelector('.psc-counter');

    // Only the slides authored in HTML — before we add clones.
    this.originalSlides = Array.from(this.track.children);
    this.total = this.originalSlides.length;

    if (this.total === 0) return;

    this.cloneEdges();

    // Start on the first slide of the "real" (middle) set.
    this.index = this.total;
    this.slideSize = 0;
    this.isDragging = false;
    this.dragStartX = 0;
    this.dragDelta = 0;
    this.wheelLock = false;

    // Autoplay: opt-out via data-autoplay="false" on the root element.
    this.autoplayEnabled = root.dataset.autoplay !== 'false';
    this.autoplayInterval = parseInt(root.dataset.interval, 10) || 3200;
    this.autoplayTimer = null;
    this.resumeTimer = null;

    this.measure();
    this.bindEvents();
    this.goTo(this.index, false);
    this.updateCounter();
    this.startAutoplay();

    // Recalculate card width on resize (breakpoints change card count).
    window.addEventListener('resize', () => {
      this.measure();
      this.goTo(this.index, false);
    });
  }

  /* Clone the first/last few real slides so wrapping never shows a gap. */
  cloneEdges() {
    const cloneCount = this.total;
    const fragBefore = document.createDocumentFragment();
    const fragAfter = document.createDocumentFragment();

    this.originalSlides.forEach((slide) => {
      const cloneA = slide.cloneNode(true);
      cloneA.setAttribute('aria-hidden', 'true');
      cloneA.querySelectorAll('a, button').forEach(el => el.setAttribute('tabindex', '-1'));
      fragBefore.appendChild(cloneA);

      const cloneB = slide.cloneNode(true);
      cloneB.setAttribute('aria-hidden', 'true');
      cloneB.querySelectorAll('a, button').forEach(el => el.setAttribute('tabindex', '-1'));
      fragAfter.appendChild(cloneB);
    });

    this.track.insertBefore(fragBefore, this.track.firstChild);
    this.track.appendChild(fragAfter);
    this.allSlides = Array.from(this.track.children);

    // Real cards keep their accessible list semantics; clones are hidden.
    this.originalSlides.forEach(s => s.removeAttribute('aria-hidden'));
  }

  measure() {
    const style = getComputedStyle(this.track);
    const gap = parseFloat(style.columnGap || style.gap || '0');
    const first = this.allSlides[0];
    this.slideSize = first.getBoundingClientRect().width + gap;
  }

  bindEvents() {
    this.prevBtn && this.prevBtn.addEventListener('click', () => { this.prev(); this.restartAutoplay(); });
    this.nextBtn && this.nextBtn.addEventListener('click', () => { this.next(); this.restartAutoplay(); });

    // Keyboard navigation when the carousel has focus.
    this.root.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') { e.preventDefault(); this.next(); this.restartAutoplay(); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); this.prev(); this.restartAutoplay(); }
    });

    // Pointer-based drag/swipe — works for mouse and touch alike.
    this.viewport.addEventListener('pointerdown', (e) => this.onPointerDown(e));
    window.addEventListener('pointermove', (e) => this.onPointerMove(e));
    window.addEventListener('pointerup', () => this.onPointerUp());

    // Wheel: horizontal (trackpad) or vertical (mouse wheel) both count.
    this.viewport.addEventListener('wheel', (e) => this.onWheel(e), { passive: false });

    // When the animated transform finishes, silently jump back into the
    // "real" middle set if we've drifted into clone territory.
    this.track.addEventListener('transitionend', () => this.checkLoopReset());

    // Pause the ambient auto-scroll the moment someone engages with the
    // carousel in any way, and resume shortly after they disengage.
    ['pointerenter', 'focusin'].forEach(evt =>
      this.root.addEventListener(evt, () => this.stopAutoplay())
    );
    ['pointerleave', 'focusout'].forEach(evt =>
      this.root.addEventListener(evt, () => this.restartAutoplay())
    );
  }

  onPointerDown(e) {
    this.isDragging = true;
    this.dragStartX = e.clientX;
    this.dragDelta = 0;
    this.track.classList.add('psc-dragging');
    this.viewport.setPointerCapture && this.viewport.setPointerCapture(e.pointerId);
    this.stopAutoplay();
  }

  onPointerMove(e) {
    if (!this.isDragging) return;
    this.dragDelta = e.clientX - this.dragStartX;
    const base = -this.index * this.slideSize;
    this.track.style.transform = `translateX(${base + this.dragDelta}px)`;
  }

  onPointerUp() {
    if (!this.isDragging) return;
    this.isDragging = false;
    this.track.classList.remove('psc-dragging');

    const threshold = this.slideSize * 0.18;
    if (this.dragDelta > threshold) this.prev();
    else if (this.dragDelta < -threshold) this.next();
    else this.goTo(this.index, true); // snap back
    this.restartAutoplay();
  }

  onWheel(e) {
    // Only hijack the gesture when horizontal intent is clear, or as a
    // fallback for plain vertical mouse wheels over the carousel.
    const horizontal = Math.abs(e.deltaX) > Math.abs(e.deltaY);
    const delta = horizontal ? e.deltaX : e.deltaY;
    if (Math.abs(delta) < 12) return;

    e.preventDefault();
    if (this.wheelLock) return;
    this.wheelLock = true;
    delta > 0 ? this.next() : this.prev();
    this.restartAutoplay();
    setTimeout(() => { this.wheelLock = false; }, 420);
  }

  next() { this.goTo(this.index + 1, true); }
  prev() { this.goTo(this.index - 1, true); }

  goTo(index, animate) {
    this.index = index;
    this.track.style.transition = animate ? '' : 'none';
    this.track.style.transform = `translateX(${-this.index * this.slideSize}px)`;
    if (!animate) {
      // Force reflow so the next transform change animates again.
      // eslint-disable-next-line no-unused-expressions
      this.track.offsetHeight;
      this.track.style.transition = '';
    }
    this.updateCounter();
  }

  /* After animating past the cloned edge, jump back into the real set
     with no transition — invisible to the eye, keeps the loop endless. */
  checkLoopReset() {
    if (this.index >= this.total * 2) {
      this.goTo(this.index - this.total, false);
    } else if (this.index < this.total) {
      this.goTo(this.index + this.total, false);
    }
  }

  updateCounter() {
    if (!this.counterEl) return;
    const real = ((this.index - this.total) % this.total + this.total) % this.total;
    const pad = n => String(n + 1).padStart(2, '0');
    const currentEl = this.counterEl.querySelector('.psc-current');
    const totalEl = this.counterEl.querySelector('.psc-total');
    if (currentEl) currentEl.textContent = pad(real);
    if (totalEl) totalEl.textContent = pad(this.total - 1);
    this.counterEl.classList.remove('psc-bump');
    // eslint-disable-next-line no-unused-expressions
    this.counterEl.offsetWidth;
    this.counterEl.classList.add('psc-bump');
  }

  /* ---------- AMBIENT AUTOPLAY ---------- */
  startAutoplay() {
    if (!this.autoplayEnabled || this.total <= 1) return;
    clearInterval(this.autoplayTimer);
    this.autoplayTimer = setInterval(() => this.next(), this.autoplayInterval);
  }

  stopAutoplay() {
    clearInterval(this.autoplayTimer);
    clearTimeout(this.resumeTimer);
  }

  /* Stops immediately, then resumes shortly after — used whenever the
     visitor finishes interacting (mouse leaves, drag ends, etc). */
  restartAutoplay() {
    this.stopAutoplay();
    this.resumeTimer = setTimeout(() => this.startAutoplay(), 900);
  }
}

/* Boot every carousel on the page once the DOM is ready. Lazy-load any
   images marked loading="lazy" is handled natively by the browser —
   no extra JS needed for that part. */
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.psc-carousel').forEach((root) => {
    new PortfolioCarousel(root);
  });
});