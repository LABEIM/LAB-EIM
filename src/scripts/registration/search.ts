import resultsData from '../../data/id/recruitment_results.json';

interface Candidate {
  nim?: string | number;
  screeningStatus?: string;
  technicalTestStatus?: string;
  finalStatus?: string;
  status?: string;
  division?: string;
  notes?: string;
}

function parseBulkImportText(text: string): Candidate[] {
  if (!text || typeof text !== 'string') return [];
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  if (!lines.length) return [];

  let delimiter = ',';
  if (lines[0].includes('\t')) delimiter = '\t';
  else if (lines[0].includes(';')) delimiter = ';';

  const results: Candidate[] = [];
  const firstLineLower = lines[0].toLowerCase();
  const startIdx = firstLineLower.includes('nim') ? 1 : 0;

  for (let i = startIdx; i < lines.length; i++) {
    const cols = lines[i].split(delimiter).map(c => c.trim().replace(/^["']|["']$/g, ''));
    const nim = cols[0] || '';
    if (!nim || nim.length < 3) continue;

    const screeningVal = (cols[2] || 'passed').toLowerCase();
    const technicalVal = (cols[3] || 'passed').toLowerCase();
    const finalVal = (cols[4] || 'accepted').toLowerCase();

    results.push({
      nim: nim,
      division: cols[1] || 'General',
      screeningStatus: ['passed', 'failed'].includes(screeningVal) ? screeningVal : 'passed',
      technicalTestStatus: ['passed', 'failed'].includes(technicalVal) ? technicalVal : 'passed',
      finalStatus: ['accepted', 'waitlist', 'rejected'].includes(finalVal) ? finalVal : 'accepted',
      notes: cols[5] || '',
    });
  }
  return results;
}

function findCandidate(query: string): Candidate | undefined {
  const q = query.trim().toLowerCase();
  if (!q) return undefined;

  const structured: Candidate[] = (resultsData as any).candidates || [];
  const bulkText: string = (resultsData as any).bulkImportText || '';
  const fromBulk = parseBulkImportText(bulkText);
  const allCandidates = [...structured, ...fromBulk];

  return allCandidates.find(c => {
    const nimStr = c.nim != null ? String(c.nim).toLowerCase() : '';
    return nimStr === q;
  });
}

function setResultDisplay(box: HTMLElement, statusClass: 'status-passed' | 'status-info' | 'status-error' | 'status-muted', htmlContent: string) {
  box.className = `search-result-display is-visible ${statusClass}`;
  box.innerHTML = htmlContent;
}

export function initRegistrationSearch() {
  // 1. Document Screening Results Lookup
  const searchScreeningInput = document.getElementById('search-screening-nim-input') as HTMLInputElement | null;
  const searchScreeningBtn = document.getElementById('search-screening-nim-btn');
  const searchScreeningResultBox = document.getElementById('search-screening-result-box');

  const executeScreeningSearch = () => {
    if (!searchScreeningInput || !searchScreeningResultBox) return;
    const query = searchScreeningInput.value.trim();
    if (!query) {
      setResultDisplay(
        searchScreeningResultBox,
        'status-error',
        '<i class="fa-solid fa-circle-exclamation"></i> Please enter a NIM to search.'
      );
      return;
    }

    const match = findCandidate(query);
    if (match) {
      const isPassed = match.screeningStatus === 'passed';
      setResultDisplay(
        searchScreeningResultBox,
        isPassed ? 'status-passed' : 'status-muted',
        `
          <div class="search-result-title">
            ${isPassed ? 'PASSED DOCUMENT SCREENING' : 'Document Screening Status'}
          </div>
          <div class="search-result-nim">NIM: <strong>${match.nim || ''}</strong></div>
          <p class="search-result-desc">
            ${isPassed ? 'Congratulations! You have qualified for the Technical Test phase. Please check your email for technical test details.' : (match.notes || 'Thank you for applying. Keep striving for future opportunities.')}
          </p>
        `
      );
    } else {
      setResultDisplay(
        searchScreeningResultBox,
        'status-muted',
        `No screening result record found for NIM "<strong>${query}</strong>".`
      );
    }
  };

  searchScreeningBtn?.addEventListener('click', executeScreeningSearch);
  searchScreeningInput?.addEventListener('keypress', (e) => { if (e.key === 'Enter') executeScreeningSearch(); });

  // 2. Technical Test Results Lookup
  const searchTechInput = document.getElementById('search-tech-nim-input') as HTMLInputElement | null;
  const searchTechBtn = document.getElementById('search-tech-nim-btn');
  const searchTechResultBox = document.getElementById('search-tech-result-box');

  const executeTechSearch = () => {
    if (!searchTechInput || !searchTechResultBox) return;
    const query = searchTechInput.value.trim();
    if (!query) {
      setResultDisplay(
        searchTechResultBox,
        'status-error',
        '<i class="fa-solid fa-circle-exclamation"></i> Please enter a NIM to search.'
      );
      return;
    }

    const match = findCandidate(query);
    if (match) {
      const isPassed = match.technicalTestStatus === 'passed';
      setResultDisplay(
        searchTechResultBox,
        isPassed ? 'status-passed' : 'status-muted',
        `
          <div class="search-result-title">
            ${isPassed ? 'PASSED TECHNICAL TEST' : 'Technical Test Status'}
          </div>
          <div class="search-result-nim">NIM: <strong>${match.nim || ''}</strong></div>
          <p class="search-result-desc">
            ${isPassed ? 'Congratulations! You have qualified for the Interview phase. Please check your email for interview schedule details.' : (match.notes || 'Thank you for participating in the technical test.')}
          </p>
        `
      );
    } else {
      setResultDisplay(
        searchTechResultBox,
        'status-muted',
        `No technical test result record found for NIM "<strong>${query}</strong>".`
      );
    }
  };

  searchTechBtn?.addEventListener('click', executeTechSearch);
  searchTechInput?.addEventListener('keypress', (e) => { if (e.key === 'Enter') executeTechSearch(); });

  // 3. Final Selection Results Lookup
  const searchInput = document.getElementById('search-nim-input') as HTMLInputElement | null;
  const searchBtn = document.getElementById('search-nim-btn');
  const resultBox = document.getElementById('search-result-box');

  const executeNimSearch = () => {
    if (!searchInput || !resultBox) return;
    const query = searchInput.value.trim();
    if (!query) {
      setResultDisplay(
        resultBox,
        'status-error',
        '<i class="fa-solid fa-circle-exclamation"></i> Please enter a NIM to search.'
      );
      return;
    }

    const match = findCandidate(query);
    if (match) {
      const isAccepted = match.finalStatus === 'accepted' || match.status === 'accepted';
      if (isAccepted) {
        setResultDisplay(
          resultBox,
          'status-passed',
          `
            <div class="search-result-title-lg"><i class="fa-solid fa-circle-check"></i> CONGRATULATIONS!</div>
            <div class="search-result-nim">NIM: <strong>${match.nim || ''}</strong></div>
            <div class="search-result-division">Division: <strong>${match.division || ''}</strong></div>
            <p class="search-result-desc">${match.notes || 'You have been accepted as an assistant at EIM Research Lab.'}</p>
          `
        );
      } else {
        setResultDisplay(
          resultBox,
          'status-info',
          `
            <div class="search-result-title"><i class="fa-solid fa-info-circle"></i> Status: ${(match.finalStatus || match.status || 'evaluated').toUpperCase()}</div>
            <div class="search-result-nim">NIM: <strong>${match.nim || ''}</strong></div>
            <p class="search-result-desc">${match.notes || 'Thank you for participating in this recruitment cycle.'}</p>
          `
        );
      }
    } else {
      setResultDisplay(
        resultBox,
        'status-muted',
        `No matching candidate record found for NIM "<strong>${query}</strong>".`
      );
    }
  };

  searchBtn?.addEventListener('click', executeNimSearch);
  searchInput?.addEventListener('keypress', (e) => { if (e.key === 'Enter') executeNimSearch(); });
}
