# CRM de WhatsApp WinoWin

Proyecto de practicas orientado a construir un CRM de WhatsApp para gestion comercial y seguimiento de conversaciones.

## Estado actual

- Backend y base de datos funcionales para pruebas locales
- Interfaz minima para contactos y conversaciones
- Flujo validado con datos ficticios

## Estructura

- `backend/`: API y logica principal
- `frontend/`: interfaz web del CRM
- `TECHNICAL_DESIGN.md`: diseno tecnico del proyecto

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
