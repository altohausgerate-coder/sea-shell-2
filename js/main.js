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
      if (s.offsetParent === null) continue;
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

  /* ---------- ATELIER IMAGE SEQUENCE ---------- */
  const atelier = document.querySelector("[data-atelier]");
  if (atelier) {
    const frame = atelier.querySelector(".atelier__frame");
    const image = atelier.querySelector("#atelierImage");
    const caption = atelier.querySelector("#atelierCaption");
    const switches = [...atelier.querySelectorAll(".atelier__switch")];

    const selectStage = (button) => {
      if (button.classList.contains("is-active")) return;
      const nextSrc = button.dataset.atelierImage;
      if (!nextSrc) return;

      switches.forEach((item) => {
        const active = item === button;
        item.classList.toggle("is-active", active);
        item.setAttribute("aria-selected", String(active));
      });
      frame.classList.add("is-switching");

      const nextImage = new Image();
      const showStage = () => {
        image.src = nextSrc;
        image.alt = button.dataset.atelierAlt || "Seashell studio process";
        caption.textContent = button.dataset.atelierCaption || "Made with care in the Seashell atelier.";
        requestAnimationFrame(() => frame.classList.remove("is-switching"));
      };
      nextImage.addEventListener("load", showStage, { once: true });
      nextImage.addEventListener("error", showStage, { once: true });
      nextImage.src = nextSrc;
    };

    switches.forEach((button, index) => {
      button.addEventListener("click", () => selectStage(button));
      button.addEventListener("keydown", (event) => {
        if (!["ArrowDown", "ArrowRight", "ArrowUp", "ArrowLeft", "Home", "End"].includes(event.key)) return;
        event.preventDefault();
        const nextIndex = event.key === "Home" ? 0 : event.key === "End" ? switches.length - 1 : (index + (event.key === "ArrowDown" || event.key === "ArrowRight" ? 1 : -1) + switches.length) % switches.length;
        switches[nextIndex].focus();
        selectStage(switches[nextIndex]);
      });
    });
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

  /* ---------- PREMIUM LOCATION MAP ---------- */
  (function () {
    const section = document.getElementById("location");
    const locRoadmap = document.getElementById("locRoadmap");
    if (!section || !locRoadmap) return;

    const paths = [...locRoadmap.querySelectorAll(".loc-route")];
    const labels = [...locRoadmap.querySelectorAll(".loc-map-label")];
    const nodes = [...locRoadmap.querySelectorAll(".loc-node")];
    const copyEls = [...locRoadmap.querySelectorAll(".loc-copy .eyebrow, .loc-copy h2, .loc-copy p")];
    const shell = locRoadmap.querySelector(".loc-shell");
    const pin = locRoadmap.querySelector(".loc-pin");
    const card = locRoadmap.querySelector(".loc-info-card");
    const cardItems = card ? [...card.querySelectorAll(".loc-info-card__list li, .loc-info-card__btns .btn")] : [];
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    paths.forEach(path => {
      const len = path.getTotalLength ? path.getTotalLength() : 1200;
      path.style.strokeDasharray = len;
      path.style.strokeDashoffset = len;
    });

    function markInView() {
      section.classList.add("in-view");
      locRoadmap.classList.add("in-view");
    }

    function revealWithoutGsap() {
      markInView();
      paths.forEach((path, index) => {
        path.style.transition = `stroke-dashoffset 1.6s cubic-bezier(.16,1,.3,1) ${index * 160}ms`;
        path.style.strokeDashoffset = "0";
      });
    }

    if (reduceMotion) {
      revealWithoutGsap();
      return;
    }

    if (typeof gsap !== "undefined") {
      if (typeof ScrollTrigger !== "undefined") {
        gsap.registerPlugin(ScrollTrigger);
      }

      const tl = gsap.timeline({
        paused: true,
        defaults: { ease: "power3.out" },
        onStart: markInView
      });

      tl.from(section, { autoAlpha: 0, y: 38, duration: .9 }, 0)
        .from(copyEls, { autoAlpha: 0, y: 24, stagger: .1, duration: .72 }, .12)
        .from(shell, { autoAlpha: 0, scale: .72, y: 30, rotateX: 10, duration: 1.1, ease: "back.out(1.45)" }, .26)
        .to(paths, { strokeDashoffset: 0, duration: 1.55, stagger: .18, ease: "power2.out" }, .48)
        .from(pin, { autoAlpha: 0, y: -92, scale: .78, duration: .82, ease: "bounce.out" }, .86)
        .from(nodes, { autoAlpha: 0, scale: .25, transformOrigin: "50% 50%", stagger: .09, duration: .45 }, .96)
        .from(labels, { autoAlpha: 0, y: 18, scale: .96, stagger: .13, duration: .58 }, 1.08)
        .from(card, { autoAlpha: 0, scale: .72, y: 30, transformOrigin: "50% 50%", duration: .78, ease: "back.out(1.25)" }, 1.32)
        .from(cardItems, { autoAlpha: 0, y: 13, stagger: .1, duration: .42 }, 1.52);

      if (typeof ScrollTrigger !== "undefined") {
        ScrollTrigger.create({
          trigger: section,
          start: "top 74%",
          once: true,
          onEnter: () => tl.play()
        });
      }

      const locObs = new IntersectionObserver(entries => {
        if (!entries[0].isIntersecting) return;
        locObs.disconnect();
        tl.play();
      }, { threshold: 0.12, rootMargin: "0px 0px -70px 0px" });
      locObs.observe(section);
    } else {
      const locObs = new IntersectionObserver(entries => {
        if (!entries[0].isIntersecting) return;
        locObs.disconnect();
        revealWithoutGsap();
      }, { threshold: 0.12, rootMargin: "0px 0px -70px 0px" });
      locObs.observe(section);
    }
  })();

  /* ---------- CIRCULAR 3D GALLERY ---------- */
  (function () {
    const section = document.querySelector(".circular-section");
    const scene = document.getElementById("circularGalleryScene");
    if (!section || !scene) return;

    const cards = [...scene.querySelectorAll(".circular-card")];
    const total = cards.length;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let rotation = 0;
    let targetRotation = 0;
    let isScrolling = false;
    let scrollTimer = null;
    let raf = null;

    function radius() {
      const vw = window.innerWidth;
      if (vw < 560) return 360;
      if (vw < 900) return 470;
      return Math.min(680, Math.max(520, vw * 0.44));
    }

    function layout() {
      const r = radius();
      const angle = 360 / total;
      cards.forEach((card, index) => {
        card.style.transform = `rotateY(${index * angle}deg) translateZ(${r}px)`;
      });
    }

    function updateOpacity() {
      const angle = 360 / total;
      cards.forEach((card, index) => {
        const raw = (index * angle + rotation) % 360;
        const normalized = Math.abs(raw > 180 ? 360 - raw : raw);
        const opacity = Math.max(.24, 1 - normalized / 160);
        card.style.opacity = opacity.toFixed(3);
      });
    }

    function sectionProgress() {
      const rect = section.getBoundingClientRect();
      const travel = section.offsetHeight - window.innerHeight;
      if (travel <= 0) return 0;
      return Math.min(1, Math.max(0, -rect.top / travel));
    }

    function onScroll() {
      isScrolling = true;
      targetRotation = sectionProgress() * 720;
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => { isScrolling = false; }, 160);
    }

    function tick() {
      if (!reduceMotion && !isScrolling) targetRotation += .026;
      rotation += (targetRotation - rotation) * .08;
      scene.style.transform = `rotateY(${rotation}deg)`;
      updateOpacity();
      raf = requestAnimationFrame(tick);
    }

    layout();
    updateOpacity();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", layout);
    onScroll();
    tick();

    const galleryIO = new IntersectionObserver(entries => {
      if (!entries[0].isIntersecting) return;
      cards.forEach((card, index) => {
        card.animate(
          [
            { opacity: 0, transform: `${card.style.transform} scale(.82)` },
            { opacity: card.style.opacity || 1, transform: `${card.style.transform} scale(1)` }
          ],
          { duration: 780, delay: index * 35, easing: "cubic-bezier(.16,1,.3,1)", fill: "backwards" }
        );
      });
      galleryIO.disconnect();
    }, { threshold: .18 });
    galleryIO.observe(section);

    window.addEventListener("pagehide", () => {
      if (raf) cancelAnimationFrame(raf);
      clearTimeout(scrollTimer);
    });
  })();

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
