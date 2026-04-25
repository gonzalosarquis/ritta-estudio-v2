#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://mefqkijoijoxqjledkib.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_ANON_KEY) {
  console.error('❌ Error: SUPABASE_ANON_KEY environment variable is not set');
  process.exit(1);
}

console.log(`📍 Conectando a: ${SUPABASE_URL}`);
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Slug generation (matches admin panel logic)
function generateSlug(titulo) {
  return titulo
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Extract YouTube video ID from URL
function getYouTubeId(url) {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
  return match ? match[1] : null;
}

// Escape HTML special characters
function escapeHtml(text) {
  if (!text) return '';
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (char) => map[char]);
}

// Create directory if it doesn't exist
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Read external files to embed in HTML
function readTemplate(filename) {
  const templatePath = path.join(__dirname, '..', filename);
  if (fs.existsSync(templatePath)) {
    return fs.readFileSync(templatePath, 'utf-8');
  }
  return '';
}

// Extract CSS from an HTML file
function extractCSS(htmlFile) {
  const content = readTemplate(htmlFile);
  const styleMatch = content.match(/<style[^>]*>[\s\S]*?<\/style>/);
  if (styleMatch) {
    return styleMatch[0];
  }
  return '';
}

// Extract scripts from an HTML file
function extractScripts(htmlFile) {
  const content = readTemplate(htmlFile);
  const scriptMatches = content.match(/<script[^>]*>[\s\S]*?<\/script>/g) || [];
  return scriptMatches.join('\n');
}

