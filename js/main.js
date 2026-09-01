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
      ? 'rgba(9,9,13,.92)'
      : 'rgba(9,9,13,.72)';
  }

  if (!ticking) {
    ticking = true;
    requestAnimationFrame(updateScrollStory);
  }
}

window.addEventListener('scroll', onScroll, { passive: true });
window.addEventListener('resize', updateScrollStory);
updateScrollStory();

// Subtle pointer parallax for the LUM signature visual. Purely decorative and disabled for reduced motion.
const lumVisual = document.querySelector('.lum-visual');
if (lumVisual && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  lumVisual.addEventListener('pointermove', (event) => {
    const rect = lumVisual.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width - .5) * 2;
    const y = ((event.clientY - rect.top) / rect.height - .5) * 2;
    lumVisual.style.setProperty('--mx', x.toFixed(3));
    lumVisual.style.setProperty('--my', y.toFixed(3));
  });
  lumVisual.addEventListener('pointerleave', () => {
    lumVisual.style.setProperty('--mx', '0');
    lumVisual.style.setProperty('--my', '0');
  });
}





// Movimento local e estável dos cards do ecossistema LUM
(() => {
  const ecosystem = document.getElementById('lumEcosystem');
  if (!ecosystem) return;

  const cards = [...ecosystem.querySelectorAll('.eco-node')];

  cards.forEach((card) => {
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;

      const rx = (-y * 3).toFixed(2);
      const ry = (x * 4).toFixed(2);

      card.style.setProperty('--hover-rx', `${rx}deg`);
      card.style.setProperty('--hover-ry', `${ry}deg`);
      card.classList.add('is-hovering');
    });

    card.addEventListener('pointerleave', () => {
      card.style.setProperty('--hover-rx', '0deg');
      card.style.setProperty('--hover-ry', '0deg');
      card.classList.remove('is-hovering');
    });
  });
})();


/* Hero LUM: parallax mínimo, somente em desktop */
(() => {
  const hero = document.querySelector('.lum-centered-hero');
  const art = hero?.querySelector('.lum-hero-art');
  const shape = hero?.querySelector('.lum-metal-shape');
  const orbitA = hero?.querySelector('.lum-orbit-a');
  const orbitB = hero?.querySelector('.lum-orbit-b');
  if (!hero || !art || !shape || window.matchMedia('(max-width: 900px)').matches) return;

  hero.addEventListener('pointermove', (e) => {
    const r = hero.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - .5;
    const y = (e.clientY - r.top) / r.height - .5;
    art.style.setProperty('--mx', x);
    art.style.setProperty('--my', y);
    shape.style.marginRight = `${x * 10}px`;
    shape.style.marginTop = `${y * 8}px`;
    if (orbitA) orbitA.style.marginRight = `${x * 5}px`;
    if (orbitB) orbitB.style.marginTop = `${y * 4}px`;
  });
})();


