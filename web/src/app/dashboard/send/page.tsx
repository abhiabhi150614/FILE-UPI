'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Send, CheckCircle, ArrowLeft, FileText, Search, Upload, X } from 'lucide-react';
import { fileAPI, shareAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import axios from 'axios';

export default function SendPage() {
  const router = useRouter();
  const [files, setFiles] = useState<any[]>([]);
  const [selectedFile, setSelectedFile] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [targetFolder, setTargetFolder] = useState('Bills');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // New Upload State
  const [mode, setMode] = useState<'existing' | 'new'>('existing');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    setMounted(true);
    loadFiles();
  }, []);

  const loadFiles = async () => {
    try {
      const { data } = await fileAPI.getAll();
      setFiles(data);
    } catch (error) {
      toast.error('Failed to load files');
    }
  };

  const handleSend = async () => {
    if (!recipientEmail || !targetFolder) {
      toast.error('Please fill all required fields');
      return;
    }

    if (mode === 'existing' && !selectedFile) {
      toast.error('Please select a file');
      return;
    }

    if (mode === 'new' && !uploadFile) {
      toast.error('Please select a file to upload');
      return;
    }

    setSending(true);
    try {
      let fileIdToSend = selectedFile;

      // If uploading new file
      if (mode === 'new' && uploadFile) {
        const formData = new FormData();
        formData.append('file', uploadFile);
        if (targetFolder) {
           // Note: The backend expects 'folder_id', but here we have 'target_folder_name' for the transaction.
           // The file itself might just go to root or a default folder for the sender.
           // We'll leave folder_id empty for now or map it if we had folder IDs.
        }

        const { data: uploadData } = await fileAPI.uploadDirect(formData);
        fileIdToSend = uploadData.id;
        setUploadProgress(100);
      }

      // 4. Send Share
      const { data } = await shareAPI.send({
        file_id: fileIdToSend,
        recipient_email: recipientEmail,
        target_folder_name: targetFolder,
        message: message,
        share_type: 'direct',
      });

      toast.success(`File sent! Transaction ID: ${data.transaction_id}`);
      router.push('/dashboard/transactions');
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to send file');
    } finally {
      setSending(false);
      setUploadProgress(0);
    }
  };

  const filteredFiles = files.filter(f => 
    f.filename.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!mounted) return <div style={{ backgroundColor: '#0f172a', height: '100vh' }} />;

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: '#0f172a', color: '#f8fafc' }}>
      {/* Background Effects */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full blur-[120px]" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }} />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full blur-[120px]" style={{ backgroundColor: 'rgba(168, 85, 247, 0.1)' }} />
      </div>

      <nav className="border-b border-white/5 backdrop-blur-md" style={{ backgroundColor: 'rgba(15, 23, 42, 0.8)' }}>
        <div className="container mx-auto px-6 py-4">
          <button onClick={() => router.push('/dashboard')} className="flex items-center text-slate-400 hover:text-white transition">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Dashboard
          </button>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-12 max-w-2xl">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(135deg, #3b82f6, #a855f7)' }}>
            <Send className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">Send File</h1>
        </div>

        <div className="backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-8 space-y-8" style={{ backgroundColor: 'rgba(30, 41, 59, 0.4)' }}>
          
          {/* Mode Selection */}
          <div className="flex bg-slate-800/50 p-1 rounded-xl border border-white/10">
            <button
              onClick={() => setMode('existing')}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
                mode === 'existing' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
              }`}
            >
              Select Existing File
            </button>
            <button
              onClick={() => setMode('new')}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
                mode === 'new' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
              }`}
            >
              Upload & Send
            </button>
          </div>

          {/* File Selection / Upload */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">
              {mode === 'existing' ? 'Select File to Send' : 'Upload File to Send'}
            </label>
            
            {mode === 'existing' ? (
              <>
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Search your files..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-800/50 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
                  />
                </div>
                <div className="max-h-48 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                  {filteredFiles.map((file) => (
                    <button
                      key={file.id}
                      onClick={() => setSelectedFile(file.id)}
                      className={`w-full flex items-center p-3 rounded-xl border transition text-left ${
                        selectedFile === file.id
                          ? 'border-blue-500 bg-blue-500/10 text-white'
                          : 'border-white/10 hover:bg-white/5 text-slate-400'
                      }`}
                    >
                      <FileText className="w-5 h-5 mr-3 flex-shrink-0" />
                      <div className="truncate">
                        <p className="font-medium truncate">{file.filename}</p>
                        <p className="text-xs opacity-70">{(file.size_bytes / (1024 * 1024)).toFixed(2)} MB</p>
                      </div>
                      {selectedFile === file.id && <CheckCircle className="w-5 h-5 ml-auto text-blue-500" />}
                    </button>
                  ))}
                  {filteredFiles.length === 0 && (
                    <div className="text-center py-4 text-slate-500">No files found</div>
                  )}
                </div>
              </>
            ) : (
              // Upload Mode
              !uploadFile ? (
                <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-white/20 rounded-xl cursor-pointer hover:border-blue-500 hover:bg-white/5 transition group">
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Upload className="w-6 h-6 text-slate-400 group-hover:text-blue-500" />
                  </div>
                  <span className="text-slate-300 mb-2 font-medium">Click to choose file</span>
                  <span className="text-sm text-slate-500">Max: 100MB</span>
                  <input 
                    type="file" 
                    className="hidden" 
                    onChange={(e) => e.target.files && setUploadFile(e.target.files[0])}
                    disabled={sending}
                  />
                </label>
              ) : (
                <div className="border border-blue-500/50 bg-blue-500/10 rounded-xl p-4 relative">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="w-8 h-8 text-blue-500" />
                      <div>
                        <p className="font-medium text-white">{uploadFile.name}</p>
                        <p className="text-sm text-blue-400/80">{(uploadFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                      </div>
                    </div>
                    <button onClick={() => setUploadFile(null)} className="text-slate-400 hover:text-red-400">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )
            )}
          </div>

          {/* Recipient */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">Recipient Email</label>
            <input
              type="email"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              placeholder="recipient@example.com"
              className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
            />
          </div>

          {/* Target Folder */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">Target Folder Category</label>
            <div className="grid grid-cols-2 gap-3">
              {['Bills', 'Hospital Reports', 'Company', 'Education', 'Receipts', 'Personal'].map((folder) => (
                <button
                  key={folder}
                  onClick={() => setTargetFolder(folder)}
                  className={`p-3 rounded-xl border transition text-sm font-medium ${
                    targetFolder === folder
                      ? 'border-purple-500 bg-purple-500/10 text-white'
                      : 'border-white/10 hover:bg-white/5 text-slate-400'
                  }`}
                >
                  {folder}
                </button>
              ))}
            </div>
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">Message (Optional)</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Add a note..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition resize-none"
            />
          </div>

          <button
            onClick={handleSend}
            disabled={sending || (!selectedFile && !uploadFile) || !recipientEmail}
            className="w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg, #3b82f6, #a855f7)' }}
          >
            {sending ? (mode === 'new' ? `Uploading & Sending (${uploadProgress}%)` : 'Sending...') : (
              <>
                <Send className="w-5 h-5" />
                {mode === 'new' ? 'Upload & Send' : 'Send File'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
