import React, { useState } from 'react';
import JobForm from './components/JobForm';
import JobList from './components/JobList';
import MolStarViewer from './components/MolStarViewer';
import { Microscope, Activity, History, Settings } from 'lucide-react';

const API_BASE = 'http://localhost:8000/api';

function App() {
    const [selectedJob, setSelectedJob] = useState(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const handleJobCreated = (job) => {
        setRefreshTrigger(prev => prev + 1);
    };

    const getSelectedJobCifUrl = () => {
        if (!selectedJob) return null;
        // In our worker, we save results to predictions/[input_stem]/[input_stem]_model_0.cif
        // The API provides the list of files. We'll simplify and assume filename model_0.cif or similar.
        // For a more robust version, we'd list files and find the .cif
        return `${API_BASE}/jobs/${selectedJob.id}/files/input_model_0.cif`;
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            {/* Header */}
            <header className="bg-indigo-900 text-white p-4 shadow-lg">
                <div className="container mx-auto flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="bg-white p-2 rounded-lg text-indigo-900">
                            <Microscope size={24} />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold tracking-tight">Boltz-2 GUI</h1>
                            <p className="text-xs text-indigo-300">Biomolecular Structure & Affinity Prediction</p>
                        </div>
                    </div>
                    <nav className="flex space-x-6 text-sm font-medium">
                        <a href="#" className="hover:text-indigo-300 flex items-center"><Activity size={18} className="mr-1"/> Dashboard</a>
                        <a href="#" className="hover:text-indigo-300 flex items-center"><History size={18} className="mr-1"/> History</a>
                        <a href="#" className="hover:text-indigo-300 flex items-center"><Settings size={18} className="mr-1"/> Settings</a>
                    </nav>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-grow container mx-auto p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Column: Form & History */}
                <div className="lg:col-span-4 space-y-6 overflow-y-auto max-h-[calc(100vh-140px)]">
                    <JobForm onJobCreated={handleJobCreated} />
                    <JobList refreshTrigger={refreshTrigger} onSelectJob={setSelectedJob} />
                </div>

                {/* Right Column: Visualization & Metrics */}
                <div className="lg:col-span-8 flex flex-col space-y-6">
                    {selectedJob ? (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col flex-grow min-h-[600px]">
                            <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                                <div>
                                    <h2 className="text-lg font-bold text-gray-800">{selectedJob.name}</h2>
                                    <p className="text-xs text-gray-500">ID: {selectedJob.id} • Completed at {new Date(selectedJob.created_at).toLocaleString()}</p>
                                </div>
                                <div className="flex space-x-4">
                                    <div className="text-center">
                                        <p className="text-[10px] text-gray-500 uppercase font-bold">Confidence</p>
                                        <p className="text-lg font-mono font-bold text-indigo-600">{(selectedJob.metrics?.confidence_score * 100).toFixed(1)}%</p>
                                    </div>
                                    <div className="text-center border-l pl-4">
                                        <p className="text-[10px] text-gray-500 uppercase font-bold">pLDDT</p>
                                        <p className="text-lg font-mono font-bold text-green-600">{(selectedJob.metrics?.complex_plddt * 100).toFixed(1)}%</p>
                                    </div>
                                    {selectedJob.metrics?.affinity && (
                                         <div className="text-center border-l pl-4">
                                            <p className="text-[10px] text-gray-500 uppercase font-bold">ΔG Pred</p>
                                            <p className="text-lg font-mono font-bold text-orange-600">{selectedJob.metrics.affinity.affinity_pred_value?.toFixed(2)}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="flex-grow p-4 relative">
                                <MolStarViewer url={getSelectedJobCifUrl()} />
                            </div>
                            {selectedJob.logs && (
                                <div className="p-4 bg-gray-900 text-green-400 font-mono text-[10px] max-h-40 overflow-y-auto border-t">
                                    <p className="mb-2 text-gray-500 uppercase text-[8px] font-bold">Execution Logs</p>
                                    <pre className="whitespace-pre-wrap">{selectedJob.logs}</pre>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col flex-grow items-center justify-center p-12 text-center">
                            <div className="bg-indigo-50 p-6 rounded-full text-indigo-200 mb-4">
                                <Microscope size={64} />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-800">No Job Selected</h2>
                            <p className="text-gray-500 max-w-md mt-2">
                                Launch a structure prediction from the form on the left or select a previous job from the history to visualize its 3D complex and review metrics.
                            </p>
                        </div>
                    )}
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-white border-t p-4 text-center text-xs text-gray-400">
                Boltz-2 GUI • Local Production-Ready Instance • © 2026
            </footer>
        </div>
    );
}

export default App;
