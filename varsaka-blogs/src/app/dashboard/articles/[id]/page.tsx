import Link from 'next/link';
import { ArrowLeft, Calendar, FileText, Share2, CheckCircle2, UserCheck, Sparkles } from 'lucide-react';
import { ArticleActions } from './article-actions';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
async function getArticle(id: string) {
  try {
    const res = await fetch(`http://127.0.0.1:3001/articles/${id}`, { cache: 'no-store' });
    if (!res.ok) return null;
    return res.json();
  } catch (err) {
    return null;
  }
}

export default async function ArticleDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const article = await getArticle(resolvedParams.id);

  if (!article) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Blog not found</h1>
        <Link href="/dashboard/articles" className="text-blue-600 mt-4 inline-block hover:underline">
          &larr; Back to Blogs
        </Link>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      {/* Header section */}
      <div className="flex items-center space-x-4 mb-2">
        <Link href="/dashboard/articles" className="text-v-muted hover:text-foreground transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-3xl font-serif font-medium text-foreground flex-1">{article.title}</h1>
        
        <ArticleActions articleId={article.id} isPublished={article.status === 'PUBLISHED'} content={article.content} />
      </div>
      
      <div className="flex flex-wrap items-center gap-6 text-sm border-b border-border pb-6">
        <div className="flex items-center space-x-2">
          <FileText className="w-4 h-4 text-v-faint" />
          <span className="text-v-muted">Status: <strong className="text-foreground">{article.status}</strong></span>
        </div>
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-v-faint" />
          <span className="text-v-muted">Generated: {new Date(article.createdAt).toLocaleString()}</span>
        </div>
        {article.humanizedScore && (
          <div className="flex items-center space-x-2 bg-[#E5F3EC]/50 px-3 py-1 rounded-full border border-[#2F6F4E]/20">
            <UserCheck className="w-4 h-4 text-[#2F6F4E]" />
            <span className="text-[#2F6F4E] font-medium">Humanized: {article.humanizedScore}%</span>
            <Sparkles className="w-3 h-3 text-[#2F6F4E]" />
          </div>
        )}
      </div>

      <div className="bg-surface rounded-xl shadow-sm border border-border overflow-hidden">
        <div className="p-8 md:p-12">
          <article className="prose prose-zinc prose-p:text-foreground/90 prose-headings:text-foreground prose-headings:font-serif prose-headings:font-medium prose-a:text-primary prose-strong:text-foreground prose-blockquote:border-l-primary prose-blockquote:text-v-muted max-w-none font-sans">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{article.content}</ReactMarkdown>
          </article>
        </div>
      </div>
    </div>
  );
}
