import resultsData from '../data/recruitment_results.json';

export function initRegistrationScript() {
  const container = document.getElementById('registration-container');
  if (!container) return;

  const stage = container.getAttribute('data-stage') || "auto";
  const openDateStr = container.getAttribute('data-open-date') || "2026-07-01T00:00:00";
  const deadlineStr = container.getAttribute('data-deadline') || "2026-07-25T23:59:59";
  const extendedDeadlineStr = container.getAttribute('data-extended-deadline') || "";
  const medhumTriggerVal = container.getAttribute('data-medhum-val') || "Medhum";

  const OPEN_TIME = new Date(openDateStr).getTime();
  const DEADLINE_TIME = new Date(deadlineStr).getTime();
  const EXTENDED_TIME = extendedDeadlineStr ? new Date(extendedDeadlineStr).getTime() : 0;

  const activeDeadline = (EXTENDED_TIME > 0 && new Date().getTime() >= DEADLINE_TIME && new Date().getTime() < EXTENDED_TIME)
    ? EXTENDED_TIME 
    : DEADLINE_TIME;

  // Form Elements
  const formElement = document.getElementById('pendaftaran-form') as HTMLFormElement | null;
  const submitBtn = document.getElementById('submit-btn') as HTMLButtonElement | null;
  const btnText = document.getElementById('btn-text');

  const alertError = document.getElementById('status-alert-error') as HTMLElement | null;
  const alertSuccess = document.getElementById('status-alert-success') as HTMLElement | null;

  const div1Select = document.getElementById('divisi_1') as HTMLSelectElement | null;
  const div2Select = document.getElementById('divisi_2') as HTMLSelectElement | null;
  const medhumPortoContainer = document.getElementById('container-medhum-porto') as HTMLElement | null;
  const medhumPortoInput = document.getElementById('portofolio_medhum') as HTMLInputElement | null;

  // Extended Banner Check
  const extendedBanner = document.getElementById('extended-banner');
  if (extendedBanner) {
    const isExtendedNow = stage === 'extended' || (stage === 'auto' && EXTENDED_TIME > 0 && new Date().getTime() >= DEADLINE_TIME && new Date().getTime() < EXTENDED_TIME);
    extendedBanner.style.display = isExtendedNow ? 'block' : 'none';
  }

  // 1. Dynamic Countdown Timers
  const daysEl = document.getElementById('timer-days');
  const hoursEl = document.getElementById('timer-hours');
  const minutesEl = document.getElementById('timer-minutes');
  const secondsEl = document.getElementById('timer-seconds');

  const uDaysEl = document.getElementById('u-timer-days');
  const uHoursEl = document.getElementById('u-timer-hours');
  const uMinutesEl = document.getElementById('u-timer-minutes');
  const uSecondsEl = document.getElementById('u-timer-seconds');

  setInterval(() => {
    const now = new Date().getTime();

    if (uDaysEl) {
      const uDistance = OPEN_TIME - now;
      if (uDistance > 0) {
        uDaysEl.innerText = String(Math.floor(uDistance / (1000 * 60 * 60 * 24)));
        if (uHoursEl) uHoursEl.innerText = String(Math.floor((uDistance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)));
        if (uMinutesEl) uMinutesEl.innerText = String(Math.floor((uDistance % (1000 * 60 * 60)) / (1000 * 60)));
        if (uSecondsEl) uSecondsEl.innerText = String(Math.floor((uDistance % (1000 * 60)) / 1000));
      }
    }

    if (daysEl) {
      const distance = activeDeadline - now;
      if (distance > 0) {
        daysEl.innerText = String(Math.floor(distance / (1000 * 60 * 60 * 24)));
        if (hoursEl) hoursEl.innerText = String(Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)));
        if (minutesEl) minutesEl.innerText = String(Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)));
        if (secondsEl) secondsEl.innerText = String(Math.floor((distance % (1000 * 60)) / 1000));
      }
    }
  }, 1000);

  // 2. MedHum Portfolio Visibility Toggle
  const toggleMedhumPorto = () => {
    const val1 = div1Select?.value || '';
    const val2 = div2Select?.value || '';
    if (val1 === medhumTriggerVal || val2 === medhumTriggerVal) {
      if (medhumPortoContainer) medhumPortoContainer.style.display = 'block';
      if (medhumPortoInput) medhumPortoInput.required = true;
    } else {
      if (medhumPortoContainer) medhumPortoContainer.style.display = 'none';
      if (medhumPortoInput) {
        medhumPortoInput.required = false;
        medhumPortoInput.value = '';
      }
    }
  };

  div1Select?.addEventListener('change', toggleMedhumPorto);
  div2Select?.addEventListener('change', toggleMedhumPorto);

  // 3. Document Screening Results Lookup
  const searchScreeningInput = document.getElementById('search-screening-nim-input') as HTMLInputElement | null;
  const searchScreeningBtn = document.getElementById('search-screening-nim-btn');
  const searchScreeningResultBox = document.getElementById('search-screening-result-box');

  const executeScreeningSearch = () => {
    if (!searchScreeningInput || !searchScreeningResultBox) return;
    const query = searchScreeningInput.value.trim().toLowerCase();
    if (!query) {
      searchScreeningResultBox.style.display = 'block';
      searchScreeningResultBox.style.background = 'rgba(255, 107, 107, 0.1)';
      searchScreeningResultBox.style.color = '#ff6b6b';
      searchScreeningResultBox.innerHTML = '<i class="fa-solid fa-circle-exclamation"></i> Please enter a NIM to search.';
      return;
    }
    const match = (resultsData.candidates || []).find((c: any) => c.nim && String(c.nim).toLowerCase() === query);
    searchScreeningResultBox.style.display = 'block';
    if (match) {
      const isPassed = match.screeningStatus === 'passed';
      searchScreeningResultBox.style.background = isPassed ? 'rgba(32, 201, 151, 0.12)' : 'rgba(255, 255, 255, 0.05)';
      searchScreeningResultBox.style.border = `1px solid ${isPassed ? '#20c997' : 'var(--border-color)'}`;
      searchScreeningResultBox.style.color = isPassed ? '#20c997' : 'var(--text-secondary)';
      searchScreeningResultBox.innerHTML = `
        <div style="font-size: 1.2rem; font-weight: bold; margin-bottom: 6px;">
          ${isPassed ? '🎉 PASSED DOCUMENT SCREENING' : 'ℹ️ Document Screening Status'}
        </div>
        <div style="color: var(--text-primary); font-size: 1.05rem;">${match.name} (${match.nim})</div>
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

  // 4. Technical Test Results Lookup
  const searchTechInput = document.getElementById('search-tech-nim-input') as HTMLInputElement | null;
  const searchTechBtn = document.getElementById('search-tech-nim-btn');
  const searchTechResultBox = document.getElementById('search-tech-result-box');

  const executeTechSearch = () => {
    if (!searchTechInput || !searchTechResultBox) return;
    const query = searchTechInput.value.trim().toLowerCase();
    if (!query) {
      searchTechResultBox.style.display = 'block';
      searchTechResultBox.style.background = 'rgba(255, 107, 107, 0.1)';
      searchTechResultBox.style.color = '#ff6b6b';
      searchTechResultBox.innerHTML = '<i class="fa-solid fa-circle-exclamation"></i> Please enter a NIM to search.';
      return;
    }
    const match = (resultsData.candidates || []).find((c: any) => c.nim && String(c.nim).toLowerCase() === query);
    searchTechResultBox.style.display = 'block';
    if (match) {
      const isPassed = match.technicalTestStatus === 'passed';
      searchTechResultBox.style.background = isPassed ? 'rgba(32, 201, 151, 0.12)' : 'rgba(255, 255, 255, 0.05)';
      searchTechResultBox.style.border = `1px solid ${isPassed ? '#20c997' : 'var(--border-color)'}`;
      searchTechResultBox.style.color = isPassed ? '#20c997' : 'var(--text-secondary)';
      searchTechResultBox.innerHTML = `
        <div style="font-size: 1.2rem; font-weight: bold; margin-bottom: 6px;">
          ${isPassed ? '🎉 PASSED TECHNICAL TEST' : 'ℹ️ Technical Test Status'}
        </div>
        <div style="color: var(--text-primary); font-size: 1.05rem;">${match.name} (${match.nim})</div>
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

  // 5. Final Selection Results Lookup
  const searchInput = document.getElementById('search-nim-input') as HTMLInputElement | null;
  const searchBtn = document.getElementById('search-nim-btn');
  const resultBox = document.getElementById('search-result-box');

  const executeNimSearch = () => {
    if (!searchInput || !resultBox) return;
    const query = searchInput.value.trim().toLowerCase();
    if (!query) {
      resultBox.style.display = 'block';
      resultBox.style.background = 'rgba(255, 107, 107, 0.1)';
      resultBox.style.color = '#ff6b6b';
      resultBox.innerHTML = '<i class="fa-solid fa-circle-exclamation"></i> Please enter a NIM or name to search.';
      return;
    }

    const match = (resultsData.candidates || []).find((c: any) => 
      (c.nim && String(c.nim).toLowerCase() === query) || 
      (c.name && c.name.toLowerCase().includes(query))
    );

    resultBox.style.display = 'block';
    if (match) {
      const isAccepted = match.finalStatus === 'accepted' || match.status === 'accepted';
      if (isAccepted) {
        resultBox.style.background = 'rgba(32, 201, 151, 0.12)';
        resultBox.style.border = '1px solid rgba(32, 201, 151, 0.4)';
        resultBox.style.color = '#20c997';
        resultBox.innerHTML = `
          <div style="font-size: 1.5rem; margin-bottom: 8px;"><i class="fa-solid fa-circle-check"></i> CONGRATULATIONS!</div>
          <div style="font-size: 1.1rem; font-weight: bold; color: var(--text-primary);">${match.name} (${match.nim})</div>
          <div style="margin-top: 4px; font-size: 0.95rem; color: var(--accent-cyan);">Division: <strong>${match.division}</strong></div>
          <p style="margin-top: 10px; font-size: 0.9rem; color: var(--text-secondary);">${match.notes || 'You have been accepted as an assistant at EIM Research Lab.'}</p>
        `;
      } else {
        resultBox.style.background = 'rgba(0, 240, 255, 0.08)';
        resultBox.style.border = '1px solid rgba(0, 240, 255, 0.3)';
        resultBox.style.color = 'var(--accent-cyan)';
        resultBox.innerHTML = `
          <div style="font-size: 1.2rem; margin-bottom: 6px;"><i class="fa-solid fa-info-circle"></i> Status: ${(match.finalStatus || match.status || 'evaluated').toUpperCase()}</div>
          <div style="font-weight: bold; color: var(--text-primary);">${match.name} (${match.nim})</div>
          <p style="margin-top: 8px; font-size: 0.9rem; color: var(--text-secondary);">${match.notes || 'Thank you for participating in this recruitment cycle.'}</p>
        `;
      }
    } else {
      resultBox.style.background = 'rgba(255, 255, 255, 0.05)';
      resultBox.style.color = 'var(--text-secondary)';
      resultBox.innerHTML = `No matching candidate record found for "<strong>${query}</strong>".`;
    }
  };

  searchBtn?.addEventListener('click', executeNimSearch);
  searchInput?.addEventListener('keypress', (e) => { if (e.key === 'Enter') executeNimSearch(); });

  // 6. Registration Form Submission Logic
  formElement?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (alertError) alertError.style.display = 'none';
    if (alertSuccess) alertSuccess.style.display = 'none';

    const nama_lengkap = (document.getElementById('nama_lengkap') as HTMLInputElement).value;
    const nim = (document.getElementById('nim') as HTMLInputElement).value;
    const angkatan = (document.getElementById('angkatan') as HTMLSelectElement).value;
    const email = (document.getElementById('email') as HTMLInputElement).value;
    const nomor_telp = (document.getElementById('nomor_telp') as HTMLInputElement).value;
    const divisi_1 = div1Select ? div1Select.value : '';
    const divisi_2 = div2Select ? div2Select.value : '';
    const alasan_divisi_1 = (document.getElementById('alasan_divisi_1') as HTMLTextAreaElement).value;
    const alasan_divisi_2 = (document.getElementById('alasan_divisi_2') as HTMLTextAreaElement).value;
    const portofolio_medhum = medhumPortoInput?.value || '';
    const bersedia_dipindah = (document.getElementById('bersedia_dipindah') as HTMLSelectElement).value;

    if (divisi_1 === divisi_2) {
      if (alertError) {
        alertError.innerText = 'Division Choice 1 and Division Choice 2 cannot be the same!';
        alertError.style.display = 'block';
      }
      return;
    }

    if ((divisi_1 === medhumTriggerVal || divisi_2 === medhumTriggerVal) && !portofolio_medhum) {
      if (alertError) {
        alertError.innerText = 'Please provide your MedHum portfolio URL link!';
        alertError.style.display = 'block';
      }
      return;
    }

    if (submitBtn && btnText) {
      submitBtn.disabled = true;
      btnText.innerHTML = `Submitting... <i class="fa-solid fa-circle-notch fa-spin" style="margin-left: 8px;"></i>`;
    }

    try {
      const scriptURL = ((import.meta as any).env?.PUBLIC_GOOGLE_SHEET_SCRIPT_URL || '').replace(/^['"]|['"]$/g, '').trim();
      if (!scriptURL) {
        throw new Error('Google Sheets URL has not been configured in the .env file.');
      }

      const payload = {
        'Nama Lengkap': nama_lengkap,
        'NIM': nim,
        'Angkatan': angkatan,
        'Email': email,
        'Nomor Telepon': nomor_telp,
        'Divisi 1': divisi_1,
        'Alasan Divisi 1': alasan_divisi_1,
        'Divisi 2': divisi_2,
        'Alasan Divisi 2': alasan_divisi_2,
        'Portofolio MedHum': portofolio_medhum,
        'Bersedia Dipindah Divisi': bersedia_dipindah
      };

      await fetch(scriptURL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload),
        mode: 'no-cors'
      });

      if (alertSuccess) {
        alertSuccess.innerText = 'Registration successfully submitted! A confirmation email has been sent to your email address.';
        alertSuccess.style.display = 'block';
      }
      formElement.reset();
      toggleMedhumPorto();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      if (alertError) {
        alertError.innerText = err.message || 'Failed to submit. Please try again later.';
        alertError.style.display = 'block';
      }
    } finally {
      if (submitBtn && btnText) {
        submitBtn.disabled = false;
        btnText.innerHTML = `Submit Registration <i class="fa-solid fa-paper-plane" style="margin-left: 8px;"></i>`;
      }
    }
  });
}

// Auto-run if DOM loaded
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initRegistrationScript);
  } else {
    initRegistrationScript();
  }
}
