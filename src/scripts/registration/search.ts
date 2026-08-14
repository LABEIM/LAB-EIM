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

    const screeningRaw = (cols[2] || '').toLowerCase();
    const technicalRaw = (cols[3] || '').toLowerCase();
    const finalRaw = (cols[4] || '').toLowerCase();

    const candidate: Candidate = {
      nim: nim,
      division: cols[1] || '',
      screeningStatus: ['passed', 'failed'].includes(screeningRaw) ? screeningRaw : 'passed',
      notes: cols[5] || '',
    };

    if (technicalRaw) {
      candidate.technicalTestStatus = ['passed', 'failed'].includes(technicalRaw) ? technicalRaw : 'passed';
    } else {
      candidate.technicalTestStatus = 'passed';
    }

    if (finalRaw) {
      candidate.finalStatus = ['accepted', 'waitlist', 'rejected'].includes(finalRaw) ? finalRaw : 'accepted';
    }

    results.push(candidate);
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
    const nimStr = c.nim != null ? String(c.nim).trim().toLowerCase() : '';
    return nimStr === q;
  });
}

function escapeHtml(text: string | number | undefined | null): string {
  if (text == null) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function setResultDisplay(box: HTMLElement, statusClass: 'status-passed' | 'status-info' | 'status-error' | 'status-muted', htmlContent: string) {
  box.className = `search-result-display is-visible ${statusClass}`;
  box.innerHTML = htmlContent;
}

function getIsEnglish(): boolean {
  const container = document.getElementById('registration-container');
  if (container && container.getAttribute('data-locale')) {
    return container.getAttribute('data-locale') === 'en';
  }
  return window.location.pathname.startsWith('/en');
}

export function initRegistrationSearch() {
  const isEn = getIsEnglish();

  // Discover all search buttons (both legacy IDs and dynamic step search IDs)
  const searchButtons = Array.from(document.querySelectorAll<HTMLButtonElement>('[id$="-nim-btn"]'));

  // Also include main announcement search if it exists and wasn't matched
  const mainSearchBtn = document.getElementById('search-nim-btn') as HTMLButtonElement | null;
  if (mainSearchBtn && !searchButtons.includes(mainSearchBtn)) {
    searchButtons.push(mainSearchBtn);
  }

  searchButtons.forEach((btn) => {
    const btnId = btn.id;
    const inputId = btnId.replace(/-btn$/, '-input');
    const resultBoxId = btnId.replace(/-btn$/, '-result-box');

    const input = document.getElementById(inputId) as HTMLInputElement | null;
    const resultBox = document.getElementById(resultBoxId);

    if (!input || !resultBox) return;

    // Prevent double listener attachment
    if (btn.getAttribute('data-search-bound') === 'true') return;
    btn.setAttribute('data-search-bound', 'true');

    // Extract step key from button ID (e.g. search-selection-nim-btn -> selection, search-nim-btn -> announcement)
    let stepKey = 'announcement';
    if (btnId === 'search-nim-btn') {
      stepKey = 'announcement';
    } else {
      const matchKey = btnId.match(/^search-(.*?)-nim-btn$/);
      if (matchKey && matchKey[1]) {
        stepKey = matchKey[1];
      }
    }

    const executeSearch = () => {
      const query = input.value.trim();
      if (!query) {
        setResultDisplay(
          resultBox,
          'status-error',
          `<i class="fa-solid fa-circle-exclamation"></i> ${isEn ? 'Please enter a NIM to search.' : 'Masukkan NIM untuk mencari.'}`
        );
        return;
      }

      const match = findCandidate(query);
      if (!match) {
        setResultDisplay(
          resultBox,
          'status-muted',
          isEn
            ? `No result record found for NIM "<strong>${escapeHtml(query)}</strong>".`
            : `Data hasil seleksi tidak ditemukan untuk NIM "<strong>${escapeHtml(query)}</strong>".`
        );
        return;
      }

      // Final selection announcement view
      if (stepKey === 'announcement' || stepKey === 'final') {
        const isAccepted = match.finalStatus === 'accepted' || match.status === 'accepted';
        if (isAccepted) {
          setResultDisplay(
            resultBox,
            'status-passed',
            `
              <div class="search-result-title-lg"><i class="fa-solid fa-circle-check"></i> ${isEn ? 'CONGRATULATIONS!' : 'SELAMAT! ANDA DITERIMA'}</div>
              <div class="search-result-nim">NIM: <strong>${escapeHtml(match.nim)}</strong></div>
              ${match.division ? `<div class="search-result-division">${isEn ? 'Division:' : 'Divisi:'} <strong>${escapeHtml(match.division)}</strong></div>` : ''}
              <p class="search-result-desc">${match.notes ? escapeHtml(match.notes) : (isEn ? 'You have been accepted as an assistant at EIM Research Lab.' : 'Selamat! Anda diterima menjadi asisten di EIM Research Lab.')}</p>
            `
          );
        } else {
          setResultDisplay(
            resultBox,
            'status-info',
            `
              <div class="search-result-title"><i class="fa-solid fa-info-circle"></i> Status: ${escapeHtml((match.finalStatus || match.status || 'evaluated').toUpperCase())}</div>
              <div class="search-result-nim">NIM: <strong>${escapeHtml(match.nim)}</strong></div>
              ${match.division ? `<div class="search-result-division">${isEn ? 'Division:' : 'Divisi:'} <strong>${escapeHtml(match.division)}</strong></div>` : ''}
              <p class="search-result-desc">${match.notes ? escapeHtml(match.notes) : (isEn ? 'Thank you for participating in this recruitment cycle.' : 'Terima kasih telah berpartisipasi dalam rekrutmen ini.')}</p>
            `
          );
        }
        return;
      }

      // Dynamic step-specific status lookup
      let stepStatus = 'passed';
      const screeningVal = (match.screeningStatus || (match as any).selectionStatus || '').toLowerCase();
      const techVal = (match.technicalTestStatus || (match as any).technicalStatus || '').toLowerCase();
      const finalVal = (match.finalStatus || match.status || '').toLowerCase();

      const normalizedStepKey = stepKey.replace(/-/g, '_');

      if (normalizedStepKey === 'selection' || normalizedStepKey === 'screening') {
        stepStatus = screeningVal || 'passed';
      } else if (normalizedStepKey === 'technical_test' || normalizedStepKey === 'tech' || normalizedStepKey === 'technical') {
        if (screeningVal === 'failed') {
          stepStatus = 'failed';
        } else {
          stepStatus = techVal || 'passed';
        }
      } else if (normalizedStepKey === 'interview') {
        const interviewVal = ((match as any).interviewStatus || '').toLowerCase();
        if (screeningVal === 'failed' || techVal === 'failed') {
          stepStatus = 'failed';
        } else {
          stepStatus = interviewVal || (finalVal === 'rejected' ? 'failed' : 'passed');
        }
      } else {
        if (screeningVal === 'failed' || finalVal === 'rejected') {
          stepStatus = 'failed';
        } else {
          const camelStepKey = normalizedStepKey.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
          const customKeyCamel = `${camelStepKey}Status`;
          const customKeyExact = `${normalizedStepKey}Status`;

          if ((match as any)[customKeyCamel]) {
            stepStatus = String((match as any)[customKeyCamel]).toLowerCase();
          } else if ((match as any)[customKeyExact]) {
            stepStatus = String((match as any)[customKeyExact]).toLowerCase();
          } else if ((match as any)[stepKey]) {
            stepStatus = String((match as any)[stepKey]).toLowerCase();
          } else if ((match as any)[normalizedStepKey]) {
            stepStatus = String((match as any)[normalizedStepKey]).toLowerCase();
          }
        }
      }

      const isPassed = stepStatus === 'passed';
      setResultDisplay(
        resultBox,
        isPassed ? 'status-passed' : 'status-muted',
        `
          <div class="search-result-title">
            ${isPassed ? (isEn ? 'PASSED EVALUATION STEP' : 'LOLOS TAHAP SELEKSI') : (isEn ? 'Evaluation Step Status' : 'Status Tahap Seleksi')}
          </div>
          <div class="search-result-nim">NIM: <strong>${escapeHtml(match.nim)}</strong></div>
          ${match.division ? `<div class="search-result-division">${isEn ? 'Division:' : 'Divisi:'} <strong>${escapeHtml(match.division)}</strong></div>` : ''}
          <p class="search-result-desc">
            ${isPassed
              ? (match.notes ? escapeHtml(match.notes) : (isEn ? 'Congratulations! You have passed this selection step. Please check your email or official communication channel for details.' : 'Selamat! Anda dinyatakan lolos pada tahap ini. Cek email atau WhatsApp Group rekrutmen untuk informasi lebih lanjut.'))
              : (match.notes ? escapeHtml(match.notes) : (isEn ? 'Thank you for participating in this selection phase.' : 'Terima kasih telah mengikuti tahap seleksi ini.'))}
          </p>
        `
      );
    };

    btn.addEventListener('click', executeSearch);
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') executeSearch();
    });
  });
}
