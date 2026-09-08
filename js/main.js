const menuToggle = document.querySelector('.menu-toggle');
const mainNav = document.querySelector('.main-nav');

if (menuToggle && mainNav) {
  menuToggle.addEventListener('click', () => {
    const isOpen = mainNav.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
  });

  mainNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mainNav.classList.remove('open');
      menuToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

document.querySelectorAll('.faq-item button').forEach(button => {
  button.addEventListener('click', () => {
    const item = button.parentElement;
    const wasOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item').forEach(faq => faq.classList.remove('open'));
    if (!wasOpen) item.classList.add('open');
  });
});

const story = document.querySelector('.scroll-story');
let ticking = false;

function clamp(value, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

function updateScrollStory() {
  ticking = false;
  if (!story) return;

  const rect = story.getBoundingClientRect();
  const scrollable = Math.max(1, story.offsetHeight - window.innerHeight);
  const progress = clamp(-rect.top / scrollable);
  // Choreography is intentionally split into distinct beats so text, fragments
  // and the final phone composition never fight for the same visual space.
  const fragmentsIn = clamp((progress - 0.10) / 0.10);
  const assemble = clamp((progress - 0.25) / 0.30);
  const phoneReveal = clamp((progress - 0.38) / 0.18);
  const finalStage = clamp((progress - 0.82) / 0.12);

  story.style.setProperty('--story-progress', progress.toFixed(4));
  story.style.setProperty('--fragments-in', fragmentsIn.toFixed(4));
  story.style.setProperty('--assemble', assemble.toFixed(4));
  story.style.setProperty('--phone-reveal', phoneReveal.toFixed(4));
  story.style.setProperty('--final-stage', finalStage.toFixed(4));
}

function onScroll() {
  const header = document.querySelector('.site-header');
  if (header) {
    header.style.background = window.scrollY > 40
      ? 'rgba(91,33,182,.98)'
      : 'rgba(91,33,182,.96)';
  }

  if (!ticking) {
    ticking = true;
    requestAnimationFrame(updateScrollStory);
  }
}

window.addEventListener('scroll', onScroll, { passive: true });
window.addEventListener('resize', updateScrollStory);
updateScrollStory();

/* Hero LUM: profundidade reativa leve, sem loop contínuo */
(() => {
  const hero = document.querySelector('.lum-centered-hero');
  const art = hero?.querySelector('.lum-hero-art');
  if (!hero || !art || window.matchMedia('(max-width: 900px)').matches) return;

  let frame = 0;
  const render = (x, y) => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      art.style.transform = `rotateX(${(-y * 1.4).toFixed(2)}deg) rotateY(${(x * 1.8).toFixed(2)}deg)`;
    });
  };

  hero.addEventListener('pointermove', (event) => {
    const rect = hero.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    render(x, y);
  });

  hero.addEventListener('pointerleave', () => render(0, 0));
})();


/* Parallax dos anéis removido: objeto elíptico usa apenas flutuação CSS sutil. */


/* ===== Galerias do portfólio Patricia: setas + autoplay ===== */
(() => {
  document.querySelectorAll('[data-gallery]').forEach((gallery) => {
    const track = gallery.querySelector('.gallery-track');
    const slides = [...gallery.querySelectorAll('.portfolio-slide')];
    const prev = gallery.querySelector('.gallery-prev');
    const next = gallery.querySelector('.gallery-next');
    const dots = gallery.querySelector('.gallery-dots');
    if (!track || slides.length < 2) return;

    let index = 0;
    let timer = null;
    const delay = Number(gallery.dataset.autoplay || 5000);

    slides.forEach((_, i) => {
      const dot = document.createElement('i');
      if (i === 0) dot.classList.add('active');
      dots?.appendChild(dot);
    });
    const dotItems = dots ? [...dots.children] : [];

    const render = () => {
      track.style.transform = `translateX(-${index * 100}%)`;
      dotItems.forEach((d, i) => d.classList.toggle('active', i === index));
    };
    const go = (dir = 1) => {
      index = (index + dir + slides.length) % slides.length;
      render();
    };
    const stop = () => { if (timer) clearInterval(timer); timer = null; };
    const start = () => {
      stop();
      if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        timer = setInterval(() => go(1), delay);
      }
    };

    prev?.addEventListener('click', () => { go(-1); start(); });
    next?.addEventListener('click', () => { go(1); start(); });
    gallery.addEventListener('mouseenter', stop);
    gallery.addEventListener('mouseleave', start);
    gallery.addEventListener('focusin', stop);
    gallery.addEventListener('focusout', start);
    start();
  });
})();
