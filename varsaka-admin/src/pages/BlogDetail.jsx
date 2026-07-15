import { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { blogPosts } from '../data/blogPosts';
import DOMPurify from 'dompurify';
import SEO from '../components/SEO';
import './Blog.css';

export default function BlogDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const post = blogPosts.find(p => p.id === id);

  useEffect(() => { 
    window.scrollTo(0, 0); 
    if (!post) {
      navigate('/blog');
    }

    const handleScroll = () => {
      const scrollTotal = document.documentElement.scrollHeight - window.innerHeight;
      const scrollProgress = (window.pageYOffset / scrollTotal) * 100;
      const progressBar = document.getElementById('reading-progress');
      if (progressBar) progressBar.style.width = `${scrollProgress}%`;
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [post, navigate]);

  if (!post) return null;

  return (
    <div className="blog-detail-page">
      <SEO 
        title={post.title}
        description={post.summary}
        keywords={`${post.tag}, ${post.title.toLowerCase()}, software testing insights, QA blog`}
        image={post.image}
      />
      <div id="reading-progress" className="reading-progress-bar"></div>
      {/* 🚀 Article Header Image */}
      <div className="blog-detail-header-img" style={{ height: '400px', overflow: 'hidden' }}>
        <img 
          src={post.image} 
          alt={post.title} 
          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
        />
      </div>

      <div className="blog-hero" style={{ paddingBottom: '2rem', paddingTop: '4rem' }}>
        <div className="blog-container" style={{ textAlign: 'center' }}>
          <div className="section-tag">{post.tag}</div>
          <h1 className="blog-title" style={{ fontSize: '3rem', maxWidth: '900px', margin: '0 auto 1.5rem' }}>{post.title}</h1>
          <div className="blog-card-meta" style={{ justifyContent: 'center' }}>
            <i className="fa-regular fa-calendar"></i> {post.date} • 5 min read
          </div>
        </div>
      </div>

      <div className="blog-container">
        <div className="prose-block" style={{ marginTop: 0, boxShadow: 'none', border: 'none', background: 'transparent', padding: '0 5%' }}>
          <div className="blog-full-content" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content) }} />
          
          <div style={{ textAlign: 'center', marginTop: '3rem', marginBottom: '2rem' }}>
            <Link to="/blog" className="read-more" style={{ display: 'inline-flex', fontSize: '1.1rem' }}>
              <i className="fa-solid fa-arrow-left"></i> Back to more blogs
            </Link>
          </div>
          
          </div>
      </div>
    </div>
  );
}
