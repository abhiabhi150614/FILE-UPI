'use client';

import Link from 'next/link';
import { ArrowRight, Shield, Zap, Users, Star, Upload, Send, FolderOpen } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    console.log("Page mounted");
  }, []);

  if (!mounted) {
    return (
      <div style={{ backgroundColor: '#0f172a', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-hidden relative" style={{ backgroundColor: '#0f172a', color: '#f8fafc' }}>
      {/* Background Effects - Inline styles for safety */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full blur-[120px]" style={{ backgroundColor: 'rgba(79, 70, 229, 0.2)' }} />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full blur-[120px]" style={{ backgroundColor: 'rgba(147, 51, 234, 0.2)' }} />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 backdrop-blur-md" style={{ backgroundColor: 'rgba(15, 23, 42, 0.5)' }}>
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(135deg, #6366f1, #9333ea)' }}>
              <span className="text-white font-bold text-xl">F</span>
            </div>
            <span className="text-xl font-bold text-white tracking-tight">FileFlow</span>
          </div>
          <div className="flex gap-4">
            <Link href="/auth/login" className="px-6 py-2.5 text-slate-300 hover:text-white font-medium transition">
              Sign In
            </Link>
            <Link href="/auth/register" className="px-6 py-2.5 rounded-xl font-semibold transition-all duration-300 text-white text-sm" style={{ background: 'linear-gradient(90deg, #4f46e5, #9333ea)', border: '1px solid rgba(255,255,255,0.1)' }}>
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-6 pt-32 pb-20 text-center relative">
        <div className="max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-8 animate-float" style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)', color: '#a5b4fc', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
            <Star className="w-4 h-4 fill-current" />
            <span>The Future of File Sharing is Here</span>
          </div>
          
          <h1 className="text-6xl md:text-7xl font-bold text-white mb-8 leading-tight tracking-tight">
            Send Files Like<br />
            <span style={{ background: 'linear-gradient(to right, #818cf8, #c084fc, #f472b6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Sending Money
            </span>
          </h1>
          
          <p className="text-xl text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed">
            Experience the world's first UPI for files. Secure, instant, and organized. 
            Stop losing documents in emails and chats.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-20">
            <Link href="/auth/register" className="px-10 py-4 rounded-xl font-semibold transition-all duration-300 text-white text-lg flex items-center justify-center gap-2 group" style={{ background: 'linear-gradient(90deg, #4f46e5, #9333ea)', boxShadow: '0 0 20px rgba(79, 70, 229, 0.3)' }}>
              Start Free Today
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/auth/login" className="px-10 py-4 rounded-xl border border-white/10 text-slate-300 hover:bg-white/5 font-semibold text-lg transition backdrop-blur-sm">
              View Demo
            </Link>
          </div>

          {/* Stats Glass Card */}
          <div className="backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl p-8 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto" style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)' }}>
            {[
              { label: 'Active Users', value: '10K+' },
              { label: 'Files Sent', value: '1M+' },
              { label: 'Security', value: 'AES-256' },
              { label: 'Uptime', value: '99.9%' },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-sm text-slate-400 uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 relative">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Everything You Need</h2>
            <p className="text-xl text-slate-400">Built for the modern web</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Send className="w-8 h-8 text-indigo-400" />,
                title: 'Instant Transfer',
                desc: 'Send files to anyone using just their phone number or email. As fast as a text message.'
              },
              {
                icon: <Shield className="w-8 h-8 text-purple-400" />,
                title: 'Bank-Grade Security',
                desc: 'End-to-end encryption ensures your sensitive documents remain private and secure.'
              },
              {
                icon: <FolderOpen className="w-8 h-8 text-pink-400" />,
                title: 'Smart Organization',
                desc: 'AI-powered categorization sorts your bills, medical reports, and receipts automatically.'
              }
            ].map((feature, i) => (
              <div key={i} className="backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl p-8 hover:bg-slate-800/80 transition duration-300 group" style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)' }}>
                <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 border border-white/5">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-slate-400 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 backdrop-blur-lg" style={{ backgroundColor: 'rgba(15, 23, 42, 0.5)' }}>
        <div className="container mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #6366f1, #9333ea)' }}>
              <span className="text-white font-bold">F</span>
            </div>
            <span className="font-bold text-white text-lg">FileFlow</span>
          </div>
          <p className="text-slate-500">© 2024 FileFlow. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
