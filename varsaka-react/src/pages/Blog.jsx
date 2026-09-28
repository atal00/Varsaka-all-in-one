import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import SEO from '../components/SEO';
import defaultBlogImg from '../assets/ai_testing_future.png';
import { blogPosts } from '../data/blogPosts';
import './Blog.css';

function useFadeIn(deps = []) {
  useEffect(() => {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e, i) => {
        if (e.isIntersecting) {
          setTimeout(() => e.target.classList.add('visible'), i * 80);
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.05 });
    document.querySelectorAll('.fade-in').forEach(el => {
      if (!el.classList.contains('visible')) {
        obs.observe(el);
      }
    });
    return () => obs.disconnect();
  }, deps);
}

export default function Blog() {
  const [blogs, setBlogs] = useState([]);
  useFadeIn([blogs]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { 
    window.scrollTo(0, 0); 
    const fetchBlogs = async () => {
      try {
        const { data, error } = await supabase
          .from('blogs')
          .select('*')
          .eq('status', 'published')
          .order('date', { ascending: false });

        if (error) {
          // DB or network failure -> optional static fallback
          console.warn('DB error fetching blogs, using fallback:', error.message);
          setBlogs(blogPosts.map(b => ({
            ...b,
            slug: b.slug || b.id,
            image: b.image || defaultBlogImg,
            thumbnail: b.thumbnail || b.image || defaultBlogImg,
            read_time: b.read_time || '8 min read',
            author: b.author || 'Varsaka Engineering Team'
          })));
        } else {
          // DB success! Use DB records; if empty, blogs is [] (clean empty state)
          setBlogs((data || []).map(b => ({
            id: b.id,
            slug: b.slug || b.id,
            title: b.title,
            date: b.date,
            category: b.category || b.tag || 'Technology',
            tag: b.tag || 'Technology',
            summary: b.summary || 'Read our latest insights and updates on this topic.',
            image: b.image || defaultBlogImg,
            thumbnail: b.thumbnail || b.image || defaultBlogImg,
            author: b.author || 'Varsaka Engineering Team',
            read_time: b.read_time || '8 min read',
            views: b.views
          })));
        }
      } catch (err) {
        console.warn('Network exception fetching blogs, using fallback:', err);
        setBlogs(blogPosts.map(b => ({
          ...b,
          slug: b.slug || b.id,
          image: b.image || defaultBlogImg,
          thumbnail: b.thumbnail || b.image || defaultBlogImg,
          read_time: b.read_time || '8 min read',
          author: b.author || 'Varsaka Engineering Team'
        })));
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  const featured = blogs.length > 0 ? blogs[0] : null;
  const others = blogs.length > 1 ? blogs.slice(1) : [];

  return (
    <div className="blog-page">
      <SEO 
        title="Quality Assurance Blog | Testing Insights & Trends"
        description="Stay updated with the latest in software testing. Our blog features expert insights on automation, performance, security, and the future of QA engineering."
        keywords="software testing blog, QA trends, automation testing insights, software quality articles, testing best practices"
      />
      {/* 🚀 Hero Section */}
      <section className="blog-hero">
        <div className="blog-container">
          <div className="section-tag fade-in">✍️ Insights & Updates</div>
          <h1 className="blog-title fade-in">Insights from the <br /><span>QA Trenches</span></h1>
          <p className="blog-sub fade-in">
            Tips, trends, and honest takes on software quality - written by engineers, for engineers.
          </p>
        </div>
      </section>

      <div className="blog-container">
        {/* ⭐ Featured Post */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '5rem 1rem' }}>
            <div 
              className="spinner" 
              style={{ 
                margin: '0 auto 1.5rem', 
                width: '40px', 
                height: '40px', 
                border: '3px solid #e2e8f0', 
                borderTopColor: '#2563eb', 
                borderRadius: '50%', 
                animation: 'spin 1s linear infinite' 
              }}
            ></div>
            <p style={{ color: 'var(--text-muted, #64748b)', fontSize: '1rem', fontWeight: 500 }}>
              Loading latest insights & articles...
            </p>
          </div>
        ) : featured ? (
          <div className="featured-post fade-in">
            <div className="featured-img" style={{ overflow: 'hidden', background: '#e2e8f0' }}>
              <img 
                src={featured.thumbnail || featured.image || defaultBlogImg} 
                alt={featured.title} 
                onError={(e) => { e.currentTarget.src = defaultBlogImg; }}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              />
            </div>
            <div className="featured-content" style={{ textAlign: 'center', alignItems: 'center' }}>
              <span className="blog-card-tag">{featured.category || featured.tag}</span>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: '1rem' }}>{featured.title}</h2>
              <div className="blog-card-meta">
                <i className="fa-regular fa-calendar"></i> {featured.date} • {featured.read_time} • By {featured.author}
              </div>
              <p style={{ fontSize: '1rem', marginBottom: '1.5rem' }}>{featured.summary}</p>
              <Link to={`/blog/${featured.slug || featured.id}`} className="btn-primary" style={{ display: 'inline-block' }}>
                Read Article <i className="fa-solid fa-arrow-right" style={{ marginLeft: '8px' }}></i>
              </Link>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '4rem 1rem', color: '#94a3b8', background: 'var(--bg-white, #ffffff)', borderRadius: '16px', border: '1px solid var(--border, #e2e8f0)', maxWidth: '600px', margin: '0 auto' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>✍️</div>
            <p style={{ fontSize: '1.25rem', fontWeight: '600', color: 'var(--text, #1e293b)', marginBottom: '0.5rem' }}>No Published Articles Yet</p>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-muted, #64748b)' }}>Our engineering team is crafting new QA and software testing articles. Please check back soon.</p>
          </div>
        )}

        {/* 📚 Blog Grid */}
        {others.length > 0 && (
          <div className="blog-grid">
            {others.map((p, i) => (
              <div key={p.id || i} className="blog-card fade-in">
                <div className="blog-card-img" style={{ height: '200px', marginBottom: '1.5rem', borderRadius: '16px', overflow: 'hidden', background: '#e2e8f0' }}>
                  <img 
                    src={p.thumbnail || p.image || defaultBlogImg} 
                    alt={p.title} 
                    loading="lazy"
                    onError={(e) => { e.currentTarget.src = defaultBlogImg; }}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  />
                </div>
                <span className="blog-card-tag">{p.category || p.tag}</span>
                <h3>{p.title}</h3>
                <div className="blog-card-meta">
                  <i className="fa-regular fa-calendar"></i> {p.date} • {p.read_time}
                </div>
                <p>{p.summary}</p>
                <Link to={`/blog/${p.slug || p.id}`} className="read-more">
                  Read More <i className="fa-solid fa-arrow-right"></i>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

