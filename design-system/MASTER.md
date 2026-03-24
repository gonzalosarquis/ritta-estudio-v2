# RITTA ESTUDIO — Design System

> Sistema de diseño completo. Referencia este archivo antes de construir
> cualquier página o componente nuevo.

---

## 1. Paleta de colores

| Token        | Valor              | Uso                                      |
|--------------|--------------------|------------------------------------------|
| `--bg`       | `#F4F0EC`          | Fondo principal (beige cálido)           |
| `--ink`      | `#0A0A0A`          | Texto, bordes, íconos, botones           |
| `--white`    | `#FFFFFF`          | Fondo inverso, texto sobre oscuro        |
| `--muted`    | `rgba(10,10,10,.45)`| Placeholders, texto secundario          |
| `--border`   | `rgba(10,10,10,.12)`| Líneas divisorias, bordes de tarjetas   |

**Reglas:**
- No usar colores de acento. La paleta es deliberadamente binaria (beige + negro).
- Las opacidades del ink (`opacity-35`, `opacity-40`, `opacity-55`) crean la jerarquía.
- Nunca usar hex directamente en componentes — siempre vía CSS variables.

---

## 2. Tipografía

**Fuente única:** Manrope — `font-family: 'Manrope', Arial, sans-serif`

```
Google Fonts CDN:
https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700;800&display=swap
```

### Escala tipográfica

| Clase       | Tamaño                        | Peso | Tracking      | Transform  | Uso                     |
|-------------|-------------------------------|------|---------------|------------|-------------------------|
| `.t-hero`   | `clamp(46px, 9.5vw, 119px)`  | 800  | `-0.045em`    | uppercase  | H1 de hero              |
| `.t-section`| `clamp(30px, 4.5vw, 64px)`   | 700  | `-0.035em`    | uppercase  | H2 de sección           |
| `.t-label`  | `11px`                        | 500  | `+0.12em`     | uppercase  | Etiquetas, botones, nav |
| `.t-body`   | `13px`                        | 400  | `+0.02em`     | —          | Párrafos y texto general|

**Reglas:**
- Los H1/H2 siempre en **mayúsculas** con letter-spacing negativo.
- Texto de cuerpo a `13px` con `line-height: 1.75`.
- Nunca usar tamaño de cuerpo menor a 12px (accesibilidad).
- Usar opacidad del ink para jerarquía secundaria, no cambiar el color.

---

## 3. Espaciado

Sistema basado en múltiplos de 4/8px.

| Escala   | Valor  | Uso típico                      |
|----------|--------|---------------------------------|
| Micro    | 4px    | Gap entre ícono y texto         |
| XS       | 8px    | Padding interno de chips/tags   |
| S        | 12px   | Gap entre elementos relacionados|
| M        | 24px   | Padding horizontal contenedor   |
| L        | 48px   | Padding desktop (site-pad)      |
| XL       | 80px   | Espaciado entre secciones       |
| 2XL      | 120px  | `py-24 lg:py-36` secciones main |

**Padding de contenedor:** clase `.site-pad`
- Mobile: `px-6` (24px)
- Desktop lg+: `px-12` (48px)
- Desktop xl+: vuelve a `px-6` (max-width limita)

**Ancho máximo de contenido:** `max-w-site = 1200px`

---

## 4. Componentes

### Botones

Dos variantes que se invierten al hover:

```html
<!-- Borde con fondo transparente → fondo negro al hover -->
<a href="#" class="btn btn-outline">Texto</a>

<!-- Fondo negro → borde transparente al hover -->
<a href="#" class="btn btn-solid">Texto</a>
```

Propiedades fijas:
- `border-radius: 30px` (pill)
- `padding: 11px 26px`
- `font-size: 11px`, `letter-spacing: 0.11em`, `text-transform: uppercase`
- Transición: `0.22s ease`

### Nav links

```html
<a href="#" class="nav-link">Texto</a>
```

Underline que crece desde la izquierda al hover (`width: 0 → 100%`, 0.28s).

### Tarjetas de proyecto

```html
<article class="project-card" tabindex="0">
  <div class="card-img img-ph"></div>  <!-- o <img> real -->
  <div class="card-overlay">
    <div class="w-full flex items-end justify-between">
      <div class="card-meta"> ... </div>
      <button class="btn card-cta" style="color:white;border-color:rgba(255,255,255,.55)">Ver</button>
    </div>
  </div>
</article>
```

Al hover: overlay oscuro se activa, imagen hace scale(1.04), metadata y CTA aparecen.

### Filas de servicio

```html
<div class="service-row">
  <div>
    <div class="t-label opacity-35">01</div>
    <div class="font-semibold text-[15px] uppercase tracking-tight">Nombre servicio</div>
  </div>
  <svg> ... flecha → ... </svg>
</div>
```

Al hover: padding-left aumenta 6px (slide suave), flecha aparece.

### Placeholders de imagen

Reemplazar con imágenes reales. Variantes de tono:

