/* ============================================================
   NEXTRADE PRIME — script.js
   ------------------------------------------------------------
   PRICING — change every price in ONE place here.
   Dawood: edit the numbers in PRICING below, no other file.
   ------------------------------------------------------------
   CRM INTEGRATION POINT (for later — no live endpoint yet):
   - Login form:    #login-form   (login.html)
   - Signup form:   #signup-form  (signup.html)
   - When the CRM is ready, replace the DEMO submit handlers
     in this file (handleLogin / handleSignup) with a POST to
     the CRM endpoint. Do NOT invent a CRM URL here.
   - Demo session key: localStorage "ntp_demo_session"
   ============================================================ */
const PRICING = {
  sizes: [10000, 25000, 50000, 100000, 200000],
  routes: {
    "two-step": {
      name: "2-Step Challenge",
      prices: { 10000: 49, 25000: 99, 50000: 199, 100000: 349, 200000: 549 },
      phase1: "7%", phase2: "5%", dailyLoss: "5%", maxLoss: "8%",
      leverage: "1:100", timeLimit: "No time limit", split: "80%"
    },
    "one-step": {
      name: "1-Step Challenge",
      prices: { 10000: 59, 25000: 119, 50000: 229, 100000: 399, 200000: 649 },
      phase1: "8%", phase2: "—", dailyLoss: "4%", maxLoss: "8%",
      leverage: "1:50", timeLimit: "No time limit", split: "80%"
    },
    "instant": {
      name: "Instant Funding",
      prices: { 10000: 99, 25000: 199, 50000: 349, 100000: 599, 200000: 999 },
      phase1: "8% growth target", phase2: "—", dailyLoss: "4%", maxLoss: "8%",
      leverage: "1:30", timeLimit: "No time limit", split: "80%"
    }
  }
};
const fmt$ = n => "$" + n.toLocaleString("en-US");
const fmtSize = n => "$" + (n >= 1000 ? (n / 1000) + "k" : n);

