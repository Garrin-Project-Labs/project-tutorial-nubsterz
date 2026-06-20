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
      <p class="eyebrow">Nubsterz's neon future city</p>
      <h1>Nubsterz Cyber Cat Run</h1>
      <p id="tagline">The cat stays. The game is now a neon cyberpunk street.</p>
    </section>

    <section class="game-card" aria-label="Randomized cat dodge game">
      <canvas id="game" width="720" height="420"></canvas>
      <div class="hud">
        <span>Score: <strong id="score">0</strong></span>
        <span>Level: <strong id="level">1</strong></span>
        <span>Status: <strong id="status">Unfinished</strong></span>
      </div>
      <div class="controls">
        <button id="start">Start cyberpunk dodge</button>
        <button id="reset">Reset</button>
      </div>
      <p class="hint">Move with arrow keys or WASD. Missed objects are +1, glowing yellow yarn is +5, and rare yarn power-ups slow everything for 3.65 seconds.</p>
    </section>

    <section class="quests">
      <h2>Tutorial quests</h2>
      <ol>
        <li><strong>Make it yours:</strong> title and welcome text updated for Nubsterz.</li>
        <li><strong>Choose controls:</strong> arrow keys and WASD now move the pilot.</li>
        <li><strong>Pick the vibe:</strong> the cat stayed, but the rest became banana space disco chaos.</li>
        <li><strong>Add a twist:</strong> falling things now arrive in surprise-sized bursts.</li>
        <li><strong>Make your own quest:</strong> space theme replaced with a neon cyberpunk street.</li>
        <li><strong>Nubsterz's bonus quest:</strong> glowing yellow yarn gives +5, rare slow mode lasts 3.65 seconds, and every 10 points plays a cute beep-meow over fast arcade music.</li>
      </ol>
      <p>Back in Discord, ask the bot: <code>@G-Claw-Bot give me a quest</code>.</p>
    </section>
  </main>
  <script src="game.js"></script>
</body>
</html>
