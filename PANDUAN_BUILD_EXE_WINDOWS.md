# Panduan Lengkap Pembuatan Aplikasi Windows Portable (.exe) & Installer
## SOP SMART SCHOOL — Penyusun SOP Satuan Pendidikan Sekolah Dasar

Aplikasi ini telah dikonfigurasi penuh dengan **Electron** dan **electron-builder** sehingga Anda dapat menghasilkan file **EXE Portable** (langsung jalan tanpa instalasi, cocok untuk flashdisk) maupun file **EXE Setup Installer Resmi Windows**.

---

### CARA PALING CEPAT & MUDAH (CUKUP 1-KLIK)

Anda tidak perlu mengetik perintah terminal yang rumit! Sudah disediakan dua skrip otomatis:

#### Pilihan A: Khusus Membuat EXE Portable (Sangat Direkomendasikan)
1. Ekstrak folder proyek ini di laptop/komputer Anda.
2. Cari dan klik 2x file: **`buat-portable-exe.bat`**.
3. Komputer akan otomatis memeriksa sistem, memasang modul, merakit file **`Penyusun SOP Sekolah-Portable-1.0.0.exe`**, dan langsung membuka folder **`release`** saat selesai!

#### Pilihan B: Menu Pilihan Lengkap
1. Klik 2x file: **`buat-program-exe.bat`**.
2. Akan muncul menu interaktif:
   * **[1]** Buat EXE PORTABLE (Langsung jalan tanpa instalasi)
   * **[2]** Buat EXE INSTALLER (Setup Wizard Windows)
   * **[3]** Buat KEDUA VERSI SEKALIGUS
   * **[4]** Uji Coba Mode Desktop (Pratinjau)
   * **[5]** Buka Folder Hasil `release\`

---

### A. Persiapan Komputer / Laptop Windows Anda

Sebelum membuat file `.exe`, pastikan komputer Anda telah terpasang:

1. **Node.js (Versi LTS disarankan v20 atau v22)**
   * Unduh gratis dari situs resmi: [https://nodejs.org/](https://nodejs.org/)
   * Pilih varian **Windows Installer (.msi) 64-bit**.
   * Ikuti wizard instalasi sampai selesai (klik *Next* sampai *Finish*).
   * Verifikasi ketersediaan Node.js lewat Command Prompt (CMD):
     ```cmd
     node -v
     npm -v
     ```

2. **File Proyek Aplikasi**
   * Unduh / ekspor proyek ini dalam format ZIP (dari menu AI Studio: **Export to ZIP** atau Git).
   * Ekstrak file zip ke lokasi di laptop Anda, contoh: `D:\Penyusun-SOP-Sekolah`.

---

### B. Membuat File EXE Menggunakan Command Prompt (CMD / Terminal)

Bagi Anda yang terbiasa menggunakan Command Prompt (CMD) atau Terminal VS Code:

1. Buka CMD dan arahkan ke folder proyek:
   ```cmd
   cd D:\Penyusun-SOP-Sekolah
   ```

2. Pasang dependensi (hanya perlu dijalankan sekali saja di awal):
   ```cmd
   npm install
   ```

3. Jalankan salah satu perintah kompilasi sesuai kebutuhan Anda:
   * **Untuk membuat versi Portable saja (paling cepat):**
     ```cmd
     npm run electron:build:portable
     ```
   * **Untuk membuat versi Installer Setup saja:**
     ```cmd
     npm run electron:build:installer
     ```
   * **Untuk membuat kedua versi sekaligus (Portable + Setup):**
     ```cmd
     npm run electron:build:win
     ```

4. Tunggu 1–2 menit sampai muncul pesan sukses. Hasil file `.exe` akan langsung berada di dalam folder **`release\`**.

---

### C. Mengenal Versi Portable vs Installer

| Fitur | Versi Portable (`...-Portable-1.0.0.exe`) | Versi Installer (`...-Setup-1.0.0.exe`) |
| :--- | :--- | :--- |
| **Instalasi** | **Tidak perlu instalasi sama sekali.** Klik 2x langsung terbuka. | Membuka jendela setup instalasi standar Windows. |
| **Izin Admin** | **Tidak butuh hak Administrator.** Bebas dijalankan di laptop sekolah mana pun. | Memerlukan izin instalasi aplikasi ke Program Files. |
| **Penggunaan Flashdisk** | **Sangat cocok.** Cukup salin satu file `.exe` ke Flashdisk dan bawa ke mana saja. | Harus diinstal ke masing-masing laptop/komputer. |
| **Penyimpanan Data** | Profil sekolah & draf SOP tersimpan aman di direktori lokal. | Tersimpan di folder AppData komputer. |
| **Koneksi Internet** | Berjalan offline penuh (ekspor Word/PDF, template, checklist, flow diagram). | Berjalan offline penuh. |

---

### D. Fitur AI dengan Kunci API Gemini (Opsional)

Aplikasi sudah memiliki generator standar baku lengkap untuk Sekolah Dasar sehingga **tetap dapat membuat SOP secara offline tanpa AI**. Namun jika Anda ingin mengaktifkan kecerdasan buatan Gemini:
1. Buat file bernama `.env` di folder proyek (sejajar dengan `package.json`).
2. Tuliskan kunci API Gemini Anda:
   ```env
   GEMINI_API_KEY="AIzaSy...KunciApiGeminiAnda"
   ```
   *(Kunci API gratis bisa didapatkan di [Google AI Studio](https://aistudio.google.com/app/apikey)).*

---

### E. Fitur Khusus Desktop yang Sudah Terintegrasi

* **Menu Bar Resmi Desktop**:
  * **Berkas**: Cetak Dokumen Langsung (Ctrl+P), Keluar Aplikasi (Ctrl+Q).
  * **Edit**: Undo, Redo, Cut, Copy, Paste, Select All.
  * **Tampilan**: Reload Halaman (F5/Ctrl+R), Mode Layar Penuh (F11), Zoom Tampilan (Ctrl + / -), Alat Pengembang / DevTools (Ctrl+Shift+I).
  * **Bantuan**: Link Portal Pengembang www.gurumerangkum.com & Kotak Dialog Info Aplikasi.
* **Ekspor Berkas**: Ekspor dokumen Word (.docx) dan PDF Landscape A4 langsung tersimpan di komputer pengguna.
* **Penyimpanan Data Permanen**: Menggunakan penyimpanan offline ganda (Browser LocalStorage + File Server Lokal).
