const sheetName = 'Sheet1'
const scriptProp = PropertiesService.getScriptProperties()

// Fallback registration deadline (ISO format with timezone offset)
const DEFAULT_DEADLINE_STR = '2026-08-23T23:59:59+07:00';

/**
  Pemetaan alias kolom: nama kolom di sheet (kustom) → kunci dataData internal
  Digunakan agar script bisa menulis ke kolom dengan nama berbeda dari standar.
  Tambahkan entri baru jika sheet menggunakan nama kolom lain.
 */
const COLUMN_ALIASES = {
  // Nomor Urut / Row Number
  'No': 'No',
  'No.': 'No',
  'Nomor': 'No',
  // Nomor Telepon
  'No. HP': 'Nomor Telepon',
  'Nomor HP': 'Nomor Telepon',
  'No HP': 'Nomor Telepon',
  'No Hp': 'Nomor Telepon',
  'Phone': 'Nomor Telepon',
  'Telepon': 'Nomor Telepon',
  // Alasan Divisi 1
  'Alasan Memilih Divisi Pertama': 'Alasan Divisi 1',
  'Alasan Divisi Pertama': 'Alasan Divisi 1',
  'Alasan 1': 'Alasan Divisi 1',
  // Alasan Divisi 2
  'Alasan Memilih Divisi Kedua': 'Alasan Divisi 2',
  'Alasan Divisi Kedua': 'Alasan Divisi 2',
  'Alasan 2': 'Alasan Divisi 2',
  // Bersedia Dipindah
  'Bersedia di Pindahkan': 'Bersedia Dipindah Divisi',
  'Bersedia Dipindahkan': 'Bersedia Dipindah Divisi',
  'Bersedia Pindah': 'Bersedia Dipindah Divisi',
  // File links (short names)
  'KSM': 'Link KSM',
  'KHS': 'Link KHS',
  'ML': 'Link ML',
  'CV': 'Link CV',
  'PI': 'Link PI (Pakta Integritas)',
  'Pakta Integritas': 'Link PI (Pakta Integritas)',
  // Timestamp
  'Tgl Daftar': 'Timestamp',
  'Tanggal Daftar': 'Timestamp',
  'Waktu Daftar': 'Timestamp',
  'Tgl. Daftar': 'Timestamp'
};

/**
  Kembalikan kunci dataData yang sesuai untuk nama kolom di sheet.
  Jika ada alias, gunakan alias; jika tidak, gunakan nama kolom itu sendiri.
 */
function getDataKeyForHeader(sheetHeader) {
  return COLUMN_ALIASES[sheetHeader] || sheetHeader;
}

/**
  Cek apakah sebuah expected header sudah tercakup oleh sheet headers yang ada,
  baik secara langsung (nama sama) maupun via alias.
 */
function isExpectedHeaderCovered(expectedHeader, headers) {
  if (headers.indexOf(expectedHeader) >= 0) return true;
  for (var aliasKey in COLUMN_ALIASES) {
    if (COLUMN_ALIASES[aliasKey] === expectedHeader && headers.indexOf(aliasKey) >= 0) return true;
  }
  return false;
}

function initialSetup () {
  const activeSpreadsheet = SpreadsheetApp.getActiveSpreadsheet()
  scriptProp.setProperty('key', activeSpreadsheet.getId())
}

/**
  Sanitasi string untuk mencegah Formula Injection pada Google Sheets
 */
function sanitizeSheetValue(val) {
  if (val === null || val === undefined) return '';
  if (typeof val !== 'string') return val;
  const trimmed = val.trim();
  if (/^[=+@\-\t\r]/.test(trimmed)) {
    return "'" + val;
  }
  return val;
}

/**
  Sanitasi HTML untuk mencegah HTML Injection / XSS pada email dan sheet
 */
function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  if (typeof str !== 'string') return String(str);
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
  Mendapatkan atau membuat folder penyimpanan file pendaftaran di Google Drive
 */
