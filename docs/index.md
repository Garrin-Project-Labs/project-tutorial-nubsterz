<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Nubsterz Cyber Cat Run</title>
  <link rel="stylesheet" href="game.css" />
</head>
<body>
  <main class="shell">
    <section class="hero">
      <p class="eyebrow">8-bit neon arcade</p>
      <h1>Nubsterz Cyber Cat Run</h1>
      <p id="tagline">Dodge the chaos, catch glowing yarn, and chase a bigger score.</p>
    </section>

    <section class="game-card arcade-cabinet" aria-label="Nubsterz Cyber Cat Run arcade game">
      <div class="marquee">NUBSTERZ // CYBER CAT RUN</div>
      <canvas id="game" width="720" height="420"></canvas>
      <div class="hud">
        <span>Score <strong id="score">0</strong></span>
        <span>Level <strong id="level">1</strong></span>
        <span>Status <strong id="status">Ready</strong></span>
      </div>
      <div class="controls">
        <button id="start">Start Game</button>
        <button id="reset">Reset</button>
      </div>
      <div class="quick-guide" aria-label="How to play">
        <p><strong>Move:</strong> Arrow keys or WASD</p>
        <p><strong>Dodge:</strong> missed objects are +1</p>
        <p><strong>Catch:</strong> glowing yellow yarn is +5</p>
        <p><strong>Power-up:</strong> rare yarn slows everything for 3.65 seconds</p>
      </div>
    </section>
  </main>
  <script src="game.js"></script>
</body>
</html>
