export enum ComponentType {
  CCPotentiometer = 'CCPotentiometer',
  NoteButton = 'NoteButton',
  CCButton = 'CCButton',
  CCRotaryEncoder = 'CCRotaryEncoder',
  NoteLED = 'NoteLED',
  PBPotentiometer = 'PBPotentiometer',
  ButtonMatrix = 'ButtonMatrix',
  CCButtonMatrix = 'CCButtonMatrix',
  Multiplexer = 'Multiplexer',
  SSD1306Display = 'SSD1306Display',
}

export interface MidiComponent {
  id: string;
  type: ComponentType;
  name: string;
  pins: string[];
  channel: number; // 1-16
  address: number; // Note number or CC number
  color?: string; // UI helper color
  notes?: string; // User comments

  // Multiplexer specific
  parentId?: string; // ID of the Multiplexer this component is connected to
  muxPin?: number; // Pin on the multiplexer (0-15)

  // Matrix specific
  rowPins?: string[];
  colPins?: string[];
}

export interface ProjectConfig {
  name: string;
  author: string;
  interfaceType: 'USBMIDI_Interface' | 'HardwareSerialMIDI_Interface';
  baudRate?: number;
}

export const COMPONENT_TEMPLATES: Record<ComponentType, Partial<MidiComponent>> = {
  [ComponentType.CCPotentiometer]: {
    name: 'Volume Knob',
    pins: ['26'],
    channel: 1,
    address: 7, // Volume
  },
  [ComponentType.NoteButton]: {
    name: 'C4 Button',
    pins: ['2'],
    channel: 1,
    address: 60, // Middle C
  },
  [ComponentType.CCButton]: {
    name: 'Mute Button',
    pins: ['3'],
    channel: 1,
    address: 10,
  },
  [ComponentType.CCRotaryEncoder]: {
    name: 'Encoder 1',
    pins: ['4', '5'],
    channel: 1,
    address: 1,
  },
  [ComponentType.NoteLED]: {
    name: 'Status LED',
    pins: ['15'],
    channel: 1,
    address: 60,
  },
  [ComponentType.PBPotentiometer]: {
    name: 'Pitch Bend',
    pins: ['27'],
    channel: 1,
    address: 0,
  },
  [ComponentType.ButtonMatrix]: {
    name: 'Note Matrix',
    pins: [], // Not used for matrix, uses rowPins/colPins
    rowPins: ['6', '7', '8', '9'],
    colPins: ['10', '11', '12', '13'],
    channel: 1,
    address: 36, // Start note (C2)
  },
  [ComponentType.CCButtonMatrix]: {
    name: 'CC Matrix',
    pins: [],
    rowPins: ['6', '7', '8', '9'],
    colPins: ['10', '11', '12', '13'],
    channel: 1,
    address: 10, // Start CC
  },
  [ComponentType.Multiplexer]: {
    name: 'Mux 1',
    pins: ['26', '0', '1', '2', '3'], // [Signal, S0, S1, S2, S3]
    channel: 1,
    address: 0,
  },
  [ComponentType.SSD1306Display]: {
    name: 'OLED Display',
    pins: ['4', '5'], // [SDA, SCL]
    channel: 1,
    address: 0,
  }
};