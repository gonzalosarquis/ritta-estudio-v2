# ✅ Checklist de Despliegue - Ritta Estudio v2

## Tu proyecto está preparado y listo. Aquí va paso a paso:

---

### 📌 PASO 1: Push a GitHub (5 min)

```bash
git remote add origin https://github.com/TU_USUARIO/ritta-estudio-v2.git
git branch -M main
git push -u origin main
```

- [ ] Creé un repo en GitHub llamado `ritta-estudio-v2`
- [ ] Reemplacé `TU_USUARIO` con mi usuario de GitHub
- [ ] Ejecuté los comandos git
- [ ] Verifiqué que el código está en GitHub

**Resultado:** Tu código está en línea en GitHub ✅

---

### 🌐 PASO 2: Desplegar en Vercel (2 min)

1. Ve a https://vercel.com/new
2. Conecta tu cuenta de GitHub
3. Selecciona el repo `ritta-estudio-v2`
4. Haz clic en **"Deploy"**

- [ ] Autorizé Vercel con GitHub
- [ ] Seleccioné mi repo
- [ ] Esperé a que Vercel deployara (1-2 min)

**Resultado:** Tu sitio está en vivo en `ritta-estudio-v2.vercel.app` 🎉

---

### 🗄️ PASO 3: Crear Base de Datos en Supabase (5 min)

1. Ve a https://supabase.com
2. Haz clic en "Start your project"
3. Inicia sesión con GitHub
4. Crea un proyecto:
   - Nombre: `ritta-estudio`
   - Password: Guarda en lugar seguro
   - Region: Elige la más cercana

- [ ] Creé cuenta/proyecto en Supabase
- [ ] Guardé el password en lugar seguro
- [ ] Esperé a que se cree la BD (2-3 min)

**Resultado:** Tu base de datos está lista 📊

---

### 🔑 PASO 4: Obtener Credenciales Supabase (2 min)

En tu proyecto Supabase:

1. Ve a **Settings** → **API**
2. Copia:
   - **Project URL**
   - **Project API Key (anon)**

```
URL: https://xxxxxxxxxxxx.supabase.co
KEY: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

- [ ] Copié la URL de Supabase
- [ ] Copié la API Key (anon)
- [ ] Guardé ambos valores en lugar seguro

**Resultado:** Tienes tus credenciales 🔐

---

### 🌍 PASO 5: Agregar Credenciales a Vercel (3 min)

1. Ve a tu proyecto en Vercel
2. Ve a **Settings** → **Environment Variables**
3. Agrega dos variables:

| Nombre | Valor |
|--------|-------|
| `VITE_SUPABASE_URL` | Tu URL de Supabase |
| `VITE_SUPABASE_ANON_KEY` | Tu API Key |

4. Haz clic en "Save"
5. Vercel redesplegará automáticamente

- [ ] Agregué las variables de entorno a Vercel
- [ ] Vercel terminó de redeplegar

**Resultado:** Tu sitio ahora tiene acceso a Supabase ✅

---

### 📝 PASO 6: Crear Tabla de Contactos en Supabase (2 min)

En tu proyecto Supabase:

1. Ve a **SQL Editor** → **New Query**
2. Copia y pega esto:

```sql
CREATE TABLE contacts (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  email TEXT NOT NULL,
  name TEXT,
  phone TEXT,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'nuevo',
  created_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anyone to insert" ON contacts
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow owner to view" ON contacts
  FOR SELECT USING (true);
```

3. Haz clic en **"Run"**

- [ ] Ejecuté la query SQL
- [ ] Vi que se creó la tabla `contacts`

**Resultado:** Tu tabla está lista para recibir contactos 📬

---

### 🧪 PASO 7: Probar el Formulario (2 min)

1. Ve a `https://tu-dominio.vercel.app/ejemplo-formulario-contacto.html`
2. Reemplaza las credenciales Supabase en el archivo:

```javascript
const SUPABASE_URL = 'https://YOUR_PROJECT.supabase.co'
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY'
```

3. Llena el formulario y envía
4. Verifica en Supabase que el contacto se guardó

- [ ] Actualicé las credenciales en el formulario
- [ ] Llené y envié un contacto de prueba
- [ ] Verifiqué que aparece en Supabase

**Resultado:** Tu formulario funciona ✨

---

### 🎯 PASO 8: Integrar en tu Sitio (10 min)

Si quieres agregar el formulario a tu página principal:

1. Abre `index.html`
2. Agrega esta línea antes de `</body>`:

```html
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
```

3. Copia el HTML del formulario desde `ejemplo-formulario-contacto.html`
4. Actualiza las credenciales Supabase
5. Haz push a GitHub (Vercel se redepliegue automáticamente)

- [ ] Integré Supabase en mi sitio
- [ ] Agregué el formulario donde quería
- [ ] Hice push a GitHub
- [ ] Verifiqué en Vercel que se deployó

**Resultado:** Tu sitio tiene formulario con BD ✅

---

## 🎉 ¡LISTO!

Tu sitio `ritta-estudio-v2` está completamente en línea con:

✅ Hosting en Vercel (automático con cada push a GitHub)
✅ Base de datos en Supabase
✅ Formulario de contacto conectado
✅ Dominio personalizado (opcional)

---

## 🔗 URLs importantes

| Servicio | URL |
|----------|-----|
| GitHub | https://github.com/tu-usuario/ritta-estudio-v2 |
| Vercel | https://vercel.com |
| Supabase | https://supabase.com |
| Tu Sitio | https://ritta-estudio-v2.vercel.app |

---

## 💡 Próximos pasos opcionales

- [ ] Conectar dominio personalizado en Vercel
- [ ] Agregar más tablas a Supabase (proyectos, usuarios, etc.)
- [ ] Configurar Row Level Security (RLS) avanzado
- [ ] Agregar autenticación (signup/login)
- [ ] Crear un panel de administrador

---

## 🆘 Si algo no funciona

1. **Vercel no actualiza:** Espera 2 minutos y refresca
2. **Formulario no envía:** Revisa la consola del navegador (F12)
3. **Credenciales inválidas:** Verifica que copié bien la URL y key
4. **Supabase rechaza inserciones:** Revisa las políticas RLS

**Contacto de soporte:**
- Vercel: https://vercel.com/support
- Supabase: https://supabase.com/docs

---

¡Cualquier duda, avísame! 🚀
