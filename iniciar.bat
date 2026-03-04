@echo off
echo ========================================
echo    🚀 INICIANDO FINANZAPP
echo ========================================
echo.

:: Ir a la carpeta del proyecto
cd /d C:\Users\Alejandro\OneDrive\Escritorio\finanzapp

:: Activar entorno virtual
call venv\Scripts\activate

:: Iniciar backend en nueva ventana
start "Backend FinanzApp" cmd /k "cd backend && python app.py"

:: Esperar 3 segundos
timeout /t 3 /nobreak >nul

:: Abrir frontend en el navegador
start http://localhost:5000
start http://127.0.0.1:5500/frontend/index.html

echo.
echo ========================================
echo    ✅ FINANZAPP INICIADO
echo    📌 Backend: http://localhost:5000
echo    📌 Frontend: http://127.0.0.1:5500
echo ========================================
echo.
echo    Presiona cualquier tecla para cerrar...
pause >nul