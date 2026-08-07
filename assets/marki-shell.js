(function () {
  "use strict";

  const HEADER_HTML = "<header class=\"site-header\" data-header>\n    <div class=\"header-inner\">\n      <a class=\"brand-header\" href=\"/\" aria-label=\"Producenci, serie i modele A-Z Biuro — strona główna\">\n        <img\n          class=\"brand-logo\"\n          src=\"https://poradnik.eazbiuro.pl/assets/logo-eazbiuro.png\"\n          alt=\"A-Z Biuro\"\n          width=\"342\"\n          height=\"92\"\n          decoding=\"async\"\n        >\n        <span class=\"brand-divider\" aria-hidden=\"true\"></span>\n        <span class=\"brand-label\">Producenci • Serie • Modele</span>\n      </a>\n\n      <button class=\"nav-toggle\" type=\"button\" aria-expanded=\"false\" aria-controls=\"main-nav\" aria-label=\"Otwórz menu\">\n        <span></span><span></span><span></span>\n      </button>\n\n      <div class=\"menu-backdrop\" data-menu-backdrop aria-hidden=\"true\"></div>\n\n      <nav class=\"main-nav\" id=\"main-nav\" aria-label=\"Nawigacja główna\">\n        <span class=\"nav-item\">Marki A-Z</span>\n        <span class=\"nav-item\">Kategorie</span>\n        <span class=\"nav-item\">Serie i modele</span>\n        <a class=\"nav-item\" href=\"/o-serwisie/\">O projekcie</a>\n        <a class=\"nav-service\" href=\"https://poradnik.eazbiuro.pl/\">Poradnik</a>\n        <a class=\"nav-service\" href=\"https://wiedza.eazbiuro.pl/\">Centrum wiedzy</a>\n        <a href=\"https://eazbiuro.pl/pl/page/kontakt\">Kontakt</a>\n        <a class=\"nav-cta\" href=\"https://eazbiuro.pl/pl/shop\">Przejdź do sklepu</a>\n      </nav>\n    </div>\n  </header>";
  const FOOTER_HTML = "<footer class=\"az-footer\">\n    <div class=\"container az-footer-grid\">\n      <div class=\"az-footer-brand\">\n        <a class=\"az-footer-logo-link\" href=\"/\" aria-label=\"Producenci, serie i modele A-Z Biuro — strona główna\">\n          <img\n            class=\"az-footer-logo\"\n            src=\"https://poradnik.eazbiuro.pl/assets/logo-eazbiuro.png\"\n            alt=\"A-Z Biuro\"\n            width=\"250\"\n            height=\"68\"\n            loading=\"lazy\"\n            decoding=\"async\"\n          >\n        </a>\n        <p>\n          Praktyczna baza producentów, serii i modeli produktów dla firm,\n          szkół, instytucji, gastronomii i klientów indywidualnych.\n        </p>\n      </div>\n\n      <div class=\"az-footer-column\">\n        <h2>Producenci i marki</h2>\n        <span class=\"footer-placeholder\">Marki A-Z</span>\n        <span class=\"footer-placeholder\">Kategorie marek</span>\n        <span class=\"footer-placeholder\">Serie produktów</span>\n        <span class=\"footer-placeholder\">Wybrane modele</span>\n        <a href=\"/o-serwisie/\">O projekcie</a>\n              <a href=\"/kontakt-i-zrodla/\">Źródła i kontakt</a>\n        <a href=\"/mapa-serwisu/\">Mapa serwisu</a>\n      </div>\n\n      <div class=\"az-footer-column\">\n        <h2>Serwisy A-Z Biuro</h2>\n        <a href=\"https://eazbiuro.pl/pl/shop\">Sklep internetowy</a>\n        <a href=\"https://poradnik.eazbiuro.pl/\">Poradnik zakupowy</a>\n        <a href=\"https://wiedza.eazbiuro.pl/\">Centrum Wiedzy</a>\n      </div>\n\n      <div class=\"az-footer-column\">\n        <h2>Obsługa klienta</h2>\n        <a href=\"https://eazbiuro.pl/pl/page/kontakt\">Kontakt</a>\n        <a href=\"https://eazbiuro.pl/pl/page/faq\">FAQ</a>\n        <a href=\"https://eazbiuro.pl/pl/page/zwroty-i-reklamacje\">Zwroty i reklamacje</a>\n      </div>\n    </div>\n\n    <div class=\"container az-footer-disclaimer\" role=\"note\">\n      <strong>Serwis producentów, serii i modeli jest częścią A-Z Biuro.</strong>\n      Informacje produktowe, ceny i dostępność zawsze sprawdzaj w\n      <a href=\"https://eazbiuro.pl/pl/shop\">aktualnej ofercie sklepu</a>.\n    </div>\n\n    <div class=\"container az-footer-bottom\">\n      <span>© <span data-year>2026</span> A-Z Biuro</span>\n      <span>marki.eazbiuro.pl — producenci, serie i modele</span>\n    </div>\n  </footer>";

  function installShell() {
    const oldHeader = document.querySelector("header.site-header");
    const oldFooter = document.querySelector("footer.az-footer");

    if (oldHeader) oldHeader.outerHTML = HEADER_HTML;
    if (oldFooter) oldFooter.outerHTML = FOOTER_HTML;

    const path = window.location.pathname.replace(/\/+$/, "/");
    const currentMap = {
      "/": "/",
      "/marki-a-z/": "/marki-a-z/",
      "/kategorie/": "/kategorie/",
      "/o-serwisie/": "/o-serwisie/"
    };
    const currentHref = currentMap[path];
    if (currentHref) {
      const current = document.querySelector('.main-nav a[href="' + currentHref + '"]');
      if (current) {
        current.classList.add("is-current");
        current.setAttribute("aria-current", "page");
      }
    }

    const header = document.querySelector("[data-header]");
    const button = document.querySelector(".nav-toggle");
    const navigation = document.getElementById("main-nav");
    const backdrop = document.querySelector("[data-menu-backdrop]");

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
        const isOpen = button.getAttribute("aria-expanded") === "true";
        if (isOpen) return closeMenu();

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
      window.addEventListener("scroll", function () {
        header.classList.toggle("is-scrolled", window.scrollY > 8);
      }, { passive: true });
    }

    document.querySelectorAll("[data-year]").forEach(function (node) {
      node.textContent = String(new Date().getFullYear());
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", installShell, { once: true });
  } else {
    installShell();
  }
}());
