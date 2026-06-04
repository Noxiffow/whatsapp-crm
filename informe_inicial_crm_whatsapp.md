# INFORME INICIAL DE PROYECTO

**PROYECTO:** CRM de WhatsApp para gestión comercial y atención al cliente  
**FECHA:** Lunes, 20 de abril de 2026  
**ALUMNO:** Jonathan Neto  
**EMPRESA:** WinoWin

---

## 1. Resumen ejecutivo

El presente informe tiene como objetivo definir el alcance inicial del proyecto de desarrollo de un CRM de WhatsApp orientado a centralizar conversaciones, mejorar la atención al cliente y optimizar el seguimiento comercial de la empresa.

Un CRM de WhatsApp permite convertir WhatsApp en un canal de trabajo estructurado, donde los mensajes dejan de depender de un único móvil o de una gestión manual y pasan a integrarse en un sistema con historial, clasificación de clientes, automatizaciones y control del equipo.

El proyecto se plantea como una solución escalable, pensada para ayudar a la empresa a gestionar contactos, oportunidades de venta, soporte postventa y seguimiento de conversaciones desde una única plataforma.

---

## 2. Qué se entiende por un CRM de WhatsApp

Un CRM de WhatsApp es un sistema que conecta el canal de mensajería de WhatsApp con una base de datos de clientes, procesos internos y herramientas de gestión comercial.

Su función principal no es solo enviar y recibir mensajes, sino:

- Centralizar todas las conversaciones con clientes en un único entorno
- Asociar cada conversación a una ficha de cliente
- Registrar historial de interacciones, notas y estados comerciales
- Automatizar respuestas, recordatorios y asignaciones
- Facilitar el seguimiento de leads, ventas e incidencias
- Medir tiempos de respuesta, volumen de conversaciones y resultados

En términos prácticos, el CRM de WhatsApp transforma un canal de comunicación informal en una herramienta profesional de ventas, soporte y fidelización.

---

## 3. Objetivos del proyecto

Los objetivos principales de este proyecto son los siguientes:

- Diseñar una plataforma que centralice toda la comunicación de WhatsApp de la empresa
- Permitir la gestión estructurada de clientes, leads y conversaciones
- Reducir tiempos de respuesta mediante automatizaciones y plantillas
- Evitar pérdida de información o seguimiento por depender de chats individuales
- Mejorar la trazabilidad comercial y el control del embudo de ventas
- Crear una base tecnológica escalable para futuras integraciones

---

## 4. Problemas que resuelve a una empresa

La implantación de un CRM de WhatsApp resuelve varios problemas habituales en empresas que usan WhatsApp como canal principal de contacto:

### 4.1 Desorganización de conversaciones

Cuando los mensajes están repartidos entre varios dispositivos o personas, resulta difícil mantener un seguimiento claro. El CRM centraliza toda la información y evita duplicidades o pérdidas.

### 4.2 Falta de trazabilidad comercial

Sin un sistema estructurado, muchos leads no se registran correctamente y se pierden oportunidades de venta. El CRM permite identificar en qué punto del proceso se encuentra cada cliente.

### 4.3 Dependencia de una sola persona

Si la atención depende de un único empleado o de un único teléfono, la empresa corre un riesgo operativo. Un CRM permite continuidad del servicio y trabajo colaborativo.

### 4.4 Respuestas lentas o inconsistentes

La automatización de mensajes, plantillas y flujos reduce tiempos de respuesta y mejora la coherencia de la atención prestada.

### 4.5 Ausencia de métricas

Sin una herramienta de gestión es difícil medir resultados. El CRM permite analizar conversaciones, tiempos de atención, conversión y volumen de actividad.

### 4.6 Dificultad para escalar

Lo que funciona con pocos clientes deja de ser sostenible cuando aumenta el volumen. El CRM crea una base para crecer de forma ordenada.

---

## 5. Tecnologías que se prevé implementar

Para el desarrollo del proyecto se propone una arquitectura moderna, ligera y escalable. Las tecnologías previstas son las siguientes:

### 5.1 Backend

- **FastAPI (Python):** para construir la API principal del sistema
- **Pydantic:** para validación de datos y esquemas
- **SQLAlchemy:** para gestión ORM y acceso a base de datos
- **Alembic:** para migraciones de base de datos

### 5.2 Base de datos

- **PostgreSQL:** como base de datos principal para clientes, conversaciones, estados y actividad comercial

### 5.3 Integración con WhatsApp

- **WhatsApp Business API / Meta Cloud API:** para recepción y envío de mensajes
- **Webhooks:** para capturar eventos en tiempo real y procesarlos desde el backend

### 5.4 Automatización y flujos

- **n8n:** para automatizaciones internas, disparadores, notificaciones y conexión con otros servicios

