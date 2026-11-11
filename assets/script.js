/* ============================================================
   NEXTRADE PRIME — script.js
   ------------------------------------------------------------
   PRICING + RULES — Liberty-style rules, one config.
   Change every price/rule in ONE place here (PRICING).
   Account sizes: $5k / $10k / $25k / $50k / $100k / $150k / $200k
   2-Step: P1 8%, P2 5%, daily 4%, max 8%, min 3 days, 1:100.
     Fee = Phase 1 $10 flat + Phase 2 fee per size.
   1-Step: 8%, daily 4%, max 8%, min 3 days, 1:50.
   Instant: 8%, daily 4%, max 8%, min 3 days, 1:30.
   All: no time limit, up to 80% split.
   2-Step/1-Step: 100% fee refund on passing.
   Instant: NO refund — there is no challenge to pass.
   ------------------------------------------------------------
   CRM INTEGRATION POINT (for later — no live endpoint yet):
   - Login form:    #login-form   (login.html)
   - Signup form:   #signup-form  (signup.html)
   - Replace handleLogin / handleSignup with a POST to the
     CRM endpoint. Do NOT invent a CRM URL here.
   - Demo session key: localStorage "ntp_demo_session"
   ============================================================ */
const PRICING = {
  sizes: [5000, 10000, 25000, 50000, 100000, 150000, 200000],
  routes: {
    "two-step": {
      name: "2-Step Challenge", tag: "EVAL",
      tagline: "Best balance between flexibility and structure",
      prices: { 5000: 20, 10000: 35, 25000: 55, 50000: 85, 100000: 125, 150000: 175, 200000: 225 },
      phase1Fee: 10,
      phase2Fees: { 5000: 10, 10000: 25, 25000: 45, 50000: 75, 100000: 115, 150000: 165, 200000: 215 },
      phase1: "8%", phase2: "5%", dailyLoss: "4%", maxLoss: "8%",
      minDays: 3, leverage: "1:100", timeLimit: "Unlimited", refund: "100%", split: "80%"
    },
    "one-step": {
      name: "1-Step Challenge", tag: "FASTEST PATH",
      tagline: "Fastest path to a funded account",
      prices: { 5000: 39, 10000: 59, 25000: 129, 50000: 229, 100000: 419, 150000: 649, 200000: 849 },
      phase1: "8%", phase2: "—", dailyLoss: "4%", maxLoss: "8%",
      minDays: 3, leverage: "1:50", timeLimit: "Unlimited", refund: "100%", split: "80%"
    },
    "instant": {
      name: "Instant Funding", tag: "FASTEST",
      tagline: "Start earning from day one — no challenge to pass",
      prices: { 5000: 95, 10000: 155, 25000: 255, 50000: 395, 100000: 595, 150000: 795, 200000: 995 },
      phase1: "8%", phase1Label: "8% growth target", phase2: "—", dailyLoss: "4%", maxLoss: "8%",
      minDays: 3, leverage: "1:30", timeLimit: "Unlimited", refund: null, split: "80%"
    }
  }
};
const fmt$ = n => "$" + n.toLocaleString("en-US");
const fmtSize = n => "$" + (n >= 1000 ? (n / 1000) + "k" : n);

/* ---------- Live instrument data (indicative demo feed) ---------- */
const INSTRUMENTS = {
  "XAU/USD": { price: 4231.40, chg: 0.42, dec: 2, label: "Gold" },
  "EUR/USD": { price: 1.1642, chg: -0.18, dec: 4, label: "Euro / US Dollar" },
  "GBP/USD": { price: 1.3187, chg: 0.24, dec: 4, label: "Pound / US Dollar" },
  "BTC/USD": { price: 97420, chg: 1.12, dec: 0, label: "Bitcoin" },
  "USD/JPY": { price: 154.32, chg: -0.09, dec: 2, label: "US Dollar / Yen" },
  "WTI":     { price: 71.84, chg: 0.61, dec: 2, label: "Crude Oil" }
};
const PROFILES = {
  "futures": { title: "Futures & Indices", desc: "US30, NAS100, S&P 500 and index futures — deep liquidity, tight spreads, and clean trend days for disciplined traders.", chips: ["US30", "NAS100", "S&P 500", "GER40", "UK100"] },
  "forex": { title: "Forex", desc: "Majors and minors around the clock. Trade the pairs you know, with 1:100 leverage on the 2-Step route and no time limit.", chips: ["EUR/USD", "GBP/USD", "USD/JPY", "AUD/USD", "USD/CAD"] },
  "crypto": { title: "Crypto", desc: "BTC, ETH and the majors — volatile, fast, and always moving. Same loss limits, same discipline, no exceptions.", chips: ["BTC/USD", "ETH/USD", "SOL/USD", "XRP/USD"] },
  "commodity": { title: "Commodity", desc: "Gold, silver and oil — the markets where patience pays. XAU/USD is the most-traded instrument on NEXTRADE PRIME.", chips: ["XAU/USD", "XAG/USD", "WTI", "Brent"] },
  "stocks": { title: "Stocks", desc: "Single-name US equities and CFDs on the world's biggest companies — trade the names you follow every day.", chips: ["AAPL", "NVDA", "TSLA", "MSFT", "AMZN"] }
};

