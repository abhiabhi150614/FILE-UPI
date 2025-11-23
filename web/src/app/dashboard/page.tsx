'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { folderAPI, fileAPI, userAPI } from '@/lib/api';
import { FolderOpen, Upload, Send, Search, LogOut, HardDrive, Bell, Settings, QrCode, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

import QRCodeModal from '@/components/QRCodeModal';

export default function Dashboard() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [folders, setFolders] = useState<any[]>([]);
  const [storage, setStorage] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [showQR, setShowQR] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
      // toast.error(error.response?.data?.detail || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (!mounted) return <div style={{ backgroundColor: '#0f172a', height: '100vh' }} />;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0f172a', color: '#f8fafc' }}>
        <div className="text-xl animate-pulse">Loading Dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: '#0f172a', color: '#f8fafc' }}>
      {/* Background Effects */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full blur-[120px]" style={{ backgroundColor: 'rgba(79, 70, 229, 0.1)' }} />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full blur-[120px]" style={{ backgroundColor: 'rgba(147, 51, 234, 0.1)' }} />
      </div>

      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-white/5 backdrop-blur-md" style={{ backgroundColor: 'rgba(15, 23, 42, 0.8)' }}>
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(135deg, #6366f1, #9333ea)' }}>
              <span className="text-white font-bold text-xl">F</span>
            </div>
            <span className="text-xl font-bold text-white tracking-tight">FileFlow</span>
          </div>
          <div className="flex items-center gap-6">
            <button className="text-slate-400 hover:text-white transition relative">
              <Bell className="w-6 h-6" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="flex items-center gap-3 pl-6 border-l border-white/10">
              <div className="text-right hidden md:block">
                <div className="text-sm font-medium text-white">{user?.name}</div>
                <div className="text-xs text-slate-400">{user?.email}</div>
              </div>
              <button onClick={handleLogout} className="text-slate-400 hover:text-red-400 transition" title="Logout">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8">
        {/* Storage Card */}
        {storage && (
          <div className="backdrop-blur-xl border border-white/10 rounded-2xl p-6 mb-8" style={{ backgroundColor: 'rgba(30, 41, 59, 0.4)' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400">
                  <HardDrive className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Storage Usage</h3>
                  <p className="text-sm text-slate-400">Premium Plan</p>
                </div>
              </div>
              <span className="text-sm font-medium text-white">
                {storage.used_gb} GB <span className="text-slate-500">/ {storage.quota_gb} GB</span>
              </span>
            </div>
            <div className="w-full bg-slate-700/50 rounded-full h-2 overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-1000 ease-out" 
                style={{ 
                  width: `${Math.min(storage.percentage, 100)}%`,
                  background: 'linear-gradient(90deg, #6366f1, #a855f7)'
                }} 
              />
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <h2 className="text-xl font-bold text-white mb-6">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {[
            { icon: Send, label: 'Send File', desc: 'Transfer to anyone', color: 'from-blue-500 to-indigo-600', onClick: () => router.push('/dashboard/send') },
            { icon: Upload, label: 'Upload', desc: 'Save to cloud', color: 'from-emerald-500 to-teal-600', onClick: () => router.push('/dashboard/upload') },
            { icon: QrCode, label: 'Receive', desc: 'Show QR Code', color: 'from-purple-500 to-pink-600', onClick: () => setShowQR(true) },
            { icon: Search, label: 'Search', desc: 'Find anything', color: 'from-orange-500 to-red-600', onClick: () => router.push('/dashboard/search') },
          ].map((action, i) => (
            <button
              key={i}
              onClick={action.onClick}
              className="group relative overflow-hidden rounded-2xl p-6 text-left transition-all hover:scale-[1.02] hover:shadow-lg border border-white/5"
              style={{ backgroundColor: 'rgba(30, 41, 59, 0.4)' }}
            >
              <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity bg-gradient-to-br ${action.color}`} />
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-gradient-to-br ${action.color} shadow-lg`}>
                <action.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-white mb-1">{action.label}</h3>
              <p className="text-sm text-slate-400">{action.desc}</p>
            </button>
          ))}
        </div>

        {/* Folders */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Your Folders</h2>
          <button className="text-sm text-indigo-400 hover:text-indigo-300 font-medium">View All</button>
        </div>
        
        <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4 mb-12">
          {folders.map((folder) => (
            <button
              key={folder.id}
              onClick={() => router.push(`/dashboard/folders/${folder.id}`)}
              className="group backdrop-blur-sm border border-white/5 rounded-xl p-5 hover:bg-white/5 transition text-left"
              style={{ backgroundColor: 'rgba(30, 41, 59, 0.3)' }}
            >
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">{folder.icon}</div>
              <h3 className="font-semibold text-white mb-1">{folder.name}</h3>
              <p className="text-sm text-slate-500">{folder.file_count} files</p>
            </button>
          ))}
          
          {/* Add Folder Button */}
          <button className="border border-dashed border-white/20 rounded-xl p-5 flex flex-col items-center justify-center text-slate-400 hover:text-white hover:border-white/40 transition gap-2 min-h-[160px]">
            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
              <span className="text-2xl">+</span>
            </div>
            <span className="font-medium">New Folder</span>
          </button>
        </div>

        {/* Recent Activity */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Recent Activity</h2>
          <button onClick={() => router.push('/dashboard/transactions')} className="text-sm text-indigo-400 hover:text-indigo-300 font-medium">View History</button>
        </div>
        
        <div className="backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden" style={{ backgroundColor: 'rgba(30, 41, 59, 0.4)' }}>
           {/* We can fetch recent transactions here or just link to the page. 
               For a true dashboard feel, let's show a placeholder or fetch if we had the data. 
               Since we didn't fetch transactions in loadData, I'll add a "View Transactions" CTA for now 
               or quickly fetch them. Let's fetch them to be "production level".
           */}
           <div className="p-8 text-center">
             <div className="w-16 h-16 rounded-full bg-white/5 mx-auto flex items-center justify-center mb-4">
               <Clock className="w-8 h-8 text-slate-400" />
             </div>
             <h3 className="text-white font-medium mb-2">Track your transfers</h3>
             <p className="text-slate-400 text-sm mb-6">View all your sent and received files in one place.</p>
             <button 
               onClick={() => router.push('/dashboard/transactions')}
               className="px-6 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition font-medium"
             >
               View Transaction History
             </button>
           </div>
        </div>
      </div>

      {/* QR Code Modal */}
      <QRCodeModal 
        isOpen={showQR} 
        onClose={() => setShowQR(false)} 
        value={user?.email || ''} 
      />
    </div>
  );
}