/* ---------- Mobile nav ---------- */
document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".main-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    nav.querySelectorAll("a").forEach(a => a.addEventListener("click", () => nav.classList.remove("open")));
  }

  /* ---------- Scroll reveal ---------- */
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("visible"); io.unobserve(e.target); } });
  }, { threshold: 0.12 });
  document.querySelectorAll(".reveal").forEach(el => io.observe(el));

  /* ---------- Animated counters ---------- */
  const cio = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target, target = parseFloat(el.dataset.count || "0");
      const suffix = el.dataset.suffix || "", dur = 1400, t0 = performance.now();
      const step = now => {
        const p = Math.min((now - t0) / dur, 1), eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased).toLocaleString("en-US") + suffix;
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step); cio.unobserve(el);
    });
  }, { threshold: 0.4 });
  document.querySelectorAll("[data-count]").forEach(el => cio.observe(el));

  /* ---------- FAQ accordion ---------- */
  document.querySelectorAll(".faq-item").forEach(item => {
    const q = item.querySelector(".faq-q"), a = item.querySelector(".faq-a");
    q.addEventListener("click", () => {
      const open = item.classList.contains("open");
      document.querySelectorAll(".faq-item.open").forEach(o => {
        o.classList.remove("open"); o.querySelector(".faq-a").style.maxHeight = null;
      });
      if (!open) { item.classList.add("open"); a.style.maxHeight = a.scrollHeight + "px"; }
    });
  });

  /* ---------- 3D tilt (desktop pointer only) ---------- */
  if (window.matchMedia("(pointer:fine)").matches && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    document.querySelectorAll(".tilt").forEach(card => {
      card.addEventListener("pointermove", ev => {
        const r = card.getBoundingClientRect();
        const x = (ev.clientX - r.left) / r.width - 0.5, y = (ev.clientY - r.top) / r.height - 0.5;
        card.style.transform = `perspective(900px) rotateY(${x * 7}deg) rotateX(${-y * 7}deg) translateY(-4px)`;
      });
      card.addEventListener("pointerleave", () => { card.style.transform = ""; });
    });
  }

  /* ---------- Challenge size selector ---------- */
  document.querySelectorAll("[data-route]").forEach(card => {
    const route = PRICING.routes[card.dataset.route];
    if (!route) return;
    const pills = card.querySelectorAll(".size-pill");
    const apply = size => {
      card.querySelector(".js-price").textContent = fmt$(route.prices[size]);
      card.querySelector(".js-size").textContent = fmtSize(size);
      const t1 = card.querySelector(".js-target1"); if (t1) t1.textContent = route.phase1;
      const t2 = card.querySelector(".js-target2"); if (t2) t2.textContent = route.phase2;
      const dl = card.querySelector(".js-daily"); if (dl) dl.textContent = route.dailyLoss;
      const ml = card.querySelector(".js-max"); if (ml) ml.textContent = route.maxLoss;
      const lv = card.querySelector(".js-lev"); if (lv) lv.textContent = route.leverage;
      pills.forEach(p => p.classList.toggle("active", +p.dataset.size === size));
    };
    pills.forEach(p => p.addEventListener("click", () => apply(+p.dataset.size)));
    apply(100000); /* default: $100k */
  });

  /* ---------- Ticker (indicative demo feed) ---------- */
  const ticker = document.querySelector(".ticker-track");
  if (ticker) {
    const base = [
      ["XAUUSD", 4231.40], ["EURUSD", 1.1642], ["GBPUSD", 1.3187],
      ["BTCUSD", 97420], ["ETHUSD", 3421], ["US30", 47210],
      ["NAS100", 24890], ["USDJPY", 154.32], ["GBPJPY", 203.41], ["USOIL", 71.84]
    ];
    const fmt = (s, p) => p >= 1000 ? p.toLocaleString("en-US", { maximumFractionDigits: 0 })
      : p >= 100 ? p.toFixed(2) : p.toFixed(4);
    const render = () => {
      const items = base.map(([s, p]) => {
        const chg = (Math.random() - 0.48) * (p * 0.0012);
        const np = p + chg, pct = (chg / p * 100);
        const cls = chg >= 0 ? "up" : "down", arrow = chg >= 0 ? "▲" : "▼";
        return `<span class="ticker-item"><span class="sym">${s}</span><b>${fmt(s, np)}</b><span class="${cls}">${arrow} ${Math.abs(pct).toFixed(2)}%</span></span>`;
      }).join("");
      ticker.innerHTML = items + items; /* duplicate for seamless loop */
    };
    render(); setInterval(render, 6000);
  }

  /* ---------- Hero candlestick canvas ---------- */
  const heroCv = document.getElementById("heroChart");
  if (heroCv) drawCandles(heroCv, true);
  const dashCv = document.getElementById("dashChart");
  if (dashCv) drawLine(dashCv);

  /* ---------- Demo auth ---------- */
  const loginForm = document.getElementById("login-form");
  if (loginForm) loginForm.addEventListener("submit", handleLogin);
  const signupForm = document.getElementById("signup-form");
  if (signupForm) signupForm.addEventListener("submit", handleSignup);
  const googleBtns = document.querySelectorAll(".btn-google");
  googleBtns.forEach(b => b.addEventListener("click", () => {
    showOk("Google sign-in is a visual demo here. Use the demo account below, or create a demo account with the form.");
  }));
  const logout = document.getElementById("logout-btn");
  if (logout) logout.addEventListener("click", () => {
    localStorage.removeItem("ntp_demo_session");
    window.location.href = "index.html";
  });
  /* Dashboard guard: demo only, no real session exists yet */
  if (document.body.dataset.page === "dashboard") {
    const sess = JSON.parse(localStorage.getItem("ntp_demo_session") || "null");
    const nameEl = document.getElementById("dash-name");
    if (nameEl && sess && sess.name) nameEl.textContent = sess.name.split(" ")[0];
  }
});

/* ---------- Candlestick chart (animated, canvas) ---------- */
function drawCandles(cv, animate) {
  const ctx = cv.getContext("2d");
  let candles = [], price = 100;
  const seed = () => {
    candles = [];
    for (let i = 0; i < 42; i++) {
      const o = price, drift = (Math.random() - 0.46) * 6;
      const c = o + drift, h = Math.max(o, c) + Math.random() * 3, l = Math.min(o, c) - Math.random() * 3;
      candles.push({ o, c, h, l }); price = c;
    }
  };
  const paint = () => {
    const W = cv.width = cv.clientWidth * 2, H = cv.height = 360;
    ctx.clearRect(0, 0, W, H);
    const all = candles.flatMap(k => [k.h, k.l]);
    const mn = Math.min(...all) - 2, mx = Math.max(...all) + 2;
    const y = v => H - ((v - mn) / (mx - mn)) * (H - 30) - 15;
    const bw = W / candles.length;
    candles.forEach((k, i) => {
      const x = i * bw + bw / 2, up = k.c >= k.o;
      ctx.strokeStyle = up ? "#2ECC8F" : "#FF6B6B"; ctx.fillStyle = up ? "#2ECC8F" : "#FF6B6B";
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(x, y(k.h)); ctx.lineTo(x, y(k.l)); ctx.stroke();
      const top = y(Math.max(k.o, k.c)), hgt = Math.max(3, Math.abs(y(k.o) - y(k.c)));
      ctx.fillRect(x - bw * 0.28, top, bw * 0.56, hgt);
    });
    /* last-price line */
    const last = candles[candles.length - 1].c;
    ctx.setLineDash([6, 6]); ctx.strokeStyle = "rgba(232,199,102,.7)"; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(0, y(last)); ctx.lineTo(W, y(last)); ctx.stroke();
    ctx.setLineDash([]);
  };
  seed(); paint();
  if (animate && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    setInterval(() => {
      const last = candles[candles.length - 1];
      const o = last.c, drift = (Math.random() - 0.46) * 5;
      const c = o + drift;
      candles.push({ o, c, h: Math.max(o, c) + Math.random() * 2, l: Math.min(o, c) - Math.random() * 2 });
      candles.shift(); paint();
    }, 1800);
  }
  window.addEventListener("resize", paint);
}

