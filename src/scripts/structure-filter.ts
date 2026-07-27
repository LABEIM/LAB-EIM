export function initStructureFilter() {
  const tabs = document.querySelectorAll('#filter-tabs .filter-tab');
  const members = document.querySelectorAll('#member-grid .member-card-item');

  function applyFilter(filterVal: string) {
    tabs.forEach(tab => {
      if (tab.getAttribute('data-filter') === filterVal) {
        tab.classList.add('active');
      } else {
        tab.classList.remove('active');
      }
    });

    members.forEach(member => {
      const card = member as HTMLElement;
      const division = card.getAttribute('data-division');
      if (filterVal === 'all' || division === filterVal) {
        card.style.display = 'flex';
      } else {
        card.style.display = 'none';
      }
    });
  }

  function initFilterFromURL() {
    const params = new URLSearchParams(window.location.search);
    const divParam = params.get('div') || params.get('divisi') || 'all';
    
    let mappedParam = divParam;
    const filterTabsEl = document.getElementById('filter-tabs');
    const divisionsData = filterTabsEl?.getAttribute('data-divisions');
    if (divisionsData) {
      try {
        const divisionsList = JSON.parse(divisionsData);
        const match = divisionsList.find((d: any) => 
          d.id === divParam || (d.aliases && d.aliases.includes(divParam))
        );
        if (match) {
          mappedParam = match.id;
        }
      } catch (e) {
        console.error("Failed to parse divisions configuration", e);
      }
    }
    
    applyFilter(mappedParam);
  }

  // Handle click on tabs
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const filterVal = tab.getAttribute('data-filter') || 'all';
      applyFilter(filterVal);
      
      const newUrl = `${window.location.protocol}//${window.location.host}${window.location.pathname}?div=${filterVal}`;
      window.history.pushState({ path: newUrl }, '', newUrl);
    });
  });

  // Handle browser back/forward navigation
  window.addEventListener('popstate', initFilterFromURL);

  // Initialize filter on module load
  initFilterFromURL();
}
