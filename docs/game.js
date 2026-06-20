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
const fallingThings = ['🚕', '🛵', '💿', '📱', '💾', '🧃'];
const keys = new Set();
const moveKeys = new Set(['ArrowLeft', 'ArrowRight', 'a', 'A', 'd', 'D']);
const slowModeLength = 3650;
const melody = [330, 392, 494, 523, 494, 392, 440, 587];

let meteors = [];
let score = 0;
let level = 1;
let running = false;
let lastSpawn = 0;
let frame = 0;
let nextSpawnDelay = 700;
let slowModeUntil = 0;
let lastMeowMilestone = 0;
let audioContext;
let musicTimer;
let melodyStep = 0;

function reset() {
  pilot.x = canvas.width / 2 - pilot.w / 2;
  meteors = [];
  score = 0;
  level = 1;
  frame = 0;
  nextSpawnDelay = 700;
  slowModeUntil = 0;
  lastMeowMilestone = 0;
  running = false;
  statusEl.textContent = 'Ready for launch';
  stopMusic();
  updateHud();
  draw();
}

function updateHud() {
  scoreEl.textContent = score;
  levelEl.textContent = level;
}

function ensureAudio() {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return null;
  if (!audioContext) audioContext = new AudioContext();
  if (audioContext.state === 'suspended') audioContext.resume();
  return audioContext;
}

function playTone(frequency, duration = 0.12, type = 'square', volume = 0.05) {
  const audio = ensureAudio();
  if (!audio) return;
  const oscillator = audio.createOscillator();
  const gain = audio.createGain();
  oscillator.type = type;
  oscillator.frequency.value = frequency;
  gain.gain.setValueAtTime(volume, audio.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + duration);
  oscillator.connect(gain);
  gain.connect(audio.destination);
  oscillator.start();
  oscillator.stop(audio.currentTime + duration);
}

function playMeow() {
  playTone(740, 0.08, 'square', 0.08);
  setTimeout(() => playTone(560, 0.12, 'square', 0.07), 75);
}

function checkScoreMilestone(oldScore) {
  const newMilestone = Math.floor(score / 10);
  if (newMilestone > lastMeowMilestone && score > oldScore) {
    lastMeowMilestone = newMilestone;
    playMeow();
  }
}

function addScore(points) {
  const oldScore = score;
  score += points;
  checkScoreMilestone(oldScore);
  updateHud();
}

function startMusic() {
  if (musicTimer) return;
  ensureAudio();
  musicTimer = setInterval(() => {
    if (!running) return;
    playTone(melody[melodyStep % melody.length], 0.09, 'square', 0.025);
    if (melodyStep % 4 === 0) playTone(melody[(melodyStep + 2) % melody.length] / 2, 0.11, 'triangle', 0.015);
    melodyStep++;
  }, 150);
}

function stopMusic() {
  clearInterval(musicTimer);
  musicTimer = undefined;
}

function spawnMeteor() {
  const isYarn = Math.random() < 0.18;
  const size = isYarn ? 34 : 26 + Math.random() * 22;
  const face = isYarn ? '🧶' : fallingThings[Math.floor(Math.random() * fallingThings.length)];
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
    face,
    isYarn
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

  const slowMode = timestamp < slowModeUntil;

  if (keys.has('ArrowLeft') || keys.has('a') || keys.has('A')) pilot.x -= 6;
  if (keys.has('ArrowRight') || keys.has('d') || keys.has('D')) pilot.x += 6;
  pilot.x = Math.max(0, Math.min(canvas.width - pilot.w, pilot.x));

  if (timestamp - lastSpawn > nextSpawnDelay) {
    spawnChaosBurst();
    lastSpawn = timestamp;
  }

  for (const meteor of meteors) {
    const powerUpMultiplier = slowMode ? 0.45 : 1;
    const yarnMultiplier = meteor.isYarn ? 0.55 : 1;
    const speedMultiplier = powerUpMultiplier * yarnMultiplier;
    meteor.x += meteor.dx * speedMultiplier;
    meteor.y += meteor.dy * speedMultiplier;
    meteor.tilt += meteor.spin * speedMultiplier;
  }

  const activeMeteors = [];
  for (const meteor of meteors) {
    if (meteor.y >= canvas.height + meteor.size) {
      if (!meteor.isYarn) {
        addScore(1);
        statusEl.textContent = 'Clean dodge! +1 score.';
      }
      continue;
    }
    if (meteor.x > -meteor.size * 2 && meteor.x < canvas.width + meteor.size * 2) {
      activeMeteors.push(meteor);
    }
  }
  meteors = activeMeteors;

  for (let i = meteors.length - 1; i >= 0; i--) {
    const meteor = meteors[i];
    if (!hit(pilot, meteor)) continue;

    if (meteor.isYarn) {
      addScore(5);
      meteors.splice(i, 1);
      if (Math.random() < 0.1) {
        slowModeUntil = timestamp + slowModeLength;
        statusEl.textContent = 'Glowing yarn power-up! Everything slows for 3.65 seconds.';
      } else {
        statusEl.textContent = 'Caught glowing yarn! +5 score.';
      }
      continue;
    }

    running = false;
    stopMusic();
    statusEl.textContent = 'Bonked in the neon street! The cat needs another try.';
    draw();
    return;
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

  if (slowModeUntil > performance.now()) {
    ctx.fillStyle = 'rgba(250, 255, 0, .12)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#faff00';
    ctx.font = '18px sans-serif';
    ctx.fillText('SLOW MODE', canvas.width - 128, 36);
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
    ctx.save();
    ctx.translate(meteor.x + meteor.size / 2, meteor.y + meteor.size / 2);
    ctx.rotate(meteor.tilt);
    if (meteor.isYarn) {
      const pulse = 1 + Math.sin(frame * 0.22) * 0.14;
      ctx.shadowColor = '#faff00';
      ctx.shadowBlur = 42;
      ctx.fillStyle = 'rgba(250, 255, 0, .28)';
      ctx.beginPath();
      ctx.arc(0, 0, meteor.size * 0.95 * pulse, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(250, 255, 0, .95)';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(0, 0, meteor.size * 0.7 * pulse, 0, Math.PI * 2);
      ctx.stroke();
      ctx.shadowBlur = 28;
      ctx.fillStyle = '#faff00';
    } else {
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#eef6ff';
    }
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
  startMusic();
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
