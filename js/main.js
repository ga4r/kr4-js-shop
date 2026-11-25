// Общие функции и запуск скриптов на странице.
// Скрипты подключены в конце body, поэтому к этому моменту HTML уже загружен.

// 7021 → «7 021 ₽»
function formatPrice(value) {
  return value.toLocaleString('ru-RU') + ' ₽';
}

// pluralize(3, ['товар', 'товара', 'товаров']) → «товара»
function pluralize(count, forms) {
  const mod10 = count % 10;
  const mod100 = count % 100;

  if (mod10 === 1 && mod100 !== 11) {
    return forms[0];
  }
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) {
    return forms[1];
  }
  return forms[2];
}

// Каждая функция сама проверяет, есть ли на странице нужные элементы,
// поэтому один и тот же набор скриптов работает на всех страницах.
updateCartCounter();
initAddToCartButtons();
initModal();
renderPopularProducts();
renderSimilarProducts();
initCatalog();
initCartPage();
renderOrderSummary();
initOrderForm();
