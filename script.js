(function () {
  'use strict';
  var REPO_API = 'https://api.github.com/repos/angelisaidchl-lgtm/pixeldev-mx/contents/';
  var REPO = 'https://github.com/angelisaidchl-lgtm/pixeldev-mx';
  var TIKTOK = 'https://www.tiktok.com/@pixeldev_mx';
  var RETOS = [
    { id: 'r1', title: 'Construye una escena', desc: 'Crea un suelo, algunos objetos y un punto de aparición para tu primer mundo.' },
    { id: 'r2', title: 'Dale vida a una pieza', desc: 'Haz que una pieza cambie de color cuando un jugador la toque.' },
    { id: 'r3', title: 'Agrega interacción', desc: 'Crea un botón, una puerta o un objeto con el que se pueda interactuar.' },
    { id: 'r4', title: 'Prueba y mejora', desc: 'Juega tu creación, detecta un detalle y realiza una mejora.' }
  ];
  var LOGROS = [{ n: 1, label: 'Primer bloque' }, { n: 2, label: 'Manos a la obra' }, { n: 4, label: 'Creador en marcha' }];
  var $ = function (s, root) { return (root || document).querySelector(s); };
  var $$ = function (s, root) { return Array.prototype.slice.call((root || document).querySelectorAll(s)); };
  var storage = {
    get: function (key) { try { return localStorage.getItem(key); } catch (_) { return null; } },
    set: function (key, value) { try { localStorage.setItem(key, value); } catch (_) {} }
  };
  function node(tag, className, text) {
    var n = document.createElement(tag);
    if (className) n.className = className;
    if (text !== undefined && text !== null) n.textContent = text;
    return n;
  }
  function safeUrl(value) {
    try { var u = new URL(value, location.href); return (u.protocol === 'https:' || u.protocol === 'http:') ? u.href : ''; }
    catch (_) { return ''; }
  }
  function link(href, text, className) {
    var a = node('a', className, text); a.href = href;
    if (new URL(href, location.href).origin !== location.origin) { a.target = '_blank'; a.rel = 'noopener noreferrer'; }
    return a;
  }
  function setMessage(container, message, error) {
    container.textContent = '';
    var p = node('p', 'resource-message' + (error ? ' is-error' : ''), message);
    container.appendChild(p);
  }
  function formatSize(bytes) {
    if (typeof bytes !== 'number') return '';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  }

  // Menú móvil
  var menuButton = $('#menu-btn'), mainNav = $('#main-nav');
  menuButton.addEventListener('click', function () {
    var open = mainNav.classList.toggle('open');
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.querySelector('.sr-only').textContent = open ? 'Cerrar menú' : 'Abrir menú';
  });
  $$('#main-nav a').forEach(function (a) { a.addEventListener('click', function () { mainNav.classList.remove('open'); menuButton.setAttribute('aria-expanded', 'false'); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { mainNav.classList.remove('open'); menuButton.setAttribute('aria-expanded', 'false'); } });

  // Año
  $('#year').textContent = new Date().getFullYear();

  // Retos y logros: se guardan solo en este navegador
  var done = {};
  try { done = JSON.parse(storage.get('pixeldev_retos_v2') || '{}') || {}; } catch (_) { done = {}; }
  if (!done || typeof done !== 'object' || Array.isArray(done)) done = {};
  var retoList = $('#reto-lista');
  function renderProgress() {
    var count = RETOS.filter(function (r) { return done[r.id] === true; }).length;
    var percent = Math.round(count / RETOS.length * 100);
    $('#reto-pct').textContent = percent + '%';
    $('#reto-texto').textContent = count + ' de ' + RETOS.length + ' retos completados';
    $('#reto-fill').style.width = percent + '%';
    $('#reto-bar').setAttribute('aria-valuenow', String(percent));
    var achievements = $('#logros'); achievements.textContent = '';
    LOGROS.forEach(function (g) {
      var item = node('span', 'achievement' + (count >= g.n ? ' unlocked' : ''), (count >= g.n ? '✓ ' : '○ ') + g.label);
      achievements.appendChild(item);
    });
  }
  RETOS.forEach(function (r, index) {
    var li = node('li', 'challenge-item' + (done[r.id] ? ' done' : ''));
    var check = document.createElement('input'); check.type = 'checkbox'; check.checked = done[r.id] === true;
    check.id = 'reto-' + r.id;
    var label = node('label'); label.htmlFor = check.id;
    var copy = node('div'); copy.appendChild(node('strong', '', (index + 1 < 10 ? '0' : '') + (index + 1) + ' / ' + r.title)); copy.appendChild(node('span', '', r.desc));
    check.addEventListener('change', function () { done[r.id] = check.checked; li.classList.toggle('done', check.checked); storage.set('pixeldev_retos_v2', JSON.stringify(done)); renderProgress(); });
    li.appendChild(check); li.appendChild(label); label.appendChild(copy); retoList.appendChild(li);
  });
  renderProgress();

  // Tutoriales
  var tutorials = [];
  var tutList = $('#tut-lista');
  function tutorialCard(t, index) {
    var article = node('article', 'tutorial-card');
    var top = node('div', 'tutorial-top');
    top.appendChild(node('span', 'tutorial-number', 'GUÍA / ' + String(index + 1).padStart(2, '0')));
    top.appendChild(node('span', 'tutorial-tag', (t.tags[0] || 'ROBLOX').toUpperCase()));
    article.appendChild(top); article.appendChild(node('h3', '', t.title)); article.appendChild(node('p', '', t.description));
    article.appendChild(link(t.url, 'Ver tutorial ↗', 'tutorial-link'));
    return article;
  }
  function loadTutorials() {
    return fetch('tutoriales.json', { cache: 'no-store' }).then(function (response) {
      if (!response.ok) throw new Error('No se pudo leer tutoriales.json');
      return response.json();
    }).then(function (data) {
      var list = Array.isArray(data) ? data : (data && Array.isArray(data.tutoriales) ? data.tutoriales : []);
      tutorials = list.map(function (t) {
        if (!t || typeof t !== 'object') return null;
        var title = typeof t.titulo === 'string' ? t.titulo.trim().slice(0, 120) : '';
        var description = typeof t.descripcion === 'string' ? t.descripcion.trim().slice(0, 400) : '';
        var url = safeUrl(t.url);
        var tags = Array.isArray(t.etiquetas) ? t.etiquetas.filter(function (x) { return typeof x === 'string'; }).slice(0, 3) : [];
        return title && description && url ? { title: title, description: description, url: url, tags: tags } : null;
      }).filter(Boolean);
      tutList.textContent = '';
      if (!tutorials.length) { setMessage(tutList, 'Todavía no hay tutoriales publicados. Pronto añadiremos nuevas guías.'); $('#tut-count').textContent = '0 GUÍAS'; return; }
      tutorials.forEach(function (t, i) { tutList.appendChild(tutorialCard(t, i)); });
      $('#tut-count').textContent = String(tutorials.length).padStart(2, '0') + ' GUÍA' + (tutorials.length === 1 ? '' : 'S');
    }).catch(function () {
      tutorials = []; setMessage(tutList, 'No se pudieron cargar los tutoriales. Revisa que tutoriales.json esté en la raíz del repositorio.', true); $('#tut-count').textContent = 'SIN CONEXIÓN';
    });
  }

  // Recursos públicos del repositorio GitHub
  var resources = [], activeFilter = 'Todos';
  var hiddenFiles = ['index.html', 'style.css', 'script.js', 'tutoriales.json', 'leeme.txt', 'readme.md', 'license', '.nojekyll', '.gitignore'];
  function category(name, type) {
    if (type === 'dir') return 'Carpeta';
    var ext = (name.split('.').pop() || '').toLowerCase();
    if (['lua', 'luau'].indexOf(ext) !== -1) return 'Script';
    if (['rbxm', 'rbxl', 'fbx', 'obj', 'glb', 'gltf'].indexOf(ext) !== -1) return 'Modelo';
    if (['png', 'jpg', 'jpeg', 'webp', 'svg', 'gif'].indexOf(ext) !== -1) return 'Imagen';
    if (['md', 'txt', 'pdf'].indexOf(ext) !== -1) return 'Documento';
    return 'Archivo';
  }
  function fileLabel(item) {
    if (item.type === 'dir') return 'DIR';
    var ext = (item.name.split('.').pop() || 'FILE').toUpperCase();
    return ext.slice(0, 4);
  }
  function drawFilters() {
    var box = $('#rec-chips'); box.textContent = '';
    var cats = ['Todos']; resources.forEach(function (r) { if (cats.indexOf(r.category) === -1) cats.push(r.category); });
    if (cats.length === 1) return;
    cats.forEach(function (c) {
      var b = node('button', 'chip', c); b.type = 'button'; b.setAttribute('aria-pressed', String(c === activeFilter));
      b.addEventListener('click', function () { activeFilter = c; drawFilters(); drawResources(); }); box.appendChild(b);
    });
  }
  function drawResources() {
    var list = $('#rec-lista'), query = $('#buscar').value.trim().toLowerCase(); list.textContent = '';
    var matches = resources.filter(function (r) { return (activeFilter === 'Todos' || r.category === activeFilter) && r.name.toLowerCase().indexOf(query) !== -1; });
    if (!resources.length) { setMessage(list, 'Todavía no hay archivos públicos para descargar. Cuando agregues recursos al repositorio, aparecerán aquí.'); return; }
    if (!matches.length) { setMessage(list, 'No encontramos archivos con esa búsqueda. Prueba con otra palabra.'); return; }
    matches.forEach(function (r) {
      var row = node('article', 'resource-row');
      row.appendChild(node('span', 'file-icon', fileLabel(r)));
      var info = node('div', 'resource-info'); info.appendChild(node('div', 'resource-name', r.name));
      info.appendChild(node('div', 'resource-meta', r.category + (r.size ? ' · ' + formatSize(r.size) : ''))); row.appendChild(info);
      var actions = node('div', 'resource-actions'); actions.appendChild(link(r.html, r.type === 'dir' ? 'Abrir carpeta ↗' : 'Ver ↗'));
      if (r.download) actions.appendChild(link(r.download, 'Descargar ↓'));
      row.appendChild(actions); list.appendChild(row);
    });
  }
  function loadResources() {
    var list = $('#rec-lista');
    return fetch(REPO_API, { headers: { Accept: 'application/vnd.github+json' } }).then(function (response) {
      if (!response.ok) throw new Error(response.status === 403 || response.status === 429 ? 'GitHub limitó temporalmente las consultas. Intenta más tarde.' : 'No se pudo conectar con el repositorio.');
      return response.json();
    }).then(function (data) {
      resources = data.filter(function (x) { return x && x.name && x.type && x.html_url && hiddenFiles.indexOf(x.name.toLowerCase()) === -1 && x.name.charAt(0) !== '.'; }).map(function (x) {
        return { name: x.name, type: x.type, html: safeUrl(x.html_url), download: x.type === 'file' ? safeUrl(x.download_url) : '', size: x.size || 0, category: category(x.name, x.type) };
      }).filter(function (x) { return x.html; });
      $('#buscar').disabled = false; $('#rec-count').textContent = resources.length + ' ARCHIVO' + (resources.length === 1 ? '' : 'S');
      drawFilters(); drawResources();
    }).catch(function (error) {
      resources = []; $('#rec-count').textContent = 'NO DISPONIBLE'; setMessage(list, (error && error.message ? error.message : 'No se pudieron cargar los recursos.') + ' Puedes abrir el repositorio directamente.', true);
      var retry = node('button', 'resource-retry', 'Reintentar'); retry.type = 'button'; retry.addEventListener('click', function () { setMessage(list, 'Conectando con GitHub…'); loadResources(); }); list.appendChild(retry);
    });
  }
  $('#buscar').addEventListener('input', drawResources);

  // Propuesta a GitHub Issues: no se envía automáticamente
  $('#form-prop').addEventListener('submit', function (event) {
    event.preventDefault();
    var form = event.currentTarget, data = new FormData(form);
    var title = String(data.get('nombre') || '').trim();
    var type = String(data.get('tipo') || 'Otro');
    var description = String(data.get('descr') || '').trim();
    var url = String(data.get('enlace') || '').trim();
    var body = '**Tipo:** ' + type + '\n\n**Descripción:** ' + description + '\n\n**Enlace:** ' + (url || 'No proporcionado') + '\n\n**Permiso:** Confirmo que es mío o tengo permiso para compartirlo.\n\n_No incluyas datos personales._';
    var target = REPO + '/issues/new?title=' + encodeURIComponent('[Propuesta] ' + title) + '&body=' + encodeURIComponent(body);
    var open = $('#prop-link'); open.href = target; open.hidden = false; $('#prop-msg').hidden = false; open.focus();
  });

  // Buscador global
  var searchDialog = $('#gbus'), searchInput = $('#gq'), searchResults = $('#gres');
  function searchItems(query) {
    var q = query.trim().toLowerCase(), items = [
      { title: 'Inicio', type: 'Sección', href: '#inicio' },
      { title: 'Tutoriales', type: 'Sección', href: '#tutoriales' },
      { title: 'Recursos', type: 'Sección', href: '#recursos' },
      { title: 'Retos', type: 'Sección', href: '#retos' },
      { title: 'Comunidad', type: 'Sección', href: '#comunidad' },
      { title: 'Normas y seguridad', type: 'Sección', href: '#normas' }
    ];
    tutorials.forEach(function (t) { items.push({ title: t.title, type: 'Tutorial', href: t.url, description: t.description }); });
    resources.forEach(function (r) { items.push({ title: r.name, type: r.category, href: r.html }); });
    RETOS.forEach(function (r) { items.push({ title: r.title, type: 'Reto', href: '#retos', description: r.desc }); });
    return q ? items.filter(function (i) { return (i.title + ' ' + (i.description || '')).toLowerCase().indexOf(q) !== -1; }).slice(0, 12) : [];
  }
  function renderSearch() {
    searchResults.textContent = '';
    var q = searchInput.value.trim();
    if (!q) { searchResults.appendChild(node('li', 'search-hint', 'Busca tutoriales, scripts, recursos o retos.')); return; }
    var found = searchItems(q);
    if (!found.length) { searchResults.appendChild(node('li', 'search-hint', 'No encontramos resultados. Prueba con otro término.')); return; }
    found.forEach(function (item) {
      var li = node('li'); var a = link(item.href, item.title); a.appendChild(node('small', '', item.type));
      if (item.href.charAt(0) === '#') a.addEventListener('click', function () { searchDialog.close(); }); li.appendChild(a); searchResults.appendChild(li);
    });
  }
  $('#abrir-bus').addEventListener('click', function () { searchInput.value = ''; renderSearch(); searchDialog.showModal(); searchInput.focus(); });
  $('#cerrar-bus').addEventListener('click', function () { searchDialog.close(); });
  searchInput.addEventListener('input', renderSearch);

  // Carga en paralelo
  loadTutorials(); loadResources();
})();
