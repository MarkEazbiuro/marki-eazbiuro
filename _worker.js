/**
 * marki.eazbiuro.pl — globalna warstwa UI dla Cloudflare Pages
 *
 * Plik docelowy: /_worker.js (root repozytorium / katalog publikacji)
 * Funkcje:
 *  - pionowa zakładka „Napisz do nas” po prawej stronie,
 *  - oryginalny widget Smartsupp w prawym dolnym rogu,
 *  - panel preferencji cookies + mały przycisk w lewym dolnym rogu.
 *
 * Założenia:
 *  - nie zmienia treści, SEO, URL-i, headera, menu ani stopki,
 *  - modyfikuje tylko odpowiedzi text/html,
 *  - jest idempotentny: własne elementy mają stałe ID i nie są dublowane,
 *  - Smartsupp działa niezależnie od preferencji cookies.
 */

const GLOBAL_VERSION = "2026-08-12.1";

const CONTACT_URL = "https://eazbiuro.pl/pl/page/zapytaj-nas-online";
const SMARTSUPP_KEY = "2ad39f1c368fcebf6bed7b4dc7e4ce7eb234e225";
const SMARTSUPP_LOADER = "https://www.smartsuppchat.com/loader.js";

const HEAD_STYLE = `
<style id="azb-global-ui-style">
  /* marki.eazbiuro.pl — global UI ${GLOBAL_VERSION} */
  #azb-contact-tab,
  #azb-cookie-trigger,
  #azb-cookie-banner,
  #azb-cookie-modal {
    box-sizing: border-box;
    font-family: "Open Sans", Arial, sans-serif;
  }

  #azb-contact-tab {
    position: fixed;
    top: 50%;
    right: 0;
    z-index: 2147482000;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 36px;
    min-height: 132px;
    padding: 13px 8px;
    color: #fff;
    background: #cd0000;
    border: 0;
    border-radius: 8px 0 0 8px;
    box-shadow: 0 8px 24px rgba(0,0,0,.18);
    font-size: 13px;
    font-weight: 800;
    line-height: 1;
    letter-spacing: .02em;
    text-decoration: none;
    writing-mode: vertical-rl;
    transform: translateY(-50%) rotate(180deg);
    transition: background-color .18s ease, box-shadow .18s ease;
    -webkit-tap-highlight-color: transparent;
  }

  #azb-contact-tab:hover,
  #azb-contact-tab:focus-visible {
    color: #fff;
    background: #a90000;
    box-shadow: 0 10px 28px rgba(0,0,0,.24);
    outline: none;
  }

  #azb-contact-tab:focus-visible {
    box-shadow: 0 0 0 3px rgba(255,255,255,.95), 0 0 0 6px rgba(205,0,0,.45);
  }

  #azb-cookie-trigger {
    position: fixed;
    left: max(14px, env(safe-area-inset-left));
    bottom: max(14px, env(safe-area-inset-bottom));
    z-index: 2147482100;
    width: 44px;
    height: 44px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    color: #fff;
    background: #cd0000;
    border: 0;
    border-radius: 50%;
    box-shadow: 0 8px 24px rgba(0,0,0,.22);
    cursor: pointer;
    transition: background-color .18s ease, transform .18s ease;
    -webkit-tap-highlight-color: transparent;
  }

  #azb-cookie-trigger:hover,
  #azb-cookie-trigger:focus-visible {
    background: #a90000;
    transform: translateY(-1px);
    outline: none;
  }

  #azb-cookie-trigger:focus-visible {
    box-shadow: 0 0 0 3px rgba(255,255,255,.95), 0 0 0 6px rgba(205,0,0,.45);
  }

  #azb-cookie-trigger svg {
    width: 24px;
    height: 24px;
    display: block;
    fill: currentColor;
  }

  #azb-cookie-banner {
    position: fixed;
    left: 50%;
    bottom: max(18px, env(safe-area-inset-bottom));
    z-index: 2147482200;
    width: min(760px, calc(100vw - 32px));
    padding: 20px;
    color: #222831;
    background: #fff;
    border: 1px solid #e1e5e9;
    border-radius: 14px;
    box-shadow: 0 18px 60px rgba(0,0,0,.24);
    transform: translateX(-50%);
  }

  #azb-cookie-banner h2,
  #azb-cookie-modal h2 {
    margin: 0;
    color: #222831;
    font-size: 20px;
    font-weight: 800;
    line-height: 1.3;
  }

  #azb-cookie-banner p,
  #azb-cookie-modal p {
    margin: 9px 0 0;
    color: #59636e;
    font-size: 13px;
    line-height: 1.6;
  }

  .azb-cookie-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 9px;
    margin-top: 16px;
  }

  .azb-cookie-button {
    min-height: 42px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 9px 15px;
    border-radius: 8px;
    font: inherit;
    font-size: 13px;
    font-weight: 800;
    line-height: 1.2;
    cursor: pointer;
  }

  .azb-cookie-button--primary {
    color: #fff;
    background: #cd0000;
    border: 1px solid #cd0000;
  }

  .azb-cookie-button--primary:hover,
  .azb-cookie-button--primary:focus-visible {
    background: #a90000;
    border-color: #a90000;
  }

  .azb-cookie-button--secondary {
    color: #222831;
    background: #fff;
    border: 1px solid #cfd5da;
  }

  .azb-cookie-button--secondary:hover,
  .azb-cookie-button--secondary:focus-visible {
    background: #f5f7f9;
    border-color: #aeb7c0;
  }

  .azb-cookie-button:focus-visible {
    outline: 3px solid rgba(205,0,0,.28);
    outline-offset: 2px;
  }

  #azb-cookie-modal[hidden],
  #azb-cookie-banner[hidden],
  #azb-cookie-trigger[hidden] {
    display: none !important;
  }

  #azb-cookie-modal {
    position: fixed;
    inset: 0;
    z-index: 2147483000;
    display: grid;
    place-items: center;
    padding: 20px;
  }

  .azb-cookie-backdrop {
    position: absolute;
    inset: 0;
    background: rgba(20,26,31,.55);
  }

  .azb-cookie-dialog {
    position: relative;
    z-index: 1;
    width: min(620px, 100%);
    max-height: min(720px, calc(100vh - 40px));
    overflow: auto;
    padding: 24px;
    color: #222831;
    background: #fff;
    border-radius: 14px;
    box-shadow: 0 24px 80px rgba(0,0,0,.32);
  }

  .azb-cookie-dialog-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 18px;
  }

  .azb-cookie-close {
    width: 38px;
    height: 38px;
    flex: 0 0 auto;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    color: #4b5560;
    background: #f5f7f9;
    border: 1px solid #e2e6ea;
    border-radius: 8px;
    font-size: 22px;
    line-height: 1;
    cursor: pointer;
  }

  .azb-cookie-close:hover,
  .azb-cookie-close:focus-visible {
    color: #fff;
    background: #cd0000;
    border-color: #cd0000;
    outline: none;
  }

  .azb-cookie-options {
    display: grid;
    gap: 10px;
    margin-top: 18px;
  }

  .azb-cookie-option {
    display: grid;
    grid-template-columns: minmax(0,1fr) auto;
    align-items: center;
    gap: 16px;
    padding: 14px;
    background: #f7f8f9;
    border: 1px solid #e7eaed;
    border-radius: 10px;
  }

  .azb-cookie-option strong {
    display: block;
    color: #222831;
    font-size: 14px;
  }

  .azb-cookie-option span {
    display: block;
    margin-top: 3px;
    color: #69737d;
    font-size: 12px;
    line-height: 1.45;
  }

  .azb-cookie-switch {
    width: 22px;
    height: 22px;
    accent-color: #cd0000;
  }

  .azb-cookie-required {
    color: #5d6670;
    font-size: 11px;
    font-weight: 800;
    white-space: nowrap;
  }

  @media (max-width: 768px) {
    #azb-contact-tab {
      top: 48%;
      min-width: 32px;
      min-height: 112px;
      padding: 10px 6px;
      border-radius: 7px 0 0 7px;
      font-size: 12px;
    }

    #azb-cookie-trigger {
      width: 40px;
      height: 40px;
    }

    #azb-cookie-banner {
      bottom: max(68px, calc(env(safe-area-inset-bottom) + 58px));
      width: calc(100vw - 24px);
      padding: 16px;
    }

    #azb-cookie-banner h2,
    #azb-cookie-modal h2 {
      font-size: 18px;
    }

    .azb-cookie-actions {
      display: grid;
      grid-template-columns: 1fr;
    }

    .azb-cookie-button {
      width: 100%;
    }

    #azb-cookie-modal {
      padding: 12px;
    }

    .azb-cookie-dialog {
      max-height: calc(100vh - 24px);
      padding: 18px;
    }
  }

  @media (max-width: 390px) {
    #azb-contact-tab {
      min-width: 30px;
      min-height: 104px;
      font-size: 11px;
    }

    .azb-cookie-option {
      grid-template-columns: minmax(0,1fr) auto;
      gap: 10px;
      padding: 12px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    #azb-contact-tab,
    #azb-cookie-trigger {
      transition: none;
    }
  }
</style>`;

