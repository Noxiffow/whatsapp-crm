# Diseño Técnico MVP - CRM de WhatsApp
## Versión corregida para contexto real
**Fecha:** 21 de abril de 2026  
**Objetivo:** Diseño técnico ejecutable para MVP en 2 semanas con coste cero

---

## Diagnóstico del Diseño Anterior
El diseño original estaba sobredimensionado para un MVP:
- Dependencia de Railway (coste no deseado)
- Arquitectura por capas excesiva para etapa inicial
- n8n como componente central (no necesario en v1)
- Demasiadas entidades y relaciones complejas
- Decisiones ambigüas (REST o GraphQL, WebSockets o polling)
- Enfoque de 5-6 semanas cuando se requiere 2 semanas
- Autenticación RBAC compleja innecesaria en v1
- Dashboard avanzado y plantillas complejas en v1

## Diseño Técnico MVP Corregido

### 1. Principios Rectores
- **Coste cero**: Usar únicamente servicios gratuitos o locales
- **Velocidad**: Implementación directa, sin abstracciones innecesarias
- **Simplicidad**: Solo lo esencial para validar el concepto
- **Pruebas primero**: Funcionamiento con datos simulados desde día uno
- **Decisiones cerradas**: Evitar ambigüedades que ralenticen desarrollo

### 2. Stack Técnico Definitivo

#### Backend
- **Python 3.11 + FastAPI**: Framework rápido con documentación automática
- **SQLModel**: ORM sencillo (combinación de SQLAlchemy y Pydantic) para reducir boilerplate
- **SQLite**: Base de datos basada en archivos para desarrollo (sin configuración, cero coste)
- **Uvicorn**: Servidor ASGI ligero y rápido

#### Frontend
- **React 18 + Vite**: Build rápido, excelente experiencia de desarrollador
- **Tailwind CSS**: Estilos utilitarios sin CSS custom
- **Axios**: Cliente HTTP simple para comunicación con backend

#### Infraestructura
- **Despliegue local primero**: Todo funciona en máquina de desarrollo
- **GitHub**: Control de versiones y hosting gratuito
- **Variables de entorno**: Para configuración sin cambiar código

#### Testing y Desarrollo
- **Datos ficticios**: Generados en memoria para testing inmediato
- **Webhooks simulados**: Endpoint especial para testing sin WhatsApp real
- **Modo desarrollo**: Flag para cambiar entre datos reales y simulados

### 3. Modelo de Dominio MVP (Entidades Esenciales)

Solo lo estrictamente necesario para validar el concepto:

#### Contacto
- `id`: Integer PK autoincremental
- `whatsapp_number`: Text (formato internacional, único)
- `name`: Text (nombre completo)
- `created_at`: DateTime (timestamp de creación)
- `updated_at`: DateTime (timestamp de actualización)
- `lead_status`: Text (valores: nuevo, contactado, cualificado, perdido) - campo simple
- `notes`: Text (notas internas, opcional) - **simplificación para MVP**: campo único en Contacto en lugar de entidad separada para reducir complejidad inicial

#### Conversación
- `id`: Integer PK autoincremental
- `contact_id`: Integer FK a Contacto
- `started_at`: DateTime
- `last_message_at`: DateTime
- `is_active`: Boolean (por defecto True)

#### Mensaje
- `id`: Integer PK autoincremental
- `conversation_id`: Integer FK a Conversación
- `direction`: Text ('incoming' o 'outgoing')
- `content`: Text
- `timestamp`: DateTime (cuándo se envió/recibió en WhatsApp)
- `received_at`: DateTime (cuándo llegó al sistema)
- `is_read`: Boolean (para mensajes entrantes)
- `delivery_status`: Text (para salientes: 'pending', 'sent', 'delivered', 'read', 'failed') - simplificado

