from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
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
@app.post("/tasks/", response_model=task_schemas.Task)
def create_task(task: task_schemas.TaskCreate, db: Session = Depends(database.get_db)):
    return task_crud.create_task(db, task)

@app.get("/tasks/", response_model=list[task_schemas.Task])
def read_tasks(db: Session = Depends(database.get_db)):
    return task_crud.get_tasks(db)

@app.get("/tasks/{task_id}", response_model=task_schemas.Task)
def read_task(task_id: int, db: Session = Depends(database.get_db)):
    db_task = task_crud.get_task(db, task_id)
    if db_task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    return db_task

@app.put("/tasks/{task_id}", response_model=task_schemas.Task)
def update_task(task_id: int, task: task_schemas.TaskUpdate, db: Session = Depends(database.get_db)):
    db_task = task_crud.update_task(db, task_id, task)
    if db_task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    return db_task

@app.delete("/tasks/{task_id}")
def delete_task(task_id: int, db: Session = Depends(database.get_db)):
    success = task_crud.delete_task(db, task_id)
    if not success:
        raise HTTPException(status_code=404, detail="Task not found")
    return {"detail": "Task deleted successfully"}


# -------------------------------
# 🟩 Rotas para Categories
# -------------------------------
@app.post("/categories/", response_model=category_schemas.Category)
def create_category(category: category_schemas.CategoryCreate, db: Session = Depends(database.get_db)):
    return category_crud.create_category(db, category)


@app.get("/categories/", response_model=list[category_schemas.Category])
def read_categories(db: Session = Depends(database.get_db)):
    return category_crud.get_categories(db)
