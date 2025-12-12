
export enum McuType {
  ESP32S3 = 'ESP32 S3',
  PICO = 'Raspberry Pi Pico'
}

export interface PinConfig {
  // CD4067 Control Pins (S0-S3) shared between muxes
  s0: number;
  s1: number;
  s2: number;
  s3: number;
  // Signal Pins
  mux1Signal: number;
  mux2Signal: number;
  // TFT Pins
  tftCS: number;
  tftRST: number;
  tftDC: number;
  tftMOSI: number;
  tftSCLK: number;
  // Other
  pageButton: number;
}

export interface ControlDefinition {
  id: string;
  muxIndex: 0 | 1; // Which multiplexer (0 or 1)
  channelIndex: number; // 0-15
  name: string;
  midiCC: number;
  enabled: boolean;
}

export interface MatrixConfig {
  id: string;
  enabled: boolean;
  name: string;
  startCC: number;
  midiChannel: number;
  rowPins: number[]; // Array of 4 pins
  colPins: number[]; // Array of 4 pins
}

export interface TM1638Config {
  id: string;
  enabled: boolean;
  name: string;
  startCC: number;
  midiChannel: number;
  stbPin: number;
  clkPin: number;
  dioPin: number;
}

export interface EncoderConfig {
  id: string;
  enabled: boolean;
  name: string;
  pinA: number;
  pinB: number;
  midiCC: number; // Rotation CC
  channel: number;
  
  // Switch
  hasSwitch: boolean;
  pinSW: number;
  swType: 'CC' | 'Note';
  swValue: number; // CC number or Note number
}

export interface AppConfig {
  mcu: McuType;
  pins: PinConfig;
  controls: ControlDefinition[];
  matrices: MatrixConfig[];
  tm1638s: TM1638Config[];
  encoders: EncoderConfig[];
  midiChannel: number;
  controllerName: string;
}
