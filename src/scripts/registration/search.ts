import resultsData from '../../data/recruitment_results.json';

interface CandidateStepStatus {
  stepId: string;
  status: string;
  notes?: string;
}

interface Candidate {
  nim?: string | number;
  stageStatuses?: CandidateStepStatus[];
  finalStatus?: string;
  status?: string;
  division?: string;
  notes?: string;
  [key: string]: any;
}

/**
 * Normalizes a NIM or search query for consistent comparison
 * (strips spaces, hyphens, underscores and converts to lowercase).
 */
function normalizeNim(val: string | number | undefined | null): string {
  if (val == null) return '';
  return String(val).trim().replace(/[\s\-_]/g, '').toLowerCase();
}

/**
 * Gets candidate results data from container data-attributes or fallback imported JSON.
 */
function getResultsConfigData(): any {
  if (typeof document !== 'undefined') {
    const container = document.getElementById('registration-container');
    if (container) {
      const raw = container.getAttribute('data-recruitment-results');
      if (raw) {
        try {
          return JSON.parse(raw);
        } catch (e) {}
      }
    }
  }
  return resultsData;
}

/**
 * Normalizes step identifiers and aliases to standard keys.
 */
function normalizeStepIdentifier(stepId: string): string {
  const clean = (stepId || '').toLowerCase().replace(/[\-_]/g, '');
  if (clean === 'selection' || clean === 'screening' || clean === 'berkas' || clean === 'seleksiberkas' || clean === 'admin' || clean === 'administrasi') {
    return 'selection';
  }
  if (clean === 'technicaltest' || clean === 'technical' || clean === 'teknikal' || clean === 'testeknikal' || clean === 'test') {
    return 'technical_test';
  }
  if (clean === 'interview' || clean === 'wawancara' || clean === 'interviewstage') {
    return 'interview';
  }
  if (clean === 'finalselection' || clean === 'final' || clean === 'seleksiakhir' || clean === 'announcement' || clean === 'pengumuman') {
    return 'final_selection';
  }
  return stepId.toLowerCase().replace(/-/g, '_');
}

/**
 * Parses spreadsheet bulk paste into structured Candidate objects.
 */
