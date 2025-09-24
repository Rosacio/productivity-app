from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from backend import database
from backend.crud import task as task_crud, category as category_crud
from backend.schemas import task as task_schemas, category as category_schemas
from backend.models import task as task_models, category as category_models
from fastapi.middleware.cors import CORSMiddleware

# Cria a app FastAPI
app = FastAPI(
    title="Productivity API",
    description="Backend para gerir tarefas, categorias e rotinas",
    version="0.1.0",
)

# Adiciona o middleware de CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Ou especifique a URL do seu frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Criar as tabelas na BD (caso não existam)
task_models.Base.metadata.create_all(bind=database.engine)
category_models.Base.metadata.create_all(bind=database.engine)


# -------------------------------
# 🟦 Rotas para Tasks
# -------------------------------
@app.post(
    "/tasks/", 
    response_model=task_schemas.Task,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new task",
    description="Create a new task with the given details."
)
def create_task(task: task_schemas.TaskCreate, db: Session = Depends(database.get_db)):
    return task_crud.create_task(db, task)

@app.get(
    "/tasks/", 
    response_model=list[task_schemas.Task],
    summary="Get all tasks",
    description="Retrieve a list of all tasks."
)
def read_tasks(
    skip: int = 0, 
    limit: int = 100,
    db: Session = Depends(database.get_db)
):
    return task_crud.get_tasks(db)

@app.get(
    "/tasks/{task_id}", 
    response_model=task_schemas.Task,
    summary="Get task by ID",
    description="Retrieve a specific task by its ID"
)
def read_task(task_id: int, db: Session = Depends(database.get_db)):
    db_task = task_crud.get_task(db, task_id)
    if db_task is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail=f"Task with id {task_id} not found"
        )
    return db_task

@app.put(
    "/tasks/{task_id}", 
    response_model=task_schemas.Task,
    summary="Update task",
    description="Update an existing task with new data"
)
def update_task(
    task_id: int, 
    task: task_schemas.TaskUpdate, 
    db: Session = Depends(database.get_db)
):
    db_task = task_crud.update_task(db, task_id, task)
    if db_task is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail=f"Task with id {task_id} not found"
        )
    return db_task

@app.delete(
    "/tasks/{task_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete task",
    description="Delete a task by its ID"
)
def delete_task(task_id: int, db: Session = Depends(database.get_db)):
    success = task_crud.delete_task(db, task_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail=f"Task with id {task_id} not found"
        )


# -------------------------------
# 🟩 Rotas para Categories
# -------------------------------
@app.post("/categories/", response_model=category_schemas.Category)
def create_category(category: category_schemas.CategoryCreate, db: Session = Depends(database.get_db)):
    return category_crud.create_category(db, category)


@app.get("/categories/", response_model=list[category_schemas.Category])
def read_categories(db: Session = Depends(database.get_db)):
    return category_crud.get_categories(db)