document.addEventListener("DOMContentLoaded", () => {
  /* ---------- Mobile nav ---------- */
  const toggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".main-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    nav.querySelectorAll("a").forEach(a => a.addEventListener("click", () => nav.classList.remove("open")));
  }

  /* ---------- Scroll reveal (fast — never dim on first paint) ---------- */
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("visible"); io.unobserve(e.target); } });
  }, { threshold: 0.12 });
  document.querySelectorAll(".reveal").forEach(el => io.observe(el));
  setTimeout(() => {
    document.querySelectorAll(".reveal").forEach(el => {
      if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add("visible");
    });
  }, 600);

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
    if (!q || !a) return;
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

  /* ---------- Challenge size selector (route cards) ---------- */
  let currentSize = 100000, currentRoute = "two-step";
  document.querySelectorAll("[data-route]").forEach(card => {
    const route = PRICING.routes[card.dataset.route];
    if (!route) return;
    const pills = card.querySelectorAll(".size-pill");
    const apply = size => {
      currentSize = size; currentRoute = card.dataset.route;
      const priceEl = card.querySelector(".js-price"); if (priceEl) priceEl.textContent = fmt$(route.prices[size]);
      const sizeEl = card.querySelector(".js-size"); if (sizeEl) sizeEl.textContent = fmtSize(size);
      const t1 = card.querySelector(".js-target1"); if (t1) t1.textContent = route.phase1Label || route.phase1;
      const t2 = card.querySelector(".js-target2"); if (t2) t2.textContent = route.phase2;
      const dl = card.querySelector(".js-daily"); if (dl) dl.textContent = route.dailyLoss;
      const ml = card.querySelector(".js-max"); if (ml) ml.textContent = route.maxLoss;
      const lv = card.querySelector(".js-lev"); if (lv) lv.textContent = route.leverage;
      const bd = card.querySelector(".js-breakdown");
      if (bd) bd.textContent = route.phase1Fee ? `Phase 1 ${fmt$(route.phase1Fee)} + Phase 2 ${fmt$(route.phase2Fees[size])}` : "One-time fee";
      pills.forEach(p => p.classList.toggle("active", +p.dataset.size === size));
      renderCompare(currentRoute, size);
      renderConfigurator();
    };
    pills.forEach(p => p.addEventListener("click", () => apply(+p.dataset.size)));
    apply(100000);
  });

  /* ---------- Route tabs (comparison table) ---------- */
  const tabBtns = document.querySelectorAll(".route-tab");
  tabBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      tabBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      currentRoute = btn.dataset.routeTab;
      renderCompare(currentRoute, currentSize);
      renderConfigurator();
      /* keep the matching route card in sync */
      document.querySelectorAll("[data-route]").forEach(card => {
        if (card.dataset.route === currentRoute) {
          card.querySelectorAll(".size-pill").forEach(p => p.classList.toggle("active", +p.dataset.size === currentSize));
        }
      });
    });
  });
  renderCompare("two-step", 100000);

  /* ---------- Configurator (Find Your Fit) ---------- */
  const cfgRouteBtns = document.querySelectorAll(".cfg-route");
  cfgRouteBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      cfgRouteBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      currentRoute = btn.dataset.cfgRoute;
      renderConfigurator();
      renderCompare(currentRoute, currentSize);
    });
  });
  const cfgSizeBtns = document.querySelectorAll(".cfg-size");
  cfgSizeBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      cfgSizeBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      currentSize = +btn.dataset.cfgSize;
      renderConfigurator();
      renderCompare(currentRoute, currentSize);
    });
  });
  renderConfigurator();

  /* ---------- Live price dashboard ---------- */
  const dashTabs = document.querySelectorAll(".inst-tab");
  const dashPrice = document.getElementById("inst-price");
  const dashChg = document.getElementById("inst-chg");
  const dashLabel = document.getElementById("inst-label");
  const renderInst = key => {
    const d = INSTRUMENTS[key];
    if (!d || !dashPrice) return;
    dashPrice.textContent = d.price.toLocaleString("en-US", { minimumFractionDigits: d.dec, maximumFractionDigits: d.dec });
    dashChg.textContent = (d.chg >= 0 ? "▲ +" : "▼ ") + Math.abs(d.chg).toFixed(2) + "%";
    dashChg.className = d.chg >= 0 ? "up" : "down";
    if (dashLabel) dashLabel.textContent = d.label + " · " + key;
    dashTabs.forEach(b => b.classList.toggle("active", b.dataset.inst === key));
  };
  dashTabs.forEach(b => b.addEventListener("click", () => renderInst(b.dataset.inst)));
  renderInst("XAU/USD");
  updateHeroXau();
  /* jitter the dashboard + snapshot every 6s so it feels live */
  setInterval(() => {
    Object.keys(INSTRUMENTS).forEach(k => {
      const d = INSTRUMENTS[k];
      d.price = d.price * (1 + (Math.random() - 0.5) * 0.0012);
      d.chg = d.chg + (Math.random() - 0.5) * 0.08;
    });
    const active = document.querySelector(".inst-tab.active");
    if (active) renderInst(active.dataset.inst);
    updateHeroXau();
    renderSnapshot();
  }, 6000);

  /* ---------- Hero XAU glass card — same live source as ticker/dashboard ---------- */