// Generate HTML for a single project
function generateProjectHTML(proyecto, imagenes, videos, allProyectos) {
  const slug = proyecto.slug || generateSlug(proyecto.titulo);
  const mainImage = imagenes.length > 0 ? imagenes[0].url : 'https://via.placeholder.com/1200x800';

  // Find prev/next projects
  const proyectoIndex = allProyectos.findIndex(p => p.id === proyecto.id);
  const prevProyecto = proyectoIndex > 0 ? allProyectos[proyectoIndex - 1] : null;
  const nextProyecto = proyectoIndex < allProyectos.length - 1 ? allProyectos[proyectoIndex + 1] : null;

  const imagensList = imagenes
    .map((img, idx) => {
      return `<div class="w-full aspect-[1.45] bg-stone-100 rounded-lg overflow-hidden group">
        <img src="${escapeHtml(img.url)}" alt="${escapeHtml(proyecto.titulo)}"
          class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 cursor-pointer"
          loading="lazy">
      </div>`;
    })
    .join('\n');

  const videosList = videos
    .map((video) => {
      const videoId = getYouTubeId(video.url_youtube);
      return videoId
        ? `<iframe
          src="https://www.youtube.com/embed/${videoId}"
          width="100%"
          height="600"
          class="rounded-lg"
          allowfullscreen=""
          loading="lazy"
          title="${escapeHtml(video.titulo || 'Video')}">
        </iframe>`
        : '';
    })
    .join('\n');

  const nextProjectLink = nextProyecto
    ? `<a href="/proyecto/${nextProyecto.slug || generateSlug(nextProyecto.titulo)}/" class="group">
      <div class="aspect-[1.45] bg-stone-100 rounded-lg overflow-hidden mb-3">
        <img src="${escapeHtml(nextProyecto.imagen_hero || imagenes[0]?.url || 'https://via.placeholder.com/400x300')}"
          alt="${escapeHtml(nextProyecto.titulo)}"
          class="w-full h-full object-cover transition-transform group-hover:scale-105">
      </div>
      <p class="text-sm font-medium text-stone-900">${escapeHtml(nextProyecto.titulo)}</p>
    </a>`
    : '';

  const prevProjectLink = prevProyecto
    ? `<a href="/proyecto/${prevProyecto.slug || generateSlug(prevProyecto.titulo)}/" class="group">
      <div class="aspect-[1.45] bg-stone-100 rounded-lg overflow-hidden mb-3">
        <img src="${escapeHtml(prevProyecto.imagen_hero || imagenes[0]?.url || 'https://via.placeholder.com/400x300')}"
          alt="${escapeHtml(prevProyecto.titulo)}"
          class="w-full h-full object-cover transition-transform group-hover:scale-105">
      </div>
      <p class="text-sm font-medium text-stone-900">${escapeHtml(prevProyecto.titulo)}</p>
    </a>`
    : '';

  // Get Tailwind and other stylesheets from main HTML
  const tailwindLink = '<script src="https://cdn.tailwindcss.com"></script>';
  const gsapScript = '<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js" defer></script>';

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(proyecto.titulo)} — Ritta Estudio</title>
  <meta name="description" content="${escapeHtml(proyecto.descripcion)}">
  <meta name="theme-color" content="#F4F0EC">

  <!-- Open Graph / Social Media -->
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://ritta-estudio-v2.vercel.app/proyecto/${slug}/">
  <meta property="og:title" content="${escapeHtml(proyecto.titulo)} — Ritta Estudio">
  <meta property="og:description" content="${escapeHtml(proyecto.descripcion)}">
  <meta property="og:image" content="${escapeHtml(mainImage)}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">

  <!-- Twitter Card -->
  <meta property="twitter:card" content="summary_large_image">
  <meta property="twitter:url" content="https://ritta-estudio-v2.vercel.app/proyecto/${slug}/">
  <meta property="twitter:title" content="${escapeHtml(proyecto.titulo)} — Ritta Estudio">
  <meta property="twitter:description" content="${escapeHtml(proyecto.descripcion)}">
  <meta property="twitter:image" content="${escapeHtml(mainImage)}">

  <!-- Canonical -->
  <link rel="canonical" href="https://ritta-estudio-v2.vercel.app/proyecto/${slug}/">

  <!-- Favicon -->
  <link rel="icon" type="image/x-icon" href="/favicon.ico">

  <!-- Tailwind & Other Styles -->
  ${tailwindLink}

  <style>
    :root {
      --bg: #F4F0EC;
      --ink: #0A0A0A;
      --white: #FFFFFF;
      --muted: rgba(10, 10, 10, 0.45);
      --border: rgba(10, 10, 10, 0.12);
      --radius-pill: 30px;
      --nav-h: 56px;
      --ease-out: cubic-bezier(0.25, 0.46, 0.45, 0.94);
    }

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      background-color: var(--bg);
      color: var(--ink);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.5;
    }

    .t-hero {
      font-size: clamp(46px, 9.5vw, 119px);
      font-weight: 800;
      letter-spacing: -0.045em;
      line-height: 1;
    }

    .t-section {
      font-size: clamp(30px, 4.5vw, 64px);
      font-weight: 700;
      letter-spacing: -0.02em;
      line-height: 1.2;
    }

    .t-label {
      font-size: 11px;
      font-weight: 500;
      letter-spacing: 0.12em;
      text-transform: uppercase;
    }

    .t-body {
      font-size: 13px;
      line-height: 1.75;
    }

    a {
      color: var(--ink);
      text-decoration: none;
    }

    /* Navigation */
    nav {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      height: var(--nav-h);
      background: var(--bg);
      border-bottom: 1px solid var(--border);
      display: flex;
      align-items: center;
      padding: 0 clamp(16px, 5vw, 48px);
      z-index: 100;
    }

    nav a {
      display: flex;
      align-items: center;
      gap: 12px;
      font-weight: 500;
      font-size: 13px;
    }

    nav a img {
      height: 24px;
      width: auto;
    }

    /* Breadcrumb */
    .breadcrumb {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      color: var(--muted);
      margin-bottom: 32px;
    }

    .breadcrumb a {
      color: var(--ink);
      transition: color 0.2s;
    }

    .breadcrumb a:hover {
      color: var(--muted);
    }

    /* Gallery */
    .gallery {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 16px;
      margin: 64px 0;
    }

    @media (max-width: 768px) {
      .gallery {
        grid-template-columns: 1fr;
      }
    }

    /* Meta Grid */
    .meta-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 32px;
      padding: 48px 0;
      border-top: 1px solid var(--border);
      border-bottom: 1px solid var(--border);
    }

    .meta-item .t-label {
      margin-bottom: 8px;
      color: var(--muted);
    }

    .meta-item p {
      font-size: 15px;
      font-weight: 500;
    }

    /* Navigation Projects */
    .nav-projects {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 48px;
      margin: 64px 0;
      padding: 48px 0;
      border-top: 1px solid var(--border);
    }

    .nav-projects a {
      transition: opacity 0.3s;
    }

    .nav-projects a:hover {
      opacity: 0.7;
    }

    /* Buttons */
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 12px 24px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 13px;
      transition: all 0.3s;
      border: 1px solid var(--border);
      background: var(--white);
      color: var(--ink);
    }

    .btn:hover {
      background: var(--ink);
      color: var(--white);
      border-color: var(--ink);
    }

    .btn-primary {
      background: var(--ink);
      color: var(--white);
      border-color: var(--ink);
    }

    .btn-primary:hover {
      background: var(--white);
      color: var(--ink);
    }

    /* Container */
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 clamp(16px, 5vw, 48px);
    }

    /* Hero Section */
    .hero {
      padding-top: calc(var(--nav-h) + 64px);
      padding-bottom: 64px;
    }

    .hero h1 {
      margin-bottom: 24px;
    }

    .hero-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 32px;
      font-size: 13px;
      color: var(--muted);
    }

    /* Description */
    .description {
      max-width: 800px;
      margin: 64px 0;
      font-size: 15px;
      line-height: 1.8;
    }

    .description p {
      margin-bottom: 16px;
    }
  </style>
