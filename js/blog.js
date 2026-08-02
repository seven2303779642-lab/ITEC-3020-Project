/* ==========================================================================
   JSON-powered blog index and post renderer
   ========================================================================== */

const POSTS_FILE = 'data/posts.json';

function createElement(tagName, className, text) {
  const element = document.createElement(tagName);

  if (className) {
    element.className = className;
  }

  if (text !== undefined) {
    element.textContent = text;
  }

  return element;
}

function formatPostDate(dateString) {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return 'Date unavailable';
  }

  return new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

function sortPostsNewestFirst(posts) {
  return [...posts].sort((first, second) => {
    return new Date(second.date).getTime() - new Date(first.date).getTime();
  });
}

async function loadPosts() {
  const response = await fetch(POSTS_FILE);

  if (!response.ok) {
    throw new Error(`Could not load ${POSTS_FILE} (${response.status})`);
  }

  const posts = await response.json();

  if (!Array.isArray(posts) || posts.length === 0) {
    throw new Error('The blog data file does not contain any posts.');
  }

  return sortPostsNewestFirst(posts);
}

function createFactList(facts, className) {
  const list = createElement('dl', className);

  facts.forEach(([term, description]) => {
    const row = createElement('div');
    row.append(createElement('dt', '', term), createElement('dd', '', description));
    list.append(row);
  });

  return list;
}

function createPostLink(post) {
  const link = createElement('a', 'blog-entry-button');
  link.href = `blogPostTemplate.html?post=${encodeURIComponent(post.id)}`;
  link.append('Read more ', createElement('span', '', '→'));
  link.lastElementChild.setAttribute('aria-hidden', 'true');
  return link;
}

function renderFeaturedPost(post) {
  const article = createElement('article', 'blog-featured-post');
  const headingId = `blog-title-${post.id}`;
  article.setAttribute('aria-labelledby', headingId);
  article.dataset.filterCard = '';

  const number = createElement('p', 'blog-featured-number', post.entry);
  number.setAttribute('aria-hidden', 'true');

  const copy = createElement('div', 'blog-featured-copy');
  const categoryLine = createElement('div', 'blog-category-line');
  const category = createElement('p', 'blog-category', post.category);
  category.dataset.filterField = '';
  categoryLine.append(
    category,
    createElement('span', 'latest-post-badge', 'Latest post'),
  );

  const heading = createElement('h2', '', post.title);
  heading.id = headingId;
  heading.dataset.filterField = '';
  const summary = createElement('p', 'blog-featured-summary', post.summary);
  summary.dataset.filterField = '';

  copy.append(
    categoryLine,
    heading,
    summary,
    createElement('p', 'blog-featured-detail', post.detail),
    createPostLink(post),
  );

  const facts = createFactList(
    [
      ['Date', formatPostDate(post.date)],
      ['Feature', post.feature],
      ['Phase', post.phase],
      ['Status', post.status],
    ],
    'blog-featured-facts',
  );

  article.append(number, copy, facts);
  return article;
}

function renderArchivePost(post) {
  const listItem = createElement('li');
  listItem.dataset.filterCard = '';
  const article = createElement('article', 'blog-archive-entry');
  const headingId = `blog-title-${post.id}`;
  article.setAttribute('aria-labelledby', headingId);

  const number = createElement('p', 'blog-archive-number', post.entry);
  number.setAttribute('aria-hidden', 'true');

  const copy = createElement('div');
  const category = createElement('p', 'blog-category', post.category);
  category.dataset.filterField = '';
  const heading = createElement('h3', '', post.title);
  heading.id = headingId;
  heading.dataset.filterField = '';
  const summary = createElement('p', '', post.summary);
  summary.dataset.filterField = '';
  copy.append(
    category,
    heading,
    summary,
    createPostLink(post),
  );

  const facts = createFactList([
    ['Date', formatPostDate(post.date)],
    ['Phase', post.phase],
  ]);

  article.append(number, copy, facts);
  listItem.append(article);
  return listItem;
}

function setLoadState(message, isError = false) {
  const status = document.querySelector('#blog-load-status');

  if (!status) {
    return;
  }

  status.textContent = message;
  status.classList.toggle('blog-load-error', isError);
  status.hidden = message === '';
}

function renderBlogIndex(posts) {
  const featuredContainer = document.querySelector('#blog-featured');
  const archiveList = document.querySelector('#blog-archive-list');
  const recordCount = document.querySelector('#blog-record-count');

  if (!featuredContainer || !archiveList) {
    return;
  }

  featuredContainer.replaceChildren(renderFeaturedPost(posts[0]));
  archiveList.replaceChildren(...posts.slice(1).map(renderArchivePost));

  if (recordCount) {
    recordCount.textContent = `${String(posts.length).padStart(2, '0')} development records`;
  }

  setLoadState('');
  document.dispatchEvent(
    new CustomEvent('blog:rendered', {
      detail: { postCount: posts.length },
    }),
  );
}

function setText(selector, value) {
  document.querySelectorAll(selector).forEach((element) => {
    element.textContent = value;
  });
}

function renderPostPage(posts) {
  const page = document.querySelector('[data-blog-post]');

  if (!page) {
    return;
  }

  const requestedId = new URLSearchParams(window.location.search).get('post');
  const post = posts.find((entry) => entry.id === requestedId) || posts[0];

  setText('[data-post-category]', post.category);
  setText('[data-post-title]', post.title);
  setText('[data-post-summary]', post.summary);
  setText('[data-post-date]', formatPostDate(post.date));
  setText('[data-post-meta-category]', post.category);
  setText('[data-post-entry]', post.entry);
  setText('[data-post-status]', post.status);
  setText('[data-context-feature]', post.feature);
  setText('[data-context-version]', post.version);
  setText('[data-context-part]', post.phase);
  setText('[data-context-status]', post.status);
  setText('[data-post-feature]', post.content.featureDescription);
  setText('[data-post-approach]', post.content.approach);
  setText('[data-post-challenges]', post.content.challenges);
  setText('[data-post-learning]', post.content.learning);
  setText('[data-evidence-code]', post.evidence.codeReference);
  setText('[data-evidence-test]', post.evidence.testResult);
  setText('[data-evidence-next]', post.evidence.nextAction);

  document.title = `${post.title} | Songang Li`;

  const description = document.querySelector('meta[name="description"]');
  if (description) {
    description.content = post.summary;
  }

  setLoadState('');
}

document.addEventListener('DOMContentLoaded', async () => {
  try {
    const posts = await loadPosts();
    renderBlogIndex(posts);
    renderPostPage(posts);
  } catch (error) {
    console.error('Blog data failed to load:', error);
    setLoadState(
      'Blog entries could not be loaded. Run the site through a local web server and refresh the page.',
      true,
    );
  }
});