function updateHeroXau() {
  const d = INSTRUMENTS["XAU/USD"];
  const v = document.getElementById("hero-xau-value");
  const c = document.getElementById("hero-xau-chg");
  if (!d || !v) return;
  v.textContent = "$" + d.price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (c) {
    c.textContent = (d.chg >= 0 ? "▲ +" : "▼ ") + Math.abs(d.chg).toFixed(2) + "%";
    c.style.color = d.chg >= 0 ? "var(--green)" : "var(--red)";
  }
}

/* ---------- Market snapshot ---------- */
  renderSnapshot();
  setInterval(renderSnapshot, 30000);

  /* ---------- Financial profiles tabs ---------- */
  const profTabs = document.querySelectorAll(".prof-tab");
  const profTitle = document.getElementById("prof-title");
  const profDesc = document.getElementById("prof-desc");
  const profChips = document.getElementById("prof-chips");
  const renderProfile = key => {
    const p = PROFILES[key]; if (!p || !profTitle) return;
    profTitle.textContent = p.title;
    profDesc.textContent = p.desc;
    profChips.innerHTML = p.chips.map(c => `<span class="chip">${c}</span>`).join("");
    profTabs.forEach(b => b.classList.toggle("active", b.dataset.prof === key));
  };
  profTabs.forEach(b => b.addEventListener("click", () => renderProfile(b.dataset.prof)));
  renderProfile("forex");

  /* ---------- Ticker (indicative demo feed) ---------- */
  const ticker = document.querySelector(".ticker-track");
  if (ticker) {
    const fmt = (s, p) => p >= 1000 ? p.toLocaleString("en-US", { maximumFractionDigits: 0 })
      : p >= 100 ? p.toFixed(2) : p.toFixed(4);
    const render = () => {
      const items = Object.entries(INSTRUMENTS).map(([s, d]) => {
        const chg = (Math.random() - 0.48) * (d.price * 0.0012);
        const np = d.price + chg, pct = (chg / d.price * 100);
        const cls = chg >= 0 ? "up" : "down", arrow = chg >= 0 ? "▲" : "▼";
        return `<span class="ticker-item"><span class="sym">${s}</span><b>${fmt(s, np)}</b><span class="${cls}">${arrow} ${Math.abs(pct).toFixed(2)}%</span></span>`;
      }).join("");
      ticker.innerHTML = items + items;
    };
    render(); setInterval(render, 6000);
  }

  /* ---------- Dashboard equity line ---------- */
  const dashCv = document.getElementById("dashChart");
  if (dashCv) drawLine(dashCv);

  /* ---------- Demo auth ---------- */
  const loginForm = document.getElementById("login-form");
  if (loginForm) loginForm.addEventListener("submit", handleLogin);
  const signupForm = document.getElementById("signup-form");
  if (signupForm) signupForm.addEventListener("submit", handleSignup);
  document.querySelectorAll(".btn-google").forEach(b => b.addEventListener("click", () => {
    showOk("Google sign-in is a visual demo here. Use the demo account below, or create a demo account with the form.");
  }));
  const logout = document.getElementById("logout-btn");
  if (logout) logout.addEventListener("click", () => {
    localStorage.removeItem("ntp_demo_session");
    window.location.href = "index.html";
  });
  if (document.body.dataset.page === "dashboard") {
    const sess = JSON.parse(localStorage.getItem("ntp_demo_session") || "null");
    const nameEl = document.getElementById("dash-name");
    if (nameEl && sess && sess.name) nameEl.textContent = sess.name.split(" ")[0];
  }
});

