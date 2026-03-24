#!/bin/bash

# 🚀 Script de Despliegue Automático - Ritta Estudio v2
# Ejecuta esto en tu computadora y hace TODO automáticamente

set -e  # Detener si hay error

echo "🚀 Iniciando despliegue de Ritta Estudio v2..."
echo ""

# Variables
GITHUB_USER="gonzalosarquis"
GITHUB_TOKEN="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"
REPO_NAME="ritta-estudio-v2"
GITHUB_URL="https://${GITHUB_USER}:${GITHUB_TOKEN}@github.com/${GITHUB_USER}/${REPO_NAME}.git"

# Paso 1: Configurar Git
echo "📋 PASO 1: Configurando Git..."
git config user.email "gonzalo.sarquis123@gmail.com"
git config user.name "Gonzalo Sarquis"
echo "✅ Git configurado"
echo ""

# Paso 2: Agregar remote
echo "📋 PASO 2: Agregando repositorio remoto..."
git remote remove origin 2>/dev/null || true
git remote add origin "$GITHUB_URL"
echo "✅ Remote agregado"
echo ""

# Paso 3: Renombrar branch a main
echo "📋 PASO 3: Renombrando branch a 'main'..."
git branch -M main 2>/dev/null || git branch -m main
echo "✅ Branch renombrado"
echo ""

# Paso 4: Push a GitHub
echo "📋 PASO 4: Haciendo push a GitHub..."
echo "(Esto puede tardar unos segundos...)"
git push -u origin main
echo "✅ Push completado"
echo ""

# Paso 5: Confirmación
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 ¡TODO HECHO EN GITHUB!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📍 Tu repositorio está en:"
echo "   https://github.com/${GITHUB_USER}/${REPO_NAME}"
echo ""
echo "🌐 AHORA NECESITAS:"
echo ""
echo "1️⃣  Ir a https://vercel.com/new"
echo "2️⃣  Conectar con GitHub y seleccionar '${REPO_NAME}'"
echo "3️⃣  Hacer clic en 'Deploy'"
echo ""
echo "4️⃣  Ir a https://supabase.com y crear proyecto"
echo "5️⃣  Copiar URL y API Key"
echo "6️⃣  Agregar a Vercel → Settings → Environment Variables"
echo ""
echo "¿Necesitas ayuda? Revisa CHECKLIST_DEPLOY.md"
echo ""
