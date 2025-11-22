'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowUpRight, ArrowDownLeft, Clock } from 'lucide-react';
import { shareAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export default function TransactionsPage() {
  const router = useRouter();
  const [tab, setTab] = useState<'sent' | 'received'>('sent');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <nav className="border-b bg-white">
        <div className="container mx-auto px-4 py-4">
          <button onClick={() => router.push('/dashboard')} className="text-blue-600 hover:text-blue-700 font-medium">
            ← Back
          </button>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Transaction History</h1>

        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
          <div className="flex border-b">
            <button
              onClick={() => setTab('sent')}
              className={`flex-1 px-6 py-4 font-semibold ${
                tab === 'sent' ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'
              }`}
            >
              <ArrowUpRight className="w-5 h-5 inline mr-2" />
              Sent
            </button>
            <button
              onClick={() => setTab('received')}
              className={`flex-1 px-6 py-4 font-semibold ${
                tab === 'received' ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'
              }`}
            >
              <ArrowDownLeft className="w-5 h-5 inline mr-2" />
              Received
            </button>
          </div>

          <div className="divide-y">
            {loading ? (
              <div className="p-12 text-center text-gray-500">Loading...</div>
            ) : transactions.length === 0 ? (
              <div className="p-12 text-center text-gray-500">No transactions yet</div>
            ) : (
              transactions.map((tx) => (
                <div key={tx.id} className="p-6 hover:bg-gray-50 transition">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          tab === 'sent' ? 'bg-red-100' : 'bg-green-100'
                        }`}>
                          {tab === 'sent' ? (
                            <ArrowUpRight className="w-5 h-5 text-red-600" />
                          ) : (
                            <ArrowDownLeft className="w-5 h-5 text-green-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{tx.filename}</p>
                          <p className="text-sm text-gray-600">
                            {tab === 'sent' ? `To: ${tx.recipient_name || tx.recipient_email}` : `From: ${tx.sender_name}`}
                          </p>
                        </div>
                      </div>
                      
                      <div className="ml-13 space-y-1">
                        <p className="text-sm text-gray-600">
                          Folder: <span className="font-medium">{tx.target_folder_name}</span>
                        </p>
                        <p className="text-sm text-gray-600">
                          Transaction ID: <span className="font-mono text-xs">{tx.transaction_id}</span>
                        </p>
                        {tx.message && (
                          <p className="text-sm text-gray-600 italic">"{tx.message}"</p>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                        tx.status === 'delivered' ? 'bg-green-100 text-green-700' :
                        tx.status === 'sent' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        <Clock className="w-4 h-4" />
                        {tx.status}
                      </div>
                      <p className="text-sm text-gray-500 mt-2">
                        {format(new Date(tx.created_at), 'MMM dd, yyyy HH:mm')}
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
