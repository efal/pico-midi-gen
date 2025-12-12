
import * as React from 'react';
import { AppConfig, TM1638Config } from '../types';
import { Power, Calculator, Activity } from 'lucide-react';

interface Props {
  config: AppConfig;
  onChange: (newConfig: AppConfig) => void;
}

export const TM1638Settings: React.FC<Props> = ({ config, onChange }) => {
  const updateModule = (id: string, updates: Partial<TM1638Config>) => {
    const newModules = config.tm1638s.map((m) =>
      m.id === id ? { ...m, ...updates } : m
    );
    onChange({ ...config, tm1638s: newModules });
  };

  const handlePinChange = (id: string, field: keyof TM1638Config, value: string) => {
    const numVal = parseInt(value, 10);
    if (!isNaN(numVal)) {
      updateModule(id, { [field]: numVal });
    }
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700 space-y-6">
      <div className="flex items-center space-x-2 border-b border-gray-700 pb-2">
        <Calculator className="text-red-400" />
        <h2 className="text-xl font-bold text-white">TM1638 Modules</h2>
        <span className="text-xs text-gray-500 ml-auto bg-gray-900 px-2 py-1 rounded border border-gray-700">Requires TM1638plus Lib</span>
      </div>

      {config.tm1638s.map((module, index) => (
        <div key={module.id} className={`rounded-xl border transition-all duration-300 ${module.enabled ? 'bg-gray-750 border-gray-600 shadow-lg' : 'bg-gray-800/30 border-gray-700/50'}`}>
          <div className={`flex items-center justify-between p-4 border-b ${module.enabled ? 'border-gray-700' : 'border-transparent'}`}>
            <div className="flex items-center gap-4">
              <button
                onClick={() => updateModule(module.id, { enabled: !module.enabled })}
                className={`p-2 rounded-lg transition-all ${module.enabled ? 'bg-red-500 text-white shadow-red-500/20 shadow-lg' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'}`}
                title={module.enabled ? "Disable Module" : "Enable Module"}
              >
                <Power className="w-4 h-4" />
              </button>
              <div>
                 {module.enabled ? (
                     <input 
                        type="text" 
                        value={module.name}
                        onChange={(e) => updateModule(module.id, { name: e.target.value })}
                        className="bg-transparent text-sm font-bold text-white focus:outline-none focus:border-b border-red-500 w-32 placeholder-gray-500"
                        placeholder="Module Name"
                     />
                 ) : (
                     <span className="text-sm font-medium text-gray-500">Module {index + 1} (Disabled)</span>
                 )}
              </div>
            </div>

            {module.enabled && (
                <div className="flex items-center gap-3 bg-gray-900/50 px-3 py-1.5 rounded-lg border border-gray-700/50">
                    <div className="text-right">
                        <label className="block text-[10px] text-gray-500 uppercase tracking-wide">Start CC</label>
                        <input 
                            type="number" 
                            value={module.startCC}
                            onChange={(e) => updateModule(module.id, { startCC: parseInt(e.target.value) || 0 })}
                            className="w-12 bg-transparent text-sm font-mono text-red-400 text-right focus:outline-none [appearance:textfield]"
                        />
                    </div>
                    <div className="w-px h-6 bg-gray-700"></div>
                     <div className="text-right">
                        <label className="block text-[10px] text-gray-500 uppercase tracking-wide">CH</label>
                        <span className="text-sm font-mono text-gray-300">{module.midiChannel}</span>
                    </div>
                </div>
            )}
          </div>

          {module.enabled && (
            <div className="p-4 grid grid-cols-3 gap-4 bg-gray-900/20">
              <div>
                <label className="text-xs text-gray-400 font-bold flex items-center gap-1 mb-1">
                  <Activity className="w-3 h-3"/> STB Pin
                </label>
                <input
                  type="number"
                  value={module.stbPin}
                  onChange={(e) => handlePinChange(module.id, 'stbPin', e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-sm text-center font-mono focus:border-red-500 outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 font-bold flex items-center gap-1 mb-1">
                  <Activity className="w-3 h-3"/> CLK Pin
                </label>
                <input
                  type="number"
                  value={module.clkPin}
                  onChange={(e) => handlePinChange(module.id, 'clkPin', e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-sm text-center font-mono focus:border-red-500 outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 font-bold flex items-center gap-1 mb-1">
                  <Activity className="w-3 h-3"/> DIO Pin
                </label>
                <input
                  type="number"
                  value={module.dioPin}
                  onChange={(e) => handlePinChange(module.id, 'dioPin', e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-sm text-center font-mono focus:border-red-500 outline-none"
                />
              </div>
               <div className="col-span-3 flex items-center justify-center gap-2 text-[10px] text-gray-500 font-mono pt-2 border-t border-gray-700/30">
                  <Activity className="w-3 h-3" />
                  Provides 8 Buttons (Input CC {module.startCC}-{module.startCC+7}) & 8 LEDs (Feedback)
               </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
