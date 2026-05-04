# WhatsApp CRM

MVP de CRM para gestión de contactos y conversaciones de WhatsApp.

## Descripción

Este proyecto explora una solución ligera para centralizar conversaciones, contactos y seguimiento comercial en una sola interfaz.

Actualmente permite:

- crear contactos desde la interfaz
- abrir o generar conversaciones asociadas a cada cliente
- registrar mensajes entrantes y salientes
- validar el flujo principal del CRM con datos simulados

## Estado Actual

El proyecto se encuentra en fase MVP con infraestructura en Supabase.

**Estado a 4 de mayo de 2026:**

✅ **Implementado:**
- Contactos, conversaciones y mensajes en Supabase
- Búsqueda por nombre y teléfono
- Validación de formato teléfono (interfaz + BD)
- Eliminación segura vía RPC (`delete_contact_cascade`)
- Actualización de estado lead vía RPC (`update_contact_lead_status`)
- Frontend operativo con Supabase client

⏳ **En progreso:**
- Despliegue en Vercel

## Stack

### Producción

- React + Vite
- Supabase PostgreSQL
- Vercel (deployment)

### Local / Desarrollo Heredado

- FastAPI (backend local, opcional)
- SQLModel
- SQLite

## Estructura

```
.
├── backend/           # API local (heredada, opcional)
├── frontend/          # React + Vite
│   ├── src/
│   ├── package.json
│   ├── vite.config.js
│   ├── vercel.json    # Vercel deployment config
│   └── .vercelignore
├── supabase/
│   └── migrations/    # SQL versioned
└── README.md
```

## Ejecución Local

**Frontend:**

```bash
cd frontend
npm install
npm run dev
```

Abre `http://localhost:5173`

**Backend heredado (opcional, solo testing):**

```bash
source backend/.venv_codex/bin/activate
python -m backend.app.main
```

## Seguridad

Operaciones críticas protegidas vía Supabase RPC (no DELETE directo):

- `delete_contact_cascade(p_contact_id)`
- `update_contact_lead_status(p_contact_id, p_new_status)`

Valores válidos de `lead_status`:
- `nuevo`
- `contactado`
- `cualificado`
- `perdido`

## Ramas

| Rama | Descripción |
|------|---|
| `jonathan/backend` | Rama de integración principal |
| `galya/frontend-ui-v2` | Desarrollo de UI |
| `main` | Desactualizada, no usar |

## Objetivo

Construir un CRM funcional, rápido y de bajo coste para gestión comercial vía WhatsApp.
