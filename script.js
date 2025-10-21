(function () {
  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");

  // --- World config (kept tiny & clear) ---
  const WORLD = {
    w: canvas.width,
    h: canvas.height,
    g: 0.12, // gravity strength (tweak later)
  };

  // --- Ship state (simple MVP) ---
  const ship = {
    x: WORLD.w * 0.2,
    y: WORLD.h * 0.5,
    angle: -Math.PI / 2, // facing up
    vx: 0,
    vy: 0,
    thrusting: false,
    rotation: 0, // -1 left, +1 right
    size: 16,
  };

  // --- Input ---
  const keys = new Set();
  window.addEventListener("keydown", (e) => keys.add(e.key.toLowerCase()));
  window.addEventListener("keyup",   (e) => keys.delete(e.key.toLowerCase()));

  function handleInput() {
    ship.thrusting = keys.has("arrowup") || keys.has("w");
    ship.rotation  = (keys.has("arrowleft") || keys.has("a") ? -1 : 0) +
                     (keys.has("arrowright") || keys.has("d") ?  1 : 0);

    if (keys.has("r")) reset();
  }

  // --- Reset to a known state ---
  function reset() {
    ship.x = WORLD.w * 0.2;
    ship.y = WORLD.h * 0.5;
    ship.vx = 0;
    ship.vy = 0;
    ship.angle = -Math.PI / 2;
  }

  // --- Physics tick ---
  const THRUST = 0.22;
  const ROT_SPEED = 0.045;
  function update(dt) {
    handleInput();

    // rotate
    ship.angle += ship.rotation * ROT_SPEED;

    // thrust
    if (ship.thrusting) {
      ship.vx += Math.cos(ship.angle) * THRUST;
      ship.vy += Math.sin(ship.angle) * THRUST;
    }

    // gravity (downwards)
    ship.vy += WORLD.g;

    // integrate
    ship.x += ship.vx;
    ship.y += ship.vy;

    // simple screen bounds (wrap horizontally, bounce vertically for MVP)
    if (ship.x < 0) ship.x += WORLD.w;
    if (ship.x > WORLD.w) ship.x -= WORLD.w;

    if (ship.y > WORLD.h - ship.size) {
      ship.y = WORLD.h - ship.size;
      ship.vy *= -0.4; // soft bounce
    }
    if (ship.y < ship.size) {
      ship.y = ship.size;
      ship.vy *= -0.4;
    }
  }

  // --- Drawing helpers ---
  function clear() {
    ctx.clearRect(0, 0, WORLD.w, WORLD.h);
  }

  function drawShip(s) {
    ctx.save();
    ctx.translate(s.x, s.y);
    ctx.rotate(s.angle);

    // body
    ctx.beginPath();
    ctx.moveTo(s.size, 0);
    ctx.lineTo(-s.size * 0.6, s.size * 0.7);
    ctx.lineTo(-s.size * 0.2, 0);
    ctx.lineTo(-s.size * 0.6, -s.size * 0.7);
    ctx.closePath();
    ctx.fillStyle = "#16c1ff";
    ctx.fill();

    // flame when thrusting
    if (s.thrusting) {
      ctx.beginPath();
      ctx.moveTo(-s.size * 0.6, 0);
      ctx.lineTo(-s.size * 1.0, 0);
      ctx.strokeStyle = "#ffcc66";
      ctx.lineWidth = 3;
      ctx.stroke();
    }

    ctx.restore();
  }

  function drawHUD() {
    ctx.fillStyle = "#e8eefc";
    ctx.font = "14px ui-monospace, SFMono-Regular, Menlo, monospace";
    ctx.fillText(`vx: ${ship.vx.toFixed(2)}  vy: ${ship.vy.toFixed(2)}`, 12, 20);
  }

  function render() {
    clear();
    drawShip(ship);
    drawHUD();
  }

  // --- Main loop ---
  let last = performance.now();
  function loop(ts) {
    const dt = Math.min(33, ts - last) / 16.67; // normalize to ~60fps
    last = ts;
    update(dt);
    render();
    requestAnimationFrame(loop);
  }

  // --- Start ---
  console.log("Game loop initialized.");
  reset();
  requestAnimationFrame(loop);
})();