### 4. Relaciones Simplificadas
- Un Contacto puede tener muchas Conversaciones
- Cada Conversación pertenece a un único Contacto
- Cada Conversación puede tener muchos Mensajes
- Cada Mensaje pertenece a una única Conversación

### 5. Endpoints API Esenciales (REST Estricto)

#### Contactos
- `GET /api/contactos` - Listar con filtro opcional por lead_status
- `POST /api/contactos` - Crear nuevo contacto
- `GET /api/contactos/{id}` - Obtener contacto específico
- `PUT /api/contactos/{id}` - Actualizar contacto
- `DELETE /api/contactos/{id}` - Eliminar (soft delete opcional en v1)

#### Conversaciones
- `GET /api/conversaciones` - Listar con filtros (activa, contacto_id)
- `GET /api/conversaciones/{id}` - Obtener conversación con sus mensajes
- `POST /api/conversaciones/{id}/messages` - Enviar nuevo mensaje

#### Mensajes
- `GET /api/mensajes` - Listar con filtros (conversation_id, dirección)
- `POST /api/webhooks/simular` - ENDPOINT ESPECIAL PARA TESTING (ver sección 7)

### 6. Flujo de Trabajo Principal

#### Envío de Mensaje (desde frontend)
1. Usuario escribe mensaje en interfaz de conversación
2. Frontend llama a `POST /api/conversaciones/{id}/messages`
3. Backend crea registro de mensaje con `direction='outgoing'` y `delivery_status='pending'`
4. En modo desarrollo: simula envío exitoso inmediatamente (cambia a 'sent')
5. En modo producción: llamaría a API de WhatsApp real (fase posterior)
6. Frontend actualiza UI con mensaje enviado

#### Recepción de Mensaje (simulada para testing)
1. En modo desarrollo: usuario usa endpoint especial para simular llegada
2. Frontend llama a `POST /api/webhooks/simular` con:
   ```json
   {
     "whatsapp_number": "+34600111222",
     "content": "Hola, estoy interesado en sus servicios",
     "timestamp": "2026-04-21T10:30:00Z"
   }
   ```
3. Backend:
   - Busca o crea contacto por número de WhatsApp
   - Busca o crea conversación activa para ese contacto
   - Crea mensaje con `direction='incoming'` y `is_read=false`
   - Devuelve mensaje creado para actualizar UI en tiempo real

### 7. Estrategia de Testing y Desarrollo

#### Fase 1: Desarrollo con Datos Ficticios (Días 1-4)
- **Modo desarrollo activado** por variable de entorno `DEV_MODE=true`
- Todos los datos se generan en memoria o se insertan al iniciar
- Endpoint especial `/api/webhooks/simular` para probar flujo completo
- Frontend tiene botón "Simular mensaje entrante" para testing
- No se requiere conexión externa ni configuración compleja

#### Fase 2: Preparación para Integración Real (Días 5-10)
- Mantener modo desarrollo como opción
- Añadir configuración para credenciales de WhatsApp Business API
- Preparar estructura para llamadas reales a API de WhatsApp
- Mantener endpoint de simulación disponible para testing continuo

#### Fase 3: Validación con WhatsApp Real (Opcional post-MVP)
- Desactivar `DEV_MODE` y configurar credenciales reales
- Usar endpoint webhook real de WhatsApp
- Enviar mensajes reales mediante API de WhatsApp Business
- **Esta fase es opcional para el MVP** - se puede validar con simulación
- **Importante**: La integración con Meta Developer o WhatsApp real pertenece exclusivamente a esta fase de validación final y **NO** es una dependencia para arrancar o desarrollar el MVP. El sistema debe poder desarrollarse, probarse y demostrarse completamente con simulación antes de considerar esta fase.

### 8. Arquitectura de Código Simple

