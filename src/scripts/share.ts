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
        const wrap = btn.closest<HTMLElement>('.share-wrap') ?? (() => {
          const el = document.createElement('span');
          el.className = 'share-wrap';
          btn.replaceWith(el);
          el.appendChild(btn);
          return el;
        })();
        let status = wrap.querySelector<HTMLElement>('.share-status');
        if (!status) {
          status = document.createElement('span');
          status.className = 'share-status';
          status.setAttribute('role', 'status');
          wrap.insertBefore(status, btn);
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
