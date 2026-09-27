# Vive Bilbao CRM 2.0

Base real para un CRM inmobiliario multiusuario de Vive Bilbao Inmobiliario.

## Incluye
- Next.js + React
- Supabase/PostgreSQL + autenticación preparada
- Roles `admin` / `advisor`
- Datos por asesor y cartera compartida
- Inmuebles, clientes, pedidos, captación, calendario y noticias
- Row Level Security (RLS) en PostgreSQL
- Diseño responsive rojo/gris/blanco

## Puesta en marcha
1. Crear un proyecto en Supabase.
2. Ejecutar `supabase/schema.sql` en SQL Editor.
3. Copiar `.env.example` a `.env.local` y rellenar las claves de Supabase.
4. `npm install`
5. `npm run dev`

Esta entrega es el esqueleto funcional y seguro del CRM online. Para producción hay que conectar los formularios CRUD, autenticación/login, gestión de usuarios, almacenamiento de fotos/documentos y despliegue.
