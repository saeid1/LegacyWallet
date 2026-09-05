/* Legacy Wallet — landing page behaviour.
   Everything here is progressive enhancement: the page is fully readable
   and navigable with this file absent. */

(function () {
  'use strict';

  /* --- Language toggle (DE / EN) ------------------------------------------
     German lives in the markup; the English of every string sits next to it in
     a data-en attribute (data-en-<attr> for translated attributes such as alt
     or aria-label). Swapping is therefore a pure DOM pass — no second page,
     no dictionary that can drift out of sync with the markup. */

  var LANG_KEY = 'lw-lang';
  var lang = 'de';

  // The only strings JS sets by itself, so they cannot live in the markup.
  var NAV_LABEL = {
    de: { open: 'Menü öffnen', close: 'Menü schließen' },
    en: { open: 'Open menu', close: 'Close menu' }
  };

  // One pass over the document collects every translatable spot with both
  // languages, so later switches touch nothing but the values.
  var strings = [];
  Array.prototype.forEach.call(document.querySelectorAll('*'), function (el) {
    Array.prototype.forEach.call(el.attributes, function (a) {
      if (a.name === 'data-en') {
        strings.push({ el: el, attr: null, de: el.innerHTML, en: a.value });
      } else if (a.name.indexOf('data-en-') === 0) {
        var target = a.name.slice(8);
        strings.push({ el: el, attr: target, de: el.getAttribute(target) || '', en: a.value });
      }
    });
  });

  var langButtons = document.querySelectorAll('[data-lang]');

  function applyLang(next, persist) {
    lang = next === 'en' ? 'en' : 'de';
    document.documentElement.lang = lang;

    strings.forEach(function (s) {
      var value = lang === 'en' ? s.en : s.de;
      if (s.attr) s.el.setAttribute(s.attr, value);
      else s.el.innerHTML = value;
    });

    Array.prototype.forEach.call(langButtons, function (btn) {
      var active = btn.getAttribute('data-lang') === lang;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    });

    // The hamburger's label is set by script, so re-derive it from the state.
    if (toggle) {
      var open = header && header.classList.contains('is-open');
      toggle.setAttribute('aria-label', NAV_LABEL[lang][open ? 'close' : 'open']);
    }

    if (persist) {
      try { localStorage.setItem(LANG_KEY, lang); } catch (e) { /* private mode */ }
    }
  }

  Array.prototype.forEach.call(langButtons, function (btn) {
    btn.addEventListener('click', function () {
      applyLang(btn.getAttribute('data-lang'), true);
    });
  });

  var stored = null;
  try { stored = localStorage.getItem(LANG_KEY); } catch (e) { /* private mode */ }
  if (stored === 'en') applyLang('en', false);

  /* --- Mobile navigation ------------------------------------------------- */

  var header = document.getElementById('header');
  var toggle = document.getElementById('navToggle');
  var nav = document.getElementById('primaryNav');

  function closeNav() {
    if (!header || !toggle) return;
    header.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', NAV_LABEL[lang].open);
  }

  if (header && toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = header.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', NAV_LABEL[lang][open ? 'close' : 'open']);
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
