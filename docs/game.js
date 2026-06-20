const WIDTH = 960;
const HEIGHT = 720;
const GAME_W = 720;
const GAME_H = 420;
const GAME_X = 120;
const GAME_Y = 116;
const SLOW_MODE_LENGTH = 3650;
const FALLING_THINGS = ['🚕', '🛵', '💿', '📱', '💾', '🧃'];
const MELODY = [330, 392, 494, 523, 494, 392, 440, 587];

class CyberCatScene extends Phaser.Scene {
  constructor() {
    super('CyberCatScene');
    this.score = 0;
    this.level = 1;
    this.running = false;
    this.slowModeUntil = 0;
    this.lastMeowMilestone = 0;
    this.melodyStep = 0;
  }

  preload() {
    this.load.image('cat', 'assets/nubsterz-cat.png');
  }

  create() {
    this.createArcadeCabinet();
    this.createGameWorld();
    this.createHud();
    this.createControls();
    this.createAudio();
    this.resetGame();
  }

  createArcadeCabinet() {
    this.add.rectangle(WIDTH / 2, HEIGHT / 2, 880, 690, 0x160725)
      .setStrokeStyle(8, 0x2c0a48);
    this.add.rectangle(WIDTH / 2, 58, 780, 78, 0x050014)
      .setStrokeStyle(7, 0xfaff00)
      .setName('marquee-bg');
    this.add.text(WIDTH / 2, 58, 'NUBSTERZ CYBER CAT RUN', {
      fontFamily: 'Arial Black, Impact, sans-serif',
      fontSize: '32px',
      color: '#faff00',
      stroke: '#ff2bd6',
      strokeThickness: 4,
      shadow: { color: '#faff00', blur: 16, fill: true }
    }).setOrigin(0.5);

    this.add.rectangle(WIDTH / 2, 326, 782, 484, 0x02030a)
      .setStrokeStyle(12, 0x11152c);
    this.add.rectangle(WIDTH / 2, 628, 780, 142, 0x101132)
      .setStrokeStyle(4, 0x00f5ff, 0.45);

    this.add.ellipse(332, 632, 86, 54, 0x080a18).setStrokeStyle(4, 0x00f5ff, 0.55);
    this.add.rectangle(342, 600, 16, 58, 0xfaff00).setRotation(-0.28);
    this.add.circle(334, 572, 22, 0xff2bd6);
    [0x00f5ff, 0xff2bd6, 0xfaff00].forEach((color, index) => {
      this.add.circle(584 + index * 54, 626, 19, color);
      this.add.circle(584 + index * 54, 633, 19, 0x000000, 0.22);
    });
  }

  createGameWorld() {
    this.world = this.add.container(GAME_X, GAME_Y);
    this.sky = this.add.graphics();
    this.world.add(this.sky);
    this.city = this.add.graphics();
    this.world.add(this.city);
    this.road = this.add.graphics();
    this.world.add(this.road);

    this.fallingGroup = this.add.group();
    this.pilot = this.add.image(GAME_X + GAME_W / 2, GAME_Y + 336, 'cat')
      .setDisplaySize(64, 74)
      .setDepth(20);
    this.pilotName = this.add.text(this.pilot.x - 2, this.pilot.y - 48, 'Nubsterz Black Star Cat', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '14px',
      color: '#eef6ff'
    }).setDepth(21);

