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

// Extract CSS from proyectos.html
function extractCSSFromProyectos() {
  const proyectosPath = path.join(__dirname, '../proyectos.html');
  if (!fs.existsSync(proyectosPath)) {
    console.warn('⚠️  proyectos.html no encontrado, usando CSS básico');
    return '';
  }

  const content = fs.readFileSync(proyectosPath, 'utf-8');
  const styleMatch = content.match(/<style>([\s\S]*?)<\/style>/);
  return styleMatch ? styleMatch[1] : '';
}

// Extract head section from proyectos.html
function extractHeadFromProyectos() {
  const proyectosPath = path.join(__dirname, '../proyectos.html');
  if (!fs.existsSync(proyectosPath)) return '';

  const content = fs.readFileSync(proyectosPath, 'utf-8');

  // Extract everything from <head> to </head>
  const headMatch = content.match(/<head>([\s\S]*?)<\/head>/);
  if (!headMatch) return '';

  const headContent = headMatch[1];

  // Extract only fonts and scripts, excluding style tag
  const fontMatch = headContent.match(/<link[^>]*fonts\.googleapis[^>]*>/);
  const tailwindMatch = headContent.match(/<script[^>]*tailwindcss[^>]*><\/script>/);
  const gsapMatch = headContent.match(/<script[^>]*gsap\.min\.js[^>]*><\/script>/);
  const scrollTriggerMatch = headContent.match(/<script[^>]*ScrollTrigger\.min\.js[^>]*><\/script>/);

  let headExtras = '';
  if (fontMatch) headExtras += fontMatch[0] + '\n  ';
  if (tailwindMatch) headExtras += tailwindMatch[0] + '\n  ';
  if (gsapMatch) headExtras += gsapMatch[0] + '\n  ';
  if (scrollTriggerMatch) headExtras += scrollTriggerMatch[0] + '\n  ';

  return headExtras;
}

// Generate a simple, functional header
function generateHeaderForProject() {
  return `<header id="site-header" role="banner">
  <div class="max-w-site mx-auto h-full site-pad flex items-center justify-between" style="padding: 0 clamp(16px,5vw,48px); display: flex; align-items: center; justify-content: space-between; height: var(--nav-h);">

    <a href="/" class="flex-shrink-0" aria-label="Ritta Estudio — Inicio">
      <img src="/images/logo.png" alt="Ritta Estudio Logo" class="h-4 sm:h-5 md:h-[20px] w-auto block" style="height: 20px; width: auto;">
    </a>

    <nav class="hidden md:flex items-center gap-8" aria-label="Navegación principal" style="display: none;">
      <a href="/" class="nav-link">Inicio</a>
      <a href="/proyectos.html" class="nav-link active">Proyectos</a>
      <a href="/" class="nav-link">Servicios</a>
      <a href="/" class="nav-link">Contacto</a>
    </nav>

    <div class="flex items-center gap-5">
      <a href="/proyectos.html" class="btn btn-outline hidden sm:inline-flex" style="display: inline-flex; border: 1px solid var(--ink); border-radius: var(--radius-pill); padding: 11px 26px; background: transparent; color: var(--ink); text-decoration: none; font-size: 11px; font-weight: 500; letter-spacing: 0.11em; text-transform: uppercase;">
        Proyectos
      </a>
      <button id="hamburger" aria-label="Abrir menú" aria-expanded="false" aria-controls="mobile-menu" class="md:hidden flex flex-col gap-[5px] p-2 bg-transparent border-none cursor-pointer" style="display: none;">
        <span class="hb-line" style="display: block; width: 22px; height: 1.5px; background: var(--ink); border-radius: 2px;"></span>
        <span class="hb-line" style="display: block; width: 22px; height: 1.5px; background: var(--ink); border-radius: 2px;"></span>
        <span class="hb-line" style="display: block; width: 22px; height: 1.5px; background: var(--ink); border-radius: 2px;"></span>
      </button>
    </div>

  </div>
</header>`;
}

