from pydantic import BaseModel
from typing import Optional
from datetime import date, time

# -----------------------
# Base (campos comuns)
# -----------------------
class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    schedule_type: Optional[str] = None
    unit: Optional[str] = None
    unit_value: Optional[int] = None
    start_date: Optional[date] = None
    time: Optional[time] = None
    habit_type: Optional[str] = None
    notes: Optional[str] = None
    category_id: Optional[int] = None

# -----------------------
# Create
# -----------------------
class TaskCreate(TaskBase):
    title: str  # obrigatório no create

# -----------------------
# Update (todos opcionais)
# -----------------------
class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    schedule_type: Optional[str] = None
    unit: Optional[str] = None
    unit_value: Optional[int] = None
    start_date: Optional[date] = None
    time: Optional[time] = None
    habit_type: Optional[str] = None
    notes: Optional[str] = None
    category_id: Optional[int] = None

# -----------------------
# Response (inclui id)
# -----------------------
class Task(TaskBase):
    id: int

    class Config:
        orm_mode = True  # permite retornar modelos SQLAlchemy
