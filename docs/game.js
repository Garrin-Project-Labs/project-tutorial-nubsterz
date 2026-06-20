const canvas = document.querySelector('#game');
const ctx = canvas.getContext('2d');
const scoreEl = document.querySelector('#score');
const levelEl = document.querySelector('#level');
const statusEl = document.querySelector('#status');
const startBtn = document.querySelector('#start');
const resetBtn = document.querySelector('#reset');

const catImage = new Image();
catImage.src = 'assets/nubsterz-cat.png';
catImage.addEventListener('load', draw);

const pilot = { x: 340, y: 326, w: 64, h: 74, name: 'Nubsterz Black Star Cat' };
let meteors = [];
let score = 0;
let level = 1;
let running = false;
let lastSpawn = 0;
let frame = 0;
let nextSpawnDelay = 700;
const fallingThings = ['🚕', '🛵', '💿', '📱', '💾', '🧃'];
const keys = new Set();
const moveKeys = new Set(['ArrowLeft', 'ArrowRight', 'a', 'A', 'd', 'D']);

function reset() {
  pilot.x = canvas.width / 2 - pilot.w / 2;
  meteors = [];
  score = 0;
  level = 1;
  frame = 0;
  nextSpawnDelay = 700;
  running = false;
  statusEl.textContent = 'Ready for launch';
  updateHud();
  draw();
}

function updateHud() {
  scoreEl.textContent = score;
  levelEl.textContent = level;
}

function spawnMeteor() {
  const size = 26 + Math.random() * 22;
  const face = fallingThings[Math.floor(Math.random() * fallingThings.length)];
  const angle = -0.9 + Math.random() * 1.8;
  const speed = 1.8 + Math.random() * 2.7;
  meteors.push({
    x: Math.random() * (canvas.width - size),
    y: -size,
    size,
    dx: Math.sin(angle) * speed,
    dy: Math.cos(angle) * speed,
    spin: -0.08 + Math.random() * 0.16,
    tilt: 0,
    face
  });
}

function spawnChaosBurst() {
  const count = 1 + Math.floor(Math.random() * 4);
  for (let i = 0; i < count; i++) spawnMeteor();
  nextSpawnDelay = 380 + Math.random() * 1050;
}

function hit(a, b) {
  return a.x < b.x + b.size && a.x + a.w > b.x && a.y < b.y + b.size && a.y + a.h > b.y;
}

function step(timestamp) {
  if (!running) return;
  frame++;

  if (keys.has('ArrowLeft') || keys.has('a') || keys.has('A')) pilot.x -= 6;
  if (keys.has('ArrowRight') || keys.has('d') || keys.has('D')) pilot.x += 6;
  pilot.x = Math.max(0, Math.min(canvas.width - pilot.w, pilot.x));

  if (timestamp - lastSpawn > nextSpawnDelay) {
    spawnChaosBurst();
    lastSpawn = timestamp;
  }

  for (const meteor of meteors) {
    meteor.x += meteor.dx;
    meteor.y += meteor.dy;
    meteor.tilt += meteor.spin;
  }
  meteors = meteors.filter(m => m.y < canvas.height + m.size && m.x > -m.size * 2 && m.x < canvas.width + m.size * 2);

  for (const meteor of meteors) {
    if (hit(pilot, meteor)) {
      running = false;
      statusEl.textContent = 'Bonked in the neon street! The cat needs another try.';
      draw();
      return;
    }
  }

  draw();
  requestAnimationFrame(step);
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const sky = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  sky.addColorStop(0, '#120018');
  sky.addColorStop(0.45, '#10124a');
  sky.addColorStop(1, '#05030d');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#060714';
  ctx.fillRect(0, 292, canvas.width, 128);

  ctx.strokeStyle = 'rgba(0, 245, 255, .32)';
  ctx.lineWidth = 1;
  for (let x = -80; x < canvas.width + 120; x += 42) {
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 292);
    ctx.lineTo(x + ((frame * 1.4) % 42), canvas.height);
    ctx.stroke();
  }

  ctx.strokeStyle = 'rgba(255, 43, 214, .42)';
  for (let y = 308; y < canvas.height; y += 22) {
    ctx.beginPath();
    ctx.moveTo(0, y + ((frame * 1.2) % 22));
    ctx.lineTo(canvas.width, y + ((frame * 1.2) % 22));
    ctx.stroke();
  }

  for (let i = 0; i < 11; i++) {
    const w = 34 + (i % 4) * 18;
    const h = 80 + (i % 5) * 28;
    const x = i * 70 - 30;
    const y = 292 - h;
    ctx.fillStyle = i % 2 ? 'rgba(4, 8, 28, .95)' : 'rgba(14, 10, 42, .95)';
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = i % 2 ? '#00f5ff' : '#ff2bd6';
    for (let wy = y + 12; wy < 285; wy += 22) {
      ctx.fillRect(x + 8, wy, 8, 10);
      ctx.fillRect(x + w - 16, wy + 4, 8, 10);
    }
  }

  ctx.fillStyle = '#faff00';
  ctx.fillRect(0, 332, canvas.width, 4);
  ctx.fillStyle = '#ff2bd6';
  ctx.fillRect(0, 348, canvas.width, 3);

  if (catImage.complete) {
    ctx.drawImage(catImage, pilot.x, pilot.y, pilot.w, pilot.h);
  } else {
    ctx.font = '34px serif';
    ctx.fillText('🐈‍⬛', pilot.x, pilot.y + pilot.h);
  }

  ctx.fillStyle = '#eef6ff';
  ctx.font = '14px sans-serif';
  ctx.fillText(pilot.name, pilot.x - 2, pilot.y - 8);

  for (const meteor of meteors) {
    ctx.font = `${meteor.size}px serif`;
    ctx.save();
    ctx.translate(meteor.x + meteor.size / 2, meteor.y + meteor.size / 2);
    ctx.rotate(meteor.tilt);
    ctx.fillText(meteor.face, -meteor.size / 2, meteor.size / 2);
    ctx.restore();
  }

  if (!running) {
    ctx.fillStyle = 'rgba(255,255,255,.84)';
    ctx.font = '18px sans-serif';
    ctx.fillText('Neon street loaded. Cat unchanged.', 24, 36);
  }
}

startBtn.addEventListener('click', () => {
  if (running) return;
  running = true;
  statusEl.textContent = 'Neon street dodge mode';
  requestAnimationFrame(step);
});
resetBtn.addEventListener('click', reset);
window.addEventListener('keydown', event => {
  if (!moveKeys.has(event.key)) return;
  event.preventDefault();
  keys.add(event.key);
});
window.addEventListener('keyup', event => keys.delete(event.key));
reset();
