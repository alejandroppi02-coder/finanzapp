@echo off
echo ========================================
echo    🛑 CERRANDO FINANZAPP
echo ========================================
echo.

:: Cerrar ventanas de Python
taskkill /f /im python.exe 2>nul

:: Cerrar ventanas de cmd
taskkill /f /fi "WINDOWTITLE eq Backend FinanzApp*" 2>nul

echo.
echo ✅ Todos los procesos cerrados
echo.
echo ========================================
echo    Presiona cualquier tecla para salir
echo ========================================
pause >nul