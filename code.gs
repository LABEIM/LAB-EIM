const sheetName = 'Sheet1';
const scriptProp = PropertiesService.getScriptProperties();

// Fallback registration dates (ISO format with timezone offset)
const DEFAULT_OPEN_DATE_STR = '2026-08-15T00:00:00+07:00';
const DEFAULT_DEADLINE_STR = '2026-08-23T23:59:59+07:00';

// Allowed MIME types for uploaded documents (Security Whitelist)
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

/**
  Pemetaan alias kolom: nama kolom di sheet (kustom) → kunci dataData internal
  Digunakan agar script bisa menulis ke kolom dengan nama berbeda dari standar.
  Tambahkan entri baru jika sheet menggunakan nama kolom lain.
 */
const COLUMN_ALIASES = {
  // Nomor Urut / Row Number
  'no': 'No',
  'no.': 'No',
  'nomor': 'No',
  // Nomor Telepon
  'no. hp': 'Nomor Telepon',
  'nomor hp': 'Nomor Telepon',
  'no hp': 'Nomor Telepon',
  'phone': 'Nomor Telepon',
  'telepon': 'Nomor Telepon',
  // Alasan Divisi 1
  'alasan memilih divisi pertama': 'Alasan Divisi 1',
  'alasan divisi pertama': 'Alasan Divisi 1',
  'alasan 1': 'Alasan Divisi 1',
  // Alasan Divisi 2
  'alasan memilih divisi kedua': 'Alasan Divisi 2',
  'alasan divisi kedua': 'Alasan Divisi 2',
  'alasan 2': 'Alasan Divisi 2',
  // Bersedia Dipindah
  'bersedia di pindahkan': 'Bersedia Dipindah Divisi',
  'bersedia dipindahkan': 'Bersedia Dipindah Divisi',
  'bersedia pindah': 'Bersedia Dipindah Divisi',
  // Portofolio (Kustom/Multi-Divisi)
  'portofolio': 'Portofolio MedHum',
  'portfolio': 'Portofolio MedHum',
  'link portofolio': 'Portofolio MedHum',
  'portofolio divisi': 'Portofolio MedHum',
  'link portofolio divisi': 'Portofolio MedHum',
  // File links (short names)
  'ksm': 'Link KSM',
  'khs': 'Link KHS',
  'ml': 'Link ML',
  'cv': 'Link CV',
  'pi': 'Link PI (Pakta Integritas)',
  'pakta integritas': 'Link PI (Pakta Integritas)',
  // Timestamp
  'timestamp': 'Timestamp',
  'tgl daftar': 'Timestamp',
  'tanggal daftar': 'Timestamp',
  'waktu daftar': 'Timestamp',
  'tgl. daftar': 'Timestamp',
  'waktu': 'Timestamp'
};

/**
  Kembalikan kunci dataData yang sesuai untuk nama kolom di sheet.
  Jika ada alias, gunakan alias; jika tidak, gunakan nama kolom itu sendiri.
 */
function getDataKeyForHeader(sheetHeader) {
  if (!sheetHeader) return '';
  const cleanHeader = String(sheetHeader).trim();
  const lowerHeader = cleanHeader.toLowerCase();

  if (COLUMN_ALIASES[lowerHeader]) {
    return COLUMN_ALIASES[lowerHeader];
  }
  if (/timestamp|waktu|tgl.*daftar|date/i.test(cleanHeader)) {
    return 'Timestamp';
  }
  return cleanHeader;
}

/**
  Cek apakah sebuah expected header sudah tercakup oleh sheet headers yang ada,
  baik secara langsung (nama sama) maupun via alias.
 */
function isExpectedHeaderCovered(expectedHeader, headers) {
  const expLower = String(expectedHeader).trim().toLowerCase();
  for (var i = 0; i < headers.length; i++) {
    const h = String(headers[i]).trim();
    if (h.toLowerCase() === expLower) return true;
    if (getDataKeyForHeader(h).toLowerCase() === expLower) return true;
  }
  return false;
}

/**
  Inisialisasi awal Script Properties untuk spreadsheet aktif.
 */
function initialSetup() {
  const activeSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  scriptProp.setProperty('key', activeSpreadsheet.getId());
}

/**
  Sanitasi string untuk mencegah Formula Injection pada Google Sheets.
  Mencegah karakter =, +, -, @, tab, carriage return di awal string dieksekusi sebagai rumus sheet.
 */
function sanitizeSheetValue(val) {
  if (val === null || val === undefined) return '';
  const strVal = String(val);
  const trimmed = strVal.trim();
  if (/^[=+@\-\t\r]/.test(trimmed)) {
    return "'" + strVal;
  }
  return strVal;
}

/**
  Sanitasi HTML untuk mencegah HTML Injection / XSS pada template email.
  PENTING: Jangan gunakan ini saat menyimpan ke Google Sheets agar data pendaftar tidak korup dengan entitas HTML.
 */
function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  const s = String(str);
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
  Validasi format email dasar
 */
function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

/**
  Mendapatkan atau membuat folder penyimpanan file pendaftaran di Google Drive
  Otomatis menyimpan FOLDER_ID ke ScriptProperties agar eksekusi berikutnya jauh lebih cepat.
 */
