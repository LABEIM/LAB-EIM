import resultsData from '../../data/recruitment_results.json';

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

export function initRegistrationSearch() {
  // 1. Document Screening Results Lookup
  const searchScreeningInput = document.getElementById('search-screening-nim-input') as HTMLInputElement | null;
  const searchScreeningBtn = document.getElementById('search-screening-nim-btn');
  const searchScreeningResultBox = document.getElementById('search-screening-result-box');

  const executeScreeningSearch = () => {
    if (!searchScreeningInput || !searchScreeningResultBox) return;
    const query = searchScreeningInput.value.trim();
    if (!query) {
      searchScreeningResultBox.style.display = 'block';
      searchScreeningResultBox.style.background = 'rgba(255, 107, 107, 0.1)';
      searchScreeningResultBox.style.color = '#ff6b6b';
      searchScreeningResultBox.innerHTML = '<i class="fa-solid fa-circle-exclamation"></i> Please enter a NIM to search.';
      return;
    }

    const match = findCandidate(query);
    searchScreeningResultBox.style.display = 'block';
    if (match) {
      const isPassed = match.screeningStatus === 'passed';
      searchScreeningResultBox.style.background = isPassed ? 'rgba(32, 201, 151, 0.12)' : 'rgba(255, 255, 255, 0.05)';
      searchScreeningResultBox.style.border = `1px solid ${isPassed ? '#20c997' : 'var(--border-color)'}`;
      searchScreeningResultBox.style.color = isPassed ? '#20c997' : 'var(--text-secondary)';
      searchScreeningResultBox.innerHTML = `
        <div style="font-size: 1.2rem; font-weight: bold; margin-bottom: 6px;">
          ${isPassed ? 'PASSED DOCUMENT SCREENING' : 'Document Screening Status'}
        </div>
        <div style="color: var(--text-primary); font-size: 1.05rem;">NIM: <strong>${match.nim || ''}</strong></div>
        <p style="margin-top: 8px; font-size: 0.9rem;">
          ${isPassed ? 'Congratulations! You have qualified for the Technical Test phase. Please check your email for technical test details.' : (match.notes || 'Thank you for applying. Keep striving for future opportunities.')}
        </p>
      `;
    } else {
      searchScreeningResultBox.style.background = 'rgba(255, 255, 255, 0.05)';
      searchScreeningResultBox.style.color = 'var(--text-secondary)';
      searchScreeningResultBox.innerHTML = `No screening result record found for NIM "<strong>${query}</strong>".`;
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
      searchTechResultBox.style.display = 'block';
      searchTechResultBox.style.background = 'rgba(255, 107, 107, 0.1)';
      searchTechResultBox.style.color = '#ff6b6b';
      searchTechResultBox.innerHTML = '<i class="fa-solid fa-circle-exclamation"></i> Please enter a NIM to search.';
      return;
    }

    const match = findCandidate(query);
    searchTechResultBox.style.display = 'block';
    if (match) {
      const isPassed = match.technicalTestStatus === 'passed';
      searchTechResultBox.style.background = isPassed ? 'rgba(32, 201, 151, 0.12)' : 'rgba(255, 255, 255, 0.05)';
      searchTechResultBox.style.border = `1px solid ${isPassed ? '#20c997' : 'var(--border-color)'}`;
      searchTechResultBox.style.color = isPassed ? '#20c997' : 'var(--text-secondary)';
      searchTechResultBox.innerHTML = `
        <div style="font-size: 1.2rem; font-weight: bold; margin-bottom: 6px;">
          ${isPassed ? 'PASSED TECHNICAL TEST' : 'Technical Test Status'}
        </div>
        <div style="color: var(--text-primary); font-size: 1.05rem;">NIM: <strong>${match.nim || ''}</strong></div>
        <p style="margin-top: 8px; font-size: 0.9rem;">
          ${isPassed ? 'Congratulations! You have qualified for the Interview phase. Please check your email for interview schedule details.' : (match.notes || 'Thank you for participating in the technical test.')}
        </p>
      `;
    } else {
      searchTechResultBox.style.background = 'rgba(255, 255, 255, 0.05)';
      searchTechResultBox.style.color = 'var(--text-secondary)';
      searchTechResultBox.innerHTML = `No technical test result record found for NIM "<strong>${query}</strong>".`;
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
      resultBox.style.display = 'block';
      resultBox.style.background = 'rgba(255, 107, 107, 0.1)';
      resultBox.style.color = '#ff6b6b';
      resultBox.innerHTML = '<i class="fa-solid fa-circle-exclamation"></i> Please enter a NIM to search.';
      return;
    }

    const match = findCandidate(query);
    resultBox.style.display = 'block';
    if (match) {
      const isAccepted = match.finalStatus === 'accepted' || match.status === 'accepted';
      if (isAccepted) {
        resultBox.style.background = 'rgba(32, 201, 151, 0.12)';
        resultBox.style.border = '1px solid rgba(32, 201, 151, 0.4)';
        resultBox.style.color = '#20c997';
        resultBox.innerHTML = `
          <div style="font-size: 1.5rem; margin-bottom: 8px;"><i class="fa-solid fa-circle-check"></i> CONGRATULATIONS!</div>
          <div style="font-size: 1.1rem; font-weight: bold; color: var(--text-primary);">NIM: <strong>${match.nim || ''}</strong></div>
          <div style="margin-top: 4px; font-size: 0.95rem; color: var(--accent-cyan);">Division: <strong>${match.division || ''}</strong></div>
          <p style="margin-top: 10px; font-size: 0.9rem; color: var(--text-secondary);">${match.notes || 'You have been accepted as an assistant at EIM Research Lab.'}</p>
        `;
      } else {
        resultBox.style.background = 'rgba(0, 240, 255, 0.08)';
        resultBox.style.border = '1px solid rgba(0, 240, 255, 0.3)';
        resultBox.style.color = 'var(--accent-cyan)';
        resultBox.innerHTML = `
          <div style="font-size: 1.2rem; margin-bottom: 6px;"><i class="fa-solid fa-info-circle"></i> Status: ${(match.finalStatus || match.status || 'evaluated').toUpperCase()}</div>
          <div style="font-weight: bold; color: var(--text-primary);">NIM: <strong>${match.nim || ''}</strong></div>
          <p style="margin-top: 8px; font-size: 0.9rem; color: var(--text-secondary);">${match.notes || 'Thank you for participating in this recruitment cycle.'}</p>
        `;
      }
    } else {
      resultBox.style.background = 'rgba(255, 255, 255, 0.05)';
      resultBox.style.color = 'var(--text-secondary)';
      resultBox.innerHTML = `No matching candidate record found for NIM "<strong>${query}</strong>".`;
    }
  };

  searchBtn?.addEventListener('click', executeNimSearch);
  searchInput?.addEventListener('keypress', (e) => { if (e.key === 'Enter') executeNimSearch(); });
}
