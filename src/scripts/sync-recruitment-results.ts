// @ts-ignore
import fs from 'node:fs';
// @ts-ignore
import path from 'node:path';

declare const process: any;

interface Candidate {
  nim: string;
  division?: string;
  screeningStatus?: string;
  technicalTestStatus?: string;
  finalStatus?: string;
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
    }

    if (finalRaw) {
      candidate.finalStatus = ['accepted', 'waitlist', 'rejected'].includes(finalRaw) ? finalRaw : 'accepted';
    }

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
      candidateMap.set(String(c.nim).trim(), c);
    }
  });

  parsedCandidates.forEach(c => {
    const nimKey = String(c.nim).trim();
    const existing = candidateMap.get(nimKey);
    if (existing) {
      if (c.division) existing.division = c.division;
      if (c.screeningStatus) existing.screeningStatus = c.screeningStatus;
      if (c.technicalTestStatus) existing.technicalTestStatus = c.technicalTestStatus;
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
