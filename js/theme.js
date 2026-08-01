/* ==========================================================================
   Persistent light and dark theme controller
   ========================================================================== */

const THEME_STORAGE_KEY = 'songang-portfolio-theme';
const AVAILABLE_THEMES = new Set(['light', 'dark']);

function getCurrentTheme() {
  const currentTheme = document.documentElement.dataset.theme;
  return AVAILABLE_THEMES.has(currentTheme) ? currentTheme : 'light';
}

function updateThemeControl(theme) {
  const toggle = document.querySelector('#theme-toggle');

  if (!toggle) {
    return;
  }

  const isDark = theme === 'dark';
  const nextTheme = isDark ? 'light' : 'dark';
  const label = toggle.querySelector('[data-theme-label]');
  const icon = toggle.querySelector('[data-theme-icon]');

  toggle.setAttribute('aria-pressed', String(isDark));
  toggle.setAttribute('aria-label', `Theme: ${theme}. Switch to ${nextTheme} theme`);
  toggle.title = `Switch to ${nextTheme} theme`;

  if (label) {
    label.textContent = theme;
  }

  if (icon) {
    icon.textContent = isDark ? 'Moon' : 'Sun';
  }
}

function applyTheme(theme, shouldPersist = false) {
  const nextTheme = AVAILABLE_THEMES.has(theme) ? theme : 'light';

  document.documentElement.dataset.theme = nextTheme;
  document.documentElement.style.colorScheme = nextTheme;

  if (document.body) {
    document.body.dataset.theme = nextTheme;
  }

  if (shouldPersist) {
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    } catch (error) {
      console.warn('The theme preference could not be saved:', error);
    }
  }

  updateThemeControl(nextTheme);
}

function bindThemeControl() {
  const toggle = document.querySelector('#theme-toggle');

  if (!toggle || toggle.dataset.themeBound === 'true') {
    return;
  }

  toggle.dataset.themeBound = 'true';
  toggle.addEventListener('click', () => {
    const nextTheme = getCurrentTheme() === 'dark' ? 'light' : 'dark';
    applyTheme(nextTheme, true);
  });

  updateThemeControl(getCurrentTheme());
}

document.addEventListener('DOMContentLoaded', () => {
  applyTheme(getCurrentTheme());
  bindThemeControl();
});

document.addEventListener('site:components-ready', bindThemeControl);

window.addEventListener('storage', (event) => {
  if (event.key === THEME_STORAGE_KEY && AVAILABLE_THEMES.has(event.newValue)) {
    applyTheme(event.newValue);
  }
});
