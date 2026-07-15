"use client";

import { useState } from 'react';
import { Save, Key, SlidersHorizontal, Bell, CheckCircle2, Bot, BrainCircuit } from 'lucide-react';

export function SettingsClientView() {
  const [activeTab, setActiveTab] = useState('ai');
  const [isSaving, setIsSaving] = useState(false);
  const [showSaved, setShowSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    // Simulate network request
    setTimeout(() => {
      setIsSaving(false);
      setShowSaved(true);
      setTimeout(() => setShowSaved(false), 3000);
    }, 1000);
  };

  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* Sidebar Navigation */}
      <div className="w-full md:w-64 space-y-2 flex-shrink-0">
        <button
          onClick={() => setActiveTab('ai')}
          className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'ai' 
              ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' 
              : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-zinc-800'
          }`}
        >
          <Bot className="w-5 h-5" />
          <span>AI Preferences</span>
        </button>
        
        <button
          onClick={() => setActiveTab('api')}
          className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'api' 
              ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' 
              : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-zinc-800'
          }`}
        >
          <Key className="w-5 h-5" />
          <span>API Integrations</span>
        </button>

        <button
          onClick={() => setActiveTab('platform')}
          className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'platform' 
              ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' 
              : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-zinc-800'
          }`}
        >
          <SlidersHorizontal className="w-5 h-5" />
          <span>Platform Settings</span>
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1">
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-800 overflow-hidden">
          
          <form onSubmit={handleSave} className="p-8">
            
            {activeTab === 'ai' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1 flex items-center">
                    <BrainCircuit className="w-5 h-5 mr-2 text-indigo-500" /> AI Generation Preferences
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Configure how Varsaka Labs AI writes your blogs and case studies.</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Brand Voice</label>
                    <select className="w-full sm:w-1/2 rounded-md border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option>Professional & Authoritative (Default)</option>
                      <option>Conversational & Approachable</option>
                      <option>Academic & Technical</option>
                      <option>Visionary & Bold</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Default Blog Length</label>
                    <select className="w-full sm:w-1/2 rounded-md border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option>Short (500 - 800 words)</option>
                      <option>Medium (1000 - 1500 words)</option>
                      <option>In-depth (2000+ words)</option>
                    </select>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-200 dark:border-zinc-800">
                    <label className="flex items-center space-x-3">
                      <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Automatically include "Varsaka Labs" CTA at the end of generated blogs</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'api' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1 flex items-center">
                    <Key className="w-5 h-5 mr-2 text-blue-500" /> External API Integrations
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Connect external models and scrapers to power your autonomous agents.</p>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">OpenAI API Key (For Text Generation)</label>
                    <input 
                      type="password" 
                      placeholder="sk-..." 
                      className="w-full rounded-md border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Anthropic API Key (Fallback Model)</label>
                    <input 
                      type="password" 
                      placeholder="sk-ant-..." 
                      className="w-full rounded-md border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tavily Search API Key (For Deep Web Scanning)</label>
                    <input 
                      type="password" 
                      placeholder="tvly-..." 
                      className="w-full rounded-md border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'platform' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1 flex items-center">
                    <SlidersHorizontal className="w-5 h-5 mr-2 text-green-500" /> Platform Settings
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Manage how the Varsaka Labs platform operates.</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Topic Discovery Auto-Refresh Interval</label>
                    <select className="w-full sm:w-1/2 rounded-md border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option>1 Hour</option>
                      <option>4 Hours</option>
                      <option>12 Hours</option>
                      <option>24 Hours</option>
                      <option>Manual Only</option>
                    </select>
                  </div>

                  <div className="pt-4 border-t border-gray-200 dark:border-zinc-800 space-y-3">
                    <label className="flex items-center space-x-3">
                      <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Enable Dark Mode globally</span>
                    </label>
                    <label className="flex items-center space-x-3">
                      <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Send me a weekly email summary of top discovered topics</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Form Footer */}
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-zinc-800 flex items-center justify-between">
              <div>
                {showSaved && (
                  <span className="flex items-center text-sm font-medium text-green-600 dark:text-green-400 animate-in fade-in zoom-in duration-300">
                    <CheckCircle2 className="w-4 h-4 mr-1.5" /> Settings Saved successfully
                  </span>
                )}
              </div>
              
              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm disabled:opacity-70 disabled:cursor-wait"
              >
                {isSaving ? 'Saving...' : <><Save className="w-4 h-4 mr-2" /> Save Changes</>}
              </button>
            </div>
            
          </form>
        </div>
      </div>
    </div>
  );
}
