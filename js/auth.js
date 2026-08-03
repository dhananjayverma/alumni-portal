document.addEventListener('DOMContentLoaded', () => {
    initPageLoader();

    const providerButtons = Array.from(document.querySelectorAll('[data-provider]'));
    const emailForm = document.querySelector('[data-email-form]');
    const message = document.querySelector('[data-message]');

    function showDummyMessage(text) {
        if (message) {
            message.textContent = text;
            message.classList.add('is-success');
        }
    }

    providerButtons.forEach((button) => {
        button.addEventListener('click', () => {
            showDummyMessage(`${button.dataset.provider} access is dummy for now.`);
        });
    });

    if (emailForm) {
        emailForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const email = new FormData(emailForm).get('email');
            showDummyMessage(`Email access captured for ${email}. Dummy only.`);
        });
    }
});

function initPageLoader() {
    const loader = document.querySelector('[data-page-loader]');
    if (!loader) return;

    function hideLoader() {
        loader.classList.add('is-hidden');
        window.setTimeout(() => loader.remove(), 550);
    }

    if (document.readyState === 'complete') {
        window.setTimeout(hideLoader, 350);
    } else {
        window.addEventListener('load', () => window.setTimeout(hideLoader, 350), { once: true });
        window.setTimeout(hideLoader, 2500);
    }
}
