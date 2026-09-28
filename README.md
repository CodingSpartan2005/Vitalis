# VITALIS

Aplicación fullstack de lifestyle y fitness hecha con Next.js App Router, Drizzle ORM y PostgreSQL.

## Plataforma recomendada: Vercel

Vercel es la ruta más directa para esta aplicación Next.js. Netlify también es compatible; ambos pueden desplegar el App Router, API routes y renderizado dinámico.

### 1. Antes de publicar

1. **Rota la contraseña de Neon que se compartió en una conversación**. Considera esa contraseña expuesta y revócala desde Neon antes de publicar.
2. Sube el repositorio a GitHub/GitLab. `.gitignore` excluye `.env` y otros archivos de secretos; no los fuerces al repositorio.
3. Confirma que el proyecto de Neon sigue activo y usa una URL pooled para tráfico de producción.

### 2. Desplegar en Vercel

1. Entra en Vercel y elige **Add New → Project**.
2. Importa el repositorio de VITALIS.
3. Deja los valores detectados por Next.js:
   - Framework: **Next.js**
   - Build command: `npm run build`
   - Install command: `npm install`
   - Output directory: dejar el valor automático de Next.js.
4. En **Project Settings → Environment Variables**, configura `DATABASE_URL` para **Production**, **Preview** y **Development**:

   ```text
   DATABASE_URL=postgresql://USUARIO:CONTRASENA@HOST-POOLER.REGION.aws.neon.tech/neondb?sslmode=require
   ```

   Copia la URL **pooled** nueva desde Neon; el hostname suele incluir `-pooler`. No uses la contraseña expuesta previamente.

5. Pulsa **Deploy**. Cada cambio enviado a la rama de producción vuelve a desplegarse automáticamente.

### 3. Desplegar en Netlify

1. Sube el proyecto a GitHub (o usa `netlify deploy --build --prod` desde la carpeta del proyecto) e impórtalo en Netlify con **Add new site → Import an existing project**.
2. **No necesitas la carpeta `public/`.** Todas las fotos se cargan desde un CDN público (`src/lib/images.ts`), así que la web funciona aunque tu descarga no incluya imágenes.
3. `netlify.toml` ya fija el comando `npm run build`, el directorio de publicación `.next` y Node 22. Netlify aplica su adaptador de Next.js automáticamente.
4. En **Site configuration → Environment variables** añade `DATABASE_URL` (URL *pooled* de Neon con `sslmode=require`) con los ámbitos **Builds** y **Functions**. Opcionalmente `PGUSER` y `PGPASSWORD`: si existen, sustituyen al usuario/contraseña de `DATABASE_URL`.
5. Pulsa **Deploys → Trigger deploy → Clear cache and deploy site**.
6. Comprueba `/api/health` → debe responder `{"ok":true}`.

## Variables de entorno

- `DATABASE_URL`: requerida por la app en runtime; debe ser una conexión PostgreSQL pooled y TLS (`sslmode=require`). Vercel y Netlify la leen como secreto del servidor y no se expone al navegador.
- `DATABASE_URL_UNPOOLED`: opcional y solo para `drizzle-kit`/cambios de esquema desde un entorno seguro. Usa la URL directa de Neon, no la pongas en código y no es necesaria durante las peticiones normales.
- `PG_POOL_MAX`: opcional. Limita las conexiones por instancia serverless; valor predeterminado `2`.

Hay una plantilla sin secretos en `.env.example`. La conexión local de desarrollo puede permanecer en `.env`, que está ignorado por Git.

## Aplicar cambios del esquema

La instancia Neon ya tiene las tablas de VITALIS. Para futuras actualizaciones de esquema, usa una terminal segura con la URL directa disponible en el entorno:

```bash
DATABASE_URL_UNPOOLED="postgresql://USUARIO:CONTRASENA@HOST.REGION.aws.neon.tech/neondb?sslmode=require" npx drizzle-kit push
```

No agregues esa URL al repositorio ni la marques con `NEXT_PUBLIC_`.

## Verificar el despliegue

- Abre `/api/health`; debe responder `{"ok":true}`.
- Prueba `/registro`, crea un usuario de prueba y confirma que inicia en su propio panel.
- Añade una rutina y receta propias, recarga la página y confirma que siguen guardadas.
- Revisa **Rutinas Fitness**: solo los movimientos con demostración verificada muestran reproductor. Las recetas muestran fotos e instrucciones.

## Desarrollo local

```bash
npm install
npm run dev
```

La app requiere `DATABASE_URL` en `.env`. Para validar el build local:

```bash
npx next typegen
npm exec tsc -- --noEmit --pretty false
npm run build
```
