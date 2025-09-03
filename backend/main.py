from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Allow frontend (Expo) to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # for development only, allow all
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dummy data
tasks = [
    {"id": 1, "title": "Study React Native", "hours": 2},
    {"id": 2, "title": "Workout", "hours": 1},
    {"id": 3, "title": "Drink water", "hours": 0.5},
]

@app.get("/tasks")
def get_tasks():
    return tasks
