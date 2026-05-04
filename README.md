# WhatsApp CRM

MVP de CRM para gestión de contactos y conversaciones de WhatsApp.

## Descripción

Este proyecto explora una solución ligera para centralizar conversaciones, contactos y seguimiento comercial en una sola interfaz.

Actualmente permite:

- crear contactos desde la interfaz
- abrir o generar conversaciones asociadas a cada cliente
- registrar mensajes entrantes y salientes
- simular mensajes para pruebas funcionales
- validar el flujo principal del CRM con datos ficticios

## Estado actual

El proyecto se encuentra en fase MVP con infraestructura lista en Supabase.

**Estado real a 4 de mayo de 2026:**

✅ **Funcionalidades implementadas:**
- Contactos, conversaciones y mensajes funcionando en Supabase
- Búsqueda normalizada por nombre (con acentos) y teléfono
- Validación de formato de teléfono (interfaz + base de datos)
- Eliminación segura de contactos vía RPC (delete_contact_cascade)
- Actualización de estado de lead vía RPC (update_contact_lead_status)
- Frontend mínimo operativo con Supabase client directo

⏳ **En progreso:**
- Configuración Vercel para preview live (rama jonathan/backend)
- Sincronización UI mejorado de Galya (rama galya/frontend-ui-v2)

## Stack

### Stack actual de trabajo

- React + Vite
- Supabase PostgreSQL
- GitHub
- Vercel (próximamente)

### Stack heredado o de apoyo

- FastAPI (backend local)
- SQLModel
- SQLite (local development)

### Stack final previsto

- React + Vite
- Tailwind CSS
- Cloudflare Pages / Workers
- Supabase Free

## Estructura del proyecto

- `backend/`: API y base local heredada del MVP inicial
- `frontend/`: interfaz web del CRM
- `supabase/migrations/`: migraciones SQL versionadas para la base de datos final
- `TECHNICAL_DESIGN.md`: documentación técnica del proyecto (heredada)
- `COORDINATION.md`: flujo de trabajo y ramas actuales (LEER ESTO)

## Ramas y Flujo de Desarrollo

| Rama | Propietario | Responsabilidad |
|------|---|---|
| `origin/jonathan/backend` | Jonathan | Backend integrado, documentación contrato |
| `origin/galya/frontend-ui-v2` | Galya | Frontend UI, búsqueda mejorada |
| `origin/main` | — | ⚠️ Obsoleto, no tocar |

**Flujo:** Galya hace push a `galya/frontend-ui-v2` → Jonathan mergea → Deploy automático en Vercel

⚠️ **Lee primero:** [COORDINATION.md](./COORDINATION.md) para entender el setup de Vercel y flujo de trabajo.

## Ejecución Local

**Frontend (Supabase directo):**

```bash
cd "/Users/otanewi/Desktop/Prácticas WinoWin/Proyectos/crm-whatsapp-winowin/frontend"
npm install
npm run dev
```

Abre: `http://localhost:5173`

**Backend heredado (solo si necesario para testing):**

```bash
cd "/Users/otanewi/Desktop/Prácticas WinoWin/Proyectos/crm-whatsapp-winowin"
source backend/.venv_codex/bin/activate
python -m backend.app.main
```

⚠️ Backend local no es necesario para desarrollo; todo usa Supabase directamente.

## Ver en Vivo (Live Preview)

**URL de Vercel:** `https://whatsapp-crm-six-steel.vercel.app` (configurar después de Phase 3 en COORDINATION.md)

Ambos desarrolladores verán los cambios en tiempo real una vez Vercel esté configurado.

## Seguridad y capa intermedia actual

Durante la fase de pruebas, el frontend sigue consultando y registrando datos en Supabase con la clave pública del proyecto.

Para empezar a endurecer la seguridad, las operaciones sensibles ya no se dejan abiertas de forma directa:

- el borrado de contactos ya no se hace con `delete` directo sobre la tabla
- ahora pasa por una función RPC de Supabase (`delete_contact_cascade`)
- las migraciones asociadas están versionadas en `supabase/migrations/`

Esto permite mantener la agilidad del MVP sin dejar toda la lógica crítica expuesta únicamente al cliente web.

## Contrato actual para frontend

Para evitar que frontend invente lógica distinta a la ya acordada, estas son las reglas activas en la rama `jonathan/backend`:

### Estados de Lead (`lead_status`)

- Campo: `contactos.lead_status`
- Valores válidos exactos (minúsculas):
  - `nuevo`
  - `contactado`
  - `cualificado`
  - `perdido`

### Operaciones Seguras vía RPC

**Eliminación de contacto:**
```sql
delete_contact_cascade(p_contact_id INT)
```
- No usar `DELETE` directo desde frontend
- No usar backend heredado para esto

**Actualización de estado:**
```sql
update_contact_lead_status(p_contact_id INT, p_new_status TEXT)
```
- Valores válidos: mismo listado de lead_status
- Cambio es manual; no automatizar con mensajes (por ahora)

### Qué puede asumir frontend

- El selector de estado debe usar exactamente los cuatro valores en minúsculas
- Tras cambiar estado, frontend debe refrescar el contacto o actualizar el estado local
- El cambio de estado es manual; no debe automatizarse todavía al enviar o recibir mensajes
- Cualquier operación sensible debe apoyarse en Supabase RPC y no en rutas antiguas del backend local

## Objetivo

Construir una base de CRM de WhatsApp útil para gestión comercial, con un enfoque rápido, funcional y de bajo coste, manteniendo el desarrollo apoyado en herramientas gratuitas.
