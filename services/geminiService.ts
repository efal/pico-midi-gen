
import { GoogleGenAI } from "@google/genai";
import { AppConfig } from "../types";

// Initialize AI client lazily to avoid top-level crashes if env vars are missing
const getAiClient = () => {
  const apiKey = process.env.API_KEY || "";
  if (!apiKey) {
    console.warn("GEMINI_API_KEY is not set. AI features will fail.");
  }
  return new GoogleGenAI({ apiKey });
};

// The user provided this working example. We use it as a template for style and structure.
const REFERENCE_CODE_TEMPLATE = `
/*
 =========================================================
 PROJECT: [TEMPLATE: Project Name]
 DATE:    [TEMPLATE: Date]
 
 HARDWARE MANIFEST:
 - MCU: [TEMPLATE: MCU Name]
 - Display: ST7735 (160x128) via SPI
 - Input A: CD74HC4067 (16ch) -> Pin [TEMPLATE: Signal A]
 - Input B: CD74HC4067 (16ch) -> Pin [TEMPLATE: Signal B]
 - Matrices: [TEMPLATE: Matrix Summary]
 - Encoders: [TEMPLATE: Encoder Summary]
 - TM1638 Modules: [TEMPLATE: TM1638 Summary]
 
 PIN MAPPING:
 - Mux Addr: S0=[TEMPLATE: S0], S1=[TEMPLATE: S1], S2=[TEMPLATE: S2], S3=[TEMPLATE: S3]
 - TFT: CS=[TEMPLATE: CS], DC=[TEMPLATE: DC], RST=[TEMPLATE: RST], MOSI=[TEMPLATE: MOSI], SCLK=[TEMPLATE: SCLK]
 
 ARCHITECTURE:
 - Manual Multiplexer Scanning (loop-based) ensures stability.
 - Control_Surface library handles MIDI transport, Matrices and Encoders.
 - TM1638plus library handles LED/Button modules.
 - Dynamic Display Engine updates only changed values to optimize frame rate.
 =========================================================
*/

#include <Control_Surface.h>
#include <Adafruit_GFX.h>
#include <Adafruit_ST7735.h>
#include <SPI.h>
#include <TM1638plus.h> // REQUIRES: TM1638plus library by Gavin Lyons

// Color Definitions
#ifndef ST77XX_DARKGREY
#define ST77XX_DARKGREY 0x4208 // Dark Grey 565
#endif

// ================= TFT Display =========================
// [TEMPLATE: Define Pins based on config]
#define TFT_CS    10
#define TFT_DC    12
#define TFT_RST   11
Adafruit_ST7735 tft = Adafruit_ST7735(TFT_CS, TFT_DC, TFT_RST);

// ================= MIDI Interface ======================
USBMIDI_Interface midi;

// ================= Multiplexer Setup ===================
// [TEMPLATE: Define Mux Pins based on config]
const int S0 = 4, S1 = 5, S2 = 6, S3 = 7;
const int SIG_A = 1; // Mux 1 Signal
const int SIG_B = 2; // Mux 2 Signal

const int muxChannels = 16;
int lastValuesA[muxChannels];
int lastValuesB[muxChannels];

// [TEMPLATE: CC Maps generated from JSON]
byte ccMapA[muxChannels] = { /* ... */ };
byte ccMapB[muxChannels] = { /* ... */ };

// ================= Matrices ============================
// [TEMPLATE: Matrix Declarations]
/* 
// Correct Syntax Example:
const PinList<4> rowPins1 = { 1, 2, 3, 4 };
const PinList<4> colPins1 = { 5, 6, 7, 8 };
const AddressMatrix<4, 4> addresses1 = {{
  {60, 61, 62, 63},
  {64, 65, 66, 67},
  {68, 69, 70, 71},
  {72, 73, 74, 75}
}};
CCButtonMatrix<4, 4> matrix1 { rowPins1, colPins1, addresses1, Channel_4 };
*/

// ================= Encoders ============================
// [TEMPLATE: Encoder Declarations]
// CCRotaryEncoder enc1({PinA, PinB}, {CC, Channel}, 1);
// CCButton enc1Switch(PinSW, {Value, Channel});

// ================= TM1638 Modules ======================
// [TEMPLATE: TM1638 Object Declarations]
// TM1638plus tm1(STB, CLK, DIO);
// byte tm1Buttons = 0;

// ================= UI Layout Config ====================
struct ControlLayout {
  int8_t page; // -1 if disabled/hidden
  int8_t x;
  int8_t y;
  const char* label;
};

// [TEMPLATE: Layout Map Table - Auto-generated to pack enabled controls]
// ControlLayout layoutMap[2][16]; 
const int totalPages = [TEMPLATE: Calculated Page Count];

// ================= UI State ============================
const int pageButtonPin = 30;
int currentPage = 0;
unsigned long lastDebounceTime = 0;

// ================= Display Logic =======================
void drawHeader() {
  tft.fillScreen(ST77XX_BLACK);
  tft.setTextColor(ST77XX_WHITE);
  tft.setTextSize(1);
  
  // Header Bar
  tft.fillRect(0, 0, 160, 15, ST77XX_BLUE);
  
  // Project Name
  tft.setCursor(4, 4);
  tft.print("[TEMPLATE: Project Name Short]"); 
  
  // Page Counter
  tft.setCursor(120, 4);
  tft.print(currentPage + 1); tft.print("/"); tft.print(totalPages);
}

// Helper to draw a single control value
// Uses direct coordinate mapping for maximum speed
void updateControlOnScreen(int muxIndex, int channelIndex, int value) {
  ControlLayout l = layoutMap[muxIndex][channelIndex];
  
  // Only draw if on current page and enabled
  if (l.page == -1 || l.page != currentPage) return;

  // Clear area (optimized for speed)
  // Layout assumes: Label(20px) : Value(20px) [Bar(30px)]
  // We clear the value and bar area
  tft.fillRect(l.x + 20, l.y, 60, 8, ST77XX_BLACK);
  
  // Draw Label
  tft.setTextColor(ST77XX_CYAN); // Label Color
  tft.setCursor(l.x, l.y);
  tft.print(l.label);
  
  // Draw Value
  tft.setTextColor(ST77XX_WHITE);
  tft.setCursor(l.x + 22, l.y);
  tft.print(value);
  
  // Draw Mini Bar
  int barWidth = map(value, 0, 127, 0, 30);
  int barColor = (value > 120) ? ST77XX_RED : ST77XX_GREEN;
  tft.fillRect(l.x + 45, l.y + 2, 30, 4, ST77XX_DARKGREY);
  tft.fillRect(l.x + 45, l.y + 2, barWidth, 4, barColor);
}

// ================= Helper: Multiplexer Select ==========
void setMuxChannel(int channel) {
  digitalWrite(S0, channel & 0x01);
  digitalWrite(S1, channel & 0x02);
  digitalWrite(S2, channel & 0x04);
  digitalWrite(S3, channel & 0x08);
}

// ================= Setup ===============================
void setup() {
  Control_Surface.begin();

  // === HARDWARE INITIALIZATION ===
  pinMode(S0, OUTPUT); pinMode(S1, OUTPUT);
  pinMode(S2, OUTPUT); pinMode(S3, OUTPUT);
  pinMode(pageButtonPin, INPUT_PULLUP);

  // === TM1638 INIT ===
  // [TEMPLATE: tm.displayBegin()]

  // === DISPLAY STARTUP ===
  // [TEMPLATE: Init TFT]
  tft.initR(INITR_BLACKTAB);
  tft.setRotation(1); // Landscape
  drawHeader();

  // Initialize value trackers
  for (int i = 0; i < muxChannels; i++) {
    lastValuesA[i] = -1;
    lastValuesB[i] = -1;
  }
}

// ================= Loop ================================
void loop() {
  // 1. Update Matrix & MIDI Transport (handled by library)
  Control_Surface.loop();

  // 2. TM1638 Input Scanning
  /* 
     [TEMPLATE: TM1638 Loop Logic]
     byte buttons = tm.readButtons();
     for (int i=0; i<8; i++) {
       // Check changes, send CC, toggle LED
     }
  */

  // 3. Page Switching Logic (Debounced)
  if (digitalRead(pageButtonPin) == LOW) {
    if (millis() - lastDebounceTime > 250) {
      currentPage++;
      if (currentPage >= totalPages) currentPage = 0;
      drawHeader();
      
      // Force refresh of values for the new page
      for(int i=0; i<muxChannels; i++) { 
         // Redraw only if values are known
         if (lastValuesA[i] > -1) updateControlOnScreen(0, i, lastValuesA[i]);
         if (lastValuesB[i] > -1) updateControlOnScreen(1, i, lastValuesB[i]);
      }
      lastDebounceTime = millis();
    }
  }

  // 4. Manual Multiplexer Scanning
  // We scan manually to decouple analog reads from the heavy Control_Surface object model
  // This allows for cleaner integration with the TFT drawing logic.

  // ---------- Mux 1 (Deck A) ----------
  for (int ch = 0; ch < muxChannels; ch++) {
    setMuxChannel(ch);
    delayMicroseconds(5); // Stabilization time
    int raw = analogRead(SIG_A);
    int midiVal = raw >> 5; // 12-bit to 7-bit

    if (abs(midiVal - lastValuesA[ch]) > 1) { // Hysteresis
      lastValuesA[ch] = midiVal;
      Control_Surface.sendControlChange(MIDIAddress(ccMapA[ch], Channel_1), midiVal);
      updateControlOnScreen(0, ch, midiVal);
    }
  }

  // ---------- Mux 2 (Deck B) ----------
  for (int ch = 0; ch < muxChannels; ch++) {
    setMuxChannel(ch);
    delayMicroseconds(5);
    int raw = analogRead(SIG_B);
    int midiVal = raw >> 5; 

    if (abs(midiVal - lastValuesB[ch]) > 1) {
      lastValuesB[ch] = midiVal;
      Control_Surface.sendControlChange(MIDIAddress(ccMapB[ch], Channel_2), midiVal);
      updateControlOnScreen(1, ch, midiVal);
    }
  }
}
`;

