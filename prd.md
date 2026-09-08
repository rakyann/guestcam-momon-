# Product Requirements Document (PRD)
## Digital Disposable Camera & Collective Event Album ("SatuFoto" / Satualbum Clone)

---

## 1. Overview & Goal

### 1.1 Product Summary
**SatuFoto** adalah platform web *digital disposable camera* (kamera sekali pakai digital) dan album foto kolektif untuk acara pernikahan, ulang tahun, konser, dan pesta. Tamu acara dapat memotret momen secara spontan dari browser ponsel mereka tanpa perlu mengunduh aplikasi atau mendaftar akun. Cukup dengan memindai **Kode QR** yang disediakan di lokasi acara, tamu langsung terhubung ke kamera digital bertema analog dengan kuota jepretan terbatas, preset film vintage, serta bingkai (*watermark frame*) eksklusif acara.

Seluruh foto yang diambil oleh para tamu secara otomatis terkumpul ke dalam galeri acara (*collective album*) dan dapat ditayangkan secara langsung melalui layar proyektor (**Live Slideshow**) atau diungkapkan setelah acara selesai (*Post-Event Collective Reveal*).

### 1.2 Core Value Proposition
- **Nostalgia Kamera Sekali Pakai**: Membatasi kuota jepretan per tamu untuk mendorong pengambilan foto momen candid yang autentik dan bermakna.
- **Tanpa Hambatan (Zero Friction)**: Bebas unduh aplikasi & bebas registrasi bagi tamu. Cukup scan QR Code via kamera browser (Safari / Chrome).
- **Estetika Film Analog**: Hasil foto secara otomatis diproses menggunakan preset film estetik (Kodak Portra, CineStill 800T, Fuji Superia, B&W Monochrome).
- **Interaksi & Buku Tamu Digital**: Tamu dapat menyertakan ucapan (*wishes*) dan nama pengirim di setiap foto yang diambil.
- **Koleksi Terpusat untuk Host**: Penyelenggara acara tidak perlu lagi merepotkan tamu untuk mengunggah foto ke WhatsApp/Drive. Semua foto siap diunduh dalam resolusi penuh (zip).

---

## 2. User Roles & Key Workflows

### 2.1 User Roles
1. **Guest (Tamu Acara)**
   - Mengakses acara via Kode QR atau URL event (misal `/events/rakyan-wedding`).
   - Memotret foto menggunakan *viewfinder* kamera analog bawaan browser.
   - Mengatur flash, berpindah kamera (depan/belakang), memilih preset film, dan memilih bingkai acara.
   - Mengirim foto disertai nama & ucapan selamat.
   - Melihat galeri kolektif acara, menyukai foto, dan mengunduh kenangan foto.

2. **Host / Penyelenggara (Mempelai / Event Organizer)**
   - Membuat dan mengonfigurasi acara (Judul, Tanggal, Lokasi, Cover Image).
   - Mengatur batas kuota foto per tamu (misal: 10 foto/tamu).
   - Memilih moda *reveal* (Instant Reveal vs Post-Event Reveal dengan countdown).
   - Mendownload poster QR Code siap cetak (*Printable QR Poster*).
   - Mengaktifkan tampilan **Live Slideshow** di layar kaca/proyektor lokasi acara.
   - Mengunduh seluruh arsip foto acara (.ZIP).

---

## 3. Detailed Feature Specifications

### 3.1 Digital Disposable Camera UI (Viewfinder)
- **Viewfinder Display**: Tampilan jendela bidik dengan efek tekstur *viewfinder* analog, garis kisi (*grid line*), dan indikator status.
- **Shot Counter (Roll Limit)**: Indikator sisa jepretan yang tersisa untuk perangkat tamu (misal: `8 / 10 Foto Tersisa`). Tersimpan di `localStorage` per session.
- **Shutter Mechanism**:
  - Tombol jepret bergaya kamera analog retro.
  - Suara *shutter sound effect* realistis saat tombol ditekan.
  - Flash animatif (kilatan layar putih singkat) saat memotret.
- **Camera Controls**:
  - Toggle Flash (Auto / On / Off).
  - Switch Camera (Depan / Belakang / Self-ie mode).
- **Film Presets Engine**:
  - **Kodak Portra 400**: Warm tone, soft contrast, skin-tone optimization.
  - **CineStill 800T**: Night/tungsten glow, cool teal & halation highlights.
  - **Fuji Superia 400**: Vibrant greens & punchy contrast.
  - **B&W Vintage Noir**: High-contrast monochrome dengan grain klasik.
  - **Clean Original**: Foto natural tanpa filter tambahan.
