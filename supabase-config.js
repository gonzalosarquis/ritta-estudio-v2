/**
 * Configuración de Supabase para Ritta Estudio
 *
 * Uso:
 * 1. Obtén tus credenciales de https://supabase.com
 * 2. Establece las variables de entorno:
 *    - VITE_SUPABASE_URL
 *    - VITE_SUPABASE_ANON_KEY
 * 3. Importa este archivo en tus scripts
 */

// Para sitios estáticos HTML, usa esto en tu HTML:
// <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>

// Inicializar cliente Supabase
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || localStorage.getItem('SUPABASE_URL')
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || localStorage.getItem('SUPABASE_KEY')

// Si lo prefieres, puedes poner las credenciales directamente (menos seguro):
// const SUPABASE_URL = 'https://xxxx.supabase.co'
// const SUPABASE_KEY = 'eyJhbGc...'

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY)

export { supabase }

/**
 * Funciones útiles para tu sitio
 */

// Guardar un contacto
export async function saveContact(email, message) {
  try {
    const { data, error } = await supabase
      .from('contacts')
      .insert([{
        email,
        message,
        created_at: new Date().toISOString()
      }])

    if (error) throw error
    return { success: true, data }
  } catch (error) {
    console.error('Error guardando contacto:', error)
    return { success: false, error: error.message }
  }
}

// Obtener todos los contactos (solo si tienes permisos)
export async function getContacts() {
  try {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return { success: true, data }
  } catch (error) {
    console.error('Error obteniendo contactos:', error)
    return { success: false, error: error.message }
  }
}

// Guardar un proyecto
export async function saveProject(title, description, images) {
  try {
    const { data, error } = await supabase
      .from('projects')
      .insert([{
        title,
        description,
        images,
        created_at: new Date().toISOString()
      }])

    if (error) throw error
    return { success: true, data }
  } catch (error) {
    console.error('Error guardando proyecto:', error)
    return { success: false, error: error.message }
  }
}

// Obtener proyectos
export async function getProjects() {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return { success: true, data }
  } catch (error) {
    console.error('Error obteniendo proyectos:', error)
    return { success: false, error: error.message }
  }
}
