// Модальное окно «Заказать звонок».
// Без JavaScript окно открывается через CSS :target (как в КР №3),
// с JavaScript — классом modal--open, плюс закрытие по Esc и возврат фокуса.

function initModal() {
  const modal = document.querySelector('#callback-modal');
  if (!modal) {
    return;
  }

  const openLinks = document.querySelectorAll('a[href="#callback-modal"]');
  const closeElements = modal.querySelectorAll('[data-modal-close]');
  let lastOpener = null;

  function openModal(opener) {
    lastOpener = opener;
    modal.classList.add('modal--open');
    document.body.classList.add('page--modal-open');

    // фокус ставим после того, как окно стало видимым (у него есть анимация появления)
    const firstField = modal.querySelector('input');
    if (firstField) {
      setTimeout(() => firstField.focus(), 50);
    }
  }

  function closeModal() {
    modal.classList.remove('modal--open');
    document.body.classList.remove('page--modal-open');

    // если окно было открыто по адресу ...#callback-modal, убираем якорь
    if (window.location.hash === '#callback-modal') {
      history.replaceState(null, '', window.location.pathname + window.location.search);
    }
    if (lastOpener) {
      lastOpener.focus();
    }
  }

  openLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      openModal(link);
    });
  });

  closeElements.forEach((element) => {
    element.addEventListener('click', (event) => {
      event.preventDefault();
      closeModal();
    });
  });

  document.addEventListener('keydown', (event) => {
    const isOpen = modal.classList.contains('modal--open') || window.location.hash === '#callback-modal';
    if (event.key === 'Escape' && isOpen) {
      closeModal();
    }
  });
}
