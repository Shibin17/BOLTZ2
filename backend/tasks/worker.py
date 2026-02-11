import os
import subprocess
import yaml
import json
import shutil
from celery import Celery
from ..db.session import SessionLocal
from ..models.job import Job
from pathlib import Path

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
celery_app = Celery("tasks", broker=REDIS_URL, backend=REDIS_URL)

BASE_DATA_DIR = Path("/app/sandbox/session_20260211_104554_d675a515d93c/data/jobs")
BASE_DATA_DIR.mkdir(parents=True, exist_ok=True)

@celery_app.task(bind=True)
def run_prediction(self, job_id: int):
    db = SessionLocal()
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        return "Job not found"

    job.status = "running"
    db.commit()

    job_dir = BASE_DATA_DIR / str(job.id)
    job_dir.mkdir(parents=True, exist_ok=True)

    input_yaml_path = job_dir / "input.yaml"
    output_dir = job_dir / "output"
    output_dir.mkdir(parents=True, exist_ok=True)

    try:
        # Prepare YAML input
        # Note: job.inputs should be a dict matching Boltz YAML schema
        with open(input_yaml_path, "w") as f:
            yaml.dump(job.inputs, f)

        # Build command
        cmd = [
            "boltz", "predict", str(input_yaml_path),
            "--out_dir", str(output_dir),
        ]

        # Add optional params from job.params
        for key, value in job.params.items():
            if isinstance(value, bool):
                if value:
                    cmd.append(f"--{key}")
            else:
                cmd.extend([f"--{key}", str(value)])

        # Run Boltz and stream logs
        process = subprocess.Popen(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            bufsize=1
        )

        full_logs = ""
        for line in process.stdout:
            full_logs += line
            # Periodically update logs in DB? Or just at the end.
            # For "real-time" we might want to push to Redis or use a separate log file
            # that the API can read.

        process.wait()
        job.logs = full_logs

        if process.returncode != 0:
            job.status = "failed"
        else:
            # Parse metrics from output folder
            # Boltz creates output_dir/predictions/[input_name]/confidence_[input_name]_model_0.json
            input_stem = input_yaml_path.stem
            pred_dir = output_dir / "predictions" / input_stem

            # Find the first confidence file
            conf_files = list(pred_dir.glob("confidence_*.json"))
            if conf_files:
                with open(conf_files[0], "r") as f:
                    job.metrics = json.load(f)

            # Check for affinity
            affinity_files = list(pred_dir.glob("affinity_*.json"))
            if affinity_files:
                with open(affinity_files[0], "r") as f:
                    aff_data = json.load(f)
                    if job.metrics:
                        job.metrics["affinity"] = aff_data
                    else:
                        job.metrics = {"affinity": aff_data}

            job.results_path = str(pred_dir)
            job.status = "completed"

    except Exception as e:
        job.status = "failed"
        job.logs = (job.logs or "") + f"\nError in worker: {str(e)}"

    db.commit()
    db.close()
    return job.status