/* Hero LUM Teste 02: profundidade reativa */
(() => {
  const hero = document.querySelector('.lum-centered-hero');
  if (!hero || window.matchMedia('(max-width: 900px)').matches) return;

  const art = hero.querySelector('.lum-hero-art');
  const shape = hero.querySelector('.lum-metal-shape');
  const back = hero.querySelector('.lum-depth-shell-back');
  const front = hero.querySelector('.lum-depth-shell-front');
  const glowP = hero.querySelector('.lum-glow-purple');
  let tx = 0, ty = 0, cx = 0, cy = 0;

  hero.addEventListener('pointermove', (e) => {
    const r = hero.getBoundingClientRect();
    tx = ((e.clientX - r.left) / r.width - .5);
    ty = ((e.clientY - r.top) / r.height - .5);
  });
  hero.addEventListener('pointerleave', () => { tx = 0; ty = 0; });

  function tick(){
    cx += (tx - cx) * .055;
    cy += (ty - cy) * .055;

    if (art) art.style.transform = `rotateX(${(-cy*1.4).toFixed(2)}deg) rotateY(${(cx*1.8).toFixed(2)}deg)`;
    if (shape) {
      shape.style.marginRight = `${cx*28}px`;
      shape.style.marginTop = `${cy*20}px`;
    }
    if (back) {
      back.style.marginRight = `${cx*16}px`;
      back.style.marginTop = `${cy*12}px`;
    }
    if (front) {
      front.style.marginRight = `${cx*-24}px`;
      front.style.marginTop = `${cy*-16}px`;
    }
    if (glowP) {
      glowP.style.marginRight = `${cx*18}px`;
      glowP.style.marginTop = `${cy*12}px`;
    }
    requestAnimationFrame(tick);
  }
  tick();
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


/* ==========================================================
   MOBILE STORY CONTROLLER
   Camada independente da animação desktop.
   ========================================================== */
(function(){
  const mq = window.matchMedia('(max-width:650px)');
  const story = document.querySelector('.scroll-story');
  if (!story) return;

  const clamp01 = n => Math.max(0, Math.min(1, n));
  const lerp = (a,b,t) => a + (b-a)*t;

  const els = {
    start: story.querySelector('.scroll-copy-start'),
    end: story.querySelector('.scroll-copy-end'),
    browser: story.querySelector('.fragment-browser'),
    social: story.querySelector('.fragment-social'),
    ads: story.querySelector('.fragment-ads'),
    code: story.querySelector('.fragment-code'),
    brand: story.querySelector('.fragment-brand'),
    phone: story.querySelector('.phone-assembly'),
    p1: story.querySelector('.page-one'),
    p2: story.querySelector('.page-two'),
    p3: story.querySelector('.page-three'),
    bar: story.querySelector('.scroll-progress span')
  };

  const set = (el, prop, value) => {
    if (!el) return;
    el.style.setProperty(prop, value, 'important');
  };

  function clearMobileInline(){
    Object.values(els).forEach(el => {
      if (!el) return;
      ['opacity','transform','display','visibility','height'].forEach(p => {
        el.style.removeProperty(p);
      });
    });
  }

  function renderMobileStory(){
    if (!mq.matches) {
      clearMobileInline();
      return;
    }

    const vh = window.visualViewport ? window.visualViewport.height : window.innerHeight;
    const rect = story.getBoundingClientRect();
    const total = Math.max(1, story.offsetHeight - vh);
    const p = clamp01(-rect.top / total);

    // ---------- 1. texto inicial ----------
    // Fica visível no começo e só termina de sair quando os fragmentos já entraram.
    const startOut = clamp01((p - 0.08) / 0.13);
    set(els.start,'display','block');
    set(els.start,'visibility','visible');
    set(els.start,'opacity',String(1-startOut));
    set(els.start,'transform',`translate(-50%,-50%) translateY(${-24*startOut}px)`);

    // ---------- 2. fragmentos ----------
    // Entram antes do texto terminar de sair e permanecem até o celular estar visível.
    const fragIn = clamp01((p - 0.10) / 0.10);
    const fragOut = clamp01((p - 0.31) / 0.13);
    const fragOpacity = Math.min(fragIn, 1-fragOut);

    const fragData = [
      [els.browser, -7,  18,  .95],
      [els.social,   8, -16,  .95],
      [els.ads,      5,  16,  .95],
      [els.code,    -6, -14,  .95],
      [els.brand,    0,   6,  .95]
    ];

    fragData.forEach(([el,rot,x,scale])=>{
      if(!el) return;
      set(el,'display','block');
      set(el,'visibility','visible');
      set(el,'opacity',String(Math.max(0,fragOpacity)));
      const assemble = clamp01((p - 0.20) / 0.18);
      set(el,'transform',
        `translate(${x*(1-assemble)}px, ${18*(1-assemble)}px) scale(${lerp(scale,.72,assemble)}) rotate(${rot*(1-assemble)}deg)`
      );
    });

    // ---------- 3. celular ----------
    // Começa a aparecer ANTES dos fragmentos sumirem: nunca há tela preta.
    const phoneIn = clamp01((p - 0.24) / 0.10);
    const phoneLift = clamp01((p - 0.78) / 0.12);
    set(els.phone,'display','block');
    set(els.phone,'visibility','visible');
    set(els.phone,'opacity',String(phoneIn));
    set(els.phone,'transform',
      `translate(-50%, calc(-50% - ${phoneLift*55}px)) scale(${lerp(.80,1,phoneIn)})`
    );

    // ---------- 4. telas dentro do celular ----------
    // Tela 1 -> Tela 2 -> Tela 3.
    const t2In = clamp01((p - 0.48) / 0.08);
    const t2Out = clamp01((p - 0.66) / 0.08);
    const t3In = clamp01((p - 0.66) / 0.08);

    set(els.p1,'display','block');
    set(els.p1,'opacity',String(1-t2In));
    set(els.p1,'transform',`translateY(${-24*t2In}px)`);

    set(els.p2,'display','block');
    set(els.p2,'opacity',String(Math.min(t2In,1-t2Out)));
    set(els.p2,'transform',`translateY(${(1-t2In)*34 - t2Out*24}px)`);

    set(els.p3,'display','block');
    set(els.p3,'opacity',String(t3In));
    set(els.p3,'transform',`translateY(${(1-t3In)*34}px)`);

    // ---------- 5. texto final ----------
    const endIn = clamp01((p - 0.80) / 0.12);
    set(els.end,'display','block');
    set(els.end,'visibility','visible');
    set(els.end,'opacity',String(endIn));
    set(els.end,'transform',`translateY(${(1-endIn)*24}px)`);

    // telefone continua visível atrás do fechamento, em vez de desaparecer.
    if (p > 0.80) {
      set(els.phone,'opacity',String(1 - endIn*.28));
    }

    if (els.bar) {
      set(els.bar,'height',`${p*100}%`);
    }
  }

  let raf = 0;
  const requestRender = () => {
    if (raf) return;
    raf = requestAnimationFrame(() => {
      raf = 0;
      renderMobileStory();
    });
  };

  window.addEventListener('scroll', requestRender, {passive:true});
  window.addEventListener('resize', requestRender, {passive:true});
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', requestRender, {passive:true});
  }
  mq.addEventListener?.('change', requestRender);

  window.addEventListener('load', requestRender, {once:true});
  requestRender();
})();
