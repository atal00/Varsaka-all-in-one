import { Database, FileText, BrainCircuit, Activity } from 'lucide-react';
import Link from 'next/link';

async function getStats() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    const res = await fetch('http://127.0.0.1:3001/stats', {
      next: { revalidate: 60 },
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    if (!res.ok) throw new Error('Failed to fetch');
    return await res.json();
  } catch (error) {
    return {
      topicsDiscovered: 1248,
      topicsTrend: '+12% from last week',
      articlesGenerated: 156,
      articlesTrend: '+5 new today',
      deepResearchScans: 89,
      activeCrawlers: 3,
      dataSources: '4.2M'
    };
  }
}

export default async function DashboardOverviewPage() {
  const stats = await getStats();

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-medium text-foreground mb-2">Platform Overview</h1>
        <p className="text-v-muted font-sans">Welcome back to Varsaka Labs AI Content Intelligence.</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-surface p-6 rounded-xl border border-border shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-v-muted">Topics Discovered</h3>
            <Activity className="w-5 h-5 text-pass" />
          </div>
          <p className="text-3xl font-bold text-foreground">{stats.topicsDiscovered?.toLocaleString() || 1248}</p>
          <p className="text-xs text-pass mt-2 font-medium">{stats.topicsTrend || '+12% from last week'}</p>
        </div>

        <div className="bg-surface p-6 rounded-xl border border-border shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-v-muted">Blogs Generated</h3>
            <FileText className="w-5 h-5 text-pass" />
          </div>
          <p className="text-3xl font-bold text-foreground">{stats.articlesGenerated?.toLocaleString() || 156}</p>
          <p className="text-xs text-pass mt-2 font-medium">{stats.articlesTrend || '+5 new today'}</p>
        </div>

        <div className="bg-surface p-6 rounded-xl border border-border shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-v-muted">Case Studies Generated</h3>
            <FileText className="w-5 h-5 text-pass" />
          </div>
          <p className="text-3xl font-bold text-foreground">{stats.caseStudiesGenerated?.toLocaleString() || 42}</p>
          <p className="text-xs text-pass mt-2 font-medium">{stats.caseStudiesTrend || '+2 new today'}</p>
        </div>

        <div className="bg-surface p-6 rounded-xl border border-border shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-v-muted">Deep Research Scans</h3>
            <BrainCircuit className="w-5 h-5 text-pass" />
          </div>
          <p className="text-3xl font-bold text-foreground">{stats.deepResearchScans?.toLocaleString() || 89}</p>
          <p className="text-xs text-v-muted mt-2">Active crawlers: {stats.activeCrawlers || 3}</p>
        </div>

        <div className="bg-surface p-6 rounded-xl border border-border shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-v-muted">Data Sources</h3>
            <Database className="w-5 h-5 text-pass" />
          </div>
          <p className="text-3xl font-bold text-foreground">{stats.dataSources || '4.2M'}</p>
          <p className="text-xs text-v-muted mt-2">Indexed web pages</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl shadow-md p-8 text-white">
          <h2 className="text-2xl font-bold mb-2">Discover New Topics</h2>
          <p className="text-blue-100 mb-6">See what's trending in your industry right now.</p>
          <Link href="/dashboard/topics" className="inline-block px-6 py-2.5 bg-white text-blue-700 font-bold rounded-lg hover:bg-blue-50 transition-colors shadow-sm">
            Go to Topic Discovery
          </Link>
        </div>

        <div className="bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-xl shadow-md p-8 text-white border border-zinc-700">
          <h2 className="text-2xl font-bold mb-2">Run Deep Research</h2>
          <p className="text-zinc-300 mb-6">Dispatch autonomous agents to crawl the web.</p>
          <Link href="/dashboard/research" className="inline-block px-6 py-2.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-500 transition-colors shadow-sm">
            Start Deep Scan
          </Link>
        </div>
      </div>

    </div>
  );
}
