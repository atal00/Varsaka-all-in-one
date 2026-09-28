import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ArrowLeft, Calendar, Clock, User, ArrowRight, ExternalLink } from 'lucide-react';

interface Props {
  params: Promise<{ slug: string }>;
}

async function getBlogPost(slug: string) {
  const supabase = await createClient();
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);

  let query = supabase.from('blogs').select('*').eq('status', 'published');
  if (isUUID) {
    query = query.eq('id', slug);
  } else {
    query = query.eq('slug', slug);
  }

  const { data, error } = await query.maybeSingle();
  if (error || !data) return null;
  return data;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPost(slug);

  if (!post) {
    return {
      title: 'Article Not Found | Varsaka Blog',
      description: 'The requested article could not be found.',
    };
  }

  const title = post.seo_title || post.title || 'Varsaka Blog';
  const description = post.seo_description || post.summary || 'Varsaka Engineering & QA Insights';
  const canonicalUrl = post.canonical_url || `https://blog.varsaka.com/${post.slug || post.id}`;

  return {
    title: `${title} | Varsaka Blog`,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: post.og_title || title,
      description,
      url: canonicalUrl,
      type: 'article',
      publishedTime: post.date || post.created_at,
      authors: [post.author || 'Varsaka Engineering Team'],
      images: post.image ? [{ url: post.image }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.og_title || title,
      description,
      images: post.image ? [post.image] : [],
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getBlogPost(slug);

  if (!post) {
    notFound();
  }

  let parsedSections = [];
  if (Array.isArray(post.sections) && post.sections.length > 0) {
    parsedSections = post.sections;
  } else if (typeof post.sections === 'string' && post.sections.trim()) {
    try {
      parsedSections = JSON.parse(post.sections);
    } catch (e) {
      parsedSections = [];
    }
  }

  const formattedDate = post.date || post.created_at 
    ? new Date(post.date || post.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) 
    : 'Recent';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.summary || post.seo_description,
    image: post.image || undefined,
    datePublished: post.date || post.created_at,
    author: {
      '@type': 'Organization',
      name: post.author || 'Varsaka Engineering Team',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Varsaka',
      logo: {
        '@type': 'ImageObject',
        url: 'https://varsaka.com/icon.png',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://blog.varsaka.com/${post.slug || post.id}`,
    },
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Inject Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Navigation Header */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3 group">
            <span className="font-serif text-2xl font-bold tracking-tight text-white group-hover:text-indigo-400 transition-colors">
              VARSAKA
            </span>
            <span className="text-xs font-mono uppercase tracking-widest text-slate-400 px-2 py-0.5 rounded border border-slate-800 bg-slate-900/60">
              Blog
            </span>
          </Link>

          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link href="/" className="inline-flex items-center space-x-1 text-slate-400 hover:text-white transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>All Articles</span>
            </Link>
            <Link href="https://varsaka.com" className="text-slate-400 hover:text-white transition-colors hidden sm:inline-block">
              Main Site
            </Link>
            <Link 
              href="https://varsaka.com/contact" 
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors inline-flex items-center space-x-1"
            >
              <span>Get in Touch</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </nav>
        </div>
      </header>

      {/* Article Container */}
      <main className="flex-1 max-w-4xl mx-auto px-6 py-12 w-full">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-xs font-mono text-slate-500 mb-8">
          <Link href="https://varsaka.com" className="hover:text-slate-300">Varsaka</Link>
          <span>/</span>
          <Link href="/" className="hover:text-slate-300">Blog</Link>
          <span>/</span>
          <span className="text-slate-400 truncate max-w-xs">{post.title}</span>
        </div>

        {/* Article Header */}
        <header className="space-y-6 mb-12">
          <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
            <span className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 uppercase tracking-wider font-semibold">
              {post.category || 'Quality Engineering'}
            </span>
            <span className="flex items-center space-x-1 text-slate-400">
              <Calendar className="w-3.5 h-3.5" />
              <span>{formattedDate}</span>
            </span>
            <span className="flex items-center space-x-1 text-slate-400">
              <Clock className="w-3.5 h-3.5" />
              <span>{post.read_time || '7 min read'}</span>
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-serif font-medium text-white leading-tight tracking-tight">
            {post.title}
          </h1>

          <div className="flex items-center space-x-4 pt-4 border-t border-slate-800">
            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-serif text-lg font-bold text-indigo-400 border border-slate-700">
              {(post.author || 'V').charAt(0)}
            </div>
            <div>
              <p className="font-medium text-white text-sm">{post.author || 'Varsaka Engineering Team'}</p>
              <p className="text-xs text-slate-400 font-light">{post.author_role || 'Quality Engineering Practice'}</p>
            </div>
          </div>
        </header>

        {/* Featured Image */}
        {post.image && (
          <div className="mb-12 rounded-2xl overflow-hidden border border-slate-800/80 bg-slate-900">
            <img 
              src={post.image} 
              alt={post.title} 
              className="w-full h-auto max-h-[500px] object-cover" 
            />
          </div>
        )}

        {/* Summary Callout */}
        {post.summary && (
          <div className="p-6 rounded-xl border border-indigo-500/20 bg-indigo-500/5 mb-12 text-slate-300 font-light text-lg leading-relaxed">
            <p className="italic">{post.summary}</p>
          </div>
        )}

        {/* Article Body */}
        <article className="prose prose-invert prose-slate max-w-none prose-headings:font-serif prose-headings:font-normal prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4 prose-p:text-slate-300 prose-p:leading-relaxed prose-li:text-slate-300 space-y-8">
          {parsedSections.length > 0 ? (
            parsedSections.map((sec: any, idx: number) => (
              <section key={idx} className="space-y-4">
                {sec.title && <h2 className="text-2xl font-serif text-white">{sec.title}</h2>}
                {sec.content && (
                  <div className="text-slate-300 leading-relaxed font-light text-base space-y-4">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {sec.content}
                    </ReactMarkdown>
                  </div>
                )}
                {sec.callout && (
                  <div className="p-4 rounded-lg bg-slate-900 border-l-4 border-indigo-500 text-slate-300 text-sm">
                    {sec.callout}
                  </div>
                )}
              </section>
            ))
          ) : post.content ? (
            <div className="text-slate-300 leading-relaxed font-light text-base space-y-4">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {post.content}
              </ReactMarkdown>
            </div>
          ) : (
            <p className="text-slate-400">Content coming soon.</p>
          )}
        </article>

        {/* Back and Contact CTA Box */}
        <div className="mt-16 pt-8 border-t border-slate-800 space-y-8">
          <Link
            href="/"
            className="inline-flex items-center space-x-2 text-indigo-400 hover:text-indigo-300 font-medium text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Articles</span>
          </Link>

          <div className="p-8 rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 to-indigo-950/30 text-center space-y-4">
            <h3 className="text-2xl font-serif text-white">Need rigorous software quality assurance?</h3>
            <p className="text-slate-400 max-w-lg mx-auto text-sm font-light">
              Varsaka partners with high-growth teams to engineer automated testing, eliminate regressions, and secure production environments.
            </p>
            <Link
              href="https://varsaka.com/contact"
              className="inline-flex items-center space-x-2 bg-white text-slate-950 hover:bg-slate-200 px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors"
            >
              <span>Speak with an Engineer</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 py-12 px-6 mt-auto">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-sm text-slate-500">
          <div className="flex items-center space-x-3">
            <span className="font-serif text-lg font-bold text-white tracking-tight">VARSAKA</span>
            <span>&copy; {new Date().getFullYear()} Varsaka. All rights reserved.</span>
          </div>

          <div className="flex items-center space-x-6">
            <Link href="https://varsaka.com" className="hover:text-slate-300 transition-colors">
              Main Website
            </Link>
            <Link href="https://varsaka.com/services" className="hover:text-slate-300 transition-colors">
              Services
            </Link>
            <Link href="https://invoice.varsaka.com" className="hover:text-slate-300 transition-colors">
              Invoice Portal
            </Link>
            <Link href="https://loginto.varsaka.com" className="hover:text-slate-300 transition-colors inline-flex items-center space-x-1">
              <span>Admin Portal</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