</head>
<body>
  <!-- Navigation -->
  <nav>
    <a href="/" class="flex items-center gap-2">
      <img src="/logo.png" alt="Ritta Estudio" loading="eager">
    </a>
  </nav>

  <!-- Main Content -->
  <main class="container">
    <!-- Breadcrumb -->
    <div class="breadcrumb" style="padding-top: calc(var(--nav-h) + 32px);">
      <a href="/">Inicio</a>
      <span>/</span>
      <a href="/proyectos.html">Proyectos</a>
      <span>/</span>
      <span>${escapeHtml(proyecto.titulo)}</span>
    </div>

    <!-- Hero Section -->
    <section class="hero">
      <h1 class="t-hero">${escapeHtml(proyecto.titulo)}</h1>
      <div class="hero-meta">
        ${proyecto.cliente ? `<div><strong>Cliente:</strong> ${escapeHtml(proyecto.cliente)}</div>` : ''}
        ${proyecto.ubicacion ? `<div><strong>Ubicación:</strong> ${escapeHtml(proyecto.ubicacion)}</div>` : ''}
        ${proyecto.area ? `<div><strong>Área:</strong> ${proyecto.area} m²</div>` : ''}
        ${proyecto.año ? `<div><strong>Año:</strong> ${proyecto.año}</div>` : ''}
      </div>
    </section>

    <!-- Gallery -->
    ${imagenes.length > 0 ? `
      <section>
        <h2 class="t-section mb-8">Galería</h2>
        <div class="gallery">
          ${imagensList}
        </div>
      </section>
    ` : ''}

    <!-- Metadata -->
    <section class="meta-grid">
      ${proyecto.categoria ? `<div class="meta-item"><p class="t-label">Categoría</p><p>${escapeHtml(proyecto.categoria)}</p></div>` : ''}
      ${proyecto.estilo ? `<div class="meta-item"><p class="t-label">Estilo</p><p>${escapeHtml(proyecto.estilo)}</p></div>` : ''}
      ${proyecto.area ? `<div class="meta-item"><p class="t-label">Área</p><p>${proyecto.area} m²</p></div>` : ''}
      ${proyecto.año ? `<div class="meta-item"><p class="t-label">Año</p><p>${proyecto.año}</p></div>` : ''}
    </section>

    <!-- Description -->
    ${proyecto.descripcion_larga ? `
      <section class="description">
        <h2 class="t-section mb-6">Descripción</h2>
        ${proyecto.descripcion_larga.split('\n').map(p => `<p>${escapeHtml(p)}</p>`).join('')}
      </section>
    ` : ''}

    <!-- Videos -->
    ${videos.length > 0 ? `
      <section style="margin: 64px 0;">
        <h2 class="t-section mb-8">Videos</h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 32px;">
          ${videosList}
        </div>
      </section>
    ` : ''}

    <!-- Navigation to other projects -->
    ${nextProyecto || prevProyecto ? `
      <section class="nav-projects">
        ${prevProjectLink ? `<div><p class="t-label mb-4 text-stone-500">Proyecto anterior</p>${prevProjectLink}</div>` : ''}
        ${nextProjectLink ? `<div><p class="t-label mb-4 text-stone-500">Siguiente proyecto</p>${nextProjectLink}</div>` : ''}
      </section>
    ` : ''}

    <!-- CTA -->
    <section style="text-align: center; padding: 64px 0; border-top: 1px solid var(--border);">
      <h2 class="t-section mb-6">¿Inspirado?</h2>
      <p style="margin-bottom: 24px; color: var(--muted);">Descubrí más proyectos de Ritta Estudio</p>
      <a href="/proyectos.html" class="btn btn-primary">Ver todos los proyectos</a>
    </section>
  </main>

  <!-- Footer -->
  <footer style="background: var(--ink); color: var(--white); padding: 48px 0; text-align: center; margin-top: 64px;">
    <div class="container">
      <p style="margin-bottom: 8px;">© ${new Date().getFullYear()} Ritta Estudio. Todos los derechos reservados.</p>
      <p style="font-size: 12px; color: rgba(255,255,255,0.6);">Diseño y contenido</p>
    </div>
  </footer>

  <!-- GSAP for animations -->
  ${gsapScript}
