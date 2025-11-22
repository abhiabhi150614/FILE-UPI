'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, X, CheckCircle, ArrowLeft, FolderOpen } from 'lucide-react';
import { folderAPI, fileAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import axios from 'axios';

export default function UploadPage() {
  const router = useRouter();
  const [folders, setFolders] = useState<any[]>([]);
  const [selectedFolder, setSelectedFolder] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    setMounted(true);
    loadFolders();
  }, []);

  const loadFolders = async () => {
    try {
      const { data } = await folderAPI.getAll();
      setFolders(data);
      if (data.length > 0) setSelectedFolder(data[0].id);
    } catch (error) {
      toast.error('Failed to load folders');
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const selectedFile = e.dataTransfer.files[0];
      if (selectedFile.size > 100 * 1024 * 1024) {
        toast.error('File size must be less than 100MB');
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.size > 100 * 1024 * 1024) {
        toast.error('File size must be less than 100MB');
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file || !selectedFolder) {
      toast.error('Please select a file and folder');
      return;
    }

    setUploading(true);
    setProgress(0);

    try {
      const { data: initData } = await fileAPI.initUpload({
        filename: file.name,
        size_bytes: file.size,
        mime_type: file.type || 'application/octet-stream',
        folder_id: selectedFolder,
      });

      await axios.put(initData.upload_url, file, {
        headers: { 'Content-Type': file.type || 'application/octet-stream' },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
          setProgress(percent);
        },
      });

      await fileAPI.completeUpload(initData.file_id);
      toast.success('File uploaded successfully!');
      router.push('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  if (!mounted) return <div style={{ backgroundColor: '#0f172a', height: '100vh' }} />;

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: '#0f172a', color: '#f8fafc' }}>
      {/* Background Effects */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full blur-[120px]" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)' }} />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full blur-[120px]" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }} />
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
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(135deg, #10b981, #3b82f6)' }}>
            <Upload className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">Upload File</h1>
        </div>

        <div className="backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-8 space-y-8" style={{ backgroundColor: 'rgba(30, 41, 59, 0.4)' }}>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">Select Destination Folder</label>
            <div className="grid grid-cols-2 gap-3">
              {folders.map((folder) => (
                <button
                  key={folder.id}
                  onClick={() => setSelectedFolder(folder.id)}
                  className={`flex items-center p-3 rounded-xl border transition text-left ${
                    selectedFolder === folder.id
                      ? 'border-emerald-500 bg-emerald-500/10 text-white'
                      : 'border-white/10 hover:bg-white/5 text-slate-400'
                  }`}
                >
                  <span className="text-2xl mr-3">{folder.icon}</span>
                  <span className="font-medium truncate">{folder.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">Choose File</label>
            {!file ? (
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className="relative"
              >
                <label 
                  htmlFor="file-upload" 
                  className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-xl cursor-pointer transition group ${
                    dragActive 
                      ? 'border-emerald-500 bg-emerald-500/10 scale-[1.02]' 
                      : 'border-white/20 hover:border-emerald-500 hover:bg-white/5'
                  }`}
                >
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-transform ${
                    dragActive ? 'bg-emerald-500/20 scale-110' : 'bg-white/5 group-hover:scale-110'
                  }`}>
                    <Upload className={`w-8 h-8 ${dragActive ? 'text-emerald-500' : 'text-slate-400 group-hover:text-emerald-500'}`} />
                  </div>
                  <span className={`mb-2 font-medium ${dragActive ? 'text-emerald-400' : 'text-slate-300'}`}>
                    {dragActive ? 'Drop file here' : 'Click to upload or drag and drop'}
                  </span>
                  <span className="text-sm text-slate-500">Any file type supported (Max: 100MB)</span>
                  <input 
                    id="file-upload"
                    type="file" 
                    className="hidden" 
                    onChange={handleFileSelect} 
                    disabled={uploading}
                    accept="*"
                  />
                </label>
                {dragActive && (
                  <div className="absolute inset-0 w-full h-full pointer-events-none" />
                )}
              </div>
            ) : (
              <div className="border border-emerald-500/50 bg-emerald-500/10 rounded-xl p-6 relative overflow-hidden">
                <div className="flex items-center justify-between mb-4 relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-emerald-500" />
                    </div>
                    <div>
                      <p className="font-medium text-white">{file.name}</p>
                      <p className="text-sm text-emerald-400/80">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                    </div>
                  </div>
                  {!uploading && (
                    <button onClick={() => setFile(null)} className="text-slate-400 hover:text-red-400 transition">
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
                {uploading && (
                  <div className="relative z-10">
                    <div className="flex justify-between text-sm mb-2 text-emerald-300">
                      <span>Uploading...</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
                      <div className="bg-emerald-500 h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg, #10b981, #3b82f6)' }}
          >
            {uploading ? 'Uploading...' : (
              <>
                <Upload className="w-5 h-5" />
                Upload File
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
