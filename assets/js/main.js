/* Legacy Wallet — landing page behaviour.
   Everything here is progressive enhancement: the page is fully readable
   and navigable with this file absent. */

(function () {
  'use strict';

  /* --- Mobile navigation ------------------------------------------------- */

  var header = document.getElementById('header');
  var toggle = document.getElementById('navToggle');
  var nav = document.getElementById('primaryNav');

  function closeNav() {
    if (!header || !toggle) return;
    header.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Menü öffnen');
  }

  if (header && toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = header.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', open ? 'Menü schließen' : 'Menü öffnen');
    });

    // Collapse after jumping to a section, so the target isn't hidden behind
    // an expanded menu.
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) closeNav();
    });

    // The menu only exists below 900px; leaving that range strands it open.
    var wide = window.matchMedia('(min-width: 901px)');
    var onWide = function (e) { if (e.matches) closeNav(); };
    if (wide.addEventListener) wide.addEventListener('change', onWide);
    else if (wide.addListener) wide.addListener(onWide);
  }

  /* --- Scroll reveal ------------------------------------------------------ */

  var revealables = document.querySelectorAll('.reveal');
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reduced || !('IntersectionObserver' in window)) {
    // No observer (or motion is unwelcome): show everything immediately.
    Array.prototype.forEach.call(revealables, function (el) {
      el.classList.add('is-visible');
    });
  } else {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });

    Array.prototype.forEach.call(revealables, function (el) {
      observer.observe(el);
    });
  }

  /* --- Figure lightbox ---------------------------------------------------- */

  var lightbox = document.getElementById('lightbox');
  var lightboxImg = document.getElementById('lightboxImg');
  var lightboxClose = document.getElementById('lightboxClose');
  var lastFocused = null;

  function openLightbox(src, alt) {
    if (!lightbox || !lightboxImg) return;
    lastFocused = document.activeElement;
    lightboxImg.src = src;
    lightboxImg.alt = alt || '';
    lightbox.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    if (lightboxClose) lightboxClose.focus();
  }

  function hideLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove('is-open');
    document.body.style.overflow = '';
    // Drop the source so a large figure isn't held in memory while hidden.
    if (lightboxImg) { lightboxImg.src = ''; lightboxImg.alt = ''; }
    if (lastFocused && lastFocused.focus) lastFocused.focus();
    lastFocused = null;
  }

  Array.prototype.forEach.call(
    document.querySelectorAll('[data-lightbox]'),
    function (btn) {
      btn.addEventListener('click', function () {
        var img = btn.querySelector('img');
        openLightbox(btn.getAttribute('data-lightbox'), img ? img.alt : '');
      });
    }
  );

  if (lightboxClose) lightboxClose.addEventListener('click', hideLightbox);

  if (lightbox) {
    // Click anywhere off the image closes it.
    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) hideLightbox();
    });
  }

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (lightbox && lightbox.classList.contains('is-open')) hideLightbox();
    else if (header && header.classList.contains('is-open')) closeNav();
  });
})();
