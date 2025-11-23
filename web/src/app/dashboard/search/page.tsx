'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { fileAPI } from '@/lib/api';
import { Search as SearchIcon, File as FileIcon, Eye, Download, ArrowLeft } from 'lucide-react';
import FilePreviewModal from '@/components/FilePreviewModal';

export default function SearchPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [previewFile, setPreviewFile] = useState<any>(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 500);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    if (debouncedQuery) {
      handleSearch();
    } else {
      setResults([]);
    }
  }, [debouncedQuery]);

  const handleSearch = async () => {
    if (!debouncedQuery.trim()) return;
    
    setLoading(true);
    try {
      const res = await fileAPI.getAll(undefined, debouncedQuery);
      setResults(res.data);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0f172a', color: '#f8fafc' }}>
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-white/5 backdrop-blur-md" style={{ backgroundColor: 'rgba(15, 23, 42, 0.8)' }}>
        <div className="container mx-auto px-6 py-4 flex items-center gap-4">
          <button 
            onClick={() => router.back()}
            className="p-2 hover:bg-white/5 rounded-lg transition text-slate-400 hover:text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold text-white">Search Files</h1>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8 max-w-4xl">
        {/* Search Input */}
        <div className="relative mb-8">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by filename..."
            className="w-full bg-slate-800/50 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition"
            autoFocus
          />
        </div>

        {/* Results */}
        {loading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-400">Searching...</p>
          </div>
        ) : results.length > 0 ? (
          <div className="grid gap-4">
            {results.map((file) => (
              <div 
                key={file.id}
                className="group bg-slate-800/30 border border-white/5 rounded-xl p-4 flex items-center justify-between hover:bg-slate-800/50 transition"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                    {file.thumbnail_url ? (
                      <img src={file.thumbnail_url} alt="" className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      <FileIcon className="w-6 h-6" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium text-white mb-1">{file.filename}</h3>
                    <p className="text-sm text-slate-500">
                      {(file.size_bytes / 1024 / 1024).toFixed(2)} MB • {new Date(file.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => setPreviewFile(file)}
                    className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition"
                    title="Preview"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                  <a 
                    href={file.view_url} 
                    download
                    className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition"
                    title="Download"
                  >
                    <Download className="w-5 h-5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : query && !loading ? (
          <div className="text-center py-12 text-slate-500">
            No files found matching "{query}"
          </div>
        ) : (
          <div className="text-center py-12 text-slate-500">
            Start typing to search your files
          </div>
        )}
      </div>

      {/* Preview Modal */}
      <FilePreviewModal 
        isOpen={!!previewFile} 
        onClose={() => setPreviewFile(null)} 
        file={previewFile} 
      />
    </div>
  );
}
