from pydantic import BaseModel, Field, validator, ConfigDict 
from typing import Optional
from datetime import date, time
from enum import Enum

# -----------------------
# Enums for better validation
# -----------------------
class ScheduleType(str, Enum):
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"
    YEARLY = "yearly"
    CUSTOM = "custom"

class UnitType(str, Enum):
    MINUTES = "minutes"
    HOURS = "hours"
    DAYS = "days"
    WEEKS = "weeks"
    MONTHS = "months"

class HabitType(str, Enum):
    HEALTH = "health"
    PRODUCTIVITY = "productivity"
    LEARNING = "learning"
    SOCIAL = "social"
    PERSONAL = "personal"

# -----------------------
# Base (campos comuns)
# -----------------------
class TaskBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200, description="Task title")
    description: Optional[str] = Field(None, max_length=1000, description="Task description")
    schedule_type: Optional[ScheduleType] = Field(None, description="How often the task repeats")
    unit: Optional[UnitType] = Field(None, description="Unit of measurement for task duration")
    unit_value: Optional[int] = Field(None, ge=1, le=10000, description="Value for the unit (e.g., 30 minutes)")
    start_date: Optional[date] = Field(None, description="Start date for the task")
    start_time: Optional[time] = Field(None, description="Start time for the task")
    end_time: Optional[time] = Field(None, description="End time for the task")
    all_day: Optional[bool] = Field(False, description="Whether this is an all-day task")
    habit_type: Optional[HabitType] = Field(None, description="Type/category of habit")
    notes: Optional[str] = Field(None, max_length=2000, description="Additional notes")
    category_id: Optional[int] = Field(None, ge=1, description="ID of the associated category")

    @validator('end_time')
    def validate_end_time(cls, v, values):
        """Ensure end_time is after start_time"""
        if v and 'start_time' in values and values['start_time']:
            if v <= values['start_time']:
                raise ValueError('end_time must be after start_time')
        return v

    @validator('start_date')
    def validate_start_date(cls, v):
        """Ensure start_date is not in the past"""
        if v and v < date.today():
            raise ValueError('start_date cannot be in the past')
        return v

    @validator('unit_value')
    def validate_unit_value_with_unit(cls, v, values):
        """Ensure unit_value is provided when unit is specified"""
        if values.get('unit') and not v:
            raise ValueError('unit_value is required when unit is specified')
        return v

# -----------------------
# Create
# -----------------------
class TaskCreate(TaskBase):
    title: str = Field(..., min_length=1, max_length=200)
    completed: Optional[bool] = Field(False, description="Whether the task is completed")

# -----------------------
# Update (todos opcionais)
# -----------------------
class TaskUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=1000)
    completed: Optional[bool] = Field(None, description="Whether the task is completed")
    schedule_type: Optional[ScheduleType] = None
    unit: Optional[UnitType] = None
    unit_value: Optional[int] = Field(None, ge=1, le=10000)
    start_date: Optional[date] = None
    start_time: Optional[time] = None
    end_time: Optional[time] = None
    all_day: Optional[bool] = None
    habit_type: Optional[HabitType] = None
    notes: Optional[str] = Field(None, max_length=2000)
    category_id: Optional[int] = Field(None, ge=1)

    @validator('end_time')
    def validate_end_time(cls, v, values):
        if v and 'start_time' in values and values['start_time']:
            if v <= values['start_time']:
                raise ValueError('end_time must be after start_time')
        return v

# -----------------------
# Response (inclui id e timestamps)
# -----------------------
class Task(TaskBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    completed: bool = False

# -----------------------
# Forward reference for category (to avoid circular imports)
# -----------------------
from typing import TYPE_CHECKING
if TYPE_CHECKING:
    from backend.schemas.category import Category

# -----------------------
# Response com informações da categoria
# -----------------------
class TaskWithCategory(Task):
    category: Optional["Category"] = None

# -----------------------
# Para listagens paginadas
# -----------------------
class TaskList(BaseModel):
    tasks: list[Task]
    total: int
    page: int
    size: int
    pages: int

    class Config:
        from_attributes = True