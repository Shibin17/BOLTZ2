import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Play, CheckCircle, Clock, AlertCircle, Eye, Download } from 'lucide-react';

const API_BASE = 'http://localhost:8000/api';

const JobList = ({ refreshTrigger, onSelectJob }) => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchJobs = async () => {
        try {
            const response = await axios.get(`${API_BASE}/jobs`);
            setJobs(response.data);
        } catch (error) {
            console.error("Failed to fetch jobs:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchJobs();
        const interval = setInterval(fetchJobs, 5000); // Poll every 5 seconds
        return () => clearInterval(interval);
    }, [refreshTrigger]);

    const getStatusIcon = (status) => {
        switch (status) {
            case 'completed': return <CheckCircle className="text-green-500" size={18} />;
            case 'running': return <Play className="text-blue-500 animate-pulse" size={18} />;
            case 'failed': return <AlertCircle className="text-red-500" size={18} />;
            default: return <Clock className="text-gray-400" size={18} />;
        }
    };

    if (loading && jobs.length === 0) return <div className="text-center py-10">Loading jobs...</div>;

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b flex justify-between items-center">
                <h3 className="font-semibold text-gray-700">Job History</h3>
                <span className="text-xs text-gray-500">{jobs.length} jobs</span>
            </div>
            <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
                {jobs.map(job => (
                    <div key={job.id} className="p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex justify-between items-start">
                            <div>
                                <h4 className="font-medium text-gray-900">{job.name}</h4>
                                <div className="flex items-center mt-1 space-x-3 text-xs text-gray-500">
                                    <span className="flex items-center">
                                        {getStatusIcon(job.status)}
                                        <span className="ml-1 capitalize">{job.status}</span>
                                    </span>
                                    <span>{new Date(job.created_at).toLocaleString()}</span>
                                </div>
                            </div>
                            <div className="flex space-x-2">
                                {job.status === 'completed' && (
                                    <>
                                        <button
                                            onClick={() => onSelectJob(job)}
                                            className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded"
                                            title="View 3D Structure"
                                        >
                                            <Eye size={18} />
                                        </button>
                                        <a
                                            href={`${API_BASE}/jobs/${job.id}/files/prediction.cif`}
                                            download
                                            className="p-1.5 text-gray-600 hover:bg-gray-100 rounded"
                                            title="Download CIF"
                                        >
                                            <Download size={18} />
                                        </a>
                                    </>
                                )}
                            </div>
                        </div>

                        {job.status === 'completed' && job.metrics && (
                            <div className="mt-2 grid grid-cols-3 gap-2 py-2 px-3 bg-green-50 rounded text-[10px] font-medium text-green-800">
                                <div>Confidence: {(job.metrics.confidence_score * 100).toFixed(1)}%</div>
                                <div>ipTM: {job.metrics.iptm?.toFixed(3) || 'N/A'}</div>
                                <div>pLDDT: {(job.metrics.complex_plddt * 100).toFixed(1)}%</div>
                            </div>
                        )}
                        {job.status === 'failed' && (
                             <div className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded">
                                Prediction failed. Check logs.
                             </div>
                        )}
                    </div>
                ))}
                {jobs.length === 0 && (
                    <div className="p-10 text-center text-gray-500 text-sm italic">
                        No jobs found. Submit a prediction to get started.
                    </div>
                )}
            </div>
        </div>
    );
};

export default JobList;
