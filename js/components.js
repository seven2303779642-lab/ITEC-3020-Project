/* ==========================================================================
   Shared header and footer loader
   ========================================================================== */

/**
 * Fetch a local HTML fragment and place it inside the requested placeholder.
 * This project must be served over HTTP because browsers block fetch() on
 * file:// pages.
 */
async function loadComponent(selector, filePath) {
  const placeholder = document.querySelector(selector);

  if (!placeholder) {
    throw new Error(`Missing component placeholder: ${selector}`);
  }

  const response = await fetch(filePath);

  if (!response.ok) {
    throw new Error(`Could not load ${filePath} (${response.status})`);
  }

  placeholder.innerHTML = await response.text();
  return placeholder;
}

/**
 * Restore the active navigation state after the shared markup is injected.
 * blogPostTemplate.html deliberately identifies itself as blog.html.
 */
function markActivePage(container, activePage) {
  container.querySelectorAll('a[href]').forEach((link) => {
    const linkTarget = link.getAttribute('href');

    if (linkTarget === activePage) {
      if (link.classList.contains('nav-link')) {
        link.classList.add('nav-link-active');
      }
      link.setAttribute('aria-current', 'page');
    }
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  const activePage = document.body.dataset.activePage;

  try {
    const [header, footer] = await Promise.all([
      loadComponent('#header-placeholder', 'components/header.html?v=0.3.0'),
      loadComponent('#footer-placeholder', 'components/footer.html?v=0.3.0'),
    ]);

    markActivePage(header, activePage);
    markActivePage(footer, activePage);

    document.dispatchEvent(
      new CustomEvent('site:components-ready', {
        detail: { header, footer, activePage },
      }),
    );
  } catch (error) {
    console.error('Shared components failed to load:', error);

    document.querySelectorAll('[data-component-placeholder]').forEach((placeholder) => {
      placeholder.innerHTML =
        '<p class="component-load-error" role="status">Shared navigation could not be loaded. Run the site through a local web server and refresh the page.</p>';
    });
  }
});