function getOrCreateTargetFolder() {
  const folderId = scriptProp.getProperty('FOLDER_ID');
  if (folderId) {
    try {
      return DriveApp.getFolderById(folderId);
    } catch (e) {
      // Fallback jika folder ID tidak valid
    }
  }

  const folderName = 'EIM Recruitment Uploads';
  const folders = DriveApp.getFoldersByName(folderName);
  if (folders.hasNext()) {
    return folders.next();
  }
  return DriveApp.createFolder(folderName);
}

/**
  Menyimpan file base64 ke Google Drive dan mengembalikan URL-nya (Akses privat ke pemilik Drive)
 */
function saveFileToDrive(fileData, targetFolder, prefix, nim) {
  if (!fileData || typeof fileData !== 'object' || !fileData.base64) {
    return typeof fileData === 'string' ? fileData : '';
  }

  try {
    const base64Clean = fileData.base64.replace(/^data:.*?;base64,/, '');
    const decodedBytes = Utilities.base64Decode(base64Clean);
    const fileName = `${prefix}_${nim}_${fileData.fileName || 'file'}`;
    const blob = Utilities.newBlob(decodedBytes, fileData.mimeType || 'application/octet-stream', fileName);
    
    const file = targetFolder.createFile(blob);
    // Catatan Privasi: setSharing(ANYONE_WITH_LINK) sengaja DIHAPUS agar berkas tetap privat bagi admin lab
    return file.getUrl();
  } catch (err) {
    Logger.log('Error saving file: ' + err.toString());
    return '';
  }
}

/**
  Mengirim email konfirmasi pendaftaran kepada pendaftar (Applicant)
 */
/**
  Mengirim email konfirmasi pendaftaran kepada pendaftar (Applicant)
 */
