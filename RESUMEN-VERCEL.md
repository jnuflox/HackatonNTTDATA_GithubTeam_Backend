# ✅ Backend Configurado para Vercel

## Archivos Creados/Modificados

### ✅ Archivos Nuevos

1. **vercel.json** - Configuración de Vercel
   - Define el punto de entrada: `api/index.js`
   - Configura las rutas
   - Variables de entorno predeterminadas

2. **api/index.js** - Punto de entrada serverless para Vercel
   - Exporta la aplicación Express
   - Compatible con funciones serverless

3. **.vercelignore** - Archivos a ignorar en el deployment
   - Excluye node_modules, tests, archivos temporales

4. **VERCEL-DEPLOYMENT.md** - Documentación completa de deployment

### ✅ Archivos Modificados

1. **src/server.js** - Actualizado para soportar Vercel
   - Detecta entorno Vercel (`process.env.VERCEL`)
   - No ejecuta `app.listen()` en Vercel
   - Saltea test de conexión inicial en Vercel
   - Exporta `app` para uso serverless

## 🚀 Pasos para Desplegar

### 1️⃣ Configurar Variables de Entorno en Vercel

Ve a: https://vercel.com/jnufloxs-projects/hackaton-nttdata-github-team-backend/settings/environment-variables

Agrega estas variables:

**REQUERIDAS:**
```
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_KEY=tu-anon-key
```

**OPCIONALES:**
```
AZURE_OPENAI_MOCK_MODE=true
NODE_ENV=production
```

### 2️⃣ Hacer Push de los Cambios

```bash
git add .
git commit -m "Configure Vercel deployment"
git push
```

### 3️⃣ Vercel Automáticamente Hará Redeploy

O puedes forzar un redeploy desde:
https://vercel.com/jnufloxs-projects/hackaton-nttdata-github-team-backend/deployments

### 4️⃣ Verificar el Deployment

Prueba estos endpoints:

**Health Check:**
```
https://hackaton-nttdata-github-team-backend.vercel.app/health
```

**Projects:**
```
https://hackaton-nttdata-github-team-backend.vercel.app/api/projects
```

## 🎯 Qué Hace Cada Cambio

### vercel.json
```json
{
  "builds": [{ "src": "api/index.js", "use": "@vercel/node" }],
  "routes": [{ "src": "/(.*)", "dest": "/api/index.js" }]
}
```
- Le dice a Vercel que compile `api/index.js` como función serverless
- Redirige todas las rutas a esa función

### api/index.js
```javascript
require('dotenv').config();
const app = require('./src/server');
module.exports = app;
```
- Punto de entrada simple que exporta la app Express
- Vercel lo convierte en función serverless

### src/server.js
```javascript
if (process.env.VERCEL !== '1') {
  app.listen(PORT, () => { ... });
}
```
- Solo ejecuta `listen()` en desarrollo local
- En Vercel, simplemente exporta la app

## ⚠️ Importante

1. **Sin variables de entorno = Error 500**
   - Debes configurar SUPABASE_URL y SUPABASE_KEY

2. **Primera petición puede ser lenta**
   - Las funciones serverless se "despiertan" en la primera llamada
   - Siguientes peticiones son más rápidas

3. **Sin estado persistente**
   - Cada petición es una función nueva
   - No hay memoria compartida entre peticiones

## ✅ Checklist Final

- [x] vercel.json creado
- [x] api/index.js creado
- [x] src/server.js modificado
- [x] .vercelignore creado
- [ ] Variables de entorno configuradas en Vercel
- [ ] Push de cambios a Git
- [ ] Redeploy en Vercel
- [ ] Probar /health endpoint
- [ ] Probar /api/projects endpoint

## 🔗 Links Útiles

- **Proyecto Vercel**: https://vercel.com/jnufloxs-projects/hackaton-nttdata-github-team-backend
- **Logs**: https://vercel.com/jnufloxs-projects/hackaton-nttdata-github-team-backend/logs
- **Settings**: https://vercel.com/jnufloxs-projects/hackaton-nttdata-github-team-backend/settings

---

**Listo para desplegar!** 🚀

Una vez configuradas las variables de entorno y hecho el redeploy, el backend debería funcionar correctamente en Vercel.
