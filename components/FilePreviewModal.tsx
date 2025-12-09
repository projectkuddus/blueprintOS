
import React, { useState, useEffect } from 'react';
import { Asset } from '../types';
import { X, Download, Maximize2, FileText, Grid, Box, Layers, ZoomIn, ZoomOut, AlertCircle } from 'lucide-react';

interface FilePreviewModalProps {
  file: Asset | null;
  isOpen: boolean;
  onClose: () => void;
}

const FilePreviewModal: React.FC<FilePreviewModalProps> = ({ file, isOpen, onClose }) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      const timer = setTimeout(() => setLoading(false), 800); // Simulate load time
      return () => clearTimeout(timer);
    }
  }, [isOpen, file]);

  if (!isOpen || !file) return null;

  const isImage = file.type === 'image';
  const isPDF = file.type === 'pdf';
  const isCAD = file.type === 'cad' || file.type === '3d';
  const isExcel = file.type === 'document' && (file.title.endsWith('xlsx') || file.title.endsWith('xls') || file.title.endsWith('csv'));

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-3">
          <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-bold uppercase tracking-widest">Loading Viewer...</p>
        </div>
      );
    }

    if (isImage) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-zinc-100/50 p-4">
          <img 
            src={file.url} 
            alt={file.title} 
            className="max-w-full max-h-full object-contain shadow-lg border border-slate-200" 
          />
        </div>
      );
    }

    if (isPDF) {
      return (
        <iframe 
          src={`${file.url}#toolbar=0`} 
          className="w-full h-full"
          title="PDF Viewer"
        />
      );
    }

    if (isExcel) {
      // Simulation of a spreadsheet viewer since we can't easily embed local/blob excel files without libraries
      return (
        <div className="w-full h-full flex flex-col bg-white">
          {/* Fake Toolbar */}
          <div className="h-10 border-b border-slate-200 bg-zinc-50 flex items-center px-4 gap-4">
             <div className="flex gap-1">
                <div className="w-20 h-4 bg-slate-200 rounded-sm"></div>
                <div className="w-16 h-4 bg-slate-200 rounded-sm"></div>
             </div>
             <div className="h-4 w-px bg-slate-300"></div>
             <div className="flex gap-2 text-slate-400">
                <Grid size={14} />
                <span className="text-[10px] font-bold uppercase">Spreadsheet View</span>
             </div>
          </div>
          {/* Fake Grid */}
          <div className="flex-1 overflow-auto p-8 relative">
             <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 pointer-events-none opacity-50">
                <Grid size={64} className="mb-4" />
                <p className="text-xs font-bold uppercase">Preview Mode</p>
             </div>
             <table className="w-full border-collapse text-xs text-slate-600">
                <thead>
                   <tr>
                      <th className="border border-slate-200 bg-zinc-50 p-2 w-10"></th>
                      <th className="border border-slate-200 bg-zinc-50 p-2 w-32">A</th>
                      <th className="border border-slate-200 bg-zinc-50 p-2 w-32">B</th>
                      <th className="border border-slate-200 bg-zinc-50 p-2 w-32">C</th>
                      <th className="border border-slate-200 bg-zinc-50 p-2 flex-1">D</th>
                   </tr>
                </thead>
                <tbody>
                   {[...Array(20)].map((_, i) => (
                      <tr key={i}>
                         <td className="border border-slate-200 bg-zinc-50 p-2 text-center font-bold text-slate-400">{i+1}</td>
                         <td className="border border-slate-200 p-2"></td>
                         <td className="border border-slate-200 p-2"></td>
                         <td className="border border-slate-200 p-2"></td>
                         <td className="border border-slate-200 p-2"></td>
                      </tr>
                   ))}
                </tbody>
             </table>
          </div>
        </div>
      );
    }

    if (isCAD) {
        return (
            <div className="w-full h-full bg-[#1a1a1a] flex flex-col relative overflow-hidden">
                {/* CAD Grid Simulation */}
                <div className="absolute inset-0 opacity-20" 
                    style={{ 
                        backgroundImage: `linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)`, 
                        backgroundSize: '40px 40px' 
                    }}
                ></div>
                
                {/* Fake CAD UI */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                    <button className="bg-black/50 text-white p-2 border border-white/20 hover:bg-black"><Layers size={16} /></button>
                    <button className="bg-black/50 text-white p-2 border border-white/20 hover:bg-black"><ZoomIn size={16} /></button>
                    <button className="bg-black/50 text-white p-2 border border-white/20 hover:bg-black"><ZoomOut size={16} /></button>
                </div>

                <div className="flex-1 flex items-center justify-center relative z-10">
                    <div className="text-center">
                        <Box size={64} className="text-emerald-500 mx-auto mb-4 opacity-80" />
                        <h3 className="text-white font-mono text-sm uppercase tracking-widest mb-1">{file.title}</h3>
                        <p className="text-zinc-500 text-xs font-mono">Autodesk Viewer (Simulated)</p>
                    </div>
                </div>

                <div className="h-6 bg-[#0f0f0f] border-t border-[#333] flex items-center px-4 justify-between text-[10px] font-mono text-zinc-500">
                    <span>X: 1240.55 Y: 400.00 Z: 0.00</span>
                    <span>SCALE: 1:100</span>
                </div>
            </div>
        );
    }

    // Default Fallback
    return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-50">
            <FileText size={48} className="text-slate-300 mb-4" />
            <p className="text-sm font-bold uppercase text-slate-500">Preview not available for this format.</p>
            <p className="text-xs text-slate-400 mt-1">Please download the file to view it.</p>
        </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-6xl h-[85vh] flex flex-col border border-white/20 shadow-2xl relative">
        
        {/* Header */}
        <div className="h-14 bg-black text-white flex items-center justify-between px-6 border-b border-zinc-800 flex-shrink-0">
           <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                 {isCAD ? <Box size={16} className="text-emerald-400" /> : 
                  isImage ? <Grid size={16} className="text-blue-400" /> :
                  <FileText size={16} className="text-slate-400" />}
                 <span className="font-bold text-sm uppercase tracking-wider truncate max-w-md">{file.title}</span>
              </div>
              <span className="text-[10px] bg-zinc-800 px-2 py-0.5 rounded text-zinc-400 font-mono uppercase">
                 {file.type} • {(file.size ? (file.size / (1024*1024)).toFixed(2) : '0')} MB
              </span>
           </div>

           <div className="flex items-center gap-2">
              <button 
                 onClick={() => window.open(file.url, '_blank')}
                 className="flex items-center gap-2 px-3 py-1.5 hover:bg-zinc-800 transition-colors text-xs font-bold uppercase border border-transparent hover:border-zinc-700"
              >
                 <Download size={14} /> <span className="hidden sm:inline">Download</span>
              </button>
              <div className="w-px h-6 bg-zinc-800 mx-2"></div>
              <button onClick={onClose} className="hover:text-red-400 transition-colors p-1">
                 <X size={20} />
              </button>
           </div>
        </div>

        {/* Viewer Body */}
        <div className="flex-1 overflow-hidden bg-zinc-100 relative">
           {renderContent()}
        </div>

      </div>
    </div>
  );
};

export default FilePreviewModal;