/* ---------- Comparison table (rendered from PRICING) ---------- */
function renderCompare(routeKey, size) {
  const body = document.getElementById("compare-body");
  if (!body) return;
  const r = PRICING.routes[routeKey];
  const fee = r.phase1Fee
    ? `${fmt$(r.prices[size])} total · Phase 1 ${fmt$(r.phase1Fee)} + Phase 2 ${fmt$(r.phase2Fees[size])}`
    : `${fmt$(r.prices[size])} one-time`;
  const target = r.phase2 !== "—" ? `Phase 1 ${r.phase1} · Phase 2 ${r.phase2}` : (r.phase1Label || r.phase1);
  const rows = [
    ["Account size", fmtSize(size)],
    ["Fee", fee],
    ["Profit target", target],
    ["Max daily loss", r.dailyLoss],
    ["Max loss", r.maxLoss],
    ["Minimum trading days", r.minDays + " days"],
    ["Time limit", r.timeLimit],
    ["Leverage", r.leverage],
    ...(r.refund ? [["Fee refund", r.refund + " on passing"]] : []),
    ["Profit split", "Up to " + r.split]
  ];
  body.innerHTML = rows.map(([k, v]) => `<tr><td>${k}</td><td><strong>${v}</strong></td></tr>`).join("");
  const title = document.getElementById("compare-title");
  if (title) title.textContent = r.name + " — " + fmtSize(size) + " account";
}

/* ---------- Configurator (Find Your Fit) ---------- */
function renderConfigurator() {
  const out = document.getElementById("cfg-out");
  if (!out) return;
  const r = PRICING.routes[document.querySelector(".cfg-route.active")?.dataset.cfgRoute || "two-step"];
  const size = +document.querySelector(".cfg-size.active")?.dataset.cfgSize || 100000;
  const target = r.phase2 !== "—" ? `Phase 1 ${r.phase1} · Phase 2 ${r.phase2}` : (r.phase1Label || (r.phase1 + " (one phase)"));
  const feeLine = r.phase1Fee
    ? `${fmt$(r.prices[size])} total — Phase 1 ${fmt$(r.phase1Fee)} + Phase 2 ${fmt$(r.phase2Fees[size])}`
    : `${fmt$(r.prices[size])} one-time`;
  out.innerHTML = `
    <div class="cfg-row"><span>Route</span><strong>${r.name}</strong></div>
    <div class="cfg-row"><span>Account size</span><strong>${fmtSize(size)}</strong></div>
    <div class="cfg-row"><span>Fee</span><strong>${feeLine}</strong></div>
    <div class="cfg-row"><span>Profit target</span><strong>${target}</strong></div>
    <div class="cfg-row"><span>Daily loss / Max loss</span><strong>${r.dailyLoss} / ${r.maxLoss}</strong></div>
    <div class="cfg-row"><span>Minimum trading days</span><strong>${r.minDays} days</strong></div>
    <div class="cfg-row"><span>Leverage</span><strong>${r.leverage}</strong></div>
    <div class="cfg-row"><span>Profit split</span><strong>Up to ${r.split}</strong></div>
    <a class="btn btn-gold btn-lg" style="width:100%;margin-top:18px" href="signup.html">Start ${r.name} — ${fmt$(r.prices[size])} →</a>`;
}

/* ---------- Market snapshot ---------- */
function renderSnapshot() {
  const list = document.getElementById("snap-list");
  const ts = document.getElementById("snap-time");
  if (ts) ts.textContent = "LIVE · " + new Date().toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", second: "2-digit" });
  if (!list) return;
  list.innerHTML = Object.entries(INSTRUMENTS).map(([s, d]) => {
    const cls = d.chg >= 0 ? "up" : "down";
    const arrow = d.chg >= 0 ? "▲" : "▼";
    const price = d.price.toLocaleString("en-US", { minimumFractionDigits: d.dec, maximumFractionDigits: d.dec });
    return `<li><span class="snap-sym">${s}</span><span class="snap-price">${price}</span><span class="${cls}">${arrow} ${Math.abs(d.chg).toFixed(2)}%</span></li>`;
  }).join("");
}

/* ---------- Dashboard equity line ---------- */
function drawLine(cv) {
  const ctx = cv.getContext("2d");
  const paint = () => {
    const W = cv.width = cv.clientWidth * 2, H = cv.height = Math.max(360, (cv.clientHeight || 180) * 2);
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
