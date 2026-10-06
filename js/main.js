/* Rohit Singh — portfolio interactions.
   Motion is opt-out: everything here respects prefers-reduced-motion. */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── reveal on scroll ──────────────────────────────────────────
     Runs FIRST and in its own try/catch: .r starts at opacity:0, so a
     failure anywhere else must never leave the page invisible. ---- */
  try {
    var reveals = document.querySelectorAll('.r');

    if (reduce || !('IntersectionObserver' in window)) {
      Array.prototype.forEach.call(reveals, function (el) { el.classList.add('in'); });
    } else {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var el = entry.target;
          // stagger siblings — 40ms each, capped so nothing feels slow
          var sibs = Array.prototype.filter.call(el.parentNode.children, function (n) {
            return n.classList && n.classList.contains('r');
          });
          var i = Math.min(sibs.indexOf(el), 5);
          setTimeout(function () { el.classList.add('in'); }, i * 40);
          io.unobserve(el);
        });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

      Array.prototype.forEach.call(reveals, function (el) { io.observe(el); });
    }
  } catch (e) {
    Array.prototype.forEach.call(document.querySelectorAll('.r'), function (el) {
      el.classList.add('in');
    });
  }

  /* ── year ── */
  var yr = document.getElementById('yr');
  if (yr) yr.textContent = new Date().getFullYear();

  /* ── mobile menu ── */
  var burger = document.getElementById('burger');
  var menu = document.getElementById('menu');

  function closeMenu() {
    menu.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Open menu');
  }

  if (burger && menu) {
    burger.addEventListener('click', function () {
      var open = menu.classList.toggle('open');
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });

    menu.addEventListener('click', function (e) {
      if (e.target.closest('a')) closeMenu();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.classList.contains('open')) {
        closeMenu();
        burger.focus();
      }
    });
  }

  /* ── header state + scroll progress ── */
  var hdr = document.getElementById('hdr');
  var bar = document.getElementById('scroll-bar');
  var ticking = false;

  function onScroll() {
    var y = window.scrollY;
    if (hdr) hdr.classList.toggle('stuck', y > 8);

    if (bar) {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = (max > 0 ? (y / max) * 100 : 0) + '%';
    }
    ticking = false;
  }

  window.addEventListener('scroll', function () {
    if (!ticking) {
      window.requestAnimationFrame(onScroll);
      ticking = true;
    }
  }, { passive: true });
  onScroll();

  /* ── active nav link ── */
  var links = Array.prototype.slice.call(document.querySelectorAll('.menu a[href^="#"]'));
  var sections = links
    .map(function (a) { return document.querySelector(a.getAttribute('href')); })
    .filter(Boolean);

  if ('IntersectionObserver' in window && sections.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        links.forEach(function (a) {
          a.classList.toggle('on', a.getAttribute('href') === '#' + entry.target.id);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });

    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ── API request/response tabs ── */
  document.querySelectorAll('.api').forEach(function (api) {
    var tabs = api.querySelectorAll('.api-tab');
    var panes = api.querySelectorAll('.api-pane');

    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        var key = tab.dataset.api;
        tabs.forEach(function (t) {
          var on = t === tab;
          t.classList.toggle('is-on', on);
          t.setAttribute('aria-selected', String(on));
        });
        panes.forEach(function (p) {
          p.classList.toggle('is-on', p.dataset.pane === key);
        });
      });
    });
  });
})();
