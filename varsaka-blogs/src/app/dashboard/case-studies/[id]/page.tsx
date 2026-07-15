import Link from 'next/link';
import { ArrowLeft, Calendar, Briefcase, Sparkles } from 'lucide-react';
import { CaseStudyActions } from './case-study-actions';

async function getCaseStudy(id: string) {
  try {
    const res = await fetch(`http://127.0.0.1:3001/case-studies/${id}`, { cache: 'no-store' });
    if (!res.ok) return null;
    return res.json();
  } catch (err) {
    return null;
  }
}

export default async function CaseStudyDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const caseStudy = await getCaseStudy(resolvedParams.id);

  if (!caseStudy) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Case Study not found</h1>
        <Link href="/dashboard/case-studies" className="text-blue-600 mt-4 inline-block hover:underline">
          &larr; Back to Case Studies
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] p-8 md:p-12">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header section */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard/case-studies" className="text-gray-400 hover:text-gray-700 transition-colors">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <h1 className="text-3xl font-serif text-[#A1A1AA]">{caseStudy.title || 'Case study title'}</h1>
          </div>
          
          <CaseStudyActions caseStudyId={caseStudy.id} isPublished={caseStudy.status === 'PUBLISHED'} content={caseStudy.summary || ''} />
        </div>

        {/* Editable Form */}
        <form className="space-y-8 mt-12">
          
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Slug</label>
            <input 
              type="text" 
              defaultValue={caseStudy.slug} 
              className="w-full bg-[#F3F2EE] border border-transparent rounded-lg px-4 py-3.5 text-gray-600 font-mono text-sm focus:border-gray-300 focus:bg-white focus:outline-none transition-colors shadow-sm" 
              placeholder="case-slug"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Sector</label>
            <input 
              type="text" 
              defaultValue={caseStudy.sector} 
              className="w-full bg-[#F3F2EE] border border-transparent rounded-lg px-4 py-3.5 text-gray-600 focus:border-gray-300 focus:bg-white focus:outline-none transition-colors shadow-sm" 
              placeholder="Fintech"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Summary</label>
            <textarea 
              rows={4} 
              defaultValue={caseStudy.summary} 
              className="w-full bg-[#F3F2EE] border border-transparent rounded-lg px-4 py-3.5 text-gray-600 focus:border-gray-300 focus:bg-white focus:outline-none transition-colors resize-y shadow-sm" 
              placeholder="A one-paragraph overview of the engagement."
            />
          </div>

          <hr className="border-[#E5E5E5] my-8" />

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">The Challenge</label>
            <textarea 
              rows={5} 
              defaultValue={caseStudy.challenge} 
              className="w-full bg-[#F3F2EE] border border-transparent rounded-lg px-4 py-3.5 text-gray-600 focus:border-gray-300 focus:bg-white focus:outline-none transition-colors resize-y shadow-sm" 
              placeholder="What problem were we solving?"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Our Solution</label>
            <textarea 
              rows={6} 
              defaultValue={caseStudy.solution} 
              className="w-full bg-[#F3F2EE] border border-transparent rounded-lg px-4 py-3.5 text-gray-600 focus:border-gray-300 focus:bg-white focus:outline-none transition-colors resize-y shadow-sm" 
              placeholder="What did we build or do?"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">The Process</label>
            <textarea 
              rows={6} 
              defaultValue={caseStudy.process} 
              className="w-full bg-[#F3F2EE] border border-transparent rounded-lg px-4 py-3.5 text-gray-600 focus:border-gray-300 focus:bg-white focus:outline-none transition-colors resize-y shadow-sm" 
              placeholder="How did the work unfold?"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">The Outcome</label>
            <textarea 
              rows={6} 
              defaultValue={caseStudy.outcome} 
              className="w-full bg-[#F3F2EE] border border-transparent rounded-lg px-4 py-3.5 text-gray-600 focus:border-gray-300 focus:bg-white focus:outline-none transition-colors resize-y shadow-sm" 
              placeholder="What changed for the client?"
            />
          </div>
          
          <hr className="border-[#E5E5E5] my-8" />

          <div className="flex items-center space-x-4">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider w-24 flex-shrink-0">Metrics</label>
            <input 
              type="text" 
              defaultValue={caseStudy.metrics} 
              className="w-full bg-transparent border-none text-gray-500 focus:ring-0 placeholder-gray-400 text-sm" 
              placeholder="e.g. Uptime - 99.99%"
            />
          </div>
          
        </form>
      </div>
    </div>
  );
}
