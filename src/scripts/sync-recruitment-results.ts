// @ts-ignore
import fs from 'node:fs';
// @ts-ignore
import path from 'node:path';

declare const process: any;

interface CandidateStepStatus {
  stepId: string;
  status: string;
  notes?: string;
}


interface Candidate {
  nim: string;
  division?: string;
  stageStatuses?: CandidateStepStatus[];
  finalStatus?: string;
  notes?: string;
  [key: string]: any;
}


function getActiveSelectionSteps(): Array<{ id: string; title: string }> {
  try {
    const regPath = path.resolve(process.cwd(), 'src/data/registration.json');
    if (fs.existsSync(regPath)) {
      const regData = JSON.parse(fs.readFileSync(regPath, 'utf-8'));
      if (Array.isArray(regData.selectionSteps)) {
        return regData.selectionSteps.filter((s: any) => s.enabled !== false);
      }
    }
  } catch (e) { }
  return [
    { id: 'selection', title: 'Seleksi Berkas' },
    { id: 'technical_test', title: 'Tes Teknikal' },
    { id: 'interview', title: 'Tahap Wawancara' },
    { id: 'final_selection', title: 'Seleksi Akhir' },
  ];
}

function parseBulkImportText(text: string): Candidate[] {
  if (!text || typeof text !== 'string') return [];
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  if (!lines.length) return [];

  let delimiter = ',';
  if (lines[0].includes('\t')) delimiter = '\t';
  else if (lines[0].includes(';')) delimiter = ';';

  const activeSteps = getActiveSelectionSteps();
  const results: Candidate[] = [];
  const firstLineLower = lines[0].toLowerCase();
  const hasHeader = firstLineLower.includes('nim');
  const startIdx = hasHeader ? 1 : 0;

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
      finalStatus: '',
      notes: '',
    };

    // Parse step statuses according to active selection steps
    for (let sIdx = 0; sIdx < activeSteps.length; sIdx++) {
      const colVal = (cols[2 + sIdx] || '').toLowerCase();
      if (!colVal) continue;

      const stepId = activeSteps[sIdx].id;
      const isPass = ['passed', 'pass', 'lolos', 'lulus', 'accepted', 'diterima', 'true'].includes(colVal);
      const isFail = ['failed', 'fail', 'tidak lolos', 'tidak_lolos', 'tidak lulus', 'gagal', 'rejected', 'false'].includes(colVal);
      const statusVal = isFail ? 'failed' : (isPass ? 'passed' : colVal);

      stageStatuses.push({ stepId, status: statusVal });
    }

    const finalColIdx = 2 + activeSteps.length;
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

    const notesColIdx = 3 + activeSteps.length;
    candidate.notes = cols[notesColIdx] || (cols.length > finalColIdx + 1 ? cols[cols.length - 1] : '');

    results.push(candidate);
  }
  return results;
}

export function syncRecruitmentResults(mode: 'merge' | 'replace' | 'clear' = 'merge'): { totalSynced: number; updatedFile: boolean } {
  const filePath = path.resolve(process.cwd(), 'src/data/recruitment_results.json');
  if (!fs.existsSync(filePath)) {
    console.error(`[Sync] File not found: ${filePath}`);
    return { totalSynced: 0, updatedFile: false };
  }

  const rawData = fs.readFileSync(filePath, 'utf-8');
  let data: any = {};
  try {
    data = JSON.parse(rawData);
  } catch (e) {
    console.error('[Sync] Error parsing recruitment_results.json:', e);
    return { totalSynced: 0, updatedFile: false };
  }

  if (mode === 'clear') {
    data.bulkImportText = '';
    data.candidates = [];
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    console.log('[Sync Success] Completely cleared all candidate data and bulkImportText!');
    return { totalSynced: 0, updatedFile: true };
  }

  const bulkText: string = data.bulkImportText || '';
  if (!bulkText.trim()) {
    console.log('[Sync] bulkImportText is empty.');
    if (mode === 'replace') {
      data.candidates = [];
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
      console.log('[Sync Success] Replaced candidates list with empty list (bulkImportText was empty).');
      return { totalSynced: 0, updatedFile: true };
    }
    return { totalSynced: 0, updatedFile: false };
  }

  const parsedCandidates = parseBulkImportText(bulkText);
  if (!parsedCandidates.length) {
    console.log('[Sync] No valid candidate rows parsed from bulkImportText.');
    return { totalSynced: 0, updatedFile: false };
  }

  if (mode === 'replace') {
    data.candidates = parsedCandidates;
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    console.log(`[Sync Success] Replaced candidates list with ${parsedCandidates.length} parsed items!`);
    return { totalSynced: parsedCandidates.length, updatedFile: true };
  }

  // Default mode: merge
  const existingCandidates: Candidate[] = Array.isArray(data.candidates) ? data.candidates : [];
  const candidateMap = new Map<string, Candidate>();

  existingCandidates.forEach(c => {
    if (c.nim) {
      // Sanitize candidate to only allowed schema properties
      const sanitized: Candidate = {
        nim: String(c.nim).trim(),
        division: c.division || '',
        stageStatuses: Array.isArray(c.stageStatuses) ? c.stageStatuses : [],
        finalStatus: c.finalStatus || '',
        notes: c.notes || '',
      };
      candidateMap.set(sanitized.nim, sanitized);
    }
  });

  parsedCandidates.forEach(c => {
    const nimKey = String(c.nim).trim();
    const existing = candidateMap.get(nimKey);
    if (existing) {
      if (c.division) existing.division = c.division;
      if (c.stageStatuses && c.stageStatuses.length) existing.stageStatuses = c.stageStatuses;
      if (c.finalStatus) existing.finalStatus = c.finalStatus;
      if (c.notes) existing.notes = c.notes;
    } else {
      candidateMap.set(nimKey, c);
    }
  });

  data.candidates = Array.from(candidateMap.values());

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  console.log(`[Sync Success] Merged ${data.candidates.length} candidates into Candidate List in recruitment_results.json!`);

  return { totalSynced: data.candidates.length, updatedFile: true };
}


// Run if called directly
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('sync-recruitment-results.ts')) {
  const args = process.argv.slice(2);
  let mode: 'merge' | 'replace' | 'clear' = 'merge';
  if (args.includes('--clear')) {
    mode = 'clear';
  } else if (args.includes('--replace')) {
    mode = 'replace';
  }
  syncRecruitmentResults(mode);
}
