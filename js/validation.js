// Валидация формы заявки на странице order.html.
// Ошибки выводятся под полями и в блоке статуса, без alert().

// Правила проверки: функция возвращает текст ошибки или пустую строку
const orderRules = {
  name(value) {
    return value.trim().length >= 2 ? '' : 'Укажите имя — минимум 2 буквы.';
  },
  phone(value) {
    const digits = value.replace(/\D/g, '');
    if (!value.trim()) {
      return 'Укажите телефон.';
    }
    return digits.length >= 10 && digits.length <= 11 ? '' : 'Телефон должен содержать 10–11 цифр, например +7 999 123-45-67.';
  },
  email(value) {
    if (!value.trim()) {
      return 'Укажите e-mail.';
    }
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()) ? '' : 'Проверьте e-mail: нужен формат name@example.com.';
  },
  topic(value) {
    return value ? '' : 'Выберите тему заявки.';
  },
  agree(value, field) {
    return field.checked ? '' : 'Нужно согласие на обработку персональных данных.';
  }
};

// Показывает или убирает ошибку у конкретного поля
function showFieldError(field, message) {
  const wrapper = field.closest('.form__field');
  const errorElement = wrapper.querySelector('.form__error');

  errorElement.textContent = message;
  wrapper.classList.toggle('form__field--error', message !== '');
  field.setAttribute('aria-invalid', message !== '' ? 'true' : 'false');
}

function validateField(field) {
  const rule = orderRules[field.name];
  const message = rule ? rule(field.value, field) : '';
  showFieldError(field, message);
  return message === '';
}

function showFormStatus(statusElement, type, text) {
  statusElement.textContent = text;
  statusElement.hidden = false;
  statusElement.classList.remove('form__status--error', 'form__status--success');
  statusElement.classList.add('form__status--' + type);
}

function initOrderForm() {
  const form = document.querySelector('#order-form');
  if (!form) {
    return;
  }

  const status = document.querySelector('#order-status');
  const submitButton = document.querySelector('#order-submit');
  const fields = Object.keys(orderRules).map((name) => form.elements[name]);

  // После первой ошибки поле перепроверяется при каждом вводе
  fields.forEach((field) => {
    const eventName = field.type === 'checkbox' || field.tagName === 'SELECT' ? 'change' : 'input';
    field.addEventListener(eventName, () => {
      if (field.closest('.form__field').classList.contains('form__field--error')) {
        validateField(field);
      }
    });
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const results = fields.map((field) => validateField(field));
    const firstInvalid = fields.find((field, index) => !results[index]);
    const cartIsEmpty = getCartItems().length === 0;

    if (firstInvalid) {
      showFormStatus(status, 'error', 'Заявка не отправлена: исправьте поля, отмеченные красным.');
      firstInvalid.focus();
      return;
    }
    if (cartIsEmpty) {
      showFormStatus(status, 'error', 'Корзина пуста: добавьте товар в каталоге, а затем отправьте заявку.');
      return;
    }

    // Имитация отправки на сервер
    const name = form.elements.name.value.trim();
    const phone = form.elements.phone.value.trim();
    submitButton.disabled = true;
    submitButton.textContent = 'Отправляем…';

    setTimeout(() => {
      form.reset();
      showFormStatus(status, 'success',
        'Спасибо, ' + name + '! Заявка подготовлена. Менеджер перезвонит по номеру ' + phone + ' в течение 10 минут.');
      clearCart();
      renderOrderSummary();
      submitButton.disabled = false;
      submitButton.textContent = 'Отправить заявку';
      status.focus();
    }, 1000);
  });

  // «Очистить форму» убирает и ошибки
  form.addEventListener('reset', () => {
    fields.forEach((field) => showFieldError(field, ''));
    status.hidden = true;
  });
}
