# VERCEL_SETUP.md - Instrucciones Explícitas

**Audience:** Jonathan (con Codex), Claude Code  
**Status:** Ready for Phase 3 execution  
**Last Updated:** 2026-05-04

---

## PREREQUISITO: Completar COORDINATION.md FASE 1 y FASE 2

✅ FASE 1: Merge de Galya completado (`git merge origin/galya/frontend-ui-v2`)  
✅ FASE 2: Archivos de Vercel creados (vercel.json, .vercelignore, package.json con build)  
✅ Commit pushed a origin/jonathan/backend

Si NO completaste Fase 1 y 2, **DETENTE y completa COORDINATION.md primero.**

---

## FASE 3: VERCEL DASHBOARD CONFIGURATION

### Paso 1: Verificar que files existen en origin/jonathan/backend

Ejecuta esto en terminal:

```bash
cd "/Users/otanewi/Desktop/Prácticas WinoWin/Proyectos/crm-whatsapp-winowin"

# Verificar que los archivos están en GitHub
git ls-remote origin jonathan/backend | grep jonathan/backend

# Verificar archivos locales
ls -la frontend/vercel.json
cat frontend/package.json | grep "build"
```

**Expected output:**
```
✓ frontend/vercel.json exists
✓ frontend/package.json has "build": "vite build"
✓ frontend/.vercelignore exists
```

**If NOT:** Go back to COORDINATION.md FASE 2 and complete it.

---

### Paso 2: Acceder a Vercel Dashboard

**URL:** https://vercel.com/dashboard  
**Login:** Usa cuenta que conectó GitHub (probablemente Noxiffow account)

**Expected state:** Ya deberías ver un proyecto "whatsapp-crm" o poder importar el repo.

---

### Paso 3: Seleccionar Proyecto

En Vercel Dashboard:
1. Click en "whatsapp-crm" (o "Add Project" si no existe)
2. Si es "Add Project":
   - Selecciona "Import Git Repository"
   - Elige `Noxiffow/whatsapp-crm` desde GitHub
   - Click "Import"

---

### Paso 4: Configurar Rama y Root Directory

En Project Settings → Git:

| Campo | Valor |
|-------|-------|
| **Production Branch** | `jonathan/backend` |
| **Framework** | Vite (auto-detectado) |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |
| **Install Command** | `npm install` |
| **Root Directory** | `frontend/` |

**IMPORTANTE:** Si ves "Root Directory" field, DEBE ser `frontend/` porque los archivos están en esa carpeta.

**Steps en UI:**
1. Settings (gear icon arriba)
2. Git → General
3. Cambiar "Production Branch" de `main` a `jonathan/backend`
4. Cambiar "Root Directory" a `frontend` (Vercel auto lo convierte a `frontend/`)

---

### Paso 5: Agregar Variables de Entorno

En Project Settings → Environment Variables:

**Obtener valores de Supabase:**
1. Abre https://supabase.com/dashboard
2. Selecciona tu proyecto CRM
3. Copia los valores de: Settings → API → Project URL y anon key

**Agregar en Vercel:**

| Key | Value | Scope |
|-----|-------|-------|
| `VITE_SUPABASE_URL` | `https://xxxxx.supabase.co` | Production, Preview, Development |
| `VITE_SUPABASE_ANON_KEY` | `eyJxxxxx...` | Production, Preview, Development |

**Steps en UI:**
1. Settings (gear icon)
2. Environment Variables
3. Click "Add"
4. Name: `VITE_SUPABASE_URL`
5. Value: [Pega URL de Supabase]
6. Scope: Checkea Production, Preview, Development
7. Click "Add"
8. Repite para `VITE_SUPABASE_ANON_KEY`

**IMPORTANTE:** NUNCA pongas variables hardcodeadas en código. Siempre usa env vars en Vercel.

---

### Paso 6: Triggerear Primer Deploy

En Project → Deployments (tab arriba):

1. Click "Redeploy" en el deployment más reciente, O
2. Click "Deploy" button, OR
3. Haz un nuevo push a `jonathan/backend` (auto-triggerará deploy)

