import React, { useEffect, useRef } from 'react';
import { createPluginUI } from 'molstar/lib/mol-plugin-ui/react18';
import { DefaultPluginUISpec } from 'molstar/lib/mol-plugin-ui/spec';
import { PluginContext } from 'molstar/lib/mol-plugin/context';

// Minimal spec to avoid heavy UI if needed, but Default is usually fine
const MySpec = {
    ...DefaultPluginUISpec(),
    layout: {
        initial: {
            isExpanded: false,
            showControls: false
        }
    },
    components: {
        remoteState: 'none'
    }
};

const MolStarViewer = ({ url }) => {
    const parentRef = useRef(null);
    const pluginRef = useRef(null);

    useEffect(() => {
        const init = async () => {
            if (!parentRef.current) return;

            const plugin = await createPluginUI(parentRef.current, MySpec);
            pluginRef.current = plugin;

            if (url) {
                await loadStructure(url);
            }
        };

        const loadStructure = async (structureUrl) => {
            if (!pluginRef.current) return;

            const plugin = pluginRef.current;
            await plugin.clear();

            try {
                const data = await plugin.builders.data.download({ url: structureUrl, isBinary: false });
                const trajectory = await plugin.builders.structure.parseTrajectory(data, 'mmcif');
                await plugin.builders.structure.hierarchy.applyPreset(trajectory, 'default');
            } catch (e) {
                console.error("Failed to load MolStar structure:", e);
            }
        };

        init();

        return () => {
            if (pluginRef.current) {
                pluginRef.current.dispose();
                pluginRef.current = null;
            }
        };
    }, []);

    // Handle URL changes
    useEffect(() => {
        if (pluginRef.current && url) {
            pluginRef.current.clear().then(() => {
                 pluginRef.current.builders.data.download({ url, isBinary: false }).then(data => {
                    pluginRef.current.builders.structure.parseTrajectory(data, 'mmcif').then(trajectory => {
                        pluginRef.current.builders.structure.hierarchy.applyPreset(trajectory, 'default');
                    });
                 });
            });
        }
    }, [url]);

    return (
        <div ref={parentRef} className="w-full h-full min-h-[500px] border border-gray-200 rounded-lg overflow-hidden" />
    );
};

export default MolStarViewer;
