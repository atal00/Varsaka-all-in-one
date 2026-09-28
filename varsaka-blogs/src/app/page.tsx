import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import { Calendar, Clock, ArrowRight, Tag, BookOpen, ExternalLink } from 'lucide-react';

interface Blog {
  id: string;
  slug: string;
  title: string;
  date: string;
  summary: string;
  category?: string;
  tag?: string;
  tags?: string[] | string;
  read_time?: string;
  author?: string;
  author_role?: string;
  image?: string;
  thumbnail?: string;
  status: string;
}

export const revalidate = 60; // Revalidate at most every 60 seconds

export default async function BlogIndexPage() {
  const supabase = await createClient();

  const { data: rawBlogs } = await supabase
    .from('blogs')
    .select('*')
    .eq('status', 'published')
    .order('date', { ascending: false });

  const blogs: Blog[] = (rawBlogs || []).map((b: any) => ({
    id: b.id,
    slug: b.slug || b.id,
    title: b.title || 'Untitled Article',
    date: b.date || b.created_at ? new Date(b.date || b.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent',
    summary: b.summary || b.description || 'Explore our latest insights on software engineering and quality assurance.',
    category: b.category || b.tag || 'Engineering',
    tag: b.tag || 'Technology',
    read_time: b.read_time || '6 min read',
    author: b.author || 'Varsaka Engineering',
    author_role: b.author_role || 'Quality Engineering Practice',
    image: b.image || b.thumbnail || null,
    thumbnail: b.thumbnail || b.image || null,
    status: b.status,
  }));

  const categories = Array.from(new Set(blogs.map(b => b.category || 'Engineering')));

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Navigation Header */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="https://varsaka.com" className="flex items-center space-x-3 group">
            <span className="font-serif text-2xl font-bold tracking-tight text-white group-hover:text-indigo-400 transition-colors">
              VARSAKA
            </span>
            <span className="text-xs font-mono uppercase tracking-widest text-slate-400 px-2 py-0.5 rounded border border-slate-800 bg-slate-900/60">
              Blog
            </span>
          </Link>

          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link href="https://varsaka.com" className="text-slate-400 hover:text-white transition-colors">
              Main Site
            </Link>
            <Link href="https://varsaka.com/services" className="text-slate-400 hover:text-white transition-colors hidden sm:inline-block">
              Services
            </Link>
            <Link href="https://varsaka.com/case-studies" className="text-slate-400 hover:text-white transition-colors hidden sm:inline-block">
              Case Studies
            </Link>
            <Link href="/" className="text-indigo-400 border-b-2 border-indigo-500 pb-1">
              Articles
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

      {/* Hero Section */}
      <section className="relative py-20 px-6 border-b border-slate-800 overflow-hidden bg-gradient-to-b from-slate-900/50 to-transparent">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs font-mono tracking-wide">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Varsaka Technical Journal</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-serif font-normal tracking-tight text-white leading-tight">
            Perspectives on software quality, security & systems.
          </h1>

          <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed font-light">
            In-depth guides, rigorous testing methodologies, and architectural insights written by the practitioners at Varsaka.
          </p>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl mx-auto px-6 py-16 w-full">
        {/* Categories Bar */}
        {categories.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-12 pb-6 border-b border-slate-800/60">
            <span className="text-xs uppercase font-mono tracking-wider text-slate-500 mr-2">Topics:</span>
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-indigo-600 text-white">
              All Articles ({blogs.length})
            </span>
            {categories.map(cat => (
              <span 
                key={cat}
                className="px-3 py-1 rounded-full text-xs font-medium bg-slate-900 text-slate-400 border border-slate-800"
              >
                {cat}
              </span>
            ))}
          </div>
        )}

        {/* Articles Grid */}
        {blogs.length === 0 ? (
          <div className="text-center py-24 border border-dashed border-slate-800 rounded-2xl bg-slate-900/30">
            <BookOpen className="w-12 h-12 mx-auto text-slate-600 mb-4" />
            <h3 className="text-xl font-medium text-slate-300 mb-2">No published articles yet</h3>
            <p className="text-slate-500 text-sm max-w-md mx-auto">
              Our engineering team is preparing new in-depth publications. Check back soon or visit our main site.
            </p>
            <Link
              href="https://varsaka.com"
              className="inline-flex items-center space-x-2 mt-6 text-sm text-indigo-400 hover:text-indigo-300 font-medium"
            >
              <span>Return to Varsaka.com</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogs.map(blog => (
              <article 
                key={blog.id} 
                className="group flex flex-col bg-slate-900/50 border border-slate-800/80 rounded-2xl overflow-hidden hover:border-indigo-500/50 hover:bg-slate-900/80 transition-all duration-300 shadow-sm hover:shadow-indigo-500/5"
              >
                {blog.image && (
                  <div className="aspect-[16/9] w-full overflow-hidden bg-slate-800 relative">
                    <img 
                      src={blog.image} 
                      alt={blog.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                  </div>
                )}

                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                      <span className="text-indigo-400 uppercase tracking-wider font-semibold">
                        {blog.category}
                      </span>
                      <span className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{blog.read_time}</span>
                      </span>
                    </div>

                    <h2 className="text-xl font-serif font-medium text-white group-hover:text-indigo-300 transition-colors leading-snug">
                      <Link href={`/${blog.slug}`} className="hover:underline">
                        {blog.title}
                      </Link>
                    </h2>

                    <p className="text-slate-400 text-sm line-clamp-3 leading-relaxed font-light">
                      {blog.summary}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                    <div>
                      <p className="font-medium text-slate-300">{blog.author}</p>
                      <p className="text-slate-500">{blog.date}</p>
                    </div>

                    <Link 
                      href={`/${blog.slug}`} 
                      className="inline-flex items-center space-x-1 text-indigo-400 group-hover:text-indigo-300 font-semibold"
                    >
                      <span>Read</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
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
