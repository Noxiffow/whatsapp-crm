# WhatsApp CRM

MVP de CRM para gestion de contactos y conversaciones de WhatsApp.

## Descripcion

Este proyecto explora una solucion ligera para centralizar conversaciones, contactos y seguimiento comercial en una sola interfaz.

Actualmente incluye una base funcional para:

- registrar contactos
- abrir conversaciones asociadas a cada cliente
- visualizar mensajes entrantes y salientes
- simular mensajes para pruebas locales

## Estado actual

El proyecto se encuentra en fase MVP.

- Backend funcional con API y base de datos local
- Frontend minimo para validacion de flujo
- Pruebas realizadas con datos ficticios

## Stack

- FastAPI
- SQLModel
- SQLite
- React
- Vite

## Estructura del proyecto

- `backend/`: API, modelos y logica principal
- `frontend/`: interfaz web del CRM
- `TECHNICAL_DESIGN.md`: documentacion tecnica del proyecto

## Ejecucion local

Backend:

```bash
cd "/Users/otanewi/Desktop/Prácticas WinoWin/Proyectos/crm-whatsapp-winowin"
source backend/.venv_codex/bin/activate
python -m backend.app.main
```

Frontend:

```bash
cd "/Users/otanewi/Desktop/Prácticas WinoWin/Proyectos/crm-whatsapp-winowin/frontend"
npm run dev
```

## Objetivo

Construir una base de CRM de WhatsApp util para gestion comercial, con un enfoque rapido, funcional y de bajo coste.
