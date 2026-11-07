/* Desktop behaviour: icons, windows (drag, resize, minimize, maximize, close), taskbar, start menu, clock. */
(function () {
  'use strict';
  var D = window.DATA || { ideas: [], ui: [] };
  var area = document.getElementById('area');
  var desktop = document.getElementById('desktop');
  var tasks = document.getElementById('tasks');
  var balloon = document.getElementById('balloon');
  var smenu = document.getElementById('smenu');
  var startBtn = document.getElementById('start');
  var wins = {};
  var z = 10;
  var cascade = 0;

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }
  function ico(name) { return '<svg class="ico" aria-hidden="true"><use href="#i-' + name + '"/></svg>'; }
  function narrow() { return window.matchMedia('(max-width: 700px)').matches; }
  function coarse() { return window.matchMedia('(pointer: coarse)').matches; }
  function clamp(v, lo, hi) { return Math.min(Math.max(v, lo), hi); }
  function cap(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; }
  function lower(s) { return s.toLowerCase(); }

  /* ---------- window manager ---------- */
  function topVisible() {
    var best = null;
    Object.keys(wins).forEach(function (k) {
      var w = wins[k];
      if (!w.min && (!best || +w.el.style.zIndex > +best.el.style.zIndex)) best = w;
    });
    return best;
  }

  function syncHash() {
    var t = topVisible();
    try {
      history.replaceState(null, '', t && t.hash ? '#' + t.hash : location.pathname + location.search);
    } catch (e) {}
  }

  function focusWin(w) {
    Object.keys(wins).forEach(function (k) {
      var o = wins[k];
      o.el.classList.toggle('active', o === w);
      o.btn.classList.toggle('on', o === w && !o.min);
    });
    w.el.style.zIndex = ++z;
    syncHash();
  }

  function restoreWin(w) {
    if (w.min) { w.min = false; w.el.classList.remove('hid'); }
  }

  function minimizeWin(w) {
    w.min = true;
    w.el.classList.add('hid');
    w.el.classList.remove('active');
    w.btn.classList.remove('on');
    var t = topVisible();
    if (t) focusWin(t); else syncHash();
  }

  function closeWin(w) {
    w.el.remove();
    w.btn.remove();
    delete wins[w.id];
    var t = topVisible();
    if (t) focusWin(t); else syncHash();
  }

  function toggleMax(w) {
    if (narrow()) return;
    if (w.max) {
      w.max = false;
      w.el.classList.remove('max');
      var p = w.prev;
      w.el.style.left = p.l + 'px'; w.el.style.top = p.t + 'px';
      w.el.style.width = p.w + 'px'; w.el.style.height = p.h + 'px';
    } else {
      w.prev = { l: w.el.offsetLeft, t: w.el.offsetTop, w: w.el.offsetWidth, h: w.el.offsetHeight };
      w.max = true;
      w.el.classList.add('max');
    }
  }

  function openWin(o) {
    var existing = wins[o.id];
    if (existing) { restoreWin(existing); focusWin(existing); existing.el.focus({ preventScroll: true }); return existing; }

    var w = { id: o.id, hash: o.hash, min: false, max: false };
    var win = el('section', 'win');
    win.setAttribute('role', 'dialog');
    win.setAttribute('aria-label', o.title);
    win.tabIndex = -1;

    var tb = el('div', 'titlebar');
    tb.innerHTML = ico(o.icon);
    tb.appendChild(el('span', 'tt', o.title));
    var btns = el('span', 'btns');
    var bMin = el('button', 'tb m'); bMin.type = 'button'; bMin.setAttribute('aria-label', 'Minimize');
    var bMax = el('button', 'tb r'); bMax.type = 'button'; bMax.setAttribute('aria-label', 'Maximize or restore');
    var bClose = el('button', 'tb x'); bClose.type = 'button'; bClose.setAttribute('aria-label', 'Close');
    btns.appendChild(bMin); btns.appendChild(bMax); btns.appendChild(bClose);
    tb.appendChild(btns);

    var body = el('div', 'wbody');
    var grip = el('div', 'grip');
    win.appendChild(tb); win.appendChild(body); win.appendChild(grip);

    var aw = area.clientWidth, ah = area.clientHeight;
    var ww = Math.min(o.w, aw - 24), wh = Math.min(o.h, ah - 24);
    var left = clamp(110 + cascade * 26, 8, Math.max(8, aw - ww - 8));
    var top = clamp(24 + cascade * 26, 8, Math.max(8, ah - wh - 8));
    cascade = (cascade + 1) % 8;
    win.style.cssText = 'left:' + left + 'px;top:' + top + 'px;width:' + ww + 'px;height:' + wh + 'px;';
    area.appendChild(win);

    var btn = el('button', 'tbtn');
    btn.type = 'button';
    btn.innerHTML = ico(o.icon);
    btn.appendChild(el('span', null, o.title));
    tasks.appendChild(btn);
    w.el = win; w.btn = btn;
    wins[o.id] = w;

    o.build(body, w);
    focusWin(w);
    win.focus({ preventScroll: true });
    hideBalloon();

    win.addEventListener('pointerdown', function () { if (!win.classList.contains('active')) focusWin(w); });
    bMin.addEventListener('click', function () { minimizeWin(w); });
    bMax.addEventListener('click', function () { toggleMax(w); });
    bClose.addEventListener('click', function () { closeWin(w); });
    btn.addEventListener('click', function () {
      if (w.min) { restoreWin(w); focusWin(w); }
      else if (win.classList.contains('active')) minimizeWin(w);
      else focusWin(w);
    });
    tb.addEventListener('dblclick', function (e) { if (!e.target.closest('.btns')) toggleMax(w); });

    /* drag by the title bar */
    tb.addEventListener('pointerdown', function (e) {
      if (e.target.closest('.btns') || narrow() || w.max) return;
      var sx = e.clientX, sy = e.clientY, sl = win.offsetLeft, st = win.offsetTop;
      try { tb.setPointerCapture(e.pointerId); } catch (x) {}
      function move(ev) {
        win.style.left = clamp(sl + ev.clientX - sx, 80 - win.offsetWidth, area.clientWidth - 80) + 'px';
        win.style.top = clamp(st + ev.clientY - sy, 0, area.clientHeight - 30) + 'px';
      }
      function up() {
        tb.removeEventListener('pointermove', move);
        tb.removeEventListener('pointerup', up);
        tb.removeEventListener('pointercancel', up);
      }
      tb.addEventListener('pointermove', move);
      tb.addEventListener('pointerup', up);
      tb.addEventListener('pointercancel', up);
    });

    /* resize from the bottom-right corner */
    grip.addEventListener('pointerdown', function (e) {
      e.preventDefault();
      var sx = e.clientX, sy = e.clientY, sw = win.offsetWidth, sh = win.offsetHeight;
      try { grip.setPointerCapture(e.pointerId); } catch (x) {}
      function move(ev) {
        win.style.width = clamp(sw + ev.clientX - sx, 300, area.clientWidth - win.offsetLeft) + 'px';
        win.style.height = clamp(sh + ev.clientY - sy, 200, area.clientHeight - win.offsetTop) + 'px';
      }
      function up() {
        grip.removeEventListener('pointermove', move);
        grip.removeEventListener('pointerup', up);
        grip.removeEventListener('pointercancel', up);
      }
      grip.addEventListener('pointermove', move);
      grip.addEventListener('pointerup', up);
      grip.addEventListener('pointercancel', up);
    });
    return w;
  }

  /* ---------- folder windows ---------- */
  function explorer(body, cfg) {
    var bar = el('div', 'toolbar');
    var addr = el('div', 'address');
    addr.innerHTML = ico('folder');
    addr.appendChild(el('span', null, cfg.name));
    var q = el('input', 'search');
    q.type = 'search'; q.placeholder = 'Search';
    q.setAttribute('aria-label', 'Search ' + cfg.name);
    bar.appendChild(addr); bar.appendChild(q);

    var main = el('div', 'xmain');
    var pane = el('aside', 'pane');
    var list = el('div', 'items ' + cfg.view);
    main.appendChild(pane); main.appendChild(list);
    var status = el('div', 'status');
    var count = el('span');
    status.appendChild(count);
    body.appendChild(bar); body.appendChild(main); body.appendChild(status);

    var state = { q: '', tag: '' };
    var nodes = [];
    cfg.items.forEach(function (item) {
      var n = cfg.make(item);
      n._item = item;
      n._text = lower(cfg.text(item));
      list.appendChild(n);
      nodes.push(n);
    });
    var emptyMsg = el('p', 'empty', cfg.empty);
    emptyMsg.hidden = nodes.length > 0;
    list.appendChild(emptyMsg);

    var details = el('div', 'box');
    details.appendChild(el('h4', null, 'Details'));
    var dbd = el('div', 'bd');
    dbd.appendChild(el('b', null, cfg.name));
    dbd.appendChild(el('span', null, 'File Folder'));
    var dcount = el('span');
    dbd.appendChild(dcount);
    details.appendChild(dbd);
    pane.appendChild(details);

    var tagSet = {}, tagNames = [];
    cfg.items.forEach(function (it) {
      it.tags.forEach(function (t) {
        if (!tagSet[lower(t)]) { tagSet[lower(t)] = t; tagNames.push(lower(t)); }
      });
    });
    tagNames.sort();
    var tagLinks = [];
    if (tagNames.length) {
      var tbox = el('div', 'box');
      tbox.appendChild(el('h4', null, 'Filter by tag'));
      var tbd = el('div', 'bd');
      [''].concat(tagNames).forEach(function (key) {
        var b = el('button', 'taglink' + (key === '' ? ' on' : ''), key === '' ? 'All items' : tagSet[key]);
        b.type = 'button';
        b.addEventListener('click', function () {
          state.tag = key;
          tagLinks.forEach(function (o) { o.classList.toggle('on', o === b); });
          apply();
        });
        tagLinks.push(b);
        tbd.appendChild(b);
      });
      tbox.appendChild(tbd);
      pane.appendChild(tbox);
    }

    function apply() {
      var shown = 0;
      nodes.forEach(function (n) {
        var tags = n._item.tags.map(lower);
        var ok = (!state.tag || tags.indexOf(state.tag) !== -1) && (!state.q || n._text.indexOf(state.q) !== -1);
        n.hidden = !ok;
        if (ok) shown++;
      });
      var label = shown + (shown === 1 ? ' object' : ' objects');
      count.textContent = label;
      dcount.textContent = label;
    }
    q.addEventListener('input', function () { state.q = q.value.trim().toLowerCase(); apply(); });
    apply();

    function select(n) {
      Array.prototype.forEach.call(list.querySelectorAll('.sel'), function (s) { s.classList.remove('sel'); });
      n.classList.add('sel');
    }
    list.addEventListener('click', function (e) {
      var n = e.target.closest('.tile, .thumb');
      if (!n) return;
      select(n);
      if (coarse()) cfg.open(n._item);
    });
    list.addEventListener('dblclick', function (e) {
      var n = e.target.closest('.tile, .thumb');
      if (n) cfg.open(n._item);
    });
    list.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter') return;
      var n = e.target.closest('.tile, .thumb');
      if (n) { e.preventDefault(); cfg.open(n._item); }
    });
  }

  function openIdeas() {
    return openWin({
      id: 'ideas', title: 'Ideas', icon: 'folder', w: 800, h: 520, hash: 'ideas',
      build: function (body) {
        explorer(body, {
          name: 'Ideas', view: 'tiles', items: D.ideas,
          empty: 'This folder is empty. Add a Markdown file to the ideas folder in the repo.',
          text: function (i) { return i.title + ' ' + i.summary + ' ' + i.tags.join(' ') + ' ' + i.status; },
          make: function (i) {
            var b = el('button', 'tile');
            b.type = 'button';
            b.title = i.title;
            b.innerHTML = ico('doc');
            var t = el('span', 'txt');
            t.appendChild(el('b', null, i.title));
            t.appendChild(el('small', null, cap(i.status) + (i.total ? ' · roadmap ' + i.done + '/' + i.total : '')));
            if (i.summary) t.appendChild(el('em', null, i.summary));
            b.appendChild(t);
            return b;
          },
          open: openIdea
        });
      }
    });
  }

  function openUI() {
    return openWin({
      id: 'ui', title: 'UI Inspiration', icon: 'folder', w: 820, h: 540, hash: 'ui',
      build: function (body) {
        explorer(body, {
          name: 'UI Inspiration', view: 'thumbs', items: D.ui,
          empty: 'This folder is empty. Add screenshots to the ui folder in the repo and they will appear here.',
          text: function (s) { return s.title + ' ' + s.tags.join(' '); },
          make: function (s) {
            var b = el('button', 'thumb');
            b.type = 'button';
            b.title = s.title;
            var frame = el('div', 'frame');
            var img = el('img');
            img.src = s.src; img.alt = ''; img.loading = 'lazy'; img.draggable = false;
            frame.appendChild(img);
            b.appendChild(frame);
            b.appendChild(el('span', null, s.title));
            return b;
          },
          open: openShot
        });
      }
    });
  }

  /* ---------- document and image windows ---------- */
  function openIdea(i) {
    return openWin({
      id: 'idea:' + i.slug, title: i.title, icon: 'doc', w: 660, h: 560, hash: 'idea/' + i.slug,
      build: function (body) {
        var doc = el('div', 'doc');
        doc.appendChild(el('h1', null, i.title));
        var meta = el('div', 'meta');
        meta.appendChild(el('span', 'pill s-' + i.status, i.status));
        i.tags.forEach(function (t) { meta.appendChild(el('span', 'tagx', t)); });
        if (i.total) meta.appendChild(el('span', 'prog', i.done + ' of ' + i.total + ' roadmap steps done'));
        doc.appendChild(meta);
        var prose = el('div', 'prose');
        prose.innerHTML = i.html;
        doc.appendChild(prose);
        body.appendChild(doc);
        var st = el('div', 'status');
        st.appendChild(el('span', null, 'Status: ' + cap(i.status)));
        if (i.tags.length) st.appendChild(el('span', null, 'Tags: ' + i.tags.join(', ')));
        body.appendChild(st);
      }
    });
  }

  function openShot(s) {
    return openWin({
      id: 'shot:' + s.file, title: s.title, icon: 'image', w: 940, h: 620, hash: 'shot/' + encodeURIComponent(s.file),
      build: function (body) {
        var v = el('div', 'viewer');
        var stage = el('div', 'stage');
        var img = el('img');
        img.src = s.src; img.alt = s.title;
        stage.appendChild(img);
        var side = el('div', 'side');
        side.appendChild(el('h2', null, s.title));
        if (s.tags.length) {
          var meta = el('div', 'meta');
          s.tags.forEach(function (t) { meta.appendChild(el('span', 'tagx', t)); });
          side.appendChild(meta);
        }
        if (s.html) {
          var prose = el('div', 'prose');
          prose.innerHTML = s.html;
          side.appendChild(prose);
        } else {
          side.appendChild(el('p', 'none', 'No notes for this screenshot yet.'));
        }
        if (s.source) {
          var a = el('a', null, 'Open the source');
          a.href = s.source; a.target = '_blank'; a.rel = 'noopener noreferrer';
          side.appendChild(a);
        }
        v.appendChild(stage); v.appendChild(side);
        body.appendChild(v);
        var st = el('div', 'status');
        st.appendChild(el('span', null, s.file));
        body.appendChild(st);
      }
    });
  }

  /* ---------- desktop icons, start menu, clock, balloon ---------- */
  function openFolder(kind) { if (kind === 'ideas') openIdeas(); else if (kind === 'ui') openUI(); }

  var icons = Array.prototype.slice.call(document.querySelectorAll('.dicon'));
  function deselect() { icons.forEach(function (i) { i.classList.remove('sel'); }); }
  icons.forEach(function (b) {
    b.addEventListener('click', function () {
      deselect(); b.classList.add('sel');
      if (coarse()) openFolder(b.dataset.open);
    });
    b.addEventListener('dblclick', function () { openFolder(b.dataset.open); });
    b.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); openFolder(b.dataset.open); }
    });
  });
  desktop.addEventListener('click', function (e) { if (!e.target.closest('.dicon')) deselect(); });

  function setMenu(open) {
    smenu.hidden = !open;
    startBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
  }
  startBtn.addEventListener('click', function (e) { e.stopPropagation(); setMenu(smenu.hidden); });
  smenu.addEventListener('click', function (e) {
    var b = e.target.closest('button[data-open]');
    if (b) { setMenu(false); openFolder(b.dataset.open); }
  });
  document.addEventListener('pointerdown', function (e) {
    if (!smenu.hidden && !smenu.contains(e.target) && !startBtn.contains(e.target)) setMenu(false);
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });

  var clock = document.getElementById('clock');
  function tick() {
    var d = new Date(), h = d.getHours(), m = d.getMinutes();
    clock.textContent = (h % 12 || 12) + ':' + (m < 10 ? '0' : '') + m + ' ' + (h < 12 ? 'AM' : 'PM');
  }
  tick();
  setInterval(tick, 20000);

  function hideBalloon() { balloon.hidden = true; }
  balloon.addEventListener('click', hideBalloon);
  setTimeout(function () {
    if (Object.keys(wins).length) return;
    balloon.textContent = coarse() ? 'Tap a folder to open it.' : 'Double-click a folder to open it.';
    balloon.hidden = false;
    setTimeout(hideBalloon, 9000);
  }, 700);

  /* ---------- open from the address (#ideas, #ui, #idea/slug, #shot/file) ---------- */
  function openFromHash() {
    var raw = (location.hash || '').slice(1);
    if (!raw) return;
    var parts = raw.split('/');
    var kind = parts[0];
    var arg = '';
    try { arg = decodeURIComponent(parts.slice(1).join('/')); } catch (e) { return; }
    if (kind === 'ideas') openIdeas();
    else if (kind === 'ui') openUI();
    else if (kind === 'idea') {
      var i = D.ideas.filter(function (x) { return x.slug === arg; })[0];
      if (i) openIdea(i);
    } else if (kind === 'shot') {
      var s = D.ui.filter(function (x) { return x.file === arg; })[0];
      if (s) openShot(s);
    }
  }
  openFromHash();
})();
