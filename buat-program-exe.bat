@echo off
setlocal enabledelayedexpansion
title PEMBUAT PROGRAM WINDOWS (.EXE) - PENYUSUN SOP SEKOLAH
color 0B
cls

echo ==============================================================================
echo       SOP SMART SCHOOL - PEMBUAT PROGRAM DESKTOP WINDOWS (.EXE)
echo       Pengembang: Susilo Fitri Yatmoko, M.Pd ^| www.gurumerangkum.com
echo ==============================================================================
echo.

:: 1. Cek ketersediaan Node.js di sistem Windows
where node >nul 2>nul
if %errorlevel% neq 0 (
    color 0C
    echo [PERINGATAN] Node.js belum terdeteksi di laptop / komputer ini!
    echo.
    echo Silakan unduh dan instal Node.js versi LTS terlebih dahulu dari:
    echo https://nodejs.org/
    echo.
    echo Setelah diinstal, silakan jalankan kembali file buat-program-exe.bat ini.
    echo ==============================================================================
    pause
    exit /b 1
)

echo [Pemeriksaan Sistem] Node.js terdeteksi:
node -v
echo.

:: 2. Cek ketersediaan file .env untuk fitur AI Gemini
if not exist ".env" (
    echo ------------------------------------------------------------------------------
    echo [PEMBERITAHUAN KUNCI AI GOOGLE GEMINI]
    echo File .env belum ditemukan di folder proyek ini.
    echo.
    echo Apakah Anda ingin memasukkan Kunci API Gemini sekarang?
    echo  - Ketik 'Y' untuk memasukkan Kunci API Gemini (gratis di https://aistudio.google.com/app/apikey)
    echo  - Ketik 'N' untuk lanjut tanpa AI (Aplikasi tetap 100%% bekerja dengan generator baku SD)
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
)

:: 3. Cek apakah folder node_modules sudah ada
if not exist "node_modules\" (
    echo [Info] Modul dependensi belum terpasang. Menjalankan instalasi awal...
    echo        (Harap tunggu sebentar, proses ini hanya berjalan sekali saja)
    echo.
    call npm install --legacy-peer-deps
    if %errorlevel% neq 0 (
        call npm install --force
    )
    if %errorlevel% neq 0 (
        color 0C
        echo [GAGAL] Terjadi kesalahan saat mengunduh paket dependensi!
        echo Pastikan komputer Anda terhubung ke internet.
        pause
        exit /b 1
    )
)

:MENU
cls
echo ==============================================================================
echo       SOP SMART SCHOOL - PILIH JENIS APLIKASI YANG INGIN DIBUAT
echo ==============================================================================
echo.
echo  [1] Buat EXE PORTABLE (Rekomendasi Utama)
echo      - Langsung klik 2x dan jalan tanpa perlu instalasi.
echo      - Praktis disimpan di Flashdisk, Google Drive, atau dibagikan ke guru.
echo      - Tidak memerlukan izin hak akses Administrator komputer sekolah.
echo.
echo  [2] Buat EXE INSTALLER (Setup Resmi Windows)
echo      - Menghasilkan file installer wizard setup (Next-Next-Finish).
echo      - Menambahkan ikon pintasan di Desktop dan Start Menu Windows.
echo.
echo  [3] Buat KEDUA VERSI SEKALIGUS (Portable + Setup Installer)
echo      - Merakit kedua file installer ke folder release.
echo.
echo  [4] Uji Coba Jalankan Aplikasi (Mode Pratinjau Desktop)
echo      - Membuka jendela aplikasi desktop tanpa mengompilasi file .exe.
echo.
echo  [5] Masukkan / Ubah Kunci API AI Gemini (.env)
echo.
echo  [6] Buka Folder Berkas Hasil ('release')
echo.
echo  [0] Keluar
echo.
echo ==============================================================================
set /p PILIHAN="Ketik angka pilihan Anda [1/2/3/4/5/6/0] lalu tekan ENTER: "

if "%PILIHAN%"=="1" goto BUAT_PORTABLE
if "%PILIHAN%"=="2" goto BUAT_INSTALLER
if "%PILIHAN%"=="3" goto BUAT_SEMUA
if "%PILIHAN%"=="4" goto JALANKAN_DEV
if "%PILIHAN%"=="5" goto SET_API_KEY
if "%PILIHAN%"=="6" goto BUKA_RELEASE
if "%PILIHAN%"=="0" exit /b 0