// Extract cursor HTML from proyectos.html
function extractCursorFromProyectos() {
  const proyectosPath = path.join(__dirname, '../proyectos.html');
  if (!fs.existsSync(proyectosPath)) return '';

  const content = fs.readFileSync(proyectosPath, 'utf-8');

  // Extract cursor divs and mobile menu
  const cursorMatch = content.match(/<div id="cursor"[\s\S]*?<\/div>\s*<div id="cursor-dot"[\s\S]*?<\/div>/);
  const mobileMenuMatch = content.match(/<div id="mobile-menu"[\s\S]*?<\/div>/);

  let result = '';
  if (cursorMatch) result += cursorMatch[0] + '\n\n';
  if (mobileMenuMatch) result += mobileMenuMatch[0] + '\n\n';

  return result;
}

// Generate project page HTML
function generateProjectHTML(proyecto, imagenes, videos, todosLosProyectos) {
  const css = extractCSSFromProyectos();
  const headExtras = extractHeadFromProyectos();
  const header = generateHeaderForProject();
  const cursorHtml = extractCursorFromProyectos();

  // Build image gallery HTML
  const imagensList = imagenes
    .map((img, idx) => {
      return `<img src="${escapeHtml(img.url)}" alt="Proyecto ${escapeHtml(proyecto.titulo)} - imagen ${idx + 1}" loading="lazy" class="w-full h-auto object-cover rounded">`;
    })
    .join('\n        ');

  // Build videos HTML
  const videosList = videos
    .map((video) => {
      const videoId = getYouTubeId(video.url_youtube);
      if (!videoId) return '';
      return `<iframe width="100%" height="400" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe>`;
    })
    .filter(v => v)
    .join('\n        ');

  // Find previous and next projects
  const currentIndex = todosLosProyectos.findIndex(p => p.id === proyecto.id);
  const prevProyecto = currentIndex > 0 ? todosLosProyectos[currentIndex - 1] : null;
  const nextProyecto = currentIndex < todosLosProyectos.length - 1 ? todosLosProyectos[currentIndex + 1] : null;

  let prevProjectLink = '';
  let nextProjectLink = '';

  if (prevProyecto) {
    const prevSlug = prevProyecto.slug || generateSlug(prevProyecto.titulo);
    const prevImage = `https://ritta-estudio-v2.vercel.app/images/proyecto1.jpg`; // Placeholder
    prevProjectLink = `
      <a href="/proyecto/${prevSlug}/" class="flex flex-col gap-3 p-4 border border-[var(--border)] rounded hover:bg-[var(--muted)] hover:bg-opacity-10 transition">
        <h3 class="t-section">${escapeHtml(prevProyecto.titulo)}</h3>
        <p class="t-paragraph">${escapeHtml(prevProyecto.descripcion || '')}</p>
      </a>`;
  }

  if (nextProyecto) {
    const nextSlug = nextProyecto.slug || generateSlug(nextProyecto.titulo);
    const nextImage = `https://ritta-estudio-v2.vercel.app/images/proyecto1.jpg`; // Placeholder
    nextProjectLink = `
      <a href="/proyecto/${nextSlug}/" class="flex flex-col gap-3 p-4 border border-[var(--border)] rounded hover:bg-[var(--muted)] hover:bg-opacity-10 transition">
        <h3 class="t-section">${escapeHtml(nextProyecto.titulo)}</h3>
        <p class="t-paragraph">${escapeHtml(nextProyecto.descripcion || '')}</p>
      </a>`;
  }

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="${escapeHtml(proyecto.descripcion || proyecto.titulo)}">
  <meta name="keywords" content="diseño de interiores, ${escapeHtml(proyecto.categoria || '')}, ${escapeHtml(proyecto.ubicacion || '')}">
  <title>${escapeHtml(proyecto.titulo)} — Ritta Estudio</title>
  <meta name="author" content="Ritta Estudio">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="https://ritta-estudio-v2.vercel.app/proyecto/${generateSlug(proyecto.titulo)}/">

  <!-- Open Graph / Social Media -->
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://ritta-estudio-v2.vercel.app/proyecto/${generateSlug(proyecto.titulo)}/">
  <meta property="og:title" content="${escapeHtml(proyecto.titulo)} — Ritta Estudio">
  <meta property="og:description" content="${escapeHtml(proyecto.descripcion || proyecto.titulo)}">
  <meta property="og:image" content="${escapeHtml(imagenes.length > 0 ? imagenes[0].url : 'https://ritta-estudio-v2.vercel.app/images/proyecto1.jpg')}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">

  <!-- Twitter Card -->
  <meta property="twitter:card" content="summary_large_image">
  <meta property="twitter:url" content="https://ritta-estudio-v2.vercel.app/proyecto/${generateSlug(proyecto.titulo)}/">
  <meta property="twitter:title" content="${escapeHtml(proyecto.titulo)} — Ritta Estudio">
  <meta property="twitter:description" content="${escapeHtml(proyecto.descripcion || proyecto.titulo)}">
  <meta property="twitter:image" content="${escapeHtml(imagenes.length > 0 ? imagenes[0].url : 'https://ritta-estudio-v2.vercel.app/images/proyecto1.jpg')}">

  <!-- Favicon -->
  <link rel="icon" type="image/x-icon" href="/favicon.ico">

  <!-- Fonts & Libraries from proyectos.html -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="">
  <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            cream: '#F4F0EC',
            ink:   '#0A0A0A',
            muted: '#6B6560',
          },
          fontFamily: { sans: ['Manrope', 'Arial', 'sans-serif'] },
          maxWidth:   { site: '1200px' },
        }
      }
    }
  </script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js" defer=""></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js" defer=""></script>

  <style>