const BODY_HTML = `
<!-- marki.eazbiuro.pl — global UI ${GLOBAL_VERSION} -->
<a id="azb-contact-tab" href="${CONTACT_URL}" target="_blank" rel="noopener noreferrer" aria-label="Napisz do nas — otwórz formularz kontaktowy">Napisz do nas</a>

<button id="azb-cookie-trigger" type="button" aria-label="Ustawienia cookies" aria-haspopup="dialog" aria-controls="azb-cookie-modal" hidden>
  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path d="M21.7 13.1a8.9 8.9 0 0 1-10.8-10.8A9.8 9.8 0 1 0 21.7 13.1ZM8.1 11.1a1.35 1.35 0 1 1 0 2.7 1.35 1.35 0 0 1 0-2.7Zm4.9 4.2a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5Zm2.6-6a1.15 1.15 0 1 1 0 2.3 1.15 1.15 0 0 1 0-2.3Z"/>
  </svg>
</button>

<section id="azb-cookie-banner" role="dialog" aria-modal="false" aria-labelledby="azb-cookie-banner-title" hidden>
  <h2 id="azb-cookie-banner-title">Ustawienia cookies</h2>
  <p>Ta strona korzysta z cookies niezbędnych do działania serwisu. Za Twoją zgodą mogą być również używane cookies analityczne i marketingowe. Wybór możesz później zmienić.</p>
  <div class="azb-cookie-actions">
    <button class="azb-cookie-button azb-cookie-button--primary" type="button" data-azb-cookie-action="accept-all">Zaakceptuj wszystkie</button>
    <button class="azb-cookie-button azb-cookie-button--secondary" type="button" data-azb-cookie-action="necessary-only">Tylko niezbędne</button>
    <button class="azb-cookie-button azb-cookie-button--secondary" type="button" data-azb-cookie-action="settings">Ustawienia</button>
  </div>
</section>

<div id="azb-cookie-modal" role="dialog" aria-modal="true" aria-labelledby="azb-cookie-modal-title" hidden>
  <div class="azb-cookie-backdrop" data-azb-cookie-action="close-settings" aria-hidden="true"></div>
  <div class="azb-cookie-dialog" role="document">
    <div class="azb-cookie-dialog-head">
      <div>
        <h2 id="azb-cookie-modal-title">Preferencje cookies</h2>
        <p>Wybierz opcjonalne kategorie. Cookies niezbędne są zawsze aktywne.</p>
      </div>
      <button class="azb-cookie-close" type="button" data-azb-cookie-action="close-settings" aria-label="Zamknij ustawienia">×</button>
    </div>

    <div class="azb-cookie-options">
      <label class="azb-cookie-option">
        <span>
          <strong>Niezbędne</strong>
          <span>Wymagane do podstawowego działania serwisu i zapamiętania wybranych preferencji.</span>
        </span>
        <span class="azb-cookie-required">ZAWSZE AKTYWNE</span>
      </label>

      <label class="azb-cookie-option" for="azb-cookie-analytics">
        <span>
          <strong>Analityczne</strong>
          <span>Pomagają mierzyć sposób korzystania z serwisu, jeśli takie narzędzia są podłączone.</span>
        </span>
        <input class="azb-cookie-switch" id="azb-cookie-analytics" type="checkbox" />
      </label>

      <label class="azb-cookie-option" for="azb-cookie-marketing">
        <span>
          <strong>Marketingowe</strong>
          <span>Mogą służyć do działań marketingowych, jeśli takie narzędzia są podłączone.</span>
        </span>
        <input class="azb-cookie-switch" id="azb-cookie-marketing" type="checkbox" />
      </label>
    </div>

    <div class="azb-cookie-actions">
      <button class="azb-cookie-button azb-cookie-button--primary" type="button" data-azb-cookie-action="save-settings">Zapisz ustawienia</button>
      <button class="azb-cookie-button azb-cookie-button--secondary" type="button" data-azb-cookie-action="accept-all">Zaakceptuj wszystkie</button>
    </div>
  </div>
</div>

<script id="azb-global-ui-script">
(function () {
  "use strict";

  if (window.__AZB_GLOBAL_UI_LOADED__) return;
  window.__AZB_GLOBAL_UI_LOADED__ = true;

  var STORAGE_KEY = "azb_cookie_consent_v1";
  var COOKIE_KEY = "azb_cookie_consent_v1";
  var COOKIE_MAX_AGE = 31536000;
  var lastFocusedElement = null;

  var banner = document.getElementById("azb-cookie-banner");
  var trigger = document.getElementById("azb-cookie-trigger");
  var modal = document.getElementById("azb-cookie-modal");
  var analyticsInput = document.getElementById("azb-cookie-analytics");
  var marketingInput = document.getElementById("azb-cookie-marketing");

  function normalizeConsent(value) {
    if (!value || typeof value !== "object") return null;
    return {
      necessary: true,
      analytics: value.analytics === true,
      marketing: value.marketing === true,
      updatedAt: typeof value.updatedAt === "string" ? value.updatedAt : null
    };
  }

  function readCookie(name) {
    var prefix = name + "=";
    var parts = document.cookie ? document.cookie.split(";") : [];
    for (var i = 0; i < parts.length; i += 1) {
      var part = parts[i].trim();
      if (part.indexOf(prefix) === 0) return part.slice(prefix.length);
    }
    return null;
  }

  function readConsent() {
    var raw = null;
    try {
      raw = window.localStorage.getItem(STORAGE_KEY);
    } catch (error) {
      raw = null;
    }

    if (!raw) {
      try {
        var fromCookie = readCookie(COOKIE_KEY);
        raw = fromCookie ? decodeURIComponent(fromCookie) : null;
      } catch (error) {
        raw = null;
      }
    }

    if (!raw) return null;

    try {
      return normalizeConsent(JSON.parse(raw));
    } catch (error) {
      return null;
    }
  }

  function writeConsent(consent) {
    var normalized = normalizeConsent(consent) || {
      necessary: true,
      analytics: false,
      marketing: false,
      updatedAt: new Date().toISOString()
    };
    normalized.updatedAt = new Date().toISOString();

    var raw = JSON.stringify(normalized);
    try {
      window.localStorage.setItem(STORAGE_KEY, raw);
    } catch (error) {
      /* localStorage może być niedostępny — pozostaje fallback cookie. */
    }

    try {
      document.cookie = COOKIE_KEY + "=" + encodeURIComponent(raw) + "; Max-Age=" + COOKIE_MAX_AGE + "; Path=/; SameSite=Lax; Secure";
    } catch (error) {
      /* Brak dostępu do cookie nie może blokować strony. */
    }

    return normalized;
  }

  function categoryAllowed(category, consent) {
    if (category === "necessary") return true;
    if (!consent) return false;
    return category === "analytics" ? consent.analytics === true :
           category === "marketing" ? consent.marketing === true : false;
  }

  function activateDeferredScripts(consent) {
    var scripts = document.querySelectorAll('script[type="text/plain"][data-cookie-category]');
    for (var i = 0; i < scripts.length; i += 1) {
      var source = scripts[i];
      if (source.getAttribute("data-azb-activated") === "true") continue;

      var category = source.getAttribute("data-cookie-category");
      if (!categoryAllowed(category, consent)) continue;

      var replacement = document.createElement("script");
      for (var a = 0; a < source.attributes.length; a += 1) {
        var attribute = source.attributes[a];
        if (attribute.name === "type" ||
            attribute.name === "data-cookie-category" ||
            attribute.name === "data-src" ||
            attribute.name === "data-azb-activated") continue;
        replacement.setAttribute(attribute.name, attribute.value);
      }

      var deferredSrc = source.getAttribute("data-src");
      if (deferredSrc) replacement.src = deferredSrc;
      if (!deferredSrc) replacement.text = source.textContent || "";
      replacement.setAttribute("data-azb-activated", "true");
      source.parentNode.replaceChild(replacement, source);
    }
  }

  function announceConsent(consent) {
    window.AZBCookies = window.AZBCookies || {};
    window.AZBCookies.consent = consent;
    window.AZBCookies.hasConsent = function (category) {
      return categoryAllowed(category, window.AZBCookies.consent);
    };

    activateDeferredScripts(consent);

    try {
      window.dispatchEvent(new CustomEvent("azb:cookie-consent", { detail: consent }));
    } catch (error) {
      /* CustomEvent może być niedostępny w bardzo starych przeglądarkach. */
    }
  }

  function setInputs(consent) {
    if (analyticsInput) analyticsInput.checked = !!(consent && consent.analytics);
    if (marketingInput) marketingInput.checked = !!(consent && consent.marketing);
  }

  function showBanner() {
    if (!banner) return;
    banner.hidden = false;
    if (trigger) trigger.hidden = true;
  }

  function hideBanner() {
    if (banner) banner.hidden = true;
  }

  function showTrigger() {
    if (trigger) trigger.hidden = false;
  }

  function openSettings() {
    if (!modal) return;
    lastFocusedElement = document.activeElement;
    setInputs(readConsent());
    hideBanner();
    modal.hidden = false;
    document.documentElement.style.overflow = "hidden";

    var closeButton = modal.querySelector(".azb-cookie-close");
    if (closeButton) closeButton.focus();
  }

  function closeSettings() {
    if (!modal) return;
    modal.hidden = true;
    document.documentElement.style.overflow = "";

    var consent = readConsent();
    if (consent) {
      showTrigger();
    } else {
      showBanner();
    }

    if (lastFocusedElement && typeof lastFocusedElement.focus === "function") {
      lastFocusedElement.focus();
    }
  }

  function saveAndClose(consent) {
    var saved = writeConsent(consent);
    hideBanner();
    if (modal) modal.hidden = true;
    document.documentElement.style.overflow = "";
    showTrigger();
    announceConsent(saved);
  }

  function acceptAll() {
    saveAndClose({ necessary: true, analytics: true, marketing: true });
  }

  function necessaryOnly() {
    saveAndClose({ necessary: true, analytics: false, marketing: false });
  }

  function saveSettings() {
    saveAndClose({
      necessary: true,
      analytics: !!(analyticsInput && analyticsInput.checked),
      marketing: !!(marketingInput && marketingInput.checked)
    });
  }

  document.addEventListener("click", function (event) {
    var actionNode = event.target.closest ? event.target.closest("[data-azb-cookie-action]") : null;
    if (actionNode) {
      var action = actionNode.getAttribute("data-azb-cookie-action");
      if (action === "accept-all") acceptAll();
      if (action === "necessary-only") necessaryOnly();
      if (action === "settings") openSettings();
      if (action === "save-settings") saveSettings();
      if (action === "close-settings") closeSettings();
      return;
    }

    if (trigger && (event.target === trigger || trigger.contains(event.target))) {
      openSettings();
    }
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && modal && !modal.hidden) {
      closeSettings();
    }
  });

  var initialConsent = readConsent();
  if (initialConsent) {
    setInputs(initialConsent);
    hideBanner();
    showTrigger();
    announceConsent(initialConsent);
  } else {
    setInputs({ necessary: true, analytics: false, marketing: false });
    showBanner();
  }

  /* Smartsupp jest celowo niezależny od panelu cookies. */
  (function loadSmartsupp() {
    if (window.__AZB_SMARTSUPP_LOADING__) return;
    if (document.getElementById("azb-smartsupp-loader")) return;
    if (document.querySelector('script[src*="smartsuppchat.com/loader.js"]')) return;

    window.__AZB_SMARTSUPP_LOADING__ = true;
    window._smartsupp = window._smartsupp || {};
    window._smartsupp.key = "${SMARTSUPP_KEY}";
    window.smartsupp = window.smartsupp || function () {
      (window.smartsupp._ || (window.smartsupp._ = [])).push(arguments);
    };

    var script = document.createElement("script");
    script.id = "azb-smartsupp-loader";
    script.type = "text/javascript";
    script.async = true;
    script.src = "${SMARTSUPP_LOADER}";
    var firstScript = document.getElementsByTagName("script")[0];
    if (firstScript && firstScript.parentNode) {
      firstScript.parentNode.insertBefore(script, firstScript);
    } else {
      document.head.appendChild(script);
    }
  }());
}());
</script>`;