function getOrCreateTargetFolder() {
  const folderId = scriptProp.getProperty('FOLDER_ID');
  if (folderId) {
    try {
      return DriveApp.getFolderById(folderId);
    } catch (e) {
      // Fallback jika folder ID tidak valid atau dihapus
    }
  }

  const folderName = 'EIM Recruitment Uploads';
  const folders = DriveApp.getFoldersByName(folderName);
  let targetFolder;
  if (folders.hasNext()) {
    targetFolder = folders.next();
  } else {
    targetFolder = DriveApp.createFolder(folderName);
  }

  // Cache FOLDER_ID untuk meningkatkan kecepatan request berikutnya
  try {
    scriptProp.setProperty('FOLDER_ID', targetFolder.getId());
  } catch (err) {}

  return targetFolder;
}

/**
  Normalisasi objek file dari payload (object atau string base64)
 */
function normalizeFileObject(fileData, fallbackName, fallbackType) {
  if (!fileData) return null;
  if (typeof fileData === 'object' && fileData !== null && fileData.base64) {
    return {
      base64: fileData.base64,
      fileName: fileData.fileName || fileData.name || fallbackName || 'file',
      mimeType: fileData.mimeType || fileData.type || fallbackType || 'application/pdf'
    };
  }
  if (typeof fileData === 'string' && fileData.trim() !== '') {
    // Return null if it's already an HTTP Drive URL
    if (/^https?:\/\//i.test(fileData.trim())) return null;
    return {
      base64: fileData,
      fileName: fallbackName || 'file',
      mimeType: fallbackType || 'application/pdf'
    };
  }
  return null;
}

/**
  Menyimpan file base64 ke Google Drive secara aman (dengan pemeriksaan MIME type & ukuran)
 */
function saveFileToDrive(fileData, targetFolder, prefix, nim, fallbackName, fallbackType) {
  const fileObj = normalizeFileObject(fileData, fallbackName, fallbackType);
  if (!fileObj || !fileObj.base64) {
    return (typeof fileData === 'string' && /^https?:\/\//i.test(fileData.trim()))
      ? sanitizeSheetValue(fileData)
      : '';
  }

  try {
    const mimeType = (fileObj.mimeType || 'application/octet-stream').toLowerCase();
    
    // Keamanan: Validasi MIME Type sesuai whitelist
    if (ALLOWED_MIME_TYPES.indexOf(mimeType) === -1) {
      Logger.log(`Rejected file upload with unsafe MIME type: ${mimeType}`);
      return '';
    }

    const base64Clean = fileObj.base64.replace(/^data:.*?;base64,/, '');
    const decodedBytes = Utilities.base64Decode(base64Clean);

    // Keamanan: Batasi ukuran file maksimum (10 MB per file)
    const maxMb = parseInt(scriptProp.getProperty('MAX_FILE_SIZE_MB') || '10', 10);
    if (decodedBytes.length > maxMb * 1024 * 1024) {
      Logger.log(`Rejected file exceeding ${maxMb}MB limit for NIM ${nim}`);
      return '';
    }

    // Bersihkan nama berkas dari karakter berisiko
    const safeOriginalName = (fileObj.fileName || 'file').replace(/[^a-zA-Z0-9.\-_]/g, '_');
    const fileName = `${prefix}_${nim}_${safeOriginalName}`;
    
    const blob = Utilities.newBlob(decodedBytes, mimeType, fileName);
    const file = targetFolder.createFile(blob);

    // Akses Berkas: Berkas tetap privat secara default. Set Script Property MAKE_FILES_PUBLIC='true' jika ingin membuat link dapat dilihat siapapun yang memiliki link.
    if (scriptProp.getProperty('MAKE_FILES_PUBLIC') === 'true') {
      try {
        file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      } catch (shareErr) {
        Logger.log('Could not set file sharing to ANYONE_WITH_LINK: ' + shareErr.toString());
      }
    }

    return file.getUrl();
  } catch (err) {
    Logger.log('Error saving file to Drive: ' + err.toString());
    return '';
  }
}

/**
  Cek apakah salah satu dari pilihan divisi membutuhkan portofolio (misal: Medhum)
 */
function isPortfolioRequired(divisi1, divisi2) {
  const rawTriggers = scriptProp.getProperty('PORTFOLIO_DIVISIONS') || 'Medhum';
  const triggers = rawTriggers.split(',').map(function(s) { return s.trim().toLowerCase(); }).filter(Boolean);

  const d1 = String(divisi1 || '').trim().toLowerCase();
  const d2 = String(divisi2 || '').trim().toLowerCase();

  return triggers.some(function(t) {
    return (d1 !== '' && d1.indexOf(t) >= 0) || (d2 !== '' && d2.indexOf(t) >= 0);
  });
}

/**
  Mendapatkan dan memvalidasi tautan Grup WhatsApp pendaftaran dari Script Properties.
  Memastikan tautan hanya menggunakan protokol HTTPS dan domain resmi WhatsApp (chat.whatsapp.com / wa.me) demi keamanan pendaftar.
 */
function getSafeWhatsAppUrl() {
  const url = (scriptProp.getProperty('WA_GROUP_URL') || '').trim();
  if (!url) return '';

  // Validasi Keamanan: Harus HTTPS dan mengarah ke domain resmi WhatsApp (chat.whatsapp.com atau wa.me)
  const allowedPatterns = [
    /^https:\/\/chat\.whatsapp\.com\/[A-Za-z0-9_-]+/i,
    /^https:\/\/wa\.me\/[A-Za-z0-9_-]+/i
  ];

  const isSafe = allowedPatterns.some(function(pattern) {
    return pattern.test(url);
  });

  return isSafe ? escapeHtml(url) : '';
}

/**
  Mengirim email konfirmasi pendaftaran kepada pendaftar (Applicant)
 */
function sendConfirmationEmail(data, isRevision) {
  if (!data.Email || !isValidEmail(data.Email)) return;

  // Cek Kuota Harian Email Google Apps Script
  if (MailApp.getRemainingDailyQuota() <= 0) {
    Logger.log('Warning: Daily email quota exhausted. Skipping email confirmation.');
    return;
  }

  // Sanitasi Khusus Tampilan HTML Email
  const safeNama = escapeHtml(data['Nama Lengkap']);
  const safeNim = escapeHtml(data['NIM']);
  const safeAngkatan = escapeHtml(data['Angkatan']);
  const safeDivisi1 = escapeHtml(data['Divisi 1']);
  const safeDivisi2 = escapeHtml(data['Divisi 2']);
  const safeBersedia = escapeHtml(data['Bersedia Dipindah Divisi']);
  const safePorto = data['Portofolio MedHum'] ? escapeHtml(data['Portofolio MedHum']) : '';
  const showPortfolio = Boolean(safePorto);

  const linkKsm = data['Link KSM'] ? escapeHtml(data['Link KSM']) : '';
  const linkKhs = data['Link KHS'] ? escapeHtml(data['Link KHS']) : '';
  const linkMl = data['Link ML'] ? escapeHtml(data['Link ML']) : '';
  const linkCv = data['Link CV'] ? escapeHtml(data['Link CV']) : '';
  const linkPi = data['Link PI (Pakta Integritas)'] ? escapeHtml(data['Link PI (Pakta Integritas)']) : '';
  const safeWaUrl = getSafeWhatsAppUrl();
  const logoUrl = (scriptProp.getProperty('LOGO_URL') || 'https://eimlab.org/assets/email/logo.png').trim();

  const subjectPrefix = isRevision ? '[REVISI] ' : '';
  const subject = `${subjectPrefix}[EIM Research Lab] Konfirmasi Pendaftaran Calon Asisten - ${safeNama}`;
  
  const htmlBody = `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml"
    xmlns:o="urn:schemas-microsoft-com:office:office">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>Konfirmasi Pendaftaran Calon Asisten - EIM Research Lab</title>
    <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:AllowPNG/>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
    <style type="text/css">
        body,
        table,
        td,
        a {
            -webkit-text-size-adjust: 100%;
            -ms-text-size-adjust: 100%;
        }

        table,
        td {
            mso-table-lspace: 0pt;
            mso-table-rspace: 0pt;
        }

        img {
            -ms-interpolation-mode: bicubic;
            border: 0;
            height: auto;
            line-height: 100%;
            outline: none;
            text-decoration: none;
        }

        table {
            border-collapse: collapse !important;
        }

        body {
            height: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            background-color: #F4F5F7;
        }

        a[x-apple-data-detectors] {
            color: inherit !important;
            text-decoration: none !important;
            font-size: inherit !important;
            font-family: inherit !important;
            font-weight: inherit !important;
            line-height: inherit !important;
        }

        @media screen and (max-width: 600px) {
            .email-container {
                width: 100% !important;
                margin: auto !important;
            }

            .fluid {
                max-width: 100% !important;
                height: auto !important;
                margin-left: auto !important;
                margin-right: auto !important;
            }

            .stack-column,
            .stack-column-center {
                display: block !important;
                width: 100% !important;
                max-width: 100% !important;
                direction: ltr !important;
            }

            .content-padding {
                padding: 24px 20px !important;
            }
        }
    </style>
</head>

<body width="100%" style="margin: 0; padding: 0 !important; mso-line-height-rule: exactly; background-color: #F4F5F7;">
    <center style="width: 100%; background-color: #F4F5F7; padding-top: 30px; padding-bottom: 40px;">
        <!--[if mso]>
    <table role="presentation" aria-hidden="true" border="0" cellspacing="0" cellpadding="0" width="600" align="center">
    <tr>
    <td>
    <![endif]-->
        <div style="max-width: 600px; margin: 0 auto;" class="email-container">

            <!-- MAIN CONTAINER CARD -->
            <table role="presentation" aria-hidden="true" cellspacing="0" cellpadding="0" border="0" width="100%"
                style="margin: auto; background-color: #FFFFFF; border-top: 5px solid #0D6A75; box-shadow: 0 1px 4px rgba(0,0,0,0.06); border-radius: 4px;">
                <tr>
                    <td class="content-padding" style="padding: 36px 40px; text-align: left;">

                        <!-- LOGO HEADER -->
                        <table role="presentation" aria-hidden="true" cellspacing="0" cellpadding="0" border="0"
                            width="100%">
                            <tr>
                                <td style="padding-bottom: 28px;">
                                    <img src="${escapeHtml(logoUrl)}"
                                        alt="Enterprise Infrastructure Management" width="180"
                                        style="max-width: 100%; width: 180px; height: auto; display: block; border: 0;">
                                </td>
                            </tr>
                        </table>

                        <!-- HEADING -->
                        <h1 style="font-size: 22px; line-height: 1.3; font-weight: 700; margin: 0 0 16px 0; text-align: left; color: #111827; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
                            Konfirmasi Pendaftaran Calon Asisten Lab EIM ${isRevision ? '<span style="color: #EA580C; font-size: 18px;">[REVISI]</span>' : ''}
                        </h1>

                        <!-- CALLOUT BANNER -->
                        ${isRevision ? `
                        <div style="margin: 0 0 24px 0; background-color: #FFF7ED; border-left: 4px solid #EA580C; border-radius: 4px; padding: 14px 18px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
                            <p style="margin: 0 0 6px 0; font-size: 14px; font-weight: 700; color: #9A3412;">
                                Pemberitahuan Revisi Data Pendaftaran
                            </p>
                            <p style="margin: 0; font-size: 13.5px; line-height: 1.55; color: #9A3412;">
                                Ini adalah konfirmasi data pendaftaran perbaikan <strong>[REVISI]</strong>. Berkas dan data terbaru Anda telah berhasil kami simpan dan perbarui.
                            </p>
                        </div>
                        ` : `
                        <div style="margin: 0 0 24px 0; background-color: #F0F9FA; border-left: 4px solid #0D6A75; border-radius: 4px; padding: 14px 18px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
                            <p style="margin: 0 0 6px 0; font-size: 14px; font-weight: 700; color: #094B53;">
                                Pendaftaran Berhasil Diterima
                            </p>
                            <p style="margin: 0; font-size: 13.5px; line-height: 1.55; color: #094B53;">
                                Berkas dan formulir pendaftaran Anda telah berhasil dicatat pada sistem seleksi asisten EIM Research Lab.
                            </p>
                        </div>
                        `}

                        <!-- PARAGRAPH -->
                        <p style="margin: 0 0 16px 0; font-size: 14px; line-height: 1.6; color: #374151; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
                            Halo <strong style="color: #111827; font-weight: 700;">${safeNama}</strong>,
                        </p>
                        <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 1.6; color: #374151; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
                            Terima kasih telah mendaftar sebagai calon asisten di <strong>Enterprise Infrastructure Management (EIM) Research Lab</strong>. Berikut adalah rincian data pendaftaran yang kami terima:
                        </p>

                        <!-- REGISTRATION SUMMARY LIST -->
                        <div style="margin: 0 0 20px 0;">
                            <table role="presentation" aria-hidden="true" cellspacing="0" cellpadding="0" border="0" width="100%">
                                <tr>
                                    <td valign="top" style="padding: 4px 8px 4px 0; width: 18px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13.5px; color: #0D6A75;">
                                        <span style="color: #0D6A75; font-size: 16px; line-height: 1;">•</span>
                                    </td>
                                    <td valign="top" style="padding: 4px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13.5px; line-height: 1.55; color: #374151;">
                                        <strong style="color: #111827;">Nama Lengkap:</strong> ${safeNama}
                                    </td>
                                </tr>
                                <tr>
                                    <td valign="top" style="padding: 4px 8px 4px 0; width: 18px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13.5px; color: #0D6A75;">
                                        <span style="color: #0D6A75; font-size: 16px; line-height: 1;">•</span>
                                    </td>
                                    <td valign="top" style="padding: 4px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13.5px; line-height: 1.55; color: #374151;">
                                        <strong style="color: #111827;">NIM:</strong> <code style="background-color: #F3F4F6; color: #1F2937; padding: 2px 6px; border-radius: 4px; font-size: 90%; font-family: SFMono-Regular, Consolas, 'Liberation Mono', Menlo, monospace;">${safeNim}</code>
                                    </td>
                                </tr>
                                <tr>
                                    <td valign="top" style="padding: 4px 8px 4px 0; width: 18px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13.5px; color: #0D6A75;">
                                        <span style="color: #0D6A75; font-size: 16px; line-height: 1;">•</span>
                                    </td>
                                    <td valign="top" style="padding: 4px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13.5px; line-height: 1.55; color: #374151;">
                                        <strong style="color: #111827;">Angkatan:</strong> ${safeAngkatan}
                                    </td>
                                </tr>
                                <tr>
                                    <td valign="top" style="padding: 4px 8px 4px 0; width: 18px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13.5px; color: #0D6A75;">
                                        <span style="color: #0D6A75; font-size: 16px; line-height: 1;">•</span>
                                    </td>
                                    <td valign="top" style="padding: 4px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13.5px; line-height: 1.55; color: #374151;">
                                        <strong style="color: #111827;">Pilihan Divisi 1:</strong> ${safeDivisi1}
                                    </td>
                                </tr>
                                <tr>
                                    <td valign="top" style="padding: 4px 8px 4px 0; width: 18px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13.5px; color: #0D6A75;">
                                        <span style="color: #0D6A75; font-size: 16px; line-height: 1;">•</span>
                                    </td>
                                    <td valign="top" style="padding: 4px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13.5px; line-height: 1.55; color: #374151;">
                                        <strong style="color: #111827;">Pilihan Divisi 2:</strong> ${safeDivisi2}
                                    </td>
                                </tr>
                                ${showPortfolio ? `
                                <tr>
                                    <td valign="top" style="padding: 4px 8px 4px 0; width: 18px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13.5px; color: #0D6A75;">
                                        <span style="color: #0D6A75; font-size: 16px; line-height: 1;">•</span>
                                    </td>
                                    <td valign="top" style="padding: 4px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13.5px; line-height: 1.55; color: #374151;">
                                        <strong style="color: #111827;">Portofolio:</strong> <a href="${safePorto}" style="color: #0D6A75; text-decoration: underline; font-weight: 500;" target="_blank">Lihat Portofolio</a>
                                    </td>
                                </tr>` : ''}
                                <tr>
                                    <td valign="top" style="padding: 4px 8px 4px 0; width: 18px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13.5px; color: #0D6A75;">
                                        <span style="color: #0D6A75; font-size: 16px; line-height: 1;">•</span>
                                    </td>
                                    <td valign="top" style="padding: 4px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13.5px; line-height: 1.55; color: #374151;">
                                        <strong style="color: #111827;">Bersedia Dipindah Divisi:</strong> ${safeBersedia}
                                    </td>
                                </tr>
                            </table>
                        </div>

                        <!-- UPLOADED DOCUMENTS LIST -->
                        ${(linkKsm || linkKhs || linkMl || linkCv || linkPi) ? `
                        <div style="margin: 0 0 20px 0;">
                            <p style="margin: 0 0 10px 0; font-size: 14px; font-weight: 700; color: #111827; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                                Berkas Dokumen Terunggah:
                            </p>
                            <table role="presentation" aria-hidden="true" cellspacing="0" cellpadding="0" border="0" width="100%">
                                ${linkKsm ? `
                                <tr>
                                    <td valign="top" style="padding: 3px 8px 3px 0; width: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13.5px; color: #0D6A75;">
                                        <span style="color: #0D6A75; font-size: 16px; line-height: 1;">•</span>
                                    </td>
                                    <td valign="top" style="padding: 3px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13.5px; line-height: 1.55; color: #374151;">
                                        Kartu Studi Mahasiswa (KSM): <a href="${linkKsm}" style="color: #0D6A75; text-decoration: underline; font-weight: 500;" target="_blank">Lihat Dokumen KSM</a>
                                    </td>
                                </tr>` : ''}
                                ${linkKhs ? `
                                <tr>
                                    <td valign="top" style="padding: 3px 8px 3px 0; width: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13.5px; color: #0D6A75;">
                                        <span style="color: #0D6A75; font-size: 16px; line-height: 1;">•</span>
                                    </td>
                                    <td valign="top" style="padding: 3px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13.5px; line-height: 1.55; color: #374151;">
                                        Kartu Hasil Studi (KHS): <a href="${linkKhs}" style="color: #0D6A75; text-decoration: underline; font-weight: 500;" target="_blank">Lihat Dokumen KHS</a>
                                    </td>
                                </tr>` : ''}
                                ${linkMl ? `
                                <tr>
                                    <td valign="top" style="padding: 3px 8px 3px 0; width: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13.5px; color: #0D6A75;">
                                        <span style="color: #0D6A75; font-size: 16px; line-height: 1;">•</span>
                                    </td>
                                    <td valign="top" style="padding: 3px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13.5px; line-height: 1.55; color: #374151;">
                                        Motivation Letter (ML): <a href="${linkMl}" style="color: #0D6A75; text-decoration: underline; font-weight: 500;" target="_blank">Lihat Dokumen ML</a>
                                    </td>
                                </tr>` : ''}
                                ${linkCv ? `
                                <tr>
                                    <td valign="top" style="padding: 3px 8px 3px 0; width: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13.5px; color: #0D6A75;">
                                        <span style="color: #0D6A75; font-size: 16px; line-height: 1;">•</span>
                                    </td>
                                    <td valign="top" style="padding: 3px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13.5px; line-height: 1.55; color: #374151;">
                                        Curriculum Vitae (CV): <a href="${linkCv}" style="color: #0D6A75; text-decoration: underline; font-weight: 500;" target="_blank">Lihat Dokumen CV</a>
                                    </td>
                                </tr>` : ''}
                                ${linkPi ? `
                                <tr>
                                    <td valign="top" style="padding: 3px 8px 3px 0; width: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13.5px; color: #0D6A75;">
                                        <span style="color: #0D6A75; font-size: 16px; line-height: 1;">•</span>
                                    </td>
                                    <td valign="top" style="padding: 3px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13.5px; line-height: 1.55; color: #374151;">
                                        Pakta Integritas (PI): <a href="${linkPi}" style="color: #0D6A75; text-decoration: underline; font-weight: 500;" target="_blank">Lihat Pakta Integritas</a>
                                    </td>
                                </tr>` : ''}
                            </table>
                        </div>
                        ` : ''}

                        <!-- WHATSAPP GROUP CTA CALLOUT -->
                        ${safeWaUrl ? `
                        <div style="margin: 0 0 24px 0; background-color: #F0F9FA; border-left: 4px solid #0D6A75; border-radius: 4px; padding: 14px 18px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
                            <p style="margin: 0 0 6px 0; font-size: 14px; font-weight: 700; color: #094B53;">
                                Grup WhatsApp Calon Asisten
                            </p>
                            <p style="margin: 0 0 14px 0; font-size: 13.5px; line-height: 1.55; color: #094B53;">
                                Silakan bergabung ke grup WhatsApp resmi calon asisten EIM Research Lab untuk koordinasi dan pengumuman tahapan seleksi selanjutnya.
                            </p>
                            <!-- CTA BUTTON -->
                            <table role="presentation" aria-hidden="true" cellspacing="0" cellpadding="0" border="0" style="margin: 0;">
                                <tr>
                                    <td style="border-radius: 6px; background-color: #0D6A75; text-align: left;">
                                        <a href="${safeWaUrl}" target="_blank" rel="noopener noreferrer"
                                            style="background-color: #0D6A75; border: 1px solid #0D6A75; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; font-weight: 600; color: #FFFFFF; text-decoration: none; padding: 10px 22px; display: inline-block; border-radius: 6px; text-align: center;">
                                            Gabung Grup WhatsApp &rarr;
                                        </a>
                                    </td>
                                </tr>
                            </table>
                        </div>
                        ` : ''}

                        <!-- PARAGRAPH -->
                        <p style="margin: 0 0 16px 0; font-size: 14px; line-height: 1.6; color: #374151; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
                            Informasi selanjutnya akan diumumkan melalui email dan kanal komunikasi resmi laboratorium kami.
                        </p>

                        <!-- DIVIDER LINE -->
                        <div style="padding-top: 20px; padding-bottom: 20px;">
                            <hr style="border: 0; border-top: 1px solid #E5E7EB; margin: 0;">
                        </div>

                        <!-- SIGNOFF -->
                        <div style="margin: 20px 0 8px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                            <p style="margin: 0 0 6px 0; font-size: 14px; color: #374151;">
                                Salam hangat,
                            </p>
                            <p style="margin: 0; font-size: 14px; font-weight: 700; color: #111827;">
                                Tim Rekrutmen Asisten EIM
                            </p>
                            <p style="margin: 2px 0 0 0; font-size: 13px; color: #4B5563;">
                                Enterprise Infrastructure Management Research Laboratory
                            </p>
                            <p style="margin: 2px 0 0 0; font-size: 13px; color: #6B7280;">
                                Telkom University, Bandung
                            </p>
                        </div>

                    </td>
                </tr>
            </table>

            <!-- FOOTER -->
            <table role="presentation" aria-hidden="true" cellspacing="0" cellpadding="0" border="0" width="100%"
                style="margin: auto;">
                <tr>
                    <td
                        style="padding: 28px 20px 0 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 12px; line-height: 1.6; text-align: center; color: #6B7280;">
                        <p style="margin: 0 0 6px 0;">Copyright &copy; ${new Date().getFullYear()} Enterprise Infrastructure Management Research Laboratory.</p>
                        <p style="margin: 0 0 16px 0;">Gedung TULT Lantai 8, Ruang TULT.08.09, Telkom University, Bandung, Indonesia</p>
                        <p style="margin: 0 0 20px 0;">
                            <a href="https://eimlab.org" style="color: #4B5563; text-decoration: underline;" target="_blank">Website Lab</a> &nbsp;|&nbsp; 
                            <a href="mailto:laboratoriumeim@gmail.com" style="color: #4B5563; text-decoration: underline;" target="_blank">Hubungi Kami</a>
                        </p>
                        
                        <!-- SOCIAL MEDIA ICONS -->
                        <table role="presentation" aria-hidden="true" cellspacing="0" cellpadding="0" border="0"
                            align="center" style="margin: 0 auto;">
                            <tr>
                                <td style="padding: 0 6px;">
                                    <a href="https://www.instagram.com/eimresearchlab/" target="_blank" style="text-decoration: none;">
                                        <img src="https://cdn-icons-png.flaticon.com/512/1384/1384063.png" width="20" height="20" alt="Instagram" style="display: block; opacity: 0.75; border: 0;">
                                    </a>
                                </td>
                                <td style="padding: 0 6px;">
                                    <a href="https://linkedin.com/company/keprofesian-enterprise-infrastructure-management-eim/" target="_blank" style="text-decoration: none;">
                                        <img src="https://cdn-icons-png.flaticon.com/512/145/145807.png" width="20" height="20" alt="LinkedIn" style="display: block; opacity: 0.75; border: 0;">
                                    </a>
                                </td>
                                <td style="padding: 0 6px;">
                                    <a href="https://github.com/LABEIM" target="_blank" style="text-decoration: none;">
                                        <img src="https://cdn-icons-png.flaticon.com/512/733/733553.png" width="20" height="20" alt="GitHub" style="display: block; opacity: 0.75; border: 0;">
                                    </a>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>

        </div>
        <!--[if mso]>
    </td>
    </tr>
    </table>
    <![endif]-->
    </center>
</body>

</html>`;

  const plainTextBody = `Halo ${data['Nama Lengkap']},\n\n` +
    `Terima kasih telah mendaftar sebagai calon asisten di Enterprise Infrastructure Management (EIM) Research Lab. Data pendaftaran Anda telah berhasil kami terima.\n\n` +
    `Ringkasan Pendaftaran:\n` +
    `- Nama Lengkap: ${data['Nama Lengkap']}\n` +
    `- NIM: ${data['NIM']}\n` +
    `- Angkatan: ${data['Angkatan']}\n` +
    `- Divisi 1: ${data['Divisi 1']}\n` +
    `- Divisi 2: ${data['Divisi 2']}\n` +
    (showPortfolio ? `- Link Portofolio: ${data['Portofolio MedHum']}\n` : '') +
    `- Bersedia Dipindah: ${data['Bersedia Dipindah Divisi']}\n\n` +
    (safeWaUrl ? `Grup WhatsApp Calon Asisten: ${safeWaUrl}\n\n` : '') +
    `Salam,\nTim Rekrutmen Asisten EIM Research Lab\nTelkom University, Bandung`;

  try {
    MailApp.sendEmail({
      to: data.Email,
      subject: subject,
      body: plainTextBody,
      htmlBody: htmlBody
    });
  } catch (err) {
    Logger.log('Error sending email: ' + err.toString());
  }
}

/**
  Endpoint GET untuk pengujian status server (Health Check)
 */
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ 
      'status': 'online', 
      'message': 'EIM Research Lab Recruitment API is operational.' 
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
  Endpoint Utama POST (Menerima Pendaftaran)
 */
function doPost(e) {
  const lock = LockService.getScriptLock();
  
  // Keamanan: Proteksi Race Condition & Akses Konkuren
  const acquired = lock.tryLock(10000);
  if (!acquired) {
    return ContentService
      .createTextOutput(JSON.stringify({ 
        'result': 'error', 
        'error': 'Server is currently busy. Please submit again in a few moments.' 
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  try {
    // 1. CEK STATIS TANGGAL BUKA & DEADLINE DENGAN WAKTU SERVER GOOGLE
    const openConfig = scriptProp.getProperty('OPEN_DATE') || DEFAULT_OPEN_DATE_STR;
    const deadlineConfig = scriptProp.getProperty('DEADLINE') || DEFAULT_DEADLINE_STR;
    const nowTime = new Date().getTime();

    if (openConfig) {
      const openTime = new Date(openConfig).getTime();
      if (!isNaN(openTime) && nowTime < openTime) {
        return ContentService
          .createTextOutput(JSON.stringify({ 
            'result': 'error', 
            'error': 'Registration period has not opened yet.' 
          }))
          .setMimeType(ContentService.MimeType.JSON);
      }
    }

    if (deadlineConfig) {
      const deadlineTime = new Date(deadlineConfig).getTime();
      if (!isNaN(deadlineTime) && nowTime > deadlineTime) {
        return ContentService
          .createTextOutput(JSON.stringify({ 
            'result': 'error', 
            'error': 'Registration period has officially ended.' 
          }))
          .setMimeType(ContentService.MimeType.JSON);
      }
    }

    // Parser data pendaftaran
    const rawData = {};
    if (e && e.parameter) {
      for (const k in e.parameter) {
        rawData[k] = e.parameter[k];
      }
    }
    if (e && e.postData && e.postData.contents) {
      try {
        const json = JSON.parse(e.postData.contents);
        for (const k in json) {
          rawData[k] = json[k];
        }
      } catch (err) {
        // Abaikan jika bukan format JSON
      }
    }

    // 2. CEK HONEYPOT (Anti-bot Protection)
    if (rawData.website_hp && String(rawData.website_hp).trim() !== '') {
      // Return respons sukses palsu untuk mengelabuhi bot spam tanpa menyimpan data apapun
      return ContentService
        .createTextOutput(JSON.stringify({ 'result': 'success', 'row': -1 }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // 3. CEK SECRET AUTH TOKEN (Opsional / Jika dikonfigurasi di Script Properties)
    const rawExpectedSecret = scriptProp.getProperty('SECRET_KEY');
    if (rawExpectedSecret && rawExpectedSecret.trim() !== '') {
      const cleanExpected = rawExpectedSecret.replace(/^["']|["']$/g, '').trim();
      const cleanIncoming = String(rawData.secret_token || '').replace(/^["']|["']$/g, '').trim();
      if (cleanIncoming !== cleanExpected) {
        return ContentService
          .createTextOutput(JSON.stringify({ 
            'result': 'error', 
            'error': 'Unauthorized request signature.' 
          }))
          .setMimeType(ContentService.MimeType.JSON);
      }
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
    const headerRow = Math.max(1, parseInt(scriptProp.getProperty('HEADER_ROW') || '1', 10));

    // Ambil header dari baris yang dikonfigurasi
    let headers = [];
    if (sheet.getLastColumn() > 0 && sheet.getLastRow() >= headerRow) {
      headers = sheet.getRange(headerRow, 1, 1, sheet.getLastColumn()).getValues()[0];
    }

    // Filter header kosong dari akhir array
    while (headers.length > 0 && String(headers[headers.length - 1]).trim() === '') {
      headers.pop();
    }

    // Deteksi apakah header row benar-benar berisi header data
    const hasRealHeaders = headers.length > 0 && expectedHeaders.some(function(h) {
      return isExpectedHeaderCovered(h, headers);
    });

    if (!hasRealHeaders) {
      headers = expectedHeaders.slice();
      sheet.getRange(headerRow, 1, 1, headers.length).setValues([headers]);
      const headerRange = sheet.getRange(headerRow, 1, 1, headers.length);
      headerRange.setFontWeight('bold');
      headerRange.setBackground('#e0f7fa');
      headerRange.setHorizontalAlignment('center');
      if (headerRow === 1) sheet.setFrozenRows(1);
    } else {
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
    let nextRow = headerRow + 1;
    const nimColIdx1 = headers.indexOf('NIM') + 1;
    if (nimColIdx1 > 0 && sheet.getLastRow() > headerRow) {
      const dataRowCount = sheet.getLastRow() - headerRow;
      const nimColValues = sheet.getRange(headerRow + 1, nimColIdx1, dataRowCount, 1).getDisplayValues();
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

    // Bersihkan teks (Sanitasi Formula Injection untuk Sheets, TANPA HTML escaping agar data sheet tidak korup)
    const rawNama = String(rawData['Nama Lengkap'] || rawData['nama_lengkap'] || '');
    const rawNim = String(rawData['NIM'] || rawData['nim'] || '');

    const dataData = {
      'No': autoNumber,
      'Nama Lengkap': sanitizeSheetValue(rawNama),
      'NIM': sanitizeSheetValue(rawNim),
      'Angkatan': sanitizeSheetValue(rawData['Angkatan'] || rawData['angkatan'] || ''),
      'Email': sanitizeSheetValue(rawData['Email'] || rawData['email'] || ''),
      'Nomor Telepon': sanitizeSheetValue(rawData['Nomor Telepon'] || rawData['nomor_telp'] || ''),
      'Divisi 1': sanitizeSheetValue(rawData['Divisi 1'] || rawData['divisi_1'] || ''),
      'Alasan Divisi 1': sanitizeSheetValue(rawData['Alasan Divisi 1'] || rawData['alasan_divisi_1'] || rawData['Alasan'] || ''),
      'Divisi 2': sanitizeSheetValue(rawData['Divisi 2'] || rawData['divisi_2'] || ''),
      'Alasan Divisi 2': sanitizeSheetValue(rawData['Alasan Divisi 2'] || rawData['alasan_divisi_2'] || rawData['Alasan'] || ''),
      'Portofolio MedHum': sanitizeSheetValue(rawData['Portofolio MedHum'] || rawData['portofolio_medhum'] || ''),
      'Bersedia Dipindah Divisi': sanitizeSheetValue(rawData['Bersedia Dipindah Divisi'] || rawData['bersedia_dipindah'] || ''),
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
          const existingNims = sheet.getRange(startCheckRow, nimColIndex, lastRow - startCheckRow + 1, 1).getDisplayValues();
          const targetNimStr = String(dataData['NIM']).replace(/\D/g, '').trim();
          for (let r = 0; r < existingNims.length; r++) {
            const existingNimStr = String(existingNims[r][0]).replace(/\D/g, '').trim();
            if (existingNimStr !== '' && (existingNimStr === targetNimStr || String(existingNims[r][0]).trim() === String(dataData['NIM']).trim())) {
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

    // PROSES UPLOAD BERKAS KE GOOGLE DRIVE DI MEMORI DULU (Single Batch Operation)
    try {
      const targetFolder = getOrCreateTargetFolder();
      const nimStr = dataData['NIM'] || 'pendaftar';

      if (rawData.ksm || rawData.file_ksm) {
        dataData['Link KSM'] = saveFileToDrive(rawData.ksm || rawData.file_ksm, targetFolder, 'KSM', nimStr);
      } else if (rawData['Link KSM']) {
        dataData['Link KSM'] = sanitizeSheetValue(rawData['Link KSM']);
      }

      if (rawData.khs || rawData.file_khs) {
        dataData['Link KHS'] = saveFileToDrive(rawData.khs || rawData.file_khs, targetFolder, 'KHS', nimStr);
      } else if (rawData['Link KHS']) {
        dataData['Link KHS'] = sanitizeSheetValue(rawData['Link KHS']);
      }

      if (rawData.ml || rawData.file_ml) {
        dataData['Link ML'] = saveFileToDrive(rawData.ml || rawData.file_ml, targetFolder, 'ML', nimStr);
      } else if (rawData['Link ML']) {
        dataData['Link ML'] = sanitizeSheetValue(rawData['Link ML']);
      }

      if (rawData.cv || rawData.file_cv) {
        dataData['Link CV'] = saveFileToDrive(rawData.cv || rawData.file_cv, targetFolder, 'CV', nimStr);
      } else if (rawData['Link CV']) {
        dataData['Link CV'] = sanitizeSheetValue(rawData['Link CV']);
      }

      if (rawData.pi || rawData.file_pi) {
        dataData['Link PI (Pakta Integritas)'] = saveFileToDrive(rawData.pi || rawData.file_pi, targetFolder, 'PI', nimStr);
      } else if (rawData['Link PI (Pakta Integritas)']) {
        dataData['Link PI (Pakta Integritas)'] = sanitizeSheetValue(rawData['Link PI (Pakta Integritas)']);
      }
    } catch (fileErr) {
      Logger.log('Error processing drive files: ' + fileErr.toString());
    }

    // TULIS 1X SECARA ATOMIK KE GOOGLE SHEET (Optimal Performance - Hemat API & Latensi)
    const finalRow = new Array(headers.length).fill('');
    for (let i = 0; i < headers.length; i++) {
      const header = headers[i];
      const dataKey = getDataKeyForHeader(header);
      if (dataKey === 'Timestamp') {
        finalRow[i] = dataData['Timestamp'];
      } else if (dataData[dataKey] !== undefined) {
        finalRow[i] = dataData[dataKey];
      }
    }

    sheet.getRange(nextRow, 1, 1, finalRow.length).setValues([finalRow]);

    // KIRIM EMAIL KONFIRMASI (Opsional / Terisolasi Try-Catch)
    try {
      sendConfirmationEmail(dataData, isRevision);
    } catch (emailErr) {
      Logger.log('Error in confirmation email step: ' + emailErr.toString());
    }

    return ContentService
      .createTextOutput(JSON.stringify({ 
        'result': 'success', 
        'row': nextRow, 
        'isRevision': isRevision 
      }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    Logger.log('Critical error in doPost: ' + err.toString());
    return ContentService
      .createTextOutput(JSON.stringify({ 
        'result': 'error', 
        'error': 'An internal server error occurred processing the registration.' 
      }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}