${css}
  </style>
</head>

<body>

<!-- Custom cursor and mobile menu -->
${cursorHtml}

<!-- Header -->
${header}

<main style="padding-top: var(--nav-h); max-width: 1200px; margin: 0 auto;">

  <!-- Breadcrumb -->
  <div style="display: flex; gap: 8px; font-size: 13px; color: var(--muted); margin: 32px clamp(16px,5vw,48px); flex-wrap: wrap;">
    <a href="/" style="color: var(--ink);">Inicio</a>
    <span>/</span>
    <a href="/proyectos.html" style="color: var(--ink);">Proyectos</a>
    <span>/</span>
    <span>${escapeHtml(proyecto.titulo)}</span>
  </div>

  <!-- Hero Section -->
  <section style="padding: 0 clamp(16px,5vw,48px) 64px;">
    <h1 class="t-hero" style="margin-bottom: 24px;">${escapeHtml(proyecto.titulo)}</h1>
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 16px; font-size: 13px; margin-bottom: 32px;">
      ${proyecto.cliente ? `<div><span style="color: var(--muted);">Cliente</span><br><strong>${escapeHtml(proyecto.cliente)}</strong></div>` : ''}
      ${proyecto.ubicacion ? `<div><span style="color: var(--muted);">Ubicación</span><br><strong>${escapeHtml(proyecto.ubicacion)}</strong></div>` : ''}
      ${proyecto.area ? `<div><span style="color: var(--muted);">Área</span><br><strong>${proyecto.area} m²</strong></div>` : ''}
      ${proyecto.año ? `<div><span style="color: var(--muted);">Año</span><br><strong>${proyecto.año}</strong></div>` : ''}
    </div>
  </section>

  <!-- Gallery -->
  ${imagenes.length > 0 ? `
  <section style="padding: 0 clamp(16px,5vw,48px) 64px;">
    <h2 class="t-section" style="margin-bottom: 32px;">Galería</h2>
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 16px;">
      ${imagensList}
    </div>
  </section>
  ` : ''}

  <!-- Metadata -->
  <section style="padding: 0 clamp(16px,5vw,48px) 64px; display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 32px;">
    ${proyecto.categoria ? `<div><span class="t-label" style="color: var(--muted);">Categoría</span><p>${escapeHtml(proyecto.categoria)}</p></div>` : ''}
    ${proyecto.estilo ? `<div><span class="t-label" style="color: var(--muted);">Estilo</span><p>${escapeHtml(proyecto.estilo)}</p></div>` : ''}
    ${proyecto.area ? `<div><span class="t-label" style="color: var(--muted);">Área</span><p>${proyecto.area} m²</p></div>` : ''}
    ${proyecto.año ? `<div><span class="t-label" style="color: var(--muted);">Año</span><p>${proyecto.año}</p></div>` : ''}
  </section>

  <!-- Description -->
  ${proyecto.descripcion_larga ? `
  <section style="padding: 0 clamp(16px,5vw,48px) 64px; max-width: 600px;">
    <h2 class="t-section" style="margin-bottom: 24px;">Descripción</h2>
    <div style="line-height: 1.8; color: var(--muted);">
      ${proyecto.descripcion_larga.split('\\n').map(p => `<p style="margin-bottom: 16px;">${escapeHtml(p)}</p>`).join('')}
    </div>
  </section>
  ` : ''}

  <!-- Videos -->
  ${videos.length > 0 ? `
  <section style="padding: 0 clamp(16px,5vw,48px) 64px;">
    <h2 class="t-section" style="margin-bottom: 32px;">Videos</h2>
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 32px;">
      ${videosList}
    </div>
  </section>
  ` : ''}

  <!-- Project Navigation -->
  ${prevProyecto || nextProyecto ? `
  <section style="padding: 0 clamp(16px,5vw,48px) 64px; display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 24px; margin: 64px 0;">
    ${prevProyecto ? `<div><span class="t-label" style="color: var(--muted);">Proyecto anterior</span>${prevProjectLink}</div>` : ''}
    ${nextProyecto ? `<div><span class="t-label" style="color: var(--muted);">Siguiente proyecto</span>${nextProjectLink}</div>` : ''}
  </section>
  ` : ''}

  <!-- CTA -->
  <section style="text-align: center; padding: 64px clamp(16px,5vw,48px); border-top: 1px solid var(--border); margin-top: 64px;">
    <h2 class="t-section" style="margin-bottom: 16px;">¿Inspirado?</h2>
    <p style="margin-bottom: 24px; color: var(--muted);">Descubrí más proyectos de Ritta Estudio</p>
    <a href="/proyectos.html" class="btn btn-outline" style="display: inline-flex; padding: 11px 26px;">
      <span>Ver todos los proyectos</span>
    </a>
  </section>

</main>

<!-- Footer -->
<footer style="background: var(--ink); color: var(--white); padding: 48px 0; text-align: center; margin-top: 64px;">
  <div style="max-width: 1200px; margin: 0 auto; padding: 0 clamp(16px,5vw,48px);">
    <p style="margin-bottom: 8px;">© ${new Date().getFullYear()} Ritta Estudio. Todos los derechos reservados.</p>
    <p style="font-size: 12px; color: rgba(255,255,255,0.6);">Diseño y contenido</p>
  </div>
</footer>

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

      // Create directory
      const proyectoDir = path.join(__dirname, '../proyecto', slug);
      ensureDir(proyectoDir);

      // Write file
      const filePath = path.join(proyectoDir, 'index.html');
      fs.writeFileSync(filePath, html, 'utf-8');
      console.log(`✅ ${slug}/index.html`);
    }

    console.log(`\n✨ Generación completada: ${proyectos.length} páginas creadas`);
  } catch (error) {
    console.error('❌ Error durante generación:', error.message);
    process.exit(1);
  }
}

generatePages();
