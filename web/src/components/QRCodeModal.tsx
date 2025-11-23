import React from 'react';
import QRCode from 'react-qr-code';
import { X, Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  value: string;
  title?: string;
}

export default function QRCodeModal({ isOpen, onClose, value, title = "My QR Code" }: QRCodeModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-slate-900 border border-white/10 rounded-2xl p-8 max-w-sm w-full shadow-2xl transform transition-all scale-100">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>
          <p className="text-slate-400 text-sm">Scan to send files instantly</p>
        </div>

        <div className="bg-white p-4 rounded-xl mx-auto w-fit mb-8 shadow-inner">
          <QRCode 
            value={value} 
            size={200}
            style={{ height: "auto", maxWidth: "100%", width: "100%" }}
            viewBox={`0 0 256 256`}
          />
        </div>

        <div className="bg-slate-800/50 rounded-xl p-4 flex items-center justify-between gap-3 border border-white/5">
          <code className="text-indigo-300 text-sm truncate flex-1 font-mono">
            {value}
          </code>
          <button 
            onClick={handleCopy}
            className="p-2 hover:bg-white/10 rounded-lg transition text-slate-400 hover:text-white"
            title="Copy to clipboard"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
