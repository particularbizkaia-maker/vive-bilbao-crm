# Vive Bilbao CRM V4

CRM inmobiliario online con Supabase y Next.js.

## V4 incluye
- Clientes con ficha profesional y roles comerciales.
- Inmuebles asociados a propietario/cliente.
- Pedidos de compra/alquiler vinculados a cliente.
- Cruce automático de pedidos con inmuebles por ciudad, tipo, precio y dormitorios.
- Calendario mensual con citas vinculadas a cliente e inmueble.
- Tareas y seguimiento.
- Panel inicial y estadísticas.
- Auth Supabase y permisos admin/asesor.

## Supabase
Ejecutar `supabase/schema-v4.sql` en el proyecto CRM existente. Es una migración idempotente: conserva los datos existentes y añade las relaciones/campos nuevos.

## Vercel
Mantener Root Directory: `vive-bilbao-crm-completo`.
Variables: `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
