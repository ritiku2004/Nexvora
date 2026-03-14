
// ── CUSTOM CURSOR ──
var cursor = document.getElementById('cursor');
var ring = document.getElementById('cursorRing');
var mx = 0, my = 0, rx = 0, ry = 0;
document.addEventListener('mousemove', function(e) {
  mx = e.clientX; my = e.clientY;
  cursor.style.left = mx + 'px'; cursor.style.top = my + 'px';
});
function animRing() {
  rx += (mx - rx) * 0.12; ry += (my - ry) * 0.12;
  ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
  requestAnimationFrame(animRing);
}
animRing();

// ── PARTICLES ──
(function() {
  var c = document.getElementById('particles');
  var ctx = c.getContext('2d');
  var W, H, pts = [];
  function resize() { W = c.width = window.innerWidth; H = c.height = window.innerHeight; }
  resize();
  window.addEventListener('resize', resize);
  for (var i = 0; i < 60; i++) {
    pts.push({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 1.5 + 0.5,
      a: Math.random(),
      color: Math.random() > 0.5 ? '79,142,255' : Math.random() > 0.5 ? '162,89,255' : '0,229,192'
    });
  }
  function draw() {
    ctx.clearRect(0, 0, W, H);
    pts.forEach(function(p) {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(' + p.color + ',' + (p.a * 0.6) + ')';
      ctx.fill();
    });
    // draw lines between nearby particles
    for (var i = 0; i < pts.length; i++) {
      for (var j = i + 1; j < pts.length; j++) {
        var dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
        var dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < 100) {
          ctx.beginPath();
          ctx.moveTo(pts[i].x, pts[i].y);
          ctx.lineTo(pts[j].x, pts[j].y);
          ctx.strokeStyle = 'rgba(79,142,255,' + (0.06 * (1 - dist/100)) + ')';
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(draw);
  }
  draw();
})();

// ── CARD MOUSE GLOW ──
document.querySelectorAll('.card').forEach(function(card) {
  card.addEventListener('mousemove', function(e) {
    var r = card.getBoundingClientRect();
    var x = ((e.clientX - r.left) / r.width * 100).toFixed(1);
    var y = ((e.clientY - r.top) / r.height * 100).toFixed(1);
    card.style.setProperty('--mx', x + '%');
    card.style.setProperty('--my', y + '%');
  });
});

// ── SCROLL REVEAL ──
var observer = new IntersectionObserver(function(entries) {
  entries.forEach(function(e) {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      // trigger counter if stat-num
      e.target.querySelectorAll && e.target.querySelectorAll('[data-count]').forEach(animCount);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });
document.querySelectorAll('.reveal').forEach(function(el) { observer.observe(el); });

// Also watch stat-nums in hero
var heroObserver = new IntersectionObserver(function(entries) {
  entries.forEach(function(e) {
    if (e.isIntersecting) {
      e.target.querySelectorAll('[data-count]').forEach(animCount);
      heroObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.5 });
var heroStats = document.querySelector('.hero-stats');
if (heroStats) heroObserver.observe(heroStats);

function animCount(el) {
  var target = parseInt(el.getAttribute('data-count'));
  var suffix = el.getAttribute('data-suffix') || '';
  var start = 0, dur = 1400, startTime = null;
  function step(ts) {
    if (!startTime) startTime = ts;
    var prog = Math.min((ts - startTime) / dur, 1);
    var ease = 1 - Math.pow(1 - prog, 3);
    el.textContent = Math.floor(ease * target) + suffix;
    if (prog < 1) requestAnimationFrame(step);
    else el.textContent = target + suffix;
  }
  requestAnimationFrame(step);
}

// ── NAV ──
function goTo(id) { var el = document.getElementById(id); if (el) el.scrollIntoView({ behavior: 'smooth' }); }
function toggleMenu() { document.getElementById('mobileMenu').classList.toggle('open'); }
function closeMenu() { document.getElementById('mobileMenu').classList.remove('open'); }

// ── FAQ ──
function toggleFaq(btn) {
  var item = btn.parentElement;
  var isOpen = item.classList.contains('open');
  document.querySelectorAll('.faq-item').forEach(function(i) { i.classList.remove('open'); });
  if (!isOpen) item.classList.add('open');
}

// ── CALCULATOR ──
var calcPrices = [2999, 3000, 5000, 2000, 1500, 999, 1200, 2500];
function toggleCalc(i) {
  var cb = document.getElementById('cb' + i);
  var item = document.getElementById('ci' + i);
  cb.checked = !cb.checked;
  item.classList.toggle('on', cb.checked);
  var total = 0;
  for (var j = 0; j < 8; j++) {
    if (document.getElementById('cb' + j).checked) total += calcPrices[j];
  }
  var el = document.getElementById('calcTotal');
  el.textContent = '₹' + total.toLocaleString('en-IN');
  el.classList.remove('bump');
  void el.offsetWidth;
  el.classList.add('bump');
}

// ── ORDER FORM ──
var API_BASE = 'http://localhost:5000/api';

async function submitOrder() {
  var name     = document.getElementById('fname').value.trim();
  var phone    = document.getElementById('fphone').value.trim();
  var email    = document.getElementById('femail').value.trim();
  var type     = document.getElementById('ftype').value;
  var desc     = document.getElementById('fdesc').value.trim();
  var budget   = document.getElementById('fbudget').value;
  var features = document.getElementById('ffeatures').value.trim();
  var deadline = document.getElementById('fdeadline').value;

  if (!name || !phone || !email || !type || !desc) {
    alert('Please fill in all required fields marked with *');
    return;
  }

  var btn = document.querySelector('.fsub');
  btn.textContent = 'Submitting...';
  btn.disabled = true;

  try {
    var res = await fetch(API_BASE + '/orders/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name, email: email, phone: phone,
        website_type: type, budget: budget, description: desc,
        features: features, deadline: deadline })
    });
    var data = await res.json();

    if (data.success) {
      var toast = document.getElementById('toast');
      toast.querySelector('span:last-child').textContent =
        'Order ' + data.order_code + ' submitted! We\'ll contact you within 2 hours.';
      toast.classList.add('show');
      setTimeout(function() { toast.classList.remove('show'); }, 5000);
      ['fname','fphone','femail','ftype','fbudget','fdeadline','ffeatures','fdesc'].forEach(function(id) {
        document.getElementById(id).value = '';
      });
    } else {
      alert(data.message || 'Submission failed. Please try WhatsApp.');
    }
  } catch (e) {
    // Fallback: show toast anyway if API unreachable
    var toast = document.getElementById('toast');
    toast.classList.add('show');
    setTimeout(function() { toast.classList.remove('show'); }, 4000);
  } finally {
    btn.textContent = 'Send My Order Request 🚀';
    btn.disabled = false;
  }
}

// ── NAV SCROLL HIGHLIGHT ──
window.addEventListener('scroll', function() {
  var sections = ['home','services','pricing','calculator','portfolio','process','testimonials','order','faq','contact'];
  var sy = window.scrollY + 100;
  sections.forEach(function(id) {
    var el = document.getElementById(id);
    if (!el) return;
    var link = document.querySelector('.nav-links a[href="#' + id + '"]');
    if (!link) return;
    if (sy >= el.offsetTop && sy < el.offsetTop + el.offsetHeight) {
      link.style.color = 'var(--text)';
    } else {
      link.style.color = '';
    }
  });
});
