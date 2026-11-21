# Mathspace — Portafolio Digital de Matemáticas

Proyecto inicial en React + Vite con identidad visual futurista universitaria.

## Requisitos
- Node.js 20 o superior
- npm

## Ejecutar en tu computadora
1. Descomprime el proyecto.
2. Abre una terminal dentro de la carpeta `portafolio-matematicas`.
3. Ejecuta:

```bash
npm install
npm run dev
```

4. Abre la dirección local que Vite muestre en la terminal (normalmente http://localhost:5173).

## Qué incluye esta primera versión
- Portada académica y nueve secciones.
- Buscador de carpetas.
- Efectos hover, tarjetas 3D y transiciones.
- Navegación por sección.
- Carga y descarga local de archivos durante la sesión.

## Importante antes de publicar
Esta versión es una **interfaz inicial**, no un sistema de almacenamiento permanente. Los archivos agregados desde el navegador usan URLs temporales y se pierden al recargar o cerrar la página. El acceso de administrador y su clave son únicamente de demostración; no son seguridad real.

Antes de publicar para tu profesor, el siguiente paso es conectar Supabase Storage y Supabase Auth:
- Autenticación real solo para el propietario.
- Lectura pública de documentos publicados.
- Subida, modificación y eliminación restringidas al propietario.
- Reglas de almacenamiento y límites de tamaño/tipo de archivo.

No publiques esta demo con la clave de ejemplo ni subas documentos privados.
