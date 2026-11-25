// Каталог: создание карточек, поиск, фильтрация и сортировка.

// Создаёт DOM-элемент с классом и текстом (текст — только через textContent)
function makeElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) {
    element.className = className;
  }
  if (text !== undefined) {
    element.textContent = text;
  }
  return element;
}

// Цена: число и скрытая подпись для скринридера
function createPrice(tag, className, label, value) {
  const price = makeElement(tag, className);
  price.append(makeElement('span', 'visually-hidden', label), formatPrice(value));
  return price;
}

// Карточка товара собирается из DOM-элементов, без innerHTML
function createProductCard(product) {
  const item = makeElement('li', 'product-grid__item');
  const card = makeElement('article', 'product-card');
  const titleId = 'card-title-' + product.id;
  card.setAttribute('aria-labelledby', titleId);

  if (product.oldPrice) {
    card.classList.add('product-card--discount');
  }
  if (!product.isAvailable) {
    card.classList.add('product-card--unavailable');
  }

  // Фото и бейджи
  const media = makeElement('div', 'product-card__media');
  const badges = makeElement('div', 'product-card__badges');
  product.badges.forEach((badge) => {
    badges.append(makeElement('span', 'badge badge--' + badge.type, badge.text));
  });
  if (!product.isAvailable) {
    badges.append(makeElement('span', 'badge badge--muted', 'Нет в наличии'));
  }
  if (badges.children.length > 0) {
    media.append(badges);
  }

  const image = makeElement('img', 'product-card__image');
  image.src = 'images/products/' + product.image + '.webp';
  image.srcset = 'images/products/' + product.image + '-320.webp 320w, ' +
    'images/products/' + product.image + '.webp ' + product.imageWidth + 'w';
  image.sizes = '(min-width: 1024px) 260px, (min-width: 576px) 45vw, 100vw';
  image.alt = product.title;
  image.width = product.imageWidth;
  image.height = product.imageHeight;
  image.loading = 'lazy';
  media.append(image);

  // Текстовая часть
  const body = makeElement('div', 'product-card__body');
  const title = makeElement('h3', 'product-card__title');
  title.id = titleId;
  const titleLink = makeElement('a', 'product-card__title-link', product.title);
  titleLink.href = 'product.html';
  title.append(titleLink);

  const features = makeElement('ul', 'product-card__meta');
  product.features.forEach((feature) => {
    features.append(makeElement('li', '', feature));
  });

  const prices = makeElement('div', 'product-card__prices');
  prices.append(createPrice('p', 'product-card__price', 'Цена: ', product.price));
  if (product.oldPrice) {
    prices.append(createPrice('s', 'product-card__price-old', 'Старая цена: ', product.oldPrice));
  }

  // Кнопки
  const actions = makeElement('div', 'product-card__actions');
  const moreLink = makeElement('a', 'button button--outline button--small', 'Подробнее');
  moreLink.href = 'product.html';

  const cartButton = makeElement('button', 'button button--small product-card__button');
  cartButton.type = 'button';
  if (product.isAvailable) {
    cartButton.textContent = 'В корзину';
    cartButton.dataset.addToCart = '';
    cartButton.dataset.id = product.id;
  } else {
    cartButton.textContent = 'Нет в наличии';
    cartButton.disabled = true;
  }
  actions.append(moreLink, cartButton);

  body.append(
    makeElement('p', 'product-card__category', categoryNames[product.category]),
    title,
    makeElement('p', 'product-card__description', product.description),
    features,
    makeElement('p', 'product-card__stock', product.isAvailable ? 'В наличии' : 'Ожидается поступление'),
    prices,
    actions
  );

  card.append(media, body);
  item.append(card);
  return item;
}

// Выводит список товаров в контейнер, предварительно очистив его
function renderProducts(container, list) {
  container.replaceChildren();
  list.forEach((product) => {
    container.append(createProductCard(product));
  });
}

