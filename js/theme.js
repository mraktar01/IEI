/**
 * theme.js — Light/Dark mode + Site Theme (colour scheme) management
 * Persists both independently via localStorage
 */
(function () {
  const DARK_KEY  = 'iei-theme';        // 'light' | 'dark'
  const SITE_KEY  = 'iei-site-theme';   // 'default' | 'ocean' | 'pink' | 'grey' | 'forest' | 'purple' | 'sunset'
  const root = document.documentElement;

  // ── DARK / LIGHT ───────────────────────────────────────────────
  function getDarkMode() {
    return localStorage.getItem(DARK_KEY) ||
      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  }

  function applyDarkMode(mode) {
    root.setAttribute('data-theme', mode);
    localStorage.setItem(DARK_KEY, mode);
    document.querySelectorAll('.theme-toggle').forEach(btn => {
      btn.innerHTML = mode === 'dark' ? '☀️' : '🌙';
      btn.setAttribute('aria-label', mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    });
  }

  function toggleDarkMode() {
    applyDarkMode(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
  }

  // ── SITE COLOUR THEME ──────────────────────────────────────────
  function getSiteTheme() {
    return localStorage.getItem(SITE_KEY) || 'default';
  }

  function applySiteTheme(theme) {
    if (theme === 'default') {
      root.removeAttribute('data-site-theme');
    } else {
      root.setAttribute('data-site-theme', theme);
    }
    localStorage.setItem(SITE_KEY, theme);

    // Update admin switcher active state if present
    document.querySelectorAll('.theme-swatch').forEach(sw => {
      sw.classList.toggle('active', sw.dataset.theme === theme);
    });
  }

  // ── INIT ───────────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', function () {
    applyDarkMode(getDarkMode());
    applySiteTheme(getSiteTheme());

    // Wire dark-mode toggle buttons
    document.querySelectorAll('.theme-toggle').forEach(btn => {
      btn.addEventListener('click', toggleDarkMode);
    });

    // Wire theme swatches (admin panel)
    document.querySelectorAll('.theme-swatch').forEach(sw => {
      sw.addEventListener('click', function () {
        applySiteTheme(this.dataset.theme);
      });
    });
  });

  // ── PUBLIC API ─────────────────────────────────────────────────
  window.IEI_Theme = {
    toggle:          toggleDarkMode,
    applyDark:       applyDarkMode,
    getDark:         getDarkMode,
    applySiteTheme:  applySiteTheme,
    getSiteTheme:    getSiteTheme
  };
})();
