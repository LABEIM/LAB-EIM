export function initShareButtons(itemType: string = 'Link') {
  const shareBtns = document.querySelectorAll('.share-btn');
  shareBtns.forEach(btn => {
    btn.addEventListener('click', async () => {
      if (navigator.share) {
        try {
          await navigator.share({
            title: document.title,
            url: window.location.href,
          });
        } catch (err) {
          // Ignore share cancellation
        }
      } else {
        let status = btn.parentElement?.querySelector<HTMLElement>('.share-status');
        if (!status) {
          status = document.createElement('span');
          status.className = 'share-status';
          status.setAttribute('role', 'status');
          btn.insertAdjacentElement('afterend', status);
        }
        try {
          await navigator.clipboard.writeText(window.location.href);
          status.textContent = `Tautan ${itemType.toLowerCase()} disalin.`;
        } catch {
          status.textContent = 'Tautan tidak dapat disalin otomatis.';
        }
      }
    });
  });
}
