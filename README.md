# Plataforma Web de Subastas de Vehículos en Tiempo Real (Caso Copart)

Proyecto del Segundo Parcial — Desarrollo y Diseño Web — Universidad Mariano Gálvez de Guatemala.

**Sitio publicado:** https://copart-subastas-segundo-parcial.vercel.app

## Usuarios de prueba

| Correo | Contraseña |
|---|---|
| ana.postora@copart.test | Postor123! |
| luis.postor@copart.test | Postor123! |
| carla.postora@copart.test | Postor123! |

Estos usuarios y varios vehículos de ejemplo (algunos en subasta activa, uno próximo a cerrar, uno pendiente de iniciar y uno ya cerrado desierto) se crean con el script de seed (ver abajo). Cualquier usuario puede además registrar su propia cuenta desde `/registro`.

## Stack técnico

- **Frontend:** React + Vite (SPA), `react-router-dom` para las rutas.
- **Backend:** API REST con Node.js + Express.
- **Base de datos:** PostgreSQL (Neon / Vercel Postgres).
- **Tiempo real:** sondeo (polling) cada 2–4 segundos al backend para reflejar nuevas ofertas y cambios de estado sin recargar la página, más un temporizador (cuenta regresiva) calculado en el cliente a partir de la fecha de cierre. Se optó por polling en lugar de WebSockets porque el backend corre como funciones serverless en Vercel, que no sostienen conexiones persistentes de forma confiable.
- **Despliegue:** Vercel (frontend estático + funciones serverless para `/api/*`).

## Estructura del proyecto

```
├── client/          Frontend React (Vite)
├── server/          API Express (código fuente reutilizado por api/index.js)
├── api/index.js     Punto de entrada serverless para Vercel (envuelve la app Express)
├── db/schema.sql    Esquema de la base de datos PostgreSQL
├── vercel.json      Configuración de build y rutas para Vercel
```

## Configuración local

### 1. Requisitos
- Node.js 18+
- Una base de datos PostgreSQL (recomendado: [Neon](https://neon.tech), capa gratuita)

### 2. Instalar dependencias (workspaces: client + server)
```bash
npm install
```

### 3. Configurar variables de entorno del backend
Copia `server/.env.example` a `server/.env` y completa:
```
DATABASE_URL=postgresql://usuario:password@host/basedatos?sslmode=require
JWT_SECRET=una-clave-larga-y-secreta
PORT=4000
```

### 4. Crear el esquema y los datos de prueba
```bash
npm run migrate
npm run seed
```

### 5. Levantar el backend y el frontend (en dos terminales)
```bash
npm run dev:server   # http://localhost:4000
npm run dev:client   # http://localhost:5173
```

El frontend en desarrollo apunta a `http://localhost:4000` mediante `client/.env.development` (`VITE_API_URL`). En producción (Vercel) el frontend llama a `/api/...` en el mismo dominio, sin necesidad de configurar esa variable.

## Despliegue en Vercel

1. Crea una base de datos en [Neon](https://neon.tech) (o Vercel Postgres) y copia su cadena de conexión.
2. Sube este repositorio a GitHub (o usa `vercel` directamente desde esta carpeta).
3. En Vercel, importa el proyecto (o ejecuta `vercel` desde la raíz del repo).
4. Configura las variables de entorno del proyecto en Vercel → Settings → Environment Variables:
   - `DATABASE_URL`
   - `JWT_SECRET`
5. Antes o después del primer deploy, ejecuta la migración y el seed apuntando a la base de datos de producción:
   ```bash
   DATABASE_URL="<tu-connection-string-de-produccion>" npm run migrate
   DATABASE_URL="<tu-connection-string-de-produccion>" npm run seed
   ```
6. Despliega a producción:
   ```bash
   vercel --prod
   ```
7. La URL de producción es https://copart-subastas-segundo-parcial.vercel.app

## Reglas de negocio implementadas

- Registro/login obligatorio (JWT) para publicar u ofertar; catálogo e inventario visibles en modo lectura para anónimos.
- Publicación de vehículo con ficha técnica completa, clasificación de daño (verde/amarillo/rojo) y mínimo 5 fotografías.
- Filtros combinables por marca, modelo, año, combustible, tren de manejo, nivel de daño y estado de la subasta.
- Precio base mínimo Q 20,000; cada nueva oferta debe superar la puja actual por al menos 10%, validado en el servidor.
- Identidad de los postores oculta: solo se muestran los montos de las ofertas, nunca quién ofertó.
- Indicadores en vivo para el usuario autenticado: "¡Vas ganando esta subasta!" / "Tu oferta ha sido superada".
- Cierre automático de la subasta al llegar la hora de cierre: se marca como vendida (con ganador) o desierta (sin ofertas), sin intervención manual.
- El propietario puede buscar, editar y eliminar sus publicaciones únicamente mientras la subasta no ha iniciado.
