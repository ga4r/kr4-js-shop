// Корзина: хранение в localStorage, расчёт суммы, промокод, вывод на страницах.

const CART_KEY = 'runsmart-cart';
const PROMO_KEY = 'runsmart-promo';

// Промокоды и размер скидки в процентах
const promoCodes = {
  RUN10: 10
};

// ---------- Работа с данными корзины ----------

// В localStorage лежит массив вида [{ id: 1, qty: 2 }]
function getCart() {
  try {
    const saved = JSON.parse(localStorage.getItem(CART_KEY));
    return Array.isArray(saved) ? saved : [];
  } catch (error) {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartCounter();
}

function addToCart(productId) {
  const cart = getCart();
  const item = cart.find((cartItem) => cartItem.id === productId);

  if (item) {
    item.qty += 1;
  } else {
    cart.push({ id: productId, qty: 1 });
  }
  saveCart(cart);
}

function changeQuantity(productId, delta) {
  const cart = getCart();
  const item = cart.find((cartItem) => cartItem.id === productId);
  if (!item) {
    return;
  }

  item.qty += delta;
  // при количестве 0 товар удаляется из корзины
  saveCart(item.qty > 0 ? cart : cart.filter((cartItem) => cartItem.id !== productId));
}

function removeFromCart(productId) {
  saveCart(getCart().filter((cartItem) => cartItem.id !== productId));
}

function clearCart() {
  localStorage.removeItem(CART_KEY);
  localStorage.removeItem(PROMO_KEY);
  updateCartCounter();
}

// Товары корзины вместе с данными из data.js
function getCartItems() {
  return getCart()
    .map((cartItem) => {
      const product = products.find((p) => p.id === cartItem.id);
      return product ? { ...product, qty: cartItem.qty } : null;
    })
    .filter((item) => item !== null);
}

// ---------- Расчёты через reduce ----------

function getCartCount(items) {
  return items.reduce((count, item) => count + item.qty, 0);
}

function getCartSubtotal(items) {
  return items.reduce((sum, item) => sum + item.price * item.qty, 0);
}

function getPromoCode() {
  return localStorage.getItem(PROMO_KEY) || '';
}

function getDiscount(subtotal) {
  const percent = promoCodes[getPromoCode()] || 0;
  return Math.round(subtotal * percent / 100);
}

// ---------- Счётчик в шапке ----------

function updateCartCounter() {
  const count = getCartCount(getCartItems());
  document.querySelectorAll('[data-cart-counter]').forEach((counter) => {
    counter.textContent = count;
    counter.classList.toggle('cart-counter--empty', count === 0);
  });
}

// ---------- Кнопки «В корзину» ----------
// Один обработчик на весь документ (делегирование событий):
// работает и для карточек, которые созданы через JavaScript.
function initAddToCartButtons() {
  document.addEventListener('click', (event) => {
    const button = event.target.closest('[data-add-to-cart]');
    if (!button) {
      return;
    }

    addToCart(Number(button.dataset.id));

    const initialText = button.textContent;
    button.textContent = 'Добавлено ✓';
    button.classList.add('button--added');
    setTimeout(() => {
      button.textContent = initialText;
      button.classList.remove('button--added');
    }, 1500);
  });
}

// ---------- Страница корзины ----------

function createCartRow(item) {
  const row = makeElement('li', 'cart-item');

  const image = makeElement('img', 'cart-item__image');
  image.src = 'images/products/' + item.image + '-320.webp';
  image.alt = '';
  image.width = 80;
  image.height = 80;

  const info = makeElement('div', 'cart-item__info');
  const title = makeElement('a', 'cart-item__title', item.title);
  title.href = 'product.html';
  info.append(
    title,
    makeElement('p', 'cart-item__category', categoryNames[item.category]),
    makeElement('p', 'cart-item__price', formatPrice(item.price) + ' за шт.')
  );

  const quantity = makeElement('div', 'cart-item__qty');
  const minus = makeElement('button', 'cart-item__qty-button', '−');
  minus.type = 'button';
  minus.dataset.action = 'decrease';
  minus.dataset.id = item.id;
  minus.setAttribute('aria-label', 'Уменьшить количество: ' + item.title);

  const value = makeElement('span', 'cart-item__qty-value', item.qty);

  const plus = makeElement('button', 'cart-item__qty-button', '+');
  plus.type = 'button';
  plus.dataset.action = 'increase';
  plus.dataset.id = item.id;
  plus.setAttribute('aria-label', 'Увеличить количество: ' + item.title);
  quantity.append(minus, value, plus);

  const total = makeElement('p', 'cart-item__total', formatPrice(item.price * item.qty));

  const remove = makeElement('button', 'cart-item__remove', 'Удалить');
  remove.type = 'button';
  remove.dataset.action = 'remove';
  remove.dataset.id = item.id;
  remove.setAttribute('aria-label', 'Удалить из корзины: ' + item.title);

  row.append(image, info, quantity, total, remove);
  return row;
}

function initCartPage() {
  const list = document.querySelector('#cart-list');
  if (!list) {
    return;
  }

  const content = document.querySelector('#cart-content');
  const emptyBlock = document.querySelector('#cart-empty');
  const countElement = document.querySelector('#cart-count');
  const subtotalElement = document.querySelector('#cart-subtotal');
  const discountRow = document.querySelector('#cart-discount-row');
  const discountElement = document.querySelector('#cart-discount');
  const totalElement = document.querySelector('#cart-total');
  const clearButton = document.querySelector('#cart-clear');
  const promoForm = document.querySelector('#promo-form');
  const promoInput = document.querySelector('#promo-input');
  const promoMessage = document.querySelector('#promo-message');

  function renderCart() {
    const items = getCartItems();
    const isEmpty = items.length === 0;

    content.hidden = isEmpty;
    emptyBlock.hidden = !isEmpty;
    if (isEmpty) {
      return;
    }

    list.replaceChildren();
    items.forEach((item) => list.append(createCartRow(item)));

    const count = getCartCount(items);
    const subtotal = getCartSubtotal(items);
    const discount = getDiscount(subtotal);

    countElement.textContent = count + ' ' + pluralize(count, ['товар', 'товара', 'товаров']);
    subtotalElement.textContent = formatPrice(subtotal);
    discountRow.hidden = discount === 0;
    discountElement.textContent = '−' + formatPrice(discount);
    totalElement.textContent = formatPrice(subtotal - discount);
  }

  // Делегирование: один обработчик на список для всех кнопок −, + и «Удалить»
  list.addEventListener('click', (event) => {
    const button = event.target.closest('[data-action]');
    if (!button) {
      return;
    }
    const id = Number(button.dataset.id);

    if (button.dataset.action === 'increase') {
      changeQuantity(id, 1);
    } else if (button.dataset.action === 'decrease') {
      changeQuantity(id, -1);
    } else if (button.dataset.action === 'remove') {
      removeFromCart(id);
    }
    renderCart();
  });

  clearButton.addEventListener('click', () => {
    clearCart();
    renderCart();
  });

  promoForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const code = promoInput.value.trim().toUpperCase();

    promoMessage.classList.remove('promo__message--success', 'promo__message--error');
    if (promoCodes[code]) {
      localStorage.setItem(PROMO_KEY, code);
      promoMessage.textContent = 'Промокод ' + code + ' применён: скидка ' + promoCodes[code] + '%.';
      promoMessage.classList.add('promo__message--success');
    } else {
      localStorage.removeItem(PROMO_KEY);
      promoMessage.textContent = code ? 'Промокод «' + code + '» не найден.' : 'Введите промокод.';
      promoMessage.classList.add('promo__message--error');
    }
    renderCart();
  });

  if (getPromoCode()) {
    promoInput.value = getPromoCode();
  }
  renderCart();
}

// ---------- Состав заявки на странице order.html ----------

function renderOrderSummary() {
  const list = document.querySelector('#order-summary-list');
  if (!list) {
    return;
  }

  const emptyText = document.querySelector('#order-summary-empty');
  const totals = document.querySelector('#order-summary-totals');
  const discountRow = document.querySelector('#order-discount-row');
  const discountElement = document.querySelector('#order-discount');
  const totalElement = document.querySelector('#order-total');

  const items = getCartItems();
  const isEmpty = items.length === 0;

  list.replaceChildren();
  list.hidden = isEmpty;
  totals.hidden = isEmpty;
  emptyText.hidden = !isEmpty;
  if (isEmpty) {
    return;
  }

  items.forEach((item) => {
    const row = makeElement('li', 'order-summary__item');
    row.append(
      makeElement('span', 'order-summary__item-name', item.title + ' × ' + item.qty),
      makeElement('span', 'order-summary__item-price', formatPrice(item.price * item.qty))
    );
    list.append(row);
  });

  const subtotal = getCartSubtotal(items);
  const discount = getDiscount(subtotal);
  discountRow.hidden = discount === 0;
  discountElement.textContent = '−' + formatPrice(discount);
  totalElement.textContent = formatPrice(subtotal - discount);
}
