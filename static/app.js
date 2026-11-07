/* Search and tag filter for the ideas list and the UI gallery, plus the screenshot viewer. */
(function () {
  var list = document.getElementById('list');
  if (!list) return;
  var q = document.getElementById('q');
  var empty = document.getElementById('empty');
  var items = Array.prototype.slice.call(list.querySelectorAll('.item'));
  var chips = Array.prototype.slice.call(document.querySelectorAll('.chip'));
  var tag = '';

  function apply() {
    var text = q ? q.value.trim().toLowerCase() : '';
    var shown = 0;
    items.forEach(function (el) {
      var tags = (el.dataset.tags || '').split('|');
      var okTag = !tag || tags.indexOf(tag) !== -1;
      var okText = !text || (el.dataset.text || '').indexOf(text) !== -1;
      el.hidden = !(okTag && okText);
      if (!el.hidden) shown++;
    });
    if (empty) empty.hidden = shown !== 0;
  }
  if (q) q.addEventListener('input', apply);
  chips.forEach(function (c) {
    c.addEventListener('click', function () {
      tag = c.dataset.tag || '';
      chips.forEach(function (o) { o.classList.toggle('on', o === c); });
      apply();
    });
  });

  var lb = document.getElementById('lb');
  if (!lb || typeof lb.showModal !== 'function') return;
  var img = document.getElementById('lb-img');
  var title = document.getElementById('lb-title');
  var tags = document.getElementById('lb-tags');
  var notes = document.getElementById('lb-notes');
  var src = document.getElementById('lb-src');

  list.addEventListener('click', function (e) {
    var btn = e.target.closest('.shot-btn');
    if (!btn) return;
    var fig = btn.closest('.shot');
    var pic = fig.querySelector('img');
    var detail = fig.querySelector('.shot-detail');
    img.src = pic.getAttribute('src');
    img.alt = pic.alt;
    title.textContent = fig.querySelector('figcaption strong').textContent;
    tags.innerHTML = fig.querySelector('.tags').innerHTML;
    notes.innerHTML = detail.innerHTML;
    var s = detail.dataset.source;
    if (s) { src.href = s; src.hidden = false; } else { src.hidden = true; }
    lb.showModal();
  });
  lb.addEventListener('click', function (e) { if (e.target === lb) lb.close(); });
})();
