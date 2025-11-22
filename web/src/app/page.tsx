'use client';

import Link from 'next/link';
import { ArrowRight, Shield, Zap, Users, CheckCircle, Star, Upload, Send, FolderOpen } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b sticky top-0 bg-white/95 backdrop-blur-sm z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">F</span>
            </div>
            <span className="text-xl font-bold text-gray-900">FileFlow</span>
          </div>
          <div className="flex gap-3">
            <Link href="/auth/login" className="px-6 py-2.5 text-gray-700 hover:text-gray-900 font-medium transition">
              Sign In
            </Link>
            <Link href="/auth/register" className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition shadow-sm">
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-24 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-8">
            <Star className="w-4 h-4 fill-current" />
            <span>Join 10,000+ users managing files smarter</span>
          </div>
          
          <h1 className="text-6xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            Send Files Like<br />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Sending Money
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
            FileFlow makes file management as simple as UPI. Send, receive, and organize documents with transaction-like tracking. Perfect for hospitals, shops, and businesses.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link href="/auth/register" className="group px-10 py-5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold text-lg transition shadow-lg hover:shadow-xl flex items-center justify-center gap-2">
              Start Free Today
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/auth/login" className="px-10 py-5 border-2 border-gray-300 text-gray-700 rounded-xl hover:border-gray-400 hover:bg-gray-50 font-semibold text-lg transition">
              Sign In
            </Link>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap justify-center gap-8 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-600" />
              <span>Bank-level Security</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-600" />
              <span>Instant Delivery</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              <span>10K+ Users</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gradient-to-b from-gray-50 to-white py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Everything You Need</h2>
            <p className="text-xl text-gray-600">Powerful features for everyone</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                icon: <Upload className="w-8 h-8" />,
                title: 'Easy Upload',
                desc: 'Drag and drop files. Automatic organization into folders. Support for all file types.',
                color: 'bg-blue-100 text-blue-600'
              },
              {
                icon: <Send className="w-8 h-8" />,
                title: 'Send Like UPI',
                desc: 'Select file, choose recipient, send. Get transaction ID instantly. Track delivery status.',
                color: 'bg-purple-100 text-purple-600'
              },
              {
                icon: <FolderOpen className="w-8 h-8" />,
                title: 'Auto-Organized',
                desc: '6 default folders: Bills, Hospital, Company, Education, Receipts, Personal. Add more anytime.',
                color: 'bg-green-100 text-green-600'
              },
            ].map((feature, i) => (
              <div key={i} className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition border border-gray-100">
                <div className={`w-16 h-16 ${feature.color} rounded-xl flex items-center justify-center mb-6`}>
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Perfect For</h2>
            <p className="text-xl text-gray-600">Trusted by professionals across industries</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              { emoji: '🏥', title: 'Healthcare', desc: 'Send reports to patients. Complete medical history in one place. HIPAA compliant.', users: '500+ Hospitals' },
              { emoji: '🏪', title: 'Retail', desc: 'Digital bills & receipts. Customers never lose documents. Eco-friendly.', users: '2K+ Shops' },
              { emoji: '🏢', title: 'Enterprise', desc: 'Share payslips, contracts. Complete audit trail. Team collaboration.', users: '100+ Companies' },
            ].map((use, i) => (
              <div key={i} className="text-center p-8 rounded-2xl hover:bg-gray-50 transition">
                <div className="text-6xl mb-4">{use.emoji}</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{use.title}</h3>
                <p className="text-gray-600 mb-4 leading-relaxed">{use.desc}</p>
                <div className="inline-block bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium">
                  {use.users}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-gradient-to-br from-blue-600 to-purple-600 py-20 text-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 text-center max-w-5xl mx-auto">
            {[
              { value: '10K+', label: 'Active Users' },
              { value: '1M+', label: 'Files Shared' },
              { value: '99.9%', label: 'Uptime' },
              { value: '5GB', label: 'Free Storage' },
            ].map((stat, i) => (
              <div key={i}>
                <div className="text-5xl font-bold mb-2">{stat.value}</div>
                <div className="text-blue-100 text-lg">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Ready to Get Started?</h2>
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            Join thousands managing files the smart way. Free forever for personal use.
          </p>
          <Link href="/auth/register" className="inline-flex items-center gap-2 px-12 py-6 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold text-xl transition shadow-lg hover:shadow-xl">
            Create Free Account
            <ArrowRight className="w-6 h-6" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-gray-50 py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">F</span>
            </div>
            <span className="font-bold text-gray-900 text-lg">FileFlow</span>
          </div>
          <p className="text-gray-600">© 2024 FileFlow. All rights reserved.</p>
          <p className="text-sm text-gray-500 mt-2">Making file management as simple as UPI</p>
        </div>
      </footer>
    </div>
  );
}
