/* ==========================================================================
   Shared live filtering for Projects and Blog records
   ========================================================================== */

function getSearchableText(card) {
  return [...card.querySelectorAll('[data-filter-field]')]
    .map((field) => field.textContent.trim())
    .join(' ')
    .toLocaleLowerCase('en');
}

function initialiseFilter(input) {
  if (input.dataset.filterReady === 'true') {
    return;
  }

  const cards = [...document.querySelectorAll(input.dataset.filterCards)];

  // Blog cards do not exist until posts.json has finished rendering.
  if (cards.length === 0) {
    return;
  }

  const noResults = document.querySelector(`#${input.dataset.filterEmpty}`);
  const count = document.querySelector(`#${input.dataset.filterCount}`);
  const total = cards.length;

  function applyFilter() {
    const query = input.value.trim().toLocaleLowerCase('en');
    let visibleCount = 0;

    cards.forEach((card) => {
      const matches = !query || getSearchableText(card).includes(query);
      card.hidden = !matches;

      if (matches) {
        visibleCount += 1;
      }
    });

    if (noResults) {
      noResults.hidden = visibleCount !== 0;
    }

    if (count) {
      count.textContent = `${String(visibleCount).padStart(2, '0')} / ${String(total).padStart(2, '0')} records visible`;
    }
  }

  input.dataset.filterReady = 'true';
  input.addEventListener('input', applyFilter);
  input.addEventListener('search', applyFilter);
  applyFilter();
}

function initialiseAvailableFilters() {
  document.querySelectorAll('[data-filter-input]').forEach(initialiseFilter);
}

document.addEventListener('DOMContentLoaded', initialiseAvailableFilters);
document.addEventListener('blog:rendered', initialiseAvailableFilters);
