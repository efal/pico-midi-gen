
import * as React from 'react';
import { AppConfig, ControlDefinition } from '../types';
import { Sliders, ToggleLeft } from 'lucide-react';

interface Props {
  config: AppConfig;
  onChange: (newConfig: AppConfig) => void;
}

export const MuxEditor: React.FC<Props> = ({ config, onChange }) => {
  const updateControl = (id: string, updates: Partial<ControlDefinition>) => {
    const newControls = config.controls.map((c) =>
      c.id === id ? { ...c, ...updates } : c
    );
    onChange({ ...config, controls: newControls });
  };

  const renderMuxGroup = (muxIndex: 0 | 1) => {
    const controls = config.controls.filter((c) => c.muxIndex === muxIndex);

    return (
      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <div className="bg-gray-700/50 px-4 py-3 border-b border-gray-600 flex justify-between items-center">
          <h3 className="font-semibold text-white">Multiplexer {muxIndex + 1}</h3>
          <span className="text-xs text-gray-400 uppercase">Input Pin: {muxIndex === 0 ? config.pins.mux1Signal : config.pins.mux2Signal}</span>
        </div>
        <div className="p-2 space-y-1 max-h-[400px] overflow-y-auto">
          {controls.map((control) => (
            <div
              key={control.id}
              className={`flex items-center gap-2 p-2 rounded border ${
                control.enabled ? 'bg-gray-900/50 border-gray-700' : 'bg-gray-900/20 border-transparent opacity-50'
              }`}
            >
              <button
                onClick={() => updateControl(control.id, { enabled: !control.enabled })}
                className={`p-1 rounded ${control.enabled ? 'text-green-400 hover:text-green-300' : 'text-gray-500 hover:text-gray-400'}`}
                title="Enable/Disable"
              >
                <ToggleLeft className={`w-5 h-5 ${control.enabled ? 'rotate-180' : ''}`} />
              </button>
              
              <div className="w-8 text-xs text-gray-500 text-center font-mono">
                CH{control.channelIndex}
              </div>

              <input
                type="text"
                value={control.name}
                disabled={!control.enabled}
                onChange={(e) => updateControl(control.id, { name: e.target.value })}
                className="flex-1 bg-transparent border-b border-gray-700 focus:border-blue-500 outline-none text-sm px-1 text-gray-200 placeholder-gray-600"
                placeholder="Label"
              />

              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-500">CC</span>
                <input
                  type="number"
                  value={control.midiCC}
                  disabled={!control.enabled}
                  onChange={(e) => updateControl(control.id, { midiCC: parseInt(e.target.value) || 0 })}
                  className="w-12 bg-gray-800 border border-gray-600 rounded px-1 py-0.5 text-sm text-right focus:border-blue-500 outline-none text-blue-300"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
       <div className="flex items-center space-x-2 pb-2">
        <Sliders className="text-green-400" />
        <h2 className="text-xl font-bold text-white">Control Map (32 Channels)</h2>
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {renderMuxGroup(0)}
        {renderMuxGroup(1)}
      </div>
    </div>
  );
};
