@echo off
title PEMBUAT PROGRAM INSTALLER EXE - PENYUSUN SOP SEKOLAH
color 0B
cls

echo ==============================================================================
echo       SOP SMART SCHOOL - PEMBUAT PROGRAM INSTALLER WINDOWS (.EXE)
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

echo [1/4] Node.js terdeteksi. Memeriksa modul dependensi...
node -v
echo.

:: 2. Cek apakah folder node_modules sudah ada, jika belum jalankan npm install
if not exist "node_modules\" (
    echo [2/4] Modul dependensi belum terpasang. Menjalankan 'npm install --legacy-peer-deps'...
    echo       (Mohon tunggu beberapa menit, proses ini hanya berjalan sekali saja)
    echo.
    call npm install --legacy-peer-deps
    if %errorlevel% neq 0 (
        echo.
        echo [INFO] Mencoba kembali dengan toleransi dependensi penuh (--force)...
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
    echo [2/4] Modul dependensi sudah siap.
)
echo.

:: 3. Jalankan proses kompilasi dan perakitan ke EXE Windows
echo [3/4] Sedang mengompilasi dan merakit file installer Windows (.EXE)...
echo       Harap tunggu sebentar, sistem sedang memaketkan aplikasi...
echo.
call npm run electron:build:win
if %errorlevel% neq 0 (
    color 0C
    echo.
    echo [GAGAL] Terjadi kesalahan saat proses kompilasi!
    echo Silakan periksa pesan error di atas.
    pause
    exit /b 1
)

:: 4. Selesai dan buka folder release
color 0A
echo.
echo ==============================================================================
echo [SUKSES BERHASIL] PROGRAM INSTALLER WINDOWS (.EXE) TELAH SELESAI DIBUAT!
echo.
echo File installer telah tersimpan di dalam folder 'release':
echo  1. Penyusun SOP Sekolah-Setup-1.0.0.exe   (Installer Resmi Windows)
echo  2. Penyusun SOP Sekolah-Portable-1.0.0.exe(Versi Portable tanpa instal)
echo ==============================================================================
echo.
echo Membuka folder 'release'...
timeout /t 2 >nul
start "" "%~dp0release"

echo.
echo Silakan salin file .exe tersebut untuk dibagikan atau diinstal.
echo.
pause
exit /b 0
