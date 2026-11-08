(function () {
  'use strict';

  var API = 'https://api.github.com/repos/angelisaidchl-lgtm/pixeldev-mx/contents/';
  var K_TERMS = 'pixeldev_terminos_v1';
  var K_RETOS = 'pixeldev_retos_v1';
  // Archivos del propio sitio: no se muestran como "recursos"
  var OCULTOS = ['index.html', 'style.css', 'script.js', 'tutoriales.json', 'leeme.txt', '.nojekyll', '.gitignore', 'license', 'readme.md'];

  var RETOS = [
    { id: 'r1', t: 'Mi primer mundo', d: 'Crea un escenario simple con suelo, una casa y un punto de aparición.' },
    { id: 'r2', t: 'Pieza que cambia de color', d: 'Usa ejemplo.lua para que una pieza cambie de color al tocarla.' },
    { id: 'r3', t: 'Un cartel con mensaje', d: 'Agrega un cartel con texto de bienvenida a tu mundo.' },
    { id: 'r4', t: 'Comparte tu avance', d: 'Prueba tu juego en Android y anota una mejora que quieras hacer.' }
  ];

  var LOGROS = [
    { n: 1, t: 'Primer paso', d: 'Completa tu primer reto' },
    { n: 2, t: 'A medio camino', d: 'Completa 2 retos' },
    { n: 4, t: 'Creador completo', d: 'Completa los 4 retos' }
  ];
  function $(s) { return document.querySelector(s); }
  function store(op, k, v) {
    try { return op === 'get' ? localStorage.getItem(k) : localStorage.setItem(k, v); } catch (e) { return null; }
  }
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function str(v, max) {
    return typeof v === 'string' && v.trim() ? v.trim().slice(0, max || 300) : '';
  }
  function safeUrl(u) {
    try {
      var p = new URL(u, location.href);
      return (p.protocol === 'https:' || p.protocol === 'http:') ? p.href : '';
    } catch (e) { return ''; }
  }
  function ext(href, text, cls) {
    var a = el('a', cls, text);
    a.href = href;
    if (new URL(href, location.href).origin !== location.origin) {
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
    }
    return a;
  }
  function estado(node, msg, error) {
    node.hidden = !msg;
    node.textContent = msg || '';
    node.className = 'estado' + (error ? ' error' : '');
  }
  function tam(b) {
    if (typeof b !== 'number' || b < 0) return '';
    return b < 1024 ? b + ' B' : b < 1048576 ? (b / 1024).toFixed(1) + ' KB' : (b / 1048576).toFixed(1) + ' MB';
  }

  /* ---------- Menú móvil ---------- */
  var btn = $('#menu-btn'), nav = $('#nav');
  function menu(open) {
    nav.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', String(open));
    btn.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
  }
  btn.addEventListener('click', function () { menu(!nav.classList.contains('open')); });
  nav.addEventListener('click', function (e) { if (e.target.tagName === 'A') menu(false); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && nav.classList.contains('open')) { menu(false); btn.focus(); }
  });

  /* ---------- Cuadrícula decorativa de la portada ---------- */
  var grid = $('#pixgrid');
  for (var i = 0; grid && i < 64; i++) {
    var c = document.createElement('i');
    if (Math.random() < 0.3) c.className = 'on';
    c.style.setProperty('--d', (Math.random() * 3.6).toFixed(2) + 's');
    grid.appendChild(c);
  }

  /* ---------- Términos ---------- */
  var dlg = $('#terminos'), cerrarT = $('#cerrar-t');
  function aceptado() { return store('get', K_TERMS) === 'si'; }
  function abrirT() {
    cerrarT.hidden = !aceptado();
    if (dlg.open) return;
    if (typeof dlg.showModal === 'function') dlg.showModal(); else dlg.setAttribute('open', '');
  }
  function cerrarDlg() {
    if (typeof dlg.close === 'function') dlg.close(); else dlg.removeAttribute('open');
  }
  dlg.addEventListener('cancel', function (e) { if (!aceptado()) e.preventDefault(); });
  $('#aceptar').addEventListener('click', function () { store('set', K_TERMS, 'si'); cerrarDlg(); });
  cerrarT.addEventListener('click', cerrarDlg);
  $('#ver-terminos').addEventListener('click', abrirT);
  if (!aceptado()) abrirT();

  /* ---------- Recursos (API de GitHub) ---------- */
  var recEstado = $('#rec-estado'), recLista = $('#rec-lista'), buscar = $('#buscar');
  var recursos = [], filtro = 'Todos';
  function categoria(n, t) {
    if (t === 'dir') return 'Carpeta';
    var e = (n.split('.').pop() || '').toLowerCase();
    if (e === 'lua' || e === 'luau') return 'Script';
    if (['rbxm', 'rbxl', 'fbx', 'obj', 'glb', 'gltf'].indexOf(e) !== -1) return 'Modelo';
    if (['png', 'jpg', 'jpeg', 'webp', 'svg', 'gif'].indexOf(e) !== -1) return 'Imagen';
    if (['md', 'txt', 'pdf'].indexOf(e) !== -1) return 'Documento';
    return 'Archivo';
  }
  function chips() {
    var cats = ['Todos'], box = $('#rec-chips');
    recursos.forEach(function (r) { if (cats.indexOf(r.cat) === -1) cats.push(r.cat); });
    box.textContent = '';
    if (cats.length < 3) return;
    cats.forEach(function (c) {
      var b = el('button', 'chip' + (c === filtro ? ' on' : ''), c);
      b.type = 'button';
      b.setAttribute('aria-pressed', String(c === filtro));
      b.addEventListener('click', function () { filtro = c; chips(); pintarRecursos(); });
      box.appendChild(b);
    });
  }

  function validarRecursos(data) {
    if (!Array.isArray(data)) return [];
    return data.map(function (x) {
      if (!x || typeof x !== 'object') return null;
      var name = str(x.name, 120), tipo = x.type === 'dir' ? 'dir' : x.type === 'file' ? 'file' : '';
      var open = safeUrl(x.html_url);
      if (!name || !tipo || !open) return null;
      if (name.charAt(0) === '.' || OCULTOS.indexOf(name.toLowerCase()) !== -1) return null;
      return { name: name, tipo: tipo, open: open, dl: tipo === 'file' ? safeUrl(x.download_url) : '', size: tipo === 'file' ? x.size : null, cat: categoria(name, tipo) };
    }).filter(Boolean);
  }
  function pintarRecursos() {
    var q = buscar.value.trim().toLowerCase();
    var lista = recursos.filter(function (r) { return r.name.toLowerCase().indexOf(q) !== -1 && (filtro === 'Todos' || r.cat === filtro); });
    recLista.textContent = '';
    if (!recursos.length) { estado(recEstado, 'Aún no hay recursos publicados en el repositorio.'); return; }
    if (!lista.length) { estado(recEstado, 'No hay resultados para “' + buscar.value.trim() + '”.'); return; }
    estado(recEstado, '');
    lista.forEach(function (r) {
      var card = el('article', 'card');
      card.appendChild(el('span', 'badge', r.tipo === 'dir' ? 'Carpeta' : r.cat + (tam(r.size) ? ' · ' + tam(r.size) : '')));
      card.appendChild(el('h3', null, r.name));
      var row = el('div', 'row');
      row.appendChild(ext(r.open, r.tipo === 'dir' ? 'Abrir carpeta' : 'Abrir', 'btn small'));
      if (r.dl) row.appendChild(ext(r.dl, 'Descargar', 'btn small primary'));
      card.appendChild(row);
      recLista.appendChild(card);
    });
  }
  buscar.addEventListener('input', pintarRecursos);

  function cargarRecursos() {
    return fetch(API, { headers: { Accept: 'application/vnd.github+json' } })
      .then(function (r) {
        if (r.status === 403 || r.status === 429) throw new Error('GitHub limitó temporalmente las consultas. Espera unos minutos e inténtalo de nuevo.');
        if (r.status === 404) throw new Error('No se encontró el repositorio. Revisa que sea público y que el nombre sea correcto.');
        if (!r.ok) throw new Error('GitHub respondió con un error (' + r.status + ').');
        return r.json();
      })
      .then(function (data) {
        recursos = validarRecursos(data);
        buscar.disabled = false;
        chips();
        pintarRecursos();
      })
      .catch(function (err) {
        recursos = [];
        var msg = err && err.message && err.message.indexOf('Failed') === -1 ? err.message : 'No se pudieron cargar los recursos. Revisa tu conexión e inténtalo de nuevo.';
        estado(recEstado, msg, true);
        var b = el('button', 'btn small', 'Reintentar');
        b.type = 'button';
        b.addEventListener('click', function () {
          estado(recEstado, 'Cargando recursos…');
          recLista.textContent = '';
          cargarRecursos().then(novedades);
        });
        recLista.textContent = '';
        recLista.appendChild(b);
      });
  }

  /* ---------- Tutoriales (tutoriales.json) ---------- */
  var tutEstado = $('#tut-estado'), tutLista = $('#tut-lista');
  var tutoriales = [];

  function validarTutoriales(data) {
    var arr = Array.isArray(data) ? data : (data && Array.isArray(data.tutoriales) ? data.tutoriales : []);
    return arr.map(function (x) {
      if (!x || typeof x !== 'object') return null;
      var t = str(x.titulo, 120), d = str(x.descripcion, 400), u = safeUrl(x.url);
      var et = Array.isArray(x.etiquetas) ? x.etiquetas.map(function (s) { return str(s, 24); }).filter(Boolean).slice(0, 4) : [];
      return t && d && u ? { titulo: t, descripcion: d, url: u, destacado: x.destacado === true, etiquetas: et } : null;
    }).filter(Boolean);
  }
  function tarjetaTutorial(t) {
    var card = el('article', 'card');
    if (t.destacado) card.appendChild(el('span', 'badge hot', '★ Destacado'));
    card.appendChild(el('h3', null, t.titulo));
    card.appendChild(el('p', null, t.descripcion));
    if (t.etiquetas.length) {
      var tg = el('div', 'tags');
      t.etiquetas.forEach(function (s) { tg.appendChild(el('span', 'badge', s)); });
      card.appendChild(tg);
    }
    var row = el('div', 'row');
    row.appendChild(ext(t.url, 'Ver tutorial', 'btn small primary'));
    card.appendChild(row);
    return card;
  }
  function cargarTutoriales() {
    return fetch('tutoriales.json', { cache: 'no-cache' })
      .then(function (r) {
        if (!r.ok) throw new Error('falta');
        return r.json();
      })
      .then(function (data) {
        tutoriales = validarTutoriales(data);
        if (!tutoriales.length) {
          estado(tutEstado, 'El archivo tutoriales.json no contiene tutoriales válidos. Cada uno necesita titulo, descripcion y url.');
          return;
        }
        estado(tutEstado, '');
        tutoriales.slice().sort(function (a, b) { return (b.destacado ? 1 : 0) - (a.destacado ? 1 : 0); })
          .forEach(function (t) { tutLista.appendChild(tarjetaTutorial(t)); });
      })
      .catch(function (err) {
        tutoriales = [];
        estado(tutEstado, err && err.message === 'falta'
          ? 'No se encontró tutoriales.json. Súbelo a la raíz del repositorio para mostrar tutoriales.'
          : 'No se pudo leer tutoriales.json. Revisa que el formato JSON sea correcto.', true);
      });
  }

  /* ---------- Novedades (solo con datos reales) ---------- */
  var novEstado = $('#nov-estado'), novLista = $('#nov-lista');
  function novedades() {
    novLista.textContent = '';
    if (!tutoriales.length) {
      estado(novEstado, 'Aún no hay novedades. Cuando se agreguen tutoriales nuevos, aparecerán aquí.');
      return;
    }
    estado(novEstado, '');
    var h = el('p', 'sub', 'Últimos tutoriales agregados al archivo de tutoriales:');
    novLista.appendChild(h);
    h.style.gridColumn = '1 / -1';
    h.style.margin = '0';
    tutoriales.slice(-3).reverse().forEach(function (t) { novLista.appendChild(tarjetaTutorial(t)); });
  }

  /* ---------- Retos ---------- */
  var retoLista = $('#reto-lista');
  var hechos = {};
  try { hechos = JSON.parse(store('get', K_RETOS)) || {}; } catch (e) { hechos = {}; }
  if (typeof hechos !== 'object' || Array.isArray(hechos)) hechos = {};

  function progreso() {
    var n = RETOS.filter(function (r) { return hechos[r.id] === true; }).length;
    var pct = Math.round(n / RETOS.length * 100);
    $('#reto-texto').textContent = n + ' de ' + RETOS.length + ' completados';
    $('#reto-pct').textContent = pct + '%';
    $('#reto-fill').style.width = pct + '%';
    $('#reto-bar').setAttribute('aria-valuenow', String(pct));
    var lg = $('#logros');
    lg.textContent = '';
    LOGROS.forEach(function (g) {
      var on = n >= g.n, li = el('li', 'logro' + (on ? ' on' : ''));
      li.appendChild(el('strong', null, (on ? '★ ' : '🔒 ') + g.t));
      li.appendChild(el('div', 'small', on ? 'Logro desbloqueado' : g.d));
      lg.appendChild(li);
    });
  }
  RETOS.forEach(function (r) {
    var li = el('li');
    var lab = el('label', 'reto');
    var cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.checked = hechos[r.id] === true;
    cb.addEventListener('change', function () {
      hechos[r.id] = cb.checked;
      store('set', K_RETOS, JSON.stringify(hechos));
      progreso();
    });
    var box = el('div');
    box.appendChild(el('strong', null, r.t));
    box.appendChild(el('span', null, r.d));
    lab.appendChild(cb);
    lab.appendChild(box);
    li.appendChild(lab);
    retoLista.appendChild(li);
  });
  progreso();

  /* ---------- Escena animada (parallax suave) ---------- */
  var calma = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var scene = $('#scene'), raf = 0;
  if (scene && !calma) {
    scene.addEventListener('pointermove', function (e) {
      if (raf) return;
      raf = requestAnimationFrame(function () {
        raf = 0;
        var b = scene.getBoundingClientRect();
        var cl = function (v) { return Math.max(-1, Math.min(1, v)).toFixed(2); };
        scene.style.setProperty('--mx', cl((e.clientX - b.left) / b.width * 2 - 1));
        scene.style.setProperty('--my', cl((e.clientY - b.top) / b.height * 2 - 1));
      });
    });
    scene.addEventListener('pointerleave', function () { scene.style.setProperty('--mx', 0); scene.style.setProperty('--my', 0); });
  }

  /* ---------- Cubo 3D de demostración ---------- */
  var stage = $('#stage'), cubo = $('#cubo'), rx = -20, ry = 30, ax = null;
  function giro() { cubo.style.transform = 'rotateX(' + rx + 'deg) rotateY(' + ry + 'deg)'; }
  giro();
  stage.addEventListener('pointerdown', function (e) {
    ax = [e.clientX, e.clientY];
    try { stage.setPointerCapture(e.pointerId); } catch (err) { /* sin captura */ }
  });
  stage.addEventListener('pointermove', function (e) {
    if (!ax) return;
    ry += (e.clientX - ax[0]) * 0.6;
    rx -= (e.clientY - ax[1]) * 0.6;
    ax = [e.clientX, e.clientY];
    giro();
  });
  ['pointerup', 'pointercancel'].forEach(function (n) { stage.addEventListener(n, function () { ax = null; }); });
  stage.addEventListener('keydown', function (e) {
    var m = { ArrowLeft: [0, -15], ArrowRight: [0, 15], ArrowUp: [-15, 0], ArrowDown: [15, 0] }[e.key];
    if (!m) return;
    e.preventDefault();
    rx += m[0]; ry += m[1];
    giro();
  });

  /* ---------- Propuesta → borrador de GitHub Issue ---------- */
  var form = $('#form-prop'), plink = $('#prop-link'), pmsg = $('#prop-msg');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var f = form.elements, enlace = f.enlace.value.trim();
    var cuerpo = '**Tipo:** ' + f.tipo.value + '\n**Descripción:** ' + f.descr.value.trim() +
      '\n**Enlace:** ' + (enlace || 'sin enlace') +
      '\n**Es de mi autoría o tengo permiso para compartirlo:** sí\n\n_No incluyas datos personales._';
    plink.href = 'https://github.com/angelisaidchl-lgtm/pixeldev-mx/issues/new?title=' +
      encodeURIComponent('[Propuesta] ' + f.nombre.value.trim()) + '&body=' + encodeURIComponent(cuerpo);
    pmsg.hidden = false;
    plink.hidden = false;
    plink.focus();
  });

  /* ---------- Buscador global ---------- */
  var gd = $('#gbus'), gi = $('#gq'), gr = $('#gres');
  var SECC = [['Recursos', '#recursos'], ['Tutoriales', '#tutoriales'], ['Retos y logros', '#retos'], ['Estación de desarrollo', '#taller'],
    ['Galería 3D', '#galeria'], ['Comunidad', '#comunidad'], ['Preparar una propuesta', '#proponer'], ['Proyectos de la comunidad', '#proyectos'],
    ['Novedades', '#novedades'], ['Redes sociales', '#redes'], ['Acerca de', '#acerca'], ['Apoyo voluntario', '#apoyo'], ['Normas', '#normas']];
  function cerrarBus() { if (typeof gd.close === 'function') gd.close(); else gd.removeAttribute('open'); }
  function buscarGlobal() {
    var q = gi.value.trim().toLowerCase(), items = [];
    gr.textContent = '';
    if (!q) { gr.appendChild(el('li', 'small', 'Escribe para buscar secciones, recursos, tutoriales y retos.')); return; }
    SECC.forEach(function (s) { items.push({ t: s[0], k: 'Sección', h: s[1] }); });
    recursos.forEach(function (r) { items.push({ t: r.name, k: r.cat, h: r.open }); });
    tutoriales.forEach(function (t) { items.push({ t: t.titulo, k: 'Tutorial', h: t.url, x: t.descripcion }); });
    RETOS.forEach(function (r) { items.push({ t: r.t, k: 'Reto', h: '#retos', x: r.d }); });
    var res = items.filter(function (i) { return (i.t + ' ' + (i.x || '')).toLowerCase().indexOf(q) !== -1; }).slice(0, 12);
    if (!res.length) { gr.appendChild(el('li', 'small', 'Sin resultados para “' + gi.value.trim() + '”.')); return; }
    res.forEach(function (i) {
      var li = el('li'), a = ext(i.h, i.t);
      a.appendChild(el('small', null, ' · ' + i.k));
      if (i.h.charAt(0) === '#') a.addEventListener('click', cerrarBus);
      li.appendChild(a);
      gr.appendChild(li);
    });
  }
  $('#abrir-bus').addEventListener('click', function () {
    gi.value = '';
    buscarGlobal();
    if (typeof gd.showModal === 'function') gd.showModal(); else gd.setAttribute('open', '');
    gi.focus();
  });
  $('#cerrar-bus').addEventListener('click', cerrarBus);
  gi.addEventListener('input', buscarGlobal);

  /* ---------- Volver arriba ---------- */
  var arriba = $('#arriba');
  window.addEventListener('scroll', function () { arriba.hidden = window.scrollY < 700; }, { passive: true });
  arriba.addEventListener('click', function () { window.scrollTo({ top: 0 }); });

  /* ---------- Inicio ---------- */
  cargarTutoriales().then(function () {
    return cargarRecursos();
  }).then(novedades);
})();