function hasAny(html, values) {
  for (const value of values) {
    if (html.includes(value)) return true;
  }
  return false;
}

function injectBeforeClosingTag(html, tagName, snippet) {
  const closing = new RegExp(`</${tagName}\\s*>`, "i");
  if (closing.test(html)) {
    return html.replace(closing, `${snippet}\n</${tagName}>`);
  }
  return `${html}\n${snippet}`;
}

function buildHeadInjection(html) {
  const parts = [];

  if (!hasAny(html, [
    'id="azb-smartsupp-dns-prefetch"',
    "id='azb-smartsupp-dns-prefetch'"
  ])) {
    parts.push('<link id="azb-smartsupp-dns-prefetch" rel="dns-prefetch" href="//www.smartsuppchat.com">');
  }

  if (!hasAny(html, [
    'id="azb-smartsupp-preconnect"',
    "id='azb-smartsupp-preconnect'"
  ])) {
    parts.push('<link id="azb-smartsupp-preconnect" rel="preconnect" href="https://www.smartsuppchat.com" crossorigin>');
  }

  if (!hasAny(html, [
    'id="azb-global-ui-style"',
    "id='azb-global-ui-style'"
  ])) {
    parts.push(HEAD_STYLE);
  }

  return parts.join("\n");
}

function needsBodyInjection(html) {
  return !hasAny(html, [
    'id="azb-global-ui-script"',
    "id='azb-global-ui-script'"
  ]);
}

function transformHtml(html) {
  let output = html;
  const headInjection = buildHeadInjection(output);

  if (headInjection) {
    output = injectBeforeClosingTag(output, "head", headInjection);
  }

  if (needsBodyInjection(output)) {
    output = injectBeforeClosingTag(output, "body", BODY_HTML);
  }

  return output;
}

export default {
  async fetch(request, env) {
    const response = await env.ASSETS.fetch(request);

    if (request.method !== "GET") {
      return response;
    }

    const contentType = response.headers.get("content-type") || "";
    if (!contentType.toLowerCase().includes("text/html")) {
      return response;
    }

    const passthroughResponse = response.clone();
    const originalHtml = await response.text();
    const transformedHtml = transformHtml(originalHtml);

    if (transformedHtml === originalHtml) {
      return passthroughResponse;
    }

    const headers = new Headers(response.headers);
    headers.delete("content-length");
    headers.delete("content-encoding");
    headers.delete("etag");
    headers.set("x-azb-global-ui", GLOBAL_VERSION);

    return new Response(transformedHtml, {
      status: response.status,
      statusText: response.statusText,
      headers
    });
  }
};