    this.slowOverlay = this.add.rectangle(GAME_X + GAME_W / 2, GAME_Y + GAME_H / 2, GAME_W, GAME_H, 0xfaff00, 0.12)
      .setDepth(30)
      .setVisible(false);
    this.slowText = this.add.text(GAME_X + GAME_W - 128, GAME_Y + 36, 'SLOW MODE', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '18px',
      color: '#faff00'
    }).setDepth(31).setVisible(false);

    this.add.rectangle(GAME_X + GAME_W / 2, GAME_Y + GAME_H / 2, GAME_W, GAME_H)
      .setStrokeStyle(3, 0x00f5ff, 0.35)
      .setDepth(40);
  }

  createHud() {
    this.scoreText = this.add.text(170, 558, 'Score 0', this.hudStyle()).setOrigin(0.5);
    this.levelText = this.add.text(300, 558, 'Level 1', this.hudStyle()).setOrigin(0.5);
    this.statusText = this.add.text(540, 558, 'Status Ready', this.hudStyle()).setOrigin(0.5);
    this.guideText = this.add.text(WIDTH / 2, 682,
      'Move: Arrow keys or WASD   •   Dodge: +1   •   Glowing yarn: +5   •   Rare yarn power-up: slow mode 3.65s', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '17px',
        color: '#9defff',
        align: 'center'
      }).setOrigin(0.5);
  }

  hudStyle() {
    return {
      fontFamily: 'Arial Black, Arial, sans-serif',
      fontSize: '20px',
      color: '#e8fbff',
      backgroundColor: 'rgba(0,0,0,.42)',
      padding: { x: 14, y: 8 }
    };
  }

  createControls() {
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys('W,A,S,D');
    this.input.keyboard.on('keydown-SPACE', () => this.startGame());

    this.startButton = this.add.text(440, 624, 'START GAME', this.buttonStyle(0x00f5ff)).setOrigin(0.5).setInteractive({ useHandCursor: true });
    this.resetButton = this.add.text(530, 624, 'RESET', this.buttonStyle(0xff2bd6)).setOrigin(0.5).setInteractive({ useHandCursor: true });
    this.startButton.on('pointerdown', () => this.startGame());
    this.resetButton.on('pointerdown', () => this.resetGame());
  }

  buttonStyle(color) {
    return {
      fontFamily: 'Arial Black, Arial, sans-serif',
      fontSize: '16px',
      color: '#06111f',
      backgroundColor: Phaser.Display.Color.IntegerToColor(color).rgba,
      padding: { x: 14, y: 9 }
    };
  }

  createAudio() {
    this.audioContext = null;
    this.musicEvent = null;
  }

  ensureAudio() {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return null;
    if (!this.audioContext) this.audioContext = new AudioContext();
    if (this.audioContext.state === 'suspended') this.audioContext.resume();
    return this.audioContext;
  }

  playTone(frequency, duration = 0.12, type = 'square', volume = 0.05) {
    const audio = this.ensureAudio();
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

  startMusic() {
    if (this.musicEvent) return;
    this.ensureAudio();
    this.musicEvent = this.time.addEvent({
      delay: 150,
      loop: true,
      callback: () => {
        if (!this.running) return;
        this.playTone(MELODY[this.melodyStep % MELODY.length], 0.09, 'square', 0.025);
        if (this.melodyStep % 4 === 0) {
          this.playTone(MELODY[(this.melodyStep + 2) % MELODY.length] / 2, 0.11, 'triangle', 0.015);
        }
        this.melodyStep++;
      }
    });
  }

  stopMusic() {
    if (this.musicEvent) this.musicEvent.remove(false);
    this.musicEvent = null;
  }

  playMeow() {
    this.playTone(740, 0.08, 'square', 0.08);
    this.time.delayedCall(75, () => this.playTone(560, 0.12, 'square', 0.07));
  }

  resetGame() {
    for (const item of this.fallingGroup.getChildren()) {
      if (item.glow) item.glow.destroy();
    }
    this.fallingGroup.clear(true, true);
    this.score = 0;
    this.level = 1;
    this.running = false;
    this.slowModeUntil = 0;
    this.lastMeowMilestone = 0;
    this.melodyStep = 0;
    this.nextSpawnDelay = 700;
    this.pilot.x = GAME_X + GAME_W / 2;
    this.pilot.y = GAME_Y + 336;
    this.pilotName.setPosition(this.pilot.x - 2, this.pilot.y - 48);
    this.stopMusic();
    this.setStatus('Ready for launch');
    this.updateHud();
  }

  startGame() {
    if (this.running) return;
    this.running = true;
    this.lastSpawn = this.time.now;
    this.setStatus('Neon street dodge mode');
    this.startMusic();
  }

  update(time, delta) {
    this.drawWorld(time);
    this.updateSlowMode(time);
    if (!this.running) return;

    const dt = delta / 16.6667;
    if (this.cursors.left.isDown || this.wasd.A.isDown) this.pilot.x -= 6 * dt;
    if (this.cursors.right.isDown || this.wasd.D.isDown) this.pilot.x += 6 * dt;
    this.pilot.x = Phaser.Math.Clamp(this.pilot.x, GAME_X, GAME_X + GAME_W - 64);
    this.pilotName.setPosition(this.pilot.x - 2, this.pilot.y - 48);

    if (time - this.lastSpawn > this.nextSpawnDelay) {
      this.spawnChaosBurst();
      this.lastSpawn = time;
    }

    this.updateFallingObjects(time, dt);
  }

  updateSlowMode(time) {
    const slowMode = time < this.slowModeUntil;
    this.slowOverlay.setVisible(slowMode);
    this.slowText.setVisible(slowMode);
  }

  updateFallingObjects(time, dt) {
    const slowMode = time < this.slowModeUntil;
    const objects = [...this.fallingGroup.getChildren()];
    for (const item of objects) {
      const powerUpMultiplier = slowMode ? 0.45 : 1;
      const yarnMultiplier = item.isYarn ? 0.55 : 1;
      const speedMultiplier = powerUpMultiplier * yarnMultiplier;
      item.x += item.dx * speedMultiplier * dt;
      item.y += item.dy * speedMultiplier * dt;
      item.rotation += item.spin * speedMultiplier * dt;
      if (item.glow) item.glow.setPosition(item.x, item.y).setScale(1 + Math.sin(time * 0.008) * 0.14);

      if (item.y >= GAME_Y + GAME_H + item.size) {
        this.removeFallingObject(item);
        if (!item.isYarn) {
          this.addScore(1);
          this.setStatus('Clean dodge! +1 score.');
        }
        continue;
      }

      if (item.x < GAME_X - item.size * 2 || item.x > GAME_X + GAME_W + item.size * 2) {
        this.removeFallingObject(item);
        continue;
      }

      if (this.hitPilot(item)) this.handleHit(item, time);
    }
  }

  hitPilot(item) {
    const pilotBounds = new Phaser.Geom.Rectangle(this.pilot.x - 32, this.pilot.y - 37, 64, 74);
    const itemBounds = new Phaser.Geom.Rectangle(item.x - item.size / 2, item.y - item.size / 2, item.size, item.size);
    return Phaser.Geom.Intersects.RectangleToRectangle(pilotBounds, itemBounds);
  }

  handleHit(item, time) {
    if (item.isYarn) {
      this.removeFallingObject(item);
      this.addScore(5);
      if (Math.random() < 0.1) {
        this.slowModeUntil = time + SLOW_MODE_LENGTH;
        this.setStatus('Glowing yarn power-up! Everything slows for 3.65 seconds.');
      } else {
        this.setStatus('Caught glowing yarn! +5 score.');
      }
      return;
    }

    this.running = false;
    this.stopMusic();
    this.setStatus('Bonked in the neon street! The cat needs another try.');
  }

  spawnChaosBurst() {
    const count = Phaser.Math.Between(1, 4);
    for (let i = 0; i < count; i++) this.spawnFallingObject();
    this.nextSpawnDelay = Phaser.Math.Between(380, 1430);
  }

  spawnFallingObject() {
    const isYarn = Math.random() < 0.18;
    const size = isYarn ? 34 : Phaser.Math.Between(26, 48);
    const face = isYarn ? '🧶' : Phaser.Utils.Array.GetRandom(FALLING_THINGS);
    const angle = Phaser.Math.FloatBetween(-0.9, 0.9);
    const speed = Phaser.Math.FloatBetween(1.8, 4.5);
    const item = this.add.text(GAME_X + Phaser.Math.Between(size, GAME_W - size), GAME_Y - size, face, {
      fontFamily: 'serif',
      fontSize: `${size}px`,
      color: isYarn ? '#faff00' : '#eef6ff'
    }).setOrigin(0.5).setDepth(isYarn ? 19 : 18);

    item.size = size;
    item.dx = Math.sin(angle) * speed;
    item.dy = Math.cos(angle) * speed;
    item.spin = Phaser.Math.FloatBetween(-0.08, 0.08);
    item.isYarn = isYarn;

    if (isYarn) {
      item.glow = this.add.circle(item.x, item.y, size * 0.95, 0xfaff00, 0.28)
        .setStrokeStyle(4, 0xfaff00, 0.95)
        .setDepth(17);
    }
    this.fallingGroup.add(item);
  }

  removeFallingObject(item) {
    if (item.glow) item.glow.destroy();
    item.destroy();
  }

  addScore(points) {
    const oldScore = this.score;
    this.score += points;
    const newMilestone = Math.floor(this.score / 10);
    if (newMilestone > this.lastMeowMilestone && this.score > oldScore) {
      this.lastMeowMilestone = newMilestone;
      this.playMeow();
    }
    this.updateHud();
  }

  updateHud() {
    this.scoreText.setText(`Score ${this.score}`);
    this.levelText.setText(`Level ${this.level}`);
  }

  setStatus(text) {
    this.statusText.setText(`Status ${text}`);
  }

  drawWorld(time) {
    const frame = time / 16.6667;
    this.sky.clear();
    this.sky.fillGradientStyle(0x120018, 0x120018, 0x05030d, 0x05030d, 1, 1, 1, 1);
    this.sky.fillRect(0, 0, GAME_W, GAME_H);

    this.city.clear();
    for (let i = 0; i < 11; i++) {
      const w = 34 + (i % 4) * 18;
      const h = 80 + (i % 5) * 28;
      const x = i * 70 - 30;
      const y = 292 - h;
      this.city.fillStyle(i % 2 ? 0x04081c : 0x0e0a2a, 0.95);
      this.city.fillRect(x, y, w, h);
      this.city.fillStyle(i % 2 ? 0x00f5ff : 0xff2bd6, 1);
      for (let wy = y + 12; wy < 285; wy += 22) {
        this.city.fillRect(x + 8, wy, 8, 10);
        this.city.fillRect(x + w - 16, wy + 4, 8, 10);
      }
    }

    this.road.clear();
    this.road.fillStyle(0x060714, 1);
    this.road.fillRect(0, 292, GAME_W, 128);
    this.road.lineStyle(1, 0x00f5ff, 0.32);
    for (let x = -80; x < GAME_W + 120; x += 42) {
      this.road.beginPath();
      this.road.moveTo(GAME_W / 2, 292);
      this.road.lineTo(x + ((frame * 1.4) % 42), GAME_H);
      this.road.strokePath();
    }
    this.road.lineStyle(1, 0xff2bd6, 0.42);
    for (let y = 308; y < GAME_H; y += 22) {
      this.road.beginPath();
      this.road.moveTo(0, y + ((frame * 1.2) % 22));
      this.road.lineTo(GAME_W, y + ((frame * 1.2) % 22));
      this.road.strokePath();
    }
    this.road.fillStyle(0xfaff00, 1);
    this.road.fillRect(0, 332, GAME_W, 4);
    this.road.fillStyle(0xff2bd6, 1);
    this.road.fillRect(0, 348, GAME_W, 3);
  }
}

new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  width: WIDTH,
  height: HEIGHT,
  backgroundColor: '#050014',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  scene: CyberCatScene
});
