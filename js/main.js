/* ===== Seashell — interactions & animations ===== */
(function () {
  "use strict";

  /* ---------- PRELOADER — fast hide ---------- */
  const preloader = document.getElementById("preloader");
  const loadCount = document.getElementById("loadCount");
  if (preloader) {
    if (loadCount) loadCount.textContent = 100;
    setTimeout(() => {
      preloader.classList.add("done");
      const hero = document.querySelector(".hero");
      if (hero) hero.classList.add("in");
    }, 400);
  }

  /* ---------- YEAR ---------- */
  const yr = document.getElementById("year");
  if (yr) yr.textContent = new Date().getFullYear();

  /* ---------- HEADER + SCROLL PROGRESS ---------- */
  const header = document.getElementById("header");
  const progress = document.getElementById("scrollProgress");
  const navLinks = document.querySelectorAll(".nav__link");
  const sections = [...document.querySelectorAll("section[id]")];

  const storyParallax = document.querySelector(".story__parallax");

  function onScroll() {
    const y = window.scrollY;
    header.classList.toggle("scrolled", y > 40);
    const h = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = (y / h) * 100 + "%";
    // active link
    let current = "";
    for (const s of sections) {
      if (y >= s.offsetTop - 200) current = s.id;
    }
    navLinks.forEach(l => l.classList.toggle("active", l.getAttribute("href") === "#" + current));
    // story image parallax
    if (storyParallax) {
      const wrap = storyParallax.parentElement;
      const rect = wrap.getBoundingClientRect();
      const center = (rect.top + rect.height / 2 - window.innerHeight / 2);
      storyParallax.style.transform = `translateY(${center * 0.07}px)`;
    }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- MOBILE NAV ---------- */
  const burger = document.getElementById("burger");
  const nav = document.getElementById("nav");
  const closeNav = () => { burger.classList.remove("open"); nav.classList.remove("open"); document.body.style.overflow = ""; };
  burger.addEventListener("click", (e) => {
    e.stopPropagation();
    const open = nav.classList.toggle("open");
    burger.classList.toggle("open", open);
    document.body.style.overflow = open ? "hidden" : "";
  });
  nav.querySelectorAll("a").forEach(a => a.addEventListener("click", closeNav));
  const navClose = document.getElementById("navClose");
  if (navClose) navClose.addEventListener("click", closeNav);
  /* tap outside / Escape closes */
  document.addEventListener("click", (e) => {
    if (nav.classList.contains("open") && !nav.contains(e.target) && !burger.contains(e.target)) closeNav();
  });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeNav(); });

  /* ---------- LANGUAGE ---------- */
  const lang = document.getElementById("lang");
  const langBtn = document.getElementById("langBtn");
  const langLabel = document.getElementById("langLabel");
  const langMenu = document.getElementById("langMenu");

  function applyLang(code) {
    const dict = I18N[code] || I18N.en;
    document.querySelectorAll("[data-i18n]").forEach(el => {
      const key = el.getAttribute("data-i18n");
      if (dict[key] !== undefined) el.textContent = dict[key];
    });
    document.documentElement.lang = code;
    document.documentElement.setAttribute("data-lang", code);
    langLabel.textContent = LANG_LABEL[code];
    langMenu.querySelectorAll("li").forEach(li =>
      li.classList.toggle("active", li.dataset.lang === code)
    );
    try { localStorage.setItem("seashell_lang", code); } catch (e) {}
  }
  langBtn.addEventListener("click", e => { e.stopPropagation(); lang.classList.toggle("open"); });
  document.addEventListener("click", () => lang.classList.remove("open"));
  langMenu.querySelectorAll("li").forEach(li =>
    li.addEventListener("click", () => { applyLang(li.dataset.lang); lang.classList.remove("open"); })
  );
  let saved = "en";
  try { saved = localStorage.getItem("seashell_lang") || "en"; } catch (e) {}
  applyLang(saved);

  /* ---------- REVEAL ON SCROLL ---------- */
  const revealEls = document.querySelectorAll(".reveal, .reveal-img");
  const io = new IntersectionObserver((entries) => {
    entries.forEach(en => {
      if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
    });
  }, { threshold: 0, rootMargin: "0px 0px -8% 0px" });
  revealEls.forEach(el => io.observe(el));

  /* Safety net: reveal anything already in/above the viewport (fast scroll / mobile) */
  function revealVisible() {
    const vh = window.innerHeight;
    revealEls.forEach(el => {
      if (el.classList.contains("in")) return;
      const r = el.getBoundingClientRect();
      if (r.top < vh * 0.92) { el.classList.add("in"); io.unobserve(el); }
    });
  }
  window.addEventListener("scroll", revealVisible, { passive: true });
  window.addEventListener("load", revealVisible);
  revealVisible();

  /* ---------- COUNT-UP STATS ---------- */
  const counters = document.querySelectorAll("[data-count]");
  const cio = new IntersectionObserver((entries) => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      const el = en.target;
      const target = +el.dataset.count;
      const suffix = el.dataset.suffix || "";
      let cur = 0;
      const step = Math.max(1, Math.round(target / 45));
      const t = setInterval(() => {
        cur += step;
        if (cur >= target) { cur = target; clearInterval(t); }
        el.textContent = cur + suffix;
      }, 26);
      cio.unobserve(el);
    });
  }, { threshold: 0.5 });
  counters.forEach(c => cio.observe(c));

  /* ---------- BUBBLES ---------- */
  const bubbles = document.getElementById("bubbles");
  if (bubbles) {
    for (let i = 0; i < 16; i++) {
      const b = document.createElement("span");
      b.className = "bubble";
      const size = Math.random() * 26 + 6;
      b.style.width = b.style.height = size + "px";
      b.style.left = Math.random() * 100 + "%";
      b.style.setProperty("--drift", (Math.random() * 80 - 40) + "px");
      b.style.animationDuration = (Math.random() * 10 + 10) + "s";
      b.style.animationDelay = (Math.random() * 12) + "s";
      b.style.opacity = (Math.random() * 0.4 + 0.2).toFixed(2);
      bubbles.appendChild(b);
    }
  }

  /* ---------- GALLERY FILTER ---------- */
  const filters = document.querySelectorAll(".filter");
  const cards = document.querySelectorAll(".card");
  filters.forEach(f => f.addEventListener("click", () => {
    filters.forEach(x => x.classList.remove("is-active"));
    f.classList.add("is-active");
    const cat = f.dataset.filter;
    cards.forEach(c => {
      const show = cat === "all" || c.dataset.cat === cat;
      c.classList.toggle("hide", !show);
    });
  }));

  /* ---------- LIGHTBOX ---------- */
  const lb = document.getElementById("lightbox");
  const lbImg = document.getElementById("lbImg");
  const lbClose = document.getElementById("lbClose");
  const lbPrev = document.getElementById("lbPrev");
  const lbNext = document.getElementById("lbNext");
  let visible = [], idx = 0;

  function openLb(card) {
    visible = [...cards].filter(c => !c.classList.contains("hide"));
    idx = visible.indexOf(card);
    show();
    lb.classList.add("open");
  }
  function show() {
    const img = visible[idx].querySelector("img");
    lbImg.src = img.src; lbImg.alt = img.alt;
  }
  cards.forEach(c => c.addEventListener("click", () => openLb(c)));
  lbClose.addEventListener("click", () => lb.classList.remove("open"));
  lb.addEventListener("click", e => { if (e.target === lb) lb.classList.remove("open"); });
  lbPrev.addEventListener("click", () => { idx = (idx - 1 + visible.length) % visible.length; show(); });
  lbNext.addEventListener("click", () => { idx = (idx + 1) % visible.length; show(); });
  document.addEventListener("keydown", e => {
    if (!lb.classList.contains("open")) return;
    if (e.key === "Escape") lb.classList.remove("open");
    if (e.key === "ArrowLeft") lbPrev.click();
    if (e.key === "ArrowRight") lbNext.click();
  });

  /* ---------- CUSTOM CURSOR ---------- */
  const cursor = document.getElementById("cursor");
  if (matchMedia("(hover:hover) and (pointer:fine)").matches) {
    let cx = 0, cy = 0, tx = 0, ty = 0;
    window.addEventListener("mousemove", e => { tx = e.clientX; ty = e.clientY; });
    (function loop() {
      cx += (tx - cx) * 0.18; cy += (ty - cy) * 0.18;
      cursor.style.transform = `translate(${cx}px,${cy}px) translate(-50%,-50%)`;
      requestAnimationFrame(loop);
    })();
    document.querySelectorAll("[data-cursor='hover'], a, button").forEach(el => {
      el.addEventListener("mouseenter", () => cursor.classList.add("hover"));
      el.addEventListener("mouseleave", () => cursor.classList.remove("hover", "view"));
    });
    document.querySelectorAll("[data-cursor='view']").forEach(el => {
      el.addEventListener("mouseenter", () => { cursor.classList.add("view"); cursor.classList.remove("hover"); });
      el.addEventListener("mouseleave", () => cursor.classList.remove("view"));
    });
  }

  /* ---------- ORDER FORM -> WHATSAPP ---------- */
  const form = document.getElementById("orderForm");
  form.addEventListener("submit", e => {
    e.preventDefault();
    const d = new FormData(form);
    const msg =
      `Hello Seashell! 🐚%0A%0A` +
      `Name: ${encodeURIComponent(d.get("name") || "")}%0A` +
      `Country: ${encodeURIComponent(d.get("country") || "")}%0A` +
      `Interested in: ${encodeURIComponent(d.get("interest") || "")}%0A` +
      `Message: ${encodeURIComponent(d.get("message") || "")}`;
    window.open(`https://wa.me/994508249023?text=${msg}`, "_blank");
  });

  /* ---------- SHOP CART ---------- */
  const CART_KEY = "seashell_cart";
  let cart = {};
  try { cart = JSON.parse(localStorage.getItem(CART_KEY)) || {}; } catch (e) { cart = {}; }

  const fab      = document.getElementById("cartFab");
  const fabCount = document.getElementById("cartCount");
  const panel    = document.getElementById("cartPanel");
  const overlay  = document.getElementById("cartOverlay");
  const itemsBox = document.getElementById("cartItems");
  const emptyMsg = document.getElementById("cartEmpty");
  const totalEl  = document.getElementById("cartTotal");
  const subhead  = document.getElementById("cartSubhead");
  const closeBtn = document.getElementById("cartClose");
  const orderBtn = document.getElementById("cartOrder");
  const noteEl   = document.getElementById("cartNote");
  const shopGrid = document.getElementById("shopGrid");

  function saveCart() { try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch (e) {} }
  function cartQtyTotal()   { return Object.values(cart).reduce((a, i) => a + i.qty, 0); }
  function cartPriceTotal() { return Object.values(cart).reduce((a, i) => a + i.qty * i.price, 0); }

  /* Update card UI: toggle Add btn ↔ inline qty controls */
  function syncCardUI(id) {
    const card = shopGrid && shopGrid.querySelector(`.product[data-id="${id}"]`);
    if (!card) return;
    const addBtn = card.querySelector(".add-btn");
    let qtyCtrl  = card.querySelector(".card-qty");
    const qty    = cart[id] ? cart[id].qty : 0;

    if (qty > 0) {
      if (addBtn) addBtn.style.display = "none";
      if (!qtyCtrl) {
        qtyCtrl = document.createElement("div");
        qtyCtrl.className = "card-qty";
        qtyCtrl.innerHTML =
          `<button class="card-qty__btn" data-act="minus" data-id="${id}">−</button>
           <b class="card-qty__val">${qty}</b>
           <button class="card-qty__btn" data-act="plus" data-id="${id}">+</button>`;
        if (addBtn) addBtn.parentNode.insertBefore(qtyCtrl, addBtn.nextSibling);
      } else {
        qtyCtrl.querySelector(".card-qty__val").textContent = qty;
        qtyCtrl.style.display = "";
      }
    } else {
      if (addBtn) addBtn.style.display = "";
      if (qtyCtrl) qtyCtrl.style.display = "none";
    }
  }

  function renderCart() {
    const keys  = Object.keys(cart);
    const total = cartQtyTotal();
    const price = cartPriceTotal();

    /* FAB */
    fabCount.textContent = total;
    fabCount.classList.toggle("show", total > 0);

    /* Subhead */
    if (subhead) subhead.textContent = total === 0 ? "No items yet" : `${total} item${total > 1 ? "s" : ""}`;

    /* Total */
    totalEl.textContent = "$" + price;

    /* Items */
    emptyMsg.style.display = keys.length ? "none" : "block";
    itemsBox.innerHTML = "";
    keys.forEach(id => {
      const it  = cart[id];
      const sub = it.qty * it.price;
      const row = document.createElement("div");
      row.className = "cart-item";
      row.innerHTML =
        `<img src="${it.img}" alt="${it.name}" loading="lazy" />
         <div class="cart-item__info">
           <div class="cart-item__name">${it.name}</div>
           <div class="cart-item__price">from $${it.price} each</div>
           <div class="cart-item__sub">Subtotal: from $${sub}</div>
         </div>
         <div class="cart-qty">
           <button data-act="minus" data-id="${id}" aria-label="Remove one">−</button>
           <b>${it.qty}</b>
           <button data-act="plus"  data-id="${id}" aria-label="Add one">+</button>
         </div>`;
      itemsBox.appendChild(row);
    });

    saveCart();
  }

  function addToCart(p) {
    if (cart[p.id]) cart[p.id].qty++;
    else cart[p.id] = { name: p.name, price: p.price, img: p.img, qty: 1 };
    renderCart();
    syncCardUI(p.id);
    fab.classList.remove("bump"); void fab.offsetWidth; fab.classList.add("bump");
  }

  /* Fly-dot animation */
  function flyDot(fromEl) {
    const img = fromEl.querySelector(".product__img img");
    if (!img) return;
    const r = img.getBoundingClientRect();
    const t = fab.getBoundingClientRect();
    const dot = document.createElement("div");
    dot.className = "fly-dot";
    dot.style.cssText = `left:${r.left + r.width / 2 - 6}px;top:${r.top + r.height / 2 - 6}px`;
    document.body.appendChild(dot);
    requestAnimationFrame(() => {
      dot.style.transform = `translate(${t.left + t.width/2 - (r.left + r.width/2)}px,${t.top + t.height/2 - (r.top + r.height/2)}px) scale(.2)`;
      dot.style.opacity = "0";
    });
    setTimeout(() => dot.remove(), 850);
  }

  /* Add button clicks */
  document.querySelectorAll(".product .add-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const card = btn.closest(".product");
      addToCart({ id: card.dataset.id, name: card.dataset.name, price: +card.dataset.price, img: card.querySelector("img").src });
      flyDot(card);
    });
  });

  /* In-card qty controls */
  if (shopGrid) {
    shopGrid.addEventListener("click", e => {
      const b = e.target.closest(".card-qty__btn");
      if (!b) return;
      const id = b.dataset.id;
      if (!cart[id]) return;
      if (b.dataset.act === "plus")  cart[id].qty++;
      if (b.dataset.act === "minus") { cart[id].qty--; if (cart[id].qty <= 0) delete cart[id]; }
      renderCart();
      syncCardUI(id);
    });
  }

  /* Cart UI only initialises on pages that have the cart DOM (shop) */
  if (fab && panel && itemsBox && orderBtn) {

    /* Panel qty controls */
    itemsBox.addEventListener("click", e => {
      const b = e.target.closest("button[data-act]");
      if (!b) return;
      const id = b.dataset.id;
      if (!cart[id]) return;
      if (b.dataset.act === "plus")  cart[id].qty++;
      if (b.dataset.act === "minus") { cart[id].qty--; if (cart[id].qty <= 0) delete cart[id]; }
      renderCart();
      syncCardUI(id);
    });

    /* Panel open / close */
    var openCart  = function () { panel.classList.add("open");    overlay.classList.add("open");    };
    var closeCart = function () { panel.classList.remove("open"); overlay.classList.remove("open"); };
    fab.addEventListener("click", openCart);
    closeBtn.addEventListener("click", closeCart);
    overlay.addEventListener("click", closeCart);

    /* Send order via WhatsApp */
    orderBtn.addEventListener("click", () => {
      const keys = Object.keys(cart);
      if (!keys.length) { openCart(); return; }
      const note = noteEl && noteEl.value.trim();
      const ref  = "SS-" + Date.now().toString(36).toUpperCase().slice(-5);
      let txt = `Hello Seashell! 🐚%0A%0AI'd like to place a custom order.%0AOrder ref: ${ref}%0A%0A`;
      txt += `*Items:*%0A`;
      keys.forEach(id => {
        const i = cart[id];
        txt += `• ${encodeURIComponent(i.name)} × ${i.qty} — from $${i.qty * i.price}%0A`;
      });
      txt += `%0A*Estimated from: $${cartPriceTotal()}*`;
      if (note) txt += `%0A%0A*Special request:* ${encodeURIComponent(note)}`;
      txt += `%0A%0AName:%0ACountry / City:%0ADelivery preference:`;
      window.open(`https://wa.me/994508249023?text=${txt}`, "_blank");
    });

    /* Restore card UI on load */
    Object.keys(cart).forEach(id => syncCardUI(id));
    renderCart();
  }

  /* ---------- CATALOG FILTERS ---------- */
  const catalogFilters = document.querySelectorAll(".catalog-filter");
  const catalogProducts = document.querySelectorAll(".product");
  const catalogCount = document.getElementById("catalogCount");

  catalogFilters.forEach(btn => {
    btn.addEventListener("click", () => {
      catalogFilters.forEach(b => b.classList.remove("is-active"));
      btn.classList.add("is-active");

      const cat = btn.dataset.category;
      let visible = 0;
      catalogProducts.forEach(p => {
        const match = cat === "all" || p.dataset.category === cat;
        p.style.display = match ? "" : "none";
        if (match) visible++;
      });
      if (catalogCount) catalogCount.textContent = visible;
    });
  });

  /* ---------- ANIMATED ROADMAP (Process) ---------- */
  (function () {
    const stage = document.getElementById("roadmapStage");
    const path  = document.getElementById("roadmapPath");
    const milestones = document.querySelectorAll(".anim-milestone");
    if (!stage || !path) return;

    // Scroll-based path draw
    const io = new IntersectionObserver(entries => {
      if (!entries[0].isIntersecting) return;
      io.disconnect();

      // Animate path
      path.classList.add("animated");

      // Stagger milestone entrance
      milestones.forEach(m => {
        const delay = parseFloat(m.dataset.delay || "0") * 1000 + 600;
        setTimeout(() => m.classList.add("visible"), delay);
      });
    }, { threshold: 0.25 });

    io.observe(stage);
  })();

  /* ---------- LOCATION ROADMAP ---------- */
  const locRoadmap = document.getElementById("locRoadmap");
  if (locRoadmap) {
    const locObs = new IntersectionObserver(entries => {
      if (!entries[0].isIntersecting) return;
      locObs.disconnect();
      locRoadmap.classList.add("in-view");
      // Path draw
      const locPath = document.getElementById("locPath");
      if (locPath) {
        const len = 900;
        locPath.setAttribute("stroke-dasharray", len);
        locPath.setAttribute("stroke-dashoffset", len);
        setTimeout(() => {
          locPath.style.transition = "stroke-dashoffset 1.8s cubic-bezier(.4,0,.2,1)";
          locPath.setAttribute("stroke-dashoffset", "0");
        }, 300);
      }
    }, { threshold: 0.05, rootMargin: "0px 0px -50px 0px" });
    locObs.observe(locRoadmap);
  }

  /* ---------- FAN CAROUSEL ---------- */
  (function () {
    const container = document.getElementById("fanContainer");
    const dotsEl    = document.getElementById("fanDots");
    const prevBtn   = document.getElementById("fanPrev");
    const nextBtn   = document.getElementById("fanNext");
    if (!container || typeof gsap === "undefined") return;

    const cards = [...container.querySelectorAll(".fan-card")];
    const TOTAL = cards.length;
    const VISIBLE = 7;
    const HALF = 3;
    let center = HALF;
    let animating = false;
    let entered = false;

    const FAN = [
      { rot:-21, scale:.776, x:-30, y:7.3, z:1 },
      { rot:-14, scale:.850, x:-22, y:4.0, z:2 },
      { rot:-7,  scale:.935, x:-11, y:1.3, z:3 },
      { rot:0,   scale:1.0,  x:0,   y:0.0, z:10},
      { rot:7,   scale:.935, x:11,  y:1.3, z:3 },
      { rot:14,  scale:.850, x:22,  y:4.0, z:2 },
      { rot:21,  scale:.776, x:30,  y:7.3, z:1 },
    ];
    const mult = () => Math.min(1, window.innerWidth / 1024);

    function getMap(c) {
      const m = new Map();
      for (let s = 0; s < VISIBLE; s++) {
        m.set(((c + s - HALF) % TOTAL + TOTAL) % TOTAL, s);
      }
      return m;
    }

    // Build dots
    cards.forEach((_, i) => {
      const d = document.createElement("span");
      d.className = "fan-dot" + (i === center ? " active" : "");
      d.addEventListener("click", () => goTo(i));
      dotsEl.appendChild(d);
    });

    function updateDots() {
      [...dotsEl.children].forEach((d, i) => d.classList.toggle("active", i === center));
    }

    function layout(map, dir, isFirst) {
      const m = mult();
      cards.forEach((card, idx) => {
        const slot = map.get(idx);
        if (slot !== undefined) {
          const f = FAN[slot];
          const target = { x: f.x * m * 10, y: f.y * m * 5, rotation: f.rot, scale: f.scale, opacity: 1, zIndex: f.z };
          if (isFirst) {
            gsap.set(card, { x: 0, y: 120, rotation: 0, scale: .4, opacity: 0 });
            gsap.to(card, { ...target, duration: 1.2, ease: "elastic.out(1,.78)", delay: .2 + slot * .06 });
          } else {
            gsap.to(card, { ...target, duration: .5, ease: "power2.out", onComplete: () => { animating = false; } });
          }
        } else {
          const exitX = dir === "right" ? -200 : 200;
          gsap.to(card, { x: exitX, opacity: 0, scale: .4, rotation: dir === "right" ? -20 : 20, duration: .35, ease: "power2.in", zIndex: 0 });
        }
      });
    }

    function goTo(idx) {
      if (animating || idx === center) return;
      animating = true;
      const dir = ((idx - center + TOTAL) % TOTAL < TOTAL / 2) ? "right" : "left";
      center = idx;
      layout(getMap(center), dir, false);
      updateDots();
      setTimeout(() => { animating = false; }, 600);
    }

    function cycle(dir) {
      if (animating) return;
      animating = true;
      center = dir === "right" ? (center + 1) % TOTAL : (center - 1 + TOTAL) % TOTAL;
      layout(getMap(center), dir, false);
      updateDots();
      setTimeout(() => { animating = false; }, 600);
    }

    prevBtn && prevBtn.addEventListener("click", () => cycle("left"));
    nextBtn && nextBtn.addEventListener("click", () => cycle("right"));

    // Touch swipe
    let touchX = 0;
    container.addEventListener("touchstart", e => { touchX = e.touches[0].clientX; }, { passive: true });
    container.addEventListener("touchend",   e => {
      const dx = e.changedTouches[0].clientX - touchX;
      if (Math.abs(dx) > 40) cycle(dx < 0 ? "right" : "left");
    }, { passive: true });

    // Hover spread
    cards.forEach((card, idx) => {
      card.addEventListener("mouseenter", () => {
        if (animating) return;
        const map = getMap(center);
        const hovSlot = map.get(idx);
        if (hovSlot === undefined) return;
        const m = mult();
        cards.forEach((c, ci) => {
          const s = map.get(ci);
          if (s === undefined) return;
          const f = FAN[s];
          let tx = f.x * m * 10, ty = f.y * m * 5, tr = f.rot, ts = f.scale;
          const dist = s - hovSlot;
          if (s === hovSlot) { ty -= 20; ts *= 1.08; }
          else { tx += dist > 0 ? 14 * m : -14 * m; tr += dist > 0 ? 2 : -2; }
          gsap.to(c, { x: tx, y: ty, rotation: tr, scale: ts, duration: .4, ease: "power2.out", overwrite: "auto" });
        });
      });
    });

    container.addEventListener("mouseleave", () => {
      if (animating) return;
      const map = getMap(center);
      const m = mult();
      cards.forEach((c, ci) => {
        const s = map.get(ci);
        if (s === undefined) return;
        const f = FAN[s];
        gsap.to(c, { x: f.x*m*10, y: f.y*m*5, rotation: f.rot, scale: f.scale, duration: .4, ease: "power2.out", overwrite: "auto" });
      });
    });

    // Initial entrance when section visible
    const fanIO = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && !entered) {
        entered = true;
        fanIO.disconnect();
        layout(getMap(center), null, true);
      }
    }, { threshold: .2 });
    const fanSection = document.getElementById("shop");
    if (fanSection) fanIO.observe(fanSection);
  })();

  /* ---------- INSTAGRAM EMBEDS — lazy load ---------- */
  const reelsSection = document.getElementById("reels");
  if (reelsSection) {
    const igIO = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        igIO.disconnect();
        const s = document.createElement("script");
        s.src = "//www.instagram.com/embed.js";
        s.async = true;
        s.onload = () => { if (window.instgrm) window.instgrm.Embeds.process(); };
        document.body.appendChild(s);
      }
    }, { rootMargin: "200px" });
    igIO.observe(reelsSection);
  }

  /* ---------- PRODUCT MODAL ---------- */
  const pmodal        = document.getElementById("pmodal");
  const pmodalOverlay = document.getElementById("pmodalOverlay");
  const pmodalClose   = document.getElementById("pmodalClose");
  const pmodalImg     = document.getElementById("pmodalImg");
  const pmodalCat     = document.getElementById("pmodalCat");
  const pmodalName    = document.getElementById("pmodalName");
  const pmodalPrice   = document.getElementById("pmodalPriceVal");
  const pmodalDesc    = document.getElementById("pmodalDesc");
  const pmodalMat     = document.getElementById("pmodalMaterial");
  const pmodalSizes   = document.getElementById("pmodalSizes");
  const pmodalLead    = document.getElementById("pmodalLead");
  const pmodalWA      = document.getElementById("pmodalWA");
  const pmodalAdd     = document.getElementById("pmodalAdd");

  function openModal(card) {
    const d = card.dataset;
    pmodalImg.src   = card.querySelector("img").src;
    pmodalImg.alt   = d.name;
    pmodalCat.textContent   = card.querySelector(".product__cat").textContent;
    pmodalName.textContent  = d.name;
    pmodalPrice.textContent = "$" + d.price;
    pmodalDesc.textContent  = d.desc || "";
    pmodalMat.textContent   = d.material || "—";
    pmodalSizes.textContent = (d.sizes || "").replace(/\|/g, " · ");
    pmodalLead.textContent  = d.lead || "—";

    const waMsg = encodeURIComponent(
      `Hello Seashell! 🐚\nI'd like to order: ${d.name}\nPrice: from $${d.price}\n\nName:\nCountry / City:\nSize preference:\nColour preference:`
    );
    pmodalWA.onclick = () => {
      window.open(`https://wa.me/994508249023?text=${waMsg}`, "_blank");
      if (window.gtag) gtag("event", "whatsapp_click", { item_name: d.name });
    };

    pmodalAdd.onclick = () => {
      addToCart({ id: d.id, name: d.name, price: +d.price, img: card.querySelector("img").src });
      flyDot(card);
      closeModal();
    };

    pmodal.classList.add("open");
    document.body.style.overflow = "hidden";
    if (window.gtag) gtag("event", "view_item", { item_name: d.name, value: +d.price });
  }

  function closeModal() {
    pmodal.classList.remove("open");
    document.body.style.overflow = "";
  }

  if (pmodalClose)  pmodalClose.addEventListener("click", closeModal);
  if (pmodalOverlay) pmodalOverlay.addEventListener("click", closeModal);
  document.addEventListener("keydown", e => { if (e.key === "Escape") closeModal(); });

  /* Click on product image or arrow button opens modal */
  document.querySelectorAll(".product__img, .product__arrow-btn").forEach(el => {
    el.addEventListener("click", () => {
      const card = el.closest(".product");
      if (card) openModal(card);
    });
  });

  /* ---------- FAQ ACCORDION ---------- */
  document.querySelectorAll(".faq__item").forEach(item => {
    item.addEventListener("toggle", () => {
      if (item.open && window.gtag) gtag("event", "faq_open", { question: item.querySelector("summary").textContent });
    });
  });

  /* ---------- STICKY BAR ---------- */
  const stickyBar = document.getElementById("stickyBar");
  if (stickyBar) {
    let stickyShown = false;
    const stickyIO = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (!en.isIntersecting && !stickyShown) {
          stickyBar.classList.add("visible");
          stickyShown = true;
        }
      });
    }, { threshold: 0 });
    const hero = document.getElementById("home");
    if (hero) stickyIO.observe(hero);

    const stickyWA = document.getElementById("stickyWA");
    if (stickyWA) stickyWA.addEventListener("click", () => {
      if (window.gtag) gtag("event", "whatsapp_click", { source: "sticky_bar" });
    });
  }

  /* ---------- GA4 HELPERS ---------- */
  document.querySelectorAll(".wa-float, .btn--wa").forEach(el => {
    el.addEventListener("click", () => {
      if (window.gtag) gtag("event", "whatsapp_click", { source: el.className });
    });
  });

})();
