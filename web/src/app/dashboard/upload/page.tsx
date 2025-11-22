'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, X, CheckCircle } from 'lucide-react';
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

  useEffect(() => {
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
        mime_type: file.type,
        folder_id: selectedFolder,
      });

      await axios.put(initData.upload_url, file, {
        headers: { 'Content-Type': file.type },
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <nav className="border-b bg-white">
        <div className="container mx-auto px-4 py-4">
          <button onClick={() => router.push('/dashboard')} className="text-blue-600 hover:text-blue-700 font-medium">
            ← Back
          </button>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Upload File</h1>

        <div className="bg-white rounded-2xl shadow-sm border p-8 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Folder</label>
            <select
              value={selectedFolder}
              onChange={(e) => setSelectedFolder(e.target.value)}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {folders.map((folder) => (
                <option key={folder.id} value={folder.id}>
                  {folder.icon} {folder.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Choose File</label>
            {!file ? (
              <label htmlFor="file-upload" className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer hover:border-blue-500 transition">
                <Upload className="w-12 h-12 text-gray-400 mb-4" />
                <span className="text-gray-600 mb-2 font-medium">Click to upload or drag and drop</span>
                <span className="text-sm text-gray-500">PDF, Images, Documents (Max: 100MB)</span>
                <input 
                  id="file-upload"
                  type="file" 
                  className="hidden" 
                  onChange={handleFileSelect} 
                  disabled={uploading}
                  accept="*/*"
                />
              </label>
            ) : (
              <div className="border-2 border-blue-500 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                    <div>
                      <p className="font-medium">{file.name}</p>
                      <p className="text-sm text-gray-500">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                    </div>
                  </div>
                  {!uploading && (
                    <button onClick={() => setFile(null)} className="text-gray-400 hover:text-red-600">
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
                {uploading && (
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Uploading...</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="w-full py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 font-semibold"
          >
            {uploading ? 'Uploading...' : 'Upload File'}
          </button>
        </div>
      </div>
    </div>
  );
}