- **Custom Event Frame Overlay**: Option untuk menempelkan bingkai watermark khusus acara (contoh: *"Rakyan & Partner • 02 Aug 2026"*).

### 3.2 Guest Photo Upload & Wishes Modal
- Preview foto hasil jepretan sebelum dikirim.
- Form input opsional:
  - **Nama Tamu**: `[ Input Text ]`
  - **Pesan / Ucapan Selamat**: `[ Textarea ]`
- Opsi retake (mengulang jepretan jika kuota masih ada).
- Tombol **Kirim Momen** dengan indikator *upload progress*.

### 3.3 Event Album Gallery (Galeri Kolektif)
- **Header Event Banner**:
  - Cover Image resolusi tinggi dengan gradien overlay gelap (*dark glassmorphism*).
  - Judul Event, Tanggal, Lokasi, dan badge penghitung total foto terkumpul.
  - Action Bar: `[Ambil Foto / Upload]`, `[Scan / QR Code]`, `[Live Slideshow]`, `[Download Album]`.
- **Photo Grid Layout**:
  - Masonry / Uniform responsive grid (2 kolom di mobile, 3-4 kolom di desktop).
  - Badge Nama Tamu & indikator waktu pengiriman.
  - Tombol Love / Like interaktif.
- **Collective Reveal Lock (Opsional)**:
  - Jika moda *Post-Event Reveal* aktif, foto dalam galeri ditutupi efek blur / kartu misteri hingga hitung mundur (*countdown*) acara selesai.
- **Photo Lightbox Detail**:
  - Modal fullscreen saat foto diklik.
  - Menampilkan foto HD, nama pemotret, ucapan selamat, waktu jepret, dan tombol unduh foto individual.

### 3.4 Live Slideshow Mode
- Halaman/Mode layar penuh (fullscreen) khusus untuk layar proyektor / TV venue.
- Transisi slide foto otomatis (*fading animation* 5 detik per foto).
- Menampilkan foto terbaru secara *real-time* seiring tamu mengambil foto baru.
- Tampilan QR Code di sudut bawah layar agar tamu lain yang melihat layar proyektor bisa langsung scan.

### 3.5 QR Code & Printable Poster Generator
- Modal interaktif penyedia Kode QR unik event.
- Tombol **Salin Tautan Event**.
- Opsi **Tampilan Poster Cetak**: Desain flyer profesional bergaya minimalis bermuatan QR Code, judul acara, dan instruksi ringkas untuk dipajang di meja tamu.

---

## 4. UI/UX & Design Guidelines

- **Theme Palette**: Dark Luxury Aesthetic (`#060606` background, `#080808` card surface, `#E2A07A` warm gold accents, white/muted gray text).
- **Typography**: Combination of Playfair Display / Serif for elegant headers, Inter for clean UI, and Tech Mono for film counter numbers.
- **Glassmorphism & Micro-animations**: Soft radial gradients, backdrop blur (`backdrop-blur-md`), micro-hover transitions, shutter press animation, and smooth scale-up lightboxes.

---

## 5. Non-Functional Requirements

1. **Mobile-First Responsiveness**: 100% dioptimalkan untuk pengunaan smartphone iOS Safari & Android Chrome.
2. **Performance**: Bebas render blocking; *canvas processing* memanfaatkan hardware acceleration browser.
3. **Data Persistence**: Data foto, ucapan, dan sisa kuota jepretan disimpan secara persistent di `localStorage` & in-memory store untuk simulasi full-stack yang handal.

---

## 6. Acceptance Criteria

- [x] Tamu dapat membuka halaman event (`/events/nBmOP692UEYfUlpsmCSP` atau event custom).
- [x] Tamu dapat membuka kamera viewfinder, memilih filter film analog, dan memotret dengan efek suara shutter.
- [x] Kuota jepretan (misal 10 foto) berkurang setiap jepretan dan tersimpan di browser tamu.
- [x] Foto hasil jepretan muncul di Galeri Acara beserta pesan/ucapan dari tamu.
- [x] Pengunjung dapat melihat QR Code modal dan membuka mode Live Slideshow fullscreen.
- [x] Tampilan visual 100% presisi dan memukau dengan tema dark luxury khas *satualbum.id*.
