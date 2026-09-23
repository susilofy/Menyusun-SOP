# Panduan Lengkap Pembuatan Aplikasi Windows (.exe) Menggunakan Electron
## SOP SMART SCHOOL — Penyusun SOP Satuan Pendidikan Sekolah Dasar

Aplikasi ini telah dikonfigurasi penuh dengan **Electron** dan **electron-builder** sehingga Anda dapat menghasilkan file instalasi Windows **`.exe` (Installer Setup)** maupun versi **Portable `.exe`** (langsung jalan tanpa instalasi).

---

### CARA PALING PRAKTIS (1-KLIK): Menggunakan `buat-program-exe.bat`

Anda tidak perlu mengetik perintah rumit di CMD/PowerShell! Cukup ikuti 3 langkah mudah ini:

1. **Export to ZIP**: Buka menu di Google AI Studio (kanan atas) > pilih **Export to ZIP**.
2. **Ekstrak ZIP**: Ekstrak file zip hasil unduhan ke folder di laptop Anda.
3. **Klik Dua Kali**: Cari dan klik 2x file **`buat-program-exe.bat`**.

Sistem otomatis akan:
* Memeriksa kesiapan Node.js di laptop Anda.
* Menginstal seluruh modul secara otomatis jika belum ada.
* Mengompilasi dan merakit aplikasi ke dalam file `.exe`.
* Begitu selesai, folder **`release`** otomatis terbuka menampilkan file installer siap pakai!

---

### A. Persiapan pada Laptop/Komputer Windows Anda

Sebelum membuat file `.exe`, pastikan komputer Anda telah terpasang:

1. **Node.js (Versi 20 atau 22 LTS disarankan)**
   * Unduh dari situs resmi: [https://nodejs.org/](https://nodejs.org/)
   * Pilih varian **Windows Installer (.msi) 64-bit**.
   * Ikuti petunjuk instalasi sampai selesai (centang pilihan npm package manager).
   * Verifikasi di Command Prompt / PowerShell:
     ```cmd
     node -v
     npm -v
     ```

2. **File Proyek Aplikasi**
   * Ekspor / unduh kode sumber proyek ini dari AI Studio (menu **Settings / Export to ZIP** atau via Git).
   * Ekstrak file zip ke folder pilihan di komputer Anda, contoh: `D:\Penyusun-SOP-Sekolah`.

---

### B. Langkah Instalasi Dependensi di Windows

1. Buka **Command Prompt (CMD)** atau **PowerShell**, atau buka folder proyek di **VS Code**.
2. Masuk ke folder proyek:
   ```cmd
   cd D:\Penyusun-SOP-Sekolah
   ```
3. Jalankan perintah instalasi paket:
   ```cmd
   npm install
   ```
   *Tunggu beberapa menit hingga proses pengunduhan modul selesai.*

---

### C. Pengaturan Kunci API Gemini (Untuk Fitur AI)

Buat file bernama `.env` di folder utama (sejajar dengan `package.json`), lalu isi dengan:
```env
GEMINI_API_KEY="AIzaSy...KunciApiGeminiAnda"
```
*(Kunci API gratis bisa didapatkan dari [Google AI Studio](https://aistudio.google.com/app/apikey)).*

---

### D. Menjalankan Mode Aplikasi Desktop (Uji Coba Langsung)

Untuk mencoba tampilan aplikasi dalam jendela desktop Windows sebelum di-compile ke `.exe`:
```cmd
npm run electron:dev
```
Aplikasi akan secara otomatis menyalakan server lokal dan membuka jendela desktop mandiri berfitur lengkap (menu bar resmi, cetak dokumen, dan antarmuka responsif).

---

### E. Mengompilasi Menjadi File Installer `.exe` Windows

Untuk menghasilkan file `.exe` yang siap dibagikan ke Kepala Sekolah atau Guru:

```cmd
npm run electron:build:win
```

Perintah ini akan secara otomatis:
1. Mem-build frontend Vite dan backend server ke dalam folder `dist/`.
2. Memaketkan runtime Electron untuk arsitektur Windows x64.
3. Mengonversi ikon aplikasi menjadi ikon resmi Windows.
4. Menghasilkan installer setup dan file portable di dalam folder **`release/`**.

---

### F. Lokasi Hasil File `.exe`

Setelah proses build selesai, buka folder **`release`** di dalam folder proyek Anda:
1. **`Penyusun SOP Sekolah-Setup-1.0.0.exe`**
   * Installer resmi Windows (NSIS).
   * Saat diklik dua kali, akan muncul wizard instalasi, membuat shortcut di Start Menu dan Desktop.
2. **`Penyusun SOP Sekolah-Portable-1.0.0.exe`**
   * Aplikasi mandiri (portable).
   * Bisa langsung dimasukkan ke Flashdisk dan dijalankan di komputer/laptop mana saja tanpa perlu install.

---

### G. Fitur Desktop Khusus yang Sudah Diintegrasikan

* **Menu Bar Resmi Berbahasa Indonesia**:
  * **Berkas**: Cetak Dokumen (Ctrl+P), Keluar (Ctrl+Q).
  * **Edit**: Undo, Redo, Cut, Copy, Paste, Select All.
  * **Tampilan**: Reload (F5/Ctrl+R), Layar Penuh (F11), Zoom Kontrol, Alat Pengembang/DevTools (Ctrl+Shift+I).
  * **Bantuan**: Link situs www.gurumerangkum.com & Dialog info aplikasi.
* **Penyimpanan Offline Permanen**: File default tersimpan lokal di dalam komputer.
* **Ekspor Berkas**: Ekspor dokumen Word (.docx) dan PDF Landscape A4 langsung tersimpan di komputer pengguna.
