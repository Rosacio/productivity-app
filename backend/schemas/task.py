from pydantic import BaseModel
from datetime import date, time
from typing import Optional

class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    completed: bool = False
    schedule_type: str
    unit: Optional[str] = None
    unit_value: Optional[int] = None
    start_date: Optional[date] = None
    time: Optional[time] = None
    habit_type: Optional[str] = None
    notes: Optional[str] = None
    category_id: int

class TaskCreate(TaskBase):
    pass

class Task(TaskBase):
    id: int

    class Config:
        orm_mode = True
