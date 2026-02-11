# Boltz-2 GUI

A modern, production-ready web interface for Boltz-2 biomolecular structure and binding affinity prediction.

## Features
- **Easy Input**: Upload protein sequences (FASTA) and ligands (SMILES/CCD).
- **Interactive 3D**: Visualize predicted complexes in-browser using Mol* integration.
- **Asynchronous Execution**: Powered by Celery and Redis for scalable job management.
- **Job History**: Persistent storage of past predictions and metrics in PostgreSQL.
- **Real-time Monitoring**: Follow logs and progress directly from the dashboard.
- **Metrics Dashboard**: View confidence scores, pLDDT, ipTM, and binding affinity (ΔG).

## Tech Stack
- **Frontend**: React, Tailwind CSS, Mol* Star, Lucide Icons, Vite.
- **Backend**: FastAPI (Python), SQLAlchemy, Pydantic.
- **Task Queue**: Celery, Redis.
- **Database**: PostgreSQL.
- **Containerization**: Docker Compose.

## Installation & Setup

### Prerequisites
- Docker and Docker Compose
- NVIDIA GPU with [NVIDIA Container Toolkit](https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/latest/install-guide.html) (for GPU acceleration)

### Quick Start
1. **Clone the repository**:
   ```bash
   git clone <your-repository-url>
   cd boltz-gui
   ```

2. **Start the system**:
   ```bash
   docker-compose up --build
   ```

3. **Access the GUI**:
   Open your browser and navigate to `http://localhost:3000`.

## Architecture
The system follows a modern microservices architecture:
1. **Frontend**: Communicates with the Backend API.
2. **Backend**: Handles job creation, serves results, and manages the database.
3. **Worker**: A dedicated container with Boltz-2 installed that pulls jobs from Redis and runs the heavy computations (supports GPU).
4. **Redis**: Acts as the message broker between the API and the worker.
5. **PostgreSQL**: Stores job metadata, status, and metrics.

## Documentation
For more details, see the generated reports in the `reports/` directory:
- [Technical Report](reports/Technical_Report.md)
- [User Guide](reports/User_Guide.md)

## License
Provided under the MIT License. Consistent with Boltz-2's open-source philosophy.
