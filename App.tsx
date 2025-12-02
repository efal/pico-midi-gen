import React, { useState, useEffect } from 'react';
import { MidiComponent, ComponentType, ProjectConfig, COMPONENT_TEMPLATES } from './types';
import { generateArduinoCode } from './services/codeGenerator';
import { ComponentEditor } from './components/ComponentEditor';
import { MagicAssistant } from './components/MagicAssistant';

function App() {
    const [config, setConfig] = useState<ProjectConfig>({
        name: 'My Pico Controller',
        author: 'Maker',
        interfaceType: 'USBMIDI_Interface'
    });

    const [components, setComponents] = useState<MidiComponent[]>([]);
    const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null);
    const [showMagic, setShowMagic] = useState(false);
    const [generatedCode, setGeneratedCode] = useState('');

    // Update code whenever components or config changes
    useEffect(() => {
        const code = generateArduinoCode(config, components);
        setGeneratedCode(code);
    }, [config, components]);

    const addComponent = (type: ComponentType) => {
        const template = COMPONENT_TEMPLATES[type];
        const newComponent: MidiComponent = {
            id: crypto.randomUUID(),
            type,
            name: `${template.name} ${components.filter(c => c.type === type).length + 1}`,
            pins: [...(template.pins || ['0'])],
            channel: template.channel || 1,
            address: template.address || 0,
            ...template
        };

        setComponents([...components, newComponent]);
        setSelectedComponentId(newComponent.id);
    };

    const updateComponent = (updated: MidiComponent) => {
        setComponents(components.map(c => c.id === updated.id ? updated : c));
    };

    const deleteComponent = (id: string) => {
        setComponents(components.filter(c => c.id !== id));
        if (selectedComponentId === id) setSelectedComponentId(null);
    };

    const handleMagicAdd = (newComponents: MidiComponent[]) => {
        setComponents([...components, ...newComponents]);
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(generatedCode);
        // Could add a toast notification here
    };

    return (
        <div className="min-h-screen flex flex-col md:flex-row overflow-hidden">
            {showMagic && (
                <MagicAssistant
                    currentComponents={components}
                    onAddComponents={handleMagicAdd}
                    onClose={() => setShowMagic(false)}
                />
            )}

            {/* Sidebar: Component Palette & List */}
            <aside className="w-full md:w-80 bg-gray-900 border-r border-gray-800 flex flex-col h-[40vh] md:h-screen">
                <div className="p-4 border-b border-gray-800">
                    <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 mb-1">
                        PicoControl
                    </h1>
                    <p className="text-xs text-gray-500">Code Generator for Control Surface</p>
                </div>

                {/* Global Config Compact */}
                <div className="p-4 border-b border-gray-800 bg-gray-900/50">
                    <input
                        value={config.name}
                        onChange={(e) => setConfig({ ...config, name: e.target.value })}
                        className="w-full bg-transparent text-sm font-semibold text-gray-300 focus:outline-none mb-2 border-b border-transparent focus:border-gray-600"
                        placeholder="Project Name"
                    />
                    <button
                        onClick={() => setShowMagic(true)}
                        className="w-full py-2 px-3 rounded bg-gradient-to-r from-purple-600 to-indigo-600 text-xs font-bold text-white hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                    >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        Magic Assistant
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    <div>
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Add Component</h3>
                        <div className="grid grid-cols-2 gap-2">
                            {Object.values(ComponentType).map(type => (
                                <button
                                    key={type}
                                    onClick={() => addComponent(type)}
                                    className="text-left px-3 py-2 rounded bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-accent-500/50 text-xs text-gray-300 transition-all truncate"
                                >
                                    {type.replace('Potentiometer', ' Pot').replace('Rotary', '').replace('Button', ' Btn')}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Your Components</h3>
                        <div className="space-y-2">
                            {components.length === 0 && (
                                <p className="text-xs text-gray-600 italic text-center py-4">No components yet.</p>
                            )}
                            {components.map(comp => (
                                <div
                                    key={comp.id}
                                    onClick={() => setSelectedComponentId(comp.id)}
                                    className={`group flex items-center justify-between p-2 rounded cursor-pointer border transition-all ${selectedComponentId === comp.id ? 'bg-accent-600/10 border-accent-500' : 'bg-gray-800/50 border-transparent hover:bg-gray-800'}`}
                                >
                                    <div className="flex flex-col">
                                        <span className={`text-sm font-medium ${selectedComponentId === comp.id ? 'text-white' : 'text-gray-400 group-hover:text-gray-300'}`}>
                                            {comp.name}
                                        </span>
                                        <span className="text-[10px] text-gray-500 font-mono">
                                            Pin: {comp.pins.join(', ')}
                                        </span>
                                    </div>
                                    {selectedComponentId === comp.id && <div className="w-2 h-2 rounded-full bg-accent-500"></div>}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col bg-black overflow-hidden h-full md:h-screen">
                {/* Toolbar */}
                <header className="h-14 border-b border-gray-800 flex items-center justify-between px-6 bg-gray-900/50 backdrop-blur">
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                        <span>Total Components: {components.length}</span>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setComponents([])}
                            className="px-3 py-1.5 text-xs font-medium text-red-400 hover:text-red-300 transition-colors"
                        >
                            Clear All
                        </button>
                    </div>
                </header>

                {/* Editor + Preview Split */}
                <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
                    {/* Editor Panel */}
                    <div className="flex-1 p-6 overflow-y-auto border-r border-gray-800 bg-gray-950">
                        {selectedComponentId ? (
                            components.map(comp => comp.id === selectedComponentId && (
                                <div key={comp.id} className="max-w-2xl mx-auto">
                                    <ComponentEditor
                                        component={comp}
                                        allComponents={components}
                                        onChange={updateComponent}
                                        onDelete={deleteComponent}
                                    />

                                    <div className="mt-8 p-4 bg-gray-900/50 rounded-lg border border-gray-800">
                                        <h4 className="text-sm font-bold text-gray-400 mb-2">Wiring Guide</h4>
                                        <ul className="text-xs text-gray-500 space-y-1 list-disc pl-4">
                                            {comp.type === ComponentType.CCPotentiometer && (
                                                <>
                                                    <li>Connect Left pin to 3.3V</li>
                                                    <li>Connect Right pin to GND</li>
                                                    <li>Connect Middle (Wiper) pin to GP{comp.pins[0]}</li>
                                                </>
                                            )}
                                            {(comp.type === ComponentType.NoteButton || comp.type === ComponentType.CCButton) && (
                                                <>
                                                    <li>Connect one side to GP{comp.pins[0]}</li>
                                                    <li>Connect other side to GND</li>
                                                    <li>Internal pull-up is used automatically</li>
                                                </>
                                            )}
                                            {comp.type === ComponentType.CCRotaryEncoder && (
                                                <>
                                                    <li>Connect Pin A to GP{comp.pins[0]}</li>
                                                    <li>Connect Pin B to GP{comp.pins[1]}</li>
                                                    <li>Connect Common C to GND</li>
                                                </>
                                            )}
                                        </ul>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-gray-600">
                                <svg className="w-16 h-16 mb-4 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
                                <p>Select a component to edit or add a new one.</p>
                            </div>
                        )}
                    </div>

                    {/* Code Preview Panel */}
                    <div className="w-full lg:w-[500px] flex flex-col bg-[#0d1117]">
                        <div className="flex items-center justify-between px-4 py-2 bg-gray-800/50 border-b border-gray-700">
                            <span className="text-xs font-mono text-gray-400">main.ino</span>
                            <button
                                onClick={copyToClipboard}
                                className="text-xs bg-gray-700 hover:bg-gray-600 text-white px-2 py-1 rounded transition-colors"
                            >
                                Copy Code
                            </button>
                        </div>
                        <div className="flex-1 overflow-auto p-4 code-scroll relative">
                            <pre className="font-mono text-xs text-gray-300 leading-5 whitespace-pre">
                                {generatedCode}
                            </pre>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default App;