</body>
</html>`;
}

// Main function
async function generatePages() {
  console.log('🚀 Iniciando generación de páginas de proyectos...');

  try {
    // Fetch all published projects
    const { data: proyectos, error: proyectosError } = await supabase
      .from('proyectos')
      .select('*')
      .eq('publicado', true)
      .order('orden', { ascending: true });

    if (proyectosError) {
      console.error('Detalles del error:', proyectosError);
      throw proyectosError;
    }
    if (!proyectos || proyectos.length === 0) {
      console.log('⚠️  No hay proyectos publicados para generar');
      return;
    }

    console.log(`📦 Encontrados ${proyectos.length} proyectos publicados`);

    // For each project, fetch images and videos
    for (const proyecto of proyectos) {
      const slug = proyecto.slug || generateSlug(proyecto.titulo);

      // Fetch images
      const { data: imagenes, error: imagenesError } = await supabase
        .from('proyecto_imagenes')
        .select('*')
        .eq('proyecto_id', proyecto.id)
        .order('orden', { ascending: true });

      if (imagenesError) throw imagenesError;

      // Fetch videos
      const { data: videos, error: videosError } = await supabase
        .from('proyecto_videos')
        .select('*')
        .eq('proyecto_id', proyecto.id)
        .order('orden', { ascending: true });

      if (videosError) throw videosError;

      // Generate HTML
      const html = generateProjectHTML(
        proyecto,
        imagenes || [],
        videos || [],
        proyectos
      );

      // Create directory and write file
      const projectDir = path.join(__dirname, '..', 'proyecto', slug);
      ensureDir(projectDir);
      const filePath = path.join(projectDir, 'index.html');

      fs.writeFileSync(filePath, html, 'utf-8');
      console.log(`✅ ${slug}/index.html`);
    }

    console.log(`\n✨ Generación completada: ${proyectos.length} páginas creadas`);
  } catch (error) {
    console.error('❌ Error durante generación:', error.message);
    process.exit(1);
  }
}

// Run
generatePages();
