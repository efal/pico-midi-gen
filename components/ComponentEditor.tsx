import React from 'react';
import { MidiComponent, ComponentType } from '../types';

interface Props {
    component: MidiComponent;
    allComponents: MidiComponent[];
    onChange: (updated: MidiComponent) => void;
    onDelete: (id: string) => void;
}

export const ComponentEditor: React.FC<Props> = ({ component, allComponents, onChange, onDelete }) => {

    const handlePinChange = (index: number, value: string) => {
        const newPins = [...component.pins];
        newPins[index] = value;
        onChange({ ...component, pins: newPins });
    };

    const handleArrayPinChange = (field: 'rowPins' | 'colPins', index: number, value: string) => {
        const currentArray = component[field] || [];
        const newArray = [...currentArray];
        newArray[index] = value;
        onChange({ ...component, [field]: newArray });
    };

    const multiplexers = allComponents.filter(c => c.type === ComponentType.Multiplexer && c.id !== component.id);
    const isMultiplexable = [ComponentType.CCPotentiometer, ComponentType.NoteButton, ComponentType.CCButton, ComponentType.NoteLED].includes(component.type);

    return (
        <div className="bg-gray-850 p-6 rounded-xl border border-gray-700 shadow-lg animate-fade-in">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="text-xl font-bold text-white mb-1">{component.name}</h3>
                    <span className="text-xs font-mono text-accent-500 bg-accent-500/10 px-2 py-1 rounded">
                        {component.type}
                    </span>
                </div>
                <button
                    onClick={() => onDelete(component.id)}
                    className="text-gray-400 hover:text-red-400 transition-colors p-2"
                    title="Delete Component"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Name */}
                <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-400 mb-1">Name</label>
                    <input
                        type="text"
                        value={component.name}
                        onChange={(e) => onChange({ ...component, name: e.target.value })}
                        className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-accent-500 transition-colors"
                    />
                </div>

                {/* Multiplexer Selection (for supported components) */}
                {isMultiplexable && multiplexers.length > 0 && (
                    <div className="col-span-2 p-3 bg-gray-800/50 rounded border border-gray-700/50">
                        <label className="flex items-center gap-2 text-xs font-medium text-gray-300 mb-2">
                            <input
                                type="checkbox"
                                checked={!!component.parentId}
                                onChange={(e) => {
                                    if (e.target.checked) {
                                        onChange({ ...component, parentId: multiplexers[0].id, muxPin: 0 });
                                    } else {
                                        const { parentId, muxPin, ...rest } = component;
                                        onChange(rest as MidiComponent);
                                    }
                                }}
                                className="rounded border-gray-600 bg-gray-700 text-accent-500 focus:ring-accent-500"
                            />
                            Connect to Multiplexer
                        </label>

                        {component.parentId && (
                            <div className="grid grid-cols-2 gap-2 mt-2 pl-6">
                                <div>
                                    <label className="block text-[10px] text-gray-500 mb-1">Select Multiplexer</label>
                                    <select
                                        value={component.parentId}
                                        onChange={(e) => onChange({ ...component, parentId: e.target.value })}
                                        className="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1 text-xs text-gray-300"
                                    >
                                        {multiplexers.map(m => (
                                            <option key={m.id} value={m.id}>{m.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] text-gray-500 mb-1">Mux Pin (0-15)</label>
                                    <input
                                        type="number"
                                        min="0" max="15"
                                        value={component.muxPin || 0}
                                        onChange={(e) => onChange({ ...component, muxPin: parseInt(e.target.value) || 0 })}
                                        className="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1 text-xs text-gray-300"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Pins Configuration */}
                <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-400 mb-1">
                        Pin Configuration
                    </label>

                    {/* Standard Pins (if not on Mux) */}
                    {!component.parentId && component.type !== ComponentType.ButtonMatrix && component.type !== ComponentType.CCButtonMatrix && (
                        <div className="flex gap-2">
                            {component.pins.map((pin, idx) => (
                                <div key={idx} className="flex-1">
                                    <label className="block text-[10px] text-gray-500 mb-1">
                                        {component.type === ComponentType.Multiplexer && idx === 0 ? 'Signal (Z)' :
                                            component.type === ComponentType.Multiplexer ? `S${idx - 1}` :
                                                component.type === ComponentType.SSD1306Display && idx === 0 ? 'SDA' :
                                                    component.type === ComponentType.SSD1306Display && idx === 1 ? 'SCL' :
                                                        `Pin ${idx + 1}`}
                                    </label>
                                    <input
                                        type="text"
                                        value={pin}
                                        onChange={(e) => handlePinChange(idx, e.target.value)}
                                        className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-sm text-gray-200 font-mono focus:outline-none focus:border-accent-500"
                                    />
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Matrix Pins */}
                    {(component.type === ComponentType.ButtonMatrix || component.type === ComponentType.CCButtonMatrix) && (
                        <div className="space-y-2">
                            <div>
                                <label className="block text-[10px] text-gray-500 mb-1">Row Pins</label>
                                <div className="flex gap-1">
                                    {(component.rowPins || []).map((pin, idx) => (
                                        <input
                                            key={`row-${idx}`}
                                            type="text"
                                            value={pin}
                                            onChange={(e) => handleArrayPinChange('rowPins', idx, e.target.value)}
                                            className="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1 text-xs text-gray-200 font-mono"
                                        />
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] text-gray-500 mb-1">Column Pins</label>
                                <div className="flex gap-1">
                                    {(component.colPins || []).map((pin, idx) => (
                                        <input
                                            key={`col-${idx}`}
                                            type="text"
                                            value={pin}
                                            onChange={(e) => handleArrayPinChange('colPins', idx, e.target.value)}
                                            className="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1 text-xs text-gray-200 font-mono"
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* MIDI Channel */}
                <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">Channel (1-16)</label>
                    <input
                        type="number"
                        min="1" max="16"
                        value={component.channel}
                        onChange={(e) => onChange({ ...component, channel: parseInt(e.target.value) || 1 })}
                        className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-sm text-gray-200 font-mono focus:outline-none focus:border-accent-500"
                    />
                </div>

                {/* Address (Note/CC) */}
                <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">
                        {component.type.includes('Note') || component.type === ComponentType.ButtonMatrix ? 'Start Note' : 'CC Number'}
                    </label>
                    <input
                        type="number"
                        min="0" max="127"
                        value={component.address}
                        onChange={(e) => onChange({ ...component, address: parseInt(e.target.value) || 0 })}
                        className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-sm text-gray-200 font-mono focus:outline-none focus:border-accent-500"
                    />
                </div>
            </div>
        </div>
    );
};