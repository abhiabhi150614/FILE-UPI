'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, FileText, Download, Trash2, MoreVertical, Search, FolderOpen, Eye } from 'lucide-react';
import { folderAPI, fileAPI } from '@/lib/api';
import toast from 'react-hot-toast';

export default function FolderPage() {
  const router = useRouter();
  const params = useParams();
  const folderId = params.id as string;
  
  const [files, setFiles] = useState<any[]>([]);
  const [folderName, setFolderName] = useState('Loading...');
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setMounted(true);
    loadFolderData();
  }, [folderId]);

  const loadFolderData = async () => {
    try {
      // In a real app, we'd have a specific endpoint for folder details + files
      // For now, we'll fetch all files and filter (or use the existing API if it supports folder filtering)
      // Assuming fileAPI.getAll() can take a folder_id or we filter client side if API is limited
      // Let's assume we need to fetch all files and filter for now, or update API later.
      // Actually, looking at the previous code, there wasn't a clear "get files by folder" API usage shown.
      // I will assume fileAPI.getAll() returns all files and I filter them, OR I should check if there's a specific endpoint.
      // To be safe and robust, I'll fetch all and filter client-side for this MVP, 
      // but ideally the backend should support ?folder_id=...
      
      const [filesRes, foldersRes] = await Promise.all([
        fileAPI.getAll(),
        folderAPI.getAll()
      ]);

      const currentFolder = foldersRes.data.find((f: any) => f.id === folderId);
      if (currentFolder) {
        setFolderName(currentFolder.name);
      } else {
        setFolderName('Unknown Folder');
      }

      // Filter files that belong to this folder
      // Note: The file model needs a folder_id. I saw it in the upload logic.
      const folderFiles = filesRes.data.filter((f: any) => f.folder_id === folderId);
      setFiles(folderFiles);

    } catch (error) {
      console.error(error);
      toast.error('Failed to load folder content');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (fileId: string, filename: string) => {
    try {
      const { data } = await fileAPI.getDownloadUrl(fileId);
      
      // Create a temporary link to trigger download
      const link = document.createElement('a');
      link.href = data.download_url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      toast.error('Download failed');
    }
  };

  const handleDelete = async (fileId: string) => {
    if (!confirm('Are you sure you want to delete this file?')) return;
    
    try {
      await fileAPI.delete(fileId);
      setFiles(files.filter(f => f.id !== fileId));
      toast.success('File deleted');
    } catch (error) {
      toast.error('Delete failed');
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
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full blur-[120px]" style={{ backgroundColor: 'rgba(79, 70, 229, 0.1)' }} />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full blur-[120px]" style={{ backgroundColor: 'rgba(236, 72, 153, 0.1)' }} />
      </div>

      <nav className="border-b border-white/5 backdrop-blur-md" style={{ backgroundColor: 'rgba(15, 23, 42, 0.8)' }}>
        <div className="container mx-auto px-6 py-4">
          <button onClick={() => router.push('/dashboard')} className="flex items-center text-slate-400 hover:text-white transition">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Dashboard
          </button>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-12 max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg bg-indigo-500/20 text-indigo-400">
              <FolderOpen className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">{folderName}</h1>
              <p className="text-slate-400">{files.length} files</p>
            </div>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search files..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 rounded-lg bg-slate-800/50 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition w-64"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-500 animate-pulse">Loading files...</div>
        ) : (
          <div className="grid gap-4">
            {filteredFiles.map((file) => (
              <div 
                key={file.id}
                className="group backdrop-blur-xl border border-white/5 rounded-xl p-4 flex items-center justify-between hover:bg-white/5 transition"
                style={{ backgroundColor: 'rgba(30, 41, 59, 0.3)' }}
              >
                <div className="flex items-center gap-4 overflow-hidden">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-medium text-white truncate">{file.filename}</h3>
                    <p className="text-xs text-slate-500">
                      {(file.size_bytes / (1024 * 1024)).toFixed(2)} MB • {new Date(file.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {file.view_url && (
                    <a 
                      href={file.view_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-blue-400 transition"
                      title="View"
                    >
                      <Eye className="w-4 h-4" />
                    </a>
                  )}
                  <button 
                    onClick={() => handleDownload(file.id, file.filename)}
                    className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition"
                    title="Download"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(file.id)}
                    className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-red-400 transition"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            {filteredFiles.length === 0 && (
              <div className="text-center py-12 border border-dashed border-white/10 rounded-2xl">
                <p className="text-slate-500">No files found in this folder</p>
                <button 
                  onClick={() => router.push('/dashboard/upload')}
                  className="mt-4 text-indigo-400 hover:text-indigo-300 font-medium"
                >
                  Upload a file
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
