/* ===== Seashell — interactions & animations ===== */
(function () {
  "use strict";

  /* ---------- PRELOADER ---------- */
  const preloader = document.getElementById("preloader");
  const loadCount = document.getElementById("loadCount");
  let n = 0;
  const tick = setInterval(() => {
    n = Math.min(100, n + Math.floor(Math.random() * 12) + 4);
    if (loadCount) loadCount.textContent = n;
    if (n >= 100) {
      clearInterval(tick);
      setTimeout(() => {
        preloader.classList.add("done");
        document.querySelector(".hero").classList.add("in");
      }, 350);
    }
  }, 120);

  /* ---------- YEAR ---------- */
  const yr = document.getElementById("year");
  if (yr) yr.textContent = new Date().getFullYear();

  /* ---------- HEADER + SCROLL PROGRESS ---------- */
  const header = document.getElementById("header");
  const progress = document.getElementById("scrollProgress");
  const navLinks = document.querySelectorAll(".nav__link");
  const sections = [...document.querySelectorAll("section[id]")];

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
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- MOBILE NAV ---------- */
  const burger = document.getElementById("burger");
  const nav = document.getElementById("nav");
  burger.addEventListener("click", () => {
    burger.classList.toggle("open");
    nav.classList.toggle("open");
  });
  nav.querySelectorAll("a").forEach(a =>
    a.addEventListener("click", () => { burger.classList.remove("open"); nav.classList.remove("open"); })
  );

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
  const io = new IntersectionObserver((entries) => {
    entries.forEach(en => {
      if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
    });
  }, { threshold: 0.14 });
  document.querySelectorAll(".reveal, .reveal-img").forEach(el => io.observe(el));

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

  const fab = document.getElementById("cartFab");
  const fabCount = document.getElementById("cartCount");
  const panel = document.getElementById("cartPanel");
  const overlay = document.getElementById("cartOverlay");
  const itemsBox = document.getElementById("cartItems");
  const emptyMsg = document.getElementById("cartEmpty");
  const totalEl = document.getElementById("cartTotal");
  const closeBtn = document.getElementById("cartClose");
  const orderBtn = document.getElementById("cartOrder");

  function saveCart() { try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch (e) {} }

  function cartQtyTotal() { return Object.values(cart).reduce((a, i) => a + i.qty, 0); }
  function cartPriceTotal() { return Object.values(cart).reduce((a, i) => a + i.qty * i.price, 0); }

  function renderCart() {
    const keys = Object.keys(cart);
    fabCount.textContent = cartQtyTotal();
    fabCount.classList.toggle("show", cartQtyTotal() > 0);
    totalEl.textContent = "$" + cartPriceTotal();
    emptyMsg.style.display = keys.length ? "none" : "block";
    itemsBox.innerHTML = "";
    keys.forEach(id => {
      const it = cart[id];
      const row = document.createElement("div");
      row.className = "cart-item";
      row.innerHTML =
        `<img src="${it.img}" alt="${it.name}" />
         <div class="cart-item__info"><h4>${it.name}</h4><span>$${it.price}</span></div>
         <div class="cart-qty">
           <button data-act="minus" data-id="${id}">−</button>
           <b>${it.qty}</b>
           <button data-act="plus" data-id="${id}">+</button>
         </div>`;
      itemsBox.appendChild(row);
    });
    saveCart();
  }

  function addToCart(p) {
    if (cart[p.id]) cart[p.id].qty++;
    else cart[p.id] = { name: p.name, price: p.price, img: p.img, qty: 1 };
    renderCart();
    fab.classList.remove("bump"); void fab.offsetWidth; fab.classList.add("bump");
  }

  function flyDot(fromEl) {
    const img = fromEl.querySelector(".product__img img");
    if (!img) return;
    const r = img.getBoundingClientRect(), t = fab.getBoundingClientRect();
    const dot = document.createElement("div");
    dot.className = "fly-dot";
    dot.style.left = (r.left + r.width / 2 - 8) + "px";
    dot.style.top = (r.top + r.height / 2 - 8) + "px";
    document.body.appendChild(dot);
    requestAnimationFrame(() => {
      dot.style.transform = `translate(${t.left + 28 - (r.left + r.width / 2)}px,${t.top + 28 - (r.top + r.height / 2)}px) scale(.3)`;
      dot.style.opacity = "0";
    });
    setTimeout(() => dot.remove(), 850);
  }

  document.querySelectorAll(".product .add-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const card = btn.closest(".product");
      addToCart({
        id: card.dataset.id,
        name: card.dataset.name,
        price: +card.dataset.price,
        img: card.querySelector("img").getAttribute("src")
      });
      flyDot(card);
      btn.classList.add("added");
      setTimeout(() => btn.classList.remove("added"), 1200);
    });
  });

  itemsBox.addEventListener("click", e => {
    const b = e.target.closest("button");
    if (!b) return;
    const id = b.dataset.id;
    if (b.dataset.act === "plus") cart[id].qty++;
    if (b.dataset.act === "minus") { cart[id].qty--; if (cart[id].qty <= 0) delete cart[id]; }
    renderCart();
  });

  function openCart() { panel.classList.add("open"); overlay.classList.add("open"); }
  function closeCart() { panel.classList.remove("open"); overlay.classList.remove("open"); }
  fab.addEventListener("click", openCart);
  closeBtn.addEventListener("click", closeCart);
  overlay.addEventListener("click", closeCart);

  orderBtn.addEventListener("click", () => {
    const keys = Object.keys(cart);
    if (!keys.length) { openCart(); return; }
    let txt = "Hello Seashell! 🐚 I'd like to order:%0A%0A";
    keys.forEach(id => {
      const i = cart[id];
      txt += `• ${encodeURIComponent(i.name)} × ${i.qty} — $${i.price * i.qty}%0A`;
    });
    txt += `%0AEstimated total: $${cartPriceTotal()}%0A%0AName:%0ACountry:`;
    window.open(`https://wa.me/994508249023?text=${txt}`, "_blank");
  });

  renderCart();

  /* ---------- INSTAGRAM EMBEDS ---------- */
  function processIG() { if (window.instgrm && window.instgrm.Embeds) window.instgrm.Embeds.process(); }
  window.addEventListener("load", () => setTimeout(processIG, 600));
})();
