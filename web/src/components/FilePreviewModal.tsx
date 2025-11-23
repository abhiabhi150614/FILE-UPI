import React, { useState } from 'react';
import { X, Download, ExternalLink, FileText, Music, Video, Image as ImageIcon } from 'lucide-react';

interface FilePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  file: {
    id: string;
    filename: string;
    mime_type: string;
    view_url: string;
    size_bytes: number;
  } | null;
}

export default function FilePreviewModal({ isOpen, onClose, file }: FilePreviewModalProps) {
  const [loading, setLoading] = useState(true);

  if (!isOpen || !file) return null;

  const isImage = file.mime_type.startsWith('image/');
  const isVideo = file.mime_type.startsWith('video/');
  const isAudio = file.mime_type.startsWith('audio/');
  const isPDF = file.mime_type === 'application/pdf';
  const isText = file.mime_type.startsWith('text/') || file.mime_type.includes('json') || file.mime_type.includes('javascript') || file.mime_type.includes('xml');

  const renderContent = () => {
    if (isImage) {
      return (
        <img 
          src={file.view_url} 
          alt={file.filename} 
          className="max-w-full max-h-[70vh] object-contain mx-auto rounded-lg shadow-lg"
          onLoad={() => setLoading(false)}
        />
      );
    }
    
    if (isVideo) {
      return (
        <video 
          controls 
          className="max-w-full max-h-[70vh] mx-auto rounded-lg shadow-lg w-full"
          onLoadedData={() => setLoading(false)}
        >
          <source src={file.view_url} type={file.mime_type} />
          Your browser does not support the video tag.
        </video>
      );
    }

    if (isAudio) {
      return (
        <div className="w-full max-w-md mx-auto p-8 bg-slate-800 rounded-xl flex flex-col items-center gap-6">
          <div className="w-24 h-24 rounded-full bg-indigo-500/20 flex items-center justify-center animate-pulse">
            <Music className="w-12 h-12 text-indigo-400" />
          </div>
          <audio controls className="w-full" onLoadedData={() => setLoading(false)}>
            <source src={file.view_url} type={file.mime_type} />
            Your browser does not support the audio element.
          </audio>
        </div>
      );
    }

    if (isPDF) {
      return (
        <iframe 
          src={`${file.view_url}#toolbar=0`}
          className="w-full h-[70vh] rounded-lg border border-white/10 bg-white"
          onLoad={() => setLoading(false)}
        />
      );
    }

    // Fallback for other types
    return (
      <div className="text-center p-12 bg-slate-800/50 rounded-xl border border-white/5">
        <div className="w-20 h-20 mx-auto bg-slate-700/50 rounded-2xl flex items-center justify-center mb-6">
          <FileText className="w-10 h-10 text-slate-400" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">Preview not available</h3>
        <p className="text-slate-400 mb-8">This file type cannot be viewed directly in the browser.</p>
        <a 
          href={file.view_url} 
          download={file.filename}
          className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition font-medium"
        >
          <Download className="w-5 h-5" />
          Download File
        </a>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/90 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-5xl h-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 px-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-lg">
              {isImage ? <ImageIcon className="w-5 h-5 text-purple-400" /> : 
               isVideo ? <Video className="w-5 h-5 text-blue-400" /> :
               isAudio ? <Music className="w-5 h-5 text-pink-400" /> :
               <FileText className="w-5 h-5 text-slate-400" />}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white truncate max-w-md">{file.filename}</h3>
              <p className="text-xs text-slate-400">{(file.size_bytes / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <a 
              href={file.view_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-2 hover:bg-white/10 rounded-full transition text-slate-400 hover:text-white"
              title="Open in new tab"
            >
              <ExternalLink className="w-5 h-5" />
            </a>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-full transition text-slate-400 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex items-center justify-center overflow-auto p-4 relative">
          {/* Loading State */}
          {(loading && (isImage || isVideo || isPDF)) && (
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
          
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