```html
<div class="img-ph"></div>           <!-- beige medio -->
<div class="img-ph img-ph-alt"></div><!-- beige oscuro -->
<div class="img-ph img-ph-dark"></div><!-- gris cálido -->
```

Para reemplazar con imagen real:
```html
<img src="tu-foto.jpg" alt="Descripción" class="w-full h-full object-cover">
```

---

## 5. Animaciones

### Reveal on scroll (Intersection Observer)

Agregar `.reveal` a cualquier elemento para que aparezca al entrar al viewport.
Usar `.reveal-d1` a `.reveal-d4` para escalonar elementos en secuencia.

```html
<h2 class="t-section reveal">TÍTULO</h2>
<p class="t-body reveal reveal-d1">Subtítulo que aparece 80ms después</p>
<a class="btn reveal reveal-d2">CTA que aparece 170ms después</a>
```

Propiedades:
- Entrada: `opacity 0→1 + translateY 28→0px`
- Duración: `0.65s`
- Easing: `cubic-bezier(0.25, 0.46, 0.45, 0.94)` (ease-out)
- Threshold: `10%` visible + `48px` margin inferior

### Header scroll

- **Scroll down > 80px:** `transform: translateY(-100%)` — se esconde
- **Scroll up:** regresa — `transform: translateY(0)`
- Duración: `0.38s`

### Hover en botones

Inversión de colores (background ↔ transparent), `0.22s ease`.

### Hover en tarjetas de proyecto

Overlay: `background rgba(10,10,10,0 → 0.52)`, `0.35s`
Imagen: `scale(1.0 → 1.04)`, `0.6s ease-out`
Metadata: `opacity 0→1 + translateY 10→0`, `0.3s` con 50ms delay

---

## 6. Layout

### Grid del hero

```
Desktop (lg+): [imagen 1fr] [título 2.2fr] [imagen 1fr]
Mobile:        [título solo, full width]
```

### Grid de proyectos

```
Desktop (sm+): 2 columnas
Mobile:        1 columna
```

### Grid de estadísticas

```
Siempre: 2 columnas × 2 filas
Separadas por líneas de 1px (gap + background trick)
```

### Grid de secciones (about, services, contact)

```
Desktop (lg+): 2 columnas 50/50
Mobile:        1 columna apilado
```

---

## 7. Responsividad

| Breakpoint | Tailwind | Uso                                    |
|------------|----------|----------------------------------------|
| 375px      | (base)   | Mobile pequeño                         |
| 640px      | `sm:`    | Mobile grande (2 cols proyectos)       |
| 768px      | `md:`    | Tablet (nav desktop visible)           |
| 1024px     | `lg:`    | Desktop (grids de 2 col activos)       |
| 1200px     | `xl:`    | Max-width del contenedor               |

**Reglas:**
- Nunca horizontal scroll en mobile (`overflow-x: hidden` en body)
- Todos los textos responsive con `clamp()`
- Min touch target: 44×44px para botones e íconos interactivos
- `min-h-dvh` para hero (no `100vh` — problemas en iOS Safari)

---

## 8. Accesibilidad

- Contraste texto principal: `#0A0A0A` sobre `#F4F0EC` → ratio ~14:1 ✓
- Texto secundario (opacity 0.45): ratio ~6.3:1 ✓
- Texto mínimo (opacity 0.30): ratio ~4.2:1 — usar solo para metadatos
- Focus ring: `outline: 2px solid #0A0A0A; outline-offset: 3px`
- Todos los elementos interactivos tienen `aria-label` o texto visible
- Mobile menu con `role="dialog"`, `aria-modal="true"`, focus trap
- `@media (prefers-reduced-motion: reduce)` desactiva todas las animaciones
- Scroll behavior se declara en CSS, no JS (respeta preferencias del sistema)

---

## 9. Cómo crear una página nueva

1. Copiar `templates/page-template.html`
2. Renombrar: `proyectos.html`, `about.html`, etc.
3. Buscar `TODO:` y reemplazar con contenido real
4. Activar secciones comentadas según lo necesario
5. Reemplazar `.img-ph` con `<img>` reales cuando tengas las fotos
6. Ajustar hrefs del header/footer si la página está en subdirectorio

---

## 10. Checklist pre-publicación

- [ ] Todas las imágenes tienen `alt` descriptivo
- [ ] `<title>` y `<meta name="description">` actualizados
- [ ] Teléfono y email actualizados en header, footer y formulario
- [ ] Dirección actualizada en footer
- [ ] Links de redes sociales apuntando a cuentas reales
- [ ] Formulario conectado a backend o servicio (Formspree, EmailJS, etc.)
- [ ] Testear en mobile (375px) y desktop (1440px)
- [ ] Testear con teclado (Tab + Enter)
- [ ] Testear con modo oscuro del sistema (las páginas mantienen el beige — es el diseño)
- [ ] Imágenes en formato WebP u AVIF
- [ ] `loading="lazy"` en imágenes que no son above-the-fold
