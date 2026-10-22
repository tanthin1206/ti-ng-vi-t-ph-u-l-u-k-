@echo off
chcp 65001 >nul
title Tiếng Việt Phiêu Lưu Ký
cd /d "%~dp0"

echo ========================================================
echo          TIẾNG VIỆT PHIÊU LƯU KÝ - LỚP 1
echo ========================================================
echo.

where python >nul 2>nul
if %errorlevel% equ 0 (
    echo [*] Đang khởi động máy chủ nội bộ...
    start "" /b python server.py
    timeout /t 1 >nul
    start http://localhost:8080
    echo [OK] Đã mở ứng dụng: http://localhost:8080
) else (
    echo [*] Đang mở ứng dụng bằng trình duyệt web...
    start "" index.html
    echo [OK] Đã mở ứng dụng thành công!
)

echo.
echo ========================================================
echo Chúc các bé học tập và vui chơi thật vui vẻ!
echo (Bạn có thể đóng cửa sổ đen này lại).
echo ========================================================
timeout /t 3 >nul
