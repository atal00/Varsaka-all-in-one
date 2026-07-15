"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, RefreshCw, Loader2, PlusCircle } from 'lucide-react';

export function TopicsClientView({ initialTopics }: { initialTopics: any[] }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'blogs' | 'case-studies'>('blogs');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const router = useRouter();

  // Auto-refresh every 10 seconds for demonstration (normally 1 hour)
  useEffect(() => {
    const intervalId = setInterval(() => {
      // Background refresh without showing spinner to keep UI clean
      router.refresh();
    }, 10000); // 10 seconds
    
    return () => clearInterval(intervalId);
  }, [router]);

  // Filter topics based on search query and active tab
  const filteredTopics = initialTopics.filter(topic => {
    const matchesSearch = topic.name.toLowerCase().includes(searchQuery.toLowerCase());
    const isCaseStudy = topic.name.toLowerCase().startsWith('case study:');
    
    if (activeTab === 'blogs') {
      return matchesSearch && !isCaseStudy;
    } else {
      return matchesSearch && isCaseStudy;
    }
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // router.refresh() will re-fetch Server Components data
    router.refresh();
    
    // Artificial delay to show spinner
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  const handleGenerateCustom = async () => {
    if (!searchQuery.trim()) return;
    setIsGenerating(true);

    try {
      await fetch('http://127.0.0.1:3001/topics/custom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: activeTab === 'case-studies' ? `Case Study: ${searchQuery.trim()}` : searchQuery.trim() })
      });
      // Clear search and refresh data
      setSearchQuery('');
      router.refresh();
    } catch (err) {
      console.error("Failed to generate custom topic", err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-start gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Topic Discovery</h1>
          <p className="text-gray-600 dark:text-gray-400">Discover trending topics and analyze keyword opportunities.</p>
        </div>
        
        <div className="flex flex-col items-end gap-2 w-full md:w-auto">
          <div className="relative w-full md:w-96">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg leading-5 bg-white dark:bg-zinc-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors text-gray-900 dark:text-white"
              placeholder="Search or enter a new topic..."
            />
          </div>
          <button 
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            title="Refresh Topics"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-blue-500' : ''}`} />
            <span>Refresh list</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-zinc-800/50 p-1 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('blogs')}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'blogs' 
              ? 'bg-white dark:bg-zinc-700 text-gray-900 dark:text-white shadow-sm' 
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
          }`}
        >
          Blogs
        </button>
        <button
          onClick={() => setActiveTab('case-studies')}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'case-studies' 
              ? 'bg-white dark:bg-zinc-700 text-gray-900 dark:text-white shadow-sm' 
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
          }`}
        >
          Case Studies
        </button>
      </div>

      {/* Topics Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-800 overflow-hidden transition-opacity duration-200" style={{ opacity: isRefreshing ? 0.7 : 1 }}>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-zinc-800">
            <thead className="bg-gray-50 dark:bg-zinc-900/50">
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Topic
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Trend Score
                </th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-zinc-800">
              {filteredTopics.map((topic: any) => (
                <tr key={topic.id} className="hover:bg-gray-50/50 dark:hover:bg-zinc-800/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{topic.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                      <div className="w-16 h-2 bg-gray-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${topic.trendScore > 80 ? 'bg-green-500' : topic.trendScore > 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                          style={{ width: `${topic.trendScore}%` }}
                        />
                      </div>
                      <span>{topic.trendScore}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800 dark:bg-zinc-800 dark:text-gray-300">
                      {topic.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link href={`/dashboard/topics/${topic.id}`} className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300">
                      {activeTab === 'blogs' ? 'Write Blog' : 'Write Case Study'}
                    </Link>
                  </td>
                </tr>
              ))}
              
              {/* Empty State / Custom Topic Generation */}
              {filteredTopics.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center space-y-4">
                      <div className="text-gray-500 dark:text-gray-400">
                        {searchQuery ? (
                          <>No exact matches found for <strong className="text-gray-900 dark:text-white">"{searchQuery}"</strong></>
                        ) : (
                          "No topics found."
                        )}
                      </div>
                      
                      {searchQuery && (
                        <div className="p-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/50 rounded-xl max-w-md w-full">
                          <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">Want to research this topic?</h3>
                          <p className="text-sm text-blue-600 dark:text-blue-400 mb-4">Our AI can instantly generate a deep research report for any custom topic you enter.</p>
                          <button
                            onClick={handleGenerateCustom}
                            disabled={isGenerating}
                            className="flex w-full items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                          >
                            {isGenerating ? (
                              <><Loader2 className="w-4 h-4 animate-spin" /> <span>Adding Topic...</span></>
                            ) : (
                              <><PlusCircle className="w-4 h-4" /> <span>Generate Custom Topic</span></>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
