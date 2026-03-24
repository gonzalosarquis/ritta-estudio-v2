# 🚀 Guía de Despliegue: Ritta Estudio v2

Tu sitio está listo para publicarse. Aquí están los pasos para tenerlo en línea en **15 minutos**.

---

## 📋 Requisitos previos

- ✅ Cuenta de GitHub (ya tienes)
- ⭕ Crear cuenta de Vercel (gratis)
- ⭕ Crear cuenta de Supabase (gratis)

---

## 🎯 PASO 1: Crear Repositorio en GitHub

1. Ve a https://github.com/new
2. Crea un repo llamado **`ritta-estudio-v2`** (público o privado)
3. **NO** inicialices con README ni .gitignore (ya lo tenemos)
4. Copia el comando que aparece bajo "...or push an existing repository from the command line"

---

## 📤 PASO 2: Push a GitHub

En tu terminal, dentro de la carpeta del proyecto, ejecuta:

```bash
git remote add origin https://github.com/TU_USUARIO/ritta-estudio-v2.git
git branch -M main
git push -u origin main
```

⚠️ Reemplaza `TU_USUARIO` con tu nombre de usuario de GitHub.

**Listo en GitHub ✅**

---

## 🌐 PASO 3: Desplegar en Vercel (2 minutos)

1. Ve a https://vercel.com/new
2. Inicia sesión con GitHub
3. Busca y selecciona el repo **`ritta-estudio-v2`**
4. Haz clic en "Deploy"
5. ¡Espera 1-2 minutos y tendrás tu sitio en línea! 🎉

**Tu URL será algo como:** `ritta-estudio-v2.vercel.app`

**Vercel completado ✅**

---

## 🗄️ PASO 4: Crear Base de Datos en Supabase

Si necesitas almacenar datos (contactos, proyectos, etc.):

1. Ve a https://supabase.com
2. Haz clic en "Start your project"
3. Inicia sesión con GitHub (más fácil)
4. Crea un nuevo proyecto:
   - **Nombre:** `ritta-estudio`
   - **Password:** Crea uno seguro y guárdalo
   - **Region:** Selecciona la más cercana a tu ubicación
5. Espera a que se cree (2-3 minutos)

**Supabase listo ✅**

---

## 🔧 PASO 5: Conectar Supabase a tu Sitio

Una vez que Supabase esté listo:

1. Ve a tu proyecto en Supabase
2. En el menú izquierdo, haz clic en **"Settings"** → **"API"**
3. Copia:
   - **Project URL**
   - **Project API Key (anon)**

### Opción A: Guardar credenciales (seguro)

Crea un archivo `.env.local` en la raíz del proyecto:

```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

**NO** subas este archivo a GitHub (está en .gitignore).

### Opción B: Agregar variables a Vercel

1. Ve a tu proyecto en Vercel
2. Ve a **Settings** → **Environment Variables**
3. Agrega:
   - `VITE_SUPABASE_URL` = tu URL
   - `VITE_SUPABASE_ANON_KEY` = tu API key

---

## 📝 PASO 6: Ejemplo - Crear un formulario de contacto con Supabase

Aquí hay un ejemplo para agregar un formulario a tu sitio:

```html
<form id="contactForm">
  <input type="email" id="email" placeholder="Tu email" required>
  <textarea id="message" placeholder="Tu mensaje" required></textarea>
  <button type="submit">Enviar</button>
</form>

<script>
  import { createClient } from '@supabase/supabase-js'

  const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY
  )

  document.getElementById('contactForm').addEventListener('submit', async (e) => {
    e.preventDefault()

    const { data, error } = await supabase
      .from('contacts')
      .insert([
        {
          email: document.getElementById('email').value,
          message: document.getElementById('message').value,
          created_at: new Date()
        }
      ])

    if (error) console.error('Error:', error)
    else {
      alert('¡Mensaje enviado!')
      e.target.reset()
    }
  })
</script>
```

Para esto, necesitarás:

1. Crear una tabla `contacts` en Supabase:
   - Ve a **SQL Editor** → **New Query**
   - Pega esto:

```sql
CREATE TABLE contacts (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow inserts" ON contacts
  FOR INSERT WITH CHECK (true);
```

2. Ejecuta la query

**¡Ahora tu formulario guardará datos en la BD! ✅**

---

## 🔐 Seguridad

- Nunca compartas tu API key pública en código del cliente
- Usa Supabase Row Level Security (RLS) para proteger datos
- Las environment variables de Vercel son seguras

---

## ✨ ¿Qué sigue?

- Configura un dominio personalizado en Vercel
- Agrega más tablas a Supabase según necesites
- Actualiza automáticamente: cada push a GitHub = nuevo deploy en Vercel

---

## 🆘 Ayuda

Si algo no funciona:
1. Revisa los logs en Vercel: **Deployments** → **Ver logs**
2. Revisa la consola del navegador (F12)
3. Verifica que las variables de entorno estén correctas

¡Listo! Tu sitio está en línea. 🚀
