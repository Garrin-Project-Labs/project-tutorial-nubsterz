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
const fallingThings = ['🍌', '🪩', '🦆', '🌮', '🧃', '😎'];
const keys = new Set();
const moveKeys = new Set(['ArrowLeft', 'ArrowRight', 'a', 'A', 'd', 'D']);

function reset() {
  pilot.x = canvas.width / 2 - pilot.w / 2;
  meteors = [];
  score = 0;
  level = 1;
  frame = 0;
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
  meteors.push({ x: Math.random() * (canvas.width - size), y: -size, size, speed: 2.2 + Math.random(), face });
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

  if (timestamp - lastSpawn > 900) {
    spawnMeteor();
    lastSpawn = timestamp;
  }

  for (const meteor of meteors) meteor.y += meteor.speed;
  meteors = meteors.filter(m => m.y < canvas.height + m.size);

  for (const meteor of meteors) {
    if (hit(pilot, meteor)) {
      running = false;
      statusEl.textContent = 'Bonked by space chaos! The cat needs another try.';
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
  sky.addColorStop(0, '#3b0f70');
  sky.addColorStop(0.48, '#09264f');
  sky.addColorStop(1, '#ff4fd8');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = 'rgba(251, 255, 18, .75)';
  for (let i = 0; i < 54; i++) {
    const x = (i * 97 + frame * 0.15) % canvas.width;
    const y = (i * 53 + frame * 0.35) % canvas.height;
    ctx.fillRect(x, y, 3, 3);
  }

  ctx.fillStyle = 'rgba(255, 79, 216, .22)';
  for (let i = 0; i < 9; i++) {
    const x = (i * 83 + frame * 0.55) % canvas.width;
    ctx.beginPath();
    ctx.arc(x, 52 + i * 34, 12 + (i % 3) * 5, 0, Math.PI * 2);
    ctx.fill();
  }

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
    ctx.fillText(meteor.face, meteor.x, meteor.y + meteor.size);
  }

  if (!running) {
    ctx.fillStyle = 'rgba(255,255,255,.84)';
    ctx.font = '18px sans-serif';
    ctx.fillText('Cat unchanged. Everything else: randomized.', 24, 36);
  }
}

startBtn.addEventListener('click', () => {
  if (running) return;
  running = true;
  statusEl.textContent = 'Banana space disco mode';
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
