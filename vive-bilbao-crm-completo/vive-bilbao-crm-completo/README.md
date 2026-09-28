# Vive Bilbao CRM v3

Versión funcional del CRM online para Vive Bilbao Inmobiliario.

Incluye:
- Login con Supabase Auth.
- Inmuebles: alta, edición, eliminación, precio, dirección, estado, visibilidad compartida/privada, superficie, habitaciones, baños y descripción.
- Clientes: alta, edición y eliminación con teléfono, email, ciudad y notas.
- Calendario mensual con todos los días, navegación entre meses, selección de día y citas con hora, ubicación y notas.
- Inicio con contadores y próximas citas.
- Búsqueda global para inmuebles y clientes.
- RLS de Supabase para permisos.

Variables de entorno:
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

El resto de módulos (Pedidos, Captación, Tareas y Noticias) quedan preparados para la siguiente fase.