### 5.5 Frontend / panel de gestión

- **HTML, CSS y JavaScript** o un frontend más estructurado según necesidad del proyecto
- Posibilidad de evolucionar a una interfaz más completa para agentes, embudo comercial y panel de métricas

### 5.6 Infraestructura y despliegue

- **Railway** o plataforma equivalente para despliegue rápido del backend y servicios asociados
- **GitHub** para control de versiones y seguimiento del desarrollo

### 5.7 Funcionalidades avanzadas opcionales

- **OpenAI API:** para clasificar conversaciones, resumir chats, sugerir respuestas o automatizar tareas de soporte
- **Sistema de roles y autenticación:** para diferenciar administradores, comerciales y agentes de soporte

---

## 6. Alcance funcional inicial

En esta primera fase se propone desarrollar un MVP con las siguientes capacidades:

- Registro y visualización de contactos/clientes
- Recepción y almacenamiento de mensajes entrantes de WhatsApp
- Envío de mensajes desde la plataforma
- Historial de conversación por cliente
- Estados comerciales básicos del lead o cliente
- Asignación de conversaciones a usuarios internos
- Etiquetas, notas internas y filtros
- Panel básico de seguimiento de actividad
- Automatizaciones iniciales para respuestas y avisos

Este alcance permitirá validar el valor real del sistema antes de abordar funciones más avanzadas.

---

## 7. Fases de desarrollo y duración estimada

La planificación inicial del proyecto se divide en seis fases:

### Fase 1. Análisis y definición funcional

- **Fechas estimadas:** del 20 de abril de 2026 al 24 de abril de 2026
- **Duración:** 1 semana
- **Objetivo:** definir necesidades reales de la empresa, alcance del MVP, usuarios del sistema y casos de uso principales

### Fase 2. Diseño técnico y arquitectura

- **Fechas estimadas:** del 27 de abril de 2026 al 1 de mayo de 2026
- **Duración:** 1 semana
- **Objetivo:** preparar la arquitectura del sistema, modelo de datos, estructura del backend y estrategia de integración con WhatsApp

### Fase 3. Desarrollo del núcleo del CRM

- **Fechas estimadas:** del 4 de mayo de 2026 al 15 de mayo de 2026
- **Duración:** 2 semanas
- **Objetivo:** implementar base de datos, gestión de clientes, conversaciones, estados y endpoints principales

### Fase 4. Integración con WhatsApp y automatizaciones

- **Fechas estimadas:** del 18 de mayo de 2026 al 29 de mayo de 2026
- **Duración:** 2 semanas
- **Objetivo:** conectar la API de WhatsApp, procesar webhooks, habilitar envío y recepción de mensajes y automatizaciones iniciales

### Fase 5. Pruebas, validación y ajustes

- **Fechas estimadas:** del 1 de junio de 2026 al 5 de junio de 2026
- **Duración:** 1 semana
- **Objetivo:** realizar pruebas funcionales, detectar errores, optimizar flujos y validar el sistema con un entorno controlado

### Fase 6. Despliegue inicial y cierre de primera versión

- **Fechas estimadas:** del 8 de junio de 2026 al 12 de junio de 2026
- **Duración:** 1 semana
- **Objetivo:** desplegar la primera versión operativa, documentar el sistema y dejar preparado el siguiente ciclo de mejoras

---

## 8. Fecha final estimada del proyecto

La **fecha final estimada de esta primera versión del proyecto** queda fijada en:

**12 de junio de 2026**

Esta fecha corresponde al cierre del MVP funcional, sujeto a ajustes razonables según la complejidad real de la integración con WhatsApp y la validación interna con la empresa.

---

## 9. Riesgos y consideraciones

Aunque el proyecto es viable, existen ciertos factores que pueden afectar al calendario:

- Tiempos de configuración o validación de la API de WhatsApp Business
- Cambios de alcance durante el desarrollo
- Necesidad de adaptar procesos internos de la empresa al nuevo sistema
- Complejidad añadida si se incluyen funciones avanzadas desde fases tempranas

Por ello, se recomienda construir primero una versión práctica y estable, y dejar las ampliaciones más complejas para iteraciones posteriores.

---

## 10. Conclusión

El desarrollo de un CRM de WhatsApp representa una oportunidad clara para profesionalizar la comunicación con clientes, mejorar el control comercial y crear una infraestructura digital más escalable dentro de la empresa.

La propuesta inicial plantea un desarrollo por fases, con un MVP realista, tecnologías adecuadas para un despliegue ágil y una fecha estimada de finalización situada en el 12 de junio de 2026.

Si se ejecuta correctamente, este proyecto puede convertirse en una herramienta clave para mejorar la atención, aumentar la eficiencia del equipo y reforzar la gestión comercial de la empresa.
