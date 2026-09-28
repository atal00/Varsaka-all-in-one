import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { blogPosts } from '../data/blogPosts';
import { supabase } from '../supabaseClient';
import DOMPurify from 'dompurify';
import SEO from '../components/SEO';
import defaultBlogImg from '../assets/ai_testing_future.png';
import BlogDetailRenderer from '../components/cms/BlogDetailRenderer';
import './Blog.css';

export default function BlogDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { 
    window.scrollTo(0, 0); 
    
    const fetchPost = async () => {
      try {
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
        let query = supabase.from('blogs').select('*').eq('status', 'published');
        if (isUUID) {
          query = query.eq('id', id);
        } else {
          query = query.eq('slug', id);
        }
        
        const { data, error } = await query.maybeSingle();

        if (error) {
          console.warn('DB error fetching blog post, checking static fallback:', error.message);
          const localPost = blogPosts.find(p => p.id === id || p.slug === id);
          if (localPost) {
            setPost(localPost);
          } else {
            navigate('/blog');
          }
        } else if (data) {
          // Parse sections
          let parsedSections = [];
          if (Array.isArray(data.sections) && data.sections.length > 0) {
            parsedSections = data.sections;
          } else if (typeof data.sections === 'string' && data.sections.trim()) {
            try {
              parsedSections = JSON.parse(data.sections);
            } catch (e) {
              parsedSections = [];
            }
          }

          // Parse tags
          let parsedTags = [];
          if (Array.isArray(data.tags) && data.tags.length > 0) {
            parsedTags = data.tags;
          } else if (data.tag) {
            parsedTags = data.tag.split(',').map(t => t.trim()).filter(Boolean);
          }

          // Normalize post record
          setPost({
            id: data.id,
            slug: data.slug || data.id,
            title: data.title,
            date: data.date,
            updated_at: data.updated_at,
            category: data.category || data.tag || 'Quality Engineering',
            tag: data.tag || 'Technology',
            tags: parsedTags,
            author: data.author || 'Varsaka Engineering Team',
            author_role: data.author_role || 'Quality Engineering & Security Practice',
            read_time: data.read_time || '8 min read',
            summary: data.summary,
            content: data.content || '<p>Content coming soon.</p>',
            image: data.image || defaultBlogImg,
            thumbnail: data.thumbnail || data.image || defaultBlogImg,
            seo_title: data.seo_title || data.title,
            seo_description: data.seo_description || data.summary,
            seo_keywords: data.seo_keywords || 'software testing, quality engineering, QA insights',
            sections: parsedSections
          });
        } else {
          // Check static fallback before navigating away
          const localPost = blogPosts.find(p => p.id === id);
          if (localPost) {
            setPost(localPost);
          } else {
            navigate('/blog');
          }
        }
      } catch (err) {
        console.warn('Exception fetching blog post:', err);
        const localPost = blogPosts.find(p => p.id === id);
        if (localPost) {
          setPost(localPost);
        } else {
          navigate('/blog');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPost();

    const handleScroll = () => {
      const scrollTotal = document.documentElement.scrollHeight - window.innerHeight;
      const scrollProgress = scrollTotal > 0 ? (window.pageYOffset / scrollTotal) * 100 : 0;
      const progressBar = document.getElementById('reading-progress');
      if (progressBar) progressBar.style.width = `${scrollProgress}%`;
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [id, navigate]);

  if (loading) {
    return <div style={{textAlign: 'center', padding: '10rem', color: '#64748b'}}>Loading article...</div>;
  }
  if (!post) return null;

  return (
    <div className="blog-detail-page">
      <SEO 
        title={post.seo_title || post.title}
        description={post.seo_description || post.summary}
        keywords={post.seo_keywords || `${post.category}, ${post.title.toLowerCase()}, software testing insights, QA blog`}
        image={post.image}
        type="article"
        author={post.author}
        publishedTime={post.date}
        modifiedTime={post.updated_at || post.date}
      />
      
      {/* Unified BlogDetailRenderer with sections and rich formatting support */}
      <BlogDetailRenderer post={post} showBackBtn={false} />

      {/* 🔙 Back to All Blogs CTA */}
      <div className="back-btn-container" style={{ textAlign: 'center', marginTop: '3.5rem', marginBottom: '4rem' }}>
        <Link to="/blog" className="back-to-listing-btn" aria-label="Back to All Blogs">
          <i className="fa-solid fa-arrow-left back-arrow-icon" aria-hidden="true"></i>
          <span>Back to All Blogs</span>
        </Link>
      </div>
    </div>
  );
}
