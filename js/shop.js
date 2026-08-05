(function () {
  "use strict";

  /* ---------- YEAR ---------- */
  const yr = document.getElementById("year");
  if (yr) yr.textContent = new Date().getFullYear();

  /* ---------- HEADER ---------- */
  const header = document.getElementById("header");
  window.addEventListener("scroll", () => {
    header.classList.toggle("scrolled", window.scrollY > 10);
  }, { passive: true });

  /* ---------- MOBILE NAV ---------- */
  const burger = document.getElementById("burger");
  const nav    = document.getElementById("nav");
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
  document.addEventListener("click", (e) => {
    if (nav.classList.contains("open") && !nav.contains(e.target) && !burger.contains(e.target)) closeNav();
  });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeNav(); });

  /* ---------- LANG ---------- */
  const lang    = document.getElementById("lang");
  const langBtn = document.getElementById("langBtn");
  if (langBtn) langBtn.addEventListener("click", () => lang.classList.toggle("open"));
  document.addEventListener("click", e => { if (!lang.contains(e.target)) lang.classList.remove("open"); });

  /* ---------- REVEAL ---------- */
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
  }, { threshold: 0.1 });
  document.querySelectorAll(".reveal").forEach(el => io.observe(el));

  /* ---------- COUNT-UP STATS ---------- */
  const cio = new IntersectionObserver(entries => {
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
  document.querySelectorAll("[data-count]").forEach(c => cio.observe(c));

  /* ---------- STORY PARALLAX ---------- */
  const storyParallax = document.querySelector(".story__parallax");
  function storyScroll() {
    if (!storyParallax) return;
    const wrap = storyParallax.parentElement;
    const rect = wrap.getBoundingClientRect();
    const center = (rect.top + rect.height / 2 - window.innerHeight / 2);
    storyParallax.style.transform = `translateY(${center * 0.07}px)`;
  }
  window.addEventListener("scroll", storyScroll, { passive: true });
  storyScroll();

  /* ---------- FILTER SIDEBAR TOGGLE (mobile) ---------- */
  const filterToggle = document.getElementById("filterToggle");
  const sidebar      = document.getElementById("shopSidebar");
  if (filterToggle && sidebar) {
    filterToggle.addEventListener("click", () => sidebar.classList.toggle("open"));
    document.addEventListener("click", e => {
      if (!sidebar.contains(e.target) && !filterToggle.contains(e.target)) sidebar.classList.remove("open");
    });
  }

  /* ---------- PRODUCTS DATA ---------- */
  const shopGrid = document.getElementById("shopGrid");
  const allProducts = [...document.querySelectorAll(".product")];
  const resultCount = document.getElementById("shopResultCount");
  const shopEmpty   = document.getElementById("shopEmpty");

  /* Collection cards filter shortcut */
  document.querySelectorAll(".sh-coll").forEach(card => {
    card.addEventListener("click", () => {
      const cat = card.dataset.collCat;
      document.querySelectorAll(".ftab").forEach(b => b.classList.remove("is-active"));
      const tab = document.querySelector(`.ftab[data-category="${cat}"]`);
      if (tab) { tab.classList.add("is-active"); activeCat = cat; applyFilters(); }
      document.getElementById("shopSection")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  /* View-all button */
  document.getElementById("viewAllBtn")?.addEventListener("click", () => {
    document.querySelectorAll(".ftab").forEach(b => b.classList.remove("is-active"));
    document.querySelector(".ftab[data-category='all']")?.classList.add("is-active");
    activeCat = "all"; applyFilters();
    document.getElementById("shopSection")?.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  let activeCat   = "all";
  let activePrice = "all";
  let activeLead  = "all";
  let activeSort  = "featured";
  let searchTerm  = "";

  function leadGroup(days) {
    if (days <= 5)  return "fast";
    if (days <= 10) return "standard";
    return "custom";
  }

  const shopSearch = document.getElementById("shopSearch");
  if (shopSearch) {
    shopSearch.addEventListener("input", (e) => {
      searchTerm = e.target.value.toLowerCase().trim();
      applyFilters();
    });
  }

  function applyFilters() {
    let visible = allProducts.filter(p => {
      const cat   = p.dataset.category;
      const price = +p.dataset.price;
      const lead  = leadGroup(+p.dataset.leadDays || 10);
      const name  = (p.dataset.name || "").toLowerCase();

      const catOk   = activeCat === "all"   || cat === activeCat;
      const priceOk = activePrice === "all" ||
        (activePrice === "0-100"   && price < 100)   ||
        (activePrice === "100-200" && price >= 100 && price <= 200) ||
        (activePrice === "200-999" && price > 200);
      const leadOk  = activeLead === "all"  || lead === activeLead;
      const searchOk = !searchTerm || name.includes(searchTerm);

      return catOk && priceOk && leadOk && searchOk;
    });

    // Sort
    if (activeSort === "price-asc")  visible.sort((a,b) => +a.dataset.price - +b.dataset.price);
    if (activeSort === "price-desc") visible.sort((a,b) => +b.dataset.price - +a.dataset.price);
    if (activeSort === "lead-asc")   visible.sort((a,b) => (+a.dataset.leadDays||10) - (+b.dataset.leadDays||10));

    // Show/hide
    allProducts.forEach(p => p.style.display = "none");
    visible.forEach(p => { p.style.display = ""; shopGrid.appendChild(p); });

    if (resultCount) resultCount.textContent = visible.length;
    if (shopEmpty)   shopEmpty.style.display = visible.length ? "none" : "block";
  }

  // Category filters (sidebar)
  document.querySelectorAll(".scat[data-category]").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".scat[data-category]").forEach(b => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      activeCat = btn.dataset.category;
      applyFilters();
      if (sidebar) sidebar.classList.remove("open");
    });
  });

  // Price filters
  document.querySelectorAll(".scat[data-price]").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".scat[data-price]").forEach(b => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      activePrice = btn.dataset.price;
      applyFilters();
    });
  });

  // Lead time filters
  document.querySelectorAll(".scat[data-lead]").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".scat[data-lead]").forEach(b => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      activeLead = btn.dataset.lead;
      applyFilters();
    });
  });

  // Sort
  const sortSelect = document.getElementById("sortSelect");
  if (sortSelect) sortSelect.addEventListener("change", () => { activeSort = sortSelect.value; applyFilters(); });

  // Clear filters
  const clearBtn = document.getElementById("clearFilters");
  if (clearBtn) clearBtn.addEventListener("click", () => {
    activeCat = activePrice = activeLead = "all"; activeSort = "featured";
    document.querySelectorAll(".scat").forEach(b => b.classList.remove("is-active"));
    document.querySelectorAll(".scat[data-category='all'], .scat[data-price='all'], .scat[data-lead='all']").forEach(b => b.classList.add("is-active"));
    if (sortSelect) sortSelect.value = "featured";
    applyFilters();
  });

  /* ---------- CART ---------- */
  const CART_KEY = "seashell_cart";
  let cart = {};
  try { cart = JSON.parse(localStorage.getItem(CART_KEY)) || {}; } catch(e) { cart = {}; }

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

  function saveCart() { try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch(e) {} }
  function cartQtyTotal()   { return Object.values(cart).reduce((a,i) => a+i.qty, 0); }
  function cartPriceTotal() { return Object.values(cart).reduce((a,i) => a+i.qty*i.price, 0); }

  function syncCardUI(id) {
    const card   = shopGrid.querySelector(`.product[data-id="${id}"]`);
    if (!card) return;
    const addBtn = card.querySelector(".add-btn");
    let qtyCtrl  = card.querySelector(".card-qty");
    const qty    = cart[id] ? cart[id].qty : 0;
    if (qty > 0) {
      if (addBtn) addBtn.style.display = "none";
      if (!qtyCtrl) {
        qtyCtrl = document.createElement("div");
        qtyCtrl.className = "card-qty";
        qtyCtrl.innerHTML = `<button class="card-qty__btn" data-act="minus" data-id="${id}">−</button><b class="card-qty__val">${qty}</b><button class="card-qty__btn" data-act="plus" data-id="${id}">+</button>`;
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
    fabCount.textContent = total;
    fabCount.classList.toggle("show", total > 0);
    if (subhead) subhead.textContent = total === 0 ? "No items yet" : `${total} item${total>1?"s":""}`;
    totalEl.textContent = "$" + cartPriceTotal();
    emptyMsg.style.display = keys.length ? "none" : "block";
    itemsBox.innerHTML = "";
    keys.forEach(id => {
      const it = cart[id];
      const row = document.createElement("div");
      row.className = "cart-item";
      row.innerHTML = `<img src="${it.img}" alt="${it.name}" loading="lazy"/><div class="cart-item__info"><div class="cart-item__name">${it.name}</div><div class="cart-item__price">from $${it.price} each</div><div class="cart-item__sub">Subtotal: from $${it.qty*it.price}</div></div><div class="cart-qty"><button data-act="minus" data-id="${id}">−</button><b>${it.qty}</b><button data-act="plus" data-id="${id}">+</button></div>`;
      itemsBox.appendChild(row);
    });
    saveCart();
  }

  function addToCart(p) {
    if (cart[p.id]) cart[p.id].qty++;
    else cart[p.id] = { name:p.name, price:p.price, img:p.img, qty:1 };
    renderCart();
    syncCardUI(p.id);
    fab.classList.remove("bump"); void fab.offsetWidth; fab.classList.add("bump");
  }

  function flyDot(fromEl) {
    const img = fromEl.querySelector(".product__img img");
    if (!img) return;
    const r = img.getBoundingClientRect(), t = fab.getBoundingClientRect();
    const dot = document.createElement("div");
    dot.className = "fly-dot";
    dot.style.cssText = `left:${r.left+r.width/2-6}px;top:${r.top+r.height/2-6}px`;
    document.body.appendChild(dot);
    requestAnimationFrame(() => {
      dot.style.transform = `translate(${t.left+t.width/2-(r.left+r.width/2)}px,${t.top+t.height/2-(r.top+r.height/2)}px) scale(.2)`;
      dot.style.opacity = "0";
    });
    setTimeout(() => dot.remove(), 850);
  }

  document.querySelectorAll(".product .add-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const card = btn.closest(".product");
      addToCart({ id:card.dataset.id, name:card.dataset.name, price:+card.dataset.price, img:card.querySelector("img").src });
      flyDot(card);
    });
  });

  shopGrid.addEventListener("click", e => {
    const b = e.target.closest(".card-qty__btn");
    if (!b) return;
    const id = b.dataset.id;
    if (!cart[id]) return;
    if (b.dataset.act === "plus")  cart[id].qty++;
    if (b.dataset.act === "minus") { cart[id].qty--; if (cart[id].qty<=0) delete cart[id]; }
    renderCart(); syncCardUI(id);
  });

  itemsBox.addEventListener("click", e => {
    const b = e.target.closest("button[data-act]");
    if (!b) return;
    const id = b.dataset.id;
    if (!cart[id]) return;
    if (b.dataset.act === "plus")  cart[id].qty++;
    if (b.dataset.act === "minus") { cart[id].qty--; if (cart[id].qty<=0) delete cart[id]; }
    renderCart(); syncCardUI(id);
  });

  function openCart()  { panel.classList.add("open");    overlay.classList.add("open");    }
  function closeCart() { panel.classList.remove("open"); overlay.classList.remove("open"); }
  fab.addEventListener("click", openCart);
  closeBtn.addEventListener("click", closeCart);
  overlay.addEventListener("click", closeCart);

  orderBtn.addEventListener("click", () => {
    const keys = Object.keys(cart);
    if (!keys.length) { openCart(); return; }
    const note = noteEl && noteEl.value.trim();
    const ref  = "SS-" + Date.now().toString(36).toUpperCase().slice(-5);
    let txt = `Hello Seashell! 🐚%0A%0AOrder ref: ${ref}%0A%0A*Items:*%0A`;
    keys.forEach(id => { const i=cart[id]; txt+=`• ${encodeURIComponent(i.name)} × ${i.qty} — from $${i.qty*i.price}%0A`; });
    txt += `%0A*Estimated from: $${cartPriceTotal()}*`;
    if (note) txt += `%0A%0ANote: ${encodeURIComponent(note)}`;
    txt += `%0A%0AName:%0ACountry / City:%0ADelivery preference:`;
    window.open(`https://wa.me/994508249023?text=${txt}`, "_blank");
  });

  Object.keys(cart).forEach(id => syncCardUI(id));
  renderCart();

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
    pmodalCat.textContent   = card.querySelector(".product__cat").textContent;
    pmodalName.textContent  = d.name;
    pmodalPrice.textContent = "$" + d.price;
    pmodalDesc.textContent  = d.desc || "";
    pmodalMat.textContent   = d.material || "—";
    pmodalSizes.textContent = (d.sizes||"").replace(/\|/g," · ");
    pmodalLead.textContent  = d.lead || "—";
    pmodalWA.onclick = () => {
      window.open(`https://wa.me/994508249023?text=${encodeURIComponent(`Hello Seashell! 🐚\nI'd like to order: ${d.name}\nPrice: from $${d.price}\n\nName:\nCountry / City:\nSize preference:\nColour preference:`)}`, "_blank");
    };
    pmodalAdd.onclick = () => { addToCart({id:d.id,name:d.name,price:+d.price,img:card.querySelector("img").src}); flyDot(card); closeModal(); };
    pmodal.classList.add("open");
    document.body.style.overflow = "hidden";
  }

  function closeModal() { pmodal.classList.remove("open"); document.body.style.overflow = ""; }
  pmodalClose.addEventListener("click", closeModal);
  pmodalOverlay.addEventListener("click", closeModal);
  document.addEventListener("keydown", e => { if (e.key==="Escape") closeModal(); });

  document.querySelectorAll(".product__img, .product__arrow-btn").forEach(el => {
    el.addEventListener("click", () => { const card=el.closest(".product"); if(card) openModal(card); });
  });

})();
