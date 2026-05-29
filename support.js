document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('support-form');
  const status = document.getElementById('support-status');

  if (!form || !status) return;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const name = String(formData.get('name') || '').trim();
    const email = String(formData.get('email') || '').trim();
    const button = form.querySelector('button[type="submit"]');

    status.textContent = 'Preparing secure checkout.';
    if (button) button.disabled = true;

    try {
      const response = await fetch('/api/support-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email })
      });

      const data = await response.json();

      if (!response.ok || !data.authorization_url) {
        throw new Error(data.error || 'Checkout could not be started.');
      }

      window.location.href = data.authorization_url;
    } catch (error) {
      status.textContent = error.message || 'Checkout could not be started.';
      if (button) button.disabled = false;
    }
  });
});