export const generateArduinoCode = async (config: AppConfig): Promise<string> => {
  const model = "gemini-2.5-flash";

  // Prepare CC Maps
  const controlsA = config.controls.filter(c => c.muxIndex === 0).sort((a, b) => a.channelIndex - b.channelIndex);
  const controlsB = config.controls.filter(c => c.muxIndex === 1).sort((a, b) => a.channelIndex - b.channelIndex);

  const ccMapA = Array.from({ length: 16 }, (_, i) => controlsA.find(c => c.channelIndex === i)?.midiCC || 0);
  const ccMapB = Array.from({ length: 16 }, (_, i) => controlsB.find(c => c.channelIndex === i)?.midiCC || 0);

  // Prepare Matrix Config
  // Pre-calculate the 2D CC Grid for the AI
  const enabledMatrices = config.matrices.filter(m => m.enabled).map(m => {
    const rows = [];
    for (let r = 0; r < 4; r++) {
      const row = [];
      for (let c = 0; c < 4; c++) {
        row.push(m.startCC + (r * 4) + c);
      }
      rows.push(`{${row.join(', ')}}`);
    }
    const ccGrid = `{\n    ${rows.join(',\n    ')}\n  }`;

    return {
      ...m,
      ccGridString: ccGrid
    };
  });

  const enabledTMs = config.tm1638s ? config.tm1638s.filter(t => t.enabled) : [];

  const enabledEncoders = config.encoders ? config.encoders.filter(e => e.enabled) : [];

  const prompt = `
  You are an expert embedded systems engineer.
  
  TASK:
  Generate a robust Arduino C++ sketch for a MIDI Controller using the **Reference Pattern** provided. 
  
  CONFIGURATION:
  - Project Name: ${config.controllerName}
  - Date: ${new Date().toLocaleDateString()}
  - MCU: ${config.mcu}
  - Pins:
    - Mux Addr: ${config.pins.s0}, ${config.pins.s1}, ${config.pins.s2}, ${config.pins.s3}
    - Mux 1 Sig: ${config.pins.mux1Signal}
    - Mux 2 Sig: ${config.pins.mux2Signal}
    - TFT: CS=${config.pins.tftCS}, RST=${config.pins.tftRST}, DC=${config.pins.tftDC}, MOSI=${config.pins.tftMOSI}, SCLK=${config.pins.tftSCLK}
    - Page Btn: ${config.pins.pageButton}
  
  DATA MAPS:
  - Mux 1 CC Map: { ${ccMapA.join(', ')} }
  - Mux 2 CC Map: { ${ccMapB.join(', ')} }
  - Enabled Controls Mux 1: ${controlsA.filter(c => c.enabled).map(c => c.channelIndex).join(',')}
  - Enabled Controls Mux 2: ${controlsB.filter(c => c.enabled).map(c => c.channelIndex).join(',')}

  MATRICES:
  ${enabledMatrices.length === 0 ? "No matrices enabled." : enabledMatrices.map((m, i) => `
    Matrix ${i + 1}: 
      Rows={${m.rowPins.join(',')}}
      Cols={${m.colPins.join(',')}}
      Channel=${m.midiChannel}
      Address Grid = ${m.ccGridString}
  `).join('\n')}
  
  ENCODERS:
  ${enabledEncoders.length === 0 ? "No encoders enabled." : enabledEncoders.map((e, i) => `
    Encoder ${i + 1}:
      Pin A=${e.pinA}, Pin B=${e.pinB}
      CC=${e.midiCC}, Channel=${e.channel}
      ${e.hasSwitch ? `Switch Pin=${e.pinSW}, Type=${e.swType}, Value=${e.swValue}` : 'No Switch'}
  `).join('\n')}

  TM1638 MODULES:
  ${enabledTMs.length === 0 ? "No TM1638 modules." : enabledTMs.map((t, i) => `
    TM1638 Module ${i + 1}:
      STB=${t.stbPin}, CLK=${t.clkPin}, DIO=${t.dioPin}
      Start CC=${t.startCC} (Maps 8 buttons: ${t.startCC}-${t.startCC + 7})
      Channel=${t.midiChannel}
  `).join('\n')}

  REFERENCE CODE TEMPLATE (FOLLOW STRICTLY):
  \`\`\`cpp
  ${REFERENCE_CODE_TEMPLATE}
  \`\`\`

  INSTRUCTIONS:
  1. **Structure**: Keep the manual MUX scanning loop and the \`updateControlOnScreen\` function.
  2. **Dynamic Layout**: 
     - Generate a global \`ControlLayout layoutMap[2][16]\` initialized with values for all 32 channels.
     - **Layout Algorithm**: Iterate through ALL enabled controls (across both Muxes) sequentially.
       - Fill Page 0 with the first 16 enabled controls.
       - Fill Page 1 with the next 16 enabled controls (if any).
       - For each page, layout in 2 columns (Left Col: x=5, Right Col: x=85).
       - Rows: start y=20, increment by 12px per item.
       - For DISABLED controls or unused channels, explicitly set \`page = -1\`.
       - **CRITICAL**: Define \`const int totalPages = X;\` where X is the calculated number of pages (1 or 2).
     - Assign short labels (e.g. "A1", "A2", "B1") based on the Mux/Channel index.
  3. **Matrices**: 
     - Use standard \`CCButtonMatrix\`. 
     - **CRITICAL**: Define the addresses using proper 2D array syntax: \`const AddressMatrix<4, 4> addresses = {{ {r1...}, {r2...}, {r3...}, {r4...} }};\`. 
  4. **Encoders**:
     - Instantiate \`CCRotaryEncoder\` for each enabled encoder.
       - Syntax: \`CCRotaryEncoder enc1 = { {pinA, pinB}, {MIDI_CC::Channel_X, CC_Value} };\` OR \`CCRotaryEncoder enc1 = { {pinA, pinB}, {CC_Value, Channel_X} };\`
       - Note: Control Surface uses \`{number, channel}\` usually.
     - If Has Switch:
       - If Type == 'CC', use \`CCButton\`.
       - If Type == 'Note', use \`NoteButton\`.
       - Syntax: \`CCButton enc1Switch = { pin, {value, channel} };\`
  5. **TM1638**:
     - If enabled, instantiate \`TM1638plus tmX(STB, CLK, DIO);\` globally.
     - In \`setup()\`: Call \`tmX.displayBegin();\`.
     - In \`loop()\`: Implement manual polling for buttons.
       - Read \`byte keys = tmX.readButtons();\`
       - Compare with \`lastKeys\`.
       - Iterate 0-7: If bit changed, send MIDI CC (Value 127 for Press, 0 for Release).
       - **Feedback**: When button pressed (bit=1), set corresponding LED ON (\`tmX.setLED(i, 1)\`). OFF when released.
  6. **ADC Resolution**: Shift bits correctly for ${config.mcu} (S3 >> 5, Pico >> 3).
  7. **Header**: 
     - Populate the file header comments.
     - In \`drawHeader()\`, replace \`[TEMPLATE: Project Name Short]\` with "${config.controllerName}" (use text string, truncate to 10 chars).
  
  OUTPUT:
  Return ONLY the compilable C++ code in a markdown block.
  `;

  try {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error generating code:", error);
    return "// Error generating code. Please check your API Key and try again.";
  }
};

