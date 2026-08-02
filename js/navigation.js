/* ==========================================================================
   Shared mobile navigation drawer
   ========================================================================== */

const MOBILE_NAVIGATION_QUERY = '(max-width: 859px)';

function bindMobileNavigation(event) {
  const header = event.detail?.header;

  if (!header || header.dataset.mobileNavigationBound === 'true') {
    return;
  }

  const toggle = header.querySelector('#mobile-nav-toggle');
  const closeButton = header.querySelector('#mobile-nav-close');
  const drawer = header.querySelector('[data-mobile-navigation]');
  const backdrop = header.querySelector('[data-nav-close]');
  const navigationLinks = drawer?.querySelectorAll('a[href]');

  if (!toggle || !closeButton || !drawer || !backdrop || !navigationLinks) {
    return;
  }

  const mobileQuery = window.matchMedia(MOBILE_NAVIGATION_QUERY);
  let isOpen = false;
  let returnFocus = null;

  function getFocusableElements() {
    return [
      ...drawer.querySelectorAll(
        'a[href], button:not([disabled]), summary, [tabindex]:not([tabindex="-1"])',
      ),
    ].filter((element) => !element.hidden);
  }

  function applyClosedState(shouldRestoreFocus = true) {
    isOpen = false;
    drawer.dataset.open = 'false';
    toggle.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('mobile-navigation-open');

    if (mobileQuery.matches) {
      drawer.setAttribute('aria-hidden', 'true');
      drawer.setAttribute('inert', '');
    } else {
      drawer.setAttribute('aria-hidden', 'false');
      drawer.removeAttribute('inert');
    }

    if (shouldRestoreFocus && returnFocus instanceof HTMLElement) {
      returnFocus.focus();
    }

    returnFocus = null;
  }

  function openNavigation() {
    if (!mobileQuery.matches) {
      return;
    }

    returnFocus = document.activeElement;
    isOpen = true;
    drawer.dataset.open = 'true';
    drawer.setAttribute('aria-hidden', 'false');
    drawer.removeAttribute('inert');
    toggle.setAttribute('aria-expanded', 'true');
    document.body.classList.add('mobile-navigation-open');
    closeButton.focus();
  }

  function handleKeydown(event) {
    if (!isOpen || !mobileQuery.matches) {
      return;
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      applyClosedState();
      return;
    }

    if (event.key !== 'Tab') {
      return;
    }

    const focusableElements = getFocusableElements();
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (!firstElement || !lastElement) {
      return;
    }

    if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault();
      lastElement.focus();
    } else if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
    }
  }

  function synchroniseLayout() {
    applyClosedState(false);
  }

  toggle.addEventListener('click', openNavigation);
  closeButton.addEventListener('click', () => applyClosedState());
  backdrop.addEventListener('click', () => applyClosedState());
  navigationLinks.forEach((link) => {
    link.addEventListener('click', () => applyClosedState(false));
  });
  document.addEventListener('keydown', handleKeydown);
  mobileQuery.addEventListener('change', synchroniseLayout);

  header.dataset.mobileNavigationBound = 'true';
  synchroniseLayout();
}

document.addEventListener('site:components-ready', bindMobileNavigation);
