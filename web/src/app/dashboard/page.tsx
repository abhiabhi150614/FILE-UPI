'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { folderAPI, fileAPI, userAPI } from '@/lib/api';
import { FolderOpen, Upload, Send, Search, LogOut, HardDrive } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [folders, setFolders] = useState<any[]>([]);
  const [storage, setStorage] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      const [foldersRes, storageRes] = await Promise.all([
        folderAPI.getAll(),
        userAPI.getStorage(),
      ]);
      setFolders(foldersRes.data || []);
      setStorage(storageRes.data);
    } catch (error: any) {
      console.error('Load error:', error);
      toast.error(error.response?.data?.detail || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold">F</div>
            <span className="text-xl font-bold text-gray-900">FileFlow</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user?.name}</span>
            <button onClick={handleLogout} className="text-gray-600 hover:text-red-600 transition">
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {storage && (
          <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <HardDrive size={20} className="text-blue-600" />
                <span className="font-semibold text-gray-900">Storage</span>
              </div>
              <span className="text-sm text-gray-600">
                {storage.used_gb} GB / {storage.quota_gb} GB
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full transition-all" style={{ width: `${storage.percentage}%` }} />
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: Upload, label: 'Upload', color: 'bg-blue-600', href: '/dashboard/upload' },
            { icon: Send, label: 'Send File', color: 'bg-purple-600', href: '/dashboard/send' },
            { icon: Search, label: 'Search', color: 'bg-green-600', href: '/dashboard/search' },
            { icon: FolderOpen, label: 'Transactions', color: 'bg-orange-600', href: '/dashboard/transactions' },
          ].map((action, i) => (
            <button
              key={i}
              onClick={() => router.push(action.href)}
              className={`${action.color} text-white rounded-xl p-6 hover:opacity-90 transition flex flex-col items-center gap-3 shadow-sm`}
            >
              <action.icon size={32} />
              <span className="font-semibold">{action.label}</span>
            </button>
          ))}
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Folders</h2>
        <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
          {folders.map((folder) => (
            <button
              key={folder.id}
              onClick={() => router.push(`/dashboard/folders/${folder.id}`)}
              className="bg-white rounded-xl p-6 shadow-sm border hover:shadow-md transition text-left"
            >
              <div className="text-4xl mb-3">{folder.icon}</div>
              <h3 className="font-semibold text-gray-900 mb-1">{folder.name}</h3>
              <p className="text-sm text-gray-600">{folder.file_count} files</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
