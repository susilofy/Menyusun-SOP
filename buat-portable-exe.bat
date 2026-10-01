@echo off
setlocal enabledelayedexpansion
title 1-KLIK PEMBUAT EXE PORTABLE - PENYUSUN SOP SEKOLAH
color 0B
cls

echo ==============================================================================
echo       SOP SMART SCHOOL - PEMBUAT APLIKASI PORTABLE WINDOWS (.EXE)
echo       Pengembang: Susilo Fitri Yatmoko, M.Pd ^| www.gurumerangkum.com
echo ==============================================================================
echo.
echo Mode: MEMBUAT EXE PORTABLE (Langsung jalan tanpa perlu instalasi)
echo Cocok disimpan di Flashdisk, Google Drive, atau langsung dibagikan ke guru.
echo.

:: 1. Cek ketersediaan Node.js di sistem Windows
where node >nul 2>nul
if %errorlevel% neq 0 (
    color 0C
    echo [PERINGATAN] Node.js belum terdeteksi di laptop / komputer ini!
    echo.
    echo Silakan unduh dan pasang Node.js versi LTS terlebih dahulu dari:
    echo https://nodejs.org/
    echo.
    echo Setelah diinstal, silakan klik 2x kembali file buat-portable-exe.bat ini.
    echo ==============================================================================
    pause
    exit /b 1
)

echo [1/4] Node.js terdeteksi:
node -v
echo.

:: 2. Cek ketersediaan file .env untuk fitur AI Gemini
if not exist ".env" (
    echo [2/4] Memeriksa konfigurasi AI Google Gemini...
    echo.
    echo ------------------------------------------------------------------------------
    echo [PEMBERITAHUAN KUNCI AI GOOGLE GEMINI]
    echo File .env belum ditemukan di folder proyek ini.
    echo.
    echo Apakah Anda ingin memasukkan Kunci API Gemini agar fitur AI aktif di file .EXE?
    echo  - Ketik 'Y' untuk memasukkan Kunci API Gemini (gratis di https://aistudio.google.com/app/apikey)
    echo  - Ketik 'N' untuk lanjut tanpa AI (Aplikasi tetap 100%% berfungsi dengan generator baku SD)
    echo ------------------------------------------------------------------------------
    set /p PILIH_KEY="Pilihan Anda [Y/N]: "
    if /i "!PILIH_KEY!"=="Y" (
        echo.
        set /p USER_API_KEY="Paste / Tempel Kunci API Gemini Anda di sini: "
        echo GEMINI_API_KEY="!USER_API_KEY!">.env
        echo [OK] File .env berhasil dibuat dengan kunci API Anda!
    ) else (
        echo GEMINI_API_KEY="">.env
        echo [INFO] Melanjutkan build. Fitur generator SOP baku offline siap digunakan.
    )
    echo.
) else (
    echo [2/4] File konfigurasi .env terdeteksi.
    echo.
)

:: 3. Cek apakah folder node_modules sudah ada, jika belum jalankan npm install
if not exist "node_modules\" (
    echo [3/4] Modul dependensi belum terpasang. Menjalankan 'npm install'...
    echo       (Harap tunggu sebentar, proses ini hanya perlu berjalan sekali saja)
    echo.
    call npm install --legacy-peer-deps
    if %errorlevel% neq 0 (
        echo.
        echo [INFO] Mencoba kembali dengan toleransi penuh...
        call npm install --force
    )
    if %errorlevel% neq 0 (
        color 0C
        echo.
        echo [GAGAL] Terjadi kesalahan saat mengunduh paket dependensi!
        echo Pastikan komputer Anda terhubung ke internet.
        pause
        exit /b 1
    )
) else (
    echo [3/4] Modul dependensi sudah siap.
)
echo.

:: 4. Jalankan kompilasi khusus EXE Portable
echo [4/4] Sedang merakit file aplikasi EXE PORTABLE...
echo       Harap tunggu 1-2 menit hingga proses packaging selesai...
echo.
call npm run electron:build:portable
if %errorlevel% neq 0 (
    color 0C
    echo.
    echo [GAGAL] Terjadi kendala saat merakit Portable EXE.
    echo Silakan periksa pesan log di atas.
    pause
    exit /b 1
)

:: Salin file .env ke folder release agar EXE portabel langsung mengenali kunci API
if exist ".env" (
    if not exist "release\" mkdir release
    copy /y ".env" "release\.env" >nul
)

:: Selesai dan buka folder release
color 0A
echo.
echo ==============================================================================
echo [SUKSES BERHASIL!] FILE EXE PORTABLE TELAH SELESAI DIRAKIT!
echo.
echo Lokasi file:
echo  Folder : release\
echo  Berkas : Penyusun SOP Sekolah-Portable-1.0.0.exe
echo.
echo Keunggulan versi ini:
echo  - Tidak perlu instalasi (bisa langsung diklik 2x untuk membuka)
echo  - Dapat dipindahkan ke Flashdisk dan dijalankan di laptop Windows mana saja
echo  - File .env otomatis disertakan di folder release agar AI langsung aktif
echo ==============================================================================
echo.
echo Membuka folder 'release'...
timeout /t 2 >nul
start "" "%~dp0release"

echo.
echo Silakan gunakan atau salin file Penyusun SOP Sekolah-Portable-1.0.0.exe tersebut.
echo.
pause
exit /b 0