/* ---------- Dashboard equity line ---------- */
function drawLine(cv) {
  const ctx = cv.getContext("2d");
  const paint = () => {
    const W = cv.width = cv.clientWidth * 2, H = cv.height = 360;
    ctx.clearRect(0, 0, W, H);
    const pts = [100000, 100420, 100180, 101050, 100760, 101980, 102640, 102310, 103480, 104020, 103760, 104320];
    const mn = 99800, mx = 105000;
    const x = i => (i / (pts.length - 1)) * (W - 20) + 10;
    const y = v => H - ((v - mn) / (mx - mn)) * (H - 40) - 20;
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, "rgba(232,199,102,.35)"); grad.addColorStop(1, "rgba(232,199,102,0)");
    ctx.beginPath(); ctx.moveTo(x(0), y(pts[0]));
    pts.forEach((p, i) => ctx.lineTo(x(i), y(p)));
    ctx.lineTo(x(pts.length - 1), H); ctx.lineTo(x(0), H); ctx.closePath();
    ctx.fillStyle = grad; ctx.fill();
    ctx.beginPath(); ctx.moveTo(x(0), y(pts[0]));
    pts.forEach((p, i) => ctx.lineTo(x(i), y(p)));
    ctx.strokeStyle = "#E8C766"; ctx.lineWidth = 3; ctx.lineJoin = "round"; ctx.stroke();
    ctx.beginPath(); ctx.arc(x(pts.length - 1), y(pts[pts.length - 1]), 7, 0, Math.PI * 2);
    ctx.fillStyle = "#E8C766"; ctx.fill();
    ctx.beginPath(); ctx.arc(x(pts.length - 1), y(pts[pts.length - 1]), 12, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(232,199,102,.5)"; ctx.lineWidth = 2; ctx.stroke();
  };
  paint(); window.addEventListener("resize", paint);
}

/* ---------- Demo auth handlers (NO backend — CRM replaces these) ---------- */
function showErr(msg) {
  const e = document.getElementById("form-error"), o = document.getElementById("form-ok");
  if (o) o.classList.remove("show");
  if (e) { e.textContent = msg; e.classList.add("show"); }
}
function showOk(msg) {
  const e = document.getElementById("form-error"), o = document.getElementById("form-ok");
  if (e) e.classList.remove("show");
  if (o) { o.textContent = msg; o.classList.add("show"); }
}
function demoLogin(name, email) {
  localStorage.setItem("ntp_demo_session", JSON.stringify({ name, email, at: Date.now() }));
  window.location.href = "dashboard.html";
}
function handleLogin(ev) {
  ev.preventDefault();
  const email = document.getElementById("login-email").value.trim();
  const pass = document.getElementById("login-password").value;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return showErr("Please enter a valid email address.");
  if (pass.length < 6) return showErr("Password must be at least 6 characters.");
  /* DEMO ONLY: any valid email + 6-char password opens the demo dashboard. */
  showOk("Demo sign-in successful — opening your demo dashboard…");
  setTimeout(() => demoLogin(email.split("@")[0].replace(/[._]/g, " "), email), 700);
}
function handleSignup(ev) {
  ev.preventDefault();
  const name = document.getElementById("signup-name").value.trim();
  const email = document.getElementById("signup-email").value.trim();
  const pass = document.getElementById("signup-password").value;
  const plan = document.getElementById("signup-plan");
  if (name.length < 2) return showErr("Please enter your full name.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return showErr("Please enter a valid email address.");
  if (pass.length < 6) return showErr("Choose a password of at least 6 characters.");
  showOk("Demo account created" + (plan && plan.value ? " — " + plan.value + " selected" : "") + ". Opening your demo dashboard…");
  setTimeout(() => demoLogin(name, email), 700);
}