**Expected state después de 2-3 minutos:**
- Status: ✅ "READY"
- URL: `https://whatsapp-crm-six-steel.vercel.app` (o similar)
- Puedes clickear URL para ver el app en vivo

---

### Paso 7: Verificar Que Frontend Carga Correctamente

1. Abre URL de Vercel en navegador
2. Debería ver: Logo de WinoWin + lista de contactos vacía
3. Abre DevTools (F12) → Console
4. NO debería haber errores de Supabase auth
5. Si hay errores: Revisa env vars (Paso 5)

**Common issues:**
- "Supabase client error" → Env vars no configuradas
- "404 Not Found" → Root directory no es `frontend/`
- Build failed → package.json missing "build" script

---

## FASE 3B: SEGURIDAD POST-VERCEL (15 min después)

Una vez que Vercel esté deployado exitosamente:

### Mover Supabase Keys a Environment Variables

**Actualmente en el código:**
```javascript
// frontend/src/lib/supabase.ts
const SUPABASE_URL = "https://xxxxx.supabase.co"  // ❌ HARDCODED
const SUPABASE_ANON_KEY = "eyJ..."  // ❌ HARDCODED
```

**Cambiar a:**
```javascript
// frontend/src/lib/supabase.ts
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase environment variables')
}
```

**Pasos:**
1. Edita `frontend/src/lib/supabase.ts`
2. Reemplaza valores hardcodeados por `import.meta.env.VITE_XXX`
3. Añade validación if no existen
4. Commit: `git commit -m "security: move Supabase keys to environment variables"`
5. Push: `git push origin jonathan/backend`
6. Vercel auto-redeploya

---

## CHECKLIST FINAL

### ✅ Antes de empezar Fase 3
- [ ] Fase 1 completada (merge)
- [ ] Fase 2 completada (archivos Vercel creados)
- [ ] Changes pushed a `origin/jonathan/backend`

### ✅ Durante Fase 3 (en Vercel Dashboard)
- [ ] Root Directory configurado a `frontend/`
- [ ] Production Branch configurado a `jonathan/backend`
- [ ] Build Command: `npm run build`
- [ ] Env vars agregadas: `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`
- [ ] Deploy triggered y esperando a "READY"

### ✅ Verificación
- [ ] URL de Vercel abre sin errores
- [ ] Console (DevTools F12) sin errores de Supabase
- [ ] Puedo crear contactos y ver en live

### ✅ Post-Deploy (15 min después)
- [ ] Supabase keys movidas a env vars
- [ ] Validación agregada
- [ ] Commit y push completados

---

## TROUBLESHOOTING

### Build Failed: "Cannot find module @supabase/supabase-js"

**Causa:** `npm install` no corrió o node_modules corrupto

**Solución:**
1. En Vercel, Settings → Build & Development Settings
2. "Override Install Command": `npm ci`
3. Redeploy

### "VITE_SUPABASE_URL is undefined"

**Causa:** Env vars no configuradas o nombre incorrecto

**Solución:**
1. Verifica exactamente en Vercel Settings → Environment Variables
2. Nombre EXACTO: `VITE_SUPABASE_URL` (NO `VITE_SUPABASE_API_URL`)
3. Redeploy después de agregar

### "Cannot find file: frontend/index.html"

**Causa:** Root Directory no está set a `frontend/`

**Solución:**
1. Settings → Git → General
2. Root Directory: `frontend`
3. Redeploy

### "Deployment canceled"

**Causa:** Generalmente build timeout o error en package.json

**Solución:**
1. Ve a Deployments → haz click en "CANCELED" deployment
2. Lee logs para ver error exacto
3. Arregla error (ej: syntax error en JS)
4. Redeploy

---

## DESPUÉS QUE VERCEL ESTÉ LIVE

1. **URL para Galya:** Envía URL de Vercel para que vea cambios en vivo
2. **Workflow:** Galya push → Jonathan merge → Vercel auto-redeploy
3. **Actualizar README:** Cambiar URL placeholder por URL real de Vercel

---

**Status:** Phase 3 Ready  
**Next:** Ejecutar Fase 1, 2, 3 según COORDINATION.md
