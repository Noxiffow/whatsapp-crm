from fastapi import FastAPI, Depends, HTTPException
from sqlmodel import Session, select
from .database import engine, create_db_and_tables, get_session
from .models import Contacto, Conversacion, Mensaje
from typing import List, Optional

app = FastAPI(title="CRM de WhatsApp API", version="0.1.0")


@app.on_event("startup")
def on_startup():
    create_db_and_tables()


@app.get("/")
def read_root():
    return {"message": "CRM de WhatsApp API is running"}


@app.get("/health")
def health_check():
    return {"status": "ok"}


# Contactos endpoints
@app.post("/contactos/", response_model=Contacto)
def create_contacto(contacto: Contacto, session: Session = Depends(get_session)):
    session.add(contacto)
    session.commit()
    session.refresh(contacto)
    return contacto


@app.get("/contactos/", response_model=List[Contacto])
def read_contactos(
    offset: int = 0,
    limit: int = 100,
    lead_status: Optional[str] = None,
    session: Session = Depends(get_session),
):
    query = select(Contacto)
    if lead_status:
        query = query.where(Contacto.lead_status == lead_status)
    contactos = session.exec(query.offset(offset).limit(limit)).all()
    return contactos


@app.get("/contactos/{contacto_id}", response_model=Contacto)
def read_contacto(contacto_id: int, session: Session = Depends(get_session)):
    contacto = session.get(Contacto, contacto_id)
    if not contacto:
        raise HTTPException(status_code=404, detail="Contacto not found")
    return contacto


@app.put("/contactos/{contacto_id}", response_model=Contacto)
def update_contacto(
    contacto_id: int, contacto: Contacto, session: Session = Depends(get_session)
):
    db_contacto = session.get(Contacto, contacto_id)
    if not db_contacto:
        raise HTTPException(status_code=404, detail="Contacto not found")
    contacto_data = contacto.dict(exclude_unset=True)
    for key, value in contacto_data.items():
        setattr(db_contacto, key, value)
    session.add(db_contacto)
    session.commit()
    session.refresh(db_contacto)
    return db_contacto


@app.delete("/contactos/{contacto_id}")
def delete_contacto(contacto_id: int, session: Session = Depends(get_session)):
    contacto = session.get(Contacto, contacto_id)
    if not contacto:
        raise HTTPException(status_code=404, detail="Contacto not found")
    session.delete(contacto)
    session.commit()
    return {"ok": True}


# Conversaciones endpoints
@app.post("/conversaciones/", response_model=Conversacion)
def create_conversacion(
    conversacion: Conversacion, session: Session = Depends(get_session)
):
    session.add(conversacion)
    session.commit()
    session.refresh(conversacion)
    return conversacion


@app.get("/conversaciones/", response_model=List[Conversacion])
def read_conversaciones(
    offset: int = 0,
    limit: int = 100,
    activa: Optional[bool] = None,
    contacto_id: Optional[int] = None,
    session: Session = Depends(get_session),
):
    query = select(Conversacion)
    if activa is not None:
        query = query.where(Conversacion.is_active == activa)
    if contacto_id is not None:
        query = query.where(Conversacion.contacto_id == contacto_id)
    conversaciones = session.exec(query.offset(offset).limit(limit)).all()
    return conversaciones


@app.get("/conversaciones/{conversacion_id}", response_model=Conversacion)
def read_conversacion(conversacion_id: int, session: Session = Depends(get_session)):
    conversacion = session.get(Conversacion, conversacion_id)
    if not conversacion:
        raise HTTPException(status_code=404, detail="Conversacion not found")
    return conversacion


# Mensajes endpoints
@app.post("/conversaciones/{conversacion_id}/messages/", response_model=Mensaje)
def create_mensaje(
    conversacion_id: int,
    mensaje: Mensaje,
    session: Session = Depends(get_session),
):
    conversacion = session.get(Conversacion, conversacion_id)
    if not conversacion:
        raise HTTPException(status_code=404, detail="Conversacion not found")
    mensaje.conversacion_id = conversacion_id
    session.add(mensaje)
    # Update last_message_at of the conversation
    conversacion.last_message_at = mensaje.timestamp
    session.add(conversacion)
    session.commit()
    session.refresh(mensaje)
    return mensaje


@app.get("/mensajes/", response_model=List[Mensaje])
def read_mensajes(
    offset: int = 0,
    limit: int = 100,
    conversacion_id: Optional[int] = None,
    direction: Optional[str] = None,
    session: Session = Depends(get_session),
):
    query = select(Mensaje)
    if conversacion_id is not None:
        query = query.where(Mensaje.conversacion_id == conversacion_id)
    if direction is not None:
        query = query.where(Mensaje.direction == direction)
    mensajes = session.exec(query.offset(offset).limit(limit)).all()
    return mensajes


# Special webhook for simulation
@app.post("/webhooks/simular/")
def simulate_webhook(payload: dict, session: Session = Depends(get_session)):
    """
    Expects payload:
    {
        "whatsapp_number": "+34600111222",
        "content": "Hola, estoy interesado",
        "timestamp": "2026-04-22T10:30:00Z" (optional, defaults to now)
    }
    """
    from datetime import datetime

    whatsapp_number = payload.get("whatsapp_number")
    content = payload.get("content")
    timestamp_str = payload.get("timestamp")
    if timestamp_str:
        timestamp = datetime.fromisoformat(timestamp_str.replace("Z", "+00:00"))
    else:
        timestamp = datetime.utcnow()

    if not whatsapp_number or not content:
        raise HTTPException(status_code=400, detail="whatsapp_number and content required")

    # Find or create contacto
    statement = select(Contacto).where(Contacto.whatsapp_number == whatsapp_number)
    contacto = session.exec(statement).first()
    if not contacto:
        contacto = Contacto(whatsapp_number=whatsapp_number, name="Cliente simulado")
        session.add(contacto)
        session.commit()
        session.refresh(contacto)

    # Find or create an active conversation for this contacto
    statement = select(Conversacion).where(
        Conversacion.contacto_id == contacto.id, Conversacion.is_active == True
    )
    conversacion = session.exec(statement).first()
    if not conversacion:
        conversacion = Conversacion(contacto_id=contacto.id)
        session.add(conversacion)
        session.commit()
        session.refresh(conversacion)

    # Create incoming message
    mensaje = Mensaje(
        conversacion_id=conversacion.id,
        direction="incoming",
        content=content,
        timestamp=timestamp,
        received_at=datetime.utcnow(),
        is_read=False,
        delivery_status="delivered",  # simulated as delivered
    )
    session.add(mensaje)
    # Update conversation last_message_at
    conversacion.last_message_at = timestamp
    session.add(conversacion)
    session.commit()
    session.refresh(mensaje)

    return {"message": "Mensaje simulado creado", "mensaje": mensaje}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
