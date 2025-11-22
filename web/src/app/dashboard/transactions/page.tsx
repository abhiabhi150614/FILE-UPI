'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowUpRight, ArrowDownLeft, Clock, ArrowLeft, Filter, Search } from 'lucide-react';
import { shareAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export default function TransactionsPage() {
  const router = useRouter();
  const [tab, setTab] = useState<'sent' | 'received'>('sent');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    loadTransactions();
  }, [tab]);

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const { data } = tab === 'sent' ? await shareAPI.getSent() : await shareAPI.getReceived();
      setTransactions(data);
    } catch (error) {
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = transactions.filter(tx => 
    tx.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (tx.recipient_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (tx.sender_name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!mounted) return <div style={{ backgroundColor: '#0f172a', height: '100vh' }} />;

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: '#0f172a', color: '#f8fafc' }}>
      {/* Background Effects */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full blur-[120px]" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }} />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full blur-[120px]" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)' }} />
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
          <h1 className="text-3xl font-bold text-white">Transaction History</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search transactions..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 rounded-lg bg-slate-800/50 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition w-64"
            />
          </div>
        </div>

        <div className="backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden" style={{ backgroundColor: 'rgba(30, 41, 59, 0.4)' }}>
          <div className="flex border-b border-white/10">
            <button
              onClick={() => setTab('sent')}
              className={`flex-1 px-6 py-4 font-semibold transition ${
                tab === 'sent' ? 'bg-white/5 text-blue-400 border-b-2 border-blue-400' : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <ArrowUpRight className="w-5 h-5 inline mr-2" />
              Sent
            </button>
            <button
              onClick={() => setTab('received')}
              className={`flex-1 px-6 py-4 font-semibold transition ${
                tab === 'received' ? 'bg-white/5 text-emerald-400 border-b-2 border-emerald-400' : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <ArrowDownLeft className="w-5 h-5 inline mr-2" />
              Received
            </button>
          </div>

          <div className="divide-y divide-white/5">
            {loading ? (
              <div className="p-12 text-center text-slate-500 animate-pulse">Loading transactions...</div>
            ) : filteredTransactions.length === 0 ? (
              <div className="p-12 text-center text-slate-500">No transactions found</div>
            ) : (
              filteredTransactions.map((tx) => (
                <div key={tx.id} className="p-6 hover:bg-white/5 transition group">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          tab === 'sent' ? 'bg-blue-500/20 text-blue-400' : 'bg-emerald-500/20 text-emerald-400'
                        }`}>
                          {tab === 'sent' ? (
                            <ArrowUpRight className="w-5 h-5" />
                          ) : (
                            <ArrowDownLeft className="w-5 h-5" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-white group-hover:text-blue-400 transition">{tx.filename}</p>
                          <p className="text-sm text-slate-400">
                            {tab === 'sent' ? `To: ${tx.recipient_name || tx.recipient_email}` : `From: ${tx.sender_name}`}
                          </p>
                        </div>
                      </div>
                      
                      <div className="ml-14 space-y-1">
                        <p className="text-sm text-slate-500">
                          Folder: <span className="text-slate-300">{tx.target_folder_name}</span>
                        </p>
                        <p className="text-sm text-slate-500">
                          ID: <span className="font-mono text-xs text-slate-400">{tx.transaction_id}</span>
                        </p>
                        {tx.message && (
                          <p className="text-sm text-slate-400 italic mt-1">"{tx.message}"</p>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${
                        tx.status === 'delivered' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        tx.status === 'sent' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                        'bg-slate-500/10 text-slate-400 border-slate-500/20'
                      }`}>
                        <Clock className="w-3 h-3" />
                        {tx.status.toUpperCase()}
                      </div>
                      <p className="text-xs text-slate-500 mt-2">
                        {format(new Date(tx.created_at), 'MMM dd, HH:mm')}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
