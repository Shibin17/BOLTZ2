# Technical Report: Boltz-2 GUI Integration

## 1. Executive Summary
This report details the architectural design and implementation of the Boltz-2 Graphical User Interface (GUI). The system provides a web-based portal for high-throughput biomolecular structure prediction, bridging the gap between Boltz-2's powerful CLI and end-users who require intuitive visualization and management tools.

## 2. System Architecture
The application is built using a distributed asynchronous architecture to handle the computationally intensive Boltz-2 prediction tasks.

### 2.1 Backend (FastAPI)
The backend serves as the orchestrator and API gateway.
- **REST API**: Provides endpoints for job submission, status polling, and result retrieval.
- **ORM (SQLAlchemy)**: Manages persistence of job metadata and metrics in a PostgreSQL database.
- **CORS**: Configured to allow secure communication with the decoupled frontend.

### 2.2 Task Queue (Celery & Redis)
To prevent API blocking during 10-20 minute prediction cycles:
- **Redis**: Acts as the message broker, storing pending tasks.
- **Celery Worker**: A stateful consumer that executes the Boltz-2 core engine. It manages child processes, captures stdout/stderr for real-time logging, and parses the final `.cif` and `.json` artifacts.

### 2.3 Frontend (React)
A modern SPA (Single Page Application) built with:
- **Vite**: For fast development and optimized production builds.
- **Tailwind CSS**: For a responsive, clean "scientific" aesthetic.
- **Mol* Star**: Integrated using the React implementation of the Mol* toolkit. It performs client-side rendering of mmCIF files directly from the backend.

## 3. Integration Logic
The core integration involves translating user-provided sequences and ligand strings into the strict YAML schema required by Boltz-2. The worker performs the following steps:
1. **Serialization**: Convert DB job record to filesystem YAML.
2. **Execution**: Invoke `boltz predict` via subprocess.
3. **Artifact Mapping**: Extract confidence scores from the JSON output and map them back to the DB record.
4. **Clean up**: Store resulting structure files in a job-specific folder served by the API.

## 4. Performance Considerations
- **Concurrency**: Managed via Celery workers.
- **GPU Utilization**: The worker container is configured to use NVIDIA Docker runtime, allowing direct access to CUDA cores.
- **Caching**: Leverages Boltz-2's internal caching mechanism for MSA and checkpoints.

## 5. Security and Privacy
The system is designed for **Private Local Use**:
- No external exposure of data unless configured by the user.
- Local persistence in Docker volumes ensures data remains on the host machine.
