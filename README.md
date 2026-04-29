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

El proyecto se encuentra en fase MVP, con la validación funcional del flujo principal ya migrada a Supabase.

Estado real a 29 de abril de 2026:

- contactos, conversaciones y mensajes funcionando en Supabase
- frontend mínimo operativo para testing
- validación básica del formato del teléfono aplicada en interfaz y en base de datos
- borrado de contactos movido a una función RPC segura de Supabase para evitar eliminación directa desde frontend
- backend local de FastAPI conservado como base heredada de validación inicial, pero ya no es el flujo principal de pruebas
- trabajo visual del frontend en paralelo con Galya

## Stack

### Stack actual de trabajo

- React + Vite
- Supabase
- GitHub

### Stack heredado o de apoyo

- FastAPI
- SQLModel
- SQLite

### Stack final previsto

- React + Vite
- Tailwind CSS
- Cloudflare Pages / Workers
- Supabase Free

## Estructura del proyecto

- `backend/`: API y base local heredada del MVP inicial
- `frontend/`: interfaz web del CRM
- `supabase/migrations/`: migraciones SQL versionadas para la base de datos final
- `TECHNICAL_DESIGN.md`: documentación técnica del proyecto

## Ejecución local

Frontend:

```bash
cd "/Users/otanewi/Desktop/Prácticas WinoWin/Proyectos/crm-whatsapp-winowin/frontend"
npm install
npm run dev
```

Si se necesita levantar también la base local heredada:

```bash
cd "/Users/otanewi/Desktop/Prácticas WinoWin/Proyectos/crm-whatsapp-winowin"
source backend/.venv_codex/bin/activate
python -m backend.app.main
```

## Seguridad y capa intermedia actual

Durante la fase de pruebas, el frontend sigue consultando y registrando datos en Supabase con la clave pública del proyecto.

Para empezar a endurecer la seguridad, las operaciones sensibles ya no se dejan abiertas de forma directa:

- el borrado de contactos ya no se hace con `delete` directo sobre la tabla
- ahora pasa por una función RPC de Supabase (`delete_contact_cascade`)
- las migraciones asociadas están versionadas en `supabase/migrations/`

Esto permite mantener la agilidad del MVP sin dejar toda la lógica crítica expuesta únicamente al cliente web.

## Objetivo

Construir una base de CRM de WhatsApp útil para gestión comercial, con un enfoque rápido, funcional y de bajo coste, manteniendo el desarrollo apoyado en herramientas gratuitas.
