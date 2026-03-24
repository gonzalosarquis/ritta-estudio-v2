@echo off
REM 🚀 Script de Despliegue Automático - Ritta Estudio v2 (Windows)
REM Ejecuta esto en tu computadora y hace TODO automáticamente

setlocal enabledelayedexpansion

echo.
echo 🚀 Iniciando despliegue de Ritta Estudio v2...
echo.

REM Variables
set GITHUB_USER=gonzalosarquis
set GITHUB_TOKEN=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
set REPO_NAME=ritta-estudio-v2
set GITHUB_URL=https://%GITHUB_USER%:%GITHUB_TOKEN%@github.com/%GITHUB_USER%/%REPO_NAME%.git

REM Paso 1: Configurar Git
echo 📋 PASO 1: Configurando Git...
git config user.email "gonzalo.sarquis123@gmail.com"
git config user.name "Gonzalo Sarquis"
echo ✅ Git configurado
echo.

REM Paso 2: Agregar remote
echo 📋 PASO 2: Agregando repositorio remoto...
git remote remove origin >nul 2>&1
git remote add origin %GITHUB_URL%
echo ✅ Remote agregado
echo.

REM Paso 3: Renombrar branch a main
echo 📋 PASO 3: Renombrando branch a 'main'...
git branch -M main >nul 2>&1
if errorlevel 1 (
  git branch -m main >nul 2>&1
)
echo ✅ Branch renombrado
echo.

REM Paso 4: Push a GitHub
echo 📋 PASO 4: Haciendo push a GitHub...
echo (Esto puede tardar unos segundos...)
git push -u origin main
if errorlevel 1 (
  echo ❌ Error en el push. Verifica tu conexión a internet.
  pause
  exit /b 1
)
echo ✅ Push completado
echo.

REM Paso 5: Confirmación
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo 🎉 ¡TODO HECHO EN GITHUB!
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo 📍 Tu repositorio está en:
echo    https://github.com/%GITHUB_USER%/%REPO_NAME%
echo.
echo 🌐 AHORA NECESITAS:
echo.
echo 1️⃣  Ir a https://vercel.com/new
echo 2️⃣  Conectar con GitHub y seleccionar '%REPO_NAME%'
echo 3️⃣  Hacer clic en 'Deploy'
echo.
echo 4️⃣  Ir a https://supabase.com y crear proyecto
echo 5️⃣  Copiar URL y API Key
echo 6️⃣  Agregar a Vercel ▶ Settings ▶ Environment Variables
echo.
echo ¿Necesitas ayuda? Revisa CHECKLIST_DEPLOY.md
echo.
pause
