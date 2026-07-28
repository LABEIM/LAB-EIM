import { isDivisionMatch, getDivisionInfo, type DivisionConfig } from '../utils/division-mapper';

export function initStructureFilter() {
  const tabs = document.querySelectorAll('#filter-tabs .filter-tab');
  const members = document.querySelectorAll('#member-grid .member-card-item');

  const filterTabsEl = document.getElementById('filter-tabs');
  const divisionsAttr = filterTabsEl?.getAttribute('data-divisions');
  let divisionsList: DivisionConfig[] = [];

  if (divisionsAttr) {
    try {
      const parsed = JSON.parse(divisionsAttr);
      divisionsList = Array.isArray(parsed) ? parsed : (parsed.list || []);
    } catch (e) {
      console.error("Failed to parse divisions configuration in structure-filter script", e);
    }
  }

  const bannerTitle = document.getElementById('banner-title');
  const bannerBadge = document.getElementById('banner-badge');
  const bannerCount = document.getElementById('banner-count');
  const bannerDesc = document.getElementById('banner-desc');
  const emptyStateNotice = document.getElementById('empty-state-notice');

  function updateBanner(filterVal: string, visibleCount: number) {
    if (!bannerTitle || !bannerBadge || !bannerCount || !bannerDesc) return;

    if (filterVal === 'all') {
      bannerTitle.textContent = 'All Divisions';
      bannerBadge.textContent = 'OVERVIEW';
      bannerCount.textContent = `${visibleCount} ${visibleCount === 1 ? 'Member' : 'Members'}`;
      bannerDesc.textContent = 'Meet our dedicated laboratory assistants working across research, networking, public relations, competition, and community service.';
      return;
    }

    const divInfo = getDivisionInfo(filterVal, divisionsList);
    if (divInfo) {
      bannerTitle.textContent = divInfo.name;
      bannerBadge.textContent = divInfo.displayName || divInfo.name.toUpperCase();
      bannerCount.textContent = `${visibleCount} ${visibleCount === 1 ? 'Member' : 'Members'}`;
      bannerDesc.textContent = divInfo.description || `Meet the team members of ${divInfo.name} division.`;
    } else {
      bannerTitle.textContent = filterVal;
      bannerBadge.textContent = filterVal.toUpperCase();
      bannerCount.textContent = `${visibleCount} ${visibleCount === 1 ? 'Member' : 'Members'}`;
      bannerDesc.textContent = 'EIM Research Lab Assistants';
    }
  }

  function applyFilter(filterVal: string) {
    // Determine target canonical ID or filter token
    const targetDivObj = getDivisionInfo(filterVal, divisionsList);
    const targetId = targetDivObj ? targetDivObj.id.toLowerCase() : filterVal.toLowerCase();

    tabs.forEach(tab => {
      const tabFilter = (tab.getAttribute('data-filter') || '').toLowerCase();
      const tabDivObj = getDivisionInfo(tabFilter, divisionsList);
      const tabCanonicalId = tabDivObj ? tabDivObj.id.toLowerCase() : tabFilter;

      if (tabFilter === targetId || tabCanonicalId === targetId || (filterVal === 'all' && tabFilter === 'all')) {
        tab.classList.add('active');
      } else {
        tab.classList.remove('active');
      }
    });

    let visibleCount = 0;

    members.forEach(member => {
      const card = member as HTMLElement;
      const cardDivAttr = card.getAttribute('data-division') || '';
      
      // cardDivAttr contains space-separated tokens of member.division, canonical id, and aliases
      const tokens = cardDivAttr.toLowerCase().split(' ').filter(Boolean);

      let isMatch = false;
      if (filterVal === 'all') {
        isMatch = true;
      } else {
        // Check if any token matches filterVal directly OR via isDivisionMatch
        isMatch = tokens.includes(filterVal.toLowerCase()) || 
                  tokens.includes(targetId) ||
                  tokens.some(t => isDivisionMatch(t, filterVal, divisionsList));
      }

      if (isMatch) {
        card.style.display = 'flex';
        visibleCount++;
      } else {
        card.style.display = 'none';
      }
    });

    // Toggle Empty State Notice
    if (emptyStateNotice) {
      emptyStateNotice.style.display = visibleCount === 0 ? 'block' : 'none';
    }

    // Update Division Banner Header
    updateBanner(filterVal, visibleCount);
  }

  function initFilterFromURL() {
    const params = new URLSearchParams(window.location.search);
    const divParam = params.get('div') || params.get('divisi') || 'all';
    
    let mappedParam = divParam;
    if (divParam !== 'all') {
      const match = getDivisionInfo(divParam, divisionsList);
      if (match) {
        mappedParam = match.id;
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
