
import * as React from 'react';
import { AppConfig, EncoderConfig } from '../types';
import { RotateCw, Power } from 'lucide-react';

interface Props {
  config: AppConfig;
  onChange: (newConfig: AppConfig) => void;
}

export const EncoderSettings: React.FC<Props> = ({ config, onChange }) => {
  const updateEncoder = (id: string, updates: Partial<EncoderConfig>) => {
    const newEncoders = config.encoders.map((e) =>
      e.id === id ? { ...e, ...updates } : e
    );
    onChange({ ...config, encoders: newEncoders });
  };

  const handlePinChange = (id: string, field: keyof EncoderConfig, value: string) => {
    const numVal = parseInt(value, 10);
    if (!isNaN(numVal)) {
      updateEncoder(id, { [field]: numVal });
    }
  };

  const addEncoder = () => {
    const newId = `enc-${Date.now()}`;
    const newEncoder: EncoderConfig = {
      id: newId,
      enabled: true,
      name: `Encoder ${config.encoders.length + 1}`,
      pinA: 0,
      pinB: 0,
      midiCC: 20 + config.encoders.length,
      channel: 1,
      hasSwitch: false,
      pinSW: 0,
      swType: 'CC',
      swValue: 0
    };
    onChange({ ...config, encoders: [...config.encoders, newEncoder] });
  };

  const removeEncoder = (id: string) => {
    onChange({ ...config, encoders: config.encoders.filter(e => e.id !== id) });
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700 space-y-6">
      <div className="flex items-center justify-between border-b border-gray-700 pb-2">
        <div className="flex items-center space-x-2">
            <RotateCw className="text-orange-400" />
            <h2 className="text-xl font-bold text-white">Rotary Encoders</h2>
        </div>
        <button 
            onClick={addEncoder}
            className="text-xs bg-gray-700 hover:bg-gray-600 text-white px-2 py-1 rounded"
        >
            + Add
        </button>
      </div>

      {config.encoders.length === 0 && (
          <div className="text-sm text-gray-500 text-center py-4 italic">
              No encoders added. Click + Add to start.
          </div>
      )}

      {config.encoders.map((enc, index) => (
        <div key={enc.id} className={`rounded-xl border transition-all duration-300 ${enc.enabled ? 'bg-gray-750 border-gray-600 shadow-lg' : 'bg-gray-800/30 border-gray-700/50'}`}>
          
          {/* Header Row */}
          <div className={`flex items-center justify-between p-4 border-b ${enc.enabled ? 'border-gray-700' : 'border-transparent'}`}>
            <div className="flex items-center gap-4">
              <button
                onClick={() => updateEncoder(enc.id, { enabled: !enc.enabled })}
                className={`p-2 rounded-lg transition-all ${enc.enabled ? 'bg-orange-500 text-white shadow-orange-500/20 shadow-lg' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'}`}
                title={enc.enabled ? "Disable Encoder" : "Enable Encoder"}
              >
                <Power className="w-4 h-4" />
              </button>
              <div>
                 {enc.enabled ? (
                     <input 
                        type="text" 
                        value={enc.name}
                        onChange={(e) => updateEncoder(enc.id, { name: e.target.value })}
                        className="bg-transparent text-sm font-bold text-white focus:outline-none focus:border-b border-orange-500 w-32 placeholder-gray-500"
                        placeholder="Name"
                     />
                 ) : (
                     <span className="text-sm font-medium text-gray-500">Encoder {index + 1} (Disabled)</span>
                 )}
              </div>
            </div>
            
            {enc.enabled && (
                <div className="flex items-center gap-2">
                   <div className="flex items-center gap-2 bg-gray-900/50 px-2 py-1 rounded-lg border border-gray-700/50">
                        <label className="text-[10px] text-gray-500 uppercase">CH</label>
                        <input
                            type="number"
                            value={enc.channel}
                            onChange={(e) => updateEncoder(enc.id, { channel: parseInt(e.target.value) || 1 })}
                            className="w-8 bg-transparent text-sm font-mono text-white text-right focus:outline-none"
                        />
                   </div>
                   <button onClick={() => removeEncoder(enc.id)} className="text-gray-600 hover:text-red-400 p-1">
                       &times;
                   </button>
                </div>
            )}
          </div>

          {/* Config Body */}
          {enc.enabled && (
            <div className="p-4 space-y-4 bg-gray-900/20">
              
              {/* Rotation Config */}
              <div className="grid grid-cols-12 gap-3 items-end">
                 <div className="col-span-12 md:col-span-4">
                    <label className="text-xs text-orange-300 font-bold flex items-center gap-1 mb-1">
                        <RotateCw className="w-3 h-3" /> Rotation CC
                    </label>
                    <input
                        type="number"
                        value={enc.midiCC}
                        onChange={(e) => updateEncoder(enc.id, { midiCC: parseInt(e.target.value) || 0 })}
                        className="w-full bg-gray-800 border border-gray-700 rounded p-1.5 text-sm text-center font-mono focus:border-orange-500 outline-none text-white"
                        placeholder="CC#"
                    />
                 </div>
                 <div className="col-span-6 md:col-span-4">
                    <label className="text-xs text-gray-500 mb-1 block">Pin A</label>
                    <input
                        type="number"
                        value={enc.pinA}
                        onChange={(e) => handlePinChange(enc.id, 'pinA', e.target.value)}
                        className="w-full bg-gray-800 border border-gray-700 rounded p-1.5 text-sm text-center font-mono focus:border-orange-500 outline-none"
                    />
                 </div>
                 <div className="col-span-6 md:col-span-4">
                    <label className="text-xs text-gray-500 mb-1 block">Pin B</label>
                    <input
                        type="number"
                        value={enc.pinB}
                        onChange={(e) => handlePinChange(enc.id, 'pinB', e.target.value)}
                        className="w-full bg-gray-800 border border-gray-700 rounded p-1.5 text-sm text-center font-mono focus:border-orange-500 outline-none"
                    />
                 </div>
              </div>

              {/* Separator */}
              <div className="h-px bg-gray-700/50 w-full"></div>

              {/* Switch Config */}
              <div className="flex items-start gap-4">
                  <div className="pt-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={enc.hasSwitch}
                            onChange={(e) => updateEncoder(enc.id, { hasSwitch: e.target.checked })}
                            className="rounded bg-gray-800 border-gray-600 text-orange-500 focus:ring-0"
                          />
                          <span className="text-xs font-bold text-gray-400">Has Switch?</span>
                      </label>
                  </div>
                  
                  {enc.hasSwitch && (
                      <div className="flex-1 grid grid-cols-3 gap-3">
                          <div>
                              <label className="text-xs text-gray-500 mb-1 block">Switch Pin</label>
                              <input
                                  type="number"
                                  value={enc.pinSW}
                                  onChange={(e) => handlePinChange(enc.id, 'pinSW', e.target.value)}
                                  className="w-full bg-gray-800 border border-gray-700 rounded p-1.5 text-sm text-center font-mono focus:border-orange-500 outline-none"
                              />
                          </div>
                          <div>
                              <label className="text-xs text-gray-500 mb-1 block">Type</label>
                              <select 
                                  value={enc.swType} 
                                  onChange={(e) => updateEncoder(enc.id, { swType: e.target.value as 'CC' | 'Note' })}
                                  className="w-full bg-gray-800 border border-gray-700 rounded p-1.5 text-xs text-center focus:border-orange-500 outline-none text-white"
                              >
                                  <option value="CC">CC</option>
                                  <option value="Note">Note</option>
                              </select>
                          </div>
                          <div>
                              <label className="text-xs text-gray-500 mb-1 block">{enc.swType} Value</label>
                              <input
                                  type="number"
                                  value={enc.swValue}
                                  onChange={(e) => handlePinChange(enc.id, 'swValue', e.target.value)}
                                  className="w-full bg-gray-800 border border-gray-700 rounded p-1.5 text-sm text-center font-mono focus:border-orange-500 outline-none"
                              />
                          </div>
                      </div>
                  )}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
