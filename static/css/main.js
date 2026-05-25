const EMISSIONS = {
  streaming:  100,
  busquedas:  0.2,
  emails:     4,
  redes:      36,
  video:      157,
};
const G_PER_KM = 96;

// Cursor personalizado
const cursor = document.createElement('div');
cursor.style.cssText = `
  position: fixed; width: 12px; height: 12px;
  background: #4eff7c; border-radius: 50%;
  pointer-events: none; z-index: 9999;
  transform: translate(-50%, -50%);
  transition: transform 0.12s ease;
  mix-blend-mode: screen;
`;
document.body.appendChild(cursor);

const cursorRing = document.createElement('div');
cursorRing.style.cssText = `
  position: fixed; width: 32px; height: 32px;
  border: 1px solid rgba(78,255,124,0.4); border-radius: 50%;
  pointer-events: none; z-index: 9998;
  transform: translate(-50%, -50%);
  transition: width 0.3s, height 0.3s;
`;
document.body.appendChild(cursorRing);

document.addEventListener('mousemove', (e) => {
  cursor.style.left = e.clientX + 'px';
  cursor.style.top  = e.clientY + 'px';
  cursorRing.style.left = e.clientX + 'px';
  cursorRing.style.top  = e.clientY + 'px';
});

document.querySelectorAll('a, button, input').forEach(el => {
  el.addEventListener('mouseenter', () => {
    cursorRing.style.width = '50px';
    cursorRing.style.height = '50px';
    cursorRing.style.borderColor = 'rgba(78,255,124,0.7)';
  });
  el.addEventListener('mouseleave', () => {
    cursorRing.style.width = '32px';
    cursorRing.style.height = '32px';
    cursorRing.style.borderColor = 'rgba(78,255,124,0.4)';
  });
});

// Partículas
const canvas = document.getElementById('particles');
const ctx    = canvas.getContext('2d');
let W, H, particles = [];

function resize() {
  W = canvas.width  = window.innerWidth;
  H = canvas.height = window.innerHeight;
}
resize();
window.addEventListener('resize', resize);

class Particle {
  constructor() { this.reset(); }
  reset() {
    this.x     = Math.random() * W;
    this.y     = Math.random() * H;
    this.size  = Math.random() * 1.5 + 0.3;
    this.vx    = (Math.random() - 0.5) * 0.3;
    this.vy    = -Math.random() * 0.5 - 0.1;
    this.alpha = Math.random() * 0.5 + 0.1;
    this.life  = Math.random() * 200 + 100;
    this.age   = 0;
  }
  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.age++;
    if (this.age > this.life || this.y < -10) this.reset();
  }
  draw() {
    const fade = Math.min(1, (this.life - this.age) / 40);
    ctx.save();
    ctx.globalAlpha = this.alpha * fade;
    ctx.fillStyle = '#4eff7c';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

for (let i = 0; i < 80; i++) particles.push(new Particle());

function animateParticles() {
  ctx.clearRect(0, 0, W, H);
  particles.forEach(p => { p.update(); p.draw(); });
  requestAnimationFrame(animateParticles);
}
animateParticles();

// Sliders
function calcCO2() {
  const s = parseFloat(document.getElementById('streaming').value)  || 0;
  const b = parseFloat(document.getElementById('busquedas').value)  || 0;
  const e = parseFloat(document.getElementById('emails').value)     || 0;
  const r = parseFloat(document.getElementById('redes').value)      || 0;
  const v = parseFloat(document.getElementById('video').value)      || 0;
  return Math.round(
    s * EMISSIONS.streaming +
    b * EMISSIONS.busquedas +
    e * EMISSIONS.emails    +
    r * EMISSIONS.redes     +
    v * EMISSIONS.video
  );
}

function getEquivalent(total) {
  const km = (total / G_PER_KM).toFixed(1);
  if (total < 50)  return `≈ ${km} km en carro`;
  if (total < 200) return `≈ ${km} km en carro · bombilla por ${Math.round(total / 8)}h`;
  return `≈ ${km} km en carro · ${(total / (21000/365)).toFixed(2)} días de absorción de un árbol`;
}

function updatePreview() {
  const total = calcCO2();
  const numEl = document.getElementById('preview-num');
  const eqEl  = document.getElementById('preview-eq');
  numEl.textContent = total;
  eqEl.textContent  = getEquivalent(total);
  numEl.style.transform = 'scale(1.08)';
  numEl.style.color = total > 500 ? '#f5a623' : '#4eff7c';
  setTimeout(() => { numEl.style.transform = 'scale(1)'; }, 200);
}

const sliderConfig = [
  { id: 'streaming', valId: 'val-streaming', format: v => v + ' h' },
  { id: 'busquedas', valId: 'val-busquedas', format: v => v },
  { id: 'emails',    valId: 'val-emails',    format: v => v },
  { id: 'redes',     valId: 'val-redes',     format: v => v + ' h' },
  { id: 'video',     valId: 'val-video',     format: v => v + ' h' },
];

sliderConfig.forEach(({ id, valId, format }) => {
  const slider = document.getElementById(id);
  const label  = document.getElementById(valId);
  if (!slider || !label) return;
  slider.addEventListener('input', () => {
    label.textContent = format(slider.value);
    updatePreview();
  });
});

updatePreview();

// Scroll animations
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

document.querySelectorAll('.comp-card, .tip-card, .fcard, .preview-box').forEach(el => {
  el.classList.add('fade-in');
  observer.observe(el);
});

// Parallax orbes
window.addEventListener('scroll', () => {
  const y = window.scrollY;
  const orb1 = document.querySelector('.orb-1');
  const orb2 = document.querySelector('.orb-2');
  if (orb1) orb1.style.transform = `translate(${y * 0.05}px, ${y * 0.08}px)`;
  if (orb2) orb2.style.transform = `translate(${-y * 0.04}px, ${-y * 0.06}px)`;
});