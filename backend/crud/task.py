from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_, or_, desc, asc
from typing import Optional, List
from datetime import date, datetime
from backend.models import task as models
from backend.schemas import task as schemas


def create_task(db: Session, task: schemas.TaskCreate) -> models.Task:
    """Create a new task"""
    db_task = models.Task(**task.dict())
    db.add(db_task)
    try:
        db.commit()
        db.refresh(db_task)
        return db_task
    except Exception as e:
        db.rollback()
        raise e


def get_tasks(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    completed: Optional[bool] = None,
    category_id: Optional[int] = None,
    schedule_type: Optional[str] = None,
    habit_type: Optional[str] = None,
    overdue_only: bool = False,
    include_category: bool = False
) -> List[models.Task]:
    """Get tasks with optional filtering"""
    query = db.query(models.Task)
    
    # Add joins if needed
    if include_category:
        query = query.options(joinedload(models.Task.category))
    
    # Apply filters
    if completed is not None:
        query = query.filter(models.Task.completed == completed)
    
    if category_id is not None:
        query = query.filter(models.Task.category_id == category_id)
    
    if schedule_type is not None:
        query = query.filter(models.Task.schedule_type == schedule_type)
    
    if habit_type is not None:
        query = query.filter(models.Task.habit_type == habit_type)
    
    if overdue_only:
        today = date.today()
        query = query.filter(
            and_(
                models.Task.start_date < today,
                models.Task.completed == False
            )
        )
    
    # Order by creation date (newest first) and then by start_date
    query = query.order_by(asc(models.Task.start_date))
    
    return query.offset(skip).limit(limit).all()


def get_task(db: Session, task_id: int, include_category: bool = False) -> Optional[models.Task]:
    """Get a specific task by ID"""
    query = db.query(models.Task)
    
    if include_category:
        query = query.options(joinedload(models.Task.category))
    
    return query.filter(models.Task.id == task_id).first()


def get_tasks_by_category(
    db: Session, 
    category_id: int, 
    skip: int = 0, 
    limit: int = 100,
    completed: Optional[bool] = None
) -> List[models.Task]:
    """Get all tasks for a specific category"""
    query = db.query(models.Task).filter(models.Task.category_id == category_id)
    
    if completed is not None:
        query = query.filter(models.Task.completed == completed)
    
    return query.order_by(desc(models.Task.created_at)).offset(skip).limit(limit).all()


def get_tasks_count(
    db: Session,
    completed: Optional[bool] = None,
    category_id: Optional[int] = None
) -> int:
    """Get total count of tasks with optional filtering"""
    query = db.query(models.Task)
    
    if completed is not None:
        query = query.filter(models.Task.completed == completed)
    
    if category_id is not None:
        query = query.filter(models.Task.category_id == category_id)
    
    return query.count()


def update_task(
    db: Session, 
    task_id: int, 
    task_update: schemas.TaskUpdate,
    partial: bool = True
) -> Optional[models.Task]:
    """Update an existing task"""
    db_task = db.query(models.Task).filter(models.Task.id == task_id).first()
    
    if not db_task:
        return None
    
    # Get update data, excluding unset values if partial update
    if partial:
        update_data = task_update.dict(exclude_unset=True)
    else:
        update_data = task_update.dict()
    
    # Remove None values to avoid overwriting with None
    update_data = {k: v for k, v in update_data.items() if v is not None}
    
    # Apply updates
    for key, value in update_data.items():
        if hasattr(db_task, key):
            setattr(db_task, key, value)
    
    try:
        db.commit()
        db.refresh(db_task)
        return db_task
    except Exception as e:
        db.rollback()
        raise e


def mark_task_completed(db: Session, task_id: int) -> Optional[models.Task]:
    """Mark a task as completed"""
    db_task = db.query(models.Task).filter(models.Task.id == task_id).first()
    
    if not db_task:
        return None
    
    db_task.mark_completed()
    
    try:
        db.commit()
        db.refresh(db_task)
        return db_task
    except Exception as e:
        db.rollback()
        raise e


def mark_task_incomplete(db: Session, task_id: int) -> Optional[models.Task]:
    """Mark a task as incomplete"""
    db_task = db.query(models.Task).filter(models.Task.id == task_id).first()
    
    if not db_task:
        return None
    
    db_task.mark_incomplete()
    
    try:
        db.commit()
        db.refresh(db_task)
        return db_task
    except Exception as e:
        db.rollback()
        raise e


def delete_task(db: Session, task_id: int) -> bool:
    """Delete a task"""
    db_task = db.query(models.Task).filter(models.Task.id == task_id).first()
    
    if not db_task:
        return False
    
    try:
        db.delete(db_task)
        db.commit()
        return True
    except Exception as e:
        db.rollback()
        raise e


def search_tasks(
    db: Session,
    search_term: str,
    skip: int = 0,
    limit: int = 100
) -> List[models.Task]:
    """Search tasks by title, description, or notes"""
    search_pattern = f"%{search_term}%"
    
    return db.query(models.Task).filter(
        or_(
            models.Task.title.ilike(search_pattern),
            models.Task.description.ilike(search_pattern),
            models.Task.notes.ilike(search_pattern)
        )
    )


def get_overdue_tasks(db: Session, limit: int = 100) -> List[models.Task]:
    """Get all overdue tasks"""
    today = date.today()
    
    return db.query(models.Task).filter(
        and_(
            models.Task.start_date < today,
            models.Task.completed == False
        )
    ).order_by(asc(models.Task.start_date)).limit(limit).all()


def get_today_tasks(db: Session) -> List[models.Task]:
    """Get all tasks scheduled for today"""
    today = date.today()
    
    return db.query(models.Task).filter(
        models.Task.start_date == today
    ).order_by(asc(models.Task.start_time)).all()


def get_upcoming_tasks(db: Session, days: int = 7, limit: int = 100) -> List[models.Task]:
    """Get upcoming tasks within specified days"""
    from datetime import timedelta
    
    today = date.today()
    future_date = today + timedelta(days=days)
    
    return db.query(models.Task).filter(
        and_(
            models.Task.start_date >= today,
            models.Task.start_date <= future_date,
            models.Task.completed == False
        )
    ).order_by(asc(models.Task.start_date), asc(models.Task.start_time)).limit(limit).all()