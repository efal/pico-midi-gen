
import { AppConfig, McuType } from './types';

export const DEFAULT_PINS_ESP32S3 = {
  s0: 4,
  s1: 5,
  s2: 6,
  s3: 7,
  mux1Signal: 1, // ADC1
  mux2Signal: 2, // ADC2
  tftCS: 10,
  tftRST: 11,
  tftDC: 12,
  tftMOSI: 13,
  tftSCLK: 14,
  pageButton: 30, 
};

export const DEFAULT_PINS_PICO = {
  s0: 2,
  s1: 3,
  s2: 4,
  s3: 5,
  mux1Signal: 26, // ADC0
  mux2Signal: 27, // ADC1
  tftCS: 17,
  tftRST: 18,
  tftDC: 19,
  tftMOSI: 19, // SPI0 TX
  tftSCLK: 18, // SPI0 SCK
  pageButton: 15,
};

export const INITIAL_CONFIG: AppConfig = {
  mcu: McuType.ESP32S3,
  pins: DEFAULT_PINS_ESP32S3,
  midiChannel: 1,
  controllerName: "My VDJ Controller",
  controls: Array.from({ length: 32 }, (_, i) => ({
    id: `ctrl-${i}`,
    muxIndex: i < 16 ? 0 : 1,
    channelIndex: i % 16,
    name: i < 16 ? `Fader A-${(i % 16) + 1}` : `Knob B-${(i % 16) + 1}`,
    midiCC: 10 + i,
    enabled: true,
  })),
  matrices: [
    {
      id: 'matrix-1',
      enabled: false,
      name: 'FX Grid 1',
      startCC: 60,
      midiChannel: 4,
      rowPins: [15, 16, 17, 18], // Safe default GPIOs for S3
      colPins: [19, 20, 21, 35]  // Safe default GPIOs for S3
    },
    {
      id: 'matrix-2',
      enabled: false,
      name: 'FX Grid 2',
      startCC: 80,
      midiChannel: 4,
      rowPins: [36, 37, 38, 39], // Safe default GPIOs for S3
      colPins: [40, 41, 42, 0]   // Warning: 0 is bootstrap, user might need to change
    }
  ],
  tm1638s: [
    {
      id: 'tm-1',
      enabled: false,
      name: 'Transport A',
      startCC: 90,
      midiChannel: 5,
      stbPin: 33,
      clkPin: 34,
      dioPin: 35
    },
    {
      id: 'tm-2',
      enabled: false,
      name: 'Transport B',
      startCC: 100,
      midiChannel: 5,
      stbPin: 21,
      clkPin: 22,
      dioPin: 23
    }
  ],
  encoders: [
    {
      id: 'enc-1',
      enabled: false,
      name: 'Master Vol',
      pinA: 8,
      pinB: 9,
      midiCC: 7,
      channel: 1,
      hasSwitch: true,
      pinSW: 46,
      swType: 'Note',
      swValue: 0
    },
    {
      id: 'enc-2',
      enabled: false,
      name: 'Cue Mix',
      pinA: 47,
      pinB: 48,
      midiCC: 15,
      channel: 1,
      hasSwitch: true,
      pinSW: 45,
      swType: 'Note',
      swValue: 1
    }
  ]
};
