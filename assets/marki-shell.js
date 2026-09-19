(() => {
  "use strict";

  const loadShared = async (selector, url) => {
    const slot = document.querySelector(selector);
    if (!slot) return;
    try {
      const response = await fetch(url, { credentials: "same-origin", cache: "no-cache" });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      slot.innerHTML = await response.text();
    } catch (error) {
      slot.setAttribute("data-shared-load-error", "true");
      console.warn("Nie udało się załadować wspólnego elementu:", url, error);
    }
  };

  const initHeader = () => {
    const header = document.querySelector(".site-header");
    const toggle = document.querySelector(".nav-toggle");
    const nav = document.querySelector(".main-nav");
    const backdrop = document.querySelector(".menu-backdrop");

    if (header) {
      const update = () => header.classList.toggle("is-scrolled", window.scrollY > 8);
      update();
      window.addEventListener("scroll", update, { passive: true });
    }

    if (!toggle || !nav) return;

    const close = () => {
      toggle.setAttribute("aria-expanded", "false");
      nav.classList.remove("is-open");
      if (backdrop) {
        backdrop.classList.remove("is-open");
        backdrop.setAttribute("aria-hidden", "true");
      }
      document.body.classList.remove("menu-open");
    };

    toggle.addEventListener("click", () => {
      const open = toggle.getAttribute("aria-expanded") === "true";
      if (open) {
        close();
      } else {
        toggle.setAttribute("aria-expanded", "true");
        nav.classList.add("is-open");
        if (backdrop) {
          backdrop.classList.add("is-open");
          backdrop.setAttribute("aria-hidden", "false");
        }
        document.body.classList.add("menu-open");
      }
    });

    if (backdrop) backdrop.addEventListener("click", close);
    nav.querySelectorAll("a").forEach(a => a.addEventListener("click", close));
  };

  const init = async () => {
    await Promise.all([
      loadShared(".marki-header-slot", "/includes/header.html"),
      loadShared(".marki-footer-slot", "/includes/footer.html")
    ]);

    document.querySelectorAll("[data-year]").forEach(el => {
      el.textContent = String(new Date().getFullYear());
    });

    initHeader();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
