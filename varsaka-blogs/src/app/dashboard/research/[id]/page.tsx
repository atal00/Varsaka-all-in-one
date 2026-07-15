import Link from 'next/link';
import { ArrowLeft, CheckCircle2, FileText, Database, Globe, BrainCircuit } from 'lucide-react';
import { CopyButton } from '@/components/copy-button';

async function getResearch(id: string) {
  try {
    const res = await fetch(`http://127.0.0.1:3001/research/${id}`, { cache: 'no-store' });
    if (!res.ok) return null;
    return res.json();
  } catch (err) {
    return null;
  }
}

export default async function ResearchDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const research = await getResearch(resolvedParams.id);

  if (!research) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Research report not found</h1>
        <Link href="/dashboard/research" className="text-blue-600 mt-4 inline-block hover:underline">
          &larr; Back to Deep Research
        </Link>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      {/* Header section */}
      <div className="flex items-center space-x-4 mb-2">
        <Link href="/dashboard/research" className="text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex-1">{research.topicName}</h1>
        
        <div className="flex space-x-3">
          <button className="flex items-center px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-md">
            <FileText className="w-4 h-4 mr-2" /> Generate Blog
          </button>
        </div>
      </div>
      
      <div className="flex items-center space-x-6 text-sm border-b border-gray-200 dark:border-zinc-800 pb-6">
        <div className="flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-green-500" />
          <span className="text-gray-600 dark:text-gray-400">Status: <strong className="text-gray-900 dark:text-white">{research.status}</strong></span>
        </div>
        <div className="flex items-center space-x-2">
          <Globe className="w-4 h-4 text-gray-400" />
          <span className="text-gray-600 dark:text-gray-400">Sources Crawled: <strong className="text-gray-900 dark:text-white">{research.sourcesCount} URLs</strong></span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Knowledge Graph */}
        <div className="lg:col-span-2 space-y-8">
          
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-800 p-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center mb-6">
              <BrainCircuit className="w-6 h-6 mr-3 text-indigo-500" />
              Executive Summary
              <div className="ml-auto">
                 <CopyButton content={research.knowledgeGraph.summary} label="Copy" className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium border border-gray-200 dark:border-zinc-700" />
              </div>
            </h2>
            <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
              {research.knowledgeGraph.summary}
            </p>
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-800 p-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center mb-6">
              <Database className="w-6 h-6 mr-3 text-blue-500" />
              Extracted Facts & Statistics
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {research.knowledgeGraph.facts.map((fact: string, idx: number) => (
                <div key={idx} className="bg-gray-50 dark:bg-zinc-800/50 p-6 rounded-xl border border-gray-100 dark:border-zinc-700/50 hover:shadow-md transition-shadow">
                  <p className="text-sm text-gray-800 dark:text-gray-200 font-medium">
                    "{fact}"
                  </p>
                </div>
              ))}
            </div>
          </div>
          
        </div>

        {/* Right Column: Sources */}
        <div className="space-y-8">
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-800 p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center">
              <Globe className="w-5 h-5 mr-2 text-gray-500" />
              Cited Sources
            </h2>
            
            <div className="space-y-4">
              {research.knowledgeGraph.sources.map((source: any, idx: number) => (
                <a 
                  key={idx}
                  href={source.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="block p-4 rounded-lg border border-gray-100 dark:border-zinc-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:border-indigo-200 dark:hover:border-indigo-800 transition-colors group"
                >
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 group-hover:text-indigo-700 dark:group-hover:text-indigo-300 mb-1">{source.title}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{source.url}</p>
                </a>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
