from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Date, Time, DateTime, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from backend.database import Base

class Task(Base):
    __tablename__ = "tasks"

    # Primary key
    id = Column(Integer, primary_key=True, index=True)
    
    # Basic task info
    title = Column(String(200), nullable=False, index=True)
    description = Column(Text, nullable=True)
    completed = Column(Boolean, default=False, nullable=False, index=True)
    
    # Schedule and timing
    schedule_type = Column(String(20), nullable=True, index=True)  # "weekly", "daily", etc.
    unit = Column(String(20), nullable=True)                      # e.g., "minutes"
    unit_value = Column(Integer, nullable=True)                   # e.g., 30
    start_date = Column(Date, nullable=True, index=True)          # e.g., 2025-09-08
    start_time = Column(Time, nullable=True)                      # e.g., 08:00
    end_time = Column(Time, nullable=True)                        # e.g., 09:00
    all_day = Column(Boolean, default=False, nullable=False)      # all-day event
    
    # Categorization
    habit_type = Column(String(50), nullable=True, index=True)    # e.g., "health"
    notes = Column(Text, nullable=True)                           # extra notes
    
    # Relationships
    category_id = Column(Integer, ForeignKey("categories.id", ondelete="SET NULL"), nullable=True, index=True)
    category = relationship("Category", back_populates="tasks")
    
    def __repr__(self):
        return f"<Task(id={self.id}, title='{self.title}', completed={self.completed})>"
    
    def __str__(self):
        return self.title

    # Método de conveniência para marcar como completa
    def mark_completed(self):
        """Mark task as completed"""
        self.completed = True
    
    # Método de conveniência para marcar como incompleta
    def mark_incomplete(self):
        """Mark task as incomplete"""
        self.completed = False
    
    # Propriedade para verificar se a tarefa está atrasada
    @property
    def is_overdue(self):
        """Check if task is overdue"""
        if not self.start_date or self.completed:
            return False
        
        from datetime import date
        return self.start_date < date.today()
    
    # Propriedade para obter duração em minutos
    @property
    def duration_minutes(self):
        """Get task duration in minutes"""
        if not self.start_time or not self.end_time:
            return None
        
        from datetime import datetime, timedelta
        start = datetime.combine(datetime.min, self.start_time)
        end = datetime.combine(datetime.min, self.end_time)
        
        # Handle case where end time is next day
        if end < start:
            end += timedelta(days=1)
        
        duration = end - start
        return int(duration.total_seconds() / 60)