function parseBulkImportText(text: string, activeSteps: Array<{ id: string }> = []): Candidate[] {
  if (!text || typeof text !== 'string') return [];
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  if (!lines.length) return [];

  let delimiter = ',';
  if (lines[0].includes('\t')) delimiter = '\t';
  else if (lines[0].includes(';')) delimiter = ';';

  const results: Candidate[] = [];
  const firstLineLower = lines[0].toLowerCase();
  const startIdx = firstLineLower.includes('nim') ? 1 : 0;

  const defaultStepIds = activeSteps.length > 0
    ? activeSteps.map(s => s.id)
    : ['selection', 'technical_test', 'interview', 'final_selection'];

  for (let i = startIdx; i < lines.length; i++) {
    const cols = lines[i].split(delimiter).map(c => c.trim().replace(/^["']|["']$/g, ''));
    const nim = cols[0] || '';
    if (!nim || nim.length < 3) continue;

    const division = cols[1] || '';
    const stageStatuses: CandidateStepStatus[] = [];
    const candidate: Candidate = {
      nim,
      division,
      stageStatuses,
    };

    // Parse step statuses across active selection steps
    for (let sIdx = 0; sIdx < defaultStepIds.length; sIdx++) {
      const colVal = (cols[2 + sIdx] || '').toLowerCase();
      if (!colVal) continue;

      const stepId = defaultStepIds[sIdx];
      const isPass = ['passed', 'pass', 'lolos', 'lulus', 'accepted', 'diterima', 'true'].includes(colVal);
      const isFail = ['failed', 'fail', 'tidak lolos', 'tidak_lolos', 'tidak lulus', 'gagal', 'rejected', 'false'].includes(colVal);
      const statusVal = isFail ? 'failed' : (isPass ? 'passed' : colVal);

      stageStatuses.push({ stepId, status: statusVal });
      candidate[`${stepId}Status`] = statusVal;
      candidate[stepId] = statusVal;
    }

    const finalColIdx = 2 + defaultStepIds.length;
    const finalRaw = (cols[finalColIdx] || '').toLowerCase();
    if (finalRaw) {
      if (['accepted', 'diterima', 'lolos', 'lulus'].includes(finalRaw)) {
        candidate.finalStatus = 'accepted';
      } else if (['waitlist', 'cadangan', 'pending'].includes(finalRaw)) {
        candidate.finalStatus = 'waitlist';
      } else if (['rejected', 'gagal', 'tidak lolos', 'tidak lulus', 'failed'].includes(finalRaw)) {
        candidate.finalStatus = 'rejected';
      } else {
        candidate.finalStatus = finalRaw;
      }
    }

    const notesColIdx = 3 + defaultStepIds.length;
    candidate.notes = cols[notesColIdx] || (cols.length > finalColIdx + 1 ? cols[cols.length - 1] : '');

    results.push(candidate);
  }
  return results;
}

/**
 * Finds candidate record by NIM, checking structured array, bulk text, and aliases.
 */
function findCandidate(query: string, activeSteps: any[] = []): Candidate | undefined {
  const q = normalizeNim(query);
  if (!q) return undefined;

  const data = getResultsConfigData();
  const structured: Candidate[] = Array.isArray(data?.candidates) ? data.candidates : [];
  const bulkText: string = data?.bulkImportText || '';
  const fromBulk = parseBulkImportText(bulkText, activeSteps);

  // Map to merge candidate info if present in both
  const candidateMap = new Map<string, Candidate>();

  structured.forEach(c => {
    const key = normalizeNim(c.nim);
    if (key) {
      candidateMap.set(key, { ...c });
    }
  });

  fromBulk.forEach(c => {
    const key = normalizeNim(c.nim);
    if (!key) return;
    const existing = candidateMap.get(key);
    if (existing) {
      if (c.division && !existing.division) existing.division = c.division;
      if (c.finalStatus && !existing.finalStatus) existing.finalStatus = c.finalStatus;
      if (c.notes && !existing.notes) existing.notes = c.notes;
      if (Array.isArray(c.stageStatuses) && c.stageStatuses.length > 0) {
        const existingStages = Array.isArray(existing.stageStatuses) ? [...existing.stageStatuses] : [];
        c.stageStatuses.forEach(st => {
          const normSt = normalizeStepIdentifier(st.stepId);
          if (!existingStages.some(s => normalizeStepIdentifier(s.stepId) === normSt)) {
            existingStages.push(st);
          }
        });
        existing.stageStatuses = existingStages;
      }
    } else {
      candidateMap.set(key, c);
    }
  });

  return candidateMap.get(q);
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

export function formatMessageMarkdown(text: string | number | undefined | null): string {
  if (text == null) return '';
  let formatted = escapeHtml(text);

  // Safe HTML tags (re-enable safe tags after escaping)
  formatted = formatted
    .replace(/&lt;u&gt;(.*?)&lt;\/u&gt;/gi, '<u>$1</u>')
    .replace(/&lt;b&gt;(.*?)&lt;\/b&gt;/gi, '<strong>$1</strong>')
    .replace(/&lt;i&gt;(.*?)&lt;\/i&gt;/gi, '<em>$1</em>')
    .replace(/&lt;strong&gt;(.*?)&lt;\/strong&gt;/gi, '<strong>$1</strong>')
    .replace(/&lt;em&gt;(.*?)&lt;\/em&gt;/gi, '<em>$1</em>');

  // Bold + Italic: ***text***
  formatted = formatted.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');

  // Bold: **text**
  formatted = formatted.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

  // Underline: __text__
  formatted = formatted.replace(/__(.+?)__/g, '<u>$1</u>');

  // Italic: *text* or _text_
  formatted = formatted.replace(/\*([^\*]+?)\*/g, '<em>$1</em>');
  formatted = formatted.replace(/(^|[^\w])_([^_]+?)_([^\w]|$)/g, '$1<em>$2</em>$3');

  // Inline code: `text`
  formatted = formatted.replace(/`([^`]+?)`/g, '<code class="search-result-code">$1</code>');

  return formatted;
}

function setResultDisplay(box: HTMLElement, statusClass: 'status-passed' | 'status-info' | 'status-error' | 'status-muted', htmlContent: string) {
  box.className = `search-result-display is-visible ${statusClass}`;
  box.innerHTML = htmlContent;
}

function getIsEnglish(): boolean {
  if (typeof document === 'undefined') return false;
  const container = document.getElementById('registration-container');
  if (container && container.getAttribute('data-locale')) {
    return container.getAttribute('data-locale') === 'en';
  }
  return typeof window !== 'undefined' && window.location.pathname.startsWith('/en');
}

function getSelectionStepsConfig(): any[] {
  if (typeof document === 'undefined') return [];
  const container = document.getElementById('registration-container');
  if (container) {
    const raw = container.getAttribute('data-selection-steps');
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch (e) {}
    }
  }
  return [];
}

/**
 * Initializes all NIM search boxes across selection steps and announcement views.
 */
export function initRegistrationSearch() {
  if (typeof document === 'undefined') return;
  const isEn = getIsEnglish();
  const selectionStepsConfig = getSelectionStepsConfig();

  // Discover all search buttons (matching various ID conventions and container classes)
  const searchButtons = Array.from(
    document.querySelectorAll<HTMLButtonElement>(
      '[id$="-nim-btn"], [id$="-search-btn"], [id^="search-"][id$="-btn"], button.reg-btn-search'
    )
  );

  searchButtons.forEach((btn) => {
    const btnId = btn.id || '';
    const containerBox = btn.closest('.search-lookup-box');

    // Robust input resolution
    const input = ((btnId ? document.getElementById(btnId.replace(/-nim-btn$/, '-nim-input')) : null)
      || (btnId ? document.getElementById(btnId.replace(/-nim-btn$/, '-input')) : null)
      || (btnId ? document.getElementById(btnId.replace(/-btn$/, '-input')) : null)
      || (containerBox ? containerBox.querySelector<HTMLInputElement>('input[type="text"]') : null)) as HTMLInputElement | null;

    // Robust resultBox resolution
    const resultBox = ((btnId ? document.getElementById(btnId.replace(/-nim-btn$/, '-result-box')) : null)
      || (btnId ? document.getElementById(btnId.replace(/-nim-btn$/, '-nim-result-box')) : null)
      || (btnId ? document.getElementById(btnId.replace(/-btn$/, '-result-box')) : null)
      || (containerBox ? containerBox.querySelector<HTMLElement>('.search-result-display') : null));

    if (!input || !resultBox) return;

    // Prevent duplicate event listener bindings
    if (btn.getAttribute('data-search-bound') === 'true') return;
    btn.setAttribute('data-search-bound', 'true');

    // Extract step key from button ID or attributes
    let stepKey = 'announcement';
    if (btnId === 'search-nim-btn' || btnId === 'search-announcement-nim-btn' || btnId === 'search-final-nim-btn') {
      stepKey = 'announcement';
    } else {
      const matchKey = btnId.match(/^search-(.*?)-(?:nim-)?btn$/);
      if (matchKey && matchKey[1]) {
        stepKey = matchKey[1];
      }
    }

    const normKey = normalizeStepIdentifier(stepKey);
    const matchedStepCfg = selectionStepsConfig.find(
      (s: any) => normalizeStepIdentifier(s.id) === normKey || s.id === stepKey
    );

    const executeSearch = () => {
      const rawQuery = input.value.trim();
      if (!rawQuery) {
        setResultDisplay(
          resultBox,
          'status-error',
          `<i class="fa-solid fa-circle-exclamation"></i> ${isEn ? 'Please enter a NIM to search.' : 'Masukkan NIM untuk mencari.'}`
        );
        return;
      }

      const match = findCandidate(rawQuery, selectionStepsConfig);
      if (!match) {
        setResultDisplay(
          resultBox,
          'status-muted',
          isEn
            ? `No result record found for NIM "<strong>${escapeHtml(rawQuery)}</strong>".`
            : `Data hasil seleksi tidak ditemukan untuk NIM "<strong>${escapeHtml(rawQuery)}</strong>".`
        );
        return;
      }

      // 1. Final Selection Announcement View
      if (normKey === 'final_selection' || normKey === 'announcement' || stepKey === 'announcement' || stepKey === 'final') {
        const finalStatusVal = (match.finalStatus || match.status || '').toLowerCase();
        const isAccepted = ['accepted', 'diterima', 'lolos', 'lulus'].includes(finalStatusVal);
        const isWaitlist = ['waitlist', 'cadangan'].includes(finalStatusVal);

        let defaultOutcomeNote = '';
        if (matchedStepCfg && matchedStepCfg.resultsConfig) {
          if (isAccepted) {
            defaultOutcomeNote = matchedStepCfg.resultsConfig.passedMessage || (matchedStepCfg.resultsConfig as any).acceptedMessage || '';
          } else if (isWaitlist) {
            defaultOutcomeNote = matchedStepCfg.resultsConfig.waitlistMessage || '';
          } else {
            defaultOutcomeNote = matchedStepCfg.resultsConfig.failedMessage || (matchedStepCfg.resultsConfig as any).rejectedMessage || '';
          }
        }

        if (!defaultOutcomeNote) {
          if (isAccepted) {
            defaultOutcomeNote = isEn
              ? 'Congratulations! You have been accepted as an assistant at EIM Research Lab.'
              : 'Selamat! Anda dinyatakan diterima sebagai asisten di EIM Research Lab.';
          } else if (isWaitlist) {
            defaultOutcomeNote = isEn
              ? 'You are on the recruitment waitlist.'
              : 'Anda masuk dalam daftar cadangan (Waitlist) asisten EIM Research Lab.';
          } else {
            defaultOutcomeNote = isEn
              ? 'Thank you for participating in this recruitment cycle.'
              : 'Terima kasih telah mengikuti seluruh rangkaian rekrutmen asisten EIM Research Lab.';
          }
        }

        const noteContent = match.notes || defaultOutcomeNote;

        if (isAccepted) {
          setResultDisplay(
            resultBox,
            'status-passed',
            `
              <div class="search-result-title-lg"><i class="fa-solid fa-circle-check"></i> ${isEn ? 'CONGRATULATIONS!' : 'SELAMAT! ANDA DITERIMA'}</div>
              <div class="search-result-nim">NIM: <strong>${escapeHtml(match.nim)}</strong></div>
              ${match.division ? `<div class="search-result-division">${isEn ? 'Division:' : 'Divisi:'} <strong>${escapeHtml(match.division)}</strong></div>` : ''}
              <p class="search-result-desc">${formatMessageMarkdown(noteContent)}</p>
            `
          );
        } else if (isWaitlist) {
          setResultDisplay(
            resultBox,
            'status-info',
            `
              <div class="search-result-title"><i class="fa-solid fa-clock"></i> Status: WAITLIST</div>
              <div class="search-result-nim">NIM: <strong>${escapeHtml(match.nim)}</strong></div>
              ${match.division ? `<div class="search-result-division">${isEn ? 'Division:' : 'Divisi:'} <strong>${escapeHtml(match.division)}</strong></div>` : ''}
              <p class="search-result-desc">${formatMessageMarkdown(noteContent)}</p>
            `
          );
        } else {
          setResultDisplay(
            resultBox,
            'status-info',
            `
              <div class="search-result-title"><i class="fa-solid fa-info-circle"></i> Status: ${escapeHtml((finalStatusVal || 'evaluated').toUpperCase())}</div>
              <div class="search-result-nim">NIM: <strong>${escapeHtml(match.nim)}</strong></div>
              ${match.division ? `<div class="search-result-division">${isEn ? 'Division:' : 'Divisi:'} <strong>${escapeHtml(match.division)}</strong></div>` : ''}
              <p class="search-result-desc">${formatMessageMarkdown(noteContent)}</p>
            `
          );
        }
        return;
      }

      // 2. Step-Specific Selection Evaluation View (e.g. Selection/Screening, Technical Test, Interview)
      let stepStatus = '';
      let stepNote = '';

      // Check stageStatuses array matching stepId or normalized aliases
      if (Array.isArray(match.stageStatuses)) {
        const foundStep = match.stageStatuses.find((s: any) => {
          const itemNorm = normalizeStepIdentifier(s.stepId || '');
          return itemNorm === normKey || s.stepId === stepKey || s.stepId === normKey;
        });

        if (foundStep && foundStep.status) {
          stepStatus = String(foundStep.status).toLowerCase();
          if (foundStep.notes) {
            stepNote = foundStep.notes;
          }
        }
      }

      // Secondary property check on candidate object (e.g. c.screeningStatus, c.selectionStatus, c.technicalTestStatus)
      if (!stepStatus) {
        const camelNorm = normKey.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
        const candidatesKeys = [
          `${camelNorm}Status`,
          `${normKey}Status`,
          `${stepKey}Status`,
          camelNorm,
          normKey,
          stepKey,
        ];

        if (normKey === 'selection') {
          candidatesKeys.push('screeningStatus', 'screening', 'berkasStatus', 'berkas', 'seleksiStatus', 'seleksi');
        } else if (normKey === 'technical_test') {
          candidatesKeys.push('technicalStatus', 'technical', 'teknikalStatus', 'teknikal');
        } else if (normKey === 'interview') {
          candidatesKeys.push('wawancaraStatus', 'wawancara');
        }

        for (const k of candidatesKeys) {
          if ((match as any)[k]) {
            stepStatus = String((match as any)[k]).toLowerCase();
            break;
          }
        }
      }

      // Default to passed if record exists but status was unassigned
      if (!stepStatus) {
        stepStatus = 'passed';
      }

      const isPassed = ['passed', 'pass', 'lolos', 'lulus', 'accepted', 'diterima', 'true'].includes(stepStatus);
      const isWaitlist = ['waitlist', 'cadangan', 'pending', 'menunggu'].includes(stepStatus);

      // Resolve step default message from step configuration
      let stepDefaultNote = '';
      if (matchedStepCfg && matchedStepCfg.resultsConfig) {
        if (isPassed) {
          stepDefaultNote = matchedStepCfg.resultsConfig.passedMessage || '';
        } else if (isWaitlist) {
          stepDefaultNote = matchedStepCfg.resultsConfig.waitlistMessage || '';
        } else {
          stepDefaultNote = matchedStepCfg.resultsConfig.failedMessage || '';
        }
      }

      // For intermediate steps, do not leak final rejection notes into passed steps
      const noteText = stepNote || stepDefaultNote || (isPassed ? match.notes : '') || '';

      const defaultFallbackMsg = isPassed
        ? (isEn
            ? 'Congratulations! You have passed this selection step. Please check your email or official WhatsApp group for details.'
            : 'Selamat! Anda dinyatakan lolos pada tahap ini. Cek email atau WhatsApp Group rekrutmen untuk informasi tahap selanjutnya.')
        : (isWaitlist
            ? (isEn
                ? 'You are on the waiting list for this selection step.'
                : 'Anda masuk dalam daftar cadangan untuk tahap seleksi ini.')
            : (isEn
                ? 'Thank you for participating in this selection phase.'
                : 'Terima kasih telah mengikuti tahap seleksi ini.'));

      const resultTitle = isPassed
        ? (isEn ? 'PASSED EVALUATION STEP' : 'LOLOS TAHAP SELEKSI')
        : (isWaitlist
            ? (isEn ? 'WAITLIST / PENDING EVALUATION' : 'STATUS CADANGAN / PROSES')
            : (isEn ? 'SELECTION RESULT' : 'STATUS TAHAP SELEKSI'));

      setResultDisplay(
        resultBox,
        isPassed ? 'status-passed' : (isWaitlist ? 'status-info' : 'status-muted'),
        `
          <div class="search-result-title">
            <i class="fa-solid ${isPassed ? 'fa-circle-check' : (isWaitlist ? 'fa-clock' : 'fa-circle-info')}"></i> ${resultTitle}
          </div>
          <div class="search-result-nim">NIM: <strong>${escapeHtml(match.nim)}</strong></div>
          ${match.division ? `<div class="search-result-division">${isEn ? 'Division:' : 'Divisi:'} <strong>${escapeHtml(match.division)}</strong></div>` : ''}
          <p class="search-result-desc">
            ${formatMessageMarkdown(noteText || defaultFallbackMsg)}
          </p>
        `
      );
    };

    btn.addEventListener('click', executeSearch);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        executeSearch();
      }
    });
  });
}

// Automatically re-bind search on dynamic stage transitions
if (typeof window !== 'undefined') {
  window.addEventListener('eim:stage-changed', () => {
    setTimeout(initRegistrationSearch, 50);
  });
}

