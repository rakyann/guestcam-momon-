# Panduan Perbaikan Google Apps Script (Kode.gs)

Script Google Apps Script sebelumnya mengalami error saat memproses unggahan foto (`Utilities.newBlob`), sehingga foto dari tamu tidak tersimpan di Google Drive dan tidak muncul di web.

## Kode `Kode.gs` Terbaru (Bebas Error & Mendukung Auto-Sync)

Salin kode berikut ke proyek Google Apps Script Anda (di [script.google.com](https://script.google.com)):

```javascript
function doPost(e) {
  try {
    var contents = e.postData.contents;
    var data = JSON.parse(contents);
    
    var base64Str = data.base64 || '';
    if (base64Str.indexOf(',') !== -1) {
      base64Str = base64Str.split(',')[1];
    }
    
    var bytes = Utilities.base64Decode(base64Str);
    var mimeType = data.mimeType || 'image/jpeg';
    var filename = data.filename || ('tuaipandang_' + Date.now() + '.jpg');
    
    var blob = Utilities.newBlob(bytes, mimeType, filename);
    
    var folderId = data.folderId || '14ODs7q1sMDOyqybW8J5Mk7qLhw6u29uJ';
    var folder = DriveApp.getFolderById(folderId);
    var file = folder.createFile(blob);
    
    // Atur izin publik agar foto bisa tampil di website
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    
    if (data.guestName || data.caption) {
      file.setDescription("Oleh: " + (data.guestName || 'Tamu') + "\nUcapan: " + (data.caption || ''));
    }
    
    var fileId = file.getId();
    var publicUrl = "https://lh3.googleusercontent.com/d/" + fileId;
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      url: publicUrl,
      driveFileId: fileId
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  try {
    var folderId = (e && e.parameter && e.parameter.folderId) || '14ODs7q1sMDOyqybW8J5Mk7qLhw6u29uJ';
    var folder = DriveApp.getFolderById(folderId);
    var files = folder.getFiles();
    var photos = [];
    
    while (files.hasNext()) {
      var file = files.next();
      var desc = file.getDescription() || '';
      var guestName = 'Tamu Acara';
      var wish = '';
      
      if (desc) {
        var lines = desc.split('\n');
        for (var i = 0; i < lines.length; i++) {
          if (lines[i].indexOf('Oleh: ') === 0) guestName = lines[i].replace('Oleh: ', '');
          if (lines[i].indexOf('Ucapan: ') === 0) wish = lines[i].replace('Ucapan: ', '');
        }
      }
      
      photos.push({
        id: 'photo_drive_' + file.getId(),
        eventId: 'riztiana-rizky',
        guestName: guestName,
        wish: wish,
        imageUrl: "https://lh3.googleusercontent.com/d/" + file.getId(),
        driveFileId: file.getId(),
        presetId: 'portra400',
        likes: 0,
        timestamp: file.getDateCreated().toISOString()
      });
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      photos: photos
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: err.toString(),
      photos: []
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
```

## Langkah Deployment di Google Apps Script:
1. Buka [Google Apps Script](https://script.google.com) dan buka proyek skrip Anda.
2. Ganti seluruh isi `Kode.gs` dengan kode di atas.
3. Klik **Simpan** (ikon disket / Ctrl+S).
4. Klik tombol **Deploy** -> **New deployment** (atau **Manage deployments** -> edit versi baru).
5. Pastikan:
   - **Execute as**: *Me*
   - **Who has access**: *Anyone* (Siapa saja)
6. Klik **Deploy** dan izinkan akses (Grant access).
