export interface ContentFilterOptions {
  gridId: string;
  cardClass: string;
  itemsPerPage?: number;
  emptyStateId?: string;
  itemName?: string; // e.g. "Berita" or "Kegiatan"
}

export function initContentFilter(options: ContentFilterOptions) {
  const {
    gridId,
    cardClass,
    itemsPerPage = 6,
    emptyStateId = 'empty-state-notice',
    itemName = 'Item',
  } = options;

  const gridEl = document.getElementById(gridId);
  if (!gridEl) return;

  const cards = Array.from(gridEl.querySelectorAll(`.${cardClass}`)) as HTMLElement[];
  if (cards.length === 0) return;

  // DOM Elements
  const searchInput = document.getElementById('filter-search-input') as HTMLInputElement | null;
  const searchClearBtn = document.getElementById('search-clear-btn');
  const sortSelect = document.getElementById('filter-sort-select') as HTMLSelectElement | null;
  const resetBtn = document.getElementById('filter-reset-btn');
  const resultsCountEl = document.getElementById('filter-results-count');
  const emptyStateEl = document.getElementById(emptyStateId);

  const categoryPills = document.querySelectorAll('#category-pills-row .filter-pill');
  const statusPills = document.querySelectorAll('#status-pills-row .filter-pill');

  // Pagination DOM
  const paginationContainer = document.getElementById('pagination-container');
  const paginationNumbers = document.getElementById('pagination-numbers');
  const paginationPrev = document.getElementById('pagination-prev') as HTMLButtonElement | null;
  const paginationNext = document.getElementById('pagination-next') as HTMLButtonElement | null;
  const paginationInfo = document.getElementById('pagination-info');

  // State
  let currentSearch = '';
  let currentCategory = 'all';
  let currentStatus = 'all';
  let currentSort = 'desc'; // 'desc' | 'asc'
  let currentPage = 1;

  function parseURLState() {
    const params = new URLSearchParams(window.location.search);
    currentSearch = params.get('q') || params.get('search') || '';
    currentCategory = params.get('category') || params.get('cat') || 'all';
    currentStatus = params.get('status') || 'all';
    currentSort = params.get('sort') || 'desc';
    const pageParam = parseInt(params.get('page') || '1', 10);
    currentPage = isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;
  }

  function syncURLState() {
    const params = new URLSearchParams();
    if (currentSearch.trim()) params.set('search', currentSearch.trim());
    if (currentCategory !== 'all') params.set('category', currentCategory);
    if (currentStatus !== 'all') params.set('status', currentStatus);
    if (currentSort !== 'desc') params.set('sort', currentSort);
    if (currentPage > 1) params.set('page', currentPage.toString());

    const queryString = params.toString();
    const newUrl = `${window.location.pathname}${queryString ? '?' + queryString : ''}`;
    window.history.pushState({ path: newUrl }, '', newUrl);
  }

  function syncUIFromState() {
    if (searchInput) {
      searchInput.value = currentSearch;
      if (searchClearBtn) {
        searchClearBtn.style.display = currentSearch.trim() ? 'block' : 'none';
      }
    }

    if (sortSelect) {
      sortSelect.value = currentSort;
    }

    categoryPills.forEach(pill => {
      const cat = pill.getAttribute('data-category') || 'all';
      if (cat.toLowerCase() === currentCategory.toLowerCase()) {
        pill.classList.add('active');
      } else {
        pill.classList.remove('active');
      }
    });

    statusPills.forEach(pill => {
      const st = pill.getAttribute('data-status') || 'all';
      if (st.toLowerCase() === currentStatus.toLowerCase()) {
        pill.classList.add('active');
      } else {
        pill.classList.remove('active');
      }
    });

    const isFiltered = currentSearch.trim() !== '' || currentCategory !== 'all' || currentStatus !== 'all' || currentSort !== 'desc';
    if (resetBtn) {
      resetBtn.style.display = isFiltered ? 'inline-flex' : 'none';
    }
  }

  function render() {
    if (!gridEl) return;
    syncUIFromState();

    // 1. Filter matching cards
    const query = currentSearch.toLowerCase().trim();
    const matchingCards = cards.filter(card => {
      const catAttr = card.getAttribute('data-category') || '';
      const statusAttr = card.getAttribute('data-status') || '';
      const searchText = card.getAttribute('data-search-text') || '';

      const matchesCat = currentCategory === 'all' || catAttr.toLowerCase() === currentCategory.toLowerCase();
      const matchesStatus = currentStatus === 'all' || statusAttr.toLowerCase() === currentStatus.toLowerCase();
      const matchesQuery = !query || searchText.toLowerCase().includes(query);

      return matchesCat && matchesStatus && matchesQuery;
    });

    // 2. Sort matching cards
    matchingCards.sort((a, b) => {
      const dateAStr = a.getAttribute('data-date') || '';
      const dateBStr = b.getAttribute('data-date') || '';
      const timeA = new Date(dateAStr).getTime();
      const timeB = new Date(dateBStr).getTime();

      const validA = !isNaN(timeA) ? timeA : 0;
      const validB = !isNaN(timeB) ? timeB : 0;

      return currentSort === 'asc' ? validA - validB : validB - validA;
    });

    // 3. Handle Pagination calculations
    const totalMatching = matchingCards.length;
    const totalPages = Math.ceil(totalMatching / itemsPerPage) || 1;

    if (currentPage > totalPages) {
      currentPage = totalPages;
    }

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const visibleCards = new Set(matchingCards.slice(startIndex, endIndex));

    // 4. Update DOM card visibility & ordering
    // Hide all cards first
    cards.forEach(card => {
      card.style.display = 'none';
    });

    // Re-append matching cards in sorted order to grid
    matchingCards.forEach(card => {
      if (visibleCards.has(card)) {
        card.style.display = 'flex';
      }
      gridEl.appendChild(card);
    });

    // 5. Update Empty State Notice
    if (emptyStateEl) {
      emptyStateEl.style.display = totalMatching === 0 ? 'block' : 'none';
    }

    // 6. Update Filter Results Count
    if (resultsCountEl) {
      if (totalMatching === 0) {
        resultsCountEl.textContent = `Tidak ada ${itemName.toLowerCase()} ditemukan`;
      } else {
        const fromNum = startIndex + 1;
        const toNum = Math.min(endIndex, totalMatching);
        resultsCountEl.textContent = `Menampilkan ${fromNum}-${toNum} dari ${totalMatching} ${itemName}`;
      }
    }

    // 7. Update Pagination Controls
    if (paginationContainer) {
      if (totalPages <= 1) {
        paginationContainer.style.display = 'none';
      } else {
        paginationContainer.style.display = 'flex';

        if (paginationPrev) paginationPrev.disabled = currentPage <= 1;
        if (paginationNext) paginationNext.disabled = currentPage >= totalPages;
        if (paginationInfo) paginationInfo.textContent = `Halaman ${currentPage} dari ${totalPages}`;

        if (paginationNumbers) {
          paginationNumbers.innerHTML = '';
          for (let p = 1; p <= totalPages; p++) {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = `pagination-btn ${p === currentPage ? 'active' : ''}`;
            btn.textContent = p.toString();
            btn.addEventListener('click', () => {
              currentPage = p;
              syncURLState();
              render();
              gridEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
            paginationNumbers.appendChild(btn);
          }
        }
      }
    }
  }

  // Event Listeners
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      currentSearch = searchInput.value;
      currentPage = 1;
      if (searchClearBtn) {
        searchClearBtn.style.display = currentSearch.trim() ? 'block' : 'none';
      }
      syncURLState();
      render();
    });
  }

  if (searchClearBtn) {
    searchClearBtn.addEventListener('click', () => {
      currentSearch = '';
      if (searchInput) searchInput.value = '';
      searchClearBtn.style.display = 'none';
      currentPage = 1;
      syncURLState();
      render();
    });
  }

  if (sortSelect) {
    sortSelect.addEventListener('change', () => {
      currentSort = sortSelect.value;
      currentPage = 1;
      syncURLState();
      render();
    });
  }

  categoryPills.forEach(pill => {
    pill.addEventListener('click', () => {
      currentCategory = pill.getAttribute('data-category') || 'all';
      currentPage = 1;
      syncURLState();
      render();
    });
  });

  statusPills.forEach(pill => {
    pill.addEventListener('click', () => {
      currentStatus = pill.getAttribute('data-status') || 'all';
      currentPage = 1;
      syncURLState();
      render();
    });
  });

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      currentSearch = '';
      currentCategory = 'all';
      currentStatus = 'all';
      currentSort = 'desc';
      currentPage = 1;
      syncURLState();
      render();
    });
  }

  if (paginationPrev) {
    paginationPrev.addEventListener('click', () => {
      if (currentPage > 1) {
        currentPage--;
        syncURLState();
        render();
        gridEl?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }

  if (paginationNext) {
    paginationNext.addEventListener('click', () => {
      currentPage++;
      syncURLState();
      render();
      gridEl?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  // Handle browser back/forward navigation
  window.addEventListener('popstate', () => {
    parseURLState();
    render();
  });

  // Initial load
  parseURLState();
  render();
}
