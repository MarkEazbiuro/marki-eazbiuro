(function () {
  "use strict";

  if (window.__MARKI_SHARED_SHELL__) return;
  window.__MARKI_SHARED_SHELL__ = true;

  function mountFragment(selector, url) {
    var slot = document.querySelector(selector);
    if (!slot) return Promise.resolve(null);

    return fetch(url, { cache: "no-cache", credentials: "same-origin" })
      .then(function (response) {
        if (!response.ok) {
          throw new Error("Nie udało się pobrać " + url + " (" + response.status + ")");
        }
        return response.text();
      })
      .then(function (markup) {
        var template = document.createElement("template");
        template.innerHTML = markup.trim();
        var node = template.content.firstElementChild;

        if (!node) {
          throw new Error("Pusty fragment " + url);
        }

        slot.replaceWith(node);
        return node;
      })
      .catch(function (error) {
        slot.setAttribute("data-shell-error", "true");
        console.error("[Marki A-Z Biuro]", error);
        return null;
      });
  }

  function setYear() {
    document.querySelectorAll("[data-year]").forEach(function (node) {
      node.textContent = String(new Date().getFullYear());
    });
  }

  function initHeader() {
    var header = document.querySelector(".site-header");
    var button = document.querySelector(".nav-toggle");
    var navigation = document.getElementById("main-nav");
    var backdrop = document.querySelector("[data-menu-backdrop]");

    function closeMenu() {
      if (!button || !navigation) return;
      button.setAttribute("aria-expanded", "false");
      navigation.classList.remove("is-open");
      if (backdrop) {
        backdrop.classList.remove("is-open");
        backdrop.setAttribute("aria-hidden", "true");
      }
      document.body.classList.remove("menu-open");
    }

    if (button && navigation) {
      button.addEventListener("click", function () {
        var isOpen = button.getAttribute("aria-expanded") === "true";

        if (isOpen) {
          closeMenu();
          return;
        }

        button.setAttribute("aria-expanded", "true");
        navigation.classList.add("is-open");

        if (backdrop) {
          backdrop.classList.add("is-open");
          backdrop.setAttribute("aria-hidden", "false");
        }

        document.body.classList.add("menu-open");
      });

      if (backdrop) backdrop.addEventListener("click", closeMenu);

      document.addEventListener("keydown", function (event) {
        if (event.key === "Escape") closeMenu();
      });

      window.addEventListener("resize", function () {
        if (window.innerWidth > 1100) closeMenu();
      });
    }

    if (header) {
      function updateHeaderState() {
        header.classList.toggle("is-scrolled", window.scrollY > 8);
      }

      updateHeaderState();
      window.addEventListener("scroll", updateHeaderState, { passive: true });
    }
  }

  Promise.all([
    mountFragment("[data-shared-header]", "/includes/header.html"),
    mountFragment("[data-shared-footer]", "/includes/footer.html")
  ]).then(function () {
    initHeader();
    setYear();
    document.documentElement.classList.add("shared-shell-ready");
  });
}());
