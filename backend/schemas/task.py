from pydantic import BaseModel

class TaskBase(BaseModel):
    title: str
    description: str | None = None
    completed: bool = False

class TaskCreate(TaskBase):
    category_id: int

class Task(TaskBase):
    id: int
    category_id: int

    class Config:
        orm_mode = True
