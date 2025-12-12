
import * as React from 'react';
import { AppConfig, MatrixConfig } from '../types';
import { Hash, Power, HelpCircle, ArrowRightFromLine, ArrowLeftToLine, Zap } from 'lucide-react';

interface Props {
  config: AppConfig;
  onChange: (newConfig: AppConfig) => void;
}

export const MatrixSettings: React.FC<Props> = ({ config, onChange }) => {
  const updateMatrix = (id: string, updates: Partial<MatrixConfig>) => {
    const newMatrices = config.matrices.map((m) =>
      m.id === id ? { ...m, ...updates } : m
    );
    onChange({ ...config, matrices: newMatrices });
  };

  const handlePinChange = (matrixId: string, type: 'row' | 'col', index: number, value: string) => {
    const numVal = parseInt(value, 10);
    if (isNaN(numVal)) return;

    const matrix = config.matrices.find(m => m.id === matrixId);
    if (!matrix) return;

    const newPins = type === 'row' ? [...matrix.rowPins] : [...matrix.colPins];
    newPins[index] = numVal;

    updateMatrix(matrixId, type === 'row' ? { rowPins: newPins } : { colPins: newPins });
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700 space-y-6">
      <div className="flex items-center space-x-2 border-b border-gray-700 pb-2">
        <Hash className="text-yellow-400" />
        <h2 className="text-xl font-bold text-white">Button Matrices</h2>
        <div className="ml-auto group relative">
             <HelpCircle className="w-4 h-4 text-gray-500 cursor-help" />
             <div className="absolute right-0 w-72 bg-gray-900 text-xs text-gray-300 p-3 rounded-lg border border-gray-700 hidden group-hover:block z-50 shadow-xl">
                <p className="font-bold mb-2 text-white flex items-center gap-2">
                    <Hash className="w-3 h-3 text-yellow-400"/>
                    Matrix Wiring Guide
                </p>
                <p className="mb-2">Enable up to two 4x4 button grids (16 buttons each). The controller scans Rows and reads Columns.</p>
                <div className="grid grid-cols-2 gap-2 mt-2">
                    <div className="bg-gray-800 p-2 rounded border border-gray-700">
                        <span className="text-yellow-400 font-bold block mb-1">Rows (Out)</span>
                        Pulse signal sent by MCU.
                    </div>
                    <div className="bg-gray-800 p-2 rounded border border-gray-700">
                        <span className="text-blue-400 font-bold block mb-1">Cols (In)</span>
                        Signal read by MCU.
                    </div>
                </div>
             </div>
        </div>
      </div>

      {config.matrices.map((matrix, mIndex) => (
        <div key={matrix.id} className={`rounded-xl border transition-all duration-300 ${matrix.enabled ? 'bg-gray-750 border-gray-600 shadow-lg' : 'bg-gray-800/30 border-gray-700/50'}`}>
           {/* Header */}
           <div className={`flex items-center justify-between p-4 border-b ${matrix.enabled ? 'border-gray-700' : 'border-transparent'}`}>
              <div className="flex items-center gap-4">
                 <button
                    onClick={() => updateMatrix(matrix.id, { enabled: !matrix.enabled })}
                    className={`p-2 rounded-lg transition-all ${matrix.enabled ? 'bg-yellow-500 text-gray-900 shadow-yellow-500/20 shadow-lg' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'}`}
                    title={matrix.enabled ? "Disable Matrix" : "Enable Matrix"}
                 >
                    <Power className="w-4 h-4" />
                 </button>
                 <div>
                     {matrix.enabled ? (
                         <input 
                            type="text" 
                            value={matrix.name}
                            onChange={(e) => updateMatrix(matrix.id, { name: e.target.value })}
                            className="bg-transparent text-sm font-bold text-white focus:outline-none focus:border-b border-yellow-500 w-32 placeholder-gray-500"
                            placeholder="Matrix Name"
                         />
                     ) : (
                         <span className="text-sm font-medium text-gray-500">Matrix {mIndex + 1} (Disabled)</span>
                     )}
                 </div>
              </div>
              
              {matrix.enabled && (
                <div className="flex items-center gap-3 bg-gray-900/50 px-3 py-1.5 rounded-lg border border-gray-700/50">
                    <div className="text-right">
                        <label className="block text-[10px] text-gray-500 uppercase tracking-wide">Start CC</label>
                        <input 
                            type="number" 
                            value={matrix.startCC}
                            onChange={(e) => updateMatrix(matrix.id, { startCC: parseInt(e.target.value) || 0 })}
                            className="w-12 bg-transparent text-sm font-mono text-yellow-400 text-right focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                    </div>
                    <div className="w-px h-6 bg-gray-700"></div>
                    <div className="text-right">
                        <label className="block text-[10px] text-gray-500 uppercase tracking-wide">Channel</label>
                        <span className="text-sm font-mono text-gray-300">{matrix.midiChannel}</span>
                    </div>
                </div>
              )}
           </div>

           {/* Content */}
           {matrix.enabled && (
               <div className="p-4 grid grid-cols-1 gap-6 bg-gray-900/20">
                   {/* Rows Configuration */}
                   <div className="space-y-3">
                       <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-gray-400 flex items-center gap-2 uppercase tracking-wider">
                             <ArrowRightFromLine className="w-3 h-3 text-yellow-500" /> 
                             Row Pins (Out)
                          </label>
                       </div>
                       
                       <div className="grid grid-cols-4 gap-3">
                           {matrix.rowPins.map((pin, i) => (
                               <div key={`r-${i}`} className="group relative">
                                   <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-gray-300 text-[10px] rounded border border-gray-700 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 whitespace-nowrap shadow-xl">
                                       Connect to <span className="text-yellow-400 font-bold">Row {i+1}</span> of Keypad
                                   </div>
                                   <div className="flex flex-col items-center bg-gray-800 border border-gray-700 rounded-lg py-2 px-1 hover:border-yellow-500/50 transition-colors group-hover:bg-gray-800/80">
                                       <span className="text-[10px] text-gray-500 font-mono mb-1">R{i+1}</span>
                                       <input
                                           type="number"
                                           value={pin}
                                           onChange={(e) => handlePinChange(matrix.id, 'row', i, e.target.value)}
                                           className="w-full bg-transparent text-center font-mono text-sm font-bold text-yellow-400 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                       />
                                   </div>
                               </div>
                           ))}
                       </div>
                   </div>

                   {/* Columns Configuration */}
                   <div className="space-y-3">
                       <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-gray-400 flex items-center gap-2 uppercase tracking-wider">
                             <ArrowLeftToLine className="w-3 h-3 text-blue-400" />
                             Col Pins (In)
                          </label>
                       </div>

                       <div className="grid grid-cols-4 gap-3">
                           {matrix.colPins.map((pin, i) => (
                               <div key={`c-${i}`} className="group relative">
                                   <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-gray-300 text-[10px] rounded border border-gray-700 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 whitespace-nowrap shadow-xl">
                                       Connect to <span className="text-blue-400 font-bold">Col {i+1}</span> of Keypad
                                   </div>
                                   <div className="flex flex-col items-center bg-gray-800 border border-gray-700 rounded-lg py-2 px-1 hover:border-blue-500/50 transition-colors group-hover:bg-gray-800/80">
                                       <span className="text-[10px] text-gray-500 font-mono mb-1">C{i+1}</span>
                                       <input
                                           type="number"
                                           value={pin}
                                           onChange={(e) => handlePinChange(matrix.id, 'col', i, e.target.value)}
                                           className="w-full bg-transparent text-center font-mono text-sm font-bold text-blue-400 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                       />
                                   </div>
                               </div>
                           ))}
                       </div>
                   </div>
                   
                   <div className="col-span-1 flex items-center justify-center gap-2 text-[10px] text-gray-500 font-mono pt-2 border-t border-gray-700/30">
                      <Zap className="w-3 h-3" />
                      Mapped to MIDI Notes/CC {matrix.startCC} through {matrix.startCC + 15}
                   </div>
               </div>
           )}
        </div>
      ))}
    </div>
  );
};
