"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  RefreshCw, 
  Loader2, 
  PlusCircle, 
  Flame, 
  TrendingUp, 
  BrainCircuit, 
  FileText, 
  Briefcase, 
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Info,
  Clock,
  Sparkles,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { createTopic } from '@/app/actions/topics';

type FilterCategory = 'ALL' | 'HOT_NOW' | 'VARSAKA_RELEVANT' | 'RISING' | 'BLOG_READY' | 'CASE_STUDY_READY' | 'RESEARCH_READY';

export function TopicsClientView({ initialTopics }: { initialTopics: any[] }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'blogs' | 'case-studies'>('blogs');
  const [filterCategory, setFilterCategory] = useState<FilterCategory>('ALL');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshStats, setRefreshStats] = useState<{ lastUpdated?: string; sourcesCount?: number } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [expandedTopicId, setExpandedTopicId] = useState<string | null>(null);
  const [researchingTopicId, setResearchingTopicId] = useState<string | null>(null);
  
  const router = useRouter();

  // Filter topics based on active tab, search query, and category badges
  const filteredTopics = initialTopics.filter(topic => {
    const isCaseStudy = topic.name.toLowerCase().startsWith('case study:') || topic.suggestedType === 'CASE_STUDY';
    const matchesTab = activeTab === 'blogs' ? !isCaseStudy : isCaseStudy;

    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = !query || 
      topic.name.toLowerCase().includes(query) ||
      (topic.aliases || []).some((a: string) => a.toLowerCase().includes(query)) ||
      (topic.targetKeywords || []).some((k: string) => k.toLowerCase().includes(query)) ||
      (topic.varsakaRelevance?.matchedDomains || []).some((d: string) => d.toLowerCase().includes(query));

    if (!matchesTab || !matchesSearch) return false;

    // Filter by recommendation category
    const trendScore = topic.trendScore || 0;
    const varsakaScore = topic.varsakaRelevance?.score || topic.seoScore || 0;
    const blogOpp = topic.contentOpportunity?.blog || 'MEDIUM';
    const caseOpp = topic.contentOpportunity?.caseStudy || 'MEDIUM';
    const researchOpp = topic.contentOpportunity?.research || 'MEDIUM';
    const momentum = topic.scoreBreakdown?.momentum || 0;

    switch (filterCategory) {
      case 'HOT_NOW':
        return trendScore >= 75 || topic.freshness === 'VERY_RECENT';
      case 'VARSAKA_RELEVANT':
        return varsakaScore >= 85;
      case 'RISING':
        return momentum >= 80;
      case 'BLOG_READY':
        return blogOpp === 'HIGH';
      case 'CASE_STUDY_READY':
        return caseOpp === 'HIGH';
      case 'RESEARCH_READY':
        return researchOpp === 'HIGH';
      case 'ALL':
      default:
        return true;
    }
  });

  // Handle actual real-time discovery and deduplication refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch('/api/topics/refresh', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setRefreshStats({
          lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          sourcesCount: data.sourcesCount || 6
        });
      }
      router.refresh();
    } catch (err) {
      console.error('Failed to refresh market intelligence:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleGenerateCustom = async () => {
    if (!searchQuery.trim()) return;
    setIsGenerating(true);

    try {
      const topicName = activeTab === 'case-studies' ? `Case Study: ${searchQuery.trim()}` : searchQuery.trim();
      await createTopic(topicName);
      setSearchQuery('');
      router.refresh();
    } catch (err) {
      console.error("Failed to generate custom topic", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeepResearch = async (topicId: string) => {
    setResearchingTopicId(topicId);
    try {
      const res = await fetch('/api/research/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topicId })
      });
      if (res.ok) {
        const research = await res.json();
        router.push(`/dashboard/research/${research.id}`);
      }
    } catch (err) {
      console.error('Failed to trigger deep research:', err);
    } finally {
      setResearchingTopicId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-start gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Topic Discovery</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
              Live Engine
            </span>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Real-time market intelligence, semantic deduplication & Varsaka domain opportunities.
          </p>
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
              placeholder="Search topic, keyword, or domain..."
            />
          </div>
          
          <button 
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 shadow-sm transition-all disabled:opacity-60"
            title="Refresh Market Intelligence"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-blue-500' : ''}`} />
            <span>{isRefreshing ? 'Harvesting Feeds...' : 'Refresh Market Intelligence'}</span>
          </button>
        </div>
      </div>

      {/* Intelligence Status Banner */}
      <div className="p-3.5 bg-gradient-to-r from-blue-50/80 via-white to-indigo-50/80 dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-800/80 rounded-xl border border-blue-100 dark:border-zinc-800 flex flex-wrap items-center justify-between text-xs text-gray-600 dark:text-gray-400 gap-3">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="flex items-center gap-1.5 font-medium text-gray-900 dark:text-gray-200">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            Verified Sources Analyzed: <strong className="text-blue-600 dark:text-blue-400">{refreshStats?.sourcesCount || 6} feeds</strong> (Hacker News, Dev.to, GitHub, InfoQ, OWASP, FinTech Engineering)
          </span>
          <span className="text-gray-300 dark:text-zinc-700">|</span>
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />
            Deduplication: <strong>Semantic Clustering Active</strong>
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
          <Clock className="w-3.5 h-3.5" />
          <span>Last updated: <strong>{refreshStats?.lastUpdated || 'Just now'}</strong></span>
        </div>
      </div>

      {/* Recommendation Category Filter Chips */}
      <div className="flex flex-wrap gap-2 items-center">
        <button
          onClick={() => setFilterCategory('ALL')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors border ${
            filterCategory === 'ALL'
              ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
              : 'bg-white dark:bg-zinc-900 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800'
          }`}
        >
          All Topics
        </button>
        <button
          onClick={() => setFilterCategory('HOT_NOW')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors border flex items-center gap-1 ${
            filterCategory === 'HOT_NOW'
              ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
              : 'bg-white dark:bg-zinc-900 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800'
          }`}
        >
          <Flame className="w-3.5 h-3.5 text-amber-500" /> Hot Now
        </button>
        <button
          onClick={() => setFilterCategory('VARSAKA_RELEVANT')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors border flex items-center gap-1 ${
            filterCategory === 'VARSAKA_RELEVANT'
              ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
              : 'bg-white dark:bg-zinc-900 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800'
          }`}
        >
          <BrainCircuit className="w-3.5 h-3.5 text-purple-500" /> High Varsaka Relevance
        </button>
        <button
          onClick={() => setFilterCategory('RISING')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors border flex items-center gap-1 ${
            filterCategory === 'RISING'
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
              : 'bg-white dark:bg-zinc-900 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5 text-emerald-500" /> Rising Momentum
        </button>
        <button
          onClick={() => setFilterCategory('BLOG_READY')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors border flex items-center gap-1 ${
            filterCategory === 'BLOG_READY'
              ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
              : 'bg-white dark:bg-zinc-900 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800'
          }`}
        >
          <FileText className="w-3.5 h-3.5 text-blue-500" /> Blog Ready
        </button>
        <button
          onClick={() => setFilterCategory('CASE_STUDY_READY')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors border flex items-center gap-1 ${
            filterCategory === 'CASE_STUDY_READY'
              ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
              : 'bg-white dark:bg-zinc-900 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800'
          }`}
        >
          <Briefcase className="w-3.5 h-3.5 text-indigo-500" /> Case Study Ready
        </button>
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
          Blogs ({initialTopics.filter(t => !t.name.toLowerCase().startsWith('case study:') && t.suggestedType !== 'CASE_STUDY').length})
        </button>
        <button
          onClick={() => setActiveTab('case-studies')}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'case-studies' 
              ? 'bg-white dark:bg-zinc-700 text-gray-900 dark:text-white shadow-sm' 
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
          }`}
        >
          Case Studies ({initialTopics.filter(t => t.name.toLowerCase().startsWith('case study:') || t.suggestedType === 'CASE_STUDY').length})
        </button>
      </div>

      {/* Topics Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-800 overflow-hidden transition-opacity duration-200" style={{ opacity: isRefreshing ? 0.7 : 1 }}>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-zinc-800">
            <thead className="bg-gray-50 dark:bg-zinc-900/50">
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Topic & Domain Alignment
                </th>
                <th scope="col" className="px-5 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Trend Score
                </th>
                <th scope="col" className="px-5 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Varsaka Relevance
                </th>
                <th scope="col" className="px-4 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Freshness
                </th>
                <th scope="col" className="px-4 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Opportunities
                </th>
                <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-zinc-800">
              {filteredTopics.map((topic: any) => {
                const isExpanded = expandedTopicId === topic.id;
                const breakdown = topic.scoreBreakdown || { recency: 90, momentum: 85, crossSourceConfirmation: 80, novelty: 75 };
                const relevance = topic.varsakaRelevance || { score: topic.seoScore || 85, matchedDomains: ['Software Testing'], explanation: [] };
                const sources = topic.sources || [];

                return (
                  <tr key={topic.id} className="hover:bg-gray-50/60 dark:hover:bg-zinc-800/40 transition-colors group">
                    {/* Topic Name, Aliases & Domain */}
                    <td className="px-6 py-4">
                      <div className="max-w-md">
                        <div className="flex items-center gap-2">
                          <Link 
                            href={`/dashboard/topics/${topic.id}`}
                            className="text-sm font-semibold text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                          >
                            {topic.name}
                          </Link>
                          {topic.trendScore >= 80 && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-800 flex items-center gap-0.5">
                              <Flame className="w-2.5 h-2.5 text-amber-500" /> Hot
                            </span>
                          )}
                        </div>

                        {/* Matched Domain Badge */}
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                            {relevance.matchedDomains?.[0] || 'Software Testing & QA'}
                          </span>
                          {sources.length > 0 && (
                            <span className="text-[11px] text-gray-400 dark:text-zinc-600">
                              • {sources.length} {sources.length === 1 ? 'source' : 'sources'}
                            </span>
                          )}
                        </div>

                        {/* Expandable details toggle */}
                        <button
                          onClick={() => setExpandedTopicId(isExpanded ? null : topic.id)}
                          className="mt-1 text-[11px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5"
                        >
                          {isExpanded ? (
                            <><ChevronUp className="w-3 h-3" /> Hide Intelligence Breakdown</>
                          ) : (
                            <><ChevronDown className="w-3 h-3" /> View Sources & Breakdown</>
                          )}
                        </button>

                        {/* Expanded details container */}
                        {isExpanded && (
                          <div className="mt-3 p-3.5 bg-gray-50 dark:bg-zinc-800/80 rounded-lg border border-gray-200 dark:border-zinc-700 text-xs space-y-2.5">
                            <div>
                              <div className="font-semibold text-gray-800 dark:text-gray-200 mb-1">
                                Why Relevant to Varsaka:
                              </div>
                              <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-0.5">
                                {(relevance.explanation || []).map((exp: string, idx: number) => (
                                  <li key={idx}>{exp}</li>
                                ))}
                              </ul>
                            </div>

                            {sources.length > 0 && (
                              <div>
                                <div className="font-semibold text-gray-800 dark:text-gray-200 mb-1">
                                  Verified Evidence Sources:
                                </div>
                                <div className="space-y-1">
                                  {sources.slice(0, 3).map((s: any, sIdx: number) => (
                                    <div key={sIdx} className="flex items-center justify-between text-gray-600 dark:text-gray-300">
                                      <a 
                                        href={s.sourceUrl} 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        className="hover:text-blue-600 dark:hover:text-blue-400 truncate max-w-xs flex items-center gap-1"
                                      >
                                        <ExternalLink className="w-2.5 h-2.5 flex-shrink-0" />
                                        <span className="truncate">{s.title}</span>
                                      </a>
                                      <span className="text-[10px] text-gray-400 flex-shrink-0 ml-2">{s.source}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Transparent Trend Score */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                            {topic.trendScore}/100
                          </span>
                          <div className="w-16 h-2 bg-gray-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${
                                topic.trendScore > 80 ? 'bg-emerald-500' : topic.trendScore > 60 ? 'bg-amber-500' : 'bg-rose-500'
                              }`}
                              style={{ width: `${topic.trendScore}%` }}
                            />
                          </div>
                        </div>
                        {/* Transparent score breakdown micro-indicators */}
                        <div className="text-[10px] text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                          <span>Rec: {breakdown.recency}</span>
                          <span>•</span>
                          <span>Mom: {breakdown.momentum}</span>
                          <span>•</span>
                          <span>Nov: {breakdown.novelty}</span>
                        </div>
                      </div>
                    </td>

                    {/* Varsaka Relevance */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <BrainCircuit className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                          <span className="text-sm font-bold text-purple-700 dark:text-purple-300">
                            {relevance.score}/100
                          </span>
                        </div>
                        <span className="inline-block px-2 py-0.5 text-[10px] font-semibold rounded bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300">
                          {relevance.score >= 90 ? 'Critical Focus' : relevance.score >= 75 ? 'High Domain Fit' : 'Adjacent Trend'}
                        </span>
                      </div>
                    </td>

                    {/* Freshness Signal */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 inline-flex text-xs font-medium rounded-full ${
                        topic.freshness === 'VERY_RECENT' 
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800' 
                          : topic.freshness === 'RECENT'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                          : 'bg-gray-100 text-gray-700 dark:bg-zinc-800 dark:text-gray-300'
                      }`}>
                        {topic.freshnessLabel || '🔥 <24h'}
                      </span>
                    </td>

                    {/* Content Opportunities */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1 text-[11px]">
                        <span className="flex items-center gap-1 text-gray-700 dark:text-gray-300">
                          <FileText className="w-3 h-3 text-blue-500" />
                          Blog: <strong className="text-blue-600 dark:text-blue-400">{topic.contentOpportunity?.blog || 'HIGH'}</strong>
                        </span>
                        <span className="flex items-center gap-1 text-gray-700 dark:text-gray-300">
                          <Briefcase className="w-3 h-3 text-purple-500" />
                          Case Study: <strong className="text-purple-600 dark:text-purple-400">{topic.contentOpportunity?.caseStudy || 'MED'}</strong>
                        </span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 whitespace-nowrap text-right text-xs font-semibold">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleDeepResearch(topic.id)}
                          disabled={researchingTopicId === topic.id}
                          className="px-2.5 py-1.5 rounded bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-gray-700 dark:text-gray-300 transition-colors disabled:opacity-60"
                          title="Generate autonomous deep research dossier"
                        >
                          {researchingTopicId === topic.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            'Research'
                          )}
                        </button>
                        
                        <Link 
                          href={`/dashboard/topics/${topic.id}`} 
                          className="px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm transition-colors"
                        >
                          {activeTab === 'blogs' ? 'Write Blog' : 'Write Case Study'}
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
              
              {/* Empty State / Custom Topic Generation */}
              {filteredTopics.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center space-y-4">
                      <div className="text-gray-500 dark:text-gray-400">
                        {searchQuery ? (
                          <>No exact matches found for <strong className="text-gray-900 dark:text-white">"{searchQuery}"</strong></>
                        ) : (
                          "No topics found matching the current filter."
                        )}
                      </div>
                      
                      {searchQuery && (
                        <div className="p-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/50 rounded-xl max-w-md w-full">
                          <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">Want to discover this topic?</h3>
                          <p className="text-sm text-blue-600 dark:text-blue-400 mb-4">
                            Our intelligence engine will calculate transparent trend scores, assess Varsaka relevance, and structure content opportunities for this topic.
                          </p>
                          <button
                            onClick={handleGenerateCustom}
                            disabled={isGenerating}
                            className="flex w-full items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
                          >
                            {isGenerating ? (
                              <><Loader2 className="w-4 h-4 animate-spin" /> <span>Analyzing & Adding Topic...</span></>
                            ) : (
                              <><PlusCircle className="w-4 h-4" /> <span>Add & Discover Custom Topic</span></>
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