function sendConfirmationEmail(data, isRevision) {
  if (!data.Email) return;

  const safeNama = escapeHtml(data['Nama Lengkap']);
  const safeNim = escapeHtml(data['NIM']);
  const safeAngkatan = escapeHtml(data['Angkatan']);
  const safeDivisi1 = escapeHtml(data['Divisi 1']);
  const safeDivisi2 = escapeHtml(data['Divisi 2']);
  const safeBersedia = escapeHtml(data['Bersedia Dipindah Divisi']);
  const safePorto = data['Portofolio MedHum'] ? escapeHtml(data['Portofolio MedHum']) : '';

  const subjectPrefix = isRevision ? '[REVISI] ' : '';
  const subject = `${subjectPrefix}[EIM Research Lab] Confirmation of Recruitment Registration - ${safeNama}`;
  
  const htmlBody = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0b0f19; color: #e2e8f0; border-radius: 12px; overflow: hidden; border: 1px solid #1e293b;">
      <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 30px; text-align: center; border-bottom: 2px solid #06b6d4;">
        <h1 style="color: #06b6d4; margin: 0; font-size: 24px; text-transform: uppercase; letter-spacing: 1px;">EIM Research Lab</h1>
        <p style="color: #94a3b8; margin-top: 8px; font-size: 14px;">Assistant Recruitment Confirmation ${isRevision ? '<span style="color: #f97316; font-weight: bold;">[REVISI]</span>' : ''}</p>
      </div>

      <div style="padding: 30px;">
        ${isRevision ? `
        <div style="background-color: #451a03; border-left: 4px solid #f97316; color: #ffedd5; padding: 14px 18px; border-radius: 6px; margin-bottom: 20px; font-size: 14px;">
          <strong>ℹ️ Pemberitahuan Revisi:</strong> Ini adalah konfirmasi data pendaftaran perbaikan <strong>[REVISI]</strong>. Berkas dan data terbaru Anda telah berhasil kami catat.
        </div>
        ` : ''}
        <h2 style="color: #f8fafc; font-size: 18px; margin-top: 0;">Halo, ${safeNama}!</h2>
        <p style="color: #cbd5e1; line-height: 1.6;">Terima kasih telah mendaftar sebagai calon asisten di <strong>EIM Research Lab</strong>. Berkas dan data pendaftaran Anda telah berhasil kami terima.</p>
        
        <div style="background-color: #1e293b; border-left: 4px solid #06b6d4; padding: 20px; border-radius: 6px; margin: 25px 0;">
          <h3 style="color: #06b6d4; margin-top: 0; font-size: 15px; text-transform: uppercase; letter-spacing: 0.5px;">Ringkasan Pendaftaran</h3>
          <table style="width: 100%; color: #cbd5e1; font-size: 14px; border-collapse: collapse;">
            <tr><td style="padding: 6px 0; width: 40%; color: #94a3b8;">Nama Lengkap</td><td style="padding: 6px 0; font-weight: 600;">: ${safeNama}</td></tr>
            <tr><td style="padding: 6px 0; color: #94a3b8;">NIM</td><td style="padding: 6px 0; font-weight: 600;">: ${safeNim}</td></tr>
            <tr><td style="padding: 6px 0; color: #94a3b8;">Angkatan</td><td style="padding: 6px 0; font-weight: 600;">: ${safeAngkatan}</td></tr>
            <tr><td style="padding: 6px 0; color: #94a3b8;">Pilihan Divisi 1</td><td style="padding: 6px 0; font-weight: 600;">: ${safeDivisi1}</td></tr>
            <tr><td style="padding: 6px 0; color: #94a3b8;">Pilihan Divisi 2</td><td style="padding: 6px 0; font-weight: 600;">: ${safeDivisi2}</td></tr>
            ${safePorto ? `<tr><td style="padding: 6px 0; color: #94a3b8;">Portofolio MedHum</td><td style="padding: 6px 0;"><a href="${safePorto}" style="color: #38bdf8;">Lihat Portofolio</a></td></tr>` : ''}
            <tr><td style="padding: 6px 0; color: #94a3b8;">Bersedia Dipindah</td><td style="padding: 6px 0; font-weight: 600;">: ${safeBersedia}</td></tr>
          </table>
        </div>

        <p style="color: #cbd5e1; line-height: 1.6;">Tahapan seleksi berikutnya akan diinformasikan lebih lanjut melalui email dan WhatsApp resmi EIM Research Lab.</p>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #334155; text-align: center; font-size: 12px; color: #64748b;">
          <p style="margin: 0;">EIM Research Lab &copy; ${new Date().getFullYear()} — Enterprise & Infrastructure Management</p>
        </div>
      </div>
    </div>
  `;

  try {
    MailApp.sendEmail({
      to: data.Email,
      subject: subject,
      htmlBody: htmlBody
    });
  } catch (err) {
    Logger.log('Error sending email: ' + err.toString());
  }
}

function doPost (e) {
  const lock = LockService.getScriptLock()
  // Menunggu hingga 10 detik jika ada akses konkuren dari beberapa user sekaligus
  lock.tryLock(10000)

  try {
    // 1. CEK DEADLINE
    const deadlineConfig = scriptProp.getProperty('DEADLINE') || DEFAULT_DEADLINE_STR;
    const deadlineTime = new Date(deadlineConfig).getTime();
    const nowTime = new Date().getTime();

    if (nowTime > deadlineTime) {
      return ContentService
        .createTextOutput(JSON.stringify({ 
          'result': 'error', 
          'error': 'Registration period has officially ended.' 
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // Parser data pendaftaran
    const rawData = {};
    if (e.parameter) {
      for (const k in e.parameter) {
        rawData[k] = e.parameter[k];
      }
    }
    if (e.postData && e.postData.contents) {
      try {
        const json = JSON.parse(e.postData.contents);
        for (const k in json) {
          rawData[k] = json[k];
        }
      } catch (err) {
        // Abaikan jika bukan format JSON
      }
    }

    // 2. CEK HONEYPOT (Anti-bot)
    if (rawData.website_hp && String(rawData.website_hp).trim() !== '') {
      // Jika field honeypot terisi, kembalikan respons pura-pura sukses agar bot terkecoh tanpa memproses apapun
      return ContentService
        .createTextOutput(JSON.stringify({ 'result': 'success', 'row': -1 }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // 3. CEK SECRET AUTH TOKEN (Opsional / jika dikonfigurasi di Script Properties)
    const expectedSecret = scriptProp.getProperty('SECRET_KEY');
    if (expectedSecret && rawData.secret_token !== expectedSecret) {
      return ContentService
        .createTextOutput(JSON.stringify({ 
          'result': 'error', 
          'error': 'Unauthorized request signature.' 
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    let doc;
    const key = scriptProp.getProperty('key');
    if (key) {
      doc = SpreadsheetApp.openById(key);
    } else {
      doc = SpreadsheetApp.getActiveSpreadsheet();
    }
    
    // Gunakan nama sheet dari Script Properties (SHEET_NAME), fallback ke konstanta 'Sheet1'
    const targetSheetName = scriptProp.getProperty('SHEET_NAME') || sheetName;
    let sheet = doc.getSheetByName(targetSheetName);
    if (!sheet) {
      // Jika sheet bernama targetSheetName tidak ada, gunakan sheet pertama yang ada
      // (bukan membuat sheet baru 'Sheet1' yang tersembunyi dari user)
      const allSheets = doc.getSheets();
      sheet = allSheets.length > 0 ? allSheets[0] : doc.insertSheet(targetSheetName);
    }

    // Header resmi 18 kolom sesuai spesifikasi (termasuk No)
    const expectedHeaders = [
      'No',
      'Nama Lengkap',
      'NIM',
      'Angkatan',
      'Email',
      'Nomor Telepon',
      'Divisi 1',
      'Alasan Divisi 1',
      'Divisi 2',
      'Alasan Divisi 2',
      'Portofolio MedHum',
      'Bersedia Dipindah Divisi',
      'Link KSM',
      'Link KHS',
      'Link ML',
      'Link CV',
      'Link PI (Pakta Integritas)',
      'Timestamp'
    ];

    // Baca header row yang dikonfigurasi (default: baris 1)
    // Set Script Property HEADER_ROW=4 jika header sheet ada di baris 4
    const headerRow = Math.max(1, parseInt(scriptProp.getProperty('HEADER_ROW') || '1', 10));

    // Ambil header dari baris yang dikonfigurasi
    let headers = [];
    if (sheet.getLastColumn() > 0 && sheet.getLastRow() >= headerRow) {
      headers = sheet.getRange(headerRow, 1, 1, sheet.getLastColumn()).getValues()[0];
    }

    // Filter header kosong dari akhir array (bisa ada kolom kosong di kanan)
    while (headers.length > 0 && String(headers[headers.length - 1]).trim() === '') {
      headers.pop();
    }

    // Deteksi apakah header row benar-benar berisi header data (bukan teks metadata)
    const hasRealHeaders = headers.length > 0 && expectedHeaders.some(function(h) {
      return isExpectedHeaderCovered(h, headers);
    });

    if (!hasRealHeaders) {
      // Header row kosong atau hanya berisi teks metadata — inisialisasi dengan header standar
      headers = expectedHeaders.slice();
      sheet.getRange(headerRow, 1, 1, headers.length).setValues([headers]);
      const headerRange = sheet.getRange(headerRow, 1, 1, headers.length);
      headerRange.setFontWeight('bold');
      headerRange.setBackground('#e0f7fa');
      headerRange.setHorizontalAlignment('center');
      if (headerRow === 1) sheet.setFrozenRows(1);
    } else {
      // Sheet sudah ada header (mungkin custom + alias).
      // Hanya tambahkan kolom expected yang BENAR-BENAR tidak ada (cek via alias juga).
      let headersModified = false;
      for (let ei = 0; ei < expectedHeaders.length; ei++) {
        if (!isExpectedHeaderCovered(expectedHeaders[ei], headers)) {
          headers.push(expectedHeaders[ei]);
          headersModified = true;
        }
      }
      if (headersModified) {
        sheet.getRange(headerRow, 1, 1, headers.length).setValues([headers]);
      }
    }

    // Hitung baris data berikutnya setelah baris header
    // Gunakan NIM column sebagai patokan agar kolom custom dengan formula tidak mengacaukan hitungan
    let nextRow = headerRow + 1;
    const nimColIdx1 = headers.indexOf('NIM') + 1; // 1-based
    if (nimColIdx1 > 0 && sheet.getLastRow() > headerRow) {
      const dataRowCount = sheet.getLastRow() - headerRow;
      const nimColValues = sheet.getRange(headerRow + 1, nimColIdx1, dataRowCount, 1).getValues();
      for (let ri = nimColValues.length - 1; ri >= 0; ri--) {
        if (String(nimColValues[ri][0]).trim() !== '') {
          nextRow = headerRow + ri + 2;
          break;
        }
      }
    } else if (sheet.getLastRow() >= headerRow) {
      nextRow = sheet.getLastRow() + 1;
    }

    // Hitung nomor urut otomatis pendaftar (1, 2, 3, dst.)
    const autoNumber = nextRow - headerRow;

    // Normalisasi kunci pencocokan dan sanitasi string
    const dataData = {
      'No': autoNumber,
      'Nama Lengkap': sanitizeSheetValue(escapeHtml(rawData['Nama Lengkap'] || rawData['nama_lengkap'] || '')),
      'NIM': sanitizeSheetValue(escapeHtml(rawData['NIM'] || rawData['nim'] || '')),
      'Angkatan': sanitizeSheetValue(escapeHtml(rawData['Angkatan'] || rawData['angkatan'] || '')),
      'Email': sanitizeSheetValue(escapeHtml(rawData['Email'] || rawData['email'] || '')),
      'Nomor Telepon': sanitizeSheetValue(escapeHtml(rawData['Nomor Telepon'] || rawData['nomor_telp'] || '')),
      'Divisi 1': sanitizeSheetValue(escapeHtml(rawData['Divisi 1'] || rawData['divisi_1'] || '')),
      'Alasan Divisi 1': sanitizeSheetValue(escapeHtml(rawData['Alasan Divisi 1'] || rawData['alasan_divisi_1'] || rawData['Alasan'] || '')),
      'Divisi 2': sanitizeSheetValue(escapeHtml(rawData['Divisi 2'] || rawData['divisi_2'] || '')),
      'Alasan Divisi 2': sanitizeSheetValue(escapeHtml(rawData['Alasan Divisi 2'] || rawData['alasan_divisi_2'] || rawData['Alasan'] || '')),
      'Portofolio MedHum': sanitizeSheetValue(escapeHtml(rawData['Portofolio MedHum'] || rawData['portofolio_medhum'] || '')),
      'Bersedia Dipindah Divisi': sanitizeSheetValue(escapeHtml(rawData['Bersedia Dipindah Divisi'] || rawData['bersedia_dipindah'] || '')),
      'Link KSM': '',
      'Link KHS': '',
      'Link ML': '',
      'Link CV': '',
      'Link PI (Pakta Integritas)': '',
      'Timestamp': Utilities.formatDate(new Date(), 'GMT+7', 'yyyy-MM-dd HH:mm:ss')
    };

    // CEK DEDUP & TAG REVISI: Jika NIM sudah ada, tandai sebagai perbaikan/revisi [REVISI]
    let isRevision = false;
    if (dataData['NIM']) {
      const lastRow = sheet.getLastRow();
      if (lastRow > headerRow) {
        const nimColIndex = headers.indexOf('NIM') + 1;
        if (nimColIndex > 0) {
          const startCheckRow = Math.max(headerRow + 1, lastRow - 50);
          const existingNims = sheet.getRange(startCheckRow, nimColIndex, lastRow - startCheckRow + 1, 1).getValues();
          for (let r = 0; r < existingNims.length; r++) {
            const existingNimStr = String(existingNims[r][0]).trim();
            if (existingNimStr !== '' && existingNimStr === String(dataData['NIM']).trim()) {
              isRevision = true;
              Logger.log('Resubmission detected for NIM: ' + existingNimStr + ' - marking as REVISI.');
              break;
            }
          }
        }
      }
    }

    if (isRevision && !dataData['Nama Lengkap'].includes('[REVISI]')) {
      dataData['Nama Lengkap'] = dataData['Nama Lengkap'] + ' [REVISI]';
    }

    // 1. TULIS DAHULU DATA KE SHEET (index-based + alias-aware)
    const initialRow = new Array(headers.length).fill('');
    for (let i = 0; i < headers.length; i++) {
      const header = headers[i];
      const dataKey = getDataKeyForHeader(header); // resolve alias
      if (dataKey === 'Timestamp') {
        initialRow[i] = dataData['Timestamp'];
      } else if (dataData[dataKey] !== undefined) {
        initialRow[i] = dataData[dataKey];
      }
      // Kolom custom yang tidak dikenal (misal: No, Status, Keterangan) dibiarkan '' (tidak diisi)
    }

    sheet.getRange(nextRow, 1, 1, initialRow.length).setValues([initialRow]);

    // Auto-resize kolom secara efisien (kecuali kolom 1 'No' agar ukurannya tetap ringkas)
    try {
      if (headers.length > 1) {
        sheet.autoResizeColumns(2, headers.length - 1);
      }
      sheet.setColumnWidth(1, 50);
    } catch (resizeErr) {}

    // 2. PROSES UPLOAD BERKAS KE GOOGLE DRIVE SECARA AMAN DENGAN TRY-CATCH
    try {
      const targetFolder = getOrCreateTargetFolder();
      const nim = dataData['NIM'] || 'pendaftar';

      if (rawData.ksm || rawData.file_ksm) {
        dataData['Link KSM'] = saveFileToDrive(rawData.ksm || rawData.file_ksm, targetFolder, 'KSM', nim);
      } else if (rawData['Link KSM']) {
        dataData['Link KSM'] = sanitizeSheetValue(rawData['Link KSM']);
      }

      if (rawData.khs || rawData.file_khs) {
        dataData['Link KHS'] = saveFileToDrive(rawData.khs || rawData.file_khs, targetFolder, 'KHS', nim);
      } else if (rawData['Link KHS']) {
        dataData['Link KHS'] = sanitizeSheetValue(rawData['Link KHS']);
      }

      if (rawData.ml || rawData.file_ml) {
        dataData['Link ML'] = saveFileToDrive(rawData.ml || rawData.file_ml, targetFolder, 'ML', nim);
      } else if (rawData['Link ML']) {
        dataData['Link ML'] = sanitizeSheetValue(rawData['Link ML']);
      }

      if (rawData.cv || rawData.file_cv) {
        dataData['Link CV'] = saveFileToDrive(rawData.cv || rawData.file_cv, targetFolder, 'CV', nim);
      } else if (rawData['Link CV']) {
        dataData['Link CV'] = sanitizeSheetValue(rawData['Link CV']);
      }

      if (rawData.pi || rawData.file_pi) {
        dataData['Link PI (Pakta Integritas)'] = saveFileToDrive(rawData.pi || rawData.file_pi, targetFolder, 'PI', nim);
      } else if (rawData['Link PI (Pakta Integritas)']) {
        dataData['Link PI (Pakta Integritas)'] = sanitizeSheetValue(rawData['Link PI (Pakta Integritas)']);
      }

      // Update baris di sheet dengan link berkas Google Drive (index-based + alias-aware)
      const updatedRow = new Array(headers.length).fill('');
      for (let i = 0; i < headers.length; i++) {
        const header = headers[i];
        const dataKey = getDataKeyForHeader(header); // resolve alias
        if (dataKey === 'Timestamp') {
          updatedRow[i] = dataData['Timestamp'];
        } else if (dataData[dataKey] !== undefined) {
          updatedRow[i] = dataData[dataKey];
        }
      }
      sheet.getRange(nextRow, 1, 1, updatedRow.length).setValues([updatedRow]);
    } catch (fileErr) {
      Logger.log('Error processing drive files: ' + fileErr.toString());
    }

    // 3. KIRIM EMAIL KONFIRMASI (hanya 1x setelah data & berkas siap, aman try-catch)
    try {
      sendConfirmationEmail(dataData, isRevision);
    } catch (emailErr) {
      Logger.log('Error in confirmation email step: ' + emailErr.toString());
    }

    return ContentService
      .createTextOutput(JSON.stringify({ 'result': 'success', 'row': nextRow, 'isRevision': isRevision }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ 'result': 'error', 'error': err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}