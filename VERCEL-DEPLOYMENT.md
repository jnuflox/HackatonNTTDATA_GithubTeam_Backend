# 🚀 Deployment en Vercel - Backend API

## ✅ Archivos de Configuración Creados

1. **vercel.json** - Configuración de Vercel
2. **api/index.js** - Punto de entrada serverless
3. **src/server.js** - Actualizado para soportar Vercel

## 📋 Variables de Entorno Requeridas

Para que el backend funcione en Vercel, necesitas configurar estas variables de entorno:

### En Vercel Dashboard:

1. Ve a tu proyecto en Vercel: https://vercel.com/jnufloxs-projects/hackaton-nttdata-github-team-backend
2. Click en **Settings** → **Environment Variables**
3. Agrega las siguientes variables:

#### Variables de Supabase (REQUERIDAS)
```
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_KEY=tu-anon-key-aquí
```

#### Variables de Azure OpenAI (Opcional - Mockup Activo)
```
AZURE_OPENAI_MOCK_MODE=true
AZURE_OPENAI_ENDPOINT=tu-endpoint (solo si desactivas mock)
AZURE_OPENAI_API_KEY=tu-api-key (solo si desactivas mock)
AZURE_OPENAI_DEPLOYMENT_NAME=gpt-4 (solo si desactivas mock)
```

#### Variables de Entorno
```
NODE_ENV=production
PORT=3000
```

## 🔧 Cómo Obtener las Credenciales de Supabase

1. Ve a tu proyecto en Supabase: https://supabase.com/dashboard
2. Click en **Settings** → **API**
3. Copia:
   - **Project URL** → `SUPABASE_URL`
   - **anon/public** key → `SUPABASE_KEY`

## 🚀 Redeploy del Proyecto

Después de configurar las variables de entorno:

### Opción 1: Desde Vercel Dashboard
1. Ve a la pestaña **Deployments**
2. Click en los 3 puntos del último deployment
3. Click en **Redeploy**

### Opción 2: Desde Git
1. Haz push de los nuevos archivos a tu repositorio:
   ```bash
   git add .
   git commit -m "Configure Vercel deployment"
   git push
   ```
2. Vercel automáticamente hará un nuevo deployment

### Opción 3: Desde CLI
```bash
cd api-ia-projects
vercel --prod
```

## ✅ Verificar el Deployment

Una vez desplegado, prueba estos endpoints:

### Health Check
```bash
curl https://hackaton-nttdata-github-team-backend.vercel.app/health
```

Respuesta esperada:
```json
{
  "status": "OK",
  "timestamp": "2026-02-02T...",
  "uptime": 123.45,
  "environment": "production",
  "database": "Supabase REST API connected"
}
```

### Get Projects
```bash
curl https://hackaton-nttdata-github-team-backend.vercel.app/api/projects
```

Respuesta esperada:
```json
{
  "success": true,
  "data": [...]
}
```

## 🐛 Troubleshooting

### Error 500 o "Cannot connect to Supabase"
- Verifica que las variables `SUPABASE_URL` y `SUPABASE_KEY` estén correctas
- Asegúrate de que no haya espacios extra en las variables
- Verifica que el proyecto de Supabase esté activo

### Error 404 en todas las rutas
- Verifica que `vercel.json` esté en la raíz del proyecto
- Verifica que `api/index.js` exista
- Redeploy el proyecto

### Error de CORS
- El CORS ya está configurado para permitir todos los orígenes
- Si persiste, verifica los logs en Vercel Dashboard → Functions → View Logs

### Timeout en las peticiones
- Las funciones serverless de Vercel tienen un timeout de 10s (plan gratis) o 60s (plan pro)
- Optimiza las queries que tarden mucho

## 📊 Logs y Monitoreo

Para ver los logs del servidor:
1. Ve a Vercel Dashboard
2. Click en **Functions** tab
3. Click en cualquier función para ver sus logs
4. O usa: https://vercel.com/jnufloxs-projects/hackaton-nttdata-github-team-backend/logs

## 🔗 URLs del Proyecto

- **Deployment URL**: https://hackaton-nttdata-github-team-backend.vercel.app
- **Health Check**: https://hackaton-nttdata-github-team-backend.vercel.app/health
- **API Base**: https://hackaton-nttdata-github-team-backend.vercel.app/api
- **Projects Endpoint**: https://hackaton-nttdata-github-team-backend.vercel.app/api/projects
- **Dashboard Stats**: https://hackaton-nttdata-github-team-backend.vercel.app/api/projects/dashboard/stats

## ✨ Diferencias con Desarrollo Local

En Vercel:
- ✅ No se ejecuta `app.listen()` (Vercel maneja esto)
- ✅ No se hace test de conexión inicial a Supabase (se prueba en primera petición)
- ✅ Cada petición es una función serverless nueva (sin estado persistente)
- ✅ Las variables de entorno se cargan desde Vercel, no desde `.env`

## 🎯 Siguiente Paso

Una vez que el backend esté funcionando:
1. Verifica que responda en `/health`
2. Verifica que `/api/projects` devuelva datos
3. Actualiza el frontend si la URL cambió
4. ¡Listo para usar! 🎉
