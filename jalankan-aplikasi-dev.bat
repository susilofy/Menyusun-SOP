@echo off
title PENYUSUN SOP SEKOLAH - MODE UJI COBA DESKTOP
color 0E
cls

echo ==============================================================================
echo       SOP SMART SCHOOL - JALANKAN MODE UJI COBA DESKTOP WINDOWS
echo       Pengembang: Susilo Fitri Yatmoko, M.Pd ^| www.gurumerangkum.com
echo ==============================================================================
echo.

where node >nul 2>nul
if %errorlevel% neq 0 (
    color 0C
    echo [PERINGATAN] Node.js belum terpasang di laptop ini!
    echo Unduh dari: https://nodejs.org/
    pause
    exit /b 1
)

if not exist "node_modules\" (
    echo Mengunduh modul dependensi terlebih dahulu (hanya sekali)...
    call npm install --legacy-peer-deps
)

echo Membuka aplikasi dalam jendela desktop Windows...
call npm run electron:dev
pause
