# COORDINATION.md - CRM WhatsApp WinoWin
**Versión:** 2026-05-04  
**Estado:** Instrucciones para Codex (Galya), Codex (Jonathan), Claude Code

---

## 🎯 SITUACIÓN ACTUAL

### Ramas Activas
| Rama | Propietario | Stack | Estado |
|------|-------------|-------|--------|
| `origin/galya/frontend-ui-v2` | Galya | React+Vite+Supabase | ✅ UI mejorado, búsqueda normalizada |
| `origin/jonathan/backend` | Jonathan | React+Vite+Supabase+RPC | ✅ Documentación contrato backend |
| `origin/main` | — | Desactualizado | ⚠️ No tocar |

### Diferencias Entre Ramas
**Galya (galya/frontend-ui-v2) tiene:**
- Búsqueda por nombre con normalización de acentos (NFD)
- Búsqueda por teléfono sin caracteres especiales
- Mejor manejo de try/catch en handleSubmit

**Jonathan (jonathan/backend) tiene:**
- Documentación del contrato de `lead_status` en README
- Commit más reciente con documentación técnica

**Decisión:** Mergear cambios de Galya → jonathan/backend, luego configurar Vercel.

---

## 🚀 PLAN DE EJECUCIÓN

### FASE 1: MERGE GALYA → JONATHAN (Jonathan + Codex Jonathan)
**Propósito:** Incorporar UI mejorado de Galya a tu rama

**Pasos exactos:**
```bash
cd "/Users/otanewi/Desktop/Prácticas WinoWin/Proyectos/crm-whatsapp-winowin"

# 1. Asegurar que estás en jonathan/backend
git checkout jonathan/backend
git pull origin jonathan/backend

# 2. Mergear cambios de Galya
git merge origin/galya/frontend-ui-v2 -m "merge: UI improvements from Galya (normalize search, better error handling)"

# 3. Revisar cambios (sin conflictos esperados, pero revisar)
git status
git log --oneline -3

# 4. Push a origin
git push origin jonathan/backend
```

**Responsable:** Jonathan + Codex Jonathan  
**Tiempo estimado:** 5 min  
**Post-acción:** Notificar a Galya que merge completado

---

### FASE 2: CREAR VERCEL.JSON (Jonathan + Codex Jonathan)
**Propósito:** Configurar Vercel para deployar frontend correctamente

**Crear archivo:** `/frontend/vercel.json`
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "env": {
    "VITE_SUPABASE_URL": {
      "description": "Supabase project URL",
      "required": true
    },
    "VITE_SUPABASE_ANON_KEY": {
      "description": "Supabase anonymous key",
      "required": true
    }
  }
}
```

**Crear archivo:** `/frontend/.vercelignore`
```
node_modules
.git
.gitignore
README.md
```

**Actualizar:** `frontend/package.json`
Añadir script `build`:
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

**Commit y push:**
```bash
git add frontend/vercel.json frontend/.vercelignore frontend/package.json
git commit -m "config: add Vercel deployment configuration for frontend"
git push origin jonathan/backend
```

**Responsable:** Jonathan + Codex Jonathan  
**Tiempo estimado:** 10 min

---

### FASE 3: CONECTAR VERCEL (Jonathan - Manual)
**Propósito:** Configurar Vercel para deployar desde rama galya/frontend-ui-v2

**Pasos en Vercel Dashboard:**
1. Ir a https://vercel.com/dashboard
2. Seleccionar proyecto "whatsapp-crm" (o crear si no existe)
3. Settings → Git → Deployments
4. Cambiar rama raíz de `main` a `jonathan/backend`
5. Agregar variables de entorno:
   - `VITE_SUPABASE_URL` = [Tu URL de Supabase]
   - `VITE_SUPABASE_ANON_KEY` = [Tu key pública de Supabase]
6. Guardar y triggerear un redeploy

**Resultado esperado:**
- URL en vivo apuntando a Vercel
- Ambos (Galya + Jonathan) pueden ver resultado live

**Responsable:** Jonathan (manual en dashboard)  
**Tiempo estimado:** 5 min

---

## ⚠️ IMPORTANTE: SEGURIDAD SUPABASE

**Estado actual:** Variables hardcoded en `frontend/src/lib/supabase.ts`

**Acción requerida DESPUÉS de Vercel setup:**
1. Copiar valores de `frontend/src/lib/supabase.ts`
2. Guardarlos en Vercel como secrets (no en Git)
3. Cambiar código a usar `import.meta.env.VITE_SUPABASE_URL`
4. Actualizar `.env.example` (sin valores reales)

**Commit posterior:**
```bash
# DESPUÉS de configurar Vercel
git add frontend/src/lib/supabase.ts frontend/.env.example
git commit -m "security: move Supabase keys to environment variables"
```

---

## 📋 CHECKLIST EXECUTION

### ✅ FASE 1: Merge (15 min)
- [ ] Checkout jonathan/backend
- [ ] Merge origin/galya/frontend-ui-v2
- [ ] Revisar sin conflictos
- [ ] Push a origin

### ✅ FASE 2: Config (15 min)
- [ ] Crear vercel.json
- [ ] Crear .vercelignore
- [ ] Actualizar package.json con "build"
- [ ] Commit y push

### ✅ FASE 3: Vercel (10 min)
- [ ] Login en Vercel
- [ ] Conectar rama jonathan/backend
- [ ] Agregar env vars
- [ ] Triggerear deploy

### ⏭️ POST-VERCEL: Security (10 min)
- [ ] Mover Supabase keys a env vars
- [ ] Actualizar .env.example
- [ ] Commit y push

---

## 🔄 WORKFLOW POST-SETUP

**Para desarrollar juntos:**
1. **Galya:** Push a `origin/galya/frontend-ui-v2` (su rama)
2. **Jonathan:** Haces merge periodicamente: `git merge origin/galya/frontend-ui-v2`
3. **Vercel:** Auto-redeploy en cada push a `jonathan/backend`
4. **Ambos:** Ven cambios en vivo en Vercel URL

**No hacer:**
- ❌ Ambos en main (está desactualizado)
- ❌ Rebase sin coordinar
- ❌ Forzar push (--force)
- ❌ Variables Supabase en código (después del setup)

---

## 📞 HANDOFF ENTRE CODEX

**Para Codex de Galya (frontend):**
- Tu rama es: `origin/galya/frontend-ui-v2`
- No hagas push a main
- Jonathan mergeará tus cambios cuando esté listo
- Live preview estará en Vercel URL (ver con Jonathan)

**Para Codex de Jonathan (backend):**
- Tu rama es: `origin/jonathan/backend`
- Responsable de mergear cambios de Galya
- Responsable de configurar Vercel
- Documentación actualiza en README

**Para Claude Code:**
- Asistencia técnica a Jonathan
- Verificación de Vercel setup
- Auditoria de seguridad (env vars)

---

## 📝 ACTUALIZAR DOCUMENTACIÓN DESPUÉS

Cuando Vercel esté live, actualizar:
1. README.md → Agregar "Live Preview" link
2. Este archivo → "Status: ✅ ACTIVE"
3. Obsidian nodo CRM-WhatsApp → Agregar workflow diagram

---

**Última actualización:** 2026-05-04  
**Próximo review:** Cuando Vercel esté en vivo
