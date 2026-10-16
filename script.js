// 1. Video cards: with a data-id, show a thumbnail that opens a popup player
var player = document.getElementById('player');
var playerFrame = player.querySelector('.player-frame');
document.querySelectorAll('.video').forEach(function (card) {
  var id = card.dataset.id.trim();
  if (!id) return;
  var title = card.querySelector('h3').textContent;
  var thumb = document.createElement('button');
  thumb.type = 'button';
  thumb.className = 'thumb';
  thumb.setAttribute('aria-label', 'Play ' + title);
  thumb.innerHTML = '<img src="https://i.ytimg.com/vi/' + encodeURIComponent(id) + '/hqdefault.jpg" alt=""><span>&#9654;</span>';
  thumb.addEventListener('click', function () {
    playerFrame.innerHTML = '<iframe title="' + title + '" allow="autoplay; fullscreen" allowfullscreen src="https://www.youtube-nocookie.com/embed/' + encodeURIComponent(id) + '?autoplay=1"></iframe>';
    player.showModal();
  });
  card.insertBefore(thumb, card.firstChild);
  card.querySelector('.btn').remove();
});
function closePlayer() { player.close(); }
player.querySelector('.player-close').addEventListener('click', closePlayer);
player.addEventListener('click', function (e) { if (e.target === player) closePlayer(); });
player.addEventListener('close', function () { playerFrame.innerHTML = ''; });

var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// 2. Count up the record numbers in the hero
if (!reduceMotion) {
  document.querySelectorAll('[data-count]').forEach(function (el) {
    var target = Number(el.dataset.count);
    var start = performance.now();
    function tick(now) {
      var t = Math.min((now - start) / 1200, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - t, 3)));
      if (t < 1) requestAnimationFrame(tick);
    }
    el.textContent = '0';
    requestAnimationFrame(tick);
  });
}

// 3. Fade sections and cards in as they scroll into view
if ('IntersectionObserver' in window && !reduceMotion) {
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.15 });
  document.querySelectorAll('.section, .video').forEach(function (el) {
    el.classList.add('reveal');
    io.observe(el);
  });
}

// 4. Filter the fight table by method
var filters = document.querySelectorAll('.filter');
filters.forEach(function (btn) {
  btn.addEventListener('click', function () {
    filters.forEach(function (b) { b.classList.remove('active'); });
    btn.classList.add('active');
    var f = btn.dataset.filter;
    document.querySelectorAll('tbody tr').forEach(function (row) {
      row.hidden = f !== 'all' && row.dataset.method !== f;
    });
  });
});

// 5. Highlight the nav link for the section on screen
var links = document.querySelectorAll('.site-header nav a');
if ('IntersectionObserver' in window) {
  var spy = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      links.forEach(function (a) {
        a.classList.toggle('current', a.getAttribute('href') === '#' + e.target.id);
      });
    });
  }, { rootMargin: '-40% 0px -55% 0px' });
  document.querySelectorAll('.section').forEach(function (s) { spy.observe(s); });
}

// 6. Back-to-top button
var toTop = document.querySelector('.to-top');
window.addEventListener('scroll', function () {
  toTop.hidden = window.scrollY < 600;
}, { passive: true });
toTop.addEventListener('click', function () {
  window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
});

// 7. Fight duration chart
var ufcFights = [
  { name: 'Jubli', event: 'UFC 312', sec: 19, how: 'TKO' },
  { name: 'Ashmouz', event: 'UFC 316', sec: 900, how: 'Decision' },
  { name: 'Haqparast', event: 'UFC 321', sec: 150, how: 'KO' },
  { name: 'Mullarkey', event: 'UFC 325', sec: 182, how: 'Submission' },
  { name: 'Dariush', event: 'Fight Night', sec: 209, how: 'TKO' },
  { name: 'Gamrot', event: 'Fight Night', sec: 265, how: 'Submission' }
];
var chart = document.getElementById('chart');
ufcFights.forEach(function (f) {
  var m = Math.floor(f.sec / 60), s = String(f.sec % 60).padStart(2, '0');
  var li = document.createElement('li');
  li.innerHTML = '<span class="bar-label">' + f.name + '<small>' + f.event + ' &middot; ' + f.how + '</small></span>' +
    '<span class="bar-track"><span class="bar-fill" style="--w:' + (f.sec / 900 * 100).toFixed(1) + '%"></span></span>' +
    '<span class="bar-time">' + m + ':' + s + '</span>';
  chart.appendChild(li);
});
if ('IntersectionObserver' in window) {
  new IntersectionObserver(function (entries, obs) {
    entries.forEach(function (e) { if (e.isIntersecting) { chart.classList.add('go'); obs.disconnect(); } });
  }, { threshold: 0.3 }).observe(chart);
} else { chart.classList.add('go'); }

// 8. Light / dark theme toggle (remembers your choice)
var root = document.documentElement;
document.querySelector('.theme-toggle').addEventListener('click', function () {
  var next = root.dataset.theme === 'light' ? 'dark' : 'light';
  root.dataset.theme = next;
  try { localStorage.setItem('theme', next); } catch (e) {}
});
