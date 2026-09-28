# Vive Bilbao CRM 2.0

Versión preparada para Next.js + Supabase + Vercel.

## Incluye
- Login real con Supabase Auth.
- Dashboard responsive.
- Inmuebles online con alta y visibilidad compartida/privada.
- Clientes y calendario conectados a Supabase.
- Roles admin/asesor y RLS.
- Estructura de pedidos, captación, tareas/noticias y estadísticas.

## Vercel
Si esta carpeta está dentro de un repositorio mayor, Root Directory debe ser `vive-bilbao-crm-completo` y Framework Preset `Next.js`.

Variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

Ejecuta `supabase/schema.sql` en el SQL Editor de Supabase.
