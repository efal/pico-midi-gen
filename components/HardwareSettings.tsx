
import * as React from 'react';
import { AppConfig, McuType, PinConfig } from '../types';
import { DEFAULT_PINS_ESP32S3, DEFAULT_PINS_PICO } from '../constants';
import { Wrench, Zap, Tv, Sliders } from 'lucide-react';

interface Props {
  config: AppConfig;
  onChange: (newConfig: AppConfig) => void;
}

export const HardwareSettings: React.FC<Props> = ({ config, onChange }) => {
  const handleMcuChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newMcu = e.target.value as McuType;
    const newPins = newMcu === McuType.ESP32S3 ? DEFAULT_PINS_ESP32S3 : DEFAULT_PINS_PICO;
    onChange({ ...config, mcu: newMcu, pins: newPins });
  };

  const handlePinChange = (key: keyof PinConfig, value: string) => {
    const numVal = parseInt(value, 10);
    if (!isNaN(numVal)) {
      onChange({
        ...config,
        pins: { ...config.pins, [key]: numVal },
      });
    }
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700 space-y-6">
      <div className="flex items-center space-x-2 border-b border-gray-700 pb-2">
        <Wrench className="text-blue-400" />
        <h2 className="text-xl font-bold text-white">Hardware Setup</h2>
      </div>

      {/* MCU Selection */}
      <div className="space-y-2">
        <label className="flex items-center space-x-2 text-sm font-medium text-gray-300">
          <Zap className="w-4 h-4" />
          <span>Microcontroller</span>
        </label>
        <select
          value={config.mcu}
          onChange={handleMcuChange}
          className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
        >
          <option value={McuType.ESP32S3}>{McuType.ESP32S3}</option>
          <option value={McuType.PICO}>{McuType.PICO}</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Multiplexer Pins */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-blue-400 flex items-center gap-2">
             <Sliders className="w-4 h-4"/> CD4067 Multiplexers
          </h3>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-gray-400">Address S0</label>
              <input type="number" value={config.pins.s0} onChange={(e) => handlePinChange('s0', e.target.value)} className="w-full bg-gray-900 border border-gray-600 rounded p-1 text-sm" />
            </div>
            <div>
              <label className="text-xs text-gray-400">Address S1</label>
              <input type="number" value={config.pins.s1} onChange={(e) => handlePinChange('s1', e.target.value)} className="w-full bg-gray-900 border border-gray-600 rounded p-1 text-sm" />
            </div>
            <div>
              <label className="text-xs text-gray-400">Address S2</label>
              <input type="number" value={config.pins.s2} onChange={(e) => handlePinChange('s2', e.target.value)} className="w-full bg-gray-900 border border-gray-600 rounded p-1 text-sm" />
            </div>
            <div>
              <label className="text-xs text-gray-400">Address S3</label>
              <input type="number" value={config.pins.s3} onChange={(e) => handlePinChange('s3', e.target.value)} className="w-full bg-gray-900 border border-gray-600 rounded p-1 text-sm" />
            </div>
            <div className="col-span-2 mt-2">
              <label className="text-xs text-gray-400">Mux 1 Signal Pin (Analog)</label>
              <input type="number" value={config.pins.mux1Signal} onChange={(e) => handlePinChange('mux1Signal', e.target.value)} className="w-full bg-gray-900 border border-gray-600 rounded p-1 text-sm" />
            </div>
            <div className="col-span-2">
              <label className="text-xs text-gray-400">Mux 2 Signal Pin (Analog)</label>
              <input type="number" value={config.pins.mux2Signal} onChange={(e) => handlePinChange('mux2Signal', e.target.value)} className="w-full bg-gray-900 border border-gray-600 rounded p-1 text-sm" />
            </div>
          </div>
        </div>

        {/* Display Pins */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-purple-400 flex items-center gap-2">
            <Tv className="w-4 h-4"/> ST7735 Display
          </h3>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-gray-400">CS</label>
              <input type="number" value={config.pins.tftCS} onChange={(e) => handlePinChange('tftCS', e.target.value)} className="w-full bg-gray-900 border border-gray-600 rounded p-1 text-sm" />
            </div>
            <div>
              <label className="text-xs text-gray-400">RST</label>
              <input type="number" value={config.pins.tftRST} onChange={(e) => handlePinChange('tftRST', e.target.value)} className="w-full bg-gray-900 border border-gray-600 rounded p-1 text-sm" />
            </div>
            <div>
              <label className="text-xs text-gray-400">DC</label>
              <input type="number" value={config.pins.tftDC} onChange={(e) => handlePinChange('tftDC', e.target.value)} className="w-full bg-gray-900 border border-gray-600 rounded p-1 text-sm" />
            </div>
            <div>
              <label className="text-xs text-gray-400">Page Button</label>
              <input type="number" value={config.pins.pageButton} onChange={(e) => handlePinChange('pageButton', e.target.value)} className="w-full bg-gray-900 border border-gray-600 rounded p-1 text-sm border-yellow-700/50" />
            </div>
             <div className="col-span-2">
              <label className="text-xs text-gray-400">MOSI (SPI Data)</label>
              <input type="number" value={config.pins.tftMOSI} onChange={(e) => handlePinChange('tftMOSI', e.target.value)} className="w-full bg-gray-900 border border-gray-600 rounded p-1 text-sm" />
            </div>
             <div className="col-span-2">
              <label className="text-xs text-gray-400">SCLK (SPI Clock)</label>
              <input type="number" value={config.pins.tftSCLK} onChange={(e) => handlePinChange('tftSCLK', e.target.value)} className="w-full bg-gray-900 border border-gray-600 rounded p-1 text-sm" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
