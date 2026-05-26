@echo off
cd /d "%~dp0"
echo Avvio GymLog...
echo Apri il browser su http://localhost:5173
echo.
echo Premi CTRL+C per fermare il server.
echo.
cmd /c npm run dev
pause
