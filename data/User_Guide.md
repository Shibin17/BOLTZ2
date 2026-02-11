# Boltz-2 GUI User Guide

## 1. Getting Started
The Boltz-2 GUI allows you to run complex biomolecular predictions without using the terminal.

### Steps to Run:
1. Ensure Docker is running.
2. Run `docker-compose up --build`.
3. Visit `http://localhost:3000` in your browser.

## 2. Running a Prediction
1. **Name Your Job**: Enter a descriptive name for your experiment.
2. **Add Components**:
   - **Protein**: Paste the amino acid sequence in the provided text area.
   - **Ligand**: Use the toggle to switch between **SMILES** strings or **CCD codes** (e.g., ATP, SAH).
3. **Set Parameters**:
   - **Recycling Steps**: Default is 3. Increase for better quality (at higher time cost).
   - **Diffusion Samples**: Increase to explore conformational diversity.
   - **MSA Server**: Ensure this is checked if you don't have precomputed MSA files.
4. **Submit**: Click "Start Job".

## 3. Monitoring Progress
- The **Job History** list on the left shows all past and current jobs.
- **Running** jobs will show an animated pulse.
- Once a job starts, you can click on it (once completed) to see the details.
- The **Logs** section at the bottom of the dashboard displays output directly from the Boltz-2 engine.

## 4. Visualizing Results
- When a job is **Completed**, click the **Eye icon** or select the job from the list.
- The **Mol* viewer** will load the prediction.
- You can rotate, zoom, and change representations using the mouse.
- **Confidence Metrics** (Confidence Score, pLDDT, etc.) are displayed at the top of the viewer.

## 5. Downloading Data
- Click the **Download icon** in the job history to save the `.cif` structure file to your computer for use in external software like PyMOL or ChimeraX.

## 6. Troubleshooting
- **Job stays in "Pending"**: Ensure the `worker` container is running in Docker.
- **"Failed" Status**: Check the execution logs at the bottom of the screen for specific error messages from Boltz-2.
- **Visualization not loading**: Ensure the backend container is reachable at `http://localhost:8000`.
