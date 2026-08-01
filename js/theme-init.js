/*
 * Apply the saved theme before styles and page content are rendered.
 * Keeping this file synchronous prevents a light-to-dark flash on navigation.
 */
(function applyInitialTheme() {
  const storageKey = 'songang-portfolio-theme';
  let theme = 'light';

  try {
    const savedTheme = window.localStorage.getItem(storageKey);

    if (savedTheme === 'light' || savedTheme === 'dark') {
      theme = savedTheme;
    }
  } catch (error) {
    console.warn('The saved theme could not be read:', error);
  }

  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
})();
