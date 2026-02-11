import React, { useState } from 'react';
import { Plus, Trash2, Send } from 'lucide-react';
import axios from 'axios';

const API_BASE = 'http://localhost:8000/api';

const JobForm = ({ onJobCreated }) => {
    const [name, setName] = useState('New Prediction');
    const [entities, setEntities] = useState([
        { id: 'A', type: 'protein', sequence: '', msa_server: true }
    ]);
    const [params, setParams] = useState({
        recycling_steps: 3,
        diffusion_samples: 1,
        use_msa_server: true
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const addEntity = () => {
        const nextId = String.fromCharCode(65 + entities.length);
        setEntities([...entities, { id: nextId, type: 'protein', sequence: '', msa_server: true }]);
    };

    const removeEntity = (index) => {
        setEntities(entities.filter((_, i) => i !== index));
    };

    const updateEntity = (index, field, value) => {
        const newEntities = [...entities];
        newEntities[index][field] = value;
        setEntities(newEntities);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // Format for Boltz API
            const sequences = entities.map(e => {
                const entity = {
                    [e.type]: {
                        id: e.id,
                    }
                };
                if (e.type === 'protein') {
                    entity.protein.sequence = e.sequence;
                } else if (e.type === 'ligand') {
                    if (e.isCCD) entity.ligand.ccd = e.value;
                    else entity.ligand.smiles = e.value;
                }
                return entity;
            });

            const payload = {
                name,
                sequences,
                params
            };

            const response = await axios.post(`${API_BASE}/jobs`, payload);
            if (onJobCreated) onJobCreated(response.data);

            // Reset form
            setName('New Prediction');
        } catch (error) {
            console.error("Failed to create job:", error);
            alert("Error creating job. Check console.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold mb-4">Run New Prediction</h2>

            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Job Name</label>
                <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
            </div>

            <div className="space-y-4 mb-6">
                <h3 className="text-md font-semibold text-gray-600">Complex Components</h3>
                {entities.map((entity, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-md border border-gray-200 relative">
                        <div className="grid grid-cols-2 gap-4 mb-2">
                            <div>
                                <label className="block text-xs font-medium text-gray-500">ID</label>
                                <input
                                    type="text"
                                    value={entity.id}
                                    onChange={e => updateEntity(index, 'id', e.target.value.toUpperCase())}
                                    className="w-full rounded border-gray-300 text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500">Type</label>
                                <select
                                    value={entity.type}
                                    onChange={e => updateEntity(index, 'type', e.target.value)}
                                    className="w-full rounded border-gray-300 text-sm"
                                >
                                    <option value="protein">Protein</option>
                                    <option value="ligand">Ligand</option>
                                    <option value="dna">DNA</option>
                                    <option value="rna">RNA</option>
                                </select>
                            </div>
                        </div>

                        {entity.type === 'protein' ? (
                            <textarea
                                placeholder="Protein Sequence (FASTA)"
                                value={entity.sequence}
                                onChange={e => updateEntity(index, 'sequence', e.target.value)}
                                className="w-full h-24 rounded border-gray-300 text-xs font-mono"
                            />
                        ) : (
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder={entity.isCCD ? "CCD Code (e.g. ATP)" : "SMILES string"}
                                    value={entity.value || ''}
                                    onChange={e => updateEntity(index, 'value', e.target.value)}
                                    className="flex-grow rounded border-gray-300 text-sm"
                                />
                                <button
                                    type="button"
                                    onClick={() => updateEntity(index, 'isCCD', !entity.isCCD)}
                                    className="text-[10px] bg-gray-200 px-2 rounded"
                                >
                                    {entity.isCCD ? 'Switch to SMILES' : 'Switch to CCD'}
                                </button>
                            </div>
                        )}

                        {entities.length > 1 && (
                            <button
                                type="button"
                                onClick={() => removeEntity(index)}
                                className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                            >
                                <Trash2 size={16} />
                            </button>
                        )}
                    </div>
                ))}

                <button
                    type="button"
                    onClick={addEntity}
                    className="flex items-center text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                >
                    <Plus size={16} className="mr-1" /> Add Component
                </button>
            </div>

            <div className="border-t pt-4">
                 <h3 className="text-md font-semibold text-gray-600 mb-2">Parameters</h3>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-medium text-gray-500">Recycling Steps</label>
                        <input
                            type="number"
                            value={params.recycling_steps}
                            onChange={e => setParams({...params, recycling_steps: parseInt(e.target.value)})}
                            className="w-full rounded border-gray-300 text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500">Diffusion Samples</label>
                        <input
                            type="number"
                            value={params.diffusion_samples}
                            onChange={e => setParams({...params, diffusion_samples: parseInt(e.target.value)})}
                            className="w-full rounded border-gray-300 text-sm"
                        />
                    </div>
                 </div>
                 <div className="mt-2 flex items-center">
                    <input
                        type="checkbox"
                        checked={params.use_msa_server}
                        onChange={e => setParams({...params, use_msa_server: e.target.checked})}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                    />
                    <label className="ml-2 block text-sm text-gray-700 font-medium font-bold">Use MSA Server</label>
                 </div>
            </div>

            <button
                type="submit"
                disabled={isSubmitting}
                className={`mt-6 w-full py-2 px-4 rounded-md text-white font-semibold flex items-center justify-center ${isSubmitting ? 'bg-gray-400' : 'bg-indigo-600 hover:bg-indigo-700'}`}
            >
                <Send size={18} className="mr-2" /> {isSubmitting ? 'Submitting...' : 'Start Job'}
            </button>
        </form>
    );
};

export default JobForm;
