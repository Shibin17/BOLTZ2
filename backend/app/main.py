from fastapi import FastAPI, Depends, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from pydantic import BaseModel
import os
from pathlib import Path

from ..db.session import engine, get_db, Base
from ..models.job import Job
from ..tasks.worker import run_prediction

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Boltz-2 GUI API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic Schemas
class PredictionInput(BaseModel):
    name: str
    sequences: List[Dict[str, Any]]
    params: Optional[Dict[str, Any]] = {}

class JobResponse(BaseModel):
    id: int
    name: str
    status: str
    metrics: Optional[Dict[str, Any]]
    created_at: Any

    class Config:
        from_attributes = True

@app.post("/api/jobs", response_model=JobResponse)
def create_job(input_data: PredictionInput, db: Session = Depends(get_db)):
    # Prepare YAML structure according to Boltz docs
    boltz_input = {
        "version": 1,
        "sequences": input_data.sequences
    }

    # Check if affinity is requested in sequences and add properties if needed
    # (Simplified: frontend should handle most of this logic)

    db_job = Job(
        name=input_data.name,
        inputs=boltz_input,
        params=input_data.params,
        status="pending"
    )
    db.add(db_job)
    db.commit()
    db.refresh(db_job)

    # Trigger worker
    run_prediction.delay(db_job.id)

    return db_job

@app.get("/api/jobs", response_model=List[JobResponse])
def list_jobs(db: Session = Depends(get_db)):
    return db.query(Job).order_by(Job.created_at.desc()).all()

@app.get("/api/jobs/{job_id}")
def get_job(job_id: int, db: Session = Depends(get_db)):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return {
        "id": job.id,
        "name": job.name,
        "status": job.status,
        "metrics": job.metrics,
        "logs": job.logs,
        "results_path": job.results_path,
        "created_at": job.created_at
    }

@app.get("/api/jobs/{job_id}/files")
def list_job_files(job_id: int, db: Session = Depends(get_db)):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job or not job.results_path:
        raise HTTPException(status_code=404, detail="Results not available")

    results_dir = Path(job.results_path)
    if not results_dir.exists():
         raise HTTPException(status_code=404, detail="Result directory not found")

    files = [f.name for f in results_dir.iterdir() if f.is_file()]
    return files

from fastapi.responses import FileResponse
@app.get("/api/jobs/{job_id}/files/{filename}")
def download_job_file(job_id: int, filename: str, db: Session = Depends(get_db)):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job or not job.results_path:
        raise HTTPException(status_code=404, detail="Results not available")

    file_path = Path(job.results_path) / filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")

    return FileResponse(file_path)
