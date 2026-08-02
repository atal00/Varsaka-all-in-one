@echo off
REM ===========================================================================
REM  Varsaka - dev launcher
REM  Starts the backend API (server) and the frontend (Vite) in two windows.
REM ===========================================================================
setlocal
cd /d "%~dp0"

echo.
echo   Varsaka dev launcher
echo   --------------------
echo.

where node >nul 2>nul
if errorlevel 1 goto :no_node

REM --- env files (created from examples only if missing) ----------------------
if not exist "server\.env" if exist "server\.env.example" (
  copy /y "server\.env.example" "server\.env" >nul
  echo   [!] Created server\.env - set MONGODB_URI and JWT_SECRET inside it.
)
if not exist ".env" if exist ".env.example" (
  copy /y ".env.example" ".env" >nul
  echo   [!] Created .env - set VITE_API_BASE. For local dev use http://localhost:4000
)

REM --- install dependencies if missing ---------------------------------------
if not exist "node_modules" (
  echo   [*] Installing frontend dependencies...
  call npm install
)
if not exist "server\node_modules" (
  echo   [*] Installing backend dependencies...
  pushd server
  call npm install
  popd
)

REM --- launch (each window inherits the current directory) --------------------
echo.
echo   [*] Starting backend API   server   -^>  http://localhost:4000
pushd "%~dp0server"
start "Varsaka API" cmd /k "npm run dev"
popd

echo   [*] Starting frontend      vite     -^>  http://localhost:5173
start "Varsaka Web" cmd /k "npm run dev"

echo.
echo   Frontend : http://localhost:5173
echo   API      : http://localhost:4000     health check: /health
echo   Admin    : http://localhost:5173/admin
echo   Portal   : http://localhost:5173/portal
echo.
echo   First run? In the API window run:  npm run seed
echo   ...to create the Super Admin and demo data. Close the windows to stop.
echo.
goto :end

:no_node
echo   [x] Node.js was not found on PATH. Install Node 18+ and try again.

:end
endlocal
pause
