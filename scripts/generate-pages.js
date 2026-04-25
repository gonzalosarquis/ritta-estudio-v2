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

// Slug generation
function generateSlug(titulo) {
  return titulo
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Extract YouTube video ID
function getYouTubeId(url) {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
  return match ? match[1] : null;
}

// Escape HTML
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

// Create directory
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Read proyectos.html template
function getProyectosTemplate() {
  const proyectosPath = path.join(__dirname, '../proyectos.html');
  if (!fs.existsSync(proyectosPath)) {
    throw new Error('proyectos.html no encontrado');
  }
  return fs.readFileSync(proyectosPath, 'utf-8');
}

// Generate project page HTML using proyectos.html as base
function generateProjectHTML(proyecto, imagenes, videos, todosLosProyectos) {
  const template = getProyectosTemplate();

  // Extract head section
  const headMatch = template.match(/<head>([\s\S]*?)<\/head>/);
  const headContent = headMatch ? headMatch[1] : '';

  // Extract header
  const headerMatch = template.match(/<header id="site-header"[\s\S]*?<\/header>/);
  const headerContent = headerMatch ? headerMatch[0] : '';

  // Extract footer
  const footerMatch = template.match(/<footer[\s\S]*?<\/footer>/);
  const footerContent = footerMatch ? footerMatch[0] : '';

  // Extract cursor and mobile menu
  const cursorMatch = template.match(/<div id="cursor"[\s\S]*?<div id="cursor-dot"[\s\S]*?<\/div>/);
  const cursorContent = cursorMatch ? cursorMatch[0] : '';

  // Extract mobile menu
  const mobileMenuMatch = template.match(/<div id="mobile-menu"[\s\S]*?(?=\n<!-- ════|<header)/);
  const mobileMenuContent = mobileMenuMatch ? mobileMenuMatch[0] : '';

  // Extract scripts from proyectos.html
  const scriptsMatch = template.match(/<script[\s\S]*?<\/script>/g) || [];
  let scripts = scriptsMatch.join('\n');

  // Remove the project modal and contact modal related code
  scripts = scripts.replace(/openProjectModal[\s\S]*?}\s*function/g, 'function');

  // Build image gallery HTML with lightbox
  const imagensList = imagenes
    .map((img, idx) => {
      return `<a href="${escapeHtml(img.url)}" class="glightbox w-full h-auto object-cover" data-gallery="project-gallery">
        <img src="${escapeHtml(img.url)}" alt="Proyecto ${escapeHtml(proyecto.titulo)} - imagen ${idx + 1}" loading="lazy" class="w-full h-auto object-cover rounded cursor-pointer hover:opacity-80 transition">
      </a>`;
    })
    .join('\n        ');

  // Build videos HTML
  const videosList = videos
    .map((video) => {
      const videoId = getYouTubeId(video.url_youtube);
      if (!videoId) return '';
      return `<div class="relative w-full" style="padding-bottom: 56.25%; height: 0;">
        <iframe style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe>
      </div>`;
    })
    .filter(v => v)
    .join('\n        ');

  // Find previous and next projects
  const currentIndex = todosLosProyectos.findIndex(p => p.id === proyecto.id);
  const prevProyecto = currentIndex > 0 ? todosLosProyectos[currentIndex - 1] : null;
  const nextProyecto = currentIndex < todosLosProyectos.length - 1 ? todosLosProyectos[currentIndex + 1] : null;

  let navLinks = '';
  if (prevProyecto) {
    const prevSlug = prevProyecto.slug || generateSlug(prevProyecto.titulo);
    navLinks += `<a href="/proyecto/${prevSlug}/" class="group block py-8 lg:py-12 border-b border-solid" style="border-color: var(--border);">
      <div class="flex items-center justify-between">
        <div>
          <p class="t-label opacity-40 mb-2">← Anterior</p>
          <h3 class="t-section">${escapeHtml(prevProyecto.titulo)}</h3>
        </div>
      </div>
    </a>`;
  }

  if (nextProyecto) {
    const nextSlug = nextProyecto.slug || generateSlug(nextProyecto.titulo);
    navLinks += `<a href="/proyecto/${nextSlug}/" class="group block py-8 lg:py-12 border-b border-solid" style="border-color: var(--border);">
      <div class="flex items-center justify-between">
        <div>
          <p class="t-label opacity-40 mb-2">Siguiente →</p>
          <h3 class="t-section">${escapeHtml(nextProyecto.titulo)}</h3>
        </div>
      </div>
    </a>`;
  }

  // Fix header links to be absolute
  let fixedHeader = headerContent
    .replace(/href="index\.html/g, 'href="/')
    .replace(/data-contact-open=""/g, '');

  // Generate the final HTML
  const html = `<!DOCTYPE html>
<html lang="es">
<head>
${headContent}
  <title>${escapeHtml(proyecto.titulo)} — Ritta Estudio</title>
  <meta name="description" content="${escapeHtml(proyecto.descripcion || proyecto.titulo)}">
  <meta property="og:title" content="${escapeHtml(proyecto.titulo)} — Ritta Estudio">
  <meta property="og:description" content="${escapeHtml(proyecto.descripcion || proyecto.titulo)}">
  <meta property="og:image" content="${escapeHtml(imagenes.length > 0 ? imagenes[0].url : 'https://ritta-estudio-v2.vercel.app/images/proyecto1.jpg')}">
  <meta property="og:url" content="https://ritta-estudio-v2.vercel.app/proyecto/${generateSlug(proyecto.titulo)}/">

  <!-- GLightbox CSS para lightbox de imágenes -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/glightbox/dist/css/glightbox.min.css">
</head>

<body>

${cursorContent}
${mobileMenuContent}
${fixedHeader}

<main style="max-width: 1200px; margin: 0 auto; padding-top: var(--nav-h);">

  <!-- Breadcrumb -->
  <nav class="site-pad py-8" style="padding: 32px clamp(16px,5vw,48px);">
    <div style="display: flex; gap: 8px; font-size: 13px; color: var(--muted); flex-wrap: wrap;">
      <a href="/" style="color: var(--ink);">Inicio</a>
      <span>/</span>
      <a href="/proyectos.html" style="color: var(--ink);">Proyectos</a>
      <span>/</span>
      <span>${escapeHtml(proyecto.titulo)}</span>
    </div>
  </nav>

  <!-- Hero Section with Project Info -->
  <section class="site-pad" style="padding: 0 clamp(16px,5vw,48px) 64px; border-bottom: 1px solid var(--border);">
    <div class="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-12">
      <div>
        <h1 class="t-hero mb-6">${escapeHtml(proyecto.titulo)}</h1>
        ${proyecto.descripcion ? `<p class="t-paragraph max-w-2xl">${escapeHtml(proyecto.descripcion)}</p>` : ''}
      </div>
    </div>

    <!-- Project Details Grid -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-8 py-8" style="border-top: 1px solid var(--border);">
      ${proyecto.cliente ? `<div><span class="t-label opacity-40">Cliente</span><p class="mt-2">${escapeHtml(proyecto.cliente)}</p></div>` : ''}
      ${proyecto.ubicacion ? `<div><span class="t-label opacity-40">Ubicación</span><p class="mt-2">${escapeHtml(proyecto.ubicacion)}</p></div>` : ''}
      ${proyecto.area ? `<div><span class="t-label opacity-40">Área</span><p class="mt-2">${proyecto.area} m²</p></div>` : ''}
      ${proyecto.año ? `<div><span class="t-label opacity-40">Año</span><p class="mt-2">${proyecto.año}</p></div>` : ''}
      ${proyecto.categoria ? `<div><span class="t-label opacity-40">Categoría</span><p class="mt-2">${escapeHtml(proyecto.categoria)}</p></div>` : ''}
      ${proyecto.estilo ? `<div><span class="t-label opacity-40">Estilo</span><p class="mt-2">${escapeHtml(proyecto.estilo)}</p></div>` : ''}
    </div>
  </section>

  <!-- Gallery -->
  ${imagenes.length > 0 ? `
  <section class="site-pad" style="padding: 64px clamp(16px,5vw,48px);">
    <h2 class="t-section mb-12">Galería</h2>
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 16px;">
      ${imagensList}
    </div>
  </section>
  ` : ''}

  <!-- Full Description -->
  ${proyecto.descripcion_larga ? `
  <section class="site-pad" style="padding: 0 clamp(16px,5vw,48px) 64px; border-top: 1px solid var(--border);">
    <div class="max-w-2xl py-12">
      <h2 class="t-section mb-8">Descripción</h2>
      <div class="space-y-4" style="line-height: 1.8;">
        ${proyecto.descripcion_larga.split('\\n').map(p => `<p>${escapeHtml(p)}</p>`).join('')}
      </div>
    </div>
  </section>
  ` : ''}

  <!-- Videos -->
  ${videos.length > 0 ? `
  <section class="site-pad" style="padding: 64px clamp(16px,5vw,48px); border-top: 1px solid var(--border);">
    <h2 class="t-section mb-12">Videos</h2>
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 32px;">
      ${videosList}
    </div>
  </section>
  ` : ''}

  <!-- Next/Previous Projects -->
  ${prevProyecto || nextProyecto ? `
  <section class="site-pad" style="padding: 64px clamp(16px,5vw,48px); border-top: 1px solid var(--border);">
    <h2 class="t-section mb-8">Más proyectos</h2>
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 32px;">
      ${navLinks}
    </div>
  </section>
  ` : ''}

  <!-- CTA Back to Projects -->
  <section class="site-pad" style="padding: 64px clamp(16px,5vw,48px); text-align: center; border-top: 1px solid var(--border);">
    <a href="/proyectos.html" class="btn btn-solid" style="display: inline-flex; background: var(--ink); color: var(--white); border: 1px solid var(--ink); border-radius: var(--radius-pill); padding: 11px 26px; text-decoration: none; font-size: 11px; font-weight: 500; letter-spacing: 0.11em; text-transform: uppercase;">
      Ver todos los proyectos
    </a>
  </section>

</main>

${footerContent}

<!-- GLightbox JS para lightbox de imágenes -->
<script src="https://cdn.jsdelivr.net/npm/glightbox/dist/js/glightbox.min.js"></script>
<script>
  const lightbox = GLightbox({
    selector: '.glightbox',
    touchNavigation: true,
    keyboardNavigation: true
  });
</script>

${scripts}

<script>
  // Fix year in footer
  document.getElementById('year').textContent = new Date().getFullYear();
</script>

</body>
</html>`;

  return html;
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