```
backend/
  ├── app/
  │   ├── main.py              # FastAPI app instance
  │   ├── database.py          # SQLModel engine y session handling
  │   ├── models.py            # SQLModel definitions (Contacto, Conversación, Mensaje)
  │   ├── routers/
  │   │   ├── contactos.py     # Endpoints de contacto
  │   │   ├── conversaciones.py # Endpoints de conversación y mensajes
  │   │   └── webhooks.py      # Webhook de simulación
  │   └── dependencies.py      # Dependencias comunes (db session)
  ├── requirements.txt         # Dependencias mínimas
  └── .env.example             # Variables de entorno ejemplo

frontend/
  ├── src/
  │   ├── components/          # React components simples
  │   │   ├── ContactList.jsx
  │   │   ├── ConversationView.jsx
  │   │   └── MessageInput.jsx
  │   ├── App.jsx
  │   └── main.jsx
  ├── package.json
  └── vite.config.js
```

### 9. Decisiones Técnicas Cerradas y Justificadas

- **API REST**: Elegida sobre GraphQL por simplicidad y menor curva de aprendizaje para MVP
- **SQLite sobre PostgreSQL**: Para desarrollo inmediato sin servicios externos; se puede migrar fácilmente después
- **SQLModel sobre SQLAlchemy puro**: Reduce código boilerplate manteniendo potencia
- **React + Vite + Tailwind**: Stack moderno con desarrollo rápido y excelente DX
- **Autenticación mínima**: MVP sin sistema de login ni roles; pensado para uso individual o entorno demo controlado; se puede extender con autenticación básica en fases posteriores si se requiere multi-usuario
- **Sin WebSockets**: Polling simple cada 3 segundos es suficiente para validación inicial
- **Sin n8n**: Lógica de automatización simple puede ir en endpoints si se necesita; no es bloqueante
- **Sin dashboard avanzado**: Lista de contactos y vista de conversación son suficientes para validar concepto
- **Sin plantillas complejas**: Campo de texto libre para mensajes; plantillas pueden venir después
- **Despliegue local primero**: Eliminar dependencia de servicios externos para desarrollo

### 10. Roadmap Ejecutable (2 Semanas)

**Semana 1: Núcleo Funcional**
- Día 1-2: Setup proyecto, modelos SQLModel, base de datos SQLite
- Día 3-4: Endpoints CRUD básicos para contactos y conversaciones
- Día 5: Endpoint de envío de mensajes y vista de conversación básica
- Día 6-7: Endpoint de simulación de mensajes entrantes, testing de flujo completo

**Semana 2: Pulido y Preparación**
- Día 8-9: Frontend React básico con lista de contactos y vista de conversación
- Día 10-11: Integración frontend-backend, manejo de estados de carga/error
- Día 12-13: Testing con datos ficticios, simulación de diversos escenarios
- Día 14: Documentación de uso, preparación para revisión

### 11. Variables de Entorno Esenciales

```
# .env.example
DEV_MODE=true                    # Activar datos ficticios y endpoint de simulación
WHATSAPP_TOKEN=                  # Para fase futura (dejar vacío en dev)
WHATSAPP_PHONE_NUMBER_ID=        # Para fase futura (dejar vacío en dev)
PORT=8000                        # Puerto backend
FRONTEND_PORT=5173               # Puerto frontend Vite
```

### 12. Próximos Pasos Inmediatos

1. Crear estructura de directorios propuesta
2. Inicializar repositorio Git con README básico
3. Implementar modelos SQLModel según sección 3
4. Crear endpoint de simulación de mensajes (más importante para validación rápida)
5. Desarrollar frontend mínimo que pueda:
   - Mostrar lista de contactos
   - Abrir conversación y ver historial
   - Enviar nuevos mensajes
   - Simular llegada de mensajes entrantes para testing

Este diseño técnico MVP elimina toda complejidad innecesaria, se enfoca en lo esencial para validar el concepto de CRM de WhatsApp, y permite un desarrollo rápido en aproximadamente 2 semanas con coste cero utilizando solo herramientas gratuitas y locales.