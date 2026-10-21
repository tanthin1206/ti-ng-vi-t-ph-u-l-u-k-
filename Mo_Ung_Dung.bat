@echo off
chcp 65001 >nul
title Tiếng Việt Phiêu Lưu Ký - Máy chủ tự lưu âm thanh
cd /d "%~dp0"
echo ========================================================
echo   TIẾNG VIỆT PHIÊU LƯU KÝ - TỰ ĐỘNG LƯU ÂM THANH VÀO CODE
echo ========================================================
echo Đang khởi động máy chủ tự lưu âm thanh...
start "" /b python server.py
timeout /t 1 >nul
start http://localhost:8080
echo.
echo [OK] Máy chủ đang chạy ngầm trên cổng 8080.
echo Mọi âm thanh bạn thu âm hoặc thêm file trên web
echo sẽ được TỰ ĐỘNG TẠO BẢN CLONE vào thư mục:
echo   assets\audio\rieng\
echo.
echo Để gửi cho người khác, bạn chỉ cần nén cả thư mục này lại!
echo ========================================================