echo Pilihan tidak valid. Silakan coba lagi.
timeout /t 2 >nul
goto MENU

:SET_API_KEY
cls
echo ==============================================================================
echo PENGATURAN KUNCI API AI GEMINI (.env)
echo ==============================================================================
echo.
echo Kunci API Gemini bisa didapatkan gratis di:
echo https://aistudio.google.com/app/apikey
echo.
set /p USER_API_KEY="Paste / Tempel Kunci API Gemini Anda di sini: "
echo GEMINI_API_KEY="!USER_API_KEY!">.env
if exist "release\" copy /y ".env" "release\.env" >nul
echo.
echo [BERHASIL] Kunci API berhasil disimpan di file .env!
pause
goto MENU

:BUAT_PORTABLE
cls
echo ==============================================================================
echo Sedang merakit EXE PORTABLE...
echo Harap tunggu 1-2 menit hingga proses packaging selesai...
echo ==============================================================================
echo.
call npm run electron:build:portable
if %errorlevel% neq 0 goto GAGAL
if exist ".env" (
    if not exist "release\" mkdir release
    copy /y ".env" "release\.env" >nul
)
goto SUKSES_PORTABLE

:BUAT_INSTALLER
cls
echo ==============================================================================
echo Sedang merakit EXE INSTALLER RESMI WINDOWS...
echo Harap tunggu sebentar hingga installer NSIS selesai dibuat...
echo ==============================================================================
echo.
call npm run electron:build:installer
if %errorlevel% neq 0 goto GAGAL
if exist ".env" (
    if not exist "release\" mkdir release
    copy /y ".env" "release\.env" >nul
)
goto SUKSES_INSTALLER

:BUAT_SEMUA
cls
echo ==============================================================================
echo Sedang merakit KEDUA VERSI (Portable + Setup Installer)...
echo Harap tunggu beberapa menit...
echo ==============================================================================
echo.
call npm run electron:build:win
if %errorlevel% neq 0 goto GAGAL
if exist ".env" (
    if not exist "release\" mkdir release
    copy /y ".env" "release\.env" >nul
)
goto SUKSES_SEMUA

:JALANKAN_DEV
cls
echo Membuka aplikasi dalam jendela pratinjau desktop...
call npm run electron:dev
pause
goto MENU

:BUKA_RELEASE
if not exist "release\" mkdir release
start "" "%~dp0release"
goto MENU

:GAGAL
color 0C
echo.
echo [GAGAL] Terjadi kesalahan saat proses kompilasi!
echo Silakan periksa pesan error di atas.
pause
color 0B
goto MENU

:SUKSES_PORTABLE
color 0A
echo.
echo ==============================================================================
echo [SUKSES BERHASIL] APLIKASI EXE PORTABLE SELESAI DIBUAT!
echo.
echo Berkas tersimpan di:
echo  Folder : release\
echo  Berkas : Penyusun SOP Sekolah-Portable-1.0.0.exe
echo ==============================================================================
echo.
timeout /t 2 >nul
start "" "%~dp0release"
pause
color 0B
goto MENU

:SUKSES_INSTALLER
color 0A
echo.
echo ==============================================================================
echo [SUKSES BERHASIL] INSTALLER RESMI WINDOWS SELESAI DIBUAT!
echo.
echo Berkas tersimpan di:
echo  Folder : release\
echo  Berkas : Penyusun SOP Sekolah-Setup-1.0.0.exe
echo ==============================================================================
echo.
timeout /t 2 >nul
start "" "%~dp0release"
pause
color 0B
goto MENU

:SUKSES_SEMUA
color 0A
echo.
echo ==============================================================================
echo [SUKSES BERHASIL] KEDUA BERKAS EXE TELAH SELESAI DIBUAT!
echo.
echo Berkas tersimpan di folder release\:
echo  1. Penyusun SOP Sekolah-Portable-1.0.0.exe (Portable tanpa instalasi)
echo  2. Penyusun SOP Sekolah-Setup-1.0.0.exe    (Installer setup Windows)
echo ==============================================================================
echo.
timeout /t 2 >nul
start "" "%~dp0release"
pause
color 0B
goto MENU
