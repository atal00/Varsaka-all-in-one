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
      const { data, error } = await supabase.from('blogs').select('*').eq('status', 'published').order('date', { ascending: false });
      let finalBlogs = [...blogPosts];
      if (data) {
        // Map database fields to the frontend structure
        const mappedBlogs = data.map(b => ({
          id: b.id,
          title: b.title,
          date: b.date,
          tag: b.tag || 'Technology',
          summary: b.summary || 'Read our latest insights and updates on this topic.',
          image: b.image || defaultBlogImg, // Fallback image since DB doesn't have images yet
          views: b.views
        }));
        
        // Merge with local blogs
        const dbIds = mappedBlogs.map(b => b.id);
        const uniqueLocal = blogPosts.filter(b => !dbIds.includes(b.id));
        finalBlogs = [...mappedBlogs, ...uniqueLocal];
      }
      setBlogs(finalBlogs);
      setLoading(false);
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
          <div style={{textAlign: 'center', padding: '4rem'}}>Loading blogs...</div>
        ) : featured ? (
          <div className="featured-post fade-in">
            <div className="featured-img" style={{ overflow: 'hidden', background: '#e2e8f0' }}>
              <img src={featured.image} alt={featured.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div className="featured-content" style={{ textAlign: 'center', alignItems: 'center' }}>
              <span className="blog-card-tag">{featured.tag}</span>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: '1rem' }}>{featured.title}</h2>
              <div className="blog-card-meta">
                <i className="fa-regular fa-calendar"></i> {featured.date}
              </div>
              <p style={{ fontSize: '1rem', marginBottom: '1.5rem' }}>{featured.summary}</p>
              <Link to={`/blog/${featured.id}`} className="btn-primary" style={{ display: 'inline-block' }}>
                Read Article <i className="fa-solid fa-arrow-right" style={{ marginLeft: '8px' }}></i>
              </Link>
            </div>
          </div>
        ) : (
          <div style={{textAlign: 'center', padding: '4rem'}}>No published blogs found.</div>
        )}

        {/* 📚 Blog Grid */}
        <div className="blog-grid">
          {others.map((p, i) => (
            <div key={i} className="blog-card fade-in">
              <div className="blog-card-img" style={{ height: '200px', marginBottom: '1.5rem', borderRadius: '16px', overflow: 'hidden', background: '#e2e8f0' }}>
                <img src={p.image} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <span className="blog-card-tag">{p.tag}</span>
              <h3>{p.title}</h3>
              <div className="blog-card-meta">
                <i className="fa-regular fa-calendar"></i> {p.date}
              </div>
              <p>{p.summary}</p>
              <Link to={`/blog/${p.id}`} className="read-more">
                Read More <i className="fa-solid fa-arrow-right"></i>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

