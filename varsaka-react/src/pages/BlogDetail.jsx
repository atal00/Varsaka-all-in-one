import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { blogPosts } from '../data/blogPosts';
import { supabase } from '../supabaseClient';
import DOMPurify from 'dompurify';
import SEO from '../components/SEO';
import defaultBlogImg from '../assets/ai_testing_future.png';
import './Blog.css';

export default function BlogDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { 
    window.scrollTo(0, 0); 
    
    const fetchPost = async () => {
      const localPost = blogPosts.find(p => p.id === id);
      if (localPost) {
        setPost(localPost);
        setLoading(false);
        return;
      }

      // Fallback to Supabase
      try {
        const { data, error } = await supabase.from('blogs').select('*').eq('id', id).single();
        if (data) {
          setPost({
            id: data.id,
            title: data.title,
            date: data.date,
            tag: data.tag || 'Technology',
            summary: data.summary,
            content: data.content || (
              data.title.includes('QA') ? `
              <p>The landscape of software testing is evolving at an unprecedented pace. As organizations push for faster release cycles and higher quality, traditional manual testing simply cannot keep up with the demands of modern continuous delivery pipelines.</p>
              
              <h2>The Rise of Intelligent Automation</h2>
              <p>We are moving past simple record-and-playback scripts. The next generation of QA relies on intelligent automation frameworks that can heal themselves. When a UI element's ID changes or a button shifts slightly, AI-driven tests can dynamically adapt instead of failing outright, drastically reducing maintenance time.</p>
              
              <h2>Predictive Defect Analysis</h2>
              <p>Imagine knowing where a bug is likely to occur before a single test is run. By analyzing historical commit data, past defect rates, and test results, advanced machine learning models can point QA engineers directly to the most risky areas of a codebase. This allows teams to optimize test coverage and focus their energy where it matters most.</p>
              
              <h2>What This Means for QA Teams</h2>
              <p>Quality Assurance is no longer just about finding bugs—it's about preventing them entirely. The engineers of the future will spend less time writing repetitive scripts and more time architecting robust quality strategies, analyzing data trends, and ensuring that the final product delivers an exceptional user experience.</p>
              
              <p>At Varsaka, we are already implementing these forward-thinking strategies to help our clients ship better software, faster, and with complete confidence.</p>
            ` : '<p>Content coming soon.</p>'
            ),
            image: data.image || defaultBlogImg
          });
        } else {
          navigate('/blog');
        }
      } catch (err) {
        navigate('/blog');
      }
      setLoading(false);
    };

    fetchPost();

    const handleScroll = () => {
      const scrollTotal = document.documentElement.scrollHeight - window.innerHeight;
      const scrollProgress = (window.pageYOffset / scrollTotal) * 100;
      const progressBar = document.getElementById('reading-progress');
      if (progressBar) progressBar.style.width = `${scrollProgress}%`;
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [id, navigate]);

  if (loading) {
    return <div style={{textAlign: 'center', padding: '10rem'}}>Loading article...</div>;
  }
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
