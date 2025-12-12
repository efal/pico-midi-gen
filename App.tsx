
import * as React from 'react';
import { useState } from 'react';
import { AppConfig } from './types';
import { INITIAL_CONFIG } from './constants';
import { HardwareSettings } from './components/HardwareSettings';
import { MuxEditor } from './components/MuxEditor';
import { MatrixSettings } from './components/MatrixSettings';
import { TM1638Settings } from './components/TM1638Settings';
import { EncoderSettings } from './components/EncoderSettings';
import { generateArduinoCode, fixArduinoCode } from './services/geminiService';
import { Code, Download, Zap, Loader2, Copy, CheckCircle2, Bug, Wrench } from 'lucide-react';

export default function App() {
  const [config, setConfig] = useState<AppConfig>(INITIAL_CONFIG);
  const [generatedCode, setGeneratedCode] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  
  // Error fixing state
  const [showErrorPanel, setShowErrorPanel] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isFixing, setIsFixing] = useState(false);

  const cleanMarkdown = (text: string) => {
    let cleanCode = text;
    if (cleanCode.startsWith('```')) {
      cleanCode = cleanCode.replace(/^```[a-z]*\n/, '').replace(/```$/, '');
    }
    return cleanCode;
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    const code = await generateArduinoCode(config);
    setGeneratedCode(cleanMarkdown(code));
    setIsGenerating(false);
    // Reset error state when new code is generated
    setShowErrorPanel(false);
    setErrorMessage('');
  };

  const handleFixCode = async () => {
    if (!errorMessage.trim() || !generatedCode) return;
    
    setIsFixing(true);
    const fixedCode = await fixArduinoCode(generatedCode, errorMessage);
    setGeneratedCode(cleanMarkdown(fixedCode));
    setIsFixing(false);
    // Optionally keep the panel open or close it. Closing it shows the new code more clearly.
    setShowErrorPanel(false);
    setErrorMessage(''); 
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedCode);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const downloadCode = () => {
    const blob = new Blob([generatedCode], { type: 'text/x-c++src' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'MidiController.ino';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                AI MIDI Builder
              </h1>
              <p className="text-xs text-gray-400">Control_Surface Code Generator</p>
            </div>
          </div>
          <button
            onClick={handleGenerate}
            disabled={isGenerating || isFixing}
            className={`flex items-center gap-2 px-6 py-2 rounded-lg font-bold transition-all ${
              isGenerating || isFixing
                ? 'bg-gray-700 cursor-not-allowed text-gray-400'
                : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-lg hover:shadow-blue-500/25'
            }`}
          >
            {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Code className="w-5 h-5" />}
            {isGenerating ? 'Generating...' : 'Generate Code'}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Config */}
        <div className="lg:col-span-5 space-y-6 overflow-y-auto max-h-[calc(100vh-100px)] custom-scrollbar pb-20">
          <HardwareSettings config={config} onChange={setConfig} />
          <MatrixSettings config={config} onChange={setConfig} />
          <TM1638Settings config={config} onChange={setConfig} />
          <EncoderSettings config={config} onChange={setConfig} />
          <MuxEditor config={config} onChange={setConfig} />
        </div>

        {/* Right Column: Code Preview */}
        <div className="lg:col-span-7 flex flex-col h-full min-h-[500px] bg-gray-800 rounded-lg shadow-xl border border-gray-700 overflow-hidden">
          <div className="bg-gray-900 px-4 py-3 border-b border-gray-700 flex justify-between items-center">
            <span className="text-sm font-mono text-gray-400">MidiController.ino</span>
            <div className="flex gap-2">
              {generatedCode && (
                <>
                  <button 
                    onClick={() => setShowErrorPanel(!showErrorPanel)}
                    className={`p-2 rounded transition-colors ${showErrorPanel ? 'bg-red-900/50 text-red-400' : 'hover:bg-gray-800 text-gray-400 hover:text-white'}`}
                    title="Fix Compilation Errors"
                  >
                    <Bug className="w-5 h-5" />
                  </button>
                  <div className="w-px h-5 bg-gray-700 my-auto mx-1"></div>
                  <button 
                    onClick={copyToClipboard}
                    className="p-2 hover:bg-gray-800 rounded text-gray-400 hover:text-white transition-colors"
                    title="Copy to Clipboard"
                  >
                    {isCopied ? <CheckCircle2 className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5" />}
                  </button>
                  <button 
                    onClick={downloadCode}
                    className="p-2 hover:bg-gray-800 rounded text-gray-400 hover:text-white transition-colors"
                    title="Download .ino file"
                  >
                    <Download className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>
          </div>
          
          <div className="flex-1 flex flex-col relative bg-[#1e1e1e] min-h-0">
            {!generatedCode ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 space-y-4">
                <Code className="w-16 h-16 opacity-20" />
                <p className="text-sm">Configure your hardware and click Generate</p>
              </div>
            ) : (
              <textarea
                readOnly
                value={generatedCode}
                className="w-full h-full flex-1 bg-[#1e1e1e] text-gray-300 font-mono text-sm p-4 resize-none focus:outline-none"
                style={{ whiteSpace: 'pre' }}
              />
            )}
            
            {(isGenerating || isFixing) && (
              <div className="absolute inset-0 bg-gray-900/80 backdrop-blur-sm flex flex-col items-center justify-center z-20">
                 <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
                 <p className="text-white font-medium">
                   {isFixing ? 'Analyzing and Fixing Code...' : 'Drafting Arduino Sketch...'}
                 </p>
                 <p className="text-sm text-gray-400 mt-2">
                   {isFixing ? 'Consulting Gemini 2.5...' : 'Integrating Control_Surface library'}
                 </p>
              </div>
            )}

            {/* Error Fixing Panel */}
            {showErrorPanel && generatedCode && (
              <div className="border-t border-gray-700 bg-gray-800 p-4 animate-in slide-in-from-bottom-10">
                <div className="flex items-center gap-2 mb-2 text-red-400">
                  <Bug className="w-4 h-4" />
                  <h3 className="text-sm font-bold">Compilation Error Fixer</h3>
                </div>
                <p className="text-xs text-gray-400 mb-2">Paste the error message from Arduino IDE below:</p>
                <textarea 
                  value={errorMessage}
                  onChange={(e) => setErrorMessage(e.target.value)}
                  className="w-full h-24 bg-gray-900 border border-red-900/50 rounded p-2 text-xs font-mono text-red-100 placeholder-red-900/50 focus:border-red-500 focus:outline-none mb-3"
                  placeholder="Example: 'CD4067' was not declared in this scope..."
                />
                <div className="flex justify-end gap-2">
                  <button 
                    onClick={() => setShowErrorPanel(false)}
                    className="px-3 py-1.5 text-xs text-gray-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleFixCode}
                    disabled={!errorMessage.trim() || isFixing}
                    className="flex items-center gap-2 px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded text-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Wrench className="w-3 h-3" />
                    Fix Code
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
