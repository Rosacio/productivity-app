from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Date, Time
from sqlalchemy.orm import relationship
from backend.database import Base

class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(String, nullable=True)
    completed = Column(Boolean, default=False)

    schedule_type = Column(String, nullable=False)  # "weekly", "daily", etc.
    unit = Column(String, nullable=True)            # e.g., "minutes"
    unit_value = Column(Integer, nullable=True)     # e.g., 30
    start_date = Column(Date, nullable=True)        # e.g., 2025-09-08
    start_time = Column(Time, nullable=True)        # e.g., 08:00
    end_time = Column(Time, nullable=True)          # e.g., 09:00
    all_day = Column(Boolean, default=False)  # all-day event
    habit_type = Column(String, nullable=True)      # e.g., "health"
    notes = Column(String, nullable=True)           # extra notes

    category_id = Column(Integer, ForeignKey("categories.id"))
    category = relationship("Category", back_populates="tasks")


