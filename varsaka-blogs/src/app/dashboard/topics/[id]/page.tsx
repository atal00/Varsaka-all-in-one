import Link from 'next/link';
import { ArrowLeft, ExternalLink, Calendar, User, Lightbulb, Key, TrendingUp } from 'lucide-react';
import { GenerateArticleButton } from '@/components/generate-article-button';

async function getTopic(id: string) {
  try {
    const res = await fetch(`http://127.0.0.1:3001/topics/${id}`, {
      cache: 'no-store'
    });
    if (!res.ok) {
      return null;
    }
    return res.json();
  } catch (err) {
    return null;
  }
}

export default async function TopicDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const topic = await getTopic(resolvedParams.id);

  if (!topic) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Topic not found</h1>
        <Link href="/dashboard/topics" className="text-blue-600 mt-4 inline-block hover:underline">
          &larr; Back to Topics
        </Link>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      {/* Header section */}
      <div className="flex items-center space-x-4 mb-2">
        <Link href="/dashboard/topics" className="text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{topic.name}</h1>
      </div>
      
      <div className="flex items-center space-x-6 text-sm">
        <div className="flex items-center space-x-2">
          <TrendingUp className="w-4 h-4 text-green-500" />
          <span className="text-gray-600 dark:text-gray-400">Trend Score: <strong className="text-gray-900 dark:text-white">{topic.trendScore}/100</strong></span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-gray-600 dark:text-gray-400">SEO Score: <strong className="text-gray-900 dark:text-white">{topic.seoScore}/100</strong></span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            {topic.status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Main Content Area */}
        <div className="md:col-span-2 space-y-8">
          
          {/* Relevant Links & Sources */}
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-800 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
              <ExternalLink className="w-5 h-5 mr-2 text-blue-500" />
              Relevant Sources & Mentions
            </h2>
            
            <div className="space-y-4">
              {topic.relevantLinks?.map((link: any, idx: number) => (
                <div key={idx} className="p-4 rounded-lg border border-gray-100 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors">
                  <a href={link.url} target="_blank" rel="noopener noreferrer" className="block">
                    <h3 className="font-medium text-blue-600 dark:text-blue-400 hover:underline mb-2">{link.title}</h3>
                    <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                      <span className="flex items-center">
                        <User className="w-3 h-3 mr-1" /> {link.author}
                      </span>
                      <span className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" /> {link.datePosted}
                      </span>
                    </div>
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* Content Suggestions */}
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-800 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
              <Lightbulb className="w-5 h-5 mr-2 text-yellow-500" />
              AI Content Suggestions
            </h2>
            
            <ul className="space-y-3">
              {topic.suggestions?.map((suggestion: string, idx: number) => (
                <li key={idx} className="flex items-start">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-bold mr-3 mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {suggestion}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          
        </div>

        {/* Sidebar Area */}
        <div className="space-y-8">
          
          {/* Target Keywords */}
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-200 dark:border-zinc-800 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Key className="w-4 h-4 mr-2 text-green-500" />
              Target Keywords
            </h2>
            
            <div className="flex flex-wrap gap-2">
              {topic.keywords?.map((keyword: string, idx: number) => (
                <span key={idx} className="px-3 py-1.5 rounded-md text-sm bg-gray-100 dark:bg-zinc-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-zinc-700">
                  {keyword}
                </span>
              ))}
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl shadow-md p-6 text-white">
            <h3 className="text-lg font-bold mb-2">Ready to generate?</h3>
            <p className="text-blue-100 text-sm mb-4">
              Our AI agent has gathered enough context to write a comprehensive {topic.name.toLowerCase().startsWith('case study:') ? 'case study' : 'blog'}.
            </p>
            <GenerateArticleButton 
              topicId={topic.id} 
              type={topic.name.toLowerCase().startsWith('case study:') ? 'case-study' : 'blog'} 
            />
          </div>

        </div>
      </div>
    </div>
  );
}
