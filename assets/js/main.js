document.addEventListener('DOMContentLoaded', function () {
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.body.classList.add('motion-ready');

  // Mobile testimonial cards sit inside a horizontal scroller. Some mobile
  // browsers do not request native lazy-loaded images that begin off-screen,
  // so eagerly load this small image set only at the carousel breakpoint.
  if (window.matchMedia('(max-width: 620px)').matches) {
    document.querySelectorAll('.testimonial-cover img').forEach(function (img) {
      img.loading = 'eager';
    });
  }

  if (!reducedMotion) {
    window.requestAnimationFrame(function () {
      window.requestAnimationFrame(function () {
        document.body.classList.add('is-loaded');
      });
    });

    var revealSelector = [
      '.section-head', '.value-card', '.step', '.booking-panel',
      '.team-card', '.marquee-wrap', '.faq-item', '.contact-grid',
      '.page-hero', '.bio-top', '.terms-body', '.checklist-item'
    ].join(',');
    var revealItems = Array.prototype.slice.call(document.querySelectorAll(revealSelector));

    revealItems.forEach(function (item, index) {
      item.classList.add('reveal-item');
      item.style.setProperty('--reveal-delay', (index % 4) * 75 + 'ms');
    });

    if ('IntersectionObserver' in window) {
      var revealObserver = new IntersectionObserver(function (entries, observer) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });

      revealItems.forEach(function (item) { revealObserver.observe(item); });
    } else {
      revealItems.forEach(function (item) { item.classList.add('is-visible'); });
    }
  } else {
    document.body.classList.add('is-loaded');
  }

  var toggle = document.querySelector('.nav-toggle');
  var links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', function () {
      links.classList.toggle('is-open');
      var expanded = links.classList.contains('is-open');
      toggle.setAttribute('aria-expanded', expanded);
    });
    links.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        links.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  var videoModal = document.querySelector('#video-modal');
  if (videoModal) {
    var modalFrame = videoModal.querySelector('iframe');
    var closeModal = function () {
      videoModal.classList.remove('is-open');
      videoModal.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('modal-open');
      modalFrame.removeAttribute('src');
    };
    document.querySelectorAll('.testimonial-cover').forEach(function (cover) {
      cover.addEventListener('click', function () {
        modalFrame.src = cover.getAttribute('data-video');
        videoModal.classList.add('is-open');
        videoModal.setAttribute('aria-hidden', 'false');
        document.body.classList.add('modal-open');
        videoModal.querySelector('.video-modal-close').focus();
      });
    });
    videoModal.querySelector('.video-modal-close').addEventListener('click', closeModal);
    videoModal.addEventListener('click', function (event) { if (event.target === videoModal) closeModal(); });
    document.addEventListener('keydown', function (event) { if (event.key === 'Escape' && videoModal.classList.contains('is-open')) closeModal(); });
  }

  // Contact form (Netlify Forms handles submission natively; this just gives feedback)
  var form = document.querySelector('.contact-form');
  if (form) {
    form.addEventListener('submit', function () {
      var status = form.querySelector('.form-status');
      if (status) status.textContent = 'Sending…';
    });
  }
});
