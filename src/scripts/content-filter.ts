export interface ContentFilterOptions {
  gridId: string;
  cardClass: string;
  itemsPerPage?: number;
  emptyStateId?: string;
  itemName?: string; // e.g. "Berita" or "Kegiatan"
}

export interface FilterCard {
  el: HTMLElement;
  category: string;
  status: string;
  searchText: string;
  dateMs: number;
  audit: boolean;
}

export interface FilterState {
  search: string;
  category: string;
  status: string;
  sort: 'asc' | 'desc';
  page: number;
  perPage: number;
  forceEmpty: boolean;
  hideAudit: boolean;
}

export interface FilterResult {
  total: number;
  totalPages: number;
  page: number;
  pageItems: FilterCard[];
  matchedItems: FilterCard[];
}

/**
 * Pure filter/sort/paginate step for the content grid. Keeps the behaviour of
 * the former inline DOM loop: invalid dates are stored as 0, so they order
 * last on descending and first on ascending.
 */
export function selectVisibleCards(items: FilterCard[], state: FilterState): FilterResult {
  const query = state.search.trim().toLowerCase();
  const filtered = state.forceEmpty ? [] : items.filter((item) => {
    if (state.hideAudit && item.audit) return false;
    if (state.category !== 'all' && item.category.toLowerCase() !== state.category.toLowerCase()) return false;
    if (state.status !== 'all' && item.status.toLowerCase() !== state.status.toLowerCase()) return false;
    if (query && !item.searchText.toLowerCase().includes(query)) return false;
    return true;
  });

  const matchedItems = filtered.sort((a, b) =>
    state.sort === 'asc' ? a.dateMs - b.dateMs : b.dateMs - a.dateMs
  );

  const total = matchedItems.length;
  const totalPages = Math.ceil(total / state.perPage) || 1;
  const page = Math.min(Math.max(1, state.page), totalPages);
  const startIndex = (page - 1) * state.perPage;
  const pageItems = matchedItems.slice(startIndex, startIndex + state.perPage);

  return { total, totalPages, page, pageItems, matchedItems };
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

  // Card metadata is read once; nothing mutates these attributes at runtime.
  const items: FilterCard[] = cards.map((el) => {
    const time = new Date(el.getAttribute('data-date') || '').getTime();
    return {
      el,
      category: el.getAttribute('data-category') || '',
      status: el.getAttribute('data-status') || '',
      searchText: el.getAttribute('data-search-text') || '',
      dateMs: Number.isNaN(time) ? 0 : time,
      audit: el.getAttribute('data-audit') === 'true',
    };
  });

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
  let currentSort: 'asc' | 'desc' = 'desc'; // 'desc' | 'asc'
  let currentPage = 1;
  let currentAuditParam: string | null = null;
  let currentEmptyParam: string | null = null;

  function parseURLState() {
    const params = new URLSearchParams(window.location.search);
    currentSearch = params.get('q') || params.get('search') || '';
    currentCategory = params.get('category') || params.get('cat') || 'all';
    currentStatus = params.get('status') || 'all';
    currentSort = params.get('sort') === 'asc' ? 'asc' : 'desc';
    currentAuditParam = params.get('audit') || params.get('show_audit');
    currentEmptyParam = params.get('empty') || params.get('mock_empty');
    const pageParam = parseInt(params.get('page') || '1', 10);
    currentPage = isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;
  }

  function scrollToGrid() {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    gridEl?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
  }

  function syncURLState() {
    const params = new URLSearchParams();
    if (currentSearch.trim()) params.set('search', currentSearch.trim());
    if (currentCategory !== 'all') params.set('category', currentCategory);
    if (currentStatus !== 'all') params.set('status', currentStatus);
    if (currentSort !== 'desc') params.set('sort', currentSort);
    if (currentAuditParam !== null) params.set('audit', currentAuditParam);
    if (currentEmptyParam !== null) params.set('empty', currentEmptyParam);
    if (currentPage > 1) params.set('page', currentPage.toString());

    const queryString = params.toString();
    const newUrl = `${window.location.pathname}${queryString ? '?' + queryString : ''}`;
    window.history.pushState({ path: newUrl }, '', newUrl);
  }

  function syncUIFromState() {
    if (searchInput) {
      searchInput.value = currentSearch;
      if (searchClearBtn) {
        searchClearBtn.style.display = currentSearch.trim() ? 'flex' : 'none';
      }
    }

    if (sortSelect) {
      sortSelect.value = currentSort;
    }

    categoryPills.forEach(pill => {
      const cat = pill.getAttribute('data-category') || 'all';
      const isActive = cat.toLowerCase() === currentCategory.toLowerCase();
      pill.classList.toggle('active', isActive);
      pill.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });

    statusPills.forEach(pill => {
      const st = pill.getAttribute('data-status') || 'all';
      const isActive = st.toLowerCase() === currentStatus.toLowerCase();
      pill.classList.toggle('active', isActive);
      pill.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });

    const isFiltered = currentSearch.trim() !== '' || currentCategory !== 'all' || currentStatus !== 'all' || currentSort !== 'desc' || currentAuditParam !== null || currentEmptyParam !== null;
    if (resetBtn) {
      resetBtn.style.display = isFiltered ? 'inline-flex' : 'none';
    }
  }

  function render() {
    if (!gridEl) return;
    syncUIFromState();

    // 1-3. Filter, sort and paginate from the metadata read at init
    const result = selectVisibleCards(items, {
      search: currentSearch,
      category: currentCategory,
      status: currentStatus,
      sort: currentSort,
      page: currentPage,
      perPage: itemsPerPage,
      forceEmpty: currentEmptyParam === 'true' || currentEmptyParam === '1',
      hideAudit: currentAuditParam === 'false' || currentAuditParam === '0',
    });
    currentPage = result.page;

    const totalMatching = result.total;
    const totalPages = result.totalPages;
    const startIndex = (result.page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const visibleCards = new Set(result.pageItems.map(item => item.el));

    // 4. Update DOM card visibility & ordering
    // Hide all cards first
    cards.forEach(card => {
      card.style.display = 'none';
    });

    // Re-append matching cards in sorted order to grid
    result.matchedItems.forEach(item => {
      if (visibleCards.has(item.el)) {
        item.el.style.display = 'flex';
      }
      gridEl.appendChild(item.el);
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
            if (p === currentPage) {
              btn.setAttribute('aria-current', 'page');
            }
            btn.addEventListener('click', () => {
              currentPage = p;
              syncURLState();
              render();
              scrollToGrid();
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
        searchClearBtn.style.display = currentSearch.trim() ? 'flex' : 'none';
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
      currentSort = sortSelect.value === 'asc' ? 'asc' : 'desc';
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
      currentAuditParam = null;
      currentEmptyParam = null;
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
        scrollToGrid();
      }
    });
  }

  if (paginationNext) {
    paginationNext.addEventListener('click', () => {
      currentPage++;
      syncURLState();
      render();
      scrollToGrid();
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
