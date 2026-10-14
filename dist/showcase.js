// This homepage example is independent of the full demo and never saves a setting.
const messages = {
  explore: { icon: 'moon', text: 'The Moon stays round. We see different parts lit by the Sun.' },
  together: { icon: 'parents', text: 'Let’s explore that question with your grown-up.' }
};
const choices = [...document.querySelectorAll('[data-parent-choice]')];
const response = document.querySelector('#sample-response');
const text = document.querySelector('#sample-response-text');
const symbol = document.querySelector('#response-icon use');
if (response && text && symbol) {
  choices.forEach(button => {
    button.disabled = false;
    button.addEventListener('click', () => {
      const choice = button.dataset.parentChoice;
      if (!messages[choice] || button.getAttribute('aria-pressed') === 'true') return;
      choices.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
      response.dataset.choice = choice;
      text.textContent = messages[choice].text;
      symbol.setAttribute('href', '/assets/icons.svg#' + messages[choice].icon);
      window.TrustinMotion?.preview(response.querySelector('.response-symbol'));
    });
  });
}