export const fixArduinoCode = async (currentCode: string, errorMessage: string): Promise<string> => {
  const model = "gemini-2.5-flash";

  const prompt = `
  You are an expert embedded systems engineer.
  The user is trying to compile the following Arduino sketch but has errors.
  
  CONTEXT: 
  - Manual multiplexer scanning + Control_Surface.
  - TM1638plus library used for LED&Keys.
  - "ToggleCCButtonmatrix" is INVALID. Use "CCButtonMatrix".
  - If "AddressMatrix" template args are wrong, fix them.
  - **AddressMatrix** must use 2D array syntax: \`{{ {1,2,3,4}, {5,6,7,8}... }}\`.
  - Missing color definitions (ST77XX_DARKGREY) should be defined as hex: #define ST77XX_DARKGREY 0x4208
  - Ensure \`const int totalPages\` is defined if missing.
  - CCRotaryEncoder syntax: \`CCRotaryEncoder enc = { {pinA, pinB}, {address, channel}, speed };\`
  
  CURRENT CODE:
  \`\`\`cpp
  ${currentCode}
  \`\`\`

  ERROR MESSAGE:
  ${errorMessage}

  TASK:
  Fix the compilation errors. Return ONLY the corrected C++ code.
  `;

  try {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error fixing code:", error);
    return "// Error fixing code. Please check your API Key and try again.";
  }
};