// Сортировка применяется к копии массива, исходный порядок не меняется
function sortProducts(list, sortType) {
  const sorted = [...list];

  if (sortType === 'price-asc') {
    sorted.sort((a, b) => a.price - b.price);
  } else if (sortType === 'price-desc') {
    sorted.sort((a, b) => b.price - a.price);
  } else if (sortType === 'title-asc') {
    sorted.sort((a, b) => a.title.localeCompare(b.title, 'ru'));
  }

  return sorted;
}

// ---------- Страница каталога ----------
function initCatalog() {
  const list = document.querySelector('#catalog-list');
  if (!list) {
    return;
  }

  const searchInput = document.querySelector('#catalog-search');
  const categorySelect = document.querySelector('#catalog-category');
  const availableCheckbox = document.querySelector('#catalog-available');
  const sortSelect = document.querySelector('#catalog-sort');
  const resetButton = document.querySelector('#catalog-reset');
  const countElement = document.querySelector('#catalog-count');
  const emptyBlock = document.querySelector('#catalog-empty');
  const emptyText = document.querySelector('#catalog-empty-text');
  const emptyResetButton = document.querySelector('#catalog-empty-reset');

  // Категория из адреса: catalog.html?category=running
  const params = new URLSearchParams(window.location.search);
  const categoryFromUrl = params.get('category');
  if (categoryFromUrl && categoryNames[categoryFromUrl]) {
    categorySelect.value = categoryFromUrl;
  }

  function getFilteredProducts() {
    const query = searchInput.value.trim().toLowerCase();
    const category = categorySelect.value;

    let result = products.filter((product) => product.title.toLowerCase().includes(query));

    if (category !== 'all') {
      result = result.filter((product) => product.category === category);
    }
    if (availableCheckbox.checked) {
      result = result.filter((product) => product.isAvailable);
    }

    return sortProducts(result, sortSelect.value);
  }

  function showEmptyState() {
    const query = searchInput.value.trim();
    // Запрос пользователя выводится через textContent, поэтому теги в нём не сработают
    if (query) {
      emptyText.textContent = 'По запросу «' + query + '» с выбранными фильтрами ничего не нашлось. ' +
        'Проверьте написание или сбросьте фильтры.';
    } else {
      emptyText.textContent = 'С выбранными фильтрами товаров нет. Попробуйте другую категорию или сбросьте фильтры.';
    }
  }

  function updateCatalog() {
    const result = getFilteredProducts();
    renderProducts(list, result);

    countElement.textContent = 'Найдено ' + result.length + ' ' +
      pluralize(result.length, ['товар', 'товара', 'товаров']);

    const isEmpty = result.length === 0;
    emptyBlock.hidden = !isEmpty;
    list.hidden = isEmpty;
    if (isEmpty) {
      showEmptyState();
    }
  }

  function resetFilters() {
    searchInput.value = '';
    categorySelect.value = 'all';
    availableCheckbox.checked = false;
    sortSelect.value = 'default';
    updateCatalog();
    searchInput.focus();
  }

  searchInput.addEventListener('input', updateCatalog);
  categorySelect.addEventListener('change', updateCatalog);
  availableCheckbox.addEventListener('change', updateCatalog);
  sortSelect.addEventListener('change', updateCatalog);
  resetButton.addEventListener('click', resetFilters);
  emptyResetButton.addEventListener('click', resetFilters);

  updateCatalog();
}

// ---------- Популярные товары на главной ----------
function renderPopularProducts() {
  const container = document.querySelector('#popular-list');
  if (!container) {
    return;
  }
  const popular = products.filter((product) => product.isPopular);
  renderProducts(container, popular.slice(0, 4));
}

// ---------- Похожие товары на странице товара ----------
function renderSimilarProducts() {
  const container = document.querySelector('#similar-list');
  if (!container) {
    return;
  }
  const currentId = Number(container.dataset.productId);
  const current = products.find((product) => product.id === currentId);
  if (!current) {
    return;
  }

  // Сначала товары той же категории, потом остальные
  const sameCategory = products.filter((p) => p.category === current.category && p.id !== currentId);
  const others = products.filter((p) => p.category !== current.category);
  renderProducts(container, [...sameCategory, ...others].slice(0, 3));
}
