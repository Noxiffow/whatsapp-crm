from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime
from typing import Optional, List


class Contacto(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    whatsapp_number: str = Field(index=True, unique=True)
    name: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    lead_status: str = Field(default="nuevo")  # nuevo, contactado, cualificado, perdido
    notes: Optional[str] = None

    conversaciones: List["Conversacion"] = Relationship(back_populates="contacto")


class Conversacion(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    contacto_id: int = Field(foreign_key="contacto.id")
    started_at: datetime = Field(default_factory=datetime.utcnow)
    last_message_at: datetime = Field(default_factory=datetime.utcnow)
    is_active: bool = True

    contacto: Optional[Contacto] = Relationship(back_populates="conversaciones")
    mensajes: List["Mensaje"] = Relationship(back_populates="conversacion")


class Mensaje(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    conversacion_id: int = Field(foreign_key="conversacion.id")
    direction: str  # 'incoming' or 'outgoing'
    content: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)  # when sent/received in WhatsApp
    received_at: datetime = Field(default_factory=datetime.utcnow)  # when arrived in system
    is_read: bool = False  # for incoming messages
    delivery_status: str = Field(default="pending")  # pending, sent, delivered, read, failed

    conversacion: Optional[Conversacion] = Relationship(back_populates="mensajes")