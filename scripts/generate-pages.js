#!/usr/bin/env node

const fs   = require('fs');
const path = require('path');

require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL      = process.env.SUPABASE_URL || 'https://mefqkijoijoxqjledkib.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_ANON_KEY) {
  console.error('❌ Error: SUPABASE_ANON_KEY no está configurada');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ─── Helpers ─────────────────────────────────────────────────────────────────

function generateSlug(titulo) {
  return titulo
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function getYouTubeId(url) {
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
  return m ? m[1] : null;
}

function escapeHtml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

// ─── Template splitting ───────────────────────────────────────────────────────
// Strategy: take proyectos.html as-is and replace only the content section.
// We split on two reliable comment markers present in proyectos.html:
//
//   SPLIT_BEFORE  →  right before the §1 hero comment block
//   SPLIT_AFTER   →  right at <footer  (start of footer)
//
// Everything before SPLIT_BEFORE   = shell_top    (head + cursor + nav + header)
// Everything from   SPLIT_AFTER    = shell_bottom  (footer + scripts + JS)
// We inject the project content between the two.

const SPLIT_BEFORE = '<!-- ════════════════════════════════════════════\n     §1 · HERO';
const SPLIT_AFTER  = '<footer ';

function getShells() {
  const src = fs.readFileSync(
    path.join(__dirname, '../proyectos.html'), 'utf-8'
  );

  const beforeIdx = src.indexOf(SPLIT_BEFORE);
  const afterIdx  = src.indexOf(SPLIT_AFTER);

  if (beforeIdx === -1 || afterIdx === -1) {
    throw new Error('No se encontraron los marcadores en proyectos.html');
  }

  const top    = src.slice(0, beforeIdx);
  const bottom = src.slice(afterIdx);

  return { top, bottom };
}

// ─── Content builder ─────────────────────────────────────────────────────────

function buildProjectContent(proyecto, imagenes, videos, allProyectos) {
  const slug  = proyecto.slug || generateSlug(proyecto.titulo);
  const ogImg = imagenes[0]?.url || '';

  // Gallery: each image wrapped in a link so GLightbox can open it
  const galleryItems = imagenes.map((img, i) => `
        <a href="${escapeHtml(img.url)}"
           class="glightbox project-gallery__item"
           data-gallery="gallery-${escapeHtml(slug)}"
           data-description="${escapeHtml(proyecto.titulo)} — imagen ${i + 1}">
          <img src="${escapeHtml(img.url)}"
               alt="${escapeHtml(proyecto.titulo)} — imagen ${i + 1}"
               loading="${i === 0 ? 'eager' : 'lazy'}"
               class="project-gallery__img">
        </a>`).join('');

  // Videos — soporta YouTube Y archivos directos
  const videoItems = videos.map(v => {
    const url = v.url_youtube || '';
    const isYoutube = /youtube\.com|youtu\.be/.test(url);
    if (isYoutube) {
      const id = getYouTubeId(url);
      if (!id) return '';
      return `
        <div class="project-video__wrap">
          <iframe src="https://www.youtube.com/embed/${id}"
                  title="${escapeHtml(v.titulo || proyecto.titulo)}"
                  frameborder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowfullscreen
                  class="project-video__frame"></iframe>
        </div>`;
    } else {
      // Video subido directamente — respeta el aspecto natural (vertical, cuadrado, etc.)
      return `
        <div class="project-video__wrap project-video__wrap--native">
          <video src="${escapeHtml(url)}"
                 title="${escapeHtml(v.titulo || proyecto.titulo)}"
                 controls
                 playsinline
                 preload="metadata"
                 class="project-video__frame">
            Tu navegador no soporta la reproducción de video.
          </video>
        </div>`;
    }
  }).filter(Boolean).join('');

  // Prev / Next navigation
  const idx  = allProyectos.findIndex(p => p.id === proyecto.id);
  const prev = idx > 0 ? allProyectos[idx - 1] : null;
  const next = idx < allProyectos.length - 1 ? allProyectos[idx + 1] : null;

  const prevHtml = prev ? `
        <a href="/proyecto/${prev.slug || generateSlug(prev.titulo)}/" class="project-nav__link">
          ${prev._thumb ? `<div class="project-nav__thumb"><img src="${escapeHtml(prev._thumb)}" alt="${escapeHtml(prev.titulo)}" loading="lazy"></div>` : ''}
          <div class="project-nav__text">
            <span class="t-label opacity-40">← Anterior</span>
            <span class="project-nav__title">${escapeHtml(prev.titulo)}</span>
          </div>
        </a>` : '<div></div>';

  const nextHtml = next ? `
        <a href="/proyecto/${next.slug || generateSlug(next.titulo)}/" class="project-nav__link project-nav__link--right">
          ${next._thumb ? `<div class="project-nav__thumb"><img src="${escapeHtml(next._thumb)}" alt="${escapeHtml(next.titulo)}" loading="lazy"></div>` : ''}
          <div class="project-nav__text">
            <span class="t-label opacity-40">Siguiente →</span>
            <span class="project-nav__title">${escapeHtml(next.titulo)}</span>
          </div>
        </a>` : '<div></div>';

  // Meta tags replacements (injected right after <head>)
  const metaOverride = `
  <!-- ── Project page meta override ── -->
  <title>${escapeHtml(proyecto.titulo)} — Ritta Estudio</title>
  <meta name="description" content="${escapeHtml(proyecto.descripcion || '')}">
  <link rel="canonical" href="https://ritta-estudio-v2.vercel.app/proyecto/${escapeHtml(slug)}/">
  <meta property="og:title"       content="${escapeHtml(proyecto.titulo)} — Ritta Estudio">
  <meta property="og:description" content="${escapeHtml(proyecto.descripcion || '')}">
  <meta property="og:url"         content="https://ritta-estudio-v2.vercel.app/proyecto/${escapeHtml(slug)}/">
  ${ogImg ? `<meta property="og:image" content="${escapeHtml(ogImg)}">` : ''}
  <meta name="twitter:card"        content="summary_large_image">
  <meta name="twitter:title"       content="${escapeHtml(proyecto.titulo)} — Ritta Estudio">
  <meta name="twitter:description" content="${escapeHtml(proyecto.descripcion || '')}">
  ${ogImg ? `<meta name="twitter:image"       content="${escapeHtml(ogImg)}">` : ''}
  <!-- GLightbox -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/glightbox/dist/css/glightbox.min.css">
  <!-- Project page styles -->
  <style>
    /* ── Gallery ── */
    .project-gallery {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;
    }
    @media (max-width: 768px) { .project-gallery { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 480px) { .project-gallery { grid-template-columns: 1fr; } }

    .project-gallery__item {
      display: block;
      overflow: hidden;
      aspect-ratio: 1;
      border-radius: 2px;
    }
    .project-gallery__img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.5s var(--ease-out), opacity 0.3s;
      cursor: pointer;
    }
    .project-gallery__item:hover .project-gallery__img {
      transform: scale(1.04);
      opacity: 0.9;
    }

    /* ── Hero image (first) ── */
    .project-hero-img {
      width: 100%;
      aspect-ratio: 16/7;
      object-fit: cover;
      display: block;
      border-radius: 2px;
    }

    /* ── Meta grid ── */
    .project-meta {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
      gap: 24px 32px;
      padding: 40px 0;
      border-top: 1px solid var(--border);
      border-bottom: 1px solid var(--border);
      margin: 48px 0;
    }
    .project-meta__label {
      font-size: 11px;
      font-weight: 500;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--muted);
      margin-bottom: 6px;
    }
    .project-meta__value {
      font-size: 14px;
      font-weight: 500;
    }

    /* ── Description ── */
    .project-desc p { margin-bottom: 1.2em; }
    .project-desc p:last-child { margin-bottom: 0; }

    /* ── Videos ── */
    /* YouTube: ratio 16:9 fijo, se expande en flex */
    .project-video__wrap {
      position: relative;
      padding-bottom: 56.25%;
      height: 0;
      overflow: hidden;
      border-radius: 4px;
      flex: 1 1 400px;
    }
    .project-video__frame {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
    }
    /* Videos subidos directo: tamaño natural, ancho limitado */
    .project-video__wrap--native {
      position: relative;
      padding-bottom: 0;
      height: auto;
      width: 100%;
      max-width: 260px;
      border-radius: 4px;
      overflow: hidden;
      flex-shrink: 0;
    }
    .project-video__wrap--native .project-video__frame {
      position: static;
      width: 100%;
      height: auto;
      display: block;
      max-height: 65vh;
    }

    /* ── Prev/Next navigation ── */
    .project-nav {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1px;
      background: var(--border);
      border-top: 1px solid var(--border);
      border-bottom: 1px solid var(--border);
    }
    .project-nav__link {
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: 20px;
      padding: 28px 32px;
      background: var(--bg);
      text-decoration: none;
      color: var(--ink);
      transition: background 0.2s;
    }
    .project-nav__link:hover { background: rgba(10,10,10,0.04); }
    .project-nav__link--right {
      flex-direction: row-reverse;
      text-align: right;
    }
    .project-nav__thumb {
      flex-shrink: 0;
      width: 80px;
      height: 60px;
      overflow: hidden;
      border-radius: 2px;
      background: var(--border);
    }
    .project-nav__thumb img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
      transition: transform 0.4s var(--ease-out);
    }
    .project-nav__link:hover .project-nav__thumb img { transform: scale(1.06); }
    .project-nav__text {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .project-nav__link--right .project-nav__text {
      align-items: flex-end;
    }
    .project-nav__title {
      font-size: clamp(15px, 2vw, 22px);
      font-weight: 500;
      letter-spacing: -0.02em;
      text-transform: uppercase;
    }
    @media (max-width: 600px) {
      .project-nav { grid-template-columns: 1fr; }
      .project-nav__thumb { width: 60px; height: 46px; }
    }

    /* ── Breadcrumb ── */
    .project-breadcrumb {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;
      color: var(--muted);
      padding: 20px 0 0;
    }
    .project-breadcrumb a {
      color: var(--muted);
      text-decoration: none;
      transition: color 0.2s;
    }
    .project-breadcrumb a:hover { color: var(--ink); }
    .project-breadcrumb__sep { opacity: 0.4; }
    .project-breadcrumb__current { color: var(--ink); }
  </style>`;

  return {
    metaOverride,
    content: `

<!-- ════════════════════════════════════════════
     PÁGINA DE PROYECTO: ${escapeHtml(proyecto.titulo)}
════════════════════════════════════════════ -->
<div style="padding-top: var(--nav-h);">
  <div class="max-w-site mx-auto site-pad" style="padding-bottom: 80px;">

    <!-- Breadcrumb -->
    <nav class="project-breadcrumb" aria-label="Breadcrumb">
      <a href="/">Inicio</a>
      <span class="project-breadcrumb__sep">/</span>
      <a href="/proyectos.html">Proyectos</a>
      <span class="project-breadcrumb__sep">/</span>
      <span class="project-breadcrumb__current">${escapeHtml(proyecto.titulo)}</span>
    </nav>

    <!-- Title + Meta -->
    <div style="padding: 48px 0 40px;">
      ${proyecto.categoria ? `<span class="t-badge reveal">${escapeHtml(proyecto.categoria)}</span>` : ''}
      <h1 class="t-hero reveal" style="margin-top: 16px;">${escapeHtml(proyecto.titulo)}</h1>
      ${proyecto.descripcion ? `<p class="t-paragraph reveal" style="margin-top: 24px; max-width: 560px;">${escapeHtml(proyecto.descripcion)}</p>` : ''}
    </div>

    <!-- Hero image (first) -->
    ${imagenes.length > 0 ? `
    <a href="${escapeHtml(imagenes[0].url)}"
       class="glightbox reveal"
       data-gallery="gallery-${escapeHtml(slug)}"
       style="display:block; margin-bottom: 8px;">
      <img src="${escapeHtml(imagenes[0].url)}"
           alt="${escapeHtml(proyecto.titulo)}"
           loading="eager"
           class="project-hero-img">
    </a>` : ''}

    <!-- Project metadata -->
    <div class="project-meta reveal">
      ${proyecto.cliente  ? `<div><p class="project-meta__label">Cliente</p><p class="project-meta__value">${escapeHtml(proyecto.cliente)}</p></div>` : ''}
      ${proyecto.ubicacion ? `<div><p class="project-meta__label">Ubicación</p><p class="project-meta__value">${escapeHtml(proyecto.ubicacion)}</p></div>` : ''}
      ${proyecto.area     ? `<div><p class="project-meta__label">Área</p><p class="project-meta__value">${proyecto.area} m²</p></div>` : ''}
      ${proyecto.año      ? `<div><p class="project-meta__label">Año</p><p class="project-meta__value">${proyecto.año}</p></div>` : ''}
      ${proyecto.estilo   ? `<div><p class="project-meta__label">Estilo</p><p class="project-meta__value">${escapeHtml(proyecto.estilo)}</p></div>` : ''}
    </div>

    <!-- Gallery grid (remaining images) -->
    ${imagenes.length > 1 ? `
    <section style="margin-bottom: 64px;">
      <h2 class="t-section reveal" style="margin-bottom: 24px;">Galería</h2>
      <div class="project-gallery">
        ${galleryItems}
      </div>
    </section>` : ''}

    <!-- Full description -->
    ${proyecto.descripcion_larga ? `
    <section style="margin-bottom: 64px; max-width: 680px;">
      <h2 class="t-section reveal" style="margin-bottom: 24px;">Sobre el proyecto</h2>
      <div class="project-desc t-paragraph reveal" style="opacity: 0.75; line-height: 1.8;">
        ${proyecto.descripcion_larga.split('\n').filter(Boolean).map(p => `<p>${escapeHtml(p)}</p>`).join('')}
      </div>
    </section>` : ''}

    <!-- Videos -->
    ${videos.length > 0 ? `
    <section style="margin-bottom: 64px;">
      <h2 class="t-section reveal" style="margin-bottom: 24px;">Videos</h2>
      <div style="display: flex; flex-wrap: wrap; gap: 24px; align-items: flex-start;">
        ${videoItems}
      </div>
    </section>` : ''}

  </div><!-- /max-w-site -->
</div>

<!-- Prev / Next navigation -->
<div class="project-nav">
  ${prevHtml}
  ${nextHtml}
</div>

<!-- Back to projects -->
<div style="text-align:center; padding: 64px clamp(16px,5vw,48px);">
  <a href="/proyectos.html" class="btn btn-solid">
    <span class="btn-inner">
      <span><span class="btn-dot" aria-hidden="true"></span> Ver todos los proyectos</span>
      <span class="btn-inner-clone" aria-hidden="true">
        <span><span class="btn-dot" aria-hidden="true"></span> Ver todos los proyectos</span>
      </span>
    </span>
  </a>
</div>

`
  };
}

// ─── Page assembler ───────────────────────────────────────────────────────────

function assemblePage(proyecto, imagenes, videos, allProyectos) {
  let { top, bottom } = getShells();
  const { metaOverride, content } = buildProjectContent(proyecto, imagenes, videos, allProyectos);

  // Fix all relative links in shell (index.html#... → /)
  top    = top.replace(/href="index\.html(#[^"]*)"/g, 'href="/$1"');
  bottom = bottom.replace(/href="index\.html(#[^"]*)"/g, 'href="/$1"');

  // Fix logo and image paths in header
  top = top.replace(/src="images\//g, 'src="/images/');

  // Inject meta overrides right after opening <head>
  top = top.replace('<head>', '<head>\n' + metaOverride);

  // Inject GLightbox before </body>
  const glightboxScript = `
<!-- GLightbox init -->
<script src="https://cdn.jsdelivr.net/npm/glightbox/dist/js/glightbox.min.js"></script>
<script>
  document.addEventListener('DOMContentLoaded', function () {
    GLightbox({ selector: '.glightbox', touchNavigation: true });
  });
</script>`;

  bottom = bottom.replace('</body>', glightboxScript + '\n</body>');

  return top + content + bottom;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function generatePages() {
  console.log('🚀 Generando páginas de proyectos...');

  const { data: proyectos, error } = await supabase
    .from('proyectos')
    .select('*')
    .eq('publicado', true)
    .order('orden', { ascending: true });

  if (error) { console.error('❌', error.message); process.exit(1); }
  if (!proyectos?.length) { console.log('⚠️  Sin proyectos publicados'); return; }

  console.log(`📦 ${proyectos.length} proyectos encontrados`);

  // Pre-fetch first image of every project for nav thumbnails
  const { data: allNavImages } = await supabase
    .from('proyecto_imagenes')
    .select('proyecto_id, url')
    .order('orden', { ascending: true });

  const firstImageMap = {};
  for (const img of allNavImages || []) {
    if (!firstImageMap[img.proyecto_id]) firstImageMap[img.proyecto_id] = img.url;
  }

  // Attach _thumb to each project (used in prev/next nav)
  const proyectosWithThumbs = proyectos.map(p => ({
    ...p,
    _thumb: firstImageMap[p.id] || p.imagen_hero || null
  }));

  for (const proyecto of proyectosWithThumbs) {
    const slug = proyecto.slug || generateSlug(proyecto.titulo);

    const [{ data: imagenes }, { data: videos }] = await Promise.all([
      supabase.from('proyecto_imagenes').select('*').eq('proyecto_id', proyecto.id).order('orden'),
      supabase.from('proyecto_videos').select('*').eq('proyecto_id', proyecto.id).order('orden'),
    ]);

    const html = assemblePage(proyecto, imagenes || [], videos || [], proyectosWithThumbs);

    ensureDir(path.join(__dirname, '../proyecto', slug));
    fs.writeFileSync(path.join(__dirname, '../proyecto', slug, 'index.html'), html, 'utf-8');
    console.log(`  ✅ /proyecto/${slug}/`);
  }

  console.log('\n✨ Listo!');
}

generatePages().catch(e => { console.error('❌', e.message); process.exit(1); });
