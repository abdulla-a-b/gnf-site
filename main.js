/* GOOD & FAST — interactions */
(function () {
  "use strict";

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- scroll reveal ---------- */
  const revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduced) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.15 });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("in"));
  }

  /* ---------- animated counters ---------- */
  function animateCount(el) {
    const target = parseInt(el.dataset.count, 10);
    if (reduced || isNaN(target)) { el.textContent = format(target); return; }
    const dur = 1400, start = performance.now();
    function tick(now) {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = format(Math.round(target * eased));
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  function format(n) {
    // Years shouldn't get thousands separators
    if (n >= 1900 && n <= 2100) return String(n);
    return n.toLocaleString("en-US");
  }
  const counters = document.querySelectorAll(".count");
  if ("IntersectionObserver" in window) {
    const cio = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { animateCount(e.target); cio.unobserve(e.target); }
      });
    }, { threshold: 0.4 });
    counters.forEach((el) => cio.observe(el));
  } else {
    counters.forEach((el) => (el.textContent = format(parseInt(el.dataset.count, 10))));
  }

  /* ---------- capacity bars ---------- */
  const rows = document.querySelectorAll(".caprow");
  const maxVal = Math.max(...Array.from(rows).map((r) => parseFloat(r.dataset.val) || 0));
  function fillBars() {
    rows.forEach((r, i) => {
      const v = parseFloat(r.dataset.val) || 0;
      const pct = Math.max((v / maxVal) * 100, 3);
      const bar = r.querySelector(".bar i");
      setTimeout(() => { bar.style.width = pct + "%"; }, reduced ? 0 : i * 60);
    });
  }
  const spec = document.querySelector(".speclabel");
  if (spec && "IntersectionObserver" in window) {
    const sio = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { fillBars(); sio.unobserve(spec); } });
    }, { threshold: 0.2 });
    sio.observe(spec);
  } else { fillBars(); }

  /* ---------- mobile nav ---------- */
  const burger = document.getElementById("burger");
  const links = document.getElementById("navLinks");
  burger.addEventListener("click", () => {
    const open = links.classList.toggle("open");
    burger.classList.toggle("open", open);
    burger.setAttribute("aria-expanded", String(open));
    document.body.style.overflow = open ? "hidden" : "";
  });
  links.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => {
      links.classList.remove("open");
      burger.classList.remove("open");
      burger.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
    })
  );

  /* ---------- back to top ---------- */
  const toTop = document.getElementById("toTop");
  window.addEventListener("scroll", () => {
    toTop.classList.toggle("show", window.scrollY > 700);
  }, { passive: true });
  toTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" }));

  /* ---------- quote form (front-end only) ---------- */
  const form = document.getElementById("quoteForm");
  const note = document.getElementById("formNote");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = form.name.value.trim();
    const email = form.email.value.trim();
    if (!name || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      note.textContent = "Please enter your name and a valid work email.";
      note.style.color = "#B0421F";
      return;
    }
    // Opens the visitor's mail client with the enquiry pre-filled.
    const subject = encodeURIComponent("Quotation request — " + form.product.value);
    const body = encodeURIComponent(
      "Name: " + name + "\nEmail: " + email +
      "\nProduct: " + form.product.value +
      "\n\n" + form.message.value.trim()
    );
    window.location.href = "mailto:info@goodandfast.com?subject=" + subject + "&body=" + body;
    note.style.color = "";
    note.textContent = "Opening your email client… we reply within one working day.";
    form.reset();
  });

  /* ---------- ONE VIEW overlay ---------- */
  const ov = document.getElementById("oneView");
  const ovBtn = document.getElementById("oneViewBtn");
  const ovClose = document.getElementById("oneViewClose");

  function openOneView() {
    ov.hidden = false;
    document.body.classList.add("ov-lock");
    // small delay so bar-width transition runs after display
    requestAnimationFrame(() => ov.classList.add("open"));
    ovClose.focus();
  }
  function closeOneView() {
    ov.classList.remove("open");
    ov.hidden = true;
    document.body.classList.remove("ov-lock");
    ovBtn.focus();
  }
  ovBtn.addEventListener("click", () => {
    // close mobile nav if open, then show the overview
    links.classList.remove("open");
    burger.classList.remove("open");
    document.body.style.overflow = "";
    openOneView();
  });
  ovClose.addEventListener("click", closeOneView);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !ov.hidden) closeOneView();
  });
  ov.querySelectorAll(".ov").forEach((panel) =>
    panel.addEventListener("click", () => {
      const target = document.querySelector(panel.dataset.jump);
      closeOneView();
      if (target) target.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
    })
  );

  /* ---------- footer year ---------- */
  document.getElementById("year").textContent = new Date().getFullYear();
})();
