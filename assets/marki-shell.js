(function () {
  "use strict";

  /* Ten plik NIE ukrywa i NIE przekierowuje żadnych stron. */
  document.querySelectorAll("[data-year]").forEach(function (node) {
    node.textContent = String(new Date().getFullYear());
  });
}());
