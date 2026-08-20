/* ============================================================
   JEUSTIN PALMA — main.js
   Vanilla JS · patrón IIFE · sin dependencias externas
   Cada init va envuelto en safe(): un fallo no tumba el resto.
   ============================================================ */
(function () {
  'use strict';

  /* ---- Lo que vas a querer cambiar está acá ---- */
  var CONFIG = {
    // Número de WhatsApp con código de país, solo dígitos (506 = Costa Rica)
    whatsapp: '50661461066',
    // Mensaje con el que se abre el chat desde los botones "Reservar"
    mensajeInicial: 'Hola Jeustin, quiero reservar una cita.',

    // Marquesina de fotos: se mueve sola, sin necesidad de hacer scroll.
    mqVelocidad: 38,   // píxeles por segundo
    mqEmpuje: 0.9      // cuánto la empuja el scroll (0 = solo se mueve sola)
  };

  /* ============================================================ */

  var doc = document;
  var $ = function (s, c) { return (c || doc).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || doc).querySelectorAll(s)); };

  var WA = 'https://wa.me/' + CONFIG.whatsapp;

  function safe(fn, name) {
    try { fn(); } catch (e) { if (window.console) console.warn('[JP] fallo en ' + name, e); }
  }

  /* ---------- 1. Carga ---------- */
  function initSplash() {
    var splash = $('#splash');
    if (!splash) return;

    // Con ?carga=1 al final de la URL se fuerza la animación de entrada,
    // para poder revisarla sin tener que borrar la sesión.
    var forzar = /[?&]carga=/.test(location.search);
    var yaVisto = false;
    if (!forzar) { try { yaVisto = sessionStorage.getItem('jp_splash') === '1'; } catch (e) {} }
    if (yaVisto) {
      splash.dataset.gone = '1';
      splash.style.display = 'none';
      return;
    }
    try { sessionStorage.setItem('jp_splash', '1'); } catch (e) {}

    // Contador 0 → 100 acompañando a la barra de carga
    var pct = $('#splashPct');
    if (pct) {
      var t0 = null, dur = 2200;
      var step = function (t) {
        if (!t0) t0 = t;
        var p = Math.min(1, (t - t0) / dur);
        pct.textContent = Math.round(100 * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
      // si rAF está pausado (pestaña en segundo plano), igual llega a 100
      setTimeout(function () { pct.textContent = '100'; }, dur + 300);
    }

    var hide = function () {
      if (splash.dataset.gone) return;
      splash.dataset.gone = '1';
      if (pct) pct.textContent = '100';
      splash.classList.add('is-done');
      splash.style.pointerEvents = 'none';
      // garantía final: pase lo que pase con la transición, el splash desaparece
      setTimeout(function () { splash.style.display = 'none'; }, 1300);
    };
    window.addEventListener('load', function () { setTimeout(hide, 1500); });
    setTimeout(hide, 3400);
    splash.addEventListener('click', hide);
  }

  /* ---------- 2. Navegación ---------- */
  function initNav() {
    var bar = $('#topbar');
    var burger = $('#burger');
    var menu = $('#menu');

    if (bar) {
      var onScroll = function () { bar.classList.toggle('is-stuck', window.scrollY > 40); };
      onScroll();
      window.addEventListener('scroll', onScroll, { passive: true });
    }

    if (!burger || !menu) return;
    var toggle = function (open) {
      burger.classList.toggle('is-open', open);
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      burger.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
      menu.classList.toggle('is-open', open);
      menu.setAttribute('aria-hidden', open ? 'false' : 'true');
      doc.body.classList.toggle('is-locked', open);
    };
    burger.addEventListener('click', function () {
      toggle(!menu.classList.contains('is-open'));
    });
    $$('a', menu).forEach(function (a) {
      a.addEventListener('click', function () { toggle(false); });
    });
    doc.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.classList.contains('is-open')) toggle(false);
    });
  }

  /* ---------- 3. Barra de progreso ---------- */
  function initProgress() {
    var bar = $('#scrollbar');
    if (!bar) return;
    var tick = function () {
      var h = doc.documentElement.scrollHeight - window.innerHeight;
      var p = h > 0 ? window.scrollY / h : 0;
      bar.style.transform = 'scaleX(' + Math.min(1, Math.max(0, p)) + ')';
    };
    tick();
    window.addEventListener('scroll', tick, { passive: true });
    window.addEventListener('resize', tick);
  }

  /* ---------- 4. Split de titulares (palabra a palabra) ---------- */
  function initSplit() {
    $$('[data-split]').forEach(function (el) {
      if (el.dataset.splitDone) return;
      var text = el.textContent.trim();
      if (!text) return;
      var words = text.split(/\s+/);
      var html = '';
      for (var i = 0; i < words.length; i++) {
        var d = (i * 0.055).toFixed(3);
        html += '<span class="word"><span style="transition-delay:' + d + 's">' +
          words[i].replace(/&/g, '&amp;').replace(/</g, '&lt;') + '</span></span>';
        if (i < words.length - 1) html += ' ';
      }
      el.innerHTML = html;
      el.dataset.splitDone = '1';
    });
  }

  /* ---------- 5. Reveal al hacer scroll ---------- */
  function initReveal() {
    var items = $$('.reveal');
    if (!items.length) return;

    var show = function (el) { el.classList.add('is-in'); };

    if (!('IntersectionObserver' in window)) { items.forEach(show); return; }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { show(en.target); io.unobserve(en.target); }
      });
    }, { threshold: 0.05, rootMargin: '0px 0px -8% 0px' });

    items.forEach(function (el, i) {
      el.style.transitionDelay = ((i % 6) * 0.05).toFixed(2) + 's';
      io.observe(el);
    });

    // red de seguridad: a los 6 s nada puede quedar invisible
    setTimeout(function () { items.forEach(show); }, 6000);
  }

  /* ---------- 6. Contadores ---------- */
  // Un <b data-count="100">0</b> sube de 0 a 100 al entrar en pantalla.
  // Los valores entre corchetes ([00]+) no llevan data-count: se muestran tal cual.
  function initCounters() {
    var nums = $$('[data-count]');
    if (!nums.length) return;

    var run = function (el) {
      if (el.dataset.done) return;
      el.dataset.done = '1';
      var target = parseInt(el.getAttribute('data-count'), 10) || 0;
      if (el.hasAttribute('data-plain')) { el.textContent = target; return; }
      var t0 = null, dur = 1400;
      var step = function (t) {
        if (!t0) t0 = t;
        var p = Math.min(1, (t - t0) / dur);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased);
        if (p < 1) requestAnimationFrame(step);
        else el.textContent = target;
      };
      requestAnimationFrame(step);
      // si rAF está pausado (pestaña en segundo plano), el número final igual aparece
      setTimeout(function () {
        if (parseInt(el.textContent, 10) !== target) el.textContent = target;
      }, dur + 900);
    };

    if (!('IntersectionObserver' in window)) { nums.forEach(run); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { run(en.target); io.unobserve(en.target); } });
    }, { threshold: 0.05 });
    nums.forEach(function (n) { io.observe(n); });
    setTimeout(function () { nums.forEach(run); }, 6000);
  }

  /* ---------- 7. Parallax ---------- */
  // Se usa la propiedad CSS `translate` (no `transform`) para no pisar las
  // animaciones de entrada que ya usan transform sobre los mismos elementos.
  function initParallax() {
    var layers = $$('[data-parallax]');
    if (!layers.length) return;

    var ticking = false;
    var update = function () {
      ticking = false;
      var vh = window.innerHeight;

      for (var i = 0; i < layers.length; i++) {
        var el = layers[i];
        var box = el.getBoundingClientRect();
        if (box.bottom < -200 || box.top > vh + 200) continue;      // fuera de pantalla: no se calcula
        var rel = (box.top + box.height / 2 - vh / 2) / vh;         // -0.5 arriba … +0.5 abajo
        var amt = parseFloat(el.getAttribute('data-parallax')) || 0.08;
        el.style.translate = '0 ' + (rel * amt * vh * -1).toFixed(1) + 'px';
      }
    };
    var onScroll = function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
  }

  /* ---------- 7b. Marquesina de fotos ----------
     Se mueve sola con su propio bucle de animación (no depende del scroll),
     y el scroll le suma empuje: hacia abajo acelera, hacia arriba se devuelve.
     El bucle se apaga cuando la marquesina no está en pantalla. */
  function initMarquee() {
    var wrap = $('[data-mq]');
    if (!wrap) return;

    var rows = $$('[data-mq-row]', wrap).map(function (el) {
      // Se triplica el contenido para que el bucle no tenga costuras
      el.innerHTML = el.innerHTML + el.innerHTML + el.innerHTML;
      return {
        el: el,
        dir: parseFloat(el.getAttribute('data-dir')) || 1,
        third: el.scrollWidth / 3,
        offset: 0
      };
    });
    if (!rows.length) return;

    // Con "reducir movimiento" activado NO se congela: se va despacio.
    // Windows lo trae puesto en muchos equipos y dejar la marquesina
    // muerta se ve como un fallo, no como una cortesía.
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion:reduce)').matches;
    var vel = reduce ? CONFIG.mqVelocidad * 0.25 : CONFIG.mqVelocidad;
    var push = reduce ? 0 : CONFIG.mqEmpuje;

    var lastY = window.scrollY;
    var lastT = 0;
    var raf = 0;

    var measure = function () {
      rows.forEach(function (r) { r.third = r.el.scrollWidth / 3; });
      paint();
    };

    var paint = function () {
      rows.forEach(function (r) {
        if (!r.third) r.third = r.el.scrollWidth / 3;
        var o = ((r.offset % r.third) + r.third) % r.third;   // siempre dentro de [0, third)
        r.el.style.transform = 'translate3d(' + (o - r.third).toFixed(1) + 'px,0,0)';
      });
    };

    var tick = function (t) {
      // dt limitado: al volver de otra pestaña no pega un tirón
      var dt = lastT ? Math.min((t - lastT) / 1000, 0.05) : 0;
      lastT = t;

      var y = window.scrollY;
      // Tope al salto: si se navega a una sección de golpe, la marquesina
      // acompaña con un empujón, no con un teletransporte.
      var dy = Math.max(-60, Math.min(60, y - lastY));
      lastY = y;

      rows.forEach(function (r) {
        r.offset += r.dir * (dt * vel + dy * push);
      });
      paint();
      raf = requestAnimationFrame(tick);
    };

    var start = function () { if (!raf) { lastT = 0; lastY = window.scrollY; raf = requestAnimationFrame(tick); } };
    var stop = function () { if (raf) { cancelAnimationFrame(raf); raf = 0; } };

    paint();
    window.addEventListener('resize', measure);

    if (!('IntersectionObserver' in window)) { start(); return; }
    new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) start(); else stop();
    }, { rootMargin: '200px' }).observe(wrap);
  }

  /* ---------- 7d. Carrusel de trabajos ----------
     Se arrastra con el ratón. Si hubo arrastre, el clic no abre el
     lightbox: si no, cada intento de mover abriría una foto. */
  function initCarousel() {
    var box = $('[data-carousel]');
    var track = $('[data-carousel-track]');
    var bar = $('[data-carousel-bar]');
    if (!box || !track) return;

    var down = false, startX = 0, startScroll = 0, moved = 0;

    var progress = function () {
      if (!bar) return;
      var max = box.scrollWidth - box.clientWidth;
      var p = max > 0 ? box.scrollLeft / max : 0;
      // la barra mide 22% del ancho; se desplaza por el 78% restante
      bar.style.transform = 'translateX(' + (p * ((100 / 22) * 100 - 100)).toFixed(2) + '%)';
    };
    progress();
    box.addEventListener('scroll', progress, { passive: true });
    window.addEventListener('resize', progress);

    box.addEventListener('pointerdown', function (e) {
      if (e.pointerType === 'touch') return;      // el táctil ya desliza solo
      down = true; moved = 0;
      startX = e.clientX; startScroll = box.scrollLeft;
      box.classList.add('is-dragging');
    });
    box.addEventListener('pointermove', function (e) {
      if (!down) return;
      var d = e.clientX - startX;
      moved = Math.max(moved, Math.abs(d));
      box.scrollLeft = startScroll - d;
    });
    var end = function () {
      if (!down) return;
      down = false;
      box.classList.remove('is-dragging');
    };
    box.addEventListener('pointerup', end);
    box.addEventListener('pointercancel', end);
    box.addEventListener('pointerleave', end);

    // Si el puntero se movió más de 6 px, fue un arrastre y no un clic
    box.addEventListener('click', function (e) {
      if (moved > 6) { e.preventDefault(); e.stopPropagation(); }
      moved = 0;
    }, true);

    // Flechas: avanzan una foto por clic y se apagan en los extremos
    var prev = $('[data-carousel-prev]');
    var next = $('[data-carousel-next]');
    var card = $('.shot', track);
    if (!prev || !next || !card) return;

    var paso = function () {
      var gap = parseFloat(getComputedStyle(track).gap) || 0;
      return card.getBoundingClientRect().width + gap;
    };
    var limites = function () {
      var max = box.scrollWidth - box.clientWidth;
      prev.disabled = box.scrollLeft <= 2;
      next.disabled = box.scrollLeft >= max - 2;
    };
    prev.addEventListener('click', function () { box.scrollBy({ left: -paso(), behavior: 'smooth' }); });
    next.addEventListener('click', function () { box.scrollBy({ left: paso(), behavior: 'smooth' }); });
    box.addEventListener('scroll', limites, { passive: true });
    window.addEventListener('resize', limites);
    limites();
  }

  /* ---------- 7f. Videos: reproducir en su sitio ---------- */
  function initReels() {
    $$('[data-reel]').forEach(function (reel) {
      var v = $('video', reel);
      var btn = $('.reel__play', reel);
      if (!v || !btn) return;
      btn.addEventListener('click', function () {
        // Se pausan los demás para que no suenen dos a la vez
        $$('[data-reel]').forEach(function (o) {
          if (o === reel) return;
          var ov = $('video', o);
          if (ov) { ov.pause(); o.classList.remove('is-playing'); }
        });
        reel.classList.add('is-playing');
        var p = v.play();
        if (p && p.catch) p.catch(function () { reel.classList.remove('is-playing'); });
      });
      v.addEventListener('click', function () {
        if (v.paused) { v.play(); reel.classList.add('is-playing'); }
        else { v.pause(); reel.classList.remove('is-playing'); }
      });
    });
  }

  /* ---------- 8. Cursor personalizado ---------- */
  function initCursor() {
    var cur = $('#cursor');
    if (!cur) return;
    if (!window.matchMedia || !window.matchMedia('(hover:hover) and (pointer:fine)').matches) return;

    var x = window.innerWidth / 2, y = window.innerHeight / 2;
    var cx = x, cy = y, raf = null;

    var loop = function () {
      cx += (x - cx) * 0.22;
      cy += (y - cy) * 0.22;
      cur.style.transform = 'translate3d(' + cx.toFixed(1) + 'px,' + cy.toFixed(1) + 'px,0)';
      raf = requestAnimationFrame(loop);
    };

    doc.addEventListener('mousemove', function (e) {
      x = e.clientX; y = e.clientY;
      if (!cur.classList.contains('is-on')) cur.classList.add('is-on');
      if (!raf) loop();
    });
    doc.addEventListener('mouseleave', function () { cur.classList.remove('is-on'); });

    var hoverables = 'a,button,[data-magnetic]';
    doc.addEventListener('mouseover', function (e) {
      if (!e.target.closest) return;
      // Sobre una foto de la galería el cursor se abre y muestra "Ver"
      if (e.target.closest('.shot')) cur.classList.add('is-view');
      else if (e.target.closest(hoverables)) cur.classList.add('is-hover');
    });
    doc.addEventListener('mouseout', function (e) {
      if (!e.target.closest) return;
      if (e.target.closest('.shot')) cur.classList.remove('is-view');
      else if (e.target.closest(hoverables)) cur.classList.remove('is-hover');
    });
  }

  /* ---------- 9. Botones magnéticos ---------- */
  function initMagnetic() {
    if (!window.matchMedia || !window.matchMedia('(hover:hover) and (pointer:fine)').matches) return;
    $$('[data-magnetic]').forEach(function (el) {
      el.addEventListener('mousemove', function (e) {
        var b = el.getBoundingClientRect();
        var dx = (e.clientX - (b.left + b.width / 2)) * 0.18;
        var dy = (e.clientY - (b.top + b.height / 2)) * 0.28;
        el.style.transform = 'translate(' + dx.toFixed(1) + 'px,' + dy.toFixed(1) + 'px)';
      });
      el.addEventListener('mouseleave', function () { el.style.transform = ''; });
    });
  }

  /* ---------- 10. Lightbox de galería ---------- */
  function initLightbox() {
    var lb = $('#lb'), img = $('#lbImg'), cap = $('#lbCap');
    var shots = $$('.shot');
    if (!lb || !img || !shots.length) return;

    var idx = 0, lastFocus = null;

    // Cambiar el src de golpe teletransporta la foto. Se apaga, se espera a
    // que la nueva esté lista y se enciende: un fundido de 180 ms.
    var render = function (conFundido) {
      var s = shots[idx];
      var inner = $('img', s);
      var src = s.getAttribute('data-full') || (inner ? inner.src : '');
      var alt = inner ? inner.alt : '';
      var pie = s.getAttribute('data-cap') || '';

      var pintar = function () {
        img.src = src; img.alt = alt; cap.textContent = pie;
        img.classList.remove('is-swapping');
      };

      if (!conFundido || img.getAttribute('src') === src) { pintar(); return; }

      img.classList.add('is-swapping');
      var previa = new Image();
      var listo = false;
      var seguir = function () {
        if (listo) return;
        listo = true;
        setTimeout(pintar, 180);   // se deja terminar el apagado
      };
      previa.onload = previa.onerror = seguir;
      previa.src = src;
      setTimeout(seguir, 400);     // red de seguridad si nunca carga
    };
    var open = function (i) {
      idx = i; lastFocus = doc.activeElement;
      render();
      lb.classList.add('is-open');
      lb.setAttribute('aria-hidden', 'false');
      doc.body.classList.add('is-locked');
      $('#lbClose').focus();
    };
    var close = function () {
      lb.classList.remove('is-open');
      lb.setAttribute('aria-hidden', 'true');
      doc.body.classList.remove('is-locked');
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    };
    var move = function (d) { idx = (idx + d + shots.length) % shots.length; render(true); };

    shots.forEach(function (s, i) { s.addEventListener('click', function () { open(i); }); });
    $('#lbClose').addEventListener('click', close);
    $('#lbPrev').addEventListener('click', function () { move(-1); });
    $('#lbNext').addEventListener('click', function () { move(1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
    doc.addEventListener('keydown', function (e) {
      if (!lb.classList.contains('is-open')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') move(-1);
      if (e.key === 'ArrowRight') move(1);
    });
  }

  /* ---------- 11. Enlace activo en el nav ---------- */
  function initActiveLink() {
    var links = $$('.rail__nav a');
    if (!links.length || !('IntersectionObserver' in window)) return;
    var map = {};
    links.forEach(function (a) {
      var id = a.getAttribute('href');
      if (id && id.charAt(0) === '#') map[id.slice(1)] = a;
    });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var a = map[en.target.id];
        if (!a) return;
        if (en.isIntersecting) {
          links.forEach(function (l) { l.classList.remove('is-active'); });
          a.classList.add('is-active');
        }
      });
    }, { threshold: 0.05, rootMargin: '-35% 0px -55% 0px' });
    Object.keys(map).forEach(function (id) {
      var sec = doc.getElementById(id);
      if (sec) io.observe(sec);
    });
  }

  /* ---------- 12. Enlaces de WhatsApp ---------- */
  // Todo elemento con data-wa apunta al chat con el mensaje inicial ya escrito.
  function initWhatsApp() {
    $$('[data-wa]').forEach(function (a) {
      a.href = WA + '?text=' + encodeURIComponent(CONFIG.mensajeInicial);
      a.target = '_blank';
      a.rel = 'noopener';
    });
  }

  /* ---------- 13. Formulario → mensaje de WhatsApp ---------- */
  function initForm() {
    var form = $('[data-form]');
    var msg = $('[data-form-msg]');
    if (!form) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var d = new FormData(form);
      var nombre = (d.get('nombre') || '').toString().trim();
      var idea = (d.get('idea') || '').toString().trim();

      if (!nombre || !idea) {
        if (msg) {
          msg.textContent = 'Me falta tu nombre y la idea del tatuaje para poder responderte bien.';
          msg.classList.add('is-on');
        }
        return;
      }
      if (msg) { msg.textContent = ''; msg.classList.remove('is-on'); }

      var texto =
        'Hola Jeustin, soy ' + nombre + '.' +
        '\nEstilo: ' + d.get('estilo') +
        '\nZona y tamaño: ' + ((d.get('zona') || '').toString().trim() || 'por definir') +
        '\nIdea: ' + idea;

      window.open(WA + '?text=' + encodeURIComponent(texto), '_blank', 'noopener');
    });
  }

  /* ---------- 14. Detalles ---------- */
  function initMisc() {
    var y = $('#year');
    if (y) y.textContent = new Date().getFullYear();
  }

  /* ---------- Arranque ---------- */
  function boot() {
    safe(initSplash, 'splash');
    safe(initNav, 'nav');
    safe(initProgress, 'progress');
    safe(initSplit, 'split');
    safe(initReveal, 'reveal');
    safe(initCounters, 'counters');
    safe(initParallax, 'parallax');
    safe(initMarquee, 'marquee');
    safe(initCarousel, 'carousel');
    safe(initReels, 'reels');
    safe(initCursor, 'cursor');
    safe(initMagnetic, 'magnetic');
    safe(initLightbox, 'lightbox');
    safe(initActiveLink, 'activeLink');
    safe(initWhatsApp, 'whatsapp');
    safe(initForm, 'form');
    safe(initMisc, 'misc');
  }

  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
