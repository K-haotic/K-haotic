/* Decorative Khaotic public-site constellation. NOT live LEVI telemetry.
 * No network, analytics, cookies, storage, model calls or private math.
 * Animation stops when hidden, and honors reduced-motion preferences.
 */
(() => {
  "use strict";
  const canvas = document.querySelector("[data-portal-sky]");
  if (!canvas || !canvas.getContext) return;
  const ctx = canvas.getContext("2d", { alpha: true });
  if (!ctx) return;
  const host = canvas.parentElement;
  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let width = 0, height = 0, points = [], raf = 0, running = false;
  let pointer = { x: .68, y: .43 }, last = 0;
  let seed = 23919;
  const random = () => {
    seed = (1664525 * seed + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  function layout() {
    const rect = host.getBoundingClientRect();
    width = Math.max(1, Math.round(rect.width));
    height = Math.max(1, Math.round(rect.height));
    const scale = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(width * scale);
    canvas.height = Math.round(height * scale);
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    seed = 23919;
    const n = Math.min(75, Math.max(22, Math.floor((width * height) / 19000)));
    points = Array.from({ length: n }, () => ({
      x: random() * width, y: random() * height,
      phase: random() * Math.PI * 2, radius: .6 + random() * 1.65,
      speed: .12 + random() * .65
    }));
    render(0);
  }
  function render(ms) {
    ctx.clearRect(0, 0, width, height);
    const t = motion.matches ? 0 : ms * .00019;
    const nearby = 108;
    for (let i = 0; i < points.length; i++) {
      const p = points[i];
      const x = p.x + Math.sin(t * p.speed + p.phase) * 8;
      const y = p.y + Math.cos(t * p.speed + p.phase) * 7;
      for (let j = i + 1; j < points.length; j++) {
        const q = points[j];
        const dx = q.x - p.x, dy = q.y - p.y;
        const d2 = dx * dx + dy * dy;
        if (d2 > nearby * nearby) continue;
        const alpha = Math.min(.11, (1 - Math.sqrt(d2) / nearby) * .12);
        ctx.strokeStyle = "rgba(112,222,235," + alpha.toFixed(3) + ")";
        ctx.lineWidth = .75;
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(q.x, q.y); ctx.stroke();
      }
      const dist = Math.hypot(x - pointer.x * width, y - pointer.y * height);
      const halo = Math.max(0, 1 - dist / 240);
      ctx.fillStyle = "rgba(117,248,235," + (.15 + .18 * halo).toFixed(3) + ")";
      ctx.beginPath(); ctx.arc(x, y, p.radius, 0, Math.PI * 2); ctx.fill();
    }
  }
  function tick(ms) {
    if (!running) return;
    if (ms - last >= 36) {
      render(ms);
      last = ms;
    }
    raf = requestAnimationFrame(tick);
  }
  function stop() {
    running = false;
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    render(0);
  }
  function start() {
    if (running || motion.matches || document.hidden) {
      if (motion.matches) render(0);
      return;
    }
    running = true; last = 0;
    raf = requestAnimationFrame(tick);
  }
  const onMotion = () => {
    if (motion.matches || document.hidden) stop();
    else start();
  };
  const onResize = () => {
    layout();
    if (!running) render(0);
  };
  if (typeof ResizeObserver !== "undefined") {
    const observer = new ResizeObserver(onResize);
    observer.observe(host);
  } else {
    window.addEventListener("resize", onResize, { passive: true });
  }
  host.addEventListener("pointermove", event => {
    if (motion.matches) return;
    const r = host.getBoundingClientRect();
    pointer.x = Math.min(1, Math.max(0, (event.clientX - r.left) / r.width));
    pointer.y = Math.min(1, Math.max(0, (event.clientY - r.top) / r.height));
  }, { passive: true });
  document.addEventListener("visibilitychange", onMotion);
  if (motion.addEventListener) motion.addEventListener("change", onMotion);
  else if (motion.addListener) motion.addListener(onMotion);
  layout();
  start();
})();
