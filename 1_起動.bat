@echo off
chcp 65001 >nul
setlocal
cd /d "%~dp0"

echo ===================================================
echo   ミナミ工業 鉄骨技術伝承AIバイブル を起動しています...
echo   URL: http://localhost:3001
echo ===================================================

start "" "http://localhost:3001"
call npm run dev

pause
