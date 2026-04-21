/**
 * loader.js — IEI Page Loader
 * Shows ONLY on fresh load or manual reload.
 * Skipped on back/forward navigation and same-session revisits.
 */
(function () {

  // ── SKIP LOGIC ──────────────────────────────────────────────────
  // 1. Back/forward navigation detected via Performance Navigation API
  var navType = (performance.getEntriesByType('navigation')[0] || {}).type
              || (performance.navigation && performance.navigation.type);
  // navType === 'back_forward' means user pressed Back or Forward
  if (navType === 'back_forward') return;

  // 2. Already visited this tab session (navigated from another page)
  //    'reload' means F5 / Ctrl+R — we DO want loader on reload
  if (navType !== 'reload' && sessionStorage.getItem('iei_visited')) return;

  // Mark as visited so future same-tab navigations skip the loader
  sessionStorage.setItem('iei_visited', '1');

  // ── INJECT LOADER ───────────────────────────────────────────────
  var loaderHTML = [
    '<div id="iei-loader">',
    '  <div class="loader-logo-icon"><img src="./img/ieilogo.png" alt="IEI"></div>',
    '  <div class="loader-org-name">Institute of Education</div>',
    '  <div class="loader-tagline">& <span>Innovation</span></div>',
    '  <div class="loader-status"><span class="loader-status-dot"></span>Loading...</div>',
    '  <div class="loader-bar-track"><div class="loader-bar-fill"></div></div>',
    '  <div class="loader-footer">',
    '    <strong>IEI</strong> &nbsp;|&nbsp; Institute of Education and Innovation &nbsp;|&nbsp; Malda, West Bengal',
    '  </div>',
    '</div>'
  ].join('');

  // Lock scroll immediately
  document.documentElement.style.overflow = 'hidden';

  function inject() {
    var wrapper = document.createElement('div');
    wrapper.innerHTML = loaderHTML;
    var loaderEl = wrapper.firstChild;
    function doInsert() {
      if (!document.getElementById('iei-loader')) {
        document.body.insertBefore(loaderEl, document.body.firstChild);
        document.body.classList.add('loading');
      }
    }
    if (document.body) { doInsert(); }
    else { document.addEventListener('DOMContentLoaded', doInsert); }
  }

  inject();

  // ── DISMISS LOGIC ────────────────────────────────────────────────
  var MIN_DISPLAY = 1600;
  var startTime   = Date.now();
  var dismissed   = false;

  function dismissLoader() {
    if (dismissed) return;
    dismissed = true;
    var el = document.getElementById('iei-loader');
    if (!el) return;
    el.classList.add('hide');
    document.body.classList.remove('loading');
    document.documentElement.style.overflow = '';
    setTimeout(function () {
      if (el && el.parentNode) el.parentNode.removeChild(el);
    }, 600);
  }

  function tryDismiss() {
    var elapsed   = Date.now() - startTime;
    var remaining = MIN_DISPLAY - elapsed;
    if (remaining > 0) setTimeout(dismissLoader, remaining);
    else dismissLoader();
  }

  if (document.readyState === 'complete') {
    tryDismiss();
  } else {
    window.addEventListener('load', tryDismiss);
  }

  // Also dismiss on DOMContentLoaded + short delay (handles admin auth timing)
  document.addEventListener('DOMContentLoaded', function () {
    setTimeout(tryDismiss, 400);
  });

  // Hard fallback — never stuck beyond 3s
  setTimeout(dismissLoader, 3000);

  window.IEI_Loader = { dismiss: dismissLoader };
})();
