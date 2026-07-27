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
        await navigator.clipboard.writeText(window.location.href);
        alert(`${itemType} link copied to clipboard!`);
      }
    });
  });
}
